# Handoff — Three-cluster SEO research session (sandbox replay)

**Author:** Container sandbox session (Claude, 2026-07-11) · **Replayed by:** grok1 on Mac (`/Users/kenbaker/ocs-work`)  
**Status:** ✅ **REPLAYED** on Mac SSOT — 2026-07-11

---

## Container blocker (documented)

The sandbox agent could not see the git repo, `CLAUDE.md`, HLS, or sibling bus. It correctly refused to guess and produced this handoff block instead. Mac agent replayed to household SSOT.

**Sandbox glossary resolved:**

- **HLS** = Household Library System (`catalog.jsonl` + `library.mjs`)
- **Sibling bus** = `.household-library/events.jsonl`
- **CLAUDE.md** = `/Users/kenbaker/ocs-work/CLAUDE.md` (preflight entry point)
- **Memories** = `ocs-work/.memory/` via `memory_ops.py` (not Claude `memory_user_edits`)

---

## PART A — Memories (✅ replayed)

Three date-sensitive research memories in `ocs-work/.memory/cruising/`:

| ID | Topic | Protected |
|----|-------|-----------|
| `e8d9a589` | Three SEO keyword clusters under research (Costa Maya diving, South Pacific/Mystery Island, RBC Collection) | no |
| `10462ad5` | Perfect Day Mexico replacing Costa Maya late 2027 — content shelf-life | no |
| `98e5b23c` | RBC Collection pipeline July 2026 + Cozumel/Lelepa date conflicts | no |

Linked: `e8d9a589` ↔ `10462ad5` ↔ `98e5b23c`

---

## PART B — HLS tasks (✅ registered)

**Skipped (already live on production):**

- Costa Maya diving pillar → [costa-maya-mesoamerican-reef-diving.html](https://cruisinginthewake.com/articles/costa-maya-mesoamerican-reef-diving.html)
- RBC Collection pillar → [royal-beach-club-collection-2026.html](https://cruisinginthewake.com/articles/royal-beach-club-collection-2026.html)

**Registered (10 tasks, #2408–#2417):**

| task_id | P | GitHub |
|---------|---|--------|
| `itw-seo-chinchorro-contrarian` | 3 | [#2408](https://github.com/jsschrstrcks1/InTheWake/issues/2408) |
| `itw-seo-costa-maya-dive-operators` | 3 | [#2409](https://github.com/jsschrstrcks1/InTheWake/issues/2409) |
| `itw-seo-south-pacific-primer` | 3 | [#2410](https://github.com/jsschrstrcks1/InTheWake/issues/2410) |
| `itw-seo-mystery-island-cheatsheet` | 3 | [#2411](https://github.com/jsschrstrcks1/InTheWake/issues/2411) — pairs with `itw-seo-mystery-island-pattern` (#2386) |
| `itw-seo-rbc-lelepa-living-doc` | 3 | [#2412](https://github.com/jsschrstrcks1/InTheWake/issues/2412) |
| `itw-seo-rbc-vs-cococay` | 3 | [#2413](https://github.com/jsschrstrcks1/InTheWake/issues/2413) |
| `itw-seo-rbc-day-pass-worth-it` | 3 | [#2414](https://github.com/jsschrstrcks1/InTheWake/issues/2414) |
| `itw-seo-rbc-paradise-island-review` | 4 | [#2415](https://github.com/jsschrstrcks1/InTheWake/issues/2415) |
| `itw-seo-drink-calc-rbc-model` | 4 | [#2416](https://github.com/jsschrstrcks1/InTheWake/issues/2416) |
| `itw-seo-three-cluster-verifications` | 2 | [#2417](https://github.com/jsschrstrcks1/InTheWake/issues/2417) |

Mirrors: `node admin/library.mjs mirrors --repo InTheWake`

---

## PART C — Research artifact (✅ saved)

`docs/research/2026-07-11-three-cluster-seo-research.md` — cluster findings, production status, verification conflicts (a) Cozumel RBC date, (b) Lelepa year.

**Note:** Full sandbox session writeup was not recoverable from transcript; artifact reconstructed from handoff block + live production articles + memory candidates.

---

## Conflicts for Ken

1. **Cozumel RBC opening:** RC press = Dec 31 2026; trade press = late 2026 / early 2027.
2. **Lelepa year:** RC releases say both 2027 and 2028.
3. **Costa Maya dive pricing:** sandbox ~$110 vs production $85–140 band — re-verify.

---

*Soli Deo Gloria.*