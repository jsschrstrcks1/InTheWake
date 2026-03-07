#!/usr/bin/env python3
"""
fix-section-order.py — Move out-of-order sections to correct positions.

Expected section order (from validator):
  hero, logbook, featured_images, cruise_port, getting_around, map, beaches, excursions,
  history, cultural, shopping, food, notices, depth_soundings, practical, gallery, credits, faq, back_nav

This script handles two known out-of-order patterns:
1. map section (id="port-map-section"|"port-map"|"map") → should be after getting-around
2. featured_images section → should be after logbook

Usage: python3 admin/fix-section-order.py [--dry-run] ports/file.html ...
       python3 admin/fix-section-order.py [--dry-run] --all
"""

import re
import sys
import os
import glob


def find_section_bounds(content, section_id):
    """Find the start and end of a <details> or <section> element with given id.
    Returns (start, end) of the full element block, or (None, None) if not found.
    """
    id_idx = content.find(f'id="{section_id}"')
    if id_idx == -1:
        return None, None

    # Try <details> first, then <section>
    details_start = content.rfind('<details', 0, id_idx)
    section_start = content.rfind('<section', 0, id_idx)

    # Pick the one closer to the id attribute
    if details_start == -1 and section_start == -1:
        return None, None

    if details_start == -1:
        tag_type = 'section'
        tag_start = section_start
    elif section_start == -1:
        tag_type = 'details'
        tag_start = details_start
    else:
        # Pick the closer one
        if details_start > section_start:
            tag_type = 'details'
            tag_start = details_start
        else:
            tag_type = 'section'
            tag_start = section_start

    open_tag = f'<{tag_type}'
    close_tag = f'</{tag_type}>'

    pos = tag_start + len(open_tag)
    depth = 1
    while depth > 0 and pos < len(content):
        next_open = content.find(open_tag, pos)
        next_close = content.find(close_tag, pos)
        if next_close == -1:
            return None, None
        if next_open != -1 and next_open < next_close:
            depth += 1
            pos = next_open + len(open_tag)
        else:
            depth -= 1
            pos = next_close + len(close_tag)

    return tag_start, pos


def move_section_after(content, section_id, after_section_id, dry_run=False):
    """Move section with `section_id` to immediately after section with `after_section_id`.
    Returns (new_content, message) or (None, error_message).
    """
    # Find section to move
    sec_start, sec_end = find_section_bounds(content, section_id)
    if sec_start is None:
        return None, f"could not find section '{section_id}'"

    # Find anchor section (the one we insert after)
    anchor_start, anchor_end = find_section_bounds(content, after_section_id)
    if anchor_start is None:
        return None, f"could not find anchor section '{after_section_id}'"

    # Check that section is AFTER the anchor (if it's before, it might already be correct
    # or this is a different structural issue)
    if sec_start < anchor_end:
        return None, f"section '{section_id}' appears before/inside '{after_section_id}' — manual review needed"

    # Extract the section, including leading whitespace line
    line_start = content.rfind('\n', 0, sec_start)
    if line_start == -1:
        line_start = 0

    between = content[line_start + 1:sec_start]
    if between.strip() == '':
        extract_start = line_start
    else:
        extract_start = sec_start

    # Skip trailing whitespace/blank lines
    extract_end = sec_end
    while extract_end < len(content) and content[extract_end] in ' \t\r\n':
        extract_end += 1

    # Get the section text (stripped)
    section_text = content[sec_start:sec_end].strip()

    # Determine indentation from original
    orig_line_start = content.rfind('\n', 0, sec_start)
    orig_indent = ''
    if orig_line_start != -1:
        line = content[orig_line_start + 1:sec_start]
        orig_indent = line[:len(line) - len(line.lstrip())]
    if not orig_indent:
        orig_indent = '        '

    # Remove section from content
    content_no_sec = content[:extract_start] + content[extract_end:]

    # Re-find anchor in modified content
    anchor_start2, anchor_end2 = find_section_bounds(content_no_sec, after_section_id)
    if anchor_start2 is None:
        return None, f"could not re-find anchor section '{after_section_id}' after removal"

    # Insert section after anchor
    insertion = '\n' + orig_indent + section_text + '\n'
    new_content = content_no_sec[:anchor_end2] + insertion + content_no_sec[anchor_end2:]

    return new_content, f"moved '{section_id}' to after '{after_section_id}'"


