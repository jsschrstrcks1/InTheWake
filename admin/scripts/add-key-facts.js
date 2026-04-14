#!/usr/bin/env node
/**
 * Phase A.1 — Add missing key-facts element
 *
 * Adds a <div class="key-facts"> block after the .fact-block paragraph
 * on every active (non-historic) ship page that lacks it.
 *
 * Data sources (all on-page):
 *   - ship-class  → ai-breadcrumbs: ship-class:
 *   - year        → fact-block text ("entered service in YYYY" / "built YYYY")
 *   - tonnage     → fact-block text ("XXX,XXX gross tons")
 *   - guests      → fact-block text ("X,XXX guests")
 *   - IMO         → data-imo attribute on tracker section
 */

const fs = require('fs');
const path = require('path');

// Historic ships detected inline via content markers (no file needed)

const HISTORIC_MARKERS = [
  'historical ship tribute',
  'status: retired',
  'retired ship',
  'retired from service',
  '(historical)',
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

const ROOT = path.join(__dirname, '..');
const EXCLUDE = new Set([
  'ships/rcl/venues.html',
  'ships/rcl/legend-of-the-seas-1995-built.html',
]);

function parseShipClass(html) {
  const m = html.match(/ship-class:\s*(.+)/);
  return m ? m[1].trim() : null;
}

function parseYear(factBlock) {
  // "entered service in 2022" or "built 2022" or "since 2022" or "delivered in 2022"
  let m = factBlock.match(/entered service in (\d{4})/i);
  if (m) return m[1];
  m = factBlock.match(/\bbuilt (\d{4})/i);
  if (m) return m[1];
  m = factBlock.match(/delivered in (\d{4})/i);
  if (m) return m[1];
  m = factBlock.match(/since (\d{4})/i);
  if (m) return m[1];
  m = factBlock.match(/service in (\d{4})/i);
  if (m) return m[1];
  return null;
}

function parseTonnage(factBlock) {
  // "143,535 gross tons" or "180,000 GT" or "143535 gross tons"
  let m = factBlock.match(/([\d,]+)\s+gross tons/i);
  if (m) return m[1] + ' GT';
  m = factBlock.match(/([\d,]+)\s+GT\b/i);
  if (m) return m[1] + ' GT';
  return null;
}

function parseGuests(factBlock) {
  // "3,215 guests" or "approximately 3,215 guests"
  let m = factBlock.match(/([\d,]+)\s+guests/i);
  if (m) return m[1];
  return null;
}

function parseImo(html) {
  const m = html.match(/data-imo="([^"]+)"/);
  return m ? m[1] : null;
}

function parseFactBlock(html) {
  const m = html.match(/<p[^>]+class="fact-block"[^>]*>([\s\S]*?)<\/p>/i);
  if (!m) return '';
  // Strip HTML tags
  return m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildKeyFacts(shipClass, year, tonnage, guests, imo) {
  const classLine  = shipClass ? `\n          <li><strong>Class:</strong> ${shipClass}</li>` : '';
  const yearLine   = year      ? `\n          <li><strong>Year:</strong> ${year}</li>` : '';
  const tonLine    = tonnage   ? `\n          <li><strong>Tonnage:</strong> ${tonnage}</li>` : '';
  const guestLine  = guests    ? `\n          <li><strong>Guests:</strong> ${guests}</li>` : '';
  const imoLine    = imo && imo !== '0' ? `\n          <li><strong>IMO:</strong> ${imo}</li>` : '';

  return `
      <div class="key-facts" style="margin: 1rem 0; padding: 1rem; background: #f7fdff; border-radius: 8px; border: 1px solid #e0f0f5;">
        <h3 style="margin: 0 0 0.5rem; font-size: 1rem; color: #134;">Key Facts</h3>
        <ul style="margin: 0; padding-left: 1.25rem;">${classLine}${yearLine}${tonLine}${guestLine}${imoLine}
        </ul>
      </div>`;
}

let processed = 0, skipped = 0, alreadyHas = 0, noFactBlock = 0, errors = 0;

for (const dir of SHIP_DIRS) {
  const absDir = path.join(ROOT, dir);
  if (!fs.existsSync(absDir)) continue;

  const files = fs.readdirSync(absDir)
    .filter(f => f.endsWith('.html') && f !== 'index.html');

  for (const file of files) {
    const rel = dir + '/' + file;
    if (EXCLUDE.has(rel)) { skipped++; continue; }

    const fp = path.join(ROOT, rel);
    let html;
    try { html = fs.readFileSync(fp, 'utf8'); } catch { errors++; continue; }

    if (isHistoric(html)) { skipped++; continue; }
    if (html.includes('class="key-facts"') || html.includes("class='key-facts'")) { alreadyHas++; continue; }

    // Find fact-block paragraph
    const factBlockMatch = html.match(/<p[^>]+class="fact-block"[^>]*>[\s\S]*?<\/p>/i);
    if (!factBlockMatch) { noFactBlock++; continue; }

    const factText = parseFactBlock(html);
    const shipClass = parseShipClass(html);
    const year      = parseYear(factText);
    const tonnage   = parseTonnage(factText);
    const guests    = parseGuests(factText);
    const imo       = parseImo(html);

    // Need at least class or year to make a meaningful key-facts block
    if (!shipClass && !year && !tonnage) {
      console.log(`SKIP (no data): ${rel}`);
      skipped++;
      continue;
    }

    const kf = buildKeyFacts(shipClass, year, tonnage, guests, imo);
    const insertAfter = factBlockMatch[0];
    const newHtml = html.replace(insertAfter, insertAfter + kf);

    if (newHtml === html) {
      console.log(`WARN (no change): ${rel}`);
      errors++;
      continue;
    }

    fs.writeFileSync(fp, newHtml, 'utf8');
    console.log(`OK: ${rel} — class:${shipClass||'?'} year:${year||'?'} gt:${tonnage||'?'} guests:${guests||'?'} imo:${imo||'?'}`);
    processed++;
  }
}

console.log(`\nDone. processed=${processed} already_ok=${alreadyHas} skipped=${skipped} no_fact_block=${noFactBlock} errors=${errors}`);
