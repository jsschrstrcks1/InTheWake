# Validator Spec — Changelog

All notable changes to the spec itself (not to individual rules) are logged here.

Follow Keep-a-Changelog format. Semver on the spec's own version number (`README.md` header).

---

## [0.2.0] — 2026-04-15 — Phase 2 batch 1: ICP family extraction

### Added
- 15 new ICP-family rules (ICP-003 through ICP-017), extracted from:
  - `admin/validate-port-page-v2.js` (lines 636-900 — the full ICP-2 v2.1 validateICPLite function)
  - `admin/validate-ship-page.js` (lines 511-546, 601-610 — validateICPLiteMetadata + dateModified parity)
  - `admin/validate-venue-page-v2.js` (lines 420-436, 806-815 — T07/W05/T18 meta checks)

### Rules added
- **ICP-003** (warn, V+S-agree): ai-summary length warning under 150 chars
- **ICP-004** (error, V+S-agree): meta description tag present
- **ICP-005** (error, V+S-agree): last-reviewed meta tag present
- **ICP-006** (error, V+S-agree): last-reviewed YYYY-MM-DD format
- **ICP-007** (warn, V-only): staleness warning when >180 days
- **ICP-008** (error, V+S-agree): canonical URL link present
- **ICP-009** (warn, V-only): meta keywords tag forbidden
- **ICP-010** (warn, V-only): geo meta tags forbidden
- **ICP-011** (warn, V-S-conflict, UNRESOLVED): ai-breadcrumbs forbidden vs required — big disagreement between port validator (remove) and ONBOARDING/standards (keep)
- **ICP-012** (error, V-only): duplicate ai-summary tags forbidden
- **ICP-013** (error, V+S-agree): JSON-LD dateModified exact match to last-reviewed
- **ICP-014** (error, V-S-conflict, UNRESOLVED): description ~ ai-summary — port validator relaxed (30% overlap) vs ship validator + docs (exact match)
- **ICP-015** (info, V-only): answer-first first paragraph ≥20 chars
- **ICP-016** (error, V+S-agree): canonical absolute https://cruisinginthewake.com
- **ICP-017** (error, V+S-agree): content-protocol one of accepted values

### Conflicts surfaced
- 3 unresolved conflicts: ICP-002 (dual-cap), ICP-011 (ai-breadcrumbs), ICP-014 (description parity). Each has thorough implications + recommendation. User review needed before Phase 5.

### Backfill queue
- 7 rules now flagged `standards-backfill: yes` (ICP-007, ICP-009, ICP-010, ICP-012, ICP-015, STRUCT-001, VOI-001).

### Notes
- Discovered the ship validator has `duplicate_ai_summary` (ICP-012) but port+venue validators don't. Flagged as drift.
- Discovered the venue validator's T18 canonical-format check is stricter than port's ICP-008. Flagged for propagation to port+ship in Phase 2+.
- Every rule cites real file+line ranges. Zero implementation: none in this batch.

---

## [0.1.0] — 2026-04-15 — Phase 1 scaffold

### Added
- `README.md` — spec overview + authority rules
- `TEMPLATE.md` — rule file template and field-validation contract
- `CATEGORIES.md` — 21 rule families (THEO, ICP, IMG, ATTR, VOI, A11Y, STRUCT, SCHEMA, NAV, MOB, PERF, PWA, SHIP, PORT, VENUE, SEC, LINK, LOG, PROOF, SEO, DATA)
- `CONFLICTS.md` — generated stub
- `ORPHANS.md` — generated stub
- `BACKFILL.md` — generated stub
- `scripts/find-orphans.cjs` — anti-zombie linter
- `scripts/generate-index.cjs` — rebuilds README rule index
- `scripts/generate-conflicts.cjs` — rebuilds CONFLICTS.md
- `scripts/generate-backfill.cjs` — rebuilds BACKFILL.md
- 15 exemplar rules (one per core family), each full-depth

### Notes
- Ground truth is validator code (`admin/validate-port-page-v2.js`, `admin/validate-ship-page.js`, `admin/validate-venue-page-v2.js`, etc.). Standards docs are historical baseline; regeneration in Phase 6.
- User's anti-zombie concern addressed via `find-orphans.cjs` + required `check:` field + visible `ORPHANS.md`.

---

## Pending

- **[0.2.0]** — Phase 2: extract every rule enforced by validator code (~115 V-only + V+S-agree rules).
- **[0.3.0]** — Phase 3: extract every rule described by standards docs but not enforced (~30-50 S-only rules).
- **[0.4.0]** — Phase 4: voice/judgment rules (LLM-review provenance) (~35 rules).
- **[0.5.0]** — Phase 5: conflict reconciliation + user sign-off (all CONFLICTS resolved).
- **[1.0.0]** — Phase 6: `new-standards-generated/` produced, originals archived, references redirected.
- **[1.1.0]** — Phase 7: `find-orphans.cjs` wired into CI / pre-commit.
