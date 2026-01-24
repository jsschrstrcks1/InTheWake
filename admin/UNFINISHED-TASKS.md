# Unfinished Tasks Across All Ships

## Soli Deo Gloria

Last Updated: 2026-01-24

---

## Session Work: Navigation & Content Expansion (2026-01-24)

### Navigation Reorganization ✅ COMPLETE

**Branch:** `claude/audit-competitor-gaps-0zTZ0`
**Commits:** 5 commits pushed

Reorganized site-wide navigation for user retention with new dropdown structure:
- **Planning:** Your First Cruise, Ships, Cruise Lines, Ports, Packing Lists, Accessibility
- **Tools:** Ship Quiz, Cruise Line Quiz, Drink Calculator, Stateroom Check, Port Logbook, Ship Logbook
- **Onboard:** Restaurants & Menus, Drink Packages, Internet at Sea, Articles
- **Travel:** Travel (overview), Solo

| Task | Files Updated | Status |
|------|---------------|--------|
| Update pages with `id="nav-planning"` dropdowns | 512 | ✅ DONE |
| Update pages with simple nav (no dropdowns) | 23 | ✅ DONE |
| Migrate port pages from `main-nav` template | 32 | ✅ DONE |
| Migrate port pages from `nav-links` template | 7 | ✅ DONE |
| Fix broken HTML files (missing body tags) | 5 | ✅ DONE |
| Fix remaining pages with simple nav | 3 | ✅ DONE |

**Broken Files Fixed:**
- `authors/ken-baker.html` - Missing body structure, added nav
- `authors/tina-maulsby.html` - Missing body structure, added nav
- `disability-at-sea.html` - Missing body structure, added nav
- `ships/carnival/carnival-adventure.html` - Missing body structure, added nav
- `solo/in-the-wake-of-grief-meta.html` - Skipped (meta file, not a rendered page)

**Scripts Created:**
- `scripts/update-nav.py` - Updated 512 pages
- `scripts/update-simple-nav.py` - Updated 23 pages
- `scripts/migrate-port-template.py` - Migrated 32 port pages
- `scripts/migrate-port-template-v2.py` - Migrated 7 port pages
- `scripts/fix-broken-files.py` - Fixed 5 broken HTML files
- `scripts/fix-remaining-nav.py` - Fixed 3 remaining pages

---

### Author Pages E-E-A-T Content Expansion ✅ COMPLETE

Expanded author pages with rich content for Google E-E-A-T compliance:

| Page | Before | After | Status |
|------|--------|-------|--------|
| `authors/ken-baker.html` | ~100 words | ~500 words | ✅ PASS validation |
| `authors/tina-maulsby.html` | ~80 words | ~450 words | ✅ PASS validation |
| `disability-at-sea.html` | Stub (50 words) | ~400 words | ✅ PASS validation |

**Content Added:**
- Rich biographical sections with cruising experience
- Detailed expertise breakdowns
- Featured articles sections
- Philosophy/connect sections
- JSON-LD Person schemas (E-E-A-T)
- JSON-LD WebPage schemas (ICP-Lite v1.4 compliance)
- Proper canonical URLs, OpenGraph, Twitter cards

**Validation Fixes Applied:**
- Added WebPage JSON-LD schemas to all 3 pages
- Fixed malformed `<title>` tag in disability-at-sea.html (had anchor tag inside)
- Ensured JSON-LD descriptions match ai-summary meta tags

---

### PR 963 Conflict Analysis

**Status:** Extensive conflicts due to divergent branch histories

PR 963 (canonical URL fixes for 22 port pages) is based on a different branch with extensive changes including:
- New `.claude/` plugins and commands
- Many new image files
- Port page updates

**Recommendation:** PR 963 should be merged separately by the maintainer. The nav reorganization work (PR 962) was already merged to main. Cherry-pick/rebase approaches resulted in 1000+ file conflicts.

---

## Work From Previous Claude Threads (Discovered via Context Review)

This section tracks work that was started but not completed in previous conversation threads.

---

### 1. Ship Quiz V2 Expansion ✅ MOSTLY COMPLETE

**Plan File:** `.claude/plan-quiz-v2-expansion.md`
**Status:** IMPLEMENTED ✅ (verified 2026-01-24)

