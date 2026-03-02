#!/usr/bin/env python3
"""Check and fix page-intro sections missing grid-column spanning"""

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
    files_to_check = [
        'index.html',
        'planning.html',
        'restaurants.html',
        'ports.html',
        'about-us.html',
        'accessibility.html',
        'disability-at-sea.html',
        'drink-calculator.html',
        'packing-lists.html',
        'privacy.html',
        'solo/accessible-cruising.html',
        'solo/freedom-of-your-own-wake.html',
        'solo/visiting-the-united-states-before-your-cruise.html',
        'solo/why-i-started-solo-cruising.html'
    ]

    base_dir = Path('/home/user/InTheWake')
    updated_files = []

    for file_name in files_to_check:
        file_path = base_dir / file_name
        if file_path.exists():
            if check_and_fix_page_intro(file_path):
                updated_files.append(file_name)
                print(f"✓ Fixed: {file_name}")
            else:
                print(f"  OK: {file_name}")

    print(f"\n{'='*60}")
    print(f"Total files checked: {len(files_to_check)}")
    print(f"Total files updated: {len(updated_files)}")
    print(f"{'='*60}")

    if updated_files:
        print("\nUpdated files:")
        for f in updated_files:
            print(f"  - {f}")

if __name__ == '__main__':
    main()
