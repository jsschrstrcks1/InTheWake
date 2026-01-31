#!/usr/bin/env node
/**
 * Unified Page Validator - Swiss Army Knife
 * Soli Deo Gloria
 *
 * Detects page type and runs appropriate validators.
 *
 * Page Type Detection (in order of priority):
 * 1. HTML meta tag: <meta name="itw-page-type" content="ship|port|venue|article|index">
 * 2. HTML comment: <!-- ITW-PAGE-TYPE: ship -->
 * 3. File path pattern detection
 *
 * Supported page types:
 * - ship: Ship profile pages (validate-ship-page.js)
 * - ship-historic: Historic/retired ship pages (validate-historic-ship-page.js)
 * - port: Port/destination pages (validate-port-page-v2.js)
 * - venue: Venue pages (validate-venue-page-v2.js)
 * - article: Blog/article pages (validate-recent-articles.js)
 * - index: Index/listing pages (basic validation only)
 */

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname, relative, basename } from 'path';
import { fileURLToPath } from 'url';
import { load } from 'cheerio';
import { glob } from 'glob';
import { spawn } from 'child_process';

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

// Page type to validator mapping
const VALIDATORS = {
  'ship': 'validate-ship-page.js',
  'ship-historic': 'validate-historic-ship-page.js',
  'port': 'validate-port-page-v2.js',
  'article': 'validate-recent-articles.js',
  'venue': 'validate-venue-page-v2.js',
  'index': null  // Basic validation only
};

// Path patterns for page type detection
const PATH_PATTERNS = [
  { pattern: /^ships\/.*\/index\.html$/, type: 'index' },
  { pattern: /^ships\/.*\.html$/, type: 'ship' },
  { pattern: /^ports\/index\.html$/, type: 'index' },
  { pattern: /^ports\/.*\.html$/, type: 'port' },
  { pattern: /^cruise-lines\/.*\.html$/, type: 'index' },  // Cruise line pages use basic validation
  { pattern: /^restaurants\/.*\.html$/, type: 'venue' },
  { pattern: /^venues\/.*\.html$/, type: 'venue' },
  { pattern: /^articles\/.*\.html$/, type: 'article' },
  { pattern: /^blog\/.*\.html$/, type: 'article' },
  { pattern: /^index\.html$/, type: 'index' },
  { pattern: /^.*\/index\.html$/, type: 'index' }
];

// Historic ship indicators (for distinguishing ship vs ship-historic)
const HISTORIC_INDICATORS = [
  /\[HIST\]/i,
  /class="historic"/i,
  /data-ship-status="retired"/i,
  /data-ship-status="historic"/i,
  /<meta\s+name="ship-status"\s+content="(retired|historic|scrapped|sunk)"/i
];

/**
 * Detect page type from HTML content
 */
function detectPageTypeFromContent(html, filepath) {
  const $ = load(html);

  // Priority 1: Meta tag
  const metaPageType = $('meta[name="itw-page-type"]').attr('content');
  if (metaPageType && VALIDATORS.hasOwnProperty(metaPageType)) {
    return { type: metaPageType, method: 'meta-tag' };
  }

  // Priority 2: HTML comment
  const commentMatch = html.match(/<!--\s*ITW-PAGE-TYPE:\s*(\w+(?:-\w+)?)\s*-->/i);
  if (commentMatch && VALIDATORS.hasOwnProperty(commentMatch[1].toLowerCase())) {
    return { type: commentMatch[1].toLowerCase(), method: 'html-comment' };
  }

  // Priority 3: Path-based detection
  const relPath = relative(PROJECT_ROOT, filepath);
  for (const { pattern, type } of PATH_PATTERNS) {
    if (pattern.test(relPath)) {
      // For ship pages, check if it's historic
      if (type === 'ship') {
        for (const indicator of HISTORIC_INDICATORS) {
          if (indicator.test(html)) {
            return { type: 'ship-historic', method: 'path-pattern+historic-indicator' };
          }
        }
      }
      return { type, method: 'path-pattern' };
    }
  }

  // Default: unknown
  return { type: 'unknown', method: 'none' };
}

/**
 * Run external validator script
 */
