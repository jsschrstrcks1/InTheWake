#!/usr/bin/env node
/**
 * Ship Page Validator - ITW-SHIP-002 v2.1
 * Soli Deo Gloria
 *
 * Comprehensive validator for ship pages following the Ship Page Standard v2.0.
 * Validates: ICP-Lite v1.4, JSON-LD schemas, section ordering, content consistency,
 * word counts, video requirements, logbook stories, navigation, WCAG, deduplication.
 *
 * v2.1 Enhancements:
 * - Strict section ORDER enforcement (per RCL gold standard)
 * - Soli Deo Gloria comment validation
 * - Content purity checks (forbidden brochure language, gambling, profanity)
 * - Faith-scented content markers detection
 * - Ship stats fallback JSON validation
 * - Dining data source JSON validation
 * - Word count validation (min 2500, max 6000)
 * - Grid-2 pairing validation (First Look + Dining, Deck Plans + Tracker)
 * - Swiper loop:false + rewind:false enforcement
 * - CSS version query parameter check
 * - Internet at Sea and Ship Quiz navigation checks
 * - Author card and Whimsical Units rail validation
 *
 * Gold Standards: radiance-of-the-seas.html, grandeur-of-the-seas.html
 *
 * Video Sourcing: See /admin/claude/VIDEO_SOURCING.md
 * Master Video Manifest: /ships/rcl/rc_ship_videos.json
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
  recent_rail: /recent.?stories|recent.?rail/i,
  author_card: /about the author|author-card/i,
  whimsical_units: /whimsical.?units|distance.?units/i
};

const REQUIRED_SECTIONS = [
  'page_intro', 'first_look', 'dining', 'logbook', 'videos',
  'map', 'tracker', 'faq', 'attribution', 'recent_rail'
];

// Expected STRICT section order per RCL gold standard (radiance-of-the-seas.html)
// Sections must appear in this order in the main content area
const EXPECTED_MAIN_SECTION_ORDER = [
  'page_intro',    // ICP-Lite intro with answer-line
  'first_look',    // A First Look carousel + stats (inside grid-2 with dining)
  'dining',        // Dining venues (inside grid-2 with first_look)
  'logbook',       // The Logbook - Tales From the Wake
  'videos',        // Watch: Ship Highlights
  'map',           // Ship Map (Deck Plans) - inside grid-2 with tracker
  'tracker',       // Where Is Ship Right Now? - inside grid-2 with map
  'faq',           // Frequently Asked Questions
  'attribution'    // Image Attributions
];

// Expected order for right rail sections
const EXPECTED_RAIL_SECTION_ORDER = [
  'page_intro',      // Quick Answer / Best For / Key Facts
  'author_card',     // About the Author
  'recent_rail',     // Recent Stories
  'whimsical_units'  // Whimsical Distance Units
];

// =============================================================================
// WORD COUNT REQUIREMENTS (from SHIP_PAGE_STANDARD.md v2.0)
// =============================================================================
const WORD_COUNT_REQUIREMENTS = {
  page_intro: { min: 100, max: 300, label: 'Page Introduction' },
  first_look: { min: 50, max: 150, label: 'A First Look' },
  dining: { min: 50, max: 200, label: 'Dining Overview' },
  logbook_story: { min: 300, max: 600, label: 'Logbook Story (each)' },
  video_section: { min: 20, max: 80, label: 'Video Section' },
  faq: { min: 200, max: 600, label: 'FAQ Section' },
  total_page: { min: 2500, max: 6000, label: 'Total Page' }
};

// =============================================================================
// CONTENT PURITY RULES (adapted from validate-port-page-v2.js)
// =============================================================================
const FORBIDDEN_PATTERNS = [
  // Brochure/sales language (warnings - stylistic issues)
  { pattern: /you'll love/i, category: 'brochure', severity: 'warning' },
  { pattern: /perfect for/i, category: 'brochure', severity: 'warning' },
  { pattern: /ideal choice/i, category: 'brochure', severity: 'warning' },
  { pattern: /value[- ]packed/i, category: 'brochure', severity: 'warning' },
  { pattern: /bucket[- ]list/i, category: 'hype', severity: 'warning' },
  { pattern: /must[- ]do/i, category: 'brochure', severity: 'warning' },
  { pattern: /must[- ]see/i, category: 'brochure', severity: 'warning' },
  { pattern: /\bdeliver[s]?\b.*innovation/i, category: 'brochure', severity: 'warning' },
  { pattern: /see our .* guide/i, category: 'self-promo', severity: 'warning' },
  { pattern: /check our .* calculator/i, category: 'self-promo', severity: 'warning' },
  // Drinking/nightlife (blocking)
  { pattern: /\b(bar hop|bar-hop|pub crawl|pub-crawl)\b/i, category: 'drinking' },
  { pattern: /\b(get drunk|getting drunk|wasted|hammered)\b/i, category: 'drinking' },
  // Gambling (warning with allowed context)
  { pattern: /\bcasino\b/i, category: 'gambling', severity: 'warning', allowed_context: /casino royale|virtual casino/i },
  // Profanity (warning)
  { pattern: /\b(damn|hell|crap|ass)\b/i, category: 'profanity', severity: 'warning' }
];

// Faith-scented content markers (REQUIRED per standard)
const FAITH_MARKERS = [
  /\bgod\b/i, /\bprayer\b/i, /\bscripture\b/i, /\bblessing\b/i,
  /\bgrace\b/i, /\bfaith\b/i, /\bsoul\b/i, /\bspirit\b/i,
  /\bawe\b/i, /\bwonder\b/i, /\bhealing\b/i, /\bhope\b/i,
  /soli deo gloria/i, /proverbs/i, /colossians/i
];

// Emotional pivot/tear-jerk markers (REQUIRED in logbook)
const EMOTIONAL_PIVOT_MARKERS = [
  /tears?\b/i, /crying\b/i, /wept\b/i, /choked up/i,
  /eyes (welled|watered|filled)/i, /heart (ached|swelled|broke|leapt)/i,
  /breath caught/i, /couldn't speak/i, /moment of silence/i,
  /finally (said|spoke|understood|saw)/i, /for the first time in/i,
  /something (shifted|changed|broke open)/i, /healing\b/i,
  /reconcil/i, /forgive/i, /thank (god|you|him|her)/i
];

// Navigation items that MUST be present (per index.html gold standard)
const REQUIRED_NAV_ITEMS = [
  '/planning.html', '/ships.html', '/ships/quiz.html', '/restaurants.html',
  '/ports.html', '/internet-at-sea.html', '/drink-packages.html',
  '/drink-calculator.html', '/stateroom-check.html', '/cruise-lines.html',
  '/packing-lists.html', '/accessibility.html', '/travel.html', '/solo.html',
  '/tools/port-tracker.html', '/tools/ship-tracker.html',
  '/search.html', '/about-us.html'
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
 * Validate Soli Deo Gloria comment (must be near top of file)
 */
