#!/usr/bin/env python3
"""
Normalize Navigation Structure Across Port Pages
Soli Deo Gloria

This script updates port pages to have the standard navigation structure
matching index.html, including:
- Mobile hamburger button
- Dropdown menus for Planning and Travel
- Proper nav structure with all required links
- Skip link and ARIA live regions
"""

import re
from pathlib import Path

# The normalized nav structure (from cozumel.html as gold standard)
HAMBURGER_BUTTON = '''      <!-- Mobile hamburger button -->
      <button class="nav-toggle" type="button" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="site-nav">
        <span class="nav-toggle-icon">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>'''

NORMALIZED_NAV = '''      <nav class="site-nav" id="site-nav" aria-label="Main site navigation">
        <a class="nav-pill" href="/">Home</a>
        <div class="nav-dropdown" data-nav="planning">
          <button class="nav-pill" type="button" aria-expanded="false" aria-haspopup="true">Planning <span class="caret">&#9662;</span></button>
          <div class="dropdown-menu" role="menu">
            <a href="/planning.html">Planning (overview)</a>
            <a href="/ships.html">Ships</a>
            <a href="/ships/quiz.html">Ship Quiz</a>
            <a href="/restaurants.html">Restaurants &amp; Menus</a>
            <a href="/ports.html">Ports</a>
            <a href="/drink-packages.html">Drink Packages</a>
            <a href="/drink-calculator.html">Drink Calculator</a>
            <a href="/stateroom-check.html">Stateroom Check</a>
            <a href="/cruise-lines.html">Cruise Lines</a>
            <a href="/packing-lists.html">Packing Lists</a>
            <a href="/accessibility.html">Accessibility</a>
          </div>
        </div>
        <div class="nav-dropdown" data-nav="travel">
          <button class="nav-pill" type="button" aria-expanded="false" aria-haspopup="true">Travel <span class="caret">&#9662;</span></button>
          <div class="dropdown-menu" role="menu">
            <a href="/travel.html">Travel (overview)</a>
            <a href="/solo.html">Solo</a>
          </div>
        </div>
        <a class="nav-pill" href="/tools/port-tracker.html">Port Logbook</a>
        <a class="nav-pill" href="/tools/ship-tracker.html">Ship Logbook</a>
        <a class="nav-pill" href="/search.html">Search</a>
        <a class="nav-pill" href="/about-us.html">About</a>
      </nav>'''

# Pattern to find the brand div closing and nav start
BRAND_END_PATTERN = re.compile(
    r'(</div>\s*)\n(\s*<nav class="site-nav")',
    re.MULTILINE
)

# Pattern to match nav without hamburger button before it
NAV_WITHOUT_HAMBURGER = re.compile(
    r'(</span>\s*</div>)\s*\n\s*(<nav class="site-nav")',
    re.MULTILINE | re.DOTALL
)

# Pattern to match the entire nav section (for replacement)
NAV_SECTION_PATTERN = re.compile(
    r'<nav class="site-nav"[^>]*>.*?</nav>',
    re.DOTALL
)

# Pattern for old style navigation
OLD_NAV_PATTERN = re.compile(
    r'<nav class="main-navigation">.*?</nav>',
    re.DOTALL
)

# Pattern for old style header
OLD_HEADER_PATTERN = re.compile(
    r'<header class="site-header">.*?</header>',
    re.DOTALL
)

# Additional patterns for simple old headers
SIMPLE_HEADER_PATTERN = re.compile(
    r'<header>\s*<div class="(header-container|container)">\s*<div class="logo">.*?</header>',
    re.DOTALL
)

# Pattern for nav class="main-nav" or just nav with ul
OLD_MAIN_NAV_PATTERN = re.compile(
    r'<nav class="main-nav">.*?</nav>',
    re.DOTALL
)

# Pattern for simple nav without class
SIMPLE_NAV_PATTERN = re.compile(
    r'<header>\s*<div class="container">\s*<div class="logo">.*?</nav>\s*</div>\s*</header>',
    re.DOTALL
)


def has_hamburger_menu(content):
    """Check if the page already has a hamburger menu."""
    return 'nav-toggle' in content


def has_new_style_nav(content):
    """Check if page has the new dropdown-style nav (but may need hamburger)."""
    return 'nav-dropdown' in content and 'site-nav' in content


