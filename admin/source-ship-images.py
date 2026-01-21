#!/usr/bin/env python3
"""
Source ship images from Wikimedia Commons with proper attribution.
Rotates through ships to avoid rate limiting.
"""

import json
import os
import re
import sys
import time
import urllib.request
import urllib.parse
from pathlib import Path

USER_AGENT = "CruisingInTheWake/1.0 (https://cruisinginthewake.com; admin@cruisinginthewake.com)"

# Ship categories on Wikimedia Commons
SHIP_CATEGORIES = {
    # Carnival ships
    "carnival-conquest": "Category:Carnival_Conquest_(ship,_2002)",
    "carnival-glory": "Category:Carnival_Glory_(ship)",
    "carnival-valor": "Category:Carnival_Valor_(ship)",
    "carnival-liberty": "Category:Carnival_Liberty_(ship)",
    "carnival-freedom": "Category:Carnival_Freedom_(ship)",
    "carnival-splendor": "Category:Carnival_Splendor_(ship)",
    "carnival-dream": "Category:Carnival_Dream_(ship)",
    "carnival-magic": "Category:Carnival_Magic_(ship)",
    "carnival-breeze": "Category:Carnival_Breeze_(ship)",
    "carnival-vista": "Category:Carnival_Vista_(ship)",
    "carnival-horizon": "Category:Carnival_Horizon_(ship)",
    "carnival-panorama": "Category:Carnival_Panorama_(ship)",
    "carnival-mardi-gras": "Category:Carnival_Mardi_Gras_(ship,_2020)",
    "carnival-celebration": "Category:Carnival_Celebration_(ship)",
    "carnival-jubilee": "Category:Carnival_Jubilee_(ship)",
    "carnival-legend": "Category:Carnival_Legend_(ship)",
    "carnival-pride": "Category:Carnival_Pride_(ship)",
    "carnival-spirit": "Category:Carnival_Spirit_(ship)",
    "carnival-miracle": "Category:Carnival_Miracle_(ship)",
    "carnival-sunshine": "Category:Carnival_Sunshine_(ship)",
    "carnival-sunrise": "Category:Carnival_Sunrise_(ship)",
    "carnival-radiance": "Category:Carnival_Radiance_(ship)",
    "carnival-firenze": "Category:Costa_Firenze",
    "carnival-venezia": "Category:Costa_Venezia",
    # Royal Caribbean ships
    "adventure-of-the-seas": "Category:Adventure_of_the_Seas",
    "allure-of-the-seas": "Category:Allure_of_the_Seas",
    "anthem-of-the-seas": "Category:Anthem_of_the_Seas",
    "brilliance-of-the-seas": "Category:Brilliance_of_the_Seas",
    "enchantment-of-the-seas": "Category:Enchantment_of_the_Seas",
    "explorer-of-the-seas": "Category:Explorer_of_the_Seas",
    "freedom-of-the-seas": "Category:Freedom_of_the_Seas",
    "grandeur-of-the-seas": "Category:Grandeur_of_the_Seas",
    "harmony-of-the-seas": "Category:Harmony_of_the_Seas",
    "icon-of-the-seas": "Category:Icon_of_the_Seas",
    "independence-of-the-seas": "Category:Independence_of_the_Seas",
    "jewel-of-the-seas": "Category:Jewel_of_the_Seas",
    "liberty-of-the-seas": "Category:Liberty_of_the_Seas",
    "mariner-of-the-seas": "Category:Mariner_of_the_Seas",
    "navigator-of-the-seas": "Category:Navigator_of_the_Seas",
    "oasis-of-the-seas": "Category:Oasis_of_the_Seas",
    "odyssey-of-the-seas": "Category:Odyssey_of_the_Seas",
    "ovation-of-the-seas": "Category:Ovation_of_the_Seas",
    "quantum-of-the-seas": "Category:Quantum_of_the_Seas",
    "radiance-of-the-seas": "Category:Radiance_of_the_Seas",
    "rhapsody-of-the-seas": "Category:Rhapsody_of_the_Seas",
    "serenade-of-the-seas": "Category:Serenade_of_the_Seas",
    "spectrum-of-the-seas": "Category:Spectrum_of_the_Seas",
    "star-of-the-seas": "Category:Star_of_the_Seas_(ship)",
    "symphony-of-the-seas": "Category:Symphony_of_the_Seas",
    "utopia-of-the-seas": "Category:Utopia_of_the_Seas",
    "vision-of-the-seas": "Category:Vision_of_the_Seas",
    "voyager-of-the-seas": "Category:Voyager_of_the_Seas",
    "wonder-of-the-seas": "Category:Wonder_of_the_Seas",
    # Celebrity ships
    "celebrity-apex": "Category:Celebrity_Apex",
    "celebrity-ascent": "Category:Celebrity_Ascent",
    "celebrity-beyond": "Category:Celebrity_Beyond",
    "celebrity-constellation": "Category:Celebrity_Constellation",
    "celebrity-eclipse": "Category:Celebrity_Eclipse",
    "celebrity-edge": "Category:Celebrity_Edge",
    "celebrity-equinox": "Category:Celebrity_Equinox",
    "celebrity-flora": "Category:Celebrity_Flora",
    "celebrity-infinity": "Category:Celebrity_Infinity",
    "celebrity-millennium": "Category:Celebrity_Millennium",
    "celebrity-reflection": "Category:Celebrity_Reflection",
    "celebrity-silhouette": "Category:Celebrity_Silhouette",
    "celebrity-solstice": "Category:Celebrity_Solstice",
    "celebrity-summit": "Category:Celebrity_Summit",
    "celebrity-xpedition": "Category:Celebrity_Xpedition",
    # Norwegian ships
    "norwegian-bliss": "Category:Norwegian_Bliss",
    "norwegian-breakaway": "Category:Norwegian_Breakaway",
    "norwegian-dawn": "Category:Norwegian_Dawn",
    "norwegian-encore": "Category:Norwegian_Encore",
    "norwegian-epic": "Category:Norwegian_Epic",
    "norwegian-escape": "Category:Norwegian_Escape",
    "norwegian-gem": "Category:Norwegian_Gem",
    "norwegian-getaway": "Category:Norwegian_Getaway",
    "norwegian-jade": "Category:Norwegian_Jade",
    "norwegian-jewel": "Category:Norwegian_Jewel",
    "norwegian-joy": "Category:Norwegian_Joy",
    "norwegian-pearl": "Category:Norwegian_Pearl",
    "norwegian-prima": "Category:Norwegian_Prima",
    "norwegian-sky": "Category:Norwegian_Sky",
    "norwegian-spirit": "Category:Norwegian_Spirit",
    "norwegian-star": "Category:Norwegian_Star",
    "norwegian-sun": "Category:Norwegian_Sun",
    "norwegian-viva": "Category:Norwegian_Viva",
    # Princess ships
    "caribbean-princess": "Category:Caribbean_Princess",
    "coral-princess": "Category:Coral_Princess",
    "crown-princess": "Category:Crown_Princess_(ship,_2006)",
    "diamond-princess": "Category:Diamond_Princess_(ship)",
    "discovery-princess": "Category:Discovery_Princess",
    "emerald-princess": "Category:Emerald_Princess",
    "enchanted-princess": "Category:Enchanted_Princess",
    "grand-princess": "Category:Grand_Princess",
    "island-princess": "Category:Island_Princess_(ship,_2003)",
    "majestic-princess": "Category:Majestic_Princess",
    "regal-princess": "Category:Regal_Princess_(ship,_2014)",
    "royal-princess": "Category:Royal_Princess_(ship,_2013)",
    "ruby-princess": "Category:Ruby_Princess",
    "sapphire-princess": "Category:Sapphire_Princess",
    "sky-princess": "Category:Sky_Princess",
    "star-princess": "Category:Star_Princess_(ship,_2024)",
    "sun-princess": "Category:Sun_Princess_(ship,_2024)",
    # Holland America ships
    "eurodam": "Category:MS_Eurodam",
    "koningsdam": "Category:MS_Koningsdam",
    "nieuw-amsterdam": "Category:MS_Nieuw_Amsterdam_(2010)",
    "nieuw-statendam": "Category:MS_Nieuw_Statendam",
    "noordam": "Category:MS_Noordam_(2006)",
    "oosterdam": "Category:MS_Oosterdam",
    "rotterdam": "Category:MS_Rotterdam_(2021)",
    "volendam": "Category:MS_Volendam",
    "westerdam": "Category:MS_Westerdam",
    "zaandam": "Category:MS_Zaandam",
    "zuiderdam": "Category:MS_Zuiderdam",
}


