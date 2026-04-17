# Validator Spec — Changelog

All notable changes to the spec itself (not to individual rules) are logged here.

Follow Keep-a-Changelog format. Semver on the spec's own version number (`README.md` header).

---

## [0.15.0] — 2026-04-16 — Phase 3 batch 1: LOG family (5 rules)

### Added
5 LOG-family rules from `LOGBOOK_ENTRY_STANDARDS_v2.300.md` and `LOGBOOK_AUDIT_2026-02-05.md`:
- **LOG-001** (warn, S-only, llm-review): 6-movement narrative anatomy
- **LOG-002** (warn, S-only, ORPHAN): `## Full disclosure` section required (1% compliance per audit)
- **LOG-003** (warn, S-only, ORPHAN): 7-section spine includes Accessibility + Female Crewmate
- **LOG-004** (warn, S-only, llm-review): emotional pivot must not be flattened (CLAUDE.md NEVER rule)
- **LOG-005** (error, V+S-agree): no brochure/sales language in logbook (FORBIDDEN_PATTERNS in port validator)

LOG-001/004 are llm-review (voice-audit detects during editorial review).
LOG-002/003 are pure orphans — described in standards, no validator enforces.
LOG-005 is V+S-agree — both port validator forbidden-patterns and LOGBOOK_ENTRY_STANDARDS enforce it.

Totals: 120 → 125 rules. LOG 0 → 5. Orphans 6 → 8.
Spec version 0.14.0 → 0.15.0.

---

## [0.14.0] — 2026-04-16 — Phase 2 batch 10: PROOF family (5 rules)

### Added
5 PROOF-family rules from `.claude/skills/publication-proofreader/SKILL.md`:
- **PROOF-001** (warn, S-only, llm-review): curly quotes over straight quotes
- **PROOF-002** (warn, S-only, llm-review): em-dashes not double-hyphens
- **PROOF-003** (warn, S-only, llm-review): no double spaces after periods
- **PROOF-004** (info, S-only, llm-review): proper ellipsis character
- **PROOF-005** (error, V+S-agree): no placeholder text (Lorem ipsum, TBD, TODO, Coming soon)

PROOF-001 through PROOF-004 are `implementation: llm-review` — detected by the proofreader skill during editorial review, not by a regex validator. PROOF-005 is V+S-agree because the port validator's forbidden-pattern list (lines 284-300) and CLAUDE.md's "NEVER" list both catch placeholder text.

Totals: 115 → 120 rules. PROOF 0 → 5. No new orphans/conflicts/backfill.
Spec version 0.13.0 → 0.14.0.

---

## [0.13.0] — 2026-04-16 — Phase 2 batch 9: SEC family extraction

### Added
- 6 new SEC-family rules extracted from `.claude/standards/javascript.yml` (JS security rules declared there; validation is run via post-write-validate.sh grep patterns).

### Rules added
- **SEC-001** (error, V+S-agree): no `eval()` in JavaScript
- **SEC-002** (error, V+S-agree): no `debugger` statements
- **SEC-003** (warn, V+S-agree): no `console.log` in production (admin/dev/test exempt)
- **SEC-004** (warn, V+S-agree): `innerHTML` assignment requires XSS sanitization review
- **SEC-005** (error, V+S-agree): no hardcoded API keys or secrets
- **SEC-006** (error, V+S-agree): no `document.write()` in production

### Notes
- All six rules are V+S-agree because the standards YAML both declares the rule and provides the regex pattern — code and standards align by construction.
- The audit report AUDIT_REPORT_2025_11_19 found 12 instances of console.log in production that SEC-003 would now flag.
- No new orphans, conflicts, or backfill entries this batch.

### Spot-check
- SEC-001 line 80-87 (eval rule YAML declaration): confirmed

Totals: 109 → 115 rules. SEC 0 → 6. Backfill 40 (unchanged). Orphans 6 (unchanged).
Conflicts: 0 unresolved, 6 resolved.

Spec version 0.12.0 → 0.13.0. find-orphans.cjs exits 0.

---

## [0.12.0] — 2026-04-16 — Phase 2 batch 8: MOB family extraction (with ID renumbering for validator alignment)

### Added
- 7 new MOB-family rules (MOB-001, MOB-002, MOB-003, MOB-004, MOB-006, MOB-007, MOB-008), extracted from `admin/validate-mobile-readiness.js`. Rule IDs align with the validator's internal emitted IDs for direct grep-ability.

