#!/usr/bin/env python3
"""
Batch Ship Image Sourcer
Sources one unique image per ship from Flickr public feed (CC-licensed preferred),
converts to WebP, inserts into ship page HTML with proper attribution section,
and updates attributions.csv.

Uses Flickr public feed API (no key needed) + live.staticflickr.com CDN.
WikiMedia Commons API is blocked by egress policy in this environment.

Usage:
  python3 admin/source-ship-images-batch.py
  python3 admin/source-ship-images-batch.py --dry-run
  python3 admin/source-ship-images-batch.py --limit 10
  python3 admin/source-ship-images-batch.py --line msc
  python3 admin/source-ship-images-batch.py --start 20
"""

import csv
import json
import os
import re
import sys
import time
import urllib.request
import urllib.parse
import html as html_module
from pathlib import Path

try:
    from PIL import Image
    HAS_PILLOW = True
except ImportError:
    HAS_PILLOW = False
    print("WARNING: Pillow not installed. Images will not be converted to WebP.")

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ASSETS_DIR = PROJECT_ROOT / "assets" / "ships"
ATTR_CSV = PROJECT_ROOT / "attributions" / "attributions.csv"
PROGRESS_FILE = PROJECT_ROOT / "admin" / ".ship-image-progress.json"
USER_AGENT = "InTheWake/1.0 (https://cruisinginthewake.com; ship-reference-site) Python/3"
FLICKR_FEED_BASE = "https://api.flickr.com/services/feeds/photos_public.gne"

