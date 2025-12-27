# Ship Page Checklist — v3.010

**Version:** 3.010.300
**Reference Page:** `/ships/rcl/radiance-of-the-seas.html`
**Purpose:** Ensure visual and functional compliance for new ship pages

---

## Quick Reference Variables

When creating a new ship page, replace these variables throughout:

| Variable | Example | Description |
|----------|---------|-------------|
| `{{SHIP_NAME}}` | Radiance of the Seas | Full ship name |
| `{{SHIP_SLUG}}` | radiance-of-the-seas | URL-safe slug |
| `{{SHIP_CLASS}}` | Radiance Class | Ship class name |
| `{{CRUISE_LINE}}` | Royal Caribbean | Cruise line name |
| `{{CRUISE_LINE_SLUG}}` | rcl | Line abbreviation (rcl, ccl, ncl, etc.) |
| `{{IMO}}` | 9195195 | IMO number for live tracking |
| `{{GT}}` | 90,090 GT | Gross tonnage |
| `{{GUESTS}}` | 2,466 | Guest capacity (double occupancy) |
| `{{CREW}}` | 860 | Crew count |
| `{{YEAR}}` | 2001 | Year entered service |
| `{{LENGTH}}` | 962 ft (293 m) | Ship length |
| `{{BEAM}}` | 106 ft (32 m) | Ship beam |
| `{{REGISTRY}}` | Bahamas | Flag registry |
| `{{RATING}}` | 4.6 | Editorial rating (1-5) |
| `{{SIBLINGS}}` | Brilliance, Serenade, Jewel | Sister ships |

---

## Section 1: Document Foundation (Lines 1-35)

### 1.1 Theological Invocation (IMMUTABLE) ✝️

**Location:** Lines 1-9, before `<html>` tag
**Status:** REQUIRED — Cannot be modified or removed

```html
<!doctype html>
<!--
Soli Deo Gloria
All work on this project is offered as a gift to God.
"Trust in the LORD with all your heart, and do not lean on your own understanding." — Proverbs 3:5
"Whatever you do, work heartily, as for the Lord and not for men." — Colossians 3:23

STANDARDS: Every Page v3.010.300 · Production Template · Unified Nav v3.010.300 · A11y/WCAG 2.1 AA Compliant
-->
```

**Checklist:**
- [ ] `<!doctype html>` on line 1
- [ ] "Soli Deo Gloria" present
- [ ] Proverbs 3:5 quoted
- [ ] Colossians 3:23 quoted
- [ ] STANDARDS line with version number
- [ ] Comment closes before `<html>` tag

---

### 1.2 HTML Root Element

**Location:** Line 10

```html
<html lang="en" class="no-js">
```

**Checklist:**
- [ ] `lang="en"` attribute present
- [ ] `class="no-js"` for progressive enhancement

---

### 1.3 AI-Breadcrumbs (Required for Ship Pages)

**Location:** Lines 12-25, inside `<head>` before other comments
**Spec:** `new-standards/v3.010/AI_BREADCRUMBS_SPECIFICATION.md`

```html
<!-- ai-breadcrumbs
     entity: Ship
     name: {{SHIP_NAME}}
     type: Ship Information Page
     parent: /ships.html
     category: {{CRUISE_LINE}} Fleet
     cruise-line: {{CRUISE_LINE}}
     ship-class: {{SHIP_CLASS}}
     siblings: {{SIBLINGS}}
     related: /ships.html, /cruise-lines/{{CRUISE_LINE_SLUG}}.html, /ports.html, /drink-calculator.html
     updated: {{YYYY-MM-DD}}
     expertise: {{CRUISE_LINE}} ship reviews, deck plans, dining analysis, cabin comparisons
     target-audience: Cruisers researching {{SHIP_NAME}} or comparing {{CRUISE_LINE}} ships
     answer-first: {{SHIP_NAME}} is a {{SHIP_CLASS}} ship ({{GT}}, {{GUESTS}} guests, launched {{YEAR}}) featuring [2-3 signature features], with deck plans, live tracking, dining venues, and video tours.
     -->
```

**Required Fields Checklist:**
- [ ] `entity:` — Must be exactly "Ship" (not the ship name)
- [ ] `name:` — Ship's full proper name (e.g., "Radiance of the Seas")
- [ ] `type:` — "Ship Information Page"
- [ ] `parent:` — "/ships.html"
- [ ] `category:` — "{{CRUISE_LINE}} Fleet"

**Recommended Fields Checklist:**
- [ ] `cruise-line:` — Cruise line name
- [ ] `ship-class:` — Ship class name
- [ ] `siblings:` — Sister ships (comma-separated)
- [ ] `related:` — Related pages
- [ ] `updated:` — ISO 8601 date (YYYY-MM-DD)
- [ ] `expertise:` — Domain knowledge areas
- [ ] `target-audience:` — Who this page is for
- [ ] `answer-first:` — One-sentence summary with key stats

