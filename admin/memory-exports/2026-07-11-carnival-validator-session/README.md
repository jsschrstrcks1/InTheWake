# Memory export — carnival-validator session mining (2026-07-11)

**Status:** ⏳ **PENDING REPLAY** — not yet encoded to Mac SSOT.

Session source: `container:cruising:claude/fix-carnival-validator-kLrEV:2026-05-13`
(the symlink-purge / image-honesty / validator #1500–#1506 session; transcript
`740adc22-df3a-48d3-b30e-f1f6e64e51ab.jsonl`, 33 unique operator prompts mined).

Replay instructions: `admin/handoffs/2026-07-11-carnival-validator-memory-hls.md`

## Batch (10 files)

| export | id | type | protected | subject |
|--------|----|------|-----------|---------|
| cvs-1 | `8d61c098` | decision | yes | Symlink ban site-wide — blocking rule #1500/#1501 |
| cvs-2 | `6be71599` | preference | yes | All photo scans in validator as warnings #1502–#1506 |
| cvs-3 | `c1169f54` | pattern | yes | Open the image before attribution decisions |
| cvs-4 | `d4da0e54` | pattern | yes | "Careful or clever?" spot-audit (domain: shared) |
| cvs-5 | `dba3d7ce` | fact | no | Wikimedia hostname-blocked from web containers |
| cvs-6 | `1283f71c` | preference | no | Unique images per ship; honest placeholder policy |
| cvs-7 | `da3c4437` | pattern | yes | Rule-level fix before instance-level fix |
| cvs-8 | `f40ed27e` | decision | no | Photography sourcing chain + scope discipline |
| cvs-9 | `6317eb4d` | pattern | yes | Per-ship Read+Edit only, no bulk HTML scripts |
| cvs-10 | `d21af256` | fact | yes | Canonical validator + scanner architecture |

## Dedup notes

- Checked against `2026-07-11-cruise-tipping-audit/` (9 ctc-audit + 9 mined
  entries). No subject overlap except the post-merge audit gate — a candidate
  duplicating `9ac2e3a3` was **dropped** from this batch rather than re-encoded.
- Cross-links seeded to existing SSOT ids: cvs-4 → `e4ce7a5f`, `9ac2e3a3`;
  cvs-9 → `dd94a307`.

## Verify after replay

```bash
python3 ken/orchestrator/memory_ops.py recall "symlink blocking error validator" --domain cruising --limit 5
python3 ken/orchestrator/memory_ops.py recall "open the image before deciding attribution" --domain cruising --limit 5
```

*Soli Deo Gloria.*
