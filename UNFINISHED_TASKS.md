# Unfinished Tasks

**Purpose:** Active task queue. Only genuinely pending work lives here.
**Last Consolidated:** 2026-03-02 (full audit + merge of all task files)
**Maintained by:** Claude AI

> **Migration Note (2026-03-02):**
> This file was rebuilt by consolidating and deduplicating:
> - `UNFINISHED_TASKS.md` (root, 630 lines, dated 2026-02-22)
> - `admin/UNFINISHED-TASKS.md` (779 lines, dated 2026-01-24)
> - `UNFINISHED_TASKS_AUDIT_2025_11_24.md` (289 lines, dated 2025-11-24)
>
> **Where did things go?**
> - Completed items → `COMPLETED_TASKS.md` (appended under "March 2026 Migration")
> - In-progress items → `IN_PROGRESS_TASKS.md` (unchanged, already tracked there)
> - Stale files archived → `.claude/archive/`
> - Duplicates across competitor analysis sections → deduplicated here
>
> **Archives:**
> - `.claude/archive/UNFINISHED_TASKS_2026-02-08_pre-cleanup.md`
> - `.claude/archive/admin-UNFINISHED-TASKS_2026-01-24.md` (moved 2026-03-02)
> - `.claude/archive/UNFINISHED_TASKS_AUDIT_2025_11_24.md` (moved 2026-03-02)
> - Historical audits in `.claude/archive/`
> - Competitor analyses in `.claude/audits/`

---

## Codebase Status (verified 2026-03-02)

| Asset | Count |
|-------|-------|
| Port pages | 387 |
| Ship pages | 295 |
| Restaurant pages | 472 |
| Total HTML pages | 1,241 |
| WebP images | 4,486 |
| Logbook JSON files | 285 |
| Stateroom exception files | 270 |
| Cruise line directories | 16 |
| Inline style instances | ~15,626 |
| Files with `<style>` blocks | 9 |

---

## Cruise Line Parity Gaps

| Cruise Line | Ships | Restaurants | Gap |
|-------------|-------|-------------|-----|
| RCL | 50 | 280 | Baseline |
| NCL | 20 | 78 | Partial |
| Virgin | 4 | 46 | Good ratio |
| MSC | 24 | 45 | Partial |
| Carnival | 48 | 23 | Needs ~200+ |
| Celebrity | 29 | 0 | Missing |
| Holland America | 46 | 0 | Missing |
| Princess | 17 | 0 | Missing |
| + 7 more lines | 54 | 0 | Missing |