# Ships with no unique images (only Cordelia dining image)
SHIPS_NEEDING_IMAGES = [
    # Carnival
    "ships/carnival/carnival-adventure.html",
    "ships/carnival/carnival-ecstasy.html",
    "ships/carnival/carnival-fantasy.html",
    "ships/carnival/carnival-fascination.html",
    "ships/carnival/carnival-imagination.html",
    "ships/carnival/carnival-inspiration.html",
    "ships/carnival/carnival-sensation.html",
    "ships/carnival/carnival-tropicale.html",
    "ships/carnival/mardi-gras.html",
    # Celebrity
    "ships/celebrity-cruises/celebrity-century.html",
    "ships/celebrity-cruises/celebrity-compass.html",
    "ships/celebrity-cruises/celebrity-galaxy.html",
    "ships/celebrity-cruises/celebrity-mercury.html",
    "ships/celebrity-cruises/celebrity-seeker.html",
    "ships/celebrity-cruises/celebrity-xpedition.html",
    "ships/celebrity-cruises/celebrity-xperience.html",
    "ships/celebrity-cruises/celebrity-xploration.html",
    "ships/celebrity-cruises/horizon.html",
    "ships/celebrity-cruises/ss-meridian.html",
    "ships/celebrity-cruises/unnamed-edge-class.html",
    "ships/celebrity-cruises/unnamed-project-nirvana.html",
    "ships/celebrity-cruises/zenith.html",
    # Costa
    "ships/costa/costa-deliziosa.html",
    "ships/costa/costa-diadema.html",
    "ships/costa/costa-fascinosa.html",
    "ships/costa/costa-favolosa.html",
    "ships/costa/costa-firenze.html",
    "ships/costa/costa-pacifica.html",
    "ships/costa/costa-toscana.html",
    "ships/costa/costa-venezia.html",
    # Cunard
    "ships/cunard/queen-anne.html",
    "ships/cunard/queen-elizabeth.html",
    "ships/cunard/queen-victoria.html",
    # Explora Journeys
    "ships/explora-journeys/explora-i.html",
    "ships/explora-journeys/explora-ii.html",
    "ships/explora-journeys/explora-iii.html",
    "ships/explora-journeys/explora-iv.html",
    "ships/explora-journeys/explora-v.html",
    "ships/explora-journeys/explora-vi.html",
    # Explora (duplicate dir)
    "ships/explora/explora-ii.html",
    # Holland America
    "ships/holland-america-line/amsterdam.html",
    "ships/holland-america-line/edam.html",
    "ships/holland-america-line/leerdam.html",
    "ships/holland-america-line/maartensdijk.html",
    "ships/holland-america-line/maasdam.html",
    "ships/holland-america-line/nieuw-amsterdam-ii.html",
    "ships/holland-america-line/nieuw-amsterdam-iii.html",
    "ships/holland-america-line/nieuw-amsterdam-iv.html",
    "ships/holland-america-line/nieuw-amsterdam-v.html",
    "ships/holland-america-line/none-announced.html",
    "ships/holland-america-line/noordam-ii.html",
    "ships/holland-america-line/noordam-iii.html",
    "ships/holland-america-line/noordam-iv.html",
    "ships/holland-america-line/p-caland.html",
    "ships/holland-america-line/potsdam.html",
    "ships/holland-america-line/prinsendam-i.html",
    "ships/holland-america-line/prinsendam-ii.html",
    "ships/holland-america-line/rijndam-ii.html",
    "ships/holland-america-line/rijndam.html",
    "ships/holland-america-line/rotterdam-iv.html",
    "ships/holland-america-line/rotterdam-v.html",
    "ships/holland-america-line/rotterdam-vi.html",
    "ships/holland-america-line/ryndam.html",
    "ships/holland-america-line/statendam-ii.html",
    "ships/holland-america-line/statendam-iii.html",
    "ships/holland-america-line/statendam.html",
    "ships/holland-america-line/veendam-ii.html",
    "ships/holland-america-line/veendam-iii.html",
    "ships/holland-america-line/veendam-iv.html",
    "ships/holland-america-line/veendam.html",
    "ships/holland-america-line/volendam-ii.html",
    "ships/holland-america-line/volendam-iii.html",
    "ships/holland-america-line/volendam.html",
    "ships/holland-america-line/w-a-scholten.html",
    "ships/holland-america-line/westerdam-i.html",
    "ships/holland-america-line/westerdam-ii.html",
    "ships/holland-america-line/westerdam.html",
    "ships/holland-america-line/zuiderdam.html",
    # MSC
    "ships/msc/msc-armonia.html",
    "ships/msc/msc-bellissima.html",
    "ships/msc/msc-divina.html",
    "ships/msc/msc-euribia.html",
    "ships/msc/msc-fantasia.html",
    "ships/msc/msc-grandiosa.html",
    "ships/msc/msc-lirica.html",
    "ships/msc/msc-magnifica.html",
    "ships/msc/msc-musica.html",
    "ships/msc/msc-opera.html",
    "ships/msc/msc-orchestra.html",
    "ships/msc/msc-poesia.html",
    "ships/msc/msc-preziosa.html",
    "ships/msc/msc-seascape.html",
    "ships/msc/msc-seashore.html",
    "ships/msc/msc-seaside.html",
    "ships/msc/msc-seaview.html",
    "ships/msc/msc-sinfonia.html",
    "ships/msc/msc-splendida.html",
    "ships/msc/msc-virtuosa.html",
    "ships/msc/msc-world-asia.html",
    # Oceania
    "ships/oceania/allura.html",
    "ships/oceania/insignia.html",
    "ships/oceania/marina.html",
    "ships/oceania/nautica.html",
    "ships/oceania/regatta.html",
    "ships/oceania/riviera.html",
    "ships/oceania/sirena.html",
    "ships/oceania/vista.html",
    # Princess
    "ships/princess/ruby-princess.html",
    # RCL
    "ships/rcl/discovery-class-ship-tbn.html",
    "ships/rcl/nordic-prince.html",
    "ships/rcl/song-of-america.html",
    # Regent
    "ships/regent/prestige.html",
    "ships/regent/seven-seas-explorer.html",
    "ships/regent/seven-seas-grandeur.html",
    "ships/regent/seven-seas-mariner.html",
    "ships/regent/seven-seas-navigator.html",
    "ships/regent/seven-seas-splendor.html",
    "ships/regent/seven-seas-voyager.html",
    # Seabourn
    "ships/seabourn/seabourn-encore.html",
    "ships/seabourn/seabourn-odyssey.html",
    "ships/seabourn/seabourn-ovation.html",
    "ships/seabourn/seabourn-pursuit.html",
    "ships/seabourn/seabourn-quest.html",
    "ships/seabourn/seabourn-sojourn.html",
    "ships/seabourn/seabourn-venture.html",
    # Silversea
    "ships/silversea/silver-cloud.html",
    "ships/silversea/silver-dawn.html",
    "ships/silversea/silver-endeavour.html",
    "ships/silversea/silver-moon.html",
    "ships/silversea/silver-muse.html",
    "ships/silversea/silver-nova.html",
    "ships/silversea/silver-origin.html",
    "ships/silversea/silver-ray.html",
    "ships/silversea/silver-shadow.html",
    "ships/silversea/silver-spirit.html",
    "ships/silversea/silver-whisper.html",
    "ships/silversea/silver-wind.html",
    # Virgin Voyages
    "ships/virgin-voyages/brilliant-lady.html",
    "ships/virgin-voyages/resilient-lady.html",
    "ships/virgin-voyages/scarlet-lady.html",
    "ships/virgin-voyages/valiant-lady.html",
]


