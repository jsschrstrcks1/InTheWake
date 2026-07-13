# Handoff — Ship-normalization arc: memories + HLS tasks

**Author:** Claude Code (remote container, branch `claude/review-client-proposal-vILOr`, 2026-07-11)
**For:** Mac SSOT agent at `/Users/kenbaker/ocs-work`
**Mac replay (grok1):** ✅ **EXECUTED** 2026-07-11 — 12 memories encoded; HLS #2432–#2434 registered

## Why this handoff exists (container reality)

Container `/home/user/` at time of writing:
```
InTheWake        ✓ present, fetch OK; push via GitHub MCP only (no credential proxy)
ken              ✓ present; memory_ops.py HAS the _resolve_memory_root() sibling fix
open-claw-stuff  ✗ not mounted
```

`MEMORY_ROOT` resolves to `/root/.memory` (empty, transient) because the
sibling `open-claw-stuff/.memory/` doesn't exist on disk. Per the stop-rule
(M7 in `2026-07-11-site-scan-fixes-memory-mining.md`): nothing was encoded
to the transient root. The sibling bus (`.household-library/events.jsonl`)
and HLS catalog are equally unreachable. Everything below is the replay
payload.

This thread is the **ship-page standardization v3 arc**: v3 plan authoring,
B1 batch normalization + rollback ("careful not clever"), image-reuse-guardrail
skill + scanners + hooks, AI_INTEGRITY_HAZARDS catalog, symlink triage,
Phase 3.1 cross-ship-comparison revert + validator/repair-script hardening.

---

## PART A — Replay 12 memories

Export JSONs: `admin/memory-exports/2026-07-11-ship-normalization-arc/sna-{1..12}.json`
(full content + tags + confidence in each file).

### Dedup warning (important)

sna-1…sna-10 carry `source=mined-from-transcripts:2026-05-13`. A **different**
9-entry set with the **same source tag** is already on SSOT (replayed via
`admin/memory-exports/2026-07-11-cruise-tipping-audit/mined-operator-directives-2026-05-13.json`,
ids `bc6ef93a 14ad7829 2b89a833 7f0df2b6 dd94a307 9ac2e3a3 e0cbb962 07f45487 8f642f51`).
Those cover tipping/article-content rules; these cover integrity/image-reuse.
**Dedup by content, not by source tag.** Recall-check first:

```bash
cd /Users/kenbaker/ocs-work
M="python3 ken/orchestrator/memory_ops.py"
$M recall "careful not clever rollback canonical guest count" --limit 8
$M recall "image reuse guardrail symlink dhash md5" --domain cruising --limit 8
$M recall "AI integrity failure modes catalog" --limit 8
$M recall "cross-ship comparison rewrite" --domain cruising --limit 8
```