### Changed (ID renumbering — careful-not-clever correction)
- **MOB-001 (Phase 1 scaffold) → MOB-005.** The Phase 1 scaffold assigned MOB-001 to the touch-target rule, unaware that validate-mobile-readiness.js emits its own internal MOB-NNN IDs — with MOB-001 already meaning the viewport-meta check. The spec should align with validator output for grep-ability. Fix:
  - `git mv rules/MOB-001.md rules/MOB-005.md` (preserves history)
  - Updated front-matter id, added a "Renumbering note" section explaining the change
  - Updated A11Y-003 cross-reference from MOB-001 to MOB-005
  - Added a note in A11Y-003 that viewport presence is also tracked by validator as MOB-001

This is the sort of retroactive correction the "careful, not clever" guardrail exists to surface — a spec-level consistency decision made late but before the wrong ID propagated further.

### New rules (all V+S-agree unless noted; all cite validator's matching internal ID)
- **MOB-001** (error): viewport meta present with `width=device-width` + `initial-scale=1` (lines 85-135)
- **MOB-002** (warn): no inline widths > 480px (lines 140-175)
- **MOB-003** (warn): hero image container prevents overflow (lines 180-228)
- **MOB-004** (warn): wide tables have overflow-x strategy (lines 240-300)
- **MOB-005** (warn): touch targets >= 44×44 CSS px (lines 301-362) — renamed from old MOB-001
- **MOB-006** (error): no horizontal scroll root causes (lines 380-440)
- **MOB-007** (warn): minimum font-size 15px (lines 455-510)
- **MOB-008** (info, V-only): mobile-hardening CSS section present in shared stylesheet (lines 510-553)

### Drift findings
- The MOB ID collision is the exact failure mode the spec catalog exists to catch: scaffold-era arbitrary IDs drifting from validator output. Fixing early is cheap; fixing after dozens of downstream references would be painful. Noted in rule file history.

### Spot-checks
- MOB-001 line 85-135 (checkViewportMeta): confirmed
- MOB-006 line 427 (MOB-006 BLOCKING severity): confirmed

Totals: 102 → 109 rules. MOB 1 → 8. Backfill unchanged (40 — MOB-008 added to V-only with backfill). Orphans: 6 (unchanged). Conflicts: 0 unresolved, 6 resolved.

Spec version 0.11.0 → 0.12.0.

---

## [0.11.0] — 2026-04-16 — LINK-001: ship→venue reference integrity gap

### Added
- **LINK-001** (warn, S-only, ORPHAN): ship-page venue references must resolve to existing venue pages.

### Context — scale finding
User (2026-04-16): "Thousands of failing and missing venues. Maybe as many as ten per ship on average." Ship fleet is 295 pages × ~10 referenced venues = ~2,950 venue slots. Venue catalogue is 472 pages. Unique-venue reference gap is likely in the hundreds to low thousands when computed properly (unique venues × ship-presence, deduplicated).

VENUE-009/010/011 capture debt on the 472 pages that DO exist. LINK-001 captures the larger invisible debt: pages that SHOULD exist but don't. Without a rule to surface the gap, it stays off the spec's radar.

### Reports
- Rules: 101 → 102. Orphans: 5 → 6. Backfill, conflicts: unchanged.

Spec version 0.10.0 → 0.11.0.

---

## [0.10.0] — 2026-04-16 — Phase 2 batch 7: VENUE family extraction

### Added
10 new VENUE-family rules (VENUE-002 through VENUE-011), extracted from:
- `admin/validate-venue-page-v2.js` T01/T02/T05/T08/S04/S06/W06/W08 check handlers
- Venue style taxonomy at lines 123-228 (NO_RESERVATION_FAQ_STYLES, GENERIC_FAQ_PHRASES)
- 2026-03 venue audit findings (`admin/VENUE_PAGE_AUDIT_2026_03_04.md`) for orphan S-only rules

### Rules added
- **VENUE-002** (error, V-only): required sections (logbook, faq required; menu-prices required for dining styles)
- **VENUE-003** (warn, V+S-agree): menu-prices section must have real prices, not "Varies by venue" placeholder
- **VENUE-004** (warn, V-only): FAQ has >=3 expandable items
- **VENUE-005** (warn, V-only): logbook entries carry ship + date attribution
- **VENUE-006** (warn, S-only, ORPHAN): venue-tags meta required — 453/472 pages missing per audit
- **VENUE-007** (error, V+S-agree): Generic FAQ phrase contamination (specialty-dining template on counter-service/bar/activity venues — 9 pages flagged)
- **VENUE-008** (warn, V-only): meta description coherence — menu/price claims must have matching section
- **VENUE-009** (warn, V+S-agree): "Guest Experience Summary" placeholder review forbidden — 297 pages (63% of fleet)
- **VENUE-010** (warn, S-only, ORPHAN): "Varies by venue" price placeholder forbidden — 187 pages per audit
- **VENUE-011** (warn, S-only, ORPHAN): "Coming soon" ship availability placeholder on active venues — 18 pages per audit