def query_wikimedia_search(ship_name):
    """Search Wikimedia Commons for ship images."""
    api_url = "https://commons.wikimedia.org/w/api.php"
    # Search for ship images in File namespace (6)
    # Use more specific query for cruise ships
    params = {
        "action": "query",
        "format": "json",
        "list": "search",
        "srsearch": f'"{ship_name}" cruise ship',
        "srnamespace": "6",  # File namespace
        "srlimit": "20",
    }

    url = f"{api_url}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode())
            if "query" not in data or "search" not in data["query"]:
                return []
            return [item["title"] for item in data["query"]["search"]]
    except Exception as e:
        print(f"  Error searching for {ship_name}: {e}")
        return []


def get_file_info(titles):
    """Get detailed info for file titles."""
    if not titles:
        return None

    api_url = "https://commons.wikimedia.org/w/api.php"
    params = {
        "action": "query",
        "format": "json",
        "titles": "|".join(titles[:10]),  # Max 10 titles
        "prop": "imageinfo",
        "iiprop": "url|extmetadata|size|mime",
    }

    url = f"{api_url}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        print(f"  Error getting file info: {e}")
        return None


def query_wikimedia_category(category):
    """Query Wikimedia Commons for images in a category."""
    api_url = "https://commons.wikimedia.org/w/api.php"
    params = {
        "action": "query",
        "format": "json",
        "generator": "categorymembers",
        "gcmtitle": category,
        "gcmtype": "file",
        "gcmlimit": "20",
        "prop": "imageinfo",
        "iiprop": "url|extmetadata|size|mime",
    }

    url = f"{api_url}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        print(f"  Error querying {category}: {e}")
        return None


