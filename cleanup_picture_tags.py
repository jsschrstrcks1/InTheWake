#!/usr/bin/env python3
"""Clean up stray </picture> tags left from logo updates"""

import re
from pathlib import Path

def clean_stray_tags(file_path):
    """Remove standalone </picture> tags"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Remove stray </picture> tags that aren't part of a picture element
    # Look for </picture> that doesn't have a corresponding <picture> on the same or previous line
    lines = content.split('\n')
    cleaned_lines = []

    for i, line in enumerate(lines):
        # If line contains only whitespace and </picture>, skip it
        if re.match(r'^\s*</picture>\s*$', line):
            # Check if there's a corresponding <picture> in recent lines
            has_opening = False
            for j in range(max(0, i-5), i):
                if '<picture' in lines[j]:
                    has_opening = True
                    break

            if not has_opening:
                # Skip this stray closing tag
                continue

        cleaned_lines.append(line)

    content = '\n'.join(cleaned_lines)

    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True

    return False

def main():
    """Process all HTML files"""
    files = list(Path('.').rglob('*.html'))
    files = [f for f in files if 'vendors' not in str(f) and '.git' not in str(f)]

    print(f"\nCleaning {len(files)} HTML files...\n")

    cleaned = 0
    for file_path in sorted(files):
        try:
            if clean_stray_tags(file_path):
                print(f"✓ {file_path}")
                cleaned += 1
        except Exception as e:
            print(f"✗ {file_path}: {e}")

    print(f"\n{'='*60}")
    print(f"Cleaned: {cleaned} files")
    print(f"{'='*60}\n")

if __name__ == '__main__':
    main()
