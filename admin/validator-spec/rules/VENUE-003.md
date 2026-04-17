---
id: VENUE-003
name: Menu-prices section has actual menu items or prices
family: venue
severity: warn
applies-to:
  - venue
provenance: V+S-agree
status: live
implementation:
  - file: admin/validate-venue-page-v2.js
    function: checkMenuPricesContent (T02)
    lines: "317-340"
check: if page has id="menu-prices" section, the section text must include at least one dollar sign, the word "price", or a pattern matching actual menu items (item name followed by price); sections with only "Varies by venue" or "Coming soon" fail at warn
standards-source:
  - doc: admin/VENUE_PAGE_AUDIT_2026_03_04.md
    section: "Generic 'Varies by venue' price key fact — 187 pages have no actionable info"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-16
---

## Rule
A venue's `id="menu-prices"` section, if present, must contain real price information. Dollar signs, the word "price", or item-name/price patterns satisfy. Generic placeholders ("Varies by venue", "Prices subject to change", "Please check with your cruise director") do not satisfy — those phrases were flagged across 187 pages in the 2026-03 venue audit as providing no actionable information.

## Why (rationale)
Readers visit menu-prices to decide whether a venue is within budget. A section that exists but says nothing is worse than no section — it consumes scroll and scans as "this page covers prices" without actually covering prices. The audit identified the specific class of empty-menu-prices content pattern; validator warns on its absence of real content.

## Pass example
```html
<section id="menu-prices">
  <h2>Menu Prices</h2>
  <ul>
    <li>Surf & Turf — $59</li>
    <li>Filet Mignon — $45</li>
    <li>Lobster Tail — $39</li>
  </ul>
</section>
```

## Fail (warning) example
```html
<section id="menu-prices">
  <h2>Menu Prices</h2>
  <p>Prices vary by venue. Please check with your cruise director for current rates.</p>
</section>
```
Validator emits: `Menu section exists but appears to lack actual menu items or prices`.

## Fix guidance
Either populate with real prices (with as-of date + verification note per ICP-2 volatile-data discipline) or remove the section entirely. Empty is worse than absent.
