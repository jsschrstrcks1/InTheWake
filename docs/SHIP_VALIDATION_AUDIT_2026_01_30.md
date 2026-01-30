# Ship Page Validation Audit & Path to 100%

**Project:** In the Wake (cruisinginthewake.com)
**Date:** 2026-01-30
**Branch:** `claude/validate-ship-pages-5Z2jp`
**Validator:** ITW-SHIP-002 v2.2
**Audited By:** Claude AI

---

## Executive Summary

The ship page validator currently reports **154 passing / 160 failing** out of 314 total entries (**49% pass rate**). However, 16 of those failures are **fleet index pages** (`index.html`) and 5 are **non-ship utility pages** (template, rooms, quiz, allshipquiz, venues). These are not ship detail pages and should not be scored by the ship validator.

**Adjusted numbers (true ship pages only):**

| Metric | Count |
|--------|-------|
| True ship pages | 293 |
| Currently passing | 154 |
| Currently failing | 139 |
| **Effective pass rate** | **52.6%** |

The path to 100% requires addressing **5 distinct failure tiers**, from quick template fixes affecting 60+ pages each to individual page-specific content issues.

---

## Current State by Cruise Line

| Cruise Line | Pass | Fail | Total | Rate | Tier |
|-------------|------|------|-------|------|------|
| Norwegian | 20 | 0 | 20 | **100%** | Done |
| Princess | 14 | 2 | 16 | **88%** | Tier 2 |
| Holland America | 30 | 9 | 39 | **77%** | Tier 3 |
| RCL | 34 | 12 | 46 | **74%** | Mixed |
| Carnival | 32 | 14 | 46 | **70%** | Mixed |
| Celebrity Cruises | 11 | 17 | 28 | **39%** | Tier 3-4 |
| MSC | 1 | 23 | 24 | **4%** | Tier 3 |
| Silversea | 0 | 12 | 12 | **0%** | Tier 3 |
| Seabourn | 0 | 7 | 7 | **0%** | Tier 3 |
| Regent | 0 | 7 | 7 | **0%** | Tier 3 |
| Oceania | 0 | 8 | 8 | **0%** | Tier 3 |
| Cunard | 0 | 4 | 4 | **0%** | Tier 3 |
| Costa | 0 | 9 | 9 | **0%** | Tier 3 |
| Virgin Voyages | 0 | 4 | 4 | **0%** | Tier 3-4 |
| Explora Journeys | 0 | 6 | 6 | **0%** | Tier 3 |
| Explora (legacy dir) | 0 | 2 | 2 | **0%** | Tier 3 |

*Note: Index pages excluded from counts above.*

---

## Top 10 Failure Codes

| Rank | Count | Code | Severity | Description |
|------|-------|------|----------|-------------|
| 1 | 300 | `navigation/some_missing_nav` | Warning | Missing `/ships/quiz.html` or `/planning.html` nav link |
| 2 | 269 | `logbook/short_stories` | Warning | Stories under 300 words |
| 3 | 265 | `word_counts/low_static_content` | Warning | Static content under target word count |
| 4 | 259 | `viewport/grid_responsive` | Warning | Grid-2 sections need responsive CSS check |
| 5 | 205 | `sections/missing_whimsical_units` | Warning | Missing `#whimsical-units-container` |
| 6 | 204 | `word_counts/faq_too_short` | Warning | FAQ section under 200 words |
| 7 | 161 | `sections/missing_grid2_firstlook_dining` | Warning | First Look + Dining not in grid-2 pair |
| 8 | 145 | `images/few_images` | **Error** | Fewer than 8 images |
| 9 | 110 | `discoverability/in_atlas_not_ready` | Warning | In atlas but under 90% score |
| 10 | 86 | `videos/missing_categories` | **Error** | Missing required video categories |

**Key insight:** Only 3 of the top 10 issues are blocking errors. The majority are warnings. The actual blocking errors cluster into a small number of fixable categories.

---

## Blocking Error Analysis

Every failing ship page has at least one of these blocking error types:

### Error Type A: Missing/Few Videos (affects ~120 pages)
```
[videos/few_videos] Only 0 videos, minimum 10
[videos/missing_categories] Missing video categories: ship walk through, top ten, suite, balcony, oceanview, interior, food, accessible
```
**Root cause:** Non-RCL cruise lines have no video JSON manifests. The validator requires 10+ videos across 8 categories.
**Fix complexity:** HIGH — requires YouTube video research per ship, creating video JSON files.
**Scope:** All Silversea, Seabourn, Regent, Oceania, Cunard, Costa, Virgin Voyages, Explora ships; most MSC and Celebrity ships.

