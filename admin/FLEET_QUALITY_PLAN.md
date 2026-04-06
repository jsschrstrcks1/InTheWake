# Plan: Fleet-Wide Ship Page Quality — All 15 Cruise Lines

## Status as of 2026-04-06

**306 ship pages across 15 cruise lines.** The validator has grown from 113 to ~160 checks this session. 49 GitHub issues are open. We've fixed bugs on ~50 RCL pages but haven't touched the other 255 pages systematically.

---

## The Real Problem

The issues aren't random. They come from **3 root causes**:

1. **Template generation produced bad HTML** — blank variables, wrong grammar, generic data, structural bugs. Fixing pages one-by-one is O(n). Fixing the template is O(1).
2. **The data layer is stale/incomplete** — `venues-v2.json` is 64+ days old, 12% price coverage, 20 ships with zero venue data. Logbook JSONs have wrong guest counts. Stats JSONs have TBD fields.
3. **No regression prevention** — no CI, no pre-commit hooks, no automated validation. Bugs we fix today can return tomorrow.

---

## Fleet Inventory

| Line | Pages | Template Variants | Issues Filed | Validator Coverage |
|------|-------|-------------------|-------------|-------------------|
| **RCL** | 51 | 1 (v3.010) | 26 | Full (~160 checks) |
| **Carnival** | 49 | 4 (A/B/C/D) | 14 | Partial (RCL checks run but miss Carnival-specific bugs) |
| **Holland America** | 47 | Unknown | 0 | Untested |
| **Celebrity** | 30 | Unknown | 0 | Untested |
| **MSC** | 25 | 2 (A: 23, B: 1) | 0 (but 12 new categories found) | Audited — 24/24 fail, Swiper mismatch, duplicate sections, raw class names |
| **Norwegian** | 21 | 3 (A/B/C) | 9 | Partial |
| **Princess** | 18 | Unknown | 0 | Untested |
| **Silversea** | 13 | Unknown | 0 | Untested |
| **Costa** | 10 | Unknown | 0 | Untested |
| **Oceania** | 9 | Unknown | 0 | Untested |
| **Seabourn** | 8 | Unknown | 0 | Untested |
| **Regent** | 8 | Unknown | 0 | Untested |
| **Explora** | 7 | 1 | 0 (but same MSC-era issues) | Audited — 6/6 fail (1e 19w), placeholder sections, no faq-answer class, no favicon |
| **Virgin** | 5 | 1 | 0 (but page title leaks into ship name, class mismatch) | Audited — 4/4 fail (1e 18w), `<title>` suffix "| In the Wake" used as ship name in fact-block/stats/review 9x per page, Lady Class vs Virgin Class |
| **Cunard** | 5 | 1 (MSC-era + QM2 variant) | 0 (but GT/guest discrepancies, grammar, broken carousel) | Audited — 4/4 fail, QM2 carousel class mismatch, triple guest counts on Victoria |

---

## Phase 1: Validator — Make It Fleet-Wide

### 1A. Generalize existing checks (currently RCL-biased)

| Check | Current State | Needed Change |
|-------|--------------|---------------|
| 9ar (grammar) | Checks "a Icon/Oasis/Enchantment..." | Add Excel, Epic, Aqua, Armonia, Opera + any vowel-start class/ship |
| 9e (venues) | Hardcoded to `venues-v2.json` | Add per-line venue data paths if they differ |
| 9au (GT cross-check) | Checks `ships.html` | Need per-line fleet pages or skip if no fleet page |
| 9ay (fleet listing) | Checks `ships.html` | Same — need per-line fleet pages |
| Various dining checks | Assume inline `renderVenues()` | Some lines may use different dining loaders |

### 1B. New checks for Carnival issues (#1351–#1366)

| Check | Issue | Detection |
|-------|-------|-----------|
| **9az** | #1351 | Template variant detection — report which of 4 templates a Carnival page uses |
| **9ba** | #1352/#1360 | Unresolved template variables: `[blank]`, `{{ }}`, empty `<strong></strong>`, `%s` |
| **9bb** | #1353 | "sails from [blank]" — homeport variable not resolved |
| **9bc** | #1364 | Duplicate section IDs on same page |
| **9bd** | #1356 | Footer missing Privacy/Terms/About links |
| **9be** | #1359 | Sister ship year factual errors (cross-check against known data) |

### 1C. New checks for NCL issues (#1341–#1350)

| Check | Issue | Detection |
|-------|-------|-----------|
| **9bf** | #1341/#1349 | Intra-page data conflict: Key Facts guest count vs intro text vs specs |
| **9bg** | #1344 | Dining "coming soon" placeholder |
| **9bh** | #1347 | IMO "TBD" on operational ships (non-TBN, non-future) |
| **9bi** | #1348 | FAQ superlative factual claims without verification |
| **9bj** | #1350 | Empty Logbook and Entertainment sections |
| **9bk** | #1346 | Photo gallery: real captioned photos vs generic placeholders |

