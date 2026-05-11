# Port Image Sourcing Plan — 2026-05-10

**Author:** Claude (session: claude/baseline-port-validation-Nbcst)
**Status:** DRAFT — pending user review before any execution
**Posture:** Careful, not clever. People before platform. *Soli Deo Gloria.*

---

## 1. Why this plan exists

The user asked me to:

1. Generate a baseline across all 387 ports.
2. Run the canonical port validator.
3. Find which ports have no images at all.
4. Make an exhaustive plan for how I will source the images for each port page that needs them.

This document answers (3) with care — there is more than one defensible reading of "no images at all" — and proposes (4) as a per-port plan rather than a one-size-fits-all pipeline.

I have **not modified any port page or image directory.** This is a plan, not an action.

---

## 2. Authority and constraints I'm working under

These are the rules from the project's own documentation (CLAUDE.md, PASTORAL_GUARDRAILS.md, IMAGE_WORKFLOW.md, IMAGE_SOURCING_WORKFLOW.md, careful-not-clever, validator-spec):

- **No placeholder images.** A `placeholder.jpg`, gradient-with-text rectangle, or generic stock image fails IMG-014 as BLOCKING.
- **No training-data sourcing.** I do not know any Flickr photo IDs, Wikimedia file names, or LoC item numbers from memory. Every URL must come from a real search hit (WebSearch) or a JSON API call (LoC) and be verified with a HEAD or fetch.
- **No mislabeling.** If the only photo I can find is of a related but different subject, I rewrite the caption honestly rather than mislabel — see college-fjord precedent in `admin/IMAGE_SOURCING_WORKFLOW.md`.
- **WebP only**, except logos (PNG with transparency).
- **Every image must have a sibling `*.attr.json`** with source URL, license URL, author, and a `verifiedBySession` stamp (ATTR-001).
- **Source URLs in a gallery must be diverse** — ATTR-003 fails a gallery whose images all come from the same source URL.
- **No cross-port duplicates** outside the explicit allowlist `admin/cross-port-image-allowlist.json` (IMG-015).
- **Visual verification with the Read tool before commit.** Bytes, not strings.
- **Wikimedia Commons (`commons.wikimedia.org`, `upload.wikimedia.org`) is blocked in this sandbox.** Working sources confirmed in `admin/IMAGE_SOURCING_WORKFLOW.md`: Flickr (`live.staticflickr.com`), Library of Congress (`tile.loc.gov`, `www.loc.gov`), Unsplash, Pexels, NPS, USFS via Flickr accounts, public-domain US-government Flickr accounts (NOAA Photo Library, USGS, USFWS Alaska).
- **LLM-suggested URLs must be re-verified.** Per the AI shootout in IMAGE_SOURCING_WORKFLOW.md, Gemini hallucinates plausible Flickr IDs at 1.0 confidence; only WebSearch hits are trustworthy starting points.
- **Pastoral posture.** This is a Christ-shaped cruise planning site read by tired, grieving, and disabled travelers. A wrong photo on a port they're researching is a small but real betrayal of trust. I would rather ship a port with 11 honest images and a smaller gallery than 25 with one fake.

---

## 3. Baseline — what I measured today

All numbers below come from `admin/audit-reports/2026-05-10-baseline/`:

- `port-baseline.json` — per-port HTML existence, image-directory existence, image-file count, attribution-file count, list of files.
- `port-baseline-with-html.json` — adds embedded `<img>` tag count, hero-section presence, redirect-stub flag, HTML byte size.
- `port-image-existence.json` — per-port resolution of every `<img src=>` against the filesystem; counts broken local references.
- `port-image-tiers.json` — image-deficit tier per port.
- `sourcing-tiers.json` — the 5 sourcing-action tiers (A–E) used in §4.
- `per-port/<slug>.json` — full validator output per port (background run; will be cited in §6 once complete).

**Headline numbers (verified bytes-on-disk, not metadata):**

