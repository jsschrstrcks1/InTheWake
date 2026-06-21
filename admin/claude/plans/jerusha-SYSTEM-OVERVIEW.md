# Jerusha page — system overview & handoff

**Purpose:** one document the other agent thread can read to understand the whole
"For Jerusha" system — how it works, where every piece of plumbing lives, the data
model, the crypto, the deploy path, and the known traps — for evaluation and
possible integration with the media/map work.
**Audience:** engineers/agents. Not pastoral. Secrets are referenced, never printed.
**Last updated:** 2026-06-19

---

## 1. What it is

A single, **passphrase-gated, client-side-encrypted** page — `admin/weather-jerusha.html`
on the public site `cruisinginthewake.com` — built for one person (Jerusha, in Lahore,
on Android; author Ken travels). It looks like a retro terminal. Behind the gate it's a
weather/radar/itinerary "voyage companion" for the Anthem of the Seas Alaska cruise
(Jun 29–Jul 6 2026), plus a private two-way **notes thread**, **web push**, a **live
location breadcrumb**, an **encrypted photo/video gallery**, and **map-by-day photos**.

Design ethos ("A Bureau of Retrograde Technology"): no framework, no build step,
hand-rolled WebCrypto, one Cloudflare Worker + KV + R2. Zero-knowledge wherever the
content is personal.

---

## 2. Files & where they live

| Path | What it is |
|---|---|
| `admin/weather-jerusha.html` | The page. **Plaintext gate shell** + **AES-GCM-encrypted payload** (the whole app is inside the ciphertext). |
| `admin/jerusha-worker/worker.js` | Cloudflare Worker — the only server. Notes/push/location/media/import + cron. |
| `admin/jerusha-worker/wrangler.toml` | Worker config: KV binding `NOTES`, R2 binding `MEDIA`, cron triggers. |
| `admin/jerusha-worker/README.md` | Worker deploy/runbook + board review + slice build order. |
| `admin/sw-jerusha.js` | Service worker (PWA): network-first shell, cache static, push + notificationclick. |
| `admin/jerusha.webmanifest` | PWA manifest. |
| `admin/jerusha-icons/` | App icons (192/512/maskable/apple-touch). |
| `admin/jerusha-gallery/*.webp` + `.attr.json` | 19 stock Wikimedia Alaska photos + attribution sidecars (the "stock" gallery). |
| `admin/claude/plans/jerusha-*.md` | Plans: pwa-push, write-back, photo-gallery, itinerary, location-share, notes-persistence, media-gallery, and this overview. |

**Operational note:** the deployed Worker is **hand-maintained** in `~/jerusha-worker`
on Ken's **M4 mini** — it is NOT a git checkout, so `worker.js`/`wrangler.toml` there
must be updated by pasting the repo's version, then `wrangler deploy` from inside that
folder. (Deploying from the wrong folder tries to deploy a different project.)

---

## 3. The page: gate + payload (the most important mechanic)

`weather-jerusha.html` has two layers:

1. **Gate shell (plaintext, top of file):** CSP `<meta>`, manifest link, SDG comment
   (must stay before line 20), the passphrase form, and a bootstrap:
   ```js
   unlock(pw) -> document.open();
   document.write("<script>window.__JPW="+JSON.stringify(pw)+"</scr"+"ipt>"+html);
   document.close();
   ```
   It also registers the service worker and captures `beforeinstallprompt` into
   `window.__bip`.
2. **Encrypted payload:** `var SALT="…",IV="…",CT="…";` — AES-GCM. PBKDF2-SHA256,
   150k iters, key from the **passphrase** (held by Ken, set out-of-band; NOT in the
   repo). Decrypts in-browser to the full app HTML, which is written into the document.
   The passphrase is stashed on `window.__JPW` so the payload can derive the notes/media
   key after unlock.

### ⚠️ Trap #1 — the effective CSP is the GATE's, not the payload's
`document.write` replaces the document, but a `<meta>` CSP injected that way is
**ignored**; the gate's original CSP keeps enforcing. So **any new origin a feature
needs (worker, blob:, etc.) must be added to the GATE shell's CSP** (and, for tidiness,
the payload's too). This bit us twice — notes silently failed until the worker host was
added to the gate `connect-src`. Current gate CSP allows: cdnjs (script/style),
`img-src 'self' data: https: blob:`, `media-src 'self' blob:`, `connect-src 'self'
https://*.workers.dev + the three weather APIs`.

