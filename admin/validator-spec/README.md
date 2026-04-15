# Validator Spec — Canonical Rule Catalog

**Version:** 0.1.0 (Phase 1 scaffold)
**Created:** 2026-04-15
**Status:** Under construction — see CHANGELOG.md
**Plan of record:** `/root/.claude/plans/smooth-napping-raven.md`

---

## What this is

This directory is the **single source of truth** for every rule that any validator, SKILL.md, or standards doc in this repo enforces. Each rule is one file in `rules/`, each file has a unique ID, each file cites the validator code that implements it.

Going forward:

- **Validator code** is the ground truth. When a rule exists in code, it's canonical.
- **Standards docs** (`new-standards/`, `standards/`, `admin/claude/*STANDARD*.md`) are historical. They were written with ChatGPT months ago as a baseline. Where they agree with validator code, they're confirmed. Where they conflict, the conflict is surfaced in `CONFLICTS.md` and the user decides per rule.
- **This spec** is extracted from validator code, cross-referenced against standards docs, with every conflict called out. After Phase 6, regenerated standards docs will be produced from this spec, and the originals will be archived under `admin/archive/standards-pre-2026-04-15/`.

---

## Authority ordering

When sources disagree:

1. **Validator silent, standards speak** → standards are preserved. Rule gets `provenance: S-only` and `implementation: none`. Goes on `ORPHANS.md` as future validator work.
2. **Standards silent, validator speaks** → validator wins. Rule gets `provenance: V-only` and `standards-backfill: yes`. Goes on `BACKFILL.md` so regenerated standards will include it.
3. **Both speak and agree** → `provenance: V+S-agree`. Cite both sources. No conflict.
4. **Both speak and disagree** → `provenance: V-S-conflict`. Rule file contains side-by-side quotes, implications each direction, recommendation with justification, and `decision: UNRESOLVED` until user signs off.

Theological rules (Soli Deo Gloria invocation, Scripture references) are **IMMUTABLE** regardless of ordering.

---

## File layout

```
admin/validator-spec/
├── README.md          — this file
├── TEMPLATE.md        — rule file template (required front-matter + sections)
├── CATEGORIES.md      — rule families (THEO, ICP, IMG, ATTR, VOI, A11Y, ...)
├── CONFLICTS.md       — GENERATED: every V-S-conflict rule, side-by-side
├── ORPHANS.md         — GENERATED: rules with implementation: none
├── BACKFILL.md        — GENERATED: V-only rules that standards must adopt
├── CHANGELOG.md       — version history of the spec itself
├── rules/
│   └── <ID>.md        — one rule per file (~180 total when complete)
└── scripts/
    ├── find-orphans.cjs       — fails CI if any rule has implementation: none (without being on ORPHANS list)
    ├── generate-index.cjs     — rebuilds rule index in this README
    ├── generate-conflicts.cjs — rebuilds CONFLICTS.md
    └── generate-backfill.cjs  — rebuilds BACKFILL.md
```

---

## Anti-zombie safeguard

Every rule file MUST have a `check:` field and an `implementation:` field. A rule with `implementation: none` is visible on `ORPHANS.md`. A rule with `check: TBD` fails `find-orphans.cjs`. No rule can hide in a 6,000-line document — the directory listing and the orphan report make dead rules impossible to lose.

Any rule that stays on `ORPHANS.md` for more than one spec cycle without being picked up by a validator gets a visible staleness flag. The goal is never a spec with 500 zombie rules; the goal is a spec where every rule is either live or explicitly on the to-do list.

---

## Rule-ID scheme

`<FAMILY>-<NUMBER>` — three-letter family code, zero-padded number. Families defined in `CATEGORIES.md`. Example: `IMG-003`, `ICP-007`, `THEO-001`.

