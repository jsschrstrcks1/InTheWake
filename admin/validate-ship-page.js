#!/usr/bin/env node
/**
 * Ship Page Validator - ITW-SHIP-002 v2.5
 * Soli Deo Gloria
 *
 * Comprehensive validator for ship pages following the Ship Page Standard v2.0.
 * Validates: ICP-Lite v1.4, JSON-LD schemas, section ordering, content consistency,
 * word counts, video requirements, logbook stories, navigation, WCAG, deduplication.
 *
 * v2.5 Enhancements (Merged — Port Validator Principles + v3.010 Cross-Pollination):
 * - Placeholder image hash detection (from validate-port-page-v2.js)
 * - Image deduplication by file size (from validate-port-page-v2.js)
 * - Template remnant detection: Lorem ipsum, TODO, PLACEHOLDER (Careful Not Clever)
 * - Accessibility keyword checks (from port validator rubric)
 * - Stewardship framing markers (from port validator)
 * - Expanded content purity: nightlife, happy hour, YOLO, slang
 * - Marketing adjective bans (luxury, iconic, world-class, unparalleled)
 * - SDG position check (first 3 lines)
 * - Staleness detection for last-reviewed (>180 days)
 * - Content-promise-vs-delivery checks (from venue validator S06)
 * - Service Worker, canonical URL, answer-line/key-facts checks
 * - Deep logbook: spine validation, disclosure types, emoji ban, female crewmate
 * - Logbook narrative quality: sensory details, emotional pivots, reflection
 *
 * v2.3 Enhancements (External Review Findings — Gemini/ChatGPT):
 * - Duplicate class attributes detection (invalid HTML, styles silently lost)
 * - (V1.Beta) in title tag detection
 * - V1.Beta navbar version badge detection
 * - aria-hidden on Soli Deo Gloria footer (should be accessible)
 * - Generic/templated reviewBody text detection (AI chorus)
 * - Unverified ratingValue detection (must be real editorial assessment)
 *
 * v2.2 Enhancements:
 * - Discoverability validation: search.html, ships.html, ship atlas
 * - 90% threshold rule: ships must score 90%+ before atlas inclusion
 * - Search index presence check (active ships = blocking, TBN/historic = warning)
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

import { readFile, access, readdir, stat } from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import { createHash } from 'crypto';
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
  // page_intro: Match "page-intro" class/id, "intro" as standalone word (not "introduced"), or specific phrases
  page_intro: /page-intro|\bintro\b|looking for .+ planning info|what this page covers|answer-line/i,
  who_shes_for: /who.she.?s.for|who-shes-for|personality.?callout/i,
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

// Valid section orderings — pages may use EITHER layout:
//   Legacy:         page_intro → first_look → dining → logbook → ...
//   Emotional-hook: page_intro → who_shes_for → logbook → first_look → dining → ...
// The emotional-hook order promotes personality content above specs/data.
// See .claude/skills/Humanization/emotional-hook-test.md for rationale.
const VALID_SECTION_ORDERS = [
  // Legacy order (most existing pages — RCL gold standard radiance-of-the-seas.html)
  ['page_intro', 'first_look', 'dining', 'logbook', 'videos', 'map', 'tracker', 'faq', 'attribution'],
  // Emotional-hook order (personality before specs — allure-of-the-seas.html)
  ['page_intro', 'who_shes_for', 'logbook', 'first_look', 'dining', 'videos', 'map', 'tracker', 'faq', 'attribution'],
];

// Union of all sections that appear in any valid ordering (for filtering detected sections)
const ALL_ORDERED_SECTIONS = [...new Set(VALID_SECTION_ORDERS.flat())];

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
  // Marketing adjective bans (per v3.010 — no brochure-speak)
  { pattern: /\bluxury\b/i, category: 'marketing', severity: 'warning' },
  { pattern: /\biconic\b/i, category: 'marketing', severity: 'warning' },
  { pattern: /\bworld[- ]?class\b/i, category: 'marketing', severity: 'warning' },
  { pattern: /\bunparalleled\b/i, category: 'marketing', severity: 'warning' },
  // Drinking/nightlife (blocking)
  { pattern: /\b(bar hop|bar-hop|pub crawl|pub-crawl)\b/i, category: 'drinking' },
  { pattern: /\b(get drunk|getting drunk|wasted|hammered|tipsy)\b/i, category: 'drinking' },
  { pattern: /\b(nightlife|night life|nightclub|night club)\b/i, category: 'nightlife' },
  { pattern: /\b(let loose|go wild|get wild|cut loose)\b/i, category: 'partying' },
  { pattern: /\b(happy hour|cocktail hour|wine tasting|beer flight)\b/i, category: 'drinking', severity: 'warning' },
  // Gambling (warning with allowed context)
  { pattern: /\bcasino\b/i, category: 'gambling', severity: 'warning', allowed_context: /casino royale|virtual casino/i },
  { pattern: /\b(gambling|gamble|betting|bet on)\b/i, category: 'gambling', severity: 'warning' },
  { pattern: /\b(try your luck|slots|poker|blackjack|roulette)\b/i, category: 'gambling', severity: 'warning', allowed_context: /casino royale/i },
  // Profanity and slang (warning)
  { pattern: /\b(damn|hell|crap|ass)\b/i, category: 'profanity', severity: 'warning' },
  { pattern: /\b(wtf|omg|lmao|lmfao)\b/i, category: 'slang', severity: 'warning' },
  // Travel idolatry / hype (warning)
  { pattern: /\b(bucket[ -]?list|once[- ]in[- ]a[- ]lifetime)\b/i, category: 'hype', severity: 'warning' },
  { pattern: /\b(life[- ]?changing|transformative experience)\b/i, category: 'hype', severity: 'warning' },
  { pattern: /\b(YOLO|living my best life)\b/i, category: 'hype', severity: 'warning' }
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

// =============================================================================
// v2.5 CONSTANTS (Principle Import — Port Validator + Careful Not Clever)
// =============================================================================

// Known placeholder image hashes (from validate-port-page-v2.js pattern)
const PLACEHOLDER_HASHES = new Set([
  'd7a4721e321920f7f6414c7a7fe865f0'  // cozumel-fom-1.webp placeholder
]);

// Stewardship framing markers (from port validator)
const STEWARDSHIP_MARKERS = [
  /\bworth\b/i, /\bvalue\b/i, /\bplan(ning)?\b/i, /\bbudget\b/i,
  /\bsave\b/i, /\bsteward/i, /\bgratitude\b/i, /\bgrateful\b/i,
  /\bthankful\b/i, /\bgift\b/i, /\bentrust/i
];

// Template remnant patterns (Careful Not Clever principle)
const TEMPLATE_REMNANT_PATTERNS = [
  { pattern: /lorem ipsum/i, label: 'Lorem ipsum placeholder text' },
  { pattern: /\[TODO\]/i, label: '[TODO] marker' },
  { pattern: /\[FIXME\]/i, label: '[FIXME] marker' },
  { pattern: /\[PLACEHOLDER\]/i, label: '[PLACEHOLDER] marker' },
  { pattern: /\[INSERT[_ ].*?\]/i, label: '[INSERT_...] template variable' },
  { pattern: /INSERT_SHIP_NAME/i, label: 'INSERT_SHIP_NAME template variable' },
  { pattern: /INSERT_CRUISE_LINE/i, label: 'INSERT_CRUISE_LINE template variable' },
  { pattern: /\{\{.*?\}\}/i, label: '{{...}} template placeholder' },
  { pattern: /\$\{[A-Z_]+\}/i, label: '${VARIABLE} template placeholder' },
  { pattern: /TBD_/i, label: 'TBD_ prefix placeholder' },
  { pattern: /REPLACE_ME/i, label: 'REPLACE_ME marker' },
  { pattern: /example\.com/i, label: 'example.com placeholder URL' }
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
 * Check if ship is historic (retired/sold)
 */
function isHistoricShip(html) {
  const lowerHtml = html.toLowerCase();
  return lowerHtml.includes('status: retired') ||
         lowerHtml.includes('sold to tui') ||
         lowerHtml.includes('sold to marella') ||
         lowerHtml.includes('sold to pullmantur') ||
         lowerHtml.includes('sold to celebrity') ||
         lowerHtml.includes('retired ship') ||
         lowerHtml.includes('(historical)') ||
         lowerHtml.includes('retired from service') ||
         lowerHtml.includes('no longer in service') ||
         lowerHtml.includes('scrapped') ||
         lowerHtml.includes('decommissioned');
}

/**
 * Extract ship name from filepath
 */
