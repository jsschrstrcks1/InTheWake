#!/usr/bin/env python3
"""
apply-template-fixes.py — Apply 10 template-level fixes to 48 RCL ship pages.
Skips anthem-of-the-seas.html (already fixed).

Soli Deo Gloria
"""

import os
import re
import glob
import sys

SHIPS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'ships', 'rcl')
SKIP_FILES = {'anthem-of-the-seas.html', 'index.html', 'venues.html'}

# Global stats
stats = {
    'files_changed': 0,
    'fix1_swiper': 0,
    'fix2_sw_bridge': 0,
    'fix3_cruiseship': 0,
    'fix4_reviewrating': 0,
    'fix5_heading': 0,
    'fix6_flickers': 0,
    'fix7_alt': 0,
    'fix8_lcp': 0,
    'fix9_xss': 0,
    'fix10_icp': 0,
}

# ── Fix 1: Swiper vendor — remove dead primary, go straight to CDN ──
SWIPER_REPLACEMENT = """(function ensureSwiper(){
  function addCSS(h){ const l=document.createElement('link'); l.rel='stylesheet'; l.href=h; document.head.appendChild(l); }
  function addJS(src, ok, fail){
    const s=document.createElement('script'); s.src=src; s.async=true; s.onload=ok; s.onerror=fail||function(){}; document.head.appendChild(s);
  }
  const cdnCSS="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css";
  const cdnJS ="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js";
  addCSS(cdnCSS);
  addJS(cdnJS, function(){ window.__swiperReady=true; });
})();"""


def apply_fix1_swiper(content, fname):
    """Replace ensureSwiper IIFE that references cruisinginthewake.com/vendor/swiper/."""
    if 'cruisinginthewake.com/vendor/swiper/' not in content:
        return content, False

    # Match the entire IIFE — may be named (function ensureSwiper(){) or anonymous (function(){)
    # Both end with })();
    pattern = re.compile(
        r'\(function\s*(?:ensureSwiper)?\s*\(\)\{.*?\}\)\(\);',
        re.DOTALL
    )
    # Find the IIFE that contains the vendor/swiper/ URL
    for m in pattern.finditer(content):
        old = m.group(0)
        if 'cruisinginthewake.com/vendor/swiper/' in old:
            content = content[:m.start()] + SWIPER_REPLACEMENT + content[m.end():]
            return content, True

    print(f"  [WARN] Fix 1: Found vendor/swiper/ URL but could not match Swiper IIFE in {fname}")
    return content, False


def apply_fix2_sw_bridge(content, fname):
    """Add sw-bridge.js before </body> if not already present."""
    if 'sw-bridge.js' in content:
        return content, False

    tag = '<script src="/assets/js/sw-bridge.js" defer></script>'
    idx = content.rfind('</body>')
    if idx == -1:
        print(f"  [WARN] Fix 2: No </body> tag found in {fname}")
        return content, False

    # Find the line before </body> and insert
    content = content[:idx] + '  ' + tag + '\n' + content[idx:]
    return content, True


def apply_fix3_cruiseship(content, fname):
    """Replace "@type": "Cruise" with "@type": "CruiseShip" inside itemReviewed blocks."""
    if '"CruiseShip"' in content:
        return content, False
    if '"@type": "Cruise"' not in content and '"@type":"Cruise"' not in content:
        return content, False

    # Strategy: find "itemReviewed" and then the nearest "@type": "Cruise" after it
    # We look for itemReviewed blocks and change @type within them
    changed = False
    new_content = content

    # Pattern: "itemReviewed" followed by (within ~200 chars) "@type": "Cruise"
    # We need to be careful not to change standalone Cruise schemas
    pattern = re.compile(
        r'("itemReviewed"\s*:\s*\{[^}]*?"@type"\s*:\s*)"Cruise"',
        re.DOTALL
    )

    if pattern.search(new_content):
        new_content = pattern.sub(r'\1"CruiseShip"', new_content)
        changed = True
    else:
        # Fallback: try a proximity-based approach
        # Find "itemReviewed" positions, then find the next "@type": "Cruise" near each
        ir_positions = [m.start() for m in re.finditer(r'"itemReviewed"', new_content)]
        for pos in ir_positions:
            # Look within 300 chars after itemReviewed for "@type": "Cruise"
            window = new_content[pos:pos+300]
            m = re.search(r'"@type"\s*:\s*"Cruise"', window)
            if m:
                abs_start = pos + m.start()
                abs_end = pos + m.end()
                old_text = new_content[abs_start:abs_end]
                new_text = old_text.replace('"Cruise"', '"CruiseShip"')
                new_content = new_content[:abs_start] + new_text + new_content[abs_end:]
                changed = True
                break  # Typically one itemReviewed per page

    return new_content, changed


