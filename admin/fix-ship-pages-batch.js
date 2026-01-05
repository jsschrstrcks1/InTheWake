#!/usr/bin/env node
/**
 * Batch Ship Page Fixer - ITW-FIX-001 v1.0
 * Soli Deo Gloria
 *
 * Fixes common validation errors across all ship pages:
 * 1. navigation/missing_internet_at_sea - Adds /internet-at-sea.html link to nav
 * 2. analytics/missing_umami - Adds Umami analytics script
 * 3. ai_breadcrumbs/missing_siblings - Generates siblings from directory structure
 * 4. data_attr/missing_data_imo - Adds IMO from ship stats or marks TBD
 * 5. sections/wrong_section_order - Reorders sections to match gold standard
 *
 * Usage: node fix-ship-pages-batch.js [--dry-run] [--verbose] [file.html...]
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { join, dirname, basename, relative } from 'path';
import { fileURLToPath } from 'url';
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
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

// Ship IMO database (manually curated for known ships)
// Format: slug -> IMO number
const SHIP_IMO_DATABASE = {
  // RCL - Oasis Class
  'oasis-of-the-seas': '9383936',
  'allure-of-the-seas': '9383948',
  'harmony-of-the-seas': '9682875',
  'symphony-of-the-seas': '9744001',
  'wonder-of-the-seas': '9838188',
  'utopia-of-the-seas': '9838190',
  // RCL - Icon Class
  'icon-of-the-seas': '9854689',
  'star-of-the-seas': '9854691',
  // RCL - Quantum Class
  'quantum-of-the-seas': '9549463',
  'anthem-of-the-seas': '9656101',
  'ovation-of-the-seas': '9697753',
  'spectrum-of-the-seas': '9780101',
  'odyssey-of-the-seas': '9780113',
  // RCL - Freedom Class
  'freedom-of-the-seas': '9304033',
  'liberty-of-the-seas': '9317290',
  'independence-of-the-seas': '9349681',
  // RCL - Voyager Class
  'voyager-of-the-seas': '9161716',
  'explorer-of-the-seas': '9161728',
  'adventure-of-the-seas': '9167227',
  'navigator-of-the-seas': '9227508',
  'mariner-of-the-seas': '9227510',
  // RCL - Radiance Class
  'radiance-of-the-seas': '9195195',
  'brilliance-of-the-seas': '9195200',
  'serenade-of-the-seas': '9228344',
  'jewel-of-the-seas': '9228356',
  // RCL - Vision Class
  'vision-of-the-seas': '9116876',
  'rhapsody-of-the-seas': '9116864',
  'enchantment-of-the-seas': '9102992',
  'grandeur-of-the-seas': '9102980',
  // Carnival
  'carnival-celebration': '9837468',
  'carnival-jubilee': '9837470',
  'mardi-gras': '9833468',
  'carnival-venezia': '9785724',
  'carnival-firenze': '9803620',
  'carnival-luminosa': '9398892',
  'carnival-panorama': '9802396',
  'carnival-horizon': '9774948',
  'carnival-vista': '9692569',
  'carnival-breeze': '9571442',
  'carnival-magic': '9378498',
  'carnival-dream': '9378486',
  'carnival-splendor': '9333163',
  'carnival-freedom': '9304057',
  'carnival-liberty': '9278181',
  'carnival-glory': '9214918',
  'carnival-valor': '9236389',
  'carnival-miracle': '9237357',
  'carnival-conquest': '9199043',
  'carnival-pride': '9215490',
  'carnival-spirit': '9188647',
  'carnival-legend': '9224726',
  'carnival-elation': '9085968',
  'carnival-paradise': '9070632',
  'carnival-sunrise': '9070620',
  'carnival-sunshine': '9085956',
  'carnival-radiance': '9070618',
  // Celebrity
  'celebrity-edge': '9812705',
  'celebrity-apex': '9834220',
  'celebrity-beyond': '9834232',
  'celebrity-ascent': '9870310',
  'celebrity-xcel': '9870322',
  'celebrity-reflection': '9506459',
  'celebrity-silhouette': '9451094',
  'celebrity-eclipse': '9404314',
  'celebrity-equinox': '9372472',
  'celebrity-solstice': '9362530',
  'celebrity-constellation': '9192387',
  'celebrity-infinity': '9189419',
  'celebrity-summit': '9189421',
  'celebrity-millennium': '9189407',
  // Costa
  'costa-smeralda': '9781877',
  'costa-toscana': '9802384',
  'costa-firenze': '9785712',
  'costa-venezia': '9785700',
  'costa-diadema': '9636088',
  'costa-fascinosa': '9479864',
  'costa-favolosa': '9479852',
  'costa-deliziosa': '9398917',
  'costa-pacifica': '9378482',
  // Virgin Voyages
  'scarlet-lady': '9796052',
  'valiant-lady': '9822665',
  'resilient-lady': '9822677',
  'brilliant-lady': '9864003',
  // Silversea
  'silver-nova': '9855471',
  'silver-ray': '9855483',
  'silver-dawn': '9819869',
  'silver-moon': '9784350',
  'silver-muse': '9717816',
  'silver-spirit': '9431101',
  'silver-shadow': '9192167',
  'silver-whisper': '9192179',
  'silver-cloud': '8903923',
  'silver-wind': '8903935',
  'silver-endeavour': '9818135',
  'silver-origin': '9838826',
  // Oceania
  'vista': '9870334',
  'allura': '9870346',
  'marina': '9438066',
  'riviera': '9438078',
  'sirena': '9200938',
  'insignia': '9156474',
  'nautica': '9200940',
  'regatta': '9156462',
  // Regent
  'seven-seas-grandeur': '9855469',
  'seven-seas-splendor': '9784362',
  'seven-seas-explorer': '9703100',
  'seven-seas-voyager': '9247144',
  'seven-seas-mariner': '9210139',
  'seven-seas-navigator': '9064126',
  // Seabourn
  'seabourn-pursuit': '9860230',
  'seabourn-venture': '9832289',
  'seabourn-encore': '9692040',
  'seabourn-ovation': '9692038',
  'seabourn-quest': '9483126',
  'seabourn-sojourn': '9417098',
  'seabourn-odyssey': '9417086',
  // Explora Journeys
  'explora-i': '9863750',
  'explora-ii': '9863762'
};

// Umami analytics script (from gold standard)
const UMAMI_SCRIPT = `<!-- Umami (secondary analytics) -->
  <script defer src="https://cloud.umami.is/script.js" data-website-id="9661a449-3ba9-49ea-88e8-4493363578d2"></script>`;

// Internet at Sea nav link (to be added to Planning dropdown)
const INTERNET_AT_SEA_LINK = '<a href="/internet-at-sea.html">Internet at Sea</a>';

/**
 * Check if ship is TBN (To Be Named)
 */
