# Port research reports

**Soli Deo Gloria.**

Grounded research behind the port pages in `ports/`, one report per batch of
ports. These exist because of a specific failure: the v0.1.17 Volendam world-
cruise pack named nine ports the site had no page for, and the pack's
descriptions of them were written from recall rather than from sources. Five of
them contained defects. The pass that followed researched each port properly,
and these are those findings.

## Why they are checked in

Three reasons, in order of how much they cost when they are missing.

1. **The corrections outlive the page.** These reports are where a claim's
   provenance lives. When someone later asks "why does the page say Ver-o-Peso
   dates from 1625 when everything online says 1688?", the answer and its source
   are here, not in a chat log that has been garbage-collected.
2. **Research is expensive and the container is not.** Each report is an hour or
   more of sourced work against primary authorities. Sessions run in ephemeral
   containers; anything left in `/tmp` dies with them.
3. **They are the input to the next page.** A port spec in
   `admin/port-specs/<slug>.json` is written *from* one of these, and the
   `.factcheck.json` sidecars cite them.

## How to read one

Every report is organised by the numbered brief it was written against, carries
an inline source URL on every claim, and closes each part with two lists that
matter more than the body:

- **CORRECTIONS** — facts widely repeated online that turned out to be wrong or
  stale, with the correct version and the authority for it. Read this first; it
  is the part that changes what you write.
- **UNVERIFIED** — anything that could not be sourced. These are *not* facts.
  They must not be written into a page as if they were, and they must not be
  quietly upgraded by a later writer who finds them convenient.

Facts describing a future state were checked against whether that date had
already passed at the time of writing. Re-check anything time-sensitive before
publishing: opening hours, prices, closure and restoration schedules, advisory
levels, and visa rules all drift.

## Standing rules

- **Prefer primary sources**: port authorities, national heritage bodies,
  government departments, UNESCO, national meteorological and statistics
  agencies, and site operators themselves. Read the local-language original
  where that is the primary record.
- **Where sources disagree, record the disagreement** and say which is
  authoritative and why. Do not average them and do not pick silently.
- **A number without a source is UNVERIFIED**, however plausible.
- **Date-stamp everything.** A fact that was true is not the same as a fact that
  is true.

## Reports

| File | Ports | Written |
|---|---|---|
| `sanantonio-reunion-research.md` | San Antonio (Chile); La Réunion | 2026-07-30 |
| `devils-island-belem-research.md` | Îles du Salut / Devil's Island; Belém | 2026-07-30 |

**Soli Deo Gloria.**
