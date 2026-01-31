#!/usr/bin/env node
/**
 * Venue Page Validator v2.0.0
 * Soli Deo Gloria
 *
 * Technical + Semantic validation for venue/restaurant pages.
 * Replaces validate-venue-page.sh with deeper quality checks.
 *
 * Technical checks (structural correctness):
 *   T01  Image over-duplication (>2x same image, unless html+swiper)
 *   T02  Missing menu section on dining venues
 *   T03  Missing Google Analytics
 *   T04  Missing Umami Analytics
 *   T05  Missing required content sections
 *   T06  Missing theological foundation
 *   T07  Missing ICP-Lite protocol tags
 *   T08  Missing JSON-LD schemas
 *   T09  Missing WCAG accessibility elements
 *   T10  Missing navigation elements
 *   T11  Missing local images (referenced files that don't exist on disk)
 *
 * Semantic checks (content quality & coherence):
 *   S01  Generic template review text detected
 *   S02  Generic "best for" text detected
 *   S03  Dress code mismatch (Smart Casual on walk-up/counter venues)
 *   S04  Generic FAQ contamination (specialty dining FAQ on casual venues)
 *   S05  Wrong stock image for venue type
 *   S06  Venue description promises not fulfilled by page content
 *
 * Quality warnings (should address):
 *   W01  No venue-specific images (all stock)
 *   W02  Template-length page (unmodified generator output)
 *   W03  Missing author card / right rail
 *   W04  Missing OG/Twitter image tags
 *   W05  Stale last-reviewed date (>180 days)
 *
 * Usage:
 *   node admin/validate-venue-page-v2.js <path-to-venue.html>
 *   node admin/validate-venue-page-v2.js --batch restaurants/
 *   node admin/validate-venue-page-v2.js --json-output <path>
 *
 * Exit codes:
 *   0 = all checks passed
 *   1 = critical errors (must fix)
 *   2 = warnings only (should address)
 */

import { readFile } from 'fs/promises';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, dirname, basename, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// ─── Colors ──────────────────────────────────────────────────────────────────
const c = {
  reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
  yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m',
  dim: '\x1b[2m', bold: '\x1b[1m'
};

// ─── Venue metadata from venues-v2.json ──────────────────────────────────────
let VENUE_DATA = null;

function loadVenueData() {
  if (VENUE_DATA) return VENUE_DATA;
  VENUE_DATA = {};
  // Load all venue data files (RCL + NCL + future lines)
  const dataFiles = [
    join(PROJECT_ROOT, 'assets/data/venues-v2.json'),
    join(PROJECT_ROOT, 'assets/data/ncl-venues.json'),
    join(PROJECT_ROOT, 'assets/data/carnival-venues.json'),
    join(PROJECT_ROOT, 'assets/data/msc-venues.json'),
    join(PROJECT_ROOT, 'assets/data/virgin-venues.json'),
  ];
  for (const dataPath of dataFiles) {
    if (!existsSync(dataPath)) continue;
    try {
      const raw = JSON.parse(readFileSync(dataPath, 'utf-8'));
      for (const v of raw.venues || []) {
        VENUE_DATA[v.slug] = v;
      }
    } catch { /* skip unreadable files */ }
  }
  return Object.keys(VENUE_DATA).length ? VENUE_DATA : null;
}

/**
 * Determine venue service style from metadata.
 * Returns: 'fine-dining' | 'specialty' | 'casual-dining' | 'counter-service' |
 *          'bar' | 'coffee' | 'dessert' | 'entertainment' | 'activity' |
 *          'neighborhood' | 'unknown'
 */
