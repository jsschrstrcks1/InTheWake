# Validator Spec — Changelog

All notable changes to the spec itself (not to individual rules) are logged here.

Follow Keep-a-Changelog format. Semver on the spec's own version number (`README.md` header).

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
