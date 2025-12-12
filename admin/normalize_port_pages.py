#!/usr/bin/env python3
"""
Port Page Normalizer
Normalizes all port pages to match the Aruba template standard.

Normalizations applied:
1. Rail alignment: Add grid-row: 1; align-self: start; to aside
2. Articles rail: Fix JSON handling to support {articles:[]} format
3. Swiper loader: Add Swiper CSS/JS loader to head (for future gallery upgrades)

Usage: python3 admin/normalize_port_pages.py [--dry-run]
"""

import os
import re
import sys
from pathlib import Path

PORTS_DIR = Path(__file__).parent.parent / "ports"
DRY_RUN = "--dry-run" in sys.argv

# Patterns to fix
ASIDE_PATTERNS = [
    # Pattern: aside with grid-column: 2; but missing grid-row and align-self
    (
        r'<aside class="rail" style="grid-column: 2;">',
        '<aside class="rail" style="grid-column: 2; grid-row: 1; align-self: start;">'
    ),
    # Pattern: aside with grid-column: 2; align-self: start; but missing grid-row
    (
        r'<aside class="rail" style="grid-column: 2; align-self: start;">',
        '<aside class="rail" style="grid-column: 2; grid-row: 1; align-self: start;">'
    ),
    # Pattern: aside with just class="rail" (no style)
    (
        r'<aside class="rail">(\s*\n)',
        '<aside class="rail" style="grid-column: 2; grid-row: 1; align-self: start;">\\1'
    ),
]

# Old articles pattern -> new pattern
OLD_ARTICLES_PATTERN = r'var articles = await res\.json\(\);'
NEW_ARTICLES_CODE = '''var data = await res.json();
        var articles = data.articles || data; // Handle both {articles:[]} and [] formats'''

# Swiper loader to add to head (before </head>)
SWIPER_LOADER = '''
  <!-- Swiper CSS/JS (primary + CDN fallback) -->
  <script>
  (function ensureSwiper(){
    function addCSS(h){ const l=document.createElement('link'); l.rel='stylesheet'; l.href=h; document.head.appendChild(l); }
    function addJS(src, ok, fail){
      const s=document.createElement('script'); s.src=src; s.async=true; s.onload=ok; s.onerror=fail||function(){}; document.head.appendChild(s);
    }
    const primaryCSS="https://cruisinginthewake.com/vendor/swiper/swiper-bundle.min.css";
    const primaryJS ="https://cruisinginthewake.com/vendor/swiper/swiper-bundle.min.js";
    const cdnCSS    ="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css";
    const cdnJS     ="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js";
    addCSS(primaryCSS);
    addJS(primaryJS, function(){ window.__swiperReady=true; }, function(){ addCSS(cdnCSS); addJS(cdnJS, function(){ window.__swiperReady=true; }); });
  })();
  </script>
'''


def normalize_port_page(filepath):
    """Normalize a single port page."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    changes = []

    # 1. Fix aside/rail alignment
    for pattern, replacement in ASIDE_PATTERNS:
        if re.search(pattern, content):
            content = re.sub(pattern, replacement, content)
            changes.append(f"Fixed rail alignment")
            break  # Only one pattern should match

    # 2. Fix articles JSON handling
    if re.search(OLD_ARTICLES_PATTERN, content):
        content = re.sub(OLD_ARTICLES_PATTERN, NEW_ARTICLES_CODE, content)
        changes.append("Fixed articles JSON handling")

    # 3. Add Swiper loader if not present and has gallery-grid
    if 'ensureSwiper' not in content and 'gallery-grid' in content:
        # Insert before </head>
        content = content.replace('</head>', SWIPER_LOADER + '</head>')
        changes.append("Added Swiper loader")

    # Only write if changes were made
    if content != original:
        if not DRY_RUN:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
        return changes

    return []


def main():
    """Process all port pages."""
    if DRY_RUN:
        print("=== DRY RUN MODE (no files will be modified) ===\n")

    port_files = sorted(PORTS_DIR.glob("*.html"))
    total_changes = 0
    files_changed = 0

    print(f"Processing {len(port_files)} port pages...\n")

    for filepath in port_files:
        changes = normalize_port_page(filepath)
        if changes:
            files_changed += 1
            total_changes += len(changes)
            print(f"✓ {filepath.name}:")
            for change in changes:
                print(f"    - {change}")

    print(f"\n{'=' * 50}")
    print(f"Summary: {files_changed} files {'would be ' if DRY_RUN else ''}modified")
    print(f"Total changes: {total_changes}")

    if DRY_RUN:
        print("\nRun without --dry-run to apply changes.")


if __name__ == "__main__":
    main()
