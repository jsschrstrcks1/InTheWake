# Mobile Standards — v1.000

**Standard ID:** ITW-MOB-001
**Version:** 1.000
**Date:** 2026-02-19
**Status:** ACTIVE — Enforceable standard for all In the Wake pages
**Authority:** ITW-Lite v3.010 Philosophy (AI-first, Human-first, Google second)

---

**Soli Deo Gloria** — Excellence as worship, even in responsive design.

---

## 1. Purpose

This standard defines enforceable rules for mobile responsiveness across all In the Wake pages (320px–430px viewports). It is NOT a one-time patch. It is a permanent governance document that:

- Defines where mobile CSS lives
- Defines breakpoint hierarchy
- Defines specificity rules
- Defines validator checks
- Defines acceptance criteria

All future CSS changes touching mobile viewports MUST comply with this standard.

---

## 2. Guiding Principles

### 2.1 ITW-Lite Mobile Philosophy

Mobile optimization follows the same priority stack as ITW-Lite:

1. **AI-First** — Structured content remains parseable on all viewports
2. **Human-First** — Touch targets, readability, and navigation must be excellent on phones
3. **Google Second** — Mobile-friendliness helps SEO but is not the motivation

### 2.2 Prime Directive

> Phone optimization must preserve nautical identity, hero structure, wake imagery layering, right-rail content, typography hierarchy, serif/sans pairing, whitespace rhythm, and visual depth.
>
> Beauty must not be sacrificed for responsiveness.
> Content must not be hidden for compactness.
> Desktop must not be altered for mobile.

### 2.3 CSS-Only Boundary

Mobile hardening is a CSS/layout concern. Do NOT modify:
- JavaScript behavior
- JSON-LD structured data
- ICP-Lite metadata
- HTML template structure
- Data attributes
- Canonical URLs
- Theological invocation

**One exception:** Canonical wrapper patterns defined in Section 8 of this standard (e.g., `.table-scroll`) are the ONLY permitted HTML additions. These are narrow, pattern-based, validator-enforced changes — not discretionary HTML edits. No other HTML modifications are authorized under this standard.

---

## 3. Breakpoint Hierarchy

### 3.1 Official Breakpoints (Ordered)

| Token | Value | Role | Usage |
|-------|-------|------|-------|
| `--bp-xs` | 360px | Micro — narrowest phones (iPhone SE, Galaxy S) | Typography floor, extreme spacing |
| `--bp-sm` | 480px | Small phone — primary mobile target | Layout stacking, table overflow |
| `--bp-md` | 768px | Tablet/mobile nav boundary | Hamburger menu, dropdown reflow |
| `--bp-lg` | 980px | Desktop — page-grid 2-col threshold | Rail stacking, grid-2 collapse |
| `--bp-xl` | 1400px | Large screens | Optional enhancements only |

### 3.2 Rules

1. **Use existing breakpoints.** Do not introduce new breakpoint values without updating this document.
2. **Mobile-up is preferred** for new layout rules (`min-width`). **Desktop-down is acceptable** for overrides (`max-width`).
3. **Never nest media queries.** One level of `@media` only.
4. **Cascade order matters.** Within the Mobile Hardening section (see Section 4), order queries from largest to smallest breakpoint.
5. **360px is the floor.** No content may overflow or become unreadable at 360px.

### 3.3 Real Device Reference

| Width | Device | Priority |
|-------|--------|----------|
| 360px | Samsung Galaxy S series | P1 |
| 375px | iPhone SE (3rd gen), iPhone 13 mini | P1 |
| 390px | iPhone 14, iPhone 15 | P1 |
| 412px | Pixel 7, Pixel 8 | P1 |
| 430px | iPhone 14/15 Pro Max | P2 |
| 320px | iPhone SE (1st gen) — legacy | P3 |
| 768px | iPad mini (portrait) | P1 |

---

## 4. CSS Location Rules

### 4.1 Where Mobile CSS Lives

**All mobile hardening CSS MUST live in a clearly-marked section at the bottom of `assets/styles.css`**, before the print styles section.

```css
/* =========================================================================
   MOBILE HARDENING v1.000 (2026-02-19)
   Standard: new-standards/v3.010/MOBILE_STANDARDS_v1.000.md
   ========================================================================= */

/* --- 980px: Rail stacking, grid collapse --- */
@media (max-width: 979.98px) {
  /* rules here */
}

/* --- 768px: Touch targets, nav adjustments --- */
@media (max-width: 768px) {
  /* rules here */
}

/* --- 480px: Small phone layout --- */
@media (max-width: 480px) {
  /* rules here */
}

/* --- 360px: Micro viewport floor --- */
@media (max-width: 360px) {
  /* rules here */
}

/* =========================================================================
   END MOBILE HARDENING
   ========================================================================= */
```

