// softening-detector.test.mjs — attacks the detector's STATED claims, not its implementation.
//
// Oracles are real commits from this repo, saved as diffs under fixtures/softening/ so the tests do
// not depend on how deep the clone is:
//   must flag:      78c65504 Sydney (reference repointing), 6e45536a Hobart and e28cc6fc Lerwick
//                   (constraint stripping), 61c8cf9e Glasgow and 46c1eee0 Mauritius (regex dodging),
//                   495a860a Vigo (section reshuffle, needs a reader check)
//   must NOT flag:  0bddee9e (restores the stripped qualifiers and fixes REGEX-03), 0683f1bc
//                   (restores the Glasgow and Mauritius phrasing), and eight ordinary commits.
// Fixture names are <pattern>--<flag|clean>--<what>-<sha>.diff.
//
// Run: node --test admin/tests/softening-detector.test.mjs
// Soli Deo Gloria.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, writeFileSync, mkdtempSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync, execFileSync } from 'node:child_process';
import { detect, run, lostQualifiers, parseUnifiedDiff, refStem, isGenericStem, EXIT } from '../softening-detector.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIX = join(HERE, 'fixtures', 'softening');
const DET = resolve(HERE, '..', 'softening-detector.mjs');
const fixtures = readdirSync(FIX).filter((f) => f.endsWith('.diff')).sort();
const read = (f) => readFileSync(join(FIX, f), 'utf8');

test('the fixture set holds every oracle the task names', () => {
  for (const sha of ['78c65504', '6e45536a', 'e28cc6fc', '61c8cf9e', '46c1eee0', '495a860a', '0bddee9e']) {
    assert.ok(fixtures.some((f) => f.includes(sha)), `missing fixture for ${sha}`);
  }
  const ordinary = fixtures.filter((f) => f.startsWith('ordinary--clean--'));
  assert.ok(ordinary.length >= 5, `need at least five ordinary negatives, have ${ordinary.length}`);
});

// --- must flag -------------------------------------------------------------------------------

for (const f of fixtures.filter((x) => x.includes('--flag--'))) {
  const pattern = f.split('--')[0];
  test(`MUST FLAG ${f} under ${pattern}`, () => {
    const res = detect(read(f));
    const hits = res.findings.filter((x) => x.pattern === pattern);
    assert.ok(hits.length > 0, `no ${pattern} finding; got ${JSON.stringify(res.findings.map((x) => x.pattern))}`);
    for (const h of hits) {
      assert.ok(h.page && h.line > 0, 'finding names a page and a line');
      assert.ok(h.why && h.why.length > 20, 'finding says why');
    }
    const cli = run(['--diff-file', join(FIX, f)]);
    assert.equal(cli.exitCode, EXIT.FINDINGS);
    assert.match(cli.stdout, /FINDINGS/);
  });
}

test('Sydney: all eight descriptive image names repointed to numbered files are flagged as softening', () => {
  const hits = detect(read(fixtures.find((f) => f.includes('78c65504')))).findings.filter((x) => x.pattern === 'reference-repointing');
  assert.equal(hits.length, 8);
  assert.ok(hits.every((h) => h.kind === 'descriptive-to-generic' && h.verdict === 'softening'));
  assert.ok(hits.some((h) => /sydney-opera-house\.webp/.test(h.why) && /sydney-2\.webp/.test(h.why)));
});

test('Hobart: "Year-round (Saturdays)" flattened to twelve months is flagged; MONA "Year-round" is not', () => {
  const hits = detect(read(fixtures.find((f) => f.includes('6e45536a')))).findings.filter((x) => x.pattern === 'constraint-stripping');
  assert.ok(hits.some((h) => /Salamanca Market/.test(h.why) && /saturday/i.test(h.why)));
  assert.ok(!hits.some((h) => /"MONA"/.test(h.why)), 'Year-round -> all twelve months loses nothing');
});

test('Lerwick: "Jan (last Tuesday)" and "best Oct-Mar" are flagged', () => {
  const hits = detect(read(fixtures.find((f) => f.includes('e28cc6fc')))).findings.filter((x) => x.pattern === 'constraint-stripping');
  assert.ok(hits.some((h) => /Up Helly Aa/.test(h.why) && /last tuesday/i.test(h.why)));
  assert.ok(hits.some((h) => /Otter Spotting/.test(h.why) && /best/.test(h.why)));
});

test('Glasgow: the storm question that says "here" instead of Glasgow is flagged, naming the "go" collision', () => {
  const hits = detect(read(fixtures.find((f) => f.includes('61c8cf9e')))).findings.filter((x) => x.pattern === 'regex-dodging');
  assert.ok(hits.some((h) => /storm season here/.test(h.added) && /"go"/.test(h.why)));
});

