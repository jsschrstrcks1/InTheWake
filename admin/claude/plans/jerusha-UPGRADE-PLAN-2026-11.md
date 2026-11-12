# Jerusha app: upgrade plan (November 2026)

**Soli Deo Gloria.**

**Status:** partly built on a branch; see 3.0 Progress. Nothing is deployed. This repo is public, so some
security detail is kept out of this file on purpose and lives in Ken's private notes. Written 2026-11-12 by Claude (claude-fable-5-2) at Ken's request.
**Custody:** Tekton task `jerusha-upgrade-plan-202611`, patron `fable-jerusha`. Work happens in the worktree
`~/itw-wt-jerusha` on branch `claude/jerusha-upgrade-202611`, cut from `origin/main` at `34071479d`.
**Scope set by Ken:** fix everything found in the audit, archive the past cruises, add the December 5 cruise
data, give her read-only access to the Atlas recipes app, and document it all so a future session can change
things easily. **The passphrase change is deferred** (section 8).
**Hard date:** MSC World America sails 2026-12-05. Phases 1, 2 and 5 should be on her phone before then.

## 0. Provenance: where each fact came from

| Fact | Source |
|---|---|
| Page, gate, service worker, manifest, Worker, runbook | Read directly from `~/code/InTheWake` at `origin/main` on 2026-11-12 |
| Contents of the decrypted app (tabs, voyages, functions, storage keys) | A helper agent read the decrypted payload (lines 150 to 451). Treat as reported, and re-verify each item when its fix is built |
| Atlas recipes access model | Read directly: `Project-Sophos/atlas/server/server.mjs`, `cluster/lib/auth-roles.mjs`, `cluster/lib/pwa-scope-family.mjs`, `docs/PWA-SCOPE-FAMILY.md` |
| December cruise sources | `admin/voyage-packs/v0.1.19-msc-world-america-family-dec-2026.md`, `admin/family/itinerary-overrides.json` (empty today) |
| Memory recall | `memory_evidence.py recall` ran twice. It surfaced that the live Worker is hand-maintained on the M4 mini (a4b6e93c). Nothing on sharing Atlas recipes outside the tailnet |
| Argus | Not consulted for this plan. The Jerusha app is one HTML payload and one Worker file. Consult `code_impact` before touching Atlas files in phase 3 |

**Not verified, and the plan depends on them:**
1. Whether the Worker deployed from `~/jerusha-worker` on the M4 mini matches `admin/jerusha-worker/worker.js`.
2. How access control is set on the serving Atlas. Recorded in Ken's private notes, not here.
3. The spike questions in section 5.5 (tunnel, domain, page under another origin, levels, public sites).
4. Her current note count against the Worker's list limit.

## 1. The whole stack, one picture

| Layer | Thing | Where |
|---|---|---|
| Front end | Gate + encrypted app | `admin/alaska-trip.html` (GitHub Pages) |
| Front end | Service worker, manifest, icons | `admin/sw-jerusha.js`, `admin/jerusha.webmanifest`, `admin/jerusha-icons/` |
| Front end | Self-service itinerary fixes | `admin/family/itinerary-overrides.json` |
| Back end | Worker `jerusha-notes` | `admin/jerusha-worker/worker.js`, deployed by hand from the M4 mini |
| Store | KV `NOTES` (notes, tombstones, subs, loc, media metadata), R2 `jerusha-media` | Cloudflare |
| Build | `jerusha-payload.mjs extract` and `build` | `admin/jerusha-worker/` |
| Tests | `tests/playwright/jerusha-gallery.spec.js` | InTheWake |
| New: recipes | Atlas `/recipes*` and `/recipe*`, reached only through the recipes door | Project-Sophos `atlas/server/`; door in `admin/jerusha-worker/recipes-door/` |

A layer that is built but not wired counts as not built. Each phase below ends with the wire it must prove.

## 2. Phase 0: preconditions (before any edit)

1. **Custody. DONE 2026-11-12 for the plan task.** `tekton preflight` against the clean worktree checked out
   `jerusha-upgrade-plan-202611` (receipt `f96857705145...`), and the plan file is claimed (receipt
   `a6386561bdef...`). Register one build task per phase before building. Trap for the next session:
   `tekton claim-patron` refuses on this machine with `tekton_self_quorum_friction`, and preflight refuses a
   checkout whose branch has no upstream. Pass `--repo-root` pointing at a clean worktree and name the patron
   on the command line.
