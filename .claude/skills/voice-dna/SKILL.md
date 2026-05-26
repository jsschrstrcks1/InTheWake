---
name: voice-dna
description: "Discovers voice patterns from the InTheWake content corpus. Measures rhythm, vocabulary, and experiential fingerprints across port guides, ship profiles, logbook entries, and restaurant pages — data-driven voice profiling that feeds like-a-human and voice-audit."
version: 2.0.0
---

# Voice DNA — Voice Discovery from the Cruise Corpus

> Don't guess the voice. Measure it.

## Purpose

`like-a-human` enforces the voice. `voice-audit` checks the voice. `voice-dna` **discovers** the voice by measuring the actual InTheWake corpus. Run it to extract real patterns so the other voice skills are calibrated against this site's prose, not against a generic "travel writing" abstraction.

The cruise voice is not the sermon voice. It is the voice of a steady observer who has actually sailed the route, walked off the pier, paid the price, and reports back without marketing varnish. Measurement protects that voice from drift.

## When to Fire

- On `/voice-dna` command
- When establishing voice for a new content type (e.g., a new ship line, a new port region, accessibility content)
- When a reviewer reports voice has drifted toward generic travel-blog
- After every 50 new published pages, to refresh the baseline

## Sample Selection

Select 12–18 pages that represent the voice at its best. Mix:

- **3–4 gold-standard port pages** (e.g., `dubai.html`, `juneau.html`) — the voice anchor.
- **2–3 ship profiles** with strong logbook entries (Royal, Carnival, NCL, Virgin, MSC — mix lines so vocabulary doesn't skew to one fleet).
- **2–3 restaurant/venue pages** that handle real food and real prices.
- **2 accessibility or solo/grief pages** (vulnerable-audience voice; pastoral guardrails active).
- **2 article/logbook entries** with first-person attestation.
- **1–2 tool/calculator descriptions** (they have a different voice; measure the difference deliberately).

Avoid: thin port stubs, scraped ship-spec tables, anything flagged by `voice-audit` as High risk.

## Pattern Extraction

For each sample, measure:

### Sentence Rhythm
- Average sentence length (words)
- Sentence length variance — high variance = human; low variance = AI
- Shortest sentence in a confidence-building moment ("You will see whales.")
- Longest sentence in narrative or sensory passages
- Fragment frequency per page

### Paragraph Structure
- Average paragraph length
- One-sentence paragraph frequency
- Length variance across a page (uniform = AI; varied = human)
- Position of first paragraph break (early = scannable; late = essay-style)

### Vocabulary Fingerprint
- Most frequent concrete nouns (deck names, port features, ship names, price terms)
- Cruise terminology preferences ("tender" vs. "shuttle boat"; "specialty dining" vs. "upscale restaurant")
- First-person attestation density ("I sailed," "we tendered," "my wife and I") per page
- Limitation acknowledgements per page ("I haven't done X," "I can't speak to Y")
- Words used that AI would not choose unprompted
- Cruise-marketing vocabulary that should be **absent** ("world-class," "stunning," "luxurious," "elevate," "unforgettable," "pristine")

### Experiential Texture
- Sensory detail frequency (smell, sound, temperature, footing, queue length, wait time)
- Specific-number density (deck numbers, dollar figures, distances, minutes)
- Named-real-people frequency (crew members, fellow passengers, family members) per page
- Negative/critical content frequency (honest weaknesses) per page
- "From the pier" specificity (what you actually see when you step off)

### Cadence Patterns
- Compression-release frequency (stacked short → one longer reflective sentence)
- Anaphora instances (repeated sentence starts) per page
- Pause-and-pivot moves (em-dash, semicolon used for breath, not decoration)
- Direct reader address frequency ("if you're nervous," "you owe no one your story")
- Questions asked per page (cruise voice asks fewer than sermon voice; measure)

### Structural DNA
- Average page length (words)
- Number of major sections per page
- Opening pattern (orientation? attestation? warning?)
- Closing pattern (logbook signoff? practical checklist? pastoral note?)
- Image-to-prose ratio
- Schema/data-block density (should be low in body prose, contained in headers/sidebars)

## Profile Output

Produce a **Voice DNA Profile**:

```
## Voice DNA Profile — InTheWake — [date]
**Corpus:** [N] pages analyzed
**Baseline pages:** [list]

### Rhythm
- Avg sentence: [N] words (σ=[N])
- Shortest at confidence moment: [N] words
- Fragment frequency: [N] per page
- Paragraph variance: [high/medium/low]

### Vocabulary
- Top concrete nouns: [list with frequency]
- First-person attestation: [N] instances per page avg
- Limitation acknowledgements: [N] per page avg
- Banned vocabulary appearances: [should be 0]
- Signature phrases: [list of 5–10 phrases unique to this corpus]

### Experiential
- Sensory details: [N] per page
- Specific numbers (decks/$/min): [N] per page
- Named real people: [N] per page
- "From the pier" specificity: [N] per page

### Cadence
- Compression-release: [N] per page avg
- Anaphora: [N] per page avg
- Em-dash for breath: [N] per page avg
- Direct reader address: [N] per page avg

### Structure
- Avg length: [N] words
- Sections: [N] avg
- Opening pattern: [orientation / attestation / warning / scene]
- Closing pattern: [logbook signoff / checklist / pastoral note]
```

## Different Voice Profiles Within the Site

The same site has several voices; measure them separately so they don't bleed into each other:

- **Logbook voice** — first-person attested, dated, specific. The anchor.
- **Port-guide voice** — second-person guidance + first-person attestation; calmer than the logbook.
- **Ship-profile voice** — less first-person; more steady-observer; specs in tables, personality in prose.
- **Restaurant/venue voice** — sensory-forward; honest about value; price-anchored.
- **Accessibility / solo / grief voice** — pastoral guardrails. Slower cadence. Direct address. "Someone thought about me."
- **Tool / calculator voice** — terse, instructional, no marketing.

A `voice-dna` run can extract any one of these from the right sample subset.

## Feeding Other Skills

The Voice DNA Profile feeds:

- **like-a-human** — update measured patterns, replace guesses with numbers.
- **voice-audit** — calibrate Low/Medium/High thresholds against this corpus.
- **port-page-generator** and **venue-page-writer** — these generators sample the profile to stay on-voice.
- **emotional-hook-test** — confirms the measured voice still produces the target feeling.

## Encode to Memory

```bash
python3 /home/user/ken/orchestrator/memory_ops.py encode inthewake pattern \
  "Voice DNA: avg sentence 16 words, σ=9. Sensory details 4.2/page. First-person attestation 1.8/page. Banned vocab: world-class, stunning, luxurious, elevate, unforgettable, pristine." \
  --tags voice-dna,voice-profile,baseline --protected
```

---

*The reader can tell a sailor from a brochure inside a paragraph. Measure what makes the difference.*
