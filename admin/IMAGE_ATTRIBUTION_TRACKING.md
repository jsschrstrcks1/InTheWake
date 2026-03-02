# Ship Image Attribution Tracking

**Last Updated:** 2026-01-30

## Attribution Requirements

Every image used on ship pages MUST have proper attribution:

### For Wikimedia Commons Images:
```html
<section class="card attributions">
  <h2>Image Attributions</h2>
  <ul>
    <li>
      "[Image Title/Description]" by <a href="[Wiki Commons User URL]" target="_blank" rel="noopener">[Author Name]</a> via
      <a href="[Wiki Commons File URL]" target="_blank" rel="noopener">Wikimedia Commons</a> —
      licensed under <a href="[License URL]" target="_blank" rel="noopener">[License Type]</a>.
    </li>
  </ul>
</section>
```

### For FOM (Flickers of Majesty) Images:
```html
<li>
  Ship photography licensed from <a href="https://www.flickersofmajesty.com" target="_blank" rel="noopener">Flickers of Majesty</a>
  (<a href="https://www.instagram.com/flickersofmajesty" target="_blank" rel="noopener">@flickersofmajesty</a>).
</li>
```

### In Swiper Figcaptions:
```html
<!-- For Wiki Commons images: -->
<figcaption class="tiny">Photo served locally (attribution in page footer).</figcaption>

<!-- For FOM images: -->
<figcaption class="tiny">Licensed from <a href="https://www.flickersofmajesty.com" target="_blank" rel="noopener">Flickers of Majesty</a>.</figcaption>
```

---

## Automated Image Fetcher

Images are fetched from **Wikimedia Commons** using the automated script:

```bash
# Fetch images for a single ship
python3 admin/fetch-wiki-ship-images.py "Ship Name" --cruise-line rcl --max 6

# Batch fetch from a JSON list
python3 admin/fetch-wiki-ship-images.py --batch admin/priority-ships-for-images.json --max 6
```

The fetcher:
1. Searches Wikimedia Commons API for ship images
2. Filters by acceptable licenses (CC BY, CC BY-SA, CC0, Public Domain, GFDL)
3. Checks minimum image dimensions (800x400)
4. Downloads to `/assets/ships/`
5. Generates per-ship attribution JSON in `/assets/ships/{ship-slug}-wiki-attributions.json`

The HTML updater adds images and attributions to ship pages:
```bash
node admin/update-ship-pages-with-wiki-images.js
```

---

## Ships with Wikimedia Commons Images (2026-01-30 Batch)

### Royal Caribbean International (RCL)

| Ship | Images | Licenses |
|------|--------|----------|
| **Adventure of the Seas** | 4 | CC BY-SA 4.0, CC BY-SA 3.0, CC BY 4.0 |
| **Anthem of the Seas** | 4 | CC BY-SA 4.0 |
| **Brilliance of the Seas** | 6 | CC BY 4.0, CC BY 3.0, CC BY-SA 3.0, CC BY-SA 4.0 |
| **Explorer of the Seas** | 4 | CC BY-SA 4.0, CC BY 2.0 |
| **Harmony of the Seas** | 4 | CC BY 4.0, CC BY-SA 4.0, CC BY-SA 3.0 |
| **Independence of the Seas** | 6 | CC BY-SA 4.0, CC BY 4.0, CC BY-SA 2.0 |
| **Legend of the Seas** | 4 | Public domain, CC BY 2.0, CC BY-SA 3.0 |
| **Quantum of the Seas** | 6 | CC BY-SA 4.0, CC BY 4.0, CC BY 2.0 |
| **Rhapsody of the Seas** | 6 | CC BY-SA 3.0, CC BY 2.0, CC BY-SA 2.0 |
| **Serenade of the Seas** | 6 | CC BY 4.0, CC BY-SA 3.0, CC BY 3.0, CC0 |
| **Symphony of the Seas** | 6 | CC BY-SA 4.0, CC BY 4.0, CC BY 2.0 |
| **Utopia of the Seas** | 6 | CC BY-SA 4.0, CC0 |
| **Vision of the Seas** | 6 | CC BY-SA 4.0, CC BY 2.0, CC BY 4.0 |
| **Voyager of the Seas** | 4 | CC BY 4.0, CC BY-SA 3.0, CC BY 2.0 |

### Carnival Cruise Line

| Ship | Images | Licenses |
|------|--------|----------|
| **Carnival Celebration** | 4 | CC BY-SA 4.0, CC BY-SA 2.0 |
| **Carnival Conquest** | 4 | CC BY-SA 3.0, CC BY 2.0, CC BY-SA 2.0 |
| **Carnival Dream** | 4 | CC BY-SA 3.0, CC BY-SA 4.0, CC BY 2.0 |
| **Carnival Freedom** | 4 | CC BY-SA 4.0, CC BY-SA 3.0, CC BY 4.0 |
| **Carnival Glory** | 4 | CC BY-SA 4.0, Public domain |
| **Carnival Horizon** | 4 | CC BY-SA 4.0, CC BY 2.0 |
| **Carnival Jubilee** | 6 | CC BY-SA 4.0, CC BY 2.0 |
| **Carnival Liberty** | 4 | CC BY-SA 4.0, CC BY 4.0, CC0 |
| **Carnival Miracle** | 4 | CC BY-SA 3.0, CC BY-SA 4.0, CC BY 4.0, CC BY 3.0 |
| **Carnival Panorama** | 4 | CC BY-SA 4.0, CC0, CC BY 2.0 |
| **Carnival Valor** | 4 | CC BY 2.0, CC0 |

