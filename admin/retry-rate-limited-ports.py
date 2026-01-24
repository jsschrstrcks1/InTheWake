#!/usr/bin/env python3
"""
Retry image sourcing for ports that failed due to rate limiting.
Uses longer delays between requests.
"""

import os
import sys
import time
import json
import urllib.request
import urllib.parse
import shutil

PORTS_IMG_DIR = "ports/img"
STANDARD_IMAGES = [
    "hero", "harbor", "landmark", "attraction-1", "attraction-2",
    "attraction-3", "food", "street"
]

# Ports that failed due to rate limiting
RETRY_PORTS = {
    "manzanillo": ["Manzanillo Colima Mexico", "Manzanillo bay Mexico", "Las Hadas Manzanillo"],
    "mazatlan": ["Mazatlan Sinaloa Mexico", "Old Mazatlan centro historico", "Mazatlan malecon"],
    "mykonos": ["Mykonos island Greece", "Mykonos windmills", "Little Venice Mykonos Greece"],
    "progreso": ["Progreso Yucatan Mexico", "Progreso beach pier", "Merida Yucatan cathedral"],
    "santorini": ["Santorini Oia Greece", "Santorini caldera view", "Fira Santorini Greece"],
    "tampa": ["Tampa Florida skyline", "Tampa Bay waterfront", "Ybor City Tampa historic"],
    "venice": ["Venice Italy Grand Canal", "St Marks Square Venice", "Rialto Bridge Venice"],
    "zihuatanejo": ["Zihuatanejo Guerrero Mexico", "Playa La Ropa Zihuatanejo", "Zihuatanejo bay fishing"],
}

def search_wikimedia(query, limit=5):
    """Search Wikimedia Commons for images."""
    url = f"https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(query)}%20filetype:bitmap&srnamespace=6&srlimit={limit}&format=json"
    headers = {"User-Agent": "InTheWake/1.0 (cruise port guide; contact@inthewake.com)"}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
            return [r["title"].replace("File:", "") for r in data.get("query", {}).get("search", [])]
    except Exception as e:
        print(f"  Search error: {e}")
        return []

def get_image_info(filename):
    """Get download URL and metadata for a Wikimedia Commons image."""
    url = f"https://commons.wikimedia.org/w/api.php?action=query&titles=File:{urllib.parse.quote(filename)}&prop=imageinfo&iiprop=url|extmetadata&format=json"
    headers = {"User-Agent": "InTheWake/1.0"}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
            pages = data.get("query", {}).get("pages", {})
            for page in pages.values():
                if "imageinfo" in page:
                    info = page["imageinfo"][0]
                    return info.get("url"), info.get("extmetadata", {})
    except Exception as e:
        print(f"  Info error: {e}")
    return None, None

def download_image(url, dest_path):
    """Download image from URL."""
    headers = {"User-Agent": "InTheWake/1.0"}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            with open(dest_path, 'wb') as f:
                f.write(resp.read())
            return True
    except Exception as e:
        print(f"  Download error: {e}")
    return False

def save_attribution(dest_path, filename, metadata):
    """Save attribution info for an image."""
    attr_path = dest_path + ".attr.json"
    attr_data = {
        "source": f"https://commons.wikimedia.org/wiki/File:{urllib.parse.quote(filename)}",
        "license": metadata.get("LicenseShortName", {}).get("value", "CC"),
        "author": metadata.get("Artist", {}).get("value", "Unknown"),
        "title": metadata.get("ObjectName", {}).get("value", filename),
    }
    with open(attr_path, 'w') as f:
        json.dump(attr_data, f, indent=2)

def replace_port_images(port_name, searches):
    """Replace placeholder images for a single port."""
    img_dir = os.path.join(PORTS_IMG_DIR, port_name)

    # Backup existing images
    backup_dir = f"{img_dir}_backup"
    if os.path.exists(img_dir):
        if os.path.exists(backup_dir):
            shutil.rmtree(backup_dir)
        shutil.move(img_dir, backup_dir)
    os.makedirs(img_dir, exist_ok=True)

    count = 0
    used_files = set()

    for idx, img_type in enumerate(STANDARD_IMAGES):
        # Rotate through search terms
        search_idx = idx % len(searches)
        query = searches[search_idx]

        # Add variety to later searches
        if idx >= len(searches):
            query = f"{query} {img_type.replace('-', ' ')}"

        print(f"  Searching: {query[:40]}...")
        results = search_wikimedia(f"{query} -svg -diagram -map -logo -icon", limit=8)
        time.sleep(2)  # Longer delay

        for filename in results:
            if filename in used_files:
                continue

            # Skip certain file types
            lower_name = filename.lower()
            if any(x in lower_name for x in ['icon', 'logo', 'flag', 'coat', 'seal', 'symbol', 'map']):
                continue

            url, meta = get_image_info(filename)
            time.sleep(1)  # Delay between info requests

            if not url:
                continue

            dest_file = f"{port_name}-{img_type}.webp"
            dest_path = os.path.join(img_dir, dest_file)

            if download_image(url, dest_path):
                save_attribution(dest_path, filename, meta)
                print(f"    ✓ {dest_file}")
                used_files.add(filename)
                count += 1
                time.sleep(2)  # Longer delay after download
                break

    # Remove backup if successful (6+ images)
    if count >= 6 and os.path.exists(backup_dir):
        shutil.rmtree(backup_dir)
        print(f"  Success: {count} images")
    elif os.path.exists(backup_dir):
        # Restore backup if not enough images
        shutil.rmtree(img_dir)
        shutil.move(backup_dir, img_dir)
        print(f"  Restored backup (only got {count} images)")

    return count

def main():
    ports = list(RETRY_PORTS.keys())

    # Allow specifying specific ports
    if len(sys.argv) > 1:
        ports = [p for p in sys.argv[1:] if p in RETRY_PORTS]

    total = 0
    for port in ports:
        print(f"\n{port}:")
        searches = RETRY_PORTS[port]
        count = replace_port_images(port, searches)
        total += count
        time.sleep(5)  # Long delay between ports

    print(f"\n{'='*60}")
    print(f"Total: {total} images downloaded for {len(ports)} ports")

if __name__ == "__main__":
    main()
