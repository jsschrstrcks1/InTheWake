# Logbook Writing Guide

**Purpose:** Standards for writing venue logbook entries that are authentic,
fact-verified, and pass both Google's quality signals and human gut-check.

---

## Cruise Line Voice Tones

| Line | Core Voice | Tone | Avoid |
|------|-----------|------|-------|
| **RCL** | Enthusiastic family adventure | Warm, accessible, "we discovered..." | Stuffy formality, corporate language |
| **NCL** | Freestyle independence | Relaxed, options-focused, "we chose..." | Rigid itinerary language, judgmental |
| **Virgin** | Edgy, youthful discovery | Playful, first-timer curiosity, "we didn't expect..." | Conservative tone, traditional cruise speak |
| **MSC** | Elegant international | Cultured, appreciative, "the Mediterranean influence..." | Overly casual, American-centric assumptions |
| **Carnival** | Fun, unpretentious joy | Lighthearted, budget-savvy, "honestly, for free..." | Snobbish comparisons, apologetic tone |

---

## Negative Flip Playbook

Common complaints from real cruise reviews and how to reframe them honestly.

### 1. "It was crowded / hard to get a table"
**Flip:** "The popularity speaks for itself — we learned to arrive about 15 minutes
before the rush and never waited more than a few minutes. Embarkation day is the
easiest time to walk right in."
**What we did:** Acknowledged the issue. Gave a specific workaround. Kept it positive.

### 2. "The food was good but not worth the price"
**Flip:** "At $[X] per person, it's not an everyday splurge — but the [specific dish]
alone made it worthwhile. If you're watching the budget, the lunch menu offers the
same kitchen at nearly half the price."
**What we did:** Named the price honestly. Pointed to the standout dish. Offered the
budget alternative.

### 3. "Service was slow"
**Flip:** "This isn't a rush-through meal — the pacing is deliberate, meant to be
savored over an evening. We settled in, ordered a second round of the [specific
cocktail/appetizer], and actually appreciated the unhurried feel."
**What we did:** Reframed "slow" as "deliberate." Added a specific detail. Turned the
negative into an invitation to relax.

### 4. "It was noisy / kids everywhere"
**Flip:** "The energy is infectious — this is where families come alive onboard, and
the laughter is part of the atmosphere. For a quieter experience, the [alternative
venue] is just down the corridor."
**What we did:** Validated the observation. Named the energy as a feature. Offered a
concrete alternative.

### 5. "The menu was limited"
**Flip:** "It's a focused menu — they do [X dishes] and they do them well. The
[signature dish] has clearly been refined over dozens of sailings. If you want variety,
the [alternative venue] casts a wider net."
**What we did:** Reframed "limited" as "focused." Named the best item. Pointed to
an alternative.

### 6. "Not as good as the land-based version"
**Flip:** "Is it the same as the flagship restaurant on [street]? No — but being
able to walk out to a moonlit deck between courses is something no land restaurant
can match. The [specific dish] holds its own anywhere."
**What we did:** Acknowledged the gap honestly. Added the unique at-sea advantage.
Named the dish that delivers.

### 7. "The theming / decor felt dated"
**Flip:** "The design is classic [ship class] — it won't win any modern design awards,
but there's something comforting about a venue that's clearly been loved by thousands
of guests before you. The [specific feature] still impresses."
**What we did:** Acknowledged without apologizing. Found the warmth in "dated."
Named a specific visual.

---

## Logbook Structure Template

```
<section class="card" id="logbook">
  <h2>Traveler's Logbook</h2>
  <h3>{Venue Name} Review: {Evocative, Specific Descriptor}</h3>
  <p class="tiny muted">{Ship Name} · {Month Year} · {Context: Dinner/Lunch/Evening show}</p>

  <!-- 2-3 paragraphs of first-person narrative -->
  <!-- Include: one sensory detail, one specific dish/show/feature, one honest observation -->
  <!-- Use negative flip if addressing common complaint -->

  <p><strong>Pro Tips:</strong></p>
  <ul>
    <li>{Venue-type universal tip with specific detail}</li>
    <li>{Venue-specific tip only a visitor would know}</li>
    <li>{Budget/timing tip}</li>
  </ul>

  <p class="rating"><strong>Our Rating:</strong> {X.X}/5 — {Specific summary}</p>
</section>
```

---

## Fact Verification Checklist

Before committing any logbook entry, verify:

- [ ] **Ship name exists** and has this venue (cross-ref venue JSON + fleet data)
- [ ] **Menu items mentioned** exist on the current menu (cross-ref menu data or web search)
- [ ] **Price quoted** matches verified-prices.json
- [ ] **Deck/location** is accurate for the named ship
- [ ] **Hours/reservations** match current policy
- [ ] **Alternative venues suggested** actually exist on the same ship
- [ ] **No sensory claims** that contradict known venue layout (e.g., "ocean views" in an interior venue)
- [ ] **Rating** is between 3.5-4.8 (no perfect scores, no pity scores)

---

## Authenticity Stress Test

After writing, check for these AI tells:

- [ ] No sentence starts with "Whether you're..." or "From... to..."
- [ ] No "nestled" or "curated" or "elevate your experience"
- [ ] No "a testament to" or "truly remarkable"
- [ ] Sensory details are specific, not generic ("the char on the ribeye" not "delicious flavors")
- [ ] At least one honest limitation mentioned (using flip pattern)
- [ ] Pro Tips include at least one that requires knowledge of the ship layout
- [ ] Review title is specific to THIS venue, not swappable with another

---

*Soli Deo Gloria*
