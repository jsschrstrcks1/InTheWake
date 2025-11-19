#!/usr/bin/env python3
"""
Add Drink Packages link to navigation dropdown site-wide.
Places it just above Drink Calculator in the Planning dropdown.
"""

import re
from pathlib import Path

def add_drink_packages_link(content: str) -> tuple[str, bool]:
    """
    Add Drink Packages link above Drink Calculator in the Planning submenu.
    Returns (new_content, was_modified).
    """

    # Skip if already has drink-packages in nav
    if 'href="/drink-packages.html"' in content:
        return content, False

    # Pattern to find the Drink Calculator link in the Planning submenu
    # We want to insert Drink Packages just before it
    patterns = [
        # Standard format with role="menuitem"
        (
            r'(<a\s+role="menuitem"\s+href="/drink-calculator\.html">Drink Calculator</a>)',
            '<a role="menuitem" href="/drink-packages.html">Drink Packages</a>\n            \\1'
        ),
        # Without role attribute
        (
            r'(<a\s+href="/drink-calculator\.html">Drink Calculator</a>)',
            '<a href="/drink-packages.html">Drink Packages</a>\n            \\1'
        ),
    ]

    for pattern, replacement in patterns:
        if re.search(pattern, content):
            new_content = re.sub(pattern, replacement, content)
            if new_content != content:
                return new_content, True

    return content, False

def main():
    project_root = Path(__file__).parent.parent

    # Find all HTML files
    html_files = list(project_root.rglob('*.html'))

    # Exclude certain directories
    exclude_dirs = {'vendors', 'node_modules', '.git'}
    html_files = [f for f in html_files if not any(d in f.parts for d in exclude_dirs)]

    print(f"Checking {len(html_files)} HTML files for navigation update...")

    updated = 0
    skipped = 0
    errors = []

    for filepath in html_files:
        try:
            content = filepath.read_text(encoding='utf-8')
            new_content, was_modified = add_drink_packages_link(content)

            if was_modified:
                filepath.write_text(new_content, encoding='utf-8')
                print(f"  ✓ {filepath.relative_to(project_root)}")
                updated += 1
            else:
                skipped += 1

        except Exception as e:
            errors.append((filepath.name, str(e)))

    print(f"\nSummary:")
    print(f"  Updated: {updated}")
    print(f"  Skipped: {skipped}")

    if errors:
        print(f"  Errors: {len(errors)}")
        for name, err in errors:
            print(f"    - {name}: {err}")

if __name__ == "__main__":
    main()
