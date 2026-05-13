# UNFINISHED_TASKS audit plan — 2026-05-12

**Branch:** `claude/audit-unfinished-tasks-5evPi`
**Method:** careful-not-clever Layer 1 — read in-session, confirm current state, identify material assumptions, no memory reliance.

This document is the plan you asked for. It captures what the 2026-05-12 audit found, what it moved, what it left open with rationale, and a sequenced recommendation for the remaining work.

---

## Part 1 — What this audit pass already shipped

Two commits to `claude/audit-unfinished-tasks-5evPi`:

### Batch 1 — `bb089d2d` (9 items)
Items marked `✅`, `DONE`, or `IN PR` in UNFINISHED_TASKS but never moved.

| # | Item | Verifying commit | Verifying test |
|---|---|---|---|
| 1 | Phase 3.2b ai-summary cleanup (36 ships) | `f6e23318` / merged in PR #1497 (`01cc9ab4`) | audit log `audit-reports/ai-summary-rewrites/_phase3-2b-batch-2026-05-09.md` |
| 2 | Phase 3.2c ai-summary cleanup (26 ships) | `f88f3099` / merged in PR #1480 (`46596673`) | audit log `audit-reports/ai-summary-rewrites/_phase3-2c-batch-2026-05-09.md`; fleet-wide boilerplate count = 0 |
| 3 | Tipping Calc P1 — per-child age inputs | `747eec6c` + `2262eb47` | `calc.test.mjs:111` + playwright `:84` (`$357 → $238`) |
| 4 | Tipping Calc P1 — Costa/MSC region pricing | `dbb2e4d0` | 25 unit + 10 playwright pass |
| 5 | Tipping Calc P1 — Costa half-rate tier | `2262eb47` | `calc.test.mjs:169` + playwright `:163` (`€231 → €192.50`) |
| 6 | Tipping Calc P2 — Virgin Voyages prepaid/onboard | JSON dual-tier | playwright `$280 / $308` |
| 7 | Tipping Calc P3 — 5 legacy Carnival pages wired | (file edits) | grep: 2 hits per file |
| 8 | Tipping Calc P3 — Playwright tools-smoke baseline | (test file) | `tools-smoke.spec.js` exists |
| 9 | Tipping Calc P2 — 4 tools JS parse errors | `9619a9ae` | 0 hits for `\\${` in repaired files |

### Batch 2 — second sweep (5 items)
`- [x]` strikethrough items missed in batch 1.

| # | Item | Verifying file:line |
|---|---|---|
| 10 | Deck plan links | `ships/rcl/quantum-of-the-seas.html:948,972` (external links to royalcaribbean.com) |
| 11 | Quiz null safety | `ships/quiz.html:2543` (`r.lineData?.colors?.primary`) |
| 12 | Quiz 10-ship cap | `ships/quiz.html:2625` (`Math.max(3, Math.min(10, …))`) |
| 13 | Quiz Comparison Drawer | `ships/quiz.html:1657` (`MAX_COMPARE = 5`) + CSS at 699-799 |
| 14 | GSC setup | UNFINISHED `## Google Search Console Audit (2026-03-27)` section |

**Net effect:** 14 verified-done entries moved to COMPLETED_TASKS.md with verifying evidence; UNFINISHED slimmed by ~80 lines.

---

## Part 2 — Audit scope and what was NOT verified

The 2026-05-12 audit was deliberately narrow-scoped to entries already carrying a "done" marker (`✅`, "DONE", "IN PR", `- [x]`). Items below were **NOT verified** by this audit — their status is whatever the doc says it is, which is not necessarily current truth.

### Not verified — would need a per-item read (estimate: 1-3 hours per category)

- **P0 Flickr ARR attribution audit** — 889 attr.json files in 124 ports. Only `glacier-bay` and `haines` cleaned per the entry. Status of the other 122 ports unknown.
- **P0 HAL/Princess/Celebrity/RCL First Look empty carousels** — 39+ pages listed as deferred. Some may have been fixed since 2026-05-10; would need to re-run the validator.
- **Port Content Repair Queue Tier 3** — 45 ports listed. Tier 1 strikethrough (15 done) and Tier 2 (16/19 done) are still tracked in-place. Tier 3 status unknown.
- **CSS Consolidation** — claim of ~15,626 inline `style=` attributes. Would need a fresh `grep -c "style=" ...` to confirm.
- **Cruise Line Parity Gaps** — table dated 2026-03-02; cruise-line restaurant counts may have moved.
- **Quiz "Run edge case test personas"** — never written down what the personas are.
- **Y-lane items** (Port Reliability Tracker, Dining Search, Stateroom Checker embed, Alaska gaps, FOM photos, DIY comparison expansion, affiliate phase 3, Carnival CTA, ships.html display, Bing/GA setup, dining hero images, Coming Soon pages) — design-phase tasks, no implementation to verify.
- **R-lane items** (Pastoral articles, themed articles) — human-written content, no verification possible by audit.
- **Uncategorized** (cache strategy, FORCE_DATA_REFRESH, header hero size, logo size, solo.html article loading, index.html FAQ positioning, 32 missing port/ship pages) — would need per-item file checks.
- **62 open GitHub issues** — not cross-referenced with UNFINISHED entries.

---

## Part 3 — Recommended sequence

Risk-rated and grouped so each block is one careful-not-clever scope. **Layer 2 (Deep Audit Mode)** auto-fires when modifications exceed 5 files or touch shared CSS/JS, versioning, or canonical standards — flagged below where applicable.

