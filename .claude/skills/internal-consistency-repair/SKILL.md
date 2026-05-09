---
name: internal-consistency-repair
description: "Per-page repair of internal numeric inconsistencies — when a single ship page lists 2+ different guest-count numbers in non-'maximum' contexts. Resolves to passengers_double_occupancy per Policy 0.2 of admin/POLICY_DECISIONS.md. Voice-preserving: only the integer changes. Companion to validator rule DATA-004."
version: 1.0.0
---

# Internal Consistency Repair

> The number is the only thing that changes. The voice stays.

## Purpose

When `validate-ship-page.js` fires `data_consistency/internal_numeric_inconsistency` (DATA-004), the page lists multiple distinct guest-count integers in `guests` / `passengers` / `capacity` contexts. Cause is usually history: someone updated one location (fact-block, JSON-LD review, FAQ) without updating the others, or imported from a source that disagreed with the existing numbers.

This skill repairs them, one page at a time, preserving prose voice. The editorial decision is mechanical (Policy 0.2 = double-occupancy is canonical). The only judgement is identifying the canonical value when sources disagree.

## When to Fire

- On `/repair-numbers <ship-slug>` command.
- Auto-suggest when validator emits `data_consistency/internal_numeric_inconsistency`.
- Manually invoked when batch-repairing the 59 affected ships from
  `audit-reports/ship-validation-dashboard.json`.

## Scope

**In scope:** integer values in body copy, fact-block, hero stat, FAQ answers, JSON-LD `additionalProperty[name="passengerCapacity"]`, `Review.itemReviewed.numberOfRooms`-style fields.

**Out of scope:** prose voice, structural HTML, anything other than the specific integer being canonicalized. If the rewrite would change anything besides the integer, abort and surface as needing editorial review.

## The Rule (Policy 0.2)

The canonical value is **double-occupancy** capacity (lower-berth count). Wikipedia ship infoboxes, CLIA fleet stats, RCL/Carnival/Norwegian own websites, and Schema.org `Vehicle.passengerCapacity` ("number of passengers that can be seated") all converge on this. See `audit-reports/research/canonical-guest-count.json` for the consult transcript.

A different number (typically larger — all-berths-full / max-capacity) is **allowed only when explicitly labeled** with one of:
- `maximum capacity`
- `all-berths-full`
- `max occupancy`
- `at full capacity`

If a number doesn't carry a label like that, it must equal the canonical.

## Process per ship

### 1. Read all sources

Open and read:
- `ships/<line>/<slug>.html` — the target page
- `assets/data/ships/<line>/<slug>.page.json` — `stats_fallback.guests` is a strong hint at the line's intended canonical
- `assets/data/logbook/<line>/<slug>.json` — sometimes mentions the figure in story prose
- `assets/data/fleets.json` — for sister-ship cross-reference if needed

Run the validator first to confirm exactly which integers it found:
```bash
node admin/validate-ship-page.js ships/<line>/<slug>.html --json-output \
  | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'
```

### 2. Identify the canonical

Pick from this priority order:

1. **`page.json` `stats_fallback.guests`** — if it parses as a single integer (e.g. `"2,143"`), that's the line-curated value. Use it.
2. **External authoritative source** — if `stats_fallback.guests` is missing or expressed as a range (`"5,610 (double) / ~7,600 (max)"`), pull the double-occupancy number from the line's official site, CLIA, Wikipedia infobox, or `cruisemapper.com`. WebFetch the source; cite the URL in the audit log.
3. **Most-frequent on-page** — if neither of the above is available, pick the most-common integer in the page's existing prose. Document the reasoning.

If two authorities disagree by more than ~5%, run `consult` to challenge. Cite the chosen source.

### 3. Rewrite

For each occurrence of a non-canonical integer in a non-"maximum" context, replace it with the canonical. Surgical edits only:

- Body `<p class="fact-block">`: replace integer.
- "Quick Answer" line: replace integer.
- "You'll love" / "Who She's For": if rounded ("about 2,100"), ensure it rounds the canonical, not a different number.
- FAQ answers (HTML body and JSON-LD `acceptedAnswer.text`): replace integer.
- `<meta name="ai-summary">`: replace integer.
- JSON-LD `Review.reviewBody`: replace integer.
- JSON-LD `Vehicle`/`Product` `additionalProperty[name="passengerCapacity"]` `value`: replace integer.

For each occurrence of a max-capacity integer that lacks an explicit label, **add the label**:
> "...with a maximum capacity of 7,600 guests at full occupancy"

instead of bare:
> "...with 7,600 guests"

### 3a. NEVER rewrite a cross-ship comparison

If the integer appears inside a sentence that is recommending or comparing
to a **different** ship — "If you prefer a smaller Cunard ship, Queen
Elizabeth or Queen Victoria may be a better fit at roughly 90,000 GT and
2,081 guests" — that integer refers to the OTHER ship, not the page's ship.
Rewriting it to the page's canonical produces a factually wrong claim (the
page would assert that Elizabeth/Victoria carry Queen Anne's guest count).

