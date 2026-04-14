#!/usr/bin/env python3
"""
Add "Works offline" messaging to port page trust badges.
Competitor gap: Cruiseline.com, IQCruising advertise offline functionality.
"""

import os
import re
from pathlib import Path

PORTS_DIR = Path("/home/user/InTheWake/ports")

# Pattern to match trust badge without offline messaging
OLD_BADGE_PATTERNS = [
    # Most common pattern
    (r'<p class="trust-badge">✓ No ads\. Minimal analytics\. Independent of cruise lines\. <a href="/affiliate-disclosure\.html">Affiliate Disclosure</a></p>',
     '<p class="trust-badge">✓ No ads. Works offline. Independent of cruise lines. <a href="/affiliate-disclosure.html">Affiliate Disclosure</a></p>'),
    # With checkmark entity
    (r'<p class="trust-badge">&check; No ads\. Minimal analytics\. Independent of cruise lines\. <a href="/affiliate-disclosure\.html">Affiliate Disclosure</a></p>',
     '<p class="trust-badge">&check; No ads. Works offline. Independent of cruise lines. <a href="/affiliate-disclosure.html">Affiliate Disclosure</a></p>'),
]

def update_port_file(filepath):
    """Update a single port file with offline badge."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original = content

        # Check if already has "Works offline"
        if 'Works offline' in content:
            return False, "Already has offline badge"

        # Try each pattern
        for old_pattern, new_badge in OLD_BADGE_PATTERNS:
            if re.search(old_pattern, content):
                content = re.sub(old_pattern, new_badge, content)
                break

        if content == original:
            return False, "No matching trust badge found"

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

        return True, "Updated"
    except Exception as e:
        return False, str(e)

def main():
    updated = 0
    skipped = 0
    errors = 0

    port_files = list(PORTS_DIR.glob("*.html"))
    print(f"Found {len(port_files)} port files")

    for filepath in sorted(port_files):
        # Skip index/listing pages
        if filepath.name in ['tender-ports.html', 'index.html']:
            continue

        success, message = update_port_file(filepath)
        if success:
            updated += 1
            print(f"✓ {filepath.name}")
        elif "Already has" in message:
            skipped += 1
        else:
            errors += 1
            print(f"✗ {filepath.name}: {message}")

    print(f"\n--- Summary ---")
    print(f"Updated: {updated}")
    print(f"Skipped (already done): {skipped}")
    print(f"Errors: {errors}")
    print(f"Total processed: {updated + skipped + errors}")

if __name__ == "__main__":
    main()
