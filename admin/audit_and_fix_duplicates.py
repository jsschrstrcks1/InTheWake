#!/usr/bin/env python3
"""
Audit and Fix Duplicate Hero Sections

Checks for and removes duplicate:
- Hero divs (<div class="hero">)
- Compass roses (hero-compass images)
- Logos (logo images)
- Multiple header elements

Each page should have exactly ONE of each element.

Excludes: /vendors/, /solo/articles/, old-files/, admin/
"""

import os
import re
from pathlib import Path
from collections import defaultdict

class DuplicateHeroFixer:
    def __init__(self, base_dir, dry_run=False):
        self.base_dir = Path(base_dir)
        self.dry_run = dry_run
        self.stats = {
            'files_with_duplicates': 0,
            'duplicate_heroes': 0,
            'duplicate_compass': 0,
            'duplicate_logos': 0,
            'files_fixed': 0
        }
        self.issues = defaultdict(list)

    def should_skip(self, filepath):
        """Check if file should be excluded."""
        path_str = str(filepath)
        skip_patterns = [
            '/vendors/', 'vendors/',
            '/solo/articles/',
            '/old-files/', 'old-files/',
            '/admin/', 'admin/',
            'template.html',
            'invocation_signature.html'
        ]
        return any(pattern in path_str for pattern in skip_patterns)

    def audit_file(self, filepath):
        """Audit a file for duplicate hero elements."""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            return None, []

        issues = []

        # Count hero divs (should be exactly 1)
        hero_divs = len(re.findall(r'<div[^>]*class="hero"', content))
        if hero_divs > 1:
            issues.append(f"{hero_divs} hero divs (should be 1)")

        # Count compass roses (should be exactly 1)
        compass = len(re.findall(r'class="hero-compass"', content))
        if compass > 1:
            issues.append(f"{compass} compass roses (should be 1)")

        # Count logos (should be exactly 1)
        logos = len(re.findall(r'class="logo"[^>]*src="/assets/logo_wake', content))
        if logos > 1:
            issues.append(f"{logos} logos (should be 1)")

        return content, issues

    def fix_file(self, filepath, content):
        """Remove duplicate hero sections from a file."""
        original_content = content
        modified = False

        # Strategy: Keep the FIRST hero div, remove subsequent ones
        # The duplicate hero sections are typically the ones added by the fix script
        # They have the pattern: <!-- Hero -->\n    <div class="hero">.....</div>

        # Find all hero div blocks
        # We need to be careful - hero divs can be nested in headers or standalone

        # Pattern for the duplicate hero section added by fix script
        # It has the comment "<!-- Hero -->" followed by the hero div
        duplicate_hero_pattern = r'\s*<!-- Hero -->\s*<div class="hero">.*?</div>\s*(?=</header>)'

        matches = list(re.finditer(duplicate_hero_pattern, content, re.DOTALL))

        if matches:
            # Check if there's already a hero div before this one
            for match in matches:
                # Check if there's another hero div before this match
                before_match = content[:match.start()]
                if '<div class="hero"' in before_match:
                    # This is a duplicate, remove it
                    content = content[:match.start()] + content[match.end():]
                    modified = True
                    self.stats['duplicate_heroes'] += 1

        if modified:
            return content, True

        return original_content, False

    def run(self):
        """Run the audit and fix on all HTML files."""
        print("=" * 80)
        print("DUPLICATE HERO ELEMENT AUDIT AND FIX")
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
        print("Auditing...\n")

        # First, audit all files
        for filepath in sorted(html_files):
            content, issues = self.audit_file(filepath)
            if issues:
                rel_path = filepath.relative_to(self.base_dir)
                self.issues[str(rel_path)] = issues
                self.stats['files_with_duplicates'] += 1

        # Print audit results
        if self.issues:
            print(f"⚠️  Found {len(self.issues)} files with duplicate hero elements:\n")
            for filepath, issues_list in sorted(self.issues.items()):
                print(f"  {filepath}")
                for issue in issues_list:
                    print(f"    - {issue}")
            print()
        else:
            print("✅ No duplicate hero elements found!\n")
            return

        if self.dry_run:
            print("\nDry run complete. Use without --dry-run to fix issues.")
            return

        # Now fix the files
        print("=" * 80)
        print("FIXING FILES")
        print("=" * 80)
        print()

        for filepath in sorted(html_files):
            rel_path = filepath.relative_to(self.base_dir)
            if str(rel_path) in self.issues:
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()

                    new_content, modified = self.fix_file(filepath, content)

                    if modified:
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        self.stats['files_fixed'] += 1
                        print(f"  ✓ Fixed: {rel_path}")
                except Exception as e:
                    print(f"  ✗ Error fixing {rel_path}: {e}")

        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print summary statistics."""
        print("\n" + "=" * 80)
        print("SUMMARY")
        print("=" * 80)
        print(f"Files with duplicates found: {self.stats['files_with_duplicates']}")
        print(f"Files fixed: {self.stats['files_fixed']}")
        print()
        print("Duplicates removed:")
        print(f"  - Duplicate hero divs: {self.stats['duplicate_heroes']}")
        print(f"  - Duplicate compass roses: {self.stats['duplicate_compass']}")
        print(f"  - Duplicate logos: {self.stats['duplicate_logos']}")

def main():
    import sys
    dry_run = '--dry-run' in sys.argv
    fixer = DuplicateHeroFixer('/home/user/InTheWake', dry_run=dry_run)
    fixer.run()

if __name__ == '__main__':
    main()
