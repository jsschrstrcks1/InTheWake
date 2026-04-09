#!/usr/bin/env node
/**
 * Port Page Validator - ITC v1.1 + LOGBOOK_ENTRY_STANDARDS v2.300
 * Soli Deo Gloria
 *
 * Comprehensive validator for port pages following:
 * - PORT-PAGE-STANDARD.md (ITC v1.1)
 * - LOGBOOK_ENTRY_STANDARDS_v2.300.md
 * - ICP-Lite v1.4 Protocol
 *
 * Validates: section ordering, word counts, images, cross-links, ICP-Lite v1.4,
 * rubric compliance, logbook narrative structure, voice requirements
 */

import { readFile, readdir, stat } from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { createHash } from 'crypto';
import { join, dirname, relative, basename } from 'path';
import { fileURLToPath } from 'url';
import { load } from 'cheerio';
import { glob } from 'glob';
import { validateVoiceQuality } from './lib/voice-quality-checks.js';

// Known placeholder image hashes (should not appear on ANY port page)
const PLACEHOLDER_HASHES = new Set([
  'd7a4721e321920f7f6414c7a7fe865f0',  // generic placeholder image
  'cdf8bd1f00cbe19173712e81050c669c',  // "Image Coming Soon" gray geometric placeholder
  '3c0a625569b86226396f24fc471590ae',  // solid blue rectangle placeholder
]);

// Dynamic cross-port hash map: built at runtime by scanning all port image dirs.
// Maps hash → Set<port_slug> for every .webp that appears in 2+ port directories.
// Cached after first build so it only runs once per validator session.
let _crossPortHashMap = null;

async function buildCrossPortHashMap() {
  if (_crossPortHashMap) return _crossPortHashMap;

  const portImgBase = join(PROJECT_ROOT, 'ports', 'img');
  const hashToPorts = new Map(); // hash → Map<port_slug, [filenames]>

  let portDirs;
  try {
    portDirs = await readdir(portImgBase);
  } catch (e) {
    _crossPortHashMap = new Map();
    return _crossPortHashMap;
  }

  for (const portSlug of portDirs) {
    const portDir = join(portImgBase, portSlug);
    try {
      const dirStat = await stat(portDir);
      if (!dirStat.isDirectory()) continue;
    } catch (e) { continue; }

    let files;
    try {
      files = await readdir(portDir);
    } catch (e) { continue; }

    for (const file of files) {
      if (!file.endsWith('.webp')) continue;
      try {
        const imgBuffer = readFileSync(join(portDir, file));
        const hash = createHash('md5').update(imgBuffer).digest('hex');

        // Skip known placeholders (handled separately)
        if (PLACEHOLDER_HASHES.has(hash)) continue;

        if (!hashToPorts.has(hash)) {
          hashToPorts.set(hash, new Map());
        }
        const portMap = hashToPorts.get(hash);
        if (!portMap.has(portSlug)) {
          portMap.set(portSlug, []);
        }
        portMap.get(portSlug).push(file);
      } catch (e) { /* skip unreadable files */ }
    }
  }

  // Keep only hashes that appear in 2+ different port directories
  _crossPortHashMap = new Map();
  for (const [hash, portMap] of hashToPorts) {
    if (portMap.size > 1) {
      _crossPortHashMap.set(hash, portMap);
    }
  }

  return _crossPortHashMap;
}

// Human-reviewed allowlist: cross-port duplicates that have been manually
// verified and assigned to a specific port. Loaded from
// admin/cross-port-image-allowlist.json.
// Format: Map of hash → approvedPort (the one port where this image belongs).
let _allowedDuplicateMap = null;

function loadAllowedDuplicates() {
  if (_allowedDuplicateMap) return _allowedDuplicateMap;

  _allowedDuplicateMap = new Map(); // hash → approvedPort
  const allowlistPath = join(dirname(fileURLToPath(import.meta.url)), 'cross-port-image-allowlist.json');
  try {
    const data = JSON.parse(readFileSync(allowlistPath, 'utf-8'));
    if (Array.isArray(data.reviewed)) {
      for (const entry of data.reviewed) {
        if (entry.hash && entry.approvedPort) {
          _allowedDuplicateMap.set(entry.hash, entry.approvedPort);
        }
      }
    }
  } catch (e) {
    // Allowlist missing or malformed — treat all duplicates as unreviewed
  }

  return _allowedDuplicateMap;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Cache for site integration data (loaded once)
let siteIntegrationCache = null;

/**
 * Load site integration data from ports.html and search-index.json
 * This is cached to avoid reading files multiple times
 */
async function loadSiteIntegrationData() {
  if (siteIntegrationCache) {
    return siteIntegrationCache;
  }

  const portsHtmlPath = join(PROJECT_ROOT, 'ports.html');
  const searchIndexPath = join(PROJECT_ROOT, 'assets/data/search-index.json');

  let portsHtmlLinks = new Set();
  let searchIndexUrls = new Set();

  try {
    // Load ports.html and extract all port links
    const portsHtml = await readFile(portsHtmlPath, 'utf-8');
    const linkMatches = portsHtml.matchAll(/href="(\/ports\/[^"]+\.html)"/g);
    for (const match of linkMatches) {
      portsHtmlLinks.add(match[1]);
    }
  } catch (error) {
    console.error(`Warning: Could not load ports.html: ${error.message}`);
  }

  try {
    // Load search-index.json and extract port URLs
    const searchIndexRaw = await readFile(searchIndexPath, 'utf-8');
    const searchIndex = JSON.parse(searchIndexRaw);
    for (const entry of searchIndex) {
      if (entry.url && entry.url.startsWith('/ports/')) {
        searchIndexUrls.add(entry.url);
      }
    }
  } catch (error) {
    console.error(`Warning: Could not load search-index.json: ${error.message}`);
  }

  siteIntegrationCache = {
    portsHtmlLinks,
    searchIndexUrls
  };

  return siteIntegrationCache;
}

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

// =============================================================================
// SECTION PATTERNS (ITC v1.1)
// =============================================================================

const SECTION_PATTERNS = {
  hero: /hero|port-hero|header-image/i,
  logbook: /logbook|first.?person|personal|my (visit|experience|thoughts?)|the moment/i,
  featured_images: /featured.?images?|inline.?images?/i,
  cruise_port: /(the )?cruise (port|terminal)|port (of call|terminal|facilities)/i,
  getting_around: /getting (around|there|to|from)|transportation|how to get/i,
  map: /map|interactive.?map|port.?map/i,
  beaches: /beaches?|beach guide|coastal/i,
  excursions: /(top )?excursions?|attractions?|things to (do|see)|activities/i,
  history: /\bhistory\b|\bhistorical\b|\bheritage\b/i,
  cultural: /cultural? (features?|highlights?|experiences?)|\btraditions?\b(?!ally)/i,
  shopping: /\bshopping\b|\bretail\b/i,
  food: /\bfood\b(?! culture)|\bdining\b|\brestaurants?\b|\bcuisine\b/i,
  notices: /(special )?notices?|warnings?|alerts?|important|know before/i,
  depth_soundings: /depth soundings|final thoughts?|in conclusion|the (real|honest) story/i,
  practical: /practical (information|info)|quick reference|at a glance|summary/i,
  faq: /(frequently asked questions?|faq|common questions?)/i,
  gallery: /(photo )?gallery|photos?|images?|swiper/i,
  credits: /(image |photo )?credits?|attributions?|photo sources?/i,
  back_nav: /back (to|navigation)|return to ports/i
};

// Expected section order (ITC v1.1)
const EXPECTED_MAIN_ORDER = [
  'hero', 'logbook', 'featured_images', 'cruise_port', 'getting_around',
  'map', 'beaches', 'excursions', 'history', 'cultural', 'shopping',
  'food', 'notices', 'depth_soundings', 'practical', 'gallery',
  'credits', 'faq', 'back_nav'
];

// Required sections (cannot be skipped)
const REQUIRED_SECTIONS = [
  'hero', 'logbook', 'cruise_port', 'getting_around', 'excursions',
  'depth_soundings', 'faq', 'gallery'
];

// Sections that MUST be collapsible
const COLLAPSIBLE_REQUIRED = [
  'logbook', 'cruise_port', 'getting_around', 'map', 'beaches', 'excursions',
  'history', 'cultural', 'shopping', 'food', 'notices',
  'depth_soundings', 'practical', 'faq', 'gallery', 'credits'
];

// =============================================================================
// LOGBOOK STANDARDS (v2.300)
// =============================================================================

// Forbidden brochure/sales patterns
const FORBIDDEN_PATTERNS = [
  /you'll love/i,
  /perfect for/i,
  /ideal choice/i,
  /value[- ]packed/i,
  /bucket[- ]list/i,
  /must[- ]do/i,
  /must[- ]see/i,
  /\bdeliver[s]?\b.*innovation/i,
  /see our .* guide/i,
  /check our .* calculator/i,
  /read our .* series/i,
  /choosing .* wisely/i
];

// Emotional pivot indicators (tear-jerker moments)
const EMOTIONAL_PIVOT_MARKERS = [
  /tears?\b/i,
  /crying\b/i,
  /wept\b/i,
  /choked up/i,
  /eyes (welled|watered|filled)/i,
  /heart (ached|swelled|broke|leapt)/i,
  /breath caught/i,
  /couldn't speak/i,
  /moment of silence/i,
  /whispered/i,
  /quiet (grace|moment|pause)/i,
  /hand (reached|squeezed|held)/i,
  /finally (said|spoke|understood|saw)/i,
  /for the first time in/i,
  /something (shifted|changed|broke open)/i,
  /healing\b/i,
  /reconcil/i,
  /forgive/i,
  /prayer/i,
  /thank (god|you|him|her)/i
];

// Sensory detail markers
const SENSORY_MARKERS = {
  visual: /\b(saw|watched|looked|gazed|glimpsed|noticed|spotted|observed|stared|glanced)\b/i,
  auditory: /\b(heard|listened|sound|noise|silence|quiet|whisper|roar|crash|ring|echo)\b/i,
  tactile: /\b(felt|touched|cold|warm|hot|cool|breeze|wind|rough|smooth|soft|hard)\b/i,
  olfactory: /\b(smell|scent|aroma|fragrance|whiff|odor|stench)\b/i,
  gustatory: /\b(taste|tasted|flavor|sweet|salty|bitter|sour|savory|delicious)\b/i
};

// Contrast/tension words for honest assessments
const CONTRAST_WORDS = /\b(but|however|though|despite|although|yet|nevertheless|still|even so|on the other hand)\b/gi;

// First-person pronouns
const FIRST_PERSON_PRONOUNS = /\b(I|my|me|we|our|us|myself|ourselves)\b/gi;

// Lesson/reflection markers
const LESSON_MARKERS = [
  /the lesson:/i,
  /what .* taught me/i,
  /I (learned|realized|understood|discovered)/i,
  /looking back/i,
  /in retrospect/i,
  /the (real|true) (gift|lesson|meaning)/i,
  /sometimes you/i,
  /what matters (is|was)/i
];

// Spiritual/aspirational markers
const SPIRITUAL_MARKERS = [
  /\bgod\b/i,
  /\bprayer\b/i,
  /\bverse\b/i,
  /\bscripture\b/i,
  /\bblessing\b/i,
  /\bgrace\b/i,
  /\bfaith\b/i,
  /\bholy\b/i,
  /\bsoul\b/i,
  /\bspirit\b/i,
  /\bcreation\b/i,
  /\bawe\b/i,
  /\bwonder\b/i,
  /\bhealing\b/i,
  /\bhope\b/i,
  /\bcourage\b/i
];

// =============================================================================
// CONTENT PURITY RULES (HARD BANS)
// =============================================================================

// Forbidden content patterns (sin tourism, profanity, etc.)
const CONTENT_PURITY_BANS = [
  // Drinking/partying
  { pattern: /\b(bar hop|bar-hop|pub crawl|pub-crawl)\b/i, category: 'drinking' },
  { pattern: /\b(nightlife|night life|nightclub|night club)\b/i, category: 'nightlife' },
  { pattern: /\b(let loose|go wild|get wild|cut loose)\b/i, category: 'partying' },
  { pattern: /\b(happy hour|cocktail hour|wine tasting|beer flight)\b/i, category: 'drinking' },
  { pattern: /\b(get drunk|getting drunk|wasted|hammered|tipsy)\b/i, category: 'drinking' },

  // Gambling
  { pattern: /\bcasino\b/i, category: 'gambling' },
  { pattern: /\b(gambling|gamble|betting|bet on)\b/i, category: 'gambling' },
  { pattern: /\b(try your luck|slots|poker|blackjack|roulette)\b/i, category: 'gambling' },

  // Profanity (common mild and strong)
  { pattern: /\b(damn|hell|crap|ass)\b/i, category: 'profanity' },
  { pattern: /\b(wtf|omg|lmao|lmfao)\b/i, category: 'slang' },

  // Travel idolatry / hype language
  { pattern: /\b(bucket[ -]?list|once[- ]in[- ]a[- ]lifetime)\b/i, category: 'hype' },
  { pattern: /\b(life[- ]?changing|transformative experience)\b/i, category: 'hype' },
  { pattern: /\b(YOLO|living my best life)\b/i, category: 'hype' }
];

