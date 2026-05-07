# Port Page Normalization — Outstanding Work Inventory

**Date:** 2026-05-07
**Branch:** `claude/evaluate-port-auditor-UomSc`
**Author:** Session evaluation of port auditor against the fleet
**Predecessor:** `.claude/plan-port-page-normalization-v2.md` (2026-03-27, baseline 370/387 valid — out of date; current sample suggests near-zero pass rate)

> **Goal:** Bring all 388 port pages to the documented gold standard (PORT-PAGE-STANDARD.md / ITC v1.1 + LOGBOOK_ENTRY_STANDARDS v2.300) with consistent structure and content depth.

---

## Tooling Inventory

| Tool | Lines | Role |
|---|---:|---|
| `admin/port-page-audit.cjs` | 614 | Detection-only auditor, 19 detectors (A/B/C categories) — fast smoke test |
| `admin/validate-port-page-v2.js` | 4,964 | Enforcement validator, 55 validators + 4 sub-validator forks, 0-100 score |
| `admin/gold-standard-compare.cjs` | 248 | Structural fingerprint diff vs `ports/dubai.html` |
| `scripts/validate-port-weather.js` | 233 | Weather sub-validator (uses `port-weather-validator-core.js`, 530 lines) |
| `admin/validate-recent-articles.js` | — | Recent Stories rail + ICP-Lite v1.4 sub-validator |
| `admin/validate-poi-coordinates.js` | — | Nominatim-based POI-in-water check |
| `admin/validate-mobile-readiness.js` | — | Mobile responsiveness check |
| `admin/PORT-PAGE-STANDARD.md` | 996 | The standard (ITC v1.1) |
| `.claude/skills/port-page-generator/SKILL.md` | — | Gold standard reference + 21 audit checklist |

**Gold standard divergence:** the documented gold standard is `ports/dubai.html` (skill, comparator), but dubai itself fails the v2 validator (66/100, 2 BLOCKING) and the auditor (1 HIGH). The actual fleet leader on the two sub-validators is `ports/juneau.html` (the only PASS+PASS port).

---

## Current Fleet Status (2026-05-07)

### Auditor (port-page-audit.cjs — 387 ports)
```
Pages with ≥1 issue: 387/387      Total issues: 2,272
A (auto-fix-now):    475          Pages with CRITICAL: 146
B (auto-fix-later):  989          Pages with HIGH:     372
C (flag-for-human):  808          Pages clean (M/L only): 14
                                  Pages flawless: 0
```

### Validator (validate-port-page-v2.js — 25-port sample)
```
Pass rate:  0/25 (0%)
Score range: 26-80  Median: 58
Universal blockers: weather_sub + articles_sub on virtually every page
```

### Weather sub-validator (387 ports)
```
PASS:  2  (juneau, ketchikan)
WARN: 17  (mostly Alaska Tier-1 + a few)
FAIL: 368
```

### Recent-articles sub-validator
```
Pages with #recent-rail-nav-top + nav-bottom: 53 / 384 (14%)
Pages MISSING nav-top OR nav-bottom (would FAIL): 331
```

### Gold-standard structural compare
```
9 / 383 ports match dubai.html's section fingerprint
374 / 383 have structural drift (avg 2.8 differences/page)
```

### Section presence (id-based, 381 port pages)
| Section | Presence | Status |
|---|---:|---|
| hero, logbook, depth-soundings, gallery, faq | 97-99% | core skeleton solid |
| weather-guide, excursions | 91-94% | strong |
| cruise-port, getting-around, from-the-pier | 89-98% | strong |
| credits | 50% | half-missing |
| food | 32% | mostly missing |
| practical | 28% | mostly missing |
| notices | 21% | mostly missing |
| beaches, history, cultural, shopping | 1-16% | optional, rarely used |
| **map (id="map")** | 28% | id schism |
| **map (id="port-map")** | 27% | id schism |
| **map (id="port-map-section")** | 50% | id schism (168 pages) |

### Auditor finding frequency (top 10)
| × | Code | Pattern |
|---:|---|---|
| 382 | B2 | Generic weather copy / wrong-climate FAQs |
| 370 | C4 | Disclaimer level vs registry mismatch |
| 339 | B4 | Generic `og:image` "port-hero.jpg" (87% of pages) |
| 257 | C1 | "[Port] Port Guide" template artifact as proper noun |
| 241 | B3 | USD pricing on non-USD ports |
| 190 | A3 | Substantial content outside `<article>` / `<aside>` |
| 159 | C3 | Same image, different alt texts |
| 99  | A5 | Port links missing `.html` |
| 95  | A4 | Duplicate IDs |
| 36  | A2 | Missing `<h1>` |