### 1D. New checks from MSC + Explora audits (completed)

MSC (24 pages, 2 templates) and Explora (6 pages, 1 template) share the same generation-era issues. All pages fail validation. 12 new issue categories found:

| Check | Issue | Detection |
|-------|-------|-----------|
| **9bs** | Raw class name as text | `ship-class` value used verbatim in prose ("the lead ship of the exceptional") |
| **9bt** | Duplicate section IDs | Same `id=` on 2+ elements (MSC duplicate Deck Plans) |
| **9bu** | Triple guest count inconsistency | 3+ different guest counts on same page |
| **9bv** | JSON-LD FAQ ≠ HTML FAQ text | Generic JSON-LD vs ship-specific HTML answers |
| **9bw** | Swiper version mismatch | CSS @10 in `<link>` but JS fallback loads @11 |
| **9bx** | Missing `page-grid` on `<main>` | Required for 2-column layout |
| **9by** | Missing `no-js` on `<html>` | Required for progressive enhancement |
| **9bz** | Missing favicon/manifest links | No icon, apple-touch-icon, or manifest |
| **9ca** | Missing robots/crawl meta | No robots, googlebot, bingbot meta |
| **9cb** | Duplicate stats sections | Ship Specs + Ship Stats on same page |
| **9cc** | Placeholder section text | "coming soon", "will appear here" |
| **9cd** | Missing LCP preload hints | No `<link rel="preload">` for hero images |
| **9ce** | Carousel class vs init JS mismatch | Carousel container class doesn't match init script selector (Cunard QM2: `photo-carousel` vs `.firstlook`) |
| **9cf** | Page title leaking into ship name | Site name suffix (e.g., "| In the Wake") used as part of ship name in stats JSON, fact-block, review schema. Virgin: 9x per page |
| **9cg** | Entered service date accuracy | Flag disputed dates (Virgin Scarlet Lady: delivered 2020 vs revenue service 2021) |

**Explora-specific finding:** FAQ answers use `class="list-indent"` instead of `class="faq-answer"` — validator FAQ checks don't find them. Need to broaden FAQ answer detection to include both classes.

**MSC fleet summary:** 24/24 fail. Static copyright 23/24. Zero noscript 24/24. Swiper version mismatch 24/24. "exceptional" raw class on 3 World Class pages. Guest count triple-inconsistency confirmed on World Europa.

**Explora fleet summary:** 6/6 identical (1e 19w each). Same template. 4 placeholder sections per page. No `faq-answer` class. No favicon. No robots meta. Stats JSON complete (no TBDs). Guest counts consistent (922). `CruiseShip` JSON-LD schema present (not on RCL).

### 1E-extra. Cunard audit findings

4 ships, 1 template (MSC-era), QM2 has a variant.

| Ship | Errors | Warnings | Unique Issues |
|------|--------|----------|---------------|
| Queen Anne | 1 | 16 | Clean data |
| Queen Elizabeth | 2 | 16 | GT: 90,900 vs 90,901. Guests: 2,068 vs 2,081. 1 TBD field. |
| Queen Mary 2 | 2 | 17 | GT: 149,215 vs 148,528. Guests: 2,691 vs 2,695. "A Ocean Liner" (6x). Carousel uses `photo-carousel` class instead of `firstlook` — **initFirstLook() JS can't find it**, carousel is broken. Empty carousel error is a false alarm — images exist but wrong class. |
| Queen Victoria | 1 | 16 | **3 different guest counts:** 2,014 / 2,061 / 2,081 |

**Cunard-specific new issues:**

| Issue | Impact | New Check? |
|-------|--------|-----------|
| Carousel class mismatch (`photo-carousel` vs `firstlook`) | Carousel JS can't initialize — images exist but Swiper never starts | **9ce**: Detect carousel container that doesn't match the init JS selector |
| "A Ocean Liner" grammar (6 occurrences on QM2) | "Ocean" starts with vowel | Expand 9ar with `Ocean` |
| Triple guest count (Queen Victoria: 2,014 / 2,061 / 2,081) | 3 conflicting numbers destroy trust | Extend 9bu to catch >2 unique guest counts |
| GT off-by-one (Queen Elizabeth: 90,900 vs 90,901) | Subtle but visible | Already caught by 9au for fleet table; need intra-page 9bu for GT too |
| "QM2 Class" as class name | Not a real class designation — should be "Ocean Liner" or "Queen Mary 2 Class" | Same pattern as MSC "exceptional" — 9bs covers it |
| All 4 pages use `class="list-indent"` not `class="faq-answer"` | Same as Explora — FAQ checks can't find answers | Broaden FAQ detection |

