# Handoff — Validator evaluation: quirks catalog + 2 memories + 1 HLS task

**Author:** Claude Code (remote container, branch `claude/fix-costa-fleet-validator-zPpBT`, 2026-07-12)
**For:** Mac SSOT agent at `/Users/kenbaker/ocs-work`
**Status:** ⏳ pending Mac replay

---

## Why this handoff exists (container reality)

Container `/home/user/` at time of writing:

```
InTheWake        ✓ present, HEAD = origin/main (66bf1d1b)
ken              ✓ present, but `git fetch origin` fails ("could not read Username")
open-claw-stuff  ✗ not mounted
```

`MEMORY_ROOT` resolves to `/root/.memory` (empty, transient). Per the stop-rule from `admin/handoffs/2026-07-11-site-scan-fixes-memory-mining.md` and the persistence check in ve-1: nothing was encoded to the transient root. The sibling bus (`.household-library/events.jsonl`) and HLS catalog are unreachable. Everything below is the replay payload.

Prior context: this thread was doing costa-fleet validator work; the operator asked me last turn to "evaluate the validator". That produced a bugs/quirks catalog. This handoff captures the catalog in the two canonical places (the repo doc + memory) and registers the refactor task in HLS.

---

## PART A — In-repo commit (already made in this branch)

**File updated:** `admin/VALIDATOR_REGEX_ISSUES.md` — 6 new open issues + 2 UX gaps.

| id | line | subject |
|----|------|---------|
| REGEX-04 | ~565 | #1320 TBD-field sed slice bleeds past JSON boundary when `"registry"` missing |
| REGEX-05 | ~1819 | grammar check `\b[Aa] [AEIOU][a-z]` false-positives on yu-sound vowels |
| REGEX-06 | ~1303–1316 | superlative check requires 20[0-9]{2} or "as of" after superlative — 21st-century-biased |
| REGEX-07 | ~1092 | gross-tonnage check requires `gross tons` or `GT`, "gross tonnage" alone fails |
| REGEX-08 | ~567–586 | carousel-slide check uses `grep -c` (line count) — undercounts collapsed `</div></div>` |
| REGEX-09 | ~762–775, 1322–1338 | retired-ship detection is magic-phrase-based AND conflicts with the site-name leak check |
| UX-01 | — | no `--json` output mode |
| UX-02 | — | no `--only <id>` filter |

No page rewords owed — these came from a code-reading evaluation pass, not from specific page misfires. The doc is the canonical catalog; agents fixing the regexes should delete-and-move-to-Closed as they land fixes.

---

## PART B — Replay 2 memories

Export JSONs at `admin/memory-exports/2026-07-12-validator-evaluation/`:

| file | domain | type | protected | related_to |
|------|--------|------|-----------|------------|
| ve-1.json | cruising | fact | no | `2d8a6f10`, `76e2c4b9` |
| ve-2.json | cruising | pattern | **yes** | `2d8a6f10` |

**Dedup pre-check first** (both should be misses, but confirm):

```bash
cd /Users/kenbaker/ocs-work
M="python3 ken/orchestrator/memory_ops.py"
$M recall "validator quirks admin validate-ship-page sh regex bug" --domain cruising --limit 8
$M recall "regex collision dodging VALIDATOR_REGEX_ISSUES canonical log" --domain cruising --limit 8
```

If dedup-hit on either, skip that encode; if partial overlap, add `--related` to the existing id.

**Encode loop** (same shape as `2026-07-11-ship-normalization-memory-hls.md`):

```bash
cd /Users/kenbaker/ocs-work
export MEMORY_SESSION_ID=session-2026-07-12-validator-evaluation
for f in /path/to/InTheWake/admin/memory-exports/2026-07-12-validator-evaluation/ve-*.json; do
  python3 - "$f" <<'PY'
import json, sys, os
sys.path.insert(0, 'ken/orchestrator')
m = json.load(open(sys.argv[1]))
import memory_ops
new = memory_ops.encode(
    m['content'], domain=m['domain'], memory_type=m['type'],
    source=m['source'], confidence=m['confidence'],
    tags=m['tags'], related_to=m.get('related_to', []),
    protected=m['protected'])
print(sys.argv[1].split('/')[-1], '→ encoded as', new['id'])
PY
done
```

Then update the export README's status to REPLAYED with real SSOT ids and commit to InTheWake.

---

## PART C — HLS task to register

One open work item — the actual refactor pass on the validator regex/logic bugs. Not currently in `admin/UNFINISHED_TASKS.md`:

```bash
cd /Users/kenbaker/ocs-work
node admin/library.mjs register \
  --title "Validator quirk refactor pass on admin/validate-ship-page.sh — fix REGEX-04..REGEX-09 (JSON-boundary sed leak, yu-sound grammar false-positives, 21st-century-biased superlative check, gross-tonnage token pickiness, line-count vs occurrence-count in carousel checks, magic-phrase retired-ship detection conflicting with site-name-leak check) and land UX-01 (--json output) + UX-02 (--only <id> filter). Catalog: admin/VALIDATOR_REGEX_ISSUES.md. Delete-and-move-to-Closed as each lands; re-run aggregator (admin/aggregate-ship-validation.js) after each fix to confirm no regressions." \
  --repo InTheWake --priority 3 --task-id itw-validator-quirk-refactor \
  --tags validator,regex,refactor,inthewake,session-2026-07-12 \
  --sources "handoff:admin/handoffs/2026-07-12-validator-evaluation.md,doc:admin/VALIDATOR_REGEX_ISSUES.md"

node admin/library.mjs mirrors --repo InTheWake
```

Post an event to the sibling bus (`.household-library/events.jsonl`) if that's convention — this container hasn't seen its schema, so I'm deliberately not guessing an event format here (same restraint as the ship-normalization handoff).

---

## PART D — Session facts (context for the replayer)

- **This branch's shipped work** (all on origin as of this commit):
  - `admin/VALIDATOR_REGEX_ISSUES.md` update — 6 open + 2 UX gaps
  - `admin/memory-exports/2026-07-12-validator-evaluation/` — 2 JSONs + README
  - `admin/handoffs/2026-07-12-validator-evaluation.md` — this file
- **What's NOT in this handoff**: last turn produced a 16-memory mining candidate list from the 2026-05-13 InTheWake transcripts. Cross-check against `admin/handoffs/2026-07-11-site-scan-fixes-memory-mining.md` (already replayed) and `admin/memory-exports/2026-07-11-cruise-tipping-audit/mined-operator-directives-2026-05-13.json` (9 protected entries already on SSOT) — the 16 candidates almost entirely overlap. If the operator wants me to re-mine and cross-check the 16 individually against SSOT, that's a separate session.
- **What's NOT known**: whether the "Carnival fleet 102 remaining errors" flagged in the prior compaction summary is still open. The 2026-07-11 carnival-validator replay reported `sh_errors_total: 0` on the dashboard after Princess/RCL work. Recommend re-running `admin/aggregate-ship-validation.js` on Mac side and only registering a follow-up task if the number is nonzero — do NOT trust the pre-compaction claim.

*Soli Deo Gloria.*
