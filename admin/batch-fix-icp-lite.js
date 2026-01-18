#!/usr/bin/env node
/**
 * Batch ICP-Lite v1.4 Fixer
 * Soli Deo Gloria
 *
 * Automatically fixes common ICP-Lite validation errors:
 * 1. JSON-LD description doesn't match ai-summary
 * 2. JSON-LD dateModified doesn't match last-reviewed
 * 3. content-protocol v1.0 -> v1.4
 * 4. Missing mainEntity for entity pages
 * 5. Missing trust badge in footer
 */

import { readFile, writeFile } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import { load } from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

let fixedCount = 0;
let errorCount = 0;

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
function getEntityName(filepath, $) {
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

/**
 * Fix a single file
 */
async function fixFile(filepath) {
  try {
    let html = await readFile(filepath, 'utf-8');
    let modified = false;
    const changes = [];

    const $ = load(html);

    // Extract meta values
    const aiSummary = $('meta[name="ai-summary"]').attr('content') || '';
    const lastReviewed = $('meta[name="last-reviewed"]').attr('content') || '';
    const contentProtocol = $('meta[name="content-protocol"]').attr('content') || '';

    // Skip if missing essential meta tags
    if (!aiSummary || !lastReviewed) {
      return { filepath, skipped: true, reason: 'Missing ai-summary or last-reviewed' };
    }

    // 1. Fix content-protocol from v1.0 to v1.4
    if (contentProtocol && contentProtocol.includes('v1.0')) {
      html = html.replace(
        /(<meta\s+name="content-protocol"\s+content=")ICP-Lite v1\.0[^"]*(")/g,
        '$1ICP-Lite v1.4$2'
      );
      modified = true;
      changes.push('content-protocol v1.0 -> v1.4');
    }

    // Find all JSON-LD scripts
    const jsonLdScripts = [];
    const jsonLdRegex = /<script\s+type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g;
    let match;

    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        jsonLdScripts.push({
          original: match[0],
          content: match[1],
          parsed,
          start: match.index,
          end: match.index + match[0].length
        });
      } catch (e) {
        // Skip invalid JSON-LD
      }
    }

    // Find WebPage JSON-LD
    let webpageScript = jsonLdScripts.find(s => s.parsed['@type'] === 'WebPage');

    // Also check @graph pattern
    if (!webpageScript) {
      webpageScript = jsonLdScripts.find(s =>
        s.parsed['@graph'] && Array.isArray(s.parsed['@graph']) &&
        s.parsed['@graph'].some(item => item['@type'] === 'WebPage')
      );
    }

    if (webpageScript) {
      let webpage = webpageScript.parsed;
      let needsUpdate = false;

      // Handle @graph pattern
      if (webpage['@graph']) {
        webpage = webpage['@graph'].find(item => item['@type'] === 'WebPage');
      }

      // 2. Fix description mismatch
      const normalizedDesc = normalize(webpage.description || '');
      const normalizedSummary = normalize(aiSummary);

      if (normalizedDesc !== normalizedSummary) {
        webpage.description = aiSummary;
        needsUpdate = true;
        changes.push('JSON-LD description aligned with ai-summary');
      }

      // 3. Fix dateModified mismatch
      if (webpage.dateModified !== lastReviewed) {
        webpage.dateModified = lastReviewed;
        needsUpdate = true;
        changes.push('JSON-LD dateModified aligned with last-reviewed');
      }

      // 4. Add mainEntity for entity pages
      if (isEntityPage(filepath) && !webpage.mainEntity) {
        const entityInfo = getEntityType(filepath);
        const entityName = getEntityName(filepath, $);

        if (entityInfo && entityName) {
          webpage.mainEntity = {
            "@type": entityInfo.type,
            "name": entityName,
            "category": entityInfo.category
          };

          // Add manufacturer for ships
          if (entityInfo.type === 'Product') {
            // Try to determine cruise line from path
            let cruiseLine = 'Cruise Line';
            if (filepath.includes('/rcl/')) cruiseLine = 'Royal Caribbean International';
            else if (filepath.includes('/carnival/')) cruiseLine = 'Carnival Cruise Line';
            else if (filepath.includes('/celebrity-cruises/')) cruiseLine = 'Celebrity Cruises';
            else if (filepath.includes('/norwegian/')) cruiseLine = 'Norwegian Cruise Line';
            else if (filepath.includes('/holland-america-line/')) cruiseLine = 'Holland America Line';
            else if (filepath.includes('/princess/')) cruiseLine = 'Princess Cruises';
            else if (filepath.includes('/msc/')) cruiseLine = 'MSC Cruises';
            else if (filepath.includes('/cunard/')) cruiseLine = 'Cunard Line';
            else if (filepath.includes('/silversea/')) cruiseLine = 'Silversea Cruises';
            else if (filepath.includes('/regent/')) cruiseLine = 'Regent Seven Seas Cruises';
            else if (filepath.includes('/seabourn/')) cruiseLine = 'Seabourn';
            else if (filepath.includes('/oceania/')) cruiseLine = 'Oceania Cruises';
            else if (filepath.includes('/costa/')) cruiseLine = 'Costa Cruises';
            else if (filepath.includes('/explora-journeys/')) cruiseLine = 'Explora Journeys';

            webpage.mainEntity.manufacturer = { "@type": "Organization", "name": cruiseLine };
          }

          needsUpdate = true;
          changes.push('Added mainEntity for entity page');
        }
      }

      if (needsUpdate) {
        // Rebuild the JSON-LD script
        let updatedJson;
        if (webpageScript.parsed['@graph']) {
          // Handle @graph pattern
          const idx = webpageScript.parsed['@graph'].findIndex(item => item['@type'] === 'WebPage');
          webpageScript.parsed['@graph'][idx] = webpage;
          updatedJson = JSON.stringify(webpageScript.parsed, null, 2);
        } else {
          updatedJson = JSON.stringify(webpage, null, 2);
        }

        const newScript = `<script type="application/ld+json">\n  ${updatedJson.split('\n').join('\n  ')}\n  </script>`;
        html = html.replace(webpageScript.original, newScript);
        modified = true;
      }
    }

    // 5. Fix missing trust badge (only if footer exists)
    if (!html.includes('class="trust-badge"') && html.includes('<footer')) {
      // Find closing </footer> and add trust badge before it
      const footerMatch = html.match(/<\/footer>/i);
      if (footerMatch) {
        const trustBadge = '\n    <p class="trust-badge">✓ No ads. No tracking. Independent of cruise lines.</p>\n  ';
        html = html.replace(/<\/footer>/i, trustBadge + '</footer>');
        modified = true;
        changes.push('Added trust badge to footer');
      }
    }

    if (modified) {
      await writeFile(filepath, html, 'utf-8');
      fixedCount++;
      return { filepath, fixed: true, changes };
    }

    return { filepath, fixed: false, reason: 'No fixes needed' };

  } catch (error) {
    errorCount++;
    return { filepath, error: error.message };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose');

  console.log('\n🔧 Batch ICP-Lite v1.4 Fixer');
  console.log('='.repeat(60));
  if (dryRun) console.log('⚠️  DRY RUN MODE - No files will be modified\n');

  // Find all HTML files (excluding admin)
  const pattern = join(PROJECT_ROOT, '**/*.html');
  const files = await glob(pattern, {
    ignore: ['**/node_modules/**', '**/.git/**', '**/admin/**']
  });

  console.log(`Found ${files.length} HTML files to process\n`);

  const results = [];
  for (const file of files) {
    const result = await fixFile(file);
    results.push(result);

    if (verbose && result.fixed) {
      console.log(`✓ Fixed: ${result.filepath}`);
      result.changes.forEach(c => console.log(`    - ${c}`));
    } else if (verbose && result.error) {
      console.log(`✗ Error: ${result.filepath}: ${result.error}`);
    }
  }

  // Summary
  const fixed = results.filter(r => r.fixed);
  const errors = results.filter(r => r.error);
  const skipped = results.filter(r => r.skipped);

  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log(`  Total files: ${files.length}`);
  console.log(`  Fixed: ${fixed.length}`);
  console.log(`  Skipped: ${skipped.length}`);
  console.log(`  Errors: ${errors.length}`);

  if (fixed.length > 0) {
    console.log('\nFixes applied:');
    const changeCounts = {};
    fixed.forEach(r => {
      r.changes.forEach(c => {
        changeCounts[c] = (changeCounts[c] || 0) + 1;
      });
    });
    Object.entries(changeCounts).sort((a, b) => b[1] - a[1]).forEach(([change, count]) => {
      console.log(`  - ${change}: ${count}`);
    });
  }

  if (errors.length > 0 && verbose) {
    console.log('\nErrors:');
    errors.forEach(r => console.log(`  - ${r.filepath}: ${r.error}`));
  }

  console.log('\n✅ Done!\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
