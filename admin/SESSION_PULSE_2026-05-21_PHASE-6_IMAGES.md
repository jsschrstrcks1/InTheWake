# Session Pulse — Phase 6 Image Sourcing (2026-05-21/22)

**Branch:** `claude/source-ship-page-images-nnVkF`
**Working directory:** `/home/user/InTheWake`
**Sibling repo (SSOT):** `/home/user/open-claw-stuff` (equivalent to `/Users/kenbaker/ocs-work` on Ken's machine)

**Soli Deo Gloria.**

---

## Session outcome

- **37 ships** moved from `[images/few_images]` FAIL to PASS `Images: 8`
- **13 partial-progress commits** on Commons-source-limited brand-new ships (Images: 5-7 with 1-2 available Commons photos each)
- **~45 ships** still failing `few_images` — all TBN/unbuilt/future ships or brand-new ships with insufficient Commons content

## Fully-passing ships committed this session (37)

Celebrity Beyond, Edge, Ascent, Flora
Costa Smeralda, Toscana, Firenze, Deliziosa, Fascinosa, Venezia
MSC Poesia, World America
Norwegian Pearl, Sky, Sun, Spirit, Bliss, Encore, Escape, Gem, Aqua
Oceania Marina, Riviera, Nautica, Sirena
Carnival Adventure, Radiance, Venezia
Silversea Silver Ray
Explora Journeys Explora I

## Partial-progress commits (Commons source-limited)

| Ship | Current | Missing | Reason |
|------|---------|---------|--------|
| Carnival Firenze | Images: 5 | -3 | only 2 Carnival-branded Commons photos exist (Costa-era don't apply post-rebrand) |
| Star Princess (2025 Sphere) | Images: 5 | -3 | only 1 Commons photo; legacy 2002 Grand-class Star Princess photos are a different ship |
| Explora II | Images: 6 | -2 | only 1 Commons photo |
| Silver Origin | Images: 7 | -1 | only 1 Commons photo |
| Seven Seas Grandeur | Images: 7 | -1 | only 1 Commons photo |
| Brilliant Lady (Virgin) | Images: 7 | -1 | only 2 Commons photos (both already embedded) |
| Carnival Encounter | Images: 5 | -3 | ex-Pacific Encounter, rebrand too recent for Commons |

## Ships still failing few_images — intractable buckets

**Bucket 1: Unbuilt TBN ships (no photos possible)** — RCL Icon-class TBN 2027, TBN 2028, Oasis-class TBN 2028, Quantum Ultra TBN 2028/2029, Star-class TBN 2028; Celebrity unnamed Edge / Project-Nirvana / River-class-x6; Carnival Project Ace 1/2/3; Carnival Tropicale (2028 build).

**Bucket 2: Future not-yet-in-service ships** — MSC World Asia (Nov 2026 debut); Explora III–VI (2026-2028 rolling); Legend of the Seas 2026 Icon-class.

**Bucket 3: Brand-new ships with 1-2 Commons photos** — Celebrity Xcel, Xperience, Compass, Seeker; Carnival Firenze; Star Princess; Explora II; Seven Seas Grandeur; Silver Origin; Brilliant Lady; Carnival Encounter (all committed as partials above).

## HLS catalog registrations (in `/home/user/open-claw-stuff/.household-library/catalog.jsonl`)

Three new tasks were registered via `node /home/user/open-claw-stuff/admin/library.mjs register` and committed locally to open-claw-stuff at `ff298a5` (push credentials for open-claw-stuff not available in this container — commit is local only).

1. **itw-phase-6-session-2026-05-21-outcome** (P5) — session pulse
2. **itw-phase-6-source-limited-ships-followup** (P3) — retry the 13 source-limited ships when Commons uploads expand
3. **itw-phase-6-tbn-ships-validator-exemption** (P4) — proposal to exempt ships whose `entered_service > current-date` from few_images validator rule (unbuilt ships cannot have photos)

## Cognitive memories encoded (8 in `~/.memory/cruising/` on this container)

| id | type | topic |
|----|------|-------|
| `e257ada0` | pattern | Visual-verification hierarchy (confirmed / consistent / ambiguous / wrong) after SHA-1 |
| `77d95666` | pattern | Six rejection rules (view-FROM-ship, multi-ship, foreground-dominant, cropped-dup, wrong-livery-era, EXIF-rotation) |
| `4d6dd12c` | fact | NCL distinctive hull artwork per ship (Pearl/Gem/Sky/Sun/Escape/Encore/Bliss/Aqua/Spirit) |
| `fda2061e` | fact | Costa→Carnival rebrand livery preservation (yellow C funnel + Fun Italian Style text) |
| `38f2e480` | pattern | Fetcher `--skip-substr` for non-ASCII Commons filenames that stall commonsapi.php |
| `3d32e6ee` | decision | Phase 6 session outcome — 37 PASS, partial-progress ship list |
| `e67aa8e5` | fact | Phase 6 remaining 45 ships intractable buckets |
| `907250d8` | pattern | Owner-provided photo extraction from `/root/.claude/projects/-home-user/*.jsonl` |

---

## Instructions for a subsequent agent with full access

The container this session ran in has push credentials for **InTheWake only** — not for `open-claw-stuff`, and no access to Ken's Mac `/Users/kenbaker/ocs-work`.

To complete the sync, another agent (on Ken's Mac or with open-claw-stuff push access) should:

### 1. Push the HLS catalog commit to open-claw-stuff

```bash
cd /Users/kenbaker/ocs-work   # or wherever open-claw-stuff is checked out
git fetch origin
# If ff298a5 isn't already there, either:
#   (a) recreate the three catalog entries locally by running:
node admin/library.mjs register \
  --title "Phase 6 image sourcing session outcome — 37 ships PASS, ~13 partial (Commons source-limited), 45 remain (unbuilt/TBN)" \
  --repo InTheWake --priority 5 \
  --task-id "itw-phase-6-session-2026-05-21-outcome"

node admin/library.mjs register \
  --title "Re-check Commons for 13 source-limited ships (Carnival Firenze 5/8, Star Princess 5/8, Explora II 6/8, Silver Origin 7/8, Seven Seas Grandeur 7/8, Brilliant Lady 7/8, Celebrity Xcel/Xperience/Compass/Seeker, Carnival Encounter) — currently Commons has 0-2 photos for each, retry when uploads expand" \
  --repo InTheWake --priority 3 \
  --task-id "itw-phase-6-source-limited-ships-followup"

node admin/library.mjs register \
  --title "Skip few_images validator for ~45 TBN/unbuilt/future ships until they enter service — RCL Icon-class TBN 2027/2028, Oasis TBN 2028, Quantum Ultra TBN 2028/2029, Star-class TBN 2028, Celebrity Edge-unnamed/Nirvana/River-class, Carnival Project Ace 1/2/3, Carnival Tropicale 2028, MSC World Asia (Nov 2026 debut), Explora III-VI (2026-2028), Legend of the Seas 2026 Icon-class. Consider validator rule tweak: exempt ships with entered_service > current-date from few_images." \
  --repo InTheWake --priority 4 \
  --task-id "itw-phase-6-tbn-ships-validator-exemption"

git add .household-library/catalog.jsonl .household-library/events.jsonl docs/HOUSEHOLD-TASK-INDEX.md
git commit -m "HLS: register InTheWake Phase 6 image-sourcing session outcomes

Soli Deo Gloria."
git push
```

The `library.mjs register` command is idempotent — if the task_id already exists it will report `duplicate` and skip. Safe to re-run.

### 2. Merge the memories into the canonical memory store

The 8 new memory JSON files sit at `~/.memory/cruising/` in this container's ephemeral filesystem. Their content is captured verbatim in `admin/memory-exports/2026-05-21-phase-6-session/` and in this branch. To recreate on Ken's machine:

```bash
MEMORY_ROOT=/Users/kenbaker/.memory python3 /Users/kenbaker/ocs-work/ken/orchestrator/memory_ops.py \
  encode cruising pattern "..." "session:2026-05-21-InTheWake-phase-6"
```

Or, if the container's `~/.memory/cruising/*.json` files can be exported (they are plain JSON records), copy them into Ken's `~/.memory/cruising/` — the memory system reads any well-formed JSON file in the domain directory.

### 3. Verify

```bash
MEMORY_ROOT=/Users/kenbaker/.memory python3 /Users/kenbaker/ocs-work/ken/orchestrator/memory_ops.py recall "Phase 6 image sourcing" --domain cruising --limit 5
node /Users/kenbaker/ocs-work/admin/library.mjs find "phase-6"
```

Both should return the encoded memories + the three new tasks.

---

**Session commit summary on InTheWake branch `claude/source-ship-page-images-nnVkF`:**
- 30+ individual ship-image commits (one ship per commit, `Images: N` verbatim in subject)
- Merge from `main` at HEAD `dac2fca4` (v3.010.400 template upgrade + HLS pointer + memory tier 3.1)

Soli Deo Gloria.
