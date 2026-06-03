# [Architecture/Technical Debt] Proliferation of 50+ one-off `batch-fix-*` and `fix-*` scripts indicates missing generator and pipeline coverage

**Labels:** technical-debt, architecture, generator, maintenance-burden, high-priority

## Summary

The `admin/` directory contains at least 58 separate `batch-fix-*` and `fix-*` scripts (as of 2026-05-28). These scripts repeatedly patch the same classes of problems (port structure, images/attribution, sections, JSON-LD, navigation, stats fallbacks, etc.) across hundreds of pages after the fact.

This volume of post-hoc repair scripts is strong evidence that the generator layer, data pipelines, and validator enforcement are not catching (or preventing) these issues at creation time.

## Evidence

**Raw inventory (2026-05-28, via `find` on current source):**

- 25+ `batch-fix-*.js`, `.py`, `.cjs` files, including versioned sequences such as:
  - `batch-fix-carnival-ships-v2.js` through `v8.js`
  - `batch-fix-org-jsonld-v2.js`, `v3.js`
  - `batch-fix-port-remaining.cjs`, `batch-fix-port-remaining-v2.cjs`
  - Many others: `batch-fix-msc.py`, `batch-fix-port-structure.cjs`, `batch-fix-universal.js`, `batch-fix-stats-fallback.js`, `batch-fix-missing-sections.js`, etc.

- 30+ `fix-*.py`, `.js`, `.cjs`, `.mjs` files, including:
  - `fix-all-port-images.py`, `fix-port-image-paths.py`, `fix-venue-images.js`, `fix-venue-image-duplication.js`
  - Multiple `fix-port-*` scripts (layout, ordering, missing sections, logbook markers, etc.)
  - `fix-placeholder-images.py`, `fix-jsonld-schemas.js`, `fix-section-order.mjs`, etc.

Full list captured in the main audit report (`CODEBASE_AUDIT_2026-05-27-GITHUB_ISSUES.md`, Resumption section, 2026-05-28).

## Impact

- High ongoing maintenance burden.
- High risk of inconsistency (different fix scripts can diverge in how they solve the "same" problem).
- Evidence that core standards and data models are not being enforced at the point of content creation.
- Directly contradicts the project's philosophy of building correct output by construction via strong generators + validators.
- Many of these scripts appear to be re-attempts to fix problems that the generators and validators should have prevented.

## Root Cause Indicators (observed patterns)

- Repeated versioned scripts (`-v2`, `-v3`, ... `-v8`) suggest incremental patches rather than root-cause fixes in the generators.
- Large numbers of narrow, page-type-specific fix scripts (especially around ports and venues) point to incomplete or brittle generator logic.
- The existence of these scripts is itself listed as a "Next Area to Audit" in the May 2026 codebase audit.

## Suggested Scope for Resolution

- Comprehensive audit of why so many post-creation fixes are required (this audit is already in progress).
- Identify the top 5–7 recurring problem classes and drive fixes into the canonical generators + validators + data models instead of more patch scripts.
- Add generator-level and pre-commit enforcement so that the same classes of errors cannot be introduced again.
- Consider deprecating or consolidating the older fix scripts once root causes are addressed.
- Update documentation and onboarding to make clear that new content issues should be fixed in the pipeline, not via new one-off scripts.

## Related

- Main codebase audit report: `admin/audit-reports/CODEBASE_AUDIT_2026-05-27-GITHUB_ISSUES.md` (Resumption section, May 28 2026)
- Existing drafts: ISSUE-10, ISSUE-11 (generator standards leakage)
- The large number of `batch-fix-nav-*` and similar scripts already referenced in earlier generator duplication findings

**Soli Deo Gloria.**