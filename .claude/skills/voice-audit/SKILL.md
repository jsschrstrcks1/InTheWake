---
name: voice-audit
description: "Post-draft diagnostic for InTheWake content. Scans for cruise-marketing tells and AI fingerprints, assesses authenticity risk, and checks voice continuity against the measured corpus profile. Fires before committing content edits or before publishing a new page. For during-writing standards, see like-a-human. For corpus measurement, see voice-dna."
version: 2.0.0
---

# Voice Audit — Post-Draft Diagnostic

## Purpose

`like-a-human` shapes the writing process. `voice-dna` measures the corpus. `voice-audit` evaluates a *finished* page — catches what slipped through, rates the authenticity risk, and recommends surgical restoration edits, not rewrites.

The rule: when a page is on-voice except for a handful of tells, restore the page. Never rewrite a page wholesale to fix a voice problem — wholesale rewrites introduce new machine patterns the corpus has not seen.

## When to Fire

- Before every content commit (port, ship, venue, article, logbook)
- Before publishing a new page
- Before merging a PR that touches reader-facing prose
- On `/voice-audit <path>`
- After any large AI-assisted draft (treat AI assists as suspect by default)

## The Six-Axis Scan

### 1. Machine Tell Scan

Count instances of:

- **Banned cruise-marketing vocabulary** (`world-class, stunning, luxurious, elevate, unforgettable, pristine, breathtaking, majestic, idyllic, paradise, exclusive, indulge, opulent, lavish, sumptuous, hidden gem, must-do, must-see, bucket-list, jaw-dropping, dream destination`)
- **Generic AI tells** (`delve, tapestry, leverage, framework, holistic, unpack, resonate, garner, showcase, underscore, encompass, nestled, boasts, facilitate, robust, seamless, vibrant, nuanced, dive into, navigate (metaphor), unlock, transform`)
- **Filler transitions** (`Moreover, Furthermore, Additionally, In essence, In conclusion, Ultimately, At its core, Whether you're, Look no further than`)
- **Promotional verbs** (`offers, features, provides, boasts, showcases, presents` doing marketing work)
- **Antithetical-parallelism stacking** (multiple "not just X, it's Y" — the strongest LLM tell in this voice)
- **Participial editorializing** (trailing `-ing` clauses that interpret rather than report)
- **Synonym cycling** (rotating `port / destination / locale / stop` in one section)
- **Announcement-before-move** ("In this guide, I'll walk you through...")
- **Synthetic earnestness** ("Here's the truth:" with no real confession)
- **False ranges** ("From budget to luxury" without endpoints)
- **Stat-grid openings** (tonnage/crew/passenger count before any human context)
- **Generic beauty language** ("crystal-clear waters," "sun-kissed sand," "vibrant culture")

Report: **count + locations**. Do not paraphrase — quote the exact phrase and line.

### 2. Voice Continuity Check

Verify presence of **required voice markers**:

- [ ] First-person attestation with a date (at least one per page; logbook entries require multiple)
- [ ] Honest limitation acknowledged (at least one per long-form page)
- [ ] From-the-pier specificity (port pages: required; ship pages: required for venues with physical location)
- [ ] Real number, real currency, real date (at least three numbers, varied: dollars, distances, minutes, deck numbers)
- [ ] Named real person OR named specific (one per page)
- [ ] Plain copulas dominant over promotional verbs
- [ ] Direct reader address for vulnerable-audience pages

Report markers **present / missing**. If three or more are missing, page is at minimum Medium risk regardless of machine-tell count.

### 3. Cadence Check

Verify:

- [ ] Sentence length variance — not uniform
- [ ] Paragraph length variance — not uniform
- [ ] At least one short sentence at a confidence-building moment (the "You will see whales." beat)
- [ ] Em-dash used for breath, not decoration
- [ ] No mechanical compression-release at every section

Flag: any uniform stretch (5+ paragraphs of similar length, 5+ sentences of similar length, repeated section rhythm).

### 4. Specificity Check

The page must tether to *this* place / ship / restaurant, not be interchangeable with another:

- [ ] Deck numbers, side (port/starboard), elevator bank, or named venue
- [ ] Sensory detail not transferable to another location
- [ ] At least one detail that can be fact-checked
- [ ] Limitation tied to a specific situation, not a generic disclaimer

