#!/usr/bin/env node
/**
 * Recent Articles Rail Validator + ICP-Lite v1.4 Checks
 * Soli Deo Gloria
 *
 * Validates Recent Stories section pattern across HTML files.
 * Also validates ICP-Lite v1.4 compliance for pages with recent-rail.
 *
 * Checks:
 * - Recent Stories: pagination, thumbnails, no duplicates
 * - ICP-Lite v1.4: dual-cap summary, JSON-LD mirroring, protocol version
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

// Files/patterns to skip validation
const SKIP_PATTERNS = [
  /solo\.html$/, // solo.html uses different pattern
  /solo\/articles\//, // article fragments
  /\.git\//,
  /node_modules\//,
  /admin\//,
  /\.claude\//
];

// Entity page patterns (for mainEntity check)
const ENTITY_PATTERNS = ['ships/', 'ports/', 'restaurants/'];

/**
 * Check if file should be skipped
 */
function shouldSkip(filepath) {
  return SKIP_PATTERNS.some(pattern => pattern.test(filepath));
}

/**
 * Check if file path indicates an entity page
 */
function isEntityPage(filepath) {
  return ENTITY_PATTERNS.some(pattern => filepath.includes(pattern));
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

// ============================================
// ICP-Lite v1.4 Validation Functions
// ============================================

/**
 * Extract meta tags and check for duplicates
 */
function extractMetaTags($) {
  const errors = [];

  const aiSummaryTags = $('meta[name="ai-summary"]');
  const lastReviewedTags = $('meta[name="last-reviewed"]');
  const protocolTags = $('meta[name="content-protocol"]');

  if (aiSummaryTags.length > 1) {
    errors.push({
      section: 'icp_lite',
      rule: 'duplicate_ai_summary',
      message: `Duplicate ai-summary meta tags (${aiSummaryTags.length} instances)`,
      severity: 'BLOCKING'
    });
  }
  if (lastReviewedTags.length > 1) {
    errors.push({
      section: 'icp_lite',
      rule: 'duplicate_last_reviewed',
      message: `Duplicate last-reviewed meta tags (${lastReviewedTags.length} instances)`,
      severity: 'BLOCKING'
    });
  }

  return {
    aiSummary: aiSummaryTags.first().attr('content') || '',
    lastReviewed: lastReviewedTags.first().attr('content') || '',
    protocol: protocolTags.first().attr('content') || '',
    duplicateErrors: errors
  };
}

/**
 * Extract JSON-LD scripts
 */
function extractJSONLD($) {
  const jsonldScripts = $('script[type="application/ld+json"]');
  const jsonldData = [];

  jsonldScripts.each((i, elem) => {
    try {
      const content = $(elem).html();
      if (content) jsonldData.push(JSON.parse(content));
    } catch (e) {
      // Invalid JSON-LD
    }
  });

  return jsonldData;
}

/**
 * Find WebPage JSON-LD
 */
function findWebPage(jsonldData) {
  const webpages = [];
  for (const data of jsonldData) {
    if (data['@type'] === 'WebPage') webpages.push(data);
    if (data['@graph'] && Array.isArray(data['@graph'])) {
      webpages.push(...data['@graph'].filter(item => item['@type'] === 'WebPage'));
    }
  }
  return { webpage: webpages[0] || null, count: webpages.length };
}

/**
 * Validate ICP-Lite v1.4 compliance
 */
function validateICPLite($, filepath) {
  const errors = [];
  const warnings = [];

  const meta = extractMetaTags($);
  const jsonldData = extractJSONLD($);

  // Add duplicate errors
  errors.push(...meta.duplicateErrors);

  // Check protocol version
  if (meta.protocol !== 'ICP-Lite v1.4') {
    errors.push({
      section: 'icp_lite',
      rule: 'protocol_version',
      message: `Expected "ICP-Lite v1.4", found "${meta.protocol || 'none'}"`,
      severity: 'BLOCKING'
    });
  }

  // Validate ai-summary (dual-cap rule)
  if (!meta.aiSummary) {
    errors.push({
      section: 'icp_lite',
      rule: 'ai_summary_missing',
      message: 'ai-summary meta tag is missing',
      severity: 'BLOCKING'
    });
  } else if (meta.aiSummary.length > 250) {
    errors.push({
      section: 'icp_lite',
      rule: 'ai_summary_length',
      message: `ai-summary exceeds 250 chars (${meta.aiSummary.length})`,
      severity: 'BLOCKING'
    });
  } else if (meta.aiSummary.length < 100) {
    warnings.push({
      section: 'icp_lite',
      rule: 'ai_summary_short',
      message: `ai-summary is short (${meta.aiSummary.length} chars)`,
      severity: 'WARNING'
    });
  }

  // Validate last-reviewed format
  if (!meta.lastReviewed) {
    errors.push({
      section: 'icp_lite',
      rule: 'last_reviewed_missing',
      message: 'last-reviewed meta tag is missing',
      severity: 'BLOCKING'
    });
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.lastReviewed)) {
    errors.push({
      section: 'icp_lite',
      rule: 'last_reviewed_format',
      message: `last-reviewed must be YYYY-MM-DD, found "${meta.lastReviewed}"`,
      severity: 'BLOCKING'
    });
  }

  // Validate JSON-LD WebPage
  const webpageResult = findWebPage(jsonldData);
  if (webpageResult.count > 1) {
    errors.push({
      section: 'icp_lite',
      rule: 'duplicate_webpage',
      message: `Duplicate WebPage JSON-LD (${webpageResult.count} instances)`,
      severity: 'BLOCKING'
    });
  }

  if (!webpageResult.webpage) {
    errors.push({
      section: 'icp_lite',
      rule: 'missing_webpage',
      message: 'Missing WebPage JSON-LD schema',
      severity: 'BLOCKING'
    });
  } else {
    // Check mirroring
    const desc = normalize(webpageResult.webpage.description || '');
    const summary = normalize(meta.aiSummary);
    if (desc !== summary) {
      errors.push({
        section: 'icp_lite',
        rule: 'description_mismatch',
        message: 'WebPage description must match ai-summary',
        severity: 'BLOCKING'
      });
    }

    const dateModified = webpageResult.webpage.dateModified || '';
    if (dateModified !== meta.lastReviewed) {
      errors.push({
        section: 'icp_lite',
        rule: 'datemodified_mismatch',
        message: `dateModified (${dateModified}) must match last-reviewed (${meta.lastReviewed})`,
        severity: 'BLOCKING'
      });
    }

    // Check mainEntity for entity pages
    if (isEntityPage(filepath) && !webpageResult.webpage.mainEntity) {
      errors.push({
        section: 'icp_lite',
        rule: 'missing_mainentity',
        message: 'Entity page missing mainEntity in WebPage JSON-LD',
        severity: 'BLOCKING'
      });
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate Recent Stories section pattern
 */
function validateRecentStoriesPattern($, html) {
  const errors = [];
  const warnings = [];
  const info = [];

  // Check if page has recent-rail (if not, might not need this section)
  const hasRecentRail = $('#recent-rail').length > 0;
  if (!hasRecentRail) {
    info.push({
      section: 'recent_stories',
      rule: 'no_recent_rail',
      message: 'No recent-rail section found (may not be required for this page)',
      severity: 'INFO'
    });
    return { valid: true, errors, warnings, info, hasSection: false };
  }

  // Check 1: Has pagination nav (top)
  const hasNavTop = $('#recent-rail-nav-top').length > 0;
  if (!hasNavTop) {
    errors.push({
      section: 'recent_stories',
      rule: 'missing_nav_top',
      message: 'Missing #recent-rail-nav-top for pagination',
      severity: 'BLOCKING'
    });
  }

  // Check 2: Has pagination nav (bottom)
  const hasNavBottom = $('#recent-rail-nav-bottom').length > 0;
  if (!hasNavBottom) {
    errors.push({
      section: 'recent_stories',
      rule: 'missing_nav_bottom',
      message: 'Missing #recent-rail-nav-bottom for pagination',
      severity: 'BLOCKING'
    });
  }

  // Check 3: Has fallback element
  const hasFallback = $('#recent-rail-fallback').length > 0;
  if (!hasFallback) {
    warnings.push({
      section: 'recent_stories',
      rule: 'missing_fallback',
      message: 'Missing #recent-rail-fallback for loading state',
      severity: 'WARNING'
    });
  }

  // Check 4: Check for authors rail (optional but recommended)
  const hasAuthorsRail = $('#authors-rail').length > 0;
  if (!hasAuthorsRail) {
    warnings.push({
      section: 'recent_stories',
      rule: 'missing_authors_rail',
      message: 'Missing #authors-rail section (recommended)',
      severity: 'WARNING'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
    hasSection: true,
    data: {
      hasNavTop,
      hasNavBottom,
      hasFallback,
      hasAuthorsRail
    }
  };
}

/**
 * Validate JavaScript implementation
 */
function validateJavaScript($, html) {
  const errors = [];
  const warnings = [];
  const info = [];

  // Count occurrences of key patterns
  const loadArticlesCount = (html.match(/async function loadArticles/g) || []).length;
  const recentRailOldCount = (html.match(/function recentRail/g) || []).length;
  const scriptBlockCount = (html.match(/<!-- Recent Stories/g) || []).length;
  const oldThumbPattern = (html.match(/width:\s*72px;\s*height:\s*48px/g) || []).length;

  // Check 5: Duplicate loadArticles functions
  if (loadArticlesCount > 1) {
    errors.push({
      section: 'javascript',
      rule: 'duplicate_loadarticles',
      message: `DUPLICATE: ${loadArticlesCount} loadArticles() functions found`,
      severity: 'BLOCKING'
    });
  }

  // Check 6: Old-style recentRail function
  if (recentRailOldCount > 0) {
    errors.push({
      section: 'javascript',
      rule: 'old_style_function',
      message: `Found ${recentRailOldCount} old-style recentRail() function(s) - use new pattern`,
      severity: 'BLOCKING'
    });
  }

  // Check 7: Duplicate script blocks
  if (scriptBlockCount > 1) {
    errors.push({
      section: 'javascript',
      rule: 'duplicate_script_blocks',
      message: `DUPLICATE: ${scriptBlockCount} Recent Stories script blocks found`,
      severity: 'BLOCKING'
    });
  }

  // Check 8: Old thumbnail size
  if (oldThumbPattern > 0) {
    warnings.push({
      section: 'javascript',
      rule: 'old_thumbnail_size',
      message: `Found ${oldThumbPattern} old thumbnail size (72x48) - should be 56x56`,
      severity: 'WARNING'
    });
  }

  // Check 9: Missing script tag for JS code
  // Look for JS patterns not preceded by <script>
  const jsWithoutScriptTag = html.match(/\/\* ===== (Recent|Right-rail)/g) || [];
  if (jsWithoutScriptTag.length > 0) {
    // More specific check - look for the pattern context
    const lines = html.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('/* ===== Recent') || lines[i].includes('/* ===== Right-rail')) {
        // Check if previous line has <script>
        const prevLine = i > 0 ? lines[i - 1] : '';
        const prevPrevLine = i > 1 ? lines[i - 2] : '';
        if (!prevLine.includes('<script') && !prevPrevLine.includes('<script')) {
          errors.push({
            section: 'javascript',
            rule: 'missing_script_tag',
            message: `JS code at line ${i + 1} appears without <script> tag - will not execute!`,
            severity: 'BLOCKING'
          });
          break;
        }
      }
    }
  }

  // Check 10: Has required script pattern (loadArticles or similar)
  const hasRecentRail = html.includes('id="recent-rail"');
  const hasLoader = loadArticlesCount > 0 || html.includes('fetchJSONWithFallback');
  if (hasRecentRail && !hasLoader && loadArticlesCount === 0) {
    errors.push({
      section: 'javascript',
      rule: 'missing_loader',
      message: 'Has #recent-rail but no article loading script',
      severity: 'BLOCKING'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
    data: {
      loadArticlesCount,
      recentRailOldCount,
      scriptBlockCount,
      oldThumbPattern
    }
  };
}

/**
 * Validate a single HTML file
 */
async function validateFile(filepath) {
  const relPath = relative(PROJECT_ROOT, filepath);
  const results = {
    file: relPath,
    valid: true,
    score: 100,
    blocking_errors: [],
    warnings: [],
    info: []
  };

  // Check if should skip
  if (shouldSkip(filepath)) {
    results.skipped = true;
    results.info.push({
      section: 'file',
      rule: 'skipped',
      message: 'File matches skip pattern',
      severity: 'INFO'
    });
    return results;
  }

  try {
    const html = await readFile(filepath, 'utf-8');
    const $ = load(html);

    // Run validations
    const patternResult = validateRecentStoriesPattern($, html);
    const jsResult = validateJavaScript($, html);
    const icpResult = validateICPLite($, relPath);

    // Only report recent-rail errors if the page has the recent-rail section
    if (patternResult.hasSection) {
      results.blocking_errors.push(...patternResult.errors);
      results.blocking_errors.push(...jsResult.errors);
      results.warnings.push(...patternResult.warnings);
      results.warnings.push(...jsResult.warnings);
    }

    // Always check ICP-Lite v1.4 compliance
    results.blocking_errors.push(...icpResult.errors);
    results.warnings.push(...icpResult.warnings);

    results.info.push(...patternResult.info);
    results.info.push(...jsResult.info);

    // Calculate score
    results.score = 100;
    results.score -= results.blocking_errors.length * 15;
    results.score -= results.warnings.length * 5;
    results.score = Math.max(0, results.score);

    results.valid = results.blocking_errors.length === 0;
    results.hasRecentStories = patternResult.hasSection;
    results.pattern = patternResult.data;
    results.javascript = jsResult.data;
    results.icpLite = {
      errorsCount: icpResult.errors.length,
      warningsCount: icpResult.warnings.length
    };

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

  console.log(`\n${colors.bold}${colors.cyan}Recent Articles Rail Validation${colors.reset}`);
  console.log('═'.repeat(70));
  console.log();

  console.log(`${colors.bold}File:${colors.reset} ${results.file}`);

  if (results.skipped) {
    console.log(`${colors.dim}Skipped: ${results.info[0]?.message}${colors.reset}`);
    return true;
  }

  if (!results.hasRecentStories) {
    console.log(`${colors.dim}No Recent Stories section found in this file${colors.reset}`);
    return true;
  }

  // Score
  const scoreColor = results.score >= 90 ? colors.green : results.score >= 70 ? colors.yellow : colors.red;
  console.log(`${colors.bold}Score:${colors.reset} ${scoreColor}${results.score}/100${colors.reset}`);
  console.log(`${colors.bold}Status:${colors.reset} ${results.valid ? colors.green + '✓ PASS' : colors.red + '✗ FAIL'}${colors.reset}`);
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

  // Details
  if (!options.quiet) {
    if (results.pattern) {
      console.log(`${colors.bold}Recent Stories:${colors.reset}`);
      console.log(`  Nav Top: ${results.pattern.hasNavTop ? colors.green + '✓' : colors.red + '✗'}${colors.reset}`);
      console.log(`  Nav Bottom: ${results.pattern.hasNavBottom ? colors.green + '✓' : colors.red + '✗'}${colors.reset}`);
      console.log(`  Fallback: ${results.pattern.hasFallback ? colors.green + '✓' : colors.yellow + '○'}${colors.reset}`);
      console.log(`  Authors Rail: ${results.pattern.hasAuthorsRail ? colors.green + '✓' : colors.yellow + '○'}${colors.reset}`);
    }
    if (results.icpLite) {
      console.log(`${colors.bold}ICP-Lite v1.4:${colors.reset}`);
      const icpStatus = results.icpLite.errorsCount === 0 ? colors.green + '✓ Compliant' : colors.red + '✗ Non-compliant';
      console.log(`  Status: ${icpStatus}${colors.reset}`);
    }
    console.log();
  }

  console.log('═'.repeat(70));
  console.log();

  return results.valid;
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  const options = {
    allPages: args.includes('--all'),
    rootOnly: args.includes('--root-only'),
    jsonOutput: args.includes('--json-output'),
    quiet: args.includes('--quiet'),
    files: args.filter(arg => !arg.startsWith('--'))
  };

  let filesToValidate = [];

  if (options.allPages) {
    // All HTML files with recent-rail
    const allHtml = await glob(join(PROJECT_ROOT, '**/*.html'));
    for (const file of allHtml) {
      if (!shouldSkip(file)) {
        const content = await readFile(file, 'utf-8');
        if (content.includes('id="recent-rail"')) {
          filesToValidate.push(file);
        }
      }
    }
  } else if (options.rootOnly) {
    // Only root-level HTML files
    const rootHtml = await glob(join(PROJECT_ROOT, '*.html'));
    for (const file of rootHtml) {
      const content = await readFile(file, 'utf-8');
      if (content.includes('id="recent-rail"')) {
        filesToValidate.push(file);
      }
    }
  } else if (options.files.length > 0) {
    filesToValidate = options.files.map(f =>
      f.startsWith('/') ? f : join(PROJECT_ROOT, f)
    );
  } else {
    console.error('Usage: validate-recent-articles.js [options] [files...]');
    console.error('Options:');
    console.error('  --all          Validate all pages with recent-rail');
    console.error('  --root-only    Validate only root-level HTML files');
    console.error('  --json-output  Output results as JSON');
    console.error('  --quiet        Minimal output');
    process.exit(1);
  }

  if (filesToValidate.length === 0) {
    console.log('No files with recent-rail found to validate');
    process.exit(0);
  }

  // Single file validation
  if (filesToValidate.length === 1) {
    const result = await validateFile(filesToValidate[0]);
    const valid = printResults(result, options);
    process.exit(valid ? 0 : 1);
  }

  // Multiple files - summary output
  const results = [];
  for (const file of filesToValidate) {
    const result = await validateFile(file);
    results.push(result);
  }

  if (options.jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log(`\n${colors.bold}${colors.cyan}Recent Articles Rail Validation Report${colors.reset}`);
    console.log('═'.repeat(70));

    let passed = 0;
    let failed = 0;
    let skipped = 0;

    results.forEach(r => {
      if (r.skipped || !r.hasRecentStories) {
        skipped++;
        return;
      }
      const status = r.valid ? colors.green + '✓' : colors.red + '✗';
      const score = r.score >= 90 ? colors.green : r.score >= 70 ? colors.yellow : colors.red;
      console.log(`${status}${colors.reset} ${r.file} ${score}[${r.score}]${colors.reset} ${r.blocking_errors.length} errors, ${r.warnings.length} warnings`);

      if (r.valid) passed++;
      else failed++;
    });

    console.log('═'.repeat(70));
    console.log(`Total: ${results.length} | ${colors.green}Passed: ${passed}${colors.reset} | ${colors.red}Failed: ${failed}${colors.reset} | ${colors.dim}Skipped: ${skipped}${colors.reset}`);
    console.log();
  }

  const allValid = results.every(r => r.skipped || !r.hasRecentStories || r.valid);
  process.exit(allValid ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
  });
}

export { validateFile };
