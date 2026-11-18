# Jerusha app: changing the passphrase

**Soli Deo Gloria.**

Read all of this before you run one command. A wrong move here does not break a page. It locks every note and
photo the two of them have ever shared.

This repo is public. Nothing in this file says where any secret is or was. Ken keeps a private rotation note
with the items that cannot be written here. **Read that note first.**

---

## 1. The three secrets, and what each one opens

| Secret | Where it lives | What it opens |
|---|---|---|
| **Passphrase** | In two heads. Never in a file. | The page. The whole app is one encrypted blob in `admin/alaska-trip.html`. |
| **Data keys** | Inside that encrypted page, as `DATA_KEYS`, a ring of random keys. | Notes, photos, videos, and the saved calendar copy. |
| **`NOTES_TOKEN`** | Inside the encrypted page, and as a Worker secret. | The Worker's door. Without it nobody can fetch the ciphertext. |

The ring is the part that makes a passphrase change safe:

- The **first** key in the ring encrypts everything new.
- **Every** key in the ring is tried when reading. AES-GCM refuses a wrong key outright, so the first key that
  answers is the right one.
- An **empty** ring is how the app worked until 2026-11: one data key, derived from the passphrase itself. That
  is why a passphrase change used to be impossible without locking the thread.

So the passphrase only wraps the page. Change it and the ring inside comes along untouched.

---

## 2. Which change are you making?

**A. A plain change.** You want a new passphrase and the old one was never exposed.
One command, then ship the page. Skip to section 5.

**B. The old passphrase may be known to someone else.**
Whoever has it can open any old copy of the page, and so has the data key and the token that were inside it. A
new passphrase alone fixes nothing. You need all of these, in this order: a new passphrase, a new data key, a
new token, a re-key of everything on the server, and then the old key removed. That is section 4.

**The first rotation is always B**, whatever the reason. Until it runs, the only data key is the one derived
from the old passphrase.

---

## 3. What this can and cannot fix

- **It fixes the future.** After B, the old passphrase opens nothing that is live: not the page, not the door,
  not one note or photo on the server.
- **It cannot reach back.** Old copies of the page stay openable with the old passphrase forever. What they
  give up is a dead token and a dead key. Any ciphertext someone copied **before** the re-key still opens with
  the old key. Nothing can change that.
- **Old backups** in `~/jerusha-backups/` are sealed with the old key. Ken decides whether to keep them. Take a
  fresh backup after the rotation either way.

---

## 4. Rotation B, step by step

Each step says how you know it worked. Do not go on until it has.

**Before you start**

- The live Worker must be the one from this repo. The re-key replaces photo bytes through `PUT /media/<id>`,
  which older Workers lack. The tool checks for it and stops before changing anything if it is missing.
- Both phones should be reachable. Each must open the new page once, online, before the old key is removed.
- Work in a clean worktree at `origin/main`. See `CHANGE-GUIDE.md`, "Before any change".

**Step 1. Back up everything, photos included.**
```bash
JERUSHA_TOKEN=... JERUSHA_BACKUP_BLOBS=1 admin/jerusha-worker/jerusha-backup.sh
```
- **Proof:** it prints the note count and `downloaded N` for the blobs, with `failed 0`. Open the folder and
  check the files are not empty.

**Step 2. Make sure your source is the live page.**
```bash
JERUSHA_PASS='<current>' node admin/jerusha-worker/jerusha-payload.mjs extract
```
- `rotate` refuses to run if `admin/jerusha-src/alaska-trip.payload.html` differs from the live page, so unbuilt
  edits are never silently lost.

**Step 3. Make a new token.** Any long random string with no quotes in it. Keep it in your shell for the next
two steps. Do not set it on the Worker yet.

**Step 4. Rotate.**
```bash
JERUSHA_PASS='<current>' JERUSHA_NEW_PASS='<new>' JERUSHA_NEW_TOKEN='<new token>' node admin/jerusha-worker/jerusha-payload.mjs rotate
```
On a first rotation this makes a new random data key, keeps the old one **last** in the ring for reading, swaps
the token, re-seals the page under the new passphrase with a new salt, and proves the result before writing.
On a later rotation add `--new-data-key`, or the data key stays the same.

