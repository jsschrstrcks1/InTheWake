# Ship Pages Repair Plan — 100% Pass, Zero Warnings

**Date:** 2026-03-24
**Based on:** `audit-reports/ship-validation-2026-03-24.md`
**Consulted:** GPT-4o (plan role, confidence 0.85)
**Goal:** 289/289 ship pages pass `admin/validate-ship-page.js` with no blocking errors and no warnings. Virgin Voyages included.

---

## Execution Status — 2026-03-24

| Phase | Status | Notes |
|-------|--------|-------|
| 1 — Template blockers | ✅ Complete | 4 blocking fixes applied (see below) |
| 2 — Validator fixes | ✅ Complete | Virgin path, exclude list, voiceQualityResult stub |
| 3 — Fleet-wide warnings | ⬜ Pending | |
| 4 — MSC structural | ✅ Complete | Capitalization + data-imo move |
| 5 — Content uplift | ⬜ Pending | Phase 3 first |
| 6 — Validation sign-off | ⬜ Pending | |

### Phase 1 — Actual Fixes Applied

The original plan identified 3 fleet-wide blocking errors. Execution found a fourth.

| # | Fix | Pages | Script |
|---|-----|-------|--------|
| BLOCKING-1 | Review schema `@type:"Vehicle"` → `@type:"Cruise"` + description | 218 | `fix-template-blockers.js` |
| BLOCKING-2 | `initFirstLook` Swiper `loop:true` → `loop:false,rewind:false,lazy:true` | 162 | `fix-template-blockers.js` |
| BLOCKING-3 | Skip link `href="#main-content"` → `href="#content"` | 284 | `fix-template-blockers.js` |
| BLOCKING-4 | `initVideos` Swiper missing `loop:false,rewind:false` (not in original plan) | 139 | `fix-template-blockers.js` |

### Phase 2 — Validator Fixes Applied

Two bugs found in `admin/validate-ship-page.js` that were silently wrong before execution:

1. **Virgin Voyages path**: `ships/virgin` → `ships/virgin-voyages` (4 ships were never being validated)
2. **`voiceQualityResult` undefined**: Variable referenced in 4 places but never assigned. Caused a runtime crash on every ship page — the entire fleet scored 0/100 until this was patched with a documented no-op stub.

> **Note on original "149 passing" figure:** This number came from a pre-execution audit. Given that the validator was crashing at runtime (voiceQualityResult), those numbers were likely from a cached or different validator version. The true pre-fix baseline cannot be recovered; 49/289 (17%) is the verified post-fix baseline.

### Phase 4 — MSC Structural Fixes Applied

| Fix | Pages |
|-----|-------|
| FIX-4.1: `"Msc "` → `"MSC "` in headings, aria-label, alt text | 22 |
| FIX-4.2: `data-imo` moved from `<main>` to tracker `<section>` | 17 |
| Manual: `msc-world-america.html` had 13 residual mutations in content= attributes, JSON-LD properties, HTML comments, and data-ship= — fixed via targeted string replace | 1 |

### Capitalization Script Limitations (documented)

`fix-msc-structural.js` used three regex passes. Known gaps:

- **HTML comments** (`<!-- ... -->`): The `>([^<]*?)Msc ` text-node regex cannot reach content inside `<!-- -->` blocks. The `<!--` opener contains `<` which terminates `[^<]*?` before the comment text is reached.
- **`content="..."` and `data-*="..."` attributes**: Only `aria-label=` and `alt=` attributes were targeted. Other attribute contexts require explicit regex patterns.
- **JSON-LD `<script>` blocks**: Reachable by the text-node regex in theory, but only if the span from the nearest `>` to the target text contains no `<` characters. Works in practice for well-formed JSON-LD.

---

## Actual Baseline (Post Phase 1+2+4, 2026-03-24)

