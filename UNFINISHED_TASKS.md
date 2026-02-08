# Unfinished Tasks

**Purpose:** Active task queue. Only pending work lives here.
**Last Updated:** 2026-02-08 (Restructured from 4,836 → ~800 lines)
**Maintained by:** Claude AI

> **Archives:**
> - Historical audits moved to `.claude/archive/`
> - Competitor analyses moved to `.claude/audits/`
> - Completed tasks moved to `COMPLETED_TASKS.md`

---

## 📊 Current Codebase Status (2026-02-08)

| Asset | Count |
|-------|-------|
| Port pages | 380 |
| Ship pages | 292 |
| Restaurant pages | 472 |
| Inline styles | ~16,800 |
| Files with `<style>` | 25 |

---

## 🚢 Cruise Line Parity Gaps

| Cruise Line | Ships | Restaurants | Gap |
|-------------|-------|-------------|-----|
| RCL | 49 | 280 | ✅ Baseline |
| NCL | 20 | 78 | Partial |
| Virgin | 4 | 46 | Good ratio |
| MSC | 24 | 45 | Partial |
| Carnival | 48 | 23 | 🔴 Needs ~200+ |
| Celebrity | 29 | 0 | 🔴 Missing |
| Holland America | 46 | 0 | 🔴 Missing |
| Princess | 17 | 0 | 🔴 Missing |
| + 7 more lines | 54 | 0 | 🔴 Missing |

**Missing cruise lines entirely:** Disney (6 ships), Viking Ocean (11 ships)

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
