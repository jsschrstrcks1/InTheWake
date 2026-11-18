#!/usr/bin/env node
// @gate name=softening-detector plane=advisory event=manual (not wired into any hook or CI) doc=admin/SOFTENING-DETECTOR.md#codes
// @gate-code softening_found: a changed page shows a pattern from the 2026-05 postmortems (reference repointing, constraint stripping, regex dodging) or a moved block that needs a reader check | remedy: read each finding; fix what the validator pointed at, restore the fact, or log the validator bug in admin/VALIDATOR_REGEX_ISSUES.md. The detector never edits a page
// @gate-code range_unreadable: --range did not resolve to two commits, or git diff failed | remedy: pass --range <a>..<b> with both ends present in this clone (git -C <repo> rev-parse --verify <ref>); deepen a shallow clone if the commit is missing
// @gate-code staged_unreadable: --staged could not run git diff --cached in the repo | remedy: run inside a git checkout, or pass --repo <path> to one
// @gate-code diff_file_unreadable: --diff-file could not be read | remedy: pass a path to a readable unified diff (git show <sha> -- <page> > file)
// @gate-code diff_empty: --diff-file was empty, so nothing could be looked at | remedy: regenerate the diff; an empty capture is never read as clean
// @gate-code diff_unparseable: the input has no unified-diff header, or a page's hunks could not be parsed (combined merge diff, truncated hunk) | remedy: diff two commits with --range a..b instead of a merge's combined diff, or regenerate the file
// @gate-code usage: no input mode, or an unknown flag | remedy: pass exactly one of --range <a>..<b>, --staged, --diff-file <path>
// @gate-exit 0: CLEAN. The diff was read and no changed HTML page showed any pattern (zero changed pages is also CLEAN, and the output says how many pages were scanned).
// @gate-exit 2: UNAVAILABLE. The input could not be read (codes range_unreadable, staged_unreadable, diff_file_unreadable, diff_empty, diff_unparseable, usage). Never reported as CLEAN.
// @gate-exit 3: FINDINGS. At least one finding (code softening_found). Advisory: the detector blocks nothing and is wired into nothing.
//
// softening-detector.mjs — flags a change that turned a page's validator result green by
// SOFTENING ITS CONTENT instead of fixing what the check pointed at.
//
// WHAT IT DETECTS, in changed HTML pages of a diff:
//   reference-repointing  An <img src>/<a href>/srcset changed to a different file while the alt,
//                         title, caption or link text on the same element stayed word for word:
//                         the claim did not change but its referent did. Strongest when a
//                         descriptive name became a generic or numbered one (sydney-opera-house.webp
//                         -> sydney-2.webp). Query strings, extensions and directory moves of the
//                         same file stem are ignored.
//   constraint-stripping  A removed field's factual qualifier (a parenthetical, a weekday, an
//                         ordinal weekday, only/except/closed/seasonal/best/peak/until, months,
//                         times, numbers) is missing from its replacement in the same field: the
//                         same activity row, the same FAQ question, the same table row, or the
//                         line that replaced it one-for-one. "Year-round" and a full twelve-month
//                         list are treated as the same fact, in both directions.
//   regex-dodging         An FAQ question or heading lost the page's own place name while its answer
//                         stayed the same; a question dropped a token VALIDATOR_REGEX_ISSUES.md names
//                         as a collision (bring, go) with its answer unchanged; or a new question on
//                         a modified page says "here" where its own answer names the place.
//   section-reshuffle     A block of N+ lines (default 8) deleted at one position and re-added at
//                         another inside one page. Reported as NEEDS A READER CHECK, not as a
//                         defect: a move can be right, but a validator-driven move must be read.
//
// WHY: admin/CAREFUL_NOT_CLEVER_FAILURE_2026_05_21.md patterns 1-4 (Sydney image remap, Hobart and
// Lerwick qualifier stripping, Glasgow and Mauritius rewords, Vigo reorder), which follow the
// "scanner dodging" and "validator capitulation" of CAREFUL_NOT_CLEVER_FAILURE_2026_05_18.md and the
// bulk-pass failure of CAREFUL_NOT_CLEVER_FAILURE_2026_05.md. In every case a validator went green
// and a reader lost something. The validator could not see it, by construction; this looks at the
// diff instead of the page.
//
// THREE STATES, never two: FINDINGS (exit 3) . CLEAN (exit 0, looked and found none) .
// UNAVAILABLE (exit 2, could not read the range or diff). A check that could not look is never
// reported as CLEAN.
//
// IT NEVER EDITS A PAGE. It reads a diff and reports. Content repair stays with a person
// ("keep_human on content, automation only on detection").
//
// Usage:
//   node admin/softening-detector.mjs --range <a>..<b> [--repo <path>] [--json] [--min-block N]
//   node admin/softening-detector.mjs --staged [--repo <path>] [--json]
//   node admin/softening-detector.mjs --diff-file <path> [--json]
//
// Honest limits are listed in admin/SOFTENING-DETECTOR.md. No dependencies, no eval.
//
// Soli Deo Gloria.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const DOC = 'admin/SOFTENING-DETECTOR.md';
export const EXIT = { CLEAN: 0, UNAVAILABLE: 2, FINDINGS: 3 };

// ---------------------------------------------------------------------------
// Unified diff parsing
// ---------------------------------------------------------------------------

