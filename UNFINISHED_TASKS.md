# Unfinished Tasks

**Purpose:** Active task queue. Only pending work lives here.
**Last Updated:** 2026-02-13
**Maintained by:** Claude AI

> **Archives:**
> - Historical audits moved to `.claude/archive/`
> - Competitor analyses moved to `.claude/audits/`
> - Completed tasks moved to `COMPLETED_TASKS.md`

---

## 📊 Current Codebase Status (2026-02-13)

| Asset | Count |
|-------|-------|
| Port pages | 380 |
| Ship pages | 298 |
| Restaurant pages | 472 |
| Total HTML pages | 1,238 |
| WebP images | 3,131 |
| Logbook JSON files | 285 |
| Inline styles | ~16,022 |
| Files with `<style>` | 25 |
| ICP-Lite coverage | 1,232/1,238 (99.5%) — 6 remaining are article fragments without `<head>` |
| Soli Deo Gloria coverage | 1,238/1,238 (100%) |

---

## 🚢 Cruise Line Parity Gaps

| Cruise Line | Ships | Restaurants | Gap |
|-------------|-------|-------------|-----|
| RCL | 50 | 280 | ✅ Baseline |
| NCL | 20 | 78 | Partial |
| Virgin | 4 | 46 | Good ratio |
| MSC | 24 | 45 | Partial |
| Carnival | 48 | 23 | 🔴 Needs ~200+ |
| Celebrity | 29 | 0 | 🔴 Missing |
| Holland America | 46 | 0 | 🔴 Missing |
| Princess | 17 | 0 | 🔴 Missing |
| + 7 more lines | 54 | 0 | 🔴 Missing |

