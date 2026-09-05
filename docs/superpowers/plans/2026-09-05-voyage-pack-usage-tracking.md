<!-- Soli Deo Gloria. "Whatever you do, work heartily, as for the Lord" — Col 3:23. -->

# Voyage Pack Usage Tracking & Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Load the `dataviz` skill before Task 8 (the dashboard) and the `accessibility-audit` skill before shipping any page.

**Status:** PLAN — nothing below is built. D2 is decided (Atlas-served, tailnet-only, owner token; §4.1). D1 (§2.1) is Ken's before Phase C starts. Phases A and B need no decision beyond an API key installed on the Atlas node and can start now. The work now spans two repos: InTheWake (registry, tracker, site events) and open-claw-stuff (snapshot job, launchd plist, dashboard, Atlas routes).

**HLS:** `itw-voyage-packs-usage-dashboard` (registered 2026-09-05, patron `syl`). Related open tasks: `itw-voyage-packs-paywall-platform` (P2, gates sales data), `itw-voyage-pwa-integration` (P2, changes `companion.js` — coordinate). Open PR **#2565** (Icon of the Seas pack) edits `voyage-packs.html`; Task 3 must union-merge with it, never overwrite.

**Goal:** Answer, per pack and across all packs, four questions Ken cannot answer today — *is anyone using this at all, how many, which parts, and when (before / during / after the sailing)* — on one dashboard, without collecting anything about any individual traveler.

**Architecture:** A machine-readable pack registry (`packs.json`) becomes the single source of truth that ties every surface of a pack together (landing card, PDFs, HTML render, PWA companion). Every surface emits a small, fixed vocabulary of anonymous Umami events keyed by pack slug. A launchd job on the Atlas node pulls aggregates from the Umami Cloud API into an off-git snapshot under `$ATLAS_DATA`; Atlas serves a dependency-free dashboard page over that snapshot at `/admin/voyage-usage`, reachable only on the tailnet and only to the owner token. Nothing personal is ever sent: no names, no handoff-card values, no user IDs, no cookies.

**Tech Stack:** Umami Cloud (already on every site page and on the three pack HTML renders, website id `9661a449-3ba9-49ea-88e8-4493363578d2`), vanilla ES5-compatible JS (the PWAs are ES5 by convention), `node:test` unit tests in both repos, a launchd plist on the Atlas node holding the Umami key, Atlas's existing tailnet bind and owner-only `/admin` gate. No new dependencies.

---

## 1. What exists today (measured 2026-09-05, not assumed)

### 1.1 The product surfaces

| Surface | Count | Where | Analytics today |
|---|---|---|---|
| Landing page | 1 | `/voyage-packs.html` | GA4 + Umami pageviews. Buy buttons are **placeholder** `buymeacoffee.com/inthewake/extras/…` links; no click events. |
| Pack sources (`.md`) | 18 | `admin/voyage-packs/vN.N-*.md` | n/a (source) |
| Built PDFs (full / condensed / handoff card) | 26 | `admin/voyage-packs/*.pdf` | **None possible client-side.** Served as static files from GitHub Pages behind Cloudflare; GitHub Pages exposes no request logs. |
| Offline-capable HTML renders | 3 | `admin/voyage-packs/v0.1*.html` (Symphony, NCL Aqua, Sisters at Sea) | Umami pageviews only. Print / PDF buttons (`data-print-scope`, `data-pdf-scope`) and the handoff card (`assets/js/handoff-card.js`, localStorage) emit nothing. |
| PWA companions | 14 | `admin/voyage-pwa/*.html` + shared `companion.js`, `sw.js` (cache `voyage-v4`) | **None.** Each carries a CSP whose `connect-src` allows only the three weather APIs, and each promises in its footer: *"No tracking, no ads, not a financial product."* (14 pages + the default string in `companion.js`). |
| Family weather page | 1 | `admin/family/weather-family.html` | None; same promise. **Out of scope** (not a pack). |

The landing page links to **no** PDF and **no** PWA directly (verified by grep); the PWAs link to the PDFs (`pdfFull` / `pdfCondensed` in `window.__VOYAGE`), and five of the fourteen point `pdfFull` at maulsbytravel.com rather than at a pack, so "PDF opened" is only observable where the link is ours.

### 1.2 Hosting facts that shape the design

- Production is **GitHub Pages behind Cloudflare** (`x-github-request-id` + `server: cloudflare` on the live response this session). The `_headers` / `_redirects` files are Netlify-era and inert here. Consequence: there are no server logs to mine; everything we learn must come from the browser.
- The deploy workflow uploads the **entire repository** (`static.yml`, `path: '.'`). Anything committed under `admin/` is **public**. That is why (D2) neither the dashboard nor its data lives in this repo at all: only the pack registry (`packs.json`, which holds nothing a visitor cannot already see on the site) stays here, and Atlas reads it from the live site.
- `sw.js` for the PWAs only caches same-origin requests under `/admin/voyage-pwa/` plus the Leaflet CDN. A third-party tracker script is therefore never available offline — which matters, because the PWA's whole purpose is use **at sea, with no signal**.

### 1.3 Analytics facts (verified against docs.umami.is this session)

- Site pages load `https://cloud.umami.is/script.js` with the website id above. Click events can be declared with `data-umami-event="…"` and `data-umami-event-<prop>="…"` attributes, or fired with `umami.track(name, data)`. Event names are limited to **50 characters**.
- Umami accepts events **without the tracker script** at `POST https://cloud.umami.is/api/send` with body `{"type":"event","payload":{"website","hostname","url","name","data",…}}`, no auth, and a real `User-Agent` header required. This is what makes an **offline queue** possible: store events locally, flush when the network returns.
- Read API: base `https://api.umami.is/v1`, header `Authorization: Bearer <api-key>`, **50 calls per 15 seconds per key**. Endpoints used here: `GET /websites/:id/stats`, `GET /websites/:id/metrics?type=path|event`, `GET /websites/:id/events/series`, `GET /websites/:id/event-data/values?event=…&propertyName=…`, all taking `startAt`/`endAt` in **milliseconds**, plus a `filters` object (path, event, etc.).
- GA4 (`G-WZP891PZXJ`) is also on the site. It is **not** used as a source here: its Data API needs a service account and OAuth, and two sources of truth for the same number is a disagreement waiting to be adjudicated. GA4 stays as a manual cross-check only.
- `[unverified]` Whether Ken's Umami Cloud tier includes API-key access, and its monthly event allowance, were **not** checked — that is Decision D4 below and the first thing Phase A verifies.

### 1.4 What is invisible today, and stays partly invisible after this plan

| Question | Today | After this plan | Permanent floor |
|---|---|---|---|
| Did anyone open the landing page? | Yes (pageviews) | Yes | ad-blockers block `cloud.umami.is` (undercount, unmeasured share) |
| Did anyone click Buy? | No | Yes | — |
| Did anyone buy? | No (placeholder buttons) | **No** until the paywall platform is chosen (`itw-voyage-packs-paywall-platform`) | — |
| Did anyone open a PDF? | No | Only when opened from a link we control (PWA / HTML render / article); a PDF opened from a saved file or an email attachment is invisible forever | yes — a floor, never a ceiling |
| Did anyone use the PWA at sea? | No | Yes, delivered late: events queue offline and flush when the phone finds signal | the queue is per-device localStorage; a cleared browser loses it |
| Did anyone fill the handoff card? | No | Yes — a single boolean per device per pack, never the contents | — |

**Read every number on the dashboard as "at least this many."** The plan bakes that phrase into the page header so nobody, including a future Ken, reads a floor as a total.

