#!/usr/bin/env python3
"""
Performance optimization: Optimize images for web delivery
- Convert logo to WebP with proper sizes
- Generate article thumbnails
- Optimize author avatars
- Convert hero images to WebP
"""

from PIL import Image
import os
from pathlib import Path
import json

def ensure_dir(path):
    """Create directory if it doesn't exist"""
    Path(path).mkdir(parents=True, exist_ok=True)

def optimize_logo():
    """Convert logo PNG to optimized WebP versions"""
    print("\n" + "="*60)
    print("OPTIMIZING LOGO")
    print("="*60)

    logo_path = "assets/logo_wake.png"
    if not os.path.exists(logo_path):
        print(f"❌ Logo not found at {logo_path}")
        return

    # Open original
    img = Image.open(logo_path)
    original_size = os.path.getsize(logo_path) / 1024  # KB
    print(f"Original: {img.size[0]}x{img.size[1]} - {original_size:.1f} KB")

    sizes = [
        (256, 64, "logo_wake_256.webp", "Navbar logo"),
        (512, 128, "logo_wake_512.webp", "Navbar logo @2x"),
        (560, 144, "logo_wake_560.webp", "Hero logo"),
        (1120, 288, "logo_wake_1120.webp", "Hero logo @2x"),
    ]

    total_saved = 0
    for width, height, filename, desc in sizes:
        output_path = f"assets/{filename}"
        resized = img.resize((width, height), Image.Resampling.LANCZOS)
        resized.save(output_path, "WebP", quality=85, method=6)

        new_size = os.path.getsize(output_path) / 1024
        saved = original_size - new_size
        total_saved += saved

        print(f"✓ {desc}: {width}x{height} → {new_size:.1f} KB (saved {saved:.1f} KB)")

    print(f"\n💾 Total saved: {total_saved:.1f} KB from 4 logo variants")
    return True

def generate_article_thumbnails():
    """Generate 200x200 WebP thumbnails for all article images"""
    print("\n" + "="*60)
    print("GENERATING ARTICLE THUMBNAILS")
    print("="*60)

    # Create thumbs directory
    thumbs_dir = "assets/articles/thumbs"
    ensure_dir(thumbs_dir)

    # Find all article images
    articles_dir = "assets/articles"
    image_extensions = ['.jpg', '.jpeg', '.png', '.webp']

    total_saved = 0
    count = 0

    for root, dirs, files in os.walk(articles_dir):
        # Skip thumbs directory
        if 'thumbs' in root:
            continue

        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in image_extensions:
                input_path = os.path.join(root, file)

                # Get relative path from articles dir
                rel_path = os.path.relpath(input_path, articles_dir)

                # Create output filename (always .webp)
                base_name = os.path.splitext(os.path.basename(file))[0]
                output_filename = f"{base_name}.webp"

                # Handle subdirectories
                if os.path.dirname(rel_path):
                    subdir = os.path.dirname(rel_path)
                    output_dir = os.path.join(thumbs_dir, subdir)
                    ensure_dir(output_dir)
                    output_path = os.path.join(output_dir, output_filename)
                else:
                    output_path = os.path.join(thumbs_dir, output_filename)

                try:
                    img = Image.open(input_path)
                    original_size = os.path.getsize(input_path) / 1024

                    # Create 200x200 thumbnail (crop to square, centered)
                    img.thumbnail((200, 200), Image.Resampling.LANCZOS)

                    # Crop to square if needed
                    width, height = img.size
                    if width != height:
                        size = min(width, height)
                        left = (width - size) // 2
                        top = (height - size) // 2
                        img = img.crop((left, top, left + size, top + size))

                    # Save as WebP
                    img.save(output_path, "WebP", quality=82, method=6)

                    new_size = os.path.getsize(output_path) / 1024
                    saved = original_size - new_size
                    total_saved += saved
                    count += 1

                    print(f"✓ {file} → {new_size:.1f} KB (saved {saved:.1f} KB)")

                except Exception as e:
                    print(f"❌ Error processing {file}: {e}")

    print(f"\n💾 Generated {count} thumbnails, saved {total_saved:.1f} KB total")
    return True