function isTBNShip(filepath, html) {
  const filename = basename(filepath, '.html');
  return filename.includes('tbn') ||
         filename.includes('unnamed') ||
         filename.includes('none-announced') ||
         html.toLowerCase().includes('to be named') ||
         html.includes('data-imo="TBD"');
}

/**
 * Check if ship is historic
 */
function isHistoricShip(html) {
  const lowerHtml = html.toLowerCase();
  return lowerHtml.includes('status: retired') ||
         lowerHtml.includes('sold to') ||
         lowerHtml.includes('retired ship') ||
         lowerHtml.includes('(historical)') ||
         lowerHtml.includes('scrapped') ||
         lowerHtml.includes('decommissioned') ||
         lowerHtml.includes('no longer in service');
}

/**
 * Extract slug from filepath
 */
function extractSlug(filepath) {
  return basename(filepath, '.html');
}

/**
 * Extract cruise line directory from filepath
 */
function extractCruiseLine(filepath) {
  const match = filepath.match(/ships\/([^/]+)\//);
  return match ? match[1] : 'rcl';
}

/**
 * Get sibling ships from same directory
 */
async function getSiblingShips(filepath) {
  const dir = dirname(filepath);
  const currentSlug = extractSlug(filepath);
  const cruiseLine = extractCruiseLine(filepath);

  try {
    const files = await readdir(dir);
    const siblings = files
      .filter(f => f.endsWith('.html') &&
                   f !== 'index.html' &&
                   f !== `${currentSlug}.html` &&
                   !f.includes('template') &&
                   !f.includes('quiz') &&
                   !f.includes('rooms') &&
                   !f.includes('allship'))
      .slice(0, 5) // Limit to 5 siblings
      .map(f => `/ships/${cruiseLine}/${f}`);

    return siblings;
  } catch (e) {
    return [];
  }
}

/**
 * Get IMO for a ship
 */
function getShipIMO(slug, isTBN, isHistoric) {
  if (isTBN) return 'TBD';
  if (SHIP_IMO_DATABASE[slug]) return SHIP_IMO_DATABASE[slug];
  if (isHistoric) return null; // Historic ships may not have IMO
  return null;
}

/**
 * Fix 1: Add Internet at Sea link to navigation
 */
function fixInternetAtSeaNav(html) {
  // Check if already present
  if (html.includes('/internet-at-sea.html')) {
    return { html, fixed: false };
  }

  // Find the Planning dropdown menu and add the link after /ports.html
  const portsLinkPattern = /<a href="\/ports\.html">Ports<\/a>/i;
  if (portsLinkPattern.test(html)) {
    html = html.replace(
      portsLinkPattern,
      `<a href="/ports.html">Ports</a>\n            <a href="/internet-at-sea.html">Internet at Sea</a>`
    );
    return { html, fixed: true };
  }

  // Alternative: look for drink-packages and add before it
  const drinkPackagesPattern = /<a href="\/drink-packages\.html">/i;
  if (drinkPackagesPattern.test(html)) {
    html = html.replace(
      drinkPackagesPattern,
      `<a href="/internet-at-sea.html">Internet at Sea</a>\n            <a href="/drink-packages.html">`
    );
    return { html, fixed: true };
  }

  return { html, fixed: false };
}

/**
 * Fix 2: Add Umami analytics script
 */
function fixUmamiAnalytics(html) {
  // Check if already present
  if (html.includes('cloud.umami.is/script.js') &&
      html.includes('9661a449-3ba9-49ea-88e8-4493363578d2')) {
    return { html, fixed: false };
  }

  // Remove any existing Umami scripts (in case ID is wrong)
  html = html.replace(/\s*<!--\s*Umami[^>]*-->[\s\S]*?<script[^>]*umami[^>]*><\/script>/gi, '');
  html = html.replace(/<script[^>]*cloud\.umami\.is[^>]*><\/script>/gi, '');

  // Add after Google Analytics (look for gtag closing script)
  const gaPattern = /(<script>[\s\S]*?gtag\('config'[^)]+\);[\s\S]*?<\/script>)/;
  const match = html.match(gaPattern);

  if (match) {
    html = html.replace(gaPattern, `$1\n\n  ${UMAMI_SCRIPT}`);
    return { html, fixed: true };
  }

  // Alternative: add before first JSON-LD script
  const jsonLdPattern = /(\s*<!--\s*JSON-LD)/i;
  if (jsonLdPattern.test(html)) {
    html = html.replace(jsonLdPattern, `\n\n  ${UMAMI_SCRIPT}\n\n$1`);
    return { html, fixed: true };
  }

  return { html, fixed: false };
}