2. **Clean worktree. DONE 2026-11-12.** `~/itw-wt-jerusha`, branch `claude/jerusha-upgrade-202611`, from
   `origin/main`. `~/code/InTheWake` sits on `skynet2/itw-precommit-macos-compat` with another agent's
   uncommitted files. Leave that checkout alone. Preflight syncs household hook files into whatever checkout it
   is pointed at (`.claude/settings.json`, `.claude/hooks/*`); those are not part of this work and are not to
   be committed with it.
   **Phase 0 results, 2026-11-12 (each from the command named):**
   - Backup: `jerusha-backup.sh` exited 0 and wrote `~/jerusha-backups/jerusha-notes-2026-11-12T14-23-19Z.json`
     and `jerusha-media-meta-2026-11-12T14-23-19Z.json` on Ken's MacBook. The script's own count reads about
     eleven note records and three media records. **Limit:** it saves note ciphertext and media metadata only.
     The media blobs stay in R2 with no off-Cloudflare copy. Add a blob backup to the script in Phase 1.
   - **The live Worker is BEHIND the repo.** `GET /push-status` with the bearer token returned HTTP 404, and
     `GET /loc` returned 200 with zero points. The repo's `worker.js` serves `/push-status`, so the deployed
     copy predates commit `6a2c17a80` (2026-08-22). Direction for those lines: repo ahead. The full diff on the
     M4 mini is still required before any deploy, because the mini's copy may also hold lines the repo lacks.
   - Baseline: `playwright test jerusha-gallery` in the worktree: 1 passed. Measured on local Node 26; CI pins
     Node 22 and 24, so this green is a local reading, not the merge gate.
   - Source extracted to the gitignored `admin/jerusha-src/` in the worktree (126323 bytes), needed by the test.
   - `node_modules` in the worktree is a symlink to `~/code/InTheWake/node_modules` (gitignored). Remove it with
     the worktree.
3. **Backup first.** Run `admin/jerusha-worker/jerusha-backup.sh` with the token from the environment. Confirm
   both files are non-empty. The thread is the keepsake. No Worker change ships without a fresh backup.
4. **Diff the live Worker.** On the M4 mini, compare `~/jerusha-worker/worker.js` and `wrangler.toml` against the
   repo. Whichever side has lines the other lacks wins those lines. Record the real KV namespace id outside git.
5. **Baseline.** Run the Playwright spec and record the result before changing anything. A red baseline is
   named, not inherited silently.
6. **Extract the source.** `JERUSHA_PASS=... node admin/jerusha-worker/jerusha-payload.mjs extract` writes the
   gitignored `admin/jerusha-src/alaska-trip.payload.html`. Every page edit happens there, then `build`.

## 3. Phase 1: fix what is broken

Each row names the fault, the fix, and the proof.

### 3.0 Progress

**Phase 1a, built 2026-11-12 in `~/itw-wt-jerusha` (Tekton `jerusha-phase1a-sw-page-202611`). NOT committed, NOT
shipped, NOT on her phone.**

| Item | State | Evidence |
|---|---|---|
| 1.1 service worker offline | Built | `jerusha-offline.spec.js`, three tests. Also stops the worker caching and answering for other `/admin/` pages |
| 1.3 canonical and `og:url` | Built | `jerusha-units.spec.js` |
| 1.11 attribute escaping | Built by fixing `esc` and escaping the two raw attribute builders (media slides, note delete button). Not rebuilt with DOM calls | hostile-value test in `jerusha-units.spec.js` |
| 1.14 timezone per voyage | Built. `tz` field on each voyage; `todayISO(tz)` | two tests in `jerusha-units.spec.js`, one of them a control that Alaska is unchanged |
| 1.16 notes key derived once | Built | No pin of its own. The gallery spec exercises the key |
| 1.2 manifest name | **Corrected and done 2026-11-12.** `short_name` "Ken" was never a fault: Ken confirmed it is deliberate (the icon on her phone is her window to him). The audit read it as a leftover and was wrong. Ken's ruling: keep `short_name` `Ken`; long `name` is `Psalm 37:4 app - Ken`. `id` unchanged. iPhone ignores the manifest and reads `apple-mobile-web-app-title` from the page. Ken's final ruling the same day: iPhone stays `Jerusha` (a longer title with the verse was tried and withdrawn, because iOS shortens long labels under the icon). The title lives in BOTH the plaintext gate and the encrypted payload, and the two must agree: iOS reads whichever head is live when the icon is added | `python3 -m json.tool` parses the manifest |
| 1.4 to 1.8 Worker | Not started. Needs the M4 mini diff and Ken's words for 1.4 | |

Phase 1a test run: `playwright test jerusha-offline jerusha-units jerusha-gallery` printed `8 passed`. The same
specs against the old worker and old payload printed `6 failed`, `1 passed` (the pass is the Alaska control).

**Phase 1b, built 2026-11-12 (Tekton `jerusha-phase1b-page-202611`). Page only. NOT shipped, NOT on her phone.**

| Item | State | Evidence in `jerusha-units.spec.js` |
|---|---|---|
| 1.9 push status panel | Built. "Alerts status" and "Send me a test" in the Us tab. Against today's live Worker it will say the server needs the newer version, because the deployed Worker answers 404 | two tests |
| 1.10 photos on the map by day | Built. A day pin opens that day's photos. Popup object URLs are released when it closes | one test (empty day). Not tested with a real decrypted photo in the popup |
| 1.13 overrides refresh | Built. Location list and picker rebuild; an empty overrides file triggers no reload. Map lines and pins still do not move (named limit, also stated in the overrides file) | one test |
| 1.17 double alerts call | Partly. `refresh()` no longer calls `loadAlerts` twice. The dead nowcast branch and the duplicated dispatch ladder remain | none |
| 1.18 accessibility | Partly. Tabs name their panels, one tab stop, arrow keys, Home, End. Still open: map `role=img`, radar under reduced motion, the popup announcing every time | one test |
| 1.21 alerts honesty | Built. No answer from the feed reads "Alert status unknown ... not an all-clear" | one test plus a control |
| 1.22 forecast range | Built. Days more than 15 days out are not requested and say when the forecast opens | one test plus a control |
| 1.12 object URLs | Partly: the map popup only. Gallery slides and the lightbox still leak | none |
| 1.15, 1.19, 1.20 | Not started | |

