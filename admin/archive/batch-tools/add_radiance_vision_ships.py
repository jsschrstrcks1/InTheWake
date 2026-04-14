#!/usr/bin/env python3
"""
Add Radiance, Enchantment, Vision of the Seas to venues-v2.json
Based on v2.223 Grok compilation data
Note: Chops and Chef's Table are premium dining only on Enchantment
"""

import json

# Load current venues
with open('assets/data/venues-v2.json', 'r') as f:
    data = json.load(f)

# New venue definitions to add
new_venues = {
    "viking-crown-lounge": {
        "name": "Viking Crown Lounge",
        "category": "bars",
        "description": "Top-deck lounge with panoramic views"
    },
    "orpheum-theater": {
        "name": "Orpheum Theater",
        "category": "entertainment",
        "description": "Main show venue for Broadway-style performances"
    },
    "masquerade-theater": {
        "name": "Masquerade Theater",
        "category": "entertainment",
        "description": "Main show venue for Broadway-style performances"
    },
    "diamond-club": {
        "name": "Diamond Club",
        "category": "bars",
        "description": "Exclusive lounge for Crown & Anchor loyalty members"
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

# Radiance of the Seas
radiance_venues = [
    # Dining
    "mdr", "windjammer", "chops", "giovannis", "izumi",
    "chefs-table", "park-cafe", "cafe-latte-tudes",
    # Bars & Lounges
    "schooner-bar", "vintages", "pool-bar", "lobby-bar",
    "english-pub", "champagne-bar", "viking-crown-lounge",
    # Entertainment
    "pacifica-theater", "casino-royale",
    # Activities
    "rock-climbing", "mini-golf", "vitality-spa", "adventure-ocean",
    "solarium", "whirlpools",
    # Other
    "skylight-chapel"
]

data["ships"]["radiance-of-the-seas"] = {
    "name": "Radiance of the Seas",
    "class": "Radiance Class",
    "gt": 90090,
    "venues": radiance_venues
}
print(f"\nAdded ship: Radiance of the Seas ({len(radiance_venues)} venues)")

# Enchantment of the Seas
# Note: Chops and Chef's Table are premium dining only on this ship
enchantment_venues = [
    # Dining (Chops & Chef's Table premium only)
    "mdr", "windjammer", "chops", "giovannis", "izumi",
    "chefs-table", "cafe-latte-tudes", "park-cafe",
    # Bars & Lounges
    "r-bar", "boleros", "schooner-bar", "pool-bar",
    "vintages", "viking-crown-lounge",
    # Entertainment
    "orpheum-theater", "casino-royale",
    # Activities
    "rock-climbing", "mini-golf", "vitality-spa", "adventure-ocean",
    "solarium", "whirlpools",
    # Other
    "skylight-chapel"
]

data["ships"]["enchantment-of-the-seas"] = {
    "name": "Enchantment of the Seas",
    "class": "Vision Class",
    "gt": 82910,
    "venues": enchantment_venues
}
print(f"Added ship: Enchantment of the Seas ({len(enchantment_venues)} venues)")

# Vision of the Seas
vision_venues = [
    # Dining
    "mdr", "windjammer", "chops", "giovannis", "izumi",
    "chefs-table", "cafe-latte-tudes", "park-cafe",
    # Bars & Lounges
    "r-bar", "schooner-bar", "viking-crown-lounge", "pool-bar", "diamond-club",
    # Entertainment
    "masquerade-theater", "casino-royale",
    # Activities
    "rock-climbing", "mini-golf", "vitality-spa", "adventure-ocean",
    "solarium", "whirlpools",
    # Other
    "skylight-chapel"
]

data["ships"]["vision-of-the-seas"] = {
    "name": "Vision of the Seas",
    "class": "Vision Class",
    "gt": 78340,
    "venues": vision_venues
}
print(f"Added ship: Vision of the Seas ({len(vision_venues)} venues)")

# Save updated data
with open('assets/data/venues-v2.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"\nTotal venues: {len(data['venues'])}")
print(f"Total ships: {len(data['ships'])}")
