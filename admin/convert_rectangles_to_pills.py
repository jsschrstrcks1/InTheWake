#!/usr/bin/env python3
"""Convert rectangular navigation buttons to pill style site-wide"""

import os
import re
from pathlib import Path

def convert_nav_buttons_to_pills(file_path):
    """Update navigation button border-radius from 10px to 20px (pill style)"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Pattern 1: .nav-item > a, .nav-item > button with border-radius: 10px
        pattern1 = r'(\.nav-item\s*>\s*[ab][^{]*\{[^}]*border-radius:\s*)10px'
        content = re.sub(pattern1, r'\g<1>20px', content, flags=re.DOTALL)

        # Pattern 2: Direct border-radius in nav-item button/anchor blocks
        # Look for nav-item context followed by border-radius: 10px
        pattern2 = r'(\.nav-item[^}]*?border-radius:\s*)10px'
        content = re.sub(pattern2, r'\g<1>20px', content, flags=re.DOTALL)

        # Pattern 3: More general - within nav styles
        # Find sections with .nav or nav-item that have border-radius: 10px
        lines = content.split('\n')
        updated_lines = []
        in_nav_block = False
        brace_depth = 0

        for line in lines:
            # Track if we're in a nav-related CSS block
            if re.search(r'\.nav-item|\.nav\b|nav-disclosure', line):
                in_nav_block = True
                brace_depth = 0

            if in_nav_block:
                brace_depth += line.count('{') - line.count('}')

                # If we're in a nav block and see border-radius: 10px, change it
                if 'border-radius:' in line and '10px' in line:
                    line = line.replace('border-radius: 10px', 'border-radius: 20px')
                    line = line.replace('border-radius:10px', 'border-radius:20px')

                # Exit nav block when braces are balanced
                if brace_depth <= 0:
                    in_nav_block = False

            updated_lines.append(line)

        content = '\n'.join(updated_lines)

        # Only write if changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    base_dir = Path('/home/user/InTheWake')
    updated_files = []

    # Find all HTML files (excluding vendors and solo/articles)
    for html_file in base_dir.rglob('*.html'):
        # Skip excluded directories
        if '/vendors/' in str(html_file) or '/solo/articles/' in str(html_file):
            continue

        if convert_nav_buttons_to_pills(html_file):
            updated_files.append(str(html_file.relative_to(base_dir)))
            print(f"✓ Updated: {html_file.relative_to(base_dir)}")

    print(f"\n{'='*60}")
    print(f"Total files updated: {len(updated_files)}")
    print(f"{'='*60}")

    if updated_files:
        print("\nUpdated files:")
        for f in sorted(updated_files)[:20]:  # Show first 20
            print(f"  - {f}")
        if len(updated_files) > 20:
            print(f"  ... and {len(updated_files) - 20} more")

if __name__ == '__main__':
    main()
