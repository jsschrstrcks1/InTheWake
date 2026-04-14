#!/usr/bin/env node
/**
 * Batch Fix Carnival Ships V2 - Comprehensive Fixes
 * Soli Deo Gloria
 *
 * Fixes all automatable validation errors to reach 100/100:
 * 1. Add #ship-stats-fallback JSON element
 * 2. Add #dining-data-source JSON element
 * 3. Add #recent-rail-nav-top and #recent-rail-nav-bottom
 * 4. Fix Swiper configs (rewind:false, loop:false)
 * 5. Add aria-labels to Swipers
 * 6. Improve short alt text
 * 7. Add loading="lazy" to images
 * 8. Fix carousel navigation aria-labels
 * 9. Add whimsical units container if missing
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Ship data for stats fallback
const CARNIVAL_SHIP_DATA = {
  'carnival-breeze': { name: 'Carnival Breeze', class: 'Dream Class', year: 2012, gt: '130,000 GT', guests: '3,690', crew: '1,386', length: '1,004 ft (306 m)', beam: '158 ft (48 m)', registry: 'Panama' },
  'carnival-celebration': { name: 'Carnival Celebration', class: 'Excel Class', year: 2022, gt: '183,521 GT', guests: '5,374', crew: '1,735', length: '1,130 ft (344 m)', beam: '140 ft (43 m)', registry: 'Panama' },
  'carnival-conquest': { name: 'Carnival Conquest', class: 'Conquest Class', year: 2002, gt: '110,000 GT', guests: '2,974', crew: '1,150', length: '952 ft (290 m)', beam: '116 ft (35 m)', registry: 'Panama' },
  'carnival-dream': { name: 'Carnival Dream', class: 'Dream Class', year: 2009, gt: '130,000 GT', guests: '3,646', crew: '1,367', length: '1,004 ft (306 m)', beam: '158 ft (48 m)', registry: 'Panama' },
  'carnival-elation': { name: 'Carnival Elation', class: 'Fantasy Class', year: 1998, gt: '70,367 GT', guests: '2,056', crew: '920', length: '855 ft (261 m)', beam: '103 ft (31 m)', registry: 'Panama' },
  'carnival-firenze': { name: 'Carnival Firenze', class: 'Spirit Class', year: 2024, gt: '86,000 GT', guests: '2,680', crew: '930', length: '960 ft (293 m)', beam: '106 ft (32 m)', registry: 'Panama' },
  'carnival-freedom': { name: 'Carnival Freedom', class: 'Conquest Class', year: 2007, gt: '110,320 GT', guests: '2,974', crew: '1,150', length: '952 ft (290 m)', beam: '116 ft (35 m)', registry: 'Panama' },
  'carnival-glory': { name: 'Carnival Glory', class: 'Conquest Class', year: 2003, gt: '110,000 GT', guests: '2,974', crew: '1,150', length: '952 ft (290 m)', beam: '116 ft (35 m)', registry: 'Panama' },
  'carnival-horizon': { name: 'Carnival Horizon', class: 'Vista Class', year: 2018, gt: '133,500 GT', guests: '3,954', crew: '1,450', length: '1,055 ft (322 m)', beam: '122 ft (37 m)', registry: 'Panama' },
  'carnival-jubilee': { name: 'Carnival Jubilee', class: 'Excel Class', year: 2023, gt: '183,521 GT', guests: '5,374', crew: '1,735', length: '1,130 ft (344 m)', beam: '140 ft (43 m)', registry: 'Panama' },
  'carnival-legend': { name: 'Carnival Legend', class: 'Spirit Class', year: 2002, gt: '86,000 GT', guests: '2,124', crew: '930', length: '960 ft (293 m)', beam: '106 ft (32 m)', registry: 'Panama' },
  'carnival-liberty': { name: 'Carnival Liberty', class: 'Conquest Class', year: 2005, gt: '110,320 GT', guests: '2,974', crew: '1,150', length: '952 ft (290 m)', beam: '116 ft (35 m)', registry: 'Panama' },
  'carnival-luminosa': { name: 'Carnival Luminosa', class: 'Spirit Class', year: 2009, gt: '92,720 GT', guests: '2,260', crew: '1,050', length: '964 ft (294 m)', beam: '106 ft (32 m)', registry: 'Panama' },
  'carnival-magic': { name: 'Carnival Magic', class: 'Dream Class', year: 2011, gt: '130,000 GT', guests: '3,690', crew: '1,386', length: '1,004 ft (306 m)', beam: '158 ft (48 m)', registry: 'Panama' },
  'carnival-mardi-gras': { name: 'Carnival Mardi Gras', class: 'Excel Class', year: 2021, gt: '180,800 GT', guests: '5,282', crew: '1,745', length: '1,130 ft (344 m)', beam: '140 ft (43 m)', registry: 'Panama' },
  'carnival-miracle': { name: 'Carnival Miracle', class: 'Spirit Class', year: 2004, gt: '86,000 GT', guests: '2,124', crew: '930', length: '960 ft (293 m)', beam: '106 ft (32 m)', registry: 'Panama' },
  'carnival-panorama': { name: 'Carnival Panorama', class: 'Vista Class', year: 2019, gt: '133,500 GT', guests: '3,954', crew: '1,450', length: '1,055 ft (322 m)', beam: '122 ft (37 m)', registry: 'Panama' },
  'carnival-paradise': { name: 'Carnival Paradise', class: 'Fantasy Class', year: 1998, gt: '70,367 GT', guests: '2,056', crew: '920', length: '855 ft (261 m)', beam: '103 ft (31 m)', registry: 'Panama' },
  'carnival-pride': { name: 'Carnival Pride', class: 'Spirit Class', year: 2002, gt: '86,000 GT', guests: '2,124', crew: '930', length: '960 ft (293 m)', beam: '106 ft (32 m)', registry: 'Panama' },
  'carnival-radiance': { name: 'Carnival Radiance', class: 'Sunshine Class', year: 2022, gt: '102,000 GT', guests: '2,984', crew: '1,040', length: '893 ft (272 m)', beam: '116 ft (35 m)', registry: 'Panama' },
  'carnival-spirit': { name: 'Carnival Spirit', class: 'Spirit Class', year: 2001, gt: '86,000 GT', guests: '2,124', crew: '930', length: '960 ft (293 m)', beam: '106 ft (32 m)', registry: 'Panama' },
  'carnival-splendor': { name: 'Carnival Splendor', class: 'Splendor Class', year: 2008, gt: '113,300 GT', guests: '3,006', crew: '1,150', length: '952 ft (290 m)', beam: '116 ft (35 m)', registry: 'Panama' },
  'carnival-sunrise': { name: 'Carnival Sunrise', class: 'Sunshine Class', year: 2019, gt: '102,000 GT', guests: '2,984', crew: '1,040', length: '893 ft (272 m)', beam: '116 ft (35 m)', registry: 'Panama' },
  'carnival-sunshine': { name: 'Carnival Sunshine', class: 'Sunshine Class', year: 2013, gt: '102,853 GT', guests: '2,974', crew: '1,040', length: '893 ft (272 m)', beam: '116 ft (35 m)', registry: 'Panama' },
  'carnival-valor': { name: 'Carnival Valor', class: 'Conquest Class', year: 2004, gt: '110,000 GT', guests: '2,974', crew: '1,150', length: '952 ft (290 m)', beam: '116 ft (35 m)', registry: 'Panama' },
  'carnival-venezia': { name: 'Carnival Venezia', class: 'Spirit Class', year: 2023, gt: '86,000 GT', guests: '2,680', crew: '930', length: '960 ft (293 m)', beam: '106 ft (32 m)', registry: 'Panama' },
  'carnival-vista': { name: 'Carnival Vista', class: 'Vista Class', year: 2016, gt: '133,500 GT', guests: '3,936', crew: '1,450', length: '1,055 ft (322 m)', beam: '122 ft (37 m)', registry: 'Panama' },
  'mardi-gras': { name: 'Mardi Gras', class: 'Excel Class', year: 2021, gt: '180,800 GT', guests: '5,282', crew: '1,745', length: '1,130 ft (344 m)', beam: '140 ft (43 m)', registry: 'Panama' },
  'carnival-adventure': { name: 'Carnival Adventure', class: 'Grand Class (ex-Princess)', year: 2025, gt: '109,000 GT', guests: '2,600', crew: '1,100', length: '951 ft (290 m)', beam: '118 ft (36 m)', registry: 'Panama' },
  'carnival-encounter': { name: 'Carnival Encounter', class: 'Grand Class (ex-Princess)', year: 2025, gt: '109,000 GT', guests: '2,600', crew: '1,100', length: '951 ft (290 m)', beam: '118 ft (36 m)', registry: 'Panama' },
};

let stats = { filesProcessed: 0, fixesApplied: 0, errors: [] };

/**
 * Add #ship-stats-fallback JSON element if missing
 */
