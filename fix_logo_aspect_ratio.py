#!/usr/bin/env python3
"""
Fix logo aspect ratio by cropping transparent padding and creating proper resized versions
"""

from PIL import Image
import os

def crop_to_content(img):
    """Crop image to non-transparent content"""
    # Get bounding box of non-transparent pixels
    bbox = img.getbbox()
    if bbox:
        return img.crop(bbox)
    return img

def create_proper_logos():
    """Create properly-sized logos from the square source"""
    print("\n" + "="*60)
    print("FIXING LOGO ASPECT RATIOS")
    print("="*60)

    source_path = "assets/logo_wake.png"
    if not os.path.exists(source_path):
        print(f"❌ Source logo not found: {source_path}")
        return False

    # Open source image
    img = Image.open(source_path)
    print(f"Source: {img.size[0]}x{img.size[1]} (square canvas)")

    # Crop to actual content (remove transparent padding)
    cropped = crop_to_content(img)
    content_width, content_height = cropped.size
    content_ratio = content_width / content_height

    print(f"Actual content: {content_width}x{content_height} ({content_ratio:.2f}:1)")

    # Define target sizes based on the actual content aspect ratio
    sizes = [
        (256, "logo_wake_256.png", "Navbar 1x"),
        (512, "logo_wake_512.png", "Navbar 2x"),
        (560, "logo_wake_560.png", "Hero 1x"),
        (1120, "logo_wake_1120.png", "Hero 2x"),
    ]

    total_saved = 0
    print(f"\nCreating resized versions (maintaining {content_ratio:.2f}:1 aspect ratio):")

    for target_width, filename, desc in sizes:
        output_path = f"assets/{filename}"

        # Calculate height to maintain aspect ratio
        target_height = round(target_width / content_ratio)

        # Resize cropped content
        resized = cropped.resize((target_width, target_height), Image.Resampling.LANCZOS)

        # Get old size if exists
        old_size = 0
        if os.path.exists(output_path):
            old_size = os.path.getsize(output_path) / 1024

        # Save with optimization
        resized.save(output_path, "PNG", optimize=True)

        new_size = os.path.getsize(output_path) / 1024

        print(f"✓ {desc:12} {target_width}x{target_height} → {new_size:.1f} KB")

    print(f"\n✓ All logos recreated with proper aspect ratio ({content_ratio:.2f}:1)")
    print(f"  The logos will now display correctly without distortion")
    return True

if __name__ == '__main__':
    os.chdir('/home/user/InTheWake')
    create_proper_logos()