def flickr_feed_search(tags):
    """Search Flickr public feed by tags. Returns list of items."""
    url = f"{FLICKR_FEED_BASE}?tags={urllib.parse.quote(tags)}&format=json&nojsoncallback=1&tagmode=all"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                raw = resp.read().decode("utf-8")
            raw = raw.replace("\\'", "'")
            data = json.loads(raw)
            return data.get("items", [])
        except Exception as e:
            if attempt < 2:
                time.sleep(3)
            else:
                return []
    return []


def extract_ship_name_clean(html_path):
    """Extract just the ship name, without page subtitle."""
    full_path = PROJECT_ROOT / html_path
    if not full_path.exists():
        return None
    with open(full_path, "r", encoding="utf-8") as f:
        content = f.read(8000)

    # Try <h1> — strip everything after em-dash, pipe, or parenthetical
    m = re.search(r"<h1[^>]*>([^<]+)</h1>", content)
    if m:
        name = m.group(1).strip()
        # Remove subtitles like "— Deck Plans..." or "(1991-2022)"
        name = re.split(r"\s*[—–|]\s*", name)[0].strip()
        name = re.sub(r"\s*\(.*?\)\s*$", "", name).strip()
        return name

    # Derive from filename
    slug = Path(html_path).stem
    return slug.replace("-", " ").title()


def generate_flickr_tags(ship_name):
    """Generate multiple tag combinations to search Flickr."""
    # Remove common prefixes for tag generation
    clean = ship_name.strip()

    # Primary: exact name as single tag (no spaces)
    primary = re.sub(r"[^a-zA-Z0-9]", "", clean.lower())

    # Secondary: ship name with common variations
    tags = []
    tags.append(primary)

    # Try with "cruise" suffix
    tags.append(f"{primary},cruise")
    tags.append(f"{primary},ship")

    # For multi-word names, also try individual significant words
    words = clean.lower().split()
    if len(words) >= 2:
        # Try first+last word combo
        combo = words[0] + words[-1]
        tags.append(re.sub(r"[^a-z0-9]", "", combo))

    return tags


def download_image(url, dest_path):
    """Download an image with retry."""
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = resp.read()
                if len(data) < 5000:  # Too small, probably an error page
                    return 0
                with open(dest_path, "wb") as f:
                    f.write(data)
                return len(data)
        except Exception as e:
            if attempt < 2:
                time.sleep(3)
            else:
                print(f"    Download error: {e}")
    return 0


