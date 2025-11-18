#!/usr/bin/env python3
"""
Add final 6 ships to venues-v2.json
Based on v2.223 Grok data VERIFIED against 3+ recent sources

Key corrections from Grok data:
- Ovation: Michael's Genuine Pub → Amber & Oak Pub (changed 2018)
- Utopia: English Pub → Bell & Barley (specific name)
- Odyssey: Escape room is "A Royal Mystery" in Two70, not premium escape room
"""

import json

# Load current venues
with open('assets/data/venues-v2.json', 'r') as f:
    data = json.load(f)

# New venue definitions to add
new_venues = {
    # Oasis Class venues
    "royal-railway": {
        "name": "Royal Railway – Utopia Station",
        "category": "dining",
        "description": "Immersive train dining experience with multi-course American cuisine"
    },
    "mason-jar": {
        "name": "The Mason Jar",
        "category": "dining",
        "description": "Southern restaurant with Low Country classics and live country music"
    },
    "bell-and-barley": {
        "name": "Bell & Barley",
        "category": "bars",
        "description": "British pub with ales, lagers, and live acoustic music"
    },
    "pesky-parrot": {
        "name": "Pesky Parrot",
        "category": "bars",
        "description": "Caribbean tiki bar with tropical rum cocktails"
    },
    "150-central-park": {
        "name": "150 Central Park",
        "category": "dining",
        "description": "Fine dining with seasonal menus in Central Park"
    },
    "hooked-seafood": {
        "name": "Hooked Seafood",
        "category": "dining",
        "description": "New England-style seafood restaurant"
    },
    "el-loco-fresh": {
        "name": "El Loco Fresh",
        "category": "dining",
        "description": "Casual Mexican with tacos, burritos, and quesadillas"
    },
    "sorrentos": {
        "name": "Sorrento's Pizza",
        "category": "dining",
        "description": "Complimentary pizza by the slice"
    },
    "cafe-promenade": {
        "name": "Café Promenade",
        "category": "dining",
        "description": "24-hour café with sandwiches and snacks"
    },
    "boardwalk-dog-house": {
        "name": "Boardwalk Dog House",
        "category": "dining",
        "description": "Hot dogs and sausages on the Boardwalk"
    },
    "johnny-rockets": {
        "name": "Johnny Rockets",
        "category": "dining",
        "description": "Classic American diner with burgers and shakes"
    },
    "sugar-beach": {
        "name": "Sugar Beach",
        "category": "dining",
        "description": "Candy and sweets shop"
    },
    "sprinkles": {
        "name": "Sprinkles",
        "category": "dining",
        "description": "Soft-serve ice cream"
    },
    "coastal-kitchen": {
        "name": "Coastal Kitchen",
        "category": "dining",
        "description": "Exclusive suite-guest restaurant with Mediterranean cuisine"
    },
    "trellis-bar": {
        "name": "Trellis Bar",
        "category": "bars",
        "description": "Outdoor bar in Central Park"
    },
    "rising-tide-bar": {
        "name": "Rising Tide Bar",
        "category": "bars",
        "description": "Moving bar that travels between decks"
    },
    "playmakers": {
        "name": "Playmakers Sports Bar & Arcade",
        "category": "bars",
        "description": "Sports bar with games, arcade, and pub food"
    },
    "bionic-bar": {
        "name": "Bionic Bar",
        "category": "bars",
        "description": "Robotic bartenders mix cocktails"
    },
    "wipeout-bar": {
        "name": "Wipeout Bar",
        "category": "bars",
        "description": "Poolside bar near FlowRider"
    },
    "cantina-fresca": {
        "name": "Cantina Fresca",
        "category": "bars",
        "description": "Mexican-themed poolside bar"
    },
    "spotlight-karaoke": {
        "name": "Spotlight Karaoke Bar",
        "category": "entertainment",
        "description": "Private karaoke rooms"
    },
    "aquatheater": {
        "name": "AquaTheater",
        "category": "entertainment",
        "description": "Open-air amphitheater for diving and acrobatic shows"
    },
    "studio-b": {
        "name": "Studio B",
        "category": "entertainment",
        "description": "Ice skating rink with shows and open skating"
    },
    "music-hall": {
        "name": "Music Hall",
        "category": "entertainment",
        "description": "Live music venue with bands and dancing"
    },
    "the-attic": {
        "name": "The Attic",
        "category": "entertainment",
        "description": "Comedy club"
    },
    "flowrider": {
        "name": "FlowRider",
        "category": "activities",
        "description": "Surf simulator"
    },
    "perfect-storm": {
        "name": "The Perfect Storm",
        "category": "activities",
        "description": "Waterslide complex"
    },
    "ultimate-abyss": {
        "name": "Ultimate Abyss",
        "category": "activities",
        "description": "10-deck dry slide"
    },
    "zip-line": {
        "name": "Zip Line",
        "category": "activities",
        "description": "Zip line across Boardwalk"
    },
    "splashaway-bay": {
        "name": "Splashaway Bay",
        "category": "activities",
        "description": "Kids water play area"
    },
    # Quantum Class venues
    "north-star": {
        "name": "North Star",
        "category": "activities",
        "description": "Observation capsule rising 300 feet above sea level"
    },
    "ripcord": {
        "name": "RipCord by iFLY",
        "category": "activities",
        "description": "Skydiving simulator"
    },
    "seaplex": {
        "name": "SeaPlex",
        "category": "activities",
        "description": "Indoor sports complex with bumper cars, roller skating, basketball"
    },
    "two70": {
        "name": "Two70",
        "category": "entertainment",
        "description": "Multimedia entertainment venue with robo-screens"
    },
    "wonderland": {
        "name": "Wonderland",
        "category": "dining",
        "description": "Imaginative molecular gastronomy with Alice in Wonderland theme"
    },
    "jamies-italian": {
        "name": "Jamie's Italian",
        "category": "dining",
        "description": "Jamie Oliver's Tuscan-inspired Italian restaurant"
    },
    "sky-bar": {
        "name": "Sky Bar",
        "category": "bars",
        "description": "Open-air bar with ocean views"
    },
    # Spectrum Asia-market venues
    "sichuan-red": {
        "name": "Sichuan Red",
        "category": "dining",
        "description": "Modern Chinese fine dining with Sichuan cuisine"
    },
    "hot-pot": {
        "name": "Hot Pot",
        "category": "dining",
        "description": "Traditional Chinese hot pot dining"
    },
    "leaf-and-bean": {
        "name": "Leaf & Bean",
        "category": "dining",
        "description": "Café with Asian-inspired beverages and snacks"
    },
    # Ovation corrected venue
    "amber-and-oak": {
        "name": "Amber & Oak Pub",
        "category": "bars",
        "description": "Traditional English/Irish gastropub (replaced Michael's Genuine Pub in 2018)"
    },
    # Additional
    "laser-tag": {
        "name": "Laser Tag",
        "category": "activities",
        "description": "Glow-in-the-dark laser tag arena"
    },
    "social-100": {
        "name": "Social100",
        "category": "activities",
        "description": "Teen club and hangout space"
    }
}

