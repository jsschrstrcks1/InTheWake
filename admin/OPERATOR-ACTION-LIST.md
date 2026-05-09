# Operator Action List

**Purpose:** Single consolidated list of every manual action you (Ken) need to take across all v2.5 plan workstreams. Cross-references to the source docs for detail. Updated as items get done or as new ones surface.

**Status as of 2026-05-06:** all "I-can-do-without-user-action" v2.5 items shipped. This list is the remainder.

---

## How to use this list

1. **Critical-path items first.** These unblock revenue (W6.1 + W12). Until they're done, the rest of the work delivers calmly-compounding value but no money.
2. **Calendar-locked items next.** These have specific dates; missing them means data gaps, not failed projects.
3. **Ongoing-pacing items.** Slow drumbeat work (one-per-week or one-per-month). Don't try to do them in batches; the pacing matters.
4. **Annual / quarterly reviews.** Set calendar reminders.

If you only have an hour, do one critical-path item. If you only have ten minutes, do one item from a calendar or ongoing list. The system is designed to make slow progress easy.

---

## Critical path (unblocks revenue)

### 1. Register a Buy Me A Coffee handle (W6.1)

**Why:** `/support.html` is shipped with placeholder URLs (`buymeacoffee.com/inthewake`). Until a real BMAC handle exists, the support page produces zero revenue.

**Effort:** 15–30 minutes. Account creation, payout setup, basic profile.

**Steps:**
- [ ] Sign up at `buymeacoffee.com` with the email address you want to receive payment notifications on. Recommended: a dedicated `support@cruisinginthewake.com` or similar — keeps it separate from your personal email.
- [ ] Pick a handle. `inthewake` if available; `cruisinginthewake` as a backup; check before committing.
- [ ] Set up payout (Stripe-backed; bank account verification).
- [ ] Configure profile: tagline, link back to the site, banner image (reuse `assets/social/home-hero.jpg` if useful).
- [ ] Set up the **Membership** tier for the Duck Club: $3/month and $5/month options. Description: "Affinity recognition — annual sticker (mailed once per year), monthly footer member-thanks, early heads-up on new tools. No feature access; nothing on the site is gated." Cancel-anytime, no-questions-asked.
- [ ] Edit `/home/user/InTheWake/support.html`: replace `https://buymeacoffee.com/inthewake` placeholder URLs with the real ones. Two places (one for one-time tip, one for membership).
- [ ] Commit the URL update with a clear message; push.

**Source doc:** `admin/W6.1-SUPPORT-PAGE-SETUP.md` (operator-side checklist) and the v2.5 plan locked decisions for W6.1a + W6.1b.

---

### 2. Pick a W12 payment processor and follow the launch checklist

**Why:** `/voyage-packs.html` is shipped with placeholder buy-button URLs (`buymeacoffee.com/inthewake/extras/...`). Real URLs require a payment processor decision and the rest of the operational setup.

**Effort:** 4–8 hours total across the 13 checklist items, spread over 1–2 weeks. Item 1 (the decision) is 30 minutes; items 2–9 are the bulk of the work; items 10–11 are fast post-launch hardening.

**Recommended processor:** Gumroad. Fastest path to revenue (account today, selling tomorrow), built-in EU VAT handling, customer email list comes free. Higher fees than Stripe but you can migrate later if volume justifies the operational lift.

**Steps:** follow `admin/W12-PRODUCT-LAUNCH-CHECKLIST.md` items 1–9 in order. Items 10–13 are post-launch.

**Open content task that affects W12 launch (flagged separately below):**
- ⚠ The v0.1 Symphony pack only exists as markdown (`admin/voyage-packs/v0.1-symphony-western-caribbean-7n.md`). For the offline-PWA experience, an HTML render of that pack is needed (matching the v0.1.2 NCL Aqua HTML). Either: I (Claude) build it on a future session, OR you ship Symphony as PDF-only initially and add HTML in v0.2. Decide which.

**Source doc:** `admin/W12-PRODUCT-LAUNCH-CHECKLIST.md`

---

## Calendar-locked checks

### 3. BWT 30-day check on 10 W7/W9 pages — **2026-06-05**

**Why:** Measure whether the meta-rewrite hypothesis works for our audience. 10 pages were rewritten with explicit baselines logged on 2026-05-06; comparing 30/60/90-day post-rewrite numbers tells us whether the playbook is worth running quarterly.

**Effort:** 30–60 minutes.

**Steps:**
- [ ] Open Bing Webmaster Tools → Search Performance → URL view.
- [ ] For each of the 10 URLs in `admin/W7-W9-CHECK-DATES.md`, pull last-30-days impressions / clicks / CTR / avg-position.
- [ ] Open `admin/SEO-META-REWRITE-PLAYBOOK.md` → tracking table at the bottom → fill in the "Post-rewrite (30d)" column for each row.
- [ ] Note aggregate weighted-CTR delta. Don't make decisions yet; 30-day data is noisy.

**Source doc:** `admin/W7-W9-CHECK-DATES.md`

### 4. BWT 60-day check — **2026-07-05**
Same workflow. Signal should be clarifying.

