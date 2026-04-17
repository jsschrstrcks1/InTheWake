---
id: PORT-002
name: Logbook section word count between 800 and 2500
family: port
severity: error
applies-to:
  - port
provenance: V+S-agree
status: live
implementation:
  - file: admin/validate-port-page-v2.js
    function: validateWordCounts (logbook)
    lines: "1057-1075"
check: word count of text inside the logbook section is >= 800 (BLOCKING error) and <= 2500 (warning)
standards-source:
  - doc: admin/claude/LOGBOOK_ENTRY_STANDARDS_v2.300.md
    section: "Narrative anatomy — 600-1,200 words target"
  - doc: admin/claude/LOGBOOK_WRITING_GUIDE.md
    section: "Story length"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-15
---

## Rule
The logbook section must contain at least 800 words and at most 2500. The 800-word floor is a BLOCKING error (logbooks shorter than this haven't earned the emotional arc the standard requires). The 2500-word ceiling is a warning (long-form logbook is fine if the content genuinely supports it).

**Note on doc discrepancy:** `LOGBOOK_ENTRY_STANDARDS_v2.300.md` says "600-1,200 words target." Validator enforces 800-2500. These are close but not identical — the 800-floor is stricter than the 600 target. This rule documents the validator's actual behavior (ground truth). If the discrepancy matters, it becomes a future V-S-conflict; for now flagged here for future cleanup.

## Why (rationale)
Logbook entries carry the site's pastoral voice and emotional weight. Under 800 words, the narrative anatomy (hook → tension → ship/port in action → emotional pivot → reflection) doesn't have room to unfold — the result is a brochure paragraph pretending to be a story. Over 2500, readers disengage.

## Pass example
Nassau logbook at 1100 words — opening hook (120w) + emotional tension (180w) + port in action (300w) + emotional pivot (250w) + reflection (250w). Passes.

## Fail example (BLOCKING)
A logbook at 420 words. Validator emits: `Logbook entry has 420 words, minimum is 800`.

## Fix guidance
Expand each movement of the narrative anatomy per LOGBOOK_ENTRY_STANDARDS_v2.300. Don't pad with description — each added paragraph should carry new observation, new tension, or new reflection. Empty "descriptive filler" to hit word count is exactly the machine-tell voice-audit (VOI-001) catches.
