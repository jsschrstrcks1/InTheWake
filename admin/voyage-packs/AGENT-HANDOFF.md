# Voyage Pack Agent Handoff

**Soli Deo Gloria.** Written 2026-10-14 from building the Jewel (v0.1.22), Escape (v0.1.11 refresh) and Sun (v0.1.23) packs. This file is the field guide: what to do, in what order, with the exact commands, and the traps that already cost a session. It does not replace the two standards beside it. Read them too:

- [`README.md`](README.md): authoring standards (cover, images, cross-links, 11-section template, build script, registry).
- [`PACK-PRESHIP-REVIEW-CHECKLIST.md`](PACK-PRESHIP-REVIEW-CHECKLIST.md): the A to N pass every pack gets before it ships.

Where this file and those two disagree, they win. Say so in your report.

---

## 1. What a finished pack is

One sailing, eight surfaces, all agreeing with each other:

| Surface | Path pattern | Made by |
|---|---|---|
| Long form | `admin/voyage-packs/vX.Y.Z-<line>-<ship>-<slug>-<mon-yyyy>.md` | you |
| Condensed (3 pages) | `admin/voyage-packs/vX.Y.Z-<...>-condensed.md` | you |
| Handoff card | `admin/voyage-packs/vX.Y.Z-<...>-handoff-card.md` | you |
| Fact-check sidecar | `<long form>.factcheck.json` | you (a script is easiest) |
| PDFs | long form under `ships/<line>/`, the other two beside their `.md` | `admin/scripts/voyage-pack-pdf-build.sh` |
| Companion PWA | `admin/voyage-pwa/<page>.html` + `.webmanifest` | a generator script, from a recent companion |
| Static guide | `admin/voyage-pwa/guides/<page>-guide.html` | `node admin/scripts/build-voyage-guides.mjs <pack slug>` |
| Share image | `assets/social/<page>.jpg` from `admin/social-card-generator/voyage-cards/<page>.json` | `node admin/social-card-generator/make-voyage-card.js <json>` |

Plus three registrations: the `packs.json` record, the landing card in `/voyage-packs.html`, and the build-script entries. A pack missing any of these is not done.

---

## 2. The operator's standing rules (Ken)

These are not style notes. Each one has been asked for, in his words or by directive.

1. **Every fact asserted needs a primary source wherever one exists.** "If it's asserted as fact, it needs to be verified with a primary source if possible." A travel agency, aggregator or blog is a lead, not a source. When only a secondary source exists, attribute it by name in the text ("CruiseMapper reported...").
2. **"I don't know" beats a confident guess.** If you can't verify it, leave it out, or say plainly that it's unconfirmed. Record removals in the sidecar.
3. **Verify the port order, terminals and excursion names before the first commit**, not after (memory `ea69003a`). Don't publish and then ask whether he wanted it checked.
4. **Tina-hosted packs** (memory `a23bef4b`): the cover byline links to `https://www.maulsbytravel.com`, and mentions in the body link to `/authors/tina-maulsby.html`. Quote her own notes word for word and attribute them to her. Maulsby runs several solo brands that aren't interchangeable (memory `9e6d79e2`); use the name on the flyer.
5. **Wikipedia and Wikimedia: ask first.** On 2026-10-14 Ken said: "I didn't ask you to request anything from Wikipedia." Until he gives a standing rule, ask before you query Wikipedia or the Wikimedia Commons API. A ship photo already in `assets/ships/<line>/<ship>/` with an `.attr.json` beside it needs no new request. Wikipedia is never the only source for a printed fact.
6. **Never send the operator's email or any personal detail to an outside service.** That includes request headers. A neutral User-Agent string is fine: `Mozilla/5.0 (Windows NT 10.0; Win64; x64)`.
7. **Calm by design.** No urgency, no upsell, no countdown pressure. State the hard things (a Level 3 advisory, a tender, an early all-aboard) plainly and without alarm.
8. **Advisories are dated.** Every advisory list says it describes conditions as of the date you read it, and that levels can rise or fall before the sailing. The companion's Alerts tab already says so.
9. **Don't merge without his word.** Don't open a PR unless he asks. Push to the session's designated branch.
10. **Claude never writes `REASONING-LOG.md` or `ENGINEERING-LOG.md`.** Every Claude commit carries `[no-reasoning]`.
11. **Replies to Ken** start with `Sophos:` and end with the usage footer. No em or en dashes in chat prose. Any claim that tests pass needs a test run in the same turn.

---

## 3. What to ask the operator for at the start

Most of the expensive dead ends came from hunting for something the operator could hand over in ten seconds. Ask for:

- **The cruise line's own itinerary link** for the sailing. For NCL that's the page with `itineraryCode=` in the URL. If you get a vacation-builder link, read the same code on the regular itinerary page (see §5).
- **The flyer image file**, if a host made one. It goes on the cover (see the Aura pack) and into `admin/voyage-pwa/flyers/` with an `.attr.json`.
- **The host's own words** about the sailing: pricing notes, coupons, what's included.
- **Anything firsthand** the operator wants in the pack ("in 2023 we were exempt..."). It goes in as his own attributed experience, dated, and into the sidecar's `firsthand_attestation`.

---

## 4. The pipeline, in order

Work on the designated branch. Commit with `git -c core.hooksPath=.githooks commit` so the repo's gates run.

### Step 0: posture and custody
- Load the layers named in `CLAUDE.md`. The bootstrap guard expires the reads after 24 hours; if it blocks you, re-read them and run `node admin/gate-liveness.mjs --probe` from `open-claw-stuff`.
- Run a memory recall on the ship and ports: `python3 /home/user/open-claw-stuff/admin/memory_evidence.py recall "<ship> <ports> voyage pack"`. Honor any directives it returns.

### Step 1: confirm the sailing from the line itself
- Parse the line's own schedule: dates, port order, arrive and depart times, voyage id. See §5 for NCL.
- Compute all-aboard from the line's rule (NCL: one hour before departure).
- Check whether the ship is changing hands, being refitted, or leaving the fleet near the sailing date (the Sun is chartered to Cordelia in 2027). Get the company's own press release.

### Step 2: research, primary sources first
Use §6 as the source map. Research can be split across helper agents (one for the ship, one for the ports). Give them the rules in §2 and §7, and **check what they bring back**: one helper's "UK government says..." claim wasn't on the UK page when I re-read it.

### Step 3: weather averages
Open-Meteo archive, the sailing's calendar window across five years (e.g. 2020 to 2024), one request per stop. Wet day = more than 1.0 mm. If Open-Meteo returns 429 (it has a daily cap), use NOAA NCEI daily normals for US stations. Otherwise say "no published average" for that stop. The companion handles null highs and lows.

### Step 4: write the three texts
Copy the shape of the most recent pack of the same kind: Sun (hosted solo group), Jewel (solo), or Escape (hosted group). Keep:
- The 11-section template, anchors and table of contents.
- The "what's first-hand here and what isn't" note.
- The dated price caveat.
- Links to ship, port and restaurant pages on this site wherever a page exists. Check with `ls ports/ ships/<line>/ restaurants/<line>/` and link only real files.
- The handoff card block, with every embassy line and local emergency number for every stop.

### Step 5: the sidecar
Easiest by script: load an earlier sidecar for the facts the packs share (each keeps its original source URL and the date it was read), then add this sailing's facts. Required keys (the gate checks them): `pack_filename`, `last_factcheck_date`, `ship_specs` (crew, gross_tonnage, decks, each with a source), `christening` (godparent, date), `policies` (auto_gratuity_rate, laundry_availability), `superlatives`, and `voice_audit` (audited_against, audit_date, audit_scope, risk_rating, cluster_detection.verdict). No source may point at another pack. **Write the sidecar last**: the gate requires it to be newer than the `.md`. If you edit the `.md` again, regenerate the sidecar. Then run:
```bash
bash admin/scripts/factcheck-gate.sh admin/voyage-packs/<long form>.md
```

### Step 6: register the PDF targets, then build
Add the long form to `LONG_FORM_PACKS`, the condensed to `CONDENSED_PACKS` and the card to `HANDOFF_CARDS` in `admin/scripts/voyage-pack-pdf-build.sh`, plus a `case` target. Then:
```bash
admin/scripts/voyage-pack-pdf-build.sh <target>
admin/scripts/voyage-pack-pdf-build.sh condensed
admin/scripts/voyage-pack-pdf-build.sh handoff
```
The pre-commit hook blocks a pack `.md` whose PDF is stale.

