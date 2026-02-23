#!/usr/bin/env python3
"""
Inject Swiper gallery markup into port pages that have images on disk
but no working gallery in their HTML.

Handles two cases:
  1. Empty gallery-grid: replace empty <div class="gallery-grid"></div>
     with Swiper carousel referencing on-disk images.
  2. No gallery at all: insert full <details> gallery section before FAQ.

Does NOT touch:
  - Ports that already have a working Swiper gallery (gallery-swiper class)
  - Ports with filled gallery-grid (already displaying curated images)
  - Redirect pages (http-equiv="refresh")

Usage:
  python3 admin/inject-port-galleries.py                   # All eligible ports
  python3 admin/inject-port-galleries.py vancouver dubai    # Specific ports
  python3 admin/inject-port-galleries.py --dry-run          # Preview only

Soli Deo Gloria
"""

import argparse
import re
import sys
from pathlib import Path

PORTS_DIR = Path("ports")
IMG_DIR = Path("ports/img")

# Standard image types and their alt-text templates
STANDARD_IMAGES = [
    ("hero",         "{name} skyline and cityscape"),
    ("harbor",       "{name} harbor and waterfront"),
    ("landmark",     "{name} iconic landmark"),
    ("attraction-1", "{name} popular attraction"),
    ("attraction-2", "{name} cultural highlight"),
    ("food",         "Local cuisine in {name}"),
    ("street",       "Street scene in {name}"),
    ("panorama",     "Panoramic view of {name}"),
]

SWIPER_CSS_LINK = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" integrity="sha256-dMpqrlRo28kkeQw7TSGaCJuQo0utU6D3yjpz5ztvWrg=" crossorigin="anonymous"/>'

SWIPER_JS_TAG = '<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js" integrity="sha256-mF8SJMDu7JnTZ6nbNeWORLIefrnORYMbFbTBCOQf2X8=" crossorigin="anonymous" onload="window.__swiperReady=true"></script>'

SWIPER_INIT_SCRIPT = """<script>
    document.addEventListener('DOMContentLoaded', function() {
      function initGallery() {
        if (typeof Swiper !== 'undefined') {
          new Swiper('.gallery-swiper', {
            loop: true,
            pagination: { el: '.swiper-pagination', clickable: true },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            keyboard: { enabled: true },
            a11y: { prevSlideMessage: 'Previous slide', nextSlideMessage: 'Next slide' }
          });
        } else { setTimeout(initGallery, 100); }
      }
      initGallery();
    });
  </script>"""


def port_display_name(slug):
    """Convert slug to display name: 'abu-dhabi' -> 'Abu Dhabi'."""
    return slug.replace("-", " ").title()


def find_images_on_disk(slug):
    """Find standard-named images that exist on disk for a port."""
    img_dir = IMG_DIR / slug
    if not img_dir.is_dir():
        return []
    images = []
    for img_type, alt_template in STANDARD_IMAGES:
        fname = f"{slug}-{img_type}.webp"
        if (img_dir / fname).exists():
            alt = alt_template.format(name=port_display_name(slug))
            images.append((fname, alt))
    return images


def build_swiper_html(slug, images):
    """Build Swiper carousel HTML for a list of images."""
    slides = []
    for fname, alt in images:
        slides.append(
            f'            <div class="swiper-slide">\n'
            f'              <img src="/ports/img/{slug}/{fname}" alt="{alt}" loading="lazy"/>\n'
            f'            </div>'
        )
    slides_html = "\n".join(slides)
    return (
        f'        <div class="swiper gallery-swiper">\n'
        f'          <div class="swiper-wrapper">\n'
        f'{slides_html}\n'
        f'          </div>\n'
        f'          <div class="swiper-pagination"></div>\n'
        f'          <div class="swiper-button-prev" aria-label="Previous slide"></div>\n'
        f'          <div class="swiper-button-next" aria-label="Next slide"></div>\n'
        f'        </div>'
    )


def build_full_gallery_section(slug, images):
    """Build a complete <details> gallery section."""
    swiper = build_swiper_html(slug, images)
    return (
        f'\n        <details class="port-section photo-gallery" id="gallery" open>\n'
        f'            <summary><h2>Photo Gallery</h2></summary>\n'
        f'{swiper}\n'
        f'        </details>\n'
    )


def has_swiper_loaded(html):
    """Check if the page already loads Swiper (CSS + JS)."""
    return "swiper" in html.lower() and ("swiper-bundle" in html or "swiper@11" in html)


