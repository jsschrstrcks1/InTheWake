# Voyage Pack Pre-Ship Review Checklist

**Created:** 2026-06-04
**Updated:** 2026-09-26 (second pass): classes K (outside text into the page), L (ship facts and the ship-page FAQ), M (live links) and N (the Alerts tab) added, and G and J extended, all from the Prima pass. Earlier 2026-09-26: classes G (companion coverage), H (linked tools), I (PDF links) and J (media), each from a defect found in the Prima pre-ship pass. A–E are the original five; F was added 2026-09-07.
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
      `sw.js`'s `CACHE` name and precache URLs move together (bumped through v19 across the 2026-09-26 passes). Without it,
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
- [ ] **The Overview reads in the operator's order** (review of 2026-09-26): the companion's purpose
      first, larger, with "save it to your phone and it keeps working… even with no internet" in bold;
      the save-to-phone box second (plus a one-time install popup, never shown once installed); the
      printable PDFs last and quiet, labelled "Printable version of the full voyage pack (PDF)" and
      "Printable short version (PDF)". The header carries the cruise dates. The how-to names every tab
      as a working link, Alerts included, and says "Ship is your guide to the ship".
- [ ] **"Signal" is never left to mean a signal.** The companion and the pack say internet: "cell data
      or Wi-Fi, including the ship's Wi-Fi".
- [ ] **The Voyage tab tells people to tap a day**, opens the first day before the cruise (today's once
      it starts), marks only sea days ("Sea Day"), and puts under every "Depart" time: verify it on
      your way off the ship; it is **ship time**, not local time. Sea days may carry sourced ship
      history ("About your ship").
- [ ] **Something that opened recently is described by the reader's place in its story, not a date**
      ("your sailing is one of the first to experience it since it opened"), and a day count that
      will be wrong tomorrow is never written.
- [ ] **Buying advice quotes the line.** An operator-suggested claim with no source ("cheaper bought
      in advance") is not written; what the line actually says is (Great Tides: pre-book up to two
      days before sailing; onboard passes limited and not guaranteed).
- [ ] **Text size is adjustable** with a small, standard and large A; every font size scales and the
      page still fits a phone at the largest size.
- [ ] **Every line a traveler reads gets one proofreading pass**: the companion's itinerary strings
      (position, dock, plan, points of interest, history) and the pack's port sections, read as
      sentences, not checked as facts. Added 2026-09-26 after the operator found "if it's your first
      Jamaica", "the trip that converts non-snorkelers" (converts them into what?), "among the best
      reef" and "(settled second sea day)" in a pack that had passed every factual check. A fact pass
      does not catch a broken sentence.
- [ ] **The footer carries the tip link, and nothing that tracks.** One line under the disclaimer:
      "If this companion helped your trip, you can leave Ken a tip" to `buymeacoffee.com/inthewake`,
      `rel="noopener"`, no `data-umami` attribute (the companion promises no tracking). The
      disclaimer wording is never edited.
- [ ] **The FAQ tab carries the voyage's own sourced answers** (`V.faq`), each with a `source` line,
      links site-relative or https only, questions collapsed with the first open. It sits **next to
      last in the nav, right before Alerts** (operator 2026-09-26: it is a reference tab, not a primary
      one). Answers hold the content standard: no profanity, politics or glamorized overconsumption;
      port-safety and money answers say what the line or the government actually says, gently. Prima
      ships 18, including the shows (with the honest note that NCL prints no per-sailing showtimes), the
      solo hub, the cash-account freeze, and 2026 port safety (the Nassau welcome-bracelet, named plainly).
- [ ] **The Journal is private, on the phone, and honest about the cost.** It says it lives only on this
      phone and is gone if the app is deleted or the phone lost; it names the iPhone home-screen storage
      split; it offers a keepsake HTML export (every value through `jEsc`) and a JSON data copy, and sends
      nothing anywhere (no `fetch`/`sendBeacon` in the journal code). The one untrusted input, a loaded
      data copy, is sanitized on the way in: `jClean` strips control/zero-width/bidi characters, a file
      over 5 MB is refused before parsing, the entry count is capped (2000) and the names list bounded (50).