### 5. First quarterly W3 voice + ICP-2 audit — **2026-07-01**

**Why:** First implementation of the recurring discipline; sets the cadence for every subsequent quarter.

**Effort:** 2–4 hours.

**Steps:**
- [ ] Generate the stratified-random sample using the script template in the audit process doc (2 ports + 2 ships + 1 restaurant + 1 article + 1 tool + 1 sitewide + 1 pastoral + 1 auditor's pick).
- [ ] Apply the per-page checklist. Fix anything found.
- [ ] Update `/audit-log.html` with the audit entry — sample, summary findings, key fixes shipped, sitewide patterns (if any).
- [ ] Commit the page update.

**Source doc:** `admin/W3-VOICE-ICP-AUDIT-PROCESS.md` + `/audit-log.html` (the public surface)

### 6. BWT 90-day check + decision — **2026-08-04**

**Why:** Decision point. If aggregate CTR moved meaningfully (≥2.0% weighted), W7/W9 becomes a quarterly recurring sprint. If it didn't move, stop the meta-rewrite work and look elsewhere (page content, ranking position, query relevance).

**Effort:** 30–60 minutes for the data pull; longer if a follow-up sprint is greenlit.

**Source doc:** `admin/W7-W9-CHECK-DATES.md` Section "Decision criteria at the 90-day check"

### 7. Q4 2026 W3 audit — **2026-10-01**
Same as the 2026-07-01 audit; second iteration.

### 8. Q1 2027 W3 audit — **2027-01-01**

### 9. Q2 2027 W3 audit — **2027-04-01**

---

## Ongoing pacing — slow drumbeat

### 10. Partnership outreach (W6.2) — **one email per week beginning Day 30**

**Why:** Build a real partnership pipeline. Goal: one signed partnership in 90 days.

**Effort:** 30 minutes per email + intermittent follow-up.

**Pacing:** **One direct outreach email per week.** More than that triggers spam-detection heuristics on the receiving end; less than that means the conversations don't compound.

**Order (per the target list):**
- Week 1: Allianz Global Assistance (insurance, largest brand, highest probability of real BD conversation)
- Week 2: Travelex Insurance Services
- Week 3: Special Needs at Sea (accessibility — fastest probable yes)
- Week 4: Wise (multi-currency)
- Week 5+: rest of the Tier 1 + Tier 2 list as outreach + responses unfold

**Steps:**
- [ ] Pick the next target from `admin/outreach-targets.md` (already prioritized).
- [ ] Adapt the email template at the bottom of that doc with the per-target talking points.
- [ ] Send. Log the date / target / contact path / response in the tracking table.

**Source doc:** `admin/outreach-targets.md` + `admin/media-kit.md` (attach to outreach)

### 11. Wikipedia citations (W8/W9 Workstream 1) — **one citation per month maximum**

**Why:** Single highest-leverage backlink workstream. Building a Wikipedia editing history first, then dropping legitimate citations on articles where In the Wake genuinely supports a specific claim.

**Effort:** 1–2 hours per citation (build a tiny editing history of typo fixes / dead-link replacements first, then submit the citation, monitor for revert).

**Pacing:** **One citation per month.** Faster triggers single-purpose-account flagging.

**First targets:** Endicott Arm, Tracy Arm, Symphony of the Seas, Norwegian Aqua, Majesty of the Seas, CVSSA 2010, Quintana Roo (time zone section).

**Source doc:** `admin/W8-W9-BACKLINK-STRATEGY.md` Workstream 1

### 12. Guest-post pitches (W8/W9 Workstream 2) — **one pitch per month maximum**

**Why:** Reciprocal traffic + backlinks from peer cruise publications. Goal: 3–5 published pieces over 12 months.

**Pacing:** **One pitch per month.** Don't pitch the same publication twice in 6 months unless they signal openness.

**First targets:** Cruzely, Cruise Maven, Prof. Cruise, Royal Caribbean Blog.

**Pitch material:** five concrete pitches outlined in `admin/W8-W9-BACKLINK-STRATEGY.md` Workstream 2 (Phase A Amazon audit story, Emergency Contacts handoff product, AI-citation moat meta-content, Endicott Arm + Princess shift, Norwegian Aqua first-year review).

**Source doc:** `admin/W8-W9-BACKLINK-STRATEGY.md` Workstream 2

### 13. HARO / Featured.com responses (W8/W9 Workstream 4) — **filter daily, respond when fit**

**Why:** Backlinks from national outlets are among the highest-quality available; the HARO (Help a Reporter Out) pipeline is the most direct path.

**Effort:** ~5 minutes daily to filter; ~30 minutes per actual response.

**Pacing:** **Daily filter, weekly response.** Most days the queries don't fit; respond when they do.

**Steps:**
- [ ] Subscribe at HARO + Featured.com.
- [ ] Daily filter on the Travel / Lifestyle daily emails.
- [ ] Respond when a query matches cruise-planning, cruise-accessibility, cruise-grief, or first-cruise content.

**Source doc:** `admin/W8-W9-BACKLINK-STRATEGY.md` Workstream 4

### 14. Wikimedia author-page reciprocals (W8/W9 Workstream 3) — **one-time setup**

**Why:** Bidirectional link between your Wikimedia Commons user page and the In the Wake author page strengthens the link graph.

**Effort:** 30 minutes total.

**Steps:**
- [ ] Confirm your Wikimedia Commons user page exists. If not, create one.
- [ ] Add a link from the Wikimedia user page to `/authors/ken-baker.html`.
- [ ] Confirm the author page already links back (it should, but verify).
- [ ] Same exercise for Tina Maulsby if applicable.

**Source doc:** `admin/W8-W9-BACKLINK-STRATEGY.md` Workstream 3

### 15. University / library outreach (W8/W9 Workstream 5) — **one outreach per month for 6 months**

**Why:** `.edu` backlinks are highest authority; long-tail but compounding.

**Effort:** 30 minutes per outreach.

**Source doc:** `admin/W8-W9-BACKLINK-STRATEGY.md` Workstream 5

---

## Annual reviews

### 16. FTC affiliate-posture review — **once per year on the anniversary of the most recent major FTC publication**

**Why:** FTC standards drift; the bright lines we've locked may need adjustment if FTC issues new guidance. The doc is currently calibrated to Dec-2022 + 2023 + 2024 publications; re-read annually.

**Effort:** 1–2 hours.

**Steps:**
- [ ] Re-read `admin/W4-FTC-AFFILIATE-POSTURE.md`.
- [ ] Check whether the FTC has issued new endorsement guides, vulnerable-consumer reports, or AI-endorsement guidance.
- [ ] Update the doc if anything material has changed; log the revision.

**Source doc:** `admin/W4-FTC-AFFILIATE-POSTURE.md` Section 6

### 17. Trade-show positioning re-read — **quarterly, at the W3 audit**

**Why:** The 21K AI-citation number, the named precedents (ProPublica / 404 Media / Defector), and the Nieman Lab framing all drift over time. Refresh the positioning so trade-show conversations stay current.

**Effort:** 15 minutes (and update if any of the cited numbers or framings has materially shifted).

**Source doc:** `admin/B2-TRADE-SHOW-POSITIONING.md` Revision-log section

---

## Open content tasks (not actions per se, but flagged for awareness)

### 18. v0.1 Symphony Voyage Pack HTML render — **✅ shipped 2026-05-07 (commit `c464e1ec`)**

The v0.1 Symphony pack now exists as both markdown (`admin/voyage-packs/v0.1-symphony-western-caribbean-7n.md`) and HTML (`.html`). Both v0.1 Symphony and v0.1.2 NCL Aqua now ship at full feature parity for the offline-PWA experience: fillable Emergency Contacts handoff card, print/PDF download buttons, floating TOC sidebar, the same shared CSS/JS modules.

**PDF deliverables** are now built via `admin/scripts/voyage-pack-pdf-build.sh` (idempotent; pre-commit hook blocks committing a modified `.md` without a regenerated `.pdf`). **Full lifecycle documented in `admin/voyage-packs/README.md`** — covers source/HTML/PDF sync, engine setup, the staleness check, common errors, and how to add a new pack. **No further action needed on this item.**

### 19. Voyage Pack discoverability — homepage CTA + nav addition

`/voyage-packs.html` is currently reachable only from the new footer link. A small homepage CTA (subtle, calm-voice — not a billboard) and a Planning-dropdown nav entry would surface it for cruisers landing organically.

**Decision:** decide whether to build this now or wait until W12 has booked its first sale (validating the product before promoting it). I recommend the latter — promoting an unproven product is the wrong move.

### 20. Custom-pack pipeline

The voyage-packs landing page invites custom-pack inquiries at $49–$79. If those start coming in, you'll need a lightweight production pipeline (a template the data drops into). Defer until at least one inquiry surfaces.

---

## Things you should NOT do

These are explicitly off-mission per the v2.5 plan or per the FTC posture doc:

- **Don't run display advertising.** Permanent bright line. The trust badge says so.
- **Don't take cruise-line affiliate commissions.** Permanent bright line.
- **Don't take shore-excursion booking commissions.** Permanent bright line.
- **Don't add medication-product affiliate links.** FTC vulnerable-consumer rule.
- **Don't add advertising on grief, accessibility, or faith content.** Pastoral guardrail.
- **Don't accept "guest post network" placements that charge a fee.** Off-mission per W8/W9 strategy.
- **Don't reply to cold outreach asking to buy your domain.** No.
- **Don't agree to exclusivity in any partnership conversation.** Default-non-exclusive across all categories.
- **Don't promote unproven product.** Wait for revenue signal before scaling marketing surface.

---

## When this list gets stale

Re-read this document at the W3 quarterly audit. Items will graduate (e.g., "Critical path 1: BMAC" → moves to "done" once the URL swap ships) or new ones will surface (e.g., a partnership lands and changes priorities). Keep the list short and accurate; deletion is fine — git history preserves the earlier states.

---

*Soli Deo Gloria.*
