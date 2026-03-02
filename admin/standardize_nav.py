#!/usr/bin/env python3
"""Standardize navigation menus across all pages"""

import re
from pathlib import Path

# Standard navigation structure
STANDARD_NAV = '''          <div id="menu-planning" class="submenu" role="menu" aria-label="Planning submenu">
            <a role="menuitem" href="/planning.html">Planning (overview)</a>
            <a role="menuitem" href="/ships.html">Ships</a>
            <a role="menuitem" href="/restaurants.html">Restaurants &amp; Menus</a>
            <a role="menuitem" href="/ports.html">Ports</a>
            <a role="menuitem" href="/drink-packages.html">Drink Packages</a>
            <a role="menuitem" href="/drink-calculator.html">Drink Calculator</a>
            <a role="menuitem" href="/stateroom-check.html">Stateroom Check</a>
            <a role="menuitem" href="/cruise-lines.html">Cruise Lines</a>
            <a role="menuitem" href="/packing-lists.html">Packing Lists</a>
            <a role="menuitem" href="/accessibility.html">Accessibility</a>
          </div>'''

STANDARD_TRAVEL_NAV = '''          <div id="menu-travel" class="submenu" role="menu" aria-label="Travel submenu">
            <a role="menuitem" href="/travel.html">Travel (overview)</a>
            <a role="menuitem" href="/solo.html">Solo</a>
          </div>'''

def standardize_nav(file_path):
    """Replace navigation menus with standard versions"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    changes = []

    # Replace Planning submenu - match the submenu div within nav-planning
    # Pattern: find nav-group with id="nav-planning", then find the submenu div and replace it
    planning_pattern = r'(id="nav-planning"[^>]*>.*?<button[^>]*>.*?</button>\s*)(<div[^>]*class="submenu"[^>]*>.*?</div>)'
    def replace_planning(match):
        return match.group(1) + STANDARD_NAV

    if re.search(planning_pattern, content, re.DOTALL):
        content = re.sub(planning_pattern, replace_planning, content, flags=re.DOTALL, count=1)
        changes.append("Updated Planning submenu")

    # Replace Travel submenu
    travel_pattern = r'(id="nav-travel"[^>]*>.*?<button[^>]*>.*?</button>\s*)(<div[^>]*class="submenu"[^>]*>.*?</div>)'
    def replace_travel(match):
        return match.group(1) + STANDARD_TRAVEL_NAV

    if re.search(travel_pattern, content, re.DOTALL):
        content = re.sub(travel_pattern, replace_travel, content, flags=re.DOTALL, count=1)
        changes.append("Updated Travel submenu")

    if content != original:
        return content, changes
    return None, []

def main():
    """Process all HTML files"""
    files = list(Path('.').rglob('*.html'))
    files = [f for f in files if 'vendors' not in str(f) and '.git' not in str(f)]

    print(f"\nChecking {len(files)} files...\n")

    updated = 0
    for file_path in sorted(files):
        try:
            new_content, changes = standardize_nav(file_path)
            if new_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"✓ {file_path}")
                for change in changes:
                    print(f"  - {change}")
                updated += 1
        except Exception as e:
            print(f"✗ {file_path}: {e}")

    print(f"\n{'='*60}")
    print(f"Updated: {updated} files")
    print(f"{'='*60}\n")

if __name__ == '__main__':
    main()