// Per-port allowlist for legitimate place names, landmarks, and metaphors
// that trigger content purity bans but are factually correct.
const CONTENT_PURITY_ALLOWLIST = {
  // Place names containing "Hell"
  'rotorua':          [{ match: /hell'?s?\s*gate/i, category: 'profanity' }],
  'tauranga':         [
    { match: /hell'?s?\s*gate/i, category: 'profanity' },
    { match: /don'?t\s+gamble\s+on/i, category: 'gambling' },
    { match: /(entry|time|mud\s+bath)\s+slots?/i, category: 'gambling' },
  ],
  'grand-cayman':     [{ match: /\bhell\b/i, category: 'profanity' }],
  'nosy-be':          [{ match: /hell-ville/i, category: 'profanity' }],
  // Place names containing "Casino"
  'monte-carlo':      [{ match: /casino\s*(de\s*)?monte[- ]carlo/i, category: 'gambling' }],
  'monaco':           [{ match: /casino\s*(de\s*)?monte[- ]carlo/i, category: 'gambling' }],
  'cannes':           [{ match: /casino\s*(de\s*)?monte[- ]carlo/i, category: 'gambling' }],
  'port-elizabeth':   [{ match: /boardwalk\s+casino/i, category: 'gambling' }],
  // Metaphorical uses — literary language, not gambling promotion
  'cape-horn':        [{ match: /betting\s+everything\s+on\s+hope/i, category: 'gambling' }],
  'ellis-island':     [{ match: /betting\s+everything\s+on\s+hope/i, category: 'gambling' }],
  'ravenna':          [{ match: /this\s+a\s+gamble/i, category: 'gambling' }],
  // Metalworking terminology — "hammered" as a craft technique
  '*': [
    { match: /hammered\s+(pewter|bronze|silver|copper|brass|iron|gold|metal|tin)/i, category: 'drinking' },
    { match: /nothing\s+wasted/i, category: 'drinking' },
    // "slots" as time slots / booking slots (not slot machines)
    { match: /slots?\s+(fill|sell|can\s+sell|book|avail|open|remain)/i, category: 'gambling' },
    { match: /(time|booking|entry|timed|walk-in|club|castle|beach)\s+slots?/i, category: 'gambling' },
    // Figurative "gamble" = risk
    { match: /\b(a|this|make\s+this)\s+a\s+gamble\b/i, category: 'gambling' },
    { match: /don'?t\s+gamble\s+on/i, category: 'gambling' },
  ],
};

// Stewardship framing positive markers
const STEWARDSHIP_MARKERS = [
  /\bworth\b/i,
  /\bvalue\b/i,
  /\bplan(ning)?\b/i,
  /\bbudget\b/i,
  /\bsave\b/i,
  /\bsteward/i,
  /\bgratitude\b/i,
  /\bgrateful\b/i,
  /\bthankful\b/i,
  /\bgift\b/i,
  /\bentrust/i
];

// Stamina/accessibility level markers
const STAMINA_LEVEL_MARKERS = [
  /low[- ]walking/i,
  /minimal walking/i,
  /moderate (walking|activity)/i,
  /high[- ]energy/i,
  /strenuous/i,
  /mobility/i,
  /wheelchair/i,
  /accessible/i
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Count words in text content
 */
function countWords(text) {
  if (!text) return 0;
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 0).length;
}

/**
 * Find section content by pattern
 */
function findSectionContent($, pattern) {
  let sectionContent = '';
  const matchedElems = new Set();

  // Method 1: Match by heading text (h2/h3)
  $('h2, h3').each((i, elem) => {
    const $elem = $(elem);
    if (pattern.test($elem.text())) {
      const $section = $elem.closest('section, details, .card');
      if ($section.length) {
        const node = $section.get(0);
        if (!matchedElems.has(node)) {
          matchedElems.add(node);
          // Also mark all ancestor sections to prevent double-counting
          $section.parents('section[id], details[id]').each((j, p) => matchedElems.add(p));
          sectionContent += $section.text() + ' ';
        }
      } else {
        let $next = $elem.next();
        while ($next.length && !$next.is('h2')) {
          sectionContent += $next.text() + ' ';
          $next = $next.next();
        }
      }
    }
  });

  // Method 2: Match by section/details id attribute (fallback for sections with non-matching headings)
  if (!sectionContent.trim()) {
    $('section[id], details[id]').each((i, elem) => {
      const $elem = $(elem);
      const id = $elem.attr('id') || '';
      if (pattern.test(id) && !matchedElems.has(elem)) {
        matchedElems.add(elem);
        sectionContent += $elem.text() + ' ';
      }
    });
  }

  return sectionContent;
}

/**
 * Count regex matches in text
 */
function countMatches(text, regex) {
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

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
 * Validate site integration - port must be listed and searchable
 * Checks:
 * 1. Port is listed in ports.html (has a navigation link)
 * 2. Port is in search-index.json (searchable)
 */
async function validateSiteIntegration(filepath) {
  const errors = [];
  const warnings = [];

  // Get filename to construct expected URL
  const filename = filepath.split('/').pop();
  const expectedUrl = `/ports/${filename}`;

  // Load site integration data (cached)
  const { portsHtmlLinks, searchIndexUrls } = await loadSiteIntegrationData();

  // Check if port is listed in ports.html
  if (!portsHtmlLinks.has(expectedUrl)) {
    errors.push({
      section: 'site_integration',
      rule: 'not_in_ports_html',
      message: `Port page is not linked in ports.html. Add navigation link to ${expectedUrl}`,
      severity: 'BLOCKING'
    });
  }

  // Check if port is in search-index.json
  if (!searchIndexUrls.has(expectedUrl)) {
    errors.push({
      section: 'site_integration',
      rule: 'not_in_search_index',
      message: `Port page is not in search-index.json. Add entry for ${expectedUrl} to be searchable`,
      severity: 'BLOCKING'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    data: {
      inPortsHtml: portsHtmlLinks.has(expectedUrl),
      inSearchIndex: searchIndexUrls.has(expectedUrl)
    }
  };
}

/**
 * Validate ICP-Lite v1.4 compliance
 */
function validateICPLite($, html) {
  const errors = [];
  const warnings = [];
  const info = [];

  // ==========================================================================
  // ICP-2 v2.1 — Human-First SEO & AEO Validation
  // Upgraded from ICP-Lite v1.4. Accepts both protocol versions during migration.
  // ==========================================================================

  const aiSummary = $('meta[name="ai-summary"]').attr('content') || '';
  const lastReviewed = $('meta[name="last-reviewed"]').attr('content') || '';
  const description = $('meta[name="description"]').attr('content') || '';
  const protocol = $('meta[name="content-protocol"]').attr('content') || '';

  // --- Protocol version (accept both during migration) ---
  const ACCEPTED_PROTOCOLS = ['ICP-Lite v1.4', 'ICP-2', 'ICP-2 v2.1'];
  if (!ACCEPTED_PROTOCOLS.includes(protocol)) {
    errors.push({
      section: 'icp',
      rule: 'protocol_version',
      message: `Invalid content-protocol. Expected one of: ${ACCEPTED_PROTOCOLS.join(', ')}. Found "${protocol}"`,
      severity: 'BLOCKING'
    });
  }

  // --- ai-summary meta tag ---
  if (!aiSummary) {
    errors.push({
      section: 'icp',
      rule: 'ai_summary_missing',
      message: 'ai-summary meta tag is missing or empty',
      severity: 'BLOCKING'
    });
  } else if (aiSummary.length > 250) {
    errors.push({
      section: 'icp',
      rule: 'ai_summary_length',
      message: `ai-summary exceeds 250 characters (${aiSummary.length} chars)`,
      severity: 'BLOCKING'
    });
  } else if (aiSummary.length < 150) {
    warnings.push({
      section: 'icp',
      rule: 'ai_summary_length',
      message: `ai-summary is short (${aiSummary.length} chars), recommended 150-250`,
      severity: 'WARNING'
    });
  }

  // --- description meta tag (ICP-2 v2.1: required) ---
  if (!description) {
    errors.push({
      section: 'icp',
      rule: 'description_missing',
      message: 'meta description tag is missing or empty',
      severity: 'BLOCKING'
    });
  }

  // --- last-reviewed meta tag ---
  if (!lastReviewed) {
    errors.push({
      section: 'icp',
      rule: 'last_reviewed_missing',
      message: 'last-reviewed meta tag is missing',
      severity: 'BLOCKING'
    });
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(lastReviewed)) {
    errors.push({
      section: 'icp',
      rule: 'last_reviewed_format',
      message: `last-reviewed must be YYYY-MM-DD format, found "${lastReviewed}"`,
      severity: 'BLOCKING'
    });
  } else {
    // Staleness detection
    const reviewed = new Date(lastReviewed);
    const daysDiff = (new Date() - reviewed) / (1000 * 60 * 60 * 24);
    if (daysDiff > 180) {
      warnings.push({
        section: 'icp',
        rule: 'stale_review',
        message: `last-reviewed date is ${Math.floor(daysDiff)} days old (${lastReviewed}) — content may be stale`,
        severity: 'WARNING'
      });
    }
  }

  // --- Canonical URL (ICP-2 v2.1: required) ---
  const canonical = $('link[rel="canonical"]').attr('href') || '';
  if (!canonical) {
    errors.push({
      section: 'icp',
      rule: 'missing_canonical',
      message: 'Missing <link rel="canonical"> — required for SEO',
      severity: 'BLOCKING'
    });
  }

  // --- Anti-patterns (ICP-2 v2.1: forbidden SEO/AEO theater) ---
  if ($('meta[name="keywords"]').length > 0) {
    warnings.push({
      section: 'icp',
      rule: 'forbidden_meta_keywords',
      message: 'meta keywords tag is SEO theater — remove it (dead since 2009)',
      severity: 'WARNING'
    });
  }
  if ($('meta[name="geo.region"]').length > 0 || $('meta[name="geo.placename"]').length > 0) {
    warnings.push({
      section: 'icp',
      rule: 'forbidden_geo_meta',
      message: 'geo.region/geo.placename meta tags are irrelevant — remove them',
      severity: 'WARNING'
    });
  }
  if (html.includes('ai-breadcrumbs')) {
    warnings.push({
      section: 'icp',
      rule: 'forbidden_ai_breadcrumbs',
      message: 'ai-breadcrumbs HTML comments are not read by any crawler — remove them',
      severity: 'WARNING'
    });
  }

  // --- JSON-LD structured data ---
  const jsonldScripts = $('script[type="application/ld+json"]');
  let hasPageSchema = false;  // WebPage or TouristDestination
  let hasFAQPage = false;
  let hasBreadcrumbs = false;
  let schemaDateModified = '';
  let schemaDescription = '';
  let hasMainEntity = false;
  let schemaType = '';

  jsonldScripts.each((i, elem) => {
    try {
      const content = $(elem).html();
      const data = JSON.parse(content);

      // Accept WebPage or TouristDestination (ICP-2 prefers specific types)
      if (data['@type'] === 'WebPage' || data['@type'] === 'TouristDestination') {
        hasPageSchema = true;
        schemaType = data['@type'];
        schemaDateModified = data.dateModified || '';
        schemaDescription = data.description || '';
        hasMainEntity = !!data.mainEntity;
      }
      if (data['@type'] === 'FAQPage') {
        hasFAQPage = true;
        // FAQPage with mainEntity also counts
        if (data.mainEntity) hasMainEntity = true;
      }
      if (data['@type'] === 'BreadcrumbList') {
        hasBreadcrumbs = true;
      }
    } catch (e) {
      errors.push({
        section: 'icp',
        rule: 'jsonld_parse',
        message: `Failed to parse JSON-LD script: ${e.message}`,
        severity: 'BLOCKING'
      });
    }
  });

  if (!hasPageSchema) {
    errors.push({
      section: 'icp',
      rule: 'missing_webpage',
      message: 'Missing WebPage or TouristDestination JSON-LD schema',
      severity: 'BLOCKING'
    });
  }
  if (!hasFAQPage) {
    errors.push({
      section: 'icp',
      rule: 'missing_faqpage',
      message: 'Missing FAQPage JSON-LD schema',
      severity: 'BLOCKING'
    });
  }
  if (!hasBreadcrumbs) {
    errors.push({
      section: 'icp',
      rule: 'missing_breadcrumbs',
      message: 'Missing BreadcrumbList JSON-LD schema',
      severity: 'BLOCKING'
    });
  }

  if (!hasMainEntity && hasPageSchema) {
    errors.push({
      section: 'icp',
      rule: 'missing_mainentity',
      message: 'Page schema JSON-LD must have mainEntity (Place for ports, FAQPage for FAQ)',
      severity: 'BLOCKING'
    });
  }

  // --- dateModified parity (still exact match per ICP-2 v2.1) ---
  if (hasPageSchema && schemaDateModified !== lastReviewed) {
    errors.push({
      section: 'icp',
      rule: 'datemodified_mismatch',
      message: `Schema dateModified (${schemaDateModified}) must match last-reviewed (${lastReviewed})`,
      severity: 'BLOCKING'
    });
  }

  // --- Description consistency (ICP-2 v2.1: relaxed from exact-match) ---
  // JSON-LD description must be "consistent with" ai-summary — same key facts,
  // not necessarily character-identical. We check that they share significant words.
  if (hasPageSchema && aiSummary && schemaDescription) {
    const summaryWords = new Set(aiSummary.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3));
    const descWords = new Set(schemaDescription.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3));
    // Count overlapping significant words
    let overlap = 0;
    for (const w of summaryWords) { if (descWords.has(w)) overlap++; }
    const overlapRatio = summaryWords.size > 0 ? overlap / summaryWords.size : 0;
    if (overlapRatio < 0.3) {
      errors.push({
        section: 'icp',
        rule: 'description_mismatch',
        message: `JSON-LD description has low consistency with ai-summary (${Math.round(overlapRatio * 100)}% word overlap). Must convey same key facts.`,
        severity: 'BLOCKING'
      });
    }
  } else if (hasPageSchema && aiSummary && !schemaDescription) {
    errors.push({
      section: 'icp',
      rule: 'description_mismatch',
      message: 'JSON-LD schema is missing description field',
      severity: 'BLOCKING'
    });
  }

  // --- Answer-first body structure (ICP-2 v2.1) ---
  // First paragraph in main content should directly address what this port is
  const firstParagraph = $('main article p, main p').first().text().trim();
  if (firstParagraph && firstParagraph.length < 20) {
    info.push({
      section: 'icp',
      rule: 'answer_first_weak',
      message: 'First paragraph is very short — consider leading with a direct answer about this port',
      severity: 'INFO'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
    data: {
      protocol_version: protocol,
      schema_type: schemaType,
      ai_summary_length: aiSummary.length,
      last_reviewed: lastReviewed,
      has_canonical: !!canonical,
      has_mainEntity: hasMainEntity
    }
  };
}

/**
 * Validate section ordering (ITC v1.1)
 */
function validateSectionOrder($) {
  const errors = [];
  const warnings = [];
  const detectedSections = [];

  // Check hero box requirements
  const heroSection = $('section.port-hero, #hero, .port-hero');
  if (heroSection.length > 0) {
    const heroInMain = heroSection.closest('main, article, .card');
    const heroIsFirstBodyChild = heroSection.parent().is('body') ||
      (heroSection.prevAll('header, main, nav').length === 0 && heroSection.parent().is('body'));

    if (!heroInMain.length || heroIsFirstBodyChild) {
      errors.push({
        section: 'hero',
        rule: 'hero_wrong_position',
        message: 'Hero section must be inside main content area (article/card), not at top of body before header',
        severity: 'BLOCKING'
      });
    }

    const heroImg = heroSection.find('img').first();
    if (!heroImg.length) {
      errors.push({
        section: 'hero',
        rule: 'hero_missing_image',
        message: 'Hero box must contain an image',
        severity: 'BLOCKING'
      });
    } else {
      const imgSrc = heroImg.attr('src') || '';
      if (!imgSrc.endsWith('.webp')) {
        errors.push({
          section: 'hero',
          rule: 'hero_not_webp',
          message: 'Hero image must be in webp format',
          severity: 'BLOCKING'
        });
      }
    }

    const portNameOverlay = heroSection.find('.port-hero-overlay, .port-name-overlay, h1');
    if (!portNameOverlay.length) {
      errors.push({
        section: 'hero',
        rule: 'hero_missing_overlay',
        message: 'Hero box must contain port name overlay (h1 or .port-hero-overlay)',
        severity: 'BLOCKING'
      });
    }

    // Accept credits from multiple free image sources and project photography
    const creditLink = heroSection.find(`
      a[href*="commons.wikimedia.org"],
      a[href*="wikimedia"],
      a[href*="unsplash.com"],
      a[href*="pexels.com"],
      a[href*="pixabay.com"],
      a[href*="flickr.com"],
      a[href*="flickersofmajesty.com"]
    `.replace(/\s+/g, ''));
    if (!creditLink.length) {
      errors.push({
        section: 'hero',
        rule: 'hero_missing_image_credit',
        message: 'Hero image must include credit link (Wikimedia, Unsplash, Pexels, Pixabay, or Flickr)',
        severity: 'BLOCKING'
      });
    }
  } else {
    errors.push({
      section: 'hero',
      rule: 'hero_missing',
      message: 'Page must have a hero box section with class "port-hero"',
      severity: 'BLOCKING'
    });
  }

  // Detect sections by scanning headings and IDs
  // For headings (h2/h3), use text content; for sections/divs, only use id/class
  // to avoid false positives from body text matching section patterns
  $('main h2, main h3, main section, main div[id], main div[class*="section"]').each((i, elem) => {
    const $elem = $(elem);
    const tagName = (elem.tagName || elem.name || '').toLowerCase();
    const isHeading = tagName === 'h2' || tagName === 'h3';
    let text = '';
    if (isHeading) {
      const $clone = $elem.clone();
      $clone.find('noscript').remove();
      text = $clone.text().toLowerCase();
    }
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

  const missingSections = REQUIRED_SECTIONS.filter(s => !detectedSections.includes(s));
  if (missingSections.length > 0) {
    errors.push({
      section: 'section_order',
      rule: 'missing_required_sections',
      message: `Missing required sections: ${missingSections.join(', ')}`,
      severity: 'BLOCKING'
    });
  }

  const detectedIndexes = detectedSections.map(s => EXPECTED_MAIN_ORDER.indexOf(s));
  const outOfOrder = [];

  for (let i = 1; i < detectedIndexes.length; i++) {
    if (detectedIndexes[i] !== -1 && detectedIndexes[i-1] !== -1) {
      if (detectedIndexes[i] < detectedIndexes[i-1]) {
        outOfOrder.push(detectedSections[i]);
      }
    }
  }

  if (outOfOrder.length > 0) {
    errors.push({
      section: 'section_order',
      rule: 'out_of_order',
      message: `Sections out of order: ${outOfOrder.join(', ')}`,
      severity: 'BLOCKING'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    detected_order: detectedSections,
    expected_order: EXPECTED_MAIN_ORDER,
    missing_sections: missingSections,
    out_of_order_sections: outOfOrder
  };
}

/**
 * Validate word counts (ITC v1.1)
 */
function validateWordCounts($) {
  const errors = [];
  const warnings = [];

  const logbookText = findSectionContent($, SECTION_PATTERNS.logbook);
  const logbookWords = countWords(logbookText);
  if (logbookWords < 800) {
    errors.push({
      section: 'word_counts',
      rule: 'logbook_minimum',
      message: `Logbook entry has ${logbookWords} words, minimum is 800`,
      severity: 'BLOCKING'
    });
  } else if (logbookWords > 2500) {
    warnings.push({
      section: 'word_counts',
      rule: 'logbook_maximum',
      message: `Logbook entry has ${logbookWords} words, maximum recommended is 2500`,
      severity: 'WARNING'
    });
  }

  const portText = findSectionContent($, SECTION_PATTERNS.cruise_port);
  const portWords = countWords(portText);
  if (portWords < 100) {
    errors.push({
      section: 'word_counts',
      rule: 'cruise_port_minimum',
      message: `Cruise port section has ${portWords} words, minimum is 100`,
      severity: 'BLOCKING'
    });
  }

  const gettingAroundText = findSectionContent($, SECTION_PATTERNS.getting_around);
  const gettingAroundWords = countWords(gettingAroundText);
  if (gettingAroundWords < 200) {
    errors.push({
      section: 'word_counts',
      rule: 'getting_around_minimum',
      message: `Getting Around section has ${gettingAroundWords} words, minimum is 200`,
      severity: 'BLOCKING'
    });
  }

  const excursionsText = findSectionContent($, SECTION_PATTERNS.excursions);
  const excursionsWords = countWords(excursionsText);
  if (excursionsWords < 400) {
    errors.push({
      section: 'word_counts',
      rule: 'excursions_minimum',
      message: `Excursions section has ${excursionsWords} words, minimum is 400`,
      severity: 'BLOCKING'
    });
  }

  const depthText = findSectionContent($, SECTION_PATTERNS.depth_soundings);
  const depthWords = countWords(depthText);
  if (depthWords < 150) {
    errors.push({
      section: 'word_counts',
      rule: 'depth_soundings_minimum',
      message: `Depth Soundings section has ${depthWords} words, minimum is 150`,
      severity: 'BLOCKING'
    });
  }

  const faqText = findSectionContent($, SECTION_PATTERNS.faq);
  const faqWords = countWords(faqText);
  if (faqWords < 200) {
    errors.push({
      section: 'word_counts',
      rule: 'faq_minimum',
      message: `FAQ section has ${faqWords} words, minimum is 200`,
      severity: 'BLOCKING'
    });
  }

  const totalText = $('body').text();
  const totalWords = countWords(totalText);
  if (totalWords < 2000) {
    errors.push({
      section: 'word_counts',
      rule: 'total_minimum',
      message: `Total page has ${totalWords} words, minimum is 2000`,
      severity: 'BLOCKING'
    });
  } else if (totalWords > 6000) {
    warnings.push({
      section: 'word_counts',
      rule: 'total_maximum',
      message: `Total page has ${totalWords} words, maximum recommended is 6000`,
      severity: 'WARNING'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    counts: {
      logbook: logbookWords,
      cruise_port: portWords,
      getting_around: gettingAroundWords,
      excursions: excursionsWords,
      depth_soundings: depthWords,
      faq: faqWords,
      total: totalWords
    }
  };
}

/**
 * Validate image requirements (ITC v1.1)
 */
function validateImages($) {
  const errors = [];
  const warnings = [];

  const allImages = $('img');
  const imageCount = allImages.length;

  if (imageCount < 11) {
    errors.push({
      section: 'images',
      rule: 'minimum_images',
      message: `Page has ${imageCount} images, minimum is 11`,
      severity: 'BLOCKING'
    });
  }

  if (imageCount > 25) {
    warnings.push({
      section: 'images',
      rule: 'maximum_images',
      message: `Page has ${imageCount} images, recommended maximum is 25`,
      severity: 'WARNING'
    });
  }

  const heroImg = $('img[loading="eager"], img[fetchpriority="high"]').first();
  if (!heroImg.length) {
    errors.push({
      section: 'images',
      rule: 'hero_image_loading',
      message: 'Hero image must have loading="eager" and fetchpriority="high"',
      severity: 'BLOCKING'
    });
  }

  let lazyLoadViolations = 0;
  allImages.each((i, elem) => {
    const $img = $(elem);
    const loading = $img.attr('loading');
    const fetchpriority = $img.attr('fetchpriority');

    if (fetchpriority === 'high' || loading === 'eager') return;

    if (loading !== 'lazy') {
      lazyLoadViolations++;
    }
  });

  if (lazyLoadViolations > 0) {
    errors.push({
      section: 'images',
      rule: 'lazy_loading',
      message: `${lazyLoadViolations} non-hero images missing loading="lazy"`,
      severity: 'BLOCKING'
    });
  }

  let missingAlt = 0;
  let shortAlt = 0;
  allImages.each((i, elem) => {
    const $img = $(elem);
    if ($img.attr('aria-hidden') === 'true' || $img.attr('role') === 'presentation') {
      return;
    }
    const alt = $img.attr('alt') || '';
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

  const figures = $('figure');
  let missingCredits = 0;

  figures.each((i, elem) => {
    const $figure = $(elem);
    const $caption = $figure.find('figcaption');
    if (!$caption.length || !$caption.find('a').length) {
      missingCredits++;
    }
  });

  if (missingCredits > 0) {
    errors.push({
      section: 'images',
      rule: 'missing_credits',
      message: `${missingCredits} images missing photo credits in figcaption`,
      severity: 'BLOCKING'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    counts: {
      total_images: imageCount,
      missing_alt: missingAlt,
      missing_credits: missingCredits
    }
  };
}

/**
 * Validate port-specific images (each port must have unique images, not placeholders)
 */
async function validatePortImages(filepath) {
  const errors = [];
  const warnings = [];

  // Extract port slug from filename (e.g., barcelona.html -> barcelona)
  const filename = basename(filepath, '.html');
  const portImgDir = join(PROJECT_ROOT, 'ports', 'img', filename);

  // Check if port has its own image directory
  if (!existsSync(portImgDir)) {
    errors.push({
      section: 'port_images',
      rule: 'missing_port_img_directory',
      message: `Port image directory not found: ports/img/${filename}/`,
      severity: 'BLOCKING'
    });
    return { valid: false, errors, warnings, data: {} };
  }

  // Scan images in port directory
  let imageFiles = [];
  try {
    const files = await readdir(portImgDir);
    imageFiles = files.filter(f => f.endsWith('.webp') || f.endsWith('.jpg') || f.endsWith('.png'));
  } catch (e) {
    errors.push({
      section: 'port_images',
      rule: 'port_img_read_error',
      message: `Could not read port image directory: ${e.message}`,
      severity: 'BLOCKING'
    });
    return { valid: false, errors, warnings, data: {} };
  }

  if (imageFiles.length === 0) {
    errors.push({
      section: 'port_images',
      rule: 'no_port_images',
      message: `No images found in ports/img/${filename}/`,
      severity: 'BLOCKING'
    });
    return { valid: false, errors, warnings, data: {} };
  }

  // Check each image for placeholder hash and cross-port contamination
  let placeholderCount = 0;
  const placeholderImages = [];
  let crossPortCount = 0;
  const crossPortImages = [];
  let allowedDupeCount = 0;
  const allowedDupeImages = [];

  // Build dynamic cross-port hash map (cached after first call)
  const crossPortMap = await buildCrossPortHashMap();
  const allowedMap = loadAllowedDuplicates();

  for (const imgFile of imageFiles) {
    const imgPath = join(portImgDir, imgFile);
    try {
      const imgBuffer = readFileSync(imgPath);
      const hash = createHash('md5').update(imgBuffer).digest('hex');

      if (PLACEHOLDER_HASHES.has(hash)) {
        placeholderCount++;
        placeholderImages.push(imgFile);
      }

      // Check if this image hash appears in other port directories
      const dupePortMap = crossPortMap.get(hash);
      if (dupePortMap) {
        const otherPorts = [...dupePortMap.keys()].filter(p => p !== filename);
        if (otherPorts.length > 0) {
          const approvedPort = allowedMap.get(hash);
          if (approvedPort === filename) {
            // This port is the approved owner — downgrade to info
            allowedDupeCount++;
            allowedDupeImages.push(`${imgFile} (approved owner; also in ${otherPorts.join(', ')})`);
          } else if (approvedPort && approvedPort !== filename) {
            // Reviewed but belongs to a DIFFERENT port — BLOCKING (wrong port)
            crossPortCount++;
            crossPortImages.push(`${imgFile} (belongs to ${approvedPort}, not this port; also in ${otherPorts.join(', ')})`);
          } else {
            // Unreviewed — BLOCKING
            crossPortCount++;
            crossPortImages.push(`${imgFile} (also in ${otherPorts.join(', ')})`);
          }
        }
      }
    } catch (e) {
      // Skip files that can't be read
    }
  }

  if (placeholderCount > 0) {
    errors.push({
      section: 'port_images',
      rule: 'placeholder_images_detected',
      message: `${placeholderCount} placeholder image(s) detected in ports/img/${filename}/: ${placeholderImages.slice(0, 3).join(', ')}${placeholderCount > 3 ? '...' : ''}. Each port must have unique, port-specific images.`,
      severity: 'BLOCKING'
    });
  }

  if (crossPortCount > 0) {
    errors.push({
      section: 'port_images',
      rule: 'cross_port_images_detected',
      message: `${crossPortCount} image(s) duplicated across ports in ports/img/${filename}/: ${crossPortImages.slice(0, 3).join(', ')}${crossPortCount > 3 ? ` and ${crossPortCount - 3} more` : ''}. Each port must have unique images — duplicates require human review. To approve, add hash to admin/cross-port-image-allowlist.json.`,
      severity: 'BLOCKING'
    });
  }

  if (allowedDupeCount > 0) {
    warnings.push({
      section: 'port_images',
      rule: 'allowed_cross_port_images',
      message: `${allowedDupeCount} image(s) shared with other ports (human-reviewed, approved): ${allowedDupeImages.slice(0, 3).join(', ')}${allowedDupeCount > 3 ? ` and ${allowedDupeCount - 3} more` : ''}.`,
      severity: 'INFO'
    });
  }

  // Check for missing attribution files (every non-hero image should have provenance)
  const webpImages = imageFiles.filter(f => f.endsWith('.webp'));
  let missingAttrCount = 0;
  const missingAttrImages = [];

  for (const imgFile of webpImages) {
    // Check for attr.json in both naming conventions: name-attr.json and name.webp.attr.json
    const baseName = imgFile.replace(/\.webp$/, '');
    const attrPath1 = join(portImgDir, `${baseName}-attr.json`);
    const attrPath2 = join(portImgDir, `${imgFile}.attr.json`);

    if (!existsSync(attrPath1) && !existsSync(attrPath2)) {
      missingAttrCount++;
      missingAttrImages.push(imgFile);
    }
  }

  if (missingAttrCount > 0) {
    const severity = missingAttrCount > Math.ceil(webpImages.length / 2) ? 'BLOCKING' : 'WARNING';
    const msg = `${missingAttrCount} image(s) missing attribution files (-attr.json): ${missingAttrImages.slice(0, 3).join(', ')}${missingAttrCount > 3 ? ` and ${missingAttrCount - 3} more` : ''}. Every port image needs documented provenance.`;
    if (severity === 'BLOCKING') {
      errors.push({ section: 'port_images', rule: 'missing_attribution_files', message: msg, severity });
    } else {
      warnings.push({ section: 'port_images', rule: 'missing_attribution_files', message: msg, severity });
    }
  }

  // Check for images with identical file sizes (potential duplicates)
  const sizeGroups = {};
  for (const imgFile of imageFiles) {
    const imgPath = join(portImgDir, imgFile);
    try {
      const stats = await stat(imgPath);
      const size = stats.size;
      if (!sizeGroups[size]) sizeGroups[size] = [];
      sizeGroups[size].push(imgFile);
    } catch (e) {
      // Skip files that can't be read
    }
  }

  // Find groups of images with same size (potential duplicates)
  const duplicateSizeGroups = Object.entries(sizeGroups)
    .filter(([size, files]) => files.length > 2)  // More than 2 files with same size is suspicious
    .map(([size, files]) => files);

  if (duplicateSizeGroups.length > 0) {
    const totalSuspicious = duplicateSizeGroups.reduce((acc, g) => acc + g.length, 0);
    warnings.push({
      section: 'port_images',
      rule: 'potential_duplicate_images',
      message: `${totalSuspicious} images have identical file sizes, may be duplicates/placeholders`,
      severity: 'WARNING'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    data: {
      total_port_images: imageFiles.length,
      placeholder_images: placeholderCount,
      potential_duplicates: duplicateSizeGroups.length > 0
    }
  };
}

/**
 * Validate rubric compliance (Four Pillars - ITC v1.1)
 */
function validateRubric($) {
  const errors = [];
  const warnings = [];
  const info = [];

  const logbookText = findSectionContent($, SECTION_PATTERNS.logbook);
  const firstPersonCount = countMatches(logbookText, FIRST_PERSON_PRONOUNS);

  if (firstPersonCount < 10) {
    errors.push({
      section: 'rubric',
      rule: 'first_person_voice',
      message: `Logbook has ${firstPersonCount} first-person pronouns, minimum is 10`,
      severity: 'BLOCKING'
    });
  }

  const contrastCount = countMatches(logbookText, CONTRAST_WORDS);

  if (contrastCount < 3) {
    warnings.push({
      section: 'rubric',
      rule: 'contrast_language',
      message: `Logbook has ${contrastCount} contrast words, recommended minimum is 3`,
      severity: 'WARNING'
    });
  }

  const fullText = $('body').text().toLowerCase();
  const accessibilityKeywords = ['wheelchair', 'mobility', 'accessible', 'tender', 'walking difficulty'];
  const accessibilityMentions = accessibilityKeywords.filter(kw => {
    // Use word-boundary regex to avoid substring false positives
    // e.g., "bartender" matching "tender", "stalking" matching "walking"
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(fullText);
  });

  if (accessibilityMentions.length < 2) {
    errors.push({
      section: 'rubric',
      rule: 'accessibility_notes',
      message: `Only ${accessibilityMentions.length} accessibility keywords found, minimum is 2`,
      severity: 'BLOCKING'
    });
  }

  const priceMatches = fullText.match(/\$[\d,]+(?:\.\d{1,2})?|€[\d,]+(?:\.\d{1,2})?|\b(price|cost|fee|fare)\b/gi) || [];
  const priceMentions = priceMatches.length;

  if (priceMentions < 5) {
    errors.push({
      section: 'rubric',
      rule: 'diy_price_mentions',
      message: `Only ${priceMentions} price mentions found, minimum is 5`,
      severity: 'BLOCKING'
    });
  }

  const excursionsText = findSectionContent($, SECTION_PATTERNS.excursions);
  const bookingKeywords = ['ship excursion', 'independent', 'guaranteed return', 'book ahead'];
  const bookingMentions = bookingKeywords.filter(kw => {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(excursionsText);
  });

  if (bookingMentions.length < 2) {
    errors.push({
      section: 'rubric',
      rule: 'booking_guidance',
      message: `Excursions section missing booking guidance keywords (found ${bookingMentions.length}, need 2+)`,
      severity: 'BLOCKING'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
    data: {
      first_person_count: firstPersonCount,
      contrast_count: contrastCount,
      accessibility_mentions: accessibilityMentions.length,
      price_mentions: priceMentions,
      booking_keywords: bookingMentions.length
    }
  };
}

/**
 * Validate logbook narrative structure (LOGBOOK_ENTRY_STANDARDS v2.300)
 */
function validateLogbookNarrative($) {
  const errors = [];
  const warnings = [];
  const info = [];

  const logbookText = findSectionContent($, SECTION_PATTERNS.logbook);
  const logbookWords = countWords(logbookText);

  // Check for story-first structure (no bullet lists in logbook)
  const logbookSection = $('main').find('h2, h3').filter((i, elem) =>
    SECTION_PATTERNS.logbook.test($(elem).text())
  ).closest('details, section, .card');

  const bulletLists = logbookSection.find('ul, ol');
  if (bulletLists.length > 0) {
    warnings.push({
      section: 'logbook_narrative',
      rule: 'no_bullet_lists',
      message: `Logbook contains ${bulletLists.length} bullet/numbered list(s). Logbook should be narrative prose, not lists.`,
      severity: 'WARNING'
    });
  }

  // Check for forbidden brochure/sales patterns
  const forbiddenMatches = [];
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(logbookText)) {
      const match = logbookText.match(pattern);
      if (match) forbiddenMatches.push(match[0]);
    }
  }

  if (forbiddenMatches.length > 0) {
    errors.push({
      section: 'logbook_narrative',
      rule: 'forbidden_brochure_language',
      message: `Logbook contains forbidden brochure/sales language: "${forbiddenMatches.slice(0, 3).join('", "')}"`,
      severity: 'BLOCKING'
    });
  }

  // Check for emotional pivot (tear-jerker moment)
  let emotionalPivotCount = 0;
  for (const marker of EMOTIONAL_PIVOT_MARKERS) {
    if (marker.test(logbookText)) {
      emotionalPivotCount++;
    }
  }

  if (emotionalPivotCount === 0) {
    errors.push({
      section: 'logbook_narrative',
      rule: 'emotional_pivot_missing',
      message: 'Logbook missing emotional pivot/tear-jerker moment. Every logbook needs one heart-touching moment.',
      severity: 'BLOCKING'
    });
  } else if (emotionalPivotCount < 2) {
    warnings.push({
      section: 'logbook_narrative',
      rule: 'emotional_pivot_weak',
      message: `Logbook has ${emotionalPivotCount} emotional pivot marker(s). Consider strengthening the heart moment.`,
      severity: 'WARNING'
    });
  }

  // Check for first-person voice (15-25 pronouns per LOGBOOK_ENTRY_STANDARDS)
  const firstPersonCount = countMatches(logbookText, FIRST_PERSON_PRONOUNS);
  const pronounsPerHundredWords = (firstPersonCount / logbookWords) * 100;

  if (firstPersonCount < 15) {
    errors.push({
      section: 'logbook_narrative',
      rule: 'first_person_minimum',
      message: `Logbook has ${firstPersonCount} first-person pronouns, minimum for story voice is 15`,
      severity: 'BLOCKING'
    });
  } else if (firstPersonCount > 50) {
    warnings.push({
      section: 'logbook_narrative',
      rule: 'first_person_maximum',
      message: `Logbook has ${firstPersonCount} first-person pronouns, may be overly repetitive`,
      severity: 'WARNING'
    });
  }

  // Check for sensory details (minimum 3 of 5 senses)
  let sensoryCount = 0;
  const sensoryFound = [];
  for (const [sense, pattern] of Object.entries(SENSORY_MARKERS)) {
    if (pattern.test(logbookText)) {
      sensoryCount++;
      sensoryFound.push(sense);
    }
  }

  if (sensoryCount < 3) {
    warnings.push({
      section: 'logbook_narrative',
      rule: 'sensory_detail',
      message: `Logbook uses only ${sensoryCount} of 5 senses (${sensoryFound.join(', ')}). Aim for 3+ for immersive storytelling.`,
      severity: 'WARNING'
    });
  }

  // Check for lesson/reflection
  let hasLesson = false;
  for (const marker of LESSON_MARKERS) {
    if (marker.test(logbookText)) {
      hasLesson = true;
      break;
    }
  }

  if (!hasLesson) {
    errors.push({
      section: 'logbook_narrative',
      rule: 'reflection_missing',
      message: 'Logbook missing reflection/lesson. Every logbook must end with what was learned or gained.',
      severity: 'BLOCKING'
    });
  }

  // Check for contrast words (honest assessment)
  const contrastCount = countMatches(logbookText, CONTRAST_WORDS);
  if (contrastCount < 3) {
    warnings.push({
      section: 'logbook_narrative',
      rule: 'contrast_missing',
      message: `Logbook has ${contrastCount} contrast words ("but", "however", etc.). Honest writing needs tension.`,
      severity: 'WARNING'
    });
  }

  // Check for spiritual/aspirational content (optional but tracked)
  let spiritualCount = 0;
  for (const marker of SPIRITUAL_MARKERS) {
    if (marker.test(logbookText)) {
      spiritualCount++;
    }
  }

  if (spiritualCount > 0) {
    info.push({
      section: 'logbook_narrative',
      rule: 'spiritual_content',
      message: `Logbook includes ${spiritualCount} spiritual/aspirational markers`,
      severity: 'INFO'
    });
  }

  // Check opening hook (first ~50 words should be concrete/scene-setting)
  const firstSentences = logbookText.substring(0, 300);
  const hasConcreteOpening = /\b(I|we|my|the)\s+\w+/i.test(firstSentences) &&
    !/^(this|these|it is|there are)/i.test(firstSentences.trim());

  if (!hasConcreteOpening) {
    warnings.push({
      section: 'logbook_narrative',
      rule: 'opening_hook',
      message: 'Logbook may lack concrete opening. Start with a scene or specific moment, not abstract statements.',
      severity: 'WARNING'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
    data: {
      has_bullet_lists: bulletLists.length > 0,
      forbidden_patterns_found: forbiddenMatches.length,
      emotional_pivot_markers: emotionalPivotCount,
      first_person_pronouns: firstPersonCount,
      pronouns_per_100_words: pronounsPerHundredWords.toFixed(1),
      senses_used: sensoryFound,
      has_reflection: hasLesson,
      contrast_words: contrastCount,
      spiritual_markers: spiritualCount
    }
  };
}

/**
 * Validate content purity (hard bans on sin tourism, profanity, gambling, etc.)
 */
function validateContentPurity($, portSlug) {
  const errors = [];
  const warnings = [];
  const info = [];

  const fullText = $('body').text();
  const violations = [];

  // Build allowlist for this port (port-specific + global '*' entries)
  const portAllowlist = [
    ...(CONTENT_PURITY_ALLOWLIST[portSlug] || []),
    ...(CONTENT_PURITY_ALLOWLIST['*'] || [])
  ];

  // Check for forbidden content
  for (const ban of CONTENT_PURITY_BANS) {
    const matches = fullText.match(ban.pattern);
    if (matches) {
      // Check if this match is allowlisted for this port
      // Test allowlist against FULL TEXT (not just matched word) for context matching
      const allowed = portAllowlist.some(
        a => a.category === ban.category && a.match.test(fullText)
      );
      if (!allowed) {
        violations.push({
          category: ban.category,
          match: matches[0]
        });
      }
    }
  }

  if (violations.length > 0) {
    // Group by category
    const byCategory = {};
    for (const v of violations) {
      if (!byCategory[v.category]) byCategory[v.category] = [];
      byCategory[v.category].push(v.match);
    }

    for (const [category, matches] of Object.entries(byCategory)) {
      errors.push({
        section: 'content_purity',
        rule: `forbidden_${category}`,
        message: `Content contains forbidden ${category} references: "${matches.slice(0, 3).join('", "')}"`,
        severity: 'BLOCKING'
      });
    }
  }

  // Check for stewardship framing (positive markers)
  let stewardshipCount = 0;
  for (const marker of STEWARDSHIP_MARKERS) {
    if (marker.test(fullText)) {
      stewardshipCount++;
    }
  }

  if (stewardshipCount < 3) {
    warnings.push({
      section: 'content_purity',
      rule: 'stewardship_framing',
      message: `Only ${stewardshipCount} stewardship markers found. Consider adding gratitude/value language.`,
      severity: 'WARNING'
    });
  }

  // Check for stamina/accessibility level mentions
  let staminaLevelCount = 0;
  for (const marker of STAMINA_LEVEL_MARKERS) {
    if (marker.test(fullText)) {
      staminaLevelCount++;
    }
  }

  if (staminaLevelCount === 0) {
    warnings.push({
      section: 'content_purity',
      rule: 'stamina_levels',
      message: 'No stamina/accessibility level mentions. Consider adding low/moderate/high-energy options.',
      severity: 'WARNING'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
    data: {
      violations_found: violations.length,
      stewardship_markers: stewardshipCount,
      stamina_level_mentions: staminaLevelCount
    }
  };
}

/**
 * Validate unique persona names (no duplicate names across logbook)
 */
function validateUniqueNames($) {
  const errors = [];
  const warnings = [];

  const logbookText = findSectionContent($, SECTION_PATTERNS.logbook);

  // Extract potential persona names (capitalized names that appear after common patterns)
  const namePatterns = [
    /\b(my (?:wife|husband|daughter|son|friend|mother|father|sister|brother|aunt|uncle|grandfather|grandmother),?\s+)([A-Z][a-z]+)/g,
    /\b([A-Z][a-z]+)\s+(?:said|whispered|smiled|laughed|cried|nodded|asked)/g,
    /\b"([A-Z][a-z]+)(?:,|")/g
  ];

  const namesFound = new Set();
  for (const pattern of namePatterns) {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    while ((match = regex.exec(logbookText)) !== null) {
      const name = match[2] || match[1];
      if (name && name.length > 2 && !/^(The|This|That|And|But|She|He|They|We|It|So|Now|Then)$/.test(name)) {
        namesFound.add(name);
      }
    }
  }

  // Report found names for cross-page verification
  if (namesFound.size > 0) {
    warnings.push({
      section: 'unique_names',
      rule: 'names_detected',
      message: `Detected persona names: ${Array.from(namesFound).join(', ')}. Verify uniqueness across all ports.`,
      severity: 'INFO'
    });
  }

  return {
    valid: true, // Can't verify uniqueness in single-page validation
    errors,
    warnings,
    data: {
      names_found: Array.from(namesFound)
    }
  };
}

/**
 * Validate author experience disclaimer
 */
function validateAuthorDisclaimer($) {
  const errors = [];
  const warnings = [];

  const fullText = $('body').text().toLowerCase();

  // Check for disclaimer patterns
  const disclaimerPatterns = [
    /soundings in another('s|s) wake/i,
    /have not (yet )?visited/i,
    /plan(ning)? to visit/i,
    /based on (research|reviews|sources)/i,
    /firsthand experience/i,
    /visited .* in \d{4}/i
  ];

  let hasDisclaimer = false;
  for (const pattern of disclaimerPatterns) {
    if (pattern.test(fullText)) {
      hasDisclaimer = true;
      break;
    }
  }

  if (!hasDisclaimer) {
    warnings.push({
      section: 'author_disclaimer',
      rule: 'experience_level_missing',
      message: 'No author experience disclaimer found. Add "soundings in another\'s wake" or visited date.',
      severity: 'WARNING'
    });
  }

  return {
    valid: true,
    errors,
    warnings
  };
}

/**
 * Validate "From the Pier" distance component presence
 * Every port page should have a From the Pier section with walking/transport
 * distances from the cruise pier to key destinations.
 */
function validateFromThePier($) {
  const errors = [];
  const warnings = [];

  const fromThePier = $('.from-the-pier, #from-the-pier');

  if (fromThePier.length === 0) {
    warnings.push({
      section: 'from_the_pier',
      rule: 'missing_pier_distances',
      message: 'Missing "From the Pier" distance component. Every port page should include walking/transport times from the cruise pier to key destinations.',
      severity: 'WARNING'
    });
    return { valid: true, errors, warnings, data: { hasComponent: false, destinationCount: 0 } };
  }

  // Check that it has at least 3 destinations
  const destinations = fromThePier.find('.pier-distance-item');
  if (destinations.length < 3) {
    warnings.push({
      section: 'from_the_pier',
      rule: 'insufficient_destinations',
      message: `From the Pier has ${destinations.length} destination(s), recommended minimum is 3`,
      severity: 'WARNING'
    });
  }

  // Check that it has a pier-note
  const pierNote = fromThePier.find('.pier-note');
  if (pierNote.length === 0) {
    warnings.push({
      section: 'from_the_pier',
      rule: 'missing_pier_note',
      message: 'From the Pier section should include a pier-note with context about which pier times are measured from',
      severity: 'WARNING'
    });
  }

  return {
    valid: true,
    errors,
    warnings,
    data: {
      hasComponent: true,
      destinationCount: destinations.length,
      hasPierNote: pierNote.length > 0
    }
  };
}

/**
 * Emotional Hook Test awareness — port feeling target: "Preparation + anxiety reduction"
 * Checks that anxiety-reducing content appears in the upper portion of the page,
 * not buried below specs/data. See .claude/skills/Humanization/emotional-hook-test.md
 */
function validateEmotionalHook($) {
  const warnings = [];

  // Get the first ~30% of main content text (what a reader scans in 30 seconds)
  const mainContent = $('main .col-1, main').first();
  const allText = mainContent.text();
  const upperThird = allText.substring(0, Math.floor(allText.length * 0.33)).toLowerCase();

  // Anxiety-reducing signals: practical orientation content in upper portion
  const anxietyReducers = [
    /from the pier/i,
    /walking|walk time|minutes?.walk/i,
    /tender|shuttle|taxi/i,
    /you('ll| will) (see|find|notice)/i,
    /don.t worry|no need to/i,
    /easy to|straightforward/i,
    /tip:|local tip|insider/i,
  ];

  const foundReducers = anxietyReducers.filter(rx => rx.test(upperThird));

  if (foundReducers.length === 0) {
    warnings.push({
      section: 'emotional_hook',
      rule: 'no_anxiety_reduction_early',
      message: 'No anxiety-reducing content found in the upper third of the page. Port pages should help the reader feel prepared early. Consider adding practical orientation (distances, transport, tips) before detailed content. See emotional-hook-test.md.',
      severity: 'WARNING'
    });
  }

  return { valid: true, errors: [], warnings, data: { anxietyReducersFound: foundReducers.length } };
}

/**
 * Validate HTML structural integrity
 * Catches: mismatched heading tags, inline console.log, missing meta author,
 * stray closing tags for section/details elements
 */
function validateHTMLIntegrity($, html) {
  const errors = [];
  const warnings = [];

  // 1. Check heading tag balance (h1-h6)
  for (let level = 1; level <= 6; level++) {
    const openPattern = new RegExp(`<h${level}[\\s>]`, 'gi');
    const closePattern = new RegExp(`</h${level}>`, 'gi');
    const openCount = (html.match(openPattern) || []).length;
    const closeCount = (html.match(closePattern) || []).length;

    if (openCount !== closeCount) {
      errors.push({
        section: 'html_integrity',
        rule: `heading_h${level}_mismatch`,
        message: `Mismatched <h${level}> tags: ${openCount} opening vs ${closeCount} closing. Check for cross-level nesting (e.g. <h3>...</h2>)`,
        severity: 'BLOCKING'
      });
    }
  }

  // 2. Check for console.log in inline <script> blocks within HTML
  const inlineScriptBlocks = html.match(/<script(?![^>]*src=)[^>]*>[\s\S]*?<\/script>/gi) || [];
  let consoleLogCount = 0;
  for (const block of inlineScriptBlocks) {
    // Skip JSON-LD scripts
    if (block.includes('application/ld+json') || block.includes('application/json')) continue;
    const matches = block.match(/console\.(log|warn|error|debug|info)\s*\(/g) || [];
    consoleLogCount += matches.length;
  }

  if (consoleLogCount > 0) {
    warnings.push({
      section: 'html_integrity',
      rule: 'inline_console_log',
      message: `Found ${consoleLogCount} console.log/warn/error statement(s) in inline <script> blocks. Remove for production.`,
      severity: 'WARNING'
    });
  }

  // 2b. Check for common JS API typos (cross-pollinated from ship validator)
  const jsTypoPatterns = [
    { pattern: /\.addEventListner\(/, message: 'Typo: addEventListner should be addEventListener' },
    { pattern: /\.innerHtml\s*=/, message: 'Typo: innerHtml should be innerHTML' },
    { pattern: /\.classlist\./, message: 'Typo: classlist should be classList' },
    { pattern: /document\.getElementByID\(/, message: 'Typo: getElementByID should be getElementById' },
    { pattern: /\.getElementByClassName\(/, message: 'Typo: getElementByClassName should be getElementsByClassName' },
    { pattern: /\.queryselector\(/, message: 'Typo: queryselector should be querySelector (check case)' },
    { pattern: /\.appendchild\(/, message: 'Typo: appendchild should be appendChild' },
    { pattern: /\.setattribute\(/, message: 'Typo: setattribute should be setAttribute' }
  ];
  for (const block of inlineScriptBlocks) {
    if (block.includes('application/ld+json') || block.includes('application/json')) continue;
    const jsContent = block.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
    for (const { pattern, message } of jsTypoPatterns) {
      if (pattern.test(jsContent)) {
        errors.push({
          section: 'html_integrity',
          rule: 'js_api_typo',
          message,
          severity: 'BLOCKING'
        });
      }
    }
  }

  // 3. Check for <meta name="author"> tag
  const authorMeta = $('meta[name="author"]').attr('content') || '';
  if (!authorMeta) {
    warnings.push({
      section: 'html_integrity',
      rule: 'missing_meta_author',
      message: 'Missing <meta name="author"> tag. Add for E-E-A-T signals.',
      severity: 'WARNING'
    });
  }

  // 4. Check balance of structural elements (section, details)
  const structuralTags = ['section', 'details', 'article', 'aside', 'nav'];
  for (const tag of structuralTags) {
    const openPattern = new RegExp(`<${tag}[\\s>]`, 'gi');
    const closePattern = new RegExp(`</${tag}>`, 'gi');
    const openCount = (html.match(openPattern) || []).length;
    const closeCount = (html.match(closePattern) || []).length;

    if (openCount !== closeCount) {
      errors.push({
        section: 'html_integrity',
        rule: `stray_${tag}_tag`,
        message: `Unbalanced <${tag}> tags: ${openCount} opening vs ${closeCount} closing. Check for stray closing tags or unclosed elements.`,
        severity: 'BLOCKING'
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    data: {
      has_meta_author: !!authorMeta,
      inline_console_logs: consoleLogCount
    }
  };
}

/**
 * Validate trust badge in footer
 */
function validateTrustBadge($) {
  const errors = [];
  const warnings = [];

  const trustBadge = $('footer .trust-badge, footer p.trust-badge');
  if (trustBadge.length === 0) {
    errors.push({
      section: 'footer',
      rule: 'trust_badge_missing',
      message: 'Missing trust badge in footer. Expected: <p class="trust-badge">✓ No ads. Minimal analytics. Independent of cruise lines. <a href="/affiliate-disclosure.html">Affiliate Disclosure</a></p>',
      severity: 'BLOCKING'
    });
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate last-reviewed stamp
 */
function validateLastReviewedStamp($) {
  const errors = [];
  const warnings = [];

  const lastReviewedStamp = $('p.last-reviewed, .last-reviewed');
  if (lastReviewedStamp.length === 0) {
    warnings.push({
      section: 'content',
      rule: 'last_reviewed_stamp_missing',
      message: 'Missing visible "Last reviewed" stamp. Expected: <p class="last-reviewed">Last reviewed: [Month Year]</p>',
      severity: 'WARNING'
    });
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate collapsible structure
 */
function validateCollapsibleStructure($) {
  const errors = [];
  const warnings = [];
  const nonCollapsibleSections = [];

  $('main h2').each((i, elem) => {
    const $h2 = $(elem);
    const headingText = $h2.text().toLowerCase();

    for (const [key, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (COLLAPSIBLE_REQUIRED.includes(key) && pattern.test(headingText)) {
        const $summary = $h2.closest('summary');
        const $details = $h2.closest('details');

        if ($summary.length === 0 || $details.length === 0) {
          nonCollapsibleSections.push(key);
        }
        break;
      }
    }
  });

  if (nonCollapsibleSections.length > 0) {
    errors.push({
      section: 'structure',
      rule: 'collapsible_required',
      message: `Sections must use collapsible <details>/<summary> structure: ${nonCollapsibleSections.join(', ')}`,
      severity: 'BLOCKING'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    non_collapsible: nonCollapsibleSections
  };
}

/**
 * Validate a single port page
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

// =============================================================================
// DEAD INTERNAL LINKS CHECK
// =============================================================================

/**
 * Validate that all internal links (href starting with /) resolve to real files.
 * External links (http/https) are skipped.
 * Anchor-only links (#...) are skipped.
 * Links to directories (ending with /) check for index.html inside.
 */
function validateInternalLinks($, filepath) {
  const errors = [];
  const warnings = [];
  const deadLinks = [];

  const allLinks = $('a[href]');
  allLinks.each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;

    // Skip external links, anchors, mailto, tel, javascript
    if (href.startsWith('http://') || href.startsWith('https://')) return;
    if (href.startsWith('#')) return;
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;

    // Normalize: strip query string and hash
    const cleanHref = href.split('?')[0].split('#')[0];
    if (!cleanHref || cleanHref === '/') return;

    // Resolve path relative to project root
    const resolvedPath = join(PROJECT_ROOT, cleanHref);

    // Check if file exists (with common web server URL patterns)
    if (!existsSync(resolvedPath)) {
      // If it ends with /, check for index.html
      if (cleanHref.endsWith('/')) {
        const indexPath = join(resolvedPath, 'index.html');
        if (existsSync(indexPath)) return;
      }
      // Check with .html extension (web servers often strip it)
      if (!cleanHref.endsWith('.html') && existsSync(resolvedPath + '.html')) return;
      deadLinks.push(cleanHref);
    }
  });

  // Deduplicate
  const uniqueDeadLinks = [...new Set(deadLinks)];

  if (uniqueDeadLinks.length > 0) {
    errors.push({
      section: 'links',
      rule: 'dead_internal_links',
      message: `${uniqueDeadLinks.length} dead internal link(s): ${uniqueDeadLinks.slice(0, 5).join(', ')}${uniqueDeadLinks.length > 5 ? ` and ${uniqueDeadLinks.length - 5} more` : ''}`,
      severity: 'BLOCKING'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    data: { deadLinks: uniqueDeadLinks, totalLinks: allLinks.length }
  };
}

// =============================================================================
// CLIMATE-INAPPROPRIATE ACTIVITIES CHECK
// =============================================================================

/**
 * Detect tropical activity recommendations (Beach, Snorkeling) on cold-water
 * ports. These are template copy-paste errors from the batch fix script.
 *
 * Uses the port's latitude from JSON-LD or a known cold-water region list.
 * Ports above 50°N or in known sub-arctic regions should not list Beach or
 * Snorkeling as activities.
 */
function validateClimateActivities($, html) {
  const errors = [];
  const warnings = [];

  // Known cold-water / sub-arctic port slugs (no Beach or Snorkeling)
  const COLD_WATER_SLUGS = new Set([
    'glacier-bay', 'kodiak', 'wrangell', 'valdez', 'homer', 'petersburg',
    'misty-fjords', 'college-fjord', 'inside-passage', 'denali', 'fairbanks',
    'juneau', 'ketchikan', 'sitka', 'skagway', 'haines', 'seward', 'whittier',
    'anchorage', 'icy-strait-point', 'tracy-arm', 'endicott-arm',
    'hubbard-glacier', 'glacier-alley', 'dutch-harbor', 'nome',
    'norwegian-fjords', 'geiranger', 'flam', 'olden', 'alesund',
    'tromso', 'honningsvag', 'stavanger', 'bergen',
    'isafjordur', 'akureyri', 'reykjavik',
    'torshavn', 'lerwick', 'kirkwall',
    'antarctica', 'antarctic-peninsula', 'south-shetland-islands',
    'drake-passage', 'cape-horn', 'ushuaia', 'punta-arenas',
    'chilean-fjords', 'strait-of-magellan',
    'svalbard', 'nuuk', 'qaqortoq',
  ]);

  // Try to extract port slug from canonical URL or page URL
  const canonical = $('link[rel="canonical"]').attr('href') || '';
  const slugMatch = canonical.match(/\/ports\/([^/.]+)/);
  const slug = slugMatch ? slugMatch[1] : '';

  if (!slug) {
    return { valid: true, errors, warnings, data: {} };
  }

  // Activity labels may be inside <noscript> which cheerio doesn't parse as DOM.
  // Use regex on raw HTML to extract activity labels from the weather widget.
  const activityLabelRegex = /class="activity-label">([^<]+)</g;
  const activityLabels = [];
  let match;
  while ((match = activityLabelRegex.exec(html)) !== null) {
    activityLabels.push(match[1].trim());
  }

  // Check for tropical activities in cold-water ports
  if (COLD_WATER_SLUGS.has(slug)) {
    const TROPICAL_ACTIVITIES = ['Beach', 'Snorkeling', 'Surfing', 'Scuba'];
    const badActivities = activityLabels.filter(a =>
      TROPICAL_ACTIVITIES.some(t => a.toLowerCase().includes(t.toLowerCase()))
    );

    if (badActivities.length > 0) {
      warnings.push({
        section: 'weather_activities',
        rule: 'climate_inappropriate_activities',
        message: `Cold-water port "${slug}" lists tropical activities: ${badActivities.join(', ')}. Likely template copy-paste error.`,
        severity: 'WARNING'
      });
    }
  }

  // Check for "City Walking" in scenic-cruise / non-city ports
  const SCENIC_ONLY_SLUGS = new Set([
    'endicott-arm', 'hubbard-glacier', 'tracy-arm', 'glacier-bay',
    'misty-fjords', 'college-fjord', 'inside-passage', 'glacier-alley',
    'norwegian-fjords', 'drake-passage', 'antarctic-peninsula',
    'south-shetland-islands', 'chilean-fjords', 'strait-of-magellan',
    'doubtful-sound', 'milford-sound', 'gatun-lake',
  ]);

  if (SCENIC_ONLY_SLUGS.has(slug) && activityLabels.includes('City Walking')) {
    warnings.push({
      section: 'weather_activities',
      rule: 'city_walking_in_non_city',
      message: `Scenic port "${slug}" lists "City Walking" but has no city. Likely template copy-paste error.`,
      severity: 'WARNING'
    });
  }

  return { valid: true, errors, warnings, data: { slug, activities: activityLabels } };
}

// =============================================================================
// DUPLICATE SIDEBAR SECTIONS CHECK
// =============================================================================

/**
 * Detect duplicate sidebar sections — e.g. "Plan Your Visit" appearing twice,
 * or duplicate id="planning-resources" in the HTML.
 */
function validateDuplicateSections($, html) {
  const errors = [];
  const warnings = [];

  // Check for duplicate IDs
  const idCounts = {};
  $('[id]').each((_, el) => {
    const id = $(el).attr('id');
    if (id) idCounts[id] = (idCounts[id] || 0) + 1;
  });

  const dupeIds = Object.entries(idCounts).filter(([id, count]) => count > 1);
  if (dupeIds.length > 0) {
    const dupeList = dupeIds.map(([id, count]) => `${id} (×${count})`).join(', ');
    warnings.push({
      section: 'html_structure',
      rule: 'duplicate_html_ids',
      message: `Duplicate HTML id attributes found: ${dupeList}`,
      severity: 'WARNING'
    });
  }

  return { valid: true, errors, warnings, data: { duplicateIds: dupeIds } };
}

// =============================================================================
// GALLERY PHOTO CREDIT DIVERSITY CHECK
// =============================================================================

/**
 * Detect gallery sections where >50% of photo credits link to the same URL.
 * This suggests placeholder images reusing the same source photo, or
 * copy-paste errors in attribution.
 */
function validateGalleryCreditDiversity($) {
  const errors = [];
  const warnings = [];

  const gallerySection = $('#gallery, .gallery, .photo-gallery, [id*="gallery"]');
  if (gallerySection.length === 0) {
    return { valid: true, errors, warnings, data: {} };
  }

  const creditUrls = [];
  gallerySection.find('.photo-credit a[href]').each((_, el) => {
    creditUrls.push($(el).attr('href'));
  });

  if (creditUrls.length < 3) {
    return { valid: true, errors, warnings, data: { creditCount: creditUrls.length } };
  }

  // Count URL frequency
  const urlCounts = {};
  for (const url of creditUrls) {
    urlCounts[url] = (urlCounts[url] || 0) + 1;
  }

  const uniqueUrls = Object.keys(urlCounts).length;
  const maxCount = Math.max(...Object.values(urlCounts));

  // Flag if >50% of credits use the same URL, or if only 1-2 unique URLs for 4+ images
  if (creditUrls.length >= 4 && uniqueUrls <= 2) {
    warnings.push({
      section: 'gallery',
      rule: 'gallery_credit_low_diversity',
      message: `Gallery has ${creditUrls.length} photo credits but only ${uniqueUrls} unique source URL(s) — possible placeholder images or copy-paste attribution`,
      severity: 'WARNING'
    });
  } else if (maxCount > creditUrls.length * 0.5 && creditUrls.length >= 4) {
    const topUrl = Object.entries(urlCounts).sort((a, b) => b[1] - a[1])[0][0];
    warnings.push({
      section: 'gallery',
      rule: 'gallery_credit_low_diversity',
      message: `Gallery: ${maxCount}/${creditUrls.length} photo credits link to same URL (${topUrl.substring(0, 60)}...)`,
      severity: 'WARNING'
    });
  }

  return { valid: true, errors, warnings, data: { uniqueUrls, totalCredits: creditUrls.length } };
}

// =============================================================================
// MULTIPLE H1 CHECK
// =============================================================================

/**
 * Pages should have exactly one <h1> element. Multiple h1 tags harm SEO and
 * accessibility. Common cause: hero overlay text using h1 alongside content h1.
 */
function validateMultipleH1($) {
  const errors = [];
  const warnings = [];

  const h1Count = $('h1').length;
  if (h1Count > 1) {
    errors.push({
      section: 'html_structure',
      rule: 'multiple_h1',
      message: `Page has ${h1Count} <h1> elements — should have exactly 1. Fix: change decorative hero text to <p>.`,
      severity: 'BLOCKING'
    });
  } else if (h1Count === 0) {
    warnings.push({
      section: 'html_structure',
      rule: 'missing_h1',
      message: 'Page has no <h1> element — every page should have exactly one.',
      severity: 'WARNING'
    });
  }

  return { valid: h1Count <= 1, errors, warnings, data: { h1Count } };
}

// =============================================================================
// GENERIC NOSCRIPT WEATHER PLACEHOLDER CHECK
// =============================================================================

/**
 * Detect generic "Varies by season" placeholder text in the noscript weather
 * widget. These should be replaced with port-specific weather data.
 */
function validateNoscriptWeather($, html) {
  const errors = [];
  const warnings = [];

  const GENERIC_PATTERNS = [
    'Varies by season',
    'Variable conditions',
    'Seasonal variation',
  ];

  const glanceValues = [];
  const glanceRegex = /class="glance-value">([^<]+)</g;
  let match;
  while ((match = glanceRegex.exec(html)) !== null) {
    glanceValues.push(match[1].trim());
  }

  const genericCount = glanceValues.filter(v =>
    GENERIC_PATTERNS.some(p => v.includes(p))
  ).length;

  if (genericCount >= 3 && glanceValues.length > 0) {
    warnings.push({
      section: 'weather_widget',
      rule: 'generic_noscript_weather',
      message: `Weather widget has ${genericCount}/${glanceValues.length} generic placeholder values ("Varies by season"). Replace with port-specific data.`,
      severity: 'WARNING'
    });
  }

  return { valid: true, errors, warnings, data: { genericCount, total: glanceValues.length } };
}

// =============================================================================
// GENERIC ALT TEXT CHECK
// =============================================================================

/**
 * Detect images with generic template alt text that doesn't describe the actual
 * photo content. Common offender: "skyline and cityscape" used on non-city ports.
 */
function validateGenericAltText($) {
  const errors = [];
  const warnings = [];

  const GENERIC_ALT_PATTERNS = [
    'skyline and cityscape',
    'Scenic attraction along',
    'Natural beauty of',
    'Harbor scene along',
    'Scenic landmark along',
  ];

  const badAlts = [];
  $('img[alt]').each((_, el) => {
    const alt = $(el).attr('alt') || '';
    for (const pattern of GENERIC_ALT_PATTERNS) {
      if (alt.includes(pattern)) {
        badAlts.push(alt.substring(0, 60));
        break;
      }
    }
  });

  if (badAlts.length > 0) {
    warnings.push({
      section: 'images',
      rule: 'generic_alt_text',
      message: `${badAlts.length} image(s) have generic template alt text: "${badAlts[0]}..."`,
      severity: 'WARNING'
    });
  }

  return { valid: true, errors, warnings, data: { genericAlts: badAlts.length } };
}

// =============================================================================
// RELATIVE IMAGE PATHS CHECK
// =============================================================================

/**
 * Detect images using relative paths (e.g., src="img/...") instead of absolute
 * paths (e.g., src="/ports/img/..."). Relative paths may break depending on
 * URL routing.
 */
function validateRelativeImagePaths($) {
  const errors = [];
  const warnings = [];

  const relativeImages = [];
  $('img[src]').each((_, el) => {
    const src = $(el).attr('src') || '';
    if (src.startsWith('img/') || src.startsWith('./img/')) {
      relativeImages.push(src.substring(0, 60));
    }
  });

  if (relativeImages.length > 0) {
    warnings.push({
      section: 'images',
      rule: 'relative_image_paths',
      message: `${relativeImages.length} image(s) use relative paths (e.g., "${relativeImages[0]}"). Use absolute paths (/ports/img/...).`,
      severity: 'WARNING'
    });
  }

  return { valid: true, errors, warnings, data: { relativeImages: relativeImages.length } };
}

// =============================================================================
// ORPHANED FAQ QUESTIONS CHECK
// =============================================================================

/**
 * Detect FAQ Q&A content that sits outside the accordion <details> wrapper.
 * These are weather-related Q&As injected by the batch script that ended up
 * after the closing </details> tag.
 */
function validateOrphanedFAQQuestions($, html) {
  const errors = [];
  const warnings = [];

  // Look for <p><strong>Q: patterns in the raw HTML that come after </details>
  // but before </section> in the FAQ area
  const faqSection = html.match(/<section[^>]*id="faq"[^>]*>([\s\S]*?)<\/section>/i);
  if (!faqSection) {
    return { valid: true, errors, warnings, data: {} };
  }

  const faqHtml = faqSection[1];
  // Find the last </details> in the FAQ section
  const lastDetailsClose = faqHtml.lastIndexOf('</details>');
  if (lastDetailsClose === -1) {
    return { valid: true, errors, warnings, data: {} };
  }

  // Check for Q: patterns after the last </details>
  const afterAccordion = faqHtml.substring(lastDetailsClose);
  const orphanedQs = (afterAccordion.match(/<p><strong>Q:/g) || []).length;

  if (orphanedQs > 0) {
    warnings.push({
      section: 'faq',
      rule: 'faq_orphaned_questions',
      message: `${orphanedQs} FAQ question(s) found outside the accordion wrapper. These render as unstyled loose paragraphs.`,
      severity: 'WARNING'
    });
  }

  return { valid: true, errors, warnings, data: { orphanedQs } };
}

// =============================================================================
// RECENT STORIES PATTERN CHECK
// =============================================================================

/**
 * Validate that the Recent Stories sidebar section uses the dynamic recent-rail
 * pattern instead of hardcoded story links.
 *
 * Correct pattern requires:
 * - An element matching id="recent-rail" (the dynamic container)
 * - No hardcoded <a href="/stories/..."> links anywhere in the sidebar
 */
function validateRecentStoriesPattern($) {
  const errors = [];
  const warnings = [];

  const sidebar = $('aside, .sidebar, .rail, .right-rail, .col-2');
  if (sidebar.length === 0) {
    // No sidebar — other validators handle this
    return { valid: true, errors, warnings, data: {} };
  }

  const sidebarHtml = sidebar.html() || '';

  // Check for hardcoded /stories/ links in the sidebar
  const hardcodedStoryLinks = [];
  sidebar.find('a[href^="/stories/"]').each((_, el) => {
    hardcodedStoryLinks.push($(el).attr('href'));
  });

  if (hardcodedStoryLinks.length > 0) {
    errors.push({
      section: 'sidebar',
      rule: 'hardcoded_story_links',
      message: `Recent Stories section has ${hardcodedStoryLinks.length} hardcoded /stories/ link(s) instead of dynamic recent-rail. Use id="recent-rail" with class="rail-list" for JS-populated content.`,
      severity: 'BLOCKING'
    });
  }

  // If Recent Stories section exists (by text/class), check it uses the rail pattern
  const hasRecentStoriesSection = /recent.stories|recent-rail/i.test(sidebarHtml);
  const hasDynamicRail = sidebar.find('#recent-rail, [id*="recent-rail"]').length > 0;

  if (hasRecentStoriesSection && !hasDynamicRail && hardcodedStoryLinks.length === 0) {
    // Section exists but no dynamic rail and no hardcoded links — structural issue
    warnings.push({
      section: 'sidebar',
      rule: 'recent_stories_no_rail',
      message: 'Recent Stories section found but missing id="recent-rail" dynamic container',
      severity: 'WARNING'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    data: {
      hasRecentStoriesSection,
      hasDynamicRail,
      hardcodedStoryLinks: hardcodedStoryLinks.length
    }
  };
}

// =============================================================================
// STANDARDS v3.010 CROSS-POLLINATION CHECKS
// =============================================================================

/**
 * Validate sidebar/rail sections (PORT_PAGE_STANDARD v3.010 §sidebar)
 * Port pages must have 8 sidebar sections in order:
 * Quick Answer, At a Glance, Plan Your Visit, Author's Note Disclaimer,
 * About the Author, Nearby Ports, Recent Stories, Whimsical Units
 */
function validateSidebar($) {
  const errors = [];
  const warnings = [];

  const REQUIRED_SIDEBAR_SECTIONS = [
    { id: 'quick-answer',       pattern: /quick.?answer|answer-line/i,            label: 'Quick Answer' },
    { id: 'at-a-glance',        pattern: /at.a.glance|port.snapshot/i,            label: 'At a Glance' },
    { id: 'planning-resources',  pattern: /plan.your.visit|planning.resources/i,   label: 'Plan Your Visit' },
    { id: 'author-note',        pattern: /author('s)?.?note|disclaimer/i,         label: "Author's Note Disclaimer" },
    { id: 'about-author',       pattern: /about.the.author|author-card/i,         label: 'About the Author' },
    { id: 'nearby-ports',       pattern: /nearby.ports?|other.ports/i,            label: 'Nearby Ports' },
    { id: 'recent-stories',     pattern: /recent.stories|recent-rail/i,           label: 'Recent Stories' },
    { id: 'whimsical-units',    pattern: /whimsical.?units?|distance.?units/i,    label: 'Whimsical Units' }
  ];

  // Look for sidebar/rail container
  const sidebar = $('aside, .sidebar, .rail, .right-rail, .col-2');
  if (sidebar.length === 0) {
    errors.push({
      section: 'sidebar',
      rule: 'missing_sidebar',
      message: 'No sidebar/rail container found (aside, .sidebar, .rail, .col-2)',
      severity: 'BLOCKING'
    });
    return { valid: false, errors, warnings, data: { hasSidebar: false } };
  }

  const sidebarHtml = sidebar.html() || '';
  const sidebarText = sidebar.text() || '';
  const detected = [];
  const missing = [];

  for (const section of REQUIRED_SIDEBAR_SECTIONS) {
    const hasById = sidebar.find(`#${section.id}, [id*="${section.id}"]`).length > 0;
    const hasByClass = sidebar.find(`[class*="${section.id}"]`).length > 0;
    const hasByText = section.pattern.test(sidebarText) || section.pattern.test(sidebarHtml);

    if (hasById || hasByClass || hasByText) {
      detected.push(section.label);
    } else {
      missing.push(section.label);
    }
  }

  if (missing.length > 0) {
    errors.push({
      section: 'sidebar',
      rule: 'missing_sidebar_sections',
      message: `Sidebar missing ${missing.length} required section(s): ${missing.join(', ')}`,
      severity: 'BLOCKING'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    data: { hasSidebar: true, detected, missing }
  };
}

/**
 * Validate Swiper CDN fallback pattern (PORT_PAGE_STANDARD v3.010)
 * Must have primary Swiper + CDN fallback with window.__swiperReady flag
 */
function validateSwiperFallback($, html) {
  const errors = [];
  const warnings = [];

  // Check if page uses Swiper at all
  const hasSwiper = html.includes('swiper') || html.includes('Swiper');
  if (!hasSwiper) {
    return { valid: true, errors, warnings, data: { usesSwiper: false } };
  }

  // Check for local Swiper bundle
  const hasLocalSwiper = html.includes('swiper-bundle') || html.includes('/assets/js/swiper');

  // Check for CDN fallback
  const hasCDNFallback = html.includes('cdn.jsdelivr.net') || html.includes('cdnjs.cloudflare.com') || html.includes('unpkg.com');

  // Check for __swiperReady flag
  const hasSwiperReady = html.includes('__swiperReady') || html.includes('swiperReady');

  if (hasLocalSwiper && !hasCDNFallback) {
    warnings.push({
      section: 'swiper',
      rule: 'missing_cdn_fallback',
      message: 'Swiper loaded locally but no CDN fallback found. Add CDN fallback for resilience.',
      severity: 'WARNING'
    });
  }

  if (!hasSwiperReady && (hasLocalSwiper || hasCDNFallback)) {
    warnings.push({
      section: 'swiper',
      rule: 'missing_swiper_ready',
      message: 'Swiper scripts found but no window.__swiperReady flag. Add ready flag for load-order safety.',
      severity: 'WARNING'
    });
  }

  return {
    valid: true,
    errors,
    warnings,
    data: { usesSwiper: true, hasLocalSwiper, hasCDNFallback, hasSwiperReady }
  };
}

/**
 * Validate Service Worker registration (MOBILE_STANDARDS v1.000)
 * Pages should register /sw.js for offline support
 */
function validateServiceWorker(html) {
  const errors = [];
  const warnings = [];

  const hasSWRegister = html.includes('serviceWorker.register') || html.includes('serviceWorker');
  const hasSWFile = html.includes("'/sw.js'") || html.includes('"/sw.js"') || html.includes('/sw.js');

  if (!hasSWRegister) {
    warnings.push({
      section: 'service_worker',
      rule: 'missing_sw_registration',
      message: 'No Service Worker registration found. Add navigator.serviceWorker.register(\'/sw.js\') for offline support.',
      severity: 'WARNING'
    });
  }

  return {
    valid: true,
    errors,
    warnings,
    data: { hasServiceWorker: hasSWRegister, hasSWFile }
  };
}

/**
 * Validate FAQ answer length (PORT_PAGE_STANDARD v3.010: each answer ≤80 words)
 */
function validateFAQAnswerLength($) {
  const errors = [];
  const warnings = [];

  const faqSection = $('details').closest('section[id*="faq"], details');
  const faqDetails = $('details');
  let longAnswers = 0;
  const longAnswerDetails = [];

  faqDetails.each((i, elem) => {
    const $detail = $(elem);
    const summary = $detail.find('summary').text().trim();
    // Get answer text (everything after the summary)
    const fullText = $detail.text();
    const summaryText = $detail.find('summary').text();
    const answerText = fullText.replace(summaryText, '').trim();
    const wordCount = countWords(answerText);

    if (wordCount > 80) {
      longAnswers++;
      longAnswerDetails.push({ question: summary.substring(0, 60), words: wordCount });
    }
  });

  if (longAnswers > 0) {
    const examples = longAnswerDetails.slice(0, 2).map(d => `"${d.question}..." (${d.words} words)`).join('; ');
    warnings.push({
      section: 'faq',
      rule: 'answer_too_long',
      message: `${longAnswers} FAQ answer(s) exceed 80-word limit: ${examples}`,
      severity: 'WARNING'
    });
  }

  return {
    valid: true,
    errors,
    warnings,
    data: { totalFAQs: faqDetails.length, longAnswers, longAnswerDetails }
  };
}

/**
 * Validate answer-line and key-facts presence (ICP-Lite v1.4 / PORT_PAGE_STANDARD v3.010)
 * Every port page should have a quick answer-line and a key-facts box
 */
function validateAnswerLineKeyFacts($) {
  const errors = [];
  const warnings = [];

  const hasAnswerLine = $('.answer-line').length > 0 || $('[class*="answer-line"]').length > 0;
  const hasKeyFacts = $('.key-facts').length > 0 || $('[class*="key-facts"]').length > 0;

  if (!hasAnswerLine) {
    errors.push({
      section: 'content_structure',
      rule: 'missing_answer_line',
      message: 'Missing answer-line element. Every port page needs a quick one-line answer.',
      severity: 'BLOCKING'
    });
  }

  if (!hasKeyFacts) {
    errors.push({
      section: 'content_structure',
      rule: 'missing_key_facts',
      message: 'Missing key-facts element. Every port page needs a key facts summary.',
      severity: 'BLOCKING'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    data: { hasAnswerLine, hasKeyFacts }
  };
}

/**
 * Validate Soli Deo Gloria position (must be in first 3 lines, before <!doctype html>)
 * Per CLAUDE.md and site standards, SDG is the spiritual foundation comment.
 */
function validateSDGPosition(html) {
  const errors = [];
  const warnings = [];

  const lines = html.split('\n').slice(0, 5); // Check first 5 lines
  const first3 = lines.slice(0, 3).join('\n');

  const hasSDG = /soli\s+deo\s+gloria/i.test(html);
  const sdgInFirst3 = /soli\s+deo\s+gloria/i.test(first3);

  if (!hasSDG) {
    errors.push({
      section: 'soli_deo_gloria',
      rule: 'missing_sdg',
      message: 'Missing "Soli Deo Gloria" dedication anywhere in file',
      severity: 'BLOCKING'
    });
  } else if (!sdgInFirst3) {
    warnings.push({
      section: 'soli_deo_gloria',
      rule: 'sdg_position',
      message: 'Soli Deo Gloria found but not in first 3 lines. Should appear before <!doctype html>.',
      severity: 'WARNING'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    data: { hasSDG, sdgInFirst3 }
  };
}

/**
 * Validate canonical URL format (must be absolute https://cruisinginthewake.com/...)
 */
function validateCanonicalURL($) {
  const errors = [];
  const warnings = [];

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

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    data: { canonical }
  };
}

/**
 * Validate POI manifest (PORT_PAGE_STANDARD v3.010)
 * Port pages should have a corresponding map manifest with minimum 10 POI
 */
async function validatePOIManifest(filepath) {
  const errors = [];
  const warnings = [];

  const filename = basename(filepath, '.html');
  const mapPath = join(PROJECT_ROOT, 'assets', 'data', 'maps', `${filename}.map.json`);

  if (!existsSync(mapPath)) {
    warnings.push({
      section: 'poi_manifest',
      rule: 'missing_map_manifest',
      message: `No POI manifest found at assets/data/maps/${filename}.map.json`,
      severity: 'WARNING'
    });
    return { valid: true, errors, warnings, data: { hasManifest: false } };
  }

  try {
    const content = readFileSync(mapPath, 'utf-8');
    const data = JSON.parse(content);

    // The map module (port-map.js) renders POIs from TWO sources:
    //   1. port_pin — always renders the cruise terminal pin
    //   2. poi_ids — looked up in poi-index.json for lat/lon/type
    // The pois array in the manifest is supplemental metadata.
    // We check BOTH poi_ids resolution AND pois array count.

    const poiIds = data.poi_ids || [];
    const pois = data.pois || data.points || data.markers || [];
    const poiCount = Array.isArray(pois) ? pois.length : 0;

    // Primary check: resolved poi_ids in poi-index.json (what actually renders)
    let resolvedCount = 0;
    let missingIds = [];
    const poiIndexPath = join(PROJECT_ROOT, 'assets', 'data', 'maps', 'poi-index.json');
    if (existsSync(poiIndexPath)) {
      try {
        const poiIndexContent = readFileSync(poiIndexPath, 'utf-8');
        const poiIndex = JSON.parse(poiIndexContent);
        missingIds = poiIds.filter(id => !poiIndex[id]);
        resolvedCount = poiIds.length - missingIds.length;
      } catch (_) {
        // poi-index.json parse error — fall back to pois array count
        resolvedCount = poiCount;
      }
    } else {
      resolvedCount = poiCount;
    }

    // Use the better of poi_ids resolution or pois array for the count
    const effectivePoiCount = Math.max(resolvedCount, poiCount);

    if (effectivePoiCount < 10) {
      warnings.push({
        section: 'poi_manifest',
        rule: 'insufficient_pois',
        message: `Map has ${effectivePoiCount} renderable point(s) (${resolvedCount} resolved poi_ids, ${poiCount} in pois array), minimum recommended is 10`,
        severity: 'WARNING'
      });
    }

    // Warn about unresolved poi_ids — these won't render on the map
    if (missingIds.length > 0) {
      warnings.push({
        section: 'poi_manifest',
        rule: 'unresolved_poi_ids',
        message: `${missingIds.length} poi_id(s) not found in poi-index.json: ${missingIds.slice(0, 5).join(', ')}${missingIds.length > 5 ? ` and ${missingIds.length - 5} more` : ''}. Map markers will not render for these.`,
        severity: 'WARNING'
      });
    }

    // Warn if pois data exists but poi_ids is empty (map won't show markers)
    if (poiCount > 0 && poiIds.length === 0) {
      warnings.push({
        section: 'poi_manifest',
        rule: 'pois_without_poi_ids',
        message: `Manifest has ${poiCount} pois but no poi_ids array. Map markers rely on poi_ids referencing poi-index.json.`,
        severity: 'WARNING'
      });
    }

    // Warn if poi_ids exist but no pois array (data not self-contained)
    if (poiIds.length > 0 && poiCount === 0) {
      warnings.push({
        section: 'poi_manifest',
        rule: 'poi_ids_without_pois',
        message: `Manifest has ${poiIds.length} poi_ids but no pois array. Add a pois array with coordinates for data completeness.`,
        severity: 'WARNING'
      });
    }

    return {
      valid: true,
      errors,
      warnings,
      data: { hasManifest: true, poiCount, poiIdCount: poiIds.length, resolvedCount }
    };
  } catch (e) {
    warnings.push({
      section: 'poi_manifest',
      rule: 'invalid_manifest',
      message: `POI manifest parse error: ${e.message}`,
      severity: 'WARNING'
    });
    return { valid: true, errors, warnings, data: { hasManifest: true, parseError: true } };
  }
}

// =============================================================================
// WEATHER WIDGET INTEGRITY CHECK (Caribbean Deep Dive — Session 7)
// =============================================================================

/**
 * Validate weather widget data attributes:
 * - data-lat and data-lon must not both be "0" (null island — off West Africa)
 * - data-region should match the port's actual geographic region
 */
function validateWeatherWidget($) {
  const errors = [];
  const warnings = [];

  const widget = $('#port-weather-widget');
  if (widget.length === 0) {
    return { valid: true, errors, warnings, data: { hasWidget: false } };
  }

  const lat = widget.attr('data-lat') || '';
  const lon = widget.attr('data-lon') || '';
  const region = widget.attr('data-region') || '';
  const portId = widget.attr('data-port-id') || '';

  // Check for null-island coordinates (0, 0)
  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);
  if (lat === '0' && lon === '0') {
    errors.push({
      section: 'weather_widget',
      rule: 'null_island_coordinates',
      message: `Weather widget has data-lat="0" data-lon="0" (null island off West Africa). Must use actual port coordinates.`,
      severity: 'BLOCKING'
    });
  } else if (isNaN(latNum) || isNaN(lonNum)) {
    errors.push({
      section: 'weather_widget',
      rule: 'invalid_coordinates',
      message: `Weather widget has non-numeric coordinates: lat="${lat}", lon="${lon}"`,
      severity: 'BLOCKING'
    });
  }

  // Region validation: map known port slugs to expected regions
  const CARIBBEAN_SLUGS = new Set([
    'antigua', 'aruba', 'barbados', 'belize', 'bermuda', 'bimini',
    'bonaire', 'bridgetown', 'cartagena', 'cococay', 'costa-maya',
    'cozumel', 'curacao', 'dominica', 'falmouth', 'freeport',
    'grand-cayman', 'grand-turk', 'grenada', 'guadeloupe',
    'half-moon-cay', 'harvest-caye', 'isla-roatan', 'key-west',
    'kralendijk', 'labadee', 'martinique', 'montego-bay', 'nassau',
    'ocho-rios', 'ocean-cay', 'perfect-day-cococay', 'philipsburg',
    'port-au-prince', 'progreso', 'puerto-plata', 'rincon',
    'roseau', 'samana', 'san-juan', 'santa-marta', 'scarborough',
    'st-barts', 'st-croix', 'st-john-usvi', 'st-kitts', 'st-lucia',
    'st-maarten', 'st-thomas', 'st-vincent', 'tobago', 'tortola',
    'trinidad', 'turks-and-caicos', 'virgin-gorda', 'willemstad',
    'amber-cove', 'puerto-limon', 'colon', 'la-romana',
    'george-town', 'castries', 'basseterre', 'kingstown',
    'road-town', 'charlotte-amalie', 'christiansted', 'frederiksted',
    'cockburn-town', 'gustavia', 'marigot', 'pointe-a-pitre',
    'fort-de-france', 'st-johns-antigua', 'port-of-spain',
    'royal-beach-club-nassau', 'royal-beach-club-antigua',
    'royal-beach-club-cozumel',
  ]);

  if (portId && region) {
    if (CARIBBEAN_SLUGS.has(portId) && region !== 'Caribbean') {
      errors.push({
        section: 'weather_widget',
        rule: 'wrong_region',
        message: `Caribbean port "${portId}" has data-region="${region}" (expected "Caribbean")`,
        severity: 'BLOCKING'
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    data: { hasWidget: true, lat, lon, region, portId }
  };
}

// =============================================================================
// JSON-LD GEO COORDINATES STRUCTURE CHECK (Caribbean Deep Dive — Session 7)
// =============================================================================

/**
 * Validate JSON-LD GeoCoordinates beyond basic parse checking:
 * - If a "geo" object exists, verify latitude/longitude are present and in range
 * - Detect structural issues like missing closing braces that cause
 *   dateModified to be injected inside the geo object
 */
function validateJsonLdGeoCoordinates($) {
  const errors = [];
  const warnings = [];

  const jsonldScripts = $('script[type="application/ld+json"]');

  jsonldScripts.each((i, elem) => {
    try {
      const content = $(elem).html();
      const data = JSON.parse(content);

      // Recursively search for geo objects
      function checkGeo(obj, path) {
        if (!obj || typeof obj !== 'object') return;

        if (obj['@type'] === 'GeoCoordinates' || (obj.geo && obj.geo['@type'] === 'GeoCoordinates')) {
          const geo = obj['@type'] === 'GeoCoordinates' ? obj : obj.geo;
          const geoPath = obj['@type'] === 'GeoCoordinates' ? path : path + '.geo';

          if (geo.latitude === undefined || geo.longitude === undefined) {
            errors.push({
              section: 'jsonld_geo',
              rule: 'missing_coordinates',
              message: `JSON-LD GeoCoordinates at ${geoPath} missing latitude or longitude`,
              severity: 'BLOCKING'
            });
          } else {
            const lat = parseFloat(geo.latitude);
            const lon = parseFloat(geo.longitude);

            if (isNaN(lat) || lat < -90 || lat > 90) {
              errors.push({
                section: 'jsonld_geo',
                rule: 'latitude_out_of_range',
                message: `JSON-LD latitude ${geo.latitude} at ${geoPath} is out of range (-90 to 90)`,
                severity: 'BLOCKING'
              });
            }
            if (isNaN(lon) || lon < -180 || lon > 180) {
              errors.push({
                section: 'jsonld_geo',
                rule: 'longitude_out_of_range',
                message: `JSON-LD longitude ${geo.longitude} at ${geoPath} is out of range (-180 to 180)`,
                severity: 'BLOCKING'
              });
            }
          }

          // Check for contamination: dateModified should not be inside geo
          if (geo.dateModified) {
            errors.push({
              section: 'jsonld_geo',
              rule: 'contaminated_geo_object',
              message: `JSON-LD GeoCoordinates at ${geoPath} contains "dateModified" — likely a malformed JSON structure (missing closing brace)`,
              severity: 'BLOCKING'
            });
          }
        }

        // Recurse into nested objects
        for (const key of Object.keys(obj)) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            checkGeo(obj[key], `${path}.${key}`);
          }
        }
      }

      checkGeo(data, 'root');
    } catch (e) {
      // Parse errors already caught by validateICPLite — skip here
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    data: { checkedBlocks: jsonldScripts.length }
  };
}

// =============================================================================
// AUTHOR CONSISTENCY CHECK (Caribbean Deep Dive — Session 7)
// =============================================================================

/**
 * Detect contradiction between "haven't visited" disclaimers and
 * first-person logbook narratives with vivid experiential detail.
 *
 * A page should NOT simultaneously claim "I haven't visited this port"
 * and present a detailed first-person "My Visit to X" logbook.
 */
function validateAuthorConsistency($) {
  const errors = [];
  const warnings = [];

  const bodyText = $('body').text();

  // Detect "haven't visited" disclaimer patterns
  const notVisitedPatterns = [
    /soundings in another('s|s) wake/i,
    /haven.t visited this port/i,
    /not firsthand experience/i,
    /awaiting the day I can verify them firsthand/i,
    /until I have sailed this port myself/i
  ];

  let hasNotVisitedDisclaimer = false;
  for (const pattern of notVisitedPatterns) {
    if (pattern.test(bodyText)) {
      hasNotVisitedDisclaimer = true;
      break;
    }
  }

  // Detect first-person logbook narrative indicators
  const logbookHeading = $('h2, h3').filter((_, el) => {
    const text = $(el).text();
    return /my (visit|experience|day|time|trip) (to|in|at|on)/i.test(text);
  });

  const hasFirstPersonLogbook = logbookHeading.length > 0;

  // Also check for vivid first-person experiential content in the logbook section
  const logbookSection = $('[id*="logbook"], .logbook-section, details:has(h2:contains("My"))');
  let hasVividFirstPerson = false;
  if (logbookSection.length > 0) {
    const logbookText = logbookSection.text();
    const vividPatterns = [
      /I stepped/i,
      /I walked/i,
      /I watched/i,
      /I could (see|hear|smell|feel|taste)/i,
      /the (driver|guide|captain|bartender|waiter) (told|said|pointed|explained)/i,
    ];
    const matches = vividPatterns.filter(p => p.test(logbookText));
    hasVividFirstPerson = matches.length >= 2;
  }

  if (hasNotVisitedDisclaimer && (hasFirstPersonLogbook || hasVividFirstPerson)) {
    warnings.push({
      section: 'author_consistency',
      rule: 'disclaimer_logbook_contradiction',
      message: 'Page has "haven\'t visited" disclaimer but also contains first-person logbook narrative. These contradict each other — either remove the disclaimer or clarify the logbook is illustrative.',
      severity: 'WARNING'
    });
  }

  return {
    valid: true,
    errors,
    warnings,
    data: {
      hasNotVisitedDisclaimer,
      hasFirstPersonLogbook,
      hasVividFirstPerson
    }
  };
}

// =============================================================================
// MEXICAN PORT REVOLUTION DAY NOTICE CHECK (Caribbean Deep Dive — Session 7)
// =============================================================================

/**
 * Mexican ports MUST include a Revolution Day (November 20) notice
 * per CODEBASE_GUIDE.md port creation checklist item #7.
 * Checks for the notice in the Important Notices / Special Notices section.
 */
function validateMexicanPortNotices($, html) {
  const errors = [];
  const warnings = [];

  const MEXICAN_PORT_SLUGS = new Set([
    'cozumel', 'costa-maya', 'progreso', 'cabo-san-lucas', 'ensenada',
    'mazatlan', 'puerto-vallarta', 'huatulco', 'zihuatanejo',
    'manzanillo', 'acapulco',
  ]);

  // Extract port slug from canonical URL
  const canonical = $('link[rel="canonical"]').attr('href') || '';
  const slugMatch = canonical.match(/\/ports\/([^/.]+)/);
  const slug = slugMatch ? slugMatch[1] : '';

  if (!slug || !MEXICAN_PORT_SLUGS.has(slug)) {
    return { valid: true, errors, warnings, data: { isMexicanPort: false } };
  }

  // Check for Revolution Day notice
  const hasRevolutionDay = /revolution day/i.test(html) || /november 20/i.test(html);

  if (!hasRevolutionDay) {
    warnings.push({
      section: 'mexican_port_notices',
      rule: 'missing_revolution_day',
      message: `Mexican port "${slug}" missing Revolution Day (November 20) notice. Per CODEBASE_GUIDE.md port checklist item #7, all Mexican ports must include this.`,
      severity: 'WARNING'
    });
  }

  return {
    valid: true,
    errors,
    warnings,
    data: { isMexicanPort: true, slug, hasRevolutionDay }
  };
}

// =============================================================================
// SEASONAL DATA SANITY CHECK (Caribbean Deep Dive — Session 7)
// =============================================================================

/**
 * Validate that peak/low season designations are meteorologically sensible.
 * Caribbean and hurricane-zone ports should NOT list Jun-Nov as peak season
 * (that's hurricane season). Peak cruise season is typically Dec-Apr.
 */
function validateSeasonalData($, html) {
  const errors = [];
  const warnings = [];

  // Hurricane-zone port slugs where summer should NOT be peak season
  const HURRICANE_ZONE_SLUGS = new Set([
    // Eastern Caribbean
    'antigua', 'barbados', 'dominica', 'grenada', 'guadeloupe', 'martinique',
    'st-barts', 'st-kitts', 'st-lucia', 'st-maarten', 'st-vincent',
    'philipsburg',
    // USVI / BVI
    'st-thomas', 'st-croix', 'st-john-usvi', 'tortola', 'virgin-gorda',
    // Western Caribbean
    'cozumel', 'costa-maya', 'grand-cayman', 'isla-roatan', 'belize',
    'harvest-caye', 'progreso',
    // Jamaica / Hispaniola
    'falmouth', 'montego-bay', 'ocho-rios', 'labadee', 'puerto-plata',
    // Bahamas
    'nassau', 'freeport', 'bimini', 'cococay', 'half-moon-cay',
    'grand-turk', 'perfect-day-cococay',
    // Southern Caribbean
    'aruba', 'bonaire', 'curacao', 'trinidad', 'tobago',
    // Puerto Rico
    'san-juan',
    // Royal Beach Clubs
    'royal-beach-club-nassau', 'royal-beach-club-antigua',
  ]);

  const HURRICANE_MONTHS = new Set(['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']);

  // Extract port slug
  const canonical = $('link[rel="canonical"]').attr('href') || '';
  const slugMatch = canonical.match(/\/ports\/([^/.]+)/);
  const slug = slugMatch ? slugMatch[1] : '';

  if (!slug || !HURRICANE_ZONE_SLUGS.has(slug)) {
    return { valid: true, errors, warnings, data: { isHurricaneZone: false } };
  }

  // Seasonal data is inside <noscript> — Cheerio doesn't parse noscript content
  // as regular DOM, so use regex on raw HTML to extract peak season months.
  const peakMatch = html.match(/cruise-season-high[^>]*>.*?season-months">([^<]+)</s);
  if (!peakMatch) {
    return { valid: true, errors, warnings, data: { isHurricaneZone: true, hasPeakData: false } };
  }

  const peakText = peakMatch[1].trim();
  const peakMonths = peakText.split(',').map(m => m.trim());

  // Count how many peak months fall in hurricane season
  const hurricaneMonthsInPeak = peakMonths.filter(m => HURRICANE_MONTHS.has(m));

  if (hurricaneMonthsInPeak.length >= 3) {
    errors.push({
      section: 'seasonal_data',
      rule: 'peak_season_in_hurricane_season',
      message: `Hurricane-zone port "${slug}" lists ${hurricaneMonthsInPeak.join(', ')} as peak season. Caribbean peak cruise season is Dec-Apr; Jun-Nov is hurricane season.`,
      severity: 'BLOCKING'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    data: {
      isHurricaneZone: true,
      hasPeakData: true,
      peakMonths,
      hurricaneMonthsInPeak
    }
  };
}

/**
 * Validate that port page does NOT contain copy-pasted template filler.
 * Session 12 finding: batch scripts injected identical generic paragraphs
 * into 88 ports to pass validation. This check catches that filler and
 * makes it a BLOCKING error so those pages correctly FAIL until real
 * port-specific content replaces the templates.
 *
 * Each signature is a short, unique substring that only appears in the
 * template text and would never appear in genuine port-specific writing.
 */
function validateTemplateFiller($, html) {
  const errors = [];
  const warnings = [];

  const fullText = $('body').text();

  // Template filler signatures — each is a unique phrase from the batch scripts
  const TEMPLATE_SIGNATURES = [
    {
      id: 'generic_emotional_pivot',
      pattern: 'There was a quiet moment.*standing still while the world moved around me',
      label: 'Generic emotional pivot paragraph (copy-pasted to 34 ports)'
    },
    {
      id: 'generic_excursion_booking',
      pattern: 'Whether you book through your ship\'s excursion desk or arrange something independently',
      label: 'Generic excursion booking paragraph (copy-pasted to 66 ports)'
    },
    {
      id: 'generic_cruise_port_welcome',
      pattern: 'welcomes cruise ships at its well-positioned terminal, offering straightforward access',
      label: 'Generic cruise port welcome paragraph (copy-pasted to 62 ports)'
    },
    {
      id: 'generic_reflection',
      pattern: 'what matters most about this place is not what you can photograph or post online',
      label: 'Generic reflection paragraph (copy-pasted to 20 ports)'
    },
    {
      id: 'generic_accessibility_padding',
      pattern: 'I noticed the accessibility situation varied.*some paths were smooth',
      label: 'Generic accessibility padding paragraph (copy-pasted to 33 ports)'
    },
    {
      id: 'generic_budget_line',
      pattern: 'Budget roughly \\$40.*\\$100 per person for a full day',
      label: 'Generic budget line (copy-pasted to 73 ports)'
    },
    {
      id: 'generic_passport_advice',
      pattern: 'Carry a photocopy of your passport rather than the original',
      label: 'Generic passport advice (copy-pasted to 47 ports)'
    },
    {
      id: 'generic_gangway_walk',
      pattern: 'The walk from gangway to port gate typically takes 5.*15 minutes',
      label: 'Generic gangway walk time (copy-pasted to 63 ports)'
    },
    {
      id: 'generic_getting_around',
      pattern: 'highlights are accessible on foot from the cruise terminal, though distances vary',
      label: 'Generic Getting Around paragraph (copy-pasted to 70 ports)'
    },
    {
      id: 'generic_shuttle_buses',
      pattern: 'Some cruise lines offer shuttle buses between the port and town center, typically \\$8.*\\$15',
      label: 'Generic shuttle bus paragraph (copy-pasted to 70 ports)'
    },
    {
      id: 'generic_dock_or_anchor',
      pattern: 'Depending on the day.*ship count.*you may dock directly or anchor offshore',
      label: 'Generic dock-or-anchor paragraph (copy-pasted to 63 ports)'
    }
  ];

  const matches = [];

  for (const sig of TEMPLATE_SIGNATURES) {
    const re = new RegExp(sig.pattern, 'i');
    if (re.test(fullText)) {
      matches.push(sig);
    }
  }

  if (matches.length > 0) {
    errors.push({
      section: 'content_quality',
      rule: 'template_filler_detected',
      message: `Page contains ${matches.length} template filler block(s): ${matches.map(m => m.id).join(', ')}. These are identical generic paragraphs copy-pasted across dozens of ports. Replace with port-specific content or remove.`,
      severity: 'BLOCKING'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    data: {
      template_filler_count: matches.length,
      detected_signatures: matches.map(m => m.id)
    }
  };
}

// =============================================================================
// V1 PARITY CHECKS — ported from scripts/validate-port.js to enable deprecation
// =============================================================================

/**
 * Validate basic HTML structure (charset, viewport, title, main-content, skip-link)
 * Ported from validate-port.js validateBasicStructure()
 */
function validateBasicHTML($, html) {
  const errors = [];
  const warnings = [];

  if (!html.includes('<meta charset="')) {
    errors.push({ section: 'basic_html', rule: 'missing_charset', message: 'Missing <meta charset=""> tag', severity: 'BLOCKING' });
  }
  if (!html.includes('<meta name="viewport"')) {
    errors.push({ section: 'basic_html', rule: 'missing_viewport', message: 'Missing <meta name="viewport"> tag', severity: 'BLOCKING' });
  }
  if ($('title').length === 0 || $('title').text().trim() === '') {
    errors.push({ section: 'basic_html', rule: 'missing_title', message: 'Missing or empty <title> tag', severity: 'BLOCKING' });
  }
  if ($('#main-content').length === 0) {
    errors.push({ section: 'basic_html', rule: 'missing_main_content', message: 'Missing id="main-content" section', severity: 'BLOCKING' });
  }
  if (!html.includes('skip-link')) {
    warnings.push({ section: 'basic_html', rule: 'missing_skip_link', message: 'Missing skip link (recommended for accessibility)', severity: 'WARNING' });
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate tender port indicator against port-registry.json
 * Ported from validate-port.js validateTenderPortIndicator()
 * BLOCKING: tender ports MUST have indicator; non-tender ports MUST NOT
 */
function validateTenderPortIndicator($, filepath) {
  const errors = [];
  const warnings = [];

  const portSlug = basename(filepath, '.html');
  const registryPath = join(PROJECT_ROOT, 'assets', 'data', 'ports', 'port-registry.json');

  if (!existsSync(registryPath)) {
    warnings.push({ section: 'tender_port', rule: 'registry_not_found', message: 'Port registry not found, skipping tender port validation', severity: 'WARNING' });
    return { valid: true, errors, warnings };
  }

  try {
    const registryData = JSON.parse(readFileSync(registryPath, 'utf8'));
    const registry = registryData.ports || registryData;

    if (!registry[portSlug]) {
      return { valid: true, errors, warnings };
    }

    const portData = registry[portSlug];
    const isTenderPort = portData.tenderPort === true;
    const hasIndicator = $('.tender-port-indicator').length > 0;

    if (isTenderPort && !hasIndicator) {
      errors.push({ section: 'tender_port', rule: 'missing_tender_indicator', message: `BLOCKING: Port "${portData.name || portSlug}" is a tender port but MISSING tender-port-indicator element`, severity: 'BLOCKING' });
    } else if (!isTenderPort && hasIndicator) {
      errors.push({ section: 'tender_port', rule: 'false_tender_indicator', message: `Port "${portData.name || portSlug}" is NOT a tender port but has tender-port-indicator element`, severity: 'BLOCKING' });
    }

    if (isTenderPort && hasIndicator && !$('img[src*="tender-boat.svg"]').length) {
      warnings.push({ section: 'tender_port', rule: 'missing_tender_icon', message: 'Tender indicator missing tender-boat.svg icon', severity: 'WARNING' });
    }
  } catch (err) {
    warnings.push({ section: 'tender_port', rule: 'registry_parse_error', message: `Could not parse port registry: ${err.message}`, severity: 'WARNING' });
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate that all <img src> references resolve to files on disk
 * Ported from validate-port.js validateImages()
 * BLOCKING: hallucinated image paths must not pass validation
 */
function validateImageReferences($, filepath) {
  const errors = [];
  const warnings = [];
  const portDir = dirname(filepath);

  const imgSrcs = [];
  $('img').each((i, elem) => {
    const src = $(elem).attr('src');
    if (src) imgSrcs.push(src);
  });

  if (imgSrcs.length === 0) {
    warnings.push({ section: 'image_refs', rule: 'no_images', message: 'No images found in page', severity: 'WARNING' });
    return { valid: true, errors, warnings };
  }

  const missingImages = [];
  for (let srcPath of imgSrcs) {
    // Skip external URLs and data URIs
    if (srcPath.startsWith('http://') || srcPath.startsWith('https://') || srcPath.startsWith('data:')) {
      continue;
    }

    // Strip query strings (cache busting)
    const queryIndex = srcPath.indexOf('?');
    if (queryIndex > -1) srcPath = srcPath.substring(0, queryIndex);

    // Resolve path
    const resolvedPath = srcPath.startsWith('/')
      ? join(PROJECT_ROOT, srcPath)
      : join(portDir, srcPath);

    if (!existsSync(resolvedPath)) {
      missingImages.push(srcPath);
    }
  }

  if (missingImages.length > 0) {
    errors.push({
      section: 'image_refs',
      rule: 'missing_image_file',
      message: `${missingImages.length} image(s) referenced in HTML but not found on disk: ${missingImages.slice(0, 5).join(', ')}${missingImages.length > 5 ? ` (+${missingImages.length - 5} more)` : ''}`,
      severity: 'BLOCKING'
    });
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Run the weather sub-validator (validate-port-weather.js) as a subprocess
 * Ported from validate-port.js runSubValidator() pattern
 * BLOCKING: weather validator must pass with zero errors
 */
function validateWeatherSubValidator(filepath) {
  const errors = [];
  const warnings = [];

  const weatherScript = join(PROJECT_ROOT, 'scripts', 'validate-port-weather.js');
  if (!existsSync(weatherScript)) {
    warnings.push({ section: 'weather_sub', rule: 'weather_validator_not_found', message: 'Weather sub-validator script not found, skipping', severity: 'WARNING' });
    return { valid: true, errors, warnings };
  }

  try {
    const result = spawnSync('node', [weatherScript, filepath], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 30000
    });

    if (result.status !== 0) {
      errors.push({
        section: 'weather_sub',
        rule: 'weather_validation_failed',
        message: 'Weather sub-validator failed (BLOCKING) — run node scripts/validate-port-weather.js on this file for details',
        severity: 'BLOCKING'
      });
    }
  } catch (err) {
    warnings.push({ section: 'weather_sub', rule: 'weather_validator_error', message: `Weather sub-validator threw: ${err.message}`, severity: 'WARNING' });
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Run the POI coordinate validator for a specific port
 * BLOCKING: POIs in water indicate bad data that will mislead travelers
 *
 * Uses Nominatim reverse geocoding with 1.1s rate limiting per POI.
 * For a typical port (~8 POIs) this adds ~9 seconds.
 */
function validatePOICoordinates(filepath) {
  const errors = [];
  const warnings = [];

  const portSlug = basename(filepath, '.html');
  const poiScript = join(PROJECT_ROOT, 'admin', 'validate-poi-coordinates.js');

  if (!existsSync(poiScript)) {
    warnings.push({ section: 'poi_coords', rule: 'poi_validator_not_found', message: 'POI coordinate validator not found, skipping', severity: 'WARNING' });
    return { valid: true, errors, warnings };
  }

  // Check if this port has POIs before spawning (avoid unnecessary API calls)
  const poiIndexPath = join(PROJECT_ROOT, 'assets', 'data', 'maps', 'poi-index.json');
  if (!existsSync(poiIndexPath)) {
    return { valid: true, errors, warnings };
  }

  try {
    const poiIndex = JSON.parse(readFileSync(poiIndexPath, 'utf8'));
    const portPOIs = Object.entries(poiIndex)
      .filter(([key, val]) => key !== '_meta' && val.port === portSlug);

    if (portPOIs.length === 0) {
      return { valid: true, errors, warnings };
    }

    const result = spawnSync('node', [poiScript, `--port=${portSlug}`, '--no-report', '-q'], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 120000 // 2 minutes — generous for ports with many POIs
    });

    if (result.status !== 0) {
      errors.push({
        section: 'poi_coords',
        rule: 'poi_in_water',
        message: `POI coordinate validation failed for ${portSlug} (${portPOIs.length} POIs) — run: node admin/validate-poi-coordinates.js --port=${portSlug}`,
        severity: 'BLOCKING'
      });
    }
  } catch (err) {
    warnings.push({ section: 'poi_coords', rule: 'poi_validator_error', message: `POI validator threw: ${err.message}`, severity: 'WARNING' });
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate noscript fallbacks for JS-dependent features
 * Ref: admin/NOSCRIPT_REPAIR_GUIDE.md for repair procedures
 *
 * ICP-2 v2.1 Section E: "Key content must be in static HTML."
 * Pastoral mandate: site serves users on hospital WiFi, stripped browsers, NoScript.
 */
function validateNoscriptFallbacks($, html) {
  const errors = [];
  const warnings = [];

  // 1. Weather noscript — must have full static seasonal guide, not just "Enable JavaScript"
  const weatherWidget = $('#port-weather-widget');
  if (weatherWidget.length > 0) {
    const weatherNoscript = weatherWidget.find('noscript').html() || '';
    if (weatherNoscript.length === 0) {
      errors.push({
        section: 'noscript',
        rule: 'missing_weather_noscript',
        message: 'Weather widget has NO noscript fallback — noscript users see nothing. See: admin/NOSCRIPT_REPAIR_GUIDE.md §4',
        severity: 'BLOCKING'
      });
    } else if (!weatherNoscript.includes('seasonal-guide') && !weatherNoscript.includes('glance-label')) {
      warnings.push({
        section: 'noscript',
        rule: 'placeholder_weather_noscript',
        message: 'Weather noscript is just a placeholder ("Enable JavaScript") — should have full static seasonal guide. See: admin/NOSCRIPT_REPAIR_GUIDE.md §4',
        severity: 'WARNING'
      });
    }
  }

  // 2. Gallery noscript — swiper galleries must have static image fallback
  const swiperGallery = $('.swiper.gallery-swiper, .gallery-swiper');
  if (swiperGallery.length > 0) {
    const galleryNoscript = swiperGallery.find('noscript').length;
    if (galleryNoscript === 0) {
      warnings.push({
        section: 'noscript',
        rule: 'missing_gallery_noscript',
        message: 'Photo gallery has no noscript image fallback — noscript users see blank gallery. See: admin/NOSCRIPT_REPAIR_GUIDE.md §3',
        severity: 'WARNING'
      });
    }
  }

  // 3. Ships visiting noscript
  const shipsSection = $('.ships-visiting');
  if (shipsSection.length > 0) {
    const shipsNoscript = shipsSection.find('noscript').length;
    if (shipsNoscript === 0) {
      warnings.push({
        section: 'noscript',
        rule: 'missing_ships_noscript',
        message: 'Ships Visiting section has no noscript fallback — noscript users see empty section. See: admin/NOSCRIPT_REPAIR_GUIDE.md §1',
        severity: 'WARNING'
      });
    }
  }

  // 4. Recent stories noscript
  const recentRail = $('#recent-rail');
  if (recentRail.length > 0) {
    const railNoscript = recentRail.find('noscript').length;
    if (railNoscript === 0) {
      warnings.push({
        section: 'noscript',
        rule: 'missing_stories_noscript',
        message: 'Recent Stories rail has no noscript fallback — noscript users see empty section. See: admin/NOSCRIPT_REPAIR_GUIDE.md §2',
        severity: 'WARNING'
      });
    }
  }

  // 5. Map noscript — check for text-based location list, not just "Enable JavaScript"
  const mapContainer = $('[id$="-port-map"], .port-map-container');
  if (mapContainer.length > 0) {
    const mapNoscript = mapContainer.find('noscript').html() || '';
    if (mapNoscript.length > 0 && !mapNoscript.includes('<ul') && !mapNoscript.includes('<li')) {
      warnings.push({
        section: 'noscript',
        rule: 'placeholder_map_noscript',
        message: 'Map noscript is just a placeholder — should include text-based location list. See: admin/NOSCRIPT_REPAIR_GUIDE.md §5',
        severity: 'WARNING'
      });
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Run the mobile readiness validator as a subprocess
 * BLOCKING: pages must be mobile-responsive (viewport, touch targets, no overflow)
 */
function validateMobileReadinessSubValidator(filepath) {
  const errors = [];
  const warnings = [];

  const mobileScript = join(PROJECT_ROOT, 'admin', 'validate-mobile-readiness.js');
  if (!existsSync(mobileScript)) {
    warnings.push({ section: 'mobile_sub', rule: 'mobile_validator_not_found', message: 'Mobile readiness validator not found, skipping', severity: 'WARNING' });
    return { valid: true, errors, warnings };
  }

  try {
    const result = spawnSync('node', [mobileScript, filepath], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 30000
    });

    if (result.status === 1) {
      errors.push({
        section: 'mobile_sub',
        rule: 'mobile_validation_failed',
        message: 'Mobile readiness validation failed (BLOCKING) — run: node admin/validate-mobile-readiness.js <file> for details',
        severity: 'BLOCKING'
      });
    }
    // Exit code 2 = warnings only (not blocking)
  } catch (err) {
    warnings.push({ section: 'mobile_sub', rule: 'mobile_validator_error', message: `Mobile validator threw: ${err.message}`, severity: 'WARNING' });
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Run the recent articles/stories pattern validator as a subprocess
 * BLOCKING: Recent Rail must use dynamic pattern, not hardcoded links
 */
function validateRecentArticlesSubValidator(filepath) {
  const errors = [];
  const warnings = [];

  const articlesScript = join(PROJECT_ROOT, 'admin', 'validate-recent-articles.js');
  if (!existsSync(articlesScript)) {
    warnings.push({ section: 'articles_sub', rule: 'articles_validator_not_found', message: 'Recent articles validator not found, skipping', severity: 'WARNING' });
    return { valid: true, errors, warnings };
  }

  try {
    const result = spawnSync('node', [articlesScript, filepath], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 30000
    });

    if (result.status === 1) {
      errors.push({
        section: 'articles_sub',
        rule: 'recent_articles_validation_failed',
        message: 'Recent articles/stories pattern validation failed (BLOCKING) — run: node admin/validate-recent-articles.js <file> for details',
        severity: 'BLOCKING'
      });
    }
  } catch (err) {
    warnings.push({ section: 'articles_sub', rule: 'articles_validator_error', message: `Recent articles validator threw: ${err.message}`, severity: 'WARNING' });
  }

  return { valid: errors.length === 0, errors, warnings };
}

async function validatePortPage(filepath) {
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

    // Skip redirect pages (meta http-equiv="refresh")
    const isRedirect = $('meta[http-equiv="refresh"]').length > 0;
    if (isRedirect) {
      results.info.push({
        section: 'redirect',
        rule: 'redirect_page',
        message: 'Redirect page detected — validation skipped',
        severity: 'INFO'
      });
      return results;
    }

    // Skip port-specific validation for non-port pages (hub, regional-overview, scenic-passage, index)
    // These pages live in /ports/ but aren't individual port destinations.
    // Per orchestra review (GPT+Gemini+Grok): reclassify, don't force port validation.
    // Also supports data-page-type attribute on <body> (Issue #1384 — tender-ports.html)
    const bodyPageType = $('body').attr('data-page-type');
    const metaPageType = $('meta[name="page-type"]').attr('content');
    const pageType = bodyPageType || metaPageType || 'port';
    if (pageType !== 'port') {
      results.info.push({
        section: 'page_type',
        rule: 'non_port_page',
        message: `Non-port page (type: ${pageType}) — port-specific validation skipped. Basic checks only.`,
        severity: 'INFO'
      });
      // Run only basic checks: analytics, ICP, content purity
      const analyticsResult = validateAnalytics($, html);
      const icpResult = validateICPLite($, html);
      const portSlug = basename(filepath, '.html');
      const contentPurityResult = validateContentPurity($, portSlug);

      // Collect errors from basic checks only
      for (const result of [analyticsResult, icpResult, contentPurityResult]) {
        if (result.errors) {
          for (const e of result.errors) {
            if (e.severity === 'BLOCKING') {
              results.blocking_errors.push(e);
              results.score = Math.max(0, results.score - 10);
            }
          }
        }
        if (result.warnings) results.warnings.push(...result.warnings);
      }

      results.valid = results.blocking_errors.length === 0;
      results.icp_lite = icpResult.data;
      return results;
    }

    // Run all validations (port pages only)
    const analyticsResult = validateAnalytics($, html);
    const icpResult = validateICPLite($, html);
    const sectionResult = validateSectionOrder($);
    const wordResult = validateWordCounts($);
    const imageResult = validateImages($);
    const portImagesResult = await validatePortImages(filepath);
    const rubricResult = validateRubric($);
    const logbookResult = validateLogbookNarrative($);
    // Extract port slug from filepath (e.g., ports/rotorua.html → rotorua)
    const portSlug = basename(filepath, '.html');
    const contentPurityResult = validateContentPurity($, portSlug);
    const voiceQualityResult = validateVoiceQuality($('body').text());
    const uniqueNamesResult = validateUniqueNames($);
    const authorDisclaimerResult = validateAuthorDisclaimer($);
    const trustBadgeResult = validateTrustBadge($);
    const lastReviewedResult = validateLastReviewedStamp($);
    const collapsibleResult = validateCollapsibleStructure($);
    const fromThePierResult = validateFromThePier($);
    const emotionalHookResult = validateEmotionalHook($);
    const printButtonResult = validatePrintButton($, html);
    const siteIntegrationResult = await validateSiteIntegration(filepath);
    const htmlIntegrityResult = validateHTMLIntegrity($, html);

    // Dead link and pattern checks
    const internalLinksResult = validateInternalLinks($, filepath);
    const recentStoriesResult = validateRecentStoriesPattern($);

    // Content quality checks (Session 5 — Alaska sprint findings)
    const climateActivitiesResult = validateClimateActivities($, html);
    const duplicateSectionsResult = validateDuplicateSections($, html);
    const galleryCreditResult = validateGalleryCreditDiversity($);

    // Session 6 — structural quality checks
    const multipleH1Result = validateMultipleH1($);
    const noscriptWeatherResult = validateNoscriptWeather($, html);
    const genericAltResult = validateGenericAltText($);
    const relativePathsResult = validateRelativeImagePaths($);
    const orphanedFAQResult = validateOrphanedFAQQuestions($, html);

    // v3.010 standards cross-pollination checks
    const sidebarResult = validateSidebar($);
    const swiperFallbackResult = validateSwiperFallback($, html);
    const serviceWorkerResult = validateServiceWorker(html);
    const faqAnswerLengthResult = validateFAQAnswerLength($);
    const answerLineResult = validateAnswerLineKeyFacts($);
    const sdgPositionResult = validateSDGPosition(html);
    const canonicalResult = validateCanonicalURL($);
    const poiManifestResult = await validatePOIManifest(filepath);

    // Session 7 — Caribbean deep dive findings
    const weatherWidgetResult = validateWeatherWidget($);
    const jsonLdGeoResult = validateJsonLdGeoCoordinates($);
    const authorConsistencyResult = validateAuthorConsistency($);
    const mexicanNoticesResult = validateMexicanPortNotices($, html);
    const seasonalDataResult = validateSeasonalData($, html);

    // Session 12 — template filler detection
    const templateFillerResult = validateTemplateFiller($, html);

    // V1 parity checks — ported from scripts/validate-port.js
    const basicHTMLResult = validateBasicHTML($, html);
    const tenderPortResult = validateTenderPortIndicator($, filepath);
    const imageRefsResult = validateImageReferences($, filepath);
    const weatherSubResult = validateWeatherSubValidator(filepath);
    const poiCoordsResult = validatePOICoordinates(filepath);
    const mobileResult = validateMobileReadinessSubValidator(filepath);
    const articlesResult = validateRecentArticlesSubValidator(filepath);
    const noscriptResult = validateNoscriptFallbacks($, html);

    // Collect all errors
    results.blocking_errors.push(...siteIntegrationResult.errors);
    results.blocking_errors.push(...analyticsResult.errors);
    results.blocking_errors.push(...icpResult.errors);
    results.blocking_errors.push(...sectionResult.errors);
    results.blocking_errors.push(...wordResult.errors);
    results.blocking_errors.push(...imageResult.errors);
    results.blocking_errors.push(...portImagesResult.errors);
    results.blocking_errors.push(...rubricResult.errors);
    results.blocking_errors.push(...logbookResult.errors);
    results.blocking_errors.push(...contentPurityResult.errors);
    results.blocking_errors.push(...voiceQualityResult.errors);
    results.blocking_errors.push(...trustBadgeResult.errors);
    results.blocking_errors.push(...collapsibleResult.errors);
    results.blocking_errors.push(...printButtonResult.errors);
    results.blocking_errors.push(...htmlIntegrityResult.errors);
    results.blocking_errors.push(...internalLinksResult.errors);
    results.blocking_errors.push(...recentStoriesResult.errors);
    results.blocking_errors.push(...sidebarResult.errors);
    results.blocking_errors.push(...answerLineResult.errors);
    results.blocking_errors.push(...sdgPositionResult.errors);
    results.blocking_errors.push(...canonicalResult.errors);
    results.blocking_errors.push(...multipleH1Result.errors);
    results.blocking_errors.push(...weatherWidgetResult.errors);
    results.blocking_errors.push(...jsonLdGeoResult.errors);
    results.blocking_errors.push(...seasonalDataResult.errors);
    results.blocking_errors.push(...templateFillerResult.errors);
    results.blocking_errors.push(...basicHTMLResult.errors);
    results.blocking_errors.push(...tenderPortResult.errors);
    results.blocking_errors.push(...imageRefsResult.errors);
    results.blocking_errors.push(...weatherSubResult.errors);
    results.blocking_errors.push(...poiCoordsResult.errors);
    results.blocking_errors.push(...mobileResult.errors);
    results.blocking_errors.push(...articlesResult.errors);
    results.blocking_errors.push(...noscriptResult.errors);

    // Collect all warnings
    results.warnings.push(...analyticsResult.warnings);
    results.warnings.push(...icpResult.warnings);
    results.warnings.push(...sectionResult.warnings);
    results.warnings.push(...wordResult.warnings);
    results.warnings.push(...imageResult.warnings);
    results.warnings.push(...portImagesResult.warnings);
    results.warnings.push(...rubricResult.warnings);
    results.warnings.push(...logbookResult.warnings);
    results.warnings.push(...contentPurityResult.warnings);
    results.warnings.push(...voiceQualityResult.warnings);
    results.warnings.push(...uniqueNamesResult.warnings);
    results.warnings.push(...authorDisclaimerResult.warnings);
    results.warnings.push(...lastReviewedResult.warnings);
    results.warnings.push(...fromThePierResult.warnings);
    results.warnings.push(...emotionalHookResult.warnings);
    results.warnings.push(...printButtonResult.warnings);
    results.warnings.push(...htmlIntegrityResult.warnings);
    results.warnings.push(...internalLinksResult.warnings);
    results.warnings.push(...recentStoriesResult.warnings);
    results.warnings.push(...sidebarResult.warnings);
    results.warnings.push(...swiperFallbackResult.warnings);
    results.warnings.push(...serviceWorkerResult.warnings);
    results.warnings.push(...faqAnswerLengthResult.warnings);
    results.warnings.push(...sdgPositionResult.warnings);
    results.warnings.push(...poiManifestResult.warnings);
    results.warnings.push(...climateActivitiesResult.warnings);
    results.warnings.push(...duplicateSectionsResult.warnings);
    results.warnings.push(...galleryCreditResult.warnings);
    results.warnings.push(...multipleH1Result.warnings);
    results.warnings.push(...noscriptWeatherResult.warnings);
    results.warnings.push(...genericAltResult.warnings);
    results.warnings.push(...relativePathsResult.warnings);
    results.warnings.push(...orphanedFAQResult.warnings);
    results.warnings.push(...weatherWidgetResult.warnings);
    results.warnings.push(...jsonLdGeoResult.warnings);
    results.warnings.push(...authorConsistencyResult.warnings);
    results.warnings.push(...mexicanNoticesResult.warnings);
    results.warnings.push(...seasonalDataResult.warnings);
    results.warnings.push(...templateFillerResult.warnings);
    results.warnings.push(...basicHTMLResult.warnings);
    results.warnings.push(...tenderPortResult.warnings);
    results.warnings.push(...imageRefsResult.warnings);
    results.warnings.push(...weatherSubResult.warnings);
    results.warnings.push(...poiCoordsResult.warnings);
    results.warnings.push(...mobileResult.warnings);
    results.warnings.push(...articlesResult.warnings);
    results.warnings.push(...noscriptResult.warnings);

    // Gold standard gap detection (only included with --gold-standard flag)
    // Per orchestra: separate mode to avoid alert fatigue on the 100% pass rate
    const goldStandardResult = validateGoldStandard($, html);
    results.gold_standard_gaps = goldStandardResult.warnings;

    // Collect info
    results.info.push(...logbookResult.info);
    if (contentPurityResult.info) results.info.push(...contentPurityResult.info);
    if (voiceQualityResult.info) results.info.push(...voiceQualityResult.info);

    // Calculate score (start at 100, deduct for errors/warnings)
    results.score = 100;
    results.score -= results.blocking_errors.length * 10;
    results.score -= results.warnings.length * 2;
    results.score = Math.max(0, results.score);

    results.valid = results.blocking_errors.length === 0;

    // Add detailed results
    results.analytics = analyticsResult.data;
    results.icp_lite = icpResult.data;
    results.section_order = {
      valid: sectionResult.valid,
      detected_order: sectionResult.detected_order,
      missing_sections: sectionResult.missing_sections,
      out_of_order_sections: sectionResult.out_of_order_sections
    };
    results.word_counts = wordResult.counts;
    results.images = imageResult.counts;
    results.port_images = portImagesResult.data;
    results.rubric = rubricResult.data;
    results.logbook_narrative = logbookResult.data;
    results.content_purity = contentPurityResult.data;
    results.voice_quality = voiceQualityResult.data;
    results.unique_names = uniqueNamesResult.data;
    results.from_the_pier = fromThePierResult.data;
    results.emotional_hook = emotionalHookResult.data;
    results.print_button = printButtonResult.data;
    results.internal_links = internalLinksResult.data;
    results.recent_stories = recentStoriesResult.data;
    results.site_integration = siteIntegrationResult.data;
    results.html_integrity = htmlIntegrityResult.data;
    results.sidebar = sidebarResult.data;
    results.swiper_fallback = swiperFallbackResult.data;
    results.service_worker = serviceWorkerResult.data;
    results.faq_answer_length = faqAnswerLengthResult.data;
    results.answer_line_key_facts = answerLineResult.data;
    results.sdg_position = sdgPositionResult.data;
    results.canonical = canonicalResult.data;
    results.poi_manifest = poiManifestResult.data;
    results.weather_widget = weatherWidgetResult.data;
    results.jsonld_geo = jsonLdGeoResult.data;
    results.author_consistency = authorConsistencyResult.data;
    results.mexican_notices = mexicanNoticesResult.data;
    results.seasonal_data = seasonalDataResult.data;
    results.template_filler = templateFillerResult.data;

    // Check for unfilled generator markers (<!-- FILL --> tags that should have been replaced)
    const fillMarkers = (html.match(/<!-- FILL[^>]*-->/gi) || []).length;
    if (fillMarkers > 0) {
      results.blocking_errors.push({
        section: 'content_quality',
        rule: 'unfilled_template_markers',
        message: `Page has ${fillMarkers} unfilled <!-- FILL --> marker(s) from template generator. All markers must be replaced with real content before publishing.`,
        severity: 'BLOCKING'
      });
      results.score = Math.max(0, results.score - fillMarkers * 5);
    }

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

  console.log(`\n${colors.bold}${colors.cyan}Port Page Validation Report - ITC v1.1 + LOGBOOK_ENTRY_STANDARDS v2.300${colors.reset}`);
  console.log('═'.repeat(90));
  console.log();

  console.log(`${colors.bold}File:${colors.reset} ${results.file}`);

  const scoreColor = results.score >= 90 ? colors.green : results.score >= 70 ? colors.yellow : colors.red;
  console.log(`${colors.bold}Score:${colors.reset} ${scoreColor}${results.score}/100${colors.reset}`);
  console.log(`${colors.bold}Status:${colors.reset} ${results.valid ? colors.green + '✓ PASS' : colors.red + '✗ FAIL'} ${colors.reset}`);
  console.log();

  if (results.blocking_errors.length > 0) {
    console.log(`${colors.red}${colors.bold}BLOCKING ERRORS (${results.blocking_errors.length}):${colors.reset}`);
    results.blocking_errors.forEach((err, i) => {
      console.log(`${colors.red}  ${i+1}. [${err.section}/${err.rule}]${colors.reset} ${err.message}`);
    });
    console.log();
  }

  if (results.warnings.length > 0) {
    console.log(`${colors.yellow}${colors.bold}WARNINGS (${results.warnings.length}):${colors.reset}`);
    results.warnings.forEach((warn, i) => {
      console.log(`${colors.yellow}  ${i+1}. [${warn.section}/${warn.rule}]${colors.reset} ${warn.message}`);
    });
    console.log();
  }

  if (results.info.length > 0) {
    console.log(`${colors.blue}${colors.bold}INFO (${results.info.length}):${colors.reset}`);
    results.info.forEach((item, i) => {
      console.log(`${colors.blue}  ${i+1}. [${item.section}/${item.rule}]${colors.reset} ${item.message}`);
    });
    console.log();
  }

  if (!options.quiet) {
    console.log(`${colors.bold}ICP-Lite Details:${colors.reset}`);
    console.log(`  Protocol: ${results.icp_lite?.protocol_version || 'N/A'}`);
    console.log(`  AI Summary: ${results.icp_lite?.ai_summary_length || 0} chars`);
    console.log(`  Last Reviewed: ${results.icp_lite?.last_reviewed || 'N/A'}`);
    console.log();

    console.log(`${colors.bold}Word Counts:${colors.reset}`);
    console.log(`  Logbook: ${results.word_counts?.logbook || 0}`);
    console.log(`  Cruise Port: ${results.word_counts?.cruise_port || 0}`);
    console.log(`  Getting Around: ${results.word_counts?.getting_around || 0}`);
    console.log(`  Excursions: ${results.word_counts?.excursions || 0}`);
    console.log(`  Depth Soundings: ${results.word_counts?.depth_soundings || 0}`);
    console.log(`  FAQ: ${results.word_counts?.faq || 0}`);
    console.log(`  Total: ${results.word_counts?.total || 0}`);
    console.log();

    console.log(`${colors.bold}Images:${colors.reset}`);
    console.log(`  Total: ${results.images?.total_images || 0}`);
    console.log(`  Missing Alt: ${results.images?.missing_alt || 0}`);
    console.log(`  Missing Credits: ${results.images?.missing_credits || 0}`);
    console.log();

    console.log(`${colors.bold}Rubric (Four Pillars):${colors.reset}`);
    console.log(`  First-Person Count: ${results.rubric?.first_person_count || 0}`);
    console.log(`  Contrast Words: ${results.rubric?.contrast_count || 0}`);
    console.log(`  Accessibility Mentions: ${results.rubric?.accessibility_mentions || 0}`);
    console.log(`  Price Mentions: ${results.rubric?.price_mentions || 0}`);
    console.log(`  Booking Keywords: ${results.rubric?.booking_keywords || 0}`);
    console.log();

    console.log(`${colors.bold}${colors.magenta}Logbook Narrative Analysis:${colors.reset}`);
    console.log(`  First-Person Pronouns: ${results.logbook_narrative?.first_person_pronouns || 0}`);
    console.log(`  Pronouns per 100 words: ${results.logbook_narrative?.pronouns_per_100_words || 0}`);
    console.log(`  Emotional Pivot Markers: ${results.logbook_narrative?.emotional_pivot_markers || 0}`);
    console.log(`  Senses Used: ${results.logbook_narrative?.senses_used?.join(', ') || 'none'}`);
    console.log(`  Has Reflection: ${results.logbook_narrative?.has_reflection ? 'Yes' : 'No'}`);
    console.log(`  Contrast Words: ${results.logbook_narrative?.contrast_words || 0}`);
    console.log(`  Spiritual Markers: ${results.logbook_narrative?.spiritual_markers || 0}`);
    console.log(`  Has Bullet Lists: ${results.logbook_narrative?.has_bullet_lists ? 'Yes (warning)' : 'No'}`);
    console.log(`  Forbidden Patterns: ${results.logbook_narrative?.forbidden_patterns_found || 0}`);
    console.log();

    console.log(`${colors.bold}Content Purity (Reformed Baptist Voice):${colors.reset}`);
    console.log(`  Violations Found: ${results.content_purity?.violations_found || 0}`);
    console.log(`  Stewardship Markers: ${results.content_purity?.stewardship_markers || 0}`);
    console.log(`  Stamina Level Mentions: ${results.content_purity?.stamina_level_mentions || 0}`);
    if (results.unique_names?.names_found?.length > 0) {
      console.log(`  Persona Names Detected: ${results.unique_names.names_found.join(', ')}`);
    }
    console.log();

    console.log(`${colors.bold}Voice Quality (Like-a-Human):${colors.reset}`);
    if (results.voice_quality?.skipped) {
      console.log(`  Skipped (${results.voice_quality.wordCount} words — below threshold)`);
    } else {
      console.log(`  Promotional Drift (V01): ${results.voice_quality?.promotional_drift || 0}`);
      console.log(`  AI Chorus (V02): ${results.voice_quality?.ai_chorus || 0}`);
      console.log(`  Authority Violations (V03): ${results.voice_quality?.authority_violations || 0}`);
      console.log(`  Window Pane (V04): ${results.voice_quality?.window_pane_violations || 0}`);
      console.log(`  Warmth Violations (V05): ${results.voice_quality?.warmth_violations || 0}`);
      console.log(`  Corporate Filler (V06): ${results.voice_quality?.corporate_filler || 0}`);
      console.log(`  Authenticity Risk (V07): ${results.voice_quality?.authenticity_risk || 'low'}`);
      if (results.voice_quality?.authenticity_signals?.length > 0) {
        for (const signal of results.voice_quality.authenticity_signals) {
          console.log(`    → ${signal}`);
        }
      }
      console.log(`  Authority Positive (V08): ${results.voice_quality?.authority_positive ? 'needs more concrete details' : 'ok'}`);
      console.log(`  Fairness Balance (V09): ${results.voice_quality?.fairness_balance ? 'absolutes outweigh context' : 'ok'}`);
      console.log(`  Total Findings: ${results.voice_quality?.totalFindings || 0}`);
    }
    console.log();

    console.log(`${colors.bold}Sections:${colors.reset}`);
    console.log(`  Detected: ${results.section_order?.detected_order?.join(', ') || 'none'}`);
    if (results.section_order?.missing_sections?.length > 0) {
      console.log(`  ${colors.red}Missing: ${results.section_order.missing_sections.join(', ')}${colors.reset}`);
    }
    if (results.section_order?.out_of_order_sections?.length > 0) {
      console.log(`  ${colors.yellow}Out of Order: ${results.section_order.out_of_order_sections.join(', ')}${colors.reset}`);
    }
    console.log();
  }

  console.log('═'.repeat(90));
  console.log();

  return results.valid;
}

/**
 * Main execution
 */
/**
 * Gold standard gap detection — quality checks beyond ITC v1.1 requirements
 * Based on comparison against dubai.html (score 96, 16 images, 15 h2s, 3686 words)
 * Per orchestra review: 4 checks as warnings, separate --gold-standard mode
 */
function validateGoldStandard($, html) {
  const warnings = [];

  // 1. Missing content sections (food, notices, practical, credits)
  // These aren't required by ITC v1.1 but the best pages have them
  const qualitySections = {
    food: /\bfood\b|\bdining\b|\brestaurants?\b|\bcuisine\b/i,
    notices: /(special )?notices?|warnings?|alerts?|important|know before/i,
    practical: /practical (information|info)|quick reference|at a glance|summary/i,
    credits: /(image |photo )?credits?|attributions?|photo sources?/i,
  };
  const missingSections = [];
  for (const [name, pattern] of Object.entries(qualitySections)) {
    const found = $('h2, h3').toArray().some(el => pattern.test($(el).text()));
    const foundById = $(`#${name}, [id="${name}"]`).length > 0;
    if (!found && !foundById) missingSections.push(name);
  }
  if (missingSections.length > 0) {
    warnings.push({
      section: 'gold_standard',
      rule: 'gs_missing_quality_sections',
      message: `Gold standard gap: missing quality sections: ${missingSections.join(', ')}`,
      severity: 'WARNING'
    });
  }

  // 2. Missing photo credits in gallery images
  const galleryImages = $('figure img, .gallery-item img, .gallery-grid img');
  let missingCredits = 0;
  galleryImages.each((i, el) => {
    const figure = $(el).closest('figure');
    if (figure.length && !figure.find('.photo-credit').length) missingCredits++;
  });
  if (missingCredits > 0) {
    warnings.push({
      section: 'gold_standard',
      rule: 'gs_missing_photo_credits',
      message: `Gold standard gap: ${missingCredits} gallery image(s) without photo-credit attribution`,
      severity: 'WARNING'
    });
  }

  // 3. Missing breadcrumb navigation
  if (!$('nav[aria-label="Breadcrumb"], [aria-label="Breadcrumb"]').length) {
    warnings.push({
      section: 'gold_standard',
      rule: 'gs_missing_breadcrumb',
      message: 'Gold standard gap: missing breadcrumb navigation (aria-label="Breadcrumb")',
      severity: 'WARNING'
    });
  }

  // 4. Missing Twitter Card meta tags
  if (!$('meta[name="twitter:card"]').length) {
    warnings.push({
      section: 'gold_standard',
      rule: 'gs_missing_twitter_cards',
      message: 'Gold standard gap: missing Twitter Card meta tags',
      severity: 'WARNING'
    });
  }

  return { warnings };
}

async function main() {
  const args = process.argv.slice(2);

  const options = {
    allPorts: args.includes('--all-ports'),
    goldStandard: args.includes('--gold-standard'),
    jsonOutput: args.includes('--json-output'),
    quiet: args.includes('--quiet'),
    files: args.filter(arg => !arg.startsWith('--'))
  };

  let filesToValidate = [];

  if (options.allPorts) {
    const pattern = join(PROJECT_ROOT, 'ports', '*.html');
    filesToValidate = await glob(pattern);
  } else if (options.files.length > 0) {
    filesToValidate = options.files.map(f =>
      f.startsWith('/') ? f : join(PROJECT_ROOT, f)
    );
  } else {
    console.error('Usage: validate-port-page-v2.js [options] [files...]');
    console.error('Options:');
    console.error('  --all-ports    Validate all port pages');
    console.error('  --json-output  Output results as JSON');
    console.error('  --quiet        Minimal output');
    console.error('');
    console.error('Validates against:');
    console.error('  - PORT-PAGE-STANDARD.md (ITC v1.1)');
    console.error('  - LOGBOOK_ENTRY_STANDARDS_v2.300.md');
    console.error('  - ICP-Lite v1.4 Protocol');
    process.exit(1);
  }

  if (filesToValidate.length === 0) {
    console.error('No files to validate');
    process.exit(1);
  }

  if (filesToValidate.length === 1) {
    const result = await validatePortPage(filesToValidate[0]);
    const valid = printResults(result, options);
    process.exit(valid ? 0 : 1);
  } else {
    const results = [];
    for (const file of filesToValidate) {
      const result = await validatePortPage(file);
      results.push(result);
    }

    if (options.jsonOutput) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      console.log(`\n${colors.bold}${colors.cyan}Batch Validation Report - ITC v1.1 + LOGBOOK_ENTRY_STANDARDS v2.300${colors.reset}`);
      console.log('═'.repeat(90));

      let passed = 0;
      let failed = 0;

      results.forEach(r => {
        const status = r.valid ? colors.green + '✓' : colors.red + '✗';
        const score = r.score >= 90 ? colors.green : r.score >= 70 ? colors.yellow : colors.red;
        console.log(`${status} ${colors.reset}${r.file} ${score}[${r.score}]${colors.reset} ${r.blocking_errors.length} errors, ${r.warnings.length} warnings`);

        if (r.valid) passed++;
        else failed++;
      });

      console.log('═'.repeat(90));
      console.log(`Total: ${results.length} | ${colors.green}Passed: ${passed}${colors.reset} | ${colors.red}Failed: ${failed}${colors.reset}`);

      // Gold standard report (only with --gold-standard flag)
      if (options.goldStandard) {
        const gsResults = results.filter(r => r.gold_standard_gaps && r.gold_standard_gaps.length > 0);
        console.log();
        console.log(`${colors.bold}${colors.magenta}Gold Standard Gaps (vs dubai.html)${colors.reset}`);
        console.log('─'.repeat(90));
        let totalGaps = 0;
        for (const r of gsResults) {
          totalGaps += r.gold_standard_gaps.length;
          console.log(`  ${r.file}: ${r.gold_standard_gaps.length} gap(s)`);
          for (const g of r.gold_standard_gaps) {
            console.log(`    ${colors.yellow}⚠${colors.reset} ${g.message}`);
          }
        }
        console.log('─'.repeat(90));
        console.log(`  Gold standard: ${gsResults.length}/${results.length} pages have gaps (${totalGaps} total)`);
        console.log(`  Pages matching gold standard: ${results.length - gsResults.length}`);
      }
      console.log();
    }

    const allValid = results.every(r => r.valid);
    process.exit(allValid ? 0 : 1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
  });
}

export { validatePortPage };
