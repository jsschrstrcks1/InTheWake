---
name: voice-audit
description: "Post-draft diagnostic for InTheWake content. Scans for cruise-marketing tells and AI fingerprints, assesses authenticity risk, and checks voice continuity against the measured corpus profile. Fires before committing content edits or before publishing a new page. For during-writing standards, see like-a-human. For corpus measurement, see voice-dna."
version: 2.1.0
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

#### Announcement-before-move scan (grep pattern)

Search for sentences that narrate the next move instead of executing it. These are throat-clearing sentences that pad the transitions.

**Grep pattern** (run against the page body):

```
"In this guide, I'll|In this article, I'll|This guide will|This article will|Let me walk you through|Let's explore|Let me show you|Let's take a look at|We'll dive into|We'll cover|I'll explain|I want to tell you|Let me tell you about|Here's what I'll|Below, you'll find|In what follows|We're going to look at|If you've ever wondered"
```

- Every hit is a presumptive flag
- For each hit, ask: does this sentence announce a move, or make a move?
- If announce — cut the sentence and start with the content
- **Threshold:** zero hits in body prose. A hero/intro paragraph may keep *one* announcement only if it carries real specifics in the same sentence ("In March 2024 I sailed Allure on the western Caribbean…"). Two or more anywhere on the page — flag.

#### Assumed-familiarity scan (grep pattern)

Search for claims about what the reader already knows, has heard, or has been told. Each hit must be either anchored to a specific source/claim or cut.

**Grep pattern** (run against the page body):

```
"as any cruiser knows|as everyone knows|as we all know|you've probably heard|you've probably been told|everyone agrees|well-known|legendary|famous (without context)|iconic (without context)|of course|naturally|needless to say"
```

- Every hit must be verified: is the referenced fact actually anchored to a date, source, or named example?
- If "famous" or "iconic" appears without naming what it's famous *for*, cut or anchor
- If "of course" or "naturally" leans on shared assumption, cut
- **Default:** *"the fish-shaped bridge"* works as well as *"the iconic fish-shaped bridge."* Familiarity claims are usually ornamental. When in doubt, cut

#### Image-density scan

Count images, metaphors, and surprise phrases per paragraph. Run especially on confidence-building moments and pastoral pages.

- Zero images per paragraph — voice may be flat
- One image per paragraph — sharp, keep it
- Two images per paragraph — borderline, verify each does distinct work
- Three or more images per paragraph — over-imagery, cut the most clever one and keep the most concrete

**Test for distinct work:** if two images in the same paragraph name the same thing (both describe the buffet, both describe the harbor, both describe the experience of arrival), keep the more concrete one and cut the more abstract one. The concrete image is what a person who has been there writes. The abstract image is what a machine writes to *sound* like one.

**Test for cleverness vs. truth:** say the plain version aloud. Then say the surprising version aloud. If the plain version lands, keep it. If the surprising version earns its keep by doing work the plain version cannot, keep the surprise. When in doubt, plain wins.

#### Local-model tells (Qwen / Gemma accents)

The scans above were calibrated on Claude/GPT-drafted pages. Local models (Qwen, Gemma) carry their own fingerprints those scans miss. Run this block whenever a page was generated or edited by a local model. Quote the exact phrase and line for each hit.

**1. Both-sides reflex (vulnerable-audience pages: load-bearing).** RLHF trains local models to soften an honest assessment by appending the opposite view — "however, it's worth considering…", "it's a balance between…", "some travelers may disagree." On a page whose job is an honest verdict (is this ship right for a wheelchair user? is this excursion worth $200?), this neutralizes the very guidance the reader came for. Distinct from the hedge already flagged below ("may offer," "can be considered") — this is a *both-sides append*, not a single softened claim.

**Grep pattern:**
```
"however,? it'?s (also )?(worth|important) (to )?(note|consider)|on the other hand|that said,|to be fair,|it'?s a balance between|striking a balance|some (travelers|cruisers|people) (would|might|may) (argue|disagree)|there (are|is) (also )?valid (points|concerns) on (both|the other)|reasonable people (can|may) disagree"
```
- Every hit is a presumptive flag. The reporter gives the honest call; it does not editorialize toward neutrality. Keep a genuine two-side comparison only when both sides carry real, specific evidence the reader needs. **Threshold:** zero on a page's core recommendation.

