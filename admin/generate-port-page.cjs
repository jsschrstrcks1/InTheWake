#!/usr/bin/env node
/**
 * generate-port-page.cjs — Gold Standard Port Page Generator
 * Soli Deo Gloria
 *
 * Generates a new port page from a tightly controlled template matching
 * the gold standard (dubai.html). Enforces ICP-2 v2.1, LOGBOOK_ENTRY_STANDARDS
 * v2.300, and all 21 audit detections.
 *
 * Usage:
 *   node admin/generate-port-page.cjs --port "Mykonos" --country "Greece" --region "Mediterranean" \
 *     --lat 37.4467 --lon 25.3289 --currency "EUR" --language "Greek"
 *
 *   node admin/generate-port-page.cjs --config ports-config/mykonos.json
 *
 *   node admin/generate-port-page.cjs --port "Mykonos" --dry-run  (preview only)
 */

const fs = require('fs');
const path = require('path');

const PORTS_DIR = path.join(__dirname, '..', 'ports');
const TODAY = new Date().toISOString().split('T')[0];

function slugify(name) {
  return name.toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function generatePage(config) {
  const {
    port, country, region, lat, lon, currency, currencyCode,
    language, timezone, dockType = 'dock', slug: customSlug
  } = config;

  const slug = customSlug || slugify(port);
  const title = `${port} Cruise Port Guide — In the Wake`;
  const description = `First-person logbook guide to ${port}, ${country} — cruise terminal, getting around, shore excursions, local food, and practical tips for cruise travelers.`;
  const aiSummary = `${port} cruise port in ${country}. ${dockType === 'tender' ? 'Tender port' : 'Ships dock directly'}. ${region} itineraries. Local currency: ${currencyCode || currency}.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <!-- ICP-2 v2.1 -->
    <meta name="ai-summary" content="${aiSummary.substring(0, 250)}">
    <meta name="last-reviewed" content="${TODAY}">
    <meta name="content-protocol" content="ICP-2">
    <meta name="author" content="In the Wake">
    <meta name="description" content="${description.substring(0, 160)}">
    <!-- OpenGraph -->
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="In the Wake">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description.substring(0, 160)}">
    <meta property="og:url" content="https://cruisinginthewake.com/ports/${slug}.html">
    <meta property="og:image" content="https://cruisinginthewake.com/assets/social/port-hero.jpg">
    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description.substring(0, 160)}">
    <meta name="twitter:image" content="https://cruisinginthewake.com/assets/social/port-hero.jpg">
    <title>${title}</title>
    <link rel="canonical" href="https://cruisinginthewake.com/ports/${slug}.html">
    <link rel="stylesheet" href="/assets/styles.css">
    <!-- JSON-LD: BreadcrumbList -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://cruisinginthewake.com/"},
        {"@type": "ListItem", "position": 2, "name": "Ports", "item": "https://cruisinginthewake.com/ports.html"},
        {"@type": "ListItem", "position": 3, "name": "${port}", "item": "https://cruisinginthewake.com/ports/${slug}.html"}
      ]
    }
    </script>
    <!-- JSON-LD: WebPage + Place -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://cruisinginthewake.com/ports/${slug}.html",
      "name": "${port} Port Guide",
      "description": "${aiSummary.substring(0, 250)}",
      "datePublished": "${TODAY}",
      "dateModified": "${TODAY}",
      "mainEntity": {
        "@type": "Place",
        "name": "${port}",
        "geo": {"@type": "GeoCoordinates", "latitude": ${lat || 0}, "longitude": ${lon || 0}}
      }
    }
    </script>
    <!-- JSON-LD: FAQPage -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {"@type": "Question", "name": "What is the best time to visit ${port}?", "acceptedAnswer": {"@type": "Answer", "text": "<!-- FILL: Port-specific best season advice -->"}},
        {"@type": "Question", "name": "Can I explore ${port} independently from a cruise ship?", "acceptedAnswer": {"@type": "Answer", "text": "<!-- FILL: Independent vs ship excursion advice -->"}},
        {"@type": "Question", "name": "What currency is used in ${port}?", "acceptedAnswer": {"@type": "Answer", "text": "The local currency is ${currency} (${currencyCode || ''})."}},
        {"@type": "Question", "name": "How far is the cruise terminal from the town center?", "acceptedAnswer": {"@type": "Answer", "text": "<!-- FILL: Distance and transport options -->"}},
        {"@type": "Question", "name": "Is ${port} suitable for passengers with mobility challenges?", "acceptedAnswer": {"@type": "Answer", "text": "<!-- FILL: Accessibility details -->"}}
      ]
    }
    </script>
</head>
<body class="page">

  <header>
    <div class="navbar" aria-label="Main navigation">
      <nav class="site-nav" id="site-nav" aria-label="Main site navigation">
        <a class="nav-pill" href="/">Home</a>
        <a class="nav-pill" href="/ports.html">Ports</a>
        <a class="nav-pill" href="/ships.html">Ships</a>
        <a class="nav-pill" href="/search.html">Search</a>
        <a class="nav-pill" href="/about-us.html">About</a>
      </nav>
    </div>
    <div class="hero">
      <img loading="eager" class="logo" src="/assets/logo_wake_560.png" alt="In the Wake cruise travel logo" decoding="async" fetchpriority="high" width="560" height="567">
      <div class="tagline" aria-hidden="true">A Cruise Traveler's Logbook</div>
    </div>
  </header>

  <main class="wrap page-grid" id="main-content" role="main">
    <nav aria-label="Breadcrumb" style="grid-column: 1 / -1; margin-bottom: 1rem;">
      <ol style="list-style: none; padding: 0; margin: 0; font-size: 0.9rem; color: #666;">
        <li class="inline"><a href="/">Home</a> › </li>
        <li class="inline"><a href="/ports.html">Ports</a> › </li>
        <li aria-current="page" class="inline">${port}</li>
      </ol>
    </nav>

    <article class="card">

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- HERO SECTION -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <section class="port-hero" id="hero" aria-label="${port} cruise port hero image">
        <div class="port-hero-image">
          <img src="/ports/img/${slug}/${slug}-hero.webp"
               alt="<!-- FILL: Descriptive alt text for ${port} hero image -->"
               loading="eager" fetchpriority="high">
          <div class="port-hero-overlay">
            <h1 class="port-hero-title">${port}, ${country}</h1>
          </div>
        </div>
        <p class="port-hero-credit">Photo: <a href="https://commons.wikimedia.org" target="_blank" rel="noopener">Wikimedia Commons</a></p>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- FROM THE PIER (navigation distances) -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <nav class="from-the-pier" id="from-the-pier" aria-label="Walking distances from ${port} cruise terminal">
        <h2>From the Pier</h2>
        <ul>
          <li><!-- FILL: Key destination 1 with walking time --></li>
          <li><!-- FILL: Key destination 2 with walking time --></li>
          <li><!-- FILL: Key destination 3 with walking time --></li>
        </ul>
      </nav>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- CAPTAIN'S LOGBOOK (800+ words, first-person) -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <details class="port-section" id="logbook" open="">
        <summary><h2>Captain's Logbook</h2></summary>
        <!--
          REQUIREMENTS:
          - 800+ words in first-person voice
          - 2+ UNIQUE emotional pivot markers (avoid "breath caught" and "whispered a quiet prayer" — overused)
          - 1+ reflection marker ("I realized", "the lesson:", "looking back", "what matters is")
          - 3+ senses used (visual, auditory, tactile, olfactory, gustatory)
          - Port-specific details (place names, sensory descriptions, local interactions)
          - NO generic content copied from other port pages
        -->
        <p><!-- FILL: 800+ word first-person logbook narrative about ${port} --></p>
      </details>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- CRUISE PORT (100+ words) -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <details class="port-section" id="cruise-port" open="">
        <summary><h2>The Cruise Port</h2></summary>
        <!-- FILL: Terminal name, dock/tender, distance to town, taxi costs in ${currency}, accessibility -->
        <p><!-- FILL: 100+ words about the cruise port --></p>
      </details>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- GETTING AROUND (200+ words) -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <details class="port-section" id="getting-around" open="">
        <summary><h2>Getting Around</h2></summary>
        <!-- FILL: Transport options with prices in ${currency}, walking feasibility, accessibility -->
        <p><!-- FILL: 200+ words about getting around ${port} --></p>
      </details>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- PORT MAP -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <details class="port-section" id="map" open="">
        <summary><h2>Port Map</h2></summary>
        <p class="map-intro">Interactive map showing cruise terminal and ${port} area points of interest.</p>
        <div id="${slug}-port-map" class="port-map-container" role="application"
             aria-label="Interactive map of ${port} port and points of interest"
             data-port-id="${slug}" data-lat="${lat || 0}" data-lon="${lon || 0}">
          <noscript><p>Interactive map requires JavaScript. <a href="https://www.openstreetmap.org/?mlat=${lat || 0}&mlon=${lon || 0}#map=12/${lat || 0}/${lon || 0}" target="_blank" rel="noopener">View on OpenStreetMap</a>.</p></noscript>
        </div>
      </details>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- EXCURSIONS (400+ words) -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <details class="port-section" id="excursions" open="">
        <summary><h2>Shore Excursions</h2></summary>
        <p class="tiny" style="margin-bottom: 0.75rem; font-style: italic; color: #678;">Booking guidance: Ship excursion options provide guaranteed return to the vessel. For those who prefer to explore independently, local operators offer competitive rates — book ahead during peak season. Whether you choose a ship excursion or go independent, confirm departure times before heading out.</p>
        <!-- FILL: 4+ specific excursions with prices in ${currency} -->
        <!-- IMPORTANT: Replace the generic booking guidance above with PORT-SPECIFIC advice -->
      </details>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- LOCAL FOOD (100+ words) -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <details class="port-section" id="food" open="">
        <summary><h2>Local Food</h2></summary>
        <!-- FILL: Local cuisine, specific dishes, price ranges in ${currency} -->
        <p><!-- FILL: 100+ words about food in ${port} --></p>
      </details>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- NOTICES -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <details class="port-section" id="notices" open="">
        <summary><h2>Local Notices</h2></summary>
        <!-- FILL: Port-specific warnings, cultural considerations, safety -->
        <p><!-- FILL: 50+ words of port-specific notices --></p>
      </details>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- DEPTH SOUNDINGS (100+ words, port-specific) -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <details class="port-section" id="depth-soundings" open="">
        <summary><h2>Depth Soundings Ashore</h2></summary>
        <!--
          MUST BE PORT-SPECIFIC. Do NOT use:
          - "Tap water safety varies by destination"
          - "Budget $30-$80 per person"
          - Generic safety advice
          Instead: specific tips about ${port} (${currency} prices, local customs, real advice)
        -->
        <p><!-- FILL: 100+ words of port-specific practical tips --></p>
      </details>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- PRACTICAL INFORMATION (100+ words) -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <details class="port-section" id="practical" open="">
        <summary><h2>Practical Information</h2></summary>
        <ul>
          <li><strong>Currency:</strong> ${currency} (${currencyCode || ''})</li>
          <li><strong>Language:</strong> ${language || 'Local language'}</li>
          <li><strong>Timezone:</strong> ${timezone || '<!-- FILL -->'}</li>
          <li><strong>Tipping:</strong> <!-- FILL: Local tipping customs --></li>
          <li><strong>Safety:</strong> <!-- FILL: Specific safety notes --></li>
          <li><strong>Communication:</strong> <!-- FILL: Wi-Fi, SIM card availability --></li>
        </ul>
      </details>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- PHOTO GALLERY (6+ images) -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <details class="port-section" id="gallery" open="">
        <summary><h2>Photo Gallery</h2></summary>
        <div class="gallery-grid">
          <!-- FILL: 6+ figure elements, each with photo-credit -->
          <figure class="gallery-item">
            <img src="/ports/img/${slug}/${slug}-1.webp" alt="<!-- FILL: Descriptive alt text -->" loading="lazy">
            <figcaption><!-- FILL: Caption --> <span class="photo-credit">Photo: <a href="https://commons.wikimedia.org" target="_blank" rel="noopener">Wikimedia Commons</a></span></figcaption>
          </figure>
          <!-- Add 5+ more gallery-item figures -->
        </div>
      </details>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- IMAGE CREDITS -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <details class="port-section" id="credits" open="">
        <summary><h2>Image Credits</h2></summary>
        <ul>
          <li><strong>${slug}-hero.webp</strong>: <a href="https://commons.wikimedia.org" target="_blank" rel="noopener">Wikimedia Commons</a> (CC BY-SA)</li>
          <!-- FILL: Credit every image used on this page -->
        </ul>
        <p><em>All port images sourced under Creative Commons licenses.</em></p>
      </details>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- FAQ (5+ questions, 200+ words total) -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <details class="port-section" id="faq" open="">
        <summary><h2>Frequently Asked Questions</h2></summary>
        <!-- FILL: 5+ port-specific FAQ items matching the JSON-LD FAQPage schema above -->
        <details class="faq-item">
          <summary>What is the best time to visit ${port}?</summary>
          <p><!-- FILL: Specific seasonal advice --></p>
        </details>
        <details class="faq-item">
          <summary>Can I explore ${port} independently?</summary>
          <p><!-- FILL: Independent exploration advice --></p>
        </details>
        <details class="faq-item">
          <summary>What currency is used in ${port}?</summary>
          <p>The local currency is ${currency} (${currencyCode || ''}). <!-- FILL: ATM, card acceptance --></p>
        </details>
        <details class="faq-item">
          <summary>How far is the cruise terminal from town?</summary>
          <p><!-- FILL: Distance and transport --></p>
        </details>
        <details class="faq-item">
          <summary>Is ${port} accessible for wheelchair users?</summary>
          <p><!-- FILL: Accessibility details --></p>
        </details>
      </details>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- WEATHER & BEST TIME TO VISIT -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <details class="port-section" id="weather-guide" open="">
        <summary><h2>Weather &amp; Best Time to Visit</h2></summary>
        <div class="weather-widget" data-port-id="${slug}" data-lat="${lat || 0}" data-lon="${lon || 0}">
          <noscript>
            <p>Enable JavaScript for live weather conditions.</p>
            <!-- FILL: Port-specific static weather data (NOT generic "Varies by season") -->
          </noscript>
        </div>
      </details>

    </article>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- SIDEBAR -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <aside class="card" style="grid-row: 1; align-self: start;">
      <h4>Author's Note</h4>
      <p class="tiny" style="line-height:1.6;color:#5a4a3a;">Until I have sailed this port myself, these notes are soundings in another's wake — charts drawn from research, captain's wisdom, and the accounts of fellow travelers. I write them knowing that the truest understanding comes only when you stand on the pier, smell the salt air, and trace the streets with your own feet. When my anchor finally drops here, I'll return to these pages and tell you what I found.</p>

      <section class="rail-section">
        <h4>At a Glance</h4>
        <ul class="glance-list">
          <li><strong>Country:</strong> ${country}</li>
          <li><strong>Region:</strong> ${region}</li>
          <li><strong>Currency:</strong> ${currency}</li>
          <li><strong>Language:</strong> ${language || '<!-- FILL -->'}</li>
          <li><strong>Dock type:</strong> ${dockType === 'tender' ? 'Tender' : 'Dock'}</li>
        </ul>
      </section>

      <section class="rail-section" id="recent-rail">
        <h4 id="recent-rail-title">Recent Stories</h4>
        <ul class="recent-stories-list">
          <li><a href="/articles/cruise-tech-photography-guide.html">Cruise Photography Guide</a></li>
          <li><a href="/articles/cruise-cabin-organization.html">Cabin Organization Tips</a></li>
        </ul>
      </section>
    </aside>

  </main>

  <footer class="wrap" role="contentinfo">
    <p>© ${new Date().getFullYear()} In the Wake. All rights reserved. <a href="/affiliate-disclosure.html">Affiliate Disclosure</a></p>
  </footer>

  <script src="/assets/js/main.js" defer></script>
</body>
</html>`;
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  // Parse arguments
  const getArg = (name) => {
    const idx = args.indexOf(`--${name}`);
    return idx !== -1 ? args[idx + 1] : null;
  };

  const config = {
    port: getArg('port'),
    country: getArg('country') || '<!-- FILL: Country -->',
    region: getArg('region') || '<!-- FILL: Region -->',
    lat: parseFloat(getArg('lat')) || 0,
    lon: parseFloat(getArg('lon')) || 0,
    currency: getArg('currency') || '<!-- FILL: Currency -->',
    currencyCode: getArg('currency-code') || '',
    language: getArg('language') || '',
    timezone: getArg('timezone') || '',
    dockType: getArg('dock-type') || 'dock',
    slug: getArg('slug'),
  };

  // Load from config file if specified
  const configFile = getArg('config');
  if (configFile) {
    const fileConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    Object.assign(config, fileConfig);
  }

  if (!config.port) {
    console.error('Usage: generate-port-page.cjs --port "Port Name" [options]');
    console.error('  --country "Country"   --region "Region"');
    console.error('  --lat 0.0  --lon 0.0  --currency "EUR" --currency-code "EUR"');
    console.error('  --language "Greek"     --timezone "EET"  --dock-type dock|tender');
    console.error('  --config path.json    --dry-run         --slug custom-slug');
    process.exit(1);
  }

  const slug = config.slug || slugify(config.port);
  const outPath = path.join(PORTS_DIR, `${slug}.html`);
  const html = generatePage(config);

  if (dryRun) {
    console.log(`[DRY RUN] Would create: ${outPath}`);
    console.log(`Port: ${config.port}, Slug: ${slug}`);
    console.log(`Sections: hero, logbook, cruise-port, getting-around, map, excursions, food, notices, depth-soundings, practical, gallery, credits, faq, weather-guide`);
    console.log(`Meta: ai-summary, description, OG, Twitter Cards, canonical`);
    console.log(`JSON-LD: BreadcrumbList, WebPage+Place, FAQPage`);
    console.log(`\nTemplate has <!-- FILL --> markers for content that needs human/AI writing.`);
    console.log(`\nTo validate: node admin/validate-port-page-v2.js ${outPath}`);
    console.log(`To audit:    node admin/port-page-audit.cjs ${outPath}`);
    console.log(`To compare:  node admin/gold-standard-compare.cjs ${outPath}`);
    return;
  }

  if (fs.existsSync(outPath)) {
    console.error(`ERROR: ${outPath} already exists. Use a different slug or delete the existing file.`);
    process.exit(1);
  }

  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`✓ Created: ${outPath}`);
  console.log(`  Port: ${config.port} (${slug})`);
  console.log(`  Template has <!-- FILL --> markers for content.`);
  console.log(`\nNext steps:`);
  console.log(`  1. Fill in all <!-- FILL --> markers with port-specific content`);
  console.log(`  2. Source images to /ports/img/${slug}/`);
  console.log(`  3. Create -attr.json files for each image`);
  console.log(`  4. Update port-disclaimer-registry.json`);
  console.log(`  5. Validate: node admin/validate-port-page-v2.js ${outPath}`);
  console.log(`  6. Audit:    node admin/port-page-audit.cjs ${outPath}`);
  console.log(`  7. Compare:  node admin/gold-standard-compare.cjs ${outPath}`);
}

main();
