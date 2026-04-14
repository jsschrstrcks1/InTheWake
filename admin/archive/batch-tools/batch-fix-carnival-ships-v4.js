#!/usr/bin/env node
/**
 * Carnival Ships Batch Fix V4 - Page Intro and Recent Rail
 * Soli Deo Gloria
 *
 * Adds missing page-intro and recent-rail sections to Carnival ship pages.
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SHIPS_DIR = join(__dirname, '..', 'ships', 'carnival');

// Ship metadata for generating content
const SHIP_DATA = {
  'carnival-breeze': { name: 'Carnival Breeze', homeport: 'Galveston', class: 'Dream Class', desc: 'family-friendly Fun Ship with WaterWorks aqua park' },
  'carnival-celebration': { name: 'Carnival Celebration', homeport: 'Miami', class: 'Excel Class', desc: 'newest Excel-class ship with BOLT roller coaster' },
  'carnival-conquest': { name: 'Carnival Conquest', homeport: 'Miami', class: 'Conquest Class', desc: 'classic Conquest-class entertainment' },
  'carnival-dream': { name: 'Carnival Dream', homeport: 'Galveston', class: 'Dream Class', desc: 'Dream-class innovation and entertainment' },
  'carnival-elation': { name: 'Carnival Elation', homeport: 'Jacksonville', class: 'Fantasy Class', desc: 'compact Fantasy-class fun for short getaways' },
  'carnival-firenze': { name: 'Carnival Firenze', homeport: 'Long Beach', class: 'Spirit Class', desc: 'Italian-themed Costa-conversion with unique flair' },
  'carnival-freedom': { name: 'Carnival Freedom', homeport: 'Miami', class: 'Conquest Class', desc: 'Conquest-class variety and value' },
  'carnival-glory': { name: 'Carnival Glory', homeport: 'Norfolk', class: 'Conquest Class', desc: 'Heroes Tribute Lounge honoring military service' },
  'carnival-horizon': { name: 'Carnival Horizon', homeport: 'Miami', class: 'Vista Class', desc: 'Vista-class innovation with SkyRide' },
  'carnival-jubilee': { name: 'Carnival Jubilee', homeport: 'Galveston', class: 'Excel Class', desc: 'Texas-themed Excel-class with BOLT roller coaster' },
  'carnival-legend': { name: 'Carnival Legend', homeport: 'Baltimore', class: 'Spirit Class', desc: 'Spirit-class cruising from Baltimore' },
  'carnival-liberty': { name: 'Carnival Liberty', homeport: 'Port Canaveral', class: 'Conquest Class', desc: 'Conquest-class Fun Ship near Orlando' },
  'carnival-luminosa': { name: 'Carnival Luminosa', homeport: 'Brisbane', class: 'Spirit Class', desc: 'Australia-based Spirit-class cruising' },
  'carnival-magic': { name: 'Carnival Magic', homeport: 'Port Canaveral', class: 'Dream Class', desc: 'Dream-class entertainment near Orlando' },
  'carnival-mardi-gras': { name: 'Carnival Mardi Gras', homeport: 'Port Canaveral', class: 'Excel Class', desc: 'flagship Excel-class with BOLT roller coaster' },
  'carnival-miracle': { name: 'Carnival Miracle', homeport: 'Long Beach', class: 'Spirit Class', desc: 'West Coast Spirit-class adventure' },
  'carnival-panorama': { name: 'Carnival Panorama', homeport: 'Long Beach', class: 'Vista Class', desc: 'Vista-class innovation from California' },
  'carnival-paradise': { name: 'Carnival Paradise', homeport: 'Tampa', class: 'Fantasy Class', desc: 'historic non-smoking ship from Tampa' },
  'carnival-pride': { name: 'Carnival Pride', homeport: 'Baltimore', class: 'Spirit Class', desc: 'Spirit-class cruising from Baltimore' },
  'carnival-radiance': { name: 'Carnival Radiance', homeport: 'Long Beach', class: 'Conquest Class', desc: 'Conquest-class innovation from Long Beach' },
  'carnival-spirit': { name: 'Carnival Spirit', homeport: 'Sydney', class: 'Spirit Class', desc: 'Australia-based Spirit-class cruising' },
  'carnival-splendor': { name: 'Carnival Splendor', homeport: 'Long Beach', class: 'Splendor Class', desc: 'unique Splendor-class design from California' },
  'carnival-sunrise': { name: 'Carnival Sunrise', homeport: 'Miami', class: 'Destiny Class', desc: 'refreshed Destiny-class Fun Ship' },
  'carnival-sunshine': { name: 'Carnival Sunshine', homeport: 'Charleston', class: 'Destiny Class', desc: 'Destiny-class cruising from Charleston' },
  'carnival-valor': { name: 'Carnival Valor', homeport: 'New Orleans', class: 'Conquest Class', desc: 'Conquest-class Fun Ship from NOLA' },
  'carnival-venezia': { name: 'Carnival Venezia', homeport: 'New York', class: 'Spirit Class', desc: 'Italian-themed Costa-conversion from NYC' },
  'carnival-vista': { name: 'Carnival Vista', homeport: 'Galveston', class: 'Vista Class', desc: 'Vista-class innovation with SkyRide' },
};

async function processFile(filepath) {
  const filename = basename(filepath, '.html');
  const shipData = SHIP_DATA[filename];

  // Skip files without ship data
  if (!shipData) {
    return { file: filepath, status: 'skipped', reason: 'No ship data' };
  }

  let html = await readFile(filepath, 'utf8');
  let changes = [];

  // 1. Add page-intro if missing
  if (!html.includes('class="page-intro"')) {
    const pageIntroSection = `
    <!-- ICP-Lite: Page Intro -->
    <section class="page-intro" aria-label="${shipData.name} overview">
      <p class="answer-line">
        <strong class="section-label">Looking for ${shipData.name} planning info?</strong>
        <span>This page covers deck plans, live ship tracking, dining venues, and video tours to help you plan your Carnival cruise aboard ${shipData.name} from ${shipData.homeport}.</span>
      </p>
      <p class="content-text">
        ${shipData.name} is a ${shipData.class} vessel featuring ${shipData.desc}. Whether you're planning your first cruise or are a seasoned traveler, this guide helps you discover what makes this ship special.
      </p>
    </section>
`;

    // Find the insertion point after col-1 section opening
    const insertPatterns = [
      /(<section class="col-1"[^>]*>)\s*\n?\s*(<div class="content-column">)/,
      /(<section class="col-1"[^>]*>)\s*\n/
    ];

    for (const pattern of insertPatterns) {
      if (pattern.test(html)) {
        html = html.replace(pattern, (match, p1, p2) => {
          if (p2) {
            return p1 + pageIntroSection + '\n' + p2;
          }
          return p1 + pageIntroSection;
        });
        changes.push('Added page-intro section');
        break;
      }
    }
  }

  // 2. Add recent-rail if missing
  if (!html.includes('id="recent-rail"') && !html.includes('recent-rail-title')) {
    const recentRailSection = `    <section class="card" aria-labelledby="recent-rail-title">
      <h3 id="recent-rail-title">Recent Stories</h3>
      <nav id="recent-rail-nav-top" class="rail-nav" aria-label="Article pagination" style="display:none; margin-bottom: 0.5rem;"></nav>
      <div id="recent-rail" class="rail-list" aria-live="polite"></div>
      <nav id="recent-rail-nav-bottom" class="rail-nav" aria-label="Article pagination" style="display:none; margin-top: 0.75rem;"></nav>
      <p id="recent-rail-fallback" class="tiny">Loading articles…</p>
    </section>
`;

    // Find aside section and add after author card
    const asidePatterns = [
      /(<section class="card author-card[^"]*"[^>]*>.*?<\/section>)\s*(\n?\s*<!--|\n?\s*<section class="card" id="whimsical)/s,
      /(class="rail col-2"[^>]*>)\s*\n/
    ];

    for (const pattern of asidePatterns) {
      if (pattern.test(html)) {
        html = html.replace(pattern, (match, p1, p2) => {
          if (p2) {
            return p1 + '\n' + recentRailSection + p2;
          }
          return p1 + '\n' + recentRailSection;
        });
        changes.push('Added recent-rail section');
        break;
      }
    }
  }

  if (changes.length > 0) {
    await writeFile(filepath, html, 'utf8');
    return { file: filepath, status: 'fixed', changes };
  }

  return { file: filepath, status: 'unchanged' };
}

async function main() {
  console.log('Carnival Ships Batch Fix V4 - Page Intro and Recent Rail');
  console.log('=========================================================\n');

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
      console.log(`⚪ ${file}: No changes needed`);
      unchanged++;
    }
  }

  console.log(`\n=========================================================`);
  console.log(`Fixed: ${fixed} | Skipped: ${skipped} | Unchanged: ${unchanged}`);
}

main().catch(console.error);
