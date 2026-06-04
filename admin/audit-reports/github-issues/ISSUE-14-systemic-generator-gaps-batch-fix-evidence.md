# [Architecture / Generator Gap] 61+ post-hoc batch-fix and fix scripts reveal systemic failures in generators, validators, and standards enforcement

**Labels:** critical, architecture, generator, technical-debt, validator

## Summary

As of 2026-05-28, the repository contains **61** `batch-fix-*` and `fix-*` scripts in `admin/`. These scripts repeatedly apply the same classes of structural, data, and standards fixes to hundreds of pages *after* generation.

This is not normal maintenance. It is strong evidence that the core content generation pipeline (generators + data models + validators) is failing to produce compliant output by construction.

## Evidence

### 1. Raw volume (2026-05-28)
- 61 total scripts identified via `find admin -name 'batch-fix-*' -o -name 'fix-*'`
- 39 of them include the project-standard `Soli Deo Gloria` header (indicating they were written under current conventions).

### 2. Clear recurring problem classes (from script headers and purposes)

**Ship pages (especially Carnival and legacy lines):**
- 8+ versioned Carnival ships batch fixes (v1 → v8) covering structure, sections, dining, images, logbook ordering, missing elements, intro/recent rail, etc.
- Repeated stats fallback enhancements
- Multiple siblings / ai-breadcrumbs fixes
- Stub page completion

**JSON-LD / Structured Data:**
- Multiple Organization JSON-LD batch fixes (v1, v2, v3)
- Review JSON-LD batch fix

**Port pages:**
- Large cluster of `fix-port-*` scripts (structure, images, missing sections, ordering, FAQ/gallery, layout, canonical URLs, etc.)
- Several "port-to-pass" and "port-remaining" comprehensive fixers

**Images & Media:**
- Placeholder image fixes
- Venue image duplication
- Port image path restructuring
- Lazy loading additions
- Wrong credits fixes

**Navigation & Rails:**
- Recent-rail / nav-top elements
- Multiple article rail fixes (including specific "25 venue pages" and general port fixes)
- Authors rail context fixes
- Various conversion scripts (from-the-pier, transport-costs, collapsible sections)

**Other recurring themes:**
- Section ordering to match standards (multiple scripts)
- Data attributes
- Analytics injection
- Canonical URL fixes

### 3. Versioned sequences are a red flag
The existence of `batch-fix-carnival-ships-v2` through `v8`, multiple `org-jsonld-v*`, and several "port-remaining" / "port-to-pass" iterations shows incremental patching rather than root-cause fixes in the generators.

## Impact

- Extremely high maintenance burden and cognitive load.
- High risk of inconsistency (different scripts solve overlapping problems differently).
- Strong indication that new content is routinely shipped with known classes of defects.
- Directly contradicts the project's core philosophy ("build correct output by construction" via strong generators + validators + standards).
- The same problems keep recurring across different page types and cruise lines.

## Root Cause Hypothesis (to be validated in further audit work)

The generators and data pipelines were built incrementally without sufficient shared components, validation at write time, or enforcement of the evolving `new-standards/`. Over time, the surface of required elements grew faster than the generators were updated, leading to this large body of corrective scripts.

## Suggested Scope for Resolution

1. Comprehensive categorization and root-cause analysis of the 61 scripts (already in progress).
2. Identify the top 6–8 recurring defect classes.
3. Drive permanent fixes into the canonical generators, shared partials/components, data models, and pre-write validators.
4. Add generator-level and pre-commit checks that make these classes of errors impossible to introduce again.
5. Deprecate or consolidate the historical fix scripts once the root causes are addressed.
6. Update documentation and team process to treat new one-off fix scripts as a process failure signal.

## Related

- Existing GitHub issues from this audit:
  - #1702 (this finding in draft form)
  - #1703 (generator /ships.html violations)
  - #1701 (generator duplication)
- Main audit report: `CODEBASE_AUDIT_2026-05-27-GITHUB_ISSUES.md`

**Soli Deo Gloria.**