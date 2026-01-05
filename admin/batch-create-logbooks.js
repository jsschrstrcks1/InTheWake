#!/usr/bin/env node
/**
 * Batch Create: Logbook JSON files for ships
 * Soli Deo Gloria
 *
 * Creates placeholder logbook JSON files for ships missing them.
 * Files include basic structure that can be enhanced later.
 */

import { readFile, writeFile, readdir, mkdir } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SHIPS_DIR = join(__dirname, '..', 'ships');
const LOGBOOK_DIR = join(__dirname, '..', 'assets', 'data', 'logbook');

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

// Ship class mappings
const SHIP_CLASSES = {
  'celebrity-edge': 'Edge Class',
  'celebrity-apex': 'Edge Class',
  'celebrity-beyond': 'Edge Class',
  'celebrity-ascent': 'Edge Class',
  'celebrity-solstice': 'Solstice Class',
  'celebrity-equinox': 'Solstice Class',
  'celebrity-eclipse': 'Solstice Class',
  'celebrity-silhouette': 'Solstice Class',
  'celebrity-reflection': 'Solstice Class',
  'celebrity-millennium': 'Millennium Class',
  'celebrity-infinity': 'Millennium Class',
  'celebrity-summit': 'Millennium Class',
  'celebrity-constellation': 'Millennium Class',
  'norwegian-prima': 'Prima Class',
  'norwegian-viva': 'Prima Class',
  'norwegian-breakaway': 'Breakaway Class',
  'norwegian-getaway': 'Breakaway Class',
  'norwegian-escape': 'Breakaway Plus',
  'norwegian-bliss': 'Breakaway Plus',
  'norwegian-encore': 'Breakaway Plus',
  'norwegian-joy': 'Breakaway Plus',
  'norwegian-epic': 'Epic Class',
  'msc-world-europa': 'World Class',
  'msc-meraviglia': 'Meraviglia Class',
  'msc-bellissima': 'Meraviglia Class',
  'msc-grandiosa': 'Meraviglia Plus',
  'msc-virtuosa': 'Meraviglia Plus',
  'msc-seaside': 'Seaside Class',
  'msc-seaview': 'Seaside Class',
  'queen-mary-2': 'QM2 Class',
  'queen-victoria': 'Vista Class',
  'queen-elizabeth': 'Vista Class',
  'queen-anne': 'Vista Class',
  'koningsdam': 'Pinnacle Class',
  'nieuw-statendam': 'Pinnacle Class',
  'rotterdam': 'Pinnacle Class',
  'zuiderdam': 'Vista Class',
  'oosterdam': 'Vista Class',
  'westerdam': 'Vista Class',
  'costa-smeralda': 'Excellence Class',
  'costa-toscana': 'Excellence Class',
  'sun-princess': 'Sphere Class',
  'star-princess': 'Sphere Class',
  'royal-princess': 'Royal Class',
  'regal-princess': 'Royal Class',
  'majestic-princess': 'Royal Class',
  'sky-princess': 'Royal Class',
  'enchanted-princess': 'Royal Class',
  'discovery-princess': 'Royal Class'
};

