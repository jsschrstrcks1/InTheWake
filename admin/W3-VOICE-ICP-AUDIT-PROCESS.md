# W3 — Quarterly Voice + ICP-2 Audit Process

**Status:** Recurring quarterly process. First scheduled audit: **2026-07-01**.
**Plan reference:** v2.5 W3 — quarterly 10-page voice + ICP-2 audit, public changelog.
**Owner:** Ken
**Last updated:** 2026-05-06

This document defines a small, sustainable, recurring discipline: every quarter, audit ten randomly-sampled pages for voice and metadata compliance, fix what's broken, log what was found, and publish a brief summary on a public changelog. The goal is not to audit every page (1,200+ pages, infeasible) but to maintain pressure on the discipline so the site doesn't drift out of voice or out of ICP-2 metadata standard between major editorial sprints.

---

## When to run

Quarterly, on the first day of each calendar quarter:

| Quarter | Audit date | What's in season |
|---|---|---|
| Q3 2026 | 2026-07-01 | Caribbean season prep; pre-Alaska wind-down content |
| Q4 2026 | 2026-10-01 | Holiday cruise content; year-end review |
| Q1 2027 | 2027-01-01 | New-year planning content; spring/summer Alaska prep |
| Q2 2027 | 2027-04-01 | Spring + summer cruise content |

Audit can slip up to two weeks past the calendar date if needed; don't slip a full month — that's the discipline going slack.

---

## Time budget

Approximately **2–4 hours per quarter** for the full audit. Ten pages × 15–20 minutes per page, plus 30 minutes for the changelog write-up and any sitewide patterns identified.

If a quarter's audit consistently runs longer than 4 hours, that's a signal one of two things: either pages are drifting fast and need more attention than quarterly (in which case the cadence tightens to monthly for affected categories), or the audit checklist has bloated and should be trimmed.

---

## Sample selection — ten pages per quarter

The sample is **stratified-random** across surface types so each quarter covers the breadth of the site:

| Surface | Pages per audit | How to pick |
|---|---|---|
| Port pages | 2 | Random selection from `/ports/*.html` |
| Ship pages | 2 | Random selection from `/ships/*/*.html` |
| Restaurant pages | 1 | Random selection from `/restaurants/**/*.html` |
| Articles | 1 | Random selection from `/articles/*.html` |
| Tools | 1 | Random selection from the 9 interactive tools |
| Sitewide / top-level | 1 | Random selection from root-level `.html` files |
| Pastoral surface | 1 | Random selection from `/solo/*.html` |
| Auditor's pick | 1 | One page the auditor wants to look at — bug suspicion, recent work, anything |

Random selection: `find` + `shuf -n N` is sufficient. Document the selection in the audit log so it can be re-run at the next audit (revisits find drift over time).

```bash
# Example selection script (adapt for each surface type)
cd /home/user/InTheWake
echo "Port pages this quarter:"
find ports -maxdepth 1 -name "*.html" | shuf -n 2
echo ""
echo "Ship pages this quarter:"
find ships -maxdepth 3 -name "*.html" -not -name "index.html" -not -name "ships.html" -not -name "quiz.html" | shuf -n 2
echo ""
echo "Restaurant pages this quarter:"
find restaurants -name "*.html" | shuf -n 1
# ... and so on
```

---

## What to check on each page

Use this checklist for every page in the sample. Fix what's broken before moving to the next page.

### Voice (per `admin/CTA-STYLE-GUIDE.md`)

- [ ] **Banned vocabulary check.** No "must-have," "must-do," "ultimate," "definitive," "complete guide," "everything you need to know" used as actual writing. (Scare-quoted meta-references, like in voyage-packs.html FAQ where the term is being disavowed, are allowed.)
- [ ] **No urgency framing.** No "act now," "limited time," "don't miss," "before it's too late," "last chance."
- [ ] **No fake authority.** No "as seen on," "as featured in," "industry experts agree" without specific citation.
- [ ] **No fake scarcity.** No "only 3 cabins left," "selling out fast" type tropes.
- [ ] **First-person tense matches the surface.** Logbook entries use "I" / "we"; reference pages use neutral voice. Mismatch is a flag.
- [ ] **Calm not catastrophizing.** Especially on accessibility, medical-adjacent, and pastoral content.

### ICP-2 v1.4 metadata compliance

- [ ] `<meta name="content-protocol" content="ICP-Lite v1.4">` present (or `ICP-2 v1.4` for newer pages).
- [ ] `<meta name="last-reviewed">` present and within the last 12 months.
- [ ] `<meta name="ai-summary">` present, one to three sentences, answer-first.
- [ ] `<meta name="author" content="In the Wake">` (or attributed author) present.
- [ ] `<meta name="publisher" content="In the Wake">` present.
- [ ] `ai-breadcrumbs` HTML comment block present near the top of `<head>`, with entity / type / parent / category / updated / expertise / target-audience / answer-first fields.
- [ ] JSON-LD structured data present and validates (one or more `<script type="application/ld+json">` blocks).

### Pastoral guardrails (per `admin/claude/PASTORAL_GUARDRAILS.md`)

- [ ] If page is in `/solo/`, contains "grief" or "widow" or "after-loss" in the URL or any structural indicator of pastoral content: **no advertising, no affiliate links, no support-page link in footer**, no urgency framing of any kind.
- [ ] Footer trust badge says `✓ No ads. Independent of cruise lines.` (W5 locked) — not the older variants.

