# Phase A Execution Log — v2.5 Marketing Strategy

**Branch:** `claude/review-docs-and-repo-ekA62`
**Started:** 2026-05-05
**Operator:** Claude (Opus 4.7)
**Plan reference:** `/root/.claude/plans/resilient-dancing-turtle.md`

## Purpose

Phase A is the brand-protective triage of the 4 deployed Amazon-affiliate articles, executed regardless of whether the Amazon Associates account ultimately survives. The locked decision is to (1) restore the pastoral integrity of the `/solo/` URL space, (2) strip banned vocabulary from affiliate content, and (3) prune choice-paralysis-heavy link counts to brand-aligned levels.

## Pre-execution baseline (verified 2026-05-05)

### Affiliate-bearing files in scope (locked plan)

| File | amzn.to | "must-have" | Notes |
|---|---|---|---|
| `articles/cruise-cabin-organization.html` | 17 | 1 | Plan said 21 amzn.to; actual is 17 (some pruning already happened) |
| `articles/cruise-tech-photography-guide.html` | 18 | 0 | Matches plan; voice already clean |
| `articles/cruise-duck-tradition.html` | 7 | 0 | Matches plan; voice already clean |
| `packing-lists.html` | 5 | 0 | Matches plan; voice already clean |
| `solo/accessible-cruising.html` | 0 | 7 | To be deleted (pastoral URL collision) |

### Files outside the locked Phase A scope but bearing affiliates (newly discovered)

These were not in the plan's Phase A scope. Documented here for surfacing to user after locked scope is committed.

| File | amzn.to | "must-have" | Note |
|---|---|---|---|
| `internet-at-sea.html` | 12 | 0 | Sizable choice-paralysis risk; needs review |
| `travel.html` | 4 | 0 | Manageable count; needs review |
| `first-cruise.html` | 1 | 0 | Minimal; review only for context fit |
| `affiliate-disclosure.html` | 1 | 0 | Disclosure page; expected single example link |

**Sitewide total: 65 amzn.to links across 8 files** (the conversation-level "70" was approximate).

### Pastoral-affiliate sweep result

Running `grep -rl "amzn\.to" solo/` returns NOTHING. No amzn.to links in `/solo/` content. The bright line is currently respected for actual affiliate links. (The `/solo/accessible-cruising.html` ghost file has the framing without the links — to be deleted regardless.)

### Inbound-link analysis for `/solo/accessible-cruising.html`

8 pages link to `/solo/accessible-cruising.html`:
- `solo.html`
- `solo/solo-cruising-practical-guide.html`
- `solo/in-the-wake-of-grief.html` (pastoral)
- `solo/articles/solo-cruising-practical-guide.html`
- `solo/articles/in-the-wake-of-grief.html` (pastoral)
- `solo/articles/accessible-cruising.html` (separate canonical accessibility content, 44KB, real content)
- `ports/endicott-arm.html`
- `ports/tender-ports.html`

### Critical disambiguation

`/solo/accessible-cruising.html` (14KB, the file being deleted) and `/solo/articles/accessible-cruising.html` (44KB, kept) are two completely different files:

- **Deleted file**: meta description reads *"Curated list of must-have luggage, gadgets, organizers, and fun items for cruisers — fully Amazon affiliate compliant for every country."* — gear list with pastoral URL collision; currently has 0 amzn.to but retains framing
- **Kept file**: *"Accessible Cruising: Five Universal Principles for Disabled Travelers"* — genuine accessibility content

**Redirect target adjustment:** Plan originally said redirect to `/articles/` index. Better target is `/solo/articles/accessible-cruising.html` because (a) it IS genuine accessibility content matching what the inbound links promise, (b) the inbound links come from pastoral and port-accessibility surfaces where "real accessibility info" is the user intent. This is a judgment-call refinement of the locked decision (delete + redirect), not a divergence from it.

### Redirect mechanism

`.htaccess` exists at repo root with `RewriteRule` lines already in use for legacy URL redirects. The Phase A redirect will be added to this file.

## Execution log

### A1 — Delete `/solo/accessible-cruising.html` + 301 redirect

- Commit: `ecef14bf`
- Files: deleted `solo/accessible-cruising.html`; modified `.htaccess` (added 301), `sitemap.xml` (removed orphan entry)
- Verification: file no longer exists; .htaccess redirect routes to canonical `/solo/articles/accessible-cruising.html`
- Pre-commit hook: passed
- Inbound-link cleanup (8 referring pages) deferred — 301 will handle redirects; consider direct-link refresh as separate housekeeping pass

### A2 — Strip remaining "must-have" from Phase A files

- Files in scope (4 affiliate articles + packing-lists): now zero "must-have" hits
- Single remaining instance was in `articles/cruise-cabin-organization.html:31` ai-summary meta tag — rewritten to brand voice
- Sitewide remaining "must-have" hits (NOT in Phase A scope): `ports/adelaide.html`, `ships/allshipquiz.html`, `ships/quiz.html` — surfaced for follow-up cleanup pass
