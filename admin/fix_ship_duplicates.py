#!/usr/bin/env python3
"""
Fix Duplicate Hero Sections in Ship Pages

Removes the pattern where there are two identical hero sections
with two </header> closing tags.

Pattern to remove:
</div></header>

    <!-- Hero section -->
    <div class="hero"...>...</div>
</header>
"""

import re
from pathlib import Path

def fix_duplicate_heroes(filepath):
    """Remove duplicate hero sections from a ship page."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Pattern: First </header>, then duplicate hero section, then second </header>
    # We want to keep everything before the first </header> and remove everything between first and second </header>

    # Find pattern: </div></header>\n\n    <!-- Hero section -->\n    <div class="hero"...>...</div>\n</header>
    pattern = r'(</div></header>)\s*<!-- Hero section -->\s*<div class="hero"[^>]*>.*?</div>\s*</header>'

    # Replace with just the first </header>
    content = re.sub(pattern, r'\1', content, flags=re.DOTALL)

    if content != original:
        return content, True
    return original, False

def main():
    """Fix all ship pages with duplicate heroes."""
    base_dir = Path('/home/user/InTheWake')

    # List of files to fix
    ship_dirs = [
        'ships/carnival',
        'ships/celebrity-cruises',
        'ships/holland-america-line'
    ]

    stats = {'fixed': 0, 'skipped': 0, 'errors': 0}

    print("=" * 70)
    print("FIXING DUPLICATE HERO SECTIONS IN SHIP PAGES")
    print("=" * 70)
    print()

    for ship_dir in ship_dirs:
        dir_path = base_dir / ship_dir
        if not dir_path.exists():
            continue

        print(f"\nProcessing {ship_dir}...")

        for filepath in sorted(dir_path.glob('*.html')):
            try:
                new_content, modified = fix_duplicate_heroes(filepath)

                if modified:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    stats['fixed'] += 1
                    print(f"  ✓ Fixed: {filepath.name}")
                else:
                    stats['skipped'] += 1
            except Exception as e:
                stats['errors'] += 1
                print(f"  ✗ Error: {filepath.name}: {e}")

    # Print summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Files fixed: {stats['fixed']}")
    print(f"Files skipped: {stats['skipped']}")
    print(f"Errors: {stats['errors']}")

if __name__ == '__main__':
    main()
