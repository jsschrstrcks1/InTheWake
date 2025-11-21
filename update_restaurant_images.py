#!/usr/bin/env python3
"""Update restaurant pages to use SVG category images instead of watermark.png"""

import os
import re

# Categorize venues by type
VENUE_CATEGORIES = {
    'bar-lounge': [
        'wipeout-bar', 'zanzibar-lounge', 'wig-and-gavel', 'vortex', 'vintages',
        'two70-bar', 'viking-crown-lounge', 'trellis-bar', 'tavern-bar', 'swim-and-tonic',
        'suite-lounge', 'star-lounge', 'sky-bar', 'solarium-bar', 'rising-tide-bar',
        'r-bar', 'pool-bar', 'plaza-bar', 'pig-and-whistle-pub', 'pesky-parrot',
        'olive-or-twist', 'oasis-bar', 'north-star-bar', 'mason-jar', 'lous-jazz-n-blues',
        'lobby-bar', 'leaf-and-bean', 'lime-and-coconut', 'globe-and-atlas',
        'english-pub', 'dueling-pianos', 'diamond-club', 'duck-and-dog-pub', 'dazzles',
        'crown-and-kettle', 'crown-and-castle-pub', 'cosmopolitan-club', 'congo-bar',
        'cloud-17', 'concierge-lounge', 'champagne-bar', 'casino-bar', 'bull-and-bear-pub',
        'bubbles', 'boleros', 'brass-and-bock', 'bionic-bar', 'bell-and-barley',
        'bamboo-room', 'aquarium-bar', 'amber-and-oak', 'the-bamboo-room', 'on-air',
        'game-reserve', 'chic'
    ],
    'asian-cuisine': [
        'silk', 'sichuan-red', 'izumi-in-the-park', 'hot-pot'
    ],
    'italian-cuisine': [
        'giovannis-italian-kitchen', 'sorrentos'
    ],
    'specialty-dining': [
        'the-pit-stop', 'the-grande', 'the-overlook', 'the-dining-room', 'sugar-beach',
        'sabor', 'sabor-taqueria', 'rye-and-bean', 'royal-railway', 'ritas-cantina',
        'quill-and-compass', 'portside-bbq', 'pier-7', 'playmakers', 'lincoln-park-supper-club',
        'hooked-seafood', 'fish-and-ships', 'empire-supper-club', 'devinly-decadence',
        'desserted', 'celebration-table', 'cantina-fresca', 'boardwalk-dog-house',
        'el-loco-fresh', '150-central-park', 'tides-dining-room', 'sapphire-dining-room',
        'sapphire-restaurant', 'reflections-dining-room', 'minstrel-dining-room',
        'my-fair-lady-dining-room', 'great-gatsby-dining-room', 'edelweiss-dining-room',
        'cascades-dining-room', 'adagio-dining-room', 'american-icon-grill',
        'aquarius-dining-room', 'mdr', 'park-cafe', 'windjammer', 'aquadome-market',
        'basecamp', 'dog-house', 'pearl-cafe', 'surfside-eatery', 'dining-activities',
        'starbucks', 'sprinkles', 'solarium-cafe', 'johnny-rockets', 'cafe-two70',
        'ben-and-jerrys'
    ]
}

# Build reverse mapping (venue filename -> category)
venue_to_category = {}
for category, venues in VENUE_CATEGORIES.items():
    for venue in venues:
        venue_to_category[venue] = category

# Default category for any venues not explicitly categorized
DEFAULT_CATEGORY = 'specialty-dining'

def get_category_for_venue(filename):
    """Get the SVG category for a venue based on its filename"""
    venue_name = filename.replace('.html', '')
    return venue_to_category.get(venue_name, DEFAULT_CATEGORY)

def update_restaurant_page(filepath):
    """Replace watermark.png with appropriate SVG category image"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Get venue filename
    filename = os.path.basename(filepath)
    category = get_category_for_venue(filename)
    svg_path = f'/assets/images/restaurants/{category}.svg'

    # Replace watermark.png with SVG
    updated_content = re.sub(
        r'/assets/watermark\.png',
        svg_path,
        content
    )

    if updated_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        return True
    return False

def main():
    restaurants_dir = '/home/user/InTheWake/restaurants'
    updated_count = 0

    for filename in os.listdir(restaurants_dir):
        if filename.endswith('.html'):
            filepath = os.path.join(restaurants_dir, filename)
            if update_restaurant_page(filepath):
                updated_count += 1
                print(f"Updated: {filename}")

    print(f"\nTotal files updated: {updated_count}")

if __name__ == '__main__':
    main()
