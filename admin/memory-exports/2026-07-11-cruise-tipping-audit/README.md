# Memory export — cruise-tipping audit + transcript mining (2026-07-11)

**Replayed on Mac SSOT** by grok1 — memories already encoded to `ocs-work/.memory/cruising/`.

## ctc-audit batch (9 files)

Session source: `container:cruising:claude/explore-inthewake-repo-lIUcX:2026-07-11`

| export | memory id | type | protected |
|--------|-----------|------|-----------|
| ctc-audit-1 | `e4ce7a5f` | pattern | yes |
| ctc-audit-2 | `9a26c7b7` | preference | yes |
| ctc-audit-3 | `6f643787` | pattern | yes |
| ctc-audit-4 | `a929dde9` | pattern | yes |
| ctc-audit-5 | `0b98d152` | fact | yes |
| ctc-audit-6 | `ef90d8df` | decision | yes |
| ctc-audit-7 | `92eb6b80` | decision | yes |
| ctc-audit-8 | `547b2fa5` | pattern | no |
| ctc-audit-9 | `59cb7f09` | fact | yes |

## mined operator directives (9 entries, separate batch)

Source: `mined-from-transcripts:2026-05-13` — consolidated in `mined-operator-directives-2026-05-13.json`

IDs: `bc6ef93a`, `14ad7829`, `2b89a833`, `7f0df2b6`, `dd94a307`, `9ac2e3a3`, `e0cbb962`, `07f45487`, `8f642f51`

Overlapping ctc-audit entries are linked to their mined counterparts.

## Verify

```bash
python3 /Users/kenbaker/Documents/Claude/Projects/Openclaw\ Cluster\ 2.0/ken/orchestrator/memory_ops.py \
  recall "cruise tipping audit gate operator insists" --domain cruising --limit 12
```

*Soli Deo Gloria.*