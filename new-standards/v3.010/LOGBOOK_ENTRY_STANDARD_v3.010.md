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

Each logbook entry follows the same internal rhythm, even if the length varies.

### A. Opening -- "Taking the Measure"

One short section setting context:

- When the ship was encountered (season, itinerary type, crowd level if known)
- What kind of traveler this entry best serves (quiet cruiser, family-heavy, accessibility-focused, etc.)
- No adjectives without grounding.
- No hype language.

This answers: "What kind of voyage is this, really?"

---

### B. The Ship as Lived Space

Describe how the ship feels while moving through it, not how it looks in brochures.

Include, where applicable:

- Flow and congestion (elevators, corridors, choke points)
- Noise patterns (day vs night, venues that bleed sound)
- Light, sightlines, and orientation
- How easy it is to "escape" crowds

Avoid deck-by-deck recitations.
Focus on experience over inventory.

---

### C. Cabins & Rest (Only What's Known)

- Only discuss cabin categories personally experienced or widely corroborated.
- Focus on:
  - Storage reality
  - Sleep quality
  - Climate control
  - Accessibility friction points

If you haven't slept there, say so plainly.

---

### D. Dining Reality (Not Menus)

Discuss pace, pressure, and personality of dining:

- MDR tempo
- Specialty restaurant stress vs ease
- Buffet navigation and peak pain points
- Menus and prices live elsewhere -- here we log how it feels to eat onboard.

Always include the pricing disclaimer when prices are referenced:

> "Prices are subject to change at any time without notice. These represent what they were the last time I sailed."

---

### E. Accessibility & Friction Notes (Always Included)

Every logbook entry includes a Disability Commentary, even if brief.

- Elevators, thresholds, seating realities
- Staff awareness and follow-through
- Quiet spaces vs overstimulation
- Where the ship helps -- and where it quietly hinders

This is observational, not activist.
Calm, precise, respectful.

---

### F. Who This Ship Is For -- and Who It Isn't

This section matters more than praise.

Clearly state:

- Who will likely love this ship
- Who may struggle or feel out of place
- What expectations must be adjusted before boarding

No ship is "for everyone."
Say that out loud.

---

### G. The Wake -- Closing Reflection

End with a short reflective paragraph:

- What lingered after disembarkation
- What surprised you
- What you would warn a friend about
- What you would quietly recommend

This is the human residue of the voyage.

No calls to action.
No "book now."
Just the wake.

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
