#!/usr/bin/env node
/**
 * Batch Fix: Add ship-class to ai-breadcrumbs and siblings
 * Soli Deo Gloria
 *
 * Adds ship-class field to ai-breadcrumbs if missing, then adds siblings
 * based on the class.
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

// Ship class mappings from stats database
const SHIP_CLASSES = {
  // Celebrity Cruises
  'celebrity-edge': 'Edge Class',
  'celebrity-apex': 'Edge Class',
  'celebrity-beyond': 'Edge Class',
  'celebrity-ascent': 'Edge Class',
  'celebrity-xcel': 'Edge Class',
  'celebrity-solstice': 'Solstice Class',
  'celebrity-equinox': 'Solstice Class',
  'celebrity-eclipse': 'Solstice Class',
  'celebrity-silhouette': 'Solstice Class',
  'celebrity-reflection': 'Solstice Class',
  'celebrity-millennium': 'Millennium Class',
  'celebrity-infinity': 'Millennium Class',
  'celebrity-summit': 'Millennium Class',
  'celebrity-constellation': 'Millennium Class',
  'celebrity-xpedition': 'Expedition Class',
  'celebrity-flora': 'Expedition Class',
  'celebrity-xperience': 'Expedition Class',
  'celebrity-xploration': 'Expedition Class',

  // Costa Cruises
  'costa-smeralda': 'Excellence Class',
  'costa-toscana': 'Excellence Class',
  'costa-firenze': 'Vista Class',
  'costa-venezia': 'Vista Class',
  'costa-pacifica': 'Concordia Class',
  'costa-fascinosa': 'Concordia Class',
  'costa-favolosa': 'Concordia Class',
  'costa-diadema': 'Diadema Class',
  'costa-deliziosa': 'Concordia Class',

  // Cunard
  'queen-mary-2': 'QM2 Class',
  'queen-victoria': 'Vista Class',
  'queen-elizabeth': 'Vista Class',
  'queen-anne': 'Vista Class',

  // Norwegian
  'norwegian-prima': 'Prima Class',
  'norwegian-viva': 'Prima Class',
  'norwegian-aqua': 'Prima Class',
  'norwegian-breakaway': 'Breakaway Class',
  'norwegian-getaway': 'Breakaway Class',
  'norwegian-escape': 'Breakaway Plus',
  'norwegian-joy': 'Breakaway Plus',
  'norwegian-bliss': 'Breakaway Plus',
  'norwegian-encore': 'Breakaway Plus',
  'norwegian-epic': 'Epic Class',
  'norwegian-jewel': 'Jewel Class',
  'norwegian-jade': 'Jewel Class',
  'norwegian-pearl': 'Jewel Class',
  'norwegian-gem': 'Jewel Class',
  'norwegian-dawn': 'Dawn Class',
  'norwegian-star': 'Dawn Class',
  'norwegian-sun': 'Sun Class',
  'norwegian-sky': 'Sun Class',
  'norwegian-spirit': 'Spirit Class',
  'pride-of-america': 'Pride Class',

  // MSC
  'msc-world-europa': 'World Class',
  'msc-world-america': 'World Class',
  'msc-world-asia': 'World Class',
  'msc-meraviglia': 'Meraviglia Class',
  'msc-bellissima': 'Meraviglia Class',
  'msc-grandiosa': 'Meraviglia Plus',
  'msc-virtuosa': 'Meraviglia Plus',
  'msc-euribia': 'Meraviglia Plus',
  'msc-seaside': 'Seaside Class',
  'msc-seaview': 'Seaside Class',
  'msc-seashore': 'Seaside EVO',
  'msc-seascape': 'Seaside EVO',
  'msc-fantasia': 'Fantasia Class',
  'msc-splendida': 'Fantasia Class',
  'msc-divina': 'Fantasia Class',
  'msc-preziosa': 'Fantasia Class',
  'msc-musica': 'Musica Class',
  'msc-orchestra': 'Musica Class',
  'msc-poesia': 'Musica Class',
  'msc-magnifica': 'Musica Class',
  'msc-lirica': 'Lirica Class',
  'msc-opera': 'Lirica Class',
  'msc-sinfonia': 'Lirica Class',
  'msc-armonia': 'Lirica Class',

  // Holland America
  'koningsdam': 'Pinnacle Class',
  'nieuw-statendam': 'Pinnacle Class',
  'rotterdam': 'Pinnacle Class',
  'zuiderdam': 'Vista Class',
  'oosterdam': 'Vista Class',
  'westerdam': 'Vista Class',
  'noordam': 'Vista Class',
  'eurodam': 'Signature Class',
  'nieuw-amsterdam': 'Signature Class',
  'volendam': 'Rotterdam Class',
  'zaandam': 'Rotterdam Class',

  // Princess
  'sun-princess': 'Sphere Class',
  'star-princess': 'Sphere Class',
  'royal-princess': 'Royal Class',
  'regal-princess': 'Royal Class',
  'majestic-princess': 'Royal Class',
  'sky-princess': 'Royal Class',
  'enchanted-princess': 'Royal Class',
  'discovery-princess': 'Royal Class',
  'grand-princess': 'Grand Class',
  'caribbean-princess': 'Grand Class',
  'crown-princess': 'Grand Class',
  'emerald-princess': 'Grand Class',
  'ruby-princess': 'Grand Class',
  'coral-princess': 'Coral Class',
  'island-princess': 'Coral Class',
  'diamond-princess': 'Diamond Class',
  'sapphire-princess': 'Diamond Class',

  // Oceania
  'vista': 'Allura Class',
  'allura': 'Allura Class',
  'marina': 'Oceania Class',
  'riviera': 'Oceania Class',
  'regatta': 'R Class',
  'insignia': 'R Class',
  'nautica': 'R Class',
  'sirena': 'R Class',

  // Regent
  'seven-seas-grandeur': 'Explorer Class',
  'seven-seas-splendor': 'Explorer Class',
  'seven-seas-explorer': 'Explorer Class',
  'seven-seas-voyager': 'Voyager Class',
  'seven-seas-mariner': 'Mariner Class',
  'seven-seas-navigator': 'Navigator Class',

  // Seabourn
  'seabourn-encore': 'Encore Class',
  'seabourn-ovation': 'Encore Class',
  'seabourn-venture': 'Expedition Class',
  'seabourn-pursuit': 'Expedition Class',
  'seabourn-odyssey': 'Odyssey Class',
  'seabourn-sojourn': 'Odyssey Class',
  'seabourn-quest': 'Odyssey Class',

  // Silversea
  'silver-nova': 'Nova Class',
  'silver-ray': 'Nova Class',
  'silver-muse': 'Muse Class',
  'silver-moon': 'Muse Class',
  'silver-dawn': 'Muse Class',
  'silver-spirit': 'Spirit Class',
  'silver-shadow': 'Shadow Class',
  'silver-whisper': 'Shadow Class',
  'silver-wind': 'Wind Class',
  'silver-cloud': 'Cloud Class',
  'silver-endeavour': 'Expedition Class',
  'silver-origin': 'Expedition Class',

  // Virgin Voyages
  'scarlet-lady': 'Virgin Class',
  'valiant-lady': 'Virgin Class',
  'resilient-lady': 'Virgin Class',
  'brilliant-lady': 'Virgin Class',

  // Explora Journeys
  'explora-i': 'Explora Class',
  'explora-ii': 'Explora Class',
  'explora-iii': 'Explora Class',
  'explora-iv': 'Explora Class',
  'explora-v': 'Explora Class',
  'explora-vi': 'Explora Class'
};

async function getShipsByClassForLine(cruiseLine) {
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
    const slug = basename(file, '.html');
    const shipClass = SHIP_CLASSES[slug];

    if (shipClass) {
      if (!shipsByClass[shipClass]) {
        shipsByClass[shipClass] = [];
      }
      shipsByClass[shipClass].push({
        slug,
        path: `/ships/${cruiseLine}/${file}`
      });
    }
  }

  return shipsByClass;
}

function addShipClassAndSiblings(html, slug, cruiseLine, shipsByClass) {
  const shipClass = SHIP_CLASSES[slug];
  if (!shipClass) return { html, changes: [] };

  let changes = [];

  // Check if already has ship-class
  const hasShipClass = /ship-class:\s*\S/i.test(html);

  // Check if already has siblings
  const hasSiblings = /siblings:\s*\S/i.test(html);

  // Add ship-class if missing
  if (!hasShipClass && html.includes('cruise-line:')) {
    html = html.replace(
      /(cruise-line:\s*[^\n]+)/i,
      `$1\n     ship-class: ${shipClass}`
    );
    changes.push('ship-class');
  }

  // Add siblings if missing
  if (!hasSiblings) {
    const siblings = shipsByClass[shipClass] || [];
    const siblingPaths = siblings
      .filter(s => s.slug !== slug)
      .map(s => s.path)
      .join(', ');

    if (siblingPaths) {
      // Add after ship-class
      if (html.includes('ship-class:')) {
        html = html.replace(
          /(ship-class:\s*[^\n]+)/i,
          `$1\n     siblings: ${siblingPaths}`
        );
        changes.push('siblings');
      } else if (html.includes('cruise-line:')) {
        html = html.replace(
          /(cruise-line:\s*[^\n]+)/i,
          `$1\n     siblings: ${siblingPaths}`
        );
        changes.push('siblings');
      }
    }
  }

  return { html, changes };
}

async function processCruiseLine(cruiseLine) {
  const lineDir = join(SHIPS_DIR, cruiseLine);
  let files;
  try {
    files = await readdir(lineDir);
  } catch (e) {
    return { cruiseLine, error: e.message, fixed: 0 };
  }

  // Build class map for this cruise line
  const shipsByClass = await getShipsByClassForLine(cruiseLine);

  const htmlFiles = files.filter(f =>
    f.endsWith('.html') &&
    f !== 'index.html' &&
    !f.includes('unnamed')
  );

  let fixed = 0;

  for (const file of htmlFiles) {
    const slug = basename(file, '.html');
    const filepath = join(lineDir, file);
    const html = await readFile(filepath, 'utf8');

    const result = addShipClassAndSiblings(html, slug, cruiseLine, shipsByClass);

    if (result.changes.length > 0) {
      await writeFile(filepath, result.html, 'utf8');
      console.log(`  ✅ ${file}: Added ${result.changes.join(', ')}`);
      fixed++;
    }
  }

  return { cruiseLine, fixed, total: htmlFiles.length };
}

async function main() {
  console.log('Batch Fix: Add ship-class and siblings to ai-breadcrumbs');
  console.log('==========================================================\n');

  let totalFixed = 0;

  for (const cruiseLine of CRUISE_LINES) {
    console.log(`\n[${cruiseLine}]`);
    const result = await processCruiseLine(cruiseLine);

    if (result.error) {
      console.log(`  ⚠️ Error: ${result.error}`);
    } else {
      console.log(`  Summary: ${result.fixed} fixed`);
      totalFixed += result.fixed;
    }
  }

  console.log('\n==========================================================');
  console.log(`Total: ${totalFixed} files fixed`);
}

main().catch(console.error);
