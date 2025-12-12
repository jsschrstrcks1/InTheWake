#!/usr/bin/env python3
"""
Convert port pages from old port-hero-container pattern to new port-hero pattern.

Old pattern:
  <div class="port-hero-container" style="...">
    <img class="port-hero" src="..." />
    <div class="port-name-overlay" style="...">Port Name</div>
  </div>

New pattern:
  <div class="port-hero">
    <div class="port-hero-image">
      <img src="..." />
      <div class="port-hero-overlay">
        <h1 class="port-hero-title">Port Name</h1>
      </div>
    </div>
    <p class="port-hero-credit">Photo: ...</p>
  </div>

Usage:
  python3 convert-port-hero.py ports/nassau.html
  python3 convert-port-hero.py --dry-run ports/nassau.html
  python3 convert-port-hero.py --all [--dry-run]
"""

import re
import sys
from pathlib import Path

def extract_port_name(content):
    """Extract port name from the port-name-overlay div."""
    # Try pattern with span inside overlay first (Ajaccio-style)
    match = re.search(r'<div class="port-name-overlay"[^>]*>\s*<span[^>]*>([^<]+)</span>', content)
    if match:
        return match.group(1).strip()
    # Try direct text in overlay (Nassau-style)
    match = re.search(r'<div class="port-name-overlay"[^>]*>([^<]+)</div>', content)
    if match:
        return match.group(1).strip()
    return None

def extract_image_src(content):
    """Extract image src from hero container."""
    # Try with class="port-hero" first (Nassau-style)
    match = re.search(r'<img class="port-hero"[^>]*src="([^"]+)"', content)
    if match:
        return match.group(1)
    # Try img inside port-hero-container without class (Ajaccio-style)
    match = re.search(r'<div class="port-hero-container"[^>]*>\s*<img[^>]*src="([^"]+)"', content)
    if match:
        return match.group(1)
    return None

def extract_image_alt(content):
    """Extract image alt from hero container."""
    # Try with class="port-hero" first
    match = re.search(r'<img class="port-hero"[^>]*alt="([^"]*)"', content)
    if match:
        return match.group(1)
    # Try img inside port-hero-container without class
    match = re.search(r'<div class="port-hero-container"[^>]*>\s*<img[^>]*alt="([^"]*)"', content)
    if match:
        return match.group(1)
    return None

def convert_file(filepath, dry_run=False):
    """Convert a single file from old to new hero pattern."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if already converted
    if 'port-hero-image' in content:
        print(f"Already converted: {filepath}")
        return False

    # Check if has old pattern
    if 'port-hero-container' not in content:
        print(f"No old pattern found: {filepath}")
        return False

    original = content

    # Extract data from old pattern
    port_name = extract_port_name(content)
    img_src = extract_image_src(content)
    img_alt = extract_image_alt(content)

    if not port_name or not img_src:
        print(f"Could not extract port name or image: {filepath}")
        return False

    # Determine photo credit (try to find from existing content or use default)
    credit_match = re.search(r'WikiMedia Commons|Flickers of Majesty|flickersofmajesty', content, re.IGNORECASE)
    if credit_match and 'flickers' in credit_match.group(0).lower():
        credit = 'Photo © <a href="https://www.flickersofmajesty.com" target="_blank" rel="noopener">Flickers of Majesty</a>'
    else:
        credit = 'Photo: <a href="https://commons.wikimedia.org" target="_blank" rel="noopener">WikiMedia Commons</a> (CC BY-SA)'

    # Build new hero HTML
    new_hero = f'''<div class="port-hero">
        <div class="port-hero-image">
          <img src="{img_src}" alt="{img_alt or port_name + ' port view'}" loading="eager" fetchpriority="high"/>
          <div class="port-hero-overlay">
            <h1 class="port-hero-title">{port_name}</h1>
          </div>
        </div>
        <p class="port-hero-credit">{credit}</p>
      </div>

    <article class="card">'''

    # Replace old patterns - try multiple variations

    # Pattern 1: Nassau-style with class="port-hero" and comment
    old_pattern1 = re.compile(
        r'<article class="card">\s*'
        r'<!--[^>]*-->\s*'
        r'<div class="port-hero-container"[^>]*>\s*'
        r'<img class="port-hero"[^>]*/>\s*'
        r'<div class="port-name-overlay"[^>]*>[^<]+</div>\s*'
        r'</div>\s*',
        re.DOTALL
    )
    content = old_pattern1.sub(new_hero, content)

    # Pattern 2: Nassau-style without comment
    old_pattern2 = re.compile(
        r'<article class="card">\s*'
        r'<div class="port-hero-container"[^>]*>\s*'
        r'<img class="port-hero"[^>]*/>\s*'
        r'<div class="port-name-overlay"[^>]*>[^<]+</div>\s*'
        r'</div>\s*',
        re.DOTALL
    )
    content = old_pattern2.sub(new_hero, content)

    # Pattern 3: Ajaccio-style with <span> inside overlay (no class on img)
    old_pattern3 = re.compile(
        r'<article class="card">\s*'
        r'<div class="port-hero-container"[^>]*>\s*'
        r'<img [^>]*/>\s*'
        r'<div class="port-name-overlay"[^>]*>\s*'
        r'<span[^>]*>[^<]+</span>\s*'
        r'</div>\s*'
        r'</div>\s*',
        re.DOTALL
    )
    content = old_pattern3.sub(new_hero, content)

    # Pattern 4: Variation with img not self-closing
    old_pattern4 = re.compile(
        r'<article class="card">\s*'
        r'<div class="port-hero-container"[^>]*>\s*'
        r'<img [^>]*>\s*'
        r'<div class="port-name-overlay"[^>]*>\s*'
        r'<span[^>]*>[^<]+</span>\s*'
        r'</div>\s*'
        r'</div>\s*',
        re.DOTALL
    )
    content = old_pattern4.sub(new_hero, content)

    if content == original:
        print(f"No changes made (pattern not matched): {filepath}")
        return False

    if dry_run:
        print(f"Would modify: {filepath} (port: {port_name})")
    else:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Modified: {filepath} (port: {port_name})")

    return True

def main():
    dry_run = '--dry-run' in sys.argv
    all_ports = '--all' in sys.argv

    args = [a for a in sys.argv[1:] if not a.startswith('--')]

    if all_ports:
        ports_dir = Path(__file__).parent.parent / 'ports'
        files = sorted(ports_dir.glob('*.html'))
    elif args:
        files = [Path(a) for a in args]
    else:
        print(__doc__)
        sys.exit(1)

    modified = 0
    for f in files:
        if f.exists():
            if convert_file(f, dry_run):
                modified += 1
        else:
            print(f"File not found: {f}")

    print(f"\n{'Would modify' if dry_run else 'Modified'}: {modified} files")

if __name__ == '__main__':
    main()
