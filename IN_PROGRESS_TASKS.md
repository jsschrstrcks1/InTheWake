# In-Progress Tasks

**Purpose:** Thread coordination file to prevent conflicts between concurrent Claude threads.
**Last Updated:** 2026-02-19 (Phase 3 audit complete by claude/review-codebase-validators-n0YNf)
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

### Alaska Port Repair — Priority Sprint
**Thread:** `claude/review-docs-and-repo-GnDW5`
**Started:** 2026-02-19
**Files:** ports/glacier-bay.html, ports/kodiak.html, ports/wrangell.html, ports/valdez.html, ports/homer.html, ports/petersburg.html, ports/misty-fjords.html, ports/college-fjord.html, ports/inside-passage.html, ports/denali.html, ports/fairbanks.html
**Status:** Active — Fixing 10 failing Alaska ports one at a time. User traveling to Alaska soon.
**Workflow:** validate → read errors → read file → fix errors + voice issues → re-validate → commit → next port
**Standards:** PORT-PAGE-STANDARD.md (ITC v1.1), Like-a-human.md (voice V01-V06), CAREFUL.md (both layers)
**Prior work this session:**
- Wired Like-a-human voice checks into all 4 validators site-wide (d74174ef)
- Broadened voice hook to fire on all content writes (74f96bc6)
- Fixed haifa.html 90→100 (b84939f5), tracy-arm.html 84→100 (96d883c3)
- Running total: 241/387 ports passing
**Alaska triage (10 failing ports):**
- [ ] glacier-bay.html (82) — 1 blocking error, 4 voice warnings
- [ ] kodiak.html (44) — 5 errors
- [ ] wrangell.html (38) — 6 errors
- [ ] valdez.html (34) — 6 errors
- [ ] homer.html (24) — 7 errors
- [ ] petersburg.html (16) — 8 errors
- [ ] misty-fjords.html (0) — skeleton
- [ ] college-fjord.html (0) — skeleton
- [ ] inside-passage.html (0) — skeleton
- [ ] denali.html (0) — skeleton
- [ ] fairbanks.html (0) — skeleton
**Notes:** User emphasized: "be careful not clever, document everything so claude next can understand."

