# Venue Audit Report — 2026-01-31

> Branch: `claude/audit-venues-gD9fq`
> Validator: `admin/validate-venue-page-v2.js` v2.0.0
> Data: `data/validated-venues.json`

---

## Executive Summary

**472 venue pages across 5 cruise lines. 100% pass rate. 0 critical errors.**

All venue pages pass validation with only W01 warnings (stock images — no venue-specific photography available). Every technical check (T01–T10), semantic check (S01–S06), and quality check passes.

### Before vs After

| Metric | Phase 1 Audit (Jan 28) | Phase 2 Complete (Jan 31) |
|--------|----------------------|--------------------------|
| Total pages | 215 | **472** (+257 new) |
| Cruise lines with venues | 1 (RCL generic) | **5** (RCL, Carnival, NCL, MSC, Virgin) |
| Failed validation | 139 (64.7%) | **0 (0%)** |
| Warnings only | 76 (35.3%) | **472 (100%)** |
| Clean pass | 0 (0%) | 0 (W01 only) |
| Missing Google Analytics | 129 pages | **0** |
| Generic template review text | 104 pages | **0** |
| Image over-duplication | 116 pages | **0** |
| Missing menu sections | 43 pages | **0** |
| Dress code mismatches | 10 pages | **0** |
| Generic FAQ contamination | 80 pages | **0** |

---

## Pages by Cruise Line

| Cruise Line | Directory | Pages | Pass Rate |
|-------------|-----------|-------|-----------|
| Royal Caribbean (generic) | `restaurants/` | 280 | 100% |
| NCL | `restaurants/ncl/` | 78 | 100% |
| Virgin Voyages | `restaurants/virgin/` | 46 | 100% |
| MSC Cruises | `restaurants/msc/` | 45 | 100% |
| Carnival | `restaurants/carnival/` | 23 | 100% |
| **Total** | | **472** | **100%** |

---

## Pages by Venue Style

| Style | Count | % of Total | Pass Rate |
|-------|-------|------------|-----------|
| Entertainment | 117 | 24.8% | 100% |
| Bar | 115 | 24.4% | 100% |
| Casual Dining | 83 | 17.6% | 100% |
| Specialty | 60 | 12.7% | 100% |
| Activity | 37 | 7.8% | 100% |
| Counter-Service | 25 | 5.3% | 100% |
| Fine Dining | 16 | 3.4% | 100% |
| Neighborhood | 12 | 2.5% | 100% |
| Coffee | 4 | 0.8% | 100% |
| Dessert | 3 | 0.6% | 100% |

---

## Validation Checks (40 checks per page)

### Technical Checks (T01–T10)

| Code | Check | Status |
|------|-------|--------|
| T01 | Image duplication limit | All pass |
| T02 | Menu section on dining venues | All pass |
| T03 | Google Analytics (G-WZP891PZXJ) | All pass |
| T04 | Umami Analytics | All pass |
| T05 | Required content sections (overview, accommodations, availability, logbook, FAQ, sources) | All pass |
| T06 | Theological foundation (Soli Deo Gloria, Proverbs 3:5, Colossians 3:23) | All pass |
| T07 | ICP-Lite v1.4 protocol tags (ai-summary, last-reviewed, content-protocol) | All pass |
| T08 | JSON-LD schemas (WebPage, BreadcrumbList, FAQPage) | All pass |
| T09 | WCAG accessibility (skip link, lang, roles) | All pass |
| T10 | Navigation elements (nav-toggle, site-nav, dropdowns) | All pass |

### Semantic Checks (S01–S06)

| Code | Check | Status |
|------|-------|--------|
| S01 | No generic template review text | All pass |
| S02 | No generic "best for" text | All pass |
| S03 | Dress code matches venue type | All pass |
| S04 | FAQ relevant to venue type | All pass |
| S05 | Stock images appropriate for venue type | All pass |
| S06 | Content promises match delivery | All pass |

### Quality Warnings (W01–W05)

| Code | Check | Status |
|------|-------|--------|
| W01 | Venue-specific images | **472 warnings** — all pages use stock images |
| W02 | Template-length detection | All pass |
| W03 | Author card / right rail | All pass |
| W04 | OG/Twitter image tags | All pass |
| W05 | Last-reviewed freshness (<180 days) | All pass |

---

## Remaining Work

### W01: No venue-specific images (all 472 pages)

Every page uses stock photography (`buffet.webp`, `cocktail.webp`, `croissant.webp`, etc.) rather than venue-specific images. This is a content sourcing limitation, not a code issue. Available stock images:

- `bar-lounge.webp` — bars and lounges
- `buffet.webp` — buffet and casual dining
- `cocktail-lounge.webp` — cocktail bars
- `cocktail.webp` — bar content
- `croissant.webp` — cafes and bakeries
- `formal-dining.webp` — fine dining and specialty
- `hotdog.webp` — Boardwalk Dog House only
- `italian.webp` — Italian restaurants
- `pizza.webp` — pizza venues
- `sushi.webp` — Japanese/sushi restaurants
- `tacos.webp` — Mexican restaurants

**Resolution requires:** Licensing or creating venue-specific photographs. This is a content task, not a code task.

### ~~85 "unknown" style venues~~ ✅ RESOLVED (2026-02-01)

