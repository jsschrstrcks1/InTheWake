# Phase G — Ships

**Date:** 2026-05-09
**Branch:** `claude/improve-mobile-friendliness-W90DR`
**Scope:** Mobile audit of 5 ship pages spanning brands, plus hardening of the ship-side D-3 generator. Two CSS lines + one generator changed.

## Sample audited

| Brand | File |
|---|---|
| Carnival | `ships/carnival/carnival-celebration.html` |
| RCL | `ships/rcl/allure-of-the-seas.html` |
| Norwegian | `ships/norwegian/norwegian-aqua.html` |
| MSC | `ships/msc/msc-bellissima.html` |
| Princess | `ships/princess/caribbean-princess.html` |

## Validator + overflow scan results (pre-fix)

```
Total: 5 | Pass: 5 | Fail: 0 | Blocking: 0 | Warnings: 0
```

Programmatic 360 px overflow scan: `bodyScrollWidth === viewportWidth` on all 5. The reported "overflows" in Swiper slides are false positives from my scanner — Swiper positions slides off-canvas with `transform: translate3d()` inside a clipped container, not a real horizontal scroll.

## Visible defects found in screenshots

### Defect G-1 — Phase C over-scoped to MSC paragraph hero-credit (introduced in Phase C; surfaced now)

**MSC ship pages** (and a few other pages) use a different hero-credit pattern:

```html
<p class="hero-credit tiny">Hero layout and compass graphics by <a>Ken Baker</a> for In the Wake.</p>
```

vs the home / port / RCL pattern:

```html
<div class="hero-credit"><a class="pill">Photo © Flickers of Majesty</a></div>
```

Phase C's rule (`assets/styles.css:2485-2494`) treated both the same — it lifted `.hero-credit` to `top: .85rem` at ≤480 px. For pill-pattern this is the intended fix. For paragraph-pattern, the long text wrapped at top-right and **overlapped the navbar / hamburger button** on 21 MSC pages.

**Fix:** scope Phase C to `:not(.tiny)`. The pill-pattern rule still applies; the paragraph variant returns to its base bottom-right placement.

```diff
-  .hero-credit {
+  .hero-credit:not(.tiny) {
     top: .85rem;
     right: .85rem;
     bottom: auto;
   }
-  .hero-credit .pill,
-  .hero-credit .pill.long {
+  .hero-credit:not(.tiny) .pill,
+  .hero-credit:not(.tiny) .pill.long {
     font-size: .8rem;
     padding: .35rem .6rem;
   }
```

`.hero-credit.tiny` paragraph variant returning to its base position (`bottom: .85rem; right: .85rem`) does not fully resolve the long-text wrapping issue on small phones — the paragraph still partially overlaps the hero logo / tagline area on MSC pages. **That is a pre-existing condition unchanged by Phase G**, not introduced by my work; documented as Defect G-2 below.

### Defect G-2 — MSC paragraph hero-credit pre-existing overlap (NOT FIXED in Phase G)

Status: surfaced by the audit, not addressed.

Symptom: on MSC ship pages at ≤480 px, the long-text `<p class="hero-credit tiny">` paragraph at bottom-right of the hero overlaps the In-the-Wake wake logo / "A Cruise Traveler's Logbook" tagline.

Reason for deferral: the overlap exists in the BEFORE-Phase-C state too (the paragraph was always positioned absolute at bottom-right). Phase C's scope error made it WORSE (overlapping the navbar), and Phase G restores the BEFORE state. Properly fixing the underlying overlap is its own design choice (hide on mobile? bottom strip? wrap to standard pill form?) and is not in scope for "Phase G mobile audit + generator hardening."

Recommended next step (out of scope here): one focused commit that either (a) moves the paragraph variant to a static bottom-of-hero strip, or (b) replaces the `<p class="hero-credit tiny">` markup on the 21 MSC pages with the standard `<div class="hero-credit"><a class="pill">…</a></div>` form. (b) is more invasive but produces consistent rendering across the site.

## D-3 ship-side generator hardening

`admin/normalize_ship_rails.py` had the antipattern hardcoded at two lines:

```diff
-    <aside class="rail" role="complementary" aria-label="Key facts, author & articles" style="grid-column: 2; grid-row: 1;">
+    <aside class="rail col-2" role="complementary" aria-label="Key facts, author & articles">
…
-    <div style="grid-column: 1; grid-row: 1;">
+    <div class="col-1">
```

The two regex patterns at lines 186 / 201 (`r'<section class="page-intro" style="grid-column: 2; …'`) are search regexes used to MATCH and DELETE old content during normalization, not emit templates. They were left alone — they correctly catch the antipattern in pages still bearing it.

A `--self-test` flag added to `main()`:

1. Formats `RIGHT_RAIL_TEMPLATE` with a fixture ship name
2. Greps the formatted output for D-2 and D-3 antipattern regexes
3. Exits 1 with labelled output on any match, 0 otherwise

### Adversarial verification

Temporarily reintroduced the rail aside antipattern, ran `--self-test`:

```
SELF-TEST FAILED. Antipatterns matched in emitted template:
  - rail aside with inline grid-column:2 (D-3): <aside\s+class="rail"\s+[^>]*style="grid-column:\s*2
exit code: 1
```

Restoring the canonical line returned the test to exit 0. Reproducible.

## Verification

- Validator run after fix on the 5 ships + index + abu-dhabi + drink-calculator: 8 / 8 PASS, 2 pre-existing MOB-007 warnings, no new warnings.
- Playwright captures at 360 / 430 / 1280 confirm:
  - Carnival, RCL Allure, Norwegian, Princess: hero clean, photo-credit pill at top-right (Phase C still applying because they're pill-pattern), no navbar overlap.
  - MSC Bellissima: paragraph hero-credit no longer overlaps hamburger; back to bottom-right base behavior. Defect G-2 (paragraph overlapping tagline) remains pre-existing.
  - All 5 desktop captures: 2-column layout intact, rail at right.

## v1.7 confidence audit

| Material assumption | Verified? | Confidence |
|---|---|---:|
| Phase C's broad selector `.hero-credit` was the cause of the MSC navbar overlap | Read both HTML patterns, traced the rule application, confirmed the scoping fix returns the paragraph to its base position | 9 |
| `:not(.tiny)` correctly differentiates the two patterns site-wide | Pill-pattern instances do not have `class="tiny"`; paragraph instances do. Sampled both groups | 9 |
| 21 MSC ship pages were the only paragraph-variant population | Grep across all HTML files: `<p class="hero-credit tiny"` matches only the 21 MSC ships | 10 |
| Ship sample is representative across brands | 5 brands sampled (Carnival, RCL, NCL, MSC, Princess); home/port/article visually unchanged | 7 (5 of 16 ship-line dirs sampled) |
| Generator self-test catches regressions | Adversarial inject + revert verified once | 9 |
| Existing ship pages already use `class="col-1"` / `class="rail col-2"` | Spot-checked Allure source — uses `<section class="col-1">` and is canonical | 8 (1 of 5 sampled in source) |

Lowest item (7): "Ship sample is representative." 5 of 16 ship-line dirs were screenshot-sampled. The remaining 11 (Cunard, Holland America, Celebrity, Costa, Explora, Oceania, Regent, Seabourn, Silversea, Virgin, MSC overlap, etc.) weren't visually audited. Mitigation: the validator ran against carnival-celebration which is one of the 5; expanding the sample is cheap if you want. Not done in this commit per proportionality.

## Out of scope, deliberately

- **Defect G-2 (MSC paragraph overlap)** — pre-existing, separate design call.
- **D-1 MOB-007 typography** — independent track.
- **Phase H (ports — 3 D-3 generators)** — next per rollout.
- **Allure two-pill rendering** — works fine after Phase G; the design with two pills is intentional content (Flickers of Majesty + Instagram), not a defect.

## Files changed

- `assets/styles.css` — Phase C scope narrowed to `:not(.tiny)` (4 lines edited).
- `admin/normalize_ship_rails.py` — emit template canonicalised + `--self-test` flag added.
- `admin/audit-reports/screenshots/phase-g-audit/` — 15 PNGs (5 ships × 3 viewports).

---

**Soli Deo Gloria.**
