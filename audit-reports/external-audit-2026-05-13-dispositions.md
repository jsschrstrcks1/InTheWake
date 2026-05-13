# Grok adversarial review 2026-05-13 — dispositions

**Reviewer:** Grok (grok-3, role: `challenge`, $0.0432, in=5555 out=1768 tokens)
**Audit branch:** `claude/audit-unfinished-tasks-5evPi`
**Commit range:** `bb089d2d..942b1703` (9 commits)
**Rule applied:** careful-not-clever v1.8-alpha (then v1.8.1 after this audit)

Per the anomaly-disposition rule in the Claim-Evidence Discipline, each of Grok's 6 findings must be either fixed, tracked, or accepted-as-risk with explicit justification. "Probably manufactured" is not a disposition.

## Findings + dispositions

### Finding 1 — HIGH — image-reuse-guardrail allowlist has no negative fixtures

**Disposition:** **FIXED.** Added `tests/unit/image-reuse-guardrail/fixtures.test.mjs` with 10 cases: 3 positive (one per allowlist pattern: ship `_root`/line collapse, authors↔articles, FOM convention) + 7 adversarial negatives:

- NEG cross-slug-same-line ship reuse without FOM token → must remain ERROR
- NEG Cordelia pattern (ship from one line as ship from another) → must remain CRITICAL
- NEG different filename roots across authors↔articles → must remain CRITICAL
- NEG cross-section reuse outside the {authors, articles} pair → must remain CRITICAL
- NEG cross-slug-same-line without FOM → must remain ERROR
- NEG FOM ship file reused as port hero → must remain CRITICAL (ships-only allowlist)
- NEG only ONE file matches FOM pattern → must NOT exempt

10/10 pass. The Cordelia-style attack Grok specifically asked to test (variant + other filename for same ship slug) is covered by the cross-slug-different-slug NEG case.

### Finding 2 — MEDIUM — Port Validation refresh has no committed deadline

**Disposition:** **TRACKED — already covered by B6 in batch plan.** `admin/AUDIT_BATCH_PLAN_2026-05-12.md` B6 ("Validator refresh sprint") explicitly includes "Run `node admin/validate-port-page-v2.js` and update Port Validation counts" as item 1 of the batch with ~1 hr effort estimate. Grok missed this on review. The connection from the UNFINISHED entry to B6 is now made explicit in the commit message.

Acceptance reasoning: tracked work is not a gap if the tracking artifact exists at the time the gap is identified.

### Finding 3 — HIGH — Arbitrary 2s wait in regression test

**Disposition:** **FIXED.** `tests/playwright/tools-smoke.spec.js` now waits deterministically for `navigator.serviceWorker.ready` (SW lifecycle reaches 'activated') BEFORE a 1500ms buffer. The buffer is justified inline: the pre-fix WebServer log showed all 64 offending requests landing within ~1s of page load; 1500ms is 50% margin. Comment in the spec flags that future SW changes pushing warmPrecache further out will require revisiting this margin.

The "outcome ≥ symptom" portion of Grok's finding (assert precache is populated) is a separate gap I already self-acknowledged. It is NOT closed by this commit; it's tracked as a known limitation. The smoke spec catches future *reintroductions* of the same bug; it does not prove the cache is fully populated under all conditions.

### Finding 4 — MEDIUM — D3 retirement subjective

**Disposition:** **ACCEPTED-AS-IS with user sign-off.** D3 ("Author expertise callouts") was retired with rationale "vague, no spec." User explicitly approved all 13 drops via the AskUserQuestion response selecting "Triage-first" earlier in the session and then "Do it" (referring to applying drops). Triage choices are owner decisions; the audit cannot force-reverse them.

If reconsidered, recommend re-classifying to KEEP-PASSIVE rather than reactivating. Tracked here so the decision is reversible if user changes their mind.

### Finding 5 — MEDIUM — v1.8-alpha rule missed narrow-claim failure vector

**Disposition:** **FIXED.** `.claude/skills/careful-not-clever/CAREFUL.md` bumped 1.8-alpha → 1.8.1-alpha. The "Limit of this rule" subsection now explicitly distinguishes Misuse Mode A (vague evidence) from Misuse Mode B (narrow claim), names v1.8-alpha itself as the worked example of Mode B (claim "no `/[object Object]` requests" was narrower than actual change scope), and re-scopes the external audit's job: first widen claims back to actual change scope, then verify evidence against the widened claim.

### Finding 6 — LOW — Effort estimates not historically grounded

**Disposition:** **ACCEPTED-AS-FUZZY.** Effort estimates in `admin/AUDIT_BATCH_PLAN_2026-05-12.md` are author guesses, explicitly marked as such ("estimate from the source entry where given; otherwise my best guess"). Re-calibration would require historical commit-time data I don't have. Plan to revisit after B1's actual completion time is recorded against its 3-4 hr estimate.

If a future audit pass wants to harden this, the move is: instrument commit-completion timestamps relative to batch-start, build a baseline, then revise estimates against the baseline.

## Verdict on Grok's verdict

Grok said: "Hire me — I would have caught the missing adversarial fixtures in image-reuse-guardrail (FINDING 1), the incomplete production equivalence in SW fix testing (FINDING 3), and the unaddressed cherry-picked claims risk in the v1.8-alpha rule (FINDING 5)."

Honest scoring against my own work:
- Findings 1 and 5: **genuinely new gaps I did not surface.** Grok earns those.
- Finding 3: **partially new** — the "arbitrary 2s" point was new; the "no outcome assertion" part was already in my self-audit.
- Findings 2, 4, 6: technically correct but covered by other artifacts or accepted with justification.

Grok earned the interview on findings 1 and 5. The other 4 are evidence that the model engages with depth rather than padding.

This pattern is the v1.8.1 external-audit backstop working as intended. The forcing function caught some gaps; the audit caught others.