| Metric | Value |
|--------|-------|
| Total pages | 289 |
| Passing (≥80%) | **49 (17%)** |
| Failing (<80%) | **240 (83%)** |
| Score distribution | 0–19: 5 · 20–39: 34 · 40–59: 99 · 60–79: 102 · 80–89: 46 · 90–100: 3 |

### Results by Line

| Line | Ships | Passing | Failing | Avg Score |
|------|-------|---------|---------|-----------|
| RCL | 48 | 22 | 26 | 73.9% |
| Carnival | 48 | 7 | 41 | 56.2% |
| Celebrity | 29 | 10 | 19 | 64.2% |
| Norwegian | 20 | 4 | 16 | 77.9% |
| Princess | 17 | 2 | 15 | 76.0% |
| Holland America | 46 | 4 | 42 | 55.7% |
| MSC | 24 | 0 | 24 | 52.9% |
| Costa | 9 | 0 | 9 | 45.6% |
| Cunard | 4 | 0 | 4 | 52.5% |
| Oceania | 8 | 0 | 8 | 56.8% |
| Regent | 7 | 0 | 7 | 46.0% |
| Seabourn | 7 | 0 | 7 | 44.0% |
| Silversea | 12 | 0 | 12 | 37.7% |
| Explora Journeys | 6 | 0 | 6 | 39.3% |
| Virgin Voyages | 5 | 0 | 5 | 30.2% |

**Highest-scoring failing lines:** Norwegian (77.9% avg) and Princess (76.0% avg) are closest to the threshold — Phase 3 or 5 content work could push them over.

**Lines at 0 passing:** All 10 non-RCL/Carnival/Celebrity/Norwegian/Princess lines. Most are blocked by content gaps (images, videos, key-facts) that Phase 5 must address.

---

## Original State (Pre-Execution Estimate)

| Metric | Value |
|--------|-------|
| Total pages | 287 (+ Virgin Voyages not yet validated) |
| Passing | ~149 (52%) — *unverified, from stale audit* |
| Failing | ~138 (48%) — *unverified* |
| Fleet-wide blocking errors | 3 (actual: 4) |
| Fleet-wide warnings | 7 |
| Lines at 0% pass | 8 (MSC, Costa, Cunard, Oceania, Regent, Seabourn, Silversea, Explora) |

---

## Phased Plan

### Phase 1 — Fix the Template (All 287 Pages, ~3 Blocking Errors)

These are surgical changes to the shared template that immediately unblock every page from three fleet-wide blocking failures. Do this first because these errors suppress scores across all lines regardless of content quality.

**1.1 — Review Schema: `@type: "Vehicle"` → `@type: "Cruise"`**

- **Files:** `ships/template.html` + all 287 `.html` pages (or generate via script)
- **Change:**
  ```json
  // Before:
  "itemReviewed": { "@type": "Vehicle", "name": "Norwegian Prima" }

  // After:
  "itemReviewed": {
    "@type": "Cruise",
    "name": "Norwegian Prima",
    "description": "A Prima-class ship operated by Norwegian Cruise Line."
  }
  ```
- **Script approach:** Use `sed` or a Node script to find/replace across all HTML files. The description must reference the correct ship class — read it from the page's existing `<meta name="ship-class">` or equivalent data attribute.
- **Validation:** Run `node admin/validate-ship-page.js` on one page before and after.

**1.2 — Swiper: `loop:true` → `loop:false, rewind:false`**

- **Files:** `ships/template.html` + all 287 `.html` pages
- **Change:** In `initFirstLook()`:
  ```javascript
  // Before:
  new Swiper(c, { loop: true, autoplay: { delay: 4500 } ... });

  // After:
  new Swiper('.swiper.firstlook', {
    loop: false,
    rewind: false,
    lazy: true,
    autoplay: { delay: 4500 },
    ...
  });
  ```
- **Note:** The *video* Swiper already uses `loop:false, rewind:false` — do not touch it.

**1.3 — Skip Link: `#main-content` → `#content` (or fix `<main>` id)**