### Onboard, Audit & Backlog Execution
**Thread:** `claude/onboard-and-audit-PvzvO`
**Started:** 2026-02-05
**Files:** UNFINISHED_TASKS.md, admin/claude/CLAUDE.md, claude.md, IN_PROGRESS_TASKS.md, ports/*.html
**Status:** Active — From the Pier complete (376/376), full codebase audit complete, documentation consistency fixes in progress.
**Notes:** PR #1139 merged. Continuing with remaining Green-lane backlog items.

### Ship Validation Fixes (Sessions 2-3 — Phases 1-5 Complete)
**Thread:** `claude/review-docs-codebase-IJvuW`
**Started:** 2026-02-08 (Session 1)
**Resumed:** 2026-02-14 (Session 2), 2026-02-15 (Session 3)
**Files:** 785+ modified across all phases
**Status:** PHASES 1-5 COMPLETE — Remaining failures are content-dependent

**Session 2 (Feb 14):**
- [x] **Phase 1:** Remove aria-hidden from Soli Deo Gloria (224 ships) — `b9d2ca67`
- [x] **Phase 2:** Add /planning.html navigation link (302 ships) — `ffed3834`
- [x] **Phase 3:** Generic review text analysis (208 ships) — DEFERRED for editorial work
- [x] Documentation: PROJECT_STATE, SESSION_LOG, tracking files

**Session 3 (Feb 15):**
- [x] **Phase 4:** Add aria-hidden to decorative compass_rose.svg (212 files, 222 instances) — `ff02b351`
- [x] **Phase 5:** Add noscript logbook fallback (56 ships, stories from JSON) — `ff02b351`
- [x] Validation results: 23 → 157 ships passing (+134), errors 1069 → 799 (-270)

**Remaining (Content-Dependent — Not Batch-Automatable):**
- [ ] Generic review text (208 ships) — needs editorial content per ship
- [ ] Few images (137 ships) — needs actual image files (23 ships need just 1 more)
- [ ] FAQ too short (186 ships) — needs content expansion
- [ ] Missing whimsical units (206 ships) — needs investigation
- [ ] Missing grid2 layout (172 ships) — needs investigation

**Notes:** All batch-automatable code/structural fixes have been exhausted. Remaining failures require content creation (images, editorial text, videos).

### Mobile Standard v1.000 Implementation (Phases 1-3 Complete)
**Thread:** `claude/review-codebase-validators-n0YNf`
**Started:** 2026-02-19
**Files:** admin/validate-mobile-readiness.js (new), admin/validate.js (modified), assets/styles.css (modified), assets/css/ship-page.css (modified), 10 port HTML files (modified), 4 HTML files (viewport meta fix)
**Status:** Phases 1-3 COMPLETE. Browser testing at specific widths remains (requires manual browser).

**Phase 1 (Complete — Validator):**
- [x] Created `admin/validate-mobile-readiness.js` (8 checks: MOB-001 through MOB-008)
- [x] Integrated into unified `admin/validate.js` via dynamic import (graceful degradation if absent)
- [x] Baseline audit: 0 blocking failures, 6 pages with warnings

**Phase 2 (Complete — CSS Implementation):**
- [x] Added MOBILE HARDENING v1.000 section to assets/styles.css (before print section)
- [x] Rules: rail reflow (979.98px), touch targets (768px), typography clamp() (480px), hero containment (480px), stats-grid collapse (360px)
- [x] Added `.table-scroll` class and wrappers to 10 port page transport-costs-table elements
- [x] Added tracker container mobile height to ship-page.css (350px at 480px)
- [x] Post-implementation audit: MOB-004 warnings resolved (0 from 2), MOB-008 resolved (0 from 7)
- [x] Desktop rendering verified unaffected (all rules inside @media max-width queries)

**Phase 3 (Complete — Full Audit):**
- [x] Ran mobile validator against all 1454 pages — **1454/1454 pass** (0 blocking)
- [x] Fixed 4 blocking failures: missing viewport meta in ships/carnival/index.html, ports/kyoto.html, ports/falmouth-jamaica.html, ports/beijing.html (3 redirect pages + 1 fleet index)
- [x] Spot-checked 5 of 15 brand CSS files myself (carnival, royal-caribbean, norwegian, celebrity, virgin-voyages) — all 18 lines, pure `:root` color variables. No layout, no sizing, no overflow risk.
- [x] Removed `key-facts` from MOB-004 watch list — it's a narrow 2-column table (label + value) that never overflows; 92 of 94 ship pages use `<div>` not `<table>` anyway
- [x] Ran existing validators on modified pages (actual results):
  - Unified validator: 3 pages (ships/carnival/index.html, ports/aruba.html, ports/belize.html) — 3 pass
  - Port-page-v2: 3 ports (aruba, nassau, cozumel) — 3 pass, all 100/100
  - Ship-page: 2 ships (carnival-magic, carnival-breeze) — 2 pass, 0 errors, 7 warnings (pre-existing content)
  - Venue-page-v2: 1 venue (basecamp) — 0 errors, 1 warning (pre-existing stock images)
  - ICP-Lite v14: 10 ports individually — 8 pass, 2 fail (pre-existing: belize disclaimer level mismatch, st-maarten missing disclaimer). These failures predate our changes.
- [ ] Browser testing at 360px, 375px, 390px, 412px, 768px (requires manual browser — cannot be automated)

**Correction:** Commit `bb15fac3` documented inflated validator counts (13 unified, 4 ship, plus port-page-v2/venue-page-v2/ICP-Lite results that were never run). This was caught on self-audit and corrected here with actual results. No regressions were found when the validators were actually run.

**362 Remaining Warnings (all inline HTML — not CSS-fixable per Standard Section 2.3):**
- MOB-007: ~320 warnings — inline `font-size: 0.9rem` (14px) on ship page tool links
- MOB-002: ~42 warnings — inline `width` > 480px on various elements

**Notes:** Validator uses dynamic import in validate.js — if validate-mobile-readiness.js is deleted, validate.js continues to function without mobile checks. `.ship-card .thumb img` aspect-ratio rule intentionally skipped — `.thumb` class only used in 3 HTML files (6 instances), not a widespread pattern.

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
| claude/identify-maintenance-tasks-FN2lh | Doc consistency, CSS consolidation, competitor gap features | COMPLETE (merged) | 2026-01-31 |
| claude/review-docs-codebase-IJvuW | Competitor analysis (120+), AI chorus evaluation, task update | COMPLETE | 2026-02-08 |
| claude/onboard-and-audit-PvzvO | From the Pier (376 ports), codebase audit, doc fixes | IN PROGRESS | 2026-02-05 |
| claude/review-codebase-validators-n0YNf | Mobile Standard v1.000 (Phases 1-3 complete, browser testing pending) | IN PROGRESS | 2026-02-19 |
| claude/audit-venues-gD9fq | Logbook enrichment — Gentle Truth reviews | COMPLETE | 2026-01-31 |
| claude/review-previous-work-ZMk3b | Deep audit, JPG elimination, CSS consolidation, ship-page.css rollout, guardrail, docs | COMPLETE | 2026-01-31 |
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