All 85 previously-unknown venues have been classified into venue metadata:
- **72 RCL entertainment** shows/productions added to `venues-v2.json` (ice shows, Broadway musicals, AquaTheater, Two70 productions)
- **3 RCL activities** (Boardwalk Carousel, Rock Climbing Wall, Dining Activities & Classes) added to `venues-v2.json`
- **11 Virgin bars** already existed in `virgin-venues.json` — fixed `category: "bar"` → `"bars"` (plural) to match classifier
- **1 Carnival bar** (Alchemy Bar) already existed in `carnival-venues.json` — same category fix
- **1 RCL bar** (Casino Bar) already existed in `venues-v2.json`

### Counter-service dress code corrections (2026-02-01)

Fixed 5 counter-service venues that incorrectly had "Smart Casual" dress codes:
- `basecamp.html`, `cafe-two70.html`, `park-cafe.html`, `surfside-eatery.html` — changed to "Casual"
- `solarium-bistro.html` — changed from "smart casual after 5 PM" to "casual cruise resort wear"

---

## Infrastructure Completed

### 1. Validator: `admin/validate-venue-page-v2.js`

Node.js venue validator with 40 checks across technical, semantic, and quality dimensions. Uses `venues-v2.json` + cruise-line-specific JSON files for context-sensitive semantic rules (a hot dog stand is judged by hot-dog-stand standards).

**Data sources loaded:**
- `assets/data/venues-v2.json` (207 RCL venues)
- `assets/data/ncl-venues.json` (78 NCL venues)
- `assets/data/carnival-venues.json` (23 Carnival venues)
- `assets/data/msc-venues.json` (45 MSC venues)
- `assets/data/virgin-venues.json` (46 Virgin venues)

### 2. Unified Validator Integration: `admin/validate.js`

- `venue` type mapped to `validate-venue-page-v2.js`
- Path patterns detect `restaurants/**/*.html` (including subdirectories)
- `--all` and `--all-venues` flags scan all restaurant subdirectories

### 3. Batch Validation Script: `scripts/batch-validate-venues.js`

Runs validator on all 472 pages across all 5 cruise line directories. Outputs `data/validated-venues.json` with per-page, per-line, and per-style breakdowns.

### 4. Venue Classifier Improvements

Fixed classifier to prevent false positives:
- Premium/specialty subcategory now checked before counter-service keywords
- `sub: restaurant` handled explicitly (teppanyaki, Korean BBQ = specialty, not counter-service)
- Buffet detection runs before counter-service keywords (buffets mention "snacks" but aren't counters)
- Removed overly broad keywords (`snacks`, `bbq`) from counter-service detection
- Net result: 12 misclassifications fixed

---

## Venue System by Cruise Line

### Royal Caribbean International (280 pages)
Generic venue pages covering the full RCL fleet: bars, restaurants, entertainment, activities, and neighborhoods across Oasis, Quantum, Freedom, Voyager, Radiance, and Vision class ships.

### Norwegian Cruise Line (78 pages)
Complete venue system with OCR-verified 7-night MDR dinner rotations, specialty restaurant menus, bar menus, and entertainment listings. Menus sourced from primary PDF documents.

### Virgin Voyages (46 pages)
All venues across Scarlet Lady, Valiant Lady, Resilient Lady, and Brilliant Lady. Menus corrected from official PDF primary sources. Interactive dining (Gunbae, Test Kitchen) properly classified.

### MSC Cruises (45 pages)
Complete venue system covering Meraviglia, Seaside, Seashore, World America, and classic fleet. Includes all MDR venues, specialty restaurants, buffets, bars, and entertainment.

### Carnival Cruise Line (23 pages)
Core venue system including Guy Fieri restaurants (Guy's Burger Joint, Pig & Anchor), specialty dining (Bonsai Sushi/Teppanyaki, Fahrenheit 555, Chef's Table), and signature experiences.

---

## Commit History (this branch)

| Commit | Description |
|--------|-------------|
| `0c0c573` | Add complete MSC Cruises venue system — 45 venues |
| `bae0f10` | Bring last 2 failing venue pages to validation compliance |
| `da78ef1` | Add complete Carnival venue system — 23 venues |
| `a92980d` | Correct all Virgin Voyages restaurant menus from PDF sources |
| `5040068` | Correct all Virgin Voyages restaurant menus from PDF sources |

---

## Files Modified in Phase 2

| File | Change |
|------|--------|
| `admin/validate-venue-page-v2.js` | Added subdirectory recursion, all 5 venue data files, improved classifier |
| `admin/validate.js` | Added `restaurants/**/*.html` glob for `--all` and `--all-venues` |
| `scripts/batch-validate-venues.js` | **NEW** — Batch validation with JSON output |
| `data/validated-venues.json` | **NEW** — Machine-readable validation results |
| `restaurants/carnival/the-deli.html` | Replaced formal-dining.webp with croissant.webp |
| `restaurants/virgin/lick-me-till-ice-cream.html` | Fixed dress code (Smart Casual → Casual), replaced formal-dining.webp |
| `VENUE_AUDIT_REPORT_2026_01_31.md` | **THIS FILE** |

---

*Soli Deo Gloria*
