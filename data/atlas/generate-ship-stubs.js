#!/usr/bin/env node
/**
 * Ship Stub Generator
 * Creates directory structure and stub HTML pages for all missing ships
 *
 * Usage: node generate-ship-stubs.js
 */

const fs = require('fs');
const path = require('path');

const MISSING_SHIPS_PATH = path.join(__dirname, 'missing-ship-pages.json');
const ATLAS_PATH = path.join(__dirname, 'ship-size-atlas.json');
const SHIPS_DIR = path.join(__dirname, '../../ships');

// Brand display names and URLs
const BRAND_INFO = {
  'norwegian': {
    displayName: 'Norwegian Cruise Line',
    shortName: 'Norwegian',
    url: 'https://www.ncl.com/',
    folder: 'norwegian',
    lineKey: 'ncl'
  },
  'msc-cruises': {
    displayName: 'MSC Cruises',
    shortName: 'MSC',
    url: 'https://www.msccruises.com/',
    folder: 'msc',
    lineKey: 'msc'
  },
  'princess': {
    displayName: 'Princess Cruises',
    shortName: 'Princess',
    url: 'https://www.princess.com/',
    folder: 'princess',
    lineKey: 'princess'
  },
  'silversea': {
    displayName: 'Silversea Cruises',
    shortName: 'Silversea',
    url: 'https://www.silversea.com/',
    folder: 'silversea',
    lineKey: 'silversea'
  },
  'costa': {
    displayName: 'Costa Cruises',
    shortName: 'Costa',
    url: 'https://www.costacruises.com/',
    folder: 'costa',
    lineKey: 'costa'
  },
  'oceania': {
    displayName: 'Oceania Cruises',
    shortName: 'Oceania',
    url: 'https://www.oceaniacruises.com/',
    folder: 'oceania',
    lineKey: 'oceania'
  },
  'seabourn': {
    displayName: 'Seabourn',
    shortName: 'Seabourn',
    url: 'https://www.seabourn.com/',
    folder: 'seabourn',
    lineKey: 'seabourn'
  },
  'regent': {
    displayName: 'Regent Seven Seas Cruises',
    shortName: 'Regent',
    url: 'https://www.rssc.com/',
    folder: 'regent',
    lineKey: 'regent'
  },
  'explora-journeys': {
    displayName: 'Explora Journeys',
    shortName: 'Explora',
    url: 'https://www.explorajourneys.com/',
    folder: 'explora-journeys',
    lineKey: 'explora'
  },
  'cunard': {
    displayName: 'Cunard',
    shortName: 'Cunard',
    url: 'https://www.cunard.com/',
    folder: 'cunard',
    lineKey: 'cunard'
  },
  'holland-america': {
    displayName: 'Holland America Line',
    shortName: 'Holland America',
    url: 'https://www.hollandamerica.com/',
    folder: 'holland-america-line',
    lineKey: 'hal'
  },
  'carnival': {
    displayName: 'Carnival Cruise Line',
    shortName: 'Carnival',
    url: 'https://www.carnival.com/',
    folder: 'carnival',
    lineKey: 'carnival'
  }
};

// Load ship data from atlas
function loadAtlasData() {
  const atlas = JSON.parse(fs.readFileSync(ATLAS_PATH, 'utf8'));
  const shipMap = {};
  for (const ship of atlas.ships) {
    shipMap[ship.ship_id] = ship;
  }
  return shipMap;
}

