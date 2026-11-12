# Jerusha app: system overview

**Soli Deo Gloria.**

**Read this first.** It says how the whole app works and where every piece lives.
**To change something,** read `admin/jerusha-worker/CHANGE-GUIDE.md`: one short recipe per common job.
**To see what is planned and why,** read `admin/claude/plans/jerusha-UPGRADE-PLAN-2026-11.md`.

**Last rewritten:** 2026-11-12, from the code on branch `claude/jerusha-upgrade-202611`. The earlier version was
dated 2026-06-19 and predated the rename, multi-voyage, chunked media and everything below marked 2026-11.
Secrets are named here, never printed. This repo is public: some security detail is kept out of it on purpose
and lives in Ken's private notes.

**What is deployed vs what is in the repo.** As of 2026-11-12 the page changes are on a branch, not on `main`,
and the live Worker is OLDER than the repo (it answered 404 for `/push-status`). Anything marked "repo only"
below is not serving anyone yet. Check before you trust a claim that something is live.

---

## 1. What it is

A private, passphrase-gated app for two people: Ken, who cruises, and Jerusha, in Lahore on Android. It is one
HTML page on the public site `cruisinginthewake.com`, installable as a home-screen app. Behind the gate:

- **Voyage**: the active cruise day by day, upcoming voyages, and an Archive of past ones, each kept whole.
- **A strip under the header**: both clocks, what the schedule says about right now, the next likely port
  window in her clock, the phone's last reported position, and what Ken's calendar says.
- **Us**: a private two-way notes thread with push alerts and an alerts-status panel.
- **Gallery**: their own encrypted photos and videos, plus stock photos of the places.
- **Calendar**: Ken's shared calendar, read-only, every line in both clocks.
- **Weather**: Now, 10-Day, Radar, Futurecast, Alerts for home, Lahore and the active voyage's ports.
- **Recipes** (repo only): a separate door to the Atlas recipes app at home, read-only.

Design ethos: no framework, no build step beyond encryption, hand-rolled WebCrypto, one small Worker. Anything
personal is encrypted in the browser before it leaves the device.

They talk on WhatsApp every day. This app does not try to be a messenger. It does what a messenger cannot:
read the ship's schedule, hold the keepsake, and show the two clocks.

---

## 2. Files

| Path | What it is |
|---|---|
| `admin/alaska-trip.html` | **The page.** A plaintext gate plus one AES-GCM blob that holds the whole app |
| `admin/weather-jerusha.html` | The old address. A redirect stub only |
| `admin/jerusha-src/alaska-trip.payload.html` | The app's plaintext source. **Gitignored.** Made by `extract`, consumed by `build` |
| `admin/jerusha-worker/jerusha-payload.mjs` | `extract` (decrypt to source) and `build` (encrypt source into the page, round-trip checked) |
| `admin/sw-jerusha.js` | Service worker: offline shell, static cache, push |
| `admin/jerusha.webmanifest` | Install manifest. `short_name` is `Ken` on purpose. **Never change `id`** |
| `admin/jerusha-icons/`, `admin/jerusha-gallery/` | Icons; stock Alaska photos with `.attr.json` attribution |
| `admin/family/itinerary-overrides.json` | Self-service itinerary fixes. No passphrase, no rebuild |
| `admin/jerusha-worker/worker.js` | **The backend.** One Cloudflare Worker, `jerusha-notes` |
| `admin/jerusha-worker/worker.test.mjs` | Worker tests: `node --test`, in-memory KV and R2 |
| `admin/jerusha-worker/wrangler.toml` | Worker config. The KV id in the repo is a placeholder |
| `admin/jerusha-worker/jerusha-backup.sh` | Off-Cloudflare backup of notes, media metadata, and optionally blobs |
| `admin/jerusha-worker/import-gpx.mjs` | Replays an OwnTracks GPX export into `/loc` |
| `admin/jerusha-worker/recipes-door/` | The recipes door: its own Worker, tests, tunnel config example, runbook, local smoke test |
| `tests/playwright/jerusha-*.spec.js`, `jerusha-open.js`, `fixtures/jerusha-cal-*.ics` | Page tests |
| `admin/claude/plans/jerusha-*.md` | This overview, the upgrade plan, and older per-feature plans |