function validateSoliDeoGloria(html) {
  const errors = [];
  const warnings = [];

  // Check for Soli Deo Gloria comment in first 500 chars
  const firstPart = html.substring(0, 500);
  const hasSoliDeoGloria = /soli\s+deo\s+gloria/i.test(firstPart);

  if (!hasSoliDeoGloria) {
    errors.push({
      section: 'soli_deo_gloria',
      rule: 'missing_dedication',
      message: 'Missing "Soli Deo Gloria" dedication comment near top of file',
      severity: 'BLOCKING'
    });
  }

  // Check for standard comment block format
  const hasStandardFormat = html.includes('Soli Deo Gloria') &&
    (html.includes('Proverbs 3:5') || html.includes('Colossians 3:23'));

  if (hasSoliDeoGloria && !hasStandardFormat) {
    warnings.push({
      section: 'soli_deo_gloria',
      rule: 'incomplete_dedication',
      message: 'Soli Deo Gloria comment found but missing Scripture references',
      severity: 'WARNING'
    });
  }

  return { valid: errors.length === 0, errors, warnings, data: { hasSoliDeoGloria, hasStandardFormat } };
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

  // Check for key navigation items (using REQUIRED_NAV_ITEMS which includes Internet at Sea)
  const missingNav = REQUIRED_NAV_ITEMS.filter(item => !navLinks.includes(item));

  // Internet at Sea is a critical new addition - check specifically
  const hasInternetAtSea = navLinks.includes('/internet-at-sea.html');
  if (!hasInternetAtSea) {
    errors.push({
      section: 'navigation',
      rule: 'missing_internet_at_sea',
      message: 'Navigation missing /internet-at-sea.html link (required per gold standard)',
      severity: 'BLOCKING'
    });
  }

  if (missingNav.length > 3) {
    errors.push({
      section: 'navigation',
      rule: 'missing_nav_items',
      message: `Navigation missing ${missingNav.length} items from gold standard: ${missingNav.slice(0, 5).join(', ')}${missingNav.length > 5 ? '...' : ''}`,
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

  return { valid: errors.length === 0, errors, warnings, data: { nav_links: navLinks.length, missing: missingNav, hasInternetAtSea } };
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
 * Validate content purity (no forbidden patterns)
 */
function validateContentPurity($, html) {
  const errors = [];
  const warnings = [];
  const violations = [];

  const bodyText = $('body').text();

  for (const rule of FORBIDDEN_PATTERNS) {
    if (rule.pattern.test(bodyText)) {
      // Check if there's an allowed context
      if (rule.allowed_context && rule.allowed_context.test(bodyText)) {
        continue;
      }

      const match = bodyText.match(rule.pattern);
      const violation = {
        category: rule.category,
        matched: match ? match[0] : 'pattern',
        severity: rule.severity || 'BLOCKING'
      };
      violations.push(violation);

      if (rule.severity === 'warning') {
        warnings.push({
          section: 'content_purity',
          rule: `forbidden_${rule.category}`,
          message: `Forbidden content found: "${violation.matched}" (${rule.category})`,
          severity: 'WARNING'
        });
      } else {
        errors.push({
          section: 'content_purity',
          rule: `forbidden_${rule.category}`,
          message: `Forbidden content found: "${violation.matched}" (${rule.category})`,
          severity: 'BLOCKING'
        });
      }
    }
  }

  // Check for faith markers (at least one should be present)
  const hasFaithContent = FAITH_MARKERS.some(marker => marker.test(html));
  if (!hasFaithContent) {
    warnings.push({
      section: 'content_purity',
      rule: 'missing_faith_markers',
      message: 'No faith-scented content markers found (God, prayer, Scripture, etc.)',
      severity: 'WARNING'
    });
  }

  return { valid: errors.length === 0, errors, warnings, data: { violations, hasFaithContent } };
}

/**
 * Validate inline ship stats JSON
 */
function validateShipStatsJSON($) {
  const errors = [];
  const warnings = [];
  const statsElement = $('#ship-stats-fallback');

  if (statsElement.length === 0) {
    warnings.push({
      section: 'inline_json',
      rule: 'missing_stats_fallback',
      message: 'Missing #ship-stats-fallback JSON element',
      severity: 'WARNING'
    });
    return { valid: true, errors, warnings, data: {} };
  }

  try {
    const content = statsElement.html() || '';
    const data = JSON.parse(content);

    // Required fields
    const requiredFields = ['slug', 'name', 'class', 'entered_service', 'gt', 'guests'];
    const missingFields = requiredFields.filter(f => !data[f]);

    if (missingFields.length > 0) {
      errors.push({
        section: 'inline_json',
        rule: 'stats_missing_fields',
        message: `Ship stats JSON missing fields: ${missingFields.join(', ')}`,
        severity: 'BLOCKING'
      });
    }

    // Validate slug matches data-slug attribute
    const statsContainer = $('#ship-stats');
    const dataSlug = statsContainer.attr('data-slug');
    if (dataSlug && data.slug !== dataSlug) {
      errors.push({
        section: 'inline_json',
        rule: 'stats_slug_mismatch',
        message: `Stats JSON slug "${data.slug}" doesn't match data-slug="${dataSlug}"`,
        severity: 'BLOCKING'
      });
    }

    return { valid: errors.length === 0, errors, warnings, data };
  } catch (e) {
    errors.push({
      section: 'inline_json',
      rule: 'stats_parse_error',
      message: `Ship stats JSON parse error: ${e.message}`,
      severity: 'BLOCKING'
    });
    return { valid: false, errors, warnings, data: {} };
  }
}

/**
 * Validate dining data source JSON
 */
function validateDiningJSON($) {
  const errors = [];
  const warnings = [];
  const diningElement = $('#dining-data-source');

  if (diningElement.length === 0) {
    warnings.push({
      section: 'inline_json',
      rule: 'missing_dining_source',
      message: 'Missing #dining-data-source JSON element',
      severity: 'WARNING'
    });
    return { valid: true, errors, warnings, data: {} };
  }

  try {
    const content = diningElement.html() || '';
    const data = JSON.parse(content);

    // Required fields
    if (!data.ship_slug) {
      errors.push({
        section: 'inline_json',
        rule: 'dining_missing_slug',
        message: 'Dining data source missing ship_slug field',
        severity: 'BLOCKING'
      });
    }

    if (!data.json && !data.url) {
      errors.push({
        section: 'inline_json',
        rule: 'dining_missing_json',
        message: 'Dining data source missing json/url field',
        severity: 'BLOCKING'
      });
    }

    return { valid: errors.length === 0, errors, warnings, data };
  } catch (e) {
    errors.push({
      section: 'inline_json',
      rule: 'dining_parse_error',
      message: `Dining data source JSON parse error: ${e.message}`,
      severity: 'BLOCKING'
    });
    return { valid: false, errors, warnings, data: {} };
  }
}

/**
 * Validate total page word count
 * Note: Ship pages use dynamic content loading (logbook, videos) so static word count
 * will be lower than actual rendered content. We use a lower threshold for static HTML.
 */
function validateWordCounts($) {
  const errors = [];
  const warnings = [];

  // Get all text from main content, excluding scripts and JSON
  const mainContent = $('main').clone();
  mainContent.find('script, style, noscript').remove();
  const pageText = mainContent.text();
  const totalWords = countWords(pageText);

  // Ship pages have dynamic content (logbook stories, videos loaded via JS)
  // Use lower static threshold but warn if very low
  const STATIC_MIN = 500; // Minimum for static content only
  const EXPECTED_MIN = WORD_COUNT_REQUIREMENTS.total_page.min;

  if (totalWords < STATIC_MIN) {
    errors.push({
      section: 'word_counts',
      rule: 'page_too_short',
      message: `Static page content (${totalWords} words) below minimum ${STATIC_MIN} (excluding dynamic content)`,
      severity: 'BLOCKING'
    });
  } else if (totalWords < EXPECTED_MIN) {
    warnings.push({
      section: 'word_counts',
      rule: 'low_static_content',
      message: `Static page content (${totalWords} words) - note: logbook/videos load dynamically`,
      severity: 'WARNING'
    });
  } else if (totalWords > WORD_COUNT_REQUIREMENTS.total_page.max) {
    warnings.push({
      section: 'word_counts',
      rule: 'page_too_long',
      message: `Total page content (${totalWords} words) exceeds maximum ${WORD_COUNT_REQUIREMENTS.total_page.max}`,
      severity: 'WARNING'
    });
  }

  // Check FAQ section word count
  const faqSection = $('section.faq, .faq, #faq, details:contains("Frequently Asked")');
  if (faqSection.length > 0) {
    const faqClone = faqSection.clone();
    faqClone.find('script, style').remove();
    const faqWords = countWords(faqClone.text());
    if (faqWords < WORD_COUNT_REQUIREMENTS.faq.min) {
      warnings.push({
        section: 'word_counts',
        rule: 'faq_too_short',
        message: `FAQ section (${faqWords} words) below minimum ${WORD_COUNT_REQUIREMENTS.faq.min}`,
        severity: 'WARNING'
      });
    }
  }

  return { valid: errors.length === 0, errors, warnings, data: { totalWords } };
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
 * Validate sections - STRICT ORDER ENFORCEMENT
 */
function validateSections($, isTBN) {
  const errors = [];
  const warnings = [];

  // Track section positions for order validation
  const sectionPositions = [];

  // Scan main content area for sections (in DOM order)
  // Look at sections, divs with classes, and headings
  $('main section, main .card, main h2, main h3, main [class*="page-intro"], main [class*="first-look"], main [class*="logbook"], main [class*="videos"]').each((i, elem) => {
    const text = $(elem).text().substring(0, 200).toLowerCase();
    const id = ($(elem).attr('id') || '').toLowerCase();
    const className = ($(elem).attr('class') || '').toLowerCase();
    const ariaLabel = ($(elem).attr('aria-label') || '').toLowerCase();
    const combined = `${text} ${id} ${className} ${ariaLabel}`;

    for (const [key, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(combined)) {
        // Record position if not already detected
        if (!sectionPositions.find(s => s.key === key)) {
          sectionPositions.push({ key, index: i, text: text.substring(0, 50) });
        }
        break;
      }
    }
  });

  const detected = sectionPositions.map(s => s.key);

  // Check for required sections
  const required = isTBN ? ['page_intro', 'first_look', 'faq', 'attribution', 'recent_rail'] : REQUIRED_SECTIONS;
  const missing = required.filter(s => !detected.includes(s));

  if (missing.length > 0) {
    errors.push({
      section: 'sections',
      rule: 'missing_required',
      message: `Missing required sections: ${missing.join(', ')}`,
      severity: 'BLOCKING'
    });
  }

  // STRICT SECTION ORDER ENFORCEMENT
  // Filter detected sections to only those in expected order list
  const mainSectionsDetected = sectionPositions
    .filter(s => EXPECTED_MAIN_SECTION_ORDER.includes(s.key))
    .map(s => s.key);

  // Check if sections are in correct order
  const outOfOrder = [];
  let lastIndex = -1;
  for (const section of mainSectionsDetected) {
    const expectedIndex = EXPECTED_MAIN_SECTION_ORDER.indexOf(section);
    if (expectedIndex < lastIndex) {
      outOfOrder.push(section);
    } else {
      lastIndex = expectedIndex;
    }
  }

  if (outOfOrder.length > 0) {
    errors.push({
      section: 'sections',
      rule: 'wrong_section_order',
      message: `Sections out of expected order: ${outOfOrder.join(', ')}. Expected order: page_intro → first_look → dining → logbook → videos → map → tracker → faq → attribution`,
      severity: 'BLOCKING'
    });
  }

  // Validate grid-2 pairings (First Look + Dining, Deck Plans + Tracker)
  const grid2Sections = $('.grid-2');
  let hasFirstLookDiningPair = false;
  let hasMapTrackerPair = false;

  grid2Sections.each((i, elem) => {
    const content = $(elem).text().toLowerCase();
    if (content.includes('first look') && content.includes('dining')) {
      hasFirstLookDiningPair = true;
    }
    if ((content.includes('deck plan') || content.includes('ship map')) &&
        (content.includes('where is') || content.includes('tracker'))) {
      hasMapTrackerPair = true;
    }
  });

  if (!isTBN && !hasFirstLookDiningPair) {
    warnings.push({
      section: 'sections',
      rule: 'missing_grid2_firstlook_dining',
      message: 'First Look and Dining should be paired in a grid-2 section',
      severity: 'WARNING'
    });
  }

  if (!isTBN && !hasMapTrackerPair) {
    warnings.push({
      section: 'sections',
      rule: 'missing_grid2_map_tracker',
      message: 'Deck Plans and Tracker should be paired in a grid-2 section',
      severity: 'WARNING'
    });
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

  // Check for author card in rail
  const hasAuthorCard = $('aside .author-card-vertical, aside [id*="author"], .rail .author-card').length > 0;
  if (!hasAuthorCard) {
    warnings.push({
      section: 'sections',
      rule: 'missing_author_card',
      message: 'Missing author card in right rail',
      severity: 'WARNING'
    });
  }

  // Check for whimsical units container
  const hasWhimsicalUnits = $('#whimsical-units-container').length > 0;
  if (!hasWhimsicalUnits) {
    warnings.push({
      section: 'sections',
      rule: 'missing_whimsical_units',
      message: 'Missing #whimsical-units-container in right rail',
      severity: 'WARNING'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    data: {
      detected,
      detected_order: mainSectionsDetected,
      expected_order: EXPECTED_MAIN_SECTION_ORDER,
      out_of_order: outOfOrder,
      missing,
      hasRail,
      hasNavTop,
      hasNavBottom,
      hasFallback,
      hasAuthorCard,
      hasWhimsicalUnits,
      hasFirstLookDiningPair,
      hasMapTrackerPair
    }
  };
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

  // Check Swiper configurations for rewind:false and loop:false
  const swiperInits = html.match(/new Swiper\([^)]+\{[\s\S]*?\}\)/g) || [];
  let swiperMissingRewind = 0;
  let swiperMissingLoop = 0;
  swiperInits.forEach(init => {
    if (!init.includes('rewind:false') && !init.includes('rewind: false')) {
      swiperMissingRewind++;
    }
    if (!init.includes('loop:false') && !init.includes('loop: false')) {
      swiperMissingLoop++;
    }
  });
  if (swiperMissingRewind > 0) {
    errors.push({
      section: 'javascript',
      rule: 'swiper_missing_rewind',
      message: `${swiperMissingRewind} Swiper carousels missing rewind:false (causes infinite scroll bug)`,
      severity: 'BLOCKING'
    });
  }
  if (swiperMissingLoop > 0) {
    warnings.push({
      section: 'javascript',
      rule: 'swiper_missing_loop',
      message: `${swiperMissingLoop} Swiper carousels missing loop:false (gold standard requires explicit loop:false)`,
      severity: 'WARNING'
    });
  }

  // Check for version consistency in CSS/JS includes
  const stylesVersion = html.match(/styles\.css\?v=([0-9.]+)/);
  if (!stylesVersion) {
    warnings.push({
      section: 'javascript',
      rule: 'missing_styles_version',
      message: 'styles.css missing version query parameter (e.g., styles.css?v=3.010.400)',
      severity: 'WARNING'
    });
  }

  return { valid: errors.length === 0, errors, warnings, data: { loadArticlesCount, hasDropdown, swiperMissingRewind, swiperMissingLoop, stylesVersion: stylesVersion ? stylesVersion[1] : null } };
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

  // Known fake/placeholder video IDs (exact matches only)
  const FAKE_VIDEO_IDS = new Set([
    'abc123', 'def456', 'ghi789', 'jkl012', 'mno345', 'pqr678', 'stu901', 'vwx234', 'yza567',
    'bcd890', 'efg123', 'hij456', 'klm789',
    'abc123suite', 'def456balc', 'ghi789balc', 'jkl012ocean', 'mno345int', 'pqr678int',
    'stu901food', 'vwx234food', 'yza567acc',
    'dQw4w9WgXcQ'  // Rick Astley - Never Gonna Give You Up
  ]);

  // Valid YouTube video ID: exactly 11 chars, alphanumeric plus - and _
  function isValidYouTubeId(id) {
    if (!id || typeof id !== 'string') return false;
    // Check for known fake IDs first
    if (FAKE_VIDEO_IDS.has(id)) return false;
    // Valid YouTube IDs are exactly 11 characters
    if (id.length !== 11) return false;
    if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) return false;
    return true;
  }

  try {
    await access(videoPath);
    const content = await readFile(videoPath, 'utf-8');
    const data = JSON.parse(content);
    const videos = data.videos || {};

    let totalVideos = 0;
    let fakeVideos = 0;
    const fakeVideoIds = [];
    const missingCategories = [];

    for (const cat of REQUIRED_VIDEO_CATEGORIES) {
      const catVideos = videos[cat] || [];
      totalVideos += catVideos.length;
      if (catVideos.length === 0) {
        missingCategories.push(cat);
      }
      // Check each video ID
      catVideos.forEach(v => {
        if (v.videoId && !isValidYouTubeId(v.videoId)) {
          fakeVideos++;
          fakeVideoIds.push(v.videoId);
        }
      });
    }

    // BLOCKING: Any fake/placeholder video IDs
    if (fakeVideos > 0) {
      errors.push({
        section: 'videos',
        rule: 'fake_video_ids',
        message: `${fakeVideos} fake/placeholder video IDs found: ${fakeVideoIds.slice(0, 3).join(', ')}${fakeVideoIds.length > 3 ? '...' : ''}`,
        severity: 'BLOCKING'
      });
    }

    if (totalVideos < 10) {
      errors.push({ section: 'videos', rule: 'few_videos', message: `Only ${totalVideos} videos, minimum 10`, severity: 'BLOCKING' });
    }

    if (missingCategories.length > 2) {
      errors.push({ section: 'videos', rule: 'missing_categories', message: `Missing video categories: ${missingCategories.join(', ')}`, severity: 'BLOCKING' });
    } else if (missingCategories.length > 0) {
      warnings.push({ section: 'videos', rule: 'some_missing_categories', message: `Missing: ${missingCategories.join(', ')}`, severity: 'WARNING' });
    }

    return { valid: errors.length === 0, errors, warnings, data: { totalVideos, missingCategories, fakeVideos } };

  } catch (e) {
    errors.push({ section: 'videos', rule: 'missing_file', message: `Videos JSON not found`, severity: 'BLOCKING' });
    return { valid: false, errors, warnings, data: {} };
  }
}

/**
 * Validate articles index JSON for Recent Stories rail
 */
async function validateArticles() {
  const errors = [];
  const warnings = [];
  const articlesPath = join(PROJECT_ROOT, 'assets', 'data', 'articles', 'index.json');

  try {
    await access(articlesPath);
    const content = await readFile(articlesPath, 'utf-8');
    const data = JSON.parse(content);
    const articles = data.articles || [];

    if (articles.length === 0) {
      errors.push({ section: 'articles', rule: 'no_articles', message: 'No articles in index.json', severity: 'BLOCKING' });
      return { valid: false, errors, warnings, data: { articleCount: 0 } };
    }

    // Check for required fields
    let missingStatus = 0;
    let missingPublished = 0;
    let missingSlug = 0;
    let missingThumbnail = 0;

    articles.forEach(a => {
      if (!a.status) missingStatus++;
      if (!a.published) missingPublished++;
      if (!a.slug) missingSlug++;
      if (!a.thumbnail) missingThumbnail++;
    });

    if (missingStatus > 0) {
      errors.push({
        section: 'articles',
        rule: 'missing_status',
        message: `${missingStatus} articles missing status field (Recent Stories won't load)`,
        severity: 'BLOCKING'
      });
    }

    if (missingPublished > 0) {
      errors.push({
        section: 'articles',
        rule: 'missing_published',
        message: `${missingPublished} articles missing published date (sorting will fail)`,
        severity: 'BLOCKING'
      });
    }

    if (missingSlug > 0) {
      warnings.push({
        section: 'articles',
        rule: 'missing_slug',
        message: `${missingSlug} articles missing slug field`,
        severity: 'WARNING'
      });
    }

    if (missingThumbnail > 0) {
      warnings.push({
        section: 'articles',
        rule: 'missing_thumbnail',
        message: `${missingThumbnail} articles missing thumbnail`,
        severity: 'WARNING'
      });
    }

    const publishedCount = articles.filter(a => a.status === 'published').length;
    if (publishedCount === 0) {
      errors.push({
        section: 'articles',
        rule: 'no_published',
        message: 'No articles with status="published" (Recent Stories will be empty)',
        severity: 'BLOCKING'
      });
    }

    return { valid: errors.length === 0, errors, warnings, data: { articleCount: articles.length, publishedCount } };

  } catch (e) {
    errors.push({ section: 'articles', rule: 'missing_file', message: 'Articles index.json not found', severity: 'BLOCKING' });
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
    const soliDeoGloriaResult = validateSoliDeoGloria(html);
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

    // New v2.1 validations
    const contentPurityResult = validateContentPurity($, html);
    const shipStatsResult = validateShipStatsJSON($);
    const diningResult = validateDiningJSON($);
    const wordCountResult = validateWordCounts($);

    // Async validations
    const logbookResult = await validateLogbook(slug);
    const videoResult = await validateVideos(slug);
    const articlesResult = await validateArticles();

    // Collect errors
    results.blocking_errors.push(
      ...soliDeoGloriaResult.errors,
      ...breadcrumbResult.errors, ...icpResult.errors, ...jsonldResult.errors,
      ...navResult.errors, ...escapeResult.errors, ...wcagResult.errors,
      ...sectionResult.errors, ...dataResult.errors, ...consistencyResult.errors,
      ...faqResult.errors, ...imageResult.errors, ...jsResult.errors,
      ...logbookResult.errors, ...videoResult.errors, ...articlesResult.errors,
      ...htmlStructureResult.errors, ...viewportResult.errors,
      ...contentPurityResult.errors, ...shipStatsResult.errors,
      ...diningResult.errors, ...wordCountResult.errors
    );

    // Collect warnings
    results.warnings.push(
      ...soliDeoGloriaResult.warnings,
      ...breadcrumbResult.warnings, ...icpResult.warnings, ...jsonldResult.warnings,
      ...navResult.warnings, ...escapeResult.warnings, ...wcagResult.warnings,
      ...sectionResult.warnings, ...dataResult.warnings, ...consistencyResult.warnings,
      ...faqResult.warnings, ...imageResult.warnings, ...jsResult.warnings,
      ...logbookResult.warnings, ...videoResult.warnings, ...articlesResult.warnings,
      ...htmlStructureResult.warnings, ...viewportResult.warnings,
      ...contentPurityResult.warnings, ...shipStatsResult.warnings,
      ...diningResult.warnings, ...wordCountResult.warnings
    );

    // Calculate score
    results.score = 100 - (results.blocking_errors.length * 10) - (results.warnings.length * 2);
    results.score = Math.max(0, results.score);
    results.valid = results.blocking_errors.length === 0;

    // Add detailed data
    results.soli_deo_gloria = soliDeoGloriaResult.data;
    results.icp_lite = icpResult.data;
    results.sections = sectionResult.data;
    results.data_attributes = dataResult.data;
    results.faq = faqResult.data;
    results.images = imageResult.data;
    results.logbook = logbookResult.data;
    results.videos = videoResult.data;
    results.articles = articlesResult.data;
    results.wcag = wcagResult.data;
    results.navigation = navResult.data;
    results.html_structure = htmlStructureResult.data;
    results.viewport = viewportResult.data;
    results.content_purity = contentPurityResult.data;
    results.word_counts = wordCountResult.data;
    results.inline_json = { stats: shipStatsResult.data, dining: diningResult.data };

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
