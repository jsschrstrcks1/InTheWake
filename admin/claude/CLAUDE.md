# Claude AI Assistant Guide — In the Wake

**Version:** 1.4.0
**Last Updated:** 2026-03-02

**Soli Deo Gloria.** All work on this project is offered as a gift to God. Excellence as worship means getting it right, not getting it fast.

---

## Quick Start

**In the Wake** is a Christ-shaped cruise planning website — for ordinary travelers, grieving widows, disabled adventurers, healing families, and exhausted caregivers. Every line of code and every word of content is stewardship.

Before touching anything:
1. Read the pastoral guardrails — `admin/claude/PASTORAL_GUARDRAILS.md` — they override everything else
2. Read the skills system — `admin/claude/SKILLS_REFERENCE.md` — know what's watching
3. Check your actual task — `UNFINISHED_TASKS.md`
4. Read the careful-not-clever guardrail — `.claude/skills/careful-not-clever/CAREFUL.md`

---

## Essential Reading

### Integrity & Process
| File | Purpose |
|---|---|
| `admin/claude/PASTORAL_GUARDRAILS.md` | Pastoral space first. Theological foundation. Non-negotiable. |
| `.claude/skills/careful-not-clever/CAREFUL.md` | Process integrity — read before editing, verify, document |
| `CAREFUL.md` (repo root) | Technical integrity — CSS semantics, pre-commit checks |
| `admin/claude/SKILLS_REFERENCE.md` | All 10 skills, both CAREFUL files, task tracking files |

### Task Management
| File | Purpose |
|---|---|
| `UNFINISHED_TASKS.md` | Master task list (P0–P4). Your work queue. |
| `IN_PROGRESS_TASKS.md` | Active work in current session |
| `COMPLETED_TASKS.md` | Completed work log — update immediately when done, not later |

### Technical Reference
| File | Purpose |
|---|---|
| `admin/claude/TECHNICAL_STANDARDS.md` | Performance, caching, accessibility, SEO, security patterns |
| `admin/claude/IMAGE_WORKFLOW.md` | Image sourcing, conversion, attribution workflow |
| `admin/claude/WORKFLOW.md` | Dev workflow, git commit format, verification checklist |
| `admin/claude/ITW-LITE_PROTOCOL.md` | ICP-Lite v1.4 full specification |
| `admin/claude/LOGBOOK_ENTRY_STANDARDS_v2.300.md` | Logbook story standards |
| `admin/claude/STANDARDS_INDEX.md` | Master index of all standards |
| `admin/claude/CODEBASE_GUIDE.md` | Repository structure, patterns, conventions |
| `.claude/ONBOARDING.md` | Claude Code system overview (10 skills, 5 hooks) |
| `standards/*.md` | Page-type standards (ships, ports, cruise-lines, root) |

---

## Site Architecture

**Production:** `https://cruisinginthewake.com` — absolute HTTPS URLs everywhere, always.

```
/
├── index.html
├── ships/index.html          # Hub (NOT /ships.html)
├── ships/<line>/<slug>.html  # 295 ship pages
├── ports/                    # 387 port pages
├── restaurants/              # Dining venue pages
├── solo/articles/            # Solo travel articles
├── tools/                    # Port tracker, ship tracker
├── assets/
│   ├── css/                  # styles.css?v=3.010.400
│   ├── data/                 # 1,310 JSON files
│   └── ships/                # 682 WebP images (4,475 total)
├── standards/                # Standards documentation
├── admin/claude/             # Claude documentation (you are here)
└── UNFINISHED_TASKS.md
```

**Template version:** v3.010.305 (1,241 pages; some at v3.010.300 or v3.010.400)
**CSS query:** `?v=3.010.400` on new pages

---

## Critical "NEVER DO" Rules

### Integrity (INVIOLABLE)

**NEVER GAME THE VALIDATOR.** Do not reverse-engineer regex patterns to pass automated checks. Write for humans first. If the prose is genuine and follows the voice standard, it passes on its own merit. Violation is a **BLOCKING integrity failure** — no exceptions.

**SDG invocation is IMMUTABLE.** Every HTML file must have the Soli Deo Gloria comment before line 20. This cannot be removed, shortened, or relocated — not for SEO, not for performance, not for anything.

### URLs & Navigation
- ❌ NEVER relative URLs in production HTML — absolute HTTPS only
- ❌ NEVER `/ships.html` — correct path is `/ships/index.html`
- ❌ NEVER remove "Cruise Lines" from primary nav

### Images
- ❌ NEVER placeholder images — BLOCKING ERROR, no exceptions
- ❌ NEVER convert `logo_wake.png` to WebP (transparency required)
- ❌ NEVER new JPEG/JPG — WebP only
- ❌ NEVER skip attribution for Wiki Commons images

