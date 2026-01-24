# Unfinished Tasks Across All Ships

## Soli Deo Gloria

Last Updated: 2026-01-24

---

## Work From Previous Claude Threads (Discovered via Context Review)

This section tracks work that was started but not completed in previous conversation threads.

---

### 1. Ship Quiz V2 Expansion 🟡 READY FOR IMPLEMENTATION

**Plan File:** `.claude/plan-quiz-v2-expansion.md`
**Status:** Planning COMPLETE ✅ | Implementation PENDING ⏳

**What was completed:**
- All 4 cruise lines (RCL, Carnival, NCL, MSC) have complete class profiles and scoring weights
- UI design for pill selector, mobile hamburger menu
- "Why This Ship?" explainer design
- "You Might Also Like" section design
- Brand-aware color coding scheme
- URL sharing format
- Edge case test personas
- Food quality scoring system with CDC health modifiers

**What remains to do:**

| Task | Status |
|------|--------|
| Build `ships/allshipquiz.html` with pill selector UI | NOT STARTED |
| Create `assets/data/ship-quiz-data-v2.json` with all cruise line data | NOT STARTED |
| Implement brand-aware color coding | NOT STARTED |
| Implement "You Might Also Like" section | NOT STARTED |
| Implement "Why This Ship?" explainer | NOT STARTED |
| Implement mobile hamburger menu with escape rope | NOT STARTED |
| Implement lazy loading for performance | NOT STARTED |
| Populate all CDC scores in ship data | NOT STARTED |
| Verify ship page coverage (create stubs as needed) | NOT STARTED |
| Run edge case test personas | NOT STARTED |
| Soft launch to Facebook group | NOT STARTED |

---

### 2. Quiz Edge Cases & Critical Bugs 🔴 CRITICAL

**Plan File:** `.claude/plan-quiz-edge-cases-and-improvements.md`
**Status:** Analysis complete, CRITICAL BUGS unfixed

**CRITICAL BUG #1:** Only 4 lines scored in "All Lines" mode
- **Location:** `ships/allshipquiz.html:1589-1591`
- **Impact:** Despite UI showing 15 cruise lines, only RCL, Carnival, NCL, MSC are scored
- **Fix:** Change hardcoded array to `Object.keys(quizData.scoring_weights)`

**CRITICAL BUG #2:** "Also Like" section hardcoded to 4 lines
- **Location:** `ships/allshipquiz.html:1705`
- **Fix:** Use dynamic line list instead of hardcoded array

| Task | Status |
|------|--------|
| Fix linesToScore to include all 15 lines | NOT STARTED |
| Fix "Also Like" to show all other lines | NOT STARTED |
| Add null safety for lineData access | NOT STARTED |
| Implement 10-ship limit (user request) | NOT STARTED |
| Add Comparison Drawer from Ship Atlas | NOT STARTED |

---

### 3. Affiliate Link Deployment 🟡 DRAFT PLAN

**Plan File:** `.claude/plan-affiliate-deployment.md`
**Status:** Draft plan created 2026-01-18, NOT STARTED

**Key Decision Required:** Trust badge changes ("No affiliate links" → "Honest recommendations")

**Phase 1 (Infrastructure):**
| Task | Status |
|------|--------|
| Create `/affiliate-disclosure.html` | NOT STARTED |
| Update trust badges site-wide | NOT STARTED |
| Create CSS classes for affiliate links | NOT STARTED |

**Phase 2 (New Content):**
| Task | Status |
|------|--------|
| Write `/articles/cruise-duck-tradition.html` | NOT STARTED |
| Write `/articles/cruise-cabin-organization.html` | NOT STARTED |
| Write `/articles/cruise-photography-tech.html` | NOT STARTED |

**Phase 3 (Enhance Existing):**
| Task | Status |
|------|--------|
| Add affiliate links to `/packing-lists.html` | NOT STARTED |
| Add tech recommendations to `/internet-at-sea.html` | NOT STARTED |

**50+ products with affiliate links identified in plan file**

---

### 4. Port Weather Guide Feature 🟡 PLANNED

**Plan File:** `.claude/plan-port-weather-guide.md`
**Status:** Comprehensive planning complete, NO implementation started

**Architecture Decisions Made:**
- API: Open-Meteo (free, no API key required)
- Files: seasonal-guides.json, regional-climate-defaults.json
- Caching: 30-minute localStorage cache
- UI: Weather widget + 48-hour forecast + seasonal guide cards

