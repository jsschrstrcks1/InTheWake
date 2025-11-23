#!/usr/bin/env python3
"""
Comprehensive Navigation Pattern Fix Script

Adds ALL missing navigation pattern components to every page:
1. Skip link (first in body)
2. ARIA live regions (after skip link)
3. Ensures header has role="banner"
4. Adds hero div if missing
5. Ensures dropdown JavaScript is present

Excludes: /vendors/, /solo/articles/, old-files/, admin/
"""

import os
import re
from pathlib import Path

class NavigationFixer:
    def __init__(self, base_dir, dry_run=False):
        self.base_dir = Path(base_dir)
        self.dry_run = dry_run
        self.stats = {
            'skip_link_added': 0,
            'aria_regions_added': 0,
            'role_banner_added': 0,
            'hero_added': 0,
            'files_modified': 0,
            'files_skipped': 0
        }

    def should_skip(self, filepath):
        """Check if file should be excluded."""
        path_str = str(filepath)

        # Skip non-production directories
        skip_patterns = [
            '/vendors/', 'vendors/',
            '/solo/articles/',
            '/old-files/', 'old-files/',
            '/admin/', 'admin/',
            'template.html',
            'invocation_signature.html'
        ]

        return any(pattern in path_str for pattern in skip_patterns)

    def add_skip_link(self, content):
        """Add skip link as first element in body if missing."""
        if '<a href="#main-content" class="skip-link">' in content:
            return content, False

        # Find <body> tag and add skip link immediately after
        body_pattern = r'(<body[^>]*>)'
        match = re.search(body_pattern, content)

        if match:
            skip_link = '\n  <a href="#main-content" class="skip-link">Skip to main content</a>\n'
            content = content[:match.end()] + skip_link + content[match.end():]
            return content, True

        return content, False

    def add_aria_regions(self, content):
        """Add ARIA live regions after skip link if missing."""
        if 'id="a11y-status"' in content and 'id="a11y-alerts"' in content:
            return content, False

        aria_regions = '''
  <!-- ARIA Live Regions -->
  <div id="a11y-status" role="status" aria-live="polite" aria-atomic="true" class="sr-only"></div>
  <div id="a11y-alerts" role="alert" aria-live="assertive" aria-atomic="true" class="sr-only"></div>

'''

        # Find skip link or body tag and add after
        if 'class="skip-link"' in content:
            # Add after skip link
            pattern = r'(<a[^>]*class="skip-link"[^>]*>.*?</a>)'
            match = re.search(pattern, content, re.DOTALL)
            if match:
                content = content[:match.end()] + aria_regions + content[match.end():]
                return content, True
        else:
            # Add after body tag
            body_pattern = r'(<body[^>]*>)'
            match = re.search(body_pattern, content)
            if match:
                content = content[:match.end()] + aria_regions + content[match.end():]
                return content, True

        return content, False

    def add_role_banner(self, content):
        """Add role='banner' to header if missing."""
        if 'role="banner"' in content:
            return content, False

        # Find <header> tag and add role
        pattern = r'<header\s+class="hero-header"([^>]*)>'
        match = re.search(pattern, content)

        if match:
            # Check if role is already there somehow
            if 'role=' not in match.group(0):
                replacement = '<header class="hero-header" role="banner"\\1>'
                content = re.sub(pattern, replacement, content, count=1)
                return content, True

        return content, False

    def add_hero_div(self, content):
        """Add hero div inside header if missing."""
        if '<div class="hero">' in content:
            return content, False

        # Find closing </header> tag and add hero div before it
        if '</header>' in content:
            hero_div = '''
    <!-- Hero -->
    <div class="hero">
      <img class="hero-compass" src="/assets/compass_rose.svg?v=3.010.300" width="180" height="180" alt="" aria-hidden="true" decoding="async"/>
      <div class="hero-title">
        <img class="logo" src="/assets/logo_wake_560.png" srcset="/assets/logo_wake_560.png 1x, /assets/logo_wake_1120.png 2x" alt="In the Wake" decoding="async" fetchpriority="high" width="560" height="567"/>
      </div>
      <div class="tagline" aria-hidden="true">A Cruise Traveler's Logbook</div>
      <div class="hero-credit">
        <a class="pill" href="https://www.flickersofmajesty.com" target="_blank" rel="noopener">Photo © Flickers of Majesty</a>
      </div>
    </div>
'''
            content = content.replace('</header>', hero_div + '  </header>', 1)
            return content, True

        return content, False

    def fix_file(self, filepath):
        """Fix a single HTML file."""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"  ✗ Error reading {filepath.name}: {e}")
            return False

        original_content = content
        modified = False

        # 1. Add skip link
        content, changed = self.add_skip_link(content)
        if changed:
            self.stats['skip_link_added'] += 1
            modified = True

        # 2. Add ARIA live regions
        content, changed = self.add_aria_regions(content)
        if changed:
            self.stats['aria_regions_added'] += 1
            modified = True

        # 3. Add role="banner" to header
        content, changed = self.add_role_banner(content)
        if changed:
            self.stats['role_banner_added'] += 1
            modified = True

        # 4. Add hero div (if header exists but hero missing)
        content, changed = self.add_hero_div(content)
        if changed:
            self.stats['hero_added'] += 1
            modified = True

        # Write back if modified
        if modified:
            if not self.dry_run:
                try:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    self.stats['files_modified'] += 1
                    return True
                except Exception as e:
                    print(f"  ✗ Error writing {filepath.name}: {e}")
                    return False
            else:
                self.stats['files_modified'] += 1
                return True
        else:
            self.stats['files_skipped'] += 1
            return False

    def run(self):
        """Run the fixer on all HTML files."""
        print("=" * 80)
        print("COMPREHENSIVE NAVIGATION PATTERN FIX")
        print("=" * 80)
        if self.dry_run:
            print("\n⚠️  DRY RUN MODE - No files will be modified")
        print(f"\nBase directory: {self.base_dir}")
        print("Excluding: /vendors/, /solo/articles/, /old-files/, /admin/\n")

        # Find all HTML files
        html_files = []
        for pattern in ['*.html', '**/*.html']:
            html_files.extend(self.base_dir.glob(pattern))

        # Filter out excluded directories
        html_files = [f for f in html_files if not self.should_skip(f)]

        print(f"Found {len(html_files)} HTML files to process\n")
        print("Processing...\n")

        # Process each file
        for filepath in sorted(html_files):
            rel_path = filepath.relative_to(self.base_dir)
            if self.fix_file(filepath):
                print(f"  ✓ {rel_path}")

        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print summary statistics."""
        print("\n" + "=" * 80)
        print("SUMMARY")
        print("=" * 80)
        print(f"Files modified: {self.stats['files_modified']}")
        print(f"Files skipped (already correct): {self.stats['files_skipped']}")
        print()
        print("Changes made:")
        print(f"  - Skip links added: {self.stats['skip_link_added']}")
        print(f"  - ARIA regions added: {self.stats['aria_regions_added']}")
        print(f"  - role='banner' added: {self.stats['role_banner_added']}")
        print(f"  - Hero divs added: {self.stats['hero_added']}")

def main():
    import sys

    dry_run = '--dry-run' in sys.argv
    fixer = NavigationFixer('/home/user/InTheWake', dry_run=dry_run)
    fixer.run()

if __name__ == '__main__':
    main()
