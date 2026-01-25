#!/usr/bin/env python3
"""
Generate baseline stateroom exception files for ships missing them.
Soli Deo Gloria

This creates safe baseline files with:
- Ship metadata
- Empty exceptions (safe default - no false positives)
- No category_overrides (falls back to heuristic)
"""

import json
import os
from pathlib import Path
from datetime import date

# Ship class data from fleets.json (simplified for this script)
SHIP_CLASSES = {
    # Carnival Cruise Line
    "carnival-jubilee": {"class": "Excel", "year": 2023},
    "carnival-celebration": {"class": "Excel", "year": 2022},
    "mardi-gras": {"class": "Excel", "year": 2021},
    "carnival-firenze": {"class": "Venice", "year": 2024},
    "carnival-venezia": {"class": "Venice", "year": 2023},
    "carnival-panorama": {"class": "Vista", "year": 2019},
    "carnival-horizon": {"class": "Vista", "year": 2018},
    "carnival-vista": {"class": "Vista", "year": 2016},
    "carnival-breeze": {"class": "Dream", "year": 2012},
    "carnival-magic": {"class": "Dream", "year": 2011},
    "carnival-dream": {"class": "Dream", "year": 2009},
    "carnival-splendor": {"class": "Splendor", "year": 2008},
    "carnival-freedom": {"class": "Conquest", "year": 2007},
    "carnival-liberty": {"class": "Conquest", "year": 2005},
    "carnival-valor": {"class": "Conquest", "year": 2004},
    "carnival-glory": {"class": "Conquest", "year": 2003},
    "carnival-conquest": {"class": "Conquest", "year": 2002},
    "carnival-luminosa": {"class": "Spirit", "year": 2024},
    "carnival-miracle": {"class": "Spirit", "year": 2004},
    "carnival-legend": {"class": "Spirit", "year": 2002},
    "carnival-pride": {"class": "Spirit", "year": 2002},
    "carnival-spirit": {"class": "Spirit", "year": 2001},
    "carnival-radiance": {"class": "Sunshine", "year": 2024},
    "carnival-sunrise": {"class": "Sunshine", "year": 2019},
    "carnival-sunshine": {"class": "Sunshine", "year": 1996},
    "carnival-paradise": {"class": "Fantasy", "year": 1998},
    "carnival-elation": {"class": "Fantasy", "year": 1998},

    # Princess Cruises
    "star-princess": {"class": "Sphere", "year": 2025},
    "sun-princess": {"class": "Sphere", "year": 2024},
    "discovery-princess": {"class": "Royal", "year": 2022},
    "enchanted-princess": {"class": "Royal", "year": 2021},
    "sky-princess": {"class": "Royal", "year": 2019},
    "majestic-princess": {"class": "Royal", "year": 2017},
    "regal-princess": {"class": "Royal", "year": 2014},
    "royal-princess": {"class": "Royal", "year": 2013},
    "ruby-princess": {"class": "Grand", "year": 2008},
    "emerald-princess": {"class": "Grand", "year": 2007},
    "crown-princess": {"class": "Grand", "year": 2006},
    "caribbean-princess": {"class": "Grand", "year": 2004},
    "sapphire-princess": {"class": "Grand", "year": 2004},
    "diamond-princess": {"class": "Grand", "year": 2004},
    "grand-princess": {"class": "Grand", "year": 1998},
    "island-princess": {"class": "Coral", "year": 2003},
    "coral-princess": {"class": "Coral", "year": 2002},

    # Norwegian Cruise Line
    "norwegian-aqua": {"class": "Prima Plus", "year": 2025},
    "norwegian-viva": {"class": "Prima", "year": 2023},
    "norwegian-prima": {"class": "Prima", "year": 2022},
    "norwegian-encore": {"class": "Breakaway Plus", "year": 2019},
    "norwegian-bliss": {"class": "Breakaway Plus", "year": 2018},
    "norwegian-joy": {"class": "Breakaway Plus", "year": 2017},
    "norwegian-escape": {"class": "Breakaway Plus", "year": 2015},
    "norwegian-getaway": {"class": "Breakaway", "year": 2014},
    "norwegian-breakaway": {"class": "Breakaway", "year": 2013},
    "norwegian-epic": {"class": "Epic", "year": 2010},
    "norwegian-gem": {"class": "Jewel", "year": 2007},
    "norwegian-pearl": {"class": "Jewel", "year": 2006},
    "norwegian-jade": {"class": "Jewel", "year": 2006},
    "norwegian-jewel": {"class": "Jewel", "year": 2005},
    "pride-of-america": {"class": "Pride of America", "year": 2005},
    "norwegian-dawn": {"class": "Dawn", "year": 2002},
    "norwegian-star": {"class": "Dawn", "year": 2001},
    "norwegian-sun": {"class": "Sun", "year": 2001},
    "norwegian-sky": {"class": "Sun", "year": 1999},
    "norwegian-spirit": {"class": "Spirit", "year": 1998},

    # Celebrity Cruises
    "celebrity-xcel": {"class": "Edge", "year": 2025},
    "celebrity-ascent": {"class": "Edge", "year": 2023},
    "celebrity-beyond": {"class": "Edge", "year": 2022},
    "celebrity-apex": {"class": "Edge", "year": 2021},
    "celebrity-edge": {"class": "Edge", "year": 2018},
    "celebrity-reflection": {"class": "Solstice", "year": 2012},
    "celebrity-silhouette": {"class": "Solstice", "year": 2011},
    "celebrity-eclipse": {"class": "Solstice", "year": 2010},
    "celebrity-equinox": {"class": "Solstice", "year": 2009},
    "celebrity-solstice": {"class": "Solstice", "year": 2008},
    "celebrity-constellation": {"class": "Millennium", "year": 2002},
    "celebrity-summit": {"class": "Millennium", "year": 2001},
    "celebrity-infinity": {"class": "Millennium", "year": 2001},
    "celebrity-millennium": {"class": "Millennium", "year": 2000},
    "celebrity-flora": {"class": "Expedition", "year": 2019},

    # MSC Cruises
    "msc-world-america": {"class": "World", "year": 2025},
    "msc-world-europa": {"class": "World", "year": 2022},
    "msc-world-asia": {"class": "World", "year": 2026},
    "msc-euribia": {"class": "Meraviglia Plus", "year": 2023},
    "msc-virtuosa": {"class": "Meraviglia Plus", "year": 2021},
    "msc-grandiosa": {"class": "Meraviglia Plus", "year": 2019},
    "msc-seascape": {"class": "Seaside EVO", "year": 2022},
    "msc-seashore": {"class": "Seaside EVO", "year": 2021},
    "msc-bellissima": {"class": "Meraviglia", "year": 2019},
    "msc-meraviglia": {"class": "Meraviglia", "year": 2017},
    "msc-seaview": {"class": "Seaside", "year": 2018},
    "msc-seaside": {"class": "Seaside", "year": 2017},
    "msc-preziosa": {"class": "Fantasia", "year": 2013},
    "msc-divina": {"class": "Fantasia", "year": 2012},
    "msc-magnifica": {"class": "Fantasia", "year": 2010},
    "msc-splendida": {"class": "Fantasia", "year": 2009},
    "msc-fantasia": {"class": "Fantasia", "year": 2008},
    "msc-poesia": {"class": "Musica", "year": 2008},
    "msc-orchestra": {"class": "Musica", "year": 2007},
    "msc-musica": {"class": "Musica", "year": 2006},
    "msc-opera": {"class": "Lirica", "year": 2004},
    "msc-lirica": {"class": "Lirica", "year": 2003},
    "msc-sinfonia": {"class": "Lirica", "year": 2002},
    "msc-armonia": {"class": "Lirica", "year": 2001},

    # Holland America Line
    "rotterdam": {"class": "Pinnacle", "year": 2021},
    "nieuw-statendam": {"class": "Pinnacle", "year": 2018},
    "koningsdam": {"class": "Pinnacle", "year": 2016},
    "nieuw-amsterdam": {"class": "Signature", "year": 2010},
    "eurodam": {"class": "Signature", "year": 2008},
    "noordam": {"class": "Vista", "year": 2006},
    "westerdam": {"class": "Vista", "year": 2004},
    "oosterdam": {"class": "Vista", "year": 2003},
    "zuiderdam": {"class": "Vista", "year": 2002},
    "zaandam": {"class": "R", "year": 2000},
    "volendam": {"class": "R", "year": 1999},

    # Costa Cruises
    "costa-smeralda": {"class": "Excellence", "year": 2019},
    "costa-toscana": {"class": "Excellence", "year": 2021},
    "costa-diadema": {"class": "Diadema", "year": 2014},
    "costa-fascinosa": {"class": "Concordia", "year": 2012},
    "costa-favolosa": {"class": "Concordia", "year": 2011},
    "costa-deliziosa": {"class": "Deliziosa", "year": 2010},
    "costa-pacifica": {"class": "Pacifica", "year": 2009},
    "costa-firenze": {"class": "Venice", "year": 2021},
    "costa-venezia": {"class": "Venice", "year": 2019},

    # Cunard
    "queen-mary-2": {"class": "QM2", "year": 2004},
    "queen-anne": {"class": "Queen Anne", "year": 2024},
    "queen-victoria": {"class": "Vista", "year": 2007},
    "queen-elizabeth": {"class": "Vista", "year": 2010},

    # Oceania
    "allura": {"class": "Allura", "year": 2025},
    "vista": {"class": "Allura", "year": 2023},
    "riviera": {"class": "Oceania", "year": 2012},
    "marina": {"class": "Oceania", "year": 2011},
    "sirena": {"class": "Regatta", "year": 2016},
    "nautica": {"class": "Regatta", "year": 2000},
    "regatta": {"class": "Regatta", "year": 1998},
    "insignia": {"class": "Regatta", "year": 1998},

    # Regent Seven Seas
    "seven-seas-grandeur": {"class": "Explorer", "year": 2023},
    "seven-seas-splendor": {"class": "Explorer", "year": 2020},
    "seven-seas-explorer": {"class": "Explorer", "year": 2016},
    "seven-seas-voyager": {"class": "Voyager", "year": 2003},
    "seven-seas-mariner": {"class": "Voyager", "year": 2001},
    "seven-seas-navigator": {"class": "Voyager", "year": 1999},

    # Seabourn
    "seabourn-ovation": {"class": "Encore", "year": 2018},
    "seabourn-encore": {"class": "Encore", "year": 2016},
    "seabourn-pursuit": {"class": "Expedition", "year": 2023},
    "seabourn-venture": {"class": "Expedition", "year": 2022},
    "seabourn-quest": {"class": "Odyssey", "year": 2011},
    "seabourn-sojourn": {"class": "Odyssey", "year": 2010},
    "seabourn-odyssey": {"class": "Odyssey", "year": 2009},

    # Silversea
    "silver-ray": {"class": "Nova", "year": 2024},
    "silver-nova": {"class": "Nova", "year": 2023},
    "silver-dawn": {"class": "Muse", "year": 2022},
    "silver-moon": {"class": "Muse", "year": 2020},
    "silver-muse": {"class": "Muse", "year": 2017},
    "silver-spirit": {"class": "Spirit", "year": 2009},
    "silver-whisper": {"class": "Whisper", "year": 2001},
    "silver-shadow": {"class": "Shadow", "year": 2000},
    "silver-endeavour": {"class": "Expedition", "year": 2021},
    "silver-origin": {"class": "Expedition", "year": 2020},
    "silver-wind": {"class": "Classic", "year": 1995},
    "silver-cloud": {"class": "Classic", "year": 1994},

    # Virgin Voyages
    "scarlet-lady": {"class": "Virgin", "year": 2020},
    "valiant-lady": {"class": "Virgin", "year": 2022},
    "resilient-lady": {"class": "Virgin", "year": 2023},
    "brilliant-lady": {"class": "Virgin", "year": 2025},

    # Explora Journeys
    "explora-i": {"class": "Explora", "year": 2023},
    "explora-ii": {"class": "Explora", "year": 2024},
    "explora-iii": {"class": "Explora", "year": 2026},
    "explora-iv": {"class": "Explora", "year": 2027},
    "explora-v": {"class": "Explora", "year": 2028},
    "explora-vi": {"class": "Explora", "year": 2029},
}