Phase 1b test run: the three spec files printed `17 passed`. The Phase 1b tests run against the Phase 1a page
printed `7 failed`, `6 passed`; the six are the four Phase 1a tests and the two controls. Local Node 26 and
desktop Chromium only.

**Build run of 2026-11-12, after Ken said "execute" (Tekton `jerusha-phase2-page-202611`,
`jerusha-worker-fixes-202611`, `jerusha-recipes-door-202611`). All of it is on the branch. NONE of it is
deployed, and none of it is on her phone.**

| Item | State | Evidence |
|---|---|---|
| 4.1 Archive | Built. One closed Archive section; each past voyage whole; open state survives a re-render. Finding: most of the archive already existed as a "PAST VOYAGES" list, so the real work was the section, the removed sentence, and photos by day | `jerusha-voyage.spec.js` |
| 4.1 Photos by day | Built. Button in every day row, live and archived. Day tag wins over nearness. An unread list says so | `jerusha-voyage.spec.js` (tested with stubs; not with a real decrypted photo) |
| 4.1 Stock gallery per voyage; December port photos | **Not built.** Photos and attribution files exist under `ports/img/`, but the captions are written in Ken's voice and are his to write |  |
| 4.2 December data | Port hours added (`arr`, `dep`) from the v0.1.19 pack. Day messages, excursions, prompts and push lines still empty, waiting on Ken |  |
| 4.3 Strip | Built | `jerusha-voyage.spec.js`, ten tests |
| 4.4 Calendar, page side | Built | `jerusha-calendar.spec.js`, fifteen tests, made-up fixtures. Never run against a real export from Ken's calendar |
| 4.4 Calendar, Worker `/cal` | Built in the repo. Not deployed | `worker.test.mjs` |
| 1.4 | Deferred. It goes with the passphrase change (section 8). `AFFIRM` in `worker.js` is unchanged in this build | |
| 1.5 list paging | Built (`listAll`). Not deployed | `worker.test.mjs`, seven paging tests |
| 1.6 uploader | Built, Worker and page | `worker.test.mjs`; `jerusha-units.spec.js` caption test |
| 1.7 push lines per voyage | Built (`VOYAGE_PUSH`). December left empty for Ken | `worker.test.mjs` cron tests |
| 1.8 deploy check | Written as steps in `CHANGE-GUIDE.md`. No script |  |
| Blob backup | Built: `JERUSHA_BACKUP_BLOBS=1` | Run by the helper against a local stand-in server only |
| 5 Recipes door | Worker, tests, tunnel config example and runbook written. **Smoke-tested in a real browser against the Atlas on Ken's MacBook:** page rendered, a recipe opened, `/admin` `/helm` `/photos` `/whoami` refused with 403, every write refused with 405. Not deployed; no tunnel exists | `recipes-door/worker.test.mjs` (30), `smoke-local.mjs` |
| 6 Documentation | `jerusha-SYSTEM-OVERVIEW.md` rewritten; `CHANGE-GUIDE.md` new; Worker README header corrected; pointer comments in `worker.js`, `sw-jerusha.js`, `alaska-trip.html` |  |
| 1.12 rest, 1.15, 1.17 rest, 1.18 rest, 1.19, 1.20 | Not started |  |

Counts from the final run are in the commit message and `REASONING-LOG.md`.

**Findings from this run that change the plan:**
- **The Atlas shell is refused by the door.** `shell-mount.mjs` draws links to every Atlas app, polls weather
  and flood routes, and can redirect to another household host. The recipes page runs without it (seen in the
  smoke test). Section 5.5a's worry about the shell is settled this way.
- **The door refuses the recipes service worker and manifest**, so through the door it is a web page, not an
  installable app. Expect a bookmark, not an icon.
- **Open, unverified:** whether `cloudflared`'s `path` rule matches the query string. If it does, every
  `?id=` request would 404 at the tunnel. Check on the mini before trusting the example config.
- **Open, unverified:** Cloudflare's per-request limit on KV reads against how `GET /notes`, `/loc` and
  `/media` read one record per call.
- **For Ken to know:** the Atlas recipe collections include large sets from published cooks. The door does
  not filter by recipe level, so she sees whatever the allowlisted routes return.
- **Workers were written by helper agents** in scratch and reviewed here: their suites were re-run in the repo
  by the lead session, and the door was then tested in a browser. The helpers' own self-attack tables are in
  the session record, not re-run by the lead.

**How to add a test for this app:** the app is one IIFE, so nothing is callable from a test. Read the DOM.
Fix the clock with `page.clock.setFixedTime`. Stub `**/*.workers.dev/**`. The repo config blocks service
workers; a spec that needs one says `test.use({ serviceWorkers: "allow" })`.

### 3.1 Service worker and install

| # | Fault | Fix | Proof |
|---|---|---|---|
| 1.1 | `sw-jerusha.js` precaches, caches and falls back to `/admin/weather-jerusha.html`, which is now a redirect stub. Offline cannot open the app | Point `PRECACHE`, the shell test, the cache key, the offline fallback and `notificationclick` at `/admin/alaska-trip.html`. Keep the stub path handled so old bookmarks still land. Bump `CACHE` | Playwright: load once online, go offline, reload, the gate renders and unlocks |
| 1.2 | Manifest `name` and `short_name` say Ken | Rename for her. **Do not change `id`.** Changing `id` makes Android treat it as a different app and orphans her installed icon and push subscription | Manifest validates. On Ken's Android test phone the installed app keeps its identity after update |
| 1.3 | Canonical and `og:url` inside the payload still name the old path | Update both | Read back from a rebuilt, re-decrypted page |