- [ ] **A link that leaves the page opens in a new window**, cruisinginthewake.com included, with a
      screen-reader "(opens in a new window)" note; in-page `#` jumps stay in the app. If the installed
      app was dropped from memory while the reader was out on a link, a "Back to where you were" bar
      restores their tab and scroll spot on return.
- [ ] **The Ship tab reads in the companion's own visual language**, not a big sans-serif article: photo,
      an "On this page" quick-links box, the "Before the cruise" schedule card, then "Where is the ship
      right now?" (its live map matching the ship pages' IMO-only address, no scheduled lat/lon, which is
      what produced "Bad request"), then the pack sections, videos and the full-pack link.
- [ ] **The Overview carries an About-the-builder card** with Ken's photo (precached in the app), a short
      bio, and links to his In the Wake author page and ken-baker.com (both open in a new window).
- [ ] **Owner:** `build-voyage-guides.mjs --check`; `tests/unit/voyage-usage/guides.test.mjs`,
      `where-now.test.mjs` (pins every checked IMO), `companions.test.mjs`; the companion feature tests
      `voyage-alerts.test.mjs`, `voyage-journal.test.mjs` (privacy words + import sanitizer) and
      `outside-text-dom.test.mjs` (no HTML-string building, in the companion and on the ship pages).

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

## N. Alerts — its own tab, always last, lit by the worst thing in it

Added 2026-09-26. The operator asked for Alerts as a top-level category, always the last tab, lit red
or yellow by severity, carrying CDC outbreak notices for the ship and US, UK and Canadian travel
advisories for every port's country. It was written up as "planned" instead of built, and the
operator found it missing on the Prima companion the day before she sailed. When the operator
describes a feature and says to build it, it is built, not filed.

- [ ] **Alerts is the last top-level tab** in every companion, not a weather sub-tab.
- [ ] **It is lit by the worst item inside it**: red for US level 3 or 4, UK advice against all or
      all-but-essential travel to the whole country, Canada "avoid non-essential" or "avoid all", or a
      CDC outbreak on this ship posted this month or last; yellow for US level 2, UK advice about
      parts of a country, Canada "high degree of caution" or a regional advisory, an older CDC
      outbreak, anything that could not be checked, or data more than 14 days old. The tab also
      gains a mark and a spoken word ("serious", "take care"); colour never stands alone.
- [ ] **A check that failed never reads as all clear.** "Couldn't check" and "not an all-clear" are
      said in words. The National Weather Service answers 400 for every point outside U.S. waters;
      that is "not covered here", not a failure and not a colour.
- [ ] **Government and CDC wording is quoted and linked**, and advice that covers only parts of a
      country says so and asks the reader to check whether it includes their port.
