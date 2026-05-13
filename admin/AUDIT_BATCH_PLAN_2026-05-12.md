# UNFINISHED_TASKS batch plan — 2026-05-12

**Branch:** `claude/audit-unfinished-tasks-5evPi`
**Builds on:** `admin/AUDIT_TRIAGE_2026-05-12.md` (categorization), `admin/AUDIT_PLAN_2026-05-12.md` (lane sequencing)
**Premise:** after the 2026-05-12 audit pass (215 → 202 open items, 13 retired, 17 counts refreshed), the remaining work clusters into 13 shippable batches. Each batch is one careful-not-clever scope.

---

## How the batches are organized

- **Effort:** estimate from the source entry where given; otherwise my best guess
- **Risk:** Layer 1 (default), Layer 2 (>5 files / shared CSS,JS / version changes / canonical standards), Layer 3 (red-team / cross-module / guardrails)
- **Dependency:** what must land before this batch can start
- **Acceptance:** how we'll know it's done

The careful-not-clever discipline applies per batch: read in-session, confirm current state, identify material assumptions, verify before declaring done. Re-running the verification commands matters more than the count of bullets ticked.

---

## Sequencing recommendation

**Order:** B1 → B2 → B3 → B7 → B6 → B4 → B5, then decision lanes (B9, B10, B11, B12), then long sprints (B8), then low-priority (B13).

Rationale: B1-B3 are low-risk wins that clear the small-fix queue. B6 is the verifier refresh that will likely shrink B5 and the multi-session sprints. Decision lanes (B9 onward) need user input before they can move.

---

## BATCH 1 — Skill + tool small wins (~3-4 hours)