**Format Requirements:**
- [ ] 5-space indentation before field names
- [ ] Colons followed by space
- [ ] No trailing comma on lists
- [ ] Close with `-->`

---

### 1.4 Header Comment Block

**Location:** Lines 26-34

```html
  <!-- ======================================================
       In the Wake — {{SHIP_NAME}} • {{CRUISE_LINE}}
       Version: 3.010.300  |  Soli Deo Gloria ✝️

       ✅ WCAG 2.1 Level AA Compliant
       ✅ SEO Optimized (JSON-LD, OpenGraph, Twitter Cards)
       ✅ Dropdown Menus with Hover Delay (300ms)
       ✅ AI-First SEO with E-E-A-T Person Schema
       ====================================================== -->
```

---

## Section 2: Head — Core Meta Tags (Lines 36-60)

### 2.1 Core Meta Tags

```html
  <!-- Core -->
  <meta charset="utf-8"/>
  <script>
  document.documentElement.classList.remove('no-js');
</script>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="referrer" content="no-referrer-when-downgrade"/>
```

**Checklist:**
- [ ] `charset="utf-8"` first meta tag
- [ ] no-js removal script
- [ ] viewport meta with `width=device-width,initial-scale=1`
- [ ] referrer policy

---

### 2.2 Robots & Crawling Meta

```html
  <!-- SEO: Robots & Crawling -->
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"/>
  <meta name="googlebot" content="index,follow"/>
  <meta name="bingbot" content="index,follow"/>
```

---

### 2.3 Theme & Appearance Meta

```html
  <!-- SEO: Theme & Appearance -->
  <meta name="color-scheme" content="light"/>
  <meta name="theme-color" content="#0e6e8e"/>
  <meta name="version" content="3.010.300"/>
  <meta name="author" content="In the Wake"/>
  <meta name="publisher" content="In the Wake"/>
```

---

### 2.4 ICP-Lite v1.4 Meta Tags (REQUIRED)

**Spec:** `new-standards/v3.010/ICP_LITE_v1.0_PROTOCOL.md`

```html
  <!-- ICP-Lite v1.4: AI-First Metadata -->
  <meta name="ai-summary" content="{{SHIP_NAME}}: deck plans, live tracker, dining venues, and stateroom videos. Plan your {{CRUISE_LINE}} cruise with In the Wake."/>
  <meta name="last-reviewed" content="{{YYYY-MM-DD}}"/>
  <meta name="content-protocol" content="ICP-Lite v1.4"/>
```

**Checklist:**
- [ ] `ai-summary` — Under 250 characters, factual, no marketing fluff
- [ ] `last-reviewed` — ISO 8601 date format (YYYY-MM-DD)
- [ ] `content-protocol` — Exactly "ICP-Lite v1.4"

---

## Section 3: Head — SEO Meta Tags (Lines 61-80)

### 3.1 Title & Description

```html
  <!-- Title & SEO -->
  <title>{{SHIP_NAME}} — Deck Plans, Live Tracker, Dining & Videos | In the Wake (v3.010.300)</title>
  <link rel="canonical" href="https://cruisinginthewake.com/ships/{{CRUISE_LINE_SLUG}}/{{SHIP_SLUG}}.html"/>
  <meta name="description" content="{{SHIP_NAME}}: deck plans, live tracker, dining venues, and stateroom videos. Plan your {{CRUISE_LINE}} cruise with In the Wake."/>
```

**Checklist:**
- [ ] Title format: `{{SHIP_NAME}} — Deck Plans, Live Tracker, Dining & Videos | In the Wake (v3.010.300)`
- [ ] Canonical URL is absolute with production hostname
- [ ] Description matches ai-summary content

---

### 3.2 OpenGraph Tags

```html
  <!-- OpenGraph -->
  <meta property="og:type" content="website"/>
  <meta property="og:site_name" content="In the Wake"/>
  <meta property="og:title" content="{{SHIP_NAME}} — Deck Plans, Live Tracker, Dining & Videos"/>
  <meta property="og:description" content="All the essentials for {{SHIP_NAME}}: live map, dining, stats, and videos."/>
  <meta property="og:url" content="https://cruisinginthewake.com/ships/{{CRUISE_LINE_SLUG}}/{{SHIP_SLUG}}.html"/>
  <meta property="og:locale" content="en_US"/>
  <meta property="og:image" content="https://cruisinginthewake.com/assets/ships/{{SHIP_SLUG}}1.webp"/>
```

**Checklist:**
- [ ] All 7 OG tags present
- [ ] og:image points to actual ship image (1200x630 recommended)
- [ ] og:url matches canonical

---

### 3.3 Twitter Card Tags

```html
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="{{SHIP_NAME}} — Deck Plans, Live Tracker, Dining & Videos"/>
  <meta name="twitter:description" content="Live tracker, dining, deck plans, and videos for {{SHIP_NAME}}."/>
  <meta name="twitter:image" content="https://cruisinginthewake.com/assets/ships/{{SHIP_SLUG}}1.webp"/>
```

---

## Section 4: Head — Analytics (Lines 81-92)

