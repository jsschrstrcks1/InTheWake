#!/usr/bin/env node
/**
 * fix-venue-image-duplication.js
 * Fixes image duplication within venue pages by:
 * 1. Assigning appropriate primary photos to the Overview section based on venue type
 * 2. Using complementary but DIFFERENT photos for other card sections
 * 3. Ensuring no two adjacent sections use the same image
 *
 * Usage: node admin/fix-venue-image-duplication.js [--dry-run] [--slug=<slug>]
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

// Available photos by category
const PHOTOS = {
  // Dining atmosphere
  'formal-dining': '/assets/images/restaurants/photos/formal-dining.webp',
  'buffet': '/assets/images/restaurants/photos/buffet.webp',

  // Cuisines
  'italian': '/assets/images/restaurants/photos/italian.webp',
  'sushi': '/assets/images/restaurants/photos/sushi.webp',
  'tacos': '/assets/images/restaurants/photos/tacos.webp',
  'pizza': '/assets/images/restaurants/photos/pizza.webp',

  // Bars
  'cocktail-lounge': '/assets/images/restaurants/photos/cocktail-lounge.webp',
  'cocktail': '/assets/images/restaurants/photos/cocktail.webp',
  'bar-lounge': '/assets/images/restaurants/photos/bar-lounge.webp',

  // Casual
  'croissant': '/assets/images/restaurants/photos/croissant.webp',
  'hotdog': '/assets/images/restaurants/photos/hotdog.webp',
};

// Primary photo mapping by venue type (for Overview section)
const PRIMARY_PHOTO_MAP = {
  // Specialty dining
  'steakhouse': 'formal-dining',
  'italian': 'italian',
  'asian': 'sushi',
  'sushi': 'sushi',
  'mexican': 'tacos',
  'pizza': 'pizza',
  'seafood': 'sushi',
  'bbq': 'buffet',

  // Main dining
  'mdr': 'formal-dining',
  'complimentary': 'buffet',
  'specialty': 'formal-dining',

  // Casual
  'buffet': 'buffet',
  'cafe': 'croissant',
  'coffee': 'croissant',
  'desserts': 'croissant',
  'ice-cream': 'croissant',
  'counter-service': 'hotdog',

  // Bars
  'cocktail-bars': 'cocktail-lounge',
  'pubs': 'bar-lounge',
  'wine-bars': 'cocktail',
  'pool-bars': 'cocktail',
  'lounges': 'cocktail-lounge',
  'sports-bars': 'bar-lounge',

  // Categories
  'dining': 'formal-dining',
  'bars': 'cocktail-lounge',
  'entertainment': 'formal-dining',

  // Default
  'default': 'formal-dining',
};

// Complementary photos for different sections (avoiding the primary)
// Each set needs 6 UNIQUE images to cover all non-primary sections without any duplication
// Order: [menu-prices, accommodations, availability, logbook, sources, faq]
const SECTION_PHOTO_SETS = {
  'formal-dining': ['cocktail-lounge', 'buffet', 'italian', 'bar-lounge', 'sushi', 'croissant'],
  'buffet': ['formal-dining', 'croissant', 'cocktail', 'bar-lounge', 'cocktail-lounge', 'sushi'],
  'italian': ['formal-dining', 'cocktail-lounge', 'buffet', 'bar-lounge', 'sushi', 'cocktail'],
  'sushi': ['formal-dining', 'cocktail-lounge', 'buffet', 'cocktail', 'italian', 'bar-lounge'],
  'tacos': ['cocktail-lounge', 'buffet', 'bar-lounge', 'formal-dining', 'cocktail', 'sushi'],
  'pizza': ['bar-lounge', 'cocktail-lounge', 'buffet', 'formal-dining', 'cocktail', 'sushi'],
  'cocktail-lounge': ['formal-dining', 'bar-lounge', 'cocktail', 'buffet', 'italian', 'sushi'],
  'cocktail': ['cocktail-lounge', 'bar-lounge', 'formal-dining', 'buffet', 'italian', 'sushi'],
  'bar-lounge': ['cocktail-lounge', 'cocktail', 'buffet', 'formal-dining', 'italian', 'sushi'],
  'croissant': ['cocktail-lounge', 'buffet', 'formal-dining', 'bar-lounge', 'cocktail', 'sushi'],
  'hotdog': ['bar-lounge', 'cocktail-lounge', 'buffet', 'formal-dining', 'cocktail', 'sushi'],
};

// Venue-specific cuisine overrides
const VENUE_TYPE_OVERRIDES = {
  'giovannis-italian-kitchen': 'italian',
  'giovannis-table': 'italian',
  'jamies-italian': 'italian',
  '150-central-park': 'italian',
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
  'chops': 'steakhouse',
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
  'schooner-bar': 'pubs',
  'boleros': 'cocktail-bars',
  'r-bar': 'cocktail-bars',
  'bamboo-room': 'cocktail-bars',
  'bionic-bar': 'cocktail-bars',
  'rising-tide': 'cocktail-bars',
  'vintages': 'wine-bars',
  'social100': 'cocktail-bars',
  'lime-and-coconut': 'pool-bars',
};

// Build venue lookup from venues-v2.json
const venueInfo = {};
for (const venue of venuesData.venues || []) {
  venueInfo[venue.slug] = {
    category: venue.category,
    subcategory: venue.subcategory,
    name: venue.name,
  };
}

function getVenueType(slug) {
  // Check specific overrides first
  if (VENUE_TYPE_OVERRIDES[slug]) {
    return VENUE_TYPE_OVERRIDES[slug];
  }

  const info = venueInfo[slug];
  if (!info) return 'default';

  // Check subcategory
  if (PRIMARY_PHOTO_MAP[info.subcategory]) {
    return info.subcategory;
  }

  // Fall back to category
  if (PRIMARY_PHOTO_MAP[info.category]) {
    return info.category;
  }

  return 'default';
}

function getPrimaryPhotoKey(slug) {
  const type = getVenueType(slug);
  return PRIMARY_PHOTO_MAP[type] || PRIMARY_PHOTO_MAP['default'];
}

function getComplementaryPhotos(primaryKey) {
  return SECTION_PHOTO_SETS[primaryKey] || SECTION_PHOTO_SETS['formal-dining'];
}

function fixImages(filePath, slug) {
  let html = fs.readFileSync(filePath, 'utf8');
  const original = html;
  let changes = 0;

  const primaryKey = getPrimaryPhotoKey(slug);
  const primaryPhoto = PHOTOS[primaryKey];
  const complementary = getComplementaryPhotos(primaryKey);

  // Track which sections we've processed
  // Each section gets a unique image to avoid any within-page duplication
  // complementary order: [menu-prices, accommodations, availability, logbook, sources, faq]
  const sectionImages = {
    'overview': primaryPhoto,
    'menu-prices': PHOTOS[complementary[0]],
    'accommodations': PHOTOS[complementary[1]],
    'availability': PHOTOS[complementary[2]],
    'logbook': PHOTOS[complementary[3]],
    'sources': PHOTOS[complementary[4]],
    'faq': PHOTOS[complementary[5]],
  };

  // Pattern to match card section images
  // <section class="card" id="overview">
  //   <img src="..." alt="" aria-hidden="true">
  // Note: [\w-]+ to match hyphenated ids like "menu-prices"
  const imgPattern = /(<section\s+class="card[^"]*"\s+id="([\w-]+)"[^>]*>\s*\n\s*<img\s+src=")([^"]+)("\s+alt=""\s+aria-hidden="true">)/g;

  html = html.replace(imgPattern, (match, prefix, sectionId, currentSrc, suffix) => {
    const newSrc = sectionImages[sectionId];

    if (newSrc && currentSrc !== newSrc) {
      changes++;
      return prefix + newSrc + suffix;
    }
    return match;
  });

  // Also handle logbook section with different class pattern
  const logbookPattern = /(<section\s+class="card\s+note-kens-logbook"[^>]*>\s*\n\s*<img\s+src=")([^"]+)("\s+alt=""\s+aria-hidden="true">)/g;

  html = html.replace(logbookPattern, (match, prefix, currentSrc, suffix) => {
    const newSrc = sectionImages['logbook'];
    if (newSrc && currentSrc !== newSrc) {
      changes++;
      return prefix + newSrc + suffix;
    }
    return match;
  });

  if (changes === 0 || html === original) {
    return { status: 'unchanged', changes: 0, primary: primaryKey };
  }

  if (!dryRun) {
    fs.writeFileSync(filePath, html, 'utf8');
  }

  return { status: 'updated', changes, primary: primaryKey };
}

// Get list of HTML files to process (only venue pages with restaurant photos)
let files = fs.readdirSync(restaurantsDir)
  .filter(f => f.endsWith('.html'))
  .filter(f => {
    const content = fs.readFileSync(path.join(restaurantsDir, f), 'utf8');
    return content.includes('/assets/images/restaurants/photos/');
  })
  .map(f => f.replace('.html', ''));

if (singleSlug) {
  files = files.filter(f => f === singleSlug);
}

console.log(`Processing ${files.length} venue pages with photo duplications...`);
console.log(dryRun ? '(DRY RUN - no changes will be made)\n' : '\n');

let updated = 0, unchanged = 0, errors = 0;

for (const slug of files) {
  const filePath = path.join(restaurantsDir, `${slug}.html`);

  try {
    const result = fixImages(filePath, slug);

    if (result.status === 'updated') {
      console.log(`  ✓  ${slug}.html — ${result.changes} images updated (primary: ${result.primary})${dryRun ? ' (dry run)' : ''}`);
      updated++;
    } else {
      // Don't log unchanged
      unchanged++;
    }
  } catch (err) {
    console.error(`  ✗  ${slug}.html — ${err.message}`);
    errors++;
  }
}

console.log(`\nDone. Updated: ${updated} | Unchanged: ${unchanged} | Errors: ${errors}${dryRun ? ' (DRY RUN)' : ''}`);
