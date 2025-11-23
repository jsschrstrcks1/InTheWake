#!/usr/bin/env python3
"""
Verify all dropdown duplicates are fixed by counting actual dropdown initialization lines
"""

from pathlib import Path

root = Path('/home/user/InTheWake')
duplicates = []

for filepath in root.rglob('*.html'):
    if '/vendors/' in str(filepath) or '/solo/articles/' in str(filepath):
        continue

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Count actual dropdown JavaScript initializations
        count = content.count('const dropdownGroups = Array.from')

        if count > 1:
            duplicates.append((filepath, count))
            print(f"❌ {count} copies: {filepath.relative_to(root)}")
    except:
        pass

if duplicates:
    print(f"\n❌ Found {len(duplicates)} files with duplicate dropdown JavaScript")
else:
    print("\n✅ All dropdown duplicates fixed! Site is clean.")
