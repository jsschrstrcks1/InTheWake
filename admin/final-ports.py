#!/usr/bin/env python3
"""Final attempt for remaining 3 ports with broader searches."""

import os
import time
import json
import urllib.request
import urllib.parse
import shutil

PORTS_IMG_DIR = "ports/img"

# Very specific targeted searches
PORT_SEARCHES = {
    "manzanillo": {
        "hero": "Manzanillo Mexico bay",
        "harbor": "Mexico port harbor Pacific",
        "landmark": "Colima Mexico architecture",
        "attraction-1": "Mexico Pacific coast beach",
        "attraction-2": "Volcán de Colima Mexico",
        "food": "Mexican ceviche dish",
        "street": "Mexico town street scene",
        "panorama": "Mexico coast aerial view",
    },
    "mazatlan": {
        "hero": "Mazatlan Mexico city",
        "harbor": "Mexico port ship",
        "landmark": "Sinaloa Mexico cathedral",
        "attraction-1": "Mexico old town colonial",
        "attraction-2": "Mexico lighthouse coast",
        "food": "Mexican shrimp dish",
        "street": "Mexican boardwalk malecon",
        "panorama": "Mexico beach resort",
    },
    "zihuatanejo": {
        "hero": "Guerrero Mexico coast",
        "harbor": "Mexico fishing boats bay",
        "landmark": "Mexico tropical beach palm",
        "attraction-1": "Ixtapa resort Mexico",
        "attraction-2": "Mexico snorkeling beach",
        "food": "Fresh Mexican seafood",
        "street": "Mexican market mercado",
        "panorama": "Mexico tropical bay view",
    },
}

def search_wikimedia(query, limit=10):
    url = f"https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(query)}%20filetype:bitmap&srnamespace=6&srlimit={limit}&format=json"
    headers = {"User-Agent": "InTheWake/1.0"}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
            return [r["title"].replace("File:", "") for r in data.get("query", {}).get("search", [])]
    except:
        return []

def get_image_info(filename):
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
    except:
        pass
    return None, None

def download_image(url, dest_path):
    headers = {"User-Agent": "InTheWake/1.0"}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            with open(dest_path, 'wb') as f:
                f.write(resp.read())
            return True
    except Exception as e:
        if "429" in str(e):
            time.sleep(5)  # Wait longer if rate limited
        return False

def save_attribution(dest_path, filename, metadata):
    attr_path = dest_path + ".attr.json"
    attr_data = {
        "source": f"https://commons.wikimedia.org/wiki/File:{urllib.parse.quote(filename)}",
        "license": metadata.get("LicenseShortName", {}).get("value", "CC"),
        "author": metadata.get("Artist", {}).get("value", "Unknown"),
    }
    with open(attr_path, 'w') as f:
        json.dump(attr_data, f, indent=2)

def source_port(port_name, searches):
    img_dir = os.path.join(PORTS_IMG_DIR, port_name)
    backup_dir = f"{img_dir}_backup"

    if os.path.exists(img_dir):
        if os.path.exists(backup_dir):
            shutil.rmtree(backup_dir)
        shutil.move(img_dir, backup_dir)
    os.makedirs(img_dir, exist_ok=True)

    count = 0
    used = set()

    for img_type, query in searches.items():
        print(f"  {img_type}...", end=" ", flush=True)
        results = search_wikimedia(query)
        time.sleep(2)

        found = False
        for filename in results:
            if filename in used:
                continue
            lower = filename.lower()
            if any(x in lower for x in ['icon', 'logo', 'flag', 'coat', 'seal', 'map', 'diagram', 'symbol']):
                continue

            url, meta = get_image_info(filename)
            time.sleep(1)
            if not url:
                continue

            dest_file = f"{port_name}-{img_type}.webp"
            dest_path = os.path.join(img_dir, dest_file)

            if download_image(url, dest_path):
                save_attribution(dest_path, filename, meta)
                print("✓")
                used.add(filename)
                count += 1
                found = True
                time.sleep(2)
                break

        if not found:
            print("✗")

    if count >= 6:
        if os.path.exists(backup_dir):
            shutil.rmtree(backup_dir)
        print(f"  SUCCESS: {count}/8")
    else:
        if os.path.exists(backup_dir):
            shutil.rmtree(img_dir)
            shutil.move(backup_dir, img_dir)
        print(f"  RESTORED: {count}/8")

    return count

total = 0
for port, searches in PORT_SEARCHES.items():
    print(f"\n{port.upper()}:")
    count = source_port(port, searches)
    total += count
    time.sleep(5)

print(f"\n{'='*50}")
print(f"Total: {total} images")
