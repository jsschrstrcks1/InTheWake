#!/usr/bin/env python3
"""
Verify navigation consistency site-wide
Soli Deo Gloria

Checks that all HTML files have:
1. Dropdown navigation CSS with z-index: 2100
2. Navigation HTML structure
3. Dropdown JavaScript with 300ms delay
"""

import os
import re
from pathlib import Path
from collections import defaultdict

def check_navigation(file_path):
    """Check a single HTML file for navigation components"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        issues = []

        # Check for dropdown CSS
        has_dropdown_css = bool(re.search(r'/\*.*Dropdown\s+Navigation.*\*/', content, re.IGNORECASE))
        if not has_dropdown_css:
            issues.append("Missing dropdown navigation CSS comment")

        # Check for z-index: 2100
        has_zindex = bool(re.search(r'z-index:\s*2100', content))
        if not has_zindex:
            issues.append("Missing z-index: 2100")

        # Check for .submenu CSS
        has_submenu_css = bool(re.search(r'\.submenu\s*\{', content))
        if not has_submenu_css:
            issues.append("Missing .submenu CSS")

        # Check for navigation HTML
        has_nav_html = bool(re.search(r'<nav\s+class="nav"', content))
        if not has_nav_html:
            issues.append("Missing <nav> HTML element")

        # Check for nav-group divs
        has_nav_groups = bool(re.search(r'class="nav-item\s+nav-group"', content))
        if not has_nav_groups:
            issues.append("Missing nav-group elements")

        # Check for dropdown JavaScript
        has_hover_delay = bool(re.search(r'HOVER_DELAY\s*=\s*300', content))
        if not has_hover_delay:
            issues.append("Missing 300ms hover delay JavaScript")

        # Check for mouseenter/mouseleave handlers
        has_mouse_handlers = bool(re.search(r'addEventListener.*mouseenter', content))
        if not has_mouse_handlers:
            issues.append("Missing mouseenter/mouseleave handlers")

        # Check for keyboard navigation
        has_keyboard_nav = bool(re.search(r"e\.key\s*===\s*['\"]Escape['\"]", content))
        if not has_keyboard_nav:
            issues.append("Missing keyboard navigation (Escape key)")

        return {
            'has_issues': len(issues) > 0,
            'issues': issues,
            'has_dropdown_css': has_dropdown_css,
            'has_zindex': has_zindex,
            'has_submenu_css': has_submenu_css,
            'has_nav_html': has_nav_html,
            'has_nav_groups': has_nav_groups,
            'has_hover_delay': has_hover_delay,
            'has_mouse_handlers': has_mouse_handlers,
            'has_keyboard_nav': has_keyboard_nav
        }

    except Exception as e:
        return {
            'has_issues': True,
            'issues': [f"Error reading file: {e}"],
            'error': True
        }

def find_html_files(directory):
    """Find all HTML files except in vendors"""
    html_files = []
    for root, dirs, files in os.walk(directory):
        # Skip vendors directory
        if 'vendors' in root or 'node_modules' in root or '.git' in root:
            continue

        for file in files:
            if file.endswith('.html'):
                html_files.append(Path(root) / file)

    return sorted(html_files)

def main():
    print("🔍 Verifying navigation consistency site-wide...\n")

    html_files = find_html_files('.')
    print(f"📊 Found {len(html_files)} HTML files to check\n")

    results = {}
    for html_file in html_files:
        results[html_file] = check_navigation(html_file)

    # Categorize results
    perfect = []
    has_issues = []

    for file_path, result in results.items():
        if not result.get('has_issues'):
            perfect.append(file_path)
        else:
            has_issues.append((file_path, result))

    # Print summary
    print(f"✅ Perfect navigation: {len(perfect)} files ({len(perfect)/len(html_files)*100:.1f}%)")
    print(f"⚠️  Has issues: {len(has_issues)} files ({len(has_issues)/len(html_files)*100:.1f}%)\n")

    if has_issues:
        print("=" * 80)
        print("FILES WITH NAVIGATION ISSUES")
        print("=" * 80)

        # Group by issue type
        issue_types = defaultdict(list)
        for file_path, result in has_issues:
            for issue in result.get('issues', []):
                issue_types[issue].append(file_path)

        # Print grouped issues
        for issue, files in sorted(issue_types.items()):
            print(f"\n{issue}: {len(files)} files")
            for file_path in files[:10]:  # Show first 10
                print(f"  - {file_path}")
            if len(files) > 10:
                print(f"  ... and {len(files) - 10} more")

        print("\n" + "=" * 80)
        print("DETAILED FILE REPORTS")
        print("=" * 80)

        # Print detailed report for first 20 files with issues
        for file_path, result in has_issues[:20]:
            print(f"\n📄 {file_path}")
            print("   Issues:")
            for issue in result['issues']:
                print(f"   ❌ {issue}")

        if len(has_issues) > 20:
            print(f"\n... and {len(has_issues) - 20} more files with issues")

    else:
        print("🎉 All files have perfect navigation!")

    print(f"\n{'=' * 80}")
    print(f"VERIFICATION COMPLETE")
    print(f"{'=' * 80}")
    print(f"Total files: {len(html_files)}")
    print(f"Perfect: {len(perfect)}")
    print(f"Issues: {len(has_issues)}")

if __name__ == '__main__':
    main()
