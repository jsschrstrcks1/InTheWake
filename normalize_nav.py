#!/usr/bin/env python3
"""
Navigation Normalization Script for In the Wake
Version: 1.0.0

This script replaces old pill-nav navigation with new dropdown navigation structure
across all HTML files in the codebase.

Features:
- Preserves aria-current="page" attributes
- Maps old links to new dropdown structure
- Adds dropdown JavaScript if missing
- Updates version badges to v3.010.300
- Handles variations in link URLs (absolute/relative)
"""

import re
import sys
from pathlib import Path
from typing import Dict, Optional, Tuple

# New navigation HTML structure (from index.html lines 753-789)
NEW_NAV_TEMPLATE = '''<!-- Navigation with Dropdown Menus -->
      <nav class="nav" aria-label="Main site navigation">
        <div class="nav-item">
          <a href="/"{{HOME_CURRENT}}>Home</a>
        </div>

        <!-- Planning Dropdown -->
        <div class="nav-item nav-group" id="nav-planning" data-open="false">
          <button class="nav-disclosure" type="button" aria-expanded="false" aria-haspopup="true" aria-controls="menu-planning"{{PLANNING_CURRENT}}>
            Planning <span class="caret">▾</span>
          </button>
          <div id="menu-planning" class="submenu" role="menu" aria-label="Planning submenu">
            <a role="menuitem" href="/planning.html"{{PLANNING_OVERVIEW_CURRENT}}>Planning (overview)</a>
            <a role="menuitem" href="/ships.html"{{SHIPS_CURRENT}}>Ships</a>
            <a role="menuitem" href="/restaurants.html"{{RESTAURANTS_CURRENT}}>Restaurants &amp; Menus</a>
            <a role="menuitem" href="/ports.html"{{PORTS_CURRENT}}>Ports</a>
            <a role="menuitem" href="/drink-calculator.html"{{DRINKS_CURRENT}}>Drink Calculator</a>
            <a role="menuitem" href="/cruise-lines.html"{{CRUISE_LINES_CURRENT}}>Cruise Lines</a>
            <a role="menuitem" href="/packing-lists.html"{{PACKING_CURRENT}}>Packing Lists</a>
            <a role="menuitem" href="/accessibility.html"{{ACCESSIBILITY_CURRENT}}>Accessibility</a>
          </div>
        </div>

        <!-- Travel Dropdown -->
        <div class="nav-item nav-group" id="nav-travel" data-open="false">
          <button class="nav-disclosure" type="button" aria-expanded="false" aria-haspopup="true" aria-controls="menu-travel"{{TRAVEL_CURRENT}}>
            Travel <span class="caret">▾</span>
          </button>
          <div id="menu-travel" class="submenu" role="menu" aria-label="Travel submenu">
            <a role="menuitem" href="/travel.html"{{TRAVEL_OVERVIEW_CURRENT}}>Travel (overview)</a>
            <a role="menuitem" href="/solo.html"{{SOLO_CURRENT}}>Solo</a>
          </div>
        </div>

        <div class="nav-item">
          <a href="/about-us.html"{{ABOUT_CURRENT}}>About</a>
        </div>
      </nav>'''

# Dropdown JavaScript (from index.html lines 975-1073)
DROPDOWN_JAVASCRIPT = '''
  <!-- JAVASCRIPT -->
  <script>
  (function(){
    "use strict";

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
  </script>'''

