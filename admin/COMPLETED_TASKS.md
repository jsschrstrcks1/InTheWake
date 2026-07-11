# Completed Tasks — InTheWake (read-only archive)

> **Task custody (HLS):** Work queues live in `.household-library/catalog.jsonl` — not in this file.
> Find/checkout: `node admin/library.mjs preflight --query "<task>" --patron <id> --merge`
> **This document** is context/spec only unless stated otherwise.

**Generated:** 2026-07-11T22:27:54.842Z
**Authoritative completions:** `admin/VERIFIED_COMPLETED.md` (two-patron quorum) + catalog `state: complete`.
**Do not append ad hoc** — use `library verify` / `library complete`.

| task_id | title | artifact |
|---------|-------|----------|
| itw-guardrail-no-getbets-2026-05-28 | no-getbets hard-ban guardrail — PreToolUse hook + pre-commit (shipped 2026-05-28) | https://github.com/jsschrstrcks1/InTheWake/issues/2381 |
| itw-seo-title-rewrites-2026-05-28 | SEO title rewrites batch — shipped 2026-05-28 (Sovereign 5.11× lesson) | https://github.com/jsschrstrcks1/InTheWake/issues/2387 |

*Legacy completions in handoffs and dated roadmaps are historical — migrate via catalog register if still open.*

```bash
node admin/library.mjs mirrors --repo InTheWake
```
