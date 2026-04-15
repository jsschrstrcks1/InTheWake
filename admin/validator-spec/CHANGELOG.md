# Validator Spec — Changelog

All notable changes to the spec itself (not to individual rules) are logged here.

Follow Keep-a-Changelog format. Semver on the spec's own version number (`README.md` header).

---

## [0.5.0] — 2026-04-15 — Conflict resolutions (user sign-off on 4 V-S-conflicts)

### Changed
All four V-S-conflict rules transitioned from `decision: UNRESOLVED` to `decision: FINAL` per user sign-off. Each rule now carries a `## USER DECISION (2026-04-15)` section naming the resolution + implementation follow-up required.

### Resolutions (user accepted author's recommendation on all four)
- **ICP-002** (ai-summary dual-cap 250/155): promote validator to full dual-cap — standards win. Implementation follow-up: add standalone-sentence check to port validator lines 670-685. Roll out at `warn` first, then `error`.
- **ICP-011** (ai-breadcrumbs forbidden vs required): keep ai-breadcrumbs — standards win. User's original thinking ("crawlers aren't reading them") was correct but incomplete; developers + LLMs reading raw HTML do see the comments and use them. Implementation follow-up: delete lines 753-760 of port validator.
- **ICP-014** (description ~ ai-summary relationship): exact match wins — revert port validator's 30%-overlap relaxation. Ship validator + standards already require exact match. Implementation follow-up: revert port validator lines 847-872 to string-equality.
- **IMG-004** (non-hero loading="lazy" severity): promote ship validator WARNING to BLOCKING to match port. Implementation follow-up: change ship validator line 1514 severity.

### Outstanding (tracked in rule files)
All four resolutions require validator code changes. Those changes are **tracked in the rule files** as "Implementation follow-up" notes but are **not part of the spec work itself** (per plan: "NOT refactoring any validator code"). They will happen as a separate project after Phase 2 is complete.

Rule provenance stays `V-S-conflict` until the validator is updated to match the decision; then a future update can transition each rule to `V+S-agree` and `CONFLICTS.md` will show zero history-preserving "Resolved" entries once the code catches up.

### Reports
- `CONFLICTS.md`: 0 unresolved, 4 resolved (previously 4 unresolved, 0 resolved).
- No changes to rule count, orphans, or backfill queue.

Spec version 0.4.0 → 0.5.0. find-orphans.cjs exits 0.

---

## [0.4.0] — 2026-04-15 — Phase 2 batch 3: IMG family extraction + PERF-001 cleanup

### Added
- 14 new IMG-family rules (IMG-002 through IMG-015), extracted from:
  - `admin/validate-port-page-v2.js` lines 910-980 (hero validation block)
  - `admin/validate-port-page-v2.js` lines 1170-1288 (validateImages main block)
  - `admin/validate-port-page-v2.js` lines 1293-1400 (validatePortImages — directory/placeholder/cross-port checks)

### Changed
- **PERF-001** updated from `implementation: none` (S-only, orphan) to `V+S-agree` with
  real citation (validate-port-page-v2.js lines 1193-1201, `hero_image_loading` check).
  Orphan count 3 → 2. The Phase 1 scaffold documented this rule as unenforced because
  I hadn't yet read the image-validation block; Phase 2 extraction discovered it IS
  enforced. Self-correction noted in the rule file.

### Rules added
- **IMG-002** (error, V+S-agree): figures must have figcaption with credit link
- **IMG-003** (warn, V-only): alt text recommended length ≥20 chars
- **IMG-004** (error, V-S-CONFLICT, UNRESOLVED): non-hero loading="lazy" — port validator
  BLOCKING, ship validator WARNING. Severity disagreement across validators.
- **IMG-005** (error, V-only): minimum 11 images per port page
- **IMG-006** (warn, V-only): maximum 25 images per port page
- **IMG-007** (error, V+S-agree): hero image must be WebP format
- **IMG-008** (error, V+S-agree): hero section inside main
- **IMG-009** (error, V+S-agree): hero section contains img element
- **IMG-010** (error, V-only): hero contains name overlay (h1 or .port-hero-overlay)
- **IMG-011** (error, V+S-agree): page has .port-hero section
- **IMG-012** (error, V+S-agree): port has own image directory
- **IMG-013** (error, V+S-agree): port image directory not empty
- **IMG-014** (error, V+S-agree): placeholder-hash detection — prevents college-fjord
  class of escape. MD5-match against PLACEHOLDER_HASHES set. Grows over time.