### 4.2 Rules

1. **One location.** All mobile hardening rules go in this section. Do not scatter mobile rules throughout styles.css or other files.
2. **Descending order.** Largest breakpoint first, smallest last (specificity cascade).
3. **Feature CSS exceptions.** `ship-page.css`, `calculator.css`, and `ships-dynamic.css` MAY contain page-specific mobile rules in their own marked sections, following the same format.
4. **Brand CSS files.** Brand CSS (`assets/css/brands/*.css`) should NOT contain mobile rules unless fixing a brand-specific overflow. Document any exceptions.
5. **Comment every block.** Each rule group must have a comment explaining what it fixes.

### 4.3 Specificity Rules

1. **No `!important`** in mobile hardening CSS. If specificity is insufficient, increase selector specificity by adding parent context (e.g., `.page-grid .rail` instead of `.rail`).
2. **No ID selectors** for layout. IDs are for anchors and JS hooks only.
3. **Prefer class selectors.** Match existing codebase patterns.
4. **No inline styles.** All responsive behavior must be in stylesheets.

---

## 5. Typography Rules

### 5.1 Minimum Sizes

| Element | Minimum Size | Method |
|---------|-------------|--------|
| Body text | 15px | Base `font-size` on `body` (currently 16px — compliant) |
| `h1` | 1.4rem at 360px | `clamp()` |
| `h2` | 1.15rem at 360px | `clamp()` |
| `h3` | 1rem at 360px | `clamp()` |
| Line height | 1.4 minimum | All text elements |
| Link text | 15px | Must remain readable |

### 5.2 clamp() Pattern

All headings in the mobile hardening section should use `clamp()`:

```css
@media (max-width: 480px) {
  h1 { font-size: clamp(1.4rem, 6vw, 2rem); }
  h2 { font-size: clamp(1.15rem, 4.5vw, 1.5rem); }
  h3 { font-size: clamp(1rem, 3.5vw, 1.25rem); }
}
```

### 5.3 Preserve Hierarchy

- Heading weight ratios must remain consistent (h1 > h2 > h3)
- Serif/sans pairing (body sans, heading system-ui) must not change
- Letter spacing and line height must not drop below minimums

---

## 6. Touch Target Rules

### 6.1 Minimum Size

All interactive elements MUST have a minimum touch target of **44 x 44 CSS pixels** on viewports ≤768px.

### 6.2 Elements That Must Comply

| Element | Selector | Current Status |
|---------|----------|----------------|
| Nav pills | `.nav-pill` | Compliant (min-height: 44px) |
| Dropdown links | `.dropdown-menu a` | Needs enforcement |
| FAQ toggles | `.faq-item summary` | Needs enforcement |
| Pagination buttons | `.pagination-btn` | Needs enforcement |
| Logbook buttons | `.logbook-btn` | Compliant (min-height: 44px) |
| Ship cards | `.ship-card` | Compliant (padding + content) |
| Footer links | `footer a` | Needs enforcement |

### 6.3 Enforcement CSS Pattern

```css
@media (max-width: 768px) {
  .dropdown-menu a,
  .faq-item summary,
  .pagination-btn,
  footer .tiny a {
    min-height: 44px;
    display: flex;
    align-items: center;
  }
}
```

### 6.4 Validator Check

The mobile validator MUST verify that interactive elements within mobile media queries have either:
- `min-height: 44px` declared, OR
- `padding` that computes to ≥44px total height (e.g., `padding: 12px` + `line-height: 1.5` on `16px` text = 12+24+12 = 48px)

---

## 7. Layout Rules

### 7.1 Right Rail Reflow

When `.page-grid` collapses to single column (≤979.98px), the right rail MUST:
- Stack below main content
- Have a visible section separator (border-top using `--rope` color)
- Maintain all content (nothing hidden)
- Have adequate top padding/margin for visual distinction

```css
@media (max-width: 979.98px) {
  .page-grid > .rail,
  .page-grid > aside {
    border-top: 2px solid var(--rope);
    padding-top: 1.5rem;
    margin-top: 1rem;
  }
}
```

### 7.2 Grid Behavior