---

## 2. Decisions for Ken (the plan proceeds on the stated default until he says otherwise)

| # | Decision | Recommended default | Why it is his, not mine |
|---|---|---|---|
| **D1** | **PWA telemetry vs. the "No tracking" promise — wording stays.** (Revised 2026-09-05 after Ken ruled out changing the footer.) Fourteen shipped companions tell travelers *no tracking*, and that sentence is not being edited. So the question becomes: what measurement is still honest under that sentence? Three settings, from strictest to loosest — see §2.1. | **Setting 1, "counts only."** Events leave the phone through a geo-blind first-party relay that discards the sender's IP before anything reaches Umami. What survives is *how many times* a feature was used on which voyage day, and which features were used together in one sitting — never who, never where from, never a thread between two sittings. That is measurement of the app, not tracking of a person, and the footer stays true on its plain reading. | The line between "counting" and "tracking" is a judgment about a promise Ken made; the plan can only make the options and their costs legible. |

### 2.1 The three settings behind D1 (what each can answer, and what it costs the promise)

| Setting | Mechanism | Can answer | Cannot answer | Promise |
|---|---|---|---|---|
| **1 — Counts only** *(recommended)* | Events → **geo-blind relay** (Cloudflare Worker, Task 5b) → Umami. The relay drops the client IP and User-Agent, re-validates the property whitelist server-side, and forwards. Umami therefore sees one "visitor" (the relay) and no geography. | Used at all? Which tabs? Which voyage day (`day` index)? Before / during / after? How many opens? Which features go together in one sitting (`vp_pwa_session`)? | How many *people*. Where they are from. Whether Tuesday's open and Thursday's open were the same phone. | **Kept on its plain reading.** Nothing about a person is collected or derivable. The card never leaves the phone. |
| **1.5 — Counts with coarse place** *(Ken's ask, kept honest)* | Same relay as Setting 1, but the Worker reads the **state/province and country** Cloudflare already attaches to every request (`request.cf.region`, `request.cf.country` `[unverified recollection: field names not confirmed against Cloudflare's Workers docs this session]`), adds them as `region` / `country` properties, and still discards the IP and user agent. City is never read. | Everything in Setting 1, plus "one sitting from Florida used Now, Day 4 and Radar" — the sentence Ken asked for, at state level. | How many *people*; whether two sittings were the same phone; city. | **Kept on its plain reading, with one honest caveat:** a state is an area, not a person. Nothing identifying is created; Umami still sees only the relay. For a hosted-group pack, state-level place plus a per-sitting tab list is a statistic, not a face. |
| **1.5 + daily link** *(optional dial, default off)* | The relay adds a `sitting_key`: a hash of IP + user agent + the calendar day + a secret held only by the Worker. It links sittings **within one day** and cannot link across days; the secret never leaves the Worker and the IP never leaves the relay. | Daily unique devices per pack, and "the same phone opened it three times on Day 4." | Anything across days, by construction. | **This is the same technique Umami applies on every other page of the site today** `[unverified recollection of Umami's method; see Setting 2]`, done in our own code where we can read it. Whether a same-day link is "tracking" is the judgment call; the plan's default is off, because opens answer the question well enough and the promise is worth more than the extra column. |
| **2 — Umami standard** | Events straight to `cloud.umami.is`, as the landing page and HTML renders already do. Umami derives country / region / city from the IP and a daily-rotating visitor hash `[unverified recollection: hash of IP + user agent + salt; not confirmed from Umami's docs this session]`. | Everything above, plus Umami's own sessions and journey reports (a visitor's steps within a day). | Cross-day identity (by design). | **Defensible but arguable.** `privacy.html` already defines Umami as "does not track personally identifiable information," so the site's own vocabulary is consistent. A traveler's plain reading of "No tracking" is broader. **Correction 2026-09-05:** an earlier draft argued that city-level geography on a hosted-group pack would let the host recognise a guest. Ken pointed out that he does not know who is on those sailings and the host has no access to any of this data, so the practical re-identification risk is smaller than that sentence claimed. What remains is narrower and still real: the dashboard is public (§1.2), so nothing finer than state may ever appear on it, and Umami would hold city-level data about travelers that nobody needs. The objection to Setting 2 is therefore about the *promise's plain reading* and about creating unneeded data, not about a specific person being exposed. |
| **3 — Journeys** | Per-visitor path following: "one from Hudson FL visited Weather, then Day 4, then Forecast." | Everything. | — | **Broken.** Following one person's steps is what the word "tracking" means, whether or not a name is attached. Declined; not built under any wording. |

**Fence that holds in every setting:** the dashboard never shows anything finer than state/province, and never city. Handoff-card contents, chosen weather location, and unit preference never leave the device. (The earlier, stricter "no geography at all for hosted-group packs" was built on the host-recognises-a-guest argument that Ken corrected; it is relaxed to state level, which is where the plain-reading argument, not the host argument, draws the line.)

**What Setting 1 still gives Ken, concretely:** "The Sisters at Sea companion was opened 41 times during the sailing; Day 4 and the Now tab were the most-opened; 9 sittings used Radar; the emergency tab was opened 6 times; nothing at all was opened on the Bliss Alaska companion in 90 days." That answers *is it used, which parts, when* — three of the four questions — and gives up *how many people* in exchange for the promise. A floor on opens is an honest proxy: 41 opens on a 30-guest sailing is not zero people.
| **D2** | **Dashboard visibility.** | **DECIDED by Ken, 2026-09-05: the dashboard is served only by Atlas, only on the tailnet, only to a caller holding the token.** Nothing about usage is committed to the public InTheWake repo or deployed to cruisinginthewake.com. The page lives at `/admin/voyage-usage` on Atlas, which the existing central gate already makes owner-only (`OWNER_ONLY_PREFIXES` = `/helm`, `/admin` in `cluster/lib/auth-policy.mjs`); the snapshot data lives under `$ATLAS_DATA/voyage-usage/`, off git like every other Atlas data file; the Umami API key lives in the launchd plist's environment on the Atlas node, never in a repository or a GitHub secret. See §4.1. | Decided. |
| **D3** | **Source of truth.** Umami only, GA4 as manual cross-check. | As stated. | Cheap to reverse; flagged so it is a choice, not a drift. |
| **D4** | **Umami Cloud tier.** API keys and event quota may be plan-gated. | Ken generates an API key in the Umami Cloud dashboard and stores it as the repository secret `UMAMI_API_KEY`. If the tier refuses, fallback is a self-hosted Umami on the Cloudflare tenant (memory `e74cbef8` already assumes that tenant for the paywall) — a separate task, not this plan. | Account access is his. |
| **D5** | **Sales data.** | Deferred behind `itw-voyage-packs-paywall-platform`; Task 11 leaves a typed seam so the processor's webhook can land purchase counts in the same snapshot later. | Already an open HLS decision. |

---

## 3. Event vocabulary (the contract every surface honors)

All events go to the one existing Umami website. Names are ≤50 chars, prefixed `vp_`, and carry **only** these properties. Anything not in this table is a bug.