### 4.1 Google Analytics

```html
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-WZP891PZXJ"></script>
  <script>
    window.dataLayer=window.dataLayer||[];
    function gtag(){dataLayer.push(arguments);}
    gtag('js',new Date());
    gtag('config','G-WZP891PZXJ',{anonymize_ip:true});
  </script>
```

**Checklist:**
- [ ] `async` attribute on gtag script
- [ ] `anonymize_ip:true` for privacy

---

### 4.2 Umami Analytics

```html
  <!-- Umami (secondary analytics) -->
  <script defer src="https://cloud.umami.is/script.js" data-website-id="9661a449-3ba9-49ea-88e8-4493363578d2"></script>
```

---

## Section 5: Head — JSON-LD Structured Data (Lines 93-240)

### 5.1 Organization Schema (REQUIRED)

```html
  <!-- JSON-LD: Organization -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "In the Wake",
    "url": "https://cruisinginthewake.com",
    "logo": "https://cruisinginthewake.com/assets/logo_wake.png"
  }
  </script>
```

---

### 5.2 WebSite + SearchAction Schema (REQUIRED)

```html
  <!-- JSON-LD: WebSite + SearchAction -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "In the Wake",
    "url": "https://cruisinginthewake.com/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://cruisinginthewake.com/search.html?q={query}",
      "query-input": "required name=query"
    }
  }
  </script>
```

---

### 5.3 BreadcrumbList Schema (REQUIRED)

```html
  <!-- JSON-LD: BreadcrumbList -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://cruisinginthewake.com/"},
      {"@type": "ListItem", "position": 2, "name": "Ships", "item": "https://cruisinginthewake.com/ships.html"},
      {"@type": "ListItem", "position": 3, "name": "{{CRUISE_LINE}}", "item": "https://cruisinginthewake.com/cruise-lines/{{CRUISE_LINE_SLUG}}.html"},
      {"@type": "ListItem", "position": 4, "name": "{{SHIP_NAME}}", "item": "https://cruisinginthewake.com/ships/{{CRUISE_LINE_SLUG}}/{{SHIP_SLUG}}.html"}
    ]
  }
  </script>
```

**Checklist:**
- [ ] 4 breadcrumb items: Home → Ships → Cruise Line → Ship
- [ ] Position numbers sequential (1, 2, 3, 4)
- [ ] All URLs absolute

---

### 5.4 Review Schema (REQUIRED)

```html
  <!-- JSON-LD: Review -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Review",
    "name": "{{SHIP_NAME}} Overview",
    "author": {
      "@type": "Person",
      "name": "In the Wake Editorial Team"
    },
    "reviewBody": "{{SHIP_NAME}} delivers {{CRUISE_LINE}}'s signature [experience description] with [key features].",
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": {{RATING}},
      "bestRating": "5",
      "worstRating": "1"
    },
    "itemReviewed": {
      "@type": "Cruise",
      "name": "{{SHIP_NAME}}",
      "provider": {
        "@type": "Organization",
        "name": "{{CRUISE_LINE}} International",
        "url": "https://www.royalcaribbean.com"
      },
      "url": "https://cruisinginthewake.com/ships/{{CRUISE_LINE_SLUG}}/{{SHIP_SLUG}}.html",
      "description": "A {{SHIP_CLASS}} ship operated by {{CRUISE_LINE}} International, offering [itinerary description].",
      "image": "https://cruisinginthewake.com/assets/ships/{{SHIP_SLUG}}1.webp"
    }
  }
  </script>
```

**Critical:**
- [ ] `ratingValue` is a NUMBER (e.g., `4.6`), NOT a string (`"4.6"`)
- [ ] Only ONE Review block per page

---

### 5.5 Person Schema (E-E-A-T) (REQUIRED)

```html
  <!-- JSON-LD: Person (E-E-A-T) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Ken Baker",
    "url": "https://cruisinginthewake.com/authors/ken-baker.html",
    "jobTitle": "Founder and Editor",
    "description": "Traveler, pastor, and storyteller. Founder of In the Wake, a cruise traveler's logbook offering planning tools, travel tips, and faith-scented reflections for smoother sailings.",
    "image": "https://cruisinginthewake.com/authors/img/ken1.webp",
    "sameAs": ["https://www.flickersofmajesty.com"],
    "worksFor": {"@type": "Organization", "name": "In the Wake"},
    "knowsAbout": ["Cruise Planning", "{{CRUISE_LINE}}", "Cruise Ships", "Travel Writing"]
  }
  </script>
```

---

### 5.6 WebPage Schema (ICP-Lite) (REQUIRED)

```html
  <!-- JSON-LD: WebPage (ICP-Lite) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "{{SHIP_NAME}} — Deck Plans, Live Tracker, Dining & Videos",
    "url": "https://cruisinginthewake.com/ships/{{CRUISE_LINE_SLUG}}/{{SHIP_SLUG}}.html",
    "description": "{{SHIP_NAME}}: deck plans, live tracker, dining venues, and stateroom videos. Plan your {{CRUISE_LINE}} cruise with In the Wake."
  }
  </script>
```

