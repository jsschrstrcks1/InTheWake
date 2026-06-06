---
name: voice-audit
description: "Post-draft diagnostic for InTheWake content. Scans for cruise-marketing tells, AI authorship-cluster signals, and absence-of-authenticity gaps. Assesses authenticity risk by clustering signals across layers (Layer 1 strong, Layer 2 supporting, Layer 3 counter-signals). Required: every voyage-pack ships with a voice-audit attestation in its .factcheck.json sidecar. Fires before committing content edits or before publishing a new page. For during-writing standards, see like-a-human. For corpus measurement, see voice-dna."
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
- **For voyage packs specifically: voice-audit must run against the FULL long-form pack body, not the description summary.** The Anthem June 2026 reader-feedback failure ("reads like this was AI generated and not proofread") happened because voice-audit was run only on marketing-length summaries. The body of the pack was never audited; ~60,000 characters of research-synthesis prose shipped untested. **Voice-audit attestation is now required in the pack's `.factcheck.json` sidecar** before the pre-commit gate passes — see "Sidecar Attestation" below.

## The Six-Axis Scan

### 1. Machine Tell Scan

Count instances of:

- **Banned cruise-marketing vocabulary** (`world-class, stunning, luxurious, elevate, unforgettable, pristine, breathtaking, majestic, idyllic, paradise, exclusive, indulge, opulent, lavish, sumptuous, hidden gem, must-do, must-see, bucket-list, jaw-dropping, dream destination`)
- **Generic AI tells** (`delve, tapestry, leverage, framework, holistic, unpack, resonate, garner, showcase, underscore, encompass, nestled, boasts, facilitate, robust, seamless, vibrant, nuanced, dive into, navigate (metaphor), unlock, transform, testament, beacon, realm, symphony, intricate, pivotal, multifaceted, myriad, plethora, comprehensive, unwavering, align with, bolstered, emphasizing, enduring, enhance, fostering, highlight, interplay, foster, ignite, empower, uncover, unleash, optimise, streamline, cutting-edge, future-ready, dynamic, transformative, revolutionary, game-changer`)
- **Copulative-avoidance tells** — AI prefers to dress up plain "is a" / "are" constructions. Quote each instance: `X serves as Y`, `X marks a Y`, `X stands as Y`, `X represents a Y`, `X embodies Y`, `X features (as a marketing verb)`, `X maintains Y`, `X offers Y` doing the work of "is" / "has." Plain copula or "has" is the corpus-native form.
- **Outline-conclusion formula** — "Despite its [positive adjectives], [subject] faces challenges..." then a "Future Prospects" or "Challenges and Opportunities" pivot with vague resolutions. Wikipedia's "Signs of AI writing" identifies this as one of the strongest structural tells. Flag any closing paragraph that follows this shape.
- **Lack-of-conviction tells** — phrases that signal the writer is afraid to be wrong: `It is important to consider, While it is true, It could be argued that, Generally speaking, Aims to (explore/illustrate/demonstrate), This article aims to`. Hedging where the reporter would speak declaratively is the symptom. Cut or replace with a declarative claim.
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

#### Anchored-superlative test (v2.3.0)

A superlative claim with a concrete anchor is partially defensible — but only partially. Example from the Anthem orchestra audit: "the sound carries half a mile and is unforgettable" pairs a concrete measurable ("half a mile") with a cruise-marketing-native adjective ("unforgettable"). The concrete half mile saves the claim from being a pure machine tell, but the word "unforgettable" is itself a Layer 2 stock phrasing that any cruise marketer would reach for. Replace with an experiential simile or specific descriptor: "the sound carries half a mile and lands like a rifle shot" or "the sound carries half a mile — close-by, it shakes the rail." Both replace the marketing-native adjective with an experiential anchor.

**Test:** when a superlative claim is anchored, ask whether the adjective itself is a marketing-native word ("unforgettable," "stunning," "breathtaking," "magical," "iconic without a named specific," "majestic," "incredible," "amazing"). If yes, the anchor saves the claim from Layer 1 but the adjective itself remains a Layer 2 supporting signal until replaced with experiential language.

#### Triplet-of-absences pattern (v2.3.0)

