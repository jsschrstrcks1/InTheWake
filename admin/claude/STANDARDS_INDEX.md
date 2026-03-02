# Standards Index — In the Wake

**Version:** 2.0.0
**Last Updated:** 2026-03-02
**Purpose:** Navigation guide to all standards, protocols, and conventions. Ground truth.

**Soli Deo Gloria.** Every standard here serves people who are grieving, tired, disabled, or overwhelmed. Precision is pastoral.

---

## Priority Hierarchy

When sources conflict, defer in this order:

1. `admin/claude/PASTORAL_GUARDRAILS.md` — pastoral care and theological foundation override everything
2. `.claude/skills/careful-not-clever/CAREFUL.md` — carefulness overrides efficiency
3. `admin/claude/CLAUDE.md` — architecture, never-dos, priorities
4. `admin/claude/TECHNICAL_STANDARDS.md` — implementation patterns
5. `new-standards/` — page-type specifics
6. `admin/UNFINISHED_TASKS.md` — current work

---

## Official Standards Directory

**Location:** `new-standards/` — rebuilt after the 2025-11-23 standards catastrophe (913 fragments → 7 critical documents). This is the canonical reference for all page-type work.

### Foundation (Baseline Standards)

| File | What it covers |
|---|---|
| `new-standards/README.md` | Start here. Quick start, conflict resolution, all file descriptions |
| `new-standards/foundation/Unified_Modular_Standards_v3.007.010.md` | Complete superset — all page types, nav, data, analytics, brand, legal |
| `new-standards/foundation/SHIP_PAGE_STANDARDS_v3.007.010.md` | Ship pages — primary reference (860 lines), HTML structure, JSON-LD, WCAG |
| `new-standards/foundation/UNIFIED_MODULAR_STANDARDS_v3.001.md` | Foundation baseline — root policies, head/meta, cruise lines, restaurants |
| `new-standards/foundation/WCAG_2.1_AA_STANDARDS_v3.100.md` | Accessibility — WCAG 2.1 AA spec, skip links, focus, color contrast, keyboard |
| `new-standards/foundation/PWA_CACHING_STANDARDS_v3.007.md` | Service Worker / PWA — cache naming, limits, versioning, runtime strategies |
| `new-standards/foundation/NAVIGATION_STANDARDS_ADDENDUM_v3.008.md` | Navigation contract — 12-link structure, ARIA, auto-highlight, mobile |
| `new-standards/foundation/CI_CD_AUTOMATION_v3.009.md` | CI/CD — GitHub Actions, cache-busting enforcement, Lighthouse checks |
| `new-standards/VERSION_TIMELINE.md` | Complete evolution history v2.228 → v3.010.305 |

### v3.010 (Current Innovations)

| File | What it covers |
|---|---|
| `new-standards/v3.010/PORT_PAGE_STANDARD_v3.010.md` | Port pages — structure, Mexican ports Revolution Day requirement |
| `new-standards/v3.010/LOGBOOK_ENTRY_STANDARD_v3.010.md` | Logbook entry structure — narrative anatomy, word count, emotional arc |
| `new-standards/v3.010/SHIP_PAGE_CHECKLIST_v3.010.md` | Ship page pre-publish checklist |
| `new-standards/v3.010/MOBILE_STANDARDS_v1.000.md` | Mobile responsiveness — breakpoints, touch targets, typography minimums |
| `new-standards/v3.010/ICP_LITE_v1.0_PROTOCOL.md` | ICP-Lite v1.0 (early spec — use `admin/claude/ITW-LITE_PROTOCOL.md` for v1.4) |
| `new-standards/v3.010/AI_BREADCRUMBS_SPECIFICATION.md` | AI-readable structured comment format |
| `new-standards/v3.010/MULTI_BRAND_DATA_CONTRACTS.md` | Multi-brand data contracts (Carnival, MSC beyond RCL) |
| `new-standards/v3.010/FUN_DISTANCE_UNITS_STANDARDS_v1.0.md` | Fun distance unit display standards |

### Legacy (standards/)

| File | Status |
|---|---|
| `standards/SHIP_PAGE_STANDARD.md` | Ship page v2.0 (ITW-SHIP-002) — still valid, defines gold standard examples |
| `standards/drink-calculator.md` | Drink calculator feature spec |

---

## Claude Documentation (admin/claude/)

### Process & Integrity

| File | Purpose |
|---|---|
| `admin/claude/PASTORAL_GUARDRAILS.md` | **NON-NEGOTIABLE.** Grief, disability, solo travel, relationships — pastoral space first |
| `admin/claude/WORKFLOW.md` | Before/during/after task guidelines, git commit format, verification checklist |
| `admin/claude/STANDARDS_GUIDE.md` | Quick orientation to `new-standards/` — written post-catastrophe rebuild |

### Implementation Reference

| File | Purpose |
|---|---|
| `admin/claude/TECHNICAL_STANDARDS.md` | Analytics, Service Worker, images, WCAG, SEO, security patterns |
| `admin/claude/IMAGE_WORKFLOW.md` | Image sourcing, conversion, attribution — WebP only, never placeholder |
| `admin/claude/ITW-LITE_PROTOCOL.md` | ICP-Lite v1.4 — dual-cap rule, JSON-LD mirroring, ai-summary spec |
| `admin/claude/LOGBOOK_ENTRY_STANDARDS_v2.300.md` | Story standards — narrative anatomy, 600–1200 words, emotional arc, pastoral rules |
| `admin/claude/VIDEO_SOURCING.md` | YouTube video IDs — finding them in rc_ship_videos.json master manifest |
| `admin/claude/CODEBASE_GUIDE.md` | Repository structure, JS patterns, CSS architecture, JSON data formats |

