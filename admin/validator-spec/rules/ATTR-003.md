---
id: ATTR-003
name: Attribution source-URL diversity within a gallery
family: attr
severity: error
applies-to:
  - port
  - ship
  - venue
provenance: V+S-agree
status: live
implementation:
  - file: admin/validate-port-page-v2.js
    function: detectGalleryAttributionCopyPaste
    lines: "2482-2525"
check: within a single gallery, unique count of attr.json sourceUrl values must be > 50% of total images (ruleOfThumb: if 4+ images share 1-2 source URLs, fail)
standards-source:
  - doc: admin/CAREFUL.md
    section: "Image Verification Protocol — 'Never do: Copy-paste the same attribution onto every image in a gallery'"
  - doc: admin/claude/IMAGE_WORKFLOW.md
    section: "Attribution diversity"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-15
---

## Rule
Within a single gallery section, the distinct-source-URL count for all attribution files must be > 50% of image count. Four or more images sharing one or two source URLs is a failure — it is nearly always either placeholder images, unverified downloads from one page, or copy-paste attribution.

## Why (rationale)
**The Flickr-889 escape.** In April 2026, 889 `-attr.json` files were discovered citing "Flickr public feed" as source — one identical placeholder URL on hundreds of files. Spot-checks with WebFetch proved the cited images were All-Rights-Reserved, not CC as claimed. This failure was caught by human auditing, not by any validator. This rule was added to prevent recurrence.

**The college-fjord escape.** In the same window, `college-fjord-*.webp` were blue-gradient placeholder rectangles — identical fake Flickr URLs on all of them. Same class of failure.

## Pass example
```
/assets/ports/nassau/ (12 images, 10 distinct sourceUrls across attr.json files)
  Gallery has 12 photo credits with 10 unique source URL(s) — passes.
```

## Fail example
```
/assets/ports/college-fjord/ (6 images)
  college-fjord-1-attr.json sourceUrl: "Flickr public feed"
  college-fjord-2-attr.json sourceUrl: "Flickr public feed"
  college-fjord-3-attr.json sourceUrl: "Flickr public feed"
  ... all 6 identical
```
Validator emits: `Gallery has 6 photo credits but only 1 unique source URL(s) — possible placeholder images or copy-paste attribution` (line 2518).

## Fix guidance
Do not copy-paste `sourceUrl` across files. If you only found one real source, use one image — don't fabricate six. When a gallery fails ATTR-003, the correct response is ALWAYS one of: (a) find real distinct sources, (b) reduce gallery to just the real images, (c) delete the gallery entirely. **Never** invent URLs to pass the check — that's exactly the escape this rule exists to catch.
