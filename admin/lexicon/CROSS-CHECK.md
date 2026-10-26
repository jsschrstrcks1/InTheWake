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
sources, and 214 of them disagree.**

| Property | Disagreements |
|---|---|
| Gross tonnage | 91 |
| Crew | 59 |
| Guests, double occupancy | 36 |
| Guests, maximum | 20 |
| IMO number | 8 |

An IMO number is a fixed identifier, so every one of the eight IMO rows is an error in at least one file. All
eight are Norwegian ships. The per-ship record (`assets/data/ships/norwegian/*.page.json`) and
`assets/data/ncl_ships_meta.json` disagree, and some look shifted by one row: Bliss's record holds 9751509,
the number the meta file gives Encore. `ncl_ships_meta.json` also disagrees with itself on Norwegian Prima:
its slug-keyed map says 9833924, and its `ships[]` array says 9823986. Which copy is right needs the IMO
register, and this check does not decide it.

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

**Values** are read by `readField` in `admin/lexicon/ship-statements.mjs`, the same strict reader C2 files
statements with:
- An approximate figure (`~90,000`), a placeholder (`TBD`) or a guest count that does not say double or
  maximum is never compared.
- `168,666 GT` and `168666` are the same value.

**Identity** is the slug exactly as each file spells it:
- Nothing is matched by name or by similarity, so two spellings of one ship are not compared. That is an
  honest miss, never a false join.
- The atlas's line prefix is removed only when what remains is a slug another source uses.

A **disagreement** is a ship and property with two or more distinct values. The check never picks a side and
never edits data.

## Codes

| Code | Exit | Cause | Remedy |
|---|---|---|---|
| `itw_data_cross_check` | 1 | Two files disagree on a ship fact the baseline does not hold, or the baseline grew | Correct the wrong copy from a primary source (the line's own ship page, or the IMO register), so every file says the same. Never add a baseline entry |
| `itw_cross_check_unavailable` | 3 | A source file could not be read or parsed, or the baseline is malformed | Fix the file the message names. A source that cannot be read is never a pass |

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

## Where it runs

- **Pre-commit** (`.githooks/pre-commit`, step 0b), when the commit touches a ship page, a ship record, one
  of the files above, the baseline or the tool. It runs with `--base HEAD`.
- **CI**, in two places:
  - `tests/unit/lexicon-cross-check.test.mjs` runs the check on this repository in the Unit Tests job.
  - The step "Ship-fact cross-check (baseline only shrinks)" runs it against the pull request's base, so a
    baseline that grew is refused even when the merge happens on GitHub.

Commands:

```bash
node admin/lexicon/cross-check.mjs --report            # every disagreement, and what each file says
node admin/lexicon/cross-check.mjs                     # the check
node admin/lexicon/cross-check.mjs --shrink-baseline   # after reconciling copies
```

## Known limits

- **Pre-commit reads the working tree, not the staged copy.** The same is true of C5's check. CI reads the
  commit itself.
- **Voyage-pack sidecars are not read yet.** 22 of 45 carry their own `ship_specs`.
- **`data/fleets_index.json` and the quiz files are not read yet.** Each needs its own adapter. The adapter
  list is the place to extend, one shape at a time, each with a fixture test.
- **Agreement is not truth.** Three copies that agree can all be wrong. This check finds disagreement; the
  line's own page (C2b) and the IMO register find truth.

**Soli Deo Gloria.**
