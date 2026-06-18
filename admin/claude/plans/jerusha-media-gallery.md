# Jerusha page — upload your own photos & videos (shared, E2EE)

**Status:** Planned, not built. Decision locked: **shared + end-to-end encrypted**
(only the passphrase can view). Extends the gallery beyond the 19 stock Wikimedia
shots so Ken can add his own cruise photos **and videos**, and Jerusha sees them.
**Last updated:** 2026-06-18

---

## The reality videos force: KV is not enough → use R2

Notes/location fit in KV (small values). **Videos do not** — Cloudflare KV caps a
value at 25 MB, and a single phone video clip routinely exceeds that. Photos fit;
videos don't. So media goes in **Cloudflare R2** (object storage, no per-object 25 MB
limit, generous free tier ~10 GB), with only small **encrypted metadata** in KV.

One consistent path for both: photos and videos are encrypted blobs in R2.

```
Add photo/video → downscale photo (canvas) / keep video as-is → AES-GCM encrypt
   (page key, chunked) → PUT ciphertext to R2 via worker → metadata {id,kind,ts}
   in KV (encrypted caption).
Gallery load → list metadata → for each, GET ciphertext from R2 → decrypt →
   blob URL → <img>/<video> slide (newest of Ken's first), then the 19 stock shots.
```

## Encryption (same trust model as the notes)

- Reuse the page's AES-GCM key (PBKDF2 from the passphrase, the `_notesKey()` the
  notes already use). Worker + R2 are **zero-knowledge** — only ciphertext leaves
  the device; a leaked bucket reveals nothing without the passphrase.
- Large files: **chunked** AES-GCM (e.g. 1–4 MB chunks, each its own IV) so we never
  hold the whole encrypted blob in memory at once. A small JSON header lists chunk
  IVs + sizes; the worker stores the concatenated ciphertext as one R2 object.
- Render: decrypt to a **Blob**, `URL.createObjectURL` → `<img>` / `<video controls>`.

## Worker (additions; reuses bearer + origin gate)

- `POST /media` — body = ciphertext (octet-stream) + an `X-Meta` header (or a JSON
  envelope) with `{id, kind:"photo"|"video", iv-header, ct-len}`. Streams the body to
  R2 at `media/<id>`; writes KV `media:<ts>-<id>` = `{v,id,kind,ts,hdr}` (hdr =
  encrypted chunk header). Size cap (e.g. 200 MB video / 15 MB photo).
- `GET /media` — returns the metadata list (no bytes).
- `GET /media/<id>` — streams the R2 ciphertext object back.
- `DELETE /media/<id>` — removes the R2 object + KV metadata (so Ken can curate).
- **R2 binding** `MEDIA` added to `wrangler.toml`.

## Page (gallery tab)

- An **"➕ Add photo / video"** control (file input, `accept="image/*,video/*"`).
  Photos are downscaled (canvas → WebP ~1600 px) before encrypt; videos uploaded
  as-is under the size cap. Progress + "uploading…" status; offline → queue.
- Uploaded media render as Swiper slides ahead of the stock 19, captioned
  "Added by Ken · <date>", with a small **delete** control on each (his own page).
- Lazy: fetch + decrypt each item as its slide approaches, cache the blob URL.

## CSP change (gate shell + payload)

- `img-src` add `blob:`; add `media-src 'self' blob:`. The **gate** CSP is the
  effective one (document.write trap), so edit it there too — a plaintext one-liner.

## R2 setup (one-time, Ken)

```
wrangler r2 bucket create jerusha-media
# add to wrangler.toml:  [[r2_buckets]]  binding="MEDIA"  bucket_name="jerusha-media"
wrangler deploy
```
R2 free tier (10 GB storage, 1M Class-A ops/mo) covers a personal trip gallery at
no cost.

## Photos on the map, by day (requested 2026-06-18)

Goal: on the **radar/map** tab, tapping a day marker shows the photos/videos
**taken there or near there**. To make that possible, every upload is **geotagged**:

- **Metadata carries `lat`, `lon`, `day`.** Captured at upload, best-effort, in this
  order: (1) the photo's own EXIF GPS if readable; (2) else the device's current
  `navigator.geolocation` fix; (3) else none. `day` = the matching itinerary day
  (from the photo's date, else the current voyage day). The worker `/media` already
  stores these fields.
- **Map interaction:** each itinerary day marker becomes tappable; tapping it filters
  the media to that day (and/or within ~25 km of that day's port via `lat/lon`) and
  opens a small viewer — a popup strip or the gallery's media swiper scoped to that day.
- **Fallback:** media with no geo still appear in the gallery's "Our trip" section;
  they just don't pin to a day on the map.
- This rides the same encrypted `/media` store — the map only reads metadata to decide
  which items to show, then decrypts them the same lazy way the gallery does.

## Build order

1. R2 bucket + binding + CSP `blob:` (gate+payload).
2. Worker `/media` POST/GET/GET-id/DELETE against R2 (with lat/lon/day metadata). ✓
3. Page: add control, encrypt + upload (capture geo: EXIF → geolocation → day),
   lazy decrypt + render, delete.
4. Photos first (simpler, smaller), then videos (size cap + `<video>`).
5. **Map-by-day:** make day markers tappable → show that day's geotagged media.

## Honest caveats

- Client-side encryption of big videos is memory-sensitive — chunking required; very
  large clips (>~200 MB) should be rejected with a friendly message, not crash.
- No server-side transcode — a video uploads in whatever format the phone shot it;
  playback depends on the viewing browser supporting that codec (H.264/MP4 is safest).
- E2EE means lost passphrase = unrecoverable media (same trade as the notes).