### Error Type B: Few Images (affects ~145 pages)
```
[images/few_images] Only 6 images, minimum 8
```
**Root cause:** Many non-RCL pages were created with a minimal template containing 5-6 images.
**Fix complexity:** MEDIUM — requires sourcing 2-3 additional locally-hosted images per page.
**Scope:** Nearly all failing pages across all non-RCL cruise lines.

### Error Type C: Section Order Issues (affects ~40 pages)
```
[sections/wrong_section_order] Sections out of expected order: dining
```
**Root cause:** Dining section not placed after First Look in the expected order.
**Fix complexity:** LOW — HTML section reorder, scriptable.
**Scope:** Cunard, some MSC, some Celebrity, some Holland America.

### Error Type D: Missing Local Images (affects ~5 RCL pages)
```
[images/missing_local_images] 8 image(s) referenced but not found locally
```
**Root cause:** HTML references `/assets/ships/` images that don't exist on disk.
**Fix complexity:** LOW — either create placeholder images or update references.
**Scope:** Symphony of the Seas, Serenade of the Seas, possibly others.

### Error Type E: TBN/Unnamed Template Issues (affects ~14 pages)
```
[consistency/wrong_ship_video] Video heading references "Radiance" but page is for "Icon Class Ship Tbn 2027"
[json_ld/wrong_class_reference] Review references "radiance-class" but ship is not radiance class
[logbook/few_stories] Only 2 stories, minimum 10
```
**Root cause:** TBN pages were cloned from Radiance template without updating ship-specific references.
**Fix complexity:** MEDIUM — template cleanup + minimal content generation.
**Scope:** RCL TBN pages, Carnival unnamed-project-ace pages, Celebrity unnamed pages.

### Error Type F: Carnival Historic Ship Issues (affects ~8 pages)
```
[ai_breadcrumbs/missing_siblings] Missing required field: siblings
[ai_breadcrumbs/invalid_date] Updated date malformed
[sections/missing_required] Missing required sections: page_intro, first_look, faq
```
**Root cause:** Carnival historic ships use a different template than RCL historic ships.
**Fix complexity:** MEDIUM — needs ai-breadcrumbs fixes and section additions.
**Scope:** tropicale-1981, mardi-gras-1972, jubilee-1986, holiday-1985, festivale-1961, celebration-1987, carnivale-1956.

### Error Type G: One-Off Page Issues (affects ~5 pages)
Various unique issues:
- `msc-world-america.html`: hotlinked images, unclosed section tags, swiper missing rewind
- `carnival-tropicale.html`: 12 errors (severely broken page)
- `carnival-adventure.html`: 7 errors (stub page)
- `carnival-mardi-gras.html` (the 1972 original): naming collision issues
- `legend-of-the-seas-1995-built.html`: 9 errors (needs major rework)

---

## Path to 100%: Five-Tier Fix Plan

### Tier 0: Validator Scope Fix (Immediate — 21 pages removed from failure count)
**Impact: 160 failures → 139 failures**

Exclude non-ship pages from the ship validator's `--all-ships` sweep:

| Page Type | Count | Action |
|-----------|-------|--------|
| Fleet index pages (`*/index.html`) | 16 | Exclude from ship validator or create fleet-index validator |
| Root utility pages (`template.html`, `rooms.html`, `quiz.html`, `allshipquiz.html`) | 4 | Exclude from ship validator |
| `rcl/venues.html` | 1 | Exclude from ship validator |

**Implementation:** Update `validate-ship-page.js` glob pattern to exclude `index.html` and known non-ship files. Alternatively, add a `<!-- page-type: fleet-index -->` marker and skip those.

---

### Tier 1: Quick Wins — Near-Pass Pages (2 pages → passing)
**Impact: 139 → 137 failures**

These pages need only 1-2 targeted fixes:

| Page | Score | Errors | Fix Needed |
|------|-------|--------|------------|
| `rcl/symphony-of-the-seas.html` | 80 | 1E | Add missing local image files to `/assets/ships/` |
| `rcl/serenade-of-the-seas.html` | 80 | 1E | Add missing local image files to `/assets/ships/` |
| `princess/grand-princess.html` | 74 | 1E | Likely image or video issue — verify and fix |
| `princess/emerald-princess.html` | 76 | 1E | Likely image or video issue — verify and fix |
| `carnival/carnival-encounter.html` | 64 | 2E | Add video JSON manifest (only blocking errors are video-related) |