---

### 5.7 FAQPage Schema (ICP-Lite) (REQUIRED — 5 Questions)

```html
  <!-- JSON-LD: FAQPage (ICP-Lite) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What makes {{SHIP_NAME}} unique compared to other {{CRUISE_LINE}} ships?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "[Answer about unique features, size comparison, experience]"
        }
      },
      {
        "@type": "Question",
        "name": "Which ships are in the same class as {{SHIP_NAME}}?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "{{SHIP_NAME}} is part of the {{SHIP_CLASS}}, which includes {{SIBLINGS}}. [Additional details]"
        }
      },
      {
        "@type": "Question",
        "name": "What dining options are available on {{SHIP_NAME}}?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "[Description of dining venues]"
        }
      },
      {
        "@type": "Question",
        "name": "Where does {{SHIP_NAME}} typically sail?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "[Itinerary description]"
        }
      },
      {
        "@type": "Question",
        "name": "How can I see {{SHIP_NAME}}'s current location?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Use the live ship tracker on this page to see the ship's current position, speed, and next port in real-time."
        }
      }
    ]
  }
  </script>
```

**Checklist:**
- [ ] Exactly 5 FAQ questions
- [ ] Questions match HTML FAQ section
- [ ] Answers are complete and factual

---

## Section 6: Head — Assets & Performance (Lines 241-411)

### 6.1 Favicon & PWA

```html
  <!-- Favicon / PWA -->
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/in_the_wake_icon_32x32.png"/>
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/apple-touch-icon.png"/>
  <link rel="manifest" href="/manifest.webmanifest"/>
```

---

### 6.2 Service Worker Registration

```html
  <!-- Service Worker Registration -->
  <script>
  if('serviceWorker' in navigator){
    window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
  }
  </script>
```

---

### 6.3 Global Stylesheet

```html
  <link rel="stylesheet" href="/assets/styles.css?v=3.010.300"/>
```

**Checklist:**
- [ ] Version query string matches site version

---

### 6.4 URL Normalizer Script (REQUIRED)

```html
  <!-- ===== Standards helpers (absolute URL + origin normalizer) ===== -->
  <script>
  (function(){
    const ORIGIN=(location.origin||(location.protocol+'//'+location.host)).replace(/\/$/,'');
    window._abs=function(path){ path=String(path||''); if(!path.startsWith('/')) path='/'+path; return ORIGIN+path; };

    document.addEventListener('DOMContentLoaded', function(){
      const sel=[
        'a[href^="https://cruisinginthewake.com/"]',
        'img[src^="https://cruisinginthewake.com/"]',
        'link[href^="https://cruisinginthewake.com/"]',
        'script[src^="https://cruisinginthewake.com/"]'
      ].join(',');
      document.querySelectorAll(sel).forEach(el=>{
        const attr=el.hasAttribute('href')?'href':'src';
        try{
          const u=new URL(el.getAttribute(attr));
          el.setAttribute(attr, ORIGIN+u.pathname+u.search+u.hash);
        }catch(_){}
      });
    },{once:true});
  })();
  </script>
```

---

### 6.5 Swiper with CDN Fallback (REQUIRED)

```html
  <!-- ===== Swiper (primary + CDN fallback) ===== -->
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
```

---

### 6.6 LCP Preloads

```html
  <!-- LCP Optimization: Preload critical hero images -->
  <link rel="preload" as="image" href="/assets/logo_wake_560.png" fetchpriority="high"/>
  <link rel="preload" as="image" href="/assets/compass_rose.svg?v=3.010.300" fetchpriority="high"/>
```

---

## Section 7: Body — Accessibility Foundation (Lines 413-420)

### 7.1 Body Tag

```html
<body class="page">
```

---

### 7.2 Skip Link (WCAG REQUIRED)

```html
  <!-- Skip Link -->
  <a href="#main-content" class="skip-link">Skip to main content</a>
```

---

### 7.3 ARIA Live Regions (WCAG REQUIRED)

```html
  <!-- ARIA Live Regions -->
  <div id="a11y-status" role="status" aria-live="polite" aria-atomic="true" class="sr-only"></div>
  <div id="a11y-alerts" role="alert" aria-live="assertive" aria-atomic="true" class="sr-only"></div>
```

---

## Section 8: Body — Header & Navigation (Lines 421-493)

### 8.1 Header with Banner Role

```html
  <!-- HEADER -->
  <header class="hero-header" role="banner">
```

---

### 8.2 Navigation Structure

```html
    <nav class="site-nav" aria-label="Main site navigation">
      <a class="nav-pill" href="/">Home</a>

      <!-- Planning Dropdown -->
      <div class="nav-dropdown" id="nav-planning">
        <button class="nav-pill" type="button" aria-expanded="false" aria-haspopup="true">
          Planning <span class="caret">&#9662;</span>
        </button>
        <div class="dropdown-menu" role="menu">
          <!-- Menu items -->
        </div>
      </div>
      <!-- ... more navigation ... -->
    </nav>
```

