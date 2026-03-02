# Claude Code Skills Reference — In the Wake

**Version:** 1.0.0
**Last Updated:** 2026-03-02
**Purpose:** Master reference for all 10 Claude Code skills active in this project.

The skill system is defined in `.claude/skill-rules.json` and governed by hooks in `.claude/hooks/`.

**Read first:** `.claude/ONBOARDING.md` — complete system overview including installation and configuration.

---

## Hook Wiring — When Things Fire

| Trigger | Hook | What It Does |
|---|---|---|
| Every prompt | `session-start-guardrail.sh` | Injects both CAREFUL guardrails into context |
| `git commit` with content files staged | `voice-audit-hook.sh` | Injects voice-audit diagnostic before commit |
| Edit/Write any content HTML or logbook JSON | `port-content-voice-hook.sh` | Injects Like-a-human voice standard |
| Edit/Write any ship HTML | `ship-page-validator.sh` | Validates ship page compliance |
| Edit/Write any file | `post-tool-use-tracker.sh` | Tracks files for build/TSC commands |

---

## The 10 Skills

### 1. careful-not-clever — CRITICAL PRIORITY

**Type:** Guardrail
**Enforcement:** warn (mandatory)
**Fires:** Every file edit, every prompt (via session-start-guardrail.sh)

**What it governs:** HOW we work — read before editing, verify before reporting, document as you go, one logical change at a time.

**Files:**
- `.claude/skills/careful-not-clever/CAREFUL.md` — Process guardrail (the rules)
- `CAREFUL.md` (repo root) — Technical guardrail (CSS semantics, pre-commit checks)

**The Rule:** *Be careful, not clever. Careful means: verified, documented, reversible, honest.*

---

### 2. standards — High Priority

**Type:** Guardrail
**Enforcement:** suggest
**Fires:** Editing HTML, CSS, JS, JSON, MD files

**What it governs:** Site-wide technical standards (HTML structure, accessibility patterns, WCAG AA, theological invocation, ICP-Lite, AI-breadcrumbs, JSON-LD).

**Files:**
- `.claude/skills/standards/STANDARDS.md` — Main standards file
- `.claude/skills/standards/resources/html-standards.md`
- `.claude/skills/standards/resources/css-standards.md`
- `.claude/skills/standards/resources/javascript-standards.md`
- `.claude/skills/standards/resources/theological-foundation.md`
- `.claude/skills/standards/resources/security-requirements.md`
- `.claude/skills/standards/resources/icp-lite-protocol.md` — ICP-Lite v1.4 (CURRENT)
- `.claude/skills/standards/resources/ai-breadcrumbs-spec.md`
- `.claude/skills/standards/resources/wcag-aa-checklist.md`

---

### 3. skill-developer — High Priority

**Type:** Domain
**Enforcement:** suggest
**Fires:** Keywords — "skill system", "create skill", "skill rules", "hook system"

**What it governs:** Creating and managing Claude Code skills, modifying skill-rules.json, understanding trigger patterns.

**Files:**
- `.claude/skills/skill-developer/SKILL.md`

---

### 4. frontend-dev-guidelines — High Priority

**Type:** Guardrail
**Enforcement:** suggest
**Fires:** HTML, CSS, JS file edits; keywords — accessibility, WCAG, responsive, semantic HTML

**What it governs:** HTML/CSS/JS best practices for the static cruise planning site.

**Files:**
- `.claude/skills/frontend-dev-guidelines/SKILL.md`

---

### 5. seo-optimizer — High Priority (WITH GUARDRAILS)

**Type:** Domain
**Enforcement:** suggest
**Fires:** SEO, meta tags, schema.org, structured data, ICP-Lite, ITW-Lite keywords

**What it governs:** Technical SEO that benefits AI + humans + search engines simultaneously.

**Guardrails:** Reject keyword stuffing, removing AI-first meta tags, sacrificing readability for rankings.
Accept schema.org structured data, semantic HTML, natural meta descriptions, ICP-Lite compliance.

*Rule-based only — no dedicated SKILL.md directory.*

---

### 6. accessibility-auditor — High Priority

**Type:** Domain
**Enforcement:** suggest
**Fires:** accessibility, a11y, WCAG, aria, screen reader, color contrast keywords; HTML file edits