def has_simplified_site_nav(content):
    """Check if page has simplified site-nav without dropdowns but with hero-header."""
    return ('site-nav' in content and
            'nav-dropdown' not in content and
            'hero-header' in content and
            'nav-toggle' not in content)


def has_old_style_nav(content):
    """Check if page has the old-style navigation."""
    old_patterns = [
        '<nav class="main-navigation">',
        '<header class="site-header">',
        '<nav class="main-nav">',
        # Simple header without class but with container/header-container
        ('<header>' in content and '<div class="header-container">' in content),
        ('<header>' in content and '<div class="container">' in content and '<div class="logo">' in content),
    ]
    for pattern in old_patterns:
        if isinstance(pattern, bool):
            if pattern:
                return True
        elif pattern in content:
            return True
    return False


def has_simple_nav_class(content):
    """Check if page has nav class='nav' (simple nav without dropdowns)."""
    return ('<nav class="nav"' in content and
            'nav-dropdown' not in content and
            'nav-toggle' not in content and
            'hero-header' in content)


def has_misplaced_site_nav(content):
    """Check if page has site-nav placed outside the header (after </header>)."""
    return ('</header>' in content and
            '<nav class="site-nav"' in content and
            'nav-toggle' not in content and
            re.search(r'</header>\s*\n\s*<nav class="site-nav"', content) is not None)


def has_hero_header_no_navbar(content):
    """Check if page has hero-header but no navbar structure."""
    return ('hero-header' in content and
            'navbar' not in content and
            'nav-toggle' not in content and
            'site-nav' not in content)


def has_hero_header_minimal_navbar(content):
    """Check if page has hero-header with minimal navbar (brand only, no site-nav)."""
    return ('hero-header' in content and
            'navbar' in content and
            'nav-toggle' not in content and
            'site-nav' not in content)


def has_ship_hero_header(content):
    """Check if page has ship-hero, hero-ship, or hero-carnival header (alternative ship page structure)."""
    patterns = [
        '<header class="ship-hero">',
        '<header class="hero-ship"',
        '<header class="hero-carnival"',
    ]
    return (any(p in content for p in patterns) and 'nav-toggle' not in content)


def has_ship_hero_section(content):
    """Check if page has ship-hero section (not header)."""
    return ('<section class="ship-hero">' in content and
            'nav-toggle' not in content)


def add_navbar_to_hero_header(content):
    """Add navbar structure to pages that have hero-header but no navbar."""

    # Create the navbar structure to insert
    navbar_html = '''    <div class="navbar">
      <div class="brand">
        <img src="/assets/logo_wake_256.png" srcset="/assets/logo_wake_256.png 1x, /assets/logo_wake_512.png 2x" width="256" height="259" alt="In the Wake cruise travel logbook wordmark" decoding="async" loading="lazy"/>
        <span class="tiny version-badge" aria-label="Site version V1.Beta">V1.Beta</span>
      </div>
''' + HAMBURGER_BUTTON + '''
''' + NORMALIZED_NAV + '''
    </div>
'''

    # Insert navbar after the header opening tag
    pattern = re.compile(
        r'(<header class="hero-header"[^>]*>)\s*\n(\s*)(<div class="hero")',
        re.DOTALL
    )

    match = pattern.search(content)
    if match:
        replacement = match.group(1) + '\n' + navbar_html + match.group(2) + match.group(3)
        content = pattern.sub(replacement, content, count=1)
        return content, True

    return content, False


