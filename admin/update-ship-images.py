#!/usr/bin/env python3
"""
Update ship pages to reference downloaded Wikimedia Commons images.
Adds exterior images to ship pages and includes proper attribution.
"""

import json
import os
import re
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent

# Mapping of cruise line directory names to ship page paths
CRUISE_LINE_PATHS = {
    'carnival': 'ships/carnival',
    'rcl': 'ships/rcl',
    'celebrity': 'ships/celebrity-cruises',
    'ncl': 'ships/norwegian',
    'princess': 'ships/princess',
    'other': 'ships/holland-america'  # Holland America ships
}


def find_ship_page(ship_slug, cruise_line):
    """Find the HTML page for a ship."""
    ship_dir = CRUISE_LINE_PATHS.get(cruise_line)
    if not ship_dir:
        return None

    ship_page = PROJECT_ROOT / ship_dir / f"{ship_slug}.html"
    if ship_page.exists():
        return ship_page

    # Try alternate naming conventions
    alternates = [
        f"{ship_slug.replace('-', '_')}.html",
        f"{ship_slug.replace('_', '-')}.html",
    ]
    for alt in alternates:
        alt_path = PROJECT_ROOT / ship_dir / alt
        if alt_path.exists():
            return alt_path

    return None


def get_attribution(img_path):
    """Get attribution info from .attr.json file."""
    attr_path = img_path.with_suffix('.attr.json')
    if attr_path.exists():
        try:
            with open(attr_path) as f:
                return json.load(f)
        except:
            pass
    return None


def update_ship_page(ship_page, img_path, attr):
    """Update a ship page to reference the new image."""
    with open(ship_page, 'r', encoding='utf-8') as f:
        html = f.read()

    # Convert image path to web path
    web_img_path = '/' + str(img_path.relative_to(PROJECT_ROOT))

    changes = []

    # Pattern 1: Update existing ship hero image in swiper
    # Try multiple patterns for different HTML formats

    # Pattern A: Minified HTML (on same line)
    patterns = [
        r'(swiper-slide"><img src=")(/assets/ships/[^"]+)(")',
        # Pattern B: Non-minified HTML (img may be on next line or have whitespace)
        r'(swiper-slide">\s*<img[^>]*src=")(/assets/ships/[^"]+)(")',
        # Pattern C: With class attribute first
        r'(class="swiper-slide">\s*<img[^>]*src=")(/assets/ships/[^"]+)(")',
    ]

    match = None
    for pattern in patterns:
        match = re.search(pattern, html, re.DOTALL)
        if match:
            break

    if match:
        old_path = match.group(2)
        # Build replacement string
        replacement = match.group(1) + web_img_path + match.group(3)
        new_html = html[:match.start()] + replacement + html[match.end():]
        changes.append(f"Updated swiper image: {old_path} -> {web_img_path}")
    else:
        new_html = html

    # Pattern 2: Add image attribution if we have attribution data
    if attr and new_html != html:
        # Check if we need to add attribution
        license_text = attr.get('license', 'Unknown')
        artist = attr.get('artist', 'Unknown')
        source_url = attr.get('url', '')

        # Create attribution comment
        attr_comment = f'<!-- Image: {web_img_path} | License: {license_text} | Source: Wikimedia Commons -->'

        # Add attribution comment before closing </head> if not already present
        if attr_comment not in new_html and 'Wikimedia Commons' not in new_html[:2000]:
            new_html = new_html.replace('</head>', f'{attr_comment}\n</head>')
            changes.append(f"Added image attribution: {license_text}")

    if new_html != html:
        with open(ship_page, 'w', encoding='utf-8') as f:
            f.write(new_html)
        return changes

    return []


def main():
    """Main entry point."""
    # Find all downloaded ship images
    ship_images = list(PROJECT_ROOT.glob('assets/ships/*/**/*-exterior.jpg'))

    print(f"Found {len(ship_images)} ship exterior images")

    updated = 0
    skipped = 0
    not_found = []

    for img_path in ship_images:
        # Extract ship slug and cruise line from path
        # e.g., assets/ships/carnival/carnival-glory-exterior.jpg
        cruise_line = img_path.parent.name
        ship_slug = img_path.stem.replace('-exterior', '')

        # Find corresponding ship page
        ship_page = find_ship_page(ship_slug, cruise_line)

        if not ship_page:
            not_found.append(f"{cruise_line}/{ship_slug}")
            continue

        # Get attribution info
        attr = get_attribution(img_path)

        # Update the ship page
        changes = update_ship_page(ship_page, img_path, attr)

        if changes:
            print(f"✓ {ship_slug}: {', '.join(changes)}")
            updated += 1
        else:
            skipped += 1

    print(f"\nSummary:")
    print(f"  Updated: {updated}")
    print(f"  Skipped: {skipped}")
    print(f"  Not found: {len(not_found)}")

    if not_found and len(sys.argv) > 1 and sys.argv[1] == '-v':
        print(f"\nShip pages not found:")
        for ship in not_found[:20]:
            print(f"  - {ship}")
        if len(not_found) > 20:
            print(f"  ... and {len(not_found) - 20} more")


if __name__ == '__main__':
    main()