### Orphan list growth
Orphans 2 → 5: added VENUE-006, VENUE-010, VENUE-011 as honest S-only gaps. All three have real pages failing them (from audit), none have validator code yet. These are the highest-priority validator additions for a future V-extraction pass.

### Intentional lint warning
- VENUE-005 marked V-only but cites LOGBOOK_WRITING_GUIDE.md — intentional; the guide is an authoring reference, not a canonical v3.010 standards doc. Same class as SHIP-009, SHIP-011.

### Drift findings
- Venue validator enforces 3 JSON-LD types (WebPage, BreadcrumbList, FAQPage) — less than ship's 7. Already covered by SCHEMA-003/004/005.
- Audit found 297 pages with "Guest Experience Summary" (63% of venue fleet). Highest-count single content debt in the spec so far. VENUE-009 is at warn, correctly — blocking would freeze 297 pages; warn makes the work-queue visible.
- Venue validator's style taxonomy (NO_RESERVATION_FAQ_STYLES, GENERIC_FAQ_PHRASES) is a rich source of future rules. Left unmined in this batch to keep focus.

### Spot-checks
- VENUE-007 line 553-567 (S04 FAQ contamination): confirmed
- VENUE-002 line 370-375 (required sections list): confirmed

Totals: 91 → 101 rules. VENUE 1 → 12. Backfill 37 → 40. Orphans 2 → 5.
No new conflicts. CONFLICTS.md still 0 unresolved, 6 resolved.

Spec version 0.9.0 → 0.10.0. find-orphans.cjs exits 0.

---

## [0.9.0] — 2026-04-16 — Conflict resolutions (A11Y-001 + SHIP-005 user sign-off)

### Changed
- **A11Y-001** decision UNRESOLVED → FINAL. User accepted recommendation: promote port skip-link severity from WARNING to BLOCKING to match ship. Same pattern as IMG-004. Follow-up: port validator line 3729-3730 `warnings.push` → `errors.push`.
- **SHIP-005** decision UNRESOLVED → FINAL. User defined a **three-tier acceptance policy** (more nuanced than my binary keep/remove recommendation):
  1. **Tier 1 — Ideal:** ship-specific dining image (actual dining on this ship)
  2. **Tier 2 — Acceptable:** sister ship of same class (high design fidelity)
  3. **Tier 3 — Last resort (warn):** cruise-line-generic image
  - Cross-line imagery (including the existing Cordelia_Empress_Food_Court.webp) is explicitly rejected. Transition plan: immediate validator change → per-line Tier-3 stopgap → ongoing Tier-3 → Tier-2/1 upgrades as real imagery sourced.
  - Rule file now documents the policy, pseudocode for the validator rewrite, and the relationship to SCHEMA-010's SHIP_CLASSES mapping (reusable for sister-class detection).

### Conflicts state
- 0 unresolved, 6 resolved. All V-S-conflicts caught in Phase 2 have user sign-off.

### Outstanding (tracked in rule files)
Each resolved conflict carries its implementation follow-up in the rule body. Those validator code changes happen as separate work (per plan: spec does not modify validator code). Rules keep `provenance: V-S-conflict` until the code catches up; future commit can transition them to `V+S-agree` and the CONFLICTS.md "Resolved" table becomes history.

### Reports
- `CONFLICTS.md`: 0 unresolved, 6 resolved.
- No changes to rule count, orphans, or backfill queue.

Spec version 0.8.0 → 0.9.0.

---

## [0.8.0] — 2026-04-16 — Phase 2 batch 6: SHIP family extraction

### Added
11 new SHIP-family rules (SHIP-002 through SHIP-012), extracted from `admin/validate-ship-page.js`:
- Section-detection constants at lines 99-146 (REQUIRED_PERSONAS, GOLD_NAV_ITEMS, SECTION_PATTERNS, VALID_SECTION_ORDERS, section word-count constraints)
- Required-sections branching at lines 1104-1107 (active vs TBN)
- Layout checks at lines 1161-1200 (personality-first detection, grid2 firstlook+dining)
- Meta description coherence at lines 1355-1380
- Dining hero check at lines 1421-1445 (the Cordelia V-S-conflict)
- Logbook personas at lines 99-103, 1856-1870
- Swiper config at lines 1554-1570
- Navigation at lines 683-691
- Footer trust badge at lines 2160-2170

