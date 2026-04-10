# Unfinished Tasks

**Purpose:** Active task queue. Only genuinely pending work lives here.
**Last Consolidated:** 2026-03-02 (full audit + merge of all task files)
**Last Verified:** 2026-03-02 (deep filesystem audit — all counts verified against actual repo)
**Maintained by:** Claude AI

> **Migration Note (2026-03-02):**
> This file was rebuilt by consolidating and deduplicating:
> - `UNFINISHED_TASKS.md` (root, 630 lines, dated 2026-02-22)
> - `admin/UNFINISHED-TASKS.md` (779 lines, dated 2026-01-24)
> - `UNFINISHED_TASKS_AUDIT_2025_11_24.md` (289 lines, dated 2025-11-24)
>
> **Where did things go?**
> - Completed items → `admin/COMPLETED_TASKS.md` (appended under "March 2026 Migration")
> - In-progress items → `admin/IN_PROGRESS_TASKS.md` (unchanged, already tracked there)
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

## Google Search Console Audit (2026-03-27)

**Source:** GSC data pulled 2026-03-23
**Session:** claude/explore-repos-docs-YYFnR

### Issues Found & Actions Taken

| GSC Issue | Count | Root Cause | Action | Status |
|-----------|-------|------------|--------|--------|
| Crawled, not indexed | 369 | Thin content (Gen1 restaurant stubs, incomplete port pages) | See content quality plan below | Documented |
| Page with redirect | 365 | 42 .htaccess rules catching old URLs (Carnival paths, renames, phantoms) | Audited — no chains, working as designed | DONE |
| Not found (404) | 193 | 77 pages missing from sitemap; phantom URLs from URL restructuring | Added 77 entries to sitemap.xml (1,150 → 1,227) | DONE |
| Blocked by robots.txt | 111 | Intentional: /assets/, /images/, /js/, /css/, /data/, *.json | Correct — no action needed | DONE |
| Alternate canonical | 25 | Normal duplicate handling | No action needed | DONE |
| Noindex tag | 2 | Redirect stubs (drinks.html, packing.html) | Working as designed | DONE |
| Redirect error | 1 | Unknown specific URL — no chains found in .htaccess audit | Monitor | DONE |
| Duplicate without canonical | 1 | Unknown specific URL | Needs GSC URL inspection | Pending |

### Sitemap Update (DONE — 2026-03-27)

Added 77 missing URLs to sitemap.xml:
- **7 Alaska port pages:** college-fjord, homer, kodiak, misty-fjords, petersburg, valdez, wrangell
- **23 Carnival restaurant pages:** alchemy-bar through the-deli
- **45 MSC restaurant pages:** atelier-bistrot through zanzibar-buffet
- **2 tool pages:** cruise-budget-calculator, port-day-planner

Updated robots.txt comments with accurate counts (387 ports, 295 ships, 472 restaurants, 1,227 sitemap URLs).

### Crawled-Not-Indexed: Content Quality Plan

The 369 "crawled, not indexed" pages are primarily thin content that Google deprioritizes:

| Category | Est. Count | Problem | Lane |
|----------|-----------|---------|------|
| Gen1 restaurant stubs | ~200+ | "Varies by venue" pricing (187), "coming soon" (18), generic reviews | Yellow |
| Incomplete port pages | ~45 Tier 3 | Template filler removed but real content not yet written | Green/Yellow |
| Redirect stubs | 5 | drinks.html, packing.html, falmouth-jamaica, beijing, kyoto | Done (noindex) |
| Misc thin pages | ~10-20 | Various | TBD |

**Priority actions for crawled-not-indexed:**
1. [ ] Continue Tier 3 port content repair (45 ports in queue below)
2. [ ] Upgrade Gen1 restaurant pages — replace "Varies by venue" with real pricing (187 pages)
3. [ ] Remove "coming soon" placeholder text from 18 restaurant pages
4. [ ] Replace generic "Guest Experience Summary" with authentic reviews on Gen1 pages

**Solo articles — potential indexing opportunity (flagged for review):**
7 articles in `/solo/articles/` are blocked by robots.txt as "fragments" but 3 are full-length pages:
- `accessible-cruising.html` (44 KB)
- `in-the-wake-of-grief.html` (33 KB)
- `visiting-the-united-states-before-your-cruise.html` (32 KB)

