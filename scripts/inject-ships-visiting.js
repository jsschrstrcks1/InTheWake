#!/usr/bin/env node
/**
 * inject-ships-visiting.js
 *
 * Injects static "Ships That Visit Here" sections into port pages.
 * Uses ship-deployments.json for port→ship mappings.
 *
 * Usage: node scripts/inject-ships-visiting.js [--dry-run]
 *
 * Soli Deo Gloria
 */

const fs = require('fs');
const path = require('path');

const PORTS_DIR = path.join(__dirname, '..', 'ports');
const DEPLOYMENTS_PATH = path.join(__dirname, '..', 'assets', 'data', 'ship-deployments.json');

const dryRun = process.argv.includes('--dry-run');

// Cruise line metadata
const CRUISE_LINES = {
  rcl: { name: 'Royal Caribbean', path: '/ships/rcl/' },
  carnival: { name: 'Carnival Cruise Line', path: '/ships/carnival/' },
  celebrity: { name: 'Celebrity Cruises', path: '/ships/celebrity-cruises/' },
  ncl: { name: 'Norwegian Cruise Line', path: '/ships/ncl/' },
  princess: { name: 'Princess Cruises', path: '/ships/princess/' },
  hal: { name: 'Holland America Line', path: '/ships/hal/' },
  msc: { name: 'MSC Cruises', path: '/ships/msc/' },
  virgin: { name: 'Virgin Voyages', path: '/ships/virgin/' },
  costa: { name: 'Costa Cruises', path: '/ships/costa/' },
  cunard: { name: 'Cunard', path: '/ships/cunard/' },
  oceania: { name: 'Oceania Cruises', path: '/ships/oceania/' },
  regent: { name: 'Regent Seven Seas', path: '/ships/regent/' },
  seabourn: { name: 'Seabourn', path: '/ships/seabourn/' },
  silversea: { name: 'Silversea Cruises', path: '/ships/silversea/' },
  explora: { name: 'Explora Journeys', path: '/ships/explora/' }
};

// Display order (Royal Caribbean family first, then others)
const CRUISE_LINE_ORDER = [
  'rcl', 'celebrity', 'princess', 'hal', 'cunard', 'oceania', 'regent',
  'seabourn', 'silversea', 'explora', 'ncl', 'msc', 'costa', 'virgin', 'carnival'
];

// Class sort orders per cruise line (larger ships first)
const CLASS_ORDERS = {
  rcl: ['Icon', 'Oasis', 'Quantum', 'Freedom', 'Voyager', 'Radiance', 'Vision', 'Other'],
  carnival: ['Excel', 'Vista', 'Dream', 'Concordia', 'Venice', 'Destiny', 'Conquest', 'Spirit', 'Fantasy', 'Other'],
  celebrity: ['Edge', 'Solstice', 'Millennium', 'Expedition', 'Other'],
  ncl: ['Prima', 'Breakaway Plus', 'Breakaway', 'Epic', 'Jewel', 'Dawn', 'Sun', 'Spirit', 'Sky', 'America', 'Other'],
  princess: ['Sphere', 'Royal', 'Grand', 'Coral', 'Other'],
  hal: ['Pinnacle', 'Signature', 'Vista', 'R', 'Other'],
  msc: ['World', 'Meraviglia Plus', 'Seaside EVO', 'Meraviglia', 'Seaside', 'Fantasia', 'Musica', 'Lirica', 'Other'],
  virgin: ['Lady', 'Other'],
  costa: ['Excellence', 'Venice', 'Diadema', 'Concordia', 'Spirit', 'Other'],
  cunard: ['Ocean Liner', 'Queen', 'Other'],
  oceania: ['Allura', 'Vista', 'Oceania', 'R-Class', 'Other'],
  regent: ['Grandeur', 'Splendor', 'Explorer', 'Voyager', 'Mariner', 'Navigator', 'Other'],
  seabourn: ['Encore', 'Odyssey', 'Expedition', 'Other'],
  silversea: ['Nova', 'Muse', 'Spirit', 'Shadow', 'Wind', 'Expedition', 'Other'],
  explora: ['Explora', 'Other']
};

