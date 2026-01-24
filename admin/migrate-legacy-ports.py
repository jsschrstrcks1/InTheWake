#!/usr/bin/env python3
"""
Migrate legacy port pages to new image structure.
Soli Deo Gloria

Creates /ports/img/[port]/ directories and sources images from Wikimedia Commons.
"""

import json
import os
import re
import sys
import time
import urllib.request
import urllib.parse
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
PORTS_DIR = PROJECT_ROOT / "ports"
PORTS_IMG_DIR = PROJECT_ROOT / "ports" / "img"

USER_AGENT = "CruisingInTheWake/1.0 (https://cruisinginthewake.com; admin@cruisinginthewake.com)"

# Standard image set for each port (semantic names)
STANDARD_IMAGES = [
    "hero",           # Main hero image
    "harbor",         # Harbor/port view
    "landmark",       # Main landmark
    "attraction-1",   # Key attraction
    "attraction-2",   # Second attraction
    "attraction-3",   # Third attraction
    "food",           # Local cuisine
    "street",         # Street scene
    "panorama",       # Panoramic view
    "gallery-1",      # Gallery image
    "gallery-2",      # Gallery image
    "gallery-3",      # Gallery image
]

# Port-specific search terms
PORT_SEARCH_TERMS = {
    "brunei": ["Brunei", "Bandar Seri Begawan", "Omar Ali Saifuddien Mosque"],
    "buenos-aires": ["Buenos Aires", "La Boca", "Plaza de Mayo"],
    "buzios": ["Buzios Brazil", "Armacao dos Buzios", "Rua das Pedras"],
    "cape-cod": ["Cape Cod Massachusetts", "Provincetown", "Cape Cod beach"],
    "cape-horn": ["Cape Horn Chile", "Cabo de Hornos", "Drake Passage"],
    "chilean-fjords": ["Chilean Fjords", "Patagonia fjords", "Chilean channels"],
    "christchurch": ["Christchurch New Zealand", "Cathedral Square", "Avon River"],
    "colon": ["Colon Panama", "Panama Canal", "Gatun Locks"],
    "dakar": ["Dakar Senegal", "Goree Island", "African Renaissance Monument"],
    "darwin": ["Darwin Australia", "Darwin Harbour", "Mindil Beach"],
    "denali": ["Denali Alaska", "Mount McKinley", "Denali National Park"],
    "drake-passage": ["Drake Passage", "Antarctica crossing", "Southern Ocean"],
    "dubai": ["Dubai UAE", "Burj Khalifa", "Palm Jumeirah"],
    "easter-island": ["Easter Island", "Moai statues", "Rapa Nui"],
    "fairbanks": ["Fairbanks Alaska", "Northern Lights Alaska", "Chena River"],
    "fiji": ["Fiji Islands", "Suva Fiji", "Fiji beach"],
    "glacier-alley": ["Glacier Alley Chile", "Patagonia glaciers", "Beagle Channel"],
    "glasgow": ["Glasgow Scotland", "George Square Glasgow", "Kelvingrove"],
    "hurghada": ["Hurghada Egypt", "Red Sea resort", "Hurghada beach"],
    "ilhabela": ["Ilhabela Brazil", "Sao Paulo coast", "Ilhabela beach"],
    "incheon": ["Incheon South Korea", "Songdo", "Incheon Chinatown"],
    "inside-passage": ["Inside Passage Alaska", "Alaska marine highway", "Inside Passage glaciers"],
    "isafjordur": ["Isafjordur Iceland", "Westfjords Iceland", "Isafjordur harbor"],
    "jakarta": ["Jakarta Indonesia", "National Monument Jakarta", "Old Batavia"],
    "kota-kinabalu": ["Kota Kinabalu Malaysia", "Mount Kinabalu", "Sabah"],
    "kuala-lumpur": ["Kuala Lumpur Malaysia", "Petronas Towers", "Batu Caves"],
    "lautoka": ["Lautoka Fiji", "Sugar City Fiji", "Lautoka harbor"],
    "luanda": ["Luanda Angola", "Marginal Luanda", "Fortaleza de Sao Miguel"],
    "marthas-vineyard": ["Martha's Vineyard", "Edgartown", "Oak Bluffs"],
    "mindelo": ["Mindelo Cape Verde", "Sao Vicente", "Mindelo harbor"],
    "mombasa": ["Mombasa Kenya", "Fort Jesus Mombasa", "Old Town Mombasa"],
    "port-arthur": ["Port Arthur Tasmania", "Historic site Tasmania", "Tasman Peninsula"],
    "port-moresby": ["Port Moresby Papua New Guinea", "National Parliament PNG", "Ela Beach"],
    "port-said": ["Port Said Egypt", "Suez Canal entrance", "Port Said lighthouse"],
    "praia": ["Praia Cape Verde", "Santiago Island", "Cidade Velha"],
    "puerto-montt": ["Puerto Montt Chile", "Lake District Chile", "Angelmo market"],
    "punta-del-este": ["Punta del Este Uruguay", "La Mano sculpture", "Casapueblo"],
    "rotorua": ["Rotorua New Zealand", "Maori culture", "Geothermal Rotorua"],
    "santa-marta": ["Santa Marta Colombia", "Tayrona Park", "Caribbean Colombia"],
    "south-shetland-islands": ["South Shetland Islands", "Antarctica wildlife", "Deception Island"],
    "strait-of-magellan": ["Strait of Magellan", "Punta Arenas", "Tierra del Fuego"],
    "tobago": ["Tobago", "Pigeon Point Tobago", "Buccoo Reef"],
    "torshavn": ["Torshavn Faroe Islands", "Tinganes", "Faroe Islands"],
    "trinidad": ["Trinidad Caribbean", "Port of Spain", "Queen's Park Savannah"],
    "yangon": ["Yangon Myanmar", "Shwedagon Pagoda", "Yangon downtown"],
    "durban": ["Durban South Africa", "Golden Mile Durban", "uShaka Marine World"],
}

