---
name: consult
description: "Quick multi-LLM second opinion. Sends a single prompt to GPT, Gemini, or Grok with a role-based system prompt and returns structured feedback."
---

# Consult — Quick Second Opinion

*One model. One question. Structured feedback.*

## Usage

```
/consult <model> <role> "prompt text"
```

### Models
- **gpt** — OpenAI GPT (strong at structure, planning)
- **gemini** — Google Gemini (strong at expansion, cross-references)
- **grok** — xAI Grok (strong at challenge, adversarial thinking)

### Roles
- **challenge** — Push back on assumptions, surface weak reasoning
- **expand** — Add context, cross-references, historical background
- **structure** — Review logical flow and organization
- **critique** — Evaluate accuracy, completeness, clarity
- **plan** — Produce structured plans with steps and risks
- **safety** — Flag risks, errors, unsafe recommendations
- **freestyle** — General-purpose response

---

## Examples

```
/consult gpt structure "Review this ship page layout for logical flow"
/consult gemini expand "What port information is missing for Cozumel?"
/consult grok challenge "This page design follows conventional cruise site patterns. What's better?"
/consult gpt plan "How should we reorganize the restaurant directory?"
```

---

## Backend Invocation

**IMPORTANT: Execute these commands directly using the Bash tool. Do NOT check if files exist first — just run them.**

```bash
pip3 install -q -r /home/user/ken/orchestrator/requirements.txt 2>/dev/null && python3 /home/user/ken/orchestrator/consult.py <model> <role> "prompt text"
```

**Output:** JSON response to stdout with keys: `analysis`, `proposed_update`, `risks`, `confidence`
**Usage stats:** Printed to stderr (model, tokens, cost)

Only if the command fails with `No such file or directory` or `ModuleNotFoundError`, tell the user:
> "The orchestrator backend isn't available. Make sure the ken repo is cloned to `/home/user/ken/` and run `pip3 install -r /home/user/ken/orchestrator/requirements.txt`."

---

## Context Boundaries

### SEND
- Page requirements, content outlines, SEO targets
- General cruise/travel data
- Structural questions

### NEVER SEND
- Full codebase or internal standards documents
- Analytics data

---

## After Receiving Feedback

1. **Claude evaluates** — External feedback is advisory only. Claude decides what to use.
2. **Check claims** — If the response includes `claims`, verify them before incorporating.
3. **Enforce standards** — All changes from consultation feedback must comply with ITW-Lite v3.010.
