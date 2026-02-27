# Plan: Venue Photos — From Rough Shots to Production Pages

> Branch: `claude/explore-venue-photos-OeAgM`
> Date: 2026-02-27
> Status: **Planning**

---

## Goal

Take rough photos you've taken of specific cruise ship venues, clean them up (crop, resize, convert to WebP), and integrate them as:
1. **Card thumbnails** on the Explore Venues page (`restaurants.html`) — replacing generic stock images
2. **Section images** on individual venue HTML pages — replacing the repeated stock photos

---

## Current State

### Explore page (`restaurants.html`)
- Venue cards are rendered **dynamically** by `assets/js/restaurants-dynamic.js`
- Card images are chosen from a `VENUE_IMAGES` map (slug → image path)
- Currently **9 generic stock photos** cycle across all 472 venues:
  - `formal-dining.webp`, `buffet.webp`, `cocktail-lounge.webp`, `cocktail.webp`, `croissant.webp`, `hotdog.webp`, `italian.webp`, `pizza.webp`, `sushi.webp`, `tacos.webp`, `bar-lounge.webp`
- Fallback: `formal-dining.webp` for any unmapped slug

### Individual venue pages (e.g., `restaurants/chops.html`)
- Images appear as **decorative watermarks** (`opacity: .08`) behind Logbook and FAQ sections
- Use the same stock photos (e.g., `formal-dining.webp`, `bar-lounge.webp`)
- No prominent venue-specific hero or section images exist today

### Image standards
- **All WebP** — 0 JPG/JPEG in the project (enforced since 2026-01-31)
- No placeholder images allowed (BLOCKING ERROR per skill-rules.json)
- Proper `alt` text required (WCAG AA)
- `loading="lazy"` on below-fold images, `decoding="async"` standard

---

## Implementation Plan

### Phase 1: Photo Processing Pipeline

**Step 1.1 — Receive & inventory the photos**
- You'll add your rough photos to a staging directory (suggest: `assets/images/restaurants/originals/`)
- I'll inventory them: map each photo to a venue slug, note aspect ratio, quality issues

**Step 2.2 — Build a processing script**
Create `admin/process-venue-photos.py` that:
- Reads from `assets/images/restaurants/originals/`
- For each photo:
  - **Crops** to 16:9 aspect ratio (matching `.item-card-image { aspect-ratio: 16/9 }`)
  - **Resizes** to 2 variants:
    - `720w` — card thumbnail (360px card × 2x retina = 720px)
    - `1200w` — full-width section image for venue pages
  - **Converts** to WebP (quality 82, matching project's existing `convert_to_webp.py` settings)
  - **Outputs** to `assets/images/restaurants/photos/venues/` with naming: `{venue-slug}-720w.webp`, `{venue-slug}-1200w.webp`
- Generates a manifest JSON listing processed photos and their venue mappings

**Step 1.3 — Manual review checkpoint**
- Before going further, you review the processed photos
- Adjust crop, brightness, rotation if needed
- Re-run script on adjusted originals

### Phase 2: Integrate into Explore Page (restaurants.html)

**Step 2.1 — Update `VENUE_IMAGES` map in `restaurants-dynamic.js`**
- For each venue that has a real photo, add/update its entry:
  ```js
  'chops': '/assets/images/restaurants/photos/venues/chops-720w.webp',
  ```
- Venues without real photos keep their current generic image mapping
- No structural changes to the card rendering logic needed — just data changes

**Step 2.2 — Add srcset for retina support (optional enhancement)**
- Currently the card `<img>` has no `srcset`
- Could add `srcset` with `720w` and `360w` variants for bandwidth savings
- **Decision point**: do this now or defer? Suggest defer — it requires modifying `createVenueCard()` and is a separate concern

### Phase 3: Integrate into Individual Venue Pages

**Step 3.1 — Replace decorative watermarks with real section images**
For each venue that has a real photo, update its HTML page:

**Current pattern** (decorative watermark):
```html
<section class="card" id="logbook">
  <img src="/assets/images/restaurants/photos/formal-dining.webp" alt="" aria-hidden="true"
       style="position:absolute;inset:0;margin:auto;opacity:.08;max-width:60%;pointer-events:none">
```

**New pattern** (real venue photo as section image):
```html
<section class="card" id="overview">
  <!-- Venue Photo -->
  <figure class="venue-photo">
    <img src="/assets/images/restaurants/photos/venues/chops-1200w.webp"
         alt="Interior of Chops Grille steakhouse on Royal Caribbean"
         width="1200" height="675" loading="lazy" decoding="async"/>
    <figcaption class="tiny muted">Photo by Ken Baker · Chops Grille aboard [Ship Name]</figcaption>
  </figure>
```

**Key decisions:**
- Place the real photo in the **Overview section** (top of page, most visible)
- Keep the watermark images in Logbook/FAQ as they are (decorative, low opacity)
- Use `<figure>` + `<figcaption>` for proper semantics and attribution
- Write real, descriptive alt text per venue (not generic)

**Step 3.2 — Add minimal CSS for `.venue-photo`**
Add to `assets/styles.css` (or a new `assets/css/venue-photo.css`):
```css
.venue-photo {
  margin: 0 0 1.5rem;
  border-radius: 10px;
  overflow: hidden;
}
.venue-photo img {
  width: 100%;
  height: auto;
  display: block;
}
.venue-photo figcaption {
  padding: 0.5rem 0;
  text-align: center;
}
```

**Step 3.3 — Update meta tags**
For each modified venue page:
- Update `last-reviewed` and `dateModified` to today's date
- Update `og:image` and `twitter:image` to use the real photo URL

### Phase 4: Validation & Cleanup

- Run venue validator: `node admin/validate-venue-page-v2.js --batch restaurants/`
- Spot-check 3 modified pages visually
- Verify no broken images
- Commit and push

---

## File Changes Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `admin/process-venue-photos.py` | **NEW** | Photo processing script (crop, resize, WebP convert) |
| `assets/images/restaurants/originals/` | **NEW DIR** | Raw photos staging area |
| `assets/images/restaurants/photos/venues/` | **NEW DIR** | Processed venue-specific photos |
| `assets/js/restaurants-dynamic.js` | **EDIT** | Update `VENUE_IMAGES` entries for venues with real photos |
| `assets/styles.css` or new CSS | **EDIT** | Add `.venue-photo` styles |
| `restaurants/{venue}.html` (×N) | **EDIT** | Add `<figure>` with real photo, update dates, update og:image |

---

## What I Need From You

1. **The photos** — Add your rough photos to the repo (or tell me where they are). Any format is fine (JPG, PNG, HEIC) — the script will convert.
2. **Venue mapping** — Which photo goes with which venue? (e.g., "this one is Chops on Oasis of the Seas")
3. **Ship names** — For the figcaptions, which ship were you on when you took each photo?
4. **Crop preferences** — Any specific framing you want preserved? The default will be center-crop to 16:9.

---

## Open Questions

1. **Photo credit format**: "Photo by Ken Baker" or "Photo by Flickers of Majesty" or something else?
2. **Do you want the originals committed to the repo?** They'll be larger files. Alternative: only commit the processed WebP versions.
3. **Python dependencies**: The processing script will need `Pillow` (PIL). Is that acceptable, or should I use a different approach (e.g., `cwebp` CLI tool)?

---

*Soli Deo Gloria*
