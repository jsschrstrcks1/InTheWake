---
id: DATA-001
name: Port slug canonical across all data sources
family: data
severity: error
applies-to:
  - port
provenance: V+S-agree
status: live
implementation:
  - file: admin/validate-poi-coordinates.js
    function: slug validation
    lines: "various"
check: port slug used in HTML filename, JSON data files, image directory name, and sitemap entry must be identical; mismatches (falmouth vs falmouth-jamaica) cause broken cross-references
standards-source:
  - doc: admin/DEPLOYMENT_AUDIT_2026_02_21.md
    section: "Broken port slugs — canonical slug references"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-16
---

## Rule
A port's slug must be identical across all surfaces: `ports/<slug>.html`, `ports/img/<slug>/`, `assets/data/maps/<slug>.json`, `assets/data/logbook/<slug>.json`, and `sitemap.xml`. The 2026-02 deployment audit found slug mismatches (e.g., `falmouth` vs `falmouth-jamaica`) causing broken cross-references and 5,143 port-to-ships discrepancies.

## Fix guidance
Canonical slug = the HTML filename without extension. All other files must use that exact string. When renaming a port, update all surfaces in one atomic commit.