**What it governs:** WCAG 2.1 AA compliance across all pages.

*Rule-based only — no dedicated SKILL.md directory.*

---

### 7. content-strategy — High Priority (WITH GUARDRAILS)

**Type:** Domain
**Enforcement:** warn
**Fires:** content, description, cruise, ship, port, storytelling keywords; ships/**, ports/**, restaurants/**, solo/** file edits

**What it governs:** HOW IT READS — travel storytelling, authentic voice, faith-scented reflections, no robotic SEO copy.
Loads Like-a-human during every content write (via port-content-voice-hook.sh).

**Files (autoLoad):**
- `.claude/skills/Humanization/Like-a-human.md` — v2.0.0 voice standard (fires during writing)

*Rule-based with autoLoad — no dedicated SKILL.md directory.*

---

### 8. voice-audit — High Priority (WITH GUARDRAILS)

**Type:** Guardrail
**Enforcement:** warn
**Fires:** Before `git commit` when content files are staged (via voice-audit-hook.sh). Also fires on keywords: "voice audit", "authenticity check", "machine tell", "voice drift".

**What it governs:** Post-draft diagnostic — machine tells, voice drift, emotional register flattening, promotional language, cadence, precision.

**Files:**
- `.claude/skills/Humanization/voice-audit.md` — Diagnostic checklist (fires before committing)

*Rule-based with hook — no dedicated SKILL.md directory.*

---

### 9. performance-analyzer — Medium Priority

**Type:** Domain
**Enforcement:** suggest
**Fires:** performance, optimize, lighthouse, Core Web Vitals, LCP, FID, CLS keywords

**What it governs:** Web performance optimization (service worker, image optimization, caching strategy).

**Reference:** `admin/claude/TECHNICAL_STANDARDS.md` for performance patterns and code snippets.

*Rule-based only — no dedicated SKILL.md directory.*

---

### 10. ship-page-validator — High Priority

**Type:** Guardrail
**Enforcement:** warn
**Fires:** ships/**/*.html file edits; "ship page", "create ship", "validate ship" keywords

**What it governs:** Auto-validates ship pages against SHIP_PAGE_CHECKLIST_v3.010 standards after every edit.

**Required on every ship page:**
- Soli Deo Gloria invocation (IMMUTABLE)
- AI-breadcrumbs (entity, type, parent, category)
- ICP-Lite v1.4 meta tags
- 7 JSON-LD blocks
- WCAG accessibility (skip link, ARIA, landmark roles)
- All required content sections

**Files:**
- `new-standards/v3.010/SHIP_PAGE_CHECKLIST_v3.010.md` — Full checklist
- `.claude/hooks/ship-page-validator.sh` — Auto-runs on every ship page edit

*Rule-based with hook and autoLoad — no dedicated SKILL.md directory.*

---

## Voice System — Like-a-human + Voice-Audit

Two skills govern prose quality. They are companions.

| Skill | When | File | Focus |
|---|---|---|---|
| **Like-a-human v2.0.0** | *During writing* | `.claude/skills/Humanization/Like-a-human.md` | Precision, cadence, warmth, no machine tells |
| **voice-audit v1.0.0** | *Before committing* | `.claude/skills/Humanization/voice-audit.md` | Scanning for drift, assessing authenticity risk |

Both fire automatically via hooks. Neither requires manual invocation for content files.

---

## The Two CAREFUL Files

Two files together form the careful-not-clever guardrail:

| File | Version | Focus |
|---|---|---|
| `.claude/skills/careful-not-clever/CAREFUL.md` | v1.0.0 | Process discipline — read first, verify, document as you go |
| `CAREFUL.md` (repo root) | current | Technical discipline — semantic equivalence, CSS class gotchas, pre-commit checks |

Both are injected into context on every prompt via `session-start-guardrail.sh`.

---

## Task Tracking Files

Current work state is tracked across three files:

- `UNFINISHED_TASKS.md` — Master task list (P0-P4 priority). Start here.
- `IN_PROGRESS_TASKS.md` — Active work in the current session
- `COMPLETED_TASKS.md` — Completed work log for reference

Before starting any task: check `UNFINISHED_TASKS.md`. After completing: update `COMPLETED_TASKS.md`.

---

*Soli Deo Gloria*
