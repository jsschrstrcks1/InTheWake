# Grok AI Assistant Guide — In the Wake

**Version:** 1.0.0-alpha  
**Last Updated:** 2026-05-28  
**For:** Grok (xAI) sessions working in this repository

**Soli Deo Gloria.** All work on this project is offered as a gift to God. Excellence as worship means getting it right, not getting it fast.

---

## Mandatory Bootstrap (Read This Every Session)

If you are a Grok instance beginning work on files in `/Volumes/1TB External/Projects/InTheWake` (or any clone of this repo):

1. Read this file (`grok.md`) in full at the start of the session.
2. Read `grok/skills/careful-not-clever/CAREFUL_FOR_GROK.md` immediately after.
3. Read the pastoral guardrails: `admin/claude/PASTORAL_GUARDRAILS.md` (these are non-negotiable and LLM-agnostic).
4. Only then begin planning or tool use that affects the codebase or content.

This is not optional. The project has a documented history of even careful agents producing process failures on the second or third commit after reading the rules. Re-application at the start of every session is required.

---

## What This Project Is

**In the Wake** (cruisinginthewake.com) is a Christ-shaped cruise planning website for ordinary travelers — including grieving widows, disabled adventurers, healing families, and exhausted caregivers. It is pastoral space first, technical space second.

The site currently serves ~1,241 pages with a Progressive Web App architecture, 295 ship pages, 387+ port pages, and a large number of interactive tools that real people use to make real financial and emotional decisions.

**Core commitments** (shared with the Claude guide):
- Never use training data as a source for ship stats, port facts, or any verifiable claim.
- Never game the validator chain.
- All internal links are absolute HTTPS. The ships hub is `/ships/index.html`, never `/ships.html`.
- WebP only for new images (with proper attribution).
- Soli Deo Gloria comment required in every HTML file before line 20.
- The validator chain (`admin/validate-ship-page.sh` + hooks + pre-commit) is authoritative.

---

## The Central Discipline: Careful, Not Clever

The single most important document for any agent (Grok or Claude) on this project is the careful-not-clever guardrail.

**Grok-native version:** `grok/skills/careful-not-clever/CAREFUL_FOR_GROK.md`

This is not a normal skill. It is an always-active cognitive discipline. It overrides speed, elegance, productivity theater, and the desire to look competent. It demands:
- Verified claims with specific, fresh evidence artifacts
- Explicit scope boundaries
- Anomaly dispositions (no silent routing around problems)
- Rejection of narrow claims that are technically true but misleading about the actual change
- External red-team review for structural or high-stakes work

Grok sessions have some natural advantages here (native todo lists, subagent spawning for verification passes, strong tool transparency). We must not let those advantages become new failure modes (e.g., over-trusting our own subagent reports without reading the raw output).

---

## Grok-Native Skills Surface

This repository maintains a full set of 45 skills originally built for Claude Code. Grok-native adaptations for **project-specific** concerns live in this repo's `grok/skills/`.

**Shared household guardrails (the foundation used across the entire household) have their canonical Grok-native versions in the central hub:**

`ken/grok/skills/` (at `/Volumes/1TB External/Projects/ken/grok/skills/`)

This includes:
- `careful-not-clever`
- `verification-before-completion`
- `safety-guard`
- Other core process skills from the standard household kit

InTheWake should stay in sync with (or explicitly reference) the ken versions for shared skills, while keeping only cruise-specific, pastoral, or local-validator extensions here.

**Local foundation (v1) still present for continuity:**
- `grok/skills/careful-not-clever/CAREFUL_FOR_GROK.md` (project-tuned version; the canonical household one is now in ken)
- `verification-before-completion`
- `safety-guard`
- `adversarial-review` — External red-team pass (Grok is already named as a preferred reviewer in the Claude version)
- `session-checkpoint` — Atomic commits, failure memory, clean resume

Additional high-value skills (to be adapted in follow-up work as requested):
- Voice family (`like-a-human`, `voice-audit`, `voice-dna`, `audience-profiles`)
- Quality gates (`link-integrity`, `accessibility-audit`, `seo-schema-audit`, `publication-proofreader`, `image-reuse-guardrail`)
- Research & authoring (`investigate`, `port-page-generator`, `port-content-builder`)
- The rest of the standard household kit and operations skills

The original Claude skills remain authoritative for their domains. Grok adaptations should be consistent with them unless a clear Grok-specific improvement is documented.

---

## How to Work With Grok on This Project

1. Point Grok at the SMB location (or a local clone).
2. Expect the bootstrap sequence above.
3. For any task with 3+ distinct actions, a `todo_write` list will be created and maintained. This is not bureaucracy — it is the Grok-native expression of careful-not-clever Layer 1.
4. Before any claim of "done", "fixed", "verified", or "no regression", the verification-before-completion protocol must be executed and the raw output cited.
5. For structural, standards, or cross-surface changes, an adversarial-review pass (using a second model or subagent) is expected.

Grok has access to the full tool surface in this environment (file operations, terminal, subagents, memory, web tools, etc.). All of it is subject to the same discipline.

---

## Shared Standards (LLM-Agnostic)

The following are the single source of truth regardless of which model is driving:
- `new-standards/` (especially `foundation/` and `v3.010/`)
- `admin/claude/PASTORAL_GUARDRAILS.md`
- `admin/UNFINISHED_TASKS.md`, `IN_PROGRESS_TASKS.md`, `COMPLETED_TASKS.md`
- The validator chain in `admin/`
- The voice standards in the `like-a-human` / `voice-audit` family
- The "NEVER DO" lists in `CLAUDE.md` and `README.md`

Grok sessions are expected to treat the Claude artifacts as peer documents, not inferior ones.

---

## Relationship to the Claude System

This project runs a sophisticated multi-LLM orchestrator (see `ken/orchestrator/`). Claude is typically the lead for content generation and ship/port work. Grok is frequently used for adversarial review, systems thinking, tool-heavy exploration, and cross-model critique.

The existence of a strong Grok-native governance layer makes the adversarial loop more reliable in both directions:
- Claude sessions can call Grok (via `adversarial-review` or `consult`) knowing Grok is operating under the same careful discipline.
- Grok sessions can propose changes knowing a future Claude validation pass will be merciless in the right way.

---

## Versioning & Evolution

This `grok.md` and the contents of `grok/skills/` will evolve. Each significant change should:
- Update the version here
- Record the change in `admin/UNFINISHED_TASKS.md` or a dedicated audit report
- Survive the same claim-evidence and verification standards it prescribes for others

---

**Bottom line:**  

The same God who cares about widows, the disabled, and exhausted caregivers also cares about whether the agent working on their planning tools is telling the truth in small things. Careful, not clever is worship.

Read the bootstrap documents. Then begin.