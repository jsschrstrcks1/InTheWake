#!/usr/bin/env python3
"""
Add remaining Voyager-class ships to venues-v2.json from Grok v2.223 data.
"""

import json

# Load existing data
with open('assets/data/venues-v2.json', 'r') as f:
    data = json.load(f)

# New venue definitions to add
new_venues = [
    {
        "slug": "sapphire-restaurant",
        "name": "Sapphire Restaurant",
        "category": "dining",
        "subcategory": "complimentary",
        "description": "Main dining room (Explorer naming)",
        "premium": False
    },
    {
        "slug": "aquarium-bar",
        "name": "Aquarium Bar",
        "category": "bars",
        "subcategory": "bar",
        "description": "Themed bar with aquatic decor",
        "premium": False
    },
    {
        "slug": "mini-golf",
        "name": "Mini Golf",
        "category": "activities",
        "subcategory": "sports",
        "description": "9-hole mini golf course",
        "premium": False
    },
    {
        "slug": "game-show",
        "name": "Game Show",
        "category": "entertainment",
        "subcategory": "show",
        "description": "Interactive game show entertainment",
        "premium": False
    }
]

# Add new venues to master list
existing_slugs = {v['slug'] for v in data['venues']}
for venue in new_venues:
    if venue['slug'] not in existing_slugs:
        data['venues'].append(venue)
        print(f"Added venue: {venue['name']}")
    else:
        print(f"Skipped (exists): {venue['name']}")

# New ship definitions
new_ships = {
    "mariner-of-the-seas": {
        "name": "Mariner of the Seas",
        "class": "Voyager Class",
        "gt": 139863,
        "venues": [
            "mdr",
            "windjammer",
            "chops",
            "izumi",
            "jamies-italian",
            "the-bamboo-room",
            "schooner-bar",
            "music-hall",
            "game-show",
            "royal-theater",
            "flowrider",
            "vitality-spa",
            "fitness-center",
            "casino-royale",
            "solarium"
        ]
    },
    "explorer-of-the-seas": {
        "name": "Explorer of the Seas",
        "class": "Voyager Class",
        "gt": 139570,
        "venues": [
            "sapphire-restaurant",
            "windjammer",
            "giovannis",
            "chops",
            "izumi",
            "schooner-bar",
            "aquarium-bar",
            "royal-promenade",
            "royal-theater",
            "studio-b",
            "solarium",
            "mini-golf",
            "flowrider",
            "rock-climbing-wall",
            "vitality-spa",
            "fitness-center",
            "casino-royale"
        ]
    },
    "adventure-of-the-seas": {
        "name": "Adventure of the Seas",
        "class": "Voyager Class",
        "gt": 138193,
        "venues": [
            "mdr",
            "windjammer",
            "chops",
            "izumi",
            "sorrentos",
            "johnny-rockets",
            "lime-and-coconut",
            "schooner-bar",
            "royal-theater",
            "studio-b",
            "flowrider",
            "rock-climbing-wall",
            "adventure-ocean",
            "splashaway-bay",
            "perfect-storm",
            "vitality-spa",
            "fitness-center",
            "casino-royale",
            "solarium"
        ]
    }
}

# Add ships
for slug, ship_data in new_ships.items():
    data['ships'][slug] = ship_data
    print(f"Added ship: {ship_data['name']} ({len(ship_data['venues'])} venues)")

# Update metadata
data['meta']['updated'] = '2025-11-18'
data['meta']['note'] = 'Expanded to 14 ships with complete Voyager class from Grok v2.223'

# Save
with open('assets/data/venues-v2.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"\nTotal venues: {len(data['venues'])}")
print(f"Total ships: {len(data['ships'])}")
