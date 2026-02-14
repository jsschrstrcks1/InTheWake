# Plan: Bring RCL Fleet to 100% Validation

**Date:** 2026-02-14
**Scope:** 31 active RCL ships (excludes TBN, historic, index.html, venues.html)
**Current state (post-Phase 1):** All RCL ships at 0 errors, 0 warnings (bash validator)
**Target:** 100/100 on all 31 active ships (0 errors, 0 warnings)
**Scoring:** `100 - (errors × 10) - (warnings × 2)`

---

## Phase 1: Template-Level Bulk Fixes (31 ships, no decisions needed)

These are the same pattern across all/most active ships. Fix in template, propagate.

### 1A. Merge Duplicate Class Attributes
- **Scope:** 31/31 ships, ~6 occurrences each
- **Patterns to fix:**
  - `class="tiny content-text" class="mb-075"` → `class="tiny content-text mb-075"`
  - `class="tiny" class="loading-text"` → `class="tiny loading-text"`
  - `class="rail-nav" aria-label="..." class="rail-nav mb-05"` → `class="rail-nav mb-05" aria-label="..."`
  - `class="card" id="..." class="whimsical-units-container"` → `class="card whimsical-units-container" id="..."`
- **Removes:** 31 × `html_validity/duplicate_class_attr` warnings

### 1B. Strip `(V1.Beta)` from Title Tags
- **Scope:** 31/31 ships
- **Fix:** Remove ` (V1.Beta)` from `<title>` and `og:title`
- **Removes:** 31 × `html_validity/beta_in_title` warnings

### 1C. Remove V1.Beta Navbar Badge
- **Scope:** 31/31 ships
- **Fix:** Delete `<span class="tiny version-badge" ...>V1.Beta</span>`
- **Removes:** 31 × `html_validity/beta_navbar_badge` warnings

