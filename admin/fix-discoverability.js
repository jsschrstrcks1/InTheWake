#!/usr/bin/env node
/**
 * fix-discoverability.js
 *
 * Fixes discoverability validation errors:
 * 1. Removes ships from atlas that score < 90%
 * 2. Adds ships to search-index.json that are missing
 *
 * Usage:
 *   node admin/fix-discoverability.js --dry-run    # Preview changes
 *   node admin/fix-discoverability.js --apply      # Apply changes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ATLAS_PATH = path.join(__dirname, '../data/atlas/ship-size-atlas.json');
const SEARCH_INDEX_PATH = path.join(__dirname, '../assets/data/search-index.json');
const VALIDATION_RESULTS_PATH = '/tmp/validation-results.json';

const DRY_RUN = process.argv.includes('--dry-run');
const APPLY = process.argv.includes('--apply');

if (!DRY_RUN && !APPLY) {
  console.log('Usage: node admin/fix-discoverability.js --dry-run|--apply');
  process.exit(1);
}

// Load validation results
let validationResults;
try {
  validationResults = JSON.parse(fs.readFileSync(VALIDATION_RESULTS_PATH, 'utf8'));
} catch (e) {
  console.error('Error: Run validation first: node admin/validate-ship-page.js --all-ships --json-output > /tmp/validation-results.json');
  process.exit(1);
}

// Load atlas
const atlas = JSON.parse(fs.readFileSync(ATLAS_PATH, 'utf8'));
const searchIndex = JSON.parse(fs.readFileSync(SEARCH_INDEX_PATH, 'utf8'));

console.log('='.repeat(70));
console.log('DISCOVERABILITY FIX SCRIPT');
console.log('='.repeat(70));
console.log(`Mode: ${DRY_RUN ? 'DRY RUN (preview only)' : 'APPLY CHANGES'}\n`);

// ============================================================
// PART 1: Find ships to remove from atlas (score < 90%)
// ============================================================

const shipsToRemoveFromAtlas = [];
const shipsReadyForAtlas = [];

for (const result of validationResults) {
  // Skip non-ship pages
  if (!result.file.match(/ships\/[^/]+\/[^/]+\.html$/) ||
      result.file.includes('index.html')) {
    continue;
  }

  const hasInAtlasNotReady = (result.blocking_errors || []).some(e =>
    e.rule === 'in_atlas_not_ready'
  );

  const hasReadyNotInAtlas = (result.blocking_errors || []).some(e =>
    e.rule === 'ready_not_in_atlas'
  );

  if (hasInAtlasNotReady) {
    // Extract cruise line and slug from file path
    const match = result.file.match(/ships\/([^/]+)\/([^/]+)\.html$/);
    if (match) {
      const [, cruiseLine, slug] = match;
      shipsToRemoveFromAtlas.push({
        file: result.file,
        cruiseLine,
        slug,
        score: result.score
      });
    }
  }

  if (hasReadyNotInAtlas) {
    const match = result.file.match(/ships\/([^/]+)\/([^/]+)\.html$/);
    if (match) {
      const [, cruiseLine, slug] = match;
      shipsReadyForAtlas.push({
        file: result.file,
        cruiseLine,
        slug,
        score: result.score
      });
    }
  }
}

console.log(`Ships to REMOVE from atlas (score < 90%): ${shipsToRemoveFromAtlas.length}`);
for (const ship of shipsToRemoveFromAtlas.slice(0, 10)) {
  console.log(`  - ${ship.cruiseLine}/${ship.slug} (${ship.score}%)`);
}
if (shipsToRemoveFromAtlas.length > 10) {
  console.log(`  ... and ${shipsToRemoveFromAtlas.length - 10} more`);
}

console.log(`\nShips READY for atlas (score >= 90%): ${shipsReadyForAtlas.length}`);
for (const ship of shipsReadyForAtlas) {
  console.log(`  - ${ship.cruiseLine}/${ship.slug} (${ship.score}%)`);
}

// ============================================================
// PART 2: Find ships to add to search index
// ============================================================

const shipsToAddToSearch = [];

for (const result of validationResults) {
  if (!result.file.match(/ships\/[^/]+\/[^/]+\.html$/) ||
      result.file.includes('index.html')) {
    continue;
  }

  const hasNotInSearchIndex = (result.blocking_errors || []).some(e =>
    e.rule === 'not_in_search_index'
  );

  if (hasNotInSearchIndex) {
    const match = result.file.match(/ships\/([^/]+)\/([^/]+)\.html$/);
    if (match) {
      const [, cruiseLine, slug] = match;
      shipsToAddToSearch.push({
        file: result.file,
        cruiseLine,
        slug
      });
    }
  }
}

console.log(`\nShips to ADD to search index: ${shipsToAddToSearch.length}`);
for (const ship of shipsToAddToSearch) {
  console.log(`  - ${ship.cruiseLine}/${ship.slug}`);
}

// ============================================================
// APPLY CHANGES
// ============================================================

if (APPLY) {
  let atlasRemoved = 0;
  let searchAdded = 0;

  // Remove ships from atlas
  const brandMapping = {
    'rcl': 'royal-caribbean',
    'celebrity': 'celebrity-cruises',
    'silversea': 'silversea',
    'carnival': 'carnival',
    'norwegian': 'norwegian',
    'princess': 'princess',
    'holland': 'holland-america',
    'disney': 'disney-cruise-line',
    'msc': 'msc-cruises',
    'virgin-voyages': 'virgin-voyages',
    'cunard': 'cunard',
    'seabourn': 'seabourn',
    'regent': 'regent-seven-seas',
    'oceania': 'oceania-cruises',
    'azamara': 'azamara'
  };

  for (const ship of shipsToRemoveFromAtlas) {
    const brand = brandMapping[ship.cruiseLine] || ship.cruiseLine;
    // Find and remove from atlas
    const shipIdPatterns = [
      `${ship.cruiseLine}-${ship.slug}`,
      `${brand}-${ship.slug}`,
      ship.slug
    ];

    const originalLength = atlas.ships.length;
    atlas.ships = atlas.ships.filter(s => {
      const matches = shipIdPatterns.some(pattern =>
        s.ship_id === pattern ||
        s.ship_id.endsWith(`-${ship.slug}`) ||
        s.name_current?.toLowerCase().replace(/\s+/g, '-') === ship.slug
      );
      if (matches) {
        console.log(`  Removing from atlas: ${s.ship_id} (${s.name_current})`);
      }
      return !matches;
    });

    if (atlas.ships.length < originalLength) {
      atlasRemoved += originalLength - atlas.ships.length;
    }
  }

  // Add ships to search index
  for (const ship of shipsToAddToSearch) {
    // Read the ship HTML to extract title and description
    const htmlPath = path.join(__dirname, '..', ship.file);
    if (!fs.existsSync(htmlPath)) continue;

    const html = fs.readFileSync(htmlPath, 'utf8');
    const $ = cheerio.load(html);

    const title = $('title').text().trim().replace(' | In the Wake', '').replace('In the Wake - ', '');
    const metaDesc = $('meta[name="description"]').attr('content') || '';
    const shipName = $('h1').first().text().trim() || title;

    // Generate CTA
    const cta = `Explore ${shipName} - deck plans, stats, live tracking, and real cruiser stories.`;

    // Generate keywords
    const cruiseLineName = ship.cruiseLine.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const keywords = [
      shipName.toLowerCase(),
      ship.cruiseLine.replace(/-/g, ' '),
      'cruise ship',
      'deck plans',
      'ship stats',
      cruiseLineName.toLowerCase()
    ];

    const newEntry = {
      title: shipName,
      url: `/${ship.file}`,
      description: metaDesc || `Complete guide to ${shipName} including deck plans, specifications, and cruiser reviews.`,
      cta,
      category: 'ship',
      keywords
    };

    // Check if already exists
    const exists = searchIndex.some(e => e.url === newEntry.url);
    if (!exists) {
      searchIndex.push(newEntry);
      console.log(`  Added to search index: ${shipName}`);
      searchAdded++;
    }
  }

  // Update build metadata
  atlas.build_metadata.total_ships = atlas.ships.length;
  atlas.last_updated = new Date().toISOString().split('T')[0];

  // Sort search index alphabetically by title
  searchIndex.sort((a, b) => a.title.localeCompare(b.title));

  // Write files
  fs.writeFileSync(ATLAS_PATH, JSON.stringify(atlas, null, 2) + '\n');
  fs.writeFileSync(SEARCH_INDEX_PATH, JSON.stringify(searchIndex, null, 2) + '\n');

  console.log('\n' + '='.repeat(70));
  console.log('CHANGES APPLIED:');
  console.log(`  - Removed ${atlasRemoved} ships from atlas`);
  console.log(`  - Added ${searchAdded} ships to search index`);
  console.log('='.repeat(70));
} else {
  console.log('\n' + '='.repeat(70));
  console.log('DRY RUN COMPLETE - No changes made');
  console.log('Run with --apply to make changes');
  console.log('='.repeat(70));
}
