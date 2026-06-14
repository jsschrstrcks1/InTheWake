# HANDOFF — Full venue catalog for every ship on every line

**Goal:** Every real ship page (~291) has a complete, OFFICIALLY-SOURCED venue roster in the
canonical `assets/data/venues-v2.json` `ships` map. No training-data recall — every venue
verified against the cruise line's official ship page and/or official deck-plan PDF in-session.
Careful, not clever. Make no errors. Take no shortcuts.

## Canonical structures (do not fragment)
- **Target file:** `assets/data/venues-v2.json` — the LIVE file (loaded by `restaurants-dynamic.js`,
  `rcl.page.js`, `rcl-venues.js`, `dining-card.js`, `venue-boot.js`). Edit THIS, not `venues_by_ship/`
  (1-file experiment, no live consumer) and not legacy `venues.json`.
- **Shape:** `ships[<page-slug>] = {name, class, gt, venues:[<venue-slug>...]}`. Ship key MUST equal
  the `ships/<line>/<slug>.html` page slug (all 232 existing keys match a page exactly — keep it that way).
- **Registry:** top-level `venues` array (1,576 entries) defines valid venue slugs
  `{slug,name,category,subcategory,description,premium}`. **Every slug referenced by a ship must exist
  in the registry.** When research surfaces a venue with no registry slug, add a registry entry first,
  then reference it. Reuse existing slugs where the venue is the same concept (e.g. `mdr`).

## Worklist (see manifest.json for per-ship status)
Status: MISSING (no v2 entry) / THIN (≤3) / PARTIAL (4–6) / OK-verify (7+).
Per-line MISSING / THIN / PARTIAL / OK-verify = total:
```
carnival              0 / 8 / 8 / 32 = 48
celebrity-cruises     8 / 5 / 0 / 16 = 29
costa                 0 / 0 / 1 /  8 =  9
cunard                0 / 0 / 0 /  4 =  4
explora-journeys      0 / 0 / 0 /  6 =  6
holland-america-line 30 / 6 / 2 /  8 = 46
msc                   0 / 0 / 0 / 24 = 24
norwegian             0 / 0 / 1 / 19 = 20
oceania               0 / 0 / 4 /  4 =  8
princess              0 / 0 / 0 / 17 = 17
rcl                  20 / 0 / 0 / 29 = 49
regent                0 / 1 / 3 /  3 =  7
seabourn              0 / 2 / 5 /  0 =  7
silversea             0 / 1 / 5 /  6 = 12
virgin-voyages        0 / 0 / 0 /  4 =  4
```

## Execution order (current fleet first, hardest-to-source last)
1. **Current-fleet small luxury (bounded, clear official deck plans):** seabourn → silversea → oceania → regent
2. **Current-fleet mainstream completeness (THIN/PARTIAL):** carnival, costa, norwegian, then verify OK-verify
3. **MISSING current ships:** celebrity-xpedition/xploration, etc.
4. **Historic/retired ships:** HAL historic (30), RCL Sovereign/Monarch/Majesty era, Celebrity Century/Galaxy/etc.
   — source from official archives where possible; flag `verify` and era.
5. **Future TBN ships:** RCL *-class-ship-tbn-*, `none-announced` — legitimately sparse; do NOT invent venues.

## Per-ship workflow
1. Read-only **Explore** agent (NOT general-purpose — avoids sub-agent rate-limiting). Throttle 2–3 concurrent.
   Prompt: full venue roster from OFFICIAL line page + official deck-plan PDF; categorized; OFFICIAL/SECONDARY
   tag per venue; flag retired/renamed/future. No training-data recall.
2. I map each returned venue to an existing registry slug or add a new registry entry.
3. Write `ships[slug].venues` (+ class, +gt only if officially sourced). Mark `verify` on anything uncertain.
4. `python3 -c "import json;json.load(open('assets/data/venues-v2.json'))"` — NEVER commit invalid JSON.
5. Commit per line on branch `claude/in-the-wake-review-bzr6zq`; push; update manifest.json statuses + this file.

## State (updated 2026-06-14)
- **DONE & pushed:**
  - Seabourn (7 ships) — expanded to full rosters; Odyssey/Sojourn flagged departed-fleet (Mitsui). commit 6efd5703
  - Silversea (12 ships) — full rosters from official silversea.com; Indochine removed from Silver Muse. commit ee72a61e
- **In flight:** Oceania (agent ac0c6f252c2af6a3f), Regent (launching)
- **Next after Oceania/Regent:** Carnival/Costa/NCL THIN+PARTIAL completeness, then verify OK-verify, then
  MISSING current ships (celebrity-xpedition/xploration), then historic (HAL 30, RCL retired, Celebrity older), then future-TBN.
- **Lesson learned (apply to ALL agent prompts):** say "you HAVE web access, USE WebFetch/WebSearch on
  official sites; 'research only' = don't edit files, NOT 'don't browse'." The word "read-only" alone made
  one agent refuse the web and return stale local JSON — rejected that output.
- **Schema note:** venues-v2 ship `venues` is a FLAT slug array (no per-venue verify field). Inclusion bar is
  strict: only venues confirmed present. Uncertain ships get a `historical_note`/omission, not a guess.

## Integrity notes
- 4 orphan venue refs already in data (referenced, not in registry): `connoisseur-cigar-club`,
  `disco-club`, `seaplex-dog-house`, `the-hideaway` — add registry entries when touching their ships.
- Luxury lines standardize venues fleetwide with per-class deltas; capturing a shared set + per-ship
  exceptions is accurate (reflects real operations) and not a shortcut — but each ship's set must still
  be confirmed against that ship's own deck plan.