- **Files:** `ships/template.html` + all 287 `.html` pages
- **Decision:** Align the skip link to `#content` (simpler, no main element restructure needed):
  ```html
  <!-- Before: -->
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <!-- After: -->
  <a href="#content" class="skip-link">Skip to main content</a>
  ```
- **WCAG impact:** This fixes a WCAG 2.1 AA failure present on every page.

**Automation tip:** These three changes are mechanical substitutions. Write a single Node script (`scripts/fix-template-blockers.js`) that reads every `.html` under `ships/`, applies all three changes, and writes back. Run once, then re-validate a sample before committing.

---

### Phase 2 — Fix the Validator / Batch Script (Infrastructure)

Fix the tooling before running large-scale content work so scores reflect reality.

**2.1 — Virgin Voyages Path Bug**

- **File:** `scripts/batch-validate-ships.js`
- **Change:**
  ```javascript
  // Before:
  'virgin': 'ships/virgin'
  // After:
  'virgin': 'ships/virgin-voyages'
  ```

**2.2 — Exclude Non-Ship Pages from RCL**

- **File:** `scripts/batch-validate-ships.js`
- **Change:** Add a blocklist / exclusion array:
  ```javascript
  const EXCLUDE_FILES = [
    'ships/rcl/venues.html',
    'ships/rcl/legend-of-the-seas-1995-built.html',
  ];
  ```
  Filter these before passing files to the validator.

**2.3 — Apply TBN Special Scoring Rules**

- **File:** `scripts/batch-validate-ships.js` (and/or `admin/validate-ship-page.js`)
- **Ships affected:**
  - `ships/rcl/icon-class-ship-tbn-2027.html`
  - `ships/rcl/icon-class-ship-tbn-2028.html`
  - `ships/rcl/quantum-ultra-class-ship-tbn-2028.html`
  - `ships/rcl/quantum-ultra-class-ship-tbn-2029.html`
  - `ships/rcl/star-class-ship-tbn-2028.html`
  - `ships/celebrity/unnamed-edge-class.html`
  - `ships/celebrity/unnamed-project-nirvana.html`
  - `ships/celebrity/unnamed-river-class-x6.html`
- **Change:** Consult `standards/SHIP_PAGE_STANDARD.md` for TBN page rules. Implement a TBN detection flag (e.g., `data-page-type="tbn"` on `<main>`) and skip content-presence checks (logbook, dining, video, carousel minimum) when flag is set.

**2.4 — Historical/Retired Ship Scoring**

- **Ships affected:** RCL retired fleet (Legend, Song of America, Song of Norway, Sovereign, Sun Viking, Nordic Prince, Nordic Empress, etc.)
- **Change:** Define a `data-page-type="retired"` flag; waive logbook story count requirements and video requirements for retired vessels. Document the waiver criteria in `standards/SHIP_PAGE_STANDARD.md`.

---

### Phase 3 — Fleet-Wide Warning Fixes (All Pages)

These are template-level changes that fix all 7 warnings. After Phase 1 most of these are straightforward substitutions.

**3.1 — `<title>` / `og:title` / `twitter:title` Pattern**

- **Files:** All 287 `.html` pages
- **Change:**
  ```html
  <!-- Before: -->
  <title>{Ship Name} — {Line} Ship Guide | In the Wake</title>

  <!-- After: -->
  <title>{Ship Name} | {Line} — Deck Plans, Live Tracker, Dining &amp; Videos | In the Wake</title>
  ```
  Same pattern for `og:title` and `twitter:title`.
- **Script approach:** Extract ship name and line from existing meta tags or page H1, then regenerate title tags.

**3.2 — `og:image` Per-Ship Social Cards**

- **Files:** All 287 `.html` pages
- **Change:**
  ```html
  <!-- Before (all pages): -->
  <meta property="og:image" content="https://cruisinginthewake.com/assets/social/ships-hero.jpg"/>

  <!-- After: -->
  <meta property="og:image" content="/assets/social/{slug}.jpg"/>
  ```
