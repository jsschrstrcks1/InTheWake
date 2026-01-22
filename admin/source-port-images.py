#!/usr/bin/env python3
"""
Source port images from Wikimedia Commons with proper attribution.
Soli Deo Gloria

Scans port HTML files for missing images and downloads replacements from
Wikimedia Commons with appropriate licensing and attribution.
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

PROJECT_ROOT = Path(__file__).parent.parent
PORTS_DIR = PROJECT_ROOT / "ports"
PORTS_IMG_DIR = PROJECT_ROOT / "ports" / "img"

USER_AGENT = "CruisingInTheWake/1.0 (https://cruisinginthewake.com; admin@cruisinginthewake.com)"

# Map port slugs to Wikimedia Commons search terms
PORT_SEARCH_TERMS = {
    # Major Caribbean ports
    "nassau": ["Nassau Bahamas harbor", "Nassau cruise port"],
    "cozumel": ["Cozumel Mexico", "Cozumel cruise port"],
    "st-thomas": ["Charlotte Amalie harbor", "St Thomas USVI"],
    "st-maarten": ["Philipsburg Sint Maarten", "Great Bay St Maarten"],
    "jamaica": ["Falmouth Jamaica", "Jamaica cruise port"],
    "grand-cayman": ["George Town Grand Cayman", "Seven Mile Beach Cayman"],
    "aruba": ["Oranjestad Aruba", "Aruba cruise terminal"],
    "curacao": ["Willemstad Curacao", "Curacao harbor"],
    "barbados": ["Bridgetown Barbados", "Barbados", "Harrison's Cave Barbados"],
    "st-lucia": ["Pitons St Lucia", "Castries harbor", "St Lucia"],
    "antigua": ["St Johns Antigua", "English Harbour Antigua"],
    "grenada": ["St Georges Grenada", "Grenada harbor"],
    "falmouth": ["Falmouth Jamaica", "Jamaica", "Dunn's River Falls"],

    # European ports
    "amsterdam": ["Amsterdam", "Amsterdam canals", "Rijksmuseum Amsterdam", "Anne Frank House"],
    "barcelona": ["Barcelona port", "La Sagrada Familia", "Las Ramblas Barcelona"],
    "rome": ["Civitavecchia port", "Rome Colosseum"],
    "venice": ["Venice Grand Canal", "St Marks Square Venice"],
    "santorini": ["Santorini caldera", "Oia Santorini"],
    "dubrovnik": ["Dubrovnik walls", "Dubrovnik old town"],
    "copenhagen": ["Nyhavn Copenhagen", "Copenhagen harbor"],
    "stockholm": ["Stockholm Gamla Stan", "Stockholm harbor"],
    "lisbon": ["Lisbon Belem Tower", "Lisbon harbor"],
    "naples": ["Naples harbor", "Mount Vesuvius Naples"],
    "marseille": ["Vieux Port Marseille", "Notre Dame de la Garde"],
    "alesund": ["Alesund Norway", "Alesund Art Nouveau", "Aksla viewpoint"],
    "amalfi": ["Amalfi Coast", "Amalfi Cathedral", "Positano Italy"],

    # Middle East / Africa
    "alexandria": ["Alexandria Egypt", "Bibliotheca Alexandrina", "Citadel of Qaitbay"],

    # Alaska ports
    "juneau": ["Juneau Alaska harbor", "Mendenhall Glacier"],
    "ketchikan": ["Ketchikan Creek Street", "Ketchikan harbor"],
    "skagway": ["Skagway Alaska", "White Pass Yukon Route"],
    "sitka": ["Sitka Alaska", "Russian Orthodox church Sitka"],
    "glacier-bay": ["Glacier Bay Alaska", "Margerie Glacier"],

    # Asia/Pacific
    "singapore": ["Marina Bay Sands", "Singapore harbor"],
    "hong-kong": ["Victoria Harbour Hong Kong", "Hong Kong skyline"],
    "tokyo": ["Tokyo Bay", "Rainbow Bridge Tokyo"],
    "sydney": ["Sydney Opera House", "Sydney Harbour Bridge"],
    "auckland": ["Auckland Sky Tower", "Auckland harbor"],
    "bangkok": ["Bangkok Thailand", "Grand Palace Bangkok", "Wat Arun"],
    "ho-chi-minh-city": ["Ho Chi Minh City", "Saigon", "Notre Dame Cathedral Saigon"],

    # New Zealand
    "akaroa": ["Akaroa New Zealand", "Banks Peninsula", "Hector's dolphin"],

    # Pacific Islands
    "airlie-beach": ["Whitsunday Islands", "Whitehaven Beach", "Great Barrier Reef"],
    "aitutaki": ["Aitutaki lagoon", "Cook Islands", "One Foot Island"],

    # Corsica
    "ajaccio": ["Ajaccio Corsica", "Napoleon birthplace", "Maison Bonaparte"],

    # Antarctica
    "antarctica": ["Antarctica", "Antarctic Peninsula", "Emperor penguin Antarctica"],
    "antarctic-peninsula": ["Antarctic Peninsula", "Antarctica cruise", "Gentoo penguin"],

    # US East Coast
    "baltimore": ["Baltimore Inner Harbor", "Fort McHenry", "Maryland crabs"],
    "bar-harbor": ["Bar Harbor Maine", "Acadia National Park", "Cadillac Mountain"],
    "norfolk": ["Norfolk Virginia", "USS Wisconsin", "Nauticus"],

    # Turkey
    "bodrum": ["Bodrum Turkey", "Bodrum Castle", "Bodrum harbor"],
}

# Image type mappings - what semantic names map to search terms
IMAGE_TYPE_SEARCHES = {
    "hero": ["panorama", "aerial view", "harbor view", "skyline"],
    "harbor": ["harbor", "port", "cruise terminal", "waterfront"],
    "harbour": ["harbour", "port", "cruise terminal", "waterfront"],
    "landmark": ["landmark", "monument", "famous", "tourist"],
    "beach": ["beach", "coast", "shore", "sand"],
    "street": ["street", "downtown", "city center", "market"],
    "food": ["food", "cuisine", "restaurant", "local dish"],
    "aerial": ["aerial", "drone", "bird's eye", "panorama"],
    "panorama": ["panorama", "aerial", "view"],
    "sunset": ["sunset", "evening", "dusk"],
    "sunrise": ["sunrise", "morning", "dawn"],
    "night": ["night", "evening", "lights"],
    "museum": ["museum", "gallery", "art"],
    "cathedral": ["cathedral", "church", "basilica"],
    "church": ["church", "cathedral", "chapel"],
    "castle": ["castle", "fortress", "palace"],
    "palace": ["palace", "royal", "mansion"],
    "market": ["market", "bazaar", "stalls"],
    "cafe": ["cafe", "restaurant", "terrace"],
    "canal": ["canal", "waterway", "boats"],
    "bridge": ["bridge", "crossing"],
    "mountain": ["mountain", "peak", "hill"],
    "glacier": ["glacier", "ice", "frozen"],
    "waterfall": ["waterfall", "falls", "cascade"],
    "lagoon": ["lagoon", "bay", "cove"],
    "island": ["island", "isle", "atoll"],
    "reef": ["reef", "coral", "underwater"],
    "snorkeling": ["snorkeling", "diving", "underwater"],
    "hiking": ["hiking", "trail", "path"],
    "steps": ["steps", "stairs", "climbing"],
    "aquarium": ["aquarium", "fish", "marine"],
    "zoo": ["zoo", "animals", "wildlife"],
    "temple": ["temple", "shrine", "sacred"],
    "shrine": ["shrine", "temple", "sacred"],
    "mosque": ["mosque", "islamic", "minaret"],
    "library": ["library", "books", "reading"],
    "pyramids": ["pyramids", "ancient", "egypt"],
    "sphinx": ["sphinx", "egypt", "ancient"],
    "citadel": ["citadel", "fortress", "castle"],
    "corniche": ["corniche", "waterfront", "promenade"],
    "catacombs": ["catacombs", "underground", "tombs"],
    "coast": ["coast", "coastline", "shore"],
    "drive": ["drive", "road", "scenic"],
    "grotto": ["grotto", "cave", "cavern"],
    "ferry": ["ferry", "boat", "ship"],
    "ceramics": ["ceramics", "pottery", "crafts"],
    "lemons": ["lemons", "citrus", "fruit"],
    "pasta": ["pasta", "italian food", "restaurant"],
    "path": ["path", "trail", "hiking"],
    "cloister": ["cloister", "monastery", "courtyard"],
    "positano": ["Positano", "amalfi coast village"],
    "penguin": ["penguin", "penguins", "colony"],
    "iceberg": ["iceberg", "ice", "antarctic"],
    "zodiac": ["zodiac", "boat", "expedition"],
    "colony": ["colony", "wildlife", "birds"],
    "calving": ["glacier calving", "ice breaking"],
    "seal": ["seal", "seals", "marine"],
    "whale": ["whale", "whales", "marine"],
    "ship": ["ship", "cruise ship", "vessel"],
    "inner-harbor": ["inner harbor", "harbor", "marina"],
    "fort": ["fort", "fortress", "military"],
    "aquarium": ["aquarium", "fish", "marine life"],
    "crabs": ["crabs", "seafood", "maryland"],
    "grand-palace": ["grand palace", "royal palace"],
    "wat": ["wat", "temple", "buddhist"],
    "cadillac": ["Cadillac Mountain", "acadia"],
    "jordan-pond": ["Jordan Pond", "acadia"],
    "bridgetown": ["Bridgetown", "barbados"],
    "carlisle": ["Carlisle Bay", "barbados"],
    "harrisons": ["Harrison's Cave", "barbados"],
    "dunn": ["Dunn's River Falls", "jamaica"],
    "dazaifu": ["Dazaifu", "shrine", "fukuoka"],
    "notre-dame": ["Notre Dame Cathedral", "saigon"],
    "pitons": ["Pitons", "st lucia"],
    "sugar-beach": ["Sugar Beach", "st lucia"],
}


def fetch_json(url):
    """Fetch JSON from URL with proper User-Agent."""
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception as e:
        print(f"  Error fetching {url}: {e}")
        return None


def search_wikimedia(query, limit=5):
    """Search Wikimedia Commons for images matching query."""
    encoded_query = urllib.parse.quote(query)
    url = (
        f"https://commons.wikimedia.org/w/api.php?"
        f"action=query&list=search&srsearch={encoded_query}%20filetype:bitmap"
        f"&srnamespace=6&srlimit={limit}&format=json"
    )

    data = fetch_json(url)
    if not data or "query" not in data:
        return []

    results = []
    for item in data["query"].get("search", []):
        title = item.get("title", "")
        if title.startswith("File:"):
            results.append(title)

    return results


def get_image_info(file_title):
    """Get image info including URL and license from Wikimedia Commons."""
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

        # Get license info
        license_short = metadata.get("LicenseShortName", {}).get("value", "Unknown")
        license_url = metadata.get("LicenseUrl", {}).get("value", "")

        # Only accept CC licenses or public domain
        acceptable_licenses = ["CC BY", "CC BY-SA", "CC0", "Public domain", "pd", "CC-BY", "CC-BY-SA"]
        if not any(lic.lower() in license_short.lower() for lic in acceptable_licenses):
            return None

        return {
            "title": file_title,
            "url": imageinfo.get("thumburl") or imageinfo.get("url"),
            "original_url": imageinfo.get("url"),
            "width": imageinfo.get("thumbwidth") or imageinfo.get("width"),
            "height": imageinfo.get("thumbheight") or imageinfo.get("height"),
            "license": license_short,
            "license_url": license_url,
            "author": metadata.get("Artist", {}).get("value", "Unknown"),
            "description": metadata.get("ImageDescription", {}).get("value", ""),
            "commons_url": f"https://commons.wikimedia.org/wiki/{urllib.parse.quote(file_title)}",
        }

    return None


def download_image(url, output_path):
    """Download image from URL to output path."""
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            with open(output_path, "wb") as f:
                f.write(response.read())
        return True
    except Exception as e:
        print(f"  Error downloading {url}: {e}")
        return False


def convert_to_webp(input_path, output_path, max_width=1200, quality=82):
    """Convert image to optimized WebP format."""
    try:
        # Use ImageMagick if available
        cmd = [
            "convert", str(input_path),
            "-resize", f"{max_width}x>",
            "-quality", str(quality),
            str(output_path)
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        # Fall back to just renaming if no ImageMagick
        if input_path != output_path:
            os.rename(input_path, output_path)
        return True


def find_missing_images(port_slug):
    """Find images referenced in port HTML that don't exist."""
    html_file = PORTS_DIR / f"{port_slug}.html"
    if not html_file.exists():
        return []

    with open(html_file, "r", encoding="utf-8") as f:
        html = f.read()

    # Find all image references for this port
    pattern = rf'/ports/img/{re.escape(port_slug)}/([^"]+\.webp)'
    matches = re.findall(pattern, html)

    missing = []
    seen = set()
    for img_name in matches:
        if img_name in seen:
            continue
        seen.add(img_name)

        img_path = PORTS_IMG_DIR / port_slug / img_name
        if not img_path.exists():
            missing.append(img_name)

    return missing