---

## Outstanding Work — Phased

### Phase 1 — Mechanical template backfills (high ROI, no content work)

#### PR 1 — Recent-rail pagination markup (~331 pages)  ← **IN PROGRESS this session**
- Insert `<nav id="recent-rail-nav-top">` and `<nav id="recent-rail-nav-bottom">` around `<div id="recent-rail">`.
- Optionally backfill `<noscript>` static story list (akureyri pattern) inside `#recent-rail`.
- **Verifier:** `node admin/validate-recent-articles.js <file>` → PASS
- **Expected fleet impact:** removes 1 BLOCKING from ~331 pages → +10 score per page.
- **Reference template:** `ports/akureyri.html`.

#### PR 2 — Static seasonal-guide weather fallback (~270 pages)
- Insert full noscript template inside `#port-weather-widget`: `class="seasonal-guide"`, `cruise-seasons-grid`, 5 `glance-label`s, 3 seasons, 5 activities, `months-to-avoid`, `catches-list`, `packing-list`, `hazard-warning`, 4 required FAQ topics, FAQPage schema match.
- **Verifier:** `node scripts/validate-port-weather.js <file>` → PASS or WARN
- **Reference template:** `ports/juneau.html`.
- **Hard sub-task:** climate data per port. Expand `PORT_REGISTRY` in `scripts/port-weather-validator-core.js` from 11 to ~388 entries (or generate from existing weather widget JSON / poi-index data).
- **Approach:** region-by-region (Caribbean → Mediterranean → Asia → Pacific → North Atlantic).
- **Expected fleet impact:** removes 1 BLOCKING + ~5-15 noscript warnings from ~270 pages → +20-30 score per page.

#### PR 3 — `og:image` social-image normalization (~339 pages)
- 87% of pages share the generic `og:image: /assets/social/port-hero.jpg`.
- Generate or assign per-port social card at `/ports/img/<slug>/<slug>-hero.webp` (or `/assets/social/<slug>-og.jpg` once generated).
- Update `<meta property="og:image">` and `<meta name="twitter:image">`.
- **Verifier:** auditor B4 finding goes from 339 → 0.
- **Quick mechanical version:** point `og:image` at the existing `<slug>-hero.webp` per port (most have it already at `/ports/img/<slug>/<slug>-hero.webp`).

#### PR 4 — Map ID normalization (~168 pages)
- Pick canonical: `id="port-map"` (matches `ports/dubai.html` and the leaflet init script).
- Rename `id="port-map-section"` → `id="port-map"` across 168 pages.
- Audit the 28% that already use `id="map"` — decide whether `map` and `port-map` are the same section or different and fix the comparator's `portSections` list to match reality.
- Update `gold-standard-compare.cjs` `portSections` array to reflect canonical IDs.

#### PR 5 — Port link `.html` extension fix (~99 occurrences)
- Auditor A5 finding: `href="/ports/<slug>"` should be `href="/ports/<slug>.html"`.
- Likely a single regex sweep; exclude `/ports/img/`, `/ports/css/`, `/ports/js/`, etc.

### Phase 2 — Registry reconciliation

#### PR 6 — Disclaimer registry vs page reconciliation (370 cases)
- 233 pages claim Level 3 (visited) but aren't in `admin/port-disclaimer-registry.json`.
- 107 pages have BOTH Level 1 AND Level 3 disclaimers (CRITICAL contradiction).
- Decide for each: did the author actually visit (add to registry) or revert page to Level 1?
- Cannot be auto-fixed; needs human pass against author's actual travel history.

#### PR 7 — Weather registry expansion (`PORT_REGISTRY` 11 → ~388)
- Currently 376 of 387 ports raise SPEC_REG warning ("port not in registry") — meaning port-specificity checks are silently skipped on 97% of pages.
- Generate entries from `assets/data/maps/poi-index.json` (port name, lat/lon, top POIs as `localAnchors`) + per-region defaults for `climatePattern`.

### Phase 3 — Structural completeness

#### PR 8 — Add quality sections to pages missing them
- 268 pages need `food` section (32% have it)
- 304 pages need `notices` (21%)
- 279 pages need `practical` (28%)
- 192 pages need `credits` (50%)
- These are documented as "optional/recommended" in PORT-PAGE-STANDARD.md but flagged by `validateGoldStandard` as gaps.
- Decision needed: are these BLOCKING or just gold-standard polish?

#### PR 9 — Article scaffold fix (~189 pages)
- A3 finding: substantial content (≥200 chars) outside `<article>` and `<aside>` before `</main>`.
- Indicates orphaned template scaffolding. Likely consistent across pages — diagnose one and templatize.

