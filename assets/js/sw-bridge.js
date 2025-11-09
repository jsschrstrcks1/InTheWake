<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta name="version" content="v=.9.001.008"/>
  <title>Royal Caribbean Drink Package Calculator 2025 | Is It Worth It?</title>
  <meta name="description" content="Free Royal Caribbean drink calculator with Crown & Anchor support, sea/port day weighting, itinerary mode, and break-even analysis. Plan your cruise drink budget."/>
  <link rel="canonical" href="https://cruisinginthewake.com/drink-calculator.html"/>

  <!-- Favicon / PWA -->
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/in_the_wake_icon_32x32.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/assets/icons/in_the_wake_icon_192x192.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/in_the_wake_icon_180x180.png">
  <link rel="manifest" href="/manifest.webmanifest">
  <meta name="theme-color" content="#0a3d62">

  <!-- Perf -->
  <link rel="preconnect" href="https://api.frankfurter.app">
  <link rel="preconnect" href="https://api.exchangerate.host">

  <!-- Social -->
  <meta property="og:type" content="website"/>
  <meta property="og:title" content="Royal Caribbean Drink Package Calculator"/>
  <meta property="og:description" content="Break-even chart + sea/port day weighting. Find out if a package saves money."/>
  <meta property="og:url" content="https://cruisinginthewake.com/drink-calculator.html"/>
  <meta property="og:image" content="https://cruisinginthewake.com/assets/social/drink-calculator-2025.jpg"/>
  <meta name="twitter:card" content="summary_large_image"/>

  <!-- Structured data -->
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
    {"@type":"ListItem","position":1,"name":"Home","item":"https://cruisinginthewake.com/"},
    {"@type":"ListItem","position":2,"name":"Royal Caribbean Drink Package Calculator","item":"https://cruisinginthewake.com/drink-calculator.html"}]}
  </script>
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
    {"@type":"Question","name":"Is the Royal Caribbean drink package worth it?","acceptedAnswer":{"@type":"Answer","text":"It can be worth it if you typically average ~5–6 alcoholic drinks per day. Use the calculator to compare à-la-carte to Soda, Refreshment, and Deluxe, with gratuity included."}},
    {"@type":"Question","name":"Does the drink package include gratuity?","acceptedAnswer":{"@type":"Answer","text":"Yes. Package prices include the 18% service charge. À-la-carte drinks add 18% at checkout."}},
    {"@type":"Question","name":"How do I enter sale prices from Cruise Planner?","acceptedAnswer":{"@type":"Answer","text":"Click “Edit price…” on any package to type your sale rate; results update instantly."}}]}
  </script>
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"SoftwareApplication","name":"Royal Caribbean Drink Package Calculator","applicationCategory":"Utilities","operatingSystem":"Any (Web)","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"}}
  </script>

  <style>
    :root{
      --sea:#0a3d62; --foam:#e6f4f8; --rope:#d9b382; --ink:#083041; --sky:#f7fdff;
      --accent:#0e6e8e; --shadow:0 2px 6px rgba(8,48,65,.08); --shadow-lg:0 10px 28px rgba(8,48,65,.14);
      --rail-width:320px; --bg:#f8fbfc; --card:#fff; --bd:#e5e7eb; --muted:#525a66;
      --good:#10b981; --warn:#f59e0b; --bad:#ef4444;
    }
    *{box-sizing:border-box}
    html{scrollbar-gutter:stable both-edges}
    body{margin:0;background:var(--sky);color:var(--ink);font:16px/1.45 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}
    a{color:var(--accent);text-decoration:none} a:hover{text-decoration:underline}
    img{max-width:100%;height:auto;display:block}
    .wrap{max-width:1100px;margin:0 auto;padding:20px 14px 36px}
    .card{background:var(--card);border:2px solid var(--rope);border-radius:12px;padding:1rem;margin:.8rem 0;box-shadow:var(--shadow)}
    h1,h2,h3{color:var(--sea)} .tiny{font-size:.88rem;color:#456} .small{font-size:.9rem;color:#475569} .muted{color:var(--muted)}
    .sr-only{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
    .focusable:focus{outline:3px dashed var(--rope);outline-offset:2px}

    /* Header / hero */
    .hero-header{position:relative;z-index:0;border-bottom:6px double var(--rope);background:#eaf6f6;overflow:visible}
    .navbar{max-width:1100px;margin:0 auto;display:flex;gap:.6rem;padding:.35rem .9rem .75rem;align-items:center;position:relative;z-index:10;min-height:56px;background:#eaf6f6}
    .brand{display:flex;align-items:center;gap:.6rem}.brand img{height:40px;width:auto}
    .version-badge{font-size:.72rem;opacity:.8;margin-left:.35rem}
    .itw-nav{display:flex;gap:.5rem;flex:1 1 auto;align-items:center;justify-content:center;white-space:nowrap;padding-inline:.75rem;overflow:visible}
    .itw-nav .nav-item{position:relative}
    .itw-nav .chip{display:inline-flex;align-items:center;gap:.35rem;padding:.35rem .7rem;border-radius:10px;background:#fff;border:1px solid var(--rope);color:var(--accent);font-size:.95rem;cursor:pointer}
    .itw-nav .nav-item>a.chip{text-decoration:none}
    .itw-nav .chip[aria-current="page"]{outline:3px dashed var(--rope);outline-offset:2px;box-shadow:0 0 0 3px rgba(200,163,106,.15) inset}
    .itw-nav .menu{position:absolute;left:0;top:100%;transform:translateY(.35rem);min-width:240px;max-width:min(90vw,360px);background:#fff;border:1px solid var(--rope);border-radius:12px;box-shadow:var(--shadow-lg);padding:.6rem;display:none;visibility:hidden;opacity:0;pointer-events:none;z-index:100;transition:opacity .18s ease}
    .itw-nav .nav-item.open>.menu{display:block;visibility:visible;opacity:1;pointer-events:auto}
    .itw-nav .menu .label{font-weight:600;color:#234;margin:.15rem .2rem .35rem;font-size:.9rem}
    .itw-nav .menu a{display:block;padding:.45rem .6rem;border-radius:.6rem;color:var(--ink);text-decoration:none}
    .itw-nav .menu a:hover{background:#f2f7fa;text-decoration:none}

    .hero{position:relative;width:100%;min-height:clamp(200px,24vw,340px);background:url('/assets/index_hero.jpg?v=3.010.072') center 38%/cover no-repeat;display:flex;align-items:flex-end;overflow:hidden;margin-top:.15rem;z-index:0}
    .hero-title{position:absolute;left:min(3vw,1rem);bottom:clamp(.6rem,2vw,1.4rem);display:flex;flex-direction:column;align-items:flex-start;gap:.35rem;text-shadow:0 2px 6px rgba(0,0,0,.45)}
    .hero-title .logo{width:clamp(189px,23.1vw,378px);max-width:min(90vw,520px);filter:drop-shadow(0 3px 8px rgba(0,0,0,.45))}
    .tagline{font-weight:700;letter-spacing:.2px;color:#e6f4f8;font-size:clamp(.9rem,1.5vw,1.35rem);white-space:nowrap}
    .hero-compass{position:absolute;right:min(3vw,1rem);top:.5rem;width:86px;opacity:.95;filter:invert(39%) sepia(9%) saturate(1063%) hue-rotate(151deg) brightness(92%) contrast(89%)}
    .hero-credit{position:absolute;right:.85rem;bottom:.85rem;z-index:2}

    .page-grid{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(260px,var(--rail-width));gap:2rem;align-items:start}
    @media (max-width:979.98px){.page-grid{grid-template-columns:1fr}}

    /* Inputs */
    .inputs .row{display:grid;grid-template-columns:1fr auto;align-items:center;padding:10px 0;border-bottom:1px dashed var(--bd);gap:10px}
    .inputs .row:last-child{border-bottom:0}
    .inputs input[type="text"], .inputs input[type="number"]{width:110px;padding:6px 8px;border:1px solid var(--bd);border-radius:8px;font:inherit;background:#fff;min-height:44px;font-size:16px}
    .inputs select{padding:6px 8px;border:1px solid var(--bd);border-radius:8px;font:inherit;background:#fff;color:var(--ink)}
    .controls-inline{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
    .btn{cursor:pointer;padding:8px 12px;border:1px solid var(--bd);border-radius:8px;background:#0f172a;color:#fff;font-weight:700;min-height:44px;font-size:1rem}
    .btn.ghost{background:#fff;color:#0f172a}
    .btn-step{inline-size:36px;block-size:36px;border:1px solid var(--bd);border-radius:8px;background:#fff;font-weight:800;cursor:pointer}
    .input-stepper{display:flex;gap:6px;align-items:center}

    /* Packages */
    .packages{display:grid;gap:12px}
    .pkg{border:2px solid var(--rope);border-radius:12px;padding:12px;background:#fff;box-shadow:var(--shadow)}
    .pkg .phd{display:flex;align-items:center;justify-content:space-between;gap:10px}
    .pkg .phd h3{margin:0;color:var(--sea)}
    .pkg .price{font-weight:800}
    .pkg .inc{display:inline-block;margin-left:8px;padding:3px 8px;border-radius:999px;border:1px solid var(--rope);background:var(--foam);font-size:.8rem;font-weight:700}
    .pkg.winner{outline:3px solid #22c55e; outline-offset:2px; box-shadow:0 0 0 4px rgba(34,197,94,.15)}
    .pkg .edit{margin-top:8px;display:flex;gap:6px;align-items:center}
    .pkg .edit input{width:110px;padding:6px 8px;border:1px solid var(--bd);border-radius:8px}
    .pkg .foot{margin-top:8px}
    .pkg .breakeven{margin-top:8px}

    #breakeven-wrap{margin-top:18px;position:relative;line-height:0;overflow:hidden}
    #breakeven-chart{width:100%!important;max-width:100%;height:280px;border:1px dashed var(--bd);border-radius:10px;background:#fff;display:block}
    #voucher-badge{position:absolute;top:-8px;right:0;transform:translateY(-100%)}

    /* Rail */
    .rail-list{display:grid;gap:1rem}
    .author-card{display:flex;gap:.75rem;align-items:center}
    .author-avatar{display:block;width:56px;height:56px;border-radius:10px;object-fit:cover;object-position:center;flex:0 0 56px}

    /* Printing */
    @media print{
      body{font-size:12pt;background:var(--card)}
      header.hero-header,.qs,.banner,.rail,.controls-inline .btn,footer{display:none}
      main.wrap{max-width:100%;margin:0;padding:0}
      .page-grid{grid-template-columns:1fr}
      .card{border:none;box-shadow:none;page-break-inside:avoid}
    }

    /* Force brand light even if OS is dark */
    @media (prefers-color-scheme: dark){
      :root{color-scheme:light}
      body,.card{background:var(--sky)!important;color:var(--ink)!important}
      .card{background:var(--card)!important}
    }
  </style>

  <!-- Chart.js (local optional + CDN fallback) -->
  <script
    src="/vendor/chart.umd.min.js?v=.9.001.008"
    defer
    onerror="(function(){var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js';s.defer=true;document.head.appendChild(s);})()"
  ></script>

  <!-- Math & worker (versions aligned) -->
  <link rel="modulepreload" href="/assets/js/drink-math.js?v=.9.001.008">
  <link rel="preload" href="/assets/js/drink-worker.js?v=.9.001.008" as="worker"/>
  <script type="module">
    import { compute as baseCompute, computeWithVouchers } from "/assets/js/drink-math.js?v=.9.001.008";
    window.ITW_MATH = { compute: baseCompute, computeWithVouchers };
  </script>

  <!-- App (your controller) -->
  <script src="/assets/js/drink-calculator.app.js?v=.9.001.008" defer></script>
</head>
<body>
  <div id="a11y-status" class="sr-only" aria-live="polite"></div>
  <a href="#content" class="sr-only">Skip to main content</a>

  <header class="hero-header" role="banner" style="padding-top:.15rem">
    <div class="navbar">
      <div class="brand">
        <img src="/assets/logo_wake.png" width="256" height="64" alt="In the Wake wordmark">
        <span class="tiny version-badge" id="app-version-header">v=.9.001.008</span>
      </div>
      <nav class="itw-nav" aria-label="Primary">
        <div class="nav-item"><a class="chip" href="/">Home</a></div>
        <div class="nav-item" aria-haspopup="menu">
          <button class="chip focusable" type="button" aria-expanded="false" aria-haspopup="menu" aria-controls="menu-planning">Planning ▾</button>
          <div id="menu-planning" class="menu" aria-label="Planning">
            <div class="label">Plan your cruise</div>
            <a href="/planning.html">Planning (overview)</a>
            <a href="/ships.html">Ships</a>
            <a href="/restaurants.html">Restaurants &amp; Menus</a>
            <a href="/ports.html">Ports</a>
            <a href="/drink-calculator.html" aria-current="page">Drink Packages</a>
            <a href="/packing-lists.html">Packing Lists</a>
            <a href="/accessibility.html">Accessibility</a>
          </div>
        </div>
        <div class="nav-item" aria-haspopup="menu">
          <button class="chip focusable" type="button" aria-expanded="false" aria-haspopup="menu" aria-controls="menu-travel">Travel ▾</button>
          <div id="menu-travel" class="menu" aria-label="Travel">
            <div class="label">On the way</div>
            <a href="/travel.html">Travel (overview)</a>
            <a href="/solo.html">Solo</a>
          </div>
        </div>
        <div class="nav-item"><a class="chip" href="/about-us.html">About</a></div>
      </nav>
    </div>

    <div class="hero" role="img" aria-label="Ship wake at sunrise">
      <div class="hero-title">
        <img class="logo" src="/assets/logo_wake.png" alt="In the Wake">
        <div class="tagline">A Cruise Traveler’s Logbook</div>
      </div>
      <img class="hero-compass" src="/assets/compass_rose.svg" alt="Compass rose" onerror="this.onerror=null;this.src='/assets/compass_rose.png'">
      <div class="hero-credit tiny" style="display:block;opacity:.85;">Photo © Flickers of Majesty</div>
    </div>
  </header>

  <main class="wrap page-grid" id="content">
    <section aria-label="Calculator">
      <!-- Quick start -->
      <section class="card qs" aria-labelledby="qs-title" style="background:var(--foam);border-color:var(--rope)">
        <h2 id="qs-title" class="small" style="margin:0 0 .25rem 0;color:#7c2d12;">🚀 Quick Start: Load a Preset</h2>
        <p class="small" style="margin:0 0 .75rem 0;">Tap a preset to preview. “Load as Average” fills Simple mode. “Load as Itinerary” fills Day-by-Day.</p>
        <div class="qs-grid" id="qs-preset-buttons" role="list"></div>
        <div id="qs-details-host" class="tiny muted" style="margin-top:.5rem;"></div>
      </section>

      <!-- Best value banner -->
      <div class="card banner" role="status" aria-live="polite" style="display:flex;align-items:center;gap:.75rem;background:#fff7ed;border-color:#fdba74">
        <span id="best-chip" class="small" style="background:#ecfccb;border:1px solid #a3e635;border-radius:999px;padding:2px 8px;font-weight:800;color:#3f6212;">Best value: à-la-carte</span>
        <span id="best-text" class="small">Your daily picks are cheapest without a package.</span>
        <button id="jump-winner" class="btn ghost" type="button">Jump to Best Value</button>
      </div>

      <!-- Health / freshness -->
      <p id="fallback-banner" class="small" role="status" hidden style="background:#fffbeb;border:2px solid #fde68a;border-radius:10px;padding:.6rem">⚠️ We couldn't load live prices; using defaults.</p>
      <p id="stale-data-banner" class="small" role="status" style="display:none;background:#fef3c7;border:2px solid #fde68a;border-radius:10px;padding:.6rem;color:#92400e;"></p>
      <p id="health-note" class="small" role="status" aria-live="assertive"></p>

      <!-- Inputs + modes -->
      <section class="card inputs" aria-labelledby="calc-title">
        <h2 id="calc-title" class="hd" style="margin-top:0;">
          <span id="totals">Calculating...</span>
          <small class="small">– includes 18% gratuity</small>
          <div id="range-note" class="small" style="margin-top:6px;font-weight:700;"></div>
        </h2>

        <div class="bd">
          <div class="controls-inline" style="margin-top:8px;align-items:center;flex-wrap:wrap;">
            <label class="small" for="currency-select" style="font-weight:800;">Display currency</label>
            <select id="currency-select" aria-label="Display currency" class="small focusable" style="font-weight:700;padding:4px 6px;border-radius:8px;border:1px solid var(--bd);">
              <option value="USD">USD $</option><option value="GBP">GBP £</option><option value="EUR">EUR €</option><option value="CAD">CAD $</option><option value="AUD">AUD $</option>
            </select>
            <span id="offline-chip" class="small" style="display:none;background:#fde68a;color:#7c2d12;border:1px solid #f59e0b;padding:2px 6px;border-radius:999px;">Offline rates</span>
            <span id="currency-note" class="tiny" style="font-weight:600;margin-left:6px;"></span>
          </div>

          <hr style="border:0;border-top:1px dashed var(--bd);margin:12px 0;">

          <div class="row">
            <label for="input-days">Cruise days</label>
            <input id="input-days" type="text" inputmode="numeric" value="7" data-input="days" aria-label="Cruise length in days" class="focusable">
          </div>

          <fieldset id="sea-port-fieldset" style="border:1px solid var(--bd);padding:12px;border-radius:10px;margin-top:8px">
            <legend style="font-weight:800;padding:0 6px">Sea/Port variability</legend>
            <div class="row">
              <label for="input-seadays">Number of sea days</label>
              <input id="input-seadays" type="text" inputmode="numeric" value="3" data-input="seadays" aria-label="Number of sea days" class="focusable">
            </div>
            <div class="row" style="grid-template-columns:1fr 1fr">
              <label><input type="checkbox" id="sea-toggle" checked data-input="seaapply" class="focusable"> Apply weighting</label>
              <div class="controls-inline">
                <label for="sea-weight" class="small">Weight ±%</label>
                <input id="sea-weight" type="range" min="0" max="40" value="20" data-input="seaweight" aria-label="Sea day weighting percent" class="focusable">
                <span id="sea-weight-val" class="small">20%</span>
              </div>
            </div>
          </fieldset>

          <fieldset style="border:1px solid var(--bd);padding:12px;border-radius:10px;margin-top:12px">
            <legend style="font-weight:800;padding:0 6px">Group in stateroom</legend>
            <div class="row"><label for="input-adults">Adults (21+)</label><input id="input-adults" type="text" inputmode="numeric" value="1" data-input="adults" aria-label="Number of adults" class="focusable"></div>
            <div class="row"><label for="input-minors">Minors (under 21)</label><input id="input-minors" type="text" inputmode="numeric" value="0" data-input="minors" aria-label="Number of minors" class="focusable"></div>
          </fieldset>

          <!-- Vouchers -->
          <details id="cna-vouchers" class="small" style="border:2px solid var(--rope);border-radius:8px;padding:0;margin-top:12px;background:var(--foam)">
            <summary id="cna-title" class="focusable" style="cursor:pointer;font-weight:700;padding:1rem 1.25rem;list-style:none;">🎖️ <strong>Diamond or higher?</strong> Click to apply your daily free-drink vouchers<div class="tiny muted" style="font-weight:400;margin-top:4px;">For frequent Royal Caribbean cruisers only (Crown & Anchor). Minors’ vouchers apply to non-alcoholic drinks only.</div></summary>
            <div class="cna-content" style="padding:0 1.25rem 1.25rem">
              <div class="small" style="margin:10px 0;background:#fff3cd;border-left:4px solid #f59e0b;padding:.75rem 1rem;border-radius:4px;">
                <p><strong>Eligibility reference:</strong> Diamond ≈ <strong>80 nights</strong>, Diamond Plus ≈ <strong>175 points</strong>, Pinnacle Club ≈ <strong>700 nights</strong>.</p>
                <p>Per person per day · Diamond 4 · Diamond Plus 5 · Pinnacle 5. Minors’ vouchers apply to non-alcoholic drinks only.</p>
              </div>
              <fieldset style="border:1px solid var(--bd);padding:12px;border-radius:10px;">
                <legend style="font-weight:800;padding:0 6px">Adult Vouchers</legend>
                <div class="row"><label for="v-adult-d">Adults with Diamond (4)</label><input id="v-adult-d" type="text" inputmode="numeric" value="0" aria-label="Adults with Diamond" ></div>
                <div class="row"><label for="v-adult-dp">Adults with Diamond+ (5)</label><input id="v-adult-dp" type="text" inputmode="numeric" value="0" aria-label="Adults with Diamond Plus"></div>
                <div class="row"><label for="v-adult-p">Adults with Pinnacle (5)</label><input id="v-adult-p" type="text" inputmode="numeric" value="0" aria-label="Adults with Pinnacle"></div>
              </fieldset>
              <fieldset style="border:1px solid var(--bd);padding:12px;border-radius:10px;margin-top:12px;">
                <legend style="font-weight:800;padding:0 6px">Minor Vouchers (Non-Alc Only)</legend>
                <div class="row"><label for="v-minor-d">Minors with Diamond (4)</label><input id="v-minor-d" type="text" inputmode="numeric" value="0" aria-label="Minors with Diamond"></div>
                <div class="row"><label for="v-minor-dp">Minors with Diamond+ (5)</label><input id="v-minor-dp" type="text" inputmode="numeric" value="0" aria-label="Minors with Diamond Plus"></div>
                <div class="row"><label for="v-minor-p">Minors with Pinnacle (5)</label><input id="v-minor-p" type="text" inputmode="numeric" value="0" aria-label="Minors with Pinnacle"></div>
              </fieldset>
            </div>
          </details>

          <div id="cna-nudge" class="small" style="display:none;background:#e0f2fe;border:2px solid #0ea5e9;color:#0c4a6e;border-radius:10px;padding:.6rem;cursor:pointer;">🎖️ Are you a Diamond member? Don’t forget to <strong>click here to apply</strong> your free daily drinks!</div>

          <!-- Mode -->
          <fieldset style="border:1px solid var(--bd);padding:12px;border-radius:10px;margin-top:12px">
            <legend style="font-weight:800;padding:0 6px">Calculation Mode</legend>
            <div class="controls-inline">
              <label class="small"><input type="radio" name="calc-mode" id="mode-simple" value="simple" checked> Use Daily Averages</label>
              <label class="small"><input type="radio" name="calc-mode" id="mode-itinerary" value="itinerary"> Plan Day-by-Day</label>
            </div>
          </fieldset>

          <!-- Simple mode (daily average) inputs -->
          <div id="simple-inputs"></div>

          <!-- Itinerary mode container (rendered by app.js) -->
          <div id="itinerary-inputs" style="display:none;margin-top:12px;"></div>

          <!-- Chart -->
          <div id="breakeven-wrap">
            <span id="voucher-badge" class="small" aria-live="polite" hidden></span>
            <table id="chart-desc" class="sr-only">
              <caption>Daily cost comparison</caption>
              <thead><tr><th>Package</th><th>Cost per day</th></tr></thead>
              <tbody>
                <tr><td>À-la-carte</td><td id="sr-alc">$0.00</td></tr>
                <tr><td>Soda</td><td id="sr-soda">$0.00</td></tr>
                <tr><td>Refreshment</td><td id="sr-refresh">$0.00</td></tr>
                <tr><td>Deluxe</td><td id="sr-deluxe">$0.00</td></tr>
              </tbody>
            </table>
            <canvas id="breakeven-chart" width="900" height="280" aria-label="Break-even comparison chart" aria-describedby="chart-desc"></canvas>
          </div>

          <!-- Actions -->
          <div class="controls-inline" style="margin-top:12px">
            <button class="btn" type="button" onclick="printResults()">Print / Save Results</button>
            <button class="btn ghost" type="button" onclick="shareScenario()">Share Scenario</button>
            <button class="btn" type="button" onclick="resetInputs()" style="background:var(--bad)">Reset All</button>
          </div>
        </div>
      </section>

      <!-- Group Breakdown -->
      <section class="card" id="group-breakdown" hidden>
        <h2 style="margin:0 0 1rem 0;color:var(--sea);font-size:1.25rem;">Group Breakdown (Per Person)</h2>
        <div class="bd" style="padding:0;overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;min-width:500px;">
            <thead style="text-align:left;border-bottom:2px solid var(--rope);">
              <tr>
                <th style="padding:8px">Traveler</th>
                <th style="padding:8px">Assigned Package</th>
                <th style="padding:8px">Daily Cost</th>
                <th style="padding:8px">Trip Total</th>
              </tr>
            </thead>
            <tbody id="group-table-body"></tbody>
          </table>
        </div>
      </section>

      <!-- Package tiles (rendered here so .app.js can update) -->
      <section class="card" aria-labelledby="packages-title">
        <h2 id="packages-title" class="small" style="margin:0 0 .5rem 0;">Package Comparison</h2>
        <section class="packages" id="packages-cards">
          <!-- Soda -->
          <article class="pkg" id="pkg-soda" data-card="soda" aria-live="polite">
            <div class="phd">
              <h3>Soda Package</h3>
              <div class="price"><span data-pkg-price="soda">$0/day</span></div>
            </div>
            <div class="tiny muted">Includes: fountain soda • Coca-Cola Freestyle</div>
            <div class="edit">
              <button class="btn ghost" type="button" onclick="togglePriceEdit('soda')">Edit price…</button>
              <form id="edit-soda" hidden onsubmit="return false;">
                <label class="sr-only" for="edit-soda-val">Soda price/day</label>
                <input id="edit-soda-val" type="text" inputmode="decimal" placeholder="13.99">
                <button class="btn" type="button" onclick="savePackagePrice('soda')">Save</button>
                <button class="btn ghost" type="button" onclick="togglePriceEdit('soda',true)">Cancel</button>
              </form>
            </div>
            <div class="foot">
              <span class="inc" title="Value included per day"><strong data-inc="soda">$0/day</strong> included</span>
              <div id="soda-breakeven" class="breakeven small"></div>
            </div>
          </article>

          <!-- Refreshment -->
          <article class="pkg" id="pkg-refresh" data-card="refresh" aria-live="polite">
            <div class="phd">
              <h3>Refreshment Package</h3>
              <div class="price"><span data-pkg-price="refresh">$0/day</span></div>
            </div>
            <div class="tiny muted">Includes: soda • specialty coffee/tea • fresh juice • mocktails • milkshakes • bottled water • energy drinks</div>
            <div class="edit">
              <button class="btn ghost" type="button" onclick="togglePriceEdit('refresh')">Edit price…</button>
              <form id="edit-refresh" hidden onsubmit="return false;">
                <label class="sr-only" for="edit-refresh-val">Refreshment price/day</label>
                <input id="edit-refresh-val" type="text" inputmode="decimal" placeholder="34.00">
                <button class="btn" type="button" onclick="savePackagePrice('refresh')">Save</button>
                <button class="btn ghost" type="button" onclick="togglePriceEdit('refresh',true)">Cancel</button>
              </form>
            </div>
            <div class="foot">
              <span class="inc" title="Value included per day"><strong data-inc="refresh">$0/day</strong> included</span>
              <div id="refresh-breakeven" class="breakeven small"></div>
            </div>
          </article>

          <!-- Deluxe -->
          <article class="pkg" id="pkg-deluxe" data-card="deluxe" aria-live="polite">
            <div class="phd">
              <h3>Deluxe Beverage Package</h3>
              <div class="price"><span data-pkg-price="deluxe">$0/day</span></div>
            </div>
            <div class="tiny muted">Alcohol up to cap <span id="cap-badge" class="small" style="font-weight:800">$14.00</span> (pre-grat) is included • over-cap difference applies</div>
            <div class="edit">
              <button class="btn ghost" type="button" onclick="togglePriceEdit('deluxe')">Edit price…</button>
              <form id="edit-deluxe" hidden onsubmit="return false;">
                <label class="sr-only" for="edit-deluxe-val">Deluxe price/day</label>
                <input id="edit-deluxe-val" type="text" inputmode="decimal" placeholder="85.00">
                <button class="btn" type="button" onclick="savePackagePrice('deluxe')">Save</button>
                <button class="btn ghost" type="button" onclick="togglePriceEdit('deluxe',true)">Cancel</button>
              </form>
            </div>

            <div class="edit" style="margin-top:4px;">
              <button class="btn ghost" type="button" onclick="toggleCapEdit()">Edit cap…</button>
              <form id="edit-cap" hidden onsubmit="return false;">
                <label class="sr-only" for="edit-cap-val">Deluxe cap (pre-grat)</label>
                <input id="edit-cap-val" type="text" inputmode="decimal" placeholder="14.00">
                <button class="btn" type="button" onclick="saveCap()">Save</button>
                <button class="btn ghost" type="button" onclick="toggleCapEdit(true)">Cancel</button>
              </form>
            </div>

            <div class="foot">
              <span class="inc" title="Value included per day"><strong data-inc="deluxe">$0/day</strong> included</span>
              <span class="small" style="margin-left:8px;">Over-cap est: <strong id="overcap-est">$0/day</strong></span>
              <div id="deluxe-breakeven" class="breakeven small"></div>
            </div>
          </article>
        </section>
      </section>

      <!-- Stewardship / Pricing -->
      <section class="card small" role="note" aria-label="Disclaimers" style="background:var(--foam);border-color:var(--rope)">
        <p><strong>Stewardship & Responsible Use.</strong> This tool exists to help you plan wisely — not to encourage excess. Beverage packages include far more than alcohol (water, specialty coffee, juice, smoothies). Hydrate, pace yourself, and look out for your cabin mates. <em>Moderation honors your wallet, your body, and your spirit.</em></p>
        <p class="tiny" style="margin-top:1rem;"><strong>Pricing & Policy Notes.</strong> Figures shown are estimates based on recent promotions and community reporting. Actual prices, caps, gratuities, and taxes vary by ship, itinerary, and sale window. Some venues and beverages may be excluded or priced above the Deluxe cap. Nothing here is financial or legal advice. <strong>Packages can only be purchased directly from Royal Caribbean</strong> in Cruise Planner (My Account → Plan My Cruise → Beverages). Always verify your current Cruise Planner offer before purchasing.</p>
      </section>
    </section>

    <aside class="rail" aria-label="Author & articles">
      <section id="author-rail" class="card" aria-label="Author information">
        <div class="author-card">
          <picture>
            <source type="image/webp" srcset="/authors/img/ken1.webp">
            <img class="author-avatar" src="/authors/img/ken1.jpg" width="56" height="56" alt="Author — Ken Baker" onerror="this.onerror=null;this.src='/assets/logo_wake.png';">
          </picture>
          <div>
            <strong style="color:var(--ink);"><a href="/authors/ken-baker.html">Ken Baker</a></strong><br/>
            <span class="tiny">Founder of In the Wake; calculator builder and data steward.</span>
          </div>
        </div>
      </section>

      <section class="card" aria-labelledby="email-title" style="background:var(--foam);border-color:var(--rope)">
        <h3 id="email-title" style="margin-top:0;">Get Our Free Cruise Checklist!</h3>
        <p class="small" style="line-height:1.3;">Join our list for exclusive tips and get your downloadable PDF instantly.</p>
        <form id="email-form" action="[YOUR_ESP_URL_HERE]" method="POST" style="margin-top:10px;">
          <label for="honeypot" class="sr-only">Leave blank</label>
          <input type="text" id="honeypot" name="b_email" tabindex="-1" value="" style="position:absolute;left:-9999px;" aria-hidden="true">
          <div class="form-group" style="display:flex;gap:6px;">
            <label for="email" class="sr-only">Email</label>
            <input type="email" id="email" name="EMAIL" placeholder="your@email.com" required style="flex:1;min-width:0;padding:8px;border-radius:8px;border:1px solid var(--bd);font-size:16px;">
            <button type="submit" id="signup-button" class="btn" style="min-height:44px;">Get List</button>
          </div>
          <label class="gdpr-consent" style="display:flex;align-items:flex-start;gap:.5rem;font-size:.9rem;line-height:1.5;margin-top:.75rem;">
            <input type="checkbox" name="OPT_IN" value="1" required>
            <span>I agree to receive emails from In the Wake. <a href="/privacy.html" target="_blank">Privacy Policy</a> | <a href="/gdpr-rights.html" target="_blank">Your Rights</a></span>
          </label>
          <input type="hidden" name="SAVINGS" id="email-savings">
          <input type="hidden" name="RECOMMENDATION" id="email-rec">
          <input type="hidden" name="CRUISE_DAYS" id="email-days">
          <input type="hidden" name="CALC_URL" id="email-url">
          <input type="hidden" name="tags[]" value="calculator-user">
          <div id="signup-message" role="status" class="small" style="margin-top:6px;font-weight:700;"></div>
        </form>
      </section>

      <!-- Packages in Rail (requested placement) -->
      <section class="card" aria-labelledby="packages-rail-title">
        <div id="packages-rail-title" class="hd" style="position:static;">Packages</div>
        <div class="bd">
          <!-- Anchor tile list (links to the three tiles above) -->
          <ul class="tiny" style="margin:0;padding-left:1rem;line-height:1.5;">
            <li><a href="#pkg-soda">Soda Package</a></li>
            <li><a href="#pkg-refresh">Refreshment Package</a></li>
            <li><a href="#pkg-deluxe">Deluxe Beverage Package</a></li>
          </ul>
        </div>
      </section>

      <section class="card" aria-labelledby="recent-rail-title">
        <h2 id="recent-rail-title" class="tiny" style="margin:.25rem 0 .5rem;color:#0a3d62">Recent Articles</h2>
        <div id="recent-rail" class="rail-list" aria-live="polite">
          <p class="tiny muted">Loading articles...</p>
        </div>
      </section>

      <section class="card">
        <div class="hd" style="position:static;">FAQ (quick)</div>
        <div class="bd small">
          <p><strong>Why must adults in a cabin buy the same package?</strong><br>Royal Caribbean requires it to prevent sharing.</p>
          <p><strong>Can I buy onboard?</strong><br>Yes, but pre-cruise prices in Cruise Planner are almost always cheaper.</p>
        </div>
      </section>
    </aside>
  </main>

  <footer class="wrap" role="contentinfo" style="border-top:2px solid var(--bd);padding-top:1.5rem;margin-top:1rem;text-align:center;">
    <p>© <span id="footer-year">2025</span> In the Wake — A Cruise Traveler’s Logbook. <strong>All rights reserved.</strong><br>Reproduction, scraping, or derivative reuse of this calculator, math, or design without explicit written permission is prohibited.</p>
    <p class="tiny" style="margin-top:1rem;"><a href="/terms.html">Terms of Service</a> | <a href="/privacy.html">Privacy Policy</a> | <a href="/gdpr-rights.html">GDPR Rights</a></p>
  </footer>

  <!-- Inline glue: nav, simple-inputs, presets/personas, recent articles, email telemetry -->
  <script>
    /* ---- Nav interactions (keyboard + click, no blocked anchor nav) ---- */
    (function(){
      const root=document.querySelector('.itw-nav'); if(!root) return;
      const items=[...root.querySelectorAll('.nav-item[aria-haspopup]')];
      function setOpen(group,on){group.classList.toggle('open',!!on);const btn=group.querySelector('button[aria-controls]');if(btn) btn.setAttribute('aria-expanded',on?'true':'false');}
      function closeAll(except=null){items.forEach(g=>{if(g!==except) setOpen(g,false);});}
      function firstFocusable(el){return el&&el.querySelector('a,button,[tabindex]:not([tabindex="-1"])');}
      items.forEach(group=>{
        const btn=group.querySelector('button[aria-controls]');const menu=group.querySelector('.menu'); if(!btn||!menu) return;
        btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const open=group.classList.contains('open');closeAll(group);setOpen(group,!open);if(!open){(firstFocusable(menu)||btn).focus({preventScroll:true});}});
        btn.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();setOpen(group,true);(firstFocusable(menu)||btn).focus({preventScroll:true});} else if(e.key==='Escape'){setOpen(group,false);btn.focus({preventScroll:true});}});
        group.addEventListener('keydown',e=>{if(e.key==='Escape'){setOpen(group,false);btn.focus({preventScroll:true});}});
        menu.addEventListener('focusout',()=>{setTimeout(()=>{if(!group.contains(document.activeElement)) setOpen(group,false);},0);});
      });
      document.addEventListener('click',e=>{if(!e.target.closest('.itw-nav')) closeAll();});
      window.addEventListener('blur',()=>closeAll());
    })();

    /* ---- Footer year ---- */
    (function(){const y=document.getElementById('footer-year'); if(y) y.textContent=new Date().getFullYear();})();

    /* ---- Simple-mode inputs (12 categories) ---- */
    (function(){
      const container = document.getElementById('simple-inputs');
      if(!container) return;

      const DRINKS = [
        ['soda','Soda'],
        ['coffee','Coffee (specialty)'],
        ['teaprem','Specialty tea'],
        ['freshjuice','Fresh juice/smoothie'],
        ['mocktail','Mocktail'],
        ['energy','Energy drink'],
        ['milkshake','Milkshake'],
        ['bottledwater','Bottled water'],
        ['beer','Beer'],
        ['wine','Wine'],
        ['cocktail','Cocktail'],
        ['spirits','Spirits']
      ];

      const grid = document.createElement('div');
      grid.setAttribute('role','group');
      DRINKS.forEach(([k,label])=>{
        const row = document.createElement('div');
        row.className = 'row row--stepper';
        const halfButtons = (k==='cocktail'); // allow ±0.5 for cocktails
        row.innerHTML = `
          <label class="small" style="line-height:1.2;">${label} <span class="tiny muted" data-price-pill="${k}"></span></label>
          <div class="input-stepper">
            <button class="btn-step" type="button" aria-label="Decrease ${label}" onclick="stepInput('${k}', ${halfButtons?'-0.5':'-1'})">−</button>
            <input class="focusable" type="text" inputmode="decimal" value="0" data-input="${k}" aria-label="${label} per day">
            <button class="btn-step" type="button" aria-label="Increase ${label}" onclick="stepInput('${k}', ${halfButtons?'+0.5':'+1'})">+</button>
          </div>
        `;
        grid.appendChild(row);
      });
      container.appendChild(grid);
    })();

    /* ---- Presets & Personas buttons ---- */
    (function(){
      const host = document.getElementById('qs-preset-buttons');
      if(!host) return;
      const btn = (txt, onClick, title='')=>{
        const b=document.createElement('button');
        b.type='button'; b.className='btn ghost'; b.textContent=txt; if(title) b.title=title;
        b.addEventListener('click', onClick);
        return b;
      };
      // Presets (daily averages)
      host.appendChild(btn('Light',   ()=>window.loadPreset && window.loadPreset('light')));
      host.appendChild(btn('Moderate',()=>window.loadPreset && window.loadPreset('moderate')));
      host.appendChild(btn('Heavy',   ()=>window.loadPreset && window.loadPreset('heavy')));
      host.appendChild(btn('Coffee Lover', ()=>window.loadPreset && window.loadPreset('coffee')));

      // Personas (group + mix)
      host.appendChild(btn('Family with Kids', ()=>window.applyPersona && window.applyPersona('family')));
      host.appendChild(btn('Girls Trip',       ()=>window.applyPersona && window.applyPersona('girls')));
      host.appendChild(btn('Boys Trip',        ()=>window.applyPersona && window.applyPersona('boys')));
      host.appendChild(btn('Romantic Couple',  ()=>window.applyPersona && window.applyPersona('romance')));
      host.appendChild(btn('Health-Conscious Solo', ()=>window.applyPersona && window.applyPersona('solo')));
      host.appendChild(btn('Senior Group',     ()=>window.applyPersona && window.applyPersona('seniors')));
    })();

    /* ---- Recent Articles (safe fallback) ---- */
    (function(){
      const rail = document.getElementById('recent-rail');
      if(!rail) return;

      const fallback = [
        { title:'Royal Caribbean Drink Packages: 2025 Guide', href:'/drink-packages.html', img:'/assets/ships/thumbs/vision-of-the-seas.jpg' },
        { title:'Solo Cruising: How to Plan Well', href:'/solo.html', img:'/assets/ships/thumbs/radiance-of-the-seas.jpg' },
        { title:'Packing Smarter: Embarkation Day', href:'/packing-lists.html', img:'/assets/ships/thumbs/brilliance-of-the-seas.jpg' }
      ];

      function render(list){
        rail.innerHTML='';
        list.slice(0,3).forEach(a=>{
          const card=document.createElement('a');
          card.href = a.href;
          card.className='small';
          card.style.cssText='display:flex;gap:.6rem;align-items:center;text-decoration:none;';
          card.innerHTML = `
            <img src="${a.img}" alt="" width="64" height="40" style="border-radius:6px;border:1px solid var(--bd);object-fit:cover;object-position:center;">
            <span>${a.title}</span>`;
          rail.appendChild(card);
        });
      }

      try{
        fetch('/data/recent.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{
          if(j && Array.isArray(j.articles)) render(j.articles); else render(fallback);
        }).catch(()=>render(fallback));
      }catch(_e){ render(fallback); }
    })();

    /* ---- Email telemetry ---- */
    (function(){
      function itwPopulateEmailTelemetry(){
        try{
          const byId=id=>document.getElementById(id);
          const rec=(window.ITW&&ITW.best&&ITW.best.name)||(window.ITW_BEST&&ITW_BEST.name)||'';
          const savings=(window.ITW&&ITW.best&&typeof ITW.best.delta==='number')?ITW.best.delta:((window.ITW_BEST&&ITW_BEST.delta)||'');
          const days=(window.ITW&&ITW.inputs&&ITW.inputs.days)||(document.querySelector('[data-input="days"]')?.value)||'';
          byId('email-rec')&&(byId('email-rec').value=String(rec));
          byId('email-savings')&&(byId('email-savings').value=String(savings));
          byId('email-days')&&(byId('email-days').value=String(days));
          byId('email-url')&&(byId('email-url').value=location.href);
        }catch(e){console.error('Email telemetry failed:',e);}
      }
      const form=document.getElementById('email-form');
      if(form){form.addEventListener('submit',function(){itwPopulateEmailTelemetry();},{capture:true});}
      window.itwPopulateEmailTelemetry=itwPopulateEmailTelemetry;
    })();// sw-bridge.js (v10)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(reg => {
    if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    reg.addEventListener('updatefound', () => {
      const sw = reg.installing;
      sw && sw.addEventListener('statechange', () => {
        if (sw.state === 'installed' && navigator.serviceWorker.controller) {
          // Option A: prompt user; Option B: auto-reload
          // location.reload();
        }
      });
    });
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Guard to avoid loops if you auto-reload above
  });
}
  </script>
</body>
</html>
