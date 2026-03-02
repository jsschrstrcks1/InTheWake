# Image Workflow — In the Wake

**Version:** 1.0.0
**Last Updated:** 2026-03-02
**Purpose:** Image sourcing, conversion, storage, and attribution workflow. Extracted from CLAUDE.md.

---

## Image Standards

**Current Standard:** WebP format (77% smaller than JPEG)

**Status:**
- ✅ 682 ship images in WebP format (4,475 WebP site-wide)
- ✅ 0 JPG/JPEG files remain in repository (eliminated 2026-01-31)
- ✅ All HTML meta tags updated (og:image, twitter:image)
- ✅ All JSON-LD schemas use .webp

**CRITICAL:** `logo_wake.png` must ALWAYS stay PNG — never convert to WebP (requires transparency).

---

## Image Discovery Pattern

**For ship card/grid images:**
1. Check `/assets/ships/thumbs/` first (pre-sized thumbnails)
2. Fallback to `/assets/ships/`
3. Accept filenames: `<slug>.webp`, `<slug>1.webp`, `<slug>2.webp`, `<slug>3.webp`
4. Select one at random per page load
5. Hide ships with no images from grids

---

## Image Sourcing Workflow

When a ship, port, or venue is missing an image, follow this order:

### 1. Check local assets first

- `/assets/ships/thumbs/`
- `/assets/ships/`
- `/ports/img/`
- Check for `*.jpg`, `*.jpeg`, `*.png`, `*.webp`

### 2. If no suitable local image exists, try free sources in order

**a. Wikimedia Commons (preferred for ships and landmarks)**
- Use the Wikimedia API to search for a properly licensed image
- Also check the Wikipedia article for the entity — embedded images link back to Commons
- Prefer recent, high-resolution photos; license must allow reuse (CC BY, CC BY-SA, public domain)
- Download locally — never hotlink

**b. Unsplash (preferred for port cities and destinations)**
- Free for commercial use, no attribution legally required (but we attribute anyway)
- Browse: `unsplash.com/s/photos/[destination]`
- Excellent for scenic port/city photos

**c. Pexels / Pixabay (backup for destinations and scenics)**
- Free for commercial use with generous licenses
- Good coverage of popular cruise destinations
- Pexels API: `https://api.pexels.com/v1/search`
- Pixabay API: `https://pixabay.com/api/`

**d. Flickr Creative Commons (backup for ships and niche ports)**
- Large archive of CC-licensed cruise ship and port photos
- Filter by license: CC BY, CC BY-SA (not NC or ND)
- Many specialist ship photographers post here

Any legal source of free images is fair game — the above are starting points, not an exhaustive list.

### Wikimedia Sandbox Workaround

The sandbox egress policy may block direct `curl`/`WebFetch` to `commons.wikimedia.org` and `upload.wikimedia.org`. Proven workaround:

1. `WebSearch` for `"Wikimedia Commons [subject] [location] image"` — returns file names and Flickr photo IDs
2. Get the Flickr photo ID from search results (e.g., `51325436663`)
3. `curl -s -L "https://www.flickr.com/photo.gne?id=[PHOTO_ID]"` — fetches the photo page
4. Extract the static URL with regex: `https://live.staticflickr.com/\d+/\d+_[a-f0-9]+_b\.jpg`
5. `curl -s -L -o /tmp/image.jpg "[STATIC_URL]"` — download the image
6. Convert to WebP with Python Pillow (available in sandbox):
   ```python
   from PIL import Image
   img = Image.open('/tmp/image.jpg')
   if img.width > 1200:
       ratio = 1200 / img.width
       img = img.resize((1200, int(img.height * ratio)), Image.LANCZOS)
   img.save('/path/to/port-N.webp', 'WebP', quality=80)
   ```
7. Create the `-attr.json` file alongside the image (see existing examples)
8. Be careful with Flickr rate limiting — pause between requests

### 3. Convert and store

- Convert downloaded images to **WebP** (unless transparency required → then PNG)
- Save to the appropriate folder:
  - Ships → `/assets/ships/`
  - Ship thumbnails → `/assets/ships/thumbs/`
  - Ports → `/assets/ports/` or `/ports/img/[port-slug]/`
  - Venues → `/assets/restaurants/`

### 4. Add attribution

- Add/update the attribution block on the relevant page
- Append a row to `/attributions/attributions.csv`:
  - Page/slug
  - File name
  - Author name and URL
  - License name and URL
  - Source (WikiMedia, Unsplash, Pexels, Pixabay, Flickr, etc.)

### 5. If NO free source has a usable image

- **Do NOT use a placeholder image.** Placeholder images are a BLOCKING ERROR on any page.
- Omit the image entirely or hide the image container for that entity.
- Mark in `admin/UNFINISHED_TASKS.md`: "NEEDS REAL IMAGE – all free sources searched, nothing found."

---

## Image Attribution Patterns

**REQUIRED:** All Wiki Commons images must include an attribution section on the page:

```html
<!-- Attribution Section (before </main>) -->
<section class="attribution">
  <h3>Image Credits</h3>
  <p>The following images are used under Creative Commons licenses:</p>
  <ul>
    <li><strong>Ship Name:</strong> Photo by <a href="[author URL]" target="_blank" rel="noopener">[Author Name]</a>, used under <a href="[license URL]" target="_blank" rel="noopener">[License]</a></li>
  </ul>
</section>
```

**Figcaption for swiper images:**
```html
<figcaption>Photo served locally (attribution in page footer).</figcaption>
```

**Track in:** `/attributions/attributions.csv`

---

*Soli Deo Gloria*
