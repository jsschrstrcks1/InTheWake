#!/usr/bin/env python3
"""
Fix navigation dropdown menus across the site.

This script adds the missing dropdown JavaScript to pages that have
the dropdown HTML structure but lack the JavaScript implementation.

Fixes:
- Restaurant detail pages (129 files) - Add dropdown JS
- Port detail pages with nav (72 files) - Add dropdown JS
"""

import os
import re
from pathlib import Path

# Standard dropdown JavaScript to inject
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

def has_nav_group(content):
    """Check if file has nav-group HTML structure."""
    return 'class="nav-group"' in content or 'class="nav-item nav-group"' in content

def has_dropdown_js(content):
    """Check if file already has dropdown JavaScript."""
    return 'dropdownGroups' in content or 'HOVER_DELAY = 300' in content

def add_dropdown_js(filepath):
    """Add dropdown JavaScript to a file before </body>."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if already has the JS
    if has_dropdown_js(content):
        return False, "Already has dropdown JS"

    # Check if has nav-group structure
    if not has_nav_group(content):
        return False, "No nav-group structure found"

    # Find </body> tag
    if '</body>' not in content:
        return False, "No </body> tag found"

    # Insert JS before </body>
    content = content.replace('</body>', f'{DROPDOWN_JS}\n</body>', 1)

    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    return True, "Added dropdown JS"

def main():
    """Fix all restaurant and port detail pages."""
    base_dir = Path('/home/user/InTheWake')

    # Track statistics
    stats = {
        'restaurant_fixed': 0,
        'restaurant_skipped': 0,
        'port_fixed': 0,
        'port_skipped': 0,
        'errors': 0
    }

    print("=" * 70)
    print("FIXING NAVIGATION DROPDOWN JAVASCRIPT")
    print("=" * 70)

    # Fix restaurant detail pages
    print("\n📝 Processing restaurant detail pages...")
    restaurant_dir = base_dir / 'restaurants'
    if restaurant_dir.exists():
        for filepath in sorted(restaurant_dir.glob('*.html')):
            # Skip the hub page
            if filepath.name == 'index.html':
                continue

            try:
                success, message = add_dropdown_js(filepath)
                if success:
                    stats['restaurant_fixed'] += 1
                    print(f"  ✓ {filepath.name}")
                else:
                    stats['restaurant_skipped'] += 1
                    if 'No nav-group' not in message and 'Already has' not in message:
                        print(f"  ⊘ {filepath.name}: {message}")
            except Exception as e:
                stats['errors'] += 1
                print(f"  ✗ {filepath.name}: {e}")

    # Fix port detail pages
    print("\n🌍 Processing port detail pages...")
    port_dir = base_dir / 'ports'
    if port_dir.exists():
        for filepath in sorted(port_dir.glob('*.html')):
            # Skip the hub page
            if filepath.name in ('index.html', 'ports.html'):
                continue

            try:
                success, message = add_dropdown_js(filepath)
                if success:
                    stats['port_fixed'] += 1
                    print(f"  ✓ {filepath.name}")
                else:
                    stats['port_skipped'] += 1
                    # Don't print "No nav-group" messages for ports (expected)
                    if 'No nav-group' not in message and 'Already has' not in message:
                        print(f"  ⊘ {filepath.name}: {message}")
            except Exception as e:
                stats['errors'] += 1
                print(f"  ✗ {filepath.name}: {e}")

    # Print summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Restaurant pages fixed: {stats['restaurant_fixed']}")
    print(f"Restaurant pages skipped: {stats['restaurant_skipped']}")
    print(f"Port pages fixed: {stats['port_fixed']}")
    print(f"Port pages skipped: {stats['port_skipped']}")
    print(f"Errors: {stats['errors']}")
    print(f"\nTotal pages fixed: {stats['restaurant_fixed'] + stats['port_fixed']}")

if __name__ == '__main__':
    main()