### 3.2 Worker

| # | Fault | Fix | Proof |
|---|---|---|---|
| 1.4 | One rotating push line is to be replaced | Deferred to the passphrase change (section 8). Ken supplies the words. Detail is in Ken's private notes | |
| 1.5 | `NOTES.list` is called with `limit: 1000` and no cursor for notes, tombstones, media and location. Past that, results are cut | Page with the KV cursor until `list_complete`. Keep `since` filtering | Unit test against a mocked KV holding more keys than one page |
| 1.6 | Media records do not say who uploaded. The page prints "Added by Ken" for everything | Accept `by=jerusha|me` on `POST /media`, store it, and show old records as Ken per the standing attribution directive | Upload as each role on a test namespace and read the list |
| 1.7 | `DAILY` push lines are Alaska only | Move to a per-voyage table. December lines come from Ken (phase 2) | Cron handler unit test with a fixed date |
| 1.8 | Repo `wrangler.toml` carries a placeholder KV id and the deploy is by hand | Keep the id out of git. Add a `deploy-check` step to the runbook that refuses to deploy when the bound namespace is empty | Dry run on the mini |

Worker changes ship with: fresh backup, deploy from inside `~/jerusha-worker` only, then `GET /push-status` and a
note round trip as the smoke test. Rollback is `wrangler rollback` to the previous version.

### 3.3 The app (inside the payload)

| # | Fault (helper-reported unless marked) | Fix | Proof |
|---|---|---|---|
| 1.9 | Push diagnostics exist on the Worker but the page never calls them | Add a small "Alerts status" panel in the Us tab: subscription count, last push result, a "send me a test" button | Test push arrives on Ken's phone |
| 1.10 | `_showDayMedia` (photos on the map by day) is never called | Bind it to the day markers in `drawRoute` | Click a day pin with a tagged photo on a test namespace |
| 1.11 | Server values (`id`, `kind`, `mime`, `ts`) go into attributes unescaped. `esc` skips quotes | Escape quotes in `esc`. Build those nodes with DOM calls, not string HTML | Unit test with hostile values |
| 1.12 | Object URLs are never revoked | Revoke on slide change, lightbox close and popup close | Heap check in Chrome devtools before and after ten slides |
| 1.13 | `applyOverrides` does not rebuild the location list or redraw routes | Rebuild `LOCS`, the select and the map layers after overrides apply | Put a test override in a local copy and reload |
| 1.14 | "Today" uses Anchorage time for every voyage | Add `tz` per voyage. Compute today in that zone | Unit test at a fixed instant for each voyage |
| 1.15 | Failures are swallowed with no message | Write the reason to the existing status lines and to `#a11y-status`, which is never written today | Kill the network and read the status |
| 1.16 | The notes key is derived again for every note on every render | Derive once per session and reuse | Render time on a long thread before and after |
| 1.17 | Dead nowcast branch, duplicated tab dispatch, double `loadAlerts` | Delete the dead branch. One dispatch table | Existing behaviour unchanged in Playwright |
| 1.18 | Tabs lack `aria-controls` and arrow keys. The live map is `role=img`. The radar loop ignores reduced motion. The popup announces often | Wire tab semantics. Give the map a label and a text summary. Pause radar under reduced motion. Make the popup announce once | axe run plus a keyboard pass |
| 1.19 | Whole-file encryption of large video is heavy on a phone | Keep the format. Set the client cap to what her phone handles in a real test, and say the cap in the upload status | Upload test on a mid-range Android |
| 1.20 | Chunked media has no chunk index bound into the encryption | New uploads bind the chunk index as associated data under a new container tag. Old files still read | Round trip, plus a reorder test that must fail to decrypt |
| 1.21 | NWS alerts cover the U.S. only, so foreign ports always read as clear | Say "no alert feed for this place" for non-U.S. points. A dead feed is never calm | Select Roatan and read the tab |
| 1.22 | Weather asks for dates beyond the forecast range and fails quietly | Skip the call past the range and show the seasonal normal with a label | Read the Voyage tab today |

## 4. Phase 2: voyages

### 4.1 Archive the past cruises

- Add an **Archive** section at the bottom of the Voyage tab. Getaway and Anthem Alaska move there, collapsed,
  each kept whole: itinerary, day messages, booked excursions, route line, and their photos by day.
- Archived voyages are read-only and make no live weather calls.
- Remove the hard-coded sentence that always says Alaska is still here. The archive says it by being there.
- Stock gallery, daily prompts and affirmation sets become **per voyage**. Alaska's stock photos stay with
  Alaska inside the archive.
- Voyage state stays date-driven. A voyage archives itself the day after it ends. No manual step.
- Draw archived routes only when their card is open, to spare her phone.

### 4.2 December 5: MSC World America

The voyage shell is already in the payload (eight days, ports, coordinates, pack link, tracker). What is missing:

| Item | Source | Who |
|---|---|---|
| Itinerary check, day by day, with port hours | Ken's MSC booking is the authority. Cross-check `v0.1.19-msc-world-america-family-dec-2026.md` section 2 | Claude checks, Ken confirms |
| Per-day messages to her (`desc`) | Ken's own words. Not drafted by a model | Ken |
| Booked excursions (`booked`) | Ken's booking | Ken |
| Daily prompts for the sailing dates | Ken's words, or Ken approves drafts | Ken |
| Worker `DAILY` push lines for the sailing dates | Ken's words | Ken |
| Stock photos for Roatan, Costa Maya, Cozumel, Ocean Cay | `ports/img/` in this repo, with attribution sidecars | Claude |
| Voyage timezone, map opening view, flight days | Booking | Claude builds, Ken confirms |
| OwnTracks reporting so the breadcrumb works | Ken's phone, `/loc?k=` form | Ken, with a runbook step |

Anything Ken has not supplied by build time ships empty and honest, never invented. Late changes after the
build go in `admin/family/itinerary-overrides.json`, which needs no passphrase and no rebuild.

**Wire to prove:** on a phone dated inside the sailing, the Voyage tab shows the right day, the prompt card
shows, the cron line matches the date, and the archive holds both past voyages complete.

### 4.3 "Where he is, by the clock" (added 2026-11-12, from the feature discussion with Ken)

**Why this and not the rest.** Ken and Jerusha talk on WhatsApp every day, and Ken cruises more than he travels
otherwise. So the app should not grow messenger features (photos or voice in the thread, status taps, call
scheduling): WhatsApp does those. What a messenger cannot do is read the voyage schedule. On a ship Ken is
often out of signal, and that is exactly when she most wants to know where he is and when he can talk.

| Piece | What she sees | Source | Honesty rule |
|---|---|---|---|
| Right-now strip | His clock, her clock, and today's line: "At sea" or "In port: Roatan until 5:00 PM his time" | The voyage itinerary, in the voyage timezone | Label it "by the schedule". A schedule is a plan, not an observation |
| Last seen | "Phone last reported near Cozumel, 3 hours ago" | The `/loc` breadcrumb, only when it has points | Show the age of the fix every time. No fix means the line is absent, never a guess |
| When he can likely talk | The next port window in HER clock: "Next in port: Tue 6:00 PM to 3:00 AM your time" | Port arrival and departure hours in the itinerary | Say "likely". Port hours change; overrides can correct them without a rebuild |
| Between cruises | The strip shrinks to the two clocks and the countdown to the next voyage | Existing voyage dates | |

Needs: port arrival and departure hours in each voyage day (already owed for December in 4.2), and `tz` per
voyage (built in Phase 1a). It needs **no** Worker change and **no** push, so it can ship with the page fixes
before the December sailing.

Proof: fixed-clock tests for a sea day, a port day inside the window, a port day after sailing, the day before
embarkation, and between voyages; plus a test that the "last seen" line is absent when `/loc` is empty.

**Parked, with reasons, so they are not re-litigated:**

| Idea | Ruling |
|---|---|
| Photos or voice inside the notes thread | No. WhatsApp does it. The thread held about eleven notes on 2026-11-12, which says where the talking happens |
| One-tap travel status, next-call scheduling | No. A WhatsApp message does it |
| Trips that are not cruises (flights, hotels) | No. Ken cruises more than he travels otherwise; the voyage model is the right shape |
| A "Keep" or "Someday" shelf | Maybe later. Small. Revisit after the December sailing if they want a place for it |
| Sealed answers (both answer, reveal together) | Maybe later. Hangs on the existing daily prompt card |
| Reconciliation prompts, "keep this, change that", trivia game | No. Left out on purpose: those are conversations, not features |

### 4.4 Ken's calendar in her app (added 2026-11-12, Ken's ruling)

**The situation.** Ken keeps his days in Apple Calendar and will not use Google Calendar. Jerusha uses Google
Calendar and does not use Apple's. Ken's ruling: **his public calendar endpoint goes in the app. Her calendar is
figured out later.** So this is one-way for now: she sees his days; he does not yet see hers.

**Whole stack.**

| Layer | What | Where |
|---|---|---|
| Source | One iCloud calendar that Ken makes for this purpose and marks Public. It publishes a read-only ICS feed at a long unguessable address | Ken's iCloud |
| Secret | That address, stored as Worker secret `CAL_KEN_URL` (`wrangler secret put`). Never in the repo, never in the page, never pasted into a chat transcript | Cloudflare |
| Back end | New route `GET /cal?who=ken` on `jerusha-notes`. Same token and origin checks as every other route. It fetches the feed and returns the ICS text as is. It parses nothing and stores nothing. The address is fixed by the secret, so the route cannot be used to fetch anything else | `admin/jerusha-worker/worker.js` |
| Front end | The page fetches `/cal`, parses the ICS in the browser, and shows an agenda: the next several weeks, each line in both clocks ("Sun 10:30 AM his time, 8:30 PM yours"). It also feeds the right-now strip from 4.3 ("Ken: preaching until noon his time") | payload, `admin/alaska-trip.html` |
| Offline | The last good copy is kept in `localStorage` with the time it was fetched, and shown with that time when she is offline | her phone |
| Database | None. No migration | |

**Why the Worker and not a direct fetch.** The page's CSP allows only `self`, `*.workers.dev` and the three
weather hosts, and a calendar host is unlikely to allow cross-origin reads. Routing through the Worker also
keeps the address out of the page, so changing it is one secret and no rebuild.

