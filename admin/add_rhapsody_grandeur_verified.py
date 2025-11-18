#!/usr/bin/env python3
"""
Add Rhapsody and Grandeur of the Seas to venues-v2.json
Based on v2.223 Grok data VERIFIED against 3+ recent sources

Key corrections from Grok data:
- Rhapsody: Broadway Melodies Theatre (not "Tropical Theater"), NO mini golf
- Grandeur: Great Gatsby Dining Room, The Palladium theater
"""

import json

# Load current venues
with open('assets/data/venues-v2.json', 'r') as f:
    data = json.load(f)

# New venue definitions to add
new_venues = {
    "edelweiss-dining-room": {
        "name": "Edelweiss Dining Room",
        "category": "dining",
        "description": "Main dining room with elegant multi-level design"
    },
    "broadway-melodies-theatre": {
        "name": "Broadway Melodies Theatre",
        "category": "entertainment",
        "description": "Two-tier main show venue for Broadway-style performances"
    },
    "shall-we-dance-lounge": {
        "name": "Shall We Dance Lounge",
        "category": "entertainment",
        "description": "Lounge with dance floor for karaoke, game shows, and entertainment"
    },
    "ben-and-jerrys": {
        "name": "Ben & Jerry's",
        "category": "dining",
        "description": "Ice cream shop with premium flavors"
    },
    "great-gatsby-dining-room": {
        "name": "Great Gatsby Dining Room",
        "category": "dining",
        "description": "Main dining room spanning two decks with elegant decor"
    },
    "the-palladium": {
        "name": "The Palladium",
        "category": "entertainment",
        "description": "Two-tier main theater for Broadway-style shows and performances"
    },
    "golf-simulator": {
        "name": "Golf Simulator",
        "category": "activities",
        "description": "Virtual golf experience with famous courses"
    },
    "jogging-track": {
        "name": "Jogging Track",
        "category": "activities",
        "description": "Outdoor running track circling the ship"
    },
    "concierge-lounge": {
        "name": "Concierge Lounge",
        "category": "bars",
        "description": "Exclusive lounge for suite guests and top-tier loyalty members"
    }
}

# Build a set of existing venue slugs
existing_slugs = {v["slug"] for v in data["venues"]}

# Add new venues
for slug, venue in new_venues.items():
    if slug not in existing_slugs:
        data["venues"].append({
            "slug": slug,
            "name": venue["name"],
            "category": venue["category"],
            "description": venue["description"]
        })
        print(f"Added venue: {venue['name']}")
    else:
        print(f"Skipped (exists): {venue['name']}")

# Rhapsody of the Seas - VERIFIED DATA
# Corrections: Broadway Melodies Theatre (not Tropical), NO mini golf
rhapsody_venues = [
    # Dining
    "edelweiss-dining-room",  # Unique MDR name
    "windjammer", "chops", "giovannis", "izumi",
    "chefs-table", "park-cafe", "cafe-latte-tudes", "ben-and-jerrys",
    # Bars & Lounges (7 bars confirmed)
    "r-bar", "schooner-bar", "viking-crown-lounge",
    "shall-we-dance-lounge", "pool-bar", "solarium-bar",
    # Entertainment
    "broadway-melodies-theatre",  # Corrected from "Tropical Theater"
    "casino-royale",
    # Activities - NO MINI GOLF (has golf simulator instead)
    "rock-climbing", "vitality-spa", "arcade", "adventure-ocean",
    "solarium", "whirlpools", "golf-simulator", "jogging-track",
    # Other
    "skylight-chapel"
]

data["ships"]["rhapsody-of-the-seas"] = {
    "name": "Rhapsody of the Seas",
    "class": "Vision Class",
    "gt": 78491,
    "venues": rhapsody_venues
}
print(f"\nAdded ship: Rhapsody of the Seas ({len(rhapsody_venues)} venues)")

# Grandeur of the Seas - VERIFIED DATA
# Corrections: Great Gatsby Dining Room, The Palladium theater
grandeur_venues = [
    # Dining
    "great-gatsby-dining-room",  # Unique MDR name
    "windjammer", "chops", "giovannis", "izumi",
    "chefs-table", "cafe-latte-tudes", "park-cafe",
    # Bars & Lounges
    "r-bar", "schooner-bar", "viking-crown-lounge",
    "diamond-club", "pool-bar", "solarium-bar", "concierge-lounge",
    # Entertainment
    "the-palladium",  # Corrected from generic "Main Theater"
    "casino-royale",
    # Activities
    "rock-climbing", "mini-golf", "vitality-spa", "arcade",
    "adventure-ocean", "solarium", "whirlpools",
    # Other
    "skylight-chapel"
]

data["ships"]["grandeur-of-the-seas"] = {
    "name": "Grandeur of the Seas",
    "class": "Vision Class",
    "gt": 73817,
    "venues": grandeur_venues
}
print(f"Added ship: Grandeur of the Seas ({len(grandeur_venues)} venues)")

# Save updated data
with open('assets/data/venues-v2.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"\nTotal venues: {len(data['venues'])}")
print(f"Total ships: {len(data['ships'])}")
