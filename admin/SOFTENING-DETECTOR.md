# Softening detector

`admin/softening-detector.mjs` reads a diff and flags a change that turned a page's validator result
green by **softening the content** instead of fixing what the check pointed at. It reports. **It never
edits a page.** Content repair stays with a person: keep_human on content, automation only on detection.

It is **advisory** and is **not wired into any git hook or CI**. Whether and where to wire it is the
operator's decision.

Why it exists: `admin/CAREFUL_NOT_CLEVER_FAILURE_2026_05_21.md` patterns 1 to 4 (the Sydney image remap,
the Hobart and Lerwick qualifier stripping, the Glasgow and Mauritius rewords, the Vigo reorder). These
follow the scanner dodging and validator capitulation in `CAREFUL_NOT_CLEVER_FAILURE_2026_05_18.md` and
the bulk weather pass in `CAREFUL_NOT_CLEVER_FAILURE_2026_05.md`. Each time, a validator went green and a
reader lost something. A validator cannot see that loss, because the softened page is exactly the page it
asks for. The detector reads the change itself.

## Running it

Run from anywhere. `--repo` defaults to the checkout that holds the script.

```bash
node admin/softening-detector.mjs --range 78c65504^..78c65504
node admin/softening-detector.mjs --range origin/main..HEAD
node admin/softening-detector.mjs --staged
node admin/softening-detector.mjs --diff-file /path/to/change.diff
node admin/softening-detector.mjs --range origin/main..HEAD --json
```

Flags: `--repo <path>` picks the repository for `--range` and `--staged`. `--json` prints a machine-readable
report. `--min-block N` sets the moved-block size for section reshuffles (default 8 non-blank lines).

Only changed `.html`/`.htm` files are read. A diff that touches no page, such as a voyage-alerts refresh of
`alerts.json`, is CLEAN with "0 changed HTML page(s)" in the summary.

Tests: `node --test admin/tests/softening-detector.test.mjs`. The fixtures in
`admin/tests/fixtures/softening/` are real commits saved with `git show <sha> -- <page>`, so the tests do
not depend on how deep the clone is.

## Three states

| State | Exit | Meaning |
|---|---|---|
| FINDINGS | 3 | At least one finding. Each one names the page, line, removed text, added text and why. |
| CLEAN | 0 | The diff was read and no pattern showed. Clean is not proof of quality (see limits). |
| UNAVAILABLE | 2 | The range or diff could not be read. **Never reported as CLEAN.** |

<a id="codes"></a>
### Codes

| Code | Exit | Cause | Remedy |
|---|---|---|---|
| `softening_found` | 3 | A pattern below showed on a changed page | Read each finding (next section) |
| `clean` | 0 | Looked, found none | None |
| `range_unreadable` | 2 | `--range` is not `<a>..<b>`, an end does not resolve to a commit, or `git diff` failed | Use refs present in this clone (`git -C <repo> rev-parse --verify <ref>`). Deepen a shallow clone if a commit is missing |
| `staged_unreadable` | 2 | `git diff --cached` failed | Run in a git checkout, or pass `--repo` |
| `diff_file_unreadable` | 2 | `--diff-file` could not be read | Pass a readable file |
| `diff_empty` | 2 | `--diff-file` was empty | Regenerate it. An empty capture is never read as clean |
| `diff_unparseable` | 2 | No unified-diff header, a truncated hunk, or a merge commit's combined diff | Diff two commits with `--range a..b`, or regenerate the file |
| `usage` | 2 | No input mode, two modes, or an unknown flag | Pass exactly one of `--range`, `--staged`, `--diff-file` |

There is no override switch. The detector blocks nothing, so it has nothing to override.

## The patterns

Each finding carries a verdict: **SOFTENING** (the change looks like a softened fact) or **NEEDS A READER
CHECK** (the change may be right, and a person has to read it).

### reference-repointing (postmortem §1, Sydney)

An `src`, `srcset`, `poster` or `href` changed to a different file while the alt text, title, caption or
link text on the same line stayed word for word. The claim did not change, but the thing it points at did.
The kind is `descriptive-to-generic` when a descriptive name became a numbered or generic one
(`sydney-opera-house.webp` to `sydney-2.webp`), and `different-file` otherwise.

