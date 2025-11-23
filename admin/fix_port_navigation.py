#!/usr/bin/env python3
"""
Add full navigation header to port pages that are missing it.

Adds:
- Skip link for accessibility
- Full navigation header with dropdowns
- Hero section with branding
- Dropdown JavaScript
"""

import os
import re
from pathlib import Path

# Standard navigation header to inject
NAV_HEADER = '''<body class="page">
  <a href="#main-content" class="skip-link">Skip to main content</a>


  <header class="hero-header" role="banner">
    <div class="navbar">
      <div class="brand">
        <img src="/assets/logo_wake_256.png" srcset="/assets/logo_wake_256.png 1x, /assets/logo_wake_512.png 2x" width="256" height="259" alt="In the Wake wordmark" decoding="async"/>
        <span class="tiny version-badge" aria-label="Site version 3.010.300">v3.010.300</span>
      </div>
      <nav class="nav" aria-label="Main site navigation">
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
            <a role="menuitem" href="/drink-packages.html">Drink Packages</a>
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
      </nav>
    </div>

    <!-- Hero -->
    <div class="hero">
      <img class="hero-compass" src="/assets/compass_rose.svg?v=3.010.300" width="180" height="180" alt="" aria-hidden="true" decoding="async"/>
      <div class="hero-title">
        <img class="logo" src="/assets/logo_wake_560.png" srcset="/assets/logo_wake_560.png 1x, /assets/logo_wake_1120.png 2x" alt="In the Wake" decoding="async" fetchpriority="high" width="560" height="567"/>
      </div>
      <div class="tagline" aria-hidden="true">A Cruise Traveler's Logbook</div>
      <div class="hero-credit">
        <a class="pill" href="https://www.flickersofmajesty.com" target="_blank" rel="noopener">Photo © Flickers of Majesty</a>
      </div>
    </div>
  </header>

  <main'''

# Dropdown JavaScript
DROPDOWN_JS = '''
  <!-- Dropdown nav behavior (300ms Hover Delay) -->
  <script>
  (function(){"use strict";
    /* ===== Dropdown Menu with 300ms Hover Delay ===== */
    const dropdownGroups = Array.from(document.querySelectorAll('.nav-group'));
    if (dropdownGroups.length) {
      const hoverTimeouts = new Map();
      const HOVER_DELAY = 300;

      function setOpen(group, isOpen) {
        group.dataset.open = isOpen ? "true" : "false";
        const button = group.querySelector('.nav-disclosure');
        if (button) {
          button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        }
      }

      function closeAll(except = null) {
        dropdownGroups.forEach(group => {
          if (group !== except) {
            setOpen(group, false);
            if (hoverTimeouts.has(group)) {
              clearTimeout(hoverTimeouts.get(group));
              hoverTimeouts.delete(group);
            }
          }
        });
      }

      dropdownGroups.forEach(group => {
        const button = group.querySelector('.nav-disclosure');
        const menu = group.querySelector('.submenu');
        if (!button || !menu) return;

        // Click to toggle
        button.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const isOpen = group.dataset.open === "true";
          closeAll(group);
          setOpen(group, !isOpen);
        });

        // Mouse enter: Open immediately
        group.addEventListener('mouseenter', () => {
          if (hoverTimeouts.has(group)) {
            clearTimeout(hoverTimeouts.get(group));
            hoverTimeouts.delete(group);
          }
          closeAll(group);
          setOpen(group, true);
        });

        // Mouse leave: Close after delay
        group.addEventListener('mouseleave', () => {
          const timeoutId = setTimeout(() => {
            setOpen(group, false);
            hoverTimeouts.delete(group);
          }, HOVER_DELAY);
          hoverTimeouts.set(group, timeoutId);
        });

        // Keyboard navigation
        group.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            setOpen(group, false);
            button && button.focus();
          }
          if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && document.activeElement === button) {
            e.preventDefault();
            setOpen(group, true);
            const firstLink = menu.querySelector('a, button, [tabindex]:not([tabindex="-1"])');
            firstLink && firstLink.focus();
          }
        });

        // Close when tabbing away
        menu.addEventListener('focusout', () => {
          setTimeout(() => {
            if (!group.contains(document.activeElement)) {
              setOpen(group, false);
            }
          }, 0);
        });
      });

      // Close all when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-group')) {
          closeAll();
        }
      });

      // Close all when window loses focus
      window.addEventListener('blur', () => {
        closeAll();
      });
    }
  })();
  </script>
'''

def add_navigation_header(filepath):
    """Add full navigation header to a port page."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip if already has header
    if '<header class="hero-header"' in content:
        return False, "Already has navigation header"

    # Skip if already has nav-group
    if 'class="nav-group"' in content:
        return False, "Already has nav structure"

    # Find the body tag and main tag
    if '<body class="page">' not in content:
        return False, "Unexpected body structure"

    if '<main' not in content:
        return False, "No main tag found"

    # Replace <body class="page">\n  <main with the new header
    pattern = r'<body class="page">\s*<main'
    if not re.search(pattern, content):
        return False, "Cannot find insertion point"

    # Do the replacement
    content = re.sub(pattern, NAV_HEADER, content, count=1)

    # Add dropdown JavaScript before </body>
    if 'dropdownGroups' not in content and '</body>' in content:
        content = content.replace('</body>', f'{DROPDOWN_JS}\n</body>', 1)

    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    return True, "Added navigation header"

def main():
    """Fix all port pages missing navigation."""
    base_dir = Path('/home/user/InTheWake')
    port_dir = base_dir / 'ports'

    # Track statistics
    stats = {
        'fixed': 0,
        'skipped': 0,
        'errors': 0
    }

    print("=" * 70)
    print("ADDING NAVIGATION HEADERS TO PORT PAGES")
    print("=" * 70)

    if not port_dir.exists():
        print(f"\n✗ Port directory not found: {port_dir}")
        return

    print("\n🌍 Processing port pages...")
    for filepath in sorted(port_dir.glob('*.html')):
        # Skip hub pages
        if filepath.name in ('index.html', 'ports.html'):
            continue

        try:
            success, message = add_navigation_header(filepath)
            if success:
                stats['fixed'] += 1
                print(f"  ✓ {filepath.name}")
            else:
                stats['skipped'] += 1
                # Only show non-obvious skips
                if 'Already has' not in message:
                    print(f"  ⊘ {filepath.name}: {message}")
        except Exception as e:
            stats['errors'] += 1
            print(f"  ✗ {filepath.name}: {e}")

    # Print summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Port pages fixed: {stats['fixed']}")
    print(f"Port pages skipped: {stats['skipped']}")
    print(f"Errors: {stats['errors']}")

if __name__ == '__main__':
    main()
