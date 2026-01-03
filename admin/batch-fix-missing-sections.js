#!/usr/bin/env node
/**
 * Batch Fix: Add missing required sections
 * Soli Deo Gloria
 *
 * Adds missing sections: first_look, map, tracker, attribution, logbook, videos
 * Models structure after passing RCL ship pages.
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SHIPS_DIR = join(__dirname, '..', 'ships');

const CRUISE_LINES = [
  'carnival', 'celebrity-cruises', 'costa', 'cunard', 'explora-journeys',
  'holland-america-line', 'msc', 'norwegian', 'oceania', 'princess',
  'rcl', 'regent', 'seabourn', 'silversea', 'virgin-voyages'
];

const CRUISE_LINE_NAMES = {
  'carnival': 'Carnival Cruise Line',
  'celebrity-cruises': 'Celebrity Cruises',
  'costa': 'Costa Cruises',
  'cunard': 'Cunard Line',
  'explora-journeys': 'Explora Journeys',
  'holland-america-line': 'Holland America Line',
  'msc': 'MSC Cruises',
  'norwegian': 'Norwegian Cruise Line',
  'oceania': 'Oceania Cruises',
  'princess': 'Princess Cruises',
  'rcl': 'Royal Caribbean International',
  'regent': 'Regent Seven Seas Cruises',
  'seabourn': 'Seabourn Cruise Line',
  'silversea': 'Silversea Cruises',
  'virgin-voyages': 'Virgin Voyages'
};

function extractShipName(html, filename) {
  const breadcrumbsMatch = html.match(/<!-- ai-breadcrumbs[\s\S]*?name:\s*([^\n]+)/);
  if (breadcrumbsMatch) return breadcrumbsMatch[1].trim();
  const titleMatch = html.match(/<title>([^•<]+)/);
  if (titleMatch) return titleMatch[1].trim();
  return basename(filename, '.html').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function getFirstLookSection(shipName, cruiseLineName) {
  return `
    <!-- First Look Section -->
    <section class="card" aria-labelledby="first-look">
      <h2 id="first-look">A First Look</h2>
      <div class="grid-2" style="gap: 1.5rem;">
        <div>
          <p>${shipName} offers a memorable cruise experience with ${cruiseLineName}. This ship features modern amenities, diverse dining options, and entertainment for all ages.</p>
          <p>Explore the deck plans below to familiarize yourself with the ship's layout, or check out the dining section to see available restaurants and venues.</p>
        </div>
        <div id="ship-stats" class="stats-grid" data-slug=""></div>
      </div>
    </section>`;
}

function getLogbookSection(shipName, slug, cruiseLine) {
  return `
    <!-- Ken's Logbook Section -->
    <section class="card note-kens-logbook" aria-labelledby="logbook">
      <h2 id="logbook">Ken's Logbook: ${shipName}</h2>
      <div id="logbook-container" data-ship="${slug}" data-line="${cruiseLine}">
        <p class="placeholder">Stories and insights from cruisers who have sailed on ${shipName} will appear here.</p>
      </div>
    </section>`;
}

function getVideosSection(shipName, slug) {
  return `
    <!-- Video Highlights Section -->
    <section class="card" aria-labelledby="video-highlights">
      <h2 id="video-highlights">Video Tours & Reviews</h2>
      <div id="video-container" class="swiper-container" data-ship-videos="${slug}">
        <p class="placeholder">Video tours and reviews of ${shipName} will be loaded here.</p>
      </div>
    </section>`;
}

function getMapTrackerSection(shipName, slug, imo) {
  const imoAttr = imo ? `data-imo="${imo}"` : 'data-imo="TBD"';
  return `
    <!-- Deck Plans & Tracker Grid -->
    <div class="grid-2">
      <section class="card" aria-labelledby="deck-plans">
        <h2 id="deck-plans">Deck Plans</h2>
        <div id="ship-map" data-ship="${slug}">
          <p>Interactive deck plans for ${shipName} are available on the cruise line's official website.</p>
        </div>
      </section>

      <section class="card itinerary" aria-labelledby="liveTrackHeading" ${imoAttr} data-name="${slug.toUpperCase().replace(/-/g, '')}">
        <h2 id="liveTrackHeading">Live Ship Tracker</h2>
        <div id="ship-tracker-container">
          <p>Track ${shipName}'s current position and voyage details.</p>
        </div>
      </section>
    </div>`;
}

function getAttributionSection() {
  return `
    <!-- Attribution Section -->
    <section class="card attributions">
      <h3>Sources & Attribution</h3>
      <p class="small">Ship specifications from official cruise line materials. Photos credited where shown. Data verified against industry sources.</p>
    </section>`;
}

function getNavRailSection() {
  return `
      <!-- Recent Articles Navigation -->
      <section class="card" id="recent-rail-nav-bottom" aria-labelledby="recent-rail-title">
        <h3 id="recent-rail-title">Recent Articles</h3>
        <nav aria-label="Recent articles">
          <ul class="rail-links">
            <li><a href="/articles/index.html">View all articles</a></li>
          </ul>
        </nav>
      </section>`;
}

function addMissingSections(html, cruiseLine, filename) {
  const shipName = extractShipName(html, filename);
  const slug = basename(filename, '.html');
  const cruiseLineName = CRUISE_LINE_NAMES[cruiseLine] || cruiseLine;
  let changes = [];

  // Check for IMO in existing content
  const imoMatch = html.match(/data-imo="(\d{7})"/);
  const imo = imoMatch ? imoMatch[1] : null;

  // Add first-look section if missing
  if (!html.includes('id="first-look"') && !html.includes("id='first-look'")) {
    // Insert after page-intro section
    if (html.includes('</section>') && html.includes('page-intro')) {
      const firstLook = getFirstLookSection(shipName, cruiseLineName);
      html = html.replace(
        /(<section class="page-intro">[\s\S]*?<\/section>)/,
        `$1\n${firstLook}`
      );
      changes.push('first-look');
    }
  }

  // Add logbook section if missing
  if (!html.includes('note-kens-logbook') && !html.includes('id="logbook"')) {
    const logbook = getLogbookSection(shipName, slug, cruiseLine);
    // Insert before FAQ section or before footer
    if (html.includes('class="card faq"') || html.includes('id="faq"')) {
      html = html.replace(
        /(<section class="card faq")/,
        `${logbook}\n\n    $1`
      );
      changes.push('logbook');
    }
  }

  // Add videos section if missing
  if (!html.includes('id="video-highlights"') && !html.includes('video-container')) {
    const videos = getVideosSection(shipName, slug);
    // Insert after logbook or before FAQ
    if (html.includes('note-kens-logbook')) {
      html = html.replace(
        /(<\/section>\s*)(<!--[^>]*Ken's Logbook|<section class="card note-kens-logbook"[\s\S]*?<\/section>)/,
        `$2\n${videos}`
      );
      changes.push('videos');
    } else if (html.includes('class="card faq"')) {
      html = html.replace(
        /(<section class="card faq")/,
        `${videos}\n\n    $1`
      );
      changes.push('videos');
    }
  }

  // Add map/tracker section if missing
  if (!html.includes('id="deck-plans"') && !html.includes('id="ship-map"')) {
    const mapTracker = getMapTrackerSection(shipName, slug, imo);
    // Insert after videos or before FAQ
    if (html.includes('id="video-highlights"')) {
      html = html.replace(
        /(<section class="card" aria-labelledby="video-highlights">[\s\S]*?<\/section>)/,
        `$1\n\n${mapTracker}`
      );
      changes.push('map-tracker');
    } else if (html.includes('class="card faq"')) {
      html = html.replace(
        /(<section class="card faq")/,
        `${mapTracker}\n\n    $1`
      );
      changes.push('map-tracker');
    }
  }

  // Add attribution section if missing
  if (!html.includes('class="card attributions"') && !html.includes("attributions")) {
    const attribution = getAttributionSection();
    // Insert before </main>
    if (html.includes('</main>')) {
      html = html.replace(
        '</main>',
        `\n${attribution}\n  </main>`
      );
      changes.push('attribution');
    }
  }

  // Add recent-rail-nav-bottom if missing
  if (!html.includes('id="recent-rail-nav-bottom"') && !html.includes('recent-rail-nav')) {
    const navRail = getNavRailSection();
    // Insert in the aside/rail section before </aside>
    if (html.includes('</aside>')) {
      html = html.replace(
        '</aside>',
        `${navRail}\n    </aside>`
      );
      changes.push('recent-rail-nav');
    }
  }

  return { html, changes };
}

async function processFile(filepath, cruiseLine) {
  const html = await readFile(filepath, 'utf8');
  const result = addMissingSections(html, cruiseLine, filepath);

  if (result.changes.length > 0) {
    await writeFile(filepath, result.html, 'utf8');
    return { status: 'fixed', changes: result.changes };
  }

  return { status: 'unchanged' };
}

async function processCruiseLine(cruiseLine) {
  const lineDir = join(SHIPS_DIR, cruiseLine);
  let files;
  try {
    files = await readdir(lineDir);
  } catch (e) {
    return { cruiseLine, error: e.message, fixed: 0 };
  }

  const htmlFiles = files.filter(f =>
    f.endsWith('.html') &&
    f !== 'index.html' &&
    !f.includes('unnamed')
  );

  let fixed = 0;

  for (const file of htmlFiles) {
    const filepath = join(lineDir, file);
    const result = await processFile(filepath, cruiseLine);

    if (result.status === 'fixed') {
      console.log(`  ✅ ${file}: Added ${result.changes.join(', ')}`);
      fixed++;
    }
  }

  return { cruiseLine, fixed, total: htmlFiles.length };
}

async function main() {
  console.log('Batch Fix: Add missing required sections');
  console.log('=========================================\n');

  let totalFixed = 0;
  let totalFiles = 0;

  for (const cruiseLine of CRUISE_LINES) {
    console.log(`\n[${cruiseLine}]`);
    const result = await processCruiseLine(cruiseLine);

    if (result.error) {
      console.log(`  ⚠️ Error: ${result.error}`);
    } else {
      console.log(`  Summary: ${result.fixed} files fixed`);
      totalFixed += result.fixed;
      totalFiles += result.total;
    }
  }

  console.log('\n=========================================');
  console.log(`Total: ${totalFixed} files fixed (${totalFiles} total)`);
}

main().catch(console.error);
