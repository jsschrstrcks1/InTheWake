# Interior Naming Rights — Promenade View & Virtual Balcony

## Thread name
`Interior Naming Rights — Promenade View & Virtual Balcony`

## Branch
`claude/interior-naming-rights-promenade-virtual-balcony`
Base off: `claude/review-context-onboarding-ZZauz`

---

## What this is about

Royal Caribbean has two special types of Interior cabin that have their
own names in the real world:

- **Promenade View** (iCruise codes: 2T, CP) — Interior cabins with
  bay windows overlooking the Royal Promenade indoor boulevard.
- **Virtual Balcony** (iCruise codes: 1U, 2U, 3U, 4U, 5U) — Interior
  cabins with a floor-to-ceiling HD screen showing real-time ocean views.

In our project, both are correctly classified as Interior (that's the
project convention — 4 categories: Suite, Balcony, Ocean View, Interior).
But right now, the data erases their identity. They're just cabin numbers
dumped into a flat "Interior" array with no sub-type distinction. They
deserve their naming rights.

## What you are building

Add an `interior_sub_categories` object to each affected ship's
stateroom-exceptions v2.json file. The structure:

```json
"interior_sub_categories": {
  "Promenade View": {
    "icruise_codes": ["2T", "CP"],
    "description": "Interior with bay windows overlooking the Royal Promenade",
    "cabins": [ ...cabin numbers from the Interior array that belong here... ]
  },
  "Virtual Balcony": {
    "icruise_codes": ["1U", "2U", "3U", "4U", "5U"],
    "description": "Interior with floor-to-ceiling HD screen showing real-time ocean views",
    "cabins": [ ...cabin numbers from the Interior array that belong here... ]
  }
}
```

Only include the sub-types that actually exist on each ship.
Not every ship has both. Most have one or neither.

The cabin numbers stay in the main "Interior" array (don't remove them).
The sub_categories object is additive — it gives names to subsets of
the Interior array.

## YOUR FIRST JOB: Read everything. Change nothing.

Before you touch a single file, you must read and internalize:

1. `admin/UNFINISHED-TASKS.md` — the full project context doc. Read it
   completely. It has iCruise WMPHShipCodes, cabin numbering conventions,
   class groupings, and the classification rules.

2. `assets/data/staterooms/VERIFICATION_METHODOLOGY.md` — how cabin data
   was sourced and verified. Pay special attention to the URL pattern on
   line 29.

3. At least 3 representative stateroom-exceptions v2.json files to
   understand the actual data structure:
   - `stateroom-exceptions.voyager-of-the-seas.v2.json` (has CP, 2T, 2U, 4U)
   - `stateroom-exceptions.quantum-of-the-seas.v2.json` (has 1U-5U, 2W, CI)
   - `stateroom-exceptions.oasis-of-the-seas.v2.json` (has 2T)

4. The `_verification_note` in EVERY affected ship's JSON. That note tells
   you exactly which iCruise sub-category codes are present per ship.
   This is your source of truth for which ships need which sub-types.

## The key URL pattern — how to classify any cabin

This is documented in `VERIFICATION_METHODOLOGY.md` line 29:

```
https://www.cruisedeckplans.com/ships/stateroom-details.php?ship={Ship-Name}&cabin={number}
```

**This is your primary tool.** For any cabin number on any ship, this URL
returns the cabin's category name. Confirmed examples:

| Ship | Cabin | Category returned |
|------|-------|-------------------|
| Voyager-of-the-Seas | 6253 | **Promenade View Interior** |
| Quantum-of-the-Seas | 7121 | **Interior** (description: "with a Virtual Balcony") |
| Quantum-of-the-Seas | 8230 | **Interior** (description: "with a Virtual Balcony") |

The ship slug format is `Ship-Name-With-Dashes` (e.g., `Voyager-of-the-Seas`,
`Quantum-of-the-Seas`, `Oasis-of-the-Seas`).

**What to look for in the response:**
- Category name says **"Promenade View Interior"** → Promenade View
- Category name says **"Interior"** AND description mentions **"Virtual Balcony"** → Virtual Balcony
- Category name says **"Interior"** with no Virtual Balcony mention → Standard Interior (skip, don't add to sub_categories)

**Important:** Some cabins may 404. This can mean the cabin number doesn't
exist on CruiseDeckPlans. If a cabin 404s, try a neighboring number. If
a pattern of 404s appears, note it and move on.

## Strategy: be smart about sampling, but verify everything

You don't need to fetch every single Interior cabin one at a time from the
start. Here's the careful approach:

### Phase 1: Identify the pattern per ship
1. For each ship, take the Interior cabin list from the JSON
2. Sample 3-5 cabins from different decks
3. Fetch each one from CruiseDeckPlans
4. Note which ones come back as "Promenade View Interior" or "Virtual Balcony"
5. Identify the deck/range pattern (e.g., "all 7xxx and 8xxx odd cabins on
   Voyager are Promenade View")

### Phase 2: Verify the pattern
1. Fetch 5-10 more cabins to confirm the pattern holds
2. Check edge cases (first and last cabin on each deck)
3. Check both port and starboard sides

### Phase 3: Classify the full list
1. Apply the verified pattern to classify every cabin in the Interior array
2. Spot-check 10% of the classified list against CruiseDeckPlans
3. Any cabin you're unsure about: look it up individually

### Phase 4: Write the data
1. Add `interior_sub_categories` to the JSON
2. Add `_sub_category_confidence` field: "verified", "high", or "partial"
3. Cross-check: every cabin in `interior_sub_categories.*.cabins` MUST exist
   in the main `"Interior"` array

## Ships to investigate

From the `_verification_notes`, these ships have the relevant codes:

**Promenade View (2T and/or CP):**
- Voyager of the Seas: CP, 2T
- Oasis of the Seas: 2T
- Allure of the Seas: 2T
- Harmony of the Seas: 2T
- Symphony of the Seas: 2T
- Wonder of the Seas: 2T
- Utopia of the Seas: 2T

**Virtual Balcony (1U-5U):**
- Quantum of the Seas: 1U, 2U, 3U, 4U, 5U
- Anthem of the Seas: 1U, 2U, 3U, 4U
- Ovation of the Seas: 1U, 2U, 3U, 4U
- Spectrum of the Seas: 1U, 2U
- Odyssey of the Seas: 1U, 2U

**Both types present:**
- Voyager of the Seas: CP, 2T (Promenade View) + 2U, 4U (Virtual Balcony)
- Harmony of the Seas: 2T (Promenade View) + 4U (Virtual Balcony)
- Symphony of the Seas: 2T (Promenade View) + 4U (Virtual Balcony)
- Wonder of the Seas: 2T (Promenade View) + 4U (Virtual Balcony)
- Utopia of the Seas: 2T (Promenade View) + 4U (Virtual Balcony)

**VERIFY THIS LIST against the actual files.** Do not trust it blindly.
Read each ship's `_verification_note` yourself.

## Principles

- Slow. Steady. Careful.
- Not clever, but correct.
- If you can't verify it, don't write it.
- Read before you write. Always.
- One ship at a time. One sub-type at a time.
- Show your work. Document what you verified and how.
- The cabin numbers in `interior_sub_categories` must be a **subset** of the
  cabin numbers in the `"Interior"` array. Cross-check every one.
- Commit after each ship or small group of sister ships. Don't batch
  everything into one massive commit.
- When in doubt, mark confidence as "partial" and move on. We can come
  back. Getting it wrong is worse than getting it later.
- Parallel agents are OK — as long as each one is careful. One agent per
  ship or per class. But no agent guesses. Every agent verifies.
