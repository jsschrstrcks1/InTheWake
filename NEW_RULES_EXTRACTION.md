# New Rules Extraction (v3.006 → v3.009)

**Purpose:** Document all unique rules, systems, and standards found in v3.006-3.009 files that are NOT already captured in SUPERSET v3.006 (which contains v2.245-v3.002).

**Analysis Date:** 2025-11-23
**Files Analyzed:** 19 files from v3.006-3.009 range
**Base Reference:** FULL_SUPERSET_v3.006.md (2070 lines, 17 sources)

---

## Version Chronology

### SUPERSET v3.006 Contains:
- v2.245: Modular standards
- v2.256: Restaurant standards (.003, .022)
- v2.257: Logbook personas, Venue standards
- v2.4: Historical bundle
- v2.229: Core standards
- v3.001, v3.002, v3.002a: Early v3 standards

### NEW Versions to Extract (v3.006+):
- **v3.007.010:** Unified Modular Standards (Grandeur template baseline)
- **v3.008:** Solo module, Navigation addendum, CI checklists, Article standards
- **v3.009:** Latest comprehensive standards (navigation dropdowns, right rail, CI/CD)

---

## 1. NAVIGATION SYSTEM (v3.008-3.009)

### 1.1 Canonical Navigation Contract (v3.008 - NEW)

**Source:** NAVIGATION_STANDARDS_ADDENDUM_v3.008.md

**Canonical Order (Immutable):**
1. Home
2. Ships
3. Restaurants & Menus
4. Ports
5. Disability at Sea
6. Drink Packages
7. Packing Lists
8. Planning
9. Solo
10. Travel
11. Cruise Lines
12. About Us

**Technical Requirements:**
- HTML Structure: `.navbar > .brand + .pill-nav.pills`
- Brand section includes logo + `.version-badge`
- All links absolute: `https://www.cruisinginthewake.com/...`
- `aria-label="Primary"` required on `<nav>`
- Exactly one `aria-current="page"` per page
- Skip link before header: `<a class="skip-link" href="#content">`
- Version badge must match `<meta name="version">`

**Auto-Highlight Script (Required on every page):**
```javascript
(function setNavCurrent(){
  try{
    const here = new URL(location.href);
    const normalize = u => {
      const url = new URL(u, here.origin);
      let p = url.pathname.replace(/\/index\.html$/,'/').replace(/\/$/,'/index.html');
      return url.origin + p;
    };
    const current = normalize(here.href);
    document.querySelectorAll('.pill-nav a[href]').forEach(a=>{
      const href = a.getAttribute('href');
      if (!href) return;
      const target = normalize(href);
      if (target === current) a.setAttribute('aria-current','page');
    });
  }catch(_){}
})();
```

**Accessibility Contract:**
- Skip link visible on focus
- Minimum touch target: 40px height
- Focus-visible outline: `2px solid var(--sea)`
- Pills wrap naturally on mobile
- No hidden nav without `aria-expanded` toggle

**Compliance Checklist (CI Verifiable):**
- [ ] `.pill-nav.pills` present and correctly ordered
- [ ] `.brand` + logo + version badge exist
- [ ] Canonical absolute URLs used
- [ ] One `aria-current="page"`
- [ ] `aria-label="Primary"` applied
- [ ] Skip-link before header
- [ ] No page deviates in link count/order
- [ ] Version badge matches `<meta name="version">`

### 1.2 Navigation Evolution (v3.009)

**Source:** in-the-wake-standards-v3.009.md

**NEW: Dropdown Menu Support (v3.009)**
- Primary IA with dropdowns: `Home · Planning ▾ · Travel ▾ · About`
- Planning submenu: Planning (overview), Ports, Restaurants & Menus, Ships, Drink Packages, Cruise Lines, Packing Lists, Accessibility
- ARIA-compliant dropdown implementation required
- Maintain keyboard navigation throughout

**Note:** Potential conflict with v3.008 flat navigation - needs resolution in Task 8.

