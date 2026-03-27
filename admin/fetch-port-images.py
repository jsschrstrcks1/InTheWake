#!/usr/bin/env python3
"""
fetch-port-images.py — Download CC images from Wikimedia Commons for port pages
Soli Deo Gloria

Reads port-image-manifest.json and downloads images for ports that need them.
Converts to WebP format and places in /ports/img/{slug}/.

Usage:
    python3 admin/fetch-port-images.py --dry-run           # Preview what would be downloaded
    python3 admin/fetch-port-images.py --port santos        # Download for one port
    python3 admin/fetch-port-images.py                      # Download all needed
"""

import json
import os
import sys
import urllib.request
import urllib.parse
import time

try:
    from PIL import Image
    HAS_PILLOW = True
except ImportError:
    HAS_PILLOW = False
    print("WARNING: Pillow not installed — images won't be converted to WebP")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
MANIFEST_PATH = os.path.join(SCRIPT_DIR, 'port-image-manifest.json')
PORTS_IMG_DIR = os.path.join(PROJECT_ROOT, 'ports', 'img')

USER_AGENT = 'InTheWake/1.0 (https://cruisinginthewake.com; cruise port guide image sourcing)'


def search_wikimedia_category(category_url, limit=20):
    """Search a Wikimedia Commons category for image files."""
    # Extract category name from URL
    cat_name = category_url.split('/')[-1].replace('Category:', '')

    params = urllib.parse.urlencode({
        'action': 'query',
        'list': 'categorymembers',
        'cmtitle': f'Category:{cat_name}',
        'cmtype': 'file',
        'cmlimit': limit,
        'format': 'json',
    })
    url = f'https://commons.wikimedia.org/w/api.php?{params}'
    req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())
        return [m['title'] for m in data.get('query', {}).get('categorymembers', [])]
    except Exception as e:
        print(f"  API error for {cat_name}: {e}")
        return []


def get_image_url(file_title, width=1200):
    """Get the direct URL for a Wikimedia Commons file at specified width."""
    params = urllib.parse.urlencode({
        'action': 'query',
        'titles': file_title,
        'prop': 'imageinfo',
        'iiprop': 'url|size|extmetadata',
        'iiurlwidth': width,
        'format': 'json',
    })
    url = f'https://commons.wikimedia.org/w/api.php?{params}'
    req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())
        pages = data.get('query', {}).get('pages', {})
        for page in pages.values():
            info = page.get('imageinfo', [{}])[0]
            # Prefer thumbnail at requested width, fall back to original
            thumb_url = info.get('thumburl', info.get('url', ''))
            orig_url = info.get('url', '')
            w = info.get('thumbwidth', info.get('width', 0))
            h = info.get('thumbheight', info.get('height', 0))
            license_info = info.get('extmetadata', {}).get('LicenseShortName', {}).get('value', 'Unknown')
            return {
                'url': thumb_url or orig_url,
                'width': w,
                'height': h,
                'license': license_info,
                'original_url': orig_url,
            }
    except Exception as e:
        print(f"  URL lookup error for {file_title}: {e}")
    return None


def download_and_convert(url, output_path, dry_run=False):
    """Download an image and convert to WebP."""
    if dry_run:
        print(f"  [DRY RUN] Would download: {url[:80]}...")
        print(f"            → {output_path}")
        return True

    try:
        req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
        with urllib.request.urlopen(req, timeout=30) as resp:
            img_data = resp.read()

        # Save temp file
        temp_path = output_path + '.tmp'
        with open(temp_path, 'wb') as f:
            f.write(img_data)

        if HAS_PILLOW:
            # Convert to WebP
            img = Image.open(temp_path)
            # Resize if too large
            if img.width > 1200:
                ratio = 1200 / img.width
                new_size = (1200, int(img.height * ratio))
                img = img.resize(new_size, Image.LANCZOS)
            img.save(output_path, 'WEBP', quality=80)
            os.remove(temp_path)
            size_kb = os.path.getsize(output_path) / 1024
            print(f"  ✓ {os.path.basename(output_path)} ({img.width}x{img.height}, {size_kb:.0f}KB)")
        else:
            # No Pillow — just save as-is
            os.rename(temp_path, output_path)
            print(f"  ✓ {os.path.basename(output_path)} (not converted — install Pillow)")

        return True
    except Exception as e:
        print(f"  ✗ Download failed: {e}")
        if os.path.exists(output_path + '.tmp'):
            os.remove(output_path + '.tmp')
        return False


def process_port(slug, port_data, dry_run=False):
    """Process image sourcing for one port."""
    print(f"\n{'='*60}")
    print(f"  {slug.upper()} — need {port_data.get('needed', 0)} images")
    print(f"{'='*60}")

    if port_data.get('needed', 0) == 0:
        print(f"  No new images needed (action: {port_data.get('action', 'none')})")
        return

    # Create output directory
    out_dir = os.path.join(PORTS_IMG_DIR, slug)
    if not dry_run:
        os.makedirs(out_dir, exist_ok=True)

    downloaded = 0
    for source in port_data.get('sources', []):
        target = source.get('target', '')
        if source.get('exists'):
            print(f"  SKIP {target} (already exists)")
            continue

        output_path = os.path.join(out_dir, target)
        if os.path.exists(output_path):
            print(f"  SKIP {target} (already on disk)")
            continue

        category_url = source.get('source_category', '')
        search_terms = source.get('search_terms', '')
        description = source.get('description', '')

        print(f"\n  Sourcing: {target}")
        print(f"  Description: {description}")

        if not category_url:
            print(f"  No source category — skipping")
            continue

        # Search the category for images
        files = search_wikimedia_category(category_url)
        if not files:
            print(f"  No files found in category")
            continue

        # Filter for likely image files (JPG, PNG)
        image_files = [f for f in files if any(f.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.tif', '.tiff'])]
        if not image_files:
            image_files = files[:5]  # Fall back to first 5

        # Try to find best match using search terms
        best_match = image_files[0]  # Default to first
        for f in image_files:
            for term in search_terms.split(','):
                if term.strip().lower() in f.lower():
                    best_match = f
                    break

        print(f"  Selected: {best_match}")

        # Get download URL
        img_info = get_image_url(best_match)
        if not img_info:
            print(f"  Could not get download URL")
            continue

        print(f"  License: {img_info['license']}")

        # Download and convert
        if download_and_convert(img_info['url'], output_path, dry_run):
            downloaded += 1

        # Rate limit
        time.sleep(1)

    print(f"\n  Result: {downloaded} images {'would be ' if dry_run else ''}downloaded")


def main():
    args = sys.argv[1:]
    dry_run = '--dry-run' in args
    port_filter = None
    if '--port' in args:
        idx = args.index('--port')
        if idx + 1 < len(args):
            port_filter = args[idx + 1]

    with open(MANIFEST_PATH) as f:
        manifest = json.load(f)

    print(f"Port Image Fetcher — {'DRY RUN' if dry_run else 'LIVE'}")
    print(f"Manifest: {MANIFEST_PATH}")
    print(f"Output: {PORTS_IMG_DIR}/")
    if not HAS_PILLOW:
        print("WARNING: Pillow not available — no WebP conversion")

    for slug, data in manifest.items():
        if slug.startswith('_'):
            continue
        if port_filter and slug != port_filter:
            continue
        process_port(slug, data, dry_run)

    print(f"\n{'='*60}")
    print(f"  Done.")
    print(f"{'='*60}")


if __name__ == '__main__':
    main()
