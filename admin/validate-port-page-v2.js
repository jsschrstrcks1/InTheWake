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

import { readFile } from 'fs/promises';
import { join, dirname, relative } from 'path';
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

// Expected section order (ITC v1.1)
const EXPECTED_MAIN_ORDER = [
  'hero', 'logbook', 'featured_images', 'cruise_port', 'getting_around',
  'map', 'beaches', 'excursions', 'history', 'cultural', 'shopping',
  'food', 'notices', 'depth_soundings', 'practical', 'faq', 'gallery',
  'credits', 'back_nav'
];

// Required sections (cannot be skipped)
const REQUIRED_SECTIONS = [
  'hero', 'logbook', 'cruise_port', 'getting_around', 'excursions',
  'depth_soundings', 'faq', 'gallery'
];

// Sections that MUST be collapsible
const COLLAPSIBLE_REQUIRED = [
  'logbook', 'cruise_port', 'getting_around', 'excursions',
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
  $('h2, h3').each((i, elem) => {
    const $elem = $(elem);
    if (pattern.test($elem.text())) {
      const $section = $elem.closest('section, details, .card');
      if ($section.length) {
        sectionContent += $section.text() + ' ';
      } else {
        let $next = $elem.next();
        while ($next.length && !$next.is('h2')) {
          sectionContent += $next.text() + ' ';
          $next = $next.next();
        }
      }
    }
  });
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
 * Validate ICP-Lite v1.4 compliance
 */
function validateICPLite($, html) {
  const errors = [];
  const warnings = [];
  const info = [];

  const aiSummary = $('meta[name="ai-summary"]').attr('content') || '';
  const lastReviewed = $('meta[name="last-reviewed"]').attr('content') || '';
  const protocol = $('meta[name="content-protocol"]').attr('content') || '';

  if (protocol !== 'ICP-Lite v1.4') {
    errors.push({
      section: 'icp_lite',
      rule: 'protocol_version',
      message: `Invalid content-protocol. Expected "ICP-Lite v1.4", found "${protocol}"`,
      severity: 'BLOCKING'
    });
  }

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
  } else if (aiSummary.length < 150) {
    warnings.push({
      section: 'icp_lite',
      rule: 'ai_summary_length',
      message: `ai-summary is short (${aiSummary.length} chars), recommended 150-250`,
      severity: 'WARNING'
    });
  }

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

  const jsonldScripts = $('script[type="application/ld+json"]');
  let hasWebPage = false;
  let hasFAQPage = false;
  let hasBreadcrumbs = false;
  let webPageDateModified = '';
  let webPageDescription = '';
  let hasMainEntity = false;

  jsonldScripts.each((i, elem) => {
    try {
      const content = $(elem).html();
      const data = JSON.parse(content);

      if (data['@type'] === 'WebPage') {
        hasWebPage = true;
        webPageDateModified = data.dateModified || '';
        webPageDescription = data.description || '';
        hasMainEntity = !!data.mainEntity;
      }
      if (data['@type'] === 'FAQPage') {
        hasFAQPage = true;
      }
      if (data['@type'] === 'BreadcrumbList') {
        hasBreadcrumbs = true;
      }
    } catch (e) {
      errors.push({
        section: 'icp_lite',
        rule: 'jsonld_parse',
        message: `Failed to parse JSON-LD script: ${e.message}`,
        severity: 'BLOCKING'
      });
    }
  });

  if (!hasWebPage) {
    errors.push({
      section: 'icp_lite',
      rule: 'missing_webpage',
      message: 'Missing WebPage JSON-LD schema',
      severity: 'BLOCKING'
    });
  }
  if (!hasFAQPage) {
    errors.push({
      section: 'icp_lite',
      rule: 'missing_faqpage',
      message: 'Missing FAQPage JSON-LD schema',
      severity: 'BLOCKING'
    });
  }
  if (!hasBreadcrumbs) {
    errors.push({
      section: 'icp_lite',
      rule: 'missing_breadcrumbs',
      message: 'Missing BreadcrumbList JSON-LD schema',
      severity: 'BLOCKING'
    });
  }

  if (!hasMainEntity) {
    errors.push({
      section: 'icp_lite',
      rule: 'missing_mainentity',
      message: 'WebPage JSON-LD must have mainEntity of type "Place" for port pages',
      severity: 'BLOCKING'
    });
  }

  if (webPageDateModified !== lastReviewed) {
    errors.push({
      section: 'icp_lite',
      rule: 'datemodified_mismatch',
      message: `WebPage dateModified (${webPageDateModified}) must match last-reviewed (${lastReviewed})`,
      severity: 'BLOCKING'
    });
  }

  const normalizedSummary = aiSummary.replace(/\s+/g, ' ').trim();
  const normalizedDescription = webPageDescription.replace(/\s+/g, ' ').trim();
  if (normalizedDescription !== normalizedSummary) {
    errors.push({
      section: 'icp_lite',
      rule: 'description_mismatch',
      message: 'WebPage description must match ai-summary meta tag',
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

    const creditLink = heroSection.find('a[href*="commons.wikimedia.org"], a[href*="wikimedia"]');
    if (!creditLink.length) {
      errors.push({
        section: 'hero',
        rule: 'hero_missing_wikimedia_credit',
        message: 'Hero image must include Wikimedia Commons credit link',
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
  $('main h2, main h3, main section, main div[id], main div[class*="section"]').each((i, elem) => {
    const $elem = $(elem);
    const $clone = $elem.clone();
    $clone.find('noscript').remove();
    const text = $clone.text().toLowerCase();
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
  const accessibilityMentions = accessibilityKeywords.filter(kw => fullText.includes(kw));

  if (accessibilityMentions.length < 2) {
    errors.push({
      section: 'rubric',
      rule: 'accessibility_notes',
      message: `Only ${accessibilityMentions.length} accessibility keywords found, minimum is 2`,
      severity: 'BLOCKING'
    });
  }

  const priceMatches = fullText.match(/\$\d+|€\d+|\b(price|cost|fee|fare)\b/gi) || [];
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
  const bookingMentions = bookingKeywords.filter(kw => excursionsText.toLowerCase().includes(kw));

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
function validateContentPurity($) {
  const errors = [];
  const warnings = [];
  const info = [];

  const fullText = $('body').text();
  const violations = [];

  // Check for forbidden content
  for (const ban of CONTENT_PURITY_BANS) {
    const matches = fullText.match(ban.pattern);
    if (matches) {
      violations.push({
        category: ban.category,
        match: matches[0]
      });
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
      message: 'Missing trust badge in footer. Expected: <p class="trust-badge">✓ No ads. No tracking. No affiliate links.</p>',
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

    // Run all validations
    const icpResult = validateICPLite($, html);
    const sectionResult = validateSectionOrder($);
    const wordResult = validateWordCounts($);
    const imageResult = validateImages($);
    const rubricResult = validateRubric($);
    const logbookResult = validateLogbookNarrative($);
    const contentPurityResult = validateContentPurity($);
    const uniqueNamesResult = validateUniqueNames($);
    const authorDisclaimerResult = validateAuthorDisclaimer($);
    const trustBadgeResult = validateTrustBadge($);
    const lastReviewedResult = validateLastReviewedStamp($);
    const collapsibleResult = validateCollapsibleStructure($);

    // Collect all errors
    results.blocking_errors.push(...icpResult.errors);
    results.blocking_errors.push(...sectionResult.errors);
    results.blocking_errors.push(...wordResult.errors);
    results.blocking_errors.push(...imageResult.errors);
    results.blocking_errors.push(...rubricResult.errors);
    results.blocking_errors.push(...logbookResult.errors);
    results.blocking_errors.push(...contentPurityResult.errors);
    results.blocking_errors.push(...trustBadgeResult.errors);
    results.blocking_errors.push(...collapsibleResult.errors);

    // Collect all warnings
    results.warnings.push(...icpResult.warnings);
    results.warnings.push(...sectionResult.warnings);
    results.warnings.push(...wordResult.warnings);
    results.warnings.push(...imageResult.warnings);
    results.warnings.push(...rubricResult.warnings);
    results.warnings.push(...logbookResult.warnings);
    results.warnings.push(...contentPurityResult.warnings);
    results.warnings.push(...uniqueNamesResult.warnings);
    results.warnings.push(...authorDisclaimerResult.warnings);
    results.warnings.push(...lastReviewedResult.warnings);

    // Collect info
    results.info.push(...logbookResult.info);
    if (contentPurityResult.info) results.info.push(...contentPurityResult.info);

    // Calculate score (start at 100, deduct for errors/warnings)
    results.score = 100;
    results.score -= results.blocking_errors.length * 10;
    results.score -= results.warnings.length * 2;
    results.score = Math.max(0, results.score);

    results.valid = results.blocking_errors.length === 0;

    // Add detailed results
    results.icp_lite = icpResult.data;
    results.section_order = {
      valid: sectionResult.valid,
      detected_order: sectionResult.detected_order,
      missing_sections: sectionResult.missing_sections,
      out_of_order_sections: sectionResult.out_of_order_sections
    };
    results.word_counts = wordResult.counts;
    results.images = imageResult.counts;
    results.rubric = rubricResult.data;
    results.logbook_narrative = logbookResult.data;
    results.content_purity = contentPurityResult.data;
    results.unique_names = uniqueNamesResult.data;

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
async function main() {
  const args = process.argv.slice(2);

  const options = {
    allPorts: args.includes('--all-ports'),
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
