# Voyage Pack Pre-Ship Review Checklist

**Created:** 2026-06-04
**Updated:** 2026-09-26 (second pass): classes K (outside text into the page), L (ship facts and the ship-page FAQ) and M (live links) added, and G and J extended, all from the Prima pass. Earlier 2026-09-26: classes G (companion coverage), H (linked tools), I (PDF links) and J (media), each from a defect found in the Prima pre-ship pass. A–E are the original five; F was added 2026-09-07.
**Purpose:** Catch the five problem-classes that have shipped in voyage packs despite the original-research factual gate and the voice-audit cluster framework. Built from a problem inventory of the v0.1.4 Anthem pack performed AFTER both sidecars were in place — proving that the sidecars alone do not catch everything.
**Companion to:** `.claude/skills/original-research/ORIGINAL-RESEARCH.md` (factual), `.claude/skills/voice-audit/SKILL.md` v2.3.0 (voice), and the `.factcheck.json` sidecar schema.

This is a **human-or-Claude-with-file-access read pass**, run as the last gate before a pack ships. It is not automatable in full — several classes require domain judgment — but each item names what to look for and which guardrail owns the fix.

---

## Why this exists

The Anthem pack passed the factual gate (every claim sourced in the sidecar) AND carried a voice_audit block — and a fresh read still found 13 distinct problems across five classes. The sidecars verify *what was checked*; they do not force a check of *what nobody thought to check*. This checklist is the "what nobody thought to check" backstop.

The five classes, each with the Anthem instance that proves it:

| Class | Anthem instance |
|---|---|
| A. Un-caught factual | "168,666 GT… filters rough water" (tonnage is volume, not stability) |
| B. Internal inconsistency | $3,940 total in budget section vs. $5,000 in closing |
| C. Under-counted voice cluster | Closing's imagined humpback-breach/calving/twilight triplet |
| D. Register leak | "research-mode audience" (strategy-doc vocabulary in the product) |
| E. Time-sensitivity | "$18.50/day (effective November 2024)" on a June 2026 sailing |

---

## A. Un-caught factual — the "physics & geography" pass

The factual sidecar verifies ship specs, christening, policies, prices, venues. It does NOT force a check of *claims that synthesize facts into assertions*. These are the dangerous ones — they sound authoritative and a domain reader catches them instantly.

- [ ] **Every causal/physical claim is true, not just every datum.** "The ship is large enough (GT) that rough water is filtered" — the GT number is correct; the causal claim is false (tonnage ≠ stability). Flag any sentence of the form "[true fact] therefore [comfort/safety/outcome claim]" and verify the *therefore*.
- [ ] **Itinerary-specific geography matches the actual routing.** "Inside Passage = protected water" is true for Vancouver departures, false-ish for Seattle round-trips (open-Pacific exposure off Vancouver Island). Verify route claims against the *specific departure port*, not generic destination lore.
- [ ] **Body/comfort/medical promises are hedged, never absolute.** "You almost certainly won't be seasick" is a promise about a stranger's body. Downgrade to "most cruisers on this route report…" with a source, or cut.
- [ ] **Accessibility specifics are verified, not plausible.** "North Star fits one wheelchair per ride" — verify with the cruise line or cut to "confirm with Guest Services."
- [ ] **Owner:** original-research skill. **New sub-rule to add:** "synthesized causal claims" join the factual-claim categories — a true datum inside a false inference is still a confabulation.

## A2. Port grounding — the "does this port have a page?" pass

Added 2026-07-30 after the v0.1.17 world-cruise audit. Ports **with** an InTheWake page get grounded against that page almost automatically. Ports **without** one silently fall back to model recall, and nothing in the factual sidecar catches it — there is no category for "a port we said things about but never checked."

