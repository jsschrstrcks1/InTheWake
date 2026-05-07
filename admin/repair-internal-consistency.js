#!/usr/bin/env node
/**
 * repair-internal-consistency.js
 *
 * Phase 3.1 — per-page repair of internal numeric inconsistencies.
 * Reads each affected ship's canonical from page.json (or, if absent,
 * picks the most-frequent non-max integer on the page), then rewrites
 * every non-max guest-count integer to match.
 *
 * Per .claude/skills/internal-consistency-repair/SKILL.md.
 *
 * Strategy:
 *   1. For each candidate page:
 *      a. Parse page.json `stats_fallback.guests` for the canonical.
 *      b. If absent, pick the most-frequent non-max integer on the page.
 *      c. Find every "<INT>,<INT> guests/passengers/capacity" form on the
 *         page that is NOT in a max-labeled context (label can come
 *         before OR after the integer).
 *      d. Replace the integer with the canonical, preserving voice.
 *   2. Re-run the validator; if internal_numeric_inconsistency still
 *      fires, surface for manual review.
 *
 * Usage:
 *   node admin/repair-internal-consistency.js                              # dry-run, full fleet
 *   node admin/repair-internal-consistency.js --apply
 *   node admin/repair-internal-consistency.js --apply --limit=10
 *   node admin/repair-internal-consistency.js --apply ships/rcl/brilliance-of-the-seas.html
 *
 * Soli Deo Gloria
 */
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname, basename, relative } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DASHBOARD = join(REPO_ROOT, 'audit-reports/ship-validation-dashboard.json');
const AUDIT_DIR = join(REPO_ROOT, 'audit-reports/internal-consistency');

const MAX_LABEL = /\b(max(imum)?|all[- ]berths?(?:[- ]?full)?|full[- ]capacity|full[- ]occupanc[yi])\b/i;

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    apply: args.includes('--apply'),
    limit: parseInt((args.find(a => a.startsWith('--limit=')) || '').slice('--limit='.length)) || null,
    files: args.filter(a => !a.startsWith('--')),
  };
}

async function loadCandidatesFromDashboard() {
  if (!existsSync(DASHBOARD)) {
    console.error(`Dashboard not found: ${DASHBOARD}`);
    return [];
  }
  const data = JSON.parse(await readFile(DASHBOARD, 'utf-8'));
  return data.per_page
    .filter(p => p.fail_codes && p.fail_codes.some(c => c.includes('internal_numeric_inconsistency')))
    .map(p => p.path);
}

function readPageJsonCanonical(htmlPath) {
  // ships/<line>/<slug>.html → assets/data/ships/<line>/<slug>.page.json
  const m = htmlPath.match(/ships\/([^/]+)\/([^/]+)\.html$/);
  if (!m) return null;
  const pageJsonPath = join(REPO_ROOT, 'assets/data/ships', m[1], `${m[2]}.page.json`);
  if (!existsSync(pageJsonPath)) return null;
  try {
    const pj = JSON.parse(require('fs').readFileSync(pageJsonPath, 'utf-8'));
    const guests = pj?.stats_fallback?.guests;
    if (!guests) return null;
    // Pick the FIRST integer in the string (the double-occupancy figure).
    const intMatch = String(guests).match(/(\d{1,2},\d{3}|\d{4,5})/);
    if (!intMatch) return null;
    return { value: intMatch[1].replace(/,/g, ''), formatted: intMatch[1].includes(',') ? intMatch[1] : Number(intMatch[1]).toLocaleString('en-US'), source: 'page.json/stats_fallback.guests' };
  } catch { return null; }
}

// "Lower-bound" rhetoric like "over 5,000" or "more than 5,000" is honest
// rounding to a floor — those are NOT inconsistencies, they're legitimate
// approximations. Don't rewrite them.
const LOWER_BOUND_LABEL = /\b(over|more than|north of|upwards of)\s+$/i;

