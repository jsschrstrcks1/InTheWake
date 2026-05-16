# UNFINISHED_TASKS triage report — 2026-05-12

**Branch:** `claude/audit-unfinished-tasks-5evPi`
**Method:** careful-not-clever Layer 1 — section-by-section walk with date/staleness signals + spot-check verification where cheap.
**Premise:** before planning all 215 open items, reduce the list to a realistic queue by surfacing aspirational, redundant, or low-value items for explicit retire/defer.

**This document recommends actions. The user decides what to drop, defer, or keep.**

---

## Triage tiers

- **KEEP-ACTIVE** — scoped, ready to work, would be on the next sprint
- **KEEP-PASSIVE** — real work but in a longer queue (multi-session sprints, cross-functional)
- **VERIFY** — likely partly done; needs a fresh count before planning
- **DEFER** — legitimate but blocked on a human decision (Y/R lane or scope question)
- **DROP-CANDIDATE** — recommend explicit retire; rationale per item

---

## Summary by tier

| Tier | Count | Notes |
|---|---:|---|
| KEEP-ACTIVE | ~28 | Scoped fixes + small page work |
| KEEP-PASSIVE | ~6 sprint-headings | Each contains many sub-items, multi-session work |
| VERIFY | ~17 | Counts dated 2026-03-02 likely stale |
| DEFER | ~52 | Y-lane new tools, R-lane content, low-value page stubs |
| DROP-CANDIDATE | ~14 | Recommend retire |

The 215 → if all drops accepted and verifies move counts → realistic active queue is ~80-100 items grouped into shippable batches.

---

## KEEP-ACTIVE — scoped and ready

These have known fix shapes, bounded effort, and clear acceptance criteria. Sequenced roughly by blast radius.

