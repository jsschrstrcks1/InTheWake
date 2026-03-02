# Codebase Guide - In the Wake

**Version:** 1.1.0
**Last Updated:** 2026-02-12
**Purpose:** Comprehensive guide to repository structure, code patterns, and development conventions

---

## 📁 Repository Structure

### Root Directory Layout

```
InTheWake/
├── index.html                      # Homepage
├── about-us.html                   # About page
├── solo.html                       # Solo travel hub
├── disability-at-sea.html          # Accessibility hub
├── restaurants.html                # Dining hub
├── ports.html                      # Ports hub
├── packing-lists.html              # Packing guides
├── drink-packages.html             # Drink packages info
├── travel.html                     # General travel info
├── search.html                     # Site search (23KB)
├── sitemap.xml                     # SEO sitemap (108KB)
├── sw.js                          # Service Worker (v14.2.0)
├── precache-manifest.json          # Precache config (v14.2.0)
├── _headers                        # Netlify cache headers
├── .htaccess                       # Apache cache headers
├── nginx-cache-headers.conf        # nginx cache headers
├── admin/UNFINISHED_TASKS.md       # Main task tracker (APPEND-ONLY)
├── admin/CONSOLIDATED_TASK_LIST_2025_11_23.md  # Priority-sorted tasks
│
├── ships/                          # Ship pages (298 across 15 lines)
│   ├── index.html                 # Ships hub (NOT ships.html)
│   ├── rcl/                       # Royal Caribbean (50 ships)
│   ├── carnival-cruise-line/      # Carnival fleet (48 ships)
│   ├── celebrity-cruises/         # Celebrity fleet (29 ships)
│   ├── holland-america-line/      # HAL fleet (46 ships)
│   ├── norwegian/                 # Norwegian (20 ships)
│   ├── princess/                  # Princess (17 ships)
│   ├── msc/                       # MSC Cruises (24 ships)
│   ├── silversea/                 # Silversea (12 ships)
│   ├── costa/                     # Costa (9 ships)
│   ├── oceania/                   # Oceania (8 ships)
│   ├── regent/                    # Regent Seven Seas (7 ships)
│   ├── seabourn/                  # Seabourn (7 ships)
│   ├── explora-journeys/          # Explora Journeys (6 ships)
│   ├── cunard/                    # Cunard (4 ships)
│   └── virgin-voyages/            # Virgin Voyages (4 ships)
│
├── ports/                          # Port pages (380 ports)
│   ├── cozumel.html
│   ├── honolulu.html
│   └── ...
│
├── solo/                           # Solo travel content
│   ├── articles/                  # Solo articles
│   │   └── accessible-cruising.html  # Accessibility guide (COMPLETE)
│   ├── in-the-wake-of-grief.html  # Grief article (Grade A+, 722 lines)
│   ├── why-i-started-solo-cruising.html
│   └── freedom-of-your-own-wake.html
│
├── tools/                          # Interactive tools
│   ├── port-tracker.html          # Port checklist (65KB, 2071 lines)
│   └── ship-tracker.html          # Ship checklist (42KB, 1132 lines)
│
├── cruise-lines/                   # Cruise line hubs
│   ├── royal-caribbean.html       # RCL hub (v3.006.006)
│   ├── carnival.html
│   ├── celebrity.html
│   ├── disney.html
│   ├── holland-america.html
│   └── msc.html
│
├── restaurants/                    # Dining venue pages (472 pages)
│   ├── chefs-table.html
│   ├── chops.html
│   └── ...
│
├── authors/                        # Author pages
│   └── justin-scherstka.html
│
├── assets/                         # Static assets
│   ├── css/                       # Stylesheets
│   │   ├── styles.css?v=3.010.400  # Main stylesheet (versioned)
│   │   └── item-cards.css         # Ship cards (v1.0.0, 467 lines)
│   ├── js/                        # JavaScript modules
│   │   ├── site-cache.js          # Client-side cache (7-day TTL)
│   │   ├── venue-boot.js          # Restaurant page init (86 lines)
│   │   ├── ships-dynamic.js       # Ship image arrays
│   │   ├── rcl.page.js            # RCL page logic
│   │   └── sw-bridge.js           # Service Worker bridge
│   ├── data/                      # JSON data files
│   │   ├── fleet_index.json       # Ship fleet data (version aware)
│   │   ├── venues.json            # Dining venues (version aware)
│   │   ├── personas.json          # User personas (version aware)
│   │   ├── logbook/               # Ship logbooks (285 files across all lines)
│   │   │   ├── rcl/               # RCL logbooks
│   │   │   ├── carnival/          # Carnival logbooks
│   │   │   ├── celebrity/         # Celebrity logbooks
│   │   │   ├── norwegian/         # NCL logbooks
│   │   │   ├── holland-america/   # HAL logbooks
│   │   │   └── [10+ more lines]   # All 15 cruise lines represented
│   │   └── ports/                 # Port master lists
│   │       ├── royal-caribbean-ports-master-list.md  # 350+ ports
│   │       ├── carnival-cruise-line-ports-master-list.md  # 320+ ports
│   │       ├── virgin-voyages-ports-master-list.md    # ~120 ports
│   │       ├── msc-cruises-ports-master-list.md       # 380+ ports
│   │       └── norwegian-cruise-line-ports-master-list.md  # 420+ ports
│   ├── ships/                     # Ship images (669 WebP files)
│   │   ├── radiance-of-the-seas.webp
│   │   ├── radiance-of-the-seas1.webp
│   │   └── thumbs/                # Pre-sized thumbnails
│   ├── videos/                    # Video manifests
│   │   └── rc_ship_videos.json    # Ship tour videos (version aware)
│   └── logo_wake.png              # Site logo (MUST stay PNG)
│
├── standards/                      # Standards documentation
│   ├── main-standards.md          # Global standards (v3.001)
│   ├── root-standards.md          # Root page standards (v3.001)
│   ├── ships-standards.md         # Ship page standards (v3.001)
│   ├── cruise-lines-standards.md  # Cruise line standards (v3.001)
│   ├── ports-standards.md         # Port page standards
│   ├── STANDARDS_ADDENDUM_RCL_v3.006.md  # RCL specific (v3.006.006)
│   └── starter.html               # Template starter
│
├── admin/                          # Admin tools and documentation
│   ├── README.md                  # Admin tools overview
│   ├── claude/                    # Claude AI documentation
│   │   ├── CLAUDE.md              # Main Claude guide (NEW 2025-11-23)
│   │   ├── ITW-LITE_PROTOCOL.md   # Content protocol (NEW 2025-11-23)
│   │   ├── STANDARDS_INDEX.md     # Master index (NEW 2025-11-23)
│   │   └── CODEBASE_GUIDE.md      # This file (NEW 2025-11-23)
│   ├── reports/                   # Generated reports
│   │   ├── articles.html
│   │   └── sw-health.html
│   ├── FIVE_ARTICLE_CATEGORIES.md # Solo article structure
│   ├── ICP-Lite.md                # ICP-Lite implementation
│   ├── COMPREHENSIVE_AUDIT_2025_11_19.json  # Audit data (234KB)
│   ├── COMPREHENSIVE_SITE_AUDIT_2025_11_19.md  # Audit report
│   ├── THREAD_AUDIT_2025_11_19.md # Thread audit
│   ├── VERIFICATION_REPORT_2025_11_19.json  # Verification data
│   ├── webp_audit.py              # WebP status audit
│   ├── rename_webp_files.py       # Rename WebP files
│   ├── update_to_webp.py          # Update single file to WebP
│   ├── update_fom_to_webp.py      # Update FOM gallery to WebP
│   ├── update_hero_to_webp.py     # Update hero images to WebP
│   ├── verify_webp_files.py       # Verify WebP existence
│   ├── verify_webp_updates.py     # Verify WebP updates valid
│   └── [50+ other admin scripts]
│
├── attributions/                   # Image attribution tracking
│   └── attributions.csv           # Attribution records
│
└── comprehensive_site_audit.py     # Site-wide audit script (23KB)
```