| Item | Source | Effort | Risk |
|---|---|---:|---|
| Phase 3.5 image-reuse-guardrail allowlist (issue #1465) | UNFINISHED `#### Phase 3.5` | 1-2 hr | L1 |
| Tipping Calc P3 `[object Object]` 404s | UNFINISHED `### P3 — [object Object]` | ~1 hr | L1 |
| Update `about-us.html` "Our Promise" — Amazon Associates note | UNFINISHED Affiliate G-lane | ~15 min | L1 |

**Dependency:** none.
**Acceptance:**
- Issue #1465 test cases that must still fail (Cordelia pattern) still fail; the 4 cases that must now pass do pass.
- Playwright runs show no `[object Object]` GET 404s in webserver log.
- `about-us.html` "Our Promise" section contains the Amazon Associates disclosure line.

---

## BATCH 2 — Specific page gaps (~4-6 hours)

| Item | Source | Effort | Risk |
|---|---|---:|---|
| Generate 4 article hero images (caribbean-cruise-trends-2026, cabin-organization, cruise-tech, cruise-ducks) | UNFINISHED Missing Pages | 2-3 hr | L1 |
| `ports/half-moon-cay.html` (HAL/Carnival private destination) | UNFINISHED Missing Pages | 1-2 hr | L1 |
| `ports/celebration-key.html` (Carnival new private destination) | UNFINISHED Missing Pages | 1-2 hr (when specs available) | L1 |
| Affiliate links on 4 Carnival ship pages (carnival-adventure, carnivale-1956, jubilee-1986, mardi-gras-1972) | UNFINISHED Affiliate G-lane | ~30 min | L1 |
| **Decision needed:** Affiliate links on 3 port pages (beijing, falmouth-jamaica, kyoto) — these are noindex redirect stubs per GSC audit; insert anyway, or skip? | UNFINISHED Affiliate G-lane | depends | L1 |

**Dependency:** Norwegian Luna page deferred (specs not yet available per entry).
**Acceptance:**
- Each new hero image referenced by an existing og:image gets generated, og:image updated, JSON entry in `assets/data/articles/index.json` updated.
- Each new port page passes `node admin/validate-port-page-v2.js`.
- The 4 Carnival ships have current affiliate-rule wiring (verify against an existing affiliate-correct Carnival ship).

---

## BATCH 3 — Noscript Phase 1 (Green-lane scriptable, ~2-3 hours)

| Item | Source | Effort | Risk |
|---|---|---:|---|
| `scripts/inject-ships-visiting-noscript.js` — write + run + verify 3 ports + commit | UNFINISHED Noscript G-lane 1a | ~45 min | L2 (bulk file edits) |
| `scripts/inject-recent-stories-noscript.js` — write + run + verify + commit | UNFINISHED Noscript G-lane 1b | ~30 min | L2 |
| `scripts/inject-gallery-noscript.js` — write + run + verify + commit | UNFINISHED Noscript G-lane 1c | ~45 min | L2 |
| `alaska-cruise-first-timer.html` broken refs on 14 port pages — **decide:** write the article OR remove the `<li>` from each | UNFINISHED Missing Pages | ~30 min if remove, ~3 hr if write | L1 |

**Dependency:** none.
**Acceptance:**
- All 370 ports with ships-visiting have a `<noscript>` static list.
- All 377 ports with recent-rail have a `<noscript>` static link list.
- All 143 ports with swiper galleries have a `<noscript>` static image block.
- `grep -rln "/solo/articles/alaska-cruise-first-timer" --include="*.html" .` returns 0 lines (or the article exists and resolves).
- Layer 2 careful-not-clever applies (>5 files modified) — spot-check at least one port from each affected set after running the script.

---

## BATCH 4 — Specific Alaska port gaps + analytics setup (~5-6 hours)

| Item | Source | Effort | Risk |
|---|---|---:|---|
| `ports/dutch-harbor.html` | UNFINISHED Alaska Y-lane | ~1 hr | L1 |
| `ports/nome.html` | UNFINISHED Alaska Y-lane | ~1 hr | L1 |
| `ports/kake.html` | UNFINISHED Alaska Y-lane | ~1 hr | L1 |
| `ports/victoria.html` | UNFINISHED Alaska Y-lane | ~1 hr | L1 |
| `ports/prince-rupert.html` | UNFINISHED Alaska Y-lane | ~1 hr | L1 |
| Set up Bing Webmaster Tools | UNFINISHED SEO Y-lane | ~30 min | L1 |
| Set up Google Analytics dashboard | UNFINISHED SEO Y-lane | ~30 min | L1 |

**Dependency:** content research per port (use `/investigate` mode or WebFetch on primary sources — never training data, per InTheWake claude.md "NEVER USE TRAINING DATA AS A SOURCE").
**Acceptance:**
- Each new port page passes `node admin/validate-port-page-v2.js`.
- GSC + Bing + GA all have verified data flowing.

---

## BATCH 5 — Phase 3.6 cascade triage (unknown effort)

| Item | Source | Effort | Risk |
|---|---|---:|---|
| Phase 3.6 cascade_fully_failed triage (50 ships) | UNFINISHED `#### Phase 3.6` | unknown — investigation first per `systematic-debugging` | L2 (likely shared script) |

**Dependency:** Batch 6 verifier refresh (may shrink the 50 number).
**Acceptance:**
- Either a single root-cause fix that drops the 50-ship `cascade_fully_failed` count to 0, OR a documented per-ship remediation plan.
- `audit-reports/ship-validation-dashboard.json` shows the rule's count drop to 0 (or the agreed acceptable remainder).

**Note:** the entry explicitly says "Use systematic-debugging skill before proposing fixes. Pick 1-2 affected ships, reproduce in browser, instrument the cascade loader, identify the failure mode, then plan the fix scope." Don't open this batch with code edits — open it with reproduction first.

---

## BATCH 6 — Validator refresh sprint (~1 session)

| Item | Source | Effort | Risk |
|---|---|---:|---|
| Run `node admin/validate-port-page-v2.js` and update Port Validation counts | UNFINISHED Port Validation | ~1 hr | L1 |
| Run ship validator and update Ship Validation Content Quality counts (the *count needs refresh* annotations) | UNFINISHED Ship Validation | ~30 min | L1 |
| Run `webp_audit.py` and update Codebase Status row | UNFINISHED Codebase Status | ~15 min | L1 |
| Cross-reference 62 open GitHub issues against UNFINISHED entries (Lane A3 from plan doc) | external | ~1-2 hr | L1 |

**Dependency:** none — can interleave with batches that don't touch ships/ports.
**Acceptance:**
- `admin/UNFINISHED_TASKS.md` "Codebase Status (refreshed YYYY-MM-DD)" table has current numbers.
- Each annotation `*count needs refresh*` is either replaced with a fresh number or moved to COMPLETED if the count is now 0.
- GitHub issue numbers cross-referenced into the entries they correspond to.

**Why batch 6 between 3 and 5:** B6's results probably reduce B5 effort and may shrink the "long sprint" batches (B8) significantly.

---

## BATCH 7 — Port weather remaining (~2-3 hours)

| Item | Source | Effort | Risk |
|---|---|---:|---|
| Add weather widget to 22 remaining ports | UNFINISHED Port Weather G-lane | ~6 min/port × 22 = ~2 hr | L1 |

**Dependency:** none.
**Acceptance:** 387/387 ports have weather widgets.

---

## BATCH 8 — Long multi-session sprints (DEFER explicit scoping pass)

These items are real work but need their own scoping session before any code touches.

| Item | Source | Effort | Risk |
|---|---|---:|---|
| CSS Consolidation — ~22,181 inline styles → <1,000 target (now WORSE than 2026-03-02) | UNFINISHED CSS Consolidation | many sessions | **L3** |
| Ship Page Standardization (294 pages) | UNFINISHED Ship Page Standardization | many sessions | **L3** |
| Tier 3 port content repair (45 ports) | UNFINISHED Port Content Repair Queue | 8-15 sessions per doc | L2 |
| Coming Soon Pages decision (~172 pages: 142 ships + 18 restaurants + 7 cruise-lines + 5 other) | UNFINISHED Coming Soon Pages | depends on decision | L1/L2 |
| Noscript Phase 2 (Yellow-lane: 100 weather-placeholder ports + 14 zero-noscript + 330 map-placeholder) | UNFINISHED Noscript G-lane Phase 2 | many sessions, needs map decision A/B/C | L2 |
| Competitor Analysis port + ship improvements (~7 bullets after drops) | UNFINISHED Competitor Analysis | varies | L1/L2 |
| Ship Size Atlas remaining (5 items) | UNFINISHED Ship Size Atlas | scope per item | L1/L2 |

**Recommendation:** do NOT open batch 8 items without a dedicated scoping turn first. Each Layer 3 item warrants its own pre-batch design pass (red-team for failure vectors, identify rollback plan, document the canonical change being made).

---

## BATCH 9 — High-blast-radius decisions (DEFER pending user direction)

| Item | Source | Effort | Risk |
|---|---|---:|---|
| P0 Flickr ARR audit (889 files, 124 ports) — pick Option A/B/C from entry | UNFINISHED P0 Flickr ARR | varies massively by option | **L3** |
| P0 HAL/Princess/Celebrity/RCL deferred-blocker carousels (39+ pages) — pick from 4 resolution paths | UNFINISHED P0 HAL Carousels | varies | L2/L3 |
| Ship Validation 13 sh_fail regressions (NEW — surfaced 2026-05-12) | UNFINISHED Ship Validation refreshed | needs investigation | L1/L2 |

**Recommendation:** these require explicit user decision on which resolution path before any code starts. The entries already document the options.

---

## BATCH 10 — Yellow Lane new tools (DEFER scoping per tool)

Each Y-lane new tool needs its own scoping turn before implementation can begin.

| Item | Source | Effort | Risk |
|---|---|---:|---|
| Port Call Reliability Tracker | UNFINISHED `[Y]` Port Call Reliability | research-phase + many sessions | L2 |
| Port Day Disruption Factors | UNFINISHED `[Y]` Port Day Disruption | research-phase | L2 |
| "What Can I Eat?" Dining Search | UNFINISHED `[Y]` Dining Search | new tool, 7 sub-items | L2 |
| Stateroom Checker embed on ship pages | UNFINISHED `[Y]` Stateroom Checker | new tool, 7 sub-items | L2 |

---

## BATCH 11 — Yellow Lane misc (DEFER decisions)

| Item | Source | Effort | Risk |
|---|---|---:|---|
| FOM photos for 8+ RCL ships (Allure, Anthem, Icon, Independence, Navigator, Odyssey, Quantum, Spectrum, +others) | UNFINISHED `[Y]` Image Tasks | content-sourcing per ship | L1 |
| DIY vs Excursion expansion (38 → top 50 ports) | UNFINISHED `[Y]` DIY Expansion | content per port | L1 |
| Affiliate Content Phase 3 (packing-lists.html + internet-at-sea.html) | UNFINISHED `[Y]` Affiliate Phase 3 | ~1-2 hr | L1 |
| Carnival Fleet Index Enhancement (vague "CTA for booking") | UNFINISHED `[Y]` Carnival Fleet Index | needs spec | L1 |
| ships.html Display Issues (class cards, cruise lines images, ship images rendering) | UNFINISHED `[Y]` ships.html Display | bug repro first | L1 |
| Dining Hero Images (49 RCL ships) | UNFINISHED `[Y]` Dining Hero | 1 image per ship × 49 | L1 |

---

## BATCH 12 — Red Lane content (Human writes)

These are R-lane — the audit can flag them as still pending, cannot author them.

| Item | Source |
|---|---|
| Healing Relationships at Sea (~3,000 words pastoral) | UNFINISHED `[R]` Articles |
| Rest for Wounded Healers (~2,500 words pastoral) | UNFINISHED `[R]` Articles |
| Expand comprehensive-solo-cruising.html | UNFINISHED `[R]` Articles |
| Medical recovery articles | UNFINISHED `[R]` Themed |
| Mental health articles | UNFINISHED `[R]` Themed |
| Family situation articles | UNFINISHED `[R]` Themed |
| Demographic articles | UNFINISHED `[R]` Themed |
| Life transition articles | UNFINISHED `[R]` Themed |

---

## BATCH 13 — Uncategorized + low-priority pages (DEFER scoping)

| Item | Source | Decision |
|---|---|---|
| 6 calculator/FX items (staleIfErrorTimestamped, warmCalculatorShell, FORCE_DATA_REFRESH, GET_CACHE_STATS, Refresh Rates UI, cache age display, toast notifications) | UNFINISHED Uncategorized | scope: is this cruise-tipping or budget-calc? |
| solo.html article loading (28 article references, uses fetch for fragments) | UNFINISHED Uncategorized | scope |
| index.html FAQ positioning | UNFINISHED Uncategorized | scope |
| Missing Port Pages rare/exotic (17) | UNFINISHED Missing Ports | defer or drop? entry says "low priority" explicitly |
| Missing Homeport Pages (16) | UNFINISHED Missing Homeports | defer, write subset, or drop? |

---

## Summary roll-up

| Batch | Lit-up effort | Status | Why |
|---|---|---|---|
| B1 | ~3-4 hr | ready | small-fix queue clear |
| B2 | ~4-6 hr | ready | concrete missing pages/images |
| B3 | ~2-3 hr | ready | scriptable noscript Phase 1 |
| B4 | ~5-6 hr | ready | 5 Alaska ports + Bing + GA |
| B5 | unknown | ready | Phase 3.6 — investigation first |
| B6 | ~3-4 hr | ready | validator refresh — should run early |
| B7 | ~2-3 hr | ready | 22-port weather sweep |
| B8 | many sessions | DEFER scoping | each L3 wants its own design pass |
| B9 | varies | DEFER decision | P0 paths need user direction |
| B10 | varies | DEFER scoping | Y-lane new tools each need scoping |
| B11 | varies | DEFER decision | Y-lane misc need spec / approval |
| B12 | varies | DEFER (R-lane) | human writes |
| B13 | varies | DEFER scoping | uncategorized + low priority |

**Total ready-to-ship effort:** approximately 20-26 hours of focused work across B1-B7.

**Decision queue blocking the rest:** B8 (3 L3 design passes), B9 (P0 path choices), B10 (4 tool scoping passes), B11 (6 spec/approval decisions), B13 (5 scoping decisions).

---

## A note on integrity

Every batch's acceptance criteria has at least one runnable verification command. Per careful-not-clever Anti-Theater Rule: "Verified without stating method" is invalid. If a batch ships and the verification command isn't run, the claim is incomplete.

The 2026-05-12 audit pass already produced two cases that prove the value of this discipline:
1. The "P1 children handling" bug was reported as fix-needed; verification showed it was already shipped on 2026-05-09/10, with tests literally named for the dollar figures in the bug report. No fix work happened.
2. The Codebase Status table claimed ~15,626 inline `style=` attributes from 2026-03-02; current grep shows 22,181. The CSS consolidation work has been net-negative since the last reported number. Without the refresh, batch 8's CSS Consolidation entry would have been planned against an obsolete baseline.

---

*Soli Deo Gloria.*
