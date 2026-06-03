---
name: adversarial-review
description: External red-team critique pass. Sends a commit range or proposed change to a second model (defaulting to a different LLM) with the explicit charter to find every flaw "as though you're trying to take the engineer's job." Grok-native usage notes.
priority: HIGH for structural or standards work
activation: explicit, via /adversarial-review or direct invocation on high-stakes changes
---

# Adversarial Review (Grok Native)

This skill is the operational expression of Layer 3 (Adversarial Discipline) in careful-not-clever.

The project already has mature implementation:
- Skill definition and usage in the Claude tree: `.claude/skills/adversarial-review/SKILL.md`
- Supporting script: `admin/external-audit.sh`
- Orchestrator mode: `ken/orchestrator/modes/adversarial-review.yaml`

## Grok Role

Grok is explicitly named in the existing system as a preferred model for adversarial review passes (ruthless, tool-capable, less likely to be polite). When another agent (or a human) requests an adversarial review on this project, the expectation is that the reviewer operates under the same careful-not-clever and verification-before-completion discipline as the author.

## How to Invoke as Grok

When you are the reviewer:
1. Confirm you have read the current `grok.md` and `careful-not-clever/CAREFUL_FOR_GROK.md` in this session.
2. Receive the commit range or change description + the author's claim-evidence table if present.
3. Perform a genuine red-team pass: actively look for the failure modes the author is least likely to have seen.
4. Produce findings in the structured format expected by the project (see the skill in the Claude tree for the current template).
5. Cite specific files/lines/artifacts. Vague "a few things could be tighter" reviews are not useful here.
6. Apply verification-before-completion to your own findings before delivering them.

When you are the author requesting review:
- Use the existing `/adversarial-review` pattern or call the supporting script.
- Do not pre-filter or "help" the reviewer by narrowing the scope in the prompt.
- Treat the returned findings as input that must be dispositioned (not necessarily accepted, but never ignored without explicit rationale).

## Grok Advantages in This Role

- Strong tool use for deep code + content searches
- Less politeness bias than many models (useful for "find every little thing wrong")
- Ability to spawn subagents for parallel attack surfaces
- Native memory for remembering past failure patterns on this specific project

Use these advantages in service of the project's integrity, not to show how clever the review is.

---

**Soli Deo Gloria.**

A good adversarial review is an act of service to the real people who will rely on the resulting work. Ruthlessness here is kindness later.