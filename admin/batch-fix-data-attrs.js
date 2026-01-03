#!/usr/bin/env node
/**
 * Batch Fix: Add data-ship and data-imo attributes
 * Soli Deo Gloria
 *
 * Adds data-ship attribute to an element and data-imo for ship tracking.
 * For TBN ships, uses data-imo="TBD". For historic ships, skips data-imo.
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

// Known IMO numbers for ships (extracted from existing pages)
const KNOWN_IMOS = {
  // RCL ships with known IMOs
  'adventure-of-the-seas': '9167227',
  'allure-of-the-seas': '9383948',
  'anthem-of-the-seas': '9656101',
  'brilliance-of-the-seas': '9195200',
  'enchantment-of-the-seas': '9102991',
  'explorer-of-the-seas': '9161728',
  'freedom-of-the-seas': '9304033',
  'grandeur-of-the-seas': '9102989',
  'harmony-of-the-seas': '9682875',
  'icon-of-the-seas': '9849453',
  'independence-of-the-seas': '9349681',
  'jewel-of-the-seas': '9228344',
  'liberty-of-the-seas': '9355648',
  'mariner-of-the-seas': '9227508',
  'navigator-of-the-seas': '9227510',
  'oasis-of-the-seas': '9383936',
  'odyssey-of-the-seas': '9792901',
  'ovation-of-the-seas': '9697753',
  'quantum-of-the-seas': '9549463',
  'radiance-of-the-seas': '9195195',
  'rhapsody-of-the-seas': '9116864',
  'serenade-of-the-seas': '9228332',
  'spectrum-of-the-seas': '9697765',
  'symphony-of-the-seas': '9744001',
  'utopia-of-the-seas': '9944073',
  'vision-of-the-seas': '9116876',
  'voyager-of-the-seas': '9161716',
  'wonder-of-the-seas': '9838039',
  'star-of-the-seas': '9944085'
};

function extractShipName(html, filename) {
  // Try to get from ai-breadcrumbs name field
  const breadcrumbsMatch = html.match(/<!-- ai-breadcrumbs[\s\S]*?name:\s*([^\n]+)/);
  if (breadcrumbsMatch) {
    return breadcrumbsMatch[1].trim();
  }

  // Try to get from title
  const titleMatch = html.match(/<title>([^•<]+)/);
  if (titleMatch) {
    return titleMatch[1].trim();
  }

  // Fallback to filename
  return basename(filename, '.html')
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function isTBNShip(filename, html) {
  const name = filename.toLowerCase();
  return name.includes('tbn') ||
         name.includes('announced') ||
         name.includes('class-ship') ||
         html.includes('TBN') ||
         html.includes('To Be Named');
}

function isHistoricShip(html) {
  // Check for indicators of historic/retired ships
  return html.includes('Historic Ship') ||
         html.includes('Retired') ||
         html.includes('Scrapped') ||
         html.includes('Out of Service') ||
         /entered.service.*19[0-7]\d/i.test(html) || // Ships from 1900-1979
         /built.*19[0-7]\d/i.test(html);
}

function addDataAttrs(html, filename, cruiseLine) {
  const shipName = extractShipName(html, filename);
  const slug = basename(filename, '.html');
  const isTBN = isTBNShip(filename, html);
  const isHistoric = isHistoricShip(html);
  let changes = [];

  // Add data-ship if missing
  if (!html.includes('data-ship=')) {
    // Try to add to first card section
    if (html.includes('class="card"') || html.includes("class='card'")) {
      html = html.replace(
        /<section([^>]*)(class=["'][^"']*card[^"']*["'])/i,
        `<section$1$2 data-ship="${shipName}"`
      );
      changes.push('Added data-ship to card section');
    }
    // Try to add to main element
    else if (html.includes('<main')) {
      html = html.replace(
        /<main([^>]*)>/i,
        `<main$1 data-ship="${shipName}">`
      );
      changes.push('Added data-ship to main element');
    }
  }

  // Add data-imo if missing (skip for historic ships)
  if (!html.includes('data-imo=') && !isHistoric) {
    const imo = KNOWN_IMOS[slug] || (isTBN ? 'TBD' : null);

    if (imo) {
      // Try to add to ship-tracker section
      if (html.includes('id="ship-tracker"')) {
        html = html.replace(
          /<section([^>]*)id="ship-tracker"([^>]*)>/i,
          `<section$1id="ship-tracker"$2 data-imo="${imo}">`
        );
        changes.push(`Added data-imo="${imo}" to ship-tracker`);
      }
      // Try to add to itinerary section
      else if (html.includes('class="card itinerary"') || html.includes("class='card itinerary'")) {
        html = html.replace(
          /<section([^>]*)(class=["'][^"']*itinerary[^"']*["'])([^>]*)>/i,
          `<section$1$2$3 data-imo="${imo}">`
        );
        changes.push(`Added data-imo="${imo}" to itinerary section`);
      }
      // Create a simple ship-tracker section if none exists and it's a TBN with TBD imo
      else if (isTBN) {
        const trackerSection = `
    <!-- Ship Tracker Placeholder -->
    <section id="ship-tracker" class="card" data-imo="TBD" data-name="${slug.toUpperCase().replace(/-/g, '')}">
      <h2>Ship Tracking</h2>
      <p>Live tracking will be available when this ship enters service.</p>
    </section>`;

        // Insert before </main>
        if (html.includes('</main>')) {
          html = html.replace('</main>', `${trackerSection}\n  </main>`);
          changes.push('Added ship-tracker section with data-imo="TBD"');
        }
      }
    }
  }

  return { html, changes };
}

async function processFile(filepath, cruiseLine) {
  const html = await readFile(filepath, 'utf8');
  const result = addDataAttrs(html, filepath, cruiseLine);

  if (result.changes.length > 0) {
    await writeFile(filepath, result.html, 'utf8');
    return { status: 'fixed', changes: result.changes };
  }

  const hasShip = html.includes('data-ship=');
  const hasImo = html.includes('data-imo=');

  return {
    status: hasShip && hasImo ? 'complete' : 'unchanged',
    hasShip,
    hasImo
  };
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

  let fixed = 0, complete = 0;

  for (const file of htmlFiles) {
    const filepath = join(lineDir, file);
    const result = await processFile(filepath, cruiseLine);

    if (result.status === 'fixed') {
      console.log(`  ✅ ${file}: ${result.changes.join(', ')}`);
      fixed++;
    } else if (result.status === 'complete') {
      complete++;
    }
  }

  return { cruiseLine, fixed, complete, total: htmlFiles.length };
}

async function main() {
  console.log('Batch Fix: Add data-ship and data-imo attributes');
  console.log('=================================================\n');

  let totalFixed = 0;
  let totalComplete = 0;
  let totalFiles = 0;

  for (const cruiseLine of CRUISE_LINES) {
    console.log(`\n[${cruiseLine}]`);
    const result = await processCruiseLine(cruiseLine);

    if (result.error) {
      console.log(`  ⚠️ Error: ${result.error}`);
    } else {
      console.log(`  Summary: ${result.fixed} fixed, ${result.complete} already complete`);
      totalFixed += result.fixed;
      totalComplete += result.complete;
      totalFiles += result.total;
    }
  }

  console.log('\n=================================================');
  console.log(`Total: ${totalFixed} files fixed, ${totalComplete} already complete (${totalFiles} total)`);
}

main().catch(console.error);