function findGuestCounts(html) {
  // Match "N,NNN guests" or "NNNN guests" in non-max context (label can be
  // before or after).
  const re = /([\s\S]{0,40})\b(\d{1,2},\d{3}|\d{4,5})\b\s*(guests?|passengers?|capacity)([\s\S]{0,80})/gi;
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    const before = m[1];
    const num = m[2];
    const after = m[4];
    const isMax = MAX_LABEL.test(before) || MAX_LABEL.test(after);
    const isLowerBound = LOWER_BOUND_LABEL.test(before);
    // Detect occurrences inside logbook-story prose. Logbook story sections
    // carry first-person narrator voice; rhetorical rounding ("over 5,000",
    // "carries 5,000 passengers") in those sections is editorial, not a
    // data-consistency issue. We mark them so the repair script can skip.
    // Look back ~2000 chars from the match for a section opener that
    // identifies a logbook/story container.
    const lookbackStart = Math.max(0, m.index - 2000);
    const lookback = html.slice(lookbackStart, m.index);
    const lastSectionOpen = Math.max(
      lookback.lastIndexOf('<section'),
      lookback.lastIndexOf('<article')
    );
    let isLogbookStory = false;
    if (lastSectionOpen >= 0) {
      const sectionHeader = lookback.slice(lastSectionOpen);
      isLogbookStory =
        /\bnote-kens-logbook\b|\blogbook\b|\bid="logbook|\bclass="story|\baria-labelledby="logbook/i.test(sectionHeader);
    }
    out.push({
      index: m.index,
      full: m[0],
      before,
      num,
      after,
      isMax,
      isLowerBound,
      isLogbookStory,
      normalized: num.replace(/,/g, ''),
      skip: isMax || isLowerBound || isLogbookStory,
    });
  }
  return out;
}

function pickMostFrequent(occurrences) {
  // Among non-max occurrences, pick the most-frequent normalized integer.
  const counts = {};
  for (const o of occurrences) {
    if (o.isMax) continue;
    counts[o.normalized] = (counts[o.normalized] || 0) + 1;
  }
  const sorted = Object.entries(counts).sort(([,a],[,b]) => b - a);
  if (sorted.length === 0) return null;
  return sorted[0][0];
}

function formatInt(n) {
  return Number(n).toLocaleString('en-US');
}

async function repair(filepath, opts) {
  const abs = filepath.startsWith('/') ? filepath : join(REPO_ROOT, filepath);
  if (!existsSync(abs)) return { filepath, action: 'skip-not-found' };
  const html = await readFile(abs, 'utf-8');
  const occurrences = findGuestCounts(html);
  const eligible = occurrences.filter(o => !o.skip);
  const distinct = [...new Set(eligible.map(o => o.normalized))];
  if (distinct.length <= 1) return { filepath, action: 'skip-already-consistent', distinct };

  // Determine canonical: page.json stats_fallback.guests if available,
  // else most-frequent non-max integer.
  let canonical = readPageJsonCanonical(filepath);
  let canonicalSource;
  if (canonical) {
    canonicalSource = canonical.source;
    canonical = canonical.value;
  } else {
    canonical = pickMostFrequent(occurrences);
    canonicalSource = 'most-frequent-on-page';
  }
  if (!canonical) return { filepath, action: 'skip-no-canonical', distinct };

  const canonicalFormatted = formatInt(canonical);

  // Walk occurrences in REVERSE so positions stay valid as we splice.
  let patched = html;
  const swaps = [];
  for (let i = occurrences.length - 1; i >= 0; i--) {
    const o = occurrences[i];
    if (o.skip) continue; // max-labeled, lower-bound rhetoric, or logbook story
    if (o.normalized === canonical) continue;
    // Replace just the integer within this occurrence.
    const start = o.index + o.before.length;
    const end = start + o.num.length;
    const newText = canonicalFormatted;
    patched = patched.slice(0, start) + newText + patched.slice(end);
    swaps.push({ from: o.num, to: newText, context: (o.before.slice(-30) + '⟨' + o.num + '→' + newText + '⟩' + o.after.slice(0, 30)).replace(/\s+/g, ' ') });
  }

  if (swaps.length === 0) return { filepath, action: 'skip-no-swaps' };

  if (opts.apply) await writeFile(abs, patched);
  return {
    filepath,
    action: opts.apply ? 'applied' : 'would-apply',
    canonical: canonicalFormatted,
    canonical_source: canonicalSource,
    swaps,
    swap_count: swaps.length,
    distinct_before: distinct,
  };
}