### Editing the payload (decrypt → edit → re-encrypt)
The app lives inside the ciphertext, so every change is: decrypt to a temp file →
edit → **re-encrypt keeping the same SALT, fresh random 12-byte IV** → write the
`var SALT,IV,CT` line back. Verify by decrypting the shipped file. (Node `webcrypto`
does this; the passphrase is the only input.)

---

## 4. The Worker (`jerusha-notes`)

Deployed at `https://jerusha-notes.inthewake-jerusha.workers.dev`. One file, no deps.

**Auth** — a shared bot-filter token (`env.NOTES_TOKEN`, a Worker secret; also embedded
in the encrypted payload so only someone past the passphrase can read it). Accepted
three ways so different clients work: `Authorization: Bearer <t>`, HTTP **Basic**
password (for OwnTracks on iOS, which can't set a Bearer header), or `?k=<t>` query.
Origin-locked to `cruisinginthewake.com` for browser calls; clients with no `Origin`
(OwnTracks) pass the origin check and rely on the token.

**Bindings:** KV `NOTES` (all metadata + small ciphertext), R2 `MEDIA` (media blobs).

**Endpoints:**

| Route | Method | Purpose |
|---|---|---|
| `/notes` | GET `?since=` | Returns `{notes:[…], deletions:[ids]}` (ciphertext only + tombstones). |
| `/notes` | POST | Store `{sender,iv,ct}` → `note:<ts>-<uuid>`; fire contentless push to the other party. |
| `/notes` | DELETE `?id=` | Delete the note + write a `del:<id>` tombstone (90-day TTL) so the deletion propagates. |
| `/subscribe` | POST | Store a Web Push subscription under `sub:<role>` (role = jerusha\|me). |
| `/loc` | POST | Store a location fix (coarsened ~110 m) → `loc:<ts>`, 10-day TTL. Accepts OwnTracks JSON. |
| `/loc` | GET `?since=` | Returns `{points:[…]}` for the breadcrumb. |
| `/media` | POST `?kind&mime&lat&lon&day&id` | Stream ciphertext to R2 `media/<id>`; metadata → `media:<ts>-<id>`. |
| `/media` | GET | List media metadata (no bytes). |
| `/media/<id>` | GET | Stream the R2 ciphertext object. |
| `/media/<id>` | DELETE | Remove R2 object + KV metadata. |
| `/import` | POST | Re-seed notes from a backup `{notes:[…]}` (idempotent by id+ts). |
| `scheduled` (cron) | — | Daily gentle push to Jerusha at 03:00 & 16:00 UTC (8am/9pm Lahore). |

**Secrets (Worker, via `wrangler secret put`, never committed):**
`NOTES_TOKEN` (set), `VAPID_PRIVATE` (Web Push signing key — **must be set for push to
fire**; status unverified). VAPID **public** key is in `worker.js` (public by design).

---

## 5. Data model (KV keys + R2)

```
note:<isoTs>-<uuid>   -> {v:1, id, sender:"jerusha"|"me", ts, iv, ct}   (E2EE note)
del:<id>              -> "1"   (tombstone, 90-day TTL — delete propagation)
sub:<role>            -> [ pushSubscription, … ]   (max 10)
loc:<isoTs>           -> {v:1, lat, lon, ts}   (10-day TTL, coords ~110 m)
media:<isoTs>-<id>    -> {v:1, id, kind, mime, lat, lon, day, ts}   (metadata)
R2  media/<id>        -> [12-byte IV][AES-GCM ciphertext]   (the encrypted blob)
```

KV list is eventually consistent (≈ up to a minute) — relevant when checking
tombstones/recent writes right after a mutation.

---

## 6. Crypto / E2EE model

- **Page key** (gate): PBKDF2-SHA256(passphrase, page `SALT`, 150k) → AES-GCM-256.
  Decrypts the payload only.
- **Notes/media key** (in payload): PBKDF2-SHA256(passphrase, `NOTES_SALT`, 150k) →
  AES-GCM-256, via `_notesKey()`. `NOTES_SALT` = base64 `jerusha-notes-v1` (a salt is
  not a secret; the passphrase is). Used by:
  - **Notes:** `_encNote(text)`/`_decNote(iv,ct)` → `{iv,ct}` base64, per-note random IV.
  - **Media:** `_encBytes`/`_decBytes` → R2 object is `[12-byte IV][ciphertext]`; decrypt
    to a Blob → `URL.createObjectURL` → `<img>`/`<video>`.
- **Worker/KV/R2 are zero-knowledge** — only ciphertext leaves the device; a leaked
  account/dump reveals nothing without the passphrase. (Location coords are the one
  exception: stored coarsened-but-plaintext by design — see location-share plan.)
- **Web Push** payloads encrypted in the Worker per RFC 8291 (aes128gcm) with VAPID
  RFC 8292 (ES256 JWT). Note pushes are **contentless** (the SW has no key); the daily
  cron push carries its non-secret line in the payload.

---

## 7. PWA / service worker

`sw-jerusha.js`, cache `jerusha-v3`. **Network-first for the HTML shell** (so content
updates actually reach an installed device — a cache-first shell pinned users to a stale
page, which was a real bug), cache-first for static assets (icons, cdnjs), passthrough
(never cache) for the weather APIs and `workers.dev`. `push` shows a notification;
`notificationclick` focuses/opens the page. Install: Android gets a custom "Install"
button (driven by `window.__bip` captured in the gate); iOS gets an Add-to-Home-Screen
hint (no `beforeinstallprompt` on iOS).

---

## 8. Deploy / plumbing path

- **Page:** commit to branch `claude/admiring-einstein-j9yqu2` → auto-PR → `main` →
  **GitHub Pages** serves `cruisinginthewake.com` (`CNAME`, `.nojekyll`,
  `.github/workflows/static.yml`). A device must drop the old SW cache once to pick up
  a new shell (network-first handles it thereafter).
- **Worker:** **manual** — on the M4 mini, update `~/jerusha-worker/{worker.js,wrangler.toml}`
  to match the repo, then `cd ~/jerusha-worker && wrangler deploy`. Requires the
  R2 bucket `jerusha-media` to exist and the `NOTES`/`MEDIA` bindings + secrets set.

---

## 9. Known traps (read before touching)

1. **Gate-CSP rules everything** (see §3). New fetch origins / `blob:` / `media-src`
   go in the GATE shell CSP or they're silently blocked post-unlock.
2. **Re-encryption discipline:** keep SALT, fresh IV, verify the shipped file decrypts,
   confirm SDG before line 20 and the repo's banned-string check passes.
3. **Worker is hand-maintained off-repo** on the mini — deploys don't come from CI; a
   stale local `worker.js` ships old code. Deploy from inside the folder.
4. **KV eventual consistency** when verifying right after a write.
5. **Duplicate-endpoint risk:** two threads editing `worker.js` produced a duplicated
   `/media` block on merge once. Coordinate worker edits; grep for dup `url.pathname ===`
   after merges.
6. **Video playback** depends on the viewing browser's codec support; uploads aren't
   transcoded. Whole-file client-side encryption is memory-bound → ~50 MB cap.

---

## 10. Status (audited 2026-06-19, against live worker + production page)

**Live & verified:** passphrase gate; weather/radar/itinerary/affirmations; notes thread
+ delete (tombstone propagation); export/restore (.txt + .json) + `/import` re-seed;
install prompt; location breadcrumb (page+worker); **encrypted photo/video gallery
(R2)**; **map-by-day photos**; gallery chevron fix; daily-push cron code.

**Open:**
- **Slice 3** — itinerary-keyed daily prompt atop the Us tab — NOT built.
- **OwnTracks** — `/loc` shows 0 points; the background reporter isn't posting yet
  (upload-time geolocation works — a real photo is geotagged to Sitka).
- **Push** — `VAPID_PRIVATE` secret + on-device "turn on alerts" — unverified.
- *(optional)* automated off-Cloudflare notes backup; public-key E2EE upgrade.

---

## 11. For the other thread (integration notes)

- The media gallery + map-by-day are **already built and live** (your work, PRs
  #1973–1976). This doc is the surrounding system so you can see what they plug into:
  same Worker, same `NOTES` KV, same `_notesKey()` crypto, same gate-CSP rules.
- If you extend the Worker, **paste the whole `worker.js` into the mini's copy and
  redeploy** — don't assume CI ships it. Watch for duplicate route blocks on merge.
- **Secrets are not in the repo.** The passphrase and `VAPID_PRIVATE` live with Ken /
  in Worker secrets; the `NOTES_TOKEN` is a bot-filter (also embedded in the payload).
  Get live values from Ken out-of-band; do not commit them.
- Anything personal (notes, media, location) must stay **zero-knowledge** end-to-end —
  encrypt in the browser with `_notesKey()`/`_encBytes`, store ciphertext only.
