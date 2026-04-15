# HANDOFF — P7 Phase 2+ (Premium/luxury fleet template & content work)

**Branch:** `claude/review-repo-structure-NpQIq`
**Last commit:** P7 Phase 1 — Princess accessibility bundle (17 ships)

## What Was Done (through this session)

- **P1** `9133fcfe` — RCL charset position fix (17 ships)
- **P2** — Celebrity 29/29, HAL 43/46, Carnival 3/3 bare-header fixes (75 pages)
- **P3** `cfce87a8` — `knowsAbout` "Royal Caribbean" contamination cleanup (80 pages)
- **P4** `1e341263` — NCL + Cunard head infrastructure upgrade (24 pages)
- **P5** `c81b9f84` — Virgin Voyages nav/hero restructure (4 ships, 1err/9warn)
- **P6** `bd219990` — NCL duplicate section removal (20 ships, all 0/0)
- **P7 Phase 1** `8ea13550` — Princess accessibility bundle (17 ships, −7 warn each)

## What Still Needs Doing — P7 Phase 2: Remaining 49 premium/luxury ships

**Apply the same universal accessibility bundle as Princess P7 Phase 1 to:**
- Costa (9 ships)
- Oceania (8 ships)
- Regent (7 ships)
- Seabourn (7 ships)
- Silversea (12 ships)
- Explora Journeys (6 ships)

### The universal bundle (applied per page):

1. Skip link `href="#content"` → `href="#main-content"`
2. ARIA IDs: `aria-live-polite`/`aria-live-assertive` → `a11y-status`/`a11y-alerts` (add `aria-atomic="true"`)
   - **NOTE:** Costa and Explora already have `a11y-status` — skip this edit for those fleets
3. Brand logo: remove `<a href="/">` wrap, change `loading="lazy"` → `loading="eager"`
4. `<div class="latlon-grid" >` → `<div class="latlon-grid" aria-hidden="true">`
5. Hero compass: `loading="lazy"` → `loading="eager"`
6. Tagline: `<div class="tagline" >` → `<div class="tagline" aria-hidden="true">`
7. Add hero-credit block (Flickers of Majesty pills) after tagline
8. `<main class="wrap" id="content" role="main">` → `<main class="wrap" id="main-content" role="main" tabindex="-1">`
   - **Do NOT** add `page-grid` class — premium ships are missing the `<section class="col-1">` wrapper and adding page-grid triggers error #1363
9. Footer `&middot;` → `·` (use replace_all)
10. Print button SVG: add `aria-hidden="true"`

Expected result: ~7 warnings cleared per ship.

### Then deeper work (optional further phases):

**P7 Phase 3 — ICP-Lite → ICP-2 head upgrade (all 49 + 17 = 66 premium/luxury ships):**
- Remove `<!-- ai-breadcrumbs ... -->` HTML comment at top of each page
- `content-protocol` meta `ICP-Lite v1.x` → `ICP-2`
- Add STANDARDS comment block at top
- Add 7 missing SEO metas: robots, googlebot, bingbot, color-scheme, theme-color, author, publisher
- Add meta referrer
- Title format: `"Ship Name"` → `"Ship Name — Deck Plans, Live Tracker, Dining & Videos | In the Wake"`
- og:type `article` → `website`
- CSS version `3.010` → `3.010.400`
- Add favicon/apple-touch-icon/manifest links
- Add LCP preload for `/assets/social/ships-hero.jpg`
- Charset should be first in `<head>`, before scripts

**P7 Phase 4 — Structural dedup (all 66 ships):**
- Remove 2nd key-facts box
- Remove "At a Glance" quick-answer div
- Remove standalone Entertainment section if present
- Remove "Explore More"/Related Links if present
- `<div class="grid-2">` → `<section class="grid-2">` (or consolidate as NCL)
- Remove orphaned HTML comments (`<!-- Attribution Section -->`, `<!-- Stub Notice -->`)
- Tracker: rename `trackingHeading` → `liveTrackHeading`, add `data-imo`/`data-name`
- Deck plans: rename `deckPlansHeading` → `deck-plans` id

**P8 — MSC template migration (24 ships)** — separate workstream
**P9 — Carnival mixed template fixes (~48 ships)** — separate workstream

### Content-level work (requires data research, NOT template-fixable):

These are errors and warnings that can't be fixed without data:

1. **Missing venues** — Ships not in `assets/data/venues-v2.json`. Requires researching actual dining venues per ship (~66 ships × 8-15 venues each).
2. **TBD stats** — Some ships have TBD fields in ship stats JSON. Need actual specs.
3. **Missing page.json** — Each ship needs `assets/data/ships/<line>/<slug>.page.json` for prefetching/tracker config.
4. **FAQ boilerplate** — Generic template FAQ answers need ship-specific content.
5. **H1 bare ship name** — needs subtitle "— Deck Plans, Live Tracker, Dining & Videos"
6. **No "Who She's For" section** — optional emotional-hook content
7. **Fact-block missing crew count** — small content edits
8. **Footer copyright year (2025 → 2026)** — one-line site-wide fix

## How to Resume

### Quickest win: apply P7 Phase 1 bundle to Costa next (9 ships)

```bash
cd /home/user/InTheWake
# For each Costa ship, apply the 10-step bundle.
# Costa already has a11y-status IDs — skip step 2 for Costa.
# Then: Oceania, Regent, Seabourn, Silversea, Explora
```

### First step for next session:

Read `ships/costa/costa-deliziosa.html`. Apply the 10-step bundle (minus step 2 since Costa already has a11y-status). Verify `bash admin/validate-ship-page.sh` drops 7 warnings. Then replicate across 8 remaining Costa ships. Commit. Move to Oceania.

## Key Decisions

- **DO NOT** add `page-grid` class to `<main>` on premium/luxury ships. They lack the `<section class="col-1">` wrapper that NCL has — adding `page-grid` triggers error #1363. The accessibility fixes still apply (id, tabindex) just without the page-grid class.
- **Content-level work is a separate stream** from template work. Getting premium/luxury ships to 0/0 (like NCL) requires substantial dining-data research per ship.
- **Costa & Explora already have `a11y-status`** — their ARIA IDs are already correct, so that edit (step 2) can be skipped for those two fleets.

## Files Created/Modified This Session

- 17 Princess HTML files (accessibility bundle)
- 1 commit: `8ea13550` (pushed to origin)
- This HANDOFF.md
