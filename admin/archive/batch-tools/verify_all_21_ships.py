#!/usr/bin/env python3
"""
Comprehensive verification and correction for all 21 ships
Based on 3+ source verification against 2024 data

This script corrects:
- Unique MDR names (e.g., Cascades, Aquarius, My Fair Lady)
- Unique theater names (e.g., Aurora, Orpheum, Masquerade)
- Missing venues and bars
- Outdated venues (Sabor removed from Allure, etc.)
"""

import json

# Load current venues
with open('assets/data/venues-v2.json', 'r') as f:
    data = json.load(f)

# =============================================================================
# NEW VENUE DEFINITIONS
# =============================================================================

new_venues = {
    # Unique MDR names
    "cascades-dining-room": {
        "name": "Cascades Dining Room",
        "category": "dining",
        "description": "Main dining room on Radiance of the Seas"
    },
    "minstrel-dining-room": {
        "name": "Minstrel Dining Room",
        "category": "dining",
        "description": "Main dining room on Brilliance of the Seas"
    },
    "tides-dining-room": {
        "name": "Tides Dining Room",
        "category": "dining",
        "description": "Main dining room on Jewel of the Seas"
    },
    "reflections-dining-room": {
        "name": "Reflections Dining Room",
        "category": "dining",
        "description": "Main dining room on Serenade of the Seas"
    },
    "my-fair-lady-dining-room": {
        "name": "My Fair Lady Dining Room",
        "category": "dining",
        "description": "Main dining room on Enchantment of the Seas"
    },
    "aquarius-dining-room": {
        "name": "Aquarius Dining Room",
        "category": "dining",
        "description": "Main dining room on Vision of the Seas"
    },
    "sapphire-dining-room": {
        "name": "Sapphire Dining Room",
        "category": "dining",
        "description": "Main dining room on Explorer of the Seas"
    },

    # Unique theater names
    "aurora-theater": {
        "name": "Aurora Theater",
        "category": "entertainment",
        "description": "Main show venue on Radiance of the Seas"
    },
    "tropical-theater": {
        "name": "Tropical Theater",
        "category": "entertainment",
        "description": "Main show venue on Serenade of the Seas"
    },
    "la-scala-theatre": {
        "name": "La Scala Theatre",
        "category": "entertainment",
        "description": "Secondary theater venue"
    },

    # Unique restaurants
    "samba-grill": {
        "name": "Samba Grill",
        "category": "dining",
        "description": "Brazilian churrascaria with tableside meat carving"
    },
    "portside-bbq": {
        "name": "Portside BBQ",
        "category": "dining",
        "description": "Smokehouse BBQ with brisket, pulled pork, and ribs"
    },
    "dog-house": {
        "name": "Dog House",
        "category": "dining",
        "description": "Gourmet hot dogs and sausages"
    },
    "sabor": {
        "name": "Sabor Modern Mexican",
        "category": "dining",
        "description": "Modern Mexican with tacos, enchiladas, and margaritas"
    },
    "fish-and-ships": {
        "name": "Fish & Ships",
        "category": "dining",
        "description": "British-style fish and chips"
    },
    "mystery-dinner-theater": {
        "name": "Mystery Dinner Theater",
        "category": "entertainment",
        "description": "Interactive dinner theater experience"
    },
    "solarium-cafe": {
        "name": "Solarium Café",
        "category": "dining",
        "description": "Light fare in the adults-only Solarium"
    },

    # Unique bars
    "quill-and-compass": {
        "name": "Quill & Compass",
        "category": "bars",
        "description": "Traditional pub"
    },
    "crown-and-kettle": {
        "name": "Crown & Kettle",
        "category": "bars",
        "description": "British pub with ales and live music"
    },
    "duck-and-dog-pub": {
        "name": "Duck & Dog Pub",
        "category": "bars",
        "description": "English-style pub"
    },
    "aquarium-bar": {
        "name": "Aquarium Bar",
        "category": "bars",
        "description": "Bar featuring aquarium displays"
    },
    "bamboo-room": {
        "name": "Bamboo Room",
        "category": "bars",
        "description": "Polynesian tiki bar with tropical cocktails"
    },
    "tavern-bar": {
        "name": "Tavern Bar",
        "category": "bars",
        "description": "Gastropub with sports screens"
    },
    "wig-and-gavel": {
        "name": "Wig & Gavel Pub",
        "category": "bars",
        "description": "British-style pub"
    },
    "globe-and-atlas": {
        "name": "Globe & Atlas Pub",
        "category": "bars",
        "description": "English pub added during 2025 refurbishment"
    },
    "spotlight-lounge": {
        "name": "Spotlight Lounge",
        "category": "entertainment",
        "description": "Karaoke and entertainment lounge"
    },
    "oasis-bar": {
        "name": "Oasis Bar",
        "category": "bars",
        "description": "Poolside bar"
    },
    "on-air-club": {
        "name": "On Air Club",
        "category": "entertainment",
        "description": "Karaoke venue"
    },
    "cosmopolitan-club": {
        "name": "Cosmopolitan Club",
        "category": "bars",
        "description": "Jazz club lounge"
    },
    "brass-and-bock": {
        "name": "Brass & Bock",
        "category": "bars",
        "description": "German-style beer hall"
    },
    "devinly-decadence": {
        "name": "Devinly Decadence",
        "category": "dining",
        "description": "Health-conscious dining option"
    },

    # Activities
    "lost-dunes": {
        "name": "Lost Dunes",
        "category": "activities",
        "description": "Themed mini golf course on Icon Class"
    },
    "navigator-dunes": {
        "name": "Navigator Dunes",
        "category": "activities",
        "description": "Mini golf course on Navigator of the Seas"
    },
    "adventure-dunes": {
        "name": "Adventure Dunes",
        "category": "activities",
        "description": "Two-story mini golf on Adventure of the Seas"
    },
    "freedom-fairways": {
        "name": "Freedom Fairways",
        "category": "activities",
        "description": "Mini golf on Freedom of the Seas"
    },
    "crowns-edge": {
        "name": "Crown's Edge",
        "category": "activities",
        "description": "Ropes course on ship's exterior"
    },
    "bungee-trampoline": {
        "name": "Bungee Trampoline",
        "category": "activities",
        "description": "Bungee jumping trampolines"
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

print(f"\nAdded {added_count} new venue definitions\n")

# =============================================================================
# SHIP CORRECTIONS - Based on 3+ source verification
# =============================================================================

# Icon of the Seas - add Lost Dunes mini golf
if "icon-of-the-seas" in data["ships"]:
    icon_venues = data["ships"]["icon-of-the-seas"]["venues"]
    if "lost-dunes" not in icon_venues:
        icon_venues.append("lost-dunes")
    if "crowns-edge" not in icon_venues:
        icon_venues.append("crowns-edge")
    print(f"Updated: Icon of the Seas ({len(icon_venues)} venues)")

# Star of the Seas - add Lost Dunes
if "star-of-the-seas" in data["ships"]:
    star_venues = data["ships"]["star-of-the-seas"]["venues"]
    if "lost-dunes" not in star_venues:
        star_venues.append("lost-dunes")
    print(f"Updated: Star of the Seas ({len(star_venues)} venues)")

# Harmony of the Seas - add missing venues
harmony_venues = [
    # Dining
    "mdr", "windjammer", "park-cafe", "solarium-bistro", "cafe-promenade",
    "el-loco-fresh", "sorrentos", "boardwalk-dog-house", "johnny-rockets",
    "wonderland", "izumi", "jamies-italian", "chops", "150-central-park",
    "giovannis", "sabor", "chefs-table", "coastal-kitchen",
    # Bars
    "boleros", "bionic-bar", "lime-and-coconut", "schooner-bar",
    "vintages", "trellis-bar", "rising-tide-bar", "pool-bar",
    "diamond-club", "suite-lounge", "casino-royale",
    # Entertainment
    "royal-theater", "aquatheater", "studio-b", "music-hall", "the-attic",
    # Activities
    "ultimate-abyss", "perfect-storm", "zip-line", "flowrider",
    "rock-climbing", "mini-golf", "vitality-spa", "arcade",
    "adventure-ocean", "solarium", "whirlpools",
    # Areas
    "boardwalk", "central-park", "royal-promenade"
]
data["ships"]["harmony-of-the-seas"]["venues"] = harmony_venues
print(f"Updated: Harmony of the Seas ({len(harmony_venues)} venues)")

# Allure of the Seas - 2025 refurb: Sabor removed, Pesky Parrot added
allure_venues = [
    # Dining - Sabor REMOVED, El Loco Fresh added
    "mdr", "windjammer", "park-cafe", "solarium-bistro", "cafe-promenade",
    "el-loco-fresh", "sorrentos", "boardwalk-dog-house", "johnny-rockets",
    "wonderland", "izumi", "chops", "150-central-park", "giovannis",
    "chefs-table", "coastal-kitchen",
    # Bars - Pesky Parrot and Globe & Atlas ADDED
    "boleros", "bionic-bar", "lime-and-coconut", "schooner-bar",
    "vintages", "trellis-bar", "rising-tide-bar", "pool-bar",
    "pesky-parrot", "globe-and-atlas", "on-air-club",
    "diamond-club", "suite-lounge", "casino-royale", "playmakers",
    # Entertainment
    "royal-theater", "aquatheater", "studio-b", "music-hall", "the-attic",
    # Activities
    "ultimate-abyss", "perfect-storm", "zip-line", "flowrider",
    "rock-climbing", "mini-golf", "vitality-spa", "arcade",
    "adventure-ocean", "solarium", "whirlpools",
    # Areas
    "boardwalk", "central-park", "royal-promenade"
]
data["ships"]["allure-of-the-seas"]["venues"] = allure_venues
print(f"Updated: Allure of the Seas ({len(allure_venues)} venues) - 2025 refurb changes")

# Oasis of the Seas
oasis_venues = [
    # Dining
    "mdr", "windjammer", "park-cafe", "solarium-bistro", "cafe-promenade",
    "el-loco-fresh", "sorrentos", "boardwalk-dog-house", "johnny-rockets",
    "izumi", "chops", "150-central-park", "giovannis", "portside-bbq",
    "chefs-table", "coastal-kitchen",
    # Bars
    "boleros", "bionic-bar", "lime-and-coconut", "schooner-bar",
    "vintages", "trellis-bar", "rising-tide-bar", "pool-bar",
    "diamond-club", "suite-lounge", "casino-royale",
    # Entertainment
    "royal-theater", "aquatheater", "studio-b", "music-hall", "the-attic",
    # Activities
    "ultimate-abyss", "perfect-storm", "zip-line", "flowrider",
    "rock-climbing", "mini-golf", "vitality-spa", "arcade",
    "adventure-ocean", "solarium", "whirlpools",
    # Areas
    "boardwalk", "central-park", "royal-promenade"
]
data["ships"]["oasis-of-the-seas"]["venues"] = oasis_venues
print(f"Updated: Oasis of the Seas ({len(oasis_venues)} venues)")

# Anthem of the Seas - NO mini golf, has Brass & Bock
anthem_venues = [
    # Dining
    "mdr", "windjammer", "cafe-promenade", "sorrentos", "johnny-rockets",
    "izumi", "chops", "jamies-italian", "wonderland", "chefs-table",
    "coastal-kitchen",
    # Bars
    "bionic-bar", "schooner-bar", "boleros", "pool-bar", "solarium-bar",
    "sky-bar", "vintages", "music-hall", "two70", "brass-and-bock",
    "diamond-club", "suite-lounge", "casino-royale",
    # Entertainment
    "royal-theater", "seaplex",
    # Activities - NO MINI GOLF
    "flowrider", "ripcord", "north-star", "rock-climbing",
    "adventure-ocean", "vitality-spa", "solarium", "whirlpools", "splashaway-bay"
]
data["ships"]["anthem-of-the-seas"]["venues"] = anthem_venues
print(f"Updated: Anthem of the Seas ({len(anthem_venues)} venues) - no mini golf")

# Quantum of the Seas - has Devinly Decadence
quantum_venues = [
    # Dining - includes Devinly Decadence
    "mdr", "windjammer", "cafe-promenade", "sorrentos", "johnny-rockets",
    "devinly-decadence", "izumi", "chops", "jamies-italian", "wonderland",
    "chefs-table", "coastal-kitchen",
    # Bars
    "bionic-bar", "schooner-bar", "boleros", "pool-bar", "solarium-bar",
    "vintages", "music-hall", "two70",
    "diamond-club", "suite-lounge", "casino-royale",
    # Entertainment
    "royal-theater", "seaplex",
    # Activities - NO MINI GOLF
    "flowrider", "ripcord", "north-star", "rock-climbing",
    "adventure-ocean", "vitality-spa", "solarium", "whirlpools", "splashaway-bay"
]
data["ships"]["quantum-of-the-seas"]["venues"] = quantum_venues
print(f"Updated: Quantum of the Seas ({len(quantum_venues)} venues)")

# Freedom of the Seas
freedom_venues = [
    # Dining
    "mdr", "windjammer", "cafe-promenade", "sorrentos", "el-loco-fresh",
    "johnny-rockets", "izumi", "chops", "giovannis", "chefs-table",
    "playmakers",
    # Bars
    "schooner-bar", "boleros", "pool-bar", "solarium-bar",
    "vintages", "diamond-club", "casino-royale",
    # Entertainment
    "royal-theater", "studio-b",
    # Activities
    "flowrider", "perfect-storm", "rock-climbing", "freedom-fairways",
    "adventure-ocean", "vitality-spa", "solarium", "whirlpools"
]
data["ships"]["freedom-of-the-seas"]["venues"] = freedom_venues
print(f"Updated: Freedom of the Seas ({len(freedom_venues)} venues)")

# Independence of the Seas - has Fish & Ships
independence_venues = [
    # Dining - Fish & Ships unique
    "mdr", "windjammer", "cafe-promenade", "sorrentos", "fish-and-ships",
    "johnny-rockets", "izumi", "chops", "giovannis", "chefs-table",
    "playmakers", "sugar-beach",
    # Bars
    "schooner-bar", "boleros", "pool-bar", "solarium-bar",
    "vintages", "diamond-club", "casino-royale",
    # Entertainment
    "royal-theater", "studio-b",
    # Activities
    "flowrider", "perfect-storm", "rock-climbing", "mini-golf",
    "adventure-ocean", "vitality-spa", "solarium", "whirlpools"
]
data["ships"]["independence-of-the-seas"]["venues"] = independence_venues
print(f"Updated: Independence of the Seas ({len(independence_venues)} venues)")

# Liberty of the Seas - has Sabor
liberty_venues = [
    # Dining - has Sabor
    "mdr", "windjammer", "cafe-promenade", "sorrentos",
    "johnny-rockets", "izumi", "chops", "giovannis", "sabor",
    "chefs-table", "ben-and-jerrys",
    # Bars
    "schooner-bar", "boleros", "pool-bar", "solarium-bar",
    "vintages", "diamond-club", "casino-royale",
    # Entertainment
    "royal-theater", "studio-b",
    # Activities
    "flowrider", "perfect-storm", "rock-climbing", "mini-golf",
    "adventure-ocean", "vitality-spa", "solarium", "whirlpools"
]
data["ships"]["liberty-of-the-seas"]["venues"] = liberty_venues
print(f"Updated: Liberty of the Seas ({len(liberty_venues)} venues)")

# Navigator of the Seas
navigator_venues = [
    # Dining
    "mdr", "windjammer", "cafe-promenade", "sorrentos", "el-loco-fresh",
    "johnny-rockets", "izumi", "chops", "jamies-italian", "hooked-seafood",
    "chefs-table",
    # Bars
    "lime-and-coconut", "bamboo-room", "schooner-bar", "r-bar",
    "pool-bar", "solarium-bar", "playmakers",
    "diamond-club", "casino-royale", "boleros",
    # Entertainment
    "royal-theater", "studio-b",
    # Activities
    "flowrider", "perfect-storm", "rock-climbing", "navigator-dunes",
    "adventure-ocean", "vitality-spa", "solarium", "whirlpools"
]
data["ships"]["navigator-of-the-seas"]["venues"] = navigator_venues
print(f"Updated: Navigator of the Seas ({len(navigator_venues)} venues)")

# Mariner of the Seas
mariner_venues = [
    # Dining
    "mdr", "windjammer", "cafe-promenade", "dog-house",
    "johnny-rockets", "izumi", "chops", "jamies-italian",
    "chefs-table", "ben-and-jerrys", "starbucks",
    # Bars
    "bamboo-room", "schooner-bar", "wig-and-gavel", "r-bar",
    "pool-bar", "solarium-bar", "playmakers", "boleros",
    "diamond-club", "casino-royale", "vintages",
    # Entertainment
    "royal-theater", "studio-b",
    # Activities
    "flowrider", "perfect-storm", "rock-climbing", "mini-golf",
    "adventure-ocean", "vitality-spa", "solarium", "whirlpools"
]
data["ships"]["mariner-of-the-seas"]["venues"] = mariner_venues
print(f"Updated: Mariner of the Seas ({len(mariner_venues)} venues)")

# Explorer of the Seas - MDR: Sapphire
explorer_venues = [
    # Dining
    "sapphire-dining-room", "windjammer", "cafe-promenade",
    "johnny-rockets", "izumi", "chops", "giovannis", "chefs-table",
    # Bars
    "crown-and-kettle", "schooner-bar", "r-bar",
    "pool-bar", "solarium-bar", "boleros",
    "diamond-club", "casino-royale", "vintages",
    # Entertainment
    "royal-theater", "studio-b",
    # Activities
    "flowrider", "rock-climbing", "mini-golf",
    "adventure-ocean", "vitality-spa", "solarium", "whirlpools"
]
data["ships"]["explorer-of-the-seas"]["venues"] = explorer_venues
print(f"Updated: Explorer of the Seas ({len(explorer_venues)} venues)")

# Adventure of the Seas - 2-story Adventure Dunes
adventure_venues = [
    # Dining - no dedicated Sorrento's
    "mdr", "windjammer", "cafe-promenade",
    "johnny-rockets", "izumi", "chops", "giovannis", "chefs-table",
    "ben-and-jerrys",
    # Bars
    "duck-and-dog-pub", "schooner-bar", "aquarium-bar", "r-bar",
    "pool-bar", "solarium-bar", "boleros", "champagne-bar",
    "diamond-club", "casino-royale", "sky-bar",
    # Entertainment
    "royal-theater", "studio-b",
    # Activities
    "flowrider", "rock-climbing", "adventure-dunes",
    "adventure-ocean", "vitality-spa", "solarium", "whirlpools"
]
data["ships"]["adventure-of-the-seas"]["venues"] = adventure_venues
print(f"Updated: Adventure of the Seas ({len(adventure_venues)} venues)")

# Voyager of the Seas
voyager_venues = [
    # Dining
    "mdr", "windjammer", "cafe-promenade", "sorrentos",
    "johnny-rockets", "izumi", "chops", "giovannis", "chefs-table",
    # Bars
    "pig-and-whistle-pub", "tavern-bar", "schooner-bar", "r-bar",
    "pool-bar", "solarium-bar", "sky-bar",
    "diamond-club", "casino-royale", "vintages",
    # Entertainment
    "royal-theater", "la-scala-theatre", "studio-b",
    # Activities
    "flowrider", "rock-climbing", "mini-golf",
    "adventure-ocean", "vitality-spa", "solarium", "whirlpools"
]
data["ships"]["voyager-of-the-seas"]["venues"] = voyager_venues
print(f"Updated: Voyager of the Seas ({len(voyager_venues)} venues)")

# Radiance of the Seas - MDR: Cascades, Theater: Aurora, has Samba Grill
radiance_venues = [
    # Dining
    "cascades-dining-room", "windjammer", "park-cafe", "cafe-latte-tudes",
    "dog-house", "izumi", "chops", "giovannis", "samba-grill", "chefs-table",
    # Bars
    "schooner-bar", "quill-and-compass", "champagne-bar", "lobby-bar",
    "pool-bar", "solarium-bar", "sky-bar", "viking-crown-lounge",
    "diamond-club", "casino-royale", "vintages",
    # Entertainment
    "aurora-theater",
    # Activities
    "rock-climbing", "mini-golf", "vitality-spa",
    "adventure-ocean", "solarium", "whirlpools", "skylight-chapel"
]
data["ships"]["radiance-of-the-seas"]["venues"] = radiance_venues
print(f"Updated: Radiance of the Seas ({len(radiance_venues)} venues)")

# Brilliance of the Seas - MDR: Minstrel, Theater: Pacifica
brilliance_venues = [
    # Dining
    "minstrel-dining-room", "windjammer", "park-cafe", "cafe-latte-tudes",
    "izumi", "chops", "giovannis", "chefs-table",
    # Bars
    "schooner-bar", "r-bar", "champagne-bar", "lobby-bar",
    "pool-bar", "solarium-bar", "english-pub", "viking-crown-lounge",
    "suite-lounge", "vintages",
    # Entertainment
    "pacifica-theater", "casino-royale",
    # Activities
    "rock-climbing", "mini-golf", "vitality-spa", "arcade",
    "adventure-ocean", "solarium", "whirlpools", "skylight-chapel"
]
data["ships"]["brilliance-of-the-seas"]["venues"] = brilliance_venues
print(f"Updated: Brilliance of the Seas ({len(brilliance_venues)} venues)")

# Serenade of the Seas - MDR: Reflections, Theater: Tropical
serenade_venues = [
    # Dining
    "reflections-dining-room", "windjammer", "park-cafe", "cafe-latte-tudes",
    "izumi", "chops", "giovannis", "ritas-cantina", "chefs-table",
    # Bars
    "schooner-bar", "r-bar", "crown-and-castle-pub", "lobby-bar",
    "pool-bar", "solarium-bar", "vortex", "viking-crown-lounge",
    "congo-bar", "zanzibar-lounge", "game-reserve", "vintages",
    # Entertainment
    "tropical-theater", "casino-royale",
    # Activities
    "rock-climbing", "mini-golf", "vitality-spa", "arcade",
    "adventure-ocean", "solarium", "whirlpools", "skylight-chapel"
]
data["ships"]["serenade-of-the-seas"]["venues"] = serenade_venues
print(f"Updated: Serenade of the Seas ({len(serenade_venues)} venues)")

# Jewel of the Seas - MDR: Tides
jewel_venues = [
    # Dining
    "tides-dining-room", "windjammer", "solarium-cafe", "cafe-latte-tudes",
    "izumi", "chops", "giovannis", "chefs-table",
    # Bars
    "schooner-bar", "r-bar", "pool-bar", "solarium-bar",
    "viking-crown-lounge", "vintages",
    # Entertainment
    "royal-theater", "casino-royale",
    # Activities
    "rock-climbing", "mini-golf", "vitality-spa", "arcade",
    "adventure-ocean", "solarium", "whirlpools", "skylight-chapel"
]
data["ships"]["jewel-of-the-seas"]["venues"] = jewel_venues
print(f"Updated: Jewel of the Seas ({len(jewel_venues)} venues)")

# Enchantment of the Seas - MDR: My Fair Lady, Theater: Orpheum
enchantment_venues = [
    # Dining - limited specialty (Chops & Chef's Table only)
    "my-fair-lady-dining-room", "windjammer", "park-cafe", "cafe-latte-tudes",
    "chops", "chefs-table",
    # Bars
    "schooner-bar", "r-bar", "boleros", "spotlight-lounge",
    "pool-bar", "oasis-bar", "solarium-bar", "viking-crown-lounge",
    # Entertainment
    "orpheum-theater", "casino-royale",
    # Activities
    "rock-climbing", "mini-golf", "vitality-spa",
    "adventure-ocean", "solarium", "whirlpools", "bungee-trampoline",
    "skylight-chapel"
]
data["ships"]["enchantment-of-the-seas"]["venues"] = enchantment_venues
print(f"Updated: Enchantment of the Seas ({len(enchantment_venues)} venues)")

# Vision of the Seas - MDR: Aquarius, Theater: Masquerade, no traditional mini golf
vision_venues = [
    # Dining
    "aquarius-dining-room", "windjammer", "park-cafe", "cafe-latte-tudes",
    "izumi", "chops", "giovannis", "chefs-table", "mystery-dinner-theater",
    # Bars
    "schooner-bar", "r-bar", "pool-bar", "solarium-bar",
    "viking-crown-lounge", "diamond-club", "vortex",
    # Entertainment
    "masquerade-theater", "casino-royale",
    # Activities - golf simulator only, no traditional mini golf
    "rock-climbing", "vitality-spa",
    "adventure-ocean", "solarium", "whirlpools", "skylight-chapel"
]
data["ships"]["vision-of-the-seas"]["venues"] = vision_venues
print(f"Updated: Vision of the Seas ({len(vision_venues)} venues) - no traditional mini golf")

# Save updated data
with open('assets/data/venues-v2.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"\n{'='*50}")
print(f"Total venues: {len(data['venues'])}")
print(f"Total ships: {len(data['ships'])}")
print(f"{'='*50}")
