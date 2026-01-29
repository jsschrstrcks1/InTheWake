#!/usr/bin/env python3
"""
Update pages with simple nav (no dropdowns) to use the full nav structure.
"""

import os
import re
import sys
from pathlib import Path

# New canonical nav structure
NEW_NAV_CONTENT = '''        <a class="nav-pill" href="/">Home</a>

        <!-- Planning Dropdown -->
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

# Pattern for simple nav in port pages (div-based)
SIMPLE_NAV_DIV_PATTERN = re.compile(
    r'<div class="site-nav" id="site-nav">\s*'
    r'<a class="nav-pill" href="/">Home</a>\s*'
    r'(?:<a class="nav-pill" href="[^"]+">[\w\s&;]+</a>\s*)+'
    r'</div>',
    re.DOTALL
)

# Pattern for simple nav in nav element
SIMPLE_NAV_NAV_PATTERN = re.compile(
    r'<nav class="site-nav" id="site-nav"[^>]*>\s*'
    r'<a class="nav-pill" href="/">Home</a>\s*'
    r'(?:<a class="nav-pill" href="[^"]+">[\w\s&;]+</a>\s*)+'
    r'</nav>',
    re.DOTALL
)

def update_file(filepath):
    """Update navigation in a single file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return f"ERROR reading: {e}"

    # Skip if already has nav-dropdown
    if 'nav-dropdown' in content:
        return "SKIP: Already has dropdown nav"

    # Skip if no site-nav
    if 'site-nav' not in content:
        return "SKIP: No site-nav element"

    original = content

    # Try div-based simple nav
    if '<div class="site-nav" id="site-nav">' in content:
        new_nav = f'<nav class="site-nav" id="site-nav" aria-label="Main site navigation">\n{NEW_NAV_CONTENT}\n      </nav>'
        content = SIMPLE_NAV_DIV_PATTERN.sub(new_nav, content)

    # Try nav-based simple nav
    elif '<nav class="site-nav"' in content:
        new_nav = f'<nav class="site-nav" id="site-nav" aria-label="Main site navigation">\n{NEW_NAV_CONTENT}\n      </nav>'
        content = SIMPLE_NAV_NAV_PATTERN.sub(new_nav, content)

    if content == original:
        return "SKIP: Pattern not matched"

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
        'offline.html',  # Keep simple for offline experience
    }

    skip_dirs = {
        '.claude',
        'admin',
        '.git',
    }

    results = {'UPDATED': 0, 'SKIP': 0, 'ERROR': 0}
    errors = []
    skipped_details = []

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
            if 'Pattern not matched' in result or 'No site-nav' in result:
                skipped_details.append(f"{filepath.relative_to(base_dir)}: {result}")
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

    if skipped_details and len(skipped_details) <= 20:
        print(f"\n=== Skipped (pattern issues) ===")
        for s in skipped_details:
            print(s)

if __name__ == '__main__':
    main()