def apply_fix4_reviewrating(content, fname):
    """Add reviewRating block after reviewBody if missing."""
    if 'reviewRating' in content:
        return content, False

    # Check for Review type
    has_review = '"@type": "Review"' in content or '"@type":"Review"' in content
    if not has_review:
        return content, False

    # Find reviewBody and its closing
    # Pattern: "reviewBody": "...some text..."
    # We need to find the end of the reviewBody value
    pattern = re.compile(r'"reviewBody"\s*:\s*"(?:[^"\\]|\\.)*"')
    m = pattern.search(content)
    if not m:
        print(f"  [WARN] Fix 4: Has Review but could not find reviewBody in {fname}")
        return content, False

    insert_pos = m.end()
    rating_block = ',"reviewRating":{"@type":"Rating","ratingValue":4,"bestRating":5}'
    content = content[:insert_pos] + rating_block + content[insert_pos:]
    return content, True


def apply_fix5_heading(content, fname):
    """Fix h1 -> h3 heading skip: change first h3 after h1 to h2 if it's in the page-intro area."""
    # Find h1 position
    h1_match = re.search(r'<h1[\s>]', content)
    if not h1_match:
        return content, False

    h1_pos = h1_match.start()

    # Find all headings after h1
    after_h1 = content[h1_pos:]
    # Find all h2 and h3 tags after h1
    headings_after = list(re.finditer(r'<(h[23456])\b', after_h1))

    if len(headings_after) < 2:
        # Not enough headings after h1
        return content, False

    # The first heading after h1 is h1 itself, skip it
    # Actually, the first match IS h1 itself — skip past it
    # Find next heading after h1
    next_headings = list(re.finditer(r'<(h[23456])\b', after_h1[h1_match.end() - h1_pos:]))
    if not next_headings:
        return content, False

    first_after_h1 = next_headings[0]
    tag = first_after_h1.group(1)

    if tag != 'h3':
        # First heading after h1 is not h3, no skip issue
        return content, False

    # Get absolute position
    abs_pos = h1_pos + (h1_match.end() - h1_pos) + first_after_h1.start()

    # Find the full opening tag
    open_match = re.search(r'<h3\b([^>]*)>', content[abs_pos:])
    if not open_match:
        return content, False

    open_start = abs_pos
    open_end = abs_pos + open_match.end()

    # Find the closing </h3> for this specific tag
    close_match = re.search(r'</h3>', content[open_end:])
    if not close_match:
        print(f"  [WARN] Fix 5: Found opening <h3> but no closing </h3> in {fname}")
        return content, False

    close_start = open_end + close_match.start()
    close_end = open_end + close_match.end()

    # Replace opening <h3...> with <h2...>
    old_open = content[open_start:open_end]
    new_open = old_open.replace('<h3', '<h2', 1)

    # Replace closing </h3> with </h2>
    content = content[:open_start] + new_open + content[open_end:close_start] + '</h2>' + content[close_end:]
    return content, True


