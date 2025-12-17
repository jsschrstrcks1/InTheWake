#!/usr/bin/env python3
"""
Replace inline dropdown scripts with external dropdown.js reference
and add in-app-browser-escape.js for Facebook/Instagram WebView fixes.
"""
import os
import re
import sys

# Pattern to match the inline dropdown script block
# Matches the minified inline dropdown code found in many port/ship pages
INLINE_DROPDOWN_PATTERN = re.compile(
    r"<script>\s*\(function\(\)\{.*?var dropdowns.*?closeAllDropdowns.*?\}\)\(\);\s*</script>",
    re.DOTALL
)

# Replacement: external dropdown.js + in-app-browser-escape.js
REPLACEMENT = '''<!-- Navigation Dropdown Script -->
  <script src="/assets/js/dropdown.js"></script>

  <!-- In-App Browser Detection & Escape Banner -->
  <script src="/assets/js/in-app-browser-escape.js"></script>'''

def process_file(filepath):
    """Process a single HTML file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if already has external dropdown.js
    if 'src="/assets/js/dropdown.js"' in content:
        # Just add in-app-browser-escape.js if missing
        if 'in-app-browser-escape.js' not in content:
            # Add after dropdown.js
            content = content.replace(
                '<script src="/assets/js/dropdown.js"></script>',
                '''<script src="/assets/js/dropdown.js"></script>

  <!-- In-App Browser Detection & Escape Banner -->
  <script src="/assets/js/in-app-browser-escape.js"></script>'''
            )
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return 'added_escape'
        return 'already_done'

    # Check for inline dropdown code
    if INLINE_DROPDOWN_PATTERN.search(content):
        new_content = INLINE_DROPDOWN_PATTERN.sub(REPLACEMENT, content)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return 'replaced'

    return 'no_match'

def main():
    if len(sys.argv) < 2:
        print("Usage: python fix-dropdown-inline.py <file_or_directory>")
        sys.exit(1)

    path = sys.argv[1]

    if os.path.isfile(path):
        files = [path]
    else:
        files = []
        for root, dirs, filenames in os.walk(path):
            # Skip excluded directories
            if '/vendors/' in root or '/solo/articles/' in root or '/.claude/' in root:
                continue
            for f in filenames:
                if f.endswith('.html'):
                    files.append(os.path.join(root, f))

    stats = {'replaced': 0, 'added_escape': 0, 'already_done': 0, 'no_match': 0}

    for filepath in sorted(files):
        result = process_file(filepath)
        stats[result] += 1
        if result in ('replaced', 'added_escape'):
            print(f"  {result}: {filepath}")

    print(f"\nSummary:")
    print(f"  Replaced inline dropdown: {stats['replaced']}")
    print(f"  Added escape script: {stats['added_escape']}")
    print(f"  Already done: {stats['already_done']}")
    print(f"  No match: {stats['no_match']}")

if __name__ == '__main__':
    main()
