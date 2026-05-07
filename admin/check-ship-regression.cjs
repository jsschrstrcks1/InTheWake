#!/usr/bin/env node
/**
 * v3 X3 — Per-ship regression diff against the dashboard baseline.
 *
 * Wraps validate-ship-page.js (--json-output) and validate-ship-page.sh.
 * Compares the current run's failure codes against the baseline recorded in
 * audit-reports/ship-validation-dashboard.json. Fails iff this run introduces
 * a NEW failure code not present in the baseline (a regression).
 *
 * NEW PASSES are reported as info but do not fail.
 *
 * See admin/SHIP_STANDARDIZATION_PLAN_V3.md § 7.3.
 *
 * Usage:
 *   node admin/check-ship-regression.cjs <ships/.../*.html> [...more files]
 *
 * Exit codes:
 *   0  no regressions (existing failures unchanged or improved)
 *   1  regression detected
 *   2  bad usage / runtime error
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const BASELINE_PATH = path.join(REPO_ROOT, 'audit-reports', 'ship-validation-dashboard.json');

function loadBaseline() {
  if (!fs.existsSync(BASELINE_PATH)) {
    console.error(`[regression] no baseline at ${BASELINE_PATH} — run admin/aggregate-ship-validation.js first`);
    process.exit(2);
  }
  return JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
}

function baselineFailCodes(baseline, relPath) {
  const entry = (baseline.per_page || []).find(p => p.path === relPath);
  if (!entry) return null; // new ship, no baseline
  return new Set(entry.fail_codes || []);
}

function runJsValidator(file) {
  const r = spawnSync('node', ['admin/validate-ship-page.js', '--json-output', file], {
    cwd: REPO_ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
  });
  if (r.status !== 0 && r.status !== 1 && r.status !== 2) {
    throw new Error(`js validator crashed for ${file}: ${r.stderr || r.stdout}`);
  }
  // The validator emits some prelude before JSON. Extract the JSON object.
  const m = r.stdout.match(/\{[\s\S]*\}\s*$/m);
  if (!m) throw new Error(`could not parse JSON from js validator for ${file}`);
  return JSON.parse(m[0]);
}

// js-side only for now: the .sh validator emits text that aggregate-ship-validation.js
// canonicalizes into "sh:<truncated message>" codes. Replicating that mapping
// here would duplicate logic; instead, the regression check restricts to js
// codes and trusts the dashboard's sh history. Pre-commit can re-aggregate if
// sh-side regression checking is needed in future.
function currentFailCodes(file) {
  const codes = new Set();
  try {
    const j = runJsValidator(file);
    for (const e of j.blocking_errors || []) {
      codes.add(`js:${e.section}/${e.rule}`);
    }
  } catch (err) {
    console.error(`[regression] js validator failed: ${err.message}`);
    codes.add('js:_validator-crashed');
  }
  return codes;
}

function baselineJsFailCodes(baseline, relPath) {
  const set = baselineFailCodes(baseline, relPath);
  if (set === null) return null;
  // Filter to js: codes only — matches what currentFailCodes returns.
  return new Set([...set].filter(c => c.startsWith('js:')));
}

function diffSets(baseSet, curSet) {
  const regressions = [];
  const fixes = [];
  for (const c of curSet) if (!baseSet.has(c)) regressions.push(c);
  for (const c of baseSet) if (!curSet.has(c)) fixes.push(c);
  return { regressions, fixes };
}

function checkOne(file, baseline) {
  const rel = path.relative(REPO_ROOT, path.resolve(file)).replace(/\\/g, '/');
  const base = baselineJsFailCodes(baseline, rel);
  if (base === null) {
    console.log(`[regression] ${rel}: NEW ship (no baseline) — skipping diff`);
    return { regressions: [], fixes: [], new_ship: true };
  }
  const cur = currentFailCodes(file);
  const { regressions, fixes } = diffSets(base, cur);
  return { regressions, fixes, new_ship: false, rel };
}

function main() {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error('usage: check-ship-regression.cjs <ships/.../*.html> [...]');
    process.exit(2);
  }
  const baseline = loadBaseline();
  let totalRegressions = 0;
  let totalFixes = 0;
  for (const f of files) {
    const result = checkOne(f, baseline);
    if (result.new_ship) continue;
    if (result.regressions.length === 0 && result.fixes.length === 0) {
      console.log(`[regression] ${result.rel}: clean — no diff vs baseline`);
      continue;
    }
    if (result.fixes.length) {
      console.log(`[regression] ${result.rel}: FIXED ${result.fixes.length} rule(s):`);
      for (const c of result.fixes) console.log(`    ✓ ${c}`);
      totalFixes += result.fixes.length;
    }
    if (result.regressions.length) {
      console.log(`[regression] ${result.rel}: REGRESSED ${result.regressions.length} rule(s):`);
      for (const c of result.regressions) console.log(`    ✗ ${c}`);
      totalRegressions += result.regressions.length;
    }
  }
  console.log(`\n[regression] summary: ${totalFixes} fix(es), ${totalRegressions} regression(s)`);
  process.exit(totalRegressions > 0 ? 1 : 0);
}

main();
