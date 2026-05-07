# Ship-Page Standardization Master Plan — v3.0

**Status:** Active. Supersedes v2.0 (preserved at `admin/SHIP_STANDARDIZATION_PLAN.md`).
**Branch:** `claude/review-client-proposal-vILOr`
**Date opened:** 2026-05-07
**Fleet baseline at v3 open:** 290 ships · sh 78/67/145 · js 96/194 · 314 sh-errors · 297 js-errors
**Replaces:** v2.0 (phases 0–2 substantially complete; v3 redefines 3–5 around outcomes, not error counts)

---

## Why v3 exists

v2.0 fixed wiring: 1,009 individual repairs across 290 pages, two validators, per-line
config, fleet dashboard, four new rules. Real work, real progress.

v3 corrects six structural deficiencies that would otherwise let phase 3–5 land
without moving any business needle:

| # | v2 deficiency | v3 correction | Section |
|---|---|---|---|
| 1 | Measured in errors, not outcomes | Pre-phase GA4/GSC baseline; outcome KPIs gate Definition of Done | § 4 |
| 2 | "Easy first" phase order delays visible quality | Two parallel tracks: A=visible, B=semantic | § 5 |
| 3 | Vehicle @type migrated 290 ships without canary | 5-ship canary, 14-day GSC observation, then fleet | § 7.1 |
| 4 | 8 long-lived branches will replay the 23-ship conflict | Trunk-based, ≤72h branches, 5–10-ship micro-PRs, lock files | § 11 |
| 5 | TF-IDF cosine misses paraphrased duplicates | Sentence-embeddings (`all-MiniLM-L6-v2`, local) | § 7.4 |
| 6 | Image sourcing budget undefined | Per-line coverage audit gates phase; 5-tier fallback hierarchy | § 7.6 |

v3 also introduces five innovations that compound (§ 8): build-time HTML from `page.json`,
visible Citation Block, Facts-Verified badge, embedding-powered Similar Ships, and
open-sourcing the validator.

---

## 1. Executive summary (client-facing)

v2 measured itself by errors removed. v3 measures itself by **readers served, AI assistants
citing, and Google ranking**. We're adding canary releases for risky schema changes, real
fallback budgets for image work, modern embeddings instead of 2003-era similarity math,
and a public Citation Block that makes InTheWake the first cruise site Perplexity and
ChatGPT quote by name.

**Investment:** see § 12 effort matrix · **Outcome contract:** see § 10 Definition of Done.

---

## 2. Outcome contract (the "so what")

v3 is **not** done when the validators are green. v3 is done when **all** of:

1. 290/290 ships pass `validate-ship-page.js` and `validate-ship-page.sh`.
2. Zero ICP-2 rule violations across the fleet.
3. **Ship-page session depth +20%** vs. pre-v3 baseline (or documented why not).
4. **GSC structured-data eligibility for `Vehicle` ≥ pre-v3 `Cruise/Product` baseline.**
5. **Citation Block + Facts-Verified badge** present on all 290 ships.
6. **Validator + spec open-sourced** at github.com/inthewake/cruise-page-validator (≥1 external citation).
7. `admin/REPAIR_RUNBOOK.md` exists; a fresh Claude session can repeat any phase from it.

Items 3–6 are the v3-specific bar. Items 1, 2, 7 carry forward from v2.

---

## 3. Track model (replaces sequential phase ladder)

v2 specified 8 sequential branches. v3 splits into **two parallel tracks** that may both
run at any time, gated only by the lock files in § 11.

