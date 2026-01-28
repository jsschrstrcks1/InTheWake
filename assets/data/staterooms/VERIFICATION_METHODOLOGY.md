# Cabin Verification Methodology

## Principle
**Slow and complete is better than clever and quick.**

Room by room. Deck by deck. Ship by ship. Until complete.

## Scope
- 270 ships in fleet
- ~1,000+ cabins per ship average
- ~270,000 total cabins requiring verification

## Process Per Ship

### 1. Identify All Cabin Decks
For each ship, determine which decks contain passenger cabins.

### 2. For Each Deck (lowest to highest):
1. Fetch the complete deck plan from CruiseDeckPlans
2. List EVERY cabin number on that deck
3. For each cabin number:
   - Verify the cabin exists
   - Confirm the cabin category (Suite, Interior, Ocean View, Balcony)
   - Note any exceptions (obstructed views, noise, connecting doors, etc.)
4. Record all verified cabins in the ship's JSON file
5. Update the `_verified_count` as you go

### 3. Verification Source
Primary: https://www.cruisedeckplans.com/ships/stateroom-details.php?ship={ship-slug}&cabin={number}

### 4. Cabin Categories
- Suite
- Balcony
- Ocean View
- Interior

### 5. Exception Types
- VIEW_PARTIAL_OVERHANG
- VIEW_OBSTRUCTED_LIFEBOAT
- VIEW_OBSTRUCTED_STRUCTURAL
- NOISE_POOL_ABOVE
- NOISE_MULTIDECK_ATRIUM
- NOISE_ELEVATOR_TRAFFIC
- NOISE_THEATER_BELOW
- NOISE_GALLEY_ABOVE
- CONNECTING_DOOR
- MOTION_FORWARD
- MOTION_AFT
- MOTION_HIGH_DECK

## Progress Tracking

### Royal Caribbean Fleet Status (29 ships total)

#### Ships Completed (6)
| Ship | Class | Cabins | Completion Date |
|------|-------|--------|-----------------|
| Radiance of the Seas | Radiance | 618 | 2026-01-25 |
| Brilliance of the Seas | Radiance | 655 | 2026-01-25 |
| Serenade of the Seas | Radiance | 873 | 2026-01-25 |
| Jewel of the Seas | Radiance | 810 | 2026-01-28 |
| Grandeur of the Seas | Vision | 662 | 2026-01-28 |
| Enchantment of the Seas | Vision | ~540 | 2026-01-28 |

#### Ships In Progress (1)
| Ship | Class | Progress | Notes |
|------|-------|----------|-------|
| Voyager of the Seas | Voyager | 27/~3,100 | Large ship - ongoing |

#### Ships Remaining (22)
**Vision Class (smaller, ~800 cabins):**
- Rhapsody of the Seas
- Vision of the Seas

**Voyager Class (~3,100 cabins):**
- Adventure of the Seas
- Explorer of the Seas
- Mariner of the Seas
- Navigator of the Seas

**Freedom Class (~3,600 cabins):**
- Freedom of the Seas
- Independence of the Seas
- Liberty of the Seas

**Oasis Class (~5,400+ cabins):**
- Allure of the Seas
- Harmony of the Seas
- Oasis of the Seas
- Symphony of the Seas
- Wonder of the Seas
- Utopia of the Seas

**Quantum Class (~4,100 cabins):**
- Anthem of the Seas
- Ovation of the Seas
- Quantum of the Seas
- Spectrum of the Seas
- Odyssey of the Seas

**Icon Class (~5,600 cabins):**
- Icon of the Seas
- Star of the Seas

## Next Steps
1. Complete remaining Vision class ships (Rhapsody, Vision) - smaller ships ~800 cabins each
2. Continue Voyager class verification
3. Progress to larger classes
