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
| `../ship-deployments.json` | which ships call where, stored per ship; `port_to_ships` is generated (Track C5, below) |

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

## The line's own page comes first (operator ruling, 2026-10-25)

> "the primary source should be the cruise lines website it self." (Ken)

`admin/lexicon/capture-official.mjs` opens each pilot ship's page on the line's own site in a real browser and
records every figure exactly as the page shows it, beside its label, in `assets/data/lexicon/observations/`,
with the URL, the time it was read and a hash of the page text. The generator files those figures as
`verified` statements (evidence tier `primary`) at rank **`preferred`**: where the line's page speaks, its
figure is the one shown. This repo's own figure for the same property stays filed beside it, and a
disagreement between the two is still listed by `findConflicts`, never hidden.

Each entity file lists under `checks` every line page that was opened and what came back:

| Outcome | Meaning |
|---|---|
| `captured` | the page showed figures; each is filed or listed in `not_filed` with the reason |
| `no_figures_on_page` | a real page, with no ship figures on it |
| `content_not_served` | under 1,000 characters came back (a bot check or an error shell): the ship was never seen |
| `fetch_failed` | the page could not be opened |

A figure the line does not label plainly is not filed: Carnival's "Guest Capacity" and MSC's "Number of
passengers" do not say double occupancy or maximum, and a length given only in feet is not converted.

**Royal Caribbean** serves a headless browser a block page at royalcaribbean.com, and its ship pages carry no
figure table. Its official figures are the "Fast Facts" PDF that each fact sheet on its press center
(`royalcaribbeanpresscenter.com/fact-sheet/<ship>`) links as "Download PDF", on `royalcaribbeanmedia.com`.
- For those ships the observation's `url` is the PDF, and `found_via` is the fact-sheet page.
- `document_sha256` pins the exact PDF that was read, and `published_as_of` is the sheet's own "Updated" date.
- The sheet prints `1,500 CREW`, `168,666 GT`, `4,180 GUESTS (DOUBLE OCCUPANCY)` and `348 METRES LONG`, and
  each is filed under the label as printed.
- A figure the sheet prints twice with different values is not filed.

## What status a statement may carry

| Status | When |
|---|---|
| `verified` | read from the line's own page by `capture-official.mjs` (the only tier the household lets mint it); rank `preferred` |
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

## Deployments: one direction (Track C5)

Which ships call at which ports is stored once, in `assets/data/ship-deployments.json` under `ships[*]`:
`homeports`, `typical_ports` (the headline subset a ship's own page shows) and `also_calls_at` (every other
port the ship is recorded as calling at). `port_to_ships` in the same file is **generated** from that, and so
is the pill list in each port page's "Ships That Visit Here" block, between the `itw:ships-visiting` markers.

```bash
node admin/lexicon/deployments.mjs           # regenerate port_to_ships and the port pages' generated blocks
node admin/lexicon/deployments.mjs --check   # exit 1 itw_link_one_direction, 3 itw_ships_visiting_stale
```

To add or remove a call, edit `ships[*]` and regenerate. Editing `port_to_ships` or a marked block by hand is
refused at pre-commit and in CI. A ships block written by hand (a note, a noscript list, a different layout)
is never rewritten: the tool lists it with how it differs from the data, so a person can settle it.

Before this, the file held the relation twice and the copies disagreed (forward 1,589 pairs, reverse 6,145,
1,130 in both), and the port pages held a third copy baked in once. The move to one direction filed the
union of all three, so no claim was lost: 5,015 calls from the reverse list and 32 from port-page links went
into `also_calls_at`. `metadata.last_updated` was left alone, because no deployment was researched again.
Whether every one of those calls is still current is a separate question the data cannot answer.

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
