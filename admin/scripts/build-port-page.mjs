#!/usr/bin/env node
/**
 * build-port-page.mjs — generate an ITC v1.1 port page from a content spec.
 * Soli Deo Gloria.
 *
 * WHY THIS EXISTS: the port-page standard is ~790 lines of largely invariant
 * chrome (nav, JSON-LD, sidebar rails, script tags) wrapped around a modest
 * amount of hand-written, port-specific prose. Retyping the chrome per port
 * invites drift and typos; this script freezes the chrome to the shape that
 * validates at 92/100 (ports/eastport.html, 2026-07) and injects the prose.
 *
 * IT DOES NOT WRITE CONTENT. Every word of prose, every fact, every image
 * credit comes from the spec file, which a human or a research-grounded agent
 * authors and sources. If a spec is thin, the page is thin — the generator
 * has no opinions and invents nothing.
 *
 * TWO DELIBERATE DIVERGENCES from the frozen eastport chrome (2026-07-30):
 *   1. Nav and breadcrumb link /ports.html, /cruise-lines.html and
 *      /restaurants.html, not the trailing-slash directory forms. Those
 *      directories have no index.html, and the live site returns 404 for
 *      /ports/, /cruise-lines/ and /restaurants/ while the .html targets
 *      return 200 — so the inherited chrome ships three dead nav links on
 *      every page carrying it. The corpus-wide repair is a separate task
 *      (744 files); new pages are simply not built broken.
 *   2. The Recent Stories noscript fallback sits INSIDE #recent-rail rather
 *      than beside it, which is where the noscript validator looks and where
 *      the rail's own innerHTML replacement will correctly discard it.
 *
 * Usage:  node admin/scripts/build-port-page.mjs admin/port-specs/<slug>.json
 *         node admin/scripts/build-port-page.mjs --all
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const esc = (s) => String(s ?? '').replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s) => esc(s).replace(/"/g, '&quot;');

/** Image figure used inside body sections (float-right logbook style). */
function figure(img, cls = 'logbook-image float-right') {
  return `        <figure class="${cls}">
          <img src="${attr(img.src)}" alt="${attr(img.alt)}" loading="lazy">
          <figcaption class="tiny">${esc(img.caption)}<br><span style="font-size: 1rem;">Photo: ${esc(img.credit)}, <a href="${attr(img.source)}" rel="noopener">${esc(img.license)} via Wikimedia Commons</a></span></figcaption>
        </figure>`;
}

function gallerySlide(img) {
  return `            <div class="swiper-slide">
              <figure>
                <img src="${attr(img.src)}" alt="${attr(img.alt)}" loading="lazy" decoding="async" class="firstlook-img">
                <figcaption class="tiny">${esc(img.caption)} <span class="photo-credit">Photo: ${esc(img.credit)}, <a href="${attr(img.source)}" rel="noopener">${esc(img.license)} via Wikimedia Commons</a></span></figcaption>
              </figure>
            </div>`;
}

function creditLi(c) {
  return `          <li>${esc(c.what)} — ${esc(c.credit)}, <a href="${attr(c.source)}" rel="noopener">${esc(c.license)}</a></li>`;
}

const P = (paras) => paras.map((t) => `        <p>${t}</p>`).join('\n');
const LI = (items) => items.map((t) => `          <li>${t}</li>`).join('\n');

/** Normalise the spec's one-or-many image field to an array. */
const figList = (images) => (images == null ? [] : (Array.isArray(images) ? images : [images]));

/** One-or-many lead figures, for sections whose body is not a flat paragraph list. */
function figs(images) {
  return figList(images).map((f) => figure(f)).join('\n');
}

/**
 * Render prose with figures interleaved between paragraphs.
 *
 * `images` is one figure object (placed above the prose, the old behaviour) or
 * an array of them. In array form each figure may carry `after`, the 0-based
 * index of the paragraph it follows; a figure without `after` goes on top.
 * The standard asks for roughly one photo per 250-500 words, which a single
 * lead image cannot satisfy in an 1100-word logbook.
 */
function prose(paras, images) {
  const list = figList(images);
  const out = list.filter((f) => !Number.isInteger(f.after)).map((f) => figure(f));
  paras.forEach((t, i) => {
    out.push(`        <p>${t}</p>`);
    list.filter((f) => f.after === i).forEach((f) => out.push(figure(f)));
  });
  const dangling = list.filter((f) => Number.isInteger(f.after) && f.after >= paras.length);
  if (dangling.length) {
    throw new Error(`figure "after" index past end of prose (${paras.length} paragraphs): ` +
      dangling.map((f) => `${f.src}@${f.after}`).join(', '));
  }
  return out.join('\n');
}

