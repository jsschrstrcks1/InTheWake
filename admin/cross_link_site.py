#!/usr/bin/env python3
"""
Cross-linking pass for In the Wake.

Automatically links mentions of ships, venues, and articles throughout the site.
For "solo cruising" mentions, links to both Ken's and Tina's articles.
"""

import os
import re
from pathlib import Path
from html.parser import HTMLParser

# Entity definitions
SHIPS = {
    # Oasis Class
    "Icon of the Seas": "/ships/rcl/icon-of-the-seas.html",
    "Utopia of the Seas": "/ships/rcl/utopia-of-the-seas.html",
    "Wonder of the Seas": "/ships/rcl/wonder-of-the-seas.html",
    "Symphony of the Seas": "/ships/rcl/symphony-of-the-seas.html",
    "Harmony of the Seas": "/ships/rcl/harmony-of-the-seas.html",
    "Allure of the Seas": "/ships/rcl/allure-of-the-seas.html",
    "Oasis of the Seas": "/ships/rcl/oasis-of-the-seas.html",
    # Quantum Class
    "Quantum of the Seas": "/ships/rcl/quantum-of-the-seas.html",
    "Anthem of the Seas": "/ships/rcl/anthem-of-the-seas.html",
    "Ovation of the Seas": "/ships/rcl/ovation-of-the-seas.html",
    "Spectrum of the Seas": "/ships/rcl/spectrum-of-the-seas.html",
    "Odyssey of the Seas": "/ships/rcl/odyssey-of-the-seas.html",
    # Freedom Class
    "Freedom of the Seas": "/ships/rcl/freedom-of-the-seas.html",
    "Liberty of the Seas": "/ships/rcl/liberty-of-the-seas.html",
    "Independence of the Seas": "/ships/rcl/independence-of-the-seas.html",
    # Voyager Class
    "Voyager of the Seas": "/ships/rcl/voyager-of-the-seas.html",
    "Explorer of the Seas": "/ships/rcl/explorer-of-the-seas.html",
    "Adventure of the Seas": "/ships/rcl/adventure-of-the-seas.html",
    "Navigator of the Seas": "/ships/rcl/navigator-of-the-seas.html",
    "Mariner of the Seas": "/ships/rcl/mariner-of-the-seas.html",
    # Radiance Class
    "Radiance of the Seas": "/ships/rcl/radiance-of-the-seas.html",
    "Brilliance of the Seas": "/ships/rcl/brilliance-of-the-seas.html",
    "Serenade of the Seas": "/ships/rcl/serenade-of-the-seas.html",
    "Jewel of the Seas": "/ships/rcl/jewel-of-the-seas.html",
    # Vision Class
    "Vision of the Seas": "/ships/rcl/vision-of-the-seas.html",
    "Rhapsody of the Seas": "/ships/rcl/rhapsody-of-the-seas.html",
    "Enchantment of the Seas": "/ships/rcl/enchantment-of-the-seas.html",
    "Grandeur of the Seas": "/ships/rcl/grandeur-of-the-seas.html",
}

# Short names for ships (only link if unambiguous context)
SHIP_SHORT_NAMES = {
    "Icon": "/ships/rcl/icon-of-the-seas.html",
    "Utopia": "/ships/rcl/utopia-of-the-seas.html",
    "Wonder": "/ships/rcl/wonder-of-the-seas.html",
    "Symphony": "/ships/rcl/symphony-of-the-seas.html",
    "Harmony": "/ships/rcl/harmony-of-the-seas.html",
    "Allure": "/ships/rcl/allure-of-the-seas.html",
    "Oasis": "/ships/rcl/oasis-of-the-seas.html",
    "Quantum": "/ships/rcl/quantum-of-the-seas.html",
    "Anthem": "/ships/rcl/anthem-of-the-seas.html",
    "Ovation": "/ships/rcl/ovation-of-the-seas.html",
    "Spectrum": "/ships/rcl/spectrum-of-the-seas.html",
    "Odyssey": "/ships/rcl/odyssey-of-the-seas.html",
    "Freedom": "/ships/rcl/freedom-of-the-seas.html",
    "Liberty": "/ships/rcl/liberty-of-the-seas.html",
    "Independence": "/ships/rcl/independence-of-the-seas.html",
    "Voyager": "/ships/rcl/voyager-of-the-seas.html",
    "Explorer": "/ships/rcl/explorer-of-the-seas.html",
    "Adventure": "/ships/rcl/adventure-of-the-seas.html",
    "Navigator": "/ships/rcl/navigator-of-the-seas.html",
    "Mariner": "/ships/rcl/mariner-of-the-seas.html",
    "Radiance": "/ships/rcl/radiance-of-the-seas.html",
    "Brilliance": "/ships/rcl/brilliance-of-the-seas.html",
    "Serenade": "/ships/rcl/serenade-of-the-seas.html",
    "Jewel": "/ships/rcl/jewel-of-the-seas.html",
    "Vision": "/ships/rcl/vision-of-the-seas.html",
    "Rhapsody": "/ships/rcl/rhapsody-of-the-seas.html",
    "Enchantment": "/ships/rcl/enchantment-of-the-seas.html",
    "Grandeur": "/ships/rcl/grandeur-of-the-seas.html",
}

