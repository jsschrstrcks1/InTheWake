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

## 10. LOGBOOK PERSONAS SYSTEM (v2.257)

**Source:** ships-logbook-personas-standards-v2.257.md

**10 Persona Archetypes:**
| Persona | Core Concept | Emotional Arc |
|----------|---------------|----------------|
| P1-Elmer | Grandfather rediscovering joy with family | Nostalgic, thankful, tearful at reconnection |
| P2-Marissa | Solo woman rediscovering confidence | Independence, peace, renewal |
| P3-Lydia | Single mom finding rest and family unity | Healing, bonding, laughter |
| P4-Tom & Jean | Empty nesters | Romance reborn at sea |
| P5-Nathan | Workaholic learning to disconnect | Conviction → calm |
| P6-Maya & Jordan | Young newlyweds | Wonder, humor, shared faith |
| P7-Carlos | Disabled veteran | Reflection, healing, belonging |
| P8-Grace | Mission trip return | Purpose, gratitude, closure |
| P9-Danielle & Friends | Girl's getaway | Joy, laughter, community |
| P10-Ezekiel | Pastor on sabbatical | Quiet renewal, faith restored |

**Required Metadata:**
- `id`: Unique lowercase identifier (e.g., `p1-elmer`)
- `persona_label`: Short editorial note (1-2 sentences max)
- `title`: Compelling, headline-quality title
- `markdown`: Full logbook entry (rich Markdown format)
- `nav_port / nav_starboard`: Links to next/previous persona entries

**Mandatory Disclosure (v2.257):**
```
Full disclosure: I have not yet sailed [Ship Name]. Until I do, this Logbook
is an aggregate of vetted guest soundings, taken in their own wake, trimmed
and edited to our standards.
```

**Tone Guidance:**
- Prioritize heartwarming, with occasional bittersweet moments
- Avoid cynicism or overt salesmanship — sincerity first
- Integrate nautical language naturally ("wake," "helm," "port," "starboard," "deck")
- Optionally include subtle faith references (answered prayers, gratitude, sunsets, fellowship)

**Validation Checklist:**
- [ ] JSON validates against schema v2.257
- [ ] All dates and itineraries match real 2024-2025 RCL deployments
- [ ] Disclosure text exact and unmodified
- [ ] Markdown under 1200 words (excluding disclosure)
- [ ] Each persona includes a "tear-jerker" moment
- [ ] No duplicate names or story templates reused
- [ ] Language: warm, nautical, faith-compatible

---

## 11. VENUE/RESTAURANT SYSTEM (v2.256-v2.257)

### 11.1 Canonical Venue Pages (v2.256.003)

**Source:** restaurants-standards_v2.256_maritime-dining.md

**R-1 Canonical Venue Pages:**
- One canonical page per venue: `/restaurants/<slug>.html`
- Ship pages link to canonical venue page
- Venue page links back to ship pages where available

**R-2 Variants & One-Off Menus:**
- Ship/class-specific items live within canonical page under "Ship-Specific Variants"
- Receive stable anchor (e.g., `#icon-class-variant`)
- Ship dining cards may deep-link to variant anchor

**R-3 Menus & Prices:**
- Include "Core Menu (Fleetwide Standard)" with prices when verified
- Unverified entries labeled and placed behind "To Verify" note
- Global price disclaimer: "Prices are subject to change at any time without notice. These represent what they were the last time I sailed."

**R-4 Special Accommodations:**
- Dedicated card for gluten-free, vegetarian, and allergy protocols
- Include pre-sailing notification guidance and onboard confirmation

**R-5 Logbook — Dining Disclosures:**
- Use adapted Logbook disclosures (A/B/C) for dining
- Example B: "Aggregate of vetted guest soundings… trimmed and edited to our dining standards."
- Place immediately under Logbook header, inside `.pill` element

**R-6 Styling & Compliance:**
- Absolute URLs everywhere
- `<meta name="referrer" content="no-referrer">`
- Watermark at ~0.08 opacity on cards
- Version badge present on every restaurant page