- Images are SOFTENING: alt text is a claim about what the file shows.
- Links are NEEDS A READER CHECK, unless the target became generic. Link text names a page, and a changed
  link is usually a repaired link (for example `giovannis-table.html` to `giovannis.html`).
- Ignored: the same file stem behind a query string, a new extension, a new directory or a trailing slash
  (cache-busters, `/ships.html` to `/ships/`).
- Not read: `og:image` and `twitter:image` meta tags. They carry no alt or caption, so there is no claim to
  compare. Commit 9c83fb7d (social previews pointed at a site-wide fallback image) is CLEAN by design.

### constraint-stripping (postmortem §2, Hobart and Lerwick)

A factual qualifier in a removed field is missing from its replacement in **the same field**:

- **Full strength** in the fields validators target: activity rows (keyed by `activity-label`) and FAQ
  answers (keyed by the question, in JSON-LD, `<strong>Q:` and `<details class="faq-item">` markup). Every
  kind counts: parentheticals, weekdays, ordinal weekdays ("last Tuesday"), the words only, except,
  excluding, closed, seasonal, best, peak, until, permitting, appointment, reservation, required, advance,
  and months, times and numbers.
- **Planning constraints only** in table rows, list items and prose lines replaced one-for-one: weekdays,
  ordinal weekdays, only/except/excluding/closed/seasonal, and parentheticals that carry one of those. In
  these places a changed figure is far more often a data correction (a ship's tonnage, a price) than a
  strip.

Two rules keep corrections from reading as strips:

- "Year-round" and a full twelve-month list are the same fact, in both directions. Hobart's MONA row
  (`Year-round` to twelve months) loses nothing. The Salamanca Market row (`Year-round (Saturdays)` to
  twelve months) loses "Saturdays".
- A month, time, weekday or figure counts as lost only when nothing of the same kind took its place.
  `Saturday` to `Sunday`, `12-hour` to `8 a.m. to 8 p.m.`, and `($10-20/day)` to `(roughly $20-35/day)` are
  edits of the fact, not strips. An explicit `N/A` is a claim change, not a strip. A spelled-out number
  ("thirty-minute") keeps a removed `30`.

### regex-dodging (postmortem §3, Glasgow and Mauritius)

An FAQ question changed while its answer stayed the same (word overlap 0.6 or more), and the question:

- lost the page's own place name ("When is the best time to visit Ha Long Bay?" to "...to visit?"), or
- dropped a token `admin/VALIDATOR_REGEX_ISSUES.md` names as a collision: `bring` (REGEX-02) or `go`
  (REGEX-01) ("What currency should I bring?" to "What currency is used in Mauritius?"), or
- gained an invisible character (zero-width or format control) that breaks a token for a regex without
  changing what a reader sees.

Also flagged: a new question on a modified port page that says "here" or "this port/city/island" where its
own answer names the place ("What is the hurricane and storm season here?" on the Glasgow page; the note
says Glasgow contains "go", which REGEX-01 matched). And a heading that lost the place name while keeping
its other words. Place-name checks run only on `ports/<slug>.html`, where the file slug is the place.
"There" is not treated as deixis, because in a question it usually points at a thing ("are the flamingos
really there?").

### section-reshuffle (postmortem §4, Vigo)

A block of 8 or more non-blank lines (at least three of them visible lines of 20+ characters, not JSON-LD)
was deleted at one position and re-added at another in the same page. The detector proves it is a move,
not an in-place edit: it counts the unchanged lines before the block in the old file and in the new file,
and the counts differ. This is always **NEEDS A READER CHECK**, never a defect by itself.

## What to do with a finding

The detector never edits. A person decides, and the answer is one of these:

1. **Fix what the check pointed at.** If an image was missing, source the right image or remove the figure
   together with its alt text. Do not point the alt text at a file nobody has looked at.
2. **Restore the fact.** If a qualifier was stripped, put it back, in a field the check accepts if need be
   (as 0bddee9e did for Hobart, Lerwick and La Coruña).
3. **Log the validator bug centrally** in `admin/VALIDATOR_REGEX_ISSUES.md`, with the page, the regex, the
   collision and a suggested fix, and fix the regex once (as 0683f1bc did for REGEX-01 and REGEX-02). A
   reword may still ship, but only with that entry.
4. **For a reshuffle,** read the page in its new order, in a browser, and either confirm the flow or name
   it in the commit as "reorder not visually verified".
5. **If the finding is wrong,** say so in the review. A deliberate correction that removes a fact (see
   limits) is a legitimate reason to dismiss a finding.

## Measured results

Oracle commits (each read with `--range <sha>^..<sha>` and as a saved fixture):

| Commit | Page | Expected | Detector |
|---|---|---|---|
| 78c65504 | ports/sydney.html | flag repointing | 8 `descriptive-to-generic` findings |
| 6e45536a | ports/hobart.html | flag stripping | Salamanca Market "(Saturdays)" lost |
| e28cc6fc | ports/lerwick.html | flag stripping | Up Helly Aa "(last Tuesday)", Otter Spotting "best" lost |
| 61c8cf9e | ports/glasgow.html | flag dodging | "storm season here?" (JSON-LD and HTML), "go" noted |
| 46c1eee0 | ports/mauritius.html | flag dodging | "bring" dropped, REGEX-02 named |
| 495a860a | ports/vigo.html | flag reshuffle | 3 moved blocks, reader check |
| 0bddee9e | hobart, lerwick, la-coruna | not flagged | CLEAN |
| 0683f1bc | glasgow, mauritius | not flagged | CLEAN |
| 61ab4d1b, 2c3ba8ad, 95e00838, 45315e92, 539206a6, fb999b44, d9258dad, 9c83fb7d | ordinary | not flagged | CLEAN |

Sweep of the last 400 non-merge commits on `origin/main` that touch HTML (measured 2026-11-08): 389 CLEAN,
11 FINDINGS. Four of the eleven are themselves validator-driven port passes (c511acea "Fix FAQ_COUNT
mismatches", 06b866b7, 3c6a9ec4, 3d915868). Their findings are place names dropped from FAQ questions and
details dropped from FAQ answers during schema sync, which is the pattern this detector exists to show.
Two (daedbabc, 8b315b11) are link repoints, reported as reader checks. The other five are editorial
corrections that removed a constraint on purpose, which are false positives: 53c04972 (Galveston), 58c08403
(Great Stirrup Cay article), and three voyage-pack edits (0a4d1258, d702a352, bd6f2f82), each with one
finding where a weekday, "only" or "closed" left a pack's prose. See the first limit below.

## Honest limits

- **Deliberate fact removals read as strips.** 53c04972 removed the 1900 hurricane from the Galveston page
  on purpose, and two FAQ answers are flagged. Prose edits that delete a weekday (58c08403, a voyage-pack
  itinerary correction) are also flagged. The detector cannot tell a correction from a softening when
  nothing takes the fact's place.
- **It sees only what the diff pairs.** A qualifier moved to a different field or paragraph is reported as
  lost from the first and is not credited to the second. A rewrite that changes both the field key and its
  value (a renamed activity row) is not paired at all.
- **Abbreviated weekdays** ("Sat", "Tue") are not matched on their own, because "Sat" and "Sun" are ordinary
  words. Inside a parenthetical they are still caught as a lost parenthetical.
- **The collision-token list is fixed in the code** (`bring`, `go`). A new regex bug logged in
  `VALIDATOR_REGEX_ISSUES.md` does not reach the detector until someone adds its token to
  `COLLISION_TOKENS`.
- **It cannot look at images.** Reference repointing says the claim and the file now disagree in name. It
  cannot say what the new file shows. That check stays with a person.
- **Place names come from the file slug.** A port whose page slug differs from how the page names it
  (`san-antonio.html` for San Antonio, Chile is fine; a slug that is an abbreviation is not) can miss.
- **CLEAN is not quality.** It means none of these four patterns showed, not that the page is right.
  Template filler and plausible fabrication (postmortem §5) are outside what a diff check can see.

Soli Deo Gloria.