A triplet rhythm built from *negations* rather than concrete positives. Example from the Anthem orchestra audit: "no urgency, no upsell, no countdown." Each item names what the brand *isn't*; none names what the brand *is*. Triplets of negations are a corpus-specific brand move (defensible once per page; the In the Wake brand voice depends on naming what it rejects), but the *pattern* is also a known LLM rhythm-shortcut — a way to manufacture authority without committing to a positive claim. **Cap:** one triplet-of-absences per top-level document. Two or more is a Layer 2 supporting signal. The corpus-native alternative is to pair the absence-triplet with at least one concrete positive ("no urgency, no upsell, no countdown — this pack is the calm read on one specific week" — the second half anchors the brand claim).

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

- [ ] Stacked intensifier adverbs (*deeply, genuinely, truly, particularly, especially*) — note (v2.3.0 sharpening): single instances of "truly" used to mean "actually" or "honestly" usually pass; the flag is rhetorical-pad use ("Sitka truly offers the best of Alaska" → cut "truly" entirely; the sentence is stronger without it). Test: delete the adverb. If the sentence retains its meaning unchanged, the adverb was padding.
- [ ] AI-overrepresented vocabulary (see Machine Tell Scan)
- [ ] "Moreover / Furthermore / In conclusion" transitions
- [ ] Stat-grid openings before human context
- [ ] Generic beauty language ("crystal-clear waters," "sun-kissed sand," "vibrant culture")
- [ ] Promotional verbs ("offers," "features," "boasts," "showcases") doing marketing work
- [ ] Hedged claims where the reporter would speak declaratively ("may offer," "can be considered," "is regarded as")
- [ ] Antithetical-parallelism stacking beyond one instance per page
- [ ] Cruise-marketing vocabulary (zero tolerance — see hard-banned list in `like-a-human`)
- [ ] Therapeutic/cognitive verbs used abstractly. Grep: `\b(optimize|unpack|process|calibrate|reframe|leverage|curate)\b`. Carve-out: literal use is fine ("the app optimizes the route"); flag the self-help use ("optimize your sea days" → "plan your sea days," "curate your excursions" → "pick your excursions").
- [ ] Stock demographic listicle — four-part "Some guests want… / Some are…" traveler stack. Name the specific reader the page serves, or collapse to one or two concrete clauses.
- [ ] Composite first-person attestation — "having sailed this myself" / "I've done this excursion" / "trust me, I've been there" with no date, weather, tender time, or dish to back it. Drop the claim or earn it with one passenger-only detail; the half-measure spends the site's whole "actually sailed it" credibility for nothing. (See Voice Continuity: first-person attestation must carry a date.)
- [ ] Reader-address cue filler — "Picture this," "Let me tell you," "Here's the thing about X" before an ordinary sentence. Keep at a real gear-shift; cut when the next sentence lands harder alone.

**Drift indicator (strengthened in v2.2.0):** if **3 or more must-be-present markers are missing**, OR **2 or more must-be-absent items appear**, the page has drifted at minimum to Medium risk regardless of machine-tell count. Both signals are weighted equally; the absence list is *not* a soft warning.

**The Anthem June 2026 case made this rule mandatory, not advisory.** That pack had zero machine tells, zero promotional drift, every "must be absent" item correctly absent — and shipped publicly with no first-person attestation, no honest lived limitation, no named real person, no specific weather-tied-to-date moment. Four "must be present" markers missing, no Six-Axis flag fired. A reader caught it within hours. The drift indicator above would have escalated that pack to Medium minimum and forced either lived-experience insertion or the colophon-disclosure escape (see "Sidecar Attestation" below) before it could ship. Run this check. The absence list is the rule that catches what the presence list misses.

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

## AI-Authorship Cluster Detection (v3, adapted from ken voice-audit)

**Why this exists.** The Six-Axis Scan hunts for *presence of machine tells* — banned vocabulary, filler transitions, promotional verbs. A passage can pass every axis (zero banned words, zero filler, zero promotional verbs) and still read AI-generated to a domain-knowledgeable reader. That's exactly what happened in the Anthem June 2026 reader-feedback case: a fact-correct, marketing-vocabulary-free pack was correctly diagnosed as AI by a reader because it lacked the *clustering* of authentic-human signals — first-person attestation, lived limitation, named real specifics, friction, unexpected word choices.

