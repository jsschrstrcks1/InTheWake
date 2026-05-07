# Ship-Page Standardization Master Plan (v2.0 — superseded)

> **This plan is superseded by [`SHIP_STANDARDIZATION_PLAN_V3.md`](SHIP_STANDARDIZATION_PLAN_V3.md)
> as of 2026-05-07.** Phases 0–2 in this file remain the historical record of
> what shipped. Phases 3–5 are reorganized in v3 around outcome metrics, two
> parallel tracks, and a Vehicle-schema canary. New work follows v3.

**Origin plan:** `/root/.claude/plans/bucket-1-1-here-witty-graham.md`
**Branch (current):** `claude/review-ship-validation-zR3qd` (PR #1436)
**Last updated:** 2026-04-29 (v2.0); preserved unchanged below as historical record.

This is the maintained, in-repo version of the approved plan. It tracks
phase progress, links to runbooks, and points at the policy log for
decision rationale. Update as phases complete.

---

## Why this exists

Bulk validation across 290 ship pages × 2 validators surfaced systemic
content defects that the validators correctly flag but cannot fix:

| Defect | Affected ships | Status |
|---|---|---|
| Cordelia Empress dining-hero (different cruise line) | 209 | Phase 2.1 |
| JSON-LD `dateModified` ≠ `last-reviewed` | 30+ | Phase 2.5 |
| Internal guest-count contradictions on same page | 26+ | Phase 3.1 |
| Boilerplate `ai-summary` template | 6+ | Phase 3.2 |
| Inert duplicate `recent-rail-title` IDs | 70 | Phase 2.3 |
| Empty `og:url` | 74 | Phase 2.4 |
| Duplicate deck-plan headings | 82 | Phase 2.2 |
| RCL-tuned validator failing on per-line conventions | 225/290 | Phase 1.1 |

User directives (binding):
1. **Document everything** — 7-field schema per step (What/Why/How/Skills/
   Verification/Trade-offs/Rollback). Five doc deliverables committed
   alongside code.
2. **Use `consult`/`orchestra`/`investigate`** at named decision points.
   Each transcript committed as audit trail.
3. **Careful not clever** — short, decisive, action over analysis.

---

## Phase status

| Phase | Description | Status | Branch |
|---|---|---|---|
| 0 | Policy decisions + orchestra/investigate challenges | **In progress** | current |
| 1 | Validator extensions (per-line config, --json-output, 3 new checks) | Not started | current |
| 2 | Bulk content repairs (Cordelia, dedup, og:url, dateModified) | Not started | `claude/bulk-content-repair` (planned) |
| 3 | Per-page editorial repairs (4 new skills) | Not started | per-ship commits |
| 4 | Cross-link agent + 3 data-build scripts | Not started | `claude/cross-link-agent` (planned) |
| 5 | Visual/conceptual similarity convergence | Not started | `claude/template-converge` (planned) |

---

## Documentation deliverables

| File | Purpose | Status |
|---|---|---|
| `admin/SHIP_STANDARDIZATION_PLAN.md` (this file) | Master plan, maintained | Created |
| `admin/POLICY_DECISIONS.md` | Each policy decision + rationale + multi-LLM challenge transcript | Created (recommendations drafted) |
| `admin/REPAIR_RUNBOOK.md` | Operational runbook for each Phase-2 bulk repair | Pending Phase 2 |
| `admin/CROSS_LINK_AGENT_DESIGN.md` | Cross-link agent design doc | Pending Phase 4 |
| `admin/GAMING_AUDIT_2026-04-26.md` | Earlier audit of gaming patterns + repairs | Done |

---

## Validator rules being added (Phase 1 + 4)

| Rule ID | What it catches | Source policy |
|---|---|---|
| CFG-001 | Per-line config divergence (skip-link target, grid class, main ID, image min) | Phase 1.1 |
| SCHEMA-002 | `mainEntity @type` outside whitelist | Policy 0.1 |
| ICP-018 | `ai-summary` matches boilerplate template | Plan § 1.3 |
| DATA-004 | Internal numeric inconsistency on a page | Policy 0.2 |
| DATA-005 | `page.json` ↔ HTML stat parity | Policy 0.4 |
| IMG-015 | Image count < 8 or class-diversity gap | Policy 0.3 |
| LOG-006 | Sister-ship FAQ cosine-similarity > 0.6 | Policy 0.5 |

Each rule lives at `admin/validator-spec/rules/<ID>.md` following the
existing 138-rule spec format.

---

## New skills being added (Phase 3 + 4 + 5)

| Skill | Path | Phase |
|---|---|---|
| `internal-consistency-repair` | `.claude/skills/internal-consistency-repair/SKILL.md` | 3.1 |
| `ai-summary-rewriter` | `.claude/skills/ai-summary-rewriter/SKILL.md` | 3.2 |
| `sister-faq-uniquifier` | `.claude/skills/sister-faq-uniquifier/SKILL.md` | 3.3 |
| `historic-ship-verifier` | `.claude/skills/historic-ship-verifier/SKILL.md` | 3.4 |
| `cross-link-architect` | `.claude/skills/cross-link-architect/SKILL.md` | 4 |
| `template-drift-triage` | `.claude/skills/template-drift-triage/SKILL.md` | 5 |

Each gets an entry in `.claude/skills/skill-rules.json` for trigger
activation.

---

## Multi-LLM hookpoints

| Decision / step | Tool | Status |
|---|---|---|
| Policy 0.1 (mainEntity @type) | `orchestra` | Pending |
| Policy 0.2 (canonical guest-count) | `consult` | Pending |
| Policy 0.3 (image count threshold) | `investigate` | Pending |
| Policy 0.4 (page.json fate) | `orchestra` | Pending |
| Cordelia replacement image sourcing (Phase 2.1) | `investigate` per line | Pending |
| ai-summary rewrites (Phase 3.2) | `orchestra` per ship | Pending |
| Sister-FAQ rewrites (Phase 3.3) | `orchestra` per FAQ | Pending |
| Historic-ship stat verification (Phase 3.4) | `investigate` per ship | Pending |
| Cross-link UX patterns (Phase 4.3) | `orchestra` | Pending |

Each session's transcript is committed as the audit trail.

---

## End-to-end verification commands

After all phases land:

```bash
# 1. Both validators clean across full RCL fleet (currently 24/49 pass)
for f in ships/rcl/*.html; do bash admin/validate-ship-page.sh "$f" >/dev/null; echo "$? $f"; done | grep -c "^1 "

# 2. No targeted defect classes remain
node admin/aggregate-ship-validation.js
jq '.totals.errors_by_rule | with_entries(select(.value > 0))' audit-reports/ship-validation-dashboard.json

# 3. Cordelia gone everywhere it was
grep -rln "Cordelia_Empress_Food_Court" ships/ | wc -l   # 0

# 4. Cross-link suggestions exist for every ship
ls audit-reports/cross-links/ | wc -l   # 290

# 5. Pre-commit hook still works
bash .githooks/pre-commit < /dev/null   # exit 0

# 6. Sister-ship FAQ similarity below ceiling
node admin/cross-link-engine.cjs --report-similarity --threshold=0.6
```

---

## Where to start (if you're a fresh Claude)

1. Read this file end-to-end.
2. Read `admin/POLICY_DECISIONS.md` — current state of the 5 decisions.
3. Read `/root/.claude/plans/bucket-1-1-here-witty-graham.md` for the
   detailed phase descriptions.
4. Read `claude.md` § Critical NEVER DO Rules (gaming patterns).
5. If Phase 0 is incomplete: run `orchestra`/`consult`/`investigate` per
   the table above, capture results in `admin/POLICY_DECISIONS.md`.
6. If Phase 0 is complete: begin Phase 1 (validator extensions). All work
   on this branch (`claude/review-ship-validation-zR3qd`) until Phase 2.

---

**Soli Deo Gloria.**
