---
name: voice-audit
description: "Post-draft diagnostic for InTheWake content. Scans for machine tells, assesses authenticity risk, checks voice continuity against the project's voice standard. Fires before committing content changes. For during-writing standards, see like-a-human."
version: 1.0.0
---

# Voice Audit — Post-Draft Diagnostics

*Fires before committing content. Evaluates what was produced.*

**Relationship to other guardrails:**

- **like-a-human** shapes the *writing* — voice markers, rhythms, vocabulary, precision.
- **voice-audit** (this file) reviews the *output* — scanning for drift, flagging machine tells, assessing authenticity.
- **careful-not-clever** guards the *process* — verified work, documented changes, no shortcuts.

When drift is detected, the response is **restoration, not rewriting.** A few targeted edits to bring the prose back to the author's voice — not a wholesale rewrite that introduces new machine patterns.

---

## Machine Tell Scan

Run this scan against any content that has been written or edited with AI assistance. These are the specific fingerprints AI leaves.

### Structural tells

- [ ] Uniform sentence length throughout — mid-length sentences with no spikes or drops
- [ ] Paragraph template loops: thesis line → 2-3 supports → tidy restatement, repeated section after section
- [ ] Visible symmetry: every section the same length, every list the same number of items
- [ ] The sandwich: intro promises what it will say, body says it, conclusion summarizes what it said

### Transition tells

- [ ] "Moreover," "Furthermore," "Additionally," "It's worth noting," "In conclusion," "In today's world," "At its core," "In essence," "Let's dive in"
- [ ] Any transition smoother than a gear grind — this voice uses hard pivots: "Now —" "But here's the thing." "And then." "Something else."

### Word-level tells

- [ ] Hedging stacks: "It's important to note that," "One might argue," "It's worth considering," "It seems like," "Perhaps"
- [ ] Adverb inflation: "truly remarkable," "deeply profound," "incredibly powerful"
- [ ] Thesaurus syndrome: three words where one would do
- [ ] AI-overrepresented vocabulary: *robust, comprehensive, landscape, realm, leveraging, framework, holistic, narrative, nuanced, multifaceted, foster, delve, tapestry, pivotal, navigate, unpack, resonate, embark, curate, elevate, streamline, harness*
- [ ] Vague emotional swaps: "navigating loss" for grief, "passing" for death, "season of solitude" for loneliness, "apprehension" for fear, "frustration" for anger, "journey" for struggle, "bittersweet" for painful

### Rhythm tells

- [ ] Even sentence length from start to finish
- [ ] Fragment stacking every time emphasis is needed (occasional = human; constant = machine)
- [ ] False variation: complex/simple alternation in a mechanical pattern

### Substance tells

- [ ] Everything important, nothing specific: "This beautiful port offers incredible experiences for every traveler"
- [ ] Interchangeable descriptions that could be swapped onto any other ship/port page
- [ ] Correct but bloodless description: facts listed, but no one who has been there would recognize the place
- [ ] No rough edges: every paragraph resolves cleanly, every transition is smooth
- [ ] Comfort arrives before hard truths have had time to land (in grief/logbook content)

### Seam detection

- [ ] One or more paragraphs shift to a more abstract, polished, or consultant-like register while the rest sounds like the observer
- [ ] Paragraphs whose sentences all open the same way when the surrounding sections use varied openings
- [ ] A section that feels "inserted" rather than grown from the surrounding argument

---

## Voice Continuity Check

Compare the draft against the InTheWake voice standard (Like-a-human.md). The baseline voice has these markers:

### Must be present

- **Steady observer tone:** Not salesperson, not travel agent, not lifestyle blogger. A person who was there and is telling you what they actually saw.
- **At least one concrete, specific detail per section:** Deck numbers, restaurant names, times, sensory observations. Something that pins this content to *this* place.
- **Discernment over hype:** Limitations acknowledged. Not everything is "amazing." The reader trusts this voice because it tells them what's actually true, including the parts that aren't great.
- **Direct phrasing:** The prose says what it means. Minimal hedging. Declarative where the facts support it.
- **Gear-shift markers** (where appropriate): "Here's what they don't tell you:" / "The honest answer:" / "What actually matters:" / "But —"
- **Quiet warmth:** Present but never forced. Earned through specificity, not through emotional language.
- **Faith-scented, not preachy** (where appropriate — logbooks, articles, not restaurant descriptions): Grace is present in the voice. It doesn't need to announce itself.

### Must be absent