# Image type to search terms mapping
IMAGE_SEARCH_TERMS = {
    "hero": ["panorama", "aerial view", "skyline", "harbor view"],
    "harbor": ["harbor", "port", "cruise terminal", "waterfront"],
    "landmark": ["landmark", "monument", "famous", "historic"],
    "attraction-1": ["attraction", "tourist", "popular", "visit"],
    "attraction-2": ["beach", "park", "nature", "scenery"],
    "attraction-3": ["museum", "historic", "cultural", "architecture"],
    "food": ["food", "cuisine", "restaurant", "market"],
    "street": ["street", "downtown", "city center", "local"],
    "panorama": ["panorama", "view", "overlook", "scenic"],
    "gallery-1": ["sunset", "evening", "golden hour"],
    "gallery-2": ["people", "culture", "local life"],
    "gallery-3": ["nature", "wildlife", "landscape"],
}


def fetch_json(url):
    """Fetch JSON from URL with proper User-Agent."""
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception as e:
        return None


def search_wikimedia(query, limit=10):
    """Search Wikimedia Commons for images."""
    encoded_query = urllib.parse.quote(query)
    url = (
        f"https://commons.wikimedia.org/w/api.php?"
        f"action=query&list=search&srsearch={encoded_query}%20filetype:bitmap"
        f"&srnamespace=6&srlimit={limit}&format=json"
    )
    data = fetch_json(url)
    if not data or "query" not in data:
        return []
    return [item["title"] for item in data["query"].get("search", []) if item.get("title", "").startswith("File:")]


