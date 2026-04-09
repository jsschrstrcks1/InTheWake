---
name: voice-dna
description: "Discovers voice patterns from the cruise content corpus. Analyzes port guides, ship profiles, and articles to extract the actual rhythms, vocabulary, and experiential fingerprints."
version: 1.0.0
---

# Voice DNA — Voice Discovery from Cruise Content

> Measure the voice. Don't guess it.

## Purpose

InTheWake has Humanization (like-a-human + voice-audit) to enforce and check the voice. Voice DNA **discovers** it by analyzing the best existing content. This makes the voice guardrails data-driven.

## When to Fire

- On `/voice-dna` command
- When calibrating voice for a new content type
- When voice feels like it's drifted

## Analysis

Sample 10-15 of the best pages (port guides with strong engagement, articles readers share, tool descriptions that feel right). Extract:

- **Sentence rhythm:** length, variance, fragments at emotional moments
- **Experiential precision:** sensory detail frequency, specificity level
- **Honesty markers:** limitations mentioned, "here's what's not great" frequency
- **Gear-shift markers:** "Here's what they don't tell you:" frequency
- **Grief content:** how hard things are held, when comfort arrives
- **Vocabulary:** cruise-specific terms, avoided AI words, signature phrases

Output a Voice DNA Profile that calibrates the Humanization skills with measured data.

---

*Soli Deo Gloria*
