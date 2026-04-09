# In-Progress Tasks

**Purpose:** Thread coordination file to prevent conflicts between concurrent Claude threads.
**Last Updated:** 2026-03-02 (consolidated — completed items moved to admin/COMPLETED_TASKS.md)
**Maintained by:** Claude AI (Thread tracking)

---

## How This File Works

### Before Starting Work:
1. Check this file for conflicts with your planned work
2. If the task or related files are listed here, **DO NOT START** - wait or work on something else
3. If clear, add your task below with thread ID and timestamp

### While Working:
1. Keep your entry updated with progress notes
2. If you encounter blockers, note them here

### When Complete:
1. Remove your entry from this file
2. Add the task to admin/COMPLETED_TASKS.md (if user confirms completion)
3. Or move back to admin/UNFINISHED_TASKS.md (if incomplete/blocked)

---

## Currently Active Work

<!--
FORMAT:
### [Task Name]
**Thread:** `claude/branch-name-here`
**Started:** YYYY-MM-DD HH:MM
**Files:** list of files being modified
**Status:** Brief description of current state
**Notes:** Any blockers or important context
-->

### Port Content Repair — Tier 1+2 COMPLETE
**Thread:** `claude/explore-venue-photos-OeAgM`
**Started:** 2026-03-03
**Completed:** 2026-03-03
**Files:** 31 ports in ports/*.html
**Status:** Tier 1 (15 ports) and Tier 2 (16/19 ports) complete. 3 Tier 2 ports skipped (goa, halifax, panama-canal — need logbook work).
**Next:** Tier 3 ports, or logbook repairs for remaining FAIL ports

### Port Page Normalization — Phase 1 COMPLETE, Phases 2-5 PENDING
**Thread:** `claude/normalize-port-pages-RbCra`
**Started:** 2026-03-25
**Files:** 63 ports in ports/*.html, scripts/reorder-port-sections.js, admin/PORT_NORMALIZATION_PLAN.md, admin/POI_LAND_VALIDATION_PLAN.md
**Status:** Phase 1 section reordering complete (63/68 Tier 1 pages fixed via automated script)

**Phase 1 Results:**
- Built `scripts/reorder-port-sections.js` — targeted character-offset extraction, dry-run by default, backup+restore on failure, self-verification
- 63 pages: map/featured_images sections moved to correct ITC v1.1 order
- 5 pages need manual fixes: sharm-el-sheikh (food, no ID), picton (featured_images is `<div>`), kagoshima (map is `<section>`), doha (cultural, no ID), cococay (logbook out of order)

**Commits (branch: claude/normalize-port-pages-RbCra):**
1. `6b7838f4` — Add port page normalization plan with full v2 validator results
2. `e9991f12` — Add consultation decisions to normalization plan
3. `3039d9b3` — Phase 1: Reorder sections on 63 port pages + add reorder script
4. `da4aeaf3` — Add POI land-validation plan for 1,477 POIs across 168 ports

**Pending Phases:**
- Phase 1 manual fixes (5 pages): sharm-el-sheikh, picton, kagoshima, doha, cococay
- Phase 2: Template filler removal (5 blocking + ~25 warning pages with generic_passport_advice)
- Phase 3: Moderate narrative/image fixes (sihanoukville, santos, kusadasi, falmouth, catania)
- Phase 4: Content expansion for 35 pages (prioritized by search demand/AEO citability)
- Phase 5: Warning remediation across all 387 pages
- FAQ validator bug fix: detection logic + raise threshold from 80 to 200 words
- POI land-validation: 3-layer strategy per admin/POI_LAND_VALIDATION_PLAN.md
- ICP-2 migration: ICP-Lite v1.4 → ICP-2 v2.1 during normalization

**Key Documents:**
- `admin/PORT_NORMALIZATION_PLAN.md` — Master plan with tiers, phases, consultation decisions
- `admin/POI_LAND_VALIDATION_PLAN.md` — 3-layer POI coordinate validation strategy
- `admin/port-validation-results-2026-03-25.json` — Raw v2 validator JSON for all 387 pages

---

## Blocked Tasks (Waiting on external input)

*None currently*

---

## Thread History

| Thread ID | Task | Status | Date |
|-----------|------|--------|------|
| claude/normalize-port-pages-RbCra | Port page normalization (Phase 1 complete, Phases 2-5 pending) | IN PROGRESS | 2026-03-25 |
| claude/explore-repo-structure-T6nVA | ICP elements for 7 root pages (articles, restaurants, disability, ports, ships, solo, travel) | COMPLETE | 2026-03-09 |
| claude/explore-venue-photos-OeAgM | FOM ship photos + task consolidation + port content repairs | IN PROGRESS | 2026-03-03 |
| claude/port-validation-review-Zd2lY | Port validation sessions 1-10 | COMPLETE (structural) | 2026-02-28 |
| claude/review-codebase-validators-n0YNf | Mobile Standard v1.000 (Phases 1-3) | COMPLETE | 2026-02-19 |
| claude/review-docs-codebase-IJvuW | Ship validation Phases 1-5, competitor analysis | COMPLETE | 2026-02-15 |
| claude/onboard-and-audit-PvzvO | From the Pier (376 ports), codebase audit | COMPLETE | 2026-02-05 |
| claude/identify-maintenance-tasks-FN2lh | Doc consistency, CSS, competitor gap features | COMPLETE | 2026-01-31 |
| claude/audit-venues-gD9fq | Logbook enrichment — Gentle Truth reviews | COMPLETE | 2026-01-31 |
| claude/review-previous-work-ZMk3b | Deep audit, JPG elimination, CSS, guardrail | COMPLETE | 2026-01-31 |

---

**IMPORTANT RULES:**

1. **One thread per task area** - Don't work on the same files as another thread
2. **Update this file first** - Before starting any significant work
3. **Clean up after yourself** - Remove your entry when done
4. **Be specific about files** - List exact files you're modifying to prevent conflicts
5. **Check timestamps** - If an entry is >24 hours old with no updates, it may be stale

---

**Related Files:**
- `admin/UNFINISHED_TASKS.md` - Queue of tasks waiting to be worked on
- `admin/COMPLETED_TASKS.md` - Archive of finished work

---

> **Migration Note (2026-03-02):**
> The following completed entries were moved to `admin/COMPLETED_TASKS.md` under "March 2026 — Consolidation Migration":
> - Alaska Port Sprint (COMPLETE 2026-02-24)
> - Ship Validation Phases 1-5 (COMPLETE 2026-02-15)
> - Mobile Standard v1.000 Phases 1-3 (COMPLETE 2026-02-19)
> - Port Validation Sessions 1-10 structural fixes (COMPLETE)
> - Onboard, Audit & Backlog Execution (From the Pier, audit)
> These items retain their full history in admin/COMPLETED_TASKS.md.
