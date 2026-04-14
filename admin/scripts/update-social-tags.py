#!/usr/bin/env python3
"""
Update og:image and twitter:image tags in ship HTML pages
to point to the generated social images.

Usage:
  python3 scripts/update-social-tags.py --dry-run   # Preview changes
  python3 scripts/update-social-tags.py             # Apply changes
"""

import os
import re
import argparse
from pathlib import Path

SHIPS_DIR = Path(__file__).parent.parent / "ships"
SOCIAL_BASE_URL = "https://cruisinginthewake.com/assets/social"


def update_html_file(html_path: Path, dry_run: bool = False) -> dict:
    """Update og:image and twitter:image in an HTML file."""
    slug = html_path.stem
    social_url = f"{SOCIAL_BASE_URL}/{slug}.jpg"

    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    changes = []

    # Pattern for og:image
    og_pattern = r'(<meta\s+property="og:image"\s+content=")[^"]*(")'
    og_match = re.search(og_pattern, content)
    if og_match:
        old_val = content[og_match.start():og_match.end()]
        new_val = f'{og_match.group(1)}{social_url}{og_match.group(2)}'
        if old_val != new_val:
            content = re.sub(og_pattern, f'\\1{social_url}\\2', content, count=1)
            changes.append(('og:image', og_match.group(0), new_val))

    # Pattern for twitter:image
    tw_pattern = r'(<meta\s+name="twitter:image"\s+content=")[^"]*(")'
    tw_match = re.search(tw_pattern, content)
    if tw_match:
        old_val = content[tw_match.start():tw_match.end()]
        new_val = f'{tw_match.group(1)}{social_url}{tw_match.group(2)}'
        if old_val != new_val:
            content = re.sub(tw_pattern, f'\\1{social_url}\\2', content, count=1)
            changes.append(('twitter:image', tw_match.group(0), new_val))

    # Also check for alternate patterns (name= vs property=)
    og_pattern_alt = r'(<meta\s+content=")[^"]*("\s+property="og:image")'
    og_match_alt = re.search(og_pattern_alt, content)
    if og_match_alt and 'og:image' not in [c[0] for c in changes]:
        content = re.sub(og_pattern_alt, f'\\1{social_url}\\2', content, count=1)
        changes.append(('og:image (alt)', '', social_url))

    if changes and not dry_run:
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(content)

    return {
        'path': html_path,
        'slug': slug,
        'changes': changes,
        'modified': len(changes) > 0
    }


def main():
    parser = argparse.ArgumentParser(description="Update social image tags in HTML files")
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without modifying files")
    parser.add_argument("--cruise-line", help="Only process specific cruise line (rcl, carnival, celebrity, hal)")

    args = parser.parse_args()

    # Find all ship HTML files
    html_files = []
    for cruise_line_dir in SHIPS_DIR.iterdir():
        if cruise_line_dir.is_dir():
            if args.cruise_line and cruise_line_dir.name != args.cruise_line:
                continue
            for html_file in cruise_line_dir.glob("*.html"):
                if html_file.name != "index.html":
                    html_files.append(html_file)

    modified = 0
    unchanged = 0

    print(f"{'[DRY RUN] ' if args.dry_run else ''}Processing {len(html_files)} HTML files...\n")

    for html_path in sorted(html_files):
        result = update_html_file(html_path, dry_run=args.dry_run)

        if result['modified']:
            modified += 1
            print(f"{'Would modify' if args.dry_run else 'Modified'}: {result['path'].relative_to(SHIPS_DIR.parent)}")
            for change in result['changes']:
                print(f"  {change[0]}: -> {SOCIAL_BASE_URL}/{result['slug']}.jpg")
        else:
            unchanged += 1

    print(f"\n{'Would modify' if args.dry_run else 'Modified'}: {modified}")
    print(f"Unchanged: {unchanged}")

    if args.dry_run and modified > 0:
        print("\nRun without --dry-run to apply changes.")


if __name__ == "__main__":
    main()