// Special port name formatting
const SPECIAL_NAMES = {
  'cococay': 'Perfect Day at CocoCay',
  'half-moon-cay': 'Half Moon Cay',
  'grand-turk': 'Grand Turk',
  'amber-cove': 'Amber Cove',
  'mahogany-bay': 'Mahogany Bay',
  'st-thomas': 'St. Thomas',
  'st-maarten': 'St. Maarten',
  'st-kitts': 'St. Kitts',
  'st-lucia': 'St. Lucia',
  'grand-cayman': 'Grand Cayman',
  'san-juan': 'San Juan',
  'costa-maya': 'Costa Maya',
  'cabo-san-lucas': 'Cabo San Lucas',
  'puerto-vallarta': 'Puerto Vallarta',
  'key-west': 'Key West',
  'port-canaveral': 'Port Canaveral',
  'fort-lauderdale': 'Fort Lauderdale',
  'ocean-cay': 'Ocean Cay MSC Marine Reserve',
  'bimini': 'The Beach Club at Bimini',
  'great-stirrup-cay': 'Great Stirrup Cay'
};

function formatPortName(slug) {
  if (SPECIAL_NAMES[slug]) return SPECIAL_NAMES[slug];
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function formatShipName(slug) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generateShipsSection(portSlug, portToShips, ships) {
  const shipSlugs = portToShips[portSlug];
  if (!shipSlugs || shipSlugs.length === 0) return null;

  // Group ships by cruise line, then by class
  const shipsByCruiseLine = {};
  shipSlugs.forEach(slug => {
    const shipData = ships[slug];
    if (!shipData) return;
    const cruiseLine = shipData.cruise_line || 'rcl';
    const shipClass = shipData.class || 'Other';
    if (!shipsByCruiseLine[cruiseLine]) shipsByCruiseLine[cruiseLine] = {};
    if (!shipsByCruiseLine[cruiseLine][shipClass]) shipsByCruiseLine[cruiseLine][shipClass] = [];
    shipsByCruiseLine[cruiseLine][shipClass].push({
      slug,
      name: shipData.name || formatShipName(slug),
      class: shipClass
    });
  });

  const activeCruiseLines = CRUISE_LINE_ORDER.filter(cl => shipsByCruiseLine[cl]);
  if (activeCruiseLines.length === 0) return null;

  const multiLine = activeCruiseLines.length > 1;
  let html = `      <section class="card ships-visiting" aria-labelledby="ships-visiting-title">\n`;
  html += `        <h3 id="ships-visiting-title">Ships That Visit Here</h3>\n`;
  html += `        <p class="tiny" style="margin-bottom: 0.75rem; color: var(--ink-mid, #3d5a6a); line-height: 1.5;">Cruise ships with ${escapeHtml(formatPortName(portSlug))} on their itineraries:</p>\n`;

  activeCruiseLines.forEach(cruiseLineId => {
    const lineInfo = CRUISE_LINES[cruiseLineId];
    const classOrder = CLASS_ORDERS[cruiseLineId] || CLASS_ORDERS.rcl;
    const shipsByClass = shipsByCruiseLine[cruiseLineId];

    if (multiLine) {
      html += `        <p class="cruise-line-label" style="color: var(--ink, #1a2a3a);">${escapeHtml(lineInfo.name)}</p>\n`;
    }

    html += `        <div class="ship-links">\n`;

    const sortedClasses = Object.keys(shipsByClass).sort((a, b) => {
      const ai = classOrder.indexOf(a);
      const bi = classOrder.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });

    sortedClasses.forEach(shipClass => {
      shipsByClass[shipClass]
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(ship => {
          html += `          <a href="${lineInfo.path}${ship.slug}.html" class="ship-link-pill" data-line="${cruiseLineId}" title="${escapeHtml(ship.name)} (${escapeHtml(shipClass)} Class)">${escapeHtml(ship.name)}</a>\n`;
        });
    });

    html += `        </div>\n`;
  });

  html += `        <p class="tiny" style="margin-top: 0.75rem; color: var(--ink-light, #6b8a9a);"><a href="/ships.html">Browse all cruise ships &rarr;</a></p>\n`;
  html += `      </section>`;

  return html;
}

function findInsertionPoint(htmlContent) {
  // Insert after the nearby-ports section closing tag
  // Pattern: </section> that follows nearby-ports-title section
  const nearbyMatch = htmlContent.match(/<section[^>]*aria-labelledby="nearby-ports-title"[^>]*>[\s\S]*?<\/section>/);
  if (nearbyMatch) {
    const endPos = nearbyMatch.index + nearbyMatch[0].length;
    return { position: endPos, type: 'after-nearby' };
  }

  // Fallback: insert before recent-rail section
  const recentMatch = htmlContent.match(/<section[^>]*aria-labelledby="recent-rail-title"/);
  if (recentMatch) {
    return { position: recentMatch.index, type: 'before-recent' };
  }

  // Fallback: insert before </aside>
  const asideClose = htmlContent.lastIndexOf('</aside>');
  if (asideClose !== -1) {
    return { position: asideClose, type: 'before-aside-close' };
  }

  // Last resort: insert before </main>
  const mainClose = htmlContent.lastIndexOf('</main>');
  if (mainClose !== -1) {
    return { position: mainClose, type: 'before-main-close' };
  }

  return null;
}

function main() {
  // Load deployment data
  const deployments = JSON.parse(fs.readFileSync(DEPLOYMENTS_PATH, 'utf8'));
  const portToShips = deployments.port_to_ships || {};
  const ships = deployments.ships || {};

  // Get all port HTML files
  const portFiles = fs.readdirSync(PORTS_DIR)
    .filter(f => f.endsWith('.html'))
    .filter(f => f !== 'index.html' && f !== 'tender-ports.html');

  let injected = 0;
  let skippedNoData = 0;
  let skippedAlreadyHas = 0;
  let skippedNoInsertPoint = 0;
  const errors = [];

  portFiles.forEach(file => {
    const portSlug = file.replace('.html', '');
    const filePath = path.join(PORTS_DIR, file);

    try {
      let html = fs.readFileSync(filePath, 'utf8');

      // Skip if already has the section
      if (html.includes('id="ships-visiting-title"')) {
        skippedAlreadyHas++;
        return;
      }

      // Generate the section
      const section = generateShipsSection(portSlug, portToShips, ships);
      if (!section) {
        skippedNoData++;
        return;
      }

      // Find where to insert
      const insertion = findInsertionPoint(html);
      if (!insertion) {
        skippedNoInsertPoint++;
        errors.push(`${file}: no insertion point found`);
        return;
      }

      // Insert the section
      const before = html.slice(0, insertion.position);
      const after = html.slice(insertion.position);
      const newHtml = before + '\n' + section + '\n' + after;

      if (!dryRun) {
        fs.writeFileSync(filePath, newHtml, 'utf8');
      }

      injected++;
      if (dryRun) {
        console.log(`[DRY RUN] Would inject into ${file} (${insertion.type})`);
      }
    } catch (err) {
      errors.push(`${file}: ${err.message}`);
    }
  });

  console.log('\n=== Ships That Visit Here — Injection Report ===');
  console.log(`Total port files: ${portFiles.length}`);
  console.log(`Injected: ${injected}`);
  console.log(`Skipped (already has section): ${skippedAlreadyHas}`);
  console.log(`Skipped (no deployment data): ${skippedNoData}`);
  console.log(`Skipped (no insertion point): ${skippedNoInsertPoint}`);
  if (errors.length > 0) {
    console.log(`\nErrors (${errors.length}):`);
    errors.forEach(e => console.log(`  - ${e}`));
  }
  if (dryRun) {
    console.log('\n[DRY RUN MODE — no files were modified]');
  }
}

main();