test('Mauritius: "What currency should I bring?" reworded to drop "bring" is flagged', () => {
  const hits = detect(read(fixtures.find((f) => f.includes('46c1eee0')))).findings.filter((x) => x.pattern === 'regex-dodging');
  assert.ok(hits.some((h) => /bring/.test(h.removed) && /"bring"/.test(h.why) && /REGEX-02/.test(h.why)));
});

test('Vigo: the moved sections are reported as needing a reader check, not as softening', () => {
  const hits = detect(read(fixtures.find((f) => f.includes('495a860a')))).findings.filter((x) => x.pattern === 'section-reshuffle');
  assert.ok(hits.length >= 1);
  assert.ok(hits.every((h) => h.verdict === 'needs-reader-check'));
});

// --- must NOT flag ---------------------------------------------------------------------------

for (const f of fixtures.filter((x) => x.includes('--clean--'))) {
  test(`NEGATIVE ${f} produces no finding and exits CLEAN`, () => {
    const res = detect(read(f));
    assert.deepEqual(res.findings.map((x) => `${x.pattern}@${x.page}:${x.line} ${x.why}`), []);
    const cli = run(['--diff-file', join(FIX, f)]);
    assert.equal(cli.exitCode, EXIT.CLEAN, cli.stdout);
    assert.match(cli.stdout, /CLEAN/);
  });
}

test('0bddee9e restores qualifiers: twelve months -> "Year-round (Saturdays)" is not a strip', () => {
  assert.deepEqual(lostQualifiers('Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec', 'Year-round (Saturdays)'), []);
  assert.deepEqual(lostQualifiers('Jan', 'Jan (last Tuesday)'), []);
});

// --- qualifier claims, with case, number, tense and unicode variants -------------------------

test('constraint stripping: each named qualifier kind is detected when it vanishes', () => {
  const kinds = (r, a, s) => lostQualifiers(r, a, s ? { strength: s } : undefined).map((x) => x.kind);
  assert.ok(kinds('Year-round (Saturdays)', 'Year-round').includes('parenthetical'));
  assert.ok(kinds('Open SATURDAYS', 'Open daily').includes('weekday'));
  assert.ok(kinds('Open saturday', 'Open daily').includes('weekday'));
  assert.ok(kinds('Jan, last Tuesday', 'Jan').includes('ordinal-weekday'));
  assert.ok(kinds('Ferry runs weekends only', 'Ferry runs').includes('keyword'));
  assert.ok(kinds('Open daily except Mondays', 'Open daily').includes('keyword'));
  assert.ok(kinds('Closed in winter', 'Open in winter').includes('keyword'));
  assert.ok(kinds('Seasonal: Jun to Aug', 'Open in summer').includes('months'));
  assert.ok(kinds('Runs 8:30am to 3pm', 'Runs in the morning').includes('time'));
  assert.ok(kinds('About 30 minutes each way', 'A short ride').includes('number'));
  assert.ok(kinds('Open Saturdays only', 'Open daily', 'constraint').length >= 2);
  assert.ok(kinds('Market (Satur​days)', 'Market').includes('parenthetical'), 'an invisible character does not hide a lost parenthetical');
});

test('constraint stripping: a correction with a new fact in its place is not a strip', () => {
  assert.deepEqual(lostQualifiers('Open Saturday', 'Open Sunday'), []);
  assert.deepEqual(lostQualifiers('A 12-hour island day', 'An 8-a.m.-to-8-p.m. island day'), []);
  assert.deepEqual(lostQualifiers('Parking ($10-20/day)', 'Parking (roughly $20-35/day)'), []);
  assert.deepEqual(lostQualifiers('About 30 minutes each way', 'The thirty-minute ride'), [], 'a spelled-out number keeps the fact');
  assert.deepEqual(lostQualifiers('every Saturday 8:30am to 3pm', 'every Saturday 8:30 AM to 3 PM'), []);
  assert.deepEqual(lostQualifiers('May, Jun, Jul, Aug, Sep', 'N/A'), [], 'an explicit N/A is a claim change, not a strip');
  assert.deepEqual(lostQualifiers('Ships (133,500 GT | 3,954 guests)', 'Ships (133,868 GT | 3,954 guests)', { strength: 'constraint' }), []);
});

// --- reference repointing claims -------------------------------------------------------------

test('reference repointing: same file stem is never flagged (query string, extension, directory, slash)', () => {
  assert.equal(refStem('/a/b/x.webp?v=3'), refStem('/c/x.jpg'));
  assert.equal(refStem('/ships.html'), refStem('/ships/'));
  assert.equal(refStem('/ships/index.html'), refStem('/ships/'));
  assert.ok(isGenericStem('sydney-2', 'sydney-opera-house'));
  assert.ok(isGenericStem('IMG_0042'.toLowerCase(), 'harbour-at-dusk'));
  assert.ok(!isGenericStem('sydney-opera-house', 'sydney-2'));
});

