# Jerusha page — notes persistence & durability

**Status:** Planned. Not built. Hardens the notes thread from
[`jerusha-write-back.md`](jerusha-write-back.md) so the conversation is a true
keepsake — it survives cleared phones, a dropped network, and even loss of the
Cloudflare account.
**Target:** the Worker (`admin/jerusha-worker/`) + the encrypted page
(`admin/weather-jerusha.html`).
**Goal:** never lose a note. Not on her phone, not on yours, not if Cloudflare
goes away. The thread is a record of the distance you crossed — treat it like one.
**Last updated:** 2026-06-18
**Build order:** **Slice 5** in `../../jerusha-worker/README.md` (folds the export
half of the deferred Slice 3 into a fuller durability story).

---

## Where notes can be lost today (the threat list)

The current Slice 1 design already persists better than it might look, but there
are real gaps. Each row is a way the keepsake could vanish:

| # | Loss path | Today | Fix (this plan) |
|---|---|---|---|
| 1 | **Unsent note** (composed offline, app closed before flush) | localStorage outbox, flush on `online`/load | Confirm outbox is durable (localStorage, not memory); flush on `online` **and** on next open; never clear until the POST returns `{ok}` |
| 2 | **Her phone wiped / site data cleared** | thread re-fetched from KV via `GET /notes` | Already covered **as long as KV holds** — but that's the single point of failure below |
| 3 | **KV record dropped** | one-key-per-note, **no TTL** → persists indefinitely | Verify no TTL on `note:` keys (unlike `loc:`); document that notes are write-once-keep-forever |
| 4 | **Cloudflare account/namespace lost** | **nothing** — KV is the only copy | **The real gap.** Add an off-Cloudflare backup (export + periodic pull) |
| 5 | **Passphrase lost** | notes are E2EE under the passphrase → **unrecoverable** | Out of scope to "fix" (that's the security model), but document it bluntly so it's a known, accepted risk |

The headline: **notes already persist server-side (no TTL) and re-sync to a
wiped phone. The one thing missing is a copy that survives Cloudflare itself.**

---

## What "persist" means here (three layers)

1. **Server-durable (KV).** Notes are stored one-key-per-note with **no
   expiration** — they live until explicitly deleted. (Contrast Slice 4 location,
   which is deliberately 10-day TTL.) This layer already works once the Worker is
   deployed. Action: *verify and document* that `note:` keys carry no TTL.
2. **Re-syncable (page).** A wiped or new device rebuilds the full thread from
   `GET /notes?since=` (empty `since` = from the beginning). The local copy is a
   cache, not the source of truth. Action: ensure first open with no local state
   pulls the **entire** history, not just "recent."
3. **Off-Cloudflare keepsake (export + backup).** The part that makes it a
   permanent record independent of any provider — below.

## Layer 3 — the keepsake (the actual new work)

### 3a. In-page export ("Save our notes")

- A button on the "Us" tab: **decrypt the full thread in the browser** and offer
  it as a download. Two formats:
  - **`.txt` / `.md`** — human-readable transcript (sender, both-timezone stamps,
    text). This is the thing you'd actually want to re-read in ten years.
  - **`.json`** — the raw `{id,sender,ts,iv,ct}` records (still encrypted), so the
    export can be **re-imported** and decrypted later with the passphrase.
- Runs entirely client-side (the page already holds the key via `window.__JPW`).
  Nothing new leaves the device. Works offline against the local cache.

### 3b. Re-import / restore

- An "import notes" action that reads a previously exported `.json` and `POST`s
  any missing records back to the Worker (de-dupe by `id`). Lets you rebuild KV
  from a backup if a namespace is ever lost or recreated. Low effort, high payoff.

### 3c. Periodic off-site backup (belt-and-suspenders)

- A small scheduled pull — e.g. a `keeper`/cron job on the M4 mini, or a manual
  monthly habit — that `GET /notes` (ciphertext) and writes it to durable storage
  **outside Cloudflare** (the private repo's gitignored store, or local disk).
  - Stores **ciphertext only** — the backup is as zero-knowledge as KV. Safe to
    sit in a private repo or a backup drive; useless without the passphrase.
  - This is the copy that survives a Cloudflare outage, billing lapse, or account
    loss — the gap row #4 above.
- Optional Worker side: a `GET /notes/all` (bearer-only, no `since`) convenience
  endpoint for the backup job to grab everything in one call.

## Decisions / open questions

1. **Retention cap:** the write-back plan floated "cap at last ~1000." For a
   keepsake, recommend **keep everything, no cap** (two people, tiny volume — KV
   free tier is ample). Confirm.
2. **Backup cadence:** manual export only (simplest), or an automated periodic
   pull on the mini? Recommend: ship export/import first (3a/3b), add the
   automated pull (3c) only if you want it hands-off.
3. **Export trigger:** a button you tap, or also an automatic export-on-open into
   the page's own IndexedDB as a second local copy? (Button is enough for v1.)
4. **Passphrase loss is accepted as unrecoverable** — confirm you're OK with that
   (it's the price of E2EE; the alternative is the Worker being able to read your
   notes, which the whole design refuses).

## Build order

This is **Slice 5**. It subsumes the "decrypt-to-file keepsake export" that was
parked inside Slice 3, and adds the import + off-site backup that make the thread
genuinely provider-independent.

1. **Verify layers 1–2 (no code, just confirmation):** `note:` keys have no TTL;
   a fresh page load with cleared local state pulls the whole history. Document.
2. **3a export** (page, decrypt→edit→re-encrypt): "Save our notes" → `.txt` + `.json`.
3. **3b import** (page): read `.json`, POST missing records, de-dupe by `id`.
4. **3c backup** (optional): `GET /notes/all` + a scheduled ciphertext pull to
   off-Cloudflare storage.
