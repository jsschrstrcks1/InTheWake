#!/usr/bin/env python3
"""
Fix remaining pages with simple nav to use dropdown nav.
"""

import re
from pathlib import Path

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

def fix_carnival_tropicale():
    """Fix carnival-tropicale.html"""
    filepath = Path('/home/user/InTheWake/ships/carnival/carnival-tropicale.html')
    content = filepath.read_text()

    # Replace old header
    old_header_pattern = re.compile(
        r'<header class="site-header".*?</header>\s*',
        re.DOTALL
    )

    content = old_header_pattern.sub(NEW_HEADER + '\n\n', content)

    # Add skip link target if needed
    content = content.replace('id="main"', 'id="main-content"')

    filepath.write_text(content)
    print(f"Updated: {filepath.name}")

def fix_affiliate_disclosure():
    """Fix affiliate-disclosure.html"""
    filepath = Path('/home/user/InTheWake/affiliate-disclosure.html')
    content = filepath.read_text()

    # Replace old header (including skip link)
    old_pattern = re.compile(
        r'<!-- Skip Link -->.*?</header>\s*',
        re.DOTALL
    )

    content = old_pattern.sub(NEW_HEADER + '\n\n', content)

    # Fix main id
    content = content.replace('id="main"', 'id="main-content"')

    filepath.write_text(content)
    print(f"Updated: {filepath.name}")

def fix_cruise_duck():
    """Fix cruise-duck-tradition.html"""
    filepath = Path('/home/user/InTheWake/articles/cruise-duck-tradition.html')
    content = filepath.read_text()

    # Check if it has header
    if '<header' not in content:
        print(f"SKIP: {filepath.name} - no header to replace")
        return

    # Replace old header structure
    old_pattern = re.compile(
        r'<a href="#main[^"]*" class="skip-link"[^>]*>.*?</a>\s*.*?<header[^>]*>.*?</header>\s*',
        re.DOTALL
    )

    if old_pattern.search(content):
        content = old_pattern.sub(NEW_HEADER + '\n\n', content)
    else:
        # Try simpler pattern
        header_pattern = re.compile(r'<header[^>]*>.*?</header>\s*', re.DOTALL)
        content = header_pattern.sub(NEW_HEADER + '\n\n', content)

    filepath.write_text(content)
    print(f"Updated: {filepath.name}")

if __name__ == '__main__':
    fix_carnival_tropicale()
    fix_affiliate_disclosure()
    fix_cruise_duck()
    print("\nDone!")
