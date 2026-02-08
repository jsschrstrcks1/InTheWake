# Competitor Gap Analysis: Cruisemapper

**Extracted from:** UNFINISHED_TASKS.md
**Date:** 2026-02-08

---

### 🟢 [G] Competitor Gap Analysis: CruiseMapper (NEW - 2025-12-31)
**Lane:** 🟢 Green (feature planning, content strategy)
**Analysis Date:** 2025-12-31
**Competitor:** [CruiseMapper.com](https://www.cruisemapper.com/) — "Cruise Ship Tracker, Itineraries, Schedules, Deck Plans"

#### Context
CruiseMapper is a utility-focused cruise information platform specializing in **real-time ship tracking** via AIS (Automatic Identification System) technology. Per [Cruise.Blog](https://cruise.blog/2024/01/how-track-cruise-ship), "CruiseMapper appears first in Google searches for ship locations" and provides "the most comprehensive information on cruise lines, cruise ships and ports." Their mobile app has 3.5-4 stars ([App Store](https://apps.apple.com/us/app/cruisemapper/id1032294427), [Google Play](https://play.google.com/store/apps/details?id=com.astrapaging.cm)), with 320+ ships across 30 cruise lines tracked. Their unique feature is "Cruise Minus" — an incident/accident database with 4,370 reports across 626 vessels.

---

#### PART A: Table Stakes (Match What They Do Well)

##### A1. Deck Plans & Cabin Category Details
**CruiseMapper strength:** Per [cruisemapper.com/deckplans](https://www.cruisemapper.com/deckplans): "967 vessels with cruise cabin reviews, and a total of 6,022 cruise line stateroom layouts" including floor plans, room types, deck locations, cabin sizes, and en-suite amenities
**Current In The Wake state:** Ship pages have deck plan links; Stateroom Checker has cabin exceptions for 50 ships
**Assessment:** Already competitive — Stateroom Checker is MORE useful (personalized cabin advice vs. just browsing layouts)
**Tasks:**
- [ ] Ensure deck plan links are prominent on all ship pages
- [ ] Verify deck plan PDFs load correctly for all 50 ships
- [ ] Consider adding cabin size/amenity quick facts to ship pages (if not present)

##### A2. Ship Technical Specifications
**CruiseMapper strength:** Each ship page includes: year built, last refurbishment, capacity (passengers + crew), total cabins, number of decks, restaurants, lounges, swimming pools
**Current In The Wake state:** Ship pages have quick-facts blocks with tonnage, capacity, maiden voyage, refurbishment
**Assessment:** Already have this — verify consistency across all ship pages
**Tasks:**
- [ ] Audit ship quick-facts for completeness across all 50 ships
- [ ] Ensure refurbishment dates are current (CruiseMapper notes "scheduled refurbishments")
- [ ] Add crew count and total deck count if missing

##### A3. Port Schedules by Ship
**CruiseMapper strength:** Per [cruisemapper.com/ports](https://www.cruisemapper.com/ports): "Ships in port, real-time port maps, cruise terminals information" with schedule timetables showing all departure dates and ships in port by date
**Current In The Wake state:** Static ship deployment pages; ports.csv has ship assignments but not dynamic schedules
**Assessment:** Real-time schedules require live data integration — likely not worth the effort
**Recommendation:** Keep static deployment info; promote "Ships That Visit Here" from WhatsInPort analysis
**Tasks:** Already documented in recommendation #4 — "Ships That Visit Here" section

---

#### PART B: Unique Niche Opportunities (Gaps CruiseMapper Cannot Fill)

##### B1. "Cruise Minus" Transparency — Incident Awareness ⭐ INTERESTING OPPORTUNITY
**CruiseMapper strength:** Per [cruisemapper.com/accidents](https://www.cruisemapper.com/accidents): "Cruise Minus" database with "4,370 accidents and incidents reports" including "illness outbreaks, crew and passenger deaths-injuries-crimes, maritime disasters, and law news updates"
**Example:** Icon of the Seas page lists fires (2023 construction, 2024 engine room), overboard incidents (2024 passenger rescued, 2025 crew death)
**Current In The Wake gap:** No incident/safety information on ship pages
**Assessment:** Sensitive topic — but transparency builds trust. Cruise Minus proves users want this info.
**Opportunity:** Add "Known Issues" or "What to Know" safety transparency section to ship pages
**Tasks:**
- [ ] Research approach: "Known issues" section OR "Real talk" honest assessment
- [ ] Add maintenance/drydock history to ship pages (already in quick-facts for some)
- [ ] Consider brief, factual safety context where relevant (e.g., "ship was refurbished after [incident]")
- [ ] Do NOT create fear — focus on informed awareness and trust building

##### B2. Single-Voice Curation vs. Utility Aggregation ⭐ CORE DIFFERENTIATOR
**CruiseMapper gap:** Pure data aggregation — no narrative, no opinion, no personality
**In The Wake strength:** First-person logbook entries, honest assessments, emotional connection
**Why it matters:** CruiseMapper tells you WHAT the ship has; In The Wake tells you what it FEELS like to sail on it
**Tasks:** Already documented — continue single-voice storytelling

##### B3. Planning Tools ⭐ UNIQUE FEATURE
**CruiseMapper gap:** Zero interactive tools — no calculators, quizzes, or personalized recommendations
**In The Wake strength:** Drink Calculator, Ship Selection Quiz, Stateroom Checker, Packing Lists
**Why it matters:** CruiseMapper is passive reference; In The Wake actively helps you plan
**Tasks:** Already documented — continue tool development

##### B4. Restaurant & Dining Depth ⭐ UNIQUE FEATURE
**CruiseMapper gap:** No dining content — only mentions "restaurants and bars" count in specs
**In The Wake strength:** 215+ restaurant pages with menus, pricing, reviews
**Tasks:** Already documented — continue dining venue development

##### B5. Accessibility Focus ⭐ MARKET GAP
**CruiseMapper gap:** No accessibility information visible
**In The Wake strength:** WCAG 2.1 AA compliance, accessibility.html, disability-at-sea.html
**Tasks:** Already documented — continue accessibility depth

##### B6. Faith-Based Perspective ⭐ UNIQUE NICHE
**CruiseMapper gap:** Secular, utility-only content
**In The Wake strength:** "Soli Deo Gloria" foundation, pastoral content
**Tasks:** Already documented — continue faith-based content

##### B7. No Ads, No Commercial Pressure ⭐ TRUST DIFFERENTIATOR
**CruiseMapper gap:** User complaints about ads — per [App Store reviews](https://apps.apple.com/us/app/cruisemapper/id1032294427): "pornographic sexually oriented ads" with "malicious redirects to Temu app"
**In The Wake strength:** No ads, no affiliate links, no sponsored content
**Opportunity:** Reinforce "ad-free" positioning as explicit trust signal
**Tasks:** Already documented in recommendation #2 — "No ads" trust messaging

##### B8. Reliable, Clean User Experience ⭐ QUALITY DIFFERENTIATOR
**CruiseMapper gap:** Per app reviews: "Tracking is completely wrong — ships are days behind," app glitches, zoom function reverses, limited filters (only 10 cruise lines)
**In The Wake strength:** Consistent, tested, quality-focused web experience
**Opportunity:** Reliability and polish as competitive advantage
**Tasks:**
- [ ] Continue quality-first development approach
- [ ] Ensure all interactive features work consistently
- [ ] Test on mobile devices regularly

##### B9. Gamification & Journey Tracking ⭐ UNIQUE FEATURE
**CruiseMapper gap:** No user engagement features — no logbook, no achievements, no personalization
**In The Wake strength:** Port Logbook + Ship Logbook with achievement badges, percentile rankings
**Tasks:** Already documented — continue gamification development

---

#### What They Do Better (Learn From)

| Feature | CruiseMapper | In The Wake | Action |
|---------|--------------|-------------|--------|
| **Live ship tracking** | Real-time AIS positions | None | NOT building — not our focus |
| **Incident database** | 4,370 reports across 626 ships | None | Consider honest "Known Issues" approach |
| **Deck plan coverage** | 967 vessels, 6,022 layouts | 50 ships with deck plan links | Already sufficient — focus on depth |
| **Port schedules** | Real-time ships-in-port | Static deployment info | "Ships That Visit Here" — already planned |

---

#### Priority Matrix

| Feature | Effort | Impact | Priority |
|---------|--------|--------|----------|
| Ship quick-facts audit | Low | Medium | P2 |
| "Known Issues" research | Low | Medium | P2 |
| Ad-free trust messaging | Low | High | P1 (already planned) |
| Real-time ship tracking | High | Low | P4 (not recommended) |

---

#### Strategic Summary

**CruiseMapper = Utility Data + Live Tracking**
**In The Wake = Curation + Tools + Storytelling + Trust**

CruiseMapper's moat is real-time ship tracking and comprehensive technical data. They serve users who want to know "where is my ship right now?" — a need In The Wake doesn't address and shouldn't try to. However, their "Cruise Minus" incident transparency is interesting: it proves users want honest safety information. In The Wake could adopt this philosophy through "Real Talk" honest assessments rather than exhaustive incident databases.

**Key insight:** CruiseMapper's user complaints (inaccurate tracking, ads, app glitches) reveal the cost of scale without curation. In The Wake's quality-first, ad-free, curated approach is the antidote.

**What to adopt:**
1. Ship quick-facts audit for consistency (refurbishment dates, deck counts)
2. Consider "Known Issues" transparency on ship pages (philosophical match with honest assessments)
3. Reinforce ad-free positioning (they have explicit ad problems)

**What NOT to adopt:**
- Real-time ship tracking (different product category entirely)
- Port schedules by date (requires live data integration)
- Incident database (too morbid; "Real Talk" approach is better fit)

---