**Checklist:**
- [ ] `aria-label="Main site navigation"` on nav
- [ ] `aria-expanded="false"` on dropdown buttons
- [ ] `aria-haspopup="true"` on dropdown buttons
- [ ] `role="menu"` on dropdown menus

---

### 8.3 Hero Section

```html
    <div class="hero" role="img" aria-label="{{SHIP_NAME}} hero image">
      <div class="latlon-grid" aria-hidden="true">
        <!-- SVG grid -->
      </div>
      <img class="hero-compass" src="/assets/compass_rose.svg" alt="" aria-hidden="true"/>
      <div class="hero-title">
        <img class="logo" src="/assets/logo_wake_560.png" srcset="/assets/logo_wake_560.png 1x, /assets/logo_wake_1120.png 2x" alt="In the Wake" decoding="async" fetchpriority="high" width="560" height="567"/>
        <div class="tagline">A Cruise Traveler's Logbook</div>
      </div>
    </div>
```

**Checklist:**
- [ ] Hero div has `role="img"` and `aria-label`
- [ ] Decorative elements have `aria-hidden="true"`
- [ ] Logo has proper `alt`, `width`, `height`, `srcset`
- [ ] `fetchpriority="high"` on LCP images

---

## Section 9: Body — Main Content (Lines 495-921)

### 9.1 Main Element (WCAG REQUIRED)

```html
  <!-- MAIN CONTENT -->
  <main class="wrap page-grid" id="main-content" role="main" tabindex="-1">
```

**Checklist:**
- [ ] `id="main-content"` matches skip link target
- [ ] `role="main"` present
- [ ] `tabindex="-1"` for programmatic focus

---

### 9.2 Page Layout Grid

The page uses a 2-column grid on desktop (main content + right rail):

```html
<main style="display: grid; grid-template-columns: 1fr; gap: 2rem; align-items: start;">
  <style>
    @media (min-width: 980px) {
      .page-grid {
        grid-template-columns: 1fr 360px !important;
      }
    }
  </style>

  <!-- Right Rail (grid-column: 2) -->
  <aside class="rail" role="complementary" aria-label="Key facts, author & articles" style="grid-column: 2; grid-row: 1;">
    <!-- Rail content -->
  </aside>

  <!-- Main Content Column (grid-column: 1) -->
  <div style="grid-column: 1;">
    <!-- Main content -->
  </div>
</main>
```

---

### 9.3 H1 Heading (EXACTLY ONE)

```html
      <h1 style="font-size: clamp(1.6rem, 3vw, 2.1rem); color: var(--sea); margin: 0.75rem 0 0.5rem;">{{SHIP_NAME}} — Deck Plans, Live Tracker, Dining &amp; Videos</h1>
```

**Checklist:**
- [ ] Exactly ONE H1 per page
- [ ] H1 matches page title
- [ ] Uses `&amp;` for ampersand

---

### 9.4 Required Content Sections

Each ship page MUST have these sections:

#### 9.4.1 Page Intro / Quick Answer

```html
    <section class="page-intro" aria-label="{{SHIP_NAME}} overview">
      <h1>{{SHIP_NAME}} — Deck Plans, Live Tracker, Dining &amp; Videos</h1>

      <p style="...">
        <strong style="...">Looking for {{SHIP_NAME}} planning info?</strong>
        <span>This page covers deck plans, live ship tracking, dining venues, and video tours...</span>
      </p>

      <p>
        {{SHIP_NAME}} tends to suit travelers who prefer [ship characteristics].
        It's ideal if you want [benefits]. If you're looking for [alternatives], you may want to explore [other options].
      </p>
    </section>
```

#### 9.4.2 First Look Photo Carousel

```html
      <section class="card" aria-labelledby="first-look">
        <h2 id="first-look">A First Look</h2>

        <div class="swiper firstlook" aria-label="{{SHIP_NAME}} photo carousel">
          <div class="swiper-wrapper">
            <div class="swiper-slide">
              <figure>
                <img src="/assets/ships/{{SHIP_SLUG}}1.webp?v=3.010.300"
                     alt="{{SHIP_NAME}} in [location]"
                     loading="lazy">
                <figcaption class="tiny">Photo attribution.</figcaption>
              </figure>
            </div>
            <!-- More slides -->
          </div>
          <div class="swiper-pagination" aria-hidden="true"></div>
          <div class="swiper-button-prev" aria-label="Previous image"></div>
          <div class="swiper-button-next" aria-label="Next image"></div>
        </div>
      </section>
```

**Checklist:**
- [ ] At least 3 ship photos
- [ ] Each image has descriptive `alt` text
- [ ] `loading="lazy"` on all except LCP
- [ ] Figcaptions with attribution
- [ ] Nav buttons have `aria-label`

#### 9.4.3 Ship Stats with JSON Fallback