# Build a set of existing venue slugs
existing_slugs = {v["slug"] for v in data["venues"]}

# Add new venues
added_count = 0
for slug, venue in new_venues.items():
    if slug not in existing_slugs:
        data["venues"].append({
            "slug": slug,
            "name": venue["name"],
            "category": venue["category"],
            "description": venue["description"]
        })
        print(f"Added venue: {venue['name']}")
        added_count += 1
    else:
        print(f"Skipped (exists): {venue['name']}")

print(f"\nAdded {added_count} new venue definitions")

# =============================================================================
# SHIP DATA - VERIFIED
# =============================================================================

# Utopia of the Seas (Oasis Class, 236857 GT)
utopia_venues = [
    # Dining
    "mdr", "windjammer", "coastal-kitchen", "solarium-bistro", "park-cafe",
    "el-loco-fresh", "sorrentos", "cafe-promenade", "boardwalk-dog-house",
    "vitality-cafe", "johnny-rockets", "sugar-beach", "sprinkles",
    "izumi", "chops", "150-central-park", "giovannis", "hooked-seafood",
    "royal-railway", "mason-jar",
    # Bars & Lounges
    "lime-and-coconut", "pesky-parrot", "schooner-bar", "boleros",
    "trellis-bar", "rising-tide-bar", "playmakers", "solarium-bar",
    "pool-bar", "wipeout-bar", "cantina-fresca", "bell-and-barley",
    "spotlight-karaoke", "casino-royale", "suite-lounge", "diamond-club", "vintages",
    # Entertainment
    "royal-theater", "aquatheater", "studio-b", "music-hall", "the-attic",
    # Activities
    "flowrider", "perfect-storm", "ultimate-abyss", "zip-line",
    "rock-climbing", "mini-golf", "adventure-ocean", "social-100",
    "vitality-spa", "solarium", "whirlpools", "splashaway-bay",
    # Other
    "skylight-chapel"
]

