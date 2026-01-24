#!/usr/bin/env python3
"""
Fix port page image paths to use new /ports/img/ structure.
Updates legacy paths like:
  - /images/ports/[port]-hero.jpg
  - /assets/ports/[port]/hero.webp
  - /assets/images/ports/[port]-hero.webp
To new structure:
  - /ports/img/[port]/[port]-hero.webp
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
        return {}

    images = {}
    for f in os.listdir(img_dir):
        if f.endswith(('.webp', '.jpg', '.jpeg', '.png')) and not f.endswith('.attr.json'):
            # Map both the full name and simplified versions
            images[f] = f
            # Also map without extension for matching
            base = os.path.splitext(f)[0]
            images[base] = f
    return images

def find_best_image_match(port_name, old_image_name, available_images):
    """Find the best matching new image for an old image reference."""
    # Extract the image type from old path
    # e.g., "trinidad-hero.jpg" -> "hero"
    # e.g., "hero.webp" -> "hero"

    old_base = os.path.splitext(old_image_name)[0]

    # Direct match with port prefix
    webp_name = f"{port_name}-{old_base.replace(port_name + '-', '')}.webp"
    if webp_name in available_images:
        return available_images[webp_name]

    # Try exact base match
    if old_base in available_images:
        return available_images[old_base]

    # Try with port prefix removed
    if old_base.startswith(port_name + "-"):
        suffix = old_base[len(port_name) + 1:]
        # Try port-suffix.webp
        test_name = f"{port_name}-{suffix}.webp"
        if test_name in available_images:
            return available_images[test_name]
        # Try just suffix.webp
        test_name = f"{suffix}.webp"
        if test_name in available_images:
            return available_images[test_name]

    # Try common mappings
    mappings = {
        "hero": ["hero", f"{port_name}-hero"],
        "harbor": ["harbor", f"{port_name}-harbor", "port"],
        "landmark": ["landmark", f"{port_name}-landmark"],
        "food": ["food", f"{port_name}-food"],
        "street": ["street", f"{port_name}-street"],
        "panorama": ["panorama", f"{port_name}-panorama"],
    }

    for key, alternatives in mappings.items():
        if key in old_base.lower():
            for alt in alternatives:
                test_name = f"{alt}.webp"
                if test_name in available_images:
                    return available_images[test_name]

    # Return first available image as fallback for hero
    if "hero" in old_base.lower():
        for name in available_images.values():
            if "hero" in name.lower():
                return name

    return None

def fix_port_page(filepath):
    """Fix image paths in a single port page."""
    port_name = get_port_name_from_file(filepath)
    available_images = get_available_images(port_name)

    if not available_images:
        print(f"  No images available for {port_name}")
        return 0

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    changes = 0

    # Pattern 1: /images/ports/[name].jpg or .webp
    pattern1 = r'(/images/ports/)([^"\']+\.(jpg|jpeg|png|webp))'
    for match in re.finditer(pattern1, content):
        old_path = match.group(0)
        old_name = match.group(2)
        new_image = find_best_image_match(port_name, old_name, available_images)
        if new_image:
            new_path = f"/ports/img/{port_name}/{new_image}"
            content = content.replace(old_path, new_path)
            changes += 1
            print(f"  {old_path} -> {new_path}")

    # Pattern 2: /assets/ports/[port]/[name].webp
    pattern2 = r'(/assets/ports/)([^/]+)/([^"\']+\.(jpg|jpeg|png|webp))'
    for match in re.finditer(pattern2, content):
        old_path = match.group(0)
        img_port = match.group(2)
        old_name = match.group(3)
        # Use the port from the path if different
        target_port = img_port if img_port else port_name
        target_images = get_available_images(target_port) if target_port != port_name else available_images
        if target_images:
            new_image = find_best_image_match(target_port, old_name, target_images)
            if new_image:
                new_path = f"/ports/img/{target_port}/{new_image}"
                content = content.replace(old_path, new_path)
                changes += 1
                print(f"  {old_path} -> {new_path}")

    # Pattern 3: /assets/images/ports/[name].webp
    pattern3 = r'(/assets/images/ports/)([^"\']+\.(jpg|jpeg|png|webp))'
    for match in re.finditer(pattern3, content):
        old_path = match.group(0)
        old_name = match.group(2)
        new_image = find_best_image_match(port_name, old_name, available_images)
        if new_image:
            new_path = f"/ports/img/{port_name}/{new_image}"
            content = content.replace(old_path, new_path)
            changes += 1
            print(f"  {old_path} -> {new_path}")

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  Updated {changes} image path(s)")

    return changes

def main():
    # Find all port HTML files with legacy image paths
    legacy_patterns = [
        '/images/ports/',
        '/assets/ports/',
        '/assets/images/ports/'
    ]

    total_changes = 0
    files_updated = 0

    for filepath in sorted(glob.glob(f"{PORTS_DIR}/*.html")):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        has_legacy = any(pattern in content for pattern in legacy_patterns)
        if has_legacy:
            print(f"\nProcessing: {filepath}")
            changes = fix_port_page(filepath)
            total_changes += changes
            if changes > 0:
                files_updated += 1

    print(f"\n{'='*60}")
    print(f"Total: {files_updated} files updated, {total_changes} image paths fixed")

if __name__ == "__main__":
    main()
