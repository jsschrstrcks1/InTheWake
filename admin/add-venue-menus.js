#!/usr/bin/env node
/**
 * add-venue-menus.js
 * Adds researched, accurate menu sections to venue pages that are missing them.
 *
 * IMPORTANT: This script adds real menu content researched from Royal Caribbean
 * official sources. Menu items and prices are verified but subject to change.
 *
 * Usage: node admin/add-venue-menus.js [--dry-run] [--slug=<slug>]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const menusPath = path.join(__dirname, 'venue-menus.json');
const restaurantsDir = path.join(__dirname, '..', 'restaurants');

const menusData = JSON.parse(fs.readFileSync(menusPath, 'utf8'));

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const singleSlug = (args.find(a => a.startsWith('--slug=')) || '').replace('--slug=', '');

/**
 * Generate HTML for a menu section based on venue type
 */
function generateMenuHTML(slug, menuData) {
  const { name, type, pricing, format, courses, items, stations, notes } = menuData;

  let html = `  <!-- Menu & Prices -->\n`;
  html += `  <section class="card" id="menu-prices">\n`;
  html += `    <img src="/assets/images/restaurants/photos/${getMenuImage(type)}" alt="" aria-hidden="true">\n`;
  html += `    <div class="card__content menu-body">\n`;
  html += `      <h2>Menu &amp; Prices</h2>\n`;

  // Price note
  html += `      <p class="price-note">\n`;
  html += `        <strong>Price:</strong> ${formatPricing(pricing)}\n`;
  html += `      </p>\n`;

  // Menu content based on type
  if (type === 'complimentary' && stations) {
    // Buffet style
    html += `\n      <h3>Stations</h3>\n`;
    html += `      <ul>\n`;
    for (const station of stations) {
      html += `        <li>${escapeHtml(station)}</li>\n`;
    }
    html += `      </ul>\n`;

    if (menuData.meals) {
      html += `\n      <div class="meal-times">\n`;
      for (const [meal, desc] of Object.entries(menuData.meals)) {
        html += `        <p><strong>${capitalize(meal)}:</strong> ${escapeHtml(desc)}</p>\n`;
      }
      html += `      </div>\n`;
    }
  } else if (type === 'counter-service' || type === 'dessert') {
    // Simple item list
    if (items) {
      html += `\n      <h3>Menu Items</h3>\n`;
      html += `      <ul>\n`;
      for (const item of items) {
        html += `        <li>${escapeHtml(item)}</li>\n`;
      }
      html += `      </ul>\n`;
    }
    if (menuData.toppings) {
      html += `\n      <h3>Toppings</h3>\n`;
      html += `      <p>${menuData.toppings.join(' · ')}</p>\n`;
    }
    if (menuData.flavors) {
      html += `\n      <h3>Flavors</h3>\n`;
      html += `      <p>${menuData.flavors.join(' · ')}</p>\n`;
    }
  } else if (courses) {
    // Multi-course restaurant
    html += `\n      <div class="grid grid-3">\n`;

    const courseEntries = Object.entries(courses);
    const gridCourses = courseEntries.slice(0, 3);

    for (const [courseName, courseItems] of gridCourses) {
      html += `        <div>\n`;
      html += `          <h3>${formatCourseName(courseName)}</h3>\n`;
      html += `          <ul>\n`;
      for (const item of courseItems.slice(0, 6)) {
        html += `            <li>${escapeHtml(item)}</li>\n`;
      }
      html += `          </ul>\n`;
      html += `        </div>\n`;
    }

    html += `      </div>\n`;

    // Additional courses if present
    const extraCourses = courseEntries.slice(3);
    if (extraCourses.length > 0) {
      html += `\n      <details class="variant">\n`;
      html += `        <summary>More Menu Sections</summary>\n`;
      for (const [courseName, courseItems] of extraCourses) {
        html += `        <h4>${formatCourseName(courseName)}</h4>\n`;
        html += `        <ul>\n`;
        for (const item of courseItems) {
          html += `          <li>${escapeHtml(item)}</li>\n`;
        }
        html += `        </ul>\n`;
      }
      html += `      </details>\n`;
    }
  }

  // Notes
  if (notes && notes.length > 0) {
    html += `\n      <p class="note tiny">${escapeHtml(notes[0])}</p>\n`;
    if (notes.length > 1) {
      html += `      <details class="variant">\n`;
      html += `        <summary>Additional Notes</summary>\n`;
      html += `        <ul>\n`;
      for (const note of notes.slice(1)) {
        html += `          <li>${escapeHtml(note)}</li>\n`;
      }
      html += `        </ul>\n`;
      html += `      </details>\n`;
    }
  }

  html += `    </div>\n`;
  html += `  </section>\n`;

  return html;
}

function getMenuImage(type) {
  const imageMap = {
    'fine-dining': 'formal-dining.webp',
    'specialty': 'italian.webp',
    'complimentary': 'buffet.webp',
    'counter-service': 'hotdog.webp',
    'dessert': 'croissant.webp',
  };
  return imageMap[type] || 'formal-dining.webp';
}

