#!/usr/bin/env node
/**
 * Ship Page Validator - ITW-SHIP-001 v1.0
 * Soli Deo Gloria
 *
 * Comprehensive validator for ship pages following the Ship Page Standard.
 * Validates: ICP-Lite v1.4, JSON-LD schemas, section ordering, content consistency,
 * cross-references, image requirements, and TBN-specific rules.
 */

import { readFile } from 'fs/promises';
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

// Ship class definitions for cross-reference validation
const SHIP_CLASSES = {
  'oasis': ['Oasis of the Seas', 'Allure of the Seas', 'Harmony of the Seas', 'Symphony of the Seas', 'Wonder of the Seas', 'Utopia of the Seas'],
  'quantum': ['Quantum of the Seas', 'Anthem of the Seas', 'Ovation of the Seas', 'Spectrum of the Seas', 'Odyssey of the Seas'],
  'freedom': ['Freedom of the Seas', 'Liberty of the Seas', 'Independence of the Seas'],
  'voyager': ['Voyager of the Seas', 'Explorer of the Seas', 'Adventure of the Seas', 'Navigator of the Seas', 'Mariner of the Seas'],
  'radiance': ['Radiance of the Seas', 'Brilliance of the Seas', 'Serenade of the Seas', 'Jewel of the Seas'],
  'vision': ['Vision of the Seas', 'Rhapsody of the Seas', 'Enchantment of the Seas', 'Grandeur of the Seas'],
  'icon': ['Icon of the Seas', 'Star of the Seas', 'Icon Class Ship (TBN 2027)', 'Icon Class Ship (TBN 2028)']
};

// Section patterns for detection
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

// Required sections for active ships
const REQUIRED_SECTIONS_ACTIVE = [
  'page_intro', 'first_look', 'dining', 'logbook', 'videos',
  'map', 'tracker', 'faq', 'attribution', 'recent_rail'
];

// Required sections for TBN ships (modified)
const REQUIRED_SECTIONS_TBN = [
  'page_intro', 'first_look', 'dining', 'faq', 'attribution', 'recent_rail'
];

/**
 * Determine if a ship is TBN based on filename or content
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
  // Convert kebab-case to Title Case
  return filename
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Normalize string for comparison
 */
