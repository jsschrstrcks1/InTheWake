# Unfinished Tasks — InTheWake

> **Task custody (HLS):** Work queues live in `.household-library/catalog.jsonl` — not in this file.
> Find/checkout: `node admin/library.mjs preflight --query "<task>" --patron <id> --merge`
> **This document** is context/spec only unless stated otherwise.

**Generated:** 2026-07-11T23:52:20.427Z
**SSOT:** `.household-library/catalog.jsonl`

Open tasks for this repo (`state` ≠ `complete`). Regenerate:

---

## P2 — Voyage packs → PWA deep integration (`itw-voyage-pwa-integration`, queued 2026-07-07)

**Goal:** soft-deprecate the voyage-pack PDFs. Each voyage's PWA companion
(`admin/voyage-pwa/`) becomes the primary, content-complete document; PDFs keep building
as the secondary printable artifact. Operator-approved design, adversarially reviewed via
the orchestra (cruising mode, run state `ken/orchestrator/state/orchestra.json`,
2026-07-07; decisions encoded to cognitive memory `cruising/fb740ed4`, session record
`cruising/57e8e526`).

**Design (approved, with orchestra amendments folded in):**
- New `pwa` target in `admin/scripts/voyage-pack-pdf-build.sh` (extend, don't fork):
  pandoc converts each gate-checked pack `.md` → three HTML fragments per voyage under
  `admin/voyage-pwa/packs/` — `<slug>.guide.html`, `<slug>.condensed.html`,
  `<slug>.card.html`. SDG comment line 1; root-relative hrefs → absolute
  `https://cruisinginthewake.com/...`; image srcs stay root-relative; links get
  `target="_blank" rel="noopener"`; "generated — do not hand-edit" header. Mapping table
  (pwa slug ↔ three md stems) lives in the build script. Clone-stable staleness check
  extends to fragments (same pre-commit gate as PDFs).
- **Build-time fragment validator (blocking):** no `<script>`/`on*`/`javascript:`, no
  relative hrefs left, sane headings, TOC anchors resolve, SDG present. This is the XSS
  gate — no runtime sanitizer library.
- `companion.js`: three new tabs Guide / Quick Ref / Card; prefetch all three fragments
  on idle after boot; **collapsible TOC generated from fragment headings** (not a flat
  select) + back-to-top; fragment fetches wrapped in a ~4s abort timeout (ship-Wi-Fi
  captive portals hang, not fail); fragment footer shows pack version + build date +
  "offline copy" badge when served from cache; Overview gets a one-tap **Emergency card**
  link and the primary CTA flips to the in-app Guide (PDFs demote to "Prefer a PDF?").
  Card renders verbatim (fill-in by hand after printing; editable persisted fields
  deferred). Wide pack tables get overflow-x wrappers. `@media print` prints only the
  open pane.
- `sw.js`: bump `voyage-v3` → `voyage-v4`. `/admin/voyage-pwa/packs/` = network-first
  with cache fallback. Same-origin images cached by **path-prefix allowlist**
  (`destination === "image"` + prefixes like `/ports/img/`, `/assets/`) — NOT a referrer
  check (shells send `no-referrer`; a referrer rule would never match — orchestra review
  caught this). No SW precache of fragments (would bloat every installer's cache with 13
  other voyages).
- Five shells whose `pdfFull` points at the Maulsby page get corrected to real PDF URLs.

**Missing artifacts to author (no-new-facts rule — every claim must already exist in
that voyage's gate-checked full pack; diff-review against parent before commit):**
- 5 condensed packs: Margaritaville, Gem, Breakaway Bermuda, Fall Foliage, Aqua Thanksgiving.
- 9 handoff cards: Symphony, Aqua Veterans, Sisters at Sea, Anthem, Margaritaville, Gem,
  Breakaway Bermuda, Fall Foliage, Aqua Thanksgiving.
- Register all in `CONDENSED_PACKS` / `HANDOFF_CARDS`; build + commit the missing main
  PDFs (Gem, Breakaway Bermuda, Fall Foliage, Aqua Thanksgiving).

**Rollout:** (1) pipeline + engine + **Escape pilot** end-to-end (verify tabs, offline
reload, phone-viewport print via the preinstalled Chromium/Playwright); (2) author
missing artifacts; (3) all 14 voyages, including **two new shells: Symphony and Bliss —
Bliss first, it sails July 2026 (time-critical)**.

**Next step for any resuming session:** write the spec to
`docs/superpowers/specs/2026-07-07-voyage-pack-pwa-integration-design.md` (design above
is the content; operator already approved the design + orchestra amendments in-session),
get operator review, then `writing-plans` → implement. Do NOT re-litigate the settled
decisions (soft deprecation; all 14; all three artifacts; Approach A build-generated
fragments; rejections recorded in memory `fb740ed4`).

**Related follow-up (`itw-voyage-pwa-icons`, P4):** all 14 PWAs share identical
home-screen icons — a traveler with several voyages installed can't tell them apart.
Per-voyage icon variants; pre-existing condition, not part of the integration work.

**Cross-repo note (`ken-xai-key`):** the seeded `XAI_API_KEY` is invalid (xAI 400
"Incorrect API key") — Grok challenge/blind-spot roles fail; Perplexity substituted per
R7 precedent. Needs a fresh key from console.x.ai + seed re-encode on the operator box.

---

## P2 — Data-integrity: Anthem of the Seas deck count — ✅ RESOLVED 2026-06-18

**Severity:** Non-blocking, factual. **File:** `assets/data/ships/rcl/anthem-of-the-seas.page.json` + `ships/rcl/anthem-of-the-seas.html`
**Found by:** Original research during the deck-plans article build (`articles/anthem-of-the-seas-deck-plans.html`).

`page.json` recorded `decks_total: 18` / `decks_guest: 16`, and the ship page body repeated "18 total (16 guest-accessible)" in three places (visible stat line, `stats_fallback` JSON, and the page.json fallback). Every source — Wikipedia ("16 / 14 passenger-accessible"), CruiseMapper ("16 decks / 9 with cabins"), and Royal Caribbean's own deck selector (Decks 3–16 = 14 accessible, confirmed via operator screenshots 2026-06-17) — agrees on **16 total**.

**Fix (2026-06-18):** Corrected to `decks_total: 16`, `decks_guest: 14`, and "16 total (14 guest-accessible)" in all three spots. Review dates bumped (last-reviewed + dateModified → 2026-06-18). Ship validator: no new errors introduced (2 pre-existing errors remain — see below — both unrelated missing-thumbnail images).

**Still open (separate, pre-existing, NOT this task):**
- `ships/rcl/anthem-of-the-seas.html` line ~674 lists `"crew": "1,500"`; the Anthem voyage-pack factcheck settled on **~1,300** (two sources agree). Worth correcting in a follow-up.
- Ship validator reports 2 errors: missing article thumbnails `/assets/articles/freedom-of-your-own-wake.jpg` and `/assets/articles/why-i-started-solo-cruising.jpg` (pre-existing; needs the images sourced).

---

## P1 — Two event-gated articles: write after 2026-07-11 (queued 2026-07-06)

Both were operator-approved picks from the July 7–13 planning pass; both are
**event-gated** — the facts they report did not exist on July 6. Any session on
or after **Saturday, July 12** should pick these up. Full discipline chain each:
research (retrieval only, zero training-data facts) → like-a-human during
writing → voice-audit greps → ICP-2 gates (ai-summary ≤250, dateModified ==
last-reviewed, 4 JSON-LD blocks) → BOTH Sophos gates (public:
`admin/social-publish/lib/gate.js`; private: `node
/home/user/open-claw-stuff/tools/sophos-article-gate.mjs <file>`) → card (JPG via
`admin/social-card-generator/generate.js --out`, convert to WebP at
`assets/articles/article-cards/<slug>.webp`) → commit with `Soli Deo Gloria.`

### 1. Mariner of the Seas oversold outcome
- Sailing embarks **July 11** (Galveston, 5-night Western Caribbean, Costa
  Maya/Cozumel). RCL offered fare refund + $200 OBC for balcony/oceanview →
  interior downgrades; volunteers notified within 8 days of embarkation.
- Write the outcome: did volunteers clear the oversell, any involuntary moves,
  what accepted guests report. Research anchors: Cruise Hive story 212433,
  cruise.blog coverage.
- Links back to `articles/oversold-cruise-volunteer-offers-2026.html` (the
  framework piece that promised this follow-up).

### 2. Legend of the Seas — what the first passengers found
- Ship returns to Civitavecchia **July 11** from the July 4 maiden voyage
  (La Spezia / Palma / Marseille / Barcelona per latest reports).
- The follow-up promised in the limits section of
  `articles/legend-of-the-seas-maiden-voyage-2026.html`: what opened on time,
  what didn't, crew week-one reports, from passenger accounts and live blogs
  (royalcaribbeanblog.com had pre-delivery access; check their onboard coverage).
- ✅ Tonnage conflict RESOLVED 2026-07-06: 248,663 GT is the registered figure
  shared by ALL THREE Icon-class ships (Icon, Star, Legend — same number);
  250,800 is a class-level design figure quoted for all three. The "Legend
  edges past her sisters" trade claim was measurement-margin noise (one report:
  4.5 mm longer). The maiden article was corrected same day with a visible
  correction note in its limits section. The follow-up article should use
  248,663 GT registered / shared-title framing. Our ship page
  (ships/rcl/legend-of-the-seas-icon-class-entering-service-in-2026.html,
  "250,000 GT") still needs a spec refresh — separate small task.

---

## P0 — Flickr "public feed" Attribution Audit (2026-04-12)

**Severity:** BLOCKING for affected ports — legal/attribution liability
**Scope:** 889 attribution JSON files across 124 ports (~31% of the port fleet)
**Triggered by:** Self-audit during glacier-bay and haines repair on 2026-04-11/12

### What the problem is

An earlier batch-sourcing session (around 2026-02-23) downloaded images via what it called the "Flickr public feed" and wrote attribution JSON files like:

```json
{
  "source": "https://www.flickr.com/photos/USER_ID/PHOTO_ID/",
  "license": "Flickr (verify license)",
  "author": "USERNAME",
  "source_type": "Flickr public feed",
  "downloaded": "2026-02-23"
}
```

The problem: **that "verify license" placeholder was never verified.** During the 2026-04-11/12 audit of glacier-bay and haines, WebFetch verification of three such files (two by `mrBunin`, one by `brucecarlson66`) showed the photos' schema.org `license` field pointing at Flickr's `flickrhelp.com "Using Flickr images shared by other members"` help page. **That URL is Flickr's All Rights Reserved fallback** — CC-licensed Flickr photos point at `creativecommons.org`. All three were All Rights Reserved, not Creative Commons.

It is very likely (but not certain) that many or most of the remaining 886 "Flickr public feed" files are also ARR. The earlier session may have assumed Flickr's public feed implied CC licensing, which is not the case — the default Flickr license is "All Rights Reserved."

### Scope numbers (verified 2026-04-12 via filesystem grep)

| Metric | Count |
|---|---:|
| attr.json files with `"Flickr public feed"` source type | **889** |
| attr.json files with `"Flickr (verify license)"` placeholder | **891** |
| Distinct ports affected | **124** of 397 |
| Distinct Flickr usernames observed (sample) | Dozens — photographer695, Laurence's Pictures, brewbooks, Alaskan Dude, A Guy Named Nyal, zug55, xiquinhosilva, tjguy98, paulocsfilho129, iorus and bela, gg2cool, fmzs2008, and many others |
| attr.json files with generic `"Wikimedia Commons"` boilerplate (different but related issue) | ~150+ |

The 124 affected ports span all regions: Alaska, Caribbean, Mediterranean, Baltic, Asia-Pacific, South America, Africa, Oceania. The full list is preserved at `/tmp/affected-ports.txt` (regenerate with the grep below if needed).

**Regenerate the list of affected ports:**
```bash
node admin/library.mjs mirrors --repo InTheWake
```

| priority | state | holder | task_id | title |
|----------|-------|--------|---------|-------|
| 0 | available | — | flickr-public-feed-attribution-audit-2026-04-12 | Flickr "public feed" Attribution Audit (2026-04-12) |
| 0 | available | — | gotchas-to-avoid-next-time | Gotchas to avoid next time |
| 0 | available | — | itw-flickr-arr-audit | Flickr ARR license audit — 889 attr / 124 ports |
| 0 | available | — | itw-gh-1707 | [Generator] Port Page Generator emits forbidden /ships.html links and ships incomplete <!-- FILL --> templates |
| 0 | available | — | itw-gh-1708 | [Generator / Standards Violation] Multiple generators continue to emit the forbidden /ships.html link |
| 0 | available | — | itw-gh-1709 | [Architecture/Technical Debt] Proliferation of 50+ one-off batch-fix-* and fix-* scripts indicates missing generator and pipeline coverage |
| 0 | available | — | itw-gh-1711 | [Architecture / Generator Gap] 61+ post-hoc batch-fix and fix scripts reveal systemic failures in generators, validators, and standards enforcement |
| 0 | available | — | itw-gh-1712 | [Generator] Gold-standard port page generator hardcodes forbidden navigation and lacks write-time validation enforcement |
| 0 | available | — | itw-gh-1755 | drink-calculator.html: CSP blocks GA4 and Umami analytics — both silently fail on this page |
| 0 | available | — | itw-gh-1758 | "Email My Results" button shows alert: "not configured in this demo" — placeholder live in production |
| 0 | available | — | ports-already-cleaned-2026-04-11-12 | Ports already cleaned (2026-04-11/12) |
| 0 | available | — | ports-cleaned-2026-05-13 | Ports cleaned (2026-05-13) |
| 0 | available | — | trusted-sources-proven-to-work-use-these-first | Trusted sources proven to work (use these first) |
| 1 | available | — | additional-template-bug-data-integrity-surfaces-2026-05-13-in-fl | Additional template-bug + data-integrity surfaces (2026-05-13, in-flight) |
| 1 | available | — | article-dependencies | Article dependencies |
| 1 | available | — | find-the-affected-copy | Find the affected copy |
| 1 | available | — | issue-e-ports-with-the-entire-weather-seasonal-section-missing | Issue E — Ports with the entire weather/seasonal section missing |
| 1 | available | — | issue-f-forbidden-phrases-inside-seasonal-guides-json | Issue F — Forbidden phrases inside `seasonal-guides.json` |
| 1 | available | — | issue-g-generic-currency-schema-entries-deferrable | Issue G — Generic currency-schema entries (deferrable) |
| 1 | available | — | issue-h-repeated-faq-blocks-panama-canal-observed | Issue H — Repeated FAQ blocks (panama-canal observed) |
| 1 | registered | — | itw-flickr-arr-remediation | Flickr non-compliant images: re-source port-by-port (103 gutted + 16 partial ports) — replace, do not blind-delete; dual-verify each new image (regex CC URL + Flickr license JSON); one commit per port |
| 1 | available | — | itw-hal-carousels | Deferred blocking HAL carousel errors |
| 1 | available | — | itw-port-everglades-resource | Port Everglades — 6 open image slots re-source |
| 1 | available | — | itw-port-miami-resource | Port Miami — 8 open image slots re-source |
| 1 | registered | — | itw-seo-disavow-upload | Upload admin/seo/disavow.txt to GSC disavow-links (getbets toxic backlink defense) |
| 1 | registered | — | itw-sydney-ns-unverifiable-license-images | Sydney NS — resolve 8 unverifiable-license port images (verify or delete per memory e8b73d89; stubs say 'CC BY-SA 4.0 or equivalent' with no source_url; ask operator before deleting; leave honest-broken refs if deleted) |
| 1 | available | — | legend-of-the-seas-what-the-first-passengers-found | Legend of the Seas — what the first passengers found |
| 1 | available | — | pattern-c-cruise-shore-excursion-suffix-template-bug | Pattern C — "Cruise"/"Shore Excursion" suffix template bug |
| 1 | available | — | pattern-d-half-filled-currency-is-used-in-answer | Pattern D — Half-filled "currency is used in" answer |
| 1 | available | — | two-event-gated-articles-write-after-2026-07-11 | Two event-gated articles: write after 2026-07-11 |
| 1 | available | — | two-paths | Two paths |
| 1 | available | — | what-s-actually-inconsistent | What's actually inconsistent |
| 2 | registered | — | itw-cruise-tipping-reverify-60d | Cruise tipping: 60-day rate re-verify cadence for all 15 lines |
| 2 | registered | — | itw-fleet-normalization-15-lines | Fleet normalization — 15 cruise lines; confirm operator sense of normalize; regenerate dashboard first |
| 2 | registered | — | itw-fom-migrate-legacy-files | FOM migrate legacy files: move ~235 scattered FOM images from assets/ships/ and ports/img/* into /assets/fom/{ships,ports,misc}/ per approved spec (memory 69ca600d) |
| 2 | registered | — | itw-fom-storage-structure | FOM storage decisions documented (operator approved 2026-07-11): /assets/fom/{ships,ports,misc}/, © Flickers of Majesty license, any first-party operator image, non-owned refs excluded. Spec: admin/FOM-STORAGE-SPEC.md · memory 69ca600d. Execution tracked separately: itw-fom-migrate-legacy-files, itw-fom-normalize-filenames, itw-fom-backfill-sidecars, itw-fom-update-html-srcs |
| 2 | registered | — | itw-image-reuse-cleanup | Image-reuse cleanup from scan-image-reuse + scan-image-recrops findings: 6 CRITICAL + 20 ERROR md5-identical reuses and 3 CRITICAL + 12 ERROR visual recrops — sourced unique replacements per SHIP_STANDARDIZATION_PLAN_V3 §7.6 or empty slot + coverage-gap |
| 2 | registered | — | itw-margaritaville-line-buildout | Margaritaville at Sea line buildout: ship page Islander (#2004) + venue pages (#2005) — next content gap after generator audit session |
| 2 | registered | — | itw-placeholder-ship-photography | Placeholder ship photography — 26 ships (Carnival 2, Celebrity 5, HAL 19); Mac-side Wikimedia; reconcile with itw-phase-6-source-limited-ships-followup |
| 2 | registered | — | itw-seo-budget-calc-eat | SEO: drink/budget calculator E-A-T and meta differentiation pass |
| 2 | registered | — | itw-seo-three-cluster-verifications | SEO verifications: RBC dynamic pricing, Costa Maya dive operator rates, Cozumel RBC opening date, Lelepa year |
| 2 | registered | — | itw-siteaudit-93-remediation | Site-audit 93/100 remediation (external SEO scan 2026-05-07/08): remaining findings — alt text, render-blocking, dup meta, short titles, low-content pages, misspelling pass |
| 2 | registered | — | itw-voyage-packs-paywall-platform | Voyage-pack paywall — pick platform (Gumroad vs LemonSqueezy vs Stripe+CFWorker+R2) and wire live checkout |
| 2 | registered | — | itw-voyage-pwa-integration | Voyage PWA integration — write spec from approved design (amendments settled); 3-phase rollout Bliss time-critical; next: spec → operator review → writing-plans |
| 3 | registered | — | anthem-of-the-seas-deck-plan-layout-seo-article | Anthem of the Seas deck plan layout SEO article — where-is-everything guide (North Star 15–16, SeaPlex 15–16, Two70 5–6, Windjammer/Coastal Kitchen 14, three MDRs; ~2,400/mo keyword cluster) |
| 3 | registered | — | freedom-class-gt-corpus-propagation | Freedom-class GT corpus propagation — Liberty 155,889 GT not flat 156,271 atlas default |
| 3 | registered | — | itw-aggregator-hang-fix | Fix aggregate-ship-validation.js hang risk — full-fleet spawnSync runs both validators per page (~290 ships) |
| 3 | registered | — | itw-firenze-venezia-wrong-hull-data | carnival-firenze (and likely carnival-venezia): fact-block carries Spirit-class data that does not match actual hull (former Costa Firenze) — needs tier-1 Equasis IMO 9787475 sourcing + fact-block regeneration |
| 3 | registered | — | itw-fom-backfill-sidecars | FOM backfill sidecars: write mandatory .webp.attr.json for ~153 images missing sidecars; license © Flickers of Majesty — all rights reserved; append rows to attributions/fom.csv |
| 3 | registered | — | itw-fom-chat-image-intake | FOM chat-image intake workflow: when operator supplies an image via chat, save as <slug>-FOM-NN.webp with 'Photo ©' FOM attribution + sidecar + /attributions/fom.csv row; confirm entity/subject, never reuse NN, never store under generic/CC name (operator directive 2026-07-11). |
| 3 | registered | — | itw-fom-ip-protection | FOM IP protection: (1) US Copyright Office group registration of FOM catalog (GRPPH/GRUPH, highest-ROI legal lever) [confirm w/ counsel]; (2) /licensing/ page + '© Flickers of Majesty' near each image; (3) cap web display ~1600px, masters offline; (4) visible watermark + preserve EXIF/IPTC; (5) Pixsy/ImageRights monitoring + DMCA. Skip right-click-disable theater. |
| 3 | registered | — | itw-fom-normalize-filenames | FOM normalize filenames: eliminate -FOM- - N spaced pattern and jpeg dupes; canonical <entity-slug>-FOM-NN.webp webp-only |
| 3 | registered | — | itw-fom-update-html-srcs | FOM update HTML src paths: after migration, update ship/port page img src and gallery refs to /assets/fom/ paths; verify credits section still correct |
| 3 | registered | — | itw-grand-pacific-logbook-fix | Fix grand-pacific.html logbook inconsistency: overview says complimentary MDR but logbook describes $29-39 Pan-Asian specialty (mis-pasted template) |
| 3 | registered | — | itw-gsc-great-tides-waterpark-voyage-pack-audit | NCL GSC / Great Tides Waterpark voyage-pack audit — grep packs for stale GSC/CocoCay/Norwegian Aqua content; apply Sept 2026 hedges |
| 3 | available | — | itw-legend-maiden-followup | Legend maiden voyage follow-up article |
| 3 | available | — | itw-legend-tonnage-spec | Legend ship page tonnage spec refresh |
| 3 | available | — | itw-mariner-oversold | Outcome article — Mariner oversold sailing |
| 3 | registered | — | itw-phase-6-source-limited-ships-followup | Re-check Commons for 13 source-limited ships (Carnival Firenze 5/8, Star Princess 5/8, Explora II 6/8, Silver Origin 7/8, Seven Seas Grandeur 7/8, Brilliant Lady 7/8, Celebrity Xcel/Xperience/Compass/Seeker, Carnival Encounter) — currently Commons has 0-2 photos for each, retry when uploads expand |
| 3 | registered | — | itw-reapply-2d36ffe8-image-honesty-orphan-sweep | Re-apply orphaned commit 2d36ffe8 image-honesty fixes + attributions.csv orphan sweep |
| 3 | registered | — | itw-seo-chinchorro-contrarian | SEO: Banco Chinchorro contrarian piece — almost never worth booking on a cruise day |
| 3 | registered | — | itw-seo-costa-maya-dive-operators | SEO: Costa Maya dive operator comparison — Doctor Dive, Alux, Pepe Dive, Mar Adentro; pier proximity; family-integration angle |
| 3 | registered | — | itw-seo-ctr-30day-2026-06 | SEO: 30-day CTR monitoring pass — June 2026 title/meta winners |
| 3 | registered | — | itw-seo-features-by-ship | SEO: features-by-ship content differentiation (avoid template CTR collapse) |
| 3 | registered | — | itw-seo-mystery-island-cheatsheet | SEO: Mystery Island cheat-sheet companion to /ports/mystery-island.html (pairs with itw-seo-mystery-island-pattern) |
| 3 | registered | — | itw-seo-mystery-island-pattern | SEO: Mystery Island port page pattern — apply Sovereign-style SERP differentiation |
| 3 | registered | — | itw-seo-rbc-day-pass-worth-it | SEO: Is the Royal Beach Club day pass worth it? — stewardship-math piece (Drink Calculator voice) |
| 3 | registered | — | itw-seo-rbc-lelepa-living-doc | SEO: Royal Beach Club Lelepa — What We Know (living document; 2027 vs 2028 opening conflict) |
| 3 | registered | — | itw-seo-rbc-vs-cococay | SEO: Royal Beach Club vs CocoCay explainer — RBC paid excursion, CocoCay included |
| 3 | registered | — | itw-seo-south-pacific-primer | SEO: South Pacific cruise primer for first-timers — itinerary lengths, departure ports, seasons |
| 3 | registered | — | itw-ship-page-error-sweep | Ship page per-page error sweep: after systemic articles/index.json thumbnail fix, audit remaining ship-specific validate-ship-page.sh failures |
| 3 | registered | — | itw-tools-zero-pageerrors-gate | Tools: enforce zero JS pageerrors on every tool page (regression gate) |
| 3 | registered | — | itw-voyage-packs-refund-window | Voyage-pack refund window mismatch: landing/PDF-README say 14d, W12 playbook line 81 says 30d — reconcile |
| 3 | available | — | port-page-normalization-phase-1-complete-phases-2-5-pending | Port Page Normalization — Phase 1 COMPLETE, Phases 2-5 PENDING |
| 3 | registered | — | utopia-of-the-seas-gt-cascade | Utopia of the Seas GT cascade — propagate Icon-class 248,663 IMO canon (not 250,800 marketing) |
| 4 | registered | — | itw-comparison-swaps-review | Review 22 Phase-3.1 numeric swaps flagged by audit-internal-consistency-comparisons.cjs but NOT reverted (4 unambiguous cases reverted 2026-07-11) |
| 4 | registered | — | itw-cruise-tipping-costa-half-rate-article | Cruise tipping: article prose parity check for Costa half-rate child policy |
| 4 | registered | — | itw-dashboard-regen-post-3-2c | Regenerate ship-validation-dashboard.json post Phase 3.2c — baseline dated 2026-05-12; blocked on aggregator fix |
| 4 | available | — | itw-gh-1615 | [site-wide] 37 pages have truncated footers — missing About/Support/Accessibility/Reach Family links vs standard footer |
| 4 | available | — | itw-gh-1619 | [site-wide] 11 pages have missing OG images (social preview 404s) — including 6 cruise line pages and 2 article pages |
| 4 | available | — | itw-gh-1624 | [Port Pages] 47 pages have duplicate HTML IDs — accessibility skip-link broken, WCAG 2.1 AA violation |
| 4 | available | — | itw-gh-1627 | [terms.html][privacy.html] terms.html has duplicate stylesheet (one a 404 relative path); privacy.html has V1.Beta badge in footer copyright line; both pages 6+ months stale |
| 4 | available | — | itw-gh-1630 | 23 article pages missing dropdown.js — hamburger nav non-functional |
| 4 | available | — | itw-gh-1632 | 342 pages load unversioned styles.css — cache busting broken, stale CSS served to repeat visitors |
| 4 | available | — | itw-gh-1633 | Nav inconsistency: /planning.html in Planning dropdown on ship pages only — missing from all other page types |
| 4 | available | — | itw-gh-1634 | in-app-browser-escape.js missing from 455 pages — Facebook/Instagram in-app browser escape not shown |
| 4 | available | — | itw-gh-1651 | color-scheme inconsistency: article pages declare 'light dark', most others say 'light' or nothing |
| 4 | available | — | itw-gh-1658 | planning.html: embedded port dataset last_updated is 2025-10-20 — 7 months stale |
| 4 | available | — | itw-gh-1661 | [Structured Data] 152 ship pages have Review schema with no ratingValue — incomplete JSON-LD |
| 4 | available | — | itw-gh-1669 | [Articles] 17 of 24 articles use generic og:image — social share cards all look identical |
| 4 | available | — | itw-gh-1671 | ships.html: 4 cruise lines (Celebrity, HAL, Princess, Silversea) not linked — 113 ship pages undiscoverable |
| 4 | available | — | itw-gh-1673 | tools/ship-size-atlas.html: missing dropdown.js — nav dropdowns broken |
| 4 | available | — | itw-gh-1675 | 50 ship pages (Celebrity + HAL fleets): meta description = page title — zero SEO value |
| 4 | available | — | itw-gh-1677 | travel.html: og:title "Travel Tips" does not match actual title "Top 20 Cruise Questions Answered" |
| 4 | available | — | itw-gh-1678 | packing.html: noindex redirect listed in sitemap.xml — contradictory signals |
| 4 | available | — | itw-gh-1679 | 6 pages: og:image references files that do not exist — broken social share thumbnails |
| 4 | available | — | itw-gh-1682 | precache-manifest.json: 4 months stale, only 20/1282 pages, version mismatch, missing drink-calculatorv2.html |
| 4 | available | — | itw-gh-1684 | GDPR: ConsentManager present on 10/1239 pages — GA4 fires without consent on 1,229 pages |
| 4 | available | — | itw-gh-1687 | affiliate-disclosure.html: missing dropdown.js — mobile nav non-functional on trust page |
| 4 | available | — | itw-gh-1688 | 3 important pages missing from sitemap.xml: reaching-someone-at-sea, voyage-packs, data |
| 4 | available | — | itw-gh-1689 | ships/rooms.html: version (v2.201) in <title> tag — shows in Google SERPs and social shares |
| 4 | available | — | itw-gh-1690 | 6 Princess ship pages: broken img src /assets/ships/placeholder-ship.svg — file missing |
| 4 | available | — | itw-gh-1706 | [Architecture/Generator] Severe duplication across venue/page generators enables ongoing standards violations |
| 4 | available | — | itw-gh-1718 | search.html: hardcoded counts stale — claims '738 pages / 171 ships / 333 ports' but index has 920 entries / 298 ships / 388 ports; fleet restaurant subdirs (198 pages) not indexed at all |
| 4 | available | — | itw-gh-1720 | No custom 404.html — broken internal links deliver raw Netlify 404 with no site navigation |
| 4 | available | — | itw-gh-1721 | _headers: cache rules for /assets/*.css and /assets/*.js don't cover subdirectory assets (assets/css/, assets/js/) |
| 4 | available | — | itw-gh-1722 | _headers: missing Content-Security-Policy and HSTS; X-XSS-Protection is deprecated |
| 4 | available | — | itw-gh-1723 | og:locale inconsistent — ships have it (293/312), ports/restaurants/cruise-lines have none (0/894 pages) |
| 4 | available | — | itw-gh-1724 | 145 port pages: Swiper gallery JS missing — photo galleries broken |
| 4 | available | — | itw-gh-1754 | 4 restaurant pages: duplicate H1 — one hidden via display:none (gray-hat SEO risk) |
| 4 | available | — | itw-gh-1756 | 6 indexed pages missing GA4 analytics — traffic invisible in dashboard |
| 4 | available | — | itw-gh-1757 | 21 ship pages: broken internal anchor links (#video-highlights, #dining-card, #content) |
| 4 | available | — | itw-gh-1759 | ships-dynamic.js references /assets/ship-placeholder.jpg — file missing, broken image fallback |
| 4 | available | — | itw-gh-1760 | security.js: SecureStorage uses plain localStorage with no encryption — misleading name and false security |
| 4 | available | — | itw-gh-1767 | 21 port pages + offline.html: og:url is empty string — Open Graph broken |
| 4 | available | — | itw-gh-1768 | offline.html: JSON-LD url contains local filesystem path leaked into production |
| 4 | available | — | itw-gh-1769 | cruise-lines/virgin.html: SW registered with absolute URL + stale version v3.006 (current: v14.3.0) |
| 4 | available | — | itw-gh-1770 | disability-at-sea.html: zero service worker registration — page not cached offline |
| 4 | available | — | itw-gh-1779 | fix-port-remaining.cjs — older "remaining 1-error" port bulk repair (pre-DOM regex surgery + hardcoded deadPages list + heavy inline hero/credit injection + direct writes, no standards) |
| 4 | available | — | itw-gh-1780 | batch-fix-port-structure.cjs — major structural batch repair (170+ hardcoded ports DB + multiple sidebar template injections + validator-calling mode + attr.json creation + direct writes) |
| 4 | available | — | itw-gh-1781 | normalize-port-pages-v2.cjs — explicit validator-mirroring section reordering tool (EXPECTED_MAIN_ORDER + SECTION_PATTERNS duplication + complex DOM walking + direct writes) |
| 4 | available | — | itw-gh-1782 | [Ship Pages] Every ship page (290/290) links to forbidden /ships.html (1,029 occurrences) |
| 4 | available | — | itw-gh-1783 | [Ship Pages] 58% of ship pages (169/290) contain hotlinked external images (178 total) |
| 4 | available | — | itw-gh-1785 | [Ship Pages] First Look carousel fails to render (empty) on nearly all ship pages despite HTML structure + JS init present |
| 4 | available | — | itw-gh-1786 | [Ship Pages] Canonical validator produces systematic false positives (og:url / description reported missing when present in 100% of sources) |
| 4 | available | — | itw-gh-1787 | [Standards] SHIP_PAGE_CHECKLIST_v3.010.md itself hard-codes the forbidden /ships.html pattern (root cause of universal violation) |
| 4 | available | — | itw-gh-1788 | [Ship Pages] 64% of ship pages (185/290) contain placeholder/TBD/TODO/lorem language |
| 4 | available | — | itw-gh-1789 | [Ship Pages] 29% of ship pages (84/290) contain relative URLs that do not start with / or https |
| 4 | available | — | itw-gh-1791 | [Ship Pages] 65% of ship pages (188/290) still reference ICP-Lite instead of ICP-2 |
| 4 | available | — | itw-gh-1793 | [Ship Pages] 78% of ship pages (225/290) declare both Vehicle and legacy schema types (Cruise/Thing) in the same JSON-LD |
| 4 | available | — | itw-gh-1794 | [Ship Pages] 95% of ship pages with dining sections (276/290) are missing their dining-hero image |
| 4 | available | — | itw-gh-1795 | [Ship Pages] 71% of ship pages (206/290) still use generic ship-map.png placeholder for deck plans |
| 4 | available | — | itw-gh-1796 | [Ship Pages] 12% of ship pages (35/290) have swiper carousels with HTML but no JavaScript initialization at all |
| 4 | available | — | itw-gh-1797 | [Ship Pages] 31% of ship pages (90/290) are missing the Logbook / 'Tales From the Wake' section entirely |
| 4 | available | — | itw-gh-1798 | [Ship Pages] 29% of ship pages (83/290) have very low total image counts (<8 <img> tags) |
| 4 | available | — | itw-gh-1799 | [Ship Pages] 85% of ship pages (247/290) appear to be missing the 'Who this ship is for' / audience targeting section |
| 4 | available | — | itw-gh-1800 | [Ship Pages] Validator reports 'Deck Plans section MISSING' on carnival-horizon.html (not seen on previous ships) |
| 4 | available | — | itw-gh-1829 | [Technical] Cloudflare R2 Migration: HTML content still referencing local assets |
| 4 | registered | — | itw-phase-6-tbn-ships-validator-exemption | Skip few_images validator for ~45 TBN/unbuilt/future ships until they enter service — RCL Icon-class TBN 2027/2028, Oasis TBN 2028, Quantum Ultra TBN 2028/2029, Star-class TBN 2028, Celebrity Edge-unnamed/Nirvana/River-class, Carnival Project Ace 1/2/3, Carnival Tropicale 2028, MSC World Asia (Nov 2026 debut), Explora III-VI (2026-2028), Legend of the Seas 2026 Icon-class. Consider validator rule tweak: exempt ships with entered_service > current-date from few_images. |
| 4 | registered | — | itw-seo-drink-calc-rbc-model | Enhancement: Drink Calculator — optional RBC day-pass as partial drink-day substitute |
| 4 | registered | — | itw-seo-getbets-monitor | SEO: ongoing getbets-string monitor across production files |
| 4 | registered | — | itw-seo-prestige-title-sync | SEO: Prestige ship page title/meta sync with differentiation playbook |
| 4 | registered | — | itw-seo-rbc-paradise-island-review | SEO: Royal Beach Club Paradise Island honest review |
| 4 | registered | — | itw-seo-sovereign-hybrid | SEO: Sovereign hybrid title pattern — scale 5.11× SERP-context approach fleet-wide |
| 4 | available | — | itw-source-real-photography | Source-real-photography backlog — 39 ship pages |
| 4 | registered | — | itw-venue-logbook-quality | Venue logbook quality pass: venue-specific JSON-LD review names (not Guest Experience Summary), Pro Tips, warm-honest voice per 77e4d283 standard |
| 4 | registered | — | itw-voyage-packs-dedupe-sisters-card | voyage-packs.html: duplicate Sisters at Sea card (lines 313-328 and 330-345 are the same product) |
| 4 | registered | — | itw-voyage-packs-missing-pdfs | Voyage packs v0.1.5 MSC Seaside + v0.1.6 NCL Luna: markdown-only, missing PDFs — build script needs updating (see README §L) |
| 4 | registered | — | itw-voyage-pwa-icons | Voyage PWA — 14 identical icons follow-up |
| 4 | registered | — | regenerate-ship-size-chart-images | Regenerate ship size chart images after GT/stateroom canon corrections |
| 4 | registered | — | royal-caribbean-vs-msc-html-samba-grill-fix | royal-caribbean-vs-msc.html Samba Grill fix |
| 4 | registered | — | uniform-if-you-re-booked-decision-card | Uniform if-you're-re-booked decision card across disruption articles |
| 5 | available | — | 1-unfinished-carnival-cruise-line-expansion-150-200-new-ports | 1: ❌ UNFINISHED - Carnival Cruise Line expansion (150-200 new ports) |
| 5 | available | — | 10-unfinished-add-video-data-for-ships-without-videos | 10: ❌ UNFINISHED - Add video data for ships without videos |
| 5 | available | — | 11-unfinished-cross-linking-improvements | 11: ❌ UNFINISHED - Cross-linking improvements |
| 5 | available | — | 2-ports-missed-by-the-validator-sweep-runtime-hiccups-re-run-on- | 2 ports missed by the validator sweep (runtime hiccups) — re-run on those after the weather rule is sorted |
| 5 | available | — | 2-unfinished-virgin-voyages-expansion-15-20-unique-ports | 2: ❌ UNFINISHED - Virgin Voyages expansion (15-20 unique ports) |
| 5 | available | — | 3-unfinished-multi-cruise-line-tracker-enhancement | 3: ❌ UNFINISHED - Multi-cruise-line tracker enhancement |
| 5 | available | — | 3-unfinished-princess-cruises-expansion | 3: ❌ UNFINISHED - Princess Cruises expansion |
| 5 | available | — | 4-unfinished-asia-expansion-batch-10-15-ports | 4: ❌ UNFINISHED - Asia expansion batch (10-15 ports) |
| 5 | available | — | 4-unfinished-norwegian-cruise-line-expansion | 4: ❌ UNFINISHED - Norwegian Cruise Line expansion |
| 5 | available | — | 5-unfinished-australia-south-pacific-batch-15-20-ports | 5: ❌ UNFINISHED - Australia & South Pacific batch (15-20 ports) |
| 5 | available | — | 5-unfinished-celebrity-cruises-expansion | 5: ❌ UNFINISHED - Celebrity Cruises expansion |
| 5 | available | — | 50-ships-flagged-by-js-runtime-data-cascade-fully-failed-per-the | 50 ships — flagged by `js:runtime_data/cascade_fully_failed` per the same dashboard. Top single failure category by coun |
| 5 | available | — | 7-unfinished-middle-east-port-batch-4-ports | 7: ❌ UNFINISHED - Middle East port batch (4 ports) |
| 5 | available | — | 8-unfinished-caribbean-completion-batch-8-10-ports | 8: ❌ UNFINISHED - Caribbean completion batch (8-10 ports) |
| 5 | available | — | 9-unfinished-icp-lite-itw-lite-content-rollout | 9: ❌ UNFINISHED - ICP-Lite & ITW-Lite content rollout |
| 5 | available | — | aarhus-denmark | aarhus (Denmark) |
| 5 | available | — | abidjan-ivory-coast | abidjan (Ivory Coast) |
| 5 | available | — | accessibility-barriers-cobblestones-steep-hills-tender-only-limi | Accessibility barriers — — cobblestones, steep hills, tender-only limitations, heat + mobility dangers |
| 5 | available | — | add-affiliate-article-links-to-3-remaining-port-pages-beijing-fa | Add affiliate article links to 3 remaining port pages (beijing, falmouth-jamaica, kyoto) |
| 5 | available | — | add-affiliate-links-to-packing-lists-html | Add affiliate links to `/packing-lists.html` |
| 5 | available | — | add-cabin-size-amenity-quick-facts-where-missing | Add cabin size/amenity quick facts where missing |
| 5 | available | — | add-crew-count-and-total-deck-count-if-missing | Add crew count and total deck count if missing |
| 5 | available | — | add-dock-location-summary-to-port-page-intro | Add dock location summary to port page intro |
| 5 | available | — | add-last-verified-date-display-per-ship | Add "last verified" date display per ship |
| 5 | available | — | add-missing-grid-2-layout-30-ships-mostly-carnival | Add missing grid-2 layout (~30 ships, mostly Carnival) |
| 5 | available | — | add-missing-whimsical-units-containers-181-ships | Add missing whimsical units containers (~181 ships) |
| 5 | available | — | add-ship-detail-drawer-modal | Add ship detail drawer/modal |
| 5 | available | — | add-size-map-scatter-chart-view-gt-vs-passengers | Add "Size Map" scatter chart view (GT vs Passengers) |
| 5 | available | — | add-tech-recommendations-to-internet-at-sea-html | Add tech recommendations to `/internet-at-sea.html` |
| 5 | available | — | add-this-port-is-tender-only-cancellations-are-more-common-in-ro | Add "This port is tender-only — cancellations are more common in rough weather" notice to all tender ports |
| 5 | available | — | add-timing-transport-admission-context | Add timing/transport/admission context |
| 5 | available | — | add-to-site-navigation-tools-dropdown | Add to site navigation (Tools dropdown) |
| 5 | available | — | add-top-30-largest-ships-spotlight-module | Add "Top 30 Largest Ships" spotlight module |
| 5 | available | — | add-weather-section-to-remaining-22-ports | Add weather section to remaining 22 ports |
| 5 | available | — | add-widget-section-to-ship-page-template | Add widget section to ship page template |
| 5 | available | — | additional-ships-across-non-rcl-lines | + additional ships across non-RCL lines |
| 5 | available | — | additional-themed-articles | Additional Themed Articles |
| 5 | available | — | affiliate-content-phase-3-enhance-existing | Affiliate Content — Phase 3 (Enhance Existing) |
| 5 | available | — | affiliate-link-infrastructure | Affiliate Link Infrastructure |
| 5 | available | — | alaska-cruise-port-gaps | Alaska Cruise Port Gaps |
| 5 | available | — | align-section-order-first-look-dining-videos-deck-plans-tracker- | Align section order: First Look → Dining → Videos → Deck Plans/Tracker → FAQ |
| 5 | available | — | allure-of-the-seas | Allure of the Seas |
| 5 | available | — | anthem-of-the-seas | Anthem of the Seas |
| 5 | available | — | antsiranana-madagascar | antsiranana (Madagascar) |
| 5 | available | — | approach-for-repairs | Approach for repairs |
| 5 | available | — | arica-chile | arica (Chile) |
| 5 | available | — | articles-caribbean-cruise-trends-2026-html-needs-a-hero-thumbnai | `/articles/caribbean-cruise-trends-2026.html` — — needs a hero/thumbnail (suggest: `/assets/articles/caribbean-cruise-tr |
| 5 | available | — | articles-cruise-cabin-organization-html-og-image-references-asse | `/articles/cruise-cabin-organization.html` — — `og:image` references `/assets/articles/cabin-organization-hero.jpg?v=3.0 |
| 5 | available | — | articles-cruise-duck-tradition-html-og-image-references-assets-s | `/articles/cruise-duck-tradition.html` — — `og:image` references `/assets/social/cruise-ducks-hero.jpg`; not on disk. |
| 5 | available | — | articles-cruise-tech-photography-guide-html-og-image-references- | `/articles/cruise-tech-photography-guide.html` — — `og:image` references `/assets/articles/cruise-tech-hero.jpg?v=3.010. |
| 5 | available | — | articles-to-write-pastoral-content | Articles to Write — Pastoral Content |
| 5 | available | — | astoria-oregon | astoria (Oregon) |
| 5 | available | — | audit-venues-json-for-dish-level-data-availability | Audit `venues.json` for dish-level data availability |
| 5 | available | — | audit-which-25-ships-lack-exception-files-create-stubs | Audit which 25 ships lack exception files, create stubs |
| 5 | available | — | broken-article-reference-solo-articles-alaska-cruise-first-timer | Broken article reference: `/solo/articles/alaska-cruise-first-timer.html` (Discovered 2026-05-08) |
| 5 | available | — | can-template-from-the-273-ports-that-already-have-full-noscript | Can template from the 273 ports that already have full noscript |
| 5 | available | — | carnival-fleet-index-enhancement | Carnival Fleet Index Enhancement |
| 5 | available | — | cascade-fully-failed-51-ships-phase-3-6-investigation-first | cascade_fully_failed: 51 ships — (Phase 3.6 — investigation-first) |
| 5 | available | — | catalina-island-california-verify-if-covered-by-los-angeles-html | catalina-island (California) — verify if covered by los-angeles.html |
| 5 | available | — | celebration-key-carnival-s-new-private-destination-in-grand-baha | Celebration Key — — Carnival's new private destination in Grand Bahama, opening 2025–2026. Mentioned in the 2026 Caribbe |
| 5 | available | — | class-cards-need-images | Class cards need images |
| 5 | available | — | coming-soon-pages | "Coming Soon" Pages |
| 5 | available | — | community-sourced-add-a-simple-did-your-ship-actually-stop-here- | Community-sourced — — Add a simple "Did your ship actually stop here?" yes/no on each port page. Aggregate over time |
| 5 | available | — | competitor-analysis-recommendations-deduplicated | Competitor Analysis Recommendations — Deduplicated |
| 5 | available | — | consider-a-tools-port-reliability-html-dashboard-showing-all-por | Consider a `/tools/port-reliability.html` dashboard showing all ports ranked by estimated reliability |
| 5 | available | — | coquimbo-chile | coquimbo (Chile) |
| 5 | available | — | crawled-not-indexed-content-quality-plan | Crawled-Not-Indexed: Content Quality Plan |
| 5 | available | — | create-a-seasonal-reliability-calendar-per-port-e-g-bay-of-islan | Create a seasonal reliability calendar per port (e.g., "Bay of Islands: Jan-Mar reliable, Apr-May weather-dependent, Jun |
| 5 | available | — | create-assets-data-menu-search-index-json-inverted-index | Create `/assets/data/menu-search-index.json` (inverted index) |
| 5 | available | — | create-assets-js-dining-search-js | Create `/assets/js/dining-search.js` |
| 5 | available | — | create-automated-coverage-report | Create automated coverage report |
| 5 | available | — | create-ship-page-widget-html-template | Create ship page widget HTML template |
| 5 | available | — | create-tools-dining-search-html-standalone-page | Create `/tools/dining-search.html` (standalone page) |
| 5 | available | — | cruise-forum-scraping-cruisecritic-reddit-r-cruise-facebook-crui | Cruise forum scraping — — CruiseCritic, Reddit r/cruise, Facebook cruise groups have years of "our port was cancelled" p |
| 5 | available | — | cruise-line-parity-gaps | Cruise Line Parity Gaps |
| 5 | available | — | cruise-line-schedule-changes-monitor-cruise-line-websites-for-it | Cruise line schedule changes — — Monitor cruise line websites for itinerary changes. When "Costa Maya" disappears from a |
| 5 | available | — | cruise-lines-need-images | Cruise lines need images |
| 5 | available | — | cruise-tipping-calculator-known-defects | Cruise Tipping Calculator — Known Defects |
| 5 | available | — | css-consolidation-inline-style-reduction | CSS Consolidation — Inline Style Reduction |
| 5 | available | — | current-330-ports-have-enable-javascript-to-view-map-placeholder | Current: 330 ports have "Enable JavaScript to view map" placeholder |
| 5 | available | — | data-quality | Data Quality |
| 5 | available | — | data-source-the-weather-widget-json-data-files-or-research-per-p | Data source: the weather widget JSON data files or research per port |
| 5 | available | — | decide-canonical-page-grid-definition-styles-css-vs-inline | Decide canonical `.page-grid` definition (styles.css vs inline) |
| 5 | available | — | decision-needed-generate-from-data-programmatically-or-hand-writ | Decision needed: generate from data programmatically or hand-write? |
| 5 | available | — | decision-needed-which-option | Decision needed: which option? |
| 5 | available | — | demographic-articles-senior-travel-neurodiversity-burn-survivors | Demographic articles (senior travel, neurodiversity, burn survivors) |
| 5 | available | — | design-a-port-reliability-indicator-for-each-port-page-e-g-relia | Design a "Port Reliability" indicator for each port page (e.g., "Reliability: High / Moderate / Weather-Dependent") |
| 5 | available | — | design-ship-page-widget-compact-embedded-version | Design ship page widget (compact embedded version) |
| 5 | available | — | dining-hero-images | Dining Hero Images |
| 5 | available | — | diy-vs-excursion-comparison-expansion | DIY vs. Excursion Comparison Expansion |
| 5 | available | — | dutch-harbor-html-aleutian-islands-deadliest-catch-fame | `dutch-harbor.html` — Aleutian Islands; Deadliest Catch fame |
| 5 | available | — | eden-australia | eden (Australia) |
| 5 | available | — | effort-1-2-hours-removes-the-recurring-no-verify-papercut-that-b | Effort: — 1–2 hours. Removes the recurring `--no-verify` papercut that blocked PR #1466 commits. |
| 5 | available | — | effort-unknown-until-root-caused-could-be-a-one-line-fix-affecti | Effort: — unknown until root-caused. Could be a one-line fix affecting all 50, or 50 individual data-shape repairs. |
| 5 | available | — | enchantment-of-the-seas-legend-of-the-seas-1995-built-slug-suffi | `enchantment-of-the-seas` + `legend-of-the-seas-1995-built` — slug-suffix rename plan |
| 5 | available | — | ensure-dock-locations-clearly-marked-on-all-port-maps | Ensure dock locations clearly marked on all port maps |
| 5 | available | — | ensure-offline-pwa-support | Ensure offline/PWA support |
| 5 | available | — | ensure-refurbishment-dates-are-current | Ensure refurbishment dates are current |
| 5 | available | — | expand-diy-vs-excursion-comparisons-from-38-to-top-50-ports | Expand DIY vs. excursion comparisons from 38 to top 50 ports |
| 5 | available | — | expand-or-create-comprehensive-solo-cruising-html | Expand or create comprehensive-solo-cruising.html |
| 5 | available | — | expand-real-talk-honest-assessments-to-75-ports-50-ports-as-of-2 | Expand "Real Talk" honest assessments to 75+ ports (50 ports as of 2026-05-12 spot-check; was 46 at 2026-03-02; gap to t |
| 5 | available | — | extract-core-checker-logic-into-reusable-assets-js-stateroom-wid | Extract core checker logic into reusable `/assets/js/stateroom-widget.js` |
| 5 | available | — | family-situation-articles-infertility-grief-adoption-homeschool | Family situation articles (infertility grief, adoption, homeschool) |
| 5 | available | — | faq-too-short-186-ships-per-2026-03-02-validator-no-longer-surfa | FAQ too short (186 ships per 2026-03-02; validator no longer surfaces by name) |
| 5 | available | — | faq-trim-promotional-drift-cleanup-first-person-maximum-voice-to | FAQ trim, promotional drift cleanup, first_person_maximum: voice-touch passes (use `voice-audit` skill); 178+ ports affe |
| 5 | available | — | few-images-230-ships-refreshed-2026-05-13-up-from-158-right-fix- | few_images: 230 ships — (refreshed 2026-05-13; up from 158; right fix is sourcing replacement images, not relaxing the t |
| 5 | available | — | fix-author-avatar-to-circle-remove-inline-border-radius-override | Fix author avatar to circle (remove inline border-radius overrides) |
| 5 | available | — | force-data-refresh-and-get-cache-stats-message-handlers | `FORCE_DATA_REFRESH` and `GET_CACHE_STATS` message handlers |
| 5 | available | — | format-ship-excursion-x-diy-y-you-save-z | Format: "Ship excursion: $X | DIY: $Y | You save: $Z" |
| 5 | available | — | future-cta-for-booking | (Future) CTA for booking |
| 5 | available | — | generic-review-text-208-ships-per-2026-03-02-validator-no-longer | Generic review text (208 ships per 2026-03-02; validator no longer surfaces a rule by that name — needs human content-re |
| 5 | available | — | google-search-console-audit-2026-03-27 | Google Search Console Audit (2026-03-27) |
| 5 | available | — | green-lane-ai-executes-autonomously | GREEN LANE — AI Executes Autonomously |
| 5 | available | — | half-moon-cay-holland-america-carnival-private-destination-in-th | Half Moon Cay — — Holland America / Carnival private destination in the Bahamas. Mentioned in the 2026 Caribbean trends  |
| 5 | available | — | haugesund-norway | haugesund (Norway) |
| 5 | available | — | healing-relationships-at-sea-3-000-words-not-created | Healing Relationships at Sea (~3,000 words) — not created |
| 5 | available | — | hp-athens-piraeus | hp-athens (Piraeus) |
| 5 | available | — | hp-dover-london-gateway | hp-dover (London gateway) |
| 5 | available | — | hp-dubai | hp-dubai |
| 5 | available | — | hp-hamburg | hp-hamburg |
| 5 | available | — | hp-honolulu-have-html-need-tracker-entry | hp-honolulu (have HTML, need tracker entry) |
| 5 | available | — | hp-istanbul | hp-istanbul |
| 5 | available | — | hp-le-havre-paris-gateway | hp-le-havre (Paris gateway) |
| 5 | available | — | hp-lisbon | hp-lisbon |
| 5 | available | — | hp-livorno-florence-pisa-gateway | hp-livorno (Florence/Pisa gateway) |
| 5 | available | — | hp-mumbai | hp-mumbai |
| 5 | available | — | hp-norfolk | hp-norfolk |
| 5 | available | — | hp-philadelphia | hp-philadelphia |
| 5 | available | — | hp-ravenna | hp-ravenna |
| 5 | available | — | hp-san-juan-have-html-need-tracker-entry | hp-san-juan (have HTML, need tracker entry) |
| 5 | available | — | hp-trieste | hp-trieste |
| 5 | available | — | hp-west-palm-beach | hp-west-palm-beach |
| 5 | available | — | icon-of-the-seas | Icon of the Seas |
| 5 | available | — | identify-the-50-ships | Identify the 50 ships: |
| 5 | available | — | image-audit-needed-on-other-directories | Image audit needed on other directories |
| 5 | available | — | image-reuse-alt-drift-site-wide-738-warnings-likely-concentrated | `image_reuse_alt_drift` site-wide: 738 warnings — likely concentrated on a few shared images (author portraits, hero var |
| 5 | available | — | image-tasks-ships-needing-fom-photos | Image Tasks — Ships Needing FOM Photos |
| 5 | available | — | include-alt-text-from-existing-image-alt-attributes | Include alt text from existing image alt attributes |
| 5 | available | — | independence-of-the-seas | Independence of the Seas |
| 5 | available | — | index-html-faq-positioning | index.html FAQ positioning |
| 5 | available | — | individual-ship-images-rendering-issues | Individual ship images rendering issues |
| 5 | available | — | inject-noscript-block-inside-ships-visiting-container-with-stati | Inject `<noscript>` block inside ships-visiting container with static list: ship name + cruise line + link to ship page |
| 5 | available | — | investigate-weather-validation-failed-root-cause-before-any-port | Investigate `weather_validation_failed` root cause — (BEFORE any port-by-port remediation) — the 338-count is too clean  |
| 5 | available | — | investigation-first-root-cause-unknown-likely-candidates-missing | Investigation first: — root cause unknown. Likely candidates: missing `data-*` attributes the cascade script reads, brok |
| 5 | available | — | issue-https-github-com-jsschrstrcks1-inthewake-issues-1465 | Issue: — https://github.com/jsschrstrcks1/InTheWake/issues/1465 |
| 5 | available | — | issues-found-actions-taken | Issues Found & Actions Taken |
| 5 | available | — | items-surfaced-in-session-claude-fix-carnival-validator-kredd | Items surfaced in session `claude/fix-carnival-validator-krEdD` |
| 5 | registered | — | itw-cruise-tipping-region-selector-defaults | Cruise tipping: locale-aware region defaults for Costa/MSC region selectors |
| 5 | available | — | itw-css-inline | ~19k inline styles consolidation |
| 5 | returned | — | itw-drink-calc-copy | Drink calculator copy contradicts chart |
| 5 | available | — | itw-gh-1206 | 50+ still present on some pages. |
| 5 | available | — | itw-gh-1308 | Icon of the Seas: Dining venue names missing — section headings render as "undefined" |
| 5 | available | — | itw-gh-1309 | Multiple ship pages: Passenger count inconsistency between fleet listing and detail pages |
| 5 | available | — | itw-gh-1311 | All RCL ship video sections: "Videos will appear once our sources sync" message shown despite video list being loaded |
| 5 | available | — | itw-gh-1312 | Multiple RCL ship pages: Dining venues section is completely empty |
| 5 | available | — | itw-gh-1314 | Splendour of the Seas: Ship's current name is missing in "Where Is This Ship Now?" section |
| 5 | available | — | itw-gh-1315 | Grandeur of the Seas: FAQ answer missing ship class name — renders as "Grandeur is a ship" |
| 5 | available | — | itw-gh-1317 | Image attribution credits missing photographer names on multiple ship pages |
| 5 | available | — | itw-gh-1318 | Liberty of the Seas: Logbook story titled "The Bipolar Traveler's Stable Week" — insensitive mental health framing may alienate users |
| 5 | available | — | itw-gh-1322 | Multiple ship pages: "→ Browse All" text leaking into dining section heading |
| 5 | available | — | itw-gh-1323 | FAQ template rendering bug: "is a [blank] ship" — missing class name in answers on multiple ship pages |
| 5 | available | — | itw-gh-1325 | Voyager/Radiance/Vision Class ships: Dining sections still empty + Spectrum dining empty after cache flush |
| 5 | available | — | itw-gh-1326 | Voyager of the Seas: Page layout broken — Ports and FAQ sections render outside main content region |
| 5 | available | — | itw-gh-1327 | Tonnage discrepancies between fleet listing and individual ship detail pages (post-fix audit) |
| 5 | available | — | itw-gh-1328 | Dining venue names missing from ship pages — items render as "— description" with no restaurant name |
| 5 | available | — | itw-gh-1329 | Tonnage discrepancies on individual ship pages vs fleet listing — Odyssey, Liberty, Independence, Vision, Rhapsody, Grandeur |
| 5 | available | — | itw-gh-1330 | Dining venue names missing from ship pages — items render as "— description" with no restaurant name linked |
| 5 | available | — | itw-gh-1331 | Song of Norway and Splendour of the Seas: Key Facts panel shows all "TBD" — no ship data rendered |
| 5 | available | — | itw-gh-1332 | Retired ship pages (Monarch, Majesty): Dining section shows "Dining data is loading..." indefinitely instead of a no-data state |
| 5 | available | — | itw-gh-1333 | Broken sister-ship and class links: Sovereign of the Seas, Song of America, Legend of the Seas pages don't exist |
| 5 | available | — | itw-gh-1335 | Fleet listing page sidebar shows incorrect ship counts: "28 ships across 7 ship classes" but 29+ ships and 9 classes are displayed |
| 5 | available | — | itw-gh-1336 | Image attribution rendering bug: photographer name hidden inside parentheses — renders as "()" with no visible text |
| 5 | available | — | itw-gh-1337 | Inconsistent Key Facts sidebar structure across ship page templates — different fields, different field counts |
| 5 | available | — | itw-gh-1338 | Oasis/Star class ships: Generic template dining data doesn't match actual ship dining — wrong or missing venues |
| 5 | available | — | itw-gh-1341 | NCL ship pages: intra-page data conflicts — guest count and class name inconsistencies |
| 5 | available | — | itw-gh-1342 | [NCL] Intra-page data conflicts: guest count, tonnage, and class name mismatches within same ship page |
| 5 | available | — | itw-gh-1343 | [NCL] Copyright year shows 2025 on all Norwegian ship pages — fix from #1316 not applied to NCL |
| 5 | available | — | itw-gh-1345 | [NCL] Grammar error: "a Epic Class" should be "an Epic Class" on Norwegian Epic page |
| 5 | available | — | itw-gh-1346 | [NCL] Inconsistent photo gallery implementation — some ships have real captioned photos, others have generic placeholders |
| 5 | available | — | itw-gh-1347 | [NCL] IMO number listed as "TBD" for operational ships (Norwegian Sky, Norwegian Aqua) |
| 5 | available | — | itw-gh-1348 | [NCL] Factual error: Norwegian Aqua FAQ claims it is "NCL's largest ship" — it is not |
| 5 | available | — | itw-gh-1349 | [NCL] Norwegian Spirit shows conflicting guest counts: Key Facts says 1,966 but intro text says 2,018 |
| 5 | available | — | itw-gh-1350 | [NCL] Empty Logbook and Entertainment sections across all Norwegian ship pages |
| 5 | available | — | itw-gh-1351 | [Carnival] Multiple incompatible page templates across Carnival fleet — 4 structural variants |
| 5 | available | — | itw-gh-1352 | [Carnival] Template variables not resolved on older ship pages — ship name, homeport, dining rooms blank |
| 5 | available | — | itw-gh-1353 | [Carnival] Ports section homeport rendering bug — "typically sails from [blank] on [regions]" across all Carnival pages |
| 5 | available | — | itw-gh-1355 | [Carnival] Copyright year 2025 and inconsistent footer formats across all Carnival page templates |
| 5 | available | — | itw-gh-1356 | [Carnival] Footer missing Privacy Terms About links on older template pages |
| 5 | available | — | itw-gh-1357 | [Carnival] Footer missing Privacy Terms About links on older template pages |
| 5 | available | — | itw-gh-1360 | [Carnival] FAQ template variables not resolved on Mardi Gras page |
| 5 | available | — | itw-gh-1363 | [Carnival] Image attributions in wrong section on Template B and D pages |
| 5 | available | — | itw-gh-1365 | Full Crawl Audit: Carnival Ship Pages vs. RCL — All Differences Lowering User Trust |
| 5 | available | — | itw-gh-1366 | Full Crawl Audit: Norwegian (NCL) Ship Pages vs. RCL — All Differences Lowering User Trust |
| 5 | available | — | itw-gh-1367 | Full Crawl Audit: Virgin Voyages Ship Pages vs. RCL — All Differences Lowering User Trust |
| 5 | available | — | itw-gh-1368 | Full Crawl Audit: Cunard Ship Pages vs. RCL — All Differences Lowering User Trust |
| 5 | available | — | itw-gh-1369 | Full Crawl Audit: Explora Journeys Ship Pages vs. RCL — All Differences Lowering User Trust |
| 5 | available | — | itw-gh-1370 | Full Crawl Audit: Regent Seven Seas Ship Pages vs. RCL — All Differences Lowering User Trust |
| 5 | available | — | itw-gh-1371 | Full Crawl Audit: Seabourn Ship Pages vs. RCL — All Differences Lowering User Trust |
| 5 | available | — | itw-gh-1372 | Full Crawl Audit: Oceania Cruises Ship Pages vs. RCL — All Differences Lowering User Trust |
| 5 | available | — | itw-gh-1373 | Full Crawl Audit: Costa Cruises Ship Pages |
| 5 | available | — | itw-gh-1374 | Full Crawl Audit: Silversea Cruises Ship Pages vs. RCL — All Differences Lowering User Trust |
| 5 | available | — | itw-gh-1375 | Full Crawl Audit: MSC Cruises Ship Pages vs. RCL — All Differences Lowering User Trust |
| 5 | available | — | itw-gh-1376 | Full Crawl Audit: Celebrity Cruises Ship Pages vs. RCL — All Differences Lowering User Trust |
| 5 | available | — | itw-gh-1377 | Full Crawl Audit: Princess Cruises Ship Pages vs. RCL — All Differences Lowering User Trust |
| 5 | available | — | itw-gh-1378 | Full Crawl Audit: Holland America Line Ship Pages vs. RCL — All Differences Lowering User Trust |
| 5 | available | — | itw-gh-1383 | Trust Signal Normalization: Inconsistent credibility elements across port pages |
| 5 | available | — | itw-gh-1465 | image-reuse-guardrail: false positives on FOM-named cross-ship photos and same-entity-two-paths |
| 5 | available | — | itw-gh-1600 | [index.html] 132 inline style attributes — unmaintainable, blocks CSP, prevents theming |
| 5 | available | — | itw-gh-1622 | [ports] 339 of 388 port pages share an identical generic OG image — every port preview card looks the same on social media |
| 5 | available | — | itw-gh-1672 | 474 of 478 restaurant pages share identical og:image (dining-hero.jpg) — all social shares look the same |
| 5 | available | — | itw-gh-1685 | 731 pages: meta description outside optimal length (626 too long > 165 chars, 105 too short < 80 chars) |
| 5 | available | — | itw-gh-1694 | 139 ship pages use generic ships-hero.jpg as og:image — every ship looks identical when shared |
| 5 | available | — | itw-gh-1695 | 36 port pages missing <h1> element — older template uses <div class="hero-title"> instead |
| 5 | available | — | itw-gh-1696 | 4 restaurant pages have duplicate <h1> elements — one hidden (display:none), one visible |
| 5 | available | — | itw-gh-1697 | ports/yangon.html: breadcrumb schema uses wrong domain (inthewake.blog instead of cruisinginthewake.com) |
| 5 | available | — | itw-gh-1698 | 24 port pages: canonical URL missing .html extension — will resolve to 404 without MultiViews |
| 5 | available | — | itw-gh-1699 | 23 port pages missing twitter:card meta tag — Twitter/X share previews degraded |
| 5 | available | — | itw-gh-1704 | [Tooling] ESLint not declared in project dependencies; no npm lint script (linting non-reproducible) |
| 5 | available | — | itw-gh-1705 | [Documentation Debt] Git hooks documentation is stale vs. actual implementation |
| 5 | available | — | itw-gh-1714 | possibility of data corruption, or corrupt issues from grok. |
| 5 | available | — | itw-gh-1725 | ken-baker.html: meta description contains 'many+' — looks like unfilled placeholder |
| 5 | available | — | itw-gh-1726 | 3 port pages have unclosed <div> tags — invalid HTML |
| 5 | available | — | itw-gh-1727 | [Navigation] Widespread use of forbidden /ships.html links across 700+ pages contradicts explicit CLAUDE.md policy |
| 5 | available | — | itw-gh-1728 | [PWA] sw.js precache system is stale and not kept in sync with live site |
| 5 | available | — | itw-gh-1729 | [Testing] Playwright coverage for interactive tools is minimal compared to webapp-testing skill spec |
| 5 | available | — | itw-gh-1730 | [Hooks/CI] core.hooksPath .githooks is not enforced in repo config or bootstrap scripts |
| 5 | available | — | itw-gh-1731 | [Deployment] Orphaned files and images reports exist but are not integrated into deployment-validator |
| 5 | available | — | itw-gh-1732 | [Security] No secret scanning or security-scan skill enforcement in pre-commit, bootstrap, or visible CI |
| 5 | available | — | itw-gh-1733 | [Audit Tools] Hardcoded paths (e.g. BASE_DIR = Path("/home/user/InTheWake")) in internal audit scripts like comprehensive_site_audit.py |
| 5 | available | — | itw-gh-1734 | [Skills/Process] link-integrity skill is documented as automatic on edits but is not wired into pre-commit or any automation for index.html / ships/index.html |
| 5 | available | — | itw-gh-1735 | [CI/CD] .github/workflows/ surface has inconsistent action pinning, high-blast-radius steps, and unhardened patterns |
| 5 | available | — | itw-gh-1736 | [Admin Tooling] 'add-*' scripts use brittle string manipulation and re-introduce known anti-patterns |
| 5 | available | — | itw-gh-1737 | /data/ directory exposes internal documents publicly (docx, pdf, rtf not blocked) |
| 5 | available | — | itw-gh-1738 | 56 unfilled TBD entries in attributions.csv — copyright compliance gap |
| 5 | available | — | itw-gh-1739 | 6 orphaned JS modules in assets/js/modules/ — dead code never loaded by any HTML page |
| 5 | available | — | itw-gh-1740 | authors.json: Tina Maulsby image is broken (.jpg missing, .png exists), plus sections case mismatch |
| 5 | available | — | itw-gh-1741 | solo/in-the-wake-of-grief-meta.html: thin duplicate page, no nav JS, in sitemap, no robots meta |
| 5 | available | — | itw-gh-1743 | Heading hierarchy: H1→H3 skip on 632 ship pages, H2→H4 skip on 303 pages — WCAG 1.3.1 |
| 5 | available | — | itw-gh-1744 | Skip-to-main link broken on 203 pages — href='#main-content' but element uses id='content' |
| 5 | available | — | itw-gh-1745 | 29 port pages: photo credit 'attribution' anchor links to #attribution but no such ID exists |
| 5 | available | — | itw-gh-1746 | 3 port pages use meta-refresh redirect instead of 301, remain in sitemap — SEO/UX issue |
| 5 | available | — | itw-gh-1747 | Modernize document.write copyright year to textContent across site |
| 5 | available | — | itw-gh-1748 | 6 port pages: Place schema missing GeoCoordinates — map-rich results broken |
| 5 | available | — | itw-gh-1749 | 200 restaurant pages: Restaurant schema missing priceRange — structured data incomplete |
| 5 | available | — | itw-gh-1750 | 14 port pages: gallery images use generic 'portname — view N' alt text — WCAG 1.1.1 failure |
| 5 | available | — | itw-gh-1751 | 43 pages missing privacy link in footer — legal/trust gap |
| 5 | available | — | itw-gh-1752 | 641 pages missing favicon link — browser tabs show blank icon |
| 5 | available | — | itw-gh-1753 | 3 articles missing article:published_time, article:author, and datePublished — Google can't confirm authorship or date |
| 5 | available | — | itw-gh-1761 | Family of orphaned batch-fix mutation scripts in admin/ (strong evidence of generator/validator gap) |
| 5 | available | — | itw-gh-1762 | fix-section-order.mjs: explicit post-hoc mirroring of validate-port-page-v2.js SECTION_PATTERNS / EXPECTED_MAIN_ORDER (generator/validator decoupling, distinct variant) |
| 5 | available | — | itw-gh-1763 | batch-fix-section-order.js: fleet-wide ship page section reordering (ITW-SHIP-002) with heavy validator pattern mirroring + direct writes (distinct batch variant) |
| 5 | available | — | itw-gh-1764 | repair-skip-link-target.js: accessibility-blocker skip-link href mismatch bulk rewrite (Phase 2.7, distinct accessibility variant) |
| 5 | available | — | itw-gh-1765 | repair-v2.cjs: comprehensive 3-phase port page repair (orchestra consensus, registry-driven, direct bulk writes) — distinct major variant |
| 5 | available | — | itw-gh-1766 | repair-duplicate-recent-rail-id.js: Phase 2.3 duplicate recent-rail-title ID + aria-labelledby bulk repair on ships (distinct variant) |
| 5 | available | — | itw-gh-1771 | repair-datemodified-parity.js: ICP-2 / JSON-LD dateModified parity bulk repair (Phase 2.5, forces match to last-reviewed) — distinct schema variant |
| 5 | available | — | itw-gh-1772 | repair-cordelia-bulk.js: Phase 2.1 Cordelia Empress / wrong-ship dining hero bulk image-reuse removal (distinct image-reuse variant) |
| 5 | available | — | itw-gh-1777 | repair-v2.cjs: comprehensive 3-phase 'orchestra consensus' port page repair (direct bulk writes, no validator integration) — distinct major variant |
| 5 | available | — | itw-gh-1813 | [restaurants] 471 restaurant pages still reference ICP-Lite v1.x instead of ICP-2 |
| 5 | available | — | itw-gh-1814 | [restaurants] All 478 restaurant pages reference stale asset version ?v=3.010.300 (site is 3.010.400) |
| 5 | available | — | itw-gh-1815 | [restaurants] Cross-pollinated venue-tags: pages naming the wrong cruise line (template reuse) |
| 5 | available | — | itw-gh-1817 | [Feature] Ship Sizemap Scatter Chart |
| 5 | available | — | itw-gh-1818 | [Technical] Site-Wide Accessibility & Performance Audit |
| 5 | available | — | itw-gh-1820 | [Content] Missing Homeport Pages |
| 5 | available | — | itw-gh-1822 | [Content] Hero Image Generation for RCL Ships |
| 5 | available | — | itw-gh-1823 | [Content] 'Coming Soon' Text Cleanup |
| 5 | available | — | itw-gh-1824 | [Content] Affiliate Link and About Us Updates |
| 5 | available | — | itw-gh-1904 | [cruise-lines] Hub pages list only a fraction of each fleet — Princess links 0/18 ships, Carnival 3/30+, Celebrity 4/24+, MSC 4/24 (+relative-URL 404), HAL/Norwegian/Regent incomplete |
| 5 | available | — | itw-gh-1915 | [Ships] 9 pages show wrong ship class in the Key Facts block (leaked template defaults) contradicting their own meta/schema — incl. "Unknown Class" (ss-meridian) and Silver Endeavour tonnage 23,500 vs |
| 5 | available | — | itw-gh-1917 | [Restaurants] eataly.html claims exclusivity to two ships (World America vs World Europa); giovannis.html has no H1 (title="Overview"); q-texas-smokehouse contradicts "walk-up Quick Service" vs "$40 c |
| 5 | available | — | itw-gh-1919 | [Ships/HAL] Systemic data corruption across 47 pages: literal "Historic"/"Unknown" tokens as class/year/GT/guests (35-40 pages), wrong-ship torpedo/scrap dates, active ships marked "Historical", ooste |
| 5 | available | — | itw-gh-1922 | [Ships] celebrity-millennium malformed carousel + duplicated slides/attributions; celebrity-xperience shows Flora's 5,739 GT (wrong ship); costa/index.html mis-classes Diadema as Concordia Class |
| 5 | available | — | itw-gh-1923 | [ships/rooms.html] Loads core CSS, Swiper library, and compass from a personal github.io host (jsschrstrcks1.github.io); Swiper vendor bundle is missing from the repo so the carousel breaks |
| 5 | available | — | itw-gh-1926 | [Restaurants/Carnival] Missing current venues vs official Carnival docs: Fun Italian Style (Tomodoro, La Strada Grill, Piazza Panini, Il Mercato), Street Eats, Swirls, Captain's Pasta Bar, Lucky Bowl, |
| 5 | available | — | itw-gh-1927 | [Restaurants/Carnival] Entire non-dining venue catalog is missing vs official Carnival docs — ~30 bars/lounges, entertainment venues, Playlist/game shows, activities (BOLT/WaterWorks/SportSquare), Clo |
| 5 | available | — | itw-gh-1928 | [Restaurants/NCL] Non-dining venue gap vs official NCL docs: theaters + production shows (Red White & British, Revolution, Rocket Man), activities (Galaxy Pavilion, Speedway track, Aqua Park slides, T |
| 5 | available | — | itw-gh-1929 | [Restaurants/Princess] No Princess venue pages exist at all — full current official catalog to build (dining, bars, theaters/Arena/Dome, production shows, SeaWalk/pools, Lotus Spa/Sanctuary, Camp Disc |
| 5 | available | — | itw-gh-1930 | [Restaurants/Holland America] No HAL venue pages exist — full current official catalog to build (Pinnacle Grill/Canaletto/Tamarind/Sel de Mer/Morimoto, Music Walk: BB King's/Billboard/Rolling Stone, W |
| 5 | available | — | itw-gh-1931 | [Restaurants/Celebrity] No Celebrity venue pages exist — full current official catalog to build (Edge/Solstice/Millennium): MDRs, Le Voyage/Fine Cut/Murano/Eden, Magic Carpet/Eden/The Club, Canyon Ran |
| 5 | available | — | itw-gh-1932 | [Restaurants/Costa] No Costa venue pages exist — fleet-wide brand catalog to build (Archipelago, Pizzeria Pummid'Oro, Teppanyaki/Sushino, Samsara, Heineken Star Club, Colosseo/Teatro, Squok Club) — LO |
| 5 | available | — | itw-gh-1933 | [Restaurants/Silversea] No Silversea venue pages exist — full current official catalog to build (The Restaurant/Atlantide/La Terrazza/La Dame/Kaiseki/Silver Note/S.A.L.T., Dolce Vita/Dusk Bar/Connoiss |
| 5 | available | — | itw-gh-1934 | [Restaurants/Oceania] No Oceania venue pages exist — full current official catalog to build (Grand Dining Room/Polo Grill/Toscana/Red Ginger/Jacques [complimentary], Culinary Center/Artist Loft/LYNC,  |
| 5 | available | — | itw-gh-1935 | [Restaurants/Regent] No Regent venue pages exist — full current official catalog to build (Compass Rose/Prime 7/Chartreuse/Pacific Rim/Sette Mari [all-inclusive], Constellation Theater, Serene Spa, Cu |
| 5 | available | — | itw-gh-1936 | [Restaurants/Seabourn] No Seabourn venue pages exist — full current official catalog to build (The Restaurant/Colonnade/Grill by Thomas Keller/Solís/Sushi [all-inclusive], The Club/Seabourn Square, Gr |
| 5 | available | — | itw-gh-1937 | [Restaurants/Cunard] No Cunard venue pages exist — full current official catalog to build (grade dining: Britannia/Princess Grill/Queens Grill; The Verandah/Sir Samuel's/Aji Wa/Aranya/Tramonto; Queens |
| 5 | available | — | itw-gh-1938 | [Restaurants/Explora Journeys] No Explora venue pages exist — full current official catalog to build (Fil Rouge/Sakura/Marble & Co./Med Yacht Club/Anthology, Journeys & Astern Lounges, Ocean Wellness  |
| 5 | available | — | itw-gh-1939 | [Restaurants/MSC] Dining is complete (51 pages) but the entire non-dining catalog is missing — Carousel Lounge/Cirque du Soleil, the Theatre, MSC Starship Club (robot bar), Masters of the Sea, Aqua Pa |
| 5 | available | — | itw-gh-1940 | [Restaurants/Virgin] Dining/bars/shows covered (46 pages) but the entire wellness/fitness/beauty complex is missing — Redemption Spa, B-Complex, Squid Ink (tattoo), Dry Dock, Stubble & Groom, The Runw |
| 5 | available | — | itw-gh-1941 | [Restaurants/Royal Caribbean] Venue catalog ~complete (~300 pages); only gaps are newest-hull venues — Legend of the Seas (2026): Captain Jack's Bar, Crème de la Crème, Sugar Fix + Prohibition Break ( |
| 5 | available | — | itw-gh-2004 | [Content] Missing ship page: Margaritaville at Sea Islander (needed by voyage pack v0.1.12) |
| 5 | available | — | itw-gh-2005 | [Content] Missing venue pages: Margaritaville at Sea line (needed by voyage pack v0.1.12) |
| 5 | registered | — | itw-phase-6-session-2026-05-21-outcome | Phase 6 image sourcing session outcome — 37 ships PASS, ~13 partial (Commons source-limited), 45 remain (unbuilt/TBN) |
| 5 | registered | — | itw-stacked-pr-ci-signal | CI gap: Validate HTML checks ai-summary presence but not fleet-wide ai_summary_boilerplate rule — document stacked-PR pattern |
| 5 | registered | — | itw-tools-object-object-404 | Tools: investigate diagnostic [object Object] 404 noise |
| 5 | available | — | kake-html-tiny-tlingit-village-on-kupreanof-island | `kake.html` — Tiny Tlingit village on Kupreanof Island |
| 5 | available | — | kristiansand-norway | kristiansand (Norway) |
| 5 | available | — | la-digue-seychelles | la-digue (Seychelles) |
| 5 | available | — | lazy-load-exception-json-only-when-widget-activated | Lazy-load exception JSON only when widget activated |
| 5 | available | — | life-transition-articles-retirement-second-marriage-work-life-ba | Life transition articles (retirement, second marriage, work-life balance) |
| 5 | available | — | luderitz-namibia | luderitz (Namibia) |
| 5 | available | — | main-entity-blacklisted-26-ships-json-ld-mainentity-references-b | main_entity_blacklisted: 26 ships — (JSON-LD `mainEntity` references blocked schema.org types; investigate) |
| 5 | available | — | medical-recovery-articles-post-cancer-post-stroke-chronic-illnes | Medical recovery articles (post-cancer, post-stroke, chronic illness) |
| 5 | available | — | mental-health-articles-anxiety-ptsd-veteran-bipolar-depression | Mental health articles (anxiety, PTSD/veteran, bipolar/depression) |
| 5 | available | — | methodology | Methodology |
| 5 | available | — | missing-article-thumbnails-hero-images | Missing article thumbnails / hero images |
| 5 | available | — | missing-grid-2-layout-30-ships-per-2026-03-02-count-needs-refres | Missing grid-2 layout (~30 ships per 2026-03-02; *count needs refresh*) |
| 5 | available | — | missing-image-file-53-ports-real-per-port-broken-image-work | `missing_image_file`: 53 ports (real per-port broken-image work) |
| 5 | available | — | missing-port-and-ship-pages | Missing Port and Ship Pages |
| 5 | available | — | missing-required-placeholder-content-few-videos-29-ships-combine | missing_required + placeholder_content + few_videos: 29 ships combined — (smaller categories) |
| 5 | available | — | missing-stylesheet-collapsible-required-missing-main-content-86- | `missing_stylesheet` + `collapsible_required` + `missing_main_content`: 86 ports combined (smaller categories; likely fi |
| 5 | available | — | missing-whimsical-units-181-ships-per-2026-03-02-count-needs-ref | Missing whimsical units (~181 ships per 2026-03-02; *count needs refresh*) |
| 5 | available | — | mobile-browser-testing-at-360px-375px-390px-412px-768px-requires | Mobile browser testing at 360px, 375px, 390px, 412px, 768px (requires manual browser) |
| 5 | available | — | mossel-bay-south-africa | mossel-bay (South Africa) |
| 5 | available | — | multiple-dock-locations-which-berth-will-your-ship-use-affects-p | Multiple dock locations — — which berth will your ship use? (affects planning) |
| 5 | available | — | national-holidays-revolution-day-mexico-carnival-caribbean-brazi | National holidays — — Revolution Day (Mexico), Carnival (Caribbean/Brazil), bank holidays closing attractions |
| 5 | available | — | navigator-of-the-seas | Navigator of the Seas |
| 5 | available | — | need-to-build-full-static-seasonal-guide-html-at-a-glance-best-t | Need to build full static seasonal guide HTML (At a Glance, Best Time, Catches, Packing, Hazards) |
| 5 | available | — | nome-html-bering-sea-iditarod-finish-line | `nome.html` — Bering Sea; Iditarod finish line |
| 5 | available | — | normalize-hero-sizing-positioning | Normalize hero sizing/positioning |
| 5 | available | — | norwegian-luna-new-ncl-ship-referenced-in-2026-capacity-discussi | Norwegian Luna — — New NCL ship referenced in 2026 capacity discussions. Needs a ship page in `/ships/norwegian/norwegia |
| 5 | available | — | noscript-phase-1-already-in-queue-under-g-noscript-remediation-n | Noscript Phase 1 (already in queue under [G] Noscript Remediation): now empirically scoped — 346 stories + 342 ships + 2 |
| 5 | available | — | noscript-remediation-port-pages | Noscript Remediation — Port Pages |
| 5 | available | — | nuuk-greenland | nuuk (Greenland) |
| 5 | available | — | odyssey-of-the-seas | Odyssey of the Seas |
| 5 | available | — | options | Options: |
| 5 | available | — | phase-b-phase-c-scope-clarification-needed | Phase B / Phase C — scope clarification needed |
| 5 | available | — | poi-manifest-work-already-in-queue-288-ports-below-the-10-poi-mi | POI manifest work (already in queue): 288 ports below the 10-POI minimum (was claimed as 365 in 2026-03-02; actual scope |
| 5 | available | — | port-authority-data-some-ports-publish-annual-ship-call-statisti | Port authority data — — Some ports publish annual ship call statistics (actual vs scheduled). Caribbean ports especially |
| 5 | available | — | port-call-reliability-tracker | Port Call Reliability Tracker |
| 5 | available | — | port-content-repair-queue | Port Content Repair Queue |
| 5 | available | — | port-day-disruption-factors | Port Day Disruption Factors |
| 5 | available | — | port-to-town-distance-docks-far-from-attractions-misleading-walk | Port-to-town distance — — docks far from attractions, misleading "walking distance" claims |
| 5 | available | — | port-validation-remaining-work | Port Validation — Remaining Work |
| 5 | available | — | port-vila-vanuatu-verify-if-covered-by-vanuatu-html | port-vila (Vanuatu) — verify if covered by vanuatu.html |
| 5 | available | — | port-weather-remaining-coverage | Port Weather — Remaining Coverage |
| 5 | available | — | prince-rupert-html-inside-passage-to-open-gulf | `prince-rupert.html` — Inside Passage to open gulf |
| 5 | available | — | priority-0-critical-0-unfinished | Priority 0 - Critical - 0 UNFINISHED |
| 5 | available | — | priority-3-low-nice-to-have-3-unfinished | Priority 3 - Low (Nice to have) - 3 UNFINISHED |
| 5 | available | — | priority-4-future-expansion-post-royal-caribbean-completion-5-un | Priority 4 - Future Expansion (Post Royal Caribbean completion) - 5 UNFINISHED |
| 5 | available | — | priority-definitions | Priority Definitions |
| 5 | available | — | qaqortoq-greenland | qaqortoq (Greenland) |
| 5 | available | — | quantum-of-the-seas-has-7-fom-already-may-need-more | Quantum of the Seas (has 7 FOM already, may need more) |
| 5 | available | — | quiz-remaining-fixes | Quiz Remaining Fixes |
| 5 | available | — | rarotonga-cook-islands | rarotonga (Cook Islands) |
| 5 | available | — | read-articles-index-json-to-get-5-most-recent-articles | Read articles/index.json to get 5 most recent articles |
| 5 | available | — | read-port-registry-json-ship-schedule-data-to-get-ships-per-port | Read port-registry.json + ship schedule data to get ships per port |
| 5 | available | — | read-ports-img-slug-directory-to-get-first-4-6-images | Read ports/img/{slug}/ directory to get first 4-6 images |
| 5 | available | — | red-lane-human-decides | RED LANE — Human Decides |
| 5 | available | — | religious-dress-codes-mosque-temple-church-requirements-by-port- | Religious dress codes — — mosque, temple, church requirements by port (specific rules, not vague "dress modestly") |
| 5 | available | — | religious-holidays-ramadan-restaurant-closures-shabbat-in-israel | Religious holidays — — Ramadan restaurant closures, Shabbat in Israel, Friday mosque closures, Hindu festivals |
| 5 | available | — | remove-redundant-page-grid-from-remaining-style-blocks | Remove redundant `.page-grid` from remaining `<style>` blocks |
| 5 | available | — | resilient-lady-cocktail-image-alternative-use-case | Resilient_Lady cocktail image — alternative use case |
| 5 | available | — | rest-for-wounded-healers-2-500-words-not-created | Rest for Wounded Healers (~2,500 words) — not created |
| 5 | available | — | roll-out-to-all-295-ship-pages | Roll out to all 295 ship pages |
| 5 | available | — | run-google-pagespeed-insights-on-key-pages | Run Google PageSpeed Insights on key pages |
| 5 | available | — | run-once-verify-3-ports-commit | Run once, verify 3 ports, commit |
| 5 | available | — | run-replace-to-swap-inline-styles-for-class-names | Run replace to swap inline styles for class names |
| 5 | available | — | same-fix-as-2a-but-includes-adding-the-noscript-tags-themselves | Same fix as 2a but includes adding the `<noscript>` tags themselves |
| 5 | available | — | seo-external-tools-setup | SEO External Tools Setup |
| 5 | available | — | service-worker-caching-for-offline-use | Service worker caching for offline use |
| 5 | available | — | set-up-bing-webmaster-tools | Set up Bing Webmaster Tools |
| 5 | available | — | set-up-google-analytics-dashboard | Set up Google Analytics dashboard |
| 5 | available | — | seven-seas-mariner-html-retains-an-editorially-marginal-slide | `seven-seas-mariner.html` retains an editorially marginal slide |
| 5 | available | — | ship-page-standardization-295-pages | Ship Page Standardization (295 pages) |
| 5 | available | — | ship-size-atlas-remaining-items | Ship Size Atlas — Remaining Items |
| 5 | available | — | ship-tracking-history-marinetraffic-vesselfinder-and-cruisemappe | Ship tracking history — — MarineTraffic, VesselFinder, and CruiseMapper show historical ship positions. Compare schedule |
| 5 | available | — | ship-validation-content-quality-enhancement | Ship Validation — Content Quality Enhancement |
| 5 | available | — | ships-html-display-issues | ships.html Display Issues |
| 5 | available | — | solo-html-article-loading-28-article-references-uses-fetch-for-f | solo.html article loading (28 article references, uses fetch for fragments) |
| 5 | available | — | spectrum-of-the-seas | Spectrum of the Seas |
| 5 | available | — | staleiferrortimestamped-strategy-for-fx-api-caching | `staleIfErrorTimestamped` strategy for FX API caching |
| 5 | available | — | standardize-carousel-markup-to-figure-pattern-across-all-lines | Standardize carousel markup to `<figure>` pattern across all lines |
| 5 | available | — | stateroom-checker-embed-on-ship-pages | Stateroom Checker — Embed on Ship Pages |
| 5 | available | — | street-closures-parades-festivals-protests-that-block-transit-ro | Street closures — — parades, festivals, protests that block transit routes (user encountered this in a Mexican port) |
| 5 | available | — | target-all-143-ports-with-swiper-galleries | Target: all 143 ports with swiper galleries |
| 5 | available | — | target-all-370-ports-with-ships-visiting-section | Target: all 370 ports with ships-visiting section |
| 5 | available | — | target-reduce-15-626-inline-styles-to-1-000 | Target: Reduce ~15,626 inline styles to <1,000 |
| 5 | available | — | task-lanes | Task Lanes |
| 5 | available | — | taxi-transport-issues-known-scam-ports-metered-vs-negotiated-sur | Taxi/transport issues — — known scam ports, metered vs negotiated, surge pricing during events |
| 5 | available | — | technical-tasks | Technical Tasks |
| 5 | available | — | template-noscript-div-class-gallery-static-with-figure-img-src-a | Template: `<noscript><div class="gallery-static">` with `<figure><img src="..." alt="..." loading="lazy"></figure>` |
| 5 | available | — | template-noscript-ul-class-ships-list-static-with-li-a-href-ship | Template: `<noscript><ul class="ships-list-static">` with `<li><a href="/ships/...">Ship Name</a> (Line)</li>` |
| 5 | available | — | template-noscript-ul-class-stories-static-with-li-a-href-solo-ar | Template: `<noscript><ul class="stories-static">` with `<li><a href="/solo/articles/...">Title</a></li>` |
| 5 | available | — | template-remnants-301-ships-verify-rule-definition-first-the-jum | template_remnants: 301 ships — — verify rule definition first; the jump from ~0 to 301 between 2026-05-11 and 2026-05-13 |
| 5 | available | — | test-cases-that-must-now-pass-the-4-documented-in-1465 | Test cases that must now pass: — the 4 documented in #1465. |
| 5 | available | — | test-cases-that-must-still-fail-cordelia-pattern | Test cases that must still fail — (Cordelia pattern): |
| 5 | available | — | test-keyboard-navigation-on-dropdown-menus | Test keyboard navigation on dropdown menus |
| 5 | available | — | test-screen-reader-compatibility | Test screen reader compatibility |
| 5 | available | — | these-100-ports-have-weather-widgets-but-only-enable-javascript- | These 100 ports have weather widgets but only "Enable JavaScript" in noscript |
| 5 | available | — | these-14-ports-have-weather-widgets-with-zero-noscript-content | These 14 ports have weather widgets with zero noscript content |
| 5 | available | — | these-are-site-wide-not-port-specific-so-same-5-articles-on-all- | These are site-wide (not port-specific), so same 5 articles on all ports |
| 5 | available | — | tier-1-high-traffic-ports-fix-first-readers-will-notice | Tier 1: High-traffic ports (fix first — readers will notice) |
| 5 | available | — | tier-3-lower-traffic-specialized-ports | Tier 3: Lower-traffic / specialized ports |
| 5 | available | — | time-zone-changes-ship-time-vs-local-time-confusion | Time zone changes — — ship time vs local time confusion |
| 5 | available | — | track-tender-vs-dock-tender-ports-inherently-less-reliable | Track tender vs dock — tender ports inherently less reliable |
| 5 | available | — | two-complementary-fixes-inside-claude-skills-image-reuse-guardra | Two complementary fixes inside `.claude/skills/image-reuse-guardrail/` and possibly `admin/scan-image-reuse.cjs`: |
| 5 | available | — | ui-integration-refresh-rates-button-cache-age-display-toast-noti | UI integration: "Refresh Rates" button, cache age display, toast notifications |
| 5 | available | — | uncategorized-pending-items | Uncategorized Pending Items |
| 5 | available | — | uniform-version-badge | Uniform version badge |
| 5 | available | — | update-about-us-html-our-promise-section-to-acknowledge-amazon-a | Update about-us.html "Our Promise" section to acknowledge Amazon Associates participation |
| 5 | available | — | use-systematic-debugging-skill-before-proposing-fixes-pick-1-2-a | Use `systematic-debugging` skill before proposing fixes. Pick 1–2 affected ships, reproduce in a browser, instrument the |
| 5 | available | — | verification-sources | Verification Sources |
| 5 | available | — | verify-all-images-have-proper-alt-text | Verify all images have proper alt text |
| 5 | available | — | verify-wcag-2-1-aa-compliance-across-new-pages | Verify WCAG 2.1 AA compliance across new pages |
| 5 | available | — | victoria-html-common-pvsa-stop-on-seattle-round-trips | `victoria.html` — Common PVSA stop on Seattle round-trips |
| 5 | available | — | warmcalculatorshell-predictive-prefetch | `warmCalculatorShell` predictive prefetch |
| 5 | available | — | weather-correlation-cross-reference-noaa-weather-data-with-known | Weather correlation — — Cross-reference NOAA/weather data with known cancellation patterns. If wind > 25kt at a tender p |
| 5 | available | — | weather-extremes-not-just-cancellations-but-dangerous-heat-middl | Weather extremes — — not just cancellations but dangerous heat (Middle East summer), monsoon downpours, etc. |
| 5 | available | — | what-can-i-eat-dining-search-tool | "What Can I Eat?" Dining Search Tool |
| 5 | available | — | why-it-s-higher-value-than-3-2b-for-end-users-boilerplate-ai-sum | Why it's higher value than 3.2b for end users: — boilerplate ai-summary is invisible to readers; a fully-failed data cas |
| 5 | available | — | write-scripts-inject-gallery-noscript-js | Write `scripts/inject-gallery-noscript.js` |
| 5 | available | — | write-scripts-inject-recent-stories-noscript-js | Write `scripts/inject-recent-stories-noscript.js` |
| 5 | available | — | write-scripts-inject-ships-visiting-noscript-js | Write `scripts/inject-ships-visiting-noscript.js` |
| 5 | available | — | wrong-section-order-23-ships-matches-the-2026-03-25-port-page-no | wrong_section_order: 23 ships — (matches the 2026-03-25 port-page-normalization pattern but on ships) |
| 5 | available | — | yellow-lane-ai-proposes-human-approves | YELLOW LANE — AI Proposes, Human Approves |
| 8 | registered | — | itw-royal-beach-club-antigua-dedicated-images | Royal Beach Club Antigua — dedicated port images deferred until resort opens; currently inherits /ports/img/antigua/ per ports/img/royal-beach-club-antigua/IMAGE-MANIFEST.md; re-source 8 slots when trigger fires |
| 10 | available | — | itw-port-faq-cleanup | Port FAQ template cleanup |