VENUES = {
    # Main Dining
    "Main Dining Room": "/restaurants/mdr.html",
    "Windjammer": "/restaurants/windjammer.html",
    "Windjammer Marketplace": "/restaurants/windjammer.html",
    # Specialty
    "Chops Grille": "/restaurants/chops.html",
    "Chops": "/restaurants/chops.html",
    "Giovanni's Table": "/restaurants/giovannis.html",
    "Giovanni's": "/restaurants/giovannis.html",
    "Izumi": "/restaurants/izumi.html",
    "150 Central Park": "/restaurants/150-central-park.html",
    "Wonderland": "/restaurants/wonderland.html",
    "Jamie's Italian": "/restaurants/jamies-italian.html",
    "Hooked Seafood": "/restaurants/hooked.html",
    "Sabor": "/restaurants/sabor.html",
    "Chef's Table": "/restaurants/chefs-table.html",
    # Casual
    "Park Café": "/restaurants/park-cafe.html",
    "Park Cafe": "/restaurants/park-cafe.html",
    "Solarium Bistro": "/restaurants/solarium-bistro.html",
    "El Loco Fresh": "/restaurants/el-loco-fresh.html",
    "Johnny Rockets": "/restaurants/johnny-rockets.html",
    "Sorrento's": "/restaurants/sorrentos.html",
    "Café Promenade": "/restaurants/cafe-promenade.html",
    "Cafe Promenade": "/restaurants/cafe-promenade.html",
    "Café Latte-tudes": "/restaurants/latte-tudes.html",
    "Latte-tudes": "/restaurants/latte-tudes.html",
    # Bars
    "Schooner Bar": "/restaurants/schooner-bar.html",
    "Schooner": "/restaurants/schooner-bar.html",
    "Bionic Bar": "/restaurants/bionic-bar.html",
    "Playmakers": "/restaurants/playmakers.html",
    # Areas
    "Solarium": "/restaurants/solarium-bistro.html",
}

ARTICLES = {
    # Solo articles - special handling
    "solo cruising": "SOLO_SPECIAL",
    "cruising solo": "SOLO_SPECIAL",
    "solo cruiser": "SOLO_SPECIAL",
    "traveling alone": "SOLO_SPECIAL",
    # Other articles
    "accessibility": "/accessibility.html",
    "accessible cruising": "/accessibility.html",
    "grief": "/solo/in-the-wake-of-grief.html",
    "drink calculator": "/drink-calculator.html",
    "beverage package": "/drink-calculator.html",
    "packing list": "/packing-lists.html",
    "packing lists": "/packing-lists.html",
    "stateroom check": "/stateroom-check.html",
}

# Ship classes (link to ships.html with anchors)
SHIP_CLASSES = {
    "Oasis class": "/ships.html#oasis-class",
    "Oasis Class": "/ships.html#oasis-class",
    "Quantum class": "/ships.html#quantum-class",
    "Quantum Class": "/ships.html#quantum-class",
    "Freedom class": "/ships.html#freedom-class",
    "Freedom Class": "/ships.html#freedom-class",
    "Voyager class": "/ships.html#voyager-class",
    "Voyager Class": "/ships.html#voyager-class",
    "Radiance class": "/ships.html#radiance-class",
    "Radiance Class": "/ships.html#radiance-class",
    "Vision class": "/ships.html#vision-class",
    "Vision Class": "/ships.html#vision-class",
}

