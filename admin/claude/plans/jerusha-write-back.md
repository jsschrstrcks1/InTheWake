# Jerusha page — "write back" (two-way notes) plan

**Status:** Planned. Not built. Depends on the Cloudflare Worker from
[`jerusha-pwa-push.md`](jerusha-pwa-push.md) (shares its Worker + KV + VAPID).
**Target:** `admin/weather-jerusha.html` (static, client-side AES-GCM page; passphrase set out-of-band).
**Goal:** a private, two-way thread so Jerusha can write back and it actually
reaches you — and you can reply — across the distance (she's in Lahore, PKT).
**Last updated:** 2026-06-17

---

## What it is

A new **"Us"** tab: a small shared thread. Both people can leave short notes;
the page shows the conversation, newest at the bottom. Optionally seeded each
day by an **itinerary-keyed prompt** ("Day 3, Sitka — what would you want to see
first?"). It is a keepsake as much as a chat.

Because the page has no server, the thread rides the **same Cloudflare Worker**
the push plan introduces. The hard requirement: these are intimate notes, so
the **Worker and its storage never see plaintext** — notes are end-to-end
encrypted in the browser before they leave the device.

---

## Architecture

```
Her page  ──encrypt(note)──▶  POST /notes ──▶  Worker ──▶  KV (ciphertext only)
Your page ◀──decrypt──────  GET /notes?since= ◀──         (+ optional Web Push to the other party)
```

- **Page (encrypted payload):** the "Us" tab UI + crypto + the Worker URL +
  a bearer token all live inside the AES-GCM payload (behind the passphrase).
- **Worker:** thin relay + store. Validates the bearer token + origin, rate-limits,
  appends ciphertext to KV, returns notes since a timestamp, and (phase 2) fires
  a push to the *other* participant. **Zero-knowledge** — it only ever holds
  `{iv, ciphertext, sender, ts}`.
- **KV:** the thread, ciphertext only.

## Privacy & encryption (the crux)

**Default: symmetric E2EE, reusing the page's existing crypto.** The page already
derives an AES-GCM key via PBKDF2-SHA256 (150k iters) from the passphrase. Each
note is encrypted client-side with AES-GCM under a **notes key** (derived the same
way, from the page passphrase or a separate notes passphrase — decide at build) and a
**fresh random 12-byte IV per note**. Only `{iv, ciphertext, sender, ts}` is
POSTed. Your "Us" tab pulls the list and decrypts with the same key.

- The Worker/KV are **zero-knowledge**: a leaked Cloudflare account or KV dump
  reveals only ciphertext. Same trust model as the page itself.
- Trade-off: it's a shared secret (both sides hold the key). Fine for two people.

**Upgrade option (future hardening): public-key.** Generate an X25519 keypair (or
RSA-OAEP). Her page holds only your **public** key and encrypts to it (sealed
box); only your **private** key (never on her device or the Worker) decrypts.
Protects the back-catalog even if her device or the passphrase is compromised.
More moving parts (key storage, a crypto lib) — note as Phase 4, not Phase 1.

## Data model (KV)

- Key `notes:thread` → JSON array, appended. Each entry:
  ```json
  {"id":"<uuid>","sender":"jerusha|me","ts":1718600000,"iv":"<b64>","ct":"<b64>"}
  ```
- Append = read-modify-write (low volume, two people → safe). Cap at last ~1000;
  it's a keepsake, so prefer keeping all and archiving rather than dropping.
- **If strict ordering/concurrency ever matters**, swap KV for a Durable Object.
  Not needed at this scale.

## Worker API

- `POST /notes` — body `{sender, ts, iv, ct}`. Auth `Authorization: Bearer <token>`.
  CORS locked to the page origin. Size cap (e.g. ≤8 KB). Rate-limit per IP.
  On success (phase 2) → push the *other* participant.
- `GET /notes?since=<ts>` — returns entries newer than `ts` (ciphertext). Same auth.
- The bearer token lives in the encrypted payload, so only someone past the
  passphrase can post. It is not true per-user auth (the audience is two people);
  combined with E2EE, the worst a leaker can do is post junk ciphertext that won't
  decrypt — purgeable. HTTPS always.

## UI — the "Us" tab

- **Thread:** her notes + his notes, sender-styled (left/right), timestamps in
  *both* timezones (his + her Lahore time), newest at bottom.
- **Compose:** a text box + send. Enter to send, with a character cap.
- **Daily prompt (optional, top):** the current itinerary day's prompt, tappable
  to pre-fill the compose box.
- **Sender identity:** a one-time per-device setting ("I'm Jerusha" / "I'm me"),
  stored locally; tags each note's `sender`. No accounts.
- **States:** loading; **offline → "will send when you're back online"** (never
  lose a note); empty → a warm "Leave him a note…" placeholder.
- Lives in the encrypted payload; editing it is the usual decrypt → edit →
  re-encrypt cycle.

## Offline & sync

- Unsent notes queue in **IndexedDB**; flush on reconnect / next load (and via
  Background Sync once the service worker from the PWA plan exists).
- Incremental fetch: `GET /notes?since=<lastSeenTs>` on tab open, every few
  minutes while open, and on push wake. De-dupe by `id`.

## Notifications (ties to the push plan)

- When she posts, the Worker sends you a Web Push — **content stays out of the
  payload** (it transits Apple/Google): just "New note from Jerusha 💛". The text
  is fetched + decrypted in-app. Vice-versa for your replies.
- Reuses the VAPID keys + subscription store from
  [`jerusha-pwa-push.md`](jerusha-pwa-push.md).

## Itinerary-keyed prompts (the part you're assembling)

- A per-day prompt list keyed by date, sharing the **same day-to-day itinerary**
  that will guide the push schedule. Example: `{ "2026-07-01": "Day 3, Sitka —
  what would you want to see first here?" }`.
- The current day's prompt shows atop the "Us" tab and can also seed a gentle
  push in her morning (Lahore time).

## CSP change

Add the Worker origin to `connect-src` (currently Open-Meteo / RainViewer /
weather.gov): e.g. `connect-src … https://<worker-host>` (workers.dev subdomain
or a `cruisinginthewake.com` route). One-line edit when the Worker host is known.

## Security / abuse / failure modes

- Bearer token + CORS allowlist + per-IP rate limit + payload size cap.
- E2EE means a compromised Worker/KV leaks nothing readable.
- Worker down or offline → local queue, retry; surface "not sent yet," never drop.
- Cleared site data loses the local queue → flush promptly after compose.
- **Keepsake/export:** an "export our notes" action that decrypts the full thread
  to a file, so the conversation survives independent of Cloudflare.

## Cost

Cloudflare Workers + KV free tiers (100k req/day, ample KV) — effectively free at
two-person volume.

## Open questions to confirm before Phase 1

1. Same page passphrase for the notes key, or a **separate** notes
   passphrase? (Separate = compromising one doesn't expose the other.)
2. Worker host: a `*.workers.dev` subdomain, or a route on `cruisinginthewake.com`
   (cleaner, needs the domain on Cloudflare — see the PWA plan's open question).
3. Retention: keep everything (recommended, it's a keepsake) vs. cap.

## Build order

0. **Prereq:** stand up the Worker (per the PWA plan) — KV namespace, bearer
   token, CORS, VAPID.
1. **Phase 1 — the thread (no push needed):** `POST/GET /notes`, the "Us" tab,
   AES-GCM E2EE, sender setting, offline queue, dual-timezone stamps. Works as a
   refresh-on-open thread immediately.
2. **Phase 2 — push on new note:** Worker fires a contentless push to the other
   party; in-app fetch + decrypt. Rides the PWA push infra.
3. **Phase 3 — itinerary prompts + export:** per-day prompts (shared itinerary)
   atop the tab and optional morning push; "export our notes" keepsake action.
4. **Phase 4 — optional hardening:** swap symmetric E2EE for public-key (sealed
   box) so only your private key can ever decrypt.
