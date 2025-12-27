# Ship Page Standard v2.0

**Document Version:** 2.0
**Last Updated:** 2025-12-27
**Applies To:** All ship pages in `/ships/*/` directories
**Standard ID:** ITW-SHIP-002
**Gold Standards:** `radiance-of-the-seas.html`, `grandeur-of-the-seas.html`

---

## Overview

This standard defines the normalized structure, required elements, word counts, media requirements, and validation rules for all ship information pages on In the Wake. Ship pages are entity pages that provide comprehensive information about cruise ships including specs, dining, tracking, logbook stories, and videos.

**Key Principles:**
- No duplication of content (stories, names, facts) across ships
- Faith-scented storytelling with emotional resonance
- WCAG 2.1 AA full compliance
- Broad browser compatibility
- Mobile-first responsive design

---

## Page Types

| Type | Description | Required Sections | Example |
|------|-------------|-------------------|---------|
| **Active Ship** | Currently sailing vessels | All standard sections | `radiance-of-the-seas.html` |
| **TBN Ship** | To-Be-Named future ships | Modified sections (limited data) | `icon-class-ship-tbn-2027.html` |
| **Retired Ship** | Historical/decommissioned ships | Historical context sections | `song-of-america.html` |

---

## Required File Naming

- **Pattern:** `{ship-slug}.html`
- **Format:** kebab-case (lowercase, hyphens)
- **Examples:** `adventure-of-the-seas.html`, `icon-class-ship-tbn-2027.html`

---

## HEAD Section Requirements

### 1. Document Structure Comment (REQUIRED)

```html
<!--
Soli Deo Gloria
All work on this project is offered as a gift to God.
"Trust in the LORD with all your heart..." — Proverbs 3:5
"Whatever you do, work heartily, as for the Lord..." — Colossians 3:23

STANDARDS: Every Page v3.010.300 · Production Template · Unified Nav v3.010.300 · A11y/WCAG 2.1 AA Compliant
-->
```

### 2. AI-Breadcrumbs Comment (REQUIRED)

Must include these fields with correct format:

| Field | Required | Description |
|-------|----------|-------------|
| `entity` | Yes | Must be exactly "Ship" (not ship name) |
| `name` | Yes | Full ship name (e.g., "Radiance of the Seas") |
| `type` | Yes | "Ship Information Page" |
| `class` | Yes | Ship class (e.g., "Radiance Class") |
| `operator` | Yes | "Royal Caribbean" (or other line) |
| `parent` | Yes | "/ships.html" |
| `siblings` | Yes | Comma-separated sister ships |
| `related` | Yes | Related page paths |
| `subject` | Yes | One-line summary |
| `intended-reader` | Yes | Target audience |
| `core-facts` | Yes | Key ship facts |
| `decisions-informed` | Yes | What decisions this page helps with |
| `answer-first` | Yes | 1-2 sentence direct answer |
| `updated` | Yes | YYYY-MM-DD format |

**Correct Example:**
```html
<!-- ai-breadcrumbs
entity: Ship
name: Radiance of the Seas
type: Ship Information Page
parent: /ships.html
category: Royal Caribbean Fleet
cruise-line: Royal Caribbean
ship-class: Radiance Class
siblings: Brilliance of the Seas, Serenade of the Seas, Jewel of the Seas
updated: 2025-11-18
expertise: Royal Caribbean ship reviews, deck plans, dining analysis, cabin comparisons
target-audience: Radiance of the Seas cruisers, Radiance Class researchers, ship comparison shoppers
answer-first: Radiance of the Seas is a mid-sized Radiance Class ship offering glass-wall panoramic views, intimate cruising, and worldwide itineraries.
-->
```

**BLOCKING Errors:**
- `entity` contains ship name instead of "Ship"
- Missing `name` field
- Missing `siblings` field

### 3. ICP-Lite v1.4 Meta Tags (REQUIRED)

