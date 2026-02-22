# Mobile Hardening Plan — In the Wake

**Version:** 2.0.0
**Date:** 2026-02-19
**Author:** Claude (Opus 4.6)
**Status:** PLANNING — Upgraded from one-time patch to permanent standard
**Branch:** claude/review-codebase-validators-n0YNf
**Governing Standard:** [new-standards/v3.010/MOBILE_STANDARDS_v1.000.md](../../new-standards/v3.010/MOBILE_STANDARDS_v1.000.md)

---

## Change Log (v2.0.0)

**What changed from v1.0.0:**
- Elevated from one-time plan to implementation plan for a permanent standard
- Added Phase 0 (Governance) — standard created at `new-standards/v3.010/MOBILE_STANDARDS_v1.000.md`
- **CORRECTED:** Removed `display: block` on tables — breaks semantics. Replaced with `.table-scroll` wrapper approach (requires targeted HTML exception)
- **CORRECTED:** Removed blanket `aspect-ratio: 16/9` on `.card img` — risks distorting logos/avatars. Scoped to `.ship-card .thumb img` with `3/2` ratio
- **CORRECTED:** Touch target validation upgraded from "inferred from CSS class" to computed verification (min-height + padding)
- **CORRECTED:** Phases consolidated from 6 to 4 (Governance → Validator → CSS → Audit)
- **CORRECTED:** Validator-first reorder — create measurements before modifying CSS
- **ADDED:** CSS location rule — all mobile CSS in marked section of `styles.css`
- **ADDED:** Specificity rules — no `!important`, no ID selectors for layout
- **ADDED:** Known constraints section for table wrapper HTML exception
- **ADDED:** 360px as viewport floor (was 320px)

**What prompted changes:**
- External review by ChatGPT (systems architect evaluation)
- User decision: This is a permanent Mobile Standard v1.000, not a one-time patch
- Standard now lives in `new-standards/v3.010/` alongside WCAG, ICP-Lite, and Ship Page standards

---

## Table of Contents

