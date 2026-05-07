# W12 Voyage Pack — Product Launch Operational Checklist

**Status:** Pre-launch. Landing page (`/voyage-packs.html`) exists with placeholder Buy URLs.
**Owner:** Ken
**Last updated:** 2026-05-06

The landing page is shipped. None of the buy buttons actually work yet because there's no payment processor wired up. This document tracks every operational item that must happen before W12 can take its first dollar.

Items are ordered in dependency order: do them top-to-bottom; each downstream item assumes the previous ones are done.

---

## 1. Payment processor decision

**Status:** ⏳ open — needs your call.

Three viable options for a one-time-purchase digital product at our scale:

| Option | Pros | Cons | Best for |
|---|---|---|---|
| **Gumroad** | Lowest friction (account today, selling tomorrow). Built-in delivery, EU VAT handling, refund mechanics, customer email list. 10% + payment fee per sale. | Their UI / branding sits between you and the buyer. Less control. | Fastest path to revenue. |
| **Lemon Squeezy** | Cleaner UX than Gumroad; merchant-of-record model handles all global tax. ~5% + payment fee. | Slightly more setup. Newer platform; some platform risk. | If you want better margins and are willing to spend a couple of hours on setup. |
| **Stripe Checkout + a thin file-delivery script** | Lowest fees (2.9% + $0.30). Maximum control over branding and the buyer experience. Plays well with future expansion (Duck Club, custom packs). | You're now responsible for tax (Stripe Tax helps but doesn't fully solve), file delivery, refund mechanics, and the customer email list. | If you'll do enough volume to justify the operational lift, or if you want full control of the customer relationship. |

**Recommendation:** **Gumroad for v0.1 launch.** It gets W12 to revenue inside a week. If demand validates the product (more than a handful of sales over a quarter), migrate to Stripe at that point — Gumroad's higher fee is buying you time to validate, not a permanent cost.

Lemon Squeezy is a fine middle option if you specifically want better margins from day one and are willing to invest the extra setup time.

**Action:** pick one. The rest of this checklist forks at item 2 depending on which.

---

## 2. Account setup (depends on item 1)

### If Gumroad
- [ ] Create Gumroad account, verify email
- [ ] Set up payout method (bank account)
- [ ] Configure tax settings (US sales tax via Gumroad's collection; EU VAT handled automatically as merchant of record)
- [ ] Optional: set up a custom subdomain (e.g., `packs.cruisinginthewake.com` → Gumroad) so URLs look like ours

### If Lemon Squeezy
- [ ] Create Lemon Squeezy account, verify email and phone
- [ ] Set up payout method
- [ ] Configure store branding (logo, colors, store URL)
- [ ] Configure email templates for purchase confirmation / receipt

### If Stripe Checkout
- [ ] Create Stripe account, complete KYC
- [ ] Set up bank payout
- [ ] Configure Stripe Tax (US states + EU + UK)
- [ ] Build or buy a thin file-delivery service (options: Lemon Squeezy as a relay, a simple Cloudflare Worker + signed URLs, a SaaS like Sellfy or SendOwl). This is the operational lift the other two options avoid.

---

## 3. Product creation

For both prototypes — repeat for each:

- [ ] Create product entry in the chosen platform
- [ ] Title: matches the landing page exactly (e.g., "Royal Caribbean Symphony of the Seas — Western Caribbean, 7 nights")
- [ ] Price: **$19** (Symphony) or **$29** (NCL Aqua veterans/solo)
- [ ] Currency: USD
- [ ] Short description: matches the landing page meta description
- [ ] Full description: copy the landing-page product card content
- [ ] Cover image: use a port hero or ship hero from `assets/social/`
- [ ] Upload deliverables: PDF + offline HTML version of the pack (see item 4)
- [ ] Set refund policy in product settings: 14 days, full refund, no questions
- [ ] Test buy flow in test mode end-to-end before going live

---

## 4. File deliverables for each pack

The current prototypes exist at `admin/voyage-packs/*.md` and `admin/voyage-packs/*.html`. Buyers need:

- [ ] **PDF version** — generated from the markdown source. Tools: `pandoc` (free, simple), or print-to-PDF from the HTML render (cleaner styling but requires manual page-break tuning). Recommend `pandoc -o pack.pdf source.md` with a custom CSS for clean paginated output.
- [ ] **HTML version** — already exists at `admin/voyage-packs/v0.1.2-ncl-aqua-veterans-solo-group-dec-2027.html`. Symphony only has markdown; either render the markdown to HTML using the same template (easier) or write a Symphony HTML version (more work, longer lead).
- [ ] Bundle: PDF + HTML inside a single zip per pack. Filename: `inthewake-voyage-pack-[shortname]-[saildate].zip`
- [ ] Test the offline-PWA experience: load the HTML, disconnect Wi-Fi, confirm it still renders + the handoff card persists to localStorage

Open question: do you want to ship the HTML version with the same `data-storage-key="inthewake-handoff-v0.1.2"` it currently uses, or should each customer get a fresh storage key? Recommend: keep the shared key for v1 (simpler); revisit if any customer reports a conflict (very unlikely given localStorage is per-origin).

---

## 5. Customer service email

- [ ] Set up `packs@cruisinginthewake.com` (or similar) — separate inbox so pack-related questions don't get lost in general support
- [ ] Add this address to the landing page's "contact" callouts (currently the page links to `/about-us.html` — that's fine for v0.1, but a dedicated inbox makes refund handling cleaner)
- [ ] Decide on response-time expectation (recommend: within 48 business hours for non-urgent, within 24 hours for refund requests)
- [ ] Configure auto-responder confirming receipt + setting expectation