| Meta Tag | Constraints | Required | Mirroring |
|----------|------------|----------|-----------|
| `ai-summary` | 100-250 chars | Yes | Must match WebPage JSON-LD description exactly |
| `last-reviewed` | YYYY-MM-DD | Yes | Must match WebPage JSON-LD dateModified exactly |
| `content-protocol` | N/A | Yes | Must be exactly "ICP-Lite v1.4" |

### 4. SEO Meta Tags (REQUIRED)

| Tag | Required | Constraints |
|-----|----------|-------------|
| `title` | Yes | Pattern: `{Ship Name} — Deck Plans, Live Tracker, Dining & Videos \| In the Wake (V1.Beta)` |
| `description` | Yes | Must match `ai-summary` |
| `canonical` | Yes | Full URL to page |
| `robots` | Yes | `index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1` |

### 5. Open Graph Tags (REQUIRED)

| Property | Required | Value |
|----------|----------|-------|
| `og:type` | Yes | `website` |
| `og:site_name` | Yes | `In the Wake` |
| `og:title` | Yes | Ship title |
| `og:description` | Yes | Summary |
| `og:url` | Yes | Canonical URL |
| `og:locale` | Yes | `en_US` |
| `og:image` | Yes | `/assets/social/{slug}.jpg` |

### 6. Twitter Card Tags (REQUIRED)

| Property | Required |
|----------|----------|
| `twitter:card` | Yes (`summary_large_image`) |
| `twitter:title` | Yes |
| `twitter:description` | Yes |
| `twitter:image` | Yes |

### 7. JSON-LD Schema Requirements (REQUIRED)

All ship pages must include these JSON-LD blocks:

| Schema Type | Required | Notes |
|-------------|----------|-------|
| Organization | Yes | Standard In the Wake org |
| WebSite + SearchAction | Yes | Site-wide search |
| BreadcrumbList | Yes | 4-level breadcrumb |
| Review | Yes | Ship overview review - MUST reference correct class |
| Person (E-E-A-T) | Yes | Author: Ken Baker |
| WebPage (ICP-Lite) | Yes | With `mainEntity` of type "Cruise" |
| FAQPage | Yes | 4-8 ship-specific FAQs |

**Review Schema - Class Reference Rule:**
```json
{
  "@type": "Review",
  "itemReviewed": {
    "@type": "Cruise",
    "description": "A Radiance-class ship..."  // MUST match actual ship class
  }
}
```
**BLOCKING:** Review description referencing wrong class (e.g., "Radiance-class" on Icon Class page).

---

## Navigation Requirements (REQUIRED)

### Gold Standard Navigation (from index.html)

All ship pages MUST use the identical navigation dropdown structure as `index.html`:

```html
<nav class="site-nav" aria-label="Main site navigation">
  <a class="nav-pill" href="/">Home</a>

  <!-- Planning Dropdown -->
  <div class="nav-dropdown" id="nav-planning">
    <button class="nav-pill" type="button" aria-expanded="false" aria-haspopup="true">
      Planning <span class="caret">▾</span>
    </button>
    <div class="dropdown-menu" role="menu">
      <a href="/planning.html">Planning (overview)</a>
      <a href="/ships.html">Ships</a>
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

  <a class="nav-pill" href="/tools/port-tracker.html">Port Logbook</a>
  <a class="nav-pill" href="/tools/ship-tracker.html">Ship Logbook</a>
  <a class="nav-pill" href="/search.html">Search</a>
  <a class="nav-pill" href="/about-us.html">About</a>
</nav>
```

**BLOCKING:** Navigation structure differs from index.html gold standard.

---

## Browser Compatibility & Escape Link

### In-App Browser Escape (REQUIRED)

All pages MUST include the Facebook/Instagram escape banner script:

```html
<!-- In-App Browser Detection & Escape Banner -->
<script src="/assets/js/in-app-browser-escape.js"></script>
```

**Purpose:** Detects Facebook, Instagram, LinkedIn, Twitter in-app browsers and shows banner with "Open in Browser" instructions.

