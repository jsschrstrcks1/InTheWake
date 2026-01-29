#!/usr/bin/env node
/**
 * apply-venue-reviews.js
 * Reads a JSON file of venue review data and applies it to each venue's HTML page,
 * replacing generic template review content with venue-specific reviews.
 *
 * Usage: node admin/apply-venue-reviews.js admin/venue-reviews.json [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DINING_GENERIC = {
  intro: 'consistently receives positive feedback from Royal Caribbean guests. This composite review reflects common themes from multiple sailings and ships across the fleet.',
  food: 'The food was well-prepared and presented beautifully. Portions were generous and flavors were balanced. The menu offered good variety with options for different tastes and dietary needs.',
  service: 'Service was attentive and friendly. Our server was knowledgeable about the menu and made helpful recommendations. Pacing was comfortable — not rushed, not too slow.',
  atmosphere: 'The atmosphere was inviting with tasteful decor that enhanced the dining experience. Comfortable seating and appropriate lighting made for an enjoyable meal.',
  conclusion: 'delivers a quality experience that meets guest expectations. Worth visiting during your cruise.',
};

const BAR_GENERIC = {
  intro: 'consistently receives positive feedback from Royal Caribbean guests. This composite review reflects common themes from multiple sailings and ships across the fleet.',
  food: 'The drink menu featured classic cocktails and creative specialties. Bartenders were skilled and drinks were well-crafted. Bar snacks were tasty and fresh.',
  service: 'Bartenders were friendly and efficient even during busy times. They remembered orders and made good suggestions based on preferences.',
  atmosphere: 'The vibe was relaxed and social with comfortable seating. Music was at a good volume for conversation. A great spot to unwind after a day of activities.',
  conclusion: 'delivers a quality experience that meets guest expectations. Worth visiting during your cruise.',
};

const GENERIC_JSON_LD = 'Composite review from multiple guest experiences across Royal Caribbean fleet sailings in 2024-2025.';

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function applyReview(filePath, venue, dryRun) {
  let html = fs.readFileSync(filePath, 'utf8');
  const original = html;
  let changes = 0;

  // Detect template type
  const isDining = html.includes(DINING_GENERIC.food);
  const isBar = html.includes(BAR_GENERIC.food);
  const isJsonLdOnly = !isDining && !isBar && html.includes(GENERIC_JSON_LD);

  const generic = isDining ? DINING_GENERIC : isBar ? BAR_GENERIC : null;

  if (generic) {
    // 1. Replace intro paragraph
    const introPattern = new RegExp(
      `(<p><em>Introduction\\.\\s*</em>\\s*)${escapeRegex(venue.name)}\\s+${escapeRegex(generic.intro)}(</p>)`
    );
    const introReplacement = `$1${venue.intro}$2`;
    if (introPattern.test(html)) {
      html = html.replace(introPattern, introReplacement);
      changes++;
    } else {
      // Fallback: try without name prefix (some pages may differ)
      const fallbackIntro = new RegExp(escapeRegex(generic.intro));
      if (fallbackIntro.test(html)) {
        html = html.replace(generic.intro, venue.intro);
        changes++;
      }
    }

    // 2. Replace Food & Drinks paragraph
    if (html.includes(generic.food)) {
      html = html.replace(generic.food, venue.food_drinks);
      changes++;
    }

    // 3. Replace Service paragraph
    if (html.includes(generic.service)) {
      html = html.replace(generic.service, venue.service);
      changes++;
    }

    // 4. Replace Atmosphere paragraph
    if (html.includes(generic.atmosphere)) {
      html = html.replace(generic.atmosphere, venue.atmosphere);
      changes++;
    }

    // 5. Replace Conclusion
    const conclusionPattern = new RegExp(
      `(<p><strong>Rating:\\s*)\\d+(\\/5\\.<\\/strong>\\s*)${escapeRegex(venue.name)}\\s+${escapeRegex(generic.conclusion)}(</p>)`
    );
    if (conclusionPattern.test(html)) {
      html = html.replace(conclusionPattern, `$1${venue.rating}$2${venue.conclusion}$3`);
      changes++;
    } else {
      // Fallback: replace just the generic conclusion text
      if (html.includes(generic.conclusion)) {
        html = html.replace(
          new RegExp(`(Rating:\\s*)\\d+(/5\\.)\\s*${escapeRegex(venue.name)}\\s+${escapeRegex(generic.conclusion)}`),
          `$1${venue.rating}$2 ${venue.conclusion}`
        );
        changes++;
      }
    }

    // 6. Update rating badge
    const badgePattern = /(\d+)\s*★\s*out\s*of\s*5/;
    if (badgePattern.test(html)) {
      html = html.replace(badgePattern, `${venue.rating} ★ out of 5`);
      changes++;
    }
  }

  // 7. Update JSON-LD reviewBody (applies to all types including JSON-LD-only)
  if (html.includes(GENERIC_JSON_LD)) {
    html = html.replace(
      `"reviewBody": "${GENERIC_JSON_LD}"`,
      `"reviewBody": ${JSON.stringify(venue.json_ld_review)}`
    );
    changes++;
  }

  // 8. Update JSON-LD ratingValue
  if (venue.rating) {
    const ratingPattern = /"ratingValue":\s*"\d+"/;
    if (ratingPattern.test(html)) {
      html = html.replace(ratingPattern, `"ratingValue": "${venue.rating}"`);
      changes++;
    }
  }

  if (changes === 0) {
    return { status: 'skip', changes: 0, reason: 'no generic content matched' };
  }

  if (html === original) {
    return { status: 'unchanged', changes: 0 };
  }

  if (!dryRun) {
    fs.writeFileSync(filePath, html, 'utf8');
  }

  return { status: 'updated', changes };
}

// Main
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const jsonPath = args.find(a => a.endsWith('.json'));

if (!jsonPath) {
  console.error('Usage: node apply-venue-reviews.js <reviews.json> [--dry-run]');
  process.exit(1);
}

const reviews = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const restaurantsDir = path.join(__dirname, '..', 'restaurants');

let updated = 0, skipped = 0, errors = 0;

for (const venue of reviews) {
  const filePath = path.join(restaurantsDir, `${venue.slug}.html`);

  if (!fs.existsSync(filePath)) {
    console.log(`  SKIP  ${venue.slug}.html — file not found`);
    skipped++;
    continue;
  }

  try {
    const result = applyReview(filePath, venue, dryRun);
    if (result.status === 'updated') {
      console.log(`  ✓  ${venue.slug}.html — ${result.changes} replacements${dryRun ? ' (dry run)' : ''}`);
      updated++;
    } else if (result.status === 'skip') {
      console.log(`  SKIP  ${venue.slug}.html — ${result.reason}`);
      skipped++;
    } else {
      console.log(`  —  ${venue.slug}.html — no changes needed`);
      skipped++;
    }
  } catch (err) {
    console.error(`  ✗  ${venue.slug}.html — ${err.message}`);
    errors++;
  }
}

console.log(`\nDone. Updated: ${updated} | Skipped: ${skipped} | Errors: ${errors}${dryRun ? ' (DRY RUN)' : ''}`);