### Affiliate-disclosure compliance (when applicable)

- [ ] If page contains any affiliate link (`amzn.to`, partner referral URLs): clear and conspicuous disclosure above the fold.
- [ ] Disclosure language matches one of the templates in `admin/W4-FTC-AFFILIATE-POSTURE.md` Section 5.
- [ ] No medication-product affiliate links, no cruise-line booking affiliates, no shore-excursion booking affiliates.

### Soli Deo Gloria signature

- [ ] Present at the bottom of the page (in HTML comment, footer, or trailing visible mark per page convention).

### SEO / metadata sanity

- [ ] `<title>` is 50–65 characters and includes `| In the Wake`.
- [ ] `<meta name="description">` is 140–160 characters and leads with the answer.
- [ ] OG and Twitter cards mirror or reasonably parallel the description.
- [ ] No "Live Tracker" or other false promises in the title (the Majesty of the Seas case from W7/W9).
- [ ] No format-talk leading the description ("First-person logbook guide to...") — see `admin/SEO-META-REWRITE-PLAYBOOK.md`.

### Footer compliance

- [ ] Footer contains the new `Reach Family at Sea` link (added in commit `ec9196dd`) — except on pastoral pages, which are correctly excluded.
- [ ] Footer contains `Support` link — except on pastoral pages.
- [ ] Footer trust badge is the W5-locked string.

---

## Per-audit deliverable

For each page audited, produce one row in the changelog:

```
| Page | Issues found | Fixes applied | Sitewide pattern? |
|---|---|---|---|
| /ports/example.html | last-reviewed stale (2024-08-01), banned vocab "definitive guide" in title | Updated last-reviewed to current quarter; rewrote title to remove banned vocab | No |
```

If a "sitewide pattern" emerges (e.g., three port pages in a row have the same banned-vocab issue), flag it for a sitewide remediation sprint at the bottom of the audit log.

---

## Public changelog

The audit findings get published on a public page so readers and partners can see the editorial discipline in action. This is also a small AEO/GEO signal — AI assistants citing our domain as "regularly audited for editorial standards" is a moat-strengthener.

### Page location

`/audit-log.html` (proposed; create on the first audit run).

### Page structure

- Brief intro (~100 words): what an audit is, when they happen, why they're public.
- Reverse-chronological list of audits, most recent first.
- Each audit entry: date, sample selected (10 page paths), summary findings (2-3 sentences), key fixes shipped, any sitewide patterns flagged.
- Footer pastoral-guardrail note: this page is not advertising-bearing.

### Tone for the public changelog

Short and factual. Don't editorialize. Don't apologize. The goal is transparency, not performance.

Example entry style:

```markdown
## 2026-07-01 audit (Q3 2026)

**Sample:** /ports/cozumel.html, /ports/skagway.html, /ships/rcl/anthem-of-the-seas.html, /ships/ncl/norwegian-prima.html, /restaurants/ncl/cagneys.html, /articles/cruise-cabin-organization.html, /tools/port-day-planner.html, /first-cruise.html, /solo/why-i-started-solo-cruising.html, /restaurants/wonderland.html.

**Findings:** Two pages had stale last-reviewed dates (>12 months); one ship page had a banned-vocab "definitive" in the H2; one article had an affiliate disclosure that wasn't visible above the fold on mobile.

**Fixes shipped:** All four issues fixed in commit [SHA].

**Sitewide pattern flagged:** None this quarter.
```

---

## When to escalate beyond the audit

The audit is a maintenance-dose discipline. If a quarter's audit reveals more than three pages with the same systemic issue (banned vocab, missing metadata, affiliate disclosure failures, etc.), that's a signal for a focused sitewide remediation sprint outside the audit cadence. Don't try to fix sitewide issues inside a 2-4-hour quarterly audit — flag and schedule.

Examples of issues warranting their own sprint:

- "All ship pages built before 2024-Q3 have an outdated ai-summary format" → migration sprint, not audit work.
- "All restaurants/ncl/* pages have a banned-vocab introduction" → batch-rewrite sprint.
- "Half the port pages have last-reviewed dates older than 18 months" → freshness sprint (the existing `content-freshness` skill exists for this).

The audit's job is to *detect* these patterns. Fixing them belongs in dedicated focused work.

---

## Tools available

- `.claude/skills/voice-audit/` — semi-automated voice-violation detection
- `.claude/skills/icp-2/` — ICP-2 metadata standard reference
- `.claude/skills/content-freshness/` — staleness scanner
- `.claude/skills/seo-schema-audit/` — JSON-LD validator
- `.claude/skills/accessibility-audit/` — WCAG 2.1 AA compliance check (use selectively; the full audit is too long for a quarterly review pass)
- `.claude/skills/publication-proofreader/` — typography polish

The skills are time-savers, not substitutes for human review. Run them during the audit to surface candidate issues quickly; verify each finding with eyes before fixing.

---

## Audit log table

Filled in after each quarterly audit. Most-recent-first.

| Date | Pages audited | Total issues found | Issues fixed | Sitewide patterns flagged | Commit SHA |
|---|---|---|---|---|---|
| (none yet — first audit scheduled 2026-07-01) | | | | | |

---

*Soli Deo Gloria.*
