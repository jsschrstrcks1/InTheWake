#!/usr/bin/env python3
"""
Add Search to Navigation
Soli Deo Gloria

Adds Search as a main nav item to all pages.
Also fixes pages with simplified nav to use dropdown structure.
"""

import re
from pathlib import Path

# Directories to exclude
EXCLUDE_DIRS = {'vendors', 'admin', '__MACOSX'}

# The correct nav structure with Search
CORRECT_NAV = '''<nav class="nav" aria-label="Main site navigation">
        <div class="nav-item">
          <a href="/">Home</a>
        </div>

        <!-- Planning Dropdown -->
        <div class="nav-item nav-group" id="nav-planning" data-open="false">
          <button class="nav-disclosure" type="button" aria-expanded="false" aria-haspopup="true" aria-controls="menu-planning">
            Planning <span class="caret">▾</span>
          </button>
          <div id="menu-planning" class="submenu" role="menu" aria-label="Planning submenu">
            <a role="menuitem" href="/planning.html">Planning (overview)</a>
            <a role="menuitem" href="/ships.html">Ships</a>
            <a role="menuitem" href="/restaurants.html">Restaurants &amp; Menus</a>
            <a role="menuitem" href="/ports.html">Ports</a>
            <a role="menuitem" href="/drink-calculator.html">Drink Calculator</a>
            <a role="menuitem" href="/stateroom-check.html">Stateroom Check</a>
            <a role="menuitem" href="/cruise-lines.html">Cruise Lines</a>
            <a role="menuitem" href="/packing-lists.html">Packing Lists</a>
            <a role="menuitem" href="/accessibility.html">Accessibility</a>
          </div>
        </div>

        <!-- Travel Dropdown -->
        <div class="nav-item nav-group" id="nav-travel" data-open="false">
          <button class="nav-disclosure" type="button" aria-expanded="false" aria-haspopup="true" aria-controls="menu-travel">
            Travel <span class="caret">▾</span>
          </button>
          <div id="menu-travel" class="submenu" role="menu" aria-label="Travel submenu">
            <a role="menuitem" href="/travel.html">Travel (overview)</a>
            <a role="menuitem" href="/solo.html">Solo</a>
          </div>
        </div>

        <div class="nav-item">
          <a href="/search.html">Search</a>
        </div>

        <div class="nav-item">
          <a href="/about-us.html">About</a>
        </div>
      </nav>'''

def should_process(filepath):
    """Check if file should be processed"""
    path_str = str(filepath)
    for exclude in EXCLUDE_DIRS:
        if f'/{exclude}/' in path_str:
            return False
    return True

def has_search_in_nav(content):
    """Check if page already has Search in nav"""
    return 'href="/search.html"' in content

def has_dropdown_nav(content):
    """Check if page has dropdown nav structure"""
    return 'nav-group' in content and 'submenu' in content

def has_simplified_nav(content):
    """Check if page has old simplified nav"""
    # Old nav pattern: multiple nav-item divs with direct links
    return bool(re.search(r'<nav[^>]*class="nav"[^>]*>.*?<div class="nav-item"><a href="/', content, re.DOTALL))

def add_search_to_dropdown_nav(content):
    """Add Search link to pages with dropdown nav that don't have it"""
    # Pattern: Find the About nav-item at the end
    pattern = r'(</div>\s*</div>\s*)(<div class="nav-item">\s*<a href="/about-us\.html">About</a>\s*</div>\s*</nav>)'

    # Check if we can find this pattern
    if re.search(pattern, content, re.DOTALL):
        # Insert Search before About
        replacement = r'''\1
        <div class="nav-item">
          <a href="/search.html">Search</a>
        </div>

        \2'''
        return re.sub(pattern, replacement, content, flags=re.DOTALL)

    return None

def replace_simplified_nav(content):
    """Replace simplified nav with full dropdown nav"""
    # Match the entire nav element
    pattern = r'<nav[^>]*class="nav"[^>]*>.*?</nav>'

    if re.search(pattern, content, re.DOTALL):
        return re.sub(pattern, CORRECT_NAV, content, flags=re.DOTALL)

    return None

def process_file(filepath):
    """Process a single HTML file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return None, f"Error reading: {e}"

    # Skip if already has Search
    if has_search_in_nav(content):
        return False, "Already has Search"

    # Check nav type and fix accordingly
    if has_dropdown_nav(content):
        # Has dropdown, just needs Search added
        new_content = add_search_to_dropdown_nav(content)
        if new_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True, "Added Search to dropdown nav"
        else:
            return None, "Could not find nav pattern"

    elif has_simplified_nav(content):
        # Has old simplified nav, replace entirely
        new_content = replace_simplified_nav(content)
        if new_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True, "Replaced simplified nav with dropdown"
        else:
            return None, "Could not find nav to replace"

    else:
        return None, "No nav found"

def main():
    """Main function"""
    root = Path('/home/user/InTheWake')
    html_files = list(root.rglob('*.html'))

    # Filter files
    files_to_process = [f for f in html_files if should_process(f)]

    print(f"Processing {len(files_to_process)} HTML files...")

    updated = 0
    skipped = 0
    failed = 0
    details = {'dropdown': 0, 'replaced': 0}

    for filepath in sorted(files_to_process):
        result, msg = process_file(filepath)

        if result is True:
            updated += 1
            if 'dropdown' in msg:
                details['dropdown'] += 1
            elif 'Replaced' in msg:
                details['replaced'] += 1
            if updated <= 10 or updated % 50 == 0:
                print(f"  ✓ {filepath.relative_to(root)}: {msg}")
        elif result is False:
            skipped += 1
        else:
            failed += 1
            if failed <= 5:
                print(f"  ✗ {filepath.relative_to(root)}: {msg}")

    print(f"\n✅ Complete!")
    print(f"   Updated: {updated} pages")
    print(f"     - Added to dropdown: {details['dropdown']}")
    print(f"     - Replaced simplified: {details['replaced']}")
    print(f"   Skipped (already has Search): {skipped}")
    print(f"   Failed: {failed}")

if __name__ == '__main__':
    main()
