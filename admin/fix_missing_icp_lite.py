#!/usr/bin/env python3
"""
Fix Missing ICP-Lite Compliance
Soli Deo Gloria

Adds ICP-Lite tags to specific files that were missed.
"""

import re
from pathlib import Path
from datetime import date

FILES_TO_FIX = [
    '/home/user/InTheWake/ships/rcl/quantum-of-the-seas.html',
    '/home/user/InTheWake/ships/rcl/sovereign-of-the-seas.html',
    '/home/user/InTheWake/ships/rcl/spectrum-of-the-seas.html',
    '/home/user/InTheWake/ships/rcl/symphony-of-the-seas.html',
    '/home/user/InTheWake/ships/rcl/utopia-of-the-seas.html',
    '/home/user/InTheWake/ships/rcl/voyager-of-the-seas.html',
    '/home/user/InTheWake/ships/rcl/wonder-of-the-seas.html',
    '/home/user/InTheWake/solo/in-the-wake-of-grief.html',
]

def extract_summary(content):
    """Extract summary from existing meta description or title"""
    desc_match = re.search(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)["\']', content, re.IGNORECASE)
    if desc_match:
        return desc_match.group(1)[:200]

    title_match = re.search(r'<title>([^<]+)</title>', content, re.IGNORECASE)
    if title_match:
        title = title_match.group(1).replace(' | In the Wake', '').replace(' — In the Wake', '')
        return title.strip()

    return "Cruise travel information and guides"

def add_icp_lite(filepath):
    """Add ICP-Lite tags to a file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'content-protocol' in content:
        print(f"  Skipped (already has): {filepath}")
        return False

    summary = extract_summary(content)
    today = date.today().isoformat()

    icp_tags = f'''
  <meta name="ai-summary" content="{summary}">
  <meta name="last-reviewed" content="{today}">
  <meta name="content-protocol" content="ICP-Lite v1.0">'''

    # Try multiple insertion patterns
    patterns = [
        (r'(<meta\s+name=["\']referrer["\'][^>]*>)', r'\1' + icp_tags),
        (r'(<meta\s+name=["\']description["\']\s+content=["\'][^"\']+["\'][^>]*>)', r'\1' + icp_tags),
        (r'(<link\s+rel=["\']canonical["\'][^>]*>)', r'\1' + icp_tags),
        (r'(<meta\s+name=["\']viewport["\'][^>]*>)', r'\1' + icp_tags),
    ]

    for pattern, replacement in patterns:
        if re.search(pattern, content, re.IGNORECASE):
            new_content = re.sub(pattern, replacement, content, count=1, flags=re.IGNORECASE)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"  Updated: {filepath}")
            return True

    print(f"  FAILED - no pattern match: {filepath}")
    return False

def main():
    """Main function"""
    print(f"Fixing {len(FILES_TO_FIX)} files...")

    updated = 0
    for filepath in FILES_TO_FIX:
        if add_icp_lite(filepath):
            updated += 1

    print(f"\n✅ Updated {updated} files")

if __name__ == '__main__':
    main()
