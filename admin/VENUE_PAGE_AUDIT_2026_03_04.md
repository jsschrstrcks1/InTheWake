# Venue Page Audit & Upgrade Plan

**Date:** 2026-03-04
**Branch:** claude/explore-venue-photos-OeAgM
**Auditor:** Claude (Emotional Hook Test + manual review)
**Skill Used:** emotional-hook-test v1.0.0

---

## Executive Summary

472 venue pages exist across `restaurants/` (including `carnival/`, `ncl/`, `virgin/`, `msc/` subdirectories). The audit reveals **two distinct generations** of pages with a massive quality gap between them.

- **Gen2 (rich/real content):** ~93 pages (20%) — detailed content, specific prices, named logbook reviews, some with venue photos
- **Gen1 (stubs/template-generated):** ~379 pages (80%) — placeholder key facts, generic reviews, missing ship availability

The Emotional Hook Test exposes the core problem: **Gen1 pages fail questions 3 (SEEN) and 4 (CONFIDENCE) every time.** They read like database output, not human-written cruise guides.

---

## Breakdown by Cruise Line

| Directory | Count | Gen1 (stub) | Gen2 (rich) |
|-----------|-------|-------------|-------------|
| `restaurants/` (root = Royal Caribbean) | 280 | ~93 | ~187 |
| `restaurants/ncl/` | 78 | ~78 | 0 |
| `restaurants/virgin/` | 46 | ~46 | 0 |
| `restaurants/msc/` | 45 | ~45 | 0 |
| `restaurants/carnival/` | 23 | ~23 | 0 |
| **Total** | **472** | **~379** | **~93** |

**Key observation:** All NCL, Virgin Voyages, MSC, and Carnival pages are Gen1 stubs. Only Royal Caribbean root-level pages have Gen2 content, and even there ~93 of 280 are stubs.

---

## Data Quality Bugs Found

### 1. Duplicated FAQ Answers (Critical)
**Count:** 9 files have FAQ answer text doubled within the same answer (no space between copies).

**Files affected:**
- `restaurants/celebration-table.html`
- `restaurants/giovannis-italian-kitchen.html`
- `restaurants/hooked-seafood.html`
- `restaurants/izumi-in-the-park.html`
- `restaurants/jamies-italian.html`
- `restaurants/lincoln-park-supper-club.html`
- `restaurants/sabor-taqueria.html`
- `restaurants/sabor.html`
- `restaurants/trellis-bar.html`

**Pattern:** `"There's a cover charge (typically $45-70 per person) or a la carte pricing. Check the menu section for current prices.There's a cover charge..."` — text repeated with no space.

### 2. "Ship availability information coming soon" Placeholder
**Count:** 18 pages still have this placeholder text in the availability section.
**Files:** adagio-dining-room, american-icon-grill, bull-and-bear-pub, casino-bar, chic, cosmopolitan-club, dazzles, olive-or-twist, on-air, plaza-bar, sabor-taqueria, sapphire-restaurant, silk, star-lounge, the-bamboo-room, the-grande, the-pit-stop, two70-bar

### 3. "Varies by venue" Placeholder Key Facts
**Count:** 187 pages have `Varies by venue` as the Price key fact.
**Impact:** Fails Emotional Hook Test question 4 (CONFIDENCE) — reader gets no actionable info.

### 4. Generic Logbook Reviews
**Count:** ~297 files have `Guest Experience Summary` as the review title (generic template).
**Impact:** Fails Emotional Hook Test question 3 (SEEN) — feels like Wikipedia, not lived experience.

### 5. Mismatched JSON-LD Schema Types
**Count:** 14 activity venues incorrectly use `"@type": "Restaurant"` and `"category": "Dining Venue"`.

**Files affected:**
- `restaurants/flowrider.html` (surfing simulator)
- `restaurants/rock-climbing.html`
- `restaurants/zip-line.html`
- `restaurants/laser-tag.html`
- `restaurants/mini-golf.html`
- `restaurants/ripcord.html` (skydiving simulator)
- `restaurants/bungee-trampoline.html`
- `restaurants/freedom-fairways.html`
- `restaurants/battle-for-planet-z.html`
- `restaurants/adventure-dunes.html`
- `restaurants/lost-dunes.html`
- `restaurants/navigator-dunes.html`
- `restaurants/splashaway-bay.html`
- `restaurants/thrill-island.html`

Should use `SportsActivityLocation`, `AmusementPark`, or `EntertainmentBusiness`.

