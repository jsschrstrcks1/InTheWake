# Port Validator Hardening — Phase A: Hook + ICP-018 + #1501

**Date:** 2026-05-08
**Branch:** `claude/evaluate-port-auditor-UomSc`
**Predecessor:** `.claude/plan-port-normalization-2026-05-07.md` (this is a tooling-side phase, not a content phase)
**Scope:** Three small, reversible decisions that each touch the whole repo or every future commit. All three are about *enforcement infrastructure*, not port-page content.

---

## Goal

After the merge from `origin/main`, the repo has new image-reuse infrastructure (skill + scanner + pre-commit hook) and two new validator rules (#1500 / #1501) — but they're either inactive (the hook isn't enabled) or scoped to ships only (#1501 doesn't run on port pages). This phase activates the safety net for ports without changing port content.

Every step in this phase is reversible by a single command. None of them rewrites port HTML.

---

## Why this order

| Order | Why |
|---|---|
| **PR A (hook)** first | Smallest change, biggest insurance. One `git config` call. Activates regression-mode pre-commit checking so any subsequent step's mistakes are caught at commit time. Doctrine-aligned: build the safety net before swinging the hammer. |
| **PR B (ICP-018 → ports)** second | Pure validator-code addition (no port HTML changes). Boilerplate detection on `<meta name="ai-summary">` is a pattern match against a closed phrase list. Low edge-case surface; emits warnings only on first pass to allow honest fleet baseline. |
| **PR C (#1501 → ports)** third | Highest edge-case surface (port image filename conventions vary more than ship). Must define exemptions correctly (placeholders, generic gallery filenames). Run last so PR A's hook can catch any regression PR C introduces. |

---

## PR A — Activate `core.hooksPath` for this clone

**What it does:** Sets `git config core.hooksPath .githooks` so that every future commit runs through `.githooks/pre-commit`. The hook in regression-mode skips during merge/rebase/cherry-pick and only blocks NEW failure codes (pre-existing failures stay unfixed but unblocked).

**Files affected:** `.git/config` (per-clone, not committed). Zero repo-tracked changes.

**Verification (per CAREFUL.md "exercise end-to-end"):**
1. Set the config.
2. Stage a clean trivial change (e.g., README whitespace) and commit — should succeed.
3. Stage a deliberately-broken change to a ship page and verify hook rejects it. Then unstage and abandon.

**Reversal:** `git config --unset core.hooksPath`.

**Out of scope:** No code changes. No port-page changes.

---

## PR B — Extend ICP-018 (ai-summary boilerplate) to port pages

**STATUS: skipped 2026-05-08 — fleet-clean baseline**

Pre-flight survey of all 384 port `<meta name="ai-summary">` values found:
- 0 / 384 match any phrase in `ai_summary_boilerplate_phrases` (the ship-curated list).
- The only 4-gram appearing in ≥8 port summaries is "first person logbook guide to" (8 ports, 2%) — the site's voice signature, not boilerplate.
- "paradise" appears in 22 summaries; mild marketing-tell, not actionable.
- No 5-gram appears in 10+ port summaries.

Adding ICP-018 to the port validator with the current phrase list would produce zero detections — a no-op. Per `careful-not-clever` "Anti-Theater Rule: ritual compliance without substance," skipping rather than adding theater.

Re-evaluate when:
- Editorial regenerates port ai-summaries en masse (any new template would be a candidate boilerplate phrase).
- A new template script lands that mass-produces port summaries from a shared pattern.
- An audit run flags newly-introduced repetition in port summaries.

**Net change:** none to validator code; one documented decision in this plan; the boilerplate phrase list in `admin/validator-config.json` remains ship-scoped (correct).

---

## PR C — Extend #1501 (filename ↔ page slug match) to port pages

**STATUS: shipped 2026-05-08**

**Pre-flight survey** (full fleet, with default exemptions):
- 381 port pages scanned, 4,515 port-image references
- 47 / 381 pages flag (12.3%) — well below the 50% abort threshold
- 394 image filenames don't contain the page slug

**Implementation:** `validateImageFilenameSlugMatch` function in `admin/validate-port-page-v2.js`. Severity: **WARNING** (not BLOCKING) — port pages legitimately use POI-named images sometimes (e.g., `place-foch.webp` on Ajaccio's page), so this is a soft signal.

**Exemptions applied:**
- `*placeholder*` filenames
- Site chrome: `compass`, `compass_rose`, `compass_card`, `port-map`, `port-pin`, `ship-map`, `ship-thumbnail`, `logo`, `favicon`, `sprite`, `icon-*`
- Allowlisted asset prefixes: `/assets/social/`, `/assets/brand/`, `/assets/icons/`

**End-to-end verification:**
- `ports/airlie-beach.html` (known-bad): emits warning naming 7 mismatches (`whitehaven-hero.webp` etc.) ✓
- `ports/dubai.html` (known-clean): no filename_slug warning ✓

**Top flagged ports (from pre-flight):**
- antarctic-peninsula (14), costa-maya (13), cabo-san-lucas (6), aitutaki (7), airlie-beach (7), akaroa (7), barbados (7), ajaccio (5), anchorage (2), cozumel (2)

These are NOT auto-fixable — each needs human review to decide whether the image is genuinely this port's (rename) or a reuse of another port's image (replace). Listing them here as the editorial backlog from PR C.

**Reversal:** Single revert commit.

---

## Risk register

| Risk | Mitigation |
|---|---|
| PR A: hook blocks legitimate commits because of pre-existing failures | Regression-mode means only NEW failures block — pre-existing failures don't. Verified by reading `.githooks/pre-commit`. |
| PR B: phrase list false-positives on ports | Read 10 sample ai-summaries before committing; emit WARNING not BLOCKING. |
| PR C: port image filename convention isn't what I think | Read 5 sample port pages first; abort if >50% would flag (signal that the rule itself is wrong for ports). |
| Bundling: change in B/C breaks validator for in-flight port work | Each is a separate commit; PR A's hook (in regression mode) catches new failures introduced by B or C. |

---

## Open questions deferred (not part of this phase)

- Should boilerplate detection for ports promote to BLOCKING, and when? (After baseline rewrite.)
- Should the v2 validator's existing `validatePortImages` (cross-port byte uniqueness) be migrated to use the new `admin/scan-image-reuse.cjs` registry instead of its own hash cache? (Different surface area; separate refactor.)
- Should port pages be added to the v3 ship-validation-dashboard regression scoreboard? (Reporting question; defer.)

---

## Execution sequence

1. **PR A:** activate hook → verify with one negative test → done.
2. **PR B:** read 10 port ai-summaries → write function → test on 3 ports → run on fleet → commit + push.
3. **PR C:** read 5 port pages' image references → write function → test on 3 ports → run on fleet → if convention assumptions hold, commit + push; if not, surface for decision.
4. Final: report fleet-baseline counts for B and C so editorial follow-ups can be scheduled.

*Soli Deo Gloria*
