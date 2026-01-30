#!/usr/bin/env python3
"""
Wikimedia Commons Ship Image Fetcher
Downloads freely licensed (CC BY, CC BY-SA, CC0, Public Domain) ship images
from Wikimedia Commons and generates attribution data.

Usage:
  python3 admin/fetch-wiki-ship-images.py "Ship Name" --cruise-line rcl --max 6
  python3 admin/fetch-wiki-ship-images.py --batch ships.json
"""

import json
import os
import re
import sys
import time
import urllib.request
import urllib.parse
import subprocess
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ASSETS_DIR = PROJECT_ROOT / "assets" / "ships"
USER_AGENT = "InTheWake/1.0 (https://cruisinginthewake.com; ship-reference-site) Python/3"
API_BASE = "https://commons.wikimedia.org/w/api.php"

ACCEPTABLE_LICENSES = ["CC BY", "CC BY-SA", "CC0", "Public domain", "GFDL"]


def api_request(params):
    """Make a Wikimedia Commons API request."""
    params["format"] = "json"
    url = f"{API_BASE}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        print(f"  API error: {e}")
        return None


def search_commons(ship_name):
    """Search Wikimedia Commons for ship images."""
    search_terms = [
        f"{ship_name} ship",
        f"{ship_name} cruise ship",
        ship_name,
    ]

    all_results = []
    seen_titles = set()

    for term in search_terms:
        data = api_request({
            "action": "query",
            "list": "search",
            "srsearch": term,
            "srnamespace": "6",
            "srlimit": "30",
        })
        if not data:
            continue

        results = data.get("query", {}).get("search", [])
        for r in results:
            title = r["title"]
            if title in seen_titles:
                continue
            if re.search(r"\.(jpg|jpeg|png|webp|gif)$", title, re.I):
                seen_titles.add(title)
                all_results.append(title)

        time.sleep(1)

    return all_results


def get_image_info(file_title):
    """Get image metadata from Wikimedia Commons."""
    data = api_request({
        "action": "query",
        "titles": file_title,
        "prop": "imageinfo",
        "iiprop": "url|size|extmetadata",
        "iiurlwidth": "2560",
    })
    if not data:
        return None

    pages = data.get("query", {}).get("pages", {})
    for pid, page in pages.items():
        ii_list = page.get("imageinfo", [])
        if not ii_list:
            return None
        ii = ii_list[0]
        meta = ii.get("extmetadata", {})

        license_short = meta.get("LicenseShortName", {}).get("value", "")
        license_url = meta.get("LicenseUrl", {}).get("value", "")
        artist_raw = meta.get("Artist", {}).get("value", "Unknown")
        description = meta.get("ImageDescription", {}).get("value", "")

        # Strip HTML from artist
        artist = re.sub(r"<[^>]+>", "", artist_raw).strip()
        # Clean up description
        desc_clean = re.sub(r"<[^>]+>", "", description).strip()[:200]

        # Check license
        is_free = any(l in license_short for l in ACCEPTABLE_LICENSES)

        thumb_url = ii.get("thumburl", ii.get("url", ""))
        orig_url = ii.get("url", "")
        width = ii.get("thumbwidth", ii.get("width", 0))
        height = ii.get("thumbheight", ii.get("height", 0))
        orig_width = ii.get("width", 0)
        orig_height = ii.get("height", 0)

        return {
            "title": file_title,
            "is_free": is_free,
            "thumb_url": thumb_url,
            "orig_url": orig_url,
            "width": width,
            "height": height,
            "orig_width": orig_width,
            "orig_height": orig_height,
            "license": license_short,
            "license_url": license_url,
            "artist": artist,
            "description": desc_clean,
        }

    return None


def generate_filename(file_title):
    """Generate a safe filename from the Wikimedia title."""
    name = file_title.replace("File:", "")
    # Remove extension
    base, ext = os.path.splitext(name)
    # Sanitize
    safe = re.sub(r"[^a-zA-Z0-9_\-().,]", "_", base)
    safe = re.sub(r"_+", "_", safe).strip("_")
    safe = safe[:120]
    return safe + ext.lower()


def download_image(url, dest_path, retries=3):
    """Download an image file with retry logic for rate limiting."""
    for attempt in range(retries):
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = resp.read()
                with open(dest_path, "wb") as f:
                    f.write(data)
                return len(data)
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < retries - 1:
                wait = (attempt + 1) * 10
                print(f"    Rate limited, waiting {wait}s (attempt {attempt+1}/{retries})...")
                time.sleep(wait)
                continue
            print(f"  Download error: {e}")
            return 0
        except Exception as e:
            print(f"  Download error: {e}")
            return 0
    return 0


