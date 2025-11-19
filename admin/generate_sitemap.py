#!/usr/bin/env python3
"""
Generate Sitemap
Soli Deo Gloria

Creates sitemap.xml with all public HTML pages.
"""

from pathlib import Path
from datetime import date

# Base URL
BASE_URL = "https://www.cruisinginthewake.com"

# Directories to exclude
EXCLUDE_PATTERNS = [
    '/vendors/', '/vendor/', '/admin/', '/solo/articles/',
    '/assets/', '/js/', '/css/', '/data/', '/meta/',
    '/__MACOSX/', '/drafts/', '/staging/', '/tmp/', '/standards/'
]

# Priority mappings
PRIORITY_MAP = {
    'index.html': '1.0',
    'planning.html': '0.8',
    'ships.html': '0.8',
    'restaurants.html': '0.8',
    'solo.html': '0.8',
    'travel.html': '0.9',
    'cruise-lines.html': '0.8',
    'ports.html': '0.8',
    'drink-calculator.html': '0.9',
    'articles.html': '0.8',
}

def get_priority(filepath):
    """Determine priority for a file"""
    name = filepath.name
    path_str = str(filepath)

    # Check specific file priorities
    if name in PRIORITY_MAP:
        return PRIORITY_MAP[name]

    # Directory-based priorities
    if '/restaurants/' in path_str:
        return '0.7'
    if '/ships/rcl/' in path_str:
        return '0.7'
    if '/cruise-lines/' in path_str:
        return '0.7'
    if '/solo/' in path_str:
        return '0.7'
    if '/authors/' in path_str:
        return '0.6'
    if '/ships/' in path_str:
        return '0.6'  # Non-RCL ships lower priority

    # Default priorities
    if name in ['privacy.html', 'terms.html']:
        return '0.5'
    if name in ['about-us.html', 'accessibility.html', 'packing-lists.html']:
        return '0.6'

    return '0.6'

def get_changefreq(filepath):
    """Determine change frequency for a file"""
    name = filepath.name
    if name in ['privacy.html', 'terms.html']:
        return 'monthly'
    return 'weekly'

def should_include(filepath):
    """Check if file should be in sitemap"""
    path_str = str(filepath)

    for pattern in EXCLUDE_PATTERNS:
        if pattern in path_str:
            return False

    # Skip offline.html and other utility pages
    if filepath.name in ['offline.html', '404.html', 'template.html']:
        return False

    return True

def generate_sitemap():
    """Generate sitemap XML"""
    root = Path('/home/user/InTheWake')
    html_files = list(root.rglob('*.html'))

    # Filter and sort files
    files = [f for f in html_files if should_include(f)]
    files = sorted(files, key=lambda x: str(x))

    today = date.today().isoformat()

    # Build XML
    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]

    for filepath in files:
        # Get relative path from root
        rel_path = filepath.relative_to(root)
        url = f"{BASE_URL}/{rel_path}"

        priority = get_priority(filepath)
        changefreq = get_changefreq(filepath)

        xml_lines.append('  <url>')
        xml_lines.append(f'    <loc>{url}</loc>')
        xml_lines.append(f'    <lastmod>{today}</lastmod>')
        xml_lines.append(f'    <changefreq>{changefreq}</changefreq>')
        xml_lines.append(f'    <priority>{priority}</priority>')
        xml_lines.append('  </url>')

    xml_lines.append('</urlset>')

    return '\n'.join(xml_lines), len(files)

def main():
    """Main function"""
    xml_content, count = generate_sitemap()

    output_path = Path('/home/user/InTheWake/sitemap.xml')
    with open(output_path, 'w') as f:
        f.write(xml_content)

    print(f"✅ Generated sitemap.xml with {count} URLs")

if __name__ == '__main__':
    main()