| Grid | Desktop | Tablet (≤980px) | Mobile (≤480px) |
|------|---------|------------------|-----------------|
| `.page-grid` | 2-col (content + rail) | 1-col | 1-col |
| `.grid-2` | 2-col | 1-col | 1-col |
| `.grid-3` | 3-col | 1-col | 1-col |
| `.vx-grid` | 3-col | 2-col | 1-col |
| `.stats-grid` | 2-col | 2-col | 1-col at 360px |

### 7.3 Overflow Prevention

1. `html, body` must have `overflow-x: hidden` (currently present — line 26 of styles.css)
2. No element may have a fixed width greater than `100vw`
3. Tables that may overflow MUST be wrapped in a `.table-scroll` container (see Section 8)
4. Images must have `max-width: 100%` (currently present — line 34 of styles.css)

### 7.4 Image Rules

1. Hero images: `max-height: 50vh` on mobile, `width: 100%`, `object-fit: cover`
2. Card thumbnail images (`.ship-card .thumb img`): `aspect-ratio: 3/2` (NOT blanket 16/9 — verified against actual card image proportions)
3. Avatar images: exempt from aspect-ratio (already `border-radius: 50%`)
4. Logo images: exempt from aspect-ratio
5. No `aspect-ratio` on `.card img` globally — too broad, risks distorting non-standard images

---

## 8. Known Constraints and Exceptions

### 8.1 Table Wrapper Exception (Canonical HTML Pattern)

**Constraint:** Tables (`.pier-distances-table`, `.key-facts`, `.stats-grid`) may overflow on narrow viewports. CSS `overflow-x: auto` on the table itself requires `display: block`, which breaks table semantics and accessibility.

**Resolution:** All scrollable tables MUST use the `.table-scroll` canonical wrapper:

```html
<div class="table-scroll">
  <table class="pier-distances-table">...</table>
</div>
```

```css
.table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
```

**Rules:**
1. This is the ONLY permitted HTML wrapper pattern under this standard
2. No variations — always `<div class="table-scroll">`, always wrapping the `<table>` element directly
3. The wrapper adds zero visual change on desktop (no padding, no border, no background)
4. Table content, semantics, `<thead>`, `<tbody>`, and styling remain unchanged
5. Validator check MOB-004 enforces wrapper presence on tables wider than 480px
6. Apply only to tables confirmed to overflow at 360px — do not pre-emptively wrap all tables

**Scope:** `.pier-distances-table`, `.key-facts`, and any future table that overflows at 360px.

### 8.2 Stats Grid at 360px

**Constraint:** `.stats-grid` (2-column) may be too tight at 360px.

**Resolution:** Collapse to 1-column at 360px:
```css
@media (max-width: 360px) {
  .stats-grid { grid-template-columns: 1fr; }
}
```

### 8.3 Brand CSS Exceptions

If a brand CSS file (`assets/css/brands/*.css`) causes mobile overflow, the fix should:
1. Be documented in this section
2. Use the same marked-section format
3. Be minimal (overflow fix only, not redesign)

**Currently known:** None. Brand audit required.

---

## 9. Validator Requirements

### 9.1 New Module: `admin/validate-mobile-readiness.js`

A universal mobile validation module callable by all page-type validators.

### 9.2 Required Checks

| ID | Check | Severity | Description |
|----|-------|----------|-------------|
| MOB-001 | Viewport meta | BLOCKING | `<meta name="viewport" content="width=device-width,initial-scale=1">` must exist |
| MOB-002 | No inline fixed widths | WARNING | No `style="width: Npx"` where N > 480 on any element |
| MOB-003 | Hero image constrained | WARNING | Hero images must have `max-width: 100%` or be inside a constrained container |
| MOB-004 | Table overflow handling | WARNING | Tables wider than 480px must be inside `.table-scroll` or have CSS overflow handling |
| MOB-005 | Touch target declarations | WARNING | Interactive elements must have `min-height: 44px` in CSS or computed equivalent |
| MOB-006 | No horizontal scroll | BLOCKING | No element with fixed width > 100vw |
| MOB-007 | Font size floor | WARNING | Body text must not go below 15px equivalent |
| MOB-008 | Mobile hardening section | INFO | `styles.css` must contain the `MOBILE HARDENING` comment block |

### 9.3 Integration

The mobile readiness module is part of the **mandatory validation chain**. It MUST be called by:
- `validate.js` (unified validator) — for ALL page types
- `validate-ship-page.js` — as additional checks
- `validate-port-page-v2.js` — as additional checks
- `validate-venue-page-v2.js` — as additional checks

### 9.4 Enforcement Policy

