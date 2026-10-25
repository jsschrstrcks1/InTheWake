<!-- Soli Deo Gloria. "Buy the truth, and sell it not." Proverbs 23:23 -->

# Entities: the facts behind the pages

This folder holds In the Wake's facts as **statements**: one property of one ship (or, later, port or
venue), one value, the sources it rests on, and the time it is true for. Pages will be rendered from
them (Track C3), so a fact is written once and every page that shows it agrees.

Plan: Project-Sophos `docs/lexicon/LEXICON-PLAN-3.1.md`, Track C. Contract:
`docs/lexicon/STATEMENT-CONTRACT.md` there. Tekton `itw-c1-cruise-pack-schema` (this structure) and
`itw-c2-ship-pilot-five` (the first five ships).

## What is here

| Path | What |
|---|---|
| `ship/<slug>.json` | one file per ship (Track C2), `lexicon-entity/1` |
| `../lexicon/cruise.ship.pack.json` | which facts a ship carries, their type and unit, which sources are authoritative, how long a value stays fresh (`lexicon-pack/1`) |
| `../lexicon/line-aliases.json` | generated: which spelling of a cruise line in which file means which line. Do not edit by hand |

Only entity files live under `entities/`: Argus reads every `entities/<type>/<slug>.json` as one, so the
pack and the alias table sit beside it in `assets/data/lexicon/`.

## An entity file

```json
{ "format": "lexicon-entity/1", "entity": "ship:quantum-of-the-seas", "statements": [ ... ] }
```

Each statement is a canonical envelope made by Project-Sophos `makeStatement`, never written by hand:
its id is a hash of its content, and a hand edit breaks it (the contract refuses it). The path must
name the entity: `ship/quantum-of-the-seas.json` holds `ship:quantum-of-the-seas` and nothing else.
Argus reads these files and serves them through `lexicon_statements`.

## Where a fact may come from (operator directives 7f0df2b6 and 4918b2a5)

Training data is never a source. A fact comes from one of three kinds, listed in the pack for every
property, most authoritative first:

| Source kind | What | Evidence tier |
|---|---|---|
| `line-official` | the cruise line's own ship page or fact sheet, read in the session | `primary` |
| `trade-press` | a contemporary trade press page (Cruise Critic, Cruise Hive, Cruzely, Eat Sleep Cruise) | `secondary` |
| `itw-data` | a data file already in this repository | `secondary` |

## What status a statement may carry

| Status | When |
|---|---|
| `verified` | read from the line's own page in the session (the only tier the household lets mint it) |
| `inference` | from secondary sources only: trade press, or this repo's own data files |
| `unknown` | no source could be found: value `null`. This is BLOCKED, said out loud |

`known` is **not** used here. In the household's ladder it means training recall, which the directive
forbids as a source. A web-checked fact needs two sources (directive 4918b2a5); one source is filed as
it is and stays `inference` until a second agrees.

## Disagreements

Two sources that disagree are two statements. Neither is deleted and neither is picked: the contract's
`currentValue` returns `conflicting`, and a page shows **no** value for it until a person settles it.
Settling is a governance act (rank `preferred` on the side the evidence supports), recorded, never
automatic.

## Lines

A statement names a line as `line:<id>`, where `<id>` is the line's id in `brands.json`.
`assets/data/lexicon/line-aliases.json` maps the other spellings to it, each with the evidence it rests on:

```bash
node admin/lexicon/line-aliases.mjs           # regenerate after changing brands, fleets or ships/
node admin/lexicon/line-aliases.mjs --check   # exit 1 (itw_line_aliases_stale) if out of date
```

Spellings it cannot match are listed under `unmatched` with the reason. They are open questions:
lines with fleet lists but no brand entry (Disney, Viking, AIDA, P&O, TUI, Hapag-Lloyd), and
`ships/margaritaville-at-sea/`, whose ship no fleet list names.

**Soli Deo Gloria.**
