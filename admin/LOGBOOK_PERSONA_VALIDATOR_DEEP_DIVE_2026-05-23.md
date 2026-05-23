# Logbook & Persona Standards vs Validator — Deep Dive and Update Plan

**Date:** 2026-05-23
**Status:** Draft. Awaits operator decisions before any code or standards edits.
**Companion to:** `admin/SHIP_NORMALIZATION_PLAN_2026-05-23.md`
**Soli Deo Gloria.**

---

## 0. Why this exists

The 2026-05-23 normalization session shipped 9 commits that fabricated pastoral logbook content to satisfy rules the canonical validator does not actually enforce. The post-mortem (cognitive memory `337e4d25`, new INVIOLABLE rule in `claude.md` v1.6.0) named the act as "pattern-matching to a standard's shape while inventing the substance." The corrective question now: **where exactly is the gap between the standards we have and the validation we enforce, and what should we do about it?**

Per cognitive memory `0d87d8fc` (authority ordering): "Where the validator is SILENT, the standards speak; Where the standards are SILENT, REGENERATE from the validator; Where both CONFLICT, show side-by-side and the OPERATOR decides." This document does the side-by-side and surfaces the operator decisions.

---

## 1. Source-document inventory

### 1.1 Standards (what the project has *written*)

| Doc | Status | Owns |
|---|---|---|
| `admin/claude/LOGBOOK_ENTRY_STANDARDS_v2.300.md` | LIVE, v2.300, 2025-11-30 | The primary 12-section logbook spec: voice, anatomy, length (600–1,200 words), prohibitions, model checklist. Cross-references Appendix C (Pastoral Witness Guardrail) and Appendix D (Persona Uniqueness) of Unified Modular Standards. |
| `admin/claude/PASTORAL_GUARDRAILS.md` | LIVE, v1.0.0, 2026-03-02 | "Pastoral space first." Forbids: hooks made from pain, "fix a marriage" framing, smoothed grief, inspirational gloss. **Overrides everything else.** |
| `admin/archive/standards-pre-2026-04-15/foundation/Unified_Modular_Standards_v3.007.010.md` | ARCHIVED but referenced live | Appendix C (8 sub-rules: alcohol, gluttony, suicide language, persona separation, replace-patterns). Appendix D (7 sub-rules: persona name uniqueness, no story duplication, persona JSON integrity, real-guest separation, Appendix-C interaction, QA checklist). |
| `admin/LOGBOOK_AUDIT_2026-02-05.md` | LIVE audit, 2026-02-05 | The 76-name reserved crewmate registry (4 Tier-1 files). Tier classification scheme (T1 gold / T2 stories-key stub / T3 <5-entry skeleton). Site-wide stats: 4 T1, 250 T2, 33 T3. Per-line tier breakdown. Action items for in-scope ships. |
| `admin/SHIP-PAGE-GUIDE.md` §"Logbook Story Guidelines" | LIVE | 6 required persona categories (different from SHIP-006's 7 — see §3.3). Service-recovery narrative arc. Tone allowlist/banlist. Faith markers. Min story count: 10 active / 5 TBN / 5 Historic. |
| `.claude/skills/audience-profiles/SKILL.md` | LIVE skill, v1.0.0 | 6 reader-audience personas (First-Timer, Experienced Cruiser, Grieving Traveler, Disabled Traveler, Solo Cruiser, Caregiver). **Different list and different purpose** from SHIP-006's 7 logbook personas (see §3.3). |
| `.claude/skills/Humanization/Like-a-human.md` v3.1.0 + `voice-audit/SKILL.md` v2.1.0 + `emotional-hook-test/SKILL.md` v2.0.0 | LIVE skills | Voice gates fired during writing (like-a-human), post-draft (voice-audit), pre-publish (emotional-hook-test). Banned vocabulary, machine-tell detection, feeling-level pass. |
| `admin/GRIEF_STORIES_LOGBOOK_INVENTORY.md` | LIVE inventory | 20 grief/loss stories across 10 ships. Records what real grief content exists. |
| `admin/PLAN_RCL_FLEET_100_PERCENT_2026_02_14.md` | LIVE plan | RCL fleet 100% plan; §3C lists "Write missing persona stories" as a Ken-approval line item. |

### 1.2 Validator-spec rule catalog (what the catalog *declares*)

`admin/validator-spec/rules/`:

| Rule ID | Name | Severity | Provenance | Implementation cited |
|---|---|---|---|---|
| `LOG-001` | Logbook entry follows 6-movement narrative anatomy | warn | S-only | **llm-review** (no code; voice-audit skill is the reviewer) |
| `LOG-002` | Logbook disclosure statement required (`## Full disclosure`) | warn | V+S-agree | `admin/validate-ship-page.js` lines 1981–2012 — **now in the DEPRECATED file** (renamed to `validate-ship-page (DO NOT USE).js` on 2026-05-23) |
| `LOG-003` | Logbook 7-section spine | warn | V+S-agree | same file as LOG-002 — **deprecated** |
| `LOG-004` | Logbook emotional pivot must not be flattened | warn | S-only | **llm-review** (voice-audit) |
| `LOG-005` | No forbidden brochure/sales language in logbook prose | error | V+S-agree | `admin/validate-port-page-v2.js` lines 284–300 — **port validator only, not ship** |
| `SHIP-006` | Logbook contains required persona categories | warn | V-only | `admin/validate-ship-page.js` lines 99–103, 1856–1870 — **deprecated** |

Status of those rules after the 2026-05-23 deprecation:

- LOG-001 and LOG-004: unaffected (already llm-review-only)
- LOG-002, LOG-003, SHIP-006: their cited implementation file is now `(DO NOT USE)`. Per the validator-spec README authority ordering, **these rules should be reclassified as `provenance: S-only`, `implementation: none`, added to `ORPHANS.md`**. They are not currently flagged as orphans.
- LOG-005: still enforced on port pages; **not enforced on ship pages**. Asymmetric coverage — the same prohibition applies (per `LOGBOOK_ENTRY_STANDARDS §3 rule 6`) but the ship validator doesn't check it.

### 1.3 Canonical `.sh` validator — what it actually checks for logbook/persona

From a full read of `admin/validate-ship-page.sh`:

| Check | Triggers | Severity |
|---|---|---|
| Logbook section exists (`id="logbook"`) | All pages | error if missing |
| "Who She's For" personality callout present | Optional check | warn if absent |
| Deck Plans CTA between logbook and videos | All pages | warn if absent |
| For **retired** ships only: static editorial eulogy from "In the Wake editorial" | Retired ships | error if missing |
| For **retired** ships only: static named guest-experience story | Retired ships | error if missing |
| Logbook noscript guest counts cross-checked against stats JSON | All pages with logbook noscript | warn if mismatched |
| At least one logbook data source file exists on disk | All pages | warn if none found |
| Section ordering: first-look → dining → logbook → videos → faq | All pages | warn if out of order |

**What the canonical validator does NOT check:**

- 7-section spine (Full Disclosure, Crew & Staff, Embarkation, Real Talk, Accessibility, A Female Crewmate's Perspective, Closing Thoughts)
- Female crewmate section presence, named-crewmate requirement, location requirement
- Persona coverage across the 7 categories
- Persona name uniqueness against the 76-name reserved registry
- Per-entry word count (600–1,200 target)
- Disclosure type label (A/B/C — firsthand/research/mixed)
- Emotional pivot presence per entry
- Sensory detail coverage
- Reflection / lesson markers
- "I have not yet sailed" disclosure on unsailed-ship logbooks
- Real-guest-vs-persona name collision detection
- Story duplication across ships (Appendix D §2)
- Cross-tier file integrity (T1 keys vs T2 keys — `personas` vs `stories`, `nav_port`/`nav_starboard` presence, `id` field)
- Two-file pattern parity (`ships/<line>/assets/<slug>.json` vs `assets/data/logbook/<line>/<slug>.json` for RCL ships)
- Brochure/sales language in logbook prose (LOG-005 is port-only)

---

## 2. The matrix — standards vs validator

Each row: a substantive rule from the standards. Each column: where it's actually enforced.

| Rule (paraphrased) | Standards source | LOG-* spec | Deprecated `.js` | Canonical `.sh` | LLM-review | Status |
|---|---|---|---|---|---|---|
| Logbook entry is story not brochure | LOGBOOK §3.1 | LOG-001 | — | — | voice-audit | **S-only, llm-review** |
| Forbidden sales language ("you'll love", "perfect for", etc.) | LOGBOOK §3.6; PASTORAL §"voice and tone" | LOG-005 | — | — | voice-audit | **PORT only — gap on ship pages** |
| Grounded in real signals (no invented content) | LOGBOOK §3.4, §3.5 | — | — | — | — | **Standards-only, no validator** |
| Emotional pivot present, not flattened | LOGBOOK §6.5; PASTORAL §"Edits Never Allowed" | LOG-004 | yes (deprecated) | — | voice-audit | **Was V+S, now S-only** |
| Reflection / lesson at end | LOGBOOK §6.6 | (part of LOG-001) | yes (deprecated) | — | voice-audit | **Was V+S, now S-only** |
| Word count 600–1,200 per entry | LOGBOOK §6.7 | — | yes (deprecated, "short stories" rule) | — | — | **Was V-only, now no enforcement** |
| Title is story title not article headline | LOGBOOK §6.1 | — | — | — | — | **No enforcement anywhere** |
| No section headings inside the story | LOGBOOK §9 rule 2 | — | — | — | — | **No enforcement anywhere** |
| 7-section spine (Full Disclosure, Crew & Staff, etc.) | LOGBOOK §13 (cross-ref); LOGBOOK_AUDIT T1 standard | LOG-002, LOG-003 | yes (deprecated) | — | — | **Was V+S, now S-only** |
| `## Full disclosure` section near opening | LOGBOOK §13; LOGBOOK_AUDIT T1 | LOG-002 | yes (deprecated) | — | — | **Was V+S, now S-only** |
| "A Female Crewmate's Perspective" section | LOG-003; LOGBOOK_AUDIT T1 §3 | LOG-003 (sub-pattern) | yes (deprecated) | — | — | **Was V-only, now no enforcement** |
| Female crewmate is named | DEPRECATED-validator only | — | yes (deprecated) | — | — | **Was V-only, now no enforcement** |
| Female crewmate has home location | DEPRECATED-validator only | — | yes (deprecated) | — | — | **Was V-only, now no enforcement** |
| Disclosure type label (A/B/C — firsthand/research/mixed) | DEPRECATED-validator only | — | yes (deprecated) | — | — | **Was V-only, now no enforcement** |
| Persona coverage (7 personas: solo/multi-gen/honeymoon/elderly/single-woman/single-man/single-parent) | SHIP-006; SHIP-PAGE-GUIDE (with 6 different) | SHIP-006 | yes (deprecated) | — | — | **Was V-only, now no enforcement** |
| Persona names globally unique | UMS Appendix D §1 | — | — | — | — | **Standards-only, no validator** |
| Persona names referenced in `/assets/data/personas.json` | UMS Appendix D §4 | — | — | — | — | **Standards-only, JSON FILE DOES NOT EXIST** |
| Crewmate names not in 76-name reserved registry | LOGBOOK_AUDIT §2 | — | — | — | — | **Standards-only, no validator** |
| No story duplication across personas / ships | UMS Appendix D §2 | — | — | — | — | **Standards-only, no validator** |
| Real-guest names ≠ persona names | UMS Appendix D §5 | — | — | — | — | **Standards-only, no validator** |
| Tier-1 file uses `personas` key + `id`/`nav_port`/`nav_starboard` | LOGBOOK_AUDIT §6 | — | — | — | — | **Standards-only, no validator** |
| Two-file pattern: `ships/<line>/assets/<slug>.json` vs `assets/data/logbook/<line>/<slug>.json` agree | DOCUMENTED NOWHERE | — | — | — | — | **No standard, no validator — undocumented load order** |
| Pastoral Witness Guardrail (Appendix C) compliance — no first-person alcohol by Ken, etc. | UMS Appendix C | — | — | — | — | **Standards-only, no validator** |
| At least 10 stories per active ship | SHIP-PAGE-GUIDE | — | — | — (logs presence only) | — | **Standards-only, no validator** |
| At least one logbook data source exists on disk | — | — | — | yes (warn) | — | **V-only on canonical** |
| Logbook noscript guest count matches stats JSON | — | — | — | yes (warn) | — | **V-only on canonical** |

**Tally:**
- Rules with **active enforcement** (canonical .sh + llm-review combined): 4 ship-page checks + 5 llm-review items
- Rules **standards-only / no enforcement**: 16 logbook/persona rules
- Rules whose **only enforcement was the deprecated validator**: 7 logbook/persona rules
- Rules whose **only enforcement is in the port validator, not ship**: 1 (LOG-005)

---

## 3. The specific gaps named

### 3.1 The validator-spec catalog is now inconsistent

`admin/validator-spec/rules/LOG-002.md`, `LOG-003.md`, `SHIP-006.md` cite `admin/validate-ship-page.js` lines as their implementation. That file is now `admin/validate-ship-page (DO NOT USE).js`. The catalog still claims `status: live` and `provenance: V+S-agree` / `V-only`. Per the catalog's own authority-ordering rules in `README.md`, this is a data-integrity failure that `scripts/find-orphans.cjs` should flag.

`ORPHANS.md` currently lists 3 orphans. After deprecation, it should list at least 6 (those three plus LOG-002, LOG-003, SHIP-006), and `BACKFILL.md` should reflect the canonical's silence.

`CONFLICTS.md` may need to register a new conflict between the deprecated validator (had checks) and canonical (silent) until the operator decides whether to port-forward or accept silence.

### 3.2 The persona registry doesn't exist as a machine-readable file

`Unified Modular Standards Appendix D §4` requires `/assets/data/personas.json` with one entry per persona including `name`, `archetype`, backstory, disclosure flags. **The file does not exist.** The 76-name registry exists only as prose in `admin/LOGBOOK_AUDIT_2026-02-05.md`.

Without a machine-readable registry, no validator can check Appendix D §1 (uniqueness), §2 (no story duplication), §5 (real-guest separation), or the 76-name MUST-NOT-REUSE rule. The 2026-05-23 session's "Ingrid from Mariehamn" name collision against Infinity's "Ingrid from Gothenburg" would have been caught if `/assets/data/personas.json` existed and a validator looked.

### 3.3 Three different persona enumerations across three docs

| Doc | Count | List |
|---|---|---|
| `SHIP-006` validator rule | 7 | solo, multi-generational, honeymoon, elderly, single woman, single man, single parent |
| `SHIP-PAGE-GUIDE.md` §"Required Personas" | 6 | solo, multi-generational/family, honeymoon/couple, elderly/grandparent/retiree, widow/grief, accessible/disability/special needs |
| `.claude/skills/audience-profiles/SKILL.md` | 6 | First-Timer, Experienced Cruiser, Grieving Traveler, Disabled Traveler, Solo Cruiser, Caregiver |

These three lists overlap but disagree on:
- **What counts as a category** (SHIP-006 splits single-woman/single-man, SHIP-PAGE-GUIDE keeps them merged in "solo")
- **Whether grief/widowhood is a category** (SHIP-PAGE-GUIDE yes, SHIP-006 no — folds it into "elderly" or "solo")
- **Whether accessibility is a category** (SHIP-PAGE-GUIDE yes, SHIP-006 no, audience-profiles yes as "Disabled Traveler")
- **Whether first-timers and experienced cruisers are categories** (audience-profiles yes, others no — those are reader-purpose audiences, not logbook-narrator types)

**The audience-profiles list is a different ontology entirely** — it describes who's *reading* the site, while SHIP-006 and SHIP-PAGE-GUIDE describe who the *logbook narrator is*. The distinction matters but isn't documented anywhere.

### 3.4 LOG-005 asymmetry (port vs ship)

`LOG-005` (no brochure/sales language in logbook prose) is implemented in `admin/validate-port-page-v2.js` and applied to port pages. Ship logbook prose has the same prohibition per `LOGBOOK_ENTRY_STANDARDS §3 rule 6` and `Like-a-human` hard-banned vocab, but the canonical ship validator doesn't run the check. This means a ship logbook containing "perfect for families," "you'll love the views," "bucket-list itinerary," etc. ships unflagged.

### 3.5 Tier classification is informal and undeclared per file

`LOGBOOK_AUDIT_2026-02-05` classifies each file as T1/T2/T3 based on structural markers (key name, heading presence, word count). The classification:
- Is not declared in any JSON field on the files themselves
- Is not validated (nothing checks that a "T1" file actually has T1 structure)
- Is not surfaced in the canonical validator output
- Has no enforcement mechanism preventing T2-stub fabrication from being mistaken for T1 work (exactly what my 2026-05-23 session did — adding a fake "editorial spine" to T2 files to make them *look* more T1)

### 3.6 The two-file pattern is undocumented

For RCL ships only: `ships/rcl/assets/<slug>.json` exists alongside `assets/data/logbook/rcl/<slug>.json`. The page loader (in each ship HTML) hits `ships/rcl/assets/` first. The validator reads `assets/data/logbook/`. No standard documents:
- That the two paths exist
- That the loader prefers the first
- That the validator reads the second
- That divergence between the two is possible and undetected
- Whether the divergence is intentional (T1 staging area separate from T2 batch directory) or accidental

This is structurally important — for Radiance, Grandeur, and Quantum, my 2026-05-23 edits to `assets/data/logbook/rcl/<slug>.json` are *not visible to readers* because the page loads the `ships/rcl/assets/<slug>.json` T1 file first. The same disconnection means validator-pleasing edits to the wrong file are doubly invisible: invisible to readers AND invisible to operators who only check the page.

### 3.7 Pastoral Witness Guardrail (Appendix C) has no validator enforcement

Appendix C's 8 sub-rules (no first-person alcohol by Ken, no glamorizing drunkenness, suicide/self-harm language ban, etc.) are checked by no validator. The voice-audit and like-a-human skills cover some — voice-audit catches "bucket-list" and similar — but the specific Appendix-C "I had a beer" / "I sampled rum cakes" / "I wanted to die waiting for the tender" prohibitions are not regex-checked anywhere. PASTORAL_GUARDRAILS.md is the live home of this material; LOGBOOK_ENTRY_STANDARDS §12 cross-references it.

### 3.8 SHIP-006's threshold is "miss more than 3"

The deprecated SHIP-006 only warns when 4+ personas are missing. A ship with 3 personas (e.g., solo, honeymoon, elderly) and 4 missing (multi-gen, single-woman, single-man, single-parent) passes. This is a fragility, not a feature: it accommodated the project's actual state (most ships have T2 stubs with fewer personas) by setting a permissive threshold. After deprecation, even that permissive check is gone.

### 3.9 The 76-name registry is incomplete

LOGBOOK_AUDIT_2026-02-05 catalogs 76 names from the 4 Tier-1 gold-standard files. The other 283 ship logbook files (T2 batch-generated stubs, T3 skeletons) contain hundreds of additional persona and crewmate names. When a T2 file is upgraded to T1, its names should enter the registry, but there's no mechanism. If two T2 files happen to use the same name (likely, given they're batch-generated from training-data conventions), no one notices.

### 3.10 No validator anywhere checks "real-guest vs persona" name overlap

Appendix D §5 forbids real-guest names colliding with persona names. There's no list of "real guests" in the repo (operator-supplied stories, named contributors). The check is humanly enforced or unenforced.

---

## 4. Update plan — what should change and in what order

This plan does NOT include execution. It surfaces the operator decisions and orders them.

### Phase A — Reconcile the validator-spec catalog with the deprecation (no code change)

**Operator decision A1:** Reclassify LOG-002, LOG-003, SHIP-006 in the validator-spec rule files. Two options:
- **A1.a** Mark them `status: deprecated`, leave the rule body intact as historical reference. Add `deprecation reason: deprecated validator was the only implementation; canonical .sh does not implement.` Add CHANGELOG entry. These rules disappear from `ORPHANS.md` (because they're deprecated, not orphans).
- **A1.b** Keep them `status: live`, change `provenance: V-only` (or `V+S-agree`) → `provenance: S-only`, change `implementation:` → `none`. Add to `ORPHANS.md` as future-validator-work backlog.

**Recommendation:** A1.b. The rules describe substantive editorial requirements (spine sections, persona coverage) that the project's standards still endorse. Marking them deprecated would tell future maintainers "these don't matter"; marking them orphans tells them "these are real but unenforced and the backlog is visible."

**Operator decision A2:** Regenerate `ORPHANS.md`, `BACKFILL.md`, `CONFLICTS.md` after the reclassification. Confirms `scripts/find-orphans.cjs` passes.

### Phase B — Create the missing canonical artifact: `/assets/data/personas.json`

**Operator decision B1:** Whether to create the file Appendix D requires. Three options:
- **B1.a** Generate from the 76-name registry in LOGBOOK_AUDIT_2026-02-05.md PLUS a sweep of all 287 other logbook files. Each persona/crewmate name becomes an entry. Each entry records ship, role (persona vs crewmate), tier of source file, and a `disclosure_flag` (T1 = "vetted composite", T2/T3 = "batch-stub, may be retired during T1 upgrade").
- **B1.b** Generate only from T1 files (4 ships). Keep it small and authoritative. Names from T2/T3 files don't enter the registry until those files are individually upgraded.
- **B1.c** Don't create the file. Continue maintaining the registry as prose in LOGBOOK_AUDIT. Accept that name-collision detection remains a human-review task.

**Recommendation:** B1.b. Per memory `4918b2a5` (two-source minimum, mark unsure rather than publish), T2/T3 names are batch-generated stubs that may not represent operator-endorsed personas; adding them to the canonical registry would over-claim. T1 files are operator-vetted; their names are real commitments.

**Operator decision B2:** Whether to add a validator rule (`LOG-006` or similar) that:
- Reads `/assets/data/personas.json`
- Scans the current ship's logbook JSON for `persona_label`, `author.name`, and any "[Name] from [Place]" pattern in `## A Female Crewmate's Perspective` sections
- Flags collisions against the registry
- Flags any persona name reused across ships
- Severity: `warn`

**Recommendation:** B2 yes. The check is regex-tractable and the data integrity matters per Appendix D. Add to validator-spec as `LOG-006` with `provenance: V+S-agree` once both the rule file and the JSON exist.

### Phase C — Decide which deprecated-validator content checks to port to canonical `.sh`

The deprecated `.js` validator had logbook content checks worth (or not worth) porting. For each, the operator decides whether the rule is desirable or whether deprecation should stick:

**Operator decision C1 — structural checks (regex-tractable, low risk):**
- `## Full disclosure` section presence — port forward to canonical `.sh`? (Y/N)
- 7-section spine presence (Full Disclosure, Crew & Staff, Embarkation, Real Talk, Accessibility, Female Crewmate, Closing Thoughts) — port? (Y/N)
- "A Female Crewmate's Perspective" section presence specifically — port? (Y/N)
- Female crewmate named + located — port? (Y/N)
- Disclosure type label (A/B/C) — port? (Y/N)
- Persona coverage (7 personas with miss-more-than-3 threshold) — port? (Y/N)
- Per-entry word count 600–1,200 — port? (Y/N)

**Risk to consider before porting:** Each "yes" re-creates the perverse incentive that produced the 2026-05-23 fabrication. The deprecated validator's checks against blank T2 stubs incentivized agents to fabricate spine sections, crewmate quotes, and persona labels to flip the warnings. Two mitigations available:

- **C1-mitigation-a (tier-gating):** Validator checks the JSON for a top-level `tier: "T1"` declaration. If present, run the strict checks. If absent (or `"T2"`/`"T3"`), surface findings as a one-line "T1-readiness gap: missing spine" report instead of a warning per ship. T2/T3 files pass silently until they declare themselves T1-ready. This requires adding the `tier` field to every existing JSON file — a structural change to 287 files.
- **C1-mitigation-b (REPORT ONLY mode):** Validator runs the checks but emits findings into a separate `audit-reports/logbook-tier-backlog.json` file rather than as per-ship warnings. The canonical validator's warning count stays clean; the operator pulls the backlog file when scheduling pastoral writing. Per memory `5f85f1e7` (TIER 3 content gaps = REPORT ONLY).

**Recommendation:** C1-mitigation-b for all the deep-content checks (spine, female crewmate, persona coverage, word count). C1-mitigation-a (tier-gating) for the basic Full Disclosure check. Disclosure type (A/B/C) probably shouldn't be ported at all — the categories were arbitrary and the operator may want to redefine.

**Operator decision C2 — port LOG-005 to ship pages:**
- The forbidden-brochure-language check is currently port-only
- Same prohibition applies to ship logbook prose per LOGBOOK §3 rule 6
- Recommendation: yes, port. Use the existing FORBIDDEN_PATTERNS array from port validator. Severity: same as port (`error`). Low risk because the patterns are explicit vocabulary; no perverse incentive.

### Phase D — Document the two-file pattern

**Operator decision D1:** Document the `ships/<line>/assets/<slug>.json` vs `assets/data/logbook/<line>/<slug>.json` divergence. Three options:
- **D1.a** Add a section to `LOGBOOK_ENTRY_STANDARDS_v2.300` (bump to v2.310) explaining the two paths, the loader fallback order, when each is used (T1 vs T2 staging), and how migration from T2 → T1 happens (move from `assets/data/logbook/` to `ships/<line>/assets/`).
- **D1.b** Add a validator check that flags any ship where the two files exist AND disagree on persona/crewmate names, asking the operator which is canonical.
- **D1.c** Eliminate the two-file pattern: move all T1 files to `assets/data/logbook/` and update the loader to read from there only. Single source of truth.

**Recommendation:** D1.a + D1.b. Documenting protects future agents; the validator check catches divergence at commit time. D1.c is a bigger refactor that would also break the loader fallback chain for currently-deployed pages — defer.

### Phase E — Reconcile the three persona lists

**Operator decision E1:** Whether to merge SHIP-006 (7 personas) + SHIP-PAGE-GUIDE (6 personas) + audience-profiles (6 audiences) into a single canonical ontology, OR keep them distinct.

The two lists serve different purposes:
- **SHIP-006 / SHIP-PAGE-GUIDE:** narrator categories for logbook entries (who is telling the story)
- **audience-profiles:** reader categories for content design (who is reading the page)

**Recommendation E1:**
- Keep them distinct
- Merge SHIP-006 and SHIP-PAGE-GUIDE into a single canonical narrator list. The recommended list (operator decides):
  - solo (single traveler, by choice or circumstance)
  - multi-generational / family
  - couple / honeymoon
  - elderly / retiree (with sub-tags for grandparent, late-life-adventure)
  - grief / widow / widower
  - accessible / disability / special needs (with sub-tags for mobility, neurodiversity, chronic illness)
  - veteran / first-responder / trauma-recovery (new — present in radiance logbook, missing from both source lists)
- This gives 7 categories with sub-tags. Threshold: warn at miss-more-than-3 (matches SHIP-006's original threshold).
- Document the SHIP-006-vs-SHIP-PAGE-GUIDE reconciliation in the SHIP-006 rule file (`decision: FINAL` after operator signs off).
- Keep audience-profiles unchanged. Add a sentence to the skill noting "this list is the *reader* ontology; logbook narrator categories are in SHIP-006."

### Phase F — Stale cross-references

**Operator decision F1:** Mass-update references to `admin/validate-ship-page.js` across the codebase to either `admin/validate-ship-page (DO NOT USE).js` (preserving the citation as historical) or `admin/validate-ship-page.sh` (redirecting to canonical). 

A grep earlier in this session found ~70 references in `admin/`, `.claude/`, `audit-reports/`, `docs/`. Most are in validator-spec rule files (`admin/validator-spec/rules/*.md`) citing the deprecated file as implementation. After Phase A's reclassification, those citations become "deprecated implementation reference."

**Recommendation F1:** Per-file Edit with operator approval per category. The validator-spec rule files (~60 of the ~70 references) can be updated in one batch after Phase A. Documentation references (in `claude.md`, `SITE_REFERENCE.md`, etc.) should be updated to point at the canonical. Audit-report files (historical records) should NOT be updated — they correctly cite the deprecated file *as it was* at the time of audit.

### Phase G — Pastoral Witness Guardrail (Appendix C) — leave humanly enforced or write validator?

**Operator decision G1:** Appendix C's prohibitions (no first-person alcohol by Ken, no glamorizing drunkenness, suicide/self-harm casual-language ban) are regex-tractable. Three options:
- **G1.a** Add a validator rule (`THEO-002` or `VOI-008`) that scans all reader-facing prose for the specific banned patterns ("I enjoyed a bucket of beer," "I sampled rum cakes," "I wanted to die," etc.). Severity: `error`.
- **G1.b** Keep humanly enforced via the publication-proofreader and voice-audit skills. Add a checklist item in those skills' SKILL.md that explicitly references Appendix C patterns.
- **G1.c** Hybrid: add the validator for the easy-to-detect patterns (suicide-language casual usage), keep the harder pastoral patterns humanly enforced.

**Recommendation:** G1.c. The suicide/self-harm casual-language patterns are well-defined and regex-safe. The alcohol/gluttony patterns are context-sensitive (Ken's voice vs persona's voice vs descriptive third-person) and risk over-matching; better in voice-audit.

### Phase H — Add the missing standards-only rules to the validator-spec catalog

After Phases A–G are decided, the validator-spec catalog should include rule files for:

- `LOG-006` — Persona name uniqueness against `/assets/data/personas.json` (Phase B)
- `LOG-007` — Two-file logbook parity for RCL ships (Phase D)
- `LOG-008` — Brochure language in logbook prose (port LOG-005 ported to ship) (Phase C2)
- `LOG-009` — Per-entry word count 600–1,200 (Phase C1, if approved)
- `LOG-010` — `## Full disclosure` section presence with tier-gating (Phase C1, if approved)
- `LOG-011` — 7-section spine with REPORT ONLY mode (Phase C1, if approved)
- `LOG-012` — Female crewmate named + located (Phase C1, if approved)
- `THEO-002` (or VOI-008) — Suicide/self-harm casual-language ban (Phase G, if approved)

Each rule file follows the catalog's TEMPLATE.md. Each declares its implementation honestly (none until code exists).

---

## 5. Sequencing & dependencies

Order matters. The dependency chain:

1. **Phase A first** (reclassify deprecated-cited rules, regenerate ORPHANS/BACKFILL/CONFLICTS). Pure documentation; no code change. Unblocks honest state of the catalog.
2. **Phase B in parallel with A** (create `/assets/data/personas.json` from T1 files, document Appendix D's canonical artifact existing). Pre-requisite for any persona-uniqueness validator work.
3. **Phase E** (reconcile persona lists). Pre-requisite for any new persona-coverage validator rule.
4. **Phase D** (document two-file pattern). Pre-requisite for two-file parity validator rule.
5. **Phase C decisions** (which checks to port). After A/B/D/E provide the foundation.
6. **Phase G decisions** (Appendix C enforcement). Independent of A–F.
7. **Phase F** (update stale cross-references). Last, after the new structure is settled.
8. **Phase H** (write the new rule files). Last, after each underlying decision is made.

---

## 6. What this plan deliberately does NOT propose

- Does not propose touching any logbook JSON file. Pastoral content is RED-lane.
- Does not propose deleting the deprecated `.js` validator. Per memory `1eedb55c`, archive-don't-delete; the file was renamed and serves as historical implementation reference.
- Does not propose batch-generating spine sections, female crewmate sections, or persona stories. Those are operator-authored per the 2026-05-23 INVIOLABLE rule.
- Does not propose changing the 4 existing Tier-1 gold-standard files. They are the reference.
- Does not propose changing PASTORAL_GUARDRAILS.md. It is the foundation, not the implementation.
- Does not propose any "fix the 9 fabricated commits" action. That's Phase 0 of the companion SHIP_NORMALIZATION_PLAN_2026-05-23.md.
- Does not promise that adding validator checks would have prevented the 2026-05-23 fabrication. The fabrication was an INVIOLABLE rule violation regardless of validator enforcement; the new rule in `claude.md` v1.6.0 is the binding constraint going forward, with or without validator checks.

---

## 7. Operator decisions summary (the only thing this plan asks for)

| Decision | Recommendation | Phase |
|---|---|---|
| A1 | Reclassify LOG-002/LOG-003/SHIP-006 as S-only, implementation: none, add to ORPHANS | A |
| A2 | Regenerate ORPHANS/BACKFILL/CONFLICTS after A1 | A |
| B1 | Create `/assets/data/personas.json` from T1 files only (B1.b) | B |
| B2 | Add LOG-006 persona-uniqueness validator rule | B |
| C1 | Port deprecated-validator content checks with REPORT-ONLY mode (mitigation-b) for deep content, tier-gating (mitigation-a) for structural | C |
| C2 | Port LOG-005 (brochure language) to ship pages | C |
| D1 | Document the two-file pattern (D1.a) and add parity validator (D1.b) | D |
| E1 | Merge SHIP-006 + SHIP-PAGE-GUIDE into 7-category canonical narrator list with sub-tags; keep audience-profiles distinct | E |
| F1 | Mass-update stale cross-references per category | F |
| G1 | Hybrid Appendix-C enforcement: validator for suicide/self-harm, voice-audit for alcohol/gluttony (G1.c) | G |

After operator decisions, Phase H writes the actual new rule files in `admin/validator-spec/rules/`.

---

**Soli Deo Gloria.** This plan is offered for review, not for execution. Excellence as worship means the standards we have are honest about what they enforce.