---

## 🗂️ File Naming Conventions

### HTML Files

**Ship pages:**
- Pattern: `/ships/<line>/<slug>.html`
- Example: `/ships/rcl/radiance-of-the-seas.html`
- Slug format: lowercase, hyphens for spaces
- NO underscores, NO spaces

**Port pages:**
- Pattern: `/ports/<slug>.html`
- Example: `/ports/cozumel.html`
- Handle duplicates: `portland.html` (UK), `portland-maine.html` (US)

**Article pages:**
- Pattern: `/solo/articles/<slug>.html` OR `/solo/<slug>.html`
- Example: `/solo/in-the-wake-of-grief.html`
- Descriptive slugs that match H1

**Cruise line hubs:**
- Pattern: `/cruise-lines/<slug>.html`
- Example: `/cruise-lines/royal-caribbean.html`
- Use full name, not abbreviations

### Image Files

**Ship images (WebP):**
- Pattern: `/assets/ships/<slug>.webp` or `<slug>1.webp`, `<slug>2.webp`, `<slug>3.webp`
- Example: `radiance-of-the-seas.webp`, `radiance-of-the-seas1.webp`
- Random selection: Ship cards randomly pick one of available numbered variants
- FOM galleries: `<slug>-fom-1.webp`, `<slug>-fom-2.webp`, etc.