- **Proof:** it prints `passphrase: changed`, `data keys: 0 -> 2` (or `1 -> 2`), and `token: changed`.
- **From here on, `JERUSHA_PASS` means the new passphrase.**

**Step 5. Test before anything ships.**
```bash
npx playwright test jerusha-offline jerusha-units jerusha-gallery jerusha-voyage jerusha-calendar jerusha-keys
```
- One test in `jerusha-keys` is about the page **before** any rotation. It skips itself once the ring has a
  key in it. Everything else passes.
- **Type the new passphrase on both phones before you ship**, into any notes app, and look at what the
  keyboard made of it. Phones turn straight quotes curly, two dashes into one long dash, three dots into one
  character, and two spaces into a full stop. The gate compares exactly, so a phrase the phone rewrites cannot
  be entered. Plain letters, digits and single spaces are safe. `rotate` warns if it sees a risky character.
- Ken rewrites any plain text that leans on the old passphrase. The private rotation note lists it.

**Step 6. Ship the token and the page together.**
1. On the mini: `wrangler secret put NOTES_TOKEN`, paste the new token.
2. Commit `admin/alaska-trip.html` and merge to `main`.
3. Update OwnTracks on Ken's phone. It carries the token in its URL.

Between 1 and 2 the old page cannot reach the Worker. Keep that gap short.

- **Proof:** on each phone, open the app online, type the **new** passphrase. The thread reads. The gallery
  opens. Send a note each way.

**Step 7. See what is on the old key.**
```bash
node admin/jerusha-worker/jerusha-rekey.mjs audit
```
It reads the ring, the Worker address and the token from your source file. It changes nothing.

- **Proof:** it prints a count for notes and for media. Nothing should be `unreadable`. If something is,
  **stop** and find out why before going further. The tool never deletes what it cannot open.

**Step 8. Re-key.**
```bash
node admin/jerusha-worker/jerusha-rekey.mjs apply
```
What it promises, each one tested in `jerusha-rekey.test.mjs`:

1. Nothing is replaced before its original is saved under `~/jerusha-backups/rekey-<time>/`.
2. Every replacement is read back from the server and must open with the new key to the same content.
3. A photo whose read-back fails gets its original bytes put back.
4. It never deletes anything it cannot open.
5. It says `OK` only if a fresh audit afterwards finds everything on the new key.

- **Proof:** the last line is `OK: everything is on the current key.` Run `audit` again and get the same.
- Safe to run again. Items already on the new key are not touched.

**Step 9. Wait for both phones.**
Do not go on until **both** phones have opened the new page online (the proof in step 6). A phone that was
offline may be holding a note it wrote with the old page, sealed with the old key and waiting to send. It sends
when that phone next opens the app. If the old key is already gone by then, that note can never be read in the
app.

- **Proof:** both of them have told you the new passphrase worked on their phone.

**Step 10. Remove the old key.**
```bash
JERUSHA_PASS='<new>' node admin/jerusha-worker/jerusha-payload.mjs drop-legacy
```
It runs the audit itself against the live server and **refuses** unless the audit is clean. If it refuses, a
late note arrived on the old key: run `apply` again. Then commit and merge the page.

- **Proof:** it prints `dropped 1 old key(s)` and `audit was clean`.
- Each phone keeps its own cached copy of the thread, still sealed with the old key. The first time the new
  page finds a cached note it cannot open, it asks the server once and takes the re-keyed copy. So on each
  phone, open the app online and check the thread reads with no `[locked]` lines.

**Step 11. Close out.**
- Take a fresh backup (step 1 again, with the new token).
- Decide what to do with the old backups and the `rekey-<time>` folder. Both are sealed with the old key.
- Add a `REASONING-LOG.md` entry. Say that a rotation happened and when. Say nothing about why.