| Event | Fires when | Properties | Surface |
|---|---|---|---|
| *(pageview)* | Landing / pack HTML / PWA page load | Umami default (path, referrer, browser — no cookies) | all |
| `vp_buy_click` | A Buy button is clicked | `pack`, `price` | landing |
| `vp_pdf_open` | A link to one of **our** PDFs is followed | `pack`, `variant` ∈ `full\|condensed\|handoff` | PWA overview, pack HTML, articles |
| `vp_print` | A `data-print-scope` button is used | `pack`, `scope` ∈ `emergency-only\|entire-pack` | pack HTML |
| `vp_pdf_download` | A `data-pdf-scope` button generates a PDF | `pack`, `scope` | pack HTML, reaching-someone-at-sea |
| `vp_handoff_filled` | First time on this device that ≥1 handoff field is non-empty | `pack` | pack HTML, PWA emergency tab |
| `vp_pwa_open` | PWA shell built | `pack`, `standalone` (bool), `offline` (bool), `phase` ∈ `before\|during\|after`, `day` (voyage day index, or `0` outside the sailing) | PWA |
| `vp_pwa_session` | One sitting ends (`visibilitychange → hidden`); replaces per-tab events so no two events can be stitched into a path | `pack`, `phase`, `day`, `tabs` (sorted, de-duplicated tab names joined by `,`, e.g. `now,radar,voyage`) | PWA |
| `vp_pwa_install` | `appinstalled` window event | `pack` | PWA |

Under Setting 1 (§2.1) every PWA event travels through the geo-blind relay, so the properties above are the **entire** record Umami ever holds for a sitting: no IP, no user agent, no visitor hash, no timestamp finer than the day it was flushed.

`phase` is computed **on the device** from the itinerary dates already in `window.__VOYAGE` (today < first date → `before`; within → `during`; after → `after`). It is the single most useful bit on the dashboard: it says whether the companion is used *on the ship*, which is the thing it was built for.

**Never sent:** handoff-card values, the selected weather location, unit preference, anything else from `localStorage`, `umami.identify()`, any query string. Umami's `data-umami-event-*` attribute path is used only for static clicks (Buy buttons); everything dynamic goes through the one shared module so the property whitelist lives in one place.

**Do-Not-Track / GPC:** the shared module sends nothing when `navigator.doNotTrack === "1"` or `navigator.globalPrivacyControl === true`. Cheap, honest, and it means the promise text can say so.

---

## 4. What the dashboard answers

One page, served by Atlas at `/admin/voyage-usage`, reading `/admin/voyage-usage/snapshot.json` from the same origin. Sections, top to bottom:

1. **Header with the floor statement** and the snapshot timestamp + window (last 30 / 90 / 365 days toggle, all pre-computed in the snapshot).
2. **Across all packs**: landing pageviews, unique visitors, Buy clicks and click-through rate, PDF opens, PWA opens, PWA installs, handoff cards filled. Seven stat tiles with 12-week sparklines (inline SVG, no library).
3. **Per pack table** (one row per registry entry, sortable by column, `<th scope="col">`, caption, SR-friendly): sailing date, days until/since, landing views, Buy clicks, PDF opens by variant, PWA opens split `before / during / after`, top tabs, installs, handoff filled, **last activity**, and a plain-language status: `unused (0 events in 90d)`, `quiet`, `active`, `sailing now`.
4. **"Is anyone using it at all?" list** — packs with zero events in the window, called out explicitly, because that is the question Ken asked first and a sortable table hides zeros.
5. **Instrumentation coverage** — which surfaces of each pack are instrumented (from the registry) so a zero is legible as *nobody came* rather than *nothing was listening*. Three states, never two: `measured`, `no-instrument`, `unavailable` (snapshot fetch failed for that metric).
6. **Data provenance footer**: source (Umami website id), API calls made, rate-limit waits, failures, and the commit that produced the snapshot.

Every chart mirrors into a visually-hidden table (the drink-calculator `#chart-sr-table` pattern). Reduced-motion and high-contrast media queries as on the calculator. Chaste voice; no dashboard cheerleading.

### 4.1 Where it runs, and who can reach it (D2, measured against the Atlas code 2026-09-05)

