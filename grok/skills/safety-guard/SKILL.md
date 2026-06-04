---
name: safety-guard
description: Prevents destructive, high-risk, or integrity-violating operations on the InTheWake project. Grok-native version emphasizing explicit confirmation, reversible-by-default patterns, and refusal of "just this once" rationalizations.
priority: HIGH
activation: before any destructive file operation, force push, branch deletion, validator bypass, or large-scale rewrite
---

# Safety Guard (Grok Native)

**Purpose:** Make it structurally difficult to cause unrecoverable or high-regret damage while working on this repository.

This project has real readers making real decisions with limited budgets and emotional bandwidth. A destructive mistake here is not just technical debt — it can affect people who are already tired or grieving.

## Core Posture

- Prefer reversible operations by default.
- Require explicit, logged human-level confirmation for irreversible actions.
- Treat "I meant to do that on a different branch" and "I didn't realize it would affect X" as process failures, not surprises.
- Never bypass the validator chain, pre-commit hooks, or careful-not-clever discipline "just to get something through."

## When This Skill Activates (Non-Exhaustive)

- `git push --force`, `git reset --hard`, `git clean -fd`
- Deletion of branches that have open PRs or audit history
- Large-scale find-and-replace across many files without prior scoped plan
- Manual edits to generated files that should go through generators
- Attempts to "temporarily" disable hooks, validators, or linters
- Operations on the live production domain or Cloudflare Pages configuration
- Bulk image replacement or attribution changes (see the ongoing Flickr P0)
- Any command that could affect the sitemap, service worker precache, or critical PWA artifacts

## Grok-Specific Refusal Patterns

When a proposed tool call matches a high-risk pattern:

1. State the risk clearly.
2. Ask whether a safer alternative exists (worktree, new branch, narrower glob, staged commit first).
3. If the user still directs the risky action, require an explicit "I accept the risk because..." statement in the record before proceeding.
4. Log the decision in the current todo or session memory.

Grok has powerful terminal and file tools. This power must be paired with heightened caution on a project this sensitive.

## Relationship to Careful-Not-Clever

Safety-guard is a specialized application of careful-not-clever to the domain of irreversible actions. The same claim-evidence, scope, and anomaly-disposition rules apply. "It worked on my machine" or "I double-checked the path" is not sufficient evidence when the downside is loss of audit history or production breakage.

## Pastoral Overlay

Some of the most destructive mistakes on projects like this are not the ones that crash the build. They are the quiet ones: removing a grief story's emotional pivot because it "felt negative," flattening a disabled traveler's practical concern into inspirational language, or deleting an image attribution because "we can re-source it later."

Safety-guard also covers the heart. When the proposed change touches logbook entries, grief content, disability narratives, or memorial material, the pastoral guardrails (`admin/claude/PASTORAL_GUARDRAILS.md`) take precedence over technical neatness. Stop and re-read them.

---

**Soli Deo Gloria.**

When in doubt, make it reversible or ask. There is no shame in being slower here. There is shame in being the agent who created unrecoverable damage for the sake of momentum.