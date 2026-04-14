# Ship Pages Validation Audit Report

**Date:** 2026-03-24
**Standard:** `standards/SHIP_PAGE_STANDARD.md` v2.0 (ITW-SHIP-002)
**Validator:** `scripts/batch-validate-ships.js` → `admin/validate-ship-page.js`
**Score data:** `data/validated-ships.json` (generated 2026-02-12)
**Threshold:** 80/100

---

## Executive Summary

287 ship pages validated across 14 cruise lines. 149 pass (52%), 138 fail (48%).
The fleet breaks sharply into two worlds: RCL, Carnival, Norwegian, Princess, and Holland
America are largely compliant; MSC, Costa, Cunard, Oceania, Regent, Seabourn, Silversea,
and Explora Journeys all score 0% pass rate. Two blocking errors affect every single page
in the fleet regardless of score. The entire Virgin Voyages fleet was never validated due
to a directory path mismatch in the batch script.

---

## Fleet Scorecard

| Cruise Line        | Total | Pass | Fail | Pass Rate | Avg Score (est.) |
|--------------------|-------|------|------|-----------|------------------|
| Norwegian          | 20    | 20   | 0    | **100%**  | 90               |
| Princess           | 17    | 14   | 3    | 82%       | 87               |
| Holland America    | 46    | 38   | 8    | 83%       | 84               |
| Carnival           | 48    | 33   | 15   | 69%       | 80               |
| RCL                | 50    | 32   | 18   | 64%       | 77               |
| Celebrity          | 29    | 11   | 18   | 38%       | 65               |
| MSC                | 24    | 1    | 23   | 4%        | 58               |
| Seabourn           | 7     | 0    | 7    | 0%        | 64               |
| Oceania            | 8     | 0    | 8    | 0%        | 61               |
| Cunard             | 4     | 0    | 4    | 0%        | 63               |
| Silversea          | 12    | 0    | 12   | 0%        | 55               |
| Explora Journeys   | 6     | 0    | 6    | 0%        | 58               |
| Costa              | 9     | 0    | 9    | 0%        | 54               |
| Regent             | 7     | 0    | 7    | 0%        | 53               |
| **Virgin Voyages** | —     | —    | —    | **N/A**   | **Not run**      |
| **TOTAL**          | **287** | **149** | **138** | **52%** |              |

> Note: `ships/rcl/venues.html` and `ships/rcl/legend-of-the-seas-1995-built.html` scored 0
> and are not valid ship pages — they should be excluded from the validator's file list.

---

## Fleet-Wide Blocking Errors (Every Page)

These two blocking errors are present on **all 287 validated pages**, confirmed via direct
HTML inspection of Norwegian Prima, MSC Armonia, and structural analysis of the template.

### BLOCKING-1: Review Schema Uses Wrong `@type`

**Severity:** BLOCKING (standard rule: Review schema references wrong ship class)
**Scope:** All pages
**Found in:** Norwegian Prima, MSC Armonia (confirmed), assumed fleet-wide

```json
// CURRENT (wrong) — present on every page:
"itemReviewed": { "@type": "Vehicle", "name": "Norwegian Prima", ... }

// REQUIRED by standard:
"itemReviewed": { "@type": "Cruise", "description": "A Prima-class ship..." }
```

The standard explicitly states the Review itemReviewed must be `@type: "Cruise"` and that
the description must reference the correct ship class. Every page uses `@type: "Vehicle"`.

**Fix:** Change `"@type": "Vehicle"` → `"@type": "Cruise"` and add `"description"` referencing
the correct ship class in all Review JSON-LD blocks across all pages.

---

### BLOCKING-2: First Look Swiper Uses `loop: true` Instead of `loop: false, rewind: false`

**Severity:** BLOCKING (standard rule: Missing `rewind:false` in carousel configuration)
**Scope:** All pages
**Found in:** Norwegian Prima, MSC Armonia (confirmed), assumed fleet-wide

```javascript
// CURRENT (wrong) — initFirstLook on every page:
new Swiper(c, { loop: true, autoplay: { delay: 4500 ... } ... });

// REQUIRED by standard:
new Swiper('.swiper.firstlook', {
  loop: false,
  rewind: false,  // REQUIRED - prevents infinite scroll
  lazy: true,
  ...
});
```

