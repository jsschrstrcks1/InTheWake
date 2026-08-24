<!-- Soli Deo Gloria. A reasoning log kept for Ken — how we got there, and why. -->

# Reasoning Log

**For Ken. A running record of *how* and *why* — not just *what*.**

Every agent that works in this repo — Claude, Grok, Codex, Hermes, the Sophos/HELM
pipeline — records the reasoning behind its calls here. Newest entries at the top.

## What this is (and an honest note on what it isn't)

No agent can pipe its raw internal tokens into a file; dressing a polished summary up as
"the raw stream" would be a clever fake rather than honest work. So this is the honest
version: a genuine reconstruction — what was understood, the options weighed, what was
ruled in or out and why, where the uncertainty was, and how it landed. When something was
guessed, the entry says it was guessed.

Pipeline entries are different in kind: they are generated mechanically from the run
record (plan, retrieval, governance findings, publish decision), so they need no
compliance from anyone — if the run happened, the entry is true.

## How to read an entry

- **Asked** — what was requested, and how it was read.
- **Weighed** — the options and considerations in play.
- **Decided** — the call made, and the *why* behind it.
- **Unsure** — anything uncertain, or worth revisiting.

---

## 2026-08-24 — Day 1 dispatch: logbook created, dirty-cabin report published as sent (syl)

**Asked.** Ken, aboard, sent Day 1: embarkation smooth; rooms dirty and deteriorated —
toenails on the floor, detritus from previous guests; "We're giving them an opportunity to
fix it."

**Weighed.** Structure (deferred until now): one running logbook page over per-day
articles — one URL for the week, day anchors, matches the Quantum logbook precedent; no
placeholder sections for future days (coming-soon content is banned). Fidelity: the entry
carries ONLY the dispatched facts; nothing invented — no cabin numbers, times, staff
interactions, meals, or sailaway color, and no shore-power observations since he hasn't
sent any (the entry defers them to Day 2 explicitly rather than pretending). Tone: the
never-chipper rule governs — the failure is stated plainly ("toenails-on-the-floor dirty"),
and the fairness posture is his own words elevated to the entry's spine: the verdict is
deferred to how the ship responds.

**Decided.** New page norwegian-getaway-aug-2026-logbook (Trip Logbooks) with Day 1 only;
hub updated so "the logbook is next" now links the live logbook; index entry added.
Because the logbook links the shore-power and GSC research pieces, the whole branch goes
to main in this pass — daily-dispatch publishing implies live publication, per the
operator's standing "make it live on main" pattern and his "stay tuned" to readers.

**Unsure.** Whether the cabin gets made right, and how fast — deliberately so; that is
Day 2's entry, not this one's speculation.

---

## 2026-08-22 — Three articles in one pass: shore power, GSC changes, cabin types (syl)

**Asked.** Ken approved all three proposed articles for today and asked that they be run
"through all of our voice skills."

**Weighed.** Sourcing per piece: shore power rests on Miami-Dade County's own program page
(terminals, $125M cost, grants, 98%-while-connected, 3-ships, ~35 seaports) with the
Getaway test-night purpose attributed to cruise media; GSC rests on NCL's own May-2026
booklet (SSOT text held in admin/sources/) for everything waterpark, with the pier
reopening deliberately marked UNVERIFIED because current reports conflict — stated as a
conflict rather than picked; the cabin guide quotes no prices or square footage at all
(they churn faster than an article should track) and anchors the balcony case in Ken's
published Quantum logbook moments rather than invented experience. Voice pipeline applied
per article: like-a-human during drafting, six-axis voice-audit self-scan and
emotional-hook-test (5/5 each) attested in the sidecars. One flagged token — "unpack" in
the shore-power piece — kept deliberately: it's the literal luggage verb, and contorting
an honest sentence to dodge a tell-list is validator-gaming in mirror form.