---

## 2. RIGHT RAIL SYSTEM (v3.008-3.009)

### 2.1 Two-Column Layout Standard

**Source:** Solo_Module_Standards_v3.008.019.md, in-the-wake-standards-v3.009.md

**Grid Implementation:**
- Mobile-first: single column
- At `min-width: 980px`: force two columns with `!important`
- Grid template: `minmax(0,1fr) 320px !important`
- Main content: fluid column
- Right rail: fixed 320px width

**Right Rail Content (Standard Composition):**
1. **Authors Rail** (`#authors-list`)
   - Ken & Tina avatars (200×200)
   - Links to author pages
   - Biographical info

2. **Journal Rail** (From the Journal)
   - Source: `/assets/data/articles/index.json`
   - Filtering by keywords (e.g., `keywords.includes('solo')`)
   - Up to 4 items rendered
   - Each item: thumbnail, title, date, author avatar (18×18), excerpt
   - Placeholder images:
     - `/assets/placeholders/article-thumb.jpg?v=3.008`
     - `/assets/placeholders/author.jpg?v=3.008`

### 2.2 Authors.json Schema (v3.009 - NEW)

**Source:** in-the-wake-standards-v3.009.md

```json
{
  "version": "v3.009",
  "authors": [
    {
      "slug": "ken-baker",
      "name": "Ken Baker",
      "title": "Cruise Enthusiast & Technology Lead",
      "url": "/authors/ken-baker.html",
      "image": "/authors/img/ken1.jpg?v=3.009",
      "icon": "/authors/img/ico/ken1ico.webp?v=3.009",
      "bio": "Ken brings technical expertise...",
      "social": {
        "linkedin": "https://linkedin.com/in/...",
        "github": "https://github.com/..."
      }
    }
  ]
}
```

### 2.3 Article Rail Script (Canonical - v3.008)

**Source:** ARTICLE_STANDARDS_v3.008.md

**Hardened Rails Implementation:**
- Derives author from current article's `data-slug` attribute
- Fetches both `/data/authors.json` and `/data/articles.json`
- Populates `#author-rail` with current article's author
- Populates `#recent-articles-rail` with latest 5 articles
- Graceful error handling with console warnings
- Uses `_abs()` helper for absolute URLs

---

## 3. SOLO MODULE SYSTEM (v3.008)

### 3.1 Topbar Layout Changes

**Source:** Solo_Module_Standards_v3.008.019.md, CHECKLIST_SOLO_v3.008.md

**NEW Topbar Structure:**
- Skip link + primary pill nav
- No separate topbar navigation - unified with main nav
- Hero with `role="img"` and meaningful `aria-label`

### 3.2 Article Loading Model

**Fragment Loading:**
- Articles stored as fragments: `/solo/articles/<slug>.html`
- Loaded via `?a=<slug>` or `#<slug>` URL parameters
- Host element: `<article class="card" id="solo-article-host" aria-live="polite">`
- Friendly error UI if fetch fails
- Byline injected if missing (avatar + share link)

**SEO & Sharing Strategy:**
- Deep-linked content gets proper meta tags
- Baseline JSON-LD: `CollectionPage`
- Deep-link injector creates `BlogPosting` when viewing single article
- Each fragment can be shared independently

### 3.3 Media Card Treatment

**Source:** Solo_Module_Standards_v3.008.019.md

**CSS Rules:**
```css
.card {
  border: 4px solid var(--rope);
  border-radius: 1rem;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(8,48,65,.12);
}
```

**Content Integration:**
- Articles ↔ authors ↔ ships ↔ restaurants ↔ ports cross-linking
- Use canonical Logbook disclosures verbatim when applicable
- Clear heading structure, meaningful links, high-contrast UI

---

## 4. CACHING SYSTEM (v3.007 - NEW COMPREHENSIVE SPEC)

### 4.1 Cache Strategy Overview

