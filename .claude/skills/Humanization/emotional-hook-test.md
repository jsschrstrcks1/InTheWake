---
name: emotional-hook-test
description: "Pre-publication quality gate that evaluates reader emotional experience. Complements voice-audit (output quality) and standards (technical compliance) with feeling-level assessment. Applied manually during content review before publishing any page."
version: 1.0.0
---

# The 30-Second Emotional Hook Test

*Does this page make a cruiser feel calmer, more confident, and more prepared — in 30 seconds?*

**Relationship to other guardrails:**

- **like-a-human** shapes the *writing* — voice markers, rhythms, vocabulary, precision.
- **voice-audit** reviews the *output* — scanning for machine tells, authenticity risk.
- **careful-not-clever** guards the *process* — verified work, documented changes.
- **pastoral-guardrails** protects the *reader* — grief-aware, dignity-first content.
- **emotional-hook-test** (this file) evaluates the *feeling* — what the reader experiences in 30 seconds.

When a page passes voice-audit and ship-page-validator but fails the emotional hook test, the technical precision is irrelevant. **The reader doesn't feel schema compliance. They feel trust, calm, and preparation — or they don't.**

---

## The Curse of Knowledge Problem

The builders of In the Wake live inside the machinery: version trees, superset logic, cache busting, JSON-LD, disclosure tiers, canonical invocations. The reader does not. The reader feels:

- "This feels trustworthy." — or it doesn't.
- "This feels like someone who actually sailed." — or it doesn't.
- "This feels calm." — or it doesn't.

This test exists to bridge that gap. It is the feeling-equivalent of what the ship-page-validator does for technical compliance.

---

## The Five Questions (30 Seconds)

Apply these in sequence. Each question maps to a specific time window — what the reader experiences as they scan.

### 1. CLARITY (0–5 seconds)

**Can I tell what this page is *for* — not what it contains — in 5 seconds?**

What to check:
- Title communicates purpose, not just subject
- Lead paragraph answers "why am I here?" not "what is this about?"
- Visual hierarchy draws the eye to the most important thing first

Pass: Purpose is immediately obvious. The reader knows why this page exists.
Fail: Reader has to scroll or parse to understand intent. Title is SEO-first instead of reader-first.

*Example — title that passes:* "Juneau, Alaska" with "Region: Alaska | Season: May–Sep | Tender: No"
*Example — title that fails:* "Allure of the Seas — Deck Plans, Live Tracker, Dining & Videos" (this is a feature list, not a purpose statement)

---

### 2. CALM (5–10 seconds)

**After scanning for 10 seconds, do I feel calmer or more anxious?**

What to check:
- Visual density: does the page breathe?
- Information hierarchy: is the most comforting/useful thing first?
- Competing calls-to-action: are there too many things demanding attention?
- Content before chrome: does the reader see content or navigation/infrastructure?

Pass: The page breathes. White space. Clear sections. One clear next step.
Fail: Overwhelmed. Multiple competing elements. Dense text walls. Promotional interrupts before orientation.

*Example — calm:* "From the Pier" distance bars on port pages. One visual, immediate practical value.
*Example — anxious:* A stats grid with tonnage, crew count, registry, and beam width before any human context.

---

### 3. SEEN (10–15 seconds)

**Does this page feel like someone thought about *me* specifically?**

What to check:
- First-person voice or specific detail that signals lived experience
- Reader-addressing language ("If you're nervous about..." "You owe no one your story...")
- Acknowledgment of the reader's actual situation — not generic cruise info
- For vulnerable audiences (disability, grief, solo): does it communicate "someone thought about me" instantly?

Pass: "This was written by someone who's been where I'm going."
Fail: "This could be any cruise wiki. This is scraped content with a logo."

*The pastoral guardrails are explicit:* "Assume the reader is exhausted by being disbelieved or dismissed elsewhere. This is not another place that does that."

---

### 4. CONFIDENCE (15–20 seconds)

**Do I feel "I can do this" — prepared, not just informed?**

What to check:
- Actionable guidance, not just data dumps
- Decision support: does the page help me *choose*, or just list options?
- Honest limitations acknowledged (builds trust)
- Specific prices, times, distances — not vague qualifiers

