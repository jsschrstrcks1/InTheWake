#!/usr/bin/env python3
"""
Remove duplicate dropdown JavaScript blocks from all HTML files
Keeps only the FIRST occurrence, removes all subsequent duplicates
"""

import os
import re
from pathlib import Path

class DropdownDuplicateRemover:
    def __init__(self, root_dir):
        self.root_dir = Path(root_dir)
        self.stats = {
            'processed': 0,
            'fixed': 0,
            'already_clean': 0,
            'errors': 0
        }

    def count_dropdown_blocks(self, content):
        """Count how many dropdown JavaScript blocks exist."""
        return content.count('Dropdown Menu with 300ms Hover Delay')

    def remove_duplicate_dropdowns(self, content):
        """Remove all but the FIRST dropdown JavaScript block.

        The duplicate blocks are marked with these HTML comments:
        - <!-- Dropdown nav behavior (300ms Hover Delay) -->
        - <!-- Dropdown Menu with 300ms Hover Delay -->

        We keep the FIRST occurrence and remove all subsequent ones.
        """
        # Pattern 1: Most common format
        pattern1 = r'<!-- Dropdown nav behavior \(300ms Hover Delay\) -->\s*<script>.*?</script>'

        # Pattern 2: Alternative format in ships.html and solo.html
        pattern2 = r'<!-- Dropdown Menu with 300ms Hover Delay -->\s*<script>.*?</script>'

        # Find all matches for both patterns
        matches1 = list(re.finditer(pattern1, content, flags=re.DOTALL))
        matches2 = list(re.finditer(pattern2, content, flags=re.DOTALL))

        all_matches = matches1 + matches2

        if len(all_matches) <= 1:
            # 0 or 1 match - nothing to fix
            return content, False

        # Sort matches by position (forward order)
        all_matches.sort(key=lambda m: m.start())

        # Keep the FIRST match, remove all others
        # Work backwards to preserve indices during removal
        modified = content
        for match in reversed(all_matches[1:]):
            modified = modified[:match.start()] + modified[match.end():]

        return modified, True

    def process_file(self, filepath):
        """Process a single HTML file."""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # Count dropdown blocks
            count = self.count_dropdown_blocks(content)

            if count <= 1:
                self.stats['already_clean'] += 1
                return

            # Remove duplicates
            new_content, modified = self.remove_duplicate_dropdowns(content)

            if modified:
                # Verify we reduced the count
                new_count = self.count_dropdown_blocks(new_content)

                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)

                print(f"✓ Fixed: {filepath.relative_to(self.root_dir)} ({count} → {new_count} copies)")
                self.stats['fixed'] += 1
            else:
                print(f"⚠ Could not fix: {filepath.relative_to(self.root_dir)}")

            self.stats['processed'] += 1

        except Exception as e:
            print(f"✗ Error processing {filepath}: {e}")
            self.stats['errors'] += 1

    def fix_all(self):
        """Fix all HTML files with duplicate dropdowns."""
        # Find all HTML files
        html_files = []
        for filepath in self.root_dir.rglob('*.html'):
            # Skip vendors and solo/articles
            if '/vendors/' in str(filepath) or '/solo/articles/' in str(filepath):
                continue

            # Only process files that have duplicates
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                if self.count_dropdown_blocks(content) > 1:
                    html_files.append(filepath)
            except:
                pass

        print(f"Found {len(html_files)} files with duplicate dropdown JavaScript")
        print("Removing duplicates...\n")

        for filepath in sorted(html_files):
            self.process_file(filepath)

        # Print summary
        print("\n" + "="*60)
        print("DUPLICATE REMOVAL SUMMARY")
        print("="*60)
        print(f"Files processed:        {self.stats['processed']}")
        print(f"Files fixed:            {self.stats['fixed']}")
        print(f"Already clean:          {self.stats['already_clean']}")
        print(f"Errors:                 {self.stats['errors']}")
        print("="*60)

if __name__ == '__main__':
    root = Path('/home/user/InTheWake')
    remover = DropdownDuplicateRemover(root)
    remover.fix_all()