### 1E. Cross-line universal checks (new)

| Check | What It Catches |
|-------|----------------|
| **9bl** | Duplicate `<section>` with same `id` anywhere on page |
| **9bm** | Any `<strong></strong>` (empty bold — template variable not resolved) |
| **9bn** | Any visible `{{`, `}}`, `%s`, `${` in body text (template syntax leak) |
| **9bo** | Footer: must have at least Privacy + Terms + About links |
| **9bp** | `<main>` element must exist and contain all content sections |
| **9bq** | Guest count must appear in at least 2 locations and match |
| **9br** | Ship name in `<title>` must match ship name in `<h1>` |

---

## Phase 2: Data Layer Fixes

### 2A. venues-v2.json refresh

- Current: 64+ days stale, 325 venues, 12% price coverage, 29 of 49 RCL ships
- Target: All active ships across all lines, 50%+ price coverage, per-venue `last_verified` dates
- Method: `/investigate` pipeline per ship class (requires fixing the orchestrator first)

### 2B. Logbook JSON audit

- Cross-check every logbook JSON's guest counts against page stats
- Validator check 9ai catches mismatches — run fleet-wide and fix all hits
- Fix wrong ship names in story text (cross-ship contamination)

### 2C. Stats JSON population

- Find all TBD fields on non-TBN pages (validator check 9v)
- Populate from investigation data or authoritative sources
- Ships known to have TBD: Song of Norway, Splendour, Nordic Empress, Sovereign, several TBN ships

### 2D. Fleet listing pages

