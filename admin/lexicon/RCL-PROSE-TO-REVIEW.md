<!-- Soli Deo Gloria. "Buy the truth, and sell it not." Proverbs 23:23 -->

# Royal Caribbean figures still written in page prose

**Status:** a list for a person to read, not a defect log. Written 2026-10-27 by Tekton
`itw-c2b-rcl-fleet-fact-sheets`. Doc for the tool: `admin/lexicon/CROSS-CHECK.md`, "Applying the line's figure".

## What this is

On 2026-10-26 and 27 every Royal Caribbean ship's "Fast Facts" sheet on the line's press center was captured
(`admin/lexicon/capture-official.mjs`, 31 ships; files in `assets/data/lexicon/observations/`). Then
`admin/lexicon/apply-official.mjs --apply` set every machine-readable copy that disagreed to the sheet's figure:
- the size atlas, `fleet_index.json` and `rc_ships_meta.json`;
- each ship page's `#ship-stats-fallback` block;
- each page's labelled stat slots: the "Tonnage:", "Guests:" and "Crew:" list, and the stat-key/stat-val grid.

It did not touch prose. A labelled slot states the ship's figure today. A sentence can state history: "At
225,282 GT she was the largest ship afloat" was true of Oasis of the Seas in 2009, and Royal Caribbean's
current sheet prints 226,838 after her refit. So whether each sentence below should change is a person's call.

The old figure is still written in these pages, outside the stat slots, in prose, meta descriptions, the AI
summary or structured-data text:

| Page | Property | Old figure | Royal Caribbean's sheet | Times still written |
|---|---|---|---|---|
| `ships/rcl/allure-of-the-seas.html` | crew | 2,384 | 2,103 | 1 |
| `ships/rcl/allure-of-the-seas.html` | guests (double occupancy) | 5,484 | 5,718 | 5 |
| `ships/rcl/brilliance-of-the-seas.html` | guests (double occupancy) | 2,145 | 2,142 | 10 |
| `ships/rcl/freedom-of-the-seas.html` | crew | 1,360 | 1,386 | 1 |
| `ships/rcl/freedom-of-the-seas.html` | guests (double occupancy) | 4,024 | 3,926 | 12 |
| `ships/rcl/harmony-of-the-seas.html` | crew | 2,394 | 2,200 | 1 |
| `ships/rcl/harmony-of-the-seas.html` | guests (double occupancy) | 5,479 | 5,697 | 10 |
| `ships/rcl/independence-of-the-seas.html` | crew | 1,360 | 1,440 | 1 |
| `ships/rcl/independence-of-the-seas.html` | gross tonnage | 155,889 | 154,407 | 9 |
| `ships/rcl/independence-of-the-seas.html` | guests (double occupancy) | 3,634 | 3,858 | 11 |
| `ships/rcl/jewel-of-the-seas.html` | crew | 859 | 852 | 1 |
| `ships/rcl/jewel-of-the-seas.html` | guests (double occupancy) | 2,144 | 2,191 | 11 |
| `ships/rcl/liberty-of-the-seas.html` | gross tonnage | 155,889 | 154,407 | 9 |
| `ships/rcl/liberty-of-the-seas.html` | guests (double occupancy) | 3,634 | 3,948 | 11 |
| `ships/rcl/mariner-of-the-seas.html` | guests (double occupancy) | 3,334 | 3,344 | 10 |
| `ships/rcl/oasis-of-the-seas.html` | gross tonnage | 225,282 | 226,838 | 9 |
| `ships/rcl/oasis-of-the-seas.html` | guests (double occupancy) | 5,400 | 5,602 | 10 |
| `ships/rcl/ovation-of-the-seas.html` | guests (double occupancy) | 4,180 | 4,234 | 10 |
| `ships/rcl/rhapsody-of-the-seas.html` | guests (double occupancy) | 2,026 | 2,040 | 10 |
| `ships/rcl/serenade-of-the-seas.html` | crew | 859 | 827 | 1 |
| `ships/rcl/utopia-of-the-seas.html` | crew | 2,200 | 2,290 | 1 |
| `ships/rcl/utopia-of-the-seas.html` | gross tonnage | 236,857 | 236,473 | 9 |
| `ships/rcl/vision-of-the-seas.html` | gross tonnage | 78,717 | 78,340 | 7 |
| `ships/rcl/vision-of-the-seas.html` | guests (double occupancy) | 2,036 | 2,050 | 10 |
| `ships/rcl/voyager-of-the-seas.html` | gross tonnage | 138,194 | 137,276 | 8 |
| `ships/rcl/voyager-of-the-seas.html` | guests (double occupancy) | 3,286 | 3,602 | 10 |
| `ships/rcl/wonder-of-the-seas.html` | crew | 2,300 | 2,204 | 1 |
| `ships/rcl/wonder-of-the-seas.html` | gross tonnage | 236,857 | 235,600 | 9 |

28 rows, 198 places. Each sheet's PDF, its hash and its "Updated" date are in the ship's observation file.

## How to use it

- A sentence about the ship today ("carries approximately 5,400 guests", "a crew of 2,165") should take the
  sheet's figure.
- A sentence about the past ("when she debuted", "at launch") may be right as written.
- Run `node admin/lexicon/apply-official.mjs` afterwards. A dry run that lists nothing means the stat slots
  still agree with the line.

**Soli Deo Gloria.**
