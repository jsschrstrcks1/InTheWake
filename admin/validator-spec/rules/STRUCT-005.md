---
id: STRUCT-005
name: Port page total word count between 2000 and 6000
family: struct
severity: error
applies-to:
  - port
provenance: V-only
status: live
implementation:
  - file: admin/validate-port-page-v2.js
    function: validateWordCounts (total minimum/maximum)
    lines: "1129-1147"
check: total word count across all port page text content — error if < 2000 (BLOCKING), warning if > 6000
standards-source: silent
standards-backfill: yes
decision: FINAL
last-updated: 2026-04-15
---

## Rule
A port page must contain between 2000 and 6000 total words. Under 2000 fails as BLOCKING (content-thin — reader gets no real guidance). Over 6000 warns (reader overload; pages this long usually have repeated or filler content).

## Why (rationale)
2000 words is roughly the floor for a port page that answers a typical cruiser's pre-port-day questions without hand-waving. 6000 is the ceiling where reading time crosses 25-30 minutes and readers start skipping sections they shouldn't. Most gold-standard ports (Nassau, Cozumel, St Maarten, Barcelona) land in the 3000-4500 range.

## Pass example
Port page at 3200 words. Passes.

## Fail example (BLOCKING)
Port page at 1100 words. Validator emits: `Total page has 1100 words, minimum is 2000`.

## Fail (warning) example
Port page at 7200 words. Validator emits: `Total page has 7200 words, maximum recommended is 6000`.

## Fix guidance
**Too few words:** fill out the required sections (STRUCT-003) with real content. PORT-002 through PORT-007 give the per-section minimums — meeting each gets you close to 2000 organically.

**Too many words:** review for repeated information, over-detailed historical asides, or boilerplate that could be cut. If the content is genuinely all necessary for the port (Barcelona, Tokyo), the warning can be left in place — it's advisory.
