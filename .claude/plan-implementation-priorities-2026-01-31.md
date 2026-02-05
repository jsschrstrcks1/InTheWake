# Implementation Priority Plan — 2026-01-31

**Created by:** Claude AI (Thread Review & Planning Pass)
**Context:** Comprehensive review of all previous threads, 1,077 PRs, 13 unfinished work streams
**Branch:** `claude/review-previous-work-ZMk3b`

---

## Executive Summary

The project has 7,858 files across 587 directories, 380 port pages, 293+ ship pages, 215 restaurant pages, and a sophisticated Claude Code skill system (9 rules, 5 plugins, 3 hooks). After deep ground-truth verification (2026-01-31), many previously-reported "incomplete" items are actually done. **~6 genuinely incomplete work streams remain**. This plan prioritizes them by impact, effort, and strategic value.

---

## Tier 1: High Impact, Low-Medium Effort (Do Next)

### ~~1. "Ships That Visit Here" Port Page UI Component~~ ✅ ALREADY COMPLETE
**Status:** Verified COMPLETE 2026-01-31. `ship-port-links.js` (v1.14.0, 457 lines) fully deployed to all 380 port pages and 297 ship pages with bidirectional linking, brand colors, and class ordering for 15 cruise lines.

---

### ~~2.~~ 1. Documentation Consistency Fixes
**Priority:** HIGH — Prevents confusion for future threads
**Effort:** LOW
**Lane:** Green

**Tasks:**
1. Fix `admin/claude/CLAUDE.md`: Update ICP-Lite v1.0 → v1.4, port count 147 → 374+, priorities section
2. Fix `claude.md` (root): Fix `admin/UNFINISHED-TASKS.md` reference → `UNFINISHED_TASKS.md`, verify ship page count
3. Update `IN_PROGRESS_TASKS.md` with current active work
4. Clean up stale remote branches (all 7 can be deleted)

**Estimated scope:** 1 session (30 min)

---

### ~~3. Venue Audit Phase 2~~ ✅ ALREADY COMPLETE
**Verified 2026-01-31:** 0 generic text, 0 hotdog.webp, all have real menus. Validator v2 integrated into unified `admin/validate.js`.

---

## Tier 2: High Impact, Medium Effort (Near-Term)

### 4. CSS Consolidation — PARTIALLY COMPLETE
**Completed 2026-01-31:**
- [x] `.page-grid` canonical definition already exists in styles.css (line 318)
- [x] Restaurant card watermark CSS extracted to styles.css, 124 inline blocks removed
- [x] Carnival index deduplicated from 4 `<style>` blocks to 2
- [x] Carnival `.page-grid` override (`1fr 320px`) is intentional — kept as inline

**Remaining:**
- [ ] 12 ship fleet index pages still have `.ship-list` inline blocks (class name conflict with logbook `.ship-list` in styles.css — needs rename or scoping)
- [ ] ~12 misc pages have unique inline styles (solo.html, first-cruise.html, etc.) — genuinely page-specific, may not need extraction

---

### ~~5. Port Map Completion~~ ✅ ESSENTIALLY COMPLETE
**Verified 2026-01-31:** 375/380 (99%) port pages have Leaflet maps. Only 5 pages remain. Not a meaningful work stream.

---

### 6. Competitor Gap Quick Wins (Remaining ~7 Items)
**Priority:** MEDIUM-HIGH — Competitive differentiation
**Effort:** MIXED
**Lane:** Green/Yellow

**Verified complete:** first-cruise.html, countdown.html, affiliate-disclosure.html, accessibility on 376/380 ports, print CSS (exists in multiple CSS files), transport data on 10 ports, 7 solo articles

**Genuinely remaining:**
1. "From the Pier" distance component — design + pilot on 10 Caribbean ports
2. "Add to My Logbook" button on port pages
3. "Real Talk" honest assessment callouts
4. DIY vs. Excursion comparison callouts
5. Region completion achievements
6. Port Day Planner worksheet
7. Cruise Budget Calculator

**Estimated scope:** 3-4 sessions

---

## Tier 3: Medium Impact, Higher Effort (Plan Ahead)

### ~~7. Ship Page CSS Rollout~~ ✅ COMPLETE
**Completed 2026-01-31:** `ship-page.css` (v3.010.300) linked on 292/292 ship pages (100%). 162 pages added across 14 cruise lines. All selectors namespaced — zero visual impact on pages not yet using those classes.

