# Plan: Venue Photos — From Rough Shots to Production Pages

> Branch: `claude/explore-venue-photos-OeAgM`
> Date: 2026-02-27
> Status: **Phase 1 complete** (script, config, CSS, directories built)

---

## Goal

Take rough photos of specific cruise ship venues, process them through a computational photography pipeline (straighten, perspective correct, auto-level, white balance, subject-aware crop, sharpen), and integrate as:
1. **Card thumbnails** on the Explore Venues page (`restaurants.html`) — replacing generic stock images
2. **Section images** on individual venue HTML pages — in the Overview section with proper attribution

---

## Decisions Made

| Question | Decision |
|----------|----------|
| Photo credit | "Photo © Flickers of Majesty" |
| Originals in repo? | No — only processed WebP committed. Originals/.gitignore'd |
| Processing toolkit | OpenCV + Pillow (smart defaults + per-photo config overrides) |
| Workflow | Smart defaults → you review → we refine per-photo config → re-process |
| Card aspect ratio | 16:9 (matches `.item-card-image { aspect-ratio: 16/9 }`) |
| Output sizes | 720w (card thumbnail), 1200w (venue page section) |

---

## Current State

### What's built (Phase 1 — complete)

| File | Status | Purpose |
|------|--------|---------|
| `admin/process-venue-photos.py` | ✅ Built | Full processing pipeline with OpenCV + Pillow |
| `assets/images/restaurants/venue-photo-config.json` | ✅ Built | Per-photo override config (wonderland pre-seeded) |
| `assets/images/restaurants/originals/` | ✅ Created | Staging dir for raw photos (.gitignore'd) |
| `assets/images/restaurants/photos/venues/` | ✅ Created | Output dir for processed WebP files |
| `assets/images/restaurants/previews/` | ✅ Created | Before/after preview dir (.gitignore'd) |
| `assets/styles.css` (`.venue-photo`) | ✅ Added | CSS for venue photo figures in page content |
| `.gitignore` | ✅ Updated | Excludes originals/ and previews/ |

### Processing pipeline capabilities

1. **Auto-straighten** — Hough line detection → median angle → rotation correction
2. **Perspective correction** — Vertical line analysis → keystone fix
3. **Auto-levels** — Histogram stretch (0.5% clip on each end)
4. **White balance** — Gray-world algorithm
5. **Warmth shift** — Configurable cool↔warm color temperature
6. **Noise reduction** — Bilateral filter (edge-preserving)
7. **Subject-aware smart crop** — Edge density + color saturation + center bias → 16:9
8. **Brightness/contrast/saturation** — Per-photo PIL adjustments
9. **Sharpening** — Unsharp mask after resize
10. **WebP export** — Quality 82, method 6

### Per-photo config overrides

Any parameter can be overridden per venue in `venue-photo-config.json`:
```json
{
  "wonderland": {
    "warmth": 0.15,
    "saturation": 1.08,
    "crop_bias": "center",
    "brightness": 1.05,
    "straighten_override": -1.5,
    "crop_override": [10, 5, 80, 90]
  }
}
```

### Usage

```bash
# List originals and their processing status
python3 admin/process-venue-photos.py --list

# Process all photos (batch)
python3 admin/process-venue-photos.py

# Process single photo
python3 admin/process-venue-photos.py --photo wonderland

# Generate before/after preview for review
python3 admin/process-venue-photos.py --preview

# Show current config
python3 admin/process-venue-photos.py --config
```

---

## Remaining Phases

### Phase 2: Process first photo (Wonderland)

**Waiting on:** Photo file placed in `assets/images/restaurants/originals/wonderland.jpg`

Once placed:
1. Run `python3 admin/process-venue-photos.py --photo wonderland --preview`
2. Review the before/after preview
3. Adjust config if needed, re-run
4. When happy, proceed to integration

### Phase 3: Integrate into Explore Page

Update `VENUE_IMAGES` map in `assets/js/restaurants-dynamic.js`:
```js
'wonderland': '/assets/images/restaurants/photos/venues/wonderland-720w.webp',
```

### Phase 4: Integrate into Venue Page

Update `restaurants/wonderland.html`:
- Add `<figure class="venue-photo">` in the Overview section
- Credit: "Photo © Flickers of Majesty · Wonderland aboard [Quantum Class ship]"
- Alt text: descriptive, venue-specific
- Update `last-reviewed`, `dateModified`, `og:image`, `twitter:image`

### Phase 5: Repeat for additional photos

As more photos come in, repeat Phases 2-4 per venue.

---

## First photo: Wonderland

- **Ship:** Quantum Class
- **Subject:** Restaurant entrance — throne chair, red rose sculpture, "Wonderland" signage
- **Credit:** Photo © Flickers of Majesty
- **Config:** Slight warmth (+0.15), gentle saturation boost (+1.08)

---

*Soli Deo Gloria*
