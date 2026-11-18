# Jerusha app: how to change things

**Soli Deo Gloria.**

One short recipe per common job, each with the step that proves it worked. For how the app is built, read
`admin/claude/plans/jerusha-SYSTEM-OVERVIEW.md` first.

Every command runs from the repo root unless it says otherwise. The passphrase and tokens are never typed
into a file, a commit, or a chat. They go in the environment for one command.

---

## Before any change

1. Work in a clean worktree cut from `origin/main`. Fetch and merge main first.
2. Take custody in Tekton (from Project-Sophos). On Ken's MacBook `tekton claim-patron` refuses; name the
   patron on the command line and point preflight at the worktree:
   `node admin/tekton.mjs preflight --query "<task>" --patron <name> --task-id <id> --repo InTheWake --repo-root <worktree>`
   then `checkout --claim <files>`. The claim guard refuses edits to unclaimed files.
3. Preflight writes household hook files into the worktree (`.claude/settings.json`, `.claude/hooks/*`).
   They are not part of your change. Do not commit them.
4. Add an entry to `REASONING-LOG.md` for the change.

---

## Edit the page

```bash
JERUSHA_PASS='...' node admin/jerusha-worker/jerusha-payload.mjs extract
```
Edit `admin/jerusha-src/alaska-trip.payload.html`. It is gitignored and never committed.
```bash
JERUSHA_PASS='...' node admin/jerusha-worker/jerusha-payload.mjs build
```
`build` keeps the salt, uses a fresh IV, and refuses to write unless the result decrypts back to your source.

- **Prove it:** `npx playwright test jerusha-offline jerusha-units jerusha-gallery jerusha-voyage jerusha-calendar`.
- Commit `admin/alaska-trip.html` only. The blob changes on every build, even with no edits, because of the IV.
- New code goes in the plain, commented block marked `Added 2026-11`, not into the old single-line functions.
- A new outside host needs adding to the **gate's** CSP in `alaska-trip.html` itself, not only the payload's.
- If you change a tag that exists in both the gate and the payload, change both.

**Add a test.** The app is one IIFE, so read the DOM. Use `open()` from `tests/playwright/jerusha-open.js`: it
fixes the clock and stubs the Worker, weather and overrides. Then break your new code on purpose and confirm
the test fails. A test that cannot fail proves nothing.

---

## Add or change a voyage

- **A small correction** (a port hour, a note, a renamed stop): edit `admin/family/itinerary-overrides.json`
  on `main`. No passphrase, no rebuild. It can set `arr` and `dep`. It cannot move map lines or pins.