function classifyVenue(slug, venueData) {
  const meta = venueData?.[slug];
  if (!meta) return 'unknown';

  const cat = meta.category || '';
  const sub = meta.subcategory || '';
  const desc = (meta.description || '').toLowerCase();
  const name = (meta.name || '').toLowerCase();

  // Activities & neighborhoods
  if (cat === 'activities') return 'activity';
  if (cat === 'neighborhoods') return 'neighborhood';
  if (cat === 'entertainment') return 'entertainment';

  // Bars
  if (cat === 'bars') {
    if (sub === 'coffee') return 'coffee';
    if (sub === 'dessert') return 'dessert';
    return 'bar';
  }

  // Dining
  if (cat === 'dining') {
    // Fine dining / specialty (check FIRST — premium venues should never be counter-service)
    if (sub === 'specialty' || meta.premium === true) {
      const fineKeywords = ['multi-course', 'tasting', 'exclusive', 'upscale', 'fine dining', 'molecular'];
      if (fineKeywords.some(kw => desc.includes(kw))) return 'fine-dining';
      return 'specialty';
    }

    // Sit-down restaurants with interactive/tableside service (teppanyaki, Korean BBQ, etc.)
    if (sub === 'restaurant') {
      const fineKeywords = ['multi-course', 'tasting', 'exclusive', 'upscale', 'fine dining', 'molecular'];
      if (fineKeywords.some(kw => desc.includes(kw))) return 'fine-dining';
      if (desc.includes('tableside') || desc.includes('interactive') || desc.includes('sit-down')) return 'specialty';
      return 'casual-dining';
    }

    // Buffet indicators (check before counter-service — buffets mention "snacks" but aren't counters)
    if (desc.includes('buffet') || desc.includes('food hall') || desc.includes('multiple stations')) {
      return 'casual-dining';
    }

    // Counter-service / walk-up indicators (only for casual/complimentary subcategories)
    const counterKeywords = [
      'hot dog', 'sausage', 'pizza by the slice', 'ice cream', 'soft-serve',
      'candy', 'sweets shop', 'quick bites', 'quick service',
      'fish and chips', 'tacos and burritos'
    ];
    // Only classify as counter-service if the PRIMARY purpose is counter-service
    // (removed 'snacks', 'bbq' — too broad; buffets mention snacks, smokehouse BBQ is sit-down)
    if (counterKeywords.some(kw => desc.includes(kw) || name.includes(kw))) {
      return 'counter-service';
    }

    // Complimentary dining
    if (sub === 'complimentary') {
      const casualKeywords = ['casual', 'lighter', 'light fare', 'deli', 'pastries', 'comfort food'];
      if (casualKeywords.some(kw => desc.includes(kw))) return 'counter-service';
      return 'casual-dining';
    }

    return 'casual-dining';
  }

  return 'unknown';
}

// ─── Template detection patterns ─────────────────────────────────────────────
const GENERIC_REVIEW_DINING = [
  'The food was well-prepared and presented beautifully',
  'Portions were generous and flavors were balanced',
  'The menu offered good variety with options for different tastes',
  'Service was attentive and friendly. Our server was knowledgeable about the menu',
  'The atmosphere was inviting with tasteful decor that enhanced the dining experience',
  'Comfortable seating and appropriate lighting made for an enjoyable meal'
];

const GENERIC_REVIEW_BAR = [
  'The drink menu featured classic cocktails and creative specialties',
  'Bartenders were skilled and drinks were well-crafted',
  'The vibe was relaxed and social with comfortable seating',
  'Music was at a good volume for conversation'
];

const GENERIC_BEST_FOR = 'Families, couples, and groups seeking quality dining';
const GENERIC_BEST_FOR_BAR = 'Adults seeking cocktails, socializing, and relaxation';

const GENERIC_FAQ_PHRASES = [
  'Reservations are recommended for specialty dining',
  'Most specialty restaurants request smart casual attire',
  'Complimentary vs. specialty pricing varies by venue'
];

// Stock images that don't match certain venue types
const STOCK_IMAGE_RULES = {
  'hotdog.webp': {
    allowed: ['boardwalk-dog-house', 'dog-house'],
    label: 'hot dog image'
  },
  'formal-dining.webp': {
    disallowed_styles: ['counter-service', 'bar', 'coffee', 'dessert', 'activity'],
    label: 'formal dining image'
  },
  'bar-lounge.svg': {
    disallowed_styles: ['fine-dining', 'specialty', 'casual-dining', 'counter-service'],
    label: 'bar/lounge image'
  },
  'italian.webp': {
    disallowed_slugs_unless: slug => /italian|giovanni|trattoria|sorrent/i.test(slug),
    label: 'Italian cuisine image'
  }
};

// Venues where dress code rules don't apply (casual/walk-up)
const NO_DRESS_CODE_STYLES = ['counter-service', 'coffee', 'dessert', 'activity', 'neighborhood'];

// Venues where reservation FAQ is nonsensical
const NO_RESERVATION_FAQ_STYLES = ['counter-service', 'coffee', 'dessert', 'bar', 'activity', 'neighborhood'];

// ─── Validation engine ───────────────────────────────────────────────────────

class VenueValidator {
  constructor(filepath, options = {}) {
    this.filepath = filepath;
    this.filename = basename(filepath);
    this.slug = this.filename.replace('.html', '');
    this.options = options;
    this.errors = [];    // Critical failures
    this.warnings = [];  // Should address
    this.passes = [];    // Checks that passed
    this.html = '';
    this.lineCount = 0;
    this.venueData = loadVenueData();
    this.style = classifyVenue(this.slug, this.venueData);
    this.meta = this.venueData?.[this.slug] || null;
  }

