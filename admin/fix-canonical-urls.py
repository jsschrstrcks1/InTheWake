#!/usr/bin/env python3
"""
Add canonical URLs to port pages that are missing them.
"""

import os
import re

PORTS_DIR = "ports"
BASE_URL = "https://cruisinginthewake.com"

def fix_canonical(filepath):
    """Add canonical URL to a page if missing."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if already has canonical
    if 'rel="canonical"' in content:
        return False

    # Get the filename for the canonical URL
    filename = os.path.basename(filepath)
    canonical_url = f'{BASE_URL}/ports/{filename}'
    canonical_tag = f'  <link rel="canonical" href="{canonical_url}"/>'

    # Find the </head> tag and insert before it
    if '</head>' in content:
        # Insert before </head>
        content = content.replace('</head>', f'{canonical_tag}\n</head>')

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True

    return False

def main():
    # Find all port pages without canonical
    pages_fixed = 0

    for filename in sorted(os.listdir(PORTS_DIR)):
        if not filename.endswith('.html'):
            continue

        filepath = os.path.join(PORTS_DIR, filename)

        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        if 'rel="canonical"' not in content:
            if fix_canonical(filepath):
                print(f"✓ Added canonical to {filename}")
                pages_fixed += 1
            else:
                print(f"✗ Could not fix {filename}")

    print(f"\nFixed {pages_fixed} pages")

if __name__ == "__main__":
    main()
