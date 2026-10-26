<!-- Soli Deo Gloria. "A false balance is an abomination to the LORD, but a just weight is his delight." Proverbs 11:1 -->

# The ship-fact cross-check

**Status:** canonical. Built by Lexicon Track C8 (Tekton `itw-c8-data-cross-check-ci`; Project-Sophos
`docs/lexicon/LEXICON-PLAN-3.1.md` §8, gate `itw_data_cross_check`).
**Code:** `admin/lexicon/cross-check.mjs`. **Baseline:** `assets/data/lexicon/cross-check-baseline.json`.
**Tests:** `tests/unit/lexicon-cross-check.test.mjs`.

## Why it exists

The plan's census found that nothing in CI compared one data file with another, or with the pages. A ship's
IMO number, tonnage, guest count or crew can sit in up to seven places here. When one copy is corrected, the
others are not. Measured on main (`2170a7b42`, 2026-10-26): **623 ship facts are carried by two or more
sources, and 214 of them disagree.** With the voyage-pack fact sheets and the line's own captured pages added
(`f0d8ccf43`, the same day), 638 facts are shared and 222 disagree:

| Property | Disagreements |
|---|---|
| Gross tonnage | 91 |
| Crew | 60 |
| Guests, double occupancy | 43 |
| Guests, maximum | 20 |
| IMO number | 8 |

An IMO number is a fixed identifier, so every one of the eight IMO rows is an error in at least one file. All
eight are Norwegian ships. The per-ship record (`assets/data/ships/norwegian/*.page.json`) and
`assets/data/ncl_ships_meta.json` disagree, and some look shifted by one row: Bliss's record holds 9751509,
the number the meta file gives Encore. `ncl_ships_meta.json` also disagrees with itself on Norwegian Prima:
its slug-keyed map says 9833924, and its `ships[]` array says 9823986. Which copy is right needs the IMO
register, and this check does not decide it.

The voyage packs brought twelve more: eight new disagreements, and four known ones that gained a reading. Every one
is a Norwegian ship or Volendam. Eight are double-occupancy guest counts where the pack and the size atlas differ by
2 to 60 guests; four are crew. (Getaway's pack figure, 3,903, is the figure `ship-space-and-crew.json` gives her
sister Breakaway.) The one
to look at first is Norwegian Encore's crew: the pack says 2,100, and every other file says 1,735.

## What it compares

| Source | Shape |
|---|---|
| `ships/<line>/<slug>.html` | the `#ship-stats-fallback` block readers see |
| `assets/data/ships/<line>/<slug>.page.json` | `imo`, `gt`, `guests_double`, `guests_max`, `crew`, and `tracker.imo` |
| `assets/data/rc_ships_meta.json`, `assets/data/ncl_ships_meta.json` | both shapes each file holds: the map under the line's name, and `ships[]` |
| `assets/data/vf_overrides.json` | keyed by slug |
| `assets/data/ship-space-and-crew.json` | `ships[].slug` |
| `assets/data/fleet_index.json` | `cruise_lines[].ships[].slug` |
| `data/atlas/ship-size-atlas.json` | `ships[].ship_id` as `<line>-<slug>` |
| `assets/data/lexicon/observations/<slug>.json` | figures captured from the line's own ship page (C2b), only when the capture's outcome is `captured` |
| `admin/voyage-packs/<pack>.factcheck.json` | `ship_specs`, joined to a ship only through `assets/data/lexicon/pack-ships.json` |

**Values** are read by `readField` in `admin/lexicon/ship-statements.mjs`, the same strict reader C2 files
statements with:
- An approximate figure (`~90,000`), a placeholder (`TBD`) or a guest count that does not say double or
  maximum is never compared.
- `168,666 GT` and `168666` are the same value.

The line's own page is read by `readOfficial`, the reader C2b files statements with. A "Guest Capacity" the line
does not label as double or maximum is not compared.

A voyage pack writes its figures as prose, so `readPackSpec` reads them:
- A figure is read only with its own label: `1,733 crew`, `4,218 guests at double occupancy`, `5,610 double /
  7,600 max`.
- "Lower berths" and "full occupancy" are read as neither double nor maximum.
- A value containing `~`, "about", "around", "roughly" or "approx" is skipped whole.

**Identity** is the slug exactly as each file spells it:
- Nothing is matched by name or by similarity, so two spellings of one ship are not compared. That is an
  honest miss, never a false join.
- The atlas's line prefix is removed only when what remains is a slug another source uses.
- A pack names its ship only in its title, so `assets/data/lexicon/pack-ships.json` declares by hand which ship
  each pack describes. Nothing reads a ship name out of a pack's title. A pack missing from the map is compared
  with nothing, and every run names it.

