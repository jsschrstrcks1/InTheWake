#!/usr/bin/env node
/**
 * Ship Size Atlas Builder
 * Merges CSV expansion data into ship-size-atlas.json
 */

const fs = require('fs');
const path = require('path');

const ATLAS_PATH = path.join(__dirname, 'ship-size-atlas.json');
const CSV_PATH = path.join(__dirname, 'ship-expansion-data.csv');
const OUTPUT_PATH = ATLAS_PATH;

// Parse CSV
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  const ships = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const ship = {};
    headers.forEach((header, idx) => {
      let val = values[idx];
      // Convert numeric fields
      if (['year_built', 'gt', 'length_m', 'beam_m', 'draft_m', 'pax_double', 'pax_max', 'crew'].includes(header)) {
        val = parseFloat(val) || null;
      }
      ship[header] = val;
    });
    ships.push(ship);
  }
  return ships;
}

// Convert CSV ship to full atlas format
function toAtlasFormat(csvShip) {
  return {
    ship_id: csvShip.ship_id,
    name_current: csvShip.name_current,
    name_aliases: [],
    brand: csvShip.brand,
    parent_group: csvShip.parent_group,
    class: csvShip.class,
    status: csvShip.status || 'operating',
    year_built: csvShip.year_built,
    year_refurbished: null,
    gt: csvShip.gt,
    length_m: csvShip.length_m,
    beam_m: csvShip.beam_m,
    draft_m: csvShip.draft_m,
    pax_double: csvShip.pax_double,
    pax_max: csvShip.pax_max,
    crew: csvShip.crew,
    top_speed_knots: null,
    sources: {
      gt: ["Industry Database"],
      length_m: ["Industry Database"]
    },
    last_verified_date: "2026-01-02",
    confidence: csvShip.confidence || "verified",
    conflicts: [],
    to_verify: []
  };
}

// Main
function main() {
  // Read existing atlas
  const atlas = JSON.parse(fs.readFileSync(ATLAS_PATH, 'utf8'));
  const existingIds = new Set(atlas.ships.map(s => s.ship_id));

  // Read CSV data
  const csvContent = fs.readFileSync(CSV_PATH, 'utf8');
  const newShips = parseCSV(csvContent);

  // Add new ships that don't already exist
  let added = 0;
  for (const csvShip of newShips) {
    if (!existingIds.has(csvShip.ship_id)) {
      atlas.ships.push(toAtlasFormat(csvShip));
      added++;
    }
  }

  // Update metadata
  atlas.build_metadata.total_ships = atlas.ships.length;
  atlas.last_updated = "2026-01-02";

  // Sort by GT descending
  atlas.ships.sort((a, b) => (b.gt || 0) - (a.gt || 0));

  // Write output
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(atlas, null, 2));

  console.log(`Added ${added} new ships`);
  console.log(`Total ships: ${atlas.ships.length}`);

  // Output all ship IDs for cross-reference
  const shipIds = atlas.ships.map(s => ({
    id: s.ship_id,
    name: s.name_current,
    brand: s.brand
  }));
  fs.writeFileSync(
    path.join(__dirname, 'ship-ids-list.json'),
    JSON.stringify(shipIds, null, 2)
  );
  console.log('Ship ID list written to ship-ids-list.json');
}

main();
