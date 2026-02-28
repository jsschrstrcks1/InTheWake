#!/usr/bin/env node
/**
 * Fix section ordering for ports where sections are out of expected order.
 * Expected: hero → logbook → cruise_port → getting_around → map → excursions →
 *           depth_soundings → practical → gallery → credits → faq
 *
 * Soli Deo Gloria
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const PROJECT_ROOT = path.join(__dirname, '..');

const SECTION_ORDER = [
  'hero', 'logbook', 'featured-images', 'weather-guide',
  'cruise-port', 'getting-around', 'port-map-section',
  'beaches', 'excursions', 'history', 'cultural', 'shopping',
  'food', 'notices', 'depth-soundings', 'practical',
  'gallery', 'credits', 'faq', 'back-nav'
];

// Map alternate IDs to canonical SECTION_ORDER IDs
const ID_ALIASES = {
  'map': 'port-map-section',
  'port-map': 'port-map-section',
  'featured-image': 'featured-images',
  'featured_images': 'featured-images',
  'weather': 'weather-guide',
  'cruise_port': 'cruise-port',
  'getting_around': 'getting-around',
  'depth_soundings': 'depth-soundings',
  'getting-there': 'getting-around',
  'back-to-ports': 'back-nav',
};

function getCanonicalId(id) {
  return ID_ALIASES[id] || id;
}

function fixPort(filepath) {
  const html = fs.readFileSync(filepath, 'utf8');
  const slug = path.basename(filepath, '.html');
  const changes = [];

  const $ = cheerio.load(html, { decodeEntities: false });

  // Search within the main article card for sections
  const mainContent = $('article.card, .card').first();
  if (!mainContent.length) return null;

  // Find all details/section/div elements with IDs that are in our order list
  // Only keep the first occurrence of each canonical ID
  const sections = [];
  const seenCanonical = new Set();
  mainContent.find('details[id], section[id], div[id]').each(function() {
    const rawId = $(this).attr('id') || '';
    const id = getCanonicalId(rawId);
    if (SECTION_ORDER.includes(id)) {
      if (!seenCanonical.has(id)) {
        seenCanonical.add(id);
        sections.push({ id, rawId, el: $(this), html: $.html($(this)) });
      } else {
        // Remove duplicate sections
        $(this).remove();
      }
    }
  });

  if (sections.length < 2) return null;

  // Check if they're in correct order
  let isOrdered = true;
  for (let i = 1; i < sections.length; i++) {
    const prevIdx = SECTION_ORDER.indexOf(sections[i - 1].id);
    const currIdx = SECTION_ORDER.indexOf(sections[i].id);
    if (currIdx < prevIdx) {
      isOrdered = false;
      break;
    }
  }

  if (isOrdered) return null;

  // Sort sections by expected order
  const sorted = [...sections].sort((a, b) => {
    return SECTION_ORDER.indexOf(a.id) - SECTION_ORDER.indexOf(b.id);
  });

  // Use a string-based approach: capture each section's outerHTML,
  // find the first section as anchor, remove all others, then insert in order.
  // This avoids cheerio's after() stack overflow on large files.
  const firstSectionInDOM = sections[0];
  const anchor = $(`#${firstSectionInDOM.rawId}`);
  if (!anchor.length) return null;

  // Detach all sections except the first one found in DOM
  for (const sec of sections) {
    if (sec.rawId !== firstSectionInDOM.rawId) {
      $(`#${sec.rawId}`).remove();
    }
  }

  // Now insert all sorted sections. Replace anchor with sorted[0], then chain.
  anchor.replaceWith(sorted.map(s => s.html).join('\n'));

  changes.push(`Reordered: ${sorted.map(s => s.rawId).join(' → ')}`);

  if (changes.length > 0) {
    fs.writeFileSync(filepath, $.html());
    return { file: path.basename(filepath), changes };
  }
  return null;
}

// ═══ MAIN ═══
const args = process.argv.slice(2);
const portsDir = path.join(PROJECT_ROOT, 'ports');

let files;
if (args.length > 0) {
  files = args.map(p => p.endsWith('.html') ? p : p + '.html');
} else {
  files = fs.readdirSync(portsDir).filter(f => f.endsWith('.html'));
}

let totalFixed = 0;
for (const file of files) {
  const filepath = path.join(portsDir, file);
  if (!fs.existsSync(filepath)) continue;

  const result = fixPort(filepath);
  if (result) {
    totalFixed++;
    console.log(`${result.file}: ${result.changes.join(', ')}`);
  }
}
console.log(`\nTotal: ${totalFixed} files modified`);
