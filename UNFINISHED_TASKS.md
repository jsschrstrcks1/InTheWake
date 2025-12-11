# Unfinished Tasks

**Purpose:** Queue of tasks waiting to be worked on. Check IN_PROGRESS_TASKS.md before starting.
**Last Updated:** 2025-12-10 (G/Y/R lanes added)
**Maintained by:** Claude AI (Thread tracking)

---

## 🚦 Task Classification (G/Y/R Lanes)

Tasks are classified by AI-safety level:

| Lane | Meaning | AI Role | Examples |
|------|---------|---------|----------|
| **🟢 [G]** | AI-safe | Claude executes autonomously | Link checks, schema fixes, pattern standardization, technical validation |
| **🟡 [Y]** | AI proposes | Claude drafts, human approves | New articles, content changes, FAQ rewrites, image replacements |
| **🔴 [R]** | Notes only | Claude documents, human decides | Pastoral content, `ai:guard` zones, theological interpretations, life situation articles |

### Lane Rules
- **🟢 Green tasks**: Run freely, commit when done
- **🟡 Yellow tasks**: Present draft for approval before committing
- **🔴 Red tasks**: Add notes/research to task, never edit content directly

### Protected Zones
Files containing `<!-- ai:guard -->` blocks require human review regardless of lane.
Pastoral articles (grief, healing, wounded healers) are always 🔴 Red.

---

## 📊 Audit Summary (2025-12-01)

