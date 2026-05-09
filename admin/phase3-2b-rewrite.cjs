#!/usr/bin/env node
/**
 * Phase 3.2b — apply ai-summary rewrites for ships whose existing
 * ai-summary contains boilerplate. Reads a JSON map of file path =>
 * new ai-summary content, replaces the <meta name="ai-summary"> tag's
 * content, then propagates the new value into <meta name="description">
 * and any JSON-LD `description` fields whose old value contained the
 * "deck plans, live tracker" boilerplate marker.
 *
 * Usage: node admin/phase3-2b-rewrite.cjs <map.json>
 *
 * Idempotent: a file already aligned to the new value is a no-op.
 */
const fs = require('fs');
const path = require('path');

const BOILERPLATE_VALUE_RE = /"([^"]*deck plans, live tracker[^"]*In the Wake\.)"/g;
const META_AI_SUMMARY_RE = /(<meta\s+name="ai-summary"\s+content=")[^"]*("\s*\/?>)/i;

function escapeForRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const mapPath = process.argv[2];
if (!mapPath) {
  console.error('Usage: node admin/phase3-2b-rewrite.cjs <map.json>');
  process.exit(1);
}

const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
let totalFiles = 0;
let totalReplacements = 0;

for (const [file, newSummary] of Object.entries(map)) {
  if (newSummary.length > 250) {
    console.error(`SKIP (>250 chars: ${newSummary.length}): ${file}`);
    continue;
  }
  const abs = path.resolve(file);
  if (!fs.existsSync(abs)) {
    console.error(`SKIP (not found): ${file}`);
    continue;
  }
  let html = fs.readFileSync(abs, 'utf8');

  const oldMatch = html.match(META_AI_SUMMARY_RE);
  if (!oldMatch) {
    console.error(`SKIP (no ai-summary tag): ${file}`);
    continue;
  }
  const oldSummary = html.match(/<meta\s+name="ai-summary"\s+content="([^"]+)"/i)[1];

  let count = 0;

  // 1) Replace the ai-summary tag itself
  html = html.replace(META_AI_SUMMARY_RE, `$1${newSummary}$2`);
  count += 1;

  // 2) Replace any boilerplate-marked description values with the new summary
  html = html.replace(BOILERPLATE_VALUE_RE, () => {
    count += 1;
    return `"${newSummary}"`;
  });

  // 3) Replace any literal copies of the OLD ai-summary value (e.g. JSON-LD
  //    descriptions that mirrored the old ai-summary verbatim, not just the
  //    boilerplate phrase). Only if old != new and old wasn't itself the
  //    boilerplate marker (already handled above).
  if (oldSummary !== newSummary && !oldSummary.includes('deck plans, live tracker')) {
    const oldRe = new RegExp(`"${escapeForRegex(oldSummary)}"`, 'g');
    html = html.replace(oldRe, () => {
      count += 1;
      return `"${newSummary}"`;
    });
  }

  fs.writeFileSync(abs, html);
  totalFiles += 1;
  totalReplacements += count;
  console.log(`OK   ${file} (${count} replacement${count === 1 ? '' : 's'}, ${newSummary.length} chars)`);
}

console.log(`\nDONE: ${totalFiles} file${totalFiles === 1 ? '' : 's'} updated, ${totalReplacements} replacement${totalReplacements === 1 ? '' : 's'} total.`);
