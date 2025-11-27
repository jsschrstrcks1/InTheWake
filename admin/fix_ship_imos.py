#!/usr/bin/env python3
"""
Fix incorrect IMO numbers in ship pages.
Soli Deo Gloria
"""

import os
import re
from pathlib import Path

# Correct IMO numbers for Royal Caribbean ships
CORRECT_IMOS = {
    # Icon Class
    'icon-of-the-seas': '9829930',
    'star-of-the-seas': '9829942',

    # Oasis Class
    'oasis-of-the-seas': '9383936',
    'allure-of-the-seas': '9383948',
    'harmony-of-the-seas': '9682875',
    'symphony-of-the-seas': '9744001',
    'wonder-of-the-seas': '9838188',
    'utopia-of-the-seas': '9711146',

    # Quantum Ultra Class
    'spectrum-of-the-seas': '9794512',
    'odyssey-of-the-seas': '9863917',

    # Quantum Class
    'quantum-of-the-seas': '9656100',
    'anthem-of-the-seas': '9656101',
    'ovation-of-the-seas': '9697753',

    # Freedom Class
    'freedom-of-the-seas': '9304033',
    'liberty-of-the-seas': '9330032',
    'independence-of-the-seas': '9349681',

    # Voyager Class
    'voyager-of-the-seas': '9161716',
    'explorer-of-the-seas': '9161728',
    'adventure-of-the-seas': '9167227',
    'navigator-of-the-seas': '9227508',
    'mariner-of-the-seas': '9227510',

    # Radiance Class
    'radiance-of-the-seas': '9195195',
    'brilliance-of-the-seas': '9195200',
    'serenade-of-the-seas': '9228344',
    'jewel-of-the-seas': '9228356',

    # Vision Class
    'grandeur-of-the-seas': '9102978',
    'enchantment-of-the-seas': '9111802',
    'vision-of-the-seas': '9116876',
    'rhapsody-of-the-seas': '9116864',

    # Sovereign Class (retired)
    'sovereign-of-the-seas': '8707509',
    'monarch-of-the-seas': '8717862',
    'majesty-of-the-seas': '8819512',

    # Historic ships
    'splendour-of-the-seas': '9070632',
    'legend-of-the-seas': '8912682',
    'nordic-empress': '8517636',
    'song-of-norway': '6824318',
}

def fix_imo_in_file(filepath: Path) -> tuple[bool, str, str]:
    """Fix IMO number in a ship page file. Returns (changed, old_imo, new_imo)."""
    # Get ship slug from filename
    slug = filepath.stem

    if slug not in CORRECT_IMOS:
        return False, '', ''

    correct_imo = CORRECT_IMOS[slug]

    content = filepath.read_text(encoding='utf-8')

    # Find current IMO
    match = re.search(r'data-imo="(\d+)"', content)
    if not match:
        return False, '', ''

    current_imo = match.group(1)

    if current_imo == correct_imo:
        return False, current_imo, correct_imo

    # Replace the IMO
    new_content = re.sub(
        r'data-imo="' + current_imo + '"',
        f'data-imo="{correct_imo}"',
        content
    )

    filepath.write_text(new_content, encoding='utf-8')
    return True, current_imo, correct_imo

def main():
    ships_dir = Path('/home/user/InTheWake/ships/rcl')

    fixed = []
    correct = []
    missing = []

    for html_file in sorted(ships_dir.glob('*.html')):
        slug = html_file.stem

        # Check if file has data-imo
        content = html_file.read_text(encoding='utf-8')
        if 'data-imo=' not in content:
            continue

        changed, old_imo, new_imo = fix_imo_in_file(html_file)

        if changed:
            fixed.append((slug, old_imo, new_imo))
            print(f"FIXED: {slug}")
            print(f"  Old IMO: {old_imo}")
            print(f"  New IMO: {new_imo}")
        elif old_imo:
            if slug in CORRECT_IMOS:
                correct.append(slug)
            else:
                missing.append((slug, old_imo))

    print(f"\n=== Summary ===")
    print(f"Fixed: {len(fixed)} ships")
    print(f"Already correct: {len(correct)} ships")

    if fixed:
        print(f"\nFixed ships:")
        for slug, old, new in fixed:
            print(f"  {slug}: {old} -> {new}")

    if missing:
        print(f"\nShips with IMOs not in our database:")
        for slug, imo in missing:
            print(f"  {slug}: {imo}")

if __name__ == '__main__':
    main()