### Browser Compatibility Requirements

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest 2 versions | Required |
| Firefox | Latest 2 versions | Required |
| Safari | Latest 2 versions | Required |
| Edge | Latest 2 versions | Required |
| iOS Safari | Latest 2 versions | Required |
| Chrome Android | Latest 2 versions | Required |
| Samsung Internet | Latest version | Required |

**CSS Requirements:**
- Use standard CSS (no bleeding-edge features without fallbacks)
- `loading="lazy"` for images (broad support)
- CSS Grid with flexbox fallbacks where needed

---

## WCAG 2.1 AA Compliance (REQUIRED)

Per our accessibility commitment, all ship pages must be fully WCAG 2.1 AA compliant:

### Required Elements

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| Skip to content link | `<a href="#main-content" class="skip-link">Skip to main content</a>` | REQUIRED |
| ARIA live regions | `role="status"` and `role="alert"` regions | REQUIRED |
| Keyboard navigation | All interactive elements focusable | REQUIRED |
| Focus indicators | Visible focus outlines | REQUIRED |
| Alt text | All images (20+ chars, descriptive) | REQUIRED |
| Color contrast | 4.5:1 for text, 3:1 for large text | REQUIRED |
| Heading hierarchy | Logical H1→H2→H3 structure | REQUIRED |
| Form labels | All form inputs labeled | REQUIRED |
| ARIA labels | Carousels, buttons, dropdowns | REQUIRED |
| Screen reader support | Semantic HTML throughout | REQUIRED |

### Carousel Accessibility

```html
<div class="swiper" aria-label="Radiance of the Seas photo carousel">
  <div class="swiper-button-prev" aria-label="Previous image"></div>
  <div class="swiper-button-next" aria-label="Next image"></div>
</div>
```

---

## Word Count Requirements

### Section Word Counts (Active Ships)

| Section | Minimum Words | Maximum Words | Notes |
|---------|---------------|---------------|-------|
| Page Introduction | 100 | 300 | Answer-first format |
| A First Look | 50 | 150 | Gallery context |
| Dining Overview | 50 | 200 | Dynamic content loads separately |
| **Logbook Stories** | 300 per story | 600 per story | 10+ stories required |
| Video Section | 20 | 80 | Description only |
| FAQ Section | 200 | 600 | 4-8 questions |
| **Total Page** | 2,500 | 6,000 | Excluding JSON/scripts |

### Logbook Story Word Counts

Each logbook story must be 300-600 words covering:
- Opening hook (1-2 sentences)
- Background context (2-3 sentences)
- Ship-specific experience (main body)
- Emotional moment (tear-jerk element)
- Faith element (1-2 sentences)
- Practical takeaway with links

---

## Video Requirements

### Video Counts and Categories (REQUIRED)

Each ship page MUST have a corresponding video JSON file with **at least 10 videos**:

**File Location:** `/assets/data/videos/rcl/{ship-slug}.json`

**Required Categories (at least one video each):**

| Category | Key | Description | Required |
|----------|-----|-------------|----------|
| Ship Walkthrough | `ship walk through` | Full ship tour | Yes |
| My Favorite Things | `top ten` | Top 10, best things, favorites | Yes |
| Suite Tour | `suite` | Any suite category tour | Yes |
| Balcony Cabin | `balcony` | Balcony stateroom tour | Yes |
| Oceanview Cabin | `oceanview` | Oceanview stateroom tour | Yes |
| Interior Cabin | `interior` | Interior stateroom tour | Yes |
| Food & Dining | `food` | Dining, restaurants, food tour | Yes |
| Accessible Cabin | `accessible` | Disabled/accessible perspective | Yes |
| Solo Traveler | `solo` | Solo cruiser perspective | Recommended |
| Family | `family` | Family perspective | Recommended |

**Video JSON Structure:**
```json
{
  "ship": "Radiance of the Seas",
  "videos": {
    "top ten": [
      {"videoId": "abc123", "provider": "youtube", "title": "Top 10 Things on Radiance"}
    ],
    "ship walk through": [...],
    "suite": [...],
    "accessible": [...],
    "balcony": [...],
    "oceanview": [...],
    "interior": [...],
    "food": [...]
  },
  "ordered_round_robin": ["videoId1", "videoId2", ...]
}
```

