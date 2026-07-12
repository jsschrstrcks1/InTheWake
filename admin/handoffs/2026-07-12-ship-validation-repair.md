# Ship validation repair handoff — 2026-07-12 (GHelh)

**Status:** Mac **PARTIAL REPLAY** (skynet2) — full container handoff tip never on origin.

**Container claim:** `claude/review-homepage-suggestions-GHelh` commits `08296690e` / `8b31654c5` with M1–M7 encode loops + 3 HLS shelve cmds. **Not on GitHub** (2026-07-12).

## Live Mac facts (verified)

- `data/validated-ships.json` `_meta`: **225 / 289 pass (78%)**, generated `2026-03-25T17:32:28Z` (matches sibling-bus report).
- Symlink / partial-name fix path and image-reuse cleanup already tracked as **HLS `itw-image-reuse-cleanup`** (P2).

## Memories landed (SSOT)

| Tag | SSOT id |
|-----|---------|
| M6-class: no partial-name cross-ship image symlink | **`b5ee0566`** |
| Pass-rate observation 225/289 | **`9e294224`** |
| Unpushed GHelh handoff gap | **`d97d2c83`** |

Remaining M1–M5 / M7 from unpushed table: **blocked** until handoff body recovered.

## HLS

| Task | Notes |
|------|--------|
| `itw-image-reuse-cleanup` | Pre-existing P2 — primary remediation for M6 |
| `itw-ship-validation-revalidate-after-symlink-audit` | Re-run batch validate after bad symlink purge |
| `itw-ghelh-handoff-extract` | Recover full M1–M7 encode file from container |

*Soli Deo Gloria.*