data["ships"]["utopia-of-the-seas"] = {
    "name": "Utopia of the Seas",
    "class": "Oasis Class",
    "gt": 236857,
    "venues": utopia_venues
}
print(f"\nAdded ship: Utopia of the Seas ({len(utopia_venues)} venues)")

# Wonder of the Seas (Oasis Class, 236857 GT)
wonder_venues = [
    # Dining
    "mdr", "windjammer", "coastal-kitchen", "solarium-bistro", "park-cafe",
    "el-loco-fresh", "sorrentos", "cafe-promenade", "boardwalk-dog-house",
    "vitality-cafe", "johnny-rockets", "sprinkles",
    "izumi", "chops", "150-central-park", "giovannis", "hooked-seafood",
    "mason-jar", "wonderland",
    # Bars & Lounges
    "lime-and-coconut", "schooner-bar", "boleros", "trellis-bar",
    "rising-tide-bar", "playmakers", "bionic-bar", "solarium-bar",
    "pool-bar", "wipeout-bar", "cantina-fresca",
    "music-hall", "casino-royale", "suite-lounge", "diamond-club", "vintages",
    # Entertainment
    "royal-theater", "aquatheater", "studio-b", "the-attic",
    # Activities
    "flowrider", "perfect-storm", "ultimate-abyss", "zip-line",
    "rock-climbing", "mini-golf", "adventure-ocean", "social-100",
    "vitality-spa", "solarium", "whirlpools", "splashaway-bay",
    # Other
    "skylight-chapel"
]

data["ships"]["wonder-of-the-seas"] = {
    "name": "Wonder of the Seas",
    "class": "Oasis Class",
    "gt": 236857,
    "venues": wonder_venues
}
print(f"Added ship: Wonder of the Seas ({len(wonder_venues)} venues)")

# Symphony of the Seas (Oasis Class, 228081 GT)
symphony_venues = [
    # Dining
    "mdr", "windjammer", "coastal-kitchen", "solarium-bistro", "park-cafe",
    "el-loco-fresh", "sorrentos", "cafe-promenade", "boardwalk-dog-house",
    "vitality-cafe", "johnny-rockets", "sprinkles",
    "izumi", "chops", "150-central-park", "jamies-italian", "hooked-seafood",
    "wonderland", "playmakers",
    # Bars & Lounges
    "lime-and-coconut", "schooner-bar", "boleros", "trellis-bar",
    "rising-tide-bar", "bionic-bar", "solarium-bar",
    "pool-bar", "wipeout-bar", "music-hall",
    "casino-royale", "suite-lounge", "diamond-club", "vintages",
    # Entertainment
    "royal-theater", "aquatheater", "studio-b", "the-attic",
    # Activities
    "flowrider", "perfect-storm", "ultimate-abyss", "zip-line",
    "rock-climbing", "mini-golf", "laser-tag", "adventure-ocean", "social-100",
    "vitality-spa", "solarium", "whirlpools", "splashaway-bay",
    # Other
    "skylight-chapel"
]