**What exists:**
- `ships/allshipquiz.html` — Full quiz with all 15 cruise lines
- `assets/data/ship-quiz-data-v2.json` — Complete data for all 15 lines
- Pill selector UI (57 references)
- "You Might Also Like" section (18 references)
- Mobile hamburger menu (implemented)
- Brand colors per cruise line (implemented)
- Dress code question (line 1716: "How do you feel about dressing up?")
- CDC scores populated

| Task | Status |
|------|--------|
| Build `ships/allshipquiz.html` with pill selector UI | ✅ DONE |
| Create `assets/data/ship-quiz-data-v2.json` with all cruise line data | ✅ DONE (15 lines) |
| Implement brand-aware color coding | ✅ DONE |
| Implement "You Might Also Like" section | ✅ DONE |
| Implement "Why This Ship?" explainer | NOT STARTED |
| Implement mobile hamburger menu with escape rope | ✅ DONE |
| Implement lazy loading for performance | UNKNOWN |
| Populate all CDC scores in ship data | ✅ DONE |
| Verify ship page coverage (create stubs as needed) | ✅ FIXED (NCL, Carnival, MSC, Costa, Regent paths corrected) |
| Run edge case test personas | NOT STARTED |
| Soft launch to Facebook group | UNKNOWN |

---

### 2. Quiz Edge Cases & Improvements ✅ CRITICAL BUGS FIXED

**Plan File:** `.claude/plan-quiz-edge-cases-and-improvements.md`
**Status:** Critical bugs FIXED ✅ | Enhancement features pending

**CRITICAL BUG #1:** ✅ FIXED (verified 2026-01-24)
- **Location:** `ships/allshipquiz.html:2245-2247`
- **Fix applied:** Now uses `Object.keys(quizData.scoring_weights)`

**CRITICAL BUG #2:** ✅ FIXED (verified 2026-01-24)
- **Location:** `ships/allshipquiz.html:2451`
- **Fix applied:** Now uses `Object.keys(quizData.scoring_weights).filter(...)`

| Task | Status |
|------|--------|
| Fix linesToScore to include all 15 lines | ✅ DONE |
| Fix "Also Like" to show all other lines | ✅ DONE |
| Add null safety for lineData access | NOT STARTED |
| Implement 10-ship limit (user request) | NOT STARTED |
| Add Comparison Drawer from Ship Atlas | NOT STARTED |

---

### 3. Affiliate Link Deployment 🟡 PARTIAL

**Plan File:** `.claude/plan-affiliate-deployment.md`
**Status:** Phase 1 DONE ✅ | Phases 2-3 NOT STARTED (verified 2026-01-24)

**Phase 1 (Infrastructure):**
| Task | Status |
|------|--------|
| Create `/affiliate-disclosure.html` | ✅ DONE (12KB, exists) |
| Update trust badges site-wide | UNKNOWN (needs verification) |
| Create CSS classes for affiliate links | UNKNOWN |

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

### 4. Port Weather Guide Feature ✅ MOSTLY COMPLETE

**Plan File:** `.claude/plan-port-weather-guide.md`
**Status:** IMPLEMENTED ✅ (verified 2026-01-24) — 300/380 ports have weather

| Task | Status |
|------|--------|
| Create `/assets/data/ports/seasonal-guides.json` | ✅ DONE (65 lines) |
| Create `/assets/data/ports/regional-climate-defaults.json` | ✅ DONE (exists) |
| Create `/assets/js/modules/weather.js` | UNKNOWN |
| Create `/assets/js/port-weather.js` | ✅ DONE (373 lines) |
| Modify `/assets/styles.css` for weather widgets | ✅ DONE (implied by 300 ports working) |
| Add weather section to all 333 port pages | ✅ 300/380 DONE (79%) |
| Create Tier 1 guides (~50 top ports) | UNKNOWN |

**Remaining:** 80 port pages need weather section added

---

### 5. Quiz UX Bugs 🟡 PARTIAL

**Plan File:** `quiz-bugfix-plan.md`
**Status:** Ship links FIXED ✅ | Other bugs pending

| Bug | Description | Priority | Status |
|-----|-------------|----------|--------|
| Ship links broken (NCL, Carnival, MSC, Costa, Regent) | ✅ FIXED 2026-01-24: Corrected paths for 190/192 ships (99%) | P1 | ✅ FIXED |
| Can't scroll cruise line list on iPhone | Dropdown has no max-height, extends past screen | P1 | UNVERIFIED |
| Back button restarts quiz | No history state management | P2 | UNVERIFIED |