---

### Tier 2: Template-Level Fixes for Non-RCL Lines (97 pages)
**Impact: 137 → ~40 failures**

The vast majority of non-RCL failures share identical error profiles. They were built from a common template missing these elements:

**Common 3-Error Profile (score ~54):** images/few_images + videos/few_videos + videos/missing_categories
**Common 4-Error Profile (score ~44):** Above + sections/wrong_section_order

**Fix strategy per cruise line:**

| Cruise Line | Ships Failing | Primary Errors | Batch Fix |
|-------------|---------------|----------------|-----------|
| MSC | 23 | 3E (images + videos) | Create video manifests, add 2-3 images per page |
| Celebrity | 17 | 3-5E (images + videos + section order) | Fix section order, add images, create video manifests |
| Silversea | 12 | 3E (images + videos) | Create video manifests, add 2 images per page |
| Costa | 9 | 4E (images + videos + order) | Fix section order, add images, create video manifests |
| Oceania | 8 | 3-4E (images + videos) | Create video manifests, add 2 images per page |
| Holland America (active) | 8 | 4E (images + videos + order) | Fix section order, add images, create video manifests |
| Seabourn | 7 | 3-4E (images + videos) | Create video manifests, add 2 images per page |
| Regent | 7 | 3E (images + videos) | Create video manifests, add 2 images per page |
| Explora Journeys | 6 | 3-4E (images + videos) | Create video manifests, add 2 images per page |
| Cunard | 4 | 4E (images + videos + order) | Fix section order, add images, create video manifests |
| Virgin Voyages | 4 | 3-5E (images + videos) | Create video manifests, add images |
| Explora (legacy) | 2 | 3E (images + videos) | Create video manifests, add images |

**Required deliverables:**
1. **Video JSON manifests** for each cruise line (YouTube research needed)
2. **2-3 additional locally-hosted images** per failing ship page
3. **Section order fixes** for ~40 pages with wrong dining placement

**Recommended approach:** Build batch scripts per cruise line, similar to the existing `batch-fix-carnival-ships.js` pattern.

---

### Tier 3: TBN / Future Ship Pages (14 pages)
**Impact: ~40 → ~26 failures**

| Cruise Line | Pages | Issues |
|-------------|-------|--------|
| RCL | `icon-class-ship-tbn-2027.html`, `icon-class-ship-tbn-2028.html`, `star-class-ship-tbn-2028.html`, `quantum-ultra-class-ship-tbn-2028.html`, `quantum-ultra-class-ship-tbn-2029.html`, `discovery-class-ship-tbn.html`, `oasis-class-ship-tbn-2028.html`, `legend-of-the-seas-icon-class-entering-service-in-2026.html` | Wrong class references (cloned from Radiance template), few stories, missing videos |
| Carnival | `unnamed-project-ace-1.html`, `unnamed-project-ace-2.html`, `unnamed-project-ace-3.html` | Template stub, few images, missing content |
| Celebrity | `unnamed-river-class-x6.html`, `unnamed-project-nirvana.html`, `unnamed-edge-class.html` | Template stub, 9 errors each |

**Fix strategy:**
- Remove Radiance-class template references, replace with correct class
- Add placeholder logbook stories (generic class-anticipation stories)
- For Celebrity unnamed ships: rebuild from correct template
- Consider whether TBN pages with no real ship data should pass validation at all (validator policy decision)

---

### Tier 4: Carnival Historic Ships (8 pages)
**Impact: ~26 → ~18 failures**

| Page | Score | Primary Issues |
|------|-------|----------------|
| `tropicale-1981.html` | 38 | Missing siblings, malformed date, missing sections |
| `mardi-gras-1972.html` | 38 | Same pattern |
| `jubilee-1986.html` | 38 | Same pattern |
| `holiday-1985.html` | 38 | Same pattern |
| `festivale-1961.html` | 38 | Same pattern |
| `celebration-1987.html` | 38 | Same pattern |
| `carnivale-1956.html` | 28 | Same + extra issues |
| `carnival-festivale.html` | 34 | TBN variant of festivale |