**Source:** STANDARDS_ADDENDUM__CACHING_v3.007.md

**Cache Names & Limits:**
- `itw-asset-v12`: CSS/JS, HTML, JSON - max ~120 entries
- `itw-img-v12`: Images (jpg/png/webp/avif/svg) - max 320 entries
- Bump suffix (`v12`) on breaking changes
- SW prunes old buckets on activate

**Versioning Rules:**
- Every deploy sets `<meta name="version" content="3.007.x">`
- All same-origin CSS/JS: `?v=${version}` (enforced by cache-buster script)
- Images may omit `?v=`, but hero/author images can include for deterministic updates

### 4.2 Precache Manifest (NEW)

**Path:** `/precache-manifest.json`

**Schema:**
```json
{
  "version": "3.007",
  "assets": [
    "/", "/solo.html", "/ships/ships.html",
    "/assets/styles.css?v=3.007",
    "/assets/index_hero.jpg?v=3.007"
  ],
  "images": [
    "/authors/tinas-images/ncl-jade.webp"
  ],
  "json": [
    "/api/ships.json?v=3.007"
  ]
}
```

**Ordering:** Top-to-bottom = exact fetch order. Most important URLs first.

### 4.3 Seeding Behavior

**Install/Activate:**
- Claim clients
- Delete old `itw-*` caches

**Prewarm (post-activate):**
- Page sends `postMessage({type:'SEED_PRECACHE'})`
- SW fetches `/precache-manifest.json`
- Preloads `assets[]` in order with small delay between requests

**Sitemap Pass (optional):**
- Page reads `/sitemap.xml`
- Filters same-origin URLs
- Sends chunked lists via `postMessage({type:'CACHE_URLS', urls:[...]})`
- SW caches during idle windows

**Guards Applied:**
- Skip seeding when `navigator.connection.saveData === true`
- Skip when `effectiveType === '2g'`
- Small back-off (~150-250ms) between prewarm requests
- Respect `Cache-Control` headers
- HTML/JSON fetched with `cache: 'no-store'`, then `cache.put()`

### 4.4 Runtime Strategies

| Content Type | Strategy | Notes |
|--------------|----------|-------|
| Versioned CSS/JS (`?v=`) | cache-first | Immutable by version |
| Images | stale-while-revalidate | Background refresh |
| HTML & Article Fragments | Network → cache.put() | Fetch with `cache: 'no-store'` |
| APIs / JSON | Mirror to cache or IndexedDB | Add to `json[]` for prewarm |

### 4.5 WebP / OG Images

**Rule:** When hero/byline is WebP, set `og:image:type = image/webp`

**Markup:**
- Prefer `<picture>` with `type="image/webp"` source
- JPEG/PNG fallback `<img>`

### 4.6 User Controls & Ethics

- Provide "Make this site available offline" toggle (future UI)
- Always honor Save-Data
- Prefer Wi-Fi/ethernet for aggressive prewarm
- Monitor storage usage; prune aggressively

---

## 5. CI/CD & QUALITY GATES (v3.008-3.009)

### 5.1 CI Checklist System (v3.008 - NEW)

**Source:** CHECKLIST_*.md files

**Pass Rule:** All ☑ checks must be true. Any ✗ is a hard block.

**Checklist Coverage:**
- Root Index (index.html)
- Ships Index (/ships/index.html)
- Ship Detail (/ships/<line>/<slug>.html)
- Solo (solo.html)
- Travel (travel.html)
- All major page types

### 5.2 CI Checks (v3.009 - NEW)

**Source:** in-the-wake-standards-v3.009.md

**Automated CI Checks:**

1. **Schema Validation**
   - Validate `/assets/data/articles/index.json` against schema
   - Validate `authors.json` structure
   - Fail build on malformed JSON

2. **Forbidden 100vw**
   - Grep for `width: 100vw` or `100vw` in CSS
   - Block commit if found (causes horizontal scroll)

