#!/usr/bin/env node
/**
 * fix-template-blockers.js
 *
 * Applies all three Phase 1 blocking fixes to every ship HTML page:
 *
 *   BLOCKING-1: Review schema @type "Vehicle" → "Cruise" + add description
 *   BLOCKING-2: initFirstLook Swiper loop:true → loop:false, rewind:false
 *   BLOCKING-3: Skip link href="#main-content" → href="#content"
 *
 * Usage:
 *   node scripts/fix-template-blockers.js [--dry-run]
 *
 * --dry-run  Print changes without writing files.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT     = path.join(__dirname, '..');
const DRY_RUN  = process.argv.includes('--dry-run');

// All cruise-line ship directories (matches batch-validate-ships.js)
const SHIP_DIRS = [
  'ships/rcl',
  'ships/carnival',
  'ships/celebrity-cruises',
  'ships/norwegian',
  'ships/princess',
  'ships/holland-america-line',
  'ships/msc',
  'ships/costa',
  'ships/cunard',
  'ships/oceania',
  'ships/regent',
  'ships/seabourn',
  'ships/silversea',
  'ships/explora-journeys',
  'ships/virgin-voyages',
];

// Non-ship HTML files to skip
const EXCLUDE_FILES = new Set([
  'ships/rcl/venues.html',
  'ships/rcl/legend-of-the-seas-1995-built.html',
]);

// ─── helpers ────────────────────────────────────────────────────────────────

function extractAiBreadcrumb(html, key) {
  const re = new RegExp(`${key}:\\s*([^\\n]+)`);
  const m  = html.match(re);
  return m ? m[1].trim() : null;
}

/**
 * BLOCKING-1
 * Replace "itemReviewed":{"@type":"Vehicle", ...}
 * with    "itemReviewed":{"@type":"Cruise","description":"A {class} ship operated by {line}.","name":...
 *
 * The inline Review JSON has the form:
 *   "itemReviewed":{"@type":"Vehicle","name":"SHIP","brand":{...}}
 * We insert @type:Cruise and add description after @type.
 */
function fixReviewSchema(html, shipClass, cruiseLine) {
  // Replace @type:Vehicle inside itemReviewed with @type:Cruise + description
  // Pattern is tightly packed JSON on one line
  const desc = shipClass
    ? `A ${shipClass} ship operated by ${cruiseLine}.`
    : `A ship operated by ${cruiseLine}.`;

  return html.replace(
    /"itemReviewed":\{"@type":"Vehicle","name":"([^"]+)"/g,
    `"itemReviewed":{"@type":"Cruise","description":"${desc}","name":"$1"`
  );
}

/**
 * BLOCKING-2
 * Replace the initFirstLook Swiper constructor.
 * Current:  new Swiper(c,{loop:true,autoplay:{...},pagination:{...},navigation:{...}})
 * Required: new Swiper(c,{loop:false,rewind:false,lazy:true,autoplay:{...},pagination:{...},navigation:{...}})
 */
function fixSwiper(html) {
  // Match the initFirstLook Swiper call — it always starts with loop:true
  return html.replace(
    /new Swiper\(c,\{loop:true,/g,
    'new Swiper(c,{loop:false,rewind:false,lazy:true,'
  );
}

/**
 * BLOCKING-3
 * Fix skip link target.
 * Current:  href="#main-content"
 * Required: href="#content"
 */
function fixSkipLink(html) {
  return html.replace(/href="#main-content"/g, 'href="#content"');
}

/**
 * BLOCKING-4
 * Fix initVideos Swiper — missing loop:false, rewind:false.
 * Current:  new Swiper(w,{slidesPerView:
 * Required: new Swiper(w,{loop:false,rewind:false,slidesPerView:
 *
 * This is a different Swiper instance than initFirstLook (uses variable `w`
 * rather than `c`, and is in the initVideos function).
 */
function fixVideosSwiper(html) {
  return html.replace(
    /new Swiper\(w,\{slidesPerView:/g,
    'new Swiper(w,{loop:false,rewind:false,slidesPerView:'
  );
}

// ─── main ────────────────────────────────────────────────────────────────────

let totalFiles   = 0;
let changedFiles = 0;
let skippedFiles = 0;
const fixCounts  = { schema: 0, swiper: 0, skipLink: 0, videosSwiper: 0 };

for (const dir of SHIP_DIRS) {
  const fullDir = path.join(ROOT, dir);
  if (!fs.existsSync(fullDir)) continue;

  const files = fs.readdirSync(fullDir)
    .filter(f => f.endsWith('.html') && f !== 'index.html');

  for (const file of files) {
    const relPath = `${dir}/${file}`;
    if (EXCLUDE_FILES.has(relPath)) {
      skippedFiles++;
      continue;
    }

    const fullPath = path.join(ROOT, relPath);
    const original = fs.readFileSync(fullPath, 'utf8');
    totalFiles++;

    // Extract metadata from ai-breadcrumbs comment
    const shipClass  = extractAiBreadcrumb(original, 'ship-class');
    const cruiseLine = extractAiBreadcrumb(original, 'cruise-line') || 'the cruise line';

    let updated = original;
    let changed = false;

    // Apply fix 1
    const afterSchema = fixReviewSchema(updated, shipClass, cruiseLine);
    if (afterSchema !== updated) { fixCounts.schema++; changed = true; }
    updated = afterSchema;

    // Apply fix 2
    const afterSwiper = fixSwiper(updated);
    if (afterSwiper !== updated) { fixCounts.swiper++; changed = true; }
    updated = afterSwiper;

    // Apply fix 3
    const afterSkip = fixSkipLink(updated);
    if (afterSkip !== updated) { fixCounts.skipLink++; changed = true; }
    updated = afterSkip;

    // Apply fix 4
    const afterVideos = fixVideosSwiper(updated);
    if (afterVideos !== updated) { fixCounts.videosSwiper++; changed = true; }
    updated = afterVideos;

    if (changed) {
      changedFiles++;
      if (!DRY_RUN) {
        fs.writeFileSync(fullPath, updated, 'utf8');
      }
      console.log(`  ${DRY_RUN ? '[DRY]' : '[FIX]'} ${relPath}`);
    }
  }
}

console.log('\n' + '='.repeat(60));
console.log('fix-template-blockers.js SUMMARY');
console.log('='.repeat(60));
console.log(`Files scanned:       ${totalFiles}`);
console.log(`Files excluded:      ${skippedFiles}`);
console.log(`Files changed:       ${changedFiles}${DRY_RUN ? ' (dry run — not written)' : ''}`);
console.log(`  BLOCKING-1 (schema):   ${fixCounts.schema} fixes`);
console.log(`  BLOCKING-2 (swiper):   ${fixCounts.swiper} fixes`);
console.log(`  BLOCKING-3 (skiplink):     ${fixCounts.skipLink} fixes`);
console.log(`  BLOCKING-4 (videosSwiper): ${fixCounts.videosSwiper} fixes`);
