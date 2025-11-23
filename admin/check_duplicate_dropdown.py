#!/usr/bin/env python3
"""
Check for duplicate dropdown JavaScript across the site
"""

import os
from pathlib import Path

def check_duplicates(root_dir):
    root = Path(root_dir)
    duplicates = []

    # Find all HTML files
    html_files = []
    for filepath in root.rglob('*.html'):
        # Skip vendors and solo/articles
        if '/vendors/' in str(filepath) or '/solo/articles/' in str(filepath):
            continue
        html_files.append(filepath)

    print(f"Checking {len(html_files)} HTML files for duplicate dropdown JavaScript...\n")

    for filepath in html_files:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # Count occurrences of the dropdown JavaScript comment
            count = content.count('Dropdown Menu with 300ms Hover Delay')

            if count > 1:
                duplicates.append((filepath, count))
                print(f"❌ {count} copies: {filepath.relative_to(root)}")
        except Exception as e:
            pass

    print("\n" + "="*60)
    print(f"SUMMARY: Found {len(duplicates)} files with duplicate dropdown JavaScript")
    print("="*60)

    if duplicates:
        print("\nFiles with duplicates:")
        for filepath, count in sorted(duplicates):
            print(f"  {count}x: {filepath.relative_to(root)}")

    return duplicates

if __name__ == '__main__':
    root = Path('/home/user/InTheWake')
    check_duplicates(root)
