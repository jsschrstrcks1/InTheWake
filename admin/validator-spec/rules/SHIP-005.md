---
id: SHIP-005
name: Dining hero image must be the shared Cordelia_Empress_Food_Court.webp
family: ship
severity: error
applies-to:
  - ship
provenance: V-S-conflict
status: live
implementation:
  - file: admin/validate-ship-page.js
    function: validateImages (dining hero check)
    lines: "1421-1445"
check: if page has an element with id="dining-hero", its src must include the substring "Cordelia_Empress_Food_Court"; if the page has a dining section but no dining-hero image, that also fails
standards-source:
  - doc: admin/SHIP_AUDIT_FINDINGS.md
    section: "Cross-fleet dining hero image wrong — 291 of 295 pages use Cordelia Empress Food Court (budget Indian line) instead of ship-appropriate image"
standards-backfill: no
decision: UNRESOLVED
last-updated: 2026-04-16
---

## Rule
The validator hard-requires that every ship page's dining hero image be the literal file `/assets/img/Cordelia_Empress_Food_Court.webp` — a photo of a buffet on Cordelia Empress (a budget Indian cruise line unrelated to the ship being documented). The `SHIP_AUDIT_FINDINGS.md` document identifies this exact pattern as a defect.

## Why the conflict exists
The validator's requirement started life as a stopgap — "we don't have real dining hero images for most ships yet; use this shared placeholder to get the page structure in place and fix the image later." Over time:
- 291 of 295 ship pages came to use the Cordelia image as their dining hero.
- The audit document correctly identifies this as a cross-fleet contamination problem: readers looking at Allure of the Seas or Icon of the Seas see a photo of a buffet that has nothing to do with the ship they're reading about.
- The validator still **hard-errors** on any ship that DOES NOT use the Cordelia image, blocking any improvement.

This is the exact shape of drift the spec exists to catch: the validator ossified a temporary choice into a permanent requirement, and the fix is blocked by the very tool meant to enforce quality.

## Pass example (under current validator)
```html
<img id="dining-hero" src="/assets/img/Cordelia_Empress_Food_Court.webp" alt="..."/>
```
Passes — validator sees "Cordelia_Empress_Food_Court" substring, green-lights the page. Reader sees a buffet from a completely different cruise line.

## Fail example (under current validator)
```html
<img id="dining-hero" src="/assets/ships/rcl/allure-of-the-seas/chops-grille-interior.webp" alt="Chops Grille dining room, Allure of the Seas"/>
```
A real, ship-specific, attributed dining image — validator emits: `Dining hero must use shared Cordelia image (...), found: /assets/ships/rcl/allure-of-the-seas/chops-grille-interior.webp`. The right image is BLOCKED.

## Implications

### If validator wins (keep Cordelia requirement)
- **Current pages:** 291 pages remain as-is — showing a wrong-ship buffet as their dining hero. This is the status quo.
- **Future pages:** every new ship page must use the Cordelia placeholder until the rule changes.
- **Audit document:** `SHIP_AUDIT_FINDINGS.md` remains a living record of a known defect that can't be fixed. Reads as "we know this is wrong and we're keeping it anyway."
- **Pastoral implications:** serious. Every ship page lies — to widows, grieving parents, disabled travelers, first-time cruisers — about what dining looks like on the ship they're trying to plan for. The site's stated mission is honest travel information; the current enforcement contradicts the mission.
- **Cost of keeping:** zero technical cost. Unlimited pastoral cost.

### If validator changes (remove the Cordelia requirement; allow any real dining hero)
- **Validator change:** delete lines 1421-1445 of validate-ship-page.js. Replace with: require SOME dining hero image exists if the dining section exists; do NOT constrain which file.
- **Follow-up required:** source real dining hero images for each of the 291 affected ships. Per ATTR-001 and ATTR-003, they must have attribution JSON and diverse source URLs. Per IMG-014, they must not match placeholder hashes.
- **Transition state:** during the sourcing project (weeks to months), pages can either (a) keep Cordelia as a known-bad stopgap with a visible "real image coming" marker, or (b) omit the dining hero entirely (show venue tiles or a text-only dining section).
- **Cost of changing:** moderate technical work + substantial image sourcing work. Produces honest pages over time.
- **Quality outcome:** pages stop lying. Readers see what their actual ship's dining looks like.

## Recommendation
**Change the validator. Remove the Cordelia hard-requirement.**

Reasoning:
1. The current rule ossifies a stopgap into a lie. A validator is supposed to enforce quality; this one is enforcing a defect.
2. The audit document already identifies the problem (`SHIP_AUDIT_FINDINGS.md` is clear and specific). Keeping the validator as-is contradicts the audit's findings.
3. The pastoral cost is real and ongoing. Every day the rule stays in, every new reader of a ship page is shown a wrong-ship dining photo.
4. The fix is bounded: one validator edit (minutes) + an image-sourcing project (weeks to months, parallelizable across pages).
5. Transition option (b) — allow pages to omit the dining hero entirely — is also acceptable. Omitting is honest; lying is not.

**Action if accepted:**
- Replace validator lines 1421-1445 with: if dining section exists AND dining-hero exists, verify dining-hero has alt text + passes IMG-001 / ATTR-001 / IMG-014. Do NOT constrain src.
- Add a new spec rule (SHIP-013 when extraction reaches it): "dining-hero image, when present, must be ship-specific and attributed" — the positive form of what we're removing.
- Spawn a separate project: "source real dining heroes for 291 affected ships." Trackable via IMG audit.
- Update this rule: `decision: FINAL`, `provenance: V+S-agree` (once validator + SHIP_AUDIT_FINDINGS both align on "no Cordelia"), flip the `check:` field.

**Action if overridden toward keep:**
- Document the conscious choice: why a known-incorrect image is being preserved across the fleet.
- Add an on-page "representative image" disclaimer on every ship page's dining section, so readers know they're not looking at the ship they're researching.
- Update this rule: `decision: FINAL` with validator-wins direction + rationale recorded.

**I strongly recommend the first path. This is the highest-pastoral-stakes rule in the spec so far.**
