#!/usr/bin/env python3
"""
Social Image Generator for In the Wake
Generates 1200x630px Open Graph / Twitter Card images for ship pages.

Usage:
  python3 scripts/generate-social-images.py                    # Generate all
  python3 scripts/generate-social-images.py --ship radiance-of-the-seas  # Single ship
  python3 scripts/generate-social-images.py --audit            # Check missing images
"""

import os
import sys
import json
import argparse
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# Constants
OG_WIDTH = 1200
OG_HEIGHT = 630
ASSETS_DIR = Path(__file__).parent.parent / "assets"
SHIPS_IMG_DIR = ASSETS_DIR / "ships"
SOCIAL_DIR = ASSETS_DIR / "social"
LOGO_PATH = ASSETS_DIR / "logo_wake_256.png"
SHIPS_HTML_DIR = Path(__file__).parent.parent / "ships"

# Brand colors
BRAND_NAVY = (14, 110, 142)  # #0e6e8e
BRAND_ROPE = (217, 179, 130)  # #d9b382
OVERLAY_COLOR = (8, 48, 65, 200)  # Dark navy with alpha


def find_ship_image(ship_slug: str) -> Path | None:
    """Find the best source image for a ship."""
    # Common patterns for ship images
    patterns = [
        f"{ship_slug}.webp",
        f"{ship_slug}.jpg",
        f"{ship_slug}.jpeg",
        f"{ship_slug}.png",
        f"{ship_slug}1.webp",
        f"{ship_slug}1.jpg",
        f"{ship_slug}1.jpeg",
    ]

    # Check direct matches
    for pattern in patterns:
        img_path = SHIPS_IMG_DIR / pattern
        if img_path.exists():
            return img_path

    # Check for partial matches (ship name in filename)
    ship_name_parts = ship_slug.replace("-", " ").replace("_", " ").split()
    for img_file in SHIPS_IMG_DIR.glob("*"):
        if img_file.is_file() and img_file.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp"]:
            filename_lower = img_file.stem.lower().replace("-", " ").replace("_", " ")
            # Check if main ship name words appear in filename
            if len(ship_name_parts) >= 2:
                if ship_name_parts[0] in filename_lower and ship_name_parts[-1] in filename_lower:
                    return img_file

    return None


def format_ship_name(slug: str) -> str:
    """Convert slug to display name."""
    name = slug.replace("-", " ").replace("_", " ")
    # Title case with exceptions
    words = name.split()
    result = []
    for i, word in enumerate(words):
        if word.lower() in ["of", "the", "and"] and i > 0:
            result.append(word.lower())
        else:
            result.append(word.capitalize())
    return " ".join(result)