**Decision needed:** Are these fragments loaded into solo.html, or standalone pages that should be indexed? If standalone, they should be unblocked in robots.txt and added to sitemap.

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

## Port Content Repair Queue (Session 12 — 2026-03-02)

**Context:** Session 12 identified 88 ports that contained identical template filler inserted by batch scripts. Template filler was removed and the validator was updated with a `template_filler_detected` BLOCKING check. These 77 ports now need real, port-specific content written.

**Current validation:** 242/387 PASS (62.5%). Of the 145 failing ports:
- ~22 ports at score 0 (template filler / missing multiple sections)
- ~50 ports at score 2-68 (content gaps + structural issues)
- ~73 ports at score 70-86 (often just 1 blocking error: `section_order/out_of_order` for map or featured_images)

**Session 13 progress (2026-03-03):** Copenhagen PASS (88), Split improved (42), Rhodes PASS (84)
**Session 14 progress (2026-03-03):** Riga (82 PASS), Tallinn (76 PASS), Phuket (56), San Diego (76), Valencia (32), Stavanger (76), Malaga (52), Victoria BC (72), St. Petersburg (72), Portland (72), Port Everglades (60), Port Miami (58)

**What each port typically needs:**
- **Cruise Port section** (100+ words): Where ships dock, terminal facilities, distance to town, specific cruise lines that call here
- **Getting Around section** (200+ words): Walking distances, specific taxi fares, bus routes, shuttle info for THIS port
- **Excursions section** (400+ words): Specific tours, activities, booking advice, prices — all port-specific

**Priority tiers:**

### Tier 1: High-traffic ports (fix first — readers will notice)
Ports that likely get significant traffic and need quality content:

| Port | Missing sections | Notes |
|------|-----------------|-------|
| ~~copenhagen.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 13, score 88~~ |
| ~~riga.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 14, score 82 PASS~~ |
| ~~tallinn.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 14, score 76 PASS~~ |
| ~~split.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 13, score 42 (logbook issues pre-existing)~~ |
| ~~rhodes.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 13, score 84 PASS~~ |
| ~~phuket.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 14, score 56 (logbook issues pre-existing)~~ |
| ~~san-diego.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 14, score 76 (logbook issues pre-existing)~~ |
| ~~valencia.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 14, score 32 (5 logbook errors pre-existing)~~ |
| ~~stavanger.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 14, score 76 (logbook 696/800 pre-existing)~~ |
| ~~malaga.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 14, score 52 (3 logbook errors pre-existing)~~ |
| ~~victoria-bc.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 14, score 72 (emotional pivot pre-existing)~~ |
| ~~st-petersburg.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 14, score 72 (emotional pivot pre-existing)~~ |
| ~~port-everglades.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 14, score 60 (logbook issues pre-existing)~~ |
| ~~port-miami.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 14, score 58 (logbook issues pre-existing)~~ |
| ~~portland.html~~ | ~~cruise-port, getting-around, excursions~~ | ~~DONE — Session 14, score 72 (logbook 723/800 pre-existing)~~ |

### Tier 2: Medium-traffic ports — 16/19 COMPLETE (Session 15)

| Port | Status | Score |
|------|--------|-------|
| ~~cairns.html~~ | DONE — template filler fix only | 82 |
| ~~cannes.html~~ | DONE — template filler fix only | 86 |
| ~~cartagena.html~~ | DONE — template filler fix only | 88 |
| ~~casablanca.html~~ | DONE — template filler fix only | 82 |
| ~~charleston.html~~ | DONE — template filler fix only | 80 |
| ~~corfu.html~~ | DONE — template filler fix only | 84 |
| goa.html | SKIPPED — needs logbook structural work | — |
| halifax.html | SKIPPED — no logbook present | — |
| ~~manila.html~~ | DONE — template filler fix only | 78 |
| ~~osaka.html~~ | DONE — 3-section + template filler | 86 |
| panama-canal.html | SKIPPED — logbook 331/800 words | — |
| ~~penang.html~~ | DONE — 3-section + reorder + template filler | 88 |
| ~~porto.html~~ | DONE — 3-section + forbidden_drinking fix | 82 |
| ~~recife.html~~ | DONE — 3-section + logbook + template filler | 84 |
| ~~taormina.html~~ | DONE — 3-section + logbook expansion | 76 |
| ~~trieste.html~~ | DONE — 3-section + reorder + template filler | 92 |
| ~~villefranche.html~~ | DONE — 3-section + template filler + logbook | 76 |
| ~~warnemunde.html~~ | DONE — 3-section + logbook reflection | 76 |
| ~~zeebrugge.html~~ | DONE — 3-section + logbook +248 words | 82 |