# URL mapping dictionary - maps old URLs to new nav placeholders
URL_MAPPING = {
    # Home
    '/': 'HOME',
    '/index.html': 'HOME',

    # Planning dropdown items
    '/planning.html': 'PLANNING_OVERVIEW',
    '/ships.html': 'SHIPS',
    '/ships/ships.html': 'SHIPS',
    '/restaurants.html': 'RESTAURANTS',
    '/ports.html': 'PORTS',
    '/drink-calculator.html': 'DRINKS',
    '/drinks.html': 'DRINKS',
    '/drink-packages.html': 'DRINKS',
    '/cruise-lines.html': 'CRUISE_LINES',
    '/packing-lists.html': 'PACKING',
    '/packing.html': 'PACKING',
    '/accessibility.html': 'ACCESSIBILITY',
    '/disability.html': 'ACCESSIBILITY',
    '/disability-at-sea.html': 'ACCESSIBILITY',

    # Travel dropdown items
    '/travel.html': 'TRAVEL_OVERVIEW',
    '/solo.html': 'SOLO',

    # About
    '/about-us.html': 'ABOUT',
}

# Dropdown parent mapping - which items should also mark their parent dropdown as current
DROPDOWN_PARENTS = {
    'PLANNING_OVERVIEW': 'PLANNING',
    'SHIPS': 'PLANNING',
    'RESTAURANTS': 'PLANNING',
    'PORTS': 'PLANNING',
    'DRINKS': 'PLANNING',
    'CRUISE_LINES': 'PLANNING',
    'PACKING': 'PLANNING',
    'ACCESSIBILITY': 'PLANNING',
    'TRAVEL_OVERVIEW': 'TRAVEL',
    'SOLO': 'TRAVEL',
}


def normalize_url(url: str) -> str:
    """Normalize URL by removing domain and cleaning up."""
    # Remove domain if present
    url = re.sub(r'^https?://[^/]+', '', url)
    # Remove trailing slashes
    url = url.rstrip('/')
    # If empty, return root
    if not url:
        return '/'
    # Ensure leading slash
    if not url.startswith('/'):
        url = '/' + url
    return url


def find_current_page(nav_html: str) -> Optional[str]:
    """Find which link has aria-current='page' in the old nav."""
    # Pattern to find links with aria-current="page"
    pattern = r'<a[^>]*href=["\']([^"\']+)["\'][^>]*aria-current=["\']page["\']|<a[^>]*aria-current=["\']page["\'][^>]*href=["\']([^"\']+)["\']'
    match = re.search(pattern, nav_html, re.IGNORECASE)

    if match:
        url = match.group(1) or match.group(2)
        return normalize_url(url)

    return None


def create_new_nav(current_url: Optional[str]) -> str:
    """Create new navigation HTML with appropriate aria-current attributes."""
    # Start with all placeholders empty
    placeholders = {
        'HOME_CURRENT': '',
        'PLANNING_CURRENT': '',
        'PLANNING_OVERVIEW_CURRENT': '',
        'SHIPS_CURRENT': '',
        'RESTAURANTS_CURRENT': '',
        'PORTS_CURRENT': '',
        'DRINKS_CURRENT': '',
        'CRUISE_LINES_CURRENT': '',
        'PACKING_CURRENT': '',
        'ACCESSIBILITY_CURRENT': '',
        'TRAVEL_CURRENT': '',
        'TRAVEL_OVERVIEW_CURRENT': '',
        'SOLO_CURRENT': '',
        'ABOUT_CURRENT': '',
    }

    if current_url:
        # Map the current URL to a placeholder
        mapped_key = URL_MAPPING.get(current_url)

        if mapped_key:
            # Set aria-current on the specific item
            placeholders[f'{mapped_key}_CURRENT'] = ' aria-current="page"'

            # Also set it on the parent dropdown button if applicable
            if mapped_key in DROPDOWN_PARENTS:
                parent = DROPDOWN_PARENTS[mapped_key]
                placeholders[f'{parent}_CURRENT'] = ' aria-current="page"'

    # Replace all placeholders in the template
    new_nav = NEW_NAV_TEMPLATE
    for key, value in placeholders.items():
        new_nav = new_nav.replace('{{' + key + '}}', value)

    return new_nav