def filter_good_images(data):
    """Filter for high-quality exterior ship photos."""
    if not data or "query" not in data or "pages" not in data["query"]:
        return []

    images = []
    for page_id, page in data["query"]["pages"].items():
        if "imageinfo" not in page:
            continue

        info = page["imageinfo"][0]
        title = page.get("title", "")

        # Skip non-image files
        mime = info.get("mime", "")
        if not mime.startswith("image/"):
            continue

        # Skip small images
        width = info.get("width", 0)
        height = info.get("height", 0)
        if width < 1000 or height < 600:
            continue

        # Skip interior shots, logos, diagrams
        title_lower = title.lower()
        skip_keywords = ["logo", "icon", "diagram", "map", "deck", "plan", "cabin",
                         "room", "restaurant", "pool", "theater", "theatre", "bar",
                         "lounge", "spa", "gym", "casino", "buffet", "galley"]
        if any(kw in title_lower for kw in skip_keywords):
            continue

        # Prefer exterior shots
        ext_keywords = ["exterior", "port", "harbor", "harbour", "sea", "ocean",
                        "sailing", "cruise", "dock", "pier", "aerial"]
        is_exterior = any(kw in title_lower for kw in ext_keywords)

        # Get license info
        meta = info.get("extmetadata", {})
        license_short = meta.get("LicenseShortName", {}).get("value", "")
        artist = meta.get("Artist", {}).get("value", "")
        # Clean HTML from artist
        artist = re.sub(r'<[^>]+>', '', artist).strip()

        images.append({
            "title": title,
            "url": info.get("url"),
            "width": width,
            "height": height,
            "license": license_short,
            "artist": artist,
            "is_exterior": is_exterior,
            "size": info.get("size", 0),
        })

    # Sort: exterior first, then by size
    images.sort(key=lambda x: (-int(x["is_exterior"]), -x["size"]))
    return images


