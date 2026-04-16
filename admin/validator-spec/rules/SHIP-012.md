---
id: SHIP-012
name: Trust badge present in footer
family: ship
severity: warn
applies-to:
  - ship
provenance: V-only
status: live
implementation:
  - file: admin/validate-ship-page.js
    function: validateFooterTrustBadge
    lines: "2160-2170"
check: footer contains a trust-badge element with text "No ads. Minimal analytics. Independent of cruise lines." and an affiliate-disclosure link
standards-source: silent
standards-backfill: yes
decision: FINAL
last-updated: 2026-04-16
---

## Rule
Ship page footers must contain the trust badge:
```
✓ No ads. Minimal analytics. Independent of cruise lines. Affiliate Disclosure
```
The element has class `trust-badge` and contains an anchor to `/affiliate-disclosure.html`.

## Why (rationale)
The trust badge is the site's explicit statement of editorial independence from cruise lines and its commitment to minimal analytics / zero advertising. It's how readers know they're on an independent site, not a cruise-line marketing page. Its absence is both a trust signal gap and a compliance gap for the affiliate-disclosure link.

Standards describe the concept; the exact text is validator-policy. Backfill should capture both the wording and the link.

## Pass example
```html
<footer>
  <p class="trust-badge">
    ✓ No ads. Minimal analytics. Independent of cruise lines.
    <a href="/affiliate-disclosure.html">Affiliate Disclosure</a>
  </p>
  ...
</footer>
```

## Fail (warning) example
Footer without the trust badge, OR footer with different wording, OR footer missing the Affiliate Disclosure anchor. Validator emits: `Missing trust badge in footer. Expected: <p class="trust-badge">✓ No ads. Minimal analytics. Independent of cruise lines. <a href="/affiliate-disclosure.html">Affiliate Disclosure</a></p>`.

## Fix guidance
Copy the badge element from a known-good ship page. Don't rewrite the wording — the exact text is the rule. If the disclosure page path changes, update both this rule and the validator to match.
