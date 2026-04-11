# Port Validation Status

**Purpose:** Single source of truth for port page validation and repair status.
**Validator:** `admin/validate-port-page-v2.js` (authoritative — all sub-validators consolidated)
**Created:** 2026-04-09
**Last Updated:** 2026-04-11 (Session: claude/port-repair-cruise-site-WLyjh)

> **This document replaces all previous port validation tracking files.**
> See "Deprecated Documents" section at bottom for archived files.

---

## Validator Architecture (as of 2026-04-09)

v2 is the single authoritative port validator. It runs internally and orchestrates 5 sub-validators:

| Sub-Validator | What It Checks | Severity |
|---|---|---|
| Internal (65+ checks) | ICP-2, sections, word counts, images, logbook, voice, rubric, purity, basic HTML, tender port, img existence | BLOCKING/WARNING |
| `validate-port-weather.js` v2.0 | Weather component: seasons, activities, hazards, FAQ, duplicates, port registry | BLOCKING |
| `validate-poi-coordinates.js` | POI lat/lon land-vs-water via Nominatim | BLOCKING |
| `validate-mobile-readiness.js` | Viewport, touch targets, overflow, font sizes (MOB-001–008) | BLOCKING |
| `validate-recent-articles.js` | Recent Rail pattern, pagination, JS implementation | BLOCKING |

**Run single port:** `node admin/validate-port-page-v2.js ports/<slug>.html`
**Run all ports:** `node scripts/batch-validate.js` (or `node admin/validate-port-page-v2.js --all-ports`)
**JSON output:** `node scripts/batch-validate.js --json`

---

## Baseline Status

**Last full batch run:** Pending (validator consolidated 2026-04-09 — run `batch-validate.js` for fresh numbers)

**Previous baselines (for reference, pre-consolidation):**

| Date | Validator | Pass Rate | Notes |
|------|-----------|-----------|-------|
| 2026-03-26 | v2 strict mode | 40/387 (10.3%) | Strict report — all checks enforced |
| 2026-03-25 | v2 + normalization | — | Phase 1 complete (63/68 Tier 1 section reordering) |
| 2026-03-02 | v2 (Session 12) | 242/387 (62.5%) | Template filler detection added |
| 2026-02-14 | v2 (Session 11) | 267/380 (70.3%) | Pre-normalization |

---

## Current Session Repairs (2026-04-09)

Ports validated with consolidated v2 + truth-checked via external LLM (Perplexity/You.com).

