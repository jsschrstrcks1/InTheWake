#!/usr/bin/env node
/**
 * Universal Ship Page Batch Fix
 * Soli Deo Gloria
 *
 * Applies common fixes across all cruise line ship pages:
 * 1. Add WCAG skip-link if missing
 * 2. Add missing JSON-LD schemas (Organization, WebSite, BreadcrumbList)
 * 3. Add ship-map image to deck plans
 * 4. Add dining-data-source JSON element
 * 5. Add stats-fallback JSON element
 * 6. Fix styles.css version parameter
 * 7. Add missing ai-breadcrumbs fields (name, siblings)
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { join, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SHIPS_DIR = join(__dirname, '..', 'ships');

// Cruise line configurations
const CRUISE_LINES = {
  'carnival': { name: 'Carnival Cruise Line', url: 'https://www.carnival.com' },
  'celebrity-cruises': { name: 'Celebrity Cruises', url: 'https://www.celebritycruises.com' },
  'costa': { name: 'Costa Cruises', url: 'https://www.costacruises.com' },
  'cunard': { name: 'Cunard Line', url: 'https://www.cunard.com' },
  'explora-journeys': { name: 'Explora Journeys', url: 'https://www.explorajourneys.com' },
  'holland-america-line': { name: 'Holland America Line', url: 'https://www.hollandamerica.com' },
  'msc': { name: 'MSC Cruises', url: 'https://www.msccruises.com' },
  'norwegian': { name: 'Norwegian Cruise Line', url: 'https://www.ncl.com' },
  'oceania': { name: 'Oceania Cruises', url: 'https://www.oceaniacruises.com' },
  'princess': { name: 'Princess Cruises', url: 'https://www.princess.com' },
  'rcl': { name: 'Royal Caribbean', url: 'https://www.royalcaribbean.com' },
  'regent': { name: 'Regent Seven Seas Cruises', url: 'https://www.rssc.com' },
  'seabourn': { name: 'Seabourn', url: 'https://www.seabourn.com' },
  'silversea': { name: 'Silversea Cruises', url: 'https://www.silversea.com' },
  'virgin-voyages': { name: 'Virgin Voyages', url: 'https://www.virginvoyages.com' }
};

function getShipName(html, filename) {
  // Try to extract from h1
  const h1Match = html.match(/<h1[^>]*>([^<]+)</);
  if (h1Match) return h1Match[1].split('—')[0].split('|')[0].trim();

  // Try from title
  const titleMatch = html.match(/<title>([^<]+)</);
  if (titleMatch) return titleMatch[1].split('—')[0].split('|')[0].trim();

  // Fall back to filename
  return basename(filename, '.html').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getShipSlug(filename) {
  return basename(filename, '.html');
}

async function processFile(filepath, cruiseLine) {
  const filename = basename(filepath);
  if (filename === 'index.html') return { status: 'skipped', reason: 'index file' };

  let html = await readFile(filepath, 'utf8');
  const changes = [];
  const shipName = getShipName(html, filename);
  const shipSlug = getShipSlug(filename);
  const lineConfig = CRUISE_LINES[cruiseLine];

  // 1. Add WCAG skip-link if missing
  if (!html.includes('skip-link') && !html.includes('Skip to')) {
    const bodyMatch = html.match(/(<body[^>]*>)/);
    if (bodyMatch) {
      html = html.replace(bodyMatch[0], bodyMatch[0] + '\n<a href="#main-content" class="skip-link">Skip to main content</a>\n');
      changes.push('Added WCAG skip-link');
    }
  }

  // 2. Add missing JSON-LD Organization schema
  if (!html.includes('"@type":"Organization"') && !html.includes('"@type": "Organization"')) {
    const headEnd = html.indexOf('</head>');
    if (headEnd > -1) {
      const orgSchema = `
<!-- JSON-LD: Organization -->
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"In the Wake","url":"https://cruisinginthewake.com","logo":"https://cruisinginthewake.com/assets/logo_wake_512.png"}</script>
`;
      html = html.slice(0, headEnd) + orgSchema + html.slice(headEnd);
      changes.push('Added Organization JSON-LD');
    }
  }

  // 3. Add missing JSON-LD WebSite schema
  if (!html.includes('"@type":"WebSite"') && !html.includes('"@type": "WebSite"')) {
    const headEnd = html.indexOf('</head>');
    if (headEnd > -1) {
      const websiteSchema = `
<!-- JSON-LD: WebSite -->
<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"In the Wake","url":"https://cruisinginthewake.com","potentialAction":{"@type":"SearchAction","target":"https://cruisinginthewake.com/search.html?q={search_term_string}","query-input":"required name=search_term_string"}}</script>
`;
      html = html.slice(0, headEnd) + websiteSchema + html.slice(headEnd);
      changes.push('Added WebSite JSON-LD');
    }
  }

  // 4. Add missing JSON-LD BreadcrumbList schema
  if (!html.includes('"@type":"BreadcrumbList"') && !html.includes('"@type": "BreadcrumbList"')) {
    const headEnd = html.indexOf('</head>');
    if (headEnd > -1) {
      const breadcrumbSchema = `
<!-- JSON-LD: BreadcrumbList -->
<script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://cruisinginthewake.com/"},{"@type":"ListItem","position":2,"name":"Ships","item":"https://cruisinginthewake.com/ships.html"},{"@type":"ListItem","position":3,"name":"${lineConfig.name}","item":"https://cruisinginthewake.com/cruise-lines/${cruiseLine}.html"},{"@type":"ListItem","position":4,"name":"${shipName}","item":"https://cruisinginthewake.com/ships/${cruiseLine}/${shipSlug}.html"}]}</script>
`;
      html = html.slice(0, headEnd) + breadcrumbSchema + html.slice(headEnd);
      changes.push('Added BreadcrumbList JSON-LD');
    }
  }

  // 5. Add missing ai-breadcrumbs name field
  const aiBreadcrumbsMatch = html.match(/<!-- ai-breadcrumbs([\s\S]*?)-->/);
  if (aiBreadcrumbsMatch && !aiBreadcrumbsMatch[1].includes('name:')) {
    const updatedBreadcrumbs = aiBreadcrumbsMatch[0].replace(
      'entity:',
      `name: ${shipName}\n     entity:`
    );
    html = html.replace(aiBreadcrumbsMatch[0], updatedBreadcrumbs);
    changes.push('Added ai-breadcrumbs name field');
  }

  // 6. Fix styles.css missing version parameter
  if (html.includes('styles.css"') && !html.includes('styles.css?v=')) {
    html = html.replace(/styles\.css"/g, 'styles.css?v=3.010"');
    changes.push('Added styles.css version parameter');
  }

  // 7. Add ship-map image if deck plans section exists without one
  if (html.includes('Deck Plan') && !html.includes('ship-map.png')) {
    const deckPlanPatterns = [
      /(<section[^>]*>[^]*?<h2[^>]*>[^<]*Deck Plan[^<]*<\/h2>[^]*?<\/p>)/i,
      /(<h2[^>]*>[^<]*Deck Plan[^<]*<\/h2>)/i
    ];
    for (const pattern of deckPlanPatterns) {
      if (pattern.test(html)) {
        html = html.replace(pattern, (match) => {
          return match + `
        <figure>
          <img src="/assets/ship-map.png" alt="${shipName} simplified deck plan preview" loading="lazy"/>
          <figcaption class="tiny">Simplified deck layout overview</figcaption>
        </figure>`;
        });
        changes.push('Added ship map image');
        break;
      }
    }
  }

  // 8. Add dining-data-source if dining section exists without it
  if ((html.includes('Dining') || html.includes('dining')) && !html.includes('dining-data-source')) {
    // Find a good insertion point near dining content
    const diningSection = html.match(/<section[^>]*>[^]*?[Dd]ining[^]*?<\/section>/);
    if (diningSection) {
      const insertPoint = html.indexOf(diningSection[0]) + diningSection[0].length;
      const diningSource = `
<script type="application/json" id="dining-data-source">{"provider":"${cruiseLine}","json":"/assets/data/venues-v2.json","ship_slug":"${shipSlug}","aliases":["${shipName}"]}</script>`;
      html = html.slice(0, insertPoint) + diningSource + html.slice(insertPoint);
      changes.push('Added dining-data-source');
    }
  }

  // 9. Add stats-fallback if ship stats section exists without it
  if (html.includes('ship-stats') && !html.includes('ship-stats-fallback')) {
    const statsMatch = html.match(/(<div[^>]*id="ship-stats"[^>]*><\/div>)/);
    if (statsMatch) {
      const statsFallback = `
<script type="application/json" id="ship-stats-fallback">{"slug":"${shipSlug}","name":"${shipName}","cruise_line":"${lineConfig.name}"}</script>`;
      html = html.replace(statsMatch[0], statsMatch[0] + statsFallback);
      changes.push('Added stats-fallback');
    }
  }

  if (changes.length > 0) {
    await writeFile(filepath, html, 'utf8');
    return { status: 'fixed', changes };
  }

  return { status: 'unchanged' };
}

async function processCruiseLine(cruiseLine) {
  const lineDir = join(SHIPS_DIR, cruiseLine);
  let files;
  try {
    files = await readdir(lineDir);
  } catch (e) {
    return { cruiseLine, error: e.message };
  }

  const htmlFiles = files.filter(f => f.endsWith('.html'));
  let fixed = 0, unchanged = 0, skipped = 0;

  for (const file of htmlFiles) {
    const filepath = join(lineDir, file);
    const result = await processFile(filepath, cruiseLine);

    if (result.status === 'fixed') {
      console.log(`  ✅ ${file}: ${result.changes.join(', ')}`);
      fixed++;
    } else if (result.status === 'skipped') {
      skipped++;
    } else {
      unchanged++;
    }
  }

  return { cruiseLine, fixed, unchanged, skipped, total: htmlFiles.length };
}

async function main() {
  console.log('Universal Ship Page Batch Fix');
  console.log('==============================\n');

  const results = [];
  for (const cruiseLine of Object.keys(CRUISE_LINES)) {
    console.log(`\n[${cruiseLine}]`);
    const result = await processCruiseLine(cruiseLine);
    if (result.error) {
      console.log(`  ⚠️ Error: ${result.error}`);
    } else {
      console.log(`  Summary: ${result.fixed} fixed, ${result.unchanged} unchanged, ${result.skipped} skipped`);
    }
    results.push(result);
  }

  console.log('\n==============================');
  console.log('Overall Summary:');
  const totalFixed = results.reduce((sum, r) => sum + (r.fixed || 0), 0);
  const totalFiles = results.reduce((sum, r) => sum + (r.total || 0), 0);
  console.log(`Fixed ${totalFixed} files across ${totalFiles} total ship pages`);
}

main().catch(console.error);
