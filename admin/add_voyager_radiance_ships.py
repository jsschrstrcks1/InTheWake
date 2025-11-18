#!/usr/bin/env python3
"""
Add Voyager of the Seas and Radiance-class ships to venues-v2.json from Grok v2.223 data.
"""

import json

# Load existing data
with open('assets/data/venues-v2.json', 'r') as f:
    data = json.load(f)

# New venue definitions to add
new_venues = [
    {
        "slug": "pig-and-whistle-pub",
        "name": "Pig & Whistle Pub",
        "category": "bars",
        "subcategory": "bar",
        "description": "British pub-inspired bar",
        "premium": False
    },
    {
        "slug": "skylight-chapel",
        "name": "Skylight Chapel",
        "category": "neighborhoods",
        "subcategory": "area",
        "description": "Chapel for weddings and events",
        "premium": False
    },
    {
        "slug": "crown-and-castle-pub",
        "name": "Crown & Castle Pub",
        "category": "bars",
        "subcategory": "bar",
        "description": "Quiet pub atmosphere",
        "premium": False
    },
    {
        "slug": "lobby-bar",
        "name": "Lobby Bar",
        "category": "bars",
        "subcategory": "bar",
        "description": "360-degree bar service in the lobby",
        "premium": False
    },
    {
        "slug": "vortex",
        "name": "Vortex",
        "category": "bars",
        "subcategory": "bar",
        "description": "Revolving bar with panoramic views",
        "premium": False
    },
    {
        "slug": "tropical-theater",
        "name": "Tropical Theater",
        "category": "entertainment",
        "subcategory": "show",
        "description": "Vocalists and dancers productions",
        "premium": False
    },
    {
        "slug": "the-pit-stop",
        "name": "The Pit Stop",
        "category": "bars",
        "subcategory": "bar",
        "description": "Sports bar",
        "premium": False
    },
    {
        "slug": "poolside-movies",
        "name": "Poolside Movies",
        "category": "entertainment",
        "subcategory": "show",
        "description": "Outdoor movie screenings by the pool",
        "premium": False
    },
    {
        "slug": "sports-court",
        "name": "Sports Court",
        "category": "activities",
        "subcategory": "sports",
        "description": "Basketball and sports activities",
        "premium": False
    },
    {
        "slug": "whirlpools",
        "name": "Whirlpools",
        "category": "activities",
        "subcategory": "pool",
        "description": "Hot tubs",
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
    "voyager-of-the-seas": {
        "name": "Voyager of the Seas",
        "class": "Voyager Class",
        "gt": 138194,
        "venues": [
            "mdr",
            "windjammer",
            "cafe-promenade",
            "izumi",
            "giovannis",
            "chops",
            "pig-and-whistle-pub",
            "schooner-bar",
            "lime-and-coconut",
            "royal-theater",
            "studio-b",
            "music-hall",
            "casino-royale",
            "flowrider",
            "perfect-storm",
            "rock-climbing-wall",
            "vitality-spa",
            "fitness-center",
            "adventure-ocean",
            "sports-court",
            "laser-tag",
            "whirlpools",
            "solarium",
            "skylight-chapel"
        ]
    },
    "serenade-of-the-seas": {
        "name": "Serenade of the Seas",
        "class": "Radiance Class",
        "gt": 90090,
        "venues": [
            "mdr",
            "windjammer",
            "giovannis",
            "izumi",
            "chops",
            "crown-and-castle-pub",
            "lobby-bar",
            "pool-bar",
            "r-bar",
            "vintages",
            "vortex",
            "lime-and-coconut",
            "tropical-theater",
            "casino-royale",
            "mini-golf",
            "arcade",
            "rock-climbing-wall",
            "sports-court",
            "vitality-spa",
            "fitness-center",
            "solarium",
            "skylight-chapel"
        ]
    },
    "jewel-of-the-seas": {
        "name": "Jewel of the Seas",
        "class": "Radiance Class",
        "gt": 90090,
        "venues": [
            "mdr",
            "windjammer",
            "izumi",
            "chops",
            "giovannis",
            "latte-tudes",
            "chefs-table",
            "room-service",
            "lobby-bar",
            "the-pit-stop",
            "lime-and-coconut",
            "vortex",
            "vintages",
            "tropical-theater",
            "casino-royale",
            "poolside-movies",
            "rock-climbing-wall",
            "mini-golf",
            "vitality-spa",
            "fitness-center",
            "arcade",
            "solarium",
            "skylight-chapel"
        ]
    }
}

# Add ships
for slug, ship_data in new_ships.items():
    data['ships'][slug] = ship_data
    print(f"Added ship: {ship_data['name']} ({len(ship_data['venues'])} venues)")

# Update metadata
data['meta']['updated'] = '2025-11-18'
data['meta']['note'] = 'Expanded to 17 ships with Voyager complete + 2 Radiance class from Grok v2.223'

# Save
with open('assets/data/venues-v2.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"\nTotal venues: {len(data['venues'])}")
print(f"Total ships: {len(data['ships'])}")