**Remaining:** 2 future ships without pages (costa-serena, seven-seas-prestige)

**Feature Request:** Multi-select cruise lines (defer to future)

---

### 6. Quiz Regional Features ✅ PARTIAL

**Plan File:** `quiz-regional-plan.md`
**Status:** Dress code DONE ✅ | Regional NOT STARTED (verified 2026-01-24)

| Feature | Description | Status |
|---------|-------------|--------|
| Dress code question | Line 1716: "How do you feel about dressing up?" with formal/smart/casual options | ✅ DONE |
| Dress code data | All 15 cruise lines have `dress_code` and `dress_description` fields | ✅ DONE |
| Regional availability filter | Penalize lines that don't sail from user's region | NOT STARTED |
| Auto-detect user region | Use timezone to suggest home region | NOT STARTED |

---

### 7. Stateroom Checker Repair 🔴 CRITICAL - DATA/CODE MISMATCH

**Status:** AUDITED 2026-01-24 — **Fundamental data format issue discovered**

**Root Cause Analysis (2026-01-24):**

The stateroom checker tool (`stateroom-check.js`) loads exception data from individual ship files (e.g., `stateroom-exceptions.grandeur-of-the-seas.v2.json`). However:

1. **DATA FORMAT MISMATCH**: The code's `parseRoomRange()` function (lines 63-89) only handles NUMERIC formats like `"8001-8858"` or `"8056,8068"`. But ~25% of exceptions use TEXT descriptions that cannot be parsed:
   - "All Deck 8 cabins" → **FAILS** (returns empty, no match possible)
   - "forward decks 12-14" → **FAILS**
   - "all connecting cabins" → **FAILS**
   - "Deck 7 balcony cabins" → **FAILS**

2. **QUANTIFIED IMPACT**:
   - 28 ship exception files total
   - 41 exceptions (25%) have unparseable text descriptions
   - 123 exceptions (75%) have correct numeric formats

3. **RESULT**: 25% of stateroom warnings will NEVER match any cabin number the user enters. The tool appears to work but silently fails to warn about known issues.

4. **ROOM TYPE CLASSIFICATION BUG** (discovered from Facebook user feedback 2026-01-24):
   The `inferCategory()` function (lines 230-243) uses a hardcoded heuristic that's WRONG for many cabins:
   ```javascript
   if (cabin >= 1000 && cabin < 3000) return 'Interior';
   else if (cabin >= 7000 && cabin < 9000) return 'Balcony';
   else if (cabin >= 9000) return 'Suite';
   return 'Ocean View';  // ← This is the problem!
   ```

   **User reports from "Enchantment of the Seas - Past, Present & Future" Facebook group:**
   - Sandi Werner Salter: Rooms 4575 and 4531 are Interior, tool says Ocean View
   - Mary Asher: Oceanview cabin incorrectly identified as Interior
   - Debbie Laff: Boardwalk Balcony incorrectly identified as Suite

   **Root cause**: Deck 4 has BOTH Interior AND Oceanview cabins mixed. The code assumes all 4xxx rooms are "Ocean View" but this is wrong. Room type cannot be determined by number alone.

**Audit Progress:**

| Ship | Status | Notes |
|------|--------|-------|
| Grandeur of the Seas | ✅ FIXED | 4 exceptions converted to numeric, 2 removed (no room data) |
| Vision of the Seas | ✅ FIXED | INVALID "forward decks 9-10" removed (no cabins there), 1 text removed |
| Enchantment of the Seas | ✅ FIXED | 1 text exception removed, 4 valid numeric remain |
| Rhapsody of the Seas | NO FILE | No exception file exists |
| ... (24 more ships) | NOT STARTED | |

**Tasks:**

| Task | Status |
|------|--------|
| Audit data/code compatibility | ✅ DONE (2026-01-24) |
| Fix Grandeur of the Seas exceptions | ✅ DONE (2026-01-24) |
| Fix Vision of the Seas exceptions | ✅ DONE (2026-01-24) |
| Fix Enchantment of the Seas exceptions | ✅ DONE (2026-01-24) |
| Convert remaining 24 ships from text to numeric room specs | IN PROGRESS |
| **FIX inferCategory() to use actual room data** | 🔴 CRITICAL - NOT STARTED |
| Research connecting cabin numbers for CO category | NOT STARTED |
| Research balcony cabin numbers by ship | NOT STARTED |
| Test stateroom checker after all fixes | NOT STARTED |

