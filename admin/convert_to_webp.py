#!/usr/bin/env python3
"""
Convert images to WebP format
Soli Deo Gloria

Usage:
  python3 convert_to_webp.py <input_path>
  python3 convert_to_webp.py --all  # Convert all images in the project
"""

import os
import sys
from pathlib import Path
from PIL import Image

def convert_to_webp(input_path, quality=85):
    """Convert an image to WebP format"""
    input_path = Path(input_path)

    # Skip if already WebP
    if input_path.suffix.lower() == '.webp':
        print(f"⏭️  Skipping {input_path} (already WebP)")
        return None

    # Check if WebP version already exists
    output_path = input_path.with_suffix('.webp')
    if output_path.exists():
        print(f"⏭️  Skipping {input_path} (WebP already exists)")
        return None

    try:
        # Open and convert
        with Image.open(input_path) as img:
            # Convert RGBA to RGB if necessary (WebP doesn't support RGBA well)
            if img.mode in ('RGBA', 'LA', 'P'):
                # Create white background
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                if img.mode in ('RGBA', 'LA'):
                    background.paste(img, mask=img.split()[-1])
                    img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')

            # Save as WebP
            img.save(output_path, 'WEBP', quality=quality, method=6)

            # Get file sizes
            original_size = input_path.stat().st_size
            webp_size = output_path.stat().st_size
            reduction = ((original_size - webp_size) / original_size) * 100

            print(f"✅ {input_path.name} → {output_path.name} ({reduction:.1f}% reduction)")
            return output_path

    except Exception as e:
        print(f"❌ Error converting {input_path}: {e}")
        return None

def find_images(directory, exclude_dirs=None):
    """Find all image files in directory"""
    if exclude_dirs is None:
        exclude_dirs = {'vendors', 'node_modules', '.git', '__pycache__'}

    extensions = {'.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'}
    images = []

    for root, dirs, files in os.walk(directory):
        # Remove excluded directories from search
        dirs[:] = [d for d in dirs if d not in exclude_dirs]

        for file in files:
            if Path(file).suffix in extensions:
                images.append(Path(root) / file)

    return images

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 convert_to_webp.py <input_path>")
        print("       python3 convert_to_webp.py --all")
        sys.exit(1)

    if sys.argv[1] == '--all':
        print("🔍 Finding all images in project...")
        images = find_images('.')
        print(f"📊 Found {len(images)} images to process\n")

        converted = 0
        for img in images:
            if convert_to_webp(img):
                converted += 1

        print(f"\n✨ Conversion complete! Converted {converted}/{len(images)} images")
    else:
        input_path = sys.argv[1]
        if os.path.isdir(input_path):
            images = find_images(input_path)
            print(f"📊 Found {len(images)} images in {input_path}\n")

            converted = 0
            for img in images:
                if convert_to_webp(img):
                    converted += 1

            print(f"\n✨ Conversion complete! Converted {converted}/{len(images)} images")
        else:
            convert_to_webp(input_path)

if __name__ == '__main__':
    main()