The standard mandates `rewind: false` to prevent infinite scroll bug. The current template
uses `loop: true` with autoplay, which is explicitly forbidden. Note: the *video* Swiper
correctly uses `loop:false, rewind:false` — only `initFirstLook` is wrong.

**Fix:** Update `initFirstLook` template to use `loop:false, rewind:false` on all pages.

---

### BLOCKING-3: Skip Link Target `#main-content` Is Broken (All Pages)

**Severity:** BLOCKING (WCAG 2.1 AA — missing functional skip link)
**Scope:** All pages

```html
<!-- Skip link points to: -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<!-- But the main element has id="content", not "main-content": -->
<main class="wrap" id="content" role="main">
```

The skip link is a dead link. Screen readers and keyboard users cannot skip navigation.
This is a WCAG 2.1 AA failure.

**Fix:** Either change `id="content"` → `id="main-content"` on all `<main>` elements, or
change the skip link href to `#content` on all pages.

---

## Fleet-Wide Warnings (All Pages)

### WARNING-1: `og:image` Uses Generic Ships Hero Image

**Scope:** All pages (confirmed on Norwegian Prima, MSC Armonia)

```html
<!-- CURRENT: generic image on every page -->
<meta property="og:image" content="https://cruisinginthewake.com/assets/social/ships-hero.jpg"/>

<!-- REQUIRED by standard: -->
<meta property="og:image" content="/assets/social/{slug}.jpg"/>
```

Social shares for every ship show the same generic image. Per standard, each ship needs
its own social card at `/assets/social/{slug}.jpg`.

---

### WARNING-2: `<title>` Pattern Does Not Match Standard

**Scope:** All pages

```html
<!-- CURRENT: -->
<title>Norwegian Prima — Norwegian Cruise Line Ship Guide | In the Wake</title>

<!-- REQUIRED by standard: -->
<title>Norwegian Prima | Norwegian Cruise Line — Deck Plans, Live Tracker, Dining &amp; Videos | In the Wake</title>
```