**Logo:**
- `logo_wake.png` - MUST stay PNG for transparency (NEVER convert to WebP)

**Author avatars:**
- Pattern: `/assets/authors/<slug>.webp`
- Example: `justin-scherstka.webp`

### JSON Data Files

**Ship data:**
- Pattern: `/assets/data/ships/<slug>.json` OR `/ships/rcl/assets/<slug>.json`
- Example: `radiance-of-the-seas.json`
- MUST include `"version"` field

**Logbook data:**
- Pattern: `/assets/data/logbook/rcl/<slug>.json`
- Example: `radiance-of-the-seas.json`, `nordic-prince.json`
- MUST include `"version"` and `"ship"` fields

**Global data:**
- `fleet_index.json` - Ship fleet data
- `venues.json` - Dining venues
- `personas.json` - User personas
- `rc_ship_videos.json` - Video manifest
- ALL MUST include `"version"` field for cache invalidation

---

## 📦 JSON Data Schemas

### Fleet Index (`fleet_index.json`)

```json
{
  "version": "3.0.1",
  "ships": [
    {
      "slug": "radiance-of-the-seas",
      "name": "Radiance of the Seas",
      "class": "Radiance",
      "line": "Royal Caribbean",
      "tonnage": 90090,
      "passengers": 2143,
      "crew": 859,
      "entered_service": "2001-04-01",
      "status": "active",
      "image": "/assets/ships/radiance-of-the-seas.webp"
    }
  ]
}
```

**Required fields:**
- `version` - Increment when data changes (cache invalidation)
- `ships` - Array of ship objects
- `slug` - Unique identifier (matches file names)
- `name` - Display name
- `class` - Ship class (Oasis, Quantum, Radiance, etc.)
- `line` - Cruise line name
- `status` - "active", "retired", "future"

### Venues (`venues.json`)

```json
{
  "version": "2.1.0",
  "venues": [
    {
      "slug": "chefs-table",
      "name": "Chef's Table",
      "type": "specialty",
      "category": "premium",
      "pricing": "115",
      "description": "Exclusive chef-hosted dining experience",
      "dress_code": "formal",
      "ships": ["radiance-of-the-seas", "brilliance-of-the-seas"]
    }
  ]
}
```

**Required fields:**
- `version` - Increment when venues change
- `venues` - Array of venue objects
- `slug` - Unique identifier
- `type` - "specialty" or "included"
- `category` - "premium" or "included"
- `ships` - Array of ship slugs where this venue exists

### Ship Logbooks (`logbook/rcl/<slug>.json`)

```json
{
  "version": "1.1.0",
  "ship": "radiance-of-the-seas",
  "stories": [
    {
      "id": "story-001",
      "title": "The Widow Who Learned to Laugh Again",
      "category": "Grief & Loss",
      "subcategory": "Widowhood",
      "summary": "Margaret's first cruise 9 months after losing her husband...",
      "story": "Full narrative with Scripture references and emotional details...",
      "tags": ["widow", "first-holiday", "finding-joy", "alaska"],
      "scriptureRef": "Psalm 30:11",
      "scriptureQuote": "You turned my wailing into dancing; you removed my sackcloth and clothed me with joy",
      "featured": true,
      "season": "summer",
      "itinerary": "Alaska 7-night"
    }
  ]
}
```

**Required fields:**
- `version` - Increment when stories change
- `ship` - Ship slug
- `stories` - Array of story objects
- `id` - Unique story ID (story-001, story-002, etc.)
- `title` - Display title
- `category` - One of: "Grief & Loss", "Accessibility", "Solo Travel", "Healing Relationships", "Rest & Recovery"
- `story` - Full narrative text
- `tags` - Array of searchable tags

**Optional fields:**
- `scriptureRef` - Bible verse reference
- `scriptureQuote` - Actual verse text
- `featured` - Boolean (show on ship page hero)
- `season` - "winter", "spring", "summer", "fall"
- `itinerary` - Specific cruise itinerary

**Story Categories:**
1. **Grief & Loss:** Widows, anticipatory grief, memorial cruises, first holidays
2. **Accessibility:** Wheelchair, autism, invisible disabilities, PTSD, stroke recovery
3. **Solo Travel:** Forced solo, anxiety, introverts, by-choice, first-time
4. **Healing Relationships:** Marriage restoration, family reconciliation, blended families
5. **Rest & Recovery:** Burnout, caregivers, pastors, teachers, medical professionals

---

## 🎨 CSS Architecture

### Main Stylesheet (`assets/styles.css?v=3.010.400`)

**CRITICAL:** Always include version query `?v=3.010.400` to bust cache

**Loading:**
```html
<link rel="stylesheet" href="/assets/styles.css?v=3.010.400">
```

