# Author card — specification (M3.4)

**Status:** authored from measurement on 2026-10-19 against `InTheWake` `main` (partial clone,
sparse `admin/`; issue states read from the GitHub API). This spec is the crossing input: the engine
writes a component that satisfies it, and `argus crossing` judges the result.

## Purpose

Every port page carries **one** short "About the Author" card that introduces Ken Baker and links to
his profile. It is the same card on every port page, produced by the generator/injector — not patched
in afterwards — and it must be accessible to assistive technology.

## Required elements

1. A container with class `author-card-vertical` (the card itself).
2. A **single heading** whose text is `About the Author` and whose `id` is unique on the page
   (`author-heading` by convention).
3. A profile link to `/authors/ken-baker.html` wrapping the avatar image.
4. An avatar `<img>` with a non-empty `alt` (the person's name, not "image").
5. The author's name as a link to the same profile.
6. A one-line blurb ("Founder of In the Wake; writer and editor of the logbook.").

## Accessibility contract

- **Heading level.** The card's heading is `h3` when the page's section headings are `h2` (the port
  pages' outline). It must not skip a level relative to the enclosing section. A card placed directly
  under an `h2` section uses `h3`; a card inside an `h4` block uses `h5`.
- **`aria-labelledby` points at the one heading.** The container carries
  `aria-labelledby="<the heading's id>"`, and that id exists **exactly once** on the page.
- **No duplicate ids** anywhere the card emits (a duplicate id breaks every reference, including the
  skip link — #1624).
- **Avatars carry meaningful alt text**; decorative wrappers are not announced.

## Exactly one per page

The rendered page contains exactly one `author-card-vertical` container and exactly one heading whose
text is `About the Author`. Zero is a defect on a port page; two is a defect everywhere.

## Idempotency

The injector **replaces** an existing card (matched by its marker or class) and never appends a
second one. Running it twice on the same page produces byte-identical output. A band-aid id rename
(`author-heading-2`, `author-heading-3`) is not a fix: it hides the duplicate from an id check while
leaving the duplicate content in place (#1916).

## Tests drawn from the issues — each re-verified 2026-10-19 before use

| Issue | State today | What was re-verified | Test the spec requires |
|---|---|---|---|
| **#1916** duplicated content blocks (author card on 70 pages) | closed 2026-07-07 | sampled 10 port pages by the `author-card-vertical` class: **9 exactly one, 0 duplicated, 1 card with no heading** (`ports/portimao.html`) | a port page renders **exactly one** card and exactly one `About the Author` heading; a second run of the injector changes nothing |
| **#1624** duplicate HTML ids, broken skip link | open | sampled pages have one `id="main-content"`; the contract still matters for the card's own ids | no duplicate id in the emitted card; `aria-labelledby` resolves to exactly one element |
| **#1706** generator duplication causes standards violations | open | the same card is still hand-shaped per page (three variants measured: `section/h3`, `div/h4`, `details/summary`) | the card is produced by the generator/injector; pages with the same outline get the same component |
| **#1711** 61+ post-hoc fix scripts | open | `admin/` now holds **74** `batch-fix-*`/`fix-*`/`repair-*` scripts | no new post-hoc fix script: the contract is enforced at generation and pinned by this spec's tests |
| **#1766** `repair-duplicate-recent-rail-id.js` (aria repair by reverse walking) | open | the script remains in `admin/` | `aria-labelledby` is authored correctly, never repaired by position walking; the heading id is canonical |

## Admissible exemplar — measured, not assumed

Three variants exist in the tree:

- **A (admissible).** `section.card.author-card-vertical[aria-labelledby=author-heading]` +
  `h3#author-heading` — e.g. `ports/bimini.html`.
- **B (refused: heading level).** `div.card.author-card-vertical` + `h4#author-heading` — e.g.
  `ports/abidjan.html`: the card sits under an `h2` section, so `h3` is the correct level.
- **C (refused: no heading, no label).** `details.card > summary` + `div.card-content` — e.g.
  `ports/portimao.html`: there is no `h*` and no `aria-labelledby`, so the card is not labelled.

So an exemplar exists (A); "no admissible exemplar" is **not** this outcome. Variants B and C are
refused with the reasons above, and the component is written to A.

**Soli Deo Gloria.**
