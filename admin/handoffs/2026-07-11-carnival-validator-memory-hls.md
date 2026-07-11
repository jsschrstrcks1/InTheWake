# Handoff — Carnival-validator session: memory replay + HLS registration

**Author:** Container session on `claude/fix-carnival-validator-kLrEV` (mined 2026-05-13 transcripts, exported 2026-07-11)
**Status:** ⏳ **PENDING REPLAY** — needs a Mac-side agent with `ocs-work` access
**Container blocker:** `open-claw-stuff` is not a sibling repo in this container and is outside the
session's GitHub scope, so `memory_ops._resolve_memory_root()` falls back to ephemeral `~/.memory`.
The HLS catalog (`.household-library/catalog.jsonl`) and sibling bus (`.household-library/events.jsonl`)
are likewise Mac-only. Everything below is parked in-repo for replay.

---

## PART A — Memories to encode (10 entries)

Files: `admin/memory-exports/2026-07-11-carnival-validator-session/cvs-{1..10}.json`
(README in the same directory has the id/type/protected table and dedup notes.)

Replay on the Mac SSOT:

```bash
cd /Users/kenbaker/ocs-work            # MEMORY_ROOT resolves to ocs-work/.memory
for f in <inthewake>/admin/memory-exports/2026-07-11-carnival-validator-session/cvs-*.json; do
  # encode each via memory_ops (respect the admission pipeline — do NOT bypass
  # by copying files raw if SOPHOS_MEMORY_AI_ADMISSION is on):
  python3 ken/orchestrator/memory_ops.py encode cruising <type> "<content>" --tags <tags> [--protected]
done
```

Notes for the replayer:

- `cvs-4` goes to domain **shared**, not cruising (cross-repo behavioral pattern).
- Preserve the seeded `related_to` links, including cross-links to existing SSOT
  ids `e4ce7a5f`, `9ac2e3a3`, `dd94a307`.
- Per promotion policy, mined-from-transcripts entries are **provisional** — do
  not bulk-promote to verified.
- A duplicate of `9ac2e3a3` (post-merge audit gate) was already dropped at
  export time; re-run your own dedup pass regardless
  (`memory_ops.py recall "<subject>" --domain cruising`) before encoding.
- After replay: flip this file's Status and the batch README to ✅ REPLAYED,
  record encoded ids if they differ, and regenerate mirrors.

## PART B — HLS tasks to register (2 new)

Register in `.household-library/catalog.jsonl` via `library.mjs`, then
`node admin/library.mjs mirrors --repo InTheWake`.

### 1. `itw-placeholder-ship-photography` (P2)

Source authentic photography for the **26 real (non-TBN) ships** whose pages
carry only the honest `/assets/ship-map.png` placeholder (verified against the
working tree 2026-07-11; count dropped from ~34 as main merged photo work):

- carnival: carnival-encounter, carnival-fantasy
- celebrity: celebrity-century, celebrity-xperience, celebrity-xploration, horizon, zenith
- HAL (19 — mostly historical vessels; expect archive/public-domain sources
  rather than Commons ship-spotting photos): amsterdam, koningsdam,
  maartensdijk, nieuw-amsterdam-iii, nieuw-statendam, noordam-ii, noordam-iii,
  p-caland, prinsendam-i, prinsendam-ii, rijndam-ii, rotterdam, statendam,
  statendam-ii, veendam-ii, veendam-iv, volendam-ii, w-a-scholten, westerdam-i

Constraints: Wikimedia is hostname-blocked from web containers (cvs-5) — run
Mac-side. Follow the documented chain (cvs-8):
`admin/SHIP_IMAGES_WIKIMEDIA_COMMONS.md` → `admin/fetch-wiki-ship-images.py` →
`admin/update-ship-pages-with-wiki-images.js` (scoped to these slugs only) →
`admin/IMAGE_ATTRIBUTION_TRACKING.md`. Overlaps partially with existing task
`itw-phase-6-source-limited-ships-followup` (carnival-encounter,
celebrity-xperience appear in both) — reconcile at registration.

### 2. `itw-fleet-normalization-15-lines` (P2)

The operator asked for (and received, in chat 2026-05-13) a fresh-thread prompt
to "normalize all 15 cruise lines." If that thread never ran, this task carries
the scope. Essentials of the delivered prompt:

1. Read order: `CLAUDE.md` (household pointer chain), careful-not-clever skill,
   `admin/claude/PASTORAL_GUARDRAILS.md`, `admin/validate-ship-page.sh`.
2. Confirm with the operator **which sense of "normalize"** before editing.
3. Verify current state first: `bash admin/validate-ship-page.sh <page>` spot
   checks + `audit-reports/ship-validation-dashboard.json` (baseline dated
   2026-05-12 — regenerate via `node admin/aggregate-ship-validation.js`).
4. Methodology (hard-won, see cvs-3/8/9): open images before attribution
   calls; per-ship Read+Edit only; scope batch tooling; expect the pre-commit
   chain to block byte-equal reuse.
5. Validator rules added on this branch: #1500 symlink block, #1501
   filename-slug, #1502 byte-equal warn, #1503 perceptual warn, #1504–#1506
   image-count thresholds.

## PART C — Explicitly NOT registered (verified stale)

- ~~Princess fleet remediation (~148 errors)~~ and ~~RCL fleet remediation
  (~66 errors)~~ from the 2026-05-13 session notes: **already resolved** —
  dashboard shows `sh_errors_total: 0` across 290 pages, and 2026-07-11 spot
  checks of `sapphire-princess` and `explorer-of-the-seas` pass with warnings
  only. Do not register.

---

*Soli Deo Gloria.*
