# Deployment Audit Report — 2026-02-21

**Triggered by:** Ken Baker aboard Quantum of the Seas, reporting the ship appeared associated with Cabo San Lucas while the JSON/FAQ data showed Asia deployment.

**Auditor:** Claude (claude-sonnet-4-6)
**Branch:** claude/review-docs-codebase-IJvuW
**Commit:** fdd9d825

---

## Root Cause: Quantum of the Seas

Ken was on the live Quantum page while docked at Cabo San Lucas. The AIS live tracker correctly showed the real-time position. The discrepancy was the FAQ text: *"Quantum typically sails Asian itineraries from Singapore and Australia"* — which was outdated by ~4 months.

**Quantum actual 2025-2026 deployment (verified via RCL official site + Cruise Industry News):**

| Period | Homeport | Region |
|--------|----------|--------|
| May–Sept 2025 | Seattle, WA | Alaska |
| Oct 2, 2025 – Sept 2026 | Los Angeles (San Pedro) | Pacific Coast / Mexican Riviera |
| Sept 26, 2026 (25-night reposition) | Los Angeles → Brisbane | Transpacific |
| Oct 2026 – Apr 2027 | Brisbane, Queensland | Australia / New Zealand / South Pacific |
| Summer 2027 (expected) | Seattle, WA | Alaska |

**Ports on current LA season:** Los Angeles, Cabo San Lucas (overnight stay on 6-night), Ensenada, Catalina Island (spring/summer 2026)

---

## Fixes Applied (Committed fdd9d825)

### 1. ship-deployments.json — Quantum updated
- **regions:** `['australia','south-pacific','asia']` → `['pacific-coast','mexican-riviera','alaska','australia','south-pacific']`
- **homeports:** `['brisbane','singapore']` → `['los-angeles','seattle','brisbane']`
- **typical_ports:** Replaced 7 Asia/Australia ports with 15 covering all 3 active deployments
- **port_to_ships:** Added Quantum to 14 ports; removed from 3 Caribbean beach clubs it never visits

### 2. quantum-of-the-seas.html
- FAQ HTML + JSON-LD updated to reflect LA homeport, Mexican Riviera routes, and Brisbane reposition
- `last-reviewed` and `dateModified` updated to 2026-02-21

### 3. Port pages: Cabo, Ensenada, Los Angeles
- Added Quantum of the Seas to Royal Caribbean ships section on all three

### 4. independence-of-the-seas — canonical slug fix
- `falmouth-jamaica` in `typical_ports` → `jamaica` (canonical page is `jamaica.html`; `falmouth-jamaica.html` is a redirect)
- Updated `port_to_ships` accordingly

### 5. 19 port pages — broken Oceania Regatta link fixed
- All referenced `/ships/oceania/oceania-regatta.html` (doesn't exist) instead of `/ships/oceania/regatta.html`
- Affected: Alaska ports (juneau, sitka, skagway, ketchikan, icy-strait-point, endicott-arm, tracy-arm, glacier-bay, haines, hubbard-glacier, seward, anchorage, kodiak, valdez, inside-passage, whittier, victoria-bc, seattle) + los-angeles
- All 19 fixed; dates updated to 2026-02-21

---

## Issues Found But NOT Fixed (with reasoning)

### Labadee — No ships section
Labadee (Haiti, RCL private island since 1986) has a 790-line content page but no "Ships That Visit Here" section — unlike CocoCay which has a full static ships section. Additionally, `port_to_ships['labadee']` is empty `[]` and no ships have `labadee` in their `typical_ports`.

**Reason not fixed:** Ken confirmed no ships are currently going to Labadee due to ongoing political unrest in Haiti. Ships are being sold and then canceled ~6 months out. Adding a ships section would be actively misleading.

**Recommendation:** Add a note to the Labadee page about the current situation. When service resumes, add ships section with: Icon, Star, Allure, Harmony, Oasis, Symphony, Wonder, Freedom class ships.

### Norwegian Bliss — No ship page
Norwegian Bliss is homeported in LA and does Mexican Riviera (Cabo, Vallarta, Mazatlan) but has no ship page at `/ships/norwegian/norwegian-bliss.html`. Updated `port_to_ships` in JSON; held off adding HTML links since no page to link to.

**Recommendation:** Create a Norwegian Bliss ship page, then add it to Cabo and LA port pages.

### Queen Anne — Incomplete typical_ports
Queen Anne (Cunard, 2024) lists `caribbean` in its regions but typical_ports only includes Med/Northern Europe ports. Caribbean itineraries are missing.

**Recommendation:** Verify Queen Anne's actual Caribbean deployment schedule and update typical_ports.

### MSC Orchestra — False positive in audit
Flagged as having Eastern Caribbean region but no Caribbean ports. In reality, `fort-de-france` (Martinique) and `pointe-a-pitre` (Guadeloupe) ARE Caribbean ports — just not in our detection set. Data is actually correct.

---

## Systemic Data Architecture Issue (for future sprint)

**5,143 mismatches** between `port_to_ships` and `ships[slug].typical_ports`:
- `port_to_ships` was built from a different/broader dataset than `typical_ports`
- 83.9% of `port_to_ships` entries have no corresponding entry in ships' `typical_ports`
- 369 ships list ports not reflected back in `port_to_ships`

**Current impact:** LOW — 373 of 387 port pages use static HTML for ships sections. Only 2 JS-only port pages with data (`labadee` = empty, `praia` = 8 world cruise ships).

**Recommended approach:** In a future data rebuild pass, regenerate `port_to_ships` as the authoritative source from ships' `typical_ports`, then expand `typical_ports` systematically for each ship from actual itinerary data.

---

## Validator Recommendation

Consider adding a check to the ship page validator for:
- Does the FAQ "Where does [ship] typically sail?" text mention at least one homeport?
- Is the FAQ deployment answer flagged for review if `last-reviewed` is >90 days old?

This would catch future Quantum-style deployment drift earlier.

---

*Soli Deo Gloria*