def apply_fix6_flickers(content, fname):
    """Split Flickers of Majesty Instagram mislabel into two separate links."""
    # Match the pattern: link to flickersofmajesty.com with "Photo by Flickers of Majesty — Instagram" text
    pattern = re.compile(
        r'<a\s+class="pill[^"]*"\s+href="https://www\.flickersofmajesty\.com"\s+target="_blank"\s+rel="noopener">Photo by Flickers of Majesty\s*(?:—|&#8212;|-)\s*Instagram</a>'
    )
    m = pattern.search(content)
    if not m:
        return content, False

    replacement = (
        '<a class="pill" href="https://www.flickersofmajesty.com" target="_blank" rel="noopener">Flickers of Majesty</a>\n'
        '        <a class="pill" href="https://www.instagram.com/flickersofmajesty" target="_blank" rel="noopener">@flickersofmajesty</a>'
    )
    content = content[:m.start()] + replacement + content[m.end():]
    return content, True


def apply_fix7_alt(content, fname):
    """Fix generic deck-plan alt text for ship-map.png."""
    pattern = re.compile(r'(src="/assets/ship-map\.png"\s+alt=")[^"]*(")')
    m = pattern.search(content)
    if not m:
        return content, False

    new_alt = 'Generic cruise ship deck layout overview'
    old_alt_text = content[m.start(1)+len(m.group(1)):m.start(2)]
    if old_alt_text == new_alt:
        return content, False

    content = content[:m.start()] + m.group(0)[:m.start(1)-m.start()+len(m.group(1))] + new_alt + content[m.start(2):]
    # Simpler approach:
    content_new = pattern.sub(r'\g<1>Generic cruise ship deck layout overview\2', content)
    if content_new != content:
        return content_new, True

    # If we got here, try alternate attribute order: alt before src
    pattern2 = re.compile(r'(alt=")[^"]*("\s+src="/assets/ship-map\.png")')
    m2 = pattern2.search(content)
    if m2:
        content = pattern2.sub(r'\g<1>Generic cruise ship deck layout overview\2', content)
        return content, True

    return content, False


def apply_fix8_lcp(content, fname):
    """Retarget LCP preload from logo/compass to first carousel image. Also set first carousel img to eager."""
    changed = False

    # Find the first preload targeting logo_wake or compass_rose
    preload_pattern = re.compile(
        r'<link\s+rel="preload"\s+as="image"\s+href="([^"]*(?:logo_wake|compass_rose)[^"]*)"[^>]*/?>',
    )
    preload_match = preload_pattern.search(content)
    if not preload_match:
        return content, False

    # Find the first carousel image in the firstlook section
    # The structure varies:
    #   - <picture><source srcset="..."><img src="..."></picture>
    #   - <figure><img src="..."></figure>
    #   - <img src="..."> directly
    # The <img may be multi-line.
    # Strategy: find "swiper firstlook", then first "swiper-slide", then first <img with src="..."
    fl_pos = content.find('class="swiper firstlook"')
    if fl_pos == -1:
        print(f"  [WARN] Fix 8: No firstlook carousel found in {fname}")
        return content, False

    # Find first swiper-slide after it
    slide_pos = content.find('swiper-slide', fl_pos + 20)
    if slide_pos == -1:
        print(f"  [WARN] Fix 8: No swiper-slide found in firstlook carousel in {fname}")
        return content, False

    # Find the first <img in this slide (may be multi-line), extract src
    after_slide = content[slide_pos:]
    img_src_match = re.search(r'<img\b[^>]*?\bsrc="([^"]+)"', after_slide, re.DOTALL)
    if not img_src_match:
        print(f"  [WARN] Fix 8: No img src found in first swiper-slide in {fname}")
        return content, False

    first_img_src = img_src_match.group(1)

    # Replace the preload href
    old_preload = preload_match.group(0)
    new_preload = f'<link rel="preload" as="image" href="{first_img_src}" fetchpriority="high"/>'
    content = content.replace(old_preload, new_preload, 1)
    changed = True

    # Also: change loading="lazy" to loading="eager" on the first carousel <img
    # Get absolute position of that img tag
    img_abs_start = slide_pos + img_src_match.start()
    img_tag_end = re.search(r'>', content[img_abs_start:], re.DOTALL)
    if img_tag_end:
        img_abs_end = img_abs_start + img_tag_end.end()
        img_tag = content[img_abs_start:img_abs_end]
        if 'loading="lazy"' in img_tag:
            new_img_tag = img_tag.replace('loading="lazy"', 'loading="eager"')
            content = content[:img_abs_start] + new_img_tag + content[img_abs_end:]

    return content, changed