**Decided.** Three articles + three factcheck sidecars with voice/emotional attestations,
three index entries, and bidirectional cross-links (Getaway hub → shore power + GSC; GSC
port page → GSC article; seasickness + deck-plans → cabin guide). All three articles
carry a forward commitment the sailing week can keep: Monday night verifies shore power,
Thursday verifies the pier and lagoon pricing.

**Unsure.** Whether the GSC pier has actually reopened (the article says so plainly), and
whether the Great Life Lagoon is truly included — the booklet's silence is a signal, not
a promise; both are on the Thursday checklist.

---

## 2026-08-22 — Getaway article: booked-on-it confirmed + cross-link pass (syl)

**Asked.** Ken confirmed he is booked on the Aug 24 Getaway sailing and "will write about
the experience Daily," and asked to "cross link everything you can."

**Weighed.** The booked claim was deliberately withheld in the first pass because he hadn't
stated it; his confirmation makes it attested fact, so the dek and Who This Is For now say
it plainly — while keeping all aboard-ship experience future tense, since nothing has been
lived yet. For cross-links, every candidate surface was surveyed for a real slot rather than
bolted on: ship page (Plan Your Cruise), Nassau + Great Stirrup Cay port pages (plan-visit
lists), and the three sibling articles' Related-reading lists (Nassau brawls, itinerary
changes, Caribbean Princess power loss). Ship and Nassau validators were already failing
pre-edit (nav gold-standard drift; missing food/credits sections) — baselines captured
first so my single-list-item edits can be proven regression-free.

**Decided.** Eight surfaces updated bidirectionally; index excerpt notes the daily
dispatches; sidecar authorship_note updated with the operator's confirmation and the full
cross-link inventory. The ninth — the ship page's Plan Your Cruise link — was written,
then REVERTED and deferred: the ship-page regression guard blocks any commit touching that
file on a pre-existing js:navigation/missing_nav_items failure, and measurement showed the
validator's "gold standard" expects the deprecated flat paths (/ports.html,
/cruise-lines.html) that the page and every current article correctly avoid. The stale
side is the validator, so neither the nav nor the guard was touched; the fix (update the
gold standard + refresh audit-reports/ship-validation-dashboard.json, then add the link)
is registered in the HLS instead of bypassed with --no-verify.

**Unsure.** Where the daily dispatches will live (one logbook page vs. one article per day)
— structure decision deferred until Ken files the first one.

---

## 2026-08-22 — Norwegian Getaway Aug 24 change letter → news article (syl)

**Asked.** Ken forwarded three screenshots of NCL's guest notification for the August 24
Getaway sailing (Nassau overnight for repairs, GSC extended to 8 p.m.) and asked for a new
article in house voice — "an opportunity to see how NCL handles different things."

**Weighed.** Whether to treat the letter alone as sufficient sourcing (no — it never names
the failed system), whether to claim Ken is booked on the sailing (no — he didn't say so;
the dek says the letter "landed in my inbox," which is verifiably true either way), and
which register to use (the calm-authority news template per memory 2b89a833, mirroring
caribbean-cruise-trends-2026). Corroborated via Cruise Hive: propulsion component, the
July 31 precedent sailing, reduced speed, casino/retail closures alongside, and the
separate shore-power reason for the Miami 3 a.m. departure. Household memory b4e7d905
supplied the GSC waterpark September opening — the honest caveat on the extended island day.
HLS preflight run as patron syl; task registered; open-PR check was UNAVAILABLE (no gh) so
open PRs were checked by hand via GitHub MCP — none touch this surface.

**Decided.** Standalone news article (norwegian-getaway-nassau-repairs-overnight-2026) with
the original-vs-revised table, the three-weeks-of-repairs pattern, a fair scorecard on
NCL's handling (advance notice + both ports kept, but the system unnamed and the constraint
dressed as a gift), practical aboard notes, and no affiliate links. NCL's marketing line is
quoted once, attributed, and analyzed — not adopted as voice.

