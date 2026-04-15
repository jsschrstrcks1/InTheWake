#!/usr/bin/env node
/**
 * find-orphans.js — Anti-zombie linter for the validator spec.
 *
 * Exit codes:
 *   0 — clean. All rule files have required fields. Orphan rules (implementation: none)
 *       are acceptable when provenance: S-only; counted and reported.
 *   1 — data-integrity failure. Missing required fields, check: TBD, malformed front-matter,
 *       or a V-only rule with implementation: none (contradiction).
 *
 * Side effect: rewrites ORPHANS.md with the current list of rules whose
 *              implementation: none.
 *
 * Usage:
 *   node admin/validator-spec/scripts/find-orphans.js          # check + write ORPHANS.md
 *   node admin/validator-spec/scripts/find-orphans.js --check  # check only, no writes
 *
 * Soli Deo Gloria.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const SPEC_ROOT = path.resolve(__dirname, '..');
const RULES_DIR = path.join(SPEC_ROOT, 'rules');
const ORPHANS_FILE = path.join(SPEC_ROOT, 'ORPHANS.md');
const CATEGORIES_FILE = path.join(SPEC_ROOT, 'CATEGORIES.md');

const CHECK_ONLY = process.argv.includes('--check');

const REQUIRED_FIELDS = [
  'id', 'name', 'family', 'severity', 'applies-to',
  'provenance', 'status', 'implementation', 'check',
  'standards-source', 'standards-backfill', 'decision', 'last-updated',
];

const SEVERITY_VALUES = new Set(['error', 'warn', 'info']);
const PROVENANCE_VALUES = new Set(['V+S-agree', 'V-only', 'S-only', 'V-S-conflict']);
const STATUS_VALUES = new Set(['live', 'proposed', 'deprecated']);
const DECISION_VALUES = new Set(['FINAL', 'UNRESOLVED']);
const BACKFILL_VALUES = new Set(['yes', 'no']);
const APPLIES_TO_VALUES = new Set(['port', 'ship', 'venue', 'root', 'logbook', 'solo', 'cruise-line', 'tool', 'all']);

const ID_PATTERN = /^[A-Z][A-Z0-9]{2,6}-\d{3,4}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function loadFamilies() {
  if (!fs.existsSync(CATEGORIES_FILE)) {
    return null;
  }
  const content = fs.readFileSync(CATEGORIES_FILE, 'utf8');
  const families = new Set();
  // Pull codes from the Active families table: `| `CODE` | ...`
  const lineRegex = /\|\s*`([A-Z][A-Z0-9]{2,6})`\s*\|/g;
  let match;
  while ((match = lineRegex.exec(content)) !== null) {
    families.add(match[1]);
  }
  // Also accept family-name slugs used in front-matter (e.g., "image", "theological", ...)
  // by mapping the CODE -> first-column reading. But for parse robustness, we also accept
  // lowercase versions of CATEGORIES Name column:
  return families;
}

/**
 * Parse the YAML-like front-matter block between --- markers.
 * Supports: scalars, lists of scalars, lists of objects (one level deep).
 * Returns { fm: object, fmEnd: number } or null if no front-matter.
 */
