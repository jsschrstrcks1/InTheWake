# Memory export — ship-normalization arc (2026-07-11)

**Status:** ✅ **REPLAYED on Mac SSOT** (`/Users/kenbaker/ocs-work/.memory`)  
**Replayed at:** 2026-07-11 ~23:51–23:52Z (first land, patron grok1) · confirmed skynet2 2026-07-12  
**Bus event:** `.household-library/events.jsonl` verify/task `handoff-replay-ship-normalization-arc`  
**Handoff:** `admin/handoffs/2026-07-11-ship-normalization-memory-hls.md`

Container source: thread `claude/review-client-proposal-vILOr` (ship-page standardization v3 / image-reuse-guardrail / careful-not-clever arc, 2026-05-04 → 2026-07-11).

## Contents → SSOT ids (content-deduped, not source-tag-deduped)

Container export ids (e.g. `3503f82e`) are **export-local**. After `memory_ops.encode` the durable SSOT ids are:

| file | SSOT id | domain | type | protected | subject |
|------|---------|--------|------|-----------|---------|
| sna-1.json | `854ee7cc` | ken | preference | ✓ | careful-not-clever, tied to rollback `a5d50054` |
| sna-2.json | `d63ea609` | ken | preference | | "like I'm 5" plain-language idiom |
| sna-3.json | `33919478` | ken | pattern | | adversarial audit: "were you careful or clever?" |
| sna-4.json | `44d95be8` | ken | pattern | | check existing infra before claiming missing |
| sna-5.json | `c38caf0d` | cruising | decision | | guardrail-skill standard (block + identify + tone) |
| sna-6.json | `d2daeeee` | ken | preference | | borderline-rude guardrail output authorized |
| sna-7.json | `eb571b52` | cruising | decision | | symlinks in image trees always blocking |
| sna-8.json | `89f048b3` | cruising | decision | | image dedup = MD5 + dHash, both required |
| sna-9.json | `929dd43a` | ken | pattern | ✓ | AI-integrity failure-mode catalog |
| sna-10.json | `0415994e` | cruising | pattern | | site-wide scope for detectors |
| sna-11.json | `d81cb7c6` | cruising | pattern | ✓ | cross-ship comparison rewrite anti-pattern + fix |
| sna-12.json | `0747b21c` | cruising | pattern | | pre-commit hooks skip merge/rebase state |

sna-1 related_to household careful pattern `2f17c5eb` (link, not supersede).

**Dedup note:** sna-1…10 use `source=mined-from-transcripts:2026-05-13` but are **content-distinct** from the cruise-tipping 9-pack (`bc6ef93a…8f642f51`). Dedup by content only.

## HLS tasks (PART B — registered)

| task_id | P | GitHub |
|---------|---|--------|
| `itw-image-reuse-cleanup` | 2 | https://github.com/jsschrstrcks1/InTheWake/issues/2432 |
| `itw-firenze-venezia-wrong-hull-data` | 3 | https://github.com/jsschrstrcks1/InTheWake/issues/2433 |
| `itw-comparison-swaps-review` | 4 | https://github.com/jsschrstrcks1/InTheWake/issues/2434 |

Mirrors refreshed via `node admin/library.mjs mirrors --repo InTheWake`.

## MEMORY_SESSION_IDs (container)

- sna-1…10: `mining-transcripts-119bf64e-c186-4170-855d-4f450e9d29cf`
- sna-11…12: `session-2026-07-11-ship-normalization`

Replay instructions: `admin/handoffs/2026-07-11-ship-normalization-memory-hls.md`.

*Soli Deo Gloria.*
**Status:** ✅ **REPLAYED** on Mac SSOT — 2026-07-11 (12 new encodes)

Container source: `claude/review-client-proposal-vILOr` at `3facd5cab`

## Dedup mapping (export label → SSOT id)

| file | SSOT id | domain |
|------|---------|--------|
| sna-1.json | `854ee7cc` | ken (linked → `2f17c5eb`) |
| sna-2.json | `d63ea609` | ken |
| sna-3.json | `33919478` | ken |
| sna-4.json | `44d95be8` | ken |
| sna-5.json | `c38caf0d` | cruising |
| sna-6.json | `d2daeeee` | ken |
| sna-7.json | `eb571b52` | cruising |
| sna-8.json | `89f048b3` | cruising |
| sna-9.json | `929dd43a` | ken |
| sna-10.json | `0415994e` | cruising |
| sna-11.json | `d81cb7c6` | cruising |
| sna-12.json | `0747b21c` | cruising |

JSON files preserved as container export artifact. HLS tasks [#2432](https://github.com/jsschrstrcks1/InTheWake/issues/2432)–[#2434](https://github.com/jsschrstrcks1/InTheWake/issues/2434). Replay: `admin/handoffs/2026-07-11-ship-normalization-memory-hls.md`.

*Soli Deo Gloria.*
