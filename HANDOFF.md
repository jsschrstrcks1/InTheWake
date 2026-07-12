# HANDOFF — Audit + P0/P1 fixes (cloud session 2026-07-12)

**Session:** 2026-07-12 (Cloud CCR)
**Branch:** `claude/audit-repo-tasks-FelBt` (recreated from main after merge)
**Prior branch was merged** — work below is continuation on fresh branch.

---

## What Was Done This Session

### 1. Full UNFINISHED_TASKS.md audit (11 fixes committed)
- Struck 42/45 stale Tier 3 port entries (sections already present; only chilean-fjords, papeete, strait-of-magellan genuinely missing)
- Deprecated stale "242/387 PASS" port validation number (actual 2026-05-13: 47/385)
- Removed 3 done SW items (warmCalculatorShell, staleIfErrorTimestamped, GET_CACHE_STATS)
- Removed affiliate task for 3 redirect stubs (beijing, falmouth-jamaica, kyoto)
- Updated CSS baseline from ~15,626 to 22,181
- Added lane assignments to Missing Port/Homeport/Ship sections (Yellow)
- Moved Solo Articles decision to Red Lane
- Cleaned stale IN_PROGRESS entry
- Updated header date

### 2. P0 Flickr ARR bulk delete (866 images + 866 attr.json + 865 CSV rows)
- Deleted all "Flickr public feed" sourced files across 121 ports
- Excluded 2 verified CC BY 2.0 keepers in port-everglades
- HTML refs intentionally left broken for validator tracking
- Legal liability removed

### 3. P1 Weather FAQ backfill (248 ports)
- Wrote `admin/backfill-weather-faqs.cjs` (idempotent, uses validator's own Q: extraction logic)
- Injected 1-4 weather FAQs per port from seasonal-guides.json
- Both visible HTML + JSON-LD schema updated
- Spot-verified: weather FAQ errors resolve to 0 on all tested ports

---

## What Still Needs Doing

### P1 (immediate)
1. **13 ports lack FAQ `<details>` section** — cannot receive weather FAQs. Need template structural fix.
2. **FAQ_COUNT mismatch** — many ports have original FAQs without `Q:` prefix. Validator counts `<strong>Q:` only. Separate pass: add prefix to existing FAQs or adjust validator.
3. **7 Alaska ports lack seasonal-guides.json data** (college-fjord, homer, kodiak, misty-fjords, petersburg, valdez, wrangell). Need entries added to JSON.

### P2 (follow-up)
4. **42 Tier 3 ports — content quality review**. Headings exist but content may be thin stubs.
5. **Inline styles at 22,181** (growing). CSS consolidation moving backwards.
6. **FORCE_DATA_REFRESH** SW message handler still pending (only uncategorized SW item left).

---

## Memories to Store (for handoff agent)

These should be `encode()`d into cognitive memory:

| Content | Domain | Type | Source |
|---------|--------|------|--------|
| InTheWake Tier 3 port audit: 42/45 have cruise-port/getting-around/excursions headings. Only chilean-fjords, papeete, strait-of-magellan genuinely missing. Content depth unverified. | InTheWake | insight | session-2026-07-12-audit |
| Port weather validator merged into port-page validator (PR #1411, 2026-04-13). Before this, weather wasn't checked. 242 PASS → 47 PASS is rule addition, not regression. | InTheWake | insight | session-2026-07-12-audit |
| backfill-weather-faqs.cjs: idempotent batch script. Uses validator's extractVisibleFAQQuestions logic (Q: prefix + faq-item details). Applied to 248 ports. Re-runnable. | InTheWake | procedure | session-2026-07-12-audit |
| Flickr ARR audit: 866 images deleted across 121 ports. 2 PE keepers (CC BY 2.0 from prayitnophotography). All recoverable from git history. | InTheWake | fact | session-2026-07-12-audit |
| CLAUDE.md now pointer-only. Household SSOT at /Users/kenbaker/ocs-work. HLS catalog at .household-library/catalog.jsonl. Memory at open-claw-stuff/.memory/. | household | insight | session-2026-07-12-audit |

---

## Tasks to Add to HLS

```bash
# Run these on the Mac where library.mjs is available:
node /Users/kenbaker/ocs-work/admin/library.mjs add \
  --id "itw-faq-structural-13" \
  --title "13 ports lack FAQ <details> section — cannot receive weather FAQs" \
  --priority 1 --repo InTheWake

node /Users/kenbaker/ocs-work/admin/library.mjs add \
  --id "itw-faq-count-prefix" \
  --title "FAQ_COUNT mismatch: add Q: prefix to original non-prefixed FAQs" \
  --priority 2 --repo InTheWake

node /Users/kenbaker/ocs-work/admin/library.mjs add \
  --id "itw-tier3-content-quality" \
  --title "42 Tier 3 ports: content depth review (headings present, quality unverified)" \
  --priority 2 --repo InTheWake

node /Users/kenbaker/ocs-work/admin/library.mjs add \
  --id "itw-alaska-seasonal-json" \
  --title "7 Alaska ports missing from seasonal-guides.json (college-fjord homer kodiak misty-fjords petersburg valdez wrangell)" \
  --priority 2 --repo InTheWake
```

---

## How to Resume
1. Push this branch to InTheWake if network allows
2. On Mac: run the `library.mjs add` commands above
3. On Mac: run `python3 ken/orchestrator/memory_ops.py` (or invoke encode() per the table above)
4. The weather FAQ backfill script is ready to re-run if more ports are added to seasonal-guides.json
