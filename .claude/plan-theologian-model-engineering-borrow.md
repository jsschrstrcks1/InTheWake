# Theologian Model — InTheWake Engineering Borrow (No Voice)

Branch: `claude/theological-model-planning-VU2zD`
Canonical plan: `ken/orchestrator/THEOLOGIAN_MODEL_PLAN.md`

## TL;DR

InTheWake **does not** get theologian-voice LoRAs. The site's voice posture forbids it:

- SDG immutable but theology **implicit** (`cruising/c6c6b22a`, `shared/6b63d32a`).
- Scripture refs in HTML comments, salt as visible phrasing — never quote chapter-and-verse in rendered text (`cruising/97abc51b`).
- Pastoral content is **red lane** — notes only, human writes (`cruising/23866c13`).
- Nautical/maritime voice is the site's ethos, not template decoration (`cruising/e6ba8f34`).

A Spurgeon-voiced cruise paragraph would violate the immutable posture.

## What InTheWake **does** get from the theologian-model build

The engineering, not the voice.

### 1. RAG-grounded citation invariant

Every attributed claim in cruise content resolves to a retrieved-source ID before publish. Same architectural rule as the sermon stack — different sources:

- Deployment data (homeports, regions, season, typical_ports, itinerary_lengths) → CruiseMapper primary per `cruising/2dd627ed`; cross-check secondary.
- IMO numbers → VesselFinder / MarineTraffic / CruiseMapper per `cruising/9f819c5e`.
- Deck plans, ship pages → official cruise-line URL patterns per `cruising/f621ebcd`.
- Prices, menus, deck locations → web-verified two-source minimum per `cruising/4918b2a5`.

Cite-or-flag becomes a system invariant. Unverified specifics get flagged or held, never published.

### 2. Orchestra-as-pre-execution-gate (already running)

`cruising` orchestra mode at `ken/ae168797` continues unchanged. The theologian-model plan reinforces — does not modify — this discipline.

### 3. Voice-audit calibrated by voice-dna

Existing skill, already deployed. The theological-model build informs technique cross-repo but does not transfer voice content. Sermon voice is prophetic / compressed / pastoral; cruise voice is steady observer / experiential precision (`shared/e291a2c0`).

### 4. Hallucination-elimination as deliverable

The "AI-generated content with specific-sounding details" failure mode already named in memory (`cruising/4918b2a5`) is the exact problem the RAG-citation invariant addresses. Specific-sounding-but-unverified prose is worse than no prose; the system must hold or flag it.

## What InTheWake does **not** get

- No theologian LoRAs deployed against cruise content.
- No Spurgeon / Washer / Sproul voicing in port pages, ship pages, logbook entries, restaurant reviews.
- No theological commentary in visible prose. Where Scripture-resonance fits, it goes in HTML comments per `cruising/97abc51b`.
- No "pastoral LoRA" softening of pastoral content. Red lane stays human.

## Status

Planning. The InTheWake-side work here is essentially confirmation that the theologian-model build does not bleed into cruise voice, plus alignment of the RAG-citation invariant with the existing two-source-minimum and CruiseMapper-primary discipline.

Soli Deo Gloria.
