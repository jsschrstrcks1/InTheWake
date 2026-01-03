#!/usr/bin/env node
/**
 * Find ships in atlas that don't have corresponding HTML pages
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ATLAS_PATH = path.join(__dirname, 'ship-ids-list.json');
const SHIPS_DIR = path.join(__dirname, '../../ships');

// Get all existing ship HTML pages
function getExistingPages() {
  const result = execSync(`find ${SHIPS_DIR} -name "*.html" -type f`, { encoding: 'utf8' });
  const files = result.trim().split('\n').filter(f => f);

  // Extract ship names from file paths, normalize for comparison
  const pages = new Set();
  for (const file of files) {
    const basename = path.basename(file, '.html').toLowerCase();
    // Skip index and other non-ship pages
    if (['index', 'quiz', 'rooms', 'template'].includes(basename)) continue;
    pages.add(basename);
  }
  return pages;
}

// Normalize ship name for comparison
function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Map brand slugs to folder names
const brandFolderMap = {
  'royal-caribbean': 'rcl',
  'celebrity': 'celebrity-cruises',
  'msc-cruises': 'msc',
  'norwegian': 'norwegian',
  'carnival': 'carnival',
  'princess': 'princess',
  'holland-america': 'holland-america-line',
  'cunard': 'cunard',
  'silversea': 'silversea',
  'oceania': 'oceania',
  'regent': 'regent',
  'seabourn': 'seabourn',
  'costa': 'costa',
  'explora-journeys': 'explora-journeys'
};

function main() {
  const ships = JSON.parse(fs.readFileSync(ATLAS_PATH, 'utf8'));
  const existingPages = getExistingPages();

  const missing = [];
  const found = [];

  for (const ship of ships) {
    const normalized = normalizeName(ship.name);
    const folder = brandFolderMap[ship.brand] || ship.brand;

    // Check various possible page names
    const possibleNames = [
      normalized,
      ship.id.replace(/^[a-z]+-/, ''), // Remove brand prefix from ID
      normalized.replace(/-/g, ''),
    ];

    let pageFound = false;
    for (const name of possibleNames) {
      if (existingPages.has(name)) {
        pageFound = true;
        break;
      }
    }

    if (pageFound) {
      found.push(ship);
    } else {
      missing.push({
        ...ship,
        expected_folder: folder,
        expected_filename: `${normalized}.html`
      });
    }
  }

  // Group missing by brand
  const missingByBrand = {};
  for (const ship of missing) {
    const brand = ship.brand;
    if (!missingByBrand[brand]) {
      missingByBrand[brand] = [];
    }
    missingByBrand[brand].push(ship);
  }

  console.log(`\n=== SHIP PAGE STATUS ===`);
  console.log(`Total ships in atlas: ${ships.length}`);
  console.log(`Pages found: ${found.length}`);
  console.log(`Pages missing: ${missing.length}`);

  console.log(`\n=== MISSING PAGES BY BRAND ===`);
  for (const [brand, brandShips] of Object.entries(missingByBrand).sort()) {
    console.log(`\n### ${brand} (${brandShips.length} missing)`);
    for (const ship of brandShips) {
      console.log(`- ${ship.name} → ships/${ship.expected_folder}/${ship.expected_filename}`);
    }
  }

  // Write missing list to file
  fs.writeFileSync(
    path.join(__dirname, 'missing-ship-pages.json'),
    JSON.stringify(missingByBrand, null, 2)
  );
  console.log('\nMissing pages list written to missing-ship-pages.json');
}

main();
