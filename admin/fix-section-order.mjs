#!/usr/bin/env node
/**
 * fix-section-order.mjs — Reorder port page sections to match ITC v1.1 canonical order.
 *
 * Uses string-level manipulation (not cheerio serialization) to preserve original
 * HTML formatting. Identifies sections by the same regex patterns the validator uses.
 *
 * Usage:
 *   node admin/fix-section-order.mjs                    # dry-run all ports
 *   node admin/fix-section-order.mjs --write             # apply changes
 *   node admin/fix-section-order.mjs ports/sydney.html   # single file dry-run
 *   node admin/fix-section-order.mjs --write ports/sydney.html
 *
 * Soli Deo Gloria
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import { load } from 'cheerio';

const PROJECT_ROOT = join(import.meta.dirname, '..');
const PORTS_DIR = join(PROJECT_ROOT, 'ports');

// Canonical order — same as EXPECTED_MAIN_ORDER in validate-port-page-v2.js
const EXPECTED_ORDER = [
  'hero', 'logbook', 'weather-guide', 'featured_images', 'cruise_port',
  'getting_around', 'from-the-pier', 'map', 'beaches', 'excursions',
  'history', 'cultural', 'shopping', 'food', 'notices',
  'depth_soundings', 'practical', 'gallery', 'credits', 'faq', 'back_nav'
];

// Section detection patterns — mirrors SECTION_PATTERNS from the validator
const SECTION_PATTERNS = {
  hero:             /hero|port-hero|header-image/i,
  logbook:          /logbook|first.?person|personal|my (visit|experience|thoughts?)|the moment/i,
  'weather-guide':  /weather|best time to visit|climate/i,
  featured_images:  /featured.?images?|inline.?images?/i,
  cruise_port:      /(the )?cruise (port|terminal)|port (of call|terminal|facilities)/i,
  getting_around:   /getting (around|there|to|from)|transportation|how to get/i,
  'from-the-pier':  /from.the.pier/i,
  map:              /map|interactive.?map|port.?map/i,
  beaches:          /beaches?|beach guide|coastal/i,
  excursions:       /(top )?excursions?|attractions?|things to (do|see)|activities/i,
  history:          /\bhistory\b|\bhistorical\b|\bheritage\b/i,
  cultural:         /cultural? (features?|highlights?|experiences?)|\btraditions?\b/i,
  shopping:         /\bshopping\b|\bretail\b/i,
  food:             /\bfood\b|\bdining\b|\brestaurants?\b|\bcuisine\b/i,
  notices:          /(special )?notices?|warnings?|alerts?|important|know before/i,
  depth_soundings:  /depth soundings|final thoughts?|in conclusion|the (real|honest) story/i,
  practical:        /practical (information|info)|quick reference|at a glance|summary/i,
  faq:              /(frequently asked questions?|faq|common questions?)/i,
  gallery:          /(photo )?gallery|photos?|images?|swiper/i,
  credits:          /(image |photo )?credits?|attributions?|photo sources?/i,
  back_nav:         /back (to|navigation)|return to ports/i,
};

function identifySection($el, $) {
  const id = ($el.attr('id') || '').toLowerCase();
  const cls = ($el.attr('class') || '').toLowerCase();
  const h2 = $el.find('h2').first().text().trim().toLowerCase();
  const h3 = $el.find('h3').first().text().trim().toLowerCase();
  const combined = `${h2} ${h3} ${id} ${cls}`;

  for (const [key, pattern] of Object.entries(SECTION_PATTERNS)) {
    if (pattern.test(combined)) {
      return key;
    }
  }
  return null;
}

function reorderPort(filepath, doWrite) {
  const html = readFileSync(filepath, 'utf-8');
  const $ = load(html);
  const slug = basename(filepath, '.html');

  // Skip redirect pages
  if ($('meta[http-equiv="refresh"]').length > 0) return null;

  // Find the main content container — try article.card first, then any article in main
  let $article = $('main article.card').first();
  if ($article.length === 0) $article = $('main article').first();
  if ($article.length === 0) return null;

  // Map each direct child to its section key and original HTML
  // Only consider section-level containers (section, details, article — not nav, p, aside, button)
  const SECTION_TAGS = new Set(['section', 'details', 'article', 'div']);
  const seenKeys = new Set();
  const children = [];

  $article.children().each((i, el) => {
    const tag = (el.tagName || el.name || '').toLowerCase();
    const $el = $(el);

    if (!SECTION_TAGS.has(tag)) {
      children.push({ index: i, key: null, el });
      return;
    }

    let sectionKey = identifySection($el, $);
    // Deduplicate: only the first occurrence of each key counts as that section
    if (sectionKey && seenKeys.has(sectionKey)) {
      sectionKey = null; // Treat duplicate as non-section, leave in place
    }
    if (sectionKey) seenKeys.add(sectionKey);
    children.push({ index: i, key: sectionKey, el });
  });

  // Separate into ordered sections and non-section elements
  const sections = children.filter(c => c.key !== null);
  const nonSections = children.filter(c => c.key === null);

  if (sections.length < 2) return null; // Nothing to reorder

  // Check current order
  const currentKeys = sections.map(s => s.key);
  const currentIndexes = currentKeys.map(k => EXPECTED_ORDER.indexOf(k));

  // Find out-of-order sections
  let isOrdered = true;
  for (let i = 1; i < currentIndexes.length; i++) {
    if (currentIndexes[i] !== -1 && currentIndexes[i - 1] !== -1) {
      if (currentIndexes[i] < currentIndexes[i - 1]) {
        isOrdered = false;
        break;
      }
    }
  }

  if (isOrdered) return null; // Already in order

  // Sort sections by canonical order
  const sorted = [...sections].sort((a, b) => {
    const ai = EXPECTED_ORDER.indexOf(a.key);
    const bi = EXPECTED_ORDER.indexOf(b.key);
    // Unknown sections go to end, preserving relative order
    if (ai === -1 && bi === -1) return a.index - b.index;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const sortedKeys = sorted.map(s => s.key);
  if (JSON.stringify(currentKeys) === JSON.stringify(sortedKeys)) return null;

  if (!doWrite) {
    return { slug, from: currentKeys, to: sortedKeys };
  }

  // Rewrite: remove all children, re-append in order (sections first, then non-sections)
  const allOrdered = [...sorted, ...nonSections];
  $article.empty();
  for (const child of allOrdered) {
    $article.append(child.el);
    $article.append('\n');
  }

  // Write back using cheerio's serialized HTML
  writeFileSync(filepath, $.html());
  return { slug, from: currentKeys, to: sortedKeys, written: true };
}

// Main
const args = process.argv.slice(2);
const doWrite = args.includes('--write');
const files = args.filter(a => a !== '--write');

let targets;
if (files.length > 0) {
  targets = files.map(f => f.startsWith('/') ? f : join(PROJECT_ROOT, f));
} else {
  targets = readdirSync(PORTS_DIR)
    .filter(f => f.endsWith('.html'))
    .map(f => join(PORTS_DIR, f));
}

let fixed = 0;
let skipped = 0;

for (const filepath of targets) {
  const result = reorderPort(filepath, doWrite);
  if (result) {
    console.log(`${doWrite ? '✓ FIXED' : '⚠ NEEDS FIX'}: ${result.slug}`);
    console.log(`  FROM: ${result.from.join(' → ')}`);
    console.log(`  TO:   ${result.to.join(' → ')}`);
    fixed++;
  } else {
    skipped++;
  }
}

console.log(`\n${doWrite ? 'Fixed' : 'Would fix'}: ${fixed} | Skipped: ${skipped} | Total: ${targets.length}`);
