#!/usr/bin/env python3
"""
Remap port HTML image paths to available images.
Handles cases where HTML references specific names but we have standard names.
"""

import os
import re
import glob

PORTS_DIR = "ports"
PORTS_IMG_DIR = "ports/img"

def get_port_name_from_file(filepath):
    """Extract port name from HTML filename."""
    return os.path.basename(filepath).replace(".html", "")

def get_available_images(port_name):
    """Get list of available images for a port."""
    img_dir = os.path.join(PORTS_IMG_DIR, port_name)
    if not os.path.isdir(img_dir):
        return []
    return [f for f in os.listdir(img_dir)
            if f.endswith('.webp') and not f.endswith('.attr.json')]

def remap_port_images(filepath):
    """Remap image paths in HTML to available images."""
    port_name = get_port_name_from_file(filepath)
    available = get_available_images(port_name)

    if not available:
        return 0

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all image references for this port
    pattern = rf'/ports/img/{re.escape(port_name)}/([^"\']+\.webp)'
    matches = re.findall(pattern, content)

    if not matches:
        return 0

    # Check which images are missing
    missing = [m for m in matches if m not in available]

    if not missing:
        return 0

    # Create replacement mapping
    replacements = {}
    used = set()
    available_cycle = list(available)

    for missing_img in missing:
        # Find best replacement
        for avail in available_cycle:
            if avail not in used:
                replacements[missing_img] = avail
                used.add(avail)
                break
        else:
            # All images used, cycle from beginning
            used.clear()
            for avail in available_cycle:
                if avail not in used:
                    replacements[missing_img] = avail
                    used.add(avail)
                    break

    # Apply replacements
    original = content
    for old_img, new_img in replacements.items():
        old_path = f"/ports/img/{port_name}/{old_img}"
        new_path = f"/ports/img/{port_name}/{new_img}"
        content = content.replace(old_path, new_path)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return len(replacements)

    return 0

def main():
    total = 0
    updated = 0

    for filepath in sorted(glob.glob(f"{PORTS_DIR}/*.html")):
        port = get_port_name_from_file(filepath)
        changes = remap_port_images(filepath)
        if changes:
            print(f"{port}: {changes} images remapped")
            total += changes
            updated += 1

    print(f"\n{'='*60}")
    print(f"Total: {updated} files updated, {total} images remapped")

if __name__ == "__main__":
    main()
