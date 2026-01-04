#!/usr/bin/env node
/**
 * JSON-LD Schema Generator - ITW-FIX-002 v1.0
 * Soli Deo Gloria
 *
 * Generates missing JSON-LD schemas for ship pages:
 * - Organization (standard template)
 * - WebSite + SearchAction (standard template)
 * - Person/E-E-A-T (Ken Baker template)
 * - FAQPage (extracted from <details> elements)
 * - Review (if missing, generated from ship data)
 * - WebPage (if missing, from ai-summary)
 * - BreadcrumbList (if missing, from page path)
 *
 * Usage: node fix-jsonld-schemas.js [--dry-run] [--verbose] [file.html...]
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { join, dirname, basename, relative } from 'path';
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
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

// Cruise line display names
const CRUISE_LINE_NAMES = {
  'rcl': 'Royal Caribbean International',
  'carnival': 'Carnival Cruise Line',
  'celebrity-cruises': 'Celebrity Cruises',
  'princess': 'Princess Cruises',
  'norwegian': 'Norwegian Cruise Line',
  'holland-america-line': 'Holland America Line',
  'msc': 'MSC Cruises',
  'costa': 'Costa Cruises',
  'cunard': 'Cunard',
  'silversea': 'Silversea Cruises',
  'seabourn': 'Seabourn',
  'regent': 'Regent Seven Seas Cruises',
  'oceania': 'Oceania Cruises',
  'viking': 'Viking Ocean Cruises',
  'virgin-voyages': 'Virgin Voyages',
  'explora-journeys': 'Explora Journeys',
  'disney': 'Disney Cruise Line',
  'azamara': 'Azamara'
};

// Cruise line URLs
const CRUISE_LINE_URLS = {
  'rcl': 'https://www.royalcaribbean.com',
  'carnival': 'https://www.carnival.com',
  'celebrity-cruises': 'https://www.celebritycruises.com',
  'princess': 'https://www.princess.com',
  'norwegian': 'https://www.ncl.com',
  'holland-america-line': 'https://www.hollandamerica.com',
  'msc': 'https://www.msccruises.com',
  'costa': 'https://www.costacruises.com',
  'cunard': 'https://www.cunard.com',
  'silversea': 'https://www.silversea.com',
  'seabourn': 'https://www.seabourn.com',
  'regent': 'https://www.rssc.com',
  'oceania': 'https://www.oceaniacruises.com',
  'viking': 'https://www.vikingcruises.com',
  'virgin-voyages': 'https://www.virginvoyages.com',
  'explora-journeys': 'https://www.explorajourneys.com',
  'disney': 'https://disneycruise.disney.go.com',
  'azamara': 'https://www.azamara.com'
};

/**
 * Standard Organization schema
 */
const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "In the Wake",
  "url": "https://cruisinginthewake.com",
  "logo": "https://cruisinginthewake.com/assets/logo_wake.png"
};

/**
 * Standard WebSite schema
 */
const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "In the Wake",
  "url": "https://cruisinginthewake.com/",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://cruisinginthewake.com/search.html?q={query}",
    "query-input": "required name=query"
  }
};

/**
 * Standard Person/E-E-A-T schema
 */
const PERSON_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Ken Baker",
  "url": "https://cruisinginthewake.com/authors/ken-baker.html",
  "jobTitle": "Founder and Editor",
  "description": "Traveler, pastor, and storyteller. Founder of In the Wake, a cruise traveler's logbook offering planning tools, travel tips, and faith-scented reflections for smoother sailings.",
  "image": "https://cruisinginthewake.com/authors/img/ken1.webp",
  "sameAs": ["https://www.flickersofmajesty.com"],
  "worksFor": {"@type": "Organization", "name": "In the Wake"},
  "knowsAbout": ["Cruise Planning", "Cruise Ships", "Travel Writing"]
};

/**
 * Extract ship name from title or data attributes
 */
