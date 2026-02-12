#!/usr/bin/env node
/**
 * Fix collapsible sections: convert non-collapsible <section> containers
 * to <details>/<summary> structure as required by v2 validator.
 *
 * The validator (validateCollapsibleStructure) checks that each <h2> inside
 * <main> matching a COLLAPSIBLE_REQUIRED section pattern has both a <summary>
 * and <details> ancestor.
 *
 * This script handles three conversion patterns:
 *
 * Pattern A: <section class="port-section" ...><h2>Title</h2>...content...</section>
 *   → <details class="port-section" ... open><summary><h2>Title</h2></summary>...content...</details>
 *
 * Pattern B: <article class="..."><h2>Title</h2>...content...</article>
 *   → <article class="..."><details open><summary><h2>Title</h2></summary>...content...</details></article>
 *
 * Pattern C: <section ...><div class="logbook-entry__header"><h2>Title</h2></div>...content...</section>
 *   → <details ... open><summary><h2>Title</h2></summary>...content...</details>
 */

const fs = require('fs');
const cheerio = require('cheerio');
const glob = require('glob');

// Mirror SECTION_PATTERNS and COLLAPSIBLE_REQUIRED from the validator
const SECTION_PATTERNS = {
  hero: /hero|port-hero|header-image/i,
  logbook: /logbook|first.?person|personal|my (visit|experience|thoughts?)|the moment/i,
  featured_images: /featured.?images?|inline.?images?/i,
  cruise_port: /(the )?cruise (port|terminal)|port (of call|terminal|facilities)/i,
  getting_around: /getting (around|there|to|from)|transportation|how to get/i,
  map: /map|interactive.?map|port.?map/i,
  beaches: /beaches?|beach guide|coastal/i,
  excursions: /(top )?excursions?|attractions?|things to (do|see)|activities/i,
  history: /history|historical|heritage/i,
  cultural: /cultural? (features?|highlights?|experiences?)|traditions?/i,
  shopping: /shopping|retail|markets?/i,
  food: /food|dining|restaurants?|eating|cuisine/i,
  notices: /(special )?notices?|warnings?|alerts?|important|know before/i,
  depth_soundings: /depth soundings|final thoughts?|in conclusion|the (real|honest) story/i,
  practical: /practical (information|info)|quick reference|at a glance|summary/i,
  faq: /(frequently asked questions?|faq|common questions?)/i,
  gallery: /(photo )?gallery|photos?|images?|swiper/i,
  credits: /(image |photo )?credits?|attributions?|photo sources?/i,
  back_nav: /back (to|navigation)|return to ports/i
};

const COLLAPSIBLE_REQUIRED = [
  'logbook', 'cruise_port', 'getting_around', 'excursions',
  'history', 'cultural', 'shopping', 'food', 'notices',
  'depth_soundings', 'practical', 'faq', 'gallery', 'credits'
];

/**
 * Detect which section type an h2 heading matches (using validator logic)
 */
function detectSectionType(headingText) {
  const text = headingText.toLowerCase();
  for (const [key, pattern] of Object.entries(SECTION_PATTERNS)) {
    if (COLLAPSIBLE_REQUIRED.includes(key) && pattern.test(text)) {
      return key;
    }
  }
  return null;
}

/**
 * Find matching closing tag for a given opening tag position.
 * Tracks nesting depth to find the correct closing tag.
 */
function findMatchingClose(html, openTagEnd, tagName) {
  const openPattern = new RegExp(`<${tagName}[\\s>]`, 'gi');
  const closeStr = `</${tagName}>`;
  let depth = 0;
  let pos = openTagEnd;

  while (pos < html.length) {
    // Find next open or close of this tag type
    const nextCloseIdx = html.indexOf(closeStr, pos);
    if (nextCloseIdx === -1) return -1; // no closing tag found

    // Check for nested opens between pos and nextCloseIdx
    openPattern.lastIndex = pos;
    let match;
    let opensBeforeClose = 0;
    while ((match = openPattern.exec(html)) !== null && match.index < nextCloseIdx) {
      opensBeforeClose++;
    }

    depth += opensBeforeClose;
    if (depth === 0) {
      return nextCloseIdx;
    }
    depth--;
    pos = nextCloseIdx + closeStr.length;
  }
  return -1;
}