async function runValidator(validatorScript, filepath, options = {}) {
  return new Promise((resolve) => {
    const scriptPath = join(__dirname, validatorScript);

    if (!existsSync(scriptPath)) {
      resolve({
        success: false,
        error: `Validator script not found: ${validatorScript}`,
        output: ''
      });
      return;
    }

    const args = [scriptPath, filepath];
    if (options.jsonOutput) args.push('--json-output');
    if (options.quiet) args.push('--quiet');

    const isShell = validatorScript.endsWith('.sh');
    const cmd = isShell ? 'bash' : 'node';

    const proc = spawn(cmd, args, {
      cwd: PROJECT_ROOT,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });

    proc.on('close', (code) => {
      resolve({
        success: code === 0 || code === 2,  // 0 = pass, 2 = warnings only (still a pass)
        exitCode: code,
        output: stdout,
        error: stderr
      });
    });

    proc.on('error', (err) => {
      resolve({
        success: false,
        error: err.message,
        output: ''
      });
    });
  });
}

/**
 * Check if a page is a redirect stub
 */
function isRedirectPage($, html) {
  // Check for meta refresh redirect
  const hasMetaRefresh = $('meta[http-equiv="refresh"]').length > 0;

  // Check for JavaScript redirect
  const hasJsRedirect = html.includes('window.location.replace(') ||
                        html.includes('window.location.href=') ||
                        html.includes('window.location.href =');

  // Check for noindex (often used on redirects)
  const robotsMeta = $('meta[name="robots"]').attr('content') || '';
  const isNoindex = robotsMeta.toLowerCase().includes('noindex');

  return hasMetaRefresh || (hasJsRedirect && isNoindex);
}

/**
 * Check if a page appears truncated (head content but no body content)
 */
function isTruncatedPage($, html) {
  const bodyContent = $('body').html() || '';
  const hasHead = $('head').length > 0;

  // A truncated page has a head but very little body content
  // (less than 100 chars after stripping whitespace and simple redirect messages)
  const cleanBody = bodyContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                               .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                               .replace(/<[^>]+>/g, '')
                               .replace(/\s+/g, ' ')
                               .trim();

  return hasHead && cleanBody.length < 100 && !isRedirectPage($, html);
}

/**
 * Run basic validation (for all page types)
 */
async function runBasicValidation($, html, filepath) {
  const errors = [];
  const warnings = [];

  // Check if this is a redirect page (skip structural validation for these)
  const isRedirect = isRedirectPage($, html);

  // Check if page appears truncated
  const isTruncated = isTruncatedPage($, html);
  if (isTruncated) {
    errors.push({ rule: 'truncated', message: 'Page appears truncated - missing body content' });
  }

  // Check for required meta tags
  const charset = $('meta[charset]').attr('charset');
  if (!charset || charset.toLowerCase() !== 'utf-8') {
    errors.push({ rule: 'charset', message: 'Missing or incorrect charset meta tag (should be UTF-8)' });
  }

  const viewport = $('meta[name="viewport"]').attr('content');
  if (!viewport) {
    errors.push({ rule: 'viewport', message: 'Missing viewport meta tag' });
  }

  // Check for title
  const title = $('title').text();
  if (!title || title.length < 10) {
    errors.push({ rule: 'title', message: 'Missing or too short page title' });
  }

  // Check for description (skip for redirects)
  if (!isRedirect) {
    const description = $('meta[name="description"]').attr('content');
    if (!description || description.length < 50) {
      warnings.push({ rule: 'description', message: 'Missing or too short meta description' });
    }
  }

  // Check for canonical URL
  const canonical = $('link[rel="canonical"]').attr('href');
  if (!canonical) {
    warnings.push({ rule: 'canonical', message: 'Missing canonical URL' });
  }

  // Check for analytics (required per CLAUDE.md)
  const hasGA = html.includes('googletagmanager.com/gtag/js') && html.includes('G-WZP891PZXJ');
  const hasUmami = html.includes('cloud.umami.is/script.js');

  if (!hasGA) {
    errors.push({ rule: 'google_analytics', message: 'Missing Google Analytics script' });
  }
  if (!hasUmami) {
    errors.push({ rule: 'umami', message: 'Missing Umami Analytics script' });
  }

  // Check for proper HTML5 structure (skip for redirect pages)
  if (!isRedirect && !isTruncated) {
    if (!$('header').length) {
      warnings.push({ rule: 'structure', message: 'Missing <header> element' });
    }
    if (!$('main').length) {
      errors.push({ rule: 'structure', message: 'Missing <main> element' });
    }
    if (!$('footer').length) {
      warnings.push({ rule: 'structure', message: 'Missing <footer> element' });
    }
  }

  // Check for broken image references (local images that don't exist)
  const localImages = [];
  $('img').each((i, elem) => {
    const src = $(elem).attr('src') || '';
    if (src.startsWith('/') && !src.startsWith('//')) {
      // Strip query string and hash from path before checking
      const cleanSrc = src.split('?')[0].split('#')[0];
      const imgPath = join(PROJECT_ROOT, cleanSrc);
      if (!existsSync(imgPath)) {
        localImages.push(src);
      }
    }
  });

  if (localImages.length > 0) {
    errors.push({
      rule: 'missing_images',
      message: `${localImages.length} local image(s) not found: ${localImages.slice(0, 3).join(', ')}${localImages.length > 3 ? '...' : ''}`
    });
  }

  return { errors, warnings, isRedirect, isTruncated };
}

