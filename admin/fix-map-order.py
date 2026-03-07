#!/usr/bin/env python3
"""
fix-map-order.py — Move port-map section to correct position (after getting-around).

Expected section order (from validator):
  hero, logbook, featured_images, cruise_port, getting_around, map, beaches, excursions, ...

This script:
1. Finds the <details id="port-map"> section in each port file
2. Checks if it's after the getting-around section (wrong position)
3. Moves it to immediately after the getting-around </details> close

Usage: python3 admin/fix-map-order.py ports/auckland.html [ports/barbados.html ...]
       python3 admin/fix-map-order.py --all
"""

import re
import sys
import os
import glob


def find_section_bounds(content, section_id):
    """Find the start and end of a <details id="SECTION_ID"> element.
    Returns (start, end) of the full <details>...</details> block,
    or (None, None) if not found.
    """
    # Find the id attribute
    id_idx = content.find(f'id="{section_id}"')
    if id_idx == -1:
        return None, None

    # Search backwards for the opening <details tag
    tag_start = content.rfind('<details', 0, id_idx)
    if tag_start == -1:
        return None, None

    # Now count nested <details> to find the matching close
    pos = tag_start + len('<details')
    depth = 1
    while depth > 0 and pos < len(content):
        next_open = content.find('<details', pos)
        next_close = content.find('</details>', pos)
        if next_close == -1:
            return None, None
        if next_open != -1 and next_open < next_close:
            depth += 1
            pos = next_open + len('<details')
        else:
            depth -= 1
            pos = next_close + len('</details>')

    return tag_start, pos


def fix_map_order(filepath, dry_run=False):
    """Move port-map section to after getting-around.
    Returns (changed: bool, message: str)
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if has a map section (three possible IDs)
    map_section_id = None
    for candidate_id in ('port-map-section', 'port-map', 'map'):
        if f'id="{candidate_id}"' in content:
            map_section_id = candidate_id
            break
    if map_section_id is None:
        return False, "no map section (skipped)"

    # Check if has getting-around section
    if 'id="getting-around"' not in content:
        return False, "no getting-around section (skipped)"

    # Find map section bounds
    map_start, map_end = find_section_bounds(content, map_section_id)
    if map_start is None:
        return False, f"could not find map section bounds (id={map_section_id})"

    # Find getting-around section bounds
    ga_start, ga_end = find_section_bounds(content, 'getting-around')
    if ga_start is None:
        return False, "could not find getting-around section bounds"

    # Check if map is ALREADY after getting-around and before next section
    # If map comes between ga_end and the next major section, it's already correct
    # Simple check: if map_start > ga_end, map is after getting-around (possibly wrong position)
    # If map_start < ga_start, map is before getting-around (very wrong)
    # The validator tells us it's out of order, so just do the move if needed.

    if map_start < ga_end:
        # Map is BEFORE or INSIDE getting-around — unusual case
        return False, f"map section appears before/inside getting-around — manual review needed"

    # Extract map section with surrounding whitespace
    # Find start of the line containing map_start
    line_start = content.rfind('\n', 0, map_start)
    if line_start == -1:
        line_start = 0

    # Check if there's only whitespace between line_start and map_start
    between = content[line_start + 1:map_start]
    if between.strip() == '':
        # Include the leading whitespace/newline in the extraction
        extract_start = line_start  # include the \n before
    else:
        extract_start = map_start

    # Find end of trailing whitespace/blank lines after map_end
    extract_end = map_end
    # Skip trailing whitespace and blank lines
    while extract_end < len(content) and content[extract_end] in ' \t\r\n':
        extract_end += 1

    map_block = content[extract_start:extract_end]

    # Remove map block from content
    content_no_map = content[:extract_start] + content[extract_end:]

    # Now find ga_end in the content_no_map (it shifts since we removed map_block)
    # Re-find getting-around bounds in the modified content
    ga_start2, ga_end2 = find_section_bounds(content_no_map, 'getting-around')
    if ga_start2 is None:
        return False, "could not re-find getting-around after map removal"

    # Build the map insertion: \n + 8 spaces indent + map content stripped + \n
    map_section_text = content[map_start:map_end].strip()
    # Determine indentation from original context
    orig_line_start = content.rfind('\n', 0, map_start)
    orig_indent = ''
    if orig_line_start != -1:
        line = content[orig_line_start + 1:map_start]
        orig_indent = line[:len(line) - len(line.lstrip())]
    if not orig_indent:
        orig_indent = '        '  # 8 spaces default

    map_insertion = '\n' + orig_indent + map_section_text + '\n'

    # Insert after ga_end2
    new_content = content_no_map[:ga_end2] + map_insertion + content_no_map[ga_end2:]

    if dry_run:
        return True, f"would move map section (dry run)"

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    return True, "moved map section to after getting-around"


def main():
    args = sys.argv[1:]
    dry_run = '--dry-run' in args
    args = [a for a in args if a != '--dry-run']

    if '--all' in args:
        files = sorted(glob.glob('ports/*.html'))
    else:
        files = args

    if not files:
        print("Usage: python3 admin/fix-map-order.py [--dry-run] ports/file.html ...")
        print("       python3 admin/fix-map-order.py [--dry-run] --all")
        sys.exit(1)

    changed = 0
    skipped = 0
    errors = 0

    for filepath in files:
        if not os.path.exists(filepath):
            print(f"  MISSING: {filepath}")
            errors += 1
            continue
        success, msg = fix_map_order(filepath, dry_run=dry_run)
        if success:
            changed += 1
            print(f"  FIXED: {filepath} — {msg}")
        else:
            skipped += 1
            print(f"  SKIP:  {filepath} — {msg}")

    print(f"\nDone: {changed} changed, {skipped} skipped, {errors} errors")


if __name__ == '__main__':
    main()