**All future ship, port, and venue pages MUST pass mobile validation before publish.**

This is mandatory, not advisory. Mobile readiness is part of `validate.js` mandatory chain, equal in authority to ICP-Lite and WCAG checks.

**Phased rollout to avoid blocking 1,100+ existing pages:**

| Phase | Scope | BLOCKING checks | WARNING checks |
|-------|-------|-----------------|----------------|
| Phase 1 (validator creation) | New and modified pages only | MOB-001, MOB-006 | MOB-002 through MOB-008 |
| Phase 2 (after CSS implementation) | All pages | MOB-001, MOB-006 | MOB-002 through MOB-008 |
| Phase 3 (after 90%+ compliance) | All pages | ALL checks upgraded to BLOCKING | None |

**Rationale:** Enabling all checks as BLOCKING immediately would fail the majority of existing pages that haven't been touched. Phased rollout allows forward progress without blocking the entire pipeline.

### 9.5 Validation Severity Levels

| Level | Meaning | Behavior |
|-------|---------|----------|
| BLOCKING | Must fix before commit | Fails validation, blocks publish |
| WARNING | Should fix, logged to `admin/validation-warnings.log` | Passes with warning |
| INFO | Informational only | Logged, no action required |

---

## 10. Implementation Phases

### Phase 0 — Governance (This Document)
- Define breakpoint hierarchy ✅ (Section 3)
- Define CSS location rules ✅ (Section 4)
- Define specificity strategy ✅ (Section 4.3)
- Define validator checks ✅ (Section 9)
- Define known constraints ✅ (Section 8)
- Define rollback plan: `git revert` the mobile hardening commits. All changes are in marked sections.

### Phase 1 — Validator Creation
- Create `admin/validate-mobile-readiness.js`
- Integrate into unified validator
- Run baseline audit against all page types
- Document baseline metrics

### Phase 2 — CSS Implementation
- Add Mobile Hardening section to `assets/styles.css`
- Implement typography clamp() rules
- Implement touch target rules
- Implement rail reflow visual distinction
- Implement image containment
- Add table overflow handling (CSS + minimal HTML wrappers where needed)
- Add page-specific rules to `ship-page.css` and `calculator.css`

### Phase 3 — Audit and Verification
- Run validator against all pages
- Audit all 15 brand CSS files
- Test at 360px, 375px, 390px, 412px, 768px
- Verify desktop unchanged
- Document results

---

## 11. Acceptance Criteria

- [ ] No horizontal scroll at any width 360px–430px
- [ ] All touch targets ≥44px at ≤768px
- [ ] Typography readable at 360px (no overflow, no truncation)
- [ ] Right rail visually distinct when stacked
- [ ] Hero images scale without cropping key content
- [ ] Tables scrollable or reformatted at narrow widths
- [ ] Navigation hamburger works smoothly at all test widths
- [ ] Dropdowns don't overflow viewport
- [ ] Desktop rendering unchanged (pixel-identical)
- [ ] All existing validators still pass
- [ ] Mobile validator passes on all page types
- [ ] Lighthouse mobile score ≥90 (advisory — not blocking)

---

## 12. For Other Claudes

### What This Standard Is
A permanent, enforceable mobile responsiveness standard for the In the Wake website. It lives alongside the WCAG, ICP-Lite, and Ship Page standards as a first-class governance document.

### What It Replaces
Nothing. This is new. Mobile was previously handled ad-hoc across scattered media queries.

### Key Decisions Already Made
1. CSS-only changes (no JS, no metadata changes)
2. Marked section in `styles.css` (not scattered)
3. Existing breakpoint system (no new architecture)
4. Validator-first implementation (measure before modify)
5. Table wrapper exception allowed (HTML `<div class="table-scroll">`)
6. `aspect-ratio` scoped to thumbnails only (not blanket)
7. Touch target enforcement via `min-height: 44px`
8. `clamp()` for heading typography
9. 360px as the viewport floor (not 320px)

### Where to Start
1. Read this standard
2. Read `.claude/plan-mobile-hardening.md` (tactical plan)
3. Check if `admin/validate-mobile-readiness.js` exists yet
4. If not, create it (Phase 1)
5. If yes, run baseline, then implement CSS (Phase 2)

---

## Version History

**v1.000** (2026-02-19) — Initial standard
- Breakpoint hierarchy defined
- CSS location rules established
- Typography, touch target, layout rules codified
- Validator requirements specified
- 4-phase implementation plan
- Known constraints documented

---

**Soli Deo Gloria** ✝️
