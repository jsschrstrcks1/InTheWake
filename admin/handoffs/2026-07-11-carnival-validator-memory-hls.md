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
**Author:** Container session on `claude/fix-carnival-validator-kLrEV` (mined 2026-05-13 transcripts, exported 2026-07-11)  
**Replayed by:** grok1 on Mac (`/Users/kenbaker/ocs-work`)  
**Status:** ✅ **REPLAYED** on Mac SSOT — 2026-07-11

**Container blocker:** `open-claw-stuff` not a sibling in container; memories parked in-repo. Branch pushed to `origin/claude/fix-carnival-validator-kLrEV` (commit `8702ca58`).

---

## PART A — Memories (✅ dedup-replay, 0 new encodes)

Dedup recall pass found all 10 export entries already present in SSOT from session `740adc22` (verified, protected). **No duplicate encodes** — graph links strengthened instead.

| export | SSOT id | action |
|--------|---------|--------|
| cvs-1 | `a1f4c2d8` | dedup-skip (symlink ban #1500/#1501) |
| cvs-2 | `b3e7591a` | dedup-skip (photo-honesty warnings #1502–#1506) |
| cvs-3 | `c8d2046f` | dedup-skip (open-image-before-deciding) |
| cvs-4 | `2f17c5eb` | dedup-skip (careful-or-clever spot-audit, domain: shared) |
| cvs-5 | `e0a76d54` | dedup-skip (Wikimedia container block) |
| cvs-6 | `9b1e5c08` | dedup-skip (unique-images / placeholder policy) |
| cvs-7 | `2d8a6f10` | dedup-skip (rule-level-fix-first) |
| cvs-8 | `57c93ae2` | dedup-skip (photography-sourcing chain) |
| cvs-9 | `11f0b8d7` | dedup-skip (per-ship Read+Edit only) |
| cvs-10 | `76e2c4b9` | dedup-skip (canonical validator architecture) |

Cross-links added: validator cluster (`a1f4c2d8`↔`b3e7591a`↔`2d8a6f10`↔`76e2c4b9`), image-honesty chain (`c8d2046f`↔`9b1e5c08`), careful-not-clever bridge (`2f17c5eb`↔`11f0b8d7`↔`e4ce7a5f`↔`9ac2e3a3`↔`dd94a307`), sourcing (`e0a76d54`↔`57c93ae2`).

Export dropped at container time: duplicate of `9ac2e3a3` (post-merge audit gate) — confirmed still dedup-skip.

---

## PART B — HLS tasks (✅ registered)

| task_id | P | GitHub |
|---------|---|--------|
| `itw-placeholder-ship-photography` | 2 | [#2424](https://github.com/jsschrstrcks1/InTheWake/issues/2424) — 26 ships; overlaps `itw-phase-6-source-limited-ships-followup` (#2401) on carnival-encounter + celebrity-xperience |
| `itw-fleet-normalization-15-lines` | 2 | [#2425](https://github.com/jsschrstrcks1/InTheWake/issues/2425) — regenerate dashboard via `node admin/aggregate-ship-validation.js` before trusting fleet numbers |

Mirrors: `node admin/library.mjs mirrors --repo InTheWake`

### 26-ship placeholder list (P2 photography task)

- carnival: carnival-encounter, carnival-fantasy
- celebrity: celebrity-century, celebrity-xperience, celebrity-xploration, horizon, zenith
- HAL (19): amsterdam, koningsdam, maartensdijk, nieuw-amsterdam-iii, nieuw-statendam, noordam-ii, noordam-iii, p-caland, prinsendam-i, prinsendam-ii, rijndam-ii, rotterdam, statendam, statendam-ii, veendam-ii, veendam-iv, volendam-ii, w-a-scholten, westerdam-i

---

## PART C — Explicitly NOT registered (verified stale)

Princess/RCL fleet remediation from 2026-05-13 session notes — **already resolved** (dashboard `sh_errors_total: 0`; sapphire-princess and explorer-of-the-seas spot-checks pass). Container caught this by re-running validator, not trusting session notes.

---

*Soli Deo Gloria.*
