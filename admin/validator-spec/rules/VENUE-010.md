---
id: VENUE-010
name: "Varies by venue" price placeholder forbidden in key facts
family: venue
severity: warn
applies-to:
  - venue
provenance: S-only
status: live
implementation: none
check: venue key-facts / price field does NOT equal "Varies by venue", "Varies by cruise line", "Please check", or similar non-informative placeholders
standards-source:
  - doc: admin/VENUE_PAGE_AUDIT_2026_03_04.md
    section: "Generic 'Varies by venue' price key fact — no actionable info (187 pages)"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-16
---

## Rule
A venue's price-related key fact must carry actual information. The values "Varies by venue", "Varies by cruise line", "Please check with your cruise line", or similar non-informative placeholders do not satisfy — they occupy the price slot without answering the price question.

No validator currently enforces this; the 2026-03 audit manually caught 187 pages with the exact "Varies by venue" phrase. Rule on orphan list until a validator check is added.

## Why (rationale)
The key-fact block is what a reader scans when deciding whether to continue reading. A price line reading "Varies by venue" is worse than no line at all — it consumes the visual slot and says nothing. Readers learn to distrust the page. 187 pages with this pattern means 40% of the venue fleet is failing this trust check.

## Pass example
```
Price: $35 cover (Oasis class), $39 cover (Icon class), included in Ultimate Dining Package
```

## Fail example
```
Price: Varies by venue.
```
No validator catches this today. Future implementation: regex on common placeholder phrases within the key-fact price field.

## Fix guidance
Replace with real price information. Include volatility disclosure if prices change frequently (ICP-2 volatile-data discipline): "As of 2026-01; verify at your cruise line's current pricing." Do NOT leave the placeholder while the work is pending — either do the research or remove the key-fact line entirely. Placeholder prose is the 500-zombie-rules failure mode the project exists to prevent, applied to content instead of rules.