This framework codifies the cluster approach. **AI authorship is detected by clustering and density, not by individual features.** No single feature is a verdict.

### Layer 1 — Strong signals (high confidence when clustered)

- **Semantic placeholders where concrete referents could go.** AI gravitates to "the day's best 30 minutes," "the trip's most memorable moment," "the iconic experience," "where the magic happens," "the calm before debarkation." Test each instance: can the abstraction be traced to a concrete referent in surrounding context (a specific deck, a specific time, a specific named view)? If yes, the placeholder is shorthand and acceptable. If no, the placeholder is filler.
- **Broad authority claims with no specifics.** "When I've sailed Alaska before…" without naming a ship, a date, or a sailing. "Most cruisers find…" without citing a source or the cruiser. "The locals will tell you…" without naming a local. Acceptable form: the claim *with* the anchor. Unacceptable form: the claim *without* the anchor.
- **Triplet closures carrying rhythm but not content.** "Honest about the weather. Honest about the cost. Calm about all of it." Test: if the third item in the triplet is deleted, does meaning collapse, or does the sentence just lose its musical close? If only the music is lost, the closure was decoration. One triplet per page is corpus-native rhythm; multiple triplets are the cluster signal.
- **Clean, linear persuasion arc with no friction.** Each section flows to the next without authorial uncertainty, without admitted complication, without a moment where the writer says "I got this wrong" or "this didn't work" or "I'm not sure about X." Human prose has friction; optimized AI output rarely does.
- **Cross-line / cross-ship feature blending cluster** (added v2.3.0 from orchestra findings on the Anthem pack). When factual errors cluster as cross-entity confusions — a Royal venue called by an NCL name, a Quantum-class feature attributed to a Breakaway-class ship, a port docking type from one operator applied to a different operator — they are not four independent factual slips. They form a cluster signature of LLM training-data contamination, where generic class-level descriptions, sibling-line venue names, and stale itinerary patterns crossed into ship-specific writing. As a cluster, the cross-entity-confusion *pattern* is a Layer 1 strong signal of AI authorship even when each individual error has been fixed downstream. Test: when factual corrections are applied, is the corrected text still riding generic class-level rhythm, or has the writing been re-anchored to the specific ship/line/itinerary? If still generic, the Layer 1 cluster signal persists. Historical anchor: the four Anthem-pack factual errors caught publicly on 2026-06-04 (Sitka tender vs Royal-docks-here, Mandara-brand vs Vitality, Observation-Lounge vs Two70, missing sea day) — independently identified by Perplexity and You.com as a cross-line/cross-ship blending cluster, not four independent confabulations.

### Layer 2 — Supporting signals (need Layer 1 to confirm)

- Stock cruise-content phrases ("the calm read," "the companion read," "honest about what costs what," "the move that makes Day 8 easy" — phrases that *sound* corpus-native but that any LLM can produce in this voice)
- Sustained staccato fragment-clustering without rhythm variation
- Parallel structures and "X, X, and X" rule-of-three constructions when manufactured-clean
- "Too smooth" delivery — no awkwardness, no recovered phrases, no second thoughts, no parenthetical aside
- Stat-grid openings before any human context (tonnage/crew/passenger count as the first content the reader sees)
- Lexical variation penalty — synonym swapping to avoid repetition ("port / destination / locale / stop" rotated through one section)
- **Marketing-rhythm parallelism with the cruise line's own official copy** (added v2.3.0). Royal Caribbean's port marketing uses constructions like "Sitka truly offers the best of Alaska," "Skagway symbolizes the spirit of Alaska," "a perfect snapshot of Alaska's wild beauty." A pack can avoid quoting these phrases directly but still mirror the *cadence* in places — "This is the day Alaska reveals itself" maps to the RC marketing rhythm even with no shared vocabulary. When neutral planning prose tracks the cadence of the cruise line's own promotional copy, it becomes composite AI signal: promotional drift + stock phrasing + lack of itinerary-specific friction. Test: read the suspect passage aloud, then read a Royal/NCL/MSC port-description page aloud; if the rhythm matches even without word overlap, the pack has drifted toward marketing voice.
- **Mechanical structural repetition across sibling sections** (added v2.3.0). The same header or sub-section frame applied identically across all parallel sections — "Honest read on [port]" appearing on every port day, "For first-timers:" as a sub-section heading on every port day. The phrase itself may read native, but its mechanical repetition across all sibling sections is the AI-shape tell. A human writer would vary the framing by what each section actually contains: "Sitka — the small Russian-Tlingit port," "Skagway — the gold-rush town," "Juneau — the unreachable capital." Test: collect all section headers at the same level (Day-1, Day-2, ..., Day-N) and read them in sequence. If they're parallel-shaped templates with the [variable] filled in, that's mechanical. If each is shaped by what that section is actually about, that's varied. Three or more identical-shape headers at the same level is the threshold for Layer 2 flag.