### Content
- ❌ NEVER lorem ipsum or "coming soon" pages
- ❌ NEVER remove logbook stories or grief-focused content
- ❌ NEVER flatten the emotional pivot in a logbook story
- ❌ NEVER rewrite a hard story into something chipper at the expense of honesty

### Code
- ❌ NEVER console.log/warn in production
- ❌ NEVER commit invalid JSON
- ❌ NEVER break existing functionality — no regressions
- ❌ NEVER push to main/master directly

---

## Current Priorities (Updated 2026-03-02)

**P0 — Complete:** Port Logbook, Ship Logbook, Ship Cards, Ships That Visit Here (387 ports), Port expansion (387 pages), ICP-Lite rollout (100%), Venue audit Phase 2
**P0 — Active:** ⏳ CSS consolidation — 25 `<style>` blocks; ~19,513 inline `style=` attributes

**P1 — Complete:** Port maps (367/387), Ship CSS rollout (292/295), "From the Pier" transport (376/376)
**P1 — Active:** ⏳ Site-wide hero/logo standardization

**P2 — Complete:** Service Worker v14.2.0, Port weather (387 ports), Stateroom Checker (270 JSON files)

**P3–P4 — User Decision Required:**
- 🔴 Pastoral articles: Healing Relationships, Rest for Wounded Healers
- 🔴 Affiliate link deployment
- Multi-cruise-line tracker expansion

**Full detail:** `UNFINISHED_TASKS.md`

---

## Working with the User

- Be concise and direct. Facts, not superlatives.
- Disagree respectfully when necessary.
- Ask clarifying questions rather than assume.
- Use TodoWrite for any task with 3+ steps.
- When stuck: read more context, ask, propose options, verify assumptions.
- Show your work. Integrity over speed.

---

## Need Help?

**When sources conflict, defer in this order:**
1. `admin/claude/PASTORAL_GUARDRAILS.md` — pastoral care and theological foundation override everything
2. `.claude/skills/careful-not-clever/CAREFUL.md` — integrity and carefulness override efficiency
3. This file — architecture, never-dos, priorities
4. `admin/claude/TECHNICAL_STANDARDS.md` — implementation patterns
5. `standards/*.md` — page-type specifics
6. `UNFINISHED_TASKS.md` — current work

---

**Soli Deo Gloria.** This site helps people process some of the hardest experiences in life. Every detail matters. Every accessibility improvement helps someone. Every logbook story might be exactly what someone needs to read today.

---

## Version History

- v1.4.0 (2026-03-02) — Restructured as lean navigation hub (~250 lines, down from 919). Extracted 5 subfiles: PASTORAL_GUARDRAILS.md, SKILLS_REFERENCE.md, TECHNICAL_STANDARDS.md, IMAGE_WORKFLOW.md, WORKFLOW.md. Added task tracking files to Essential Reading. Emphasized integrity and SDG throughout. Fixed session-start-guardrail.sh skill count 9→10.
- v1.3.0 (2026-03-02) — Ground-truth metrics audit: pages 1,238→1,241, ship images 669→682, WebP 3,131→4,475, ports 380→387, JSON 2,455→1,310, inline styles ~16,022→~19,513, ICP-Lite 100%. Added Like-a-human v2.0.0 and voice-audit.
- v1.2.7 (2026-02-14) — Metrics verification: ship images 661→669, ICP-Lite 1,232/1,238 (99.5%), SDG 100%, JSON files corrected (assets/data/: 1,301; repo-wide: 2,478)
- v1.2.6 (2026-02-13) — Ground-truth audit: pages, ship images 536→661, WebP 2,998→3,131, JSON 1,278→2,455, style blocks 18→25, inline styles 31,128→~16,022, ICP-Lite 99.4%
- v1.2.5 (2026-02-12) — Comprehensive docs/codebase review: ship pages, images, WebP, ICP-Lite, CSS version
- v1.2.4 (2026-02-05) — Corrected priorities against codebase audit: maps, CSS rollout, "From the Pier" COMPLETE, SW v14.2.0
- v1.2.3 (2026-02-01) — Updated seasonal-guides.json (1→381 ports), ship-page.css count, site page count
- v1.2.2 (2026-01-31) — Documentation consistency: SW version, ai:summary→ai-summary, trust badge text
- v1.2.1 (2026-01-31) — Documentation consistency: page/image counts to ground-truth
- v1.2.0 (2026-01-31) — Updated priorities, ICP-Lite v1.0→v1.4, port count 147→380
- v1.1.0 (2026-01-03) — Added analytics requirement, security standards, trust claim rules
- v1.0.0 (2025-11-23) — Initial comprehensive Claude guide