**Unsure.** Whether Ken is aboard this sailing (article deliberately doesn't claim it — one
line to add if he confirms), and whether the repairs will finish in the Nassau window; the
article says the schedule is "written in pencil" rather than promising.

---

## 2026-08-21 — Getaway pack + multi-voyage family PWA (one session, three deliverables)

**Asked** — Build a voyage pack for the operator's NCL Getaway booking (Aug 24–28, sails in
three days), then carry it into the family PWA and the Jerusha PWA; then, per follow-ups:
keep the Alaska week archived rather than replaced, and add the family's World America
December sailing as an upcoming voyage.

**Weighed** — (1) Pack facts: four parallel web-research passes vs. reusing sibling-pack
content — chose research; copy-propagation is a named confabulation mode, and it would have
shipped a waterpark that doesn't open until Sept 4 (eight days after the visit) and a
"Mahogany Bay" Roatán that MSC doesn't use. The lead's own draft then got a self-audit,
which caught six unverified claims it had introduced (staircase steps, Watling's 1789, GSC
1986-vs-1977, christening date, deck count, laundry) — all re-verified or softened before
the sidecar was written. (2) Family PWA shape: single-voyage swap vs. lifecycle model —
first shipped the swap, operator corrected course (rightly), so rebuilt as a VOYAGES array
where state derives from today's date: future → current → past, active voyage computed, the
rest rendered as collapsed cards. Alaska restored verbatim from git history, nothing
retyped. (3) World America Dec: operator's booking cards said Dec 5–13; schedule research
says the sailing is Dec 5–12 (7 nights, no 8-night option that week) — trusted the two
agreeing primary schedule sources plus the cards' own Dec 12 arrival over the remembered
end date. (4) Jerusha: the payload is zero-knowledge encrypted; refused to guess until the
operator supplied the passphrase in-session; decrypted, extraction only, edits deferred per
instruction.

**Decided** — v0.1.18 pack shipped (gate green, PDF built, times cross-confirmed against
the booking screenshot); build-script staleness bug fixed (inner mtime check was overriding
the clone-stable logic — it had skipped three genuinely stale PDFs while rebuilding four
current ones); family PWA is now multi-voyage with Getaway active, World America Dec 5–12
upcoming (December normals sourced, Ocean Cay labeled as Nassau-proxy), Alaska archived;
the World America hosted-sailing shell also got the July audit's Coxen Hole / April-2025
corrections it had missed.

**Unsure** — GSC pier reopening is "two independent Aug-4 reports," not an NCL press
release — the pack hedges with a tender fallback. Port times for the December sailing
differ between aggregator listings; the booking's own times were used and the page says to
confirm in the MSC app. December Roatán rainfall figures conflict wildly across weather
sites (1 mm to 399 mm); the page states "rainy season, expect showers" and declines a
number.

## 2026-08-21 — MSC World America Dec 5, 2026 sailing: fact-verification pass (web-only, no memory)

**Asked.** Verify the MSC World America sailing "Dec 5th–13, 2026" for a voyage pack: exact
dates/nights, day-by-day itinerary with times, dock-vs-tender per port, ship quick facts,
and December weather normals per port. Hard rule: every fact from a page fetched this
session; nothing from training memory.

**Weighed.** Aggregator schedule sites disagree on details, so each class of fact needed
two independent fetched sources where possible. cruisetimetables.com rate-limited WebFetch
(429) — fetched raw HTML via curl instead and parsed it directly, which yielded the full
timetable text verbatim rather than a summarizer's paraphrase. MSC's own site is JS-heavy
and returned no itinerary data; press releases and PortMiami's official terminal page
filled the terminal/ship-fact gaps.