| Task | Status |
|------|--------|
| Create `/assets/data/ports/seasonal-guides.json` | NOT STARTED |
| Create `/assets/data/ports/regional-climate-defaults.json` | NOT STARTED |
| Create `/assets/js/modules/weather.js` | NOT STARTED |
| Create `/assets/js/port-weather.js` | NOT STARTED |
| Modify `/assets/styles.css` for weather widgets | NOT STARTED |
| Add weather section to all 333 port pages | NOT STARTED |
| Create Tier 1 guides (~50 top ports) | NOT STARTED |

---

### 5. From Thread Audit (2025-11-19) — Remaining Items

**Source:** `admin/THREAD_AUDIT_2025_11_19.md`

**High Priority:**
| Task | Status |
|------|--------|
| 8 corrupted JSON files (manual review needed) | NOT STARTED |
| 401 missing alt attributes (accessibility) | PARTIAL (261 still failing validation) |
| 44 dining hero images (all RCL ships) | NOT STARTED |
| 12 Disney/MSC ship pages (broken links) | NOT STARTED |

**Medium Priority:**
| Task | Status |
|------|--------|
| 50 pages with "coming soon" text | NOT STARTED |
| Write "Rest & Recovery" article | NOT STARTED |
| Write "Family Challenges" article | NOT STARTED |
| Write "Healing Relationships" article | NOT STARTED |
| 2 historic logbooks (nordic-prince, sun-viking) | NOT STARTED |

---

## Homepage Improvement Initiative ✅ COMPLETE

**Context:** Analytics show heavy bounce rates from homepage and tool pages. ChatGPT audit identified missing intent-based navigation and tool prominence issues.
**Status:** ALL TASKS COMPLETE as of 2026-01-18

### Tasks (All Done)

| Task | Status | Priority |
|------|--------|----------|
| Add intent selector ("What are you planning?") | DONE | HIGH |
| Create Planning Tools row (Ship Quiz, Drink Calculator, Stateroom Check, Packing Lists) | DONE | HIGH |
| Reduce explore grid from 10 cards to 6 | DONE | MEDIUM |
| Update trust line (remove "no affiliate links" - Amazon affiliate coming) | DONE | HIGH |
| Add Related Resources to Drink Calculator | DONE | MEDIUM |
| Add Related Resources to Ship Quiz | DONE | MEDIUM |
| Add Related Resources to Stateroom Check | DONE | MEDIUM |
| Add Related Resources to Packing Lists | DONE | MEDIUM |
| Replace placeholder Key Facts with Site Highlights + Search | DONE | MEDIUM |
| Standardize trust badge site-wide (958 pages) | DONE | HIGH |

---

## Current Status

| Metric | Value |
|--------|-------|
| Total Ship Pages | 309 |
| Pages Passing Validation | 36 (12%) |
| Pages Failing Validation | 273 (88%) |
| Total Blocking Errors | 2,101 |
| Total Warnings | 2,399 |

---

## Top Priority Issues (Blocking Errors)

### 1. Images with Short Alt Text
- **Files Affected:** 261
- **Issue:** Alt text less than 20 characters
- **Fix:** Add descriptive alt text for accessibility
- **Example:** `alt="ship"` → `alt="Radiance of the Seas sailing through Tracy Arm Fjord in Alaska"`

### 2. Missing Logbook Personas
- **Files Affected:** 256
- **Issue:** Stories don't cover required persona types
- **Required Personas:**
  - solo
  - multi-generational / family
  - honeymoon / couple
  - elderly / retiree
  - widow / grief
  - accessible / special needs
- **Fix:** Write new stories for missing personas

### 3. FAQ Sections Too Short
- **Files Affected:** 255
- **Issue:** FAQ word count below 200 minimum
- **Fix:** Add more FAQ items with substantive answers

### 4. Logbook Stories Too Short
- **Files Affected:** 253
- **Issue:** Stories under 300 word minimum
- **Fix:** Expand stories with more detail, service recovery narrative

### 5. Navigation Items Missing
- **Files Affected:** 250
- **Issue:** Missing links from gold standard navigation
- **Commonly Missing:**
  - `/ships/quiz.html`
  - `/internet-at-sea.html`
