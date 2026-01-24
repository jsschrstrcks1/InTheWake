#!/usr/bin/env python3
"""
Second-pass optimization for images still over 1MB.
More aggressive settings: max 1600px, quality 70.
"""

import os
import subprocess
from pathlib import Path

PORTS_IMG_DIR = "ports/img"
MAX_WIDTH = 1600
QUALITY = 70
MIN_SIZE_KB = 1024  # Only process files over 1MB

def get_file_size_kb(filepath):
    return os.path.getsize(filepath) // 1024

def optimize_image(filepath):
    """Aggressively optimize a large image."""
    original_kb = get_file_size_kb(filepath)

    if original_kb < MIN_SIZE_KB:
        return None

    tmp_file = f"{filepath}.tmp"

    try:
        # More aggressive compression
        cmd = [
            "convert", filepath,
            "-resize", f"{MAX_WIDTH}x>",
            "-quality", str(QUALITY),
            "-strip",
            tmp_file
        ]

        result = subprocess.run(cmd, capture_output=True, timeout=120)

        if result.returncode == 0 and os.path.exists(tmp_file):
            new_kb = get_file_size_kb(tmp_file)

            if new_kb < original_kb:
                os.replace(tmp_file, filepath)
                return (original_kb, new_kb)
            else:
                os.remove(tmp_file)
                return (original_kb, original_kb)
        else:
            if os.path.exists(tmp_file):
                os.remove(tmp_file)
            return None

    except Exception as e:
        if os.path.exists(tmp_file):
            os.remove(tmp_file)
        return None

def main():
    # Find all large images
    large_images = []
    for root, dirs, files in os.walk(PORTS_IMG_DIR):
        for f in files:
            if f.endswith('.webp') and not f.endswith('.attr.json'):
                filepath = os.path.join(root, f)
                size_kb = get_file_size_kb(filepath)
                if size_kb >= MIN_SIZE_KB:
                    large_images.append((filepath, size_kb))

    large_images.sort(key=lambda x: x[1], reverse=True)

    print(f"Second-Pass Image Optimizer")
    print(f"=" * 60)
    print(f"Found {len(large_images)} images over 1MB")
    print(f"Max width: {MAX_WIDTH}px | Quality: {QUALITY}")
    print(f"=" * 60)
    print()

    total_saved = 0
    optimized = 0

    for i, (filepath, original_kb) in enumerate(large_images, 1):
        filename = os.path.basename(filepath)
        print(f"[{i}/{len(large_images)}] {filename} ({original_kb:,}KB)...", end=" ", flush=True)

        result = optimize_image(filepath)

        if result:
            orig, new = result
            if new < orig:
                saved = orig - new
                total_saved += saved
                optimized += 1
                print(f"✓ {new:,}KB (saved {saved:,}KB)")
            else:
                print(f"○ kept")
        else:
            print(f"✗ error")

    print()
    print(f"=" * 60)
    print(f"Optimized: {optimized} images")
    print(f"Saved: {total_saved:,}KB ({total_saved/1024:.1f}MB)")
    print(f"=" * 60)

if __name__ == "__main__":
    main()