def add_navbar_to_ship_hero(content):
    """Add navbar structure before ship-hero header."""

    # Create navbar header to insert before ship-hero
    navbar_header = '''<a href="#main-content" class="skip-link">Skip to main content</a>
  <header class="hero-header" role="banner" style="padding:0;">
    <div class="navbar">
      <div class="brand">
        <img src="/assets/logo_wake_256.png" srcset="/assets/logo_wake_256.png 1x, /assets/logo_wake_512.png 2x" width="256" height="259" alt="In the Wake cruise travel logbook wordmark" decoding="async" loading="lazy"/>
        <span class="tiny version-badge" aria-label="Site version V1.Beta">V1.Beta</span>
      </div>
''' + HAMBURGER_BUTTON + '''
''' + NORMALIZED_NAV + '''
    </div>
  </header>

'''

    # Hero class variations
    hero_classes = r'(?:ship-hero|hero-ship|hero-carnival)'

    # Pattern 1: Remove old nav and insert new navbar before ship page header
    # Handle case where there's a <nav class="nav"> before the header
    old_nav_pattern = re.compile(
        r'<nav class="nav">.*?</nav>\s*\n?\s*(<header class="' + hero_classes + r'")',
        re.DOTALL
    )
    match = old_nav_pattern.search(content)
    if match:
        content = old_nav_pattern.sub(navbar_header + match.group(1), content, count=1)
        return content, True

    # Pattern 2: Find the ship page header with skip-link before it
    pattern = re.compile(
        r'(<a href="#main[^>]*class="skip-link"[^>]*>[^<]*</a>\s*\n)(\s*)(<header class="' + hero_classes + r'")',
        re.DOTALL
    )

    match = pattern.search(content)
    if match:
        replacement = match.group(1) + '\n' + navbar_header + match.group(2) + match.group(3)
        content = pattern.sub(replacement, content, count=1)
        return content, True

    # Pattern 3: Insert after body tag when ship page header is first element
    pattern2 = re.compile(
        r'(<body[^>]*>)\s*\n(\s*)(<header class="' + hero_classes + r'")',
        re.DOTALL
    )

    match = pattern2.search(content)
    if match:
        replacement = match.group(1) + '\n' + navbar_header + match.group(2) + match.group(3)
        content = pattern2.sub(replacement, content, count=1)
        return content, True

    # Pattern 4: Handle skip-link followed by ship page header (with possible a11y divs in between)
    pattern3 = re.compile(
        r'(<a href="#[^"]*" class="skip-link">[^<]*</a>.*?)(<header class="' + hero_classes + r'")',
        re.DOTALL
    )
    match = pattern3.search(content)
    if match:
        # Insert navbar header just before the ship page header
        content = pattern3.sub(match.group(1) + navbar_header + match.group(2), content, count=1)
        return content, True

    # Pattern 5: Handle body followed by a11y divs and then ship page header
    pattern4 = re.compile(
        r'(<body[^>]*>)(.*?)(<header class="' + hero_classes + r'")',
        re.DOTALL
    )
    match = pattern4.search(content)
    if match:
        between = match.group(2)
        # Check if there's already a skip-link
        if 'skip-link' not in between:
            skip_link = '\n<a href="#main-content" class="skip-link">Skip to main content</a>\n'
            content = pattern4.sub(match.group(1) + skip_link + navbar_header + between + match.group(3), content, count=1)
        else:
            content = pattern4.sub(match.group(1) + between + navbar_header + match.group(3), content, count=1)
        return content, True

    return content, False


def upgrade_minimal_navbar(content):
    """Upgrade pages with hero-header and minimal navbar (brand only) to full navbar."""

    # Find the minimal navbar pattern and replace with full navbar
    # Pattern: <header class="hero-header"><nav class="navbar"><a href="/" class="brand">...</a></nav></header>
    minimal_navbar_pattern = re.compile(
        r'<header class="hero-header"[^>]*>\s*<nav class="navbar"[^>]*>.*?</nav>\s*</header>',
        re.DOTALL
    )

    match = minimal_navbar_pattern.search(content)
    if match:
        # Replace with full navbar structure
        full_navbar = '''<header class="hero-header" role="banner">
    <div class="navbar">
      <div class="brand">
        <img src="/assets/logo_wake_256.png" srcset="/assets/logo_wake_256.png 1x, /assets/logo_wake_512.png 2x" width="256" height="259" alt="In the Wake cruise travel logbook wordmark" decoding="async" loading="lazy"/>
        <span class="tiny version-badge" aria-label="Site version V1.Beta">V1.Beta</span>
      </div>
''' + HAMBURGER_BUTTON + '''
''' + NORMALIZED_NAV + '''
    </div>
  </header>'''
        content = minimal_navbar_pattern.sub(full_navbar, content, count=1)
        return content, True

    return content, False