- **Fix:** Update navigation section with missing links

### 6. Few Images (< 8)
- **Files Affected:** 236
- **Issue:** Ship pages need minimum 8 images
- **Fix:** Add locally-hosted images with proper alt text

### 7. Missing Whimsical Units Container
- **Files Affected:** 214
- **Issue:** Right rail missing `#whimsical-units-container`
- **Fix:** Add container div in aside section

### 8. Low Static Content
- **Files Affected:** 207
- **Issue:** Page word count below 500 minimum
- **Fix:** Expand content sections

### 9. Few Logbook Stories (< 10)
- **Files Affected:** 198
- **Issue:** Need minimum 10 stories per ship
- **Fix:** Write new stories covering all personas

### 10. Missing Video Categories
- **Files Affected:** 151
- **Issue:** Missing required video categories
- **Required Categories:**
  - ship walk through
  - top ten
  - suite
  - balcony
  - oceanview
  - interior
  - food
  - accessible
- **Fix:** Find and add YouTube videos for missing categories

---

## Ships Passing Validation (36 ships)

These ships meet all standards:

### Royal Caribbean (RCL)
1. radiance-of-the-seas
2. grandeur-of-the-seas
3. oasis-of-the-seas
4. allure-of-the-seas
5. harmony-of-the-seas
6. symphony-of-the-seas
7. wonder-of-the-seas
8. icon-of-the-seas
9. utopia-of-the-seas
10. quantum-of-the-seas
11. anthem-of-the-seas
12. ovation-of-the-seas
13. odyssey-of-the-seas
14. spectrum-of-the-seas
15. freedom-of-the-seas
16. liberty-of-the-seas
17. independence-of-the-seas
18. voyager-of-the-seas
19. explorer-of-the-seas
20. adventure-of-the-seas
21. navigator-of-the-seas
22. mariner-of-the-seas
23. brilliance-of-the-seas
24. serenade-of-the-seas
25. jewel-of-the-seas
26. vision-of-the-seas
27. rhapsody-of-the-seas
28. enchantment-of-the-seas

### Carnival
29. carnival-breeze
30. carnival-celebration
31. carnival-jubilee
32. carnival-mardi-gras
33. carnival-dream
34. carnival-magic
35. carnival-vista
36. carnival-horizon

---

## Ships Needing Work by Cruise Line

### Celebrity Cruises (20 ships - all failing)
- celebrity-apex
- celebrity-ascent
- celebrity-beyond
- celebrity-century (historic)
- celebrity-compass
- celebrity-constellation
- celebrity-eclipse
- celebrity-edge
- celebrity-equinox
- celebrity-flora
- celebrity-galaxy (historic)
- celebrity-infinity
- celebrity-mercury (historic)
- celebrity-millennium
- celebrity-reflection
- celebrity-silhouette
- celebrity-solstice
- celebrity-summit
- celebrity-xcel
- celebrity-xpedition

### Costa Cruises
- All ships need stories, videos, and content

### Cunard
- All ships need stories, videos, and content

### Explora Journeys
- All ships need stories, videos, and content

### Holland America Line
- All ships need stories, videos, and content

### MSC Cruises
- All ships need stories, videos, and content

### Norwegian Cruise Line
- All ships need stories, videos, and content

### Oceania Cruises
- All ships need stories, videos, and content

### Princess Cruises
- All ships need stories, videos, and content

### Regent Seven Seas
- All ships need stories, videos, and content

### Seabourn
- All ships need stories, videos, and content

### Silversea Cruises
- All ships need stories, videos, and content

### Virgin Voyages
- All ships need stories, videos, and content

---

## Content Priority Queue

### Priority 1: New Logbook Stories (198 files need more stories)

Write new stories following service recovery narrative:
1. Challenge/crisis point
2. Cruise line response
3. Positive resolution
4. Tearjerker/poignant moment

**NO PLAGIARISM** - Use review sites for inspiration only:
- VacationsToGo
- Viator
- Cruise Critic

### Priority 2: Expand Short Stories (253 files)

Stories under 300 words need expansion:
- Add more sensory details
- Expand the service recovery arc
- Include faith-scented moments
- Reference ship venues and features

### Priority 3: Add Missing Personas (256 files)

Each ship needs stories from:
- Solo travelers
- Families (multi-generational)
- Couples (honeymoon/anniversary)
- Elderly/retirees
- Widows/grief processing
- Accessibility needs

