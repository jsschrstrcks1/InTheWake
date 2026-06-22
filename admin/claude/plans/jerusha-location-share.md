# Jerusha page — live location share (your travel breadcrumb)

**Status:** Planned. Not built. Rides the same Cloudflare Worker + KV as the
notes relay ([`jerusha-write-back.md`](jerusha-write-back.md)) and push
([`jerusha-pwa-push.md`](jerusha-pwa-push.md)). New build order entry: **Slice 4**
(see `../../jerusha-worker/README.md`).
**Target page:** `admin/weather-jerusha.html` (renders on the existing Leaflet
radar map, inside the encrypted payload).
**Goal:** Jerusha can open the page and see roughly where you are — a 10-day
trail of your phone's location, drawn on the same map that already shows the
ship route. As you travel (flights, transfers, the cruise), the trail extends.
**Last updated:** 2026-06-18

---

## The load-bearing reality (read first)

**A web page cannot relay your location in the background.** The browser
Geolocation API (`getCurrentPosition` / `watchPosition`) only runs while the
page is *open and foregrounded*. The moment your phone locks or you switch apps,
it stops. There is no web API — on iOS or Android — that lets a website report
GPS while it's closed. So the Jerusha page on **your** phone cannot be the
location source. It can only be the **viewer** (on her phone).

The source has to be a small **background location reporter** on your phone that
POSTs coordinates to the Worker. That is a separate app, not web code.

### Recommended source: OwnTracks (free, open-source, iOS + Android)

- Configure OwnTracks in **HTTP mode** to POST to the Worker `/loc` endpoint. **Auth — use the
  query-param form, it is bulletproof across app versions/platforms:** set the URL to
  `https://<worker>/loc?k=<NOTES_TOKEN>` (URL-encode the token). *(The worker also accepts HTTP
  Basic — username anything, password = the token — and a `Bearer` header. But OwnTracks on iOS
  generally **cannot set a custom `Bearer` header**, so do NOT rely on Bearer; the earlier note here
  was wrong and is the likely cause of a silent 401. Use `?k=` or Basic.)*
- **Move/cadence:** "significant change" or a fixed interval (e.g. every 15–30
  min) is plenty and battery-friendly. No need for high-frequency tracking.
- It runs in the background using the OS location-permission model (the same one
  Maps uses), which is exactly the thing a website can't do.
- One-time setup on your phone before the trip; nothing to babysit after.

**Alternatives considered (and why not):**
- *iOS Shortcuts personal automation* — can't run on a reliable background timer;
  no true periodic background fire. Manual-only.
- *Tasker* (Android) — works, but Android-only and more fiddly than OwnTracks.
- *Google Maps "share location"* — can't be fed into our own map; it's a
  walled link, and points it at Google, not at the page. Defeats the purpose.

If you'd rather not install OwnTracks, the fallback is **manual**: a "drop my
location now" button on *your* copy of the page that captures one fix while
open and POSTs it. Honest tradeoff — it only updates when you remember to open
the page and tap, so the trail is sparse. Documented as the no-app option.

---

## Architecture

```
Your phone (OwnTracks, background) ──POST /loc {lat,lon,ts}──▶ Worker ──▶ KV (one key per fix, 10-day TTL)
Her page (radar map) ◀── GET /loc?since= ◀──                         (breadcrumb polyline + "here now" marker)
```

- **Source:** OwnTracks on your phone → `POST /loc`. Bearer token (same bot-filter
  model as `/notes`), origin **not** enforced on `/loc` (the reporter app has no
  browser Origin header — auth is the token + a tight body schema instead).
- **Worker:** validates token + shape + a sane coordinate range, writes one KV
  record per fix with a **10-day TTL** (KV native expiry — auto-prunes, no cron
  needed). `GET /loc?since=` returns fixes for the map.
- **Page:** the radar map already draws the planned ship route (cyan). Add a
  **second, warm-gold** polyline for your *actual* track + a pulsing "here now"
  marker at the latest fix, with the time in both zones (yours + her Lahore time).

## Data model (KV)

- Key `loc:<isots>` → `{v:1, lat, lon, ts, acc?, alt?}`. One key per fix.
  - `expirationTtl: 864000` (10 days) on `put` — KV deletes it automatically.
  - One-key-per-fix mirrors the notes design (no read-modify-write race; a fix is
    a pure append). `GET /loc?since=` lists the `loc:` prefix, filters by `since`.
- Coordinates are **rounded** before storage (≈3 decimals, ~110 m) — enough to
  show "he's in Skagway," not enough to pin a street address. Privacy by default.

## Worker API (additions to the existing Worker)

- `POST /loc` — body `{lat, lon, tst|ts, acc?}` (OwnTracks sends `_type:"location",
  lat, lon, tst`). Auth `Authorization: Bearer <token>`. Validate `-90≤lat≤90`,
  `-180≤lon≤180`. Round, write `loc:<isots>` with 10-day TTL. Accept the OwnTracks
  JSON shape directly so no transform app is needed. Return `{ok:true}` (OwnTracks
  ignores the body).
- `GET /loc?since=<isots>` — origin-locked (browser read, like `/notes`), bearer
  auth. Returns `{points:[{lat,lon,ts}, …]}` oldest-first, capped (e.g. last 1000).
