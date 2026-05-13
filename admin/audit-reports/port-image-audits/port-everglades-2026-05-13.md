# Port image audit — port-everglades

**Date:** 2026-05-13
**Files:** 8
**Auditor:** Claude (session: claude/baseline-port-validation-Nbcst)
**Method:** Per Rule A of admin/SOURCING_HARDENING_PLAN_2026-05-12.md, Read-verify every file after the HTML hero-ref bug fix revealed a Flickr-889 placeholder shape and an ARR Flickr source.

## Verdicts

| # | File | Subject verdict | License (cited Flickr source) | Slot match | Action |
|---:|---|---|---|---|---|
| 1 | `attraction-1.webp` | **Port Everglades positive ID** (Southwest plane on FLL approach is diagnostic; FLL is adjacent to the port) | **ARR** — nyalr/50187972763 | ok | **replace** (cannot use ARR) |
| 2 | `attraction-2.webp` | **UNCLEAR** (3 cruise ships at sea: Celebrity Solstice, Caribbean Princess, Celebrity Silhouette — no port id visible) | **ARR** — robertstarling/45863267234 | ok | **replace** |
| 3 | `food.webp` | Fort Lauderdale yacht marina + Hilton hotel — *plausibly* near PE | **ARR** — 132779055@N06/26155439638 | **wrong slot** (no food visible) | **replace + rename slot** |
| 4 | `harbor.webp` | Port Everglades plausibly (RCL ship at night above multi-story cruise terminal parking garage; terminal architecture consistent) | **CC BY 2.0** — prayitnophotography/50647190106 | ok | **keep** |
| 5 | `hero.webp` | **UNCLEAR** (HAL Nieuw Statendam at tropical port at sunset; no PE-specific identifier visible) | **ARR** — robertstarling/51970979554 | ok | **replace** (also fixes the HTML path-typo since the new file will live at the proper path) |
| 6 | `landmark.webp` | Port Everglades plausibly (aerial of multiple cruise berths + adjacent petroleum tank farm; PE handles ~10% of US oil imports) | **CC BY 2.0** — prayitnophotography/50920244268 | ok | **keep** |
| 7 | `panorama.webp` | **UNCLEAR** (RCL Oasis-class silhouetted at golden hour; could be any major US homeport) | **ARR** — robertstarling/37644503854 | ok | **replace** |
| 8 | `street.webp` | **UNCLEAR** (RCL Freedom of the Seas at night) | **ARR** — robertstarling/24709710458 | **wrong slot** (no street) | **replace + rename slot** |

## Summary

- **Keep:** 2 / 8 (harbor + landmark — both from `prayitnophotography`, CC BY 2.0, plausible PE)
- **Replace (ARR license):** 6 / 8 — 4 with correct/plausible subject + ARR license, 2 with both wrong-slot and ARR

## Pattern observed

7 of 8 attr files cite a Flickr URL and used the Flickr-889 placeholder shape `"license": "Flickr (verify license)"`. When verify-flickr is run today:
- 2 from `prayitnophotography` → genuinely CC BY 2.0 → kept
- 6 from `robertstarling` (×4), `nyalr`, `132779055@N06` → All Rights Reserved → must be replaced

This port shipped 6 images the site has no license to use. The pattern is identical to the "Flickr-889 escape" the ATTR-003 validator rule was added to catch, but the source-URL diversity here (4 distinct photographers) hid it from the ATTR-003 source-diversity check.

## Scope-expansion flag

The original directive was "continue with the 5 remaining 1-broken-ref ports" — port-everglades was expected to be a path-typo fix. Instead it requires re-sourcing 6 images: a 6× scope expansion. Per Rule "Don't Scope-Expand a User Directive Without Re-Asking" in admin/CAREFUL.md, **pausing for user decision** before proceeding to 6 replacements.

## Open question for the user

The 6 ARR files are a hard integrity issue: hosting copyrighted images without permission violates the site's "NEVER skip attribution for Wiki Commons images" rule and exposes real legal risk. Two paths forward:

1. **Source 6 replacements now** in this session (estimated ~2-3 hours of careful work for this one port). Continues the proven one-image-at-a-time workflow.

2. **Delete the 6 ARR files now**, leaving the HTML with 6 broken image refs until a Phase 1.5b replacement pass reaches them. Stops the integrity bleed immediately but creates 6 broken-ref blockers + visible empty gallery slots in production.

3. **Defer** — leave the ARR files in place pending Phase 1.5b. Worst integrity, lowest immediate work.

My recommendation: option 1 (source 6 now). The careful path is to fix what's discovered as it's discovered. Option 2 is also defensible if the broken-ref blockers will get a fleet-wide fix quickly. Option 3 is not careful.

*Soli Deo Gloria.*
