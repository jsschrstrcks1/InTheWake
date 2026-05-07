#!/usr/bin/env node
/**
 * backfill-weather-seasonal-guide.cjs — Inject static seasonal-guide noscript
 * Soli Deo Gloria
 *
 * Background: scripts/validate-port-weather.js requires a static HTML
 * seasonal-guide inside <div id="port-weather-widget"> as a noscript fallback.
 * This is needed for users on stripped browsers, NoScript, or hospital WiFi.
 *
 * The guide must contain (per port-weather-validator-core.js):
 *   - class="seasonal-guide" (1)
 *   - At a Glance: 5 glance-labels (Temperature, Humidity, Rain, Wind, Daylight)
 *   - Best Time to Visit: cruise-seasons-grid + 3 seasons + 5 activities + months-to-avoid
 *   - Weather Hazards: hazard-warning
 *   - Catches list (3-7 items)
 *   - Packing list (3-7 items)
 *
 * Source data: assets/data/ports/seasonal-guides.json (380 Tier-1 ports).
 * Reference template: ports/juneau.html (only port that passes the sub-validator).
 *
 * Strategy: idempotent. Only replaces noscript content for ports that have a
 * <div id="port-weather-widget"> AND no existing class="seasonal-guide" inside.
 *
 * Usage:
 *   node admin/backfill-weather-seasonal-guide.cjs                # dry-run all
 *   node admin/backfill-weather-seasonal-guide.cjs --apply        # write changes
 *   node admin/backfill-weather-seasonal-guide.cjs ports/dubai.html  # single (dry)
 *   node admin/backfill-weather-seasonal-guide.cjs --apply ports/dubai.html
 */

const fs = require('fs');
const path = require('path');

const PORTS_DIR = path.join(__dirname, '..', 'ports');
const SEASONAL_GUIDES_PATH = path.join(__dirname, '..', 'assets', 'data', 'ports', 'seasonal-guides.json');

const seasonalGuides = JSON.parse(fs.readFileSync(SEASONAL_GUIDES_PATH, 'utf8'));

// Validator-required labels (exact strings, exactly once each)
const ACTIVITY_LABELS = ['Beach', 'Snorkeling', 'Hiking', 'City Walking', 'Low Crowds'];

// JSON activity keys that map to each validator label.
// Falls back to "N/A" if no matching key exists in the port's best_months_for.
const ACTIVITY_KEY_MAP = {
  'Beach':       ['beach', 'beaches'],
  'Snorkeling':  ['snorkeling', 'snorkel', 'diving'],
  'Hiking':      ['hiking', 'trekking', 'walking_trails'],
  'City Walking':['city_walking', 'walking_tours', 'cultural', 'culture'],
  'Low Crowds':  ['low_crowds'],
};