def add_navbar_before_ship_hero_section(content):
    """Add navbar before ship-hero section (when section is used instead of header)."""

    navbar_header = '''<header class="hero-header" role="banner" style="padding:0;">
    <div class="navbar">
      <div class="brand">
        <img src="/assets/logo_wake_256.png" srcset="/assets/logo_wake_256.png 1x, /assets/logo_wake_512.png 2x" width="256" height="259" alt="In the Wake cruise travel logbook wordmark" decoding="async" loading="lazy"/>
        <span class="tiny version-badge" aria-label="Site version V1.Beta">V1.Beta</span>
      </div>
''' + HAMBURGER_BUTTON + '''
''' + NORMALIZED_NAV + '''
    </div>
  </header>

'''

    # Pattern: Replace any existing header that ends before ship-hero section
    # and add our navbar
    header_before_section = re.compile(
        r'(<header[^>]*>.*?</header>)\s*\n?(\s*)(<section class="ship-hero">)',
        re.DOTALL
    )

    match = header_before_section.search(content)
    if match:
        # Replace the old header with the new navbar header
        content = header_before_section.sub(navbar_header + match.group(2) + match.group(3), content, count=1)
        return content, True

    # Pattern 2: Insert after skip-link before ship-hero section
    pattern2 = re.compile(
        r'(<a href="#[^"]*" class="skip-link">[^<]*</a>)\s*\n?(\s*)(<section class="ship-hero">)',
        re.DOTALL
    )

    match = pattern2.search(content)
    if match:
        content = pattern2.sub(match.group(1) + '\n' + navbar_header + match.group(2) + match.group(3), content, count=1)
        return content, True

    return content, False


def fix_misplaced_site_nav(content):
    """Move site-nav from outside header to inside navbar, and add hamburger."""

    # Extract the site-nav that's after </header>
    site_nav_pattern = re.compile(
        r'(</header>)\s*\n(\s*)(<nav class="site-nav"[^>]*>.*?</nav>)',
        re.DOTALL
    )

    match = site_nav_pattern.search(content)
    if not match:
        return content, False

    site_nav = match.group(3)

    # Remove the misplaced site-nav
    content = site_nav_pattern.sub(r'\1', content)

    # Find the end of the brand div inside navbar and insert hamburger + site-nav
    # Pattern: look for </div></nav> or </span></div></nav> in navbar
    navbar_end_patterns = [
        # Pattern 1: <nav class="navbar"><div class="brand">...</div></nav>
        re.compile(r'(<nav class="navbar">.*?</div>)(</nav>)', re.DOTALL),
        # Pattern 2: <div class="navbar"><div class="brand">...</div> (no closing)
        re.compile(r'(<div class="navbar">\s*<[^>]+class="brand"[^>]*>.*?</div>)(\s*\n)', re.DOTALL),
    ]

    for pattern in navbar_end_patterns:
        match = pattern.search(content)
        if match:
            # Insert hamburger and site-nav before the closing
            replacement = match.group(1) + '\n' + HAMBURGER_BUTTON + '\n      ' + site_nav + '\n    ' + match.group(2)
            content = pattern.sub(replacement, content, count=1)
            return content, True

    # Alternative: Insert after </header> opening's navbar/brand structure
    # If navbar uses different structure, try inserting inside header before hero-content
    hero_content_pattern = re.compile(
        r'(<header class="hero-header"[^>]*>.*?</nav>)\s*\n(\s*)(<div class="hero-content">)',
        re.DOTALL
    )
    match = hero_content_pattern.search(content)
    if match:
        replacement = match.group(1) + '\n' + HAMBURGER_BUTTON + '\n      ' + site_nav + '\n' + match.group(2) + match.group(3)
        content = hero_content_pattern.sub(replacement, content, count=1)
        return content, True

    return content, False


def upgrade_simple_nav_class(content):
    """Replace simple nav class='nav' with full nav structure and add hamburger."""

    # Pattern to find the simple nav
    simple_nav_pattern = re.compile(
        r'<nav class="nav"[^>]*>.*?</nav>',
        re.DOTALL
    )

    match = simple_nav_pattern.search(content)
    if match:
        # Replace with normalized nav
        content = simple_nav_pattern.sub(NORMALIZED_NAV, content)

        # Now add hamburger button before the nav
        # Look for brand closing tag before nav
        brand_patterns = [
            # Pattern: <a class="brand">...</a> followed by nav
            re.compile(r'(</a>)\s*\n?(\s*)(<nav class="site-nav")', re.DOTALL),
            # Pattern: </div> (brand div) followed by nav
            re.compile(r'(</div>)\s*\n?(\s*)(<nav class="site-nav")', re.DOTALL),
        ]

        for pattern in brand_patterns:
            match = pattern.search(content)
            if match:
                indent = match.group(2) if match.group(2).strip() == '' else '      '
                replacement = match.group(1) + '\n' + HAMBURGER_BUTTON + '\n' + indent + match.group(3)
                content = pattern.sub(replacement, content, count=1)
                return content, True

    return content, False