- **No new secret.** Reuses `NOTES_TOKEN`. No VAPID, no cron.

## Page — rendering on the radar map (inside the encrypted payload)

- On the **map tab**, after the ship route draws: `GET /loc?since=` (10 days back
  on first open), then poll every few minutes while the tab is visible (same
  visibility-gated pattern as the notes thread).
- Draw a **warm-gold** breadcrumb polyline (`#e7c27d`, distinct from the cyan ship
  route) + a "here now" marker at the most recent fix. Tooltip: "Ken — <time
  yours> · <time Lahore>". Empty state: a quiet "No location yet — he'll appear
  here once he's moving. 💛" so it never looks broken.
- A tiny legend line so the two lines aren't confused: cyan = the ship's path,
  gold = where Ken actually is.
- **CSP:** the Worker origin is already in `connect-src` from the notes slice —
  `/loc` is the same origin, so **no CSP change**.

## Privacy & sensitivity (this is real-person location — treat it with care)

- This is **your real-time whereabouts**, shared intentionally with one person.
  Lower-sensitivity than pastoral content, but still personal — handle deliberately.
- **Retention is the trip window:** 10-day KV TTL, hard. Nothing older survives.
- **Coarsened:** rounded to ~110 m before storage. No street-level precision.
- **Auth + transport:** bearer token on both ends, HTTPS always, read path
  origin-locked to the page. Coordinates are **never logged**.
- **Pause control:** a "pause sharing" toggle — practically, you just stop
  OwnTracks (or flip its reporting off); the trail simply stops extending and
  ages out in 10 days. Document this as the off-switch.

### E2EE decision (open — recommend symmetric-skip for v1)

The notes thread is end-to-end encrypted so the Worker is zero-knowledge.
Location **can't** match that cleanly, because OwnTracks can't run our
AES-GCM-to-the-page-key crypto — it posts plaintext JSON. Two options:

- **(A) Plaintext coords in KV (recommended for v1).** Worker sees rounded
  coordinates. Tradeoff accepted: it's your own location, coarsened, 10-day TTL,
  token+origin locked. Mirrors how the notes plan shipped symmetric-now /
  public-key-later. Simplest, works with stock OwnTracks today.
- **(B) Re-encrypting relay.** A tiny always-on shim (e.g. on the M4 mini) pulls
  from OwnTracks, encrypts to the notes key, and pushes ciphertext to the Worker;
  the page decrypts. Keeps zero-knowledge, but adds a moving part that must stay
  up while you travel, and the mini isn't in the path once you've left home.
  Note as a Phase-2 hardening, not v1.

**Recommendation:** (A) for the trip; revisit (B) only if zero-knowledge for
location turns out to matter.

## Build order (where this slots in)

This is **Slice 4** in `../../jerusha-worker/README.md`. It is independent of
Slice 3 (itinerary prompts) and can ship before or after it. Given the trip is
**Jun 29 – Jul 6**, its value is time-boxed — worth doing before departure so the
travel days (the Tampa→Seattle and return flights especially) actually draw.

1. **Worker:** add `POST /loc` + `GET /loc?since=` (10-day TTL, round, validate).
   Redeploy. Test with a manual `curl` POST, then a real OwnTracks fix.
2. **Your phone:** install + configure OwnTracks (HTTP mode, endpoint, token,
   cadence, location permission "always"). Confirm a fix lands (`GET /loc`).
3. **Page (decrypt → edit → re-encrypt):** map-tab fetch + gold breadcrumb +
   here-now marker + legend + dual-zone tooltip + empty state. Verify on her
   Android against the live origin.

## Open questions to confirm before build

1. **Source app:** OwnTracks (recommended) vs. the manual "drop my location"
   button vs. both? (Both is cheap — the manual button is a few lines and a nice
   fallback if OwnTracks misbehaves mid-trip.)
2. **E2EE:** plaintext-coords v1 (recommended) or hold for the re-encrypting relay?
3. **Cadence/precision:** ~110 m rounding + 15–30 min interval OK, or do you want
   tighter (more battery, more precise) / looser?
4. **Visibility window:** show the full 10 days, or just "today + last fix"? (Full
   trail is the better keepsake; last-fix is the cleaner glance.)

---

## Install-button fix (folded in here — small, ties to the PWA slice)

You reported no install button on Android. Two causes, both addressable:

1. **Not live yet.** Android Chrome only offers "Install app" when the manifest +
   service worker are served over HTTPS from the real origin. Until the branch is
   published to `cruisinginthewake.com`, there's nothing to install. **This is
   almost certainly the main reason.** First check after publish: Chrome ⋮ menu →
   "Install app" / "Add to Home screen" should already be there with no code change.
2. **No custom button + `document.write` gotcha.** For a nicer in-page "Install 💛"
   button we must capture `beforeinstallprompt` — but the gate's
   `document.open()/write()/close()` replaces the document, so the handler has to
   live **inside the payload** (post-unlock), not in the gate. Plan: in the payload,
   add a hidden "Install 💛" button; on `beforeinstallprompt` (preventDefault +
   stash the event), reveal it; on tap, call `prompt()`. Also add the iOS
   `apple-mobile-web-app-*` meta + an "Add to Home Screen" hint for iOS (which has
   no `beforeinstallprompt` at all). Tracked as **Slice 2c** in the Worker README.
