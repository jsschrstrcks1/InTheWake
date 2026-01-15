#!/usr/bin/env python3
"""
Add Ship Statistics section to pages that have ship-stats-fallback data
but are missing the visible stats-grid display.
"""

import os
import re
import json
import glob

def extract_stats_fallback(content):
    """Extract ship stats from the fallback JSON in the page."""
    match = re.search(r'<script type="application/json" id="ship-stats-fallback">([^<]+)</script>', content)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            return None
    return None

def generate_stats_section(stats):
    """Generate a Ship Statistics section HTML from stats data."""
    name = stats.get('name', 'Ship')
    slug = stats.get('slug', '')
    gt = stats.get('gt', 'N/A')
    guests = stats.get('guests', stats.get('capacity', 'N/A'))
    crew = stats.get('crew', 'N/A')
    entered = stats.get('entered_service', stats.get('year_built', 'N/A'))
    ship_class = stats.get('class', 'N/A')
    length = stats.get('length', '')
    beam = stats.get('beam', '')

    # Clean up GT format
    if gt and not gt.endswith('GT'):
        gt = f"{gt} GT"

    # Build stat items
    stat_items = []

    if gt and gt != 'N/A GT':
        stat_items.append(f'<div class="stat-item"><div class="label">Gross Tonnage</div><div class="value">{gt}</div></div>')

    if guests and guests != 'N/A':
        stat_items.append(f'<div class="stat-item"><div class="label">Guests</div><div class="value">{guests}</div></div>')

    if crew and crew != 'N/A':
        stat_items.append(f'<div class="stat-item"><div class="label">Crew</div><div class="value">{crew}</div></div>')

    if entered and entered != 'N/A':
        stat_items.append(f'<div class="stat-item"><div class="label">Entered Service</div><div class="value">{entered}</div></div>')

    if ship_class and ship_class != 'N/A':
        stat_items.append(f'<div class="stat-item"><div class="label">Class</div><div class="value">{ship_class}</div></div>')

    if length:
        stat_items.append(f'<div class="stat-item"><div class="label">Length</div><div class="value">{length}</div></div>')

    if beam:
        stat_items.append(f'<div class="stat-item"><div class="label">Beam</div><div class="value">{beam}</div></div>')

    stats_html = '\n        '.join(stat_items)

    return f'''
    <!-- Ship Statistics -->
    <section class="card" aria-labelledby="ship-stats-title">
      <h2 id="ship-stats-title">Ship Statistics</h2>
      <div id="ship-stats" class="stats-grid" data-slug="{slug}">
        {stats_html}
      </div>
    </section>
'''

def find_insertion_point(content):
    """Find the best place to insert the stats section."""
    # Try to insert before Deck Plans section
    patterns = [
        r'(<!-- Deck Plans -->)',
        r'(<section[^>]*aria-labelledby="deck-plans")',
        r'(<section[^>]*aria-labelledby="deckPlansHeading")',
        r'(<section[^>]*aria-labelledby="deck-title")',
        r'(<!-- Live Tracker -->)',
        r'(<section[^>]*aria-labelledby="liveTrackHeading")',
        r'(<section[^>]*aria-labelledby="tracker-title")',
    ]

    for pattern in patterns:
        match = re.search(pattern, content)
        if match:
            return match.start()

    return None

def process_file(filepath):
    """Process a single HTML file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip if already has stats-grid
    if 'class="stats-grid"' in content:
        return False, "Already has stats-grid"

    # Extract stats data
    stats = extract_stats_fallback(content)
    if not stats:
        return False, "No ship-stats-fallback data"

    # Generate stats section
    stats_section = generate_stats_section(stats)

    # Find insertion point
    insert_pos = find_insertion_point(content)
    if insert_pos is None:
        return False, "Could not find insertion point"

    # Insert the section
    new_content = content[:insert_pos] + stats_section + '\n' + content[insert_pos:]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    return True, f"Added stats section for {stats.get('name', 'unknown')}"

def main():
    """Process all ship pages."""
    ship_dirs = glob.glob('/home/user/InTheWake/ships/*/')

    total = 0
    updated = 0
    skipped = 0

    for ship_dir in sorted(ship_dirs):
        if 'assets' in ship_dir:
            continue

        for filepath in glob.glob(os.path.join(ship_dir, '*.html')):
            if 'index.html' in filepath:
                continue

            total += 1
            success, msg = process_file(filepath)

            if success:
                updated += 1
                print(f"✓ {os.path.basename(filepath)}: {msg}")
            else:
                skipped += 1
                # Only print errors for files we expected to update
                if "Already has" not in msg:
                    print(f"  {os.path.basename(filepath)}: {msg}")

    print(f"\nProcessed {total} files: {updated} updated, {skipped} skipped")

if __name__ == '__main__':
    main()