**The live Worker is deployed by hand** from `~/jerusha-worker` on Ken's M4 mini. That folder is not a git
checkout. Deploying means copying the repo's files there first. See the change guide.

---

## 3. The page: gate and payload

`alaska-trip.html` has two layers.

1. **Gate (plaintext).** CSP `<meta>`, manifest link, the passphrase form, and a script that:
   derives a key from the passphrase (PBKDF2-SHA256, `iterations:150000`, the page `SALT`), decrypts the blob
   (`IV`, `CT`), then `document.open(); document.write(...)` with the decrypted app, passing the passphrase on
   as `window.__JPW`. It also registers the service worker and captures `beforeinstallprompt`.
2. **Payload (ciphertext).** `var SALT="..",IV="..",CT="..";` The whole app is inside `CT`.

**Trap: the gate's CSP rules the page.** A CSP `<meta>` written by `document.write` is ignored, so the gate's
original CSP keeps enforcing after unlock. A new outside host must be added to the GATE's `connect-src`. Today
it allows `self`, `https://*.workers.dev`, and the three weather hosts.

**Trap: two heads.** Some tags exist in both the gate and the payload (manifest link, `apple-mobile-web-app-title`).
iOS reads whichever is live when the icon is added. Keep them equal.

**The app is one IIFE.** Nothing in it is callable from outside. Tests read the DOM.

**Code added in 2026-11 is not minified.** It sits in one commented block that starts
`Added 2026-11` just above `function setTab`. Older code is long single lines; edit those with care.

---

## 4. The Worker (`jerusha-notes`)

Live at `https://jerusha-notes.inthewake-jerusha.workers.dev`. One file, no dependencies.

**Auth.** A shared token `env.NOTES_TOKEN`, accepted as `Authorization: Bearer`, as an HTTP Basic password
(OwnTracks on iOS), or as `?k=`. Browser calls are origin-locked to `https://cruisinginthewake.com`. The token is
a bot filter, not a lock: it ships inside the encrypted page. The real guarantee for notes and media is that
the Worker only ever holds ciphertext.

**Bindings.** KV `NOTES`, R2 `MEDIA` (bucket `jerusha-media`).

**Secrets** (`wrangler secret put`, never committed): `NOTES_TOKEN`, `VAPID_PRIVATE`, and optionally
`CAL_KEN_URL`, `CAL_JERUSHA_URL`.

| Route | Method | What it does |
|---|---|---|
| `/notes` | GET `?since=` | Notes newer than `since`, oldest first, plus `deletions` (tombstone ids) |
| `/notes` | POST | Store `{sender, iv, ct}`; send a contentless push to the other person |
| `/notes` | DELETE `?id=` | Delete the note and leave a tombstone |
| `/import` | POST | Re-seed notes from a backup. Idempotent |
| `/subscribe` | POST | Store a push subscription under a role (`jerusha` or `me`) |
| `/push-status` | GET | Subscription counts, whether `VAPID_PRIVATE` is set, last push results |
| `/push-test` | POST `{role}` | Send a real test push and return the per-device results |
| `/loc` | POST | Store one location fix, rounded to three decimals, with a TTL. Accepts OwnTracks JSON and honours its fix time |
| `/loc` | GET `?since=` | The breadcrumb points |
| `/media` | POST `?by&kind&mime&lat&lon&day&id` | Stream ciphertext to R2; store metadata in KV. `by` is `jerusha`, `me`, or null (repo only) |
| `/media` | GET | List media metadata |
| `/media/<id>` | GET, DELETE | Stream or remove one blob |
| `/cal` | GET `?who=ken` | **Repo only.** Fetch the ICS feed named by `CAL_KEN_URL` and return it as is. Parses nothing, stores nothing. **Not zero-knowledge**: the Worker sees it in transit |
| cron | `0 3 * * *`, `0 16 * * *` UTC | A push to Jerusha: the day's line from `VOYAGE_PUSH`, else one of `AFFIRM` |

**Push lines are Ken's own words.** `VOYAGE_PUSH["world-america-dec"]` is empty on purpose. Never write them
for him.

**Listing follows the KV cursor** (`listAll`, repo only). The live Worker still cuts every list at one page.