def download_image(url, dest_path):
    """Download an image to the destination path."""
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            content = response.read()
            Path(dest_path).parent.mkdir(parents=True, exist_ok=True)
            Path(dest_path).write_bytes(content)
            return len(content)
    except Exception as e:
        print(f"  Error downloading: {e}")
        return 0


def get_cruise_line_dir(ship_slug):
    """Get the cruise line directory for a ship."""
    if ship_slug.startswith("carnival-"):
        return "carnival"
    elif ship_slug.endswith("-of-the-seas"):
        return "rcl"
    elif ship_slug.startswith("celebrity-"):
        return "celebrity"
    elif ship_slug.startswith("norwegian-"):
        return "ncl"
    elif ship_slug.endswith("-princess"):
        return "princess"
    else:
        return "other"


def source_ship_image(ship_slug, force=False):
    """Source an image for a specific ship."""
    cruise_line = get_cruise_line_dir(ship_slug)
    dest_dir = Path(f"assets/ships/{cruise_line}")
    dest_file = dest_dir / f"{ship_slug}-exterior.jpg"

    if dest_file.exists() and not force:
        print(f"  EXISTS: {dest_file}")
        return "EXISTS"

    # Convert slug to search term
    ship_name = ship_slug.replace("-", " ").title()
    print(f"  Searching for '{ship_name}'...")

    # First try search
    titles = query_wikimedia_search(ship_name)
    if titles:
        data = get_file_info(titles)
        images = filter_good_images(data)
    else:
        images = []

    # If no results from search, try category if mapped
    if not images and ship_slug in SHIP_CATEGORIES:
        category = SHIP_CATEGORIES[ship_slug]
        print(f"  Trying category {category}...")
        data = query_wikimedia_category(category)
        images = filter_good_images(data)

    if not images:
        print(f"  NO IMAGES: No suitable images found for {ship_slug}")
        return None

    # Take the best image
    best = images[0]
    print(f"  Found: {best['title']} ({best['width']}x{best['height']}, {best['license']})")

    # Download
    size = download_image(best["url"], str(dest_file))
    if size > 0:
        print(f"  DOWNLOADED: {dest_file} ({size:,} bytes)")

        # Save attribution info
        attr_file = dest_dir / f"{ship_slug}-exterior.attr.json"
        attr_data = {
            "source": "Wikimedia Commons",
            "title": best["title"],
            "url": best["url"],
            "license": best["license"],
            "artist": best["artist"],
            "downloaded": time.strftime("%Y-%m-%d"),
        }
        attr_file.write_text(json.dumps(attr_data, indent=2))

        return str(dest_file)

    return None


def main():
    """Main entry point."""
    if len(sys.argv) > 1:
        # Process specific ships
        ships = sys.argv[1:]
    else:
        # Process all mapped ships
        ships = list(SHIP_CATEGORIES.keys())

    print(f"Processing {len(ships)} ships...")
    downloaded = 0
    skipped = 0
    failed = 0

    for i, ship in enumerate(ships):
        print(f"\n[{i+1}/{len(ships)}] {ship}")
        result = source_ship_image(ship)
        if result:
            if "EXISTS" in str(result):
                skipped += 1
            else:
                downloaded += 1
        else:
            failed += 1

        # Rate limiting - pause between requests
        if i < len(ships) - 1:
            time.sleep(1)

    print(f"\n\nSummary:")
    print(f"  Downloaded: {downloaded}")
    print(f"  Skipped (exists): {skipped}")
    print(f"  Failed: {failed}")


if __name__ == "__main__":
    main()
