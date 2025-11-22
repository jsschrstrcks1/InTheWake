#!/usr/bin/env python3
"""
Update logo dimensions site-wide to use correct aspect ratios
"""

import os
import re
from pathlib import Path

def update_html_file(filepath):
    """Update logo dimensions in a single HTML file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original = content

        # Update navbar logo dimensions (256x64 -> 256x259)
        # Pattern: <img src="/assets/logo_wake_256.png" ... width="256" height="64" ...
        content = re.sub(
            r'(<img[^>]*src="/assets/logo_wake_256\.png"[^>]*width="256"\s+height=")64(")',
            r'\g<1>259\g<2>',
            content
        )

        # Also handle style="height: auto;" if present
        content = re.sub(
            r'(<img[^>]*src="/assets/logo_wake_256\.png"[^>]*width="256"\s+height=")64("[^>]*style="height:\s*auto;?")',
            r'\g<1>259\g<2>',
            content
        )

        # Update hero logo dimensions (560x144 -> 560x567)
        # Pattern: <img class="logo" src="/assets/logo_wake_560.png" ... width="560" height="144" ...
        content = re.sub(
            r'(<img[^>]*class="logo"[^>]*src="/assets/logo_wake_560\.png"[^>]*width="560"\s+height=")144(")',
            r'\g<1>567\g<2>',
            content
        )

        # Also handle case where width/height might be in different order
        content = re.sub(
            r'(<img[^>]*src="/assets/logo_wake_560\.png"[^>]*width="560"\s+height=")144(")',
            r'\g<1>567\g<2>',
            content
        )

        # Handle hero logos that might not have dimensions yet (add them)
        # Pattern: <img class="logo" src="/assets/logo_wake_560.png" srcset="..." alt="..." (no width/height)
        def add_hero_dimensions(match):
            tag = match.group(0)
            if 'width=' not in tag and 'height=' not in tag:
                # Add dimensions before the closing >
                tag = tag.rstrip('>').rstrip('/').rstrip()
                tag += ' width="560" height="567"'
                if match.group(0).endswith('/>'):
                    tag += '/>'
                else:
                    tag += '>'
            return tag

        content = re.sub(
            r'<img[^>]*class="logo"[^>]*src="/assets/logo_wake_560\.png"[^>]*/?>',
            add_hero_dimensions,
            content
        )

        # Handle navbar logos that might not have dimensions
        def add_navbar_dimensions(match):
            tag = match.group(0)
            if 'width=' not in tag and 'height=' not in tag:
                tag = tag.rstrip('>').rstrip('/').rstrip()
                tag += ' width="256" height="259"'
                if match.group(0).endswith('/>'):
                    tag += '/>'
                else:
                    tag += '>'
            return tag

        content = re.sub(
            r'<img[^>]*src="/assets/logo_wake_256\.png"[^>]*/?>',
            add_navbar_dimensions,
            content
        )

        # Only write if changed
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False

    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def update_all_html_files():
    """Update all HTML files in the repository"""
    print("\n" + "="*60)
    print("UPDATING LOGO DIMENSIONS SITE-WIDE")
    print("="*60)

    html_files = list(Path('.').rglob('*.html'))

    # Exclude node_modules and .git directories
    html_files = [f for f in html_files if 'node_modules' not in str(f) and '.git' not in str(f)]

    print(f"Found {len(html_files)} HTML files")

    updated = 0
    for filepath in html_files:
        if update_html_file(filepath):
            updated += 1
            if updated <= 10:  # Show first 10
                print(f"✓ {filepath}")

    if updated > 10:
        print(f"  ... and {updated - 10} more files")

    print(f"\n✓ Updated {updated} files with corrected logo dimensions")
    print(f"  Navbar: 256x259 (was 256x64)")
    print(f"  Hero: 560x567 (was 560x144)")

    return updated

if __name__ == '__main__':
    os.chdir('/home/user/InTheWake')
    count = update_all_html_files()
    exit(0 if count >= 0 else 1)
