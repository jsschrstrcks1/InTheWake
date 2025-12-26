#!/usr/bin/env node
/**
 * ICP-Lite v1.4 Validator
 * Soli Deo Gloria
 *
 * Validates HTML files for ICP-Lite v1.4 compliance:
 * - Dual-Cap summary rule (max 250 chars, first 155 standalone)
 * - JSON-LD mirroring (description = ai-summary, dateModified = last-reviewed)
 * - mainEntity requirement for entity pages
 * - Volatile data discipline
 */

import { readFile, readdir } from 'fs/promises';
import { join, dirname, relative, basename } from 'path';
import { fileURLToPath } from 'url';
import { load } from 'cheerio';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Load disclaimer registry
let DISCLAIMER_REGISTRY = null;
async function loadDisclaimerRegistry() {
  if (DISCLAIMER_REGISTRY !== null) return DISCLAIMER_REGISTRY;
  try {
    const registryPath = join(PROJECT_ROOT, 'admin', 'port-disclaimer-registry.json');
    const content = await readFile(registryPath, 'utf-8');
    DISCLAIMER_REGISTRY = JSON.parse(content);
    return DISCLAIMER_REGISTRY;
  } catch (error) {
    // Registry not found or invalid - validation will skip disclaimer checks
    DISCLAIMER_REGISTRY = {};
    return DISCLAIMER_REGISTRY;
  }
}

// Entity page patterns
const ENTITY_PATTERNS = [
  'ships/',
  'ports/',
  'restaurants/'
];

// Volatile data keywords
const VOLATILE_KEYWORDS = [
  /\$\d+\.?\d*/,  // Dollar amounts
  /package/i,
  /menu/i,
  /price/i,
  /hours?:/i,
  /policy/i
];

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

/**
 * Check if file path indicates an entity page
 */
function isEntityPage(filepath) {
  return ENTITY_PATTERNS.some(pattern => filepath.includes(pattern));
}

/**
 * Extract entity type from file path
 */
function getEntityType(filepath) {
  if (filepath.includes('ships/')) return { type: 'Product', category: 'Cruise Ship' };
  if (filepath.includes('ports/')) return { type: 'Place', category: 'Port of Call' };
  if (filepath.includes('restaurants/')) return { type: 'Restaurant', category: 'Dining Venue' };
  return null;
}

/**
 * Validate dual-cap summary rule
 * - Max 250 characters
 * - First ~155 characters must be a complete standalone sentence
 */