3. **Version Coupling**
   - Check `<meta name="version">` matches `?v=` on assets
   - Ensure consistency across all pages

4. **Navigation Contract**
   - Verify canonical nav order on all pages
   - Check for `aria-current="page"` presence
   - Validate absolute URLs

5. **Avatar Existence**
   - Check all author images in `authors.json` resolve (HTTP 200)
   - Verify fallback placeholders exist

### 5.3 GitHub Actions Workflow (v3.009 - SPEC)

**Source:** in-the-wake-standards-v3.009.md

**Workflow Specification:**
```yaml
name: Standards Validation
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Validate JSON schemas
        run: node scripts/validate-schemas.js
      - name: Check for forbidden 100vw
        run: grep -r "100vw" assets/styles/ && exit 1 || exit 0
      - name: Version coupling check
        run: node scripts/check-versions.js
      - name: Nav contract validation
        run: node scripts/validate-nav.js
      - name: Avatar existence check
        run: node scripts/check-avatars.js
```

### 5.4 Cache-Busting Enforcement (v3.009)

**NEW Requirement:**
- All pages must version-bust JSON on every fetch: `?v=` + cache: 'no-store'
- Prevents stale article/author data
- Critical for author rail accuracy

---

## 6. ARTICLE PRODUCTION SYSTEM (v3.008)

### 6.1 Folder Conventions

**Source:** ARTICLE_STANDARDS_v3.008.md

```
/solo/                              # section
  why-i-started-solo-cruising.html  # article file

/assets/articles/
  why-i-started-solo-cruising.webp?v=3.008
  why-i-started-solo-cruising.jpg?v=3.008

/authors/
  ken-baker.html
  tina-maulsby.html

/authors/img/
  ken-baker.jpg?v=3.008
  ken1.webp?v=3.008
  ken1.jpg?v=3.008          # required fallback
  tina-maulsby.jpg?v=3.008

/authors/img/ico/
  ken1ico.webp?v=3.008
  tinaico.webp?v=3.008

/data/
  articles.json              # article index
  authors.json               # author bios + headshots
```

### 6.2 Articles.json Schema (v3.008)

```json
{
  "version": "v3.008",
  "articles": [
    {
      "id": "why-i-started-solo-cruising",
      "title": "Why I Started Solo Cruising (and Built a Community)",
      "url": "/solo/why-i-started-solo-cruising.html",
      "date": "2025-10-18",
      "excerpt": "From that first solo gangway...",
      "image": "/assets/articles/why-i-started-solo-cruising.jpg?v=3.008",
      "author": {
        "name": "Tina Maulsby",
        "url": "/authors/tina-maulsby.html",
        "image": "/authors/img/tina-maulsby.jpg?v=3.008"
      },
      "keywords": ["solo", "community", "safety", "first-time"]
    }
  ]
}
```

**Rules:**
- `id` matches HTML `<article id>` and filename slug
- `image` points to JPG fallback (WebP handled via `<picture>`)
- Update version on every content change

### 6.3 Visual & CSS Hooks (v3.008)

```css
.card {
  border: 4px solid var(--rope);
  border-radius: 1rem;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(8,48,65,.12);
}

.article-hero img {
  display: block;
  width: 100%;
  height: auto;
}

.attribution {
  font-size: .85rem;
  padding: .5rem .75rem;
  color: #083041a8;
  text-align: left;
}

.pull blockquote {
  font-size: 1.25rem;
  margin: 0;
  padding: 1rem 1.25rem;
}

.cta.card {
  padding: 1.25rem;
}

.button {
  display: inline-block;
  padding: .6rem 1rem;
  border-radius: .75rem;
}

.button.ghost {
  background: transparent;
  border: 2px solid currentColor;
}

.rail .rail-card {
  border-left: 4px solid var(--rope);
  padding-left: .75rem;
  margin-bottom: 1rem;
}
```

---

## 7. SHIP PAGE ENHANCEMENTS (v3.007.010)