async function writeAuditLog(result) {
  if (result.action !== 'applied') return;
  await mkdir(AUDIT_DIR, { recursive: true });
  const slug = basename(result.filepath, '.html');
  const md = `# ${slug} — internal-consistency repair

**Date:** ${new Date().toISOString().slice(0,10)}
**Branch:** \`claude/phase3-internal-consistency\`

## Before

Distinct non-max integers: ${result.distinct_before.map(formatInt).join(', ')}

## Canonical chosen

**${result.canonical}** (source: ${result.canonical_source})

## Swaps applied (${result.swap_count})

${result.swaps.map((s,i) => `${i+1}. \`${s.from}\` → \`${s.to}\` — ${s.context}`).join('\n')}

## Verification

\`node admin/validate-ship-page.js ${result.filepath} --json-output | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'\`
should return empty.

*Soli Deo Gloria*
`;
  await writeFile(join(AUDIT_DIR, `${slug}.md`), md);
}

async function verifyPostFix(filepath) {
  const abs = filepath.startsWith('/') ? filepath : join(REPO_ROOT, filepath);
  const proc = spawnSync('node', [join(REPO_ROOT, 'admin/validate-ship-page.js'), abs, '--json-output'], {
    encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024,
  });
  try {
    const d = JSON.parse(proc.stdout);
    const fires = d.blocking_errors.find(e => e.rule === 'internal_numeric_inconsistency');
    return { passed: !fires, message: fires ? fires.message : null };
  } catch { return { passed: false, message: 'validator parse failed' }; }
}

async function main() {
  const opts = parseArgs();
  let candidates = opts.files.length > 0 ? opts.files : await loadCandidatesFromDashboard();
  if (opts.limit) candidates = candidates.slice(0, opts.limit);
  console.log(`Processing ${candidates.length} ship page(s)...`);

  const results = [];
  for (const c of candidates) {
    const r = await repair(c, opts);
    if (r.action === 'applied') {
      const v = await verifyPostFix(c);
      r.verification = v;
      await writeAuditLog(r);
    }
    results.push(r);
  }

  // Summary
  const applied = results.filter(r => r.action === 'applied');
  const wouldApply = results.filter(r => r.action === 'would-apply');
  const skipped = results.filter(r => r.action && r.action.startsWith('skip'));
  const verifyFails = applied.filter(r => r.verification && !r.verification.passed);

  console.log(`\n${opts.apply ? 'Applied' : 'Would apply'}: ${opts.apply ? applied.length : wouldApply.length}`);
  if (skipped.length) console.log(`Skipped: ${skipped.length}`);
  if (verifyFails.length) {
    console.log(`\n⚠ Verify FAILED on ${verifyFails.length} files (still firing DATA-004):`);
    for (const v of verifyFails.slice(0, 10)) {
      console.log(`  ${v.filepath}: ${v.verification.message?.slice(0, 100) || '?'}`);
    }
  }

  // Per-line summary
  const byLine = {};
  for (const r of (opts.apply ? applied : wouldApply)) {
    const line = (r.filepath.match(/ships\/([^/]+)/) || [])[1] || 'unknown';
    byLine[line] = (byLine[line] || 0) + 1;
  }
  if (Object.keys(byLine).length) {
    console.log('\nBy cruise line:');
    for (const [l, n] of Object.entries(byLine).sort()) console.log(`  ${l.padEnd(25)} ${n}`);
  }

  if (verifyFails.length) process.exit(1);
}

main().catch(e => { console.error(`Fatal: ${e.message}`); process.exit(1); });