def inject_swiper_assets(html):
    """Add Swiper CSS link to <head> and JS + init before </body> if not present."""
    modified = html

    # Add CSS to <head> if not present
    if "swiper-bundle.min.css" not in html:
        # Insert before </head>
        modified = modified.replace("</head>", f"  {SWIPER_CSS_LINK}\n</head>", 1)

    # Add JS before </body> if not present
    if "swiper-bundle.min.js" not in html:
        modified = modified.replace("</body>", f"  {SWIPER_JS_TAG}\n</body>", 1)

    # Add init script if no gallery-swiper init exists
    if "new Swiper('.gallery-swiper'" not in html and "new Swiper(\".gallery-swiper\"" not in html:
        modified = modified.replace("</body>", f"  {SWIPER_INIT_SCRIPT}\n</body>", 1)

    return modified


def process_port(slug, dry_run=False):
    """Process a single port page. Returns (action, detail) or None."""
    html_file = PORTS_DIR / f"{slug}.html"
    if not html_file.exists():
        return None

    html = html_file.read_text(encoding="utf-8")

    # Skip redirects
    if 'http-equiv="refresh"' in html:
        return ("skip", "redirect page")

    # Skip ports with working Swiper gallery
    if "gallery-swiper" in html:
        return ("skip", "already has Swiper gallery")

    # Find images on disk
    images = find_images_on_disk(slug)
    if not images:
        return ("skip", "no standard images on disk")

    # Determine injection type
    has_empty_grid = bool(re.search(
        r'<div class="gallery-grid">\s*</div>', html
    ))
    has_photo_gallery_section = "photo-gallery" in html or "Photo Gallery" in html

    if has_empty_grid:
        # Case 1: Replace empty gallery-grid with Swiper
        swiper = build_swiper_html(slug, images)
        new_html = re.sub(
            r'<div class="gallery-grid">\s*</div>',
            swiper,
            html,
            count=1,
        )
        action = "replace-empty-grid"

    elif not has_photo_gallery_section:
        # Case 2: No gallery section — insert before FAQ
        gallery_section = build_full_gallery_section(slug, images)

        # Try inserting before FAQ section
        faq_pattern = r'([ \t]*<!-- FAQ SECTION[^>]*-->)'
        faq_match = re.search(faq_pattern, new_html if 'new_html' in dir() else html)
        if faq_match:
            insert_point = faq_match.start()
            new_html = html[:insert_point] + gallery_section + "\n" + html[insert_point:]
        else:
            # Try before <details...id="faq"
            faq_pattern2 = r'([ \t]*<details[^>]*id="faq")'
            faq_match2 = re.search(faq_pattern2, html)
            if faq_match2:
                insert_point = faq_match2.start()
                new_html = html[:insert_point] + gallery_section + "\n" + html[insert_point:]
            else:
                # Last resort: before </article>
                article_end = html.find("</article>")
                if article_end > 0:
                    new_html = html[:article_end] + gallery_section + "\n" + html[article_end:]
                else:
                    return ("skip", "could not find insertion point")
        action = "inject-full-section"
    else:
        # Has photo-gallery section but not empty-grid and not swiper
        # This is a non-standard case — skip to be safe
        return ("skip", "has gallery section but non-standard format")

    # Ensure Swiper CSS/JS is loaded
    new_html = inject_swiper_assets(new_html)

    if dry_run:
        return (action, f"{len(images)} images")

    html_file.write_text(new_html, encoding="utf-8")
    return (action, f"{len(images)} images")


def main():
    parser = argparse.ArgumentParser(
        description="Inject Swiper gallery into port pages with images on disk"
    )
    parser.add_argument("ports", nargs="*", help="Specific port slugs")
    parser.add_argument("--dry-run", action="store_true", help="Preview only")
    args = parser.parse_args()

    if args.ports:
        port_list = args.ports
    else:
        # All ports with standard images on disk
        port_list = []
        for d in sorted(IMG_DIR.iterdir()):
            if d.is_dir() and any((d / f"{d.name}-hero.webp").exists()
                                  for _ in [1]):
                port_list.append(d.name)

    replaced = 0
    injected = 0
    skipped = 0

    for slug in port_list:
        result = process_port(slug, dry_run=args.dry_run)
        if result is None:
            continue

        action, detail = result
        if action == "skip":
            print(f"  SKIP  {slug}: {detail}")
            skipped += 1
        elif action == "replace-empty-grid":
            print(f"  GRID  {slug}: replaced empty grid → Swiper ({detail})")
            replaced += 1
        elif action == "inject-full-section":
            print(f"  NEW   {slug}: injected gallery section ({detail})")
            injected += 1

    mode = "DRY RUN" if args.dry_run else "DONE"
    print(f"\n{mode}: {replaced} grids replaced, {injected} sections injected, {skipped} skipped")


if __name__ == "__main__":
    main()