def fix_port_file(filepath, dry_run=False):
    """Fix all known section ordering issues in a port file.
    Returns list of (success, message) tuples.
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        original_content = content = f.read()

    results = []

    # Fix 1: Move map section to after getting-around
    map_id = None
    for candidate_id in ('port-map-section', 'port-map', 'map'):
        if f'id="{candidate_id}"' in content:
            map_id = candidate_id
            break

    if map_id and 'id="getting-around"' in content:
        new_content, msg = move_section_after(content, map_id, 'getting-around')
        if new_content is not None:
            content = new_content
            results.append((True, msg))
        else:
            results.append((False, f"map: {msg}"))

    # Fix 2: Move featured_images to after logbook
    if 'id="featured_images"' in content and 'id="logbook"' in content:
        new_content, msg = move_section_after(content, 'featured_images', 'logbook')
        if new_content is not None:
            content = new_content
            results.append((True, msg))
        else:
            results.append((False, f"featured_images: {msg}"))

    # Fix 3: Move food-section to after excursions (if food-section is after faq)
    if 'id="food-section"' in content and 'id="excursions"' in content:
        food_idx = content.find('id="food-section"')
        faq_idx = content.find('id="faq"')
        if food_idx != -1 and faq_idx != -1 and food_idx > faq_idx:
            new_content, msg = move_section_after(content, 'food-section', 'excursions')
            if new_content is not None:
                content = new_content
                results.append((True, msg))

    # Fix 4: Move cultural-features to after excursions (if cultural is after faq)
    if 'id="cultural-features"' in content and 'id="excursions"' in content:
        cultural_idx = content.find('id="cultural-features"')
        faq_idx = content.find('id="faq"')
        if cultural_idx != -1 and faq_idx != -1 and cultural_idx > faq_idx:
            new_content, msg = move_section_after(content, 'cultural-features', 'excursions')
            if new_content is not None:
                content = new_content
                results.append((True, msg))

    # Fix 5: Move logbook to after hero (if logbook is after faq/cruise-port)
    if 'id="logbook"' in content and 'id="faq"' in content:
        logbook_idx = content.find('id="logbook"')
        faq_idx = content.find('id="faq"')
        if logbook_idx > faq_idx:
            # logbook is after faq — move to after hero
            hero_id = None
            for candidate in ('hero', 'port-hero'):
                if f'id="{candidate}"' in content:
                    hero_id = candidate
                    break
            if hero_id:
                new_content, msg = move_section_after(content, 'logbook', hero_id)
                if new_content is not None:
                    content = new_content
                    results.append((True, msg))

    # Fix 6: Move cruise-port to after logbook (if cruise-port is after faq)
    if 'id="cruise-port"' in content and 'id="logbook"' in content and 'id="faq"' in content:
        cruise_idx = content.find('id="cruise-port"')
        faq_idx = content.find('id="faq"')
        if cruise_idx > faq_idx:
            new_content, msg = move_section_after(content, 'cruise-port', 'logbook')
            if new_content is not None:
                content = new_content
                results.append((True, msg))

    # Fix 7: Move getting-around to after cruise-port (if getting-around is after faq/gallery)
    if 'id="getting-around"' in content and 'id="cruise-port"' in content and 'id="faq"' in content:
        ga_idx = content.find('id="getting-around"')
        cruise_idx = content.find('id="cruise-port"')
        faq_idx = content.find('id="faq"')
        if ga_idx > faq_idx or (cruise_idx != -1 and ga_idx < cruise_idx):
            pass  # Only move if genuinely after faq
        if ga_idx > faq_idx:
            new_content, msg = move_section_after(content, 'getting-around', 'cruise-port')
            if new_content is not None:
                content = new_content
                results.append((True, msg))

    if content != original_content and not dry_run:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

    return results


def main():
    args = sys.argv[1:]
    dry_run = '--dry-run' in args
    args = [a for a in args if a != '--dry-run']

    if '--all' in args:
        files = sorted(glob.glob('ports/*.html'))
    else:
        files = args

    if not files:
        print("Usage: python3 admin/fix-section-order.py [--dry-run] ports/file.html ...")
        print("       python3 admin/fix-section-order.py [--dry-run] --all")
        sys.exit(1)

    changed = 0
    skipped = 0
    errors_count = 0

    for filepath in files:
        if not os.path.exists(filepath):
            print(f"  MISSING: {filepath}")
            errors_count += 1
            continue

        results = fix_port_file(filepath, dry_run=dry_run)
        fixed = [r for r in results if r[0]]
        failed = [r for r in results if not r[0]]

        if fixed:
            changed += 1
            msgs = '; '.join(m for _, m in fixed)
            prefix = "(dry run) " if dry_run else ""
            print(f"  FIXED: {filepath} — {prefix}{msgs}")
        if failed:
            for _, msg in failed:
                if "no map section" not in msg and "no getting-around" not in msg and 'id="featured_images"' not in msg:
                    pass  # Only show non-trivial skips
        if not fixed and not failed:
            skipped += 1
        elif not fixed:
            skipped += 1

    print(f"\nDone: {changed} changed, {skipped} skipped, {errors_count} errors")


if __name__ == '__main__':
    main()