function parseFrontMatter(text) {
  const lines = text.split('\n');
  if (lines[0] !== '---') return null;
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') { end = i; break; }
  }
  if (end === -1) return null;

  const fm = {};
  let currentKey = null;
  let currentList = null;
  let currentObj = null;

  for (let i = 1; i < end; i++) {
    const line = lines[i];
    if (/^\s*$/.test(line) || /^\s*#/.test(line)) continue;

    // Top-level key: value  (value may be empty — list follows)
    const topMatch = line.match(/^([a-zA-Z][\w-]*):\s*(.*)$/);
    if (topMatch && !line.startsWith(' ') && !line.startsWith('\t')) {
      currentKey = topMatch[1];
      const rawValue = topMatch[2].trim();
      if (rawValue === '' || rawValue === undefined) {
        fm[currentKey] = [];
        currentList = fm[currentKey];
        currentObj = null;
      } else {
        fm[currentKey] = stripQuotes(rawValue);
        currentList = null;
        currentObj = null;
      }
      continue;
    }

    // List item (scalar): "  - foo"
    const scalarListMatch = line.match(/^\s+-\s+(.+)$/);
    if (scalarListMatch && currentList !== null) {
      const val = scalarListMatch[1].trim();
      // Is it "key: value" (start of a list-of-objects entry)?
      const kvMatch = val.match(/^([a-zA-Z][\w-]*):\s*(.*)$/);
      if (kvMatch) {
        currentObj = { [kvMatch[1]]: stripQuotes(kvMatch[2].trim()) };
        currentList.push(currentObj);
      } else {
        currentList.push(stripQuotes(val));
        currentObj = null;
      }
      continue;
    }

    // Continuation of an object in a list: "    key: value"
    const objContMatch = line.match(/^\s{4,}([a-zA-Z][\w-]*):\s*(.*)$/);
    if (objContMatch && currentObj !== null) {
      currentObj[objContMatch[1]] = stripQuotes(objContMatch[2].trim());
      continue;
    }
  }

  // Convert any "fieldname: none" or "fieldname: silent" scalars from array-coerced to the literal string.
  // They come through as empty lists when the writer used inline scalar.
  // If fm.implementation is [] and the raw line was e.g. "implementation: none", we need the literal.
  // Handle this by re-scanning for scalar overrides:
  for (let i = 1; i < end; i++) {
    const m = lines[i].match(/^([a-zA-Z][\w-]*):\s*(\S.*)$/);
    if (!m) continue;
    if (m[1] in fm && (fm[m[1]] === '' || (Array.isArray(fm[m[1]]) && fm[m[1]].length === 0))) {
      const scalarVal = stripQuotes(m[2].trim());
      if (scalarVal && scalarVal !== '|' && scalarVal !== '>') {
        fm[m[1]] = scalarVal;
      }
    }
  }

  return { fm, fmEnd: end };
}