function mini(path, pairs) {
  const body = pairs.map(([a, b]) => `-${a}\n+${b}`).join('\n');
  const n = pairs.length;
  return `diff --git a/${path} b/${path}\n--- a/${path}\n+++ b/${path}\n@@ -10,${n + 1} +10,${n + 1} @@\n <div>\n${body}\n`;
}

test('reference repointing: an image whose alt changed with its src is not flagged (the claim moved too)', () => {
  const d = mini('ports/x.html', [['<img src="/i/x-pier.webp" alt="The pier">', '<img src="/i/x-3.webp" alt="The town square">']]);
  assert.equal(detect(d).findings.length, 0);
});

test('reference repointing: attribute case and quote style do not hide a repoint; a changed link is a reader check', () => {
  const d = mini('ports/x.html', [
    ["<IMG SRC='/i/x-old-fort.webp' ALT='The old fort'>", "<IMG SRC='/i/x-7.webp' ALT='The old fort'>"],
    ['<a href="/restaurants/giovannis-table.html">Giovanni\'s Table</a>', '<a href="/restaurants/giovannis.html">Giovanni\'s Table</a>'],
  ]);
  const f = detect(d).findings;
  assert.ok(f.some((x) => x.pattern === 'reference-repointing' && x.verdict === 'softening' && /x-7\.webp/.test(x.why)));
  assert.ok(f.some((x) => x.pattern === 'reference-repointing' && x.verdict === 'needs-reader-check' && /giovannis\.html/.test(x.why)));
});

// --- regex dodging claims --------------------------------------------------------------------

test('regex dodging: an invisible character slipped into a question is flagged', () => {
  const ans = 'Mauritian Rupee is preferred for markets and vendors. ATMs are widely available.';
  const d = mini('ports/mauritius.html', [[`<p><strong>Q: What currency should I bring?</strong><br>A: ${ans}</p>`, `<p><strong>Q: What currency should I bri​ng?</strong><br>A: ${ans}</p>`]]);
  const f = detect(d).findings.filter((x) => x.pattern === 'regex-dodging');
  assert.ok(f.some((x) => /invisible/.test(x.why)));
});

test('regex dodging: place-name checks stay off pages that are not port pages', () => {
  const ans = 'The pack covers the ship and every port of call in one place for the week.';
  const d = mini('admin/voyage-pwa/escape-thanksgiving.html', [[`<details class="faq-item"><summary>What is in the Escape Thanksgiving pack?</summary><p>${ans}</p>`, `<details class="faq-item"><summary>What is in this pack?</summary><p>${ans}</p>`]]);
  assert.equal(detect(d).findings.length, 0);
});

// --- three states ----------------------------------------------------------------------------

test('UNAVAILABLE: an unreadable range never reads as clean', () => {
  const r = run(['--range', 'no-such-ref-softening-xyz..HEAD']);
  assert.equal(r.exitCode, EXIT.UNAVAILABLE);
  assert.match(r.stdout, /UNAVAILABLE code=range_unreadable/);
  assert.doesNotMatch(r.stdout, /\bCLEAN\b(?! result)/);
  const notGit = mkdtempSync(join(tmpdir(), 'softening-notgit-'));
  assert.equal(run(['--range', 'HEAD~1..HEAD', '--repo', notGit]).exitCode, EXIT.UNAVAILABLE);
  assert.equal(run(['--staged', '--repo', notGit]).exitCode, EXIT.UNAVAILABLE);
  assert.equal(run(['--range', 'HEAD']).exitCode, EXIT.UNAVAILABLE, 'not of the form a..b');
});

test('UNAVAILABLE: missing, empty, garbage, truncated and combined diffs, and bad usage', () => {
  const dir = mkdtempSync(join(tmpdir(), 'softening-'));
  const p = (n, s) => { const f = join(dir, n); writeFileSync(f, s); return f; };
  const code = (args) => { const r = run(args); assert.equal(r.exitCode, EXIT.UNAVAILABLE, r.stdout); return /code=(\w+)/.exec(r.stdout)[1]; };
  assert.equal(code(['--diff-file', join(dir, 'missing.diff')]), 'diff_file_unreadable');
  assert.equal(code(['--diff-file', p('empty.diff', '')]), 'diff_empty');
  assert.equal(code(['--diff-file', p('garbage.diff', 'this is not a diff\n')]), 'diff_unparseable');
  assert.equal(code(['--diff-file', p('trunc.diff', 'diff --git a/ports/x.html b/ports/x.html\n--- a/ports/x.html\n+++ b/ports/x.html\n@@ -1,5 +1,5 @@\n <a>\n-<b>\n')]), 'diff_unparseable');
  assert.equal(code(['--diff-file', p('cc.diff', 'diff --cc ports/x.html\nindex 1,2..3\n@@@ -1,1 -1,1 +1,1 @@@\n- a\n +b\n')]), 'diff_unparseable');
  assert.equal(code([]), 'usage');
  assert.equal(code(['--staged', '--diff-file', 'x']), 'usage');
  assert.equal(code(['--bogus']), 'usage');
});

