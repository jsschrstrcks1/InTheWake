#!/usr/bin/env python3
"""Check and fix ALL page-intro sections missing grid-column spanning"""

import re
from pathlib import Path

def check_and_fix_page_intro(file_path):
    """Check if page-intro has grid-column span, add if missing"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Pattern: Find page-intro sections that don't have grid-column: 1 / -1
    # Look for class="page-intro" with style attribute that doesn't contain grid-column
    pattern = r'(<section\s+class="page-intro"[^>]*style="[^"]*?)(")'

    def add_grid_column(match):
        style_content = match.group(1)
        closing_quote = match.group(2)

        # Check if grid-column already exists
        if 'grid-column' in style_content:
            return match.group(0)  # Already has it, don't change

        # Add grid-column at the beginning of the style
        # Replace style=" with style="grid-column: 1 / -1;
        if 'style="' in style_content:
            new_style = style_content.replace('style="', 'style="grid-column: 1 / -1; ')
        else:
            new_style = style_content

        return new_style + closing_quote

    updated_content = re.sub(pattern, add_grid_column, content)

    # Also check for page-intro without inline styles
    pattern2 = r'(<section\s+class="page-intro"(?!\s+style))'
    def add_style_attribute(match):
        return match.group(1) + ' style="grid-column: 1 / -1"'

    updated_content = re.sub(pattern2, add_style_attribute, updated_content)

    if updated_content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        return True
    return False

def main():
    base_dir = Path('/home/user/InTheWake')

    # Find all HTML files except vendors and solo/articles
    all_html_files = []
    for html_file in base_dir.rglob('*.html'):
        # Skip vendors and solo/articles
        if '/vendors/' in str(html_file) or '/solo/articles/' in str(html_file):
            continue
        all_html_files.append(html_file)

    print(f"Found {len(all_html_files)} HTML files to check")
    print(f"{'='*60}\n")

    updated_files = []
    checked_count = 0

    for file_path in sorted(all_html_files):
        checked_count += 1
        relative_path = file_path.relative_to(base_dir)

        if check_and_fix_page_intro(file_path):
            updated_files.append(str(relative_path))
            print(f"✓ Fixed: {relative_path}")

    print(f"\n{'='*60}")
    print(f"Total files checked: {checked_count}")
    print(f"Total files updated: {len(updated_files)}")
    print(f"{'='*60}")

    if updated_files:
        print(f"\nUpdated {len(updated_files)} files")
        if len(updated_files) <= 20:
            for f in updated_files:
                print(f"  - {f}")
        else:
            print("First 20:")
            for f in updated_files[:20]:
                print(f"  - {f}")
            print(f"  ... and {len(updated_files) - 20} more")

if __name__ == '__main__':
    main()
