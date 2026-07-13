# Issue H residual — repeated FAQ blocks

**Date:** 2026-07-12  
**Task:** `issue-h-repeated-faq-blocks-panama-canal-observed` (#2035)  
**Patron:** skynet2  
**Soli Deo Gloria. Careful, not clever.**

## Observed
- **panama-canal:** single `id="faq"` but mixed authentic transit Qs + generic port boilerplate; FAQPage schema included phantom dock/currency Qs not on page.
- **mindelo / hurghada:** **four** identical `id="faq"` blocks each (templated collision). Fleet scan: only these two multi-`id="faq"` cases.

## Fix
| Port | Action |
|------|--------|
| panama-canal | Rewrote FAQ to authentic transit + weather-topic set as compact `faq-item`; schema = page; weather validator errors **0** |
| mindelo | Collapsed 4→1 FAQ; restored 7 authentic Qs + 3 weather topics; errors **0** |
| hurghada | Collapsed 4→1 FAQ; residual **PACK_001** packing-list title (non-FAQ) left |

## Fleet
`id="faq"` count >1 remaining: **0**

## Not suite green
Ad-hoc hermes-verify only.