def apply_fix9_xss(content, fname):
    """Add .replace(/>/g,'&gt;') after every .replace(/</g,'&lt;') that doesn't already have it."""
    changed = False

    # Match .replace(/</g,'&lt;') or .replace(/</g,"&lt;") NOT followed by .replace(/>/g,...
    # We need to check what comes right after
    pattern = re.compile(r"""\.replace\(/</g,\s*['"]&lt;['"]\)(?!\.replace\(/>/g)""")

    matches = list(pattern.finditer(content))
    if not matches:
        return content, False

    # Process from end to start to maintain positions
    for m in reversed(matches):
        end_pos = m.end()
        matched_text = m.group(0)
        # Determine which quote style was used
        if "'&lt;'" in matched_text:
            gt_replace = ".replace(/>/g,'&gt;')"
        else:
            gt_replace = '.replace(/>/g,"&gt;")'

        content = content[:end_pos] + gt_replace + content[end_pos:]
        changed = True

    return content, changed


def apply_fix10_icp(content, fname):
    """Upgrade ICP-Lite to ICP-2 and remove ai-breadcrumbs block."""
    changed = False

    # Part A: ICP-Lite -> ICP-2
    if 'ICP-Lite' in content:
        # Change content="ICP-Lite v1.4" or content="ICP-Lite v1.0" to content="ICP-2"
        content = re.sub(r'content="ICP-Lite v\d+\.\d+"', 'content="ICP-2"', content)

        # Change comment headers: <!-- ICP-Lite v1.4: ... --> to <!-- ICP-2: ... -->
        content = re.sub(r'ICP-Lite v\d+\.\d+', 'ICP-2', content)

        # Any remaining "ICP-Lite" (e.g., in JSON-LD comments/labels)
        content = re.sub(r'\(ICP-Lite(?:\s+v\d+\.\d+)?\)', '(ICP-2)', content)

        # Catch remaining ICP-Lite references that weren't caught above
        if 'ICP-Lite' in content:
            content = content.replace('ICP-Lite', 'ICP-2')

        changed = True

    # Part B: Remove ai-breadcrumbs block
    if '<!-- ai-breadcrumbs' in content:
        # Remove entire block from <!-- ai-breadcrumbs to closing -->
        pattern = re.compile(r'<!-- ai-breadcrumbs\b.*?-->\s*\n?', re.DOTALL)
        new_content = pattern.sub('', content)
        if new_content != content:
            content = new_content
            changed = True

    return content, changed


