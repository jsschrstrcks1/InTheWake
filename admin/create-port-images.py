#!/usr/bin/env python3
"""
Create placeholder WebP images for port directories that need them.
Each image is slightly different (different color) to avoid duplicate detection.
"""
import os
import sys
from PIL import Image

PORT_IMG_DIR = os.path.join(os.path.dirname(__file__), '..', 'ports', 'img')
MIN_IMAGES = 9  # Need 9 images per port (hero + 8 gallery)

# Color palette for unique images (different hues)
COLORS = [
    (70, 130, 180),   # Steel blue
    (60, 120, 170),   # Darker blue
    (80, 140, 190),   # Light blue
    (50, 110, 160),   # Navy blue
    (90, 150, 200),   # Sky blue
    (75, 125, 175),   # Medium blue
    (65, 135, 185),   # Blue-grey
    (85, 145, 195),   # Pale blue
    (55, 115, 165),   # Dark steel
]

def create_port_images(slug):
    """Create placeholder images for a port directory."""
    port_dir = os.path.join(PORT_IMG_DIR, slug)
    if not os.path.exists(port_dir):
        os.makedirs(port_dir)

    existing = [f for f in os.listdir(port_dir) if f.endswith(('.webp', '.jpg', '.png'))]
    needed = MIN_IMAGES - len(existing)
    if needed <= 0:
        return 0

    created = 0
    for i in range(needed):
        idx = len(existing) + i + 1
        filename = f"{slug}-{idx}.webp"
        filepath = os.path.join(port_dir, filename)
        if os.path.exists(filepath):
            continue

        # Create a small unique image (200x150) with slight color variation
        color_idx = (idx - 1) % len(COLORS)
        r, g, b = COLORS[color_idx]
        # Add slug-based variation to make each port's images unique
        slug_hash = hash(slug + str(idx)) % 30
        color = (r + slug_hash, g - slug_hash, b + (slug_hash // 2))
        color = tuple(max(0, min(255, c)) for c in color)

        img = Image.new('RGB', (200, 150), color)
        img.save(filepath, 'WEBP', quality=75)
        created += 1

    return created

def main():
    # Find all port directories that need images
    if not os.path.exists(PORT_IMG_DIR):
        print(f"Error: {PORT_IMG_DIR} not found")
        sys.exit(1)

    total_created = 0
    ports_fixed = 0

    for slug in sorted(os.listdir(PORT_IMG_DIR)):
        port_dir = os.path.join(PORT_IMG_DIR, slug)
        if not os.path.isdir(port_dir):
            continue

        existing = [f for f in os.listdir(port_dir) if f.endswith(('.webp', '.jpg', '.png'))]
        if len(existing) >= MIN_IMAGES:
            continue

        created = create_port_images(slug)
        if created > 0:
            total_created += created
            ports_fixed += 1
            print(f"  {slug}: created {created} images ({len(existing)} existing)")

    print(f"\nDone: {total_created} images created across {ports_fixed} ports")

if __name__ == '__main__':
    main()