export function parseUnifiedDiff(text) {
  const lines = String(text).split('\n');
  const files = [];
  let cur = null;
  let sawHeader = false;
  let i = 0;
  const startFile = () => {
    cur = { path: null, oldPath: null, isNew: false, isDeleted: false, binary: false, unparsed: null, hunks: [] };
    files.push(cur);
  };
  while (i < lines.length) {
    let line = lines[i];
    if (line.endsWith('\r')) line = line.slice(0, -1);
    if (line.startsWith('diff --git ') || line.startsWith('diff --cc ') || line.startsWith('diff --combined ')) {
      sawHeader = true;
      startFile();
      if (!line.startsWith('diff --git ')) cur.unparsed = 'combined (merge) diff';
      const m = /^diff --git a\/(.*) b\/(.*)$/.exec(line);
      if (m) { cur.oldPath = m[1]; cur.path = m[2]; }
      else { const m2 = /^diff --(?:cc|combined) (.*)$/.exec(line); if (m2) cur.path = m2[1]; }
      i++; continue;
    }
    if (line.startsWith('--- ') && lines[i + 1] !== undefined && lines[i + 1].replace(/\r$/, '').startsWith('+++ ')) {
      sawHeader = true;
      if (!cur || cur.hunks.length) startFile();
      const a = line.slice(4).replace(/\t.*$/, '');
      const b = lines[i + 1].replace(/\r$/, '').slice(4).replace(/\t.*$/, '');
      if (a === '/dev/null') cur.isNew = true; else cur.oldPath = a.replace(/^a\//, '');
      if (b === '/dev/null') { cur.isDeleted = true; cur.path = cur.path || cur.oldPath; } else cur.path = b.replace(/^b\//, '');
      i += 2; continue;
    }
    if (cur && /^new file mode/.test(line)) { cur.isNew = true; i++; continue; }
    if (cur && /^deleted file mode/.test(line)) { cur.isDeleted = true; i++; continue; }
    if (cur && /^Binary files /.test(line)) { cur.binary = true; i++; continue; }
    if (cur && line.startsWith('@@@')) { cur.unparsed = 'combined (merge) diff'; i++; continue; }
    const h = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(line);
    if (h && cur) {
      const hunk = { oldStart: +h[1], oldCount: h[2] === undefined ? 1 : +h[2], newStart: +h[3], newCount: h[4] === undefined ? 1 : +h[4], lines: [] };
      cur.hunks.push(hunk);
      let oldNo = hunk.oldStart, newNo = hunk.newStart;
      let oldLeft = hunk.oldCount, newLeft = hunk.newCount;
      i++;
      while (i < lines.length && (oldLeft > 0 || newLeft > 0)) {
        let l = lines[i];
        if (l.endsWith('\r')) l = l.slice(0, -1);
        const t = l[0];
        if (t === '\\') { i++; continue; }
        if (t === ' ' || (l === '' && oldLeft > 0 && newLeft > 0)) {
          hunk.lines.push({ t: ' ', text: l.slice(1), oldNo, newNo }); oldNo++; newNo++; oldLeft--; newLeft--;
        } else if (t === '-') {
          hunk.lines.push({ t: '-', text: l.slice(1), oldNo, newNo: null }); oldNo++; oldLeft--;
        } else if (t === '+') {
          hunk.lines.push({ t: '+', text: l.slice(1), oldNo: null, newNo }); newNo++; newLeft--;
        } else {
          cur.unparsed = `hunk at -${hunk.oldStart} ended early (truncated diff)`;
          break;
        }
        i++;
      }
      if (oldLeft < 0 || newLeft < 0) cur.unparsed = 'hunk line counts overflow';
      else if ((oldLeft > 0 || newLeft > 0) && !cur.unparsed) cur.unparsed = `hunk at -${hunk.oldStart} is missing ${oldLeft} old / ${newLeft} new line(s) (truncated diff)`;
      continue;
    }
    i++;
  }
  return { files, sawHeader };
}

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '-', mdash: '-', minus: '-',
  rsquo: "'", lsquo: "'", ldquo: '"', rdquo: '"', hellip: '...', deg: '°', middot: '·', times: 'x', frac12: '1/2' };

export function decodeEntities(s) {
  return String(s)
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => safeCp(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => safeCp(parseInt(d, 10)))
    .replace(/&([a-z0-9]+);/gi, (m, n) => (ENT[n.toLowerCase()] !== undefined ? ENT[n.toLowerCase()] : m));
}
function safeCp(n) { try { return String.fromCodePoint(n); } catch { return ''; } }

// Visible text of an HTML/JSON fragment: tags stripped, entities and JSON escapes decoded,
// dashes unified, whitespace collapsed. Case kept (month detection needs it).
export function plain(s) {
  return decodeEntities(String(s)
    .replace(/\\u([0-9a-f]{4})/gi, (_, h) => safeCp(parseInt(h, 16)))
    .replace(/\\(["\\/])/g, '$1')
    .replace(/<[^>]*>/g, ' '))
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

export function fold(s) {
  return plain(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

const STOP = new Set('a an the and or of to in on at for is are was be by with from as it its this that i my you your we our do does can will what when where how why which who there here not no'.split(' '));
function words(s) { return fold(s).replace(/[^a-z0-9' ]+/g, ' ').split(' ').filter(Boolean); }
function sigWords(s) { return words(s).filter((w) => w.length > 2 && !STOP.has(w)); }
function jaccard(a, b) {
  const A = new Set(sigWords(a)), B = new Set(sigWords(b));
  if (!A.size && !B.size) return 1;
  let n = 0; for (const x of A) if (B.has(x)) n++;
  return n / (A.size + B.size - n);
}
function clip(s, n = 220) { s = String(s).replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; }

// ---------------------------------------------------------------------------
// Qualifier extraction (constraint stripping)
// ---------------------------------------------------------------------------

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MONTH_RE = /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sept?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\b\.?/g;
const MONTH_RANGE_RE = /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sept?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s*(?:-|to|through|thru)\s*(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sept?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\b/g;
const YEAR_ROUND_RE = /\b(year[- ]round|all[- ]year(?:[- ]round)?|every month|12 months|twelve months)\b/i;
const WEEKDAY_RE = /\b(mon|tues|wednes|thurs|fri|satur|sun)days?\b|\b(weekends?|weekdays?)\b/gi;
const ORD_WEEKDAY_RE = /\b(first|second|third|fourth|fifth|last|final)\s+(mon|tues|wednes|thurs|fri|satur|sun)day\b/gi;
const KEYWORDS = ['only', 'except', 'excluding', 'closed', 'seasonal', 'seasonally', 'best', 'peak', 'until', 'permitting', 'appointment', 'reservation', 'reservations', 'required', 'advance'];
const TIME_RE = /\b(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)(?![a-z])|\b(\d{1,2}):(\d{2})\b/gi;
const NUM_WORDS = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11,
  twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100 };

function monthIdx(tok) { return MONTHS.indexOf(tok.slice(0, 3).toLowerCase()); }

export function monthSet(text) {
  const p = plain(text);
  const set = new Set();
  if (YEAR_ROUND_RE.test(p)) for (let k = 0; k < 12; k++) set.add(k);
  let m;
  MONTH_RANGE_RE.lastIndex = 0;
  while ((m = MONTH_RANGE_RE.exec(p))) {
    let a = monthIdx(m[1]); const b = monthIdx(m[2]);
    for (let guard = 0; guard < 12; guard++) { set.add(a); if (a === b) break; a = (a + 1) % 12; }
  }
  MONTH_RE.lastIndex = 0;
  while ((m = MONTH_RE.exec(p))) set.add(monthIdx(m[1]));
  return set;
}

function timesOf(text) {
  const out = new Set(); let m;
  const p = plain(text);
  TIME_RE.lastIndex = 0;
  while ((m = TIME_RE.exec(p))) {
    if (m[1] !== undefined) out.add(`${+m[1]}:${m[2] || '00'}${m[3].toLowerCase().startsWith('a') ? 'am' : 'pm'}`);
    else out.add(`${+m[4]}:${m[5]}`);
  }
  return out;
}
function stripTimes(p) { return p.replace(TIME_RE, ' '); }

function numbersOf(text, { words: withWords = false } = {}) {
  const p = stripTimes(plain(text)).replace(/(\d),(\d{3})/g, '$1$2');
  const out = new Set(); let m;
  const re = /\d+(?:\.\d+)?/g;
  while ((m = re.exec(p))) out.add(String(+m[0]));
  if (withWords) {
    const wre = /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)(?:[- ](one|two|three|four|five|six|seven|eight|nine))?\b/gi;
    while ((m = wre.exec(p))) out.add(String(NUM_WORDS[m[1].toLowerCase()] + (m[2] ? NUM_WORDS[m[2].toLowerCase()] : 0)));
  }
  return out;
}

// Returns the qualifiers present in `removed` that are missing from `added`.
//   strength 'full'       every kind: the fields validators target (activity rows, FAQ answers)
//   strength 'constraint' planning constraints only (weekday, ordinal weekday, only/except/closed/
//                         seasonal, and parentheticals carrying one of those): table rows, list
//                         items and prose lines replaced one-for-one, where a changed figure is far
//                         more often a data correction than a strip.
const CONSTRAINT_KEYWORDS = new Set(['only', 'except', 'excluding', 'closed', 'seasonal', 'seasonally']);
function carriesConstraint(text) {
  const f = fold(text);
  WEEKDAY_RE.lastIndex = 0; ORD_WEEKDAY_RE.lastIndex = 0;
  const hit = WEEKDAY_RE.test(f) || ORD_WEEKDAY_RE.test(f) || [...CONSTRAINT_KEYWORDS].some((k) => new RegExp(`\\b${k}\\b`).test(f));
  WEEKDAY_RE.lastIndex = 0; ORD_WEEKDAY_RE.lastIndex = 0;
  return hit;
}
export function lostQualifiers(removed, added, { strength = 'full' } = {}) {
  const full = strength === 'full';
  const lost = [];
  const rp = plain(removed), ap = plain(added);
  const rf = fold(removed), af = fold(added);
  const afFlat = af.replace(/[^a-z0-9]+/g, ' ');
  // parentheticals
  let m; const pre = /\(([^()]{1,80})\)/g;
  while ((m = pre.exec(rp))) {
    const inner = m[1];
    if (!full && !carriesConstraint(inner)) continue;
    const sw = sigWords(inner).filter((w) => !/^\d+$/.test(w));
    if (!sw.length && !/\d/.test(inner)) continue;
    const innerFlat = fold(inner).replace(/[^a-z0-9]+/g, ' ').trim();
    if (innerFlat && afFlat.includes(innerFlat)) continue;
    const nums = [...numbersOf(inner)];
    const missingWords = sw.filter((w) => !afFlat.includes(w.replace(/[^a-z0-9]+/g, ' ').trim()));
    const addedNums = numbersOf(added, { words: true });
    const missingNums = nums.filter((n) => !addedNums.has(n));
    // a different figure in its place ("($10-20/day)" -> "(roughly $20-35/day)") is a correction
    const newFigure = [...numbersOf(added)].some((n) => !numbersOf(removed).has(n));
    if (missingWords.length || (missingNums.length && !newFigure)) lost.push({ kind: 'parenthetical', token: `(${inner})` });
  }
  // ordinal weekdays
  ORD_WEEKDAY_RE.lastIndex = 0;
  while ((m = ORD_WEEKDAY_RE.exec(rf))) if (!af.includes(m[0])) lost.push({ kind: 'ordinal-weekday', token: m[0] });
  // weekdays
  WEEKDAY_RE.lastIndex = 0;
  const seenWd = new Set();
  const lostWd = [];
  while ((m = WEEKDAY_RE.exec(rf))) {
    const stem = (m[1] || m[2]).toLowerCase().replace(/s$/, '');
    if (seenWd.has(stem)) continue; seenWd.add(stem);
    if (!new RegExp(`\\b${stem}`).test(af)) lostWd.push({ kind: 'weekday', token: m[0] });
  }
  // a different weekday in its place is a correction, not a strip
  WEEKDAY_RE.lastIndex = 0;
  if (!WEEKDAY_RE.test(af)) lost.push(...lostWd);
  WEEKDAY_RE.lastIndex = 0;
  // keywords
  for (const k of KEYWORDS) if ((full || CONSTRAINT_KEYWORDS.has(k)) && new RegExp(`\\b${k}\\b`).test(rf) && !new RegExp(`\\b${k}\\b`).test(af)) lost.push({ kind: 'keyword', token: k });
  // months, times, numbers: lost only when the replacement puts nothing of the same kind in its
  // place. A different month, time or figure is a fact edit or a correction; the same fact with
  // nothing in its place is the strip (Hobart's "(Saturdays)", Lerwick's "(last Tuesday)").
  if (!full) return lost;
  const rm = monthSet(removed), am = monthSet(added);
  const lostM = [...rm].filter((x) => !am.has(x));
  const explicitNone = /^\s*(n\/a|none|closed|not available|not applicable|-)\s*$/i.test(ap);
  if (lostM.length && !am.size && !explicitNone) lost.push({ kind: 'months', token: lostM.sort((a, b) => a - b).map((x) => MONTHS[x]).join(',') });
  const rt = timesOf(removed), at = timesOf(added);
  const atLoose = new Set([...at].map((t) => t.replace(/(am|pm)$/, '')));
  const rtLoose = new Set([...rt].map((t) => t.replace(/(am|pm)$/, '')));
  const newTimes = [...atLoose].filter((t) => !rtLoose.has(t));
  const rn = numbersOf(removed), an = numbersOf(added, { words: true });
  const anDigits = numbersOf(added);
  const newNums = [...anDigits].filter((n) => !rn.has(n));
  if (!newTimes.length && !newNums.length) {
    for (const t of rt) if (!at.has(t) && !atLoose.has(t.replace(/(am|pm)$/, ''))) lost.push({ kind: 'time', token: t });
    const lostN = [...rn].filter((n) => !an.has(n));
    if (lostN.length) lost.push({ kind: 'number', token: lostN.join(',') });
  }
  return lost;
}

// ---------------------------------------------------------------------------
// Per-file views
// ---------------------------------------------------------------------------

function fileView(file) {
  const removed = [], added = [];
  for (const h of file.hunks) for (const l of h.lines) {
    if (l.t === '-') removed.push(l); else if (l.t === '+') added.push(l);
  }
  return { removed, added };
}

// Change blocks: a run of '-' lines followed by a run of '+' lines inside one hunk.
function changeBlocks(file) {
  const blocks = [];
  for (const h of file.hunks) {
    let cur = null;
    for (const l of h.lines) {
      if (l.t === ' ') { if (cur) { blocks.push(cur); cur = null; } continue; }
      if (!cur) cur = { rem: [], add: [] };
      if (l.t === '-' && cur.add.length) { blocks.push(cur); cur = { rem: [], add: [] }; }
      (l.t === '-' ? cur.rem : cur.add).push(l);
    }
    if (cur) blocks.push(cur);
  }
  return blocks;
}

// Joined text of a set of lines with an offset -> line-number map.
function joined(lines, which) {
  let text = ''; const starts = [];
  for (const l of lines) { starts.push([text.length, which === 'old' ? l.oldNo : l.newNo]); text += l.text + '\n'; }
  const lineAt = (off) => { let lo = 0, hi = starts.length - 1, ans = starts.length ? starts[0][1] : null; while (lo <= hi) { const mid = (lo + hi) >> 1; if (starts[mid][0] <= off) { ans = starts[mid][1]; lo = mid + 1; } else hi = mid - 1; } return ans; };
  return { text, lineAt };
}

export function extractFaqs(lines, which) {
  const { text, lineAt } = joined(lines, which);
  const out = [];
  let m;
  const json = /"name"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"acceptedAnswer"\s*:\s*\{\s*"@type"\s*:\s*"Answer"\s*,\s*"text"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  while ((m = json.exec(text))) out.push({ src: 'json-ld', q: plain(m[1]), a: plain(m[2]), line: lineAt(m.index) });
  const strongQ = /<strong>\s*Q:\s*([\s\S]*?)<\/strong>(?:\s*<br\s*\/?>)?\s*A:\s*([\s\S]*?)(?:<\/p>|\n)/g;
  while ((m = strongQ.exec(text))) out.push({ src: 'html', q: plain(m[1]), a: plain(m[2]), line: lineAt(m.index) });
  const det = /<summary[^>]*>([\s\S]*?)<\/summary>\s*<p[^>]*>([\s\S]*?)<\/p>/g;
  while ((m = det.exec(text))) {
    const q = plain(m[1]);
    if (!/\?\s*$/.test(q)) continue; // section summaries are not questions
    out.push({ src: 'html', q, a: plain(m[2]), line: lineAt(m.index) });
  }
  return out;
}

function extractActivityRows(lines, which) {
  const { text, lineAt } = joined(lines, which);
  const out = []; let m;
  const re = /class="activity-label"[^>]*>([\s\S]*?)<\/span>\s*<span[^>]*class="activity-months"[^>]*>([\s\S]*?)<\/span>/g;
  while ((m = re.exec(text))) out.push({ key: fold(m[1]), label: plain(m[1]), value: plain(m[2]), raw: m[0], line: lineAt(m.index) });
  return out;
}

function extractKeyedRows(lines, which) {
  // <tr><td>Label</td><td>Value</td> and <li><strong>Label:</strong> value</li>, one per line.
  const out = [];
  for (const l of lines) {
    let m = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>\s*<td[^>]*>([\s\S]*?)<\/td>/.exec(l.text);
    if (m) { out.push({ key: 'row:' + fold(m[1]), label: plain(m[1]), value: plain(l.text.slice(m.index + m[1].length)), line: which === 'old' ? l.oldNo : l.newNo }); continue; }
    m = /<li[^>]*>\s*<(?:strong|b)>([^<]{1,60}?):?\s*<\/(?:strong|b)>:?([\s\S]*?)<\/li>/.exec(l.text);
    if (m) out.push({ key: 'li:' + fold(m[1]), label: plain(m[1]), value: plain(m[2]), line: which === 'old' ? l.oldNo : l.newNo });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Pattern: reference repointing
// ---------------------------------------------------------------------------

const REF_ATTR_RE = /\b(src|href|srcset|data-src|poster)\s*=\s*("([^"]*)"|'([^']*)')/gi;
const CLAIM_RE = /\b(alt|title|aria-label|data-caption)\s*=\s*("[^"]*\S[^"]*"|'[^']*\S[^']*')/i;

function refsOf(line) {
  const refs = []; let m;
  REF_ATTR_RE.lastIndex = 0;
  while ((m = REF_ATTR_RE.exec(line))) refs.push({ attr: m[1].toLowerCase(), value: m[3] !== undefined ? m[3] : m[4] });
  return refs;
}
function skeleton(line) { return line.replace(REF_ATTR_RE, '$1=§REF§').replace(/\s+/g, ' ').trim(); }

function claimOf(line) {
  const c = CLAIM_RE.exec(line);
  if (c) return `${c[1]}=${c[2]}`;
  const a = /<a\b[^>]*>([\s\S]*?)<\/a>/i.exec(line);
  if (a && plain(a[1])) return `link text "${plain(a[1])}"`;
  const fc = /<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i.exec(line);
  if (fc && plain(fc[1])) return `caption "${plain(fc[1])}"`;
  return null;
}

export function refStem(value) {
  let v = String(value).split(/[?#]/)[0].trim().toLowerCase();
  v = v.replace(/^[a-z]+:\/\/[^/]+/, '');
  v = v.replace(/\/index\.html?$/, '/').replace(/\/+$/, '');
  const b = basename(v || '/');
  return b.replace(/\.[a-z0-9]{1,5}$/, '');
}
const GENERIC_STEM_RE = /^(?:img|image|photo|picture|pic|placeholder|default|generic|stock|untitled|file|dsc|dscn|img_|p)[-_]?\d*$/;
export function isGenericStem(stem, oldStem) {
  if (GENERIC_STEM_RE.test(stem)) return true;
  if (/^\d+$/.test(stem)) return true;
  const m = /^(.*?)[-_]?(\d+)$/.exec(stem);
  if (m && m[1] && oldStem && !/\d$/.test(oldStem)) {
    // "sydney-2" from "sydney-opera-house": same prefix, the descriptive words replaced by a number
    const prefix = m[1].replace(/[-_]+$/, '');
    if (oldStem.startsWith(prefix) && oldStem.length > prefix.length + 1) return true;
    if (!oldStem.startsWith(prefix) && sigWords(oldStem.replace(/[-_]/g, ' ')).length >= sigWords(prefix.replace(/[-_]/g, ' ')).length + 1) return true;
  }
  return false;
}

function detectRepointing(file, findings) {
  for (const b of changeBlocks(file)) {
    const used = new Set();
    for (const r of b.rem) {
      const rRefs = refsOf(r.text);
      if (!rRefs.length) continue;
      const claim = claimOf(r.text);
      if (!claim) continue;
      const sk = skeleton(r.text);
      const aIdx = b.add.findIndex((a, k) => !used.has(k) && skeleton(a.text) === sk);
      if (aIdx < 0) continue;
      used.add(aIdx);
      const a = b.add[aIdx];
      const aRefs = refsOf(a.text);
      for (let k = 0; k < Math.min(rRefs.length, aRefs.length); k++) {
        const ov = rRefs[k].value, nv = aRefs[k].value;
        if (ov === nv) continue;
        const os = refStem(ov), ns = refStem(nv);
        if (os === ns) continue; // same file stem: query string, extension, directory or slash change
        const generic = isGenericStem(ns, os);
        // An image's alt/caption is a claim about what the file shows; a link's text names a page
        // and is far more often a repaired link. Images are softening; links need a reader check
        // unless a descriptive target became a generic one.
        const isImage = rRefs[k].attr !== 'href' || /<img\b/i.test(r.text);
        findings.push({
          pattern: 'reference-repointing', verdict: isImage || generic ? 'softening' : 'needs-reader-check', kind: generic ? 'descriptive-to-generic' : 'different-file',
          page: file.path, line: a.newNo, removed: clip(r.text.trim()), added: clip(a.text.trim()),
          why: `${rRefs[k].attr} changed from "${ov}" to "${nv}" while ${clip(claim, 120)} stayed the same: the claim did not change but its referent did.` +
            (generic ? ' A descriptive name became a generic/numbered one.' : '') +
            ' Verify the new file actually shows what the text claims, or remove the element with its text (CAREFUL_NOT_CLEVER_FAILURE_2026_05_21.md §1, Sydney).',
        });
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Pattern: constraint stripping
// ---------------------------------------------------------------------------

function fmtLost(lost) { return lost.map((x) => `${x.kind} "${x.token}"`).join('; '); }

function detectStripping(file, findings) {
  const { removed, added } = fileView(file);
  const coveredOld = new Set();
  const coveredNew = new Set();
  const push = (field, label, rVal, aVal, rLine, aLine, strength = 'full') => {
    const lost = lostQualifiers(rVal, aVal, { strength });
    if (rLine) coveredOld.add(rLine); if (aLine) coveredNew.add(aLine);
    if (!lost.length) return;
    findings.push({
      pattern: 'constraint-stripping', verdict: 'softening', kind: field,
      page: file.path, line: aLine, removed: clip(rVal), added: clip(aVal),
      why: `${field} "${clip(label, 80)}": ${fmtLost(lost)} present in the removed text is missing from its replacement. ` +
        'If a format check rejected the qualifier, keep it in a field the check accepts or log the check in admin/VALIDATOR_REGEX_ISSUES.md; stripping it is data loss (CAREFUL_NOT_CLEVER_FAILURE_2026_05_21.md §2, Hobart and Lerwick).',
    });
  };
  // activity rows, keyed by label
  const ra = extractActivityRows(removed, 'old'), aa = extractActivityRows(added, 'new');
  const usedA = new Set();
  for (const r of ra) {
    const k = aa.findIndex((a, idx) => !usedA.has(idx) && a.key === r.key);
    if (k < 0) continue; usedA.add(k);
    if (fold(r.value) === fold(aa[k].value)) { coveredOld.add(r.line); coveredNew.add(aa[k].line); continue; }
    push('activity row', r.label, r.value, aa[k].value, r.line, aa[k].line);
  }
  // FAQ answers, keyed by question
  const rf = extractFaqs(removed, 'old'), af = extractFaqs(added, 'new');
  const usedF = new Set();
  for (const r of rf) {
    const key = fold(r.q).replace(/[^a-z0-9]+/g, ' ').trim();
    const k = af.findIndex((a, idx) => !usedF.has(idx) && a.src === r.src && fold(a.q).replace(/[^a-z0-9]+/g, ' ').trim() === key);
    if (k < 0) continue; usedF.add(k);
    coveredOld.add(r.line); coveredNew.add(af[k].line);
    if (fold(r.a) === fold(af[k].a)) continue;
    push(`FAQ answer (${r.src})`, r.q, r.a, af[k].a, r.line, af[k].line);
  }
  // keyed table rows / list items
  const rk = extractKeyedRows(removed, 'old'), ak = extractKeyedRows(added, 'new');
  const usedK = new Set();
  for (const r of rk) {
    const k = ak.findIndex((a, idx) => !usedK.has(idx) && a.key === r.key);
    if (k < 0) continue; usedK.add(k);
    if (fold(r.value) === fold(ak[k].value)) { coveredOld.add(r.line); coveredNew.add(ak[k].line); continue; }
    push(r.key.startsWith('row:') ? 'table row' : 'list item', r.label, r.value, ak[k].value, r.line, ak[k].line, 'constraint');
  }
  // one-for-one replaced lines (same position in a change block), prose only
  for (const b of changeBlocks(file)) {
    const used = new Set();
    for (const r of b.rem) {
      if (coveredOld.has(r.oldNo)) continue;
      const rp = plain(r.text);
      if (rp.length < 12 || /^\s*(?:\[\s*\{|\{\s*["'A-Za-z_$]|")/.test(r.text)) continue; // skip JSON and JS-object data lines (even ones carrying HTML)
      if (/=>|===|!==|\bfunction\s*\(|[{};]\s*$|^\s*[.#]?[a-z-]+\s*\{/i.test(r.text)) continue; // skip script/CSS lines
      let best = -1, bestSim = 0.6;
      b.add.forEach((a, k) => {
        if (used.has(k) || coveredNew.has(a.newNo)) return;
        const s = jaccard(r.text, a.text);
        if (s >= bestSim) { best = k; bestSim = s; }
      });
      if (best < 0) continue;
      used.add(best);
      const a = b.add[best];
      if (fold(r.text) === fold(a.text)) continue;
      const lost = lostQualifiers(r.text, a.text, { strength: 'constraint' });
      if (!lost.length) continue;
      findings.push({
        pattern: 'constraint-stripping', verdict: 'softening', kind: 'replaced line',
        page: file.path, line: a.newNo, removed: clip(rp), added: clip(plain(a.text)),
        why: `the line replaced one-for-one lost ${fmtLost(lost)}. If a format check rejected the qualifier, keep it where the check accepts it or log the check; stripping it is data loss (CAREFUL_NOT_CLEVER_FAILURE_2026_05_21.md §2).`,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Pattern: regex dodging
// ---------------------------------------------------------------------------

// Tokens admin/VALIDATOR_REGEX_ISSUES.md names as collision culprits in FAQ questions.
export const COLLISION_TOKENS = [
  { token: 'bring', ref: 'REGEX-02 (packing regex matched "bring" in non-packing questions)' },
  { token: 'go', ref: 'REGEX-01 (best-time regex matched "go", including inside place names)' },
];
const GENERIC_PLACE_WORDS = new Set('port ports city island islands beach bay cay harbour harbor cruise club royal saint san santa sant the and del de la le el los las north south east west new old great little upper lower river sound fjord fjords strait canal point'.split(' '));

export function placeOf(path) {
  const slug = basename(String(path)).replace(/\.html?$/i, '').toLowerCase();
  const phrase = slug.replace(/[-_]+/g, ' ').trim();
  const keyWords = phrase.split(' ').filter((w) => w.length >= 4 && !GENERIC_PLACE_WORDS.has(w));
  return { slug, phrase, keyWords };
}
export function namesPlace(text, place) {
  const t = ' ' + fold(text).replace(/[^a-z0-9]+/g, ' ') + ' ';
  if (place.phrase && t.includes(' ' + place.phrase + ' ')) return true;
  if (place.phrase && t.includes(' ' + place.phrase.replace(/ /g, '') + ' ')) return true;
  return place.keyWords.some((w) => new RegExp(`\\b${w}`).test(t));
}
// "there" is left out on purpose: in a question it usually points at a thing ("are the flamingos
// really there?"), not at the port.
const INVISIBLE_RE = /[\u00ad\u200b-\u200f\u2060-\u2064\ufeff]/;
const DEICTIC_RE = /\b(here|this (?:port|city|town|island|destination|stop|harbou?r))\b/i;

// Place-name checks run only on port pages (ports/<slug>.html), where the file slug IS the place.
// Elsewhere a slug ("escape-thanksgiving-guide") is not a place name.
export function isPortPage(path) { return /(^|\/)ports\/[^/]+\.html?$/i.test(String(path)); }

function detectDodging(file, findings) {
  const place = placeOf(file.path);
  const portPage = isPortPage(file.path);
  const { removed, added } = fileView(file);
  const rf = extractFaqs(removed, 'old'), af = extractFaqs(added, 'new');
  const usedA = new Set();
  const pairedNew = new Set();
  for (const r of rf) {
    let best = -1, bestSim = 0.6;
    af.forEach((a, k) => {
      if (usedA.has(k) || a.src !== r.src) return;
      if (fold(a.q) === fold(r.q)) return;
      const s = jaccard(r.a, a.a);
      if (s >= bestSim) { best = k; bestSim = s; }
    });
    if (best < 0) continue;
    usedA.add(best);
    const a = af[best];
    pairedNew.add(a.line + '|' + a.q);
    const reasons = [];
    if (INVISIBLE_RE.test(a.q) && !INVISIBLE_RE.test(r.q)) reasons.push('the question gained an invisible character (zero-width or format control), which breaks a token for a regex without changing what a reader sees');
    if (portPage && namesPlace(r.q, place) && !namesPlace(a.q, place)) reasons.push(`the question lost the page's own place name ("${place.phrase}")`);
    for (const c of COLLISION_TOKENS) {
      const re = new RegExp(`\\b${c.token}\\b`, 'i');
      if (re.test(fold(r.q)) && !re.test(fold(a.q))) reasons.push(`the question dropped "${c.token}", a token VALIDATOR_REGEX_ISSUES.md names in ${c.ref}`);
    }
    if (!reasons.length) continue;
    findings.push({
      pattern: 'regex-dodging', verdict: 'softening', kind: 'faq-question',
      page: file.path, line: a.line, removed: clip(r.q), added: clip(a.q),
      why: `${reasons.join('; ')}, while the answer stayed the same (similarity ${bestSim.toFixed(2)}). A reword that only avoids a regex goes with an entry in admin/VALIDATOR_REGEX_ISSUES.md, or the regex gets fixed (CAREFUL_NOT_CLEVER_FAILURE_2026_05_21.md §3, Glasgow and Mauritius).`,
    });
  }
  // new questions that say "here" where their own answer names the place (modified pages only)
  if (!file.isNew && portPage) {
    for (const a of af) {
      if (pairedNew.has(a.line + '|' + a.q)) continue;
      const removedSame = rf.some((r) => r.src === a.src && fold(r.q) === fold(a.q));
      if (removedSame) continue;
      if (!DEICTIC_RE.test(a.q) || namesPlace(a.q, place) || !namesPlace(a.a, place)) continue;
      const goNote = /go/.test(place.slug) ? ` The place name contains "go", which ${COLLISION_TOKENS[1].ref.split(' (')[0]} matched.` : '';
      findings.push({
        pattern: 'regex-dodging', verdict: 'softening', kind: 'deictic-question',
        page: file.path, line: a.line, removed: '', added: clip(a.q),
        why: `the new question says "${DEICTIC_RE.exec(a.q)[0]}" instead of naming "${place.phrase}", though its answer names it.${goNote} If a validator regex forced the wording, log it in admin/VALIDATOR_REGEX_ISSUES.md (CAREFUL_NOT_CLEVER_FAILURE_2026_05_21.md §3).`,
      });
    }
  }
  // headings that lost the place name, one-for-one in a change block
  if (!portPage) return;
  for (const b of changeBlocks(file)) {
    const hRe = /<(h[1-6]|summary)\b[^>]*>([\s\S]*?)<\/\1>/i;
    const used = new Set();
    for (const r of b.rem) {
      const rm = hRe.exec(r.text); if (!rm) continue;
      const rt = plain(rm[2]); if (/\?\s*$/.test(rt)) continue; // FAQ questions handled above
      if (!namesPlace(rt, place)) continue;
      const k = b.add.findIndex((a, idx) => { if (used.has(idx)) return false; const am = hRe.exec(a.text); return am && am[1].toLowerCase() === rm[1].toLowerCase(); });
      if (k < 0) continue; used.add(k);
      const at = plain(hRe.exec(b.add[k].text)[2]);
      if (namesPlace(at, place)) continue;
      const restR = sigWords(rt).filter((w) => !place.phrase.split(' ').includes(w));
      const restA = new Set(sigWords(at));
      const overlap = restR.length ? restR.filter((w) => restA.has(w)).length / restR.length : 0;
      if (overlap < 0.5) continue; // the heading changed meaning, not only its place name
      findings.push({
        pattern: 'regex-dodging', verdict: 'softening', kind: 'heading',
        page: file.path, line: b.add[k].newNo, removed: clip(rt), added: clip(at),
        why: `the heading lost the page's own place name ("${place.phrase}") with its other words kept. If a validator regex forced it, log it in admin/VALIDATOR_REGEX_ISSUES.md (CAREFUL_NOT_CLEVER_FAILURE_2026_05_21.md §3).`,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Pattern: section reshuffle (needs a reader check)
// ---------------------------------------------------------------------------

function segments(lines, key) {
  const segs = []; let cur = null; let prev = null;
  for (const l of lines) {
    const n = l[key];
    if (!cur || n !== prev + 1) { cur = []; segs.push(cur); }
    cur.push(l); prev = n;
  }
  return segs.map((s) => s.filter((l) => l.text.trim()));
}

function detectReshuffle(file, findings, minBlock) {
  const { removed, added } = fileView(file);
  if (!removed.length || !added.length) return;
  // unchanged lines before a line: identical in both files, so a differing count means a move
  const anchorOld = new Map(); removed.forEach((l, i) => anchorOld.set(l, l.oldNo - 1 - i));
  const anchorNew = new Map(); added.forEach((l, i) => anchorNew.set(l, l.newNo - 1 - i));
  const rs = segments(removed, 'oldNo'), as = segments(added, 'newNo');
  const norm = (l) => l.text.trim().replace(/\s+/g, ' ');
  const usedAdd = new Set();
  for (const r of rs) {
    let i = 0;
    while (i < r.length) {
      let best = null;
      for (const a of as) {
        for (let j = 0; j < a.length; j++) {
          if (usedAdd.has(a[j]) || norm(a[j]) !== norm(r[i])) continue;
          let k = 0;
          while (i + k < r.length && j + k < a.length && !usedAdd.has(a[j + k]) && norm(r[i + k]) === norm(a[j + k])) k++;
          if (!best || k > best.len) best = { a, j, len: k };
        }
      }
      if (best && best.len >= minBlock) {
        const rl = r.slice(i, i + best.len), al = best.a.slice(best.j, best.j + best.len);
        // JSON-LD lines reordered inside a <script> are not reading flow; count visible lines only
        const substantive = rl.filter((l) => l.text.trim().length >= 20 && !/^\s*["{}\[\],]/.test(l.text)).length;
        const moved = anchorOld.get(rl[0]) !== anchorNew.get(al[0]);
        if (substantive >= 3 && moved) {
          al.forEach((l) => usedAdd.add(l));
          const heading = rl.map((l) => /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>|<summary[^>]*>([\s\S]*?)<\/summary>|<section[^>]*id="([^"]+)"/i.exec(l.text)).find(Boolean);
          const label = heading ? plain(heading[1] || heading[2] || heading[3]) : clip(rl[0].text.trim(), 80);
          findings.push({
            pattern: 'section-reshuffle', verdict: 'needs-reader-check', kind: 'moved-block',
            page: file.path, line: al[0].newNo,
            removed: `old lines ${rl[0].oldNo}-${rl[rl.length - 1].oldNo}: ${clip(rl[0].text.trim(), 100)}`,
            added: `new lines ${al[0].newNo}-${al[al.length - 1].newNo}: ${clip(al[0].text.trim(), 100)}`,
            why: `a block of ${best.len} non-blank lines ("${clip(label, 80)}") was deleted at one position and re-added at another. Not a defect by itself: read the page in its new order and confirm it still flows for a reader, or name it in the commit as "reorder not visually verified" (CAREFUL_NOT_CLEVER_FAILURE_2026_05_21.md §4, Vigo).`,
          });
          i += best.len; continue;
        }
      }
      i++;
    }
  }
}

// ---------------------------------------------------------------------------
// Driver
// ---------------------------------------------------------------------------

export function detect(diffText, { minBlock = 8 } = {}) {
  const parsed = parseUnifiedDiff(diffText);
  const findings = [];
  const pages = [];
  const unparsed = [];
  for (const f of parsed.files) {
    if (!f.path || !/\.html?$/i.test(f.path)) continue;
    if (f.binary) continue;
    if (f.unparsed) { unparsed.push({ page: f.path, reason: f.unparsed }); continue; }
    pages.push(f.path);
    if (f.isDeleted) continue;
    detectRepointing(f, findings);
    detectStripping(f, findings);
    detectDodging(f, findings);
    if (!f.isNew) detectReshuffle(f, findings, minBlock);
  }
  findings.sort((a, b) => (a.page < b.page ? -1 : a.page > b.page ? 1 : (a.line || 0) - (b.line || 0)));
  return { sawHeader: parsed.sawHeader, files: parsed.files.length, pages, unparsed, findings };
}

function parseArgs(argv) {
  const o = { mode: null, json: false, minBlock: 8, repo: null, errors: [] };
  const modes = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--range') { modes.push('range'); o.range = argv[++i]; }
    else if (a.startsWith('--range=')) { modes.push('range'); o.range = a.slice(8); }
    else if (a === '--staged') modes.push('staged');
    else if (a === '--diff-file') { modes.push('diff-file'); o.diffFile = argv[++i]; }
    else if (a.startsWith('--diff-file=')) { modes.push('diff-file'); o.diffFile = a.slice(12); }
    else if (a === '--repo') o.repo = argv[++i];
    else if (a === '--json') o.json = true;
    else if (a === '--min-block') o.minBlock = Number(argv[++i]);
    else if (a === '--help' || a === '-h') o.help = true;
    else o.errors.push(`unknown flag ${a}`);
  }
  if (modes.length !== 1 && !o.help) o.errors.push(modes.length ? 'pass exactly one input mode' : 'no input mode');
  o.mode = modes[0];
  if (!(o.minBlock >= 2)) o.errors.push('--min-block must be a number >= 2');
  return o;
}

function git(repo, args) {
  return execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', maxBuffer: 1024 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
}

function unavailable(code, detail, json) {
  const remedies = {
    range_unreadable: 'pass --range <a>..<b> with both ends present in this clone; deepen a shallow clone if a commit is missing',
    staged_unreadable: 'run inside a git checkout, or pass --repo <path>',
    diff_file_unreadable: 'pass a readable unified diff (git show <sha> -- <page> > file)',
    diff_empty: 'regenerate the diff; an empty capture is never read as clean',
    diff_unparseable: 'diff two commits with --range a..b, not a merge commit\'s combined diff, or regenerate the file',
    usage: 'pass exactly one of --range <a>..<b>, --staged, --diff-file <path>',
  };
  const out = json
    ? JSON.stringify({ state: 'UNAVAILABLE', exit: EXIT.UNAVAILABLE, code, detail, remedy: remedies[code], doc: DOC }, null, 2) + '\n'
    : `softening-detector: UNAVAILABLE code=${code}\n  ${detail}\n  remedy: ${remedies[code]}\n  doc: ${DOC}\n  (could not look, so this is NOT a clean result)\n`;
  return { exitCode: EXIT.UNAVAILABLE, stdout: out };
}

export function run(argv, { cwdRepo } = {}) {
  const o = parseArgs(argv);
  if (o.help) return { exitCode: 0, stdout: `usage: node admin/softening-detector.mjs (--range <a>..<b> | --staged | --diff-file <path>) [--repo <path>] [--json] [--min-block N]\nsee ${DOC}\n` };
  if (o.errors.length) return unavailable('usage', o.errors.join('; '), o.json);
  const repo = resolve(o.repo || cwdRepo || resolve(dirname(fileURLToPath(import.meta.url)), '..'));
  let diffText = '';
  let source = '';
  if (o.mode === 'range') {
    const m = /^([^.\s][^\s]*?)\.\.([^.\s][^\s]*)$/.exec(o.range || '');
    if (!m || m[2].startsWith('.')) return unavailable('range_unreadable', `range "${o.range}" is not of the form <a>..<b>`, o.json);
    for (const ref of [m[1], m[2]]) {
      try { git(repo, ['rev-parse', '--verify', '--quiet', `${ref}^{commit}`]); }
      catch { return unavailable('range_unreadable', `"${ref}" does not resolve to a commit in ${repo}`, o.json); }
    }
    try { diffText = git(repo, ['diff', '--no-color', '--no-ext-diff', '-M', '--unified=3', m[1], m[2], '--', '*.html', '*.htm']); }
    catch (e) { return unavailable('range_unreadable', `git diff ${o.range} failed: ${clip(String(e.stderr || e.message), 200)}`, o.json); }
    source = `range ${o.range} in ${repo}`;
  } else if (o.mode === 'staged') {
    try { diffText = git(repo, ['diff', '--cached', '--no-color', '--no-ext-diff', '-M', '--unified=3', '--', '*.html', '*.htm']); }
    catch (e) { return unavailable('staged_unreadable', `git diff --cached failed in ${repo}: ${clip(String(e.stderr || e.message), 200)}`, o.json); }
    source = `staged changes in ${repo}`;
  } else {
    if (!o.diffFile) return unavailable('usage', '--diff-file needs a path', o.json);
    try { diffText = readFileSync(o.diffFile, 'utf8'); }
    catch (e) { return unavailable('diff_file_unreadable', `could not read ${o.diffFile}: ${e.code || e.message}`, o.json); }
    if (!diffText.trim()) return unavailable('diff_empty', `${o.diffFile} is empty`, o.json);
    source = `diff file ${o.diffFile}`;
  }
  const res = detect(diffText, { minBlock: o.minBlock });
  if (o.mode === 'diff-file' && !res.sawHeader) return unavailable('diff_unparseable', `${o.diffFile} contains no unified-diff header (diff --git / --- +++)`, o.json);
  if (res.unparsed.length) return unavailable('diff_unparseable', res.unparsed.map((u) => `${u.page}: ${u.reason}`).join('; '), o.json);
  const state = res.findings.length ? 'FINDINGS' : 'CLEAN';
  const exitCode = res.findings.length ? EXIT.FINDINGS : EXIT.CLEAN;
  const softening = res.findings.filter((f) => f.verdict === 'softening').length;
  const review = res.findings.length - softening;
  if (o.json) {
    return { exitCode, stdout: JSON.stringify({ state, exit: exitCode, code: res.findings.length ? 'softening_found' : 'clean', source, pages_scanned: res.pages.length, softening, needs_reader_check: review, findings: res.findings, doc: DOC }, null, 2) + '\n' };
  }
  const out = [];
  out.push(`softening-detector: ${state} (exit ${exitCode}) — ${softening} softening finding(s), ${review} needing a reader check, across ${res.pages.length} changed HTML page(s) [${source}]`);
  for (const f of res.findings) {
    out.push('');
    out.push(`${f.page}:${f.line ?? '?'}  ${f.pattern} (${f.kind})  ${f.verdict === 'softening' ? 'SOFTENING' : 'NEEDS A READER CHECK'}`);
    if (f.removed) out.push(`  removed: ${f.removed}`);
    if (f.added) out.push(`  added:   ${f.added}`);
    out.push(`  why: ${f.why}`);
  }
  out.push('');
  out.push(res.findings.length
    ? `code=softening_found. Advisory: this detector never edits a page. Fix the cause, restore the fact, or log the validator bug in admin/VALIDATOR_REGEX_ISSUES.md. Doc: ${DOC}`
    : `CLEAN: looked at ${res.pages.length} changed HTML page(s) and found no softening pattern. Clean is not proof of quality; see ${DOC} for what this cannot see.`);
  return { exitCode, stdout: out.join('\n') + '\n' };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const { exitCode, stdout } = run(process.argv.slice(2));
  process.stdout.write(stdout);
  process.exitCode = exitCode; // never process.exit() after writing: piped output past 64 KiB would be cut off
}