### 11.2 Comprehensive Venue Standards (v2.257)

**Source:** venue-standards.md (424 lines)

**Price Governance (Bands by Class):**
- Lunch: $21–$25 typical
- Dinner: $39–$65 typical (+18% gratuity)
- Add-ons: Lobster tail ~$21
- Children 6–12: ~50% for fixed-price venues
- Display format: "Lunch $21–25 · Dinner $39–65 (varies by ship/class)"

**Allergen Micro-Component:**
```html
<div class="allergen-micro" role="note">
  <p class="pill"><strong>Allergen & Dietary Notes:</strong>
  Royal Caribbean follows SAFE Food Policy...</p>
</div>
```

**Persona Review Policy:**
- Exactly one persona review block per venue page
- Must include "Depth Soundings" disclaimer pill
- Tone: candid, descriptive, avoids absolutes, 90–130 words
- Never quote private groups; prefer public forums (Reddit, CC, RCBlog, X)

---

## 12. MODULAR STANDARDS FOUNDATION (v2.245)

**Source:** in-the-wake-modular-standards-v2-245.md

**FORCE-WWW POLICY:**
```javascript
(function enforceWWW(){
  try{
    var h = location.hostname;
    if (h === 'cruisinginthewake.com'){
      location.replace('https://www.'+h+location.pathname+location.search+location.hash);
    }
  }catch(e){}
})();
```

**CSS Variables Required:**
`--sea, --foam, --rope, --ink, --sky, --accent`

**Navigation Bar (v2.245):**
- Use `.pills` horizontal nav
- Links: Home, Ships, Restaurants & Menus, Ports, Disability at Sea, Drink Packages, Packing Lists, Cruise Lines, Solo, Travel
- Must remain one line on desktop
- Horizontal scroll on mobile with hidden scrollbar

---

## 13. CRUISE LINES PAGE (v2.4)

**Source:** cruise-lines-standards.md

**Class Pill Reorder Script:**
```javascript
const CLASS_RANK = {
  icon:1, oasis:2, quantum:3, freedom:4, voyager:5, radiance:6, vision:7
};
```

---

## 14. V3.001-V3.002 EVOLUTION

### 14.1 Unified Modular Standards v3.001

**Source:** UNIFIED_MODULAR_STANDARDS_v3.001.md (150 lines read)

**Version Lineage:**
v2.233 → v2.245 → v2.256(.003/.022) → v2.4 → v2.257 → **v3.001**

**Governance Principles:**
- No regressions - older modules remain valid until explicitly deprecated
- Additive hierarchy - each version extends without deletion
- Explicit supersession - conflicts resolved by newest version tag
- Atomic commits - every artifact must pass CI fingerprint & checksum tests
- Accessibility & SEO parity - all modules must reach ≥ AA contrast, semantic order, OG/Twitter parity

**Versioning Convention:**
- v3.major.minor format
- Increment major for structure or JSON schema changes
- Increment minor for style/script changes

**Global Root Policies:**
- Enforce `_abs()` absolute path builder in `<head>` prior to any resource call
- Canonicalization: session-guarded redirect from apex → www host
- Analytics: Umami snippet immediately after viewport meta
- Swiper Loader: resilient primary + CDN fallback auto-loader
- Persona Disclosure: required where first-person narrative present
- Fetch Policy: only same-origin JSON via `_abs()`
- Version Param: append `?v=__VERSION__` to every asset

### 14.2 Frontend Standards v3.002a

**Source:** STANDARDS_v3.002a.md (181 lines)

**Core Meta Requirements:**
```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://www.cruisinginthewake.com/[page].html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="In the Wake">
<meta name="twitter:card" content="summary_large_image">
```

**External Link Policy (NEW in v3.002a):**
All external links must:
- Open in new tab (`target="_blank"`)
- Use `rel="noopener noreferrer"`
- Not send referrer data