**Structure:**
- Global variables (CSS custom properties)
- Reset/normalize
- Typography
- Layout (grid, flexbox)
- Components (buttons, cards, forms)
- Navigation
- Hero sections
- Responsive breakpoints

**Variable naming:**
```css
:root {
  --accent: #2e8b9e;
  --sea: #1a5c6d;
  --text: #2d3748;
  --text-secondary: #4a5568;
  --bg: #ffffff;
  --bg-subtle: #f7fafc;
  --border: #e2e8f0;
  --success: #38a169;
  --warning: #d69e2e;
}
```

### Item Cards CSS (`assets/css/item-cards.css`)

**Version:** v1.0.0
**Purpose:** Ship card redesign with enhanced CTAs
**Size:** 467 lines, 9.5KB

**Key Features:**
- Enhanced CTA text styling (gradient background, left border)
- Improved CTA button (gradient, animated arrow)
- Better visual hierarchy (larger titles, improved spacing)
- Enhanced badges (gradients, shadows, backdrop blur)
- Responsive grid (320px → 360px → 3-col at 1400px)
- Enhanced cards (softer borders, layered shadows, hover lift)
- Better images (16:9 aspect ratio, zoom on hover)
- Retired badge styling (grayscale filter)

**Usage:**
```html
<link rel="stylesheet" href="/assets/css/item-cards.css">

<div class="item-grid">
  <article class="item-card">
    <img src="/assets/ships/radiance-of-the-seas.webp" alt="...">
    <div class="item-card-content">
      <h3 class="item-card-title">Radiance of the Seas</h3>
      <p class="item-card-cta-text">Perfect for travelers seeking panoramic views...</p>
      <a href="/ships/rcl/radiance-of-the-seas.html" class="item-card-cta">
        Explore Ship <span class="arrow">→</span>
      </a>
    </div>
  </article>
</div>
```

### Progressive Enhancement Classes

```css
/* No-JS baseline */
.no-js .fallback {
  display: block;
}

.no-js .js-only {
  display: none;
}

.no-js-visible {
  display: none;
}

.no-js .no-js-visible {
  display: block;
}
```

**HTML pattern:**
```html
<html class="no-js" lang="en">
<head>
  <script>document.documentElement.classList.remove('no-js');</script>
</head>
```

---

## ⚙️ JavaScript Patterns

### Module Structure

**Site Cache (`assets/js/site-cache.js`)**

**Purpose:** Client-side JSON caching with version awareness
**TTL:** 7 days (configurable)
**Storage:** localStorage

**Usage:**
```javascript
// Load with version checking
const fleetData = await SiteCache.getJSON(
  '/assets/data/fleet_index.json',
  { ttlDays: 7, versionPath: ['version'] }
);

// Version mismatch auto-refreshes cache
// TTL expiry auto-refreshes cache
```

**Pre-warm pattern (near `</body>`):**
```html
<script>
(function(){async function warm(){try{await Promise.all([
  SiteCache.getJSON('/assets/data/fleet_index.json',{ttlDays:7,versionPath:['version']}),
  SiteCache.getJSON('/assets/data/venues.json',     {ttlDays:7,versionPath:['version']}),
  SiteCache.getJSON('/assets/data/personas.json',   {ttlDays:7,versionPath:['version']}),
  SiteCache.getJSON('/assets/videos/rc_ship_videos.json', {ttlDays:7,versionPath:['version']})
]);}catch(e){}} if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',warm,{once:true});} else {warm();}})();
</script>
```

### Service Worker (`sw.js`)

**Version:** v14.2.0
**Strategy:** Cache-first for images, network-first for HTML/JSON

**Configuration:**
```javascript
const CONFIG = {
  version: '14.2.0',
  maxPages: 400,      // Site has 1,238 pages
  maxAssets: 150,
  maxImages: 600,     // Currently 661 ship images (3,131 WebP site-wide)
  maxData: 100        // 2,455 JSON files in assets/data/
};
```

**Cache strategies:**
- Images: Cache-first (long-lived, rarely change)
- HTML: Network-first (content updates frequently)
- JSON: Network-first with SiteCache (version-aware)
- CSS/JS: Cache-first with version busting (?v=3.010.400)

**Registration (before `</body>`):**
```html
<script>
  if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{});}
</script>
```

### Venue Boot (`assets/js/venue-boot.js`)

**Purpose:** Initialize restaurant pages
**Size:** 86 lines, 2.2KB

**Functions:**
1. Initialize ship pills
2. Load venue data from venues.json
3. Populate venue cards
4. Handle filtering/search

**Usage:**
```html
<script src="/assets/js/venue-boot.js" defer></script>
```