### Self-contained fixes
1. **Phase 3.5 — image-reuse-guardrail allowlist** (issue #1465). Two fixes in `.claude/skills/image-reuse-guardrail/`. ~1-2 hr.
2. **Phase 3.6 — `cascade_fully_failed` triage** (50 ships). Investigation-first per `systematic-debugging`. Effort unknown until root-caused.
3. **Tipping Calc P3 — `[object Object]` 404s.** Smell investigation, single Playwright spec + grep. ~1 hr.

### Specific missing pages (verified missing 2026-05-12)
4. **Half Moon Cay port page** — `ports/half-moon-cay.html` does not exist.
5. **Celebration Key port page** — `ports/celebration-key.html` does not exist.
6. **Norwegian Luna ship page** — `ships/norwegian/norwegian-luna.html` does not exist. Defer until specs/deck plans available.
7. **Alaska port gaps** — `dutch-harbor`, `nome`, `kake`, `victoria`, `prince-rupert`. 5 ports.

### Specific image gaps (verified missing 2026-05-12)
8. **Caribbean cruise trends 2026 hero image** — referenced from article, not on disk.
9. **Cabin organization article hero** — og:image points at missing file.
10. **Cruise tech photography hero** — same.
11. **Cruise duck tradition hero** — same.

### Specific noscript fallbacks (Green-lane scriptable, doc says ~2hr total)
12. **Ships Visiting noscript fallback** — write `scripts/inject-ships-visiting-noscript.js`, target 370 ports.
13. **Recent Stories noscript fallback** — 5 most recent articles, all 377 ports with the rail.
14. **Photo Gallery noscript fallback** — 143 ports with swiper galleries.

### Specific affiliate-link gaps (verified 2026-05-12 — port pages have 0 affiliate hits)
15. **Affiliate links on 4 Carnival ship pages** — `carnival-adventure`, `carnivale-1956`, `jubilee-1986`, `mardi-gras-1972`. Each has 1 hit currently; verify it's the intended affiliate insertion and add what's missing.
16. **Affiliate links on 3 port pages** — `beijing.html`, `falmouth-jamaica.html`, `kyoto.html`. All 3 have 0 affiliate hits. Note: per GSC audit, these three are redirect stubs with `noindex`. Decision needed: do they get affiliate inserts?

### Specific data/reference cleanups
17. **Update about-us.html "Our Promise"** — acknowledge Amazon Associates participation.
18. **Broken alaska-cruise-first-timer.html ref** — 14 port pages still reference it in noscript. Two options in the entry: write the article or remove the `<li>`.
19. **Update Codebase Status table** — port weather is now 365/387 (was 351); other counts likely stale.

### Bing + GA setup
20. **Set up Bing Webmaster Tools.** Operationally similar to GSC (already done).
21. **Set up Google Analytics dashboard.** Site has GSC; GA absent or stale.

---

## KEEP-PASSIVE — real multi-session sprints

These are committed work but should NOT be on the next sprint without an explicit session-scoping pass.

22. **Tier 3 port content repair (45 ports).** ~8-15 sessions per the doc's estimate. Requires research per port; cannot batch.
23. **CSS Consolidation** — ~15,626 inline `style=` to <1,000 target. Layer 3 careful-not-clever required.
24. **Ship Page Standardization (295 pages).** Carousel markup, section order, hero sizing. Layer 3.
25. **Noscript Phase 2 (Yellow-lane)** — 100 weather-only-placeholder ports + 14 zero-content + 330 map-placeholder ports. Needs design decisions (option A/B/C for maps).
26. **Coming Soon Pages (~172)** — 142 ships, 18 restaurants, 7 cruise-lines, 5 other. Needs decision: write or redirect?
27. **Ship Validation Content Quality Enhancement** — 5 sub-items, each multi-hundred ships.

---

## VERIFY — likely partly done, needs fresh count

Counts dated 2026-03-02 are 2.5 months old. Recent commit logs show port/ship work has continued — these are likely smaller than the doc claims.

| Item | Doc says | Need to verify |
|---|---|---|
| Generic review text on ships | 208 ships | Run the validator's review-text check; many ai-summary rewrites probably moved this number |
| Few images on ships | 137 ships | Run image-count check; recent FOM work moved this |
| FAQ too short on ships | 186 ships | Validator FAQ check |
| Missing whimsical units | ~181 ships | Spot check |
| Missing grid-2 layout | ~30 ships | Spot check |
| Ports still failing validator | ~145 ports | Latest `audit-reports/port-validation-results-*.json` |
| Trim FAQ answers to 80 words | ~384 ports | Many recent FAQ commits — count may have dropped |
| POI manifests <10 POIs | 365 ports | Has `admin/POI_LAND_VALIDATION_PLAN.md` work touched this? |
| Clean promotional drift language | ~200 ports | Voice-audit may have already chipped at this |
| Codebase Status row: HTML pages | 1,241 | Re-count |
| Codebase Status row: WebP images | 4,486 | Re-count |
| Codebase Status row: inline styles | ~15,626 | Re-count (Lane A2 in plan) |
| Codebase Status row: `<style>` blocks | 9 | Re-count (CLAUDE.md says 25 — drift) |
| Cruise Line Parity table | various counts | Restaurant counts may have moved |
| Carnival CTA (future) | vague | Probably defer or drop |
| Ship Size Atlas remaining (5 items) | various | Spot check each |
| Technical Tasks (6 a11y items) | recurring | These are continuous tasks, not finishable |

---

## DEFER — pending human decision

### Y-lane new tools (need design + scoping decision)
- **Port Call Reliability Tracker** — research-phase, multiple data sources (forum scraping borderline-touches Strategic Don't Chase: forums)
- **Port Day Disruption Factors** — 10-item research workstream
- **"What Can I Eat?" Dining Search Tool** — new tool, 7 sub-items
- **Stateroom Checker embed on ship pages** — new tool, 7 sub-items
- **Image tasks — FOM photos for 8+ ships** — Allure, Anthem, Icon, Independence, Navigator, Odyssey, Quantum, Spectrum
- **DIY vs Excursion expansion** — 38 → top 50 ports
- **Carnival Fleet Index Enhancement** — vague "CTA for booking"
- **ships.html display issues** — class cards / cruise lines / individual ship image rendering — needs reproduction
- **Dining Hero Images** — 49 RCL ships using Cordelia placeholder

### R-lane content (human writes)
- **Healing Relationships at Sea** (~3,000 words pastoral)
- **Rest for Wounded Healers** (~2,500 words pastoral)
- **Expand comprehensive-solo-cruising.html**
- **Additional Themed Articles** — 5 themed-category bullets (medical recovery, mental health, family situation, demographic, life transition)

### Low-value page stubs
- **Missing Homeport Pages (16)** — hp-norfolk, hp-philadelphia, hp-west-palm-beach, hp-san-juan (HTML exists, tracker entry needed), hp-honolulu (same), hp-dover, hp-hamburg, hp-istanbul, hp-le-havre, hp-lisbon, hp-livorno, hp-athens, hp-ravenna, hp-trieste, hp-dubai, hp-mumbai. Decision: write them all, write a subset, or treat as deferred.
- **Missing Port Pages rare/exotic (17)** — astoria, catalina-island, eden, port-vila, rarotonga, arica, coquimbo, abidjan, antsiranana, la-digue, luderitz, mossel-bay, aarhus, haugesund, kristiansand, nuuk, qaqortoq. Explicitly low-priority. Decision: defer or drop?

### Calculator / FX uncategorized
- **`staleIfErrorTimestamped` FX API caching**, **`warmCalculatorShell`**, **`FORCE_DATA_REFRESH` + `GET_CACHE_STATS`**, **"Refresh Rates" UI** — these are SW/calculator improvements. No date marker. Needs scoping: is this for cruise-tipping or budget calculator?

### Big decisions
- **HAL/Princess/Celebrity/RCL deferred-blocker carousels (39+ pages).** 4 resolution paths in the entry — each has different attribution policy implications.
- **P0 Flickr ARR audit (889 files, 124 ports).** Documented Option B (bulk-delete + flag). Layer 3 careful-not-clever required. High blast radius.
- **Tipping Calculator V2 / Drink Calculator V2** — referenced in CLAUDE.md as "P2 Active" but not in UNFINISHED_TASKS body. Decision: keep in CLAUDE.md or move?

---

## DROP-CANDIDATE — recommend explicit retire

Each row says why. User confirms before any actually leave the doc.

| # | Item | Section | Rationale |
|---|---|---|---|
| D1 | Evaluate PDF generation for top 20 ports | Competitor Analysis | "Evaluate" not commit. Overlaps Strategic Don't Chase ("Native mobile app — PWA sufficient"); a PDF generator is similar surface. |
| D2 | Add "Best for / Not ideal for" profile guidance per port | Competitor Analysis | Strategic Don't Chase explicitly rejects "Profile-based voyage paths — Impossible at scale". |
| D3 | Add author expertise callouts ("Ken has visited this port X times") | Competitor Analysis | Vague. Owner-decision item. If kept, needs a concrete spec. |
| D4 | Run edge case test personas (Quiz) | Quiz Remaining Fixes | Personas were never written down. Unscoped. Either define or retire. |
| D5 | Header hero size inconsistent across hub pages | Uncategorized | One-liner with no detail. Either scope or retire. |
| D6 | Logo size standardization | Uncategorized | Same. Tangentially covered by CLAUDE.md's P1 active "Site-wide hero/logo standardization" — duplicate? |
| D7 | Verify quality of auto-generated seasonal data vs hand-curated | Data Quality | No acceptance criteria. "Verify quality" is too vague to ship. |
| D8 | Verify quality of auto-generated stateroom exception files | Data Quality | Same. |
| D9 | `/travel.html` is also "Top 20 First-Cruise Questions" architectural quirk | Missing Pages | Doc itself says "Don't act unless we're doing a broader articles-hub refactor." Future-cleanup note, not a task. Move to a notes file. |
| D10 | Test service worker caching for complete offline access | Competitor Analysis Site-wide | Vague continuous test. If real, scope as a single Playwright spec. |
| D11 | Market PWA install as "your offline cruise companion" | Competitor Analysis Site-wide | Marketing copy — R-lane, not G-lane. Move to copy-decisions or retire. |
| D12 | Include "Skip this port if..." honest guidance where appropriate | Competitor Analysis | Subjective + duplicates "Real Talk" expansion (item 4). Roll into Real Talk or retire. |
| D13 | Expand "Real Talk" honest assessments to 75+ ports (currently 46) | Competitor Analysis | KEEP if you want to commit to it; counts may be stale anyway. Mark count-needs-verify or move to KEEP-PASSIVE. |
| D14 | Add "cabin location tips" section to ship pages | Competitor Analysis | Vague + fleet-wide (295 ships) = unscoped giant. If kept, needs design spec. |

---

## What's NOT in the triage

- Strikethrough tier table rows (Tier 1 + 2 ports already done) — already addressed in COMPLETED_TASKS, stay in-place as visualization.
- Strategic "Don't Chase" list — explicit decisions, no action needed.
- Reference Documents tail.
- The `Why these are tracked here` notes — governing rules, must stay.

---

## Suggested next step

Approve, modify, or reject the 14 DROP-CANDIDATEs above. Once finalized:
- Drops: remove with a "retired 2026-05-12 (audit)" note appended to the section preamble (per "do not delete silently")
- Defers: move to a new `admin/DEFERRED_DECISIONS.md` or annotate in-place
- Verifies: schedule a fresh-count pass (Lane A from the plan doc)
- Active queue then plans cleanly into batches

---

*Soli Deo Gloria.*
