---
id: SHIP-005
name: Dining hero image — tiered acceptance (ship-specific preferred; sister-class OK; cruise-line-generic last resort)
family: ship
severity: error
applies-to:
  - ship
provenance: V-S-conflict
status: live
implementation:
  - file: admin/validate-ship-page.js
    function: validateImages (dining hero check — CURRENTLY hard-requires Cordelia)
    lines: "1421-1445"
check: dining-hero image (if dining section exists) must be at Tier 1 (ship-specific, path under /assets/ships/<line>/<ship-slug>/), Tier 2 (sister of same class — path under /assets/ships/<line>/<sister-slug>/ where sister is in SHIP_CLASSES[class]), or Tier 3 (cruise-line-generic — path under /assets/ships/<line>/ or /assets/img/<line>_*); the current shared Cordelia_Empress_Food_Court.webp is explicitly rejected (it is neither Royal Caribbean nor any ship's actual dining room)
standards-source:
  - doc: admin/SHIP_AUDIT_FINDINGS.md
    section: "Cross-fleet dining hero image wrong — 291 of 295 pages use Cordelia Empress Food Court (budget Indian line) instead of ship-appropriate image"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-16
---

## USER DECISION (2026-04-16)
**Accepted direction: change the validator. Cordelia hard-requirement removed.**

**New tiered-acceptance policy** (user-defined, more nuanced than the original binary I proposed):

| Tier | Image source | Status |
|---|---|---|
| **1 — Ideal** | Photo of actual dining on this specific ship | Pass, preferred |
| **2 — Acceptable** | Photo from a sister ship of the same class (same venue design, same fleet, high visual fidelity) | Pass |
| **3 — Last resort** | Generic dining image from the same cruise line (not ship-specific, but at least the right line) | Pass with warning |
| **Reject** | Images from different cruise lines, stock imagery, placeholder hashes, the Cordelia_Empress_Food_Court.webp file | Fail |

The existing `/assets/img/Cordelia_Empress_Food_Court.webp` is explicitly rejected under all tiers — it is from Cordelia Empress, a different cruise line. Using a photo from Cordelia Empress on a Royal Caribbean ship page is the exact failure mode the audit identified; the fix is not "change which cross-line photo we use," it is "stop using cross-line photos."

### Implementation follow-up

The validator change (`admin/validate-ship-page.js` lines 1421-1445) becomes:

```javascript
// PSEUDOCODE — actual implementation done as separate PR

const diningHero = $('#dining-hero');
if (diningHero.length > 0) {
  const src = diningHero.attr('src') || '';
  const cruiseLine = extractCruiseLineFromFilepath(filepath); // e.g., 'rcl'
  const shipSlug = extractShipSlug(filepath);                   // e.g., 'allure-of-the-seas'
  const shipClass = getShipClass(shipSlug);                     // from SHIP_CLASSES

  // Explicit reject list first
  if (src.includes('Cordelia_Empress_Food_Court')) {
    errors.push({ rule: 'cross_line_dining_hero_cordelia', severity: 'BLOCKING',
      message: 'Dining hero uses Cordelia Empress (wrong cruise line). Use ship-specific or sister-class or line-generic instead.' });
  }
  // Tier 1: ship-specific
  else if (src.startsWith(`/assets/ships/${cruiseLine}/${shipSlug}/`)) {
    // Pass — ideal
  }
  // Tier 2: sister of same class
  else if (isSisterShipDining(src, cruiseLine, shipClass, SHIP_CLASSES)) {
    // Pass — acceptable
  }
  // Tier 3: cruise-line-generic (warn, but pass)
  else if (src.startsWith(`/assets/ships/${cruiseLine}/`) || src.includes(`/${cruiseLine}_`)) {
    warnings.push({ rule: 'dining_hero_line_generic_fallback', severity: 'WARNING',
      message: 'Dining hero is line-generic, not ship-specific. Upgrade when real imagery available.' });
  }
  // Anything else: reject
  else {
    errors.push({ rule: 'dining_hero_cross_line', severity: 'BLOCKING',
      message: `Dining hero src "${src}" is not from ship ${shipSlug}, a sister-class ship, or ${cruiseLine} line. Must match one of these tiers.` });
  }
} else if (hasDiningSection()) {
  // Existing rule: dining section needs a dining hero
  errors.push({ rule: 'dining_section_missing_hero', severity: 'BLOCKING',
    message: 'Dining section exists but missing dining-hero image' });
}
```

The existing `SHIP_CLASSES` mapping used by SCHEMA-010 (class-reference check) can be reused here to define sisters.

### Transition plan for the 291 affected ships

1. **Immediate (validator change only):** apply the new tiered check. All 291 pages still fail (Cordelia is now explicitly rejected with no grandfather clause).
2. **Short-term stopgap:** per-cruise-line, source ONE acceptable Tier-3 image (a generic Royal Caribbean dining image, one for Carnival, one for Norwegian, etc.). Replace the Cordelia reference with the line-appropriate Tier-3 fallback on every ship under that line. Pages now pass at Tier 3 with a warning.
3. **Ongoing Tier-3 → Tier-2/1 upgrade:** as real ship-specific or sister-class dining photos are sourced (with proper attribution per ATTR-001/003), replace the Tier-3 fallbacks. Rule's Tier-3 warning visible on any page still using line-generic; becomes the work-queue signal.

### Why the three-tier approach is better than either extreme

- **Better than "keep Cordelia"**: pages stop claiming a Cordelia Empress buffet is what Allure's dining looks like. That was always a lie.
- **Better than "no hero at all during transition"**: the visual slot stays filled; pages don't look broken during the months of image sourcing.
- **Better than "ship-specific or nothing"**: recognizes the reality that 295 ships * 1+ dining image each is a large sourcing project. Tier 2 (sister class, high design fidelity) and Tier 3 (line-generic, still correct brand) let work proceed incrementally.

---

## Rule
(After the above decision is implemented) A ship page's dining hero image must come from one of three acceptance tiers, ranked by fidelity: (1) ship-specific, (2) sister ship of the same class, (3) cruise-line-generic. Images from different cruise lines, stock photos, or the known Cordelia_Empress_Food_Court.webp placeholder are rejected.

## Why (rationale)
Pastoral honesty. Readers planning to cruise Icon of the Seas should not be shown a buffet photo from Cordelia Empress, an unrelated cruise line. The three tiers balance pastoral honesty against the practical reality that real dining photos for 295 ships is a multi-month sourcing project.

## Pass example (Tier 1 — ideal)
```html
<!-- Allure of the Seas page -->
<img id="dining-hero" src="/assets/ships/rcl/allure-of-the-seas/chops-grille-interior.webp"
     alt="Chops Grille steakhouse aboard Allure of the Seas"/>
```
Tier 1 — ship-specific. Passes.

## Pass example (Tier 2 — sister class)
```html
<!-- Allure of the Seas page (Oasis-class) — borrowing from Harmony of the Seas (also Oasis-class) -->
<img id="dining-hero" src="/assets/ships/rcl/harmony-of-the-seas/main-dining-room.webp"
     alt="Royal Caribbean Oasis-class Main Dining Room (sister-ship image)"/>
```
Tier 2 — sister of same class. Passes.

## Pass example (Tier 3 — cruise-line-generic, warn)
```html
<!-- A ship whose dining hero is a generic Royal Caribbean image -->
<img id="dining-hero" src="/assets/ships/rcl/rcl-dining-generic.webp"
     alt="Royal Caribbean dining — representative image"/>
```
Tier 3 — line-generic. Passes with warning; upgrade to Tier 2 or 1 when real imagery available.

## Fail example (cross-line — the Cordelia case)
```html
<img id="dining-hero" src="/assets/img/Cordelia_Empress_Food_Court.webp" alt="..."/>
```
Different cruise line entirely. Validator emits: `Dining hero uses Cordelia Empress (wrong cruise line). Use ship-specific or sister-class or line-generic instead.`

## Fix guidance
- **Tier 1:** source a real dining photo from the specific ship, with full attribution. ATTR-001 (attr.json) + ATTR-003 (source diversity) + IMG-014 (non-placeholder) all still apply.
- **Tier 2:** use a sister ship's dining photo. Alt text must honestly disclose: "Oasis-class Main Dining Room (sister-ship image)." Don't present sister-class imagery as the specific ship.
- **Tier 3:** use a cruise-line-generic image and alt-text that doesn't lie about ship-specificity. Treat the warning as a work-queue signal, not a permanent state.

## Related
- SCHEMA-010 — Review class-reference must match actual ship class (same SHIP_CLASSES mapping)
- ATTR-001 / ATTR-003 / IMG-014 — attribution + diversity + placeholder rules all still apply to the hero
- `SHIP_AUDIT_FINDINGS.md` cross-fleet-dining-hero entry — the motivating escape


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
