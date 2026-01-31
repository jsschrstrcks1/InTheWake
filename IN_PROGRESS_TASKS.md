# In-Progress Tasks

**Purpose:** Thread coordination file to prevent conflicts between concurrent Claude threads.
**Last Updated:** 2026-01-31
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
2. Add the task to COMPLETED_TASKS.md (if user confirms completion)
3. Or move back to UNFINISHED_TASKS.md (if incomplete/blocked)

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

### Review Previous Work, Image Optimization, CSS Consolidation & Documentation
**Thread:** `claude/review-previous-work-ZMk3b`
**Started:** 2026-01-31
**Files:** UNFINISHED_TASKS.md, COMPLETED_TASKS.md, IN_PROGRESS_TASKS.md, admin/claude/CLAUDE.md, claude.md, .claude/plan-implementation-priorities-2026-01-31.md, .claude/skill-rules.json, .claude/skills/careful-not-clever/CAREFUL.md, assets/styles.css, 162 ship HTML files, 124 restaurant HTML files, ships/carnival/index.html, 59 deleted image files
**Status:** Deep audit, JPG elimination, restaurant CSS extraction, ship-page.css rollout (292/297), "careful not clever" guardrail, documentation consistency fixes — all complete. Branch ready for merge.
**Notes:** Remaining work: CSS `.ship-list` class conflict (12 files), competitor gap quick wins, port weather data.

### Logbook Enrichment — "Gentle Truth" Reviews (Phase 1)
**Thread:** `claude/audit-venues-gD9fq`
**Started:** 2026-01-31
**Files:** 26 venue HTML files across NCL, Carnival, MSC, Virgin Voyages
**Status:** Complete. 26 flagship venue logbooks enriched with specific dish recommendations, honest "Gentle Truth" critiques, and differentiated ratings.
**Notes:** Replaced identical boilerplate entries with venue-specific reviews. Ratings now range 3.7–4.5 (previously all 4.0). 85 boilerplate venues remain across the fleet — this was Phase 1 targeting highest-impact flagships.

---

## Recently Completed (Move to COMPLETED_TASKS.md after user confirmation)

<!-- Tasks that just finished but haven't been confirmed by user yet -->

*None currently*

---

## Blocked Tasks (Waiting on external input)

<!-- Tasks that can't proceed without user action or external dependencies -->

*None currently*

---

## Thread History

| Thread ID | Task | Status | Date |
|-----------|------|--------|------|
| claude/audit-venues-gD9fq | Logbook enrichment — Gentle Truth reviews | IN PROGRESS | 2026-01-31 |
| claude/review-previous-work-ZMk3b | Deep audit, JPG elimination, CSS consolidation, ship-page.css rollout, guardrail, docs | IN PROGRESS | 2026-01-31 |
| claude/review-onboarding-setup-01JpVFgKzWRBKvXaxcS1pC9N | Onboarding review, schema fix | COMPLETE | 2025-12-01 |
| claude/fix-dropdown-menu-01XJq5FhAaie7QptqwRY7wfd | Dropdown menu fix | COMPLETE | 2025-11-28 |

---

**IMPORTANT RULES:**

1. **One thread per task area** - Don't work on the same files as another thread
2. **Update this file first** - Before starting any significant work
3. **Clean up after yourself** - Remove your entry when done
4. **Be specific about files** - List exact files you're modifying to prevent conflicts
5. **Check timestamps** - If an entry is >24 hours old with no updates, it may be stale

---

**Related Files:**
- `UNFINISHED_TASKS.md` - Queue of tasks waiting to be worked on
- `COMPLETED_TASKS.md` - Archive of finished work
