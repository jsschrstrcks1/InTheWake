#!/usr/bin/env node
/**
 * v3 B1 triage scanner — observation-only, asserts no canonical.
 *
 * For each ship currently flagged with internal_numeric_inconsistency in
 * audit-reports/ship-validation-dashboard.json:
 *   - extracts the conflicting integer pair from the validator message
 *   - locates each integer in the ship's HTML, recording line numbers and
 *     a short context snippet around each occurrence
 *   - emits a markdown table per ship listing where each number appears
 *
 * The scanner deliberately does NOT pick a canonical, does NOT recommend an
 * edit, and does NOT consult any LLM. Its only job is to surface the
 * evidence so a human (or a B2 historic-ship-verifier with external authority
 * sources) can decide.
 *
 * Output: audit-reports/internal-consistency/_triage.md
 *
 * Usage:
 *   node admin/b1-triage-scan.cjs [--rule=data_consistency/internal_numeric_inconsistency]
 *
 * See admin/SHIP_STANDARDIZATION_PLAN_V3.md § 5 (B1) and § 7.5 (authority hierarchy).
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const DASHBOARD = path.join(REPO_ROOT, 'audit-reports', 'ship-validation-dashboard.json');
const OUT = path.join(REPO_ROOT, 'audit-reports', 'internal-consistency', '_triage.md');
const RULE_FAIL_CODE = 'js:data_consistency/internal_numeric_inconsistency';

function flaggedShips() {
  const dash = JSON.parse(fs.readFileSync(DASHBOARD, 'utf8'));
  return (dash.per_page || [])
    .filter(p => (p.fail_codes || []).includes(RULE_FAIL_CODE))
    .map(p => p.path);
}

function runJsValidator(file) {
  const r = spawnSync('node', ['admin/validate-ship-page.js', '--json-output', file], {
    cwd: REPO_ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
  });
  const m = r.stdout.match(/\{[\s\S]*\}\s*$/m);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

function extractConflictNumbers(blockingError) {
  // message format: "Page has 2 distinct guest-count numbers in non-\"maximum\"
  // contexts: 5,374, 5,000. Canonical is double-occupancy ..."
  // The numbers themselves contain commas as thousands separators; the list
  // separator is ", ". Match the comma-formatted integers directly.
  const m = blockingError.message.match(/contexts:\s*([^.]+)\./);
  if (!m) return [];
  return m[1].match(/\d{1,3}(?:,\d{3})+/g) || [];
}

function locateOccurrences(file, needle) {
  const html = fs.readFileSync(path.join(REPO_ROOT, file), 'utf8');
  const lines = html.split('\n');
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(needle)) {
      const ctx = lines[i].trim().slice(0, 140);
      const surface = inferSurface(lines[i]);
      hits.push({ line: i + 1, surface, ctx });
    }
  }
  return hits;
}

function inferSurface(rawLine) {
  // Best-effort label of which page surface this line lives on. Observational only.
  const l = rawLine.toLowerCase();
  if (l.includes('"@type"') || l.includes('application/ld+json')) return 'JSON-LD';
  if (l.includes('answer-first:'))                                 return 'ai-breadcrumbs/answer-first';
  if (l.includes('ai-summary'))                                    return 'meta[ai-summary]';
  if (l.includes('og:description') || l.includes('twitter:description') || l.includes('"description"')) return 'meta-description';
  if (l.includes('faq') || l.includes('"name": "how big'))         return 'FAQ';
  if (l.includes('fact-block'))                                    return 'fact-block';
  if (l.includes('quick answer'))                                  return 'Quick Answer';
  if (l.includes('ship-stats-fallback'))                           return 'ship-stats-fallback';
  if (l.includes('class="badge"'))                                 return 'header badge';
  if (l.includes('stat-value') || l.includes('stat-label'))        return 'stat-item';
  if (l.includes('<dt>guests') || l.includes('<dd>'))              return 'key-facts <dl>';
  if (l.includes('<li><strong>guests:'))                           return 'fact-block bullet';
  if (l.startsWith('<p>') || l.includes('<p class="content-text"')) return 'narrative prose';
  if (l.includes('<p>'))                                           return 'narrative prose';
  return 'other';
}

function renderShipTable(file, pairs) {
  const out = [];
  out.push(`### \`${file}\``);
  out.push('');
  for (const { number, hits } of pairs) {
    out.push(`**${number}** — ${hits.length} occurrence${hits.length === 1 ? '' : 's'}`);
    out.push('');
    out.push('| Line | Surface | Context |');
    out.push('|---|---|---|');
    for (const h of hits) {
      const ctx = h.ctx.replace(/\|/g, '\\|');
      out.push(`| ${h.line} | ${h.surface} | \`${ctx}\` |`);
    }
    out.push('');
  }
  return out.join('\n');
}

function main() {
  const ships = flaggedShips();
  console.log(`[b1-triage] scanning ${ships.length} flagged ships…`);

  const sections = [];
  let processed = 0;
  for (const file of ships) {
    const v = runJsValidator(file);
    if (!v) { console.warn(`  skip ${file} — validator did not emit JSON`); continue; }
    const err = (v.blocking_errors || []).find(e =>
      `${e.section}/${e.rule}` === 'data_consistency/internal_numeric_inconsistency');
    if (!err) continue;
    const numbers = extractConflictNumbers(err);
    if (numbers.length < 2) {
      console.warn(`  skip ${file} — could not parse conflict numbers from message`);
      continue;
    }
    const pairs = numbers.map(n => ({ number: n, hits: locateOccurrences(file, n) }));
    sections.push(renderShipTable(file, pairs));
    processed++;
    if (processed % 10 === 0) console.log(`  scanned ${processed}/${ships.length}…`);
  }

  const header = [
    '# B1 internal-consistency — triage inventory',
    '',
    '**Generated:** ' + new Date().toISOString(),
    '**Source:** `audit-reports/ship-validation-dashboard.json` per_page where `fail_codes` includes `' + RULE_FAIL_CODE + '`.',
    '**Scope:** observational only — every conflicting integer is recorded with line number and surface label. **No canonical is asserted.**',
    '',
    'This file is a worklist. Each ship row needs a tier-1 (Equasis / classification society) or tier-2 (cruise-line press archive) source per `SHIP_STANDARDIZATION_PLAN_V3.md` § 7.5 before any edit. The B2 historic-ship-verifier skill is the intended path; B1 should not run ahead of it without explicit per-ship citations.',
    '',
    `**Ships scanned:** ${processed}/${ships.length}`,
    '',
    '## Per-ship inventory',
    '',
  ].join('\n');

  fs.writeFileSync(OUT, header + sections.join('\n\n') + '\n');
  console.log(`[b1-triage] wrote ${OUT} (${processed} ships)`);
}

main();