| Quantity | Count |
|---|---:|
| Port HTML files | 387 |
| Port image directories | 397 |
| Orphan image dirs (no matching HTML) | 10 |
| Port HTML pages with **zero `<img>` tags** | 3 |
| Port image directories that are empty | 0 |
| Port HTML pages whose port-specific `<img>` refs all 404 | 1 |
| Port HTML pages with no port-specific `<img>` refs at all | 2 |
| Port image dirs with 1–3 image files | 2 |
| Port image dirs with 4–10 image files (below validator floor) | 271 |
| Port image dirs with ≥11 image files (meets IMG-005) | 114 |
| Port HTML pages with at least one broken local `<img src=>` | 52 |
| Total broken local `<img src=>` references site-wide | 293 |

**Orphan image directories** (no matching `ports/<slug>.html` — likely deleted-page leftovers; review only, not for sourcing): aalborg, antwerp, bruges, costamaya, fort-lauderdale, halong-bay, lahaina, london, new-york, rotterdam.

---

## 4. "No images at all" — read three honest ways

I am reporting all three rather than picking one, because each surfaces a different real problem.

### Tier A — HTML pages with **zero `<img>` tags** (3 ports)

These pages render no images because they are **intentional redirect stubs**:

| Slug | Redirects to | Notes |
|---|---|---|
| `beijing` | `/ports/tianjin.html` | Beijing has no cruise port; ships dock at Tianjin. |
| `falmouth-jamaica` | `/ports/jamaica.html` | Canonical Falmouth coverage lives on `jamaica.html`. |
| `kyoto` | `/ports/osaka.html` | Kyoto is landlocked. |

**Sourcing action: none.** Stubs should not have images. The validator's image rules (IMG-005, IMG-013) should treat redirect-stub pages as out-of-scope; if it doesn't, that's a validator gap, not a sourcing gap. **Recommend** filing as a validator-spec note rather than touching these ports.

### Tier B — HTML promises port-specific images that don't exist (1 port)

| Slug | Port-specific `<img>` refs | Resolved on disk |
|---|---:|---:|
| `punta-del-este` | 12 | 0 |

The HTML references `/ports/img/punta-del-este/pde-*.webp` (a `pde-` prefix). The directory contains 8 `punta-del-este-*.webp` files. **This is a naming mismatch, not an image gap.** No new sourcing required for the existing 8; add 3+ more to clear IMG-005's 11-image floor.

**Sourcing action:** rename HTML refs to match disk OR rename disk files to match HTML, whichever the existing visual content supports. Then add 3 more verified images to reach 11. Tier-B is a one-port exception, not a pattern.

### Tier C — HTML has no port-specific `<img>` refs at all (2 ports)