function escapeHTML(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function joinMonths(arr) {
  if (!arr || arr.length === 0) return 'N/A';
  return arr.join(', ');
}

function pickActivityMonths(port, label) {
  const candidates = ACTIVITY_KEY_MAP[label] || [];
  const bm = port.best_months_for || {};
  for (const k of candidates) {
    if (Array.isArray(bm[k]) && bm[k].length > 0) return joinMonths(bm[k]);
  }
  return 'N/A';
}

/**
 * Render the hazard-warning block ONLY when the source JSON has truthful data.
 *
 * Two truthful sources, in priority order:
 *   1. hurricane_zone === true → real hurricane warning with hurricane_season,
 *      peak_risk_months, and (when present) hazards.note
 *   2. hazards.note exists → render the curated note verbatim
 *
 * If neither: return empty string. The validator will then fail H001/H002
 * on those pages (hazard-warning required) — that is the honest cost of not
 * having curated hazard data, and it surfaces the gap so it can be filled
 * by humans rather than papered over with template filler.
 *
 * NOTE: a prior version of this generator emitted a fabricated "Off-Season
 * Weather" block when neither truthful source existed. That violated the
 * careful-not-clever doctrine ("Never fabricate to satisfy a structural
 * check") and shipped to 35 ports before being reverted.
 */
function renderHazard(port) {
  const h = port.hazards || {};
  if (h.hurricane_zone) {
    const season = h.hurricane_season || '';
    const peak = Array.isArray(h.peak_risk_months) ? h.peak_risk_months.join(', ') : '';
    const note = h.note || '';
    const lines = [
      `                        <strong>Hurricane Zone</strong>`,
      season ? `                        <p>Season: ${escapeHTML(season)}</p>` : '',
      peak ? `                        <p>Peak risk: ${escapeHTML(peak)}</p>` : '',
      note ? `                        <p class="hazard-note">${escapeHTML(note)}</p>` : '',
    ].filter(Boolean).join('\n');
    return `
                    <div class="hazard-warning">
                      <span class="hazard-icon">🌀</span>
                      <div class="hazard-content">
${lines}
                      </div>
                    </div>`;
  }
  if (h.note) {
    return `
                    <div class="hazard-warning">
                      <span class="hazard-icon">⚠️</span>
                      <div class="hazard-content">
                        <strong>Weather and Local Hazards</strong>
                        <p class="hazard-note">${escapeHTML(h.note)}</p>
                      </div>
                    </div>`;
  }
  // Neither hurricane_zone nor a curated hazards.note. Emit nothing so the
  // validator can flag the gap honestly, rather than silencing it with filler.
  return '';
}

function renderSeasonalGuide(port) {
  const g = port.at_a_glance || {};
  const cs = port.cruise_seasons || { high: [], transitional: [], low: [] };
  // Emit only what the JSON registry has. Do NOT pad to satisfy validator
  // minimums — fabricating filler is the careful-not-clever violation
  // ("Never fabricate to satisfy a structural check"). If a port has fewer
  // than 3 catches or packing items the validator will fail CATCH_003 /
  // PACK_003, which honestly surfaces the gap for human curation.
  const catches = (port.catches_off_guard || []).slice(0, 7);
  const packing = (port.packing_nudges || []).slice(0, 7);
  const avoid = joinMonths(port.avoid_months || []);

  const activitiesHTML = ACTIVITY_LABELS.map(label => {
    const months = pickActivityMonths(port, label);
    return `                      <div class="activity-row"><span class="activity-label">${label}</span><span class="activity-months">${escapeHTML(months)}</span></div>`;
  }).join('\n');

  const catchesHTML = catches.map(c => `                      <li>${escapeHTML(c)}</li>`).join('\n');
  const packingHTML = packing.map(p => `                      <li>${escapeHTML(p)}</li>`).join('\n');

  return `<noscript>
              <div class="seasonal-guide seasonal-guide-static">
                <details class="seasonal-section" open>
                  <summary class="seasonal-section-title">At a Glance</summary>
                  <div class="seasonal-at-glance">
                    <div class="seasonal-glance-grid">
                      <div class="seasonal-glance-item"><span class="glance-label">Temperature</span><span class="glance-value">${escapeHTML(g.temp_range || 'See monthly forecast')}</span></div>
                      <div class="seasonal-glance-item"><span class="glance-label">Humidity</span><span class="glance-value">${escapeHTML(g.humidity || 'Varies seasonally')}</span></div>
                      <div class="seasonal-glance-item"><span class="glance-label">Rain</span><span class="glance-value">${escapeHTML(g.rain || 'Check current forecast')}</span></div>
                      <div class="seasonal-glance-item"><span class="glance-label">Wind</span><span class="glance-value">${escapeHTML(g.wind || 'Generally moderate')}</span></div>
                      <div class="seasonal-glance-item"><span class="glance-label">Daylight</span><span class="glance-value">${escapeHTML(g.daylight || 'Varies seasonally')}</span></div>
                    </div>
                  </div>
                </details>

                <details class="seasonal-section" open>
                  <summary class="seasonal-section-title">Best Time to Visit</summary>
                  <div class="seasonal-best-time">
                    <div class="cruise-seasons-grid">
                      <div class="cruise-season cruise-season-high"><span class="season-label">Peak Season</span><span class="season-months">${escapeHTML(joinMonths(cs.high))}</span></div>
                      <div class="cruise-season cruise-season-transitional"><span class="season-label">Transitional Season</span><span class="season-months">${escapeHTML(joinMonths(cs.transitional))}</span></div>
                      <div class="cruise-season cruise-season-low"><span class="season-label">Low Season</span><span class="season-months">${escapeHTML(joinMonths(cs.low))}</span></div>
                    </div>
                    <div class="best-months-activities">
${activitiesHTML}
                    </div>
                    <div class="months-to-avoid">
                      <span class="avoid-label">Consider avoiding:</span>
                      <span class="avoid-months">${escapeHTML(avoid)}</span>
                    </div>
                  </div>
                </details>

                <details class="seasonal-section">
                  <summary class="seasonal-section-title">What Catches Visitors Off Guard</summary>
                  <div class="seasonal-catches">
                    <ul class="catches-list">
${catchesHTML}
                    </ul>
                  </div>
                </details>

                <details class="seasonal-section">
                  <summary class="seasonal-section-title">Packing Tips</summary>
                  <div class="seasonal-packing">
                    <ul class="packing-list">
${packingHTML}
                    </ul>
                  </div>
                </details>

${(() => {
  const hazardHTML = renderHazard(port);
  if (!hazardHTML) return ''; // No truthful hazard data; omit the section entirely
  return `                <details class="seasonal-section" open>
                  <summary class="seasonal-section-title">Weather Hazards</summary>
                  <div class="seasonal-hazards">${hazardHTML}
                  </div>
                </details>

`;
})()}                <p class="weather-noscript-note"><em>Enable JavaScript for live weather conditions and 48-hour forecast.</em></p>
              </div>
            </noscript>`;
}

/**
 * Rename sidebar "At a Glance" → "Port Snapshot" so it doesn't collide with the
 * weather seasonal-guide's "At a Glance" summary (which the sub-validator
 * requires exactly once). Matches juneau.html, the gold-standard template.
 *
 * Targets common sidebar variants outside the seasonal-section:
 *   <summary>At a Glance</summary>           (at-a-glance card details)
 *   <h3 id="glance-heading">At a Glance</h3>
 *   <h4 id="glance-heading">At a Glance</h4>
 */
function renameSidebarGlance(html) {
  let renamed = 0;
  // Strip the seasonal-section block first so we never touch its
  // "At a Glance" summary (the validator requires that one to stay).
  const seasonalRe = /<details\s+class="seasonal-section[^"]*"[^>]*>[\s\S]*?<\/details>/g;
  const seasonalSlots = [];
  let out = html.replace(seasonalRe, (m) => {
    seasonalSlots.push(m);
    return `__SEASONAL_SLOT_${seasonalSlots.length - 1}__`;
  });

  // Now replace all sidebar variants. Outside the seasonal-section, any
  // "At a Glance" is the sidebar variant.
  out = out.replace(/(<h3[^>]*id="glance-heading"[^>]*>)At a Glance(<\/h3>)/g, (_, a, b) => { renamed++; return `${a}Port Snapshot${b}`; });
  out = out.replace(/(<h4[^>]*id="glance-heading"[^>]*>)At a Glance(<\/h4>)/g, (_, a, b) => { renamed++; return `${a}Port Snapshot${b}`; });
  // Any <summary>At a Glance</summary> remaining (outside seasonal slots)
  out = out.replace(/(<summary[^>]*>)At a Glance(<\/summary>)/g, (_, a, b) => { renamed++; return `${a}Port Snapshot${b}`; });
  // Any standalone heading with At a Glance content (h2/h5/h6 fallback)
  out = out.replace(/(<h[2-6][^>]*>)At a Glance(<\/h[2-6]>)/g, (_, a, b) => { renamed++; return `${a}Port Snapshot${b}`; });

  // Restore seasonal-section blocks
  out = out.replace(/__SEASONAL_SLOT_(\d+)__/g, (_, i) => seasonalSlots[parseInt(i, 10)]);

  return { html: out, renamed };
}