const portFiles = glob.sync('ports/*.html');
let totalFiles = 0;
let totalConversions = 0;
const errors = [];

portFiles.forEach(file => {
  let html = fs.readFileSync(file, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false });

  // Find non-collapsible h2 elements
  const nonCollapsible = [];
  $('main h2').each((i, elem) => {
    const $h2 = $(elem);
    const headingText = $h2.text();
    const sectionType = detectSectionType(headingText);

    if (!sectionType) return;

    // Check if already collapsible
    const $summary = $h2.closest('summary');
    const $details = $h2.closest('details');
    if ($summary.length > 0 && $details.length > 0) return;

    // Find the container: walk up to find section, article, or details parent
    let $container = $h2.parent();
    while ($container.length > 0) {
      const tag = $container.prop('tagName');
      if (!tag) break;
      const tagLower = tag.toLowerCase();
      if (tagLower === 'section' || tagLower === 'article' || tagLower === 'details') {
        break;
      }
      // Don't go past main
      if (tagLower === 'main') { $container = $(); break; }
      $container = $container.parent();
    }

    if ($container.length === 0) return;

    nonCollapsible.push({
      sectionType,
      headingText: headingText.trim(),
      containerTag: $container.prop('tagName').toLowerCase(),
      containerClass: $container.attr('class') || '',
      containerId: $container.attr('id') || '',
      h2ParentTag: $h2.parent().prop('tagName')?.toLowerCase() || '',
      h2ParentClass: $h2.parent().attr('class') || ''
    });
  });

  if (nonCollapsible.length === 0) return;

  // Now apply conversions using string manipulation
  // Work from bottom to top to avoid offset issues
  let modified = false;

  for (const info of nonCollapsible) {
    // Re-read and re-find each time since offsets change
    const h2Regex = buildH2Regex(info.headingText);
    if (!h2Regex) continue;

    // Find the h2 in the HTML
    const h2Match = h2Regex.exec(html);
    if (!h2Match) {
      errors.push(`${file}: Could not find h2 "${info.headingText}" in HTML`);
      continue;
    }

    const h2Start = h2Match.index;
    const h2End = h2Start + h2Match[0].length;

    // Check if already wrapped in summary (someone else may have fixed it)
    const before = html.substring(Math.max(0, h2Start - 50), h2Start);
    if (before.includes('<summary>')) continue;

    // Find the container opening tag
    const containerTag = info.containerTag;
    const containerSearchStart = Math.max(0, h2Start - 2000);
    const containerOpenIdx = findContainerOpen(html, h2Start, containerTag, info.containerId, info.containerClass);

    if (containerOpenIdx === -1) {
      errors.push(`${file}: Could not find <${containerTag}> container for h2 "${info.headingText}"`);
      continue;
    }

    // Find the end of the opening tag
    const containerOpenEnd = html.indexOf('>', containerOpenIdx) + 1;
    if (containerOpenEnd <= 0) continue;

    // Find the matching closing tag
    const containerCloseIdx = findMatchingClose(html, containerOpenEnd, containerTag);
    if (containerCloseIdx === -1) {
      errors.push(`${file}: Could not find </${containerTag}> for h2 "${info.headingText}"`);
      continue;
    }

    // Determine the conversion approach
    if (containerTag === 'section') {
      // Pattern A/C: Convert <section> to <details>
      html = convertSectionToDetails(html, containerOpenIdx, containerOpenEnd, containerCloseIdx, h2Start, h2End, info);
      modified = true;
      totalConversions++;
    } else if (containerTag === 'article') {
      // Pattern B: Insert <details> inside <article>
      html = insertDetailsInArticle(html, containerOpenEnd, containerCloseIdx, h2Start, h2End, info);
      modified = true;
      totalConversions++;
    }
  }

  if (modified) {
    fs.writeFileSync(file, html, 'utf8');
    totalFiles++;
  }
});

console.log(`\nConverted ${totalConversions} sections across ${totalFiles} files`);
if (errors.length > 0) {
  console.log(`\n${errors.length} errors:`);
  errors.forEach(e => console.log(`  ${e}`));
}