- `ships.html` has wrong ship counts (#1335) and tonnage discrepancies (#1327/#1329)
- Need per-line fleet pages or a single unified fleet page with correct data
- Build a `validate-fleet-page.sh` or add a `--fleet` mode to existing validator

---

## Phase 3: Fix the Template Generator

### 3A. Identify the generator

- Find what produces ship pages — is it a script, a skill, manual creation?
- The 4 Carnival template variants suggest multiple generation passes
- NCL has 3 groups (Full/Partial/Stub) suggesting progressive generation

### 3B. Fix template bugs at source

- Blank template variables (#1352, #1353, #1360)
- Wrong grammar ("a [vowel]") — fix in template, not per-page
- Generic dining data — template should pull from venues DB, not hardcode
- Missing noscript fallbacks — template should generate them from stats JSON
- Copyright — template should use dynamic JS year

### 3C. Re-generate affected pages

- After template fixes, re-generate Carnival B/C/D pages and NCL B/C pages
- Validate each, diff against existing to preserve curated content
- Use merge-not-replace rules from investigate skill

---

## Phase 4: Regression Prevention

### 4A. Pre-commit hook

```bash
# .git/hooks/pre-commit
for f in $(git diff --cached --name-only | grep 'ships/.*.html$'); do
  bash admin/validate-ship-page.sh "$f"
  if [ $? -eq 1 ]; then
    echo "BLOCKED: $f has validation errors"
    exit 1
  fi
done
```

### 4B. Fleet-wide validation report command

```bash
# admin/validate-fleet.sh — runs validator on ALL ship pages, generates report
bash admin/validate-fleet.sh --report fleet-report.md
```

### 4C. CI integration

- GitHub Action: on PR, validate all changed ship pages
- Block merge if any errors
- Post warnings as PR comment

---

## Phase 5: Investigate Skill Update

### 5A. Line detection

The skill needs to detect cruise line from the subject:
- "MSC Grandiosa" → `ships/msc/msc-grandiosa.html`
- "Carnival Mardi Gras" → `ships/carnival/carnival-mardi-gras.html`
- "Norwegian Encore" → `ships/norwegian/norwegian-encore.html`

### 5B. Per-line reference pages

| Line | Reference Page | Template Standard |
|------|---------------|-------------------|
| RCL | `ships/rcl/allure-of-the-seas.html` | v3.010 full |
| Carnival | TBD (best of Template A) | Needs standardization |
| NCL | TBD (best of Group A) | Needs standardization |
| MSC | TBD (audit in progress) | Unknown |
| Others | TBD | Need audit first |

### 5C. Updated merge rules

- Per-line section names (Carnival uses "Plan Your Cruise", NCL uses different heading patterns)
- Per-line JSON-LD expectations
- Per-line dining data sources
- Per-line sister ship data

### 5D. Updated validator reference

The skill currently documents v3.010.301 checks. Update to v3.010.500+ with all new check categories.

---

## Phase 6: Close GitHub Issues

### Already fixed (can close with commit references):

| Issue | Fix Commit | Status |
|-------|-----------|--------|
| #1308 | `67db122` — dining v2 category mapping | Fixed |
| #1310 | `5ce2dd4` — Spectrum Quantum Ultra Class | Fixed |
| #1311 | `52811bc` — video Swiper retry + fallback text | Fixed |
| #1312 | `67db122` — same root cause as #1308 | Fixed |
| #1313 | `5ce2dd4` — retired ship CTAs | Fixed |
| #1316 | `65da918` — copyright dynamic JS (RCL only) | Partially fixed |
| #1319 | `5ce2dd4` + `f7059ab` — Wonder "newest" removed | Fixed |
| #1320 | `5ce2dd4` + `f7059ab` — Monarch stats populated | Fixed |
| #1324 | `84114b5` — catLabels expanded for all categories | Fixed |
| #1334 | `84114b5` — "a Icon/Oasis" grammar (RCL only) | Partially fixed |

### Need more work before closing:

| Issue | What Remains |
|-------|-------------|
| #1309 | Fleet table passenger counts not yet standardized |
| #1314 | Verified resolved but not formally closed |
| #1315 | Verified resolved but not formally closed |
| #1317 | Attribution names — need photographer data, not code fix |
| #1318 | Liberty title — decision made (keep as-is), can close |
| #1322 | Browse All link — fixed on some pages, pattern exists on others |
| #1325 | Dining empty — rendering fixed, but noscript fallbacks still missing on many pages |
| #1327/#1329 | GT discrepancies — need data audit across fleet |
| #1330 | Venue names missing — data layer issue, not rendering |
| #1331 | TBD stats — Song of Norway and Splendour need population |
| #1332 | Retired loading state — Monarch/Majesty need dining no-data message |
| #1333 | Broken sister links — need to verify which pages actually exist |
| #1335 | Fleet page ship counts — ships.html edit needed |
| #1336 | Attribution "()" — need to fix rendering template |
| #1337 | Key Facts inconsistency — template standardization needed |
| #1338 | Generic dining — data layer + noscript content per ship |

### Carnival/NCL issues — untouched:

All issues #1341–#1366 are open and unfixed. These require the template generator fix (Phase 3) plus line-specific data population.

---

## Execution Order

| Priority | Work | Impact | Effort |
|----------|------|--------|--------|
| **P0** | Fleet-wide validation report (all 306 pages) | Know the real scope | 1 hour |
| **P1** | Generalize validator for all lines (Phase 1A/1E) | Every line gets basic coverage | 2 hours |
| **P1** | Add Carnival + NCL + MSC specific checks (Phase 1B/1C/1D) | Issue-specific detection | 2 hours |
| **P1** | Close already-fixed GitHub issues (Phase 6) | Reduce noise, show progress | 30 min |
| **P2** | Fix template generator (Phase 3) | Fixes 200+ pages at source | Unknown (need to find generator) |
| **P2** | Data layer refresh (Phase 2) | Fixes dining, stats, logbook across fleet | Ongoing |
| **P2** | Update investigate skill (Phase 5) | Future pages generate clean | 1 hour |
| **P3** | Pre-commit hook + CI (Phase 4) | Prevents regression | 1 hour |
| **P3** | Per-line fleet validation reports | Track progress per line | 30 min |

---

## Session Progress (2026-04-06)

### Commits pushed (11 total):

1. `7f5dde4` — Allure 3 warnings fixed
2. `6ddb55c` — 14 validator checks (9q–9ad)
3. `67db122` — Dining v2 fix (48 pages)
4. `5ce2dd4` — Spectrum, Wonder, Monarch, retired CTAs
5. `65da918` — Copyright dynamic JS (736 pages)
6. `52811bc` — Video Swiper retry (48 pages) + fallback text (19 pages)
7. `f7059ab` — Audit fixes (Wonder GT, Monarch tonnage)
8. `75e18fc` — Adventure full fix (19 warnings → 1)
9. `d3cfa7c` — Adventure deep-dive (carousel, stray tags)
10. `ebaefef` — 6 deep-dive validator checks (9ae–9aj)
11. `84114b5` — 11 new issue checks (9ak–9au) + 3 fleet-wide fixes
12. `2cc618c` — Final 2 checks (9av–9aw) — full issue coverage
13. `a8324df` — Checks 9ax–9ay (#1206, #1335)
14. `504a1ac` — Vision Class fixes (Enchantment, Grandeur, Legend)
15. `3da734c` — Anthem fixes
16. `732d213` — Enchantment noscript + FAQ + dates
17. `d6d0516` — Enchantment investigation merge
18. `fa87204` — Enchantment Tampa homeport

### Validator growth: 113 → ~160 checks

### Pages fully repaired (0 errors): Allure, Adventure, Anthem, Brilliance, Enchantment

### Pages partially repaired: Grandeur, Legend, Spectrum, Wonder, Monarch, Splendour, Song of Norway, all 48 RCL (dining + video + copyright)