  pass(code, msg) { this.passes.push({ code, message: msg }); }
  fail(code, msg) { this.errors.push({ code, message: msg }); }
  warn(code, msg) { this.warnings.push({ code, message: msg }); }

  // Helpers
  has(pattern) {
    if (typeof pattern === 'string') return this.html.includes(pattern);
    return pattern.test(this.html);
  }

  count(str) {
    let n = 0, pos = 0;
    while ((pos = this.html.indexOf(str, pos)) !== -1) { n++; pos += str.length; }
    return n;
  }

  extractAllImageSrcs() {
    const re = /src="([^"]+\.(webp|jpg|jpeg|png|gif|svg))"/gi;
    const images = [];
    let m;
    while ((m = re.exec(this.html)) !== null) images.push(m[1]);
    return images;
  }

  hasSwiper() {
    return this.has('class="swiper') || this.has('data-swiper') || this.has('swiper-slide');
  }

  // ── T01: Image over-duplication ──────────────────────────────────────────
  checkImageDuplication() {
    const images = this.extractAllImageSrcs();
    if (images.length === 0) { this.warn('T01', 'No images found on page'); return; }

    // Exclude site-wide logos/compass/watermark (expected repeats)
    const siteImages = [
      '/assets/logo_wake', '/assets/compass_rose', '/authors/img/',
      'watermark.webp', 'watermark.png'  // decorative background overlay
    ];

    const contentImages = images.filter(img =>
      !siteImages.some(prefix => img.includes(prefix))
    );

    // Count occurrences
    const counts = {};
    for (const img of contentImages) {
      const key = img.split('?')[0]; // strip query params
      counts[key] = (counts[key] || 0) + 1;
    }

    const hasSwiper = this.hasSwiper();
    const maxAllowed = hasSwiper ? 2 : 1;
    // Per user requirement: if it's in the HTML AND the swiper, 2x is OK.
    // Otherwise, each content image should appear at most once.

    const overUsed = Object.entries(counts).filter(([, n]) => n > maxAllowed);

    if (overUsed.length > 0) {
      const details = overUsed.map(([img, n]) => `${basename(img)} (${n}x)`).join(', ');
      this.fail('T01', `Image over-duplication: ${details} — max ${maxAllowed}x allowed${hasSwiper ? ' (swiper detected)' : ''}`);
    } else {
      this.pass('T01', `All content images within duplication limit (${Object.keys(counts).length} unique)`);
    }
  }

  // ── T02: Missing menu section on dining venues ───────────────────────────
  checkMenuSection() {
    const isDining = ['fine-dining', 'specialty', 'casual-dining', 'counter-service'].includes(this.style);

    if (!isDining) {
      // Bars, entertainment, activities don't need menus (but it's nice)
      if (this.has('id="menu-prices"')) {
        this.pass('T02', 'Menu section present (bonus for non-dining venue)');
      }
      return;
    }

    if (this.has('id="menu-prices"')) {
      this.pass('T02', 'Menu & Prices section present');

      // Additional check: does it have actual menu items or just placeholder?
      const menuSection = this.html.match(/id="menu-prices"[\s\S]*?(?=<section|<\/main)/);
      if (menuSection) {
        const menuText = menuSection[0];
        const hasItems = menuText.includes('$') ||
                         menuText.includes('price') ||
                         menuText.includes('complimentary') ||
                         menuText.includes('included') ||
                         menuText.includes('menu-grid') ||
                         menuText.includes('menu-category');
        if (!hasItems) {
          this.warn('T02', 'Menu section exists but appears to lack actual menu items or prices');
        }
      }
    } else {
      this.fail('T02', `Menu & Prices section MISSING (required for ${this.style} venue)`);
    }
  }

  // ── T03: Missing Google Analytics ────────────────────────────────────────
  checkGoogleAnalytics() {
    if (this.has('G-WZP891PZXJ')) {
      this.pass('T03', 'Google Analytics present');
    } else {
      this.fail('T03', 'Google Analytics MISSING (required: G-WZP891PZXJ)');
    }
  }

  // ── T04: Missing Umami Analytics ─────────────────────────────────────────
  checkUmamiAnalytics() {
    if (this.has('9661a449-3ba9-49ea-88e8-4493363578d2')) {
      this.pass('T04', 'Umami Analytics present');
    } else {
      this.fail('T04', 'Umami Analytics MISSING');
    }
  }

  // ── T05: Required content sections ───────────────────────────────────────
  checkRequiredSections() {
    const sections = [
      { id: 'overview',        label: 'Overview',               required: true },
      { id: 'accommodations',  label: 'Special Accommodations', required: true },
      { id: 'availability',    label: 'Availability',           required: true },
      { id: 'logbook',         label: 'Logbook/Reviews',        required: true },
      { id: 'faq',             label: 'FAQ',                    required: true },
      { id: 'sources',         label: 'Sources',                required: true }
    ];

    for (const s of sections) {
      if (this.has(`id="${s.id}"`)) {
        this.pass('T05', `${s.label} section present`);
      } else if (s.required) {
        this.fail('T05', `${s.label} section MISSING (id="${s.id}")`);
      } else {
        this.warn('T05', `${s.label} section missing`);
      }
    }

    // Sub-checks within overview
    if (this.has('class="page-title"'))   this.pass('T05', 'Page title present');
    else this.fail('T05', 'Page title class MISSING');

    if (this.has('class="answer-line"'))  this.pass('T05', 'Quick Answer present');
    else this.fail('T05', 'Quick Answer (answer-line) MISSING');

    if (this.has('class="key-facts"'))    this.pass('T05', 'Key Facts present');
    else this.fail('T05', 'Key Facts section MISSING');

    // FAQ depth
    const detailsCount = (this.html.match(/<details/g) || []).length;
    if (detailsCount >= 3) {
      this.pass('T05', `FAQ has ${detailsCount} expandable items`);
    } else if (detailsCount > 0) {
      this.warn('T05', `FAQ has only ${detailsCount} items (3+ recommended)`);
    } else if (this.has('id="faq"')) {
      this.warn('T05', 'FAQ section exists but has no expandable items');
    }
  }

  // ── T06: Theological foundation ──────────────────────────────────────────
  checkTheologicalFoundation() {
    if (this.has('Soli Deo Gloria'))  this.pass('T06', 'Soli Deo Gloria invocation');
    else this.fail('T06', 'Soli Deo Gloria invocation MISSING');

    if (this.has('Proverbs 3:5'))     this.pass('T06', 'Proverbs 3:5 reference');
    else this.fail('T06', 'Proverbs 3:5 reference MISSING');

    if (this.has('Colossians 3:23'))  this.pass('T06', 'Colossians 3:23 reference');
    else this.fail('T06', 'Colossians 3:23 reference MISSING');
  }

  // ── T07: ICP-Lite protocol tags ──────────────────────────────────────────
  checkICPLite() {
    if (this.has('name="ai-summary"'))       this.pass('T07', 'ai-summary meta tag present');
    else this.fail('T07', 'ai-summary meta tag MISSING');

    if (this.has('name="last-reviewed"'))     this.pass('T07', 'last-reviewed meta tag present');
    else this.fail('T07', 'last-reviewed meta tag MISSING');

    if (this.has('name="content-protocol"'))  this.pass('T07', 'content-protocol meta tag present');
    else this.fail('T07', 'content-protocol meta tag MISSING');

    // Check staleness
    const reviewMatch = this.html.match(/name="last-reviewed"\s+content="(\d{4}-\d{2}-\d{2})"/);
    if (reviewMatch) {
      const reviewed = new Date(reviewMatch[1]);
      const now = new Date();
      const daysDiff = (now - reviewed) / (1000 * 60 * 60 * 24);
      if (daysDiff > 180) {
        this.warn('W05', `last-reviewed date is ${Math.floor(daysDiff)} days old (${reviewMatch[1]})`);
      }
    }
  }

  // ── T08: JSON-LD schemas ─────────────────────────────────────────────────
  checkJSONLD() {
    if (this.has('"@type": "WebPage"') || this.has('"@type":"WebPage"'))
      this.pass('T08', 'JSON-LD WebPage schema');
    else this.fail('T08', 'JSON-LD WebPage schema MISSING');

    if (this.has('"@type": "BreadcrumbList"') || this.has('"@type":"BreadcrumbList"'))
      this.pass('T08', 'JSON-LD BreadcrumbList schema');
    else this.fail('T08', 'JSON-LD BreadcrumbList schema MISSING');

    if (this.has('"@type": "FAQPage"') || this.has('"@type":"FAQPage"'))
      this.pass('T08', 'JSON-LD FAQPage schema');
    else this.fail('T08', 'JSON-LD FAQPage schema MISSING');
  }

  // ── T09: WCAG accessibility ──────────────────────────────────────────────
  checkAccessibility() {
    if (this.has('class="skip-link"'))     this.pass('T09', 'Skip link present');
    else this.fail('T09', 'Skip link MISSING');

    if (this.has('role="banner"'))         this.pass('T09', 'Header role="banner"');
    else this.warn('T09', 'Header missing role="banner"');

    if (this.has('role="contentinfo"'))    this.pass('T09', 'Footer role="contentinfo"');
    else this.warn('T09', 'Footer missing role="contentinfo"');

    if (this.has('lang="en"'))             this.pass('T09', 'html lang="en"');
    else this.fail('T09', 'html lang="en" MISSING');
  }

  // ── T10: Navigation elements ─────────────────────────────────────────────
  checkNavigation() {
    if (this.has('class="nav-toggle"'))    this.pass('T10', 'Mobile nav-toggle present');
    else this.fail('T10', 'Mobile nav-toggle MISSING');

    if (this.has('id="site-nav"'))         this.pass('T10', 'site-nav element present');
    else this.fail('T10', 'site-nav element MISSING');

    if (this.has('class="nav-dropdown"'))  this.pass('T10', 'Dropdown menus present');
    else this.warn('T10', 'Dropdown menus not found');
  }

  // ── T11: Missing local images ───────────────────────────────────────────
  checkMissingLocalImages() {
    const images = this.extractAllImageSrcs();
    const missing = [];

    for (const src of images) {
      // Only check local (absolute-path) images, not external URLs
      if (!src.startsWith('/') || src.startsWith('//')) continue;

      const cleanSrc = src.split('?')[0].split('#')[0];
      const imgPath = join(PROJECT_ROOT, cleanSrc);
      if (!existsSync(imgPath)) {
        missing.push(src);
      }
    }

    if (missing.length > 0) {
      const display = missing.slice(0, 3).join(', ') + (missing.length > 3 ? '...' : '');
      this.fail('T11', `${missing.length} local image(s) not found: ${display}`);
    } else {
      this.pass('T11', 'All local image references resolve to existing files');
    }
  }

  // ── S01: Generic template review text ────────────────────────────────────
  checkGenericReview() {
    const found = [];

    for (const phrase of GENERIC_REVIEW_DINING) {
      if (this.has(phrase)) found.push(phrase.substring(0, 50) + '...');
    }
    for (const phrase of GENERIC_REVIEW_BAR) {
      if (this.has(phrase)) found.push(phrase.substring(0, 50) + '...');
    }

    if (found.length > 0) {
      this.fail('S01', `Generic template review text detected (${found.length} phrases). Review must be venue-specific, not boilerplate`);
    } else {
      this.pass('S01', 'Review text appears venue-specific');
    }
  }

  // ── S02: Generic "best for" text ─────────────────────────────────────────
  checkGenericBestFor() {
    if (this.has(GENERIC_BEST_FOR)) {
      this.fail('S02', 'Generic "Best For" text detected: "Families, couples, and groups seeking quality dining" — must be venue-specific');
    } else if (this.has(GENERIC_BEST_FOR_BAR)) {
      this.fail('S02', 'Generic "Best For" text detected: "Adults seeking cocktails, socializing, and relaxation" — must be venue-specific');
    } else {
      this.pass('S02', '"Best For" text appears venue-specific');
    }
  }

  // ── S03: Dress code mismatch ─────────────────────────────────────────────
  checkDressCodeMatch() {
    if (!this.has('Dress Code')) return; // No dress code section

    const hasSmartCasual = this.has('Smart Casual</');

    if (hasSmartCasual && NO_DRESS_CODE_STYLES.includes(this.style)) {
      const venueName = this.meta?.name || this.slug;
      this.fail('S03', `"Smart Casual" dress code on ${this.style} venue (${venueName}). Counter-service/casual venues should say "Casual" or "No dress code" or omit dress code entirely`);
    } else if (hasSmartCasual && this.style === 'bar') {
      this.warn('S03', '"Smart Casual" dress code on bar venue — most bars are casual');
    } else {
      this.pass('S03', 'Dress code appropriate for venue type');
    }
  }

  // ── S04: Generic FAQ contamination ───────────────────────────────────────
  checkFAQRelevance() {
    const found = [];

    for (const phrase of GENERIC_FAQ_PHRASES) {
      if (this.has(phrase)) found.push(phrase.substring(0, 60));
    }

    if (found.length > 0 && NO_RESERVATION_FAQ_STYLES.includes(this.style)) {
      this.fail('S04', `Generic specialty-dining FAQ on ${this.style} venue. "${found[0]}..." makes no sense for this venue type`);
    } else if (found.length > 0) {
      this.warn('S04', `Generic FAQ phrases detected (${found.length}). Consider venue-specific FAQ answers`);
    } else {
      this.pass('S04', 'FAQ answers appear venue-relevant');
    }
  }

  // ── S05: Wrong stock image for venue type ────────────────────────────────
  checkImageSemantics() {
    const images = this.extractAllImageSrcs();
    const issues = [];

    for (const img of images) {
      const imgFile = basename(img.split('?')[0]);

      const rule = STOCK_IMAGE_RULES[imgFile];
      if (!rule) continue;

      // Check explicit allow-list
      if (rule.allowed && !rule.allowed.includes(this.slug)) {
        issues.push(`${rule.label} (${imgFile}) used on non-${rule.allowed.join('/')} venue`);
        continue;
      }

      // Check style-based disallow
      if (rule.disallowed_styles && rule.disallowed_styles.includes(this.style)) {
        issues.push(`${rule.label} (${imgFile}) inappropriate for ${this.style} venue`);
        continue;
      }

      // Check slug-based conditional
      if (rule.disallowed_slugs_unless && !rule.disallowed_slugs_unless(this.slug)) {
        issues.push(`${rule.label} (${imgFile}) used on non-Italian venue "${this.slug}"`);
      }
    }

    if (issues.length > 0) {
      this.fail('S05', `Image/venue type mismatch: ${issues.join('; ')}`);
    } else {
      this.pass('S05', 'Stock images appropriate for venue type');
    }
  }

  // ── S06: Content promises vs. delivery ───────────────────────────────────
  checkContentPromises() {
    // Check: does the page describe itself as having content it doesn't have?
    const descMatch = this.html.match(/name="description"\s+content="([^"]+)"/);
    const description = descMatch ? descMatch[1].toLowerCase() : '';

    // If description mentions "menu" but no menu section exists
    if ((description.includes('menu') || description.includes('price')) &&
        !this.has('id="menu-prices"')) {
      this.warn('S06', 'Meta description mentions menu/prices but no menu section exists');
    }

    // If logbook says "presented beautifully" for a counter-service venue
    if (this.has('presented beautifully') && this.style === 'counter-service') {
      this.fail('S06', '"Presented beautifully" language on counter-service venue — hot dogs and ice cream are not "presented beautifully"');
    }

    // If "tasteful decor" on a walk-up outdoor stand
    if (this.has('tasteful decor') && ['counter-service', 'activity'].includes(this.style)) {
      this.fail('S06', '"Tasteful decor" language on outdoor/walk-up venue — these are open-air or counter-service spots');
    }
  }

  // ── W01: No venue-specific images ────────────────────────────────────────
  checkVenueSpecificImages() {
    const images = this.extractAllImageSrcs();
    const slugVariants = [
      this.slug,
      this.slug.replace(/-/g, '_'),
      this.slug.replace(/-/g, '')
    ];

    const hasSpecific = images.some(img => {
      const imgLower = img.toLowerCase();
      return slugVariants.some(sv => imgLower.includes(sv));
    });

    if (!hasSpecific) {
      this.warn('W01', 'No venue-specific images found — all images are stock/generic');
    } else {
      this.pass('W01', 'Venue-specific image(s) detected');
    }
  }

  // ── W02: Template-length page ────────────────────────────────────────────
  checkTemplateLength() {
    if (this.lineCount >= 545 && this.lineCount <= 565) {
      this.warn('W02', `Page is ${this.lineCount} lines — matches template generator output length (550-560). Likely unmodified`);
    } else {
      this.pass('W02', `Page length: ${this.lineCount} lines`);
    }
  }

  // ── W03: Author card / right rail ────────────────────────────────────────
  checkAuthorRail() {
    if (this.has('class="rail"') || this.has('class="rail '))
      this.pass('W03', 'Right rail present');
    else this.warn('W03', 'Right rail (aside.rail) missing');

    if (this.has('author-card'))
      this.pass('W03', 'Author card present');
    else this.warn('W03', 'Author card missing');
  }

  // ── W04: OG/Twitter images ───────────────────────────────────────────────
  checkSocialImages() {
    if (this.has('og:image'))      this.pass('W04', 'og:image tag present');
    else this.warn('W04', 'og:image meta tag missing');

    if (this.has('twitter:image')) this.pass('W04', 'twitter:image tag present');
    else this.warn('W04', 'twitter:image meta tag missing');
  }

  // ── Run all checks ──────────────────────────────────────────────────────
  async validate() {
    this.html = await readFile(this.filepath, 'utf-8');
    this.lineCount = this.html.split('\n').length;

    // Technical checks
    this.checkImageDuplication();         // T01
    this.checkMenuSection();              // T02
    this.checkGoogleAnalytics();          // T03
    this.checkUmamiAnalytics();           // T04
    this.checkRequiredSections();         // T05
    this.checkTheologicalFoundation();    // T06
    this.checkICPLite();                  // T07
    this.checkJSONLD();                   // T08
    this.checkAccessibility();            // T09
    this.checkNavigation();               // T10
    this.checkMissingLocalImages();        // T11

    // Semantic checks
    this.checkGenericReview();            // S01
    this.checkGenericBestFor();           // S02
    this.checkDressCodeMatch();           // S03
    this.checkFAQRelevance();             // S04
    this.checkImageSemantics();           // S05
    this.checkContentPromises();          // S06

    // Quality warnings
    this.checkVenueSpecificImages();      // W01
    this.checkTemplateLength();           // W02
    this.checkAuthorRail();               // W03
    this.checkSocialImages();             // W04
  }

  // ── Output ───────────────────────────────────────────────────────────────
  toJSON() {
    return {
      file: relative(PROJECT_ROOT, this.filepath),
      slug: this.slug,
      venueStyle: this.style,
      venueName: this.meta?.name || this.slug,
      venueCategory: this.meta?.category || 'unknown',
      lineCount: this.lineCount,
      passed: this.passes.length,
      errors: this.errors,
      warnings: this.warnings,
      errorCount: this.errors.length,
      warningCount: this.warnings.length,
      valid: this.errors.length === 0
    };
  }

  print() {
    const relPath = relative(PROJECT_ROOT, this.filepath);
    const venueName = this.meta?.name || this.slug;

    console.log('═'.repeat(80));
    console.log(`  ${c.bold}Venue Page Validator v2.0.0${c.reset}`);
    console.log(`  File:  ${relPath}`);
    console.log(`  Venue: ${venueName} [${c.cyan}${this.style}${c.reset}]`);
    console.log('═'.repeat(80));

    // Group by section
    const sections = {};
    for (const item of [...this.passes, ...this.errors, ...this.warnings]) {
      const code = item.code || 'MISC';
      const prefix = code.substring(0, 1);
      let sectionName;
      if (prefix === 'T') sectionName = 'Technical';
      else if (prefix === 'S') sectionName = 'Semantic';
      else sectionName = 'Quality';

      if (!sections[sectionName]) sections[sectionName] = [];
      sections[sectionName].push(item);
    }

    // Print passes
    for (const [section, items] of Object.entries(sections)) {
      console.log(`\n${c.blue}▶ ${section} Checks${c.reset}`);
      const sectionPasses = items.filter(i => this.passes.includes(i));
      const sectionErrors = items.filter(i => this.errors.includes(i));
      const sectionWarns  = items.filter(i => this.warnings.includes(i));

      for (const p of sectionPasses) {
        console.log(`  ${c.green}✓${c.reset} [${p.code}] ${p.message}`);
      }
      for (const e of sectionErrors) {
        console.log(`  ${c.red}✗${c.reset} [${e.code}] ${e.message}`);
      }
      for (const w of sectionWarns) {
        console.log(`  ${c.yellow}⚠${c.reset} [${w.code}] ${w.message}`);
      }
    }

    // Summary
    console.log('\n' + '═'.repeat(80));
    console.log(`  ${c.green}Passed:${c.reset}   ${this.passes.length}`);
    console.log(`  ${c.red}Errors:${c.reset}   ${this.errors.length}`);
    console.log(`  ${c.yellow}Warnings:${c.reset} ${this.warnings.length}`);
    console.log('═'.repeat(80));

    if (this.errors.length > 0) {
      console.log(`\n${c.red}✗ VALIDATION FAILED — ${this.errors.length} error(s) must be fixed${c.reset}`);
    } else if (this.warnings.length > 0) {
      console.log(`\n${c.yellow}⚠ PASSED WITH WARNINGS — ${this.warnings.length} item(s) should be addressed${c.reset}`);
    } else {
      console.log(`\n${c.green}✓ VALIDATION PASSED — All checks passed${c.reset}`);
    }
  }
}

