# Memory export — Validator evaluation (2026-07-12)

**Status:** ✅ **REPLAYED on Mac SSOT** (`/Users/kenbaker/ocs-work/.memory/cruising/`)  
**Replayed by:** skynet2 (2026-07-12)  
**Branch:** `claude/fix-costa-fleet-validator-zPpBT`  
**Session tag:** `session-2026-07-12-validator-evaluation`

## Candidates → SSOT

| file | SSOT id | domain | type | protected |
|------|---------|--------|------|-----------|
| ve-1.json | **`45fabe6a`** | cruising | fact | no |
| ve-2.json | **`9317095f`** | cruising | pattern | yes |

related_to preserved: ve-1 → `2d8a6f10`, `76e2c4b9`; ve-2 → `2d8a6f10`.

## HLS

| task_id | P | issue |
|---------|---|--------|
| `itw-validator-quirk-refactor` | 3 | https://github.com/jsschrstrcks1/InTheWake/issues/2440 |

## PART A (repo doc)

`admin/VALIDATOR_REGEX_ISSUES.md` REGEX-04..09 + UX-01/02 lives on this branch — merge with PR when ready. Not duplicated into SSOT beyond ve-1 fact summary.

## PART D note

Carnival fleet "102 errors" claim intentionally **not** turned into a new HLS task; re-run `admin/aggregate-ship-validation.js` before registering.

Bus: `handoff-replay-validator-evaluation-2026-07-12` (skynet2).

*Soli Deo Gloria.*
