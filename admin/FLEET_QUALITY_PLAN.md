# Plan: Fleet-Wide Ship Page Quality — All 15 Cruise Lines

## Status as of 2026-04-06

**306 ship pages across 15 cruise lines.** The validator has grown from 113 to ~160 checks this session. 49 GitHub issues are open. We've fixed bugs on ~50 RCL pages but haven't touched the other 255 pages systematically.

---

## Honesty Check: What I Have and Haven't Done

**Pages I actually read line-by-line this session:**
- RCL: Allure, Adventure, Icon (partial), Radiance (partial), Enchantment, Grandeur (partial via agent)
- Explora: Explora I
- Cunard: QM2 (structure only, not every line)
- Princess: Sun Princess

That's ~10 pages out of 306. Everything else is validator output, grep patterns, or agent reports I reviewed but didn't verify myself.

**What I called "audited" that was actually just validator runs:**
- Celebrity (23 pages) — ran validator, grep-checked 3 pages for structure
- Holland America (46 pages) — ran validator, grep-checked 2 pages
- Regent (8 pages) — ran validator, data-grepped all 8
- Silversea, Costa, Oceania, Seabourn — ran validator on one sample each. Called it "audited." It wasn't.

**What I haven't touched at all:**
- Carnival: Read the GitHub issues but never opened a single page
- Norwegian: Same — issues only, no pages read
- Holland America historic ships: 42 pages untouched

---

## The Real Problem

The issues aren't random. They come from **3 root causes**:

1. **Template generation produced bad HTML** — blank variables, wrong grammar, generic data, structural bugs. Fixing pages one-by-one is O(n). Fixing the template is O(1).
2. **The data layer is stale/incomplete** — `venues-v2.json` is 64+ days old, 12% price coverage, 20 ships with zero venue data. Logbook JSONs have wrong guest counts. Stats JSONs have TBD fields.
3. **No regression prevention** — no CI, no pre-commit hooks, no automated validation. Bugs we fix today can return tomorrow.

---

## Fleet Inventory

### What "audited" means in this table

- **Deep read**: I read the full HTML source of at least one page, line by line
- **Validator run**: I ran the validator on every page in the line
- **Validator only**: I ran the validator but didn't read the pages
- **Sample only**: I ran the validator on one sample page and grep-checked a few patterns — NOT a real audit

| Line | Pages | Audit Level | What I Actually Found |
|------|-------|-------------|----------------------|
| **RCL** | 51 | Deep read (6 pages) + validator (all 51) + deep-dive agent audits (6 pages) | Most mature template. 5 pages fully repaired. Dining v2 fix applied to 48. Copyright fix to all. Video retry to 48. |
| **Carnival** | 49 | Issues read from GitHub only. No pages read. | 14 GitHub issues describe 4 template variants. I have not personally verified any of this. |
| **Holland America** | 47 | Validator run (all 46) + structure grep on 1 active + 1 historic page | 42 are historic/retired. 4 active. Has `page-grid`+`col-1`. Skip link wrong (`#content` vs `#main-content`). 36 TBD stats (mostly historic). Did NOT deep read any page. |
| **Celebrity** | 30 | Validator run (all 23) + structure grep on 3 pages | Has `page-grid`, dynamic copyright. Skip link wrong on all 23. 3 broken carousels, 13 TBD stats, 17 attributions outside col-1. Did NOT deep read any page. |
| **MSC** | 25 | Agent deep audit (World Europa) + validator run (all 24) | Agent found 12 new issue categories. "exceptional" raw class name. Swiper @10/@11 mismatch. Triple GT/guest inconsistency on World Europa. I reviewed the agent's findings but did NOT personally read MSC pages. |
| **Norwegian** | 21 | Issues read from GitHub only. No pages read. | 9 GitHub issues filed. I have not personally verified any of this. |
| **Princess** | 18 | Deep read (Sun Princess only) + validator run (all 17) + symlink check (all 17) | Sun Princess: MSC-era template. Crew 1,697 vs 1,600 discrepancy. Carousel class mismatch. IMO TBD on operational ship. 4 ships have cross-line image symlinks (Star Princess → Star of the Seas). |
| **Silversea** | 13 | Sample only (1 page grep) | Validator says 1-2 errors per page. GT double-value on Silver Cloud (16,800 vs 16,927). Skip link correct. I did NOT read any page. |
| **Costa** | 10 | Sample only (1 page grep) | Validator says 1-2 errors. Guest count double on Deliziosa (2,260 vs 2,826). I did NOT read any page. |
| **Oceania** | 9 | Sample only (1 page grep) | Validator says 1-2 errors. 5 TBD stats. I did NOT read any page. |
| **Seabourn** | 8 | Sample only (1 page grep) | Validator says 1-2 errors. Guest 600 vs 604 on Encore. 3 TBD stats. I did NOT read any page. |
| **Regent** | 8 | Validator run (all 8) + data grep (all 8) | Explorer/Grandeur/Splendor have GT 55,254 vs 55,500. Prestige has class mismatch (Explorer in breadcrumbs, Nova in fact-block). Did NOT deep read any page. |
| **Explora** | 7 | Deep read (Explora I) + validator run (all 6) | All 6 identical. FAQ uses `list-indent` not `faq-answer`. 4 placeholder sections. No favicon. I read Explora I line by line. |
| **Virgin** | 5 | Validator run (all 4) + structure/data grep (all 4) | Page title "In the Wake" leaks into ship name (9x per page). Lady Class vs Virgin Class mismatch. I did NOT deep read any page but did verify the title leak pattern across all 4. |
| **Cunard** | 5 | Validator run (all 4) + data grep (all 4) + deep read (QM2 structure) | QM2 carousel class mismatch (`photo-carousel` vs `firstlook`). Queen Victoria has 3 guest counts. QM2 has GT 149,215 vs 148,528. I read QM2's structure but not the full page. |

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
| **9ch** | Class name triple-mismatch | 3+ different class names on same page (Regent Prestige: breadcrumbs=Explorer, stats=Explorer, fact-block=Nova) |
| **9ci** | Duplicate non-section IDs | Same `id=` on non-section elements (Celebrity: `recent-rail-title` appears twice) |