def convert_to_webp(src_path, quality=82):
    """Convert image to WebP using Pillow."""
    if not HAS_PILLOW:
        return str(src_path)

    webp_path = src_path.with_suffix(".webp")
    try:
        img = Image.open(src_path)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        # Resize if very large (max 1600px wide)
        if img.width > 1600:
            ratio = 1600 / img.width
            new_size = (1600, int(img.height * ratio))
            img = img.resize(new_size, Image.LANCZOS)
        img.save(webp_path, "WebP", quality=quality)
        if src_path.suffix.lower() != ".webp":
            src_path.unlink()
        return str(webp_path)
    except Exception as e:
        print(f"    WebP conversion failed: {e}")
        return str(src_path)


def safe_filename(ship_name, photographer):
    """Generate a safe, descriptive filename."""
    ship_safe = re.sub(r"[^a-zA-Z0-9_\-]", "_", ship_name)
    ship_safe = re.sub(r"_+", "_", ship_safe).strip("_")[:60]
    photo_safe = re.sub(r"[^a-zA-Z0-9]", "", photographer)[:20]
    return f"{ship_safe}_flickr_{photo_safe}"


def update_ship_html(html_path, img_web_path, ship_name, photographer, photo_url):
    """Insert image carousel and attribution section into ship page HTML."""
    full_path = PROJECT_ROOT / html_path
    with open(full_path, "r", encoding="utf-8") as f:
        html = f.read()

    esc_name = html_module.escape(ship_name)
    esc_photo = html_module.escape(photographer)
    esc_url = html_module.escape(photo_url)

    # Build the new First Look section with carousel and attribution
    carousel_html = f'''<section class="card" aria-labelledby="first-look">
          <h2 id="first-look">A First Look at {esc_name}</h2>
          <div class="swiper firstlook" aria-label="{esc_name} photo carousel">
            <div class="swiper-wrapper">
              <div class="swiper-slide">
                <figure>
                  <img src="{img_web_path}" alt="{esc_name} exterior view" loading="lazy" decoding="async">
                  <figcaption class="tiny">Photo: <a href="{esc_url}" target="_blank" rel="noopener">{esc_photo}</a> via Flickr</figcaption>
                </figure>
              </div>
            </div>
            <div class="swiper-pagination" aria-hidden="true"></div>
            <div class="swiper-button-prev" aria-label="Previous image"></div>
            <div class="swiper-button-next" aria-label="Next image"></div>
          </div>
        </section>'''

    # Build attribution section
    attribution_html = f'''<!-- Attribution -->
    <section class="card attributions" aria-labelledby="attribution-heading">
      <h2 id="attribution-heading">Image Attributions</h2>
      <ul>
        <li>
          Ship photography by <a href="{esc_url}" target="_blank" rel="noopener">{esc_photo}</a>
          via <a href="https://www.flickr.com" target="_blank" rel="noopener">Flickr</a>.
          Used with attribution.
        </li>
      </ul>
    </section>'''

    # Replace existing First Look section
    first_look_pattern = re.compile(
        r'<section[^>]*aria-labelledby="first-look"[^>]*>.*?</section>',
        re.DOTALL
    )
    m = first_look_pattern.search(html)
    if m:
        html = html[:m.start()] + carousel_html + html[m.end():]
    else:
        # Insert before dining section
        dining_pattern = re.compile(
            r'(<section[^>]*aria-labelledby="diningHeading")',
            re.DOTALL
        )
        dm = dining_pattern.search(html)
        if dm:
            html = html[:dm.start()] + carousel_html + "\n\n        " + html[dm.start():]
        else:
            print(f"    WARNING: No insertion point found in {html_path}")
            return False

    # Add attribution section if not already present
    if 'class="card attributions"' not in html and 'attribution-heading' not in html:
        # Insert before </div><!-- End main content or before right rail
        # Try to find the end of the main content area
        insertion_points = [
            r'(</div><!-- End main content)',
            r'(</section><!-- End main content)',
            r'(</section><!-- End Main Content)',
            r'(<\!-- Right Rail)',
            r'(<aside\s+class="rail)',
        ]
        inserted = False
        for pattern in insertion_points:
            m = re.search(pattern, html, re.IGNORECASE)
            if m:
                html = html[:m.start()] + "\n\n    " + attribution_html + "\n    " + html[m.start():]
                inserted = True
                break

        if not inserted:
            # Fallback: insert before closing </main> or last </section>
            m = re.search(r'(</main>)', html)
            if m:
                html = html[:m.start()] + "\n    " + attribution_html + "\n    " + html[m.start():]
                inserted = True

        if not inserted:
            print(f"    WARNING: Could not insert attribution section in {html_path}")

    # Update last-reviewed meta tag
    html = re.sub(
        r'(<meta\s+name="last-reviewed"\s+content=")([^"]+)(")',
        r'\g<1>2026-02-12\3',
        html
    )

    # Update dateModified in JSON-LD
    html = re.sub(
        r'("dateModified"\s*:\s*")([^"]+)(")',
        r'\g<1>2026-02-12\3',
        html
    )

    with open(full_path, "w", encoding="utf-8") as f:
        f.write(html)

    return True


