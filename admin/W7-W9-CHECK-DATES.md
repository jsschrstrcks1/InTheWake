# W7/W9 Meta-Rewrite Sprint — Check-In Schedule

**Sprint shipped:** 2026-05-06
**Pages rewritten:** 10
**Owner:** Ken
**Source playbook:** `admin/SEO-META-REWRITE-PLAYBOOK.md` (full tracking table at the bottom)

---

## When to check

| Check | Date | What to do |
|---|---|---|
| **30-day check** | **2026-06-05** | Re-pull BWT for each page below; record post-30d impressions + clicks + CTR + position in the playbook tracking table. |
| **60-day check** | **2026-07-05** | Same. |
| **90-day check** | **2026-08-04** | Same. **Decision point:** if aggregate CTR moved meaningfully (target: weighted average 0.85% → ≥ 2%), this becomes a recurring quarterly sprint. If it didn't move, stop burning cycles on metas; the cause is something else (page content, ranking position, or dead-wood queries). |

---

## The 10 pages (with current baselines for quick scanning)

| # | URL path | Baseline imp / clicks / CTR / pos |
|---|---|---|
| 1 | `/ports/endicott-arm.html` | 1,200 / 13 / 1.12% / 5.73 |
| 2 | `/ships/rcl/majesty-of-the-seas.html` | 2,000 / 4 / 0.20% / 4.57 |
| 3 | `/drink-packages.html` | 7,800 / 78 / 1.00% / 5.90 |
| 4 | `/restaurants/casino.html` | 1,600 / 4 / 0.26% / 6.51 |
| 5 | `/ports/royal-beach-club-nassau.html` | 851 / 10 / 1.18% / 6.20 |
| 6 | `/ships/rcl/enchantment-of-the-seas.html` | 760 / 1 / 0.13% / 7.41 |
| 7 | `/ports/puerto-caldera.html` | 671 / 3 / 0.45% / 7.51 |
| 8 | `/ships/rcl/radiance-of-the-seas.html` | 242 / 0 / 0.00% / 7.20 |
| 9 | `/ports/mystery-island.html` | 307 / 3 / 0.98% / 7.84 |
| 10 | `/ports/cape-liberty.html` | 798 / 17 / 2.13% / 5.27 |

**Aggregate baseline (weighted by impressions):** 16,229 total impressions, 133 clicks, 0.82% weighted CTR.

**Aggregate target (weighted):** ≥ 325 clicks at 90 days = ≥ 2.0% CTR. That's roughly a 2.4× CTR lift.

---

## How to do the check

1. Open Bing Webmaster Tools → Search Performance → URL view.
2. For each of the 10 URLs above, pull the impressions/clicks/CTR/avg-position for the *most recent 30-day window*.
3. Open `admin/SEO-META-REWRITE-PLAYBOOK.md` → scroll to the tracking table at the bottom.
4. Fill in the "Post-rewrite (30d)" / (60d) / (90d) column for each row with the values you just pulled.
5. Commit the playbook update with a message like `seo: w7/w9 30-day check — [aggregate CTR delta]`.

---

## Decision criteria at the 90-day check

**Greenlight (≥ 2.0% weighted CTR):** the meta-rewrite hypothesis works for this audience. Make the W7/W9 sprint quarterly. Pull the next 8–10 zero-click pages from the live BWT export and apply the playbook.

**Yellow (1.0–2.0%):** modest improvement. Worth one more sprint at 6 months to see if the trend strengthens; don't expand to a quarterly cadence yet.

**Red (< 1.0%):** the meta is not the bottleneck. Possible causes (in order of likelihood): rankings are too low (the top result is the only thing most people click; positions 5–8 inherit a fraction of position-1 clicks regardless of meta); page content doesn't answer the query; or the queries themselves are dead wood (informational queries that get scraped by AI, never clicked). **Stop the meta-rewrite sprint.** Investigate one of: (a) page-content rewrites for the worst offenders, or (b) ranking-position work via internal linking + backlink acquisition (W8/W9).

---

## Why this is here

The v2.5 plan called this work *"slow-compounding."* It is. At 30 days the data will be noisy. At 60 days the signal will start clarifying. At 90 days you'll know whether to scale or kill. Don't read the 30-day data as decisive in either direction.

---

*Soli Deo Gloria.*
