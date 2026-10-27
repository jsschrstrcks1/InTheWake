<!-- Soli Deo Gloria. "Buy the truth, and sell it not." Proverbs 23:23 -->

# Norwegian figures still written in prose, and in voyage packs

**Status:** a list for a person to read, not a defect log. Written 2026-10-27 by Tekton
`itw-c2b-ncl-official-capture`. Doc for the tools: `admin/lexicon/CROSS-CHECK.md`, "Applying the line's figure".
The Royal Caribbean list is `admin/lexicon/RCL-PROSE-TO-REVIEW.md`.

## What this is

On 2026-10-27 each Norwegian ship's own page on ncl.com was captured
(`admin/lexicon/capture-official.mjs`, 19 ships with Pride of America; files in `assets/data/lexicon/observations/`). The page gives
three figures: guest capacity at double occupancy, ship crew and overall length in feet. Feet are not converted,
so length is recorded but not used. Norwegian Sky is not captured: her page redirects to the fleet list.

`admin/lexicon/apply-official.mjs --apply` then set every machine-readable copy that disagreed to the line's
figure: the size atlas, `ncl_ships_meta.json`, and each ship page's labelled stat slots. It did not touch prose
or voyage packs.

## Page prose: the old crew figure is still written

| Page | Old figure | ncl.com | Times still written |
|---|---|---|---|
| `ships/norwegian/norwegian-aqua.html` | 1,550 | 1,597 | 1 |
| `ships/norwegian/norwegian-epic.html` | 1,753 | 1,724 | 1 |
| `ships/norwegian/norwegian-getaway.html` | 1,657 | 1,646 | 1 |
| `ships/norwegian/norwegian-jade.html` | 1,076 | 1,037 | 1 |
| `ships/norwegian/norwegian-jewel.html` | 1,072 | 1,069 | 1 |
| `ships/norwegian/norwegian-spirit.html` | 912 | 904 | 1 |
| `ships/norwegian/norwegian-star.html` | 1,100 | 1,031 | 1 |
| `ships/norwegian/norwegian-viva.html` | 1,388 | 1,506 | 2 |

## Voyage packs that cite Wikipedia and differ from ncl.com

A pack's fact sheet (`*.factcheck.json`) attests what the pack's own prose says, so changing the number in one
without the other would make the sheet lie about the pack. Both are a person's to change.

| Pack fact sheet | Field | Pack says (Wikipedia) | ncl.com |
|---|---|---|---|
| `admin/voyage-packs/v0.1.2-ncl-aqua-veterans-solo-group-dec-2027.factcheck.json` | guests, double occupancy | 3,571 | 3,565 (held, see below) |
| `admin/voyage-packs/v0.1.16-ncl-aqua-thanksgiving-solo-group-nov-2027.factcheck.json` | guests, double occupancy | 3,571 | 3,565 (held, see below) |
| `admin/voyage-packs/v0.1.7-ncl-bliss-alaska-solo-group-jul-2026.factcheck.json` | guests, double occupancy | 4,002 | 4,010 (held, see below) |
| `admin/voyage-packs/v0.1.7-ncl-bliss-alaska-solo-group-jul-2026.factcheck.json` | crew | ~1,700 | 1,716 |
| `admin/voyage-packs/v0.1.10-ncl-encore-solo-group-oct-2026.factcheck.json` | crew | 2,100 | 1,735 |
| `admin/voyage-packs/v0.1.10-ncl-encore-solo-group-oct-2026.factcheck.json` | guests, double occupancy | 4,004 (3,998 lower berths) | 3,958 |
| `admin/voyage-packs/v0.1.14-ncl-breakaway-bermuda-solo-group-may-2027.factcheck.json` | guests, double occupancy | 3,963 | 3,903 |
| `admin/voyage-packs/v0.1.15-ncl-breakaway-fall-foliage-solo-group-sep-2027.factcheck.json` | guests, double occupancy | 3,963 | 3,903 |

Two notes a reader should have:

- The Bliss pack's notes say its crew was "CORRECTED from pack's prior '~1,716'" to Wikipedia's 1,700. ncl.com
  says 1,716, so the earlier figure was the line's.
- The atlas said 3,963 for Getaway and Breakaway alike. ncl.com gives 3,903 for Breakaway and confirms 3,903 for
  Getaway, so the pack's 3,903 for Getaway was right and the atlas was wrong.

## Held figures

Aqua's and Bliss's guest counts are held: `capture-official.mjs` records them word for word under `held` in
the observation file, with the reason, and the cross-check does not read them. Their disagreement with the
packs was already known (the atlas said 3,550 and 4,004), and taking ncl.com's figure into the atlas would add a
third value the check rightly refuses until the packs are settled. To release a hold once the packs agree with
ncl.com: delete the `hold` from the target in `OFFICIAL`, recapture the ship, run
`node admin/lexicon/apply-official.mjs --apply`, then `node admin/lexicon/cross-check.mjs --shrink-baseline`.

**Soli Deo Gloria.**
