# Library — In the Wake shelf

**Complete documentation:** `/Users/kenbaker/ocs-work/docs/HOUSEHOLD-LIBRARY.md`  
**Household SSOT:** `/Users/kenbaker/ocs-work/.household-library/`  
**CLI:** `node /Users/kenbaker/ocs-work/admin/library.mjs`  
**Index:** `/Users/kenbaker/ocs-work/docs/HOUSEHOLD-TASK-INDEX.md`

## This repo's catalog subset

Tasks with `repo: InTheWake` in household catalog. Examples:

| library_task_id | priority | title |
|-----------------|----------|-------|
| itw-flickr-arr-audit | 0 | Flickr ARR license audit |
| itw-hal-carousels | 1 | HAL carousel blocking errors |
| itw-voyage-pwa-integration | 2 | Voyage packs → PWA deep integration (soft-deprecate PDFs; Bliss shell time-critical, sails Jul 2026) |
| itw-mariner-oversold | 3 | Mariner oversold outcome article |
| itw-voyage-pwa-icons | 4 | Per-voyage PWA icon variants (14 installs share one icon) |
| itw-css-inline | 5 | Inline styles consolidation |
| itw-drink-calc-copy | 5 | Drink calculator copy vs chart |

> `itw-voyage-pwa-integration` and `itw-voyage-pwa-icons` added from the repo side
> 2026-07-07 (remote session; container has no catalog access) — needs `library.mjs add`
> on the household box to take catalog custody. Full state: `admin/UNFINISHED_TASKS.md`
> §"P2 — Voyage packs → PWA deep integration".

```bash
node /Users/kenbaker/ocs-work/admin/library.mjs find "itw"
```

## Files

| File | Role |
|------|------|
| `admin/UNFINISHED_TASKS.md` | Human-readable open queue |
| `admin/VERIFIED_COMPLETED.md` | Two-sibling verified complete |
| `admin/COMPLETED_TASKS.md` | Legacy archive |

## Before any user task

```bash
node /Users/kenbaker/ocs-work/admin/library.mjs preflight --query "<task>" --patron <you> --merge --repo InTheWake
```