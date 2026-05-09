# Phase 3.2b — ai-summary cleanup, batch audit

**Date:** 2026-05-09
**Branch:** claude/phase3-2b-ai-summary-cleanup
**Companion:** PR (TBD), Phase 3.2a precedent: PR #1466 (merged sha 2cd29ff2)

## What this batch does

Two parallel sweeps:

1. **Validator tightening.** Five atomic boilerplate fragments added to `admin/validator-config.json` so the `icp_lite/ai_summary_boilerplate` rule catches variants that were evading the original two phrases.
2. **Per-ship cleanup, 36 ships, two patterns.**
   - **Propagation** (17 ships): ai-summary already specific. The boilerplate lived only in `<meta name="description">` and JSON-LD `description` fields. Script copied the existing ai-summary content into all three.
   - **Rewrite** (19 ships): ai-summary itself was boilerplate (under the now-tightened rules). New 2-fact + 1-voice-line summary written per ship, ≤250 chars, then propagated as above.

## Validator phrase additions

```json
"ai_summary_boilerplate_phrases": [
  "deck plans, live tracker, dining venues, and stateroom videos. Plan your Royal Caribbean cruise",
  "deck plans, live tracker, dining venues, and stateroom videos. Plan your",
  "deck plans, live tracker",                                ← added
  "deck plans, live tracking",                               ← added
  "deck plans, dining venues, stateroom tours",              ← added
  "deck plans, historical information",                      ← added
  "historical information, legacy, and ship details",        ← added
  "serves as a",
  "represents the perfect",
  "offers something for everyone",
  "the ultimate cruise experience"
]
```

Each new phrase is an atomic fragment chosen to match a real-world variant without false-positiving on legitimate ship-specific prose. Rationale: see `_doc_boilerplate` in `admin/validator-config.json`.

## Propagation set (17 ships)

| Ship | Replacements | Notes |
|------|-------------:|-------|
| `carnival/carnival-jubilee.html` | 1 | Meta only |
| `carnival/carnival-mardi-gras.html` | 1 | Meta only |
| `rcl/adventure-of-the-seas.html` | 1 | Meta only |
| `rcl/anthem-of-the-seas.html` | 2 | Meta + 1 JSON-LD |
| `rcl/grandeur-of-the-seas.html` | 1 | Meta only |
| `rcl/icon-class-ship-tbn-2027.html` | 1 | Meta only |
| `rcl/icon-of-the-seas.html` | 3 | Meta + 2 JSON-LD |
| `rcl/independence-of-the-seas.html` | 3 | Meta + 2 JSON-LD |
| `rcl/jewel-of-the-seas.html` | 3 | Meta + 2 JSON-LD |
| `rcl/legend-of-the-seas-icon-class-entering-service-in-2026.html` | 1 | Meta only |
| `rcl/liberty-of-the-seas.html` | 3 | Meta + 2 JSON-LD |
| `rcl/quantum-of-the-seas.html` | 3 | Meta + 2 JSON-LD |
| `rcl/song-of-norway.html` | 1 | Meta only |
| `rcl/splendour-of-the-seas.html` | 1 | Meta only |
| `rcl/star-of-the-seas.html` | 1 | Meta only |
| `rcl/utopia-of-the-seas.html` | 3 | Meta + 2 JSON-LD |
| `rcl/wonder-of-the-seas.html` | 3 | Meta + 2 JSON-LD |

**Total: 32 replacements across 17 files.**

Mechanism: `admin/phase3-2b-propagate.cjs` reads each file's `<meta name="ai-summary">` content and replaces every quoted string that contains the boilerplate marker `"deck plans, live tracker"` and ends with `"In the Wake."` with the ai-summary value. Idempotent.

## Rewrite set (19 ships)

Each carries 2 ship-specific facts (class / year / tonnage / capacity / distinctive feature) and 1 voice-aligned editorial line. All ≤250 chars. Mechanism: `admin/phase3-2b-rewrite.cjs` reads a JSON map of `path → new_summary`, replaces the ai-summary tag, then propagates to description + JSON-LD as in the propagation set.