def append_attribution_csv(img_web_path, photo_url, photographer):
    """Append entry to attributions.csv."""
    with open(ATTR_CSV, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([img_web_path, photo_url, "Flickr (verify license)", photographer, "Flickr public feed"])


def load_progress():
    """Load progress tracking to resume from where we left off."""
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE) as f:
            return json.load(f)
    return {"completed": [], "failed": []}


def save_progress(progress):
    """Save progress for resume capability."""
    with open(PROGRESS_FILE, "w") as f:
        json.dump(progress, f, indent=2)


def process_ship(html_path, dry_run=False):
    """Process a single ship: search Flickr, download, convert, insert, attribute."""
    ship_name = extract_ship_name_clean(html_path)
    if not ship_name:
        print(f"  SKIP: Could not extract ship name from {html_path}")
        return False

    lower_name = ship_name.lower()
    if any(x in lower_name for x in ["tbn", "unnamed", "none announced", "none-announced", "prestige"]):
        print(f"  SKIP: {ship_name} (placeholder/TBN/unbuilt)")
        return False

    print(f"\n  Ship: {ship_name}")

    # Generate tag combinations to search
    tag_sets = generate_flickr_tags(ship_name)

    for tags in tag_sets:
        print(f"  Searching Flickr tags: {tags}")
        items = flickr_feed_search(tags)
        time.sleep(2)

        if not items:
            continue

        print(f"  Found {len(items)} results")

        # Try each result
        for item in items[:5]:
            title = item.get("title", "Untitled")
            media_url = item.get("media", {}).get("m", "")
            if not media_url:
                continue

            # Convert from _m.jpg (small) to _b.jpg (large, 1024px)
            large_url = media_url.replace("_m.jpg", "_b.jpg").replace("_m.png", "_b.png")

            author = item.get("author", "")
            author_match = re.search(r'\("(.+?)"\)', author)
            photographer = author_match.group(1) if author_match else "Unknown"
            photo_link = item.get("link", "")

            if dry_run:
                print(f"  DRY RUN: Would download from {photographer}")
                print(f"    Title: {title}")
                print(f"    URL: {large_url}")
                return True

            # Download
            filename = safe_filename(ship_name, photographer)
            dest_path = ASSETS_DIR / f"{filename}.jpg"
            webp_path = ASSETS_DIR / f"{filename}.webp"

            # Skip if already downloaded
            if webp_path.exists():
                print(f"  Already exists: {filename}.webp")
                web_path = "/" + str(webp_path.relative_to(PROJECT_ROOT))
            else:
                print(f"  Downloading from {photographer}...")
                size = download_image(large_url, str(dest_path))
                if size == 0:
                    continue

                print(f"  Downloaded {size:,} bytes")

                # Validate it's a real image
                try:
                    if HAS_PILLOW:
                        img = Image.open(dest_path)
                        if img.width < 400 or img.height < 200:
                            print(f"  Too small ({img.width}x{img.height}), skipping")
                            dest_path.unlink()
                            continue
                except Exception:
                    print(f"  Invalid image, skipping")
                    if dest_path.exists():
                        dest_path.unlink()
                    continue

                # Convert to WebP
                final_path = convert_to_webp(dest_path)
                web_path = "/" + str(Path(final_path).relative_to(PROJECT_ROOT))
                print(f"  Converted: {os.path.basename(final_path)}")

            # Update the HTML
            success = update_ship_html(
                html_path, web_path, ship_name,
                photographer, photo_link
            )

            if success:
                append_attribution_csv(web_path, photo_link, photographer)
                print(f"  SUCCESS: {ship_name} -> {os.path.basename(web_path)}")
                return True
            else:
                print(f"  FAILED to update HTML")
                return False

    print(f"  NO IMAGE found for {ship_name}")
    return False


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Batch source ship images from Flickr")
    parser.add_argument("--dry-run", action="store_true", help="Search but don't download")
    parser.add_argument("--limit", type=int, default=0, help="Max ships to process (0=all)")
    parser.add_argument("--line", type=str, default="", help="Filter by cruise line directory")
    parser.add_argument("--start", type=int, default=0, help="Start at ship index N")
    parser.add_argument("--resume", action="store_true", help="Skip already completed ships")
    args = parser.parse_args()

    ASSETS_DIR.mkdir(parents=True, exist_ok=True)

    ships = SHIPS_NEEDING_IMAGES[:]
    progress = load_progress() if args.resume else {"completed": [], "failed": []}

    # Filter by cruise line
    if args.line:
        ships = [s for s in ships if args.line in s]

    # Skip already completed
    if args.resume:
        ships = [s for s in ships if s not in progress["completed"]]

    # Apply start offset
    if args.start > 0:
        ships = ships[args.start:]

    # Apply limit
    if args.limit > 0:
        ships = ships[:args.limit]

    print(f"Processing {len(ships)} ships...")
    if args.dry_run:
        print("DRY RUN MODE — no downloads or edits")
    print()

    success_count = 0
    fail_count = 0
    skip_count = 0

    for i, ship_path in enumerate(ships):
        full_path = PROJECT_ROOT / ship_path
        if not full_path.exists():
            print(f"\n[{i+1}/{len(ships)}] SKIP: {ship_path} (not found)")
            skip_count += 1
            continue

        print(f"\n{'='*60}")
        print(f"[{i+1}/{len(ships)}] {ship_path}")
        print(f"{'='*60}")

        try:
            result = process_ship(ship_path, dry_run=args.dry_run)
        except Exception as e:
            print(f"  ERROR: {e}")
            result = False

        if result:
            success_count += 1
            progress["completed"].append(ship_path)
        else:
            fail_count += 1
            progress["failed"].append(ship_path)

        # Save progress periodically
        if not args.dry_run and (i + 1) % 5 == 0:
            save_progress(progress)

        # Rotate delay: 4-10 seconds between ships to be respectful
        delay = 4 + (i % 7)
        if not args.dry_run:
            time.sleep(delay)

    if not args.dry_run:
        save_progress(progress)

    print(f"\n{'='*60}")
    print(f"BATCH COMPLETE")
    print(f"{'='*60}")
    print(f"  Success: {success_count}")
    print(f"  Failed:  {fail_count}")
    print(f"  Skipped: {skip_count}")
    print(f"  Total:   {len(ships)}")


if __name__ == "__main__":
    main()