**Video Content Rules:**
- No vulgar content
- No political content
- Prefer ship-specific videos (not generic cruise content)
- YouTube-nocookie embeds for privacy

---

## Logbook Story Requirements

### Story Count (REQUIRED)

Each ship page MUST have a corresponding logbook JSON with **at least 10 unique stories**:

**File Location:** `/assets/data/logbook/rcl/{ship-slug}.json`

### Required Personas (No Duplication)

Stories must cover diverse perspectives. Each ship should have **at least one story** from each category:

| Persona | Description | Required |
|---------|-------------|----------|
| Solo Traveler | Single person cruising alone | Yes |
| Multi-generational Family | 3+ generations including disabled member | Yes |
| Honeymooners | Newlywed couple | Yes |
| Elderly Couple | Retirees, 65+ | Yes |
| Single Woman | Woman traveling alone | Yes |
| Single Man | Man traveling alone | Yes |
| Single Parent | Parent with child(ren), no partner | Yes |
| Veteran/PTSD | Military veteran or first responder | Recommended |
| Cancer Survivor | Medical recovery celebration | Recommended |
| Grief/Widow(er) | Processing loss | Recommended |

### Story Content Rules

| Rule | Description | Enforcement |
|------|-------------|-------------|
| Faith-scented | Include Scripture or faith element | REQUIRED |
| Tear-jerk moment | Emotional high point | REQUIRED |
| Mostly positive | Happy, inspirational, aspirational | REQUIRED |
| Occasional sad | Some bittersweet/sad moments allowed | Allowed |
| Verifiable facts only | No untrue claims | REQUIRED |
| No name duplication | Unique author names across ALL ships | BLOCKING |
| No story duplication | Unique stories across ALL ships | BLOCKING |
| Common names | Use frequently occurring names | REQUIRED |

### Tear-Jerk Moment Types

| Type | Description | Frequency |
|------|-------------|-----------|
| Happy moments | Joy, celebration, reunion | Most common |
| Inspirational | Overcoming adversity | Common |
| Aspirational | Dreams realized | Common |
| Parent pride | Child achievement | Common |
| Bittersweet | Mixed emotions | Occasional |
| Sad | Loss, grief (with hope) | Rare |

### Story JSON Structure

```json
{
  "ship": "Radiance of the Seas",
  "ship_class": "Radiance Class",
  "cruise_line": "Royal Caribbean",
  "last_updated": "2025-12-27",
  "content_protocol": "ICP-Lite v1.0",
  "stories": [
    {
      "title": "The Widow Who Learned to Laugh Again",
      "persona_label": "Grief and Healing",
      "intended_reader": "Solo travelers processing loss",
      "core_insight": "Radiance offers gentle community for healing",
      "markdown": "**Opening hook...**\n\nBody with [links](/path)...\n\n**The truth:** Takeaway message.",
      "author": {
        "name": "Frances J.",
        "location": ""
      }
    }
  ]
}
```

---

## Ship Tracker Requirements

### MarineTraffic Integration (REQUIRED)

Each active ship page must have a working live tracker:

```html
<section class="card itinerary" aria-labelledby="liveTrackHeading" data-imo="9195195" data-name="RADIANCE-OF-THE-SEAS">
  <h2 id="liveTrackHeading">Where Is Radiance Right Now?</h2>
  <p>See the ship's current position, speed, and next port on a live tracker.</p>
  <div id="vf-tracker-container" style="width:100%;height:500px;position:relative;"></div>
</section>
```

**IMO Number Validation:**
- Must be valid 7-digit IMO number
- Must match ship (verify via MarineTraffic)
- TBN ships use `data-imo="TBD"`

**Known IMO Numbers (RCL):**

| Ship | IMO |
|------|-----|
| Radiance of the Seas | 9195195 |
| Brilliance of the Seas | 9195200 |
| Serenade of the Seas | 9228344 |
| Jewel of the Seas | 9228356 |
| Grandeur of the Seas | 9102978 |

