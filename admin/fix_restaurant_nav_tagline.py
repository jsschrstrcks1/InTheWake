#!/usr/bin/env python3
"""
Fix Restaurant Pages Navigation and Tagline
Soli Deo Gloria

Updates all /restaurants/ pages to:
1. Move tagline inside hero-title (under logo)
2. Add nav dropdown styles for proper horizontal layout
"""

import os
import re
from pathlib import Path

def fix_tagline(content):
    """Move tagline inside hero-title div"""
    # Pattern: hero-title closing div followed by tagline div
    old_pattern = r'(</div>\s*)\s*<div class="tagline"[^>]*>A Cruise Traveler\'s Logbook</div>'

    # Find hero-title with logo and fix structure
    pattern = r'(<div class="hero-title">.*?<img[^>]+alt="In the Wake"[^>]*/>)\s*</div>\s*<div class="tagline"[^>]*>A Cruise Traveler\'s Logbook</div>'

    replacement = r'\1\n      <div class="tagline">A Cruise Traveler\'s Logbook</div>\n    </div>'

    return re.sub(pattern, replacement, content, flags=re.DOTALL)

def add_nav_styles(content):
    """Add nav styling to ensure horizontal layout"""
    # Check if nav styles already exist
    if '.nav-item' in content:
        return content

    # Nav styles to add
    nav_styles = '''
    /* Navigation horizontal layout */
    .navbar {
      display: flex;
      align-items: flex-end;
      gap: .6rem;
      flex-wrap: nowrap;
    }
    .nav {
      display: flex;
      align-items: center;
      gap: .5rem;
      flex-wrap: nowrap;
    }
    .nav-item {
      display: inline-block;
    }
    .nav-item > a {
      display: inline-flex;
      align-items: center;
      padding: .5rem .75rem;
      border-radius: 8px;
      background: #fff;
      border: 2px solid var(--rope, #8B7355);
      color: var(--accent, #0e6e8e);
      font-size: .9rem;
      text-decoration: none;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .nav-item > a:hover {
      background: var(--foam, #eaf6f6);
      border-color: var(--accent, #0e6e8e);
    }
    .nav-item > a[aria-current="page"] {
      background: var(--accent, #0e6e8e);
      color: #fff;
      font-weight: 600;
    }
  '''

    # Find closing style tag and add before it
    if '</style>' in content:
        content = content.replace('</style>', nav_styles + '\n  </style>', 1)

    return content

def process_file(filepath):
    """Process a single restaurant page"""
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    # Fix tagline position
    content = fix_tagline(content)

    # Add nav styles
    content = add_nav_styles(content)

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        return True
    return False

def main():
    """Main function"""
    restaurants_dir = Path('restaurants')
    pages = list(restaurants_dir.glob('*.html'))

    print(f"Processing {len(pages)} restaurant pages...")

    updated = 0
    for page in sorted(pages):
        if process_file(page):
            updated += 1
            if updated <= 5 or updated % 20 == 0:
                print(f"  Updated: {page.name}")

    print(f"\n✅ Complete! Updated {updated} pages")

if __name__ == '__main__':
    main()
