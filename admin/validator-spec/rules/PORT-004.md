---
id: PORT-004
name: Getting Around section minimum 200 words
family: port
severity: error
applies-to:
  - port
provenance: V-only
status: live
implementation:
  - file: admin/validate-port-page-v2.js
    function: validateWordCounts (getting_around)
    lines: "1088-1097"
check: word count in the getting_around section text >= 200
standards-source: silent
standards-backfill: yes
decision: FINAL
last-updated: 2026-04-15
---

## Rule
The getting_around section (transport options from the pier) must contain at least 200 words.

## Why (rationale)
Transport is the single highest-friction decision a cruiser makes on port day. Jitney vs taxi vs rental vs walk — and the cost, reliability, and safety profile of each — is exactly what the page needs to answer. 200 words is the floor to cover at least 2-3 options with real specifics (price, time, pickup location, gotchas).

## Pass example
"Nassau has four main transport options from Prince George Wharf. (1) Walk: Bay Street is five minutes north. For Cable Beach and Atlantis, walking is not practical. (2) Jitney bus: $1.25 one-way, correct change required, every 15 minutes. Board on Bay Street (walk up from the terminal). Jitney 10 goes to Cable Beach (25 minutes). Jitney 17 goes to Paradise Island/Atlantis (15 minutes). (3) Taxi: licensed taxis queue at the terminal exit. Zone pricing: Cable Beach $18 (up to 4 people), Atlantis $8 each way, airport $25. Agree on the fare before departing. (4) Water taxi from Prince George Wharf to Paradise Island: $4 each way, runs every 30 minutes..." ~220 words. Passes.

## Fail example
A getting_around section at 80 words covering only taxis. Validator emits: `Getting Around section has 80 words, minimum is 200`.

## Fix guidance
Cover at least three transport options. For each: price, time, pickup location, any gotchas (correct change required, wait times, safety note). If a port only has one real option (a dedicated shuttle), elaborate on timing, frequency, and alternatives for independent travelers.