| Ship | Chars | Class anchor | Voice line gist |
|------|-----:|--------------|-----------------|
| `rcl/allure-of-the-seas.html` | 236 | Oasis (2010, 225,282 GT) | "Same 2010 bones, fresher paint" |
| `rcl/mariner-of-the-seas.html` | 237 | Voyager (2003) | "Value-priced, family-loud" |
| `rcl/legend-of-the-seas-1995-built.html` | 222 | Vision (1995) | Historical reference; namesake reused 2026 |
| `rcl/icon-class-ship-tbn-2028.html` | 199 | Icon (5th, 2028 TBN) | Steel cut Jan 2026, awaiting name |
| `rcl/nordic-empress.html` | 227 | Nordic (1990, retired) | Kept so the name doesn't disappear |
| `rcl/odyssey-of-the-seas.html` | 211 | Quantum Ultra (2021) | "Same DNA, more deck" |
| `rcl/quantum-ultra-class-ship-tbn-2029.html` | 239 | Quantum Ultra (TBN 2029) | Page parks the slot |
| `rcl/star-class-ship-tbn-2028.html` | 236 | "Star Class" placeholder | Honest: not a confirmed class |
| `rcl/navigator-of-the-seas.html` | 232 | Voyager (2002) | "Value over wow" |
| `rcl/legend-of-the-seas.html` | 223 | Vision (1995, retired 2017) | Hull went to Marella |
| `rcl/oasis-of-the-seas.html` | 221 | Oasis (2009, original) | "Launched the megaship arms race" |
| `rcl/voyager-of-the-seas.html` | 237 | Voyager (lead, 1999) | Royal Promenade origin |
| `rcl/symphony-of-the-seas.html` | 227 | Oasis (2018) | "Until Wonder beat her on tonnage" |
| `rcl/monarch-of-the-seas.html` | 225 | Sovereign (1991, retired 2013) | No longer in active RCL |
| `rcl/quantum-ultra-class-ship-tbn-2028.html` | 239 | Quantum Ultra (TBN 2028) | Page parks the slot |
| `rcl/vision-of-the-seas.html` | 217 | Vision (1998) | "Still reads modern at 27" |
| `rcl/serenade-of-the-seas.html` | 236 | Radiance (2003) | "Class trade-off: lighter for less cabins" |
| `rcl/spectrum-of-the-seas.html` | 231 | Quantum Ultra (1st, 2019) | "Purpose-built for the China/Asia market" |
| `rcl/rhapsody-of-the-seas.html` | 201 | Vision (1997) | Solarium dome class signature |

**Total: 66 replacements across 19 files** (+1 manual fix on Allure where the original boilerplate values didn't match the propagation regex's "In the Wake." anchor).

## Verification

```bash
# All 36 ships pass ai_summary_boilerplate AND ai_summary_length:
$ for list in /tmp/phase3_2b_*.txt; do
    while read f; do
      node admin/validate-ship-page.js "$f" --json-output 2>/dev/null \
        | jq -r '[.blocking_errors[]? | select(.rule | test("ai_summary"))] | length'
    done < "$list"
  done | sort -u
0
```

(Output: only `0` — no ai-summary blocking errors on any of the 36 ships.)

## Why no per-ship audit logs

3.2a wrote one log per ship (7 logs). For 3.2b that would be 36 logs of mostly-mechanical content. This single batch log replaces them. Per-ship rewrite reasoning is in the Rewrite Set table above; per-ship facts came from each file's existing `<li><strong>...</strong>` fact block.

## Phase 3.2c (filed for next session)

The validator tightening surfaces **26 additional ships** that were quietly carrying boilerplate variants, mostly in Holland America Line, Celebrity Cruises, MSC, plus a few RCL placeholders. They are not a CI blocker (the CI workflow doesn't run the validator's boilerplate rule fleet-wide), so they are deferred to a follow-up PR rather than expanding 3.2b's blast radius.

Tracked in `admin/UNFINISHED_TASKS.md` under `### [G] Phase 3.2c — boilerplate cleanup, batch 3`.

## Multi-LLM consultation

Skipped for this batch. The 17 propagations are mechanical (no creative content). The 19 rewrites follow the same fact + voice template that Grok validated for Phase 3.2a (transcript `_consult-grok-2026-05-07.json`); the structural pattern isn't new. If reviewer feedback finds any single rewrite weak, individual rewrites can go through `consult` after the fact.
