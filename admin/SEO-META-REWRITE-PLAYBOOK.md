# SEO Meta-Rewrite Playbook (W7/W9)

**Plan reference:** v2.5 W7/W9 — meta-rewrite sprint targeting top zero-click queries from Bing Webmaster Tools.
**Owner:** Ken
**Last updated:** 2026-05-06 (W7/W9 sprint baselines logged)

---

## The hypothesis we're acting on

The site is cited by Microsoft Copilot ~21,000 times per 90-day window but pulls only ~1,100 Bing organic clicks at ~2.1% CTR. Several queries surface high impressions and 0% CTR — meaning the page ranks but the SERP snippet doesn't pull the click.

Most often the cause is one of three things:

1. **Title is too long.** Truncated at ~580 px (≈55–65 characters depending on letter widths). The hook gets cut off.
2. **Description leads with format, not answer.** "First-person logbook guide to ..." or "Complete guide on ..." burns the first line of the snippet on meta-talk before delivering the answer the searcher came for.
3. **Title or description doesn't match the query language.** Searcher types "what happened to majesty of the seas"; page title says "Deck Plans, Live Tracker." Mismatch kills click intent.

Fix: rewrite for the searcher's actual question, in the searcher's words, within the SERP-display character budget.

---

## Length rules

| Field | Target | Hard cap | Notes |
|---|---|---|---|
| `<title>` | 50–60 chars | 65 chars | Including `| In the Wake` brand suffix. Google sometimes auto-adds the brand if missing; we include it for consistency. |
| `<meta name="description">` | 140–155 chars | 160 chars | Truncated at ~160 on desktop, ~120 on mobile. Front-load the answer. |
| `<meta property="og:description">` | match `description` | — | Same character budget; some social platforms display longer, but optimize for the desktop-search budget. |
| `<meta name="twitter:description">` | match `og:description` | 200 chars | Twitter allows longer but social CTR matters less than search CTR for our audience. |
| `<meta name="ai-summary">` | leave as-is | — | This feeds AI grounding; it's already tuned for the 21K-citation use case. **Do not rewrite for SEO.** |
| JSON-LD `description` field | leave as-is unless materially wrong | — | Schema validators care; SEO doesn't read this for SERP snippets. |

When the existing description is significantly off but the AI summary is right, **only update the search-facing metas**, not the AI summary. Different audiences, different optimization targets.

---

## Voice rules (carried from `admin/CTA-STYLE-GUIDE.md`)

- **No banned vocabulary.** Specifically: "must-have," "must-do," "ultimate," "definitive," "complete guide," "everything you need to know."
- **No urgency framing.** "Don't miss," "act now," "limited time," "before it's too late." None of these.
- **No first-person promotional posture in metas.** "First-person logbook guide" is description-of-format, not description-of-content; avoid in meta descriptions even if the page genuinely is a logbook entry.
- **Match the query language.** If searchers type "endicott arm" lowercase, the meta should say "Endicott Arm" (proper case) — but the *content phrasing* should match how a searcher would describe what they want. "Where is it," "what happened to it," "is it still sailing," "best time to visit" are all natural query patterns.
- **Lead with the answer.** First 60 characters of the description must contain the most useful fact.

---

## Process — applying the playbook to one page

1. **Read the BWT data.** Identify the query that lands on this page with high impressions + low CTR.
2. **Read the current page.** Confirm the page actually contains the answer to the query. If the page doesn't answer the question, the fix is content, not metas.
3. **Audit the existing metas.** Note title length, description length, lead phrasing.
4. **Draft the new title.** Lead with the page-name recognition string (so the result is recognizable as "this is the page about X"), follow with the differentiating hook the searcher cares about, end with `| In the Wake`.
5. **Draft the new description.** First 60 characters: the answer. Next 60: the differentiating context. Last 30: what the page covers in detail. Stop at 155.
6. **Mirror to og:description and twitter:description.** Usually byte-identical to `description`; can be a slightly different framing if SEO and social SERPs diverge.
7. **Verify ai-summary and JSON-LD.** Don't change unless materially wrong.
8. **Commit one page per atomic commit** so the BWT impact is measurable per change.

---

## Worked example 1 — `endicott-arm.html`

**Likely high-impression / zero-click query:** `endicott arm` (vague), `endicott arm cruise`, `endicott arm vs tracy arm`.

**Audit of current metas:**
- Title: `Endicott Arm & Dawes Glacier Guide — Alaska | In the Wake` (76 chars — over budget; gets truncated at "Alaska")
- Description: `First-person logbook guide to Endicott Arm and Dawes Glacier scenic cruising — Alaska's pristine 30-mile fjord, spectacular iceberg fields, harbor seal colonies, calving glacier views, and wildlife watching tips for this Tracy Arm alternative.` (245 chars — way over; truncated mid-sentence)

**Diagnosis:**
- Title leads with "& Dawes Glacier Guide" — wordy, brand-decorated, not query-matched.
- Description leads with "First-person logbook guide" — meta-talk, not the answer.
- The actually-useful hook ("Tracy Arm alternative") is the *last* phrase, after truncation.

**Rewrite:**
- New title: `Endicott Arm, Alaska — Tracy Arm's quieter alternative | In the Wake` (67 chars — borderline; safe)
- New description: `A 30-mile glacial fjord in Southeast Alaska — Tracy Arm's quieter alternative. Cruise lines that visit, Dawes Glacier views, and the best months for harbor seals.` (161 chars — borderline; safe)

