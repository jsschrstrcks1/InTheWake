# In the Wake -- Logbook Entry Writing Standard

**Version:** 3.010.300
**Reference Entries:** `/ships/rcl/assets/radiance-of-the-seas.json`
**Purpose:** Define the voice, structure, and integrity requirements for all ship logbook entries.

---

## Purpose

A logbook entry is not a review, not a blog post, and not hype.
It is a measured record -- what the ship revealed while underway, and what the wake teaches the next traveler.

---

## 1. Identity & Posture (Non-Negotiable)

Before writing a single sentence, the writer must internalize this:

- You are standing the watch, not selling passage.
- The ship is treated as a character, not a product.
- The reader is a fellow traveler, not a lead.
- Certainty is avoided where experience is limited.
- Honesty outranks enthusiasm every time.

If a detail is unknown, say so.
If experience is partial, frame it as such.
If something is excellent and flawed, record both.

---

## 2. Required Disclosure (Always First)

Every logbook entry must open with the appropriate disclosure, verbatim in tone and intent:

- **Disclosure A -- Personal Wake Entry**
  Used only if the author personally sailed the ship.

- **Disclosure B -- Aggregate Soundings**
  Used if the author has not sailed but curated verified guest accounts.

- **Disclosure C -- Under Watch**
  Used if neither firsthand nor vetted aggregate data exists.

The disclosure establishes epistemic honesty.
No entry proceeds without it.

(This is not optional and is never rewritten casually.)

---

## 3. Structural Spine of the Entry

Each logbook entry follows the same 7-section structure established in the Radiance of the Seas gold standard (`/ships/rcl/assets/radiance-of-the-seas.json`). All sections use these exact `##` headings, in this order:

### A. `## Full disclosure`

The disclosure statement (see Section 2 above). Always first. Always present.

---

### B. `## The Crew and Staff`

The main narrative body. Crew member interactions, names, personal touches, and hospitality moments.

- Specific crew members by name and role
- Small calibrations: the waiter who remembers, the barista who stops asking
- Dining experience woven in through crew interactions
- Ship-as-lived-space details folded into the crew narrative

This is not a review of "service." It is a record of the humans who operate the ship and how they made the voyage feel.

~150-200 words.

---

### C. `## Embarkation & Disembarkation`

Port details, sailing itinerary dates, booking context, emotional tone of arrival and departure.

- Route and season
- Why this ship was chosen
- What embarkation and disembarkation felt like
- Crowd level, logistical friction

~75-100 words.

---

### D. `## The Real Talk`

The longest section. Honest challenges, cabin reality, dining friction, and personal growth or realization. This is the emotional climax.

- Ship condition (age, wear, dated elements)
- Cabin truth (what the refurbishment touched and what it didn't)
- Dining arc over the full voyage (early highs, late repetition)
- Who this ship serves and who it doesn't
- The emotional pivot: where a negative becomes something honest and human

~200-250 words.

---

### E. `## Accessibility on the Seas`

Physical design features, crew accommodations, accessibility philosophy.

- Wide corridors, elevators, tender port realities
- Crew offering assistance without being asked
- Seating, wheelchair, walker, cane, hearing, sensory observations
- Where the ship helps and where design limits remain

Practical but affirming -- care, not charity.

~50-75 words.

---

### F. `## A Female Crewmate's Perspective`

A **named female crew member's** personal backstory and a meaningful interaction with the persona.

Requirements:
- Always a female crew member (never a passenger)
- Always named, with home location
- Personal sacrifice or wisdom shared (family separation, financial goals, quiet resilience)
- A meaningful exchange that deepens the narrative
- Each crewmate name and location must be unique across all personas for that ship

This section humanizes the crew and reveals something deeper about life at sea.

~75-125 words.

---

### G. `## Closing Thoughts`

Reflection on the voyage's impact, philosophical takeaway, how the ship changed perspective.

- What lingered after disembarkation
- The human residue of the voyage
- No calls to action, no "book now"

Hopeful, transformative, often poetic -- the emotional resolution.

~75-100 words.

---

## 4. Tone Rules (Critical)

- Nautical language is restrained, never gimmicky.
- First person is used only when earned.
- No emojis.
- No marketing adjectives ("luxury," "iconic," "world-class") unless directly critiqued.
- Calm confidence > enthusiasm.
- Respect the reader's intelligence.

If it sounds like a cruise line wrote it -- rewrite it.

---

## 5. What This Is Not

A logbook entry is not:

- A review score
- A top-10 list
- A sales funnel
- A social post
- A press release rewrite

It is a record kept in good faith, offered to the next traveler.

---

## 6. Final Check Before Publishing

Before handing it back, the writer must confirm:

- Disclosure matches reality
- No claims exceed lived or verified data
- Accessibility commentary is present
- Tone is consistent with In the Wake standards
- Nothing feels rushed, inflated, or evasive

If unsure -- leave a note under watch, not a guess.

---

## 7. Persona Framing (Implementation Detail)

Logbook entries are delivered through **named personas** -- fictional composite characters grounded in real guest experiences. Each persona represents a specific traveler type.

### Required Persona Types (per ship)

The validator requires stories covering these traveler perspectives:

| Persona Type | Detection Patterns |
|---|---|
| Solo traveler | "solo" in persona label |
| Multi-generational | "family", "generational", "multigen" |
| Honeymoon / couple | "honeymoon", "couple", "newlywed" |
| Elderly / retiree | "elderly", "grandpa", "retiree", "senior" |
| Single woman | "single woman", "solo woman" |
| Single man | "single man", "solo man" |
| Single parent | "single parent", "single mom", "single dad" |

### Persona JSON Structure

```json
{
  "id": "p1-name",
  "persona_label": "Short descriptor of traveler type and core insight",
  "title": "Entry title referencing ship and journey",
  "markdown": "Full logbook entry in markdown (Disclosure B first, then structural spine)",
  "nav_port": { "target_persona_id": "p2-name", "url": "...", "label": "..." },
  "nav_starboard": { "target_persona_id": "p3-name", "url": "...", "label": "..." }
}
```

### Research-First Workflow

1. **Research real guest reviews** (CruiseCritic, Reddit, cruise blogs, accessibility blogs)
2. **Identify actual positives and negatives** guests report for this specific ship
3. **Ground every story in verified ship features** (real venue names, real itineraries, real crew patterns)
4. **Turn negatives into honest observations** -- not spin, not denial, but reframing through lived experience
5. **Weave in accessibility naturally** -- a travel companion's disability, a crew interaction witnessed, a challenge navigated

### Disability Integration Guidance

Accessibility is not a checkbox. It appears organically through:

- A disabled party member navigating the ship
- A friend made aboard who shares their experience with disability
- Witnessing a crew member help someone with a mobility challenge
- A dinner conversation where someone shares their experience
- The narrator themselves encountering an accessibility friction point

The goal: every reader -- including those with disabilities -- sees themselves reflected in the logbook.

---

## 8. Quality Metrics

| Metric | Requirement |
|---|---|
| Word count per entry | 300-600 words |
| Entries per ship | 10 minimum |
| Persona coverage | All 7 required types |
| Disclosure present | Every entry |
| Accessibility mention | Every entry |
| Ship-specific details | Real venues, real routes, real crew patterns |
| Fabricated claims | Zero tolerance |

---

**Soli Deo Gloria**
