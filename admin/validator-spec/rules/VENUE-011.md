---
id: VENUE-011
name: "Coming soon" ship availability placeholder forbidden on active venues
family: venue
severity: warn
applies-to:
  - venue
provenance: V+S-agree
status: live
implementation:
  - file: admin/validate-venue-page-v2.js
    function: checkVenueComingSoon (S09)
    lines: "672-684 (added 2026-04-16)"
check: page contains "coming soon" AND references real ship names (named ships like "Allure of the Seas" or "Carnival Celebration") — the conjunction of both indicates a placeholder left on an otherwise-active page; pre-launch venues with only coming-soon text are exempt (no real ship refs present)
standards-source:
  - doc: admin/VENUE_PAGE_AUDIT_2026_03_04.md
    section: "Missing ship availability data — 'coming soon' placeholder (18 pages)"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-16
---

## Rule
If a venue page claims to describe a venue that exists, its ship-availability information must not be a "Coming soon" placeholder. 18 pages in the 2026-03 audit had this pattern on venues that actually sail on specific ships — the placeholder was left over from page scaffolding.

Pre-launch venues (genuinely not yet available) are exempt — same principle as SHIP-003 (TBN ships exempt from logbook requirement).

## Why (rationale)
Ship availability is the single most-consulted key fact on a venue page: "Is this venue on MY ship?" A "Coming soon" answer when the venue IS actually available is a broken promise that looks like a half-finished page. Readers who care bail; readers who don't care suspect the rest of the page is equally half-finished.

No validator enforces this; audit caught 18 pages manually. Orphan.

## Pass example
```html
<section class="ship-availability">
  <h3>Available on</h3>
  <ul>
    <li>Allure of the Seas (2010)</li>
    <li>Harmony of the Seas (2016)</li>
    <li>Symphony of the Seas (2018)</li>
    <li>Wonder of the Seas (2022)</li>
    <li>Icon of the Seas (2024)</li>
  </ul>
</section>
```

## Fail example
```html
<section class="ship-availability">
  <h3>Available on</h3>
  <p>Coming soon.</p>
</section>
```
No validator catches today.

## Fix guidance
Populate with real ship availability. If the venue truly is pre-launch, mark the whole page as pre-launch (so this rule plus VENUE-005 logbook-entries etc. can exempt the page appropriately). Do not leave "Coming soon" in prod.
