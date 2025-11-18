#!/usr/bin/env python3
"""
Add ICP-Lite headers to ships that are completely missing them.
"""

import re
import json
from pathlib import Path

SHIPS_DIR = Path('/home/user/InTheWake/ships/rcl')

SHIPS_NEEDING_HEADERS = [
    'nordic-prince.html',
    'oasis-class-ship-tbn-2028.html',
    'quantum-of-the-seas.html',
    'sovereign-of-the-seas.html',
    'spectrum-of-the-seas.html',
    'sun-viking.html',
    'symphony-of-the-seas.html',
    'utopia-of-the-seas.html',
    'voyager-of-the-seas.html',
    'wonder-of-the-seas.html'
]

# Ship class information for context
SHIP_CLASSES = {
    'nordic-prince': ('Vision Class', 1971, '23,000 GT', '~1,000'),
    'sovereign': ('Sovereign Class', 1988, '73,192 GT', '~2,278'),
    'sun-viking': ('Classic', 1972, '18,000 GT', '~800'),
    'oasis-class-ship-tbn-2028': ('Oasis Class', 2028, 'TBD', 'TBD'),
    'quantum': ('Quantum Class', 2014, '168,666 GT', '~4,180'),
    'spectrum': ('Quantum Ultra Class', 2019, '168,666 GT', '~4,246'),
    'symphony': ('Oasis Class', 2018, '228,081 GT', '~5,518'),
    'utopia': ('Oasis Class', 2024, '236,473 GT', '~5,668'),
    'voyager': ('Voyager Class', 1999, '137,276 GT', '~3,114'),
    'wonder': ('Oasis Class', 2022, '236,857 GT', '~5,734')
}

def extract_ship_name_from_title(content):
    """Extract ship name from title tag."""
    title_match = re.search(r'<title>([^—]+)', content)
    if title_match:
        return title_match.group(1).strip()
    return "Unknown Ship"

def get_ship_class_info(slug):
    """Get ship class info from lookup table."""
    for key, info in SHIP_CLASSES.items():
        if key in slug:
            return info
    return ('Unknown Class', 'TBD', 'TBD GT', 'TBD')

def create_icp_header(ship_name, slug):
    """Create complete ICP-Lite header section."""
    ship_class, year, tonnage, capacity = get_ship_class_info(slug)
    
    # Create answer text based on ship class
    if 'oasis' in slug.lower():
        answer_text = f"{ship_name} is an Oasis Class megaship ({tonnage}, {capacity} guests) featuring seven distinct neighborhoods, extensive dining and entertainment options, and Royal Caribbean's signature innovation."
        fit_text = f"{ship_name} welcomes cruisers seeking grand-scale experiences with neighborhood layouts, multiple pools, zip lines, and world-class entertainment. Perfect for families and groups who want everything under one hull."
    elif 'quantum' in slug.lower() or 'spectrum' in slug.lower():
        answer_text = f"{ship_name} is a Quantum Class ship ({tonnage}, {capacity} guests) featuring groundbreaking technology including North Star observation capsule, RipCord by iFLY skydiving simulator, and transforming entertainment venues."
        fit_text = f"{ship_name} suits tech-savvy cruisers and families seeking innovation with traditional Royal Caribbean service. Ideal for those who want cutting-edge experiences like robot bartenders and virtual balconies."
    elif 'voyager' in slug.lower():
        answer_text = f"{ship_name} is a Voyager Class ship ({tonnage}, {capacity} guests) featuring the iconic Royal Promenade, ice skating rink, and rock climbing wall that revolutionized cruising."
        fit_text = f"{ship_name} welcomes cruisers seeking the sweet spot between intimacy and amenities. Perfect for families wanting Royal Caribbean classics without Oasis-class scale."
    else:
        answer_text = f"{ship_name} is a Royal Caribbean ship ({tonnage}, {capacity} guests, launched {year}) offering deck plans, live tracking, dining venues, and cruise planning resources."
        fit_text = f"{ship_name} welcomes cruisers exploring Royal Caribbean's fleet. This page provides deck plans, current location tracking, and dining information to help plan your voyage."
    
    return f'''
    <!-- ICP-Lite v1.0: Answer-First Content -->
    <section class="icp-header" aria-labelledby="ship-name">
      <h1 id="ship-name">{ship_name}</h1>
      <p class="answer-line">
      <span class="answer-q">What this page covers</span>
      <span class="answer-a">{answer_text}</span>
    </p>

      <section class="fit-guidance">
      <h2 class="sr-only">Who This Page Is For</h2>
      <h2>Is {ship_name} Right for You?</h2>
        <p>{fit_text}</p>
      </section>

    <section class="key-facts card">
        <h2>Key Facts at a Glance</h2>
        <ul>
          <li><strong>Class:</strong> {ship_class}</li>
          <li><strong>Year Built:</strong> {year}</li>
          <li><strong>Size:</strong> {tonnage}</li>
          <li><strong>Capacity:</strong> {capacity}</li>
        </ul>
    </section>
  </section>

'''

def add_icp_header(filepath):
    """Add ICP-Lite header to a ship page that's missing it."""
    print(f"Adding header to {filepath.name}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if already has icp-header
    if 'icp-header' in content:
        print(f"  ✓ {filepath.name} already has ICP header")
        return False
    
    # Extract ship info
    ship_name = extract_ship_name_from_title(content)
    slug = filepath.stem
    
    # Create header
    new_header = create_icp_header(ship_name, slug)
    
    # Find the main content start and inject header
    main_pattern = r'(<main class="wrap" id="main-content"[^>]*>)\s*\n\s*(<!-- Row 1)'
    
    if re.search(main_pattern, content):
        content = re.sub(
            main_pattern,
            r'\1\n' + new_header + r'\n  \2',
            content
        )
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"  ✓ Added ICP header to {ship_name}")
        return True
    else:
        print(f"  ⚠️  Could not find insertion point")
        return False

def main():
    """Main execution."""
    print("Adding ICP-Lite headers to ships missing them...\n")
    
    added_count = 0
    
    for filename in SHIPS_NEEDING_HEADERS:
        filepath = SHIPS_DIR / filename
        if filepath.exists():
            if add_icp_header(filepath):
                added_count += 1
        else:
            print(f"⚠️  {filename} not found")
    
    print(f"\n✓ Added headers to {added_count} ships")

if __name__ == '__main__':
    main()
