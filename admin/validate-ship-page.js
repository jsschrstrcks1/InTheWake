#!/usr/bin/env node
/**
 * Ship Page Validator - ITW-SHIP-002 v2.0
 * Soli Deo Gloria
 *
 * Comprehensive validator for ship pages following the Ship Page Standard v2.0.
 * Validates: ICP-Lite v1.4, JSON-LD schemas, section ordering, content consistency,
 * word counts, video requirements, logbook stories, navigation, WCAG, deduplication.
 *
 * Gold Standards: radiance-of-the-seas.html, grandeur-of-the-seas.html
 */

import { readFile, access } from 'fs/promises';
import { join, dirname, relative, basename } from 'path';
import { fileURLToPath } from 'url';
import { load } from 'cheerio';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

// Ship class definitions
const SHIP_CLASSES = {
  'oasis': ['Oasis of the Seas', 'Allure of the Seas', 'Harmony of the Seas', 'Symphony of the Seas', 'Wonder of the Seas', 'Utopia of the Seas'],
  'quantum': ['Quantum of the Seas', 'Anthem of the Seas', 'Ovation of the Seas', 'Spectrum of the Seas', 'Odyssey of the Seas'],
  'freedom': ['Freedom of the Seas', 'Liberty of the Seas', 'Independence of the Seas'],
  'voyager': ['Voyager of the Seas', 'Explorer of the Seas', 'Adventure of the Seas', 'Navigator of the Seas', 'Mariner of the Seas'],
  'radiance': ['Radiance of the Seas', 'Brilliance of the Seas', 'Serenade of the Seas', 'Jewel of the Seas'],
  'vision': ['Vision of the Seas', 'Rhapsody of the Seas', 'Enchantment of the Seas', 'Grandeur of the Seas'],
  'icon': ['Icon of the Seas', 'Star of the Seas', 'Icon Class Ship (TBN 2027)', 'Icon Class Ship (TBN 2028)']
};

// Required video categories
const REQUIRED_VIDEO_CATEGORIES = [
  'ship walk through', 'top ten', 'suite', 'balcony',
  'oceanview', 'interior', 'food', 'accessible'
];

// Required logbook personas
const REQUIRED_PERSONAS = [
  'solo', 'multi-generational', 'honeymoon', 'elderly',
  'single woman', 'single man', 'single parent'
];

// Gold standard navigation items (from index.html)
const GOLD_NAV_ITEMS = [
  '/planning.html', '/ships.html', '/restaurants.html', '/ports.html',
  '/drink-packages.html', '/drink-calculator.html', '/stateroom-check.html',
  '/cruise-lines.html', '/packing-lists.html', '/accessibility.html',
  '/travel.html', '/solo.html', '/tools/port-tracker.html',
  '/tools/ship-tracker.html', '/search.html', '/about-us.html'
];

// Section patterns
const SECTION_PATTERNS = {
  page_intro: /page-intro|intro|looking for|what this page covers/i,
  first_look: /first.?look|gallery|a first look/i,
  dining: /dining|restaurants?|venues?/i,
  logbook: /logbook|tales from the wake|crew.?stories/i,
  videos: /videos?|watch|highlights/i,
  map: /map|deck.?plans?/i,
  tracker: /tracker|live.?tracker|where is|marinetraffic/i,
  faq: /faq|frequently asked|questions/i,
  attribution: /attribution|credits?|image.?credits?/i,
  recent_rail: /recent.?stories|recent.?rail/i
};

const REQUIRED_SECTIONS = [
  'page_intro', 'first_look', 'dining', 'logbook', 'videos',
  'map', 'tracker', 'faq', 'attribution', 'recent_rail'
];

/**
 * Count words in text
 */
