# Pattern C residual — Cruise / Shore Excursion suffix template bug

**Date:** 2026-07-13  
**Task:** `pattern-c-cruise-shore-excursion-suffix-template-bug` (#2031)  
**Patron:** skynet2  
**Soli Deo Gloria. Careful, not clever.**

## Defect
Generator and page wiring append **` cruise port`** (and cousins) when the port label **already ends with `Cruise`**, producing doubled suffixes:

`South Pacific Islands Cruise` + ` cruise port` → **`Cruise cruise port`**

Same class would hit **`Shore Excursion`** + **` shore excursion`**.

## Live fix
| File | Change |
|------|--------|
| `ports/south-pacific.html` | `Cruise cruise port` → `Cruise port` (aria-label + alt) |

Fleet residual for `Cruise cruise`: **0**.

## Generator harden (`admin/generate-port-page.cjs`)
Helpers:
- `withCruisePortLabel(name)` — skip re-appending `cruise port` if name ends with Cruise / Cruise Port
- `withCruisePortGuideTitle(name)` — title / og without `Cruise Cruise Port Guide`
- `withCruisePierLabel(name)` — pier aria without `Cruise cruise pier`

Applied to: page title, ai-summary, hero aria-label, from-the-pier aria-label.

## Left alone (not Pattern C)
Natural strings: `San Diego Cruise`, `PortMiami Cruise`, river/boat “Cruise” attraction names, section heading `The Cruise Port`.

## Not suite green
Ad-hoc hermes-verify only.
