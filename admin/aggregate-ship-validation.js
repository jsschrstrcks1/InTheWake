#!/usr/bin/env node
/**
 * aggregate-ship-validation.js
 *
 * Walks every ships/<line>/<slug>.html, runs both validators with
 * --json-output, merges results into audit-reports/ship-validation-dashboard.json,
 * and produces a static HTML dashboard at audit-reports/ship-validation-dashboard.html.
 *
 * Usage:
 *   node admin/aggregate-ship-validation.js                # full fleet
 *   node admin/aggregate-ship-validation.js --line=rcl     # one line only
 *   node admin/aggregate-ship-validation.js --quiet        # no progress output
 *
 * Per Phase 1.2 of admin/SHIP_STANDARDIZATION_PLAN.md.
 *
 * Soli Deo Gloria
 */

import { readFile, writeFile, mkdir, readdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, '..');
const SHIPS_DIR = join(REPO_ROOT, 'ships');
const REPORT_DIR = join(REPO_ROOT, 'audit-reports');
const REPORT_JSON = join(REPORT_DIR, 'ship-validation-dashboard.json');
const REPORT_HTML = join(REPORT_DIR, 'ship-validation-dashboard.html');

const HUB_BASENAMES = new Set(['index.html', 'venues.html', 'quiz.html', 'allshipquiz.html', 'rooms.html', 'template.html', 'countdown.html']);

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    line: (args.find(a => a.startsWith('--line=')) || '').slice('--line='.length) || null,
    quiet: args.includes('--quiet'),
  };
}

async function findShipPages(filter = null) {
  const out = [];
  const lines = await readdir(SHIPS_DIR, { withFileTypes: true });
  for (const lineEntry of lines) {
    if (!lineEntry.isDirectory()) continue;
    if (filter && lineEntry.name !== filter) continue;
    const lineDir = join(SHIPS_DIR, lineEntry.name);
    const files = await readdir(lineDir);
    for (const f of files) {
      if (!f.endsWith('.html')) continue;
      if (HUB_BASENAMES.has(f)) continue;
      out.push({ line: lineEntry.name, path: join(lineDir, f), relpath: `ships/${lineEntry.name}/${f}` });
    }
  }
  return out;
}

// itw-aggregator-hang-fix: a single validator that wedges (a runaway regex, a stuck child) would otherwise
// hang the ENTIRE full-fleet run (~290 ships × 2 validators) forever — spawnSync with no timeout blocks
// indefinitely. Bound each invocation; a page that exceeds it is reported as a validation FAILURE, never a
// silent stall. Env-overridable for a slow host / a deliberately deep run.
const VALIDATOR_TIMEOUT_MS = Number(process.env.ITW_VALIDATOR_TIMEOUT_MS) || 60_000;

function runValidator(cmd, args, file) {
  const proc = spawnSync(cmd, [...args, file], {
    encoding: 'utf-8',
    maxBuffer: 50 * 1024 * 1024,
    timeout: VALIDATOR_TIMEOUT_MS,
    killSignal: 'SIGTERM',
  });
  // A timeout (or a spawn failure) sets proc.error and leaves stdout null/partial. Surface it as a FAILURE —
  // never fall through to JSON.parse(null) === null, which returned { ok: true } and read a wedged page as a
  // clean pass (a false all-clear in the dashboard). Check proc.error BEFORE parsing.
  if (proc.error) {
    const why = proc.error.code === 'ETIMEDOUT'
      ? `validator timeout after ${VALIDATOR_TIMEOUT_MS}ms`
      : String(proc.error.message || proc.error);
    // procFailed: the validator was KILLED / could not run (timeout, spawn error) — distinct from a JSON
    // parse failure (validator ran but its stdout wasn't JSON). Only a proc-level failure gets surfaced as a
    // NEW fail_code below; parse failures keep their pre-existing behavior so this fix stays scoped to the hang.
    return { ok: false, procFailed: true, exit: proc.status, error: why, stderr: (proc.stderr || '').slice(0, 200) };
  }
  let parsed = null;
  try {
    parsed = JSON.parse(proc.stdout);
  } catch (_) {
    return { ok: false, exit: proc.status, error: 'JSON parse failed', stderr: (proc.stderr || '').slice(0, 200) };
  }
  return { ok: true, exit: proc.status, ...parsed };
}