#### PR 10 — Duplicate-ID cleanup (~84 pages)
- A4 finding: `recent-rail`, `recent-rail-fallback`, `cruise-port`, `getting-around`, `excursions` duplicated.
- Some duplicates are sidebar+main collisions. Some are stray template injections.

### Phase 4 — Content (per-port editorial)

#### PR 11 — Currency localization (~241 pages)
- B3 finding: USD pricing on non-USD ports (≥3 `$` amounts in Depth Soundings/FAQ).
- Needs per-port editorial review; cannot be auto-fixed without local-currency data.

#### PR 12 — Replace generic copy
- 162 pages: "Catches Visitors Off Guard" template list (identical text)
- 161 pages: "Varies by season — check forecast" placeholder
- 27 pages: identical booking guidance paragraph
- 44 pages: "Tap water safety varies" placeholder
- 43 pages: generic "$30-$80 per person" budget line
- All need per-port rewrites with real local content.

#### PR 13 — Image alt-text normalization (~159 pages)
- C3 finding: same image used 2-5× with different alt texts on the same page.
- Choose the best alt or use schema-derived alt; remove duplicates where the image is reused needlessly.

#### PR 14 — Forbidden content cleanup (~17 occurrences)
- "UNMISSABLE", "once-in-a-lifetime", "must-do", "life-changing" (style violations).
- Quick find-and-replace pass.

### Phase 5 — Validator / auditor maintenance

#### PR 15 — Promote a real reference port
- Either fix `dubai.html` to pass its own validators (preferred — it's the documented gold standard), or move references in `gold-standard-compare.cjs` and the `port-page-generator` skill to `juneau.html`.
- **Acceptance bar:** the reference page must pass `validate-port-page-v2.js` (score ≥ 90, 0 BLOCKING) and produce 0 issues from `port-page-audit.cjs`.

#### PR 16 — Auditor parity with the standard
- The auditor checks ~1/3 of what `PORT-PAGE-STANDARD.md` requires.
- Add detectors for: missing JSON-LD types (BreadcrumbList, WebPage with Place mainEntity, FAQPage), missing breadcrumb nav, missing Twitter cards, missing service worker, missing sidebar author card, photo-credit absence, word count below standard minimums.

#### PR 17 — Fix `gold-standard-compare.cjs` map-ID handling
- The comparator hard-codes `id="map"` but real pages use `port-map-section`. Fix the `portSections` array to accept `port-map` / `port-map-section` as equivalent.

#### PR 18 — Move auditor's hardcoded slug lists to JSON registries
- `nonTropicalPorts` (28 inline)
- `hurricanePorts` (~70 inline)
- `usdPorts` (~50 inline)
- These drift silently as new ports are added. Move to `admin/port-climate-registry.json`, `admin/port-currency-registry.json`.

#### PR 19 — Skill drift fix
- `.claude/skills/port-content-builder/SKILL.md` documents legacy section IDs (`overview`, `getting-there`, `must-see`) that no live port uses.
- Either align with `port-page-generator` SKILL or merge the two skills.

---

## Recommended Execution Order

1. **PR 1** (recent-rail pagination, mechanical, 331 pages) ← this session
2. **PR 3** (og:image normalization, mechanical, 339 pages)
3. **PR 4** (map ID normalization, 168 pages)
4. **PR 5** (port link `.html` fix, 99 occurrences)
5. Re-baseline validator → expect ~+30-40 average score swing on the fleet.
6. **PR 2** (static seasonal-guide, region-by-region, the hard one)
7. **PR 7** (weather registry expansion) — bundles with PR 2
8. **PR 6** (disclaimer reconciliation) — needs human input
9. **PR 8-10** (structural completeness — needs decisions)
10. **PR 11-14** (per-port content) — parallel, slow
11. **PR 15-19** (tooling / skill maintenance) — interleaved as bugs surface

---

## Open Questions for User

1. **Promote juneau as the gold-standard reference, or fix dubai?** Dubai has the better logbook narrative but worse infrastructure; juneau has both sub-validators passing but a less iconic narrative.
2. **Are food/notices/practical/credits BLOCKING or recommended?** PORT-PAGE-STANDARD.md says optional/recommended; `validateGoldStandard` warns. If BLOCKING, that's another ~280 pages of structural work.
3. **Disclaimer reconciliation: who's the source of truth?** Author's actual travel history, or pages-as-they-stand?
4. **Should the auditor be expanded** to match the validator (PR 16), or kept lean as a fast smoke test?

---

*Soli Deo Gloria*
