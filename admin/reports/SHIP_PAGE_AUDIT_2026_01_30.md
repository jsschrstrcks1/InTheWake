# Ship Page Comprehensive Audit — 2026-01-30

**Auditor:** Claude (Session: audit-ship-pages-UsCC9)
**Branch:** `claude/audit-ship-pages-UsCC9`
**Date:** 2026-01-30
**Scope:** All 15 cruise lines, all ship pages, cruise-lines directory pages

---

## Executive Summary

The In the Wake site covers **15 cruise lines** with **~308 ship HTML pages** across 16 ship directories (including a legacy `ships/explora/` duplicate). This audit identified **7 missing cruise-lines pages** and created stub pages for each with full site shell, navigation, and "coming soon" verbiage. The `cruise-lines.html` hub page was updated to link to the new pages instead of ship directory indexes.

### Key Findings

| Metric | Before Audit | After Audit |
|--------|-------------|-------------|
| Cruise-lines pages | 8 of 15 | **15 of 15** |
| cruise-lines.html links correct | 8 of 15 | **15 of 15** |
| Ship directories | 16 (incl. legacy explora/) | 16 (unchanged) |
| Total ship HTML files | ~308 | ~308 (unchanged) |
| Ship pages passing validation | ~106 (34%) | ~106 (34%) — unchanged, plan below |

---

## Cruise Line Coverage Matrix

### Tier 1: Mainstream Lines

| # | Cruise Line | cruise-lines/ page | ships/ directory | Ship count | Status |
|---|------------|-------------------|-----------------|------------|--------|
| 1 | Royal Caribbean | `royal-caribbean.html` (existed) | `ships/rcl/` | 50 | Full content page |
| 2 | Carnival | `carnival.html` (existed) | `ships/carnival/` | 49 | Full content page |
| 3 | Norwegian | `norwegian.html` (existed) | `ships/norwegian/` | 21 | Full content page |
| 4 | MSC Cruises | `msc.html` (existed) | `ships/msc/` | 25 | Full content page |
| 5 | Costa Cruises | **`costa.html` (NEW)** | `ships/costa/` | 10 | Coming Soon stub |

### Tier 2: Premium Lines

| # | Cruise Line | cruise-lines/ page | ships/ directory | Ship count | Status |
|---|------------|-------------------|-----------------|------------|--------|
| 6 | Celebrity Cruises | `celebrity.html` (existed) | `ships/celebrity-cruises/` | 30 | Full content page |
| 7 | Princess | `princess.html` (existed) | `ships/princess/` | 18 | Full content page |
| 8 | Holland America | `holland-america.html` (existed) | `ships/holland-america-line/` | 47 | Full content page |
| 9 | Cunard | **`cunard.html` (NEW)** | `ships/cunard/` | 5 | Coming Soon stub |
| 10 | Virgin Voyages | `virgin.html` (existed) | `ships/virgin-voyages/` | 5 | Full content page |

### Tier 3: Luxury Lines

| # | Cruise Line | cruise-lines/ page | ships/ directory | Ship count | Status |
|---|------------|-------------------|-----------------|------------|--------|
| 11 | Oceania Cruises | **`oceania.html` (NEW)** | `ships/oceania/` | 9 | Coming Soon stub |
| 12 | Regent Seven Seas | **`regent.html` (NEW)** | `ships/regent/` | 8 | Coming Soon stub |
| 13 | Seabourn | **`seabourn.html` (NEW)** | `ships/seabourn/` | 8 | Coming Soon stub |
| 14 | Silversea | **`silversea.html` (NEW)** | `ships/silversea/` | 13 | Coming Soon stub |
| 15 | Explora Journeys | **`explora-journeys.html` (NEW)** | `ships/explora-journeys/` | 7 | Coming Soon stub |

### Legacy/Duplicate Directory
- `ships/explora/` — Contains 3 files (explora-i.html, explora-ii.html, index.html). Appears to be a legacy duplicate of `ships/explora-journeys/`. Recommend consolidating in a future cleanup.

---

## Changes Made in This Audit

### 1. New Cruise-Lines Pages Created (7 files)