// ─── Batch mode ──────────────────────────────────────────────────────────────

function collectHtmlFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(collectHtmlFiles(fullPath));
    } else if (entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

async function batchValidate(dir, options = {}) {
  const absDir = dir.startsWith('/') ? dir : join(PROJECT_ROOT, dir);
  const files = collectHtmlFiles(absDir).sort();

  console.log(`\n${c.bold}Venue Batch Validation${c.reset}`);
  console.log(`Scanning ${files.length} venue pages in ${relative(PROJECT_ROOT, absDir)}/\n`);

  const results = { total: 0, passed: 0, failed: 0, warned: 0, byStyle: {}, errors: [] };

  for (const file of files) {
    const v = new VenueValidator(file, options);
    await v.validate();
    const json = v.toJSON();

    results.total++;
    if (json.errorCount === 0 && json.warningCount === 0) results.passed++;
    else if (json.errorCount > 0) results.failed++;
    else results.warned++;

    // Track by style
    if (!results.byStyle[json.venueStyle]) {
      results.byStyle[json.venueStyle] = { total: 0, passed: 0, failed: 0 };
    }
    results.byStyle[json.venueStyle].total++;
    if (json.errorCount === 0) results.byStyle[json.venueStyle].passed++;
    else results.byStyle[json.venueStyle].failed++;

    // Print one-liner
    const status = json.errorCount > 0
      ? `${c.red}✗ FAIL${c.reset}`
      : json.warningCount > 0
        ? `${c.yellow}⚠ WARN${c.reset}`
        : `${c.green}✓ PASS${c.reset}`;

    const errSummary = json.errorCount > 0
      ? ` ${c.red}(${json.errors.map(e => e.code).join(',')}${c.reset})`
      : '';

    console.log(`${status} ${json.slug} ${c.dim}[${json.venueStyle}]${c.reset}${errSummary}`);

    if (json.errorCount > 0) {
      results.errors.push({ slug: json.slug, style: json.venueStyle, errors: json.errors });
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(80));
  console.log(`${c.bold}Batch Summary:${c.reset}`);
  console.log(`  Total:    ${results.total}`);
  console.log(`  ${c.green}Passed:${c.reset}   ${results.passed}`);
  console.log(`  ${c.yellow}Warnings:${c.reset} ${results.warned}`);
  console.log(`  ${c.red}Failed:${c.reset}   ${results.failed}`);
  console.log(`\n${c.bold}By Venue Style:${c.reset}`);
  for (const [style, counts] of Object.entries(results.byStyle).sort((a, b) => b[1].total - a[1].total)) {
    const rate = ((counts.passed / counts.total) * 100).toFixed(0);
    const color = rate >= 80 ? c.green : rate >= 50 ? c.yellow : c.red;
    console.log(`  ${c.cyan}${style}${c.reset}: ${counts.total} total, ${color}${rate}% pass${c.reset} (${counts.failed} failed)`);
  }

  // Error frequency
  const errorFreq = {};
  for (const r of results.errors) {
    for (const e of r.errors) {
      errorFreq[e.code] = (errorFreq[e.code] || 0) + 1;
    }
  }
  if (Object.keys(errorFreq).length > 0) {
    console.log(`\n${c.bold}Most Common Errors:${c.reset}`);
    for (const [code, count] of Object.entries(errorFreq).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${c.red}${code}${c.reset}: ${count} pages`);
    }
  }

  if (options.jsonOutput) {
    console.log('\n' + JSON.stringify(results, null, 2));
  }

  return results;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  const options = {
    jsonOutput: args.includes('--json-output'),
    quiet: args.includes('--quiet'),
    batch: args.includes('--batch')
  };

  const files = args.filter(a => !a.startsWith('--'));

  if (files.length === 0) {
    console.log(`${c.bold}Venue Page Validator v2.0.0${c.reset}`);
    console.log('');
    console.log('Usage:');
    console.log('  node admin/validate-venue-page-v2.js <venue-page.html>');
    console.log('  node admin/validate-venue-page-v2.js --batch restaurants/');
    console.log('  node admin/validate-venue-page-v2.js --json-output <page.html>');
    console.log('');
    console.log('Checks:');
    console.log('  T01-T11  Technical (structural, analytics, sections, images)');
    console.log('  S01-S06  Semantic (content quality, coherence, tone)');
    console.log('  W01-W05  Quality warnings');
    process.exit(1);
  }

  if (options.batch) {
    const dir = files[0] || 'restaurants';
    const results = await batchValidate(dir, options);
    process.exit(results.failed > 0 ? 1 : 0);
  }

  // Single file mode
  const filepath = files[0].startsWith('/') ? files[0] : join(PROJECT_ROOT, files[0]);

  if (!existsSync(filepath)) {
    console.error(`Error: File not found: ${filepath}`);
    process.exit(1);
  }

  const validator = new VenueValidator(filepath, options);
  await validator.validate();

  if (options.jsonOutput) {
    console.log(JSON.stringify(validator.toJSON(), null, 2));
  } else {
    validator.print();
  }

  if (validator.errors.length > 0) process.exit(1);
  else if (validator.warnings.length > 0) process.exit(2);
  else process.exit(0);
}

main().catch(err => {
  console.error(`${c.red}Fatal error:${c.reset}`, err);
  process.exit(1);
});