def process_file(filepath):
    """Process a single ship page, applying all applicable fixes."""
    fname = os.path.basename(filepath)
    print(f"\n{'='*60}")
    print(f"Processing: {fname}")
    print(f"{'='*60}")

    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()

    content = original
    changes = []

    # Fix 1: Swiper vendor
    content, did = apply_fix1_swiper(content, fname)
    if did:
        changes.append('Fix 1: Swiper vendor -> CDN only')
        stats['fix1_swiper'] += 1

    # Fix 2: sw-bridge.js
    content, did = apply_fix2_sw_bridge(content, fname)
    if did:
        changes.append('Fix 2: Added sw-bridge.js')
        stats['fix2_sw_bridge'] += 1

    # Fix 3: Schema Cruise -> CruiseShip
    content, did = apply_fix3_cruiseship(content, fname)
    if did:
        changes.append('Fix 3: Cruise -> CruiseShip in itemReviewed')
        stats['fix3_cruiseship'] += 1

    # Fix 4: Add reviewRating
    content, did = apply_fix4_reviewrating(content, fname)
    if did:
        changes.append('Fix 4: Added reviewRating')
        stats['fix4_reviewrating'] += 1

    # Fix 5: h1 -> h3 heading skip
    content, did = apply_fix5_heading(content, fname)
    if did:
        changes.append('Fix 5: h3 -> h2 heading skip fix')
        stats['fix5_heading'] += 1

    # Fix 6: Flickers Instagram label
    content, did = apply_fix6_flickers(content, fname)
    if did:
        changes.append('Fix 6: Split Flickers/Instagram links')
        stats['fix6_flickers'] += 1

    # Fix 7: Generic deck-plan alt
    content, did = apply_fix7_alt(content, fname)
    if did:
        changes.append('Fix 7: Generic deck-plan alt text')
        stats['fix7_alt'] += 1

    # Fix 8: LCP preload retarget
    content, did = apply_fix8_lcp(content, fname)
    if did:
        changes.append('Fix 8: LCP preload retargeted')
        stats['fix8_lcp'] += 1

    # Fix 9: Half-escape XSS
    content, did = apply_fix9_xss(content, fname)
    if did:
        changes.append('Fix 9: Added &gt; XSS escape')
        stats['fix9_xss'] += 1

    # Fix 10: ICP-Lite -> ICP-2
    content, did = apply_fix10_icp(content, fname)
    if did:
        changes.append('Fix 10: ICP-Lite -> ICP-2 + removed ai-breadcrumbs')
        stats['fix10_icp'] += 1

    if changes:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        stats['files_changed'] += 1
        print(f"  CHANGED ({len(changes)} fixes):")
        for c in changes:
            print(f"    - {c}")
    else:
        print("  No changes needed.")

    return changes


def main():
    # Collect target files
    html_files = sorted(glob.glob(os.path.join(SHIPS_DIR, '*.html')))
    target_files = [f for f in html_files if os.path.basename(f) not in SKIP_FILES]

    print(f"Found {len(target_files)} target ship pages (excluding {', '.join(SKIP_FILES)})")
    print(f"Ships dir: {SHIPS_DIR}")

    all_changes = {}
    for filepath in target_files:
        changes = process_file(filepath)
        if changes:
            all_changes[os.path.basename(filepath)] = changes

    # Print summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Total files processed: {len(target_files)}")
    print(f"Total files changed:   {stats['files_changed']}")
    print(f"\nFixes applied per category:")
    print(f"  Fix 1  (Swiper vendor -> CDN):     {stats['fix1_swiper']}")
    print(f"  Fix 2  (sw-bridge.js):             {stats['fix2_sw_bridge']}")
    print(f"  Fix 3  (Cruise -> CruiseShip):     {stats['fix3_cruiseship']}")
    print(f"  Fix 4  (reviewRating added):       {stats['fix4_reviewrating']}")
    print(f"  Fix 5  (h3 -> h2 heading skip):    {stats['fix5_heading']}")
    print(f"  Fix 6  (Flickers/Instagram split): {stats['fix6_flickers']}")
    print(f"  Fix 7  (deck-plan alt text):       {stats['fix7_alt']}")
    print(f"  Fix 8  (LCP preload retarget):     {stats['fix8_lcp']}")
    print(f"  Fix 9  (XSS &gt; escape):          {stats['fix9_xss']}")
    print(f"  Fix 10 (ICP-Lite -> ICP-2):        {stats['fix10_icp']}")

    total_fixes = sum(v for k, v in stats.items() if k != 'files_changed')
    print(f"\nTotal fixes applied: {total_fixes}")


if __name__ == '__main__':
    main()
