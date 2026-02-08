# Competitor Gap Analysis: Whatsinport

**Extracted from:** UNFINISHED_TASKS.md
**Date:** 2026-02-08

---

### 🟢 [G] Competitor Gap Analysis: WhatsInPort.com (NEW - 2025-12-31)
**Lane:** 🟢 Green (feature planning, content strategy)
**Analysis Date:** 2025-12-31
**Competitor:** [WhatsInPort.com](https://www.whatsinport.com/) — "Your cruise guide to 1200 cruise ports"

#### Context
WhatsInPort is a utility-focused port guide site with 900+ ports ([TripGuiderz](https://tripguiderz.com/2025/06/29/whatsinport/)). Their value proposition: quick, printable, practical port references for independent exploration. Analysis identifies both "table stakes" features to match AND unique niche opportunities they cannot fill.

---

#### PART A: Table Stakes (Match What They Do Well)

These are features WhatsInPort executes well that In The Wake should also offer:

##### A1. Printable "Quick Reference" Port Cards
**WhatsInPort strength:** Per [Charting Our Course](https://chartingourcourse.com/charting-our-course-blog/tools-whatsinport-port-planning): "Printable maps alongside transportation tips, enabling cruisers to navigate ports independently"
**Current In The Wake gap:** Interactive Leaflet maps exist (186/291 ports) but no print-optimized format
**Tasks:**
- [ ] Create print CSS for port pages (clean single-page output)
- [ ] Add "Print This Guide" button to port pages
- [ ] Generate downloadable PDF per port (Phase 1 of Port Map roadmap)
- [ ] Include: walking map, distances from pier, transport costs, top 5 POIs

##### A2. Standardized "From the Pier" Walking Distances
**WhatsInPort strength:** Per [TripGuiderz](https://tripguiderz.com/2025/06/29/whatsinport/): "Each guide includes top attractions, walking paths, and how far they are from the terminal"
**Current In The Wake state:** Distances mentioned in prose (e.g., `ports/san-juan.html:191`) but not in scannable format
**Tasks:**
- [ ] Design "From the Pier" callout box component
- [ ] Add to styles.css as `.pier-distances` component
- [ ] Standardize format: `Attraction: X min walk | $Y taxi`
- [ ] Pilot on 10 Caribbean ports, then roll out site-wide

##### A3. Transportation Cost Table
**WhatsInPort strength:** "Whats In Port lists taxi rates, public bus details, and sometimes ferry schedules"
**Current In The Wake state:** Info exists in "Getting Around" bullets but not visually distinct
**Tasks:**
- [ ] Design `.transport-costs` callout component
- [ ] Standardized fields: Taxi, Uber/Lyft, Bus, Ferry, Free shuttle
- [ ] Add to all 291 port pages

##### A4. Tender Port Index & Badge
**WhatsInPort strength:** Dedicated page at [whatsinport.com/Tender.html](https://www.whatsinport.com/Tender.html) with alphabetical tender port listing
**Current In The Wake gap:** No tender port index; no visual tender indicator on port pages
**Tasks:**
- [ ] Add `tender: true/false` field to `port-registry.json`
- [ ] Create tender port badge component (🚤 or anchor icon)
- [ ] Add badge to port page headers for tender ports
- [ ] Create `/ports/tender-ports.html` index page
- [ ] Link from ports.html navigation

---

#### PART B: Unique Niche Opportunities (Gaps WhatsInPort Cannot Fill)

These represent In The Wake's competitive advantages — areas where WhatsInPort has no presence:

##### B1. First-Person Storytelling & Emotional Connection ⭐ CORE DIFFERENTIATOR
**WhatsInPort gap:** Pure utility text with no personal voice or narrative
**In The Wake strength:** Logbook entries create emotional resonance ("The Moment That Stays With Me")
**Why it matters:** Per [Charting Our Course](https://chartingourcourse.com/charting-our-course-blog/tools-whatsinport-port-planning), users want "80% of what we need on one page" — but that remaining 20% is WHY to visit, not just HOW
**Tasks:**
- [ ] Ensure every port has "My Logbook" personal narrative section
- [ ] Add "The Moment That Stays With Me" highlight to all ports
- [ ] Create port storytelling template for consistency

##### B2. Ship Content Integration ⭐ UNIQUE FEATURE
**WhatsInPort gap:** Zero ship content — no ship pages, deck plans, videos, or ship selection tools
**In The Wake strength:** 178 ship pages, deck plans, 500+ videos, ship selection quiz, stateroom checker
**Opportunity:** "Which ships visit this port?" integration
**Tasks:**
- [ ] Add "Ships That Visit Here" section to port pages
- [ ] Pull from deployment data (ports.csv has ship assignments)
- [ ] Link ship pages from port pages bidirectionally
- [ ] Show ship photos on port pages for visual connection

##### B3. Gamification & Achievement Tracking ⭐ UNIQUE FEATURE
**WhatsInPort gap:** No user tracking, no achievements, no personalization
**In The Wake strength:** Port Logbook + Ship Logbook with achievement badges, percentile rankings
**Opportunity:** Deepen emotional investment through progress tracking
**Tasks:**
- [x] Add "Add to My Logbook" button on each port page — **368 ports** deployed (2026-02-06)
- [x] Show user's visited status on port pages (if tracked) — toggle button shows "Added" state
- [x] Create region completion achievements (Caribbean Bingo, etc.) — 8 regions + 3 regional + 5 milestones in Port Tracker
- [ ] Phase 2: "My Cruising Journey" world map visualization (see Leaflet roadmap)

##### B4. Restaurant & Dining Venue Depth ⭐ UNIQUE FEATURE
**WhatsInPort gap:** No dining content whatsoever
**In The Wake strength:** 215+ restaurant/venue pages with menus, pricing, reviews
**Opportunity:** "Where to Eat" becomes a port planning feature
**Tasks:**
- [ ] Add "Recommended Dining" section to port pages (for ports with signature local food)
- [ ] Cross-link restaurant pages for on-ship dining venue previews
- [ ] Consider local restaurant recommendations for major ports

##### B5. Planning Tools Integration
**WhatsInPort gap:** No calculators, quizzes, or planning tools
**In The Wake strength:** Drink Calculator, Ship Selection Quiz, Stateroom Checker, Packing Lists
**Opportunity:** Connect tools to port context
**Tasks:**
- [ ] Add "Pre-Cruise Planning" links in port page sidebar
- [ ] "Cruising from here?" section for homeport pages linking to planning tools
- [ ] Consider port-specific packing suggestions (glacier gear for Alaska, etc.)

##### B6. Accessibility Information ⭐ MARKET GAP
**WhatsInPort gap:** No accessibility information visible
**In The Wake strength:** WCAG 2.1 AA compliance, accessibility.html, disability-at-sea.html
**Opportunity:** Become THE resource for accessible cruise port information
**Tasks:**
- [ ] Add accessibility section to port pages (wheelchair access, terrain difficulty, tender accessibility)
- [ ] Create "Accessible Ports" filter/index page
- [ ] Partner with accessibility-focused cruise communities for content
- [ ] Add mobility ratings (flat/hilly, cobblestones, distances)

##### B7. Cultural & Historical Context
**WhatsInPort gap:** Minimal cultural depth — utility focus only
**In The Wake strength:** UNESCO heritage mentions, historical context, cultural significance
**Opportunity:** Answer "Why should I care about this place?" not just "How do I get around?"
**Tasks:**
- [ ] Ensure every port has historical/cultural context paragraph
- [ ] Add UNESCO World Heritage callouts where applicable
- [ ] Include local customs, tipping practices, language tips

##### B8. Visual Excellence & Photography
**WhatsInPort gap:** Functional but visually plain
**In The Wake strength:** Professional photography, hero images, photo galleries
**Opportunity:** Make port pages aspirational, not just informational
**Tasks:**
- [ ] Ensure every port has quality hero image
- [ ] Add photo galleries to major ports
- [ ] Maintain consistent visual design language

##### B9. DIY vs. Ship Excursion Cost Comparison
**WhatsInPort strength:** Mentions money-saving but doesn't quantify
**Opportunity:** Actually show the math
**Tasks:**
- [ ] Add "DIY vs. Excursion" comparison callout for major attractions
- [ ] Format: "Ship excursion: $X | DIY: $Y | You save: $Z"
- [ ] Include logistics notes (transport, admission, timing)

##### B10. Seasonal & Weather Context
**WhatsInPort gap:** No seasonal or weather information
**In The Wake opportunity:** Already planned (see Port Weather Guide section below)
**Tasks:** See Port Weather Guide Integration section

---

#### Priority Matrix

| Feature | Effort | Impact | Priority |
|---------|--------|--------|----------|
| Tender Port Index | Low | Medium | P1 |
| "From the Pier" Distances | Medium | High | P1 |
| Print CSS / PDF | Medium | High | P1 |
| Ships That Visit Here | Low | High | P1 |
| Transport Cost Table | Low | Medium | P2 |
| Accessibility Sections | High | High | P2 |
| DIY vs. Excursion | Medium | Medium | P2 |
| Add to My Logbook button | Low | Medium | P2 |
| Region Achievements | Medium | Medium | P3 |
| Local Restaurant Recs | High | Low | P3 |

---

#### Strategic Summary

**WhatsInPort = Utility** (quick reference, printable, practical)
**In The Wake = Experience** (stories, immersion, tools, journey tracking)

In The Wake should NOT become WhatsInPort — the differentiation (storytelling, ship content, gamification, tools) is the moat. However, adding their practical quick-reference elements fills genuine usability gaps without diluting the brand.

**Quick Wins (implement first):**
1. Tender port index + badge
2. "From the Pier" distance callout box
3. "Ships That Visit Here" section
4. Print-friendly CSS

**Unique Niche to Protect:**
1. First-person logbook storytelling
2. Ship-port integration (no competitor has this)
3. Achievement/tracking gamification
4. Accessibility depth

---