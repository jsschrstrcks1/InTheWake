<!-- Soli Deo Gloria. "Buy the truth, and sell it not." Proverbs 23:23 -->

# Entities: the facts behind the pages

This folder holds In the Wake's facts as **statements**: one property of one ship (or, later, port or
venue), one value, the sources it rests on, and the time it is true for. The pilot ships' stats cards are
rendered from them (Track C3, below), so a fact is written once and every page that shows it agrees.

Plan: Project-Sophos `docs/lexicon/LEXICON-PLAN-3.1.md`, Track C. Contract:
`docs/lexicon/STATEMENT-CONTRACT.md` there. Tekton `itw-c1-cruise-pack-schema` (this structure) and
`itw-c2-ship-pilot-five` (the first five ships); `itw-c2c-fleet-ship-statements` (every ship, 2026-10-27).

## What is here

| Path | What |
|---|---|
| `ship/<slug>.json` | one file per ship (Track C2), `lexicon-entity/1`: every page under `ships/<line>/` except a fleet index or venue list, plus any ship the line's site describes that has no page yet |
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

## Which ships, and how a ship is named

`admin/lexicon/ship-statements.mjs` builds one entity per ship (`fleet()`):

- The pilot list (`PILOT`) comes first, because it carries the identity calls a file name cannot. Legend of
  the Seas is two ships on three pages, so the list names which page is which ship.
- Every other page under `ships/<line>/` is one ship, named by its file: `ships/rcl/grandeur-of-the-seas.html`
  is `ship:grandeur-of-the-seas`. A fleet index (`index.html`) or a venue list (`venues.html`) is not a ship.
- A ship the line's own site describes but this site has no page for yet (Hero of the Seas, in
  `assets/data/lexicon/observations/`) is still an entity, filed from the line's figures alone.
- The same file name under two lines is refused (`itw_identity_split`): the tool will not guess which is
  which. Two ships whose records name one IMO are refused the same way. The first whole-fleet run found one:
  both 1995 Legend of the Seas records carried her sister Grandeur's IMO. They now carry 9070620 (VesselFinder:
  MARELLA DISCOVERY 2, built 1995, which the page says she became).
- A figure the line's capture holds back for a person (`held`) is listed under `not_filed` with its reason.

After a ship page, a ship record or a capture is **committed**, run `node admin/lexicon/ship-statements.mjs`
and commit what it writes. It reads committed content only (each fact is dated by its source's commit), so it
cannot run inside the commit that changes the source. The unit test `the entity files are exactly what the
records say` fails while any file is behind.

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

`admin/lexicon/capture-official.mjs` opens each ship's page on the line's own site in a real browser and
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

## The stats card, rendered from statements (Track C3)

Operator decision D7 (Ken, 2026-10-29): render the infobox from statements. On every pilot page (`PILOT` in
`admin/lexicon/ship-statements.mjs`, seven pages for six ships), `admin/lexicon/render-infobox.mjs` writes the
whole `#ship-stats` mount between `<!-- itw:infobox ... -->` and `<!-- /itw:infobox -->` markers:

| Row | Where its value comes from |
|---|---|
| Class, entered service, gross tonnage, guests, crew, length, IMO | the statements, through the contract's `currentValue`: the line's own figure where it is the one preferred statement |
| a figure the statements disagree on | **nothing**: it is named under the card ("Not shown while sources disagree") until a person settles it, and the page's typed figure does not stand in |
| a figure filed as `unknown` | nothing; named under the card ("No source found yet") |
| beam, registry, or a row no statement covers at all | the page's own `#ship-stats-fallback`, as `ship-stats.js` shows it today, marked `data-prop="page:<key>"` and credited as "this page's own records" |

Under the card, one line names every source shown. A cruise line's page or fact sheet is linked (marked
"(PDF)" when it is one) with the day it was read. This site's records carry no date: they are dated by
their source's last commit, and the ship page is one of those sources, so a date there would change the
page every time it is committed and never settle.