A **disagreement** is a ship and property with two or more distinct values. The check never picks a side and
never edits data.

## Codes

| Code | Exit | Cause | Remedy |
|---|---|---|---|
| `itw_data_cross_check` | 1 | Two files disagree on a ship fact the baseline does not hold, or the baseline grew beyond what a newly read source alone reveals | Correct the wrong copy from a primary source (the line's own ship page, or the IMO register), so every file says the same. Never add a baseline entry by hand |
| `itw_data_cross_check` | 1 | The baseline's `sources` list is not the list the tool reads | In the commit that adds or removes a source, run `--adopt-sources` (see below) |
| `itw_cross_check_unavailable` | 3 | A source file could not be read or parsed, the baseline is malformed, or `pack-ships.json` maps a pack to something that is not a slug | Fix the file the message names. A source that cannot be read is never a pass |

Exit 0 means every disagreement is a known one.

## The baseline

`assets/data/lexicon/cross-check-baseline.json` holds the 214 disagreements that existed when the check was
built, each with the values it had.

- **A disagreement is known** when the baseline holds its key and every value it now has is one the baseline
  already held. Correcting one copy of a three-way split leaves a two-way split that is still known. That is
  progress, and it is never refused.
- **A value the baseline never held is new.** A known disagreement that gains a third reading is refused,
  just like a new one.
- **The baseline only shrinks.** Pre-commit compares it with HEAD, and CI with the pull request's base. A new
  key or a new value is refused.
- **Resolved and narrowed entries are reported, not refused.** `node admin/lexicon/cross-check.mjs
  --shrink-baseline` removes them. It only ever removes.

### Adding a source

A new reader finds disagreements nobody made in this commit. They were already in the files. So the baseline
records the list of sources it was built with (`sources`), and it may grow in exactly one case: the commit that
adds a source to that list may admit what that source alone reveals.

- `node admin/lexicon/cross-check.mjs --adopt-sources` records the sources the tool now reads and admits every new
  disagreement, but only if removing the new source's readings leaves it either agreeing or already known.
- **A copy edited in an old file in the same commit is still refused.** That disagreement is not the new source's
  alone.
- **Under `--base`, an admitted entry may hold only values some file carries today, or values already known.** No
  spare value can be parked for later.
- **A source that stops being read is refused**, at `--base` as `sources:<id>`. Dropping a reader is the quiet way to
  make a disagreement disappear.
- `--shrink-baseline` keeps the recorded list, so it never adopts anything.
- A baseline with no `sources` list means the eight sources of the first build (`FIRST_SOURCES` in the tool).

## Where it runs

- **Pre-commit** (`.githooks/pre-commit`, step 0b), when the commit touches a ship page, a ship record, one
  of the files above, a pack fact sheet, a line-official capture, the pack map, the baseline, the tool or
  `ship-statements.mjs`. It runs with `--base HEAD`.
- **CI**, in two places:
  - `tests/unit/lexicon-cross-check.test.mjs` runs the check on this repository in the Unit Tests job.
  - The step "Ship-fact cross-check (baseline only shrinks)" runs it against the pull request's base, so a
    baseline that grew is refused even when the merge happens on GitHub.

Commands:

```bash
node admin/lexicon/cross-check.mjs --report            # every disagreement, and what each file says
node admin/lexicon/cross-check.mjs                     # the check
node admin/lexicon/cross-check.mjs --shrink-baseline   # after reconciling copies
node admin/lexicon/cross-check.mjs --adopt-sources     # in the commit that adds a source
```

## Known limits

- **Pre-commit reads the working tree, not the staged copy.** The same is true of C5's check. CI reads the
  commit itself.
- **A new pack is compared only once someone maps it** in `pack-ships.json`. Until then each run names it. A pack
  that is mapped later brings its readings through the existing `voyage-pack` source. Those readings are not
  adopted: a disagreement they show must be reconciled.
- **Line-official figures cover only the five pilot ships.** That's 13 figures today. Royal Caribbean's three come
  from its press-center fact-sheet PDFs (see `admin/lexicon/capture-official.mjs`). Carnival's and MSC's pages
  label guest capacity without saying double or maximum, so those two are not compared.
- **`data/fleets_index.json` and the quiz files are not read yet.** Each needs its own adapter. The adapter
  list is the place to extend, one shape at a time, each with a fixture test.
- **Agreement is not truth.** Three copies that agree can all be wrong. This check finds disagreement; the
  line's own page (C2b) and the IMO register find truth.

**Soli Deo Gloria.**
