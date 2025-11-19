#!/usr/bin/env python3
"""
Update ships-dynamic.js to use WebP images
Soli Deo Gloria

Maps actual WebP files in /assets/ships/ to ship slugs.
"""

import os
import re
from pathlib import Path

def get_webp_files():
    """Get all WebP files in assets/ships"""
    ships_dir = Path('/home/user/InTheWake/assets/ships')
    webp_files = list(ships_dir.glob('*.webp'))
    return [f.name for f in webp_files]

def map_files_to_ships(webp_files):
    """Map WebP files to ship slugs"""
    ship_map = {}

    # Ship name patterns to match
    ships = [
        'icon-of-the-seas',
        'star-of-the-seas',
        'oasis-of-the-seas',
        'allure-of-the-seas',
        'harmony-of-the-seas',
        'symphony-of-the-seas',
        'wonder-of-the-seas',
        'utopia-of-the-seas',
        'spectrum-of-the-seas',
        'odyssey-of-the-seas',
        'quantum-of-the-seas',
        'anthem-of-the-seas',
        'ovation-of-the-seas',
        'freedom-of-the-seas',
        'liberty-of-the-seas',
        'independence-of-the-seas',
        'voyager-of-the-seas',
        'mariner-of-the-seas',
        'navigator-of-the-seas',
        'adventure-of-the-seas',
        'explorer-of-the-seas',
        'radiance-of-the-seas',
        'brilliance-of-the-seas',
        'serenade-of-the-seas',
        'jewel-of-the-seas',
        'grandeur-of-the-seas',
        'enchantment-of-the-seas',
        'rhapsody-of-the-seas',
        'vision-of-the-seas',
        'majesty-of-the-seas',
        'sovereign-of-the-seas',
        'monarch-of-the-seas',
        'legend-of-the-seas',
        'splendour-of-the-seas',
        'song-of-norway',
        'song-of-america',
        'sun-viking',
        'nordic-empress',
        'nordic-prince',
        'viking-serenade',
    ]

    for ship in ships:
        ship_map[ship] = []

        # Convert slug to search patterns
        ship_words = ship.replace('-', ' ').title().replace(' Of The ', '_of_the_')
        ship_underscore = ship.replace('-', '_')
        ship_hyphen = ship
        ship_camel = ship.replace('-', ' ').title().replace(' ', '_')

        for webp in webp_files:
            webp_lower = webp.lower()

            # Match various naming patterns
            if (ship_hyphen.lower() in webp_lower or
                ship_underscore.lower() in webp_lower or
                ship.replace('-', '').lower() in webp_lower.replace('_', '').replace('-', '')):
                ship_map[ship].append(webp)

        # Sort and limit to 3 best images
        if ship_map[ship]:
            # Prioritize certain naming patterns
            def sort_key(f):
                f_lower = f.lower()
                # Prefer FOM images
                if 'fom' in f_lower:
                    return (0, f)
                # Then numbered images
                if re.search(r'\d\.webp$', f_lower):
                    return (1, f)
                # Then cropped/clean images
                if 'cropped' in f_lower:
                    return (2, f)
                return (3, f)

            ship_map[ship] = sorted(ship_map[ship], key=sort_key)[:3]

    return ship_map

def generate_js_object(ship_map):
    """Generate JavaScript SHIP_IMAGES object"""
    lines = ['  const SHIP_IMAGES = {']

    # Group by class
    classes = {
        'Icon Class': ['icon-of-the-seas', 'star-of-the-seas'],
        'Oasis Class': ['oasis-of-the-seas', 'allure-of-the-seas', 'harmony-of-the-seas',
                       'symphony-of-the-seas', 'wonder-of-the-seas', 'utopia-of-the-seas'],
        'Quantum Ultra Class': ['spectrum-of-the-seas', 'odyssey-of-the-seas'],
        'Quantum Class': ['quantum-of-the-seas', 'anthem-of-the-seas', 'ovation-of-the-seas'],
        'Freedom Class': ['freedom-of-the-seas', 'liberty-of-the-seas', 'independence-of-the-seas'],
        'Voyager Class': ['voyager-of-the-seas', 'mariner-of-the-seas', 'navigator-of-the-seas',
                        'adventure-of-the-seas', 'explorer-of-the-seas'],
        'Radiance Class': ['radiance-of-the-seas', 'brilliance-of-the-seas',
                         'serenade-of-the-seas', 'jewel-of-the-seas'],
        'Vision Class': ['grandeur-of-the-seas', 'enchantment-of-the-seas',
                        'rhapsody-of-the-seas', 'vision-of-the-seas'],
        'Sovereign Class': ['majesty-of-the-seas', 'sovereign-of-the-seas', 'monarch-of-the-seas'],
        'Legend Class': ['legend-of-the-seas', 'splendour-of-the-seas'],
        'Historic Ships': ['song-of-norway', 'song-of-america', 'sun-viking',
                         'nordic-empress', 'nordic-prince', 'viking-serenade'],
    }

    for class_name, ships in classes.items():
        lines.append(f'    // {class_name}')
        for ship in ships:
            images = ship_map.get(ship, [])
            if images:
                img_paths = [f"'/assets/ships/{img}'" for img in images]
                lines.append(f"    '{ship}': [")
                for i, path in enumerate(img_paths):
                    comma = ',' if i < len(img_paths) - 1 else ''
                    lines.append(f"      {path}{comma}")
                lines.append('    ],')
        lines.append('')

    lines.append('  };')
    return '\n'.join(lines)

def main():
    webp_files = get_webp_files()
    print(f"Found {len(webp_files)} WebP files")

    ship_map = map_files_to_ships(webp_files)

    # Count ships with images
    ships_with_images = sum(1 for imgs in ship_map.values() if imgs)
    print(f"Mapped images to {ships_with_images} ships")

    # Generate JS
    js_content = generate_js_object(ship_map)

    # Show summary
    print("\nShip image mapping:")
    for ship, images in ship_map.items():
        if images:
            print(f"  {ship}: {len(images)} images")

    # Write to file
    output_path = '/home/user/InTheWake/admin/ship_images_js.txt'
    with open(output_path, 'w') as f:
        f.write(js_content)

    print(f"\nGenerated JS saved to {output_path}")

if __name__ == '__main__':
    main()
