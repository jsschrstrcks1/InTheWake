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

## Ship-by-Ship Verification Results (Perplexity April 2026)

### Verified Ships — Gap Counts

| Ship | DB Venues | Perplexity Venues | Missing |
|------|-----------|-------------------|---------|
| Adventure | 31 | ~38 | Blue Moon, Viking Crown, Jester's, The Chamber, Lyric Theatre, Broadway Melodies, Shall We Dance, Splashaway Bay, Basketball |
| Allure | 55 | ~44 | Amber Theater, Blaze Comedy Club, H2O Zone, Sabor Bar (stale?) |
| Anthem | 44 | ~50 | English Pub, Chapel, Jamboree, H2O Zone, neighborhoods |
| Brilliance | 33 | ~43 | Jakarta Lounge, Cinema, Concierge Club, Golf Simulators, Hair Salon, Main Pool, Photo Gallery |
| Enchantment | 27 | ~32 | Centrum (confirmed), Island Bar, Fuel Teen, Art Gallery, Photo Gallery |
| Explorer | 37 | ~46 | Connoisseur Cigar Club, Living Room Teen, Star Lounge (shows), many Deck 14 bars already added |
| Freedom | 32 | ~45 | Crown Lounge, Cupcake Cupboard, Olive or Twist, Library, Casitas |

### Decision Needed: Generic vs Named Venues

Perplexity counts generic facilities (Fitness Center, Jogging Track, Main Pool, Hair Salon, Photo Gallery, Art Gallery, Library) as venues. Our database currently doesn't include these for most ships because they exist on every ship and aren't distinctive.

Options:
1. Add generic facilities to every ship (inflates venue counts, provides completeness)
2. Only add named/distinctive venues (keeps data focused, matches restaurant page structure)
3. Add generics to a "common facilities" list that applies to all ships

Recommendation: Option 3 — a common facilities section on every ship page that doesn't need per-ship database entries.