# Ports with detailed guides
PORTS = {
    # Private Islands
    "Perfect Day at CocoCay": "/ports/cococay.html",
    "CocoCay": "/ports/cococay.html",
    "Labadee": "/ports/labadee.html",
    # Caribbean
    "Cozumel": "/ports/cozumel.html",
    # Alaska
    "Juneau": "/ports/juneau.html",
    # Mediterranean
    "Santorini": "/ports/santorini.html",
    "Kusadasi": "/ports/kusadasi.html",
    "Ephesus": "/ports/kusadasi.html",
    # Asia-Pacific
    "Singapore": "/ports/singapore.html",
    "Gardens by the Bay": "/ports/singapore.html",
    "Sydney": "/ports/sydney.html",
    "Sydney Harbour": "/ports/sydney.html",
    "Brisbane": "/ports/brisbane.html",
    "Lone Pine Koala Sanctuary": "/ports/brisbane.html",
    "Auckland": "/ports/auckland.html",
    "Bay of Islands": "/ports/auckland.html",
    "Waiheke Island": "/ports/auckland.html",
    "Tokyo": "/ports/tokyo.html",
    "Yokohama": "/ports/tokyo.html",
    "TeamLab": "/ports/tokyo.html",
    "Tsukiji Market": "/ports/tokyo.html",
    "Hong Kong": "/ports/hong-kong.html",
    "Victoria Peak": "/ports/hong-kong.html",
    "Big Buddha": "/ports/hong-kong.html",
    "Shanghai": "/ports/shanghai.html",
    "The Bund": "/ports/shanghai.html",
    "Yu Garden": "/ports/shanghai.html",
    "Bangkok": "/ports/bangkok.html",
    "Laem Chabang": "/ports/bangkok.html",
    "Grand Palace": "/ports/bangkok.html",
    "Wat Arun": "/ports/bangkok.html",
    "Bali": "/ports/bali.html",
    "Benoa": "/ports/bali.html",
    "Uluwatu": "/ports/bali.html",
    "Ubud": "/ports/bali.html",
    # South Pacific
    "Bora Bora": "/ports/south-pacific.html",
    "Tahiti": "/ports/south-pacific.html",
    "Papeete": "/ports/south-pacific.html",
    "Moorea": "/ports/south-pacific.html",
    "Fiji": "/ports/south-pacific.html",
}

def get_page_url(filepath: Path, project_root: Path) -> str:
    """Get the URL path for a file."""
    rel_path = filepath.relative_to(project_root)
    return "/" + str(rel_path)

def is_already_linked(content: str, match_start: int, match_end: int) -> bool:
    """Check if the matched text is already inside a link."""
    # Look backward for unclosed <a tags
    before = content[:match_start]
    # Count <a and </a tags
    open_tags = len(re.findall(r'<a\s', before, re.IGNORECASE))
    close_tags = len(re.findall(r'</a>', before, re.IGNORECASE))
    return open_tags > close_tags

def should_skip_page(filepath: Path, page_url: str) -> bool:
    """Determine if a page should be skipped for cross-linking."""
    # Skip vendor pages, admin, etc.
    skip_patterns = [
        '/vendors/',
        '/admin/',
        '/assets/',
        '/data/',
    ]
    for pattern in skip_patterns:
        if pattern in page_url:
            return True
    return False

def link_entity(content: str, entity_name: str, target_url: str, page_url: str) -> tuple[str, int]:
    """
    Replace mentions of an entity with links.
    Returns (new_content, count_of_replacements).
    """
    # Don't link to self
    if target_url == page_url:
        return content, 0

    # Only link in text content (not in scripts, styles, existing links, or attributes)
    # This is a simplified approach - we'll be conservative

    count = 0
    result = []
    last_end = 0

    # Find all matches
    pattern = re.compile(r'\b' + re.escape(entity_name) + r'\b', re.IGNORECASE)

    for match in pattern.finditer(content):
        start, end = match.start(), match.end()
        matched_text = match.group()

        # Check if we're inside a tag, script, style, or existing link
        before = content[:start]

        # Skip if inside a tag attribute
        last_lt = before.rfind('<')
        last_gt = before.rfind('>')
        if last_lt > last_gt:
            # We're inside a tag
            result.append(content[last_end:end])
            last_end = end
            continue

        # Skip if inside script or style
        in_script = before.count('<script') > before.count('</script')
        in_style = before.count('<style') > before.count('</style')
        if in_script or in_style:
            result.append(content[last_end:end])
            last_end = end
            continue

        # Skip if already inside a link
        if is_already_linked(content, start, end):
            result.append(content[last_end:end])
            last_end = end
            continue

        # Skip if in a heading (h1-h6) - these are usually the main topic
        # Simple check: look for <h in the immediate context
        recent = content[max(0, start-100):start]
        if re.search(r'<h[1-6][^>]*>[^<]*$', recent):
            result.append(content[last_end:end])
            last_end = end
            continue

        # Create the link
        link = f'<a href="{target_url}">{matched_text}</a>'
        result.append(content[last_end:start])
        result.append(link)
        last_end = end
        count += 1

        # Only link first occurrence per page to avoid over-linking
        break

    result.append(content[last_end:])
    return ''.join(result), count