### Ships Dynamic (`assets/js/ships-dynamic.js`)

**Purpose:** Ship image arrays and dynamic loading
**Contains:** ~67 references to ship images

**Pattern:**
```javascript
const shipImages = {
  'radiance-of-the-seas': [
    '/assets/ships/radiance-of-the-seas.webp',
    '/assets/ships/radiance-of-the-seas1.webp',
    '/assets/ships/radiance-of-the-seas2.webp'
  ]
};

// Random selection
const randomImage = shipImages['radiance-of-the-seas'][
  Math.floor(Math.random() * shipImages['radiance-of-the-seas'].length)
];
```

---

## 🔍 Common Code Patterns

### Absolute URL Pattern

**ALWAYS use absolute URLs in production:**

```html
<!-- ✅ CORRECT -->
<a href="https://cruisinginthewake.com/ships/index.html">Ships</a>
<img src="https://cruisinginthewake.com/assets/ships/radiance.webp" alt="...">
<link rel="stylesheet" href="https://cruisinginthewake.com/assets/styles.css?v=3.010.400">

<!-- ❌ WRONG -->
<a href="/ships/index.html">Ships</a>
<a href="../ships/index.html">Ships</a>
<img src="/assets/ships/radiance.webp" alt="...">
```

### Image Loading Pattern

**Hero images (LCP optimization):**
```html
<img src="https://cruisinginthewake.com/assets/ships/radiance-of-the-seas.webp"
     alt="Radiance of the Seas cruise ship"
     loading="eager"
     fetchpriority="high"
     width="1200"
     height="675">
```

**Non-hero images (lazy loading):**
```html
<img src="https://cruisinginthewake.com/assets/ships/radiance-of-the-seas1.webp"
     alt="Radiance of the Seas deck view"
     loading="lazy"
     width="800"
     height="450">
```

**Responsive logo pattern:**
```html
<img
  src="https://cruisinginthewake.com/assets/logo_wake.png"
  srcset="
    https://cruisinginthewake.com/assets/logo_wake.png 150w,
    https://cruisinginthewake.com/assets/logo_wake.png 200w
  "
  sizes="(max-width: 768px) 100px, 150px"
  alt="In the Wake logo"
  fetchpriority="high"
  width="150"
  height="50"
>
```

### Navigation Pattern

**Primary navigation (pill-nav):**
```html
<nav class="pill-nav pills" aria-label="Main navigation">
  <a href="https://cruisinginthewake.com/index.html">Home</a>
  <a href="https://cruisinginthewake.com/ships/index.html">Ships</a>
  <a href="https://cruisinginthewake.com/restaurants.html">Restaurants</a>
  <a href="https://cruisinginthewake.com/ports.html">Ports</a>
  <!-- More nav items -->
</nav>
```

**Dropdown navigation (300ms hover delay):**
```html
<nav class="dropdown-nav">
  <div class="dropdown">
    <button class="dropdown-toggle">Ships</button>
    <div class="dropdown-menu">
      <a href="...">Radiance Class</a>
      <a href="...">Oasis Class</a>
    </div>
  </div>
</nav>

<script>
// 300ms hover delay to prevent accidental triggers
let hoverTimeout;
dropdownToggle.addEventListener('mouseenter', () => {
  hoverTimeout = setTimeout(() => {
    dropdownMenu.classList.add('show');
  }, 300);
});
dropdownToggle.addEventListener('mouseleave', () => {
  clearTimeout(hoverTimeout);
});
</script>
```

### Breadcrumb Pattern

**HTML breadcrumbs:**
```html
<nav aria-label="Breadcrumb" class="breadcrumb">
  <ol>
    <li><a href="https://cruisinginthewake.com/index.html">Home</a></li>
    <li><a href="https://cruisinginthewake.com/ships/index.html">Ships</a></li>
    <li aria-current="page">Radiance of the Seas</li>
  </ol>
</nav>
```

**JSON-LD schema:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://cruisinginthewake.com/index.html"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Ships",
      "item": "https://cruisinginthewake.com/ships/index.html"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Radiance of the Seas",
      "item": "https://cruisinginthewake.com/ships/rcl/radiance-of-the-seas.html"
    }
  ]
}
</script>
```

### Skip Link Pattern

**MUST be first element in `<body>`:**
```html
<body>
  <a href="#main" class="skip-link">Skip to main content</a>
  <!-- Rest of content -->
  <main id="main">
    <!-- Main content -->
  </main>
</body>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--accent);
  color: white;
  padding: 0.5rem 1rem;
  z-index: 9999;
}

