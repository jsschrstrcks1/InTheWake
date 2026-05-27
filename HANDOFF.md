# Issue #1364 — Carnival Horizon Duplicate Sections
**Status:** COMPLETE — Ready for merge to main
**Branch:** `fix/1364-carnival-horizon`
**Last updated:** 2026-05-26

---

## What Was Done

### Root Cause
Carnival Horizon (`ships/carnival/carnival-horizon.html`) had 3+ duplicate sections introduced during a template refactor. Additionally, ICP metadata was outdated and JS guards were incorrectly written.

### Changes Made (10 commits, all verified)

| # | Change | Lines |
|---|--------|-------|
| 1 | Removed hardcoded stats grid duplicate | -41 |
| 2 | Removed duplicate photo attribution blocks (kept 1 of 3) | -17 |
| 3 | Removed duplicate video Swiper inits (kept `__swiperReady` version) | -7 |
| 4 | Updated ICP metadata to ICP-2 in `<head>` | 0 |
| 5 | Removed legacy ai-breadcrumbs comment | -15 |
| 6 | Added deck plans section with Carnival official link | +23 |
| 7 | Updated stale ICP-Lite comment in body | 0 |
| 8 | Corrected inverted Swiper guard (`!window.__swiperReady`) | 0 |
| 9 | Removed orphaned video fetch block | -8 |
| **Total** | | **-57 net** |

**Before:** 1,123 lines → **After:** 981 lines (-13%)

### Integration Test Results
- ✅ 14 PASS
- ❌ 1 FAIL (pre-existing orphaned JS targets — out of scope)
- ⚠️ 2 WARN (pre-existing)

### Orchestra Review
Reviewed via GPT triad mode. All flagged issues resolved.

---

## Pre-Existing Issues (Tracked, Not Fixed Here)

| Issue | Description |
|-------|-------------|
| Orphaned JS targets | `featuredVideos`, `videoFallback`, `vf-tracker-container`, `dining-content`, `logbook-stories` — JS targets that don't exist in HTML. Pre-existed this PR. |

---

## Tools Created (New Safeguards)

| Tool | Location | Purpose |
|------|----------|---------|
| `impact-analysis.py` | `tools/impact-analysis.py` | Generates impact analysis doc for any ship page |
| `integration-test.py` | `tools/integration-test.py` | BeautifulSoup-based integration tests |
| `deep-review-checklist.sh` | `tools/deep-review-checklist.sh` | Pre-commit checklist (duplicates, guards, ICP) |

---

## How to Resume

1. Review `ships/carnival/IMPACT_ANALYSIS_carnival-horizon.md`
2. Review `ships/carnival/INTEGRATION_TEST_carnival-horizon.md`
3. Merge `fix/1364-carnival-horizon` → `main`
4. Next: Fix pre-existing orphaned JS targets (new issue)
