# Voyage Pack Pre-Ship Review Checklist

**Created:** 2026-06-04
**Purpose:** Catch the five problem-classes that have shipped in voyage packs despite the original-research factual gate and the voice-audit cluster framework. Built from a problem inventory of the v0.1.4 Anthem pack performed AFTER both sidecars were in place — proving that the sidecars alone do not catch everything.
**Companion to:** `.claude/skills/original-research/ORIGINAL-RESEARCH.md` (factual), `.claude/skills/voice-audit/SKILL.md` v2.3.0 (voice), and the `.factcheck.json` sidecar schema.

This is a **human-or-Claude-with-file-access read pass**, run as the last gate before a pack ships. It is not automatable in full — several classes require domain judgment — but each item names what to look for and which guardrail owns the fix.

---

## Why this exists

The Anthem pack passed the factual gate (every claim sourced in the sidecar) AND carried a voice_audit block — and a fresh read still found 13 distinct problems across five classes. The sidecars verify *what was checked*; they do not force a check of *what nobody thought to check*. This checklist is the "what nobody thought to check" backstop.

The five classes, each with the Anthem instance that proves it:

| Class | Anthem instance |
|---|---|
| A. Un-caught factual | "168,666 GT… filters rough water" (tonnage is volume, not stability) |
| B. Internal inconsistency | $3,940 total in budget section vs. $5,000 in closing |
| C. Under-counted voice cluster | Closing's imagined humpback-breach/calving/twilight triplet |
| D. Register leak | "research-mode audience" (strategy-doc vocabulary in the product) |
| E. Time-sensitivity | "$18.50/day (effective November 2024)" on a June 2026 sailing |

---

## A. Un-caught factual — the "physics & geography" pass

The factual sidecar verifies ship specs, christening, policies, prices, venues. It does NOT force a check of *claims that synthesize facts into assertions*. These are the dangerous ones — they sound authoritative and a domain reader catches them instantly.

- [ ] **Every causal/physical claim is true, not just every datum.** "The ship is large enough (GT) that rough water is filtered" — the GT number is correct; the causal claim is false (tonnage ≠ stability). Flag any sentence of the form "[true fact] therefore [comfort/safety/outcome claim]" and verify the *therefore*.
- [ ] **Itinerary-specific geography matches the actual routing.** "Inside Passage = protected water" is true for Vancouver departures, false-ish for Seattle round-trips (open-Pacific exposure off Vancouver Island). Verify route claims against the *specific departure port*, not generic destination lore.
- [ ] **Body/comfort/medical promises are hedged, never absolute.** "You almost certainly won't be seasick" is a promise about a stranger's body. Downgrade to "most cruisers on this route report…" with a source, or cut.
- [ ] **Accessibility specifics are verified, not plausible.** "North Star fits one wheelchair per ride" — verify with the cruise line or cut to "confirm with Guest Services."
- [ ] **Owner:** original-research skill. **New sub-rule to add:** "synthesized causal claims" join the factual-claim categories — a true datum inside a false inference is still a confabulation.

## B. Internal inconsistency — the "same-number-twice" pass

- [ ] **Grep every dollar total, then reconcile.** The same headline figure ($2,400 cabin → door total) must match everywhere it appears. Anthem had $3,940 and $5,000 for the identical example.
- [ ] **Grep every count (decks, crew, capacity, nights) and confirm one value across the whole pack** — including the prose sections, not just the At-a-Glance table. (This is how "18 decks" survived in the first-cruise section while the table said 16.)
- [ ] **After any itinerary restructure, re-derive every day-number reference and every itinerary string.** The emergency-card itinerary string and the day-by-day must tell the same story. Anthem's restructure left the handoff card showing one sea day when the body now has two.
- [ ] **Owner:** a new lightweight check — `factcheck-gate.sh` could grep for repeated dollar figures and flag divergent totals, but reconciliation needs a read. Add to the checklist as a mandatory grep step.

## C. Under-counted voice cluster — the "imagined-experience" pass

The voice_audit block counts machine tells and runs cluster detection, but a first-pass audit (even orchestra-extended) systematically *under-counts* the second-person-prophecy and imagined-experience passages because each individual sentence is defensible.

