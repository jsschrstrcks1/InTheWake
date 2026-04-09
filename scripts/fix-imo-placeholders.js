#!/usr/bin/env node
/**
 * Phase A.3 — Fix template_remnants/placeholder_content
 *
 * Replaces literal "${imo}" template variable with actual IMO from data-imo,
 * or "TBD" where data-imo is absent. Skips historic ships.
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

let fixed = 0, skipped = 0, noPlaceholder = 0;

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
    if (!html.includes('${imo}')) { noPlaceholder++; continue; }

    // Get actual IMO from data-imo attribute
    const imoMatch = html.match(/data-imo="([^"]+)"/);
    const imoValue = (imoMatch && imoMatch[1] && imoMatch[1] !== '0') ? imoMatch[1] : 'TBD';

    // Replace all occurrences of ${imo} with the actual value
    const newHtml = html.split('${imo}').join(imoValue);

    if (newHtml === html) { skipped++; continue; }

    fs.writeFileSync(fp, newHtml, 'utf8');
    const count = (html.match(/\$\{imo\}/g) || []).length;
    console.log(`OK: ${rel} — replaced ${count}x "${imoValue}"`);
    fixed++;
  }
}

console.log(`\nDone. fixed=${fixed} skipped=${skipped} no_placeholder=${noPlaceholder}`);