**Honesty rules.**
- This is a step down from her notes. The Worker sees the events in the clear as they pass through. It stores
  nothing, but it is not zero-knowledge. Ken controls exposure by what he puts in that one calendar.
- The address is public to anyone who has it. Treat the calendar as readable by a stranger.
- An empty stretch reads "nothing on Ken's shared calendar", never "Ken is free".
- A feed that cannot be read says so and shows the last copy with its age. It is never shown as an empty week.
- Every view says when the calendar was last fetched.

**ICS parsing: what the first version handles, and what it says when it cannot.**
- Handles: line unfolding; `DTSTART`/`DTEND` as UTC, as local time with `TZID`, and as all-day dates;
  `SUMMARY`; `LOCATION`; `STATUS:CANCELLED`; `RRULE` with `FREQ` of DAILY, WEEKLY, MONTHLY or YEARLY plus
  `INTERVAL`, `BYDAY`, `UNTIL`, `COUNT`; `EXDATE`; a changed single occurrence (`RECURRENCE-ID`).
- Any repeat rule outside that list: show the first occurrence and mark the line "repeats, pattern not shown".
  Never drop the event silently and never guess the pattern.
- Check what iCloud actually emits against a real export from Ken's calendar before trusting this list.

**Proof.**
- Fixture ICS files under `tests/playwright/fixtures/` (made-up events, no real ones), served by a stubbed
  `/cal`, with a fixed clock: a weekly event, an all-day event, a cancelled one, an `EXDATE`, a changed
  occurrence, an unsupported rule, and an event that crosses midnight in one zone and not the other.
- Feed down: the stub returns an error and the page shows the last copy with its age.
- Worker unit test: `/cal` without the token is refused; `/cal` never fetches an address other than the secret.

**Depends on.** A Worker deploy, so the M4 mini diff comes first. It is not promised for the December sailing.
If the Worker is deployed in time it can ride along; the cruise strip in 4.3 does not wait on it.

**Ken's steps.**
1. In Apple Calendar, make a new iCloud calendar for what she should see. Turn on Public Calendar. Copy the
   link. If it starts with `webcal://`, the same address with `https://` is the feed.
2. On the M4 mini, in `~/jerusha-worker`: `wrangler secret put CAL_KEN_URL` and paste it there.
3. To cut it off: turn Public Calendar off in Apple Calendar, or delete the secret.

**Later: her calendar.** The route already takes `who`. Her Google calendar's private feed address would become
`CAL_JERUSHA_URL`, and the same parser reads it. Not designed further until Ken and Jerusha decide.

## 5. Phase 3: read-only recipes from Atlas

### 5.1 What already exists (read directly)

- Atlas has a `recipes` scope in `cluster/lib/pwa-scope-family.mjs`. Its reach is `/recipes`, `/recipe`,
  `/recipes.html`, `/recipes-sw.js`, `/offline`. Tier ceiling is `family`.
- The `family` role cannot write. Recipe corrections need partner clearance or higher
  (`correctionWriteOk` in `server.mjs`). So a family-tier recipes token is read-only by construction.
- Tokens are minted on the owner page `/admin/scopes/mint` and wired through `ATLAS_SCOPE_TOKENS`.
- A browser presents the token as the `atlas_token` cookie or a Bearer header.

### 5.2 What is missing

1. **Reach.** Atlas binds to the tailnet. Her phone is not on it.
2. **A boundary that does not lean on Atlas.** The door must decide for itself what she may read. See the
   design rule in 5.4.
3. **A door from her app.** A Recipes entry in her app that opens the recipes page.
4. **A way to sign her phone in** without her typing a secret.

### 5.3 Reach: decided by Ken on 2026-11-12

**Plan of record: a Cloudflare front door. No Tailscale on her phone.** Fallback: an encrypted snapshot.

| Option | Standing | Why |
|---|---|---|
| **Cloudflare front door** | **Chosen** | She gets the live Atlas app. Nothing at home listens on the public internet. Two gates stand in front of Atlas |
| Encrypted snapshot in R2, read inside her app | Fallback | Nothing at home is reachable at all and it works offline. It is a copy: it goes stale and the server-side tools do not come with it |
| Tailscale on her phone | Set aside | A VPN app on her phone is the thing Ken wants to avoid |
| Tailscale Funnel straight to Atlas | Rejected | Every Atlas route becomes reachable from the internet with the token gate alone in front |

### 5.4 The front door, layer by layer

```
her phone  ->  Worker "jerusha-recipes"  ->  Cloudflare Tunnel  ->  cloudflared on the Atlas host  ->  Atlas 127.0.0.1
              (outer gate: allowlist)       (Access service token)   (dials OUT only, path rule)
```

