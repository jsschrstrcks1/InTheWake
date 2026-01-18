#!/usr/bin/env python3
"""
Add missing description meta and canonical link to ship pages.
Uses og:description or title as the source for description.
"""

import os
import re
import glob

def extract_og_description(content):
    """Extract og:description from page."""
    match = re.search(r'<meta property="og:description" content="([^"]*)"', content)
    if match:
        return match.group(1)
    return None

def extract_title(content):
    """Extract title from page."""
    match = re.search(r'<title>([^<]+)</title>', content)
    if match:
        return match.group(1)
    return None

def extract_canonical_url(content, filepath):
    """Extract or generate canonical URL."""
    # Check og:url first
    match = re.search(r'<meta property="og:url" content="([^"]*)"', content)
    if match and match.group(1):
        return match.group(1)

    # Generate from filepath
    # /home/user/InTheWake/ships/cruise-line/ship-name.html -> /ships/cruise-line/ship-name.html
    rel_path = filepath.replace('/home/user/InTheWake', '')
    return f"https://cruisinginthewake.com{rel_path}"

def has_description(content):
    return 'name="description"' in content

def has_canonical(content):
    return 'rel="canonical"' in content

def add_missing_tags(filepath):
    """Add missing description and canonical to a file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    changes = []

    # Check if we need to add description
    if not has_description(content):
        desc = extract_og_description(content)
        if not desc:
            desc = extract_title(content)
        if desc:
            # Add after <title> tag
            title_match = re.search(r'(</title>)', content)
            if title_match:
                desc_tag = f'\n<meta name="description" content="{desc}"/>'
                content = content[:title_match.end()] + desc_tag + content[title_match.end():]
                changes.append("description")

    # Check if we need to add canonical
    if not has_canonical(content):
        canonical_url = extract_canonical_url(content, filepath)
        if canonical_url:
            # Add after description or title
            if 'name="description"' in content:
                desc_match = re.search(r'(<meta name="description"[^>]*/>)', content)
                if desc_match:
                    canonical_tag = f'\n<link rel="canonical" href="{canonical_url}"/>'
                    content = content[:desc_match.end()] + canonical_tag + content[desc_match.end():]
                    changes.append("canonical")
            else:
                title_match = re.search(r'(</title>)', content)
                if title_match:
                    canonical_tag = f'\n<link rel="canonical" href="{canonical_url}"/>'
                    content = content[:title_match.end()] + canonical_tag + content[title_match.end():]
                    changes.append("canonical")

    if changes:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True, changes

    return False, []

def main():
    """Process all ship pages."""
    ship_dirs = glob.glob('/home/user/InTheWake/ships/*/')

    total = 0
    updated = 0

    for ship_dir in sorted(ship_dirs):
        if 'assets' in ship_dir:
            continue

        for filepath in glob.glob(os.path.join(ship_dir, '*.html')):
            if 'index.html' in filepath:
                continue

            total += 1
            success, changes = add_missing_tags(filepath)

            if success:
                updated += 1
                print(f"✓ {os.path.basename(filepath)}: added {', '.join(changes)}")

    print(f"\nProcessed {total} files: {updated} updated")

if __name__ == '__main__':
    main()
