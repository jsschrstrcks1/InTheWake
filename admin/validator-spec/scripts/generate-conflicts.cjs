#!/usr/bin/env node
/**
 * generate-conflicts.js — Regenerate CONFLICTS.md with every V-S-conflict rule.
 *
 * For each rule with provenance: V-S-conflict, emit a side-by-side summary linking to the rule file.
 * Decision=UNRESOLVED rules get a 🔴 marker; FINAL rules get a ✓ marker and are grouped below.
 *
 * Usage:
 *   node admin/validator-spec/scripts/generate-conflicts.js
 *
 * Soli Deo Gloria.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const SPEC_ROOT = path.resolve(__dirname, '..');
const RULES_DIR = path.join(SPEC_ROOT, 'rules');
const CONFLICTS = path.join(SPEC_ROOT, 'CONFLICTS.md');

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

function main() {
  if (!fs.existsSync(RULES_DIR)) {
    console.error(`rules directory not found: ${RULES_DIR}`);
    process.exit(1);
  }
  const ruleFiles = fs.readdirSync(RULES_DIR).filter((f) => f.endsWith('.md')).sort();
  const unresolved = [];
  const resolved = [];
  for (const f of ruleFiles) {
    const text = fs.readFileSync(path.join(RULES_DIR, f), 'utf8');
    const fm = parseFrontMatter(text);
    if (!fm || fm.provenance !== 'V-S-conflict') continue;
    const entry = {
      id: fm.id,
      name: fm.name,
      severity: fm.severity,
      decision: fm.decision,
      file: `rules/${f}`,
    };
    if (fm.decision === 'UNRESOLVED') unresolved.push(entry);
    else resolved.push(entry);
  }

  const lines = [];
  if (unresolved.length === 0 && resolved.length === 0) {
    lines.push(`_No V-S-conflict rules recorded._`);
  } else {
    if (unresolved.length > 0) {
      lines.push(`## 🔴 Unresolved (${unresolved.length}) — awaiting user sign-off\n`);
      lines.push(`| ID | Name | Severity | Rule file |`);
      lines.push(`|---|---|---|---|`);
      unresolved.forEach((e) => lines.push(`| [\`${e.id}\`](${e.file}) | ${e.name} | ${e.severity} | [${e.file}](${e.file}) |`));
      lines.push(``);
    }
    if (resolved.length > 0) {
      lines.push(`## ✓ Resolved (${resolved.length}) — user signed off\n`);
      lines.push(`| ID | Name | Severity | Rule file |`);
      lines.push(`|---|---|---|---|`);
      resolved.forEach((e) => lines.push(`| [\`${e.id}\`](${e.file}) | ${e.name} | ${e.severity} | [${e.file}](${e.file}) |`));
      lines.push(``);
    }
  }
  const newBlock = lines.join('\n');
  const existing = fs.readFileSync(CONFLICTS, 'utf8');
  const updated = existing.replace(
    /<!-- CONFLICTS-START -->[\s\S]*?<!-- CONFLICTS-END -->/,
    `<!-- CONFLICTS-START -->\n${newBlock}\n<!-- CONFLICTS-END -->`
  );
  if (updated === existing) {
    console.log(`CONFLICTS.md already up to date (unresolved: ${unresolved.length}, resolved: ${resolved.length}).`);
    return;
  }
  fs.writeFileSync(CONFLICTS, updated, 'utf8');
  console.log(`CONFLICTS.md regenerated. Unresolved: ${unresolved.length}. Resolved: ${resolved.length}.`);
}

main();