function addShipStatsFallback(html, slug) {
  if (html.includes('id="ship-stats-fallback"')) return html;

  const shipData = CARNIVAL_SHIP_DATA[slug];
  if (!shipData) return html;

  const statsJson = JSON.stringify({
    slug: slug,
    name: shipData.name,
    class: shipData.class,
    entered_service: shipData.year,
    gt: shipData.gt,
    guests: shipData.guests,
    crew: shipData.crew,
    length: shipData.length,
    beam: shipData.beam,
    registry: shipData.registry
  });

  // Find stats section or key facts and add fallback after it
  const statsPattern = /(<div[^>]*id="ship-stats"[^>]*>.*?<\/div>)/is;
  if (statsPattern.test(html)) {
    const fixed = html.replace(statsPattern, `$1\n          <script type="application/json" id="ship-stats-fallback">${statsJson}</script>`);
    if (fixed !== html) {
      stats.fixesApplied++;
      return fixed;
    }
  }

  // Alternative: Add after Key Facts heading
  const keyFactsPattern = /(<section[^>]*class="[^"]*card[^"]*"[^>]*>[\s\S]*?<h[23][^>]*>(?:Key Facts|Ship Statistics)[^<]*<\/h[23]>)/i;
  if (keyFactsPattern.test(html)) {
    const fixed = html.replace(keyFactsPattern, `$1\n          <div id="ship-stats" class="stats-grid" data-slug="${slug}"></div>\n          <script type="application/json" id="ship-stats-fallback">${statsJson}</script>`);
    if (fixed !== html) {
      stats.fixesApplied++;
      return fixed;
    }
  }

  return html;
}