```html
        <section class="ship-stats card mini" aria-labelledby="statsHeading">
          <h3 id="statsHeading">Key Facts About {{SHIP_NAME}}</h3>
          <div id="ship-stats" class="stats-grid" data-slug="{{SHIP_SLUG}}"></div>
          <script type="application/json" id="ship-stats-fallback">
          {
            "slug": "{{SHIP_SLUG}}",
            "name": "{{SHIP_NAME}}",
            "class": "{{SHIP_CLASS}}",
            "entered_service": {{YEAR}},
            "gt": "{{GT}}",
            "guests": "{{GUESTS}} (double) ~X (max)",
            "crew": "{{CREW}}",
            "length": "{{LENGTH}}",
            "beam": "{{BEAM}}",
            "registry": "{{REGISTRY}}"
          }
          </script>
        </section>
```

**Checklist:**
- [ ] `data-slug` attribute matches ship slug
- [ ] JSON fallback contains all 9 fields
- [ ] `entered_service` is a NUMBER, not string

#### 9.4.4 Sister Ships Pills

```html
        <section class="card mini carousel related-ships" aria-labelledby="related-ships">
          <h3 id="related-ships" class="card-title">{{SHIP_CLASS}} — Sister Ships</h3>
          <div class="related-pills" aria-label="{{SHIP_CLASS}} ships">
            <a class="pill" href="/ships/{{CRUISE_LINE_SLUG}}/{{SIBLING_SLUG}}.html">{{SIBLING_NAME}}</a>
            <!-- More siblings -->
          </div>
          <p style="text-align:center"><a href="/ships.html" class="btn">See All Ships</a></p>
        </section>
```

#### 9.4.5 Ship Classes Pills

```html
        <section class="card mini carousel related-classes" aria-labelledby="related-classes">
          <h3 id="related-classes" class="card-title">Explore {{CRUISE_LINE}} Classes</h3>
          <p class="small">Hop between ship classes to compare size, venues, and vibes.</p>
          <div class="class-pills">
            <a class="pill" href="/cruise-lines/{{CRUISE_LINE_SLUG}}.html#{{CLASS_ANCHOR}}">{{CLASS_NAME}}</a>
            <!-- More classes -->
          </div>
        </section>
```

#### 9.4.6 Dining Section

```html
      <section id="dining-card" class="card" data-ship="{{SHIP_NAME}}" aria-labelledby="diningHeading">
        <h2 id="diningHeading">Dining Venues on {{SHIP_NAME}}</h2>

        <img id="dining-hero" class="card-hero"
             src="/assets/ships/{{CRUISE_LINE_SLUG}}/{{SHIP_SLUG}}/dining-hero.jpg?v=3.010.300"
             alt="{{SHIP_NAME}} dining venue" loading="lazy"/>

        <div class="dining-content" id="dining-content" aria-live="polite"></div>

        <script type="application/json" id="dining-data-source">
        {"provider":"{{CRUISE_LINE_SLUG}}","json":"/assets/data/venues-v2.json","ship_slug":"{{SHIP_SLUG}}","aliases":["{{SHIP_NAME}}"]}
        </script>

        <p class="tiny">Prices can change at any time.</p>
      </section>
```

#### 9.4.7 Logbook Section

```html
    <section class="card note-kens-logbook" aria-labelledby="logbook">
      <h2 id="logbook">The Logbook — Tales From the Wake</h2>
      <div id="logbook-stories" class="prose"></div>
    </section>
```

#### 9.4.8 Video Section

```html
    <section class="card" aria-labelledby="video-highlights">
      <h2 id="video-highlights">Watch: {{SHIP_NAME}} Highlights</h2>
      <p class="small">Swipe through ship walkthroughs, top-10s, and stateroom tours.</p>
      <div class="swiper videos" aria-label="Featured video carousel">
        <div class="swiper-wrapper" id="featuredVideos"></div>
        <div class="swiper-pagination" aria-hidden="true"></div>
        <div class="swiper-button-prev" aria-label="Previous slide"></div>
        <div class="swiper-button-next" aria-label="Next slide"></div>
      </div>
      <div id="videoFallback" class="tiny hidden">Videos will appear once our sources sync.</div>
    </section>
```

#### 9.4.9 Deck Plans Section

```html
      <section class="card" aria-labelledby="deck-plans">
        <h2 id="deck-plans">Ship Map (Deck Plans)</h2>
        <p><a class="btn" href="https://www.royalcaribbean.com/cruise-ships/{{SHIP_SLUG}}/deck-plans" target="_blank" rel="noopener">Open Official Deck Plans →</a></p>
        <figure>
          <img src="/assets/ship-map.png" alt="{{SHIP_NAME}} simplified deck plan preview" loading="lazy"/>
        </figure>
      </section>
```

#### 9.4.10 Live Tracker Section

```html
      <section class="card itinerary" aria-labelledby="liveTrackHeading" data-imo="{{IMO}}" data-name="{{SHIP_NAME_UPPER}}">
        <h2 id="liveTrackHeading">Where Is {{SHIP_SHORT_NAME}} Right Now?</h2>
        <p>See the ship's current position, speed, and next port on a live tracker.</p>

        <div id="vf-tracker-container" style="width:100%;height:500px;position:relative;"></div>
        <p class="tiny">See <a href="/ports.html">ports</a> for more information.</p>
      </section>
```

