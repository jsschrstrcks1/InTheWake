---
name: voice-audit
description: "Post-draft diagnostic for InTheWake content. Scans for cruise-marketing tells and AI fingerprints, assesses authenticity risk, and checks voice continuity against the measured corpus profile. Fires before committing content edits or before publishing a new page. For during-writing standards, see like-a-human. For corpus measurement, see voice-dna."
version: 2.3.0
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

## AI-Tell Detection Framework (v3)

Added 2026-05-25. This section codifies a layered framework for identifying probable AI authorship in completed prose. The framework was refined through adversarial iteration; the prior versions overclaimed on isolated features (chiasmus, performative tone, "humans don't usually open this way"). The v3 version corrects those errors and operationalizes the core insight: **AI authorship is detected by clustering and density, not by individual features.**

### The operational rule: cluster, don't single

No single feature is a verdict. A passage flagged only for one item in any layer below is at most a yellow flag, not a finding. The framework requires clustering across layers — at least one strong signal and one or more supporting signals, with counter-signals weighed against them — before any AI-likelihood claim is made.

### Layer 1 — Strong signals (high confidence when clustered)

- **Semantic placeholders where concrete referents could go.** AI gravitates to "the mission," "the work," "the hard questions," "the rooms where decisions get made," "the journey," "the challenge." Test each instance: can the abstraction be traced to a concrete referent in surrounding context? If yes, the placeholder is shorthand and acceptable. If no, the placeholder is filler.
- **Broad authority claims with no specifics.** "I've been in the rooms where decisions get made" without naming a single room is the canonical case. Acceptable form: the claim with the anchor ("the budget review on the third Tuesday, the program redesign that landed on my desk in October"). Unacceptable form: the claim without the anchor.
- **Triplet closures carrying rhythm but not content.** Test: if the third item in the triplet is deleted, does meaning collapse or does the sentence just lose its musical close? If only the music is lost, the closure was decoration.
- **Clean, linear persuasion arc** with no digression, no authorial uncertainty, no moment where the writer admits something doesn't fit cleanly. Human prose has friction; optimized AI output rarely does.
- **Predictable identity archetype.** AI gravitates to a recognizable narrative arc: the writer saw what others missed, was first to notice the change, bridges what insiders cannot bridge. In cruise writing this surfaces as "before everyone discovered this port," "I knew the line had changed years ago," "most travelers don't realize that...," "I've been doing this long enough to see what's coming." Test each instance: is the claim anchored to a dated sailing, a named change, a specific observation? Generic posture without anchor is the tell. The signal is the archetype itself — a known piece of skilled human writing that names a real change at a real time on a real ship is not flagged.

### Layer 2 — Supporting signals (need Layer 1 to confirm)

- Stock consultant phrases ("seamlessly," "robust," "leverage," "best-in-class," "world-class")
- Clichés ("every shape and size," "more with less")
- Sustained staccato fragment-clustering without rhythm variation
- Parallel structures and chiasmus when they read manufactured-clean (chiasmus is ancient rhetoric — its presence is human-first; the signal is overuse and unbroken cleanness, not appearance)
- "Too smooth" delivery — no awkwardness, no recovered phrases, no second thoughts
- **Template reinforcement.** Any rhetorical template (other than antithetical parallelism, already flagged in §1) reused two or more times in slightly varied form across the page — e.g., the "It is not about X — it is about Y" frame appearing in three different sections, or the "What looks like X is actually Y" frame recurring with different fillers. The signal is the template repeating without being earned by the argument. A skilled human writer who deploys the same frame deliberately at three pressure points — each pressure point named, each frame doing distinct work — is not flagged.

### Layer 3 — Counter-signals (favor human authorship)

- Named entities, places, dates, dollar amounts, document numbers, statute citations, ship/port/venue names
- Mild awkwardness, sentence-shape variation, unexpected word choices
- Localized claims with bounded scope ("on this sailing in May 2026," "on a four-night Caribbean itinerary," "in the November budget cycle")
- Authorial hedging that names the limit of what's claimable ("n=1," "what I observed; what generalizes is a separate question")
- Specific verifiable quotes with attribution
- Friction, contradiction, or admitted uncertainty within the prose

### Hard constraints (non-negotiable; these override the cluster test)

Earlier framework versions produced false positives by violating these. They are absolute:

- **Performative is not artificial.** Humans are routinely performative — especially in testimony, advocacy, preaching, public speaking. A passage that reads "performed" is not on that basis AI-generated.
- **Rhetorical devices are human first.** Chiasmus, anaphora, parallelism, triplet closures, contrast reframing — all are ancient rhetoric, all predate AI by centuries. Their presence is never evidence of AI authorship. Their clean, mechanized overuse without substance is the actual signal.
- **Specificity strongly favors human authorship; lack of specificity does not prove AI.** Many human writers are vague. Vagueness alone is not a verdict.
- **All conclusions are probabilistic.** The framework produces "likely AI," "likely human," or "unclear" — never a definitive label.
- **Context matters.** Testimony, preaching, advocacy, sermon, eulogy, and political address operate at elevated register by genre convention. Apply the framework with awareness of which register the passage is in.

### Cluster scoring (operational)

To produce a verdict, count by layer:

- 0 Layer 1 signals → likely human regardless of Layer 2
- 1 Layer 1 + 0 Layer 2 → unclear (yellow flag, no verdict)
- 1 Layer 1 + 2+ Layer 2 → likely AI, modulo counter-signals
- 2+ Layer 1 → likely AI, modulo counter-signals

Counter-signals modulate the verdict downward by one notch each (likely AI → unclear; unclear → likely human). Three or more counter-signals override any combination of Layer 1 + Layer 2 signals; this is what protects skilled human writing from false positives.

### Falsification test

Before any change to this framework, run the modified framework against the passages in `falsification-test.md` in this directory. Those passages are highly polished human writing with multiple features the framework lists as AI signals. They should pass the cluster test (counter-signals outweigh) and produce "likely human" verdicts. If a framework update causes any of those passages to be flagged as AI, the update is too aggressive and must be revised.

---

## Version History

- **v2.3.0 (2026-05-25)** — Named two patterns previously covered only by general framework rules: **predictable identity archetype** added to Layer 1 (catches "I saw what others missed" arc with anchor-required test) and **template reinforcement** added to Layer 2 (catches rhetorical frames other than antithetical parallelism that recur with variation but no argument). Both additions carry explicit skilled-human-writing protection in their wording so the falsification-test passages still pass.
- **v2.2.0 (2026-05-25)** — Added AI-Tell Detection Framework section (v3 of the underlying framework). Refines prior overclaims on chiasmus, performative tone, and statistical claims about human writing patterns. Operationalizes the cluster-density rule and adds a falsification-test file (Spurgeon passages) the framework must not flag as AI before any further refinement is accepted.
- **v2.1.0 (2026-05-10)** — Lifted four diagnostics from Romans's `voice-audit` (in cruise voice): grep pattern for announcement-before-move, grep pattern for assumed-familiarity, image-density scan with per-paragraph thresholds, must-be-absent list with explicit drift indicators. Updated risk-rating thresholds and audit-report format to reflect the new checks.
- **v2.0.0** — Six-axis scan with cruise-marketing vocabulary list and pastoral-honesty axis.
