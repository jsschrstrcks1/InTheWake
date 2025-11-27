#!/usr/bin/env python3
"""
Fix ship pages that have incorrect grid-row: 1 / span 999 positioning.

The normalization script incorrectly added grid positioning to inner sections
that should be inside the main content wrapper without explicit positioning.
"""

import os
import re
from pathlib import Path

# ANSI colors
GREEN = '\033[92m'
YELLOW = '\033[93m'
CYAN = '\033[96m'
RED = '\033[91m'
BOLD = '\033[1m'
RESET = '\033[0m'

def fix_ship_page(filepath):
    """Fix a single ship page."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original = content
        changes = []

        # Fix 1: Remove "grid-column: 1; grid-row: 1 / span 999;" from inner sections
        # These sections should be inside the main content div without explicit positioning
        pattern1 = r'<section style="grid-column: 1; grid-row: 1 / span 999;" class="grid-2">'
        replacement1 = '<section class="grid-2">'
        if pattern1 in content:
            content = content.replace(pattern1, replacement1)
            changes.append("Removed grid-row span from grid-2 section")

        # Fix 2: Remove standalone "grid-column: 1; grid-row: 1 / span 999;" style from sections
        pattern2 = r'<section style="grid-column: 1; grid-row: 1 / span 999;" class="cards stack">'
        replacement2 = '<section class="cards stack">'
        if pattern2 in content:
            content = content.replace(pattern2, replacement2)
            changes.append("Removed grid-row span from cards stack section")

        # Fix 3: Fix mismatched </section> that should be </div> after main content intro
        # Look for pattern: intro paragraph followed by </section> then grid-2
        pattern3 = r'(</p>\s*)\n\s*</section>\s*\n(\s*)(<!-- Row 1:|<section class="grid-2">)'
        def fix_closing_tag(m):
            changes.append("Fixed </section> -> closing for main content intro")
            return m.group(1) + '\n' + m.group(2) + m.group(3)
        content = re.sub(pattern3, fix_closing_tag, content)

        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return 'fixed', changes
        else:
            return 'ok', []

    except Exception as e:
        return 'error', [str(e)]

def main():
    ships_dir = Path('/home/user/InTheWake/ships/rcl')

    print(f"\n{BOLD}{'═' * 60}{RESET}")
    print(f"{BOLD}🔧 Ship Grid Span Fixer{RESET}")
    print(f"{BOLD}{'═' * 60}{RESET}\n")

    stats = {'fixed': 0, 'ok': 0, 'error': 0}

    for filepath in sorted(ships_dir.glob('*.html')):
        status, changes = fix_ship_page(filepath)
        stats[status] += 1

        if status == 'fixed':
            print(f"  {GREEN}✓{RESET} {filepath.name}")
            for change in changes:
                print(f"      {CYAN}→{RESET} {change}")
        elif status == 'error':
            print(f"  {RED}✗{RESET} {filepath.name}: {changes[0]}")

    print(f"\n{BOLD}{'─' * 60}{RESET}")
    print(f"\n{BOLD}Summary:{RESET}")
    print(f"  {GREEN}Fixed:{RESET}   {stats['fixed']} pages")
    print(f"  {CYAN}Already OK:{RESET} {stats['ok']} pages")
    if stats['error'] > 0:
        print(f"  {RED}Errors:{RESET}  {stats['error']} pages")
    print(f"\n{BOLD}{'═' * 60}{RESET}\n")

if __name__ == '__main__':
    main()