### Tier 3: Lower-traffic / specialized ports

| Port | Missing sections |
|------|-----------------|
| callao.html | cruise-port, excursions |
| catania.html | cruise-port, getting-around, excursions |
| cephalonia.html | cruise-port, getting-around, excursions |
| charlottetown.html | cruise-port, getting-around, excursions |
| cherbourg.html | cruise-port, getting-around, excursions |
| chilean-fjords.html | cruise-port, getting-around, excursions |
| colon.html | cruise-port, getting-around, excursions |
| durban.html | cruise-port, excursions |
| falmouth.html | logbook filler removed |
| kusadasi.html | logbook filler removed |
| la-spezia.html | cruise-port, getting-around |
| papeete.html | cruise-port, getting-around, excursions |
| ponta-delgada.html | getting-around, excursions |
| port-arthur.html | getting-around, excursions |
| port-elizabeth.html | cruise-port, getting-around, excursions |
| port-said.html | getting-around, excursions |
| puerto-montt.html | getting-around |
| punta-arenas.html | cruise-port, getting-around, excursions |
| punta-del-este.html | getting-around, excursions |
| ravenna.html | cruise-port, getting-around, excursions |
| roatan.html | cruise-port only |
| rotorua.html | cruise-port, logbook needs ~20 more words |
| royal-beach-club-antigua.html | cruise-port, getting-around, excursions |
| saguenay.html | cruise-port, getting-around, excursions |
| saint-john.html | cruise-port, getting-around, excursions |
| santa-marta.html | getting-around, excursions |
| scotland.html | cruise-port, getting-around, excursions |
| sihanoukville.html | logbook filler removed |
| south-pacific.html | cruise-port, getting-around, excursions |
| south-shetland-islands.html | cruise-port, getting-around, excursions |
| st-croix.html | getting-around, excursions |
| st-john-usvi.html | cruise-port, getting-around, excursions |
| strait-of-magellan.html | cruise-port, getting-around, excursions |
| sydney-ns.html | cruise-port, getting-around, excursions |
| tangier.html | cruise-port, getting-around, excursions |
| tauranga.html | getting-around |
| tender-ports.html | excursions (needs tender-specific content) |
| tobago.html | getting-around, excursions |
| torshavn.html | getting-around, excursions |
| trinidad.html | getting-around, excursions |
| tunis.html | cruise-port, getting-around, excursions |
| ushuaia.html | cruise-port, getting-around, excursions |
| vigo.html | cruise-port, getting-around, excursions |
| waterford.html | cruise-port, getting-around, excursions |
| zadar.html | cruise-port, getting-around, excursions |

### Approach for repairs

Each port's content must be **port-specific** — no generic templates. Research-backed content with:
- Real terminal names and facilities
- Real distances, taxi fares, bus routes
- Real excursion names, operators, approximate prices
- Real local tips that could only apply to THIS port

**Estimated effort:** ~5-10 ports per session if hand-written with web research. At that pace, completing all 77 ports would take 8-15 sessions.

**Alternative:** Prioritize Tier 1 (15 ports) and mark Tier 3 as "content stub" pages that are honest about being incomplete rather than pretending to have content they don't have.

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

### [G] Noscript Remediation — Port Pages (NEW — 2026-04-09)
**Status:** Not started — plan ready, scripts needed
**Priority:** P1 — accessibility and pastoral mandate (exhausted caregivers on hospital WiFi, privacy-conscious travelers using NoScript, disabled users on stripped-down browsers)
**Source:** Audit found 4 features completely invisible without JavaScript on port pages

**Current state:**
- Port logbook narratives: ✅ Static HTML (works without JS)
- Port content sections: ✅ Static HTML (works without JS)
- FAQs: ✅ Static HTML (works without JS)
- Weather guide: ⚠️ 273/387 have static fallback, 100 have "Enable JavaScript" placeholder, 14 have nothing
- Maps: ⚠️ 330/337 have text placeholder, 0 have static map image or location list
- Ships visiting: ❌ 370 ports, 0 noscript fallbacks (empty div)
- Recent stories: ❌ 377 ports, 0 noscript fallbacks (empty div)
- Photo gallery: ❌ 143 ports with swiper, 0 noscript image fallbacks

