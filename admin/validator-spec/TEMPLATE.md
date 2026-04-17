# Rule File Template

Every file in `rules/` MUST use this shape. `scripts/find-orphans.cjs` will fail the build if any required field is missing or set to `TBD`.

---

## Copy this for a new rule

```markdown
---
id: FAM-NNN                     # required. 3-letter family + zero-padded number. See CATEGORIES.md.
name: Short human title         # required. One line. Plain English.
family: image                   # required. Matches a CATEGORIES.md entry.
severity: error                 # required. error | warn | info.
applies-to:                     # required. One or more of: port, ship, venue, root, logbook, solo, cruise-line, tool, all.
  - port
  - ship
provenance: V+S-agree           # required. V+S-agree | V-only | S-only | V-S-conflict.
status: live                    # required. live | proposed | deprecated.
implementation:                 # required. List each enforcing check, or the literal word "none".
  - file: admin/validate-port-page-v2.js
    function: checkAttributionDiversity
    lines: "340-380"
check: group(attr.sourceUrl).size >= min(N, files*0.3)
                                # required. One-line plain-English or pseudocode statement.
                                # Must NOT be the literal string "TBD".
standards-source:               # required. List each citation, or literal "silent".
  - doc: admin/claude/IMAGE_WORKFLOW.md
    section: "Wikimedia attribution"
standards-backfill: no          # required. yes | no. Whether regenerated standards must add this rule.
decision: FINAL                 # required. FINAL | UNRESOLVED. Only UNRESOLVED for V-S-conflict awaiting user sign-off.
last-updated: 2026-04-15        # required. ISO date of last edit.
---

## Rule
One-sentence plain-English statement of what must be true (or must not be true).

## Why (rationale)
Why this rule exists. If the rule was motivated by a specific escape, cite it.
Example: "889 attr.json files shared sourceUrl 'Flickr public feed' (April 2026).
Caught by WebFetch verification, not by any validator. This rule would have caught it on write."

## Pass example
```html
<!-- minimal compliant snippet -->
```

## Fail example
```html
<!-- minimal non-compliant snippet, with annotation of what breaks and why -->
```

## Fix guidance
What a writer / generator / reviewer does to satisfy this rule.
Keep short — 2-4 sentences. Link to the relevant SKILL.md or standards doc for depth.
```

---

## For V-S-conflict rules only — ADD these sections

When `provenance: V-S-conflict`, the rule file additionally MUST include:

```markdown
## Implications

### If validator wins
- What changes about current pages.
- How many pages currently fail this (if known).
- Downstream effects on other rules / generators.
- Migration cost.

### If standards win
- What policy changes.
- Which validator code must be rewritten or replaced.
- Downstream effects on other rules / generators.
- Migration cost.

## Recommendation
Which side I (the spec author) recommend, and why. One or two paragraphs.
Must cite the specific trade-off that drove the recommendation.
User signs off here or overrides.
```

---

## Required-field validation

`scripts/find-orphans.cjs` enforces:

| Field | Must be |
|---|---|
| `id` | Matches `/^[A-Z][A-Z0-9]{2,6}-\d{3,4}$/` (3–7 char family prefix, digits allowed after first letter — e.g. `A11Y`, `SCHEMA`, `STRUCT`, `IMG`) |
| `family` | Exists in `CATEGORIES.md` |
| `severity` | One of: `error`, `warn`, `info` |
| `applies-to` | Non-empty list; values from the allowed set |
| `provenance` | One of: `V+S-agree`, `V-only`, `S-only`, `V-S-conflict` |
| `status` | One of: `live`, `proposed`, `deprecated` |
| `implementation` | Either a list with `file:` entries, or literal string `none` |
| `check` | Non-empty string; NOT the literal `TBD` |
| `standards-source` | Either a list with `doc:` entries, or literal string `silent` |
| `standards-backfill` | `yes` or `no` |
| `decision` | `FINAL` or `UNRESOLVED`. `UNRESOLVED` only permitted when `provenance: V-S-conflict`. |
| `last-updated` | ISO date YYYY-MM-DD |

V-S-conflict rules additionally must contain `## Implications` and `## Recommendation` sections.

---

## Field semantics notes

**`applies-to`:** Use `all` only if the rule literally applies to every HTML page (theological invocation, canonical URL presence, etc.). Most rules should list specific page types.

**`implementation: none`:** Honest — means no validator enforces this today. The rule goes on `ORPHANS.md`. `find-orphans.cjs` does NOT fail the build for `implementation: none` (that would make the spec unwritable during Phase 3); it counts and reports.

**`implementation: llm-review`:** Used for voice / judgment rules that can't be regex-checked. Cite the SKILL.md that defines the review pattern (voice-audit.md, emotional-hook-test.md).

**`standards-source: silent`:** Honest — means no standards doc documents this rule. V-only provenance usually pairs with this. Regenerated standards will adopt the rule.

**`check:`:** Write it so a human can understand it without reading code. Pseudocode is fine. Regex is fine. A one-sentence procedure is fine. The literal string `TBD` is NOT fine — that's where zombie rules hide.

**`last-updated:`:** Any edit to the rule file bumps this. Used by future staleness reports.

---

**Soli Deo Gloria.**