### 1D. Remove `aria-hidden` from SDG Footer
- **Scope:** 31/31 ships (per Ken's decision: dedication should be accessible)
- **Fix:** Remove `aria-hidden="true"` from SDG `<p>` in footer; remove `visually-hidden`/`dedication-hidden` class if it hides the element
- **Removes:** 31 × `accessibility/sdg_aria_hidden` warnings

### 1E. Add `<noscript>` Logbook Fallback
- **Scope:** 29/31 ships (Radiance + Utopia already have it)
- **Fix:** Add inline `<noscript>` block inside the logbook section with at least one static story
- **Template:** Copy pattern from `radiance-of-the-seas.html` logbook section
- **Removes:** 29 × `word_counts/no_static_logbook` **blocking errors**

### 1F. Add `/planning.html` to Navigation
- **Scope:** 29/31 ships (Radiance + Utopia already have it)
- **Fix:** Add `<a href="/planning.html">` to nav dropdown
- **Removes:** 29 × `navigation/some_missing_nav` warnings

### 1G. Fix False-Positive Alt Attribute Warning in Bash Validator
- **Scope:** `admin/validate-ship-page.sh` line 407
- **Bug:** Regex `<img[^>]*[^"]>` matched all self-closing `/>` tags (the `/` matched `[^"]`), then piped a count to `grep -v 'alt='` which always passed through
- **Fix:** Join lines with `tr '\n' ' '`, extract img tags with `grep -oE`, count those truly missing `alt=`
- **Removes:** false-positive `images/missing_alt` warning on every ship page

### Phase 1 Impact — COMPLETED
- **Errors removed:** 29 blocking errors (noscript logbook — done in prior session)
- **Warnings removed:** All — 1A–1D fixed 4 real warnings; 1G fixed 1 false positive
- **Result:** All RCL ships now at 0 errors, 0 warnings (bash validator)

---

## Phase 2: Per-Ship Content Fixes (no decisions needed)

### 2A. Expand FAQ Sections to 200+ Words
- **Scope:** 8 ships
- **Ships and current word counts:**
  - voyager-of-the-seas (165), vision-of-the-seas (163), star-of-the-seas (175)
  - rhapsody-of-the-seas (159), grandeur-of-the-seas (161)
  - enchantment-of-the-seas (155), adventure-of-the-seas (162)
  - legend-of-the-seas (178)
- **Fix:** Expand existing FAQ answers with ship-specific detail (35–45 words each)
- **Removes:** 8 × `word_counts/faq_too_short` warnings

### 2B. Remove Brochure Language
- **Scope:** 4 ships
- **Ships:** vision-of-the-seas, legend-of-the-seas-1995-built, grandeur-of-the-seas, enchantment-of-the-seas
- **Pattern:** Replace "perfect for" with ship-specific pastoral language
- **Removes:** 4 × `content_purity/forbidden_brochure` warnings

### 2C. Fix Short AI Summary
- **Scope:** 1 ship (legend-of-the-seas)
- **Fix:** Expand ai-summary to meet minimum length
- **Removes:** 1 × `icp_lite/ai_summary_short` warning

### 2D. Fix Short Alt Text
- **Scope:** 1 ship (freedom-of-the-seas)
- **Fix:** Expand image alt text to be more descriptive
- **Removes:** 1 × `images/short_alt` warning

### Phase 2 Impact
- **Warnings removed:** 14
- **Expected post-Phase-2 scores:** Most ships → 96–100

---

## Phase 3: Decisions Needed from Ken

### 3A. Editorial Ratings (31 ships) — RESOLVED
- **Decision (2026-02-14):** Remove ratingValue entirely from all ship pages
- **Action taken:** Removed `reviewRating` block from all 293 ship page JSON-LD; updated both validators
- **Impact:** 31 × `json_ld/unverified_rating` warnings eliminated
- **Future:** Ratings may be re-added with documented editorial methodology

### 3B. Missing Video Categories (15 ships)
- **Issue:** Ships missing `food` and/or `accessible` video categories in the video manifest
- **Ships missing `food` only (10):** symphony, star, navigator, mariner, independence, icon, odyssey, oasis, liberty (already has accessible), explorer (also missing interior)
- **Ships missing `accessible` only (1):** liberty-of-the-seas
- **Ships missing both `food` + `accessible` (5):** rhapsody, harmony, freedom, adventure, spectrum (also missing oceanview)
- **Options:**
  1. Claude sources YouTube videos for these categories
  2. Mark categories as N/A for ships where no good video exists
  3. Relax the requirement for food/accessible categories
- **Impact:** Removes 15 × `videos/some_missing_categories` warnings

### 3C. Missing Logbook Personas (5 ships)
- **Issue:** Logbook JSON files don't cover all required persona types
- **Ships:**
  - wonder-of-the-seas: missing honeymoon, elderly, widow, accessible
  - jewel-of-the-seas: missing solo, honeymoon, elderly, accessible
  - grandeur-of-the-seas: missing solo, family, honeymoon, elderly, accessible
  - legend-of-the-seas: missing family, honeymoon, elderly, widow, accessible
  - legend-of-the-seas-1995-built: missing solo, family, honeymoon, elderly, widow, accessible
- **Options:**
  1. Write additional logbook stories for missing personas (follows LOGBOOK_ENTRY_STANDARDS_v2)
  2. Relax persona requirement for ships with fewer review signals
- **Impact:** Removes 5 × `logbook/missing_personas` warnings

### 3D. Legend of the Seas Taxonomy
- **Issue:** Three files exist for "Legend of the Seas":
  - `legend-of-the-seas.html` — new Icon-class ship (active, score 40)
  - `legend-of-the-seas-icon-class-entering-service-in-2026.html` — TBN (score 50)
  - `legend-of-the-seas-1995-built.html` — original 1995 ship (score 22, NOT flagged historic)
- **Questions:**
  1. Should `legend-of-the-seas-1995-built` be marked as historic? (Would exempt it from active fleet requirements)
  2. Is `legend-of-the-seas` the canonical page for the new ship? If so, the TBN variant may be redundant
  3. Both active Legends need significant work: videos, images, stories, structural fixes

---

## Phase 4: Auto-Resolving Issues

### 4A. Discoverability Warnings
- **27 ships** currently show `in_atlas_not_ready` (score < 90%)
- **2 ships** show `not_atlas_ready` (same root cause)
- **These resolve automatically** once the ship's score reaches 90%+
- After Phases 1–3, all ships should clear this threshold

---

## Implementation Order

| Step | What | Ships | Est. Effort | Blocked? |
|------|------|-------|-------------|----------|
| 1A | Merge duplicate class attrs | 31 | Medium (bulk regex) | No |
| 1B | Strip (V1.Beta) from titles | 31 | Low (bulk regex) | No |
| 1C | Remove V1.Beta badge | 31 | Low (bulk regex) | No |
| 1D | Remove SDG aria-hidden | 31 | Low (bulk edit) | No |
| 1E | Add noscript logbook fallback | 29 | Medium (template copy) | No |
| 1F | Add /planning.html to nav | 29 | Low (bulk edit) | No |
| 2A | Expand FAQ sections | 8 | Medium (per-ship content) | No |
| 2B | Remove brochure language | 4 | Low (4 word replacements) | No |
| 2C | Fix short ai-summary | 1 | Low | No |
| 2D | Fix short alt text | 1 | Low | No |
| ~~3A~~ | ~~Editorial ratings~~ | ~~293~~ | ~~Done~~ | ~~Resolved 2026-02-14~~ |
| 3B | Source missing videos | 15 | Medium–High (YouTube) | Ken approval |
| 3C | Write missing persona stories | 5 | High (creative writing) | Ken approval |
| 3D | Legend taxonomy | 3 | Low (classification) | **Ken decision** |

---

## What 100% Looks Like

After all phases, each active RCL ship page will have:
- 0 blocking errors
- 0 warnings
- Valid HTML (no duplicate class attrs, balanced tags)
- Clean title tags (no beta labels)
- Accessible SDG footer (no aria-hidden)
- Static logbook fallback for no-JS users
- Complete navigation (including /planning.html)
- Verified editorial ratings (or ratings removed)
- Complete video manifest (8 required categories)
- All required logbook personas covered
- FAQ sections at 200+ words
- No brochure language

---

## What I Will NOT Change

- Historic ships (sovereign, song-of-norway, etc.) — different validation rules
- TBN ships (future ships) — not in active fleet
- Non-ship pages (index.html, venues.html) — different page type
- Rating methodology — ratings removed 2026-02-14; may be re-added later with editorial basis
- Logbook story content — pastoral content follows LOGBOOK_ENTRY_STANDARDS_v2, Ken reviews

---

*Soli Deo Gloria — Measure twice, cut once.*
