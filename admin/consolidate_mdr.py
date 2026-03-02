#!/usr/bin/env python3
"""Consolidate ship-specific main dining rooms into one MDR entry"""

import json

# Read the venues data
with open('/home/user/InTheWake/assets/data/venues-v2.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Ship-specific dining rooms to consolidate into MDR
CONSOLIDATE_SLUGS = [
    'the-dining-room',
    'adagio-dining-room',
    'edelweiss-dining-room',
    'great-gatsby-dining-room',
    'cascades-dining-room',
    'minstrel-dining-room',
    'tides-dining-room',
    'reflections-dining-room',
    'my-fair-lady-dining-room',
    'aquarius-dining-room',
    'sapphire-dining-room',
    'sapphire-restaurant'
]

# Update venues
for venue in data['venues']:
    if venue['slug'] in CONSOLIDATE_SLUGS:
        venue['consolidate_into'] = 'mdr'
        print(f"Marked {venue['slug']} to consolidate into mdr")

    # Update the main MDR description to be more comprehensive
    if venue['slug'] == 'mdr':
        venue['name'] = 'Main Dining Room (MDR)'
        venue['description'] = 'Multi-course dinner with rotating menus. Available on all Royal Caribbean ships with different themed names (Adagio, Sapphire, Great Gatsby, etc.)'
        print(f"Updated MDR description")

# Update metadata
data['meta']['version'] = '2.0.1'
data['meta']['updated'] = '2025-11-21'
data['meta']['note'] = data['meta']['note'] + ' | Consolidated MDR variations'

# Write back
with open('/home/user/InTheWake/assets/data/venues-v2.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\nUpdated venues-v2.json")
print(f"Consolidated {len(CONSOLIDATE_SLUGS)} dining room variations into mdr")
