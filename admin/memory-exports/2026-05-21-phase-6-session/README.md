# Memory export — Phase 6 image-sourcing session (2026-05-21/22)

These 8 JSON files are the raw output of `MEMORY_ROOT=~/.memory python3 ken/orchestrator/memory_ops.py encode ...` from the InTheWake container.

The container had no push credentials for `open-claw-stuff` and no access to Ken's Mac `~/.memory/cruising/`. They are exported here so a subsequent agent on the SSOT machine can either:

**Option A — replay the encode commands** on the canonical memory store (session tag: `session:2026-05-21-InTheWake-phase-6`):

```bash
for f in *.json; do
  content=$(jq -r .content "$f")
  type=$(jq -r .type "$f")
  domain=$(jq -r .domain "$f")
  MEMORY_ROOT=/Users/kenbaker/.memory python3 /Users/kenbaker/ocs-work/ken/orchestrator/memory_ops.py \
    encode "$domain" "$type" "$content" "session:2026-05-21-InTheWake-phase-6"
done
```

**Option B — copy the files directly** into the canonical memory store:

```bash
cp *.json /Users/kenbaker/.memory/cruising/
```

Both work. `memory_ops.py` reads any well-formed JSON in the domain directory.

Then verify:

```bash
MEMORY_ROOT=/Users/kenbaker/.memory python3 /Users/kenbaker/ocs-work/ken/orchestrator/memory_ops.py \
  recall "Phase 6 image sourcing" --domain cruising --limit 10
```

Soli Deo Gloria.