data["ships"]["symphony-of-the-seas"] = {
    "name": "Symphony of the Seas",
    "class": "Oasis Class",
    "gt": 228081,
    "venues": symphony_venues
}
print(f"Added ship: Symphony of the Seas ({len(symphony_venues)} venues)")

# Odyssey of the Seas (Quantum Ultra Class, 169300 GT)
odyssey_venues = [
    # Dining
    "mdr", "windjammer", "coastal-kitchen", "solarium-bistro",
    "el-loco-fresh", "sorrentos", "cafe-promenade",
    "izumi", "chops", "chefs-table", "giovannis", "wonderland", "playmakers",
    # Bars & Lounges
    "bionic-bar", "schooner-bar", "boleros", "pool-bar", "solarium-bar",
    "sky-bar", "vintages", "music-hall", "two70",
    "diamond-club", "suite-lounge", "casino-royale",
    # Entertainment
    "royal-theater", "seaplex",
    # Activities - NO MINI GOLF
    "flowrider", "ripcord", "north-star", "rock-climbing",
    "adventure-ocean", "social-100", "vitality-spa",
    "solarium", "whirlpools", "splashaway-bay",
    # Other
    "skylight-chapel"
]

data["ships"]["odyssey-of-the-seas"] = {
    "name": "Odyssey of the Seas",
    "class": "Quantum Ultra Class",
    "gt": 169300,
    "venues": odyssey_venues
}
print(f"Added ship: Odyssey of the Seas ({len(odyssey_venues)} venues)")

# Spectrum of the Seas (Quantum Ultra Class, 169379 GT)
spectrum_venues = [
    # Dining - includes China-market venues
    "mdr", "windjammer", "coastal-kitchen", "solarium-bistro",
    "sichuan-red", "leaf-and-bean", "el-loco-fresh", "sorrentos",
    "izumi", "chops", "jamies-italian", "wonderland", "hot-pot", "chefs-table",
    # Bars & Lounges
    "bionic-bar", "schooner-bar", "boleros", "pool-bar", "solarium-bar",
    "vintages", "music-hall", "two70",
    # Entertainment
    "royal-theater", "casino-royale",
    # Activities - NO MINI GOLF
    "flowrider", "ripcord", "north-star", "seaplex", "rock-climbing",
    "adventure-ocean", "vitality-spa", "solarium", "whirlpools", "splashaway-bay",
    # Other
    "skylight-chapel"
]

data["ships"]["spectrum-of-the-seas"] = {
    "name": "Spectrum of the Seas",
    "class": "Quantum Ultra Class",
    "gt": 169379,
    "venues": spectrum_venues
}
print(f"Added ship: Spectrum of the Seas ({len(spectrum_venues)} venues)")

# Ovation of the Seas (Quantum Class, 168666 GT)
# CORRECTION: Amber & Oak Pub replaced Michael's Genuine Pub in 2018
ovation_venues = [
    # Dining
    "mdr", "windjammer", "coastal-kitchen", "solarium-bistro",
    "el-loco-fresh", "sorrentos", "cafe-promenade",
    "izumi", "chops", "jamies-italian", "wonderland", "chefs-table",
    # Bars & Lounges
    "bionic-bar", "schooner-bar", "boleros", "pool-bar", "solarium-bar",
    "vintages", "music-hall", "two70",
    "diamond-club", "suite-lounge", "amber-and-oak",  # Corrected from Michael's Genuine Pub
    "casino-royale",
    # Entertainment
    "royal-theater",
    # Activities - NO MINI GOLF
    "flowrider", "ripcord", "north-star", "seaplex", "rock-climbing",
    "adventure-ocean", "vitality-spa", "solarium", "whirlpools", "splashaway-bay",
    # Other
    "skylight-chapel"
]

data["ships"]["ovation-of-the-seas"] = {
    "name": "Ovation of the Seas",
    "class": "Quantum Class",
    "gt": 168666,
    "venues": ovation_venues
}
print(f"Added ship: Ovation of the Seas ({len(ovation_venues)} venues)")

# Save updated data
with open('assets/data/venues-v2.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"\nTotal venues: {len(data['venues'])}")
print(f"Total ships: {len(data['ships'])}")