Fail trigger: if all the specifics could be swapped for another port/ship without breaking sense, the page is generic. High risk.

### 5. Promotional Drift Check

The cruise voice does not sell. Verify:

- [ ] No "offers," "features," "provides" doing marketing work
- [ ] No "perfect for" or "ideal for" segmenting readers
- [ ] No "a must" or "a must-do"
- [ ] No closing call-to-action language ("Book now," "Don't miss out")
- [ ] Honest weaknesses acknowledged where present

If the page reads like a brochure could publish it unchanged, the voice has drifted. Flag.

### 6. Pastoral Honesty Check (vulnerable-audience pages only)

For accessibility, solo, and grief content:

- [ ] First paragraph signals "someone thought about me"
- [ ] No performance of empathy
- [ ] Reader treated as a person, not a category
- [ ] Dignity-first language; no inspirational framing
- [ ] Practical guidance present, not just sentiment

A pastoral-page failure on this axis is automatically High risk regardless of other axes.

## Authenticity Risk Rating

Assemble the six-axis output into a risk rating:

**Low risk** — ship it.
- Machine tells: 0–2
- All required voice markers present
- Cadence varied; specificity present; no promotional drift
- Pastoral check passes (if applicable)

**Medium risk** — restore before commit.
- Machine tells: 3–5
- 1–2 required voice markers missing
- One cadence flag OR one specificity flag
- Light promotional drift

**High risk** — hold for revision.
- Machine tells: 6+
- 3+ required voice markers missing
- Specificity check fails (page is generic)
- Promotional drift dominant
- Pastoral honesty failure on a vulnerable-audience page
- Antithetical-parallelism stacking with 3+ instances

## Restoration, Not Rewriting

When the rating is Medium, recommend **3–5 surgical edits**, each one:

- Quotes the exact phrase to remove
- Provides a 1–3 word replacement OR a deletion
- Names the axis the edit fixes

Do not propose new paragraphs. Do not add content. Do not "polish." The author wrote the page; the audit's job is to remove the mechanical overlay, not to introduce a new voice.

When the rating is High, the recommendation is to **rewrite the page from the original facts**, not to patch it. A High-risk draft has too many tells to restore without ending up with a Frankenstein voice.

## Audit Report Format

```
## Voice Audit — [page-name]
**Path:** [file path]
**Page type:** [port / ship / venue / article / logbook / accessibility / tool]
**Date:** [YYYY-MM-DD]

### Machine Tells
- Banned cruise vocab: [N] — [list with line numbers]
- Generic AI tells: [N] — [list]
- Filler transitions: [N] — [list]
- Promotional verbs: [N] — [list]
- Antithetical stacking: [N] instances
- Participial editorializing: [N]
- Synonym cycling: [N]
- Announcement-before-move: [N]
- Synthetic earnestness: [N]
- False ranges: [N]
- Stat-grid opening: [yes/no]
- Generic beauty language: [N]

### Voice Markers
- First-person attestation: [present/missing]
- Honest limitation: [present/missing]
- From-the-pier specificity: [present/missing/N/A]
- Real numbers: [count]
- Named real person/specific: [present/missing]
- Plain copulas dominant: [yes/no]
- Direct reader address (vulnerable): [present/missing/N/A]

### Cadence
- Sentence variance: [varied/uniform]
- Paragraph variance: [varied/uniform]
- Confidence-moment short sentence: [present/missing]
- Em-dash usage: [breath/decorative]

### Specificity
- Tied to this place: [yes/no]
- Fact-checkable details: [count]
- Verdict: [specific/generic]

### Promotional Drift
- [pass/fail with specifics]

### Pastoral Honesty (if applicable)
- [pass/fail with specifics]

### Risk Rating: [Low / Medium / High]

### Recommended Edits
1. [exact quote] → [replacement/deletion] — [axis]
2. ...
```

## Integration With Other Skills

- Run **after** `port-content-builder`, `port-page-generator`, `venue-page-writer`, or any AI-assisted edit.
- Run **before** `publication-proofreader`.
- Pair with `emotional-hook-test` for the feeling-level pass; voice-audit catches mechanical tells, emotional-hook-test catches whether the prose actually lands.
- Feed Medium and High audits back to `voice-dna` periodically — if a particular tell keeps slipping through, the corpus may need re-baselining.

---

*The audit's job is to remove the mechanical overlay. The author's voice is already there.*
