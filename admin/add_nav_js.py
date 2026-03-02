#!/usr/bin/env python3
"""Add navigation JavaScript to pages missing it"""

from pathlib import Path
import re

def add_nav_js(html_file):
    """Add nav JS script tag before </body> if missing"""
    content = html_file.read_text(encoding='utf-8', errors='ignore')

    # Check if already has nav JS
    if 'newnav.js' in content or 'wireNav' in content:
        return False

    # Check if has nav HTML
    has_nav = '<nav class="nav"' in content or '<nav class=\"nav\"' in content
    if not has_nav:
        return False

    # Add nav JS before </body>
    nav_script = '  <!-- Navigation dropdown functionality -->\n  <script src="/assets/js/newnav.js"></script>\n'

    if '</body>' in content:
        content = content.replace('</body>', nav_script + '</body>')
        html_file.write_text(content, encoding='utf-8')
        return True

    return False

def main():
    """Add nav JS to all pages missing it"""
    fixed = []

    for html_file in Path('.').rglob('*.html'):
        if 'node_modules' in str(html_file):
            continue

        if add_nav_js(html_file):
            fixed.append(str(html_file))

    print(f'Added nav JS to {len(fixed)} pages:')
    for f in sorted(fixed):
        print(f'  ✓ {f}')

if __name__ == '__main__':
    main()
