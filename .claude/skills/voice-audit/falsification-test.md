# Voice-Audit Falsification Test

This file holds polished human-written passages that the AI-tell detection framework in `SKILL.md` MUST classify as "likely human." Each passage has multiple features the framework lists as AI signals (parallel structure, triplet closure, manufactured-quotable lines, elevated register), yet should pass the cluster test because of counter-signals (specific scriptural anchors, theological humility, personal voice, named events, period-specific vocabulary).

## Why this file exists

The framework's earlier versions overclaimed on isolated features. Skilled human writers — preachers, poets, essayists — routinely use the structural patterns AI also produces. Without a falsification anchor, the framework risks drifting back toward "any clean prose = AI."

Before any change to the AI-tell detection framework, re-run the modified framework against the passages below. If a framework update produces a "likely AI" verdict on any of them, the update is too aggressive and must be revised.

## Test passage 1 — Charles Spurgeon, *All of Grace* (1886)

> "He is a Savior, and a great one. He is able to save to the uttermost them that come unto God by him. He has saved me. He can save you. He will save all who trust him.
>
> He who made the world undertakes to deal with you, if you will but accept his Son. He gave his Son to die, that men might live; and that fact remains forever. Despite all your unworthiness, you are bidden simply to believe in him, and live."

### What the naive framework would flag

- Triplet closure: "He has saved me. He can save you. He will save all..."
- Parallel construction sustained across multiple sentences
- Repeated subject construction ("He is... He is able... He has... He can... He will...")
- Elevated, polished register
- Rhetorical clean delivery with no friction

### What the cluster test catches (counter-signals)

- Specific scriptural anchor: "able to save to the uttermost them that come unto God by him" — direct paraphrase of Hebrews 7:25, a named referent any Reformed Baptist reader would recognize without explanation
- Named theological subject: Christ as the named Savior, not an abstraction
- Direct address to the reader: "He can save you," "you are bidden" — personal, second-person, specific
- Specific theological proposition: substitutionary atonement ("He gave his Son to die, that men might live") — a doctrinal claim with content, not a sentiment
- Period-specific vocabulary: "bidden," "unworthiness," "uttermost" — pre-1928 register that pre-dates AI training corpora's modal contemporary voice

### Verdict the framework MUST produce

**Likely human.** The counter-signals dominate. The triplet and parallel construction are skilled-preacher rhetoric, not AI output.

## Test passage 2 — Charles Spurgeon, *Morning and Evening* (devotional, undated, 19th century)

> "Faith is the foot of the soul by which it can march along the road of the commandments. Love can make the feet move more swiftly; but it is faith that carries the soul. Faith is the oil enabling the wheels of holy devotion and earnest piety to move well; and without faith the wheels are taken from the chariot, and we drag heavily."

### What the naive framework would flag

- Multiple parallel metaphors stacked (faith as foot, oil, mechanism)
- Triplet implied (foot / love / wheels)
- Elevated register
- Polished, speech-ready cadence
- Manufactured-quotable lines

### What the cluster test catches (counter-signals)

- Specific concrete imagery: "the road of the commandments," "the wheels of holy devotion," "the chariot" — each image is a named, traceable referent inside a specific theological tradition
- Personal voice with collective subject: "we drag heavily" — admits the speaker's own struggle, not an abstract universal claim
- Theological precision: distinguishes faith from love as functions ("Love can make the feet move more swiftly; but it is faith that carries the soul") — a doctrinal distinction that requires substance, not a rhetorical flourish
- Mechanical-imagery specificity: "the wheels are taken from the chariot" — a concrete physical picture, not an abstraction
- Period-specific vocabulary and syntax: "march along the road of the commandments" is 19th-century English that does not appear in contemporary AI training corpora's modal voice

### Verdict the framework MUST produce

**Likely human.** The metaphorical density is preacher's rhetoric. The cluster of counter-signals (theological precision, admitted struggle, period vocabulary, specific imagery) outweighs the structural features.

## Test passage 3 — Charles Spurgeon, *The Treasury of David*, on Psalm 23 (commentary, 1869–1885)

> "The position of this Psalm is worthy of notice. It follows the twenty-second, which is peculiarly the Psalm of the cross. There are no green pastures, no still waters on the other side of the twenty-second Psalm. It is only after we have read, 'My God, my God, why hast thou forsaken me?' that we come to 'The Lord is my Shepherd.' We must by experience know the value of blood-shedding, and see the sword awakened against the Shepherd, before we shall be able to truly know the Sweetness of the Shepherd's care."

### What the naive framework would flag

- Parallel construction across sentences
- Manufactured-quotable framing ("It is only after we have read X that we come to Y")
- Elevated register
- Rhetorical authority claim ("worthy of notice")

### What the cluster test catches (counter-signals)

- Specific cited referents: "the twenty-second" Psalm, "the twenty-third" Psalm — named, traceable, verifiable
- Direct scriptural quotation: "My God, my God, why hast thou forsaken me?" (Psalm 22:1) and "The Lord is my Shepherd" (Psalm 23:1) — quoted, attributable
- Theological sequence-claim with substance: argues for an experiential order (cross before comfort, suffering before peace) that is a specific doctrinal position, not a rhetorical flourish
- Period vocabulary: "blood-shedding," "the Sweetness of the Shepherd's care" — 19th-century capitalization conventions, syntactic registers AI does not reliably reproduce

### Verdict the framework MUST produce

**Likely human.** The Psalm-sequence argument is doctrinal scholarship, not generated prose.

## How to use this file

When the AI-tell detection framework in `SKILL.md` is modified:

1. Re-run the modified framework against each passage above
2. For each passage, produce a verdict using the framework's cluster-scoring rule
3. If any passage produces "likely AI" or worse, the framework update is too aggressive
4. Either revise the update or add a more explicit counter-signal protection

## Adding new test passages

When a new piece of polished human writing is found to be misclassified by the framework (or feared likely to be misclassified), add it to this file as a new test passage with:

- Full quote (or representative excerpt) with attribution
- "What the naive framework would flag" — the structural features that look AI-like
- "What the cluster test catches" — the counter-signals that should produce "likely human"
- "Verdict the framework MUST produce" — the required output

Good candidates for additional test passages: Marilynne Robinson's *Gilead*, Wendell Berry's essays, John Donne's sermons, Frederick Douglass's *Narrative*, James Baldwin's *The Fire Next Time*, any sustained Spurgeon sermon excerpt, any sustained passage from a working pastor's contemporary sermon notes.

Falsification tests are how the framework stays honest. Without them, every refinement drifts back toward over-classification.

---

*Soli Deo Gloria*
