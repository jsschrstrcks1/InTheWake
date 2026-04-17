---
id: VENUE-004
name: FAQ section has at least 3 expandable items
family: venue
severity: warn
applies-to:
  - venue
provenance: V-only
status: live
implementation:
  - file: admin/validate-venue-page-v2.js
    function: checkFAQDepth (T05)
    lines: "395-405"
check: id="faq" section contains >=3 <details> elements; 0 items fails (warn), 1-2 items warns as thin
standards-source: silent
standards-backfill: yes
decision: FINAL
last-updated: 2026-04-16
---

## Rule
A venue's FAQ section must contain at least 3 expandable `<details>` items. 0 items fails (FAQ section exists but is effectively empty). 1-2 items warns as too thin to be useful.

## Why (rationale)
A FAQ with one question isn't really a FAQ — it's a postscript. Three is the practical floor where the section earns its name and gives readers at least one useful answer they didn't come looking for. Validator keeps at warn because some legitimately simple venues (a single-item cocktail bar) may have fewer real questions.

## Pass example
```html
<section id="faq">
  <h2>Frequently Asked Questions</h2>
  <details><summary>Q: Do I need a reservation?</summary>...</details>
  <details><summary>Q: Is there a dress code?</summary>...</details>
  <details><summary>Q: What's the up-charge for à la carte vs package?</summary>...</details>
</section>
```

## Fail (warning) example
FAQ section with 1 item. Validator emits: `FAQ has only 1 items (3+ recommended)`.

## Fix guidance
Add real questions readers ask. Don't pad with generic questions; see VENUE-007 for the contamination rule that catches templated FAQ across dissimilar venues.
