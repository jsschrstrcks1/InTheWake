# Ship Page Validation Plan — 2026-02-12

**Source:** `validate-ship-page.sh` (v3.010.300, 107 checks) + `validate-ship-page.js` (batch)
**Branch:** `claude/review-docs-codebase-IJvuW`

---

## Current State

| Metric | Count |
|--------|-------|
| Total ship pages (incl. index/quiz/template) | 315 |
| Actual ship pages (excl. index/quiz/template) | 291 |
| Passing strict validator | 156 (49.5%) |
| Failing strict validator | 159 (50.5%) |
| Total errors | 840 |
| Total warnings | 2,274 |

### Image Health (Critical)

| Category | Count | % |
|----------|-------|---|
| Ships with NO unique photos (shared dining image only) | **157** | 54% |
| Ships with 1-3 unique images (below 4 minimum) | **44** | 15% |
| Ships with 4+ unique images (healthy) | **90** | 31% |
| Broken image references (file missing from disk) | **0** | 0% |

### Pass Rate by Cruise Line

| Cruise Line | Passing | Failing | Pass Rate |
|-------------|---------|---------|-----------|
| RCL | 39 | 12 | 76% |
| Holland America | 38 | 9 | 81% |
| Carnival | 33 | 16 | 67% |
| Norwegian | 20 | 1 | 95% |
| Princess | 14 | 4 | 78% |
| Celebrity | 11 | 19 | 37% |
| MSC | 1 | 24 | 4% |
| Silversea | 0 | 13 | 0% |
| Costa | 0 | 10 | 0% |
| Oceania | 0 | 9 | 0% |
| Seabourn | 0 | 8 | 0% |
| Regent | 0 | 8 | 0% |
| Explora | 0 | 7 | 0% |
| Cunard | 0 | 5 | 0% |
| Virgin | 0 | 5 | 0% |

---

## Top 10 Issues (from batch validator)

| Issue | Count | Type | Fixable? |
|-------|-------|------|----------|
| `navigation/some_missing_nav` | 304 | Warning | 🟢 Green (template update) |
| `word_counts/low_static_content` | 277 | Warning | 🟡 Yellow (content needed) |
| `viewport/grid_responsive` | 259 | Warning | 🟢 Green (CSS/markup) |
| `sections/missing_whimsical_units` | 206 | Warning | 🟢 Green (template section) |
| `word_counts/faq_too_short` | 202 | Warning | 🟡 Yellow (content needed) |
| `sections/missing_grid2_firstlook_dining` | 172 | Warning | 🟢 Green (markup pattern) |
| `images/few_images` | 137 | Warning | 🟡 Yellow (WikiMedia sourcing) |
| `discoverability/in_atlas_not_ready` | 89 | Warning | 🟢 Green (metadata) |
| `logbook/missing_personas` | 85 | Warning | 🟡 Yellow (story writing) |
| `icp_lite/ai_summary_short` | 78 | Warning | 🟢 Green (meta tag update) |

---

## Error Categories (from strict validator)

### 1. FALSE POSITIVE: `entity field is generic 'Ship'` (ALL ships)
- **Affects:** Every single ship page (291)
- **Reality:** The spec says `entity: Ship` is correct — the validator check is wrong
- **Fix:** Update validator, NOT the ship pages
- **Lane:** 🟢 Green