### 7.1 Invocation Edition (NEW APPROACH)

**Source:** InTheWake_Ship_Standards_v3.007.070.md

**NEW: Reverent Coding Philosophy**

Every ship page includes invocation:
```html
<!-- Soli Deo Gloria — Every pixel and part of this project is offered
     as worship to God, in gratitude for the beautiful things He has
     created for us to enjoy. -->
```

**Scriptural Foundation:**
> "Whatever you do, work heartily, as for the Lord and not for men."
> — Colossians 3:23

**Invocation Footer (Visible):**
```
Let all who set code to canvas here remember: we build upon the waters of grace.
Soli Deo Gloria — To God Alone Be the Glory.

© 2025 In the Wake — A Cruise Traveler's Logbook
```

### 7.2 Service Worker Updates (v3.007.070)

| Type | Cache | Strategy | Limit |
|------|--------|-----------|--------|
| Images | `itw-img-v10` | stale-while-revalidate | 240 |
| Assets | `itw-asset-v10` | cache-first | 40 |

**Note:** Later versions (v3.007 caching spec) increased limits to 320/120.

---

## 8. UNIFIED MODULAR STANDARDS (v3.007.010)

### 8.1 Version Lineage & Governance

**Source:** Unified_Modular_Standards_v3.007.010.md

**Version Lineage:**
v2.233 → v2.245 → v2.256(.003/.022) → v2.4 → v2.257 → v3.001 → v3.002 → v3.003 → **v3.007.010**

**Merge Policy (Golden Merge):**
- Newer wins
- Additive only
- No regressions
- Explicit supersession notes

**Contracts Not to Rename Without Migration:**
`.card`, `.pills`, `.pill-nav`, `.grid-2`, `.visually-hidden-focusable`, `.hidden`, `.swiper.*`, `.voyage-tips`, `.prose`, `#vx-grid .vx`

### 8.2 Modular Taxonomy (Perplexity-aligned)

**00-Core:**
- EVERY-PAGE_STANDARDS.md
- HEAD_SNIPPET.html
- FOOTER_SNIPPET.html
- HIDDEN_INVOCATION_COMMENTS.html
- SEO_STRUCTURED_DATA.md + JSONLD_TEMPLATES/

**01-Index-Hub:**
- INDEX-HUB_STANDARDS.md
- SHIPS-INDEX_STANDARDS.md
- scripts/fleet-cards.js

**02-Ship-Page:**
- SHIP-PAGE_STANDARDS.md
- SWIPER_STANDARDS.md
- VIDEO-SOURCES_STANDARDS.md
- DINING-CARD_STANDARDS.md

**03-Data:**
- GOLDEN-MERGE_SPEC.md
- DATA-SCHEMAS.md

**04-Automation:**
- CADENCE_STANDARDS.md

**05-Brand:**
- TONE-AND-ETHOS.md
- INVOCATION-BANNER.md

**06-Legal Attribution:**
- ATTRIBUTION_STANDARDS.md

**07-Analytics:**
- ANALYTICS_STANDARDS.md

**08-Root / Main**
**09-Restaurants Hub**
**10-Venue Standards**
**11-Logbook Personas**
**12-PWA Layer**
**13-Security & Privacy**
**14-Ship Enhancements**
**15-Accessibility Details**
**16-Performance Requirements**
**17-QA Checklists**
**18-JSON Schema Fragments**
**19-Reusable Snippets**
**20-Editor, Dev, QA Workflow Notes**

### 8.3 Key Technical Requirements

**Every Page Standards:**
- Exactly one `<h1>` (may be visually hidden)
- Landmarks: `<header>`, `<main id="content" tabindex="-1">`, `<footer>`
- Skip link to `#content` using `.visually-hidden-focusable`
- Absolute URLs only; `_abs()` available before any fetch/linking
- Versioned assets `?v=__VERSION__`
- Watermark background with low opacity (.06–.08)
- Persona disclosure pill when first-person narrative present
- Referrer policy: `<meta name="referrer" content="no-referrer">`