def get_image_info(file_title):
    """Get image info including URL and license."""
    encoded_title = urllib.parse.quote(file_title)
    url = (
        f"https://commons.wikimedia.org/w/api.php?"
        f"action=query&titles={encoded_title}"
        f"&prop=imageinfo&iiprop=url|extmetadata|size"
        f"&iiurlwidth=1200&format=json"
    )
    data = fetch_json(url)
    if not data or "query" not in data:
        return None
    pages = data["query"].get("pages", {})
    for page_id, page_data in pages.items():
        if page_id == "-1":
            continue
        imageinfo = page_data.get("imageinfo", [{}])[0]
        metadata = imageinfo.get("extmetadata", {})
        license_short = metadata.get("LicenseShortName", {}).get("value", "Unknown")
        acceptable = ["CC BY", "CC BY-SA", "CC0", "Public domain", "pd", "CC-BY", "CC-BY-SA"]
        if not any(lic.lower() in license_short.lower() for lic in acceptable):
            return None
        return {
            "title": file_title,
            "url": imageinfo.get("thumburl") or imageinfo.get("url"),
            "original_url": imageinfo.get("url"),
            "license": license_short,
            "license_url": metadata.get("LicenseUrl", {}).get("value", ""),
            "author": metadata.get("Artist", {}).get("value", "Unknown"),
            "description": metadata.get("ImageDescription", {}).get("value", ""),
            "commons_url": f"https://commons.wikimedia.org/wiki/{urllib.parse.quote(file_title)}",
        }
    return None


def download_image(url, output_path):
    """Download image from URL."""
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            with open(output_path, "wb") as f:
                f.write(response.read())
        return True
    except Exception as e:
        return False


def source_image(port_slug, img_type, port_dir):
    """Source a single image for a port."""
    img_name = f"{port_slug}-{img_type}.webp"
    final_path = port_dir / img_name

    if final_path.exists():
        return True  # Already exists

    # Get search terms
    port_terms = PORT_SEARCH_TERMS.get(port_slug, [port_slug.replace("-", " ").title()])
    type_terms = IMAGE_SEARCH_TERMS.get(img_type, [img_type])

    for port_term in port_terms[:2]:
        for type_term in type_terms[:2]:
            query = f"{port_term} {type_term}"
            results = search_wikimedia(query, limit=5)

            for title in results:
                info = get_image_info(title)
                if info:
                    if download_image(info["url"], final_path):
                        # Save attribution
                        attr_path = port_dir / f"{img_name}.attr.json"
                        with open(attr_path, "w") as f:
                            json.dump(info, f, indent=2)
                        return True

            time.sleep(0.3)

    return False


def migrate_port(port_slug, dry_run=False):
    """Migrate a single port to new image structure."""
    port_dir = PORTS_IMG_DIR / port_slug

    if not dry_run:
        port_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n{port_slug}:")

    downloaded = 0
    for img_type in STANDARD_IMAGES:
        img_name = f"{port_slug}-{img_type}.webp"
        final_path = port_dir / img_name

        if final_path.exists():
            print(f"  {img_type}: exists")
            continue

        if dry_run:
            print(f"  {img_type}: would download")
            continue

        print(f"  {img_type}: ", end="", flush=True)
        if source_image(port_slug, img_type, port_dir):
            print("downloaded")
            downloaded += 1
        else:
            print("not found")

        time.sleep(0.5)

    return downloaded


def main():
    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    args = [a for a in args if not a.startswith("--")]

    if dry_run:
        print("DRY RUN MODE\n")

    # List of legacy ports without image directories
    legacy_ports = [
        "brunei", "buenos-aires", "buzios", "cape-cod", "cape-horn",
        "chilean-fjords", "christchurch", "colon", "dakar", "darwin",
        "denali", "drake-passage", "dubai", "easter-island", "fairbanks",
        "fiji", "glacier-alley", "glasgow", "hurghada", "ilhabela",
        "incheon", "inside-passage", "isafjordur", "jakarta", "kota-kinabalu",
        "kuala-lumpur", "lautoka", "luanda", "marthas-vineyard", "mindelo",
        "mombasa", "port-arthur", "port-moresby", "port-said", "praia",
        "puerto-montt", "punta-del-este", "rotorua", "santa-marta",
        "south-shetland-islands", "strait-of-magellan", "tobago", "torshavn",
        "trinidad", "yangon", "durban"
    ]

    # Filter to specific ports if provided
    if args:
        legacy_ports = [p for p in legacy_ports if p in args]

    print(f"Migrating {len(legacy_ports)} legacy ports...\n")

    total_downloaded = 0
    for port_slug in legacy_ports:
        downloaded = migrate_port(port_slug, dry_run=dry_run)
        total_downloaded += downloaded
        time.sleep(1)

    print(f"\n\nTotal images downloaded: {total_downloaded}")


if __name__ == "__main__":
    main()