def replace_navigation(html_content: str) -> Tuple[str, bool]:
    """Replace old pill-nav with new dropdown navigation."""
    # Pattern to match the old navigation (pill-nav)
    # This pattern captures from <nav class="pill-nav to </nav>
    nav_pattern = r'<nav\s+class=["\']pill-nav[^"\']*["\'][^>]*>.*?</nav>'

    match = re.search(nav_pattern, html_content, re.DOTALL | re.IGNORECASE)

    if not match:
        return html_content, False

    old_nav = match.group(0)

    # Find current page from old nav
    current_url = find_current_page(old_nav)

    # Create new nav with appropriate aria-current
    new_nav = create_new_nav(current_url)

    # Replace old nav with new nav
    updated_content = html_content.replace(old_nav, new_nav)

    return updated_content, True


def add_dropdown_javascript(html_content: str) -> Tuple[str, bool]:
    """Add dropdown JavaScript before </body> if not already present."""
    # Check if the dropdown JavaScript is already present
    if 'Dropdown Menu with 300ms Hover Delay' in html_content:
        return html_content, False

    # Find </body> tag
    body_pattern = r'</body>'
    match = re.search(body_pattern, html_content, re.IGNORECASE)

    if not match:
        return html_content, False

    # Insert JavaScript before </body>
    updated_content = re.sub(
        body_pattern,
        DROPDOWN_JAVASCRIPT + '\n</body>',
        html_content,
        count=1,
        flags=re.IGNORECASE
    )

    return updated_content, True


def update_version_badge(html_content: str) -> Tuple[str, bool]:
    """Update version badge to v3.010.300."""
    # Pattern to match version badges
    patterns = [
        (r'v\d+\.\d+\.\d+', 'v3.010.300'),
        (r'version["\s]*:["\s]*["\']?\d+\.\d+\.\d+["\']?', 'version: 3.010.300'),
        (r'<meta\s+name=["\']version["\']\s+content=["\']([^"\']+)["\']',
         '<meta name="version" content="3.010.300"'),
    ]

    updated = False
    updated_content = html_content

    for pattern, replacement in patterns:
        if re.search(pattern, updated_content):
            # Only replace if not already at target version
            if '3.010.300' not in re.search(pattern, updated_content).group(0):
                updated_content = re.sub(pattern, replacement, updated_content)
                updated = True

    return updated_content, updated


def process_file(file_path: Path, dry_run: bool = False) -> Dict[str, bool]:
    """Process a single HTML file."""
    results = {
        'nav_replaced': False,
        'js_added': False,
        'version_updated': False,
        'file_modified': False,
    }

    try:
        # Read file
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Replace navigation
        content, nav_replaced = replace_navigation(content)
        results['nav_replaced'] = nav_replaced

        # Add JavaScript
        content, js_added = add_dropdown_javascript(content)
        results['js_added'] = js_added

        # Update version
        content, version_updated = update_version_badge(content)
        results['version_updated'] = version_updated

        # Check if file was modified
        results['file_modified'] = content != original_content

        # Write file if modified and not dry run
        if results['file_modified'] and not dry_run:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)

        return results

    except Exception as e:
        print(f"Error processing {file_path}: {e}", file=sys.stderr)
        return results


