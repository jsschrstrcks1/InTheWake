#!/usr/bin/env python3
"""
Update hero image references from .jpeg/.jpg to .webp
Only updates if corresponding .webp file exists
"""
import os
import glob
import re

# Get all WebP hero files (non-FOM)
webp_files = set()
for filepath in glob.glob('assets/ships/*.webp'):
    filename = os.path.basename(filepath)
    # Exclude FOM files
    if '-fom-' not in filename.lower():
        # Strip extension to get base name
        base = os.path.splitext(filename)[0]
        webp_files.add(base)

print(f"Found {len(webp_files)} hero WebP files available:")
for f in sorted(webp_files)[:10]:
    print(f"  {f}.webp")
if len(webp_files) > 10:
    print(f"  ... and {len(webp_files) - 10} more")
print()

updated_files = []

# Find and update HTML files
html_files = glob.glob('ships/**/*.html', recursive=True)

for filepath in html_files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        continue

    original = content
    changes = []

    # Find all JPG/JPEG references in assets/ships/
    for match in re.finditer(r'(assets/ships/([a-z0-9-]+))\.(jpeg|jpg)', content, re.IGNORECASE):
        full_path = match.group(0)
        base_name = match.group(2)

        # Check if WebP equivalent exists (case insensitive)
        if base_name.lower() in [w.lower() for w in webp_files]:
            # Don't update if this is a FOM image (handled separately)
            if '-fom-' not in base_name.lower():
                changes.append((full_path, match.group(1) + '.webp'))

    if not changes:
        continue

    # Apply replacements
    for old, new in changes:
        content = content.replace(old, new)

    if content != original:
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ {filepath}: {len(changes)} refs updated")
            updated_files.append(filepath)
        except Exception as e:
            print(f"ERROR writing {filepath}: {e}")

print(f"\nSUMMARY: {len(updated_files)} files updated")
