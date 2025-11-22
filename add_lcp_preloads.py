#!/usr/bin/env python3
"""
Add LCP (Largest Contentful Paint) preload hints to pages missing them

From PR #144 (thread-safety-fixes), LCP optimization includes:
- Preload hero logo image with fetchpriority="high"
- Preload compass rose SVG with fetchpriority="high"

These hints tell the browser to prioritize loading these critical above-the-fold images,
improving Core Web Vitals and page load performance.
"""

import re
from pathlib import Path

def add_lcp_preloads(content):
    """Add LCP preload hints if missing"""
    original = content
    changes = []

    # Check if preload hints already exist
    if 'rel="preload"' in content:
        return None, []

    # Find the closing </head> tag and insert preload hints before it
    preload_block = '''
  <!-- LCP Optimization: Preload critical hero images -->
  <link rel="preload" as="image" href="/assets/logo_wake_560.png" fetchpriority="high"/>
  <link rel="preload" as="image" href="/assets/compass_rose.svg?v=3.010.300" fetchpriority="high"/>
</head>'''

    if '</head>' in content:
        content = content.replace('</head>', preload_block)
        changes.append("Added LCP preload hints for hero images")

    if content != original:
        return content, changes

    return None, []

def fix_file(file_path):
    """Fix a single file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content, changes = add_lcp_preloads(content)

    if new_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return changes

    return None

def main():
    """Process all port HTML files"""
    files = list(Path('ports').glob('*.html'))

    print(f"\nAdding LCP preload hints to port pages...\n")

    fixed = 0
    for file_path in sorted(files):
        try:
            changes = fix_file(file_path)
            if changes:
                print(f"✓ {file_path}")
                for change in changes:
                    print(f"  - {change}")
                fixed += 1
        except Exception as e:
            print(f"✗ {file_path}: {e}")

    print(f"\n{'='*60}")
    print(f"Fixed: {fixed} files")
    print(f"{'='*60}\n")

    if fixed > 0:
        print("LCP optimization complete:")
        print("  ✓ Preload hints for logo_wake_560.png")
        print("  ✓ Preload hints for compass_rose.svg")
        print("  ✓ fetchpriority='high' for critical images")
        print("  ✓ Improved Core Web Vitals (LCP metric)")

if __name__ == '__main__':
    main()