### 1G. Celebrity audit findings

23 ship pages, 1 template (newer generation than MSC-era — has `page-grid`, `col-1`, dynamic copyright, Swiper @11 only). All 23 fail.

**Error distribution:**

| Error Type | Count | Pages |
|------------|-------|-------|
| No venues in venues.json | 23/23 | All |
| Skip link #content vs #main-content | 23/23 | All |
| Attributions outside col-1 | 17/23 | Century, Compass, Constellation, Eclipse, Equinox, Flora, Galaxy, Infinity, Mercury, Reflection, Seeker, Silhouette, Summit, Xcel, Xpedition, Xperience, Xploration |
| TBD stats on operational ships | 13/23 | Century, Compass, Eclipse, Equinox, Galaxy, Mercury, Reflection, Seeker, Silhouette, Solstice, Xpedition, Xperience, Xploration |
| Broken carousel (missing `</div>`) | 3/23 | Compass, Seeker, Xperience |
| Duplicate `recent-rail-title` ID | 23/23 | All |

**Celebrity template characteristics:**
- Has `page-grid` + `col-1` (unlike MSC-era)
- Has dynamic copyright (unlike MSC-era)
- Has Swiper @11 only (no version mismatch)
- Uses `list-indent` not `faq-answer` (same as all non-RCL)
- No `no-js` class on `<html>`
- No title leak
- Guest counts consistent per page
- GT consistent per page
- No CruiseShip JSON-LD
- Photo credit pill in hero (different from RCL/MSC attribution pattern)

**3 template generations identified across fleet:**
1. **RCL v3.010** — most mature (page-grid, col-1, noscript, dynamic copyright, faq-answer class, Swiper @11 with retry)
2. **Celebrity** — mid-generation (page-grid, col-1, dynamic copyright, but no noscript, list-indent FAQ, skip link wrong)
3. **MSC-era** — oldest (no page-grid, no col-1, static copyright, Swiper @10/@11 mismatch, placeholder sections). Used by MSC, Explora, Cunard, Virgin, Regent.

### 1F. Regent audit findings

8 ships, 1 template (MSC-era). All 8 fail.

| Ship | Errors | Warnings | Unique Issues |
|------|--------|----------|---------------|
| Prestige | 1 | 21 | Class triple-mismatch (Explorer Class in breadcrumbs/stats, Nova Class in fact-block). Missing GT in fact-block. "a Explorer" grammar. |
| Explorer | 1 | 17 | GT: 55,254 vs 55,500 (4 unique GT values on page). "a Explorer" grammar (9x). Duplicate Deck Plans sections. |
| Grandeur | 1 | 17 | GT: 55,254 vs 55,500. Guests: 746 vs 750. Same pattern as Explorer. |
| Splendor | 1 | 17 | GT: 55,254 vs 55,500. Guests: 732 vs 750. Same pattern. |
| Mariner | 1 | 19 | Standard MSC-era issues only. |
| Navigator | 1 | 19 | Standard MSC-era issues only. |
| Voyager | 1 | 19 | Standard MSC-era issues only. |

