#!/usr/bin/env python3
"""
Replace placeholder images (21694 bytes) with real images from Wikimedia Commons.
Uses wget for reliable downloads.
"""

import os
import json
import time
import subprocess
import urllib.request
import urllib.parse

PORTS_IMG_DIR = "ports/img"
PLACEHOLDER_SIZE = 21694
USER_AGENT = "InTheWakeBot/1.0 (cruise travel site)"

# Port-specific search queries
PORT_SEARCHES = {
    "bermuda": [
        ("bermuda-hero", "Bermuda coast scenic"),
        ("bermuda-8", "Hamilton Bermuda harbor"),
        ("bermuda-9", "Bermuda pink beach"),
        ("bermuda-10", "Bermuda lighthouse Gibbs"),
        ("bermuda-11", "St George Bermuda town"),
    ],
    "cabo-san-lucas": [
        ("cabo-san-lucas-1", "Cabo San Lucas El Arco"),
    ],
    "cozumel": [
        ("cozumel-fom-1", "Cozumel Mexico coast"),
    ],
    "huatulco": [
        ("huatulco-1", "Huatulco bay Mexico"),
    ],
}


def search_wikimedia(query, limit=5):
    """Search Wikimedia Commons for images."""
    base_url = "https://commons.wikimedia.org/w/api.php"
    params = {
        "action": "query",
        "list": "search",
        "srsearch": f"{query} filetype:bitmap",
        "srnamespace": "6",
        "srlimit": limit,
        "format": "json",
    }

    url = f"{base_url}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode())
            return data.get("query", {}).get("search", [])
    except Exception as e:
        print(f"  Search error: {e}")
        return []


def get_image_info(title):
    """Get the actual image URL and metadata from a Wikimedia file title."""
    base_url = "https://commons.wikimedia.org/w/api.php"
    params = {
        "action": "query",
        "titles": title,
        "prop": "imageinfo",
        "iiprop": "url|extmetadata",
        "format": "json",
    }

    url = f"{base_url}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode())
            pages = data.get("query", {}).get("pages", {})
            for page in pages.values():
                imageinfo = page.get("imageinfo", [{}])[0]
                img_url = imageinfo.get("url")
                metadata = imageinfo.get("extmetadata", {})
                return img_url, metadata
    except Exception as e:
        print(f"  URL fetch error: {e}")

    return None, None


def download_image(url, filepath):
    """Download image using wget and convert to WebP."""
    tmp_file = filepath + ".tmp.jpg"

    # Use wget with browser-like headers
    wget_cmd = [
        "wget", "-q",
        "--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
        "--referer=https://commons.wikimedia.org/",
        "-O", tmp_file,
        url
    ]

    try:
        result = subprocess.run(wget_cmd, capture_output=True, timeout=120)

        if result.returncode != 0 or not os.path.exists(tmp_file):
            return False

        # Check if downloaded file is valid (not HTML error page)
        if os.path.getsize(tmp_file) < 10000:
            with open(tmp_file, 'rb') as f:
                if b'<!DOCTYPE html>' in f.read(100):
                    os.remove(tmp_file)
                    return False

        # Convert to WebP
        convert_cmd = [
            "convert", tmp_file,
            "-resize", "1920x>",
            "-quality", "82",
            "-strip",
            filepath
        ]
        result = subprocess.run(convert_cmd, capture_output=True, timeout=60)

        if os.path.exists(tmp_file):
            os.remove(tmp_file)

        return result.returncode == 0 and os.path.exists(filepath)
    except Exception as e:
        print(f"  Download error: {e}")
        if os.path.exists(tmp_file):
            os.remove(tmp_file)
        return False


def save_attribution(filepath, metadata):
    """Save image attribution info."""
    import re

    attr_file = filepath + ".attr.json"

    artist = metadata.get("Artist", {}).get("value", "Unknown")
    license_info = metadata.get("LicenseShortName", {}).get("value", "CC")
    desc = metadata.get("ImageDescription", {}).get("value", "")

    # Clean HTML from values
    artist = re.sub(r'<[^>]+>', '', str(artist))
    desc = re.sub(r'<[^>]+>', '', str(desc))

    attr_data = {
        "source": "Wikimedia Commons",
        "artist": artist[:200],
        "license": license_info,
        "description": desc[:300] if desc else ""
    }

    with open(attr_file, 'w') as f:
        json.dump(attr_data, f, indent=2)


def main():
    print("=" * 60)
    print("REPLACING PLACEHOLDER IMAGES")
    print("=" * 60)

    total_replaced = 0

    for port, searches in PORT_SEARCHES.items():
        port_dir = os.path.join(PORTS_IMG_DIR, port)
        print(f"\n{port.upper()}")
        print("-" * 40)

        for img_name, query in searches:
            filepath = os.path.join(port_dir, f"{img_name}.webp")

            # Check if it's a placeholder
            if os.path.exists(filepath) and os.path.getsize(filepath) != PLACEHOLDER_SIZE:
                print(f"  {img_name}: Already has real image, skipping")
                continue

            print(f"  {img_name}: Searching '{query}'...")
            time.sleep(1)  # Rate limiting

            results = search_wikimedia(query)

            for result in results:
                title = result.get("title", "")

                # Skip SVG and other non-photo files
                if any(ext in title.lower() for ext in ['.svg', '.png', '.gif', 'flag', 'icon', 'logo', 'map']):
                    continue

                print(f"    Trying: {title[:50]}...")

                time.sleep(0.5)
                url, metadata = get_image_info(title)

                if url:
                    if download_image(url, filepath):
                        new_size = os.path.getsize(filepath)
                        print(f"    ✓ Saved ({new_size:,} bytes)")
                        save_attribution(filepath, metadata)
                        total_replaced += 1
                        break
                    else:
                        print(f"    ✗ Download failed, trying next...")
            else:
                print(f"    ✗ No suitable image found")

    print()
    print("=" * 60)
    print(f"Replaced {total_replaced} placeholder images")
    print("=" * 60)


if __name__ == "__main__":
    main()
