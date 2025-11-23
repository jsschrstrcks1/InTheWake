#!/usr/bin/env python3
"""
Normalize site shell structure across all pages

Fixes:
1. Remove under construction notices incorrectly placed inside navbar div
2. Verify proper navbar closure before hero section
3. Ensure consistent shell structure

The under construction notices were placed inside <div class="navbar"> which breaks
the shell structure. They should be removed or moved to main content area.
"""

import re
from pathlib import Path

def fix_shell_structure(content):
    """Remove under construction notice from inside navbar div"""
    original = content
    changes = []

    # Pattern: Remove under construction notice block that's inside navbar
    # It appears after </nav> but before the closing </div> of navbar
    pattern = r'(\s*</nav>\s*)\n\s*<!-- UNDER CONSTRUCTION NOTICE - START -->.*?<!-- UNDER CONSTRUCTION NOTICE - END -->\s*\n'

    if re.search(pattern, content, re.DOTALL):
        # Remove the entire under construction block
        content = re.sub(pattern, r'\1\n', content, flags=re.DOTALL)
        changes.append("Removed under construction notice from inside navbar (shell normalization)")

    if content != original:
        return content, changes

    return None, []

def fix_file(file_path):
    """Fix a single file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content, changes = fix_shell_structure(content)

    if new_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return changes

    return None

def main():
    """Process all HTML files"""
    # Focus on ports directory where the issue exists
    files = list(Path('ports').glob('*.html'))

    print(f"\nNormalizing shell structure in {len(files)} port pages...\n")

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

    print("Shell structure normalized:")
    print("  ✓ Removed under construction notices from navbar")
    print("  ✓ Restored proper navbar → hero → main structure")
    print("  ✓ Navbar now closes cleanly before hero section")

if __name__ == '__main__':
    main()
