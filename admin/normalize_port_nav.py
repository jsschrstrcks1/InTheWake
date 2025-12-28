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


def add_hamburger_to_new_nav(content):
    """Add hamburger button to pages that have new nav structure but missing button."""

    # Find the end of the brand div and start of nav
    # Look for pattern: </span></div> followed by <nav
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

    # Case 1: Has new-style nav but missing hamburger
    if has_new_style_nav(content):
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

    # Case 3: Has old-style nav - replace entirely
    elif has_old_style_nav(content):
        content, changed = replace_old_nav_structure(content)
        if changed:
            changes.append("Replaced old navigation with normalized structure")
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
