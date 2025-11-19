#!/usr/bin/env python3
"""
Find broken internal links in the In the Wake repository.
Scans all HTML files for links to local files that don't exist.
"""

import os
import re
from pathlib import Path
from collections import defaultdict
from urllib.parse import urlparse, unquote

def find_broken_links(project_root: Path) -> dict:
    """Find all broken internal links in HTML files."""

    broken_links = defaultdict(list)  # {target_url: [source_files]}
    all_files = set()

    # Build set of all existing files
    for filepath in project_root.rglob('*'):
        if filepath.is_file():
            # Store both absolute and relative paths
            rel_path = '/' + str(filepath.relative_to(project_root))
            all_files.add(rel_path)
            # Also add without .html extension for directory-style URLs
            if rel_path.endswith('.html'):
                all_files.add(rel_path[:-5])
                all_files.add(rel_path[:-5] + '/')

    # Add index.html variants
    for filepath in project_root.rglob('index.html'):
        rel_path = '/' + str(filepath.relative_to(project_root))
        dir_path = str(Path(rel_path).parent)
        if dir_path != '/':
            all_files.add(dir_path)
            all_files.add(dir_path + '/')

    # Pattern to find href and src attributes
    link_pattern = re.compile(r'(?:href|src)=["\']([^"\']+)["\']', re.IGNORECASE)

    # Scan all HTML files
    html_files = list(project_root.rglob('*.html'))

    for filepath in html_files:
        # Skip vendor and admin directories for source (but check their links)
        rel_source = str(filepath.relative_to(project_root))

        try:
            content = filepath.read_text(encoding='utf-8')
        except Exception:
            continue

        # Find all links
        for match in link_pattern.finditer(content):
            url = match.group(1)

            # Skip external links, anchors, javascript, mailto, tel
            if any(url.startswith(prefix) for prefix in [
                'http://', 'https://', '//', '#', 'javascript:',
                'mailto:', 'tel:', 'data:', 'blob:'
            ]):
                continue

            # Skip empty or whitespace
            if not url.strip():
                continue

            # Parse the URL
            parsed = urlparse(url)
            path = unquote(parsed.path)

            # Skip if no path
            if not path:
                continue

            # Handle relative paths
            if not path.startswith('/'):
                # Convert to absolute path based on source file location
                source_dir = '/' + str(filepath.parent.relative_to(project_root))
                if source_dir == '/.':
                    source_dir = '/'
                path = os.path.normpath(os.path.join(source_dir, path))
                path = path.replace('\\', '/')  # Windows compat

            # Normalize path
            path = os.path.normpath(path).replace('\\', '/')
            if not path.startswith('/'):
                path = '/' + path

            # Remove query strings and fragments for file check
            clean_path = path.split('?')[0].split('#')[0]

            # Skip assets that likely exist (common patterns)
            skip_patterns = [
                '/assets/icons/', '/assets/img/', '/assets/ships/',
                '/assets/articles/', '/authors/img/', '/authors/tinas-images/',
                '.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.ico',
                '.css', '.js', '.json', '.pdf', '.mp4', '.webm'
            ]

            # Check if it's a likely asset
            is_asset = any(pat in clean_path.lower() for pat in skip_patterns)

            # For HTML pages, check if file exists
            if clean_path.endswith('.html') or (not is_asset and '.' not in Path(clean_path).name):
                # Check various forms
                exists = False
                check_paths = [clean_path]

                if not clean_path.endswith('.html'):
                    check_paths.append(clean_path + '.html')
                    check_paths.append(clean_path + '/index.html')

                for check in check_paths:
                    if check in all_files:
                        exists = True
                        break
                    # Also check actual filesystem
                    full_path = project_root / check.lstrip('/')
                    if full_path.exists():
                        exists = True
                        break

                if not exists:
                    broken_links[clean_path].append(rel_source)

    return broken_links

def main():
    project_root = Path(__file__).parent.parent

    print("Scanning for broken internal links...")
    print()

    broken = find_broken_links(project_root)

    if not broken:
        print("No broken links found!")
        return

    # Sort by number of occurrences
    sorted_broken = sorted(broken.items(), key=lambda x: -len(x[1]))

    print(f"Found {len(broken)} broken links:\n")

    for target, sources in sorted_broken:
        print(f"❌ {target}")
        print(f"   Referenced from {len(sources)} file(s):")
        for source in sources[:5]:  # Show first 5
            print(f"     - {source}")
        if len(sources) > 5:
            print(f"     ... and {len(sources) - 5} more")
        print()

    # Summary
    total_refs = sum(len(s) for s in broken.values())
    print(f"\nSummary: {len(broken)} missing files, {total_refs} total broken references")

if __name__ == "__main__":
    main()