**Automatic Enforcement Script:**
```javascript
document.addEventListener('DOMContentLoaded', function(){
  document.querySelectorAll('a[href^="http"]').forEach(a=>{
    try {
      const u = new URL(a.href);
      if (u.hostname !== location.hostname) {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      }
    } catch(_) {}
  });
}, {once:true});
```

**SiteCache Integration & Race-Guard:**
```javascript
function ensureSiteCache(){
  return new Promise((resolve)=>{
    if (window.SiteCache && typeof SiteCache.getJSON==='function') return resolve();
    const s=document.createElement('script');
    s.src=_abs('/assets/js/site-cache.js'); s.defer=true;
    s.onload=resolve; s.onerror=resolve; // fail-open
    document.head.appendChild(s);
  });
}
```

**JSON Data Version Paths:**
| File | Version Path |
|------|---------------|
| `/assets/data/fleet_index.json` | `version` |
| `/assets/data/venues.json` | `meta.version` |
| `/assets/data/personas/index.json` | `version` |

**Image Cache Behavior (Service Worker):**
- Caches only same-origin images
- Ignores querystrings when matching
- Uses **SWR** strategy: serve cache → refresh silently
- Soft cap: 200 entries (oldest evicted first)

**Smart Warmup Standard (v1.6, v3.002-compliant):**
Key functions:
- `warmGlobalJSON()` → prefetch fleet, venues, personas
- `warmShipSpecific(ctx)` → prefetch ship assets
- `warmRestaurants()` → preload hero & thumb images
- `warmChrome()` → preload logo, watermark, compass

All triggered via `requestIdleCallback` (fallback to `setTimeout`).

### 14.3 JavaScript Reliability Addendum v3.002

**Source:** InTheWake_Standards_v3.002.md

**Graceful Failure Compliance:**
All client-side data dependencies must:
1. Load through guarded `loadGracefully()` pattern
2. Provide human-readable fallback messaging (`setStatus("Could not load …")`)
3. Expose visible **Retry** control when critical data fails
4. Attempt recovery via:
   - `SiteCache.getJSON()` (fresh)
   - direct `fetch()` with timeout ≤ 8 seconds
   - last-known valid localStorage record (even expired)
5. Never block UI or break filters if data fetch fails
6. Update warm-up prefetch calls to use correct versionPath arrays

### 14.4 Standards Addendum v3.002 (WCAG + Motto)

**Source:** in-the-wake-standards-addendum-v3.002.md

**Motto Integration:**
```html
<p class="motto"><em>The calmest seas are found in another's wake.</em></p>
```

**WCAG 2.1 Level AA & ADA Compliance:**

**Key Areas:**
1. **Perceivable:**
   - All images require meaningful `alt` attributes (decorative use `alt=""`)
   - Text contrast ratio ≥ 4.5:1 (7:1 for essential content when possible)
   - Content navigable via screen readers (semantic HTML)

2. **Operable:**
   - "Skip to main content" link required at top of every page
   - All interactive elements keyboard-accessible with visible focus
   - Avoid time-dependent interactions or auto-refresh

3. **Understandable:**
   - Navigation consistent across all pages
   - Input fields have associated `<label>` elements
   - Clear error messages and instructions

4. **Robust:**
   - Code validates under W3C HTML standards
   - Avoid ARIA roles unless necessary
   - JavaScript interactions gracefully degrade

**Legal Compliance Footer (Required on Accessibility Pages):**
```html
<p class="legal-note">
  This website conforms to the ADA and WCAG 2.1 Level AA standards for
  digital accessibility. We are committed to ensuring equal access and
  usability for all visitors. If you encounter a barrier or accessibility
  issue, please contact us at
  <a href="mailto:accessibility@cruisinginthewake.com">accessibility@cruisinginthewake.com</a>.
</p>
```

### 14.5 Standards v3.006 Addendum (Invocation + Compliance)

**Source:** inthewake-v3-006-standards-addendum.md

