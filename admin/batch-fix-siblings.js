#!/usr/bin/env node
/**
 * Batch Fix: Add siblings field to ai-breadcrumbs
 * Soli Deo Gloria
 *
 * Groups ships by cruise line and class, then adds siblings field
 * to ai-breadcrumbs listing sister ships in the same class.
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

function extractShipClass(html) {
  // Try to get from ai-breadcrumbs ship-class field
  const classMatch = html.match(/ship-class:\s*([^\n]+)/i);
  if (classMatch) {
    return classMatch[1].trim();
  }

  // Try to get from stats fallback
  const statsMatch = html.match(/ship-stats-fallback[^>]*>([^<]+)/);
  if (statsMatch) {
    try {
      const stats = JSON.parse(statsMatch[1]);
      if (stats.class) return stats.class;
    } catch (e) {}
  }

  return null;
}

async function getShipsByClass(cruiseLine) {
  const lineDir = join(SHIPS_DIR, cruiseLine);
  let files;
  try {
    files = await readdir(lineDir);
  } catch (e) {
    return {};
  }

  const htmlFiles = files.filter(f =>
    f.endsWith('.html') &&
    f !== 'index.html' &&
    !f.includes('unnamed')
  );

  const shipsByClass = {};

  for (const file of htmlFiles) {
    const filepath = join(lineDir, file);
    const html = await readFile(filepath, 'utf8');
    const shipClass = extractShipClass(html);

    if (shipClass) {
      if (!shipsByClass[shipClass]) {
        shipsByClass[shipClass] = [];
      }
      shipsByClass[shipClass].push({
        file,
        path: `/ships/${cruiseLine}/${file}`
      });
    }
  }

  return shipsByClass;
}

function addSiblings(html, siblings, cruiseLine, filename) {
  // Skip if already has siblings
  if (/siblings:\s*\S/i.test(html)) {
    return { html, added: false, skipped: 'already has siblings' };
  }

  // Skip if no siblings (only ship in class)
  if (siblings.length === 0) {
    return { html, added: false, skipped: 'no siblings in class' };
  }

  // Format siblings list
  const siblingsList = siblings
    .filter(s => s.file !== filename) // Exclude self
    .map(s => s.path)
    .join(', ');

  if (!siblingsList) {
    return { html, added: false, skipped: 'only ship in class' };
  }

  // Add siblings after ship-class in ai-breadcrumbs
  if (html.includes('ship-class:')) {
    const fixed = html.replace(
      /(ship-class:\s*[^\n]+)/i,
      `$1\n     siblings: ${siblingsList}`
    );
    if (fixed !== html) {
      return { html: fixed, added: true };
    }
  }

  // Add siblings after cruise-line if no ship-class
  if (html.includes('cruise-line:')) {
    const fixed = html.replace(
      /(cruise-line:\s*[^\n]+)/i,
      `$1\n     siblings: ${siblingsList}`
    );
    if (fixed !== html) {
      return { html: fixed, added: true };
    }
  }

  // Add after category if no cruise-line
  if (html.includes('category:')) {
    const fixed = html.replace(
      /(category:\s*[^\n]+)/i,
      `$1\n     siblings: ${siblingsList}`
    );
    if (fixed !== html) {
      return { html: fixed, added: true };
    }
  }

  return { html, added: false, skipped: 'could not find insertion point' };
}

async function processCruiseLine(cruiseLine) {
  const lineDir = join(SHIPS_DIR, cruiseLine);
  let files;
  try {
    files = await readdir(lineDir);
  } catch (e) {
    return { cruiseLine, error: e.message, fixed: 0 };
  }

  // First, build the class map
  const shipsByClass = await getShipsByClass(cruiseLine);

  const htmlFiles = files.filter(f =>
    f.endsWith('.html') &&
    f !== 'index.html' &&
    !f.includes('unnamed')
  );

  let fixed = 0, skipped = 0;

  for (const file of htmlFiles) {
    const filepath = join(lineDir, file);
    const html = await readFile(filepath, 'utf8');
    const shipClass = extractShipClass(html);

    if (!shipClass) {
      skipped++;
      continue;
    }

    const siblings = shipsByClass[shipClass] || [];
    const result = addSiblings(html, siblings, cruiseLine, file);

    if (result.added) {
      await writeFile(filepath, result.html, 'utf8');
      const count = siblings.filter(s => s.file !== file).length;
      console.log(`  ✅ ${file}: Added ${count} siblings (${shipClass})`);
      fixed++;
    } else if (result.skipped !== 'only ship in class' && result.skipped !== 'no siblings in class') {
      skipped++;
    }
  }

  return { cruiseLine, fixed, skipped, total: htmlFiles.length };
}

async function main() {
  console.log('Batch Fix: Add siblings to ai-breadcrumbs');
  console.log('==========================================\n');

  let totalFixed = 0;
  let totalFiles = 0;

  for (const cruiseLine of CRUISE_LINES) {
    console.log(`\n[${cruiseLine}]`);
    const result = await processCruiseLine(cruiseLine);

    if (result.error) {
      console.log(`  ⚠️ Error: ${result.error}`);
    } else {
      console.log(`  Summary: ${result.fixed} fixed`);
      totalFixed += result.fixed;
      totalFiles += result.total;
    }
  }

  console.log('\n==========================================');
  console.log(`Total: ${totalFixed} files fixed (${totalFiles} total)`);
}

main().catch(console.error);