- **Prerequisite:** Social card images must exist at `/assets/social/{slug}.jpg`. If images are missing, create a fallback generation script or use a placeholder that is per-ship (not the generic hero). **Do not merge this change until the image assets exist**, or the og:image will 404.
- **Note:** This is a content asset dependency — coordinate with design/media pipeline.

**3.3 — Remove Duplicate Deck Plans Section**

- **Files:** All 287 `.html` pages
- **Change:** Remove the `<section aria-labelledby="deck-plans">` block (the one with only an external link button). Keep `<section aria-labelledby="deckPlansHeading">` and enhance its content.
- **Risk:** Do not remove the wrong section. Identify by the `aria-labelledby` attribute value.

**3.4 — Implement VesselFinder Tracker**

- **Files:** `ships/template.html` (shared JS) + all `.html` pages
- **Change:** In `initLiveTracker()`:
  ```javascript
  // After reading data-imo from the tracker section:
  const iframe = document.createElement('iframe');
  iframe.src = 'https://www.vesselfinder.com/aismap?imo=' + imo + '&zoom=10&track=true';
  iframe.title = 'Live position of ' + shipName;
  iframe.setAttribute('loading', 'lazy');
  trackerSection.appendChild(iframe);
  ```
- **Dependency:** `data-imo` must be on the tracker `<section>` (not `<main>`). MSC pages need Phase 4 fix first (see 4.2 below).

---

### Phase 4 — MSC-Specific Fixes

**4.1 — Fix Ship Name Capitalization**

- **Files:** All 24 MSC ship HTML pages
- **Change:** Find `Msc ` (capital M, lowercase s) in headings and `aria-label` attributes and replace with `MSC `.
  ```html
  <!-- Before: -->
  <h2 id="first-look">A First Look at Msc Armonia</h2>
  <!-- After: -->
  <h2 id="first-look">A First Look at MSC Armonia</h2>
  ```
- **Scope:** All `<h2>`, `<h3>`, `aria-label`, `aria-labelledby` text that contains ship names.

**4.2 — Move `data-imo` from `<main>` to Tracker `<section>`**

- **Files:** All 24 MSC ship HTML pages
- **Change:**
  ```html
  <!-- Before: -->
  <main class="wrap" id="content" role="main" data-imo="8807105">
    <section class="card" aria-labelledby="liveTrackHeading">

  <!-- After: -->
  <main class="wrap" id="content" role="main">
    <section class="card" aria-labelledby="liveTrackHeading" data-imo="8807105">
  ```
- **Script approach:** Per-file regex; match `<main[^>]* data-imo="(\d+)"` and move the attribute to the tracker section.

---

### Phase 5 — Content Uplift (~138 Pages: Luxury Lines + MSC + Others)

This is the largest phase. It requires actual content data, not just code changes. The validator checks for presence of JSON data files.

**5.1 — Logbook JSON Files**

- **Lines affected:** MSC, Costa, Cunard, Oceania, Regent, Seabourn, Silversea, Explora Journeys
- **Standard requirement:** 10+ stories per ship with required personas
- **Path pattern:** `/assets/data/logbook/{line}/{slug}.json`
- **Task:** Create logbook JSON files for all affected ships. This likely requires a content creation effort — either human-written entries or a seeded template. Define a minimum viable logbook structure and populate it.

**5.2 — Video JSON Files**

- **Lines affected:** Same as 5.1
- **Path pattern:** `/assets/data/videos/{slug}.json` (verify against template)
- **Task:** Create video JSON files linking to YouTube or equivalent cruise line content. Even linking to official cruise line promo videos satisfies the requirement.

**5.3 — Dining Venue Data**

- **Lines affected:** MSC, Costa, Cunard, Oceania, Regent, Seabourn, Silversea, Explora, and partial Celebrity
- **Task:** Populate `dining-data-source` JSON for each ship. At minimum, list the main restaurant, a specialty restaurant, and the buffet. This lifts pages from the 50-69 tier into the 80+ passing range.