def slug_to_name(slug):
    """Convert slug to proper ship name."""
    # Special cases
    special = {
        "mardi-gras": "Mardi Gras",
        "queen-mary-2": "Queen Mary 2",
    }
    if slug in special:
        return special[slug]

    return " ".join(word.capitalize() for word in slug.split("-"))

def create_baseline_exception(slug, data_dir):
    """Create a baseline stateroom exception file for a ship."""
    ship_info = SHIP_CLASSES.get(slug, {"class": "Unknown", "year": None})
    ship_name = slug_to_name(slug)
    today = date.today().isoformat()

    exception_data = {
        "ship_name": ship_name,
        "ship_class": ship_info["class"],
        "launch_year": ship_info["year"],
        "last_refurbishment": None,
        "data_version": "2.0",
        "last_updated": today,
        "audit_notes": f"{today}: Baseline file created. No cabin-specific data yet - community reports welcome.",
        "total_exceptions": 0,
        "cabin_decks": "TBD",
        "methodology": "Baseline file - awaiting community cabin reports",
        "trust_note": "This is a baseline file. Submit cabin feedback to improve accuracy.",
        "category_overrides": {
            "_verification_source": "Pending cabin verification",
            "_verification_date": today,
            "_verification_note": "No category overrides defined yet. Cabin lookup uses heuristic fallback."
        },
        "exceptions": [],
        "removed_exceptions": []
    }

    filename = f"stateroom-exceptions.{slug}.v2.json"
    filepath = os.path.join(data_dir, filename)

    with open(filepath, 'w') as f:
        json.dump(exception_data, f, indent=2)

    return filename