1. [Codebase Findings](#1-codebase-findings)
2. [Validator Script Analysis](#2-validator-script-analysis)
3. [AI Advice Analysis — Wheat vs Chaff vs ChatGPT Review](#3-ai-advice-analysis)
4. [Implementation Plan (4 Phases)](#4-implementation-plan)
5. [For Other Claudes](#5-for-other-claudes)

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

### What's Working
- Navigation hamburger menu with full-screen overlay at 768px
- Page-grid collapses to single column at 980px
- Ship pages have `clamp()` typography (`ship-page.css` line 22-30)
- Cards are flex/grid based, generally stack well
- 44px min-height touch targets on `.nav-pill` and `.logbook-btn`
- In-app browser detection forces single-column
- `overflow-x: hidden` on `html, body` (line 26)
- `max-width: 100%` on `img` (line 34)

### What Needs Attention (10 Mobile Friction Points)
1. **No optimization below 480px** — 360px phones get suboptimal rendering
2. **Right rail lacks visual distinction when stacked** — drops below content with no separator
3. **Hero imagery not constrained** — No mobile max-height on hero images
4. **Typography at 360px** — `h1` at `2rem` (32px) may overflow on narrowest viewports
5. **Touch target gaps** — `.dropdown-menu a`, `.faq-item summary`, `.pagination-btn` may be < 44px
6. **Table overflow risk** — `.key-facts`, `.pier-distances-table` lack scroll wrappers
7. **Card image CLS** — No `aspect-ratio` on thumbnails
8. **Weather grid at 360px** — 3-column may be tight
9. **Stats grid at 360px** — 2-column may be tight
10. **No mobile validator** — Regressions go undetected

---

## 2. Validator Script Analysis

### Current State
12 validator scripts exist. **None check mobile-specific CSS.** All focus on HTML structure, content quality, metadata, and WCAG accessibility.

### What's Needed
A new `admin/validate-mobile-readiness.js` module with 8 checks (see standard Section 9.2), integrated into the unified validator and all page-type validators.

### Priority
**Validator creation is Phase 1** — build measurement tools before making changes.

---

## 3. AI Advice Analysis — Wheat vs Chaff vs ChatGPT Review

### From the "Master Mobile Hardening Prompt" (Original AI Chorus)

| Advice | Verdict | Reasoning |
|--------|---------|-----------|
| Preserve nautical identity on mobile | **WHEAT** | Brand identity IS the site |
| Desktop preservation via media queries only | **WHEAT** | Critical constraint |
| Right rail reflow not deletion | **WHEAT** | Directly applicable |
| Typography with clamp(), min 1.4 line-height | **WHEAT** | Proven pattern in ship-page.css |
| Image integrity, aspect-ratio, object-fit | **WHEAT** | CLS prevention |
| Stacking context protection | **WHEAT** | z-index 10000-10001 nav overlay |
| CSS/layout only boundary | **WHEAT** | Aligns with ITW-Lite |
| Force single @media(max-width: 480px) | **CHAFF** | Ignores existing 5-breakpoint system |
| Logical CSS properties (inline-size, etc.) | **CHAFF** | Creates inconsistency in 2,612-line file |
| "Visually identical" on 320px vs 1400px | **CHAFF** | Physically impossible — aim for "spiritually equivalent" |
| Halt on constraint conflict | **PARTIAL** | Document conflict + justify compromise instead |

### What the Original AI Chorus Missed
1. Validator integration (the biggest gap)
2. 15 brand CSS files need auditing
3. In-app browser detection exists and should be leveraged
4. Static hosting constraints (no SSR)
5. Touch targets on ALL interactive elements, not just buttons
6. Real device viewport widths (360, 375, 390, 412)

### From ChatGPT's Systems Architect Review

| Advice | Verdict | Reasoning |
|--------|---------|-----------|
| CSS sprawl risk — define where mobile CSS lives | **VALID** | Marked section at bottom of styles.css |
| `display: block` on tables breaks semantics | **VALID** | Use `.table-scroll` wrapper instead |
| `aspect-ratio: 16/9` blanket risks distortion | **VALID** | Scoped to `.ship-card .thumb img` at `3/2` |
| Touch target "inferred" is symbolic | **VALID** | Need computed verification |
| Phase 0 governance before implementation | **VALID** | Standard created |
| Validator-first, CSS-second reorder | **VALID** | Phase 1 = validator, Phase 2 = CSS |
| Make it a permanent standard | **VALID** | User confirmed — `new-standards/v3.010/` |
| Define max CSS size delta / byte budget | **OVERCORRECTION** | ~3-5KB added to 35KB total is negligible |
| "No duplicate selector inflation beyond Y%" | **OVERCORRECTION** | Media queries inherently re-declare selectors |
| 8 granular phases | **OVERCORRECTION** | Consolidated to 4 |

---

## 4. Implementation Plan (4 Phases)

### Phase 0: Governance ✅ COMPLETE
- Breakpoint hierarchy defined (Standard Section 3)
- CSS location rules established (Standard Section 4)
- Specificity strategy defined (Standard Section 4.3)
- Validator checks specified (Standard Section 9)
- Known constraints documented (Standard Section 8)
- Rollback plan: `git revert` mobile hardening commits

### Phase 1: Validator Creation
1. Create `admin/validate-mobile-readiness.js` with checks MOB-001 through MOB-008
2. Integrate into `admin/validate.js` (unified validator)
3. Run baseline audit: `node admin/validate.js --all`
4. Document baseline metrics (how many pages fail which checks)
5. Integrate into existing page-type validators

### Phase 2: CSS Implementation
All rules in marked `MOBILE HARDENING v1.000` section of `assets/styles.css`:

**At 979.98px (rail stacking):**
- Rail visual distinction (border-top, padding-top, margin-top)

**At 768px (touch targets):**
- `.dropdown-menu a` min-height: 44px
- `.faq-item summary` min-height: 44px
- `.pagination-btn` min-height: 44px
- `footer .tiny a` min-height: 44px

**At 480px (small phone):**
- Heading typography with `clamp()`
- Hero image containment (max-height: 50vh)
- `.stats-grid` may stay 2-col (test first)
- Weather grid column adjustment if needed
- Tracker container height reduction

**At 360px (micro floor):**
- `.stats-grid` collapse to 1-col
- Any remaining overflow fixes

**Targeted HTML additions** (table wrapper exception per Standard Section 8.1):
- Add `.table-scroll` wrapper to `.pier-distances-table` instances
- Add `.table-scroll` wrapper to `.key-facts` instances where overflow confirmed

**Feature CSS additions:**
- `assets/css/ship-page.css`: Tracker container mobile height
- `assets/css/ship-page.css`: `.ship-card .thumb img { aspect-ratio: 3/2; }`

### Phase 3: Audit and Verification
1. Run mobile validator against all pages
2. Audit all 15 brand CSS files for overflow
3. Test at 360px, 375px, 390px, 412px, 768px
4. Verify desktop rendering unchanged
5. Run existing validators (ICP-Lite, ship page, etc.) — all must still pass
6. Document results

---

## 5. For Other Claudes

### What This Is
Implementation plan for **Mobile Standard v1.000** — a permanent, enforceable standard for In the Wake. The standard itself lives at `new-standards/v3.010/MOBILE_STANDARDS_v1.000.md`.

### Decision History
1. Started as one-time mobile hardening plan
2. AI chorus advice evaluated — 7 items kept, 5 discarded, 6 gaps identified
3. ChatGPT reviewed as systems architect — 7 corrections accepted, 3 rejected as overcorrections
4. User decided: permanent standard, not one-time patch
5. Standard created in `new-standards/v3.010/`
6. Plan upgraded from 6 phases to 4 (governance done, validator-first order)

### Key Corrections Made (v1.0.0 → v2.0.0)
- Tables: Don't `display: block` — use `.table-scroll` wrapper
- aspect-ratio: Don't blanket `.card img` — scope to `.ship-card .thumb img` at `3/2`
- Touch targets: Don't "infer" — compute from min-height + padding
- CSS location: Don't scatter — centralized marked section
- Phase order: Validator first, CSS second

### Where to Start
1. Read the standard: `new-standards/v3.010/MOBILE_STANDARDS_v1.000.md`
2. Read CAREFUL.md: `.claude/skills/careful-not-clever/CAREFUL.md`
3. Check if `admin/validate-mobile-readiness.js` exists
4. If not → Phase 1
5. If yes → Phase 2

---

**Soli Deo Gloria** — Excellence as worship, even in responsive design.