### 6. Missing `venue-tags` Meta
**Count:** 453 files (96%) lack the `venue-tags` meta tag. Only 19 files have it.

### 7. Unused Venue Photo Assets
3 venues have photo assets in `assets/images/restaurants/photos/venues/` but don't embed them:
- `harp-and-horn` (has 720w + 1200w)
- `crown-lounge` (has 720w + 1200w)
- `the-shop` (has 720w + 1200w)

---

## Emotional Hook Test Results (7 Pages Sampled)

### Gen2 Pages (Rich Content)

| Page | Clarity | Calm | Seen | Confidence | Guided | Score |
|------|---------|------|------|------------|--------|-------|
| **Comedy Live** | PASS | PASS | PASS | PASS | PASS | 5/5 — Ship it |
| **Windjammer** | PASS | PASS | PASS | PASS | PASS | 5/5 — Ship it |
| **FlowRider** | PASS | PASS | PASS | PASS | PASS | 5/5 — Ship it |
| **Cafe Promenade** | PASS | PARTIAL | PASS | PASS | PASS | 4/5 — Ship with note |
| **Sky Lounge** | PASS | PASS | PARTIAL | PASS | PASS | 4/5 — Ship with note |

### Gen1 Pages (Stubs)

| Page | Clarity | Calm | Seen | Confidence | Guided | Score |
|------|---------|------|------|------------|--------|-------|
| **Jamie's Italian** | PASS | PASS | FAIL | FAIL | PASS | 3/5 — Hold |
| **Silk** | PASS | PASS | FAIL | FAIL | PASS | 3/5 — Hold |

**Pattern:** Gen1 pages pass Clarity and Calm (the template structure works) but fail Seen and Confidence (the content is hollow). The logbook reviews are generic composites, the key facts are vague, and the answer-lines are just the ai-breadcrumb tagline repeated.

---

## Gen1 vs Gen2: Specific Differences

| Feature | Gen1 (Stub) | Gen2 (Rich) |
|---------|-------------|-------------|
| **ai-breadcrumbs answer-first** | Short tagline (~5-10 words) | Full sentence with specifics |
| **Quick Answer** | Tagline repeated | Detailed answer with context |
| **Key Facts: Price** | "Varies by venue" | Specific (e.g., "$49 per person", "Complimentary") |
| **Key Facts: Reservations** | "Check Royal Caribbean app" | Specific (e.g., "Recommended for dinner", "None needed") |
| **Lede line** | Missing | Present with personality |
| **Blurb** | Tagline + hub link | Paragraph with context and cross-links |
| **Logbook review** | "Guest Experience Summary" generic | Named ship, date, specific meals described |
| **Venue photo** | None | `<figure class="venue-photo">` with responsive srcset |
| **Ship availability** | "Coming soon" or absent | Hardcoded ship list or dynamic JSON hydration |
| **Related venues sidebar** | None | Present on newer pages |
| **venue-tags meta** | Missing | Present |
| **URL normalizer script** | Sometimes missing | Full ORIGIN normalizer |
| **FAQ styling** | Inline styles on section | Clean class-based |

---

## Venue Photos: Current State

**17 venues** have dedicated photo assets (720w + 1200w webp in `assets/images/restaurants/photos/venues/`):

| Venue Slug | Photo Used in Page? |
|------------|-------------------|
| bionic-bar | Yes |
| cafe-promenade | Yes |
| chic | Yes |
| chops-grille | Yes |
| coastal-kitchen | Yes |
| crown-lounge | **No** — photo exists but not embedded |
| grande | Yes |
| harp-and-horn | **No** — photo exists but not embedded |
| izumi | Yes |
| music-hall | Yes |
| schooner-bar | Yes |
| sonic-odyssey | Yes |
| sorrentos | Yes |
| the-shop | **No** — photo exists but not embedded |
| two70 | Yes |
| windjammer | Yes |
| wonderland | Yes |

**15 pages** currently embed venue photos. **3 have assets but don't use them.**

---

## Recommended Upgrade Tiers

### Tier 0: Quick Fixes (Low effort, immediate value)
1. **Embed 3 unused venue photos** into crown-lounge, harp-and-horn, the-shop pages
2. **Fix duplicated FAQ answer text** in all affected pages
3. **Fix mismatched JSON-LD types** for non-restaurant venues (FlowRider → SportsActivityLocation, etc.)

### Tier 1: Stub Enrichment — Royal Caribbean Priority (Medium effort)
Focus on the ~93 Royal Caribbean Gen1 stubs first:
1. Replace "Varies by venue" with actual prices
2. Replace "Check Royal Caribbean app" with specific reservation guidance
3. Add specific lede lines
4. Flesh out Quick Answer beyond tagline
5. Add venue-tags meta

