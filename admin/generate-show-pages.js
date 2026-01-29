#!/usr/bin/env node
/**
 * generate-show-pages.js
 * Generates HTML pages for all Royal Caribbean shows/productions
 * using data from assets/data/shows.json and assets/data/venues-v2.json.
 *
 * Usage: node admin/generate-show-pages.js [--dry-run] [--slug=<slug>]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const showsPath = path.join(__dirname, '..', 'assets', 'data', 'shows.json');
const venuesPath = path.join(__dirname, '..', 'assets', 'data', 'venues-v2.json');
const outDir = path.join(__dirname, '..', 'restaurants');

const showsData = JSON.parse(fs.readFileSync(showsPath, 'utf8'));
const venuesData = JSON.parse(fs.readFileSync(venuesPath, 'utf8'));

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const singleSlug = (args.find(a => a.startsWith('--slug=')) || '').replace('--slug=', '');

// Ship metadata lookup
const SHIPS = {};
for (const [slug, info] of Object.entries(venuesData.ships)) {
  SHIPS[slug] = { slug, name: info.name, class: info.class };
}

// Show type display names
const TYPE_LABELS = {
  'broadway-musical': 'Broadway Musical',
  'original-production': 'Original Production',
  'aquatheater-show': 'AquaTheater Show',
  'ice-show': 'Ice Show',
  'two70-show': 'Two70 Production',
};

// Best-for text by type
const BEST_FOR = {
  'broadway-musical': 'Broadway fans, theater lovers, families, date nights at sea, anyone who enjoys live musicals',
  'original-production': 'Entertainment seekers, families, anyone looking for unique cruise experiences',
  'aquatheater-show': 'Thrill seekers, families, fans of acrobatics and diving, outdoor entertainment lovers',
  'ice-show': 'Families, figure skating fans, anyone who appreciates artistic performance on ice',
  'two70-show': 'Technology enthusiasts, fans of immersive entertainment, anyone seeking cutting-edge shows',
};

// Show-specific FAQ answers
function generateFAQ(show) {
  const typeLabel = TYPE_LABELS[show.type] || 'Production Show';
  const venue = show.venue;
  const shipNames = show.ships.map(s => SHIPS[s]?.name || s).join(', ');
  const isOutdoor = show.type === 'aquatheater-show';
  const reservationNote = show.type === 'broadway-musical'
    ? 'Reservations are strongly recommended for Broadway musicals — book through the Royal Caribbean app or Cruise Planner before sailing.'
    : 'No reservations required. Seating is open and first-come, first-served. Arrive early for the best seats.';

  return [
    {
      q: `Is ${show.name} free?`,
      a: `Yes, ${show.name} is complimentary and included in your cruise fare. No additional charge.`,
    },
    {
      q: `Do I need reservations for ${show.name}?`,
      a: reservationNote,
    },
    {
      q: `Which ships have ${show.name}?`,
      a: `${show.name} is currently available on: ${shipNames}. Show lineups can change, so verify with Royal Caribbean before sailing.`,
    },
    {
      q: `How long is ${show.name}?`,
      a: `${show.name} runs approximately ${show.duration}. ${show.type === 'broadway-musical' ? 'There is no intermission in the at-sea version.' : ''}`.trim(),
    },
    {
      q: `Is ${show.name} appropriate for children?`,
      a: show.type === 'broadway-musical'
        ? `${show.name} is family-friendly, though younger children (under 5) may have difficulty sitting through the full performance.`
        : show.type === 'aquatheater-show'
          ? `Yes, AquaTheater shows are enjoyed by all ages. Younger children especially love the diving and splash effects.`
          : `Yes, ${show.name} is suitable for all ages. Younger children may enjoy the visual spectacle even if they don\'t follow the storyline.`,
    },
    {
      q: isOutdoor ? `What happens if it rains?` : `Where should I sit for the best view?`,
      a: isOutdoor
        ? `AquaTheater shows may be cancelled or modified due to weather or rough seas. Check the daily Cruise Compass for updates.`
        : `Center seats in the middle rows offer the best sightlines. The balcony level provides a good overview of choreography and staging. Arrive 15-20 minutes early.`,
    },
  ];
}

// Generate ship availability rows grouped by class
function generateAvailabilityRows(show) {
  const byClass = {};
  for (const shipSlug of show.ships) {
    const ship = SHIPS[shipSlug];
    if (!ship) continue;
    if (!byClass[ship.class]) byClass[ship.class] = [];
    byClass[ship.class].push(ship);
  }

  return Object.entries(byClass).map(([cls, ships]) => {
    const shipLinks = ships.map(s =>
      `<a href="/ships/rcl/${s.slug}.html">${s.name}</a>`
    ).join(', ');
    return `        <tr><td>${cls}</td><td>${shipLinks}</td><td>${show.venue}</td></tr>`;
  }).join('\n');
}

// Escape for HTML attributes
function escAttr(s) { return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
function escHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function generatePage(show) {
  const typeLabel = TYPE_LABELS[show.type] || 'Production Show';
  const shipNames = show.ships.map(s => SHIPS[s]?.name || s).join(', ');
  const url = `https://cruisinginthewake.com/restaurants/${show.slug}.html`;
  const title = `${show.name} — Royal Caribbean | In the Wake`;
  const metaDesc = `${show.name} is a ${typeLabel.toLowerCase()} on Royal Caribbean's ${shipNames}. ${show.description.split('.')[0]}.`;
  const shortDesc = metaDesc.length > 160 ? metaDesc.substring(0, 157) + '...' : metaDesc;
  const bestFor = BEST_FOR[show.type] || 'Entertainment seekers, families, cruise enthusiasts';
  const faq = generateFAQ(show);
  const availRows = generateAvailabilityRows(show);
  const highlightsList = show.highlights.map(h => `          <li>${escHtml(h)}</li>`).join('\n');
  const isOutdoor = show.type === 'aquatheater-show';
  const dateStr = new Date().toISOString().split('T')[0];

  const faqDetailsHtml = faq.map(f =>
    `    <details><summary>${escHtml(f.q)}</summary><p>${escHtml(f.a)}</p></details>`
  ).join('\n');

  const faqJsonLd = faq.map(f => `{"@type":"Question","name":${JSON.stringify(f.q)},"acceptedAnswer":{"@type":"Answer","text":${JSON.stringify(f.a)}}}`).join(',');

  return `<!doctype html>
<!--
Soli Deo Gloria
All work on this project is offered as a gift to God.
"Trust in the LORD with all your heart..." — Proverbs 3:5
"Whatever you do, work heartily..." — Colossians 3:23
-->

<html lang="en" class="no-js">
<head>
<script>(function(){document.documentElement.classList.remove('no-js')})();</script>
<!-- ai-breadcrumbs
     entity: ${show.name}
     type: Show
     parent: /restaurants.html
     category: Entertainment - ${typeLabel}
     cruise-line: Royal Caribbean
     ship-class: Multiple Classes
     updated: ${dateStr}
     expertise: Royal Caribbean entertainment, ${typeLabel.toLowerCase()}, cruise ship shows
     target-audience: Show enthusiasts, cruise entertainment seekers, families
     answer-first: ${show.name} is a ${typeLabel.toLowerCase()} performing in the ${show.venue} on ${shipNames}. ${show.description.split('.')[0]}.
     --><!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-WZP891PZXJ"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-WZP891PZXJ');
</script>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escHtml(title)}</title>

  <meta name="description" content="${escAttr(shortDesc)}">
  <meta property="og:site_name" content="In the Wake">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escAttr(show.name)} — Royal Caribbean">
  <meta property="og:url" content="${url}">
  <meta property="og:description" content="${escAttr(shortDesc)}"/>
  <meta property="og:image" content="https://cruisinginthewake.com/assets/social/dining-hero.jpg"/>
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:description" content="${escAttr(shortDesc)}"/>
  <meta name="twitter:title" content="${escAttr(show.name)} — Royal Caribbean"/>
  <meta name="twitter:image" content="https://cruisinginthewake.com/assets/social/dining-hero.jpg"/>
  <link rel="canonical" href="${url}">
  <meta name="referrer" content="no-referrer">
  <meta name="ai-summary" content="${escAttr(`${show.name} is a ${typeLabel.toLowerCase()} on Royal Caribbean. ${show.description.split('.')[0]}. Performs in the ${show.venue}. ${show.cost}.`)}">
  <meta name="last-reviewed" content="${dateStr}">
  <meta name="content-protocol" content="ICP-Lite v1.4">
  <script>
  if('serviceWorker' in navigator){
    window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
  }
  </script>

  <link rel="stylesheet" href="https://cruisinginthewake.com/assets/styles.css?v=2.257">
  <script defer src="https://cloud.umami.is/script.js" data-website-id="9661a449-3ba9-49ea-88e8-4493363578d2"></script>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "${escAttr(title)}",
    "description": "${escAttr(shortDesc)}",
    "url": "${url}",
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://cruisinginthewake.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Restaurants",
          "item": "https://cruisinginthewake.com/restaurants.html"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "${escAttr(show.name)}",
          "item": "${url}"
        }
      ]
    },
    "author": {
      "@type": "Person",
      "name": "Ken Baker"
    },
    "dateModified": "${dateStr}",
    "mainEntity": {
      "@type": "Event",
      "name": "${escAttr(show.name)}",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "location": {
        "@type": "Place",
        "name": "${escAttr(show.venue)}",
        "address": "Royal Caribbean Cruise Ship"
      },
      "organizer": {
        "@type": "Organization",
        "name": "Royal Caribbean International"
      },
      "description": "${escAttr(show.description)}"
    }
  }
  </script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[${faqJsonLd}]}
</script>

  <link rel="preload" as="image" href="/assets/logo_wake_560.png" fetchpriority="high"/>
  <link rel="preload" as="image" href="/assets/compass_rose.svg?v=3.010.300" fetchpriority="high"/>
</head>

<body class="venue-page">
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <div id="a11y-status" role="status" aria-live="polite" aria-atomic="true" class="sr-only"></div>
  <div id="a11y-alerts" role="alert" aria-live="assertive" aria-atomic="true" class="sr-only"></div>

<header class="hero-header" role="banner">
  <div class="navbar">
    <div class="brand">
      <img src="/assets/logo_wake_256.png" srcset="/assets/logo_wake_256.png 1x, /assets/logo_wake_512.png 2x" width="256" height="259" alt="In the Wake wordmark" decoding="async"/>
      <span class="tiny version-badge" aria-label="Site version V1.Beta">V1.Beta</span>
    </div>
    <button class="nav-toggle" type="button" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="site-nav">
      <span class="nav-toggle-icon"><span></span><span></span><span></span></span>
    </button>
    <nav class="site-nav" id="site-nav" aria-label="Main site navigation">
      <a class="nav-pill" href="/">Home</a>
      <div class="nav-dropdown" id="nav-planning">
        <button class="nav-pill" type="button" aria-expanded="false" aria-haspopup="true">Planning <span class="caret">&#9662;</span></button>
        <div class="dropdown-menu" role="menu">
          <a href="/planning.html">Planning (overview)</a><a href="/ships.html">Ships</a><a href="/restaurants.html">Restaurants &amp; Menus</a><a href="/ports.html">Ports</a><a href="/drink-packages.html">Drink Packages</a><a href="/drink-calculator.html">Drink Calculator</a><a href="/stateroom-check.html">Stateroom Check</a><a href="/cruise-lines.html">Cruise Lines</a><a href="/packing-lists.html">Packing Lists</a><a href="/accessibility.html">Accessibility</a>
        </div>
      </div>
      <div class="nav-dropdown" id="nav-travel">
        <button class="nav-pill" type="button" aria-expanded="false" aria-haspopup="true">Travel <span class="caret">&#9662;</span></button>
        <div class="dropdown-menu" role="menu"><a href="/travel.html">Travel (overview)</a><a href="/solo.html">Solo</a></div>
      </div>
      <a class="nav-pill" href="/tools/port-tracker.html">Port Logbook</a><a class="nav-pill" href="/tools/ship-tracker.html">Ship Logbook</a><a class="nav-pill" href="/search.html">Search</a><a class="nav-pill" href="/about-us.html">About</a>
    </nav>
  </div>
  <div class="hero" role="img" aria-label="Ship wake at sunrise">
    <div class="latlon-grid" aria-hidden="true"></div>
    <img class="hero-compass" src="/assets/compass_rose.svg?v=3.010.300" width="180" height="180" alt="" aria-hidden="true" decoding="async"/>
    <div class="hero-title"><img class="logo" src="/assets/logo_wake_560.png" srcset="/assets/logo_wake_560.png 1x, /assets/logo_wake_1120.png 2x" alt="In the Wake" decoding="async" fetchpriority="high" width="560" height="567"/></div>
    <div class="tagline" aria-hidden="true">A Cruise Traveler's Logbook</div>
    <div class="hero-credit"><a class="pill" href="https://www.flickersofmajesty.com" target="_blank" rel="noopener">Photo &copy; Flickers of Majesty</a></div>
  </div>
</header>

<main class="wrap page-grid" id="main-content">
  <div>
  <section class="card" id="overview">
    <h1 class="page-title">${escHtml(show.name)}</h1>
    <p class="subtitle">Royal Caribbean — ${typeLabel}</p>

    <p class="answer-line"><strong>Quick Answer:</strong> ${escHtml(show.description)}</p>

    <p class="fit-guidance"><strong>Best For:</strong> ${escHtml(bestFor)}.</p>

    <div class="key-facts">
      <h3>Key Facts</h3>
      <ul>
        <li><strong>Type:</strong> ${typeLabel}</li>
        <li><strong>Venue:</strong> ${escHtml(show.venue)}</li>
        <li><strong>Cost:</strong> ${escHtml(show.cost)}</li>
        <li><strong>Duration:</strong> Approximately ${escHtml(show.duration)}</li>
        <li><strong>Ships:</strong> ${escHtml(shipNames)}</li>
        <li><strong>Premiered:</strong> ${escHtml(show.premiered)}</li>
      </ul>
    </div>

    <p class="lede">${escHtml(show.description.split('.')[0])}.</p>
    <p class="blurb">${escHtml(show.description)} <a href="/restaurants.html">Return to the Restaurants hub &rarr;</a></p>
    <p class="pill version" style="float:right;margin-top:.5rem;">v2.257.001</p>
  </section>

  <section class="card" id="menu-prices">
    <h2>Show Details</h2>
    <p class="price-note"><strong>Cost:</strong> ${escHtml(show.cost)}</p>

    <div class="grid grid-3">
      <div>
        <h3>Highlights</h3>
        <ul>
${highlightsList}
        </ul>
      </div>
      <div>
        <h3>Show Times</h3>
        <ul>
          <li>Multiple performances per cruise</li>
          <li>${show.type === 'broadway-musical' ? 'Early and late evening shows available' : show.type === 'aquatheater-show' ? 'Usually one evening performance (weather permitting)' : 'Check Cruise Compass for schedule'}</li>
          <li>Duration: ~${escHtml(show.duration)}</li>
          <li>${show.type === 'broadway-musical' ? 'Reserve via Royal Caribbean app' : 'No reservations needed'}</li>
        </ul>
      </div>
      <div>
        <h3>Venue</h3>
        <ul>
          <li>${escHtml(show.venue)}</li>
          <li>${isOutdoor ? 'Open-air amphitheater at ship stern' : 'Indoor theater with stadium seating'}</li>
          <li>${isOutdoor ? 'Splash zone in front rows' : 'Excellent sightlines from all levels'}</li>
          <li>${isOutdoor ? 'Weather dependent' : 'Air conditioned'}</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="card" id="accommodations">
    <h2>Accommodations</h2>
    <p class="allergen-micro"><strong>Note:</strong> ${isOutdoor ? 'Front rows may get wet from splash effects. Dress accordingly.' : 'Drinks may be purchased in the theater. Flash photography is prohibited during performances.'}</p>

    <ul>
      <li>Wheelchair accessible seating available</li>
      <li>Assisted listening devices available at Guest Services</li>
      ${show.type === 'broadway-musical' ? '<li>Reservations recommended — book via app or Cruise Planner</li>' : '<li>Open seating — arrive early for best spots</li>'}
      <li>${isOutdoor ? 'Outdoor venue — dress for weather' : 'Air conditioned theater'}</li>
      <li>${isOutdoor ? 'Show may be cancelled in rough seas or rain' : 'No outside food or drink'}</li>
    </ul>
  </section>

  <section class="card" id="availability">
    <h2>Where You&rsquo;ll Find It</h2>
    <table class="ship-avail">
      <thead><tr><th>Ship Class</th><th>Ships</th><th>Venue</th></tr></thead>
      <tbody>
${availRows}
      </tbody>
    </table>
    <p class="note">${escHtml(show.name)} availability is based on current fleet data. Royal Caribbean periodically updates show lineups — verify before sailing.</p>
  </section>

  <section class="card" id="logbook">
    <h2>Traveler's Logbook</h2>
    <p><strong>What to Know:</strong> ${escHtml(show.description)}</p>

    <p><strong>Pro Tips:</strong></p>
    <ul>
      ${show.type === 'broadway-musical'
        ? `<li>Book your reservation early — Broadway shows fill up fast</li>
      <li>The late show often has better availability</li>
      <li>Center orchestra seats offer the best experience</li>
      <li>No intermission — visit restrooms beforehand</li>`
        : show.type === 'aquatheater-show'
          ? `<li>Arrive early for front-row splash zone seats</li>
      <li>Back rows stay dry with full view of aerial acts</li>
      <li>Check daily Cruise Compass — weather can cancel shows</li>
      <li>Bring a light jacket for evening performances</li>`
          : show.type === 'ice-show'
            ? `<li>Arrive 15 minutes early for center seats</li>
      <li>The rink-side rows offer the most immersive experience</li>
      <li>It gets cold near the ice — bring a layer</li>
      <li>No flash photography during performances</li>`
            : show.type === 'two70-show'
              ? `<li>Arrive early — Two70 fills up quickly</li>
      <li>Center seats offer the best view of the Roboscreens</li>
      <li>The technology is genuinely impressive — worth seeing</li>
      <li>Check the app for showtime updates</li>`
              : `<li>Arrive 15-20 minutes early for center seats</li>
      <li>Balcony level offers great views of choreography</li>
      <li>Later shows tend to be less crowded</li>
      <li>No flash photography during performances</li>`
      }
    </ul>
  </section>

  <section class="card" id="faq">
    <h2>Frequently Asked Questions</h2>
${faqDetailsHtml}
  </section>

  <section class="card" id="sources">
    <h2>Sources</h2>
    <ul>
      <li><a href="https://www.royalcaribbean.com/experience/cruise-shows-and-entertainment" target="_blank" rel="noopener">Royal Caribbean — Cruise Shows &amp; Entertainment</a></li>
      <li><a href="https://www.royalcaribbeanblog.com/2024/09/02/royal-caribbean-shows-ship" target="_blank" rel="noopener">Royal Caribbean Blog — Shows by Ship</a></li>
      <li><a href="https://www.cruisecritic.com/articles/which-shows-are-on-which-royal-caribbean-cruise-ships" target="_blank" rel="noopener">Cruise Critic — Shows on Royal Caribbean Ships</a></li>
      <li>Guest reviews from multiple sailings</li>
    </ul>
  </section>
  </div>

  <aside class="rail">
    <div class="author-card">
      <img src="/assets/capn-ken.png" alt="Cap'n Ken" loading="lazy" width="80" height="80">
      <div class="author-card-text">
        <strong>Cap'n Ken</strong>
        <span>Cruise Expert &amp; Maritime Enthusiast</span>
      </div>
    </div>
  </aside>
</main>

<footer class="footer" role="contentinfo">
  <div class="container">
    <div class="footer-links">
      <a href="/about-us.html">About</a>
      <a href="/privacy.html">Privacy</a>
      <a href="/terms.html">Terms</a>
    </div>
    <p>&copy; 2025 In the Wake. All rights reserved.</p>
  </div>
  <p class="trust-badge">&check; No ads. Minimal analytics. Independent of cruise lines. <a href="/affiliate-disclosure.html">Affiliate Disclosure</a></p>
  </footer>
<script src="/assets/nav.js" defer></script>
</body>
</html>
`;
}

// Main
const shows = singleSlug
  ? showsData.shows.filter(s => s.slug === singleSlug)
  : showsData.shows;

if (shows.length === 0) {
  console.error(singleSlug ? `No show found with slug: ${singleSlug}` : 'No shows in data file');
  process.exit(1);
}

let created = 0, skipped = 0, errors = 0;

for (const show of shows) {
  const filePath = path.join(outDir, `${show.slug}.html`);
  const exists = fs.existsSync(filePath);

  // Skip if page already exists (don't overwrite hand-crafted pages)
  if (exists) {
    console.log(`  SKIP  ${show.slug}.html — already exists`);
    skipped++;
    continue;
  }

  try {
    const html = generatePage(show);
    if (!dryRun) {
      fs.writeFileSync(filePath, html, 'utf8');
    }
    console.log(`  ✓  ${show.slug}.html — ${dryRun ? 'would create' : 'created'} (${show.type})`);
    created++;
  } catch (err) {
    console.error(`  ✗  ${show.slug}.html — ${err.message}`);
    errors++;
  }
}

console.log(`\nDone. Created: ${created} | Skipped: ${skipped} | Errors: ${errors}${dryRun ? ' (DRY RUN)' : ''}`);
