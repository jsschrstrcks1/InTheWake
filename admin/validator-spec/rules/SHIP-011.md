---
id: SHIP-011
name: Ship page navigation includes Internet at Sea link
family: ship
severity: error
applies-to:
  - ship
provenance: V-only
status: live
implementation:
  - file: admin/validate-ship-page.js
    function: validateNavigation (Internet at Sea check)
    lines: "683-691"
check: primary navigation links (nav.site-nav a, nav.site-nav .dropdown-menu a) must include /internet-at-sea.html
standards-source:
  - doc: admin/claude/SITE_REFERENCE.md
    section: "Gold standard navigation — Internet at Sea required"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-16
---

## Rule
The ship-page primary navigation must include a link to `/internet-at-sea.html`. The validator checks this explicitly as a BLOCKING error because the link was recently added to the gold standard and 302 of 315 ship pages failed at the 2026-02 audit for missing it.

## Why (rationale)
Internet at Sea is a high-utility reference page for cruisers planning Wi-Fi budget, connectivity expectations, and whether to bring a laptop. Its omission from nav was widespread because the link was added after most ship pages were first generated. The validator's BLOCKING check ensures new ship edits include it.

## Pass example
Navigation includes `<a href="/internet-at-sea.html">Internet at Sea</a>` in the primary nav or dropdown. Passes.

## Fail example
Ship page nav built from a template that predates the Internet-at-Sea addition. Validator emits: `Navigation missing /internet-at-sea.html link (required per gold standard)`.

## Fix guidance
Copy the nav block from a known-good ship page (e.g., an Oasis-class ship known to pass validation). The NAV-001 rule governs the full 12-link canonical structure; SHIP-011 is the ship-specific enforcement of one particular item.

## Related
- NAV-001 — full 12-link canonical navigation (S-only, broader check)
- GOLD_NAV_ITEMS constant at lines 106-112 of validate-ship-page.js