- **A new voyage, or anything structural:** edit `VOYAGES` in the payload source and rebuild. Give it an `id`,
  a `tz`, `start`, `end`, and for each day `d`, `date`, `loc`, `type`, `lat`, `lon`, `pos`, `wx`. Add `arr` and
  `dep` (`"HH:MM"` on the ship's clock) to port days so the strip can say when he is in port.
- Leave `desc`, `booked`, daily prompts and push lines empty unless Ken has given you the words.
- **Prove it:** a fixed-clock test in `jerusha-voyage.spec.js` for a sea day and a port day of the new voyage.

Nothing needs doing to archive a voyage. It moves to the Archive the day after its `end`.

---

## Change the push lines or prompts

Ken writes these. Push lines are in `worker.js` under `VOYAGE_PUSH["<voyage id>"]`, keyed by UTC date. Daily
prompts are `DAYPROMPTS` in the payload, keyed by the voyage's local date. Never invent one.

- **Prove it:** `node --test admin/jerusha-worker/worker.test.mjs` (the cron tests read the lines from the file).

---

## Deploy the Worker

The live Worker is deployed by hand from the M4 mini. The folder there is not a git checkout.

1. **Back up first.** `JERUSHA_TOKEN=... admin/jerusha-worker/jerusha-backup.sh`, and with
   `JERUSHA_BACKUP_BLOBS=1` to save the photos and videos too. Check the files are not empty.
2. On the mini, **diff before you copy**: compare `~/jerusha-worker/worker.js` and `wrangler.toml` with the
   repo. If the mini's copy has lines the repo lacks, bring them into the repo first. Do not overwrite blind.
3. Keep the mini's real KV namespace id. The repo's `wrangler.toml` holds a placeholder. **If the id changes,
   the Worker binds an empty namespace and the thread seems to vanish.**
4. `node --test worker.test.mjs` on the files you are about to deploy.
5. `cd ~/jerusha-worker && wrangler deploy`. Deploy from inside that folder only.
6. **Prove it:** in her app, Us tab, press "Alerts status". It should read out devices, not say the server needs
   the newer version. Send a note each way. Open the Gallery.
7. **Roll back:** `wrangler rollback`. The data is untouched by a deploy or a rollback.

Order matters when both change: **Worker first, then the page.** The page is written to cope with an older
Worker (it says so plainly); the reverse is not guaranteed.

---

## Bump the service worker

Any change to caching rules in `admin/sw-jerusha.js` needs a new `CACHE` name.

- **Prove it:** `npx playwright test jerusha-offline`.
- On a phone: open the app once online, close it, turn on airplane mode, open it again. The gate must appear.
- The registration scope is `/admin/`, which holds many other pages. The worker must only ever answer for its
  own shell, its own static paths, and cdnjs.

---

## Back up and restore the thread

- Back up: `JERUSHA_TOKEN=... admin/jerusha-worker/jerusha-backup.sh` writes to `~/jerusha-backups/`.
- Restore notes: `POST` the notes JSON to the Worker's `/import`. It is idempotent.
- The backup is ciphertext. It is useless without the passphrase, and it is the only copy off Cloudflare.

---

## Rotate `NOTES_TOKEN`

1. `wrangler secret put NOTES_TOKEN` on the mini.
2. Put the same value in the payload source (`NOTES_TOKEN`), rebuild, ship the page.
3. Update OwnTracks on Ken's phone, which uses the token in its URL.
Between steps 1 and 2 the shipped page cannot reach the Worker. Do them together.

**Do not change the passphrase with this recipe.** See the next section.

---

## Change the passphrase

Follow `admin/jerusha-worker/ROTATION-RUNBOOK.md`, every step, in order. Do not improvise.

- The passphrase only wraps the page. Notes and photos are sealed with the data keys in `DATA_KEYS`, a ring
  inside the encrypted page. The first key writes; every key is tried for reading.
- Only `jerusha-payload.mjs rotate` and `drop-legacy` may change the ring. Never edit it by hand.
- Only `jerusha-rekey.mjs apply` rewrites the thread on the server. It saves every original first.
- **Prove a change to any of this:** `node --test admin/jerusha-worker/jerusha-rekey.test.mjs` and
  `npx playwright test jerusha-keys`. The second makes the real page open what the tools sealed.

---

## Ken's calendar

- **Connect:** in Apple Calendar make one iCloud calendar for what she should see, turn on Public Calendar,
  copy the link. On the mini: `wrangler secret put CAL_KEN_URL` and paste it. `webcal://` is fine.
- **Cut off:** turn Public Calendar off, or `wrangler secret delete CAL_KEN_URL`. Her app deletes its saved
  copy the next time it asks and gets a 404.
- The address is public to anyone who has it. Never paste it into a chat, a commit or a file.
- **Parser changes** go in `icsOccurrences` and `calBuild`, with a fixture event under
  `tests/playwright/fixtures/` and a test in `jerusha-calendar.spec.js`. Fixtures hold made-up events only.

---

## The recipes door

See `admin/jerusha-worker/recipes-door/README.md` for setup, the five secrets, how to revoke each, and how to
add a room.

- **Prove a change locally:** `node --test admin/jerusha-worker/recipes-door/worker.test.mjs`, then
  `node admin/jerusha-worker/recipes-door/smoke-local.mjs` with Atlas running on `127.0.0.1:8088`.
- The Worker's allowlist and the `cloudflared` path rule must stay in step. A test checks one against the other.
- Design rule: the door never relies on the app behind it to refuse a request. Widening the allowlist is
  widening what she can read.

---

## Traps already paid for

1. **The gate's CSP rules the page.** New hosts go in the gate.
2. **Never change the manifest `id`.** Android would treat it as a different app and orphan her icon and her
   push subscription.
3. **`short_name` is `Ken` on purpose.** An audit once listed it as a bug. It is not.
4. **Never deploy the Worker from the wrong folder, or with a changed KV id.**
5. **The page blob changes on every build.** A diff in `alaska-trip.html` alone does not mean the app changed.
6. **Two heads.** The gate and the payload both carry some tags. Keep them equal.
7. **The repo config blocks service workers in tests.** A spec that needs one opts in.
8. **A shell function in a command trips the household command guard.** Write plain commands.
9. **`git status` shows a `node_modules` symlink** in a worktree if you made one to run tests. Never commit it.
10. **This repo is public.** Never write a secret, a private address, or a note about where one can be found
    into a file, a test, or a commit message here. Security notes go in Ken's private notes.
11. **A source file from before a rotation is poison.** It carries the old ring. `build` refuses it. Extract
    again; never paste a ring in to get past the refusal.
12. **A test that starts a command-line tool against a server in its own process must not use a blocking
    spawn.** The server freezes and the two wait on each other forever. `jerusha-rekey.test.mjs` uses an async
    spawn for that reason.
13. **The household outward-action guard reads `method: "PUT"` in a shell heredoc as a real submission.** Write
    test code with the editor, not by piping it through a shell command.