function countWords(text) {
  if (!text) return 0;
  return text.replace(/\s+/g, ' ').trim().split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Check if ship is TBN
 */
function isTBNShip(filepath, html) {
  const filename = basename(filepath, '.html');
  return filename.includes('tbn') ||
         html.toLowerCase().includes('to be named') ||
         html.includes('data-imo="TBD"');
}

/**
 * Extract ship name from filepath
 */
function extractShipName(filepath) {
  const filename = basename(filepath, '.html');
  return filename.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/**
 * Normalize string for comparison
 */
function normalize(str) {
  if (!str) return '';
  return str.replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ').trim();
}

/**
 * Validate AI-Breadcrumbs
 */
function validateAIBreadcrumbs(html, shipName) {
  const errors = [];
  const warnings = [];
  const data = {};

  const match = html.match(/<!--\s*ai-breadcrumbs([\s\S]*?)-->/i);
  if (!match) {
    errors.push({ section: 'ai_breadcrumbs', rule: 'missing', message: 'Missing AI-Breadcrumbs comment', severity: 'BLOCKING' });
    return { valid: false, errors, warnings, data };
  }

  const content = match[1];

  // Extract entity field
  const entityMatch = content.match(/entity:\s*(.+)/i);
  if (entityMatch) {
    data.entity = entityMatch[1].trim();
    // Check if entity contains ship name instead of "Ship"
    if (data.entity.toLowerCase() !== 'ship') {
      if (data.entity.toLowerCase().includes('of the seas') || data.entity.includes('TBN')) {
        errors.push({
          section: 'ai_breadcrumbs',
          rule: 'wrong_entity_format',
          message: `entity field contains ship name "${data.entity}" instead of "Ship"`,
          severity: 'BLOCKING'
        });
      }
    }
  } else {
    errors.push({ section: 'ai_breadcrumbs', rule: 'missing_entity', message: 'Missing entity field', severity: 'BLOCKING' });
  }

  // Check required fields
  const requiredFields = ['name', 'parent', 'siblings', 'updated'];
  for (const field of requiredFields) {
    const fieldMatch = content.match(new RegExp(`${field}:\\s*(.+)`, 'i'));
    if (fieldMatch) {
      data[field] = fieldMatch[1].trim();
    } else {
      errors.push({
        section: 'ai_breadcrumbs',
        rule: `missing_${field}`,
        message: `Missing required field: ${field}`,
        severity: 'BLOCKING'
      });
    }
  }

  // Validate date format
  if (data.updated && !/^\d{4}-\d{2}-\d{2}$/.test(data.updated)) {
    errors.push({
      section: 'ai_breadcrumbs',
      rule: 'invalid_date',
      message: `Updated date must be YYYY-MM-DD, found "${data.updated}"`,
      severity: 'BLOCKING'
    });
  }

  return { valid: errors.length === 0, errors, warnings, data };
}

/**
 * Validate ICP-Lite v1.4
 */
function validateICPLite($) {
  const errors = [];
  const warnings = [];

  const aiSummary = $('meta[name="ai-summary"]').attr('content') || '';
  const lastReviewed = $('meta[name="last-reviewed"]').attr('content') || '';
  const protocol = $('meta[name="content-protocol"]').attr('content') || '';

  if (protocol !== 'ICP-Lite v1.4') {
    errors.push({ section: 'icp_lite', rule: 'protocol_version', message: `Invalid content-protocol. Expected "ICP-Lite v1.4", found "${protocol}"`, severity: 'BLOCKING' });
  }

  if (!aiSummary) {
    errors.push({ section: 'icp_lite', rule: 'ai_summary_missing', message: 'ai-summary meta tag is missing', severity: 'BLOCKING' });
  } else if (aiSummary.length > 250) {
    errors.push({ section: 'icp_lite', rule: 'ai_summary_length', message: `ai-summary exceeds 250 chars (${aiSummary.length})`, severity: 'BLOCKING' });
  } else if (aiSummary.length < 100) {
    warnings.push({ section: 'icp_lite', rule: 'ai_summary_short', message: `ai-summary is short (${aiSummary.length} chars)`, severity: 'WARNING' });
  }

  if (!lastReviewed) {
    errors.push({ section: 'icp_lite', rule: 'last_reviewed_missing', message: 'last-reviewed meta tag is missing', severity: 'BLOCKING' });
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(lastReviewed)) {
    errors.push({ section: 'icp_lite', rule: 'last_reviewed_format', message: `last-reviewed must be YYYY-MM-DD`, severity: 'BLOCKING' });
  }

  if ($('meta[name="ai-summary"]').length > 1) {
    errors.push({ section: 'icp_lite', rule: 'duplicate_ai_summary', message: 'Duplicate ai-summary meta tags', severity: 'BLOCKING' });
  }

  return { valid: errors.length === 0, errors, warnings, data: { protocol, ai_summary_length: aiSummary.length, last_reviewed: lastReviewed, ai_summary: aiSummary } };
}

/**
 * Validate JSON-LD schemas
 */
function validateJSONLD($, filepath) {
  const errors = [];
  const warnings = [];
  const jsonldScripts = $('script[type="application/ld+json"]');
  const schemas = [];
  const foundTypes = [];

  jsonldScripts.each((i, elem) => {
    try {
      const content = $(elem).html();
      if (content) {
        const data = JSON.parse(content);
        schemas.push(data);
        if (data['@type']) foundTypes.push(data['@type']);
      }
    } catch (e) {
      errors.push({ section: 'json_ld', rule: 'parse_error', message: `JSON-LD parse error: ${e.message}`, severity: 'BLOCKING' });
    }
  });

  // Check required types
  const requiredTypes = ['Organization', 'WebSite', 'BreadcrumbList', 'Review', 'Person', 'WebPage', 'FAQPage'];
  for (const type of requiredTypes) {
    if (!foundTypes.includes(type)) {
      errors.push({ section: 'json_ld', rule: `missing_${type.toLowerCase()}`, message: `Missing ${type} JSON-LD schema`, severity: 'BLOCKING' });
    }
  }

  // Validate WebPage
  const webPage = schemas.find(s => s['@type'] === 'WebPage');
  if (webPage) {
    if (!webPage.mainEntity) {
      errors.push({ section: 'json_ld', rule: 'missing_mainentity', message: 'WebPage must have mainEntity', severity: 'BLOCKING' });
    }

    const aiSummary = $('meta[name="ai-summary"]').attr('content') || '';
    const lastReviewed = $('meta[name="last-reviewed"]').attr('content') || '';

    if (normalize(webPage.description) !== normalize(aiSummary)) {
      errors.push({ section: 'json_ld', rule: 'description_mismatch', message: 'WebPage description must match ai-summary', severity: 'BLOCKING' });
    }
    if (webPage.dateModified !== lastReviewed) {
      errors.push({ section: 'json_ld', rule: 'datemodified_mismatch', message: `WebPage dateModified (${webPage.dateModified}) must match last-reviewed (${lastReviewed})`, severity: 'BLOCKING' });
    }
  }

  // Validate Review class reference
  const review = schemas.find(s => s['@type'] === 'Review');
  if (review && review.itemReviewed) {
    const reviewDesc = (review.itemReviewed.description || '').toLowerCase();
    const shipName = extractShipName(filepath);

    for (const [className, ships] of Object.entries(SHIP_CLASSES)) {
      const isThisClass = ships.some(s => shipName.toLowerCase().includes(s.toLowerCase().split(' ')[0]));
      if (!isThisClass && reviewDesc.includes(`${className}-class`)) {
        errors.push({
          section: 'json_ld',
          rule: 'wrong_class_reference',
          message: `Review references "${className}-class" but this ship is not ${className} class`,
          severity: 'BLOCKING'
        });
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings, data: { schemas_found: foundTypes.length, types: foundTypes } };
}

/**
 * Validate navigation matches gold standard
 */
function validateNavigation($) {
  const errors = [];
  const warnings = [];
  const navLinks = [];

  $('nav.site-nav a, nav.site-nav .dropdown-menu a').each((i, elem) => {
    const href = $(elem).attr('href');
    if (href) navLinks.push(href);
  });

  // Check for key navigation items
  const missingNav = GOLD_NAV_ITEMS.filter(item => !navLinks.includes(item));
  if (missingNav.length > 3) {
    errors.push({
      section: 'navigation',
      rule: 'missing_nav_items',
      message: `Navigation missing ${missingNav.length} items from gold standard`,
      severity: 'BLOCKING'
    });
  } else if (missingNav.length > 0) {
    warnings.push({
      section: 'navigation',
      rule: 'some_missing_nav',
      message: `Navigation missing: ${missingNav.join(', ')}`,
      severity: 'WARNING'
    });
  }

  return { valid: errors.length === 0, errors, warnings, data: { nav_links: navLinks.length, missing: missingNav } };
}

/**
 * Validate Facebook escape script
 */
function validateEscapeScript(html) {
  const errors = [];
  const hasEscape = html.includes('in-app-browser-escape.js');

  if (!hasEscape) {
    errors.push({
      section: 'browser',
      rule: 'missing_escape_script',
      message: 'Missing in-app-browser-escape.js for Facebook/Instagram browsers',
      severity: 'BLOCKING'
    });
  }

  return { valid: errors.length === 0, errors, warnings: [], data: { hasEscapeScript: hasEscape } };
}

/**
 * Validate WCAG requirements
 */
function validateWCAG($) {
  const errors = [];
  const warnings = [];

  // Skip link
  const hasSkipLink = $('a.skip-link, a[href="#main-content"]').length > 0;
  if (!hasSkipLink) {
    errors.push({ section: 'wcag', rule: 'missing_skip_link', message: 'Missing skip-to-content link', severity: 'BLOCKING' });
  }

  // ARIA live regions
  const hasLiveRegion = $('[role="status"], [role="alert"], [aria-live]').length > 0;
  if (!hasLiveRegion) {
    warnings.push({ section: 'wcag', rule: 'missing_live_region', message: 'Missing ARIA live regions', severity: 'WARNING' });
  }

  // Carousel accessibility
  const carousels = $('.swiper');
  carousels.each((i, elem) => {
    const ariaLabel = $(elem).attr('aria-label');
    if (!ariaLabel) {
      warnings.push({ section: 'wcag', rule: 'carousel_no_label', message: `Carousel ${i + 1} missing aria-label`, severity: 'WARNING' });
    }
  });

  // Navigation buttons
  const navButtons = $('.swiper-button-prev, .swiper-button-next');
  navButtons.each((i, elem) => {
    const ariaLabel = $(elem).attr('aria-label');
    if (!ariaLabel) {
      warnings.push({ section: 'wcag', rule: 'nav_button_no_label', message: 'Carousel navigation button missing aria-label', severity: 'WARNING' });
    }
  });

  return { valid: errors.length === 0, errors, warnings, data: { hasSkipLink, hasLiveRegion } };
}

/**
 * Validate sections
 */
function validateSections($, isTBN) {
  const errors = [];
  const warnings = [];
  const detected = [];

  $('h2, h3, section, div[id]').each((i, elem) => {
    const text = $(elem).text().toLowerCase();
    const id = $(elem).attr('id') || '';
    const combined = `${text} ${id}`;

    for (const [key, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(combined) && !detected.includes(key)) {
        detected.push(key);
        break;
      }
    }
  });

  const required = isTBN ? ['page_intro', 'first_look', 'faq', 'attribution', 'recent_rail'] : REQUIRED_SECTIONS;
  const missing = required.filter(s => !detected.includes(s));

  if (missing.length > 0) {
    errors.push({ section: 'sections', rule: 'missing_required', message: `Missing sections: ${missing.join(', ')}`, severity: 'BLOCKING' });
  }

  // Recent Stories rail elements
  const hasRail = $('#recent-rail').length > 0;
  const hasNavTop = $('#recent-rail-nav-top').length > 0;
  const hasNavBottom = $('#recent-rail-nav-bottom').length > 0;
  const hasFallback = $('#recent-rail-fallback').length > 0;

  if (hasRail && !hasNavTop) {
    errors.push({ section: 'sections', rule: 'missing_nav_top', message: 'Missing #recent-rail-nav-top', severity: 'BLOCKING' });
  }
  if (hasRail && !hasNavBottom) {
    errors.push({ section: 'sections', rule: 'missing_nav_bottom', message: 'Missing #recent-rail-nav-bottom', severity: 'BLOCKING' });
  }

  return { valid: errors.length === 0, errors, warnings, data: { detected, missing, hasRail, hasNavTop, hasNavBottom, hasFallback } };
}

/**
 * Validate data attributes
 */
function validateDataAttributes($, isTBN) {
  const errors = [];
  const warnings = [];

  const dataShip = $('[data-ship]').first().attr('data-ship');
  const dataImo = $('[data-imo]').first().attr('data-imo');

  if (!dataShip) {
    errors.push({ section: 'data_attr', rule: 'missing_data_ship', message: 'Missing data-ship attribute', severity: 'BLOCKING' });
  }

  if (!dataImo && !isTBN) {
    errors.push({ section: 'data_attr', rule: 'missing_data_imo', message: 'Missing data-imo attribute', severity: 'BLOCKING' });
  }

  if (isTBN && dataImo && dataImo !== 'TBD') {
    warnings.push({ section: 'data_attr', rule: 'tbn_imo_not_tbd', message: `TBN ship should have data-imo="TBD"`, severity: 'WARNING' });
  }

  // Validate IMO is 7 digits
  if (dataImo && dataImo !== 'TBD' && !/^\d{7}$/.test(dataImo)) {
    errors.push({ section: 'data_attr', rule: 'invalid_imo', message: `IMO "${dataImo}" is not valid 7-digit format`, severity: 'BLOCKING' });
  }

  return { valid: errors.length === 0, errors, warnings, data: { dataShip, dataImo, isTBN } };
}

/**
 * Validate content consistency
 */
function validateContentConsistency($, filepath) {
  const errors = [];
  const expectedShipName = extractShipName(filepath);

  const otherShips = [];
  for (const ships of Object.values(SHIP_CLASSES)) {
    otherShips.push(...ships);
  }

  // Check video heading
  const videoHeading = $('h2:contains("Watch")').text();
  if (videoHeading) {
    const match = videoHeading.match(/Watch[:\s]+(.+?)\s+Highlights/i);
    if (match) {
      const mentioned = match[1].trim();
      if (!expectedShipName.toLowerCase().includes(mentioned.toLowerCase()) &&
          !mentioned.toLowerCase().includes(expectedShipName.split(' ')[0].toLowerCase())) {
        for (const ship of otherShips) {
          if (ship.toLowerCase().includes(mentioned.toLowerCase())) {
            errors.push({ section: 'consistency', rule: 'wrong_ship_video', message: `Video heading references "${mentioned}" but page is for "${expectedShipName}"`, severity: 'BLOCKING' });
            break;
          }
        }
      }
    }
  }

  // Check tracker heading
  const trackerHeading = $('h2:contains("Where Is"), h3:contains("Where Is")').text();
  if (trackerHeading) {
    const match = trackerHeading.match(/Where Is\s+(.+?)\s+Right Now/i);
    if (match) {
      const mentioned = match[1].trim();
      if (!expectedShipName.toLowerCase().includes(mentioned.toLowerCase())) {
        for (const ship of otherShips) {
          if (ship.toLowerCase().includes(mentioned.toLowerCase())) {
            errors.push({ section: 'consistency', rule: 'wrong_ship_tracker', message: `Tracker heading references "${mentioned}" but page is for "${expectedShipName}"`, severity: 'BLOCKING' });
            break;
          }
        }
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings: [], data: { expectedShipName } };
}

/**
 * Validate FAQ section
 */
function validateFAQ($) {
  const errors = [];
  const warnings = [];
  const faqCount = $('details').length;

  if (faqCount === 0) {
    errors.push({ section: 'faq', rule: 'no_faqs', message: 'No FAQ items found', severity: 'BLOCKING' });
  } else if (faqCount < 4) {
    warnings.push({ section: 'faq', rule: 'few_faqs', message: `Only ${faqCount} FAQs, recommended 4-8`, severity: 'WARNING' });
  } else if (faqCount > 8) {
    warnings.push({ section: 'faq', rule: 'many_faqs', message: `${faqCount} FAQs, recommended max 8`, severity: 'WARNING' });
  }

  return { valid: errors.length === 0, errors, warnings, data: { faqCount } };
}

/**
 * Validate images
 */
function validateImages($) {
  const errors = [];
  const warnings = [];
  const allImages = $('img');
  const imageCount = allImages.length;

  if (imageCount < 8) {
    errors.push({ section: 'images', rule: 'few_images', message: `Only ${imageCount} images, minimum 8`, severity: 'BLOCKING' });
  }

  let missingAlt = 0;
  let shortAlt = 0;
  let missingLazy = 0;

  allImages.each((i, elem) => {
    const alt = $(elem).attr('alt');
    const loading = $(elem).attr('loading');
    const fetchpriority = $(elem).attr('fetchpriority');
    const ariaHidden = $(elem).attr('aria-hidden');

    // Decorative images with aria-hidden="true" are allowed to have empty alt
    if (!alt && ariaHidden !== 'true') missingAlt++;
    else if (alt && alt.length < 20 && ariaHidden !== 'true') shortAlt++;

    if (fetchpriority !== 'high' && loading !== 'eager' && loading !== 'lazy') {
      missingLazy++;
    }
  });

  if (missingAlt > 0) {
    errors.push({ section: 'images', rule: 'missing_alt', message: `${missingAlt} images missing alt text`, severity: 'BLOCKING' });
  }
  if (shortAlt > 0) {
    warnings.push({ section: 'images', rule: 'short_alt', message: `${shortAlt} images have short alt text`, severity: 'WARNING' });
  }
  if (missingLazy > 0) {
    warnings.push({ section: 'images', rule: 'missing_lazy', message: `${missingLazy} images missing loading="lazy"`, severity: 'WARNING' });
  }

  return { valid: errors.length === 0, errors, warnings, data: { total: imageCount, missingAlt, shortAlt, missingLazy } };
}

/**
 * Validate JavaScript patterns
 */
function validateJavaScript(html) {
  const errors = [];
  const warnings = [];

  const loadArticlesCount = (html.match(/async function loadArticles/g) || []).length;
  if (loadArticlesCount > 1) {
    errors.push({ section: 'javascript', rule: 'duplicate_loadarticles', message: `${loadArticlesCount} loadArticles() functions`, severity: 'BLOCKING' });
  }

  const hasDropdown = html.includes('dropdown.js');
  if (!hasDropdown) {
    warnings.push({ section: 'javascript', rule: 'missing_dropdown', message: 'Missing dropdown.js', severity: 'WARNING' });
  }

  return { valid: errors.length === 0, errors, warnings, data: { loadArticlesCount, hasDropdown } };
}

/**
 * Validate HTML structure (unclosed tags)
 */
function validateHTMLStructure(html) {
  const errors = [];
  const warnings = [];

  // Count opening and closing section tags
  const openSections = (html.match(/<section[^>]*>/gi) || []).length;
  const closeSections = (html.match(/<\/section>/gi) || []).length;

  if (openSections !== closeSections) {
    errors.push({
      section: 'html_structure',
      rule: 'unclosed_section',
      message: `Mismatched section tags: ${openSections} opening, ${closeSections} closing (causes layout overflow)`,
      severity: 'BLOCKING'
    });
  }

  // Count opening and closing div tags
  const openDivs = (html.match(/<div[^>]*>/gi) || []).length;
  const closeDivs = (html.match(/<\/div>/gi) || []).length;

  if (Math.abs(openDivs - closeDivs) > 2) {
    errors.push({
      section: 'html_structure',
      rule: 'unclosed_div',
      message: `Significant div tag mismatch: ${openDivs} opening, ${closeDivs} closing`,
      severity: 'BLOCKING'
    });
  }

  return { valid: errors.length === 0, errors, warnings, data: { openSections, closeSections, openDivs, closeDivs } };
}

/**
 * Validate viewport/mobile compatibility
 */
function validateViewport($, html) {
  const errors = [];
  const warnings = [];

  // Check for viewport meta tag
  const viewport = $('meta[name="viewport"]').attr('content') || '';
  if (!viewport.includes('width=device-width')) {
    errors.push({
      section: 'viewport',
      rule: 'missing_viewport',
      message: 'Missing or invalid viewport meta tag (causes mobile overflow)',
      severity: 'BLOCKING'
    });
  }

  // Check cards for potential overflow issues
  const cards = $('.card');
  let cardsWithFixedWidth = 0;

  cards.each((i, elem) => {
    const style = $(elem).attr('style') || '';
    // Check for fixed pixel widths that could cause overflow
    const fixedWidth = style.match(/width:\s*(\d+)px/);
    if (fixedWidth && parseInt(fixedWidth[1]) > 400) {
      cardsWithFixedWidth++;
    }
  });

  if (cardsWithFixedWidth > 0) {
    errors.push({
      section: 'viewport',
      rule: 'fixed_width_cards',
      message: `${cardsWithFixedWidth} cards have fixed pixel widths >400px (causes mobile overflow)`,
      severity: 'BLOCKING'
    });
  }

  // Check for grid-2 sections which need proper responsive handling
  const grid2Sections = $('.grid-2');
  if (grid2Sections.length > 0) {
    // Check if CSS likely handles this (we can't validate CSS, but we can check for common issues)
    const hasGridStyle = html.includes('.grid-2') || html.includes('grid-template');
    if (!hasGridStyle) {
      warnings.push({
        section: 'viewport',
        rule: 'grid_responsive',
        message: 'grid-2 sections found - ensure CSS handles mobile viewport',
        severity: 'WARNING'
      });
    }
  }

  // Check for images without max-width constraints
  const imagesWithoutMaxWidth = [];
  $('img').each((i, elem) => {
    const style = $(elem).attr('style') || '';
    const width = $(elem).attr('width');
    // If image has fixed width attribute > 400 and no max-width in style
    if (width && parseInt(width) > 400 && !style.includes('max-width')) {
      imagesWithoutMaxWidth.push($(elem).attr('src') || `image ${i + 1}`);
    }
  });

  if (imagesWithoutMaxWidth.length > 3) {
    warnings.push({
      section: 'viewport',
      rule: 'image_overflow',
      message: `${imagesWithoutMaxWidth.length} large images may cause overflow on mobile`,
      severity: 'WARNING'
    });
  }

  return { valid: errors.length === 0, errors, warnings, data: { viewport, cardsWithFixedWidth, gridSections: grid2Sections.length } };
}

/**
 * Validate logbook JSON
 */
async function validateLogbook(slug) {
  const errors = [];
  const warnings = [];
  const logbookPath = join(PROJECT_ROOT, 'assets', 'data', 'logbook', 'rcl', `${slug}.json`);

  try {
    await access(logbookPath);
    const content = await readFile(logbookPath, 'utf-8');
    const data = JSON.parse(content);
    const stories = data.stories || [];

    if (stories.length < 10) {
      errors.push({ section: 'logbook', rule: 'few_stories', message: `Only ${stories.length} stories, minimum 10`, severity: 'BLOCKING' });
    }

    // Check for required personas
    const personaLabels = stories.map(s => (s.persona_label || '').toLowerCase());
    const hasPersonas = {
      solo: personaLabels.some(p => p.includes('solo')),
      family: personaLabels.some(p => p.includes('family') || p.includes('generational')),
      honeymoon: personaLabels.some(p => p.includes('honeymoon') || p.includes('couple')),
      elderly: personaLabels.some(p => p.includes('elderly') || p.includes('grandpa') || p.includes('retiree')),
      widow: personaLabels.some(p => p.includes('widow') || p.includes('grief')),
      accessible: personaLabels.some(p => p.includes('accessible') || p.includes('disability') || p.includes('special needs'))
    };

    const missingPersonas = Object.entries(hasPersonas).filter(([k, v]) => !v).map(([k]) => k);
    if (missingPersonas.length > 3) {
      warnings.push({ section: 'logbook', rule: 'missing_personas', message: `Missing personas: ${missingPersonas.join(', ')}`, severity: 'WARNING' });
    }

    // Check story word counts
    let shortStories = 0;
    stories.forEach(s => {
      const words = countWords(s.markdown || '');
      if (words < 300) shortStories++;
    });
    if (shortStories > 0) {
      warnings.push({ section: 'logbook', rule: 'short_stories', message: `${shortStories} stories under 300 words`, severity: 'WARNING' });
    }

    return { valid: errors.length === 0, errors, warnings, data: { storyCount: stories.length, hasPersonas, shortStories } };

  } catch (e) {
    errors.push({ section: 'logbook', rule: 'missing_file', message: `Logbook JSON not found: ${logbookPath}`, severity: 'BLOCKING' });
    return { valid: false, errors, warnings, data: {} };
  }
}

/**
 * Validate videos JSON
 */
async function validateVideos(slug) {
  const errors = [];
  const warnings = [];
  const videoPath = join(PROJECT_ROOT, 'assets', 'data', 'videos', 'rcl', `${slug}.json`);

  try {
    await access(videoPath);
    const content = await readFile(videoPath, 'utf-8');
    const data = JSON.parse(content);
    const videos = data.videos || {};

    let totalVideos = 0;
    const missingCategories = [];

    for (const cat of REQUIRED_VIDEO_CATEGORIES) {
      const catVideos = videos[cat] || [];
      totalVideos += catVideos.length;
      if (catVideos.length === 0) {
        missingCategories.push(cat);
      }
    }

    if (totalVideos < 10) {
      errors.push({ section: 'videos', rule: 'few_videos', message: `Only ${totalVideos} videos, minimum 10`, severity: 'BLOCKING' });
    }

    if (missingCategories.length > 2) {
      errors.push({ section: 'videos', rule: 'missing_categories', message: `Missing video categories: ${missingCategories.join(', ')}`, severity: 'BLOCKING' });
    } else if (missingCategories.length > 0) {
      warnings.push({ section: 'videos', rule: 'some_missing_categories', message: `Missing: ${missingCategories.join(', ')}`, severity: 'WARNING' });
    }

    return { valid: errors.length === 0, errors, warnings, data: { totalVideos, missingCategories } };

  } catch (e) {
    errors.push({ section: 'videos', rule: 'missing_file', message: `Videos JSON not found`, severity: 'BLOCKING' });
    return { valid: false, errors, warnings, data: {} };
  }
}

/**
 * Validate a single ship page
 */
async function validateShipPage(filepath) {
  const relPath = relative(PROJECT_ROOT, filepath);
  const slug = basename(filepath, '.html');
  const results = {
    file: relPath,
    slug,
    valid: true,
    score: 100,
    blocking_errors: [],
    warnings: [],
    info: []
  };

  try {
    const html = await readFile(filepath, 'utf-8');
    const $ = load(html);
    const isTBN = isTBNShip(filepath, html);
    const shipName = extractShipName(filepath);

    results.isTBN = isTBN;
    results.shipName = shipName;

    // Run all validations
    const breadcrumbResult = validateAIBreadcrumbs(html, shipName);
    const icpResult = validateICPLite($);
    const jsonldResult = validateJSONLD($, filepath);
    const navResult = validateNavigation($);
    const escapeResult = validateEscapeScript(html);
    const wcagResult = validateWCAG($);
    const sectionResult = validateSections($, isTBN);
    const dataResult = validateDataAttributes($, isTBN);
    const consistencyResult = validateContentConsistency($, filepath);
    const faqResult = validateFAQ($);
    const imageResult = validateImages($);
    const jsResult = validateJavaScript(html);
    const htmlStructureResult = validateHTMLStructure(html);
    const viewportResult = validateViewport($, html);

    // Async validations
    const logbookResult = await validateLogbook(slug);
    const videoResult = await validateVideos(slug);

    // Collect errors
    results.blocking_errors.push(
      ...breadcrumbResult.errors, ...icpResult.errors, ...jsonldResult.errors,
      ...navResult.errors, ...escapeResult.errors, ...wcagResult.errors,
      ...sectionResult.errors, ...dataResult.errors, ...consistencyResult.errors,
      ...faqResult.errors, ...imageResult.errors, ...jsResult.errors,
      ...logbookResult.errors, ...videoResult.errors,
      ...htmlStructureResult.errors, ...viewportResult.errors
    );

    // Collect warnings
    results.warnings.push(
      ...breadcrumbResult.warnings, ...icpResult.warnings, ...jsonldResult.warnings,
      ...navResult.warnings, ...escapeResult.warnings, ...wcagResult.warnings,
      ...sectionResult.warnings, ...dataResult.warnings, ...consistencyResult.warnings,
      ...faqResult.warnings, ...imageResult.warnings, ...jsResult.warnings,
      ...logbookResult.warnings, ...videoResult.warnings,
      ...htmlStructureResult.warnings, ...viewportResult.warnings
    );

    // Calculate score
    results.score = 100 - (results.blocking_errors.length * 10) - (results.warnings.length * 2);
    results.score = Math.max(0, results.score);
    results.valid = results.blocking_errors.length === 0;

    // Add detailed data
    results.icp_lite = icpResult.data;
    results.sections = sectionResult.data;
    results.data_attributes = dataResult.data;
    results.faq = faqResult.data;
    results.images = imageResult.data;
    results.logbook = logbookResult.data;
    results.videos = videoResult.data;
    results.wcag = wcagResult.data;
    results.navigation = navResult.data;
    results.html_structure = htmlStructureResult.data;
    results.viewport = viewportResult.data;

  } catch (error) {
    results.blocking_errors.push({ section: 'parse', rule: 'file_read', message: `Failed to parse: ${error.message}`, severity: 'BLOCKING' });
    results.valid = false;
    results.score = 0;
  }

  return results;
}

/**
 * Print results
 */
function printResults(results, options) {
  if (options.jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
    return results.valid;
  }

  console.log(`\n${colors.bold}${colors.cyan}Ship Page Validation Report - ITW-SHIP-002 v2.0${colors.reset}`);
  console.log('='.repeat(80));
  console.log();

  console.log(`${colors.bold}File:${colors.reset} ${results.file}`);
  console.log(`${colors.bold}Ship:${colors.reset} ${results.shipName || 'Unknown'}`);
  console.log(`${colors.bold}Type:${colors.reset} ${results.isTBN ? 'TBN (Future Ship)' : 'Active Ship'}`);

  const scoreColor = results.score >= 90 ? colors.green : results.score >= 70 ? colors.yellow : colors.red;
  console.log(`${colors.bold}Score:${colors.reset} ${scoreColor}${results.score}/100${colors.reset}`);
  console.log(`${colors.bold}Status:${colors.reset} ${results.valid ? colors.green + 'PASS' : colors.red + 'FAIL'}${colors.reset}`);
  console.log();

  if (results.blocking_errors.length > 0) {
    console.log(`${colors.red}${colors.bold}BLOCKING ERRORS (${results.blocking_errors.length}):${colors.reset}`);
    results.blocking_errors.forEach((err, i) => {
      console.log(`${colors.red}  ${i + 1}. [${err.section}/${err.rule}]${colors.reset} ${err.message}`);
    });
    console.log();
  }

  if (results.warnings.length > 0) {
    console.log(`${colors.yellow}${colors.bold}WARNINGS (${results.warnings.length}):${colors.reset}`);
    results.warnings.forEach((warn, i) => {
      console.log(`${colors.yellow}  ${i + 1}. [${warn.section}/${warn.rule}]${colors.reset} ${warn.message}`);
    });
    console.log();
  }

  if (!options.quiet) {
    console.log(`${colors.bold}Details:${colors.reset}`);
    console.log(`  ICP-Lite: ${results.icp_lite?.protocol || 'N/A'}`);
    console.log(`  AI Summary: ${results.icp_lite?.ai_summary_length || 0} chars`);
    console.log(`  Sections: ${results.sections?.detected?.length || 0} detected`);
    console.log(`  FAQs: ${results.faq?.faqCount || 0}`);
    console.log(`  Images: ${results.images?.total || 0}`);
    console.log(`  Logbook Stories: ${results.logbook?.storyCount || 0}`);
    console.log(`  Videos: ${results.videos?.totalVideos || 0}`);
    console.log(`  WCAG Skip Link: ${results.wcag?.hasSkipLink ? 'Yes' : 'No'}`);
    console.log();
  }

  console.log('='.repeat(80));
  return results.valid;
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);
  const options = {
    allShips: args.includes('--all-ships'),
    rclOnly: args.includes('--rcl-only'),
    jsonOutput: args.includes('--json-output'),
    quiet: args.includes('--quiet'),
    files: args.filter(arg => !arg.startsWith('--'))
  };

  let filesToValidate = [];

  if (options.allShips) {
    filesToValidate = await glob(join(PROJECT_ROOT, 'ships', '**', '*.html'));
  } else if (options.rclOnly) {
    filesToValidate = await glob(join(PROJECT_ROOT, 'ships', 'rcl', '*.html'));
  } else if (options.files.length > 0) {
    filesToValidate = options.files.map(f => f.startsWith('/') ? f : join(PROJECT_ROOT, f));
  } else {
    console.error('Usage: validate-ship-page.js [options] [files...]');
    console.error('  --all-ships    Validate all ship pages');
    console.error('  --rcl-only     Validate only RCL ships');
    console.error('  --json-output  JSON output');
    console.error('  --quiet        Minimal output');
    process.exit(1);
  }

  if (filesToValidate.length === 0) {
    console.error('No files to validate');
    process.exit(1);
  }

  if (filesToValidate.length === 1) {
    const result = await validateShipPage(filesToValidate[0]);
    printResults(result, options);
    process.exit(result.valid ? 0 : 1);
  } else {
    const results = [];
    for (const file of filesToValidate) {
      results.push(await validateShipPage(file));
    }

    if (options.jsonOutput) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      console.log(`\n${colors.bold}${colors.cyan}Ship Page Batch Validation - ITW-SHIP-002 v2.0${colors.reset}`);
      console.log('='.repeat(80));

      let passed = 0, failed = 0, totalErrors = 0, totalWarnings = 0;

      results.forEach(r => {
        const status = r.valid ? colors.green + 'P' : colors.red + 'F';
        const score = r.score >= 90 ? colors.green : r.score >= 70 ? colors.yellow : colors.red;
        const tbn = r.isTBN ? colors.dim + ' [TBN]' + colors.reset : '';
        console.log(`${status}${colors.reset} ${r.file}${tbn} ${score}[${r.score}]${colors.reset} ${r.blocking_errors.length}E ${r.warnings.length}W`);

        if (r.valid) passed++; else failed++;
        totalErrors += r.blocking_errors.length;
        totalWarnings += r.warnings.length;
      });

      console.log('='.repeat(80));
      console.log(`Total: ${results.length} | ${colors.green}Passed: ${passed}${colors.reset} | ${colors.red}Failed: ${failed}${colors.reset}`);
      console.log(`Errors: ${colors.red}${totalErrors}${colors.reset} | Warnings: ${colors.yellow}${totalWarnings}${colors.reset}`);

      if (totalErrors > 0) {
        console.log(`\n${colors.bold}Top Issues:${colors.reset}`);
        const counts = {};
        results.forEach(r => {
          [...r.blocking_errors, ...r.warnings].forEach(issue => {
            const key = `[${issue.section}/${issue.rule}]`;
            counts[key] = (counts[key] || 0) + 1;
          });
        });
        Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([key, count]) => {
          console.log(`  ${count}x ${key}`);
        });
      }
    }

    process.exit(results.every(r => r.valid) ? 0 : 1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(e => { console.error(`${colors.red}Fatal:${colors.reset}`, e); process.exit(1); });
}

export { validateShipPage };
