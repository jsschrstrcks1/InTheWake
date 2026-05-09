# Mobile Readiness Baseline — 2026-05-09

**Branch:** `claude/improve-mobile-friendliness-W90DR`
**Validator:** `admin/validate-mobile-readiness.js` (Mobile Standard v1.000)
**Purpose:** Capture pre-fix state before Phase B (narrow `[class*="hero"] img` selector) and downstream phases.

---

## Sample set (8 pages, one per page-type)

| # | Page-type | File |
|---|---|---|
| 1 | Home | `index.html` |
| 2 | Ship | `ships/carnival/carnival-celebration.html` |
| 3 | Port | `ports/abu-dhabi.html` |
| 4 | Article | `articles/cruise-tipping-2026.html` |
| 5 | Calculator | `drink-calculator.html` |
| 6 | Venue | `restaurants/150-central-park.html` |
| 7 | Tool (budget) | `tools/cruise-budget-calculator.html` |
| 8 | Tool (port-day) | `tools/port-day-planner.html` |

## Validator results

```
Total: 8 | Pass: 8 | Fail: 0
Blocking: 0 | Warnings: 4 | Info: 0
```

| Page | MOB-001 viewport | MOB-006 no-h-scroll | MOB-007 font floor |
|---|---|---|---|
| index.html | pass | pass | **warn** — 15 elements <15px (`<strong>` 13–14px in nav cards) |
| ships/carnival/carnival-celebration.html | pass | pass | pass |
| ports/abu-dhabi.html | pass | pass | pass |
| articles/cruise-tipping-2026.html | pass | pass | **warn** — 1 `<caption>` at 14px |
| drink-calculator.html | pass | pass | **warn** — 2 elements (`<p>` 14px policy notice; `<table>` 14px) |
| restaurants/150-central-park.html | pass | pass | pass |
| tools/cruise-budget-calculator.html | pass | pass | **warn** — 1 `<button>` at 13px |
| tools/port-day-planner.html | pass | pass | pass |

All MOB-002, MOB-003, MOB-004, MOB-005, MOB-008 checks passed (no warnings reported for the sampled files).

## Important caveat — what the validator does NOT detect

The known root-cause bug (`assets/styles.css:2453–2461` — the `[class*="hero"] img` rule blowing up `.hero-compass`, `.brand img`, and `.hero-title .logo` on viewports ≤480 px) is **invisible to static analysis**. The validator inspects HTML markup and the presence of CSS rules; it does not simulate the cascade nor render the page. So a green run here is *not* evidence that mobile rendering is healthy — only that the markup-level checks pass. The screenshot evidence supplied by the user (iPhone Pro Max, 430 px viewport) shows the actual visual regression caused by that selector.

## Baseline-only follow-ups (logged here, not fixed in Phase B)

- **MOB-007 nav strong-tags on home.** 15 `<strong>` labels in nav cards at 13–14 px. Out of scope for the hero-selector fix; revisit during Phase E (360 px audit) or as a separate typography pass.
- **MOB-007 calculator policy/table text.** 14 px `<p>` and `<table>` in `drink-calculator.html`. Same scope decision.
- **MOB-007 budget calculator auto-button.** 13 px button label. Same.

## Phase B exit criteria

After Phase B (selector narrowing) the same 8 files must:

1. Continue to pass MOB-001 and MOB-006.
2. Show no NEW warnings introduced by the change.
3. Render correctly at 430 / 390 / 360 px — verified by a Playwright screenshot diff or manual device test against the user-supplied baseline screenshot.

## Verification commands

```bash
node admin/validate-mobile-readiness.js \
  index.html \
  ships/carnival/carnival-celebration.html \
  ports/abu-dhabi.html \
  articles/cruise-tipping-2026.html \
  drink-calculator.html \
  restaurants/150-central-park.html \
  tools/cruise-budget-calculator.html \
  tools/port-day-planner.html
```

---

**Soli Deo Gloria.**