```
                 ┌──────────────── Track A (visible quality) ─────────────────┐
v2 done ───►     │ A1 image sourcing  ─►  A2 ai-summary  ─►  A3 section-order  │  ──► v3 done
                 │ A4 citation-block + facts-verified-badge                    │      (§ 10)
                 │ A5 similar-ships recommender                                │
                 └─────────────────────────────────────────────────────────────┘
                 ┌──────────────── Track B (semantic correctness) ────────────┐
                 │ B1 internal-consistency  ─►  B2 historic-verifier          │
                 │ B3 cross-link engine (embeddings)                          │
                 │ B4 sister-FAQ uniquifier (depends on B3)                   │
                 │ B5 build-time HTML-from-page.json                          │
                 │ B6 Vehicle canary ─► fleet rollout                         │
                 └─────────────────────────────────────────────────────────────┘
                 ┌──────────────── Cross-cutting ─────────────────────────────┐
                 │ X1 KPI baseline · X2 lock infra · X3 regression hook       │
                 │ X4 embeddings pipeline · X5 open-source spin-out           │
                 └─────────────────────────────────────────────────────────────┘
```

**Track A** ships visible improvements per release. A reader sees them.
**Track B** ships correctness improvements. A crawler/AI sees them.
**Cross-cutting** ships infra both tracks need.

---

## 4. KPI baseline (v3 gate item X1)

**Before any v3 phase runs**, capture:

```bash
# Save baseline snapshot to gate Definition of Done
node admin/capture-kpi-baseline.cjs \
  --ga4-property=$GA4_PROPERTY_ID \
  --gsc-site=https://cruisinginthewake.com \
  --window=28d \
  --pages='ships/**/*.html' \
  --out=audit-reports/business-kpi-baseline.json
```

Required fields in `audit-reports/business-kpi-baseline.json`:

| Field | Source | Why |
|---|---|---|
| `ga4.ship_page_avg_session_duration` | GA4 | DoD #3 reference |
| `ga4.ship_page_scroll_depth_p50` | GA4 | A4 effect target |
| `ga4.internal_link_ctr` | GA4 | A4/B3 effect target |
| `gsc.structured_data_valid_count` | GSC | DoD #4 reference |
| `gsc.indexed_ship_pages` | GSC | Vehicle canary observed |
| `gsc.impressions_28d` | GSC | Sanity floor (regression detector) |
| `gsc.avg_position_28d` | GSC | Sanity floor |

A template lives at `audit-reports/business-kpi-baseline.template.json`.

Re-snapshot after each track milestone. v3 fails DoD if item 3 not met or if any
sanity-floor metric drops by ≥10%.

---

## 5. Phases (mapped to tracks)

### Track A — visible quality

| ID | What | Inputs | Output | LLM hookpoint |
|---|---|---|---|---|
| A1 | Image sourcing for 138 ships | per-line coverage audit (§ 7.6) | ≥8 images per ship + attributions | `investigate` per gap |
| A2 | `ai-summary` rewriter on 6 ICP-018 ships | `voice-dna` baseline | unique ≤80-word summary | `orchestra` per ship |
| A3 | Section-order + col-1 holdouts (42 ships) | `template-drift-triage` skill | passing sh validator | none (deterministic) |
| A4 | Citation Block + Facts-Verified badge component | sources catalog from B1/B2 | `assets/js/citation-block.js` + CSS + per-ship JSON | none |
| A5 | Similar-ships recommender (build-time) | embeddings from X4 | `assets/data/similar-ships-index.json`, render rail | none |

### Track B — semantic correctness

| ID | What | Inputs | Output | LLM hookpoint |
|---|---|---|---|---|
| B1 | Internal-consistency repair (59 ships) | DATA-004 flags + authority hierarchy (§ 7.5) | canonical guest-count fix | `consult` only on disputes |
| B2 | Historic-ship verifier (30 TBD-stats ships) | Equasis, classification societies | sourced facts + page.json patch | `investigate` per ship |
| B3 | Cross-link engine on **embeddings**, not TF-IDF | X4 + ship-deployments.json + venues-v2.json | `audit-reports/cross-links/<slug>.json` | none |
| B4 | Sister-FAQ uniquifier (depends on B3) | per-class threshold (§ 7.4) | rewritten FAQ, no >threshold pairs | `orchestra` per FAQ |
| B5 | Build-time HTML generation from `page.json` | KEEP+HARDEN policy 0.4 + new SSG step | retires DATA-005; `page.json` becomes source-of-truth | none |
| B6 | Vehicle @type **5-ship canary** ➜ fleet rollout | SCHEMA-002 + GSC observation window | all 290 ships on `Vehicle` | none |

