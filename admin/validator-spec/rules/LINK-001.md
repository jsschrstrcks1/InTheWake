---
id: LINK-001
name: Ship-page venue references must resolve to existing venue pages
family: link
severity: warn
applies-to:
  - ship
provenance: S-only
status: live
implementation: none
check: for every venue mentioned by name in a ship page's dining section (or linked via href to /restaurants/<slug>.html), a corresponding venue page must exist at restaurants/<slug>.html; missing pages warn
standards-source:
  - doc: admin/claude/SITE_REFERENCE.md
    section: "Venue page convention"
  - doc: admin/VENUE_PAGE_AUDIT_2026_03_04.md
    section: "Venue coverage gap"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-16
---

## Rule
Every venue referenced by name inside a ship page (dining section, logbook entries, FAQ answers) must have a corresponding venue page at `restaurants/<slug>.html`. Mentions that don't resolve to an actual venue page are content debt — readers follow the implied promise of "learn more about this venue" and find nothing.

No validator enforces this today. Orphan until implemented.

## Why (rationale)
**Scale finding (user, 2026-04-16):** ship pages reference on the order of ~10 venues each across 295 ships. The venue catalogue contains 472 pages. Many unique venue references across the ship fleet have no venue page at all — potentially thousands of unmet references when the count is taken properly (unique venues × ship-presence).

This is the venue-coverage-gap shape: the ~472 existing venue pages have their own content debt (VENUE-009 "Guest Experience Summary" on 297 pages; VENUE-010 "Varies by venue" on 187 pages; VENUE-011 "Coming soon" on 18 pages). That debt is only the pages that DO exist. The larger unmapped debt is the ship-referenced venues with no page at all.

Without this rule, the problem is invisible to the spec system — the validator can pass a ship page with a dozen venue mentions and zero venue pages for any of them. Readers click, find nothing, distrust the site.

## Pass example
Ship page Allure of the Seas mentions Chops Grille in its dining section. A venue page exists at `restaurants/chops-grille.html` (or `restaurants/chops-grille-allure-of-the-seas.html` per whatever slug convention is canonical). Passes.

## Fail (warning) example
Ship page mentions "Izumi Hibachi" in its dining section; no file at `restaurants/izumi-hibachi.html` or any near-match slug exists. Validator emits: `Venue reference "Izumi Hibachi" has no matching venue page at restaurants/`.

## Fix guidance

**Preferred:** create the missing venue page. Even a sparse venue page (logbook stub + basic facts + FAQ) is better than a dangling reference. Apply VENUE-002..011 rules as the page matures.

**Alternative:** remove the name-drop from the ship page if the venue isn't actually on the ship. Broken references often indicate the ship page was templated from another ship and not properly de-scoped.

**NOT acceptable:** creating a placeholder venue page with "Coming soon" content — that fails VENUE-011. Create a real stub or don't create it.

## Implementation approach (for a future validator)
1. Parse each ship page's dining section + logbook entries + FAQ for venue-name mentions or `/restaurants/...` hrefs
2. Build a registry of declared venue-slug references across the fleet
3. Diff against the filesystem: which references have files, which don't
4. Emit warning on mismatch
5. Track total gap as a rolling metric (target: decreasing)

## Related
- VENUE-009 — the content debt on the 297 pages that DO exist ("Guest Experience Summary" template)
- VENUE-010 / VENUE-011 — other content-placeholder failures on existing pages
- The scale observation: existing-page debt ≈ 300-400 pages; ship-reference gap likely ≥ that.