function normalize(str) {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validate AI-Breadcrumbs comment
 */
function validateAIBreadcrumbs(html) {
  const errors = [];
  const warnings = [];
  const info = [];

  const breadcrumbMatch = html.match(/<!--\s*ai-breadcrumbs([\s\S]*?)-->/i);

  if (!breadcrumbMatch) {
    errors.push({
      section: 'ai_breadcrumbs',
      rule: 'missing',
      message: 'Missing AI-Breadcrumbs comment block',
      severity: 'BLOCKING'
    });
    return { valid: false, errors, warnings, info, data: {} };
  }

  const content = breadcrumbMatch[1];
  const requiredFields = ['entity', 'name', 'class', 'operator', 'parent', 'siblings', 'updated'];
  const data = {};

  // Extract fields
  for (const field of requiredFields) {
    const match = content.match(new RegExp(`${field}:\\s*(.+)`, 'i'));
    if (match) {
      data[field] = match[1].trim();
    } else {
      errors.push({
        section: 'ai_breadcrumbs',
        rule: `missing_${field}`,
        message: `Missing required field: ${field}`,
        severity: 'BLOCKING'
      });
    }
  }

  // Validate entity type
  if (data.entity && data.entity.toLowerCase() !== 'ship') {
    errors.push({
      section: 'ai_breadcrumbs',
      rule: 'wrong_entity',
      message: `Entity should be "Ship", found "${data.entity}"`,
      severity: 'BLOCKING'
    });
  }

  // Validate updated format
  if (data.updated && !/^\d{4}-\d{2}-\d{2}$/.test(data.updated)) {
    errors.push({
      section: 'ai_breadcrumbs',
      rule: 'invalid_date',
      message: `Updated date must be YYYY-MM-DD, found "${data.updated}"`,
      severity: 'BLOCKING'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
    data
  };
}

/**
 * Validate ICP-Lite v1.4 compliance
 */
function validateICPLite($, html) {
  const errors = [];
  const warnings = [];
  const info = [];

  // Extract meta tags
  const aiSummary = $('meta[name="ai-summary"]').attr('content') || '';
  const lastReviewed = $('meta[name="last-reviewed"]').attr('content') || '';
  const protocol = $('meta[name="content-protocol"]').attr('content') || '';

  // Check protocol version
  if (protocol !== 'ICP-Lite v1.4') {
    errors.push({
      section: 'icp_lite',
      rule: 'protocol_version',
      message: `Invalid content-protocol. Expected "ICP-Lite v1.4", found "${protocol}"`,
      severity: 'BLOCKING'
    });
  }

  // Check ai-summary
  if (!aiSummary) {
    errors.push({
      section: 'icp_lite',
      rule: 'ai_summary_missing',
      message: 'ai-summary meta tag is missing or empty',
      severity: 'BLOCKING'
    });
  } else if (aiSummary.length > 250) {
    errors.push({
      section: 'icp_lite',
      rule: 'ai_summary_length',
      message: `ai-summary exceeds 250 characters (${aiSummary.length} chars)`,
      severity: 'BLOCKING'
    });
  } else if (aiSummary.length < 100) {
    warnings.push({
      section: 'icp_lite',
      rule: 'ai_summary_short',
      message: `ai-summary is short (${aiSummary.length} chars), recommended 100-250`,
      severity: 'WARNING'
    });
  }

  // Check last-reviewed
  if (!lastReviewed) {
    errors.push({
      section: 'icp_lite',
      rule: 'last_reviewed_missing',
      message: 'last-reviewed meta tag is missing',
      severity: 'BLOCKING'
    });
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(lastReviewed)) {
    errors.push({
      section: 'icp_lite',
      rule: 'last_reviewed_format',
      message: `last-reviewed must be YYYY-MM-DD format, found "${lastReviewed}"`,
      severity: 'BLOCKING'
    });
  }

  // Check duplicates
  if ($('meta[name="ai-summary"]').length > 1) {
    errors.push({
      section: 'icp_lite',
      rule: 'duplicate_ai_summary',
      message: `Duplicate ai-summary meta tags found (${$('meta[name="ai-summary"]').length} instances)`,
      severity: 'BLOCKING'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
    data: {
      protocol_version: protocol,
      ai_summary_length: aiSummary.length,
      last_reviewed: lastReviewed,
      ai_summary: aiSummary
    }
  };
}

/**
 * Validate JSON-LD schemas
 */
function validateJSONLD($, html, filepath) {
  const errors = [];
  const warnings = [];
  const info = [];

  const jsonldScripts = $('script[type="application/ld+json"]');
  const schemas = [];

  // Parse all JSON-LD blocks
  jsonldScripts.each((i, elem) => {
    try {
      const content = $(elem).html();
      if (content) {
        schemas.push(JSON.parse(content));
      }
    } catch (e) {
      errors.push({
        section: 'json_ld',
        rule: 'parse_error',
        message: `Failed to parse JSON-LD block ${i + 1}: ${e.message}`,
        severity: 'BLOCKING'
      });
    }
  });

  // Check for required schema types
  const requiredTypes = ['Organization', 'WebSite', 'BreadcrumbList', 'Review', 'Person', 'WebPage', 'FAQPage'];
  const foundTypes = schemas.map(s => s['@type']).filter(Boolean);

  for (const type of requiredTypes) {
    if (!foundTypes.includes(type)) {
      errors.push({
        section: 'json_ld',
        rule: `missing_${type.toLowerCase()}`,
        message: `Missing ${type} JSON-LD schema`,
        severity: 'BLOCKING'
      });
    }
  }

  // Validate WebPage schema
  const webPage = schemas.find(s => s['@type'] === 'WebPage');
  if (webPage) {
    // Check mainEntity
    if (!webPage.mainEntity) {
      errors.push({
        section: 'json_ld',
        rule: 'missing_mainentity',
        message: 'WebPage JSON-LD must have mainEntity (ship pages are entity pages)',
        severity: 'BLOCKING'
      });
    }

    // Check mirroring with meta tags
    const aiSummary = $('meta[name="ai-summary"]').attr('content') || '';
    const lastReviewed = $('meta[name="last-reviewed"]').attr('content') || '';

    if (normalize(webPage.description) !== normalize(aiSummary)) {
      errors.push({
        section: 'json_ld',
        rule: 'description_mismatch',
        message: 'WebPage description must match ai-summary meta tag',
        severity: 'BLOCKING'
      });
    }

    if (webPage.dateModified !== lastReviewed) {
      errors.push({
        section: 'json_ld',
        rule: 'datemodified_mismatch',
        message: `WebPage dateModified (${webPage.dateModified}) must match last-reviewed (${lastReviewed})`,
        severity: 'BLOCKING'
      });
    }
  }

  // Validate Review schema for correct ship class reference
  const review = schemas.find(s => s['@type'] === 'Review');
  if (review && review.itemReviewed) {
    const reviewedDesc = review.itemReviewed.description || '';
    const shipName = extractShipName(filepath);

    // Check for wrong class references
    for (const [className, ships] of Object.entries(SHIP_CLASSES)) {
      const isThisClass = ships.some(s =>
        shipName.toLowerCase().includes(s.toLowerCase().split(' ')[0]) ||
        s.toLowerCase().includes(shipName.toLowerCase().split(' ')[0])
      );

      if (!isThisClass) {
        const wrongClassMention = reviewedDesc.toLowerCase().includes(`${className}-class`);
        if (wrongClassMention) {
          errors.push({
            section: 'json_ld',
            rule: 'wrong_class_reference',
            message: `Review itemReviewed references "${className}-class" but this is not a ${className} class ship`,
            severity: 'BLOCKING'
          });
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
    data: {
      schemas_found: foundTypes.length,
      types: foundTypes
    }
  };
}

/**
 * Validate section ordering and presence
 */
function validateSections($, html, isTBN) {
  const errors = [];
  const warnings = [];
  const info = [];
  const detectedSections = [];

  // Detect sections by scanning headings and IDs
  $('h2, h3, section, div[id], div[class*="section"]').each((i, elem) => {
    const $elem = $(elem);
    const text = $elem.text().toLowerCase();
    const id = $elem.attr('id') || '';
    const className = $elem.attr('class') || '';
    const combined = `${text} ${id} ${className}`;

    for (const [key, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(combined)) {
        if (!detectedSections.includes(key)) {
          detectedSections.push(key);
        }
        break;
      }
    }
  });

  // Check for required sections
  const requiredSections = isTBN ? REQUIRED_SECTIONS_TBN : REQUIRED_SECTIONS_ACTIVE;
  const missingSections = requiredSections.filter(s => !detectedSections.includes(s));

  if (missingSections.length > 0) {
    errors.push({
      section: 'sections',
      rule: 'missing_required',
      message: `Missing required sections: ${missingSections.join(', ')}`,
      severity: 'BLOCKING'
    });
  }

  // Check for Recent Stories rail elements
  const hasRecentRail = $('#recent-rail').length > 0;
  const hasNavTop = $('#recent-rail-nav-top').length > 0;
  const hasNavBottom = $('#recent-rail-nav-bottom').length > 0;
  const hasFallback = $('#recent-rail-fallback').length > 0;

  if (hasRecentRail) {
    if (!hasNavTop) {
      errors.push({
        section: 'sections',
        rule: 'missing_nav_top',
        message: 'Missing #recent-rail-nav-top for pagination',
        severity: 'BLOCKING'
      });
    }
    if (!hasNavBottom) {
      errors.push({
        section: 'sections',
        rule: 'missing_nav_bottom',
        message: 'Missing #recent-rail-nav-bottom for pagination',
        severity: 'BLOCKING'
      });
    }
    if (!hasFallback) {
      warnings.push({
        section: 'sections',
        rule: 'missing_fallback',
        message: 'Missing #recent-rail-fallback for loading state',
        severity: 'WARNING'
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
    data: {
      detected: detectedSections,
      missing: missingSections,
      recent_rail: {
        hasNavTop,
        hasNavBottom,
        hasFallback
      }
    }
  };
}

/**
 * Validate data attributes
 */
function validateDataAttributes($, html, filepath) {
  const errors = [];
  const warnings = [];
  const info = [];

  const expectedShipName = extractShipName(filepath);
  const isTBN = isTBNShip(filepath, html);

  // Check data-ship attribute
  const dataShip = $('[data-ship]').first().attr('data-ship');
  if (!dataShip) {
    errors.push({
      section: 'data_attributes',
      rule: 'missing_data_ship',
      message: 'Missing data-ship attribute',
      severity: 'BLOCKING'
    });
  }

  // Check data-imo attribute
  const dataImo = $('[data-imo]').first().attr('data-imo');
  if (!dataImo) {
    if (!isTBN) {
      errors.push({
        section: 'data_attributes',
        rule: 'missing_data_imo',
        message: 'Missing data-imo attribute for ship tracking',
        severity: 'BLOCKING'
      });
    }
  } else if (isTBN && dataImo !== 'TBD') {
    warnings.push({
      section: 'data_attributes',
      rule: 'tbn_imo_not_tbd',
      message: `TBN ship should have data-imo="TBD", found "${dataImo}"`,
      severity: 'WARNING'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
    data: {
      dataShip,
      dataImo,
      isTBN
    }
  };
}

/**
 * Validate content consistency (no wrong ship references)
 */
function validateContentConsistency($, html, filepath) {
  const errors = [];
  const warnings = [];
  const info = [];

  const expectedShipName = extractShipName(filepath);
  const slug = basename(filepath, '.html');

  // List of other ship names to check for wrong references
  const otherShips = [];
  for (const ships of Object.values(SHIP_CLASSES)) {
    otherShips.push(...ships);
  }

  // Check section headings for wrong ship references
  const checkHeadings = [
    { selector: 'h2, h3', context: 'Section headings' },
    { selector: '[data-dining-source]', context: 'Dining section' },
    { selector: '.tracker-title, [class*="tracker"]', context: 'Tracker section' }
  ];

  // Get the actual ship name from the page
  const pageTitle = $('title').text();
  const h1Text = $('h1').first().text();

  // Check video section heading
  const videoHeading = $('h2:contains("Watch")').text();
  if (videoHeading) {
    // Extract ship name from video heading
    const videoMatch = videoHeading.match(/Watch[:\s]+(.+?)\s+Highlights/i);
    if (videoMatch) {
      const mentionedShip = videoMatch[1].trim();
      // Check if it matches expected ship
      if (!expectedShipName.toLowerCase().includes(mentionedShip.toLowerCase()) &&
          !mentionedShip.toLowerCase().includes(expectedShipName.split(' ')[0].toLowerCase())) {

        // Check if it's referencing a different ship
        for (const ship of otherShips) {
          if (ship.toLowerCase().includes(mentionedShip.toLowerCase()) ||
              mentionedShip.toLowerCase().includes(ship.split(' ')[0].toLowerCase())) {
            errors.push({
              section: 'consistency',
              rule: 'wrong_ship_video',
              message: `Video heading references "${mentionedShip}" but page is for "${expectedShipName}"`,
              severity: 'BLOCKING'
            });
            break;
          }
        }
      }
    }
  }

  // Check tracker section heading
  const trackerHeading = $('h2:contains("Where Is")').text() || $('h3:contains("Where Is")').text();
  if (trackerHeading) {
    const trackerMatch = trackerHeading.match(/Where Is\s+(.+?)\s+Right Now/i);
    if (trackerMatch) {
      const mentionedShip = trackerMatch[1].trim();
      if (!expectedShipName.toLowerCase().includes(mentionedShip.toLowerCase()) &&
          !mentionedShip.toLowerCase().includes(expectedShipName.split(' ')[0].toLowerCase())) {

        for (const ship of otherShips) {
          if (ship.toLowerCase().includes(mentionedShip.toLowerCase()) ||
              mentionedShip.toLowerCase().includes(ship.split(' ')[0].toLowerCase())) {
            errors.push({
              section: 'consistency',
              rule: 'wrong_ship_tracker',
              message: `Tracker heading references "${mentionedShip}" but page is for "${expectedShipName}"`,
              severity: 'BLOCKING'
            });
            break;
          }
        }
      }
    }
  }

  // Check dining section alt text
  $('img[alt]').each((i, elem) => {
    const alt = $(elem).attr('alt') || '';
    const parent = $(elem).closest('[data-dining-source], .dining-section, #dining');

    if (parent.length > 0 && alt) {
      // Check if dining image alt references wrong ship
      for (const ship of otherShips) {
        const shipFirstWord = ship.split(' ')[0].toLowerCase();
        if (alt.toLowerCase().includes(shipFirstWord) &&
            !expectedShipName.toLowerCase().includes(shipFirstWord)) {
          errors.push({
            section: 'consistency',
            rule: 'wrong_ship_dining_alt',
            message: `Dining image alt text references "${ship}" but page is for "${expectedShipName}": "${alt.substring(0, 50)}..."`,
            severity: 'BLOCKING'
          });
          break;
        }
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
    data: {
      expectedShipName,
      pageTitle,
      h1Text
    }
  };
}

/**
 * Validate FAQ section
 */
function validateFAQ($, html) {
  const errors = [];
  const warnings = [];
  const info = [];

  // Find FAQ section
  const faqSection = $('details, .faq, #faq, [class*="faq"]');
  const faqItems = $('details').length;

  if (faqItems === 0) {
    errors.push({
      section: 'faq',
      rule: 'no_faqs',
      message: 'No FAQ items found (need at least 4 <details> elements)',
      severity: 'BLOCKING'
    });
  } else if (faqItems < 4) {
    warnings.push({
      section: 'faq',
      rule: 'few_faqs',
      message: `Only ${faqItems} FAQ items found, recommended minimum is 4`,
      severity: 'WARNING'
    });
  } else if (faqItems > 8) {
    warnings.push({
      section: 'faq',
      rule: 'many_faqs',
      message: `${faqItems} FAQ items found, recommended maximum is 8`,
      severity: 'WARNING'
    });
  }

  // Check FAQPage JSON-LD
  const jsonldScripts = $('script[type="application/ld+json"]');
  let hasFAQPage = false;
  let faqQuestionCount = 0;

  jsonldScripts.each((i, elem) => {
    try {
      const data = JSON.parse($(elem).html());
      if (data['@type'] === 'FAQPage') {
        hasFAQPage = true;
        if (data.mainEntity) {
          faqQuestionCount = Array.isArray(data.mainEntity) ? data.mainEntity.length : 1;
        }
      }
    } catch (e) {
      // Skip parse errors
    }
  });

  if (!hasFAQPage) {
    errors.push({
      section: 'faq',
      rule: 'missing_faqpage_schema',
      message: 'Missing FAQPage JSON-LD schema',
      severity: 'BLOCKING'
    });
  } else if (faqQuestionCount !== faqItems && faqItems > 0) {
    warnings.push({
      section: 'faq',
      rule: 'faq_count_mismatch',
      message: `FAQPage schema has ${faqQuestionCount} questions but page has ${faqItems} <details> items`,
      severity: 'WARNING'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
    data: {
      faqItems,
      hasFAQPage,
      faqQuestionCount
    }
  };
}

/**
 * Validate images
 */
function validateImages($, html) {
  const errors = [];
  const warnings = [];
  const info = [];

  const allImages = $('img');
  const imageCount = allImages.length;

  // Check minimum images
  if (imageCount < 5) {
    warnings.push({
      section: 'images',
      rule: 'few_images',
      message: `Only ${imageCount} images found, recommended minimum is 5`,
      severity: 'WARNING'
    });
  }

  // Check alt text
  let missingAlt = 0;
  let shortAlt = 0;

  allImages.each((i, elem) => {
    const alt = $(elem).attr('alt');
    if (!alt) {
      missingAlt++;
    } else if (alt.length < 20) {
      shortAlt++;
    }
  });

  if (missingAlt > 0) {
    errors.push({
      section: 'images',
      rule: 'missing_alt',
      message: `${missingAlt} images missing alt text`,
      severity: 'BLOCKING'
    });
  }

  if (shortAlt > 0) {
    warnings.push({
      section: 'images',
      rule: 'short_alt',
      message: `${shortAlt} images have alt text shorter than 20 characters`,
      severity: 'WARNING'
    });
  }

  // Check lazy loading
  let missingLazy = 0;
  allImages.each((i, elem) => {
    const loading = $(elem).attr('loading');
    const fetchpriority = $(elem).attr('fetchpriority');

    // Skip hero image
    if (fetchpriority === 'high' || loading === 'eager') return;

    if (loading !== 'lazy') {
      missingLazy++;
    }
  });

  if (missingLazy > 0) {
    warnings.push({
      section: 'images',
      rule: 'missing_lazy',
      message: `${missingLazy} non-hero images missing loading="lazy"`,
      severity: 'WARNING'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
    data: {
      total: imageCount,
      missingAlt,
      shortAlt,
      missingLazy
    }
  };
}

/**
 * Validate JavaScript patterns
 */
function validateJavaScript($, html) {
  const errors = [];
  const warnings = [];
  const info = [];

  // Check for duplicate script patterns
  const loadArticlesCount = (html.match(/async function loadArticles/g) || []).length;
  const swiperInitCount = (html.match(/new Swiper\(/g) || []).length;

  if (loadArticlesCount > 1) {
    errors.push({
      section: 'javascript',
      rule: 'duplicate_loadarticles',
      message: `DUPLICATE: ${loadArticlesCount} loadArticles() functions found`,
      severity: 'BLOCKING'
    });
  }

  // Check for required scripts
  const hasSwiper = html.includes('swiper') || html.includes('Swiper');
  const hasStatsLoader = html.includes('loadShipStats') || html.includes('ship-stats');
  const hasDiningLoader = html.includes('loadVenueData') || html.includes('dining');
  const hasTrackerInit = html.includes('MarineTraffic') || html.includes('data-imo');

  if (!hasSwiper) {
    warnings.push({
      section: 'javascript',
      rule: 'missing_swiper',
      message: 'No Swiper.js carousel detected',
      severity: 'WARNING'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
    data: {
      loadArticlesCount,
      swiperInitCount,
      hasSwiper,
      hasStatsLoader,
      hasDiningLoader,
      hasTrackerInit
    }
  };
}

/**
 * Validate a single ship page
 */
async function validateShipPage(filepath) {
  const relPath = relative(PROJECT_ROOT, filepath);
  const results = {
    file: relPath,
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

    // Run all validations
    const breadcrumbResult = validateAIBreadcrumbs(html);
    const icpResult = validateICPLite($, html);
    const jsonldResult = validateJSONLD($, html, filepath);
    const sectionResult = validateSections($, html, isTBN);
    const dataResult = validateDataAttributes($, html, filepath);
    const consistencyResult = validateContentConsistency($, html, filepath);
    const faqResult = validateFAQ($, html);
    const imageResult = validateImages($, html);
    const jsResult = validateJavaScript($, html);

    // Collect all errors
    results.blocking_errors.push(...breadcrumbResult.errors);
    results.blocking_errors.push(...icpResult.errors);
    results.blocking_errors.push(...jsonldResult.errors);
    results.blocking_errors.push(...sectionResult.errors);
    results.blocking_errors.push(...dataResult.errors);
    results.blocking_errors.push(...consistencyResult.errors);
    results.blocking_errors.push(...faqResult.errors);
    results.blocking_errors.push(...imageResult.errors);
    results.blocking_errors.push(...jsResult.errors);

    // Collect all warnings
    results.warnings.push(...breadcrumbResult.warnings);
    results.warnings.push(...icpResult.warnings);
    results.warnings.push(...jsonldResult.warnings);
    results.warnings.push(...sectionResult.warnings);
    results.warnings.push(...dataResult.warnings);
    results.warnings.push(...consistencyResult.warnings);
    results.warnings.push(...faqResult.warnings);
    results.warnings.push(...imageResult.warnings);
    results.warnings.push(...jsResult.warnings);

    // Calculate score
    results.score = 100;
    results.score -= results.blocking_errors.length * 10;
    results.score -= results.warnings.length * 2;
    results.score = Math.max(0, results.score);

    results.valid = results.blocking_errors.length === 0;

    // Add detailed results
    results.isTBN = isTBN;
    results.icp_lite = icpResult.data;
    results.sections = sectionResult.data;
    results.data_attributes = dataResult.data;
    results.faq = faqResult.data;
    results.images = imageResult.data;
    results.javascript = jsResult.data;
    results.consistency = consistencyResult.data;

  } catch (error) {
    results.blocking_errors.push({
      section: 'parse',
      rule: 'file_read',
      message: `Failed to parse file: ${error.message}`,
      severity: 'BLOCKING'
    });
    results.valid = false;
    results.score = 0;
  }

  return results;
}

/**
 * Print validation results
 */
function printResults(results, options) {
  if (options.jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
    return results.valid;
  }

  console.log(`\n${colors.bold}${colors.cyan}Ship Page Validation Report - ITW-SHIP-001 v1.0${colors.reset}`);
  console.log('='.repeat(80));
  console.log();

  // File header
  console.log(`${colors.bold}File:${colors.reset} ${results.file}`);
  console.log(`${colors.bold}Type:${colors.reset} ${results.isTBN ? 'TBN (Future Ship)' : 'Active Ship'}`);

  // Score
  const scoreColor = results.score >= 90 ? colors.green : results.score >= 70 ? colors.yellow : colors.red;
  console.log(`${colors.bold}Score:${colors.reset} ${scoreColor}${results.score}/100${colors.reset}`);
  console.log(`${colors.bold}Status:${colors.reset} ${results.valid ? colors.green + 'PASS' : colors.red + 'FAIL'}${colors.reset}`);
  console.log();

  // Blocking errors
  if (results.blocking_errors.length > 0) {
    console.log(`${colors.red}${colors.bold}BLOCKING ERRORS (${results.blocking_errors.length}):${colors.reset}`);
    results.blocking_errors.forEach((err, i) => {
      console.log(`${colors.red}  ${i + 1}. [${err.section}/${err.rule}]${colors.reset} ${err.message}`);
    });
    console.log();
  }

  // Warnings
  if (results.warnings.length > 0) {
    console.log(`${colors.yellow}${colors.bold}WARNINGS (${results.warnings.length}):${colors.reset}`);
    results.warnings.forEach((warn, i) => {
      console.log(`${colors.yellow}  ${i + 1}. [${warn.section}/${warn.rule}]${colors.reset} ${warn.message}`);
    });
    console.log();
  }

  // Summary stats
  if (!options.quiet) {
    console.log(`${colors.bold}Details:${colors.reset}`);
    console.log(`  ICP-Lite: ${results.icp_lite?.protocol_version || 'N/A'}`);
    console.log(`  AI Summary: ${results.icp_lite?.ai_summary_length || 0} chars`);
    console.log(`  Last Reviewed: ${results.icp_lite?.last_reviewed || 'N/A'}`);
    console.log(`  Sections Detected: ${results.sections?.detected?.length || 0}`);
    console.log(`  FAQ Items: ${results.faq?.faqItems || 0}`);
    console.log(`  Total Images: ${results.images?.total || 0}`);
    console.log(`  Ship Name: ${results.consistency?.expectedShipName || 'N/A'}`);
    console.log();
  }

  console.log('='.repeat(80));
  console.log();

  return results.valid;
}

/**
 * Main execution
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
    const pattern = join(PROJECT_ROOT, 'ships', '**', '*.html');
    filesToValidate = await glob(pattern);
  } else if (options.rclOnly) {
    const pattern = join(PROJECT_ROOT, 'ships', 'rcl', '*.html');
    filesToValidate = await glob(pattern);
  } else if (options.files.length > 0) {
    filesToValidate = options.files.map(f =>
      f.startsWith('/') ? f : join(PROJECT_ROOT, f)
    );
  } else {
    console.error('Usage: validate-ship-page.js [options] [files...]');
    console.error('Options:');
    console.error('  --all-ships    Validate all ship pages');
    console.error('  --rcl-only     Validate only Royal Caribbean ships');
    console.error('  --json-output  Output results as JSON');
    console.error('  --quiet        Minimal output');
    process.exit(1);
  }

  if (filesToValidate.length === 0) {
    console.error('No files to validate');
    process.exit(1);
  }

  // Validate files
  if (filesToValidate.length === 1) {
    const result = await validateShipPage(filesToValidate[0]);
    const valid = printResults(result, options);
    process.exit(valid ? 0 : 1);
  } else {
    // Multiple files - summary output
    const results = [];
    for (const file of filesToValidate) {
      const result = await validateShipPage(file);
      results.push(result);
    }

    if (options.jsonOutput) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      console.log(`\n${colors.bold}${colors.cyan}Ship Page Batch Validation Report${colors.reset}`);
      console.log('='.repeat(80));

      let passed = 0;
      let failed = 0;
      let totalErrors = 0;
      let totalWarnings = 0;

      results.forEach(r => {
        const status = r.valid ? colors.green + 'P' : colors.red + 'F';
        const score = r.score >= 90 ? colors.green : r.score >= 70 ? colors.yellow : colors.red;
        const tbnBadge = r.isTBN ? colors.dim + ' [TBN]' + colors.reset : '';
        console.log(`${status}${colors.reset} ${r.file}${tbnBadge} ${score}[${r.score}]${colors.reset} ${r.blocking_errors.length}E ${r.warnings.length}W`);

        if (r.valid) passed++;
        else failed++;
        totalErrors += r.blocking_errors.length;
        totalWarnings += r.warnings.length;
      });

      console.log('='.repeat(80));
      console.log(`Total: ${results.length} | ${colors.green}Passed: ${passed}${colors.reset} | ${colors.red}Failed: ${failed}${colors.reset}`);
      console.log(`Errors: ${colors.red}${totalErrors}${colors.reset} | Warnings: ${colors.yellow}${totalWarnings}${colors.reset}`);
      console.log();

      // Show top issues
      if (totalErrors > 0 || totalWarnings > 0) {
        console.log(`${colors.bold}Top Issues:${colors.reset}`);
        const issueCounts = {};
        results.forEach(r => {
          [...r.blocking_errors, ...r.warnings].forEach(issue => {
            const key = `[${issue.section}/${issue.rule}]`;
            issueCounts[key] = (issueCounts[key] || 0) + 1;
          });
        });

        Object.entries(issueCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .forEach(([key, count]) => {
            console.log(`  ${count}x ${key}`);
          });
        console.log();
      }
    }

    const allValid = results.every(r => r.valid);
    process.exit(allValid ? 0 : 1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
  });
}

export { validateShipPage };