**Phase 1 — Green Lane (fully scriptable, no content decisions needed):**

**1a. Ships Visiting noscript fallback**
- [ ] Write `scripts/inject-ships-visiting-noscript.js`
- [ ] Read port-registry.json + ship schedule data to get ships per port
- [ ] Inject `<noscript>` block inside ships-visiting container with static list: ship name + cruise line + link to ship page
- [ ] Target: all 370 ports with ships-visiting section
- [ ] Template: `<noscript><ul class="ships-list-static">` with `<li><a href="/ships/...">Ship Name</a> (Line)</li>`
- [ ] Run once, verify 3 ports, commit

**1b. Recent Stories noscript fallback**
- [ ] Write `scripts/inject-recent-stories-noscript.js`
- [ ] Read articles/index.json to get 5 most recent articles
- [ ] Inject `<noscript>` block inside recent-rail container with static links
- [ ] These are site-wide (not port-specific), so same 5 articles on all ports
- [ ] Template: `<noscript><ul class="stories-static">` with `<li><a href="/solo/articles/...">Title</a></li>`
- [ ] Run once, verify, commit

**1c. Photo Gallery noscript fallback**
- [ ] Write `scripts/inject-gallery-noscript.js`
- [ ] Read ports/img/{slug}/ directory to get first 4-6 images
- [ ] Inject `<noscript>` block inside swiper container with static `<figure>` + `<img>` + `<figcaption>`
- [ ] Include alt text from existing image alt attributes
- [ ] Target: all 143 ports with swiper galleries
- [ ] Template: `<noscript><div class="gallery-static">` with `<figure><img src="..." alt="..." loading="lazy"></figure>`
- [ ] Run once, verify, commit

**Phase 2 — Yellow Lane (needs content/design decisions):**

**2a. Weather noscript (100 placeholder-only ports)**
- [ ] These 100 ports have weather widgets but only "Enable JavaScript" in noscript
- [ ] Need to build full static seasonal guide HTML (At a Glance, Best Time, Catches, Packing, Hazards)
- [ ] Data source: the weather widget JSON data files or research per port
- [ ] Can template from the 273 ports that already have full noscript
- [ ] Decision needed: generate from data programmatically or hand-write?

**2b. Weather noscript (14 ports with NO noscript at all)**
- [ ] These 14 ports have weather widgets with zero noscript content
- [ ] Same fix as 2a but includes adding the `<noscript>` tags themselves

**2c. Map noscript improvement**
- [ ] Current: 330 ports have "Enable JavaScript to view map" placeholder
- [ ] Options:
  - Option A: Generate static map images via Mapbox/OSM Static API (best UX, costs money/API calls)
  - Option B: Inject text-based location list from POI manifest data (free, useful, not visual)
  - Option C: Both — static image with text list below
- [ ] Decision needed: which option?

**Estimated effort:**
- Phase 1: ~2 hours (3 scripts, batch inject, verify)
- Phase 2a: ~4-8 hours (100 ports × weather research or data generation)
- Phase 2b: ~1 hour (14 ports, same approach as 2a)
- Phase 2c: Depends on design decision

**The ICP-2 v2.1 connection:** Section E requires "Key content must be in static HTML, not behind JavaScript rendering." Ships visiting, recent stories, and gallery images are content — they should be in the static HTML with JS enhancing (not replacing) the experience.

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
- [ ] Add missing whimsical units containers (~181 ships)
- [ ] Add missing grid-2 layout (~30 ships, mostly Carnival)

### [G] Ship Validation — Content Quality Enhancement
**Current:** 293/293 passing (100% — all structural validation errors resolved)
**Remaining quality improvements (beyond validator scope):**
- [ ] Generic review text (208 ships) — needs editorial content per ship
- [ ] Few images (137 ships) — needs actual image files (23 ships need just 1 more)
- [ ] FAQ too short (186 ships) — needs content expansion
- [ ] Missing whimsical units (~181 ships)
- [ ] Missing grid-2 layout (~30 ships)