def extract_image_type(filename):
    """Extract semantic type from filename like 'amsterdam-canals.webp' -> 'canals'."""
    name = filename.replace(".webp", "").replace(".jpg", "").replace(".png", "")
    parts = name.split("-")
    if len(parts) > 1:
        return "-".join(parts[1:])  # Everything after port name
    return "hero"


def build_search_queries(port_slug, img_name):
    """Build a list of search queries for a specific image."""
    img_type = extract_image_type(img_name)
    queries = []

    # Get port display name
    port_name = port_slug.replace("-", " ").title()

    # Direct search using image type as keyword
    type_words = img_type.replace("-", " ")
    queries.append(f"{port_name} {type_words}")

    # Look up specific search terms
    base_terms = PORT_SEARCH_TERMS.get(port_slug, [port_name])
    type_terms = IMAGE_TYPE_SEARCHES.get(img_type, [type_words])

    for base in base_terms[:2]:
        for term in type_terms[:2]:
            queries.append(f"{base} {term}")

    # Also try just the base terms for hero images
    if "hero" in img_type:
        queries.extend(base_terms[:3])

    return queries[:8]  # Limit to 8 queries


def source_port_images(port_slug, dry_run=False, limit=5):
    """Source missing images for a port."""
    missing = find_missing_images(port_slug)

    if not missing:
        print(f"  {port_slug}: No missing images")
        return 0

    print(f"  {port_slug}: {len(missing)} missing images")

    # Get search terms for this port
    base_terms = PORT_SEARCH_TERMS.get(port_slug, [port_slug.replace("-", " ")])

    port_img_dir = PORTS_IMG_DIR / port_slug
    port_img_dir.mkdir(parents=True, exist_ok=True)

    downloaded = 0

    for img_name in missing[:limit]:
        # Build search queries for this specific image
        queries = build_search_queries(port_slug, img_name)

        found = False
        for query in queries:
            print(f"    Searching: {query}")

            results = search_wikimedia(query, limit=5)

            for file_title in results:
                info = get_image_info(file_title)
                if not info:
                    continue

                print(f"    Found: {file_title[:50]}... ({info['license']})")

                if dry_run:
                    found = True
                    break

                # Download and convert
                temp_path = port_img_dir / f"temp_{img_name}"
                final_path = port_img_dir / img_name

                if download_image(info["url"], temp_path):
                    if convert_to_webp(temp_path, final_path):
                        # Clean up temp file if different
                        if temp_path.exists() and temp_path != final_path:
                            temp_path.unlink()

                        # Save attribution
                        attr_path = port_img_dir / f"{img_name}.attr.json"
                        with open(attr_path, "w", encoding="utf-8") as f:
                            json.dump(info, f, indent=2)

                        print(f"    Downloaded: {img_name}")
                        downloaded += 1
                        found = True
                        break

            if found:
                break

            time.sleep(0.3)  # Rate limiting

        if not found:
            print(f"    Could not find: {img_name}")

        time.sleep(0.5)  # Rate limiting between images

    return downloaded


def main():
    """Main entry point."""
    args = sys.argv[1:]

    dry_run = "--dry-run" in args
    args = [a for a in args if not a.startswith("--")]

    if dry_run:
        print("DRY RUN MODE - No files will be downloaded\n")

    # Get list of ports to process
    if args:
        ports = args
    else:
        # Find all ports with missing images
        ports = []
        for html_file in sorted(PORTS_DIR.glob("*.html")):
            port_slug = html_file.stem
            if port_slug == "index":
                continue
            missing = find_missing_images(port_slug)
            if missing:
                ports.append(port_slug)

    print(f"Processing {len(ports)} ports with missing images...\n")

    total_downloaded = 0
    for port_slug in ports:  # Process all ports
        downloaded = source_port_images(port_slug, dry_run=dry_run, limit=20)  # Up to 20 images per port
        total_downloaded += downloaded
        time.sleep(1)  # Rate limiting between ports

    print(f"\nTotal images downloaded: {total_downloaded}")


if __name__ == "__main__":
    main()
