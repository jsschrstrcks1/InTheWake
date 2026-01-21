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

    dining_hero_img = f'''<img id="dining-hero" class="card-hero"
             src="/assets/img/Cordelia_Empress_Food_Court.webp"
             alt="{ship_name} dining venue" loading="lazy"/>
'''

    modified = False
    new_content = content

    # Try pattern 1
    if re.search(pattern1, content):
        new_content = re.sub(
            pattern1,
            lambda m: f'{m.group(1)}{dining_hero_img}{m.group(2)}{m.group(3)}',
            content
        )
        modified = True
    # Try pattern 2
    elif re.search(pattern2, content):
        new_content = re.sub(
            pattern2,
            lambda m: f'{m.group(1)}{dining_hero_img}{m.group(2)}{m.group(3)}',
            content
        )
        modified = True
    # Try pattern 3
    elif re.search(pattern3, content):
        new_content = re.sub(
            pattern3,
            lambda m: f'{m.group(1)}{dining_hero_img}{m.group(2)}{m.group(3)}',
            content
        )
        modified = True
    else:
        # Check if there's any dining section we can add to
        if 'Dining on ' in content or 'Dining Venues' in content:
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