function build(spec) {
  const s = spec;
  const faqJson = s.faq.map((f) => `      {"@type": "Question", "name": ${JSON.stringify(f.q)}, "acceptedAnswer": {"@type": "Answer", "text": ${JSON.stringify(f.a)}}}`).join(',\n');
  const faqHtml = s.faq.map((f) => `        <details class="faq-item"><summary>${esc(f.q)}</summary>
          <p class="list-indent">${esc(f.a)}</p>
        </details>`).join('\n');

  const glance = s.at_a_glance.map((g) => `            <div class="at-a-glance-item"><strong>${esc(g.k)}</strong><span>${esc(g.v)}</span></div>`).join('\n');
  const keyFacts = s.key_facts.map((k) => `            <li><strong>${esc(k.k)}:</strong> ${k.v}</li>`).join('\n');
  const planVisit = s.plan_your_visit.map((p) => `            <li><a href="${attr(p.href)}">${esc(p.label)}</a> — ${esc(p.note)}</li>`).join('\n');
  const pier = s.from_the_pier.map((p) => `          <li class="pier-distance-item"><strong>${esc(p.k)}:</strong> ${p.v}</li>`).join('\n');
  const glanceWx = s.weather.glance.map((g) => `                    <div class="seasonal-glance-item"><span class="glance-label">${esc(g.k)}</span><span class="glance-value">${esc(g.v)}</span></div>`).join('\n');
  const activities = s.weather.activities.map((a) => `                    <div class="activity-row"><span class="activity-label">${esc(a.k)}</span><span class="activity-months">${esc(a.v)}</span></div>`).join('\n');
  const catches = s.weather.catches.map((c) => `                    <li>${esc(c)}</li>`).join('\n');
  const packing = s.weather.packing.map((c) => `                    <li>${esc(c)}</li>`).join('\n');
  const shipLinks = (s.ships || []).map((sh) => `          <a href="${attr(sh.href)}" class="ship-link-pill" data-line="${attr(sh.line)}" title="${attr(sh.title)}">${esc(sh.name)}</a>`).join('\n');

  return `<!--
Soli Deo Gloria
All work on this project is offered as a gift to God.
"Trust in the LORD with all your heart, and do not lean on your own understanding." — Proverbs 3:5
"Whatever you do, work heartily, as for the Lord and not for men." — Colossians 3:23

STANDARDS: Every Page v3.010.300 · Production Template · Unified Nav v3.010.300 · A11y/WCAG 2.1 AA Compliant
--><!DOCTYPE html><html lang="en" class="no-js"><head>
<!-- ======================================================
       In the Wake — ${esc(s.name)} Port Guide
       Version: 3.010.300  |  Soli Deo Gloria
       ====================================================== -->

  <!-- Core -->
  <meta charset="utf-8">
  <script>document.documentElement.classList.remove('no-js');</script>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta name="ai-summary" content="${attr(s.ai_summary)}">
  <meta name="last-reviewed" content="${attr(s.last_reviewed)}">
  <meta name="content-protocol" content="ICP-Lite v1.4">

  <!-- SEO: Robots & Crawling -->
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <meta name="googlebot" content="index,follow">

  <!-- SEO: Theme & Appearance -->
  <meta name="color-scheme" content="light">
  <meta name="theme-color" content="#0e6e8e">
  <meta name="version" content="3.010.300">
  <meta name="author" content="In the Wake">

  <!-- Title & SEO -->
  <title>${esc(s.title)}</title>
  <link rel="canonical" href="https://cruisinginthewake.com/ports/${s.slug}.html">
  <meta name="description" content="${attr(s.description)}">

  <!-- OpenGraph -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="In the Wake">
  <meta property="og:title" content="${attr(s.og_title)}">
  <meta property="og:description" content="${attr(s.description)}">
  <meta property="og:url" content="https://cruisinginthewake.com/ports/${s.slug}.html">
  <meta property="og:image" content="https://cruisinginthewake.com${attr(s.hero.src)}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="https://cruisinginthewake.com${attr(s.hero.src)}">
  <meta name="twitter:title" content="${attr(s.og_title)}">
  <meta name="twitter:description" content="${attr(s.twitter_description || s.description)}">

  <!-- Favicon / PWA -->
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/in_the_wake_icon_32x32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="/manifest.webmanifest">

  <!-- Service Worker Registration -->
  <script>
  if('serviceWorker' in navigator){
    window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
  }
  </script>

  <link rel="stylesheet" href="/assets/styles.css?v=3.010.400">

<!-- Leaflet CSS for interactive maps -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
<link rel="stylesheet" href="/assets/css/components/port-map.css?v=2.0.0">

  <!-- JSON-LD: BreadcrumbList -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://cruisinginthewake.com/"},
      {"@type": "ListItem", "position": 2, "name": "Ports", "item": "https://cruisinginthewake.com/ports.html"},
      {"@type": "ListItem", "position": 3, "name": ${JSON.stringify(s.name)}, "item": "https://cruisinginthewake.com/ports/${s.slug}.html"}
    ]
  }
  </script>

  <!-- JSON-LD: WebPage (ICP-Lite) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": ${JSON.stringify(s.name)},
    "url": "https://cruisinginthewake.com/ports/${s.slug}.html",
    "description": ${JSON.stringify(s.ai_summary)},
    "dateModified": "${s.last_reviewed}",
    "mainEntity": {
      "@type": "Place",
      "name": ${JSON.stringify(s.name)},
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": ${s.lat},
        "longitude": ${s.lon}
      }
    }
  }
  </script>

  <!-- JSON-LD: FAQPage (ICP-Lite) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
${faqJson}
    ]
  }
  </script>

  <!-- LCP Optimization: Preload critical hero images -->
  <link rel="preload" as="image" href="/assets/logo_wake_560.png" fetchpriority="high">
  <link rel="preload" as="image" href="/assets/brand/compassrose.png" fetchpriority="high">

  <!-- Swiper CSS/JS (primary + CDN fallback) -->
  <script>
  (function ensureSwiper(){
    function addCSS(h){ const l=document.createElement('link'); l.rel='stylesheet'; l.href=h; document.head.appendChild(l); }
    function addJS(src, ok, fail){
      const s=document.createElement('script'); s.src=src; s.async=true; s.onload=ok; s.onerror=fail||function(){}; document.head.appendChild(s);
    }
    const primaryCSS="https://cruisinginthewake.com/vendor/swiper/swiper-bundle.min.css";
    const primaryJS ="https://cruisinginthewake.com/vendor/swiper/swiper-bundle.min.js";
    const cdnCSS    ="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css";
    const cdnJS     ="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js";
    addCSS(primaryCSS);
    addJS(primaryJS, function(){ window.__swiperReady=true; }, function(){ addCSS(cdnCSS); addJS(cdnJS, function(){ window.__swiperReady=true; }); });
  })();
  </script>

  <!-- Google Analytics -->
  <script async="" src="https://www.googletagmanager.com/gtag/js?id=G-WZP891PZXJ"></script>
  <script>
    window.dataLayer=window.dataLayer||[];
    function gtag(){dataLayer.push(arguments);}
    gtag('js',new Date());
    gtag('config','G-WZP891PZXJ',{anonymize_ip:true});
  </script>

  <!-- Umami (secondary analytics) -->
  <script defer="" src="https://cloud.umami.is/script.js" data-website-id="9661a449-3ba9-49ea-88e8-4493363578d2"></script>
</head>

<body class="page">
  <!-- Skip Link -->
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <!-- ARIA Live Regions -->
  <div id="a11y-status" role="status" aria-live="polite" aria-atomic="true" class="sr-only"></div>
  <div id="a11y-alerts" role="alert" aria-live="assertive" aria-atomic="true" class="sr-only"></div>

  <header class="hero-header" role="banner">
    <div class="navbar">
      <div class="brand">
        <img loading="lazy" src="/assets/logo_wake_256.png" srcset="/assets/logo_wake_256.png 1x, /assets/logo_wake_512.png 2x" width="256" height="259" alt="In the Wake wordmark" decoding="async">
      </div>
      <!-- Mobile hamburger button -->
      <button class="nav-toggle" type="button" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="site-nav">
        <span class="nav-toggle-icon">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="Main site navigation">
        <a class="nav-pill" href="/">Home</a>

        <!-- Planning Dropdown -->
        <div class="nav-dropdown" id="nav-planning">
          <button class="nav-pill" type="button" aria-expanded="false" aria-haspopup="true">
            Planning <span class="caret">▾</span>
          </button>
          <div class="dropdown-menu" role="menu">
            <a href="/planning.html">Planning (overview)</a>
            <a href="/first-cruise.html">Your First Cruise</a>
            <a href="/ships/">Ships</a>
            <a href="/cruise-lines.html">Cruise Lines</a>
            <a href="/ports.html">Ports</a>
            <a href="/packing-lists.html">Packing Lists</a>
            <a href="/accessibility.html">Accessibility</a>
          </div>
        </div>

        <!-- Tools Dropdown -->
        <div class="nav-dropdown" id="nav-tools">
          <button class="nav-pill" type="button" aria-expanded="false" aria-haspopup="true">
            Tools <span class="caret">▾</span>
          </button>
          <div class="dropdown-menu" role="menu">
            <a href="/ships/quiz.html">Ship Quiz</a>
            <a href="/cruise-lines/quiz.html">Cruise Line Quiz</a>
            <a href="/drink-calculator.html">Drink Calculator</a>
            <a href="/stateroom-check.html">Stateroom Check</a>
            <a href="/tools/port-tracker.html">Port Logbook</a>
            <a href="/tools/ship-tracker.html">Ship Logbook</a>
            <a href="/tools/cruise-budget-calculator.html">Budget Calculator</a>
            <a href="/tools/cruise-tipping-calculator.html">Tipping Calculator</a>
            <a href="/tools/port-day-planner.html">Port Day Planner</a>
            <a href="/tools/ship-size-atlas.html">Ship Size Atlas</a>
          </div>
        </div>

        <!-- Onboard Dropdown -->
        <div class="nav-dropdown" id="nav-onboard">
          <button class="nav-pill" type="button" aria-expanded="false" aria-haspopup="true">
            Onboard <span class="caret">▾</span>
          </button>
          <div class="dropdown-menu" role="menu">
            <a href="/restaurants.html">Restaurants &amp; Menus</a>
            <a href="/drink-packages.html">Drink Packages</a>
            <a href="/internet-at-sea.html">Internet at Sea</a>
            <a href="/articles.html">Articles</a>
          </div>
        </div>

        <!-- Travel Dropdown -->
        <div class="nav-dropdown" id="nav-travel">
          <button class="nav-pill" type="button" aria-expanded="false" aria-haspopup="true">
            Travel <span class="caret">▾</span>
          </button>
          <div class="dropdown-menu" role="menu">
            <a href="/travel.html">Travel (overview)</a>
            <a href="/solo.html">Solo</a>
          </div>
        </div>

        <a class="nav-pill" href="/search.html">Search</a>
        <a class="nav-pill" href="/about-us.html">About</a>
      </nav></div>

    <!-- Hero -->
    <div class="hero">
      <img loading="lazy" class="hero-compass" src="/assets/brand/compassrose.png" width="180" height="180" alt="" aria-hidden="true" decoding="async">
      <div class="hero-title">
        <img loading="eager" class="logo" src="/assets/logo_wake_560.png" srcset="/assets/logo_wake_560.png 1x, /assets/logo_wake_1120.png 2x" alt="In the Wake cruise travel logo" decoding="async" fetchpriority="high" width="560" height="567">
      </div>
      <div class="tagline" aria-hidden="true">A Cruise Traveler's Logbook</div>
      <div class="hero-credit">
        <a class="pill" href="https://www.flickersofmajesty.com" target="_blank" rel="noopener">Photo © Flickers of Majesty</a>
      </div>
    </div>
  </header>

  <!-- MAIN CONTENT -->
  <main class="wrap page-grid" id="main-content" role="main">
    <nav aria-label="Breadcrumb" style="grid-column: 1 / -1; margin-bottom: 1rem;"><ol style="list-style: none; padding: 0; margin: 0; font-size: 1rem; color: #666;"><li class="inline"><a href="/">Home</a> › </li><li class="inline"><a href="/ports.html">Ports</a> › </li><li aria-current="page" class="inline">${esc(s.name)}</li></ol></nav>

    <div class="col-1">

      <!-- HERO IMAGE -->
      <section class="port-hero" id="hero">
        <div class="port-hero-image">
          <img src="${attr(s.hero.src)}" alt="${attr(s.hero.alt)}" loading="eager" fetchpriority="high">
        </div>
        <div class="port-hero-overlay">
          <h1 class="port-hero-title">${esc(s.name)}</h1>
          <p class="port-hero-credit">Photo: ${esc(s.hero.credit)}, <a href="${attr(s.hero.source)}" rel="noopener">${esc(s.hero.license)} via Wikimedia Commons</a></p>
        </div>
      </section>

      <!-- INTRO -->
      <article class="card">
        <h2>${esc(s.intro.heading)}</h2>
${P(s.intro.paragraphs)}

        <p class="last-reviewed">Last reviewed: ${esc(s.last_reviewed_human)}</p>
        <div id="journal-btn-container"></div>

        <aside class="card disclaimer-volatile-data" style="background:#fff9e6;border-left:4px solid #d4a574;margin-top:1.5rem;">
          <h4 style="margin-top:0;color:#5a4a3a;">Itinerary &amp; Schedule Notice</h4>
          <p class="tiny" style="line-height:1.6;color:#5a4a3a;">${s.volatile_notice}</p>
        </aside>
      </article>

      <!-- FROM THE PIER -->
      <nav class="from-the-pier" id="from-the-pier" aria-label="Travel times from ${attr(s.short_name)} pier">
        <h3>From the Pier</h3>
        <ul class="pier-distances">
${pier}
        </ul>
        <p class="pier-note">${s.pier_note}</p>
      </nav>

      <!-- WEATHER SECTION -->
      <details class="port-section" id="weather-guide" open="">
        <summary><h2>Weather &amp; Best Time to Visit</h2></summary>
        <div id="port-weather-widget" data-port-id="${s.slug}" data-port-name="${attr(s.name)}" data-lat="${s.lat}" data-lon="${s.lon}" data-region="${attr(s.region)}">
          <noscript>
            <div class="seasonal-guide seasonal-guide-static">
              <details class="seasonal-section" open>
                <summary class="seasonal-section-title">At a Glance</summary>
                <div class="seasonal-at-glance">
                  <div class="seasonal-glance-grid">
${glanceWx}
                  </div>
                </div>
              </details>

              <details class="seasonal-section" open>
                <summary class="seasonal-section-title">Best Time to Visit</summary>
                <div class="seasonal-best-time">
                  <div class="cruise-seasons-grid">
                    <div class="cruise-season cruise-season-high"><span class="season-label">Peak Season</span><span class="season-months">${esc(s.weather.peak)}</span></div>
                    <div class="cruise-season cruise-season-transitional"><span class="season-label">Transitional Season</span><span class="season-months">${esc(s.weather.transitional)}</span></div>
                    <div class="cruise-season cruise-season-low"><span class="season-label">Low Season</span><span class="season-months">${esc(s.weather.low)}</span></div>
                  </div>
                  <div class="best-months-activities">
${activities}
                  </div>
                  <div class="months-to-avoid">
                    <span class="avoid-label">Consider avoiding:</span>
                    <span class="avoid-months">${esc(s.weather.avoid_months)}</span>
                    <span class="avoid-reason">(${esc(s.weather.avoid_reason)})</span>
                  </div>
                </div>
              </details>

              <details class="seasonal-section">
                <summary class="seasonal-section-title">What Catches Visitors Off Guard</summary>
                <div class="seasonal-catches">
                  <ul class="catches-list">
${catches}
                  </ul>
                </div>
              </details>

              <details class="seasonal-section">
                <summary class="seasonal-section-title">Packing Tips</summary>
                <div class="seasonal-packing">
                  <ul class="packing-list">
${packing}
                  </ul>
                  <p class="tiny mt-05"><a href="/packing-lists.html">Full packing lists →</a></p>
                </div>
              </details>

              <details class="seasonal-section" open>
                <summary class="seasonal-section-title">Weather Hazards</summary>
                <div class="seasonal-hazards">
                  <div class="hazard-warning">
                    <span class="hazard-icon">⚠️</span>
                    <div class="hazard-content">
                      <strong>${esc(s.weather.hazard_title)}</strong>
                      <p>${esc(s.weather.hazard_main)}</p>
                      <p>${esc(s.weather.hazard_season)}</p>
                      <p class="hazard-note">${esc(s.weather.hazard_note)}</p>
                    </div>
                  </div>
                </div>
              </details>

              <p class="weather-noscript-note"><em>Enable JavaScript for live weather conditions and a 48-hour forecast.</em></p>
            </div>
          </noscript>
        </div>
      </details>

      <!-- LOGBOOK -->
      <details class="port-section" id="logbook" open="">
        <summary><h2>Captain's Logbook</h2></summary>
        <article class="card logbook-entry">
${prose(s.logbook, s.images.logbook)}
        </article>
      </details>

      <!-- CRUISE PORT GUIDE -->
      <details class="port-section" id="cruise-port" open="">
        <summary><h2>Cruise Port Guide</h2></summary>
${prose(s.cruise_port, s.images.cruise_port)}
      </details>

      <!-- GETTING AROUND -->
      <details class="port-section" id="getting-around" open="">
        <summary><h2>Getting Around ${esc(s.short_name)}</h2></summary>
${prose(s.getting_around, s.images.getting_around)}
      </details>

      <!-- MAP -->
      <details class="port-section port-map-section" id="port-map-section" open="">
        <summary><h2>${esc(s.name)} Port Map</h2></summary>
        <div id="${s.slug}-port-map" class="port-map-container" role="application" aria-label="Interactive map of ${attr(s.name)}">
          <noscript>
            <p class="tiny">${s.map_intro}</p>
            <ul class="tiny">
${LI(s.map_points)}
            </ul>
            <p class="tiny">Enable JavaScript to view the interactive port map.</p>
          </noscript>
        </div>
      </details>

      <!-- EXCURSIONS -->
      <details class="port-section" id="excursions" open="">
        <summary><h2>Excursions &amp; Experiences</h2></summary>
${figs(s.images.excursions)}
${P(s.excursions.intro)}
${s.excursions.groups.map((g) => `        <h4>${esc(g.heading)}</h4>
        <ul>
${LI(g.items)}
        </ul>`).join('\n')}
${P(s.excursions.outro)}
      </details>

      <!-- HISTORY -->
      <details class="port-section" id="history" open="">
        <summary><h2>History &amp; Heritage</h2></summary>
${prose(s.history, s.images.history)}
      </details>

      <!-- FOOD -->
      <details class="port-section" id="food" open="">
        <summary><h2>Food &amp; Drink Ashore</h2></summary>
${prose(s.food, s.images.food)}
      </details>

      <!-- NOTICES -->
      <details class="port-section" id="notices" open="">
        <summary><h2>Know Before You Go</h2></summary>
        <ul>
${LI(s.notices)}
        </ul>
      </details>

      <!-- DEPTH SOUNDINGS -->
      <details class="port-section" id="depth-soundings" open="">
        <summary><h2>Depth Soundings Ashore</h2></summary>
${figs(s.images.depth)}
        <p>${s.depth_intro}</p>
        <ul>
${LI(s.depth_items)}
        </ul>
      </details>

      <!-- PRACTICAL -->
      <details class="port-section" id="practical" open="">
        <summary><h2>Practical Information</h2></summary>
        <ul>
${LI(s.practical)}
        </ul>
      </details>

      <!-- GALLERY -->
      <details class="port-section" id="gallery" open="">
        <summary><h2>${esc(s.name)} Photo Gallery</h2></summary>
        <div class="swiper ${s.slug}-gallery">
          <div class="swiper-wrapper">
${s.images.gallery.map(gallerySlide).join('\n')}
          </div>
          <div class="swiper-pagination"></div>
          <div class="swiper-button-prev"></div>
          <div class="swiper-button-next"></div>
        </div>
      </details>

      <!-- CREDITS -->
      <details class="port-section" id="credits" open="">
        <summary><h2>Credits</h2></summary>
        <p class="tiny">Every image on this page comes from Wikimedia Commons under the license noted and is credited to its creator below. In the Wake does not claim authorship of these images; when we can add our own photographs from a future visit, we will.</p>
        <ul class="tiny" style="line-height:1.8;">
${s.credits.map(creditLi).join('\n')}
        </ul>
      </details>

      <!-- FAQ -->
      <details class="card faq mt-2" open="">
        <summary><h2>Frequently Asked Questions</h2></summary>
${faqHtml}
        <p class="mt-2"><a href="/ports.html">← Back to Ports Guide</a></p>
      </details>

    </div><!-- /col-1 -->

    <aside class="rail col-2">
      <!-- Quick Answer -->
      <div class="page-intro mb-1">
        <p class="answer-line">
          <strong>Quick Answer:</strong> ${s.quick_answer}</p>
      </div>

      <!-- At a Glance -->
      <details class="card" open="">
        <summary>Port Snapshot</summary>
        <div class="card-content">
          <div class="at-a-glance-grid">
${glance}
          </div>
        </div>
      </details>

      <!-- Key Facts -->
      <details class="card" id="key-facts" open="">
        <summary>Key Facts</summary>
        <div class="card-content">
          <ul class="key-facts-list">
${keyFacts}
          </ul>
        </div>
      </details>

      <!-- Plan Your Visit -->
      <details class="card" open="">
        <summary>Plan Your Visit</summary>
        <div class="card-content">
          <ul class="plan-visit-list">
${planVisit}
          </ul>
        </div>
      </details>

      <!-- Author's Note Disclaimer (Level 1 — not yet visited) -->
      <aside class="card" style="background:#fffbf0;border-left:4px solid #d4a574;margin-top:1.5rem;">
        <h3>Author's Note</h3>
        <p class="tiny" style="line-height:1.6;color:#5a4a3a;">Until I have sailed this port myself, these notes are soundings in another's wake; carefully curated and edited to meet our standards. We believe they are helpful for planning, and marked for revision once I've logged my own steps ashore.</p>
      </aside>

      <!-- About the Author -->
      <div class="card author-card-vertical" aria-labelledby="author-heading">
        <h4 id="author-heading">About the Author</h4>
        <a href="/authors/ken-baker.html" aria-label="View Ken Baker's profile">
          <picture>
            <source srcset="/authors/img/ken1.webp?v=3.010.400" type="image/webp">
            <img class="author-avatar" src="/authors/img/ken1_96.webp" srcset="/authors/img/ken1_96.webp 1x, /authors/img/ken1_192.webp 2x" width="96" height="96" alt="Ken Baker, founder and author of In the Wake cruise travel logbook" decoding="async" loading="lazy">
          </picture>
        </a>
        <h4><a href="/authors/ken-baker.html">Ken Baker</a></h4>
        <p class="tiny">Founder of In the Wake; writer and editor of the logbook.</p>
        <p class="tiny"><a href="https://www.flickersofmajesty.com" target="_blank" rel="noopener">Flickers of Majesty</a></p>
      </div>

      <!-- Nearby Ports -->
      <div class="card" aria-labelledby="nearby-ports-title">
        <h4 id="nearby-ports-title">Nearby Ports</h4>
        <p class="tiny" style="color:#5a7a8a;">${esc(s.nearby_note)}</p>
        <div id="nearby-ports" class="rail-list" aria-live="polite"></div>
      </div>

      <!-- Ships That Visit Here -->
      <div class="card ships-visiting" aria-labelledby="ships-visiting-title">
        <h4 id="ships-visiting-title">Ships That Visit Here</h4>
        <p class="cruise-line-label">${esc(s.ships_label)}</p>
        <noscript><p class="tiny">${esc(s.ships_noscript)}</p></noscript>
        <div class="ship-links">
${shipLinks}
        </div>
      </div>

      <!-- Recent Stories (dynamic rail) -->
      <div class="card" aria-labelledby="recent-rail-title">
        <h4 id="recent-rail-title">Recent Stories</h4>
        <p class="tiny content-text">Real cruising experiences, practical guides, and heartfelt reflections from our community.</p>
        <nav id="recent-rail-nav-top" class="rail-nav" aria-label="Article pagination" style="display:none; margin-bottom: 0.5rem;"></nav>
        <div id="recent-rail" class="rail-list" aria-live="polite"><noscript><p class="tiny"><a href="/articles.html">Browse our cruise articles and stories →</a></p></noscript></div>
        <nav id="recent-rail-nav-bottom" class="rail-nav" aria-label="Article pagination" style="display:none; margin-top: 0.75rem;"></nav>
        <p id="recent-rail-fallback" class="tiny hidden">Loading articles…</p>
      </div>

      <!-- Whimsical Units -->
      <div class="card" id="whimsical-units-container" style="margin-top: 1rem;"></div>

      <!-- Image Credits -->
      <div class="card" style="margin-top: 1rem; background: #f7fdff;">
        <h4>Image Credits</h4>
        <p class="tiny mb-075">All images on this page are from Wikimedia Commons under the licenses noted, and are credited to their creators below. In the Wake does not claim authorship of these images.</p>
        <ul class="tiny" style="line-height:1.7;">
${s.credits.map(creditLi).join('\n')}
        </ul>
      </div>
    </aside>

    <button type="button" class="print-guide-btn" onclick="window.print()" aria-label="Print this guide">
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
      <span>Print Guide</span>
    </button>
  </main>

  <!-- FOOTER -->
  <footer class="wrap" role="contentinfo">
    <p>© <script>document.write(new Date().getFullYear())</script> In the Wake · A Cruise Traveler's Logbook · All rights reserved.</p>
    <p class="tiny mt-05">
      <a href="/privacy.html">Privacy</a> ·
      <a href="/terms.html">Terms</a> ·
      <a href="/about-us.html">About</a> ·
      <a href="/support.html">Support</a> ·
      <a href="/reaching-someone-at-sea.html">Reach Family at Sea</a> ·
      <a href="/accessibility.html">Accessibility &amp; WCAG 2.1 AA Commitment</a>
    </p>
    <p class="tiny center dedication-hidden" aria-hidden="true">Soli Deo Gloria — Every pixel and part of this project is offered as worship to God, in gratitude for the beautiful things He has created for us to enjoy. ✝️</p>
    <p class="trust-badge">✓ No ads. Works offline. Independent of cruise lines. <a href="/affiliate-disclosure.html">Affiliate Disclosure</a></p>
  </footer>

  <!-- Dropdown Navigation -->
  <script src="/assets/js/dropdown.js"></script>
  <script src="/assets/js/port-logbook-btn.js" defer=""></script>
  <script src="/assets/js/ship-port-links.js" defer=""></script>

  <!-- In-App Browser Detection & Escape Banner -->
  <script src="/assets/js/in-app-browser-escape.js"></script>

  <!-- Nearby Ports Script -->
  <script>window.currentPortId = '${s.slug}';</script>
  <script src="/assets/js/nearby-ports.js"></script>
  <script src="/assets/js/article-rail.js"></script>

  <!-- Whimsical Distance Units Script -->
  <script src="/assets/js/whimsical-port-units.js"></script>

<!-- Leaflet JS for interactive maps -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
<script src="/assets/js/modules/port-map.js"></script>

<!-- Initialize ${esc(s.short_name)} Port Map -->
<script>
document.addEventListener('DOMContentLoaded', function() {
  if (typeof PortMap !== 'undefined' && typeof L !== 'undefined') {
    PortMap.init({ containerId: '${s.slug}-port-map', portSlug: '${s.slug}' });
  }
});
</script>

<!-- Initialize ${esc(s.short_name)} Gallery Swiper -->
<script>
(function initGallery(){
  function when(cb){ if(window.Swiper) cb(); else setTimeout(()=>when(cb), 100); }
  when(function(){
    try {
      new Swiper('.swiper.${s.slug}-gallery', {
        loop: true, lazy: true, watchOverflow: true,
        pagination: { el: '.swiper.${s.slug}-gallery .swiper-pagination', clickable: true },
        navigation: { nextEl: '.swiper.${s.slug}-gallery .swiper-button-next', prevEl: '.swiper.${s.slug}-gallery .swiper-button-prev' },
        a11y: { enabled: true }
      });
    } catch(e) {  }
  });
})();
</script>

  <!-- Port Weather Widget -->
  <script type="module" src="/assets/js/port-weather.js"></script>

</body></html>
`;
}