### Rules added
- **SHIP-002** (error, V-only): active ship required sections (7-section set)
- **SHIP-003** (error, V-only): TBN ship required sections (6-section set, no logbook)
- **SHIP-004** (warn, V-only): first_look 50-150 words
- **SHIP-005** (error, **V-S-conflict UNRESOLVED**): Cordelia dining hero — the biggest conflict in the spec so far. Validator hard-requires 291/295 pages to use a wrong-ship buffet image; audit findings flag this as a defect. Full implications analysis + strong recommendation to change the validator.
- **SHIP-006** (warn, V-only): logbook personas coverage (7 required categories)
- **SHIP-007** (warn, V-only): first_look + dining grid-2 layout
- **SHIP-008** (warn, V-only): meta description coherence (deck plans / live tracker / video claims must match page content)
- **SHIP-009** (info, V-only): personality-first ordering detection
- **SHIP-010** (warn, V-only): Swiper rewind/loop forbidden
- **SHIP-011** (error, V-only): Internet at Sea link in nav (302-page escape)
- **SHIP-012** (warn, V-only): footer trust badge exact wording

### New V-S-conflict (highest pastoral stakes so far)
- **SHIP-005 — Cordelia dining hero**: Validator enforces that every ship page's dining hero must be `/assets/img/Cordelia_Empress_Food_Court.webp` — a buffet on a budget Indian cruise line that has nothing to do with the ship being documented. `SHIP_AUDIT_FINDINGS.md` correctly identifies this pattern (291 of 295 pages) as a defect. The validator ossified a stopgap into a requirement, so the fix is blocked by the very tool meant to enforce quality.
  - **My recommendation:** change the validator. Remove the Cordelia hard-requirement. Replace with positive rule "dining-hero must exist, be ship-specific, attributed, and pass IMG/ATTR rules."
  - **Pastoral reasoning stressed:** every page currently lies to readers about what the ship's dining looks like. The rule stays in, the lie persists.

### Drift findings
- SHIP-005 is the most revealing drift yet — a validator actively preventing improvement. Classic "validator grew from a single decision" escape.
- The 85-page "missing personas" audit flag (SHIP-006) is a known gap; the rule is WARN so it doesn't block but tracks adoption.
- The 302-page "missing /internet-at-sea.html" (SHIP-011) is a BLOCKING enforcement of a recent nav addition. Most historic ship pages failed; new ones must comply.

### Intentional lint warnings
- SHIP-009 and SHIP-011 carry V-only provenance but cite plan/reference docs (PLAN-validator-emotional-hook.md, SITE_REFERENCE.md). Linter warns "usually V-only pairs with silent; intentional?" — yes, intentional. Those docs aren't canonical v3.010 standards but provide useful context. Warnings left as informational heads-up.

### Spot-checks
- SHIP-005 line 1421-1445 (Cordelia enforcement): confirmed exact quote
- SHIP-011 line 683-690 (Internet at Sea required): confirmed

Totals: 80 → 91 rules. SHIP 1 → 12. Backfill 29 → 37. Orphans 2 (unchanged).
Conflicts: 2 unresolved (A11Y-001, SHIP-005), 4 resolved.

Spec version 0.7.0 → 0.8.0. find-orphans.cjs exits 0 (warnings informational).

---

## [0.7.0] — 2026-04-15 — Phase 2 batch 5: STRUCT + PORT section/word-count rules

### Added
10 new rules extracted from `admin/validate-port-page-v2.js`:
- Section-order / presence constants at lines 260-278 (EXPECTED_MAIN_ORDER,
  REQUIRED_SECTIONS, COLLAPSIBLE_REQUIRED)
- Per-section word-count minimums at lines 1057-1147 (validateWordCounts)

### Rules added (STRUCT)
- **STRUCT-002** (warn, V-only): port page sections match EXPECTED_MAIN_ORDER sequence
- **STRUCT-003** (error, V-only): all 8 REQUIRED_SECTIONS present
  (hero, logbook, cruise_port, getting_around, excursions, depth_soundings, faq, gallery)
- **STRUCT-004** (warn, V-only): 15 COLLAPSIBLE_REQUIRED sections use details/summary pattern
- **STRUCT-005** (error, V-only): total page word count between 2000 and 6000

