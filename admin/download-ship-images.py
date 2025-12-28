#!/usr/bin/env python3
"""
Download Ship Images from Wikimedia Commons
============================================

Downloads images from Wikimedia Commons, converts to webp, and updates HTML files
to use local paths.

Usage:
    python3 admin/download-ship-images.py [--ship <ship-name>] [--all]

Soli Deo Gloria
"""

import os
import re
import sys
import json
import hashlib
import urllib.request
import urllib.parse
import subprocess
from pathlib import Path


def get_wikimedia_image_url(filename):
    """Get the direct download URL for a Wikimedia Commons file."""
    # Remove URL encoding and extract filename
    filename = urllib.parse.unquote(filename)

    # Compute MD5 hash for directory structure
    md5 = hashlib.md5(filename.encode('utf-8')).hexdigest()
    return f"https://upload.wikimedia.org/wikipedia/commons/{md5[0]}/{md5[0:2]}/{urllib.parse.quote(filename)}"


def download_image(url, output_path):
    """Download an image from a URL."""
    print(f"  Downloading: {url[:80]}...")
    try:
        headers = {
            'User-Agent': 'InTheWake/1.0 (https://cruisinginthewake.com; contact@cruisinginthewake.com) Python/3'
        }
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=30) as response:
            with open(output_path, 'wb') as f:
                f.write(response.read())
        return True
    except Exception as e:
        print(f"  ERROR downloading: {e}")
        return False


def convert_to_webp(input_path, output_path, quality=85):
    """Convert an image to webp format using Pillow, cwebp, or ImageMagick."""
    # Try Pillow first (most reliable)
    try:
        from PIL import Image
        with Image.open(input_path) as img:
            # Convert to RGB if necessary (for PNG with alpha, etc.)
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            img.save(output_path, 'WEBP', quality=quality)
            return True
    except Exception as e:
        print(f"  Pillow conversion failed: {e}")

    try:
        # Try cwebp
        result = subprocess.run(
            ['cwebp', '-q', str(quality), input_path, '-o', output_path],
            capture_output=True, text=True
        )
        if result.returncode == 0:
            return True
    except FileNotFoundError:
        pass

    try:
        # Fall back to ImageMagick convert
        result = subprocess.run(
            ['convert', input_path, '-quality', str(quality), output_path],
            capture_output=True, text=True
        )
        if result.returncode == 0:
            return True
    except FileNotFoundError:
        pass

    print(f"  ERROR: Could not convert to webp")
    return False


def extract_hotlinked_images(html_file):
    """Extract all hotlinked Wikimedia image URLs from an HTML file."""
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all Wikimedia image URLs in img src
    pattern = r'<img[^>]+src="(https://upload\.wikimedia\.org/wikipedia/commons/[^"]+)"'
    matches = re.findall(pattern, content)
    return matches


def generate_local_filename(url, ship_name):
    """Generate a local filename for a Wikimedia image."""
    # Extract original filename from URL
    parsed = urllib.parse.urlparse(url)
    original_name = urllib.parse.unquote(parsed.path.split('/')[-1])

    # Clean up the filename
    # Remove size prefix like "800px-"
    original_name = re.sub(r'^\d+px-', '', original_name)

    # Create a clean ship-specific name
    base_name = re.sub(r'[^\w\-.]', '_', original_name)
    base_name = re.sub(r'_+', '_', base_name)

    return base_name


def process_ship_page(html_file):
    """Process a ship page: download images, convert to webp, update HTML."""
    print(f"\nProcessing: {html_file}")

    # Extract ship name from filename
    ship_name = Path(html_file).stem
    ship_slug = ship_name.replace(' ', '-').lower()

    # Get hotlinked images
    urls = extract_hotlinked_images(html_file)
    if not urls:
        print("  No hotlinked images found")
        return 0

    print(f"  Found {len(urls)} hotlinked image(s)")

    # Create output directory
    output_dir = Path('assets/ships')
    output_dir.mkdir(parents=True, exist_ok=True)

    # Read HTML content
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    updated_count = 0
    image_counter = 1

    for url in urls:
        # Generate local filename
        local_name = generate_local_filename(url, ship_slug)

        # Determine file extension
        ext = Path(local_name).suffix.lower()
        if ext not in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
            ext = '.jpg'

        # Create numbered filename for this ship
        base = f"{ship_slug}_{image_counter:02d}"
        temp_path = output_dir / f"{base}{ext}"
        webp_path = output_dir / f"{base}.webp"

        # Check if already downloaded
        if webp_path.exists():
            print(f"  Already exists: {webp_path}")
        else:
            # Download the image
            if not download_image(url, temp_path):
                continue

            # Convert to webp
            if ext != '.webp':
                if convert_to_webp(temp_path, webp_path):
                    print(f"  Converted: {webp_path}")
                    # Keep original as fallback
                else:
                    # Use original if conversion fails
                    webp_path = temp_path

        # Update HTML to use local path
        local_url = f"/assets/ships/{base}.webp"
        fallback_url = f"/assets/ships/{base}{ext}"

        # Replace the hotlinked URL with local URL (add onerror fallback)
        old_img_pattern = re.compile(
            rf'<img([^>]*?)src="{re.escape(url)}"([^>]*?)>',
            re.DOTALL
        )

        def replace_img(match):
            attrs_before = match.group(1)
            attrs_after = match.group(2)

            # Check if onerror already exists
            if 'onerror=' not in attrs_before + attrs_after:
                fallback = f''' onerror="this.onerror=null;this.src='{fallback_url}'"'''
            else:
                fallback = ''

            return f'<img{attrs_before}src="{local_url}"{fallback}{attrs_after}>'

        new_content = old_img_pattern.sub(replace_img, content)
        if new_content != content:
            content = new_content
            updated_count += 1
            print(f"  Updated: {url[:60]}... -> {local_url}")

        image_counter += 1

    # Write updated HTML
    if updated_count > 0:
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  Saved: {html_file} ({updated_count} image(s) localized)")

    return updated_count


def find_ship_pages_with_hotlinks():
    """Find all ship pages that have hotlinked images."""
    ships_dir = Path('ships')
    pages = []

    for html_file in ships_dir.rglob('*.html'):
        urls = extract_hotlinked_images(html_file)
        if urls:
            pages.append(str(html_file))

    return pages


def main():
    os.chdir(Path(__file__).parent.parent)

    if len(sys.argv) < 2:
        print("Usage: python3 admin/download-ship-images.py [--all | <path-to-html>]")
        print("\nShip pages with hotlinked images:")
        pages = find_ship_pages_with_hotlinks()
        for page in pages:
            urls = extract_hotlinked_images(page)
            print(f"  {page}: {len(urls)} image(s)")
        print(f"\nTotal: {len(pages)} pages with hotlinked images")
        return

    if sys.argv[1] == '--all':
        pages = find_ship_pages_with_hotlinks()
        total = 0
        for page in pages:
            total += process_ship_page(page)
        print(f"\n{'='*60}")
        print(f"Total images processed: {total}")
    else:
        html_file = sys.argv[1]
        if not Path(html_file).exists():
            print(f"Error: File not found: {html_file}")
            sys.exit(1)
        process_ship_page(html_file)


if __name__ == '__main__':
    main()
