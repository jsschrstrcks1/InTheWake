#!/usr/bin/env python3
"""
Fix Duplicate Navigation Elements

Removes duplicate:
- Skip links (keep only first)
- role="banner" attributes (keep only on main header)
- Multiple <header> tags (keep only the one with hero-header class)

Excludes: /vendors/, /solo/articles/, old-files/, admin/
"""

import os
import re
from pathlib import Path

class DuplicateFixer:
    def __init__(self, base_dir, dry_run=False):
        self.base_dir = Path(base_dir)
        self.dry_run = dry_run
        self.stats = {
            'skip_links_fixed': 0,
            'role_banner_fixed': 0,
            'headers_fixed': 0,
            'files_modified': 0
        }

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

    def fix_duplicate_skip_links(self, content):
        """Remove duplicate skip links, keep only the first one."""
        # Match skip links with attributes in any order
        skip_pattern = r'<a[^>]*class="skip-link"[^>]*>Skip to main content</a>'
        matches = list(re.finditer(skip_pattern, content))

        if len(matches) <= 1:
            return content, False

        # Keep first, remove the rest (in reverse to preserve positions)
        for match in reversed(matches[1:]):
            # Remove this occurrence and any surrounding whitespace/newlines
            start = match.start()
            end = match.end()

            # Look for leading whitespace on the same line
            while start > 0 and content[start-1] in ' \t':
                start -= 1

            # Check for trailing newline
            if end < len(content) and content[end] == '\n':
                end += 1

            content = content[:start] + content[end:]

        return content, True

    def fix_duplicate_role_banner(self, content):
        """Remove duplicate role='banner', keep only on main navigation header."""
        # Count role="banner"
        if content.count('role="banner"') <= 1:
            return content, False

        # Strategy: Keep role="banner" only on the header with hero-header or site-header class
        # Remove it from any other <header> tags

        # Find all <header> tags with role="banner"
        header_pattern = r'<header([^>]*role="banner"[^>]*)>'

        def replace_header(match):
            attrs = match.group(1)
            # If this header has hero-header or site-header class, keep role="banner"
            if 'hero-header' in attrs or 'site-header' in attrs:
                return match.group(0)  # Keep as-is
            else:
                # Remove role="banner" from this header
                new_attrs = re.sub(r'\s*role="banner"\s*', ' ', attrs)
                return f'<header{new_attrs}>'

        new_content = re.sub(header_pattern, replace_header, content)

        return new_content, new_content != content

    def fix_duplicate_headers(self, content):
        """Remove duplicate <header> tags, keep only the main navigation one."""
        header_count = content.count('<header')

        if header_count <= 1:
            return content, False

        # Strategy: Keep ONLY the <header> with hero-header or site-header class
        # Remove other <header>...</header> blocks

        # This is complex and risky - only do it if we can clearly identify
        # which header to keep and which to remove

        # For now, just flag this and don't auto-fix (too risky)
        return content, False

    def fix_file(self, filepath):
        """Fix duplicates in a single HTML file."""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            return False

        original_content = content
        modified = False

        # 1. Fix duplicate skip links
        content, changed = self.fix_duplicate_skip_links(content)
        if changed:
            self.stats['skip_links_fixed'] += 1
            modified = True

        # 2. Fix duplicate role="banner"
        content, changed = self.fix_duplicate_role_banner(content)
        if changed:
            self.stats['role_banner_fixed'] += 1
            modified = True

        # 3. Fix duplicate headers (not implemented yet - too risky)
        # content, changed = self.fix_duplicate_headers(content)
        # if changed:
        #     self.stats['headers_fixed'] += 1
        #     modified = True

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

        return False

    def run(self):
        """Run the fixer on all HTML files."""
        print("=" * 80)
        print("DUPLICATE NAVIGATION ELEMENT FIX")
        print("=" * 80)
        if self.dry_run:
            print("\n⚠️  DRY RUN MODE - No files will be modified")
        print(f"\nBase directory: {self.base_dir}\n")

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
        print()
        print("Duplicates removed:")
        print(f"  - Duplicate skip links: {self.stats['skip_links_fixed']}")
        print(f"  - Duplicate role='banner': {self.stats['role_banner_fixed']}")
        print(f"  - Duplicate headers: {self.stats['headers_fixed']}")

def main():
    import sys
    dry_run = '--dry-run' in sys.argv
    fixer = DuplicateFixer('/home/user/InTheWake', dry_run=dry_run)
    fixer.run()

if __name__ == '__main__':
    main()
