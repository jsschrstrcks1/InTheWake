# HANDOFF — P7 Phase 3+ (Deeper template/content work on premium/luxury fleet)

**Branch:** `claude/review-repo-structure-NpQIq`
**Last commit:** P7 Phase 2 complete — all 66 premium/luxury ships at accessibility-bundle parity

## What Was Done (through this session)

- **P1** `9133fcfe` — RCL charset position fix (17 ships)
- **P2** — Celebrity 29/29, HAL 43/46, Carnival 3/3 bare-header fixes (75 pages)
- **P3** `cfce87a8` — `knowsAbout` "Royal Caribbean" contamination cleanup (80 pages)
- **P4** `1e341263` — NCL + Cunard head infrastructure upgrade (24 pages)
- **P5** `c81b9f84` — Virgin Voyages nav/hero restructure (4 ships, 1err/9warn)
- **P6** `bd219990` — NCL duplicate section removal (20 ships, all 0/0)
- **P7 Phase 1** `8ea13550` — Princess accessibility bundle (17 ships)
- **P7 Phase 2** `9e737c0f` — Costa (9) + Oceania (8) + Regent (7) + Seabourn (7) + Silversea (12) + Explora (6) accessibility bundle (49 ships)

**Total ships touched across P1–P7 Phase 2: ~286 unique ship pages.**

All 66 premium/luxury ships dropped ~7 warnings each from the accessibility bundle. Now ~42-48 warnings/ship (down from 50-57). Remaining warnings are head-level infrastructure, structural dedup, and content-level.

## What Still Needs Doing

### P7 Phase 3 — ICP-Lite → ICP-2 head upgrade (all 66 premium/luxury ships)

For each page:
- Remove `<!-- ai-breadcrumbs ... -->` HTML comment at top
- `content-protocol` meta `ICP-Lite v1.x` → `ICP-2`
- Add STANDARDS comment block at top
- Add 7 missing SEO metas: `robots`, `googlebot`, `bingbot`, `color-scheme`, `theme-color`, `author`, `publisher`
- Add `meta referrer`
- Title format: `"Ship Name"` → `"Ship Name — Deck Plans, Live Tracker, Dining & Videos | In the Wake"`
- og:type `article` → `website` (where present)
- CSS version `3.010` → `3.010.400`
- Add favicon/apple-touch-icon/manifest links
- Add LCP preload for `/assets/social/ships-hero.jpg`
- Charset should be first in `<head>`, before scripts

Expected clearance: ~10-15 more warnings per page.

### P7 Phase 4 — Structural dedup (all 66 ships)

- Remove 2nd key-facts box (ship-specific content — read per page)
- Remove "At a Glance" quick-answer div
- Remove standalone Entertainment section if present
- Remove "Explore More"/Related Links if present
- `<div class="grid-2">` → `<section class="grid-2">` (or consolidate as NCL)
- Remove orphaned HTML comments (`<!-- Attribution Section -->`, `<!-- Stub Notice -->`)
- Deck plans: rename `deckPlansHeading` → `deck-plans` id
- Remove duplicate deck plans / tracker sections where they exist

Expected clearance: ~5-15 more warnings per page depending on how much dedup applies.

### Content workstream (requires data research — NOT template-fixable)

1. **Missing venues** — Add ships to `assets/data/venues-v2.json` (8-15 venues per ship × ~60 ships needing data)
2. **TBD stats** — Fill actual GT/guests/crew/IMO for:
   - Oceania: Nautica, Regatta, Riviera, Sirena, Vista
   - Regent: Prestige
   - Seabourn: Encore, Quest, Sojourn
   - Silversea: Endeavour
   - Explora: III, IV, V, VI (future ships — genuinely TBD until built)
3. **Missing `page.json`** — Create `assets/data/ships/<line>/<slug>.page.json` per ship (drives prefetching/tracker config)
4. **FAQ boilerplate** — Rewrite generic FAQ answers to be ship-specific (~60 ships)
5. **H1 bare ship name** — Add subtitle "— Deck Plans, Live Tracker, Dining & Videos"
6. **No "Who She's For" section** — Optional emotional-hook content per ship
7. **Fact-block missing crew count** — Small content edits
8. **Footer copyright year (2025 → 2026)** — Site-wide

### P8 — MSC template migration (24 ships)

Separate workstream. World America on v2.201 needs full rebuild; other 23 on v3.010.

### P9 — Carnival mixed template fixes (~48 ships)

Mixed templates across active/TBN/historic ships.

### Celebrity/HAL head infra catch-up (~75 ships)

Per the validator, Celebrity (29) and HAL (43) still have older head infrastructure — they need the same P4-style head bundle as NCL/Cunard received. This is a separate workstream.

## How to Resume

### Next recommended step: P7 Phase 3 head bundle

For each of the 66 premium/luxury ships, apply the head bundle documented in `/home/user/InTheWake/admin/claude/CAREFUL.md` and the NCL/Cunard P4 commit `1e341263` as reference. Use the Princess / Costa / Oceania / Regent / Seabourn / Silversea / Explora files.

### Key Decisions

- **DO NOT add `page-grid` class** to `<main>` on premium/luxury ships — they lack `<section class="col-1">` wrapper which triggers error #1363
- **Content-level work is a separate stream** from template work. Getting premium/luxury ships to 0/0 (like NCL) requires substantial dining-data research per ship
- **TBD ship IMOs** — Do not fabricate IMO data. Leave data-imo off those ships' trackers; the content stream will populate once ships are built/launched
- **Costa and Explora already had `a11y-status`** — skipped the ARIA IDs edit for those two fleets in Phase 2

## Files Changed This Session
- 66 ship HTML files (accessibility bundle applied)
- 7 commits pushed to origin
- This updated HANDOFF.md
