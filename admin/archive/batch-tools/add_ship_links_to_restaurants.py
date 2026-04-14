#!/usr/bin/env python3
"""
Add Ship Links to Restaurant Pages
Soli Deo Gloria

Updates all restaurant pages with actual ship availability data from venues-v2.json,
with links to each ship's page at /ships/rcl/[slug].html
"""

import json
import os
import re
from pathlib import Path

def load_venues_data():
    """Load venues-v2.json and build venue-to-ships mapping"""
    with open('assets/data/venues-v2.json', 'r') as f:
        data = json.load(f)

    # Build mapping of venue slug -> list of ships
    venue_ships = {}

    for ship_slug, ship_info in data['ships'].items():
        ship_name = ship_info['name']
        for venue_slug in ship_info.get('venues', []):
            if venue_slug not in venue_ships:
                venue_ships[venue_slug] = []
            venue_ships[venue_slug].append({
                'slug': ship_slug,
                'name': ship_name,
                'class': ship_info.get('class', '')
            })

    # Sort ships by class order then name
    class_order = {
        'Icon Class': 1,
        'Oasis Class': 2,
        'Quantum Ultra Class': 3,
        'Quantum Class': 4,
        'Freedom Class': 5,
        'Voyager Class': 6,
        'Radiance Class': 7,
        'Vision Class': 8
    }

    for venue_slug in venue_ships:
        venue_ships[venue_slug].sort(key=lambda s: (
            class_order.get(s['class'], 99),
            s['name']
        ))

    return venue_ships

def format_ship_name(name):
    """Shorten ship name for display"""
    return name.replace(' of the Seas', '')

def generate_ships_html(ships):
    """Generate HTML for ship links"""
    if not ships:
        return '<p>Ship availability information coming soon.</p>'

    # Group by class
    by_class = {}
    for ship in ships:
        ship_class = ship['class']
        if ship_class not in by_class:
            by_class[ship_class] = []
        by_class[ship_class].append(ship)

    lines = []
    lines.append('<p>Available on the following Royal Caribbean ships:</p>')
    lines.append('<ul class="ship-availability-list" style="list-style: none; padding: 0; margin: 1rem 0;">')

    for ship_class in sorted(by_class.keys(), key=lambda c: {
        'Icon Class': 1, 'Oasis Class': 2, 'Quantum Ultra Class': 3,
        'Quantum Class': 4, 'Freedom Class': 5, 'Voyager Class': 6,
        'Radiance Class': 7, 'Vision Class': 8
    }.get(c, 99)):
        class_ships = by_class[ship_class]
        ship_links = []
        for ship in class_ships:
            link = f'<a href="/ships/rcl/{ship["slug"]}.html">{format_ship_name(ship["name"])}</a>'
            ship_links.append(link)

        ships_str = ', '.join(ship_links)
        lines.append(f'  <li style="margin-bottom: 0.5rem;"><strong>{ship_class}:</strong> {ships_str}</li>')

    lines.append('</ul>')

    return '\n      '.join(lines)

def update_restaurant_page(filepath, venue_ships):
    """Update a single restaurant page with ship links"""
    # Extract venue slug from filename
    venue_slug = Path(filepath).stem

    with open(filepath, 'r') as f:
        content = f.read()

    # Get ships for this venue
    ships = venue_ships.get(venue_slug, [])

    # Generate new HTML
    ships_html = generate_ships_html(ships)

    # Find the venue name from the page title
    title_match = re.search(r'<h1>([^<]+)</h1>', content)
    venue_name = title_match.group(1) if title_match else venue_slug.replace('-', ' ').title()

    # Pattern to match the existing "Where You'll Find It" section
    old_pattern = r'(<h2>Where You\'ll Find It</h2>\s*<p>)[^<]+(</p>)'

    # New content
    new_content = f'<h2>Where You\'ll Find It</h2>\n      {ships_html}'

    # Replace the entire section content
    # Match from h2 to closing </p> before </div>
    section_pattern = r'(<h2>Where You\'ll Find It</h2>)\s*<p>[^<]+</p>'

    if re.search(section_pattern, content):
        updated = re.sub(section_pattern, new_content, content)

        with open(filepath, 'w') as f:
            f.write(updated)

        return len(ships)
    else:
        print(f"  Warning: Could not find pattern in {filepath}")
        return -1

def main():
    """Main function"""
    print("Loading venues data...")
    venue_ships = load_venues_data()
    print(f"Found {len(venue_ships)} venues with ship data")

    # Get all restaurant pages
    restaurants_dir = Path('restaurants')
    pages = list(restaurants_dir.glob('*.html'))

    # Skip mdr.html as it's the template
    pages = [p for p in pages if p.name != 'mdr.html']

    print(f"\nUpdating {len(pages)} restaurant pages...")

    updated = 0
    skipped = 0
    no_ships = 0

    for page in sorted(pages):
        venue_slug = page.stem
        ship_count = update_restaurant_page(page, venue_ships)

        if ship_count == -1:
            skipped += 1
            print(f"  Skipped: {page.name}")
        elif ship_count == 0:
            no_ships += 1
            print(f"  No ships: {page.name}")
        else:
            updated += 1
            if updated <= 10 or updated % 20 == 0:
                print(f"  Updated: {page.name} ({ship_count} ships)")

    print(f"\n✅ Complete!")
    print(f"   Updated: {updated} pages")
    print(f"   No ships found: {no_ships} pages")
    print(f"   Skipped: {skipped} pages")

if __name__ == '__main__':
    main()