Gaps are allowed — deprecated rules leave their ID hole (don't renumber).

---

## Severity levels

- `error` — blocks commit / page cannot ship / CI fails.
- `warn` — logs, doesn't block. Human judgment to fix.
- `info` — advisory only. Documentation-grade.

Matches existing validator conventions (`admin/.claude/standards/*.yml` severity vocabulary).

---

## How to read the spec

1. Start here, then read `TEMPLATE.md` to understand rule file shape.
2. Read `CATEGORIES.md` to understand the families.
3. Browse `rules/` or grep for a rule ID cited in an error message.
4. Check `CONFLICTS.md` before changing a rule — your question may already be in a conflict.
5. Check `ORPHANS.md` for rules currently unenforced.

---

## How to add or change a rule

1. **Add:** create `rules/<ID>.md` from `TEMPLATE.md`. Fill every required field. If `implementation: none` is honest, note it — don't fake an implementation citation. Run `node scripts/find-orphans.cjs` — must pass. Commit.
2. **Change:** edit the rule file. Bump `last-updated`. If the change affects a rule that's currently `V+S-agree`, also update the relevant standards doc path in `standards-source:`. If your change introduces a V-S conflict, change `provenance: V-S-conflict` and add the implications/recommendation sections. Set `decision: UNRESOLVED` until user signs off.
3. **Deprecate:** do not delete. Set `status: deprecated` and explain in the rule file. The ID stays — don't reuse.

---

## Generated-file rule

`CONFLICTS.md`, `ORPHANS.md`, and `BACKFILL.md` are generated from the rule files. Do not edit them directly. Edit rule files and regenerate.

---

## Current state

**Phase 1 (Scaffold):** in progress. This scaffold + 15 exemplar rules (one per family) + generator scripts (`.cjs` because `admin/package.json` flags ESM).
**Phase 2:** extract every rule enforced by validator code. ~115 rules expected.
**Phase 3:** extract every rule described by standards docs but not yet enforced. ~30-50 rules expected.
**Phase 4:** voice/judgment rules (LLM-evaluation). ~35 rules expected.
**Phase 5:** reconcile V-S conflicts. User signs off.
**Phase 6:** regenerate `new-standards-generated/` from the spec, archive the originals under `admin/archive/standards-pre-2026-04-15/`, update CLAUDE.md / skill-rules.json / ONBOARDING.md references.
**Phase 7:** wire `find-orphans.cjs` into CI / pre-commit.

---

## Rule index

_This section is generated by `scripts/generate-index.cjs`. Do not hand-edit._

<!-- RULE-INDEX-START -->
**Total rules:** 32  |  Generated by `scripts/generate-index.cjs`

### A11Y (1)

| ID | Name | Severity | Provenance | Status |
|---|---|---|---|---|
| [`A11Y-001`](rules/A11Y-001.md) | Skip-link present and first focusable element | warn | V+S-agree | live |

### ATTR (2)

| ID | Name | Severity | Provenance | Status |
|---|---|---|---|---|
| [`ATTR-001`](rules/ATTR-001.md) | Every port image has a companion attribution JSON file | error | V+S-agree | live |
| [`ATTR-003`](rules/ATTR-003.md) | Attribution source-URL diversity within a gallery | error | V+S-agree | live |

### ICP (17)

| ID | Name | Severity | Provenance | Status |
|---|---|---|---|---|
| [`ICP-001`](rules/ICP-001.md) | ai-summary meta tag present | error | V+S-agree | live |
| [`ICP-002`](rules/ICP-002.md) | ai-summary dual-cap length (250 total, 155 standalone) | error | V-S-conflict | live |
| [`ICP-003`](rules/ICP-003.md) | ai-summary length warning when under 150 chars | warn | V+S-agree | live |
| [`ICP-004`](rules/ICP-004.md) | meta description tag present | error | V+S-agree | live |
| [`ICP-005`](rules/ICP-005.md) | last-reviewed meta tag present | error | V+S-agree | live |
| [`ICP-006`](rules/ICP-006.md) | last-reviewed must use YYYY-MM-DD format | error | V+S-agree | live |
| [`ICP-007`](rules/ICP-007.md) | Content staleness warning when last-reviewed older than 180 days | warn | V-only | live |
| [`ICP-008`](rules/ICP-008.md) | Canonical URL link present | error | V+S-agree | live |
| [`ICP-009`](rules/ICP-009.md) | meta keywords tag forbidden (SEO theater) | warn | V-only | live |
| [`ICP-010`](rules/ICP-010.md) | geo meta tags forbidden (irrelevant) | warn | V-only | live |
| [`ICP-011`](rules/ICP-011.md) | ai-breadcrumbs HTML comments forbidden (ICP-2) vs required (ICP-Lite v1.4) | warn | V-S-conflict | live |
| [`ICP-012`](rules/ICP-012.md) | Duplicate ai-summary meta tags forbidden | error | V-only | live |
| [`ICP-013`](rules/ICP-013.md) | JSON-LD dateModified must exactly match last-reviewed meta | error | V+S-agree | live |
| [`ICP-014`](rules/ICP-014.md) | JSON-LD description relationship to ai-summary (exact vs consistent) | error | V-S-conflict | live |
| [`ICP-015`](rules/ICP-015.md) | Answer-first first paragraph (minimum length) | info | V-only | live |
| [`ICP-016`](rules/ICP-016.md) | Canonical URL must be absolute and point to cruisinginthewake.com | error | V+S-agree | live |
| [`ICP-017`](rules/ICP-017.md) | content-protocol meta declares one of the accepted protocol versions | error | V+S-agree | live |

### IMG (1)

| ID | Name | Severity | Provenance | Status |
|---|---|---|---|---|
| [`IMG-001`](rules/IMG-001.md) | Every img tag has a meaningful alt attribute | error | V+S-agree | live |

### MOB (1)

| ID | Name | Severity | Provenance | Status |
|---|---|---|---|---|
| [`MOB-001`](rules/MOB-001.md) | Touch targets meet the 44×44 CSS pixel minimum | warn | V+S-agree | live |

### NAV (1)

| ID | Name | Severity | Provenance | Status |
|---|---|---|---|---|
| [`NAV-001`](rules/NAV-001.md) | Primary navigation includes the twelve canonical links in order | warn | S-only | live |

### PERF (1)

| ID | Name | Severity | Provenance | Status |
|---|---|---|---|---|
| [`PERF-001`](rules/PERF-001.md) | Hero image declares fetchpriority="high" and loads eagerly | warn | S-only | live |

### PORT (1)

| ID | Name | Severity | Provenance | Status |
|---|---|---|---|---|
| [`PORT-001`](rules/PORT-001.md) | Port page includes a notices / advisories section | warn | V+S-agree | live |

### PWA (1)

| ID | Name | Severity | Provenance | Status |
|---|---|---|---|---|
| [`PWA-001`](rules/PWA-001.md) | Service worker cache version bumped on every release | error | S-only | live |

### SCHEMA (1)

| ID | Name | Severity | Provenance | Status |
|---|---|---|---|---|
| [`SCHEMA-001`](rules/SCHEMA-001.md) | Entity pages declare mainEntity in JSON-LD | error | V+S-agree | live |

### SHIP (1)

| ID | Name | Severity | Provenance | Status |
|---|---|---|---|---|
| [`SHIP-001`](rules/SHIP-001.md) | Ship page has answer-line AND key-facts blocks | error | V+S-agree | live |

### STRUCT (1)

| ID | Name | Severity | Provenance | Status |
|---|---|---|---|---|
| [`STRUCT-001`](rules/STRUCT-001.md) | Ship page sections appear in a canonical order (either legacy or emotional-hook) | warn | V-only | live |

### THEO (1)

| ID | Name | Severity | Provenance | Status |
|---|---|---|---|---|
| [`THEO-001`](rules/THEO-001.md) | Soli Deo Gloria invocation present and positioned before content | error | V+S-agree | live |

### VENUE (1)

| ID | Name | Severity | Provenance | Status |
|---|---|---|---|---|
| [`VENUE-001`](rules/VENUE-001.md) | Venue page declares a matching Schema.org type | error | V+S-agree | live |

### VOI (1)

| ID | Name | Severity | Provenance | Status |
|---|---|---|---|---|
| [`VOI-001`](rules/VOI-001.md) | No AI-overrepresented vocabulary in content prose | warn | S-only | live |

<!-- RULE-INDEX-END -->

---

**Soli Deo Gloria.** Integrity over speed.
