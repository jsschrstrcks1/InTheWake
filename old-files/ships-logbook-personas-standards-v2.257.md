# In the Wake — Logbook Personas Standards
Version: v2.257

## Overview
Each ship’s Logbook JSON contains 10 personas that embody real, heartwarming cruise stories. These entries are designed to inspire potential cruisers by reflecting real human emotion and accurate itineraries while maintaining the tone, nautical imagery, and faith-friendly warmth consistent with In the Wake standards.

## Required Metadata
Each persona must include:
- **id** — A unique lowercase identifier, e.g. `p1-elmer`
- **persona_label** — Short editorial note about the perspective or context (1–2 sentences max).
- **title** — A compelling, headline-quality title designed for human emotion and SEO readability.
- **markdown** — The full logbook entry written in rich Markdown using the following format:
  - Disclosure (always first; excluded from word count)
  - Subsections: Intro, Crew & Staff, Dining, Entertainment, Accessibility (if relevant), Tear-jerker moment, Closing
  - A consistent tone: authentic, emotional, faith-friendly, family-readable
  - Real itineraries and accurate ports for 2024–2025 only
- **nav_port / nav_starboard** — Proper links to next/previous persona entries.

## Disclosure
> Full disclosure: I have not yet sailed [Ship Name]. Until I do, this Logbook is an aggregate of vetted guest soundings, taken in their own wake, trimmed and edited to our standards.

## Tone Guidance
- Prioritize *heartwarming*, with occasional bittersweet moments that encourage rather than discourage travel.
- Avoid cynicism or overt salesmanship — sincerity first.
- Integrate nautical language naturally (“wake,” “helm,” “port,” “starboard,” “deck,” etc.).
- Optionally include subtle faith references (e.g., answered prayers, gratitude, sunsets, fellowship moments).

## Persona Range
| Persona | Core Concept | Suggested Emotional Arc |
|----------|---------------|--------------------------|
| P1-Elmer | Grandfather rediscovering joy with family | Nostalgic, thankful, tearful at reconnection |
| P2-Marissa | Solo woman rediscovering confidence | Independence, peace, renewal |
| P3-Lydia | Single mom finding rest and family unity | Healing, bonding, laughter |
| P4-Tom & Jean | Empty nesters | Romance reborn at sea |
| P5-Nathan | Workaholic learning to disconnect | Conviction → calm |
| P6-Maya & Jordan | Young newlyweds | Wonder, humor, shared faith |
| P7-Carlos | Disabled veteran | Reflection, healing, belonging |
| P8-Grace | Mission trip return | Purpose, gratitude, closure |
| P9-Danielle & Friends | Girl’s getaway | Joy, laughter, community |
| P10-Ezekiel | Pastor on sabbatical | Quiet renewal, faith restored |

## Validation Checklist
- [x] All JSON must validate against schema v2.257
- [x] All dates and itineraries match real 2024–2025 Royal Caribbean deployments
- [x] Disclosure text exact and unmodified
- [x] Markdown under 1200 words (excluding disclosure)
- [x] Each persona includes a “tear-jerker” moment
- [x] No duplicate names or story templates reused
- [x] Language: warm, nautical, faith-compatible