**Invocation (Required in Two Places):**
```html
<!--
Soli Deo Gloria
All work on this project is offered as a gift to God.
"Trust in the LORD with all your heart, and do not lean on your own understanding." — Proverbs 3:5
"Whatever you do, work heartily, as for the Lord and not for men." — Colossians 3:23
-->
<footer class="tiny center">Soli Deo Gloria — All work on this project is offered to God.</footer>
```

**Canonical URLs (No GitHub in Production):**
- MUST use absolute `https://www.cruisinginthewake.com/...`
- MUST NOT use GitHub links except in separate "staging" profile

**Top Navigation Style:**
- MUST render using `.pill-nav.pills` (not just `.nav`)
- Acceptable order: **brand → pills** within `.navbar`
- `aria-current="page"` required on active link

**Search-First Layout:**
- MUST place Search section before Classes/Ships
- MUST use shared `setupShipSearch(data)` hook only
- `window.SHIP_DATA` must use absolute URLs

**Single Hero / Single Compass Rule:**
- MUST include exactly one `.hero` and one `.hero-compass`
- MUST NOT include extra compass roses unless using `page-watermark` component

**Every Page Meta Requirements:**
```html
<meta name="page:version" content="v3.006">
<meta name="standards:baseline" content="3.006">
```

**Version Synchronization Rule:**
ALL must match:
- Title `(v3.006)`
- `<meta name="page:version" content="v3.006">`
- `<meta name="standards:baseline" content="3.006">`
- All cache-busting query params `?v=3.006`
- Service Worker: `/sw.js?v=3.006`

**Ship Page MUST Checklist:**
- ✅ UTF-8 Invocation comment at top
- ✅ Title + meta + .version-badge all match
- ✅ Canonical `<link>` and absolute URLs only
- ✅ Pills nav present (`.pill-nav.pills`)
- ✅ Search-first layout with setupShipSearch
- ✅ Single hero + single compass
- ✅ OG/Twitter + JSON-LD present
- ✅ Reduced-motion CSS guard present
- ✅ Service worker registered
- ✅ Visible footer invocation line
- ✅ All versioned assets and cache busters correct
- ✅ `standards:baseline=3.006` present

---

## 15. WCAG 2.1 AA COMPREHENSIVE SPEC (v3.100)

**Source:** standards-wcag-addendum-v3.100.md (211 lines)

### 15.1 Definition of Done (Must Pass to Merge)

- ✅ **Keyboard-only**: all interactive elements reachable, operable, escape-able; visible focus always
- ✅ **Contrast**: text ≥ 4.5:1 (normal) / 3:1 (≥18 pt or 14 pt bold); UI parts & focus indicators ≥ 3:1
- ✅ **Structure**: exactly one `<h1>`, ordered headings, landmarks present
- ✅ **Images/media**: accurate `alt`; decorative `alt=""`; video has captions
- ✅ **Reflow/responsive**: no horizontal scroll at 320px width; usable at 400% zoom
- ✅ **Pointer/keyboard parity**: never hover-only; all interactions have keyboard equivalent
- ✅ **Status messages**: announced via `aria-live` when content updates
- ✅ **Motion/flashing**: respects `prefers-reduced-motion`; no content flashes > 3 times/second
- ✅ **Programmatic names**: links/buttons have meaningful text; icons get `aria-label`
- ✅ **Automated checks**: pa11y/axe/Lighthouse AA gate passes; manual screen reader spot-check

### 15.2 Global Patterns

**Skip Link (Required on Every Page):**
```html
<a class="skip-link" href="#content">Skip to main content</a>
```
```css
.skip-link{position:absolute;left:-999px;top:auto}
.skip-link:focus{left:12px;top:12px;z-index:9999;background:#fff;
                 border:2px solid var(--accent);padding:.4rem .6rem;
                 border-radius:8px;outline:none}
```

