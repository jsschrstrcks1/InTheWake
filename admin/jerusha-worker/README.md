# Jerusha notes relay — Cloudflare Worker

The backend for the encrypted Jerusha page's two features. **Slice 1 (this code):**
the zero-knowledge two-way "write back" thread. Push (Slice 2) and itinerary prompts
(Slice 3) are deferred — see the build order below and the plan docs in
`../claude/plans/`.

---

## Boardroom review (CTO department) — what shaped this

Reviewed by the technical department lenses before building. **Run was
`consistency-degraded`: single-model, no external cross-AI Round 2 (vendors
unreachable — no orchestrator `.env`), so the consensus signal is weaker than a
normal board run.** Persona titles only (de-identified, per board rules).

**Verdict: architecture sound; build the irreducible relay first.** Three
load-bearing changes were folded in:

1. **Systems Maintainer — eliminate the special case.** Do **not** store the thread
   as one appended JSON blob (concurrent appends clobber each other — a real
   read-modify-write race). Store **one KV key per note** (`note:<isots>-<uuid>`).
   Append becomes a pure write; the race and the "do we need Durable Objects?"
   question both disappear. Boring beats clever. Schema is **versioned** (`v:1`) so
   the note contract can evolve without breaking old clients.
2. **Engineer-Founder — delete before you build.** The server is the only
   non-serverless part of the whole page, so keep it irreducible: POST/GET notes,
   token, CORS, size cap. **Push is a separate, later slice**, not part of this one.
   The bearer token is defended as a *bot-filter*, not auth (it ships in the page) —
   the real guarantee is the E2EE.
3. **Offline-Caching Architect — iOS is the gating reality.** iOS has **no
   Background Sync** and Web Push needs an **installed PWA on 16.4+**. So the page's
   offline outbox must fall back to flush-on-`online`/load (not depend on Background
   Sync), and the **service worker never decrypts** — it has no key. Push (Slice 2)
   stays **contentless**; content is fetched + decrypted in-app on open.

**Frontend Performance Engineer:** `?since=` keeps steady-state polls near-empty;
no framework, no crypto lib — WebCrypto + `fetch`, matching the page. One line of
CSP (`connect-src`) is the only page cost.

**What this department did NOT cover:** the message/prompt prose and pastoral
appropriateness (household guardrails + design panel), and the shared-vs-separate
notes-passphrase choice (operator security preference — see plan open questions).

---

## What this Worker does (Slice 1)

- `POST /notes` — body `{sender:"jerusha"|"me", iv, ct}` (ct/iv are opaque AES-GCM
  ciphertext). Validates bearer token, origin, shape, and a 4 KB size cap. Writes one
  KV record `{v,id,sender,ts,iv,ct}` with a **server** timestamp. Returns `{id,ts}`.
- `GET /notes?since=<isots>` — returns notes newer than `since` (ciphertext only),
  oldest-first. Incremental.
- Stores **ciphertext only** — zero-knowledge. A leaked KV dump reveals nothing
  readable.

## Deploy

```bash
npm i -g wrangler
wrangler login
wrangler kv namespace create NOTES          # paste the id into wrangler.toml
wrangler secret put NOTES_TOKEN             # a long random string; also goes in the page
wrangler deploy
# note the deployed URL, e.g. https://jerusha-notes.<account>.workers.dev
```

Then, on the page side (Slice 1b, a decrypt→edit→re-encrypt cycle):
- add the Worker origin to the page CSP `connect-src`,
- add the **"Us"** tab: WebCrypto AES-GCM encrypt on send → `POST`; `GET ?since=` on
  open + while visible; IndexedDB outbox for offline (flush on `online`/load);
  de-dupe by `id`; dual-timezone stamps.

## Runbook

- **Purge junk:** if someone past the passphrase posts garbage, `wrangler kv key
  list` + `delete` by prefix; the E2EE means junk never decrypts, so it's cosmetic.
- **Rotate the token:** `wrangler secret put NOTES_TOKEN` + update the page.
- **Slice 2 (push) will add:** prune dead subscriptions on HTTP 410 from the push
  service (else it noisily fails), VAPID key rotation, and the Cron schedule derived
  from `../claude/plans/jerusha-itinerary.md`.

## Build order (board-approved)

1. **Slice 1 (DONE):** notes relay + "Us" tab thread + E2EE + offline outbox. Works
   as a refresh-on-open thread the moment the Worker is deployed. **No push needed.**
2. **Slice 2 (DONE):** Web Push — VAPID, subscribe-on-unlock, contentless push on new
   note, Cron pushes in her Lahore-morning windows.
   - **Slice 2c (planned):** in-page "Install 💛" button — capture
     `beforeinstallprompt` *inside the payload* (the gate's `document.write` resets
     the document) + iOS Add-to-Home-Screen meta/hint. See
     `../claude/plans/jerusha-location-share.md` (install-button section). Note: on
     Android the OS install offer appears in Chrome's ⋮ menu once the page is live
     on `cruisinginthewake.com` over HTTPS — the custom button is polish.
3. **Slice 3:** itinerary-keyed daily prompts + a decrypt-to-file keepsake export.
4. **Slice 4 (DONE, needs reporter app):** live location share — `POST /loc` +
   `GET /loc?since=` (10-day KV TTL, coords coarsened to ~110 m), rendered as a
   warm-gold breadcrumb + "here now" marker on the radar map (polls every 2 min
   while the radar tab is open). **Source not yet wired:** install OwnTracks on
   your phone (HTTP mode → `POST https://<worker>/loc`, `Authorization: Bearer
   <NOTES_TOKEN>`). Full plan: `../claude/plans/jerusha-location-share.md`.
5. **Slice 5:** notes persistence & durability — verify `note:` keys carry no TTL,
   full-history re-sync to a wiped device, in-page export/import keepsake, and an
   off-Cloudflare ciphertext backup so the thread survives even account loss. Full
   plan: `../claude/plans/jerusha-notes-persistence.md`.

## Decisions needed before deploy

1. ~~Notes key from the page passphrase or a separate one?~~ **DECIDED: same as the
   page passphrase.**
2. Worker host: `*.workers.dev` subdomain, or a `cruisinginthewake.com` route
   (needs the domain on Cloudflare).
3. Confirm ship-time policy (affects Slice 2 push timing) — see the itinerary plan.

> Nothing secret lives in this directory. `NOTES_TOKEN` and (later) the VAPID
> private key are Worker **secrets**, set via `wrangler secret put`, never committed.
