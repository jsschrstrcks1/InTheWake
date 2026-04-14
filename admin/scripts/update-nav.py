#!/usr/bin/env python3
"""
Update navigation across all HTML pages to use the new consistent structure.
"""

import os
import re
import sys
from pathlib import Path

# New canonical nav structure (using &#9662; for caret to be HTML-safe)
NEW_NAV_DROPDOWNS = '''        <!-- Planning Dropdown -->
        <div class="nav-dropdown" id="nav-planning">
          <button class="nav-pill" type="button" aria-expanded="false" aria-haspopup="true">
            Planning <span class="caret">&#9662;</span>
          </button>
          <div class="dropdown-menu" role="menu">
            <a href="/first-cruise.html">Your First Cruise</a>
            <a href="/ships.html">Ships</a>
            <a href="/cruise-lines.html">Cruise Lines</a>
            <a href="/ports.html">Ports</a>
            <a href="/packing-lists.html">Packing Lists</a>
            <a href="/accessibility.html">Accessibility</a>
          </div>
        </div>

        <!-- Tools Dropdown -->
        <div class="nav-dropdown" id="nav-tools">
          <button class="nav-pill" type="button" aria-expanded="false" aria-haspopup="true">
            Tools <span class="caret">&#9662;</span>
          </button>
          <div class="dropdown-menu" role="menu">
            <a href="/ships/quiz.html">Ship Quiz</a>
            <a href="/cruise-lines/quiz.html">Cruise Line Quiz</a>
            <a href="/drink-calculator.html">Drink Calculator</a>
            <a href="/stateroom-check.html">Stateroom Check</a>
            <a href="/tools/port-tracker.html">Port Logbook</a>
            <a href="/tools/ship-tracker.html">Ship Logbook</a>
          </div>
        </div>

        <!-- Onboard Dropdown -->
        <div class="nav-dropdown" id="nav-onboard">
          <button class="nav-pill" type="button" aria-expanded="false" aria-haspopup="true">
            Onboard <span class="caret">&#9662;</span>
          </button>
          <div class="dropdown-menu" role="menu">
            <a href="/restaurants.html">Restaurants &amp; Menus</a>
            <a href="/drink-packages.html">Drink Packages</a>
            <a href="/internet-at-sea.html">Internet at Sea</a>
            <a href="/articles.html">Articles</a>
          </div>
        </div>

        <!-- Travel Dropdown -->
        <div class="nav-dropdown" id="nav-travel">
          <button class="nav-pill" type="button" aria-expanded="false" aria-haspopup="true">
            Travel <span class="caret">&#9662;</span>
          </button>
          <div class="dropdown-menu" role="menu">
            <a href="/travel.html">Travel (overview)</a>
            <a href="/solo.html">Solo</a>
          </div>
        </div>

        <a class="nav-pill" href="/search.html">Search</a>
        <a class="nav-pill" href="/about-us.html">About</a>'''

# Pattern for pages with id="nav-planning" (multiline format)
PATTERN_ID_NAV = re.compile(
    r'<!-- Planning Dropdown -->\s*'
    r'<div class="nav-dropdown" id="nav-planning">.*?</div>\s*</div>\s*'
    r'(?:<!-- Tools Dropdown -->\s*<div class="nav-dropdown" id="nav-tools">.*?</div>\s*</div>\s*)?'
    r'(?:<!-- Onboard Dropdown -->\s*<div class="nav-dropdown" id="nav-onboard">.*?</div>\s*</div>\s*)?'
    r'<!-- Travel Dropdown -->\s*'
    r'<div class="nav-dropdown" id="nav-travel">.*?</div>\s*</div>\s*'
    r'(?:<a class="nav-pill" href="/tools/port-tracker.html">Port Logbook</a>\s*)?'
    r'(?:<a class="nav-pill" href="/tools/ship-tracker.html">Ship Logbook</a>\s*)?'
    r'<a class="nav-pill" href="/search.html">Search</a>\s*'
    r'<a class="nav-pill" href="/about-us.html">About</a>',
    re.DOTALL
)

# Pattern for pages with data-nav="planning" (single-line format)
PATTERN_DATA_NAV = re.compile(
    r'<div class="nav-dropdown" data-nav="planning">.*?</div>\s*</div>\s*'
    r'<div class="nav-dropdown" data-nav="travel">.*?</div>\s*</div>\s*'
    r'(?:<a class="nav-pill" href="/tools/port-tracker.html">Port Logbook</a>\s*)?'
    r'(?:<a class="nav-pill" href="/tools/ship-tracker.html">Ship Logbook</a>\s*)?'
    r'<a class="nav-pill" href="/search.html">Search</a>\s*'
    r'<a class="nav-pill" href="/about-us.html">About</a>',
    re.DOTALL
)

def update_file(filepath):
    """Update navigation in a single file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return f"ERROR reading: {e}"

    original = content

    # Try id-based pattern first
    if 'id="nav-planning"' in content:
        content = PATTERN_ID_NAV.sub(NEW_NAV_DROPDOWNS, content)
    # Try data-nav pattern
    elif 'data-nav="planning"' in content:
        content = PATTERN_DATA_NAV.sub(NEW_NAV_DROPDOWNS, content)
    else:
        return "SKIP: No nav dropdown found"

    if content == original:
        return "SKIP: No changes made (pattern not matched)"

    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return "UPDATED"
    except Exception as e:
        return f"ERROR writing: {e}"

def main():
    base_dir = Path('/home/user/InTheWake')

    # Skip these files
    skip_files = {
        'index.html',  # Already updated manually
        'offline.html',
        'perfect-html-page.html',
    }

    skip_dirs = {
        '.claude',
        'admin',
        '.git',
    }

    results = {'UPDATED': 0, 'SKIP': 0, 'ERROR': 0}
    errors = []

    for filepath in base_dir.rglob('*.html'):
        # Skip certain directories
        if any(skip_dir in filepath.parts for skip_dir in skip_dirs):
            continue

        # Skip certain files
        if filepath.name in skip_files:
            continue

        result = update_file(filepath)

        if result.startswith('ERROR'):
            results['ERROR'] += 1
            errors.append(f"{filepath}: {result}")
        elif result.startswith('SKIP'):
            results['SKIP'] += 1
        else:
            results['UPDATED'] += 1
            print(f"Updated: {filepath.relative_to(base_dir)}")

    print(f"\n=== Summary ===")
    print(f"Updated: {results['UPDATED']}")
    print(f"Skipped: {results['SKIP']}")
    print(f"Errors: {results['ERROR']}")

    if errors:
        print(f"\n=== Errors ===")
        for e in errors:
            print(e)

if __name__ == '__main__':
    main()