---

### 8. Site-Wide Hero/Logo Standardization
**Priority:** MEDIUM — User-reported visual inconsistencies
**Effort:** MEDIUM
**Lane:** Green

Fix: index.html, ships.html, solo.html, travel.html, cruise-lines.html, ship-tracker.html, accessibility.html all have different hero sizes and logo positions.

---

### ~~9. Service Worker v14 Upgrade~~ ✅ COMPLETE
**Completed 2026-01-31:** Upgraded sw.js 13.2.0 → 14.0.0. Added warmCalculatorShell predictive prefetch (7 calculator assets cached on homepage/planning visits). Added 12hr FX API stale cache. Updated precache-manifest.json and sw-bridge.js. CORS type check analyzed and determined unnecessary (response.ok already covers CORS).

---

### 10. Port Weather Seasonal Data Population
**Priority:** MEDIUM — Infrastructure deployed, data missing
**Effort:** HIGH (research for 379 ports)
**Lane:** Green/Yellow

**Verified 2026-01-31:** `port-weather.js` (373 lines) loaded on 380 pages, `weather-guide` section on 375 pages, but `seasonal-guides.json` has data for only 1 port (Cozumel). Start with top 20 high-traffic ports, then batch by region.

---

## Tier 4: Requires User Decision

### 11. Affiliate Link Deployment
**Priority:** USER DECISION NEEDED
**Lane:** Red
**Question:** Proceed with Amazon affiliate links or maintain "No affiliate links" trust messaging?
- If YES: Need trust badge updates, FTC disclosures, duck tradition article
- If NO: Close out plan, archive `.claude/plan-affiliate-deployment.md`

### 12. Pastoral Articles (Red Lane)
**Priority:** HIGH (content gap) but HUMAN-ONLY
**Lane:** Red
- Healing Relationships at Sea
- Rest for Wounded Healers
- (Note: 7 solo articles already exist; Solo Travel Safety Tips may be covered)

### ~~13. Quiz V2 Multi-Line Expansion~~ ✅ MOSTLY COMPLETE
**Verified 2026-01-31:** `ship-quiz-data-v2.json` model v2.1 covers 15 cruise lines. Only ongoing maintenance needed.

---

## Recommended Session Sequencing

| Session | Work | Tier |
|---------|------|------|
| ~~**1-3**~~ | ~~Audit, docs, venue, maps, quiz, stateroom, CSS consolidation (restaurants + Carnival), ship-page.css rollout (292/292)~~ ✅ All done | ~~Done~~ |
| ~~**4**~~ | ~~SW v14.0.0, sitemap regen (1,154 URLs), docs consistency, guardrail~~ ✅ Done | ~~Done~~ |
| **Next** | Competitor gap: "From the Pier" + logbook buttons | Tier 2 |
| **+1** | Competitor gap: Real Talk + DIY vs Excursion callouts | Tier 2 |
| **+2** | Port weather data: Top 20 Caribbean ports | Tier 3 |
| **+3** | Hero/logo standardization | Tier 3 |

---

## Key Metrics to Track

| Metric | Current (deep audit 2026-01-31) | Target |
|--------|---------|--------|
| Ship pages with ship-page.css | 292/292 (100%) ✅ | ✅ Done |
| Port pages with maps | 375/380 (99%) ✅ | 380/380 (100%) |
| Venue pages remediated | 215/215 (100%) ✅ | ✅ Done |
| Ports with weather seasonal data | 1/380 (<1%) | 50+ (13%+) |
| Restaurant `<style>` blocks | 0 remaining ✅ | ✅ Done |
| Ship `<style>` blocks | 13 remaining | 0 |
| Competitor gap initiatives | 9/16 (~56%) | 14/16 (88%) |
| "Ships That Visit" UI deployed | 380/380 (100%) ✅ | ✅ Done |
| Stateroom exception JSONs | 270 across all lines ✅ | ✅ Done |
| Quiz v2 cruise line coverage | 15/15 (100%) ✅ | ✅ Done |

---

## ~~Stale Branches to Delete~~ ✅ ALREADY CLEANED UP

Verified 2026-01-31: Only 2 remote branches exist (`origin/main`, `origin/claude/review-previous-work-ZMk3b`). The 7 previously-listed stale branches have already been deleted.

---

**Soli Deo Gloria**