### Layer 3 — Counter-signals (favor human authorship)

**Crucial refinement (v2.3.0, from orchestra adversarial review of the Anthem pack):** Counter-signals only count if they are **narrativized with friction** — i.e., the named entity, the date, or the specific place is *used* in a story about lived experience rather than merely *mentioned* as a flat factual reference. The Anthem pack's named entities (Emma Wilby, TEMSCO, Capital Transit, Harv & Marv's, M&M Tours) all appear as flat factual mentions ("Capital Transit city bus combo ~$4 each way"). Any LLM with WebFetch can produce that kind of named-entity specificity from public sources — it is *research-grade*, not *lived-grade*. As research-grade, these counter-signals neutralize toward AI but do not override Layer 1 + Layer 2 combinations.

A counter-signal is **lived-grade** when it has at least one of:

- A first-person attestation attached ("I rode the M&M Blue Bus on the May 2025 sailing")
- A friction note ("the Capital Transit driver told me locals skip the cruise-shuttle bottleneck by taking route 3 + 8 at 8 AM before the cruisers arrive")
- An idiosyncratic micro-observation that wouldn't appear in marketing or third-party port guides ("the bus had a hand-lettered sign on the front window about the Saturday bingo at the Eagles Lodge")
- A contradiction with public-source expectation ("the operator's website says 4-hour minimum; in practice the driver waited 20 minutes past pickup time and we still made the 3 PM tender")

**Examples of valid Layer 3 counter-signals (all require lived-grade anchoring):**

- Named entities (lived-grade only): specific crew members by name encountered, specific bartenders, specific fellow-cruiser anecdotes — *with* the encounter context attached
- Named dates with attestation: "On the May 2025 sailing…", "When I sailed Anthem in June…", "The October 14 2024 Allure sailing…" — the date alone is research-grade; the date + first-person attestation is lived-grade
- Named places at granularity: "Deck 14 forward starboard at 5:47 AM" — this granularity is hard to fake without having been there, since marketing rarely descends to deck-section-time
- Mild awkwardness, sentence-shape variation, unexpected word choices that wouldn't pass a marketing edit
- Localized claims with bounded scope ("on this specific sailing," "in the May rotation," "the year I tried this")
- Authorial hedging that names the limit of what's claimable ("I haven't sailed Anthem in Alaska myself, but the May Caribbean run was…")
- Specific verifiable quotes with attribution (a guide's exact line, a host's specific phrasing)
- Friction, contradiction, or admitted uncertainty within the prose ("I expected X; what I got was Y, and I still don't know why")
- Specific weather details tied to a specific date or season-segment that wouldn't generalize ("the May 14 sailing had thick fog through the Inside Passage; the July 22 sailing had a 75°F windless afternoon at Skagway that didn't repeat the next week")

**Anti-counter-signal pattern (does NOT count):** flat factual mention of a named entity without narrativization. Research-grade only.

### Hard constraints (non-negotiable; override the cluster test)