**Checklist:**
- [ ] `data-imo` attribute with correct IMO number
- [ ] `data-name` with uppercase ship name (hyphenated)

#### 9.4.11 FAQ Section (Must Match JSON-LD)

```html
    <section class="card faq" aria-labelledby="faq-heading">
      <h2 id="faq-heading">Frequently Asked Questions</h2>

      <details>
        <summary>What makes {{SHIP_NAME}} unique compared to other {{CRUISE_LINE}} ships?</summary>
        <p>[Answer matching JSON-LD]</p>
      </details>

      <details>
        <summary>Which ships are in the same class as {{SHIP_NAME}}?</summary>
        <p>[Answer matching JSON-LD]</p>
      </details>

      <details>
        <summary>What dining options are available on {{SHIP_NAME}}?</summary>
        <p>[Answer matching JSON-LD]</p>
      </details>

      <details>
        <summary>Where does {{SHIP_NAME}} typically sail?</summary>
        <p>[Answer matching JSON-LD]</p>
      </details>

      <details>
        <summary>How can I see {{SHIP_NAME}}'s current location?</summary>
        <p>[Answer matching JSON-LD]</p>
      </details>
    </section>
```

**Checklist:**
- [ ] 5 FAQ items matching FAQPage JSON-LD
- [ ] Uses `<details>` and `<summary>` elements
- [ ] Answers contain internal links where appropriate

#### 9.4.12 Attribution Section

```html
    <section class="card attributions">
      <h2>Image Attributions</h2>
      <ul>
        <li>
          Ship photography © <a href="[SOURCE_URL]" target="_blank" rel="noopener">[Source Name]</a>.
          Used with permission.
        </li>
      </ul>
    </section>
```

---

## Section 10: Body — Footer (Lines 923-933)

```html
  <!-- FOOTER -->
  <footer class="wrap" role="contentinfo">
    <p>© 2025 In the Wake · A Cruise Traveler's Logbook · All rights reserved.</p>
    <p class="tiny" style="margin-top: 0.5rem;">
      <a href="/privacy.html">Privacy</a> ·
      <a href="/terms.html">Terms</a> ·
      <a href="/about-us.html">About</a> ·
      <a href="/accessibility.html">Accessibility &amp; WCAG 2.1 AA Commitment</a>
    </p>
    <p class="tiny center" style="opacity:0;position:absolute;pointer-events:none;" aria-hidden="true">Soli Deo Gloria — Every pixel and part of this project is offered as worship to God, in gratitude for the beautiful things He has created for us to enjoy. ✝️</p>
  </footer>
```

**Checklist:**
- [ ] `role="contentinfo"` on footer
- [ ] Copyright year current
- [ ] Hidden Soli Deo Gloria with `aria-hidden="true"`

---

## Section 11: Body — JavaScript Modules (Lines 935-1299)

### 11.1 Required JavaScript Modules

Each ship page must include these scripts (in order):

1. **First Look Carousel Init** — Swiper for photo carousel
2. **Logbook Loader** — Fetches and renders logbook stories
3. **Video Carousel Loader** — Fetches and renders videos
4. **Fun Distance Units** — Whimsical unit conversions
5. **Ship Stats Loader** — Renders ship statistics
6. **Dining Loader** — Fetches and renders dining venues
7. **Live Tracker Init** — Initializes CruiseMapper iframe
8. **Recent Articles Rail** — Loads recent articles

### 11.2 First Look Carousel Init

```html
  <script>
  (function initFirstLook(){
    function go(){
      if(!window.__swiperReady||!window.Swiper) return setTimeout(go,120);
      try{
        new Swiper('.swiper.firstlook',{
          loop:false,rewind:false,lazy:true,watchOverflow:true,
          pagination:{el:'.swiper.firstlook .swiper-pagination',clickable:true},
          navigation:{nextEl:'.swiper.firstlook .swiper-button-next',prevEl:'.swiper.firstlook .swiper-button-prev'},
          a11y:{enabled:true}
        });
      }catch(_){}
    }
    go();
  })();
  </script>
```

**Checklist:**
- [ ] `a11y:{enabled:true}` for accessibility

### 11.3 Ship Stats Loader (with Ship Slug)

The stats loader must reference the correct ship slug:

```javascript
const SOURCES=[abs('/assets/data/ships/{{SHIP_SLUG}}.json'),abs('/ships/{{CRUISE_LINE_SLUG}}/assets/{{SHIP_SLUG}}.json')];
```

### 11.4 Video Loader (with Ship Slug)

```javascript
const SOURCES=[abs('/assets/data/videos/{{SHIP_SLUG}}.json'),abs('/ships/{{CRUISE_LINE_SLUG}}/assets/{{SHIP_SLUG}}-videos.json')];
```