// Generate stub HTML for a ship
function generateStubHTML(ship, brandInfo, atlasData) {
  const shipName = ship.name;
  const shipSlug = ship.expected_filename.replace('.html', '');
  const brand = brandInfo;
  const atlas = atlasData[ship.id] || {};

  const gt = atlas.gt ? atlas.gt.toLocaleString() : 'TBD';
  const pax = atlas.pax_double ? atlas.pax_double.toLocaleString() : 'TBD';
  const year = atlas.year_built || 'TBD';
  const shipClass = atlas.class || 'TBD';
  const lengthM = atlas.length_m || 'TBD';
  const crew = atlas.crew ? atlas.crew.toLocaleString() : 'TBD';

  return `<!doctype html>
<!--
Soli Deo Gloria
All work on this project is offered as a gift to God.
"Trust in the LORD with all your heart..." — Proverbs 3:5
"Whatever you do, work heartily..." — Colossians 3:23
-->

<html lang="en">
<head>
<!-- ai-breadcrumbs
     entity: ${shipName}
     type: Ship Information Page
     parent: /ships.html
     category: ${brand.displayName} Fleet
     cruise-line: ${brand.displayName}
     updated: 2026-01-02
     expertise: ${brand.shortName} ship reviews, deck plans, dining analysis, cabin comparisons
     target-audience: ${shipName} cruisers, ship comparison researchers, first-time cruisers
     answer-first: Discover ${shipName}: ${shipClass} ship from ${brand.displayName} — dining highlights, crew warmth, live tracking, and planning tips inside.
     -->
  <!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-WZP891PZXJ"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-WZP891PZXJ');
</script>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>

  <!-- ===== SEO Meta ===== -->
  <title>${shipName} — ${brand.displayName} Ship Guide | In the Wake</title>
  <link rel="canonical" href="https://cruisinginthewake.com/ships/${brand.folder}/${shipSlug}.html"/>
  <meta name="description" content="Discover ${shipName}: A ${shipClass} ship from ${brand.displayName}. ${gt} GT, ${pax} guests, built ${year}. Dining, entertainment, deck plans, and planning tips."/>
  <meta name="ai-summary" content="Discover ${shipName}: A ${shipClass} ship from ${brand.displayName}. ${gt} GT, ${pax} guests, built ${year}. Dining, entertainment, deck plans, and planning tips.">
  <meta name="last-reviewed" content="2026-01-02">
  <meta name="content-protocol" content="ICP-Lite v1.4">

  <!-- OpenGraph / Twitter -->
  <meta property="og:type" content="website"/>
  <meta property="og:site_name" content="In the Wake"/>
  <meta property="og:url" content="https://cruisinginthewake.com/ships/${brand.folder}/${shipSlug}.html"/>
  <meta property="og:title" content="${shipName} — ${brand.displayName} Ship Guide"/>
  <meta property="og:description" content="Explore ${shipName}: ${shipClass} ship with ${pax} guests. Dining, entertainment, and planning resources."/>
  <meta name="twitter:card" content="summary_large_image"/>

  <!-- JSON-LD (CruiseShip schema) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CruiseShip",
    "name": "${shipName}",
    "url": "https://cruisinginthewake.com/ships/${brand.folder}/${shipSlug}.html",
    "brand": {
      "@type": "Organization",
      "name": "${brand.displayName}",
      "url": "${brand.url}"
    },
    "description": "${shipName} is a ${shipClass} cruise ship from ${brand.displayName}, accommodating ${pax} guests."
  }
  </script>

  <!-- JSON-LD: WebPage (ICP-Lite) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "${shipName}",
    "url": "https://cruisinginthewake.com/ships/${brand.folder}/${shipSlug}.html",
    "description": "Discover ${shipName}: A ${shipClass} ship from ${brand.displayName}. ${gt} GT, ${pax} guests, built ${year}."
  }
  </script>

  <!-- Service Worker Registration -->
  <script>
  if('serviceWorker' in navigator){
    window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
  }
  </script>

  <link rel="stylesheet" href="/assets/styles.css"/>
  <link rel="stylesheet" href="https://unpkg.com/swiper@10/swiper-bundle.min.css"/>

  <style>
    .stub-notice {
      background: linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%);
      border: 2px dashed #856404;
      border-radius: 8px;
      padding: 1.5rem;
      margin: 1rem 0;
      text-align: center;
    }
    .stub-notice h3 { color: #856404; margin: 0 0 .5rem; }
    .stub-notice p { color: #664d03; margin: 0; }
    .ship-specs { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin: 1.5rem 0; }
    .spec-item { background: var(--bg-alt, #f5f5f5); padding: 1rem; border-radius: 6px; text-align: center; }
    .spec-label { font-size: .75rem; color: var(--text-muted); text-transform: uppercase; }
    .spec-value { font-size: 1.25rem; font-weight: 600; color: var(--text); }
    .quick-answer { background: #e8f4f8; border-left: 4px solid #17a2b8; padding: 1rem 1.5rem; margin: 1rem 0; border-radius: 0 8px 8px 0; }
    .quick-answer h3 { margin: 0 0 .5rem; color: #0c5460; }
  </style>
</head>
<body class="page">
  <header class="hero-header">
    <div class="navbar">
      <div class="brand">
        <a href="/"><img src="/assets/logo_wake_256.png" srcset="/assets/logo_wake_256.png 1x, /assets/logo_wake_512.png 2x" width="256" height="259" alt="In the Wake" decoding="async"/></a>
        <span class="tiny version-badge">V1.Beta</span>
      </div>
      <button class="nav-toggle" type="button" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="site-nav">
        <span class="nav-toggle-icon"><span></span><span></span><span></span></span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="Main site navigation">
        <a class="nav-pill" href="/">Home</a>
        <div class="nav-dropdown" id="nav-planning">
          <button class="nav-pill" type="button" aria-expanded="false" aria-haspopup="true">
            Planning <span class="caret">&#9662;</span>
          </button>
          <div class="dropdown-menu" role="menu">
            <a href="/planning.html">Planning (overview)</a>
            <a href="/ships.html">Ships</a>
            <a href="/tools/ship-size-atlas.html">Ship Size Atlas</a>
            <a href="/restaurants.html">Restaurants &amp; Menus</a>
            <a href="/ports.html">Ports</a>
            <a href="/drink-packages.html">Drink Packages</a>
            <a href="/drink-calculator.html">Drink Calculator</a>
            <a href="/stateroom-check.html">Stateroom Check</a>
            <a href="/cruise-lines.html">Cruise Lines</a>
            <a href="/packing-lists.html">Packing Lists</a>
            <a href="/accessibility.html">Accessibility</a>
          </div>
        </div>
        <div class="nav-dropdown" id="nav-travel">
          <button class="nav-pill" type="button" aria-expanded="false" aria-haspopup="true">
            Travel <span class="caret">&#9662;</span>
          </button>
          <div class="dropdown-menu" role="menu">
            <a href="/travel.html">Travel (overview)</a>
            <a href="/solo.html">Solo</a>
          </div>
        </div>
        <a class="nav-pill" href="/tools/port-tracker.html">Port Logbook</a>
        <a class="nav-pill" href="/tools/ship-tracker.html">Ship Logbook</a>
        <a class="nav-pill" href="/search.html">Search</a>
        <a class="nav-pill" href="/about-us.html">About</a>
      </nav>
    </div>

    <div class="hero" role="img" aria-label="${shipName} hero image">
      <div class="latlon-grid" aria-hidden="true">
        <svg viewBox="0 0 100 60" preserveAspectRatio="none">
          <g class="grid-lines" stroke-width="0.35">
            <line x1="10" y1="0" x2="10" y2="60"/><line x1="30" y1="0" x2="30" y2="60"/>
            <line x1="50" y1="0" x2="50" y2="60"/><line x1="70" y1="0" x2="70" y2="60"/>
            <line x1="90" y1="0" x2="90" y2="60"/><line x1="0" y1="15" x2="100" y2="15"/>
            <line x1="0" y1="30" x2="100" y2="30"/><line x1="0" y1="45" x2="100" y2="45"/>
          </g>
        </svg>
      </div>
      <img class="hero-compass" src="/assets/compass_rose.svg" alt="" aria-hidden="true" decoding="async"/>
      <div class="hero-title">
        <img class="logo" src="/assets/logo_wake_560.png" srcset="/assets/logo_wake_560.png 1x, /assets/logo_wake_1120.png 2x" alt="In the Wake" decoding="async" fetchpriority="high" width="560" height="567"/>
      </div>
      <div class="tagline" aria-hidden="true">A Cruise Traveler's Logbook</div>
    </div>
  </header>

  <main class="wrap" id="content">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="/">Home</a> &rsaquo;
      <a href="/ships.html">Ships</a> &rsaquo;
      <a href="/cruise-lines/${brand.lineKey}.html">${brand.displayName}</a> &rsaquo;
      <span aria-current="page">${shipName}</span>
    </nav>

    <h1>${shipName}</h1>
    <p class="subtitle">${brand.displayName} &bull; ${shipClass}</p>

    <!-- ICP-Lite Quick Answer -->
    <div class="quick-answer" role="region" aria-label="Quick answer">
      <h3>At a Glance</h3>
      <p><strong>${shipName}</strong> is a <strong>${shipClass}</strong> ship from ${brand.displayName}.
      With <strong>${gt} gross tons</strong> and capacity for <strong>${pax} guests</strong>,
      she entered service in <strong>${year}</strong>.</p>
    </div>

    <!-- Ship Specifications -->
    <section class="card" aria-labelledby="specsHeading">
      <h2 id="specsHeading">${shipName} Specifications</h2>
      <div class="ship-specs">
        <div class="spec-item">
          <div class="spec-label">Gross Tonnage</div>
          <div class="spec-value">${gt}</div>
        </div>
        <div class="spec-item">
          <div class="spec-label">Guests</div>
          <div class="spec-value">${pax}</div>
        </div>
        <div class="spec-item">
          <div class="spec-label">Year Built</div>
          <div class="spec-value">${year}</div>
        </div>
        <div class="spec-item">
          <div class="spec-label">Class</div>
          <div class="spec-value">${shipClass}</div>
        </div>
        <div class="spec-item">
          <div class="spec-label">Length</div>
          <div class="spec-value">${lengthM}m</div>
        </div>
        <div class="spec-item">
          <div class="spec-label">Crew</div>
          <div class="spec-value">${crew}</div>
        </div>
      </div>
    </section>

    <!-- Stub Notice -->
    <div class="stub-notice" role="alert">
      <h3>Page Under Construction</h3>
      <p>We're working on adding detailed content for ${shipName}. Check back soon for dining venues, deck plans, personal reviews, and more!</p>
      <p style="margin-top: 1rem;"><a href="/tools/ship-size-atlas.html" class="btn">Compare Ships in the Atlas</a></p>
    </div>

    <!-- Placeholder sections -->
    <section class="card" aria-labelledby="diningHeading">
      <h2 id="diningHeading">Dining on ${shipName}</h2>
      <p>Dining venue information coming soon. ${brand.displayName} ships typically feature a variety of complimentary and specialty dining options.</p>
    </section>

    <section class="card" aria-labelledby="entertainmentHeading">
      <h2 id="entertainmentHeading">Entertainment &amp; Activities</h2>
      <p>Entertainment details coming soon. Explore shows, activities, and onboard experiences.</p>
    </section>

    <section class="grid-2">
      <section class="card" aria-labelledby="deckPlansHeading">
        <h2 id="deckPlansHeading">Deck Plans</h2>
        <p>View the official deck plans to explore ${shipName}'s layout.</p>
        <p><a class="btn" href="${brand.url}" target="_blank" rel="noopener">Visit ${brand.shortName} Official Site</a></p>
      </section>
      <section class="card" aria-labelledby="trackingHeading">
        <h2 id="trackingHeading">Where Is ${shipName}?</h2>
        <p>Track ${shipName}'s current position and upcoming itinerary.</p>
        <p><a class="btn" href="https://www.cruisemapper.com/?search=${encodeURIComponent(shipName)}" target="_blank" rel="noopener">Open Live Tracker</a></p>
      </section>
    </section>

    <!-- Related Links -->
    <section class="card">
      <h2>Explore More</h2>
      <ul>
        <li><a href="/ships.html">All Ships</a></li>
        <li><a href="/tools/ship-size-atlas.html">Ship Size Atlas</a> — Compare ${shipName} with other ships</li>
        <li><a href="/cruise-lines.html">All Cruise Lines</a></li>
      </ul>
    </section>
  </main>

  <footer class="wrap" role="contentinfo">
    <p>&copy; 2025 In the Wake &middot; A Cruise Traveler's Logbook &middot; All rights reserved.</p>
    <p class="tiny">
      <a href="/privacy.html">Privacy</a> &middot;
      <a href="/terms.html">Terms</a> &middot;
      <a href="/about-us.html">About</a> &middot;
      <a href="/accessibility.html">Accessibility &amp; WCAG 2.1 AA Commitment</a>
    </p>
    <p class="tiny center" style="opacity:0;position:absolute;pointer-events:none;" aria-hidden="true">Soli Deo Gloria</p>
    <p class="trust-badge">No ads. No tracking. Independent of cruise lines.</p>
  </footer>

  <script src="/assets/js/dropdown.js"></script>
  <script src="/assets/js/in-app-browser-escape.js"></script>
</body>
</html>
`;
}