### Cross-cutting

| ID | What | Why |
|---|---|---|
| X1 | KPI baseline (§ 4) | gates DoD #3, #4 |
| X2 | Lock infra (§ 11) | prevents Track A/B collision |
| X3 | Pre-commit regression hook (§ 7.3) | prevents future regression |
| X4 | Embeddings pipeline (§ 7.4) | shared by A5, B3, B4 |
| X5 | Open-source spin-out of validator (§ 8.5) | DoD #6 |

---

## 6. New / changed validator rules

| Rule ID | What it catches | Phase | Status post-v3 |
|---|---|---|---|
| SCHEMA-002 | mainEntity @type whitelist + Vehicle preferred | B6 | live; canary-gated |
| ICP-018 | ai-summary boilerplate phrases | A2 | live |
| DATA-004 | internal numeric inconsistency | B1 | live |
| VOI-007 | anaphora-ladder + antithetical-parallelism stack | n/a | live |
| **DATA-005** | HTML↔page.json drift | B5 | **retired** by build-time generation |
| **CITE-001** | Citation Block fact has no `data-source-url` or `data-accessed` | A4 | new |
| **CITE-002** | Facts-Verified badge `data-verified` older than 180 days | A4 | new |
| **A11Y-040** | Hover-only tooltip without focus/longpress alternative | A4 | new (replaces v2's hover-preview) |

Each rule continues to live at `admin/validator-spec/rules/<ID>.md`.

---

## 7. Technical refinements (the "what changed since v2")

### 7.1 Vehicle @type — 5-ship canary

**Replaces v2's "migrate all 290 then monitor"** with empirical validation.

```
Canary cohort (one per archetype):
  rcl/icon-of-the-seas       (mega newbuild, JSON-LD-clean baseline)
  carnival/carnival-jubilee  (mid-tier, Excel-class)
  cunard/queen-mary-2        (heritage flagship)
  msc/msc-world-europa       (newbuild, non-NA-primary line)
  retired/cordelia-empress   (retired, edge-case for Vehicle vs former-Cruise)

Procedure:
  T+0d   migrate the 5 to mainEntity.@type = Vehicle
  T+0d   submit URLs to GSC for re-crawl
  T+14d  pull GSC structured-data report; compare:
           - "valid items" count for Vehicle vs prior Cruise/Product
           - indexing status delta
           - rich-results eligibility delta
  T+14d  pull GA4 ship-page sessions / position delta on canary URLs only
  T+14d  decision:
           PASS → fleet rollout via existing batch-fix script
           FAIL → revert canary; document; consider Product as fallback
```

Reversal cost on FAIL: 5 ships × `sed`. Information value: high.

### 7.2 page.json → build-time HTML (retires DATA-005)

v2 keeps two sources of truth and validates drift. v3 makes drift **architecturally
impossible**: HTML is generated from `assets/data/ships/<line>/<slug>.page.json` at
build time.

```
admin/build-ship-html.cjs
  reads:  assets/data/ships/<line>/<slug>.page.json   (source of truth)
          ships/<line>/<slug>.template.html           (layout, prose blocks)
  writes: ships/<line>/<slug>.html                     (committed; crawler-visible)
  fails:  if any field referenced by template is missing in JSON
```

Editorial workflow becomes: edit `page.json` numeric/factual fields **or** the
template prose blocks; never edit the rendered HTML directly. A pre-commit guard
rejects edits to rendered HTML if the corresponding `page.json` mtime is older.

Outcome: DATA-005 is retired; ICP-2 "facts in static HTML" requirement preserved
(build emits real HTML); future schema changes are one-file edits.

### 7.3 Pre-commit regression diff hook

```bash
# .githooks/pre-commit (v3 addition)
changed_ships=$(git diff --cached --name-only -- 'ships/**/*.html')
if [ -n "$changed_ships" ]; then
  for f in $changed_ships; do
    node admin/validate-ship-page.js "$f" \
      --baseline=audit-reports/ship-validation-dashboard.json \
      --regression-only \
      || { echo "REGRESSION on $f"; exit 1; }
  done
fi
```

`--regression-only` mode (new flag): fail iff a rule that **was passing** in
baseline now **fails** for this file. New ships are exempt; new rules are exempt.

### 7.4 Embeddings replace TF-IDF for similarity (X4)

```
admin/build-embeddings-index.cjs
  model:    sentence-transformers/all-MiniLM-L6-v2  (90MB, local, free)
  runtime:  @xenova/transformers (Node, no Python dependency)
  inputs:   per-ship FAQ blocks, full prose body, ai-summary
  output:   assets/data/embeddings-index.json   (~290 ships × 3 fields × 384 dim)
  size:     ~2.5MB committed, gzip ~1.2MB
```

Used by:
- **B3 cross-link engine:** ship→ship semantic neighbors (similar-ships rail).
- **B4 sister-FAQ uniquifier:** flag pairs with cosine ≥ per-class threshold.
- **A5 similar-ships recommender:** build-time pre-computed rail.

Per-class threshold lives in `assets/data/fleets.json`:

```json
{
  "groups": [
    { "class": "Radiance", "shared_spec_ratio": 0.78, "faq_similarity_max": 0.55 },
    { "class": "Quantum",  "shared_spec_ratio": 0.62, "faq_similarity_max": 0.70 },
    { "class": "Excel",    "shared_spec_ratio": 0.81, "faq_similarity_max": 0.50 }
  ]
}
```

### 7.5 Authority hierarchy for facts (replaces "LLM consensus")

LLM agreement is **not** ground truth. Per fact-class:

| Fact class | Primary | Secondary | Tertiary | LLM role |
|---|---|---|---|---|
| Tonnage, IMO #, year built, builder, registry | Equasis · classification society (Lloyd's, DNV) | cruise-line own press kit | Wikipedia infobox JSON | tie-breaker only |
| Guest count (double + max) | CLIA member directory | cruise-line own site | Wikipedia infobox | tie-breaker |
| Refurbishment dates | line news section + CruiseMapper | Wikipedia | press archives | tie-breaker |
| Godmother, christening date | line press archives | Wikipedia | trade press | tie-breaker |
| Itinerary / homeport | `assets/data/ship-deployments.json` (already authoritative) | line own site | n/a | n/a |

Skill `historic-ship-verifier` (B2) enforces this hierarchy in code; fact only
accepted from tier N+1 if tier N is absent or unreachable. Each fact emits with
`data-source-tier="1|2|3"` so the Citation Block (§ 8.1) can render it.

### 7.6 Image sourcing — coverage audit gates the phase

**Before A1 starts**, run a 1-day audit producing:

`audit-reports/image-coverage-audit.json`

```json
{
  "by_line": {
    "rcl":            { "ships_under_8": 4,  "wikimedia_avg": 14, "gap_avg": 0 },
    "msc":            { "ships_under_8": 22, "wikimedia_avg": 5,  "gap_avg": 3 },
    "explora":        { "ships_under_8": 4,  "wikimedia_avg": 1,  "gap_avg": 7 },
    "cordelia":       { "ships_under_8": 2,  "wikimedia_avg": 0,  "gap_avg": 8 }
  }
}
```

Then A1 fallback hierarchy, in order:

1. **Wikimedia Commons** — existing `admin/fetch-wiki-ship-images.py`.
2. **Cruise-line press/media kits** — script per line; one-time outreach where unpublished. Auto-attribution to "<Line> press kit, retrieved YYYY-MM-DD."
3. **Flickr CC-BY** filtered by ship-specific tag. Crop 1200×800; embed attribution as visible overlay + EXIF.
4. **Wayback Machine / Internet Archive** — for retired ships (Cordelia, Costa Allegra, Pacific Princess).
5. **Line-branded SVG hero (no carousel)** + visible Facts-Verified badge — last resort, beats `placeholder.png`.

Each sourced image commits with attribution row in `assets/data/atribution_registry.json`
the same commit. Existing IMG-014/ATTR-003 rules continue to enforce.

---

## 8. Innovations (v3-only)

### 8.1 Citation Block (the AEO win)

Render per-fact superscript citations on every ship page:

```html
<p class="fact">
  <span itemprop="payload">Brilliance of the Seas carries
  <strong>2,143 guests</strong> at double-occupancy<sup
    class="cite"
    data-source-url="https://www.equasis.org/EquasisWeb/restricted/ShipInfo?P_IMO=9223071"
    data-source-tier="1"
    data-accessed="2026-05-04">[1]</sup>
  </strong> across 13 decks.
  </span>
</p>
```

Renders as a Wikipedia-style superscript; clicking opens the source in a new tab.
The `data-source-*` attributes are unambiguous to AI assistants ingesting the page
(ChatGPT, Perplexity, Gemini, Claude). Competitors (CruiseMapper, CruiseCritic) ship
un-cited marketing copy; we become the cite-able primary source.

Validator: **CITE-001** (no fact in `<span itemprop="payload">` may lack `data-source-url`).

### 8.2 Facts-Verified badge

Below the fact-block on every ship page:

```html
<aside class="facts-verified" data-verified="2026-05-04" data-stale-after="180">
  <strong>Facts verified 2026-05-04</strong> by InTheWake editorial.
  Sources: Equasis · CLIA · RCL press kit ·
  <a href="/audit-reports/internal-consistency/brilliance-of-the-seas.md">audit</a>
</aside>
```

`data-stale-after` (days) drives automatic re-verification queue via
`content-freshness` skill. Wins:

- **Reader trust** — competitors don't show their work.
- **AI-assistant magnet** — assistants prefer dated, sourced content.
- **Editorial discipline** — staleness fires re-verify automatically.

Validator: **CITE-002** (badge older than `data-stale-after` is an error).

### 8.3 Similar-ships recommender (A5)

Build-time pre-computed rail using X4 embeddings:

```
admin/build-similar-ships-index.cjs
  inputs:  embeddings-index.json
  output:  assets/data/similar-ships-index.json
           { "icon-of-the-seas": ["utopia-of-the-seas","wonder-of-the-seas",...8 max] }
  render:  template snippet, no client-side cost
```

More serendipitous than hand-curated sister-rails; zero editorial maintenance.

### 8.4 Per-ship "What Changed" history (Schema.org `Event`)

For each refurbishment / sale / rename / retirement, emit:

```jsonld
{
  "@type": "Event",
  "name": "Brilliance of the Seas dry-dock 2026",
  "startDate": "2026-03-15",
  "endDate": "2026-04-22",
  "location": { "@type": "Place", "name": "Cádiz, Spain" },
  "description": "Dry-dock refurbishment: Royal Promenade refresh; new VOOM antenna.",
  "url": "https://www.example.com/press-kit/brilliance-2026-drydock"
}
```

Compounds yearly into ship histories no competitor has, because no competitor
maintains them. Stored in `assets/data/ships/<line>/<slug>.history.json`,
rendered as a collapsible timeline + emitted into JSON-LD.

### 8.5 Open-source the validator (X5)

Spin out `admin/validate-ship-page.js` + `validator-spec/` + the new v3 rules to
`github.com/inthewake/cruise-page-validator` under MIT. The 139-rule spec is
genuinely original work. Costs nothing; earns:

- backlinks + authority + recruiter signal
- possible community contributions from cruise bloggers
- credible third-party reference for the Citation Block we sell

Plan: extract submodule on completion of B5; mirror commit history; document in
README; submit to `awesome-cruise` lists; cross-link from `about-us.html`.

---

## 9. Documentation deliverables (v3)

| File | Purpose | Status at v3 open |
|---|---|---|
| `admin/SHIP_STANDARDIZATION_PLAN_V3.md` (this file) | v3 master plan | **created** |
| `admin/CLIENT_BRIEF_V3.md` | 1-page client pitch | **created** |
| `admin/SHIP_STANDARDIZATION_PLAN.md` (v2.0) | Preserved for history; header pointer to v3 | live |
| `admin/POLICY_DECISIONS.md` | All 5 policies (carry forward unchanged from v2) | live |
| `admin/REPAIR_RUNBOOK.md` | Retroactive runbook from Phase-2 commits + v3 phase steps | **pending** (DoD #7) |
| `admin/CROSS_LINK_AGENT_DESIGN.md` | Engine design (embeddings-based, not TF-IDF) | pending B3 |
| `admin/IMAGE_SOURCING_FALLBACK.md` | Documents § 7.6 fallback hierarchy | pending A1 |
| `admin/CITATION_BLOCK_SPEC.md` | Schema + a11y + AEO rationale for § 8.1 | pending A4 |
| `audit-reports/business-kpi-baseline.json` | DoD #3 reference | pending X1 |
| `audit-reports/business-kpi-baseline.template.json` | Schema for the above | **created** |
| `audit-reports/image-coverage-audit.json` | Gates A1 phase entry | pending |
| `audit-reports/cross-links/<slug>.json` | Per-ship suggestions from B3 | pending B3 |
| `audit-reports/internal-consistency/<slug>.md` | Per-ship B1 fix audit | pending B1 |
| `audit-reports/historic-ship-verification/<slug>.json` | Per-ship B2 fact audit | pending B2 |
| `admin/validator-spec/rules/CITE-001.md` `CITE-002.md` `A11Y-040.md` | new v3 rules | pending |

---

## 10. Definition of Done (binding)

v3 ships **only when all 7 are true**:

- [ ] **Validator parity:** 290/290 sh + js pass.
- [ ] **ICP-2 zero-violations:** `audit-reports/icp-lite-violations.json` has empty arrays.
- [ ] **Outcome KPI #1:** ship-page session depth ≥ baseline +20%, OR `audit-reports/dod-3-rationale.md` documents why.
- [ ] **Outcome KPI #2:** GSC structured-data valid count for `Vehicle` ≥ pre-v3 baseline for the same URLs.
- [ ] **Citation Block + Facts-Verified badge** on all 290 ships; CITE-001/CITE-002 zero-violations.
- [ ] **Validator open-sourced:** repo public, README live, ≥1 third-party reference.
- [ ] **`admin/REPAIR_RUNBOOK.md`** committed; spot-check: a fresh Claude session can rerun any A/B phase from it.

---

## 11. Branch + PR strategy (replaces v2 § "Branch and PR strategy")

Trunk-based, micro-PR, lock-coordinated.

**Rules:**
- One branch per phase (`claude/v3-A1-image-sourcing`, `claude/v3-B3-cross-link`, …).
- Branch lifetime ≤ **72 hours**. After that, rebase or PR-and-close.
- PRs are **5–10 ships each**, mergeable independently.
- **Daily** `git fetch && git rebase origin/main` is mandatory.
- A `audit-reports/_locks/<line>.lock` file prevents two agents touching the same fleet.
  Lock file is JSON with `{branch, agent, started_at, ttl_minutes}`. Pre-commit hook
  rejects edits to `ships/<line>/...` if `_locks/<line>.lock` is held by a different branch.

**Active branches at v3 open:**

| Branch | Purpose | Phase |
|---|---|---|
| `claude/review-client-proposal-vILOr` | this v3 plan + CLIENT_BRIEF + scaffolding | meta |
| `claude/v3-X1-kpi-baseline` | capture baseline, define DoD references | X1 |
| `claude/v3-X2-lock-infra` | lock files + pre-commit guard | X2 |
| `claude/v3-X3-regression-hook` | --regression-only flag + pre-commit hook | X3 |
| `claude/v3-X4-embeddings` | one-time embeddings pipeline + cache | X4 |
| `claude/v3-A1-image-sourcing` | per-line agent fleet | A1 |
| `claude/v3-A2-ai-summary` | 6 ICP-018 rewrites | A2 |
| `claude/v3-A3-section-order` | 42 holdouts | A3 |
| `claude/v3-A4-citation-block` | component + per-ship JSON + CITE rules | A4 |
| `claude/v3-A5-similar-ships` | build script + render rail | A5 |
| `claude/v3-B1-internal-consistency` | 59 ships, agent-batched | B1 |
| `claude/v3-B2-historic-verifier` | 30 TBD-stat ships + authority hierarchy | B2 |
| `claude/v3-B3-cross-link-embeddings` | engine + 3 build scripts | B3 |
| `claude/v3-B4-sister-faq-uniquifier` | depends on B3 | B4 |
| `claude/v3-B5-build-time-html` | SSG step + DATA-005 retirement | B5 |
| `claude/v3-B6-vehicle-canary` | 5-ship migration → fleet | B6 |
| `claude/v3-X5-validator-spinout` | open-source extraction | X5 |

X1–X4 should land first. A1 and B1 then run in parallel. B6 must be canary-only
until +14 days; only then merges fleet rollout.

---

## 12. Effort + sequencing matrix

| Phase | Effort | Wallclock (1 agent) | Parallelizable | Predecessors |
|---|---|---|---|---|
| X1 | XS | 0.5d | — | none |
| X2 | S | 1d | — | none |
| X3 | S | 1d | — | none |
| X4 | S | 1d | — | none |
| A1 | XL | 7d | yes (per-line) | X2 |
| A2 | S | 1d | yes | none |
| A3 | M | 2d | partial | X3 |
| A4 | M | 3d | — | B1 partial |
| A5 | S | 1d | — | X4 |
| B1 | M | 4d | yes (per-line) | X3 |
| B2 | L | 5d | yes | X3 |
| B3 | M | 2d | — | X4 |
| B4 | M | 3d | — | B3 |
| B5 | M | 3d | — | none (but easier post-A1) |
| B6 | S+wait | 0.5d + 14d obs | — | A4 helpful |
| X5 | S | 1d | — | DoD #1, #2 met |

**Critical path:** X4 → B3 → B4. Wallclock floor with single agent ≈ 6 days.
With 3 parallel agents (lock-coordinated) ≈ 14–18 calendar days plus the
14-day Vehicle canary observation window, dominating wallclock.

---

## 13. Risks register

| Risk | Severity | Owner | Mitigation date |
|---|---|---|---|
| Vehicle @type de-ranks vs Product | **High** | SEO | B6 canary closes day 14 |
| Image sourcing exceeds budget | **High** | Editorial | A1 coverage audit closes day 1 |
| Cross-line agent conflicts on parallel branches | Medium | Eng | X2 lock infra + 72h branch lifetime |
| LLM-amplified factual error in historic ships | **High** | Editorial | § 7.5 authority hierarchy enforced in B2 skill |
| `page.json` build-time generation breaks crawler indexing | High | Eng | B5 render-test with Googlebot UA before cutover |
| Embedding model drift if upgraded mid-project | Low | Eng | Pin `all-MiniLM-L6-v2@v2` in package.json |
| WCAG complaint on hover-preview as v2-specced | Medium | A11y | A11Y-040 + focus/longpress drawer (replaces v2 hover) |
| Open-source spin-out leaks proprietary editorial signal | Low | Editorial | X5 strips `audit-reports/`, only ships validator + spec |
| Citation Block source URLs rot | Medium | Editorial | Facts-Verified `data-stale-after` retriggers re-verify |

---

## 14. Multi-LLM hookpoints (revised)

| Decision / step | Tool | Status | Authority override |
|---|---|---|---|
| Policy 0.1 (mainEntity @type) | `orchestra` | done v2; canary in B6 | empirical (GSC) trumps |
| Policy 0.2 (canonical guest-count) | `consult` | done v2 | CLIA/line-own/Wikipedia trumps |
| Policy 0.3 (image count threshold) | `investigate` | done v2 | Baymard cited; carry forward |
| Policy 0.4 (page.json fate) | `orchestra` | done v2; B5 hardens to SSG | n/a |
| ai-summary rewrites (A2) | `orchestra` per ship | pending | voice-dna baseline binding |
| Sister-FAQ rewrites (B4) | `orchestra` per FAQ | pending | per-class threshold binding |
| Historic-ship verification (B2) | `investigate` per ship | pending | **§ 7.5 hierarchy binding** |
| Cross-link UX patterns (A4) | none — A/B test | new | GA4 dwell-time decides |
| Image sourcing (A1) | `investigate` per gap | pending | § 7.6 fallback binding |

Adapter status carry-forward from v2.0: bash `bootstrap-env.sh` restores keys
for GPT, Grok, Perplexity, You.com. Gemini blocked on cffi import.

---

## 15. Verification commands (v3)

```bash
# 1. Both validators on a known-clean ship
bash admin/validate-ship-page.sh ships/rcl/grandeur-of-the-seas.html
node admin/validate-ship-page.js ships/rcl/grandeur-of-the-seas.html

# 2. Refresh full-fleet dashboard
node admin/aggregate-ship-validation.js --quiet
jq '{totals, top_rules: (.errors_by_rule | to_entries | sort_by(.value) | reverse | .[0:8])}' \
   audit-reports/ship-validation-dashboard.json

# 3. KPI baseline freshness (DoD #3, #4)
jq '.captured_at, .ga4.ship_page_avg_session_duration, .gsc.structured_data_valid_count' \
   audit-reports/business-kpi-baseline.json

# 4. Vehicle canary status
node admin/check-vehicle-canary.cjs --since=14d --strict

# 5. Citation Block coverage
node admin/check-citation-coverage.cjs --min=1 --target=ships/

# 6. Sister-FAQ similarity at per-class thresholds (embeddings)
node admin/cross-link-engine.cjs --report-similarity --use-embeddings --per-class-threshold

# 7. Pre-commit regression hook still works
git diff --cached --name-only -- 'ships/**/*.html' | head -1 \
  | xargs -I{} node admin/validate-ship-page.js {} --regression-only

# 8. Lock files all released
ls audit-reports/_locks/*.lock 2>/dev/null && echo "stale locks held" || echo "ok"
```

---

## 16. Migration from v2.0

v2.0 phase 0–2 work is **preserved as-is**. v3 picks up where v2 left off.

| v2 phase | v2 status | v3 disposition |
|---|---|---|
| 0 (policies) | done | carry forward; B6 canary validates 0.1 empirically |
| 1 (validator extensions) | done | carry forward; X3/A4 add new rules |
| 2 (bulk repair) | done (1009 fixes / 290 ships) | carry forward |
| 3.1 internal-consistency | pending | **becomes B1** |
| 3.2 ai-summary | pending | **becomes A2** |
| 3.3 sister-faq-uniquifier | pending | **becomes B4** |
| 3.4 historic-verifier | pending | **becomes B2** |
| 3.5 image sourcing | pending | **becomes A1** (with § 7.6 hierarchy) |
| 3.6 runtime JSON cascade | pending | folded into B5 (SSG retires the cascade problem) |
| 3.7 template-drift-triage | pending | **becomes A3** |
| 4 cross-link agent | pending | **becomes B3** (embeddings, not TF-IDF) |
| 5 visual convergence | pending | folded into B5 + Playwright snapshots |

---

## 17. Where to start (fresh-Claude entry point)

1. Read this file end-to-end.
2. Read `admin/CLIENT_BRIEF_V3.md` (the elevator).
3. Read `admin/POLICY_DECISIONS.md` § 0.1–0.5 (decisions still binding).
4. Read `claude.md` § Critical NEVER DO Rules (gaming patterns).
5. Confirm `audit-reports/business-kpi-baseline.json` exists. If not, run X1 first.
6. Pick a phase from § 5; create the matching branch from § 11; follow the runbook.
7. Each commit must pass the regression hook (§ 7.3). Each PR is 5–10 ships.

---

**Soli Deo Gloria.**
