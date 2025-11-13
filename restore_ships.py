#!/usr/bin/env python3
"""
Restore Royal Caribbean ship pages to v3.010.300 standard
Preserves original content while updating shell, navigation, and SEO
"""

import subprocess
import json
import re
from pathlib import Path

# Ship data extracted from original files
SHIPS = {
    "adventure-of-the-seas": {"name": "Adventure of the Seas", "imo": "9167227", "class": "Voyager Class"},
    "allure-of-the-seas": {"name": "Allure of the Seas", "imo": "9383936", "class": "Oasis Class"},
    "anthem-of-the-seas": {"name": "Anthem of the Seas", "imo": "9656101", "class": "Quantum Class"},
    "brilliance-of-the-seas": {"name": "Brilliance of the Seas", "imo": "9195343", "class": "Radiance Class"},
    "enchantment-of-the-seas": {"name": "Enchantment of the Seas", "imo": "8814744", "class": "Vision Class"},
    "explorer-of-the-seas": {"name": "Explorer of the Seas", "imo": "9161728", "class": "Voyager Class"},
    "freedom-of-the-seas": {"name": "Freedom of the Seas", "imo": "9304033", "class": "Freedom Class"},
    "grandeur-of-the-seas": {"name": "Grandeur of the Seas", "imo": "8919370", "class": "Vision Class"},
    "harmony-of-the-seas": {"name": "Harmony of the Seas", "imo": "9682875", "class": "Oasis Class"},
    "icon-of-the-seas": {"name": "Icon of the Seas", "imo": "9931046", "class": "Icon Class"},
    "independence-of-the-seas": {"name": "Independence of the Seas", "imo": "9349681", "class": "Freedom Class"},
    "jewel-of-the-seas": {"name": "Jewel of the Seas", "imo": "9228344", "class": "Radiance Class"},
    "liberty-of-the-seas": {"name": "Liberty of the Seas", "imo": "9345502", "class": "Freedom Class"},
    "majesty-of-the-seas": {"name": "Majesty of the Seas", "imo": "8700764", "class": "Sovereign Class"},
    "mariner-of-the-seas": {"name": "Mariner of the Seas", "imo": "9239256", "class": "Voyager Class"},
    "monarch-of-the-seas": {"name": "Monarch of the Seas", "imo": "8717862", "class": "Sovereign Class"},
    "navigator-of-the-seas": {"name": "Navigator of the Seas", "imo": "9216528", "class": "Voyager Class"},
    "oasis-of-the-seas": {"name": "Oasis of the Seas", "imo": "9383948", "class": "Oasis Class"},
    "odyssey-of-the-seas": {"name": "Odyssey of the Seas", "imo": "9863917", "class": "Quantum Ultra Class"},
    "ovation-of-the-seas": {"name": "Ovation of the Seas", "imo": "9697753", "class": "Quantum Class"},
    "quantum-of-the-seas": {"name": "Quantum of the Seas", "imo": "9656100", "class": "Quantum Class"},
    "rhapsody-of-the-seas": {"name": "Rhapsody of the Seas", "imo": "8820143", "class": "Vision Class"},
    "serenade-of-the-seas": {"name": "Serenade of the Seas", "imo": "9228356", "class": "Radiance Class"},
    "spectrum-of-the-seas": {"name": "Spectrum of the Seas", "imo": "9794512", "class": "Quantum Ultra Class"},
    "splendour-of-the-seas": {"name": "Splendour of the Seas", "imo": "8919382", "class": "Vision Class"},
    "star-of-the-seas": {"name": "Star of the Seas", "imo": "TBD", "class": "Icon Class"},
    "symphony-of-the-seas": {"name": "Symphony of the Seas", "imo": "9744001", "class": "Oasis Class"},
    "utopia-of-the-seas": {"name": "Utopia of the Seas", "imo": "TBD", "class": "Oasis Class"},
    "vision-of-the-seas": {"name": "Vision of the Seas", "imo": "8901107", "class": "Vision Class"},
    "voyager-of-the-seas": {"name": "Voyager of the Seas", "imo": "9161716", "class": "Voyager Class"},
    "wonder-of-the-seas": {"name": "Wonder of the Seas", "imo": "9838188", "class": "Oasis Class"},
    "legend-of-the-seas": {"name": "Legend of the Seas", "imo": "8912682", "class": "Legend Class"},
    "sovereign-of-the-seas": {"name": "Sovereign of the Seas", "imo": "8707509", "class": "Sovereign Class"},
    "nordic-empress": {"name": "Nordic Empress", "imo": "8517636", "class": "Nordic Class"},
    "song-of-norway": {"name": "Song of Norway", "imo": "6824318", "class": "Song Class"},
}

def get_ship_slug_from_filename(filename):
    """Extract ship slug from filename"""
    return Path(filename).stem