**5.4 — Carousel Images (Minimum 5)**

- **Lines affected:** MSC (~23 pages with only 1 image), and likely some Costa/Cunard pages
- **Standard requirement:** 5–10 First Look carousel images per page
- **Task:** Source at least 5 ship photos per affected vessel, add to the page's `firstlook` Swiper markup.

**5.5 — Entertainment Section Content**

- **Lines affected:** Same as 5.3
- **Task:** Populate entertainment section data (shows, activities, enrichment programs). Even a short structured list satisfies the validator.

---

### Phase 6 — Validation Run and Sign-Off

1. Run `node scripts/batch-validate-ships.js` (after Phase 2 fixes are in)
2. Review output against 100% pass target
3. Triage any remaining failures — they will be in one of three buckets:
   - Content still missing → Phase 5 work remains
   - New validator edge case discovered → fix validator or standard (document the decision)
   - Page genuinely incomplete → decide: complete it, mark as TBN/retired, or exclude
4. Commit the final `data/validated-ships.json` output
5. Update `audit-reports/` with a new dated report

---

## File Touch Summary

| Phase | Files |
|-------|-------|
| 1 | `ships/template.html`, all 287 ship `.html` pages (script) |
| 2 | `scripts/batch-validate-ships.js`, `admin/validate-ship-page.js` |
| 3 | All 287 ship `.html` pages (script), shared JS |
| 4 | All 24 MSC `.html` pages |
| 5 | `/assets/data/logbook/**`, `/assets/data/videos/**`, dining JSON files, image assets |
| 6 | `data/validated-ships.json`, new `audit-reports/` entry |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Phase 1 script corrupts HTML in edge cases | Medium | High | Validate on 5 pages before bulk run; use git to roll back |
| Social card images (3.2) don't exist yet | High | Medium | Don't merge og:image change until assets exist; track separately |
| TBN/retired scoring rules not documented in standard | High | Medium | Write rules into `standards/SHIP_PAGE_STANDARD.md` first, then implement |
| Luxury line content (Phase 5) requires significant time | High | High | Phase 5 is content work, not code — assign to content team or accept phased delivery |
| Validator changes (Phase 2) alter pass/fail semantics | Low | High | Pin current `data/validated-ships.json` before any validator changes; compare before/after |
| MSC data-imo move breaks live tracker on some pages | Low | Medium | Test live tracker after Phase 4 on 3 representative pages |
| Virgin Voyages have their own structural issues once validated | Medium | Medium | Run validation dry-run first; audit results before committing fixes |

---

## Documentation Checklist

- [ ] Update `standards/SHIP_PAGE_STANDARD.md` with TBN and retired ship rules (before Phase 2.3/2.4)
- [ ] Add inline comments to `scripts/batch-validate-ships.js` explaining EXCLUDE_FILES and TBN detection
- [ ] Create `scripts/fix-template-blockers.js` with clear JSDoc
- [ ] Commit a new `audit-reports/ship-validation-{date}.md` after Phase 6 confirming 100% pass
- [ ] Update `audit-reports/00-START-HERE.txt` to reference this plan and the final audit
- [ ] Record any validator semantic changes in a `CHANGELOG` or similar

---

## Sequencing Rationale

1. **Template blockers first (Phase 1)** — Three mechanical changes that immediately lift 287 pages out of automatic failure. Highest leverage per line of code changed.
2. **Validator fixes second (Phase 2)** — Ensures the tool scores reality correctly before we do content work. Without this, Phase 5 effort may appear to not score.
3. **Fleet-wide warnings third (Phase 3)** — Clears the warning queue for pages already in the 80+ range; may push some borderline pages over the threshold.
4. **MSC structural fixes fourth (Phase 4)** — MSC is the largest failing block reachable via code change alone (no content needed for Phases 4.1 and 4.2).
5. **Content uplift last (Phase 5)** — Requires the most time and is content-team work, not engineering. All infrastructure must be correct before spending content effort.

---

*Soli Deo Gloria*