**Head Snippet Order:**
1. `<!doctype html>` + `<html lang="en">`
2. `<meta charset="utf-8">`
3. `<meta name="viewport"...>`
4. Analytics (Google tag async; Umami defer)
5. `_abs()` helper and canonicalization (apex→www)
6. `<title>`, description, robots, theme-color, version
7. Canonical + OG/Twitter meta
8. CSS bundle + Swiper loader (self-hosted with CDN fallback)
9. Optional preconnects/preloads (LCP image, YouTube-nocookie, etc.)

**Footer Snippet:**
- Cache pre-warm via `SiteCache.getJSON()` (fleet, venues, personas, videos)
- Service worker registration (`/sw.js?v=__VERSION__`) with fail-safe
- Hidden doxology comment injection

### 8.4 Structured Data Lineup (v3.007.010)

**Required:**
- Organization
- WebSite+SearchAction
- WebPage
- BreadcrumbList
- **One** Review (numeric ratingValue)

**Recommended OG Image:** 1200×630; must resolve 200

### 8.5 Data Blocks & JSON Fallbacks

- **Ship Stats Fallback:** inline `<script type="application/json">` + renderer
- **Videos Data:** inline list or `videos:{...}` object; nocookie embeds; dedupe IDs
- **Logbook Personas:** remote JSON at `_abs('/ships/<line>/assets/<slug>.json')` with minimal markdown renderer

### 8.6 Entertainment / Venues / Bars

- Static HTML seed + JSON augmentation
- Cards carry `data-tags` for filtering
- Filter UI: `.chips.pill-nav.pills` with `aria-pressed` toggles
- Searchable via `#vx-search`
- Disclaimer: lineup changes by sailing

### 8.7 Live Tracker (Hybrid VesselFinder)

- Prefer AISMap
- Fallback to iframe details page
- Refresh iframe every 60s with cache-busting `t=` param

### 8.8 Accessibility Details

- Carousels: `aria-roledescription="carousel"`, labelled headings; Swiper a11y ON
- Live regions: logbook body `aria-live="polite"`
- Hero as `<img alt="">` or container with `role="img" aria-label=""`
- Chips/filters maintain `aria-pressed` and `.is-on`
- Skip link focusable and visible on focus

### 8.9 Performance Requirements

- LCP image `fetchpriority="high"`
- Fixed aspect ratios for carousels
- Lazy-load non-critical images & iframes
- Version all local assets `?v=3.007.010`
- Avoid layout thrash
- Prevent CLS > 0.1

### 8.10 QA Checklists

**SEO/A11y:**
- [ ] One H1 (visible or hidden, but accessible)
- [ ] Canonical points to production; OG/Twitter present; OG image 200+ and sized
- [ ] BreadcrumbList JSON-LD and a single Review JSON-LD (numeric rating)
- [ ] Skip link moves focus to `#content`
- [ ] Chips/buttons use `aria-pressed` when toggled

**JS/CSS:**
- [ ] Swiper loads or `html.swiper-fallback` engages (no console red)
- [ ] Videos carousel renders or shows fallback text
- [ ] Live tracker hybrid fallback working
- [ ] Entertainment JSON augments grid without duplicates
- [ ] External link upgrader runs; `mailto:` / `tel:` unaffected
- [ ] No mixed content on staging/CDN (URL normalizer works)

**Perf:**
- [ ] Lighthouse CLS ≤ 0.10; LCP within target on cable-3G
- [ ] Third-party scripts async/defer; no render-blocking CSS beyond critical

---

## 9. CONFLICTS & CLARIFICATIONS NEEDED

### 9.1 Navigation Architecture Conflict

**Conflict:** v3.008 vs v3.009 navigation structure

**v3.008 (NAVIGATION_STANDARDS_ADDENDUM):**
- Flat 12-item pill navigation
- Canonical order fixed and immutable
- No dropdowns mentioned