function aggregateRules(report) {
  const counts = {};
  for (const ship of report.per_page) {
    for (const rule of (ship.fail_codes || [])) {
      counts[rule] = (counts[rule] || 0) + 1;
    }
  }
  return Object.fromEntries(
    Object.entries(counts).sort(([, a], [, b]) => b - a)
  );
}

async function main() {
  const opts = parseArgs();
  const ships = await findShipPages(opts.line);
  if (ships.length === 0) {
    console.error(`No ships found${opts.line ? ` for line=${opts.line}` : ''}.`);
    process.exit(1);
  }

  if (!opts.quiet) console.error(`Validating ${ships.length} ship pages...`);

  const perPage = [];
  const linesByName = {};
  let processed = 0;

  for (const ship of ships) {
    const sh = runValidator('bash', [join(REPO_ROOT, 'admin', 'validate-ship-page.sh'), '--json-output'], ship.path);
    const js = runValidator('node', [join(REPO_ROOT, 'admin', 'validate-ship-page.js'), '--json-output'], ship.path);

    const shErrors = (sh.checks || []).filter(c => c.status === 'error').length;
    const shWarnings = (sh.checks || []).filter(c => c.status === 'warn').length;
    const jsErrors = (js.blocking_errors || []).length;
    const jsWarnings = (js.warnings || []).length;

    // Collect rule keys for failures
    const fail_codes = [];
    for (const c of (sh.checks || [])) {
      if (c.status === 'error') fail_codes.push(`sh:${(c.message || '').slice(0, 60)}`);
    }
    for (const e of (js.blocking_errors || [])) {
      fail_codes.push(`js:${e.section}/${e.rule}`);
    }
    // itw-aggregator-hang-fix: a validator that was KILLED (timeout) or could not spawn has no checks or
    // blocking_errors, so it contributed ZERO error rows above and would read as a CLEAN PASS in the
    // dashboard's errors_by_rule + the pre-commit regression gate — a wedged validator hiding as a green page.
    // Surface a proc-level failure as an explicit fail_code so a killed/timed-out validator is always visible.
    // Scoped to procFailed only (NOT a JSON-parse failure, which is a pre-existing, separate condition) so this
    // hang fix does not retroactively flood the dashboard with new codes for already-non-JSON validator output.
    if (sh.procFailed) fail_codes.push(`sh:VALIDATOR_FAILED:${String(sh.error || 'unknown').slice(0, 60)}`);
    if (js.procFailed) fail_codes.push(`js:VALIDATOR_FAILED:${String(js.error || 'unknown').slice(0, 60)}`);

    const entry = {
      path: ship.relpath,
      line: ship.line,
      sh: { errors: shErrors, warnings: shWarnings, exit: sh.exit, ok: sh.ok },
      js: { errors: jsErrors, warnings: jsWarnings, score: js.score, valid: js.valid, ok: js.ok },
      fail_codes,
    };
    perPage.push(entry);

    if (!linesByName[ship.line]) {
      linesByName[ship.line] = { line: ship.line, pages: 0, sh_errors: 0, sh_warnings: 0, js_errors: 0, js_warnings: 0, top_failures: {} };
    }
    const L = linesByName[ship.line];
    L.pages++;
    L.sh_errors += shErrors;
    L.sh_warnings += shWarnings;
    L.js_errors += jsErrors;
    L.js_warnings += jsWarnings;
    for (const code of fail_codes) {
      L.top_failures[code] = (L.top_failures[code] || 0) + 1;
    }

    processed++;
    if (!opts.quiet && processed % 30 === 0) {
      console.error(`  ... ${processed}/${ships.length}`);
    }
  }

  // Convert top_failures to sorted top-10 per line
  const byLine = Object.values(linesByName).sort((a, b) => a.line.localeCompare(b.line));
  for (const L of byLine) {
    L.top_failures = Object.entries(L.top_failures)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([code, count]) => ({ code, count }));
  }

  const totals = {
    pages: perPage.length,
    sh_errors_total: perPage.reduce((s, p) => s + p.sh.errors, 0),
    sh_warnings_total: perPage.reduce((s, p) => s + p.sh.warnings, 0),
    js_errors_total: perPage.reduce((s, p) => s + p.js.errors, 0),
    js_warnings_total: perPage.reduce((s, p) => s + p.js.warnings, 0),
    sh_pass: perPage.filter(p => p.sh.exit === 0).length,
    sh_warn_only: perPage.filter(p => p.sh.exit === 2).length,
    sh_fail: perPage.filter(p => p.sh.exit === 1).length,
    js_pass: perPage.filter(p => p.js.valid === true).length,
    js_fail: perPage.filter(p => p.js.valid === false).length,
  };

  const report = {
    generated: new Date().toISOString(),
    scope: opts.line ? `line=${opts.line}` : 'full-fleet',
    totals,
    by_line: byLine,
    per_page: perPage,
  };
  report.errors_by_rule = aggregateRules(report);

  await mkdir(REPORT_DIR, { recursive: true });
  await writeFile(REPORT_JSON, JSON.stringify(report, null, 2));

  // Static HTML dashboard
  const lineRowsHtml = byLine.map(L => `
    <tr>
      <td>${L.line}</td>
      <td class="num">${L.pages}</td>
      <td class="num err">${L.sh_errors}</td>
      <td class="num warn">${L.sh_warnings}</td>
      <td class="num err">${L.js_errors}</td>
      <td class="num warn">${L.js_warnings}</td>
      <td class="topfail">${L.top_failures.slice(0, 3).map(f => `${f.count}× <code>${f.code.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</code>`).join('<br>')}</td>
    </tr>`).join('');

  const topRulesHtml = Object.entries(report.errors_by_rule).slice(0, 20)
    .map(([rule, count]) => `<li><code>${rule.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</code> — ${count}</li>`).join('');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Ship Validation Dashboard — ${report.scope}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 2em; max-width: 1100px; color: #134; }
  h1 { font-size: 1.5em; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; }
  th, td { padding: 0.5em 0.75em; text-align: left; border-bottom: 1px solid #cdd; }
  th { background: #f0f5fa; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  td.err { color: #b00; }
  td.warn { color: #c84; }
  .topfail code { font-size: 0.85em; }
  .summary { background: #f0f5fa; padding: 1em; border-radius: 6px; margin: 1em 0; }
  ul.rules { columns: 2; }
  ul.rules code { font-size: 0.9em; }
</style>
</head>
<body>
<h1>Ship Validation Dashboard</h1>
<p><strong>Scope:</strong> ${report.scope} · <strong>Generated:</strong> ${report.generated}</p>

<div class="summary">
  <strong>Totals (${totals.pages} pages):</strong><br>
  .sh validator: ${totals.sh_pass} pass / ${totals.sh_warn_only} warn-only / ${totals.sh_fail} fail<br>
  .js validator: ${totals.js_pass} pass / ${totals.js_fail} fail<br>
  Errors: ${totals.sh_errors_total} (sh) + ${totals.js_errors_total} (js)<br>
  Warnings: ${totals.sh_warnings_total} (sh) + ${totals.js_warnings_total} (js)
</div>

<h2>By cruise line</h2>
<table>
<thead><tr>
  <th>Line</th><th>Pages</th><th>sh err</th><th>sh warn</th><th>js err</th><th>js warn</th><th>Top failures</th>
</tr></thead>
<tbody>${lineRowsHtml}</tbody>
</table>

<h2>Top error rules across fleet</h2>
<ul class="rules">${topRulesHtml}</ul>

<p><em>Raw JSON: <a href="ship-validation-dashboard.json">ship-validation-dashboard.json</a></em></p>
</body>
</html>`;

  await writeFile(REPORT_HTML, html);

  if (!opts.quiet) {
    console.error(`\nDone.`);
    console.error(`  ${REPORT_JSON.replace(REPO_ROOT + '/', '')}`);
    console.error(`  ${REPORT_HTML.replace(REPO_ROOT + '/', '')}`);
    console.error(`\nTotals: ${totals.pages} pages, ${totals.sh_pass}/${totals.sh_fail} sh-pass/fail, ${totals.js_pass}/${totals.js_fail} js-pass/fail`);
  }
}

main().catch(e => {
  console.error(`Fatal: ${e.message}`);
  process.exit(1);
});