.skip-link:focus {
  top: 0;
}
```

---

## 🧪 Testing & Validation

### HTML Validation

**Tools:**
- W3C HTML Validator: https://validator.w3.org/
- Run before committing new/updated HTML pages

**Common issues to avoid:**
- Missing DOCTYPE
- Unclosed tags
- Invalid nesting (e.g., `<p>` inside `<p>`)
- Missing required attributes (alt on images)

### JSON Validation

**Tools:**
- JSONLint: https://jsonlint.com/
- VS Code built-in JSON validator

**Common issues to avoid:**
- Trailing commas
- JavaScript-style comments (use `//` or `/* */`)
- Control characters
- Invalid Unicode
- Missing required fields (version, etc.)

### Accessibility Testing

**Tools:**
- Lighthouse (Chrome DevTools) - Target: 100 score
- WAVE Browser Extension
- Keyboard navigation manual testing

**Checklist:**
- [ ] Skip-link present and functional
- [ ] All images have alt attributes
- [ ] Proper heading hierarchy (H1 → H2 → H3)
- [ ] ARIA labels where appropriate
- [ ] Keyboard navigation works (Tab, Enter, Escape, Arrows)
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 for text)
- [ ] Forms have proper labels

### Performance Testing

**Tools:**
- Google PageSpeed Insights
- Lighthouse Performance score
- WebPageTest

**Targets:**
- LCP (Largest Contentful Paint): <2.5s
- FID (First Input Delay): <100ms
- CLS (Cumulative Layout Shift): <0.1
- Total page weight: <2MB (ideal <1MB)

**Optimization checklist:**
- [ ] WebP images used (not JPEG/PNG except logo)
- [ ] Images lazy loaded (except hero)
- [ ] Hero images have fetchpriority="high"
- [ ] CSS has version query (?v=3.010.400)
- [ ] Service Worker registered
- [ ] SiteCache pre-warm snippet included
- [ ] No blocking JavaScript (use defer/async)

---

## 🚀 Deployment & Build

### Cache Configuration

**Netlify (`_headers`):**
```
# Static assets - 1 year cache
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# HTML - no cache
/*.html
  Cache-Control: no-cache, no-store, must-revalidate

# JSON - no cache (version-aware caching via SiteCache)
/assets/data/*.json
  Cache-Control: no-cache
```

**Apache (`.htaccess`):**
```apache
<IfModule mod_headers.c>
  # Static assets - 1 year
  <FilesMatch "\.(webp|css|js|png|jpg|jpeg|gif|svg|woff|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>

  # HTML - no cache
  <FilesMatch "\.html$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </FilesMatch>

  # JSON - no cache
  <FilesMatch "\.json$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
</IfModule>
```

### Git Workflow

**Branch naming:**
- Pattern: `claude/<description>-<session-id>`
- Example: `claude/fix-logo-aspect-ratio-01JY4eRGk3Kd3vaBjbtQUukW`

**Commit message format:**
```
TYPE: Brief summary (50 chars or less)

Detailed explanation of changes and why they were necessary.
Reference any related tasks or issues from admin/UNFINISHED_TASKS.md.
```

**Types:**
- `FEAT:` - New features
- `FIX:` - Bug fixes
- `DOCS:` - Documentation
- `STYLE:` - CSS/visual changes
- `REFACTOR:` - Code refactoring
- `TEST:` - Test additions
- `AUDIT:` - Audit reports
- `LOGBOOK:` - Logbook stories

**Workflow:**
1. Check current branch: `git status`
2. Review changes: `git diff`
3. Stage changes: `git add <files>`
4. Commit with message: `git commit -m "TYPE: Summary"`
5. Push to branch: `git push -u origin <branch-name>`
6. Create PR when ready (user handles merges)

**NEVER:**
- Push to main/master directly
- Force push (`--force` or `-f`)
- Amend other developers' commits
- Skip commit messages

---

## 🔧 Admin Scripts

### WebP Conversion Workflow

**1. Audit current status:**
```bash
python3 admin/webp_audit.py
```

**2. Rename WebP files:**
```bash
python3 admin/rename_webp_files.py
```

**3. Update FOM galleries:**
```bash
python3 admin/update_fom_to_webp.py
```

**4. Update hero images:**
```bash
python3 admin/update_hero_to_webp.py
```

**5. Verify updates:**
```bash
python3 admin/verify_webp_updates.py
python3 admin/verify_webp_files.py
```

**See:** `/admin/README.md` for complete WebP workflow documentation

### Comprehensive Site Audit

**Run full audit:**
```bash
python3 comprehensive_site_audit.py
```

**Generates:**
- `/admin/COMPREHENSIVE_AUDIT_2025_11_19.json` (machine-readable, 234KB)
- `/admin/COMPREHENSIVE_SITE_AUDIT_2025_11_19.md` (human-readable, 13KB)