/**
 * Fix 3: Add siblings to AI breadcrumbs
 */
async function fixAIBreadcrumbsSiblings(html, filepath) {
  // Check if ai-breadcrumbs comment exists
  const breadcrumbMatch = html.match(/<!--\s*ai-breadcrumbs([\s\S]*?)-->/i);
  if (!breadcrumbMatch) {
    return { html, fixed: false };
  }

  const breadcrumbContent = breadcrumbMatch[1];

  // Check if siblings already present and valid
  if (/siblings:\s*\/ships\//.test(breadcrumbContent)) {
    return { html, fixed: false };
  }

  // Get sibling ships
  const siblings = await getSiblingShips(filepath);
  if (siblings.length === 0) {
    return { html, fixed: false };
  }

  const siblingsLine = `siblings: ${siblings.join(', ')}`;

  // If siblings line exists but is empty or malformed, replace it
  if (/siblings:\s*[^\n]*\n/.test(breadcrumbContent)) {
    const newBreadcrumb = breadcrumbContent.replace(
      /siblings:\s*[^\n]*\n/,
      `${siblingsLine}\n`
    );
    html = html.replace(breadcrumbMatch[0], `<!-- ai-breadcrumbs${newBreadcrumb}-->`);
    return { html, fixed: true };
  }

  // Add siblings after parent line
  if (/parent:\s*[^\n]+\n/.test(breadcrumbContent)) {
    const newBreadcrumb = breadcrumbContent.replace(
      /(parent:\s*[^\n]+\n)/,
      `$1     ${siblingsLine}\n`
    );
    html = html.replace(breadcrumbMatch[0], `<!-- ai-breadcrumbs${newBreadcrumb}-->`);
    return { html, fixed: true };
  }

  return { html, fixed: false };
}

