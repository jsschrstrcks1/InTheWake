# Implementation Priority Plan — 2026-01-31

**Created by:** Claude AI (Thread Review & Planning Pass)
**Context:** Comprehensive review of all previous threads, 1,077 PRs, 13 unfinished work streams
**Branch:** `claude/review-previous-work-ZMk3b`

---

## Executive Summary

The project has 7,858 files across 587 directories, 374+ port pages, 311+ ship pages, 215 restaurant pages, and a sophisticated Claude Code skill system (8 rules, 5 plugins, 3 hooks). After reviewing all prior work, **13 major work streams are incomplete**. This plan prioritizes them by impact, effort, and strategic value.

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

### 3. Venue Audit Phase 2 — Template Fix + Bulk Remediation
**Priority:** HIGH — 215 pages have "semantic lies" undermining trust
**Effort:** MEDIUM (validator already built, patterns identified)
**Lane:** Green (template/technical fix)

**Tasks:**
1. Fix `generate_restaurant_pages.py` template: add menu section, fix tone matching by venue type
2. Bulk-fix the 5 most egregious pages (Dog House, etc.) as pilot
3. Remove duplicated stock images from generated pages
4. Run `validate-venue-page-v2.js` to track remediation progress

**Estimated scope:** 2-3 sessions

---

## Tier 2: High Impact, Medium Effort (Near-Term)

### 4. CSS Consolidation Phase 3 — Resolve .page-grid Conflict
**Priority:** HIGH — Blocks Phase 4-5 which remove 50K+ duplicate lines
**Effort:** MEDIUM
**Lane:** Green

**Tasks:**
1. Audit and define canonical `.page-grid` in styles.css
2. Remove redundant `.page-grid` from all `<style>` blocks (478 files)
3. Verify no visual regressions

**Estimated scope:** 1-2 sessions

---

### 5. Port Map Completion — Remaining 105 Ports
**Priority:** MEDIUM-HIGH — 64% done, finish the job
**Effort:** MEDIUM (pattern established, just more ports)
**Lane:** Green

**Tasks:**
1. Create map manifests for 105 remaining ports
2. Catalog ~500-700 POIs across those ports
3. Add Leaflet maps to port pages
4. Roll out mobile responsiveness CSS v2.0.0 to all ports

**Estimated scope:** 3-4 sessions (batch by region)

---

### 6. Competitor Gap Quick Wins (Remaining 10 Items)
**Priority:** MEDIUM-HIGH — Competitive differentiation
**Effort:** MIXED
**Lane:** Green/Yellow

**In priority order:**
1. "From the Pier" distance component — design + pilot on 10 Caribbean ports
2. Port Print CSS — clean single-page print output
3. Transport cost callout table component
4. "Add to My Logbook" button on port pages
5. "Real Talk" honest assessment callouts
6. DIY vs. Excursion comparison callouts
7. Accessibility sections on port pages
8. Region completion achievements
9. Port Day Planner worksheet
10. Cruise Budget Calculator

**Estimated scope:** 4-6 sessions (spread across multiple sprints)

---

## Tier 3: Medium Impact, Higher Effort (Plan Ahead)

### 7. Ship Page Standardization (311+ pages)
**Priority:** MEDIUM — Visual consistency
**Effort:** HIGH
**Lane:** Green

**Approach:** Create `ship-page.css` first, then batch-update by cruise line.
1. Phase 1: Extract shared CSS
2. Phase 2: 50 RCL ship pages
3. Phase 3: 48 Carnival ship pages
4. Phase 4: Header standardization site-wide

---

### 8. Site-Wide Hero/Logo Standardization
**Priority:** MEDIUM — User-reported visual inconsistencies
**Effort:** MEDIUM
**Lane:** Green

Fix: index.html, ships.html, solo.html, travel.html, cruise-lines.html, ship-tracker.html, accessibility.html all have different hero sizes and logo positions.

---

### 9. Service Worker v14 Upgrade
**Priority:** MEDIUM — Offline reliability for drink calculator
**Effort:** MEDIUM
**Lane:** Green

Key: CORS fix (8 functions), warmCalculatorShell prefetch, cache refresh UI.

---

### 10. Port Weather Guide Rollout
**Priority:** MEDIUM — 329/333 ports lack weather data
**Effort:** HIGH (data research for 329 ports)
**Lane:** Green/Yellow

Start with top 20 high-traffic ports, then batch by region.

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
- Solo Travel Safety Tips

### 13. Quiz V2 Multi-Line Expansion
**Priority:** LOW for now
**Lane:** Yellow
**Blocked by:** Multi-line content expansion (currently RCL-focused)

---

## Recommended Session Sequencing

| Session | Work | Tier |
|---------|------|------|
| ~~**Next**~~ | ~~"Ships That Visit Here" UI~~ ✅ Already complete | ~~Tier 1~~ |
| ~~**+1**~~ | Documentation fixes ✅ Done this session | ~~Tier 1~~ |
| **+2** | Venue audit Phase 2 pilot (5 worst pages) | Tier 1 |
| **+3** | CSS .page-grid resolution | Tier 2 |
| **+4** | "From the Pier" + Print CSS components | Tier 2 |
| **+5** | Port maps batch (Europe) | Tier 2 |
| **+6** | Port maps batch (Caribbean + misc) | Tier 2 |
| **+7** | Ship page standardization Phase 1 | Tier 3 |
| **+8** | Hero/logo standardization | Tier 3 |

---

## Key Metrics to Track

| Metric | Current (verified 2026-01-31) | Target |
|--------|---------|--------|
| Ship validation passing | 106/297 (36%) | 250+ (80%) |
| Port pages with maps | 375/380 (99%) ✅ | 380/380 (100%) |
| Venue pages remediated | ~215/215 (99%) ✅ | 215/215 (100%) |
| Ports with weather guides | 4/333 (1%) | 50+ (15%+) |
| Restaurant `<style>` blocks | 124 remaining | 0 |
| Ship `<style>` blocks | 13 remaining | 0 |
| Competitor gap initiatives | 7/16 (44%) | 12/16 (75%) |
| "Ships That Visit" UI deployed | 380/380 (100%) ✅ | ✅ Done |

---

## Stale Branches to Delete

These 7 branches have no unmerged changes and can be cleaned up:
- `claude/affiliate-deployment-plan-Twqff`
- `claude/audit-competitor-gaps-0zTZ0`
- `claude/audit-ship-pages-UsCC9`
- `claude/audit-venues-gD9fq`
- `claude/identify-maintenance-tasks-FN2lh`
- `claude/review-context-onboarding-ZZauz`
- `claude/validate-ship-pages-5Z2jp`

---

**Soli Deo Gloria**
