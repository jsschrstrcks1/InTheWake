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

## 2026-08-13 — Wire arm-hooks-path.sh so the git-side guards stop being dead-in-git (Claude)

**Asked** — Operator "go" on hookspath-arming parity. `git clone` never sets
`core.hooksPath`, so this repo's `.githooks` chain was wired in the repo and DEAD in git —
the pre-commit guards simply never ran (measured, UL-226/229).

**Weighed** — `core.hooksPath` is per-checkout local config; it cannot be committed or
pushed, so the durable fix is the SessionStart hook that arms it automatically each session.
The hook is fail-open by design: it arms ONLY when `.githooks/pre-commit` exists AND
hooksPath is unset, and never overrides an operator-set path. Confirmed the pre-commit chain
it activates here is benign (local required-hooks / reasoning-log checks — no network, no
fail-closed step), so arming cannot break commits.

**Decided** — Installed `.claude/hooks/arm-hooks-path.sh` (byte-identical to SSOT) and wired
it as the FIRST SessionStart hook. Verified the mechanism live: in a repo WITH `.githooks` it
arms and announces; in a repo WITHOUT it stays silent and unset. Did not arm this ephemeral
container — the committed hook is the deliverable; real future sessions arm their own checkout.

**Unsure** — This makes the guards live from the next session's first commit onward, not
retroactively. ken additionally carries a fail-closed privacy-attestation on pre-push, so
arming it means pushes require attestation (self-heals via the documented stamp flow, but adds
friction) — noted deliberately. Four repos still lack a `.githooks` chain to arm (From-Timothy,
Ordinarybook, Project-Sophos, ken-recipes-site); seeding those is a separate deliberate pass,
not a blind copy — `check-required-hooks.sh` carries a per-repo PROTECTED list.

---


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