**Focus Visibility (Do Not Remove Outlines):**
```css
:focus{outline:2px solid #0e6e8e; outline-offset:2px}
:focus-visible{outline:3px solid #0e6e8e; outline-offset:2px}
.pill:focus-visible,.chip:focus-visible{box-shadow:0 0 0 3px rgba(14,110,142,.25)}
```

**Color/Contrast Tokens (Ensure AA):**
```css
:root{
  --ink:#083041;           /* text on light background */
  --accent:#0e6e8e;        /* links/buttons (AA on white) */
  --pill-bg:#ffffff;
  --pill-border:#bfa172;   /* slightly darker than rope for contrast */
}
```

**Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce){
  *{animation-duration:.001ms!important;animation-iteration-count:1!important;
    transition-duration:.001ms!important;scroll-behavior:auto!important}
}
```

**Keyboard Disclosure Pattern (Menus, Trays):**
```javascript
document.querySelectorAll('[aria-controls]').forEach(btn=>{
  const panel=document.getElementById(btn.getAttribute('aria-controls'));
  if(!panel) return;
  btn.addEventListener('click',()=> {
    const open = btn.getAttribute('aria-expanded')==='true';
    btn.setAttribute('aria-expanded', String(!open));
    panel.hidden = open;
  });
  btn.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      btn.setAttribute('aria-expanded','false');
      panel.hidden=true;
      btn.focus();
    }
  });
});
```

### 15.3 Automated Testing in CI

**pa11y-ci.json:**
```json
{
  "defaults": {
    "standard": "WCAG2AA",
    "level": "error",
    "timeout": 60000
  },
  "urls": [
    "https://www.cruisinginthewake.com/index.html",
    "https://www.cruisinginthewake.com/restaurants.html",
    "https://www.cruisinginthewake.com/ports.html",
    "https://www.cruisinginthewake.com/disability-at-sea.html"
  ]
}
```

**.github/workflows/a11y.yml:**
```yaml
name: a11y
on: [push, pull_request]
jobs:
  pa11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci || npm i
      - run: npx pa11y-ci