- **Performative is not artificial.** Brand voice ("calm by design, no urgency") is performance — and humans perform constantly. A passage that reads "performed" is not on that basis AI-generated.
- **Rhetorical devices are human first.** Parallelism, triplet closure, anaphora, contrast reframing — all are ancient rhetoric, all predate AI by centuries. Their presence is never proof of AI authorship. Their *clean, mechanized overuse without substance* is the actual signal.
- **Specificity strongly favors human authorship; lack of specificity does not prove AI.** Some authentic human writers are vague. Vagueness alone is not a verdict.
- **All conclusions are probabilistic.** The framework produces "likely AI," "likely human," or "unclear" — never a definitive label.
- **Context matters.** Logbook entries operate at elevated experiential register; budget tables operate at flat factual register. Apply the framework with awareness of which register the passage is in. A budget table reading "AI-flat" is correct for its genre; a logbook entry reading "AI-flat" is a failure.

### Cluster scoring (operational)

Per page or per section, count by layer:

- **0 Layer 1 signals** → likely human regardless of Layer 2
- **1 Layer 1 + 0 Layer 2** → unclear (yellow flag, no verdict)
- **1 Layer 1 + 2+ Layer 2** → likely AI, modulo counter-signals
- **2+ Layer 1** → likely AI, modulo counter-signals
- **Counter-signals modulate the verdict downward by one notch each.** Three or more counter-signals override any combination of Layer 1 + Layer 2 — this is what protects skilled human writing (and humanly-edited AI writing) from false positives.

### Falsification test

Before any change to this framework, run the modified framework against the passages in `examples/falsification-test.md` (to be created — known-good cruise prose passages with multiple structural features the framework lists as AI signals, plus enough counter-signals that they should produce "likely human" verdicts). If a framework update causes any of those passages to be flagged as AI, the update is too aggressive and must be revised. Companion to the existing `good-voice.md` / `bad-voice.md` examples in the skill.

---

## Orchestra-Audit Discipline (added v2.3.0)

**Why this exists.** v2.2.0 introduced the AI-Authorship Cluster Detection framework and the Sidecar Attestation requirement. The first orchestra-pass audit (Anthem pack, 2026-06-04) immediately surfaced a procedural failure: when fan-out models (GPT, Gemini, Perplexity, You.com, Grok) are asked to do voice-audit *without file access*, **they invent plausible-sounding examples to fit the framework.** Verified instances from the Anthem orchestra run:

- Gemini cited "truly immersive" at line 123 — phrase does not exist in the pack (grep-verified).
- Gemini cited "embark on an unforgettable journey" at line 15 — does not exist.
- Gemini cited "fresh Alaskan seafood" at line 345 — does not exist.
- Perplexity cited "Mandara Spa" on a line that no longer contains it (the brand was corrected days earlier; Perplexity's line reference reflected the pre-fix state but was attributed as current).

The hallucinated examples *fit the framework* — they are plausible cruise-marketing phrases that would, if real, be Layer 2 supporting signals. The fan-out models filled in plausible content because they had no actual file content to work from. This is the framework eating its own tail: an AI-detection audit producing AI-hallucinated findings.

### The rule (v2.3.0)

**Any orchestra-derived voice-audit finding MUST be grep-verified against the actual pack body by Claude (with file access) before being incorporated into the sidecar.** Findings that fail grep verification are flagged in the orchestra-extension block under a `_hallucination_meta_finding` field and excluded from the consolidated tell list. Only findings with grep-confirmed line anchors are written to `consolidated_tell_list.layer_X_signals_confirmed_in_pack`.

### Adversarial-role failover

The Anthem orchestra run also surfaced an operational pattern: when the designated adversarial model (Grok in that run) fails — null response, API error, timeout — the adversarial role does not disappear. **It redistributes to whichever round-robin pass picks up adversarial framings.** In the Anthem run, Perplexity round-robin challenged Claude's framings of the four factual confabulations; You.com round-robin pushed back on Perplexity's "refurbishment erasure" thesis. Both functioned as adversarial without the designation.

**Rule:** when the designated adversarial model fails, document the redistribution in `orchestra_extension._grok_outcome` (or equivalent), name which round-robin models picked up adversarial responsibility, and treat their challenges as the adversarial findings of record. Do not re-run orchestra just to satisfy a single-model adversarial role — the redistribution is the practical equivalent and may even be stronger (two adversarial voices challenging each other, not just one model challenging the lead).

### Orchestra-extension block in the sidecar

The `voice_audit.orchestra_extension` sub-block should contain at minimum:

- `_run_date`, `_orchestra_state_file`, `_total_cost_usd`, `_models_run`
- `_grok_outcome` (or named-adversarial-outcome) — failure mode if any, and which round-robin models picked up adversarial role
- `_hallucination_meta_finding` — list of findings cited by fan-out models that grep-verification rejected
- `consolidated_tell_list` — only grep-verified findings, organized by layer
- `verdict_reconciliation` — first-pass verdict, orchestra-extended verdict, justification, final verdict
- `highest_priority_restoration_edits_per_orchestra` — actionable list

This block is the worked example; the Anthem `voice_audit.orchestra_extension` (committed 2026-06-04, sidecar at admin/voyage-packs/v0.1.4-rcl-anthem-alaska-7n.factcheck.json) is the reference template.

---

## Sidecar Attestation (REQUIRED for voyage packs)

Every voyage pack `.factcheck.json` sidecar gets a `voice_audit` block alongside the existing `ship_specs` / `christening` / `policies` / `superlatives` / `venues` blocks. The pre-commit gate is updated to check for this block before passing.

### Required sidecar structure

```json
"voice_audit": {
  "audited_against": "voice-audit v2.2.0",
  "audit_date": "YYYY-MM-DD",
  "audited_by": "Claude (operator-supervised) | Operator | <name>",
  "audit_scope": "full pack body | section list",
  "machine_tells": {
    "banned_vocab_count": 0,
    "ai_tells_count": 0,
    "filler_transitions_count": 0,
    "promotional_verbs_count": 0,
    "copulative_avoidance_count": 0,
    "outline_conclusion_count": 0,
    "lack_of_conviction_count": 0,
    "antithetical_stacking_count": 0,
    "synonym_cycling_count": 0,
    "stat_grid_opening": false,
    "generic_beauty_language_count": 0
  },
  "must_be_present": {
    "first_person_attestation_with_date": "count + locations OR 'missing — operator-supervised research synthesis disclosed in colophon'",
    "honest_limitation_acknowledged": "count + locations",
    "from_the_pier_specificity": "count + locations",
    "real_numbers": "count",
    "named_real_specifics": "count + examples",
    "compressed_declarative_chains": "count"
  },
  "cluster_detection": {
    "layer_1_signals": "count + brief locations",
    "layer_2_signals": "count + brief locations",
    "layer_3_counter_signals": "count + brief locations",
    "verdict": "likely_human | unclear | likely_ai"
  },
  "risk_rating": "Low | Medium | High",
  "outstanding_drift_notes": "any items deferred with operator approval"
}
```

### What this enforces

- **An audit can't be skipped.** Every pack ships with the attestation; absence blocks the gate.
- **The audit must run on the FULL body.** The Anthem June 2026 failure was that voice-audit was run on 140-word descriptions, never on the 60,000-character pack body. The `audit_scope` field is the explicit defense.
- **Absent-marker failures become structural.** A `must_be_present.first_person_attestation_with_date: "missing"` entry without the colophon-disclosure escape forces an honest acknowledgment: either the pack has lived-experience anchors, or the pack discloses that it doesn't.
- **The cluster verdict is in the record.** Future sessions reading the sidecar know whether this pack passed cluster detection.

### The colophon-disclosure escape

For research-synthesis packs (packs written from primary-source research without direct lived experience of the specific itinerary), the `must_be_present.first_person_attestation_with_date` field can be marked `"missing — operator-supervised research synthesis disclosed in colophon"`. To use this escape, the pack itself must contain — in its closing colophon or an authorship note — a frank line that names the actual authorship mode:

> *"This pack is research synthesis — port operators called, deck plans cross-referenced, current rates verified — supplemented where indicated with first-hand notes from [author/contributor] on the [date] sailing. If a section reads like it lacks lived weight, that section is the synthesis layer."*

The escape is doctrinally honest: the reader knows what they're reading. Without the colophon, the absent-marker failure stands as a Medium-or-higher risk regardless of the rest of the audit.

---

## Authenticity Risk Rating

Combine the Six-Axis Scan, the AI-Authorship Cluster Detection, and the Local-Model Tells into a single risk verdict. The cluster verdict and the absent-marker count are independent triggers — either can shift the rating up regardless of the other axes.

**Low risk** — ship it.
- Machine tells: 0–2 across all categories combined
- All required voice markers present (or colophon-disclosure escape invoked with frank authorship note)
- No must-be-absent items present
- Cluster verdict: `likely_human`
- Cadence varied; specificity present; no promotional drift
- Local-model tells: 0–1
- Pastoral check passes (if applicable)

**Medium risk** — restore before commit.
- Machine tells: 3–5
- 1–2 required voice markers missing AND colophon-disclosure not invoked
- One must-be-absent item appears
- Cluster verdict: `unclear`
- One cadence flag OR one specificity flag
- Light promotional drift
- Image-density 3+ in any paragraph
- Local-model tells: 2–3

**High risk** — hold for revision.
- Machine tells: 6+
- 3+ required voice markers missing AND colophon-disclosure not invoked
- 2+ must-be-absent items present
- Cluster verdict: `likely_ai`
- Specificity check fails (page is generic — every detail could swap to another ship/port without breaking sense)
- Promotional drift dominant
- Pastoral honesty failure on a vulnerable-audience page
- Antithetical-parallelism stacking with 3+ instances
- Three or more announcement-before-move grep hits in body prose
- Local-model tells: 4+ clustered

**Independent escalation triggers** (any one of these forces Medium minimum regardless of other axes):

- `cluster_detection.verdict == "likely_ai"` in the sidecar
- Reader feedback citing "reads like AI" on a published pack (the Anthem June 2026 case is the historical anchor for this trigger)
- A factual error caught downstream by a reader on shipped content (cross-flag with the original-research skill)

---


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

### AI-Authorship Cluster Detection
- Layer 1 strong signals: [count + brief locations]
- Layer 2 supporting signals: [count + brief locations]
- Layer 3 counter-signals: [count + brief locations]
- Cluster verdict: [likely_human / unclear / likely_ai]

### Local-Model Tells (if any local model in the draft pipeline)
- Both-sides reflex: [N]
- Translationese: [N]
- Inline self-correction: [N]
- Prose enumeration: [N]
- Summary loop: [N]
- Faux-drama / ellipsis: [N]

### Sidecar Attestation
- voice_audit block written to .factcheck.json: [yes/no]
- audit_scope: [full pack body / section list]
- Colophon-disclosure escape invoked: [yes/no — and if yes, frank-authorship-note location]

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

- **v2.3.0 (2026-06-04)** — Seven additions distilled from the first orchestra-pass audit (Anthem voyage pack, multi-LLM fan-out via /home/user/ken/orchestrator/orchestra.py with GPT, Gemini, Perplexity, You.com, Grok). Three new detection patterns: **(1)** cross-line/cross-ship feature blending CLUSTER as a Layer 1 strong signal — when factual errors cluster as cross-entity confusions (RC venue called by NCL name, Quantum feature attributed to Breakaway, etc.), the cluster itself is an AI signal even after individual errors are fixed; **(2)** marketing-rhythm parallelism with the cruise line's own official copy as a Layer 2 supporting signal — packs that mirror RC/NCL/MSC port-marketing cadence without quoting it; **(3)** mechanical structural repetition across sibling sections (same header pattern applied identically across all port days) as a Layer 2 supporting signal. Two doctrine refinements: **(4)** Layer 3 counter-signals must be **narrativized with friction** to count — research-grade named entities (operators, suppliers, drydock yards) without first-person attestation or friction-note are neutral, not counter-signals; **(5)** anchored-superlative test — even when a superlative claim has a concrete anchor, if the *adjective itself* is cruise-marketing native ("unforgettable," "magical," "stunning"), the anchor saves Layer 1 but the word remains Layer 2 until replaced with experiential language. One new procedural section: **(6)** Orchestra-Audit Discipline — fan-out models produce HALLUCINATED examples (Gemini cited "truly immersive" line 123, "embark on an unforgettable journey" line 15, "fresh Alaskan seafood" line 345 — none exist in the pack, grep-verified) when given audit tasks without file access. Any orchestra-derived finding must be grep-verified before incorporation into the sidecar. Documented also: when the designated adversarial model fails (Grok returned null in the Anthem run), the adversarial role redistributes to whichever round-robin passes pick up adversarial framings (Perplexity + You.com in that case). One new pattern: **(7)** triplet-of-absences ("no urgency, no upsell, no countdown") capped at one per top-level document; subsequent instances are Layer 2 supporting signals. Single-instance "truly" as intensifier rule sharpened — delete the word and check if meaning persists; if yes, it was padding. Anthem voice_audit.orchestra_extension sidecar block (committed deec4022) is the worked-example reference.
- **v2.2.0 (2026-06-04)** — Six substantive additions after the Anthem June 2026 reader-feedback failure (public Facebook comment from Erin Upshur Jones on the brand's own post: "reads like this was AI generated and not proofread"). The voyage pack had passed every Six-Axis Scan check (zero banned vocab, zero machine tells, zero promotional drift) yet a domain-knowledgeable reader correctly diagnosed it as AI on first read. The failure mode wasn't *presence of machine tells* — it was *absence of authenticity markers* (no first-person attestation with a date, no honest limitation tied to lived experience, no named real specifics, no friction). v2.2.0 closes the gap with: **(1)** an AI-Authorship Cluster Detection framework lifted and adapted from ken voice-audit v3 (Layer 1 strong signals, Layer 2 supporting signals, Layer 3 counter-signals, hard constraints, cluster scoring rules, falsification-test reference). **(2)** New machine-tell categories from June 2026 research (Wikipedia "Signs of AI writing," industry AI-detection literature): copulative-avoidance tells ("serves as," "marks a"), outline-conclusion formula ("Despite X, faces challenges, future prospects"), lack-of-conviction tells, expanded AI-vocabulary list. **(3)** Required Sidecar Attestation — voice-audit results recorded in the pack's `.factcheck.json` alongside the original-research factual sidecar; pre-commit gate will check for the `voice_audit` block. **(4)** Colophon-disclosure escape — research-synthesis packs (no direct lived experience of the specific itinerary) can pass the audit if the pack itself names the authorship mode honestly in a closing colophon. **(5)** Local-Model Tells section (Qwen, Gemma accents) for drafts produced or edited by local models. **(6)** Independent escalation triggers — cluster-verdict `likely_ai`, reader feedback citing "reads like AI," and downstream factual errors caught by a reader all force Medium minimum regardless of other axes. Sources: ken voice-audit v3, Wikipedia "Signs of AI writing" article, oliviacal.com "AI Writing Tells" inventory, Google E-E-A-T 2022+ "Experience" addition.
- **v2.1.5 (2026-06-02, parallel branch later merged from main)** — Added the "Local-model tells (Qwen / Gemma accents)" scan inside Section 1 with seven grep-able fingerprints local models carry that the Claude/GPT-tuned scans miss: the both-sides/conviction-neutralizing reflex (load-bearing on vulnerable-audience pages), Gemma manufactured-drama staccato + ellipsis overuse, Qwen translationese, inline self-correction, numeric scaffolding, Gemma summary loops, and Gemma-2 markdown artifacts. Includes a coverage-architecture note: wire these into the pre-publish path if a local model ever drafts page copy. This work shipped on main as v2.2.0 (2026-06-02) but was merged into the branch alongside the parallel v2.2.0 work (2026-06-04) and renumbered to v2.1.5 for chronological clarity. The v2.2.0 entry above lists Local-Model Tells as one of its additions; the richer Section-1 grep-pattern block from this v2.1.5 supersedes the simpler standalone version, which was removed during the merge.
- **v2.1.0 (2026-05-10)** — Lifted four diagnostics from Romans's `voice-audit` (in cruise voice): grep pattern for announcement-before-move, grep pattern for assumed-familiarity, image-density scan with per-paragraph thresholds, must-be-absent list with explicit drift indicators. Updated risk-rating thresholds and audit-report format to reflect the new checks.
- **v2.0.0** — Six-axis scan with cruise-marketing vocabulary list and pastoral-honesty axis.
