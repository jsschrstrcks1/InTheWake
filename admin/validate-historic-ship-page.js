#!/usr/bin/env node
/**
 * Historic Ship Page Validator - ITW-SHIP-003 v1.0
 * Soli Deo Gloria
 *
 * Specialized validator for HISTORIC/RETIRED ship pages.
 * Tailored requirements for ships no longer in active service.
 *
 * Key differences from active ship validator (ITW-SHIP-002):
 * - No IMO/live tracker required (ships are retired)
 * - Videos JSON optional (historic footage may not exist)
 * - Reduced logbook stories (4 minimum vs 10)
 * - Reduced images (5 minimum vs 8)
 * - Tracker/video sections not required
 * - Requires "status: Retired" in ai-breadcrumbs
 * - Requires service years in title
 * - Requires "still in service?" FAQ
 *
 * Historic Ships: Sovereign Class, Song Class, Nordic ships, etc.
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
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

// Historic ship class definitions
const HISTORIC_SHIP_CLASSES = {
  'sovereign': ['Sovereign of the Seas', 'Monarch of the Seas', 'Majesty of the Seas'],
  'song': ['Song of Norway', 'Song of America', 'Sun Viking'],
  'nordic': ['Nordic Empress', 'Nordic Prince'],
  'vision-retired': ['Splendour of the Seas', 'Legend of the Seas'],
  'misc-historic': ['Viking Serenade']
};

// All historic ship names for detection
const HISTORIC_SHIPS = Object.values(HISTORIC_SHIP_CLASSES).flat();

// Gold standard navigation items (from index.html)
const GOLD_NAV_ITEMS = [
  '/planning.html', '/ships.html', '/restaurants.html', '/ports.html',
  '/drink-packages.html', '/drink-calculator.html', '/stateroom-check.html',
  '/cruise-lines.html', '/packing-lists.html', '/accessibility.html',
  '/travel.html', '/solo.html', '/tools/port-tracker.html',
  '/tools/ship-tracker.html', '/search.html', '/about-us.html'
];

// Section patterns - reduced requirements for historic ships
const SECTION_PATTERNS = {
  page_intro: /page-intro|intro|looking for|what this page covers/i,
  first_look: /first.?look|gallery|a first look/i,
  history: /history|legacy|heritage|service years/i,
  dining: /dining|restaurants?|venues?/i,
  logbook: /logbook|tales from the wake|crew.?stories/i,
  videos: /videos?|watch|highlights/i,
  map: /map|deck.?plans?/i,
  faq: /faq|frequently asked|questions/i,
  attribution: /attribution|credits?|image.?credits?/i,
  recent_rail: /recent.?stories|recent.?rail/i
};

// Required sections for historic ships (reduced from active ships)
const REQUIRED_SECTIONS_HISTORIC = [
  'page_intro', 'first_look', 'dining', 'logbook',
  'faq', 'attribution', 'recent_rail'
  // Note: 'videos', 'map', 'tracker' NOT required for historic ships
];

/**
 * Count words in text
 */