/**
 * Add #dining-data-source JSON element if missing
 */
function addDiningDataSource(html, slug) {
  if (html.includes('id="dining-data-source"')) return html;

  const diningJson = JSON.stringify({
    provider: "carnival",
    json: "/assets/data/venues-v2.json",
    ship_slug: slug,
    aliases: [CARNIVAL_SHIP_DATA[slug]?.name || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')]
  });

  // Find dining section and add source
  const diningPattern = /(<section[^>]*(?:aria-labelledby="dining"|id="dining")[^>]*>)/i;
  if (diningPattern.test(html)) {
    const fixed = html.replace(diningPattern, `$1\n        <script type="application/json" id="dining-data-source">${diningJson}</script>`);
    if (fixed !== html) {
      stats.fixesApplied++;
      return fixed;
    }
  }

  return html;
}

/**
 * Add rail navigation elements if missing
 */
function addRailNavElements(html) {
  let fixed = html;
  let count = 0;

  // Add nav-top if missing
  if (!html.includes('id="recent-rail-nav-top"')) {
    const recentRailPattern = /(<div\s+id="recent-rail"[^>]*>)/i;
    if (recentRailPattern.test(fixed)) {
      fixed = fixed.replace(recentRailPattern,
        `<nav id="recent-rail-nav-top" class="rail-nav" aria-label="Article pagination" style="display:none; margin-bottom: 0.5rem;"></nav>\n      $1`);
      count++;
    }
  }

  // Add nav-bottom if missing
  if (!html.includes('id="recent-rail-nav-bottom"')) {
    const recentRailEndPattern = /(<div\s+id="recent-rail"[^>]*>.*?<\/div>)(\s*<p\s+id="recent-rail-fallback")/is;
    if (recentRailEndPattern.test(fixed)) {
      fixed = fixed.replace(recentRailEndPattern,
        `$1\n      <nav id="recent-rail-nav-bottom" class="rail-nav" aria-label="Article pagination" style="display:none; margin-top: 0.75rem;"></nav>$2`);
      count++;
    }
  }

  if (count > 0) stats.fixesApplied += count;
  return fixed;
}

/**
 * Add aria-labels to Swiper carousels
 */
function addSwiperAriaLabels(html, slug) {
  let fixed = html;
  let count = 0;
  const shipName = CARNIVAL_SHIP_DATA[slug]?.name || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Photo swiper
  if (fixed.includes('id="photo-swiper"') && !fixed.includes('id="photo-swiper" aria-label')) {
    fixed = fixed.replace(/id="photo-swiper"(?!\s*aria-label)/g, `id="photo-swiper" aria-label="${shipName} photo gallery"`);
    count++;
  }

  // Video swiper
  if (fixed.includes('id="video-swiper"') && !fixed.includes('id="video-swiper" aria-label')) {
    fixed = fixed.replace(/id="video-swiper"(?!\s*aria-label)/g, `id="video-swiper" aria-label="${shipName} video gallery"`);
    count++;
  }

  // Generic swipers with class
  fixed = fixed.replace(/<div\s+class="swiper"(?!\s*aria-label)([^>]*)>/g, (match, rest) => {
    if (!rest.includes('aria-label')) {
      count++;
      return `<div class="swiper" aria-label="Image carousel"${rest}>`;
    }
    return match;
  });

  if (count > 0) stats.fixesApplied += count;
  return fixed;
}

/**
 * Add aria-labels to Swiper navigation buttons
 */
function addNavButtonAriaLabels(html) {
  let fixed = html;
  let count = 0;

  // Previous buttons
  fixed = fixed.replace(/<div\s+class="swiper-button-prev"(?!\s*aria-label)(\s*)>/g, (match, space) => {
    count++;
    return `<div class="swiper-button-prev" aria-label="Previous slide"${space}>`;
  });

  // Next buttons
  fixed = fixed.replace(/<div\s+class="swiper-button-next"(?!\s*aria-label)(\s*)>/g, (match, space) => {
    count++;
    return `<div class="swiper-button-next" aria-label="Next slide"${space}>`;
  });

  if (count > 0) stats.fixesApplied += count;
  return fixed;
}

/**
 * Fix Swiper configurations
 */
function fixSwiperConfigs(html) {
  let fixed = html;
  let count = 0;

  // Add rewind:false after loop:false
  fixed = fixed.replace(/loop:\s*false(?![\s\S]{0,20}rewind:)/g, () => {
    count++;
    return 'loop:false,rewind:false';
  });

  // Fix loop:true to loop:false
  fixed = fixed.replace(/loop:\s*true/g, () => {
    count++;
    return 'loop:false';
  });

  if (count > 0) stats.fixesApplied += count;
  return fixed;
}

/**
 * Improve short alt text
 */
function improveAltText(html, slug) {
  let fixed = html;
  let count = 0;
  const shipName = CARNIVAL_SHIP_DATA[slug]?.name || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Fix very short alt text on ship images
  fixed = fixed.replace(/alt="([^"]{1,19})"(\s+(?:loading|src))/g, (match, alt, rest) => {
    // Skip if it's a placeholder or icon
    if (alt.includes('icon') || alt.includes('logo') || alt === '') return match;

    // Expand short alt text
    if (alt.toLowerCase().includes(slug.replace(/-/g, ' ').toLowerCase()) ||
        alt.toLowerCase().includes('ship') ||
        alt.toLowerCase().includes('carnival')) {
      count++;
      return `alt="${shipName} cruise ship at sea"${rest}`;
    }
    return match;
  });

  if (count > 0) stats.fixesApplied += count;
  return fixed;
}

