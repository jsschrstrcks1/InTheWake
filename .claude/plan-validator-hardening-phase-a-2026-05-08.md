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

**What it does:** Adds a `validateAiSummaryBoilerplate` function to `admin/validate-port-page-v2.js`, modelled on the ship-side function at `admin/validate-ship-page.js:3279`. Reads `ai_summary_boilerplate_phrases` from `admin/validator-config.json` (already shared) and warns on substring matches in `<meta name="ai-summary">`.

**Severity choice:** **WARNING** initially, not BLOCKING. Rationale:
- Ship side uses BLOCKING because the editorial baseline there has been worked through.
- Port side hasn't been baselined for this rule yet — going BLOCKING immediately would fail an unknown number of port pages without notice.
- WARNING surfaces the gap honestly without breaking the validator's pass-rate signal for port work in flight.
- Promote to BLOCKING in a future PR once the baseline is rewritten.

**Files affected:**
- `admin/validate-port-page-v2.js` — one new function, one call site, one warnings.push, one results.icp_018 export. ~50 LoC total.
- No port HTML changes.

**Material assumptions:**
- The phrase list in `admin/validator-config.json` is appropriate for ports as well (it's currently ship-curated but the phrases — "the ultimate cruise experience", "offers something for everyone", "represents the perfect" — are generic-cruise tells, not ship-specific). **Verify each phrase against a sample of port ai-summaries before committing.**
- Some phrases may legitimately appear in port content. If so, document and split the list (or add a `port_ai_summary_boilerplate_phrases` config key).

**Verification:**
1. Read 10 sampled port `<meta name="ai-summary">` values; check whether any of the 6 phrases would false-positive.
2. Run validator on the full fleet. Count how many ports get the new warning.
3. Spot-check 3 flagged ports to confirm the matches are real boilerplate.

**Reversal:** Single revert commit.

---

## PR C — Extend #1501 (filename ↔ page slug match) to port pages

**What it does:** Adds a `validateImageFilenameSlugMatch` function to `admin/validate-port-page-v2.js`, modelled on the ship-side bash impl at `admin/validate-ship-page.sh:1719`. For every `<img src="/ports/img/...">` (or wherever ports keep images), normalize the filename and require it to contain the port's slug.

**Severity choice:** **WARNING** initially. Same rationale as PR B — port image filename conventions need a baseline run before promotion.

**Required exemptions (from ship-side rules + port-specific):**
- `*placeholder*` filename
- `compass_rose.*`, `compass.*`, `compass-card.*`
- `port-map.*`, `port-pin.*`
- Any image under `/assets/social/`, `/assets/brand/`, `/assets/icons/` (allowlisted sections)
- Generic gallery scaffolding if any (will discover during baseline run)

**Material assumptions:**
- Port pages reference port-specific images via `/ports/img/<slug>/<slug>-N.webp` convention.
- Year-suffix pattern (`mardi-gras-1972` → match `mardi-gras-*`) doesn't apply to ports — skip that branch for now.

**Files affected:**
- `admin/validate-port-page-v2.js` — one new function, one call site. ~70 LoC.
- No port HTML changes.

**Verification:**
1. Read 5 port pages' image references (one each: gold-standard, hub page, beach port, cold-water port, image-rich port).
2. Run validator on the full fleet. Count how many ports get the new warning.
3. If >50% of ports flag, assume the convention is wrong, abort, surface for editorial decision.

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