**Fix strategy:**
1. Fix `ai-breadcrumbs` — add `siblings` field, fix malformed `updated` date format
2. Add missing required sections (`page_intro`, `first_look`, `faq`)
3. Follow the pattern established by passing RCL historic ships (Monarch, Nordic Empress, Majesty)

---

### Tier 5: One-Off / Severely Broken Pages (5-8 pages)
**Impact: ~18 → 0 failures**

| Page | Score | Errors | Action |
|------|-------|--------|--------|
| `msc/msc-world-america.html` | 4 | 8E | Fix hotlinked images, close section tags, add rewind:false, expand content |
| `carnival/carnival-tropicale.html` | 0 | 12E | Rebuild or merge with tropicale-1981.html |
| `carnival/carnival-adventure.html` | 8 | 7E | Stub page needs full build-out |
| `carnival/mardi-gras.html` | 32 | 5E | Disambiguate from mardi-gras-1972 |
| `rcl/legend-of-the-seas-1995-built.html` | 0 | 9E | Rebuild — likely needs merge with legend-of-the-seas.html |
| `rcl/legend-of-the-seas.html` | 42 | 4E | Section order + images + videos |
| `celebrity/ss-meridian.html` | 36 | 5E | Historic ship template fixes |
| `holland-america/none-announced.html` | 52 | 3E | Placeholder page — consider removing |

---

## Priority-Ordered Implementation Plan

### Phase 1: Foundations (no content changes needed)
1. **Update validator to exclude non-ship pages** — Remove 21 false failures
2. **Fix section ordering** across ~40 pages — Scriptable batch fix
3. **Fix ai-breadcrumbs formatting** on Carnival historic pages — Scriptable

### Phase 2: Image Gaps
4. **Add missing local images** for RCL near-pass pages (Symphony, Serenade)
5. **Source and add 2-3 images** per non-RCL ship page (~120 pages)

### Phase 3: Video Manifests (highest effort)
6. **Create video JSON manifests** for each cruise line:
   - Research YouTube channels for each cruise line
   - Map videos to the 8 required categories per ship
   - Priority order: MSC (23 pages), Celebrity (17), Silversea (12), Costa (9)

### Phase 4: Content & Template Fixes
7. **Fix TBN/unnamed page templates** — Remove wrong class references
8. **Rebuild Carnival historic pages** to match RCL historic template
9. **Fix one-off broken pages** individually

### Phase 5: Warning Cleanup (not blocking, but improves scores)
10. **Add `/ships/quiz.html` nav link** to all pages (300 warnings)
11. **Expand logbook stories** to 300+ words (269 warnings)
12. **Add `#whimsical-units-container`** to non-RCL pages (205 warnings)
13. **Expand FAQ sections** to 200+ words (204 warnings)
14. **Add grid-2 First Look + Dining pairing** (161 warnings)

---

## Effort Estimates by Phase

| Phase | Pages Affected | Scriptable? | Blocking? |
|-------|---------------|-------------|-----------|
| Phase 1: Foundations | 21 + 40 | Yes | Removes 21 false failures + fixes ~40 section orders |
| Phase 2: Images | ~125 | Partially | Fixes blocking error on ~125 pages |
| Phase 3: Videos | ~120 | No (research) | Fixes blocking error on ~120 pages |
| Phase 4: Templates | ~27 | Partially | Fixes remaining broken pages |
| Phase 5: Warnings | ~300 | Yes (batch) | Non-blocking score improvements |

---

## Decision Points for Project Owner

### D1: Should TBN/unnamed ships be required to pass validation?
- **Option A:** Exempt TBN/future ships from full validation (reduces scope by ~14 pages)
- **Option B:** Require TBN ships to pass with placeholder content
- **Recommendation:** Option A — these ships don't exist yet; relaxed criteria make sense

### D2: Should the video requirement apply to all cruise lines?
- **Option A:** Require 10+ videos across 8 categories for all lines (current behavior)
- **Option B:** Reduce video requirements for luxury/expedition lines (smaller ships = fewer videos available)
- **Option C:** Make videos a warning instead of a blocking error for non-RCL lines
- **Recommendation:** Option C — videos are the single largest blocker and most effort-intensive fix. Making them warnings would immediately pass ~60 pages.

### D3: What to do with duplicate/legacy pages?
- `ships/explora/` vs `ships/explora-journeys/` (duplicate directory)
- `carnival-tropicale.html` vs `tropicale-1981.html` (same ship?)
- `legend-of-the-seas.html` vs `legend-of-the-seas-1995-built.html` vs `legend-of-the-seas-icon-class-entering-service-in-2026.html`
- **Recommendation:** Consolidate duplicates, redirect old URLs