/**
 * Add loading="lazy" to images missing it
 */
function addLazyLoading(html) {
  let fixed = html;
  let count = 0;

  // Add loading="lazy" to images that don't have loading attribute
  // Skip first image (should be eager)
  let firstImage = true;
  fixed = fixed.replace(/<img\s+([^>]*?)(?<!\s+loading="[^"]*")(\s*\/?>)/g, (match, attrs, end) => {
    if (firstImage) {
      firstImage = false;
      if (!attrs.includes('loading=')) {
        count++;
        return `<img ${attrs} loading="eager"${end}`;
      }
      return match;
    }
    if (!attrs.includes('loading=')) {
      count++;
      return `<img ${attrs} loading="lazy"${end}`;
    }
    return match;
  });

  if (count > 0) stats.fixesApplied += count;
  return fixed;
}

/**
 * Add whimsical units container if missing
 */
function addWhimsicalUnits(html) {
  if (html.includes('id="whimsical-units-container"')) return html;

  // Find the aside/rail section and add whimsical units
  const railPattern = /(<\/section>\s*<\/aside>)/i;
  if (railPattern.test(html)) {
    const whimsicalHtml = `
    <!-- Whimsical Distance Units -->
    <section class="card" id="whimsical-units-container" style="background:#f7fdff;border:1px solid #e0f0f5;border-radius:12px;padding:1.25rem;">
    </section>
  </section>
  </aside>`;

    const fixed = html.replace(railPattern, whimsicalHtml);
    if (fixed !== html) {
      stats.fixesApplied++;
      return fixed;
    }
  }

  return html;
}

