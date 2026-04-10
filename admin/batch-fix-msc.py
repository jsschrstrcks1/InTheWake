#!/usr/bin/env python3
"""
Batch fix for MSC-era ship pages. v2 — expanded coverage.

Applies template-level fixes that don't require per-ship content research:
1.  <html lang="en"> → <html lang="en" class="no-js"> + no-js removal script
2.  ai-breadcrumbs HTML comment → removed
3.  content-protocol ICP-Lite v1.4 → ICP-2
4.  Skip link #content → #main-content
5.  <main class="wrap" id="content"> → <main class="wrap page-grid" id="main-content" ... tabindex="-1">
6.  Swiper @10 CSS stylesheet link → removed (JS loader already handles fallback)
7.  Cordelia Empress Food Court image → removed
8.  Static copyright 2025 → JS dynamic year
9.  Dining heading → add Browse All link
10. Add whimsical-ship-units.js script
11. H1 bare ship name → with subtitle
12. Empty stats heading → "Key Facts About [Ship Name]"
13. Video carousel noscript
14. Recent Articles noscript
15. Whimsical Units noscript
16. Dining noscript from venues-v2.json
17. IMO "TBD" → leave alone (needs per-ship research)

Does NOT touch:
- FAQ boilerplate (per-ship content)
- Duplicate stats sections (structural risk)
- Placeholder 'coming soon' (per-ship content)
- Fleet listing entries (manual)
- Fact-block crew count (needs per-ship data)
- page.json creation (needs per-ship stats)

Idempotent — safe to run multiple times.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path('/home/user/inthewake')
MSC_DIR = ROOT / 'ships' / 'msc'
VENUES_FILE = ROOT / 'assets' / 'data' / 'venues-v2.json'

with open(VENUES_FILE) as f:
    venues_data = json.load(f)
venues_idx = {v['slug']: v for v in venues_data.get('venues', [])}
ships_data = venues_data.get('ships', {})


def ship_name_from_slug(slug):
    """Convert 'msc-divina' to 'MSC Divina'."""
    parts = slug.split('-')
    return ' '.join(p.upper() if p == 'msc' else p.title() for p in parts)


def build_dining_noscript(slug, indent='          '):
    """Build a dining noscript from the ship's venues."""
    ship = ships_data.get(slug, {})
    venue_slugs = ship.get('venues', [])
    if not venue_slugs:
        return ''

    by_cat = {}
    for vs in venue_slugs:
        v = venues_idx.get(vs, {})
        cat = v.get('category', 'other')
        subcat = v.get('subcategory', '')
        if cat == 'dining' and subcat == 'specialty':
            cat = 'specialty'
        elif cat == 'dining' and subcat == 'complimentary':
            cat = 'mdr'
        elif cat == 'dining':
            cat = 'casual'
        if cat not in by_cat:
            by_cat[cat] = []
        by_cat[cat].append(v.get('name', vs))

    labels = {
        'mdr': 'Complimentary Dining',
        'specialty': 'Specialty Dining',
        'casual': 'Casual Dining',
        'bar': 'Bars & Lounges',
        'bars': 'Bars & Lounges',
        'entertainment': 'Entertainment',
        'activities': 'Activities',
        'neighborhoods': 'Other',
        'other': 'Other'
    }
    order = ['mdr', 'specialty', 'casual', 'bars', 'bar', 'entertainment', 'activities', 'neighborhoods', 'other']

    html = f'{indent}<noscript>\n'
    for cat in order:
        if cat in by_cat:
            html += f'{indent}  <h3>{labels[cat]}</h3>\n{indent}  <ul>\n'
            for name in by_cat[cat]:
                html += f'{indent}    <li><strong>{name}</strong></li>\n'
            html += f'{indent}  </ul>\n'
    html += f'{indent}</noscript>'
    return html