### [G] Port Validation — Remaining Work
**Current:** 242/387 passing (62.5%) — drop from prior "338" count is due to `section_order/out_of_order` check now being BLOCKING
- [ ] ~145 ports still failing (22 at score 0, ~50 at score 2-68, ~73 at score 70-86)
- [ ] Trim FAQ answers to 80 words (~384 ports)
- [ ] Build POI manifests (365 ports have < 10 POIs)
- [ ] Clean promotional drift language (~200 ports)

### [G] Port Weather — Remaining Coverage
**Current:** 351/387 ports have weather widgets
- [ ] Add weather section to remaining ~36 ports

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
- [ ] Create automated coverage report
- [ ] Add "last verified" date display per ship

### [G] Competitor Analysis Recommendations — Deduplicated
**Source:** Comprehensive audit (120+ competitors, 15 categories) — `.claude/audits/`

These items appeared across 7+ individual competitor analysis sections. Deduplicated here:

**Port page improvements:**
- [ ] Ensure dock locations clearly marked on all port maps
- [ ] Add dock location summary to port page intro
- [ ] Expand DIY vs. excursion comparisons from 38 to top 50 ports
- [ ] Expand "Real Talk" honest assessments to 75+ ports (currently 46)
- [ ] Include "Skip this port if..." honest guidance where appropriate
- [ ] Add "Best for / Not ideal for" profile guidance per port
- [ ] Evaluate PDF generation for top 20 ports

**Ship page improvements:**
- [x] ~~Verify deck plan links load correctly~~ (verified 2026-03-02: external links to cruise line sites, not PDFs)
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
**Phase 1 (Infrastructure) DONE. Phase 2 (Articles) DONE. Phase 3 (Site-wide) ~99% DONE.**
- [ ] Update about-us.html "Our Promise" section to acknowledge Amazon Associates participation
- [ ] Add affiliate article links to 4 remaining ship pages (carnival-adventure, carnivale-1956, jubilee-1986, mardi-gras-1972)
- [ ] Add affiliate article links to 3 remaining port pages (beijing, falmouth-jamaica, kyoto)

### [G] Quiz Remaining Fixes
- [x] ~~Add null safety for lineData access~~ (verified 2026-03-02: null guards + optional chaining in quiz.html)
- [x] ~~Implement 10-ship limit~~ (verified 2026-03-02: 3-10 range with +/- UI, hard cap at 10)
- [x] ~~Add Comparison Drawer from Ship Atlas~~ (verified 2026-03-02: tray, modal, table, max-5 limit)
- [ ] Run edge case test personas

### [G] Data Quality
- [ ] Verify quality of auto-generated seasonal data vs hand-curated
- [ ] Verify quality of auto-generated stateroom exception files vs manually audited

---

## YELLOW LANE — AI Proposes, Human Approves

### [Y] Port Call Reliability Tracker (NEW — 2026-04-09)
**Status:** Not started — research + design needed
**Priority:** P2 — high user value, no API available
**Source:** User experience — "Costa Maybe" (Costa Maya), Bay of Islands NZ, and other ports that get cancelled frequently due to weather, tender conditions, or operational issues

**Problem:** Passengers book excursions and plan days around ports that may get cancelled. No cruise line publishes cancellation rates. Ports like Costa Maya, Bar Harbor (fog), Bermuda (wind), Bay of Islands (swell), and many tender ports have significantly higher skip rates than docked ports, but this information lives only in cruise forum folklore.

**Why it matters:** A disabled traveler who books a wheelchair-accessible excursion at a tender port that gets cancelled 30% of the time deserves to know that before booking. A grieving widow planning a meaningful shore visit doesn't need the added disappointment of discovering at 6am that the port was skipped.

**Data sources (no line API needed):**
- [ ] **Cruise forum scraping** — CruiseCritic, Reddit r/cruise, Facebook cruise groups have years of "our port was cancelled" posts. A structured scrape + NLP could extract port name + date + reason + ship name
- [ ] **Ship tracking history** — MarineTraffic, VesselFinder, and CruiseMapper show historical ship positions. Compare scheduled itinerary vs actual track to detect skipped ports (ship that was supposed to stop at Costa Maya but went straight to Cozumel)
- [ ] **Weather correlation** — Cross-reference NOAA/weather data with known cancellation patterns. If wind > 25kt at a tender port, it's probably cancelled. Build a model per port
- [ ] **Port authority data** — Some ports publish annual ship call statistics (actual vs scheduled). Caribbean ports especially may have tourism board data
- [ ] **Cruise line schedule changes** — Monitor cruise line websites for itinerary changes. When "Costa Maya" disappears from a sailing and gets replaced with "Cozumel" or "sea day," that's a data point
- [ ] **Community-sourced** — Add a simple "Did your ship actually stop here?" yes/no on each port page. Aggregate over time