**Named limit:** `GET /notes`, `/loc` and `/media` read each record with its own KV call. Cloudflare caps the
calls one request may make, and that cap was not checked for this account. The thread held about eleven notes
on 2026-11-12, so this is far off, but a long thread will need a different read path.

---

## 5. Data model

```
KV  note:<isoTs>-<uuid>   {v:1, id, sender:"jerusha"|"me", ts, iv, ct}     ciphertext
KV  del:<id>              "1"                                               tombstone, TTL
KV  sub:<role>            [pushSubscription, ...]                           newest ten
KV  pushlog:<role>        {ts, results:[...]}                               TTL
KV  loc:<isoTs>           {v:1, lat, lon, ts}                               TTL, coords rounded
KV  media:<isoTs>-<id>    {v:1, id, kind, mime, lat, lon, day, ts, by?}     metadata
R2  media/<id>            encrypted blob (formats in section 6)
```

KV lists are eventually consistent. A write may not show in a list right away.

**Voyages** live inside the payload, in `VOYAGES`:

```
{ id, tz, ship, title, start, end, season, pack, packLabel, track, trackLabel, note, itin:[day...], route:[[lat,lon]...] }
day = { d, date, arr?, dep?, loc, type:"port"|"sea", lat, lon, pos, dock?, wx:{hi,lo,txt},
        plan?:[...], planLabel?, hist?, poi?:[...], desc?, booked?:[...] }
```

- `tz` is the voyage's clock. `arr` and `dep` are port hours as `"HH:MM"` on that clock.
- `desc` is a personal per-day message from Ken. `booked` is his excursions. Both are his to write.
- Voyage ids today: `getaway`, `world-america-dec`, `anthem-alaska`.
- Which voyage is ACTIVE: the current one by date, else the soonest future one, else the latest past one.
  A voyage moves to the Archive the day after it ends, with no manual step.

**Overrides** (`admin/family/itinerary-overrides.json`):
`voyages.<id> = { note, title, start, end, days: { "<dayNumber>": { any day field } } }`. Fetched fresh on every
online load and laid over the built-in data. It can correct `arr` and `dep`. Map lines and pins do not move.

---

## 6. Crypto

- **Page key.** PBKDF2-SHA256(passphrase, page `SALT`, 150000) to AES-GCM-256. Decrypts the payload only.
- **Notes and media key.** PBKDF2-SHA256(passphrase, `NOTES_SALT`, 150000) to AES-GCM-256. Derived once per
  page load and reused (`_notesKey`).
- **A note** on the wire: `{iv, ct}` base64, a fresh 12-byte IV each.
- **Media up to 4 MiB:** `[12-byte IV][ciphertext]`.
- **Larger media ("JCM1"):** bytes `4A 43 4D 31`, a little-endian uint32 header length, a JSON header
  `{c:[{i: base64 IV, n: ciphertext bytes}]}`, then the chunk ciphertexts. Each chunk has its own random IV.
  **Named limit:** the chunk order is not bound into the encryption, so a reordered file would still decrypt.
- **The saved calendar copy** on the phone is encrypted with the notes key.
- **Push** payloads are encrypted in the Worker (RFC 8291) and signed with VAPID (RFC 8292). Note pushes carry
  no content.

**One passphrase feeds both keys.** Changing it is not a one-line job: every existing note and photo would be
locked. See the upgrade plan, section 8, before touching it.

---

## 7. What is stored on the phone

All in `localStorage`. No IndexedDB.

| Key | Holds |
|---|---|
| `itw:unit` | Temperature unit |
| `itw:sel` | Selected location label |
| `jerusha:us:me` | Who is using this device: `jerusha` or `me` |
| `jerusha:us:cache` | Notes, as ciphertext, newest 500 |
| `jerusha:us:outbox` | Notes waiting to send, as ciphertext |
| `jerusha:install:dismissed` | The install bar was dismissed |
| `jerusha:cal:ken` | Last good copy of Ken's calendar, encrypted. Deleted when `/cal` answers 404 |

The service worker's cache (`jerusha-v5`) holds the page shell, the icons, the stock gallery photos it has
seen, and the cdnjs libraries.

---

## 8. Honesty rules the app keeps

These are deliberate. Do not "simplify" them away.

- **A feed that did not answer is unknown, never calm.** Alerts say "status unknown, not an all-clear".
  The calendar says "couldn't read", never an empty week. Photos say "couldn't load", never "no photos".
