# Mobile Phase E — 360 px audit

**Date:** 2026-05-09
**Branch:** `claude/improve-mobile-friendliness-W90DR`
**Scope (per plan):** Walk the home page at 360 px. Add fixes inside the existing `@media (max-width: 360px)` block. No new breakpoints.

## Result

**No code changes.**

The home page (`index.html`) at 360 px:

- `document.documentElement.clientWidth` = 360
- `document.body.scrollWidth` = 360 — no horizontal scroll
- Programmatic overflow scan: zero elements wider than the viewport
- Visual inspection (`admin/audit-reports/screenshots/phase-d/home-360.png`): hero clean, tagline + credit pill not colliding (Phase C), brand + hamburger fit, all body content legible, no truncation

Nothing in the existing `@media (max-width: 360px)` block needs to be added for the home page beyond the existing `.stats-grid { grid-template-columns: 1fr }` rule.

## Findings outside the home-page scope (deferred)

While capturing the Phase D/E screenshot set, two larger issues surfaced that deserve their own decision rather than a quiet bulk fix:

### F-1. Inline `grid-column: 2` antipattern on `<aside class="rail">` — 350 files

`ports/abu-dhabi.html:605` and 349 other HTML files have:

```html
<aside class="rail" style="grid-column: 2; grid-row: 1; align-self: start;">
```

The CSS at `assets/styles.css:447-449` correctly collapses `.page-grid` to a single column at ≤979.98 px, but the inline `grid-column: 2` overrides the cascade and forces the rail into an implicit second column. Result: at 360 px the main content gets squashed to 1–2 character columns (visible in `phase-d/port-360.png` and `phase-d/tool-360.png`).

**Why this can't be fixed in CSS alone:** inline styles beat any selector on specificity. The only CSS-only override is `!important`, which the Mobile Standard (`MOBILE_STANDARDS_v1.000.md` §4.3.1) explicitly forbids. The Standard also forbids inline styles for layout (§4.3.4) — so the inline attribute is itself the bug.

**Options:**
- (A) Bulk HTML rewrite: regex-strip `style="grid-column: 2; …"` from `<aside class="rail">` across 350 files. Mechanical, scriptable, but 350-file blast radius — careful-not-clever says this needs explicit user approval.
- (B) Pilot first: fix on the eight Phase A sample files only, verify, then propose the bulk rollout.
- (C) Per-template fix: identify the templates that emit this and fix at the source so future regenerations don't reintroduce it.

Recommend (B) → (A) once the pilot proves the visual fix.

### F-2. Stylesheet version drift on the venue sample

`restaurants/150-central-park.html:65`:

```html
<link rel="stylesheet" href="https://cruisinginthewake.com/assets/styles.css?v=2.257">
```

- Absolute production URL (every other sample uses relative `/assets/styles.css?v=…`).
- Version pinned at `v=2.257` while the rest of the site is on `v=3.010.300`–`v=3.010.400`.

Real-world impact: in production this still loads (cache-busted to v2.257 at production), so users may see a stale version of styles. Validator `MOB-008` doesn't flag it.

Out of scope for this branch but worth a separate task — a "stylesheet ref hygiene" audit across all 472 venue pages.

### F-3. MOB-007 font-floor warnings (existing)

Held over from Phase A baseline:
- `index.html` — 15 `<strong>` labels at 13–14 px in the nav cards
- `articles/cruise-tipping-2026.html` — 1 `<caption>` at 14 px
- `drink-calculator.html` — 1 `<p>` (policy notice) + 1 `<table>` at 14 px
- `tools/cruise-budget-calculator.html` — 1 `<button>` at 13 px

Small typography pass. Not Phase E because the validator already documents them and the visual readability at 360 px is acceptable to me; would prefer a deliberate typography-bumping commit rather than a scattered fix.

## Verification commands

```bash
node admin/validate-mobile-readiness.js index.html
# Phase E audit: 0 horizontal overflow, document.body.scrollWidth === 360
```

---

**Soli Deo Gloria.**