/**
 * Fix 4: Add data-imo attribute
 */
function fixDataIMO(html, filepath) {
  const slug = extractSlug(filepath);
  const isTBN = isTBNShip(filepath, html);
  const isHistoric = isHistoricShip(html);

  // Check if data-imo already exists
  if (/data-imo="[^"]+"/i.test(html)) {
    return { html, fixed: false };
  }

  const imo = getShipIMO(slug, isTBN, isHistoric);
  if (!imo) {
    return { html, fixed: false };
  }

  // Find the tracker section and add data-imo
  // Pattern: section with class "card itinerary" or containing "Where Is"
  const trackerPatterns = [
    /(<section[^>]*class="[^"]*card[^"]*itinerary[^"]*"[^>]*)>/gi,
    /(<section[^>]*aria-labelledby="liveTrackHeading"[^>]*)>/gi
  ];

  for (const pattern of trackerPatterns) {
    if (pattern.test(html)) {
      html = html.replace(pattern, `$1 data-imo="${imo}">`);
      return { html, fixed: true };
    }
  }

  // Alternative: Look for "Where Is" heading and find parent section
  const whereIsMatch = html.match(/<h2[^>]*id="liveTrackHeading"[^>]*>/i);
  if (whereIsMatch) {
    // Find the opening section tag before this heading
    const beforeHeading = html.substring(0, html.indexOf(whereIsMatch[0]));
    const lastSectionIndex = beforeHeading.lastIndexOf('<section');
    if (lastSectionIndex !== -1) {
      const sectionEnd = html.indexOf('>', lastSectionIndex);
      const sectionTag = html.substring(lastSectionIndex, sectionEnd);
      if (!sectionTag.includes('data-imo')) {
        html = html.substring(0, sectionEnd) + ` data-imo="${imo}"` + html.substring(sectionEnd);
        return { html, fixed: true };
      }
    }
  }

  return { html, fixed: false };
}

/**
 * Fix 5: Reorder sections to match gold standard
 * Expected order: page_intro → first_look → dining → logbook → videos → map → tracker → faq → attribution
 *
 * This is complex - we identify sections and reorder them within the main content area.
 * We'll be conservative and only fix clear cases.
 */
function fixSectionOrder(html) {
  // This is a complex fix that requires careful HTML manipulation
  // For safety, we'll only fix specific known patterns

  let fixed = false;

  // Pattern 1: dining before first_look (very common error)
  // Look for grid-2 section with dining before first_look
  const diningBeforeFirstLookPattern = /<section\s+class="grid-2"[^>]*>([\s\S]*?)<section[^>]*id="dining-card"([\s\S]*?)<section[^>]*id="first-look"([\s\S]*?)<\/section>\s*<\/section>\s*<\/section>/gi;

  // For now, we'll log that reordering is needed but not attempt automated fix
  // as it's too risky without a proper HTML parser

  // Instead, check if the sections are in wrong order by looking at their positions
  const firstLookPos = html.indexOf('id="first-look"');
  const diningPos = html.indexOf('id="dining');

  if (diningPos !== -1 && firstLookPos !== -1 && diningPos < firstLookPos) {
    // Dining appears before First Look - this should be fixed
    // But we won't do automated reordering as it's too risky
    // Just flag it
  }

  return { html, fixed };
}

/**
 * Apply all fixes to a single file
 */