def add_hamburger_to_new_nav(content):
    """Add hamburger button to pages that have new nav structure but missing button."""

    # Try multiple patterns for finding where to insert hamburger

    # Pattern 1: Version badge before nav
    pattern = re.compile(
        r'(<span class="tiny version-badge"[^>]*>V1\.Beta</span>\s*</div>)\s*\n(\s*)(<nav class="site-nav")',
        re.MULTILINE
    )

    match = pattern.search(content)
    if match:
        indent = match.group(2)
        replacement = match.group(1) + '\n' + HAMBURGER_BUTTON + '\n' + indent + match.group(3)
        content = pattern.sub(replacement, content, count=1)

        # Also ensure nav has id="site-nav"
        content = re.sub(
            r'<nav class="site-nav"(?!\s+id="site-nav")',
            '<nav class="site-nav" id="site-nav"',
            content
        )
        return content, True

    # Pattern 2: Brand div with img ending, then nav (no version badge)
    pattern2 = re.compile(
        r'(<div class="brand">\s*<img[^>]+/>\s*</div>)\s*\n?(\s*)(<nav class="site-nav")',
        re.MULTILINE | re.DOTALL
    )
    match = pattern2.search(content)
    if match:
        indent = match.group(2) if match.group(2).strip() == '' else '      '
        replacement = match.group(1) + '\n' + HAMBURGER_BUTTON + '\n' + indent + match.group(3)
        content = pattern2.sub(replacement, content, count=1)
        content = re.sub(
            r'<nav class="site-nav"(?!\s+id="site-nav")',
            '<nav class="site-nav" id="site-nav"',
            content
        )
        return content, True

    # Pattern 3: Generic - look for </div> followed by site-nav within navbar
    pattern3 = re.compile(
        r'(<div class="navbar">.*?</div>)\s*\n?(\s*)(<nav class="site-nav"[^>]*>)',
        re.MULTILINE | re.DOTALL
    )
    match = pattern3.search(content)
    if match:
        # Make sure we're not matching the entire navbar content
        brand_match = re.search(r'(<div class="brand">.*?</div>)\s*\n?(\s*)(<nav class="site-nav")', content, re.DOTALL)
        if brand_match:
            indent = brand_match.group(2) if brand_match.group(2).strip() == '' else '            '
            replacement = brand_match.group(1) + '\n' + HAMBURGER_BUTTON + '\n' + indent + brand_match.group(3)
            content = re.sub(
                r'(<div class="brand">.*?</div>)\s*\n?(\s*)(<nav class="site-nav")',
                replacement,
                content,
                count=1,
                flags=re.DOTALL
            )
            content = re.sub(
                r'<nav class="site-nav"(?!\s+id="site-nav")',
                '<nav class="site-nav" id="site-nav"',
                content
            )
            return content, True

    return content, False


def upgrade_simplified_site_nav(content):
    """Replace simplified site-nav with full nav structure and add hamburger button."""

    # Pattern to find the simple site-nav
    simple_nav_pattern = re.compile(
        r'<nav class="site-nav">.*?</nav>',
        re.DOTALL
    )

    # First, replace the simplified nav with the full nav
    match = simple_nav_pattern.search(content)
    if match:
        content = simple_nav_pattern.sub(NORMALIZED_NAV, content)

        # Now add the hamburger button before the nav
        # Find pattern: </div> followed by the nav (after brand div)
        pattern = re.compile(
            r'(<span class="tiny version-badge"[^>]*>V1\.Beta</span></div>)\s*\n?(\s*)(<nav class="site-nav")',
            re.MULTILINE
        )

        match = pattern.search(content)
        if match:
            indent = match.group(2) if match.group(2) else '      '
            replacement = match.group(1) + '\n' + HAMBURGER_BUTTON + '\n' + indent + match.group(3)
            content = pattern.sub(replacement, content, count=1)
            return content, True

        # Try alternate pattern without line break
        pattern2 = re.compile(
            r'(</div>)(\s*)(<nav class="site-nav" id="site-nav")',
            re.MULTILINE
        )
        match = pattern2.search(content)
        if match:
            replacement = match.group(1) + '\n' + HAMBURGER_BUTTON + '\n' + match.group(2) + match.group(3)
            content = pattern2.sub(replacement, content, count=1)
            return content, True

    return content, False


