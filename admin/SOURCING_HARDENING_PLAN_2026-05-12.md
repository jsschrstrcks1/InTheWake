# Sourcing Hardening Plan — 2026-05-12

**Author:** Claude (self-audit, session: claude/baseline-port-validation-Nbcst)
**Trigger:** User asked "Have you been careful or clever?" after 13 commits of port-image sourcing. The honest answer named five drifts. This plan addresses each.

*Soli Deo Gloria — excellence as worship means getting it right, not getting it fast.*

---

## The five drifts (named, not minimized)

| # | Drift | Where it happened | What was clever |
|---:|---|---|---|
| 1 | Incomplete per-port file audit | south-shetland-islands hero replacement | Found one wrong-subject file, Read 2 of the other 11, concluded the rest were "probably fine" because audit-attr showed source diversity. **Source diversity ≠ subject correctness.** |
| 2 | Soft "verified" claims | zadar inventory | Called zadar-1 (apartment-tower marina) and zadar-7 (Croatian road sign with "Zadar" written on it) "real Zadar photos." Neither was a positive geographic identification — just "looks plausible." |
| 3 | Image-reuse claim by visual judgment alone | callao #5 (Soly Moses coast) vs #10 (Willian Justen skyline) | Argued they were "complementary, not duplicate" on visual judgment alone. Did not `md5sum`, did not run `node admin/check-image-reuse.cjs`, did not consult `admin/cross-port-image-allowlist.json`. Strings, not bytes. |
| 4 | "Trusted source" short-circuit | David Stanley framing | Started phrasing his account as a "trusted source" after one good result. The harness still ran `verify-flickr` each time — but the language and framing eroded the discipline. No source is trusted on prior history. |
| 5 | WebFetch as a string proxy for the image URL | URL-extraction step at every Flickr fetch | The harness's `verify-flickr` curl-fetches the page and parses the HTML directly. The URL-extraction step (size-`/l/` page) used WebFetch — which is the model summarizing HTML it read. Small attack surface, but the byte-level guarantee was missing. |

---

## The hardening rules — going forward

### Rule A — Audit every file in a port directory, not just the broken-ref file
When a wrong-subject or placeholder image is discovered in a port image directory, **all files in that directory must be Read-verified before the per-port repair is declared complete**. The session that produced the wrong file likely made similar mistakes on the others. Diversity of source URLs does not measure subject correctness.

**Implementation:**
- New harness command: `python3 admin/sourcing.py audit-port-images <slug>` — prints each file path so the agent can Read-verify in sequence, then captures a per-file verdict (correct / wrong-subject / placeholder / unclear) into `admin/audit-reports/port-image-audits/<slug>-<date>.md`.
- The verdict file is the audit trail. A port repair is not "done" until every file has a recorded verdict.