// Create index page for a brand folder
function generateIndexHTML(brand, ships) {
  const brandInfo = BRAND_INFO[brand];
  const shipList = ships.map(s =>
    `<li><a href="${s.expected_filename}">${s.name}</a></li>`
  ).join('\n            ');

  return `<!doctype html>
<!--
Soli Deo Gloria
-->
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${brandInfo.displayName} Ships | In the Wake</title>
  <link rel="canonical" href="https://cruisinginthewake.com/ships/${brandInfo.folder}/"/>
  <meta name="description" content="Explore all ${brandInfo.displayName} ships. Detailed guides, specifications, and reviews."/>
  <meta name="ai-summary" content="Complete guide to ${brandInfo.displayName} ships including specifications, reviews, and comparisons.">
  <meta name="last-reviewed" content="2026-01-02">
  <meta name="content-protocol" content="ICP-Lite v1.4">
  <link rel="stylesheet" href="/assets/styles.css"/>
  <style>
    .ship-list { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
    .ship-list li a { display: block; padding: 1rem; background: var(--bg-alt, #f5f5f5); border-radius: 6px; text-decoration: none; transition: background .2s; }
    .ship-list li a:hover { background: var(--bg-hover, #e0e0e0); }
  </style>
</head>
<body class="page">
  <header class="hero-header">
    <div class="navbar">
      <div class="brand">
        <a href="/"><img src="/assets/logo_wake_256.png" alt="In the Wake" width="256" height="259"/></a>
      </div>
      <nav class="site-nav" id="site-nav">
        <a class="nav-pill" href="/">Home</a>
        <a class="nav-pill" href="/ships.html">Ships</a>
        <a class="nav-pill" href="/ports.html">Ports</a>
        <a class="nav-pill" href="/search.html">Search</a>
      </nav>
    </div>
  </header>

  <main class="wrap" id="content">
    <nav class="breadcrumb">
      <a href="/">Home</a> &rsaquo;
      <a href="/ships.html">Ships</a> &rsaquo;
      <span>${brandInfo.displayName}</span>
    </nav>

    <h1>${brandInfo.displayName} Ships</h1>
    <p>Explore our guides to ${brandInfo.displayName} cruise ships.</p>

    <section class="card">
      <h2>Fleet</h2>
      <ul class="ship-list">
            ${shipList}
      </ul>
    </section>

    <p><a href="/ships.html" class="btn">View All Ships</a> | <a href="/tools/ship-size-atlas.html" class="btn">Ship Size Atlas</a></p>
  </main>

  <footer class="wrap">
    <p>&copy; 2025 In the Wake &middot; A Cruise Traveler's Logbook</p>
    <p class="tiny"><a href="/privacy.html">Privacy</a> &middot; <a href="/terms.html">Terms</a></p>
  </footer>
  <script src="/assets/js/dropdown.js"></script>
</body>
</html>
`;
}

