#!/usr/bin/env python3
"""Audit right rail structure across all pages"""

import re
from pathlib import Path

def audit_page(file_path):
    """Check if page has correct right rail structure"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    issues = []

    # Skip if no page-grid (single column layout is fine)
    if 'page-grid' not in content:
        return None

    # Check 1: If has page-grid, should have page-intro
    if '<section class="page-intro"' not in content and '<section class="page-intro ' not in content:
        issues.append("Missing page-intro section")

    # Check 2: page-intro should be at grid-column: 2
    if 'page-intro' in content:
        if 'grid-column: 2' not in content[:content.find('</section>')]:
            # Check the first section for grid-column
            intro_section = re.search(r'<section class="page-intro"[^>]*>', content)
            if intro_section:
                section_text = intro_section.group(0)
                if 'grid-column: 2' not in section_text:
                    issues.append("page-intro not positioned at grid-column: 2")

    # Check 3: Should have aside element
    if '<aside' not in content:
        issues.append("Missing aside element")
    else:
        # Check 4: aside should be at grid-column: 2, grid-row: 2
        aside_match = re.search(r'<aside[^>]*>', content)
        if aside_match:
            aside_tag = aside_match.group(0)
            if 'grid-column: 2' not in aside_tag:
                issues.append("aside not positioned at grid-column: 2")

        # Check 5: aside should have Recent Articles section
        aside_start = content.find('<aside')
        aside_end = content.find('</aside>', aside_start)
        if aside_start > 0 and aside_end > 0:
            aside_content = content[aside_start:aside_end]
            if 'Recent' not in aside_content and 'recent' not in aside_content:
                issues.append("aside missing Recent Articles section")

            # Check order: Author should come before Recent Articles
            author_pos = aside_content.find('About the Author')
            if author_pos < 0:
                author_pos = aside_content.find('author-card')
            recent_pos = aside_content.find('Recent')

            if author_pos > 0 and recent_pos > 0 and author_pos > recent_pos:
                issues.append("Wrong order in aside: Author should come before Recent Articles")

    return issues

def main():
    """Audit all HTML files"""
    # Skip vendors and specific directories
    all_files = list(Path('.').rglob('*.html'))
    files_to_check = [
        f for f in all_files
        if 'vendors' not in str(f) and '.git' not in str(f)
    ]

    print(f"\nAuditing {len(files_to_check)} HTML files...\n")

    pages_with_issues = []
    clean_pages = []

    for file_path in sorted(files_to_check):
        issues = audit_page(file_path)
        if issues:
            pages_with_issues.append((file_path, issues))
        elif issues is not None:  # None means no page-grid, which is fine
            clean_pages.append(file_path)

    # Report
    if pages_with_issues:
        print("=" * 80)
        print("PAGES WITH ISSUES:")
        print("=" * 80)
        for path, issues in pages_with_issues:
            print(f"\n{path}:")
            for issue in issues:
                print(f"  ⚠ {issue}")

    print(f"\n{'=' * 80}")
    print(f"Summary:")
    print(f"  ✓ Clean pages with page-grid: {len(clean_pages)}")
    print(f"  ⚠ Pages with issues: {len(pages_with_issues)}")
    print(f"{'=' * 80}\n")

if __name__ == '__main__':
    main()
