#!/usr/bin/env python3
"""
apply-interior-subcategories.py

Reads the CSV classification data and adds interior_sub_categories
to each ship's stateroom-exceptions v2.json file.

Room by room. Ship by ship. No patterns. No assumptions.
Every cabin was individually verified against iCruise.

Usage: python3 apply-interior-subcategories.py
"""

import json
import csv
import os
import sys
from pathlib import Path

STATEROOMS_DIR = Path("/home/user/InTheWake/assets/data/staterooms")
CLASSIFICATIONS_DIR = Path("/home/user/InTheWake/admin/cabin-classifications")

# Codes that are Virtual Balcony (per project definition)
VIRTUAL_BALCONY_CODES = {"1U", "2U", "3U", "4U", "5U"}

# Codes that are Promenade View (per project definition)
# 1T confirmed as "Promenade View Interior Stateroom" on Voyager via iCruise
PROMENADE_VIEW_CODES = {"1T", "2T", "CP"}

# Codes that are Central Park View Interior (Oasis-class only)
# 1S confirmed as "Central Park View Interior Stateroom" on Oasis via iCruise
CENTRAL_PARK_VIEW_CODES = {"1S"}

# Codes that are Studio Interior
STUDIO_CODES = {"2W"}

# Codes that are Connected Interior
CONNECTED_INTERIOR_CODES = {"CI"}

# Codes that are standard Interior (not special sub-types)
# 6V confirmed Interior via iCruise (Interior Stateroom)
STANDARD_INTERIOR_CODES = {
    "1I", "1R", "1V", "2I", "2S", "2V", "3V", "4V", "6V",
}

# All valid Interior codes (union of all above)
ALL_VALID_INTERIOR_CODES = (
    VIRTUAL_BALCONY_CODES | PROMENADE_VIEW_CODES | CENTRAL_PARK_VIEW_CODES |
    STUDIO_CODES | CONNECTED_INTERIOR_CODES | STANDARD_INTERIOR_CODES
)

# Known non-Interior codes (genuine misclassifications)
NON_INTERIOR_CODES = {
    "1A", "1B", "2B", "3B", "4B", "5B",  # Balcony
    "1C", "2C", "3C", "4C", "5C",  # Balcony
    "1D", "2D", "3D", "4D", "5D", "7D", "8D",  # Balcony / Ocean View w/ Balcony
    "1E", "2E", "2F", "CB",  # Balcony
    "4I",  # Boardwalk View Balcony (confirmed on Oasis via iCruise)
    "1J",  # Boardwalk and Park Balcony (confirmed on Harmony via CruiseDeckPlans)
    "2J",  # Central Park View Balcony (confirmed on Harmony via iCruise)
    "1K", "1L", "1N", "2N", "3M", "3N", "4M", "4N", "5N",  # Ocean View
    "6N",  # Ocean View (confirmed on Oasis via iCruise)
    "8N",  # Ocean View (confirmed on Voyager via iCruise)
    "RS", "OS", "GT", "GS", "GP", "GB", "GL", "SL",  # Suite
    "J1", "J3", "J4", "JY", "JT",  # Suite
    "OL", "RL", "TL", "VP", "VS", "US",  # Suite
    "A1", "A2", "A3", "A4", "OP", "L1",  # Suite
}