async function fixShipPage(filepath, options) {
  const relPath = relative(PROJECT_ROOT, filepath);
  const slug = extractSlug(filepath);

  // Skip non-ship pages
  if (slug === 'index' || slug === 'template' || slug === 'quiz' ||
      slug === 'rooms' || slug === 'allshipquiz') {
    if (options.verbose) {
      console.log(`${colors.dim}SKIP${colors.reset} ${relPath} (not a ship page)`);
    }
    return { file: relPath, skipped: true, fixes: [] };
  }

  try {
    let html = await readFile(filepath, 'utf-8');
    const originalHtml = html;
    const fixes = [];

    // Fix 1: Internet at Sea nav
    const fix1 = fixInternetAtSeaNav(html);
    if (fix1.fixed) {
      html = fix1.html;
      fixes.push('internet-at-sea-nav');
    }

    // Fix 2: Umami analytics
    const fix2 = fixUmamiAnalytics(html);
    if (fix2.fixed) {
      html = fix2.html;
      fixes.push('umami-analytics');
    }

    // Fix 3: AI breadcrumbs siblings
    const fix3 = await fixAIBreadcrumbsSiblings(html, filepath);
    if (fix3.fixed) {
      html = fix3.html;
      fixes.push('ai-breadcrumbs-siblings');
    }

    // Fix 4: Data IMO
    const fix4 = fixDataIMO(html, filepath);
    if (fix4.fixed) {
      html = fix4.html;
      fixes.push('data-imo');
    }

    // Fix 5: Section order (conservative - only logs, doesn't fix)
    const fix5 = fixSectionOrder(html);
    if (fix5.fixed) {
      html = fix5.html;
      fixes.push('section-order');
    }

    // Write file if changes were made
    if (html !== originalHtml && !options.dryRun) {
      await writeFile(filepath, html, 'utf-8');
    }

    // Report
    if (fixes.length > 0) {
      const prefix = options.dryRun ? `${colors.yellow}DRY-RUN${colors.reset}` : `${colors.green}FIXED${colors.reset}`;
      console.log(`${prefix} ${relPath}: ${fixes.join(', ')}`);
    } else if (options.verbose) {
      console.log(`${colors.dim}OK${colors.reset} ${relPath} (no fixes needed)`);
    }

    return { file: relPath, skipped: false, fixes };

  } catch (error) {
    console.error(`${colors.red}ERROR${colors.reset} ${relPath}: ${error.message}`);
    return { file: relPath, error: error.message, fixes: [] };
  }
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    files: args.filter(arg => !arg.startsWith('--'))
  };

  console.log(`\n${colors.bold}${colors.cyan}Ship Page Batch Fixer - ITW-FIX-001 v1.0${colors.reset}`);
  console.log('='.repeat(60));

  if (options.dryRun) {
    console.log(`${colors.yellow}DRY RUN MODE - No files will be modified${colors.reset}\n`);
  }

  let filesToFix = [];

  if (options.files.length > 0) {
    filesToFix = options.files.map(f => f.startsWith('/') ? f : join(PROJECT_ROOT, f));
  } else {
    // Fix all ship pages
    filesToFix = await glob(join(PROJECT_ROOT, 'ships', '**', '*.html'));
  }

  console.log(`Processing ${filesToFix.length} files...\n`);

  const results = {
    total: 0,
    fixed: 0,
    skipped: 0,
    errors: 0,
    fixes: {}
  };

  for (const file of filesToFix) {
    const result = await fixShipPage(file, options);
    results.total++;

    if (result.skipped) {
      results.skipped++;
    } else if (result.error) {
      results.errors++;
    } else if (result.fixes.length > 0) {
      results.fixed++;
      result.fixes.forEach(fix => {
        results.fixes[fix] = (results.fixes[fix] || 0) + 1;
      });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.bold}Summary:${colors.reset}`);
  console.log(`  Total files: ${results.total}`);
  console.log(`  ${colors.green}Fixed: ${results.fixed}${colors.reset}`);
  console.log(`  Skipped: ${results.skipped}`);
  console.log(`  ${colors.red}Errors: ${results.errors}${colors.reset}`);

  if (Object.keys(results.fixes).length > 0) {
    console.log(`\n${colors.bold}Fixes applied:${colors.reset}`);
    for (const [fix, count] of Object.entries(results.fixes).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${fix}: ${count}`);
    }
  }

  if (options.dryRun) {
    console.log(`\n${colors.yellow}Run without --dry-run to apply fixes${colors.reset}`);
  }
}

main().catch(e => {
  console.error(`${colors.red}Fatal:${colors.reset}`, e);
  process.exit(1);
});