### Planning & Decision Files

| File | Purpose |
|---|---|
| `admin/claude/PORT_100_PERCENT_PLAN.md` | Plan for port pages to 100% validator pass rate |
| `admin/claude/PORT_REMEDIATION_PLAN.md` | Port page remediation — failure tiers, fix approach |
| `admin/claude/NASSAU_REVIEW_PLAN.md` | Nassau port page audit findings (Gemini + ChatGPT review) |
| `admin/claude/INTERIOR_NAMING_RIGHTS_PROMPT.md` | Interior cabin naming — Promenade View, Virtual Balcony |

---

## Task Tracking (Always Keep Current)

| File | Rule |
|---|---|
| `admin/UNFINISHED_TASKS.md` | Master task list. Check before starting. Update when tasks change. |
| `admin/IN_PROGRESS_TASKS.md` | Active work in current session |
| `admin/COMPLETED_TASKS.md` | Log immediately when done — not later, not in batches. Now. |

**Rule:** `admin/COMPLETED_TASKS.md` gets updated in the same session as the work. Not after. Not "I'll do it later."

---

## Find the Right Standard: By Task Type

**Building or editing a ship page:**
1. `new-standards/foundation/SHIP_PAGE_STANDARDS_v3.007.010.md` (primary, 860 lines)
2. `new-standards/v3.010/SHIP_PAGE_CHECKLIST_v3.010.md` (pre-publish checklist)
3. `standards/SHIP_PAGE_STANDARD.md` (v2.0 — gold standard examples)
4. `admin/claude/VIDEO_SOURCING.md` (for video carousel YouTube IDs)

**Building or editing a port page:**
1. `new-standards/v3.010/PORT_PAGE_STANDARD_v3.010.md`
2. Mexican port? MUST include Revolution Day notice (November 20th) — CRITICAL
3. `admin/claude/IMAGE_WORKFLOW.md` (port images, attribution)

**Writing a logbook entry:**
1. `admin/claude/LOGBOOK_ENTRY_STANDARDS_v2.300.md` (primary)
2. `new-standards/v3.010/LOGBOOK_ENTRY_STANDARD_v3.010.md` (structure)
3. `admin/claude/PASTORAL_GUARDRAILS.md` (grief/disability content — MANDATORY read)

**Adding meta tags / ICP-Lite:**
1. `admin/claude/ITW-LITE_PROTOCOL.md` (v1.4 — current spec, dual-cap rule)
2. `new-standards/v3.010/ICP_LITE_v1.0_PROTOCOL.md` (early reference)

**Accessibility work:**
1. `new-standards/foundation/WCAG_2.1_AA_STANDARDS_v3.100.md`
2. `admin/claude/TECHNICAL_STANDARDS.md` (skip links, ARIA snippets)

**Navigation changes:**
1. `new-standards/foundation/NAVIGATION_STANDARDS_ADDENDUM_v3.008.md`
2. NEVER remove "Cruise Lines" from primary nav — no exceptions

**Performance / Service Worker:**
1. `new-standards/foundation/PWA_CACHING_STANDARDS_v3.007.md`
2. `admin/claude/TECHNICAL_STANDARDS.md` (code snippets, SW limits)

**Image work:**
1. `admin/claude/IMAGE_WORKFLOW.md` — WebP only, sourcing workflow, attribution
2. Never placeholder images. Ever. Blocking error.

---

## Compliance Checklist (Every Page)

Before marking any task complete:

- [ ] Absolute URLs (`https://cruisinginthewake.com/...`) — never relative
- [ ] SDG invocation comment before line 20 — IMMUTABLE, no exceptions
- [ ] DOCTYPE present
- [ ] Meta tags: `charset`, `viewport`, `description`, `version`, `content-protocol`, `ai-summary`, `last-reviewed`
- [ ] CSS version query: `?v=3.010.400`
- [ ] Service Worker registration snippet
- [ ] SiteCache pre-warm snippet
- [ ] Skip-link for accessibility
- [ ] BreadcrumbList JSON-LD
- [ ] No `console.log/warn/error` in production
- [ ] No placeholder images
- [ ] No lorem ipsum or "coming soon"
- [ ] Voice audit if content file staged

---

## Version History

- v2.0.0 (2026-03-02) — Full rebuild to reflect current architecture. Removed all references to non-existent `/standards/main-standards.md`, `root-standards.md`, `ships-standards.md`, `cruise-lines-standards.md`, `ports-standards.md`, `STANDARDS_ADDENDUM_RCL_v3.006.md`. Added accurate `new-standards/` entries, planning files, `VIDEO_SOURCING.md`, `STANDARDS_GUIDE.md`. Removed stale port master list references and obsolete audit reports. Kept task tracking rules and task-type navigation.
- v1.2.0 (2026-02-14) — Metrics correction: ICP-Lite, ship images
- v1.1.0 (2026-02-12) — Accuracy audit: ICP-Lite coverage, port count, template version
- v1.0.0 (2025-11-23) — Initial comprehensive standards index

---

*Soli Deo Gloria*