### Step 7: the companion
Generate it from a recent companion (Sun's `sun-panama-mar-2027.html` is the newest). Split it at `<script>window.__VOYAGE=` and keep everything after `<!-- pack-content:end -->`. Build `window.__VOYAGE` with these fields:
- **Identity:** `slug`, `ship`, `imo`
- **Content:** `faq`, `shipPhoto`, `shipHistory`, `emergency`, `overview`, `host` (a host string turns on the Maulsby solo-groups card)
- **PDFs:** `pdfFull`, `pdfCondensed`, `pdfFullLabel`
- **Labels:** `dateRange`, `brandSub`, `embarkPort`, `firstDateParen`, `statusInit`, `seasonLabel`, `note`, `footerDisc`, `alertsIntl`
- **Tracking:** `trackUrl`, `trackLabel`
- **Map and itinerary:** `mapCenter`, `locs`, `itin` (bare keys), `route`

The itinerary `loc` strings must match `PORT_COUNTRY` keys in `admin/scripts/build-voyage-alerts.mjs`. Then:
```bash
node admin/scripts/build-voyage-guides.mjs <pack slug>   # after packs.json has the record
node admin/scripts/instrument-voyage-companions.mjs --check
```
If you change `companion.js` or `companion.css`, bump `?v=` in every companion page and `CACHE` in `admin/voyage-pwa/sw.js` together.

### Step 8: alerts, IMO pin, registry, share card, landing card
- **New country?** Add it to `PORT_COUNTRY`, `UK_SLUG`, `US_NAME` and `US_CODE` in `build-voyage-alerts.mjs`. US_CODE is the State Department's FIPS code (Colombia CO, Panama PM, Costa Rica CS, Bahamas BF). Check it against the live feed at `https://cadataapi.state.gov/api/TravelAdvisories`. Then run `node admin/scripts/build-voyage-alerts.mjs`.
- **New ship:** pin its IMO in `tests/unit/voyage-usage/where-now.test.mjs`, from two agreeing sources.
- **Registry:** add the `packs.json` record (copy a neighbour), then run `node admin/scripts/check-voyage-registry.mjs` until it's CLEAN.
- **Share card:** write the card JSON and run the generator. **Look at the image.**
- **Landing card:** add an `<article class="vp-product-card">` to `/voyage-packs.html`, with the umami attributes per README §M.

### Step 9: the gates, all of them
```bash
node admin/scripts/build-voyage-guides.mjs --check
node admin/scripts/check-voyage-registry.mjs
node admin/scripts/instrument-voyage-companions.mjs --check
node admin/scripts/check-pack-pdf-links.mjs --all
bash admin/scripts/factcheck-gate.sh admin/voyage-packs/<long form>.md
node --test "tests/unit/**/*.test.mjs"
```
Then run the pre-ship checklist A to N and write the findings into the sidecar's `preship_review`.

### Step 10: see it in a browser
Chromium can't verify the proxy's certificate on live sites, so check the **local** copy:
1. Run `python3 -m http.server 8765 --bind 127.0.0.1` from the repo root.
2. Drive Playwright at a 390×844 viewport.
3. Route the weather, radar, NWS, usage and MarineTraffic requests to `{}`.
4. Screenshot Overview, a port day, FAQ and Alerts, and look at each one.

Stop the server by port or PID, never with `pkill -f` on a pattern that appears in your own command line (it kills your shell).

### Step 11: commit, push, report
Commit in logical pieces, push to the designated branch, and report to the operator:
- what's built
- what the sources settled
- what you removed and why
- anything you owe him (a slip, a gap, a step you couldn't verify)

---

## 5. NCL itinerary parsing (works, read raw)

The itinerary page `https://www.ncl.com/cruises/<any-slug>?itineraryCode=<CODE>` embeds every sailing on that code. In it:
- `voyageId` / `packageId` and `departureDate` (epoch ms) identify each sailing.
- An `"events":[...]` array lists `{date, event: D|A|S, portCode, portName}`.

To read it:
1. Run `html.unescape` over the page.
2. For each `"events":[` match, decode with `json.JSONDecoder().raw_decode`.
3. Pair each array with the nearest preceding `voyageId`.

The epoch values are the **ship's wall-clock time encoded as UTC** (the Miami 4:00 PM departure decodes as 16:00 UTC), so format them with `utcfromtimestamp`. The vacation-builder page is a client-side shell with no data in it. The code itself spells out the ports: `SUN12 MIA NPI CBR ORJ WIL CTG PCG CLN LIO MIA`, where NPI is Great Stirrup Cay, CBR Cabo Rojo, PCG Panama Canal at Gatun Lake, CLN Colón and LIO Puerto Limón.

NCL port pages (`https://www.ncl.com/cruises-to/<port>`) say whether the ship docks or tenders, and give the terminal name, currency and time zone. NCL ship pages (`/cruise-ship/<short>`, `/cruise-ships/<ship>/whats-on-board`, `/deck-plans`) give guests, crew, length, year refurbished, venues with decks, and solo cabin types.

---

## 6. Source map: what worked

| Fact | Primary source | How |
|---|---|---|
| Itinerary, times | Line's own itinerary page | curl, parse embedded JSON (§5) |
| Ship guests, crew, length, refurb | Line's ship page | curl |
| IMO, gross tonnage | VesselFinder `/vessels/details/<IMO>`, plus one other | curl; ask before using Wikipedia (§2.5) |
| Charter, sale, fleet exit | The parent company's press release | curl |
| US advisory level, date, text | `https://cadataapi.state.gov/api/TravelAdvisories` | curl the JSON; the `Summary` field holds the advisory text. travel.state.gov pages return a Cloudflare challenge |
| US embassy emergency lines | `https://<cc>.usembassy.gov/` | curl **with a browser User-Agent**; a bare UA gets 403. Grep "U.S. Citizens with Emergencies" |
| Local emergency numbers | UK FCDO `https://www.gov.uk/foreign-travel-advice/<country>/getting-help` | curl |
| Port safety notes | UK FCDO `.../<country>/safety-and-security` | curl |
| Panama Canal facts | `https://pancanal.com/en/history-of-the-panama-canal/`, `/en/discover-the-expanded-canal/` | curl; some FAQ text is in Spanish |
| Costa Rica attractions, currency | visitcostarica.com (ICT); bccr.fi.cr | curl |
| PortMiami terminal, parking | miamidade.gov/portmiami pages | curl |
| Hurricane season | nhc.noaa.gov/climo | curl |
| Seasickness | CDC Yellow Book motion-sickness page | curl |
| Medicare at sea | medicare.gov publication 11037 | curl |
| Weather averages | Open-Meteo archive API; NOAA NCEI normals as fallback | curl |

**Blocked from this container, so don't print the fact without another source:** UNESCO whc.unesco.org (Cloudflare), Banco de la República (bot block), sinac.go.cr (bad certificate; never bypass TLS), the Wikimedia Commons API under load (429).

---

## 7. The safety classifier: what to avoid

On 2026-10-13 the classifier withheld five replies in one session. Every one came while I was **hunting for a sailing's page by working out or building URLs**: scanning aggregator pages for itinerary codes, opening NCL's sitemap index, guessing an itinerary URL from a code pattern, and preparing to sign in to a travel site with the operator's email. Reading a page the operator had handed me went through cleanly every time.

So:
- **Ask the operator for the link** (§3). Don't crawl sitemaps, don't build URLs by pattern, don't sign in to anything.
- **After an S stop:** don't retry the withheld step that session, even with a different tool. After two stops on the same kind of step, stop that kind of step and tell the operator plainly. Log the stop in `open-claw-stuff/docs/BLOCK-LOG.md` when that repo can push.
- A stop is not a judgment of the operator's request. Say what you can still do, and what would unblock it.

---

## 8. Traps that already cost time

- **Stale sidecar.** The gate wants it newer than the `.md`; regenerate it after every edit.
- **Stale PDF.** The pre-commit hook blocks the commit; build the PDFs, then commit the `.md`, PDFs and sidecar together.
- **`build-voyage-guides.mjs` takes the pack slug**, not the companion page name, and it needs the `packs.json` record first.
- **Gross tonnage is volume, not weight.** Say so once.
- **"About N feet" from a metric source** is your conversion. Label it in the sidecar.
- **Superlatives** ("one of the smaller ships", "most beautiful") need a source or an attribution, or they come out.
- **Unverified helper claims.** Re-read the page before you print anything a helper reported.
- **Advisory dates.** Use the feed's `Published` date and give month and year in the text.
- **PDF pages can't be rendered to images here** (no poppler). Check the content through the companion screenshots and say that you did.
- **The en and em dashes ban** applies to chat replies, not to the pack files' house formats (headings, the table of contents and the handoff card use them by design).

---

## 9. Definition of done

- [ ] Sailing confirmed from the line's own page; times and all-aboard computed
- [ ] Every printed fact in the sidecar with a source URL, a quote where possible, and a read date
- [ ] Removed claims recorded in the sidecar with the reason
- [ ] Long form, condensed and handoff card agree on every time, price and phone number
- [ ] PDFs built; factcheck gate passes
- [ ] Companion built and screenshotted, with no page errors
- [ ] Alerts cover every country; IMO pinned
- [ ] `packs.json`, landing card, share image (looked at), build-script entries
- [ ] All gates in §4 step 9 clean; unit tests run this turn, with the counts reported
- [ ] Pre-ship checklist A to N run; findings in `preship_review`
- [ ] Pushed to the designated branch; report to the operator, no merge without his word

*Soli Deo Gloria. The pack a stranger trusts has to be true.*
