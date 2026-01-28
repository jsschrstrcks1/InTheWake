# Venue Audit Plan — v1.0.0

> Thread: "Audit the Venues"
> Branch: `claude/audit-venues-gD9fq`
> Date: 2026-01-28
> Status: **Phase 1 complete** (audit + validator built), Phase 2 pending (integration + fixes)

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Audit Findings Summary](#2-audit-findings-summary)
3. [Page Categorization](#3-page-categorization)
4. [Error Taxonomy](#4-error-taxonomy)
5. [The Validator: validate-venue-page-v2.js](#5-the-validator)
6. [Integration Plan](#6-integration-plan)
7. [Remediation Strategy](#7-remediation-strategy)
8. [File Reference](#8-file-reference)
9. [Pickup Instructions for Next Thread](#9-pickup-instructions)

---

## 1. Problem Statement

The venue/restaurant pages at `/restaurants/*.html` have systemic quality issues stemming from batch generation via `admin/generate_restaurant_pages.py`. The generator creates pages with:

- **One stock image duplicated 5x** across every card section (overview, accommodations, availability, logbook, sources)
- **No menu section at all** — the template skips `id="menu-prices"` entirely
- **Generic review text** shared across ALL venues regardless of type ("presented beautifully", "tasteful decor")
- **Wrong tone for venue type** — counter-service hot dog stands described with fine-dining language

### The Dog House Example

`restaurants/boardwalk-dog-house.html` is the exemplar problem:
- Uses `hotdog.webp` as its only image, duplicated 5 times
- No menu listing of available hot dogs, sausages, or prices
- Review says food is "presented beautifully" — it's hot dogs on a paper plate
- "Smart Casual" dress code — it's an outdoor boardwalk stand
- "Best For: Families, couples, and groups seeking quality dining" — it's a hot dog counter
- FAQ says "Reservations are recommended for specialty dining" — it's walk-up only
- "Tasteful decor that enhanced the dining experience" — it's open-air on the Boardwalk

These are not just technical problems. They are **semantic lies** that undermine reader trust. Does McDonald's plate beautifully? Neither does the Boardwalk Dog House.

---

## 2. Audit Findings Summary

### 215 total venue pages audited

| Issue | Pages Affected | % |
|-------|---------------|---|
| Missing Google Analytics (T03) | 129 | 60.0% |
| Image over-duplication (T01) | 116 | 53.9% |
| Generic template review text (S01) | 104 | 48.4% |
| Generic "best for" text (S02) | 100 | 46.5% |
| Generic FAQ contamination (S04) | 80 | 37.2% |
| Missing menu section on dining venues (T02) | 43 | 20.0% |
| Missing required sections (T05) | 23 | 10.7% |
| "Presented beautifully" on counter-service (S06) | 20 | 9.3% |
| Missing JSON-LD schemas (T08) | 19 | 8.8% |
| Wrong stock image for venue type (S05) | 15 | 7.0% |
| Missing Umami analytics (T04) | 13 | 6.0% |
| Smart Casual on casual/walk-up venues (S03) | 10 | 4.7% |
| No venue-specific images (W01 - warning) | **215** | **100%** |

### Batch Validation Results (v2 validator)

```
Total:    215
Passed:   0     (0.0%)
Warnings: 76   (35.3%)
Failed:   139  (64.7%)
```

**By venue style:**
| Style | Total | Pass Rate | Failed |
|-------|-------|-----------|--------|
| entertainment | 28 | 100% | 0 |
| neighborhood | 12 | 92% | 1 |
| activity | 34 | 76% | 8 |
| unknown | 8 | 38% | 5 |
| counter-service | 22 | 9% | 20 |
| bar | 64 | 8% | 59 |
| specialty | 13 | 8% | 12 |
| casual-dining | 26 | 0% | 26 |
| fine-dining | 5 | 0% | 5 |
| coffee | 2 | 0% | 2 |
| dessert | 1 | 0% | 1 |

---

## 3. Page Categorization

### Hand-Crafted (86 pages)
Custom content, venue-specific reviews, menus where applicable. These are the quality target.
Includes most entertainment/activity pages and well-developed dining pages like `chops.html`, `lemon-post.html`, `dog-house.html`, `el-loco-fresh.html`.

### Template-Generated (100 pages)
Output of `admin/generate_restaurant_pages.py`. Identified by:
- Line count: 550-560
- `hotdog.webp` or other stock image duplicated 5x
- Generic review text (exact template phrases)
- No menu section
- Missing Google Analytics

**40 template dining pages**, **60 template bar/lounge pages**

### Partially Upgraded (29 pages)
Some custom content added but generator artifacts remain. Examples:
- `hooked-seafood.html` — has menu but retains "presented beautifully" generic review
- `johnny-rockets.html` — has menu but still uses `hotdog.webp` and generic review
- `wonderland.html` — molecular gastronomy restaurant still says "presented beautifully" and uses `italian.webp`
- `windjammer.html` — 864 lines of custom content but missing GA

---

## 4. Error Taxonomy

### Technical Errors (T-codes) — Structural failures

| Code | Rule | Severity |
|------|------|----------|
| T01 | Image used >1x without swiper+inline justification | ERROR |
| T02 | Missing `id="menu-prices"` on dining venue | ERROR |
| T03 | Missing Google Analytics `G-WZP891PZXJ` | ERROR |
| T04 | Missing Umami Analytics | ERROR |
| T05 | Missing required content sections | ERROR |
| T06 | Missing theological foundation | ERROR |
| T07 | Missing ICP-Lite protocol tags | ERROR |
| T08 | Missing JSON-LD schemas | ERROR |
| T09 | Missing WCAG accessibility elements | ERROR/WARN |
| T10 | Missing navigation elements | ERROR |

### Semantic Errors (S-codes) — Content quality/coherence failures

| Code | Rule | Severity |
|------|------|----------|
| S01 | Generic template review text (from generator) | ERROR |
| S02 | Generic "best for" text (from generator) | ERROR |
| S03 | Dress code mismatch (Smart Casual on walk-up) | ERROR |
| S04 | Generic FAQ on wrong venue type (reservation FAQ on hot dog stand) | ERROR |
| S05 | Wrong stock image for venue type (hotdog.webp on non-hot-dog venue) | ERROR |
| S06 | Fine-dining language on casual venue ("presented beautifully") | ERROR |

### Quality Warnings (W-codes) — Should address

| Code | Rule | Severity |
|------|------|----------|
| W01 | No venue-specific images (all stock) | WARN |
| W02 | Template-length page (550-560 lines, unmodified) | WARN |
| W03 | Missing author card / right rail | WARN |
| W04 | Missing OG/Twitter image tags | WARN |
| W05 | Stale last-reviewed date (>180 days) | WARN |

---

## 5. The Validator

### File: `admin/validate-venue-page-v2.js`

**Replaces:** `admin/validate-venue-page.sh` (the old bash validator, kept for reference)

**Key capability the old validator lacked:**
- Loads `assets/data/venues-v2.json` to classify each venue by service style
- Uses venue classification to apply context-sensitive semantic rules
- A hot dog stand is judged by hot-dog-stand standards, not fine-dining standards

**Venue style classification:**
The validator classifies each venue into one of these styles based on JSON metadata:
- `fine-dining` — multi-course, tasting, exclusive, molecular gastronomy
- `specialty` — premium/surcharge restaurants
- `casual-dining` — complimentary sit-down restaurants, buffets
- `counter-service` — hot dogs, ice cream, pizza, BBQ, snacks
- `bar` — bars and lounges
- `coffee` — Starbucks, Latte-tudes
- `dessert` — milkshake bars
- `entertainment` — theaters, shows
- `activity` — waterparks, sports, spa
- `neighborhood` — ship areas (Central Park, Boardwalk)
- `unknown` — not in venues-v2.json

**Usage:**
```bash
# Single page
node admin/validate-venue-page-v2.js restaurants/boardwalk-dog-house.html

# Batch (all venue pages)
node admin/validate-venue-page-v2.js --batch restaurants/

# JSON output for CI
node admin/validate-venue-page-v2.js --json-output restaurants/chops.html
```

**Exit codes:** 0 = pass, 1 = errors, 2 = warnings only

---

## 6. Integration Plan

### Step 1: Update unified validator (validate.js)

In `admin/validate.js`, change the VALIDATORS map:
```js
// OLD:
'venue': 'validate-venue-page.sh',

// NEW:
'venue': 'validate-venue-page-v2.js',
```

### Step 2: Fix path pattern detection

The unified validator has `^venues\/.*\.html$` for venue detection, but venue pages live in `restaurants/`. Add the restaurants pattern:

```js
// Add to PATH_PATTERNS array in validate.js:
{ pattern: /^restaurants\/.*\.html$/, type: 'venue' },
```

### Step 3: Fix --all glob patterns

The `--all` flag scans `venues/**/*.html` but should scan `restaurants/**/*.html`:

```js
// In the allPages block of validate.js:
join(PROJECT_ROOT, 'restaurants/*.html'),  // Add this
```

### Step 4: Create batch venue validator script

Create `scripts/batch-validate-venues.js` (parallel to existing `scripts/batch-validate-ships.js` and `scripts/batch-validate.js`):

```js
// Runs: node admin/validate-venue-page-v2.js --batch restaurants/
// Outputs: data/validated-venues.json
```

### Step 5: Update post-write hook

The hook at `.claude/hooks/ship-page-validator.sh` auto-validates ship pages after Write/Edit. Create a parallel hook for venue pages, or expand the existing hook to detect `restaurants/*.html` writes and run the v2 validator.

### Step 6: Keep old validator for reference

Don't delete `admin/validate-venue-page.sh` yet. Rename to `admin/validate-venue-page-v1.sh` for reference. The new v2 is a superset — it checks everything v1 checked plus semantic rules.

---

## 7. Remediation Strategy

### Priority 1: Fix the 4 partially-upgraded pages with worst semantic issues
These pages have custom content but still contain jarring template text:
1. `wonderland.html` — Molecular gastronomy saying "presented beautifully" + wrong image
2. `hooked-seafood.html` — Custom menu but template review
3. `johnny-rockets.html` — Custom menu but hotdog.webp + template review
4. `sabor.html` — Custom menu but template review

### Priority 2: Add Google Analytics to 29 partially-upgraded pages
These already have custom content but are missing GA tracking:
`mdr.html`, `windjammer.html`, `park-cafe.html`, `sorrentos.html`, `izumi.html`, etc.

### Priority 3: Fix counter-service semantic issues (20 pages)
Replace "Smart Casual" with "Casual" or "No dress code", remove "presented beautifully", update FAQ answers. Target: `boardwalk-dog-house.html`, `ben-and-jerrys.html`, `sprinkles.html`, `sugar-beach.html`, `portside-bbq.html`, etc.

### Priority 4: Fix remaining 60 template bar pages
These need: unique review text, GA, proper image handling, venue-specific FAQ

### Priority 5: Fix remaining 40 template dining pages
These need: menu sections, unique review text, GA, proper images, venue-specific content

### Priority 6: Upgrade the generator
Update `admin/generate_restaurant_pages.py` to:
1. NOT emit generic review text (leave section as TODO placeholder)
2. NOT duplicate images across sections (use watermark.webp as background only)
3. Include `id="menu-prices"` section (even if empty with "Menu coming soon")
4. Use category-appropriate defaults (no "Smart Casual" for counter-service)
5. Include Google Analytics and proper OG tags
6. Generate venue-appropriate FAQ answers

---

## 8. File Reference

| File | Purpose |
|------|---------|
| `admin/validate-venue-page-v2.js` | **NEW** — Node.js venue validator with semantic checks |
| `admin/validate-venue-page.sh` | OLD — Bash venue validator (12 sections, no semantics) |
| `admin/validate.js` | Unified dispatcher — needs integration update |
| `admin/generate_restaurant_pages.py` | Generator — creates template pages (root cause) |
| `assets/data/venues-v2.json` | Venue metadata (207 venues, 5 categories) |
| `restaurants/*.html` | 215 venue pages (86 hand-crafted, 100 template, 29 partial) |
| `.claude/plan-venue-audit.md` | **THIS FILE** — comprehensive plan and findings |

---

## 9. Pickup Instructions for Next Thread

### Where we left off
- Phase 1 (audit + validator) is **COMPLETE**
- The v2 validator at `admin/validate-venue-page-v2.js` is built and tested
- It correctly identifies 9 errors on boardwalk-dog-house.html and 0 errors on chops.html
- Batch validation run: 139 failed, 76 warnings, 0 clean pass

### What needs doing next

1. **Integration** (Section 6 above):
   - Update `admin/validate.js` VALIDATORS map and PATH_PATTERNS
   - Fix `--all` glob to include `restaurants/*.html`
   - Create `scripts/batch-validate-venues.js`
   - Expand or create venue post-write hook

2. **Remediation** (Section 7 above):
   - Fix the 4 worst partially-upgraded pages first
   - Add GA to 29 partially-upgraded pages
   - Fix counter-service semantic issues (20 pages)
   - Then work through bars (60 pages) and dining (40 pages)

3. **Generator upgrade**:
   - Update `admin/generate_restaurant_pages.py` so future pages don't have these problems

### Quick-start commands
```bash
# Run the new validator on a single page
node admin/validate-venue-page-v2.js restaurants/boardwalk-dog-house.html

# Run batch validation on all venue pages
node admin/validate-venue-page-v2.js --batch restaurants/

# Get JSON output for scripting
node admin/validate-venue-page-v2.js --json-output restaurants/chops.html

# Run old validator for comparison
bash admin/validate-venue-page.sh restaurants/boardwalk-dog-house.html
```

### Key design decisions already made
- Validator is Node.js (not bash) to match existing ecosystem
- Uses venues-v2.json for semantic classification
- watermark.webp excluded from duplication check (it's decorative)
- Entertainment/activity/neighborhood pages are NOT held to dining standards
- Menu section is REQUIRED for all dining venues (fine-dining through counter-service)
- "Presented beautifully" is a FAIL on counter-service venues, not just a warning
- Generic template phrases are exact-match detected (6 dining phrases, 4 bar phrases)

### Branch
All work is on `claude/audit-venues-gD9fq`. Commit and push before ending.