| Layer | Mechanism already in Atlas | What it gives this dashboard |
|---|---|---|
| Network | `atlas/server/atlas-bind.sh` resolves `ATLAS_BIND` from `tailscale ip -4` and refuses to start without one; `main.mjs` listens on that address (loopback only as a loud failover). | Unreachable off the tailnet. No Cloudflare, no public DNS, nothing to leak. |
| Identity | `resolvePrincipal()` in `cluster/lib/auth-roles.mjs`: a token as `Authorization: Bearer …` or the `atlas_token` cookie, else a mapped Tailscale identity (#704 SSO). `ATLAS_OWNER_TOKEN` / `ATLAS_TOKEN` is the owner secret; partner and family tokens are lower tiers. | "Those who have the token." |
| Policy | `decideAccess()` in `cluster/lib/auth-policy.mjs`: any path under `/admin` or `/helm` requires the **owner** role even to read; an unknown or missing token fails closed with 401 once role secrets are configured. Every decision is recorded by the #703 audit log, readable at `/admin/audit`. | Placing the page and its JSON under `/admin/voyage-usage` makes it owner-only **with no policy change at all**, and every read of it is audited. |
| Data | `$ATLAS_DATA` (default `~/atlas-data`) holds off-git files (`face-consent.json`, `recipes-manifest.json`, the storm archive). | `$ATLAS_DATA/voyage-usage/snapshot.json` and `history.ndjson` live there. Never in a repo. |
| Cadence | launchd plists in `atlas/deploy/*.plist.example` (`com.atlas.adventures-poll` runs a poller every 15 minutes with its secret in the plist's `EnvironmentVariables`, installed by hand, kept out of git). | The snapshot job runs the same way, with `UMAMI_API_KEY` in the installed plist on the Atlas node only. |

**One nuance for Ken to confirm.** With #704 tailnet SSO configured, a mapped Tailscale identity resolves to a role **without** presenting a token. If "and to those who have the token" means the token is required even on the tailnet, the fix is small and explicit: the two `/admin/voyage-usage` routes check `presentedToken(req.headers)` themselves and refuse an SSO-only owner. The plan's default follows the existing gate (token **or** mapped identity, owner role either way), because that is the posture every other owner surface on Atlas already has; say the word and Task 8 adds the stricter check.

**What happens when Atlas is down.** The relay and Umami keep collecting; only the *view* is unavailable. The next snapshot run backfills the windows, because every window is recomputed from Umami on each run rather than accumulated locally.

---

## 5. File structure

| Path | Role | New / Modify |
|---|---|---|
| `admin/voyage-packs/packs.json` | **Registry SSOT.** One record per pack: slug, title, status, sailing dates, price, landing anchor, PDF paths (full/condensed/handoff), HTML render path, PWA companion path, host, instrumentation flags. | New |
| `admin/voyage-packs/packs.schema.json` | JSON Schema for the registry (documents the shape; validator reads it) | New |
| `admin/scripts/check-voyage-registry.mjs` | Registry ↔ disk cross-check, three-state exit (0 clean / 3 drift / 2 unavailable); wired into `quality.yml` | New |
| `assets/js/voyage-usage.js` | **The one tracker module.** Property whitelist, DNT/GPC guard, offline queue, flush via `umami.track` when present else `fetch` to `/api/send` | New |
| `voyage-packs.html` | `data-umami-event` attributes on the four Buy buttons | Modify (union with PR #2565) |
| `admin/voyage-packs/v0.1*.html` ×3 | Include tracker; `data-pack` on `<main>`; hook print/PDF buttons and handoff card | Modify |
| `assets/js/handoff-card.js` | Emit `vp_handoff_filled` once per device (guarded by a localStorage flag) | Modify |
| `assets/js/pdf-download.js` | Emit `vp_pdf_download` on success | Modify |
| `admin/voyage-pwa/companion.js` | *(Phase C, gated on D1)* emit `vp_pwa_open`, `vp_pwa_tab`, `vp_pwa_install`, `vp_pdf_open`; new footer default text | Modify |
| `admin/voyage-pwa/*.html` ×14 | *(Phase C)* CSP `connect-src` + tracker include + footer text | Modify |
| `admin/voyage-pwa/sw.js` | *(Phase C)* precache `/assets/js/voyage-usage.js`; bump `voyage-v4` → `voyage-v5` | Modify |
| **open-claw-stuff** `atlas/server/voyage-usage-snapshot.mjs` | Pulls the Umami API → `$ATLAS_DATA/voyage-usage/snapshot.json` (+ appends `history.ndjson`); three-state exit; throttled to the 50/15s limit; `--print` renders the per-pack table to the terminal instead. Modeled on `atlas/server/snapshot.mjs` (the storm archiver). | New |
| **open-claw-stuff** `atlas/deploy/com.atlas.voyage-usage-snapshot.plist.example` | launchd template: daily run, `UMAMI_API_KEY` + `ATLAS_DATA` in the plist environment, installed by hand on the Atlas node, never committed filled-in | New |
| **open-claw-stuff** `helm/admin/voyage-usage.html`, `helm/admin/voyage-usage.mjs` | The dashboard page and its module, served under the owner-only `/admin` and `/helm/` prefixes; styled with `helm/helm.css`; strict per-page CSP like `helm/admin/benchmark.html` (no inline script, `connect-src 'self'`) | New |
| **open-claw-stuff** `atlas/server/server.mjs` | Two routes in the buffered branch next to `/admin/benchmark`: `GET /admin/voyage-usage` → the HTML; `GET /admin/voyage-usage/snapshot.json` → the data file from `dataDir`, `NO_STORE`, 503 with `{state:"unavailable"}` when the file is absent | Modify (additive, ~12 lines) |
| **open-claw-stuff** `docs/SERVICE-RESTART-REGISTRY.md` | One row for the new plist (the registry check requires every service-defining file to be named) | Modify |
| `$ATLAS_DATA/voyage-usage/snapshot.json`, `history.ndjson` | Off-git data on the Atlas node | Generated |
| `tests/unit/voyage-usage/*.test.mjs` (InTheWake) | node:test suites: registry check, tracker queue | New |
| **open-claw-stuff** `atlas/tests/voyage-usage-snapshot.test.mjs`, `atlas/tests/voyage-usage-route.test.mjs` | Snapshot aggregation (fixtures, null-never-zero, 429 handling); the two routes deny a partner/family token with 403 and an absent token with 401 once roles are configured, and serve the owner | New |
| `admin/voyage-packs/README.md`, `privacy.html`, `.claude/skills/analytics-tracking/SKILL.md`, `admin/W12-PRODUCT-LAUNCH-CHECKLIST.md` | Documentation of the new lifecycle step ("register the pack, instrument the pack") and the amended privacy wording | Modify |

---

## 6. Phases

| Phase | Tasks | Needs a decision? | Delivers |
|---|---|---|---|
| **A — Foundation** | 1, 2, 6, 7, 9 | D4 only (an API key, installed on the Atlas node) | Registry (InTheWake), tracker module (InTheWake), snapshot job + launchd plist (open-claw-stuff). Dashboard-ready data even before any new events: landing + pack-HTML pageviews by path already exist in Umami today. |
| **B — Site surfaces + dashboard** | 3, 4, 8, 10 | No | Buy clicks, print/PDF/handoff events on the HTML renders (InTheWake); the owner-only dashboard on Atlas (open-claw-stuff); docs. |
| **C — PWA companions** | 5b then 5 | **D1** (a setting, not a wording change) | At-sea usage counts, installs, feature combinations per sitting, before/during/after, by voyage day — with nothing about any person created anywhere. |
| **D — Sales seam** | 11 | D5 (paywall platform) | Purchase counts beside usage. |

Phases A + B are roughly two focused sessions. Phase C is one session once D1 is answered; most of it is mechanical across 14 files.

---

## 7. Tasks

### Task 1: Pack registry (`packs.json`) and its checker

**Files:**
- Create: `admin/voyage-packs/packs.json`
- Create: `admin/voyage-packs/packs.schema.json`
- Create: `admin/scripts/check-voyage-registry.mjs`
- Test: `tests/unit/voyage-usage/registry.test.mjs`

The registry is hand-written once from the `README.md` pack table and the fourteen `window.__VOYAGE` blocks, then kept honest by the checker. Record shape:

```json
{
  "slug": "v0.1.3-virgin-sisters-sea-feb-2027",
  "title": "Sisters at Sea — Virgin Voyages Resilient Lady",
  "status": "shipped",
  "sail_start": "2027-02-14",
  "sail_end": "2027-02-21",
  "price_usd": 29,
  "host": "Tina Maulsby · Maulsby Travel Co.",
  "landing_anchor": "#sisters-at-sea",
  "pdf": {
    "full": "admin/voyage-packs/v0.1.3-virgin-sisters-sea-feb-2027.pdf",
    "condensed": "admin/voyage-packs/v0.1.3-virgin-sisters-sea-condensed.pdf",
    "handoff": null
  },
  "html": "admin/voyage-packs/v0.1.3-virgin-sisters-sea-feb-2027.html",
  "pwa": "admin/voyage-pwa/sisters-at-sea.html",
  "instrumented": { "landing": false, "html": false, "pwa": false }
}
```

`instrumented` flags are flipped by the tasks that add events, so the dashboard's coverage panel is derived, not asserted.

- [ ] **Step 1: Write the failing test**

```js
// tests/unit/voyage-usage/registry.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkRegistry } from '../../../admin/scripts/check-voyage-registry.mjs';

test('every referenced file exists and every pack file is referenced', async () => {
  const r = await checkRegistry({ root: new URL('../../../', import.meta.url).pathname });
  assert.equal(r.state, 'CLEAN', JSON.stringify(r.drift, null, 2));
});

test('a missing referenced file is drift, not a crash', async () => {
  const r = await checkRegistry({
    root: '/tmp/nowhere-' + Date.now(),
    registry: [{ slug: 'x', pdf: { full: 'admin/voyage-packs/x.pdf' } }]
  });
  assert.equal(r.state, 'REPORT');
  assert.ok(r.drift.some(d => d.kind === 'missing-file'));
});

test('an unreadable registry is UNAVAILABLE, never CLEAN', async () => {
  const r = await checkRegistry({ root: '/tmp/nowhere-' + Date.now() });
  assert.equal(r.state, 'UNAVAILABLE');
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test tests/unit/voyage-usage/registry.test.mjs`
Expected: FAIL — `Cannot find module …/check-voyage-registry.mjs`

- [ ] **Step 3: Write the checker**

```js
#!/usr/bin/env node
// admin/scripts/check-voyage-registry.mjs — Soli Deo Gloria.
// Registry ↔ disk cross-check. Three states, never two:
//   CLEAN (0) · REPORT (3, drift found) · UNAVAILABLE (2, could not look).
import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';

const PACK_DIR = 'admin/voyage-packs';
const PWA_DIR = 'admin/voyage-pwa';

export async function checkRegistry({ root, registry } = {}) {
  let packs = registry;
  if (!packs) {
    try {
      packs = JSON.parse(await readFile(path.join(root, PACK_DIR, 'packs.json'), 'utf8'));
    } catch (e) {
      return { state: 'UNAVAILABLE', reason: `registry unreadable: ${e.message}`, drift: [] };
    }
  }
  const drift = [];
  const referenced = new Set();
  for (const p of packs) {
    for (const f of [p.pdf?.full, p.pdf?.condensed, p.pdf?.handoff, p.html, p.pwa].filter(Boolean)) {
      referenced.add(f);
      try { await access(path.join(root, f)); }
      catch { drift.push({ kind: 'missing-file', slug: p.slug, file: f }); }
    }
    if (packs.filter(q => q.slug === p.slug).length > 1) drift.push({ kind: 'duplicate-slug', slug: p.slug });
  }
  let onDisk;
  try {
    const packFiles = (await readdir(path.join(root, PACK_DIR)))
      .filter(f => f.endsWith('.pdf') || (f.endsWith('.html') && f.startsWith('v0.')));
    const pwas = (await readdir(path.join(root, PWA_DIR))).filter(f => f.endsWith('.html'));
    onDisk = [...packFiles.map(f => `${PACK_DIR}/${f}`), ...pwas.map(f => `${PWA_DIR}/${f}`)];
  } catch (e) {
    return { state: 'UNAVAILABLE', reason: `could not list pack dirs: ${e.message}`, drift };
  }
  for (const f of onDisk) {
    if (!referenced.has(f) && !f.endsWith('emergency-handoff-card-agnostic.pdf')) {
      drift.push({ kind: 'unregistered-file', file: f });
    }
  }
  return { state: drift.length ? 'REPORT' : 'CLEAN', drift };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = await checkRegistry({ root: process.cwd() });
  console.log(`[voyage-registry] ${r.state}${r.reason ? ' — ' + r.reason : ''}`);
  for (const d of r.drift) console.log(`  ${d.kind}: ${d.slug || ''} ${d.file || ''}`.trim());
  process.exit(r.state === 'CLEAN' ? 0 : r.state === 'REPORT' ? 3 : 2);
}
```

- [ ] **Step 4: Write `packs.json` for all 18 packs** from `admin/voyage-packs/README.md` §Current packs and the fourteen `window.__VOYAGE` blocks. Every path is copied from `ls`, not typed from memory. Run the checker; fix drift until `CLEAN`. Expect the first run to REPORT the `ships/norwegian/*.pdf` and `ships/msc/*.pdf` paths four PWAs point at — verify those files exist on disk; if they do not, that is a live broken link worth its own line in `UNFINISHED_TASKS.md`, not something to paper over in the registry.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test tests/unit/voyage-usage/registry.test.mjs`
Expected: 3 passing

- [ ] **Step 6: Wire into CI** — add a step to `.github/workflows/quality.yml` next to the other `admin/` checks: `run: node admin/scripts/check-voyage-registry.mjs`.

- [ ] **Step 7: Commit**

```bash
git add admin/voyage-packs/packs.json admin/voyage-packs/packs.schema.json admin/scripts/check-voyage-registry.mjs tests/unit/voyage-usage/registry.test.mjs .github/workflows/quality.yml
git commit -m "feat(voyage-packs): machine-readable pack registry + disk cross-check (3-state)"
```

### Task 2: The shared tracker module with an offline queue

**Files:**
- Create: `assets/js/voyage-usage.js`
- Test: `tests/unit/voyage-usage/tracker.test.mjs`

Design constraints, all of them fences (careful-not-clever Layer 0):
- ES5 syntax (the PWAs and pack HTML are ES5; no build step).
- Property **whitelist** — unknown keys are dropped, values coerced to short strings (≤64 chars).
- Silent when DNT/GPC is set, when the page is `file:`, or when `localStorage` throws.
- Queue capped at 200 events; oldest dropped; each event stamped with its own timestamp so late flushes are still honest about *when*.
- Flush on load, on `online`, and on `visibilitychange → hidden` (uses `fetch(..., {keepalive:true})`).
- If `window.umami` exists (site pages), delegate to `umami.track(name, data)`; otherwise POST to `/api/send` directly. The Umami endpoint requires a real `User-Agent`, which browsers always send.

```js
/* In the Wake — voyage-pack usage events. Anonymous, cookie-free, aggregate only.
   Sends: event name + whitelisted properties. Never: card values, locations, ids.
   Soli Deo Gloria. */
(function (w) {
  'use strict';
  var WEBSITE = '9661a449-3ba9-49ea-88e8-4493363578d2';
  // Setting 1 (§2.1): the PWAs point this at the geo-blind relay (Task 5b), e.g.
  // 'https://usage.cruisinginthewake.com/send'; site pages may keep Umami's own endpoint.
  var ENDPOINT = (w.ITW_USAGE_ENDPOINT || 'https://cloud.umami.is/api/send');
  var KEY = 'itw:vp-usage-queue';
  var ALLOW = { pack: 1, price: 1, variant: 1, scope: 1, standalone: 1, offline: 1, phase: 1, day: 1, tabs: 1 };
  var MAX = 200;

  function optedOut() {
    try {
      return w.navigator.doNotTrack === '1' || w.navigator.globalPrivacyControl === true ||
             (w.location && w.location.protocol === 'file:');
    } catch (e) { return true; }
  }
  function clean(data) {
    var out = {}, k;
    for (k in (data || {})) if (ALLOW[k] && data[k] != null) out[k] = String(data[k]).slice(0, 64);
    return out;
  }
  function load() { try { return JSON.parse(w.localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  function save(q) { try { w.localStorage.setItem(KEY, JSON.stringify(q.slice(-MAX))); } catch (e) {} }

  function payload(ev) {
    return { type: 'event', payload: {
      website: WEBSITE, hostname: w.location.hostname, url: w.location.pathname,
      title: w.document.title, language: w.navigator.language || '',
      screen: w.screen ? (w.screen.width + 'x' + w.screen.height) : '',
      name: ev.name, data: ev.data
    } };
  }
  function requeue(ev) { var r = load(); r.push(ev); save(r); }
  function flush() {
    if (optedOut() || !w.navigator.onLine) return;
    var q = load(); if (!q.length) return;
    save([]);
    q.forEach(function (ev) {
      if (w.umami && typeof w.umami.track === 'function') { try { w.umami.track(ev.name, ev.data); } catch (e) {} return; }
      try {
        w.fetch(ENDPOINT, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload(ev)) }).catch(function () { requeue(ev); });
      } catch (e) { requeue(ev); }
    });
  }
  function track(name, data) {
    if (optedOut() || typeof name !== 'string' || name.length > 50) return;
    var q = load(); q.push({ name: name, data: clean(data), t: Date.now() }); save(q);
    flush();
  }
  w.addEventListener('online', flush);
  w.addEventListener('visibilitychange', function () { if (w.document.visibilityState === 'hidden') flush(); });
  if (w.document.readyState === 'complete') flush(); else w.addEventListener('load', flush);
  w.ITW_USAGE = { track: track, flush: flush, _clean: clean };
})(window);
```

Tests (node:test with a minimal `window` stub): whitelist drops unknown keys; DNT sends nothing and stores nothing; offline queues, `online` flushes in order; a failed fetch re-queues; cap holds at 200; names over 50 chars are refused. Commit as `feat(voyage-usage): shared anonymous event module with offline queue`.

**Self-attack (Layer 3, required — this is a public surface):** the module's stated claim is *"never sends anything personal."* Probe it by calling `track('vp_pwa_open', {pack:'x', name:'Jane', phone:'555', __proto__:{a:1}})` and reading the queued payload literally: only `pack` may survive. Probe `track('vp_pwa_open', {pack: '<script>…'})` — the value is a string in JSON, and the dashboard renders it via `textContent` only (Task 8), so it is inert; pin both as tests.

### Task 3: Instrument the landing page

**Files:** Modify `voyage-packs.html` (four Buy buttons). **Union-merge with PR #2565**, which adds a fifth card.

- [ ] Add to each Buy anchor: `data-umami-event="vp_buy_click" data-umami-event-pack="<slug>" data-umami-event-price="<n>"`. Umami's site script handles the click; no new JS on this page.
- [ ] Flip `instrumented.landing = true` for those packs in `packs.json`.
- [ ] Verify by loading the page under `python3 -m http.server` with the Umami script blocked — the attributes must be inert and the links must still work (progressive enhancement).
- [ ] Commit `feat(voyage-packs): buy-button click events (anonymous)`.

### Task 4: Instrument the three HTML pack renders

**Files:** Modify `admin/voyage-packs/v0.1-symphony-western-caribbean-7n.html`, `v0.1.2-…dec-2027.html`, `v0.1.3-…feb-2027.html`; `assets/js/handoff-card.js`; `assets/js/pdf-download.js`.

- [ ] Add `data-pack="<slug>"` to `<main>` and `<script src="/assets/js/voyage-usage.js" defer>` before `handoff-card.js`.
- [ ] `handoff-card.js` `save()`: after writing, if any value is non-empty and `localStorage['itw:vp-handoff-filled:'+storageKey]` is unset, set it and call `window.ITW_USAGE && ITW_USAGE.track('vp_handoff_filled', {pack: document.querySelector('main').dataset.pack})`. Once per device, never the values.
- [ ] `pdf-download.js` `downloadPdf()`: after `.save()` resolves, `ITW_USAGE.track('vp_pdf_download', {pack, scope})`.
- [ ] Print buttons (`data-print-scope`): the existing inline handler gains one line, `ITW_USAGE.track('vp_print', {pack, scope})`.
- [ ] Links to our own PDFs on these pages: `data-umami-event="vp_pdf_open" data-umami-event-pack=… data-umami-event-variant=…`.
- [ ] Flip `instrumented.html = true`; run the registry checker; commit `feat(voyage-packs): print/PDF/handoff events on HTML renders`.

### Task 5: Instrument the PWA companions — **gated on D1**

**Files:** `admin/voyage-pwa/companion.js`, `admin/voyage-pwa/sw.js`, all 14 `admin/voyage-pwa/*.html`.

Do **not** start this task until Ken has picked a setting under D1 (§2.1). Task 5b (the relay) ships **before** this task under Setting 1, so no PWA ever points at Umami directly. **The footer wording is not touched** — `grep -c "No tracking" admin/voyage-pwa/*.html` must still return 14 afterward; pin that as a unit test that reads the files, so a future "tidy-up" cannot quietly edit the promise.

- [ ] Each PWA `<meta http-equiv="Content-Security-Policy">`: add the relay origin (Setting 1) to `connect-src`. (No `script-src` change — the module is same-origin under `/assets/js/`, but `/assets/` is outside `sw.js`'s `OWN_SCOPE`, so add `/assets/js/voyage-usage.js` to `PRECACHE` **and** extend `cacheable()` to allow exactly that path; bump `CACHE` to `voyage-v5`.)
- [ ] Each PWA page sets `window.ITW_USAGE_ENDPOINT` to the relay URL before loading the module, and gains `slug:"…"` in `window.__VOYAGE` (from the registry).
- [ ] `companion.js` `buildShell()` end: compute `phase` and `day` from `ITIN` vs `todayISO()`; `ITW_USAGE.track('vp_pwa_open', {pack: V.slug, standalone: matchMedia('(display-mode: standalone)').matches, offline: !navigator.onLine, phase, day})`.
- [ ] Tab click handler: add the tab name to an in-memory `Set` for this sitting. On `visibilitychange → hidden`, `track('vp_pwa_session', {pack, phase, day, tabs: sorted.join(',')})` once, then clear the set. No per-tab events.
- [ ] `window.addEventListener('appinstalled', …)` → `vp_pwa_install`.
- [ ] Emergency tab inputs: same once-per-device `vp_handoff_filled` rule as Task 4, keyed by `E.storageKey`.
- [ ] Overview PDF links: `vp_pdf_open` with `variant`, only when the `href` is on `cruisinginthewake.com`.
- [ ] Flip `instrumented.pwa = true`; commit `feat(voyage-pwa): anonymous usage counts via geo-blind relay; footer promise unchanged`.

### Task 5b: The geo-blind relay — **ships before Task 5 under Setting 1**

**Files:** Create `admin/voyage-usage-relay/worker.js`, `admin/voyage-usage-relay/wrangler.toml`, `admin/voyage-usage-relay/README.md`; Test `tests/unit/voyage-usage/relay.test.mjs` (the handler is a pure function of `Request → Response`, testable without Cloudflare).

A Cloudflare Worker on the household's existing Cloudflare tenant (the site is already proxied through it), bound to a hostname such as `usage.cruisinginthewake.com`. It exists to make the promise **mechanical** rather than a matter of client-side good behaviour:

- Accepts only `POST /send` with a JSON body `{name, data}`; anything else is `404`.
- **Re-validates** `name` against the `vp_*` vocabulary and `data` against the property whitelist, server-side. Unknown keys are dropped; unknown event names are `400`. The relay is the second fence; the client module is the first.
- Forwards to `https://cloud.umami.is/api/send` with a **fixed** `User-Agent` (`itw-voyage-usage-relay/1`), **no** `X-Forwarded-For`, **no** `CF-Connecting-IP`, and `url` set to the pack's canonical companion path from the registry (not whatever the client sent). Umami therefore records the relay as the visitor and the relay's location as the geography, which is to say nothing about the traveler.
- Under Setting 1.5 the Worker copies `request.cf.country` and `request.cf.region` into the event's `data` as `country` / `region` before forwarding, and `ALLOW` gains those two keys **on the relay only** (the client module never sends them, so a client cannot spoof a place). City is never read. Under the optional daily-link dial it also adds `sitting_key = sha256(ip + ua + yyyy-mm-dd + RELAY_SECRET).slice(0, 16)`, with `RELAY_SECRET` a Worker secret that is never committed and never logged; the hash is useless after midnight by construction.
- Sets `Access-Control-Allow-Origin: https://cruisinginthewake.com` only.
- Never logs request bodies or client addresses. `wrangler.toml` sets `logpush = false`; the README says why.

```js
// admin/voyage-usage-relay/worker.js — Soli Deo Gloria.
// Geo-blind relay: strips who and where; forwards what and when (to the day).
const UMAMI = 'https://cloud.umami.is/api/send';
const WEBSITE = '9661a449-3ba9-49ea-88e8-4493363578d2';
const EVENTS = new Set(['vp_pdf_open', 'vp_handoff_filled', 'vp_pwa_open', 'vp_pwa_session', 'vp_pwa_install']);
const ALLOW = new Set(['pack', 'variant', 'standalone', 'offline', 'phase', 'day', 'tabs']);
const ORIGIN = 'https://cruisinginthewake.com';

export function scrub(body) {
  if (!body || typeof body !== 'object' || !EVENTS.has(body.name)) return null;
  const data = {};
  for (const k of Object.keys(body.data || {})) {
    if (ALLOW.has(k) && body.data[k] != null) data[k] = String(body.data[k]).slice(0, 64);
  }
  if (!/^v0\.[0-9.]+-[a-z0-9-]+$/.test(data.pack || '')) return null; // pack slug is required and shaped
  return { name: body.name, data };
}

export default {
  async fetch(req) {
    const cors = { 'Access-Control-Allow-Origin': ORIGIN, 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' };
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    const url = new URL(req.url);
    if (req.method !== 'POST' || url.pathname !== '/send') return new Response('not found', { status: 404, headers: cors });
    let ev = null;
    try { ev = scrub(await req.json()); } catch { /* fall through */ }
    if (!ev) return new Response('bad event', { status: 400, headers: cors });
    const payload = { type: 'event', payload: {
      website: WEBSITE, hostname: 'cruisinginthewake.com',
      url: '/admin/voyage-pwa/' + ev.data.pack, title: ev.data.pack,
      name: ev.name, data: ev.data, language: '', screen: ''
    } };
    const r = await fetch(UMAMI, { method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': 'itw-voyage-usage-relay/1' }, body: JSON.stringify(payload) });
    return new Response(null, { status: r.ok ? 204 : 502, headers: cors });
  }
};
```

Tests for `scrub`: unknown event → `null`; unknown keys dropped; a body with `name`, `phone`, `ip`, `lat` yields only whitelisted keys; a malformed pack slug → `null`; oversized values truncated. Layer 3 self-attack of the stated claim *"nothing about the traveler reaches Umami"*: with `wrangler dev`, send a request carrying a spoofed `X-Forwarded-For` and a real browser UA, then read the outbound request Umami receives (mock it) literally — neither header may be present, and `url` must be the registry path, not the client's. `[unverified]` Cloudflare Workers free-tier request allowance was not checked this session; it is far above the traffic a few dozen companions produce, but confirm before relying on it.

**Why a relay and not "just don't look at the city column":** Umami stores what it derives at ingest. A policy not to *display* geography leaves the data sitting in a third party's database; the relay means it was never created. The promise is kept by construction, which is the only way a promise to strangers should be kept.

### Task 6: The snapshot job (open-claw-stuff, runs on the Atlas node)

**Files:** Create `atlas/server/voyage-usage-snapshot.mjs`; Test `atlas/tests/voyage-usage-snapshot.test.mjs`.

Invoked as `ATLAS_DATA=~/atlas-data UMAMI_API_KEY=… node atlas/server/voyage-usage-snapshot.mjs`, the same shape as the storm archiver `atlas/server/snapshot.mjs`. It fetches the pack registry from the live site (`https://cruisinginthewake.com/admin/voyage-packs/packs.json`; override with `ITW_PACKS_URL` or a local path in `ITW_PACKS_FILE` for tests and for the at-sea node), calls the Umami API, writes `$ATLAS_DATA/voyage-usage/snapshot.json` atomically (write `.tmp`, rename) and appends one line to `$ATLAS_DATA/voyage-usage/history.ndjson`. Exit codes follow the household three-state rule: 0 wrote a complete snapshot; 3 wrote a snapshot with one or more metrics marked `unavailable`; 2 could not write at all (no key, auth refused, registry unreachable). **A metric that could not be fetched is written as `null` with a reason, never as 0.** The key is read from the environment only; the script refuses to start if `UMAMI_API_KEY` looks like a path or a placeholder, and never logs it.

Calls per run, for each window (30d / 90d / 365d): one `/stats` filtered to the landing path; one `/metrics?type=path` (prefix-matched client-side to the pack HTML and PWA paths); one `/metrics?type=event`; one `/event-data/values?event=<e>&propertyName=pack` per event name (8); one `/events/series?unit=week` for the sparkline. That is about 12 calls per window, 36 per run — under the 50-per-15-second limit, but the client still sleeps 350 ms between calls and honors a 429 with one backoff-and-retry, then marks that metric unavailable.

```js
// core shape — the rest is plumbing around it
export async function buildSnapshot({ packs, api, now = Date.now() }) {
  const windows = { d30: 30, d90: 90, d365: 365 };
  const out = {
    generated_at: new Date(now).toISOString(),
    floor_note: 'Every number is "at least this many".',
    windows: {},
    provenance: { calls: 0, retries: 0, failures: [] }
  };
  for (const [key, days] of Object.entries(windows)) {
    const startAt = now - days * 86400000, endAt = now;
    const w = { site: {}, packs: {} };
    w.site.landing = await api.metricOrNull('stats', { startAt, endAt, filters: { path: '/voyage-packs.html' } }, out.provenance);
    const paths = await api.metricOrNull('metrics', { startAt, endAt, type: 'path', limit: 500 }, out.provenance);
    const byEvent = {};
    for (const ev of EVENTS) {
      byEvent[ev] = await api.metricOrNull('event-data/values', { startAt, endAt, event: ev, propertyName: 'pack' }, out.provenance);
    }
    for (const p of packs) w.packs[p.slug] = aggregatePack(p, paths, byEvent, now);
    out.windows[key] = w;
  }
  out.state = out.provenance.failures.length ? 'PARTIAL' : 'COMPLETE';
  return out;
}
```

`aggregatePack` is a pure function (tested with fixtures): it sums pageviews whose path starts with the pack's `html` or `pwa` path, reads each event's count for the pack slug (`null` if that event's fetch failed), computes `last_activity`, and assigns `status` — `sailing-now` (today within sail dates), `unused` (all counted events and pageviews are 0 and no metric is null), `quiet` (fewer than 5 events), `active`. A pack with any `null` metric gets `status: 'unavailable'` — never `unused`.

Tests: aggregation from fixtures; `null` beats 0; 429 → one retry then `unavailable`; missing key → exit 2; provenance counts calls. Commit `feat(voyage-usage): Umami → snapshot builder (3-state, null-never-zero)`.

### Task 7: The cadence job (launchd on the Atlas node; nothing in GitHub)

**Files:** Create `atlas/deploy/com.atlas.voyage-usage-snapshot.plist.example`; Modify `docs/SERVICE-RESTART-REGISTRY.md` (one row).

Modeled line for line on `atlas/deploy/com.atlas.adventures-poll.plist.example`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- Voyage-pack usage snapshot. Pulls aggregate counts from the Umami API into $ATLAS_DATA/voyage-usage/
     for the owner-only /admin/voyage-usage dashboard. Copy → fill PLACEHOLDERS → install per atlas README.
     The real plist holds UMAMI_API_KEY — keep it OUT of git, installed in ~/Library/LaunchAgents on the
     node that runs Atlas. Soli Deo Gloria. -->
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.atlas.voyage-usage-snapshot</string>
  <key>ProgramArguments</key>
  <array>
    <string>/path/to/node</string>
    <string>/path/to/open-claw-stuff/atlas/server/voyage-usage-snapshot.mjs</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>ATLAS_DATA</key><string>/Users/YOUR_USER/atlas-data</string>
    <key>UMAMI_API_KEY</key><string>FROM_KEYCHAIN_OR_FILE</string>
  </dict>
  <key>StartCalendarInterval</key>
  <dict><key>Hour</key><integer>5</integer><key>Minute</key><integer>17</integer></dict>
  <key>RunAtLoad</key><true/>
  <key>StandardOutPath</key><string>/Users/YOUR_USER/Library/Logs/openclaw/atlas-voyage-usage.log</string>
  <key>StandardErrorPath</key><string>/Users/YOUR_USER/Library/Logs/openclaw/atlas-voyage-usage.err</string>
</dict>
</plist>
```

Daily at 05:17 local, off the :00 crowd; `RunAtLoad` gives a first snapshot the moment it is installed. Exit 3 (partial) still writes, with the gaps named in `provenance`; exit 2 writes nothing and leaves last time's file in place, and the dashboard shows that file's own `generated_at`, so a stale snapshot is visible as stale rather than mistaken for current. Install: `launchctl bootstrap "gui/$(id -u)" ~/Library/LaunchAgents/com.atlas.voyage-usage-snapshot.plist`; check with `launchctl print` per the restart registry. Ken generates the Umami API key (D4) and puts it in the installed plist; it exists nowhere else.

Whether the job should also run on the at-sea node (`m4max`) is Ken's call; the honest default is **no**, because a node with no internet cannot reach Umami and would only write `unavailable` snapshots over a good one. The dashboard reads whatever file the node it is served from holds.

### Task 8: The dashboard (open-claw-stuff, served by Atlas, owner-only)

**Files:** Create `helm/admin/voyage-usage.html`, `helm/admin/voyage-usage.mjs`; Modify `atlas/server/server.mjs` (two routes beside `/admin/benchmark`); Test `atlas/tests/voyage-usage-route.test.mjs` + a fixture-driven render test for the module.

Routes, in the buffered `_handle` branch next to the existing `/admin/benchmark` lines:

```js
// Voyage-pack usage dashboard (owner-only: /admin is in OWNER_ONLY_PREFIXES; the central gate above
// has already refused everyone else). Data is whatever the snapshot job last wrote under dataDir.
if (path === "/admin/voyage-usage" || path === "/admin/voyage-usage/")
  return html(await readFile(join(import.meta.dirname, "..", "..", "helm", "admin", "voyage-usage.html")));
if (path === "/admin/voyage-usage/snapshot.json") {
  try {
    const body = await readFile(join(dataDir, "voyage-usage", "snapshot.json"), "utf8");
    return { status: 200, type: "application/json", body, headers: { ...NO_STORE } };
  } catch {
    return json({ state: "unavailable", reason: "no snapshot on this node yet" }, 503);
  }
}
```

The page follows `helm/admin/benchmark.html`: strict per-page CSP (`default-src 'self'`, no inline script, `connect-src 'self'`), `helm/helm.css`, the module loaded from `/helm/admin/voyage-usage.mjs`, which the existing `/helm/` static branch serves and the gate already restricts to the owner. Fetch with `credentials: "same-origin"` so the `atlas_token` cookie rides along, as `helm/world-state-panel.mjs` does. Load the `dataviz` skill before writing the module. Rules carried from the drink calculator: no libraries; all rendering through `textContent` / `createElement` (snapshot values are untrusted strings; a pack slug is data); every SVG sparkline has `role="img"`, `aria-label`, and a mirrored `<table>` in `.sr-only`; `<th scope="col">`; `prefers-reduced-motion` and `prefers-contrast` honored; live region for the window toggle. Invocation comment and SDG line as on every page.

The module renders §4's sections. The `unused` list and the `unavailable` list are separate, the coverage panel is drawn from the registry's `instrumented` flags (carried inside the snapshot) so a zero on an uninstrumented surface is labelled `no-instrument`, never `0`, and a 503 from the JSON route renders as one honest sentence ("no snapshot on this node yet") rather than an empty dashboard.

Tests: the route test builds the server with a configured role registry and asserts `/admin/voyage-usage` and its JSON return 401 with no token, 403 with the family token, 200 with the owner token, and 503 with a well-formed body when the data file is absent. The render test feeds a fixture snapshot to the module in a DOM stub and asserts the floor sentence sits beside the `<h1>`, one row per pack, an `unused` pack in the zero-list, a `null` metric rendered as "unavailable" (not "0"), and a sibling table for every `svg[role=img]`. Commit in open-claw-stuff: `feat(atlas): owner-only voyage-pack usage dashboard at /admin/voyage-usage`.

### Task 9: CLI report

No new file: `node atlas/server/voyage-usage-snapshot.mjs --print [--window 30d|90d|365d]` reuses Task 6's `buildSnapshot` and prints the per-pack table to the terminal instead of writing, for the day Ken wants a number on the Atlas node without opening a browser. Same key, same three exit states. Smoke-tested in Task 6's suite (`--help` exits 0; `--print` against a fixture API prints one row per pack).

### Task 10: Documentation and the privacy page

- [ ] `admin/voyage-packs/README.md`: new §"Register and instrument" between "Add a new pack" and the staleness check — a new pack is not done until it is in `packs.json` and the registry checker is CLEAN.
- [ ] `privacy.html` §Umami: one sentence naming the voyage-pack events as anonymous counts, and the DNT/GPC opt-out.
- [ ] `.claude/skills/analytics-tracking/SKILL.md`: add the `vp_*` vocabulary table (§3) so future sessions reuse names instead of inventing.
- [ ] `admin/W12-PRODUCT-LAUNCH-CHECKLIST.md`: the three "Track …" checkboxes now point at the dashboard for usage and at Task 11 for revenue.
- [ ] `REASONING-LOG.md` entry per session, as always.

### Task 11: Sales seam — **gated on D5**

When `itw-voyage-packs-paywall-platform` lands, the processor's webhook (memory `e74cbef8` sketches Stripe → Cloudflare Worker → D1) writes purchase counts per slug per week to a private store; the snapshot script gains one optional source that reads **counts only** into `packs[slug].purchases` when a `SALES_SOURCE_URL` secret is present, and the dashboard shows a `purchases` column marked `unavailable` until then. Revenue in dollars never enters the public snapshot. This task is a seam, not a build; it exists so nobody bolts sales on by hand later.

---

## 8. Verification before "done" (every phase)

- `node --test tests/unit/voyage-usage/*.test.mjs` green, output pasted into the reasoning log.
- `node admin/scripts/check-voyage-registry.mjs` → `CLEAN`.
- In open-claw-stuff: `cd atlas && node --test "tests/voyage-usage-*.test.mjs"` green, including the 401 / 403 / 200 / 503 route matrix.
- On the Atlas node after install: `launchctl print "gui/$(id -u)/com.atlas.voyage-usage-snapshot"` shows a last exit of 0 or 3, `$ATLAS_DATA/voyage-usage/snapshot.json` exists, and `curl -s -o /dev/null -w '%{http_code}' http://<tailnet-ip>:<port>/admin/voyage-usage` returns 401 without the token and 200 with it. Record the observation, not the expectation.
- Manual: open a PWA in a fresh profile with the network throttled to Offline in devtools, tap two tabs, go online, confirm in Umami's realtime view that exactly the queued events arrive with **only** whitelisted properties. Record the observation, not the expectation.
- Self-attack the three stated claims: *nothing personal leaves the device* (Task 2 probe), *null never renders as zero* (Task 8 fixture), *a partial snapshot is labelled partial* (Task 6 fixture with one failing endpoint).
- `accessibility-audit` skill on the dashboard page; WCAG 2.1 AA is a promise, not a checkbox.

## 9. Honest limits (what this plan does not establish)

- It measures **floors**. Ad-blockers, DNT users, saved PDFs, and cleared browsers all subtract, and the subtraction is unmeasured.
- It does not measure **purchases** until D5. When it does, the numbers sit on the same owner-only Atlas page, never on the public site.
- The dashboard is only as available as Atlas: off the tailnet, or with Atlas down, there is no view. Collection continues regardless, and the next snapshot backfills.
- It does not measure the **family** weather page or the Maulsby-hosted packs whose only deliverable lives on maulsbytravel.com.
- It cannot tell *why* a pack is unused — only that it is. The "quiet / unused" labels are prompts for a conversation with Tina, not verdicts.
- Under Setting 1 it counts **opens and sittings, never people**. "41 opens during the sailing" is honest; "N travelers" is not available and the dashboard must not imply it.
- Umami Cloud is a third party. Under Setting 1 it receives only event names and whitelisted properties, from the relay's address, and could not reconstruct a traveler if it tried. Self-hosting Umami on the Cloudflare tenant would remove the third party altogether; it is a separate task.

*Soli Deo Gloria.*