Likely partial overlap: a generic "careful, not clever" memory probably
already exists (it's household law). If so, **sna-1 should still land** — it
binds the principle to the concrete rollback event (commit `a5d50054`,
verbatim operator words) — but link it via `related_to`/`link` to the
existing entry rather than superseding.

### Encode loop

Session tag for sna-1…sna-10:
`MEMORY_SESSION_ID=mining-transcripts-119bf64e-c186-4170-855d-4f450e9d29cf`
(the thread UUID that contributed the signal).
For sna-11…sna-12: `MEMORY_SESSION_ID=session-2026-07-11-ship-normalization`.

```bash
cd /Users/kenbaker/ocs-work
for f in /path/to/InTheWake/admin/memory-exports/2026-07-11-ship-normalization-arc/sna-*.json; do
  python3 - "$f" <<'PY'
import json, sys, os
sys.path.insert(0, 'ken/orchestrator')
m = json.load(open(sys.argv[1]))
os.environ['MEMORY_SESSION_ID'] = (
    'mining-transcripts-119bf64e-c186-4170-855d-4f450e9d29cf'
    if m['source'].startswith('mined-from-transcripts')
    else 'session-2026-07-11-ship-normalization')
import memory_ops
new = memory_ops.encode(
    m['content'], domain=m['domain'], memory_type=m['type'],
    source=m['source'], confidence=m['confidence'],
    tags=m['tags'], protected=m['protected'])
print(sys.argv[1].split('/')[-1], '→ encoded as', new['id'])
PY
done
```

Then update the export README's table with the real SSOT ids, flip status to
REPLAYED, commit to InTheWake.

**Domain note:** sna-1/2/3/4/6/9 are `ken`-domain (operator meta-patterns);
sna-5/7/8/10/11/12 are `cruising`. If SSOT convention has consolidated
operator-directives under `cruising`, move accordingly — the JSONs record my
best classification, not a mandate.

---

## PART B — HLS tasks to register

Three open work items from this session, none currently in
`admin/UNFINISHED_TASKS.md` (checked 2026-07-11; nearest neighbors are
`itw-gh-1465` false-positive fixes and `itw-gh-1772` Cordelia variant —
different work):

```bash
cd /Users/kenbaker/ocs-work

# 1. The actual image-reuse cleanup (findings are on disk NOW)
node admin/library.mjs register \
  --title "Image-reuse cleanup from scan-image-reuse + scan-image-recrops findings: 6 CRITICAL + 20 ERROR md5-identical reuses (incl. Liberty≡Radiance FOM x8 pairs — permission-only license violated; westerdam≡zuiderdam≡star-princess 3-way; ken1.* article/author cross-section triple) and 3 CRITICAL + 12 ERROR visual recrops (incl. Costa Deliziosa≡Celebrity Millennium, Costa Firenze≡Celebrity Infinity — different lines, same photograph). Each needs a sourced unique replacement per SHIP_STANDARDIZATION_PLAN_V3 § 7.6 fallback hierarchy, or an empty slot + coverage-gap entry. Reports: audit-reports/image-reuse-report.md + image-recrops-report.md." \
  --repo InTheWake --priority 2 --task-id itw-image-reuse-cleanup \
  --tags image-reuse,attribution,fom-license,editorial,session-2026-07-11 \
  --sources "handoff:admin/handoffs/2026-07-11-ship-normalization-memory-hls.md"

# 2. Costa-conversion ships with wrong-hull data (B2 historic-ship-verifier)
node admin/library.mjs register \
  --title "carnival-firenze (and likely carnival-venezia): fact-block carries Spirit-class data (86,000 GT, 960 ft, 2,680 guests) that does not match the actual hull (former Costa Firenze: 135,156 GT, 1,061 ft, 4,126). Not a B1 pick-the-canonical fix — both integers are 'consistent' with their own surfaces but one is the wrong ship. Needs tier-1 sourcing (Equasis IMO 9787475) + fact-block regeneration. Deferral record: audit-reports/internal-consistency/carnival-firenze-DEFERRED.md." \
  --repo InTheWake --priority 3 --task-id itw-firenze-venezia-wrong-hull-data \
  --tags data-consistency,historic-ship-verifier,costa-conversion,equasis,session-2026-07-11 \
  --sources "handoff:admin/handoffs/2026-07-11-ship-normalization-memory-hls.md"

# 3. Review of the 22 kept-but-flagged comparison contexts
node admin/library.mjs register \
  --title "Review 22 Phase-3.1 numeric swaps flagged by audit-internal-consistency-comparisons.cjs but NOT reverted (4 unambiguous cases were reverted 2026-07-11). Categories: Vision-class 'about 2,100' sharpenings (likely fine), Voyager-class max→LB rewrites inside 'larger than' comparisons (meaning-shifting, arguable), ship-name regex false positives (fine). Each needs a human eye or tier-2 source check. Report: audit-reports/internal-consistency/_comparison-check.md; revert audit: _revert-2026-05-07.md." \
  --repo InTheWake --priority 4 --task-id itw-comparison-swaps-review \
  --tags data-consistency,phase-3-1,review,session-2026-07-11 \
  --sources "handoff:admin/handoffs/2026-07-11-ship-normalization-memory-hls.md"

node admin/library.mjs mirrors --repo InTheWake
```

Post an event to the sibling bus if that's now part of the replay convention
(`.household-library/events.jsonl`) — this container has never seen its
schema, so I'm deliberately not guessing an event format here.

---

## PART C — Session facts (context for the replayer)

- **This branch's shipped work** (all already on origin, most merged to main):
  v3 plan (`admin/SHIP_STANDARDIZATION_PLAN_V3.md` + `CLIENT_BRIEF_V3.md`),
  X2 lock CLI (`admin/ship-lock.cjs`), X3 regression differ
  (`admin/check-ship-regression.cjs`), B1 triage scanner
  (`admin/b1-triage-scan.cjs`), image-reuse guardrail (skill + 2 scanners +
  blocker + hook), symlink triage (`admin/triage-image-symlinks.cjs`),
  AI_INTEGRITY_HAZARDS.md, Phase-3.1 comparison-context revert + hardening.
- **The rollback event** referenced by sna-1: commit `a5d50054` reverted 10
  ship edits + 11 audit reports; operator's verbatim words are in the memory.
- **Cross-ship comparison failure happened twice**: once by this thread
  (rolled back pre-emptively), once by the `claude/phase3-internal-consistency`
  branch (merged to main; 4 pages fixed 2026-07-11, commit `5f061031`).
  That two-independent-agents fact is why sna-11 is marked protected.
- **328 symlinks** flagged by this thread's scanner were independently
  cleaned up by main's PR #1500/#1501 — convergent fixes, no conflict.
- **Container git note:** the local container commit `e26311f79` carries this
  same content; it could not be pushed over plain git (no credential proxy),
  so the files were re-pushed via the GitHub MCP in four commits. If the
  container is resumed, reconcile by resetting local to origin.

## PART D — Concerning-content scan

Transcripts audited during the 2026-05-13 mining run:
- No API tokens, credentials, or personal identifiers.
- No prompt-injection attempts.
- No sensitive prose. All directives concern agent behavior and a public
  cruise site. The 12 memories are safe for the public open-claw-stuff repo.

*Soli Deo Gloria.*
