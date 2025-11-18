#!/usr/bin/env python3
"""
Update Serenade and add Brilliance of the Seas to venues-v2.json
Based on v2.223 Grok compilation data
"""

import json

# Load current venues
with open('assets/data/venues-v2.json', 'r') as f:
    data = json.load(f)

# New venue definitions to add
new_venues = {
    "ritas-cantina": {
        "name": "Rita's Cantina",
        "category": "dining",
        "description": "Mexican cantina with tacos, burritos and margaritas"
    },
    "congo-bar": {
        "name": "Congo Bar",
        "category": "bars",
        "description": "Lounge with tropical drinks"
    },
    "zanzibar-lounge": {
        "name": "Zanzibar Lounge",
        "category": "bars",
        "description": "Lounge with live entertainment"
    },
    "game-reserve": {
        "name": "Game Reserve",
        "category": "bars",
        "description": "Bar and lounge area"
    },
    "pacifica-theater": {
        "name": "Pacifica Theater",
        "category": "entertainment",
        "description": "Main show venue for Broadway-style performances"
    },
    "boleros": {
        "name": "Boleros",
        "category": "bars",
        "description": "Latin lounge with salsa music and dancing"
    },
    "english-pub": {
        "name": "English Pub",
        "category": "bars",
        "description": "British-style pub with ales and pub fare"
    },
    "champagne-bar": {
        "name": "Champagne Bar",
        "category": "bars",
        "description": "Elegant bar specializing in champagne and sparkling wines"
    },
    "suite-lounge": {
        "name": "Suite Lounge",
        "category": "bars",
        "description": "Exclusive lounge for suite guests"
    },
    "chefs-table": {
        "name": "Chef's Table",
        "category": "dining",
        "description": "Exclusive multi-course dining experience"
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

# Updated Serenade of the Seas with complete v2.223 data
serenade_venues = [
    # Dining
    "mdr", "windjammer", "chops", "giovannis", "izumi", "ritas-cantina",
    "chefs-table", "cafe-latte-tudes", "park-cafe",
    # Bars & Lounges
    "r-bar", "crown-and-castle-pub", "casino-royale", "vintages", "lobby-bar",
    "congo-bar", "zanzibar-lounge", "game-reserve", "schooner-bar", "vortex",
    # Entertainment
    "pacifica-theater",
    # Activities
    "mini-golf", "arcade", "rock-climbing", "vitality-spa", "solarium",
    "pool-bar", "whirlpools", "adventure-ocean",
    # Other
    "skylight-chapel"
]

# Update Serenade
data["ships"]["serenade-of-the-seas"]["venues"] = serenade_venues
print(f"\nUpdated ship: Serenade of the Seas ({len(serenade_venues)} venues)")

# Add Brilliance of the Seas
brilliance_venues = [
    # Dining
    "mdr", "windjammer", "chops", "giovannis", "izumi",
    "chefs-table", "cafe-latte-tudes", "park-cafe",
    # Bars & Lounges
    "r-bar", "schooner-bar", "boleros", "vintages", "english-pub",
    "pool-bar", "champagne-bar", "suite-lounge",
    # Entertainment
    "pacifica-theater",
    # Activities
    "rock-climbing", "mini-golf", "vitality-spa", "arcade",
    "solarium", "whirlpools", "adventure-ocean",
    # Other
    "skylight-chapel"
]

data["ships"]["brilliance-of-the-seas"] = {
    "name": "Brilliance of the Seas",
    "class": "Radiance Class",
    "gt": 90090,
    "venues": brilliance_venues
}
print(f"Added ship: Brilliance of the Seas ({len(brilliance_venues)} venues)")

# Save updated data
with open('assets/data/venues-v2.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"\nTotal venues: {len(data['venues'])}")
print(f"Total ships: {len(data['ships'])}")