**Checks:**
- Broken links (209 found in last audit)
- Lint issues (553 found: accessibility, DOCTYPE, code quality)
- Orphan files (593 found, 41 cleaned)
- Edge cases (154 found: placeholder text, empty hrefs)
- JSON validity
- Image references

---

## 📚 Key Architectural Decisions

### Why Absolute URLs?

**Decision:** Use only absolute URLs in production HTML

**Rationale:**
- Prevents broken links when pages move
- Enables easy CDN migration
- Simplifies testing across environments
- Clear canonical URLs for SEO

### Why WebP Images?

**Decision:** Convert all ship images from JPEG to WebP (except logo)

**Rationale:**
- 77% file size reduction (15.8MB → 4.9MB)
- Faster page loads (64% reduction in page weight)
- Better LCP scores
- Modern browser support (98%+)

**Exception:** `logo_wake.png` stays PNG for transparency

### Why Client-Side Caching (SiteCache)?

**Decision:** Implement client-side JSON caching with version awareness

**Rationale:**
- Reduces API calls for repeat visitors
- 7-day TTL balances freshness vs performance
- Version field triggers cache invalidation when data changes
- Works alongside Service Worker for comprehensive caching

### Why Service Worker v14.2.0?

**Decision:** Increase cache limits and improve caching strategies

**Current limits:**
- maxPages: 400 (site has 1,238 pages)
- maxData: 100 (2,455 JSON files in assets/data/)
- maxImages: 600 (661 ship images, 3,131 WebP site-wide)

**Rationale:**
- Site has grown substantially (1,238 HTML pages, 298 ships, 380 ports, 472 venues)
- Prevents cache eviction thrashing
- Improves offline experience
- Future-proofs for expansion

### Why ICP-Lite/ITW-Lite?

**Decision:** Implement AI-first content protocol with progressive levels

**Rationale:**
- Makes content discoverable by AI assistants (ChatGPT, Claude, etc.)
- Improves search engine understanding
- Enables rich snippets (FAQ stars, article cards)
- NEVER compromises human UX (hidden meta tags, JSON-LD)

**See:** `/admin/claude/ITW-LITE_PROTOCOL.md` for full specification

---

## 🎓 Learning Resources

### Internal Documentation

**Start here:**
1. `/admin/claude/CLAUDE.md` - Comprehensive Claude guide
2. `/admin/claude/STANDARDS_INDEX.md` - Master standards index
3. `/admin/claude/ITW-LITE_PROTOCOL.md` - Content protocol
4. `/admin/claude/CODEBASE_GUIDE.md` - This file

**Standards:**
5. `/standards/main-standards.md` - Global standards
6. `/standards/ships-standards.md` - Ship page standards
7. `/standards/ports-standards.md` - Port page standards

**Task Management:**
8. `/admin/UNFINISHED_TASKS.md` - Main task tracker (APPEND-ONLY)
9. `/admin/FIVE_ARTICLE_CATEGORIES.md` - Article structure

### External Resources

**Web Standards:**
- MDN Web Docs: https://developer.mozilla.org/
- W3C Specifications: https://www.w3.org/TR/
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/

**Performance:**
- web.dev: https://web.dev/
- PageSpeed Insights: https://pagespeed.web.dev/
- WebPageTest: https://www.webpagetest.org/

**Schema.org:**
- Schema.org documentation: https://schema.org/
- Google Structured Data: https://developers.google.com/search/docs/appearance/structured-data

---

## 🤝 Contributing Patterns

### Adding a New Ship Page

**Checklist:**
1. [ ] Read `/standards/ships-standards.md`
2. [ ] Create file: `/ships/rcl/<slug>.html`
3. [ ] Use absolute URLs throughout
4. [ ] Add hero image (WebP, fetchpriority="high")
5. [ ] Add responsive logo with srcset
6. [ ] Include ICP-Lite meta tags
7. [ ] Add breadcrumb navigation (HTML + JSON-LD)
8. [ ] Create logbook JSON: `/assets/data/logbook/rcl/<slug>.json`
9. [ ] Add attribution section (if Wiki Commons images)
10. [ ] Update `fleet_index.json` (increment version)
11. [ ] Test HTML validation
12. [ ] Test accessibility (Lighthouse 100)
13. [ ] Update admin/UNFINISHED_TASKS.md (mark ship complete)
14. [ ] Commit with clear message: `FEAT: Add <Ship Name> ship page`

### Adding a New Port Page

