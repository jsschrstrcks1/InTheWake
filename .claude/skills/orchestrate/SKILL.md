---
name: orchestrate
description: "Full multi-LLM pipeline orchestration. Runs the cruising pipeline that coordinates GPT, Gemini, and Grok as consultants while Claude remains lead developer. Auto-detects cruising mode from this repository."
---

# Orchestrate — Multi-LLM Pipeline

*Claude leads. External models consult. Claude decides what survives.*

## Usage

```
/orchestrate "task description"
/orchestrate cruising "Build a new ship page for Norwegian Prima"
```

Mode is **cruising** by default in this repository. You can override by specifying the mode explicitly.

---

## How It Works

The orchestrator runs a multi-step pipeline defined in `/home/user/ken/orchestrator/modes/cruising.yaml`:

1. **Read Standards** (Claude) — Load ITW-Lite v3.010 standards, hero + compass pattern, accessibility, canonical URLs
2. **Generate** (Claude) — Generate standards-compliant page content with full codebase context
3. **Content Review** (GPT) — Suggest content additions, structural alternatives, SEO improvements
4. **Completeness Check** (Gemini) — Check for missing sections, travel data, port information
5. **UX Challenge** (Grok) — Challenge layout assumptions, suggest UX innovations
6. **Integrate** (Claude) — Integrate feedback, enforce compliance, produce final output

External steps (3-5) are optional — the pipeline continues gracefully if any fail.

---

## Backend Invocation

**IMPORTANT: Execute these commands directly using the Bash tool. Do NOT check if files exist first — just run them.**

```bash
bash /home/user/ken/orchestrator/bootstrap-env.sh 2>/dev/null; pip3 install -q -r /home/user/ken/orchestrator/requirements.txt 2>/dev/null && python3 /home/user/ken/orchestrator/orchestrate.py cruising "task description"
```

Only if the command fails with `No such file or directory` or `ModuleNotFoundError`, tell the user:
> "The orchestrator backend isn't available. Make sure the ken repo is cloned to `/home/user/ken/` and run `pip3 install -r /home/user/ken/orchestrator/requirements.txt`."

---

## Integration with Claude Code

After the orchestrator returns its JSON output:

1. **Read the consultations** — Each external model's feedback is in `consultations[]`
2. **Check claims** — Review `unverified_claims` and `failed_claims` before trusting anything
3. **Claude integrates** — Use the feedback to inform your work, but Claude makes all final decisions
4. **Enforce standards** — All output must comply with ITW-Lite v3.010: hero + compass, right-side rail, accessibility, canonical URLs

---

## Context Boundaries

### SEND to external models
- Page requirements and structure
- Content topics and outlines
- SEO targets
- General cruise/travel data

### NEVER SEND to external models
- Full codebase or source files
- Internal standards documents (send summaries only)
- Analytics data

---

## Constraints

- One hero + one compass per page
- Right-side rail required
- Accessibility script included
- Canonical URLs on all pages
- Versioning system followed
- All ITW-Lite v3.010 standards enforced
