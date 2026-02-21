#!/usr/bin/env python3
"""
Fix port page layout issues:
1. Move "From the Pier" section to right after the hero (before logbook)
2. Ensure FAQ is the last section (move gallery/credits before FAQ)

Usage:
  python3 admin/fix-port-layout.py --dry-run          # Show what would change
  python3 admin/fix-port-layout.py                     # Apply changes
  python3 admin/fix-port-layout.py --file ports/abu-dhabi.html  # Single file
"""

import os
import re
import sys
import argparse


def find_nav_block(content, start_marker):
    """Find a <nav> block starting with start_marker and return (start, end) positions."""
    pos = content.find(start_marker)
    if pos < 0:
        return None
    # Walk backward to find the <nav opening tag
    tag_start = content.rfind('<nav', 0, pos)
    if tag_start < 0:
        return None
    # Find the closing </nav> — nav tags are not typically nested
    end = content.find('</nav>', pos)
    if end < 0:
        return None
    end += len('</nav>')
    return (tag_start, end)


def find_section_block(content, id_value, start_after=0):
    """Find a section/details block with the given id and return (start, end) positions.
    Handles nested tags by counting open/close tags."""
    # Try different patterns for the opening tag
    patterns = [
        f'id="{id_value}"',
        f"id='{id_value}'",
    ]

    pos = -1
    for pattern in patterns:
        pos = content.find(pattern, start_after)
        if pos >= 0:
            break

    if pos < 0:
        return None

    # Walk backward to find the opening < of this tag
    tag_start = content.rfind('<', 0, pos)
    if tag_start < 0:
        return None

    # Determine the tag name (section, details, div, etc.)
    tag_match = re.match(r'<(\w+)', content[tag_start:])
    if not tag_match:
        return None
    tag_name = tag_match.group(1)

    # Now count nested open/close tags to find the matching close
    depth = 0
    i = tag_start
    while i < len(content):
        # Find next opening or closing tag of this type
        open_pos = content.find(f'<{tag_name}', i + 1)
        close_pos = content.find(f'</{tag_name}>', i + 1)

        if close_pos < 0:
            return None  # No closing tag found

        if open_pos >= 0 and open_pos < close_pos:
            # Found another opening tag before the close
            depth += 1
            i = open_pos
        else:
            if depth == 0:
                # This is our matching close tag
                end = close_pos + len(f'</{tag_name}>')
                return (tag_start, end)
            else:
                depth -= 1
                i = close_pos

    return None