---

## 5. Rotation A, the plain change

```bash
JERUSHA_PASS='<current>' node admin/jerusha-worker/jerusha-payload.mjs extract
JERUSHA_PASS='<current>' JERUSHA_NEW_PASS='<new>' node admin/jerusha-worker/jerusha-payload.mjs rotate
```
Run the tests, commit `admin/alaska-trip.html`, merge. Both of them type the new passphrase next time. No
re-key, no token change, no Worker deploy.

This only works once the ring has a key in it. If `rotate` prints `data keys: 0 -> 2`, you are doing a first
rotation, and that is section 4.

---

## 6. If something goes wrong

| What you see | What it means | What to do |
|---|---|---|
| `rotate`: "differs from what ... holds" | Your source has edits the live page lacks. | `build` them first, or `extract` again to discard them. |
| `build`: "your source is stale" | The source was extracted before a rotation. Building it would ship a page that cannot read the thread. | `extract` again. Never edit the ring by hand to get past this. |
| `apply`: "no replace route" | The live Worker is older than this repo. Nothing was changed. | Deploy the Worker, then run `apply` again. |
| `apply`: a `PROBLEM:` line about a photo, "the original was put back" | The new bytes did not read back right. That photo is as it was. | Run `apply` again. If it repeats, stop and look at that one blob. |
| `apply`: "restore it by hand from ..." | A photo is in a bad state on the server. | `PUT` the file named in the message to `/media/<id>`. It is the untouched original. |
| `audit`: `unreadable` is not 0 | Something on the server opens with no key in the ring. | Stop. Do not drop any key. It may have been written by a page from before an earlier rotation. |
| `drop-legacy`: "refusing to drop" | Something on the server still needs an old key. | `apply`, then try again. |
| A phone shows `[locked]` after step 10 | Its cache holds old ciphertext and it is offline, or step 9 was skipped and it sent a queued note sealed with the old key. | Open it online once. If the line stays, the server's copy is on the old key. Run `audit`: it will show as `unreadable`. The old key is in the page as it was before step 10, in git. |
| The new page will not open on a phone | An old page is cached. | Open it online. The service worker fetches the page fresh whenever it can. |
| You need to undo the whole thing before step 8 | Nothing on the server has changed yet. | `git revert` the page commit and set the old token back on the Worker. |

After step 8 there is no going back to the old key, and no reason to. The originals are in the backup folders.

---

## 7. How the pieces fit, for the next person to change them

- `admin/jerusha-worker/jerusha-keys.mjs` is the one place the Node tools learn the ring and the two ciphertext
  formats. The page has its own copy of the same logic inside the payload (`_keyRing`, `_tryKeys`, `_decNote`,
  `_decBytes`). `tests/playwright/jerusha-keys.spec.js` makes the real page open what the module sealed. Change
  a format on one side and that test fails.
- `jerusha-payload.mjs rotate` and `drop-legacy` are the only things that may change the ring. `build` refuses
  a source whose ring is not the live page's ring.
- `jerusha-rekey.mjs` is the only thing that rewrites the thread on the server. Notes go back through
  `POST /import`, which overwrites a note in place when the id and time match. Photos go through
  `PUT /media/<id>`, which replaces bytes and writes no gallery record.
- The Worker never sees a key. It stores and returns ciphertext.

**Known limits, written down on purpose**

1. The Worker returns at most 2000 notes. At that count the audit cannot claim to have seen every note, and it
   says so and will not report `OK`. The thread is nowhere near that today. If it gets there, the Worker needs a
   way to page from the oldest note before another re-key.
2. A re-key downloads every photo and video to check its key. That is all of R2, once per audit.
3. The tool holds one photo or video in memory at a time. The largest allowed is 220 MB.
4. As of 2026-11-12 the re-key has been run only against a local copy of the Worker with in-memory storage. It
   has never been run against Cloudflare. The first live run is the real test of `PUT /media/<id>` on R2. That
   is what the backup in step 1 and the put-back in promise 3 are for.