def handle_solo_special(content: str, page_url: str) -> tuple[str, int]:
    """
    Special handling for solo cruising mentions.
    Links to both Ken's practical guide and Tina's personal story.
    """
    ken_url = "/solo/solo-cruisers-companion.html"
    tina_url = "/solo/why-i-started-solo-cruising.html"

    # Don't link on the solo pages themselves
    if any(url in page_url for url in [ken_url, tina_url, "/solo.html"]):
        return content, 0

    count = 0
    patterns = [
        (r'\bsolo cruising\b', 'solo cruising'),
        (r'\bcruising solo\b', 'cruising solo'),
        (r'\bsolo cruiser\b', 'solo cruiser'),
    ]

    for pattern, text in patterns:
        regex = re.compile(pattern, re.IGNORECASE)
        match = regex.search(content)
        if match and not is_already_linked(content, match.start(), match.end()):
            # Check we're not in a tag, script, or style
            before = content[:match.start()]
            last_lt = before.rfind('<')
            last_gt = before.rfind('>')
            if last_lt > last_gt:
                continue
            in_script = before.count('<script') > before.count('</script')
            in_style = before.count('<style') > before.count('</style')
            if in_script or in_style:
                continue

            # Create dual link
            matched = match.group()
            replacement = f'<a href="{ken_url}">{matched}</a> (see also <a href="{tina_url}">Tina\'s story</a>)'
            content = content[:match.start()] + replacement + content[match.end():]
            count += 1
            break  # Only link first occurrence

    return content, count

def process_file(filepath: Path, project_root: Path) -> dict:
    """Process a single file for cross-linking."""
    page_url = get_page_url(filepath, project_root)

    if should_skip_page(filepath, page_url):
        return {"file": filepath.name, "skipped": True, "reason": "excluded path"}

    try:
        content = filepath.read_text(encoding='utf-8')
    except Exception as e:
        return {"file": filepath.name, "error": str(e)}

    original_content = content
    total_links = 0

    # Process entities in order of specificity (longer names first)

    # 1. Full ship names
    for name, url in sorted(SHIPS.items(), key=lambda x: -len(x[0])):
        content, count = link_entity(content, name, url, page_url)
        total_links += count

    # 2. Ship classes
    for name, url in sorted(SHIP_CLASSES.items(), key=lambda x: -len(x[0])):
        content, count = link_entity(content, name, url, page_url)
        total_links += count

    # 3. Venues (longer names first)
    for name, url in sorted(VENUES.items(), key=lambda x: -len(x[0])):
        content, count = link_entity(content, name, url, page_url)
        total_links += count

    # 4. Ports (longer names first)
    for name, url in sorted(PORTS.items(), key=lambda x: -len(x[0])):
        content, count = link_entity(content, name, url, page_url)
        total_links += count

    # 5. Articles (except solo - handled separately)
    for name, url in sorted(ARTICLES.items(), key=lambda x: -len(x[0])):
        if url == "SOLO_SPECIAL":
            continue
        content, count = link_entity(content, name, url, page_url)
        total_links += count

    # 6. Solo special handling
    content, count = handle_solo_special(content, page_url)
    total_links += count

    # Write if changed
    if content != original_content:
        filepath.write_text(content, encoding='utf-8')
        return {"file": filepath.name, "links_added": total_links}

    return {"file": filepath.name, "links_added": 0}

def main():
    project_root = Path(__file__).parent.parent

    # Find all HTML files
    html_files = []
    for pattern in ['*.html', '**/*.html']:
        html_files.extend(project_root.glob(pattern))

    # Deduplicate and sort
    html_files = sorted(set(html_files))

    print(f"Cross-linking {len(html_files)} HTML files...")
    print()

    results = {
        "updated": [],
        "unchanged": [],
        "skipped": [],
        "errors": []
    }

    for filepath in html_files:
        result = process_file(filepath, project_root)

        if "error" in result:
            results["errors"].append(result)
        elif result.get("skipped"):
            results["skipped"].append(result)
        elif result.get("links_added", 0) > 0:
            results["updated"].append(result)
            print(f"  ✓ {result['file']}: {result['links_added']} links")
        else:
            results["unchanged"].append(result)

    print()
    print("Summary:")
    print(f"  Updated: {len(results['updated'])} files")
    print(f"  Unchanged: {len(results['unchanged'])} files")
    print(f"  Skipped: {len(results['skipped'])} files")
    if results["errors"]:
        print(f"  Errors: {len(results['errors'])} files")
        for err in results["errors"]:
            print(f"    - {err['file']}: {err['error']}")

    # Total links added
    total = sum(r.get("links_added", 0) for r in results["updated"])
    print(f"\nTotal links added: {total}")

if __name__ == "__main__":
    main()
