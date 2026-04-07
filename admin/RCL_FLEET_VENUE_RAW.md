# RCL Fleet Venue Data — Raw Perplexity Queries (April 2026)

This file contains raw venue data from Perplexity queries for the full RCL fleet.
Used to cross-check against venues-v2.json and identify gaps.

## Status
- Active fleet (29 ships): All queried
- Historic fleet (11 ships): All queried
- Data verified against venues-v2.json: In progress

## Key Findings

### MDR Name Mapping
All MDR variants serve the same rotating menu. Each ship-specific name
should consolidate to /restaurants/mdr.html.

Named MDRs confirmed:
- Sapphire Dining Room (Explorer)
- Minstrel Dining Room (Brilliance)
- My Fair Lady Dining Room (Enchantment)
- Great Gatsby Dining Room (Grandeur)
- Tides Dining Room (Jewel)
- Cascades Dining Room (Radiance)
- Edelweiss Dining Room (Rhapsody)
- American Icon Grill / The Grande / Silk / Chic (Allure, Anthem, Harmony — dynamic dining)
- Romeo & Juliet / Macbeth / King Lear (Independence — 3 themed MDRs)
- Rembrandt / Michelangelo / Botticelli (Liberty — 3 themed MDRs)
- Grande / Chic (Quantum, Ovation — dynamic dining)
- Flower Drum Song / Brigadoon (Monarch — historic, renamed Mediterraneo/Atlantico)
- Rhapsody / Topaz (Legend 1995 — historic)

### Stale Venues Confirmed Removed
- Ben & Jerry's — all RCL ships (partnership ended Dec 2023)
- Sabor — Freedom of the Seas (no longer onboard)
- Catacombs Disco — Liberty (removed, space reused)

### Venues Needing HTML Pages
See SHIP_AUDIT_FINDINGS.md for the 22-venue gap list.

### Historic Fleet Venue Summary
Historic ships had simpler venue structures. Most had:
- 1-2 dining rooms (some renamed during service)
- 2-4 bars/lounges
- 1 main theater/show lounge
- Basic pool deck
- Casino (on most)
- Limited activities vs modern fleet
