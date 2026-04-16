---
id: SHIP-007
name: First-look and dining sections use grid-2 layout
family: ship
severity: warn
applies-to:
  - ship
provenance: V-only
status: live
implementation:
  - file: admin/validate-ship-page.js
    function: validateLayoutPatterns (grid2 firstlook dining check)
    lines: "1176-1200"
check: if page contains both first_look and dining content, they should appear in a grid-2 layout pattern (class "grid2" or equivalent two-column CSS grid)
standards-source: silent
standards-backfill: yes
decision: FINAL
last-updated: 2026-04-16
---

## Rule
Ship pages should present first_look and dining sections in a two-column grid layout (`.grid2` class or equivalent). This is a layout-pattern rule — the content can satisfy SHIP-002 / SHIP-004 without passing SHIP-007 if it's in a single column.

Validator emits WARNING (not error) because the grid is a design preference, not a functional requirement. The 2026-02 audit flagged 172 ship pages missing this pattern.

## Why (rationale)
The first_look + dining pairing is the ship page's visual identity — they reinforce each other above the logbook's emotional weight. A two-column grid lets the reader absorb both simultaneously. A single-column stack buries dining under first_look imagery and loses the visual conversation between "this is the space" and "this is what you eat in the space."

## Pass example
```html
<div class="grid2">
  <section class="first-look">...</section>
  <section class="dining">...</section>
</div>
```

## Fail (warning) example
```html
<section class="first-look">...</section>
<section class="dining">...</section>
```
Sections exist but not grid-paired. Validator emits: `missing_grid2_firstlook_dining`.

## Fix guidance
Wrap first_look and dining in a `.grid2` container. CSS: `.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }`. Mobile fallback: `@media (max-width: 768px) { .grid2 { grid-template-columns: 1fr; } }` — stacking is correct on narrow viewports; the grid is for desktop.