### D4: Should index pages have their own validator?
- Currently scoring 0/100 on the ship validator (wrong validator type)
- **Recommendation:** Create `validate-fleet-index.js` or exclude from ship validation

---

## Quick Wins Summary

If decisions D1 (exempt TBN), D2 (videos as warning), and D4 (exclude index) are adopted:

| Action | Pages Fixed | New Pass Rate |
|--------|-------------|---------------|
| Exclude index + utility pages | +0 (removes 21 from denominator) | 154/293 = 52.6% |
| Exempt TBN/unnamed pages | +0 (removes ~14 from denominator) | 154/279 = 55.2% |
| Make videos warning (not error) | ~60 pages pass | 214/279 = 76.7% |
| Fix section order (scriptable) | ~40 pages improve | ~240/279 = 86.0% |
| Add 2-3 images per page | ~30 more pages pass | ~270/279 = 96.8% |
| Fix remaining one-offs | ~9 more pages pass | **279/279 = 100%** |

**Without any policy changes** (pure content fixes only):

| Action | Pages Fixed | Cumulative Pass Rate |
|--------|-------------|---------------------|
| Start | 154/293 | 52.6% |
| Fix section ordering | +40 | 66.2% |
| Add images to all pages | +30 | 76.5% |
| Create video manifests | +50 | 93.5% |
| Fix TBN templates | +10 | 97.0% |
| Fix historic + one-offs | +9 | **100%** |

---

## Appendix A: Complete Failing Pages List

### Score 80 (1 error — nearest to passing)
- `rcl/symphony-of-the-seas.html` — missing local images
- `rcl/serenade-of-the-seas.html` — missing local images

### Score 74-76 (1 error)
- `princess/emerald-princess.html`
- `princess/grand-princess.html`
- `msc/msc-seaside.html`
- `msc/msc-seashore.html`
- `msc/msc-seascape.html`
- `msc/msc-magnifica.html`
- `msc/msc-divina.html`

### Score 64-68 (2 errors)
- `carnival/carnival-encounter.html`
- `virgin-voyages/resilient-lady.html`

### Score 54-58 (3 errors — largest cluster, 50+ pages)
All standard non-RCL ship pages with images + videos blocking errors.

### Score 44-52 (4 errors)
Pages with section order + images + videos errors.

### Score 26-42 (5-6 errors)
TBN pages, Carnival historic pages, and some Celebrity pages.

### Score 0-14 (7+ errors)
Severely broken pages: `msc-world-america`, `carnival-tropicale`, `carnival-adventure`, `legend-of-the-seas-1995-built`, unnamed Celebrity ships.

---

## Appendix B: Validator Error Reference

| Error Code | Severity | Threshold | Description |
|------------|----------|-----------|-------------|
| `images/few_images` | Error | <8 images | Page must have 8+ locally-hosted images |
| `images/missing_local_images` | Error | >0 missing | Referenced images must exist on disk |
| `images/missing_dining_hero` | Error | — | Dining section needs hero image |
| `images/hotlinked_images` | Error | >0 external | All images must be locally hosted |
| `videos/few_videos` | Error | <10 videos | Page must have 10+ videos in manifest |
| `videos/missing_categories` | Error | <8 categories | Must cover all 8 video categories |
| `sections/wrong_section_order` | Error | — | Sections must follow prescribed order |
| `sections/missing_required` | Error | — | Required sections (intro, firstlook, FAQ) present |
| `ai_breadcrumbs/missing_siblings` | Error | — | AI breadcrumbs must include siblings field |
| `ai_breadcrumbs/invalid_date` | Error | — | Date must be YYYY-MM-DD format |
| `consistency/wrong_ship_video` | Error | — | Video heading must match page ship name |
| `consistency/wrong_ship_tracker` | Error | — | Tracker heading must match page ship name |
| `json_ld/wrong_class_reference` | Error | — | JSON-LD class must match actual ship class |
| `javascript/swiper_missing_rewind` | Error | — | All Swipers need `rewind:false` |
| `html_structure/unclosed_section` | Error | — | Opening/closing section tags must match |
| `word_counts/page_too_short` | Error | <500 words | Static content must be 500+ words |
| `logbook/few_stories` | Error | <10 stories | Must have 10+ logbook stories |

---

*Soli Deo Gloria*