def get_normalized_header():
    """Return the complete normalized header structure."""
    return '''  <a href="#main-content" class="skip-link">Skip to main content</a>
  <span role="status" aria-live="polite" aria-atomic="true" class="sr-only"></span>
  <span role="alert" aria-live="assertive" aria-atomic="true" class="sr-only"></span>

  <header class="hero-header" role="banner">
    <div class="navbar">
      <div class="brand">
        <img src="/assets/logo_wake_256.png" srcset="/assets/logo_wake_256.png 1x, /assets/logo_wake_512.png 2x" width="256" height="259" alt="In the Wake cruise travel logbook wordmark" decoding="async" loading="lazy"/>
        <span class="tiny version-badge" aria-label="Site version V1.Beta">V1.Beta</span>
      </div>
''' + HAMBURGER_BUTTON + '''
''' + NORMALIZED_NAV + '''
    </div>
  </header>'''


def replace_old_nav_structure(content):
    """Replace old-style nav with new normalized structure."""

    # Check for old header structure with site-header class
    if '<header class="site-header">' in content:
        old_header = OLD_HEADER_PATTERN.search(content)
        if old_header:
            # Replace the old header with the new normalized one
            content = OLD_HEADER_PATTERN.sub(get_normalized_header(), content)
            return content, True

    # Check for old nav structure (main-navigation)
    if '<nav class="main-navigation">' in content:
        old_nav = OLD_NAV_PATTERN.search(content)
        if old_nav:
            # Replace just the nav
            content = OLD_NAV_PATTERN.sub(NORMALIZED_NAV, content)
            return content, True

    # Check for simple header with header-container
    if '<header>' in content and '<div class="header-container">' in content:
        old_header = SIMPLE_HEADER_PATTERN.search(content)
        if old_header:
            content = SIMPLE_HEADER_PATTERN.sub(get_normalized_header(), content)
            return content, True

    # Check for simple header with container and logo
    if '<header>' in content and '<div class="container">' in content and '<div class="logo">' in content:
        # Match the entire header block
        header_pattern = re.compile(
            r'<header>\s*<div class="container">.*?</header>',
            re.DOTALL
        )
        old_header = header_pattern.search(content)
        if old_header:
            content = header_pattern.sub(get_normalized_header(), content)
            return content, True

    # Check for nav class="main-nav"
    if '<nav class="main-nav">' in content:
        old_nav = OLD_MAIN_NAV_PATTERN.search(content)
        if old_nav:
            content = OLD_MAIN_NAV_PATTERN.sub(NORMALIZED_NAV, content)
            return content, True

    return content, False


def fix_body_class(content):
    """Ensure body has class="page"."""
    if '<body>' in content and '<body class="page">' not in content:
        content = content.replace('<body>', '<body class="page">')
    return content


def fix_stylesheet_link(content):
    """Fix stylesheet links to use /assets/styles.css."""
    # Replace old stylesheet references
    content = re.sub(
        r'<link rel="stylesheet" href="/styles/main\.css"[^>]*>',
        '<link rel="stylesheet" href="/assets/styles.css?v=3.010.400"/>',
        content
    )
    return content


