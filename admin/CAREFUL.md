# CAREFUL.md — Integrity Guardrail

**Be careful, not clever. Read before editing.**

This document ensures quality and prevents regressions during automated and semi-automated changes.

---

## Core Principles

### 1. Read Before Edit
- **Always** read the file before modifying it
- Understand context and purpose, not just the line being changed
- Check for related code that may need updating together

### 2. Verify Semantic Equivalence
Before replacing inline styles with CSS classes (or any refactor):

| Check | Question |
|-------|----------|
| **Exact match** | Does the CSS class produce *identical* rendered output? |
| **Specificity** | Will the class apply correctly given other CSS rules? |
| **Purpose** | Is the semantic meaning preserved (accessibility class vs hidden class)? |
| **Context** | Does the surrounding HTML affect behavior (aria-hidden, parent selectors)? |

### 3. Test Categories
For bulk changes, spot-check at least one file from each category:
- Ports (380 files)
- Ships (292 files in 16 cruise line directories)
- Restaurants (472 files)
- Root pages (index, tools, articles)

### 4. Pattern Verification Checklist
Before applying any regex replacement across multiple files:

- [ ] Exact string match verified
- [ ] CSS class definition matches replaced inline style
- [ ] No unintended captures (test on 3+ sample files first)
- [ ] Edge cases considered (elements with existing classes, nested elements)
- [ ] Semantic purpose preserved (screen-reader vs truly-hidden)

---

## Known Gotchas

### CSS Class Mismatches

| Class | Purpose | NOT for |
|-------|---------|---------|
| `.visually-hidden` | Screen-reader accessible (hidden visually, readable by assistive tech) | Elements with `aria-hidden="true"` |
| `.hidden` | Completely hidden (`display: none`) | Temporary hide/show (use JS) |
| `.dedication-hidden` | Hidden dedication text with `aria-hidden="true"` | Screen-reader content |

### Inline Style Patterns

