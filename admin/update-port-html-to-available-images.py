#!/usr/bin/env python3
"""
Update port HTML pages to use only available images.
Replaces all legacy image paths with available images from /ports/img/
"""

import os
import re
import glob

PORTS_DIR = "ports"
PORTS_IMG_DIR = "ports/img"

def get_port_name_from_file(filepath):
    """Extract port name from HTML filename."""
    basename = os.path.basename(filepath)
    return basename.replace(".html", "")

def get_available_images(port_name):
    """Get list of available images for a port."""
    img_dir = os.path.join(PORTS_IMG_DIR, port_name)
    if not os.path.isdir(img_dir):
        return []

    images = []
    for f in sorted(os.listdir(img_dir)):
        if f.endswith('.webp') and not f.endswith('.attr.json'):
            images.append(f)
    return images

def update_port_html(filepath):
    """Update a port HTML file to use available images."""
    port_name = get_port_name_from_file(filepath)
    available = get_available_images(port_name)

    if not available:
        return 0, []

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    changes = 0
    missing = []

    # Find all legacy image paths
    patterns = [
        (r'/assets/ports/[^/]+/([^"\']+\.(webp|jpg|jpeg|png))', 'assets_ports'),
        (r'/assets/images/ports/([^"\']+\.(webp|jpg|jpeg|png))', 'assets_images'),
        (r'/images/ports/([^"\']+\.(webp|jpg|jpeg|png))', 'images_ports'),
    ]

    # Build available image mapping
    available_map = {}
    for img in available:
        available_map[img] = f"/ports/img/{port_name}/{img}"
        base = os.path.splitext(img)[0]
        available_map[base] = f"/ports/img/{port_name}/{img}"
        # Also map without port prefix
        if base.startswith(port_name + "-"):
            simple = base[len(port_name)+1:]
            available_map[simple] = f"/ports/img/{port_name}/{img}"

    # Standard image ordering for replacement
    standard_order = ['hero', 'harbor', 'landmark', 'attraction-1', 'attraction-2',
                      'attraction-3', 'food', 'street', 'panorama', 'gallery-1',
                      'gallery-2', 'gallery-3']

    # Map available images to standard names
    available_by_type = {}
    for img in available:
        base = os.path.splitext(img)[0]
        if base.startswith(port_name + "-"):
            img_type = base[len(port_name)+1:]
            available_by_type[img_type] = f"/ports/img/{port_name}/{img}"

    # Find all image references in the file
    all_img_refs = re.findall(r'src="([^"]*(?:assets/ports|assets/images/ports|images/ports)[^"]*)"', content)

    if not all_img_refs:
        return 0, []

    # Create replacement mapping
    replacement_idx = 0
    replacements = {}

    for old_path in all_img_refs:
        if old_path in replacements:
            continue

        # Extract the image name from the path
        img_name = os.path.basename(old_path)
        base_name = os.path.splitext(img_name)[0]

        # Try to find matching available image
        new_path = None

        # Check if base name matches an available type
        for atype, apath in available_by_type.items():
            if atype in base_name.lower() or base_name.lower() in atype:
                new_path = apath
                break

        # Check for hero specifically
        if not new_path and 'hero' in base_name.lower():
            new_path = available_by_type.get('hero')

        # Check for harbor/port
        if not new_path and any(x in base_name.lower() for x in ['harbor', 'port', 'marina', 'terminal']):
            new_path = available_by_type.get('harbor')

        # Check for food
        if not new_path and any(x in base_name.lower() for x in ['food', 'cuisine', 'dish', 'meal']):
            new_path = available_by_type.get('food')

        # Check for street/city
        if not new_path and any(x in base_name.lower() for x in ['street', 'city', 'town', 'village']):
            new_path = available_by_type.get('street')

        # Check for landmark/monument
        if not new_path and any(x in base_name.lower() for x in ['landmark', 'monument', 'temple', 'church', 'cathedral']):
            new_path = available_by_type.get('landmark')

        # Check for panorama/view
        if not new_path and any(x in base_name.lower() for x in ['panorama', 'view', 'scenic', 'aerial']):
            new_path = available_by_type.get('panorama') or available_by_type.get('hero')

        # Fallback: use next available image in order
        if not new_path:
            for img_type in standard_order:
                if img_type in available_by_type:
                    # Check if this type was already used
                    if available_by_type[img_type] not in replacements.values():
                        new_path = available_by_type[img_type]
                        break

        # Ultimate fallback: use hero or first available
        if not new_path:
            new_path = available_by_type.get('hero') or f"/ports/img/{port_name}/{available[0]}"

        replacements[old_path] = new_path

    # Apply replacements
    for old_path, new_path in replacements.items():
        if old_path != new_path:
            content = content.replace(f'src="{old_path}"', f'src="{new_path}"')
            content = content.replace(f"src='{old_path}'", f"src='{new_path}'")
            changes += 1

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

    return changes, missing

def main():
    total_changes = 0
    files_updated = 0

    for filepath in sorted(glob.glob(f"{PORTS_DIR}/*.html")):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check if has legacy paths
        legacy_patterns = ['/images/ports/', '/assets/ports/', '/assets/images/ports/']
        if any(p in content for p in legacy_patterns):
            port = get_port_name_from_file(filepath)
            changes, missing = update_port_html(filepath)
            if changes > 0:
                print(f"{port}: {changes} paths updated")
                total_changes += changes
                files_updated += 1

    print(f"\n{'='*60}")
    print(f"Total: {files_updated} files updated, {total_changes} paths fixed")

if __name__ == "__main__":
    main()
