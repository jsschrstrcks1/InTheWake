#!/usr/bin/env node
/**
 * Add Missing WebPage JSON-LD
 * Soli Deo Gloria
 *
 * For files that have ai-summary and last-reviewed but no WebPage JSON-LD
 */

import { readFile, writeFile } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { load } from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

/**
 * Check if file path indicates an entity page
 */
function isEntityPage(filepath) {
  return filepath.includes('ships/') || filepath.includes('ports/') || filepath.includes('restaurants/');
}

/**
 * Get entity type from file path
 */
function getEntityType(filepath) {
  if (filepath.includes('ships/')) return { type: 'Product', category: 'Cruise Ship' };
  if (filepath.includes('ports/')) return { type: 'Place', category: 'Port of Call' };
  if (filepath.includes('restaurants/')) return { type: 'Restaurant', category: 'Dining Venue' };
  return null;
}

/**
 * Get entity name from page title or file name
 */
function getEntityName($, filepath) {
  // Try to get from h1
  const h1 = $('h1').first().text().trim();
  if (h1) return h1.split('—')[0].split('|')[0].trim();

  // Try to get from title
  const title = $('title').text().trim();
  if (title) return title.split('—')[0].split('|')[0].trim();

  // Fall back to filename
  return basename(filepath, '.html').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Detect cruise line from path
 */
function getCruiseLine(filepath) {
  if (filepath.includes('/rcl/')) return 'Royal Caribbean International';
  if (filepath.includes('/carnival/')) return 'Carnival Cruise Line';
  if (filepath.includes('/celebrity-cruises/')) return 'Celebrity Cruises';
  if (filepath.includes('/norwegian/')) return 'Norwegian Cruise Line';
  if (filepath.includes('/holland-america-line/')) return 'Holland America Line';
  if (filepath.includes('/princess/')) return 'Princess Cruises';
  if (filepath.includes('/msc/')) return 'MSC Cruises';
  if (filepath.includes('/cunard/')) return 'Cunard Line';
  if (filepath.includes('/silversea/')) return 'Silversea Cruises';
  if (filepath.includes('/regent/')) return 'Regent Seven Seas Cruises';
  if (filepath.includes('/seabourn/')) return 'Seabourn';
  if (filepath.includes('/oceania/')) return 'Oceania Cruises';
  if (filepath.includes('/costa/')) return 'Costa Cruises';
  if (filepath.includes('/explora-journeys/')) return 'Explora Journeys';
  return null;
}

async function addWebPageJsonLd(filepath) {
  try {
    let html = await readFile(filepath, 'utf-8');
    const $ = load(html);

    // Check if WebPage JSON-LD already exists
    const hasWebPage = html.includes('"@type": "WebPage"') || html.includes('"@type":"WebPage"');
    if (hasWebPage) {
      return { filepath, skipped: true, reason: 'WebPage JSON-LD already exists' };
    }

    // Extract meta values
    const aiSummary = $('meta[name="ai-summary"]').attr('content') || '';
    const lastReviewed = $('meta[name="last-reviewed"]').attr('content') || '';
    const canonical = $('link[rel="canonical"]').attr('href') || '';
    const title = $('title').text().trim().split('|')[0].trim();

    if (!aiSummary || !lastReviewed) {
      return { filepath, skipped: true, reason: 'Missing ai-summary or last-reviewed' };
    }

    // Build WebPage JSON-LD
    const webpage = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": title,
      "url": canonical || `https://cruisinginthewake.com/${filepath}`,
      "description": aiSummary,
      "dateModified": lastReviewed,
      "isPartOf": {
        "@type": "WebSite",
        "name": "In the Wake",
        "url": "https://cruisinginthewake.com/"
      }
    };

    // Add mainEntity for entity pages
    if (isEntityPage(filepath)) {
      const entityInfo = getEntityType(filepath);
      const entityName = getEntityName($, filepath);

      if (entityInfo && entityName) {
        webpage.mainEntity = {
          "@type": entityInfo.type,
          "name": entityName,
          "category": entityInfo.category
        };

        if (entityInfo.type === 'Product') {
          const cruiseLine = getCruiseLine(filepath);
          if (cruiseLine) {
            webpage.mainEntity.manufacturer = { "@type": "Organization", "name": cruiseLine };
          }
        }
      }
    }

    const webpageScript = `\n  <!-- JSON-LD: WebPage (ICP-Lite v1.4) -->\n  <script type="application/ld+json">\n  ${JSON.stringify(webpage, null, 2).split('\n').join('\n  ')}\n  </script>\n`;

    // Find a good place to insert - before </head>
    const insertPoint = html.indexOf('</head>');
    if (insertPoint === -1) {
      return { filepath, error: 'Could not find </head>' };
    }

    html = html.slice(0, insertPoint) + webpageScript + html.slice(insertPoint);
    await writeFile(filepath, html, 'utf-8');

    return { filepath, fixed: true, changes: ['Added WebPage JSON-LD'] };

  } catch (error) {
    return { filepath, error: error.message };
  }
}

async function main() {
  const files = process.argv.slice(2).filter(f => !f.startsWith('--'));

  if (files.length === 0) {
    console.log('Usage: node batch-add-webpage-jsonld.js file1.html file2.html ...');
    process.exit(1);
  }

  console.log(`\n📄 Adding WebPage JSON-LD to ${files.length} files\n`);

  let fixed = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const filepath = file.startsWith('/') ? file : join(PROJECT_ROOT, file);
    const result = await addWebPageJsonLd(filepath);

    if (result.fixed) {
      console.log(`✓ Fixed: ${file}`);
      fixed++;
    } else if (result.skipped) {
      console.log(`○ Skipped: ${file} (${result.reason})`);
      skipped++;
    } else if (result.error) {
      console.log(`✗ Error: ${file} (${result.error})`);
      errors++;
    }
  }

  console.log(`\nDone! Fixed: ${fixed}, Skipped: ${skipped}, Errors: ${errors}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