- **IMG-015** (error, V-only): cross-port image duplication forbidden (with allowedDuplicates
  exception file)

### New V-S-conflict
- **IMG-004** (loading="lazy" severity) — port validator hard-errors; ship validator
  warns. Recommendation in rule file: promote ship to hard-error for consistency +
  real LCP impact. Counter-argument acknowledged.

### Drift findings
- Port and ship validators disagree on `missing_lazy` severity (BLOCKING vs WARNING).
  Exactly the validator drift the spec exists to surface. See IMG-004.
- Ship validator has its own hero-image requirements (line 1433: "Dining hero must use
  shared Cordelia_Empress_Food_Court.webp") that are ship-specific and deserve their
  own SHIP-family rule next batch. Flagged for follow-up.
- PERF-001 was orphan for one batch (Phase 1) — reminder that orphans should be
  re-examined each batch as new code is read. The orphan list IS working as intended.

### Spot-checks
- IMG-007 line 940 ("Hero image must be in webp format"): confirmed
- IMG-014 line 1355 (`PLACEHOLDER_HASHES.has(hash)`): confirmed
- IMG-005 line 1179 ("minimum is 11"): confirmed

Totals: 43 → 57 rules. IMG 1 → 15. Backfill 12 → 18. Orphans 3 → 2. Conflicts 3 → 4.
Spec version 0.3.0 → 0.4.0. find-orphans.cjs exits 0.

---

## [0.3.0] — 2026-04-15 — Phase 2 batch 2: SCHEMA family extraction

### Added
- 11 new SCHEMA-family rules (SCHEMA-002 through SCHEMA-012), extracted from:
  - `admin/validate-port-page-v2.js` lines 793-825 (JSON-LD parse + required types)
  - `admin/validate-ship-page.js` lines 553-660 (validateJSONLD — 7 required types + Review authenticity)
  - `admin/validate-venue-page-v2.js` lines 443-452 (T-code presence checks for WebPage/BreadcrumbList/FAQPage)

### Rules added
- **SCHEMA-002** (error, V+S-agree): all JSON-LD blocks must parse
- **SCHEMA-003** (error, V+S-agree): WebPage (or TouristDestination for ports) required
- **SCHEMA-004** (error, V+S-agree): FAQPage required
- **SCHEMA-005** (error, V+S-agree): BreadcrumbList required
- **SCHEMA-006** (error, V-only, ship): Organization schema required
- **SCHEMA-007** (error, V-only, ship): WebSite schema required
- **SCHEMA-008** (error, V-only, ship): Review schema required
- **SCHEMA-009** (error, V-only, ship): Person schema required (for Review.author)
- **SCHEMA-010** (error, V+S-agree, ship): Review.itemReviewed class reference must match ship's actual class (motivated by Silver Shadow/Whisper class-name swap escape)
- **SCHEMA-011** (warn, V+S-agree, ship): Review.reviewBody must not contain templated phrases (208 pages flagged in 2026-02 audit)
- **SCHEMA-012** (warn, V-only, ship): any Review.reviewRating.ratingValue is warned as unverified until editorial rubric exists

### Backfill queue growth
- 5 SCHEMA rules flagged V-only, requiring standards backfill (SCHEMA-006 through SCHEMA-009, SCHEMA-012). Ship validator requires 7 JSON-LD types; standards docs haven't documented the full set. Phase 6 must capture.

### Drift findings
- Port validator requires 3 JSON-LD types (WebPage/TouristDestination, FAQPage, BreadcrumbList). Ship validator requires 7. Venue validator checks 3 via T-codes. Different pages, different bars — legitimate per-page-type difference.
- The Review authenticity policy (SCHEMA-011 + SCHEMA-012) is the validator's collected wisdom from 2026-02 audits. Standards docs don't describe it. This is exactly the kind of "validator grew from escapes" content that backfill in Phase 6 must capture.
- The templated-phrase list in SCHEMA-011 (lines 635-639 of validate-ship-page.js) is incomplete. Noted in the rule file as extension work.

Total spec: 32 → 43 rules. Backfill queue: 7 → 12. Orphans: 3 (unchanged — no new implementation:none this batch). Conflicts: 3 (unchanged).

Spec version 0.2.0 → 0.3.0. find-orphans.cjs exits 0.

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
