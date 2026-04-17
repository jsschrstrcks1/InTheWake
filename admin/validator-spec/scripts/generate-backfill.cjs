#!/usr/bin/env node
/**
 * generate-backfill.js — Regenerate BACKFILL.md with every rule that standards
 * must adopt during Phase 6 regeneration.
 *
 * A rule is in the backfill queue when `standards-backfill: yes`.
 * Typically these are V-only rules (validator enforces, standards silent).
 *
 * Usage:
 *   node admin/validator-spec/scripts/generate-backfill.js
 *
 * Soli Deo Gloria.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const SPEC_ROOT = path.resolve(__dirname, '..');
const RULES_DIR = path.join(SPEC_ROOT, 'rules');
const BACKFILL = path.join(SPEC_ROOT, 'BACKFILL.md');

function parseFrontMatter(text) {
  const lines = text.split('\n');
  if (lines[0] !== '---') return null;
  let end = -1;
  for (let i = 1; i < lines.length; i++) if (lines[i] === '---') { end = i; break; }
  if (end === -1) return null;
  const fm = {};
  for (let i = 1; i < end; i++) {
    const m = lines[i].match(/^([a-zA-Z][\w-]*):\s*(.*)$/);
    if (!m) continue;
    const val = m[2].trim();
    if (val) fm[m[1]] = val.replace(/^["']|["']$/g, '');
  }
  return fm;
}

function familyOf(id) { return id.split('-')[0]; }

function main() {
  if (!fs.existsSync(RULES_DIR)) {
    console.error(`rules directory not found: ${RULES_DIR}`);
    process.exit(1);
  }
  const ruleFiles = fs.readdirSync(RULES_DIR).filter((f) => f.endsWith('.md')).sort();
  const backfill = [];
  for (const f of ruleFiles) {
    const text = fs.readFileSync(path.join(RULES_DIR, f), 'utf8');
    const fm = parseFrontMatter(text);
    if (!fm || fm['standards-backfill'] !== 'yes') continue;
    backfill.push({
      id: fm.id,
      name: fm.name,
      severity: fm.severity,
      provenance: fm.provenance,
      file: `rules/${f}`,
    });
  }

  const lines = [];
  if (backfill.length === 0) {
    lines.push(`_No rules currently awaiting standards backfill._`);
  } else {
    const byFamily = {};
    backfill.forEach((r) => {
      const fam = familyOf(r.id);
      if (!byFamily[fam]) byFamily[fam] = [];
      byFamily[fam].push(r);
    });
    lines.push(`**Total:** ${backfill.length} rule(s) awaiting standards backfill during Phase 6.\n`);
    for (const fam of Object.keys(byFamily).sort()) {
      lines.push(`### ${fam} (${byFamily[fam].length})\n`);
      lines.push(`| ID | Name | Severity | Provenance |`);
      lines.push(`|---|---|---|---|`);
      byFamily[fam].forEach((r) => lines.push(`| [\`${r.id}\`](${r.file}) | ${r.name} | ${r.severity} | ${r.provenance} |`));
      lines.push(``);
    }
  }

  const newBlock = lines.join('\n');
  const existing = fs.readFileSync(BACKFILL, 'utf8');
  const updated = existing.replace(
    /<!-- BACKFILL-START -->[\s\S]*?<!-- BACKFILL-END -->/,
    `<!-- BACKFILL-START -->\n${newBlock}\n<!-- BACKFILL-END -->`
  );
  if (updated === existing) {
    console.log(`BACKFILL.md already up to date (${backfill.length} entries).`);
    return;
  }
  fs.writeFileSync(BACKFILL, updated, 'utf8');
  console.log(`BACKFILL.md regenerated with ${backfill.length} entries.`);
}

main();