Why it works: the searcher who typed "endicott arm" sees a title that confirms the page is about exactly that, with the answer to the most likely follow-on question ("how does it compare to Tracy Arm?") right there in the title. The description front-loads the geographic answer and lists the three things people most often want to know.

---

## Worked example 2 — `ships/rcl/majesty-of-the-seas.html`

**Likely high-impression / zero-click query:** `majesty seas` (the plan named this explicitly), `what happened to majesty of the seas`, `is majesty of the seas still sailing`.

**Audit of current metas:**
- Title: `Majesty of the Seas (1992-2020) — Deck Plans, Live Tracker, Dining & Videos | In the Wake` (91 chars — way over budget; "Live Tracker" misleading for retired ship)
- Description: `Majesty of the Seas (1992-2020): history, dining venues, and legacy of Royal Caribbean's third Sovereign Class ship. Explore this classic vessel with In the Wake.` (162 chars — borderline)

**Diagnosis:**
- Title contains "Live Tracker" — false promise for a retired ship; CTR-killer once a searcher reads the date range.
- Title contains "Deck Plans, Dining & Videos" — wordy and reads as a content listing, not a hook.
- Description ends with "Explore this classic vessel with In the Wake" — branded promotional posture, not an answer.
- The most interesting hook (the ship is the only surviving Sovereign-class vessel and is now laid up in Greece) is *not* in either field.

**Rewrite:**
- New title: `Majesty of the Seas (1992–2020) — retired Sovereign-class | In the Wake` (71 chars — borderline; consider shortening if SERP shows truncation)
- New description: `Royal Caribbean's third Sovereign-class ship (1992–2020) — short Bahamas runs from Miami. The only surviving Sovereign vessel, now laid up in Greece.` (149 chars — clean)

Why it works: searcher who types "majesty seas" or "what happened to majesty of the seas" gets a title that confirms the page is about that ship and signals the most-asked question (it's retired). Description front-loads the operational history and ends with the genuinely-interesting ongoing-status hook ("now laid up in Greece") that's a CTR-puller for anyone curious about cruise-ship retirements.

---

## When the page itself is the problem

Sometimes the BWT data shows a query landing on a page where the page genuinely doesn't answer the question. In that case the fix is content, not metas:

- If the page lacks the relevant section, **add the section** — keep it short (one paragraph), match the question language, link out to deeper relevant pages.
- If the page is the wrong target for the query, the answer page may already exist elsewhere; check the search-index. If a better target exists, the fix is internal-link routing (other pages linking to the better target with anchor text matching the query).
- If the page concept doesn't exist at all, this is a content-creation backlog item, not a meta-rewrite item. Note it for the next content sprint and move on.

---

## Tracking template

When a meta-rewrite is shipped, log it here with the BWT baseline so impact can be measured 30/60/90 days later:

| Date | Page | Query | Pre-rewrite impressions / clicks / CTR / position | Post-rewrite (30d) | Post-rewrite (60d) | Post-rewrite (90d) |
|---|---|---|---|---|---|---|
| 2026-05-06 | `/ports/endicott-arm.html` | `endicott arm` | (BWT data needed) | | | |
| 2026-05-06 | `/ships/rcl/majesty-of-the-seas.html` | `majesty seas` | (BWT data needed) | | | |
| 2026-05-06 | `/drink-packages.html` | `cruise drink packages`, `royal caribbean drink package cost` | 7,800 imp / 78 clicks / 1.00% / pos 5.90 | | | |
| 2026-05-06 | `/restaurants/casino.html` | `cruise ship casino`, `smoking on cruise casino` | 1,600 imp / 4 clicks / 0.26% / pos 6.51 | | | |
| 2026-05-06 | `/ports/royal-beach-club-nassau.html` | `royal beach club nassau` | 851 imp / 10 clicks / 1.18% / pos 6.20 | | | |
| 2026-05-06 | `/ships/rcl/enchantment-of-the-seas.html` | `enchantment of the seas`, `is enchantment of the seas still sailing` | 760 imp / 1 click / 0.13% / pos 7.41 | | | |
| 2026-05-06 | `/ports/puerto-caldera.html` | `puerto caldera`, `puerto caldera costa rica cruise` | 671 imp / 3 clicks / 0.45% / pos 7.51 | | | |
| 2026-05-06 | `/ships/rcl/radiance-of-the-seas.html` | `radiance of the seas` | 242 imp / 0 clicks / 0.00% / pos 7.20 | | | |
| 2026-05-06 | `/ports/mystery-island.html` | `mystery island vanuatu`, `mystery island cruise port` | 307 imp / 3 clicks / 0.98% / pos 7.84 | | | |
| 2026-05-06 | `/ports/cape-liberty.html` | `cape liberty cruise port`, `cape liberty bayonne new jersey` | 798 imp / 17 clicks / 2.13% / pos 5.27 | | | |

Pull the BWT data for each query when the rewrite ships, so the 30/60/90-day comparisons measure something concrete.

---

## Application sequence — when you have the live BWT export

1. Pull the top 20 queries by impressions where CTR < 1% (or a similar threshold tuned to your data).
2. Filter out queries where the landing page genuinely doesn't answer the question (those become content tasks, not meta-rewrite tasks).
3. From what remains, take the top 10. Apply this playbook one page at a time.
4. Commit each page as its own atomic commit so the BWT impact per change is measurable.
5. Re-pull BWT 30 days later for each modified page; record CTR delta.
6. If CTR moved meaningfully on most pages, this is a recurring quarterly sprint.
7. If CTR didn't move on most pages, the cause is something else (page content, ranking position, query-page mismatch); don't burn cycles continuing to rewrite metas.

---

*Soli Deo Gloria.*
