#!/usr/bin/env python3
"""
Convert port pages from collapsible <details> pattern to standard <section> pattern.
Matches the canonical index.html author/article card structure.

Usage:
  python3 convert-rail-pattern.py [--dry-run] [file.html ...]
  python3 convert-rail-pattern.py --all [--dry-run]
"""

import re
import sys
import os
from pathlib import Path

# Author card conversion
AUTHOR_DETAILS_PATTERN = re.compile(
    r'<details open class="card"[^>]*>\s*'
    r'<summary[^>]*>About the Author</summary>\s*'
    r'<div class="author-card-vertical"[^>]*>',
    re.DOTALL | re.IGNORECASE
)

AUTHOR_SECTION_REPLACEMENT = '''<section class="card author-card-vertical" aria-labelledby="author-heading">
      <h3 id="author-heading">About the Author</h3>'''

# Close tag for author card
AUTHOR_CLOSE_PATTERN = re.compile(
    r'</div>\s*</details>(\s*)(<!-- Recent|<!-- Nearby|</aside)',
    re.DOTALL
)

def convert_author_card(content):
    """Convert author card from details to section pattern."""
    # Replace opening
    content = AUTHOR_DETAILS_PATTERN.sub(AUTHOR_SECTION_REPLACEMENT, content)

    # Replace closing - more targeted
    # Find the author section and fix its closing
    content = re.sub(
        r'(</a>\s*<h4[^>]*><a[^>]*>Ken Baker</a></h4>\s*'
        r'<p class="tiny"[^>]*>Founder[^<]*</p>\s*'
        r'<p class="tiny"[^>]*>\s*<a[^>]*>Flickers of Majesty</a>\s*</p>\s*)'
        r'</div>\s*</details>',
        r'\1</section>',
        content,
        flags=re.DOTALL
    )

    return content

# Recent Stories conversion
RECENT_DETAILS_PATTERN = re.compile(
    r'<details open class="card"[^>]*>\s*'
    r'<summary[^>]*>Recent Stories</summary>\s*'
    r'<div[^>]*>',
    re.DOTALL | re.IGNORECASE
)

RECENT_SECTION_REPLACEMENT = '''<section class="card" aria-labelledby="recent-rail-title">
        <h3 id="recent-rail-title">Recent Stories</h3>'''

def convert_recent_stories(content):
    """Convert recent stories from details to section pattern."""
    # Replace opening
    content = RECENT_DETAILS_PATTERN.sub(RECENT_SECTION_REPLACEMENT, content)

    # Replace closing for recent stories section
    content = re.sub(
        r'(<div id="recent-rail"[^>]*></div>\s*'
        r'<p id="recent-rail-fallback"[^>]*>[^<]*</p>\s*)'
        r'</div>\s*</details>',
        r'\1</section>',
        content,
        flags=re.DOTALL
    )

    return content

# Nearby Ports conversion (if present)
NEARBY_DETAILS_PATTERN = re.compile(
    r'<details open class="card"[^>]*>\s*'
    r'<summary[^>]*>Nearby Ports</summary>\s*'
    r'<div[^>]*>',
    re.DOTALL | re.IGNORECASE
)

NEARBY_SECTION_REPLACEMENT = '''<section class="card" aria-labelledby="nearby-ports-title">
        <h3 id="nearby-ports-title">Nearby Ports</h3>'''

def convert_nearby_ports(content):
    """Convert nearby ports from details to section pattern."""
    content = NEARBY_DETAILS_PATTERN.sub(NEARBY_SECTION_REPLACEMENT, content)

    # Replace closing
    content = re.sub(
        r'(<div id="nearby-ports"[^>]*></div>\s*)'
        r'</div>\s*</details>',
        r'\1</section>',
        content,
        flags=re.DOTALL
    )

    return content

# At a Glance / Quick Answer conversion
def convert_at_a_glance(content):
    """Convert At a Glance section from details to page-intro pattern."""
    # Pattern for At a Glance with Quick Answer
    content = re.sub(
        r'<details open class="card"[^>]*>\s*'
        r'<summary[^>]*>At a Glance</summary>\s*'
        r'<div[^>]*>\s*'
        r'<p[^>]*><strong>Quick Answer:</strong>',
        '<section class="page-intro mb-1">\n'
        '        <p class="answer-line">\n'
        '          <strong>Quick Answer:</strong>',
        content,
        flags=re.DOTALL | re.IGNORECASE
    )

    # Fix closing for At a Glance section
    content = re.sub(
        r'(Quick Answer:</strong>[^<]*</p>)\s*</div>\s*</details>(\s*\n\s*<!-- Author)',
        r'\1\n      </section>\2',
        content,
        flags=re.DOTALL
    )

    return content

# Remove inline styles from author card elements
def clean_inline_styles(content):
    """Remove unnecessary inline styles."""
    # Remove style from author avatar img (keep class)
    content = re.sub(
        r'(<img class="author-avatar"[^>]*) style="border-radius: 12px;"',
        r'\1',
        content
    )

    # Remove style from h4 in author card
    content = re.sub(
        r'(<h4) style="margin: 0\.5rem 0 0\.25rem;">',
        r'\1>',
        content
    )

    # Remove style from tiny paragraphs in author card
    content = re.sub(
        r'(<p class="tiny") style="margin: 0\.25rem 0;">',
        r'\1>',
        content
    )

    # Update version strings
    content = content.replace('v=3.010.300', 'v=3.010.400')

    return content

def convert_file(filepath, dry_run=False):
    """Convert a single file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()

    content = original
    content = convert_at_a_glance(content)
    content = convert_author_card(content)
    content = convert_recent_stories(content)
    content = convert_nearby_ports(content)
    content = clean_inline_styles(content)

    if content == original:
        return False  # No changes

    if dry_run:
        print(f"Would modify: {filepath}")
    else:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Modified: {filepath}")

    return True

def clean_ship_page(filepath, dry_run=False):
    """Clean up ship page - remove inline styles, update versions."""
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()

    content = original
    content = clean_inline_styles(content)

    if content == original:
        return False

    if dry_run:
        print(f"Would modify: {filepath}")
    else:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Modified: {filepath}")

    return True

def main():
    dry_run = '--dry-run' in sys.argv
    all_ports = '--all' in sys.argv
    all_ships = '--ships' in sys.argv

    args = [a for a in sys.argv[1:] if not a.startswith('--')]

    if all_ships:
        ships_dir = Path(__file__).parent.parent / 'ships'
        files = list(ships_dir.rglob('*.html'))
        process_func = clean_ship_page
    elif all_ports:
        ports_dir = Path(__file__).parent.parent / 'ports'
        files = list(ports_dir.glob('*.html'))
        process_func = convert_file
    elif args:
        files = [Path(a) for a in args]
        process_func = convert_file
    else:
        print(__doc__)
        sys.exit(1)

    modified = 0
    for f in files:
        if f.exists():
            if process_func(f, dry_run):
                modified += 1
        else:
            print(f"File not found: {f}")

    print(f"\n{'Would modify' if dry_run else 'Modified'}: {modified} files")

if __name__ == '__main__':
    main()
