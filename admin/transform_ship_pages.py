#!/usr/bin/env python3
"""
Transform remaining 34 ship pages to proper ICP-Lite structure.
Converts page-intro sections to icp-header with answer-line, fit-guidance, key-facts.
"""

import re
import json
from pathlib import Path

SHIPS_DIR = Path('/home/user/InTheWake/ships/rcl')

# Ships to transform (excluding radiance-of-the-seas.html)
SHIPS_TO_FIX = [
    'allure-of-the-seas.html', 'anthem-of-the-seas.html', 'brilliance-of-the-seas.html',
    'explorer-of-the-seas.html', 'freedom-of-the-seas.html', 'harmony-of-the-seas.html',
    'icon-of-the-seas.html', 'independence-of-the-seas.html', 'jewel-of-the-seas.html',
    'legend-of-the-seas-1995-built.html', 'legend-of-the-seas.html', 'liberty-of-the-seas.html',
    'mariner-of-the-seas.html', 'monarch-of-the-seas.html', 'navigator-of-the-seas.html',
    'nordic-empress.html', 'nordic-prince.html', 'oasis-class-ship-tbn-2028.html',
    'oasis-of-the-seas.html', 'odyssey-of-the-seas.html', 'ovation-of-the-seas.html',
    'quantum-of-the-seas.html', 'serenade-of-the-seas.html', 'song-of-america.html',
    'song-of-norway.html', 'sovereign-of-the-seas.html', 'spectrum-of-the-seas.html',
    'splendour-of-the-seas.html', 'sun-viking.html', 'symphony-of-the-seas.html',
    'utopia-of-the-seas.html', 'viking-serenade.html', 'voyager-of-the-seas.html',
    'wonder-of-the-seas.html'
]

def extract_ship_stats(content):
    """Extract ship stats from JSON fallback."""
    stats_match = re.search(r'<script type="application/json" id="ship-stats-fallback">\s*({[^}]+})', content, re.DOTALL)
    if stats_match:
        try:
            stats = json.loads(stats_match.group(1))
            return stats
        except:
            pass
    return None

def extract_ship_name(content):
    """Extract clean ship name from H1."""
    h1_match = re.search(r'<h1[^>]*>([^<—]+)', content)
    if h1_match:
        return h1_match.group(1).strip()
    return "Unknown Ship"

def create_key_facts(stats, ship_name):
    """Create key-facts section from stats."""
    if not stats:
        return ""

    facts = []
    if stats.get('class'):
        facts.append(f"<li><strong>Class:</strong> {stats['class']}</li>")
    if stats.get('entered_service'):
        facts.append(f"<li><strong>Year Built:</strong> {stats['entered_service']}</li>")
    if stats.get('gt'):
        facts.append(f"<li><strong>Size:</strong> {stats['gt']}</li>")
    if stats.get('guests'):
        facts.append(f"<li><strong>Capacity:</strong> {stats['guests']}</li>")

    if not facts:
        return ""

    return f"""
    <section class="key-facts card">
        <h2>Key Facts at a Glance</h2>
        <ul>
          {''.join(facts)}
        </ul>
    </section>"""

def transform_page_intro(content, ship_name, stats):
    """Transform page-intro section to proper ICP-Lite structure."""

    # Extract the page-intro section content
    intro_pattern = r'<section class="page-intro"[^>]*>(.*?)</section>\s*\n\s*<!-- Row 1'
    intro_match = re.search(intro_pattern, content, re.DOTALL)

    if not intro_match:
        print(f"  ⚠️  No page-intro section found")
        return content

    intro_content = intro_match.group(1)

    # Extract the descriptive paragraphs
    para_pattern = r'<p style="[^"]*">\s*<strong[^>]*>[^<]*</strong>\s*<span>([^<]+)</span>\s*</p>\s*<p style="[^"]*">([^<]+)</p>'
    para_match = re.search(para_pattern, intro_content, re.DOTALL)

    if not para_match:
        print(f"  ⚠️  Could not extract paragraphs")
        return content

    answer_text = para_match.group(1).strip()
    fit_text = para_match.group(2).strip()

    # Build new ICP-Lite structure
    new_structure = f'''
    <!-- ICP-Lite v1.0: Answer-First Content -->
    <section class="icp-header" aria-labelledby="ship-name">
      <h1 id="ship-name">{ship_name}</h1>
      <p class="answer-line">
      <span class="answer-q">What this page covers</span>
      <span class="answer-a">{answer_text}</span>
    </p>

      <section class="fit-guidance">
      <h2 class="sr-only">Who This Page Is For</h2>
      <h2>Is {ship_name} Right for You?</h2>
        <p>{fit_text}</p>
      </section>
{create_key_facts(stats, ship_name)}
  </section>

  <!-- Row 1'''

    # Replace the old section
    content = re.sub(intro_pattern, new_structure, content, flags=re.DOTALL)

    return content

def transform_ship_page(filepath):
    """Transform a single ship page."""
    print(f"Transforming {filepath.name}...")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Extract ship info
    ship_name = extract_ship_name(content)
    stats = extract_ship_stats(content)

    # Transform page-intro to icp-header
    content = transform_page_intro(content, ship_name, stats)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✓ Transformed {ship_name}")
        return True
    else:
        print(f"  - No changes for {ship_name}")
        return False

def main():
    """Main execution."""
    print("Transforming ship pages to proper ICP-Lite structure...\n")
    print(f"Processing {len(SHIPS_TO_FIX)} ships (excluding radiance-of-the-seas.html)\n")

    transformed_count = 0

    for filename in SHIPS_TO_FIX:
        filepath = SHIPS_DIR / filename
        if filepath.exists():
            if transform_ship_page(filepath):
                transformed_count += 1
        else:
            print(f"⚠️  {filename} not found")

    print(f"\n✓ Transformed {transformed_count} ship pages")

if __name__ == '__main__':
    main()
