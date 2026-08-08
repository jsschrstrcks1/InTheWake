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

_Runtime: claude-opus-5 (Claude Code)_