| Port | Before | After | Blockers Remaining | Truth Check | Corrections |
|------|:------:|:-----:|-------------------|-------------|-------------|
| haines | 64 | **100 PASS** | — | You.com (facts + weather) | **Structural:** Map section converted from plain `<section>` to collapsible `<details>` (validator requires). Weather noscript rebuilt with required Beach/Snorkeling activities marked N/A, Hiking/City Walking with real months. Forbidden "shoulder season" replaced throughout. FAQ section rewritten: 5 orphan generic FAQs with "weather guide"/"best months" forbidden phrases removed; main FAQ converted to `<details class="faq-item"><summary>Q:...</summary>` format (12 items matching new schema). Ships-visiting, stories, map, and gallery noscript fallbacks added. Recent Rail nav-top + nav-bottom added. **Factual corrections:** Fort Seward "Alaska's first permanent military post" → correctly "last of twelve Gold Rush-era Army posts completed 1904; sole active AK installation 1925-1940" (NPS). Eagle preserve 48,000 → ~49,000 acres (ADF&G). Eagle peak gathering "October-February" clarified: "mid-October through January, peak in November"; summer visitors see dozens not thousands. "Tlingit" → "Chilkat Tlingit (Jilkáat Kwáan)" specificity; Jilkaat Kwaan Heritage Center at Klukwan added with 2026 season dates (Jun 2-Aug 29, adult $15). Port type corrected: "Pier dock or tender (varies by ship)" → "Direct dock (Port Chilkoot), one ship at a time" per CLAA + Haines Borough. Queen Charlotte-Fairweather fault zone hazard + 2020 Beach Road landslide context added. **Weather:** summer highs 55-60°F/lows mid-40s (WeatherSpark/NOAA), winter lows ~14°F, ~50-60 in/yr precipitation, June 21 daylight ~18h (sunrise 3:30-4:00 a.m.), Lynn Canal 15-25 kt northerly outflow winds (NOAA marine). **Image audit:** Deleted haines-5.webp — was a framed print of a European city, NOT Haines. Gallery rebuilt with 6 visually-verified real images + 5 distinct source URLs (Wikimedia categories, UW Libraries Special Collections, Library of Congress Sanborn Maps). |
| glacier-bay | 72 | **100 PASS** | — | You.com (facts + weather) | **Major factual correction:** "15 tidewater glaciers" → "~7 major (11 if counting coastal)" per NPS/NatParkTraveler/Wikipedia. Margerie framing corrected: historically stable/advancing but thinning/retreating since late 1990s per NPS + NASA Earth Observatory. Removed false claim that Holland America launches kayaks in Glacier Bay; ship-launched kayaking is a small-ship expedition product only (UnCruise, Lindblad, some luxury marina platforms). Huna Tlingit specificity added + Xunaa Shuká Hít tribal house (dedicated 2016). Johns Hopkins Inlet May 1–June 30 pupping closure specified. Weather data updated: summer highs 55-62°F (was generic "45-60°F"); humidity 80-85%; ~70 in/yr rain at Bartlett Cove; June solstice daylight ~18h 20m (explicitly NOT midnight sun — Glacier Bay is south of Arctic Circle, use "near-continuous twilight"). Image audit: **deleted 4 bogus images** — glacier-bay-3.webp (duplicate hero), glacier-bay-5.webp (historic Hop Picking in Puyallup Valley illustration — wrong subject entirely), glacier-bay-6.webp (Salmon Leaping at the Dalles of Columbia River illustration — wrong subject), glacier-bay-landmark.webp (LMPhotos watermark). Gallery rebuilt with 6 visually-verified real images + 6 distinct source URLs (Wikimedia Commons per-category + NASA Earth Observatory + specific Diego Delso file). Added weather noscript with At a Glance title, required Beach/Snorkeling/Hiking/City Walking activities marked N/A, katabatic wind hazard, UV reflection hazard. FAQ format converted to `<details class="faq-item"><summary>Q: ...</summary><p>...</p></details>` (13 items matching schema). Ships-visiting, Recent Rail nav-top/bottom, stories, gallery, and map noscript fallbacks added. Attribution JSON files updated with verification metadata. |
| abu-dhabi | 66 | 86 PASS | weather_sub (Yellow Lane) | Perplexity (92%) | Grand Mosque hours updated; Louvre price 63→60 AED. Noscript: all fallbacks added. Recent Rail fixed. |
| acapulco | 74 | 98 PASS | — | You.com (88%) | Elvis date 1950s→1963; La Quebrada admission 50→100 MXN; Fort San Diego 80→65-75 MXN; hurricane season June→mid-May; show times updated; Revolution Day notice added; 2 weather FAQs added; FAQ schema synced to 8. Noscript: ships, stories, gallery, map fallbacks added. Weather At a Glance values replaced with real tropical data; catches-off-guard and packing tips made Acapulco-specific. |
| adelaide | 68 | 88 PASS | — | You.com (86%) | **Major:** Removed monsoon/typhoon template (Adelaide has no tropical weather); replaced with summer heatwave hazard. Fixed region Pacific→South Australia. Fixed data-port-name "Adelaide Port Guide"→"Adelaide". Rewrote all 5 template-filler weather FAQs with real Adelaide-specific answers. Summer temp claim corrected (avg 26-29°C, not "regularly exceed 40°C"). |
| agadir | 68 | 88 PASS | — | You.com (86%) | Country field "Atlas Mountain foothills"→"Morocco". Fixed data-port-name template artifact. Replaced generic weather hazard with real Agadir hazards (Saharan heat waves, marine fog). Rewrote all 5 template-filler weather FAQs. Added mosque access notice (non-Muslims can't enter). Added Ramadan + Eid + Throne Day notices. Replaced generic holiday mention with specific Moroccan holidays. |
| airlie-beach | 70 | 90 PASS | — | You.com (82%) | 3 weather FAQs, croc warning, tender risk notice. Full weather noscript section built (At a Glance, seasons, catches, packing, cyclone+stinger hazards). Noscript: all fallbacks added. Recent Rail fixed. | Added 3 weather FAQs (best time, packing, rain). Synced FAQ schema 4→9. Added crocodile warning + tender cancellation risk notice. **Score unchanged** — weather sub-validator still fails because page lacks full static noscript weather section (seasonal guide, at-a-glance, catches, packing, hazards). Needs Yellow Lane weather section build. All 15 factual claims verified TRUE. |
| ajaccio | 54 | 84 PASS | — | You.com (83%) | Removed false tender indicator, Petit Train €12, market hours corrected, FAQ schema synced 6→9, Bastille Day + August closures added, full weather noscript built, 3 weather FAQs added. All noscript fallbacks added. Recent Rail fixed. |
| aitutaki | 66 | 90 PASS | — | You.com (mixed) | Full weather noscript built (tropical oceanic, cyclone zone). Added cyclone season notice (Nov-Apr, critical omission). Added lagoon safety notice (bluebottle jellyfish, reef sharks per You.com FALSE). 3 weather FAQs added. FAQ schema synced 4→9. Recent Rail + noscript stories added. Validator fix: weather month checker now accepts N/A for non-applicable activities. |
| akaroa | 64 | 88 PASS | — | You.com (mixed) | Full weather noscript built (temperate maritime, southerly storms). Fixed data-region "Australia"→"New Zealand". Dolphin tour price $150-200→$180-210 NZD. 3 weather FAQs added. FAQ schema synced 4→9. Recent Rail + noscript stories added. |
| akureyri | 56 | 78 PASS | — | You.com (all TRUE) | Fixed data-port-name template artifact. Replaced all generic weather data with subarctic data. Rewrote 5 template FAQs. FAQ schema synced 4→10. Recent Rail + noscript. |
| akaroa | 64 | 88 PASS | — | You.com (mixed) | Full weather noscript. Region "Australia"→"New Zealand". Dolphin price updated. FAQ synced 4→9. Recent Rail + noscript. |
| alesund | 56 | 78 PASS | — | You.com (all TRUE, pop OUTDATED 47K→55K) | Full weather noscript (maritime oceanic). 3 weather FAQs. FAQ schema synced 4→9. Recent Rail + noscript. | Fixed data-port-name template artifact. Replaced all 4 generic At a Glance values with subarctic data. Rewrote 5 template-filler weather FAQs with Iceland-specific answers. Replaced generic catches-off-guard + packing tips. Updated hazard to subarctic/volcanic. Added Beach/Snorkeling as N/A (required by validator for subarctic port). FAQ schema synced 4→10. Recent Rail + noscript stories added. | **Removed false tender indicator** (most ships dock directly, per You.com + registry). Petit Train 8-10→€12. Market hours corrected (Tue-Sun 7am-1pm, Mon summer only). FAQ schema synced 4→6. Added Bastille Day, August closures, docking note to notices. Needs Yellow Lane weather section build. |

**Fleet-wide blocker:** `recent_articles_validation_failed` — all ports (including cozumel gold standard) lack `#recent-rail-nav-top`, `#recent-rail-nav-bottom`, and article loader script. Needs fleet deployment, not per-port fix.

**Noscript remediation (2026-04-09):** Added noscript fallbacks to all 6 ports:
- Ships Visiting: static ship lists with links (all 6)
- Recent Stories: static article links (all 6)
- Photo Gallery: static image grids (4 ports with galleries)
- Map: text-based location list from "From the Pier" data (all 6)
- Remaining: weather noscript needs Yellow Lane content work on 5 ports

---

## Ports Validated and Repaired

### Tier 1 — High-Traffic Ports (15/15 COMPLETE)

All repaired in Sessions 13–14 (2026-03-03). Content written: cruise-port, getting-around, excursions.

| Port | Session | Score | Notes |
|------|:-------:|:-----:|-------|
| copenhagen | 13 | 88 | Clean |
| split | 13 | 42 | Logbook issues pre-existing |
| rhodes | 13 | 84 | Clean |
| riga | 14 | 82 | Clean |
| tallinn | 14 | 76 | Clean |
| phuket | 14 | 56 | Logbook issues pre-existing |
| san-diego | 14 | 76 | Logbook issues pre-existing |
| valencia | 14 | 32 | 5 logbook errors pre-existing |
| stavanger | 14 | 76 | Logbook word count short |
| malaga | 14 | 52 | 3 logbook errors pre-existing |
| victoria-bc | 14 | 72 | Emotional pivot pre-existing |
| st-petersburg | 14 | 72 | Emotional pivot pre-existing |
| portland | 14 | 72 | Logbook word count short |
| port-everglades | 14 | 60 | Logbook issues pre-existing |
| port-miami | 14 | 58 | Logbook issues pre-existing |

### Tier 2 — Medium-Traffic Ports (16/19 COMPLETE)

Repaired in Session 15 (2026-03-03). Mix of template filler removal and content writing.

| Port | Score | Work Done |
|------|:-----:|-----------|
| cairns | 82 | Template filler fix |
| cannes | 86 | Template filler fix |
| cartagena | 88 | Template filler fix |
| casablanca | 82 | Template filler fix |
| charleston | 80 | Template filler fix |
| corfu | 84 | Template filler fix |
| manila | 78 | Template filler fix |
| osaka | 86 | 3-section + template filler |
| penang | 88 | 3-section + reorder + template filler |
| porto | 82 | 3-section + forbidden_drinking fix |
| recife | 84 | 3-section + logbook + template filler |
| taormina | 76 | 3-section + logbook expansion |
| trieste | 92 | 3-section + reorder + template filler |
| villefranche | 76 | 3-section + template filler + logbook |
| warnemunde | 76 | 3-section + logbook reflection |
| zeebrugge | 82 | 3-section + logbook expansion |

**Tier 2 SKIPPED (3 — need logbook work):**
- goa — needs logbook structural work
- halifax — no logbook present
- panama-canal — logbook 331/800 words

### Gold Standard

| Port | Score | Status |
|------|:-----:|--------|
| cozumel | 96* | Gold standard for content. *Now fails on weather noscript duplicate + Recent Rail pagination (real issues surfaced by v2 consolidation) |
| royal-beach-club-cozumel | 100 | Passes all 23 audit checks (#1384) |

### Stub Pages (Delete or Complete — P0 from #1384)

| Port | Elements Missing | Action |
|------|:----------------:|--------|
| beijing | 18-21 | Redirect page — delete or complete |
| falmouth-jamaica | 18-21 | Redirect page — delete or complete |
| kyoto | 18-21 | Redirect page — delete or complete |

### Tier 3 — Lower-Traffic Ports (Not Yet Started)

~45 ports needing content repair. See `admin/UNFINISHED_TASKS.md` Tier 3 table for full list.
Missing sections typically: cruise-port, getting-around, excursions.

---

## Fleet-Wide Gaps (from Issue #1384 Audit)

| Element | Ports WITH | Ports MISSING | % Missing |
|---------|:----------:|:-------------:|:---------:|
| `id="notices"` | 80 | 307 | 79% |
| `disclaimer-volatile-data` | ~100 | ~287 | 74% |
| `id="credits"` | ~100+ | ~250+ | ~65% |
| `id="practical"` | ~100+ | ~250+ | ~65% |
| `id="food"` | varies | widespread | — |
| `section-collapse` (uniform) | varies | nassau, miami, abu-dhabi + others | — |

---

## How to Update This Document

After any port repair session:
1. Run `node admin/validate-port-page-v2.js ports/<slug>.html` on repaired ports
2. Add the port to the appropriate tier table above with score and work done
3. Update the "Last Updated" date at the top
4. If running a full batch, update the Baseline Status section

---

## Deprecated Documents

These files are superseded by this document. Archived to `.claude/archive/` or deleted:

| File | Date | Why Deprecated |
|------|------|---------------|
| `admin/PORT_VALIDATION_PROGRESS.md` | 2026-03-02 | Stale numbers (310/387), pre-consolidation validator |
| `admin/PORT_NORMALIZATION_PLAN.md` | 2026-03-25 | Strategy doc — decisions already implemented |
| `admin/PORT_NORMALIZATION_STRICT_REPORT.md` | 2026-03-26 | Point-in-time report, pre-consolidation |
| `admin/batch-validation-results.txt` | pre-2026-04 | Pre-fix snapshot |
| `admin/batch-validation-results-AFTER-FIXES.txt` | pre-2026-04 | Post-fix snapshot, now stale |
| `admin/validation-sample-report.txt` | 2026-02-20 | 10% sample, outdated |
| `admin/port-validation-results-2026-03-25.json` | 2026-03-25 | Point-in-time JSON dump |
| `admin/port-validation-strict-2026-03-26.txt` | 2026-03-26 | Point-in-time text dump |
| `admin/claude/PORT_100_PERCENT_PLAN.md` | 2026-02-14 | Strategy doc — partially executed, stale numbers |
| `admin/claude/PORT_REMEDIATION_PLAN.md` | 2026-02-12 | Strategy doc — partially executed, stale numbers |

**Not deprecated:**
- `admin/UNFINISHED_TASKS.md` — still the active task queue (Tier 3 port list lives there)
- `admin/PORT_TRACKER_ROADMAP.md` — roadmap for Port Tracker tool, not validation status
- `admin/port-page-repair.cjs` — active repair script
- `admin/repair-v2.cjs` — active repair script
