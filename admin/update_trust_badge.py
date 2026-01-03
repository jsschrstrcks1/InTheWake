#!/usr/bin/env python3
"""
Update trust badge text across all HTML files.
Changes "No tracking" to "Minimal analytics" for accuracy.

Soli Deo Gloria
"""

import os
import re
from pathlib import Path

# Configuration
ROOT_DIR = Path(__file__).parent.parent
OLD_TEXT = '✓ No ads. No tracking. No affiliate links.'
NEW_TEXT = '✓ No ads. Minimal analytics. No affiliate links.'

def update_file(filepath: Path) -> bool:
    """Update trust badge in a single file. Returns True if changed."""
    try:
        content = filepath.read_text(encoding='utf-8')

        if OLD_TEXT not in content:
            return False

        new_content = content.replace(OLD_TEXT, NEW_TEXT)
        filepath.write_text(new_content, encoding='utf-8')
        return True

    except Exception as e:
        print(f"  ERROR: {filepath}: {e}")
        return False

def main():
    """Find and update all HTML files with the trust badge."""
    print("=" * 60)
    print("Trust Badge Update Script")
    print("=" * 60)
    print(f"\nOLD: {OLD_TEXT}")
    print(f"NEW: {NEW_TEXT}")
    print()

    # Find all HTML files
    html_files = list(ROOT_DIR.rglob('*.html'))
    print(f"Found {len(html_files)} HTML files to check...")

    updated = 0
    skipped = 0

    for filepath in sorted(html_files):
        # Skip admin reports
        if '/admin/reports/' in str(filepath):
            continue

        if update_file(filepath):
            rel_path = filepath.relative_to(ROOT_DIR)
            print(f"  ✓ Updated: {rel_path}")
            updated += 1
        else:
            skipped += 1

    print()
    print("=" * 60)
    print(f"COMPLETE: {updated} files updated, {skipped} files unchanged")
    print("=" * 60)

if __name__ == '__main__':
    main()
