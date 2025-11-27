#!/usr/bin/env python3
"""
Fix missing .page-grid CSS across all pages that use the class.

This script finds HTML files that have class="page-grid" but are missing
the CSS definition, and adds the required grid layout styles.
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

# CSS to inject
PAGE_GRID_CSS = '''
    /* Page Grid Layout (2-column with right rail) */
    .page-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      align-items: start;
    }

    @media (min-width: 980px) {
      .page-grid {
        grid-template-columns: 1fr 360px;
      }
    }

    .rail {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .rail-list {
      display: grid;
      gap: 1rem;
    }
'''

def has_page_grid_class(content):
    """Check if file uses page-grid class."""
    return bool(re.search(r'class="[^"]*page-grid[^"]*"', content))

def has_page_grid_css(content):
    """Check if file has .page-grid CSS definition."""
    return bool(re.search(r'\.page-grid\s*\{', content))

def add_page_grid_css(content):
    """Add page-grid CSS to the first <style> block."""
    # Find the first <style> tag and insert after it
    match = re.search(r'(<style[^>]*>)', content)
    if match:
        insert_pos = match.end()
        return content[:insert_pos] + PAGE_GRID_CSS + content[insert_pos:]
    return None

def process_file(filepath):
    """Process a single HTML file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        if not has_page_grid_class(content):
            return 'skip', 'No page-grid class'

        if has_page_grid_css(content):
            return 'ok', 'Already has CSS'

        new_content = add_page_grid_css(content)
        if new_content is None:
            return 'error', 'No <style> tag found'

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

        return 'fixed', 'Added page-grid CSS'
    except Exception as e:
        return 'error', str(e)

def main():
    root = Path('/home/user/InTheWake')

    # Files to check
    patterns = [
        '*.html',
        'ports/*.html',
        'authors/*.html',
        'restaurants/*.html',
        'cruise-lines/*.html',
        'tools/*.html',
        'solo/*.html',
    ]

    files_to_check = []
    for pattern in patterns:
        files_to_check.extend(root.glob(pattern))

    # Deduplicate and sort
    files_to_check = sorted(set(files_to_check))

    print(f"\n{BOLD}{'═' * 60}{RESET}")
    print(f"{BOLD}🔧 Page Grid CSS Fixer{RESET}")
    print(f"{BOLD}{'═' * 60}{RESET}\n")

    stats = {'fixed': 0, 'ok': 0, 'skip': 0, 'error': 0}
    fixed_files = []

    for filepath in files_to_check:
        status, message = process_file(filepath)
        stats[status] += 1

        rel_path = filepath.relative_to(root)

        if status == 'fixed':
            print(f"  {GREEN}✓{RESET} {rel_path} — {message}")
            fixed_files.append(str(rel_path))
        elif status == 'error':
            print(f"  {RED}✗{RESET} {rel_path} — {message}")
        # Skip 'ok' and 'skip' to reduce noise

    print(f"\n{BOLD}{'─' * 60}{RESET}")
    print(f"\n{BOLD}Summary:{RESET}")
    print(f"  {GREEN}Fixed:{RESET}   {stats['fixed']} pages")
    print(f"  {CYAN}Already OK:{RESET} {stats['ok']} pages")
    print(f"  {YELLOW}Skipped:{RESET} {stats['skip']} pages (no page-grid class)")
    if stats['error'] > 0:
        print(f"  {RED}Errors:{RESET}  {stats['error']} pages")

    print(f"\n{BOLD}{'═' * 60}{RESET}\n")

    return fixed_files

if __name__ == '__main__':
    main()