| Layer | What it does | Where it lives |
|---|---|---|
| Her app | A **Recipes** entry opens the front door in a new tab. Her app's CSP forbids framing and cross-origin fetches to Atlas, and that stays so | payload, `admin/alaska-trip.html` |
| Sign-in | A one-time enrol link carries a door token that lives inside her encrypted app. The Worker checks it and sets a `Secure; HttpOnly; SameSite=Lax` cookie. After that, plain navigation works | new Worker |
| Outer gate | A new Worker, `jerusha-recipes`, separate from `jerusha-notes` so the keepsake thread shares no code with it. It forwards **only `GET`** for the recipes scope prefixes (`/recipes`, `/recipe`, `/recipes.html`, `/recipes-sw.js`, `/offline`) plus the static files the recipes page loads. Everything else it refuses itself and never asks Atlas | `admin/jerusha-worker/recipes-door/` in InTheWake |
| Secrets in the Worker | Her door token, and the Cloudflare Access service token id and secret. All `wrangler secret put` | Cloudflare |
| Tunnel | `cloudflared` on the Atlas host dials out to Cloudflare. The tunnel hostname sits behind a Cloudflare Access policy that admits only the Worker's service token, so the hostname is useless to anyone who finds it | Atlas host |
| Inner gate | **Deferred** to a later task. The door is designed not to need one | Project-Sophos |
| Data | Atlas's existing recipe store. No new store, no migration | Atlas host |

### 5.5 Spike first (answers needed before building)

1. Is `cloudflared` installed on the Atlas host, and which host serves Atlas (`~/atlas-serve`)?
2. Does the Cloudflare account have a domain a tunnel can hang on? `workers.dev` alone cannot host a tunnel
   hostname. If there is no domain, fall back to the snapshot or get one.
3. Does `recipes.html` work under another origin? Check its CSP, its service worker scope, and every absolute
   path it requests. List the exact static files so the allowlist is complete and no wider.
4. How is access control set on the serving Atlas, and what would changing it mean for the other devices in
   the house? Answered in Ken's private notes. Any change there is its own task with its own notice to the family.
5. Which recipes sit above family level? She sees family-level recipes only.
6. Are parts of the recipe collections already public? A comment in `atlas/server/recipes.mjs` says some card
   images point at `github.io` addresses. If the public sites are live and enough for her, say so to Ken before
   building anything.

### 5.5a Spike answers so far (2026-11-12)

| # | Answer | Source |
|---|---|---|
| 1 | Atlas is served from the M4 mini. Whether `cloudflared` is installed there is still open | Ken, in chat |
| 2 | `cruisinginthewake.com` uses Cloudflare nameservers, so a tunnel hostname on a subdomain of it is possible. Still open: whether that zone is in the same Cloudflare account as the `jerusha-notes` Worker | `dig +short NS cruisinginthewake.com`, run 2026-11-12 |
| 3 | The recipes page runs through the door without the Atlas shell. Exact allowlist: `recipes-door/worker.js`, `ROOMS` | helper spike of `atlas/server/web/`, then `smoke-local.mjs` in a real browser |
| 4 | Answered. Kept in Ken's private notes | Ken, in chat |
| 5 (partial) | In the recipes manifest on Ken's MacBook no source carries a `level` key. Not checked: the manifest on the M4 mini, and per-recipe `level` fields | `python3` read of that manifest, 2026-11-12 |

**DECIDED by Ken, 2026-11-12: the door first.** The door is built so that it never relies on the app behind it
to refuse a request. Atlas-side access control is a separate follow-on task, not to be rushed in before the
December sailing. Consequences for the build:
- The Worker holds two upstream secrets: the Access service token id and its secret. Plus her door token.
- The `cloudflared` ingress config on the mini carries only the recipes paths, with a catch-all that returns
  404. The example is `recipes-door/cloudflared-config.example.yml`.
- Proof for the second lock: hit the tunnel with the Access token on a non-recipes path. It must return 404
  from `cloudflared`, with nothing in the Atlas log.

### 5.6 Build steps

1. Run the spike and write its answers into this section.
2. Atlas: no change in this build.
3. Tunnel: create it, point it at Atlas on `127.0.0.1`, add the Access policy. Record the setup in the change
   guide. Prefer infrastructure written down as config over clicks.
4. Worker `jerusha-recipes`: allowlist, method check, enrol link, cookie, upstream headers, a plain refusal page
   for when home is unreachable. A dead upstream says "home is offline", never an empty recipe list.
5. Her app: the Recipes entry and the enrol link, inside the encrypted payload.
6. Any Atlas code change is authored in Project-Sophos first, mirrored to `open-claw-stuff` byte-identical, then
   `~/atlas-serve` is restarted. Measure direction per file before copying. Consult Argus `code_impact` first.

### 5.7 Proofs, from a phone on mobile data with no tailnet

- Through the door with her cookie: the recipes page loads, a recipe opens, a card image loads, search works.
- Through the door: `/helm`, `/admin`, `/photos`, `/flock` and `/whoami` are refused by the Worker, and the
  Atlas access log shows no request for them.
- Through the door: any `POST`, including `/recipe/correct`, is refused by the Worker.
- No cookie: the door refuses.
- The tunnel hostname hit directly, without the Access service token: refused.
- Revoke each secret in turn and the next request fails.
- Stop Atlas: the door says home is offline.

### 5.7a Rooms: how the door grows later (Ken, 2026-11-12)

Build the door with **named rooms**. A room is one short list of paths in the Worker plus one matching rule in
the `cloudflared` config. **Recipes is the only room being built.** Adding a room later is a small documented
change, not a redesign.

Ken's rulings on what else in Atlas she may read:

| Atlas surface | Ruling |
|---|---|
| Recipes | Yes. The room in this plan |
| Weather (`/weather`, `/tempest`, `/tropical`, `/storms`, `/flood`) | **Not now.** Her app already has a weather page. If it is ever wanted, it is its own room with its own spike, and `docs/handoff/WEATHER-PAGE.md` in Project-Sophos must be read first |
| Photos, people, faces, adventures, trips, find, search | Long term, undecided. Not before the Atlas-side access-control task lands, because photo privacy depends on it |
| Home controls | No |
| HELM, assistant, ask, console, admin, network, health, Argus, TV | No. Owner tools and house plumbing |

This sort was made from Atlas's page and route names, not from a full read of each page.

### 5.8 Fallback: the encrypted snapshot

Use it if the spike fails on the domain or on the page running under another origin. Export family-level recipes
to one bundle, encrypt it with her notes key, store it in R2 through `jerusha-notes`, and render a simple
read-only list and detail view inside her app. State the export date on the page, because it is a copy.

## 6. Phase 4: documentation, so the next change is easy

Written in the same commits as the work, not afterward.

1. **Rewrite `admin/claude/plans/jerusha-SYSTEM-OVERVIEW.md`.** It is dated 2026-06-19 and predates the rename,
   multi-voyage, chunked media and push diagnostics. New contents: file map, gate and payload mechanics, every
   Worker route, the KV and R2 data model, crypto formats, every `localStorage` key, the voyage data shape, the
   overrides shape, and the recipes door.
2. **New `admin/jerusha-worker/CHANGE-GUIDE.md`.** Short recipes for the common jobs, each with its proof step:
   - edit the page (extract, edit, build, verify, commit)
   - add or change a voyage, and when to use the overrides file
   - change push lines and prompts
   - deploy the Worker from the mini, smoke test, roll back
   - bump the service worker cache and confirm a phone picked it up
   - back up and restore the thread
   - rotate `NOTES_TOKEN`
   - the recipes door: the tunnel, the Access policy, the secrets, how to revoke each, how to widen or
     narrow the allowlist
   - the traps: gate CSP rules the page, manifest `id` must not change, never deploy from the wrong folder
3. **Fix `admin/jerusha-worker/README.md`.** Its header still calls push future work, and it says nothing
   secret lives in the directory.
4. **Pointer comments** at the top of `alaska-trip.html`, `sw-jerusha.js` and `worker.js` naming the overview and
   the change guide, so a reader who opens code first meets them.
5. **Passphrase rotation runbook**, written now and not executed (section 8).
6. **Atlas side:** add the front door to `docs/PWA-SCOPE-FAMILY.md` as a consumer of the `recipes` scope.
7. **Memory.** Encode to Alethia: where the app lives, the build tool, the manifest `id` trap, the recipes door.
   Update memory a4b6e93c if the mini's copy is brought under a tracked deploy.
8. **InTheWake `REASONING-LOG.md`** entry per phase, as that repo requires.

## 7. Phase 5: verify and ship

1. Playwright: gate unlock, offline open, notes round trip against a test namespace, media upload and delete,
   voyage state at fixed dates, archive present, hostile-attribute test.
2. Self-attack before ship: attack the stated claims, not the code. Offline really opens. A family token really
   cannot write. The archive really is whole. Old chunked videos really still play.
3. Device pass on Ken's Android and iPhone before her phone sees it.
4. Ship order: Worker first (it must accept old and new page versions), then the page, then the service worker
   bump. Then ask her to open the app once online.
5. Rollback: `wrangler rollback` for the Worker, `git revert` for the page. The data is untouched by either.
6. Done means she can use it: she opens the app in Lahore, sees December, finds Alaska in the archive, sends a
   note, gets a push, and opens a recipe.

## 8. Deferred by Ken: the passphrase change

Not in this build. Recorded so it is not lost.

- The page key and the notes and media key both come from the one passphrase. Re-encrypting the page alone
  would lock every existing note, photo and video.
- Design for the rotation runbook: introduce a random data key that encrypts notes and media, and store it
  wrapped by the passphrase. After a one-time migration, a passphrase change only re-wraps the data key and
  re-encrypts the page. The migration must run on a device that holds the old passphrase, with a backup taken
  first and a read-back check before any old ciphertext is removed.
- `NOTES_TOKEN` rotates at the same time, since it sits inside the encrypted page.
- Item 1.4 (one push line to replace) is done in the same change.
- The reasons this should not wait long are in Ken's private notes.

## 9. Order and dependencies

1. Phase 0, all of it.
2. Phase 1 Worker fixes (1.4 to 1.8), deployed and smoke tested.
3. Phase 1 page and service worker fixes.
4. Phase 2 voyages. Needs Ken's words and booking details.
5. Phase 5 verify and ship for phases 1 and 2. **Target: before 2026-12-05.**
6. Phase 3 recipes. Independent of the cruise date. Starts with the spike in 5.5, ends with a test on her phone.
7. Phase 4 documentation lands inside each of the above, and is checked as a whole at the end.

## 10. What Ken needs to supply or decide

1. Free the Tekton pool name on this machine, or grant an operator allowance.
2. Run the live Worker diff on the M4 mini, or give a session there.
3. The replacement words for the push line in 1.4.
4. December content: day messages, booked excursions, prompts, push lines. Confirm the itinerary.
5. Recipes reach is decided: the Cloudflare front door. Still needed: whether `cloudflared` is on the mini, and
   whether the Cloudflare account that holds the domain is the one that holds the Worker.
6. What her app should be called on her home screen.

**Soli Deo Gloria.**