**Missing cruise lines entirely:** Viking Ocean (11 ships)
**Intentionally excluded:** Disney Cruise Line (owner decision — theological disagreement with Disney's "follow your heart" philosophy; Jeremiah 17:9)

---

## Task Lanes

| Lane | Meaning | Examples |
|------|---------|----------|
| Green | AI executes | CSS cleanup, schema fixes, pattern standardization |
| Yellow | AI proposes | Content changes, new pages, image updates |
| Red | Human writes | Pastoral articles, theological content |

---

## GREEN LANE — AI Executes Autonomously

### [G] CSS Consolidation — Inline Style Reduction
- [ ] Decide canonical `.page-grid` definition (styles.css vs inline)
- [ ] Remove redundant `.page-grid` from remaining `<style>` blocks
- [ ] Run replace to swap inline styles for class names
- [ ] Target: Reduce ~15,626 inline styles to <1,000

### [G] Ship Page Standardization (295 pages)
- [ ] Standardize carousel markup to `<figure>` pattern across all lines
- [ ] Align section order: First Look → Dining → Videos → Deck Plans/Tracker → FAQ
- [ ] Fix author avatar to circle (remove inline border-radius overrides)
- [ ] Uniform version badge
- [ ] Normalize hero sizing/positioning
- [ ] Add missing whimsical units containers (~206 ships)
- [ ] Add missing grid2 layout (~172 ships)

### [G] Ship Validation — Content-Dependent Remaining Work
**Current:** 157/295 passing (after Phases 1-5 structural fixes)
- [ ] Generic review text (208 ships) — needs editorial content per ship
- [ ] Few images (137 ships) — needs actual image files (23 ships need just 1 more)
- [ ] FAQ too short (186 ships) — needs content expansion
- [ ] Missing whimsical units (206 ships)
- [ ] Missing grid2 layout (172 ships)

### [G] Port Validation — Remaining Work
**Current:** 214/387 passing (55.3%)
- [ ] ~129 ports at score 0 (content skeletons) — need full content creation
- [ ] 3 ports image-blocked (santos, callao, catania) — need image files
- [ ] Trim FAQ answers to 80 words (~384 ports)
- [ ] Build POI manifests (365 ports have < 10 POIs)
- [ ] Clean promotional drift language (~200 ports)

### [G] Port Weather — Remaining Coverage
**Current:** ~300/387 ports have weather widgets
- [ ] Add weather section to remaining ~87 ports

### [G] Technical Tasks
- [ ] Verify WCAG 2.1 AA compliance across new pages
- [ ] Test keyboard navigation on dropdown menus
- [ ] Test screen reader compatibility
- [ ] Verify all images have proper alt text
- [ ] Run Google PageSpeed Insights on key pages
- [ ] Mobile browser testing at 360px, 375px, 390px, 412px, 768px (requires manual browser)

### [G] Ship Size Atlas — Remaining Items
- [ ] Add "Size Map" scatter chart view (GT vs Passengers)
- [ ] Add "Top 30 Largest Ships" spotlight module
- [ ] Add ship detail drawer/modal
- [ ] Implement data conflict display
- [ ] Create automated coverage report
- [ ] Add "last verified" date display per ship

### [G] Competitor Analysis Recommendations — Deduplicated
**Source:** Comprehensive audit (120+ competitors, 15 categories) — `.claude/audits/`

These items appeared across 7+ individual competitor analysis sections. Deduplicated here:

**Port page improvements:**
- [ ] Ensure dock locations clearly marked on all port maps
- [ ] Add dock location summary to port page intro
- [ ] Expand DIY vs. excursion comparisons from 30 to top 50 ports
- [ ] Expand "Real Talk" honest assessments to 75+ ports (currently 67)
- [ ] Include "Skip this port if..." honest guidance where appropriate
- [ ] Add "Best for / Not ideal for" profile guidance per port
- [ ] Evaluate PDF generation for top 20 ports

**Ship page improvements:**
- [ ] Ensure deck plan links are prominent on all ship pages
- [ ] Verify deck plan PDFs load correctly
- [ ] Add cabin size/amenity quick facts where missing
- [ ] Ensure refurbishment dates are current
- [ ] Add crew count and total deck count if missing
- [ ] Promote Stateroom Checker more prominently on ship pages
- [ ] Add "cabin location tips" section to ship pages

**Site-wide:**
- [ ] Add author expertise callouts ("Ken has visited this port X times")
- [ ] Test service worker caching for complete offline access
- [ ] Market PWA install as "your offline cruise companion"

### [G] Affiliate Link Infrastructure
**Phase 1 (Infrastructure) DONE. Remaining:**
- [ ] Update about-us.html disclosure with Amazon Associates participation
- [ ] Add affiliate article links to ~295 ship pages
- [ ] Add affiliate article links to ~387 port pages

### [G] Quiz Remaining Fixes
- [ ] iPhone scroll issue (dropdown has no max-height) — P1
- [ ] Back button restarts quiz (no history state) — P2
- [ ] Add null safety for lineData access
- [ ] Implement 10-ship limit (user request)
- [ ] Add Comparison Drawer from Ship Atlas
- [ ] Regional availability filter (auto-detect user region)
- [ ] Run edge case test personas

### [G] Data Quality
- [ ] 8 corrupted JSON files need manual review
- [ ] Verify quality of auto-generated seasonal data vs hand-curated
- [ ] Verify quality of auto-generated stateroom exception files vs manually audited

---

## YELLOW LANE — AI Proposes, Human Approves

### [Y] "What Can I Eat?" Dining Search Tool (NEW — 2026-02-22)
**Status:** Not started — design needed
**Priority:** P1 — new tool, high user value

- [ ] Audit `venues.json` for dish-level data availability
- [ ] Create `/assets/data/menu-search-index.json` (inverted index)
- [ ] Create `/assets/js/dining-search.js`
- [ ] Create `/tools/dining-search.html` (standalone page)
- [ ] Design ship page widget (compact embedded version)
- [ ] Implement autocomplete/suggestions for dish search
- [ ] Add to site navigation (Tools dropdown)
- [ ] Service worker caching for offline use

### [Y] Stateroom Checker — Embed on Ship Pages (NEW — 2026-02-22)
**Status:** Not started — design needed
**Priority:** P1 — leverages existing 270 exception files

- [ ] Extract core checker logic into reusable `/assets/js/stateroom-widget.js`
- [ ] Create ship page widget HTML template
- [ ] Lazy-load exception JSON only when widget activated
- [ ] Add widget section to ship page template
- [ ] Roll out to all 295 ship pages
- [ ] Audit which 25 ships lack exception files, create stubs
- [ ] Ensure offline/PWA support

### [Y] Alaska Cruise Port Gaps
**Status:** 7 of 12 "missing" ports now exist (built since audit)

**Still missing (5):**
- [ ] `dutch-harbor.html` — Aleutian Islands; Deadliest Catch fame
- [ ] `nome.html` — Bering Sea; Iditarod finish line
- [ ] `kake.html` — Tiny Tlingit village on Kupreanof Island
- [ ] `victoria.html` — Common PVSA stop on Seattle round-trips
- [ ] `prince-rupert.html` — Inside Passage to open gulf

### [Y] Image Tasks — Ships Needing FOM Photos
- [ ] Allure of the Seas
- [ ] Anthem of the Seas
- [ ] Icon of the Seas
- [ ] Independence of the Seas
- [ ] Navigator of the Seas
- [ ] Odyssey of the Seas
- [ ] Quantum of the Seas (has 7 FOM already, may need more)
- [ ] Spectrum of the Seas
- [ ] + additional ships across non-RCL lines

### [Y] DIY vs. Excursion Comparison Expansion
**Current:** 30 ports have comparisons
- [ ] Expand to top 50 ports
- [ ] Format: "Ship excursion: $X | DIY: $Y | You save: $Z"
- [ ] Add timing/transport/admission context

### [Y] Affiliate Content — Phase 2-3
**Phase 2 (New Content):**
- [ ] Write `/articles/cruise-duck-tradition.html`
- [ ] Write `/articles/cruise-cabin-organization.html`
- [ ] Write `/articles/cruise-photography-tech.html`

**Phase 3 (Enhance Existing):**
- [ ] Add affiliate links to `/packing-lists.html`
- [ ] Add tech recommendations to `/internet-at-sea.html`

### [Y] Carnival Fleet Index Enhancement
- [ ] (Future) CTA for booking

### [Y] ships.html Display Issues
- [ ] Class cards need images
- [ ] Cruise lines need images
- [ ] Individual ship images rendering issues

### [Y] SEO External Tools Setup
- [ ] Set up Google Search Console
- [ ] Set up Bing Webmaster Tools
- [ ] Set up Google Analytics dashboard

### [Y] Dining Hero Images
- [ ] 44 RCL ship dining hero images needed

### [Y] "Coming Soon" Pages
- [ ] ~50 pages still have placeholder "coming soon" text

---

## RED LANE — Human Decides

### [R] Articles to Write — Pastoral Content
- [ ] Healing Relationships at Sea (~3,000 words) — not created
- [ ] Rest for Wounded Healers (~2,500 words) — not created
- [ ] Expand or create comprehensive-solo-cruising.html

### [R] Additional Themed Articles
- [ ] Medical recovery articles (post-cancer, post-stroke, chronic illness)
- [ ] Mental health articles (anxiety, PTSD/veteran, bipolar/depression)
- [ ] Family situation articles (infertility grief, adoption, homeschool)
- [ ] Demographic articles (senior travel, neurodiversity, burn survivors)
- [ ] Life transition articles (retirement, second marriage, work-life balance)

---

## Uncategorized Pending Items

- [ ] User decision needed: deploy Amazon affiliate links or keep ad-free positioning?
- [ ] Standardize carousel markup to `<figure>` pattern across all lines
- [ ] `staleIfErrorTimestamped` strategy for FX API caching
- [ ] `warmCalculatorShell` predictive prefetch
- [ ] `FORCE_DATA_REFRESH` and `GET_CACHE_STATS` message handlers
- [ ] UI integration: "Refresh Rates" button, cache age display, toast notifications
- [ ] Header hero size inconsistent across hub pages
- [ ] Logo size standardization
- [ ] solo.html article loading (28 article references, uses fetch for fragments)
- [ ] index.html FAQ positioning

### Missing Port Pages (rare/exotic — low priority)
- [ ] astoria (Oregon)
- [ ] catalina-island (California) — verify if covered by los-angeles.html
- [ ] eden (Australia)
- [ ] port-vila (Vanuatu) — verify if covered by vanuatu.html
- [ ] rarotonga (Cook Islands)
- [ ] arica (Chile)
- [ ] coquimbo (Chile)
- [ ] abidjan (Ivory Coast)
- [ ] antsiranana (Madagascar)
- [ ] la-digue (Seychelles)
- [ ] luderitz (Namibia)
- [ ] mossel-bay (South Africa)
- [ ] aarhus (Denmark)
- [ ] haugesund (Norway)
- [ ] kristiansand (Norway)
- [ ] nuuk (Greenland)
- [ ] qaqortoq (Greenland)

### Missing Homeport Pages
- [ ] hp-norfolk
- [ ] hp-philadelphia
- [ ] hp-west-palm-beach
- [ ] hp-san-juan (have HTML, need tracker entry)
- [ ] hp-honolulu (have HTML, need tracker entry)
- [ ] hp-dover (London gateway)
- [ ] hp-hamburg
- [ ] hp-istanbul
- [ ] hp-le-havre (Paris gateway)
- [ ] hp-lisbon
- [ ] hp-livorno (Florence/Pisa gateway)
- [ ] hp-athens (Piraeus)
- [ ] hp-ravenna
- [ ] hp-trieste
- [ ] hp-dubai
- [ ] hp-mumbai

---

## Strategic "Don't Chase" List (Explicit Decisions)

| Feature | Why Not | Competitor Reference |
|---------|---------|---------------------|
| Port count arms race (1,200+) | Depth > breadth | WhatsInPort |
| Ship count arms race (976+) | Quality > quantity | CruiseMapper |
| Forums/user reviews | Dilutes trusted voice | Cruise Critic |
| Real-time ship tracking | Different product | CruiseMapper, VesselFinder |
| Native mobile app | PWA sufficient | ShipMate |
| Cruise booking/deals | Conflicts with ad-free | CruisePlum, CruiseWatch |
| News/trend coverage | Conflicts with calm authority | Cruise Hive, Cruise Radio |
| YouTube/TikTok | Personality medium | Emma Cruises |
| Profile-based voyage paths | Impossible at scale | AI chorus suggestion |

---

## Reference Documents

- `.claude/audits/competitor-*.md` — Competitor analyses
- `.claude/archive/` — Historical audit summaries
- `COMPLETED_TASKS.md` — Finished work archive
- `IN_PROGRESS_TASKS.md` — Currently active threads
- `CAREFUL.md` — Integrity guardrail
- `admin/claude/CLAUDE.md` — Complete project guide

---

*Soli Deo Gloria*
