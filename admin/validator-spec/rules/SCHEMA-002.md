---
id: SCHEMA-002
name: All JSON-LD script blocks must parse as valid JSON
family: schema
severity: error
applies-to:
  - all
provenance: V+S-agree
status: live
implementation:
  - file: admin/validate-port-page-v2.js
    function: validateICPLite (JSON-LD loop)
    lines: "793-800"
  - file: admin/validate-ship-page.js
    function: validateJSONLD (parse loop)
    lines: "571-586"
check: every <script type="application/ld+json"> element's text content parses with JSON.parse without exception
standards-source:
  - doc: admin/claude/TECHNICAL_STANDARDS.md
    section: "JSON-LD required schemas"
  - doc: new-standards/foundation/SHIP_PAGE_STANDARDS_v3.007.010.md
    section: "JSON-LD structured data"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-15
---

## Rule
Every `<script type="application/ld+json">` element on the page must contain valid, parseable JSON. Trailing commas, unquoted keys, smart quotes, un-escaped control characters — all fail.

## Why (rationale)
Invalid JSON-LD is invisible JSON-LD. Crawlers, rich-result systems, and AI consumers silently ignore blocks they can't parse, so an editor can introduce a typo and "pass validation" at every surface except the one that mattered. Explicit parse-error reporting prevents this.

## Pass example
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Nassau Cruise Port Guide"
}
</script>
```

## Fail example
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Nassau Cruise Port Guide",
}
</script>
```
Trailing comma after the last key. Validator emits: `Failed to parse JSON-LD script: Unexpected token '}'` (port:793-800) or `JSON-LD parse error: ...` (ship:582).

## Fix guidance
Run the block through `jq` or `node -e 'JSON.parse(require("fs").readFileSync("/dev/stdin"))'` before committing. Trailing commas are by far the most common cause; copy-pasted smart quotes are second.