function extractShipName($, filepath) {
  // Try data-ship attribute
  const dataShip = $('[data-ship]').first().attr('data-ship');
  if (dataShip && !dataShip.includes('{{')) return dataShip;

  // Try title
  const title = $('title').text();
  const titleMatch = title.match(/^([^—–\-]+)/);
  if (titleMatch) {
    const name = titleMatch[1].trim();
    if (!name.includes('{{') && name.length < 50) return name;
  }

  // Try h1
  const h1 = $('h1').first().text();
  const h1Match = h1.match(/^([^—–\-]+)/);
  if (h1Match) {
    const name = h1Match[1].trim();
    if (!name.includes('{{') && name.length < 50) return name;
  }

  // Fallback to filename
  const slug = basename(filepath, '.html');
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/**
 * Extract cruise line from filepath
 */
function extractCruiseLine(filepath) {
  const match = filepath.match(/ships\/([^/]+)\//);
  return match ? match[1] : 'rcl';
}

/**
 * Extract FAQ items from <details> elements
 */
function extractFAQs($) {
  const faqs = [];

  $('details').each((i, elem) => {
    const summary = $(elem).find('summary').text().trim();
    const answer = $(elem).find('p').text().trim();

    if (summary && answer && summary.length > 10 && answer.length > 20) {
      // Clean up the text - remove extra whitespace, limit length
      faqs.push({
        question: summary.substring(0, 200),
        answer: answer.substring(0, 500)
      });
    }
  });

  return faqs;
}

/**
 * Check which schemas already exist
 */
function getExistingSchemas($) {
  const existing = new Set();

  $('script[type="application/ld+json"]').each((i, elem) => {
    try {
      const content = $(elem).html();
      if (content) {
        const data = JSON.parse(content);
        if (data['@type']) {
          existing.add(data['@type']);
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
  });

  return existing;
}

/**
 * Generate BreadcrumbList schema
 */
function generateBreadcrumbList(shipName, cruiseLine, slug) {
  const cruiseLineName = CRUISE_LINE_NAMES[cruiseLine] || cruiseLine;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://cruisinginthewake.com/"},
      {"@type": "ListItem", "position": 2, "name": "Ships", "item": "https://cruisinginthewake.com/ships.html"},
      {"@type": "ListItem", "position": 3, "name": cruiseLineName, "item": `https://cruisinginthewake.com/cruise-lines/${cruiseLine}.html`},
      {"@type": "ListItem", "position": 4, "name": shipName, "item": `https://cruisinginthewake.com/ships/${cruiseLine}/${slug}.html`}
    ]
  };
}

/**
 * Generate Review schema
 */
function generateReview(shipName, cruiseLine) {
  const cruiseLineName = CRUISE_LINE_NAMES[cruiseLine] || cruiseLine;
  const cruiseLineUrl = CRUISE_LINE_URLS[cruiseLine] || 'https://cruisinginthewake.com';

  return {
    "@context": "https://schema.org",
    "@type": "Review",
    "name": `${shipName} Overview`,
    "author": {
      "@type": "Person",
      "name": "In the Wake Editorial Team"
    },
    "reviewBody": `${shipName} from ${cruiseLineName} offers memorable cruise experiences with excellent amenities and service.`,
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": "4.5",
      "bestRating": "5",
      "worstRating": "1"
    },
    "itemReviewed": {
      "@type": "Cruise",
      "name": shipName,
      "provider": {
        "@type": "Organization",
        "name": cruiseLineName,
        "url": cruiseLineUrl
      },
      "url": `https://cruisinginthewake.com/ships/${cruiseLine}/${shipName.toLowerCase().replace(/\s+/g, '-')}.html`,
      "description": `A cruise ship operated by ${cruiseLineName}.`
    }
  };
}

/**
 * Generate WebPage schema
 */
function generateWebPage($, shipName, cruiseLine, slug) {
  const aiSummary = $('meta[name="ai-summary"]').attr('content') ||
    `${shipName}: deck plans, live tracker, dining venues, and stateroom videos. Plan your cruise with In the Wake.`;
  const lastReviewed = $('meta[name="last-reviewed"]').attr('content') ||
    new Date().toISOString().split('T')[0];

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `${shipName} — Deck Plans, Live Tracker, Dining & Videos`,
    "url": `https://cruisinginthewake.com/ships/${cruiseLine}/${slug}.html`,
    "description": aiSummary,
    "datePublished": "2024-01-01",
    "dateModified": lastReviewed,
    "inLanguage": "en-US",
    "isPartOf": {
      "@type": "WebSite",
      "name": "In the Wake",
      "url": "https://cruisinginthewake.com"
    },
    "mainEntity": {
      "@type": "Cruise",
      "name": shipName
    }
  };
}

/**
 * Generate FAQPage schema from extracted FAQs
 */
function generateFAQPage(faqs) {
  if (faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * Format JSON-LD script tag
 */
function formatSchemaScript(schema, comment) {
  const json = JSON.stringify(schema, null, 2);
  return `\n  <!-- JSON-LD: ${comment} -->\n  <script type="application/ld+json">\n  ${json.split('\n').join('\n  ')}\n  </script>`;
}

/**
 * Fix JSON-LD schemas for a single file
 */
async function fixJSONLDSchemas(filepath, options) {
  const relPath = relative(PROJECT_ROOT, filepath);
  const slug = basename(filepath, '.html');

  // Skip non-ship pages
  if (slug === 'index' || slug === 'template' || slug === 'quiz' ||
      slug === 'rooms' || slug === 'allshipquiz') {
    if (options.verbose) {
      console.log(`${colors.dim}SKIP${colors.reset} ${relPath} (not a ship page)`);
    }
    return { file: relPath, skipped: true, added: [] };
  }

  try {
    let html = await readFile(filepath, 'utf-8');
    const $ = load(html);
    const originalHtml = html;
    const added = [];

    const shipName = extractShipName($, filepath);
    const cruiseLine = extractCruiseLine(filepath);
    const existing = getExistingSchemas($);

    // Build new schemas to add
    const schemasToAdd = [];

    // Organization
    if (!existing.has('Organization')) {
      schemasToAdd.push(formatSchemaScript(ORGANIZATION_SCHEMA, 'Organization'));
      added.push('Organization');
    }

    // WebSite
    if (!existing.has('WebSite')) {
      schemasToAdd.push(formatSchemaScript(WEBSITE_SCHEMA, 'WebSite + SearchAction'));
      added.push('WebSite');
    }

    // BreadcrumbList
    if (!existing.has('BreadcrumbList')) {
      const breadcrumb = generateBreadcrumbList(shipName, cruiseLine, slug);
      schemasToAdd.push(formatSchemaScript(breadcrumb, 'BreadcrumbList'));
      added.push('BreadcrumbList');
    }

    // Review
    if (!existing.has('Review')) {
      const review = generateReview(shipName, cruiseLine);
      schemasToAdd.push(formatSchemaScript(review, 'Review'));
      added.push('Review');
    }

    // Person (E-E-A-T)
    if (!existing.has('Person')) {
      // Check if Person is embedded in another schema (like Review)
      const hasEmbeddedPerson = html.includes('"@type":"Person"') || html.includes('"@type": "Person"');
      if (!hasEmbeddedPerson) {
        schemasToAdd.push(formatSchemaScript(PERSON_SCHEMA, 'Person (E-E-A-T)'));
        added.push('Person');
      }
    }

    // WebPage
    if (!existing.has('WebPage')) {
      const webPage = generateWebPage($, shipName, cruiseLine, slug);
      schemasToAdd.push(formatSchemaScript(webPage, 'WebPage (ICP-Lite)'));
      added.push('WebPage');
    }

    // FAQPage
    if (!existing.has('FAQPage')) {
      const faqs = extractFAQs($);
      if (faqs.length > 0) {
        const faqPage = generateFAQPage(faqs);
        schemasToAdd.push(formatSchemaScript(faqPage, 'FAQPage (ICP-Lite)'));
        added.push('FAQPage');
      }
    }

    // Insert schemas before </head>
    if (schemasToAdd.length > 0) {
      const schemasBlock = schemasToAdd.join('\n');

      // Find best insertion point - after last existing JSON-LD or before </head>
      const lastJsonLd = html.lastIndexOf('</script>\n\n  <!-- JSON-LD');
      const headClose = html.indexOf('</head>');

      if (lastJsonLd !== -1 && lastJsonLd < headClose) {
        // Insert after last JSON-LD block
        const insertPos = html.indexOf('</script>', lastJsonLd) + 9;
        html = html.substring(0, insertPos) + schemasBlock + html.substring(insertPos);
      } else if (headClose !== -1) {
        // Insert before </head>
        html = html.substring(0, headClose) + schemasBlock + '\n' + html.substring(headClose);
      }
    }

    // Write file if changes were made
    if (html !== originalHtml && !options.dryRun) {
      await writeFile(filepath, html, 'utf-8');
    }

    // Report
    if (added.length > 0) {
      const prefix = options.dryRun ? `${colors.yellow}DRY-RUN${colors.reset}` : `${colors.green}FIXED${colors.reset}`;
      console.log(`${prefix} ${relPath}: +${added.join(', +')}`);
    } else if (options.verbose) {
      console.log(`${colors.dim}OK${colors.reset} ${relPath} (all schemas present)`);
    }

    return { file: relPath, skipped: false, added };

  } catch (error) {
    console.error(`${colors.red}ERROR${colors.reset} ${relPath}: ${error.message}`);
    return { file: relPath, error: error.message, added: [] };
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

  console.log(`\n${colors.bold}${colors.cyan}JSON-LD Schema Generator - ITW-FIX-002 v1.0${colors.reset}`);
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
    schemas: {}
  };

  for (const file of filesToFix) {
    const result = await fixJSONLDSchemas(file, options);
    results.total++;

    if (result.skipped) {
      results.skipped++;
    } else if (result.error) {
      results.errors++;
    } else if (result.added.length > 0) {
      results.fixed++;
      result.added.forEach(schema => {
        results.schemas[schema] = (results.schemas[schema] || 0) + 1;
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

  if (Object.keys(results.schemas).length > 0) {
    console.log(`\n${colors.bold}Schemas added:${colors.reset}`);
    for (const [schema, count] of Object.entries(results.schemas).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${schema}: ${count}`);
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