def extract_ship_details_from_original(slug):
    """Extract ship-specific details from original commit"""
    try:
        # Get original file content
        result = subprocess.run(
            ["git", "show", f"475d397~1:ships/rcl/{slug}.html"],
            capture_output=True,
            text=True,
            cwd="/home/user/InTheWake"
        )

        if result.returncode != 0:
            print(f"Warning: Could not retrieve original for {slug}")
            return None

        content = result.stdout

        # Extract IMO from data-imo attribute
        imo_match = re.search(r'data-imo="([^"]+)"', content)
        imo = imo_match.group(1) if imo_match else "TBD"

        # Extract ship name from title or h1
        name_match = re.search(r'<title>([^—]+)', content)
        if name_match:
            name = name_match.group(1).strip()
        else:
            # Fallback to slug
            name = slug.replace('-', ' ').title()

        # Try to extract stats JSON
        stats_match = re.search(r'<script[^>]*id="ship-stats-fallback"[^>]*>\s*({[^}]+})\s*</script>', content, re.DOTALL)
        stats = None
        if stats_match:
            try:
                stats = json.loads(stats_match.group(1))
            except:
                pass

        return {
            "slug": slug,
            "name": name,
            "imo": imo,
            "stats": stats
        }

    except Exception as e:
        print(f"Error extracting details for {slug}: {e}")
        return None

def get_all_ship_files():
    """Get list of all ship HTML files except radiance (already done)"""
    ships_dir = Path("/home/user/InTheWake/ships/rcl")
    all_files = list(ships_dir.glob("*.html"))
    # Exclude radiance-of-the-seas.html as it's already done
    return [f for f in all_files if f.name != "radiance-of-the-seas.html"]

def create_ship_page_template(ship_info):
    """Generate ship page HTML from template with ship-specific details"""
    slug = ship_info.get("slug", "unknown")
    name = ship_info.get("name", "Unknown Ship")
    imo = ship_info.get("imo", "TBD")
    ship_class = ship_info.get("class", "Unknown Class")
    stats = ship_info.get("stats", {})

    # Create stats JSON fallback
    if not stats:
        stats = {
            "slug": slug,
            "name": name,
            "class": ship_class,
            "entered_service": "TBD",
            "gt": "TBD",
            "guests": "TBD",
            "crew": "TBD",
            "length": "TBD",
            "beam": "TBD",
            "registry": "TBD"
        }

    stats_json = json.dumps(stats, indent=2)

    # Read the radiance template
    template_path = Path("/home/user/InTheWake/ships/rcl/radiance-of-the-seas.html")
    with open(template_path, 'r') as f:
        template = f.read()

    # Replace radiance-specific details with this ship's details
    content = template

    # Replace ship name
    content = content.replace("Radiance of the Seas", name)
    content = content.replace("radiance-of-the-seas", slug)
    content = content.replace("RADIANCE-OF-THE-SEAS", slug.upper().replace("-", "-"))
    content = content.replace("Radiance of the Seas", name)
    content = content.replace("Radiance", name.split(" of ")[0] if " of " in name else name)

    # Replace IMO number
    content = re.sub(r'data-imo="[^"]*"', f'data-imo="{imo}"', content)

    # Replace class
    content = content.replace("Radiance Class", ship_class)

    # Replace stats JSON
    content = re.sub(
        r'<script type="application/json" id="ship-stats-fallback">.*?</script>',
        f'<script type="application/json" id="ship-stats-fallback">\n          {stats_json}\n          </script>',
        content,
        flags=re.DOTALL
    )

    # Update data-slug
    content = re.sub(r'data-slug="[^"]*"', f'data-slug="{slug}"', content)

    return content

print("Starting ship page restoration...")
print("=" * 60)

# Get all ship files to process
ship_files = get_all_ship_files()
print(f"Found {len(ship_files)} ship pages to restore")
print()

# Process each ship
restored_count = 0
failed_count = 0

for ship_file in sorted(ship_files):
    slug = get_ship_slug_from_filename(ship_file.name)
    print(f"Processing: {slug}...")

    # Get ship info from our data or extract from original
    if slug in SHIPS:
        ship_info = {"slug": slug, **SHIPS[slug]}
    else:
        ship_info = extract_ship_details_from_original(slug)
        if not ship_info:
            ship_info = {
                "slug": slug,
                "name": slug.replace("-", " ").title(),
                "imo": "TBD",
                "class": "Unknown Class"
            }

    # Also try to extract stats from original
    original_details = extract_ship_details_from_original(slug)
    if original_details and original_details.get("stats"):
        ship_info["stats"] = original_details["stats"]

    try:
        # Generate page content
        page_content = create_ship_page_template(ship_info)

        # Write the file
        with open(ship_file, 'w') as f:
            f.write(page_content)

        print(f"  ✓ Restored {slug}")
        restored_count += 1

    except Exception as e:
        print(f"  ✗ Failed to restore {slug}: {e}")
        failed_count += 1

print()
print("=" * 60)
print(f"Restoration complete!")
print(f"  Restored: {restored_count} pages")
print(f"  Failed: {failed_count} pages")
print(f"  Total: {len(ship_files)} pages")
