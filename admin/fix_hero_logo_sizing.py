#!/usr/bin/env python3
"""Fix hero logo sizing - remove inline width/height that override responsive CSS"""

import re
from pathlib import Path

def fix_hero_logo_sizing(content):
    """Remove inline width/height from hero logos to restore responsive sizing"""
    original = content
    changes = []

    # Pattern: <img class="logo" ... width="560" height="144" ...>
    # Remove width and height attributes from hero logos
    pattern = r'(<img\s+class="logo"[^>]*?)\s+width="\d+"\s+height="\d+"([^>]*?>)'

    if re.search(pattern, content):
        content = re.sub(pattern, r'\1\2', content)
        changes.append("Removed inline width/height from hero logo (restored responsive CSS)")

    if content != original:
        return content, changes

    return None, []

def fix_file(file_path):
    """Fix a single file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content, changes = fix_hero_logo_sizing(content)

    if new_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return changes

    return None

def main():
    """Process all HTML files"""
    files = list(Path('.').rglob('*.html'))
    files = [f for f in files if 'vendors' not in str(f) and '.git' not in str(f)]

    print(f"\nFixing hero logo sizing in {len(files)} HTML files...\n")

    fixed = 0
    for file_path in sorted(files):
        try:
            changes = fix_file(file_path)
            if changes:
                print(f"✓ {file_path}")
                for change in changes:
                    print(f"  - {change}")
                fixed += 1
        except Exception as e:
            print(f"✗ {file_path}: {e}")

    print(f"\n{'='*60}")
    print(f"Fixed: {fixed} files")
    print(f"{'='*60}\n")

    print("Hero logos now use responsive CSS sizing:")
    print("  - Desktop: 189-378px (responsive)")
    print("  - Mobile: 100-280px (responsive)")
    print("  - Removed inline width='560' that broke responsive design")

if __name__ == '__main__':
    main()