test('--range and --staged read a real repository (temporary repo, independent of history depth)', () => {
  const repo = mkdtempSync(join(tmpdir(), 'softening-repo-'));
  const g = (...a) => execFileSync('git', ['-C', repo, ...a], { encoding: 'utf8', env: { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' } });
  g('init', '-q');
  mkdirSync(join(repo, 'ports'));
  const row = (v) => `<div class="activity-row"><span class="activity-label">Salamanca Market</span><span class="activity-months">${v}</span></div>\n`;
  writeFileSync(join(repo, 'ports', 'hobart.html'), row('Year-round (Saturdays)'));
  g('add', '.'); g('commit', '-qm', 'one');
  writeFileSync(join(repo, 'ports', 'hobart.html'), row('Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec'));
  g('commit', '-qam', 'two');
  const r = run(['--range', 'HEAD~1..HEAD', '--repo', repo]);
  assert.equal(r.exitCode, EXIT.FINDINGS, r.stdout);
  assert.match(r.stdout, /constraint-stripping/);
  assert.equal(run(['--range', 'HEAD..HEAD', '--repo', repo]).exitCode, EXIT.CLEAN, 'no change is looked-and-clean');
  writeFileSync(join(repo, 'ports', 'hobart.html'), row('Year-round (Saturdays)'));
  g('add', '.');
  assert.equal(run(['--staged', '--repo', repo]).exitCode, EXIT.CLEAN, 'restoring the qualifier is not softening');
  const j = JSON.parse(run(['--range', 'HEAD~1..HEAD', '--repo', repo, '--json']).stdout);
  assert.equal(j.state, 'FINDINGS'); assert.equal(j.exit, 3); assert.equal(j.code, 'softening_found');
});

test('large output arrives whole through a pipe (no process.exit truncation at 64 KiB)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'softening-big-'));
  const n = 1500;
  const lines = [];
  for (let i = 0; i < n; i++) lines.push(`-<img src="/ports/img/x/x-landmark-number-${'abcdefghij'[i % 10]}-view-${i}a.webp" alt="Landmark view ${i} from the quay">`, `+<img src="/ports/img/x/x-${i}.webp" alt="Landmark view ${i} from the quay">`);
  const diff = `diff --git a/ports/x.html b/ports/x.html\n--- a/ports/x.html\n+++ b/ports/x.html\n@@ -1,${n} +1,${n} @@\n${lines.join('\n')}\n`;
  const f = join(dir, 'big.diff');
  writeFileSync(f, diff);
  const direct = spawnSync(process.execPath, [DET, '--diff-file', f], { encoding: 'utf8', maxBuffer: 1 << 28 });
  assert.equal(direct.status, EXIT.FINDINGS);
  assert.ok(direct.stdout.length > 65536 * 4, `output only ${direct.stdout.length} bytes`);
  assert.match(direct.stdout, /code=softening_found/, 'the closing line survived');
  assert.equal((direct.stdout.match(/reference-repointing/g) || []).length, n);
  const piped = spawnSync('sh', ['-c', `"${process.execPath}" "${DET}" --diff-file "${f}" --json | cat`], { encoding: 'utf8', maxBuffer: 1 << 28 });
  const j = JSON.parse(piped.stdout);
  assert.equal(j.findings.length, n);
});

test('the detector never writes: running it leaves the fixture bytes unchanged', () => {
  const before = fixtures.map((f) => read(f));
  for (const f of fixtures) run(['--diff-file', join(FIX, f)]);
  assert.deepEqual(fixtures.map((f) => read(f)), before);
  assert.doesNotMatch(readFileSync(DET, 'utf8'), /\bwriteFile|appendFile|\beval\(|new Function/);
});

test('parser: counts-driven hunks survive content lines that look like headers', () => {
  const d = 'diff --git a/ports/x.html b/ports/x.html\n--- a/ports/x.html\n+++ b/ports/x.html\n@@ -1,2 +1,2 @@\n--- not a header\n+++ also not a header\n context\n';
  const p = parseUnifiedDiff(d);
  assert.equal(p.files.length, 1);
  assert.equal(p.files[0].unparsed, null);
  assert.deepEqual(p.files[0].hunks[0].lines.map((l) => l.t), ['-', '+', ' ']);
});