def process_file(filepath, dry_run=False):
    """Process a single port page file. Returns (changed, description)."""
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()

    content = original
    changes = []

    # ========================================
    # 1. Move "From the Pier" before logbook
    # ========================================
    pier_block = find_nav_block(content, 'class="from-the-pier"')
    if not pier_block:
        # Try alternate: some pages use id="from-the-pier" with different class
        pier_block = find_nav_block(content, 'id="from-the-pier"')

    if pier_block:
        pier_start, pier_end = pier_block
        pier_html = content[pier_start:pier_end]

        # Find logbook position
        logbook_pos = content.find('id="logbook"')
        if logbook_pos < 0:
            # Try alternate logbook patterns
            for pattern in ['class="logbook-entry"', 'class="logbook-entry ', 'id="logbook-section"']:
                logbook_pos = content.find(pattern)
                if logbook_pos >= 0:
                    break

        # Find insert target: before logbook, or before weather-guide, or before first section
        insert_before = -1
        if logbook_pos > 0:
            logbook_tag_start = content.rfind('<', 0, logbook_pos)
            weather_pos = content.find('id="weather-guide"')
            if weather_pos > 0 and weather_pos < logbook_pos:
                weather_tag_start = content.rfind('<', 0, weather_pos)
                insert_before = weather_tag_start
            else:
                insert_before = logbook_tag_start
        else:
            # No logbook — find first section after hero in the article
            import re as _re
            # Look for <section class="port-hero" specifically (not meta tag port-hero.jpg)
            hero_section = _re.search(r'<section[^>]*class="[^"]*port-hero', content)
            hero_end = -1
            if hero_section:
                hero_end = content.find('</section>', hero_section.start())
                if hero_end > 0:
                    hero_end += len('</section>')

            if hero_end < 0:
                # Try logbook-btn-container or last-reviewed
                btn_pos = content.find('id="logbook-btn-container"')
                if btn_pos > 0:
                    hero_end = content.find('</div>', btn_pos)
                    if hero_end > 0:
                        hero_end += len('</div>')
            if hero_end < 0:
                last_rev = content.find('<p class="last-reviewed"')
                if last_rev > 0:
                    hero_end = content.find('</p>', last_rev)
                    if hero_end > 0:
                        hero_end += len('</p>')
            if hero_end < 0:
                # Last resort: find weather-guide or first details after article start
                weather_pos = content.find('id="weather-guide"')
                if weather_pos > 0:
                    weather_tag = content.rfind('<', 0, weather_pos)
                    insert_before = weather_tag
                else:
                    article_start = content.find('<article')
                    if article_start > 0:
                        first_section = _re.search(r'<(details|section)\s', content[article_start+50:])
                        if first_section:
                            insert_before = article_start + 50 + first_section.start()

            if hero_end > 0 and insert_before < 0:
                # Find next section/details start after hero_end
                next_section = _re.search(r'<(details|section)\s', content[hero_end:])
                if next_section:
                    insert_before = hero_end + next_section.start()

        if insert_before > 0 and pier_start > insert_before:

            # Extract pier block with surrounding whitespace and HTML comment
            ws_start = pier_start
            while ws_start > 0 and content[ws_start - 1] in ' \t\n':
                ws_start -= 1
            # Also capture preceding <!-- FROM THE PIER --> comment if present
            comment_check = content[:ws_start].rstrip()
            if comment_check.endswith('-->'):
                comment_start = comment_check.rfind('<!--')
                if comment_start >= 0 and 'pier' in comment_check[comment_start:].lower():
                    ws_start = comment_start
                    # Also trim whitespace before the comment
                    while ws_start > 0 and content[ws_start - 1] in ' \t\n':
                        ws_start -= 1
                    # Include the comment in pier_html
                    pier_html = content[ws_start:pier_end].strip()
            # Look for trailing whitespace
            ws_end = pier_end
            while ws_end < len(content) and content[ws_end] in ' \t\n':
                ws_end += 1

            # Remove from current position
            content = content[:ws_start] + '\n' + content[ws_end:]

            # Recalculate insert position (it may have shifted)
            if insert_before > ws_start:
                insert_before -= (ws_end - ws_start)

            # Insert before the target section with proper spacing
            content = content[:insert_before] + pier_html + '\n\n      ' + content[insert_before:]
            changes.append('Moved From the Pier before logbook')

    # ========================================
    # 1b. Remove duplicate "From the Pier" sections
    # ========================================
    # Check if there are multiple from-the-pier sections
    first_pier = content.find('class="from-the-pier"')
    if first_pier >= 0:
        second_pier_start = content.find('class="from-the-pier"', first_pier + 30)
        if second_pier_start >= 0:
            # Found a duplicate — remove it
            dup_block = find_nav_block(content, 'class="from-the-pier"')
            # Find the SECOND occurrence
            after_first = content.find('</nav>', first_pier)
            if after_first > 0:
                dup_nav_start = content.find('<nav', after_first)
                if dup_nav_start > 0 and 'from-the-pier' in content[dup_nav_start:dup_nav_start+200]:
                    dup_nav_end = content.find('</nav>', dup_nav_start)
                    if dup_nav_end > 0:
                        dup_nav_end += len('</nav>')
                        # Trim surrounding whitespace/comments
                        ws_s = dup_nav_start
                        while ws_s > 0 and content[ws_s - 1] in ' \t\n':
                            ws_s -= 1
                        comment_check = content[:ws_s].rstrip()
                        if comment_check.endswith('-->'):
                            cs = comment_check.rfind('<!--')
                            if cs >= 0 and 'pier' in comment_check[cs:].lower():
                                ws_s = cs
                                while ws_s > 0 and content[ws_s - 1] in ' \t\n':
                                    ws_s -= 1
                        ws_e = dup_nav_end
                        while ws_e < len(content) and content[ws_e] in ' \t\n':
                            ws_e += 1
                        content = content[:ws_s] + '\n' + content[ws_e:]
                        changes.append('Removed duplicate From the Pier')

    # ========================================
    # 2. Move gallery and credits before FAQ
    # ========================================
    faq_pos = content.find('id="faq"')
    if faq_pos > 0:
        faq_tag_start = content.rfind('<', 0, faq_pos)

        # Check for gallery after FAQ
        gallery_block = find_section_block(content, 'gallery', faq_pos)
        if gallery_block:
            gal_start, gal_end = gallery_block

            # Extract with surrounding whitespace
            ws_start = gal_start
            while ws_start > 0 and content[ws_start - 1] in ' \t\n':
                ws_start -= 1
            ws_end = gal_end
            while ws_end < len(content) and content[ws_end] in ' \t\n':
                ws_end += 1

            gallery_html = content[gal_start:gal_end]

            # Remove from current position
            content = content[:ws_start] + content[ws_end:]

            # Recalculate FAQ position
            faq_pos2 = content.find('id="faq"')
            faq_tag_start2 = content.rfind('<', 0, faq_pos2)

            # Insert before FAQ
            content = content[:faq_tag_start2] + gallery_html + '\n\n      ' + content[faq_tag_start2:]
            changes.append('Moved gallery before FAQ')

        # Check for credits after FAQ
        faq_pos3 = content.find('id="faq"')
        if faq_pos3 > 0:
            credits_block = find_section_block(content, 'credits', faq_pos3)
            if credits_block:
                cred_start, cred_end = credits_block
                ws_start = cred_start
                while ws_start > 0 and content[ws_start - 1] in ' \t\n':
                    ws_start -= 1
                ws_end = cred_end
                while ws_end < len(content) and content[ws_end] in ' \t\n':
                    ws_end += 1

                credits_html = content[cred_start:cred_end]
                content = content[:ws_start] + content[ws_end:]

                # Re-find FAQ position
                faq_pos4 = content.find('id="faq"')
                faq_tag_start4 = content.rfind('<', 0, faq_pos4)
                content = content[:faq_tag_start4] + credits_html + '\n\n      ' + content[faq_tag_start4:]
                changes.append('Moved credits before FAQ')

    if not changes:
        return False, 'No changes needed'

    if content == original:
        return False, 'No effective changes'

    if not dry_run:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

    return True, '; '.join(changes)


def main():
    parser = argparse.ArgumentParser(description='Fix port page layout')
    parser.add_argument('--dry-run', action='store_true', help='Show changes without applying')
    parser.add_argument('--file', type=str, help='Process single file')
    args = parser.parse_args()

    if args.file:
        files = [args.file]
    else:
        port_dir = 'ports'
        files = [os.path.join(port_dir, f) for f in sorted(os.listdir(port_dir)) if f.endswith('.html')]

    changed_count = 0
    for filepath in files:
        if not os.path.exists(filepath):
            print(f'  SKIP: {filepath} not found')
            continue
        try:
            changed, desc = process_file(filepath, dry_run=args.dry_run)
            if changed:
                changed_count += 1
                prefix = '[DRY RUN] ' if args.dry_run else ''
                print(f'  {prefix}{os.path.basename(filepath)}: {desc}')
        except Exception as e:
            print(f'  ERROR: {os.path.basename(filepath)}: {e}')

    mode = 'DRY RUN' if args.dry_run else 'APPLIED'
    print(f'\n{mode}: {changed_count} files {"would be " if args.dry_run else ""}changed out of {len(files)}')


if __name__ == '__main__':
    main()
