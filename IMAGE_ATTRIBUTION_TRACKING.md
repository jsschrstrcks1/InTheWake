# Ship Image Attribution Tracking

**Last Updated:** 2025-11-16

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

## Ships Needing Attribution Updates

### ✅ Correct Attribution (Reference Example)
**Radiance of the Seas** - Has proper Wiki Commons attributions:
- 3 Wiki Commons images properly attributed with author, file URL, license
- FOM images properly attributed

---

### ⚠️ Placeholder/Incorrect Attributions (Need Update)

**Symphony of the Seas**
- **Images used:**
  - symphony-of-the-seas1.jpeg
  - symphony-of-the-seas2.jpg
  - symphony-of-the-seas3.jpg
- **Current status:** Has placeholder attributions (wrong ship references)
- **Action needed:** Replace with actual Wiki Commons attribution for uploaded images

**Adventure of the Seas**
- **Images used:** User uploaded (unknown filenames)
- **Current status:** Has placeholder attributions referencing wrong images
- **Action needed:** Get proper Wiki Commons URLs and attributions from user

**Enchantment of the Seas**
- **Images uploaded:**
  - 2560px-Bahamas_Cruise_-_CocoCay_-_June_2018_(3390).jpg
  - 2560px-BOS_at_Valetta_121410.JPG
  - Bahamas_Cruise_-_ship_exterior_-_June_2018_(2140).jpg
  - Bahamas_Cruise_-_ship_exterior_-_June_2018_(3251).jpg
  - Enchantment_of_the_Seas.jpg
- **Current status:** Probably has placeholder attributions
- **Action needed:** Add proper Wiki Commons attributions for these 5 images

**Explorer of the Seas**
- **Images used:** User uploaded (unknown filenames)
- **Current status:** Unknown
- **Action needed:** Get proper Wiki Commons URLs and attributions

---

### ❌ Ships Missing Attribution Section Entirely

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

---

## TODO

- [ ] Get Wiki Commons URLs for Symphony of the Seas images (3 images)
- [ ] Get Wiki Commons URLs for Adventure of the Seas images
- [ ] Get Wiki Commons URLs for Enchantment of the Seas images (5 images)
- [ ] Get Wiki Commons URLs for Explorer of the Seas images
- [ ] Update attribution sections with correct data
- [ ] Add attribution sections to nordic-prince and sun-viking when images are added