### Rule B — "Verified" means positive identification, not "looks plausible"
A "verified" image must cite the specific visible identifier that proves the subject:
- Text in the image (a sign, a logo, a building plaque)
- A recognizable landmark with distinctive geometry (Cathedral of Lima towers, Les Éclaireurs Lighthouse's red-and-white stripes)
- A scene confirmed via reverse-image search or photographer's caption

"Architecture looks like the destination" is not verification; it is `[UNCLEAR]`. Use the `[UNCLEAR]` marker per `admin/CAREFUL.md` rather than a soft assertion.

**Implementation:**
- The attr.json `description` field must reference the visible identifier. "Tall apartment building with marina" is not enough; "Jazine harbor apartment block visible behind the marina, identified by the green-shuttered fenestration pattern characteristic of post-1960 Zadar coastal housing — geographic match suggestive but not confirmed; flagged as `[UNCLEAR]`" is honest.
- For files where I cannot positively ID the subject, the attr.json carries `"subject_verified": "unclear"` plus a note explaining what's known and what isn't.

### Rule C — Cross-port reuse and intra-page similarity are byte-level checks, not visual judgments
When two images in the same gallery occupy similar slots (two clifftop views, two harbor shots, two food images), the byte-level check is mandatory before declaring them complementary:

1. `md5sum <file>` on both
2. `node admin/check-image-reuse.cjs` for cross-port reuse
3. Cross-reference against `admin/cross-port-image-allowlist.json`
4. If the files share a perceptual hash (`pHash`), even with different bytes, that's a warning

**Implementation:**
- New harness command: `python3 admin/sourcing.py reuse-check <slug>` — runs all four checks for one port and prints a report.
- The validator's existing `validateImageReuse` (in `admin/validate-port-page-v2.js`) covers most of this; my repair adds the explicit step to the per-image workflow.

### Rule D — No source is "trusted" on prior history
The phrase "trusted source" does not appear in commit messages or per-image notes. Every photo runs through `verify-flickr` or `verify-loc` individually; the verdict is cited explicitly in the commit message. Spot-check policy: every 5 commits from the same photographer, Read 1 other photo from their feed at random and confirm the subject matches the photographer's claimed pattern. If it doesn't, deprecate that photographer as a source.

**Implementation:**
- Commit message standard tightens: must cite the verify-flickr `verdict: OK` line plus the photographer name AND the spot-check status if applicable.
- A `admin/sourced-photographers-log.json` records every photographer-source combination used, with a spot-check column.

### Rule E — WebFetch is a string proxy; bytes always follow
Whenever WebFetch is used to extract a direct image URL:

1. WebFetch the photo page (string check is acceptable here — we're parsing license metadata)
2. **`sourcing.py fetch` the candidate URL** — uses `--http1.1 --fail`, runs Pillow load
3. **Read the downloaded file** — visual confirmation
4. **`md5sum` the file** — register the hash
5. **`sourcing.py register`** — write the hash + source URL + slug to `admin/sourced-images-registry.json`; the registry refuses duplicates outside the cross-port allowlist
6. Continue with convert / attr / HTML / validate

**Implementation:**
- New harness command: `python3 admin/sourcing.py register <file> --slug=<slug> --source=<url>` — hashes, checks for cross-port duplication, writes to the registry.
- The `convert` command optionally takes `--require-registered` and refuses to convert if the source jpg isn't in the registry. (Opt-in for now; will become default after Phase 1 finishes.)

---

## The repairs — executed in this session

For each drift, a concrete repair is performed:

### Repair 1 — Read all 9 unaudited south-shetland-islands files
The 9 files I didn't Read in the prior commit. Per-file verdict recorded in `admin/audit-reports/port-image-audits/south-shetland-islands-2026-05-12.md`. Any wrong-subject files get separate replacement commits.

### Repair 2 — Re-verify zadar-1 and zadar-7 honestly
Either positively identify each via visible landmarks / signs (then the attribution gets the citation) or downgrade their attr.json to `subject_verified: unclear` and flag in `admin/UNFINISHED_TASKS.md`.

### Repair 3 — Hash + reuse-check the callao images
`md5sum` on all 13 sourced images. Run `node admin/check-image-reuse.cjs`. Report results. If #5 and #10 are byte-distinct AND visually distinct AND not flagged by the validator, claim stands. Otherwise replace one.

### Repair 4 — Spot-check David Stanley's account
Random-pick 3 other David Stanley photos. `verify-flickr` each. Read each. Confirm subject matches the photographer's claimed pattern (i.e., he photographs what his titles say he photographs). If all 3 match, no action needed but the spot-check is recorded. If 1 of 3 misses, deprecate.

### Repair 5 — Register all 13 sourced images
Backfill registry entries for callao #1–#10, ushuaia-beagle-channel, zadar-hero, south-shetland-islands-hero. Hashes, source URLs, slugs, photographers, verify-* verdict timestamps. The registry is the durable byte-level record.

---

## Files this plan creates or modifies

- **New:** `admin/SOURCING_HARDENING_PLAN_2026-05-12.md` (this file)
- **New:** `admin/sourced-images-registry.json` (per-image byte-level record)
- **New:** `admin/audit-reports/port-image-audits/<slug>-2026-05-12.md` (per-port audit trail)
- **Modified:** `admin/sourcing.py` — adds `audit-port-images`, `reuse-check`, `register` subcommands
- **Modified:** `admin/IMAGE_SOURCING_WORKFLOW.md` — references the five rules
- **Modified:** `admin/CAREFUL.md` — Session Learnings Log gets a 2026-05-12 entry

---

*Soli Deo Gloria.* Excellence as worship means catching the next clever drift before it ships, not the last one after it does.
