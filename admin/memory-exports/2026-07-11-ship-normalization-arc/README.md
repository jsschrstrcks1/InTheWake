# Memory export — ship-normalization arc (2026-07-11)

**Status:** ⏳ **PENDING Mac replay** — not yet on SSOT.

Container source: thread `claude/review-client-proposal-vILOr` (the ship-page
standardization v3 / image-reuse-guardrail / careful-not-clever arc,
2026-05-04 → 2026-07-11).

## Contents

| file | id | domain | type | protected | subject |
|------|----|--------|------|-----------|---------|
| sna-1.json | `3503f82e` | ken | preference | ✓ | careful-not-clever, tied to rollback `a5d50054` |
| sna-2.json | `7dc358c6` | ken | preference | | "like I'm 5" plain-language idiom |
| sna-3.json | `69fc7166` | ken | pattern | | adversarial audit: "were you careful or clever?" |
| sna-4.json | `15eeb512` | ken | pattern | | check existing infra before claiming missing |
| sna-5.json | `6c510d90` | cruising | decision | | guardrail-skill standard (block + identify + tone) |
| sna-6.json | `61f04b07` | ken | preference | | borderline-rude guardrail output authorized |
| sna-7.json | `67ddb9a0` | cruising | decision | | symlinks in image trees always blocking |
| sna-8.json | `9aae3373` | cruising | decision | | image dedup = MD5 + dHash, both required |
| sna-9.json | `0ce4b2c2` | ken | pattern | ✓ | AI-integrity failure-mode catalog (A–T) |
| sna-10.json | `2887e0f0` | cruising | pattern | | site-wide scope for detectors |
| sna-11.json | `b4c81f2e` | cruising | pattern | ✓ | cross-ship comparison rewrite anti-pattern + fix |
| sna-12.json | `a91d3c47` | cruising | pattern | | pre-commit hooks skip merge/rebase state |

sna-1 … sna-10: `source=mined-from-transcripts:2026-05-13` (this thread's
mining run — **distinct from** the 9-entry set with the same source tag
already replayed via `2026-07-11-cruise-tipping-audit/`; those cover
tipping/article content, these cover integrity/image-reuse. Dedup by
content, not by source tag).

sna-11 … sna-12: `source=container:cruising:claude/review-client-proposal-vILOr:2026-07-11`
(session encodes from the post-mining work).

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
