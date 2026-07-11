# CLAUDE.md — Agent pointer (In the Wake)

**Soli Deo Gloria.** Pointer only — household law is not duplicated here.

**Household SSOT root:** `open-claw-stuff` at `/Users/kenbaker/ocs-work` (or `HOUSEHOLD_OCS_ROOT`).

## Read order (mandatory)

| # | Layer | Load |
|---|-------|------|
| 1 | **Soli Deo Gloria** | `{HOUSEHOLD}/skills/soli-deo-gloria/SKILL.md` |
| 2 | **Careful, not clever** | `{HOUSEHOLD}/skills/careful-not-clever/SKILL.md` |
| 3 | **Sophos OS** | `{HOUSEHOLD}/docs/SOPHOS-OPERATING-SYSTEM.md` |
| 4 | **Cognitive memory** | `ken/orchestrator/memory_ops.py`; `{HOUSEHOLD}/admin/recall-memory.mjs` |
| 5 | **Household rulebook** | `{HOUSEHOLD}/docs/HOUSEHOLD-AGENT-RULEBOOK.md` |
| 6 | **Household library** | `{HOUSEHOLD}/skills/household-library/SKILL.md` |

Replace `{HOUSEHOLD}` with `/Users/kenbaker/ocs-work` on this machine.

**Do not skip to §5–6 without §1–4.**

### User task gates (P0)

```bash
node /Users/kenbaker/ocs-work/admin/library.mjs preflight --query "<task>" --patron claude-code --merge --repo InTheWake
```

## Layer 2 — In the Wake (this repo)

| Resource | Path |
|----------|------|
| **HLS complete documentation** | `{HOUSEHOLD}/docs/HOUSEHOLD-LIBRARY.md` |
| **Pastoral guardrails (override everything)** | [`admin/claude/PASTORAL_GUARDRAILS.md`](admin/claude/PASTORAL_GUARDRAILS.md) |
| Full site guide (archived) | [`admin/REPO-AGENT-APPENDIX.md`](admin/REPO-AGENT-APPENDIX.md) |
| Skills index | [`SKILLS.md`](SKILLS.md) |
| Task shelf | [`admin/LIBRARY.md`](admin/LIBRARY.md) |
| Open work | [`admin/UNFINISHED_TASKS.md`](admin/UNFINISHED_TASKS.md) |
| Handoff | [`HANDOFF.md`](HANDOFF.md) |
| Grok pointer | [`grok.md`](grok.md) |

**Production:** `https://cruisinginthewake.com` — absolute HTTPS URLs only.