- **A schedule is a plan, not an observation.** Lines built from the itinerary say "by the schedule" or
  "likely". The phone's position is a separate line, shown with its age, and absent when there is no fix.
- **An empty calendar stretch means "nothing on his shared calendar".** It never means he is free.
- **A repeat rule the parser cannot expand is named**, with its first date. It is not dropped and not guessed.
- **Words to her are Ken's.** No daily prompt, push line or day message is ever written by a model.

---

## 9. The strip: where each line comes from

| Line | Source | Function |
|---|---|---|
| Two clocks | The device clock, shown in the voyage `tz` (or home) and `Asia/Karachi` | `renderStrip` |
| "By the schedule: ..." | Today's itinerary day, with `arr`/`dep` | `scheduleNow` |
| "Likely in port next: ..." | The next day with both `arr` and `dep`, skipping the port he is in | `nextPortWindow` |
| "Ken's phone last reported ..." | The newest `/loc` point | `stripLoc`, `_fixPlace` |
| "On Ken's calendar now / Next ..." | The parsed calendar | `_calNowLine` |

Port hours are read on the ship's clock, taken to be the voyage `tz`. If a ship keeps a different clock in
some port, correct that day's `arr` and `dep` in the overrides file.

---

## 10. The calendar

- Ken shares one iCloud calendar as a public link. The address is the Worker secret `CAL_KEN_URL`.
- The page asks `GET /cal?who=ken`, parses the ICS in the browser (`icsParse`, `icsOccurrences`, `calBuild`),
  and renders the next six weeks.
- Handled: UTC, `TZID`, and all-day dates; `RRULE` with `FREQ` DAILY, WEEKLY, MONTHLY, YEARLY, `INTERVAL`,
  plain-weekday `BYDAY` on weekly rules, `UNTIL`, `COUNT`; `EXDATE`; moved occurrences (`RECURRENCE-ID`);
  `STATUS:CANCELLED`.
- Not handled, and said so on the page: any other repeat rule (for example "first Monday").
- **Never checked against a real export from Ken's calendar.** The fixtures are made up. Check one before
  trusting the list above.
- Her calendar is not built. The route already takes `who`; `CAL_JERUSHA_URL` is reserved for it.

---

## 11. The recipes door (repo only)

A second Worker, `jerusha-recipes`, in `admin/jerusha-worker/recipes-door/`. Read its `README.md`.

```
her phone -> Worker (allowlist, GET only, her cookie) -> Cloudflare Tunnel behind Access
          -> cloudflared on the M4 mini (path rule) -> Atlas on 127.0.0.1:8088
```

- Design rule: the door never relies on the app behind it to refuse a request. **The Worker's allowlist is
  the boundary**, with the tunnel's path rule as a second lock.
- The Atlas shell (the top bar that links every Atlas app) is refused on purpose. The recipes page runs
  without it.
- Tested on 2026-11-12 with a real browser against the Atlas on Ken's MacBook
  (`smoke-local.mjs`): the page rendered, a recipe opened, `/admin`, `/helm`, `/photos` and `/whoami` were
  refused, and every write was refused. **Not tested:** Cloudflare, the tunnel, Access, her phone.
- Rooms: recipes is the only one. Ken's rulings on the rest of Atlas are in the upgrade plan, section 5.7a.

---

## 12. Tests

| Command | Covers |
|---|---|
| `npx playwright test jerusha-offline` | The service worker really opens the gate offline |
| `npx playwright test jerusha-units` | Timezones, escaping, alerts, overrides, forecast range, push panel, tabs, map pin, captions |
| `npx playwright test jerusha-voyage` | The strip, the Archive, photos by day |
| `npx playwright test jerusha-calendar` | The calendar parser and its failure states |
| `npx playwright test jerusha-gallery` | Chunked media decrypts and renders |
| `node --test admin/jerusha-worker/worker.test.mjs` | The Worker |
| `node --test admin/jerusha-worker/recipes-door/worker.test.mjs` | The door |
| `node admin/jerusha-worker/recipes-door/smoke-local.mjs` | The door against a local Atlas, in a real browser |

The page tests need the gitignored source (`extract` first). Without it they skip, they do not pass.

All of this has been run on local Node 26 and desktop Chromium. None of it has been run on her phone.