All new pages follow the established template pattern from existing pages (carnival.html, royal-caribbean.html) with:
- Soli Deo Gloria invocation
- AI-breadcrumbs metadata
- ICP-Lite v1.4 meta tags (ai-summary, last-reviewed, content-protocol)
- JSON-LD: BreadcrumbList, WebPage, FAQPage, Person
- Full site navigation (Planning, Tools, Onboard, Travel dropdowns)
- Hero header with compass rose
- Answer-first content with Quick Answer, Fit Guidance, Key Facts
- "Comprehensive Guides Coming Soon" section
- Fleet listing with links to all ship pages
- Related Resources grid
- FAQ section (3 questions each)
- Right rail (Quiz CTA, Author card, Recent Stories)
- Standard footer with trust badge
- Dropdown JS and Recent Articles rail script

**Files created:**
1. `cruise-lines/costa.html` — Costa Cruises (Italian heritage, 9 ships)
2. `cruise-lines/cunard.html` — Cunard (British ocean liner, 4 Queens)
3. `cruise-lines/oceania.html` — Oceania Cruises (Finest Cuisine at Sea, 8 ships)
4. `cruise-lines/regent.html` — Regent Seven Seas (All-inclusive luxury, 7 ships)
5. `cruise-lines/seabourn.html` — Seabourn (Ultra-luxury & expedition, 7 ships)
6. `cruise-lines/silversea.html` — Silversea (Italian elegance, 12 ships)
7. `cruise-lines/explora-journeys.html` — Explora Journeys (Modern ocean luxury, 6 ships)

### 2. cruise-lines.html Hub Page Updated (14 link changes)

Updated 14 references (7 JSON-LD + 7 HTML hrefs) from `/ships/{line}/` directory paths to `/cruise-lines/{line}.html` pages:
- `/ships/costa/` → `/cruise-lines/costa.html`
- `/ships/cunard/` → `/cruise-lines/cunard.html`
- `/ships/oceania/` → `/cruise-lines/oceania.html`
- `/ships/regent/` → `/cruise-lines/regent.html`
- `/ships/seabourn/` → `/cruise-lines/seabourn.html`
- `/ships/silversea/` → `/cruise-lines/silversea.html`
- `/ships/explora-journeys/` → `/cruise-lines/explora-journeys.html`

---

## Ship Page Health by Cruise Line

Based on the claude.md report: **106 of 311 ship pages (34%) currently pass validation** with **981 blocking errors** remaining. The breakdown by line requires per-page validation, but the general categories of issues are:

### Common Blocking Issues (from SHIP_PAGE_CHECKLIST_v3.010)
1. **Missing Soli Deo Gloria invocation** — Required before line 20
2. **Missing/incorrect ICP-Lite v1.4 meta tags** — ai-summary, last-reviewed, content-protocol
3. **JSON-LD schema mismatches** — description ≠ ai-summary, dateModified ≠ last-reviewed
4. **Missing mainEntity in JSON-LD** — Entity pages need Product/Place/Restaurant declaration
5. **Missing AI-breadcrumbs** — Structured context comments for entity identification
6. **Missing content sections** — 8 required sections per ship page
7. **Missing JSON-LD blocks** — 7 required per ship page
8. **Accessibility gaps** — WCAG AA violations (alt text, ARIA, skip links)
9. **Stale dates** — last-reviewed and dateModified not updated

---

## Plan to Bring All Ship Pages to 100/100

### Phase 1: Infrastructure & Validation (Priority: CRITICAL)
**Goal:** Establish baseline and fix blocking infrastructure issues

1. **Run full validation across all 308+ ship pages** — Use `node admin/validate-icp-lite-v14.js --all` to get exact error counts per file
2. **Fix Soli Deo Gloria invocations** — Batch ensure all pages have the invocation before line 20
3. **Fix ICP-Lite v1.4 meta tags** — Batch ensure ai-summary (dual-cap rule), last-reviewed, content-protocol on every page
4. **Fix JSON-LD mirroring** — Ensure description = ai-summary, dateModified = last-reviewed on every page

### Phase 2: Structural Compliance (Priority: HIGH)
**Goal:** All pages have required sections and schema

5. **Add missing AI-breadcrumbs** — entity, type, parent, category, cruise-line, ship-class, updated
6. **Add missing mainEntity JSON-LD** — Product type with manufacturer Organization
7. **Ensure 7 JSON-LD blocks per page** — WebPage, BreadcrumbList, FAQPage, Person, Organization, mainEntity, Review
8. **Ensure 8 required content sections** — Page intro, first look/dining, logbook, video, deck plans, FAQ, attributions
9. **Fix navigation consistency** — All pages should have the standard dropdown nav

