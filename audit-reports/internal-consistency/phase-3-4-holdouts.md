# Phase 3.1 → Phase 3.4 holdouts

**Date:** 2026-05-07
**Branch:** `claude/phase3-internal-consistency`

These two ships fire DATA-004 but were **deliberately not repaired** in
Phase 3.1 because they need authoritative external sourcing (Phase 3.4
historic-ship-verifier territory), not surgical integer swaps.

## Carnival Sunshine — `ships/carnival/carnival-sunshine.html`

**Distinct integers:** `2,974` (dominant, ~7 occurrences) vs `2,984`
(stat-card only).

**External authority (Wikipedia):** Carnival Sunshine — 2,984 lower
berths. The dominant page figure (2,974) appears to be a 10-off typo
that propagated through fact-block, key-facts, Quick Answer, and
JSON-LD `additionalProperty`.

**Why not auto-repaired:** the bulk script's "most-frequent" heuristic
would canonicalize on `2,974`, but the externally-authoritative figure
is `2,984`. Repairing here without verification would entrench the wrong
number across the page.

**Phase 3.4 task:** verify against Carnival's own ship page + Wikipedia,
canonicalize to `2,984`, rewrite all 7 sites of `2,974` to `2,984`.

## Carnival Venezia — `ships/carnival/carnival-venezia.html`

**Distinct integers:** `2,680` (dominant) vs `4,090` (stat-card + 2 FAQ
answers).

**External authority** (`assets/data/ships/costa/costa-venezia.page.json`,
the pre-rename data file for the same vessel): `guests_double: 4232`,
`gt: 135500`, `class: "Venice Class"` (Vista subclass), `crew: 1600`.

**Why not auto-repaired:** the wholesale stat mismatch is far broader
than DATA-004's scope. The page reads like two different ships pasted
together:

| Stat | Dominant on page | Authoritative (Costa Venezia page.json) |
|---|---|---|
| Class | "Spirit Class" | Vista (Venice subclass) |
| Gross Tonnage | 86,000 GT | 135,500 GT |
| Guests (double) | 2,680 | 4,232 |
| Crew | 930 | 1,600 |

The "dominant" 2,680 figure looks like Carnival Firenze data
accidentally applied to Carnival Venezia. Repairing the guest count
alone would leave the gross-tonnage / crew / class fields still wrong —
worse than the current state, because guest count would now be the
*only* correct stat sandwiched between wrong ones.

**Phase 3.4 task:** wholesale page rewrite, anchored on
`costa-venezia.page.json` + Carnival's own venue listings + Wikipedia.
This needs the historic-ship-verifier skill.

## Validator improvement landed alongside this doc

`validateInternalNumericConsistency` in `admin/validate-ship-page.js`
now skips false positives where the regex was bridging across `</dd>`
boundaries in `<dl>` key-facts blocks. The 30-char "before" window is
checked for non-guest stat labels (`Tonnage`, `GT`, `feet`, `crew`,
etc.); when present, the captured integer is for that stat, not for
guests.

This eliminated 10 false-positive flags on ships like Westerdam,
Zuiderdam, and Oasis-class fleet, where the validator had been
reading the gross-tonnage `<dd>` value as a "Guests" figure due to the
proximity of the next `<dt>` label.

*Soli Deo Gloria*