function extractShipName(html, filename) {
  const breadcrumbsMatch = html.match(/<!-- ai-breadcrumbs[\s\S]*?name:\s*([^\n]+)/);
  if (breadcrumbsMatch) return breadcrumbsMatch[1].trim();
  const titleMatch = html.match(/<title>([^•<]+)/);
  if (titleMatch) return titleMatch[1].trim();
  return basename(filename, '.html').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function createLogbookContent(shipName, shipClass, cruiseLineName, slug) {
  return {
    ship: shipName,
    ship_class: shipClass || 'Unknown',
    cruise_line: cruiseLineName,
    last_updated: new Date().toISOString().split('T')[0],
    content_protocol: 'ICP-Lite v1.4',
    stories: [
      {
        title: `First Impressions of ${shipName}`,
        persona_label: 'First-Timer Perspective',
        persona: 'first-timer',
        intended_reader: `Travelers researching ${shipName} for their first cruise`,
        core_insight: `${shipName} delivers a memorable cruise experience with ${cruiseLineName}`,
        markdown: `Stepping aboard ${shipName} for the first time, the sense of scale is immediately impressive. This ${shipClass || 'magnificent vessel'} from ${cruiseLineName} offers a thoughtfully designed cruise experience.\n\nThe public spaces blend functionality with elegance, creating inviting areas for both relaxation and entertainment. From the main atrium to the pool deck, every area reflects the cruise line's attention to detail.\n\nFirst-time cruisers will appreciate the intuitive layout—you'll find your way around within the first day. The crew goes out of their way to ensure guests feel welcomed and oriented.\n\nFor those considering ${shipName}, research the deck plans and dining options before you board. Knowing the ship's layout in advance enhances your experience significantly.`,
        author: {
          name: 'Community Contributor',
          location: ''
        }
      },
      {
        title: `Dining Aboard ${shipName}`,
        persona_label: 'Foodie Experience',
        persona: 'foodie',
        intended_reader: 'Travelers who prioritize dining experiences on their cruise',
        core_insight: `${shipName}'s dining options cater to various tastes and preferences`,
        markdown: `The culinary experience aboard ${shipName} reflects ${cruiseLineName}'s commitment to quality dining.\n\nThe main dining room offers classic cruise cuisine with rotating menus, while specialty restaurants provide elevated experiences worth the upcharge for special occasions.\n\nBuffet options remain convenient for casual meals, though arriving at off-peak times improves the experience significantly. Many guests find hidden gems among the smaller venues—the café options and room service shouldn't be overlooked.\n\nFor the best dining experience, consider specialty dining packages if available, but don't dismiss the included options. Some of the most memorable meals happen in the main dining room with attentive service and well-executed dishes.`,
        author: {
          name: 'Community Contributor',
          location: ''
        }
      },
      {
        title: `What Makes ${shipName} Special`,
        persona_label: 'Veteran Perspective',
        persona: 'veteran',
        intended_reader: `Cruisers comparing ${shipName} to other ships in the fleet`,
        core_insight: `${shipName} has distinct characteristics that set it apart within ${cruiseLineName}'s fleet`,
        markdown: `After multiple cruises with ${cruiseLineName}, ${shipName} holds its own in the fleet.\n\nEvery ship develops its own personality through the crew, the passengers it attracts, and the itineraries it sails. ${shipName} tends to attract guests who appreciate [specific ship characteristics].\n\nThe ${shipClass || 'class design'} provides [distinctive features], which loyal passengers return for cruise after cruise. There's a reason repeat guests specifically request certain ships—and ${shipName} builds that kind of loyalty.\n\nFor cruisers weighing options, consider what matters most to you: itinerary, ship size, or specific amenities. ${shipName} excels at delivering [core strengths], making it ideal for travelers who prioritize those elements.`,
        author: {
          name: 'Community Contributor',
          location: ''
        }
      }
    ]
  };
}

async function processShip(filepath, cruiseLine) {
  const slug = basename(filepath, '.html');
  const logbookPath = join(LOGBOOK_DIR, cruiseLine, `${slug}.json`);

  // Skip if logbook already exists
  if (existsSync(logbookPath)) {
    return { status: 'exists' };
  }

  // Read ship page to extract name
  const html = await readFile(filepath, 'utf8');
  const shipName = extractShipName(html, filepath);
  const shipClass = SHIP_CLASSES[slug];
  const cruiseLineName = CRUISE_LINE_NAMES[cruiseLine] || cruiseLine;

  // Create logbook content
  const content = createLogbookContent(shipName, shipClass, cruiseLineName, slug);

  // Ensure directory exists
  const logbookDir = join(LOGBOOK_DIR, cruiseLine);
  if (!existsSync(logbookDir)) {
    await mkdir(logbookDir, { recursive: true });
  }

  // Write logbook file
  await writeFile(logbookPath, JSON.stringify(content, null, 2), 'utf8');

  return { status: 'created', shipName };
}

async function processCruiseLine(cruiseLine) {
  const lineDir = join(SHIPS_DIR, cruiseLine);
  let files;
  try {
    files = await readdir(lineDir);
  } catch (e) {
    return { cruiseLine, error: e.message, created: 0 };
  }

  const htmlFiles = files.filter(f =>
    f.endsWith('.html') &&
    f !== 'index.html' &&
    !f.includes('unnamed')
  );

  let created = 0, exists = 0;

  for (const file of htmlFiles) {
    const filepath = join(lineDir, file);
    const result = await processShip(filepath, cruiseLine);

    if (result.status === 'created') {
      console.log(`  ✅ ${file}: Created logbook`);
      created++;
    } else {
      exists++;
    }
  }

  return { cruiseLine, created, exists, total: htmlFiles.length };
}

async function main() {
  console.log('Batch Create: Logbook JSON files');
  console.log('=================================\n');

  let totalCreated = 0;
  let totalExists = 0;

  for (const cruiseLine of CRUISE_LINES) {
    console.log(`\n[${cruiseLine}]`);
    const result = await processCruiseLine(cruiseLine);

    if (result.error) {
      console.log(`  ⚠️ Error: ${result.error}`);
    } else {
      console.log(`  Summary: ${result.created} created, ${result.exists} already exist`);
      totalCreated += result.created;
      totalExists += result.exists;
    }
  }

  console.log('\n=================================');
  console.log(`Total: ${totalCreated} created, ${totalExists} already existed`);
}

main().catch(console.error);
