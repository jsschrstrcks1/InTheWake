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

### Current Ship: Radiance of the Seas
- Total cabins: 1,061
- Verified so far: 75
- Remaining: 986

### Deck Progress (Radiance of the Seas)
| Deck | Total Cabins | Verified | Remaining |
|------|--------------|----------|-----------|
| 2    | TBD          | 4        | TBD       |
| 3    | TBD          | 8        | TBD       |
| 4    | TBD          | 6        | TBD       |
| 7    | TBD          | 8        | TBD       |
| 8    | TBD          | 15       | TBD       |
| 9    | TBD          | 4        | TBD       |
| 10   | TBD          | 30       | TBD       |

## Ships In Progress
1. Jewel of the Seas - 0/~650 verified (RESTARTED - previous data was pattern-based)
2. Voyager of the Seas - 27/~3,100 verified

## Ships Completed
1. Radiance of the Seas - 618 cabins verified (COMPLETE)
2. Brilliance of the Seas - 655 cabins verified (COMPLETE)
3. Serenade of the Seas - 873 cabins verified (COMPLETE)

## Next Steps
Continue Radiance of the Seas:
1. Get complete cabin list for Deck 2
2. Verify each cabin on Deck 2
3. Move to Deck 3
4. Continue until all 1,061 cabins verified
5. Mark ship as COMPLETED
6. Move to next ship
