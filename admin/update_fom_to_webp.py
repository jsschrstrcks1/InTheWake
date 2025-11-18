#!/usr/bin/env python3
"""
Update FOM gallery image references from .jpeg to .webp
Only updates files where corresponding .webp exists
"""
import os
import glob
import re

# Get all WebP FOM files
webp_files = set()
for filepath in glob.glob('assets/ships/*-fom-*.webp'):
    filename = os.path.basename(filepath)
    webp_files.add(filename)

print(f"Found {len(webp_files)} FOM WebP files available\n")

# Get all HTML files that reference FOM images
html_files = []
for filepath in glob.glob('ships/**/*.html', recursive=True):
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        if re.search(r'-FOM-[\s-]*\d+\.jpe?g', content, re.IGNORECASE):
            html_files.append(filepath)
    except:
        pass

print(f"Found {len(html_files)} HTML files with FOM references\n")

updated = 0
skipped = 0

for filepath in html_files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        print(f"ERROR: Could not read {filepath}")
        skipped += 1
        continue

    original = content

    # Replace -FOM- - {num}.jpeg with -fom-{num}.webp
    # This handles both "FOM- - 1" and "FOM-1" patterns
    content = re.sub(
        r'-FOM-\s*-\s*(\d+)\.jpeg',
        r'-fom-\1.webp',
        content,
        flags=re.IGNORECASE
    )
    content = re.sub(
        r'-FOM-\s*-\s*(\d+)\.jpg',
        r'-fom-\1.webp',
        content,
        flags=re.IGNORECASE
    )
    # Also handle "FOM-1" without spaces
    content = re.sub(
        r'-FOM-(\d+)\.jpeg',
        r'-fom-\1.webp',
        content,
        flags=re.IGNORECASE
    )
    content = re.sub(
        r'-FOM-(\d+)\.jpg',
        r'-fom-\1.webp',
        content,
        flags=re.IGNORECASE
    )

    changes = len(re.findall(r'-fom-\d+\.webp', content, re.IGNORECASE))

    if content == original:
        # print(f"SKIP: {filepath} (no changes)")
        skipped += 1
        continue

    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ {filepath}: {changes} refs updated")
        updated += 1
    except Exception as e:
        print(f"ERROR writing {filepath}: {e}")
        skipped += 1

print(f"\nSUMMARY: {updated} files updated, {skipped} unchanged")