The repair script (`admin/repair-internal-consistency.js`) detects this
class of context via `COMPARISON_CONTEXT_TRIGGERS` and skips the swap.
Triggers include "if you want/prefer", "may be a better fit", "the X Class
carries", "intimate ocean ships at under", "by contrast", "unlike". An
integer in any of those contexts must remain.

If the validator fires DATA-004 on a comparison sentence, the *correct*
remediation is editorial: leave the comparison's integer in place (it's
true) and either reword to remove it or add a wrapper attribute the
validator can be taught to recognize. **Do not** rewrite the comparison
to the page-ship's canonical.

This rule was added 2026-05-07 after an earlier Phase 3.1 run rewrote
2,081 (Queen Elizabeth/Victoria) to 2,996 (Queen Anne) on `queen-anne.html`,
~1,970/3,000 (Coral-class vs. Grand-class) on the Princess pair, and
under-2,000 (NCL bucket) to 1,878 on `norwegian-sun.html`. Reverted; script
hardened. See `audit-reports/internal-consistency/_comparison-check.md`.

### 4. Re-validate

```bash
node admin/validate-ship-page.js ships/<line>/<slug>.html --json-output \
  | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'
```

Result must be empty. If it isn't, find the missed occurrence and repeat.

### 5. Append to audit log

Write or append to `audit-reports/internal-consistency/<slug>.md`:

```markdown
# <Ship Name> — Internal Consistency Repair

**Date:** YYYY-MM-DD
**Branch:** claude/phase3-internal-consistency

## Before

| Number | Source location |
|---|---|
| 2,145 | fact-block, FAQ, ai-summary |
| 2,100 | "Who She's For" (rounded) |
| 2,543 | whimsical-units rail (max-capacity, unlabeled) |

## Canonical chosen

**2,145** (passengers_double_occupancy)

## Source authority

- `assets/data/ships/rcl/brilliance-of-the-seas.page.json` `stats_fallback.guests` = "2,143"
- Royal Caribbean own site reports 2,143 at double-occupancy.
- The page's existing 2,145 is one off. Picked 2,143 to match line's own canonical.

## Edits applied

- fact-block: 2,145 → 2,143
- FAQ "How big is...": 2,145 → 2,143
- ai-summary: 2,145 → 2,143
- "Who She's For" rounded mention: "about 2,100" → "about 2,100" (already rounds 2,143 correctly)
- whimsical-units rail: "2,543 guests at maximum capacity" — labeled, kept

## Verification

`node admin/validate-ship-page.js ships/rcl/brilliance-of-the-seas.html --json-output` reports no `internal_numeric_inconsistency`.
```

### 6. Commit

One commit per ship (or batched 5-10 per commit if all use the same canonical-source authority). Commit message format:

```
Phase 3.1: <ship-name> internal-consistency repair

Canonical: 2,143 (passengers_double_occupancy)
Source: Royal Caribbean own site + page.json stats_fallback.guests
Before: 2,145 / 2,100 / 2,543 in non-max contexts
After: single canonical; max-capacity figure now explicitly labeled

Audit: audit-reports/internal-consistency/<slug>.md
```

## Multi-LLM hookpoints

- **`consult`** when `page.json` stats_fallback.guests, the line's own site, and Wikipedia disagree by more than ~5%. The consult prompt: "Three sources report different double-occupancy capacity for [ship]: A=X, B=Y, C=Z. Which is most authoritative for cruise-ship reference data, and why?" Save transcript next to the audit log.
- **`investigate`** is overkill for this skill — the question is small, single-fact, no prose research needed.

## Boundaries

- Don't rewrite prose. If a paragraph reads awkwardly because the number changed (rounding now feels off, comparative claims now wrong), surface that as a separate editorial item, don't fix it inside this skill.
- Don't change historical-ship retired-fleet capacity — those numbers are fixed by what was actually delivered, not what we'd prefer. Use the validator output to identify; consult Wikipedia for retired-ship spec verification.
- Don't touch `<meta name="last-reviewed">`. Only update if the change crosses a calendar day. (DATA-005 / Phase 2.5 already handles `dateModified` parity.)

## Skill activation

Loaded via `skill-rules.json` `internal-consistency-repair` entry. Triggers:
- prompt keywords: `repair numbers`, `internal consistency`, `guest count repair`, `DATA-004`
- file paths: `ships/<line>/<slug>.html` when the validator has flagged it

## Cross-references

- `admin/POLICY_DECISIONS.md` § 0.2 — canonical guest-count rationale + research artifact
- `admin/validator-spec/rules/DATA-004.md` — the validator rule this skill closes
- `audit-reports/research/canonical-guest-count.json` — Perplexity confirmation transcript
- `.claude/skills/Humanization/Like-a-human.md` — voice standard (preserve voice during repair)

---

*Soli Deo Gloria*
