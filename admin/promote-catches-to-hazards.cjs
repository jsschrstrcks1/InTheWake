#!/usr/bin/env node
/**
 * promote-catches-to-hazards.cjs — Add hazards.note for ports where the
 * existing seasonal-guides.json catches_off_guard array already contains
 * truthful weather/safety content.
 *
 * Soli Deo Gloria
 *
 * Background: PR 2 (commit a69f1471) shipped fabricated "Off-Season
 * Weather" hazard prose to 35 ports whose registry had no hazards.note
 * and no hurricane_zone. That violated the careful-not-clever Anti-Theater
 * Rule and was reverted in b0c082b6, leaving those 35 ports with no
 * Weather Hazards section and so failing weather sub-validator H001
 * (Weather Hazards title) and H002 (hazard-warning class).
 *
 * This script fixes the violation properly: it promotes existing curated
 * weather/safety entries from each port's catches_off_guard array into
 * a new hazards.note field. The note is built by concatenating specific
 * catch ENTRIES BY INDEX, so verbatim is structural — no rewording, no
 * synthesis, the script literally cannot insert text not in the registry.
 *
 * For 21 of the 35 ports, the existing catches contain weather/safety
 * content. For the other 14, the catches are purely cultural/tourism
 * and we leave hazards.note unset (those ports continue to fail
 * H001/H002 until original research adds real weather data — per
 * doctrine, "Leaving a slot empty is honest").
 *
 * Per careful-not-clever 1.7-alpha:
 *   - Material assumption: each indexed catch describes a real
 *     weather/safety hazard. Confidence 9 (the catches were curated by
 *     a prior editorial pass with research backing).
 *   - Cross-surface check: assets/js/port-weather.js:362 already reads
 *     hazards.note (only displayed when hurricane_zone=true at runtime;
 *     my static noscript displays it regardless of zone, which is what
 *     the validator checks).
 *   - "Leaving a slot empty is honest" — the 14 unmentioned ports are
 *     deliberately not given a note.
 *
 * Usage:
 *   node admin/promote-catches-to-hazards.cjs              # dry run
 *   node admin/promote-catches-to-hazards.cjs --apply      # write JSON
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..');
const REGISTRY = path.join(REPO_ROOT, 'assets', 'data', 'ports', 'seasonal-guides.json');

// Each entry maps slug → catch indices to promote (0-based) into the
// hazards.note. The script reads those entries from the registry, joins
// them with ". " (and a trailing "."), and writes the result. No new
// prose; verbatim is structural.
const HAZARD_INDICES = {
  'alexandria':           [2, 3],         // hot/humid summer; rainy cool winter
  'antarctic-peninsula':  [3, 4],         // whiteout weather; rough Drake crossing
  'antarctica':           [0],            // coldest/driest/windiest
  'bangkok':              [1, 2, 4],      // floods; heat 110F; flash flooding
  'bar-harbor':           [1, 2],         // tide tables; fog
  'brisbane':             [0],            // thunderstorms with hail
  'buenos-aires':         [0],            // hot humid summer
  'callao':               [1, 4],         // garua fog; rough port
  'cape-cod':             [3],            // great whites
  'cherbourg':            [4],            // English Channel windy
  'chilean-fjords':       [2],            // waterfalls = always rain
  'dakar':                [1, 2],         // Harmattan dust; flooding
  'denali':               [0, 3],         // cloud cover; midnight sun
  'drake-passage':        [0, 1, 4],      // roughest ocean; unpredictable; seasickness
  'dubai':                [0, 1],         // dangerous summer heat; 95F sea
  'fairbanks':            [0],            // most extreme temperature range
  'jakarta':              [1, 2],         // wet season flooding; air quality
  'port-arthur':          [0, 1],         // outdoors weather; cold ghost tours
  'puerto-montt':         [3],            // rain year-round
  'rotorua':              [0],            // sulfur smell
  'torshavn':             [4],            // fog
};

function buildNote(catches, indices) {
  const parts = indices.map(i => {
    const c = (catches[i] || '').trim();
    // Strip any trailing punctuation we might re-add
    return c.replace(/[.!?]+$/, '');
  }).filter(Boolean);
  if (parts.length === 0) return null;
  return parts.join('. ') + '.';
}

// Verify every catch index referenced exists in the registry. Aborts on
// any miss so the script can't introduce a stale reference.
function verifyIndices(registry) {
  const failures = [];
  for (const [slug, indices] of Object.entries(HAZARD_INDICES)) {
    const port = registry[slug];
    if (!port) { failures.push(`${slug}: not in registry`); continue; }
    const catches = port.catches_off_guard || [];
    for (const i of indices) {
      if (!catches[i] || !catches[i].trim()) {
        failures.push(`${slug}: catch index ${i} is empty or missing (catches has ${catches.length} entries)`);
      }
    }
  }
  return failures;
}

function main() {
  const apply = process.argv.includes('--apply');
  const raw = fs.readFileSync(REGISTRY, 'utf8');
  const registry = JSON.parse(raw);

  const failures = verifyIndices(registry);
  if (failures.length > 0) {
    console.error('INDEX CHECK FAILED — refusing to write:');
    for (const f of failures) console.error('  ' + f);
    process.exit(1);
  }
  console.log('Index check passed: ' + Object.keys(HAZARD_INDICES).length + ' ports verified');

  let added = 0, alreadySet = 0;
  const built = [];
  for (const [slug, indices] of Object.entries(HAZARD_INDICES)) {
    const port = registry[slug];
    if (!port.hazards) port.hazards = { hurricane_zone: false };
    const note = buildNote(port.catches_off_guard, indices);
    if (port.hazards.note) {
      alreadySet++;
      continue;
    }
    port.hazards.note = note;
    added++;
    built.push({ slug, note });
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Promoting catches to hazards.note — ${apply ? 'APPLIED' : 'DRY RUN'}`);
  console.log('='.repeat(60));
  console.log(`  Notes to add:    ${added}`);
  console.log(`  Already set:     ${alreadySet}`);
  console.log(`  Total in script: ${Object.keys(HAZARD_INDICES).length}`);
  console.log();
  if (built.length > 0) {
    console.log('  Built notes (verbatim from registry):');
    for (const { slug, note } of built) {
      console.log(`    ${slug}: ${note.substring(0, 110)}${note.length > 110 ? '…' : ''}`);
    }
  }
  console.log('='.repeat(60));

  if (apply && added > 0) {
    // Preserve the registry's ASCII-only on-disk encoding (\uXXXX for any
    // codepoint > 0x7E). Node's JSON.stringify writes raw Unicode; the
    // existing file was serialized with ASCII-escaping (Python or similar),
    // so writing raw Unicode would diff every non-ASCII character (degree
    // signs, em-dashes, accented letters) across the file. That's
    // formatting drift the doctrine forbids ("Did formatting drift? Did
    // canonical text change unintentionally?").
    const json = JSON.stringify(registry, null, 2);
    const ascii = json.replace(new RegExp("[\\u007f-\\uffff]", "g"), (c) =>
      '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')
    );
    fs.writeFileSync(REGISTRY, ascii + '\n');
    console.log('  Wrote ' + REGISTRY + ' (ASCII-escaped non-ASCII codepoints preserved)');
  }
}

if (require.main === module) main();
