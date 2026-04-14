# Admin

This directory holds the lean set of admin content that stays with the InTheWake repository — runtime-referenced Claude Code docs, task trackers, integrity guardrails, and the two HTML reports that are served through an `.htaccess` exception.

**Most admin tooling now lives in the `ken` repository at [`ken/admin/inthewake/`](../../ken/admin/inthewake/)** (as of 2026-04-14). This keeps 500+ development-only files out of the deployed website artifact and consolidates cross-repo tooling in the ken hub.

---

## What's in this directory

```
admin/
├── README.md                         # This file
├── CAREFUL.md                        # Technical integrity guardrail
├── CAREFUL_AUDIT_2026_03_27.md       # Latest integrity audit
├── UNFINISHED_TASKS.md               # Master task list
├── IN_PROGRESS_TASKS.md              # Active work in current session
├── COMPLETED_TASKS.md                # Completed work log
├── PORT_DISRUPTION_FACTORS_REFERENCE.md  # Current research
├── claude/                           # Claude Code runtime docs (18 files)
│   ├── CLAUDE.md                     # — referenced at session start
│   ├── PASTORAL_GUARDRAILS.md
│   ├── SKILLS_REFERENCE.md
│   ├── TECHNICAL_STANDARDS.md
│   └── ...
└── reports/                          # Served via .htaccess exception
    ├── articles.html
    └── sw-health.html
```

## What moved to ken/admin/inthewake/

All development tooling, historical audits, source materials, scripts, and analysis documents:

- All `.js`, `.cjs`, `.mjs`, `.py`, `.sh` scripts
- `scripts/`, `archive/`, `venue-research/`, `cabin-classifications/`
- `source-materials/`, `hooks/`, `lib/`, `plans/`, `standards-changelog/`
- `reports/audits/` and all non-HTML report artifacts
- Historical `.md` analysis, planning, and evaluation files

See `ken/admin/inthewake/README.md` for the full directory layout.

## Developer workflow

Clone both repositories as siblings. From the InTheWake root, invoke admin tooling from the ken location:

```bash
node ../ken/admin/inthewake/validate-ship-page.js
python3 ../ken/admin/inthewake/scripts/batch-validate-venues.js
```

Soli Deo Gloria.