**Missing cruise lines entirely:** Viking Ocean (11 ships) — open to adding
**Intentionally excluded:** Disney Cruise Line (owner decision — theological disagreement with Disney's "follow your heart" philosophy; Jeremiah 17:9)

---

## 🎯 Competitor Analysis — Strategic Tasks (2026-02-08)

**Source:** Comprehensive competitor audit (120+ competitors across 15 categories) + AI chorus evaluation
**Documents:** `COMPETITOR_COMPREHENSIVE_LIST_2026_02_08.md`, `AI_CHORUS_EVALUATION_2026_02_08.md`
**Prior audits:** `COMPETITOR_GAP_AUDIT_2026_01_17.md`, `COMPETITOR_GAP_AUDIT_2026_01_29.md`
**Method:** Every recommendation verified against actual codebase before inclusion

### Strategic Position Summary

**Verified unique advantages (moats):**
1. Venue/restaurant database (472 pages across 16 lines — market-leading, no competitor close)
2. Tool density (9 integrated tools — no single competitor has more than 2)
3. Ship-port cross-linking (369 ports, bidirectional — unique in market)
4. Ship quiz + Cruise line quiz combination (unique)
5. Port + Ship logbook gamification (unique)
6. Faith-integrated editorial content (unique — competitors are booking/charter operators only)
7. Ad-free trust model (nearly unique in space)
8. AI-first metadata (ICP-Lite, llms.txt, ai-summary, AI-breadcrumbs, JSON-LD mirroring)
9. Content freshness discipline (ICP-Lite review cadence, last-reviewed dates, monthly stale audits)

**Verified scale gaps (accept, don't chase):**
1. Ship count: 293 vs CruiseMapper's 976
2. Port count: 380 vs WhatsInPort's 1,200
3. Stateroom data: vs CruiseDeckPlans' 267,150 rooms with photos
4. Community: No forums vs Cruise Critic's 46M+ posts
5. Brand recognition: vs Cruise Critic, Cruzely (mainstream media citations)
6. Video presence: No YouTube vs Emma Cruises (410K), Life Well Cruised (460K)

### P1 Tasks — From Competitor Analysis

#### ✅ [G] Comprehensive Print CSS for Port Pages — COMPLETE (2026-02-12)
**Status:** Complete — comprehensive @media print CSS in styles.css (lines 2372-2557+), "Print Guide" button on all 380 port pages, port-specific print optimizations for transport tables, From the Pier, Real Talk, weather widgets, and maps.
**Verified:** Print button, print CSS, map attribution, expanded details, footer attribution all working.

#### ✅ [G] AI-Readiness Polish — COMPLETE (2026-02-12)
**Status:** Complete — llms.txt already reflects 9 tools, correct counts (298/380/472), and Feb 2026 updates. JSON-LD description matches ai-summary exactly on all 8 hub pages. Stale counts fixed on ports.html (333→380) and restaurants.html (445→472).
**AI-breadcrumbs progress (2026-02-12):** Added to 20 high-traffic ports (21→41/380, 10.8%). Ships 301/315 (95%), restaurants 472/472 (100%). Remaining: 339 port pages still need breadcrumbs (Green lane, future batch passes).

#### ✅ [Y] Marketing Copy Update — COMPLETE (2026-02-12)
**Status:** Complete — corrected stale counts and tool references across public-facing pages.
**Changes made:**
- [x] about-us.html: Added Soli Deo Gloria invocation, updated "What We Offer" with 9 tools and correct asset counts (298 ships, 380 ports, 472 venues)
- [x] index.html: Fixed ship count (294→298), added 5 missing tools to homepage tools grid (Budget Calculator, Port Day Planner, Ship Size Atlas, Port Logbook, Ship Logbook), updated FAQ tool list to enumerate all 9
- [x] planning.html: Added Budget Calculator, Port Day Planner, Ship Size Atlas to "Start Planning" grid
- [x] ports.html: Updated all count references from 333→380, removed Royal Caribbean-only framing
- [x] restaurants.html: Updated all count references from 445→472
- [x] Nav dropdown: Added Budget Calculator, Port Day Planner, Ship Size Atlas to Tools dropdown across 1,203 pages

### P2 Tasks — From Competitor Analysis

#### 🟡 [Y] Vanilla Story Replacement (~20-24 stories remaining)
**Status:** CORRECTED 2026-02-13 — original estimate of 157 ships / 1,570 stories was wrong. Actual scope: only 44 vanilla stories across 13 ships before this session. 20 replaced on 2026-02-13.
**Priority:** P2 (nearly complete) — remaining backlog is manageable
**Lane:** 🟡 Yellow (content creation, requires quality review)
**Strategic insight:** Template stories actively weaken site authority — "conversion dilution and trust dilution"
**Why it matters:** Logbook stories are the soul of the site; generic stories damage the "calm authority from real experience" brand
**Completed 2026-02-13 (20 stories replaced):**
- [x] Audit actual vanilla story count (was 44, not 1,570)
- [x] Norwegian Star — 11 vanilla stories replaced with quality entries
- [x] Oceania Sirena — 3 institutional-author stories replaced
- [x] Oceania Vista — 2 institutional-author stories replaced
- [x] Costa Smeralda — 3 institutional-author stories replaced
- [x] Costa Toscana — 1 institutional-author story replaced
**Already quality (no vanilla) — verified 2026-02-13:**
- [x] Holland America (46 ships) — ALL quality
- [x] MSC (24 ships) — ALL quality
- [x] Norwegian (20 ships) — ALL quality (Star was last holdout)
- [x] Princess (17 ships) — ALL quality
- [x] Carnival (45 ships) — ALL quality
- [x] Celebrity (26 ships) — ALL quality
- [x] RCL (49 ships) — ALL quality
- [x] Regent, Seabourn, Silversea, Virgin, Cunard — ALL quality
**Remaining (~20-24 stories across 8 ships):**
- [ ] Costa Favolosa — 2-3 institutional-author stories
- [ ] Costa Firenze — 3 institutional-author stories
- [ ] Costa Fortuna — 2 institutional-author stories
- [ ] Costa Pacifica — 3 institutional-author stories
- [ ] Explora III-VI — 10 fleet dev team stories (4 ships, mostly future/unbuilt)
**Quality story characteristics (GOOD):** Specific ship venues, real author, 400-800 words, emotional pivot, faith-scented, unique persona
**Reference:** `admin/VANILLA-STORIES.md` for full inventory (updated 2026-02-13)

#### 🟡 [Y] DIY vs. Excursion Comparison Expansion
**Status:** 30 ports have DIY vs. excursion callouts (verified 2026-02-05)
**Priority:** P2 — practical decision support no competitor offers well
**Lane:** 🟡 Yellow (content/pricing research needed)
**Competes with:** WhatsInPort, Cruise Crocodile, Shore Excursions Group
**Tasks:**
- [ ] Expand DIY vs. excursion comparisons from 30 ports to top 50 ports
- [ ] Format: "Ship excursion: $X | DIY: $Y | You save: $Z" with logistics notes
- [ ] Add timing/transport/admission context to each comparison
- [ ] Target next 20 ports: remaining Caribbean, popular Mediterranean, Northern Europe

#### ✅ [G] "Real Talk" Honest Assessment Expansion — PHASE 1 COMPLETE (2026-02-12)
**Status:** 67 ports now have "Real Talk" or honest assessment callouts (verified 2026-02-13 via codebase grep)
**Priority:** P2 — honest disqualification is structurally impossible for ad-funded competitors
**Lane:** 🟢 Green (factual assessment, AI-safe)
**Strategic insight:** Ad-free governance enables candid content competitors can't publish
**Completed:**
- [x] Expand "Real Talk" sections from 30 ports to 52 ports (22 new: bermuda, bonaire, curacao, costa-maya, antigua, barbados, st-kitts, st-lucia, key-west, grand-turk, lisbon, istanbul, kusadasi, corfu, amsterdam, copenhagen, reykjavik, cabo-san-lucas, ensenada, singapore, hong-kong, sydney)
**Remaining (future passes):**
- [ ] Expand to 75+ ports (next high-traffic batch)
- [ ] Include "Skip this port if..." honest guidance where appropriate
- [ ] Add "Best for / Not ideal for" profile guidance per port

### Strategic "Don't Chase" List (Explicit Decisions)

These items were evaluated during the competitor analysis and **explicitly rejected**:

| Feature | Why Not | Competitor Reference |
|---------|---------|---------------------|
| Port count arms race (1,200+) | Depth > breadth; execution quality matters more | WhatsInPort |
| Ship count arms race (976+) | Same — quality of 293 pages beats 976 thin pages | CruiseMapper |
| Forums/user reviews | Dilutes single trusted voice; massive moderation burden | Cruise Critic (46M posts) |
| Real-time ship tracking | Different product category; requires live data feeds | CruiseMapper, VesselFinder |
| Native mobile app | PWA is sufficient and lower maintenance | ShipMate, cruise line apps |
| Cruise booking/deals | Commercial conflict with ad-free governance | CruisePlum, CruiseWatch, OTAs |
| News/trend coverage | Requires volume/speed that conflicts with calm authority | Cruise Hive, Cruise Radio |
| YouTube/TikTok video channel | Personality-based medium; doesn't translate to offline utility | Emma Cruises, Life Well Cruised |
| Profile-based voyage paths | Operationally impossible for one maintainer at 1,150+ pages | AI chorus suggestion |
| New product categories ("OS" labeling) | Site's voice is pastoral, not clinical; tools serve people, not frameworks | AI chorus suggestion |

### Completed Competitor Gap Items (Historical)

| Item | Completed | Evidence |
|------|-----------|----------|
| Tender Port Index + Badge | 2026-01 | `/ports/tender-ports.html` (26 ports) |
| First-Timer Hub Page | 2026-01 | `/first-cruise.html` (557 lines) |
| "No Ads" Trust Messaging | 2026-01 | about-us.html + footer trust badges |
| "Works Offline" Marketing | 2026-01 | Port footer badges + trust messaging |
| 30-Day Countdown Checklist | 2026-01 | `/countdown.html` (825 lines) |
| "Ships That Visit Here" | 2026-01 | 369 port pages with static sections |
| Transport Cost Component | 2026-01 | 10 Caribbean ports (initial), then expanded via From the Pier |
| "From the Pier" Distance Component | 2026-02-05 | 376/376 real port pages |
| DIY vs. Excursion (initial) | 2026-02-05 | 30 ports |
| "Real Talk" Honest Assessments (initial) | 2026-02-05 | 30 ports |
| "Add to My Logbook" Button | 2026-02-06 | 368 port pages |
| Affiliate Disclosure / Governance | 2026-01 | `affiliate-disclosure.html` + `about-us.html` |
| Ship-Port Cross-Linking | 2026-01 | 193 ships, 369 ports, bidirectional |

---

## 🚦 Task Lanes

| Lane | Meaning | Examples |
|------|---------|----------|
| 🟢 **Green** | AI executes | CSS cleanup, schema fixes, pattern standardization |
| 🟡 **Yellow** | AI proposes | Content changes, new pages, image updates |
| 🔴 **Red** | Human writes | Pastoral articles, theological content |

---

## 🟢 GREEN LANE — AI Executes Autonomously

### 🟢 [G] CSS Consolidation — PRIORITY (IN PROGRESS 2025-12-10)
- [ ] Decide canonical `.page-grid` definition (styles.css vs inline)
- [ ] Remove redundant `.page-grid` from all `<style>` blocks
- [ ] Estimated: 478 files need `<style>` block cleanup
- [ ] Run sed/replace to swap inline styles for class names
- [ ] Target: Reduce 16,798 inline styles to <1,000

### 🟢 [G] ChatGPT Round 2 Evaluation: "Blunt Reality" Response (2026-01-01)
| Update `about-us.html` disclosure | [ ] TODO | Explain Amazon Associates participation |
| Add affiliate article links to ship pages | [ ] IN PROGRESS | ~311 ship files - link to cabin org, packing, tech guide |
| Add affiliate article links to port pages | [ ] TODO | ~380 port files - link to photography guide, packing lists |
- [ ] Compression bags
- [ ] Travel power strip (cruise-approved)
- [ ] Motion sickness bands (Sea-Band)
- [ ] Waterproof phone pouch
- [ ] Portable cabin fan
- [ ] Lanyard/card holder for cruise card
- [ ] Hanging toiletry bag
- ... and 37 more items

### 🟢 [G] Competitor Gap Analysis: Cruise Critic (NEW - 2025-12-31)
- [ ] Promote Stateroom Checker more prominently on ship pages
- [ ] Add "cabin location tips" section to ship pages
- [ ] Cross-link from port pages ("Cruising from here? Check your cabin")
- [ ] Create dedicated "First Cruise" hub page consolidating all beginner content
- [ ] Add "New to Cruising?" callout on homepage
- [ ] Ensure planning.html links prominently to first-timer resources
- [ ] Emphasize "A Cruise Traveler's Logbook" positioning — this is a journal, not a forum
- [ ] Add author expertise callouts ("Ken has visited this port X times")
- [ ] Maintain consistent voice across all content
- [ ] Add "No ads, no affiliate links" statement to about-us.html
- ... and 23 more items

### 🟢 [G] Competitor Gap Analysis: Cruise Crocodile (NEW - 2025-12-31)
- [ ] Ensure dock locations are clearly marked on all port maps
- [ ] Add dock location summary to port page intro for quick scanning

### 🟢 [G] Competitor Gap Analysis: CruiseMapper (NEW - 2025-12-31)
- [ ] Ensure deck plan links are prominent on all ship pages
- [ ] Verify deck plan PDFs load correctly for all 50 ships
- [ ] Consider adding cabin size/amenity quick facts to ship pages (if not present)
- [ ] Audit ship quick-facts for completeness across all 50 ships
- [ ] Ensure refurbishment dates are current (CruiseMapper notes "scheduled refurbishments")
- [ ] Add crew count and total deck count if missing
- [ ] Research approach: "Known issues" section OR "Real talk" honest assessment
- [ ] Add maintenance/drydock history to ship pages (already in quick-facts for some)
- [ ] Consider brief, factual safety context where relevant (e.g., "ship was refurbished after [incident]")
- [ ] Do NOT create fear — focus on informed awareness and trust building
- ... and 3 more items

### 🟢 [G] Competitor Gap Analysis: Cruiseline.com & Shipmate App (NEW - 2025-12-31)
- [ ] Add prominent "Works Offline on Your Cruise" messaging to port pages
- [ ] Test service worker caching for complete port guide offline access
- [ ] Add "Save for Offline" button or toggle per port
- [ ] Market PWA install as "your offline cruise companion"
- [ ] Consider adding cruise countdown widget to homepage or planning.html (optional)
- [ ] Could integrate with Port Logbook — "Your next cruise: X days away"
- [ ] Consider adding user-submitted cabin photos (low priority — moderation overhead)
- [ ] Ensure deck plan links are prominent on ship pages
- [ ] Continue developing narrative depth on port pages
- [ ] Ensure every port has "My Logbook" personal section
- ... and 4 more items

### 🟢 [G] Competitor Gap Analysis: IQCruising (NEW - 2025-12-31)
- [ ] Evaluate PDF generation for top 20 ports after print CSS is complete
- [ ] Consider single-page "Port Quick Reference" PDF per port
- [ ] Lower priority than web experience improvements
- [ ] Audit port page structure for consistency across all 291 ports
- [ ] Create standardized port page template with consistent sections
- [ ] Ensure all ports have: Getting There, Getting Around, Highlights, My Logbook sections

### 🟢 [G] Competitor Gap Analysis: WhatsInPort.com (NEW - 2025-12-31)
- [ ] Create print CSS for port pages (clean single-page output)
- [ ] Add "Print This Guide" button to port pages
- [ ] Generate downloadable PDF per port (Phase 1 of Port Map roadmap)
- [ ] Include: walking map, distances from pier, transport costs, top 5 POIs
- [ ] Design "From the Pier" callout box component
- [ ] Add to styles.css as `.pier-distances` component
- [ ] Standardize format: `Attraction: X min walk | $Y taxi`
- [ ] Pilot on 10 Caribbean ports, then roll out site-wide
- [ ] Design `.transport-costs` callout component
- [ ] Standardized fields: Taxi, Uber/Lyft, Bus, Ferry, Free shuttle
- ... and 33 more items

### 🟢 [G] Consolidated Competitor Analysis Recommendations (NEW - 2025-12-31)
- [ ] Add "No ads, no affiliate links, no sponsored content" statement to about-us.html
- [ ] Create "Our Promise" or "Editorial Independence" section
- [ ] Add prominent Stateroom Checker callout to all 50 ship pages
- [ ] Add "Check Your Cabin" link in port page sidebars for homeports
- [ ] Feature Stateroom Checker on planning.html hub page
- [ ] Add "Ships That Visit Here" section to port pages
- [ ] Pull ship data from deployment info (ports.csv)
- [ ] Show ship thumbnails with links to ship pages
- [ ] Pilot on 10 Caribbean ports, then roll out
- [ ] Add prominent "Works Offline on Your Cruise" messaging to port pages
- ... and 141 more items

### 🟢 [G] Port Weather Guide Integration (NEW - 2025-12-31)
- [ ] Create `/assets/data/ports/seasonal-guides.json` - Hand-curated seasonal data
- [ ] Create `/assets/data/ports/regional-climate-defaults.json` - Regional fallbacks
- [ ] Create `/assets/js/modules/weather.js` - Open-Meteo API integration
- [ ] Create `/assets/js/port-weather.js` - Port page weather widget loader
- [ ] Add weather widget CSS to `/assets/styles.css`
- [ ] Update `/assets/js/modules/config.js` with weather API endpoint
- [ ] Add weather section HTML template to port pages
- [ ] Implement Cozumel as pilot port
- [ ] Verify weather widget renders correctly
- [ ] Test offline/failure handling
- ... and 3 more items

### 🟢 [G] Ship Page Standardization (292 pages)
- [ ] Fix author avatar to circle (remove inline border-radius overrides)
- [ ] Standardize carousel markup to `<figure>` pattern
- [ ] Align section order: First Look → Dining → Videos → Deck Plans/Tracker → FAQ
- [ ] Uniform version badge (3.010.300)
- [ ] Apply same fixes as RCL Phase 2
- [ ] Audit header patterns across all 178+ pages
- [ ] Normalize hero sizing/positioning to packing-lists.html pattern
- [ ] Ensure logo stays within viewable area (documented issue)

### 🟢 [G] Ship Size Atlas Completion (NEW - 2026-01-02)
- [ ] **Update site-wide navigation** to include Ship Size Atlas link
- [ ] Cross-check data against source URLs:
- [ ] Add "Size Map" scatter chart view (GT vs Passengers visualization)
- [ ] Add "Top 30 Largest Ships" spotlight module
- [ ] Add ship detail drawer/modal with full specs and conflict badges
- [ ] Implement data conflict display (when sources disagree)
- [ ] Add accessibility overlay for wheelchair/mobility info (future)
- [ ] Create automated coverage report (ships per brand vs expected)
- [ ] Add "last verified" date display per ship
- [ ] Implement conflict flagging UI for mixed confidence data
- ... and 117 more items

### 🟢 [G] Technical Tasks
- [ ] Verify WCAG 2.1 AA compliance across new pages
- [ ] Test keyboard navigation on dropdown menus
- [ ] Test screen reader compatibility
- [ ] Verify all images have proper alt text
- [ ] Run Google PageSpeed Insights on key pages
- [ ] Verify lazy loading for all images

---

## 🟡 YELLOW LANE — AI Proposes, Human Approves

### 🟡 [Y] Carnival Fleet Index Page Enhancement
- [ ] (Future) CTA for booking - leave off for now

### 🟡 [Y] Image Tasks
- [ ] Allure of the Seas
- [ ] Anthem of the Seas
- [ ] Icon of the Seas
- [ ] Independence of the Seas
- [ ] Navigator of the Seas
- [ ] Odyssey of the Seas
- [ ] Quantum of the Seas
- [ ] Spectrum of the Seas
- ... and 17 more items

### 🟡 [Y] RC Venues Page with Deep Links
- [ ] Link from ship class cards on ships.html (future enhancement)

### 🟡 [Y] SEO External Tools Setup
- [ ] Set up Google Search Console
- [ ] Set up Bing Webmaster Tools
- [ ] Set up Google Analytics dashboard for trackers

### 🟡 [Y] ships.html Display Issues
- [ ] Class cards need images (feature not yet implemented in ships.html)
- [ ] Cruise lines need images (feature not yet implemented)
- [ ] Individual ship images "coming up awkwardly" - investigate rendering (needs visual testing)

---

## 🔴 RED LANE — Human Decides

### Work Started But NOT Finished (Across All Threads)
- [ ] Healing Relationships at Sea (~3,000 words) — not created
- [ ] Rest for Wounded Healers (~2,500 words) — not created

### 🔴 [R] Additional Themed Articles — PASTORAL CONTENT
- [ ] Medical recovery articles (post-cancer, post-stroke, chronic illness)
- [ ] Mental health articles (anxiety, PTSD/veteran, bipolar/depression)
- [ ] Family situation articles (infertility grief, adoption, homeschool)
- [ ] Demographic articles (senior travel, neurodiversity, burn survivors)
- [ ] Life transition articles (retirement, second marriage, work-life balance)

### 🔴 [R] Articles to Write (3 remaining) — PASTORAL CONTENT
- [ ] Expand existing article OR create comprehensive-solo-cruising.html
- [ ] Cover all solo personas: grief, anxiety, introverts, by-choice, first-time
- [ ] Add ship size recommendations for solo travelers
- [ ] FAQ: dining alone, safety, meeting people, solo supplements
- [ ] Share itinerary/location with trusted family or friends before traveling
- [ ] Use location-sharing apps for real-time peace of mind
- [ ] Download offline maps before arriving at each port
- [ ] Carry a charged power bank at all times
- [ ] Choose 24/7 staffed hotels over private rentals when pre/post-cruising
- [ ] Prefer well-lit, crowded public areas over isolated shortcuts
- [ ] Know local emergency numbers for each port (add to port pages?)
- [ ] Carry self-defense tools where legal (pepper spray, personal alarm)
- [ ] Inform hotel staff you're traveling solo and not expecting visitors
- [ ] Handle money smartly: credit cards over debit for fraud protection
- [ ] Carry secondary wallet with backup cards/cash in separate location
- [ ] Start with domestic/familiar destinations to build solo confidence
- [ ] Have exit strategy when chatting with strangers (public settings only)
- [ ] Avoid sharing cabin number or personal details with new acquaintances
- [ ] Consider travel insurance (illness/delays harder to manage solo)
- [ ] Add earplugs/white noise machine to packing tips (currently only in stateroom data)
- [ ] Add power bank to essentials list
- [ ] Add personal safety alarm to optional items
- [ ] Write full article page (~3,000 words)
- [ ] Sections: marriage restoration, family reconciliation, blended families, empty nest
- [ ] Topics: marriage crisis recovery, estranged relationships, prodigal situations
- [ ] Write full article page (~2,500 words)
- [ ] Topics: pastoral burnout, caregiver fatigue, single parent burnout
- [ ] Sabbath theology section, guilt management, Scripture integration

---

## Uncategorized Pending Items

- [ ] User decision needed: deploy Amazon affiliate links or keep current ad-free positioning?
- [ ] If proceeding: duck tradition article, packing list integration, site-wide badge text tweaks
- [ ] Verify quality of auto-generated seasonal data vs hand-curated data (Cozumel was reference implementation)
- [ ] Verify quality of auto-generated exception files vs manually audited ones (Grandeur, Vision, Rhapsody were hand-verified)
- [ ] Phase 5 pass 3: Further reduce remaining ~17,800 inline styles (remaining are intentional overrides or mixed patterns)
- [ ] Standardize carousel markup to `<figure>` pattern across all lines
- [ ] Align section order: First Look → Dining → Videos → Deck Plans/Tracker → FAQ
- [ ] Uniform version badge (3.010.300)
- [ ] Comprehensive Print CSS for port pages (partial, not complete)
- [ ] `staleIfErrorTimestamped` strategy for FX API caching
- [ ] `warmCalculatorShell` predictive prefetch
- [ ] `FORCE_DATA_REFRESH` and `GET_CACHE_STATS` message handlers
- [ ] UI integration: "Refresh Rates" button, cache age display, toast notifications
- [ ] Header hero size inconsistent across hub pages
- [ ] Logo size standardization
- [ ] solo.html article loading (28 article references, uses fetch for fragments)
- [ ] index.html FAQ positioning
- [ ] astoria (Oregon) — rare port
- [ ] catalina-island (California) — verify if covered by los-angeles.html
- [ ] eden (Australia) — rare port
- [ ] port-vila (Vanuatu) — verify if covered by vanuatu.html
- [ ] rarotonga (Cook Islands) — exotic/rare
- [ ] arica (Chile) — rare
- [ ] coquimbo (Chile) — rare
- [ ] abidjan (Ivory Coast) — rare/exotic
- [ ] antsiranana (Madagascar) — rare/exotic
- [ ] la-digue (Seychelles) — rare/exotic
- [ ] luderitz (Namibia) — rare/exotic
- [ ] mossel-bay (South Africa) — rare/exotic
- [ ] aarhus (Denmark) — rare
- [ ] haugesund (Norway) — rare
- [ ] kristiansand (Norway) — rare
- [ ] nuuk (Greenland) — exotic/rare
- [ ] qaqortoq (Greenland) — exotic/rare
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

... and 301 more uncategorized items

---

## Reference Documents

- `.claude/audits/competitor-*.md` — Competitor analyses
- `.claude/archive/` — Historical audit summaries
- `COMPLETED_TASKS.md` — Finished work archive
- `CAREFUL.md` — Integrity guardrail

---

**Total pending items:** 887