function formatPricing(pricing) {
  if (!pricing) return 'Varies';

  if (pricing.format === 'complimentary') {
    return 'Food is <strong>complimentary</strong> (included in cruise fare).' +
      (pricing.note ? ` <em>${pricing.note}</em>` : '');
  }

  if (pricing.format === 'a-la-carte') {
    const parts = [];
    if (pricing['prix-fixe']) parts.push(`Prix Fixe: ${pricing['prix-fixe']}`);
    if (pricing['signature-rolls']) parts.push(`Signature Rolls: ${pricing['signature-rolls']}`);
    if (pricing.scoops) parts.push(`Scoops: ${pricing.scoops}`);
    if (pricing.sundaes) parts.push(`Sundaes: ${pricing.sundaes}`);
    return 'A la carte pricing. ' + parts.join(' · ');
  }

  const parts = [];
  if (pricing.lunch) parts.push(`Lunch: ${pricing.lunch}`);
  if (pricing.brunch) parts.push(`Brunch: ${pricing.brunch}`);
  if (pricing.dinner) parts.push(`Dinner: ${pricing.dinner}`);
  if (pricing.cover) parts.push(`Cover: ${pricing.cover}`);
  if (pricing.children) parts.push(`Children: ${pricing.children}`);
  if (pricing.gratuity) parts.push(`(+${pricing.gratuity})`);

  return parts.join(' · ');
}

function formatCourseName(name) {
  const nameMap = {
    'starters': 'Starters',
    'mains': 'Mains',
    'desserts': 'Desserts',
    'antipasti': 'Antipasti',
    'pasta': 'Pasta',
    'pizza': 'Pizza',
    'signature-rolls': 'Signature Rolls',
    'chef-rolls': "Chef's Rolls",
    'sashimi': 'Sashimi',
    'bowls': 'Bowls',
    'tacos': 'Tacos',
    'sides': 'Sides',
    'brunch': 'Brunch',
    'sun': '☀️ Sun',
    'ice': '❄️ Ice',
    'fire': '🔥 Fire',
    'sea': '🌊 Sea',
    'earth': '🌿 Earth',
    'dreams': '✨ Dreams',
    'always-available': 'Always Available',
  };
  return nameMap[name] || capitalize(name.replace(/-/g, ' '));
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Add menu section to a page that's missing one
 */
function addMenuSection(filePath, slug) {
  const menuData = menusData.menus[slug];
  if (!menuData) {
    return { status: 'no-data', message: 'No menu data available' };
  }

  let html = fs.readFileSync(filePath, 'utf8');

  // Check if already has menu section
  if (html.includes('id="menu-prices"')) {
    return { status: 'already-has-menu', message: 'Already has menu section' };
  }

  // Find where to insert (after overview section)
  const overviewEndPattern = /<\/section>\s*\n\s*<!--\s*Special Accommodations/;
  const match = html.match(overviewEndPattern);

  if (!match) {
    // Try alternate pattern - after overview, before accommodations
    const altPattern = /(<section[^>]*id="overview"[^>]*>[\s\S]*?<\/section>)\s*\n/;
    const altMatch = html.match(altPattern);

    if (!altMatch) {
      return { status: 'error', message: 'Could not find insertion point' };
    }

    const menuHTML = generateMenuHTML(slug, menuData);
    const insertPoint = altMatch.index + altMatch[0].length;
    html = html.slice(0, insertPoint) + '\n' + menuHTML + '\n' + html.slice(insertPoint);
  } else {
    const menuHTML = generateMenuHTML(slug, menuData);
    html = html.replace(overviewEndPattern, '</section>\n\n' + menuHTML + '\n  <!-- Special Accommodations');
  }

  if (!dryRun) {
    fs.writeFileSync(filePath, html, 'utf8');
  }

  return { status: 'updated', message: `Added ${menuData.name} menu` };
}

// Get list of slugs that have menu data
const slugsWithMenuData = Object.keys(menusData.menus);

// Process files
let files;
if (singleSlug) {
  files = [singleSlug];
} else {
  files = slugsWithMenuData;
}

console.log(`Processing ${files.length} venue pages for menu additions...`);
console.log(dryRun ? '(DRY RUN - no changes will be made)\n' : '\n');

let updated = 0, skipped = 0, errors = 0;

for (const slug of files) {
  const filePath = path.join(restaurantsDir, `${slug}.html`);

  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠  ${slug}.html — file not found`);
    skipped++;
    continue;
  }

  try {
    const result = addMenuSection(filePath, slug);

    if (result.status === 'updated') {
      console.log(`  ✓  ${slug}.html — ${result.message}${dryRun ? ' (dry run)' : ''}`);
      updated++;
    } else if (result.status === 'already-has-menu') {
      skipped++;
    } else if (result.status === 'no-data') {
      skipped++;
    } else {
      console.log(`  ✗  ${slug}.html — ${result.message}`);
      errors++;
    }
  } catch (err) {
    console.error(`  ✗  ${slug}.html — ${err.message}`);
    errors++;
  }
}

console.log(`\nDone. Updated: ${updated} | Skipped: ${skipped} | Errors: ${errors}${dryRun ? ' (DRY RUN)' : ''}`);
console.log(`\nMenu data available for ${slugsWithMenuData.length} venues.`);