---

## 6. Refund mechanics

- [ ] Document the refund process in your own playbook (one paragraph, internal): when someone emails asking for a refund, how do you process it?
- [ ] On Gumroad / Lemon Squeezy: refunds processed in-platform with a click; refund automatically removes platform fees. On Stripe: refund the charge and email the customer.
- [ ] Decide refund window honestly: the landing page says "14 days, no questions asked." Stick to that.
- [ ] Track refund rate. If it climbs above 5–10%, that's a product-quality signal, not a customer-quality signal.

---

## 7. Wire the buy buttons on /voyage-packs.html

Once items 1–4 are done:

- [ ] Edit `voyage-packs.html` — replace the placeholder Buy Me A Coffee URLs with the real product URLs from your chosen platform
- [ ] Both buttons get updated (Symphony and NCL Aqua)
- [ ] Test each button: click → reach the platform's checkout → complete a test purchase (test card on Gumroad/LS, real card you refund yourself on Stripe)
- [ ] Commit the URL update with a clear message

---

## 8. End-to-end live test before marketing

Before adding `/voyage-packs.html` to the homepage hero or main nav:

- [ ] Buy your own pack with a real card. Confirm:
  - Payment goes through
  - Confirmation email arrives
  - Download links work
  - PDF opens cleanly on desktop and phone
  - HTML version loads, the handoff card form fields work, localStorage persists across reloads
  - Refund the test purchase to verify the refund flow

---

## 9. Add to sitemap.xml + IndexNow

- [ ] Add `/voyage-packs.html` to `sitemap.xml` (look for the existing pattern; one new `<url>` entry near the support.html entry)
- [ ] Submit to IndexNow via the existing `indexnow` skill — this notifies Bing, Yandex, etc. quickly so the page surfaces in AI-citation context faster
- [ ] (Optional) add the page to `precache-manifest.json` if you want the PWA to pre-warm it; recommend yes since it's a primary commerce surface

---

## 10. Marketing / discoverability surfaces

After live test passes:

- [ ] Add a small "Voyage Packs" link to the homepage (subtle — the brand promise is calm, so not a billboard CTA; a single line in the hero or a card in the second-fold section is right)
- [ ] Add to the main nav under Planning dropdown? Or as its own top-level pill? Recommend: **Planning → Voyage Packs** as a new entry. Adding to the global nav would feel sales-y; nesting under Planning keeps it findable but not in-your-face.
- [ ] Mention in the next monthly email if you have a list (you don't yet — the W6.1b Duck Club is the natural moment to start collecting one, deferred)
- [ ] Mention in the existing pack heroes (already done — both v0.1 and v0.1.2 have the offline-capable Emergency Contacts sales-copy line)

---

## 11. Tax / accounting baseline

- [ ] Track gross revenue per pack per month
- [ ] Track refunds + fees per pack per month
- [ ] Track net revenue per pack per month
- [ ] Set aside ~25% of net for self-employment tax (US) — talk to your accountant about whether quarterly estimated payments are needed once revenue is non-trivial
- [ ] If using Gumroad / Lemon Squeezy, they handle EU VAT automatically; you'll receive 1099-K from them at year-end if US revenue crosses the threshold ($600+ for individual reporting starting 2026)

---

## 12. Pivot triggers (locked from v2.5 plan)

These are documented in `/root/.claude/plans/resilient-dancing-turtle.md` but worth restating here for the W12 path:

- **W12 v0.1 sells ≥1 pack within 30 days of launch** → expand to top 3 popular itineraries (Caribbean Princess, Carnival, etc.)
- **W12 v0.1 sells 0 packs in 30 days** → reassess. Likely diagnoses: (a) marketing surface insufficient; (b) the audience isn't ready to pay for a planning artifact; (c) the price point is wrong. Don't kill the product on 30-day data; reassess at 60-90.
- **Refund rate >10%** → product-quality signal. Read the refund-request emails. If a pattern emerges, fix the pack.
- **Demand for custom packs > generic packs** → tilt resources toward custom-pack production; consider raising the custom-pack price ceiling.

---

## 13. What's NOT on this checklist (deliberately deferred)

- **PDF generation pipeline (automated)** — for v0.1 with two packs, manual `pandoc` runs are fine. If you scale to 5+ packs, a small build script becomes worth writing.
- **Customer email list / newsletter** — folded into the Duck Club tier (W6.1b) when that goes live.
- **Affiliate program for the packs themselves** — would let third parties (cruise-blog reviewers, travel-agent partners like Tina) earn a percentage for promoting packs. Defer to v0.2.
- **Translations** — English only for v0.1.
- **Bundle pricing** (e.g., "buy both, save $5") — defer until there are 3+ packs to bundle meaningfully.
- **Group / agency pricing** (e.g., for Tina to buy 20 packs at a discount and distribute to her group) — defer until requested.
- **Subscriber-only packs** (i.e., Duck Club members get one pack/year free) — defer to W6.1b launch.

---

## What done looks like for this checklist

When items 1–9 are complete, you can take the first dollar. Items 10–11 are post-launch hardening; item 12 is the trigger map.

The checklist is self-contained and survives interruptions: pick it back up at whichever item you stopped at.

---

*Soli Deo Gloria.*
