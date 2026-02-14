# Ship Page Validation Audit — 2026-02-14

**Test Date:** 2026-02-14
**Command:** `node admin/validate-ship-page.js --all-ships`
**Status:** CRITICAL — 62.2% failure rate (196/315 pages failing)

---

## Summary

| Metric | Count | Percentage | Status |
|--------|-------|-----------|--------|
| Total ship pages | 315 | 100% | ℹ️ Includes variants/TBN |
| **Passed validation** | **119** | **37.8%** | ⚠️ Below target |
| **Failed validation** | **196** | **62.2%** | 🔴 CRITICAL |
| Total errors | 857 | — | 🔴 High error count |
| Total warnings | 2,182 | — | 🟡 Needs attention |

---

## Top 10 Issues (By Frequency)

| Rank | Issue | Count | Severity | Impact |
|------|-------|-------|----------|--------|
| 1 | `navigation/some_missing_nav` | 302 | 🔴 Critical | Navigation incomplete on 302 pages |
| 2 | `accessibility/sdg_aria_hidden` | 226 | 🔴 Critical | Soli Deo Gloria hidden from screen readers |
| 3 | `json_ld/generic_review_text` | 208 | 🟡 High | Template reviews instead of real editorial |
| 4 | `sections/missing_whimsical_units` | 206 | 🟡 High | Missing content section |
| 5 | `word_counts/faq_too_short` | 186 | 🟡 High | FAQ sections lack depth |
| 6 | `sections/missing_grid2_firstlook_dining` | 172 | 🟡 High | Layout structure missing |
| 7 | `images/few_images` | 137 | 🟡 Medium | Insufficient imagery |
| 8 | `discoverability/in_atlas_not_ready` | 113 | 🟡 Medium | Ships marked ready but failing validation |
| 9 | `logbook/missing_personas` | 85 | 🟡 Medium | Missing story personas |
| 10 | `videos/missing_categories` | 80 | 🟡 Medium | Video categories incomplete |

---

## Critical Issue Analysis

### Issue #1: Navigation Missing (302 pages)
**Problem:** Navigation items not fully present on 302 of 315 pages
**Cause:** Likely incomplete navigation rollout or missing nav items in HTML
**Impact:** Users cannot navigate from ship pages to other site sections
**Fix:** Add missing navigation items to all 302 affected pages

### Issue #2: Soli Deo Gloria aria-hidden (226 pages)
**Problem:** Theological invocation marked `aria-hidden="true"` on 226 pages
**Cause:** Accessibility override may have been applied too broadly
**Impact:** Screen reader users cannot "hear" the spiritual foundation
**Fix:** Remove `aria-hidden="true"` from SDG comment block (lines 1-9)

### Issue #3: Generic Review Text (208 pages)
**Problem:** JSON-LD review bodies use template text instead of real editorial content
**Examples:** "Generic/templated reviewBody detected", placeholder content
**Impact:** AI/search engines see un-personalized content
**Fix:** Replace template review text with real editorial assessments

### Issue #4: Missing Whimsical Units (206 pages)
**Problem:** "Whimsical Units" content section not present on 206 pages
**Cause:** Unknown — may be recent addition or optional section
**Impact:** Content completeness reduced
**Fix:** Add Whimsical Units section to all 206 affected pages

### Issue #5: FAQ Too Short (186 pages)
**Problem:** FAQ sections fail word count validation on 186 pages
**Minimum requirement:** Unknown (need to check validator)
**Impact:** FAQ may lack depth and detail
**Fix:** Expand FAQ sections to meet minimum word count

---

## Failed Ships by Cruise Line

**Note:** Validator shows line-by-line output; analyzing most recent Carnival results:

### Carnival Cruise Line (Sample from output)
| Ship | Status | Score | Errors | Warnings |
|------|--------|-------|--------|----------|
| carnival-tropicale | **FAIL** | 0 | 12 | 9 |
| carnival-mardi-gras | **FAIL** | 80 | 1 | 5 |
| carnival-jubilee | **FAIL** | 80 | 1 | 5 |
| carnival-festivale | **FAIL** | 44 | 4 | 8 |
| carnival-encounter | **FAIL** | 68 | 2 | 6 |
| carnival-celebration | **FAIL** | 78 | 1 | 6 |
| carnival-adventure | **FAIL** | 20 | 6 | 10 |

**Most critical:** carnival-adventure.html (only 20% valid, 6 errors)

---

## Required Actions (Priority Order)

### Priority 1: Critical Fixes (Must fix for all)
- [ ] Remove `aria-hidden="true"` from Soli Deo Gloria on 226 pages
- [ ] Add missing navigation items to 302 pages
- [ ] Fix generic review text on 208 pages

### Priority 2: High-Impact Fixes
- [ ] Add Whimsical Units section to 206 pages
- [ ] Expand FAQ sections on 186 pages
- [ ] Add missing grid2 layout on 172 pages

### Priority 3: Medium-Impact Fixes
- [ ] Add images to pages with few_images (137 pages)
- [ ] Fix atlas discoverability flags (113 pages)
- [ ] Add missing logbook personas (85 pages)
- [ ] Add missing video categories (80 pages)

---

## Proposed Fix Strategy

**Phase 1: Quick Wins (Critical fixes)**
1. Target all 226 pages with aria-hidden issue
2. Remove aria-hidden from SDG comment (1 char change per page)
3. Batch update with careful verification

**Phase 2: Navigation Audit**
1. Analyze why 302 pages missing navigation
2. Check if navigation template is correct
3. Identify which specific nav items are missing
4. Update affected pages

**Phase 3: Content Fixes**
1. Review text → replace with real editorial
2. FAQ expansion → add more Q&A
3. Whimsical Units → determine if section is required

**Phase 4: Media & Personas**
1. Add images (137 pages)
2. Add video categories (80 pages)
3. Add logbook personas (85 pages)

---

## Next Steps

1. ✅ Validation audit complete
2. ⏳ Run detailed fix assessment on top 3 issues
3. ⏳ Create targeted fixes for aria-hidden (226 pages)
4. ⏳ Create navigation audit
5. ⏳ Systematically bring all 196 failing pages to 100%

---

**Soli Deo Gloria**
