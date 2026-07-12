# Issue E residual ledger — weather/seasonal shells

**Date:** 2026-07-12  
**Task:** `issue-e-ports-with-the-entire-weather-seasonal-section-missing` (#2033)  
**Patron:** skynet2  
**Soli Deo Gloria. Careful, not clever.**

## Mission
Ports with seasonal-guides.json data but **no** `weather-guide` / `port-weather-widget` / `seasonal-guide` shell.

## Disposition

| Class | Count | Action |
|-------|------:|--------|
| Redirect stubs (beijing, falmouth-jamaica, kyoto) | 3 | **Left bare** — no invented full weather UI |
| Non-redirect missing shells injected | 35 | Issue E shell from seasonal-guides.json |
| `validate-port-weather` errors after harden | 0 on all 35 | Priority philipsburg / rostock / santos = 0 |

## Injected shells include
- `details#weather-guide` + `div#port-weather-widget` with data-port-*  
- noscript `seasonal-guide` with At a Glance, Best Time (Peak / Transitional / Low), activities, avoid, catches, packing, hazards  
- Weather FAQs aligned to validator topic set; FAQPage schema count matched  
- Port-level “At a Glance” renamed **Port Snapshot** where it duplicated G001  

## Tool
`admin/fix-issue-e-weather-shell.py` (`--apply`)

## Not suite green
Ad-hoc `hermes-verify-issue-e-*` only.