- [ ] **The data is current.** `node admin/scripts/build-voyage-alerts.mjs` writes
      `admin/voyage-pwa/alerts.json`; `.github/workflows/voyage-alerts.yml` runs it daily and starts
      the Pages deploy (a push made with the workflow's own token does not). Every companion port
      must map to a country or the script fails with exit 3. The State Department feed has errors
      (on 2026-09-26 the UAE was filed under Argentina's code and Brazil was missing), so an advisory
      is used only when its code and the country named in its own title agree.
- [ ] **`alerts.json` is network-first in `sw.js`**, with the last copy kept for offline use.
- [ ] **Owner:** `admin/scripts/build-voyage-alerts.mjs`; `tests/unit/voyage-alerts.test.mjs`;
      `.github/workflows/voyage-alerts.yml`.

## How this checklist runs

1. After the factual sidecar passes and the voice_audit block is written, run THIS checklist as a final read pass.
2. Each unchecked box is a finding; log findings into the relevant sidecar block (factual → `.factcheck.json` factual categories; voice → `voice_audit`; new classes D/E → a `preship_review` block).
3. The grep-able items (repeated dollar figures, crutch-word count, internal-vocabulary list) should migrate into `factcheck-gate.sh` over time so they become mechanical. The judgment items (physics claims, geography, imagined-experience) stay human-or-Claude-read. Already mechanical, run them every pass: `build-voyage-guides.mjs --check` (G), `check-pack-pdf-links.mjs` (I), `verify-ship-videos.mjs --check` (J), `tests/unit/outside-text-dom.test.mjs` (K), `node admin/validate-ship-page.js <ship page>` (J, L, M), `check-voyage-registry.mjs`, and `node --test "tests/unit/**/*.test.mjs"`.
4. **Do not ship a pack until this checklist has been run once with file access and the findings dispositioned.**
5. **Never bypass a gate to ship.** When the ship-page regression gate blocks a commit, find why before touching it. Two honest outcomes, and the difference is everything:
   - If your change genuinely introduced a new failure, fix the change (or give the checker the real structure it looks for) — never `--no-verify`, never edit the baseline to hide it.
   - If the gate is blaming your change for a failure it did not cause, prove it: run the validator on the file with your change and on the clean base version, in place, and compare the codes. On 2026-09-26 the honest-video cleanup produced byte-identical validator output to clean `main` on every one of 256 pages; the three "regressions" were pre-existing drift the 2026-05-12 baseline never recorded (it was four months stale). There the correct fix WAS to refresh the baseline — regenerated from a **clean** tree with `admin/aggregate-ship-validation.js` so it records deployed-main truth, never from your own patched tree, then the gate re-run confirmed 0 regressions. Refreshing a stale baseline from clean is maintenance; refreshing it to paper over a regression your change caused is the bypass this rule forbids.

### Planned for the companion, not yet required

The FAQ and the private Journal shipped 2026-09-26 and are now class-G items above. The next queued
companion work is the nav-ergonomics evaluation of the same date (below).

**Nav ergonomics (operator asked for a hard read, 2026-09-26).** Measured on a 390-wide phone:
- The chrome above content is **283px, about 34% of a 390×844 iPhone** on every tab (brand + subtitle,
  a control row of text-size/location/unit, the search box, then the nav). A third of the first screen
  is spent before any content. Candidate: collapse the control row, or fold search behind a tap.
- The nav is **9 tabs wrapping to three rows** (4 + 4 + 1), with Alerts stranded alone on the last row.
  Nine exceeds the 7±2 span and the wrap means a tab's row position is not stable across voyages (FAQ and
  Emergency are conditional). Candidate: a single-row horizontally-scrollable nav keeps spatial memory and
  reclaims ~80px; or group Weather+Alerts.
- Weather hides a **second tier of four sub-tabs** (Now / 10-Day / Radar / Averages) shown only when it
  is active; discoverability is low.
- The Overview front-loads **eight stacked cards**; a first-time reader scrolls the whole deck before
  reaching a tab. Mostly well-chunked, but the how-to card could be a collapsed `details`.
These are findings, not yet changes — the operator asked for the evaluation, not the build.

---

## Doctrine changes this checklist implies (queued, not yet made)

- **original-research:** add "synthesized causal claims" as a factual-claim category (a true datum inside a false inference is a confabulation).
- **voice-audit → v2.4.0:** add imagined-experience-on-reader's-behalf (Layer 1), second-person-prophecy-section (absent-marker), credibility-crutch-word frequency (grep threshold 5).
- **factcheck-gate.sh:** add grep checks for divergent repeated dollar totals and a banned-internal-vocabulary list.
- **pack template:** standard freshness-cue line tying prices to a reconfirm-at-booking instruction.

These are deliberately listed, not yet implemented — the instruction that produced this checklist was "identify, don't change." Implementation is the next session's queue.

*Soli Deo Gloria — the pack a stranger trusts has to be true and has to sound like a person who was there.*