**MAJOR COMPLETION - Site-Wide Grid Layout Fix:**
- ✅ **764 grid layout bugs eliminated** across 571 files (PR #283)
  - Removed 614 instances of `grid-row: 1 / span 999` (infinite scroll bug)
  - Removed 144 instances of `grid-row: 2` (gap bug)
  - Automated fix via sed commands on ports/, ships/, restaurants/, solo/, tools/
  - Manual fixes on 19 complex pages with duplicates
- ✅ Verified: 0 remaining instances site-wide (re-verified 2025-12-01)

**Completed 2025-12-01:**
- ✅ Fixed article fragment location issues (solo/ vs solo/articles/)
- ✅ Added visiting-the-united-states article to solo.html RAW_ARTICLES
- ✅ Added 14 missing homeport pages (baltimore, cape-liberty, galveston, los-angeles, melbourne, mobile, new-orleans, port-canaveral, port-everglades, port-miami, san-diego, seattle, tampa, vancouver)
- ✅ Protocol documentation verified complete (admin/claude/ITW-LITE_PROTOCOL.md, STANDARDS_INDEX.md, CLAUDE.md)
- ✅ Onboarding documentation reviewed and fixed (skill directory vs rule distinction)
- ✅ ships.html Product→Thing schema fix (28 items, Google Search Console error)

**Completed 2025-11-29:**
- ✅ Star of the Seas swiper (4 images now)
- ✅ Port tracker comparison grid (5 cards in 1 row)
- ✅ Port tracker HTML structure (ports now render)
- ✅ ships.html grid layout (2+ ships per row)
- ✅ Stateroom checker new ship guidance note
- ✅ Service worker registration (489 pages)
- ✅ offline.html rebuild with search
- ✅ Git merge conflict markers (0 found - verified 2025-11-29)
- ✅ Footer text standardization (consistent site-wide - verified 2025-11-29)
- ✅ Orphaned articles in sitemap (all 3 added - verified 2025-11-29)
- ✅ ship-tracker.html missing footer (added 2025-11-28)
- ✅ Nav rename: "Ship Tracker" → "Ship Logbook" (504 files updated)
- ✅ ships.html duplicate sections (merged - verified 2025-11-29)
- ✅ travel.html infinite scroll (fixed - verified 2025-11-29)
- ✅ solo.html infinite scroll (fixed - verified 2025-11-29)
- ✅ packing-lists.html infinite scroll (fixed - verified 2025-11-29)

**ICP-Lite Coverage (2025-12-01 - COMPLETE):**
- ✅ **ALL 13 major hub pages** have Quick Answer, Best For, Key Facts
- ✅ **ALL 161 port pages have ICP-Lite** (100%) - 14 new homeports added 2025-12-01
- ✅ **ALL 50 ship pages have ICP-Lite** (added final 8 TBN ships)
- ✅ **ALL 2 tool pages have ICP-Lite** (ship-tracker, port-tracker)
- **TOTAL: 226/226 pages (100% site-wide coverage)**

**Still TODO:**
- Articles: Healing Relationships, Wounded Healers
- Protocol documentation
- Individual page pattern standardization (author/article cards across 226 pages)
- Duplicate pages to consolidate: legend-of-the-seas-1995-built.html, star-of-the-seas-aug-2025-debut.html

**Current counts (2025-12-01):**
- Total HTML pages: 530
- Port pages: 161 (up from 147)
- Ship pages: 50

**Realistic remaining task count: ~20-25 items** (increased after adding 14 homeports)

---

## 📊 2024 RCL Port Coverage Gap Analysis (2025-12-10)

**Audit Method:** Compared comprehensive 2024 Royal Caribbean port list (~320 ports including UWC one-offs) against existing HTML pages in `/ports/`.

### Coverage Summary
| Metric | Count |
|--------|-------|
| RCL 2024 Unique Ports | 203 |
| Existing HTML Pages | 161 |
| **Missing (No HTML)** | **100** |
| **Coverage** | **50.7%** |

### Missing Ports by Region

#### North America (11 ports)
**Homeports (2):** Create dedicated pages or verify existing redirects
- [ ] miami (note: port-miami.html exists, may need alias)
- [ ] new-york (note: cape-liberty.html exists for NYC terminal)

**Ports of Call (9):**
- [ ] astoria (Oregon)
- [ ] cabo-san-lucas (Mexico)
- [ ] catalina-island (California)
- [ ] ensenada (Mexico)
- [ ] freeport (Bahamas)
- [ ] hubbard-glacier (Alaska scenic cruising)
- [ ] mazatlan (Mexico)
- [ ] puerto-vallarta (Mexico)
- [ ] endicott-arm (Alaska scenic cruising)

#### Caribbean (6 ports)
- [ ] amber-cove (Dominican Republic - Royal Caribbean private destination)
- [ ] barbados (Bridgetown) - HIGH PRIORITY
- [ ] bimini (Bahamas)
- [ ] falmouth (Jamaica - note: jamaica.html exists, may cover this)
- [ ] st-croix (USVI)
- [ ] st-lucia (Castries) - HIGH PRIORITY

#### Europe (12 ports)
- [ ] alicante (Spain)
- [ ] bari (Italy)
- [ ] chania (Crete, Greece)
- [ ] flam (Norway) - Norwegian Fjords
- [ ] geiranger (Norway) - Norwegian Fjords
- [ ] haifa (Israel)
- [ ] istanbul (Turkey)
- [ ] la-spezia (Cinque Terre gateway, Italy)
- [ ] olden (Norway) - Norwegian Fjords
- [ ] portofino (Italy)
- [ ] ronne (Bornholm, Denmark)
- [ ] toulon (France)

#### Asia/Middle East (22 ports) - LARGEST GAP
**Middle East (2):**
- [ ] abu-dhabi (UAE) - HIGH PRIORITY
- [ ] dubai (UAE) - HIGH PRIORITY

**Japan (7):**
- [ ] ishigaki
- [ ] kagoshima
- [ ] kobe
- [ ] nagasaki
- [ ] okinawa
- [ ] osaka

**South Korea (3):**
- [ ] busan
- [ ] jeju
- [ ] seoul (Incheon port)

**Southeast Asia (7):**
- [ ] colombo (Sri Lanka)
- [ ] goa (India)
- [ ] hambantota (Sri Lanka)
- [ ] ho-chi-minh-city (Vietnam)
- [ ] lombok (Indonesia)
- [ ] nha-trang (Vietnam)
- [ ] penang (Malaysia)
- [ ] phuket (Thailand)

**Other Asia (3):**
- [ ] mumbai (India)
- [ ] taipei (Taiwan - Keelung port)
- [ ] tianjin (Beijing gateway, China)

#### Australia/NZ/Pacific (14 ports)
**Australia (7):**
- [ ] adelaide
- [ ] airlie-beach
- [ ] cairns
- [ ] darwin
- [ ] eden
- [ ] fremantle (Perth)
- [ ] hobart (Tasmania)

**New Zealand (1):**
- [ ] bay-of-islands

**South Pacific (6):**
- [ ] bora-bora (French Polynesia)
- [ ] moorea (French Polynesia)
- [ ] noumea (New Caledonia)
- [ ] papeete (Tahiti)
- [ ] port-vila (Vanuatu)
- [ ] rarotonga (Cook Islands)

#### South America (17 ports)
- [ ] arica (Chile)
- [ ] buenos-aires (Argentina)
- [ ] cabo-frio (Brazil)
- [ ] callao (Lima gateway, Peru)
- [ ] colon (Panama)
- [ ] coquimbo (Chile)
- [ ] fortaleza (Brazil)
- [ ] manta (Ecuador)
- [ ] montevideo (Uruguay)
- [ ] port-stanley (Falkland Islands)
- [ ] puerto-madryn (Argentina)
- [ ] punta-arenas (Chile - Patagonia)
- [ ] recife (Brazil)
- [ ] rio-de-janeiro (Brazil)
- [ ] salvador (Brazil)
- [ ] santos (São Paulo, Brazil)
- [ ] valparaiso (Santiago gateway, Chile)

#### Africa (11 ports)
- [ ] abidjan (Ivory Coast)
- [ ] antsiranana (Madagascar)
- [ ] cape-town (South Africa)
- [ ] dakar (Senegal)
- [ ] la-digue (Seychelles)
- [ ] luanda (Angola)
- [ ] luderitz (Namibia)
- [ ] mossel-bay (South Africa)
- [ ] port-elizabeth (South Africa)
- [ ] port-louis (Mauritius)
- [ ] walvis-bay (Namibia)

#### Northern Europe/Atlantic (7 ports)
- [ ] aarhus (Denmark)
- [ ] agadir (Morocco)
- [ ] haugesund (Norway)
- [ ] klaipeda (Lithuania)
- [ ] kristiansand (Norway)
- [ ] nuuk (Greenland)
- [ ] qaqortoq (Greenland)

### Extra Ports (Have HTML but NOT in 2024 RCL list)
These 58 ports have pages but weren't in the 2024 RCL list. They may be:
- Ports from other cruise lines
- Historical/rare RCL ports
- Scenic cruising destinations
- Slight naming variations

Notable examples: glacier-bay, norwegian-fjords, panama-canal, costa-maya, grand-turk, martinique, guadeloupe

### Priority Recommendations

**P1 - Immediate (HIGH traffic RCL destinations):**
1. Caribbean: barbados, st-lucia, amber-cove (3 ports)
2. Middle East: dubai, abu-dhabi (2 ports)
3. Alaska: hubbard-glacier, endicott-arm (2 ports)

**P2 - Short-term (Frequent RCL itineraries):**
1. Europe: istanbul, flam, geiranger, la-spezia (4 ports)
2. Mexico: cabo-san-lucas, ensenada, mazatlan, puerto-vallarta (4 ports)
3. Asia: osaka, busan, phuket (3 ports)

**P3 - Medium-term (Growing regions):**
1. Australia: adelaide, cairns, hobart, fremantle (4 ports)
2. South Pacific: bora-bora, papeete, noumea (3 ports)

**P4 - Long-term (World cruise/exotic):**
1. South America: rio-de-janeiro, buenos-aires, valparaiso (3 ports)
2. Africa: cape-town, port-louis (2 ports)

---

## 📊 2024 RCL Homeport Gap Analysis (2025-12-10)

**Audit Method:** Compared RCL departure port list (58 homeports) against existing HTML pages and tracker entries.

### Homeport Coverage Summary
| Metric | Count |
|--------|-------|
| RCL Homeports Listed | 58 |
| Have HTML (direct or alias) | 36 |
| **Missing HTML Pages** | **22** |
| Tracker Homeport Entries | 29 |
| **Tracker Entries Need URLs** | **26** |

### Missing Homeport HTML Pages (22 ports)

#### North America (5)
- [ ] charleston (South Carolina)
- [ ] norfolk (Virginia)
- [ ] philadelphia (Pennsylvania)
- [ ] san-francisco (California)
- [ ] west-palm-beach (Florida)

#### Europe (2)
- [ ] hamburg (Germany)
- [ ] istanbul (Turkey) - also in ports of call list

#### Middle East (2)
- [ ] dubai (UAE) - HIGH PRIORITY, also port of call
- [ ] haifa (Israel) - also in ports of call list

#### Asia (3)
- [ ] mumbai (India) - also port of call
- [ ] phuket (Thailand) - also port of call
- [ ] tianjin (Beijing gateway, China)

#### South America (8)
- [ ] buenos-aires (Argentina)
- [ ] callao (Lima gateway, Peru)
- [ ] colon (Panama)
- [ ] la-guaira (Caracas, Venezuela)
- [ ] rio-de-janeiro (Brazil)
- [ ] san-antonio (Santiago, Chile)
- [ ] valparaiso (Santiago gateway, Chile)

#### Africa (1)
- [ ] cape-town (South Africa) - also port of call

#### Caribbean (1)
- [ ] montego-bay (Jamaica)

### Existing Aliases (HTML exists under different name)
These homeports have HTML pages under alternate names:
- bayonne → `/ports/cape-liberty.html` ✅
- fort-lauderdale → `/ports/port-everglades.html` ✅
- miami → `/ports/port-miami.html` ✅
- new-york → `/ports/cape-liberty.html` ✅ (Cape Liberty is in NY Harbor area)
- civitavecchia → `/ports/civitavecchia.html` ✅ (Rome's port)
- piraeus → `/ports/athens.html` ✅ (Athens port)

### Tracker Homeport Entries - URL Updates Needed (26)

**Already documented in port-tracker.html section above. These hp-* entries have `url: null` but can link to existing pages.**

### New Homeports to ADD to Tracker (29 new entries)

These homeports are on the RCL list but not in the tracker's PORTS_DB:

#### North America (5)
- [ ] hp-norfolk
- [ ] hp-philadelphia
- [ ] hp-west-palm-beach
- [ ] hp-san-juan (have HTML, need tracker entry)
- [ ] hp-honolulu (have HTML, need tracker entry)

#### Europe (9)
- [ ] hp-dover (London gateway)
- [ ] hp-hamburg
- [ ] hp-istanbul
- [ ] hp-le-havre (Paris gateway)
- [ ] hp-lisbon
- [ ] hp-livorno (Florence/Pisa gateway)
- [ ] hp-athens (Piraeus)
- [ ] hp-ravenna
- [ ] hp-trieste

#### Asia/Middle East (5)
- [ ] hp-dubai
- [ ] hp-mumbai
- [ ] hp-phuket
- [ ] hp-shanghai
- [ ] hp-tianjin

#### Australia (1)
- [ ] hp-melbourne (have HTML, need tracker entry)

#### South America (8)
- [ ] hp-buenos-aires
- [ ] hp-callao
- [ ] hp-cartagena (have HTML as port of call)
- [ ] hp-colon
- [ ] hp-la-guaira
- [ ] hp-rio-de-janeiro
- [ ] hp-san-antonio
- [ ] hp-valparaiso

#### Africa/Other (1)
- [ ] hp-cape-town
- [ ] hp-haifa
- [ ] hp-montego-bay

### Priority Recommendations - Homeports

**P1 - Immediate (Major RCL hubs):**
1. dubai, istanbul, hamburg (3 ports - Europe/Middle East expansion)
2. rio-de-janeiro, buenos-aires (2 ports - South America hubs)

**P2 - Short-term:**
1. cape-town, haifa (2 ports - Africa/Middle East)
2. mumbai, phuket, tianjin (3 ports - Asia)

**P3 - Medium-term:**
1. US regional: charleston, norfolk, philadelphia, san-francisco, west-palm-beach (5 ports)
2. South America: callao, colon, valparaiso, san-antonio, la-guaira (5 ports)

---

## How This File Works

1. Tasks are organized by priority (P0 = Critical, P1 = High, P2 = Medium, P3 = Low, P4 = Future)
2. Before starting a task, check IN_PROGRESS_TASKS.md for conflicts
3. When starting, move the task to IN_PROGRESS_TASKS.md
4. When complete (user confirmed), move to COMPLETED_TASKS.md

---

## P0 - Critical (User-facing issues)

### ✅ DONE: Fix Duplicate Dropdown JavaScript (15 files)
**Status:** COMPLETE - All files now have exactly 1 instance of dropdown JS
**Verified:** 2025-11-28

### ✅ DONE: Fix Placeholder Image Attributions (4 ships)
**Status:** COMPLETE - All ships have Wikimedia attributions (generic text)
**Verified:** 2025-11-28

### ✅ DONE: ship-tracker.html Footer
**Status:** COMPLETE - Footer added matching site pattern
**Verified:** 2025-11-28

### ✅ DONE: Nav Rename "Ship Tracker" → "Ship Logbook"
**Status:** COMPLETE - 504 files updated with new nav text
**Verified:** 2025-11-28

### Stateroom Checker Tool - RCL Fleet Expansion
**Status:** ✅ COMPLETE! All 28 active RCL ships supported! (Adventure of the Seas, Allure of the Seas, Anthem of the Seas, Brilliance of the Seas, Enchantment of the Seas, Explorer of the Seas, Freedom of the Seas, Grandeur of the Seas, Harmony of the Seas, Icon of the Seas, Independence of the Seas, Jewel of the Seas, Liberty of the Seas, Mariner of the Seas, Navigator of the Seas, Oasis of the Seas, Odyssey of the Seas, Ovation of the Seas, Quantum of the Seas, Radiance of the Seas, Serenade of the Seas, Spectrum of the Seas, Star of the Seas, Symphony of the Seas, Utopia of the Seas, Vision of the Seas, Voyager of the Seas, Wonder of the Seas)
**Impact:** Major user engagement feature - expand to all 28 active RCL ships
**Data Required:** Cabin exception data for each ship (view obstructions, noise issues, motion sensitivity, connecting doors)

**NEW: PWA Features ✨**
- ✅ Progressive Web App (PWA) support - works offline onboard ship (uses site-wide sw.js)
- ✅ 3-tier dropdown system (Cruise Line → Ship Class → Ship)
- ✅ Install prompt with "next cruise desk" messaging (corrected from "Excursions Desk")
- ✅ Correct icon paths from /assets/icons/ (not redundant paths)
- ✅ Service worker caches all ship data for offline access (~500KB)

**🎉 FLEET COMPLETE - 28/28 Ships (100%):**
- [x] Adventure of the Seas ✅
- [x] Allure of the Seas ✅
- [x] Anthem of the Seas ✅
- [x] Brilliance of the Seas ✅
- [x] Enchantment of the Seas ✅
- [x] Explorer of the Seas ✅
- [x] Freedom of the Seas ✅
- [x] Grandeur of the Seas ✅
- [x] Harmony of the Seas ✅
- [x] Icon of the Seas ✅
- [x] Independence of the Seas ✅
- [x] Jewel of the Seas ✅
- [x] Liberty of the Seas ✅
- [x] Mariner of the Seas ✅
- [x] Navigator of the Seas ✅
- [x] Oasis of the Seas ✅
- [x] Odyssey of the Seas ✅
- [x] Ovation of the Seas ✅
- [x] Quantum of the Seas ✅
- [x] Serenade of the Seas ✅
- [x] Spectrum of the Seas ✅
- [x] Star of the Seas ✅
- [x] Symphony of the Seas ✅
- [x] Utopia of the Seas ✅
- [x] Vision of the Seas ✅
- [x] Voyager of the Seas ✅
- [x] Wonder of the Seas ✅

**Data Structure:** JSON file per ship at `/assets/data/staterooms/stateroom-exceptions.{ship-slug}.v2.json`
**Exception Flags:** VIEW_PARTIAL_OVERHANG, VIEW_OBSTRUCTED_LIFEBOAT, VIEW_OBSTRUCTED_STRUCTURAL, NOISE_POOL_ABOVE, NOISE_MULTIDECK_ATRIUM, NOISE_ELEVATOR_TRAFFIC, NOISE_THEATER_BELOW, NOISE_GALLEY_ABOVE, MOTION_FORWARD, MOTION_AFT, MOTION_HIGH_DECK, CONNECTING_DOOR

**Process per Ship:**
1. Research cabin quirks from CruiseCritic, CruiseMummy, Reddit, DeckPlans
2. Generate JSON with cabin ranges, flags, evidence summaries, trust scores
3. Test on stateroom-check.html (update ship dropdown)
4. Document sources and verification

---

## P1 - High (Content completeness)

### 🔴 [R] Articles to Write (3 remaining) — PASTORAL CONTENT

#### Solo Cruising Expansion
**Status:** Partial - why-i-started-solo-cruising.html exists but not comprehensive
**Lane:** 🔴 Red (contains grief/anxiety pastoral content)
- [ ] Expand existing article OR create comprehensive-solo-cruising.html
- [ ] Cover all solo personas: grief, anxiety, introverts, by-choice, first-time
- [ ] Add ship size recommendations for solo travelers
- [ ] FAQ: dining alone, safety, meeting people, solo supplements

#### Healing Relationships at Sea
**Status:** Not created (15+ logbook references)
**Lane:** 🔴 Red (marriage/family pastoral content)
- [ ] Write full article page (~3,000 words)
- [ ] Sections: marriage restoration, family reconciliation, blended families, empty nest
- [ ] Topics: marriage crisis recovery, estranged relationships, prodigal situations

#### Rest for Wounded Healers
**Status:** Not created (10+ logbook references)
**Lane:** 🔴 Red (burnout/Sabbath theology)
- [ ] Write full article page (~2,500 words)
- [ ] Topics: pastoral burnout, caregiver fatigue, single parent burnout
- [ ] Sabbath theology section, guilt management, Scripture integration

### ✅ DONE: Protocol Documentation
**Status:** COMPLETE - All files exist at admin/claude/ (verified 2025-12-01)
- [x] ITW-LITE_PROTOCOL.md (844 lines, comprehensive v3.010 protocol)
- [x] STANDARDS_INDEX.md (master index)
- [x] CLAUDE.md (AI wiring and guidance)

### Complete Placeholder Content Pages
- [x] /ports.html - ✅ Has content and right rail
- [ ] /drinks.html - Does not exist (drink-packages.html does exist and has content)
- [x] /restaurants.html - ✅ Has content, no placeholder text

### Page Fixes Needed
- [ ] /search.html - Lacks version badge (V1.Beta)
- [ ] /tools/ship-tracker.html - CSS stripped without styles.css link (appears unstyled)
- [ ] /tools/port-tracker.html - CSS stripped without styles.css link (appears unstyled)

### 🟡 [Y] SEO External Tools Setup
**Lane:** 🟡 Yellow (requires account credentials, human action)
- [ ] Set up Google Search Console
- [ ] Set up Bing Webmaster Tools
- [ ] Set up Google Analytics dashboard for trackers

---

## P2 - Medium (Enhancement)

### Developer Tooling & Infrastructure (2025-12-10 Evaluation)

**Context:** Evaluated suggestions from ChatGPT against current codebase. These are high-leverage additions that align with single-repo, hand-rolled philosophy.

#### Leaflet Map Integration — Port Tracker "My Cruising Journey"
**Status:** Planned
**Priority:** HIGH - Transforms Port Tracker from "useful tool" to "emotional centerpiece"
**Bundle Impact:** ~55KB (Leaflet 42KB + marker cluster 8KB + custom 5KB)

**Phase 1: Core Map (MVP)**
- [ ] Add map view toggle to Port Tracker (List | Map | Stats tabs)
- [ ] Display all 161 ports as pins (visited=blue filled, unvisited=gray outline)
- [ ] Click pin → popup with port name, visited status, link to guide
- [ ] Click pin → toggle visited status (syncs bidirectionally with list view)
- [ ] Zoom-to-region buttons (Caribbean, Alaska, Mediterranean, Northern Europe, etc.)
- [ ] Persist map/list view preference in localStorage
- [ ] Lazy-load map only when tab selected (ship Wi-Fi friendly)
- [ ] Cache map tiles in service worker for offline viewing

**Phase 2: Enhanced Visualization (After Phase 1 stable)**
- [ ] Add Turf.js for geospatial queries (~10KB modular imports)
- [ ] Region clustering when zoomed out (badge shows count per region)
- [ ] "Show nearby unvisited ports" toggle (Turf.buffer + filter)
- [ ] Bingo card overlay ("Caribbean Bingo: 18/24 - you need these 6")
- [ ] Heat map mode for repeat visitors

**Phase 3: Share & Social**
- [ ] "Share My Map" button → generates static image with stats overlay
- [ ] Deep link support: `?view=map&region=caribbean`

**Phase 4: Ship Tracker Integration**
- [ ] Ship homeport markers
- [ ] "Show ports I visited on [ship name]" filter
- [ ] Combined stats: "8 ships, 42 ports, 15 countries"

**Phase 5: Individual Port Pages**
- [ ] Small map widget on each port page showing location
- [ ] "Nearby ports" visualization (uses existing Haversine logic)

**Files to Create:**
```
/assets/js/modules/map-core.js      # Leaflet initialization
/assets/js/modules/map-ports.js     # Port pins, popups, sync
/assets/js/modules/map-regions.js   # Region bounds, zoom presets
/assets/css/components/map.css      # Map-specific styles
```

**Reference:** Detailed plan in session 2025-12-10 (ChatGPT evaluation)

---

#### JSON Schema Validation (check-jsonschema)
**Status:** Planned
**Priority:** HIGH - Data integrity for 204 JSON files
**Tool:** python-jsonschema/check-jsonschema (aligns with existing Python tooling)

**Implementation:**
- [ ] Create `/schema/` directory for JSON Schema definitions
- [ ] Define schema for `search-index.json` (title, url, description, category, keywords)
- [ ] Define schema for `ports/*.json` (slug, name, lat, lon, region, country required)
- [ ] Define schema for `ships/*.json` (ship specs, class, capacity)
- [ ] Define schema for `brands.json`, `dishes.json`, `experiences.json`
- [ ] Add GitHub Action: `check-jsonschema --schemafile schema/*.schema.json assets/data/**/*.json`
- [ ] Add pre-commit hook for local validation

**Value:** Catches data errors before they break search, calculators, or trackers

---

#### Playwright + axe-core (E2E Accessibility Testing)
**Status:** Planned
**Priority:** MEDIUM-HIGH - Catches interactive accessibility issues Pa11y misses
**Bundle Impact:** Dev dependency only (~50MB), no production impact

**Implementation:**
- [ ] Install Playwright + @axe-core/playwright as dev dependencies
- [ ] Create `/tests/e2e/` directory
- [ ] Write `drink-calculator.spec.ts` - keyboard navigation, form accessibility
- [ ] Write `port-tracker.spec.ts` - checkbox interactions, modal accessibility
- [ ] Write `ship-tracker.spec.ts` - similar to port tracker
- [ ] Add GitHub Action: Run nightly on main (not every PR - too heavy)
- [ ] Test axe-core on opened modals (share modal, export modal, etc.)

**Value:** Validates WCAG 2.1 AA commitment for interactive tools

---

#### Linkinator (Link Health Checking)
**Status:** Planned
**Priority:** MEDIUM - 522 pages with cross-references prone to link rot

**Implementation:**
- [ ] Add GitHub Action using linkinator-action
- [ ] Run weekly on main branch
- [ ] Scan: `*.html`, `ships/**/*.html`, `ports/**/*.html`, `restaurants/**/*.html`
- [ ] Report broken internal links (404s)
- [ ] Optional: Add linkinator-mcp for Claude Code integration

**Value:** Catches broken links before users do; especially important after bulk renames

---

### Port Expansion - See Comprehensive Gap Analysis Above

**Refer to:** [📊 2024 RCL Port Coverage Gap Analysis](#-2024-rcl-port-coverage-gap-analysis-2025-12-10)

**Quick Reference - Priority P2 Ports (100 total missing):**
- **P1 Immediate:** barbados, st-lucia, amber-cove, dubai, abu-dhabi, hubbard-glacier, endicott-arm (7 ports)
- **P2 Short-term:** istanbul, flam, geiranger, la-spezia, cabo-san-lucas, ensenada, mazatlan, puerto-vallarta, osaka, busan, phuket (11 ports)
- **P3 Medium-term:** adelaide, cairns, hobart, fremantle, bora-bora, papeete, noumea, bay-of-islands (8 ports)

**Tracker Fixes Still Needed:**
- [ ] Add Vancouver as regular port entry in PORTS_DB (in addition to homeport)
- [ ] Add Melbourne as regular port entry in PORTS_DB (in addition to homeport)

**Note:** Previously listed Caribbean ports (St. Kitts, Grenada, Martinique, Guadeloupe, Dominica) confirmed as already complete. Antigua not in 2024 RCL list.

### 🟡 [Y] Image Tasks
**Lane:** 🟡 Yellow (requires attribution decisions, image selection approval)

#### Download Wiki Commons Images (19 ships)
After downloading, must add attribution sections to HTML.

**Active Ships (10):**
- [ ] Allure of the Seas
- [ ] Anthem of the Seas
- [ ] Icon of the Seas
- [ ] Independence of the Seas
- [ ] Navigator of the Seas
- [ ] Odyssey of the Seas
- [ ] Quantum of the Seas
- [ ] Spectrum of the Seas
- [ ] Voyager of the Seas
- [ ] Wonder of the Seas

**Historic/Retired Ships (9):**
- [ ] Sovereign of the Seas
- [ ] Monarch of the Seas
- [ ] Legend of the Seas
- [ ] Splendour of the Seas
- [ ] Nordic Empress
- [ ] Song of Norway
- [ ] Song of America
- [ ] Viking Serenade
- [ ] Sun Viking

#### Image Processing
- [ ] Convert downloaded images to WebP format
- [ ] Move to /assets/ships/ directory
- [ ] Rename to pattern: {ship-slug}1.webp, etc.

#### Image Research
- [ ] Star of the Seas - Search for construction photos
- [ ] Nordic Prince - Search for historic ship images
- [ ] Verify duplicate ships (Legend, Star variants)

### Cruise Line Hub Page Attributions
- [ ] Carnival.html - Replace placeholders with credited media
- [ ] Celebrity.html - Replace placeholders with credited media
- [ ] Disney.html - Replace placeholders with credited media
- [ ] Holland America.html - Replace placeholders with credited media
- [ ] MSC.html - Replace placeholders with credited media

### Data Completion
- [ ] Complete /assets/data/venues.json with all dining venues
- [ ] Map each ship to its specific venues
- [ ] Add pricing information for specialty restaurants
- [ ] Find YouTube ship tour videos for ships without videos

### 🟢 [G] Technical Tasks
**Lane:** 🟢 Green (automated validation, AI-safe)
- [ ] Verify WCAG 2.1 AA compliance across new pages
- [ ] Test keyboard navigation on dropdown menus
- [ ] Test screen reader compatibility
- [ ] Verify all images have proper alt text
- [ ] Run Google PageSpeed Insights on key pages
- [ ] Verify lazy loading for all images

### 🟢 [G] CSS Consolidation — PRIORITY (IN PROGRESS 2025-12-10)
**Lane:** 🟢 Green (technical refactor, AI-safe)
**Reference:** packing-lists.html as canonical pattern
**Scope:** Site-wide styles.css + inline CSS extraction

#### ✅ Root HTML Files Refactored (2025-12-10)
- [x] index.html - Refactored to use CSS classes
- [x] planning.html - Committed (a5c9545a)
- [x] ships.html - 30→15 inline styles (c18cc5a6)
- [x] travel.html - 33→8 inline styles (c18cc5a6)
- [x] restaurants.html - 17→8 inline styles (96cf3448)
- [x] ports.html - 74→18 inline styles (e2e80105)

#### 🔴 BLOCKING BUG: quantum-of-the-seas.html Layout Issue
**Status:** Under investigation
**Symptoms:**
- "A First Look" and "Dining Venues" sections stretch thousands of lines
- Page content doesn't start at the top
- Grid creates "million billion extra lines in different squares"
- Swiper images not displaying in First Look carousel

**Root Cause Analysis (2025-12-10):**
- icon-of-the-seas.html (comparison page) also has same structural issues:
  - Duplicate `<!doctype html>` at line 10
  - Inline `style="grid-template-columns: 1fr"` on `<main>` overrides `.page-grid` (2-column) with single column
  - Items placed in `grid-column: 2` while template only has 1 column → implicit columns created
- The `.grid-2` class uses `align-items: stretch` which can cause cards to stretch to enormous heights
- Swiper images using `.webp` directly without `<picture>` fallback may not load in some browsers

**TODO:**
- [ ] Fix quantum-of-the-seas.html structure to match working pages (ships.html pattern)
- [ ] Audit all 178 ship pages for duplicate doctype and conflicting inline grid styles
- [ ] Ensure Swiper images have `<picture>` with fallback formats

#### Remaining Work

#### 📊 Audit Results (2025-12-10)
| Metric | Count |
|--------|-------|
| Total HTML files | 522 |
| Files with `<style>` blocks | 511 (98%) |
| Files with inline `style=` attrs | 517 (99%) |
| Total inline `style=` occurrences | **16,798** |
| Unique inline patterns | 511 |
| Main styles.css | 627 lines |

**Inline Styles by Directory:**
- ports/: 5,837 (avg 36/file)
- ships/: 5,543 (avg 31/file)
- restaurants/: 4,280 (avg 33/file)
- solo/: 202 (avg 13/file)
- root/: 715

**⚠️ Major Conflict:** 478 pages override `.page-grid` with conflicting definitions!
- styles.css: `grid-template-columns: minmax(0, 1fr) minmax(260px, var(--rail))`
- Inline `<style>`: `grid-template-columns: 1fr 360px`

#### Phase 1: Extract High-Frequency Patterns to CSS Classes
**Target:** Top 10 patterns (7,000+ occurrences)
- [ ] `.list-item-indent` → `margin: 0.5rem 0; padding-left: 1rem;` (1,069×)
- [ ] `.accordion-trigger` → `cursor: pointer; font-weight: 600; padding: 0.5rem 0;` (1,029×)
- [ ] `.section-divider` → `border-bottom: 1px solid #e0e8f0;` (642×)
- [ ] `.content-text` → `color: var(--ink-mid); line-height: 1.5;` (520×)
- [ ] `.hidden` → `display: none;` (517×)
- [ ] `.sr-only` (already exists?) → `opacity:0;position:absolute;` (454×)
- [ ] `.mt-05` → `margin-top: 0.5rem;` (454×)
- [ ] `.inline` → `display: inline;` (441×)
- [ ] `.rounded-lg` → `border-radius: 12px;` (432×)
- [ ] `.img-cover` → `width:100%;height:100%;object-fit:cover;` (429×)

#### Phase 2: Extract Component Patterns
**Target:** Article Rail component (417× each pattern = 2,900+ occurrences)
- [ ] Create `.article-card` component class
- [ ] Create `.article-card-thumb` for 80×60 thumbnail
- [ ] Create `.article-card-body` for flex layout
- [ ] Replace inline styles in 417 article cards

#### Phase 3: Resolve .page-grid Conflict
- [ ] Decide canonical `.page-grid` definition (styles.css vs inline)
- [ ] Remove redundant `.page-grid` from all `<style>` blocks
- [ ] Estimated: 478 files need `<style>` block cleanup

#### Phase 4: Remove Inline `<style>` Blocks
- [ ] Port pages: Remove 161 redundant `<style>` blocks (~34,615 lines)
- [ ] Ship pages: Remove 178 redundant `<style>` blocks
- [ ] Restaurant pages: Remove 129 redundant `<style>` blocks
- [ ] Verify pages render correctly after removal

#### Phase 5: Inline `style=` Attribute Cleanup
- [ ] Run sed/replace to swap inline styles for class names
- [ ] Target: Reduce 16,798 inline styles to <1,000

**Estimated Impact:** Remove ~50,000+ lines of duplicated CSS

### 🟢 [G] Ship Page Standardization (178 pages)
**Lane:** 🟢 Green (pattern normalization, AI-safe)
**Reference:** packing-lists.html header pattern

#### Phase 1: Extract Shared CSS
- [ ] Create /assets/ship-page.css with standardized hero, page-grid, author-card
- [ ] Replace inline styles in ship pages with CSS link

#### Phase 2: RCL Ships (50 pages)
- [ ] Fix author avatar to circle (remove inline border-radius overrides)
- [ ] Standardize carousel markup to `<figure>` pattern
- [ ] Align section order: First Look → Dining → Videos → Deck Plans/Tracker → FAQ
- [ ] Remove emoji from stateroom buttons (consistency)
- [ ] Uniform version badge (3.010.300)

#### Phase 3: Carnival Ships (48 pages)
- [ ] Apply same fixes as RCL Phase 2

#### Phase 4: Header Standardization (site-wide)
- [ ] Audit header patterns across all 178+ pages
- [ ] Normalize hero sizing/positioning to packing-lists.html pattern
- [ ] Ensure logo stays within viewable area (documented issue)

### ICP-Lite Content Enhancements
- [ ] Add H1 + answer line to pilot ship pages
- [ ] Add fit-guidance cards to ship pages
- [ ] Add FAQ blocks with structured data
- [ ] Implement .no-js baseline globally

---

## P3 - Low (Nice to have)

### Port Expansion - P3 Regions

**See detailed breakdown in:** [📊 2024 RCL Port Coverage Gap Analysis](#-2024-rcl-port-coverage-gap-analysis-2025-12-10)

**Asia/Middle East (22 ports):** Largest gap - includes Japan (7), South Korea (3), Southeast Asia (7), Middle East (2), India/Sri Lanka (3)

**South America (17 ports):** Brazil (7), Chile (4), Argentina (3), Peru/Ecuador/Uruguay (3)

**Africa (11 ports):** South Africa (3), Namibia (2), West Africa (3), Indian Ocean islands (3)

**Northern Europe/Atlantic (7 ports):** Norway (3), Denmark (1), Lithuania (1), Greenland (2), Morocco (1)

### Multi-Cruise-Line Tracker Enhancement
- [ ] Cruise line selector dropdown on Port/Ship Tracker
- [ ] Separate ship databases per cruise line
- [ ] Cross-line tracking and achievements

### UI/UX Enhancements
- [ ] Design article rail navigation pattern
- [ ] Implement article rail site-wide
- [ ] Review intelligent breadcrumbs implementation

### 🔴 [R] Additional Themed Articles — PASTORAL CONTENT
**Lane:** 🔴 Red (life situations, grief, mental health)
- [ ] Medical recovery articles (post-cancer, post-stroke, chronic illness)
- [ ] Mental health articles (anxiety, PTSD/veteran, bipolar/depression)
- [ ] Family situation articles (infertility grief, adoption, homeschool)
- [ ] Demographic articles (senior travel, neurodiversity, burn survivors)
- [ ] Life transition articles (retirement, second marriage, work-life balance)

---

## P4 - Future Expansion (Post Royal Caribbean completion)

### Carnival Cruise Line Expansion (150-200 ports)
**Timeline:** 2026-2027+ (after Royal Caribbean core complete)
**Fleet:** 29 ships, 320+ unique ports

Phases:
- Phase 1: Carnival private islands + Caribbean unique (20-25 ports)
- Phase 2: Europe unique ports (40-50 ports)
- Phase 3: Australia/NZ/Pacific region (30-35 ports)
- Phase 4: Asia expansion (15-20 ports)
- Phase 5: South America/Africa/exotic (40-50 ports)

### Virgin Voyages Expansion (15-20 ports)
**Timeline:** 2027+
**Fleet:** 4 ships, ~120 curated ports

### Other Cruise Line Expansions
- [ ] Princess Cruises
- [ ] Norwegian Cruise Line
- [ ] Celebrity Cruises
- [ ] MSC Cruises
- [ ] Holland America Line

---

## Ship Logbooks - Future Ships (Cannot create yet)

These require ship names to be announced:
- [ ] Discovery-class ship TBN
- [ ] Icon-class ship TBN 2027
- [ ] Icon-class ship TBN 2028
- [ ] Oasis-class ship TBN 2028
- [ ] Quantum Ultra-class ship TBN 2028
- [ ] Quantum Ultra-class ship TBN 2029
- [ ] Star-class ship TBN 2028
- [ ] Legend of the Seas Icon-class 2026

---

## Duplicate Pages to Consolidate

- [ ] legend-of-the-seas-1995-built.html (duplicate of legend-of-the-seas.html)
- [ ] star-of-the-seas-aug-2025-debut.html (duplicate of star-of-the-seas.html)

---

## Reference Documents

For detailed planning, see:
- PORT_TRACKER_ROADMAP.md - Port expansion priorities and timeline
- admin/FIVE_ARTICLE_CATEGORIES.md - Article categories with logbook references
- assets/data/ports/*-master-list.md - Cruise line port inventories

---

**Related Files:**
- `IN_PROGRESS_TASKS.md` - Tasks currently being worked on
- `COMPLETED_TASKS.md` - Archive of finished work
**END OF HISTORICAL TASK ARCHIVE**

This archive is maintained additively - tasks are never removed from this section, only marked as complete. New completed tasks will be added as they are verified and removed from the active task list above.

## AUDIT #2 SUMMARY (2025-11-23)

**Verified After Rebase:**
- ✅ Service Worker v13.0.0 (maxPages: 400, maxAssets: 150, maxImages: 600, maxData: 100)
- ✅ Precache Manifest v13.0.0 (52 resources precached)
- ✅ ICP-Lite: 544/561 pages (97% coverage)
- ✅ Port pages: 147 total, 141 with LCP preload hints, 0 with under construction notices
- ✅ Ship pages: 50 total, all with responsive hero logo, all using WebP in meta tags
- ✅ Ship cards redesign COMPLETE (item-cards.css v1.0.0)
- ✅ Port Logbook & Ship Tracker COMPLETE
- ✅ Hawaii port batch COMPLETE (5 ports)
- ❌ REGRESSIONS: None found

**Major Progressions Documented:**
1. Under construction notices ALL REMOVED (was 6, now 0)
2. LCP preload hints on 141 pages (was documented as 30)
3. WebP meta tags COMPLETE on all 50 ship pages (was listed as P0 pending)
4. Ship cards redesign COMPLETE with enhanced CTAs (was P0 pending)

## THREAD-SAFETY WORK COMPLETED (claude/normalize-shell-thread-safety-01GkL7yZ6U6k7fE5xy13cFiw)

**Verified Complete 2025-11-22 (Merged to main in PR #172):**
- ✅ Service Worker updated to v13.0.0
  - maxPages: 100 → 400 (site has 561 pages)
  - maxData: 50 → 100 (was over limit at 76 JSON files)
  - maxImages: 500 → 600 (currently 285 ship images)
  - maxAssets: 100 → 150
- ✅ Precache Manifest updated to v13.0.0 (52 resources precached, was 25)
- ✅ Shell normalization: 141+ port pages cleaned (under construction notices removed)
- ✅ Hero logo normalization: 50 ship pages updated to responsive srcset format with fetchpriority="high"
- ✅ LCP preload hints: Added to 141 port pages (96% of all port pages)

---

## 📋 NEW TASK LIST - Site-Wide Pattern Standardization (2025-11-25)

**Context:** Comprehensive site-wide audit revealed inconsistent patterns across pages. Need to standardize all pages to match `index.html` reference pattern for right rail, author cards, article cards, hero sizing, and footer text.

**Reference Pattern:** `index.html` established as canonical pattern for:
- Right rail structure (Quick Answer, Best For, Key Facts, Author Card, Article Card)
- Hero sizing and logo placement
- Footer text format
- FAQ placement

### P0 - Critical (Design System Compliance)

#### index.html
- [ ] Move FAQ beneath cards for accessibility and About Us (not beneath article rail)
- [ ] Fix "in the wake" → "cruising in the wake" in FAQ section (manual, not script)
- [ ] Lower logo to match planning.html placement (currently goes outside viewable area)

#### planning.html
- [x] ✅ Add right rail: Quick Answer, Best For, Key Facts (verified present 2025-11-29)
- [ ] Link travel advisor reference to Tina
- [ ] Update article rails to match index.html pattern (currently outdated with just image + title, missing CTA and Read Article button)

#### ships.html
- [x] ✅ Has page-grid layout, right rail with Author Card + Recent Stories (verified 2025-11-29)
- [x] ✅ Add right rail: At a Glance, Key Facts (verified present 2025-11-29)
- [x] ✅ Combine duplicate "Royal Caribbean Fleet" sections (verified fixed 2025-11-29)
- [x] ✅ Remove "Recent Stories" duplication (verified fixed 2025-11-29)
- [ ] Use index.html pattern for Author and Article cards
- [ ] Set all class sections to start closed EXCEPT Icon class
- [ ] Hide/comment out "Ship layout" and "Where is the ship" sections
- [ ] Fix logo sticking off top of viewable area

#### restaurants-and-menus.html
- [x] ✅ Has page-grid layout, right rail with Author Card + Recent Stories (verified 2025-11-29)
- [x] ✅ Add right rail: Quick Answer, Key Facts, Best For (verified present 2025-11-29)
- [ ] Use index.html pattern for Author and Article cards
- [ ] Vary images (currently generic cloche on everything)
- [ ] Standardize FAQ to match other pages' pattern
- [ ] Cross-reference pass: ensure every venue links to page, mark missing pages
- [ ] Move "114 venues loaded" message to beneath header hero OR beneath footer (current placement wrong)
- [ ] Fix logo sticking above viewable area (match planning pattern)

#### ports.html (Port Index)
- [x] ✅ Has page-grid layout, right rail with Author Card + Recent Stories (verified 2025-11-29)
- [x] ✅ Add right rail: Quick Answer, Key Facts, Best For (verified present 2025-11-29)
- [ ] Update author/article cards to match index.html pattern
- [ ] Cross-linking pass: link ports with HTML pages that aren't currently linked
- [ ] Document ports mentioned but lacking pages → add to tasks
- [ ] Fix logo sticking outside viewable area (match planning)

#### drink-packages.html
- [x] ✅ Add right rail: Quick Answer, Best For, Key Facts (verified present 2025-11-29)
- [ ] Add content: Crown and Anchor loyalty status grants 4-6 free beverages/day
- [ ] Update Author/Article cards to match index.html pattern
- [ ] Investigate: logo well-placed here but lower than planning, viewable area bigger

#### stateroom-check.html
- [x] ✅ Add right rail: Quick Answer, Best For, Key Facts (verified present 2025-11-29)
- [ ] Update Author/Article cards to match index.html pattern
- [ ] Standardize header hero size (currently bigger than planning)
- [ ] Resize hero while keeping horizon centered in viewport
- [ ] Ensure logo stays within frame (all pages should match)

#### cruise-lines.html
- [x] ✅ Add right rail: Quick Answer, Key Facts, Best For (verified present 2025-11-29)
- [ ] Update Author/Article cards to match index.html pattern
- [ ] Fix divergent header hero structure (replicate packing pattern)
- [ ] Standardize FAQ section to match other pages

#### packing-lists.html
- [x] ✅ HTML structure correct, ends at line 1101 with proper footer (verified 2025-11-29)
- [x] ✅ FIX: Infinite scroll bug (fixed 2025-11-29)
- [x] ✅ Add right rail: Quick Answer, Best For, Key Facts (verified present 2025-11-29)
- [ ] Update Author/Article cards to match index.html pattern

#### accessibility.html
- [x] ✅ Add right rail: Quick Answer, Best For, Key Facts (verified present 2025-11-29)
- [ ] Update Author/Article cards to match index.html pattern
- [ ] Standardize header hero and logo to match planning page

#### travel.html
- [x] ✅ FIX: Hundreds of pages of dead space before footer (fixed 2025-11-29)
- [x] ✅ Add right rail: Quick Answer, Best For, Key Facts (verified present 2025-11-29)
- [x] ✅ STANDARDIZED: CSS classes updated to page-grid/rail pattern (2025-11-29)
- [x] ✅ HTML structure correct, ends at line 1696 with proper footer (verified 2025-11-29)
- [x] ✅ Author card and Recent Stories rail present (verified 2025-11-29)
- [ ] Update author/article cards to match index.html pattern
- [ ] Fix divergent header hero shape (replicate planning)

#### solo.html (Solo Cruising Index)
- [x] ✅ FIX: Thousands of pages of blank space (fixed 2025-11-29)
- [x] ✅ Add right rail: Quick Answer, Best For, Key Facts (verified present 2025-11-29)
- [x] ✅ Fragment loader exists and 7 article fragments present at /solo/articles/ (verified 2025-11-29)
- [x] ✅ ADDED: Author card with Ken Baker (index.html pattern) to right rail (2025-11-29)
- [x] ✅ ADDED: author-card-vertical CSS styles (2025-11-29)
- [ ] INVESTIGATE: Article fragments not loading - propose fix
- [ ] PREFER: Fix solo page frag loader (not the frags)
- [ ] IF frags carelessly altered: restore to frag format
- [ ] Add Tina to author card after Ken
- [ ] Article rail should call fragments (not full articles)
- [ ] SEO: Direct to full articles in /solo/ (not frags in /solo/articles/)
- [ ] FIX: Find and kill CSS filter making hero muted colors (want vibrant like index.html)
- [ ] Move FAQ under main content (not on right rail)

#### tools/port-tracker.html (Port Tracker)
- [x] ✅ FIX BROKEN: No ports populate regardless of click (fixed JSON syntax errors in PORTS_DB 2025-11-29)
- [x] ✅ **ADD ICP-Lite:** Quick Answer, Best For, Key Facts (completed 2025-11-29)
- [ ] Add Author and Article cards (index.html pattern)
- [ ] Expand to encompass all RCL ports
- [ ] Add wiring for future cruise line expansion

**Port Coverage Audit (2025-12-10):**
- **HTML Files:** 161 port pages exist
- **Tracker Regular Ports:** 147 entries (all have URLs, all link correctly)
- **Tracker Homeports:** 29 entries with `url: null` (not clickable)

**ACTION REQUIRED: Link 14 homeport entries to existing HTML files:**
- [ ] `hp-baltimore` → `/ports/baltimore.html`
- [ ] `hp-galveston` → `/ports/galveston.html`
- [ ] `hp-los-angeles` → `/ports/los-angeles.html`
- [ ] `hp-miami` → `/ports/port-miami.html`
- [ ] `hp-mobile` → `/ports/mobile.html`
- [ ] `hp-new-orleans` → `/ports/new-orleans.html`
- [ ] `hp-new-york` → `/ports/cape-liberty.html` (Cape Liberty is NYC's cruise terminal)
- [ ] `hp-port-canaveral` → `/ports/port-canaveral.html`
- [ ] `hp-fort-lauderdale` → `/ports/port-everglades.html` (Port Everglades is Fort Lauderdale)
- [ ] `hp-san-diego` → `/ports/san-diego.html`
- [ ] `hp-seattle` → `/ports/seattle.html`
- [ ] `hp-tampa` → `/ports/tampa.html`
- [ ] `hp-vancouver` → `/ports/vancouver.html`
- [ ] `hp-melbourne` → `/ports/melbourne.html` (Australia homeport)

**Additional homeports that can link to existing regular port pages (12):**
- [ ] `hp-amsterdam` → `/ports/amsterdam.html`
- [ ] `hp-auckland` → `/ports/auckland.html`
- [ ] `hp-barcelona` → `/ports/barcelona.html`
- [ ] `hp-boston` → `/ports/boston.html`
- [ ] `hp-brisbane` → `/ports/brisbane.html`
- [ ] `hp-copenhagen` → `/ports/copenhagen.html`
- [ ] `hp-hong-kong` → `/ports/hong-kong.html`
- [ ] `hp-quebec-city` → `/ports/quebec-city.html`
- [ ] `hp-singapore` → `/ports/singapore.html`
- [ ] `hp-southampton` → `/ports/southampton.html`
- [ ] `hp-sydney` → `/ports/sydney.html`
- [ ] `hp-venice` → `/ports/venice.html`

**Remaining homeports without any HTML page (3):**
- hp-charleston (no /ports/charleston.html)
- hp-jacksonville (no /ports/jacksonville.html)
- hp-san-francisco (no /ports/san-francisco.html)
- hp-rome (no /ports/rome.html - Civitavecchia is Rome's port, could link there)

**SUMMARY: 26 of 29 homeport entries can be linked to existing pages**

#### Ship Tracker / Port Logbook (Navigation)
- [x] SITE-WIDE: Rename "Ship Tracker" → "Ship Logbook" in nav ✅ DONE 2025-11-28
- [x] SITE-WIDE: Rename "Port Tracker" → "Port Logbook" in nav ✅ DONE 2025-11-29

#### tools/ship-tracker.html
- [x] ✅ **ADD ICP-Lite:** Quick Answer, Best For, Key Facts (completed 2025-11-29)
- [ ] Add Author and Article cards (index.html pattern)
- [ ] Fix hero section divergent pattern
- [ ] Add "A Cruise Traveler's Logbook" tagline beneath logo (white text)
- [ ] Standardize hero size (currently larger than most)
- [ ] Keep horizon centered in viewport
- [x] ✅ ADD MISSING FOOTER (done 2025-11-28)

#### about-us.html (About Us)
- [x] ✅ Add right rail: Quick Answer, Best For, Key Facts (verified present 2025-11-29)
- [ ] Update article rail to match index.html pattern

#### drink-calculator.html (Drink Calculator Enhancement)
- [ ] Make package prices editable (user can input actual prices they're paying)
- [ ] Clicking a package card updates the total to show what they would pay
- [ ] Show price two ways: per day (editable) + per week (calculated from days × daily)
- [ ] Verify/update default package prices (current defaults may be outdated)
  - Current defaults: Soda $13.99/day, Refreshment $34.00/day, Deluxe $85.00/day, Coffee Card $31 (15 punches)
  - FAQ mentions Deluxe at $89/day pre-cruise - verify which is correct

### P0 - Individual Ship Pages (ships/rcl/*.html)

**Reference:** Icon of the Seas as example

#### All 50 RCL Ship Pages
- [x] ✅ **ALL 50/50 pages have ICP-Lite elements** (Quick Answer, Best For, Key Facts) - completed 2025-11-29
  - Includes all 8 TBN ships with 2-column layout and right rail structure
- [ ] Add Author and Article cards (index.html pattern) to all 50 pages
- [ ] Shred "Recent Stories," "Related Articles and Resources" → replace with index.html pattern on all pages

#### icon-of-the-seas.html (Specific)
- [ ] FIX: Map centered on Africa coordinates (should center on actual ship)
- [ ] FIX: Image attribution cites "Allure of the Seas" but photo shows Icon (verify all attributions)

#### star-of-the-seas.html (Specific)
- [ ] FIX: No images showing in swiper despite attributions existing
- [ ] FIX: Allure image in attribution but not displayed on page
- [ ] FIX: Live tracker works, but apply all Icon page fixes here too
- [ ] FIX: Some videos marked "private," others NOT for Star of the Seas

#### ✅ DONE: All Ship Pages - Distance Feature
**Status:** COMPLETE - Whimsical distance units added to all 50 ship pages (2025-12-01)
- [x] Integrate fun-distance-units.json feature on ships pages
- [x] Review documentation for this feature
- All 50 RCL ship pages now display 3 random whimsical units
- No duplicates on same page, refreshes on each page load
- Uses shared whimsical-port-units.js component

### P0 - Individual Port Pages (ports/*.html)

#### ✅ DONE: 14 NEW Homeport Pages - ICP-Lite Complete (2025-12-01)
**Status:** COMPLETE - All 14 homeport pages have Quick Answer
- [x] ✅ baltimore.html
- [x] ✅ cape-liberty.html
- [x] ✅ galveston.html
- [x] ✅ los-angeles.html
- [x] ✅ melbourne.html
- [x] ✅ mobile.html
- [x] ✅ new-orleans.html
- [x] ✅ port-canaveral.html
- [x] ✅ port-everglades.html
- [x] ✅ port-miami.html
- [x] ✅ san-diego.html
- [x] ✅ seattle.html
- [x] ✅ tampa.html
- [x] ✅ vancouver.html

#### All 161 Port Pages
- [x] ✅ **ALL 161 pages have ICP-Lite elements (Quick Answer)** - verified 2025-12-01
- [x] ✅ Whimsical distance units added to all 161 port pages (2025-12-01)
- [ ] Add Author and Article cards (index.html pattern) to all pages
- [ ] Change "A Positively Worded Word of Warning" to better heading
- [ ] Give "Getting Around" its own card (honor design language)
- [ ] Give renamed warning section its own card
- [ ] Shred/replace "About the Author," "Recent Articles," "Recent Stories" with index.html pattern on all pages

### P1 - Site-Wide Issues

#### Logo Size Standardization
**Status:** TODO
**Issue:** Logo renders as different sizes on different pages
**Reference:** Prefer the size on index.html (home page) as the standard site-wide
**Affected:** Multiple hub pages have inconsistent logo sizing
**Action:** Audit logo CSS across all pages, standardize to index.html dimensions

#### ✅ DONE: Git Merge Conflicts
**Status:** COMPLETE - 0 instances found site-wide (verified 2025-11-29)

#### ✅ DONE: Footer Text Standardization
**Status:** COMPLETE - All footers follow standard pattern (verified 2025-11-29)
```
© 2025 In the Wake · A Cruise Traveler's Logbook · All rights reserved.
Privacy · Terms · About · Accessibility & WCAG 2.1 AA Commitment
Soli Deo Gloria
```

#### ✅ DONE: Grid Layout Bugs Site-Wide
**Status:** COMPLETE - 764 instances eliminated across 571 files (PR #283, verified 2025-11-29)
- Removed all `grid-row: 1 / span 999` instances (infinite scroll bug)
- Removed all `grid-row: 2` instances (gap bug)
- Affected directories: ports/, ships/, restaurants/, solo/, tools/

#### ✅ DONE: ICP-Lite Compliance Audit
**Status:** COMPLETE - 100% site-wide coverage achieved (2025-11-29)
- All 212 pages have Quick Answer, Best For, Key Facts
- 13 hub pages, 147 port pages, 50 ship pages, 2 tool pages

### P2 - Content & Feature Work

#### ✅ DONE: Orphaned Articles in Sitemap
**Status:** COMPLETE - All 3 articles added to sitemap.xml (verified 2025-11-29)
- solo/articles/accessible-cruising.html
- solo/articles/freedom-of-your-own-wake.html
- solo/articles/visiting-the-united-states-before-your-cruise.html

#### Orphaned Images Audit
- [ ] Review ORPHANED_IMAGES_CATALOG.md (491 images, ~276 MB)
- [ ] Sample 20-30 images to verify usage
- [ ] Wire orphaned images to appropriate endpoints (per user: "all images are used somewhere")
- [ ] Document any truly orphaned images for deletion

#### cruise-lines/royal-caribbean.html#vision
- [ ] Evaluate: Does this page justify existence?
- [ ] Currently rehashes data from other pages less attractively
- [ ] Decision needed: Refactor, repurpose, or recycle

### P3 - Investigation & Documentation

#### Distance Units Feature
- [ ] Locate documentation for fun-distance-units.json
- [ ] Plan attractive integration on ship pages

#### Logbook JSON Orphans
- [ ] Verify if assets/data/logbook/rcl/*.json files are dynamically loaded
- [ ] 50+ ship data files appear orphaned in analysis but may be used

---

**Task Count:** ~20-30 discrete tasks remaining (down from 80+) **[UPDATED 2025-12-01]**
**Completed Since Last Update (2025-12-01):**
- Protocol documentation verified complete (was listed as missing)
- Onboarding documentation reviewed and fixed
- ships.html Product→Thing schema fix (Google Search Console)
- **ICP-Lite: 100% complete** - all 226 pages ✅
  - 13 hub pages, 161 port pages, 50 ship pages, 2 tool pages
**Estimated Effort:** 12-20 hours for complete standardization (down from 60-80 hours)
**Priority:** Pattern standardization (author/article cards) across all pages

**Note:** This list created from comprehensive user audit on 2025-11-25, re-audited 2025-11-29 and 2025-12-01. Discovered most hub page ICP-Lite work already complete. Protocol documentation also exists. All tasks require matching reference pattern from index.html.