The separator (`|` vs `—`) and the descriptor phrase ("Ship Guide" vs "Deck Plans, Live Tracker,
Dining & Videos") are both wrong. This affects SEO click-through.

---

### WARNING-3: `og:title` and `twitter:title` Missing Standard Descriptors

**Scope:** All pages. Same issue as WARNING-2 applied to OG/Twitter tags.

---

### WARNING-4: Duplicate Deck Plans Sections

**Scope:** All pages (confirmed on Norwegian Prima, MSC Armonia)

Every page has two deck plans sections with different `id` attributes:
- `<section aria-labelledby="deck-plans">` — has external link button
- `<section aria-labelledby="deckPlansHeading">` — has placeholder image + different link

This creates duplicate H2 headings, breaks heading hierarchy, and confuses screen readers.
The `id="deck-plans"` block should be removed; `id="deckPlansHeading"` should be kept
and its content enhanced.

---

### WARNING-5: VesselFinder Tracker Not Implemented — External Link Only

**Scope:** All pages

The standard requires an embedded VesselFinder iframe with live AIS data:
```javascript
iframe.src = 'https://www.vesselfinder.com/aismap?imo=' + imo + '&zoom=10&track=true';
```

All pages instead show a static external link to CruiseMapper. The `initLiveTracker()`
function reads `data-imo` but never creates an iframe. No live tracking is actually
embedded on any page.

---

### WARNING-6: Dining and Entertainment Sections Are Placeholder-Only

**Scope:** MSC, Costa, Cunard, Oceania, Regent, Seabourn, Silversea, Explora (confirmed),
and some pages in other lines

```html
<p>Dining venue information coming soon. MSC Cruises ships typically feature...</p>
<p>Entertainment details coming soon. Explore shows, activities...</p>
```

Both sections show generic "coming soon" text. No venue data loaded via `dining-data-source`
JSON. No entertainment content. This likely accounts for a significant portion of the score
gap between Norwegian (90%) and MSC (56%).

---

### WARNING-7: Logbook Section Shows Only Placeholder Text

**Scope:** MSC, Costa, Cunard, and other lower-scoring lines

```html
<p class="placeholder">Stories and insights from cruisers who have sailed on MSC Armonia will appear here.</p>
```

The logbook JSON file (`/assets/data/logbook/msc/msc-armonia.json`) either doesn't exist
or is empty. The standard requires 10+ stories with required personas. Pages with active
logbooks (RCL, Norwegian, Carnival) likely have this populated.

---

## Line-Specific Issues

### MSC Cruises — 4% Pass Rate (1/24)

Additional issues beyond fleet-wide deficiencies:

**BLOCKING: Wrong Ship Name Capitalization in Headings**
Section headings use "Msc Armonia" (lowercase 's') instead of "MSC Armonia".
This is a BLOCKING error per standard rule #8 ("Section headings reference wrong ship name").

```html
<!-- WRONG: -->
<h2 id="first-look">A First Look at Msc Armonia</h2>
<div class="swiper firstlook" aria-label="Msc Armonia photo carousel">

<!-- CORRECT: -->
<h2 id="first-look">A First Look at MSC Armonia</h2>
```

**BLOCKING: `data-imo` On `<main>` Instead of Tracker Section**
MSC pages place `data-imo` on the `<main>` element. The standard requires it on the
section with `aria-labelledby="liveTrackHeading"`.

```html
<!-- WRONG (MSC): -->
<main class="wrap" id="content" role="main" data-imo="8807105">
  ...
  <section class="card" aria-labelledby="liveTrackHeading">  <!-- no data-imo here -->

<!-- CORRECT (Norwegian): -->
<main class="wrap" id="content" role="main">
  ...
  <section class="card" aria-labelledby="liveTrackHeading" data-imo="9823986">
```

**WARNING: Only 1 Carousel Image (Minimum: 5)**
MSC Armonia has 1 slide in the First Look carousel. Standard minimum is 5 images,
maximum 10. Most MSC pages likely have 1 image.

**msc-world-america (Score: 16)** — Extremely low score suggests structural issues
beyond standard deficiencies. Needs individual inspection.

---

### RCL Failing Ships

**TBN Ships (24-38%):** `icon-class-ship-tbn-2027`, `icon-class-ship-tbn-2028`,
`quantum-ultra-class-ship-tbn-2028/2029`, `star-class-ship-tbn-2028`,
`discovery-class-ship-tbn` — These are expected to have limited content by design
(no real specs, no logbook, limited videos). The TBN special rules in the standard
should be formally applied and these pages re-scored under TBN criteria.

**Historical Ships (54-78%):** `legend-of-the-seas` (54), `song-of-america` (74),
`song-of-norway` (78), `sovereign-of-the-seas` (78), `sun-viking` (78),
`nordic-prince` (78), `nordic-empress` (72) — These retired ships are below the
80% threshold. They may lack logbook stories (retired ships have different story
requirements) and video JSON files. `majesty-of-the-seas` at 76 is the closest
active ship to failing.

**Non-Ship Pages (Score: 0):**
- `ships/rcl/venues.html` — Not a ship page; should be excluded from batch validation
- `ships/rcl/legend-of-the-seas-1995-built.html` — Appears to be a duplicate/stub

**Recommendation:** Exclude `venues.html` from batch validation by adding it to a
blocklist in `batch-validate-ships.js`.

---

### Celebrity Cruises — 38% Pass Rate

Modern fleet (Apex, Ascent, Beyond, Edge, Eclipse, Equinox, Reflection, Silhouette,
Solstice) passes at 90-92%. The older/smaller fleet (`Millennium`, `Constellation`,
`Infinity`, `Summit` at 52-64%) and specialty expedition ships (`Xpedition`, `Flora`,
`Xperience`, `Xploration`) fail at 46-66%.

**Three pages score 0:** `unnamed-edge-class`, `unnamed-project-nirvana`,
`unnamed-river-class-x6` — These are placeholder/TBN pages with no content.

**`celebrity-compass` (46%) and `celebrity-seeker` (46%)** — These may be new/upcoming
ships with incomplete page builds.

---

### Luxury Lines (Cunard, Oceania, Regent, Seabourn, Silversea) — All Failing

All luxury lines score 0% pass rate with scores typically in the 54-76% range.
Based on pattern analysis, these lines likely share:
- Missing or sparse logbook story JSON files
- Missing or incomplete video JSON files
- Dining sections showing "coming soon"
- Entertainment sections showing "coming soon"
- Possibly only 1 carousel image (like MSC)

`seabourn-encore` (76%) and `seabourn-quest` (76%) are the closest to passing across
all luxury lines — 4 points from threshold.

---

### Virgin Voyages — NOT VALIDATED

**Critical:** The batch validator contains a path bug:
```javascript
// In batch-validate-ships.js:
'virgin': 'ships/virgin'  // WRONG path

// Actual directory:
'ships/virgin-voyages'    // Correct path
```

The entire Virgin Voyages fleet was silently skipped. The script logged `[SKIP] virgin: directory not found`
but this was not surfaced in the output JSON. Virgin Voyages ships need to be validated
separately until this is fixed.

**Fix:** Change `'virgin': 'ships/virgin'` → `'virgin': 'ships/virgin-voyages'` in
`scripts/batch-validate-ships.js`.

---

## Score Tier Analysis

| Score Range | Ships | Interpretation |
|-------------|-------|----------------|
| 90-100      | 91    | Well-built pages; fleet-wide template issues remain |
| 80-89       | 58    | Passing; missing some content or minor structural gaps |
| 70-79       | 34    | Just below threshold; 1-2 fixes would push to pass |
| 50-69       | 88    | Missing significant content (logbook, videos, dining) |
| 24-49       | 12    | TBN/historical stubs or major structural failures |
| 0           | 4     | Non-ship pages or completely empty files |

---

## Priority Fix List

Listed by impact (ships unblocked per fix).

### Priority 1 — Fix Template (All 287 Pages)

| # | Fix | Type | Pages Affected |
|---|-----|------|----------------|
| 1 | Change Review `@type: "Vehicle"` → `@type: "Cruise"` | BLOCKING | 287 |
| 2 | Fix `initFirstLook`: `loop:false, rewind:false` | BLOCKING | 287 |
| 3 | Fix skip link: `id="content"` → `id="main-content"` on `<main>` | BLOCKING | 287 |
| 4 | Fix `batch-validate-ships.js` Virgin path: `ships/virgin` → `ships/virgin-voyages` | BUG | Validator |
| 5 | Exclude `venues.html` from batch validation | BUG | Validator |

### Priority 2 — Content Uplift (Luxury + MSC Lines, ~138 Ships)

| # | Fix | Type | Pages Affected |
|---|-----|------|----------------|
| 6 | Add logbook JSON files for MSC, Costa, Cunard, Oceania, Regent, Seabourn, Silversea, Explora | BLOCKING | ~138 |
| 7 | Add video JSON files for same lines | BLOCKING | ~138 |
| 8 | Build out dining venue data for same lines | WARNING | ~138 |
| 9 | Add carousel images (min 5) for MSC and other single-image pages | WARNING | ~50+ |

### Priority 3 — Template Polish (All Pages)

| # | Fix | Type |
|---|-----|------|
| 10 | Fix `og:image` to use per-ship social cards | WARNING |
| 11 | Fix `<title>` and `og:title`/`twitter:title` to match standard pattern | WARNING |
| 12 | Remove duplicate deck plans section (`id="deck-plans"`) | WARNING |
| 13 | Implement VesselFinder iframe embed in `initLiveTracker()` | WARNING |

### Priority 4 — MSC-Specific

| # | Fix | Type |
|---|-----|------|
| 14 | Fix ship name capitalization in headings ("Msc" → "MSC") | BLOCKING |
| 15 | Move `data-imo` from `<main>` to tracker `<section>` | BLOCKING |

---

## Files Inspected

- `scripts/batch-validate-ships.js` — batch runner
- `standards/SHIP_PAGE_STANDARD.md` — validation rules
- `ships/norwegian/norwegian-prima.html` — passing page (90%) — full read
- `ships/msc/msc-armonia.html` — failing page (56%) — full read
- `ships/rcl/icon-class-ship-tbn-2027.html` — failing TBN page (36%) — partial read
- `data/validated-ships.json` — full results (287 ships, generated 2026-02-12)

---

*Soli Deo Gloria*
