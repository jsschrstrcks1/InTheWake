#!/usr/bin/env node
/**
 * fix-msc-structural.js
 *
 * Phase 4: MSC-specific structural fixes on all 24 MSC ship pages.
 *
 *   FIX-4.1: Correct ship name capitalization "Msc " → "MSC " in:
 *             - heading text content
 *             - aria-label attribute values
 *             - alt attribute values
 *             (Does NOT change src, href, id, class, or filename strings)
 *
 *   FIX-4.2: Move data-imo from <main> to the tracker <section>
 *             (section with aria-labelledby="liveTrackHeading")
 *
 * Usage:
 *   node scripts/fix-msc-structural.js [--dry-run]
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT    = path.join(__dirname, '..');
const MSC_DIR = path.join(ROOT, 'ships/msc');
const DRY_RUN = process.argv.includes('--dry-run');

let totalFiles   = 0;
let changedFiles = 0;
const fixCounts  = { capitalization: 0, imoMove: 0 };

/**
 * FIX-4.1: Capitalise "Msc " → "MSC " in visible text attributes and heading/label content.
 *
 * Only applies inside:
 *   - aria-label="..."
 *   - alt="..."
 *   - tag text nodes via a text-content regex (targets heading tags)
 *
 * Uses negative lookbehind on = to avoid matching inside src= or href= values
 * by replacing specifically within attribute value contexts and heading content.
 */
function fixCapitalization(html) {
  let result = html;

  // Replace in aria-label="..." values
  result = result.replace(/(aria-label="[^"]*?)Msc ([^"]*")/g, '$1MSC $2');

  // Replace in alt="..." values
  result = result.replace(/(alt="[^"]*?)Msc ([^"]*")/g, '$1MSC $2');

  // Replace in heading/div text content (between > and <)
  // Matches "Msc " when it appears between a closing > and the next <
  result = result.replace(/>([^<]*?)Msc ([^<]*?)</g, '>$1MSC $2<');

  return result;
}

/**
 * FIX-4.2: Move data-imo from <main ...> to <section ... aria-labelledby="liveTrackHeading">.
 *
 * Pattern on MSC pages:
 *   <main class="wrap" id="content" role="main" data-imo="XXXXXXX">
 *   ...
 *   <section class="card" aria-labelledby="liveTrackHeading">
 *
 * Target:
 *   <main class="wrap" id="content" role="main">
 *   ...
 *   <section class="card" aria-labelledby="liveTrackHeading" data-imo="XXXXXXX">
 */
function fixImoPlacement(html) {
  // Extract IMO from <main>
  const imoMatch = html.match(/<main\b[^>]*?\sdata-imo="(\d+)"[^>]*>/);
  if (!imoMatch) return html; // nothing to do (already fixed or not present)

  const imo = imoMatch[1];

  // Remove data-imo from <main>
  let result = html.replace(
    /(<main\b[^>]*?)\s*data-imo="\d+"([^>]*>)/,
    '$1$2'
  );

  // Add data-imo to the tracker section
  result = result.replace(
    /(<section\s[^>]*?aria-labelledby="liveTrackHeading"[^>]*?)>/,
    `$1 data-imo="${imo}">`
  );

  return result;
}

// ─── main ────────────────────────────────────────────────────────────────────

if (!fs.existsSync(MSC_DIR)) {
  console.error(`MSC directory not found: ${MSC_DIR}`);
  process.exit(1);
}

const files = fs.readdirSync(MSC_DIR)
  .filter(f => f.endsWith('.html') && f !== 'index.html');

for (const file of files) {
  const fullPath = path.join(MSC_DIR, file);
  const original = fs.readFileSync(fullPath, 'utf8');
  totalFiles++;

  let updated = original;
  let changed = false;

  const afterCap = fixCapitalization(updated);
  if (afterCap !== updated) { fixCounts.capitalization++; changed = true; }
  updated = afterCap;

  const afterImo = fixImoPlacement(updated);
  if (afterImo !== updated) { fixCounts.imoMove++; changed = true; }
  updated = afterImo;

  if (changed) {
    changedFiles++;
    if (!DRY_RUN) {
      fs.writeFileSync(fullPath, updated, 'utf8');
    }
    console.log(`  ${DRY_RUN ? '[DRY]' : '[FIX]'} ships/msc/${file}`);
  }
}

console.log('\n' + '='.repeat(60));
console.log('fix-msc-structural.js SUMMARY');
console.log('='.repeat(60));
console.log(`Files scanned:   ${totalFiles}`);
console.log(`Files changed:   ${changedFiles}${DRY_RUN ? ' (dry run)' : ''}`);
console.log(`  FIX-4.1 (cap): ${fixCounts.capitalization} files`);
console.log(`  FIX-4.2 (imo): ${fixCounts.imoMove} files`);