const POI_INDEX = join(REPO, 'assets', 'data', 'maps', 'poi-index.json');

/** Every marker type port-map.js knows how to render (assets/js/modules/port-map.js POI_TYPES). */
const POI_TYPES = new Set(['port', 'beach', 'landmark', 'nature', 'district', 'shopping', 'museum',
  'attraction', 'park', 'cultural', 'scenic', 'dining', 'neighborhood', 'historic', 'transport',
  'market', 'marina']);

function buildMap(spec) {
  const pois = spec.map_manifest.pois || [];
  return JSON.stringify({
    _meta: {
      version: '1.0.0',
      generated: new Date(spec.last_reviewed + 'T00:00:00Z').toISOString(),
      source: spec.map_manifest.source,
    },
    port_slug: spec.slug,
    port_name: spec.name,
    port_pin: spec.map_manifest.port_pin,
    bbox_hint: spec.map_manifest.bbox_hint,
    poi_ids: pois.map((p) => p.id),
    // Duplicated inline as well as pushed to poi-index.json: port-map.js falls
    // back to this array when the global index is stale, and it keeps the
    // manifest self-describing for anyone auditing coordinates.
    pois,
    label_overrides: spec.map_manifest.label_overrides || {},
    ...(spec.map_manifest.todo ? { _todo: spec.map_manifest.todo } : {}),
  }, null, 2) + '\n';
}