**Checklist:**
1. [ ] Read `/standards/ports-standards.md`
2. [ ] Create file: `/ports/<slug>.html`
3. [ ] Use absolute URLs throughout
4. [ ] Add hero image (WebP, fetchpriority="high")
5. [ ] Include ICP-Lite meta tags
6. [ ] Add breadcrumb navigation
7. [ ] Add Revolution Day notice (if Mexican port)
8. [ ] Add LCP preload hint
9. [ ] NO "under construction" notices
10. [ ] Test HTML validation
11. [ ] Test accessibility
12. [ ] Update Port Logbook database (if not already listed)
13. [ ] Update admin/UNFINISHED_TASKS.md (mark port complete)
14. [ ] Commit: `FEAT: Add <Port Name> port page`

### Writing a Solo Travel Article

**Checklist:**
1. [ ] Read `/admin/FIVE_ARTICLE_CATEGORIES.md`
2. [ ] Read `/admin/claude/ITW-LITE_PROTOCOL.md` (Article section)
3. [ ] Reference "In the Wake of Grief" (Grade A+ example)
4. [ ] Create file: `/solo/<slug>.html` OR `/solo/articles/<slug>.html`
5. [ ] Include H1 + dek (answer line)
6. [ ] Add fit-guidance section
7. [ ] Add 5+ FAQ items with schema
8. [ ] Add ship size recommendations
9. [ ] Cross-link to 10+ relevant logbook stories
10. [ ] Add Scripture references (if grief content)
11. [ ] Include Article schema (JSON-LD)
12. [ ] Test HTML validation
13. [ ] Test accessibility
14. [ ] Update admin/UNFINISHED_TASKS.md (mark article complete)
15. [ ] Commit: `FEAT: Add <Article Title> solo travel article`

---

## 🔍 Troubleshooting

### Images Not Loading

**Check:**
1. Is image WebP format? (except logo_wake.png)
2. Is path absolute? (`https://cruisinginthewake.com/...`)
3. Does file exist in `/assets/ships/`?
4. Is filename lowercase with hyphens?
5. Is alt attribute present?

**Fix:**
- Convert JPEG to WebP: Use admin scripts
- Update paths to absolute URLs
- Check file existence with `ls /assets/ships/<slug>.webp`
- Rename if needed: `mv old.webp new-slug.webp`

### JSON Not Loading

**Check:**
1. Is JSON valid? (no trailing commas, no comments)
2. Does JSON include `"version"` field?
3. Is SiteCache implemented on page?
4. Are paths absolute?

**Fix:**
- Validate JSON: https://jsonlint.com/
- Add `"version": "1.0.0"` field
- Include SiteCache script and pre-warm snippet
- Update paths to absolute

### Navigation Not Working

**Check:**
1. Are URLs absolute?
2. Is dropdown CSS included?
3. Is JavaScript error-free (check console)?
4. Is 300ms hover delay implemented?

**Fix:**
- Update to absolute URLs
- Include complete nav CSS
- Fix JavaScript errors
- Add hover delay timeout

### Service Worker Not Caching

**Check:**
1. Is `sw.js` at root?
2. Is registration snippet included?
3. Are cache limits sufficient?
4. Is HTTPS enabled?

**Fix:**
- Move `sw.js` to root directory
- Add registration snippet before `</body>`
- Increase cache limits in CONFIG
- Service Workers require HTTPS (works on localhost)

---

## 📝 Quick Reference

**File a ship page lives in:**
`/ships/rcl/<slug>.html`

**File a port page lives in:**
`/ports/<slug>.html`

**File a logbook lives in:**
`/assets/data/logbook/rcl/<slug>.json`

**File ship images live in:**
`/assets/ships/<slug>.webp` (and `<slug>1.webp`, `<slug>2.webp`, etc.)

**Main task tracker:**
`/admin/UNFINISHED_TASKS.md` (APPEND-ONLY)

**Main standards:**
`/standards/main-standards.md`

**Main Claude guide:**
`/admin/claude/CLAUDE.md`

**CSS version query:**
`?v=3.010.400`

**Service Worker version:**
`v14.2.0`

**Template version:**
`v3.010.305`

**Canonical domain:**
`https://cruisinginthewake.com`

---

**Remember:** This codebase serves people processing grief, disability, and life transitions. Every technical decision ultimately serves that mission. Code quality, accessibility, and compassion are non-negotiable.

**Soli Deo Gloria** 🙏

---

**Version History:**
- v1.2.0 (2026-02-14) - Metrics correction: ship images 536→669, total pages 1,241→1,238, WebP 2,998→3,131
- v1.1.0 (2026-02-12) - Comprehensive accuracy update: ship pages 230→298 (15 cruise lines), ports 147→380, restaurants 25→472, logbooks 40→285, ship images 285→536, WebP 2,345→2,998, SW v13→v14.2.0, CSS ?v=3.0→?v=3.010.400, total pages 561→1,241
- v1.0.0 (2025-11-23) - Initial comprehensive codebase guide created