**2. Manufactured drama (Gemma).** Strings of one-line contrast sentences and trailing ellipses ("And then the bill came…") to fake urgency. This *collides with the native voice* — compressed declarative chains are baseline here ("Five decks. Five bars. Five different crowds."). The test is earned-ness.
- For each cluster of 2+ consecutive ultra-short (<6-word) sentences: does the rhythm serve real reporting, or manufacture drama? Manufactured → cut.
- **Ellipsis grep:** count `…` and `...`. **Threshold:** at most one per page, for a genuine trailing pause.

**3. Translationese / precision-bias (Qwen).** Overly formal "dictionary" diction with no traveler idiom — "manifestation" / "utilize" / "a multitude of" where a person says "sign" / "use" / "a lot of."

**Grep pattern:**
```
"\b(utilize|manifestation|endeavou?r|commence|prior to|subsequent to|in order to|a multitude of|a plethora of|individuals|possess(es|ed)?|aforementioned|delineate|elucidate)\b"
```
- Replace with the plain word a traveler uses (use / sign / start / before / after / to / a lot of / people / have).

**4. Inline self-correction (Qwen, thinking mode).** "Actually, to clarify…", "let me restate," "or rather" — reasoning-transcript leakage into a finished page.

**Grep pattern:**
```
"Actually,? to clarify|let me restate|to be (more )?precise|on second thought|let me rephrase|or rather,|to put it (differently|another way)|correction:|what I mean (to say )?is"
```
- Every hit cut. A published page is not a reasoning transcript.

**5. Numeric / stepwise scaffolding (Qwen).** "Firstly… Secondly…", "In terms of…", "When it comes to…" inside flowing prose where the page's own headings carry the order.

**Grep pattern:**
```
"\b(Firstly|Secondly|Thirdly|Fourthly|First and foremost)\b|\bIn terms of\b|\bWith regard to\b|\bWhen it comes to\b|\bPoint (one|two|three|[0-9])\b|\bStep [0-9]\b"
```
- A genuine numbered list (packing list, step-by-step) is fine; numbered *sentences* in narrative prose are the tell.

**6. Summary loop (Gemma).** "In short… / Essentially…" restating the previous sentence.

**Grep pattern:**
```
"\b(In short|In summary|Simply put|To put it simply|The bottom line|At the end of the day|To sum up|Essentially|Basically)\b,?"
```
- For each hit, check the next clause: new content or restatement? Restatement → cut.

**7. Markdown / tokenizer artifacts (Gemma 2).** Stray `▁`, doubled spaces, or accidental markdown bleeding into rendered HTML body copy.

**Grep pattern:**
```
"▁|  +| _[A-Za-z]| \*[A-Za-z]"
```
- Strip in post-processing — these render visibly on the page.

> **Coverage-architecture note:** these scans only help if they run. If a local model ever drafts or edits page copy, wire the grep patterns above (plus the existing announcement / assumed-familiarity scans) into the pre-publish path so local-model output is audited before it ships — InTheWake pages are public, and an un-audited local-model accent ships straight to a vulnerable reader.

### 2. Voice Continuity Check

**Must be present** (cruise voice baseline):

- [ ] First-person attestation with a date (at least one per page; logbook entries require multiple)
- [ ] Honest limitation acknowledged (at least one per long-form page)
- [ ] From-the-pier specificity (port pages: required; ship pages: required for venues with physical location)
- [ ] Real number, real currency, real date (at least three numbers, varied: dollars, distances, minutes, deck numbers)
- [ ] Named real person OR named specific (one per page)
- [ ] Plain copulas dominant over promotional verbs
- [ ] Direct reader address for vulnerable-audience pages
- [ ] Compressed declarative chains where the rhythm calls for them ("Five decks. Five bars. Five different crowds.")

**Must be absent** (cruise voice anti-baseline):

