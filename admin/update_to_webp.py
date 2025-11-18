#!/usr/bin/env python3
"""
Update HTML and JS files to use WebP instead of JPG/JPEG
Excludes logo_wake.png - must stay as PNG
"""
import re
import sys

def update_html_to_webp(filepath):
    """Update a single HTML file to use WebP"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return False, "Could not read file"

    original = content

    # Replace .jpg and .jpeg with .webp in assets/ships/ references
    # Pattern handles: quotes, attributes, JS strings, onerror handlers
    content = re.sub(
        r'(assets/ships/[^"\s\)\']+)\.jpg',
        r'\1.webp',
        content,
        flags=re.IGNORECASE
    )
    content = re.sub(
        r'(assets/ships/[^"\s\)\']+)\.jpeg',
        r'\1.webp',
        content,
        flags=re.IGNORECASE
    )

    # Safety check: ensure logo_wake stays as .png
    content = re.sub(
        r'logo_wake\.webp',
        'logo_wake.png',
        content,
        flags=re.IGNORECASE
    )

    if content == original:
        return False, "No changes needed"

    # Count changes
    jpg_before = len(re.findall(r'assets/ships/[^"\s]+\.(?:jpg|jpeg)', original, re.IGNORECASE))
    webp_after = len(re.findall(r'assets/ships/[^"\s]+\.webp', content, re.IGNORECASE))

    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True, f"Updated {jpg_before} refs → {webp_after} WebP refs"
    except Exception as e:
        return False, f"Could not write file: {e}"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: update_to_webp.py <filepath>")
        sys.exit(1)

    filepath = sys.argv[1]
    success, msg = update_html_to_webp(filepath)
    print(f"{filepath}: {msg}")
    sys.exit(0 if success else 1)