### 2. Missing Dining Section
- **Affects:** ~30-40 ships (Celebrity, HAL, some Carnival)
- **What:** These ships have no `dining` or `restaurants` section heading
- **Fix:** Add a Dining section linking to venue pages (where they exist) or a stub section
- **Lane:** 🟢 Green (structural markup) / 🟡 Yellow (if venue pages don't exist)

### 3. Missing FAQ Section
- **Affects:** ~30-40 ships (Celebrity, HAL, some Carnival)
- **What:** No FAQ or questions section in the page
- **Fix:** Add FAQPage schema-compatible FAQ sections
- **Lane:** 🟡 Yellow (content creation)

### 4. Missing Live Tracker Section
- **Affects:** ~80+ ships (most non-RCL lines: MSC, Norwegian, Silversea, Regent, Costa, etc.)
- **What:** No live tracking section with IMO-based vessel tracking
- **Fix:** Add tracker section with data-imo attribute (IMO numbers may need research)
- **Lane:** 🟢 Green (if IMO known) / 🟡 Yellow (if IMO needs research)

### 5. Missing Ship Images (The Real Gap)
- **Affects:** 157 ships have ZERO unique photos; 44 more have <4
- **What:** Pages show only the shared Cordelia dining image
- **Fix:** Source images from WikiMedia API, download locally, convert to WebP, add attribution
- **Priority:** HIGH — this is the most visible quality gap
- **Lane:** 🟡 Yellow (image sourcing requires review)

---

## Warnings Breakdown

### JS Module Warnings (~150 ships)
- Non-RCL ships use a different JavaScript loading pattern
- Validator expects RCL's module pattern; other lines use their own
- **Fix:** Either standardize JS modules or update validator
- **Lane:** 🟢 Green (if standardizing) — but HIGH risk of breaking pages

### BreadcrumbList Too Short (~200 ships)
- Most ships have 1-item breadcrumbs; validator wants 4
- **Fix:** Add proper breadcrumb chain: Home → Ships → [Line] → [Ship]
- **Lane:** 🟢 Green (template update)

### ARIA Missing (~150 ships)
- Missing `aria-live` regions, `role="banner"` on header
- **Fix:** Add accessibility attributes
- **Lane:** 🟢 Green (markup)

### Multiple H1 Tags (~60 ships)
- Celebrity, HAL pages have two H1 tags
- **Fix:** Demote second H1 to H2
- **Lane:** 🟢 Green (markup fix)

### No fetchpriority="high" (~50 ships)
- Hero images missing priority hint
- **Fix:** Add attribute to first/hero image
- **Lane:** 🟢 Green (single attribute)

---

## Recommended Priority Order

### Phase 1 — Validator Fix (Green, quick win)
1. Fix the `entity` field false positive in `validate-ship-page.sh`
2. Fix image path parsing bug (version strings, line breaks)
3. Re-run validation to get accurate error counts

### Phase 2 — Image Sourcing (Yellow, highest visual impact)
4. Source WikiMedia images for the 157 ships with zero unique photos
5. Priority order: active ships on major lines first (RCL, Carnival, Celebrity, Norwegian)
6. Skip TBN/historic ships (lower priority)
7. Download, convert to WebP, add attribution CSV entries

### Phase 3 — Structural Fixes (Green, batch-able)
8. Add missing Dining sections (link to venue pages where they exist)
9. Add missing Live Tracker sections (with IMO lookup)
10. Fix BreadcrumbList to 4-item chain
11. Fix multiple H1 tags
12. Add `fetchpriority="high"` to hero images
13. Add ARIA live regions

### Phase 4 — Content Enrichment (Yellow, per-ship work)
14. Add FAQ sections to ships missing them
15. Expand short ai-summary meta tags
16. Address low static content word counts

### Phase 5 — JS Module Standardization (Green, but risky)
17. Evaluate whether to standardize non-RCL JS patterns to match RCL
18. High regression risk — needs careful testing

---

## Scope Estimates

| Phase | Files | Effort | Lane |
|-------|-------|--------|------|
| Phase 1 (Validator) | 1-2 scripts | Small | 🟢 |
| Phase 2 (Images) | 157+ ships | **Large** | 🟡 |
| Phase 3 (Structural) | ~150 ships | Medium | 🟢 |
| Phase 4 (Content) | ~100 ships | Medium-Large | 🟡 |
| Phase 5 (JS) | ~150 ships | Large, risky | 🟢⚠️ |

---

*Soli Deo Gloria*