def process_file(filepath):
    """Process a single file and return whether it was modified."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    modified = False
    changes = []

    # Skip if already has hamburger menu
    if has_hamburger_menu(content):
        return False, []

    # Case 0: Has site-nav placed outside header (misplaced) - fix structure first
    if has_misplaced_site_nav(content):
        content, changed = fix_misplaced_site_nav(content)
        if changed:
            changes.append("Fixed misplaced site-nav and added hamburger menu")
            modified = True

    # Case 1: Has new-style nav but missing hamburger
    elif has_new_style_nav(content):
        content, changed = add_hamburger_to_new_nav(content)
        if changed:
            changes.append("Added hamburger menu button")
            modified = True

    # Case 2: Has simplified site-nav (no dropdowns) - upgrade to full nav
    elif has_simplified_site_nav(content):
        content, changed = upgrade_simplified_site_nav(content)
        if changed:
            changes.append("Upgraded simplified nav to full navigation with hamburger")
            modified = True

    # Case 3: Has simple nav class='nav' - upgrade to full nav with hamburger
    elif has_simple_nav_class(content):
        content, changed = upgrade_simple_nav_class(content)
        if changed:
            changes.append("Upgraded simple nav to full navigation with hamburger")
            modified = True

    # Case 4: Has old-style nav - replace entirely
    elif has_old_style_nav(content):
        content, changed = replace_old_nav_structure(content)
        if changed:
            changes.append("Replaced old navigation with normalized structure")
            modified = True

    # Case 5: Has hero-header but no navbar - add full navbar structure
    elif has_hero_header_no_navbar(content):
        content, changed = add_navbar_to_hero_header(content)
        if changed:
            changes.append("Added navbar structure to hero-header")
            modified = True

    # Case 6: Has ship-hero header - add navbar before it
    elif has_ship_hero_header(content):
        content, changed = add_navbar_to_ship_hero(content)
        if changed:
            changes.append("Added navbar header before ship-hero")
            modified = True

    # Case 7: Has hero-header with minimal navbar (brand only) - upgrade to full navbar
    elif has_hero_header_minimal_navbar(content):
        content, changed = upgrade_minimal_navbar(content)
        if changed:
            changes.append("Upgraded minimal navbar to full navigation")
            modified = True

    # Case 8: Has ship-hero section (not header) - add navbar before it
    elif has_ship_hero_section(content):
        content, changed = add_navbar_before_ship_hero_section(content)
        if changed:
            changes.append("Added navbar before ship-hero section")
            modified = True

    # Fix body class
    old_content = content
    content = fix_body_class(content)
    if content != old_content:
        changes.append("Fixed body class")
        modified = True

    # Fix stylesheet link
    old_content = content
    content = fix_stylesheet_link(content)
    if content != old_content:
        changes.append("Fixed stylesheet link")
        modified = True

    if modified and content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True, changes

    return False, []


def main():
    """Main entry point."""
    import sys

    # Check if specific directory was provided
    if len(sys.argv) > 1:
        target = sys.argv[1]
        if target == '--all':
            # Process all HTML files except vendor and solo/articles
            root_dir = Path('.')
            files = []
            for f in root_dir.rglob('*.html'):
                # Skip vendor and solo/articles directories
                path_str = str(f)
                if '/vendor/' in path_str or path_str.startswith('vendor/'):
                    continue
                if '/solo/articles/' in path_str or path_str.startswith('solo/articles/'):
                    continue
                # Skip admin reports
                if '/admin/reports/' in path_str or path_str.startswith('admin/reports/'):
                    continue
                files.append(f)
            files = sorted(files)
            print(f"\nProcessing {len(files)} HTML files site-wide...\n")
        else:
            target_dir = Path(target)
            if not target_dir.exists():
                print(f"Error: {target} directory not found")
                return
            files = sorted(target_dir.rglob('*.html'))
            print(f"\nProcessing {len(files)} files in {target}...\n")
    else:
        # Default: ports directory only
        ports_dir = Path('ports')
        if not ports_dir.exists():
            print("Error: ports directory not found")
            return
        files = sorted(ports_dir.glob('*.html'))
        print(f"\nProcessing {len(files)} port pages...\n")

    updated = 0
    skipped = 0
    errors = 0

    for filepath in files:
        try:
            modified, changes = process_file(filepath)
            if modified:
                print(f"✓ {filepath.name}")
                for change in changes:
                    print(f"  - {change}")
                updated += 1
            else:
                skipped += 1
        except Exception as e:
            print(f"✗ {filepath.name}: {e}")
            errors += 1

    print(f"\n{'='*60}")
    print(f"Updated: {updated} | Skipped: {skipped} | Errors: {errors}")
    print(f"{'='*60}\n")


if __name__ == '__main__':
    main()
