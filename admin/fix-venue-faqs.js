#!/usr/bin/env node
/**
 * fix-venue-faqs.js
 * Replaces generic template FAQ answers with venue-type-specific content.
 *
 * The generator created FAQs with boilerplate like:
 * - "Reservations are recommended for specialty dining" (on hot dog stands)
 * - "Most specialty restaurants request smart casual attire" (on pool bars)
 * - "Specialty restaurants typically have a cover charge" (on complimentary venues)
 *
 * This script replaces those with appropriate answers based on venue classification.
 *
 * Usage: node admin/fix-venue-faqs.js [--dry-run] [--slug=<slug>]
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

// Build venue lookup
const venueInfo = {};
for (const venue of venuesData.venues || []) {
  venueInfo[venue.slug] = {
    name: venue.name,
    category: venue.category,
    subcategory: venue.subcategory,
    premium: venue.premium || false,
    cost: venue.cost || null,
  };
}

// Venue type classification (matches validator logic)
function getVenueStyle(slug) {
  const info = venueInfo[slug];
  if (!info) return 'unknown';

  const { category, subcategory, premium } = info;

  // Entertainment & activities
  if (category === 'entertainment' || category === 'activity') return 'entertainment';
  if (category === 'neighborhood') return 'neighborhood';

  // Bars
  if (category === 'bars' || subcategory === 'bars') return 'bar';

  // Coffee & desserts
  if (['coffee', 'cafe'].includes(subcategory) || slug.includes('starbucks') || slug.includes('latte')) return 'coffee';
  if (['desserts', 'ice-cream'].includes(subcategory) || ['ben-and-jerrys', 'sprinkles', 'sugar-beach', 'desserted'].includes(slug)) return 'dessert';

  // Counter-service
  const counterServiceSlugs = [
    'boardwalk-dog-house', 'dog-house', 'johnny-rockets', 'sorrentos',
    'portside-bbq', 'el-loco-fresh', 'pizza-delivery', 'vitality-cafe'
  ];
  if (counterServiceSlugs.includes(slug)) return 'counter-service';

  // Fine dining
  const fineDiningSlugs = [
    'wonderland', '150-central-park', 'chez-chops', 'empire-supper-club',
    'chef-table', 'coastal-kitchen'
  ];
  if (fineDiningSlugs.includes(slug)) return 'fine-dining';

  // Specialty (premium)
  if (premium || subcategory === 'specialty') return 'specialty';

  // Casual dining (MDR, buffet, etc.)
  if (category === 'dining') return 'casual-dining';

  return 'unknown';
}

// FAQ templates by venue style
const FAQ_TEMPLATES = {
  'counter-service': {
    reservations: 'No reservations needed — just walk up and order. Lines move quickly, especially during off-peak hours.',
    dressCode: 'Come as you are. Pool attire, swimwear with a cover-up, and casual clothes are all fine.',
    pricing: 'This venue is complimentary — it\'s included in your cruise fare with no extra charge.',
    availability: null, // Will be filled dynamically
  },

  'dessert': {
    reservations: 'No reservations needed — just walk up to the counter anytime you\'re craving something sweet.',
    dressCode: 'Come as you are. Pool attire and casual clothes are fine — it\'s a relaxed grab-and-go spot.',
    pricing: 'Items are priced a la carte. Ice cream, shakes, and treats typically range from $4-8 each.',
    availability: null,
  },

  'coffee': {
    reservations: 'No reservations needed — just walk up and order whenever you need a caffeine fix.',
    dressCode: 'Come as you are. Any casual attire is fine, including pool wear with a cover-up.',
    pricing: 'Specialty coffee drinks are priced a la carte, typically $3-6. Not included in drink packages.',
    availability: null,
  },

  'bar': {
    reservations: 'No reservations needed — just walk in and grab a seat or stand at the bar.',
    dressCode: 'Resort casual. Swimwear is fine with a cover-up; no formal attire required.',
    pricing: 'Drinks are priced individually or included with a drink package. Check your package details for coverage.',
    availability: null,
  },

  'casual-dining': {
    reservations: 'Traditional Dining has set times; My Time Dining is flexible but reservations help, especially for dinner.',
    dressCode: 'Smart casual for dinner (collared shirts, no tank tops or shorts). Breakfast and lunch are more relaxed.',
    pricing: 'This venue is complimentary — it\'s included in your cruise fare. Some premium items may have an upcharge.',
    availability: null,
  },

  'specialty': {
    reservations: 'Reservations are recommended, especially for dinner. Book through the Cruise Planner before sailing or via the app onboard.',
    dressCode: 'Smart casual to elegant casual. Collared shirts for men; no shorts, tank tops, or flip-flops.',
    pricing: 'There\'s a cover charge (typically $45-70 per person) or a la carte pricing. Check the menu section for current prices.',
    availability: null,
  },

  'fine-dining': {
    reservations: 'Reservations are essential — this is one of the most sought-after dining experiences on the ship. Book early through the Cruise Planner.',
    dressCode: 'Elegant attire recommended. Collared shirts and dress pants for men; cocktail or elegant attire for women.',
    pricing: 'There\'s a premium cover charge (typically $65-125 per person) for this elevated dining experience.',
    availability: null,
  },

  'entertainment': {
    reservations: 'Check the daily Cruise Compass for showtimes. Popular shows may require reservations via the app.',
    dressCode: 'No specific dress code for shows. Come as you are from dinner or daytime activities.',
    pricing: 'Most shows are complimentary. Some special experiences may have an additional charge.',
    availability: null,
  },

  'neighborhood': {
    reservations: 'No reservations needed — this is a public area you can explore anytime.',
    dressCode: 'No dress code. Come as you are to enjoy the atmosphere.',
    pricing: 'The neighborhood is free to explore. Individual shops and restaurants within may have their own pricing.',
    availability: null,
  },

  'unknown': {
    reservations: 'Check with Guest Services or the Royal Caribbean app for reservation requirements.',
    dressCode: 'Smart casual is a safe choice. Check specific venue requirements on the app.',
    pricing: 'Pricing varies by venue. Check the Royal Caribbean app or Guest Services for details.',
    availability: null,
  },
};

// Generic phrases to detect and replace
// Order matters - longer/more specific phrases should come first
const GENERIC_RESERVATION_PHRASES = [
  // Full HTML version
  'Reservations are recommended for specialty dining. You can book through the cruise planner before sailing or onboard via the app or guest services.',
  // JSON-LD version
  'Reservations are recommended for specialty dining. You can book through the cruise planner or onboard.',
  // Core phrase only
  'Reservations are recommended for specialty dining.',
];

const GENERIC_DRESS_PHRASES = [
  // Full HTML version
  'Dress codes vary by venue. Check the dress code section on this page for specific requirements. Most specialty restaurants request smart casual attire.',
  // JSON-LD version
  'Dress codes vary by venue. Most specialty restaurants request smart casual attire.',
  // Core phrase only
  'Most specialty restaurants request smart casual attire.',
];

const GENERIC_PRICING_PHRASES = [
  // Full HTML version
  'Complimentary vs. specialty pricing varies by venue. Check the pricing information on this page. Specialty restaurants typically have a cover charge or a la carte pricing.',
  // JSON-LD version
  'Complimentary vs. specialty pricing varies by venue. Specialty restaurants typically have a cover charge or a la carte pricing.',
  // Core phrase only (for partials after replacement)
  'Specialty restaurants typically have a cover charge or a la carte pricing.',
  // Leftover prefix that should be removed
  'Complimentary vs. specialty pricing varies by venue. ',
];

const GENERIC_AVAILABILITY_PHRASES = [
  'Availability varies by ship and class. Check the ships section on this page or the Royal Caribbean website for current fleet availability.',
];

// Also clean up leftover prefixes from partial replacements
const LEFTOVER_PREFIX_PATTERNS = [
  { find: 'Dress codes vary by venue. ', replace: '' },
];

function fixFaqs(filePath, slug) {
  let html = fs.readFileSync(filePath, 'utf8');
  const original = html;
  let changes = 0;

  const style = getVenueStyle(slug);
  const template = FAQ_TEMPLATES[style] || FAQ_TEMPLATES['unknown'];
  const venueName = venueInfo[slug]?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // Replace reservation FAQ
  for (const phrase of GENERIC_RESERVATION_PHRASES) {
    if (html.includes(phrase)) {
      html = html.replace(phrase, template.reservations);
      changes++;
    }
  }

  // Replace dress code FAQ
  for (const phrase of GENERIC_DRESS_PHRASES) {
    if (html.includes(phrase)) {
      html = html.replace(phrase, template.dressCode);
      changes++;
    }
  }

  // Replace pricing FAQ
  for (const phrase of GENERIC_PRICING_PHRASES) {
    if (html.includes(phrase)) {
      html = html.replace(phrase, template.pricing);
      changes++;
    }
  }

  // Replace availability FAQ - leave dynamic for now, just make it less vague
  for (const phrase of GENERIC_AVAILABILITY_PHRASES) {
    if (html.includes(phrase)) {
      const newAvailability = `Check the "Where You'll Find It" section above for the current list of ships featuring ${venueName}.`;
      html = html.replace(phrase, newAvailability);
      changes++;
    }
  }

  // Clean up leftover prefixes from partial replacements
  for (const { find, replace } of LEFTOVER_PREFIX_PATTERNS) {
    while (html.includes(find)) {
      html = html.replace(find, replace);
      changes++;
    }
  }

  if (changes === 0 || html === original) {
    return { status: 'unchanged', changes: 0, style };
  }

  if (!dryRun) {
    fs.writeFileSync(filePath, html, 'utf8');
  }

  return { status: 'updated', changes, style };
}

// Get list of HTML files to process
let files = fs.readdirSync(restaurantsDir)
  .filter(f => f.endsWith('.html'))
  .map(f => f.replace('.html', ''));

if (singleSlug) {
  files = files.filter(f => f === singleSlug);
}

console.log(`Processing ${files.length} venue pages for FAQ fixes...`);
console.log(dryRun ? '(DRY RUN - no changes will be made)\n' : '\n');

let updated = 0, unchanged = 0, errors = 0;
const styleStats = {};

for (const slug of files) {
  const filePath = path.join(restaurantsDir, `${slug}.html`);

  try {
    const result = fixFaqs(filePath, slug);
    styleStats[result.style] = (styleStats[result.style] || 0) + (result.status === 'updated' ? 1 : 0);

    if (result.status === 'updated') {
      console.log(`  ✓  ${slug}.html — ${result.changes} FAQs updated [${result.style}]${dryRun ? ' (dry run)' : ''}`);
      updated++;
    } else {
      unchanged++;
    }
  } catch (err) {
    console.error(`  ✗  ${slug}.html — ${err.message}`);
    errors++;
  }
}

console.log(`\nDone. Updated: ${updated} | Unchanged: ${unchanged} | Errors: ${errors}${dryRun ? ' (DRY RUN)' : ''}`);
console.log('\nBy venue style:');
for (const [style, count] of Object.entries(styleStats).sort((a, b) => b[1] - a[1])) {
  if (count > 0) console.log(`  ${style}: ${count}`);
}