### 11.5 Live Tracker Init

```html
  <script>
  (function initLiveTracker(){
    const card=document.querySelector('.card.itinerary[data-imo]');
    if(!card) return;
    const imo=card.getAttribute('data-imo');
    const container=document.getElementById('vf-tracker-container');
    if(!imo||!container) return;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'width:100%;height:500px;position:relative;background:#f0f4f8;border-radius:8px;overflow:hidden;';

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:100%;height:100%;border:0;';
    iframe.title = 'Live ship tracker for ' + card.getAttribute('data-name');
    iframe.setAttribute('loading', 'lazy');
    iframe.src = 'https://www.cruisemapper.com/?imo=' + imo;

    wrapper.appendChild(iframe);
    container.appendChild(wrapper);
  })();
  </script>
```

---

## Section 12: Validation Checklist Summary

### 12.1 Theological (IMMUTABLE)
- [ ] Soli Deo Gloria invocation present (before line 20)
- [ ] Proverbs 3:5 quoted
- [ ] Colossians 3:23 quoted
- [ ] Footer Soli Deo Gloria present

### 12.2 AI-Breadcrumbs
- [ ] All 5 required fields present (entity, name, type, parent, category)
- [ ] Entity is exactly "Ship" (not the ship's name)
- [ ] Name is ship's full proper name
- [ ] Type is "Ship Information Page"
- [ ] Updated date in ISO 8601 format
- [ ] answer-first contains key stats

### 12.3 ICP-Lite v1.4
- [ ] ai-summary present (under 250 chars)
- [ ] last-reviewed present (YYYY-MM-DD)
- [ ] content-protocol is "ICP-Lite v1.4"

### 12.4 HTML Structure
- [ ] `<!doctype html>` on line 1
- [ ] `<html lang="en">`
- [ ] `<meta charset="utf-8"/>`
- [ ] Viewport meta present
- [ ] Exactly ONE H1
- [ ] H1 matches title

### 12.5 SEO
- [ ] Title follows format
- [ ] Canonical URL is absolute
- [ ] Description matches ai-summary
- [ ] All 7 OpenGraph tags present
- [ ] All 4 Twitter Card tags present

### 12.6 JSON-LD (7 Required Blocks)
- [ ] Organization
- [ ] WebSite + SearchAction
- [ ] BreadcrumbList (4 items)
- [ ] Review (ratingValue is NUMBER)
- [ ] Person (E-E-A-T)
- [ ] WebPage
- [ ] FAQPage (5 questions)

### 12.7 WCAG Accessibility
- [ ] Skip link present
- [ ] ARIA live regions present
- [ ] Header has `role="banner"`
- [ ] Nav has `aria-label`
- [ ] Main has `role="main"` and `tabindex="-1"`
- [ ] Footer has `role="contentinfo"`
- [ ] All images have alt text
- [ ] Carousels have `aria-label`
- [ ] Nav buttons have `aria-label`

### 12.8 Performance
- [ ] LCP images preloaded with `fetchpriority="high"`
- [ ] Non-LCP images have `loading="lazy"`
- [ ] Assets versioned with `?v=3.010.300`
- [ ] Swiper has CDN fallback

### 12.9 Content Sections (All Required)
- [ ] Page Intro / Quick Answer
- [ ] First Look Photo Carousel
- [ ] Ship Stats with JSON fallback
- [ ] Sister Ships Pills
- [ ] Ship Classes Pills
- [ ] Dining Section
- [ ] Logbook Section
- [ ] Video Section
- [ ] Deck Plans Section
- [ ] Live Tracker Section
- [ ] FAQ Section (5 questions matching JSON-LD)
- [ ] Attribution Section

### 12.10 JavaScript Modules
- [ ] URL Normalizer script
- [ ] Swiper loader with fallback
- [ ] First Look init
- [ ] Logbook loader
- [ ] Video loader
- [ ] Stats loader
- [ ] Dining loader
- [ ] Live tracker init
- [ ] Recent articles rail

---

## Appendix A: IMO Numbers Reference

To find a ship's IMO number:
1. Visit https://www.marinetraffic.com
2. Search for the ship name
3. IMO is in the ship details

Common Royal Caribbean IMOs:
- Radiance of the Seas: 9195195
- Adventure of the Seas: 9167227
- Icon of the Seas: 9849445

---

## Appendix B: File Naming Conventions

```
/ships/{{CRUISE_LINE_SLUG}}/{{SHIP_SLUG}}.html

Examples:
/ships/rcl/radiance-of-the-seas.html
/ships/rcl/icon-of-the-seas.html
/ships/ccl/carnival-jubilee.html
```

---

## Appendix C: Image Asset Locations

```
/assets/ships/{{SHIP_SLUG}}1.webp          # Primary ship image
/assets/ships/{{SHIP_SLUG}}2.webp          # Additional images
/assets/ships/{{CRUISE_LINE_SLUG}}/{{SHIP_SLUG}}/dining-hero.jpg
```

---

**Soli Deo Gloria** ✝️