def load_classification(ship_slug):
    """Load the CSV classification for a ship."""
    csv_path = CLASSIFICATIONS_DIR / f"{ship_slug}-interior-codes.csv"
    if not csv_path.exists():
        print(f"  WARNING: No classification data for {ship_slug}")
        return None

    results = {
        "virtual_balcony": [],
        "promenade_view": [],
        "central_park_view": [],
        "studio": [],
        "connected_interior": [],
        "standard_interior": [],
        "misclassified": [],
        "fetch_errors": [],
        "unknown_codes": [],
        "all_codes": {},
    }

    with open(csv_path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            cabin = row["cabin_number"]
            code = row["category_code"]

            # Track all codes found
            results["all_codes"].setdefault(code, []).append(cabin)

            if code in VIRTUAL_BALCONY_CODES:
                results["virtual_balcony"].append(cabin)
            elif code in PROMENADE_VIEW_CODES:
                results["promenade_view"].append(cabin)
            elif code in CENTRAL_PARK_VIEW_CODES:
                results["central_park_view"].append(cabin)
            elif code in STUDIO_CODES:
                results["studio"].append(cabin)
            elif code in CONNECTED_INTERIOR_CODES:
                results["connected_interior"].append(cabin)
            elif code in STANDARD_INTERIOR_CODES:
                results["standard_interior"].append(cabin)
            elif code in NON_INTERIOR_CODES:
                results["misclassified"].append((cabin, code))
            elif code in ("FETCH_ERROR", "PARSE_ERROR"):
                results["fetch_errors"].append(cabin)
            else:
                # Unknown code — needs manual investigation
                results["unknown_codes"].append((cabin, code))

    return results


def apply_to_ship(ship_slug, json_filename):
    """Apply interior_sub_categories to a ship's JSON file."""
    json_path = STATEROOMS_DIR / json_filename
    if not json_path.exists():
        print(f"  ERROR: {json_path} not found")
        return False

    print(f"\nProcessing {ship_slug}...")

    # Load classification data
    classification = load_classification(ship_slug)
    if not classification:
        return False

    # Load JSON
    with open(json_path) as f:
        data = json.load(f)

    # Get the Interior array for cross-checking
    interior_cabins = set()
    if "category_overrides" in data:
        interior_cabins = set(str(c) for c in data["category_overrides"].get("Interior", []))

    # Sort cabin lists
    vb_cabins = sorted(classification["virtual_balcony"], key=lambda x: int(x))
    pv_cabins = sorted(classification["promenade_view"], key=lambda x: int(x))
    cpv_cabins = sorted(classification["central_park_view"], key=lambda x: int(x))
    studio_cabins = sorted(classification["studio"], key=lambda x: int(x))
    ci_cabins = sorted(classification["connected_interior"], key=lambda x: int(x))
    std_cabins = sorted(classification["standard_interior"], key=lambda x: int(x))

    # Cross-check: every classified cabin must be in the Interior array
    all_subtyped = vb_cabins + pv_cabins + cpv_cabins + studio_cabins + ci_cabins + std_cabins
    not_in_interior = [c for c in all_subtyped if c not in interior_cabins]
    if not_in_interior:
        print(f"  WARNING: {len(not_in_interior)} classified cabins not in Interior array")

    # Build interior_sub_categories
    sub_categories = {}

    if pv_cabins:
        pv_codes_found = sorted(set(
            code for code in PROMENADE_VIEW_CODES
            if code in classification["all_codes"]
        ))
        sub_categories["Promenade View"] = {
            "icruise_codes": pv_codes_found,
            "description": "Interior with bay windows overlooking the Royal Promenade",
            "cabins": pv_cabins,
        }
        print(f"  Promenade View: {len(pv_cabins)} cabins (codes: {pv_codes_found})")

    if vb_cabins:
        vb_codes_found = sorted(set(
            code for code in VIRTUAL_BALCONY_CODES
            if code in classification["all_codes"]
        ))
        sub_categories["Virtual Balcony"] = {
            "icruise_codes": vb_codes_found,
            "description": "Interior with floor-to-ceiling HD screen showing real-time ocean views",
            "cabins": vb_cabins,
        }
        print(f"  Virtual Balcony: {len(vb_cabins)} cabins (codes: {vb_codes_found})")

    if cpv_cabins:
        cpv_codes_found = sorted(set(
            code for code in CENTRAL_PARK_VIEW_CODES
            if code in classification["all_codes"]
        ))
        sub_categories["Central Park View"] = {
            "icruise_codes": cpv_codes_found,
            "description": "Interior with window overlooking the Central Park neighborhood",
            "cabins": cpv_cabins,
        }
        print(f"  Central Park View: {len(cpv_cabins)} cabins (codes: {cpv_codes_found})")

    if studio_cabins:
        sub_categories["Studio"] = {
            "icruise_codes": ["2W"],
            "description": "Studio Interior with virtual view screen",
            "cabins": studio_cabins,
        }
        print(f"  Studio: {len(studio_cabins)} cabins (code: 2W)")

    if ci_cabins:
        sub_categories["Connected Interior"] = {
            "icruise_codes": ["CI"],
            "description": "Interior stateroom with connecting door to adjacent cabin",
            "cabins": ci_cabins,
        }
        print(f"  Connected Interior: {len(ci_cabins)} cabins (code: CI)")

    if not sub_categories:
        print(f"  No distinctive Interior sub-types found — skipping")
        return False

    # Report misclassifications
    if classification["misclassified"]:
        print(f"  MISCLASSIFIED: {len(classification['misclassified'])} cabins need removal from Interior array:")
        for cabin, code in classification["misclassified"][:20]:
            print(f"    Cabin {cabin}: code {code}")
        if len(classification["misclassified"]) > 20:
            print(f"    ... and {len(classification['misclassified']) - 20} more")

    if classification["unknown_codes"]:
        print(f"  UNKNOWN CODES: {len(classification['unknown_codes'])} cabins with unrecognized codes:")
        for cabin, code in classification["unknown_codes"][:10]:
            print(f"    Cabin {cabin}: code {code}")

    if classification["fetch_errors"]:
        print(f"  FETCH ERRORS: {len(classification['fetch_errors'])} cabins could not be verified:")
        for cabin in classification["fetch_errors"][:10]:
            print(f"    Cabin {cabin}")

    # Determine confidence
    total = len(all_subtyped)
    errors = len(classification["fetch_errors"])
    misclassed = len(classification["misclassified"])
    unknowns = len(classification["unknown_codes"])
    if errors == 0 and misclassed == 0 and unknowns == 0:
        confidence = "verified"
    elif errors <= 3 and misclassed <= 3 and unknowns == 0:
        confidence = "high"
    else:
        confidence = "partial"

    # Add to JSON
    data["interior_sub_categories"] = sub_categories
    data["_sub_category_confidence"] = confidence
    data["_sub_category_method"] = "Room-by-room iCruise lookup via icruise.com/cabins/royal-caribbean-cruises-{ship}-cabin-{number}.html"

    # Write back
    with open(json_path, "w") as f:
        json.dump(data, f, indent=2)
        f.write("\n")

    print(f"  Confidence: {confidence}")
    print(f"  Written to {json_path}")

    # Report code distribution
    print(f"  Code distribution:")
    for code, cabins in sorted(classification["all_codes"].items(), key=lambda x: -len(x[1])):
        label = ""
        if code in VIRTUAL_BALCONY_CODES:
            label = " [Virtual Balcony]"
        elif code in PROMENADE_VIEW_CODES:
            label = " [Promenade View]"
        elif code in CENTRAL_PARK_VIEW_CODES:
            label = " [Central Park View]"
        elif code in STUDIO_CODES:
            label = " [Studio]"
        elif code in CONNECTED_INTERIOR_CODES:
            label = " [Connected Interior]"
        elif code in STANDARD_INTERIOR_CODES:
            label = " [Standard Interior]"
        elif code in NON_INTERIOR_CODES:
            label = " [MISCLASSIFIED]"
        elif code in ("FETCH_ERROR", "PARSE_ERROR"):
            label = " [ERROR]"
        else:
            label = " [UNKNOWN]"
        print(f"    {code}: {len(cabins)} cabins{label}")

    return True


# Ship mapping: slug -> JSON filename
SHIPS = {
    "quantum-of-the-seas": "stateroom-exceptions.quantum-of-the-seas.v2.json",
    "anthem-of-the-seas": "stateroom-exceptions.anthem-of-the-seas.v2.json",
    "ovation-of-the-seas": "stateroom-exceptions.ovation-of-the-seas.v2.json",
    "spectrum-of-the-seas": "stateroom-exceptions.spectrum-of-the-seas.v2.json",
    "odyssey-of-the-seas": "stateroom-exceptions.odyssey-of-the-seas.v2.json",
    "voyager-of-the-seas": "stateroom-exceptions.voyager-of-the-seas.v2.json",
    "oasis-of-the-seas": "stateroom-exceptions.oasis-of-the-seas.v2.json",
    "allure-of-the-seas": "stateroom-exceptions.allure-of-the-seas.v2.json",
    "harmony-of-the-seas": "stateroom-exceptions.harmony-of-the-seas.v2.json",
    "symphony-of-the-seas": "stateroom-exceptions.symphony-of-the-seas.v2.json",
    "wonder-of-the-seas": "stateroom-exceptions.wonder-of-the-seas.v2.json",
    "utopia-of-the-seas": "stateroom-exceptions.utopia-of-the-seas.v2.json",
}


if __name__ == "__main__":
    print("=" * 60)
    print("Interior Sub-Category Application")
    print("Room by room. Ship by ship. No patterns. No assumptions.")
    print("=" * 60)

    success = 0
    skipped = 0

    for slug, filename in SHIPS.items():
        if apply_to_ship(slug, filename):
            success += 1
        else:
            skipped += 1

    print(f"\n{'=' * 60}")
    print(f"COMPLETE: {success} ships updated, {skipped} skipped")
    print(f"{'=' * 60}")