**Decided.** The sailing is Dec 5–12, 2026 (7 nights), not Dec 5–13 — no 8-night departure
exists in the Dec 4–7 window; reported that correction explicitly. Itinerary taken from
cruisetimetables (times) cross-checked against iCruise (ports/dates). Dock-vs-tender from
CruiseMapper port pages + cruisehive. Ship GT reported as 216,638 (Cruise Hive +
CruiseBooking) with CruiseMapper's 215,863 flagged as a conflict (matches World Europa's
GT — likely their error, but flagged, not silently dropped). Weather from currentresults
(Miami, Nassau), weather2travel (Roatan), holiday-weather (Cozumel), with bad datapoints
(holiday-weather's "1 mm December rain" for Roatan) called out rather than averaged away.

**Unsure.** Port times are aggregator-listed, not MSC-confirmed; cruisetimetables itself
shows Ocean Cay 0800–2000 on the 7-night listing but 0700–1800 on the overlapping 14-night
listing for the same class of call. One search summary showed a 16:30 Miami departure vs
cruisetimetables' 17:00. Ocean Cay December normals proxied from Nassau (nearest published
climate station) — stated as a proxy. MSC's Cozumel pier varies (Punta Langosta or
International Pier); reported as such, not pinned.

---

## 2026-08-12 — the guard was shipping a detector it could not find (P0, measured)

**Asked.** Continue the merge campaign into this repo. Two of the six branches carrying
unapplied work both touched the same P0 surface — the dangerous-command detector and its
guard hook — so they needed deciding together rather than one at a time.

**Weighed.** The obvious reading was "two lanes fixed the same thing, pick the better one."
Measuring first said otherwise: the detector in this repo is **byte-identical** to
`origin/main` (2,093 lines, zero diff). Nothing to choose. The whole change is 38 lines in
the guard *hook*, and it is about **resolution**, not detection.

The hook looked for the detector at exactly one path, `../../cluster/lib/dangerous-command.mjs`.
This repo has no `cluster/` directory — the onboarding installer copies the detector to
`.claude/hooks/lib/` instead. So the import threw, the `catch` block engaged, and the guard
ran on six inline regexes while the real 2,093-line detector sat unread beside it. A guard
that fails to a weaker guard reports nothing; it just quietly gets worse.

**Decided.** Took the merge, then measured what it buys instead of asserting it. Re-running
the fix's own battery against the fix would only measure agreement, so I ran **one probe set
against both states** — main's inline fallback and the merged detector — with every payload
an inert string handed to a scanner, never a shell.

Result: **4 of 16 catastrophic shapes are ALLOWED on main in this repo** — `rm -rf /*`, the
var-rooted `rm -rf /$X/*`, and `rm -rf /` nested in both `$()` and backticks. All four block
after the merge. I also checked the other direction, because over-blocking is a real failure
and not a safe one: six ordinary commands (`rm -rf ./dist`, `rm -rf node_modules`, a grep whose
*text* contains `rm -rf /`) stay allowed. Verified on `.blocked`, not `.dangerous` — a shape
can be flagged dangerous and still pass.

**Unsure.** This closes the gap in *this* repo only. The same shape — guard installed by the
onboarder into a repo with no `cluster/` — is a property of the installer, so any other repo
onboarded the same way is a candidate for the identical hole, and I have not swept for that
here. The fallback is also still a fallback: if both candidate paths fail the guard drops to
six patterns again rather than refusing, which is a deliberate fail-open I did not change
mid-merge but do not think is right for a safety boundary.

_Runtime: Claude Code_

## 2026-08-11 — merge every unmerged branch into main (superset where possible)

**Asked.** Ken: go repo by repo, branch by branch, merge everything unmerged into main;
prefer a superset where possible, and where not, the best-coded version. This repo was the
third of four.

**Weighed.** `git branch --no-merged` listed ~110 branches here, which would have been a
month of merging. That count is a lie of a specific kind: a squash-merged branch is reported
as unmerged forever, because its commits never appear upstream by SHA. Measuring
patch-equivalence with `git cherry` instead showed only **6** branches carry any unapplied
commit; every other branch is already absorbed. I merged the 6 and left the rest, rather
than merging ~110 branches to reach the same tree.