**Regent-specific patterns:**
- GT split: 55,254 in fact-block/Key Facts/Review vs 55,500 in meta/specs/prose (Explorer, Grandeur, Splendor)
- Guest count split: specific number (732/746/750) in detail vs round 750 in meta (Grandeur, Splendor)
- Prestige class confusion: Probably was Explorer Class at announcement, renamed to Nova Class later — template didn't update all locations
- All 8 pages have duplicate Deck Plans sections (same as MSC/Cunard)
- All 8 use `list-indent` not `faq-answer` (same as MSC/Explora/Cunard/Virgin)
- FAQ answers are generic boilerplate (same as MSC/Explora/Cunard)
- Swiper @10/@11 version mismatch on all 8 (same as MSC/Cunard)
- No title leak (unlike Virgin)
- No `CruiseShip` JSON-LD on Prestige (others have it)

**Explora-specific finding:** FAQ answers use `class="list-indent"` instead of `class="faq-answer"` — validator FAQ checks don't find them. Need to broaden FAQ answer detection to include both classes.

**MSC fleet summary:** 24/24 fail. Static copyright 23/24. Zero noscript 24/24. Swiper version mismatch 24/24. "exceptional" raw class on 3 World Class pages. Guest count triple-inconsistency confirmed on World Europa.

**Explora fleet summary:** 6/6 identical (1e 19w each). Same template. 4 placeholder sections per page. No `faq-answer` class. No favicon. No robots meta. Stats JSON complete (no TBDs). Guest counts consistent (922). `CruiseShip` JSON-LD schema present (not on RCL).

### 1E-extra. Princess deep-read findings (Sun Princess)

I read the full source of `ships/princess/sun-princess.html` line by line on 2026-04-06.

**Template: MSC-era.** No `page-grid`, no `col-1`, no `no-js`. Swiper @10 CSS + @11 JS. Static copyright 2025. `list-indent` FAQ class.

**Specific findings:**

| Finding | Lines | Severity |
|---------|-------|----------|
| **Crew count: 3 values on one page** — Specifications says 1,697 (line 466), Ship Statistics says 1,600 (line 566), Stats JSON says 1,600 (line 480) | 466, 566, 480 | High — intra-page data conflict |
| **IMO: "TBD"** on an operational ship (sailed since Feb 2024). IMO 9872428 is publicly available. | 367, 589 | High — should be populated |
| **Carousel class mismatch** — uses `photo-carousel swiper` (line 390) but `initFirstLook()` targets `.firstlook .swiper`. 8 real photos with captions exist but Swiper never initializes. | 390, JS section | High — carousel is broken |
| **Duplicate stats sections** — "Ship Specifications" (lines 441-469) and "Ship Statistics" (lines 561-569) show the same data in two formats with different crew values. | 441, 561 | Medium — redundant + inconsistent |
| **Video loader has no retry** — old single-check `if(window.Swiper)` pattern (line 525) without the retry loop we added to RCL pages. | 525 | Medium |
| **FAQ is 100% boilerplate** — all 5 answers are generic ("Specialty restaurants vary by ship", "Ship deployments vary by season"). But the Review schema (line 126) specifically names "Discovery Dining, Crown Grill, Sabatini's, and the Dome at Sea." The Review knows the ship; the FAQ doesn't. | 138, 154, 126 | High — internal contradiction |
| **Dining: "coming soon"** with no noscript fallback and no venue data in venues-v2.json. | 477 | Medium |
| **Planning Resources section orphaned** — sits between `</aside>` (line 685) and `</main>` (line 703), outside the grid layout. | 688-697 | Low — renders OK due to flat layout |
| **4 placeholder sections** — Dining "coming soon" (477), Logbook "will appear here" (486), Video fallback (505), Entertainment "coming soon" (492) | Various | Medium |
| **Content text is pure template boilerplate** — "The ship offers a range of dining options..." (line 376) could describe any ship. | 376 | Medium |

**Cross-ship image symlinks (from validator run, not deep read):**
- Star Princess: 7 images → Star of the Seas (RCL) — **wrong cruise line entirely**
- Coral Princess: 7 cross-ship symlinks
- Island Princess: 7 cross-ship symlinks
- Royal Princess: 5 cross-ship symlinks

**What I did NOT check on Princess:** I did not read any page other than Sun Princess. The cross-ship symlink counts came from validator runs, not from reading. I don't know what specific ships those symlinks point to for Coral/Island/Royal.

### 1E-extra2. Cunard audit findings

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
