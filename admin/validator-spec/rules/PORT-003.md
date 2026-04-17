---
id: PORT-003
name: Cruise port section minimum 100 words
family: port
severity: error
applies-to:
  - port
provenance: V-only
status: live
implementation:
  - file: admin/validate-port-page-v2.js
    function: validateWordCounts (cruise_port)
    lines: "1077-1086"
check: word count in the cruise_port section text >= 100
standards-source: silent
standards-backfill: yes
decision: FINAL
last-updated: 2026-04-15
---

## Rule
The cruise_port section (the terminal + immediate surroundings) must contain at least 100 words.

## Why (rationale)
This is the "what do I see when I step off the gangway" section. Less than 100 words can't cover: dock vs tender, distance to first useful thing, terminal facilities, immigration/customs logistics. A reader scanning this section is making a go/no-go decision for the port day; 100 words is the bare minimum to provide it.

## Pass example
A cruise_port section covering: "Prince George Wharf is a dock port (no tender). Bay Street is five minutes walk north. The terminal has ATMs, currency exchange, taxi queues, and a small duty-free shop. Immigration is a quick visual at the gangway — no forms, no stamps. The cruise-line-branded strip mall between the ship and the street gate is avoidable; pass through directly to Bay Street." ~120 words. Passes.

## Fail example
A cruise_port section at 40 words. Validator emits: `Cruise port section has 40 words, minimum is 100`.

## Fix guidance
Add practical specifics: dock/tender, distance to something useful (walking time), facilities, anything unexpected. If you don't know any of that — the port page isn't ready to ship.

## Related rules
- PORT-004 — getting around ≥200 words
- PORT-005 — excursions ≥400 words