/**
 * Upsert a spec's POIs into the global index the map actually reads.
 *
 * poi_ids in a per-port manifest are pointers; a pointer with no entry in
 * poi-index.json renders nothing, which is why the validator counts *resolved*
 * ids rather than listed ones. Coordinates must come from a real gazetteer
 * lookup recorded in map_manifest.source — never estimated off a street map.
 */
function syncPoiIndex(spec) {
  const pois = spec.map_manifest.pois || [];
  if (!pois.length) return 0;
  const index = JSON.parse(readFileSync(POI_INDEX, 'utf-8'));
  for (const p of pois) {
    for (const k of ['id', 'name', 'lat', 'lon', 'type']) {
      if (p[k] == null) throw new Error(`POI ${p.id || '(no id)'} in ${spec.slug} is missing "${k}"`);
    }
    if (!POI_TYPES.has(p.type)) {
      throw new Error(`POI ${p.id} has type "${p.type}", which port-map.js cannot render. One of: ${[...POI_TYPES].join(', ')}`);
    }
    const owner = index[p.id]?.port;
    if (owner && owner !== spec.slug) {
      throw new Error(`POI id "${p.id}" is already claimed by port "${owner}"; pick a unique id`);
    }
    index[p.id] = { id: p.id, name: p.name, aliases: p.aliases || [], lat: p.lat, lon: p.lon,
      type: p.type, geometry: p.geometry || 'point', notes: p.notes || '', port: spec.slug };
  }
  index._meta.counts[spec.slug] = pois.length;
  index._meta.updated = spec.last_reviewed;
  writeFileSync(POI_INDEX, JSON.stringify(index, null, 2) + '\n');
  return pois.length;
}

const args = process.argv.slice(2);
const specDir = join(REPO, 'admin', 'port-specs');
const specs = args[0] === '--all'
  // .images.json siblings live in the same directory and are not page specs.
  ? readdirSync(specDir).filter((f) => f.endsWith('.json') && !f.endsWith('.images.json')).map((f) => join(specDir, f))
  : args.map((a) => (a.startsWith('/') ? a : join(REPO, a)));

if (!specs.length) { console.error('usage: build-port-page.mjs <spec.json> | --all'); process.exit(2); }

for (const specPath of specs) {
  const spec = JSON.parse(readFileSync(specPath, 'utf-8'));
  const html = build(spec);
  const out = join(REPO, 'ports', `${spec.slug}.html`);
  writeFileSync(out, html);
  const mapOut = join(REPO, 'assets', 'data', 'maps', `${spec.slug}.map.json`);
  writeFileSync(mapOut, buildMap(spec));
  const poiCount = syncPoiIndex(spec);
  const words = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  console.log(`✓ ${spec.slug}: ports/${spec.slug}.html (~${words} words) + maps/${spec.slug}.map.json + ${poiCount} POIs`);
}