---

## Image Requirements

### Image Sources

**Primary:** WikiCommons (free, licensed)
**Secondary:** Flickers of Majesty (permission required)
**Fallback:** Generic ship images from `/assets/ships/`

### WikiCommons API Usage

For missing ship images, use WikiCommons API:
```
https://commons.wikimedia.org/w/api.php?action=query&titles=File:{filename}&prop=imageinfo&iiprop=url&format=json
```

### Image Counts

| Category | Minimum | Maximum | Notes |
|----------|---------|---------|-------|
| First Look Carousel | 5 | 10 | Ship exterior/interior |
| Dining Section | 1 | 1 | Hero image |
| Total Page Images | 8 | 20 | Including all sections |

### Image Attributes (REQUIRED)

| Attribute | Required | Constraints |
|-----------|----------|-------------|
| `alt` | Yes | 20+ characters, ship-specific, descriptive |
| `loading` | Yes | `"lazy"` (except hero: `"eager"`) |
| `decoding` | Yes | `"async"` |
| `fetchpriority` | Hero only | `"high"` for hero image |

### Image Credits (REQUIRED)

All images must have attribution:
```html
<figcaption class="tiny">
  Photo by <a href="https://www.flickersofmajesty.com" target="_blank" rel="noopener">Flickers of Majesty</a>
</figcaption>
```

Or for WikiCommons:
```html
<figcaption class="tiny">
  Image: <a href="https://commons.wikimedia.org/wiki/File:..." target="_blank" rel="noopener">Wikimedia Commons</a>, CC BY-SA 4.0
</figcaption>
```

---

## Right Rail Requirements

### Recent Stories Rail (REQUIRED)

Must include all standard elements:

```html
<section class="card" aria-labelledby="recent-rail-title">
  <h3 id="recent-rail-title">Recent Stories</h3>
  <p class="tiny content-text">Real cruising experiences from our community.</p>
  <nav id="recent-rail-nav-top" class="rail-nav" aria-label="Article pagination"></nav>
  <div id="recent-rail" class="rail-list" aria-live="polite"></div>
  <nav id="recent-rail-nav-bottom" class="rail-nav" aria-label="Article pagination"></nav>
  <p id="recent-rail-fallback" class="tiny">Loading articles…</p>
</section>
```

### Author Card (REQUIRED)

```html
<section class="card author-card-vertical" aria-labelledby="author-heading">
  <h3 id="author-heading">About the Author</h3>
  <a href="/authors/ken-baker.html">
    <img class="author-avatar" src="/authors/img/ken1_96.webp" width="96" height="96" alt="Author photo"/>
  </a>
  <h4><a href="/authors/ken-baker.html">Ken Baker</a></h4>
  <p class="tiny">Founder of In the Wake</p>
</section>
```

### Thumbnail Sizes

| Element | Width | Height | Shape |
|---------|-------|--------|-------|
| Recent articles | 56px | 56px | Square, rounded |
| Author avatar | 96px | 96px | Square, rounded |
| Authors rail | 48px | 48px | Circle |

---

## Script Requirements

### Required Scripts (in order)

| Script | Purpose | Location | Required |
|--------|---------|----------|----------|
| Swiper.js | Carousels | HEAD | Yes |
| `dropdown.js` | Navigation | Before `</body>` | Yes |
| `in-app-browser-escape.js` | Facebook escape | Before `</body>` | Yes |
| First Look Init | Image carousel | After content | Yes |
| Logbook Loader | Stories | After content | Yes |
| Video Loader | Video carousel | After content | Yes |
| Stats Loader | Ship specs | After content | Yes |
| Dining Loader | Venues | After content | Yes |
| Tracker Init | MarineTraffic | After content | Yes |
| Articles Loader | Recent Stories | After content | Yes |

### Script Duplication Rules (BLOCKING)

- Only ONE `loadArticles()` function per page
- Only ONE Recent Stories script block
- Only ONE Swiper init per carousel type
- No duplicate event listeners