def fetch_images_for_ship(ship_name, cruise_line="unknown", max_images=6):
    """Fetch images for a single ship from Wikimedia Commons."""
    print(f"\n{'='*60}")
    print(f"Fetching images for: {ship_name} ({cruise_line})")
    print(f"Max images: {max_images}")
    print(f"{'='*60}")

    slug = ship_name.lower().replace(" ", "-")
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)

    # Search
    print("\nSearching Wikimedia Commons...")
    titles = search_commons(ship_name)
    print(f"Found {len(titles)} candidate images")

    downloaded = []

    for title in titles:
        if len(downloaded) >= max_images:
            break

        print(f"\n  Checking: {title}")

        info = get_image_info(title)
        if not info:
            print("    Could not get info")
            continue

        if not info["is_free"]:
            print(f"    Skipping: License '{info['license']}' not acceptable")
            continue

        # Check dimensions - prefer larger images
        if info["orig_width"] < 800 or info["orig_height"] < 400:
            print(f"    Skipping: Too small ({info['orig_width']}x{info['orig_height']})")
            continue

        filename = generate_filename(title)
        dest_path = ASSETS_DIR / filename

        if dest_path.exists():
            print(f"    Already exists: {filename}")
            # Still track for attribution
            commons_url = f"https://commons.wikimedia.org/wiki/{urllib.parse.quote(title)}"
            downloaded.append({
                "filename": filename,
                "path": f"/assets/ships/{filename}",
                "source": "Wikimedia Commons",
                "sourceUrl": commons_url,
                "artist": info["artist"],
                "license": info["license"],
                "licenseUrl": info["license_url"],
                "originalTitle": title,
                "description": info["description"],
                "dimensions": f"{info['orig_width']}x{info['orig_height']}",
                "alreadyExisted": True,
            })
            continue

        # Prefer thumbnail at 2560px width if available, otherwise original
        download_url = info["thumb_url"] if info["thumb_url"] else info["orig_url"]
        if not download_url:
            print("    No download URL available")
            continue

        print(f"    Downloading ({info['orig_width']}x{info['orig_height']}, {info['license']})...")
        size = download_image(download_url, str(dest_path))

        if size > 0:
            print(f"    Saved: {filename} ({size:,} bytes)")
            commons_url = f"https://commons.wikimedia.org/wiki/{urllib.parse.quote(title)}"
            downloaded.append({
                "filename": filename,
                "path": f"/assets/ships/{filename}",
                "source": "Wikimedia Commons",
                "sourceUrl": commons_url,
                "artist": info["artist"],
                "license": info["license"],
                "licenseUrl": info["license_url"],
                "originalTitle": title,
                "description": info["description"],
                "dimensions": f"{info['orig_width']}x{info['orig_height']}",
                "alreadyExisted": False,
            })
        else:
            print("    Download failed")
            if dest_path.exists():
                dest_path.unlink()

        # Be polite - longer delays to avoid rate limiting
        time.sleep(5)

    # Save attribution JSON
    attr_path = ASSETS_DIR / f"{slug}-wiki-attributions.json"
    with open(attr_path, "w") as f:
        json.dump({
            "ship": ship_name,
            "cruiseLine": cruise_line,
            "fetchedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "source": "Wikimedia Commons",
            "images": downloaded,
        }, f, indent=2)

    print(f"\n{'='*60}")
    print(f"Downloaded {len(downloaded)} images for {ship_name}")
    print(f"Attribution file: {attr_path}")
    print(f"{'='*60}")

    return downloaded


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Fetch ship images from Wikimedia Commons")
    parser.add_argument("ship_name", nargs="?", help="Ship name")
    parser.add_argument("--cruise-line", "-c", default="unknown", help="Cruise line slug")
    parser.add_argument("--max", "-m", type=int, default=6, help="Max images to fetch")
    parser.add_argument("--batch", "-b", help="JSON file with batch ship list")

    args = parser.parse_args()

    if args.batch:
        with open(args.batch) as f:
            ships = json.load(f)
        for ship in ships:
            name = ship.get("name") or ship.get("shipName", "")
            line = ship.get("cruiseLine", "unknown")
            if name:
                fetch_images_for_ship(name, line, args.max)
                time.sleep(5)
    elif args.ship_name:
        fetch_images_for_ship(args.ship_name, args.cruise_line, args.max)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