def create_social_image(ship_slug: str, source_image: Path | None = None, output_path: Path | None = None) -> Path | None:
    """Generate a social sharing image for a ship."""

    if output_path is None:
        output_path = SOCIAL_DIR / f"{ship_slug}.jpg"

    # Create base image
    if source_image and source_image.exists():
        try:
            img = Image.open(source_image)
            img = img.convert("RGB")

            # Calculate crop to 1200x630 aspect ratio (1.9:1)
            target_ratio = OG_WIDTH / OG_HEIGHT
            img_ratio = img.width / img.height

            if img_ratio > target_ratio:
                # Image is wider - crop sides
                new_width = int(img.height * target_ratio)
                left = (img.width - new_width) // 2
                img = img.crop((left, 0, left + new_width, img.height))
            else:
                # Image is taller - crop top/bottom
                new_height = int(img.width / target_ratio)
                top = (img.height - new_height) // 2
                img = img.crop((0, top, img.width, top + new_height))

            # Resize to target dimensions
            img = img.resize((OG_WIDTH, OG_HEIGHT), Image.Resampling.LANCZOS)

        except Exception as e:
            print(f"  Warning: Could not load {source_image}: {e}")
            img = create_placeholder_image()
    else:
        img = create_placeholder_image()

    # Add gradient overlay at bottom
    overlay = Image.new("RGBA", (OG_WIDTH, OG_HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Gradient from transparent to dark at bottom
    for y in range(OG_HEIGHT // 2, OG_HEIGHT):
        alpha = int(180 * (y - OG_HEIGHT // 2) / (OG_HEIGHT // 2))
        draw.line([(0, y), (OG_WIDTH, y)], fill=(8, 48, 65, alpha))

    # Composite overlay
    img = img.convert("RGBA")
    img = Image.alpha_composite(img, overlay)

    # Add logo (bottom left)
    try:
        logo = Image.open(LOGO_PATH).convert("RGBA")
        logo_height = 80
        logo_width = int(logo.width * (logo_height / logo.height))
        logo = logo.resize((logo_width, logo_height), Image.Resampling.LANCZOS)

        logo_x = 40
        logo_y = OG_HEIGHT - logo_height - 40
        img.paste(logo, (logo_x, logo_y), logo)
    except Exception as e:
        print(f"  Warning: Could not load logo: {e}")

    # Add ship name text
    draw = ImageDraw.Draw(img)
    ship_name = format_ship_name(ship_slug)

    # Try to load a font, fall back to default
    font_size = 48
    try:
        # Try common system fonts
        font_paths = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
        ]
        font = None
        for fp in font_paths:
            if os.path.exists(fp):
                font = ImageFont.truetype(fp, font_size)
                break
        if font is None:
            font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()

    # Position text (bottom right area)
    text_x = OG_WIDTH - 40
    text_y = OG_HEIGHT - 60

    # Draw text with shadow
    shadow_offset = 2
    draw.text((text_x + shadow_offset, text_y + shadow_offset), ship_name,
              font=font, fill=(0, 0, 0, 180), anchor="rb")
    draw.text((text_x, text_y), ship_name,
              font=font, fill=(255, 255, 255, 255), anchor="rb")

    # Add tagline
    tagline = "In the Wake — A Cruise Traveler's Logbook"
    try:
        small_font = ImageFont.truetype(font_paths[0] if 'font_paths' in dir() else "", 20)
    except:
        small_font = ImageFont.load_default()

    draw.text((logo_x + logo_width + 20, OG_HEIGHT - 55), tagline,
              font=small_font, fill=(255, 255, 255, 200))

    # Convert back to RGB and save
    img = img.convert("RGB")

    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)

    img.save(output_path, "JPEG", quality=85, optimize=True)
    return output_path


def create_placeholder_image() -> Image.Image:
    """Create a placeholder image when no source is available."""
    img = Image.new("RGB", (OG_WIDTH, OG_HEIGHT), BRAND_NAVY)
    draw = ImageDraw.Draw(img)

    # Add wave pattern
    for i in range(5):
        y = OG_HEIGHT - 100 + (i * 20)
        points = []
        for x in range(0, OG_WIDTH + 50, 50):
            wave_y = y + (15 if (x // 50) % 2 == 0 else -15)
            points.append((x, wave_y))
        if len(points) >= 2:
            draw.line(points, fill=BRAND_ROPE, width=3)

    return img


def get_all_ship_slugs() -> list[str]:
    """Get all ship slugs from HTML files."""
    slugs = []
    for cruise_line_dir in SHIPS_HTML_DIR.iterdir():
        if cruise_line_dir.is_dir() and cruise_line_dir.name not in ["assets", "social"]:
            for html_file in cruise_line_dir.glob("*.html"):
                if html_file.name != "index.html":
                    slugs.append(html_file.stem)
    return sorted(set(slugs))


def audit_social_images():
    """Check which ships are missing social images."""
    slugs = get_all_ship_slugs()
    missing = []
    existing = []

    for slug in slugs:
        social_path = SOCIAL_DIR / f"{slug}.jpg"
        if social_path.exists():
            existing.append(slug)
        else:
            missing.append(slug)

    print(f"\n=== Social Image Audit ===")
    print(f"Total ships: {len(slugs)}")
    print(f"Have social images: {len(existing)}")
    print(f"Missing social images: {len(missing)}")

    if missing:
        print(f"\nMissing images for:")
        for slug in missing[:20]:
            source = find_ship_image(slug)
            status = "has source" if source else "NO SOURCE"
            print(f"  - {slug} ({status})")
        if len(missing) > 20:
            print(f"  ... and {len(missing) - 20} more")

    return missing


def main():
    parser = argparse.ArgumentParser(description="Generate social sharing images for In the Wake")
    parser.add_argument("--ship", help="Generate for specific ship slug")
    parser.add_argument("--audit", action="store_true", help="Audit missing images")
    parser.add_argument("--all", action="store_true", help="Generate all missing images")
    parser.add_argument("--force", action="store_true", help="Regenerate even if exists")

    args = parser.parse_args()

    # Ensure directories exist
    SOCIAL_DIR.mkdir(parents=True, exist_ok=True)

    if args.audit:
        audit_social_images()
        return

    if args.ship:
        # Generate single ship
        source = find_ship_image(args.ship)
        print(f"Generating social image for: {args.ship}")
        print(f"  Source: {source or 'placeholder'}")
        output = create_social_image(args.ship, source)
        print(f"  Output: {output}")
        return

    if args.all:
        # Generate all missing (or all if --force)
        slugs = get_all_ship_slugs()
        generated = 0
        skipped = 0

        for slug in slugs:
            output_path = SOCIAL_DIR / f"{slug}.jpg"
            if output_path.exists() and not args.force:
                skipped += 1
                continue

            source = find_ship_image(slug)
            print(f"Generating: {slug}")
            create_social_image(slug, source, output_path)
            generated += 1

        print(f"\nDone! Generated: {generated}, Skipped: {skipped}")
        return

    # Default: show help
    parser.print_help()
    print("\n\nQuick start:")
    print("  python3 scripts/generate-social-images.py --audit    # See what's missing")
    print("  python3 scripts/generate-social-images.py --all      # Generate all")


if __name__ == "__main__":
    main()
