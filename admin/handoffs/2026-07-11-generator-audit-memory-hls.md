# Handoff — Persist the generator-audit / content session memories + HLS tasks to the true SSOT

**Author:** Claude Code (remote container session, 2026-07-11)
**For:** an agent running on the Mac (`/Users/kenbaker/ocs-work`) that can see the real household SSOT (the `open-claw-stuff` lineage that HAS `.household-library/` and `admin/library.mjs`).
**Status:** All CODE work this session is **already merged to `InTheWake` main (PR #2021)** — nothing to replay there. What remains is to replay **4 memories** and register **3–4 HLS tasks** into the true SSOT, because this container could not reach it. Soli Deo Gloria.

---

## Why this handoff exists (the same blocker as `2026-07-11-memory-hls-persistence.md`)

This container's three repos were cloned on the **skills-commons lineage of `open-claw-stuff`**, not the household SSOT:

- `open-claw-stuff` here has **no `.household-library/`**, **no `admin/library.mjs`**, **no `docs/HOUSEHOLD-LIBRARY.md`**, and the old `# open-claw-stuff — agent context` CLAUDE.md.
- So `node admin/library.mjs register …` (the HLS task API) **does not exist** in this clone, and memories encoded via `memory_ops.py` land in **this** `.memory/cruising` (skills-commons origin), not the SSOT store.

The memories below WERE encoded + committed + pushed to the skills-commons `open-claw-stuff` origin this session (they exist, just on the wrong lineage). **Do not merge this container's `open-claw-stuff` into the SSOT.** Just replay the append-only commands below against the live SSOT.

---

## PART A — Replay the 4 memories

Run from the household SSOT root (`/Users/kenbaker/ocs-work`). `M` = the memory CLI.

```bash
cd /Users/kenbaker/ocs-work
M="python3 ken/orchestrator/memory_ops.py"   # adjust if ken is a sibling path
# Recall first to avoid dupes / find a relate anchor for page-building lessons:
$M recall "InTheWake port page build workflow validator" --domain cruising --limit 8
```

All four are durable page-building methodology — encode `--protected` so confidence-decay doesn't bury them. They were originally written non-protected in the container; prefer protected on the SSOT.

### M1 — port-page build workflow (proven on Great Stirrup Cay #2009)
```bash
$M encode cruising fact \
"InTheWake NEW PORT PAGE build workflow (proven on Great Stirrup Cay #2009, 2026-07-08, scored 88/100 = dubai gold standard). Steps: (1) gather SOURCED facts from repo (voyage-pack sidecars in admin/voyage-packs/ are primary-sourced NCL/port material — never invent). (2) Source real images from Wikimedia Commons via commons API (action=query list=search srnamespace=6; imageinfo iiprop=url|extmetadata for license+Artist); download+convert to WebP with Pillow; write NAME.webp.attr.json sidecar (source/source_url/artist/license/license_url/description). VIEW each downsized webp before writing alt text — filename guesses are often wrong. Wikimedia rate-limits (HTTP 429) — add time.sleep(2)+backoff. (3) Author to the exact skeleton: charset first meta, SDG comment first 3 lines, 3 JSON-LD (WebPage description MUST == ai-summary char-for-char; dateModified==last-reviewed; FAQPage Question count == visible faq-item count). (4) Validators: node admin/validate-port-page-v2.js (needs cheerio; pass=0 blocking errors, score advisory); node scripts/validate-port-weather.js; node admin/port-page-audit.cjs. GOTCHAS: faq-items need <details class=\"faq-item\"><summary> ADJACENT (no whitespace) for weather FAQ_COUNT; credits h2 must be 'Credits' not 'Image Credits' ('Image' collides with gallery section-pattern); avoid word 'gambling' (content-purity ban); weather activity-labels EXACTLY Beach/Snorkeling/Hiking/City Walking/Low Crowds (N/A months ok); no 'Weather Guide'/'Shoulder Season' strings; practical+credits satisfied by main <h2> sections (dubai pattern) NOT sidebar. (5) Wire into ports.html + assets/data/search-index.json + assets/data/maps/SLUG.map.json. UNVISITED ports: honest first-person reflection logbook + Level-1 'soundings in another's wake' disclaimer; do NOT fabricate a visit. Fixed 2 pre-existing tooling bugs earlier: validate-port-page-v2.js line ~2221 used require() in ESM (crashed ALL pages); port-page-audit.cjs 'visited' heuristic false-positives on the canonical Level-1 disclaimer phrase 'sailed this port myself'." \
--tags inthewake,port-page,workflow,validators,image-sourcing,careful-not-clever,session-2026-07-11 --protected
```

### M2 — temperate-port specifics (Eastport #2008)
```bash
$M encode cruising fact \
"InTheWake port-page build for TEMPERATE ports (e.g. Eastport ME #2008): weather sub-validator (scripts/validate-port-weather.js, BLOCKING) REQUIRES canonical glance labels Temperature/Humidity/Rain/Wind/Daylight, a hurricane/storm-season FAQ AND a rain FAQ (visible + FAQPage schema, counts must match), and forbids the phrase 'when to visit' (DEDUP -> use 'Best Time to Visit'). v2 rubric price-mention check counts the WORDS cost/fare/fee/price (not just \$), so satisfy it honestly (tender covered by fare, town costs nothing, no fee). Booking-guidance check needs 2+ of: 'ship excursion','independent','guaranteed return','book ahead' inside the excursions section. Logbook needs an EMOTIONAL_PIVOT marker (e.g. 'quiet grace','prayer') AND a LESSON marker ('I realized'/'what ... taught me'). ai-summary must == WebPage description char-for-char AND be <=250 chars. Do NOT add temperate ports to the port-page-audit.cjs hurricane-zone set. Eastport hit 92/100 PASS." \
--tags inthewake,port-page,temperate,validators,session-2026-07-11 --protected
```

### M3 — NCL venue pages (#2006 / #2007)
```bash
$M encode cruising fact \
"InTheWake NCL venue pages (#2006 Magenta/Orchid-Garden, #2007 Manhattan-Room): (1) GROUNDED-NEGATIVES first — run 'find restaurants -iname \"*slug*\"' before building any 'missing' venue; slug variance like the- prefix is common (Manhattan Room existed at the-manhattan-room.html, not manhattan-room.html — 3 weeks before the issue). (2) Skeleton = an existing venue page (grand-pacific.html); venue pages use SHARED stock photos /assets/images/restaurants/photos/{buffet,formal-dining,cocktail}.webp — no per-venue Wikimedia sourcing; W01 stock-image warning is by-design. (3) NCL complimentary MDRs share ONE fleet-wide rotating 7-night menu — reusing it across MDR venue pages (Grand Pacific/Magenta/Savor/Taste) is factually correct, not fabrication. (4) validate-venue-page-v2.js: 0 errors = pass; W07 wants Pro Tips, W08 wants a venue-specific JSON-LD review name (not 'Guest Experience Summary'); FAQ schema Question count must == visible .section-divider count. (5) NCL ship pages link ZERO venue pages by convention; wiring = link from the voyage pack that named it in plain text. (6) grand-pacific.html logbook is internally INCONSISTENT (calls itself a \$29-39 Pan-Asian specialty though it's a complimentary MDR) — do not copy that error; see HLS task itw-grand-pacific-logbook-fix." \
--tags inthewake,venue-page,ncl,grounded-negatives,validators,session-2026-07-11 --protected
```

### M4 — page-generator adequacy audit (ships/ports/venues)
```bash
$M encode cruising fact \
"InTheWake page-generator adequacy (2026-07-08 audit, all merged to main PR #2021): PORT generator admin/generate-port-page.cjs is a scaffold+auto-validate design (emits <!--FILL--> markers, auto-runs validate-port-page-v2.js + port-page-audit.cjs) — fixed 3 defects: it OMITTED the required Google Analytics(G-WZP891PZXJ)+Umami scripts and emitted <h2>Image Credits</h2> (validator reads 'images?' as gallery, needs <h2>Credits</h2>); og:image now per-port hero. VENUE generators (generate-*-venue-pages.js) are data-driven, adequate, but emit generic 'Guest Experience Summary' logbook (W08) unless review data supplied. SHIPS: no generator; SYSTEMIC BUG — validate-ship-page.sh §9k reads article thumbnail paths from assets/data/articles/index.json and 2 were .jpg?v= where only .webp exists, failing ALL ~295 ship pages with 2 identical errors (fixed .jpg->.webp; whole fleet now 0-error unless page-specific). ships/template.html was structurally stale (failed 20, 8 structural) — rebuilt from a 0-error page (Norwegian Prima) with identity tokens + fill-guide header (231 pass, only definitional scaffold-fill errors remain). To build a ship page: copy any current passing page or fill the template; validate with bash admin/validate-ship-page.sh (target 0)." \
--tags inthewake,generators,ship-page,port-page,venue-page,validators,session-2026-07-11 --protected
```

---

## PART B — Register the incomplete HLS tasks

Run from the SSOT root so `admin/library.mjs` resolves (and, on the Mac with `gh`, also creates the linked GitHub issues). Append-only + safe.

```bash
cd /Users/kenbaker/ocs-work

# 1) The next open content gap — Margaritaville at Sea is a whole cruise line with NO pages.
node admin/library.mjs register \
  --title "Margaritaville at Sea buildout (#2004 + #2005): new cruise line with zero pages. Needs the cruise-line hub page, the ship page for 'Margaritaville at Sea Islander' (built from the rebuilt ships/template.html — source ALL stats via original research, never training data), and its venue pages. Voyage-pack driven; wire hub + search-index + fleets.json." \
  --repo InTheWake --priority 2 --task-id itw-margaritaville-line-buildout \
  --tags content,ship-page,venue-page,cruise-line,margaritaville,session-2026-07-11

# 2) grand-pacific.html logbook is internally inconsistent (found during #2006).
node admin/library.mjs register \
  --title "Fix grand-pacific.html logbook internal inconsistency: overview correctly calls it a complimentary main dining room, but the logbook describes it as a '\$29-39 Pan-Asian specialty' (mis-pasted venue-generator template). Rewrite the logbook to match the venue. CHECK Savor/Taste and other generated MDR pages for the same generic/wrong 'Guest Experience Summary' logbook (venue generator emits it unless real review data supplied)." \
  --repo InTheWake --priority 3 --task-id itw-grand-pacific-logbook-fix \
  --tags content,venue-page,internal-consistency,ncl,session-2026-07-11

# 3) Ship-page per-page validator sweep (systemic 2-error bug already fixed in main).
node admin/library.mjs register \
  --title "Ship-page validator sweep: the systemic 2-error article-thumbnail bug is fixed (articles/index.json .jpg->.webp, main), so ships that had ONLY those 2 now pass. Remaining ships have PAGE-SPECIFIC errors to clear (observed: carnival/index.html ~19, carnival-luminosa 5, carnival-vista 4, msc-preziosa/msc-orchestra 3, several at 2). Run admin/batch-validate-ships.js, triage, fix per-page." \
  --repo InTheWake --priority 3 --task-id itw-ship-page-error-sweep \
  --tags ship-page,validators,cleanup,session-2026-07-11

# (Lower) venue-logbook quality lever
node admin/library.mjs register \
  --title "Upgrade generated venue logbooks: the NCL/Carnival/MSC/Virgin venue generators emit a generic 'Guest Experience Summary' logbook (W08 warning) unless real review data is supplied. Run venue-page-writer / supply venue-reviews.json entries so venue logbooks are specific and correct." \
  --repo InTheWake --priority 4 --task-id itw-venue-logbook-quality \
  --tags venue-page,content-quality,session-2026-07-11

# Then regenerate the InTheWake mirror from the authoritative catalog and commit
# (preserve any pre-existing rows — do NOT let a regen drop them):
node admin/library.mjs mirrors --repo InTheWake
git -C /Users/kenbaker/ocs-work add .household-library/catalog.jsonl .household-library/events.jsonl docs/HOUSEHOLD-TASK-INDEX.md .memory/cruising
git -C /Users/kenbaker/ocs-work commit -m "memory+HLS: persist 2026-07-11 generator-audit + content-session lessons + tasks"
```

---

## PART C — What already shipped this session (context; NO replay needed)

All merged to `InTheWake` main via **PR #2021** (my branch `claude/jsschrstrcks1-repo-enumeration-ms5jzq` was merged and deleted; I fast-forwarded to `930ffa24`):

- **#2009** Great Stirrup Cay port page — built, 88/100 PASS, closed.
- **#2008** Eastport, Maine port page — built, 92/100 PASS, closed.
- **#2007** Manhattan Room venue — was **already present** at `the-manhattan-room.html` (grounded-negatives catch); linked it in the two Breakaway voyage packs; closed.
- **#2006** Magenta + Orchid Garden venue pages — built, 0 validator errors, linked in the Gem pack; closed.
- **Generator adequacy fixes:** port generator (analytics + `<h2>Credits</h2>` + og:image); `assets/data/articles/index.json` `.jpg`→`.webp` (fleet-wide ship validator pass); `ships/template.html` rebuilt from a passing page with identity tokens.

Open GitHub issues remaining in the voyage-pack content series: **#2004** (Margaritaville at Sea Islander ship page) and **#2005** (Margaritaville venues) — see HLS task `itw-margaritaville-line-buildout`.

---

## PART D — Where the container-local memory copies live (skills-commons lineage)

Pushed to the skills-commons `open-claw-stuff` origin, branch `claude/jsschrstrcks1-repo-enumeration-ms5jzq-sz6z67`, under `.memory/cruising/`:
`fb4ebcd6` (generator adequacy), `7a93b3a5` (venue pages), `a7d36fad` (temperate port), `6a5d6693` (port workflow).

Nothing depends on those surviving — **Part A fully reproduces them** against the true SSOT.
# Handoff — Generator audit session: memory + HLS replay (Mac SSOT)

**Author:** Container session (2026-07-11) · **Replayed by:** grok1 on Mac (`/Users/kenbaker/ocs-work`)  
**Status:** ✅ **REPLAYED** on Mac SSOT — 2026-07-11  
**Code:** Already in `main` via PR #2021 — no code replay needed.

---

## Container blocker (documented)

The container's `open-claw-stuff` clone was the **skills-commons lineage** (no `.household-library/`, no `admin/library.mjs`). Memories were written to a reachable `.memory/cruising` on the wrong remote; HLS tasks could not register. This handoff is the replay surface.

**Do NOT merge the container's open-claw-stuff branch into household SSOT.**

---

## PART A — Memories (✅ replayed)

Four session memories promoted on Mac SSOT (`ocs-work/.memory/cruising/`):

| ID | Topic | State |
|----|-------|-------|
| `fb4ebcd6` | Page-generator adequacy audit (ports fixed, venues ok, ships systemic fix + template rebuild) | protected, verified |
| `6a5d6693` | New port-page build workflow (Great Stirrup Cay #2009, 88/100 gold) | protected, verified |
| `a7d36fad` | Temperate port build specifics (Eastport #2008, weather validator gotchas) | protected, verified |
| `7a93b3a5` | NCL venue pages (#2006 Magenta/Orchid, #2007 Manhattan Room) | protected, verified |

Linked: `fb4ebcd6` ↔ `6a5d6693` / `a7d36fad` / `7a93b3a5`; `7a93b3a5` ↔ `77e4d283` (venue-logbook voice).

---

## PART B — HLS tasks (✅ registered)

| task_id | P | GitHub |
|---------|---|--------|
| `itw-margaritaville-line-buildout` | 2 | [#2403](https://github.com/jsschrstrcks1/InTheWake/issues/2403) — supersedes content gap #2004 + #2005 |
| `itw-grand-pacific-logbook-fix` | 3 | [#2404](https://github.com/jsschrstrcks1/InTheWake/issues/2404) |
| `itw-ship-page-error-sweep` | 3 | [#2405](https://github.com/jsschrstrcks1/InTheWake/issues/2405) |
| `itw-venue-logbook-quality` | 4 | [#2406](https://github.com/jsschrstrcks1/InTheWake/issues/2406) |

Mirrors regenerated: `node admin/library.mjs mirrors --repo InTheWake`

---

## PART C — Prior handoff also replayed

`admin/handoffs/2026-07-11-memory-hls-persistence.md` (Flickr audit + FOM tasks) was replayed earlier on Mac:
- Memories M1–M6 + FOM decisions (`69ca600d`, `639cd9aa`, etc.)
- HLS: `itw-flickr-arr-remediation`, `itw-fom-storage-structure`, `itw-fom-chat-image-intake`, `itw-fom-ip-protection`

---

## Session code delivered (already on main)

- Eastport #2008, Great Stirrup Cay #2009
- Magenta + Orchid Garden venue pages #2006
- Manhattan Room link #2007
- Port generator fixes (`3ea7952f`)
- Ship thumbnail systemic fix + template rebuild (`e330e3fa`, `1aed1bcc`)

*Soli Deo Gloria.*
