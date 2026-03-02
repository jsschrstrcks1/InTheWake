#!/usr/bin/env python3
"""Fix malformed author avatar filenames created by running update script multiple times"""

import re
from pathlib import Path

def fix_avatar_filenames(content):
    """Fix malformed author avatar filenames"""
    original = content
    changes = []

    # Pattern 1: Fix ken1_96_96_96.webp → ken1_96.webp
    pattern1 = r'/authors/img/(\w+)_96(_96)+\.webp'
    if re.search(pattern1, content):
        content = re.sub(pattern1, r'/authors/img/\1_96.webp', content)
        changes.append("Fixed malformed _96_96... filenames")

    # Pattern 2: Fix ken1_96_192.webp → ken1_192.webp
    pattern2 = r'/authors/img/(\w+)_96_192\.webp'
    if re.search(pattern2, content):
        content = re.sub(pattern2, r'/authors/img/\1_192.webp', content)
        changes.append("Fixed malformed _96_192 filenames")

    # Pattern 3: Fix ken1_192_192.webp → ken1_192.webp
    pattern3 = r'/authors/img/(\w+)_192(_192)+\.webp'
    if re.search(pattern3, content):
        content = re.sub(pattern3, r'/authors/img/\1_192.webp', content)
        changes.append("Fixed malformed _192_192... filenames")

    if content != original:
        return content, changes

    return None, []

def fix_file(file_path):
    """Fix a single file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content, changes = fix_avatar_filenames(content)

    if new_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return changes

    return None

def main():
    """Process all HTML files"""
    files = list(Path('.').rglob('*.html'))
    files = [f for f in files if 'vendors' not in str(f) and '.git' not in str(f)]

    print(f"\nProcessing {len(files)} HTML files...\n")

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

    print("Author avatar filenames corrected:")
    print("  - ken1_96_96.webp → ken1_96.webp")
    print("  - ken1_96_192.webp → ken1_192.webp")
    print("  - ken1_96_96_96.webp → ken1_96.webp")
    print("  - All variants now use correct naming: {name}_96.webp and {name}_192.webp")

if __name__ == '__main__':
    main()
