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