def fix_page(path):
    """Apply all fixes to a single ship page. Returns list of fix names applied."""
    slug = path.stem
    ship_name = ship_name_from_slug(slug)
    fixes = []

    with open(path) as f:
        content = f.read()

    original = content

    # 1. no-js class + removal script
    if '<html lang="en">' in content and 'class="no-js"' not in content:
        content = content.replace(
            '<html lang="en">\n<head>',
            '<html lang="en" class="no-js">\n<head>\n<script>document.documentElement.classList.remove(\'no-js\');</script>'
        )
        fixes.append('no-js')

    # 2. ai-breadcrumbs removal
    ai_breadcrumbs_pattern = r'<!-- ai-breadcrumbs\s*\n(?:.*\n)*?\s*-->\s*\n'
    if re.search(ai_breadcrumbs_pattern, content):
        content = re.sub(ai_breadcrumbs_pattern, '', content)
        fixes.append('ai-breadcrumbs-removed')

    # 3. content-protocol ICP-Lite → ICP-2
    if 'ICP-Lite v1.4' in content:
        content = content.replace('ICP-Lite v1.4', 'ICP-2')
        fixes.append('icp-2-upgrade')
    if '<!-- ICP-Lite' in content or 'ICP-Lite v1.0' in content:
        content = content.replace('ICP-Lite v1.0', 'ICP-2').replace('ICP-Lite', 'ICP-2')
        fixes.append('icp-lite-comments')

    # 4. Skip link #content → #main-content
    if '<a href="#content" class="skip-link">' in content:
        content = content.replace(
            '<a href="#content" class="skip-link">',
            '<a href="#main-content" class="skip-link">'
        )
        fixes.append('skip-link')

    # 5. Main element (two common variants)
    if '<main class="wrap" id="content" role="main">' in content:
        content = content.replace(
            '<main class="wrap" id="content" role="main">',
            '<main class="wrap page-grid" id="main-content" role="main" tabindex="-1">'
        )
        fixes.append('main-page-grid')
    # Variant B: class before role, id with data-ship
    main_variant_b = re.compile(r'<main role="main" class="wrap page-grid" id="content"([^>]*)>')
    if main_variant_b.search(content):
        content = main_variant_b.sub(
            r'<main role="main" class="wrap page-grid" id="main-content" tabindex="-1"\1>',
            content
        )
        fixes.append('main-id-content-b')

    # 6. Swiper @10 CSS removal
    swiper10_pattern = r'\s*<link rel="stylesheet" href="https://unpkg\.com/swiper@10/[^"]+"/>\s*\n'
    if re.search(swiper10_pattern, content):
        content = re.sub(swiper10_pattern, '\n', content)
        fixes.append('swiper-10-removed')

    # 7. Cordelia Empress Food Court image removal (various patterns)
    # Pattern A: in dining heading
    cordelia_in_h2_pattern = r'<h2 id="diningHeading"><img id="dining-hero" class="card-hero"\s*src="/assets/img/Cordelia_Empress_Food_Court\.webp"\s*alt="[^"]*" loading="lazy"/>\s*Dining on'
    if re.search(cordelia_in_h2_pattern, content):
        content = re.sub(
            cordelia_in_h2_pattern,
            '<h2 id="diningHeading">Dining on',
            content
        )
        fixes.append('cordelia-in-h2')
    # Pattern B: standalone img tag
    cordelia_standalone_pattern = r'<img id="dining-hero" class="card-hero"[^>]*Cordelia_Empress_Food_Court[^>]*/>'
    if re.search(cordelia_standalone_pattern, content):
        content = re.sub(cordelia_standalone_pattern, '', content)
        fixes.append('cordelia-standalone')

    # 8. Dynamic copyright year
    if '&copy; 2025 In the Wake' in content:
        content = content.replace(
            '&copy; 2025 In the Wake',
            '&copy; <script>document.write(new Date().getFullYear())</script> In the Wake'
        )
        fixes.append('dynamic-copyright')

    # 9. Dining heading Browse All link
    dining_heading_pattern = rf'<h2 id="diningHeading">Dining on {re.escape(ship_name)}</h2>'
    dining_heading_replacement = f'<h2 id="diningHeading">Dining on {ship_name} <a href="/restaurants.html" style="font-size: 1rem; font-weight: 400; text-decoration: none; color: var(--accent); opacity: 0.8;" aria-label="Browse all restaurants">→ Browse All</a></h2>'
    if re.search(dining_heading_pattern, content) and '→ Browse All' not in content:
        content = re.sub(dining_heading_pattern, dining_heading_replacement, content)
        fixes.append('browse-all-link')

    # 10. whimsical-ship-units.js script
    if 'whimsical-ship-units.js' not in content:
        content = content.replace(
            '</body>',
            '<script src="/assets/js/whimsical-ship-units.js" defer></script>\n</body>'
        )
        fixes.append('whimsical-script')

    # 11. H1 bare ship name enhancement
    h1_pattern = rf'<h1>{re.escape(ship_name)}</h1>'
    h1_replacement = f'<h1>{ship_name} — Deck Plans, Live Tracker, Dining &amp; Videos</h1>'
    if re.search(h1_pattern, content):
        content = re.sub(h1_pattern, h1_replacement, content)
        fixes.append('h1-subtitle')

    # 12. Empty stats heading
    empty_stats_heading = '<h2 id="ship-stats-title">Ship Statistics</h2>'
    if empty_stats_heading in content:
        content = content.replace(
            empty_stats_heading,
            f'<h2 id="ship-stats-title">Key Facts About {ship_name}</h2>'
        )
        fixes.append('stats-heading')

    # 13. Video noscript
    video_empty = '<div class="swiper-wrapper" id="featuredVideos"></div>'
    if video_empty in content:
        content = content.replace(
            video_empty,
            f'<div class="swiper-wrapper" id="featuredVideos">\n          <noscript><p>Video tours for {ship_name} are available on YouTube.</p></noscript>\n        </div>'
        )
        fixes.append('video-noscript')

    # 14. Recent Articles noscript
    recent_empty = '<div id="recent-rail" class="rail-list" aria-live="polite"></div>'
    if recent_empty in content:
        content = content.replace(
            recent_empty,
            '<div id="recent-rail" class="rail-list" aria-live="polite">\n          <noscript><ul style="list-style:none;padding:0;"><li><a href="/solo/solo-cruising-practical-guide.html">Solo Cruising Guide</a></li></ul></noscript>\n        </div>'
        )
        fixes.append('recent-noscript')

    # 15. Whimsical Units noscript
    whim_empty_pattern = r'<section class="card"\s+id="whimsical-units-container"\s+style="background:#f7fdff;border-radius:12px;padding:1\.25rem;"></section>'
    whim_replacement = f'<section class="card" id="whimsical-units-container" style="background:#f7fdff;border-radius:12px;padding:1.25rem;"><noscript><h3 style="margin:0 0 0.5rem;">Ship Size</h3><p class="tiny">{ship_name} offers MSC Cruises\' signature European elegance and multinational atmosphere.</p></noscript></section>'
    if re.search(whim_empty_pattern, content):
        content = re.sub(whim_empty_pattern, whim_replacement, content)
        fixes.append('whimsical-noscript')

    # 16. Dining noscript (from venues-v2.json)
    dining_noscript_html = build_dining_noscript(slug)
    if dining_noscript_html:
        # Pattern: empty dining-content div
        dining_pattern = r'<div class="dining-content" id="dining-content" aria-live="polite">\s*</div>'
        if re.search(dining_pattern, content):
            content = re.sub(
                dining_pattern,
                f'<div class="dining-content" id="dining-content" aria-live="polite">\n{dining_noscript_html}\n        </div>',
                content
            )
            fixes.append('dining-noscript')

    if content != original:
        with open(path, 'w') as f:
            f.write(content)

    return fixes


def main():
    pages = sorted(MSC_DIR.glob('msc-*.html'))
    print(f'Found {len(pages)} MSC ship pages')
    print()

    total_fixes = 0
    for page in pages:
        fixes = fix_page(page)
        if fixes:
            print(f'{page.stem}: {len(fixes)} fixes — {", ".join(fixes)}')
            total_fixes += len(fixes)
        else:
            print(f'{page.stem}: (no changes)')

    print()
    print(f'Total fixes applied: {total_fixes}')


if __name__ == '__main__':
    main()
