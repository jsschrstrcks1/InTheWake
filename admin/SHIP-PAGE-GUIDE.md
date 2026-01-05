# Ship Page Creation Guide

## Soli Deo Gloria

This guide documents the complete process for adding new ships and cruise lines to In the Wake, following ITW-SHIP-002 v2.1 standards.

---

## Table of Contents

1. [Directory Structure](#directory-structure)
2. [Adding a New Cruise Line](#adding-a-new-cruise-line)
3. [Adding a New Ship](#adding-a-new-ship)
4. [Required HTML Sections](#required-html-sections)
5. [Required JSON Files](#required-json-files)
6. [Content Standards](#content-standards)
7. [Logbook Story Guidelines](#logbook-story-guidelines)
8. [Validation](#validation)
9. [Batch Scripts](#batch-scripts)

---

## Directory Structure

```
InTheWake/
├── ships/
│   ├── {cruise-line}/           # e.g., rcl/, carnival/, celebrity-cruises/
│   │   ├── index.html           # Cruise line fleet overview
│   │   ├── {ship-slug}.html     # Individual ship pages
│   │   └── ...
│
├── assets/
│   └── data/
│       ├── logbook/
│       │   └── {cruise-line}/
│       │       └── {ship-slug}.json   # Logbook stories
│       │
│       └── videos/
│           └── {cruise-line}/
│               └── {ship-slug}.json   # YouTube video manifest
│
├── admin/
│   ├── validate-ship-page.js     # Ship page validator
│   ├── batch-fix-stub-pages.js   # Batch section fixer
│   └── batch-fix-section-order.js # Section order fixer
```

### Cruise Line Directory Names

Use lowercase with hyphens:
- `rcl` - Royal Caribbean
- `carnival` - Carnival Cruise Line
- `celebrity-cruises` - Celebrity Cruises
- `costa` - Costa Cruises
- `cunard` - Cunard Line
- `explora-journeys` - Explora Journeys
- `holland-america-line` - Holland America Line
- `msc` - MSC Cruises
- `norwegian` - Norwegian Cruise Line
- `oceania` - Oceania Cruises
- `princess` - Princess Cruises
- `regent` - Regent Seven Seas
- `seabourn` - Seabourn Cruise Line
- `silversea` - Silversea Cruises
- `virgin-voyages` - Virgin Voyages

---

## Adding a New Cruise Line

### Step 1: Create Directory Structure

```bash
mkdir -p ships/{cruise-line}
mkdir -p assets/data/logbook/{cruise-line}
mkdir -p assets/data/videos/{cruise-line}
```

### Step 2: Create Fleet Index Page

Create `ships/{cruise-line}/index.html` with:
- Fleet overview
- Ship class breakdowns
- Links to all ship pages
- Cruise line branding

### Step 3: Update Validator

Edit `admin/validate-ship-page.js`:

```javascript
// Add to CRUISE_LINES array if using batch scripts
const CRUISE_LINES = [
  'carnival', 'celebrity-cruises', 'costa', 'cunard', 'explora-journeys',
  'holland-america-line', 'msc', 'norwegian', 'oceania', 'princess',
  'rcl', 'regent', 'seabourn', 'silversea', 'virgin-voyages',
  'new-cruise-line'  // Add here
];
```

### Step 4: Add Ship Class Definitions (if applicable)

```javascript
const SHIP_CLASSES = {
  // Add new cruise line's ship classes
  'new-class': ['Ship 1', 'Ship 2', 'Ship 3']
};
```

---

## Adding a New Ship

### Step 1: Create HTML File

Create `ships/{cruise-line}/{ship-slug}.html`

Ship slug format: lowercase with hyphens
- `radiance-of-the-seas.html`
- `carnival-breeze.html`
- `celebrity-edge.html`

### Step 2: HTML Template Structure

```html
<!doctype html>
<!--
Soli Deo Gloria
All work on this project is offered as a gift to God.
"Trust in the LORD with all your heart..." — Proverbs 3:5
"Whatever you do, work heartily..." — Colossians 3:23

STANDARDS: Every Page v3.010.300 · Production Template · Unified Nav v3.010.300
-->
<html lang="en" class="no-js">
<head>
<!-- ai-breadcrumbs
     entity: Ship
     name: {Ship Name}
     type: Ship Information Page
     parent: /ships.html
     category: {Cruise Line} Fleet
     cruise-line: {Cruise Line}
     ship-class: {Ship Class}
     siblings: {comma-separated sibling ship URLs}
     related: /ships.html, /cruise-lines/{cruise-line}.html
     updated: {YYYY-MM-DD}
     expertise: Ship reviews, deck plans, dining analysis
     target-audience: Cruisers researching {Ship Name}
     answer-first: {One-sentence summary with key specs}
     -->

  <!-- ICP-Lite v1.4: AI-First Metadata -->
  <meta name="ai-summary" content="{Ship Name}: deck plans, live tracker, dining venues, and stateroom videos..."/>
  <meta name="last-reviewed" content="{YYYY-MM-DD}"/>
  <meta name="content-protocol" content="ICP-Lite v1.4"/>

  <!-- Required JSON-LD Schemas (7 total) -->
  <!-- 1. Organization -->
  <!-- 2. WebSite -->
  <!-- 3. BreadcrumbList -->
  <!-- 4. Review -->
  <!-- 5. Person (E-E-A-T) -->
  <!-- 6. WebPage -->
  <!-- 7. FAQPage -->
</head>
```

### Step 3: Required Main Content Sections

Sections MUST appear in this exact order within `<main class="wrap">`:

```html
<main class="wrap" id="main-content" role="main" tabindex="-1">

  <!-- 1. Page Introduction (ICP-Lite) -->
  <section class="page-intro" aria-label="{Ship Name} overview">
    <p class="answer-line">
      <strong class="section-label">Looking for {Ship Name} planning info?</strong>
      <span>This page covers deck plans, live ship tracking, dining venues...</span>
    </p>
  </section>

  <!-- 2. First Look + Dining (grid-2 pair) -->
  <div class="grid-2">
    <section aria-labelledby="first-look">
      <h2 id="first-look">A First Look</h2>
      <!-- Ship gallery carousel -->
    </section>
    <section id="dining-card" data-ship="{ship-slug}">
      <h2>Dining</h2>
      <!-- Dining venues -->
    </section>
  </div>

  <!-- 3. Logbook Section -->
  <section aria-labelledby="logbook">
    <h2 id="logbook">The Logbook — Tales From the Wake</h2>
    <div id="logbook-container"></div>
  </section>

  <!-- 4. Videos Section -->
  <section aria-labelledby="video-highlights">
    <h2 id="video-highlights">Watch: {Ship Name} Highlights</h2>
    <!-- Video carousel -->
  </section>

  <!-- 5. Deck Plans + Tracker (grid-2 pair) -->
  <div class="grid-2">
    <section aria-labelledby="deck-plans">
      <h2 id="deck-plans">Ship Map (Deck Plans)</h2>
      <!-- Deck plan links -->
    </section>
    <section aria-labelledby="liveTrackHeading">
      <h3 id="liveTrackHeading">Where Is {Ship Name} Right Now?</h3>
      <!-- MarineTraffic embed -->
    </section>
  </div>

  <!-- 6. FAQ Section -->
  <section class="card faq">
    <h2>Frequently Asked Questions</h2>
    <details><summary>Question 1?</summary><p>Answer...</p></details>
    <details><summary>Question 2?</summary><p>Answer...</p></details>
    <!-- Minimum 4 FAQ items -->
  </section>

  <!-- 7. Attribution Section -->
  <section class="attribution card">
    <h2>Image Attributions</h2>
    <!-- Image credits -->
  </section>

</main>
```

### Step 4: Required Right Rail Sections

```html
<aside class="col-2">

  <!-- Quick Navigation -->
  <nav class="quick-nav" aria-labelledby="quickNavHeading">
    <h2 id="quickNavHeading">Quick Navigation</h2>
    <ul>
      <li><a href="#first-look">First Look</a></li>
      <li><a href="#dining-card">Dining</a></li>
      <li><a href="#logbook">Logbook Stories</a></li>
      <li><a href="#video-highlights">Videos</a></li>
      <li><a href="#deck-plans">Deck Plans</a></li>
      <li><a href="#faq">FAQ</a></li>
    </ul>
  </nav>

  <!-- Author Card -->
  <section class="author-card-vertical">
    <!-- About the Author content -->
  </section>

  <!-- Recent Stories Rail -->
  <section id="recent-rail">
    <nav id="recent-rail-nav-top" aria-label="Recent stories navigation"></nav>
    <div id="recent-stories-container"></div>
    <nav id="recent-rail-nav-bottom" aria-label="Recent stories navigation"></nav>
    <noscript id="recent-rail-fallback">...</noscript>
  </section>

  <!-- Whimsical Units Container -->
  <div id="whimsical-units-container"></div>

</aside>
```

### Step 5: Required Data Attributes

```html
<!-- On a container element -->
<div id="ship-stats"
     data-ship="{ship-slug}"
     data-imo="{7-digit IMO number}">
</div>

<!-- Inline ship stats fallback -->
<script type="application/json" id="ship-stats-fallback">
{
  "slug": "{ship-slug}",
  "name": "{Ship Name}",
  "cruise_line": "{Cruise Line}",
  "class": "{Ship Class}",
  "entered_service": "{Year}",
  "gt": "{Gross Tonnage}",
  "guests": "{Guest Capacity}",
  "crew": "{Crew Size}"
}
</script>
```

---

## Required JSON Files

### Logbook JSON: `assets/data/logbook/{cruise-line}/{ship-slug}.json`

```json
{
  "ship": "{Ship Name}",
  "ship_class": "{Ship Class}",
  "cruise_line": "{Cruise Line}",
  "last_updated": "{YYYY-MM-DD}",
  "content_protocol": "ICP-Lite v1.4",
  "stories": [
    {
      "title": "Story Title",
      "persona_label": "Persona Type",
      "intended_reader": "Who this story serves",
      "core_insight": "Key takeaway about the ship",
      "markdown": "Full story in markdown format...",
      "author": {
        "name": "First Name Last Initial.",
        "location": ""
      }
    }
  ]
}
```

### Videos JSON: `assets/data/videos/{cruise-line}/{ship-slug}.json`

```json
{
  "ship": "{Ship Name}",
  "last_updated": "{YYYY-MM-DD}",
  "videos": {
    "ship walk through": [
      { "videoId": "xxxxxxxxxxx", "title": "Full Ship Tour", "author": "Channel Name" }
    ],
    "top ten": [],
    "suite": [],
    "balcony": [],
    "oceanview": [],
    "interior": [],
    "food": [],
    "accessible": []
  }
}
```

Required video categories (minimum 10 total videos):
- `ship walk through`
- `top ten`
- `suite`
- `balcony`
- `oceanview`
- `interior`
- `food`
- `accessible`

---

## Content Standards

### Word Count Requirements

| Section | Minimum | Maximum |
|---------|---------|---------|
| Page Introduction | 100 | 300 |
| A First Look | 50 | 150 |
| Dining Overview | 50 | 200 |
| Each Logbook Story | 300 | 600 |
| Video Section | 20 | 80 |
| FAQ Section | 200 | 600 |
| **Total Page** | **2,500** | **6,000** |

### Required Image Count

- Minimum 8 images per ship page
- All images must have alt text (20+ characters)
- All images must be locally hosted (no hotlinking)
- Use `loading="lazy"` for all images except hero

### Forbidden Content

**BLOCKING (must fix immediately):**
- External/hotlinked images
- Fake/placeholder video IDs
- Profanity
- Get drunk/bar crawl language
- Missing Soli Deo Gloria dedication

**WARNING (style improvements):**
- Brochure language ("you'll love", "perfect for", "must-do")
- Self-promotional language ("see our guide")
- Casino references (unless Casino Royale venue)

---

## Logbook Story Guidelines

### Required Personas (cover at least 6)

- `solo` - Solo travelers
- `multi-generational` / `family` - Family groups
- `honeymoon` / `couple` - Couples, anniversaries
- `elderly` / `grandparent` / `retiree` - Older travelers
- `widow` / `grief` - Those processing loss
- `accessible` / `disability` / `special needs` - Accessibility needs

### Story Structure (Service Recovery Narrative)

Stories should follow this arc:
1. **Challenge/Crisis Point** - Something goes wrong or guest has concerns
2. **Cruise Line Response** - How crew/ship addressed the situation
3. **Positive Resolution** - Guest delighted, exceeded expectations
4. **Tearjerker/Poignant Moment** - Emotional pivot point

**Example:**
> "The first steak arrived cold. I mentioned it to the server, expecting excuses. Instead, the head chef personally brought a fresh filet to our table, pulled up a chair, and asked about our anniversary. That cold steak became our best meal of the cruise."

### Content Tone Guidelines

**ALLOWED:**
- Challenges that are overcome
- Service recovery stories
- Emotional moments (tears of joy, healing, reconciliation)
- Faith references (subtle, natural)
- Mild crisis points with positive resolution

**NOT ALLOWED:**
- Gross content (bad smells, bodily functions)
- Seasickness/nausea references
- Sexual content
- Unresolved negative experiences
- Plagiarized content (NEVER copy from review sites)

### Faith-Scented Content

Include natural faith markers in logbook stories:
- Scripture references (contextual, not preachy)
- Prayer moments
- "Soli Deo Gloria" spirit
- Wonder/awe at creation
- Healing/hope themes

### Minimum Story Count

- Active ships: 10 stories minimum
- TBN (future) ships: 5 stories minimum
- Historic ships: 5 stories minimum

---

## Validation

### Running the Validator

```bash
# Single ship
node admin/validate-ship-page.js ships/rcl/radiance-of-the-seas.html

# All RCL ships
node admin/validate-ship-page.js --rcl-only

# All ships across all cruise lines
node admin/validate-ship-page.js --all-ships

# JSON output for scripting
node admin/validate-ship-page.js --all-ships --json-output
```

### Validation Rules (40+ checks)

**Blocking Errors (must fix):**
- Missing Soli Deo Gloria dedication
- Missing/invalid ICP-Lite metadata
- Missing required JSON-LD schemas
- Missing required sections
- Sections in wrong order
- Hotlinked images
- Fake video IDs
- Word count too low
- Missing data-ship/data-imo attributes

**Warnings (should fix):**
- Short alt text
- Missing personas in logbook
- Brochure language detected
- Missing whimsical units container

### Score Calculation

```
Score = 100 - (blocking_errors × 10) - (warnings × 2)
Minimum: 0, Maximum: 100
PASS: Score with 0 blocking errors
```

---

## Batch Scripts

### Fix Stub Pages

Adds all required sections to incomplete ship pages:

```bash
node admin/batch-fix-stub-pages.js
```

This script:
- Adds page-intro section
- Adds first-look + dining grid
- Adds logbook section
- Adds videos section
- Adds FAQ section
- Adds attribution section
- Adds right rail (quick nav, author card, recent stories)
- Removes stub notices

### Fix Section Order

Reorders sections to match standard:

```bash
node admin/batch-fix-section-order.js
```

This script:
- Moves footer outside main if misplaced
- Moves videos section inside main column
- Moves deck plans grid inside main column
- Moves attribution to correct position

---

## Quick Checklist for New Ships

- [ ] Create `ships/{cruise-line}/{ship-slug}.html`
- [ ] Add Soli Deo Gloria comment at top
- [ ] Add ai-breadcrumbs comment
- [ ] Add ICP-Lite meta tags (ai-summary, last-reviewed, content-protocol)
- [ ] Add all 7 JSON-LD schemas
- [ ] Add all required sections in correct order
- [ ] Add data-ship and data-imo attributes
- [ ] Add #ship-stats-fallback JSON
- [ ] Add #dining-data-source JSON
- [ ] Create `assets/data/logbook/{cruise-line}/{ship-slug}.json` (10+ stories)
- [ ] Create `assets/data/videos/{cruise-line}/{ship-slug}.json` (10+ videos)
- [ ] Add 8+ locally-hosted images with alt text
- [ ] Verify 500+ word count
- [ ] Run validator: `node admin/validate-ship-page.js ships/{cruise-line}/{ship-slug}.html`
- [ ] Fix all blocking errors
- [ ] Address warnings

---

## Gold Standard Reference

The following pages are considered gold standards:
- `ships/rcl/radiance-of-the-seas.html`
- `ships/rcl/grandeur-of-the-seas.html`

When in doubt, compare your page structure to these references.

---

## Research Sources for Content

Use these sources for inspiration (NO PLAGIARISM):
- VacationsToGo ship reviews
- Viator cruise reviews
- Cruise Critic forums
- CruiseMates
- YouTube ship tours

Extract themes and insights, then write original content in the In the Wake voice.

---

*Last Updated: 2026-01-03*
*Soli Deo Gloria*