/**
 * Validate a single page
 */
async function validatePage(filepath, options = {}) {
  const relPath = relative(PROJECT_ROOT, filepath);
  const result = {
    file: relPath,
    pageType: null,
    detectionMethod: null,
    valid: true,
    basicValidation: { errors: [], warnings: [] },
    typeValidation: { success: true, output: '' }
  };

  try {
    const html = await readFile(filepath, 'utf-8');
    const $ = load(html);

    // Detect page type
    const detection = detectPageTypeFromContent(html, filepath);
    result.pageType = detection.type;
    result.detectionMethod = detection.method;

    // Run basic validation
    const basicResult = await runBasicValidation($, html, filepath);
    result.basicValidation = basicResult;

    // Run type-specific validator if available
    const validatorScript = VALIDATORS[result.pageType];
    if (validatorScript) {
      const typeResult = await runValidator(validatorScript, filepath, options);
      result.typeValidation = typeResult;
      result.valid = typeResult.success && basicResult.errors.length === 0;
    } else if (result.pageType === 'unknown') {
      result.typeValidation = {
        success: false,
        output: '',
        error: 'Unknown page type - could not determine appropriate validator'
      };
      result.valid = false;
    } else {
      // Index pages - only basic validation
      result.valid = basicResult.errors.length === 0;
    }

  } catch (error) {
    result.valid = false;
    result.basicValidation.errors.push({
      rule: 'file_read',
      message: `Failed to read file: ${error.message}`
    });
  }

  return result;
}

/**
 * Print validation result
 */
