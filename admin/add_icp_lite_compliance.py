#!/usr/bin/env python3
"""
Add ICP-Lite Compliance to HTML Pages
Soli Deo Gloria

Adds ICP-Lite v1.0 meta tags to all HTML pages:
- ai-summary (extracted from description or title)
- last-reviewed
- content-protocol
"""

import os
import re
from pathlib import Path
from datetime import date

# Directories to exclude
EXCLUDE_DIRS = {'vendors', 'solo/articles', 'admin'}

def should_process(filepath):
    """Check if file should be processed"""
    path_str = str(filepath)
    for exclude in EXCLUDE_DIRS:
        if f'/{exclude}/' in path_str or path_str.endswith(f'/{exclude}'):
            return False
    return True

def has_icp_lite(content):
    """Check if page already has ICP-Lite compliance"""
    return 'content-protocol' in content or 'ICP-Lite' in content

def extract_summary(content):
    """Extract summary from existing meta description or title"""
    # Try meta description first
    desc_match = re.search(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)["\']', content, re.IGNORECASE)
    if desc_match:
        return desc_match.group(1)[:200]

    # Fallback to title
    title_match = re.search(r'<title>([^<]+)</title>', content, re.IGNORECASE)
    if title_match:
        title = title_match.group(1).replace(' | In the Wake', '').replace(' — In the Wake', '')
        return title.strip()

    return "Cruise travel information and guides"

def add_icp_lite_tags(content):
    """Add ICP-Lite meta tags after existing meta tags"""
    summary = extract_summary(content)
    today = date.today().isoformat()

    icp_tags = f'''
  <meta name="ai-summary" content="{summary}">
  <meta name="last-reviewed" content="{today}">
  <meta name="content-protocol" content="ICP-Lite v1.0">'''

    # Find a good insertion point - after referrer or description meta
    patterns = [
        (r'(<meta\s+name=["\']referrer["\'][^>]*>)', r'\1' + icp_tags),
        (r'(<meta\s+name=["\']description["\'][^>]*>)', r'\1' + icp_tags),
        (r'(<meta\s+name=["\']viewport["\'][^>]*>)', r'\1' + icp_tags),
        (r'(<meta\s+charset=["\'][^"\']+["\'][^>]*>)', r'\1' + icp_tags),
    ]

    for pattern, replacement in patterns:
        if re.search(pattern, content, re.IGNORECASE):
            return re.sub(pattern, replacement, content, count=1, flags=re.IGNORECASE)

    # Fallback: insert after <head>
    return content.replace('<head>', '<head>' + icp_tags, 1)

def process_file(filepath):
    """Process a single HTML file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"  Error reading {filepath}: {e}")
        return False

    if has_icp_lite(content):
        return False

    new_content = add_icp_lite_tags(content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True

    return False

def main():
    """Main function"""
    root = Path('/home/user/InTheWake')
    html_files = list(root.rglob('*.html'))

    # Filter files
    files_to_process = [f for f in html_files if should_process(f)]

    print(f"Found {len(html_files)} total HTML files")
    print(f"Processing {len(files_to_process)} files (excluding vendors, solo/articles, admin)")

    updated = 0
    skipped = 0

    for filepath in sorted(files_to_process):
        if process_file(filepath):
            updated += 1
            if updated <= 10 or updated % 50 == 0:
                print(f"  Updated: {filepath.relative_to(root)}")
        else:
            skipped += 1

    print(f"\n✅ Complete!")
    print(f"   Updated: {updated} pages")
    print(f"   Skipped (already compliant): {skipped} pages")

if __name__ == '__main__':
    main()