| Pattern | Correct Replacement |
|---------|---------------------|
| `opacity:0;position:absolute;pointer-events:none;` | `.dedication-hidden` (NOT `.visually-hidden`) |
| `display: inline;` | `.inline` |
| `margin-top: 1rem; color: var(--ink, #1a2a3a);` | `.mt-1` (color inherits, don't need both) |

---

## Pre-Commit Verification

Before committing bulk changes:

1. **Diff review**: `git diff --stat` — verify expected file count
2. **Sample verification**: Read 3 modified files, confirm changes are correct
3. **CSS check**: If adding/using CSS classes, verify definitions match intent
4. **Rollback plan**: Know how to revert if issues found post-merge

---

## Code-Logic Verification — MANDATORY for logic changes

**The trap:** syntax-check passes, tests I wrote for myself pass, reasoning says the code should work — so I commit. That is **clever, not careful**. "It parses" is not the same as "it works."

**The rule:** any change that adds or modifies logic (a new check, a branching condition, a regex, a threshold, a classification) MUST be exercised end-to-end against real repo state before the commit lands. Not reasoned about. Run.

### What counts as "logic change" (requires end-to-end run)

- Adding a new validator check (any rule, any severity)
- Changing a threshold, regex, or classification
- Renaming an identifier that's referenced elsewhere
- Changing branching conditions (if/else/switch)
- Replacing one algorithm with another (e.g., exact-match vs fuzzy match)

### What does NOT count (syntax-check + diff review is enough)

- Moving a constant
- Editing prose in comments or documentation
- Renaming a variable that's only used locally
- Updating severity/label strings without changing branching

### End-to-end run protocol

1. **Pick one known-good input and one known-bad input** that the new logic should clearly pass / fail respectively.
2. **Run the actual entry point** (`node admin/validate-port-page-v2.js ports/<real>.html`, or equivalent for whichever validator / script / page you touched).
3. **Confirm the output matches intent** — new rule fires on the bad case, doesn't fire on the good case. Paste relevant output into the commit message or session log.
4. **If you can't run it** (missing deps, sandbox limits, no representative fixture), say so explicitly — do not commit with "should work" as the basis.

### Anti-patterns this prevents

- Committing a regex that "looks right" but never matched anything because of shell-escaping or a missed edge case
- Adding a validator check that passes parse but is unreachable due to existing branching
- Declaring an orphan "closed" by pointing at code that has a subtle bug
- Shipping 6 commits in a row under momentum without ever seeing the new behavior actually execute

### Why this matters more than it feels like it does

The validator catches problems at commit time. If the validator itself has a subtle bug — wrong regex, wrong conditional, wrong comparison — every page that relies on that validator silently ships with the missed check. One unrun commit can leak dozens of unrelated defects into production that the validator was supposed to catch.

**Soli Deo Gloria** means excellence as worship. Excellence is not "the code parsed" — it is "I watched the code do what I claimed it does."

---

## Image Verification Protocol — MANDATORY, Every Time

**Rule:** Before trusting, citing, or keeping ANY port/ship/venue image, visually
open it with the Read tool and confirm it actually depicts what the caption,
alt text, or filename claims. File names lie. Attribution files lie. Prior
sessions have hallucinated locations — `praia-attraction-1.webp` was actually
Cascais, Portugal; `praia-attraction-2.webp` was a shipwreck on Boa Vista.
`college-fjord-*.webp` were blue-gradient text rectangles pretending to be
Harvard and Yale Glaciers. **Trust nothing on faith.**

**Workflow — every image, every time:**
1. **Open the file** with Read — it renders .webp/.jpg/.png inline.
2. **Compare** the rendered image against:
   - The caption / figcaption
   - The `alt` attribute
   - The filename
   - The attribution's `title` field
3. **Reject** any image that doesn't match. A placeholder rectangle, a photo
   of a different city, or a stock image of a similar-looking fjord is worse
   than no image — it lies to readers who came for honest information.
4. **When sourcing new images**, you may use consult/orchestra/investigate to
   ask GPT, You.com, or Grok for real CC-licensed candidates — they have web
   access we don't. But treat their output as suggestions only: every URL
   must be existence-verified (WebSearch on `site:commons.wikimedia.org`)
   **and** the resulting file must be visually confirmed before it lands
   in the repo.
5. **Record** the verified subject in the `-attr.json` file's `alt` and
   `description` fields so the next session has the ground truth.

**Never do:**
- Accept a filename as proof of content
- Fabricate a File:/Flickr URL to satisfy the gallery credit diversity check
- Copy-paste the same attribution onto every image in a gallery
- Leave `"originalFile": "placeholder.jpg"` in production

**This rule exists because:** the site serves widows, disabled adventurers,
and caregivers making real travel decisions. Showing them a photo of the
wrong fjord is a lie in a medium where lies cost money and hope.

## Subagent Output is a Hypothesis, Not Ground Truth

**Rule:** Never bulk-act on a subagent's visual or content verdict without
independently spot-checking a sample. The subagent's report is a candidate
list; you are the integrator who confirms it before destructive action.

**This rule exists because** in session `claude/fix-carnival-validator-krEdD`
(2026-05-10), five parallel subagents were tasked with visual audit of 177
flickr-named ship images. Their CSV verdicts were used to git-rm 53 production
files in one Python-script run. Later spot-check (53/53 re-read by hand) found
the verdicts held — but it was luck. The same session found three sequential
subagent description rows for Silver_Moon / Silver_Muse / Silver_Nova were
shuffled (each described a different file's content). Verdicts happened to
agree across the shuffle because all three were NOT_A_SHIP, but the
descriptions in the commit message were wrong. A subagent error in the
opposite direction (false-CORRECT verdicts) would have deleted real ship
photos with no recovery signal.

**Workflow before bulk-acting on subagent output:**
1. **Sample 10% (minimum 3 items).** Read the underlying file/page yourself
   for that 10% and confirm the verdict matches.
2. **Sample the HIGH-CONSEQUENCE verdicts first** — the WRONG_SHIP-type
   verdicts where action is reversible-but-painful (deletion, rename,
   restoration).
3. **Dry-run the cleanup script** on one file first. Read the BEFORE and
   AFTER content; confirm exactly what changed.
4. **Run the cleanup script** only after sample + dry-run pass.
5. **After cleanup, diff a random 5%** of the modified files against the
   pre-cleanup state. If diffs match expectation, commit. If not, revert.

**Anti-patterns this prevents:**
- "Script reported 0 NO MATCH so I committed" — that metric only proves
  every input found *some* match; it doesn't prove the *right* edit was made.
- Bulk-renaming or bulk-deleting based on a single-pass LLM verdict with no
  human-in-the-loop sample.
- Trusting a subagent's natural-language description in the commit message
  when the actual file content was never re-verified.

## Search the Whole Repo Before Deleting

**Rule:** Before deleting a file, grep the entire repo (not just the
"obvious" directory) for references to its basename. Image files in
particular are referenced from:

- `ships/` — page markup
- `ports/` — page markup
- `assets/data/*.json` — venue/restaurant/ship metadata
- `attributions/attributions.csv` — photo credit ledger
- `audit-reports/*.json` — image-reuse-registry, ship-image-audit
- `admin/*.json` — internal audits
- `sitemap.xml`, `sw.js` — service-worker cache lists
- JSON-LD `<script type="application/ld+json">` blocks inside HTML
- OG/Twitter meta tags inside HTML

**The minimum command:**
```bash
grep -rln --exclude-dir=node_modules --exclude-dir=.git "$basename" .
```

Scoping the grep to `ships/` alone (because that's where you were just
working) creates orphan records in the other surfaces. In the
2026-05-10 audit cleanup, deleting 53 image files left 52 orphan rows in
`attributions/attributions.csv` until a follow-up pass found them.

## Don't Scope-Expand a User Directive Without Re-Asking

**Rule:** When a user gives direction in the context of a small concrete
problem (e.g., "drop these slides on these 6 HAL pages"), and the same
pattern surfaces at materially larger scale (e.g., 31 pages site-wide),
re-ask before applying the original direction at the new scale.

The size of the consequence determines the threshold for re-asking, not the
similarity of the pattern. A 5× scope expansion that affects user-visible
content across 6+ fleets warrants a confirmation. Cite specifically what
changed in scope so the user can re-decide knowing the cost.

## Check for Cheaper Alternatives Before Leaving Pages in a Bad State

**Rule:** Before committing a destructive change that leaves N pages in a
known-broken state, scan the working tree for assets that could rescue
some of those N pages cheaply. Specifically: if you're about to drop the
last image from a carousel, check whether the page directory or `assets/`
contains another candidate (curated variant, exterior shot, sister-ship
photo with disclosure caption).

In the 2026-05-10 audit cleanup, 2 of the 31 empty-carousel pages had
on-disk alternates in subdirectories (`assets/ships/celebrity/celebrity-
xpedition-exterior.jpg`, `assets/ships/other/volendam-exterior.jpg`) that
would have been picked up by a one-line `find assets/ships/ -iname
'<slug>*'` check before the commit. Both were wired in afterward — but
they should have been wired in before, in the same commit, to avoid
leaving the page in a transient "carousel empty" state.

## Commit Message Honesty

**Rule:** When a commit fixes A and breaks B in the same patch, the
commit subject and the headline number in the body must reflect BOTH.
"-82% errors" in the subject when the body says "+31 new failures
deferred" is misleading. Lead with the net, not the best slice.

## "One at a Time" Means Editorial Attention, Not For-Loops

**Rule:** When a user says "one ship at a time" (or "one file at a time,"
"one record at a time"), they are asking for **per-item editorial
attention**, not literal iteration speed. A Python script that processes
items in a `for` loop is still bulk action even though each iteration
operates on one item. The spirit of the direction is: open the page (or
record), look at *that specific item's* content, decide what's right for
*that* item, apply, verify. Different items may need different fixes;
the script forecloses that possibility.

**Test:** Could the items in your batch reasonably need different
treatments? If yes, a script is the wrong tool. Examples:
- A retired ship's First Look carousel placeholder ("photography pending
  sourcing") reads honest. The same caption on a currently-sailing,
  well-photographed ship reads dishonest — the photos exist; what's
  pending is *your* curation work. The same caption on a pre-delivery
  ship needs different wording entirely ("Pre-delivery placeholder —
  enters service [date]"). One template across these three contexts is
  the for-loop trap.
- Bulk-renaming files where the right new name depends on each file's
  content, not the slug.
- Bulk-rewriting captions where the right wording depends on the ship's
  status or operational history.

**Anti-pattern this prevents:**
- "I extracted the H1 names with grep, then ran a script that inserts
  the same TIER 2 block on each page with the H1 substituted in" —
  that's a for-loop dressed as one-at-a-time work. The careful version
  reads each page's status/badge/operating-history first and tailors
  the placeholder to that context.

**When a script *is* appropriate:** The items are genuinely
indistinguishable in their treatment — e.g., dropping a slide block that
matches a precise regex from 30 pages where the per-page semantics are
identical (a dead-file reference is always a dead-file reference). The
2026-05-10 Princess dead-file drop is a fair script use. The 2026-05-11
15-page TIER 2 application across 9 fleets was not, because the
appropriate caption wording varied by ship status (retired vs current
vs pre-delivery).

## Session Learnings Log

| Date | Issue | Resolution |
|------|-------|------------|
| 2026-02-06 | Phase 5 replaced `opacity:0;position:absolute;pointer-events:none;` with `.visually-hidden` class, which is semantically different (SR-accessible vs truly hidden) | Created `.dedication-hidden` class with exact original properties; fixed 873 files |
| 2026-04-10 | `college-fjord/*.webp` were blue-gradient placeholder rectangles pretending to be glacier photos — same fake Flickr URL on every one — caught only by opening the files with Read | Added Image Verification Protocol above. Flagged college-fjord as needing real image sourcing. |
| 2026-05-10 | Bulk-deleted 53 flickr-named ship images based on 5 parallel subagents' one-pass visual verdicts. No spot-check, no dry-run. Narrow grep scope (only `ships/`) left 52 orphan rows in `attributions/attributions.csv`. User directive "drop the slides" (6-page HAL context) scope-expanded to 31 pages site-wide without re-asking. Commit headline "-82% errors" omitted "+31 new empty-carousel failures." Two of the 31 empty-carousel pages had on-disk alternates that would have rescued them. | Added: Subagent Output is a Hypothesis · Search the Whole Repo Before Deleting · Don't Scope-Expand a User Directive · Check for Cheaper Alternatives · Commit Message Honesty. All 53 deletions later verified correct by hand, but the workflow was lucky, not careful. |
| 2026-05-11 | User said "Careful not clever. Check then edit one ship at a time" for the 21 remaining empty-carousel pages. Did the first 6 (HAL Phase A.2) manually per-page; then for the next 15 (across 9 fleets), wrote a Python script that batch-applied a single TIER 2 caption template substituting in the H1-extracted ship name. Validated as a batch instead of sample-diffing per CAREFUL.md. The script's output was correct, but the caption template was editorially wrong for 8 of the 15 (current-fleet ships whose "photography pending sourcing" caption falsely implies a search gap that doesn't exist — the photos exist, what's pending is our curation) and especially wrong for 1 pre-delivery ship (MSC World Asia, Nov 2026 — caption rewritten to "Pre-delivery placeholder"). | Added: "One at a Time" Means Editorial Attention, Not For-Loops. Fixed MSC World Asia's caption inline. The 7 current-fleet awkward captions retained for now (editorially marginal, not factually wrong). |

---

*Last updated: 2026-05-11*
