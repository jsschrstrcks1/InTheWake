---
name: adversarial-review
type: review
enforcement: invocable
priority: high
description: |
  Sends a commit range (default: origin/main..HEAD) to an external LLM
  with the framing "find every little thing wrong as though you're trying
  to take the engineer's job." Returns a structured findings report under
  audit-reports/. Designed as the external-audit backstop named in
  careful-not-clever v1.8.1-alpha §"The limit of this rule" — the rule
  acknowledges that an author cannot reliably catch their own claim-
  evidence gaps, and points at an external pass as the real check.
activates_on:
  slash_commands:
    - "/adversarial-review"
    - "/adversarial-review <base-ref>"
    - "/adversarial-review <base-ref> <model>"
  keywords:
    - "external audit"
    - "adversarial review"
    - "send to grok"
    - "second opinion"
    - "review my commits"
    - "audit this branch"
  intent_patterns:
    - "ask <model> to review"
    - "external pass"
    - "second pair of eyes"
implementation: admin/external-audit.sh
---

# Adversarial Review

## Why this skill exists

Careful-not-clever v1.8.1-alpha §"The limit of this rule" acknowledges that the claim-evidence table is a forcing function, not a guarantee. Two failure modes survive even with the table in place:

- **Misuse mode A — Vague evidence:** "tests pass" / "verified" with no specific artifact
- **Misuse mode B — Narrow claim:** the claim is technically supported but is narrower than the actual scope of the change

Mode A a careful reviewer can spot. Mode B is harder for the author to see than vague evidence, because the entry passes their own self-review (the evidence really does support what they wrote). The rule says: *"The most reliable check is external."*

This skill is that external check, automated. It is a triage aid, not a gate.

## When to invoke

| Situation | Invoke |
|---|---|
| Before a PR / merge to main on any Layer 2 or Layer 3 change | YES |
| After completing a multi-commit batch where you suspect blind spots | YES |
| Before declaring a long-running thread "complete" | YES |
| Routine refactor with full test coverage | OPTIONAL |
| Trivial typo fix | NO (wasteful) |

Cost per invocation (Grok): roughly `$0.04` for a 9-commit batch (in=5555, out=1768 tokens at grok-3 pricing). Smaller ranges cost proportionally less.

## How to invoke

### Slash command

```
/adversarial-review                 # audits origin/main..HEAD with grok
/adversarial-review HEAD~3          # audits the last 3 commits with grok
/adversarial-review origin/main gemini  # different reviewer
```

### Direct script

```bash
admin/external-audit.sh                       # origin/main..HEAD, grok
admin/external-audit.sh HEAD~5 grok           # last 5 commits, grok
admin/external-audit.sh origin/main gpt       # alternate model
```

### From inside Claude Code

Tell Claude:

> "Send the current branch to Grok for adversarial review."

Claude reads this skill, runs `admin/external-audit.sh`, surfaces the report. Per the anomaly-disposition rule in careful-not-clever, Claude must then either:
1. Fix each non-trivial finding before next commit, OR
2. Disposition each finding explicitly (TRACKED / ACCEPTED-AS-RISK with stated reason)

"Probably manufactured" or "looks like noise" are not dispositions.

## What it does

1. Reads the canonical `Claim-Evidence Discipline` section from `.claude/skills/careful-not-clever/CAREFUL.md` verbatim
2. Collects every commit in the requested range (subject + body)
3. Constructs the adversarial prompt — explicit charter, evaluation criteria, output format, and the rule the reviewer should apply
4. Pipes to `/home/user/ken/orchestrator/consult.py <model> challenge` (the household orchestrator's adversarial single-model role)
5. Writes a timestamped report to `audit-reports/external-audit-<timestamp>-<model>.md`
6. Returns the path. Does **not** parse findings or block anything. The human reading the report decides.

## What it specifically asks the reviewer for

The prompt's "Adversarial Charter" section tells the reviewer:

- Cite the exact file and line range (or commit SHA, or command output)
- State the claim that overstates the evidence
- Identify what evidence would actually support the claim
- Rate severity: BLOCKING / HIGH / MEDIUM / LOW
- Find at least one issue per commit; only say "Pass" if you can find nothing after trying hard

And what the reviewer may not do:

- Defer to the engineer's reasoning
- Soften findings for collegiality
- Praise the work (review only the gaps)
- Manufacture problems without artifacts
- Repeat criticisms the engineer already self-surfaced in commit messages

The framing pretends the reviewer is interviewing for the engineer's job. That framing turns "find a flaw" into self-interest.

## Integration with /orchestra and /orchestrate

`adversarial-review` uses the same orchestrator that powers `/consult`, `/orchestrate`, and `/orchestra`. Specifically, it invokes `consult.py <model> challenge`. The skill is therefore *part of orchestra* in the practical sense — same adapters, same .env, same credentials, same cost-tracking.

Future integration paths (not yet implemented):

- **A dedicated mode** at `ken/orchestrator/modes/adversarial-review.yaml` that the `/orchestrate` pipeline can step into as a final phase before merge.
- **Inclusion in the orchestra fan-out phase** — when multiple models are asked to weigh in on a change, one of them can be invoked specifically with the adversarial charter.
- **Multi-model adversarial sweep** — run the audit against 3 models (grok + gpt + gemini), aggregate, and report the union of findings. The most damaging findings tend to be unique to specific models' biases.

The current implementation is single-model so the cost stays predictable and the report stays one document.

## Guardrails on this skill itself

This skill is **invocable**, not auto-triggered. Why:

1. **Cost.** Every invocation hits a paid API.
2. **Quality requires the right moment.** Adversarial review of a one-line typo fix is theater; review of a multi-commit guardrail change is essential. Humans (or Claude, knowing the context) judge when it's worth running.
3. **Auto-gating would itself be a clever-not-careful move.** A skill that says "you cannot merge until the model says it's safe" gives false confidence — the model will sometimes pass things it should fail, and sometimes block things that are fine. The discipline says: the human reads the report and decides.

The skill does NOT:
- Block commits or merges
- Auto-fix findings
- Modify the working tree
- Forward the engineer's draft prompt to the reviewer (the prompt is built from the canonical template + git data; the engineer cannot soften the framing for their own benefit)

The last point is the trust boundary. If the engineer could supply their own prompt text, "external review" would become an exercise in prompt-engineering for a clean bill of health. The script builds the prompt from a fixed template; the engineer's only inputs are the commit range and the model.

## Worked example

The first invocation against this branch (commit range `bb089d2d..942b1703`, 9 commits) produced 6 findings:

- 2 genuinely new gaps the engineer had not self-surfaced (FOM allowlist negative fixtures; narrow-claim failure vector in v1.8-alpha)
- 1 partially new (arbitrary 2s wait in regression test)
- 2 partially valid (tracking-only items)
- 1 low-severity accepted

Cost: `$0.0432`. Full disposition log: `audit-reports/external-audit-2026-05-13-dispositions.md`.

The skill caught me being clever in the very commit that codified the rule (Mode B narrow claim in `2f772b01`'s self-check table). That is the rule working as intended.

## See also

- `.claude/skills/careful-not-clever/CAREFUL.md` v1.8.1-alpha — the rule this skill backs
- `admin/external-audit.sh` — the implementation
- `/home/user/ken/orchestrator/consult.py` — the household orchestrator's adversarial-role entry point
- `audit-reports/external-audit-*.md` — past reports (timestamped, model-tagged)

---

*Soli Deo Gloria.*