---

## No Duplication Rules (BLOCKING)

### Story Deduplication

| Rule | Scope | Enforcement |
|------|-------|-------------|
| Author names | Global (all ships) | BLOCKING |
| Story titles | Global (all ships) | BLOCKING |
| Core story content | Global (all ships) | BLOCKING |
| Persona per ship | Per ship | Allowed repeats across ships |

### Content Deduplication

| Content Type | Rule |
|--------------|------|
| FAQ answers | May share structure, unique details per ship |
| Dining venues | Shared data from venues.json |
| Ship stats | Unique per ship from stats JSON |

---

## Validation Rules Summary

### BLOCKING Errors (Must Fix Before Publishing)

1. Missing or wrong `content-protocol` (must be "ICP-Lite v1.4")
2. Missing `ai-summary` meta tag or exceeds 250 chars
3. Missing `last-reviewed` or wrong format
4. WebPage description doesn't match `ai-summary` exactly
5. WebPage dateModified doesn't match `last-reviewed` exactly
6. Missing `mainEntity` in WebPage JSON-LD
7. Review schema references wrong ship class
8. Section headings reference wrong ship name
9. Alt text references wrong ship name
10. AI-breadcrumbs `entity` contains ship name instead of "Ship"
11. Missing required sections
12. Duplicate script blocks (especially loadArticles)
13. Missing `data-imo` attribute
14. Navigation differs from index.html gold standard
15. Missing in-app browser escape script
16. Fewer than 10 logbook stories
17. Fewer than 10 videos (8 required categories)
18. Duplicate author names across ships
19. Duplicate story content across ships

### Warnings (Should Fix)

1. `ai-summary` shorter than 100 characters
2. Image count below 8
3. FAQ count below 4
4. Missing sister ship cross-links
5. Missing video category coverage
6. Logbook stories under 300 words
7. Missing accessibility persona in logbook

---

## TBN Ship Special Rules

| Standard Rule | TBN Modification |
|---------------|------------------|
| Stats values | May show "TBD" |
| Image carousel | May use class photos |
| Live tracker | `data-imo="TBD"`, show placeholder |
| Logbook stories | May use class-based stories |
| Videos | May use class-based videos |
| IMO validation | Skip |

---

## File Checklist

Before publishing, verify:

- [ ] File follows naming convention (`{ship-slug}.html`)
- [ ] AI-breadcrumbs complete with `entity: Ship`
- [ ] ICP-Lite v1.4 meta tags present and mirrored
- [ ] All 7 JSON-LD schemas valid
- [ ] mainEntity present in WebPage schema
- [ ] Review schema references correct ship class
- [ ] Navigation matches index.html gold standard
- [ ] In-app browser escape script included
- [ ] All sections present and ordered correctly
- [ ] data-imo attribute valid (or "TBD")
- [ ] No wrong ship name references anywhere
- [ ] 10+ logbook stories with required personas
- [ ] 10+ videos covering 8 required categories
- [ ] No duplicate names/stories across fleet
- [ ] Recent Stories rail complete with pagination
- [ ] Images have proper alt text and credits
- [ ] Sister ships linked
- [ ] FAQ section has 4-8 questions
- [ ] Ship tracker verified working
- [ ] Word counts within limits

---

## Associated Files

| File Type | Location | Purpose |
|-----------|----------|---------|
| Ship Page | `/ships/rcl/{slug}.html` | Main page |
| Logbook JSON | `/assets/data/logbook/rcl/{slug}.json` | Stories |
| Videos JSON | `/assets/data/videos/rcl/{slug}.json` | Videos |
| Stats JSON | `/assets/data/ships/{slug}.json` | Specs |
| Validator | `/admin/validate-ship-page.js` | Validation |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-27 | Initial standard based on codebase analysis |
| 2.0 | 2025-12-27 | Added word counts, video requirements, logbook personas, browser compat, navigation gold standard, deduplication rules, WCAG details |

---

*Soli Deo Gloria*