- AI-overrepresented vocabulary (see Machine Tell Scan)
- Promotional drift language ("best," "perfect," "must-do," "you'll love," "bucket list")
- Hedging stacks (see Machine Tell Scan)
- Generic beauty ("stunning views," "world-class dining," "unforgettable experience")
- Smoothed grief (tension resolved too quickly in logbook stories)
- Interchangeable descriptions that could apply to any ship/port
- Stacked intensifier adverbs ("truly," "deeply," "incredibly")
- Road-map paragraphs that announce what's coming

### Drift indicators

If three or more of the "must be present" markers are missing, or two or more of the "must be absent" items appear, the draft has drifted from the project's voice. Flag specific locations and suggest minimal restoration edits.

---

## Honesty Check

For each major section of the content, ask:

1. **Is there at least one specific, concrete detail?** If the answer is only generalities ("beautiful," "charming," "world-class"), the section has been flattened. Replace with observation.

2. **Are limitations acknowledged?** Does the content say what's *not* great about this ship/port/venue? If everything is positive, the voice has drifted toward promotion. This site earns trust by telling the truth, including the parts that aren't flattering.

3. **Is there direct address where appropriate?** In logbook and article content: "Some of you..." tied to concrete, plausible lives. If "we" or "travelers" is doing all the work, the writing has lost its pastoral edge.

4. **Has the conditional voice crept in?** Scan for "might," "could," "may," "tends to" where the content should say "is," "does," "will." Keep conditionals only where genuine uncertainty exists.

5. **Does comfort arrive too early?** In grief and logbook content: the hard thing should have time to land before relief appears. If loss and comfort share a sentence, the tension has been collapsed.

6. **Does the content hold what's hard?** Grief, loneliness, fear, a bad experience — these should not be immediately redeemed, explained, or softened. Let them sit. The reader who is in that place needs to feel seen, not fixed.

---

## Cadence Check

Identify the 1-2 moments in the content that carry the most emotional weight. At those spots, check:

1. **Are sentences actually shorter?** If the climactic moment has the same sentence length as the setup, it has been flattened.

2. **Is there compression or antithesis?** "Not... Not... But..." or stacked short declaratives. If absent at key moments, the voice's native rhythm has been smoothed.

3. **Is there a pause-and-pivot?** After the peak, does one quiet sentence pull the reader close? If the high moment rolls straight into the next section, a human move has been lost.

4. **Do gear-shift markers appear?** "Here's what they don't tell you:" / "The honest answer:" before or after key transitions? If not, the draft reads like marketing copy, not a human voice.

5. **Does sentence length vary naturally?** Not mechanically alternated. Not uniformly mid-length. Real variation — some very short, some longer, driven by meaning and not by pattern.

---

## Precision Check

1. **Concrete details present?** Specific deck numbers, restaurant names, times, distances, sensory observations. If the content could describe any ship or any port, it hasn't been sharpened.

2. **The competitor test.** Take any descriptive paragraph. Could it be copy-pasted onto a competitor's site about a different ship and still work? If yes, either add a pinning detail or flag for rewrite.

3. **Emotional words match emotional reality?** When the content describes grief, is "grief" on the page — or has it been swapped for "journey" or "season"? When anger is present, does the word "angry" appear — or only "frustrated"? The sharp word is almost always the right word.

4. **Factual claims tethered?** For every factual claim, is there specificity? "The ship has a pool" is generic. "The pool on Deck 11 runs 25 meters and is rarely crowded before noon" is tethered.

5. **Sensory detail where the content warrants it?** In logbooks and descriptive content: what did it look like, smell like, sound like, feel like? If the content describes a place but triggers no sense memory, it hasn't been sharpened.

---

## Authenticity Risk Assessment

After completing all checks, assign an overall rating:

**Authenticity Risk: Low / Medium / High**

Evaluate based on:

- Machine tell density (how many items flagged in the scan)
- Voice continuity (how many markers present/absent)
- Honesty integrity (does the content tell the truth, including hard truths?)
- Cadence integrity (does the content breathe naturally, or flatline?)
- Precision density (specific details or generic claims?)
- Emotional register accuracy (does grief sound like grief, or like "a difficult time"?)
- Promotional drift (has the voice slid toward selling?)

**High risk if:**

- More than 5 machine tells flagged
- Three or more voice markers missing
- No concrete, specific details in the entire piece
- Climactic moments have the same sentence length as setup
- Every section is the same length (visible symmetry)
- The piece could survive on a competitor's site with no changes
- No rough edges — no place where the writer left a tension unresolved
- Grief or difficulty has been softened into abstraction throughout
- AI-overrepresented vocabulary appears more than twice

**Output:** Flag specific locations. Suggest 3-5 minimal restoration edits. Do not rewrite the content. Restore the voice.

*This assessment is internal and never published.*

---

*Soli Deo Gloria*
