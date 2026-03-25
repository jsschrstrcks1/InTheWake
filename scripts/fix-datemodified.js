#!/usr/bin/env node
/**
 * Phase A.2 — Fix json_ld/datemodified_mismatch
 *
 * Syncs WebPage JSON-LD "dateModified" to match meta[name="last-reviewed"].
 * Skips historic ships.
 */

const fs = require('fs');
const path = require('path');

const HISTORIC_MARKERS = [
  'historical ship tribute', 'status: retired', 'retired ship',
  'retired from service', '(historical)',
];
function isHistoric(html) {
  const lower = html.toLowerCase();
  return HISTORIC_MARKERS.some(m => lower.includes(m));
}

const SHIP_DIRS = [
  'ships/rcl', 'ships/carnival', 'ships/celebrity-cruises',
  'ships/norwegian', 'ships/princess', 'ships/holland-america-line',
  'ships/msc', 'ships/costa', 'ships/cunard', 'ships/oceania',
  'ships/regent', 'ships/seabourn', 'ships/silversea',
  'ships/explora-journeys', 'ships/virgin-voyages',
];
const EXCLUDE = new Set(['ships/rcl/venues.html', 'ships/rcl/legend-of-the-seas-1995-built.html']);
const ROOT = path.join(__dirname, '..');

let fixed = 0, alreadyOk = 0, skipped = 0, noDate = 0;

for (const dir of SHIP_DIRS) {
  const absDir = path.join(ROOT, dir);
  if (!fs.existsSync(absDir)) continue;

  for (const file of fs.readdirSync(absDir).filter(f => f.endsWith('.html') && f !== 'index.html')) {
    const rel = dir + '/' + file;
    if (EXCLUDE.has(rel)) { skipped++; continue; }

    const fp = path.join(ROOT, rel);
    let html;
    try { html = fs.readFileSync(fp, 'utf8'); } catch { skipped++; continue; }

    if (isHistoric(html)) { skipped++; continue; }

    // Extract last-reviewed date
    const lrMatch = html.match(/name="last-reviewed"\s+content="(\d{4}-\d{2}-\d{2})"/);
    if (!lrMatch) { noDate++; continue; }
    const lastReviewed = lrMatch[1];

    // Find dateModified in WebPage JSON-LD — may appear in various formats
    const dmMatch = html.match(/"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})"/);
    if (!dmMatch) { noDate++; continue; }
    const dateModified = dmMatch[1];

    if (dateModified === lastReviewed) { alreadyOk++; continue; }

    const newHtml = html.replace(
      `"dateModified": "${dateModified}"`,
      `"dateModified": "${lastReviewed}"`
    ).replace(
      `"dateModified":"${dateModified}"`,
      `"dateModified":"${lastReviewed}"`
    );

    if (newHtml === html) {
      console.log(`WARN (no change): ${rel}`);
      skipped++;
      continue;
    }

    fs.writeFileSync(fp, newHtml, 'utf8');
    console.log(`OK: ${rel} — ${dateModified} → ${lastReviewed}`);
    fixed++;
  }
}

console.log(`\nDone. fixed=${fixed} already_ok=${alreadyOk} skipped=${skipped} no_date=${noDate}`);
