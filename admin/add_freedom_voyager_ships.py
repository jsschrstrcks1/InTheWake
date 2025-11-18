#!/usr/bin/env python3
"""
Add Freedom-class and Voyager-class ships to venues-v2.json from Grok v2.223 data.
"""

import json

# Load existing data
with open('assets/data/venues-v2.json', 'r') as f:
    data = json.load(f)

# New venue definitions to add
new_venues = [
    {
        "slug": "johnny-rockets",
        "name": "Johnny Rockets",
        "category": "dining",
        "subcategory": "specialty",
        "description": "Classic American burgers and shakes",
        "cost": "$12.95 per person",
        "premium": True
    },
    {
        "slug": "olive-or-twist",
        "name": "Olive or Twist",
        "category": "bars",
        "subcategory": "bar",
        "description": "Top-deck martini lounge",
        "premium": False
    },
    {
        "slug": "suite-lounge",
        "name": "Suite Lounge",
        "category": "bars",
        "subcategory": "bar",
        "description": "Exclusive lounge for suite guests",
        "premium": False
    },
    {
        "slug": "the-bamboo-room",
        "name": "The Bamboo Room",
        "category": "bars",
        "subcategory": "bar",
        "description": "Polynesian tiki bar with tropical cocktails",
        "premium": False
    },
    {
        "slug": "the-blaster",
        "name": "The Blaster",
        "category": "activities",
        "subcategory": "waterpark",
        "description": "Aqua coaster waterslide",
        "premium": False
    },
    {
        "slug": "riptide",
        "name": "Riptide",
        "category": "activities",
        "subcategory": "waterpark",
        "description": "Headfirst mat racer slide",
        "premium": False
    },
    {
        "slug": "battle-for-planet-z",
        "name": "Battle for Planet Z",
        "category": "activities",
        "subcategory": "games",
        "description": "Glow-in-the-dark laser tag",
        "cost": "Extra charge",
        "premium": False
    },
    {
        "slug": "the-observatorium",
        "name": "The Observatorium",
        "category": "entertainment",
        "subcategory": "game",
        "description": "Escape room experience",
        "cost": "Extra charge",
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
    "independence-of-the-seas": {
        "name": "Independence of the Seas",
        "class": "Freedom Class",
        "gt": 155889,
        "venues": [
            "mdr",
            "windjammer",
            "giovannis",
            "chops",
            "izumi",
            "johnny-rockets",
            "sorrentos",
            "cafe-promenade",
            "playmakers",
            "schooner-bar",
            "boleros",
            "lime-and-coconut",
            "olive-or-twist",
            "vintages",
            "royal-theater",
            "studio-b",
            "two70",
            "flowrider",
            "rock-climbing-wall",
            "adventure-ocean",
            "splashaway-bay",
            "perfect-storm",
            "vitality-spa",
            "fitness-center",
            "casino-royale",
            "solarium",
            "suite-lounge"
        ]
    },
    "liberty-of-the-seas": {
        "name": "Liberty of the Seas",
        "class": "Freedom Class",
        "gt": 155889,
        "venues": [
            "mdr",
            "windjammer",
            "chops",
            "giovannis",
            "izumi",
            "johnny-rockets",
            "sabor",
            "sorrentos",
            "playmakers",
            "lime-and-coconut",
            "schooner-bar",
            "boleros",
            "r-bar",
            "viking-crown-lounge",
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
    },
    "navigator-of-the-seas": {
        "name": "Navigator of the Seas",
        "class": "Voyager Class",
        "gt": 139999,
        "venues": [
            "mdr",
            "windjammer",
            "el-loco-fresh",
            "hooked-seafood",
            "jamies-italian",
            "chops",
            "izumi",
            "cafe-promenade",
            "sorrentos",
            "lime-and-coconut",
            "schooner-bar",
            "boleros",
            "playmakers",
            "r-bar",
            "the-bamboo-room",
            "royal-theater",
            "studio-b",
            "the-blaster",
            "riptide",
            "battle-for-planet-z",
            "the-observatorium",
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
data['meta']['note'] = 'Expanded to 11 ships with Freedom and Voyager class from Grok v2.223'

# Save
with open('assets/data/venues-v2.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"\nTotal venues: {len(data['venues'])}")
print(f"Total ships: {len(data['ships'])}")