### Celebrity Cruises

| Ship | Images | Licenses |
|------|--------|----------|
| **Celebrity Millennium** | 4 | CC BY-SA 2.0, CC BY-SA 4.0, CC BY 2.0 |

### Explora Journeys

| Ship | Images | Licenses |
|------|--------|----------|
| **Explora I** | 4 | CC BY-SA 4.0 |

### Holland America Line

| Ship | Images | Licenses |
|------|--------|----------|
| **Nieuw Amsterdam** | 4 | CC BY-SA 4.0, CC BY 2.0, CC0 |

**Total: 27 ships updated with 127 Wikimedia Commons images**

---

## Detailed Attribution Records

Full attribution data for each ship is stored as JSON in:
```
/assets/ships/{ship-slug}-wiki-attributions.json
```

Each JSON file contains:
- Ship name and cruise line
- Fetch timestamp
- Per-image: filename, path, Wikimedia Commons source URL, artist, license, license URL, original title, and description

---

## Ships with Existing FOM (Flickers of Majesty) Attribution

The following ships have properly attributed FOM images:
- Radiance of the Seas
- Harmony of the Seas
- Brilliance of the Seas
- Most RCL ships with `-FOM-` prefixed image files

---

## Ships Still Needing Attribution Updates

### Placeholder/Incorrect Attributions

**Enchantment of the Seas**
- **Images uploaded:**
  - 2560px-Bahamas_Cruise_-_CocoCay_-_June_2018_(3390).jpg
  - 2560px-BOS_at_Valetta_121410.JPG
  - Bahamas_Cruise_-_ship_exterior_-_June_2018_(2140).jpg
  - Bahamas_Cruise_-_ship_exterior_-_June_2018_(3251).jpg
  - Enchantment_of_the_Seas.jpg
- **Action needed:** Add proper Wiki Commons attributions for these 5 images

### Ships Missing Attribution Section Entirely

1. **discovery-class-ship-tbn** - Future ship (no images needed)
2. **nordic-prince** - Historic ship, no swiper yet
3. **oasis-class-ship-tbn-2028** - Future ship (no images needed)
4. **sun-viking** - Historic ship, no swiper yet

---

## Attribution Workflow

### When Adding Images to a Ship Page:

1. **Get Wiki Commons details:**
   - Image file URL (e.g., `https://commons.wikimedia.org/wiki/File:Ship_Name.jpg`)
   - Author name and user URL
   - License type (CC BY, CC BY-SA, CC BY 2.0, etc.)
   - License URL

2. **Add to swiper with figcaption:**
   ```html
   <div class="swiper-slide">
     <figure>
       <img src="/assets/ships/[filename].webp?v=3.006" alt="[Description]" loading="lazy">
       <figcaption class="tiny">Photo served locally (attribution in page footer).</figcaption>
     </figure>
   </div>
   ```

3. **Add to attribution section (before closing `</main>`):**
   ```html
   <section class="card attributions">
     <h2>Image Attributions</h2>
     <ul>
       <li>
         "[Image Description]" by <a href="https://commons.wikimedia.org/wiki/User:[Username]" target="_blank" rel="noopener">[Author Name]</a> via
         <a href="https://commons.wikimedia.org/wiki/File:[Filename]" target="_blank" rel="noopener">Wikimedia Commons</a> —
         licensed under <a href="https://creativecommons.org/licenses/[license-type]" target="_blank" rel="noopener">[License Name]</a>.
       </li>
       <!-- Add FOM attribution if applicable -->
       <li>
         Ship photography licensed from <a href="https://www.flickersofmajesty.com" target="_blank" rel="noopener">Flickers of Majesty</a>
         (<a href="https://www.instagram.com/flickersofmajesty" target="_blank" rel="noopener">@flickersofmajesty</a>).
       </li>
     </ul>
   </section>
   ```

---

## Common License URLs

- **CC BY 2.0:** `https://creativecommons.org/licenses/by/2.0/`
- **CC BY 3.0:** `https://creativecommons.org/licenses/by/3.0/`
- **CC BY 4.0:** `https://creativecommons.org/licenses/by/4.0/`
- **CC BY-SA 2.0:** `https://creativecommons.org/licenses/by-sa/2.0/`
- **CC BY-SA 3.0:** `https://creativecommons.org/licenses/by-sa/3.0/`
- **CC BY-SA 4.0:** `https://creativecommons.org/licenses/by-sa/4.0/`
- **CC0 1.0:** `https://creativecommons.org/publicdomain/zero/1.0/`

---

## TODO

- [ ] Add proper Wiki Commons attributions for Enchantment of the Seas (5 images)
- [ ] Add attribution sections to nordic-prince and sun-viking when images are added
- [ ] Fetch images for remaining stub ship pages as they are developed
- [ ] Run `python3 admin/fetch-wiki-ship-images.py` for newly added ships
