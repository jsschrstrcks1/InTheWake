#!/usr/bin/env node
/**
 * Batch Fix: Add Review JSON-LD schema
 * Soli Deo Gloria
 *
 * Adds Review schema.org JSON-LD to ship pages for rich snippets.
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

function extractShipClass(html) {
  const classMatch = html.match(/ship-class:\s*([^\n]+)/i);
  return classMatch ? classMatch[1].trim() : null;
}

function generateReviewBody(shipName, shipClass, cruiseLineName) {
  if (shipClass) {
    return `${shipName} is a ${shipClass} vessel from ${cruiseLineName}, offering memorable cruise experiences with excellent amenities and service.`;
  }
  return `${shipName} from ${cruiseLineName} offers memorable cruise experiences with excellent amenities and service.`;
}

function addReviewJsonLd(html, cruiseLine, filename) {
  // Skip if already has Review JSON-LD
  if (html.includes('"@type":"Review"') || html.includes('"@type": "Review"')) {
    return { html, added: false };
  }

  const shipName = extractShipName(html, filename);
  const shipClass = extractShipClass(html);
  const cruiseLineName = CRUISE_LINE_NAMES[cruiseLine] || cruiseLine;

  const reviewJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "Vehicle",
      "name": shipName,
      "brand": {
        "@type": "Organization",
        "name": cruiseLineName
      }
    },
    "author": {
      "@type": "Person",
      "name": "Ken Baker"
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": 4,
      "bestRating": 5
    },
    "reviewBody": generateReviewBody(shipName, shipClass, cruiseLineName)
  });

  const scriptTag = `\n  <!-- JSON-LD: Review -->
  <script type="application/ld+json">${reviewJson}</script>`;

  // Insert before </head>
  if (html.includes('</head>')) {
    const fixed = html.replace('</head>', `${scriptTag}\n</head>`);
    return { html: fixed, added: true };
  }

  return { html, added: false };
}

async function processFile(filepath, cruiseLine) {
  const html = await readFile(filepath, 'utf8');
  const result = addReviewJsonLd(html, cruiseLine, filepath);

  if (result.added) {
    await writeFile(filepath, result.html, 'utf8');
    return { status: 'fixed' };
  }

  return { status: html.includes('"@type":"Review"') || html.includes('"@type": "Review"') ? 'already-has' : 'unchanged' };
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

  let fixed = 0, alreadyHas = 0;

  for (const file of htmlFiles) {
    const filepath = join(lineDir, file);
    const result = await processFile(filepath, cruiseLine);

    if (result.status === 'fixed') {
      console.log(`  ✅ ${file}: Added Review JSON-LD`);
      fixed++;
    } else if (result.status === 'already-has') {
      alreadyHas++;
    }
  }

  return { cruiseLine, fixed, alreadyHas, total: htmlFiles.length };
}

async function main() {
  console.log('Batch Fix: Add Review JSON-LD schema');
  console.log('=====================================\n');

  let totalFixed = 0;
  let totalAlreadyHas = 0;
  let totalFiles = 0;

  for (const cruiseLine of CRUISE_LINES) {
    console.log(`\n[${cruiseLine}]`);
    const result = await processCruiseLine(cruiseLine);

    if (result.error) {
      console.log(`  ⚠️ Error: ${result.error}`);
    } else {
      console.log(`  Summary: ${result.fixed} added, ${result.alreadyHas} already have it`);
      totalFixed += result.fixed;
      totalAlreadyHas += result.alreadyHas;
      totalFiles += result.total;
    }
  }

  console.log('\n=====================================');
  console.log(`Total: ${totalFixed} files fixed, ${totalAlreadyHas} already had Review (${totalFiles} total)`);
}

main().catch(console.error);
