#!/usr/bin/env python3
"""
Optimize port images for web delivery.
- Resize to max 1920px width
- Compress to quality 82
- Target under 500KB per image
"""

import os
import subprocess
import sys
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

PORTS_IMG_DIR = "ports/img"
MAX_WIDTH = 1920
QUALITY = 82
MAX_SIZE_KB = 500
MAX_WORKERS = 4

def get_file_size_kb(filepath):
    """Get file size in KB."""
    return os.path.getsize(filepath) // 1024

def get_image_dimensions(filepath):
    """Get image width and height."""
    try:
        result = subprocess.run(
            ["identify", "-format", "%wx%h", filepath],
            capture_output=True, text=True, timeout=30
        )
        if result.returncode == 0:
            dims = result.stdout.strip()
            w, h = dims.split('x')
            return int(w), int(h)
    except:
        pass
    return None, None

def optimize_image(filepath):
    """Optimize a single image. Returns (filepath, original_kb, new_kb, status)."""
    original_kb = get_file_size_kb(filepath)

    # Skip if already small
    if original_kb < MAX_SIZE_KB:
        return (filepath, original_kb, original_kb, "skipped")

    width, height = get_image_dimensions(filepath)
    if width is None:
        return (filepath, original_kb, original_kb, "error")

    tmp_file = f"{filepath}.tmp"

    try:
        # Build convert command
        if width > MAX_WIDTH:
            # Resize and compress
            cmd = [
                "convert", filepath,
                "-resize", f"{MAX_WIDTH}x>",
                "-quality", str(QUALITY),
                "-strip",  # Remove metadata
                tmp_file
            ]
        else:
            # Just recompress
            cmd = [
                "convert", filepath,
                "-quality", str(QUALITY),
                "-strip",
                tmp_file
            ]

        result = subprocess.run(cmd, capture_output=True, timeout=120)

        if result.returncode == 0 and os.path.exists(tmp_file):
            new_kb = get_file_size_kb(tmp_file)

            # Keep if smaller
            if new_kb < original_kb:
                os.replace(tmp_file, filepath)
                return (filepath, original_kb, new_kb, "optimized")
            else:
                os.remove(tmp_file)
                return (filepath, original_kb, original_kb, "kept")
        else:
            if os.path.exists(tmp_file):
                os.remove(tmp_file)
            return (filepath, original_kb, original_kb, "error")

    except Exception as e:
        if os.path.exists(tmp_file):
            os.remove(tmp_file)
        return (filepath, original_kb, original_kb, "error")

def main():
    # Find all webp images
    images = []
    for root, dirs, files in os.walk(PORTS_IMG_DIR):
        for f in files:
            if f.endswith('.webp') and not f.endswith('.attr.json'):
                images.append(os.path.join(root, f))

    print(f"Port Image Optimizer")
    print(f"=" * 60)
    print(f"Found {len(images)} images")
    print(f"Max width: {MAX_WIDTH}px | Quality: {QUALITY} | Target: <{MAX_SIZE_KB}KB")
    print(f"=" * 60)
    print()

    # First pass: identify images that need optimization
    large_images = []
    for img in images:
        size_kb = get_file_size_kb(img)
        if size_kb >= MAX_SIZE_KB:
            large_images.append((img, size_kb))

    large_images.sort(key=lambda x: x[1], reverse=True)
    print(f"Images needing optimization: {len(large_images)}")
    print()

    if not large_images:
        print("All images are already optimized!")
        return

    # Process images
    total_saved = 0
    optimized_count = 0
    error_count = 0

    # Process largest first
    for i, (img, original_kb) in enumerate(large_images, 1):
        print(f"[{i}/{len(large_images)}] {os.path.basename(img)} ({original_kb:,}KB)...", end=" ", flush=True)

        filepath, orig, new, status = optimize_image(img)

        if status == "optimized":
            saved = orig - new
            total_saved += saved
            optimized_count += 1
            print(f"✓ {new:,}KB (saved {saved:,}KB)")
        elif status == "kept":
            print(f"○ kept original")
        elif status == "error":
            error_count += 1
            print(f"✗ error")
        else:
            print(f"- {status}")

    print()
    print(f"=" * 60)
    print(f"Summary:")
    print(f"  Optimized: {optimized_count} images")
    print(f"  Saved: {total_saved:,}KB ({total_saved/1024:.1f}MB)")
    if error_count:
        print(f"  Errors: {error_count}")
    print(f"=" * 60)

if __name__ == "__main__":
    main()