| Slug | Notes |
|---|---|
| `fortaleza` | HTML uses 8 hand-typed `https://upload.wikimedia.org/wikipedia/commons/thumb/<X>/<X1>/Fortaleza_*.jpg` URLs whose path patterns (`/g/g7/`, `/h/h8/`) **do not match the real Commons CDN scheme** — these are almost certainly hallucinated or stale. Local dir has 8 fortaleza-* webp files that are **not referenced**. |
| `royal-beach-club-cozumel` | HTML references `/ports/img/cozumel/<...>` (Cozumel's images, not its own). Local dir has 8 royal-beach-club-cozumel-* files that are **not referenced**. |

**Sourcing action — staged:**

1. **Inventory the local files first** (Read each, visually verify what they actually depict).
2. If the local files are real and on-subject, **rewrite the HTML to use them** (no new sourcing yet; this is the cheapest fix).
3. If the local files are placeholders or off-subject, treat the port like Tier-D and source from scratch.
4. Verify via the validator's image-existence check + `md5sum` against `admin/cross-port-image-allowlist.json`.

This is where the user's "careful" guidance bites hardest. The temptation is to delete the broken HTML refs and trust the local files; the careful path is to look at the bytes first.

### Tier D — image directory has 1–3 files (2 ports)

| Slug | Images on disk | Embedded `<img>` tags | Resolved |
|---|---:|---:|---:|
| `callao` | 1 (callao-hero.webp) | 14 | 2 |
| `catania` | 1 | 15 | 3 |

These two are the **closest match to the user's question read strictly** — pages that exist, have an HTML body that promises a real port experience, but only one real image on disk. Each is short by 10–11 files.

**Sourcing action:** real per-port sourcing per the six-step workflow in `admin/IMAGE_SOURCING_WORKFLOW.md`. See §5.

### Tier E — image directory has 4–10 files (271 ports)

The validator's floor is 11. These ports each need 1–7 more images. Many already have a respectable starter set; many also have HTML that references files the directory doesn't contain (the 52-port / 293-broken-ref class). The work here is partly sourcing and partly **fixing references to existing files**.

---

## 5. The sourcing protocol I will follow per port

This is the careful, reusable shape. It mirrors the proven workflow already documented at `admin/IMAGE_SOURCING_WORKFLOW.md` §"The six-step workflow" and adds the bookkeeping needed for 387-port scale.

### 5.1 Pre-flight — once, not per port

1. Read `admin/cross-port-image-allowlist.json` into memory so I never propose an image whose hash already belongs to another port.
2. Read `attributions/attributions.csv` (1,115 rows today) to avoid duplicate attribution writes.
3. Confirm I have working internet egress to `live.staticflickr.com`, `www.loc.gov`, `tile.loc.gov`, and `images.unsplash.com`. (Tested 2026-04-10, but every session is a new sandbox.)

### 5.2 Per-port workflow (the six steps)

For each port `<slug>`:

1. **Inventory.**
   - List `ports/img/<slug>/*.webp` and Read each one to verify it actually shows the port (not a placeholder, not the wrong city). Record subjects in a per-port worksheet.
   - Parse `ports/<slug>.html`. Record every `<img src=>` that points to `/ports/img/<slug>/`, whether it resolves, and what its alt text claims.
   - Cross-reference: which existing files are unused, which references are broken, which subjects are missing?
2. **Plan the gallery.** A finished port page wants ~11 unique `<img>` tags including hero, author avatar, sidebar/site chrome, and 7–10 body/gallery images. List the **subjects** I want, not specific URLs:
   - Hero: terminal/skyline/iconic landmark.
   - Pier/from-the-pier: what the cruiser sees stepping off.
   - 1–2 landmarks the port is best known for.
   - 1 food image (market, signature dish).
   - 1 landscape/coastline.
   - 1 cultural/historical site.
   - 1 daily-life or street scene.
3. **Search — domain-restricted WebSearch.**
   - First pass: `WebSearch(allowed_domains=["www.loc.gov", "tile.loc.gov"], query="<port> harbor 1899-1928 photograph")` — pre-1928 LoC photos are public-domain by default and safest.
   - Second pass: `WebSearch(allowed_domains=["www.flickr.com"], query="\"<port>\" cruise terminal photo")` — must verify CC license per photo.
   - Third pass: Unsplash / Pexels for landscape/scenic/destination shots.
   - **Never trust an LLM-returned URL without verification.** This is the lesson of the AI shootout in `admin/IMAGE_SOURCING_WORKFLOW.md`.
4. **Verify each candidate before download.**
   - Flickr: WebFetch the photo page, look for `creativecommons.org/licenses/by/2.0/` (or `/by-sa/2.0/`, or `publicdomain/`). Reject `flickrhelp.com` ARR redirects, NC, ND, NC-ND, NC-SA.
   - LoC: `curl 'https://www.loc.gov/item/<id>/?fo=json'` → check `rights_information` / `rights_advisory`. Public-domain or "no known restrictions" only.
   - Unsplash / Pexels: license is permissive by default; still capture the photographer name and source URL.
5. **Download + visually verify.**
   - `curl -o /tmp/sourcing/<slug>/<n>.jpg <direct-url>` with a polite UA string.
   - **Read the file in-session.** Compare the rendered image to the title, caption, and license metadata. If anything doesn't match, throw it away.
6. **Convert + commit per port.**
   - Pillow → WebP at quality 85, resize to 1600px max width, crop archival borders if any.
   - Write `<slug>-<descriptor>.webp` and the sibling `<slug>-<descriptor>.webp.attr.json` with: source, sourceUrl, artist, license, licenseUrl, title, description, alt, dateTaken (if known), reproductionNumber (LoC), and `verifiedBySession: "2026-05-10 image sourcing"`.
   - Update the port HTML: alt text matches what's in the picture, figcaption credit links to the source page, and the gallery contains links from at least 3 different `sourceUrl` domains (ATTR-003).
   - Append to `attributions/attributions.csv`.
   - Run `node admin/validate-port-page-v2.js ports/<slug>.html` and confirm zero image-section blockers before moving on.

### 5.3 Bookkeeping per port

For each port, I will write a short per-port note (not the full plan, just facts) to `admin/audit-reports/2026-05-10-baseline/notes/<slug>.md`:

```
## <slug>

- Existing files on disk: <list>
- HTML references resolving: <list>
- HTML references broken: <list>
- Subjects still needed: <list>
- Candidate sources searched: <date> <queries>
- Candidate sources verified: <urls + license>
- Candidate sources rejected: <urls + reason>
```

This is the audit trail. Without it, after 50 ports the work becomes unverifiable and `admin/CLAUDE.md`'s "trust bytes, not strings" rule cannot be honored.

---

## 6. Validator ground truth (added 2026-05-10 after batch run)

Full canonical-validator run — `node admin/validate-port-page-v2.js` via the parallel runner — completed in 585 seconds, all 387 ports.

| Validator metric | Count |
|---|---:|
| Ports validated | 387 |
| Ports with zero blocking errors | 29 |
| Ports with ≥1 blocking error | 358 |
| **Image-section blocking errors** | **53 ports** |
| All 53 image blockers are the same rule | `missing_image_file` |
| IMG-005 (minimum 11 images) failures | **0** |
| Hero image-rule failures | 0 |
| Image-section warnings | 333 ports (mostly `image_reuse_alt_drift`: 742 instances) |

Top blockers fleet-wide are **`weather_validation_failed` (358 ports)** and **`missing_stylesheet` (37 ports)** — both unrelated to image sourcing. Of the image work, the only blocker the validator flags is **`missing_image_file`**, distributed as:

| Broken-ref count | Ports | Slugs |
|---:|---:|---|
| 1 | 8 | port-everglades, port-miami, royal-beach-club-antigua, santa-marta, south-shetland-islands, sydney-ns, ushuaia, zadar |
| 2–3 | 15 | cochin, gibraltar, guam, harvest-caye, honningsvag, ilhabela, kiel, messina, montreal, okinawa, port-arthur, puerto-montt, tobago, torshavn, trinidad |
| 4–7 | 14 | colombo, doubtful-sound, gatun-lake, genoa, glacier-alley, guadeloupe, hilo, holyhead, isafjordur, jacksonville, kagoshima, salvador, san-diego, trieste |
| 8–12 | 14 | callao, catania, dubrovnik, hakodate, jakarta, manila, muscat, mykonos, ocho-rios, punta-del-este, reykjavik, san-francisco, santorini, sydney |
| 13+ | 2 | hong-kong (18), singapore (16) |

**Headline correction to §4.** Strictly by the validator's count of `<img>` tags, **no port fails IMG-005's 11-image minimum.** Site chrome (logo, author avatar, decorative SVGs) brings every page over the floor even when the gallery itself is sparse. The "no images at all" answer the validator gives today is **zero ports**.

The deficiency the validator does flag is **broken references** — pages whose galleries promise images that don't exist on disk. That's the 53-port list above, and it is what an image-sourcing pass would actually fix. Per-port detail in `admin/audit-reports/2026-05-10-baseline/image-rule-findings.json`.

---

## 6b. Fleet-wide attribution audit (added 2026-05-10 after harness build)

`python3 admin/sourcing.py audit-attr` run across all 387 ports surfaced a much
larger problem than the validator's image-section blockers alone. Detail per
port in `admin/audit-reports/2026-05-10-baseline/fleet-attr-audit.json`.

| Finding | Ports | Files |
|---|---:|---:|
| Attribution JSON with the **Flickr-889 placeholder shape** (`license: "Flickr (verify license)"`, `source_type: "Flickr public feed"`) | **302** | **891** |
| Ports failing the validator's ATTR-003 source-URL-diversity check | 180 | — |

**Implication.** The validator's ATTR-003 check was written to catch the Flickr-889
escape (892 files in spring 2026), but it only fires when 4+ images share 1–2
source URLs. The cleverer pattern that's in production today uses **distinct
source URLs per image but the same placeholder license string** — so 122 ports
have 8 placeholder files apiece with 8 different source URLs and pass ATTR-003
even though their licenses are explicitly marked unverified.

This means **a separate validator rule is needed** for "license string contains
'verify license'" (or alternatively for `source_type == 'Flickr public feed'`).
The harness's `audit-attr` enforces it; the canonical validator does not yet.

**Sourcing implication for this plan.** Phase 1 (reference repair) does not
fix any of these 891 placeholder files — they are a separate, larger problem.
The honest path is a **Phase 1.5** that re-verifies each placeholder license
file by license, and either:

- (a) Confirms the cited Flickr URL is actually CC and rewrites the attr.json
  to the canonical schema, OR
- (b) Confirms the cited Flickr URL is All-Rights-Reserved, deletes both the
  webp and the attr.json, and treats the slot as a sourcing gap.

At ~30 sec per file via `verify-flickr` + Read inspection, 891 files is
roughly 7–10 hours of careful work. **This belongs in the plan and was not
visible in the original §6 baseline because it required the harness to detect.**

---

## 7. Per-tier execution order I propose

Smallest, highest-leverage work first. **None of this is started yet — I am asking for sign-off on the order before touching a port.**

### Phase 0 — Validator-spec note (Tier A — 3 ports)
Update the validator spec or `port-disclaimer-registry.json` so redirect stubs (beijing, falmouth-jamaica, kyoto) are exempted from IMG-005 / IMG-013 if they are not already. **No image work.** Estimated effort: 30 minutes total.

### Phase 1 — Reference repair (the 53 validator `missing_image_file` ports)
This phase touches no image bytes for the cheap cases — it only fixes HTML pointers and renames files where the pixels are already correct. Lowest risk, highest pass-rate gain. Sub-tiered by broken-ref count:

- **1 broken ref (8 ports):** port-everglades, port-miami, royal-beach-club-antigua, santa-marta, south-shetland-islands, sydney-ns, ushuaia, zadar. Most likely a single mistyped path (e.g. `/ports/img/zadar-hero.webp` vs `/ports/img/zadar/zadar-hero.webp`). Per-port effort: 5–15 min. **Bytes-on-disk verification first.**
- **2–3 broken refs (15 ports):** Mostly the same single-path-typo class plus 1–2 missing files that need sourcing. Per port: 15–60 min.
- **4–7 broken refs (14 ports):** Mix of typos and real gaps. Each needs both reference cleanup and 2–4 sourced images.
- **8–12 broken refs (14 ports):** Major sourcing work. Examples called out in §4: punta-del-este (12 refs all 404), callao (1 file on disk), catania (1 file on disk).
- **13+ broken refs (2 ports):** hong-kong (18), singapore (16). These are the heaviest sourcing work in the entire fleet — and they're high-traffic ports, so they're worth doing well.

Estimated effort: 2–4 days of careful work, gallery-by-gallery, including the special cases (punta-del-este naming mismatch, fortaleza external-Wikimedia rewrite, royal-beach-club-cozumel cross-port pointer correction).

### Phase 1.5 — Placeholder-license audit (302 ports, 891 attr.json files)
For each port flagged by `audit-attr`, run `verify-flickr` against the cited
source URL, then either rewrite the attr.json with the canonical schema (real
license confirmed) or delete the file pair (license actually ARR or NC). This
is the work the validator cannot currently catch on its own. Estimated effort:
**7–10 hours sustained**, gated on Flickr availability.

### Phase 2 — Tier D acute sourcing (callao, catania)
Full six-step workflow per port. Each port needs ~10 new sourced images to reach the floor. **Estimated effort: 4–6 hours per port** if Flickr + LoC searches go cleanly; longer if rare ports yield few CC hits.

### Phase 3 — Tier E systematic sourcing (271 ports)
Sort by current image count, ascending. Start with 4-image ports, finish with 10-image ports. Group by region so I can re-use research context across nearby ports without ever sharing image bytes.

| Region (approx) | Likely strongest sources |
|---|---|
| Caribbean | Flickr (CC), Unsplash, NPS for US territories |
| Mediterranean | Flickr (CC), some LoC pre-1928 |
| Northern Europe | Flickr (CC), Unsplash |
| Alaska / Pacific NW | LoC (Harriman, Curtis), USFS Alaska Flickr, USFWS, NPS — strongest source we have |
| Antarctica / Polar | NSF + NOAA Flickr, IAATO operator presser imagery (often CC BY) |
| Asia | Flickr (CC), local tourism boards (verify license) |

This phase is the bulk of the work. Realistic sustained pace, given verification discipline: **8–15 ports per working day** (LoC searches return many hits per query when the subject has Curtis or Detroit Publishing Co. coverage; tropical port pages with no government archive are slower because each photo needs license-by-license verification).

### Phase 4 — Verification sweep
After every port reaches IMG-005 (≥11 images) and IMG-013 (non-empty dir):
- Run `node scripts/batch-validate.js --json` and confirm the image-section blocker count drops to zero.
- Run `node admin/check-image-reuse.cjs` and confirm zero cross-port byte duplicates outside the allowlist.
- Spot-Read 10% of newly-added images at random and confirm they still match their captions.
- Update `admin/PORT_VALIDATION_STATUS.md` with the new baseline.

---

## 7. What I will NOT do

- I will not generate AI images. The site's voice and audience demand real photographs of real places.
- I will not copy an image from one port to another — even for "Caribbean beach" filler. IMG-015 forbids it and it betrays the reader.
- I will not weaken alt text or captions to dodge a validator regex (CLAUDE.md "NEVER GAME THE VALIDATOR" — BLOCKING integrity rule).
- I will not delete any port image directory or `*.attr.json` file without first proving the bytes are placeholders or wrong-subject.
- I will not push to main, will not skip hooks, will not amend commits.

---

## 8. Open questions for the user before I start

1. **Scope.** Should I attempt all four phases, or only Phase 0 + Phase 1 + Phase 2 (the small, high-leverage work) and leave Phase 3 for a future session or a different pipeline?
2. **Tier-A redirects.** Confirm that beijing, falmouth-jamaica, kyoto are intentional redirect stubs and should stay imageless. (I'm 99% sure from reading the source, but I want explicit confirmation before exempting them in any validator change.)
3. **Tier-B/C bytes.** For fortaleza and royal-beach-club-cozumel, do you want me to (a) trust the existing local webp files after Read-verifying them, or (b) re-source from scratch on the assumption they were placeholder-era leftovers?
4. **Pace.** The careful workflow caps useful progress at roughly 8–15 ports per day with verification. Is that acceptable, or would you prefer I batch some of the Phase-3 ports through the multi-LLM pipeline (`/orchestrate cruising`) and then audit the results?
5. **Tooling preference.** Are you OK with me writing a small helper script (e.g., a Python harness around the six-step workflow with built-in attribution-JSON scaffolding) before I touch ports? It would shave time without bypassing any verification step.

I will not start sourcing until these are answered.

---

**Soli Deo Gloria.** Excellence as worship means getting it right, not getting it fast.
