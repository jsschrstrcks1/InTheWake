#!/usr/bin/env node
/**
 * Phase 3.2b — propagate ai-summary content into description meta tag
 * and JSON-LD `description` fields, for ships where the ai-summary is
 * already specific but the description is still boilerplate.
 *
 * Usage: node admin/phase3-2b-propagate.cjs <file1> <file2> ...
 *
 * Idempotent: a file already free of the boilerplate phrase is a no-op.
 */
const fs = require('fs');
const path = require('path');

const BOILERPLATE_MARKER = 'deck plans, live tracker';
const META_AI_SUMMARY_RE = /<meta\s+name="ai-summary"\s+content="([^"]+)"\s*\/?>/i;
const META_DESC_RE = /<meta\s+name="description"\s+content="([^"]+)"\s*\/?>/i;
const BOILERPLATE_VALUE_RE = /"([^"]*deck plans, live tracker[^"]*In the Wake\.)"/g;

let totalFiles = 0;
let totalReplacements = 0;

for (const file of process.argv.slice(2)) {
  const abs = path.resolve(file);
  if (!fs.existsSync(abs)) {
    console.error(`SKIP (not found): ${file}`);
    continue;
  }
  let html = fs.readFileSync(abs, 'utf8');

  const aiMatch = html.match(META_AI_SUMMARY_RE);
  if (!aiMatch) {
    console.error(`SKIP (no ai-summary): ${file}`);
    continue;
  }
  const aiSummary = aiMatch[1];

  if (aiSummary.includes(BOILERPLATE_MARKER)) {
    console.error(`SKIP (ai-summary itself is boilerplate; needs rewrite, not propagation): ${file}`);
    continue;
  }

  let count = 0;
  const updated = html.replace(BOILERPLATE_VALUE_RE, () => {
    count += 1;
    return `"${aiSummary}"`;
  });

  if (count === 0) {
    console.log(`NOOP: ${file} (no boilerplate values found)`);
    continue;
  }

  fs.writeFileSync(abs, updated);
  totalFiles += 1;
  totalReplacements += count;
  console.log(`OK   ${file} (${count} replacement${count === 1 ? '' : 's'})`);
}

console.log(`\nDONE: ${totalFiles} file${totalFiles === 1 ? '' : 's'} updated, ${totalReplacements} replacement${totalReplacements === 1 ? '' : 's'} total.`);