function extractShipName(filepath) {
  const filename = basename(filepath, '.html');
  return filename.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/**
 * Extract cruise line directory from filepath
 * e.g., /ships/rcl/ship.html -> 'rcl'
 *       /ships/carnival/ship.html -> 'carnival'
 *       /ships/virgin-voyages/ship.html -> 'virgin-voyages'
 */
function extractCruiseLine(filepath) {
  const match = filepath.match(/ships\/([^/]+)\//);
  if (match) {
    return match[1];
  }
  return 'rcl'; // Default fallback
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
 * Validate analytics scripts (REQUIRED per CLAUDE.md Section 0)
 * Every page must have both Google Analytics and Umami
 */
function validateAnalytics($, html) {
  const errors = [];
  const warnings = [];

  // Check for Google Analytics
  const hasGoogleAnalytics = html.includes('googletagmanager.com/gtag/js') &&
                              html.includes('G-WZP891PZXJ');

  // Check for Umami Analytics
  const hasUmami = html.includes('cloud.umami.is/script.js') &&
                   html.includes('9661a449-3ba9-49ea-88e8-4493363578d2');

  if (!hasGoogleAnalytics) {
    errors.push({
      section: 'analytics',
      rule: 'missing_google_analytics',
      message: 'Missing Google Analytics script (REQUIRED per CLAUDE.md Section 0)',
      severity: 'BLOCKING'
    });
  }

  if (!hasUmami) {
    errors.push({
      section: 'analytics',
      rule: 'missing_umami',
      message: 'Missing Umami Analytics script (REQUIRED per CLAUDE.md Section 0)',
      severity: 'BLOCKING'
    });
  }

  // Check that GA has IP anonymization enabled
  if (hasGoogleAnalytics && !html.includes('anonymize_ip:true') && !html.includes('anonymize_ip: true')) {
    warnings.push({
      section: 'analytics',
      rule: 'missing_ip_anonymization',
      message: 'Google Analytics should have anonymize_ip:true for GDPR compliance',
      severity: 'WARNING'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    data: { hasGoogleAnalytics, hasUmami }
  };
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

  // Check SDG is in first 3 lines (before <!doctype html>) per v3.010
  const first3Lines = html.split('\n').slice(0, 3).join('\n');
  const sdgInFirst3 = /soli\s+deo\s+gloria/i.test(first3Lines);
  if (hasSoliDeoGloria && !sdgInFirst3) {
    warnings.push({
      section: 'soli_deo_gloria',
      rule: 'sdg_position',
      message: 'Soli Deo Gloria found but not in first 3 lines. Should appear before <!doctype html>.',
      severity: 'WARNING'
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

  return { valid: errors.length === 0, errors, warnings, data: { hasSoliDeoGloria, hasStandardFormat, sdgInFirst3 } };
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
  } else {
    // Staleness detection (cross-pollinated from venue validator W05)
    const reviewed = new Date(lastReviewed);
    const daysDiff = (new Date() - reviewed) / (1000 * 60 * 60 * 24);
    if (daysDiff > 180) {
      warnings.push({ section: 'icp_lite', rule: 'stale_review', message: `last-reviewed date is ${Math.floor(daysDiff)} days old (${lastReviewed}) — content may be stale`, severity: 'WARNING' });
    }
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

  // Helper to recursively find all @type values in a schema
  function findAllTypes(obj, types = []) {
    if (!obj || typeof obj !== 'object') return types;
    if (obj['@type']) types.push(obj['@type']);
    for (const value of Object.values(obj)) {
      if (Array.isArray(value)) {
        value.forEach(item => findAllTypes(item, types));
      } else if (typeof value === 'object') {
        findAllTypes(value, types);
      }
    }
    return types;
  }

  jsonldScripts.each((i, elem) => {
    try {
      const content = $(elem).html();
      if (content) {
        const data = JSON.parse(content);
        schemas.push(data);
        // Find all types including nested ones (e.g., Person inside Review.author)
        const allTypes = findAllTypes(data);
        foundTypes.push(...allTypes);
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

  // v2.3: Validate review authenticity (no generic/hallucinated ratings)
  if (review) {
    // Check for generic templated reviewBody text
    const reviewBody = (review.reviewBody || '').toLowerCase();
    const genericPatterns = [
      'offers memorable cruise experiences with excellent amenities',
      'offers memorable cruise experiences with excellent',
      'memorable cruise experiences with excellent amenities and service'
    ];
    const isGenericReview = genericPatterns.some(p => reviewBody.includes(p));
    if (isGenericReview) {
      warnings.push({
        section: 'json_ld',
        rule: 'generic_review_text',
        message: 'Review contains generic templated text — reviewBody should reflect real editorial assessment',
        severity: 'WARNING'
      });
    }

    // Check for hard-coded/static ratingValue without real basis
    const rating = review.reviewRating;
    if (rating && rating.ratingValue) {
      // Flag any rating — until real ratings are sourced, all are suspect
      warnings.push({
        section: 'json_ld',
        rule: 'unverified_rating',
        message: `Review has ratingValue ${rating.ratingValue} — must be based on real editorial assessment, not templated`,
        severity: 'WARNING'
      });
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
 * Ship pages use dynamic content loading (logbook, videos) so static word count
 * will be lower than actual rendered content. We validate:
 * 1. Static HTML has adequate baseline content (≥500 words, ≥300 for historic)
 * 2. At least one logbook entry exists in the static HTML as a noscript fallback
 * 3. Dynamic logbook/video JSON adequacy is validated separately by validateLogbook/validateVideos
 */
function validateWordCounts($, isHistoric = false) {
  const errors = [];
  const warnings = [];

  // Get all text from main content, excluding scripts and JSON
  const mainContent = $('main').clone();
  mainContent.find('script, style, noscript').remove();
  const pageText = mainContent.text();
  const totalWords = countWords(pageText);

  // Static content thresholds — dynamic content (logbook, videos) is validated separately
  const STATIC_MIN = isHistoric ? 300 : 500;

  if (totalWords < STATIC_MIN) {
    if (isHistoric) {
      warnings.push({
        section: 'word_counts',
        rule: 'historic_page_short',
        message: `Historic ship has ${totalWords} words static content (acceptable for retired ships)`,
        severity: 'WARNING'
      });
    } else {
      errors.push({
        section: 'word_counts',
        rule: 'page_too_short',
        message: `Static page content (${totalWords} words) below minimum ${STATIC_MIN} (excluding dynamic content)`,
        severity: 'BLOCKING'
      });
    }
  } else if (totalWords > WORD_COUNT_REQUIREMENTS.total_page.max) {
    warnings.push({
      section: 'word_counts',
      rule: 'page_too_long',
      message: `Total page content (${totalWords} words) exceeds maximum ${WORD_COUNT_REQUIREMENTS.total_page.max}`,
      severity: 'WARNING'
    });
  }

  // Check for at least one static logbook entry as noscript fallback
  // Users without JavaScript should still see meaningful content
  const logbookMount = $('#logbook-stories');
  if (logbookMount.length > 0) {
    const logbookStaticContent = logbookMount.text().trim();
    const logbookStaticWords = countWords(logbookStaticContent);
    const hasNoscriptLogbook = $('noscript').filter((i, el) => {
      const text = $(el).text().toLowerCase();
      return text.includes('logbook') || text.includes('story') || text.includes('tale');
    }).length > 0;

    if (logbookStaticWords < 100 && !hasNoscriptLogbook) {
      errors.push({
        section: 'word_counts',
        rule: 'no_static_logbook',
        message: 'Logbook section has no static content for users without JavaScript — add at least one inline story or a <noscript> fallback',
        severity: 'BLOCKING'
      });
    }
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

  return { valid: errors.length === 0, errors, warnings, data: { totalWords, hasStaticLogbook: logbookMount.length > 0 } };
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
function validateSections($, isTBN, isHistoric = false) {
  const errors = [];
  const warnings = [];

  // Track section positions for order validation
  const sectionPositions = [];

  // Scan main content area for sections (in DOM order)
  // Scope to .col-1 (main content column) to exclude rail/aside sections
  // which contain navigation links that could falsely match section patterns
  const mainColSelector = 'main .col-1 section, main .col-1 .card, main .col-1 h2, main .col-1 h3, main .col-1 [class*="page-intro"], main .col-1 .answer-line, main .col-1 [class*="first-look"], main .col-1 [class*="logbook"], main .col-1 [class*="videos"]';
  // Fallback for pages without col-1 structure
  const fallbackSelector = 'main section, main .card, main h2, main h3, main [class*="page-intro"], main .answer-line, main [class*="first-look"], main [class*="logbook"], main [class*="videos"]';
  const hasColStructure = $('main .col-1').length > 0;
  const selector = hasColStructure ? mainColSelector : fallbackSelector;

  $(selector).each((i, elem) => {
    // Skip elements inside aside/rail even with fallback selector
    if ($(elem).closest('aside, .col-2, .rail').length > 0) return;
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

  // Also check for sections outside col-1 but still in main (some pages have sections after col-1)
  $('main > section, main > .card').each((i, elem) => {
    if ($(elem).closest('aside, .col-2, .rail').length > 0) return;
    if ($(elem).hasClass('col-1') || $(elem).hasClass('col-2')) return;

    const text = $(elem).text().substring(0, 200).toLowerCase();
    const id = ($(elem).attr('id') || '').toLowerCase();
    const className = ($(elem).attr('class') || '').toLowerCase();
    const combined = `${text} ${id} ${className}`;

    for (const [key, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(combined) && !detected.includes(key)) {
        detected.push(key);
        break;
      }
    }
  });

  // Also check for rail sections (recent_rail, author_card, etc.) which are in aside/col-2
  $('aside section, .col-2 section, .rail section').each((i, elem) => {
    const text = $(elem).text().substring(0, 200).toLowerCase();
    const id = ($(elem).attr('id') || '').toLowerCase();
    const className = ($(elem).attr('class') || '').toLowerCase();
    const combined = `${text} ${id} ${className}`;

    for (const [key, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(combined) && !detected.includes(key)) {
        detected.push(key);
        break;
      }
    }
  });

  // Check for required sections
  // TBN and Historic ships have relaxed section requirements
  let required;
  if (isTBN) {
    required = ['page_intro', 'first_look', 'dining', 'faq', 'attribution', 'recent_rail'];
  } else if (isHistoric) {
    // Historic ships don't require map/tracker (ship may be scrapped or sold)
    required = ['page_intro', 'first_look', 'dining', 'logbook', 'faq', 'attribution', 'recent_rail'];
  } else {
    required = REQUIRED_SECTIONS;
  }
  const missing = required.filter(s => !detected.includes(s));

  if (missing.length > 0) {
    errors.push({
      section: 'sections',
      rule: 'missing_required',
      message: `Missing required sections: ${missing.join(', ')}`,
      severity: 'BLOCKING'
    });
  }

  // SECTION ORDER ENFORCEMENT (supports dual valid orderings)
  // Filter detected sections to only those in any valid ordering
  const mainSectionsDetected = sectionPositions
    .filter(s => ALL_ORDERED_SECTIONS.includes(s.key))
    .map(s => s.key);

  // Check if sections match ANY valid ordering
  function checkOrder(detected, expected) {
    const outOfOrder = [];
    let lastIndex = -1;
    for (const section of detected) {
      const expectedIndex = expected.indexOf(section);
      if (expectedIndex === -1) continue; // section not in this ordering, skip
      if (expectedIndex < lastIndex) {
        outOfOrder.push(section);
      } else {
        lastIndex = expectedIndex;
      }
    }
    return outOfOrder;
  }

  // Try each valid ordering — page passes if it matches ANY one
  const orderResults = VALID_SECTION_ORDERS.map(order => checkOrder(mainSectionsDetected, order));
  const bestMatch = orderResults.reduce((best, current) =>
    current.length < best.length ? current : best
  );

  if (bestMatch.length > 0) {
    const orderDescriptions = VALID_SECTION_ORDERS.map(o => o.join(' → '));
    errors.push({
      section: 'sections',
      rule: 'wrong_section_order',
      message: `Sections out of expected order: ${bestMatch.join(', ')}. Valid orderings:\n  Legacy: ${orderDescriptions[0]}\n  Emotional-hook: ${orderDescriptions[1]}`,
      severity: 'BLOCKING'
    });
  }

  // Emotional-hook awareness: warn if no personality-first content
  const hasPersonalityFirst = mainSectionsDetected.includes('who_shes_for') ||
    (mainSectionsDetected.indexOf('logbook') !== -1 &&
     mainSectionsDetected.indexOf('logbook') < mainSectionsDetected.indexOf('first_look'));
  if (!isTBN && !isHistoric && !hasPersonalityFirst) {
    warnings.push({
      section: 'sections',
      rule: 'no_personality_first',
      message: 'Page has no personality-first content. Consider adding a "Who She\'s For" section or promoting the logbook above the photo carousel. See emotional-hook-test.md.',
      severity: 'WARNING'
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
      valid_orders: VALID_SECTION_ORDERS,
      out_of_order: bestMatch,
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
function validateDataAttributes($, isTBN, isHistoric = false) {
  const errors = [];
  const warnings = [];

  const dataShip = $('[data-ship]').first().attr('data-ship');
  const dataImo = $('[data-imo]').first().attr('data-imo');

  if (!dataShip) {
    errors.push({ section: 'data_attr', rule: 'missing_data_ship', message: 'Missing data-ship attribute', severity: 'BLOCKING' });
  }

  // TBN and Historic ships don't require data-imo (may not have IMO or ship may be scrapped)
  if (!dataImo && !isTBN && !isHistoric) {
    errors.push({ section: 'data_attr', rule: 'missing_data_imo', message: 'Missing data-imo attribute', severity: 'BLOCKING' });
  } else if (!dataImo && isHistoric) {
    warnings.push({ section: 'data_attr', rule: 'historic_no_imo', message: 'Historic ship has no data-imo (acceptable for retired ships)', severity: 'WARNING' });
  }

  if (isTBN && dataImo && dataImo !== 'TBD') {
    warnings.push({ section: 'data_attr', rule: 'tbn_imo_not_tbd', message: `TBN ship should have data-imo="TBD"`, severity: 'WARNING' });
  }

  // Validate IMO is 7 digits
  if (dataImo && dataImo !== 'TBD' && !/^\d{7}$/.test(dataImo)) {
    errors.push({ section: 'data_attr', rule: 'invalid_imo', message: `IMO "${dataImo}" is not valid 7-digit format`, severity: 'BLOCKING' });
  }

  return { valid: errors.length === 0, errors, warnings, data: { dataShip, dataImo, isTBN, isHistoric } };
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
 * Validate content promises vs. delivery (cross-pollinated from venue validator S06)
 * Checks if meta description promises features the page doesn't actually contain.
 */
function validateContentPromises($) {
  const errors = [];
  const warnings = [];
  const description = ($('meta[name="description"]').attr('content') || '').toLowerCase();
  const bodyText = $('body').text().toLowerCase();

  // Map of promises in meta description → required content signals on page
  const promiseChecks = [
    { keyword: 'deck plan', signals: ['deck-plans', 'deck plan', 'deckplan'], message: 'Meta description mentions "deck plans" but no deck plan section found' },
    { keyword: 'live tracker', signals: ['tracker', 'marinetraffic', 'where is'], message: 'Meta description mentions "live tracker" but no tracker section found' },
    { keyword: 'video', signals: ['youtube.com', 'youtube-nocookie.com', 'video-grid', 'ship-videos'], message: 'Meta description mentions "video" but no video content found' },
    { keyword: 'dining', signals: ['dining', 'restaurant', 'venue'], message: 'Meta description mentions "dining" but no dining section found' },
    { keyword: 'logbook', signals: ['logbook', 'tales from the wake', 'crew-stories'], message: 'Meta description mentions "logbook" but no logbook section found' }
  ];

  for (const check of promiseChecks) {
    if (description.includes(check.keyword)) {
      const hasContent = check.signals.some(sig => bodyText.includes(sig) || $.html().toLowerCase().includes(sig));
      if (!hasContent) {
        warnings.push({ section: 'content_promises', rule: 'unfulfilled_promise', message: check.message, severity: 'WARNING' });
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings, data: {} };
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
function validateImages($, isHistoric = false, filepath = '') {
  const errors = [];
  const warnings = [];
  const allImages = $('img');
  const imageCount = allImages.length;

  // Historic ships have relaxed image requirements (may not have many photos available)
  if (imageCount < 8) {
    if (isHistoric) {
      warnings.push({ section: 'images', rule: 'historic_few_images', message: `Historic ship has ${imageCount} images (acceptable for retired ships)`, severity: 'WARNING' });
    } else {
      errors.push({ section: 'images', rule: 'few_images', message: `Only ${imageCount} images, minimum 8`, severity: 'BLOCKING' });
    }
  }

  let missingAlt = 0;
  let shortAlt = 0;
  let missingLazy = 0;
  let hotlinkedImages = [];
  let missingLocalImages = [];

  // SHIP-005 resolution (2026-04-16): tiered dining-hero acceptance.
  // See admin/validator-spec/rules/SHIP-005.md for the full policy.
  // Tier 1 (pass): ship-specific image under /assets/ships/<line>/<slug>/
  // Tier 2 (pass): sister-of-same-class image under another ship's dir
  // Tier 3 (warn): cruise-line-generic image under /assets/ships/<line>/ or /assets/img/<line>_
  // Reject: Cordelia_Empress_Food_Court (different cruise line entirely) and any cross-line image
  const diningHero = $('#dining-hero');
  const hasDiningHero = diningHero.length > 0;
  let hasCordeliaDining = false;  // kept for downstream data{} consumers

  if (hasDiningHero) {
    const diningHeroSrc = diningHero.attr('src') || '';
    const cruiseLine = extractCruiseLine(filepath);
    const thisShipSlug = basename(filepath, '.html');

    // Explicit reject: Cordelia (wrong cruise line)
    if (diningHeroSrc.includes('Cordelia_Empress_Food_Court')) {
      errors.push({
        section: 'images',
        rule: 'cross_line_dining_hero_cordelia',
        message: 'Dining hero uses Cordelia Empress (wrong cruise line). Use ship-specific > sister-of-class > line-generic (see SHIP-005).',
        severity: 'BLOCKING'
      });
    }
    // Tier 1: ship-specific
    else if (diningHeroSrc.startsWith(`/assets/ships/${cruiseLine}/${thisShipSlug}/`)) {
      // pass — ideal
    }
    // Tier 2: sister ship of same class
    else {
      let tier = null;
      const sisterMatch = diningHeroSrc.match(new RegExp(`^/assets/ships/${cruiseLine}/([^/]+)/`));
      if (sisterMatch) {
        const sisterSlug = sisterMatch[1];
        const sisterName = sisterSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const thisShipName = extractShipName(filepath);
        for (const ships of Object.values(SHIP_CLASSES)) {
          const thisInClass = ships.some(s => thisShipName.toLowerCase().includes(s.toLowerCase().split(' ')[0]));
          const sisterInClass = ships.some(s => sisterName.toLowerCase().includes(s.toLowerCase().split(' ')[0]));
          if (thisInClass && sisterInClass) { tier = 2; break; }
        }
      }
      // Tier 3: cruise-line-generic
      if (tier === null) {
        if (diningHeroSrc.startsWith(`/assets/ships/${cruiseLine}/`) ||
            diningHeroSrc.includes(`/${cruiseLine}_`) ||
            diningHeroSrc.includes(`/${cruiseLine}-`)) {
          tier = 3;
        }
      }
      if (tier === 3) {
        warnings.push({
          section: 'images',
          rule: 'dining_hero_line_generic_fallback',
          message: `Dining hero is line-generic (${cruiseLine}), not ship-specific. Upgrade to ship-specific or sister-of-class image when available.`,
          severity: 'WARNING'
        });
      } else if (tier === null) {
        // Neither ship-specific, nor sister, nor line-generic → cross-line reject
        errors.push({
          section: 'images',
          rule: 'dining_hero_cross_line',
          message: `Dining hero src "${diningHeroSrc.substring(0, 80)}" is not from ${thisShipSlug}, a sister-class ship, or ${cruiseLine} line. Must match SHIP-005 tier 1/2/3.`,
          severity: 'BLOCKING'
        });
      }
    }
  } else {
    // Check if page has a dining section - if so, it needs a dining-hero image
    const hasDiningSection = $('[id="dining"], [aria-labelledby="dining"], section.card:contains("Dining")').length > 0;
    if (hasDiningSection) {
      errors.push({
        section: 'images',
        rule: 'missing_dining_hero',
        message: 'Dining section exists but missing dining-hero image (see SHIP-005 tiered acceptance policy)',
        severity: 'BLOCKING'
      });
    }
  }

  // Allowed external domains for images (CDNs, YouTube thumbnails for video sections)
  const allowedExternalDomains = [
    'img.youtube.com',
    'i.ytimg.com',
    'cruisinginthewake.com'
  ];

  allImages.each((i, elem) => {
    const src = $(elem).attr('src') || '';
    const alt = $(elem).attr('alt');
    const loading = $(elem).attr('loading');
    const fetchpriority = $(elem).attr('fetchpriority');
    const ariaHidden = $(elem).attr('aria-hidden');

    // Check for hotlinked images (external URLs)
    if (src.startsWith('http://') || src.startsWith('https://')) {
      const isAllowed = allowedExternalDomains.some(domain => src.includes(domain));
      if (!isAllowed) {
        hotlinkedImages.push(src.substring(0, 60) + (src.length > 60 ? '...' : ''));
      }
    } else if (src.startsWith('/assets/ships/')) {
      // Check if local ship image exists
      const localPath = join(PROJECT_ROOT, src.split('?')[0]); // Remove query params
      if (!existsSync(localPath)) {
        missingLocalImages.push(src.split('?')[0]);
      }
    }

    // Decorative images with aria-hidden="true" are allowed to have empty alt
    if (!alt && ariaHidden !== 'true') missingAlt++;
    else if (alt && alt.length < 20 && ariaHidden !== 'true') shortAlt++;

    if (fetchpriority !== 'high' && loading !== 'eager' && loading !== 'lazy') {
      missingLazy++;
    }
  });

  // BLOCKING: Hotlinked images must be locally hosted
  if (hotlinkedImages.length > 0) {
    errors.push({
      section: 'images',
      rule: 'hotlinked_images',
      message: `${hotlinkedImages.length} image(s) hotlinked from external sources - must be locally hosted: ${hotlinkedImages.slice(0, 3).join(', ')}${hotlinkedImages.length > 3 ? '...' : ''}`,
      severity: 'BLOCKING'
    });
  }

  // BLOCKING: Referenced images must exist locally
  if (missingLocalImages.length > 0) {
    errors.push({
      section: 'images',
      rule: 'missing_local_images',
      message: `${missingLocalImages.length} image(s) referenced but not found locally: ${missingLocalImages.slice(0, 3).join(', ')}${missingLocalImages.length > 3 ? '...' : ''}`,
      severity: 'BLOCKING'
    });
  }

  if (missingAlt > 0) {
    errors.push({ section: 'images', rule: 'missing_alt', message: `${missingAlt} images missing alt text`, severity: 'BLOCKING' });
  }
  if (shortAlt > 0) {
    warnings.push({ section: 'images', rule: 'short_alt', message: `${shortAlt} images have short alt text`, severity: 'WARNING' });
  }
  if (missingLazy > 0) {
    errors.push({ section: 'images', rule: 'missing_lazy', message: `${missingLazy} non-hero images missing loading="lazy" (LCP / mobile bandwidth)`, severity: 'BLOCKING' });
  }

  return { valid: errors.length === 0, errors, warnings, data: { total: imageCount, missingAlt, shortAlt, missingLazy, hotlinked: hotlinkedImages.length, missingLocal: missingLocalImages.length, hasDiningHero, hasCordeliaDining } };
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

  // Check for JavaScript-based image hotlinking (e.g., Wikimedia Special:FilePath)
  const hotlinkingPatterns = [
    /commons\.wikimedia\.org\/wiki\/Special:FilePath/,
    /upload\.wikimedia\.org/,
    /imgEl\.src\s*=\s*['"]https?:\/\/(?!img\.youtube|i\.ytimg|cruisinginthewake)/
  ];
  const hasJsHotlinking = hotlinkingPatterns.some(pattern => pattern.test(html));
  if (hasJsHotlinking) {
    errors.push({
      section: 'javascript',
      rule: 'js_hotlinking',
      message: 'JavaScript dynamically loads images from external sources (Wikimedia/etc) - images must be locally hosted',
      severity: 'BLOCKING'
    });
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
 * Validate clean console (no runtime JavaScript errors)
 * Checks for patterns that would cause console errors when the page loads
 */
function validateCleanConsole(html) {
  const errors = [];
  const warnings = [];
  const issues = [];

  // 1. Uncaught syntax errors - check for obvious JS syntax issues
  const scriptBlocks = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];

  scriptBlocks.forEach((block, index) => {
    // Extract just the JS content
    const jsContent = block.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');

    // Check for unclosed string literals (basic check)
    const lines = jsContent.split('\n');
    lines.forEach((line, lineNum) => {
      // Skip comments
      if (line.trim().startsWith('//')) return;

      // Check for console.log/error/warn statements (debug code left in)
      if (/console\.(log|warn|error|debug|info)\s*\(/.test(line)) {
        issues.push(`Script block ${index + 1}: console statement found (line ~${lineNum + 1})`);
      }
    });

    // Check for undefined function calls that are common mistakes
    const problematicPatterns = [
      { pattern: /\.addEventListner\(/, message: 'Typo: addEventListner should be addEventListener' },
      { pattern: /\.innerHtml\s*=/, message: 'Typo: innerHtml should be innerHTML' },
      { pattern: /\.classlist\./, message: 'Typo: classlist should be classList' },
      { pattern: /document\.getElementByID\(/, message: 'Typo: getElementByID should be getElementById' },
      { pattern: /\.getElementByClassName\(/, message: 'Typo: getElementByClassName should be getElementsByClassName' },
      { pattern: /\.queryselector\(/, message: 'Typo: queryselector should be querySelector' },
      { pattern: /\.appendchild\(/, message: 'Typo: appendchild should be appendChild' },
      { pattern: /\.setattribute\(/, message: 'Typo: setattribute should be setAttribute' }
    ];

    problematicPatterns.forEach(({ pattern, message }) => {
      if (pattern.test(jsContent)) {
        issues.push(`Script block ${index + 1}: ${message}`);
      }
    });

    // Check for accessing properties on potentially null querySelector results without null check
    // Pattern: querySelector(...).property without optional chaining or null check
    const unsafeQuerySelectorAccess = jsContent.match(/querySelector\([^)]+\)\.(classList|style|innerHTML|textContent|value|src|href|id|className)/g) || [];
    if (unsafeQuerySelectorAccess.length > 0) {
      // Only flag if there's no preceding null check or optional chaining
      unsafeQuerySelectorAccess.forEach(match => {
        // Check if this pattern appears without optional chaining (?)
        if (!jsContent.includes(match.replace(').', ')?.')) && !jsContent.includes('if (' + match.split('.')[0])) {
          issues.push(`Potential null reference: ${match.substring(0, 50)}... (use ?. or null check)`);
        }
      });
    }
  });

  // 2. Check for broken JSON in inline scripts (data-ship-stats-fallback, etc.)
  const jsonDataAttributes = html.match(/data-[a-z-]+-json='[^']*'/g) || [];
  jsonDataAttributes.forEach(attr => {
    const jsonStr = attr.replace(/data-[a-z-]+-json='/, '').replace(/'$/, '');
    try {
      JSON.parse(jsonStr);
    } catch (e) {
      issues.push(`Invalid JSON in ${attr.substring(0, 30)}...: ${e.message}`);
    }
  });

  // 3. Check for script tags referencing non-existent local files (common 404 error)
  const scriptSrcs = html.match(/src="(\/[^"]+\.js[^"]*)"/g) || [];
  scriptSrcs.forEach(src => {
    const path = src.match(/src="([^"]+)"/)?.[1];
    if (path && path.startsWith('/') && !path.startsWith('//')) {
      const localPath = join(PROJECT_ROOT, path.split('?')[0]);
      try {
        if (!existsSync(localPath)) {
          issues.push(`Script 404: ${path} not found`);
        }
      } catch (e) {
        // Ignore access errors
      }
    }
  });

  // 4. Check for thrown errors or explicit error handling that might indicate problems
  if (html.includes('throw new Error') && !html.includes('try')) {
    issues.push('Unhandled throw statement without try/catch');
  }

  // Determine severity
  if (issues.length > 0) {
    // Console.log statements are warnings, other issues are errors
    const consoleStatements = issues.filter(i => i.includes('console statement'));
    const actualErrors = issues.filter(i => !i.includes('console statement'));

    if (actualErrors.length > 0) {
      errors.push({
        section: 'clean_console',
        rule: 'js_runtime_errors',
        message: `${actualErrors.length} potential console error(s): ${actualErrors.slice(0, 2).join('; ')}${actualErrors.length > 2 ? '...' : ''}`,
        severity: 'BLOCKING'
      });
    }

    if (consoleStatements.length > 0) {
      warnings.push({
        section: 'clean_console',
        rule: 'debug_statements',
        message: `${consoleStatements.length} console statement(s) found (debug code in production)`,
        severity: 'WARNING'
      });
    }
  }

  return { valid: errors.length === 0, errors, warnings, data: { issues, clean: issues.length === 0 } };
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
    // Check if CSS likely handles this — global styles.css includes .grid-2 responsive rules
    const hasGridStyle = html.includes('.grid-2') || html.includes('grid-template');
    const hasGlobalStylesheet = html.includes('styles.css');
    if (!hasGridStyle && !hasGlobalStylesheet) {
      warnings.push({
        section: 'viewport',
        rule: 'grid_responsive',
        message: 'grid-2 sections found but no responsive CSS detected (no styles.css or inline grid rules)',
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
async function validateLogbook(slug, cruiseLine = 'rcl', isHistoric = false) {
  const errors = [];
  const warnings = [];
  const logbookPath = join(PROJECT_ROOT, 'assets', 'data', 'logbook', cruiseLine, `${slug}.json`);

  try {
    await access(logbookPath);
    const content = await readFile(logbookPath, 'utf-8');
    const data = JSON.parse(content);
    const stories = data.stories || [];

    // Historic ships have relaxed story count requirements
    if (stories.length < 10) {
      if (isHistoric) {
        warnings.push({ section: 'logbook', rule: 'historic_few_stories', message: `Historic ship has ${stories.length} stories (acceptable for retired ships)`, severity: 'WARNING' });
      } else {
        errors.push({ section: 'logbook', rule: 'few_stories', message: `Only ${stories.length} stories, minimum 10`, severity: 'BLOCKING' });
      }
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

    // Narrative quality checks (cross-pollinated from port validator)
    // Check that stories contain emotional pivot markers, sensory details, and reflection
    let storiesWithoutEmotion = 0;
    let storiesWithoutReflection = 0;
    let sensoryProfile = { visual: 0, auditory: 0, tactile: 0, olfactory: 0, gustatory: 0 };

    const SENSORY_PATTERNS = {
      visual: /\b(saw|watched|looked|gazed|glimpsed|noticed|spotted|observed|stared|glanced)\b/i,
      auditory: /\b(heard|listened|sound|noise|silence|quiet|whisper|roar|crash|echo)\b/i,
      tactile: /\b(felt|touched|cold|warm|hot|cool|breeze|wind|rough|smooth|soft)\b/i,
      olfactory: /\b(smell|scent|aroma|fragrance|whiff|odor|stench)\b/i,
      gustatory: /\b(taste|tasted|flavor|sweet|salty|bitter|sour|savory|delicious)\b/i
    };

    const LESSON_MARKERS = [
      /the lesson:/i, /what .* taught me/i, /I (learned|realized|understood|discovered)/i,
      /looking back/i, /in retrospect/i, /the (real|true) (gift|lesson|meaning)/i,
      /sometimes you/i, /what matters (is|was)/i
    ];

    stories.forEach(s => {
      const text = s.markdown || '';
      if (text.length < 100) return; // Skip very short/empty stories

      // Check emotional pivot markers (EMOTIONAL_PIVOT_MARKERS defined at top of file)
      const hasEmotion = EMOTIONAL_PIVOT_MARKERS.some(p => p.test(text));
      if (!hasEmotion) storiesWithoutEmotion++;

      // Check reflection/lesson markers
      const hasReflection = LESSON_MARKERS.some(p => p.test(text));
      if (!hasReflection) storiesWithoutReflection++;

      // Accumulate sensory coverage across all stories
      for (const [sense, pattern] of Object.entries(SENSORY_PATTERNS)) {
        if (pattern.test(text)) sensoryProfile[sense]++;
      }
    });

    const sensesUsed = Object.entries(sensoryProfile).filter(([, count]) => count > 0).map(([sense]) => sense);

    if (storiesWithoutEmotion > stories.length / 2) {
      warnings.push({ section: 'logbook', rule: 'weak_emotional_content', message: `${storiesWithoutEmotion}/${stories.length} stories lack emotional pivot markers (tears, heart reactions, whispers, etc.)`, severity: 'WARNING' });
    }
    if (storiesWithoutReflection > stories.length / 2) {
      warnings.push({ section: 'logbook', rule: 'missing_reflection', message: `${storiesWithoutReflection}/${stories.length} stories lack lesson/reflection markers ("I learned", "looking back", etc.)`, severity: 'WARNING' });
    }
    if (sensesUsed.length < 3) {
      warnings.push({ section: 'logbook', rule: 'limited_sensory_detail', message: `Logbook stories only engage ${sensesUsed.length}/5 senses (${sensesUsed.join(', ') || 'none'}). Aim for 3+ senses across stories.`, severity: 'WARNING' });
    }

    // ── v3.010 Logbook spine validation (7 required sections) ──
    const REQUIRED_SPINE_SECTIONS = [
      { pattern: /full\s+disclosure/i, label: 'Full Disclosure' },
      { pattern: /crew\s+(and|&)\s+staff/i, label: 'The Crew and Staff' },
      { pattern: /embark|disembark/i, label: 'Embarkation & Disembarkation' },
      { pattern: /real\s+talk/i, label: 'The Real Talk' },
      { pattern: /accessibility\s+(on|at)\s+the\s+seas?/i, label: 'Accessibility on the Seas' },
      { pattern: /female\s+crewmate/i, label: "A Female Crewmate's Perspective" },
      { pattern: /closing\s+thoughts?/i, label: 'Closing Thoughts' }
    ];

    const allStoryText = stories.map(s => s.markdown || s.title || '').join(' ');
    const allHeaders = stories.map(s => s.title || s.section || '').join(' ');
    const spineDetected = [];
    const spineMissing = [];

    for (const sec of REQUIRED_SPINE_SECTIONS) {
      if (sec.pattern.test(allHeaders) || sec.pattern.test(allStoryText)) {
        spineDetected.push(sec.label);
      } else {
        spineMissing.push(sec.label);
      }
    }

    if (spineMissing.length > 0) {
      warnings.push({
        section: 'logbook',
        rule: 'spine_sections_missing',
        message: `Logbook missing ${spineMissing.length} spine section(s): ${spineMissing.join(', ')}`,
        severity: 'WARNING'
      });
    }

    // ── v3.010 Disclosure type validation (A/B/C) ──
    const DISCLOSURE_TYPES = {
      A: /type[- ]?a|sailed|firsthand|personal experience/i,
      B: /type[- ]?b|research[- ]based|haven't sailed|not yet visited/i,
      C: /type[- ]?c|mixed|partial experience/i
    };

    let disclosureType = null;
    for (const [type, pattern] of Object.entries(DISCLOSURE_TYPES)) {
      if (pattern.test(allStoryText) || pattern.test(allHeaders)) {
        disclosureType = type;
        break;
      }
    }

    if (!disclosureType) {
      warnings.push({
        section: 'logbook',
        rule: 'missing_disclosure_type',
        message: 'No disclosure type (A/B/C) detected. Logbook should declare if stories are firsthand (A), research-based (B), or mixed (C).',
        severity: 'WARNING'
      });
    }

    // ── v3.010 No emojis in logbook ──
    const emojiPattern = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}]/gu;
    let storiesWithEmojis = 0;
    stories.forEach(s => {
      const text = s.markdown || '';
      if (emojiPattern.test(text)) storiesWithEmojis++;
    });

    if (storiesWithEmojis > 0) {
      errors.push({
        section: 'logbook',
        rule: 'no_emojis',
        message: `${storiesWithEmojis} logbook story/stories contain emoji characters. Logbook entries must use prose, not emojis.`,
        severity: 'BLOCKING'
      });
    }

    // ── v3.010 Female crewmate validation ──
    let hasFemaleCrewmate = false;
    let femaleCrewmateNamed = false;
    let femaleCrewmateLocation = false;

    stories.forEach(s => {
      const text = s.markdown || '';
      const title = s.title || '';
      if (/female\s+crewmate/i.test(title) || /female\s+crewmate/i.test(text)) {
        hasFemaleCrewmate = true;
        // Check if named (a proper noun after "crewmate" or a name pattern)
        if (/crewmate['']?s?\s+perspective.*?[A-Z][a-z]+/i.test(text) || /\bher name\b|\bnamed\s+[A-Z]/i.test(text) || /\b(she|her)\b.*\b(from|based in|lives in|hails from)\b/i.test(text)) {
          femaleCrewmateNamed = true;
        }
        // Check for home location
        if (/\b(from|based in|lives in|hails from|hometown|home country)\b/i.test(text)) {
          femaleCrewmateLocation = true;
        }
      }
    });

    if (!hasFemaleCrewmate) {
      warnings.push({
        section: 'logbook',
        rule: 'missing_female_crewmate',
        message: "No 'A Female Crewmate's Perspective' section found in logbook stories",
        severity: 'WARNING'
      });
    } else {
      if (!femaleCrewmateNamed) {
        warnings.push({
          section: 'logbook',
          rule: 'female_crewmate_unnamed',
          message: 'Female crewmate section exists but crewmate does not appear to be named',
          severity: 'WARNING'
        });
      }
      if (!femaleCrewmateLocation) {
        warnings.push({
          section: 'logbook',
          rule: 'female_crewmate_no_location',
          message: 'Female crewmate section exists but no home location mentioned',
          severity: 'WARNING'
        });
      }
    }

    return {
      valid: errors.length === 0, errors, warnings,
      data: {
        storyCount: stories.length, hasPersonas, shortStories, sensesUsed,
        storiesWithoutEmotion, storiesWithoutReflection,
        spineDetected, spineMissing, disclosureType,
        storiesWithEmojis, hasFemaleCrewmate, femaleCrewmateNamed, femaleCrewmateLocation
      }
    };

  } catch (e) {
    errors.push({ section: 'logbook', rule: 'missing_file', message: `Logbook JSON not found: ${logbookPath}`, severity: 'BLOCKING' });
    return { valid: false, errors, warnings, data: {} };
  }
}

/**
 * Validate videos JSON
 */
async function validateVideos(slug, cruiseLine = 'rcl', isHistoric = false, isTBN = false) {
  const errors = [];
  const warnings = [];
  const videoPath = join(PROJECT_ROOT, 'assets', 'data', 'videos', cruiseLine, `${slug}.json`);

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

    // Historic and TBN ships have relaxed video requirements (D1/D2 exemption)
    if (isHistoric) {
      // For historic ships, just check the file exists (already validated above)
      if (totalVideos === 0) {
        warnings.push({ section: 'videos', rule: 'historic_no_videos', message: 'Historic ship has no videos (acceptable for retired ships)', severity: 'WARNING' });
      }
    } else if (isTBN) {
      // TBN ships exempt from video requirements per D2 (same terms as D1)
      if (totalVideos === 0) {
        warnings.push({ section: 'videos', rule: 'tbn_no_videos', message: 'TBN ship has no videos (exempt until ship enters service — D2/D1)', severity: 'WARNING' });
      } else if (totalVideos < 10) {
        warnings.push({ section: 'videos', rule: 'tbn_few_videos', message: `TBN ship has only ${totalVideos} videos (exempt until ship enters service — D2/D1)`, severity: 'WARNING' });
      }
      if (missingCategories.length > 0) {
        warnings.push({ section: 'videos', rule: 'tbn_missing_categories', message: `TBN ship missing video categories: ${missingCategories.join(', ')} (exempt until ship enters service)`, severity: 'WARNING' });
      }
    } else {
      if (totalVideos < 10) {
        errors.push({ section: 'videos', rule: 'few_videos', message: `Only ${totalVideos} videos, minimum 10`, severity: 'BLOCKING' });
      }

      if (missingCategories.length > 2) {
        errors.push({ section: 'videos', rule: 'missing_categories', message: `Missing video categories: ${missingCategories.join(', ')}`, severity: 'BLOCKING' });
      } else if (missingCategories.length > 0) {
        warnings.push({ section: 'videos', rule: 'some_missing_categories', message: `Missing: ${missingCategories.join(', ')}`, severity: 'WARNING' });
      }
    }

    return { valid: errors.length === 0, errors, warnings, data: { totalVideos, missingCategories, fakeVideos } };

  } catch (e) {
    if (isTBN) {
      warnings.push({ section: 'videos', rule: 'missing_file', message: 'Videos JSON not found (TBN ship exempt until entering service — D2/D1)', severity: 'WARNING' });
      return { valid: true, errors, warnings, data: {} };
    }
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

// =============================================================================
// DISCOVERABILITY VALIDATION (v2.2)
// Ships must be findable via search.html, ships.html, and ship atlas (at 90%+)
// =============================================================================

// Cache for index data (loaded once per batch validation)
let searchIndexCache = null;
let shipAtlasCache = null;

/**
 * Load search index (cached)
 */
async function loadSearchIndex() {
  if (searchIndexCache) return searchIndexCache;

  const searchIndexPath = join(PROJECT_ROOT, 'assets', 'data', 'search-index.json');
  try {
    const content = await readFile(searchIndexPath, 'utf-8');
    searchIndexCache = JSON.parse(content);
    return searchIndexCache;
  } catch (e) {
    return [];
  }
}

/**
 * Load ship atlas (cached)
 */
async function loadShipAtlas() {
  if (shipAtlasCache) return shipAtlasCache;

  const atlasPath = join(PROJECT_ROOT, 'data', 'atlas', 'ship-size-atlas.json');
  try {
    const content = await readFile(atlasPath, 'utf-8');
    const data = JSON.parse(content);
    shipAtlasCache = data.ships || [];
    return shipAtlasCache;
  } catch (e) {
    return [];
  }
}

/**
 * Validate ship is in search index (search.html discoverability)
 */
async function validateSearchIndex(slug, cruiseLine, shipName, isTBN, isHistoric) {
  const errors = [];
  const warnings = [];

  const searchIndex = await loadSearchIndex();
  const expectedUrl = `/ships/${cruiseLine}/${slug}.html`;

  // Find ship in search index
  const inSearchIndex = searchIndex.some(entry =>
    entry.url === expectedUrl ||
    entry.url === expectedUrl.replace('.html', '') ||
    (entry.title && entry.title.toLowerCase().includes(shipName.toLowerCase()))
  );

  if (!inSearchIndex) {
    // TBN and historic ships get a warning, active ships get blocking error
    if (isTBN || isHistoric) {
      warnings.push({
        section: 'discoverability',
        rule: 'not_in_search_index',
        message: `Ship not in search-index.json (search.html won't find it)`,
        severity: 'WARNING'
      });
    } else {
      errors.push({
        section: 'discoverability',
        rule: 'not_in_search_index',
        message: `Ship not in search-index.json (search.html won't find it) - add to /assets/data/search-index.json`,
        severity: 'BLOCKING'
      });
    }
  }

  return { valid: errors.length === 0, errors, warnings, data: { inSearchIndex, expectedUrl } };
}

/**
 * Validate ship atlas presence with 90% rule
 * - Ships with score >= 90% MUST be in atlas
 * - Ships with score < 90% should NOT be in atlas yet
 */
async function validateShipAtlas(slug, cruiseLine, shipName, score, isTBN, isHistoric) {
  const errors = [];
  const warnings = [];

  const atlas = await loadShipAtlas();

  // Atlas ship_id format: brand-slug (e.g., "rcl-wonder-of-the-seas")
  // Map cruise line directory to atlas brand
  const brandMap = {
    'rcl': 'royal-caribbean',
    'carnival': 'carnival',
    'norwegian': 'norwegian',
    'celebrity-cruises': 'celebrity',
    'princess': 'princess',
    'holland-america-line': 'holland-america',
    'msc': 'msc',
    'costa': 'costa',
    'cunard': 'cunard',
    'silversea': 'silversea',
    'seabourn': 'seabourn',
    'regent': 'regent',
    'oceania': 'oceania',
    'viking': 'viking',
    'virgin-voyages': 'virgin-voyages',
    'explora-journeys': 'explora',
    'disney': 'disney',
    'azamara': 'azamara'
  };

  const atlasBrand = brandMap[cruiseLine] || cruiseLine;
  const expectedAtlasId = `${cruiseLine}-${slug}`;
  const altAtlasId = `${atlasBrand}-${slug}`;

  // Find ship in atlas
  const inAtlas = atlas.some(ship =>
    ship.ship_id === expectedAtlasId ||
    ship.ship_id === altAtlasId ||
    (ship.name_current && ship.name_current.toLowerCase() === shipName.toLowerCase())
  );

  // TBN ships are exempt from atlas requirements
  if (isTBN) {
    if (inAtlas) {
      warnings.push({
        section: 'discoverability',
        rule: 'tbn_in_atlas',
        message: `TBN ship is in atlas (unusual - may need removal until ship is named)`,
        severity: 'WARNING'
      });
    }
    return { valid: true, errors, warnings, data: { inAtlas, score, meetsThreshold: false } };
  }

  // Historic ships: warning only if not in atlas
  if (isHistoric) {
    if (!inAtlas) {
      warnings.push({
        section: 'discoverability',
        rule: 'historic_not_in_atlas',
        message: `Historic ship not in ship atlas (acceptable for retired ships)`,
        severity: 'WARNING'
      });
    }
    return { valid: true, errors, warnings, data: { inAtlas, score, meetsThreshold: false } };
  }

  // Active ships: 90% threshold rule
  const meetsThreshold = score >= 90;

  if (meetsThreshold && !inAtlas) {
    // Ship is ready (90%+) but not in atlas - BLOCKING
    errors.push({
      section: 'discoverability',
      rule: 'ready_not_in_atlas',
      message: `Ship scores ${score}% (≥90%) but not in ship atlas - add to /data/atlas/ship-size-atlas.json`,
      severity: 'BLOCKING'
    });
  } else if (!meetsThreshold && inAtlas) {
    // Ship is in atlas but page not ready (<90%) - WARNING (keep in atlas for data, but don't link to page yet)
    warnings.push({
      section: 'discoverability',
      rule: 'in_atlas_not_ready',
      message: `Ship in atlas but page only ${score}% ready - do not link from atlas page until 90%+`,
      severity: 'WARNING'
    });
  } else if (!meetsThreshold && !inAtlas) {
    // Not ready and not in atlas - that's correct, but note it
    warnings.push({
      section: 'discoverability',
      rule: 'not_atlas_ready',
      message: `Ship scores ${score}% - needs 90%+ to be added to ship atlas`,
      severity: 'WARNING'
    });
  }
  // If meetsThreshold && inAtlas, everything is good - no error or warning

  return { valid: errors.length === 0, errors, warnings, data: { inAtlas, score, meetsThreshold } };
}

/**
 * Validate a single ship page
 */
/**
 * Validate Print Guide Button
 * Requires: <button class="print-guide-btn"> inside <main>, right before </main>
 * Generator rule: print button is the last element before </main> closes
 */
function validatePrintButton($, html) {
  const errors = [];
  const warnings = [];
  const btn = $('main button.print-guide-btn');
  if (btn.length === 0) {
    errors.push({
      section: 'print_button',
      rule: 'missing',
      message: 'Missing print guide button (button.print-guide-btn) inside <main>',
      severity: 'BLOCKING'
    });
  } else {
    // Verify it has correct onclick and aria-label
    if (!btn.attr('onclick') || !btn.attr('onclick').includes('window.print')) {
      warnings.push({
        section: 'print_button',
        rule: 'onclick',
        message: 'Print button missing onclick="window.print()"',
        severity: 'WARNING'
      });
    }
    if (!btn.attr('aria-label')) {
      warnings.push({
        section: 'print_button',
        rule: 'aria_label',
        message: 'Print button missing aria-label attribute',
        severity: 'WARNING'
      });
    }
    // Verify it is positioned right before </main>
    const mainClosingPattern = /class="print-guide-btn"[\s\S]*?<\/button>\s*<\/main>/;
    if (!mainClosingPattern.test(html)) {
      warnings.push({
        section: 'print_button',
        rule: 'position',
        message: 'Print button should be the last element before </main>',
        severity: 'WARNING'
      });
    }
  }
  return { valid: errors.length === 0, errors, warnings, data: { hasPrintButton: btn.length > 0 } };
}

/**
 * Validate external review findings (v2.3)
 * Checks identified by Gemini/ChatGPT review of ship page template:
 * - Duplicate class attributes on same element (invalid HTML, styles silently lost)
 * - (V1.Beta) in title tags (signals unfinished site)
 * - V1.Beta version badge in navbar (unnecessary for production)
 * - aria-hidden on SDG footer dedication (should be accessible per Ken's decision)
 */
function validateExternalReviewFindings($, html) {
  const errors = [];
  const warnings = [];
  const data = {
    duplicateClassCount: 0,
    hasBetaTitle: false,
    hasBetaBadge: false,
    sdgAriaHidden: false
  };

  // 1. Duplicate class attributes on same element
  // Match any opening tag that contains class="..." followed by another class="..."
  const duplicateClassRegex = /class="[^"]*"[^>]*class="/gi;
  const duplicateMatches = html.match(duplicateClassRegex) || [];
  data.duplicateClassCount = duplicateMatches.length;
  if (duplicateMatches.length > 0) {
    warnings.push({
      section: 'html_validity',
      rule: 'duplicate_class_attr',
      message: `${duplicateMatches.length} element(s) have duplicate class attributes — second class is silently ignored by browsers`,
      severity: 'WARNING'
    });
  }

  // 2. (V1.Beta) in <title> tag
  const title = $('title').text() || '';
  data.hasBetaTitle = /\(V1\.Beta\)/i.test(title);
  if (data.hasBetaTitle) {
    warnings.push({
      section: 'html_validity',
      rule: 'beta_in_title',
      message: `Title contains "(V1.Beta)" — signals unfinished site to users and AI`,
      severity: 'WARNING'
    });
  }

  // 3. V1.Beta version badge in navbar
  const versionBadge = $('span.version-badge');
  data.hasBetaBadge = versionBadge.length > 0 && /V1\.Beta/i.test(versionBadge.text());
  if (data.hasBetaBadge) {
    warnings.push({
      section: 'html_validity',
      rule: 'beta_navbar_badge',
      message: 'Navbar contains V1.Beta version badge — remove for production',
      severity: 'WARNING'
    });
  }

  // 4. aria-hidden on SDG footer dedication (should be accessible)
  const sdgElements = $('[aria-hidden="true"]').filter((i, el) => {
    const text = $(el).text().toLowerCase();
    return text.includes('soli deo gloria');
  });
  data.sdgAriaHidden = sdgElements.length > 0;
  if (data.sdgAriaHidden) {
    warnings.push({
      section: 'accessibility',
      rule: 'sdg_aria_hidden',
      message: 'Soli Deo Gloria footer dedication has aria-hidden="true" — should be accessible to all users',
      severity: 'WARNING'
    });
  }

  return { valid: errors.length === 0, errors, warnings, data };
}

// =============================================================================
// STANDARDS v3.010 CROSS-POLLINATION CHECKS
// =============================================================================

/**
 * Validate Service Worker registration (MOBILE_STANDARDS v1.000)
 */
function validateServiceWorkerShip(html) {
  const warnings = [];
  const hasSWRegister = html.includes('serviceWorker.register') || html.includes('serviceWorker');

  if (!hasSWRegister) {
    warnings.push({
      section: 'service_worker',
      rule: 'missing_sw_registration',
      message: 'No Service Worker registration found. Add navigator.serviceWorker.register(\'/sw.js\') for offline support.',
      severity: 'WARNING'
    });
  }

  return { valid: true, errors: [], warnings, data: { hasServiceWorker: hasSWRegister } };
}

/**
 * Validate canonical URL format (must be absolute https://cruisinginthewake.com/...)
 */
function validateCanonicalURLShip($) {
  const errors = [];
  const canonical = $('link[rel="canonical"]').attr('href') || '';

  if (!canonical) {
    errors.push({
      section: 'canonical',
      rule: 'missing_canonical',
      message: 'Missing <link rel="canonical"> tag',
      severity: 'BLOCKING'
    });
  } else if (!canonical.startsWith('https://cruisinginthewake.com/')) {
    errors.push({
      section: 'canonical',
      rule: 'invalid_canonical_format',
      message: `Canonical URL must be absolute https://cruisinginthewake.com/ format, found "${canonical}"`,
      severity: 'BLOCKING'
    });
  }

  return { valid: errors.length === 0, errors, warnings: [], data: { canonical } };
}

/**
 * Validate answer-line and key-facts presence (ICP-Lite / ship standard)
 */
function validateAnswerLineKeyFactsShip($) {
  const errors = [];
  const hasAnswerLine = $('.answer-line').length > 0 || $('[class*="answer-line"]').length > 0;
  const hasKeyFacts = $('.key-facts').length > 0 || $('[class*="key-facts"]').length > 0;

  if (!hasAnswerLine) {
    errors.push({
      section: 'content_structure',
      rule: 'missing_answer_line',
      message: 'Missing answer-line element. Every ship page needs a quick one-line answer.',
      severity: 'BLOCKING'
    });
  }

  if (!hasKeyFacts) {
    errors.push({
      section: 'content_structure',
      rule: 'missing_key_facts',
      message: 'Missing key-facts element. Every ship page needs a key facts summary.',
      severity: 'BLOCKING'
    });
  }

  return { valid: errors.length === 0, errors, warnings: [], data: { hasAnswerLine, hasKeyFacts } };
}

// =============================================================================
// v2.5 VALIDATION FUNCTIONS (Port Validator Principle Import)
// v2.4 VALIDATION FUNCTIONS (Principle Import)
// =============================================================================

/**
 * Validate ship images for placeholders and duplicates
 * Imported from validate-port-page-v2.js pattern
 */
async function validateShipImages(filepath, cruiseLine, slug) {
  const errors = [];
  const warnings = [];

  const imgDirs = [
    join(PROJECT_ROOT, 'assets', 'ships', cruiseLine),
    join(PROJECT_ROOT, 'assets', 'img', 'ships', slug)
  ];

  let imageFiles = [];
  let imgDir = null;

  for (const dir of imgDirs) {
    if (existsSync(dir)) {
      imgDir = dir;
      try {
        const files = await readdir(dir);
        imageFiles = files.filter(f =>
          f.toLowerCase().includes(slug.replace(/-/g, '')) ||
          f.toLowerCase().includes(slug)
        ).filter(f => f.endsWith('.webp') || f.endsWith('.jpg') || f.endsWith('.png'));
      } catch (e) {
        // Skip unreadable directories
      }
      break;
    }
  }

  if (!imgDir || imageFiles.length === 0) {
    return { valid: true, errors, warnings, data: { checked: false } };
  }

  // Check each image for placeholder hash
  let placeholderCount = 0;
  const placeholderImages = [];

  for (const imgFile of imageFiles) {
    const imgPath = join(imgDir, imgFile);
    try {
      const imgBuffer = readFileSync(imgPath);
      const hash = createHash('md5').update(imgBuffer).digest('hex');
      if (PLACEHOLDER_HASHES.has(hash)) {
        placeholderCount++;
        placeholderImages.push(imgFile);
      }
    } catch (e) {
      // Skip unreadable files
    }
  }

  if (placeholderCount > 0) {
    errors.push({
      section: 'ship_images',
      rule: 'placeholder_images_detected',
      message: `${placeholderCount} placeholder image(s) detected: ${placeholderImages.slice(0, 3).join(', ')}${placeholderCount > 3 ? '...' : ''}. Each ship must have unique images.`,
      severity: 'BLOCKING'
    });
  }

  // Check for images with identical file sizes (potential duplicates)
  const sizeGroups = {};
  for (const imgFile of imageFiles) {
    const imgPath = join(imgDir, imgFile);
    try {
      const stats = await stat(imgPath);
      if (!sizeGroups[stats.size]) sizeGroups[stats.size] = [];
      sizeGroups[stats.size].push(imgFile);
    } catch (e) { /* skip */ }
  }

  const duplicateSizeGroups = Object.entries(sizeGroups)
    .filter(([, files]) => files.length > 2)
    .map(([, files]) => files);

  if (duplicateSizeGroups.length > 0) {
    const totalSuspicious = duplicateSizeGroups.reduce((acc, g) => acc + g.length, 0);
    warnings.push({
      section: 'ship_images',
      rule: 'potential_duplicate_images',
      message: `${totalSuspicious} images have identical file sizes, may be duplicates/placeholders`,
      severity: 'WARNING'
    });
  }

  return {
    valid: errors.length === 0, errors, warnings,
    data: { checked: true, total_ship_images: imageFiles.length, placeholder_images: placeholderCount, potential_duplicates: duplicateSizeGroups.length > 0 }
  };
}

/**
 * Validate template remnants (Careful Not Clever principle)
 */
function validateTemplateRemnants($, html) {
  const errors = [];
  const warnings = [];
  const found = [];
  const bodyText = $('body').text();

  for (const rule of TEMPLATE_REMNANT_PATTERNS) {
    if (rule.pattern.test(bodyText) || rule.pattern.test(html)) {
      const match = bodyText.match(rule.pattern) || html.match(rule.pattern);
      found.push(rule.label);
      errors.push({
        section: 'template_remnants',
        rule: 'placeholder_content',
        message: `Template remnant found: ${rule.label}${match ? ` ("${match[0].substring(0, 40)}")` : ''}`,
        severity: 'BLOCKING'
      });
    }
  }

  return { valid: errors.length === 0, errors, warnings, data: { found, count: found.length } };
}

/**
 * Validate accessibility keyword presence (from port validator rubric)
 */
function validateAccessibilityKeywords($) {
  const errors = [];
  const warnings = [];
  const fullText = $('body').text().toLowerCase();
  const accessibilityKeywords = ['wheelchair', 'mobility', 'accessible', 'accessibility', 'special needs', 'disability', 'ada'];
  const accessibilityMentions = accessibilityKeywords.filter(kw => fullText.includes(kw));

  if (accessibilityMentions.length < 1) {
    warnings.push({
      section: 'accessibility_content',
      rule: 'missing_accessibility_keywords',
      message: 'No accessibility keywords found in page content (wheelchair, mobility, accessible, etc.)',
      severity: 'WARNING'
    });
  }

  return { valid: errors.length === 0, errors, warnings, data: { accessibilityMentions, count: accessibilityMentions.length } };
}

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
    const isHistoric = isHistoricShip(html);
    const shipName = extractShipName(filepath);
    const cruiseLine = extractCruiseLine(filepath);

    results.isTBN = isTBN;
    results.isHistoric = isHistoric;
    results.shipName = shipName;
    results.cruiseLine = cruiseLine;

    // Run all validations
    const soliDeoGloriaResult = validateSoliDeoGloria(html);
    const breadcrumbResult = validateAIBreadcrumbs(html, shipName);
    const icpResult = validateICPLite($);
    const jsonldResult = validateJSONLD($, filepath);
    const navResult = validateNavigation($);
    const escapeResult = validateEscapeScript(html);
    const wcagResult = validateWCAG($);
    const sectionResult = validateSections($, isTBN, isHistoric);
    const dataResult = validateDataAttributes($, isTBN, isHistoric);
    const consistencyResult = validateContentConsistency($, filepath);
    const faqResult = validateFAQ($);
    const imageResult = validateImages($, isHistoric, filepath);
    const jsResult = validateJavaScript(html);
    const cleanConsoleResult = validateCleanConsole(html);
    const htmlStructureResult = validateHTMLStructure(html);
    const viewportResult = validateViewport($, html);

    // New v2.1 validations
    const analyticsResult = validateAnalytics($, html);
    const contentPurityResult = validateContentPurity($, html);
    const shipStatsResult = validateShipStatsJSON($);
    const diningResult = validateDiningJSON($);
    const wordCountResult = validateWordCounts($, isHistoric);
    const printButtonResult = validatePrintButton($, html);

    // v2.3 external review findings
    const externalReviewResult = validateExternalReviewFindings($, html);

    // Content-promise-vs-delivery (cross-pollinated from venue validator S06)
    const contentPromisesResult = validateContentPromises($);

    // v3.010 standards cross-pollination checks
    const serviceWorkerResult = validateServiceWorkerShip(html);
    const canonicalResult = validateCanonicalURLShip($);
    const answerLineResult = validateAnswerLineKeyFactsShip($);

    // v2.5 principle import validations
    // NOTE: validateVoiceQuality was referenced but never implemented.
    // Stub returns no errors/warnings so scoring is unaffected until the function is written.
    const voiceQualityResult = { errors: [], warnings: [] };

    // v2.4 principle import validations
    const templateRemnantResult = validateTemplateRemnants($, html);
    const accessibilityKeywordResult = validateAccessibilityKeywords($);

    // Async validations (pass cruiseLine for correct data paths)
    const logbookResult = await validateLogbook(slug, cruiseLine, isHistoric);
    const videoResult = await validateVideos(slug, cruiseLine, isHistoric, isTBN);
    const articlesResult = await validateArticles();
    const shipImageResult = await validateShipImages(filepath, cruiseLine, slug);

    // Stub: voiceQualityResult — function not yet implemented, prevent crash
    // (First declaration at line 2908; this duplicate removed 2026-04-16)
    // const voiceQualityResult = { errors: [], warnings: [] };

    // Calculate preliminary score for discoverability checks
    const preliminaryErrors = [
      ...analyticsResult.errors, ...soliDeoGloriaResult.errors,
      ...breadcrumbResult.errors, ...icpResult.errors, ...jsonldResult.errors,
      ...navResult.errors, ...escapeResult.errors, ...wcagResult.errors,
      ...sectionResult.errors, ...dataResult.errors, ...consistencyResult.errors,
      ...faqResult.errors, ...imageResult.errors, ...jsResult.errors,
      ...cleanConsoleResult.errors,
      ...logbookResult.errors, ...videoResult.errors, ...articlesResult.errors,
      ...htmlStructureResult.errors, ...viewportResult.errors,
      ...contentPurityResult.errors, ...shipStatsResult.errors,
      ...diningResult.errors, ...wordCountResult.errors,
      ...externalReviewResult.errors, ...contentPromisesResult.errors,
      ...canonicalResult.errors, ...answerLineResult.errors,
      ...voiceQualityResult.errors,
      ...templateRemnantResult.errors, ...shipImageResult.errors,
      ...accessibilityKeywordResult.errors
    ];
    const preliminaryWarnings = [
      ...analyticsResult.warnings, ...soliDeoGloriaResult.warnings,
      ...breadcrumbResult.warnings, ...icpResult.warnings, ...jsonldResult.warnings,
      ...navResult.warnings, ...escapeResult.warnings, ...wcagResult.warnings,
      ...sectionResult.warnings, ...dataResult.warnings, ...consistencyResult.warnings,
      ...faqResult.warnings, ...imageResult.warnings, ...jsResult.warnings,
      ...cleanConsoleResult.warnings,
      ...logbookResult.warnings, ...videoResult.warnings, ...articlesResult.warnings,
      ...htmlStructureResult.warnings, ...viewportResult.warnings,
      ...contentPurityResult.warnings, ...shipStatsResult.warnings,
      ...diningResult.warnings, ...wordCountResult.warnings,
      ...externalReviewResult.warnings, ...contentPromisesResult.warnings,
      ...serviceWorkerResult.warnings,
      ...voiceQualityResult.warnings,
      ...templateRemnantResult.warnings, ...shipImageResult.warnings,
      ...accessibilityKeywordResult.warnings
    ];
    const preliminaryScore = Math.max(0, 100 - (preliminaryErrors.length * 10) - (preliminaryWarnings.length * 2));

    // v2.2 Discoverability validations (need preliminary score for atlas 90% rule)
    const searchIndexResult = await validateSearchIndex(slug, cruiseLine, shipName, isTBN, isHistoric);
    const shipAtlasResult = await validateShipAtlas(slug, cruiseLine, shipName, preliminaryScore, isTBN, isHistoric);

    // Collect errors
    results.blocking_errors.push(
      ...analyticsResult.errors,
      ...soliDeoGloriaResult.errors,
      ...breadcrumbResult.errors, ...icpResult.errors, ...jsonldResult.errors,
      ...navResult.errors, ...escapeResult.errors, ...wcagResult.errors,
      ...sectionResult.errors, ...dataResult.errors, ...consistencyResult.errors,
      ...faqResult.errors, ...imageResult.errors, ...jsResult.errors,
      ...cleanConsoleResult.errors,
      ...logbookResult.errors, ...videoResult.errors, ...articlesResult.errors,
      ...htmlStructureResult.errors, ...viewportResult.errors,
      ...contentPurityResult.errors, ...shipStatsResult.errors,
      ...diningResult.errors, ...wordCountResult.errors,
      ...printButtonResult.errors,
      ...searchIndexResult.errors, ...shipAtlasResult.errors,
      ...externalReviewResult.errors,
      ...contentPromisesResult.errors,
      ...canonicalResult.errors,
      ...answerLineResult.errors,
      ...voiceQualityResult.errors,
      ...templateRemnantResult.errors, ...shipImageResult.errors,
      ...accessibilityKeywordResult.errors
    );

    // Collect warnings
    results.warnings.push(
      ...analyticsResult.warnings,
      ...soliDeoGloriaResult.warnings,
      ...breadcrumbResult.warnings, ...icpResult.warnings, ...jsonldResult.warnings,
      ...navResult.warnings, ...escapeResult.warnings, ...wcagResult.warnings,
      ...sectionResult.warnings, ...dataResult.warnings, ...consistencyResult.warnings,
      ...faqResult.warnings, ...imageResult.warnings, ...jsResult.warnings,
      ...cleanConsoleResult.warnings,
      ...logbookResult.warnings, ...videoResult.warnings, ...articlesResult.warnings,
      ...htmlStructureResult.warnings, ...viewportResult.warnings,
      ...contentPurityResult.warnings, ...shipStatsResult.warnings,
      ...diningResult.warnings, ...wordCountResult.warnings,
      ...printButtonResult.warnings,
      ...searchIndexResult.warnings, ...shipAtlasResult.warnings,
      ...externalReviewResult.warnings,
      ...contentPromisesResult.warnings,
      ...serviceWorkerResult.warnings,
      ...voiceQualityResult.warnings,
      ...templateRemnantResult.warnings, ...shipImageResult.warnings,
      ...accessibilityKeywordResult.warnings
    );

    // Calculate score
    results.score = 100 - (results.blocking_errors.length * 10) - (results.warnings.length * 2);
    results.score = Math.max(0, results.score);
    results.valid = results.blocking_errors.length === 0;

    // Add detailed data
    results.analytics = analyticsResult.data;
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
    results.print_button = printButtonResult.data;
    results.navigation = navResult.data;
    results.html_structure = htmlStructureResult.data;
    results.viewport = viewportResult.data;
    results.content_purity = contentPurityResult.data;
    results.word_counts = wordCountResult.data;
    results.clean_console = cleanConsoleResult.data;
    results.inline_json = { stats: shipStatsResult.data, dining: diningResult.data };
    results.discoverability = {
      search_index: searchIndexResult.data,
      ship_atlas: shipAtlasResult.data
    };
    results.external_review = externalReviewResult.data;
    results.service_worker = serviceWorkerResult.data;
    results.canonical = canonicalResult.data;
    results.answer_line_key_facts = answerLineResult.data;

    // v2.5 data
    results.template_remnants = templateRemnantResult.data;
    results.ship_images = shipImageResult.data;
    results.accessibility_keywords = accessibilityKeywordResult.data;

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

  console.log(`\n${colors.bold}${colors.cyan}Ship Page Validation Report - ITW-SHIP-002 v2.5${colors.reset}`);
  console.log('='.repeat(80));
  console.log();

  console.log(`${colors.bold}File:${colors.reset} ${results.file}`);
  console.log(`${colors.bold}Ship:${colors.reset} ${results.shipName || 'Unknown'}`);
  console.log(`${colors.bold}Cruise Line:${colors.reset} ${results.cruiseLine || 'Unknown'}`);
  const shipType = results.isTBN ? 'TBN (Future Ship)' : results.isHistoric ? 'Historic (Retired/Sold)' : 'Active Ship';
  console.log(`${colors.bold}Type:${colors.reset} ${shipType}`);

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
      console.log(`\n${colors.bold}${colors.cyan}Ship Page Batch Validation - ITW-SHIP-002 v2.5${colors.reset}`);
      console.log('='.repeat(80));

      let passed = 0, failed = 0, totalErrors = 0, totalWarnings = 0;

      results.forEach(r => {
        const status = r.valid ? colors.green + 'P' : colors.red + 'F';
        const score = r.score >= 90 ? colors.green : r.score >= 70 ? colors.yellow : colors.red;
        const typeLabel = r.isTBN ? colors.dim + ' [TBN]' + colors.reset : r.isHistoric ? colors.dim + ' [HIST]' + colors.reset : '';
        console.log(`${status}${colors.reset} ${r.file}${typeLabel} ${score}[${r.score}]${colors.reset} ${r.blocking_errors.length}E ${r.warnings.length}W`);

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
