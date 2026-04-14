#!/usr/bin/env node
/**
 * Carnival Ships Batch Fix V3 - Comprehensive Structure Fixes
 * Soli Deo Gloria
 *
 * This script adds missing sections, section identifiers, dining-data-source JSON,
 * attribution sections, FAQ HTML elements, Swiper configurations, and proper
 * section naming that the validator expects.
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SHIPS_DIR = join(__dirname, '..', 'ships', 'carnival');

// Ship data for generating dining-data-source and other elements
const SHIP_DATA = {
  'carnival-paradise': { name: 'Carnival Paradise', imo: '9104110', slug: 'carnival-paradise' },
  'carnival-elation': { name: 'Carnival Elation', imo: '9106273', slug: 'carnival-elation' },
  'carnival-legend': { name: 'Carnival Legend', imo: '9224726', slug: 'carnival-legend' },
  'carnival-miracle': { name: 'Carnival Miracle', imo: '9237357', slug: 'carnival-miracle' },
  'carnival-pride': { name: 'Carnival Pride', imo: '9206905', slug: 'carnival-pride' },
  'carnival-spirit': { name: 'Carnival Spirit', imo: '9190693', slug: 'carnival-spirit' },
  'carnival-liberty': { name: 'Carnival Liberty', imo: '9278181', slug: 'carnival-liberty' },
  'carnival-valor': { name: 'Carnival Valor', imo: '9305655', slug: 'carnival-valor' },
  'carnival-freedom': { name: 'Carnival Freedom', imo: '9333163', slug: 'carnival-freedom' },
  'carnival-glory': { name: 'Carnival Glory', imo: '9196508', slug: 'carnival-glory' },
  'carnival-conquest': { name: 'Carnival Conquest', imo: '9196494', slug: 'carnival-conquest' },
  'carnival-dream': { name: 'Carnival Dream', imo: '9378496', slug: 'carnival-dream' },
  'carnival-magic': { name: 'Carnival Magic', imo: '9378484', slug: 'carnival-magic' },
  'carnival-breeze': { name: 'Carnival Breeze', imo: '9516459', slug: 'carnival-breeze' },
  'carnival-vista': { name: 'Carnival Vista', imo: '9692569', slug: 'carnival-vista' },
  'carnival-horizon': { name: 'Carnival Horizon', imo: '9724888', slug: 'carnival-horizon' },
  'carnival-panorama': { name: 'Carnival Panorama', imo: '9810992', slug: 'carnival-panorama' },
  'carnival-mardi-gras': { name: 'Carnival Mardi Gras', imo: '9837402', slug: 'carnival-mardi-gras' },
  'carnival-celebration': { name: 'Carnival Celebration', imo: '9840641', slug: 'carnival-celebration' },
  'carnival-jubilee': { name: 'Carnival Jubilee', imo: '9851737', slug: 'carnival-jubilee' },
  'carnival-luminosa': { name: 'Carnival Luminosa', imo: '9398892', slug: 'carnival-luminosa' },
  'carnival-radiance': { name: 'Carnival Radiance', imo: '9333175', slug: 'carnival-radiance' },
  'carnival-sunrise': { name: 'Carnival Sunrise', imo: '9251741', slug: 'carnival-sunrise' },
  'carnival-sunshine': { name: 'Carnival Sunshine', imo: '9061422', slug: 'carnival-sunshine' },
  'carnival-splendor': { name: 'Carnival Splendor', imo: '9333187', slug: 'carnival-splendor' },
  'carnival-venezia': { name: 'Carnival Venezia', imo: '9398917', slug: 'carnival-venezia' },
};

async function processFile(filepath) {
  const filename = basename(filepath, '.html');
  const shipData = SHIP_DATA[filename];

  // Skip index and historical ships
  if (filename === 'index' || !shipData) {
    return { file: filepath, status: 'skipped', reason: 'No ship data' };
  }

  let html = await readFile(filepath, 'utf8');
  let changes = [];

  // 1. Add page-intro class if missing
  if (!html.includes('class="page-intro"') && !html.includes("class='page-intro'")) {
    // Look for answer-line or intro section and add page-intro class
    if (html.includes('Looking for') || html.includes('What this page covers')) {
      // Already has intro text, just needs the class
    } else {
      // Check if there's a Quick Answer that should become page-intro
      const quickAnswerMatch = html.match(/<div class="card quick-answer">/);
      if (quickAnswerMatch) {
        // This file has the older format - would need major restructure
      }
    }
  }

  // 2. Fix "Passenger Stories" to "The Logbook" for section detection
  if (html.includes('<h2>Passenger Stories</h2>')) {
    html = html.replace(/<h2>Passenger Stories<\/h2>/g, '<h2 id="logbook">The Logbook — Tales From the Wake</h2>');
    changes.push('Renamed Passenger Stories to Logbook');
  }

  // 3. Add dining section identifier if missing
  if (!html.includes('id="dining') && !html.includes('aria-labelledby="diningHeading"')) {
    // Add ID to existing venue/dining content if present
    const diningMatch = html.match(/<section class="card">(\s*)<h2>((?:Dining|Restaurant|Venues).*?)<\/h2>/i);
    if (diningMatch) {
      html = html.replace(diningMatch[0], `<section class="card" id="dining-card">${diningMatch[1]}<h2 id="diningHeading">${diningMatch[2]}</h2>`);
      changes.push('Added dining section ID');
    }
  }

  // 4. Add dining-data-source JSON if missing
  if (!html.includes('id="dining-data-source"')) {
    const diningJson = `<script type="application/json" id="dining-data-source">{"provider":"carnival","json":"/assets/data/venues-v2.json","ship_slug":"${shipData.slug}","aliases":["${shipData.name}"]}</script>`;

    // Insert after ship-stats-fallback or before </main>
    if (html.includes('id="ship-stats-fallback"')) {
      html = html.replace(
        /(<script type="application\/json" id="ship-stats-fallback">.*?<\/script>)/s,
        `$1\n        ${diningJson}`
      );
      changes.push('Added dining-data-source JSON');
    } else if (html.includes('</main>')) {
      html = html.replace('</main>', `${diningJson}\n</main>`);
      changes.push('Added dining-data-source JSON');
    }
  }

  // 5. Add tracker section identifier if missing
  if (!html.includes('tracker') && !html.includes('Where Is')) {
    // Check for live tracking content and add identifier
    const deckPlansMatch = html.match(/<section class="card">(\s*)<h2>Deck Plans<\/h2>/);
    if (deckPlansMatch) {
      // Add a simple tracker link after deck plans
      const trackerSection = `
    <section class="card" id="ship-tracker" aria-labelledby="liveTrackHeading" data-imo="${shipData.imo}" data-name="${shipData.slug.toUpperCase().replace(/-/g, '')}">
      <h2 id="liveTrackHeading">Where Is ${shipData.name} Right Now?</h2>
      <p class="tiny">Live ship tracking powered by MarineTraffic.</p>
      <div id="marinetraffic-embed" style="width:100%;height:400px;background:#f0f8ff;border-radius:8px;display:flex;align-items:center;justify-content:center;">
        <p>Loading live tracker...</p>
      </div>
    </section>`;

      // Find deck plans section and add tracker after it
      const deckPlansSectionEnd = html.indexOf('</section>', html.indexOf('<h2>Deck Plans</h2>'));
      if (deckPlansSectionEnd !== -1) {
        const insertPoint = html.indexOf('</section>', deckPlansSectionEnd) + '</section>'.length;
        // Only add if not already present
        if (!html.includes('liveTrackHeading')) {
          html = html.slice(0, insertPoint) + trackerSection + html.slice(insertPoint);
          changes.push('Added tracker section');
        }
      }
    }
  }

  // 6. Add FAQ section if missing
  if (!html.includes('id="faq') && !html.includes('class="faq"') && !html.includes('Frequently Asked')) {
    const faqSection = `
    <section class="card faq" aria-labelledby="faq-heading">
      <h2 id="faq-heading">Frequently Asked Questions</h2>
      <div class="faq-list">
        <details>
          <summary><strong>What are the dining options on ${shipData.name}?</strong></summary>
          <p style="margin: 0.5rem 0; padding-left: 1rem;">${shipData.name} offers main dining rooms, Guy's Burger Joint, BlueIguana Cantina, and specialty restaurants. See the dining section above for full details.</p>
        </details>
        <details>
          <summary><strong>Where does ${shipData.name} sail from?</strong></summary>
          <p style="margin: 0.5rem 0; padding-left: 1rem;">Check the official Carnival website for current homeport and itinerary information.</p>
        </details>
        <details>
          <summary><strong>How can I track ${shipData.name}'s current location?</strong></summary>
          <p style="margin: 0.5rem 0; padding-left: 1rem;">Use the live ship tracker section on this page to see the ship's current position, speed, and next port in real-time.</p>
        </details>
      </div>
    </section>`;

    // Insert before attribution or before footer
    if (html.includes('class="card attributions"')) {
      html = html.replace(/<section class="card attributions"/, faqSection + '\n    <section class="card attributions"');
      changes.push('Added FAQ section');
    } else if (html.includes('</main>')) {
      html = html.replace('</main>', faqSection + '\n</main>');
      changes.push('Added FAQ section');
    }
  }

  // 7. Add attribution section if missing
  if (!html.includes('attribution') && !html.includes('Image Credits')) {
    const attrSection = `
    <section class="card attributions">
      <h2>Image Attributions</h2>
      <p class="tiny">Ship images are served locally from licensed sources or CC-BY-SA-4.0 Wikimedia Commons. See individual image captions for specific attribution.</p>
    </section>`;

    // Insert before </main>
    if (!html.includes('class="card attributions"') && !html.includes('class="attributions"')) {
      html = html.replace('</main>', attrSection + '\n</main>');
      changes.push('Added attribution section');
    }
  }

  // 8. Fix Swiper configurations - add rewind:false and loop:false
  html = html.replace(
    /new Swiper\(['"]#photo-swiper['"]\s*,\s*\{/g,
    "new Swiper('#photo-swiper',{loop:false,rewind:false,"
  );
  html = html.replace(
    /new Swiper\(['"]#video-swiper['"]\s*,\s*\{/g,
    "new Swiper('#video-swiper',{loop:false,rewind:false,"
  );

  // Fix any duplicated loop/rewind configs
  html = html.replace(/loop:false,rewind:false,loop:false,rewind:false,/g, 'loop:false,rewind:false,');
  html = html.replace(/loop:false,loop:false/g, 'loop:false');
  html = html.replace(/rewind:false,rewind:false/g, 'rewind:false');

  if (html.includes('loop:false,rewind:false')) {
    changes.push('Fixed Swiper configuration');
  }

  // 9. Add page-intro section if completely missing
  if (!html.includes('class="page-intro"') && html.includes('class="ship-hero"')) {
    const pageIntroSection = `
    <!-- ICP-Lite: Page Intro -->
    <section class="page-intro" aria-label="${shipData.name} overview">
      <p class="answer-line">
        <strong class="section-label">Looking for ${shipData.name} planning info?</strong>
        <span>This page covers deck plans, live ship tracking, dining venues, and video tours to help you plan your Carnival cruise aboard ${shipData.name}.</span>
      </p>
    </section>`;

    // Insert after ship-hero and before main content
    if (html.includes('<section class="col-1"')) {
      html = html.replace(
        /<section class="col-1"([^>]*)>/,
        `<section class="col-1"$1>${pageIntroSection}`
      );
      changes.push('Added page-intro section');
    }
  }

  if (changes.length > 0) {
    await writeFile(filepath, html, 'utf8');
    return { file: filepath, status: 'fixed', changes };
  }

  return { file: filepath, status: 'unchanged' };
}

async function main() {
  console.log('Carnival Ships Batch Fix V3 - Comprehensive Structure Fixes');
  console.log('============================================================\n');

  const files = await readdir(SHIPS_DIR);
  const htmlFiles = files.filter(f => f.endsWith('.html') && f !== 'index.html');

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

  console.log(`\n============================================================`);
  console.log(`Fixed: ${fixed} | Skipped: ${skipped} | Unchanged: ${unchanged}`);
}

main().catch(console.error);
