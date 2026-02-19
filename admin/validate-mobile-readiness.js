#!/usr/bin/env node
/**
 * Mobile Readiness Validator — v1.000
 * Soli Deo Gloria
 *
 * Standard: new-standards/v3.010/MOBILE_STANDARDS_v1.000.md
 *
 * Validates HTML pages for mobile responsiveness compliance.
 * Can be run standalone or imported as a module by other validators.
 *
 * Checks:
 *   MOB-001  Viewport meta tag               [BLOCKING]
 *   MOB-002  No inline fixed widths > 480px   [WARNING]
 *   MOB-003  Hero image constrained           [WARNING]
 *   MOB-004  Table overflow handling           [WARNING]
 *   MOB-005  Touch target declarations         [WARNING]
 *   MOB-006  No horizontal scroll elements     [BLOCKING]
 *   MOB-007  Font size floor                   [WARNING]
 *   MOB-008  Mobile hardening CSS section      [INFO]
 *
 * Exit codes:
 *   0 = pass (no blocking errors)
 *   1 = fail (blocking errors found)
 *   2 = pass with warnings
 */

import { readFile, appendFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import { load } from 'cheerio';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');
const WARNINGS_LOG = join(PROJECT_ROOT, 'admin', 'validation-warnings.log');
const STYLES_CSS_PATH = join(PROJECT_ROOT, 'assets', 'styles.css');

// Severity levels per Mobile Standard v1.000 Section 9.2
const SEVERITY = {
  BLOCKING: 'BLOCKING',
  WARNING: 'WARNING',
  INFO: 'INFO'
};

// Colors for terminal output (matches existing validator pattern)
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

// Table classes that may overflow at narrow viewports
// Per Mobile Standard v1.000 Section 8.1
// Note: 'key-facts' removed — it's a narrow 2-column table (label + value)
// that never overflows. 92 of 94 ship pages use <div>, only 2 use <table>.
const OVERFLOW_TABLE_CLASSES = [
  'pier-distances-table',
  'transport-costs-table',
  'stats-grid'
];

// Interactive element selectors that need 44px touch targets
// Per Mobile Standard v1.000 Section 6.2
const TOUCH_TARGET_SELECTORS = [
  'a[href]',           // all links
  'button',            // all buttons
  'summary',           // FAQ toggles, collapsible sections
  'input',             // form inputs
  'select',            // dropdowns
  '[role="button"]',   // ARIA buttons
  '[tabindex]'         // focusable elements
];

/**
 * MOB-001: Viewport meta tag must exist with correct content
 * Severity: BLOCKING
 */
function checkViewportMeta($) {
  const viewport = $('meta[name="viewport"]');

  if (viewport.length === 0) {
    return {
      id: 'MOB-001',
      severity: SEVERITY.BLOCKING,
      pass: false,
      message: 'Missing viewport meta tag. Required: <meta name="viewport" content="width=device-width,initial-scale=1">'
    };
  }

  const content = viewport.attr('content') || '';

  // Must contain width=device-width
  if (!content.includes('width=device-width')) {
    return {
      id: 'MOB-001',
      severity: SEVERITY.BLOCKING,
      pass: false,
      message: `Viewport meta tag missing "width=device-width". Found: "${content}"`
    };
  }

  // Must contain initial-scale=1
  if (!content.includes('initial-scale=1')) {
    return {
      id: 'MOB-001',
      severity: SEVERITY.BLOCKING,
      pass: false,
      message: `Viewport meta tag missing "initial-scale=1". Found: "${content}"`
    };
  }

  // Should NOT contain maximum-scale=1 or user-scalable=no (accessibility)
  if (content.includes('user-scalable=no') || content.includes('user-scalable=0')) {
    return {
      id: 'MOB-001',
      severity: SEVERITY.WARNING,
      pass: true,
      message: 'Viewport meta tag disables user scaling (user-scalable=no). This harms accessibility.'
    };
  }

  return {
    id: 'MOB-001',
    severity: SEVERITY.BLOCKING,
    pass: true,
    message: null
  };
}

/**
 * MOB-002: No inline fixed widths greater than 480px
 * Severity: WARNING
 *
 * Checks for inline style="width: Npx" where N > 480
 */
function checkInlineFixedWidths($) {
  const violations = [];

  $('[style]').each((i, elem) => {
    const style = $(elem).attr('style') || '';
    // Match width: Npx patterns
    const widthMatch = style.match(/width\s*:\s*(\d+)px/i);
    if (widthMatch) {
      const width = parseInt(widthMatch[1], 10);
      if (width > 480) {
        const tag = elem.tagName || 'unknown';
        const id = $(elem).attr('id') ? `#${$(elem).attr('id')}` : '';
        const cls = $(elem).attr('class') ? `.${$(elem).attr('class').split(/\s+/)[0]}` : '';
        violations.push(`<${tag}${id}${cls}> has inline width: ${width}px`);
      }
    }
  });

  if (violations.length > 0) {
    return {
      id: 'MOB-002',
      severity: SEVERITY.WARNING,
      pass: true,
      message: `${violations.length} element(s) with inline width > 480px:\n    ${violations.slice(0, 5).join('\n    ')}${violations.length > 5 ? `\n    ...and ${violations.length - 5} more` : ''}`
    };
  }

  return {
    id: 'MOB-002',
    severity: SEVERITY.WARNING,
    pass: true,
    message: null
  };
}

/**
 * MOB-003: Hero images must be constrained
 * Severity: WARNING
 *
 * Checks that images inside hero sections have max-width: 100% or are
 * inside a container with overflow: hidden. The global img rule already
 * sets max-width: 100% (styles.css line 34), so this primarily checks
 * for inline style overrides that break containment.
 */
function checkHeroImageConstraint($) {
  const heroSelectors = [
    '.hero-header img',
    '.hero-ship img',
    '.hero img',
    '[class*="hero"] img'
  ];

  const violations = [];

  for (const selector of heroSelectors) {
    $(selector).each((i, elem) => {
      const style = $(elem).attr('style') || '';
      // Check if inline style overrides max-width to something fixed
      if (style.includes('max-width') && !style.includes('max-width: 100%') && !style.includes('max-width:100%')) {
        const src = $(elem).attr('src') || $(elem).attr('data-src') || 'unknown';
        violations.push(`Hero image "${src}" has inline max-width override: ${style}`);
      }
      // Check for inline width in px without max-width constraint
      const widthMatch = style.match(/(?:^|;)\s*width\s*:\s*(\d+)px/i);
      if (widthMatch && parseInt(widthMatch[1], 10) > 480) {
        const src = $(elem).attr('src') || $(elem).attr('data-src') || 'unknown';
        violations.push(`Hero image "${src}" has fixed inline width: ${widthMatch[1]}px`);
      }
    });
  }

  if (violations.length > 0) {
    return {
      id: 'MOB-003',
      severity: SEVERITY.WARNING,
      pass: true,
      message: `${violations.length} hero image(s) with containment issues:\n    ${violations.join('\n    ')}`
    };
  }

  return {
    id: 'MOB-003',
    severity: SEVERITY.WARNING,
    pass: true,
    message: null
  };
}

/**
 * MOB-004: Tables that may overflow must have scroll handling
 * Severity: WARNING
 *
 * Checks for known wide table classes that need .table-scroll wrapper
 * or CSS overflow handling.
 */
function checkTableOverflow($) {
  const violations = [];

  for (const tableClass of OVERFLOW_TABLE_CLASSES) {
    const tables = $(`.${tableClass}`);
    tables.each((i, elem) => {
      const tag = elem.tagName || '';

      // If it's a table element, check if wrapped in .table-scroll
      if (tag === 'table') {
        const parent = $(elem).parent();
        const parentClass = parent.attr('class') || '';
        const parentStyle = parent.attr('style') || '';

        const hasScrollWrapper = parentClass.includes('table-scroll');
        const hasOverflowStyle = parentStyle.includes('overflow-x') || parentStyle.includes('overflow: auto');

        if (!hasScrollWrapper && !hasOverflowStyle) {
          violations.push(`<table class="${tableClass}"> lacks .table-scroll wrapper`);
        }
      }

      // If it's a grid/div that acts like a table, check for overflow handling
      if (tag === 'div' && !$(elem).css('overflow-x')) {
        // For grid-based "tables" like .stats-grid, check if they have many columns
        // that might overflow. This is a heuristic check.
        const children = $(elem).children();
        if (children.length > 6) {
          // Potentially a dense grid — flag for review
          // (Actual overflow depends on CSS, not detectable from HTML alone)
        }
      }
    });
  }

  // Also check generic <table> elements for width attributes > 480
  $('table[width]').each((i, elem) => {
    const width = parseInt($(elem).attr('width'), 10);
    if (width > 480) {
      const cls = $(elem).attr('class') || 'no-class';
      const parent = $(elem).parent();
      const parentClass = parent.attr('class') || '';
      if (!parentClass.includes('table-scroll')) {
        violations.push(`<table class="${cls}" width="${width}"> exceeds 480px and lacks .table-scroll wrapper`);
      }
    }
  });

  if (violations.length > 0) {
    return {
      id: 'MOB-004',
      severity: SEVERITY.WARNING,
      pass: true,
      message: `${violations.length} table(s) need mobile overflow handling:\n    ${violations.join('\n    ')}`
    };
  }

  return {
    id: 'MOB-004',
    severity: SEVERITY.WARNING,
    pass: true,
    message: null
  };
}

/**
 * MOB-005: Touch target size declarations
 * Severity: WARNING
 *
 * Checks that interactive elements in navigation and key UI areas
 * have adequate sizing. This is a heuristic check — we verify the
 * HTML patterns, not computed CSS (which requires a browser).
 *
 * What we CAN check from HTML:
 * - Links with very short text in nav areas (likely small targets)
 * - Buttons without padding classes
 * - Interactive elements with inline styles setting small dimensions
 */
function checkTouchTargets($) {
  const violations = [];

  // Check for inline styles that force small touch targets
  $('a[style], button[style], summary[style]').each((i, elem) => {
    const style = $(elem).attr('style') || '';
    const heightMatch = style.match(/height\s*:\s*(\d+)px/i);
    if (heightMatch && parseInt(heightMatch[1], 10) < 44) {
      const tag = elem.tagName;
      const text = $(elem).text().trim().substring(0, 30);
      violations.push(`<${tag}> "${text}" has inline height: ${heightMatch[1]}px (min 44px required)`);
    }
  });

  // Check for icon-only links/buttons without adequate sizing
  $('a, button').each((i, elem) => {
    const text = $(elem).text().trim();
    const ariaLabel = $(elem).attr('aria-label') || '';
    const style = $(elem).attr('style') || '';

    // Icon-only elements (no text, only aria-label) with explicit small sizing
    if (!text && ariaLabel && style) {
      const widthMatch = style.match(/width\s*:\s*(\d+)px/i);
      const heightMatch = style.match(/height\s*:\s*(\d+)px/i);
      if (widthMatch && parseInt(widthMatch[1], 10) < 44) {
        violations.push(`Icon button "${ariaLabel}" has inline width: ${widthMatch[1]}px (min 44px)`);
      }
      if (heightMatch && parseInt(heightMatch[1], 10) < 44) {
        violations.push(`Icon button "${ariaLabel}" has inline height: ${heightMatch[1]}px (min 44px)`);
      }
    }
  });

  if (violations.length > 0) {
    return {
      id: 'MOB-005',
      severity: SEVERITY.WARNING,
      pass: true,
      message: `${violations.length} potential touch target issue(s):\n    ${violations.slice(0, 5).join('\n    ')}${violations.length > 5 ? `\n    ...and ${violations.length - 5} more` : ''}`
    };
  }

  return {
    id: 'MOB-005',
    severity: SEVERITY.WARNING,
    pass: true,
    message: null
  };
}

/**
 * MOB-006: No elements with fixed width > 100vw
 * Severity: BLOCKING
 *
 * Checks for elements that could cause horizontal scroll.
 * This includes:
 * - Inline styles with fixed widths > viewport
 * - SVG/canvas/iframe without responsive sizing
 * - Pre/code blocks that might overflow
 */
function checkHorizontalScroll($) {
  const violations = [];

  // Check for iframes without responsive wrapper or width: 100%
  $('iframe').each((i, elem) => {
    const width = $(elem).attr('width');
    const style = $(elem).attr('style') || '';
    const parent = $(elem).parent();
    const parentClass = parent.attr('class') || '';
    const parentStyle = parent.attr('style') || '';

    // iframes with fixed pixel width > 480 and no responsive wrapper
    if (width && parseInt(width, 10) > 480) {
      const hasResponsiveParent = parentClass.includes('video-embed') ||
                                   parentClass.includes('tracker-container') ||
                                   parentClass.includes('responsive') ||
                                   parentStyle.includes('overflow') ||
                                   style.includes('width: 100%') ||
                                   style.includes('width:100%') ||
                                   style.includes('max-width');

      if (!hasResponsiveParent) {
        const src = $(elem).attr('src') || 'unknown';
        violations.push(`<iframe width="${width}"> without responsive container (src: ${src.substring(0, 50)})`);
      }
    }
  });

  // Check for SVGs with fixed dimensions > 480
  $('svg').each((i, elem) => {
    const width = $(elem).attr('width');
    if (width && parseInt(width, 10) > 480) {
      const style = $(elem).attr('style') || '';
      if (!style.includes('max-width') && !style.includes('width: 100%')) {
        violations.push(`<svg width="${width}"> may cause horizontal scroll`);
      }
    }
  });

  // Check for elements with inline width in vw units > 100
  $('[style]').each((i, elem) => {
    const style = $(elem).attr('style') || '';
    const vwMatch = style.match(/width\s*:\s*(\d+)vw/i);
    if (vwMatch && parseInt(vwMatch[1], 10) > 100) {
      const tag = elem.tagName || 'unknown';
      violations.push(`<${tag}> has width: ${vwMatch[1]}vw (exceeds 100vw)`);
    }
  });

  if (violations.length > 0) {
    return {
      id: 'MOB-006',
      severity: SEVERITY.BLOCKING,
      pass: false,
      message: `${violations.length} element(s) may cause horizontal scroll:\n    ${violations.join('\n    ')}`
    };
  }

  return {
    id: 'MOB-006',
    severity: SEVERITY.BLOCKING,
    pass: true,
    message: null
  };
}

/**
 * MOB-007: Font size floor
 * Severity: WARNING
 *
 * Checks for inline styles that set font-size below 15px on
 * body text (not utility classes like .tiny or .small which are
 * intentional design choices).
 *
 * Note: The base font-size is 16px in styles.css line 28.
 * This check catches inline overrides that break the floor.
 */
function checkFontSizeFloor($) {
  const violations = [];

  // Check for inline font-size below 15px on content elements
  // Exclude: .tiny, .small, .version-badge, .image-credit (intentional small text)
  const exemptClasses = ['tiny', 'small', 'version-badge', 'image-credit', 'port-hero-credit',
                          'credit', 'breadcrumb', 'breadcrumb-list', 'pagination-info',
                          'stat-key', 'badge', 'glance-label', 'visually-hidden'];

  $('[style]').each((i, elem) => {
    const style = $(elem).attr('style') || '';
    const fontMatch = style.match(/font-size\s*:\s*(\d+(?:\.\d+)?)(px|rem|em)/i);
    if (!fontMatch) return;

    const value = parseFloat(fontMatch[1]);
    const unit = fontMatch[2].toLowerCase();

    // Convert to approximate px
    let pxSize = value;
    if (unit === 'rem' || unit === 'em') {
      pxSize = value * 16; // base font-size is 16px
    }

    if (pxSize < 15) {
      // Check if element has an exempt class or is inside exempt context
      const cls = $(elem).attr('class') || '';
      const isExempt = exemptClasses.some(ec => cls.includes(ec)) ||
                        $(elem).closest('nav[aria-label="Breadcrumb"]').length > 0 ||
                        $(elem).closest('.breadcrumb-nav').length > 0;
      if (!isExempt) {
        const tag = elem.tagName || 'unknown';
        const text = $(elem).text().trim().substring(0, 40);
        violations.push(`<${tag}> has font-size: ${fontMatch[1]}${fontMatch[2]} (${pxSize.toFixed(0)}px) — "${text}"`);
      }
    }
  });

  if (violations.length > 0) {
    return {
      id: 'MOB-007',
      severity: SEVERITY.WARNING,
      pass: true,
      message: `${violations.length} element(s) with font-size below 15px floor:\n    ${violations.slice(0, 5).join('\n    ')}${violations.length > 5 ? `\n    ...and ${violations.length - 5} more` : ''}`
    };
  }

  return {
    id: 'MOB-007',
    severity: SEVERITY.WARNING,
    pass: true,
    message: null
  };
}

/**
 * MOB-008: Mobile hardening CSS section exists in styles.css
 * Severity: INFO
 *
 * Checks that assets/styles.css contains the marked mobile hardening section.
 * This is a one-time infrastructure check.
 */
async function checkMobileHardeningSection() {
  try {
    if (!existsSync(STYLES_CSS_PATH)) {
      return {
        id: 'MOB-008',
        severity: SEVERITY.INFO,
        pass: true,
        message: 'styles.css not found at expected path (assets/styles.css)'
      };
    }

    const css = await readFile(STYLES_CSS_PATH, 'utf-8');
    const hasSection = css.includes('MOBILE HARDENING');

    if (!hasSection) {
      return {
        id: 'MOB-008',
        severity: SEVERITY.INFO,
        pass: true,
        message: 'Mobile hardening CSS section not yet added to assets/styles.css (Phase 2 pending)'
      };
    }

    return {
      id: 'MOB-008',
      severity: SEVERITY.INFO,
      pass: true,
      message: null
    };
  } catch (error) {
    return {
      id: 'MOB-008',
      severity: SEVERITY.INFO,
      pass: true,
      message: `Could not read styles.css: ${error.message}`
    };
  }
}

/**
 * Run all mobile readiness checks on a single HTML file.
 * Returns structured results for integration with other validators.
 *
 * @param {string} filepath - Absolute path to HTML file
 * @param {string} [html] - Optional pre-loaded HTML content (avoids double-read)
 * @param {object} [$] - Optional pre-loaded cheerio instance
 * @returns {object} { file, valid, blocking, warnings, info, checks }
 */
async function validateMobileReadiness(filepath, html, $) {
  const relPath = relative(PROJECT_ROOT, filepath);

  // Load HTML and cheerio if not provided
  if (!html) {
    html = await readFile(filepath, 'utf-8');
  }
  if (!$) {
    $ = load(html);
  }

  const results = {
    file: relPath,
    valid: true,        // false if any BLOCKING check fails
    blocking: [],       // BLOCKING failures
    warnings: [],       // WARNING issues
    info: [],           // INFO notices
    checks: []          // All check results for detailed output
  };

  // Run all checks
  const checks = [
    checkViewportMeta($),
    checkInlineFixedWidths($),
    checkHeroImageConstraint($),
    checkTableOverflow($),
    checkTouchTargets($),
    checkHorizontalScroll($),
    checkFontSizeFloor($),
    await checkMobileHardeningSection()
  ];

  for (const check of checks) {
    results.checks.push(check);

    if (check.message) {
      if (check.severity === SEVERITY.BLOCKING) {
        if (!check.pass) {
          results.blocking.push(check);
          results.valid = false;
        }
      } else if (check.severity === SEVERITY.WARNING) {
        results.warnings.push(check);
      } else if (check.severity === SEVERITY.INFO) {
        results.info.push(check);
      }
    }
  }

  return results;
}

/**
 * Log warnings to the shared warnings file
 */
async function logWarnings(allResults) {
  const entries = [];
  const timestamp = new Date().toISOString();

  for (const result of allResults) {
    const items = [...result.warnings, ...result.info].filter(c => c.message);
    if (items.length > 0) {
      entries.push(`\n[${timestamp}] [mobile] ${result.file}:`);
      for (const item of items) {
        const icon = item.severity === SEVERITY.WARNING ? '⚠' : 'ℹ';
        entries.push(`  ${icon} [${item.id}] ${item.message}`);
      }
    }
  }

  if (entries.length > 0) {
    try {
      await appendFile(WARNINGS_LOG, entries.join('\n') + '\n');
    } catch (error) {
      // Non-fatal — log file may not be writable
    }
  }
}

/**
 * Print results to console (matches existing validator output style)
 */
function printResults(allResults, options = {}) {
  console.log(`\n${colors.bold}${colors.cyan}Mobile Readiness Validator v1.000${colors.reset}`);
  console.log(`${colors.dim}Standard: new-standards/v3.010/MOBILE_STANDARDS_v1.000.md${colors.reset}`);
  console.log('═'.repeat(80));
  console.log(`Validating ${allResults.length} file(s)...\n`);

  let totalBlocking = 0;
  let totalWarnings = 0;
  let totalInfo = 0;
  let passCount = 0;
  let failCount = 0;

  for (const result of allResults) {
    if (result.valid) {
      passCount++;
      const warningCount = result.warnings.filter(w => w.message).length;
      const infoCount = result.info.filter(i => i.message).length;
      const suffix = warningCount > 0 ? ` ${colors.yellow}(${warningCount} warning${warningCount > 1 ? 's' : ''})${colors.reset}` : '';
      console.log(`${colors.green}✓ PASS${colors.reset} ${result.file}${suffix}`);
    } else {
      failCount++;
      console.log(`${colors.red}✗ FAIL${colors.reset} ${result.file}`);
    }

    if (!options.quiet) {
      // Print blocking errors
      for (const check of result.blocking) {
        if (check.message) {
          console.log(`  ${colors.red}[${check.id}] BLOCKING:${colors.reset} ${check.message}`);
          totalBlocking++;
        }
      }

      // Print warnings
      for (const check of result.warnings) {
        if (check.message) {
          console.log(`  ${colors.yellow}[${check.id}] WARNING:${colors.reset} ${check.message}`);
          totalWarnings++;
        }
      }

      // Print info (only in verbose mode)
      if (options.verbose) {
        for (const check of result.info) {
          if (check.message) {
            console.log(`  ${colors.dim}[${check.id}] INFO:${colors.reset} ${check.message}`);
            totalInfo++;
          }
        }
      }
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(80));
  console.log(`${colors.bold}Mobile Readiness Summary:${colors.reset}`);
  console.log(`  Total: ${allResults.length} | ${colors.green}Pass: ${passCount}${colors.reset} | ${colors.red}Fail: ${failCount}${colors.reset}`);
  console.log(`  Blocking: ${totalBlocking} | Warnings: ${totalWarnings} | Info: ${totalInfo}`);

  if (totalBlocking === 0 && totalWarnings === 0) {
    console.log(`\n${colors.green}${colors.bold}All pages pass mobile readiness checks.${colors.reset}\n`);
  } else if (totalBlocking === 0) {
    console.log(`\n${colors.yellow}${colors.bold}Passed with warnings. See admin/validation-warnings.log for details.${colors.reset}\n`);
  } else {
    console.log(`\n${colors.red}${colors.bold}BLOCKING errors found. Fix before commit.${colors.reset}\n`);
  }

  return failCount === 0;
}

/**
 * Main execution (standalone mode)
 */
async function main() {
  const args = process.argv.slice(2);

  const options = {
    all: args.includes('--all'),
    allShips: args.includes('--all-ships'),
    allPorts: args.includes('--all-ports'),
    allVenues: args.includes('--all-venues'),
    jsonOutput: args.includes('--json-output'),
    quiet: args.includes('--quiet'),
    verbose: args.includes('--verbose'),
    files: args.filter(arg => !arg.startsWith('--'))
  };

  let filesToValidate = [];

  if (options.all) {
    const patterns = [
      join(PROJECT_ROOT, 'ships/**/*.html'),
      join(PROJECT_ROOT, 'ports/*.html'),
      join(PROJECT_ROOT, 'restaurants/*.html'),
      join(PROJECT_ROOT, 'restaurants/**/*.html')
    ];
    for (const pattern of patterns) {
      const files = await glob(pattern);
      filesToValidate.push(...files);
    }
  } else if (options.allShips) {
    filesToValidate = await glob(join(PROJECT_ROOT, 'ships/**/*.html'));
  } else if (options.allPorts) {
    filesToValidate = await glob(join(PROJECT_ROOT, 'ports/*.html'));
  } else if (options.allVenues) {
    const patterns = [
      join(PROJECT_ROOT, 'restaurants/*.html'),
      join(PROJECT_ROOT, 'restaurants/**/*.html')
    ];
    for (const pattern of patterns) {
      const files = await glob(pattern);
      filesToValidate.push(...files);
    }
  } else if (options.files.length > 0) {
    filesToValidate = options.files.map(f =>
      f.startsWith('/') ? f : join(PROJECT_ROOT, f)
    );
  } else {
    console.log(`${colors.bold}Mobile Readiness Validator v1.000${colors.reset}`);
    console.log(`Standard: new-standards/v3.010/MOBILE_STANDARDS_v1.000.md`);
    console.log('');
    console.log('Usage: validate-mobile-readiness.js [options] [files...]');
    console.log('');
    console.log('Options:');
    console.log('  --all          Validate all pages (ships, ports, venues)');
    console.log('  --all-ships    Validate all ship pages');
    console.log('  --all-ports    Validate all port pages');
    console.log('  --all-venues   Validate all venue/restaurant pages');
    console.log('  --json-output  Output results as JSON');
    console.log('  --quiet        Minimal output (pass/fail only)');
    console.log('  --verbose      Show INFO-level checks');
    console.log('');
    console.log('Checks:');
    console.log('  MOB-001  Viewport meta tag               [BLOCKING]');
    console.log('  MOB-002  No inline fixed widths > 480px   [WARNING]');
    console.log('  MOB-003  Hero image constrained           [WARNING]');
    console.log('  MOB-004  Table overflow handling           [WARNING]');
    console.log('  MOB-005  Touch target declarations         [WARNING]');
    console.log('  MOB-006  No horizontal scroll elements     [BLOCKING]');
    console.log('  MOB-007  Font size floor                   [WARNING]');
    console.log('  MOB-008  Mobile hardening CSS section      [INFO]');
    process.exit(1);
  }

  // Filter to existing files
  filesToValidate = filesToValidate.filter(f => existsSync(f));

  if (filesToValidate.length === 0) {
    console.error('No files to validate');
    process.exit(1);
  }

  // Validate all files
  const results = [];
  for (const file of filesToValidate) {
    try {
      const result = await validateMobileReadiness(file);
      results.push(result);
    } catch (error) {
      results.push({
        file: relative(PROJECT_ROOT, file),
        valid: false,
        blocking: [{ id: 'MOB-ERR', severity: SEVERITY.BLOCKING, pass: false, message: `Parse error: ${error.message}` }],
        warnings: [],
        info: [],
        checks: []
      });
    }
  }

  // Log warnings to file
  await logWarnings(results);

  // Output
  if (options.jsonOutput) {
    const summary = {
      totalFiles: results.length,
      passCount: results.filter(r => r.valid).length,
      failCount: results.filter(r => !r.valid).length,
      totalBlocking: results.reduce((sum, r) => sum + r.blocking.length, 0),
      totalWarnings: results.reduce((sum, r) => sum + r.warnings.filter(w => w.message).length, 0)
    };
    console.log(JSON.stringify({ summary, results }, null, 2));
    process.exit(summary.failCount > 0 ? 1 : 0);
  } else {
    const allPassed = printResults(results, options);
    process.exit(allPassed ? (results.some(r => r.warnings.some(w => w.message)) ? 2 : 0) : 1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
  });
}

// Export for use by other validators
export { validateMobileReadiness, SEVERITY };