/**
 * Process a single file
 */
async function processFile(filepath) {
  const slug = basename(filepath, '.html');

  if (slug === 'index') {
    console.log(`  Skipping index file`);
    return;
  }

  try {
    let html = await readFile(filepath, 'utf-8');
    const originalHtml = html;

    // Apply all fixes
    html = addShipStatsFallback(html, slug);
    html = addDiningDataSource(html, slug);
    html = addRailNavElements(html);
    html = addSwiperAriaLabels(html, slug);
    html = addNavButtonAriaLabels(html);
    html = fixSwiperConfigs(html);
    html = improveAltText(html, slug);
    html = addLazyLoading(html);
    html = addWhimsicalUnits(html);

    if (html !== originalHtml) {
      await writeFile(filepath, html);
      console.log(`  ✓ Fixed: ${basename(filepath)}`);
    } else {
      console.log(`  - No changes: ${basename(filepath)}`);
    }

    stats.filesProcessed++;

  } catch (error) {
    stats.errors.push({ file: filepath, error: error.message });
    console.error(`  ✗ Error: ${basename(filepath)} - ${error.message}`);
  }
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);
  let targetDir = join(PROJECT_ROOT, 'ships', 'carnival');

  if (args.length > 0 && !args[0].startsWith('--')) {
    targetDir = args[0];
  }

  console.log('\n🚢 Carnival Ship Batch Fix V2 - Comprehensive Fixes');
  console.log('='.repeat(60));
  console.log(`Target: ${targetDir}\n`);

  try {
    const files = await readdir(targetDir);
    const htmlFiles = files.filter(f => f.endsWith('.html'));

    console.log(`Found ${htmlFiles.length} HTML files\n`);

    for (const file of htmlFiles) {
      await processFile(join(targetDir, file));
    }

    console.log('\n' + '='.repeat(60));
    console.log(`Files processed: ${stats.filesProcessed}`);
    console.log(`Fixes applied: ${stats.fixesApplied}`);

    if (stats.errors.length > 0) {
      console.log(`\nErrors (${stats.errors.length}):`);
      stats.errors.forEach(e => console.log(`  - ${e.file}: ${e.error}`));
    }

  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

main();
