#!/usr/bin/env python3
"""
Add new ships and venues to venues-v2.json from Grok v2.223 data.
"""

import json

# Load existing data
with open('assets/data/venues-v2.json', 'r') as f:
    data = json.load(f)

# New venue definitions to add
new_venues = [
    {
        "slug": "cafe-promenade",
        "name": "Café Promenade",
        "category": "dining",
        "subcategory": "complimentary",
        "description": "Snacks and quick bites on the Royal Promenade",
        "premium": False
    },
    {
        "slug": "american-icon-grill",
        "name": "American Icon Grill",
        "category": "dining",
        "subcategory": "complimentary",
        "description": "American comfort food classics",
        "premium": False
    },
    {
        "slug": "chic",
        "name": "Chic",
        "category": "dining",
        "subcategory": "complimentary",
        "description": "Contemporary cuisine with modern presentation",
        "premium": False
    },
    {
        "slug": "the-grande",
        "name": "The Grande",
        "category": "dining",
        "subcategory": "complimentary",
        "description": "Elegant traditional dining",
        "premium": False
    },
    {
        "slug": "silk",
        "name": "Silk",
        "category": "dining",
        "subcategory": "complimentary",
        "description": "Pan-Asian cuisine",
        "premium": False
    },
    {
        "slug": "devinly-decadence",
        "name": "Devinly Decadence",
        "category": "dining",
        "subcategory": "complimentary",
        "description": "Health-conscious lighter fare",
        "premium": False
    },
    {
        "slug": "two70-bar",
        "name": "Two70 Bar",
        "category": "bars",
        "subcategory": "bar",
        "description": "Bar in the Two70 entertainment venue",
        "premium": False
    },
    {
        "slug": "seaplex",
        "name": "SeaPlex",
        "category": "activities",
        "subcategory": "sports",
        "description": "Bumper cars, roller skating, circus school",
        "premium": False
    },
    {
        "slug": "north-star",
        "name": "North Star",
        "category": "activities",
        "subcategory": "observation",
        "description": "Observation pod rising 300 feet above sea level",
        "cost": "Extra charge",
        "premium": False
    },
    {
        "slug": "ripcord-by-ifly",
        "name": "RipCord by iFLY",
        "category": "activities",
        "subcategory": "sports",
        "description": "Skydiving simulator",
        "cost": "Extra charge",
        "premium": False
    },
    {
        "slug": "solarium-bar",
        "name": "Solarium Bar",
        "category": "bars",
        "subcategory": "bar",
        "description": "Bar in the adults-only Solarium",
        "premium": False
    },
    {
        "slug": "r-bar",
        "name": "R Bar",
        "category": "bars",
        "subcategory": "bar",
        "description": "Stylish lounge with martinis and cocktails",
        "premium": False
    },
    {
        "slug": "bull-and-bear-pub",
        "name": "Bull & Bear Pub",
        "category": "bars",
        "subcategory": "bar",
        "description": "English-style pub with draft beers",
        "premium": False
    },
    {
        "slug": "vintages",
        "name": "Vintages",
        "category": "bars",
        "subcategory": "bar",
        "description": "Wine bar with sommelier selections",
        "premium": False
    },
    {
        "slug": "star-lounge",
        "name": "Star Lounge",
        "category": "bars",
        "subcategory": "bar",
        "description": "Lounge with live entertainment",
        "premium": False
    },
    {
        "slug": "pool-bar",
        "name": "Pool Bar",
        "category": "bars",
        "subcategory": "bar",
        "description": "Poolside bar service",
        "premium": False
    },
    {
        "slug": "casino-bar",
        "name": "Casino Bar",
        "category": "bars",
        "subcategory": "bar",
        "description": "Bar in the casino",
        "premium": False
    },
    {
        "slug": "plaza-bar",
        "name": "Plaza Bar",
        "category": "bars",
        "subcategory": "bar",
        "description": "Bar on the Royal Promenade plaza",
        "premium": False
    },
    {
        "slug": "stowaway-piano",
        "name": "Stowaway Piano",
        "category": "entertainment",
        "subcategory": "music",
        "description": "Piano entertainment venue",
        "premium": False
    },
    {
        "slug": "suite-sun-deck",
        "name": "Suite Sun Deck",
        "category": "neighborhoods",
        "subcategory": "area",
        "description": "Exclusive sun deck for suite guests",
        "premium": False
    },
    {
        "slug": "royal-theater",
        "name": "Royal Theater",
        "category": "entertainment",
        "subcategory": "show",
        "description": "Main theater for Broadway-style productions",
        "premium": False
    },
    {
        "slug": "sabor",
        "name": "Sabor",
        "category": "dining",
        "subcategory": "specialty",
        "description": "Modern Mexican cuisine",
        "cost": "$19 per person",
        "premium": True
    },
    {
        "slug": "casino",
        "name": "Casino",
        "category": "activities",
        "subcategory": "casino",
        "description": "Gaming with slots and table games",
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
    "anthem-of-the-seas": {
        "name": "Anthem of the Seas",
        "class": "Quantum Class",
        "gt": 168666,
        "venues": [
            "mdr",
            "windjammer",
            "solarium-bistro",
            "cafe-two70",
            "sorrentos",
            "cafe-promenade",
            "jamies-italian",
            "schooner-bar",
            "boleros",
            "solarium-bar",
            "on-air",
            "royal-theater",
            "music-hall",
            "stowaway-piano",
            "seaplex",
            "north-star",
            "ripcord-by-ifly",
            "flowrider",
            "vitality-spa",
            "fitness-center",
            "casino",
            "solarium",
            "suite-sun-deck"
        ]
    },
    "quantum-of-the-seas": {
        "name": "Quantum of the Seas",
        "class": "Quantum Class",
        "gt": 168666,
        "venues": [
            "mdr",
            "windjammer",
            "cafe-two70",
            "american-icon-grill",
            "chic",
            "the-grande",
            "silk",
            "devinly-decadence",
            "izumi",
            "chops",
            "bionic-bar",
            "two70-bar",
            "two70",
            "royal-theater",
            "music-hall",
            "flowrider",
            "ripcord-by-ifly",
            "seaplex",
            "north-star",
            "vitality-spa",
            "fitness-center",
            "casino-royale",
            "solarium"
        ]
    },
    "freedom-of-the-seas": {
        "name": "Freedom of the Seas",
        "class": "Freedom Class",
        "gt": 156271,
        "venues": [
            "mdr",
            "windjammer",
            "el-loco-fresh",
            "giovannis-italian-kitchen",
            "sabor",
            "lime-and-coconut",
            "solarium-bar",
            "boleros",
            "schooner-bar",
            "r-bar",
            "bull-and-bear-pub",
            "vintages",
            "on-air",
            "star-lounge",
            "pool-bar",
            "casino-bar",
            "plaza-bar",
            "royal-theater",
            "studio-b",
            "music-hall",
            "flowrider",
            "rock-climbing-wall",
            "adventure-ocean",
            "splashaway-bay",
            "perfect-storm",
            "vitality-spa",
            "fitness-center",
            "casino-royale",
            "solarium",
            "suite-sun-deck"
        ]
    }
}

# Add ships
for slug, ship_data in new_ships.items():
    data['ships'][slug] = ship_data
    print(f"Added ship: {ship_data['name']} ({len(ship_data['venues'])} venues)")

# Update metadata
data['meta']['updated'] = '2025-11-18'
data['meta']['note'] = 'Expanded to 8 ships with Quantum and Freedom class from Grok v2.223'

# Save
with open('assets/data/venues-v2.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"\nTotal venues: {len(data['venues'])}")
print(f"Total ships: {len(data['ships'])}")