function validateDualCap(summary) {
  const errors = [];
  const warnings = [];

  if (!summary) {
    errors.push('ai-summary meta tag is missing or empty');
    return { valid: false, errors, warnings };
  }

  // Check max 250 chars
  if (summary.length > 250) {
    errors.push(`ai-summary exceeds 250 characters (${summary.length} chars)`);
  }

  // Check first 155 chars is standalone
  if (summary.length > 155) {
    const first155 = summary.substring(0, 155);

    // Heuristics for completeness
    const endsWithPunctuation = /[.!?]$/.test(first155.trim());
    const hasVerb = /\b(is|are|was|were|has|have|features?|provides?|offers?|helps?|includes?)\b/i.test(first155);

    if (!endsWithPunctuation && !hasVerb) {
      warnings.push('First 155 characters may not be a complete standalone sentence (consider adding period or complete thought)');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Extract meta tags from HTML and check for duplicates
 */
function extractMetaTags($) {
  const errors = [];

  // Check for duplicates
  const aiSummaryTags = $('meta[name="ai-summary"]');
  const lastReviewedTags = $('meta[name="last-reviewed"]');
  const protocolTags = $('meta[name="content-protocol"]');

  if (aiSummaryTags.length > 1) {
    errors.push(`Duplicate ai-summary meta tags found (${aiSummaryTags.length} instances). Should have exactly 1.`);
  }
  if (lastReviewedTags.length > 1) {
    errors.push(`Duplicate last-reviewed meta tags found (${lastReviewedTags.length} instances). Should have exactly 1.`);
  }
  if (protocolTags.length > 1) {
    errors.push(`Duplicate content-protocol meta tags found (${protocolTags.length} instances). Should have exactly 1.`);
  }

  const aiSummary = aiSummaryTags.first().attr('content') || '';
  const lastReviewed = lastReviewedTags.first().attr('content') || '';
  const protocol = protocolTags.first().attr('content') || '';

  return { aiSummary, lastReviewed, protocol, duplicateErrors: errors };
}

/**
 * Extract and parse JSON-LD scripts
 */
function extractJSONLD($) {
  const jsonldScripts = $('script[type="application/ld+json"]');
  const jsonldData = [];

  jsonldScripts.each((i, elem) => {
    try {
      const content = $(elem).html();
      if (content) {
        const data = JSON.parse(content);
        jsonldData.push(data);
      }
    } catch (e) {
      // Invalid JSON-LD, will be caught by validation
    }
  });

  return jsonldData;
}

/**
 * Find WebPage JSON-LD object and check for duplicates
 */
function findWebPage(jsonldData) {
  const webpages = [];

  for (const data of jsonldData) {
    if (data['@type'] === 'WebPage') {
      webpages.push(data);
    }
    // Check for @graph pattern
    if (data['@graph'] && Array.isArray(data['@graph'])) {
      const graphWebpages = data['@graph'].filter(item => item['@type'] === 'WebPage');
      webpages.push(...graphWebpages);
    }
  }

  return {
    webpage: webpages[0] || null,
    duplicateCount: webpages.length,
    hasDuplicates: webpages.length > 1
  };
}

/**
 * Normalize string for comparison (trim, collapse whitespace, decode entities)
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

/**
 * Validate JSON-LD mirroring
 */
function validateJSONLDMirroring(meta, jsonldData) {
  const errors = [];
  const warnings = [];

  const webpageResult = findWebPage(jsonldData);

  // Check for duplicate WebPage blocks
  if (webpageResult.hasDuplicates) {
    errors.push(`Duplicate WebPage JSON-LD blocks found (${webpageResult.duplicateCount} instances). Should have exactly 1.`);
  }

  if (!webpageResult.webpage) {
    errors.push('Missing WebPage JSON-LD schema');
    return { valid: false, errors, warnings };
  }

  const webpage = webpageResult.webpage;

  // Check description matches ai-summary
  const description = normalize(webpage.description || '');
  const aiSummary = normalize(meta.aiSummary);

  if (description !== aiSummary) {
    errors.push(`JSON-LD description does not match ai-summary meta tag\n  Expected: "${aiSummary}"\n  Found: "${description}"`);
  }

  // Check dateModified matches last-reviewed
  const dateModified = webpage.dateModified || '';
  const lastReviewed = meta.lastReviewed;

  if (dateModified !== lastReviewed) {
    errors.push(`JSON-LD dateModified does not match last-reviewed meta tag\n  Expected: "${lastReviewed}"\n  Found: "${dateModified}"`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate mainEntity for entity pages
 */
function validateMainEntity(filepath, jsonldData) {
  const errors = [];
  const warnings = [];

  if (!isEntityPage(filepath)) {
    // Not an entity page, skip this check
    return { valid: true, errors, warnings };
  }

  const webpageResult = findWebPage(jsonldData);

  if (!webpageResult.webpage) {
    errors.push('Entity page missing WebPage JSON-LD schema');
    return { valid: false, errors, warnings };
  }

  const webpage = webpageResult.webpage;

  if (!webpage.mainEntity) {
    const entityInfo = getEntityType(filepath);
    errors.push(`Entity page missing mainEntity in WebPage JSON-LD\n  Expected @type: "${entityInfo.type}"\n  Suggestion: Add mainEntity with appropriate schema type`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Check for volatile data without proper disclaimers
 */
function validateVolatileData($, html) {
  const warnings = [];

  // Check if page contains volatile data patterns
  let hasVolatileData = false;
  for (const pattern of VOLATILE_KEYWORDS) {
    if (pattern.test(html)) {
      hasVolatileData = true;
      break;
    }
  }

  if (!hasVolatileData) {
    return { valid: true, errors: [], warnings };
  }

  // Check for required disclaimer elements
  const hasAsOf = /as of \d{4}-\d{2}-\d{2}/i.test(html);
  const hasVerification = /(verified|observed|community-reported)/i.test(html);
  const hasDisclaimer = /subject to change/i.test(html);

  if (!hasAsOf || !hasVerification || !hasDisclaimer) {
    warnings.push('Page contains volatile data (prices, menus, policies) but missing proper disclaimers\n  Required: as-of date, verification posture, "subject to change" notice');
  }

  return {
    valid: true,
    errors: [],
    warnings
  };
}

/**
 * Extract port slug from filepath
 */
function extractPortSlug(filepath) {
  if (!filepath.includes('ports/')) return null;

  const filename = basename(filepath, '.html');
  return filename;
}

/**
 * Get expected disclaimer level for a port
 */
function getExpectedDisclaimerLevel(portSlug, registry) {
  if (!registry || !portSlug) return 1; // Default to Level 1

  // Check Level 3 (visited)
  if (registry.level_3_visited && registry.level_3_visited[portSlug]) {
    return 3;
  }

  // Check Level 2 (planned)
  if (registry.level_2_planned && registry.level_2_planned[portSlug]) {
    return 2;
  }

  // Default to Level 1
  return 1;
}

/**
 * Get visit count for ports visited multiple times
 */
function getVisitCount(portSlug, registry) {
  if (!registry || !portSlug) return null;

  if (registry.level_3_visited && registry.level_3_visited[portSlug]) {
    return registry.level_3_visited[portSlug].visit_count || 1;
  }

  return null;
}

/**
 * Validate disclaimer level matches registry
 */
async function validateDisclaimer(filepath, html) {
  const errors = [];
  const warnings = [];

  // Only validate port pages
  const portSlug = extractPortSlug(filepath);
  if (!portSlug) {
    return { valid: true, errors, warnings };
  }

  // Load registry
  const registry = await loadDisclaimerRegistry();
  if (!registry || Object.keys(registry).length === 0) {
    // Registry not available, skip validation
    return { valid: true, errors, warnings };
  }

  const expectedLevel = getExpectedDisclaimerLevel(portSlug, registry);
  const visitCount = getVisitCount(portSlug, registry);

  // Define disclaimer text patterns for each level
  const level1Pattern = /Until I have sailed this port myself.*soundings in another's wake/s;
  const level2Pattern = /my upcoming sailing.*I'm soon to trace/s;
  const level3Pattern = /I've sailed this port myself.*these notes come from my own wake/s;

  // Check which disclaimer is present
  let foundLevel = 0;
  if (level3Pattern.test(html)) foundLevel = 3;
  else if (level2Pattern.test(html)) foundLevel = 2;
  else if (level1Pattern.test(html)) foundLevel = 1;

  // Validate against expected level
  if (foundLevel === 0) {
    errors.push(`Port page missing required "Author's Note" disclaimer card\n  Expected Level ${expectedLevel} disclaimer for port: ${portSlug}`);
  } else if (foundLevel !== expectedLevel) {
    const levelNames = {1: 'Level 1 (not visited)', 2: 'Level 2 (visit planned)', 3: 'Level 3 (personally visited)'};
    errors.push(`Incorrect disclaimer level for port: ${portSlug}\n  Expected: ${levelNames[expectedLevel]}\n  Found: ${levelNames[foundLevel]}\n  Update disclaimer to match registry in admin/port-disclaimer-registry.json`);
  }

  // Check for visit count mention on Level 3 ports with multiple visits
  if (expectedLevel === 3 && visitCount && visitCount > 1) {
    const visitCountPattern = new RegExp(`visited.*${visitCount}.*times?`, 'i');
    if (!visitCountPattern.test(html)) {
      warnings.push(`Port visited ${visitCount} times - consider adding visit count to disclaimer\n  Suggestion: "I've visited ${portSlug} ${visitCount} times, and these notes reflect..."`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
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
    errors: [],
    warnings: []
  };

  try {
    const html = await readFile(filepath, 'utf-8');
    const $ = load(html);

    // Extract data
    const meta = extractMetaTags($);
    const jsonldData = extractJSONLD($);

    // Add duplicate errors first
    if (meta.duplicateErrors && meta.duplicateErrors.length > 0) {
      results.errors.push(...meta.duplicateErrors);
    }

    // 1. Check protocol version
    if (meta.protocol !== 'ICP-Lite v1.4') {
      results.errors.push(`Invalid or missing content-protocol. Expected "ICP-Lite v1.4", found "${meta.protocol}"`);
    }

    // 2. Validate dual-cap summary
    const dualCapResult = validateDualCap(meta.aiSummary);
    results.errors.push(...dualCapResult.errors);
    results.warnings.push(...dualCapResult.warnings);

    // 3. Validate JSON-LD mirroring
    const mirroringResult = validateJSONLDMirroring(meta, jsonldData);
    results.errors.push(...mirroringResult.errors);
    results.warnings.push(...mirroringResult.warnings);

    // 4. Validate mainEntity for entity pages
    const entityResult = validateMainEntity(relPath, jsonldData);
    results.errors.push(...entityResult.errors);
    results.warnings.push(...entityResult.warnings);

    // 5. Validate volatile data discipline
    const volatileResult = validateVolatileData($, html);
    results.warnings.push(...volatileResult.warnings);

    // 6. Validate disclaimer level (for port pages only)
    const disclaimerResult = await validateDisclaimer(relPath, html);
    results.errors.push(...disclaimerResult.errors);
    results.warnings.push(...disclaimerResult.warnings);

    results.valid = results.errors.length === 0;

  } catch (error) {
    results.errors.push(`Failed to parse file: ${error.message}`);
    results.valid = false;
  }

  return results;
}

/**
 * Print results to console
 */
function printResults(allResults, options) {
  let totalFiles = 0;
  let validFiles = 0;
  let filesWithErrors = 0;
  let filesWithWarnings = 0;
  let totalErrors = 0;
  let totalWarnings = 0;

  console.log(`\n${colors.bold}ICP-Lite v1.4 Validation Report${colors.reset}`);
  console.log('='.repeat(80));
  console.log();

  for (const result of allResults) {
    totalFiles++;

    if (result.valid && result.warnings.length === 0) {
      validFiles++;
      if (!options.quiet) {
        console.log(`${colors.green}✓${colors.reset} ${result.file}`);
      }
    } else {
      if (result.errors.length > 0) {
        filesWithErrors++;
        totalErrors += result.errors.length;
        console.log(`${colors.red}✗${colors.reset} ${result.file}`);
        result.errors.forEach(err => {
          console.log(`  ${colors.red}ERROR:${colors.reset} ${err}`);
        });
      }

      if (result.warnings.length > 0) {
        filesWithWarnings++;
        totalWarnings += result.warnings.length;
        if (result.errors.length === 0) {
          console.log(`${colors.yellow}⚠${colors.reset} ${result.file}`);
        }
        result.warnings.forEach(warn => {
          console.log(`  ${colors.yellow}WARNING:${colors.reset} ${warn}`);
        });
      }
      console.log();
    }
  }

  console.log('='.repeat(80));
  console.log(`${colors.bold}Summary:${colors.reset}`);
  console.log(`  Total files: ${totalFiles}`);
  console.log(`  Valid: ${colors.green}${validFiles}${colors.reset}`);
  console.log(`  With errors: ${colors.red}${filesWithErrors}${colors.reset} (${totalErrors} errors)`);
  console.log(`  With warnings: ${colors.yellow}${filesWithWarnings}${colors.reset} (${totalWarnings} warnings)`);
  console.log();

  return filesWithErrors === 0;
}

/**
 * Print results as JSON
 */
function printJSON(allResults) {
  const summary = {
    totalFiles: allResults.length,
    validFiles: allResults.filter(r => r.valid && r.warnings.length === 0).length,
    filesWithErrors: allResults.filter(r => r.errors.length > 0).length,
    filesWithWarnings: allResults.filter(r => r.warnings.length > 0).length,
    totalErrors: allResults.reduce((sum, r) => sum + r.errors.length, 0),
    totalWarnings: allResults.reduce((sum, r) => sum + r.warnings.length, 0)
  };

  const output = {
    summary,
    results: allResults
  };

  console.log(JSON.stringify(output, null, 2));
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  const options = {
    all: args.includes('--all'),
    entityOnly: args.includes('--entity-only'),
    jsonOutput: args.includes('--json-output'),
    quiet: args.includes('--quiet'),
    files: args.filter(arg => !arg.startsWith('--'))
  };

  let filesToValidate = [];

  if (options.all) {
    // Find all HTML files
    const pattern = join(PROJECT_ROOT, '**/*.html');
    filesToValidate = await glob(pattern, {
      ignore: ['**/node_modules/**', '**/.git/**', '**/admin/**']
    });
  } else if (options.entityOnly) {
    // Find only entity pages
    const patterns = ENTITY_PATTERNS.map(p => join(PROJECT_ROOT, p, '**/*.html'));
    for (const pattern of patterns) {
      const files = await glob(pattern);
      filesToValidate.push(...files);
    }
  } else if (options.files.length > 0) {
    // Validate specific files
    filesToValidate = options.files.map(f =>
      f.startsWith('/') ? f : join(PROJECT_ROOT, f)
    );
  } else {
    console.error('Usage: validate-icp-lite-v14.js [options] [files...]');
    console.error('Options:');
    console.error('  --all          Validate all HTML files');
    console.error('  --entity-only  Validate only entity pages (ships, ports, restaurants)');
    console.error('  --json-output  Output results as JSON');
    console.error('  --quiet        Only show errors and warnings');
    process.exit(1);
  }

  if (filesToValidate.length === 0) {
    console.error('No files to validate');
    process.exit(1);
  }

  // Validate all files
  const results = [];
  for (const file of filesToValidate) {
    const result = await validateFile(file);
    results.push(result);
  }

  // Print results
  if (options.jsonOutput) {
    printJSON(results);
  } else {
    const allValid = printResults(results, options);
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

export { validateFile, validateDualCap, validateJSONLDMirroring, validateMainEntity, validateDisclaimer };