**Implementation ideas:**
- [ ] Design a "Port Reliability" indicator for each port page (e.g., "Reliability: High / Moderate / Weather-Dependent")
- [ ] Add "This port is tender-only — cancellations are more common in rough weather" notice to all tender ports
- [ ] Create a seasonal reliability calendar per port (e.g., "Bay of Islands: Jan-Mar reliable, Apr-May weather-dependent, Jun-Aug often cancelled")
- [ ] Consider a `/tools/port-reliability.html` dashboard showing all ports ranked by estimated reliability
- [ ] Track tender vs dock — tender ports inherently less reliable

**Known unreliable ports (from user experience + cruise forums):**
- Costa Maya, Mexico ("Costa Maybe") — weather cancellations, especially fall
- Bay of Islands, New Zealand — swell-dependent tender, frequently cancelled
- Bar Harbor, Maine — fog cancellations, tender port
- Bermuda (some berths) — wind-dependent
- Many Greek island tender ports (Santorini, Mykonos) — meltemi wind season
- Glacier Bay, Alaska — weather/visibility
- Antarctica expedition ports — weather-dependent by nature

### [Y] Port Day Disruption Factors (NEW — 2026-04-09)
**Status:** Research in progress (2026-04-09 session)
**Priority:** P1 — directly affects port page notices sections

Comprehensive factors that can disrupt a passenger's port day, to be integrated into each port's notices section:

- [ ] **Religious dress codes** — mosque, temple, church requirements by port (specific rules, not vague "dress modestly")
- [ ] **Religious holidays** — Ramadan restaurant closures, Shabbat in Israel, Friday mosque closures, Hindu festivals
- [ ] **National holidays** — Revolution Day (Mexico), Carnival (Caribbean/Brazil), bank holidays closing attractions
- [ ] **Street closures** — parades, festivals, protests that block transit routes (user encountered this in a Mexican port)
- [ ] **Weather extremes** — not just cancellations but dangerous heat (Middle East summer), monsoon downpours, etc.
- [ ] **Accessibility barriers** — cobblestones, steep hills, tender-only limitations, heat + mobility dangers
- [ ] **Port-to-town distance** — docks far from attractions, misleading "walking distance" claims
- [ ] **Taxi/transport issues** — known scam ports, metered vs negotiated, surge pricing during events
- [ ] **Time zone changes** — ship time vs local time confusion
- [ ] **Multiple dock locations** — which berth will your ship use? (affects planning)

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
**Current:** 38 ports have comparisons
- [ ] Expand to top 50 ports
- [ ] Format: "Ship excursion: $X | DIY: $Y | You save: $Z"
- [ ] Add timing/transport/admission context

### [Y] Affiliate Content — Phase 3 (Enhance Existing)
- [ ] Add affiliate links to `/packing-lists.html`
- [ ] Add tech recommendations to `/internet-at-sea.html`

### [Y] Carnival Fleet Index Enhancement
- [ ] (Future) CTA for booking

### [Y] ships.html Display Issues
- [ ] Class cards need images
- [ ] Cruise lines need images
- [ ] Individual ship images rendering issues

### [Y] SEO External Tools Setup
- [x] ~~Set up Google Search Console~~ (active — GSC audit 2026-03-27, see top of file)
- [ ] Set up Bing Webmaster Tools
- [ ] Set up Google Analytics dashboard

### [Y] Dining Hero Images
- [ ] 49 RCL ship dining hero images needed (all currently use generic Cordelia placeholder)

### [Y] "Coming Soon" Pages
- [ ] ~172 pages still have placeholder "coming soon" text (142 ships, 18 restaurants, 7 cruise-lines, 5 other)

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
- `admin/COMPLETED_TASKS.md` — Finished work archive
- `admin/IN_PROGRESS_TASKS.md` — Currently active threads
- `admin/CAREFUL.md` — Integrity guardrail
- `admin/claude/CLAUDE.md` — Complete project guide

---

*Soli Deo Gloria*
