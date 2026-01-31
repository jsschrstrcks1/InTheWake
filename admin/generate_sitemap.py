#!/usr/bin/env python3
"""
Generate Sitemap
Soli Deo Gloria

Creates sitemap.xml with all public HTML pages.
Uses git ls-tree to enumerate files (works with sparse checkout).
"""

import subprocess
from pathlib import PurePosixPath
from datetime import date

# Base URL
BASE_URL = "https://cruisinginthewake.com"

# Directories to exclude (leading slash stripped for matching)
EXCLUDE_PATTERNS = [
    'vendors/', 'vendor/', 'admin/', 'solo/articles/',
    'assets/', 'js/', 'css/', 'data/', 'meta/',
    '__MACOSX/', 'drafts/', 'staging/', 'tmp/', 'standards/',
    'new-standards/', '.claude/', '.github/'
]

# Files to exclude
EXCLUDE_FILES = {'offline.html', '404.html', 'template.html', 'drinks.html'}

# Priority mappings for specific root-level filenames
PRIORITY_MAP = {
    'index.html': '1.0',
    'planning.html': '0.9',
    'travel.html': '0.9',
    'drink-calculator.html': '0.9',
    'first-cruise.html': '0.8',
    'ships.html': '0.8',
    'restaurants.html': '0.8',
    'solo.html': '0.8',
    'cruise-lines.html': '0.8',
    'ports.html': '0.8',
    'articles.html': '0.8',
    'drink-packages.html': '0.8',
    'stateroom-check.html': '0.7',
    'packing-lists.html': '0.7',
    'packing.html': '0.7',
    'internet-at-sea.html': '0.7',
    'search.html': '0.6',
    'about-us.html': '0.6',
    'accessibility.html': '0.6',
    'privacy.html': '0.4',
    'terms.html': '0.4',
    'affiliate-disclosure.html': '0.4',
}


def get_priority(path_str, name):
    """Determine priority for a file"""
    # Root-level pages use the priority map
    if '/' not in path_str:
        return PRIORITY_MAP.get(name, '0.6')

    # Directory-based priorities
    if path_str.startswith('ports/'):
        return '0.7'
    if path_str.startswith('restaurants/'):
        return '0.7'
    if path_str.startswith('ships/rcl/'):
        return '0.7'
    if path_str.startswith('cruise-lines/'):
        return '0.7'
    if path_str.startswith('solo/'):
        return '0.7'
    if path_str.startswith('authors/'):
        return '0.6'
    if path_str.startswith('ships/'):
        return '0.6'
    if path_str.startswith('tools/'):
        return '0.6'

    return '0.6'


def get_changefreq(name):
    """Determine change frequency for a file"""
    if name in ('privacy.html', 'terms.html', 'affiliate-disclosure.html'):
        return 'monthly'
    return 'weekly'


def should_include(path_str, name):
    """Check if file should be in sitemap"""
    # Check directory exclusions
    for pattern in EXCLUDE_PATTERNS:
        if path_str.startswith(pattern) or ('/' + pattern) in ('/' + path_str):
            return False

    # Check file exclusions
    if name in EXCLUDE_FILES:
        return False

    # Skip ship/cruise-line asset subdirectories
    if '/assets/' in path_str or '/images/' in path_str:
        return False

    return True


def get_all_html_files():
    """Get all HTML files from git (works regardless of sparse checkout)"""
    result = subprocess.run(
        ['git', 'ls-tree', '-r', '--name-only', 'HEAD'],
        capture_output=True, text=True, cwd='/home/user/InTheWake'
    )
    files = []
    for line in result.stdout.strip().split('\n'):
        if line.endswith('.html'):
            files.append(line)
    return sorted(files)


def generate_sitemap():
    """Generate sitemap XML"""
    all_files = get_all_html_files()

    # Filter files
    included = []
    for path_str in all_files:
        name = PurePosixPath(path_str).name
        if should_include(path_str, name):
            included.append((path_str, name))

    today = date.today().isoformat()

    # Build XML
    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]

    for path_str, name in included:
        url = f"{BASE_URL}/{path_str}"
        priority = get_priority(path_str, name)
        changefreq = get_changefreq(name)

        xml_lines.append('  <url>')
        xml_lines.append(f'    <loc>{url}</loc>')
        xml_lines.append(f'    <lastmod>{today}</lastmod>')
        xml_lines.append(f'    <changefreq>{changefreq}</changefreq>')
        xml_lines.append(f'    <priority>{priority}</priority>')
        xml_lines.append('  </url>')

    xml_lines.append('</urlset>')

    return '\n'.join(xml_lines), len(included)


def main():
    """Main function"""
    xml_content, count = generate_sitemap()

    output_path = '/home/user/InTheWake/sitemap.xml'
    with open(output_path, 'w') as f:
        f.write(xml_content)

    print(f"Generated sitemap.xml with {count} URLs")


if __name__ == '__main__':
    main()
