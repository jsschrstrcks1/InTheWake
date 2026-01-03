#!/usr/bin/env node
/**
 * Batch Fix: Add ship-stats-fallback JSON element
 * Soli Deo Gloria
 *
 * Adds a minimal ship-stats-fallback JSON element to pages missing it.
 * Extracts ship name and cruise line from existing page metadata.
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SHIPS_DIR = join(__dirname, '..', 'ships');

const CRUISE_LINES = [
  'carnival', 'celebrity-cruises', 'costa', 'cunard', 'explora-journeys',
  'holland-america-line', 'msc', 'norwegian', 'oceania', 'princess',
  'rcl', 'regent', 'seabourn', 'silversea', 'virgin-voyages'
];

const CRUISE_LINE_NAMES = {
  'carnival': 'Carnival Cruise Line',
  'celebrity-cruises': 'Celebrity Cruises',
  'costa': 'Costa Cruises',
  'cunard': 'Cunard Line',
  'explora-journeys': 'Explora Journeys',
  'holland-america-line': 'Holland America Line',
  'msc': 'MSC Cruises',
  'norwegian': 'Norwegian Cruise Line',
  'oceania': 'Oceania Cruises',
  'princess': 'Princess Cruises',
  'rcl': 'Royal Caribbean International',
  'regent': 'Regent Seven Seas Cruises',
  'seabourn': 'Seabourn Cruise Line',
  'silversea': 'Silversea Cruises',
  'virgin-voyages': 'Virgin Voyages'
};

function extractShipName(html, filename) {
  // Try to get from ai-breadcrumbs name field
  const breadcrumbsMatch = html.match(/<!-- ai-breadcrumbs[\s\S]*?name:\s*([^\n]+)/);
  if (breadcrumbsMatch) {
    return breadcrumbsMatch[1].trim();
  }

  // Try to get from title
  const titleMatch = html.match(/<title>([^•<]+)/);
  if (titleMatch) {
    return titleMatch[1].trim();
  }

  // Fallback to filename
  return basename(filename, '.html')
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function addStatsFallback(html, cruiseLine, filename) {
  // Skip if already has stats fallback
  if (html.includes('id="ship-stats-fallback"')) {
    return { html, added: false };
  }

  const shipName = extractShipName(html, filename);
  const slug = basename(filename, '.html');
  const cruiseLineName = CRUISE_LINE_NAMES[cruiseLine] || cruiseLine;

  const statsJson = JSON.stringify({
    slug,
    name: shipName,
    cruise_line: cruiseLineName
  });

  const scriptTag = `<script type="application/json" id="ship-stats-fallback">${statsJson}</script>`;

  // Try to insert after key-facts section
  if (html.includes('class="key-facts"')) {
    const keyFactsPattern = /(class="key-facts"[^>]*>)(\s*<\/div>)?/;
    if (keyFactsPattern.test(html)) {
      const fixed = html.replace(keyFactsPattern, (match, openTag, closeDiv) => {
        if (closeDiv) {
          return `${openTag}</div>\n        ${scriptTag}`;
        }
        return match;
      });
      if (fixed !== html) {
        return { html: fixed, added: true };
      }
    }
  }

  // Try to insert after dining-data-source if it exists
  if (html.includes('id="dining-data-source"')) {
    const fixed = html.replace(
      /(<script type="application\/json" id="dining-data-source">.*?<\/script>)/s,
      `$1\n        ${scriptTag}`
    );
    if (fixed !== html) {
      return { html: fixed, added: true };
    }
  }

  // Try to insert before </main>
  if (html.includes('</main>')) {
    const fixed = html.replace(
      '</main>',
      `  ${scriptTag}\n  </main>`
    );
    return { html: fixed, added: true };
  }

  // Last resort: insert before </body>
  const fixed = html.replace(
    '</body>',
    `  ${scriptTag}\n</body>`
  );

  return { html: fixed, added: fixed !== html };
}

async function processFile(filepath, cruiseLine) {
  const html = await readFile(filepath, 'utf8');
  const result = addStatsFallback(html, cruiseLine, filepath);

  if (result.added) {
    await writeFile(filepath, result.html, 'utf8');
    return { status: 'fixed' };
  }

  return { status: html.includes('ship-stats-fallback') ? 'already-has' : 'unchanged' };
}

async function processCruiseLine(cruiseLine) {
  const lineDir = join(SHIPS_DIR, cruiseLine);
  let files;
  try {
    files = await readdir(lineDir);
  } catch (e) {
    return { cruiseLine, error: e.message, fixed: 0 };
  }

  const htmlFiles = files.filter(f =>
    f.endsWith('.html') &&
    f !== 'index.html' &&
    !f.includes('unnamed')
  );

  let fixed = 0, alreadyHas = 0;

  for (const file of htmlFiles) {
    const filepath = join(lineDir, file);
    const result = await processFile(filepath, cruiseLine);

    if (result.status === 'fixed') {
      console.log(`  ✅ ${file}: Added stats-fallback`);
      fixed++;
    } else if (result.status === 'already-has') {
      alreadyHas++;
    }
  }

  return { cruiseLine, fixed, alreadyHas, total: htmlFiles.length };
}

async function main() {
  console.log('Batch Fix: Add ship-stats-fallback JSON');
  console.log('========================================\n');

  let totalFixed = 0;
  let totalAlreadyHas = 0;
  let totalFiles = 0;

  for (const cruiseLine of CRUISE_LINES) {
    console.log(`\n[${cruiseLine}]`);
    const result = await processCruiseLine(cruiseLine);

    if (result.error) {
      console.log(`  ⚠️ Error: ${result.error}`);
    } else {
      console.log(`  Summary: ${result.fixed} added, ${result.alreadyHas} already have it`);
      totalFixed += result.fixed;
      totalAlreadyHas += result.alreadyHas;
      totalFiles += result.total;
    }
  }

  console.log('\n========================================');
  console.log(`Total: ${totalFixed} files fixed, ${totalAlreadyHas} already had stats-fallback (${totalFiles} total)`);
}

main().catch(console.error);
