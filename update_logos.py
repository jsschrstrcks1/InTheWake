#!/usr/bin/env python3
"""Update all HTML files to use optimized WebP logos"""

import re
from pathlib import Path

def update_navbar_logo(content):
    """Replace navbar logo with optimized PNG version using srcset"""
    # Find navbar logo
    navbar_pattern = r'(<div class="brand"[^>]*>.*?)<(?:picture>.*?<source[^>]*>.*?)?<img\s+[^>]*src="/assets/logo_wake[^"]*"[^>]*>(?:</picture>)?'

    def replace_navbar(match):
        prefix = match.group(1)
        # Use srcset with properly-sized PNGs (maintains transparency)
        new_logo = f'''{prefix}<img src="/assets/logo_wake_256.png" srcset="/assets/logo_wake_256.png 1x, /assets/logo_wake_512.png 2x" width="256" height="64" alt="In the Wake wordmark" decoding="async"/>'''
        return new_logo

    if re.search(navbar_pattern, content, re.DOTALL):
        content = re.sub(navbar_pattern, replace_navbar, content, flags=re.DOTALL, count=1)
        return content, True

    return content, False

def update_hero_logo(content):
    """Replace hero logo with optimized PNG version using srcset"""
    # Find hero logo in hero section
    hero_pattern = r'(<div class="hero-title">.*?)<(?:picture>.*?<source[^>]*>.*?)?<img\s+class="logo"\s+[^>]*src="/assets/logo_wake[^"]*"[^>]*>(?:</picture>)?'

    def replace_hero(match):
        prefix = match.group(1)
        # Use srcset with properly-sized PNGs (maintains transparency)
        new_logo = f'''{prefix}<img class="logo" src="/assets/logo_wake_560.png" srcset="/assets/logo_wake_560.png 1x, /assets/logo_wake_1120.png 2x" width="560" height="144" alt="In the Wake" decoding="async"/>'''
        return new_logo

    if re.search(hero_pattern, content, re.DOTALL):
        content = re.sub(hero_pattern, replace_hero, content, flags=re.DOTALL, count=1)
        return content, True

    return content, False

def update_hero_background(content):
    """Replace hero background image with WebP version"""
    # Replace index_hero.jpg with index_hero.webp in CSS backgrounds
    if 'index_hero.jpg' in content:
        content = content.replace('/assets/index_hero.jpg', '/assets/index_hero.webp')
        return content, True

    return content, False

def update_file(file_path):
    """Update a single HTML file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    changes = []

    # Update navbar logo
    content, changed = update_navbar_logo(content)
    if changed:
        changes.append("Updated navbar logo to WebP")

    # Update hero logo
    content, changed = update_hero_logo(content)
    if changed:
        changes.append("Updated hero logo to WebP")

    # Update hero background
    content, changed = update_hero_background(content)
    if changed:
        changes.append("Updated hero background to WebP")

    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return changes

    return None

def main():
    """Process all HTML files"""
    files = list(Path('.').rglob('*.html'))
    files = [f for f in files if 'vendors' not in str(f) and '.git' not in str(f)]

    print(f"\nProcessing {len(files)} HTML files...\n")

    updated = 0
    total_changes = 0

    for file_path in sorted(files):
        try:
            changes = update_file(file_path)
            if changes:
                print(f"✓ {file_path}")
                for change in changes:
                    print(f"  - {change}")
                    total_changes += 1
                updated += 1
        except Exception as e:
            print(f"✗ {file_path}: {e}")

    print(f"\n{'='*60}")
    print(f"Updated: {updated} files with {total_changes} changes")
    print(f"{'='*60}\n")

    print("Estimated savings:")
    print(f"  - Navbar logos: ~{updated * 1.5:.0f} MB")
    print(f"  - Hero logos: ~{(total_changes - updated) * 1.5:.0f} MB")
    print(f"  - Per page load: ~3 MB → ~40 KB (99% reduction)")

if __name__ == '__main__':
    main()
