#!/usr/bin/env node
/**
 * Carnival Ships Batch Fix V5 - Add Dining Sections
 * Soli Deo Gloria
 *
 * Adds dining sections to ships that are missing them, improving section order
 * compliance for the ship page validator.
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SHIPS_DIR = join(__dirname, '..', 'ships', 'carnival');

// Ship metadata
const SHIP_DATA = {
  'carnival-breeze': { name: 'Carnival Breeze', slug: 'carnival-breeze' },
  'carnival-celebration': { name: 'Carnival Celebration', slug: 'carnival-celebration' },
  'carnival-conquest': { name: 'Carnival Conquest', slug: 'carnival-conquest' },
  'carnival-dream': { name: 'Carnival Dream', slug: 'carnival-dream' },
  'carnival-elation': { name: 'Carnival Elation', slug: 'carnival-elation' },
  'carnival-firenze': { name: 'Carnival Firenze', slug: 'carnival-firenze' },
  'carnival-freedom': { name: 'Carnival Freedom', slug: 'carnival-freedom' },
  'carnival-glory': { name: 'Carnival Glory', slug: 'carnival-glory' },
  'carnival-horizon': { name: 'Carnival Horizon', slug: 'carnival-horizon' },
  'carnival-legend': { name: 'Carnival Legend', slug: 'carnival-legend' },
  'carnival-liberty': { name: 'Carnival Liberty', slug: 'carnival-liberty' },
  'carnival-luminosa': { name: 'Carnival Luminosa', slug: 'carnival-luminosa' },
  'carnival-magic': { name: 'Carnival Magic', slug: 'carnival-magic' },
  'carnival-mardi-gras': { name: 'Carnival Mardi Gras', slug: 'carnival-mardi-gras' },
  'carnival-miracle': { name: 'Carnival Miracle', slug: 'carnival-miracle' },
  'carnival-panorama': { name: 'Carnival Panorama', slug: 'carnival-panorama' },
  'carnival-paradise': { name: 'Carnival Paradise', slug: 'carnival-paradise' },
  'carnival-pride': { name: 'Carnival Pride', slug: 'carnival-pride' },
  'carnival-radiance': { name: 'Carnival Radiance', slug: 'carnival-radiance' },
  'carnival-spirit': { name: 'Carnival Spirit', slug: 'carnival-spirit' },
  'carnival-splendor': { name: 'Carnival Splendor', slug: 'carnival-splendor' },
  'carnival-sunrise': { name: 'Carnival Sunrise', slug: 'carnival-sunrise' },
  'carnival-sunshine': { name: 'Carnival Sunshine', slug: 'carnival-sunshine' },
  'carnival-valor': { name: 'Carnival Valor', slug: 'carnival-valor' },
  'carnival-venezia': { name: 'Carnival Venezia', slug: 'carnival-venezia' },
  'carnival-vista': { name: 'Carnival Vista', slug: 'carnival-vista' },
};

function createDiningSection(shipData) {
  return `
    <!-- Dining Section -->
    <section id="dining-card" class="card" data-ship="${shipData.name}" aria-labelledby="diningHeading">
      <h2 id="diningHeading">Dining Venues on ${shipData.name} <a href="/restaurants.html" style="font-size: 0.75rem; font-weight: 400; text-decoration: none; color: var(--accent); opacity: 0.8;" aria-label="Browse all restaurants">→ Browse All</a></h2>
      <p class="section-intro">Explore the dining options available on ${shipData.name}, from complimentary venues to specialty restaurants.</p>
      <div class="dining-content" id="dining-content" aria-live="polite">
        <p class="tiny">Loading venue information...</p>
      </div>
      <script type="application/json" id="dining-data-source">{"provider":"carnival","json":"/assets/data/venues-v2.json","ship_slug":"${shipData.slug}","aliases":["${shipData.name}"]}</script>
    </section>
`;
}

async function processFile(filepath) {
  const filename = basename(filepath, '.html');
  const shipData = SHIP_DATA[filename];

  if (!shipData) {
    return { file: filepath, status: 'skipped', reason: 'No ship data' };
  }

  let html = await readFile(filepath, 'utf8');
  let changes = [];

  // Check if dining section already exists
  if (html.includes('id="dining-card"') || html.includes('id="diningHeading"')) {
    return { file: filepath, status: 'unchanged', reason: 'Dining section exists' };
  }

  // Find the best place to insert dining section
  // Expected order: page_intro → first_look → dining → logbook → videos
  // Insert after First Look section or Photo Gallery

  // Try to find First Look or Photo Gallery section end
  const patterns = [
    // After First Look section
    /<section[^>]*aria-labelledby="overview-title"[^>]*>[\s\S]*?<\/section>/,
    // After Photo Gallery section
    /<section[^>]*aria-labelledby="photos-title"[^>]*>[\s\S]*?<\/section>/,
    // After any "First Look" heading
    /<section[^>]*>\s*<h2[^>]*>First Look[^<]*<\/h2>[\s\S]*?<\/section>/,
  ];

  let inserted = false;
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      const insertPoint = html.indexOf(match[0]) + match[0].length;
      html = html.slice(0, insertPoint) + createDiningSection(shipData) + html.slice(insertPoint);
      changes.push('Added dining section after First Look');
      inserted = true;
      break;
    }
  }

  // If no good insertion point found, try inserting before logbook
  if (!inserted) {
    const logbookPatterns = [
      /<section[^>]*aria-labelledby="logbook-title"[^>]*>/,
      /<section[^>]*>\s*<h2[^>]*>Guest Logbook[^<]*<\/h2>/,
      /<section[^>]*>\s*<h2[^>]*>The Logbook[^<]*<\/h2>/,
      /<section[^>]*>\s*<h2[^>]*id="logbook"[^>]*>/,
    ];

    for (const pattern of logbookPatterns) {
      const match = html.match(pattern);
      if (match) {
        const insertPoint = html.indexOf(match[0]);
        html = html.slice(0, insertPoint) + createDiningSection(shipData) + '\n' + html.slice(insertPoint);
        changes.push('Added dining section before Logbook');
        inserted = true;
        break;
      }
    }
  }

  // Remove duplicate dining-data-source if we just added it
  if (inserted) {
    // Check for duplicate dining-data-source scripts (keep only the one in our new section)
    const diningSourceCount = (html.match(/id="dining-data-source"/g) || []).length;
    if (diningSourceCount > 1) {
      // Remove the old one (usually after ship-stats-fallback)
      html = html.replace(
        /(\s*<script type="application\/json" id="dining-data-source">[^<]*<\/script>)(?=\s*<\/section>)/,
        ''
      );
      changes.push('Removed duplicate dining-data-source');
    }
  }

  if (changes.length > 0) {
    await writeFile(filepath, html, 'utf8');
    return { file: filepath, status: 'fixed', changes };
  }

  return { file: filepath, status: 'unchanged' };
}

async function main() {
  console.log('Carnival Ships Batch Fix V5 - Add Dining Sections');
  console.log('==================================================\n');

  const files = await readdir(SHIPS_DIR);
  const htmlFiles = files.filter(f => f.endsWith('.html') && f !== 'index.html' && !f.includes('-1') && !f.includes('unnamed'));

  let fixed = 0, skipped = 0, unchanged = 0;

  for (const file of htmlFiles) {
    const filepath = join(SHIPS_DIR, file);
    const result = await processFile(filepath);

    if (result.status === 'fixed') {
      console.log(`✅ ${file}: ${result.changes.join(', ')}`);
      fixed++;
    } else if (result.status === 'skipped') {
      console.log(`⏭️  ${file}: ${result.reason}`);
      skipped++;
    } else {
      console.log(`⚪ ${file}: ${result.reason || 'No changes needed'}`);
      unchanged++;
    }
  }

  console.log(`\n==================================================`);
  console.log(`Fixed: ${fixed} | Skipped: ${skipped} | Unchanged: ${unchanged}`);
}

main().catch(console.error);