function printResult(result, options = {}) {
  if (options.jsonOutput) {
    return;
  }

  const status = result.valid ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
  const typeColor = result.pageType === 'unknown' ? colors.red : colors.cyan;

  console.log(`${status} ${result.file} ${typeColor}[${result.pageType}]${colors.reset} ${colors.dim}(${result.detectionMethod})${colors.reset}`);

  if (!options.quiet) {
    // Print basic validation errors
    if (result.basicValidation.errors.length > 0) {
      result.basicValidation.errors.forEach(err => {
        console.log(`  ${colors.red}[basic/${err.rule}]${colors.reset} ${err.message}`);
      });
    }

    // Print basic validation warnings
    if (result.basicValidation.warnings.length > 0) {
      result.basicValidation.warnings.forEach(warn => {
        console.log(`  ${colors.yellow}[basic/${warn.rule}]${colors.reset} ${warn.message}`);
      });
    }

    // Print type validation errors if failed
    if (!result.typeValidation.success && result.typeValidation.error) {
      console.log(`  ${colors.red}[type-validator]${colors.reset} ${result.typeValidation.error}`);
    }
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  const options = {
    allPages: args.includes('--all'),
    allShips: args.includes('--all-ships'),
    allPorts: args.includes('--all-ports'),
    allVenues: args.includes('--all-venues'),
    jsonOutput: args.includes('--json-output'),
    quiet: args.includes('--quiet'),
    verbose: args.includes('--verbose'),
    detectOnly: args.includes('--detect-only'),
    files: args.filter(arg => !arg.startsWith('--'))
  };

  let filesToValidate = [];

  if (options.allPages) {
    const patterns = [
      join(PROJECT_ROOT, 'ships/**/*.html'),
      join(PROJECT_ROOT, 'ports/*.html'),
      join(PROJECT_ROOT, 'restaurants/*.html'),
      join(PROJECT_ROOT, 'restaurants/**/*.html'),
      join(PROJECT_ROOT, 'venues/**/*.html'),
      join(PROJECT_ROOT, 'articles/**/*.html')
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
    const venuePatterns = [
      join(PROJECT_ROOT, 'restaurants/*.html'),
      join(PROJECT_ROOT, 'restaurants/**/*.html')
    ];
    for (const pattern of venuePatterns) {
      const files = await glob(pattern);
      filesToValidate.push(...files);
    }
  } else if (options.files.length > 0) {
    filesToValidate = options.files.map(f =>
      f.startsWith('/') ? f : join(PROJECT_ROOT, f)
    );
  } else {
    console.log(`${colors.bold}Unified Page Validator - Swiss Army Knife${colors.reset}`);
    console.log('');
    console.log('Usage: validate.js [options] [files...]');
    console.log('');
    console.log('Options:');
    console.log('  --all          Validate all pages (ships, ports, venues, articles)');
    console.log('  --all-ships    Validate all ship pages');
    console.log('  --all-ports    Validate all port pages');
    console.log('  --all-venues   Validate all venue/restaurant pages');
    console.log('  --json-output  Output results as JSON');
    console.log('  --quiet        Minimal output');
    console.log('  --verbose      Show type-specific validator output');
    console.log('  --detect-only  Only detect page types, don\'t run validators');
    console.log('');
    console.log('Page Type Detection:');
    console.log('  1. <meta name="itw-page-type" content="ship|port|venue|article|index">');
    console.log('  2. <!-- ITW-PAGE-TYPE: ship -->');
    console.log('  3. File path pattern matching');
    console.log('');
    console.log('Supported page types:');
    Object.entries(VALIDATORS).forEach(([type, validator]) => {
      console.log(`  ${colors.cyan}${type}${colors.reset}: ${validator || 'basic validation only'}`);
    });
    process.exit(1);
  }

  if (filesToValidate.length === 0) {
    console.error('No files to validate');
    process.exit(1);
  }

  // Filter out non-existent files
  filesToValidate = filesToValidate.filter(f => existsSync(f));

  console.log(`\n${colors.bold}${colors.cyan}Unified Page Validator${colors.reset}`);
  console.log('═'.repeat(80));
  console.log(`Validating ${filesToValidate.length} file(s)...\n`);

  const results = [];
  const stats = {
    total: 0,
    passed: 0,
    failed: 0,
    byType: {}
  };

  for (const file of filesToValidate) {
    const result = await validatePage(file, options);
    results.push(result);

    stats.total++;
    if (result.valid) stats.passed++;
    else stats.failed++;

    // Track by type
    const type = result.pageType || 'unknown';
    if (!stats.byType[type]) {
      stats.byType[type] = { total: 0, passed: 0, failed: 0 };
    }
    stats.byType[type].total++;
    if (result.valid) stats.byType[type].passed++;
    else stats.byType[type].failed++;

    printResult(result, options);

    // Print verbose output if requested
    if (options.verbose && result.typeValidation.output) {
      console.log(colors.dim + result.typeValidation.output + colors.reset);
    }
  }

  // Print summary
  console.log('\n' + '═'.repeat(80));
  console.log(`${colors.bold}Summary:${colors.reset}`);
  console.log(`  Total: ${stats.total} | ${colors.green}Passed: ${stats.passed}${colors.reset} | ${colors.red}Failed: ${stats.failed}${colors.reset}`);
  console.log('');
  console.log(`${colors.bold}By Page Type:${colors.reset}`);
  Object.entries(stats.byType).sort((a, b) => b[1].total - a[1].total).forEach(([type, s]) => {
    const passRate = ((s.passed / s.total) * 100).toFixed(0);
    const color = passRate >= 90 ? colors.green : passRate >= 70 ? colors.yellow : colors.red;
    console.log(`  ${colors.cyan}${type}${colors.reset}: ${s.total} total, ${color}${passRate}% pass${colors.reset}`);
  });

  if (options.jsonOutput) {
    console.log(JSON.stringify({ results, stats }, null, 2));
  }

  process.exit(stats.failed > 0 ? 1 : 0);
}

main().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