/**
 * Build a regex to find a specific h2 heading in HTML.
 * Escapes special regex chars and allows for whitespace/entity variations.
 */
function buildH2Regex(headingText) {
  // Escape regex special chars
  let pattern = headingText.trim()
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/&amp;/g, '(?:&amp;|&)')
    .replace(/&/g, '(?:&amp;|&)')
    .replace(/\s+/g, '\\s+');
  try {
    return new RegExp(`<h2[^>]*>\\s*${pattern}\\s*</h2>`, 'i');
  } catch (e) {
    return null;
  }
}

/**
 * Find the opening tag of the container that holds the h2.
 * Search backwards from the h2 position.
 */
function findContainerOpen(html, h2Pos, tagName, id, className) {
  // Search backwards for the opening tag
  const searchStr = `<${tagName}`;
  let pos = h2Pos;

  while (pos > 0) {
    pos = html.lastIndexOf(searchStr, pos - 1);
    if (pos === -1) return -1;

    // Verify this is a proper tag (not inside a comment or string)
    const tagEnd = html.indexOf('>', pos);
    if (tagEnd === -1 || tagEnd > h2Pos) continue;

    const tagStr = html.substring(pos, tagEnd + 1);

    // Check for self-closing
    if (tagStr.endsWith('/>')) continue;

    // If we have an ID to match, verify it
    if (id && !tagStr.includes(`id="${id}"`)) continue;

    // Check that the h2 is actually inside this element
    // (not in a sibling section)
    const closeIdx = findMatchingClose(html, tagEnd + 1, tagName);
    if (closeIdx !== -1 && closeIdx > h2Pos) {
      return pos;
    }
  }
  return -1;
}

/**
 * Pattern A/C: Convert <section> to <details>, wrap h2 in <summary>
 */
function convertSectionToDetails(html, openStart, openEnd, closeStart, h2Start, h2End, info) {
  // 1. Replace closing </section> with </details>
  html = html.substring(0, closeStart) + '</details>' + html.substring(closeStart + '</section>'.length);

  // 2. Wrap h2 in <summary>
  // Handle Pattern C: if h2 is inside a logbook-entry__header div, replace the div
  if (info.h2ParentClass.includes('logbook-entry__header')) {
    // Find the parent div opening and closing
    const divOpenSearch = html.lastIndexOf('<div', h2Start);
    const divCloseSearch = html.indexOf('</div>', h2End);
    if (divOpenSearch !== -1 && divCloseSearch !== -1) {
      // Replace <div class="logbook-entry__header">...<h2>Title</h2></div>
      // with <summary><h2>Title</h2></summary>
      const h2Tag = html.substring(h2Start, h2End);
      html = html.substring(0, divOpenSearch) + '<summary>' + h2Tag + '</summary>' + html.substring(divCloseSearch + 6);
    }
  } else {
    // Simple case: wrap h2 in <summary>
    html = html.substring(0, h2Start) + '<summary>' + html.substring(h2Start, h2End) + '</summary>' + html.substring(h2End);
  }

  // 3. Replace opening <section ...> with <details ... open>
  const openTag = html.substring(openStart, openEnd);
  let newTag = openTag.replace(/^<section/, '<details');
  // Add 'open' attribute if not present
  if (!newTag.includes(' open')) {
    newTag = newTag.replace(/>$/, ' open>');
  }
  html = html.substring(0, openStart) + newTag + html.substring(openEnd);

  return html;
}

/**
 * Pattern B: Insert <details> inside <article>, wrap h2 in <summary>
 */
function insertDetailsInArticle(html, articleOpenEnd, articleCloseStart, h2Start, h2End, info) {
  // 1. Insert </details> before </article>
  html = html.substring(0, articleCloseStart) + '</details>\n' + html.substring(articleCloseStart);

  // 2. Wrap h2 in <summary>
  html = html.substring(0, h2Start) + '<summary>' + html.substring(h2Start, h2End) + '</summary>' + html.substring(h2End);

  // 3. Insert <details open> after the article opening tag, before any content
  // Find the first non-whitespace content after article opening
  html = html.substring(0, articleOpenEnd) + '\n<details open>' + html.substring(articleOpenEnd);

  return html;
}
