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

function fixPort(filepath) {
  const html = fs.readFileSync(filepath, 'utf8');
  const slug = path.basename(filepath, '.html');
  const changes = [];

  const $ = cheerio.load(html, { decodeEntities: false });

  // Collect all port sections within the article/card
  const article = $('article.card, .card').first();
  if (!article.length) return null;

  // Find all details/section elements with IDs that are in our order list
  const sections = [];
  article.find('details[id], section[id]').each(function() {
    const id = $(this).attr('id') || '';
    if (SECTION_ORDER.includes(id)) {
      sections.push({ id, el: $(this), html: $.html($(this)) });
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

  // Reorder: place each section after the previous one
  for (let i = 1; i < sorted.length; i++) {
    const prev = $(`#${sorted[i - 1].id}`);
    const curr = $(`#${sorted[i].id}`);
    if (prev.length && curr.length) {
      prev.after(curr);
    }
  }

  changes.push(`Reordered: ${sorted.map(s => s.id).join(' → ')}`);

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
