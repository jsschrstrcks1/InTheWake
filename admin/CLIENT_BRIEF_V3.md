# Ship-Page Standardization v3 — Client Brief

**One page. Read this first.**

---

## What you bought in v2 (delivered)

- 290 ship pages audited end-to-end across two validators (139 rules each side).
- 1,009 individual repairs landed across the fleet.
- Per-line config so RCL, Carnival, HAL, MSC, Costa each get their own rules.
- Live dashboard at `audit-reports/ship-validation-dashboard.json`.
- Multi-LLM-challenged policy log (`Vehicle` schema, double-occupancy, image
  thresholds, `page.json` fate, sister-FAQ ceiling) — every decision has a
  committed transcript, defensible to any auditor.

The wiring works. v2 closes 145 of the 290 ship pages out of error state.

---

## What v2 didn't do (and v3 does)

v2 measured itself in errors removed. **A reader doesn't see errors.** v3
re-aims the next phase of work at three things a reader, a search engine, and an
AI assistant *do* see:

1. **Visible quality.** Images sourced, summaries unique per ship, sections in
   the right place, citations on every fact. The page actually looks finished.

2. **Citeable authority.** A "Facts verified 2026-MM-DD" badge and superscript
   citations make InTheWake the source Perplexity, ChatGPT, Gemini, and Claude
   *cite* — not the source they paraphrase. Comparable cruise sites ship
   un-cited marketing copy. We become the primary reference for the category.

3. **Outcome accountability.** v3 captures a GA4 + GSC baseline before any
   work starts. v3 is **not** done when the validators are green; v3 is done
   when ship-page session depth is up 20% and Google's structured-data report
   confirms the new schema is eligible. If the work doesn't move the metrics,
   that's reported, not buried.

---

## What's new in v3

| | v2 | v3 |
|---|---|---|
| Success metric | error count | reader engagement + AI citations + ranking |
| Schema migration | 290 ships at once | 5-ship canary, 14-day GSC observation, then fleet |
| Image sourcing | "Wikimedia or original research" | 5-tier fallback hierarchy, line-coverage audit gates the phase |
| Similarity check | 2003-era TF-IDF | sentence-embeddings, free, local |
| `page.json` | drift validator | build-time HTML generation (drift becomes impossible) |
| Citations | none | per-fact superscript Citation Block + Facts-Verified badge |
| Branch strategy | 8 long-lived branches (will replay v2's 23-conflict event) | trunk-based, ≤72h branches, lock files, 5–10-ship PRs |
| Validator | private | open-sourced as `cruise-page-validator` (authority signal) |
| Recommender | hand-curated sister rails | embedding-powered "similar ships" rail, zero editorial cost |

---

## Outcome contract

v3 ships **only when all 7** are true:

1. 290/290 ships pass both validators.
2. Zero ICP-2 violations.
3. **Ship-page session depth +20%** vs. baseline.
4. **GSC `Vehicle` structured-data valid count ≥ baseline.**
5. **Citation Block + Facts-Verified badge** on every ship.
6. **Validator open-sourced** with one external citation.
7. **Repair runbook** so a fresh agent can re-run any phase.

If 3 or 4 don't land, we report why and propose adjustments. We don't ship a
green dashboard and call it done.

---

## Cost honesty

Two phases have real budget implications. v3 surfaces both before work starts:

- **Image sourcing (138 ships flagged).** v3 runs a 1-day coverage audit per
  cruise line *before* sourcing begins. If a line has near-zero free-licensed
  coverage (Explora Journeys, Cordelia retirees), we surface that as a budget
  decision — press-kit outreach vs. licensed stock vs. branded SVG fallback —
  rather than discovering it on ship 80.

- **Vehicle schema migration.** A 5-ship canary lets us observe Google's
  rich-results behavior before committing the fleet. Reversal cost on canary
  failure: 5 ships × `sed`. Reversal cost on fleet-wide bad migration: a
  catastrophic 290-ship undo with a measurable indexing dip. The canary is
  free; the alternative isn't.

---

## Timeline (single agent, sequential)

- **Days 1–2:** Cross-cutting infra (KPI baseline, locks, regression hook,
  embeddings pipeline). Cheap, blocks nothing later.
- **Days 3–7:** Track A — visible quality (images, summaries, section order,
  citations).
- **Days 5–14:** Track B in parallel — internal consistency, historic
  verification, cross-link engine on embeddings.
- **Day 7 → +14:** Vehicle canary. **Observation window** is the only thing
  that pads the timeline; it's the right thing to do.
- **Day 21:** Fleet-wide Vehicle rollout if canary passes. KPI re-snapshot.
- **Day 22+:** Validator open-source spin-out + final runbook + DoD sign-off.

With three agents lock-coordinated: ~14–18 calendar days plus the 14-day
canary observation, which dominates the wall clock.

---

## What we're asking you to approve

1. **The v3 outcome contract** (7 items above) instead of the v2 "all green" bar.
2. **The 14-day canary delay** before fleet-wide schema migration. This is the
   single largest deviation from "just ship it"; it pays for itself the first
   time it catches a regression.
3. **Image sourcing budget triggered by audit findings**, not estimated up
   front. We'll come back with a number after day 1.
4. **The validator open-source spin-out** as an authority/marketing channel,
   counted toward DoD #6.

The detailed engineering plan is at
[`admin/SHIP_STANDARDIZATION_PLAN_V3.md`](SHIP_STANDARDIZATION_PLAN_V3.md).
The policy log binding all five v2 decisions is at
[`admin/POLICY_DECISIONS.md`](POLICY_DECISIONS.md).
The current fleet scorecard is at
[`audit-reports/ship-validation-dashboard.json`](../audit-reports/ship-validation-dashboard.json).

---

**Soli Deo Gloria.**