### Priority 4: Find and Add Videos (151 files)

Search YouTube for:
- Official ship tours
- Top 10 tips videos
- Suite cabin tours
- Balcony cabin tours
- Interior cabin tours
- Food/dining reviews
- Accessible cabin reviews

---

## Vanilla Stories Needing Updates 🔴 MASSIVE CONTENT DEBT

**Full Inventory:** `admin/VANILLA-STORIES.md`

Stories marked as "vanilla" are generic templates repeated across entire cruise lines. They need complete rewrites with:
- Ship-specific details
- Service recovery narrative
- Emotional moments
- Real passenger perspectives
- Internal links to ship features

### Scope of Problem

| Cruise Line | Ships | Stories Needed (10/ship) | Priority |
|-------------|-------|--------------------------|----------|
| Holland America | 46 | 460 | HIGH |
| MSC | 24 | 240 | HIGH |
| Norwegian | 20 | 200 | HIGH |
| Princess | 17 | 170 | HIGH |
| Silversea | 10 | 100 | MEDIUM |
| Costa | 9 | 90 | MEDIUM |
| Oceania | 8 | 80 | MEDIUM |
| Regent | 7 | 70 | MEDIUM |
| Seabourn | 6 | 60 | MEDIUM |
| Virgin Voyages | 4 | 40 | MEDIUM |
| Cunard | 4 | 40 | MEDIUM |
| Explora | 2 | 20 | LOW |
| **TOTAL** | **157** | **~1,570** | — |

### Cruise Lines with QUALITY Content (No Update Needed)
- **Royal Caribbean:** All 49 ships have authentic content ✅
- **Carnival:** All 37 ships have authentic content ✅

---

## Batch Processing Scripts

### Fix Stub Pages
```bash
node admin/batch-fix-stub-pages.js
```

### Fix Section Order
```bash
node admin/batch-fix-section-order.js
```

### Validate All Ships
```bash
node admin/validate-ship-page.js --all-ships
```

### Validate Specific Cruise Line
```bash
node admin/validate-ship-page.js ships/celebrity-cruises/*.html
```

---

## Progress Tracking

| Date | Passing | Failing | Errors | Warnings | Notes |
|------|---------|---------|--------|----------|-------|
| 2026-01-24 | 36 | 273 | 2,101 | 2,399 | Context review - unfinished tasks updated |
| 2026-01-03 | 36 | 273 | 2,101 | 2,399 | After validator fix + stub pages |
| 2025-12-27 | 9 | 300 | 2,488 | 2,500 | Before latest fixes |

---

## Master Priority Summary (All Threads)

### 🔴 CRITICAL (Fix First)
1. **Quiz Critical Bugs** — `linesToScore` and "Also Like" hardcoded to 4 lines (breaks 11 cruise lines)
2. **Ship Validation Crisis** — 273/309 ships failing (88%) with 2,101 blocking errors

### 🟡 HIGH PRIORITY (Ready for Implementation)
3. **Quiz V2 Expansion** — All planning complete, ready to build
4. **Affiliate Link Deployment** — Plan complete, decision needed on trust badge wording
5. **Port Weather Guide** — Planning complete, no blockers

### 🟠 MEDIUM PRIORITY (Content Debt)
6. **Vanilla Stories** — ~1,570 stories needed across 157 ships (12 cruise lines)
7. **Missing Articles** — Rest & Recovery, Family Challenges, Healing Relationships
8. **Historic Logbooks** — Nordic Prince, Sun Viking

### 🔵 LOW PRIORITY (Future Enhancement)
9. **Dining Hero Images** — 44 RCL ships
10. **Corrupted JSON Files** — 8 files need manual review
11. **Disney/MSC Broken Links** — 12 ship pages

---

## Plan Files Reference

| Feature | Plan File | Status |
|---------|-----------|--------|
| Ship Quiz V2 | `.claude/plan-quiz-v2-expansion.md` | Ready |
| Quiz Bug Fixes | `.claude/plan-quiz-edge-cases-and-improvements.md` | Bugs documented |
| Affiliate Links | `.claude/plan-affiliate-deployment.md` | Draft |
| Port Weather | `.claude/plan-port-weather-guide.md` | Ready |

---

*Soli Deo Gloria*
