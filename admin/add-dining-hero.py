#!/usr/bin/env python3
"""
Add dining-hero image to ships that have dining sections but no hero image.
Uses the shared Cordelia_Empress_Food_Court.webp image.
"""

import re
import sys
from pathlib import Path

def get_ship_name(content, filepath):
    """Extract ship name from the file."""
    # Try ai-breadcrumbs name field
    match = re.search(r'name:\s*([^\n]+)', content)
    if match:
        return match.group(1).strip()
    # Fallback to title
    match = re.search(r'<title>([^—<]+)', content)
    if match:
        return match.group(1).strip()
    # Fallback to filename
    return Path(filepath).stem.replace('-', ' ').title()

def add_dining_hero(filepath):
    """Add dining-hero image to a ship page."""
    path = Path(filepath)
    if not path.exists():
        print(f"  SKIP: {filepath} not found")
        return False

    content = path.read_text()

    # Check if already has dining-hero
    if 'id="dining-hero"' in content:
        print(f"  SKIP: {filepath} already has dining-hero")
        return False

    ship_name = get_ship_name(content, filepath)

    # Pattern 1: <h2 id="diningHeading">Dining on [Ship]</h2>
    pattern1 = r'(<h2\s+id="diningHeading">)(Dining[^<]*)(</h2>)'

    # Pattern 2: <h2 id="dining">Dining on [Ship]</h2>
    pattern2 = r'(<h2\s+id="dining">)(Dining[^<]*)(</h2>)'

    # Pattern 3: <section ... aria-labelledby="diningHeading"> followed by <h2>
    pattern3 = r'(aria-labelledby="diningHeading">\s*<h2[^>]*>)(Dining[^<]*)(</h2>)'

    # Pattern 4: <h2 id="dining-card">Dining on [Ship]</h2>
    pattern4 = r'(<h2\s+id="dining-card">)(Dining[^<]*)(</h2>)'

    # Pattern 5: <h2>Features & Dining</h2>
    pattern5 = r'(<h2>)(Features & Dining)(</h2>)'

    # Pattern 6: <h2>Dining Venues</h2> within Features section
    pattern6 = r'(<h3>)(Dining Venues)(</h3>)'

    # Pattern 7: <h2 id="dining-heading">Dining Venues</h2>
    pattern7 = r'(<h2\s+id="dining-heading">)(Dining[^<]*)(</h2>)'

    # Pattern 8: <header><h2 id="dining-title">Dining Venues</h2></header>
    pattern8 = r'(<header><h2\s+id="dining-title">)(Dining[^<]*)(</h2></header>)'

    dining_hero_img = f'''<img id="dining-hero" class="card-hero"
             src="/assets/img/Cordelia_Empress_Food_Court.webp"
             alt="{ship_name} dining venue" loading="lazy"/>
'''

    modified = False
    new_content = content

    # Try patterns in order
    patterns = [
        (pattern1, 'pattern1'),
        (pattern2, 'pattern2'),
        (pattern3, 'pattern3'),
        (pattern4, 'pattern4'),
        (pattern5, 'pattern5'),
        (pattern6, 'pattern6'),
        (pattern7, 'pattern7'),
        (pattern8, 'pattern8'),
    ]

    for pattern, name in patterns:
        if re.search(pattern, content):
            new_content = re.sub(
                pattern,
                lambda m: f'{m.group(1)}{dining_hero_img}{m.group(2)}{m.group(3)}',
                content
            )
            modified = True
            break

    if not modified:
        # Check if there's any dining section we can add to
        if 'Dining on ' in content or 'Dining Venues' in content or 'Features & Dining' in content:
            print(f"  MANUAL: {filepath} has dining text but pattern not matched")
            return False
        else:
            print(f"  SKIP: {filepath} no dining section found")
            return False

    if modified and new_content != content:
        path.write_text(new_content)
        print(f"  FIXED: {filepath}")
        return True

    return False

def main():
    ships_file = '/tmp/ships_to_fix.txt'
    if not Path(ships_file).exists():
        print("Error: /tmp/ships_to_fix.txt not found")
        sys.exit(1)

    ships = Path(ships_file).read_text().strip().split('\n')
    print(f"Processing {len(ships)} ships...")

    fixed = 0
    skipped = 0
    manual = 0

    for ship in ships:
        ship = ship.strip()
        if not ship:
            continue
        result = add_dining_hero(ship)
        if result:
            fixed += 1
        elif "MANUAL" in str(result):
            manual += 1
        else:
            skipped += 1

    print(f"\nSummary:")
    print(f"  Fixed: {fixed}")
    print(f"  Skipped: {skipped}")
    print(f"  Manual review needed: {manual}")

if __name__ == '__main__':
    main()