```

### 15.4 Reflow & Responsiveness

- Test at **320px** width and 400% zoom
- No horizontal scrolling for main content
- Grids must stack
- Minimum target size ≥ **44×44 px** for touch controls

### 15.5 Quick Retrofits (Action List)

- Add skip link and `id="content"` on all pages
- Ensure focus styles exist and are not suppressed
- Add `aria-live="polite"` to status elements
- Verify contrast of pills/chips and small text
- Add `.sr-only` label for search inputs
- Confirm keyboard behavior for tray menus (Enter/Space open/close, Escape closes)

---

## 16. HISTORICAL STANDARDS (v2.228-v2.4)

### 16.1 v2.228 Golden Reference

**Source:** in-the-wake-standards-v2-228.md (100 lines read)

**Key Historical Context:**
- **Golden Reference:** `/ships/rcl/grandeur-of-the-seas.html` is visual/structural gold standard
- Do not edit that file - everything else must match its structure
- **Historical Hosting:** jsschrstrcks1.github.io/InTheWake (GitHub Pages)
- **Evolved to:** www.cruisinginthewake.com (current canonical)

**Global Principles:**
- Single source of truth
- Deterministic output
- Absolute paths only
- Double-Check Mandate (CI checks before shipping)
- Continuity is king
- **Additive changes only** - never delete existing rules
- Site tree maintenance (`/data/site_tree.json`)

**Primary Pill Navigation (v2.228):**
Home • Ships • Restaurants & Menus • Ports • Disability at Sea • Drink Packages • Packing Lists • Cruise Lines • Solo • Travel

### 16.2 v2.4 Bundle

**Source:** InTheWake_Standards_v2.4/README.md, changelog.md

**What's Inside:**
- root-standards.md — Global rules
- main-standards.md — Head/meta/SEO, assets, Swiper
- ships-standards.md — Ship page schema + sections + JSON
- cruise-lines-standards.md — Cruise line landing pages
- examples/ — Minimal HTML scaffolds

**Changelog v2.4:**
- Added Umami analytics snippet (global requirement)
- Implemented GitHub Pages-safe canonicalization (no reload loops)
- Standardized `_abs()` helper usage site-wide
- Updated Logbook loader (same-origin sources with failover + markdown mini-renderer)
- Updated Videos loader (de-dupe and nocookie embeds)
- Clarified data contracts (fleet index, dining JSON, videos JSON, logbook JSON)
- Persona disclosure lines policy added

### 16.3 Standards v3.006 Consolidation

**Source:** standards/README.md, CHANGELOG.md, conflicts_report.md

**Bundle Purpose:**
Consolidates **every uploaded standard** (zips + markdown), preserving **every word** verbatim. No edits, no deletions. Conflicts are **not resolved** - documented for manual decision.

**What's Inside:**
- `FULL_SUPERSET_v3.006.md` — complete concatenation with provenance blocks
- `core/`, `dining/`, `logbook/`, `schemas/`, `sw/`, `ship-pages/`, `checklists/`
- `conflicts/conflicts_report.md` — files with same stem across sources

**Changelog v3.006 (Invocation Edition):**
- Added Invocation header to all modules
- Added Every Page Standards (Core Module)
- Added Hidden Invocation Comment canonical file
- Integrated social-sharing JSON-LD compliance fixes (position, itemReviewed)
- Reintroduced hidden HTML invocation seal (Proverbs 3:5, Colossians 3:23)
- Maintained full verbatim inheritance from v3.002 and v3.004
- Timestamped invocation audit cycle (daily + session start)
- No text removed — only reverent contextualization added

**Identified Conflicts:**
- cruise-lines-standards (v2.4 vs v3.001)
- main-standards (v2.4 vs v3.001)
- root-standards (v2.4 vs v3.001)
- ships-standards (v2.4 vs v3.001)

---

## 17. DATA & MERGE SPECIFICATIONS (v3.006)

### 17.1 Golden Merge (Superset) Spec

**Source:** standards/03-data/GOLDEN-MERGE_SPEC.md

**Rules:**
- **Union, not intersection**: include all keys/columns seen in any source
- **Preserve provenance**: for conflicting values, keep both as array with `source` annotations
- **Stable dedupe**: on entities (ships) prefer `slug` stable IDs; synthesize from name if absent
- **Order**: stable natural order; do not sort lexically if ordering signal exists (e.g., `year`)

### 17.2 Data Schemas

**Source:** standards/03-data/DATA-SCHEMAS.md

**Ship:**
- name (string), slug (kebab), status (active|historical), class, year, gt, capacity

**Cruise Line:**
- name, slug

### 17.3 Brand Standards

**Tone & Ethos (v3.006):**
Reverent, generous, precise, welcoming. Professional but warm. All craft offered as a gift to God; serve readers well.

**Invocation Banner (v3.006):**
Optional visible banner that sets reverent tone. Placement: below hero or near footer. Keep tasteful and brief; do not distract from content.

---

## 18. ANALYSIS STATUS

### Files Read (50 total):

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

**v3.006 (8 files):**
- ✅ INDEX-HUB_STANDARDS.md (15 lines)
- ✅ SHIP-PAGE_STANDARDS.md (11 lines)
- ✅ SWIPER_STANDARDS.md (5 lines)
- ✅ CADENCE_STANDARDS.md (5 lines)
- ✅ DINING-CARD_STANDARDS.md (6 lines)
- ✅ VIDEO-SOURCES_STANDARDS.md (5 lines)
- ✅ ATTRIBUTION_STANDARDS.md (7 lines)
- ✅ ANALYTICS_STANDARDS.md (4 lines)

**v3.009 Encyclopedia (2 files):**
- ✅ w templates.../EVERY-PAGE_STANDARDS.md (50 lines - v3.009 version)
- ✅ w templates.../SEO_STRUCTURED_DATA.md (19 lines)

**v2.x Historical (7 files):**
- ✅ venue-standards.md v2.257 (424 lines - comprehensive)
- ✅ restaurants-standards-v2-256-maritime-dining.md (33 lines)
- ✅ ships-logbook-personas-standards-v2-257.md (57 lines)
- ✅ in-the-wake-modular-standards-v2-245.md (100 lines read)
- ✅ cruise-lines-standards.md v2.4 (42 lines)
- ✅ in-the-wake-standards-v2-228.md (100 lines read - golden reference)
- ✅ InTheWake_Standards_v2.4/ README.md + changelog.md (22 + 15 lines)

**v3.001-v3.002 Evolution (4 files):**
- ✅ UNIFIED_MODULAR_STANDARDS_v3.001.md (150 lines read)
- ✅ STANDARDS_v3.002a.md (181 lines)
- ✅ InTheWake_Standards_v3.002.md (16 lines - JS reliability)
- ✅ FRONTEND_STANDARDS_v3.002.md (22 lines - invocation header)

**v3.006 Consolidation (7 files):**
- ✅ inthewake-v3-006-standards-addendum.md (103 lines)
- ✅ in-the-wake-standards-addendum-v3.002.md (98 lines - WCAG + motto)
- ✅ standards/00-core/SEO_STRUCTURED_DATA.md (15 lines)
- ✅ standards/03-data/GOLDEN-MERGE_SPEC.md (10 lines)
- ✅ standards/03-data/DATA-SCHEMAS.md (6 lines)
- ✅ standards/05-brand/TONE-AND-ETHOS.md (4 lines)
- ✅ standards/05-brand/INVOCATION-BANNER.md (4 lines)

**v3.100 WCAG (1 file):**
- ✅ standards-wcag-addendum-v3.100.md (211 lines - comprehensive)

**Infrastructure/Meta (4 files):**
- ✅ every-page-standards.md (28 lines)
- ✅ STANDARDS_INDEX.md (31 lines)
- ✅ standards/README.md (16 lines)
- ✅ standards/CHANGELOG.md (17 lines)
- ✅ standards/conflicts/conflicts_report.md (33 lines)
- ✅ standards/sources/SOURCE_INVENTORY.md (31 lines)

### Remaining Files to Analyze: ~87 files

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

**Document Status:** In Progress (50 of 137 files analyzed - 36.5% complete)
**Last Updated:** 2025-11-23
**Next Update:** After analyzing remaining template files and specialized standards

**Major Systems Documented:**
- ✅ Navigation (v2.228 → v3.009 evolution with conflicts noted)
- ✅ Right Rail System (v3.008-v3.009)
- ✅ Solo Module (v3.008)
- ✅ Caching System (v3.007 + v3.002a SiteCache)
- ✅ CI/CD Gates (v3.008-v3.009)
- ✅ Article Production (v3.008)
- ✅ Ship Page Standards (v2.228 golden reference → v3.007.070)
- ✅ Logbook Personas (v2.257)
- ✅ Venue/Restaurant System (v2.256-v2.257)
- ✅ Modular Foundation (v2.245 → v3.001)
- ✅ Cruise Lines Pages (v2.4)
- ✅ **WCAG 2.1 AA Comprehensive Spec (v3.100)**
- ✅ **V3.001-V3.006 Evolution & Consolidation**
- ✅ **Invocation & Reverent Coding Philosophy**
- ✅ **External Link Policy & Graceful Failure**
- ✅ **Historical Hosting Evolution (GitHub Pages → cruisinginthewake.com)**

**Key Historical Insights:**
- **Golden Reference:** grandeur-of-the-seas.html (untouchable template)
- **Motto:** "The calmest seas are found in another's wake."
- **Hosting Evolution:** jsschrstrcks1.github.io/InTheWake → www.cruisinginthewake.com
- **Additive-Only Policy:** Standards never delete, only add (v2.228+)

**Next Priority:** Templates/examples, then remaining specialized files, then Task 7 (verify against implementation)