/**
 * Find the <div id="port-weather-widget"> opening tag and the first <noscript>
 * inside it. Replace that <noscript>...</noscript> with the generated block.
 * If no <noscript> exists inside the widget, insert one immediately after the
 * widget's opening tag.
 */
function backfill(html, portSlug, opts = {}) {
  const port = seasonalGuides[portSlug];
  if (!port) return { changed: false, reason: `port "${portSlug}" not in seasonal-guides.json` };

  const widgetOpenRe = /<div\s+id="port-weather-widget"[^>]*>/;
  const widgetMatch = html.match(widgetOpenRe);
  if (!widgetMatch) return { changed: false, reason: 'no <div id="port-weather-widget"> found' };

  const widgetStart = widgetMatch.index;
  const afterTag = widgetStart + widgetMatch[0].length;

  // Look for an existing seasonal-guide already in the widget. By default
  // we skip these (PR 2 idempotency); with --force we replace the existing
  // <noscript> block too — needed for re-rendering after generator fixes
  // (e.g., reverting fabricated hazard prose).
  const widgetSlice = html.substring(widgetStart, widgetStart + 10000);
  const widgetAlreadyHasGuide = /class="seasonal-guide/.test(widgetSlice);
  if (widgetAlreadyHasGuide && !opts.force) {
    const { html: renamedHtml, renamed } = renameSidebarGlance(html);
    if (renamed > 0) return { changed: true, html: renamedHtml, reason: `sidebar At a Glance renamed (${renamed})` };
    return { changed: false, reason: 'widget already has class="seasonal-guide" (skip)' };
  }

  // Detect the existing <noscript>...</noscript> within the widget (first one
  // that opens within ~500 chars of the widget tag — the existing template's
  // placeholder noscript).
  const noscriptRe = /<noscript[^>]*>[\s\S]*?<\/noscript>/;
  const tail = html.substring(afterTag);
  const noscriptMatch = tail.match(noscriptRe);

  const guide = renderSeasonalGuide(port);

  let newHtml;
  if (noscriptMatch && noscriptMatch.index < 500) {
    // Replace existing noscript
    const start = afterTag + noscriptMatch.index;
    const end = start + noscriptMatch[0].length;
    // Preserve indentation: take the indent of the line containing the existing noscript
    const lineStart = html.lastIndexOf('\n', start - 1) + 1;
    const indent = html.substring(lineStart, start).match(/^\s*/)[0];
    newHtml = html.substring(0, start) + guide.replace(/^/gm, indent).trim() + html.substring(end);
  } else {
    // Insert new noscript right after the widget opening tag (rare path)
    const indent = '            '; // matches juneau template indentation
    const insertion = '\n' + indent + guide.replace(/^/gm, indent);
    newHtml = html.substring(0, afterTag) + insertion + html.substring(afterTag);
  }

  // Also rename sidebar At a Glance to avoid G001 duplicate with the new
  // seasonal-section "At a Glance" we just inserted.
  const { html: finalHtml } = renameSidebarGlance(newHtml);
  return { changed: true, html: finalHtml };
}