// Main function
function main() {
  console.log('Ship Stub Generator\n' + '='.repeat(50));

  // Load data
  const missingShips = JSON.parse(fs.readFileSync(MISSING_SHIPS_PATH, 'utf8'));
  const atlasData = loadAtlasData();

  let dirsCreated = 0;
  let filesCreated = 0;
  let indexesCreated = 0;

  // Process each brand
  for (const [brand, ships] of Object.entries(missingShips)) {
    const brandInfo = BRAND_INFO[brand];
    if (!brandInfo) {
      console.warn(`Unknown brand: ${brand}, skipping...`);
      continue;
    }

    const brandDir = path.join(SHIPS_DIR, brandInfo.folder);

    // Create directory if needed
    if (!fs.existsSync(brandDir)) {
      fs.mkdirSync(brandDir, { recursive: true });
      dirsCreated++;
      console.log(`Created directory: ships/${brandInfo.folder}/`);
    }

    // Create index.html for new folders
    const indexPath = path.join(brandDir, 'index.html');
    if (!fs.existsSync(indexPath)) {
      fs.writeFileSync(indexPath, generateIndexHTML(brand, ships));
      indexesCreated++;
      console.log(`Created: ships/${brandInfo.folder}/index.html`);
    }

    // Generate stub for each ship
    for (const ship of ships) {
      const filePath = path.join(brandDir, ship.expected_filename);

      // Skip if file exists
      if (fs.existsSync(filePath)) {
        console.log(`Skipped (exists): ships/${brandInfo.folder}/${ship.expected_filename}`);
        continue;
      }

      const html = generateStubHTML(ship, brandInfo, atlasData);
      fs.writeFileSync(filePath, html);
      filesCreated++;
    }

    console.log(`  ${brand}: ${ships.length} ships processed`);
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Summary:`);
  console.log(`  Directories created: ${dirsCreated}`);
  console.log(`  Index pages created: ${indexesCreated}`);
  console.log(`  Ship stubs created: ${filesCreated}`);
  console.log('\nDone!');
}

main();
