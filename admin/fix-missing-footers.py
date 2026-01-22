#!/usr/bin/env python3
"""
Add missing footers to port pages.
Soli Deo Gloria
"""

import re
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent

FOOTER_HTML = """
  <!-- FOOTER -->
    <footer class="wrap" role="contentinfo">
    <p>© 2025 In the Wake · A Cruise Traveler's Logbook · All rights reserved.</p>
    <p class="tiny" style="margin-top: 0.5rem;">
      <a href="/privacy.html">Privacy</a> ·
      <a href="/terms.html">Terms</a> ·
      <a href="/about-us.html">About</a> ·
      <a href="/accessibility.html">Accessibility &amp; WCAG 2.1 AA Commitment</a>
    </p>
    <p class="tiny center" style="opacity:0;position:absolute;pointer-events:none;" aria-hidden="true">Soli Deo Gloria — Every pixel and part of this project is offered as worship to God, in gratitude for the beautiful things He has created for us to enjoy.</p>
    <p class="trust-badge">✓ No ads. Minimal analytics. Independent of cruise lines. <a href="/affiliate-disclosure.html">Affiliate Disclosure</a></p>
  </footer>
"""


def add_footer(filepath):
    """Add footer to a page that's missing one."""
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # Check if footer already exists
    if '<footer' in html:
        print(f"  {filepath.name}: Already has footer")
        return False

    # Find the position to insert - before </body> or before the last script block
    # Look for </main> to insert after it
    main_match = re.search(r'</main>\s*', html)
    if main_match:
        insert_pos = main_match.end()
        new_html = html[:insert_pos] + FOOTER_HTML + html[insert_pos:]
    else:
        # Fallback: insert before </body>
        body_match = re.search(r'</body>', html)
        if body_match:
            insert_pos = body_match.start()
            new_html = html[:insert_pos] + FOOTER_HTML + "\n" + html[insert_pos:]
        else:
            print(f"  {filepath.name}: Could not find insertion point")
            return False

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_html)

    print(f"  {filepath.name}: Added footer")
    return True


def main():
    ports_missing_footer = [
        "hilo", "kona", "maui", "nawiliwili", "guam", "portland-maine"
    ]

    # Also check any specified on command line
    if len(sys.argv) > 1:
        ports_missing_footer = sys.argv[1:]

    ports_dir = PROJECT_ROOT / "ports"
    fixed = 0

    for port in ports_missing_footer:
        filepath = ports_dir / f"{port}.html"
        if filepath.exists():
            if add_footer(filepath):
                fixed += 1
        else:
            print(f"  {port}.html: File not found")

    print(f"\nFixed {fixed} files")


if __name__ == "__main__":
    main()
