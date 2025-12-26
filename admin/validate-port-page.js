#!/usr/bin/env node
/**
 * Port Page Validator - ITC v1.0
 * Soli Deo Gloria
 *
 * Comprehensive validator for port pages following the Port Page Standard.
 * Validates: section ordering, word counts, images, cross-links, ICP-Lite v1.4, rubric compliance
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
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

// Section patterns for fuzzy matching
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

// Expected section order
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

  // Check ai-summary length
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

  // Check last-reviewed format
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

  // Extract JSON-LD
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

  // Check required JSON-LD schemas
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

  // Check mainEntity for port pages (entity pages)
  if (!hasMainEntity) {
    errors.push({
      section: 'icp_lite',
      rule: 'missing_mainentity',
      message: 'WebPage JSON-LD must have mainEntity of type "Place" for port pages',
      severity: 'BLOCKING'
    });
  }

  // Check JSON-LD mirroring
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
 * Validate section ordering
 */
function validateSectionOrder($) {
  const errors = [];
  const warnings = [];
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

  // Check for missing required sections
  const missingSections = REQUIRED_SECTIONS.filter(s => !detectedSections.includes(s));
  if (missingSections.length > 0) {
    errors.push({
      section: 'section_order',
      rule: 'missing_required_sections',
      message: `Missing required sections: ${missingSections.join(', ')}`,
      severity: 'BLOCKING'
    });
  }

  // Check section order
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
 * Validate word counts
 */
function validateWordCounts($) {
  const errors = [];
  const warnings = [];

  // Helper to find section by pattern
  const findSection = (pattern) => {
    let sectionContent = '';
    $('h2, h3').each((i, elem) => {
      const $elem = $(elem);
      if (pattern.test($elem.text())) {
        // Get all content until next h2
        let $next = $elem.next();
        while ($next.length && !$next.is('h2')) {
          sectionContent += $next.text() + ' ';
          $next = $next.next();
        }
      }
    });
    return sectionContent;
  };

  // Check logbook entry (800-2500 words)
  const logbookText = findSection(SECTION_PATTERNS.logbook);
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

  // Check cruise port section (100-400 words)
  const portText = findSection(SECTION_PATTERNS.cruise_port);
  const portWords = countWords(portText);
  if (portWords < 100) {
    errors.push({
      section: 'word_counts',
      rule: 'cruise_port_minimum',
      message: `Cruise port section has ${portWords} words, minimum is 100`,
      severity: 'BLOCKING'
    });
  }

  // Check getting around (200-600 words)
  const gettingAroundText = findSection(SECTION_PATTERNS.getting_around);
  const gettingAroundWords = countWords(gettingAroundText);
  if (gettingAroundWords < 200) {
    errors.push({
      section: 'word_counts',
      rule: 'getting_around_minimum',
      message: `Getting Around section has ${gettingAroundWords} words, minimum is 200`,
      severity: 'BLOCKING'
    });
  }

  // Check excursions (400-1200 words)
  const excursionsText = findSection(SECTION_PATTERNS.excursions);
  const excursionsWords = countWords(excursionsText);
  if (excursionsWords < 400) {
    errors.push({
      section: 'word_counts',
      rule: 'excursions_minimum',
      message: `Excursions section has ${excursionsWords} words, minimum is 400`,
      severity: 'BLOCKING'
    });
  }

  // Check depth soundings (150-500 words)
  const depthText = findSection(SECTION_PATTERNS.depth_soundings);
  const depthWords = countWords(depthText);
  if (depthWords < 150) {
    errors.push({
      section: 'word_counts',
      rule: 'depth_soundings_minimum',
      message: `Depth Soundings section has ${depthWords} words, minimum is 150`,
      severity: 'BLOCKING'
    });
  }

  // Check FAQ (200+ words total)
  const faqText = findSection(SECTION_PATTERNS.faq);
  const faqWords = countWords(faqText);
  if (faqWords < 200) {
    errors.push({
      section: 'word_counts',
      rule: 'faq_minimum',
      message: `FAQ section has ${faqWords} words, minimum is 200`,
      severity: 'BLOCKING'
    });
  }

  // Total page word count (2000-6000 words)
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
 * Validate image requirements
 */
function validateImages($) {
  const errors = [];
  const warnings = [];

  const allImages = $('img');
  const imageCount = allImages.length;

  // Minimum 11 images
  if (imageCount < 11) {
    errors.push({
      section: 'images',
      rule: 'minimum_images',
      message: `Page has ${imageCount} images, minimum is 11`,
      severity: 'BLOCKING'
    });
  }

  // Maximum 25 images (warning)
  if (imageCount > 25) {
    warnings.push({
      section: 'images',
      rule: 'maximum_images',
      message: `Page has ${imageCount} images, recommended maximum is 25`,
      severity: 'WARNING'
    });
  }

  // Check hero image
  const heroImg = $('img[loading="eager"], img[fetchpriority="high"]').first();
  if (!heroImg.length) {
    errors.push({
      section: 'images',
      rule: 'hero_image_loading',
      message: 'Hero image must have loading="eager" and fetchpriority="high"',
      severity: 'BLOCKING'
    });
  }

  // Check all other images have loading="lazy"
  let lazyLoadViolations = 0;
  allImages.each((i, elem) => {
    const $img = $(elem);
    const loading = $img.attr('loading');
    const fetchpriority = $img.attr('fetchpriority');

    // Skip hero image
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

  // Check alt text
  let missingAlt = 0;
  let shortAlt = 0;
  allImages.each((i, elem) => {
    const alt = $(elem).attr('alt') || '';
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

  // Check photo credits
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
 * Validate rubric compliance (Four Pillars)
 */
function validateRubric($) {
  const errors = [];
  const warnings = [];
  const info = [];

  // Helper to find section text
  const findSection = (pattern) => {
    let sectionContent = '';
    $('h2, h3').each((i, elem) => {
      const $elem = $(elem);
      if (pattern.test($elem.text())) {
        let $next = $elem.next();
        while ($next.length && !$next.is('h2')) {
          sectionContent += $next.text() + ' ';
          $next = $next.next();
        }
      }
    });
    return sectionContent;
  };

  // 1. Honest Assessments - First-person voice
  const logbookText = findSection(SECTION_PATTERNS.logbook);
  const firstPersonMatches = logbookText.match(/\b(I|my|me|we|our|us)\b/gi) || [];
  const firstPersonCount = firstPersonMatches.length;

  if (firstPersonCount < 10) {
    errors.push({
      section: 'rubric',
      rule: 'first_person_voice',
      message: `Logbook has ${firstPersonCount} first-person pronouns, minimum is 10`,
      severity: 'BLOCKING'
    });
  }

  // Contrast language
  const contrastMatches = logbookText.match(/\b(but|however|though|despite|although|yet)\b/gi) || [];
  const contrastCount = contrastMatches.length;

  if (contrastCount < 3) {
    warnings.push({
      section: 'rubric',
      rule: 'contrast_language',
      message: `Logbook has ${contrastCount} contrast words, recommended minimum is 3`,
      severity: 'WARNING'
    });
  }

  // 2. Accessibility Notes
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

  // 3. DIY Options - Price mentions
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

  // 4. Booking Guidance
  const excursionsText = findSection(SECTION_PATTERNS.excursions);
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

    // Collect all errors
    results.blocking_errors.push(...icpResult.errors);
    results.blocking_errors.push(...sectionResult.errors);
    results.blocking_errors.push(...wordResult.errors);
    results.blocking_errors.push(...imageResult.errors);
    results.blocking_errors.push(...rubricResult.errors);

    // Collect all warnings
    results.warnings.push(...icpResult.warnings);
    results.warnings.push(...sectionResult.warnings);
    results.warnings.push(...wordResult.warnings);
    results.warnings.push(...imageResult.warnings);
    results.warnings.push(...rubricResult.warnings);

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

  console.log(`\n${colors.bold}${colors.cyan}Port Page Validation Report - ITC v1.0${colors.reset}`);
  console.log('═'.repeat(80));
  console.log();

  // File header
  console.log(`${colors.bold}File:${colors.reset} ${results.file}`);

  // Score
  const scoreColor = results.score >= 90 ? colors.green : results.score >= 70 ? colors.yellow : colors.red;
  console.log(`${colors.bold}Score:${colors.reset} ${scoreColor}${results.score}/100${colors.reset}`);
  console.log(`${colors.bold}Status:${colors.reset} ${results.valid ? colors.green + '✓ PASS' : colors.red + '✗ FAIL'} ${colors.reset}`);
  console.log();

  // Blocking errors
  if (results.blocking_errors.length > 0) {
    console.log(`${colors.red}${colors.bold}BLOCKING ERRORS (${results.blocking_errors.length}):${colors.reset}`);
    results.blocking_errors.forEach((err, i) => {
      console.log(`${colors.red}  ${i+1}. [${err.section}/${err.rule}]${colors.reset} ${err.message}`);
    });
    console.log();
  }

  // Warnings
  if (results.warnings.length > 0) {
    console.log(`${colors.yellow}${colors.bold}WARNINGS (${results.warnings.length}):${colors.reset}`);
    results.warnings.forEach((warn, i) => {
      console.log(`${colors.yellow}  ${i+1}. [${warn.section}/${warn.rule}]${colors.reset} ${warn.message}`);
    });
    console.log();
  }

  // Summary stats
  if (!options.quiet) {
    console.log(`${colors.bold}Details:${colors.reset}`);
    console.log(`  ICP-Lite: ${results.icp_lite?.protocol_version || 'N/A'}`);
    console.log(`  AI Summary: ${results.icp_lite?.ai_summary_length || 0} chars`);
    console.log(`  Last Reviewed: ${results.icp_lite?.last_reviewed || 'N/A'}`);
    console.log(`  Total Words: ${results.word_counts?.total || 0}`);
    console.log(`  Total Images: ${results.images?.total_images || 0}`);
    console.log(`  First-Person Count: ${results.rubric?.first_person_count || 0}`);
    console.log(`  Sections Detected: ${results.section_order?.detected_order?.length || 0}`);
    console.log();
  }

  console.log('═'.repeat(80));
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
    console.error('Usage: validate-port-page.js [options] [files...]');
    console.error('Options:');
    console.error('  --all-ports    Validate all port pages');
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
    // Single file - detailed output
    const result = await validatePortPage(filesToValidate[0]);
    const valid = printResults(result, options);
    process.exit(valid ? 0 : 1);
  } else {
    // Multiple files - summary output
    const results = [];
    for (const file of filesToValidate) {
      const result = await validatePortPage(file);
      results.push(result);
    }

    if (options.jsonOutput) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      console.log(`\n${colors.bold}${colors.cyan}Batch Validation Report${colors.reset}`);
      console.log('═'.repeat(80));

      let passed = 0;
      let failed = 0;

      results.forEach(r => {
        const status = r.valid ? colors.green + '✓' : colors.red + '✗';
        const score = r.score >= 90 ? colors.green : r.score >= 70 ? colors.yellow : colors.red;
        console.log(`${status} ${colors.reset}${r.file} ${score}[${r.score}]${colors.reset} ${r.blocking_errors.length} errors, ${r.warnings.length} warnings`);

        if (r.valid) passed++;
        else failed++;
      });

      console.log('═'.repeat(80));
      console.log(`Total: ${results.length} | ${colors.green}Passed: ${passed}${colors.reset} | ${colors.red}Failed: ${failed}${colors.reset}`);
      console.log();
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

export { validatePortPage };
