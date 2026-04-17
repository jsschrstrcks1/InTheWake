---
id: DATA-002
name: All JSON files must parse without syntax errors
family: data
severity: error
applies-to:
  - all
provenance: V+S-agree
status: live
implementation:
  - file: admin/post-write-validate.sh
    function: JSON syntax check
    lines: "various"
  - file: admin/validate-port-page-v2.js
    function: JSON-LD parse (SCHEMA-002)
    lines: "793-800"
check: every .json file in the repo passes JSON.parse without exception; trailing commas, unquoted keys, BOM markers all fail
standards-source:
  - doc: admin/claude/CLAUDE.md
    section: "NEVER commit invalid JSON"
  - doc: admin/COMPREHENSIVE_SITE_AUDIT_2025_11_19.md
    section: "Invalid JSON syntax — 11 files"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-16
---

## Rule
Every `.json` file must be valid JSON. The 2025-11 audit found 11 files with syntax errors. `post-write-validate.sh` runs `node --check` equivalent on JSON. SCHEMA-002 covers inline JSON-LD; DATA-002 covers standalone `.json` data files.

## Fix guidance
Run `node -e "JSON.parse(require('fs').readFileSync('FILE'))"` on the file. Fix trailing commas (most common cause), smart quotes copied from docs, or BOM markers from Windows editors.
