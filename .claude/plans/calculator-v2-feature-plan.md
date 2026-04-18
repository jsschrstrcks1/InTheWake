# Drink Calculator V2 — Approved Feature Plan

## Status: APPROVED (pending math bug fix)

## User Decisions (2026-04-18)

### BUILD (approved)
- **A** — Data source transparency panel
- **B** — Printable summary (print-first CSS)
- **E** — Break-even crossover chart with CDC thresholds + 4.7 industry avg overlay (clean, easy to read)
- **F** — Mandatory-purchase warning badges
- **NEW-1** — Plain-English risk summary (careful not to over-warn — tone it as helpful context, not alarm)
- **NEW-3** — Recovery-sensitive presets with "Sober/Recovery", "Very light drinker", "Non-alcoholic focus" — include mention of onboard "Friends of Bill W." meetings
- **NEW-4** — Health & Budget Risk Index — pre-populate trip cost with per-line average inside cabin price (research agents calculate this per line, updates on line switch)
- **NEW-5** — Marketing hype decoder
- **NEW-7** — Hidden-fees & auto-gratuity explainer
- **NEW-10** — Line-specific edge-case notes
- **NEW-11** — Accessibility-first risk indicators (WCAG 1.4.1)
- **NEW-12** — Merged into E (industry benchmark on crossover chart)
- **NEW-13** — International units converter (US ↔ UK)

### SKIP (user rejected)
- **NEW-6** — Vacation-mode reality check ("nahh")
- **NEW-8** — Group pressure lens ("nahhh")
- **NEW-9** — Cashless card overspend ("nah")

### CLARIFICATIONS
- **NEW-1**: User concerned about over-warning. Keep tone helpful, not alarmist. One sentence, not a paragraph.
- **NEW-2**: User says v1 already has this (inline price editing). Verify — if already working, skip. If not prominent enough, make more visible.
- **NEW-4**: Pre-populate trip cost field with per-line average inside cabin price. Research agents should calculate this for each of the 15 lines and store in config. Auto-updates when user switches lines.
- **NEW-12**: Fold into E — the 4.7 drinks/day industry average goes on the crossover chart, not as a separate feature.
- **NEW-3**: Include a note about "Friends of Bill W." meetings available on most major cruise lines.

## BLOCKER: Math Issue
User reports a math issue exists and is highest priority. Must find and fix before any feature work.

## Referenced from
- `/root/.claude/plans/bright-strolling-gem.md` (pipeline debate history)
- Session: `018zZKNJYWG3TdWWqibJUmFb`
