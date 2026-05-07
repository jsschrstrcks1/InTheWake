#!/usr/bin/env node
/**
 * survey-guest-counts.js
 *
 * For one or more ship-page HTML files, prints every occurrence of a
 * guest-count integer with line number, surrounding context, and
 * whether the context is "maximum capacity" labeled.
 *
 * Output is human-readable; pipe to less. JSON output via --json.
 *
 * Used as the first step of the internal-consistency-repair skill (see
 * .claude/skills/internal-consistency-repair/SKILL.md). Driven by the
 * canonical = passengers_double_occupancy rule in Policy 0.2.
 *
 * Usage:
 *   node admin/survey-guest-counts.js ships/rcl/brilliance-of-the-seas.html
 *   node admin/survey-guest-counts.js ships/rcl/*.html --json
 *   node admin/survey-guest-counts.js --from-dashboard         # all 59 flagged ships
 *
 * Soli Deo Gloria
 */
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DASHBOARD = join(REPO_ROOT, 'audit-reports/ship-validation-dashboard.json');

// Match contexts where a guest-count integer is being asserted as a fact
// about the ship's capacity. Excludes incidentally large numbers
// (length in feet, year built, etc.) by requiring proximity to a
// capacity-keyword.
const CONTEXT_KEYWORDS = /\b(guest|passenger|capacity|occupanc[yi]|berth)/i;
const MAX_LABEL = /\b(max(imum)?|all[- ]berths?[- ]?(full)?|full[- ]capacity|full[- ]occupanc[yi])\b/i;

// Pull every "1,234" or "12,345" or "5610" form within a windowing distance
// of a CONTEXT_KEYWORD. We scan line by line so we can report line numbers
// cleanly.
function survey(filepath, html) {
  const lines = html.split('\n');
  const occurrences = [];

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    if (!CONTEXT_KEYWORDS.test(line)) continue;
    // Find every integer with comma-thousands or 4+ bare digits.
    const intRe = /\b(\d{1,2},\d{3}|\d{4,5})\b/g;
    let m;
    while ((m = intRe.exec(line)) !== null) {
      // Window: 30 chars before the integer + 30 chars after.
      const winStart = Math.max(0, m.index - 30);
      const winEnd = Math.min(line.length, m.index + m[0].length + 30);
      const window = line.slice(winStart, winEnd);
      if (!CONTEXT_KEYWORDS.test(window)) continue;
      const isLabelledMax = MAX_LABEL.test(window);

      // Categorize the location so the repair editor knows what to update.
      const lineKind = classify(line);
      occurrences.push({
        line: lineIdx + 1,
        integer: m[1].replace(/,/g, ''),
        formatted: m[1],
        labelled_max: isLabelledMax,
        location: lineKind,
        context: window.trim().replace(/\s+/g, ' '),
      });
    }
  }
  return occurrences;
}

function classify(line) {
  if (/<meta\s+name="ai-summary"/.test(line)) return 'meta-ai-summary';
  if (/"reviewBody"|reviewBody/.test(line)) return 'jsonld-review-body';
  if (/"description"\s*:\s*"/.test(line) && /WebPage|Article|HowTo|Vehicle|Product/.test(line)) return 'jsonld-description';
  if (/additionalProperty[\s\S]*passengerCapacity/.test(line)) return 'jsonld-additionalProperty';
  if (/"acceptedAnswer"|acceptedAnswer.*?text/.test(line)) return 'jsonld-faq-answer';
  if (/<p\s+class="[^"]*\bfact-block\b/.test(line)) return 'fact-block';
  if (/<p\s+class="[^"]*\banswer-line\b/.test(line)) return 'answer-line-quick-answer';
  if (/<p\s+class="[^"]*\bfit-guidance\b|Best For:/.test(line)) return 'fit-guidance';
  if (/You'll love|You may prefer/.test(line)) return 'who-shes-for';
  if (/whimsical|fun-distance/.test(line)) return 'whimsical-units';
  if (/class="faq-answer"/.test(line)) return 'faq-html-answer';
  if (/<h\d/.test(line) || /key-facts/.test(line)) return 'heading-or-keyfacts';
  return 'other-prose';
}

async function processFile(filepath, opts) {
  const abs = filepath.startsWith('/') ? filepath : join(REPO_ROOT, filepath);
  if (!existsSync(abs)) return { file: filepath, error: 'not-found' };
  const html = await readFile(abs, 'utf-8');
  const occurrences = survey(abs, html);
  // Distinct integers across non-max contexts (the validator's sense)
  const nonMaxNumbers = [...new Set(occurrences.filter(o => !o.labelled_max).map(o => o.integer))];
  return {
    file: relative(REPO_ROOT, abs),
    total_occurrences: occurrences.length,
    distinct_non_max_integers: nonMaxNumbers,
    fires_data004: nonMaxNumbers.length > 1,
    occurrences,
  };
}

function printHuman(result) {
  console.log(`\n${result.file}`);
  console.log(`  ${result.total_occurrences} occurrences, ${result.distinct_non_max_integers.length} distinct non-max integer(s): ${result.distinct_non_max_integers.join(', ')}`);
  if (result.fires_data004) console.log(`  ⚠ DATA-004 fires`);
  for (const o of result.occurrences) {
    const flag = o.labelled_max ? '[MAX]' : '     ';
    console.log(`  L${String(o.line).padStart(4)}  ${flag}  ${o.formatted.padStart(7)}  ${o.location.padEnd(28)}  ${o.context.slice(0, 80)}`);
  }
}

async function loadDashboardTargets() {
  if (!existsSync(DASHBOARD)) {
    console.error(`Dashboard not found: ${DASHBOARD}`);
    process.exit(1);
  }
  const data = JSON.parse(await readFile(DASHBOARD, 'utf-8'));
  return data.per_page
    .filter(p => p.fail_codes && p.fail_codes.some(c => c.includes('internal_numeric_inconsistency')))
    .map(p => p.path);
}

async function main() {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const fromDashboard = args.includes('--from-dashboard');
  let files = args.filter(a => !a.startsWith('--'));

  if (fromDashboard) {
    files = await loadDashboardTargets();
    console.error(`Loaded ${files.length} ships from dashboard`);
  }
  if (files.length === 0) {
    console.error('Usage: survey-guest-counts.js <file> [<file>...] [--json] [--from-dashboard]');
    process.exit(1);
  }

  const results = [];
  for (const f of files) {
    const r = await processFile(f);
    results.push(r);
    if (!json) printHuman(r);
  }

  if (json) console.log(JSON.stringify(results, null, 2));

  // Tail summary (skip if json)
  if (!json) {
    const fires = results.filter(r => r.fires_data004).length;
    console.error(`\n${results.length} files surveyed, ${fires} fire DATA-004.`);
  }
}

main().catch(e => { console.error(`Fatal: ${e.message}`); process.exit(1); });