- [ ] **List every port the pack names.** Then, for each: does `ports/<slug>.html` exist? **Check slug variants before concluding no** — Port Stanley lives at `falkland-islands`, Malé at `maldives`, Port Louis at `mauritius`, Fort Lauderdale at both `ft-lauderdale` and `port-everglades`. On v0.1.17 a first pass "found" 9 missing pages that were really 19; ten existed under different names.
- [ ] **For every port with NO page: cite a primary source for each claim, or don't make the claim.** One-line generalities are acceptable *only* if they are flagged in the sidecar as unverified. On v0.1.17 the nine unpaged ports produced five defects, including a factual error (passengers land on Île Royale, not Devil's Island) and an unsourced actionable recommendation (San Antonio named as the mid-voyage family rendezvous when the line had published no segments at all).
- [ ] **Distance words are claims.** "Near", "just inland", "a short drive" each need a number. Cape Coast was described as "near Takoradi"; it is 81 km and ~1½ hours each way — a full-day excursion, not a hop.
- [ ] **Tender status is an accessibility claim.** Every tender port must appear in the pack's tender list *and* its accessibility section. Lüderitz was missing from both.
- [ ] **Name the berth when it changes the day.** A working container harbour with nothing in walking distance (Réunion's Le Port / Pointe des Galets) is planning-relevant; silence implies a walkable port.
- [ ] **Owner:** original-research skill + this checklist. Ports without site pages should also be registered individually in the HLS as page-build candidates, not lumped into one task.

## B. Internal inconsistency — the "same-number-twice" pass

- [ ] **Grep every dollar total, then reconcile.** The same headline figure ($2,400 cabin → door total) must match everywhere it appears. Anthem had $3,940 and $5,000 for the identical example.
- [ ] **Grep every count (decks, crew, capacity, nights) and confirm one value across the whole pack** — including the prose sections, not just the At-a-Glance table. (This is how "18 decks" survived in the first-cruise section while the table said 16.)
- [ ] **After any itinerary restructure, re-derive every day-number reference and every itinerary string.** The emergency-card itinerary string and the day-by-day must tell the same story. Anthem's restructure left the handoff card showing one sea day when the body now has two.
- [ ] **Owner:** a new lightweight check — `factcheck-gate.sh` could grep for repeated dollar figures and flag divergent totals, but reconciliation needs a read. Add to the checklist as a mandatory grep step.

## C. Under-counted voice cluster — the "imagined-experience" pass

The voice_audit block counts machine tells and runs cluster detection, but a first-pass audit (even orchestra-extended) systematically *under-counts* the second-person-prophecy and imagined-experience passages because each individual sentence is defensible.

- [ ] **Flag every passage that narrates an experience on the reader's behalf.** "a humpback breach you happened to look up for, the silence after a calf falls, twilight at 10:45 PM" — beautiful, and exactly the AI move (evoking lived experience the author never had). These cluster into Layer 1 even when each clause is individually fine.
- [ ] **Flag whole sections written in second-person prophecy.** Anthem's entire "First Cruise Notes" section is "you will feel X, you will forget Y, the crew will remember Z." A section with zero first-person anchors and all reader-prophecy is the strongest absent-marker signal in the pack.
- [ ] **Count rhetorical crutch-words.** "honest/honestly" appeared 9× in the Anthem pack. Any framing word used 5+ times as a credibility-claim ("honest," "real," "genuinely," "actually") is performing the virtue it names. Grep and count; 5+ is a flag.
- [ ] **Owner:** voice-audit skill. **New sub-rules to add to v2.4.0:** (1) "imagined-experience-on-reader's-behalf" as a named Layer 1 pattern; (2) "second-person-prophecy section" as a structural absent-marker; (3) "credibility-crutch-word frequency" (grep count, threshold 5).

## D. Register leak — the "internal-vocabulary" pass

- [ ] **No strategy-doc or audience-profile vocabulary in reader-facing prose.** "research-mode audience," "ICP," "conversion," "decisional surface," "AEO," "moat" — these belong in `admin/` planning docs, never in a pack a customer reads. Grep the pack against a banned-internal-vocabulary list.
- [ ] **No meta-commentary about the reader as a market segment.** The reader is a person planning a trip, not a cohort.
- [ ] **Owner:** new tiny grep list. Candidate banned-internal terms: `research-mode, party-mode, ICP, ICP-2, conversion, decisional, wayfinding (as CTA-category jargon), AEO, GEO, moat, funnel, cohort, segment, persona`. Add to a `voice-audit` grep or a standalone pre-ship grep.

## E. Time-sensitivity — the "future-dated sailing" pass

- [ ] **Every point-in-time figure carries a reader-facing freshness cue, not just a sidecar verification date.** "$18.50/day (effective November 2024)" on a 2026 sailing silently telegraphs staleness. Reframe customer-facing as "verify current rate at booking — this was $18.50/day as of late 2024."
- [ ] **The pack states its own review date prominently** and tells the reader which categories age fastest (gratuity rates, package prices, excursion prices, fuel-driven costs).
- [ ] **Owner:** pack template. Add a standard "Prices verified [date] — always reconfirm at booking; gratuity and package rates change 1–2×/year" line near the budget section, and ensure the colophon's "Last reviewed" is current.

---

## F. Variant coverage — the pass is not one file

Added 2026-09-07, after the Escape pre-ship pass fixed the long-form pack and left the SAME defects
standing in the condensed variant, which is the file a reader actually carries ashore.

A pack is up to three shipped documents, each with its own `.md` and its own PDF, all listed in
`packs.json`: the long form, `*-condensed.md` (3 pages), and `*-handoff-card.md` (1 page). They were
written by copying from the long form, so **every defect class below propagates to them silently**,
and nothing in the factual sidecar or the voice-audit block looks at them.

- [ ] **List the variants before you start.** `ls admin/voyage-packs/ | grep <version>` — long form,
      condensed, handoff card. The pass covers all of them or it is not finished.
- [ ] **Re-run every grep-able item against each variant**, not just the long form. On Escape the
      condensed file still named an Observation Lounge four times (a venue that ship does not have),
      still marked Great Stirrup Cay as a tender call in its own Tender column, and still carried two
      taxi fares the long-form pass had already reconciled.
- [ ] **Rebuild every variant's PDF, not just the one you edited.** `voyage-pack-pdf-build.sh <ship>`
      builds the LONG FORM ONLY; `condensed` and `handoff` are separate targets. A rebuilt long form
      next to a stale condensed is the shape this rule exists to stop — verified by reading the
      rebuilt PDF's text, not by trusting the build log.
- [ ] **Owner:** this checklist. A per-pack variant sweep is a candidate for `factcheck-gate.sh`
      (grep each variant for the phrases the long form no longer contains), not yet built.

## G. Companion coverage — the promise is kept offline, or it is not kept

Added 2026-09-26, during the Prima pre-ship pass (sailing 2026-09-27). Asked what the offline
companion carried, the answer described a Ship section the companion did not have; the operator
caught it. The pack's "What arrives" list is a promise about the **companion**, the thing a guest
opens at sea with no signal, and a PDF on the landing page does not keep it.

- [ ] **Every section the pack's promise names is in the companion, and loads offline.**
      `node admin/scripts/build-voyage-guides.mjs --check` must print `CLEAN` (the Ship and Ports tabs,
      the search index and the full-pack guide are generated from the pack's own `.md`). Then open the
      companion, let the service worker install, go offline, reload, and read the Ship tab, a port
      day, a search result and the full-pack guide. Checked by reading, not by trusting the build log.
- [ ] **A change to `companion.js` or `companion.css` bumps the cache.** Every companion's `?v=` and
      `sw.js`'s `CACHE` name and precache URLs move together (v10 → v11 on 2026-09-26). Without it,
      an installed phone keeps the old code forever.
- [ ] **"Where is the ship right now?" is anchored to the right ship.** Each companion's `imo:` field
      is checked against a source outside our files (the ship's Wikipedia infobox), and its tracking
      link points at that IMO, not a name search. The schedule line (works offline) and the live map
      (loads only on a tap) stay separate, and neither passes for the other.
- [ ] **The Emergency tab's numbers match the pack's**, number for number.
- [ ] **No installed app claims more of the site than its own pages.** A web-app manifest's `scope`
      decides which links Android opens inside that app. The private "Ken" app had `scope: "/admin/"`,
      so on a phone without Chrome every voyage-pack link opened inside it and failed with "requires
      Chrome". Every manifest's `scope` is its own folder or page; when narrowing one that is already
      installed, pin `id` to its old identity so phones update it in place (fixed 2026-09-26,
      checked with Chromium's own manifest parser).
- [ ] **The footer carries the tip link, and nothing that tracks.** One line under the disclaimer:
      "If this companion helped your trip, you can leave Ken a tip" to `buymeacoffee.com/inthewake`,
      `rel="noopener"`, no `data-umami` attribute (the companion promises no tracking). The
      disclaimer wording is never edited.
- [ ] **Owner:** `build-voyage-guides.mjs --check`; `tests/unit/voyage-usage/guides.test.mjs`,
      `where-now.test.mjs` (pins every checked IMO), `companions.test.mjs`.

## H. Linked tools — a link must open on this ship's line, with data that agrees with the pack

Added 2026-09-26. The Prima pack mentioned the drink calculator without linking it, and its one link
opened the **Royal Caribbean** calculator for a Norwegian cruise. Fixing the link surfaced three
more things: every `?line=` link hung on the loading screen (a boot-order bug), the calculator's NCL
data said $109/day where NCL's own page said $45, and it warned that packages no longer covered
Great Stirrup Cay, where NCL's page said the Open Bar covers the island. Separately, the stateroom
check could not select a single non-RCL ship, while thirteen non-RCL packs told readers to run it.

- [ ] **Every tool link opens preset to the pack's line.** The drink calculator takes
      `?line=<id>` (ids in `assets/data/calculator-config.json`: `royal-caribbean`, `ncl`,
      `carnival`, `msc`, …). Open each link in a browser and confirm it boots on that line.
- [ ] **The tool's data agrees with the pack on every figure and policy both state.** Where they
      disagree, the primary source decides (for Prima, NCL's Free at Sea page sided with the pack),
      and whichever is wrong is fixed **before** the link ships, with the correction saying what
      the old version claimed.
- [ ] **Never send a reader to a tool that cannot answer for their ship.** The stateroom check
      covers Royal Caribbean (every cabin, all ships) and Norwegian (complete on four ships, partial
      on sixteen, and it says which). A ship whose file is a placeholder is not in its picker.
      Confirm the pack's ship is offered before linking.
- [ ] **Owner:** this checklist; `tests/unit/stateroom-check.test.mjs` (picker = ships with real
      data); `scripts/test-math-engine.js` and `scripts/test-personas-calculator.js` (calculator data).

## I. PDF links — every link must work on the reader's phone

Added 2026-09-26. The PDF build rewrote **every** site link to a `file://` path on the machine that
built it, so a reader tapping any site link in a shipped PDF opened nothing: 113 of the Prima PDF's
119 links. The build now keeps `file://` for images only.

- [ ] **Run the checker on every PDF the pack ships** (long form, condensed, handoff card):
      `node admin/scripts/check-pack-pdf-links.mjs <pdf> [...]`, or `--all` for every PDF in
      `packs.json`. It must say `CLEAN` for each. A `file://` link, or a site link to a page that
      is not in the repo, is a `REPORT`. A PDF whose links it cannot read is `UNAVAILABLE` and is
      never counted as clean. A handoff card with no links at all is `CLEAN: no links`.
- [ ] **Rebuild after any build-script change**, not only after a text edit: a PDF built before
      2026-09-26 carries the dead links even if its `.md` is untouched.
- [ ] **Owner:** `admin/scripts/check-pack-pdf-links.mjs`; `tests/unit/pack-pdf-links.test.mjs`.

## J. Media — real, checked, credited

Added 2026-09-26. Ship videos across the site included clips that were not of the ship named; the
cleanup kept only videos whose own YouTube title names the ship, and left 47 ships with none rather
than keep a wrong one.

- [ ] **Every video passes the name rule.** `node admin/scripts/verify-ship-videos.mjs --check`.
      In the companion, nothing loads from YouTube until the reader taps Play, and then only from
      `youtube-nocookie.com`.
- [ ] **A video's category comes from YouTube's own title, never from us.** The checker stamps
      `category` from the title (`categoryOf`); a title that names none gets none, and the ship
      validator counts those stamps. Never invent or stretch a category to satisfy the validator: that
      is how three Pearl vlogs became "Prima Suite Tour" 470 times. A ship short of a category gets
      real videos found, looked up with YouTube oEmbed, recorded in
      `admin/data/video-verification/`, and run through the checker, or it stays short.
- [ ] **Every video meets the site's content standard, checked by a person watching it.** No
      profanity, no vulgarity, no politics, no sexual or suggestive content, applied the same way to
      every creator. A title and a channel name cannot show this; say so in the commit when a video
      ships before it has been watched, and name who is watching it (Prima, 2026-09-26: 11 videos
      put on the page for the operator to watch there).
- [ ] **The ship page shows every checked video it has**, up to 24, built as in class K.
- [ ] **A ship photo is licensed, credited and this ship's.** Licence, photographer, licence link and
      source on the caption; the image-reuse guardrail applies (one image, one ship).
- [ ] **Owner:** `verify-ship-videos.mjs`; `tests/unit/ship-videos.test.mjs`; `admin/validate-ship-page.js`; image-reuse-guardrail.

## K. Outside text into the page — build it with DOM calls, never with HTML strings

Added 2026-09-26. The ship-page video carousel put YouTube's own titles into an HTML string for
`innerHTML`, escaping `<` and `>` but not `"`, so a quote in a title could break out of the `title`
attribute. Found on 151 ship pages, with a dead `initVideos()` block carrying the same pattern, with
no escaping at all, on 162. This is the house rule "no raw HTML injection from untrusted data", and
this class exists so the fix is required, not optional.

- [ ] **Anything that did not come from our own code reaches the page through DOM calls:**
      `textContent`, `document.createElement`, property assignment or `setAttribute`. That covers
      YouTube titles and channels, every API answer (weather, alerts, exchange rates), every JSON data
      file, and anything a traveler types (the journal). Never concatenated into a string for
      `innerHTML`, `outerHTML`, `insertAdjacentHTML` or `document.write`.
- [ ] **Partial escaping is a failure, not a fix.** Escaping `<` and `>` leaves attributes open. Where
      existing code builds HTML strings (the companion does), every outside value goes through the
      escaper for its context: `esc()` for text between tags, `attr()` (which also escapes `"`) for
      attribute values. Checked 2026-09-26: the companion does this throughout.
- [ ] **Dead code with the unsafe pattern is removed, not left.** A never-called block is one
      template edit away from live.
- [ ] **Checked in a browser**, not only by reading: frames or items render, a test value containing
      a double quote stays inside its attribute, 0 page errors.
- [ ] **Owner:** `tests/unit/outside-text-dom.test.mjs` fails if a known-unsafe pattern returns to a
      ship page or the companion.

## L. Ship facts and the ship-page FAQ — the line's own current numbers, computed, never copied

Added 2026-09-26. Prima's page said 1,388 crew; NCL's own Prima page says 1,506. Three of our data
files disagreed with each other on tonnage, guests, crew and even the IMO number, and the page claimed
"the highest guest-space ratio in the NCL fleet" with no source.

- [ ] **Guests (double occupancy) and crew come from the line's own current ship page**, read from the
      page text, not a search summary; gross tonnage from the classification register (DNV, Lloyd's
      Register) as cited on the ship's Wikipedia infobox. A pre-build press-release figure is not a
      delivered figure.
- [ ] **Every copy of a figure agrees**: the page's fact block, key facts, stats fallback, noscript
      line, stat tiles, and the data files (`ncl_ships_meta.json`, `fleet_index.json`,
      `ship-space-and-crew.json`).
- [ ] **Ratios are computed from those figures, never copied**: guests per crew member, gross tons
      per guest (the space ratio), gross tons per person aboard. A comparison ship's figures are
      sourced the same way. Say what the crew count includes (everyone who works aboard).
- [ ] **Gross tonnage is explained, not converted.** It is volume ("a function of the moulded volume
      of all enclosed spaces of the ship", IMO), so it is never turned into square feet; no line
      publishes usable square feet per guest.
- [ ] **A superlative without a source is removed** (original-research, confabulation mode 3).
- [ ] **The FAQ keeps the validator's limit** (eight questions); fold an explanation into the answer
      that uses it rather than adding a question.
- [ ] **Owner:** `assets/data/ship-space-and-crew.json` (figures, sources, dates); original-research.

## M. Live links — every link must open on the live site

Added 2026-09-26. `/planning/`, `/cruise-lines/`, `/ports/` and `/restaurants/` all return 404 on
cruisinginthewake.com, because the site is served by GitHub Pages and GitHub Pages ignores
`_redirects`. About 250 ship pages linked them.

- [ ] **Check a link against the live host, not the repo's redirect file.** Link the `.html` page
      that actually loads.
- [ ] **Owner:** `admin/validate-ship-page.js` (`navigation/missing_nav_items`).

## How this checklist runs

1. After the factual sidecar passes and the voice_audit block is written, run THIS checklist as a final read pass.
2. Each unchecked box is a finding; log findings into the relevant sidecar block (factual → `.factcheck.json` factual categories; voice → `voice_audit`; new classes D/E → a `preship_review` block).
3. The grep-able items (repeated dollar figures, crutch-word count, internal-vocabulary list) should migrate into `factcheck-gate.sh` over time so they become mechanical. The judgment items (physics claims, geography, imagined-experience) stay human-or-Claude-read. Already mechanical, run them every pass: `build-voyage-guides.mjs --check` (G), `check-pack-pdf-links.mjs` (I), `verify-ship-videos.mjs --check` (J), `tests/unit/outside-text-dom.test.mjs` (K), `node admin/validate-ship-page.js <ship page>` (J, L, M), `check-voyage-registry.mjs`, and `node --test "tests/unit/**/*.test.mjs"`.
4. **Do not ship a pack until this checklist has been run once with file access and the findings dispositioned.**
5. **Never bypass a gate to ship.** When the ship-page regression gate blocks a commit, find why: on 2026-09-26 it blocked Prima because the validator counted a structure the honest-video cleanup had removed, and the fix was to give the checker real structure, not to refresh the baseline or use `--no-verify`.

### Planned for the companion, not yet required

The ship-tab FAQ for booked guests, the top-level Alerts tab (CDC outbreak notices plus US, UK and Canadian advisories for each port), and the private Journal (`admin/claude/plans/voyage-journal.md`). When each ships, it gets a class here.

---

## Doctrine changes this checklist implies (queued, not yet made)

- **original-research:** add "synthesized causal claims" as a factual-claim category (a true datum inside a false inference is a confabulation).
- **voice-audit → v2.4.0:** add imagined-experience-on-reader's-behalf (Layer 1), second-person-prophecy-section (absent-marker), credibility-crutch-word frequency (grep threshold 5).
- **factcheck-gate.sh:** add grep checks for divergent repeated dollar totals and a banned-internal-vocabulary list.
- **pack template:** standard freshness-cue line tying prices to a reconfirm-at-booking instruction.

These are deliberately listed, not yet implemented — the instruction that produced this checklist was "identify, don't change." Implementation is the next session's queue.

*Soli Deo Gloria — the pack a stranger trusts has to be true and has to sound like a person who was there.*