### Rules added (PORT)
- **PORT-002** (error, V+S-agree): logbook 800-2500 words. Note: LOGBOOK_ENTRY_STANDARDS_v2.300.md
  says "600-1,200 words target" while validator enforces 800-2500. Documented as future cleanup,
  not flagged as V-S-conflict (validator is ground truth; standards doc hasn't caught up).
- **PORT-003** (error, V-only): cruise_port section >=100 words
- **PORT-004** (error, V-only): getting_around >=200 words
- **PORT-005** (error, V-only): excursions >=400 words
- **PORT-006** (error, V-only): depth_soundings >=150 words
- **PORT-007** (error, V-only): faq >=200 words

### Drift findings
- **LOGBOOK_ENTRY_STANDARDS_v2.300.md "600-1,200 words" vs validator "800-2500"**:
  a docs-vs-code discrepancy that could become a V-S-conflict if the user wants the doc
  to win; for now documenting as-is since the doc number feels informally-set and the
  validator number is what's been enforced on hundreds of pages.
- The per-section word-count minimums are entirely validator-policy; standards describe
  section purpose but don't specify word counts. Backfill queue grows.

### Spot-checks
- PORT-002 line 1060 (logbookWords < 800): confirmed
- PORT-005 line 1100 (excursionsWords < 400): confirmed
- STRUCT-003 line 268-271 (REQUIRED_SECTIONS array): confirmed

Totals: 70 → 80 rules. STRUCT 1 → 5. PORT 1 → 7. Backfill 20 → 29.
Orphans 2 (unchanged). Conflicts 1 unresolved (A11Y-001), 4 resolved.

Spec version 0.6.0 → 0.7.0. find-orphans.cjs exits 0.

---

## [0.6.0] — 2026-04-15 — Phase 2 batch 4: A11Y family extraction

### Added
- 13 new A11Y rules (A11Y-002 through A11Y-014), extracted from:
  - `admin/validate-port-page-v2.js` lines 2264-2270, 2044-2080, 2544-2563, 3710-3735, 4580-4586
  - `admin/validate-ship-page.js` lines 994-1021, 1462-1478, 2540-2563
  - `.claude/standards/html.yml` (charset, viewport, lang, heading hierarchy)

### Changed
- **A11Y-001** updated from `V+S-agree` / `decision: FINAL` to `V-S-conflict` / `decision: UNRESOLVED` after discovering severity drift between validators (port WARNING, ship BLOCKING). Follows the IMG-004 pattern. Recommendation included for user review.
- **A11Y-011** corrected from `severity: error` to `severity: warn` to match actual validator code (ship-page-v2.js line 2556 emits WARNING, not BLOCKING). Spec fidelity fix caught during spot-check. Noted future-consideration possibility of promoting to BLOCKING.

### Rules added
- **A11Y-002** (error, V+S-agree): meta charset required
- **A11Y-003** (error, V+S-agree): meta viewport required
- **A11Y-004** (error, V+S-agree): id="main-content" landmark required
- **A11Y-005** (error, V+S-agree): exactly one h1 per page
- **A11Y-006** (warn, V+S-agree): icon-only buttons need aria-label
- **A11Y-007** (warn, V-only, ship): carousel regions need aria-label
- **A11Y-008** (warn, V-only, ship): carousel prev/next nav need aria-label
- **A11Y-009** (warn, V-only, ship): ARIA live region for dynamic announcements
- **A11Y-010** (warn, V+S-agree): breadcrumb nav aria-label="Breadcrumb"
- **A11Y-011** (warn, V+S-agree, ship): SDG footer NOT aria-hidden (226-page escape)
- **A11Y-012** (warn, V+S-agree): consistency — aria-hidden images should have empty alt
- **A11Y-013** (error, V+S-agree): tag balance — opening/closing counts match
- **A11Y-014** (error, V+S-agree): html lang attribute (note: validator gap — enforced via YAML only)

### New V-S-conflict
- **A11Y-001** skip-link severity drift (port WARN vs ship BLOCKING). Same pattern as IMG-004.

### Drift findings
- Port and ship validators disagree on skip-link severity (mirrors IMG-004 disagreement on lazy-loading severity).
- A11Y-014 (html lang) is declared in `.claude/standards/html.yml` but not checked by any of the port/ship/venue validators — a genuine gap where standards speak and validators don't. Noted in rule file.
- A11Y-011 severity in validator (WARNING) is arguably weak given the pastoral importance; documented as future consideration, not changed.

### Spot-checks
- A11Y-001 port line 3729-3730 (WARNING) + ship line 994-996 (BLOCKING): confirmed
- A11Y-004 port line 3726-3728 `missing_main_content`: confirmed
- A11Y-011 ship line 2548-2559 SDG aria-hidden check: confirmed (and caught severity mismatch)

Totals: 57 → 70 rules. A11Y 1 → 14. Backfill 18 → 20. Orphans unchanged at 2. Conflicts 0 unresolved → 1 unresolved (A11Y-001), 4 resolved.

Spec version 0.5.0 → 0.6.0. find-orphans.cjs exits 0.

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