def main():
    """Main execution function."""
    import argparse

    parser = argparse.ArgumentParser(
        description='Normalize navigation across HTML files'
    )
    parser.add_argument(
        'files',
        nargs='*',
        help='Files to process (if empty, uses predefined list)'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be changed without modifying files'
    )
    parser.add_argument(
        '--test-one',
        action='store_true',
        help='Test on one file first (restaurants/mdr.html)'
    )

    args = parser.parse_args()

    # Default file list
    default_files = [
        '/home/user/InTheWake/admin/reports/articles.html',
        '/home/user/InTheWake/cruise-lines/carnival.html',
        '/home/user/InTheWake/cruise-lines/celebrity.html',
        '/home/user/InTheWake/cruise-lines/disney.html',
        '/home/user/InTheWake/cruise-lines/holland-america.html',
        '/home/user/InTheWake/cruise-lines/msc.html',
        '/home/user/InTheWake/cruise-lines/norwegian.html',
        '/home/user/InTheWake/cruise-lines/princess.html',
        '/home/user/InTheWake/cruise-lines/royal-caribbean.html',
        '/home/user/InTheWake/cruise-lines/viking.html',
        '/home/user/InTheWake/cruise-lines/virgin.html',
        '/home/user/InTheWake/restaurants/aquadome-market.html',
        '/home/user/InTheWake/restaurants/basecamp.html',
        '/home/user/InTheWake/restaurants/cafe-promenade.html',
        '/home/user/InTheWake/restaurants/cafe-two70.html',
        '/home/user/InTheWake/restaurants/chefs-table.html',
        '/home/user/InTheWake/restaurants/chops.html',
        '/home/user/InTheWake/restaurants/coastal-kitchen.html',
        '/home/user/InTheWake/restaurants/diamond-lounge.html',
        '/home/user/InTheWake/restaurants/dining-activities.html',
        '/home/user/InTheWake/restaurants/dog-house.html',
        '/home/user/InTheWake/restaurants/el-loco-fresh.html',
        '/home/user/InTheWake/restaurants/giovannis.html',
        '/home/user/InTheWake/restaurants/izumi.html',
        '/home/user/InTheWake/restaurants/latte-tudes.html',
        '/home/user/InTheWake/restaurants/mdr.html',
        '/home/user/InTheWake/restaurants/park-cafe.html',
        '/home/user/InTheWake/restaurants/pearl-cafe.html',
        '/home/user/InTheWake/restaurants/room-service.html',
        '/home/user/InTheWake/restaurants/samba-grill.html',
        '/home/user/InTheWake/restaurants/solarium-bistro.html',
        '/home/user/InTheWake/restaurants/sorrentos.html',
        '/home/user/InTheWake/restaurants/surfside-eatery.html',
        '/home/user/InTheWake/restaurants/the-grove.html',
        '/home/user/InTheWake/restaurants/vitality-cafe.html',
        '/home/user/InTheWake/restaurants/windjammer.html',
        '/home/user/InTheWake/ships/grandeur-of-the-seas.html',
    ]

    # Determine files to process
    if args.test_one:
        files_to_process = ['/home/user/InTheWake/restaurants/mdr.html']
    elif args.files:
        files_to_process = args.files
    else:
        files_to_process = default_files

    # Process files
    total = len(files_to_process)
    processed = 0
    nav_replaced_count = 0
    js_added_count = 0
    version_updated_count = 0
    errors = 0

    print(f"{'DRY RUN: ' if args.dry_run else ''}Processing {total} files...\n")

    for file_path_str in files_to_process:
        file_path = Path(file_path_str)

        if not file_path.exists():
            print(f"❌ File not found: {file_path}")
            errors += 1
            continue

        results = process_file(file_path, dry_run=args.dry_run)

        if results['file_modified']:
            processed += 1
            status = []
            if results['nav_replaced']:
                nav_replaced_count += 1
                status.append('nav')
            if results['js_added']:
                js_added_count += 1
                status.append('js')
            if results['version_updated']:
                version_updated_count += 1
                status.append('version')

            status_str = ', '.join(status)
            print(f"✓ {file_path.name}: {status_str}")
        else:
            print(f"○ {file_path.name}: no changes needed")

    # Summary
    print(f"\n{'=' * 60}")
    print("Summary:")
    print(f"  Total files: {total}")
    print(f"  Modified: {processed}")
    print(f"  Navigation replaced: {nav_replaced_count}")
    print(f"  JavaScript added: {js_added_count}")
    print(f"  Version updated: {version_updated_count}")
    print(f"  Errors: {errors}")

    if args.dry_run:
        print("\n⚠️  DRY RUN - No files were actually modified")
        print("   Run without --dry-run to apply changes")


if __name__ == '__main__':
    main()
