---
id: STRUCT-004
name: Collapsible sections must use the details/summary pattern
family: struct
severity: warn
applies-to:
  - port
provenance: V-only
status: live
implementation:
  - file: admin/validate-port-page-v2.js
    function: validateSectionOrder (COLLAPSIBLE_REQUIRED check)
    lines: "273-278"
check: each section in COLLAPSIBLE_REQUIRED (logbook, cruise_port, getting_around, map, beaches, excursions, history, cultural, shopping, food, notices, depth_soundings, practical, faq, gallery, credits) is wrapped in a <details class="section-collapse"> element or equivalent progressive-disclosure pattern
standards-source: silent
standards-backfill: yes
decision: FINAL
last-updated: 2026-04-15
---

## Rule
Content sections that typically run long (15 sections listed in `COLLAPSIBLE_REQUIRED`) must be wrapped in a `<details class="section-collapse">` element or equivalent collapsible pattern. The hero does NOT collapse (always visible); FAQ and back_nav are exempt for different reasons.

## Why (rationale)
Port pages carry a lot of content (2000+ words, STRUCT-005). Presenting it all fully-expanded overwhelms the reader on mobile and buries the section-level structure. Collapsing lets the reader scan the section titles, expand the ones they want, skip the rest. The `.section-collapse` class is the site's visual convention for the pattern.

Standards describe progressive-disclosure at the design level but don't enumerate the specific sections or the class name. Backfill.

## Pass example
```html
<details class="section-collapse" open>
  <summary><h2>Getting Around</h2></summary>
  <div class="section-body">
    <p>Nassau is a dock port...</p>
  </div>
</details>
```
`open` attribute is fine — the default-open state is a choice per section; the rule only requires the details/summary structure.

## Fail (warning) example
```html
<section>
  <h2>Getting Around</h2>
  <p>Nassau is a dock port...</p>
</section>
```
Plain section — no details/summary wrapper. Validator emits warning: `Section 'getting_around' is not collapsible; expected <details class="section-collapse">`.

## Fix guidance
Wrap the section body inside `<details class="section-collapse">`. Move the section's h2 into the `<summary>`. Apply `open` to sections you want default-expanded (hero logbook, cruise_port — content readers want immediately) and leave others closed.