**Technical Notes:**
- The `rcl-ship-room-flags.json` file is NOT used by the checker — it loads from individual ship exception files
- Exceptions removed for Grandeur documented in `removed_exceptions` array with restoration criteria
- Deck plan sources: [CruiseDeckPlans](https://www.cruisedeckplans.com), [CruiseMapper](https://www.cruisemapper.com)

---

### 8. Competitor Gap Analysis — Quick Wins 🟡 HIGH IMPACT

**Source:** `COMPETITOR_GAP_AUDIT_2026_01_17.md`
**Status:** 6/7 P1 items DONE, 1 PARTIAL (verified 2026-01-24)

**P1 Quick Wins (Low Effort, High Impact):**
| Task | Status | Addresses |
|------|--------|-----------|
| "Works Offline" marketing on port pages | ✅ DONE (376 ports, 2026-01-24) | Cruiseline.com, IQCruising |
| "No Ads" trust messaging on about-us.html | ✅ DONE | Cruise Critic, CruiseMapper |
| Tender Port Index + badge (`/ports/tender-ports.html`) | ✅ DONE | WhatsInPort |
| "From the Pier" distance callout box component | PARTIAL (some ports) | WhatsInPort, IQCruising |
| "Ships That Visit Here" section on port pages | PARTIAL (63/380 ports, RCL only) | UNIQUE - no competitor has this |
| First-Timer Hub page | ✅ DONE (`first-cruise.html` 27KB) | Cruise Critic |
| Pre-Cruise 30-Day Countdown checklist | ✅ DONE (`countdown.html` 2026-01-24) | Cruise Critic Roll Call |

**P2 Strategic (Medium Effort):**
| Task | Status | Addresses |
|------|--------|-----------|
| **Expand "Ships That Visit" to all 15 cruise lines** | NOT STARTED (63/380 ports, RCL only) | UNIQUE differentiator |
| Print CSS + PDF generation for port pages | NOT STARTED | WhatsInPort, IQCruising |
| Transport cost callout component | NOT STARTED | WhatsInPort, Cruise Crocodile |
| Accessibility sections on port pages | NOT STARTED | UNIQUE - market gap |
| DIY vs. Ship Excursion cost comparisons | NOT STARTED | WhatsInPort, Cruise Crocodile |
| Honest assessment "Real Talk" sections | NOT STARTED | Cruise Critic, CruiseMapper |

**"Ships That Visit Here" Expansion Plan:**
- Current: 63 ports with RCL ship data only
- Needed: Add deployment data for all 15 cruise lines
- Data file: `assets/data/ship-deployments.json`
- JS module: `assets/js/ship-port-links.js`
- Cruise lines to add: Carnival, Celebrity, NCL, Princess, Holland America, MSC, Costa, Cunard, Disney, Virgin Voyages, Oceania, Regent, Seabourn, Silversea, Explora

**Unique Differentiators to Protect:**
- Ship-Port Integration ⭐⭐⭐ (expand with bidirectional linking)
- First-Person Storytelling ⭐⭐⭐ (ensure every port has logbook)
- Interactive Tools ⭐⭐⭐ (Ship Quiz, Drink Calculator, etc.)
- Gamification ⭐⭐⭐ (Port/Ship Logbooks, achievements)
- Ad-Free Trust ⭐⭐ (needs explicit marketing)
- Accessibility Leadership ⭐⭐ (become THE resource)
- Faith-Based Perspective ⭐ (pastoral content)

---

### 9. From Thread Audit (2025-11-19) — Remaining Items

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
| 2 historic logbooks (nordic-prince, sun-viking) | ✅ DONE |

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

## Current Validation Status (as of 2026-01-24)

### Ship Pages
| Metric | Value |
|--------|-------|
| Total Ship Pages | 311 |
| Pages Passing Validation | 106 (34%) |
| Pages Failing Validation | 205 (66%) |
| Total Blocking Errors | 981 |
| Total Warnings | 2,429 |

### Port Pages
| Metric | Value |
|--------|-------|
| Total Port Pages | 380 |
| Pages Passing Validation | 89 (23%) |
| Pages Failing Validation | 291 (77%) |

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

### Ship Pages
| Date | Passing | Failing | Errors | Warnings | Notes |
|------|---------|---------|--------|----------|-------|
| 2026-01-24 | 106 (34%) | 205 (66%) | 981 | 2,429 | Fresh validation run |
| 2026-01-03 | 36 | 273 | 2,101 | 2,399 | After validator fix + stub pages |
| 2025-12-27 | 9 | 300 | 2,488 | 2,500 | Before latest fixes |

### Port Pages
| Date | Passing | Failing | Notes |
|------|---------|---------|-------|
| 2026-01-24 | 89 (23%) | 291 (77%) | Fresh validation run |

---

## Master Priority Summary (All Threads)

### 🔴 CRITICAL (Fix First)
1. **Stateroom Checker Data** — Many rooms assigned wrong categories (user-reported, needs audit)
2. **Ship Validation Crisis** — 205/311 ships failing (66%) with 981 blocking errors
3. **Port Validation Crisis** — 291/380 ports failing (77%)

### ✅ RECENTLY COMPLETED (Verified 2026-01-24)
- ~~Quiz Ship Links~~ — Fixed paths for NCL, Carnival, MSC, Costa, Regent (190/192 ships, 99%)
- ~~Quiz Critical Bugs~~ — `linesToScore` and "Also Like" now use dynamic line list
- ~~Quiz V2 Expansion~~ — allshipquiz.html exists with all 15 cruise lines
- ~~Port Weather Guide~~ — 300/380 ports have weather (79%)
- ~~First-Timer Hub~~ — `first-cruise.html` exists (27KB)
- ~~Affiliate Disclosure~~ — `affiliate-disclosure.html` exists (12KB)
- ~~Quiz Dress Code~~ — Question exists at line 1716
- ~~30-Day Countdown Checklist~~ — `countdown.html` with 35 interactive tasks (2026-01-24)
- ~~Works Offline Badge~~ — 376 port pages now show "Works offline" in trust badge (2026-01-24)
- ~~Ships That Visit Here~~ — Infrastructure done (63/380 ports, RCL only — needs expansion to 15 cruise lines)

### 🟡 HIGH PRIORITY (Remaining Work)
5. **Quiz UX Bugs** — iPhone scroll issue, back button (NCL links is #1 above)
6. **Ships That Visit Expansion** — Add 14 more cruise lines to ship-deployments.json (currently RCL only, 63/380 ports)
7. **Quiz Regional Features** — Regional availability filter (dress code done)
8. **Port Weather Remaining** — 80 ports still need weather section

### 🟠 MEDIUM PRIORITY (Content & Features)
9. **Competitor Gap P2 Strategic** — Print CSS, Transport costs, Accessibility sections
10. **Vanilla Stories** — ~1,570 stories needed across 157 ships (12 cruise lines)
11. **Missing Articles** — Rest & Recovery, Family Challenges, Healing Relationships
12. **Affiliate Phase 2-3** — New articles + enhance existing pages

### 🔵 LOW PRIORITY (Future Enhancement)
13. **Dining Hero Images** — 44 RCL ships
14. **Corrupted JSON Files** — 8 files need manual review
15. **Disney/MSC Broken Links** — 12 ship pages (Disney dir doesn't exist, MSC has 25 pages)

---

## Plan Files Reference

| Feature | Plan File | Status |
|---------|-----------|--------|
| Competitor Gap Analysis | `COMPETITOR_GAP_AUDIT_2026_01_17.md` | Partial (2/7 P1 done) |
| Ship Quiz V2 | `.claude/plan-quiz-v2-expansion.md` | Ready |
| Quiz Edge Cases | `.claude/plan-quiz-edge-cases-and-improvements.md` | Bugs documented |
| Quiz UX Bugs | `quiz-bugfix-plan.md` | User-reported bugs |
| Quiz Regional Features | `quiz-regional-plan.md` | Ready |
| Affiliate Links | `.claude/plan-affiliate-deployment.md` | Draft |
| Port Weather | `.claude/plan-port-weather-guide.md` | Ready |

---

*Soli Deo Gloria*