**v3.009 (in-the-wake-standards):**
- Dropdown menu support
- Primary IA: `Home · Planning ▾ · Travel ▾ · About`
- Planning submenu with 8 items

**Resolution Needed:** Determine if v3.009 supersedes v3.008, or if they serve different contexts.

### 9.2 Cache Version Numbers

**Conflict:** Different cache version numbers across files

**v3.007.070 (Ship Standards):**
- `itw-img-v10` (limit: 240)
- `itw-asset-v10` (limit: 40)

**v3.007 (Caching Addendum):**
- `itw-img-v12` (limit: 320)
- `itw-asset-v12` (limit: 120)

**Resolution:** v3.007 Caching Addendum is more recent and comprehensive. Use v12 caches with 320/120 limits.

### 9.3 Solo Module Variations

**Multiple Solo Module Files:**
- Solo_Module_Standards_v3.008.019.md
- Solo_Cruising_Module_Standards_v3.008.solo.002.md
- SOLO-MODULE-STANDARDS_v3.008.019.md (redirect stub)

**Resolution Needed:** Consolidate into single canonical solo module standard.

---

## 10. ANALYSIS STATUS

### Files Read (19 total):

**v3.009 (3 files):**
- ✅ in-the-wake-standards-v3.009.md (184 lines)
- ✅ IN-THE-WAKE-STANDARDS_v3.009.md (duplicate check needed)
- ✅ in-the-wake-standards-v3.009 2.md (duplicate check needed)

**v3.008 (13 files):**
- ✅ Solo_Module_Standards_v3.008.019.md (222 lines)
- ✅ Solo_Cruising_Module_Standards_v3.008.solo.002.md (238 lines)
- ✅ Unified_Modular_Standards_v3.008.001.md (127 lines)
- ✅ NAVIGATION_STANDARDS_ADDENDUM_v3.008.md (156 lines)
- ✅ CHECKLIST_SHIP_DETAIL_v3.008.md (37 lines)
- ✅ CHECKLIST_SHIPS_INDEX_v3.008.md (32 lines)
- ✅ CHECKLIST_INDEX_v3.008.md (42 lines)
- ✅ CHECKLIST_TRAVEL_v3.008.md (45 lines)
- ✅ CHECKLIST_SOLO_v3.008.md (87 lines)
- ✅ ARTICLE_STANDARDS_v3.008.md (169 lines)
- ✅ ARTICLE-STANDARDS_v3.008.md (4 lines - redirect)
- ✅ ARTICLE-PRODUCTION-STANDARDS_v3.008.md (4 lines - redirect)
- ✅ SOLO-MODULE-STANDARDS_v3.008.019.md (4 lines - redirect)

**v3.007 (3 files):**
- ✅ Unified_Modular_Standards_v3.007.010.md (309 lines)
- ✅ STANDARDS_ADDENDUM__CACHING_v3.007.md (193 lines)
- ✅ InTheWake_Ship_Standards_v3.007.070.md (131 lines)

### Remaining Files to Analyze: ~101 files

**Priority Categories:**
1. Specialized standards (SEO, analytics, accessibility)
2. Template examples (.html, .js, .css files)
3. Additional versioned standards (v3.003-v3.006)
4. JSON schema files
5. Historical v2.x files for context

---

## 11. NEXT STEPS

1. **Continue Rule Extraction:** Read remaining ~101 unique files
2. **Document Conflicts:** Build comprehensive conflict list for Task 8
3. **Verify Against Implementation:** Check current HTML files (Task 7)
4. **Consolidate Standards:** Build /new-standards/ structure (Task 9)
5. **Update Documentation:** Revise admin/claude/ references (Task 10)
6. **Evaluate Discards:** Review duplicate groups for salvageable content (Task 11)

---

**Document Status:** In Progress (19 of 137 files analyzed)
**Last Updated:** 2025-11-23
**Next Update:** After analyzing specialized standards files
