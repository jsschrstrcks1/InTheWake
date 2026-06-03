---
name: verification-before-completion
description: Iron law enforcement. No claim of completion, fix, pass, or success is permitted without fresh, specific, citable verification evidence produced in the current session. Grok-native adaptation with emphasis on tool transparency, subagent verification, and todo discipline.
priority: CRITICAL
activation: before any completion claim, satisfaction language, commit, or task closure
---

# Verification Before Completion (Grok Native)

**Core principle:** Evidence before assertions, always.

Claiming work is complete, fixed, verified, or "good" without fresh verification is not efficiency — it is a form of dishonesty that this project explicitly rejects.

This is the tactical companion to `careful-not-clever`. Where careful-not-clever governs the overall posture, this skill governs the exact moment before any success language is uttered.

## The Iron Law

```
NO COMPLETION CLAIMS, SATISFACTION LANGUAGE, OR "DONE" STATEMENTS
WITHOUT FRESH, SPECIFIC, CITABLE VERIFICATION EVIDENCE
PRODUCED IN THIS SESSION AND READ BY YOU
```

If you have not run (or retrieved and read the full output of) the verification command **in the current thinking trace**, you cannot make the claim.

## The Gate Function (Mandatory Sequence)

Before any of the following phrases or their semantic equivalents:

- "done", "fixed", "passes", "verified", "no regression", "should be good", "looks correct", "complete"
- Any positive assessment of the work state
- Moving to the next task or closing a todo item

Execute this sequence:

1. **IDENTIFY** — What exact command, test, subagent run, or inspection would constitute proof of this claim?
2. **RUN / RETRIEVE** — Execute it fresh (or fetch the complete raw output if backgrounded). Do not rely on previous session memory.
3. **READ** — Consume the full output. Check exit codes, counts, error messages, and edge cases.
4. **VERIFY** — Does the actual output confirm the precise claim being made?
   - If no: State the actual observed status with the evidence.
   - If yes: State the claim **together with** the specific evidence citation.
5. **ONLY THEN** make the claim or close the todo.

Skipping any step is a violation.

## Grok-Specific Patterns

### Tool Transparency
Grok's tool calls return explicit output. This is an advantage. Treat every `run_terminal_command`, `read_file`, `get_command_or_subagent_output`, and subagent transcript as potential verification evidence — but only after you have actually read the content.

### Subagent Verification
When delegating verification to a subagent:
- Spawn the subagent with a narrow, verifiable charter.
- After it completes, use `get_command_or_subagent_output` (or equivalent) and read the raw transcript.
- Do not accept "the subagent says it passes" as evidence. The transcript is the evidence.

### Todo State as Claim
Marking a todo item "completed" is a completion claim. The same gate applies. Before flipping the status, produce and cite the verification that justifies it.

### Background and Long-Running Commands
If a verification command was run with `background: true`, you must later call `get_command_or_subagent_output` with `block` or sufficient polling and read the complete final output before using it as evidence. "It was still running when I claimed success" is not acceptable.

## Common Failure Modes (Grok Context)

| Claim | Required Evidence | Insufficient |
|-------|-------------------|--------------|
| "All tests pass" | Full test command output showing 0 failures + exit 0 | Previous run, "the relevant ones passed", subagent summary without raw log |
| "Linter clean" | Linter command output with 0 errors on the changed files | Partial path, "no new errors", visual inspection |
| "Build succeeds" | Build command exit 0 + relevant artifact presence | "It compiled locally last time" |
| "No regression on ships" | Explicit command that checked the surface + sample or full output | "I spot-checked 3 and they looked fine" |
| "Subagent verified" | Raw subagent transcript + your review of it | "The subagent reported success" |
| "Todo complete" | The verification artifact cited in the todo notes | The work "feels done" |

## Red Flags — Stop Immediately

- Use of "should", "probably", "seems", "looks like", "I think it's fine"
- Expressions of satisfaction ("Great!", "Perfect!", "That worked!") before verification output is read
- Desire to move on because the user is waiting or the session is long
- Trusting any agent's (including your own subagent's) success report without inspecting the artifact
- "This one is small / docs only / not customer-facing"
- Any internal narrative that the rule is being applied "in spirit"

## Rationalization Prevention

| Excuse | Required Response |
|--------|-------------------|
| "The command takes too long" | Run it anyway or narrow the claim to what you can actually verify |
| "I already know it works" | Run it anyway. Knowledge ≠ evidence |
| "The user just wants it done" | The user also wants the site to be trustworthy |
| "It's only a one-line change" | One-line changes have historically caused some of the worst regressions here |
| "Grok is good at this" | Tool transparency is an advantage, not an exemption |

## When This Skill Is Non-Negotiable

- Before any git commit or PR creation
- Before marking any todo item complete
- Before telling the user "this is ready" or "that issue is addressed"
- Before delegating further work on the assumption that the current piece is solid
- After any use of background tools, subagents, or long-running processes

---

**Soli Deo Gloria.**

This skill exists because the project has repeatedly paid the price for agents (and humans) who were sure they were right. Evidence is the only antidote.