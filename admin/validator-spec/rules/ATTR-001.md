---
id: ATTR-001
name: Every port image has a companion attribution JSON file
family: attr
severity: error
applies-to:
  - port
provenance: V+S-agree
status: live
implementation:
  - file: admin/validate-port-page-v2.js
    function: validatePortImages (attribution check)
    lines: "1413-1440"
check: for each file in /assets/ports/<slug>/*.webp, exists <name>-attr.json OR <name>.webp.attr.json at same path
standards-source:
  - doc: admin/claude/IMAGE_WORKFLOW.md
    section: "Attribution file format"
  - doc: admin/CAREFUL.md
    section: "Image Verification Protocol"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-15
---

## Rule
Every non-hero image file under a port's image directory must have a companion attribution JSON file (either `<name>-attr.json` or `<name>.webp.attr.json`) at the same path. The attribution JSON documents source URL, license, photographer, and verification stamp.

## Why (rationale)
Legal compliance with CC-BY-SA and similar license terms. Traceable provenance when an image is later questioned. Without attribution files, the site cannot defend its use of any image — and in fact cannot distinguish correctly-licensed images from unverified ones (see ATTR-003).

## Pass example
```
/assets/ports/nassau/
  nassau-prince-george-wharf.webp
  nassau-prince-george-wharf-attr.json   ← companion
  nassau-cable-beach.webp
  nassau-cable-beach-attr.json           ← companion
```

## Fail example
```
/assets/ports/nassau/
  nassau-cable-beach.webp                ← orphan, no attr.json
  nassau-hero.webp                       ← hero is exempt; not a violation
```
Validator emits `missing_attribution_files: N image(s) missing attribution files (-attr.json)`.

## Fix guidance
For each orphan image, create a `-attr.json` file with at minimum: `sourceUrl`, `license`, `photographer`, `title`, `description`, `verifiedBy`, `verifiedDate`. If you can't produce real values for all fields — delete the image. A fake attribution is worse than a missing image (see ATTR-003).