function countWords(text) {
  if (!text) return 0;
  return text.replace(/\s+/g, ' ').trim().split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Check if ship is historic/retired
 */
function isHistoricShip(filepath, html) {
  const filename = basename(filepath, '.html');
  const shipName = extractShipName(filepath);

  // Check filename patterns
  if (filename.includes('1995-built') || filename.includes('historic')) {
    return true;
  }

  // Check ai-breadcrumbs for status: Retired
  const statusMatch = html.match(/status:\s*(Retired|Historic|Legacy)/i);
  if (statusMatch) {
    return true;
  }

  // Check for "no longer in service" indicators
  if (html.includes('no longer in service') ||
      html.includes('No videos available for historic ship') ||
      html.includes('retired') ||
      html.includes('scrapped')) {
    return true;
  }

  // Check against known historic ships
  for (const historicShip of HISTORIC_SHIPS) {
    if (shipName.toLowerCase().includes(historicShip.toLowerCase().split(' ')[0])) {
      // Check if it's the historic version (not a new ship with same name)
      if (!html.includes('Icon Class') && !html.includes('entering-service')) {
        return true;
      }
    }
  }

  // Check title for year ranges like (1982-1999)
  const titleMatch = html.match(/<title>.*\((\d{4})-(\d{4})\).*<\/title>/i);
  if (titleMatch) {
    return true;
  }

  return false;
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
 * Validate AI-Breadcrumbs for historic ships
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

  // Extract entity field - for historic ships, ship name is acceptable
  const entityMatch = content.match(/entity:\s*(.+)/i);
  if (entityMatch) {
    data.entity = entityMatch[1].trim();
    // Historic ships can have ship name as entity (less strict than active ships)
  } else {
    errors.push({ section: 'ai_breadcrumbs', rule: 'missing_entity', message: 'Missing entity field', severity: 'BLOCKING' });
  }

  // Check for status field (REQUIRED for historic ships)
  const statusMatch = content.match(/status:\s*(.+)/i);
  if (statusMatch) {
    data.status = statusMatch[1].trim();
    if (!data.status.toLowerCase().includes('retired') &&
        !data.status.toLowerCase().includes('historic') &&
        !data.status.toLowerCase().includes('legacy')) {
      warnings.push({
        section: 'ai_breadcrumbs',
        rule: 'unclear_status',
        message: `Status "${data.status}" should indicate retired/historic status`,
        severity: 'WARNING'
      });
    }
  } else {
    errors.push({
      section: 'ai_breadcrumbs',
      rule: 'missing_status',
      message: 'Historic ships require status field (e.g., "status: Retired Ship")',
      severity: 'BLOCKING'
    });
  }

  // Check other required fields (parent and updated still required)
  const requiredFields = ['parent', 'updated'];
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

  // Siblings not strictly required for historic ships (class may be fully retired)
  const siblingsMatch = content.match(/siblings:\s*(.+)/i);
  if (siblingsMatch) {
    data.siblings = siblingsMatch[1].trim();
  } else {
    warnings.push({
      section: 'ai_breadcrumbs',
      rule: 'missing_siblings',
      message: 'Consider adding siblings field for related historic ships',
      severity: 'WARNING'
    });
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
  } else if (aiSummary.length < 80) {
    // Slightly lower threshold for historic ships
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
 * Validate JSON-LD schemas (relaxed for historic ships)
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

  // Required types for historic ships (same as active)
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

  const hasSkipLink = $('a.skip-link, a[href="#main-content"]').length > 0;
  if (!hasSkipLink) {
    errors.push({ section: 'wcag', rule: 'missing_skip_link', message: 'Missing skip-to-content link', severity: 'BLOCKING' });
  }

  const hasLiveRegion = $('[role="status"], [role="alert"], [aria-live]').length > 0;
  if (!hasLiveRegion) {
    warnings.push({ section: 'wcag', rule: 'missing_live_region', message: 'Missing ARIA live regions', severity: 'WARNING' });
  }

  return { valid: errors.length === 0, errors, warnings, data: { hasSkipLink, hasLiveRegion } };
}

/**
 * Validate sections for historic ships
 */
function validateSections($) {
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

  // Use reduced requirements for historic ships
  const missing = REQUIRED_SECTIONS_HISTORIC.filter(s => !detected.includes(s));

  if (missing.length > 0) {
    errors.push({ section: 'sections', rule: 'missing_required', message: `Missing sections: ${missing.join(', ')}`, severity: 'BLOCKING' });
  }

  // Check for history/legacy section (recommended for historic ships)
  if (!detected.includes('history')) {
    warnings.push({
      section: 'sections',
      rule: 'missing_history',
      message: 'Consider adding a History/Legacy section for historic ships',
      severity: 'WARNING'
    });
  }

  // Recent Stories rail elements
  const hasRail = $('#recent-rail').length > 0;
  const hasNavTop = $('#recent-rail-nav-top').length > 0;
  const hasNavBottom = $('#recent-rail-nav-bottom').length > 0;

  if (hasRail && !hasNavTop) {
    errors.push({ section: 'sections', rule: 'missing_nav_top', message: 'Missing #recent-rail-nav-top', severity: 'BLOCKING' });
  }
  if (hasRail && !hasNavBottom) {
    errors.push({ section: 'sections', rule: 'missing_nav_bottom', message: 'Missing #recent-rail-nav-bottom', severity: 'BLOCKING' });
  }

  return { valid: errors.length === 0, errors, warnings, data: { detected, missing, hasRail, hasNavTop, hasNavBottom } };
}

/**
 * Validate data attributes for historic ships
 * IMO is NOT required (ships are retired, no live tracking)
 */
function validateDataAttributes($) {
  const errors = [];
  const warnings = [];

  const dataShip = $('[data-ship]').first().attr('data-ship');
  const dataImo = $('[data-imo]').first().attr('data-imo');

  if (!dataShip) {
    errors.push({ section: 'data_attr', rule: 'missing_data_ship', message: 'Missing data-ship attribute', severity: 'BLOCKING' });
  }

  // IMO is optional for historic ships - just a warning if present but invalid
  if (dataImo && dataImo !== 'N/A' && dataImo !== 'RETIRED' && !/^\d{7}$/.test(dataImo)) {
    warnings.push({ section: 'data_attr', rule: 'invalid_imo', message: `IMO "${dataImo}" is not valid format (use "N/A" or "RETIRED" for historic ships)`, severity: 'WARNING' });
  }

  return { valid: errors.length === 0, errors, warnings, data: { dataShip, dataImo, isHistoric: true } };
}

/**
 * Validate FAQ section for historic ships
 * Must include "Is this ship still in service?" FAQ
 */
function validateFAQ($, html) {
  const errors = [];
  const warnings = [];
  const faqCount = $('details').length;

  if (faqCount === 0) {
    errors.push({ section: 'faq', rule: 'no_faqs', message: 'No FAQ items found', severity: 'BLOCKING' });
  } else if (faqCount < 3) {
    // Slightly lower threshold for historic ships
    warnings.push({ section: 'faq', rule: 'few_faqs', message: `Only ${faqCount} FAQs, recommended 3-6`, severity: 'WARNING' });
  }

  // Check for "still in service" FAQ (required for historic ships)
  const hasServiceFaq = html.toLowerCase().includes('still in service') ||
                        html.toLowerCase().includes('no longer in service') ||
                        html.toLowerCase().includes('is this ship still') ||
                        html.toLowerCase().includes('still sailing');

  if (!hasServiceFaq) {
    errors.push({
      section: 'faq',
      rule: 'missing_service_faq',
      message: 'Historic ships must include FAQ about whether ship is still in service',
      severity: 'BLOCKING'
    });
  }

  return { valid: errors.length === 0, errors, warnings, data: { faqCount, hasServiceFaq } };
}

/**
 * Validate images for historic ships (reduced minimum)
 */
function validateImages($) {
  const errors = [];
  const warnings = [];
  const allImages = $('img');
  const imageCount = allImages.length;

  // Reduced minimum for historic ships (5 instead of 8)
  if (imageCount < 5) {
    errors.push({ section: 'images', rule: 'few_images', message: `Only ${imageCount} images, minimum 5 for historic ships`, severity: 'BLOCKING' });
  }

  let missingAlt = 0;
  let shortAlt = 0;
  let missingLazy = 0;

  allImages.each((i, elem) => {
    const alt = $(elem).attr('alt');
    const loading = $(elem).attr('loading');
    const fetchpriority = $(elem).attr('fetchpriority');
    const ariaHidden = $(elem).attr('aria-hidden');

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

  // Check Swiper configurations for rewind:false
  const swiperInits = html.match(/new Swiper\([^)]+\{[^}]+\}/g) || [];
  let swiperMissingRewind = 0;
  swiperInits.forEach(init => {
    if (!init.includes('rewind:false') && !init.includes('rewind: false')) {
      swiperMissingRewind++;
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

  return { valid: errors.length === 0, errors, warnings, data: { loadArticlesCount, hasDropdown, swiperMissingRewind } };
}

/**
 * Validate HTML structure (unclosed tags)
 */
function validateHTMLStructure(html) {
  const errors = [];
  const warnings = [];

  const openSections = (html.match(/<section[^>]*>/gi) || []).length;
  const closeSections = (html.match(/<\/section>/gi) || []).length;

  if (openSections !== closeSections) {
    errors.push({
      section: 'html_structure',
      rule: 'unclosed_section',
      message: `Mismatched section tags: ${openSections} opening, ${closeSections} closing`,
      severity: 'BLOCKING'
    });
  }

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

  const viewport = $('meta[name="viewport"]').attr('content') || '';
  if (!viewport.includes('width=device-width')) {
    errors.push({
      section: 'viewport',
      rule: 'missing_viewport',
      message: 'Missing or invalid viewport meta tag',
      severity: 'BLOCKING'
    });
  }

  const grid2Sections = $('.grid-2');
  if (grid2Sections.length > 0) {
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

  return { valid: errors.length === 0, errors, warnings, data: { viewport, gridSections: grid2Sections.length } };
}

/**
 * Validate logbook JSON for historic ships (reduced minimum)
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

    // Reduced minimum for historic ships (4 instead of 10)
    if (stories.length < 4) {
      errors.push({ section: 'logbook', rule: 'few_stories', message: `Only ${stories.length} stories, minimum 4 for historic ships`, severity: 'BLOCKING' });
    } else if (stories.length < 6) {
      warnings.push({ section: 'logbook', rule: 'low_stories', message: `${stories.length} stories (6+ recommended)`, severity: 'WARNING' });
    }

    // Persona requirements relaxed for historic ships
    const personaLabels = stories.map(s => (s.persona_label || '').toLowerCase());
    const hasAnyPersona = personaLabels.some(p => p.length > 0);

    if (!hasAnyPersona && stories.length > 0) {
      warnings.push({ section: 'logbook', rule: 'missing_personas', message: 'Stories should have persona_label fields', severity: 'WARNING' });
    }

    // Check story word counts
    let shortStories = 0;
    stories.forEach(s => {
      const words = countWords(s.markdown || '');
      if (words < 200) shortStories++;  // Reduced from 300
    });
    if (shortStories > 0) {
      warnings.push({ section: 'logbook', rule: 'short_stories', message: `${shortStories} stories under 200 words`, severity: 'WARNING' });
    }

    return { valid: errors.length === 0, errors, warnings, data: { storyCount: stories.length, shortStories } };

  } catch (e) {
    errors.push({ section: 'logbook', rule: 'missing_file', message: `Logbook JSON not found: ${logbookPath}`, severity: 'BLOCKING' });
    return { valid: false, errors, warnings, data: {} };
  }
}

/**
 * Validate videos JSON for historic ships (WARNING only, not blocking)
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
    for (const cat of Object.keys(videos)) {
      totalVideos += (videos[cat] || []).length;
    }

    if (totalVideos === 0) {
      warnings.push({ section: 'videos', rule: 'no_videos', message: 'No videos in JSON file', severity: 'WARNING' });
    }

    return { valid: true, errors, warnings, data: { totalVideos, hasFile: true } };

  } catch (e) {
    // Videos are OPTIONAL for historic ships - just a warning
    warnings.push({ section: 'videos', rule: 'missing_file', message: 'Videos JSON not found (optional for historic ships)', severity: 'WARNING' });
    return { valid: true, errors, warnings, data: { hasFile: false } };
  }
}

/**
 * Validate articles index JSON
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

    const publishedCount = articles.filter(a => a.status === 'published').length;
    if (publishedCount === 0) {
      errors.push({
        section: 'articles',
        rule: 'no_published',
        message: 'No articles with status="published"',
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
 * Validate service years in title (REQUIRED for historic ships)
 */
function validateTitle($, html) {
  const errors = [];
  const warnings = [];

  const title = $('title').text();

  // Check for service years like (1982-1999) or (1995-2017)
  const hasServiceYears = /\(\d{4}[-–]\d{4}\)/.test(title);

  if (!hasServiceYears) {
    // Also check for single year like (1982-Built) or just years in title
    const hasYearReference = /\d{4}/.test(title) &&
                             (title.toLowerCase().includes('historic') ||
                              title.toLowerCase().includes('retired'));
    if (!hasYearReference) {
      errors.push({
        section: 'title',
        rule: 'missing_service_years',
        message: 'Historic ship title should include service years, e.g., "(1982-1999)"',
        severity: 'BLOCKING'
      });
    }
  }

  return { valid: errors.length === 0, errors, warnings, data: { title, hasServiceYears } };
}

/**
 * Validate a single historic ship page
 */
async function validateHistoricShipPage(filepath) {
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
    const isHistoric = isHistoricShip(filepath, html);
    const shipName = extractShipName(filepath);

    results.isHistoric = isHistoric;
    results.shipName = shipName;

    if (!isHistoric) {
      results.warnings.push({
        section: 'detection',
        rule: 'not_historic',
        message: 'This ship may not be historic. Use validate-ship-page.js for active ships.',
        severity: 'WARNING'
      });
    }

    // Run all validations
    const breadcrumbResult = validateAIBreadcrumbs(html, shipName);
    const icpResult = validateICPLite($);
    const jsonldResult = validateJSONLD($, filepath);
    const navResult = validateNavigation($);
    const escapeResult = validateEscapeScript(html);
    const wcagResult = validateWCAG($);
    const sectionResult = validateSections($);
    const dataResult = validateDataAttributes($);
    const faqResult = validateFAQ($, html);
    const imageResult = validateImages($);
    const jsResult = validateJavaScript(html);
    const htmlStructureResult = validateHTMLStructure(html);
    const viewportResult = validateViewport($, html);
    const titleResult = validateTitle($, html);

    // Async validations
    const logbookResult = await validateLogbook(slug);
    const videoResult = await validateVideos(slug);
    const articlesResult = await validateArticles();

    // Collect errors
    results.blocking_errors.push(
      ...breadcrumbResult.errors, ...icpResult.errors, ...jsonldResult.errors,
      ...navResult.errors, ...escapeResult.errors, ...wcagResult.errors,
      ...sectionResult.errors, ...dataResult.errors,
      ...faqResult.errors, ...imageResult.errors, ...jsResult.errors,
      ...logbookResult.errors, ...videoResult.errors, ...articlesResult.errors,
      ...htmlStructureResult.errors, ...viewportResult.errors, ...titleResult.errors
    );

    // Collect warnings
    results.warnings.push(
      ...breadcrumbResult.warnings, ...icpResult.warnings, ...jsonldResult.warnings,
      ...navResult.warnings, ...escapeResult.warnings, ...wcagResult.warnings,
      ...sectionResult.warnings, ...dataResult.warnings,
      ...faqResult.warnings, ...imageResult.warnings, ...jsResult.warnings,
      ...logbookResult.warnings, ...videoResult.warnings, ...articlesResult.warnings,
      ...htmlStructureResult.warnings, ...viewportResult.warnings, ...titleResult.warnings
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
    results.articles = articlesResult.data;
    results.wcag = wcagResult.data;
    results.navigation = navResult.data;
    results.html_structure = htmlStructureResult.data;
    results.viewport = viewportResult.data;
    results.title = titleResult.data;

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

  console.log(`\n${colors.bold}${colors.magenta}Historic Ship Page Validation Report - ITW-SHIP-003 v1.0${colors.reset}`);
  console.log('='.repeat(80));
  console.log();

  console.log(`${colors.bold}File:${colors.reset} ${results.file}`);
  console.log(`${colors.bold}Ship:${colors.reset} ${results.shipName || 'Unknown'}`);
  console.log(`${colors.bold}Type:${colors.reset} ${colors.magenta}Historic/Retired Ship${colors.reset}`);

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
    console.log(`  Service FAQ: ${results.faq?.hasServiceFaq ? 'Yes' : 'No'}`);
    console.log(`  Images: ${results.images?.total || 0} (min 5)`);
    console.log(`  Logbook Stories: ${results.logbook?.storyCount || 0} (min 4)`);
    console.log(`  Videos: ${results.videos?.totalVideos || 0} (optional)`);
    console.log(`  Service Years in Title: ${results.title?.hasServiceYears ? 'Yes' : 'No'}`);
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
    allHistoric: args.includes('--all-historic'),
    jsonOutput: args.includes('--json-output'),
    quiet: args.includes('--quiet'),
    files: args.filter(arg => !arg.startsWith('--'))
  };

  let filesToValidate = [];

  if (options.allHistoric) {
    // Find all historic ships by pattern matching
    const allRclFiles = await glob(join(PROJECT_ROOT, 'ships', 'rcl', '*.html'));
    for (const file of allRclFiles) {
      const html = await readFile(file, 'utf-8');
      if (isHistoricShip(file, html)) {
        filesToValidate.push(file);
      }
    }
  } else if (options.files.length > 0) {
    filesToValidate = options.files.map(f => f.startsWith('/') ? f : join(PROJECT_ROOT, f));
  } else {
    console.error('Usage: validate-historic-ship-page.js [options] [files...]');
    console.error('  --all-historic  Validate all detected historic ships');
    console.error('  --json-output   JSON output');
    console.error('  --quiet         Minimal output');
    console.error('');
    console.error('Example: node admin/validate-historic-ship-page.js ships/rcl/sovereign-of-the-seas.html');
    process.exit(1);
  }

  if (filesToValidate.length === 0) {
    console.error('No historic ship files found to validate');
    process.exit(1);
  }

  if (filesToValidate.length === 1) {
    const result = await validateHistoricShipPage(filesToValidate[0]);
    printResults(result, options);
    process.exit(result.valid ? 0 : 1);
  } else {
    const results = [];
    for (const file of filesToValidate) {
      results.push(await validateHistoricShipPage(file));
    }

    if (options.jsonOutput) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      console.log(`\n${colors.bold}${colors.magenta}Historic Ship Batch Validation - ITW-SHIP-003 v1.0${colors.reset}`);
      console.log('='.repeat(80));

      let passed = 0, failed = 0, totalErrors = 0, totalWarnings = 0;

      results.forEach(r => {
        const status = r.valid ? colors.green + 'P' : colors.red + 'F';
        const score = r.score >= 90 ? colors.green : r.score >= 70 ? colors.yellow : colors.red;
        console.log(`${status}${colors.reset} ${r.file} ${score}[${r.score}]${colors.reset} ${r.blocking_errors.length}E ${r.warnings.length}W`);

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

export { validateHistoricShipPage, isHistoricShip };
