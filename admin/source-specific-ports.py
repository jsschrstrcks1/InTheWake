#!/usr/bin/env python3
"""
Source images for specific ports using targeted searches.
"""

import os
import time
import json
import urllib.request
import urllib.parse
import shutil

PORTS_IMG_DIR = "ports/img"

# Each port has specific search queries for each image type
PORT_SEARCHES = {
    "manzanillo": {
        "hero": "Manzanillo Colima Mexico panorama",
        "harbor": "Manzanillo Mexico cruise port harbor",
        "landmark": "Las Hadas Manzanillo resort",
        "attraction-1": "Manzanillo beach playa",
        "attraction-2": "Colima Mexico volcano",
        "food": "Mexican seafood ceviche",
        "street": "Manzanillo downtown street",
        "panorama": "Manzanillo bay aerial",
    },
    "mazatlan": {
        "hero": "Mazatlan Mexico skyline",
        "harbor": "Mazatlan cruise terminal port",
        "landmark": "Mazatlan cathedral basilica",
        "attraction-1": "Old Mazatlan historic center",
        "attraction-2": "El Faro Mazatlan lighthouse",
        "food": "Mazatlan shrimp aguachile",
        "street": "Mazatlan malecon boardwalk",
        "panorama": "Mazatlan beach panorama",
    },
    "mykonos": {
        "hero": "Mykonos Greece town view",
        "harbor": "Mykonos old port harbor",
        "landmark": "Mykonos windmills Kato Mili",
        "attraction-1": "Little Venice Mykonos",
        "attraction-2": "Paraportiani Church Mykonos",
        "food": "Greek gyros souvlaki",
        "street": "Mykonos white buildings alley",
        "panorama": "Mykonos island aerial",
    },
    "progreso": {
        "hero": "Progreso Yucatan Mexico",
        "harbor": "Progreso pier cruise ship",
        "landmark": "Merida cathedral Yucatan",
        "attraction-1": "Chichen Itza pyramid",
        "attraction-2": "Merida plaza grande",
        "food": "Yucatan cochinita pibil",
        "street": "Merida colonial street",
        "panorama": "Progreso beach malecón",
    },
    "santorini": {
        "hero": "Santorini Oia blue dome",
        "harbor": "Santorini caldera cruise ships",
        "landmark": "Oia Santorini sunset",
        "attraction-1": "Fira Santorini town",
        "attraction-2": "Santorini black beach",
        "food": "Greek salad feta",
        "street": "Santorini white buildings stairs",
        "panorama": "Santorini caldera view",
    },
    "tampa": {
        "hero": "Tampa Florida downtown skyline",
        "harbor": "Port Tampa Bay cruise terminal",
        "landmark": "Tampa Bay Hotel minarets",
        "attraction-1": "Ybor City Tampa historic",
        "attraction-2": "Tampa Riverwalk",
        "food": "Cuban sandwich Tampa",
        "street": "7th Avenue Ybor City",
        "panorama": "Tampa Bay aerial view",
    },
    "venice": {
        "hero": "Venice Italy Grand Canal gondola",
        "harbor": "Venice cruise terminal port",
        "landmark": "St Mark's Basilica Venice",
        "attraction-1": "Rialto Bridge Venice",
        "attraction-2": "Doge's Palace Venice",
        "food": "Italian cicchetti Venice",
        "street": "Venice canal narrow street",
        "panorama": "Venice aerial campanile",
    },
    "zihuatanejo": {
        "hero": "Zihuatanejo bay Mexico",
        "harbor": "Zihuatanejo pier fishing boats",
        "landmark": "Playa La Ropa Zihuatanejo",
        "attraction-1": "Ixtapa Mexico resort",
        "attraction-2": "Playa Las Gatas Zihuatanejo",
        "food": "Mexican ceviche fresh",
        "street": "Zihuatanejo downtown mercado",
        "panorama": "Zihuatanejo bay panorama",
    },
}

def search_wikimedia(query, limit=5):
    """Search Wikimedia Commons for images."""
    url = f"https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(query)}%20filetype:bitmap&srnamespace=6&srlimit={limit}&format=json"
    headers = {"User-Agent": "InTheWake/1.0 (cruise port guide)"}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
            return [r["title"].replace("File:", "") for r in data.get("query", {}).get("search", [])]
    except Exception as e:
        print(f"    Search error: {e}")
        return []

def get_image_info(filename):
    """Get download URL and metadata."""
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
        pass
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
        print(f"    DL error: {e}")
    return False

def save_attribution(dest_path, filename, metadata):
    """Save attribution info."""
    attr_path = dest_path + ".attr.json"
    attr_data = {
        "source": f"https://commons.wikimedia.org/wiki/File:{urllib.parse.quote(filename)}",
        "license": metadata.get("LicenseShortName", {}).get("value", "CC"),
        "author": metadata.get("Artist", {}).get("value", "Unknown"),
    }
    with open(attr_path, 'w') as f:
        json.dump(attr_data, f, indent=2)

def source_port_images(port_name, searches):
    """Source images for a port."""
    img_dir = os.path.join(PORTS_IMG_DIR, port_name)

    # Backup existing
    backup_dir = f"{img_dir}_backup"
    if os.path.exists(img_dir):
        if os.path.exists(backup_dir):
            shutil.rmtree(backup_dir)
        shutil.move(img_dir, backup_dir)
    os.makedirs(img_dir, exist_ok=True)

    count = 0
    used_files = set()

    for img_type, query in searches.items():
        print(f"  {img_type}: {query[:35]}...")

        results = search_wikimedia(query, limit=8)
        time.sleep(1.5)

        found = False
        for filename in results:
            if filename in used_files:
                continue

            lower = filename.lower()
            if any(x in lower for x in ['icon', 'logo', 'flag', 'coat', 'seal', 'map', 'diagram']):
                continue

            url, meta = get_image_info(filename)
            time.sleep(0.8)

            if not url:
                continue

            dest_file = f"{port_name}-{img_type}.webp"
            dest_path = os.path.join(img_dir, dest_file)

            if download_image(url, dest_path):
                save_attribution(dest_path, filename, meta)
                print(f"    ✓ {dest_file}")
                used_files.add(filename)
                count += 1
                found = True
                time.sleep(1.5)
                break

        if not found:
            print(f"    ✗ not found")

    # Keep if got at least 6, else restore backup
    if count >= 6:
        if os.path.exists(backup_dir):
            shutil.rmtree(backup_dir)
        print(f"  SUCCESS: {count}/8 images")
    else:
        if os.path.exists(backup_dir):
            shutil.rmtree(img_dir)
            shutil.move(backup_dir, img_dir)
        print(f"  RESTORED backup ({count}/8 images)")

    return count

def main():
    total = 0
    success = 0

    for port, searches in PORT_SEARCHES.items():
        print(f"\n{port.upper()}:")
        count = source_port_images(port, searches)
        total += count
        if count >= 6:
            success += 1
        time.sleep(3)

    print(f"\n{'='*60}")
    print(f"Total: {total} images, {success}/{len(PORT_SEARCHES)} ports updated")

if __name__ == "__main__":
    main()
