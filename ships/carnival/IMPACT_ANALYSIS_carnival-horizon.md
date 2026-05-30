# Impact Analysis — carnival-horizon.html
Generated: 2026-05-26 (Issue #1364)

## File Statistics
- **Lines before:** 1,123
- **Lines after:** 981
- **Net change:** -142 lines (-13%)
- **MD5 after:** 7a79cb3fea1413bd8b89a9c57fc4a982

## Change Impact Assessment

| # | Change | Impact | Risk | Verified |
|---|--------|--------|------|----------|
| 1 | Removed hardcoded stats grid (lines 371-411) | Medium | Low — JS `#ship-stats` div retained as correct mount point | ✅ |
| 2 | Removed duplicate photo attribution blocks (kept 1 of 3) | Low | None — pure duplication | ✅ |
| 3 | Removed duplicate video Swiper inits (kept strong `__swiperReady` version) | Medium | Low — kept gold standard pattern | ✅ |
| 4 | Updated ICP metadata to ICP-2 in `<head>` | Low | None — cosmetic/compliance | ✅ |
| 5 | Removed legacy ai-breadcrumbs comment | Low | None — cosmetic | ✅ |
| 6 | Added deck plans section with Carnival official link | Low | None — additive only | ✅ |
| 7 | Updated stale ICP-Lite comment in body to ICP-2 | Low | None — cosmetic/compliance | ✅ |
| 8 | Corrected inverted Swiper guard (`!window.__swiperReady`) | High | Low — matches gold standard; fixes potential mobile memory leak | ✅ |
| 9 | Removed orphaned video fetch block (duplicate of initVideos IIFE) | Medium | Low — `initVideos()` IIFE retained as proper handler | ✅ |

## Pre-Existing Issues (NOT Introduced by This PR)

These issues were present on `main` before this branch and are **out of scope for #1364**:

| Issue | Description | Tracking |
|-------|-------------|---------|
| Orphaned JS targets | `featuredVideos`, `videoFallback`, `vf-tracker-container`, `dining-content`, `logbook-stories` — JS references these IDs but they don't exist in HTML | Future issue |
| Wikimedia attributions (6 blocks) | Gold standard has fewer; some may still be redundant | Future audit |
| Missing alt text (1 image) | One image missing alt attribute | Future audit |

## Gold Standard Comparison (Icon of the Seas)

| Element | carnival-horizon | icon-of-the-seas | Match |
|---------|-----------------|-----------------|-------|
| Swiper inits | 3 | 3 | ✅ |
| stats-grid divs | 1 | 1 | ✅ |
| ICP version | ICP-2 (3×) | ICP-2 | ✅ |
| Swiper guard pattern | `!window.__swiperReady` | `!window.__swiperReady` | ✅ |
| Duplicate fetch() | none | none | ✅ |

## Integration Test Results
See: INTEGRATION_TEST_carnival-horizon.md

**Summary:** 14 PASS, 1 FAIL (pre-existing orphaned JS targets), 2 WARN

## Orchestra Review
Reviewed by GPT via triad mode. Verdict: WHEAT WITH REFINEMENT → all flagged issues addressed.

## Documentation Updates Required
- [ ] ICP-2 compliance log (record Carnival Horizon upgraded)
- [ ] unfinished_tasks.md (mark #1364 resolved)