function stripQuotes(s) {
  if (typeof s !== 'string') return s;
  const trimmed = s.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function lintRule(filePath, fm, body, families) {
  const errs = [];
  const warnings = [];
  const missing = REQUIRED_FIELDS.filter((f) => !(f in fm));
  missing.forEach((f) => errs.push(`missing required field: ${f}`));

  if ('id' in fm && !ID_PATTERN.test(fm.id)) {
    errs.push(`id "${fm.id}" does not match FAM-NNN pattern`);
  }

  if ('severity' in fm && !SEVERITY_VALUES.has(fm.severity)) {
    errs.push(`severity "${fm.severity}" not in {error, warn, info}`);
  }

  if ('provenance' in fm && !PROVENANCE_VALUES.has(fm.provenance)) {
    errs.push(`provenance "${fm.provenance}" not in {V+S-agree, V-only, S-only, V-S-conflict}`);
  }

  if ('status' in fm && !STATUS_VALUES.has(fm.status)) {
    errs.push(`status "${fm.status}" not in {live, proposed, deprecated}`);
  }

  if ('decision' in fm && !DECISION_VALUES.has(fm.decision)) {
    errs.push(`decision "${fm.decision}" not in {FINAL, UNRESOLVED}`);
  }

  if ('standards-backfill' in fm && !BACKFILL_VALUES.has(fm['standards-backfill'])) {
    errs.push(`standards-backfill "${fm['standards-backfill']}" not in {yes, no}`);
  }

  if ('last-updated' in fm && !DATE_PATTERN.test(fm['last-updated'])) {
    errs.push(`last-updated "${fm['last-updated']}" not ISO YYYY-MM-DD`);
  }

  if ('applies-to' in fm) {
    const values = Array.isArray(fm['applies-to']) ? fm['applies-to'] : [fm['applies-to']];
    if (values.length === 0) {
      errs.push(`applies-to must be non-empty`);
    } else {
      values.forEach((v) => {
        if (!APPLIES_TO_VALUES.has(v)) {
          errs.push(`applies-to value "${v}" not in allowed set`);
        }
      });
    }
  }

  if ('family' in fm && families && families.size > 0) {
    // Allow the family field to be lowercase/slug form or the CODE; we accept anything that
    // maps to a known CODE by case-insensitive prefix match on CATEGORIES.md names.
    // For strictness, also accept raw family name lowercased (image, theological, ...).
    // We don't enforce here — families are checked via id prefix instead.
  }

  if ('id' in fm && families && families.size > 0) {
    const prefix = fm.id.split('-')[0];
    if (!families.has(prefix)) {
      errs.push(`id prefix "${prefix}" not in CATEGORIES.md active families`);
    }
  }

  if ('check' in fm) {
    const check = String(fm.check || '').trim();
    if (check === '' || check.toUpperCase() === 'TBD') {
      errs.push(`check must be non-empty and not "TBD" (got: "${fm.check}")`);
    }
  }

  // implementation: either the literal string "none" / "llm-review" or a list of {file, function?, lines?} entries.
  const impl = fm.implementation;
  const implIsNone = typeof impl === 'string' && (impl === 'none' || impl === 'llm-review');
  const implIsList = Array.isArray(impl) && impl.length > 0 && impl.every((e) => e && typeof e === 'object' && 'file' in e);
  if (!implIsNone && !implIsList) {
    errs.push(`implementation must be "none", "llm-review", or a non-empty list of {file, ...} entries`);
  }

  // standards-source: literal "silent" or list of {doc, section?} entries.
  const src = fm['standards-source'];
  const srcIsSilent = src === 'silent';
  const srcIsList = Array.isArray(src) && src.length > 0 && src.every((e) => e && typeof e === 'object' && 'doc' in e);
  if (!srcIsSilent && !srcIsList) {
    errs.push(`standards-source must be "silent" or a non-empty list of {doc, ...} entries`);
  }

  // Consistency checks.
  if (fm.provenance === 'V-only' && implIsNone && impl === 'none') {
    errs.push(`V-only rule cannot have implementation: none (paradox). Either cite the validator or change provenance.`);
  }
  if (fm.provenance === 'V-only' && !srcIsSilent) {
    warnings.push(`V-only provenance usually pairs with standards-source: silent; got a doc citation. Intentional?`);
  }
  if (fm.provenance === 'S-only' && implIsList && impl[0].file !== 'none') {
    warnings.push(`S-only provenance usually pairs with implementation: none; got a code citation. Intentional?`);
  }
  if (fm.provenance === 'V-S-conflict' && fm.decision === 'FINAL') {
    // Allowed — user has signed off on the conflict.
  }
  if (fm.provenance !== 'V-S-conflict' && fm.decision === 'UNRESOLVED') {
    errs.push(`decision: UNRESOLVED only permitted for V-S-conflict (provenance is ${fm.provenance})`);
  }

  // V-S-conflict body must contain Implications and Recommendation sections.
  if (fm.provenance === 'V-S-conflict') {
    if (!/^##\s+Implications/m.test(body)) errs.push(`V-S-conflict rule missing "## Implications" section`);
    if (!/^##\s+Recommendation/m.test(body)) errs.push(`V-S-conflict rule missing "## Recommendation" section`);
  }

  return { errs, warnings };
}

function main() {
  if (!fs.existsSync(RULES_DIR)) {
    console.error(`rules directory not found: ${RULES_DIR}`);
    process.exit(1);
  }

  const families = loadFamilies();

  const ruleFiles = fs.readdirSync(RULES_DIR)
    .filter((f) => f.endsWith('.md'))
    .sort();

  const orphans = [];
  const errors = [];
  const warnings = [];
  let totalRules = 0;
  const seenIds = new Set();

  for (const f of ruleFiles) {
    const fullPath = path.join(RULES_DIR, f);
    const rel = path.relative(SPEC_ROOT, fullPath);
    const text = fs.readFileSync(fullPath, 'utf8');
    const parsed = parseFrontMatter(text);
    if (!parsed) {
      errors.push(`${rel}: missing or malformed front-matter`);
      continue;
    }
    const body = text.split('\n').slice(parsed.fmEnd + 1).join('\n');
    const { errs, warnings: fileWarnings } = lintRule(fullPath, parsed.fm, body, families);
    errs.forEach((e) => errors.push(`${rel}: ${e}`));
    fileWarnings.forEach((w) => warnings.push(`${rel}: ${w}`));
    totalRules += 1;

    if (parsed.fm.id) {
      // Cross-check filename matches id
      const expectedName = `${parsed.fm.id}.md`;
      if (f !== expectedName) {
        errors.push(`${rel}: filename does not match id "${parsed.fm.id}" (expected ${expectedName})`);
      }
      if (seenIds.has(parsed.fm.id)) {
        errors.push(`${rel}: duplicate id "${parsed.fm.id}"`);
      }
      seenIds.add(parsed.fm.id);
    }

    if (parsed.fm.implementation === 'none') {
      orphans.push({ id: parsed.fm.id, name: parsed.fm.name, provenance: parsed.fm.provenance, file: rel });
    }
  }

  // Write ORPHANS.md (unless --check)
  if (!CHECK_ONLY) {
    const existingOrphans = fs.existsSync(ORPHANS_FILE) ? fs.readFileSync(ORPHANS_FILE, 'utf8') : '';
    const newBlock = renderOrphansBlock(orphans);
    const updated = existingOrphans.replace(
      /<!-- ORPHANS-START -->[\s\S]*?<!-- ORPHANS-END -->/,
      `<!-- ORPHANS-START -->\n${newBlock}\n<!-- ORPHANS-END -->`
    );
    if (updated !== existingOrphans) {
      fs.writeFileSync(ORPHANS_FILE, updated, 'utf8');
      console.log(`Wrote ORPHANS.md with ${orphans.length} orphan rule(s).`);
    }
  }

  // Report
  console.log(`\n=== Validator Spec Lint ===`);
  console.log(`Rules checked: ${totalRules}`);
  console.log(`Orphan rules (implementation: none): ${orphans.length}`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);

  if (errors.length > 0) {
    console.log(`\nERRORS:`);
    errors.forEach((e) => console.log(`  - ${e}`));
  }
  if (warnings.length > 0) {
    console.log(`\nWARNINGS:`);
    warnings.forEach((w) => console.log(`  - ${w}`));
  }

  if (errors.length > 0) {
    process.exit(1);
  }
  process.exit(0);
}

function renderOrphansBlock(orphans) {
  if (orphans.length === 0) {
    return `_(No orphan rules. The spec is clean.)_`;
  }
  const byProvenance = {};
  orphans.forEach((o) => {
    const key = o.provenance || 'unknown';
    if (!byProvenance[key]) byProvenance[key] = [];
    byProvenance[key].push(o);
  });
  const sections = [];
  for (const prov of ['S-only', 'V-only', 'V+S-agree', 'V-S-conflict', 'unknown']) {
    if (!byProvenance[prov]) continue;
    sections.push(`### provenance: ${prov}\n`);
    sections.push(`| ID | Name | File |`);
    sections.push(`|---|---|---|`);
    byProvenance[prov].forEach((o) => {
      sections.push(`| \`${o.id}\` | ${o.name} | [${o.file}](${o.file.replace(/^admin\/validator-spec\//, '')}) |`);
    });
    sections.push(``);
  }
  return sections.join('\n');
}

main();
