# Mobile Hardening Plan — In the Wake

**Version:** 1.0.0
**Date:** 2026-02-19
**Author:** Claude (Opus 4.6)
**Status:** PLANNING — Awaiting approval before implementation
**Branch:** claude/review-codebase-validators-n0YNf

---

## Table of Contents

1. [Codebase Findings](#1-codebase-findings)
2. [Validator Script Analysis](#2-validator-script-analysis)
3. [AI Advice Analysis — Wheat vs Chaff](#3-ai-advice-analysis)
4. [Mobile Hardening Strategy](#4-mobile-hardening-strategy)
5. [Implementation Plan](#5-implementation-plan)
6. [Validator Updates Required](#6-validator-updates-required)
7. [Testing Protocol](#7-testing-protocol)

---

## 1. Codebase Findings

### Site Architecture
- **Type:** Static HTML/CSS/JS cruise planning website (GitHub Pages)
- **Version:** ITW-Lite v3.010.305
- **Pages:** 292 ship pages, 380 port pages, 472 venue pages, plus tools & articles
- **CSS Architecture:** Modular — 1 main stylesheet (`assets/styles.css`, 2,612 lines) + 6 feature CSS files + 15 brand CSS files + 1 component CSS file = 22 CSS files total

### Current Mobile State

**Breakpoints in use (61 total media queries across all files):**

| Breakpoint | Role | Files |
|-----------|------|-------|
| 480px | Extra-small phone | styles.css, ships-dynamic.css, ships-atlas.css, calculator.css, item-cards.css |
| 520px | Small phone | styles.css (one query) |
| 600px | Small mobile | styles.css |
| 720px | Multi-column threshold | styles.css |
| 768px | Tablet/mobile nav boundary | styles.css, ships-dynamic.css, calculator.css, item-cards.css, port-map.css |
| 900px | Grid collapse | styles.css |
| 980px | Page-grid 2-col → 1-col | styles.css (primary layout breakpoint) |
| 1024px | Large screen | styles.css, calculator.css |
| 1400px | Extra-large | item-cards.css |

**Current responsive infrastructure:**
- `page-grid`: 2-column (content + rail) → 1-column at 979.98px ✅
- `grid-2`: 1-column default → 2-column at 980px ✅
- `grid-3`: 3-column → 1-column at 900px ✅
- `vx-grid` (venues): 1-col / 2-col / 3-col transitions ✅
- Navigation: Hamburger menu at 768px ✅
- `in-app-browser` class: Forces single column ✅
- Accessibility: `prefers-reduced-motion` (9 queries), `prefers-contrast` (5), `prefers-color-scheme` (2) ✅

**Key CSS variables (defined in :root):**
```css
--sea: #0a3d62;    --foam: #e6f4f8;    --rope: #d9b382;
--ink: #083041;    --sky: #f7fdff;     --accent: #0e6e8e;
--rail: 320px;     --shadow: 0 6px 22px rgba(8,48,65,.08);
```

### What's Working
- Navigation hamburger menu with full-screen overlay at 768px
- Page-grid collapses to single column at 980px
- Ship pages have `clamp()` typography (`ship-page.css` line 22-30)
- Cards are flex/grid based, generally stack well
- 44px min-height touch targets on `.nav-pill` and `.logbook-btn`
- In-app browser detection forces single-column

### What Needs Attention (Mobile Friction Points)
1. **No dedicated 320px-430px viewport optimization** — The smallest breakpoint is 480px, but 320px devices exist
2. **Right rail stacking order** — When page-grid collapses, the rail simply drops below content with no visual distinction or section separation
3. **Hero imagery** — No `<picture>` / `srcset` mobile optimization for hero images on ship/port pages
4. **Typography at 320px** — `h1` at `2rem` (32px) may overflow on narrowest viewports; only ship-page.css uses `clamp()`
5. **Touch target gaps** — Some `.dropdown-menu a` links have only `0.5rem 0.75rem` padding (may be < 44px)
6. **Horizontal overflow risk** — Tables (`.key-facts`, `.pier-distances-table`, `.stats-grid`) lack mobile scroll wrappers
7. **Image aspect ratios** — `.card` images use `object-fit: cover` but no explicit `aspect-ratio` — CLS risk
8. **Swiper/carousel** — Ship page carousels (First Look) may have touch conflict with page scroll
9. **Weather forecast grid** — At 480px drops to 3 columns but may still be tight at 320px
10. **Print styles override mobile** — 6 `@media print` queries; no conflict, but worth auditing

---

## 2. Validator Script Analysis

### Current Validator Inventory (12 scripts)

| Script | Version | Validates | CSS/Mobile Checks |
|--------|---------|-----------|-------------------|
| `validate.js` | Unified | Routes to correct validator | None |
| `validate-ship-page.js` | v2.3 | Ship pages — ICP-Lite, JSON-LD, sections, words, videos, WCAG | **WCAG touch targets, aria** |
| `validate-port-page.js` | v1.0 | Port pages — sections, words, images, ICP-Lite | None |
| `validate-port-page-v2.js` | v1.1 | Port pages (enhanced) — logbook, voice, placeholder images | Placeholder image MD5 |
| `validate-venue-page-v2.js` | v2.0 | Venue pages — technical + semantic checks, WCAG | **WCAG checks** |
| `validate-icp-lite-v14.js` | v1.4 | ICP-Lite compliance — dual-cap, JSON-LD mirroring | None |
| `validate-historic-ship-page.js` | v1.0 | Retired ship pages | None |
| `validate-poi-coordinates.js` | v1.0 | POI coordinate validation | None |
| `validate-recent-articles.js` | v1.0 | Recent articles rail pattern | None |
| `post-write-validate.sh` | v2.0 | YAML-driven post-write checks | None |
| `validate-ship-page.sh` | v3.010.301 | Shell-based ship validation | None |
| `validate-venue-page.sh` | v1.2.0 | Shell-based venue validation | None |

### What Validators Need for Mobile Hardening

**None of the current validators check mobile-specific CSS concerns.** They focus on:
- Structural HTML (sections, content, JSON-LD)
- Content quality (word counts, personas, purity)
- Metadata (ICP-Lite, breadcrumbs, dates)
- WCAG accessibility (aria attributes, semantic HTML)

**Validators that need updates:**

1. **`validate-ship-page.js`** — Already has WCAG checks; should add:
   - Viewport meta tag presence check
   - `clamp()` typography verification for hero h1
   - Touch target size audit (min 44x44px)
   - Horizontal overflow prevention (tables with mobile wrapper)
   - Image `srcset`/`<picture>` for hero images
   - `aspect-ratio` on card images (CLS prevention)

2. **`validate-port-page-v2.js`** — Should add:
   - Same mobile meta checks as ship
   - Table overflow wrapper check for `.pier-distances-table`
   - Hero image responsive check

3. **`validate-venue-page-v2.js`** — Already has WCAG; should add:
   - Touch target verification
   - Table overflow check

4. **`validate.js` (unified)** — Should add:
   - Universal mobile-readiness checks that apply to ALL page types
   - Viewport meta tag
   - `overflow-x: hidden` on `html,body`
   - No fixed-width elements wider than 100vw

5. **New script needed: `validate-mobile-readiness.js`** — A universal mobile validation module that can be called by any validator, checking:
   - Viewport meta tag
   - Touch targets (min 44px)
   - No horizontal overflow elements
   - Responsive images (srcset/picture on hero)
   - Typography minimum sizes
   - Table wrapper presence
   - `aspect-ratio` on images in cards

---

## 3. AI Advice Analysis — Wheat vs Chaff

### The "Master Mobile Hardening Prompt" — Evaluation

#### WHEAT (Keep — Directly Applicable)

1. **"Phone optimization must preserve: Nautical identity, Hero + compass structure, Wake imagery layering, Right-rail identity, Typography hierarchy ratios, Serif/sans pairing, Whitespace rhythm, Visual depth"**
   - **Why it's wheat:** This is exactly what CITW needs. The nautical brand identity IS the site. Mobile work must not flatten it.

2. **"Desktop Preservation — All changes must be contained within mobile media queries only"**
   - **Why it's wheat:** This is critical. The desktop site works. We only add `@media` rules, never modify base styles.

3. **"Right Rail Reflow (Not Deletion) — Convert right-rail into stacked layout: Primary content → Rail modules → Footer"**
   - **Why it's wheat:** The `.page-grid` already collapses at 979.98px but lacks visual distinction for the rail sections when stacked. This directly applies.

4. **"Typography Discipline — Use clamp() for responsive scaling, maintain minimum 1.4 line-height, body text not below 15px, preserve hierarchy ratios"**
   - **Why it's wheat:** `ship-page.css` already uses `clamp()` for hero headings. Extending this to `styles.css` base headings is the right move.

5. **"Image Integrity — Preserve hero dominance, fix aspect-ratio handling, use object-fit consistently, prevent horizontal scroll"**
   - **Why it's wheat:** Hero images, compass placement, and wake imagery are core brand elements. Mobile must scale them, not remove them.

6. **"Stacking Context Protection — Audit position, z-index, and stacking contexts"**
   - **Why it's wheat:** The navigation z-index is already 10000-10001. Mobile overlays need stacking context audit.

7. **"CSS/Layout Only Boundary — Do not modify JavaScript, JSON-LD, versioning, template logic, data attributes, canonical metadata"**
   - **Why it's wheat:** Aligns perfectly with ITW-Lite philosophy. Mobile is a CSS concern. Don't touch the data layer.

#### CHAFF (Discard — Doesn't Apply or Is Overconstrained)

1. **"Use @media (max-width: 480px) unless a narrower breakpoint is explicitly justified"**
   - **Why it's chaff:** The site already uses 480px, 520px, 600px, 768px, and 980px breakpoints. We should use the EXISTING breakpoint system, not force everything into one query. We need at least 480px AND 768px, possibly 360px.

2. **"Logical CSS Properties — Prefer logical properties (inline-size, block-size, margin-inline)"**
   - **Why it's chaff:** The existing codebase uses physical properties throughout. Introducing logical properties into a 2,612-line stylesheet creates inconsistency. This is a future refactor, not a mobile hardening concern.

3. **"No speculative improvements / No optional aesthetic enhancements"**
   - **Why it's partial chaff:** While we shouldn't redesign, some mobile improvements ARE aesthetic by nature (spacing, touch targets). Being too rigid here prevents good mobile UX.

4. **"Compass and wake imagery layering must remain visually identical on mobile"**
   - **Why it's chaff:** "Visually identical" on a 320px screen vs 1400px desktop is physically impossible. The goal should be "spiritually equivalent" — same visual weight, adapted proportions.

5. **"Halt if constraint conflict detected"**
   - **Why it's chaff in practice:** Good in theory, but creates paralysis. Better approach: document the conflict, state the tradeoff, and implement the best compromise.

#### OVERLOOKED (What the AI Advice Missed)

1. **Validator integration** — The prompt says "CSS/layout only" but ignores that CITW has an entire validation pipeline. Mobile CSS changes need to be VALIDATED automatically to prevent regression.

2. **Brand CSS files** — 15 brand-specific CSS files exist. Mobile hardening needs to audit ALL of them, not just the main stylesheet.

3. **In-app browser detection** — The site already handles in-app browsers (Facebook, Instagram) with a `.in-app-browser` class. Mobile hardening should leverage this.

4. **Static site deployment** — GitHub Pages. No server-side rendering. All responsive must be client-side CSS. No dynamic viewport adaptation.

5. **Touch target audit across ALL interactive elements** — Not just buttons. FAQ `<summary>` elements, `.ship-card` links, pagination buttons, etc.

6. **Performance impact of mobile CSS** — Adding mobile-specific CSS increases payload. For a site with 1,100+ pages, this matters for Core Web Vitals.

7. **Testing on actual device viewports** — The prompt mentions 320px-430px but doesn't mention the most common real-world viewports: iPhone SE (375px), iPhone 14 (390px), Samsung Galaxy (360px), Pixel (412px).

8. **Hamburger menu interaction quality** — The site has one, but the quality of the open/close animation, scroll lock behavior, and touch gestures within it are untested.

---

## 4. Mobile Hardening Strategy

### Guiding Principles (ITW-Lite + AI Chorus + Our Analysis)

1. **CSS-only, media-query-only changes** — No JS, no HTML structure changes, no metadata changes
2. **Use existing breakpoint system** — 480px, 768px, 980px as primary; add 360px if needed
3. **Preserve nautical identity** — Scale, don't flatten
4. **Right-rail reflow with visual distinction** — Stacked but visually separated
5. **Touch-first interaction design** — 44px minimum targets everywhere
6. **Prevent horizontal overflow** — Table wrappers, image constraints
7. **Typography with clamp()** — Extend from ship-page.css pattern to all headings
8. **Test at real device widths** — 360px, 375px, 390px, 412px, 430px
9. **Validate automatically** — Create mobile validation module
10. **Document for other Claudes** — Every change explained

### What We Will NOT Do (Guardrails)

- NOT modify desktop rendering
- NOT change JavaScript behavior
- NOT alter JSON-LD, ICP-Lite, or metadata
- NOT introduce new design systems
- NOT use logical CSS properties (future refactor)
- NOT remove or hide any content
- NOT change the theological invocation
- NOT modify brand CSS files (unless overflow fix required)

---

## 5. Implementation Plan

### Phase 1: Foundation (Mobile Meta + Typography)

**File: `assets/styles.css`**

1. **Add 360px breakpoint** for narrowest phones (iPhone SE, Galaxy S)
2. **Convert base headings to clamp()** (currently fixed `rem` values):
   ```css
   @media (max-width: 480px) {
     h1 { font-size: clamp(1.5rem, 6vw, 2rem); }
     h2 { font-size: clamp(1.2rem, 4.5vw, 1.5rem); }
     h3 { font-size: clamp(1.05rem, 3.5vw, 1.25rem); }
   }
   ```
3. **Ensure body text minimum 15px** (currently 16px base — fine, but verify at 480px)

### Phase 2: Layout Hardening

**File: `assets/styles.css`**

4. **Rail visual distinction when stacked:**
   ```css
   @media (max-width: 979.98px) {
     .page-grid > .rail {
       border-top: 2px solid var(--rope);
       padding-top: 1.5rem;
       margin-top: 1rem;
     }
   }
   ```

5. **Table overflow wrappers** — Add scrollable wrapper for tables at narrow widths:
   ```css
   @media (max-width: 480px) {
     .stats-grid { grid-template-columns: 1fr; }
     .pier-distances-table { display: block; overflow-x: auto; }
     .key-facts { display: block; overflow-x: auto; }
   }
   ```

6. **Card image aspect-ratio** — Prevent CLS:
   ```css
   .card img, .ship-card .thumb img {
     aspect-ratio: 16/9;
   }
   ```

### Phase 3: Touch Target Hardening

**File: `assets/styles.css`**

7. **Ensure all interactive elements meet 44px minimum:**
   ```css
   @media (max-width: 768px) {
     .dropdown-menu a { min-height: 44px; display: flex; align-items: center; }
     .faq-item summary { min-height: 44px; display: flex; align-items: center; }
     .pagination-btn { min-height: 44px; min-width: 44px; }
   }
   ```

### Phase 4: Image Responsiveness

**File: `assets/styles.css`**

8. **Hero image containment:**
   ```css
   @media (max-width: 480px) {
     .hero-header img, .hero-ship img {
       max-height: 50vh;
       object-fit: cover;
       width: 100%;
     }
   }
   ```

### Phase 5: Ship-Page-Specific Mobile CSS

**File: `assets/css/ship-page.css`**

9. **Video embed mobile sizing** — Already responsive (56.25% padding-bottom) ✅
10. **Tracker container mobile height:**
    ```css
    @media (max-width: 480px) {
      .tracker-container { height: 300px; }
    }
    ```

### Phase 6: Brand CSS Audit

11. **Audit all 15 brand CSS files** for overflow-causing styles
12. **Add overflow prevention** where needed

---

## 6. Validator Updates Required

### New Module: `admin/validate-mobile-readiness.js`

Universal mobile validation checks:

```
CHECK-M01: Viewport meta tag present (<meta name="viewport" content="width=device-width,initial-scale=1">)
CHECK-M02: No inline width >100vw on any element
CHECK-M03: Hero images have width:100% or max-width:100%
CHECK-M04: Tables inside overflow wrapper or have overflow-x:auto
CHECK-M05: All interactive elements ≥44px touch target (inferred from CSS class)
CHECK-M06: No fixed positioning without mobile override
CHECK-M07: Font sizes ≥15px equivalent for body text
CHECK-M08: aspect-ratio or explicit height on card images
```

### Updates to Existing Validators

**`validate-ship-page.js` additions:**
- Import and run mobile-readiness checks
- Check for `clamp()` on hero h1
- Verify ship-page.css is linked

**`validate-port-page-v2.js` additions:**
- Import and run mobile-readiness checks
- Check `.pier-distances-table` has mobile handling

**`validate-venue-page-v2.js` additions:**
- Import and run mobile-readiness checks

**`validate.js` (unified) additions:**
- Call mobile-readiness module for ALL page types

---

## 7. Testing Protocol

### Device Width Matrix

| Width | Device | Priority |
|-------|--------|----------|
| 320px | iPhone SE (1st gen) | P2 |
| 360px | Samsung Galaxy S series | P1 |
| 375px | iPhone SE (3rd gen), iPhone 13 mini | P1 |
| 390px | iPhone 14 | P1 |
| 412px | Pixel 7 | P1 |
| 430px | iPhone 14 Pro Max | P2 |
| 768px | iPad mini | P1 |

### Page Type Coverage

Test mobile at each width on:
1. **index.html** — Home page (hero + cards)
2. **ships/rcl/radiance-of-the-seas.html** — Gold standard ship page
3. **ports/cozumel.html** — Port page with pier distances table
4. **restaurants.html** — Venue listing with grid
5. **drink-calculator.html** — Interactive tool
6. **ships.html** — Ship listing/index
7. **search.html** — Search page

### Acceptance Criteria

- [ ] No horizontal scroll at any test width
- [ ] All touch targets ≥44px
- [ ] Typography readable at 320px (no overflow)
- [ ] Right rail visually distinct when stacked
- [ ] Hero images scale without cropping key content
- [ ] Tables scrollable or reformatted at narrow widths
- [ ] Navigation hamburger works smoothly
- [ ] Dropdowns don't overflow viewport
- [ ] Desktop rendering unchanged
- [ ] All validators pass
- [ ] Lighthouse mobile score ≥90

---

## For Other Claudes: Context Summary

### What this project is
A static HTML cruise planning website with 1,100+ pages, a rigorous validation pipeline, and a faith-based identity (Soli Deo Gloria). It uses ITW-Lite v3.010 philosophy: AI-first, Human-first, Google second.

### What this plan does
Makes the site mobile-friendly (320px-430px viewports) through CSS-only changes within media queries, while updating the validator pipeline to enforce mobile standards automatically.

### Key constraints
1. **CSS-only** — No HTML structure changes, no JS changes
2. **Media queries only** — Desktop must remain unchanged
3. **Preserve brand identity** — Nautical theme, typography hierarchy, wake imagery
4. **Validate everything** — Changes must be machine-verifiable
5. **Careful, not clever** — Read before editing, verify before reporting, one change at a time

### Where to start
1. Read this plan
2. Read `CAREFUL.md` (`.claude/skills/careful-not-clever/CAREFUL.md`)
3. Read `styles.css` (understand existing breakpoints)
4. Implement Phase 1 (typography) first — lowest risk, highest impact
5. Test at 375px (most common mobile width)
6. Move to Phase 2 (layout) only after Phase 1 verified

### Files you'll modify
- `assets/styles.css` — Main stylesheet (add mobile media queries)
- `assets/css/ship-page.css` — Ship page CSS (minor mobile tweaks)
- `admin/validate-mobile-readiness.js` — **NEW** — Mobile validation module
- `admin/validate-ship-page.js` — Add mobile checks
- `admin/validate-port-page-v2.js` — Add mobile checks
- `admin/validate-venue-page-v2.js` — Add mobile checks
- `admin/validate.js` — Add mobile module call

### Files you must NOT modify
- Any `.html` file (structure changes)
- Any `.js` file in `assets/js/` (behavior changes)
- Any JSON-LD, ICP-Lite metadata
- `claude.md`, `ONBOARDING.md` (read-only context)
- Brand CSS files (unless overflow fix is required and documented)

---

**Soli Deo Gloria** — Excellence as worship, even in responsive design.