### Tier 2: Logbook Review Upgrades (High effort, high value)
Replace generic "Guest Experience Summary" reviews with specific first-person accounts:
- Named ship + date
- Specific dishes/experiences described
- Personal narrative voice
- This is the biggest Emotional Hook Test improvement possible

### Tier 3: Non-RCL Cruise Line Pages (NCL, Virgin, MSC, Carnival)
All 192 pages in subdirectories are Gen1 stubs. Same treatment as Tier 1 + Tier 2 but requires research into each cruise line's specific venues.

### Tier 4: Venue Photo Expansion
Commission/source more venue photos for high-traffic pages beyond the current 17.

---

## Metrics for Tracking Progress

| Metric | Current | Target |
|--------|---------|--------|
| Pages with "Varies by venue" | 187 | 0 |
| Pages with "Ship availability coming soon" | 18 | 0 |
| Pages with generic "Guest Experience Summary" | ~297 | < 50 |
| Pages with venue photos | 15 (17 in VENUE_IMAGES map) | 30+ |
| Pages with duplicated FAQ text | ~~9~~ **0** ✅ | 0 |
| Pages missing venue-tags meta | 453 | < 100 |
| Activity venues with wrong JSON-LD type | ~~14~~ **0** ✅ | 0 |
| Emotional Hook Test 4+/5 | ~93 (est.) | 200+ |

---

## Session Progress — Tier 0 Execution (2026-03-04)

### Tier 0.2: Duplicated FAQ Answers — COMPLETE
Fixed 9 files with doubled FAQ answer text in JSON-LD FAQPage structured data (line 143 in each).
All 9 had identical duplication: `"There's a cover charge...prices.There's a cover charge...prices."` → deduplicated to single copy.

**Files fixed:** celebration-table, giovannis-italian-kitchen, hooked-seafood, izumi-in-the-park, jamies-italian, lincoln-park-supper-club, sabor-taqueria, sabor, trellis-bar

### Tier 0.3: Mismatched JSON-LD Types — COMPLETE
Fixed 14 activity venue files that incorrectly used `"@type": "Restaurant"` and `"category": "Dining Venue"`.

- **10 files → `SportsActivityLocation` / `"Sports & Recreation"`:** flowrider, rock-climbing, zip-line, mini-golf, ripcord, bungee-trampoline, freedom-fairways, adventure-dunes, lost-dunes, navigator-dunes
- **4 files → `AmusementPark` / `"Entertainment & Activities"`:** laser-tag, battle-for-planet-z, splashaway-bay, thrill-island

### Tier 0.1: Venue Photo Embedding — PARTIALLY COMPLETE
- **crown-lounge:** Already embedded in `diamond-lounge.html` (same venue, renamed). Audit incorrectly flagged this because no `crown-lounge.html` exists, but the photo IS used in the Diamond Lounge page.
- **harp-and-horn:** Added to VENUE_IMAGES map in `restaurants-dynamic.js` (shows on Explore page). No HTML page exists — needs creation in future session.
- **the-shop:** Added to VENUE_IMAGES map in `restaurants-dynamic.js` (shows on Explore page). No HTML page exists — needs creation in future session.

### Cleanup
- Removed stray `IMG_2527.JPG` from `assets/images/restaurants/photos/venues/`.

### Updated Metrics

| Metric | Before | After |
|--------|--------|-------|
| Pages with duplicated FAQ text | 9 | 0 |
| Activity venues with wrong JSON-LD type | 14 | 0 |
| Photos in VENUE_IMAGES map | 15 | 17 |

---

## Files Modified by This Audit

- This file: `admin/VENUE_PAGE_AUDIT_2026_03_04.md` (new, updated with Tier 0 progress)

## Files Read During Audit (7 venue pages)

1. `restaurants/comedy-live.html` — Gen2, 5/5
2. `restaurants/sky-lounge.html` — Gen2, 4/5
3. `restaurants/cafe-promenade.html` — Gen2, 4/5
4. `restaurants/windjammer.html` — Gen2, 5/5
5. `restaurants/jamies-italian.html` — Gen1, 3/5
6. `restaurants/flowrider.html` — Gen2, 5/5
7. `restaurants/silk.html` — Gen1, 3/5

---

*Soli Deo Gloria* — Every venue page should make the reader feel prepared and cared for, not just technically compliant.
