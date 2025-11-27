#!/usr/bin/env python3
"""
Add Service Worker registration to all HTML pages missing it.
Soli Deo Gloria
"""

import os
import re
from pathlib import Path

# Directories to skip
SKIP_DIRS = {'admin', 'new-standards', 'node_modules', '.git'}

# The SW registration snippet to add
SW_SNIPPET = '''
  <!-- Service Worker Registration -->
  <script>
  if('serviceWorker' in navigator){
    window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
  }
  </script>
'''

def should_process(filepath):
    """Check if file should be processed."""
    parts = Path(filepath).parts
    return not any(skip in parts for skip in SKIP_DIRS)

def has_sw_registration(content):
    """Check if file already has service worker registration."""
    return 'serviceWorker' in content and 'register' in content

def add_sw_registration(content):
    """Add SW registration snippet to HTML content."""

    # Try to insert before the first <link rel="stylesheet" or before </head>

    # Pattern 1: Before first stylesheet link
    stylesheet_match = re.search(r'(\n\s*<link\s+rel=["\']stylesheet["\'])', content, re.IGNORECASE)
    if stylesheet_match:
        insert_pos = stylesheet_match.start()
        return content[:insert_pos] + SW_SNIPPET + content[insert_pos:]

    # Pattern 2: Before </head>
    head_close = re.search(r'(\n\s*</head>)', content, re.IGNORECASE)
    if head_close:
        insert_pos = head_close.start()
        return content[:insert_pos] + SW_SNIPPET + content[insert_pos:]

    # Pattern 3: After <head> opening (last resort)
    head_open = re.search(r'(<head[^>]*>)', content, re.IGNORECASE)
    if head_open:
        insert_pos = head_open.end()
        return content[:insert_pos] + SW_SNIPPET + content[insert_pos:]

    return None  # Couldn't find insertion point

def main():
    root = Path('/home/user/InTheWake')

    fixed_files = []
    skipped_files = []
    error_files = []
    already_has = []

    # Find all HTML files
    for html_file in root.rglob('*.html'):
        if not should_process(html_file):
            skipped_files.append(str(html_file))
            continue

        try:
            content = html_file.read_text(encoding='utf-8')

            if has_sw_registration(content):
                already_has.append(str(html_file))
                continue

            new_content = add_sw_registration(content)

            if new_content is None:
                error_files.append((str(html_file), "No insertion point found"))
                continue

            html_file.write_text(new_content, encoding='utf-8')
            fixed_files.append(str(html_file))

        except Exception as e:
            error_files.append((str(html_file), str(e)))

    # Report
    print(f"\n=== Service Worker Registration Fix ===\n")
    print(f"Already had SW registration: {len(already_has)}")
    print(f"Fixed (added SW registration): {len(fixed_files)}")
    print(f"Skipped (admin/standards): {len(skipped_files)}")
    print(f"Errors: {len(error_files)}")

    if fixed_files:
        print(f"\n--- Fixed Files ({len(fixed_files)}) ---")
        # Group by directory
        by_dir = {}
        for f in fixed_files:
            rel = os.path.relpath(f, root)
            dir_name = os.path.dirname(rel) or '(root)'
            if dir_name not in by_dir:
                by_dir[dir_name] = []
            by_dir[dir_name].append(os.path.basename(rel))

        for dir_name, files in sorted(by_dir.items()):
            print(f"\n{dir_name}/: {len(files)} files")
            if len(files) <= 5:
                for f in files:
                    print(f"  - {f}")

    if error_files:
        print(f"\n--- Errors ---")
        for f, err in error_files:
            print(f"  {f}: {err}")

    return len(fixed_files)

if __name__ == '__main__':
    main()