Local `main` also held one commit of Ken's own, unpushed for two weeks — a 365-line ship-facts
remediation script plus 258 edited ship pages. `git cherry` confirmed it is genuinely absent
upstream, so dropping it was not an option. But origin/main had moved 62 commits since,
including the SSOT cruise-line fixes (#2500–#2505) that touch the very blocks this commit
rewrites. An old commit merged onto a corrected base wins wherever the two touched different
lines — no conflict, no marker, and the newer fix silently disappears.

**Decided.** I merged it, then hunted the revert rather than trusting the clean merge. Reading
the diff would not have worked: a unified diff renders a MOVED line as a deletion, and the raw
count was 155 "lost" lines across 258 files. Comparing **occurrence counts** per file instead —
position-blind, and with whitespace normalised, because the remediation script re-indents the
key-facts block — cut that to 3, of which exactly one was content.

That one was real. `ships/rcl/discovery-class-ship-tbn.html` said, on main, that gross tonnage
and capacity "have not been published yet". The generated template overwrote it with "entered
service in TBD, measures TBD gross tons" — asserting that a ship still on order entered service,
and printing literal TBD into prose a reader sees. Honest uncertainty replaced by a fabricated
placeholder. I restored main's sentence and kept the merge's added Key Facts rows: the superset
is the newer prose *and* the new rows, not a choice between them.

**Unsure.** Two `<ul>` tags still register as lost; both are markup restyled in place and I
verified every `<li>` inside them survives, but that is an eyeball on two lines rather than a
measurement. I did **not** touch six other ship pages that already carry TBD in the same prose
slot on main — pre-existing, and widening a merge to fix content is how a merge stops being
reviewable. They are worth a ledger row.

Also measured and left alone: `.githooks/pre-commit` exits **0** on this machine while eleven of
its own checks error out (`mapfile` is bash 4+; macOS ships 3.2). Every gate it advertises —
ship-lock, regression diff, image reuse, voyage-pack PDF staleness, factcheck — is armed and
silently skipped. Pre-existing on main and not caused by any merge here, but a guard that
reports success while validating nothing is the false-CALM this household forbids, and it
should not stay quiet.

_Runtime: Claude Code_

## 2026-08-11 — rysn: household sync of soli-deo-gloria (a link that resolved in only one repo)

**Asked.** Propagate the canonical `soli-deo-gloria` change made in the household SSOT. This repo's
copy was one of sixteen behind it.

**Weighed.** The change is one line: a sibling-relative link, `../destructive-command-safety/SKILL.md`,
replaced with the household-qualified path `open-claw-stuff/skills/destructive-command-safety/SKILL.md`.
That matters precisely because this skill is synced byte-identical into every repo — a relative link
resolves in `open-claw-stuff` and is dead everywhere else, including here. So the copy that read
correctly in one place was silently broken in fifteen others, on a P0 posture skill pointing at the
destructive-command doctrine.

I did not author this fix; a sibling did, and I verified it before propagating rather than trusting
it: the target exists, and the failure it describes is the same one I had just committed myself in
`careful-not-clever` (repo-relative `docs/...` paths that resolve only in the SSOT). Their reasoning
is right and mine had been wrong in the same way.

**Decided.** Sync it here, byte-identical to canonical, and commit — a sync written into a working
tree and never committed is how the household's manifest came to assert "in sync" for four months
about files that never existed on any main branch.

**Unsure.** Nothing about this change. The uncertainty is upstream and recorded there: whether
household-qualified paths should be the standing convention for every synced skill, or whether
synced skills should stop citing cross-repo paths at all.

## 2026-08-10 — The reasoning guard here was bypassable; fixed (UL-210)

**Asked.** Operator: "Proceed as recommended." The named item was propagating the UL-210 fix to
the leaves still carrying the broken reasoning-log guard. This repo is one of five that had it.

**Weighed.** The guard ran from `pre-commit` and read its `[no-reasoning]` opt-out from
`.git/COMMIT_EDITMSG`. That file is stale there: for `git commit -m`, git writes it only *after*
pre-commit succeeds, so the guard read the PREVIOUS commit's message. Measured live in
open-claw-stuff, both directions — a commit carrying the marker was BLOCKED, and worse, after a
commit whose message contained the marker had landed, the NEXT substantive commit carrying no
marker was silently ALLOWED. A false pass on the layer the doctrine calls runtime-independent.

I considered re-running the behavioural probes here to confirm. I did not: proving it a second
time needs a commit that must then be undone, and that same cleanup pattern destroyed real work
twice earlier in the session. The copied files are byte-identical to the canonical ones already
verified, which is the same evidence without the risk.

**Decided.** The guard moved to `.githooks/commit-msg`, the only hook git hands the real message
(as `$1`); the opt-out reads `$1` and nothing else, and without it the opt-out is simply
unavailable so the guard blocks — failing toward enforcement. The legacy call was stripped from
`.githooks/pre-commit`, which keeps its other checks. Installed by
`open-claw-stuff/admin/install-reasoning-log.mjs`, which now strips that call rather than adding
it, so re-running repairs a repo instead of double-wiring it.

**Unsure.** `core.hooksPath` is armed in this clone, but that setting lives in `.git/config` and no
clone carries it (UL-189) — so these hooks are live here and inert in a fresh checkout. The fix to
the *files* is durable; the arming is not. Tracked as `githooks-path-not-durable`.

## 2026-08-08 — Sophos now injects itself here, every session and every prompt

**Asked.** Operator directive (Ken, 2026-08-08): "Sophos should be injected in like manner in
every repo also." A cross-repo audit had found that InTheWake alone injected posture per-prompt,
and that nothing anywhere loaded Sophos itself per-turn.

**Weighed.** Two candidate models for "in like manner". InTheWake's `session-start-guardrail.sh`
prompted the finding, but it `cat`s whole files into context on every prompt — right instinct,
expensive mechanism. This household's own `reasoning-log-inject.sh` had already solved that with
a two-mode shape: a full block once at SessionStart, ONE line per turn. I reused the second
rather than inventing a third. Layer 0 is resolved at run time and the hook names which candidate
won, rather than baking a path — hard-coding one authoring machine's layout is UL-173, which this
household has already paid for once.

**Decided.** `.claude/hooks/sophos-inject.sh` is installed and wired in this repo at SessionStart
(five layers, hierarchy, publish gate, recall command) and UserPromptSubmit (one terse line), by
`open-claw-stuff/admin/install-sophos-inject.mjs`. `core.hooksPath` was deliberately left unset
here: the operator declined it separately, and arming it would be deciding for him.

**Unsure.** Injection guarantees the posture is *present*; it can never guarantee it is *held* —
this is suspenders, the belt is the bootstrap and dangerous-command guards. And in the same audit
I recommended installing the P0 dangerous-command guard into this repo, which was wrong: it is
already live via the user-level path, and that is the false-ABSENT error UL-203 had already
recorded. Nothing was installed on that premise.


## 2026-08-08 — UL-173 pointer read order deployed to this leaf (Claude)

**Asked** — Ken said "proceed" and chose "sweep the 9 remaining leaves": deploy the UL-173
fix — a mandatory Layer 0 read order must not point at a path that exists on one machine
only — into the nine household repos that were not attached to the session where the five
recipe repos were fixed. This repo is one of them.

**Weighed** — Three resolution knobs had to be set deliberately, not by default.
(1) `HOUSEHOLD_OCS_ROOT` was left **unset**. It pins the path baked into the emitted text
as resolution candidate 3, and the five already-finished repos carry
`/workspace/open-claw-stuff`; setting it would have made this leaf disagree with them for
no gain. (2) `HOUSEHOLD_REPO_ROOT=/home/user` was required: `REPO_PATHS` is baked for
Ken's Mac and the sibling-of-clone fallback also misses here, because the SSOT clone sits
in `/workspace` while the leaves sit in `/home/user` — the exact layout UL-201 added that
knob for. Without it the generator SKIPs every leaf and reports MISSING-PATH. (3) Each
clone had to be given a directory name matching its `REPO_PATHS` key exactly:
`resolveRepoRoot` joins the root with the key, Linux is case-sensitive, and GitHub hands
back lowercased repo names (`ordinarybook`, `inthewake`, `archive`), so cloning to the
name GitHub returns would have silently missed the mapping.

Verification was the same standard the Allrecipes PR carries: `/Users/kenbaker` references
30 → 0 across `CLAUDE.md`, `AGENT.md` and `admin/LIBRARY.md`; `--check` reports `ok` for
this repo; a second render is byte-identical; and the `## ` section list is unchanged
against `git show HEAD:<file>` rather than against a snapshot taken after the first render,
which would have been a false pass.

**Decided** — Rendered this leaf and shipped it. The sweep was NOT shipped whole: one of
the nine, `From-Timothy-at-Tyrannus`, was held back and reverted untouched. Its `CLAUDE.md`
carried the P0 heading twice — one stamped `v2`, one older and unstamped — and the
unstamped copy held doctrine the generator does not emit: the whole Memory-discipline
paragraph (`memory_ops.py recall`, the Slice 6 observation hook, the Slice 8 quarantine
gate, `ken/keeper/`) and the constitution paragraph ending "Silent violation is the worst
possible outcome." Regenerating would have deleted both silently, so it was reverted and
referred to Ken rather than fixed by guesswork — where that doctrine belongs (folded into
the generator for every leaf, or kept repo-local) is an operator call, not mine.

**Unsure** — Two honest limits. First, the heading-level check that is supposed to catch
this is structurally weaker than it looks: `mergePreserving` compares heading TEXT, so
hand-authored content sitting *under a heading the generator also emits* is invisible to
it. It was caught here only by luck, because that heading happened to be duplicated; one
heading with extra prose inside would have passed silently and destroyed the content. A
content-level diff was then run across all nine leaves, and everywhere except
`From-Timothy-at-Tyrannus` the only line that differs is the superseded `v2` stamp — but
that check ran because a fluke tripped it, not because the process demanded it. Second,
the pre-commit guards did not run: `core.hooksPath` is unset in these fresh clones, so
`.githooks/reasoning-log-guard.sh` is present but inert. This entry exists because it was
written, not because anything verified it. Arming that hook remains an open operator call
and was deliberately not done.

## 2026-07-30 — Reasoning log installed here (four layers, every runtime)

**Asked.** Ken asked for the reasoning log to be stronger and to cover all 16 household
repositories, capturing reasoning from any agent — Claude, Grok, Codex, the pipeline.

**Weighed.** The earlier version reached only Claude Code (SessionStart + Stop hooks), and
injected once per session, so it could drift. The gap that mattered: every other runtime —
Grok, Codex, a script, a person — was uncovered. What they all share is `git commit`, so
enforcement belongs there.

**Decided.** Installed from the household canonical kit (`open-claw-stuff`,
`admin/install-reasoning-log.mjs`): per-turn injection (`UserPromptSubmit`, not just
session start), Stop-time persistence of this file, and a pre-commit guard that BLOCKS a
substantive commit with no entry dated today. The installer also ran
`git config core.hooksPath .githooks` — without it every `.githooks` guard here was
silently inert. `[no-reasoning]` in a commit message opts a trivial change out, reviewably.

**Unsure.** The hooks guarantee the obligation is present and that what was written
survives; the guard makes omission block a commit. None of them can make an agent write a
*truthful* entry — read the log rather than trusting the machinery. Pipeline auto-capture
exists only in `open-claw-stuff`, where Atlas lives; this repo has the other three layers.

_Runtime: Claude Code_