### Phase 3: Content Quality (Priority: MEDIUM)
**Goal:** Rich, natural content meeting word count and quality standards

10. **Expand thin ship pages** — Target 2,500-6,000 words per page
11. **Add/improve FAQ sections** — Natural language, not robotic SEO copy
12. **Add logbook stories** — 6 traveler personas per ship
13. **Add image attributions** — Minimum 8 locally-hosted images with proper alt text
14. **Add fit-guidance sections** — Help users decide if this ship is right for them

### Phase 4: Premium & Luxury Lines (Priority: MEDIUM)
**Goal:** Bring 7 new cruise-lines pages from "Coming Soon" to full content

15. **Costa Cruises** — Expand with ship classes, experience section, gallery, search
16. **Cunard** — Expand with Queens detail, Grill dining, Transatlantic focus
17. **Oceania** — Expand with culinary focus, Jacques Pepin, ship classes
18. **Regent Seven Seas** — Expand with all-inclusive detail, Regent Suite, ship profiles
19. **Seabourn** — Expand with expedition detail, Thomas Keller, expedition ships
20. **Silversea** — Expand with S.A.L.T. program, expedition fleet, butler service
21. **Explora Journeys** — Expand with new-brand positioning, suite detail, dining experiences

### Phase 5: Polish & Optimization (Priority: LOW)
**Goal:** Performance, accessibility, and SEO refinements

22. **WCAG AA compliance sweep** — Full accessibility audit
23. **Performance optimization** — LCP preloads, image optimization, lazy loading
24. **Cross-link network** — Ensure ships link to restaurants, ports, and articles
25. **Consolidate legacy directories** — Merge `ships/explora/` into `ships/explora-journeys/`
26. **Update stale dates** — Refresh all last-reviewed and dateModified to current

### Estimated Scope
- **Phase 1:** ~308 pages (batch scriptable)
- **Phase 2:** ~308 pages (batch scriptable with manual review)
- **Phase 3:** ~200+ pages need content expansion (manual/AI-assisted)
- **Phase 4:** 7 pages (manual/AI-assisted)
- **Phase 5:** Site-wide sweep (tooling + manual)

### Success Criteria
- [ ] 311/311 ship pages pass validation (0 blocking errors)
- [ ] 15/15 cruise-lines pages have full content
- [ ] All JSON-LD mirroring correct
- [ ] All ICP-Lite v1.4 compliant
- [ ] All Soli Deo Gloria invocations present
- [ ] WCAG AA compliance across all pages

---

## Appendix: Ship Count by Directory

| Directory | Total HTML | Index | Ship Pages | Notes |
|-----------|-----------|-------|------------|-------|
| ships/rcl/ | 50 | 0 | 49 + venues.html | Largest fleet, includes retired ships |
| ships/carnival/ | 49 | 1 | 48 | Includes retired + future ships |
| ships/holland-america-line/ | 47 | 1 | 45 + none-announced.html | Heavy historical fleet |
| ships/celebrity-cruises/ | 30 | 1 | 29 | Includes retired + future ships |
| ships/msc/ | 25 | 1 | 24 | All active/near-active |
| ships/norwegian/ | 21 | 1 | 20 | All active + Pride of America |
| ships/princess/ | 18 | 1 | 17 | All active fleet |
| ships/silversea/ | 13 | 1 | 12 | Classic + expedition fleet |
| ships/costa/ | 10 | 1 | 9 | Active fleet |
| ships/oceania/ | 9 | 1 | 8 | Upper-premium fleet |
| ships/regent/ | 8 | 1 | 7 | All-suite luxury fleet |
| ships/seabourn/ | 8 | 1 | 7 | Luxury + expedition |
| ships/explora-journeys/ | 7 | 1 | 6 | New brand, 2 active + 4 future |
| ships/cunard/ | 5 | 1 | 4 | The four Queens |
| ships/virgin-voyages/ | 5 | 1 | 4 | Lady class fleet |
| ships/explora/ | 3 | 1 | 2 | LEGACY DUPLICATE |
| **TOTAL** | **308** | **14** | **~291 unique** | |

---

*Soli Deo Gloria*
