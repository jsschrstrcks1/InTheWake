#!/usr/bin/env python3
"""
Migrate port pages with old template (main-nav) to new nav structure.
"""

import os
import re
from pathlib import Path

# New header/nav structure to replace the old one
NEW_HEADER = '''  <a href="#main-content" class="skip-link">Skip to main content</a>

  <header class="hero-header" role="banner">
    <nav class="navbar" aria-label="Main navigation">
      <div class="brand">
        <img loading="lazy" src="/assets/logo_wake_256.png" srcset="/assets/logo_wake_256.png 1x, /assets/logo_wake_512.png 2x" width="256" height="259" alt="In the Wake wordmark" decoding="async"/>
      </div>
      <button class="nav-toggle" type="button" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="site-nav">
        <span class="nav-toggle-icon"><span></span><span></span><span></span></span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="Main site navigation">
        <a class="nav-pill" href="/">Home</a>

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
        <a class="nav-pill" href="/about-us.html">About</a>
      </nav>
    </nav>
  </header>'''

# Pattern to match old header structure
OLD_HEADER_PATTERN = re.compile(
    r'<header class="site-header">.*?</header>\s*',
    re.DOTALL
)

# Also need to add stylesheet reference if using old /css/style.css
def update_file(filepath):
    """Update a port page from old template to new."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return f"ERROR reading: {e}"

    if 'class="main-nav"' not in content:
        return "SKIP: No main-nav class"

    original = content

    # Replace old header with new
    if '<header class="site-header">' in content:
        # Find the body tag and insert skip link + new header after it
        content = OLD_HEADER_PATTERN.sub('', content)

        # Insert new header after <body> tag
        body_match = re.search(r'<body[^>]*>', content)
        if body_match:
            insert_pos = body_match.end()
            content = content[:insert_pos] + '\n' + NEW_HEADER + '\n\n' + content[insert_pos:].lstrip()

    # Update stylesheet reference
    content = content.replace('/css/style.css', '/assets/styles.css')

    # Update logo path
    content = content.replace('/images/logo.png', '/assets/logo_wake_256.png')

    # Update footer nav if present
    old_footer_nav = '<nav class="footer-nav"><a href="/ports.html">All Ports</a><a href="/tips/">Cruise Tips</a><a href="/about.html">About</a></nav>'
    new_footer_nav = '<nav class="footer-nav"><a href="/ports.html">All Ports</a><a href="/planning.html">Planning</a><a href="/about-us.html">About</a></nav>'
    content = content.replace(old_footer_nav, new_footer_nav)

    if content == original:
        return "SKIP: No changes made"

    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return "UPDATED"
    except Exception as e:
        return f"ERROR writing: {e}"

def main():
    ports_dir = Path('/home/user/InTheWake/ports')

    results = {'UPDATED': 0, 'SKIP': 0, 'ERROR': 0}

    for filepath in ports_dir.glob('*.html'):
        result = update_file(filepath)

        if result.startswith('ERROR'):
            results['ERROR'] += 1
            print(f"ERROR: {filepath.name}: {result}")
        elif result.startswith('SKIP'):
            results['SKIP'] += 1
        else:
            results['UPDATED'] += 1
            print(f"Updated: {filepath.name}")

    print(f"\n=== Summary ===")
    print(f"Updated: {results['UPDATED']}")
    print(f"Skipped: {results['SKIP']}")
    print(f"Errors: {results['ERROR']}")

if __name__ == '__main__':
    main()
