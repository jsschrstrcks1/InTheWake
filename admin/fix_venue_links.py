#!/usr/bin/env python3
"""
Fix venue linking on RCL ship pages.

Adds 2 lines to renderVenues function to create clickable links to /restaurants/ pages.
"""

import os
import re

# Ships that need fixing (43 total, Icon already fixed manually)
SHIPS_TO_FIX = [
    "adventure-of-the-seas",
    "allure-of-the-seas",
    "anthem-of-the-seas",
    "brilliance-of-the-seas",
    "enchantment-of-the-seas",
    "explorer-of-the-seas",
    "freedom-of-the-seas",
    "grandeur-of-the-seas",
    "harmony-of-the-seas",
    # "icon-of-the-seas",  # Already fixed manually
    "icon-class-ship-tbn-2027",
    "icon-class-ship-tbn-2028",
    "independence-of-the-seas",
    "jewel-of-the-seas",
    "legend-of-the-seas",
    "legend-of-the-seas-1995-built",
    "legend-of-the-seas-icon-class-entering-service-in-2026",
    "liberty-of-the-seas",
    "majesty-of-the-seas",
    "mariner-of-the-seas",
    "monarch-of-the-seas",
    "navigator-of-the-seas",
    "nordic-empress",
    "oasis-of-the-seas",
    "odyssey-of-the-seas",
    "ovation-of-the-seas",
    "quantum-of-the-seas",
    "quantum-ultra-class-ship-tbn-2028",
    "quantum-ultra-class-ship-tbn-2029",
    "rhapsody-of-the-seas",
    "serenade-of-the-seas",
    "song-of-norway",
    "sovereign-of-the-seas",
    "spectrum-of-the-seas",
    "splendour-of-the-seas",
    "star-class-ship-tbn-2028",
    "star-of-the-seas",
    "star-of-the-seas-aug-2025-debut",
    "symphony-of-the-seas",
    "utopia-of-the-seas",
    "vision-of-the-seas",
    "voyager-of-the-seas",
    "wonder-of-the-seas",
]

# Pattern to find the broken venue rendering code
OLD_PATTERN = re.compile(
    r"(        arr\.forEach\(v=>\{\n"
    r"          const name=String\(v\.name\|\|v\.slug\)\.replace\(/</g,'&lt;'\);\n"
    r"          const desc=String\(v\.description\|\|''\)\.replace\(/</g,'&lt;'\);\n"
    r"          const price=\(v\.price\|\|v\.cost\)\?'<span class=\"venue-price\">'\.concat\(v\.price\|\|v\.cost,'</span>'\):'';)\n"
    r"(          html\+='<li><strong>'\+name\+'</strong>'\+price\+\(desc\?' — '\+desc:''\)\+'</li>';)",
    re.MULTILINE
)

# Alternative pattern (might have slight variations)
OLD_PATTERN_ALT = re.compile(
    r"(          const name=String\(v\.name\|\|v\.slug\)\.replace\(/</g,'&lt;'\);\n"
    r"          const desc=String\(v\.description\|\|''\)\.replace\(/</g,'&lt;'\);\n"
    r"          const price=\(v\.price\|\|v\.cost\)\?'<span class=\"venue-price\">'.*?'</span>':'';)\n"
    r"(          html\+='<li><strong>'\+name\+'</strong>'\+price.*?;</li>';)",
    re.MULTILINE | re.DOTALL
)

# Replacement with link creation
NEW_CODE = (
    r"\1\n"
    r"          const slug=v.slug?String(v.slug).replace(/</g,'&lt;'):'';\n"
    r"          const nameLink=slug?'<a href=\"'+abs('/restaurants/'+slug)+'.html\">'+name+'</a>':name;\n"
    r"          html+='<li><strong>'+nameLink+'</strong>'+price+(desc?' — '+desc:'')+'</li>';"
)

def fix_ship_file(ship_slug):
    """Fix venue linking in a single ship HTML file."""
    filepath = f"ships/rcl/{ship_slug}.html"

    if not os.path.exists(filepath):
        print(f"❌ SKIP: {ship_slug} (file not found)")
        return False

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if already has the fix
    if "const nameLink=slug?" in content:
        print(f"✅ SKIP: {ship_slug} (already fixed)")
        return True

    # Try to apply fix
    new_content, count = OLD_PATTERN.subn(NEW_CODE, content)

    if count == 0:
        # Try alternative pattern with more flexible matching
        # Manual pattern for this specific case
        old_block = (
            "          const name=String(v.name||v.slug).replace(/</g,'&lt;');\n"
            "          const desc=String(v.description||'').replace(/</g,'&lt;');\n"
            "          const price=(v.price||v.cost)?'<span class=\"venue-price\">'+(v.price||v.cost)+'</span>':'';\n"
            "          html+='<li><strong>'+name+'</strong>'+price+(desc?' — '+desc:'')+'</li>';"
        )

        new_block = (
            "          const name=String(v.name||v.slug).replace(/</g,'&lt;');\n"
            "          const desc=String(v.description||'').replace(/</g,'&lt;');\n"
            "          const price=(v.price||v.cost)?'<span class=\"venue-price\">'+(v.price||v.cost)+'</span>':'';\n"
            "          const slug=v.slug?String(v.slug).replace(/</g,'&lt;'):'';\n"
            "          const nameLink=slug?'<a href=\"'+abs('/restaurants/'+slug)+'.html\">'+name+'</a>':name;\n"
            "          html+='<li><strong>'+nameLink+'</strong>'+price+(desc?' — '+desc:'')+'</li>';"
        )

        if old_block in content:
            new_content = content.replace(old_block, new_block)
            count = 1
        else:
            print(f"⚠️  FAIL: {ship_slug} (pattern not found)")
            return False

    if count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✅ FIXED: {ship_slug}")
        return True

    return False

def main():
    """Fix all ships."""
    print("🔧 Fixing venue links on RCL ship pages...\n")

    fixed = 0
    skipped = 0
    failed = 0

    for ship_slug in SHIPS_TO_FIX:
        result = fix_ship_file(ship_slug)
        if result:
            fixed += 1
        elif result is None:
            skipped += 1
        else:
            failed += 1

    print(f"\n📊 SUMMARY:")
    print(f"   ✅ Fixed: {fixed}")
    print(f"   ⏭️  Skipped: {skipped}")
    print(f"   ❌ Failed: {failed}")
    print(f"   📝 Total: {len(SHIPS_TO_FIX)}")

if __name__ == "__main__":
    main()
