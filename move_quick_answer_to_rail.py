#!/usr/bin/env python3
"""Move Quick Answer to top of right rail visually while keeping it first in HTML"""

import re
from pathlib import Path

def update_page_grid_html(file_path):
    """Update page-grid elements to position Quick Answer in right rail"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    changes_made = []

    # 1. Update page-intro: grid-column: 1 / -1 → grid-column: 2; grid-row: 1;
    intro_pattern = r'(<section\s+class="page-intro"\s+style=")([^"]*?)(")'

    def update_intro(match):
        tag_start = match.group(1)
        style_content = match.group(2)
        tag_end = match.group(3)

        # Replace grid-column: 1 / -1 with grid-column: 2; grid-row: 1;
        new_style = re.sub(
            r'grid-column:\s*1\s*/\s*-1\s*;',
            'grid-column: 2; grid-row: 1;',
            style_content
        )

        # Remove max-width constraint since it's now in the rail
        new_style = re.sub(r'\s*max-width:\s*1100px;', '', new_style)

        # Clean up spacing
        new_style = re.sub(r'\s+', ' ', new_style).strip()

        if new_style != style_content:
            changes_made.append("Updated page-intro positioning")

        return tag_start + new_style + tag_end

    content = re.sub(intro_pattern, update_intro, content)

    # 2. Find first element after page-intro and add grid positioning
    # Match: page-intro closing tag, followed by optional comments/whitespace, then next tag
    first_elem_pattern = r'(</section>\s*(?:<!--[^>]*?-->\s*)?<)(div|section|article)(\s+)'

    def update_first_element(match):
        before = match.group(1)
        tag_name = match.group(2)
        after = match.group(3)

        # Add style attribute (will handle existing style below)
        changes_made.append(f"Updated first {tag_name} element positioning")
        return before + tag_name + ' style="grid-column: 1; grid-row: 1 / span 999;"' + after

    # Only apply if the element doesn't already have a style attribute
    if re.search(first_elem_pattern + r'(?!style=)', content):
        content = re.sub(first_elem_pattern + r'(?!style=)', update_first_element, content, count=1)

    # 3. Update aside element
    aside_pattern = r'(<aside\s+class="rail"[^>]*?)(>)'

    def update_aside(match):
        aside_tag = match.group(1)
        closing = match.group(2)

        # Check if already has our grid positioning
        if 'grid-column: 2; grid-row: 2;' in aside_tag:
            return match.group(0)

        # Check if already has style attribute
        if 'style=' in aside_tag:
            # Add to existing style (make sure not to duplicate)
            if 'grid-column' not in aside_tag:
                aside_tag = re.sub(
                    r'style="([^"]*)"',
                    r'style="\1 grid-column: 2; grid-row: 2;"',
                    aside_tag
                )
                changes_made.append("Updated aside positioning")
        else:
            # Add new style attribute
            aside_tag += ' style="grid-column: 2; grid-row: 2;"'
            changes_made.append("Updated aside positioning")

        return aside_tag + closing

    content = re.sub(aside_pattern, update_aside, content)

    # Return updated content if changed
    if content != original_content and changes_made:
        return content, changes_made
    else:
        return None, []

def process_files():
    """Process all HTML files with page-grid class"""
    html_files = []

    # Find all HTML files
    for html_file in Path('.').rglob('*.html'):
        # Skip vendors and solo/articles
        if 'vendors' in str(html_file) or 'solo/articles' in str(html_file):
            continue

        # Check if file contains page-grid class
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                if 'class="wrap page-grid"' in f.read():
                    html_files.append(html_file)
        except:
            continue

    print(f"\nFound {len(html_files)} files with page-grid class\n")

    updated_count = 0
    for file_path in html_files:
        updated_content, changes = update_page_grid_html(file_path)
        if updated_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(updated_content)
            print(f"✓ Updated: {file_path}")
            for change in changes:
                print(f"  - {change}")
            updated_count += 1
        else:
            print(f"- Skipped (no changes): {file_path}")

    print(f"\n{'='*60}")
    print(f"Total files updated: {updated_count}/{len(html_files)}")
    print(f"{'='*60}")

if __name__ == '__main__':
    process_files()
