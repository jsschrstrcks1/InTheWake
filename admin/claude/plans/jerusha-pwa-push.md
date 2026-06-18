# Jerusha page — PWA install + push affirmations

**Status:** Planned. Nothing built yet. The page ships as-is: in-page affirmation
rotation on every load and every 5 minutes, passphrase set out-of-band.
**Target page:** `admin/weather-jerusha.html` (client-side AES-GCM shell; the
weather/radar/affirmation code lives inside the encrypted payload).
**Last updated:** 2026-06-16

---

## Decisions (locked)

- **Scope now:** plan only. No service worker, no manifest, no server yet.
- **Push host:** Cloudflare Workers — Cron Triggers for the schedule, KV for her
  push subscription, a Worker secret for the VAPID private key.
- **Cadence:** 2–4 notifications/day, randomized inside three windows in
  **Lahore time (PKT, UTC+5)**:
  - morning / midday / evening, weighted **50 / 30 / 20**.
  - No affirmation repeats within the same day.

## Open questions to confirm before Phase 2 (no answers needed yet)

1. Is `cruisinginthewake.com` already fronted by Cloudflare? Decides how clean the
   Worker hookup is (route/DNS vs. workers.dev subdomain).
2. Her device is on **iOS 16.4+**? Web Push on iOS exists only from 16.4, and only
   for an installed (Add-to-Home-Screen) PWA.
3. Installed-app convenience: remember the passphrase on her device, or re-enter
   the page passphrase each launch? (Trade-off: convenience vs. the gate's whole point.)

---

## Phase 1 — installable + offline (no server)

Goal: she can Add to Home Screen, and the page opens and decrypts offline.

- `jerusha.webmanifest` — name, short_name, gold theme, `display: standalone`,
  `start_url` to the page, icon set below.
- `sw-jerusha.js` — precache gate: the shell HTML, Leaflet CSS/JS, the manifest,
  and icons, so it opens offline and still decrypts. Network-first for the live
  weather/radar APIs (Open-Meteo, RainViewer, weather.gov) with cache fallback.
- Gold icons: 192, 512, and maskable PNG.
- iOS meta: `apple-mobile-web-app-capable`, `apple-mobile-web-app-title`,
  `apple-touch-icon`, plus the `<link rel="manifest">`.
- CSP additions on the page: `worker-src 'self'` and `manifest-src 'self'`.
- A quiet "Add to Home Screen 💛" hint after unlock.

**Note:** the SW registration and manifest link sit in the *plaintext* shell, but
the affirmation/weather logic stays inside the encrypted payload. Editing inner
content is a decrypt → edit → re-encrypt round-trip (SALT/IV/CT re-embedded;
PBKDF2-SHA256 + AES-GCM, passphrase set out-of-band).

> **Related:** the same Worker + KV + VAPID also back the two-way "write back"
> thread — see [`jerusha-write-back.md`](jerusha-write-back.md). Stand the Worker
> up once; both features ride it.

## Phase 2 — push affirmations

- Generate a VAPID keypair. Public key ships in the page; **private key is a
  Worker secret**, never in the repo.
- After unlock, a tap subscribes (`Notification.requestPermission` →
  `pushManager.subscribe`). POST the subscription JSON to the Worker.
- Worker stores the subscription in **KV**.
- A **Cron Trigger** fires on the Lahore-time schedule, picks a weighted window,
  selects a non-repeating affirmation, and sends an **encrypted Web Push**.
- `sw-jerusha.js` `push` handler shows the notification; `notificationclick`
  opens the page.

### Privacy boundary (hard)

- The **affirmation list and the VAPID private key live in the Worker / a private
  repo**, never in public `InTheWake`. The public page only ever holds the VAPID
  *public* key and the subscribe code.
- Push payloads are personal content — treat like pastoral material: do not log
  bodies, do not send anywhere but her subscription endpoint.

---

## Build order when greenlit

1. Phase 1 (manifest + SW + icons + iOS meta + CSP) — verify install + offline.
2. Confirm the three open questions above.
3. Phase 2 (VAPID + subscribe + Worker KV + Cron + push handler) — verify one
   end-to-end test push lands on her device, then enable the schedule.
