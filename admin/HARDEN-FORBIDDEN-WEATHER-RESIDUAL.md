# Hardening residual — forbidden HTML + non-FAQ weather structure

**Date:** 2026-07-12  
**Patron:** skynet2  
**Soli Deo Gloria. Careful, not clever.**

## Track A — Forbidden phrases in `ports/*.html`

Validator `FORBIDDEN_PATTERNS` from `scripts/port-weather-validator-core.js`:

| Pattern | Replacement |
|---------|-------------|
| Shoulder Season | Transitional Season |
| Weather Guide | weather section |
| Climate Overview / Typical Weather | At a Glance |
| When to Go/Visit | Best Time to Visit |
| Best Months for/to | Best Time for/to |

**Result:** 19 files, 33 substitutions. Residual scan = **0**.

## Track B — Non-FAQ weather structure (10 FAQ-fixed ports)

| Port | Residual after harden | Note |
|------|------------------------|------|
| dravuni | weather errors **0** (SPEC_REG warn) | Overview→At a Glance; activities canon |
| gijon | **0** | same |
| napier | **0** | + months-to-avoid |
| olden | **0** | Beach/Snorkel N/A honest |
| shanghai | **0** | Beach/Snorkel N/A |
| singapore | **0** | |
| suva | **0** | + catches / packing / hazards / avoid |
| **philipsburg** | **28** (missing `weather-guide` shell) | **Issue E class** — full seasonal section missing |
| **rostock** | **28** | Issue E |
| **santos** | **28** | Issue E |

Activity rows alone on bare port At-a-Glance pages do **not** create a full seasonal guide. Lead into `issue-e-ports-with-the-entire-weather-seasonal-section-missing` for those three.

Tool: `admin/harden-forbidden-and-weather-structure.py` (Track A). Track B activity balances applied in-session carefully after non-greedy `div` fix.

*Not suite green. Ad-hoc hermes-verify only.*
