#!/usr/bin/env python3
"""
Comprehensive port image path fixer.
1. Renames generic numbered images to semantic names
2. Updates all image paths in HTML to use /ports/img/ structure
"""

import os
import re
import glob
import shutil

PORTS_DIR = "ports"
PORTS_IMG_DIR = "ports/img"

# Standard image name mapping (position -> semantic name)
STANDARD_NAMES = [
    "hero",
    "harbor",
    "landmark",
    "attraction-1",
    "attraction-2",
    "attraction-3",
    "food",
    "street",
    "panorama",
    "gallery-1",
    "gallery-2",
    "gallery-3",
]

def get_port_name_from_file(filepath):
    """Extract port name from HTML filename."""
    basename = os.path.basename(filepath)
    return basename.replace(".html", "")

def rename_generic_images(port_name):
    """Rename generic numbered images to semantic names."""
    img_dir = os.path.join(PORTS_IMG_DIR, port_name)
    if not os.path.isdir(img_dir):
        return {}

    renames = {}
    images = sorted([f for f in os.listdir(img_dir)
                    if f.endswith('.webp') and not f.endswith('.attr.json')])

    # Check if images are already semantically named
    has_hero = any('hero' in f.lower() for f in images)
    if has_hero:
        return {}  # Already has semantic names

    # Check for generic numbered pattern like "port-1.webp"
    numbered_pattern = re.compile(rf'^{re.escape(port_name)}-(\d+)\.webp$')
    numbered_images = [(f, int(numbered_pattern.match(f).group(1)))
                       for f in images if numbered_pattern.match(f)]

    if not numbered_images:
        return {}

    # Sort by number
    numbered_images.sort(key=lambda x: x[1])

    # Rename to semantic names
    for idx, (old_name, _) in enumerate(numbered_images):
        if idx < len(STANDARD_NAMES):
            new_name = f"{port_name}-{STANDARD_NAMES[idx]}.webp"
            old_path = os.path.join(img_dir, old_name)
            new_path = os.path.join(img_dir, new_name)

            if old_path != new_path and os.path.exists(old_path):
                shutil.move(old_path, new_path)
                # Also move attribution file if exists
                old_attr = old_path.replace('.webp', '.webp.attr.json')
                new_attr = new_path.replace('.webp', '.webp.attr.json')
                if os.path.exists(old_attr):
                    shutil.move(old_attr, new_attr)
                renames[old_name] = new_name
                print(f"    Renamed: {old_name} -> {new_name}")

    return renames

def get_available_images(port_name):
    """Get list of available images for a port."""
    img_dir = os.path.join(PORTS_IMG_DIR, port_name)
    if not os.path.isdir(img_dir):
        return {}

    images = {}
    for f in os.listdir(img_dir):
        if f.endswith('.webp') and not f.endswith('.attr.json'):
            images[f] = f
            # Also store base name without extension
            base = os.path.splitext(f)[0]
            images[base] = f
            # Store simplified name (without port prefix)
            if base.startswith(port_name + "-"):
                simple = base[len(port_name)+1:]
                images[simple] = f
    return images

def find_image_match(port_name, requested_name, available_images):
    """Find matching image for a requested name."""
    # Try exact match
    if requested_name in available_images:
        return available_images[requested_name]

    # Try without extension
    base = os.path.splitext(requested_name)[0]
    if base in available_images:
        return available_images[base]

    # Try with port prefix
    prefixed = f"{port_name}-{base}"
    if prefixed in available_images:
        return available_images[prefixed]

    # Try common name mappings
    name_mappings = {
        'hero': ['hero', 'panorama', 'skyline', 'aerial'],
        'harbor': ['harbor', 'port', 'marina', 'waterfront'],
        'landmark': ['landmark', 'attraction-1', 'monument'],
        'food': ['food', 'cuisine', 'restaurant'],
        'street': ['street', 'city', 'downtown'],
        'panorama': ['panorama', 'view', 'scenic'],
    }

    base_lower = base.lower()
    for key, alternatives in name_mappings.items():
        if key in base_lower:
            for alt in alternatives:
                test = f"{port_name}-{alt}"
                if test in available_images:
                    return available_images[test]

    return None

def update_html_paths(filepath, port_name, available_images):
    """Update all image paths in HTML to use new structure."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    changes = 0

    # Pattern for /assets/ports/[port]/[image].webp
    pattern1 = r'/assets/ports/([^/]+)/([^"\']+\.(webp|jpg|jpeg|png))'
    for match in re.finditer(pattern1, content):
        old_path = match.group(0)
        match_port = match.group(1)
        img_name = match.group(2)

        target_port = match_port
        target_images = get_available_images(target_port)

        if target_images:
            new_img = find_image_match(target_port, img_name, target_images)
            if new_img:
                new_path = f"/ports/img/{target_port}/{new_img}"
                content = content.replace(old_path, new_path)
                changes += 1
                print(f"    {old_path} -> {new_path}")

    # Pattern for /assets/images/ports/[image].webp
    pattern2 = r'/assets/images/ports/([^"\']+\.(webp|jpg|jpeg|png))'
    for match in re.finditer(pattern2, content):
        old_path = match.group(0)
        img_name = match.group(1)

        new_img = find_image_match(port_name, img_name, available_images)
        if new_img:
            new_path = f"/ports/img/{port_name}/{new_img}"
            content = content.replace(old_path, new_path)
            changes += 1
            print(f"    {old_path} -> {new_path}")

    # Pattern for /images/ports/[image].jpg
    pattern3 = r'/images/ports/([^"\']+\.(webp|jpg|jpeg|png))'
    for match in re.finditer(pattern3, content):
        old_path = match.group(0)
        img_name = match.group(1)

        new_img = find_image_match(port_name, img_name, available_images)
        if new_img:
            new_path = f"/ports/img/{port_name}/{new_img}"
            content = content.replace(old_path, new_path)
            changes += 1
            print(f"    {old_path} -> {new_path}")

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

    return changes

def process_port(filepath):
    """Process a single port page."""
    port_name = get_port_name_from_file(filepath)
    print(f"\n{port_name}:")

    # First rename any generic images
    rename_generic_images(port_name)

    # Get available images after renaming
    available_images = get_available_images(port_name)

    if not available_images:
        print(f"  No images available")
        return 0

    # Update HTML paths
    changes = update_html_paths(filepath, port_name, available_images)

    if changes:
        print(f"  {changes} path(s) updated")

    return changes

def main():
    total_changes = 0
    files_processed = 0

    # Process all port HTML files
    for filepath in sorted(glob.glob(f"{PORTS_DIR}/*.html")):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check if has legacy paths
        legacy_patterns = ['/images/ports/', '/assets/ports/', '/assets/images/ports/']
        if any(p in content for p in legacy_patterns):
            changes = process_port(filepath)
            total_changes += changes
            if changes > 0:
                files_processed += 1

    print(f"\n{'='*60}")
    print(f"Total: {files_processed} files updated, {total_changes} paths fixed")

if __name__ == "__main__":
    main()