def optimize_author_avatars():
    """Optimize author avatar images"""
    print("\n" + "="*60)
    print("OPTIMIZING AUTHOR AVATARS")
    print("="*60)

    authors_dir = "authors/img"
    if not os.path.exists(authors_dir):
        print(f"❌ Authors directory not found: {authors_dir}")
        return

    total_saved = 0
    count = 0

    for file in os.listdir(authors_dir):
        if file.endswith('.webp') or file.endswith('.jpg') or file.endswith('.png'):
            input_path = os.path.join(authors_dir, file)

            try:
                img = Image.open(input_path)
                original_size = os.path.getsize(input_path) / 1024

                # Generate two sizes: 96x96 and 192x192 (for retina)
                base_name = os.path.splitext(file)[0]

                sizes = [
                    (96, f"{base_name}_96.webp"),
                    (192, f"{base_name}_192.webp"),
                ]

                for size, output_file in sizes:
                    output_path = os.path.join(authors_dir, output_file)
                    resized = img.resize((size, size), Image.Resampling.LANCZOS)
                    resized.save(output_path, "WebP", quality=85, method=6)

                    new_size = os.path.getsize(output_path) / 1024
                    saved = original_size - new_size
                    total_saved += saved

                    print(f"✓ {file} → {size}x{size}: {new_size:.1f} KB (saved {saved:.1f} KB)")
                    count += 1

            except Exception as e:
                print(f"❌ Error processing {file}: {e}")

    print(f"\n💾 Generated {count} avatar variants, saved {total_saved:.1f} KB total")
    return True

def convert_hero_images():
    """Convert hero images to WebP"""
    print("\n" + "="*60)
    print("CONVERTING HERO IMAGES TO WEBP")
    print("="*60)

    hero_images = [
        "assets/index_hero.jpg",
        # Add more hero images as needed
    ]

    total_saved = 0
    count = 0

    for img_path in hero_images:
        if not os.path.exists(img_path):
            print(f"⚠️  {img_path} not found, skipping")
            continue

        try:
            img = Image.open(img_path)
            original_size = os.path.getsize(img_path) / 1024

            # Create WebP version
            base_name = os.path.splitext(img_path)[0]
            output_path = f"{base_name}.webp"

            img.save(output_path, "WebP", quality=85, method=6)

            new_size = os.path.getsize(output_path) / 1024
            saved = original_size - new_size
            total_saved += saved
            count += 1

            print(f"✓ {os.path.basename(img_path)} → {new_size:.1f} KB (saved {saved:.1f} KB)")

        except Exception as e:
            print(f"❌ Error processing {img_path}: {e}")

    print(f"\n💾 Converted {count} hero images, saved {total_saved:.1f} KB total")
    return True

def update_articles_index():
    """Update articles/index.json to include thumbnail URLs"""
    print("\n" + "="*60)
    print("UPDATING ARTICLES INDEX")
    print("="*60)

    index_path = "assets/data/articles/index.json"
    if not os.path.exists(index_path):
        print(f"❌ Articles index not found: {index_path}")
        return

    try:
        with open(index_path, 'r') as f:
            articles = json.load(f)

        # Add thumbnail URLs
        for article in articles:
            if 'image' in article:
                # Extract filename from image path
                image_path = article['image']
                filename = os.path.basename(image_path)
                base_name = os.path.splitext(filename)[0]

                # Add thumb URL
                article['thumb'] = f"/assets/articles/thumbs/{base_name}.webp"

        # Write back
        with open(index_path, 'w') as f:
            json.dump(articles, f, indent=2)

        print(f"✓ Updated {len(articles)} articles with thumbnail URLs")
        return True

    except Exception as e:
        print(f"❌ Error updating articles index: {e}")
        return False

def main():
    """Run all optimization tasks"""
    print("\n" + "="*60)
    print("IMAGE OPTIMIZATION FOR PERFORMANCE")
    print("="*60)

    os.chdir('/home/user/InTheWake')

    results = {
        'logo': optimize_logo(),
        'thumbnails': generate_article_thumbnails(),
        'avatars': optimize_author_avatars(),
        'hero': convert_hero_images(),
    }

    print("\n" + "="*60)
    print("OPTIMIZATION SUMMARY")
    print("="*60)
    for task, success in results.items():
        status = "✓" if success else "❌"
        print(f"{status} {task.capitalize()}")

    print("\n" + "="*60)
    print("NEXT STEPS:")
    print("="*60)
    print("1. Update HTML files to use new logo WebP versions")
    print("2. Update article loaders to use thumbnails")
    print("3. Update author cards to use sized avatars")
    print("4. Add cache headers configuration")
    print("5. Add fetchpriority and preload hints")
    print("="*60)

if __name__ == '__main__':
    main()
