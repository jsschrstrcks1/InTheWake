#!/usr/bin/env python3
"""
Fix logbook markdown links rendering - adds support for [text](url) links.
Updates the mdToHtml function in all ship pages to convert markdown links to HTML.
"""

import os
import re
from pathlib import Path

def fix_md_to_html(content):
    """
    Fix the mdToHtml function to include link parsing.

    Current function doesn't handle [text](url) markdown links.
    This adds .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>')
    """

    # Pattern to find the mdToHtml function
    # Looking for the specific line that has the replace chains but not the link regex
    old_pattern = r"(function mdToHtml\(src\)\{let html=String\(src\|\|''\)\.trim\(\); if\(!html\) return '';\s*html=html\.replace\(/\^\#\#\#\?\s\+\(\.\+\)\$/gm,'<h3>\$1</h3>'\)\.replace\(/\\\*\\\*\(\.\+\?\)\\\*\\\*/g,'<strong>\$1</strong>'\)\.replace\(/\\\*\(\.\+\?\)\\\*/g,'<em>\$1</em>'\))(;)"

    # Check if link support already exists
    if "\\[([^\\]]+)\\]\\(([^)]+)\\)" in content:
        return content, False

    # The new addition - link regex before the semicolon
    link_regex = ".replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g,'<a href=\"$2\">$1</a>')"

    # Try a simpler approach - find and replace the specific string
    old_str = ".replace(/\\*(.+?)\\*/g,'<em>$1</em>');"
    new_str = ".replace(/\\*(.+?)\\*/g,'<em>$1</em>').replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g,'<a href=\"$2\">$1</a>');"

    if old_str in content:
        new_content = content.replace(old_str, new_str)
        return new_content, True

    return content, False

def main():
    project_root = Path(__file__).parent.parent
    ships_dir = project_root / "ships" / "rcl"

    updated = 0
    skipped = 0
    errors = []

    html_files = list(ships_dir.glob("*.html"))

    print(f"Checking {len(html_files)} ship pages for logbook link support...")

    for filepath in html_files:
        try:
            content = filepath.read_text(encoding='utf-8')
            new_content, was_updated = fix_md_to_html(content)

            if was_updated:
                filepath.write_text(new_content, encoding='utf-8')
                print(f"  ✓ {filepath.name}")
                updated += 1
            else:
                skipped += 1

        except Exception as e:
            errors.append((filepath.name, str(e)))

    print(f"\nSummary:")
    print(f"  Updated: {updated}")
    print(f"  Skipped (already fixed or no mdToHtml): {skipped}")

    if errors:
        print(f"  Errors: {len(errors)}")
        for name, err in errors:
            print(f"    - {name}: {err}")

if __name__ == "__main__":
    main()