def main():
    # Directories
    data_dir = "/home/user/InTheWake/assets/data/staterooms"
    ships_dir = "/home/user/InTheWake/ships"

    # Get existing exception files
    existing = set()
    for f in os.listdir(data_dir):
        if f.startswith("stateroom-exceptions.") and f.endswith(".v2.json"):
            slug = f.replace("stateroom-exceptions.", "").replace(".v2.json", "")
            existing.add(slug)

    print(f"Found {len(existing)} existing exception files")

    # Find all ship HTML files
    all_ships = []
    cruise_lines = ["carnival", "celebrity-cruises", "costa", "cunard", "explora-journeys",
                    "holland-america-line", "msc", "norwegian", "oceania", "princess",
                    "regent", "seabourn", "silversea", "virgin-voyages"]

    for line in cruise_lines:
        line_dir = os.path.join(ships_dir, line)
        if os.path.exists(line_dir):
            for f in os.listdir(line_dir):
                if f.endswith(".html") and f != "index.html":
                    slug = f.replace(".html", "")
                    all_ships.append((line, slug))

    print(f"Found {len(all_ships)} ship pages")

    # Create missing exception files
    created = 0
    skipped = 0
    for line, slug in all_ships:
        if slug not in existing:
            filename = create_baseline_exception(slug, data_dir)
            print(f"Created: {filename}")
            created += 1
        else:
            skipped += 1

    print(f"\nSummary:")
    print(f"  Created: {created} new files")
    print(f"  Skipped: {skipped} (already exist)")
    print(f"  Total: {created + skipped}")

if __name__ == "__main__":
    main()
