#!/usr/bin/env python3
"""
Normalize hero logo implementation across all pages

Fixes:
1. Update old logo format to modern responsive version with srcset
2. Replace absolute URLs with relative paths
3. Add fetchpriority="high" for LCP optimization
4. Ensure consistent decoding="async" attribute

From PR #147 (thread-safety-fixes), we established the standard:
<img class="logo" src="/assets/logo_wake_560.png"
     srcset="/assets/logo_wake_560.png 1x, /assets/logo_wake_1120.png 2x"
     alt="In the Wake" decoding="async" fetchpriority="high"/>
"""

import re
from pathlib import Path

def normalize_hero_logo(content):
    """Normalize hero logo to responsive version with LCP optimization"""
    original = content
    changes = []

    # Pattern 1: Old format with versioned logo
    # <img class="logo" src="/assets/logo_wake.png?v=3.010.300" alt="In the Wake"/>
    pattern1 = r'<img class="logo" src="/assets/logo_wake\.png\?v=[^"]*" alt="In the Wake"\s*/?>'

    if re.search(pattern1, content):
        replacement = '<img class="logo" src="/assets/logo_wake_560.png" srcset="/assets/logo_wake_560.png 1x, /assets/logo_wake_1120.png 2x" alt="In the Wake" decoding="async" fetchpriority="high"/>'
        content = re.sub(pattern1, replacement, content)
        changes.append("Updated hero logo to responsive version with LCP optimization")

    # Pattern 2: Absolute URL format
    # <img class="logo" src="https://jsschrstrcks1.github.io/InTheWake/assets/logo_wake.png" alt="In the Wake">
    pattern2 = r'<img class="logo" src="https://jsschrstrcks1\.github\.io/InTheWake/assets/logo_wake\.png" alt="In the Wake"\s*/?>'

    if re.search(pattern2, content):
        replacement = '<img class="logo" src="/assets/logo_wake_560.png" srcset="/assets/logo_wake_560.png 1x, /assets/logo_wake_1120.png 2x" alt="In the Wake" decoding="async" fetchpriority="high"/>'
        content = re.sub(pattern2, replacement, content)
        changes.append("Replaced absolute URL with responsive relative logo and LCP optimization")

    if content != original:
        return content, changes

    return None, []

def fix_file(file_path):
    """Fix a single file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content, changes = normalize_hero_logo(content)

    if new_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return changes

    return None

def main():
    """Process all HTML files"""
    # Get all HTML files
    files = []
    files.extend(Path('.').glob('*.html'))
    files.extend(Path('ships').rglob('*.html'))
    files.extend(Path('restaurants').rglob('*.html'))

    # Filter out vendor files and git
    files = [f for f in files if 'vendors' not in str(f) and '.git' not in str(f)]

    print(f"\nNormalizing hero logos in {len(files)} HTML files...\n")

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

    print("Hero logo normalized:")
    print("  ✓ Responsive srcset for 1x and 2x displays")
    print("  ✓ fetchpriority='high' for LCP optimization")
    print("  ✓ decoding='async' for better performance")
    print("  ✓ Consistent implementation across all pages")

if __name__ == '__main__':
    main()