```bash
node admin/lexicon/render-infobox.mjs           # render the pilot cards
node admin/lexicon/render-infobox.mjs --check   # exit 1 itw_infobox_drift, 2 itw_infobox_unavailable, 3 itw_infobox_hand_mount
```

Change a figure in the statements (or the record they are filed from), regenerate the entity files, then
render; never edit inside the markers. The card is plain HTML, so it reads the same with JavaScript off, and
`ship-stats.js` leaves it alone because the mount is not empty. `tests/unit/lexicon-render-infobox.test.mjs`
fails while any pilot card is not what its statements render.

**Not covered, said plainly.** The prose, the Key Facts list, the meta description and the JSON-LD on the
same pages still repeat figures by hand and can still disagree with the card (Grandiosa's prose says 331
metres; MSC's own page, which the card shows, says 331.43). A stale card is refused by the gates below.

## Gates (Track C4)

`admin/lexicon/statement-gates.mjs` runs at pre-commit (when a commit touches a ship page, an entity file, the
card manifest or the tools that write them) and in CI (`quality.yml`, step "Statement gates"). Every refusal
prints its code, the remedy, and a link to this section.

**Two depths.** The statement contract lives in Project-Sophos, which is private, so this public repo's CI cannot
load it. Where the contract is beside the checkout (or `LEXICON_CONTRACT_DIR` names it), the gates run at **full
depth**: every pilot card is re-rendered and compared, and every value it shows is resolved again. Elsewhere, and
always in CI (`--ci`), they run at **manifest depth**: unsourced statements in full, and every pilot card against
`assets/data/lexicon/infobox-manifest.json`, the sha256 the renderer records of each card and of the entity file,
fallback JSON and renderer it was written from. The output names the depth and what it did not check; a missing
contract is reported as UNAVAILABLE, never as a full pass.

| Code | Exit | Refuses | Repair by hand |
|---|---|---|---|
| `itw_statement_unsourced` | 1 | a statement with status verified, known or inference that names no evidence (or a blank one), has no `source_ref`, or is `verified` without a web page read in the session | Find what the claim rests on. If it is this site's record, fix the record and run `node admin/lexicon/ship-statements.mjs`; if it is the line's page, capture it with `admin/lexicon/capture-official.mjs` first. Never edit a statement by hand: its id is a hash of its content. If no source exists, the honest status is `unknown` |
| `itw_statement_gates_unavailable` | 2 | an entity file, a pilot page or the manifest could not be read | Open the file the message names and fix its JSON or path. Nothing unread is reported as clean |
| `itw_infobox_drift` | 3 | a pilot card that is not what its statements render: edited inside the markers, or written from an entity file, a fallback or a renderer that has changed since (a missing or hand-written mount too) | Run `node admin/lexicon/render-infobox.mjs` and stage the pages and the manifest it rewrites. To change what a card says, change the record the statement is filed from, regenerate with `ship-statements.mjs`, then render. After committing a pilot page, regenerate the entity files and render again in the next commit: the entity files are re-dated, the cards stay the same, and the manifest records the new hashes |
| `itw_conflict_published` | 4 | a pilot card showing a value whose statements disagree, or the page's own figure standing in where statements exist (full depth only) | Re-render: the renderer withholds a disputed value and names it under the card. To show a value, settle the dispute in the statements first (see Disagreements) |

There is **no baseline**: measured 2026-10-29, 0 of 1,848 statements were unsourced, so no existing debt needed
holding and every unsourced statement is refused. Tests: `tests/unit/lexicon-statement-gates.test.mjs`.

**Honest limit.** The manifest depth proves a card is what the renderer last wrote from the files as they are
now; it cannot prove that render was right, and it cannot see a disputed value. A contributor without
Project-Sophos beside the checkout gets only the manifest depth at pre-commit too. Neither depth sees a value
whose statement's validity window ends between renders.

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
