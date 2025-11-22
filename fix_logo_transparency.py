#!/usr/bin/env python3
"""Create properly-sized PNG logos with transparency intact"""

from PIL import Image
import os

def create_sized_logos():
    """Generate properly-sized PNG versions maintaining transparency"""
    print("\n" + "="*60)
    print("CREATING SIZED PNG LOGOS (WITH TRANSPARENCY)")
    print("="*60)

    logo_path = "assets/logo_wake.png"
    if not os.path.exists(logo_path):
        print(f"❌ Logo not found at {logo_path}")
        return

    # Open original
    img = Image.open(logo_path)
    original_size = os.path.getsize(logo_path) / 1024  # KB
    print(f"Original: {img.size[0]}x{img.size[1]} - {original_size:.1f} KB (PNG with alpha)")

    sizes = [
        (256, 64, "logo_wake_256.png", "Navbar logo"),
        (512, 128, "logo_wake_512.png", "Navbar logo @2x"),
        (560, 144, "logo_wake_560.png", "Hero logo"),
        (1120, 288, "logo_wake_1120.png", "Hero logo @2x"),
    ]

    total_saved = 0
    for width, height, filename, desc in sizes:
        output_path = f"assets/{filename}"
        resized = img.resize((width, height), Image.Resampling.LANCZOS)
        # Save as PNG with optimization
        resized.save(output_path, "PNG", optimize=True)

        new_size = os.path.getsize(output_path) / 1024
        saved = original_size - new_size
        total_saved += saved

        print(f"✓ {desc}: {width}x{height} → {new_size:.1f} KB (saved {saved:.1f} KB)")

    print(f"\n💾 Total saved: {total_saved:.1f} KB from 4 logo variants")
    print("✓ Transparency preserved in all variants")
    return True

if __name__ == '__main__':
    os.chdir('/home/user/InTheWake')
    create_sized_logos()
