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
| itw-mariner-oversold | 3 | Mariner oversold outcome article |
| itw-css-inline | 5 | Inline styles consolidation |
| itw-drink-calc-copy | 5 | Drink calculator copy vs chart |

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