- [ ] Stacked intensifier adverbs (*deeply, genuinely, truly, particularly, especially*)
- [ ] AI-overrepresented vocabulary (see Machine Tell Scan)
- [ ] "Moreover / Furthermore / In conclusion" transitions
- [ ] Stat-grid openings before human context
- [ ] Generic beauty language ("crystal-clear waters," "sun-kissed sand," "vibrant culture")
- [ ] Promotional verbs ("offers," "features," "boasts," "showcases") doing marketing work
- [ ] Hedged claims where the reporter would speak declaratively ("may offer," "can be considered," "is regarded as")
- [ ] Antithetical-parallelism stacking beyond one instance per page
- [ ] Cruise-marketing vocabulary (zero tolerance — see hard-banned list in `like-a-human`)

**Drift indicator:** if **3 or more must-be-present markers are missing**, OR **2 or more must-be-absent items appear**, the page has drifted at minimum to Medium risk regardless of machine-tell count. Both signals are weighted equally; the absence list is *not* a soft warning.

### 3. Cadence Check

Verify:

- [ ] Sentence length variance — not uniform
- [ ] Paragraph length variance — not uniform
- [ ] At least one short sentence at a confidence-building moment (the "You will see whales." beat)
- [ ] Em-dash used for breath, not decoration (no more than two per paragraph)
- [ ] No mechanical compression-release at every section
- [ ] No three consecutive sentences with the same grammatical shape (S-V-O, S-V-O, S-V-O — break one)

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
- No must-be-absent items present
- Cadence varied; specificity present; no promotional drift
- Pastoral check passes (if applicable)

**Medium risk** — restore before commit.
- Machine tells: 3–5
- 1–2 required voice markers missing OR 1 must-be-absent item appears
- One cadence flag OR one specificity flag
- Light promotional drift
- Image-density 3+ in any paragraph

**High risk** — hold for revision.
- Machine tells: 6+
- 3+ required voice markers missing
- 2+ must-be-absent items present
- Specificity check fails (page is generic)
- Promotional drift dominant
- Pastoral honesty failure on a vulnerable-audience page
- Antithetical-parallelism stacking with 3+ instances
- Three or more announcement-before-move grep hits in body prose

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
- Announcement-before-move (grep hits): [N]
- Assumed-familiarity (grep hits): [N]
- Image-density violations (3+ per paragraph): [N]
- Synthetic earnestness: [N]
- False ranges: [N]
- Stat-grid opening: [yes/no]
- Generic beauty language: [N]

### Voice Markers
#### Must be present
- First-person attestation: [present/missing]
- Honest limitation: [present/missing]
- From-the-pier specificity: [present/missing/N/A]
- Real numbers: [count]
- Named real person/specific: [present/missing]
- Plain copulas dominant: [yes/no]
- Direct reader address (vulnerable): [present/missing/N/A]
- Compressed declarative chains: [present/missing]

#### Must be absent
- Stacked intensifier adverbs: [count, list]
- AI-overrepresented vocab: [count, list]
- Filler transitions: [count, list]
- Stat-grid opening: [yes/no]
- Generic beauty language: [count, list]
- Promotional verbs: [count, list]
- Hedged claims: [count, list]
- Antithetical stacking beyond cap: [count]
- Cruise-marketing vocabulary: [count, list]

### Cadence
- Sentence variance: [varied/uniform]
- Paragraph variance: [varied/uniform]
- Confidence-moment short sentence: [present/missing]
- Em-dash usage: [breath/decorative]
- Syntactic template repetition (3+ S-V-O in a row): [count]

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

---

## Version History

- **v2.2.0 (2026-06-02)** — Added the "Local-model tells (Qwen / Gemma accents)" scan (seven grep-able fingerprints local models carry that the Claude/GPT-tuned scans miss): the both-sides/conviction-neutralizing reflex, Gemma manufactured-drama staccato + ellipsis overuse, Qwen translationese, inline self-correction, numeric scaffolding, Gemma summary loops, and Gemma-2 markdown artifacts. Includes a coverage-architecture note: wire these into the pre-publish path if a local model ever drafts page copy. Mirrors the same addition in `like-a-human`.
- **v2.1.0 (2026-05-10)** — Lifted four diagnostics from Romans's `voice-audit` (in cruise voice): grep pattern for announcement-before-move, grep pattern for assumed-familiarity, image-density scan with per-paragraph thresholds, must-be-absent list with explicit drift indicators. Updated risk-rating thresholds and audit-report format to reflect the new checks.
- **v2.0.0** — Six-axis scan with cruise-marketing vocabulary list and pastoral-honesty axis.
