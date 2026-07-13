# Memory export — validator evaluation (2026-07-12)

**Status:** ⏳ pending Mac SSOT replay
**Container source:** `claude/fix-costa-fleet-validator-zPpBT`
**Session tag:** `session-2026-07-12-validator-evaluation`

## Contents

| file | domain | type | content summary |
|------|--------|------|-----------------|
| ve-1.json | cruising | fact | validator quirks catalog — 6 regex/logic bugs + 2 UX gaps in `admin/validate-ship-page.sh`, logged as REGEX-04..REGEX-09 + UX-01..UX-02 in `admin/VALIDATOR_REGEX_ISSUES.md` |
| ve-2.json | cruising | pattern | where-to-log validator regex bugs decision matrix (VALIDATOR_REGEX_ISSUES.md is canonical, memory captures meta only) — protected |

Both memories reference existing SSOT ids for `related_to`:

- `2d8a6f10` — cvs-7: rule-level-fix-first ("why didn't the validator catch this?" — Rules #1500-#1506 pattern)
- `76e2c4b9` — cvs-10: canonical validator architecture (validate-ship-page.sh is the shell canonical)

## Dedup pre-check for Mac replayer

```bash
cd /Users/kenbaker/ocs-work
M="python3 ken/orchestrator/memory_ops.py"
$M recall "validator quirks admin validate-ship-page sh regex bug" --domain cruising --limit 8
$M recall "regex collision dodging VALIDATOR_REGEX_ISSUES.md" --domain cruising --limit 8
```

If either recall returns an entry that already captures the meta + reference to the doc, skip that encode. Neither should exist — ve-1 references bugs opened *this session*, and ve-2 codifies a doc-vs-memory split that hasn't been captured as a memory before.

## Replay commands

```bash
cd /Users/kenbaker/ocs-work
MEMORY_SESSION_ID=session-2026-07-12-validator-evaluation \
  python3 ken/orchestrator/memory_ops.py encode cruising fact "$(jq -r .content /path/to/ve-1.json)" \
  --tags "$(jq -r '.tags | join(",")' /path/to/ve-1.json)" \
  --source "session:2026-07-12-validator-evaluation" \
  --related 2d8a6f10 --related 76e2c4b9

MEMORY_SESSION_ID=session-2026-07-12-validator-evaluation \
  python3 ken/orchestrator/memory_ops.py encode cruising pattern "$(jq -r .content /path/to/ve-2.json)" \
  --tags "$(jq -r '.tags | join(",")' /path/to/ve-2.json)" \
  --source "session:2026-07-12-validator-evaluation" \
  --related 2d8a6f10 --protected
```

Or use the loop-from-JSON pattern in `admin/handoffs/2026-07-11-ship-normalization-memory-hls.md` — same shape.

*Soli Deo Gloria.*