### Lane A — Continue the audit reconciliation (low risk, audit-shaped)
Already on the audit branch. Each item ≤2 hours.

1. **A1: Verify the Tier 3 port content repair queue (45 ports).** Run `node admin/validate-port-page-v2.js` over the 45 ports listed under "Tier 3: Lower-traffic / specialized ports" and check current PASS scores. Mark in-place which still need work vs which have been fixed since 2026-03-02. **Layer 2 fires if validator + doc both touched.**
2. **A2: Verify CSS consolidation metric.** Run `grep -roE 'style="[^"]*"' --include="*.html" . | wc -l` to confirm or update the ~15,626 number. Update the codebase-status table.
3. **A3: Cross-reference open GitHub issues against UNFINISHED entries.** 62 issues; many likely duplicate entries already in the doc (e.g., issue #1465 = Phase 3.5). Reconcile so we have one source of truth per item.

### Lane B — Self-contained P1 fixes (medium risk, scoped)
Each is one fix with one verification path.

4. **B1: Phase 3.5 image-reuse-guardrail allowlist (issue #1465).** Two complementary fixes inside `.claude/skills/image-reuse-guardrail/` (same-entity normalizer + FOM filename allowlist). Test cases that must still fail vs must now pass are documented in the entry. **Effort: 1-2 hours.** Removes the recurring `--no-verify` papercut.
5. **B2: Tipping Calc P3 `[object Object]` 404s.** Smell investigation — find the JS object concatenated into a URL string. Run a single Playwright spec with webserver log tailing, grep for `${...}` URL templates. **Effort: 1 hour or root-cause stalls and goes to follow-up.**
6. **B3: Alaska Cruise Port Gaps — 5 missing pages.** `dutch-harbor`, `nome`, `kake`, `victoria`, `prince-rupert`. Each follows the port template; voice has to actually sail-shaped, not training-data. **Effort: ~1 hour per port if research-backed; 5 hours total.** R-lane risk if pastoral guardrails apply.

### Lane C — Investigation-first items (unknown risk, needs scoping pass)
Do not start without a separate scoping turn — the entry's "Investigation first" note is binding.

7. **C1: Phase 3.6 `cascade_fully_failed` triage (50 ships).** Per the entry, use `systematic-debugging` skill before proposing fixes. Pick 1-2 affected ships, reproduce in browser, instrument the cascade loader, identify failure mode, then plan fix scope. **Layer 2 likely fires** — affects shared cascade script.
8. **C2: P0 HAL/Princess/Celebrity/RCL deferred-blocker carousels.** 4 resolution paths per the entry: TIER 2 placeholder, source authentic photography, loosen validator, fix nieuw-amsterdam.html structure. Each path has different blast radius. Picking a path is a Yellow-lane decision (AI proposes, human approves) since it shapes attribution policy.

### Lane D — High-blast-radius items (require explicit go-ahead)
Recommend NOT starting without a separate user decision.

9. **D1: P0 Flickr ARR attribution audit (889 files, 124 ports).** Documented recommendation: Option B (bulk-delete + flag). One destructive commit, git history preserves everything, ~124 empty galleries until re-sourced. **Layer 3 (Red Team Mode) fires** — guardrail modification + cross-module logic. Wants a dry-run audit list first.
10. **D2: CSS Consolidation.** ~15,626 inline styles to <1,000 target. Shared CSS, fleet-wide visual diff, regression risk on every page. Multi-session sprint. **Layer 3 fires.**
11. **D3: Ship Page Standardization (295 pages).** Carousel markup, section order, hero sizing, version badge. Shared template work, fleet-wide. **Layer 3 fires.**

### Lane E — Content / human-decision items (R-lane)
The pastoral and themed articles are explicit "Human writes" per the task lanes table. Audit can flag them as still pending; cannot author them.

12. **E1-E2: Pastoral articles** (Healing Relationships at Sea ~3,000 words; Rest for Wounded Healers ~2,500 words).
13. **E3-E7: Themed articles** (medical recovery, mental health, family situation, demographic, life transition).

---

## Part 4 — Honest leftovers

This audit pass did NOT:
- Move strikethrough Tier 1 / Tier 2 port table rows. They serve as in-place history — moving them would lose the tier-completion visualization. Tracked in COMPLETED_TASKS.md under "March 2026 — Session 13/14/15" already.
- Move the GSC Audit section (line 190) as a whole. Mixed status: most checks DONE, the "Crawled-Not-Indexed Content Quality Plan" still has open work.
- Move the "Phase 1 (Infrastructure) DONE / Phase 2 (Articles) DONE / Phase 3 (Site-wide) ~99% DONE" Affiliate Link header. The remaining 3 `- [ ]` items underneath are still open.
- Move the "Port logbook narratives ✅ Static HTML" baseline rows in the noscript section. They're current-state assertions used as the noscript-Phase-1 starting reference, not to-do items.
- Verify any item without a clear done-marker. Per the careful-not-clever Anti-Theater Rule, doing so would be claiming rigor without observable evidence.

---

## Recommendation

Pick **A1**, **A2**, or **A3** next if you want to keep extending the audit (low risk, audit-shaped).

Pick **B1** if you want a self-contained P1 fix that removes a recurring papercut.

Pick **C1** if you want to attack the highest user-visible-impact bug remaining (50 ships rendering without specs/amenities/itinerary).

The high-blast-radius lanes (D1, D2, D3) and the human-writes lanes (E*) should not be started without a separate decision — flagging them here so you can sequence them when ready.

---

*Soli Deo Gloria.*
