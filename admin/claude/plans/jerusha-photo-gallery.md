# Jerusha page — photo gallery plan

**Status:** Planned. Not built yet.
**Target:** `admin/weather-jerusha.html` (static, client-side AES-GCM page; passphrase set out-of-band).
**Decision (locked):** photos live in a **repo folder I wire in** — they ship with the page, show on all her devices, survive reinstall. Scope of content expansion: all stops, researched + cited (separate task).
**Last updated:** 2026-06-17

---

## How it works (serverless, encrypted page)

There is no server, so "upload" = add files to the repo + I re-wire the manifest. Two layers:

- **Image files:** `admin/jerusha-gallery/` in the repo, as **WebP** (repo rule: no new JPEG). Two sizes per photo — a thumb (~400 px) and a full (~1600 px). EXIF GPS stripped on conversion (privacy). Filenames: `NN-stop-slug.webp` (e.g. `03-sitka-totem-trail.webp`). Images are **not encrypted** — they sit in the private repo and are shown after unlock. (Captions/structure *are* encrypted — see manifest.)
- **Manifest:** a JS array **inside the encrypted payload**, so captions and the day/stop mapping stay behind the passphrase:
  ```js
  var GALLERY=[
    {src:"03-sitka-totem-trail", day:3, stop:"Sitka, AK", cap:"Totem Trail, Sitka NHP", alt:"Carved Tlingit totem pole among spruce"},
    ...
  ];
  ```
  `src` resolves to `admin/jerusha-gallery/<src>.webp` (full) and `<src>-t.webp` (thumb).

CSP already allows this: `img-src 'self' data: https:` covers `/admin/jerusha-gallery/`. **No CSP change, no external library** (Leaflet is the only CDN dep; the lightbox is tiny inline vanilla JS).

## UI

- **New tab "Gallery"** (`data-t="gallery"`, pane `pane-gallery`), beside Now / Voyage / 10-Day / Radar / Futurecast / Alerts.
- **Grid** of lazy-loaded thumbnails (`loading="lazy"`), newest or day-ordered; optional day/stop filter chips.
- **Lightbox** on tap: full image + caption, prev/next, Esc to close. Accessible — focus trap, `aria-modal`, arrow-key nav, `alt` from manifest (WCAG 2.1 AA, per repo standard).
- **Per-day tie-in (optional):** in the Voyage tab, a day with photos shows a small thumbnail strip that opens the gallery filtered to that day.
- **Empty state:** "No photos yet" — never a broken grid.

## Upload workflow (each batch of new photos)

1. You drop originals (JPG/HEIC/PNG) in a folder or send them to me, with a one-line caption + which day each belongs to.
2. I convert → WebP (thumb + full), resize, **strip EXIF GPS**, write to `admin/jerusha-gallery/`.
3. I add manifest entries, then **decrypt → inject manifest → re-encrypt** the page (fresh IV; passphrase unchanged) and commit.
4. Round-trip verified each time (decrypt matches, JS parses, SDG intact, no banned strings) — same discipline as the radar/route edits.

So: adding photos is a quick re-encrypt cycle on my side; you just supply the images + captions.

## Privacy notes

- Images are unencrypted inside the **private** repo. The sensitive text (affirmations) stays encrypted; trip photos are lower-sensitivity, but flagging it so it's a conscious choice.
- EXIF GPS/location stripped on every conversion.
- Future option (not now): encrypt the image blobs too and decrypt client-side after unlock — heavier, deferred.

## Build order when greenlit

1. Add `pane-gallery` + the Gallery tab; wire `setTab`/`refresh` to a `loadGallery()` renderer (grid + lightbox); CSS for grid/lightbox.
2. Create `admin/jerusha-gallery/` with the first real photos (need images from you).
3. Wire the manifest, re-encrypt, verify, commit.
4. (Optional) per-day thumbnail strips in the Voyage tab.
