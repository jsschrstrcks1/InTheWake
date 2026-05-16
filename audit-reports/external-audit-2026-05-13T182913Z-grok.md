# External Audit — 2026-05-13T182913Z

**Reviewer model:** `grok` (role: `challenge`)
**Branch:** claude/review-docs-accessibility-EyIuC
**Commits reviewed:** origin/main..HEAD (34)
**Rule applied:** `careful-not-clever` v1.8.1-alpha — Claim-Evidence Discipline

## Reviewer output

ModuleNotFoundError: No module named '_cffi_backend'
thread '<unnamed>' panicked at /usr/share/cargo/registry/pyo3-0.20.2/src/err/mod.rs:788:5:
Python API call failed
stack backtrace:
note: Some details are omitted, run with `RUST_BACKTRACE=full` for a verbose backtrace.
[adapters] gemini: Load error: Python API call failed
[adapters] Loaded: gpt, grok, perplexity, youdotcom
Consulting grok as challenge...
{
  "analysis": {
    "findings": [
      {
        "id": "FINDING 1 \u2014 SEVERITY: HIGH",
        "commit": "b3523629 (B1.2: root-cause + fix sw.js warmPrecache [object Object] 404s)",
        "claim": "The fix in sw.js:warmPrecache() ensures that the precache is correctly populated without 404 errors for [object Object].",
        "evidence_gap": "The regression test in tests/playwright/tools-smoke.spec.js only asserts that there are zero requests to '/[object Object]' (symptom-level check). There is no positive assertion that the precache contains the expected number of entries (e.g., 64 manifest entries as mentioned in the commit message) or that the original intent of warmPrecache (fully populating the cache) is met. This violates the 'Outcome \u2265 Symptom' rule of careful-not-clever v1.8.1-alpha.",
        "required_evidence": "Extend the regression test to include a positive assertion checking the state of the precache cache after warmPrecache completes, such as verifying the presence of the expected 64 manifest entries via a direct cache inspection or a logged count in the service worker."
      },
      {
        "id": "FINDING 2 \u2014 SEVERITY: MEDIUM",
        "commit": "5e0f9dad (B1: image-reuse-guardrail allowlist + about-us disclosure + [object Object] notes)",
        "claim": "The image-reuse-guardrail allowlist correctly downgrades specific patterns from CRITICAL/ERROR to INFO for same-entity reuse.",
        "evidence_gap": "While the commit mentions verification of the audit scanner and pre-commit hook behavior, there are no adversarial fixtures for negative cases (inputs that should still be rejected as CRITICAL/ERROR) to prove the allowlist isn't overly permissive. This violates the 'Adversarial Fixtures for Safety Logic' rule of careful-not-clever v1.8.1-alpha. The commit lacks evidence of testing cases outside the allowlisted patterns.",
        "required_evidence": "Add test fixtures with at least one negative case per allowlist pattern (e.g., cross-slug reuse outside the same-entity rule, non-matching filename roots for authors\u2194articles, non-FOM ship reuse) and verify that these are still flagged as CRITICAL/ERROR by the scanner and pre-commit hook."
      },
      {
        "id": "FINDING 3 \u2014 SEVERITY: HIGH",
        "commit": "2f772b01 (external-audit automation + apply Grok findings 1/3/5; disposition 2/4/6)",
        "claim": "The 1500ms buffer in tools-smoke.spec.js is justified as a 50% margin over the observed ~1s worst case on localhost.",
        "evidence_gap": "The justification for the 1500ms buffer is environment-specific (localhost server) and lacks disclosure of environments it wasn't validated against (e.g., CI, slower hardware, or production-like setups). This violates the 'State over Timeout' rule of careful-not-clever v1.8.2, which requires timeouts to name validated and unvalidated environments. Additionally, there\u2019s no evidence of testing the buffer\u2019s robustness across varied conditions.",
        "required_evidence": "Document in the test file which environments the 1500ms buffer was validated against (e.g., localhost with specific hardware) and which it wasn\u2019t (e.g., CI, mobile devices, high-latency networks). Ideally, replace the timeout with a state-based check (e.g., a service worker event confirming precache completion) or justify a 2x worst-case margin with broader environment testing."
      },
      {
        "id": "FINDING 4 \u2014 SEVERITY: MEDIUM",
        "commit": "679eec27 (adversarial-review skill: external-audit on demand, part of orchestra)",
        "claim": "The adversarial-review skill enforces a trust boundary by preventing the engineer from softening the prompt.",
        "evidence_gap": "The evidence provided (external-audit.sh constructing a fixed heredoc template and SKILL.md guardrails) does not verify whether indirect manipulation (e.g., commit message crafting to bias the review) could influence outcomes. This is a gap under careful-not-clever v1.8.2, as noted in the commit\u2019s own referenced Grok finding G2 (trust boundary not tested for indirect manipulation). No test or simulation of potential manipulation is provided.",
        "required_evidence": "Simulate a scenario where an engineer attempts indirect manipulation (e.g., crafting commit messages to downplay issues) and verify that the fixed prompt still elicits critical findings from the reviewer model. Document this as evidence in the claim-evidence table."
      },
      {
        "id": "FINDING 5 \u2014 SEVERITY: LOW",
        "commit": "c9df21f9 (plan: merge verified-wheat from external review, reject verified-chaff)",
        "claim": "Every claim from the external review was verified against the actual repo per careful-not-clever v1.8.2.",
        "evidence_gap": "The commit lists specific 'wheat' and 'chaff' items but provides no claim-evidence table with specific artifacts (e.g., file:line references, grep outputs) to support the verification process for each item. This violates the 'Required Artifact' rule of careful-not-clever v1.8.2, as vague assertions like 'verified true' or 'verified false' are insufficient without concrete evidence citations.",
        "required_evidence": "Include a claim-evidence table citing specific artifacts for each verified 'wheat' and 'chaff' item (e.g., exact grep commands and outputs for audio gap, file:line for VARK clarification) to demonstrate the verification process against the repo."
      },
      {
        "id": "FINDING 6 \u2014 SEVERITY: MEDIUM",
        "commit": "63930dc3 (audit: refresh stale counts with 2026-05-12 verified numbers)",
        "claim": "Port Validation counts are still using 2026-03-02 figures because no recent dashboard exists.",
        "evidence_gap": "The commit flags the need for a fresh `node admin/validate-port-page-v2.js` run but does not disposition this anomaly with a root cause or an explicit 'accepted risk' note per the 'Anomaly Disposition' rule of careful-not-clever v1.8.1-alpha. Simply noting the staleness without action or reasoning is insufficient.",
        "required_evidence": "Document why the fresh run wasn\u2019t performed (e.g., time constraints, tool unavailability) and explicitly state the accepted risk of using stale data, or run the validation command and update the counts with the output."
      }
    ],
    "verdict": "Hire me \u2014 I would have caught the outcome-vs-symptom gap in b3523629, the missing negative fixtures in 5e0f9dad, and the environment-specific timeout justification in 2f772b01."
  },
  "proposed_update": "Require immediate action on HIGH severity findings (b3523629 and 2f772b01) by updating the respective tests to include positive outcome assertions and environment-agnostic timeout justifications. For MEDIUM findings, schedule follow-up commits to address negative fixtures (5e0f9dad), trust boundary testing (679eec27), and anomaly disposition (63930dc3). For LOW findings, add claim-evidence tables with specific artifacts in future documentation commits (c9df21f9).",
  "risks": "Failure to address HIGH findings risks shipping partial fixes (e.g., symptom-only fixes in b3523629) or brittle tests (e.g., timeouts in 2f772b01) that fail in untested environments. MEDIUM findings risk overly permissive safety logic or unverified trust boundaries, potentially leading to subtle bugs or biases. LOW findings risk documentation gaps that obscure verification processes for future reviewers.",
  "confidence": 0.9
}

--- Usage: grok-3 | in=17680 out=1681 | $0.0783 ---

## How to triage these findings

Per the careful-not-clever anomaly-disposition rule, each finding must be either:

1. **Fixed** before next commit, OR
2. **Accepted as risk** with explicit justification (and a tracking entry in `admin/UNFINISHED_TASKS.md`)

"Probably a manufactured finding" is not a disposition. Engage each one.
