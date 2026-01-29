#!/usr/bin/env node
/**
 * fix-venue-images.js
 * Fixes image duplication in venue pages by:
 * 1. Using an appropriate photo for the Overview section
 * 2. Using matching SVG icons for other card sections
 *
 * Usage: node admin/fix-venue-images.js [--dry-run] [--slug=<slug>]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const venuesPath = path.join(__dirname, '..', 'assets', 'data', 'venues-v2.json');
const restaurantsDir = path.join(__dirname, '..', 'restaurants');

const venuesData = JSON.parse(fs.readFileSync(venuesPath, 'utf8'));

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const singleSlug = (args.find(a => a.startsWith('--slug=')) || '').replace('--slug=', '');

// Photo mappings by venue subcategory/type
const PHOTO_MAP = {
  // Dining
  'mdr': '/assets/images/restaurants/photos/formal-dining.webp',
  'specialty': '/assets/images/restaurants/photos/formal-dining.webp',
  'casual-dining': '/assets/images/restaurants/photos/buffet.webp',
  'buffet': '/assets/images/restaurants/photos/buffet.webp',
  'counter-service': '/assets/images/restaurants/photos/hotdog.webp',
  'cafe': '/assets/images/restaurants/photos/croissant.webp',

  // Cuisine-specific
  'italian': '/assets/images/restaurants/photos/italian.webp',
  'asian': '/assets/images/restaurants/photos/sushi.webp',
  'sushi': '/assets/images/restaurants/photos/sushi.webp',
  'mexican': '/assets/images/restaurants/photos/tacos.webp',
  'bbq': '/assets/images/restaurants/photos/buffet.webp',
  'seafood': '/assets/images/restaurants/photos/sushi.webp',
  'pizza': '/assets/images/restaurants/photos/pizza.webp',
  'steakhouse': '/assets/images/restaurants/photos/formal-dining.webp',

  // Bars
  'cocktail-bars': '/assets/images/restaurants/photos/cocktail-lounge.webp',
  'pubs': '/assets/images/restaurants/photos/bar-lounge.webp',
  'wine-bars': '/assets/images/restaurants/photos/cocktail.webp',
  'pool-bars': '/assets/images/restaurants/photos/cocktail.webp',
  'lounges': '/assets/images/restaurants/photos/cocktail-lounge.webp',
  'sports-bars': '/assets/images/restaurants/photos/bar-lounge.webp',

  // Desserts/Coffee
  'desserts': '/assets/images/restaurants/photos/croissant.webp',
  'ice-cream': '/assets/images/restaurants/photos/croissant.webp',
  'coffee': '/assets/images/restaurants/photos/croissant.webp',

  // Default
  'default': '/assets/images/restaurants/photos/formal-dining.webp',
};

// SVG icon mappings by category
const SVG_MAP = {
  'dining': 'https://cruisinginthewake.com/assets/images/restaurants/specialty-dining.svg',
  'bars': 'https://cruisinginthewake.com/assets/images/restaurants/bar-lounge.svg',
  'entertainment': 'https://cruisinginthewake.com/assets/images/restaurants/bar-lounge.svg',
  'activities': 'https://cruisinginthewake.com/assets/images/restaurants/bar-lounge.svg',
  'neighborhoods': 'https://cruisinginthewake.com/assets/images/restaurants/specialty-dining.svg',

  // Subcategory specific
  'italian': 'https://cruisinginthewake.com/assets/images/restaurants/italian-cuisine.svg',
  'asian': 'https://cruisinginthewake.com/assets/images/restaurants/asian-cuisine.svg',
  'sushi': 'https://cruisinginthewake.com/assets/images/restaurants/asian-cuisine.svg',
  'mexican': 'https://cruisinginthewake.com/assets/images/restaurants/mexican-cuisine.svg',
  'bbq': 'https://cruisinginthewake.com/assets/images/restaurants/bbq-grill.svg',
  'seafood': 'https://cruisinginthewake.com/assets/images/restaurants/seafood.svg',
  'pizza': 'https://cruisinginthewake.com/assets/images/restaurants/pizza.svg',
  'steakhouse': 'https://cruisinginthewake.com/assets/images/restaurants/steakhouse.svg',
  'buffet': 'https://cruisinginthewake.com/assets/images/restaurants/buffet.svg',
  'desserts': 'https://cruisinginthewake.com/assets/images/restaurants/desserts.svg',
  'ice-cream': 'https://cruisinginthewake.com/assets/images/restaurants/desserts.svg',
  'coffee': 'https://cruisinginthewake.com/assets/images/restaurants/coffee-shop.svg',
  'cafe': 'https://cruisinginthewake.com/assets/images/restaurants/coffee-shop.svg',
  'pubs': 'https://cruisinginthewake.com/assets/images/restaurants/bar-lounge.svg',
  'cocktail-bars': 'https://cruisinginthewake.com/assets/images/restaurants/bar-lounge.svg',
  'wine-bars': 'https://cruisinginthewake.com/assets/images/restaurants/bar-lounge.svg',
  'lounges': 'https://cruisinginthewake.com/assets/images/restaurants/bar-lounge.svg',
  'pool-bars': 'https://cruisinginthewake.com/assets/images/restaurants/bar-lounge.svg',
  'sports-bars': 'https://cruisinginthewake.com/assets/images/restaurants/bar-lounge.svg',

  'default': 'https://cruisinginthewake.com/assets/images/restaurants/specialty-dining.svg',
};

// Special venue-to-cuisine mappings for venues that need specific treatment
const VENUE_CUISINE_MAP = {
  'giovannis-italian-kitchen': 'italian',
  'jamies-italian': 'italian',
  'izumi': 'sushi',
  'izumi-in-the-park': 'sushi',
  'izumi-hibachi-sushi': 'sushi',
  'hot-pot': 'asian',
  'sichuan-red': 'asian',
  'silk': 'asian',
  'sabor': 'mexican',
  'sabor-taqueria': 'mexican',
  'ritas-cantina': 'mexican',
  'el-loco-fresh': 'mexican',
  'mason-jar': 'bbq',
  'portside-bbq': 'bbq',
  'chops-grille': 'steakhouse',
  'hooked-seafood': 'seafood',
  'fish-and-ships': 'seafood',
  'sorrentos': 'pizza',
  'ben-and-jerrys': 'ice-cream',
  'sugar-beach': 'desserts',
  'sprinkles': 'ice-cream',
  'desserted': 'desserts',
  'cafe-promenade': 'cafe',
  'starbucks': 'coffee',
  'leaf-and-bean': 'coffee',
  'rye-and-bean': 'coffee',
  'boardwalk-dog-house': 'counter-service',
  'johnny-rockets': 'counter-service',
  'playmakers': 'sports-bars',
};

// Build venue lookup from venues-v2.json
const venueInfo = {};
for (const [category, subcats] of Object.entries(venuesData.categories)) {
  for (const [subcat, venues] of Object.entries(subcats)) {
    for (const venue of venues) {
      venueInfo[venue.slug] = {
        category,
        subcategory: subcat,
        name: venue.name,
      };
    }
  }
}

function getVenueType(slug) {
  // Check special mappings first
  if (VENUE_CUISINE_MAP[slug]) {
    return VENUE_CUISINE_MAP[slug];
  }

  const info = venueInfo[slug];
  if (!info) return 'default';

  // Check subcategory
  if (PHOTO_MAP[info.subcategory]) {
    return info.subcategory;
  }

  // Fall back to category
  return info.category || 'default';
}

function getPhoto(slug) {
  const type = getVenueType(slug);
  return PHOTO_MAP[type] || PHOTO_MAP['default'];
}

function getSvg(slug) {
  const type = getVenueType(slug);
  const info = venueInfo[slug];

  // Check type-specific first
  if (SVG_MAP[type]) {
    return SVG_MAP[type];
  }

  // Fall back to category
  if (info && SVG_MAP[info.category]) {
    return SVG_MAP[info.category];
  }

  return SVG_MAP['default'];
}

function fixImages(filePath, slug) {
  let html = fs.readFileSync(filePath, 'utf8');
  const original = html;

  const photo = getPhoto(slug);
  const svg = getSvg(slug);

  // Find all image references in card sections
  // Pattern: <section class="card"...>\n    <img src="..." alt="" aria-hidden="true">

  // Track which section we're in
  const sections = ['overview', 'accommodations', 'availability', 'logbook', 'sources', 'faq'];
  let changes = 0;

  // Replace images in each section type
  // Overview gets the photo, others get the SVG

  // First, find all photo/svg references and their section context
  const imgPattern = /(<section\s+class="card[^"]*"\s+id="(\w+)"[^>]*>\s*\n\s*<img\s+src=")([^"]+)("\s+alt=""\s+aria-hidden="true">)/g;

  html = html.replace(imgPattern, (match, prefix, sectionId, currentSrc, suffix) => {
    let newSrc;

    if (sectionId === 'overview') {
      // Overview section gets the appropriate photo
      newSrc = photo;
    } else {
      // Other sections get the SVG icon
      newSrc = svg;
    }

    if (currentSrc !== newSrc) {
      changes++;
      return prefix + newSrc + suffix;
    }
    return match;
  });

  // Also handle sections without id but with note-kens-logbook class (logbook section)
  const logbookPattern = /(<section\s+class="card\s+note-kens-logbook"[^>]*>\s*\n\s*<img\s+src=")([^"]+)("\s+alt=""\s+aria-hidden="true">)/g;

  html = html.replace(logbookPattern, (match, prefix, currentSrc, suffix) => {
    if (currentSrc !== svg) {
      changes++;
      return prefix + svg + suffix;
    }
    return match;
  });

  if (changes === 0 || html === original) {
    return { status: 'unchanged', changes: 0 };
  }

  if (!dryRun) {
    fs.writeFileSync(filePath, html, 'utf8');
  }

  return { status: 'updated', changes };
}

// Get list of HTML files to process
let files = fs.readdirSync(restaurantsDir)
  .filter(f => f.endsWith('.html'))
  .map(f => f.replace('.html', ''));

if (singleSlug) {
  files = files.filter(f => f === singleSlug);
}

let updated = 0, unchanged = 0, errors = 0;

for (const slug of files) {
  const filePath = path.join(restaurantsDir, `${slug}.html`);

  try {
    const result = fixImages(filePath, slug);

    if (result.status === 'updated') {
      console.log(`  ✓  ${slug}.html — ${result.changes} images fixed${dryRun ? ' (dry run)' : ''}`);
      updated++;
    } else {
      // Only log unchanged if specifically requested
      unchanged++;
    }
  } catch (err) {
    console.error(`  ✗  ${slug}.html — ${err.message}`);
    errors++;
  }
}

console.log(`\nDone. Updated: ${updated} | Unchanged: ${unchanged} | Errors: ${errors}${dryRun ? ' (DRY RUN)' : ''}`);