function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const force = args.includes('--force');
  const explicitFiles = args.filter(a => a.endsWith('.html'));

  let portFiles;
  if (explicitFiles.length > 0) {
    portFiles = explicitFiles.map(f => path.resolve(f));
  } else {
    portFiles = fs.readdirSync(PORTS_DIR)
      .filter(f => f.endsWith('.html'))
      .map(f => path.join(PORTS_DIR, f));
  }

  let touched = 0, alreadyOk = 0, noWidget = 0, noData = 0, nonPort = 0;
  const skippedFiles = [];

  for (const filePath of portFiles) {
    const html = fs.readFileSync(filePath, 'utf8');

    if (/<meta\s+http-equiv="refresh"/i.test(html)) { nonPort++; continue; }
    const bodyType = (html.match(/<body[^>]*data-page-type="([^"]+)"/i) || [, ''])[1];
    const metaType = (html.match(/<meta\s+name="page-type"\s+content="([^"]+)"/i) || [, ''])[1];
    if ((bodyType || metaType || 'port') !== 'port') { nonPort++; continue; }

    const slug = path.basename(filePath, '.html');
    const result = backfill(html, slug, { force });
    const rel = path.relative(path.join(__dirname, '..'), filePath);

    if (!result.changed) {
      if (result.reason.startsWith('widget already has')) alreadyOk++;
      else if (result.reason.startsWith('no <div id=')) {
        noWidget++;
        skippedFiles.push({ rel, reason: result.reason });
      } else if (result.reason.startsWith('port "')) {
        noData++;
        skippedFiles.push({ rel, reason: result.reason });
      }
      continue;
    }

    if (apply) fs.writeFileSync(filePath, result.html);
    touched++;
  }

  const mode = apply ? 'APPLIED' : 'DRY RUN';
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  Static Seasonal-Guide Backfill — ${mode}`);
  console.log(`${'═'.repeat(70)}`);
  console.log(`  Files scanned:        ${portFiles.length}`);
  console.log(`  Already correct:      ${alreadyOk}`);
  console.log(`  ${apply ? 'Backfilled' : 'Would backfill'}: ${touched}`);
  console.log(`  Non-port pages:       ${nonPort}`);
  console.log(`  No weather widget:    ${noWidget}`);
  console.log(`  No JSON climate data: ${noData}`);
  if (skippedFiles.length > 0) {
    console.log(`\n  First 15 skipped:`);
    for (const s of skippedFiles.slice(0, 15)) console.log(`    ${s.rel}  — ${s.reason}`);
    if (skippedFiles.length > 15) console.log(`    ... and ${skippedFiles.length - 15} more`);
  }
  console.log(`${'═'.repeat(70)}\n`);
}

if (require.main === module) main();

module.exports = { backfill, renderSeasonalGuide };