- [ ] **Flag every passage that narrates an experience on the reader's behalf.** "a humpback breach you happened to look up for, the silence after a calf falls, twilight at 10:45 PM" — beautiful, and exactly the AI move (evoking lived experience the author never had). These cluster into Layer 1 even when each clause is individually fine.
- [ ] **Flag whole sections written in second-person prophecy.** Anthem's entire "First Cruise Notes" section is "you will feel X, you will forget Y, the crew will remember Z." A section with zero first-person anchors and all reader-prophecy is the strongest absent-marker signal in the pack.
- [ ] **Count rhetorical crutch-words.** "honest/honestly" appeared 9× in the Anthem pack. Any framing word used 5+ times as a credibility-claim ("honest," "real," "genuinely," "actually") is performing the virtue it names. Grep and count; 5+ is a flag.
- [ ] **Owner:** voice-audit skill. **New sub-rules to add to v2.4.0:** (1) "imagined-experience-on-reader's-behalf" as a named Layer 1 pattern; (2) "second-person-prophecy section" as a structural absent-marker; (3) "credibility-crutch-word frequency" (grep count, threshold 5).

## D. Register leak — the "internal-vocabulary" pass

- [ ] **No strategy-doc or audience-profile vocabulary in reader-facing prose.** "research-mode audience," "ICP," "conversion," "decisional surface," "AEO," "moat" — these belong in `admin/` planning docs, never in a pack a customer reads. Grep the pack against a banned-internal-vocabulary list.
- [ ] **No meta-commentary about the reader as a market segment.** The reader is a person planning a trip, not a cohort.
- [ ] **Owner:** new tiny grep list. Candidate banned-internal terms: `research-mode, party-mode, ICP, ICP-2, conversion, decisional, wayfinding (as CTA-category jargon), AEO, GEO, moat, funnel, cohort, segment, persona`. Add to a `voice-audit` grep or a standalone pre-ship grep.

## E. Time-sensitivity — the "future-dated sailing" pass

- [ ] **Every point-in-time figure carries a reader-facing freshness cue, not just a sidecar verification date.** "$18.50/day (effective November 2024)" on a 2026 sailing silently telegraphs staleness. Reframe customer-facing as "verify current rate at booking — this was $18.50/day as of late 2024."
- [ ] **The pack states its own review date prominently** and tells the reader which categories age fastest (gratuity rates, package prices, excursion prices, fuel-driven costs).
- [ ] **Owner:** pack template. Add a standard "Prices verified [date] — always reconfirm at booking; gratuity and package rates change 1–2×/year" line near the budget section, and ensure the colophon's "Last reviewed" is current.

---

## How this checklist runs

1. After the factual sidecar passes and the voice_audit block is written, run THIS checklist as a final read pass.
2. Each unchecked box is a finding; log findings into the relevant sidecar block (factual → `.factcheck.json` factual categories; voice → `voice_audit`; new classes D/E → a `preship_review` block).
3. The grep-able items (repeated dollar figures, crutch-word count, internal-vocabulary list) should migrate into `factcheck-gate.sh` over time so they become mechanical. The judgment items (physics claims, geography, imagined-experience) stay human-or-Claude-read.
4. **Do not ship a pack until this checklist has been run once with file access and the findings dispositioned.**

---

## Doctrine changes this checklist implies (queued, not yet made)

- **original-research:** add "synthesized causal claims" as a factual-claim category (a true datum inside a false inference is a confabulation).
- **voice-audit → v2.4.0:** add imagined-experience-on-reader's-behalf (Layer 1), second-person-prophecy-section (absent-marker), credibility-crutch-word frequency (grep threshold 5).
- **factcheck-gate.sh:** add grep checks for divergent repeated dollar totals and a banned-internal-vocabulary list.
- **pack template:** standard freshness-cue line tying prices to a reconfirm-at-booking instruction.

These are deliberately listed, not yet implemented — the instruction that produced this checklist was "identify, don't change." Implementation is the next session's queue.

*Soli Deo Gloria — the pack a stranger trusts has to be true and has to sound like a person who was there.*
