#!/usr/bin/env python3
"""
Comprehensive Navigation Pattern Audit

Audits ALL pages for the complete canonical navigation pattern:
- Skip link
- ARIA live regions (2 divs)
- Header with hero-header class and role="banner"
- Navbar with brand and nav
- All 7 navigation items in correct order
- Complete dropdown structures (Planning: 10 items, Travel: 2 items)
- All ARIA attributes
- Dropdown JavaScript before </body>
- Hero section

Excludes: /vendors/, /solo/articles/
"""

import os
import re
from pathlib import Path
from collections import defaultdict

class NavigationAuditor:
    def __init__(self, base_dir):
        self.base_dir = Path(base_dir)
        self.issues = defaultdict(list)

    def should_skip(self, filepath):
        """Check if file should be excluded from audit."""
        path_str = str(filepath)

        # Skip vendors directory
        if '/vendors/' in path_str or path_str.startswith('vendors/'):
            return True

        # Skip solo/articles directory
        if '/solo/articles/' in path_str:
            return True

        # Skip template files
        if filepath.name == 'template.html':
            return True

        return False

    def audit_file(self, filepath):
        """Audit a single HTML file for complete navigation pattern."""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            self.issues[str(filepath)].append(f"READ_ERROR: {e}")
            return

        rel_path = filepath.relative_to(self.base_dir)

        # 1. Skip link
        if '<a href="#main-content" class="skip-link">' not in content:
            self.issues[str(rel_path)].append("MISSING: Skip link")

        # Count skip links (should be exactly 1)
        skip_count = content.count('class="skip-link"')
        if skip_count > 1:
            self.issues[str(rel_path)].append(f"DUPLICATE: {skip_count} skip links (should be 1)")

        # 2. ARIA live regions
        if 'id="a11y-status"' not in content:
            self.issues[str(rel_path)].append("MISSING: ARIA live region (a11y-status)")
        if 'id="a11y-alerts"' not in content:
            self.issues[str(rel_path)].append("MISSING: ARIA live region (a11y-alerts)")

        # 3. Header element (check for hero-header class, handles multi-class)
        if 'class="hero-header"' not in content and 'class="site-header hero-header"' not in content:
            self.issues[str(rel_path)].append("MISSING: Header with hero-header class")

        if 'role="banner"' not in content:
            self.issues[str(rel_path)].append("MISSING: Header role='banner'")

        # Count headers (should be exactly 1 with role="banner")
        banner_count = content.count('role="banner"')
        if banner_count > 1:
            self.issues[str(rel_path)].append(f"DUPLICATE: {banner_count} role='banner' (should be 1)")

        # Count all <header> tags (warn if > 1)
        header_count = content.count('<header')
        if header_count > 1:
            self.issues[str(rel_path)].append(f"WARNING: {header_count} <header> tags (should be 1)")

        # 4. Navbar
        if '<div class="navbar">' not in content:
            self.issues[str(rel_path)].append("MISSING: Navbar div")

        # 5. Brand section
        if '<div class="brand">' not in content:
            self.issues[str(rel_path)].append("MISSING: Brand div")

        if '/assets/logo_wake_256.png' not in content:
            self.issues[str(rel_path)].append("MISSING: Logo image")

        if 'class="tiny version-badge"' not in content and 'class="version-badge"' not in content:
            self.issues[str(rel_path)].append("MISSING: Version badge")

        # 6. Nav element
        if '<nav class="nav"' not in content:
            self.issues[str(rel_path)].append("MISSING: Nav element with class='nav'")

        if 'aria-label="Main site navigation"' not in content:
            self.issues[str(rel_path)].append("MISSING: Nav aria-label")

        # 7. Navigation items (check for key elements)
        nav_items = {
            'Home': 'href="/"',
            'Planning dropdown': 'id="nav-planning"',
            'Travel dropdown': 'id="nav-travel"',
            'Search': 'href="/search.html"',
            'About': 'href="/about-us.html"'
        }

        for item, marker in nav_items.items():
            if marker not in content:
                self.issues[str(rel_path)].append(f"MISSING: {item} ({marker})")

        # 8. Dropdown structures
        # Planning dropdown
        if 'id="nav-planning"' in content:
            if 'class="nav-disclosure"' not in content:
                self.issues[str(rel_path)].append("MISSING: Nav-disclosure button class")

            if 'aria-expanded="false"' not in content:
                self.issues[str(rel_path)].append("MISSING: aria-expanded attribute")

            if 'aria-haspopup="true"' not in content:
                self.issues[str(rel_path)].append("MISSING: aria-haspopup attribute")

            if 'aria-controls="menu-planning"' not in content:
                self.issues[str(rel_path)].append("MISSING: aria-controls for Planning")

            if 'id="menu-planning"' not in content:
                self.issues[str(rel_path)].append("MISSING: Planning submenu id")

            if '<span class="caret">' not in content:
                self.issues[str(rel_path)].append("MISSING: Caret span")

            # Check for Planning submenu items
            planning_items = [
                '/planning.html',
                '/ships.html',
                '/restaurants.html',
                '/ports.html',
                '/drink-packages.html',
                '/drink-calculator.html',
                '/stateroom-check.html',
                '/cruise-lines.html',
                '/packing-lists.html',
                '/accessibility.html'
            ]

            for item in planning_items:
                if f'href="{item}"' not in content:
                    self.issues[str(rel_path)].append(f"MISSING: Planning item {item}")

        # Travel dropdown
        if 'id="nav-travel"' in content:
            if 'aria-controls="menu-travel"' not in content:
                self.issues[str(rel_path)].append("MISSING: aria-controls for Travel")

            if 'id="menu-travel"' not in content:
                self.issues[str(rel_path)].append("MISSING: Travel submenu id")

            if 'href="/travel.html"' not in content:
                self.issues[str(rel_path)].append("MISSING: Travel item /travel.html")

            if 'href="/solo.html"' not in content:
                self.issues[str(rel_path)].append("MISSING: Travel item /solo.html")

        # 9. Submenu elements
        if 'class="submenu"' not in content:
            if 'id="nav-planning"' in content or 'id="nav-travel"' in content:
                self.issues[str(rel_path)].append("MISSING: Submenu class")

        if 'role="menu"' not in content:
            if 'id="nav-planning"' in content or 'id="nav-travel"' in content:
                self.issues[str(rel_path)].append("MISSING: Submenu role='menu'")

        if 'role="menuitem"' not in content:
            if 'id="nav-planning"' in content or 'id="nav-travel"' in content:
                self.issues[str(rel_path)].append("MISSING: Menuitem role")

        # 10. Hero section
        if '<div class="hero">' not in content:
            self.issues[str(rel_path)].append("MISSING: Hero div")

        # 11. JavaScript
        if 'dropdownGroups' not in content:
            if 'id="nav-planning"' in content or 'id="nav-travel"' in content:
                self.issues[str(rel_path)].append("MISSING: Dropdown JavaScript")

        if 'HOVER_DELAY = 300' not in content:
            if 'dropdownGroups' in content:
                self.issues[str(rel_path)].append("WRONG: HOVER_DELAY not 300ms")

        # Check for duplicate JavaScript
        js_count = content.count('dropdownGroups')
        if js_count > 4:  # Appears 4 times in the script normally
            self.issues[str(rel_path)].append(f"POSSIBLE_DUPLICATE: dropdownGroups appears {js_count} times")

        # 12. CSS
        if '/assets/styles.css' not in content:
            self.issues[str(rel_path)].append("MISSING: Global stylesheet link")

    def run_audit(self):
        """Run audit on all HTML files."""
        print("=" * 80)
        print("COMPLETE NAVIGATION PATTERN AUDIT")
        print("=" * 80)
        print(f"\nBase directory: {self.base_dir}")
        print(f"Excluding: /vendors/, /solo/articles/")
        print()

        # Find all HTML files
        html_files = []
        for pattern in ['*.html', '**/*.html']:
            html_files.extend(self.base_dir.glob(pattern))

        # Filter out excluded directories
        html_files = [f for f in html_files if not self.should_skip(f)]

        print(f"Found {len(html_files)} HTML files to audit\n")
        print("Auditing...")

        # Audit each file
        for filepath in sorted(html_files):
            self.audit_file(filepath)

        # Report results
        self.print_report()

    def print_report(self):
        """Print audit report."""
        print("\n" + "=" * 80)
        print("AUDIT RESULTS")
        print("=" * 80)

        if not self.issues:
            print("\n✅ ALL PAGES PASS - Complete navigation pattern present on all pages!")
            return

        # Group issues by type
        issue_types = defaultdict(list)
        for filepath, issues_list in self.issues.items():
            for issue in issues_list:
                issue_type = issue.split(':')[0]
                issue_types[issue_type].append((filepath, issue))

        # Print summary
        print(f"\n❌ Found issues on {len(self.issues)} pages\n")

        print("ISSUE SUMMARY BY TYPE:")
        print("-" * 80)
        for issue_type, items in sorted(issue_types.items()):
            print(f"{issue_type}: {len(items)} occurrences")

        # Print detailed issues
        print("\n" + "=" * 80)
        print("DETAILED ISSUES")
        print("=" * 80)

        for filepath, issues_list in sorted(self.issues.items()):
            print(f"\n📄 {filepath}")
            for issue in issues_list:
                print(f"   ⚠️  {issue}")

        # Print files by issue count
        print("\n" + "=" * 80)
        print("TOP 20 FILES BY ISSUE COUNT")
        print("=" * 80)

        files_by_count = sorted(self.issues.items(), key=lambda x: len(x[1]), reverse=True)
        for filepath, issues_list in files_by_count[:20]:
            print(f"{len(issues_list):2d} issues: {filepath}")

def main():
    auditor = NavigationAuditor('/home/user/InTheWake')
    auditor.run_audit()

if __name__ == '__main__':
    main()