Pass: "I know what to do when I get there."
Fail: "I have more information but not more clarity."

*Example — confidence:* "You will see whales." (Juneau logbook) — direct, specific, earned assurance.
*Example — no confidence:* A list of 15 excursions with prices but no guidance on which to choose.

---

### 5. GUIDED (20–30 seconds)

**Would a non-technical 62-year-old first-time cruiser feel guided, not overwhelmed?**

What to check:
- Page navigation: can someone find what they need without understanding the site architecture?
- Progressive disclosure: collapsible sections, anchor links, table of contents for long pages
- Page length management: comprehensive is good, overwhelming is not
- The grandmother test: could you hand your phone to someone's grandmother and she'd find what she needs?

Pass: "I could follow this page with no instructions."
Fail: "This is comprehensive but intimidating. I don't know where to start."

---

## Per-Page Feeling Targets

Each page type has a specific emotional target. If the page doesn't hit its target, the technical compliance doesn't matter.

| Page Type | Feeling Target | The Reader's Inner Voice |
|-----------|---------------|-------------------------|
| **Home** | Trust + orientation | "I'm in the right place. This is trustworthy. I can find what I need." |
| **Ship** | Personality in 60 seconds | "I understand what it's like to be on this ship." |
| **Port** | Preparation + anxiety reduction | "I feel prepared stepping off this ship. Less anxious about this port." |
| **Restaurant** | Clarity + value judgment | "I can see what I'll eat and whether it's worth paying for." |
| **Disability/Accessibility** | Dignity + being seen | "Someone thought about me." |
| **Solo/Grief** | Not alone | "I'm not alone in this." |
| **Tools** | Manageable complexity | "This makes something confusing feel manageable." |
| **Article/Logbook** | Authenticity + learning | "I learned something real from someone who was there." |

---

## Scoring

For each of the 5 questions:

- **PASS** — The question is answered positively. The feeling lands.
- **PARTIAL** — Some elements work but something blocks the full feeling. Note what blocks it.
- **FAIL** — The feeling target is not met. The page needs revision before this test is re-run.

**Overall page assessment:**

- 5/5 PASS → Ship it.
- 4/5 PASS, 1 PARTIAL → Ship it with a note on what to improve.
- 3/5 or fewer → Hold. Revise before publishing.

---

## How to Run the Test

1. Open the page in a browser (or read the HTML body content).
2. Start a 30-second timer.
3. Scan naturally — don't read every word. Mimic how a real visitor would land.
4. Answer each question honestly. "Partially" is always available.
5. Record the results using the format below.

### Audit Report Format

```
## Emotional Hook Test — [Page Name]
**Page:** [filename]
**Type:** [Home / Ship / Port / Restaurant / etc.]
**Feeling Target:** [from table above]
**Date:** [YYYY-MM-DD]

| # | Question | Result | Notes |
|---|----------|--------|-------|
| 1 | CLARITY (5s) | PASS/PARTIAL/FAIL | ... |
| 2 | CALM (10s) | PASS/PARTIAL/FAIL | ... |
| 3 | SEEN (15s) | PASS/PARTIAL/FAIL | ... |
| 4 | CONFIDENCE (20s) | PASS/PARTIAL/FAIL | ... |
| 5 | GUIDED (30s) | PASS/PARTIAL/FAIL | ... |

**Overall:** [X/5 PASS] — [Ship it / Ship with notes / Hold for revision]
**Key finding:** [One sentence summary]
```

---

## The Antidote

Every time you revise a module, ask only this:

1. What does this make the cruiser *feel*?
2. Does this reduce friction?
3. Does this reduce uncertainty?
4. Does this make them feel calmer?
5. Would a non-technical 62-year-old cruiser feel guided, not overwhelmed?

If yes — keep building.
If no — simplify.

---

## The Product

In the Wake is not a database, a cruise wiki, or a modular PDF system. It is:

**The feeling of boarding informed.**
**The feeling of stepping ashore prepared.**
**The feeling of sailing with a trusted companion.**

The PDFs are the cron job. The architecture is the mechanism. The feeling is the product.

---

*Soli Deo Gloria* — Excellence as worship means the reader feels cared for, not just technically served.
