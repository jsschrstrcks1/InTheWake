#!/usr/bin/env python3
"""
Fix broken HTML files that are missing proper body structure.
"""

import re
from pathlib import Path

STANDARD_HEADER_NAV = '''
  <a href="#main-content" class="skip-link">Skip to main content</a>

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
  </header>
'''

STANDARD_FOOTER = '''
  <footer class="wrap" role="contentinfo">
    <p>&copy; 2025 In the Wake &middot; A Cruise Traveler's Logbook</p>
    <p class="tiny"><a href="/privacy.html">Privacy</a> &middot; <a href="/terms.html">Terms</a></p>
    <p class="trust-badge">✓ No ads. Minimal analytics. Independent of cruise lines. <a href="/affiliate-disclosure.html">Affiliate Disclosure</a></p>
  </footer>

  <script src="/assets/js/dropdown.js"></script>
</body>
</html>
'''

def fix_file(filepath, title, main_content):
    """Fix a broken HTML file by adding proper body structure."""
    content = filepath.read_text()

    # Find where head content ends (before the errant </body>)
    # Look for the last script tag before </body>
    match = re.search(r'(.*?)(\s*</body>\s*</html>\s*)$', content, re.DOTALL)

    if not match:
        print(f"SKIP: {filepath.name} - unexpected structure")
        return

    head_content = match.group(1)

    # Remove any stray </body></html> and add proper structure
    # First, close the head properly if not closed
    if '</head>' not in head_content:
        head_content = head_content.rstrip() + '\n</head>\n'

    # Build new content
    new_content = head_content + '''
<body class="page">
''' + STANDARD_HEADER_NAV + '''

  <main class="wrap page-grid" id="main-content" role="main">
    <article class="card">
      <h1>''' + title + '''</h1>
''' + main_content + '''
    </article>
  </main>
''' + STANDARD_FOOTER

    filepath.write_text(new_content)
    print(f"Fixed: {filepath.name}")

def main():
    # Fix disability-at-sea.html
    fix_file(
        Path('/home/user/InTheWake/disability-at-sea.html'),
        'Accessibility & Inclusion',
        '''
      <p>In the Wake is committed to accessibility for all travelers — honoring every ability, ensuring every voyager can plan and dream freely.</p>
      <p>This page is under development. For comprehensive accessibility information, please visit our <a href="/accessibility.html">Accessibility Guide</a>.</p>
      <h2>Our Commitment</h2>
      <ul>
        <li>WCAG 2.1 Level AA compliance</li>
        <li>Screen reader optimization</li>
        <li>Keyboard navigation support</li>
        <li>Color contrast standards</li>
        <li>Alternative text for all images</li>
      </ul>
'''
    )

    # Fix ken-baker.html
    fix_file(
        Path('/home/user/InTheWake/authors/ken-baker.html'),
        'Ken Baker',
        '''
      <p class="subtitle">Founder & Editor — In the Wake</p>
      <p>Ken Baker is a traveler, pastor, and storyteller. With 50+ cruises under his belt, he founded In the Wake to share practical cruise planning tools and faith-scented reflections for smoother sailings.</p>
      <h2>Expertise</h2>
      <ul>
        <li>Cruise Planning</li>
        <li>Royal Caribbean</li>
        <li>Solo Cruising</li>
        <li>Accessibility Advocacy</li>
        <li>Photography</li>
      </ul>
      <h2>Philosophy</h2>
      <p><em>"The calmest seas are found in another's wake."</em></p>
      <p>Every page on this site is crafted with care, offered as worship to God, in gratitude for the beautiful things He has created for us to enjoy.</p>
'''
    )

    # Fix tina-maulsby.html
    fix_file(
        Path('/home/user/InTheWake/authors/tina-maulsby.html'),
        'Tina Maulsby',
        '''
      <p class="subtitle">Featured Contributor — In the Wake</p>
      <p>Tina Maulsby is a solo cruising enthusiast and contributor to In the Wake. Her articles explore the joy and freedom of cruising alone.</p>
      <h2>Featured Articles</h2>
      <ul>
        <li><a href="/solo/why-i-started-solo-cruising.html">Why I Started Solo Cruising</a></li>
      </ul>
      <h2>Cruising Philosophy</h2>
      <p>Tina believes that solo cruising isn't about being alone — it's about freedom, self-discovery, and the simple joy of sailing at your own pace.</p>
'''
    )

    # Fix in-the-wake-of-grief-meta.html
    fix_file(
        Path('/home/user/InTheWake/solo/in-the-wake-of-grief-meta.html'),
        'In the Wake of Grief',
        '''
      <p>This is a companion page for the article <a href="/solo/in-the-wake-of-grief.html">In the Wake of Grief</a>.</p>
      <p>Traveling after loss can be both healing and challenging. Our article explores how cruising can provide space for reflection, peace, and gentle restoration.</p>
      <p><a href="/solo/in-the-wake-of-grief.html">Read the full article →</a></p>
'''
    )

    # Fix carnival-adventure.html - this one is more complex
    # It has lots of head content but no body
    filepath = Path('/home/user/InTheWake/ships/carnival/carnival-adventure.html')
    content = filepath.read_text()

    # Find where the head content ends
    # Look for the footer tag which shouldn't be in head
    match = re.search(r'(.*?)<footer', content, re.DOTALL)
    if match:
        head_content = match.group(1)
        # Close head and add body
        if '</head>' not in head_content:
            head_content = head_content.rstrip() + '\n</head>\n'

        # Get footer and rest
        footer_match = re.search(r'(<footer.*?</footer>)', content, re.DOTALL)
        footer = footer_match.group(1) if footer_match else ''

        new_content = head_content + '''
<body class="page ship-page">
''' + STANDARD_HEADER_NAV + '''

  <main class="wrap page-grid" id="main-content" role="main">
    <article class="card ship-content">
      <h1>Carnival Adventure</h1>
      <p class="ship-class">Grand Class (Ex-Princess) · Carnival Cruise Line</p>

      <section class="ship-overview">
        <h2>Overview</h2>
        <p>Carnival Adventure is a Grand Class ship (108,865 GT, 2,600 guests) originally launched in 2001 as Golden Princess. She features Movies Under the Stars, multiple pools, and sailings from Mobile and Sydney.</p>
      </section>

      <section class="ship-details">
        <h2>Ship Details</h2>
        <ul>
          <li><strong>Gross Tonnage:</strong> 108,865 GT</li>
          <li><strong>Guest Capacity:</strong> 2,600</li>
          <li><strong>Ship Class:</strong> Grand Class (Ex-Princess)</li>
          <li><strong>Entered Service:</strong> 2001 (as Golden Princess)</li>
        </ul>
      </section>

      <p><em>Full ship details, deck plans, dining guides, and live tracker coming soon.</em></p>
    </article>
  </main>

''' + footer + '''

  <script src="/assets/js/dropdown.js"></script>
  <script src="/assets/js/in-app-browser-escape.js"></script>
  <script src="/assets/js/whimsical-port-units.js"></script>
</body>
</html>
'''
        filepath.write_text(new_content)
        print(f"Fixed: {filepath.name}")
    else:
        print(f"SKIP: {filepath.name} - unexpected structure")

if __name__ == '__main__':
    main()
    print("\nAll broken files fixed!")
