# Maulsby Travel Co. — SEO Audit & Suggestions (June 2026)

*Prepared by Ken Baker. Based on a live crawl of the homepage, About, Contact, Blog, the "How Solo Cruising Became My Thing" post, and the new Solo Travel page.*

## The big picture
Structurally the site is healthy — HTTPS, mobile-friendly, clean URLs, and a WordPress sitemap is in place. But it's **missing almost the entire on-page SEO layer**, and nearly all of it traces back to one root cause: **there's no SEO plugin installed/active.** Fix that and ~80% of this list gets handled.

## Priority 1 — Do these first (biggest impact, least effort)
1. **Install an SEO plugin** — RankMath (free) or Yoast. This one step unlocks meta descriptions, custom titles, schema, social previews, and a better sitemap. Everything below becomes easy once it's on.
2. **Add meta descriptions to every page.** Right now **zero pages have one** (home, About, Contact, Blog, the solo post, the Solo page — all blank). Google is writing its own search snippets for you, so you've lost control of what shows up and your click-through rate. Write ~140–160 characters per page.
3. **Add structured data (schema).** **No page has any.** At a minimum: Organization/TravelAgency site-wide, plus FAQ schema on pages with Q&As. This is what earns rich results in Google and citations in AI answers (ChatGPT, Google AI Overviews, Perplexity). *(Ken note: I already built the full JSON-LD for the Solo page — ready to drop in.)*
4. **The homepage has NO H1 heading.** Your most important page has zero `<h1>`. Add one clear headline that says what you do, e.g. *"Solo Cruise Specialists — Travel Solo, Never Alone."*

## Priority 2 — Content & authority (your real edge)
5. **Add image alt text.** Every image on the pages I checked is missing it (home 6/6, About, Contact, Blog all blank). Describe each image factually — helps accessibility *and* Google Images.
6. **Own the solo-cruise niche.** You won't outrank Cruise Critic for "Caribbean cruise," but you *can* own **"solo cruise single supplement," "best ships for solo travelers," "is solo cruising safe," "hosted solo group cruises."** Low competition, high intent, and your firsthand experience is exactly what Google and AI now reward. *(Starter guest post attached.)*
7. **Internal links.** Link your blog posts to the Solo page and Contact, and back again. Helps readers and Google understand the site.
8. **Keyword-richer titles.** e.g. "Solo Travel – Maulsby Travel Co." → **"Solo Cruises | Travel Solo, Never Alone — Maulsby Travel Co."** Same for the bare About/Contact titles.

## Priority 3 — Technical tidy-ups (minor)
9. **robots.txt has `Crawl-delay: 10`** — this slows Bing and others. Safe to remove for a site this size.
10. **Blog index page** is missing a canonical tag and social (OG) tags — the SEO plugin fixes this automatically.
11. **Solo page renders two H1s** — should be one (the theme adds a page-title H1 on top of the design's H1). Minor.
12. **Page speed** — I didn't measure it here, but Beaver Builder + many plugins can get heavy. Run the homepage through Google PageSpeed Insights; if it's slow, a caching plugin + image compression help both rankings and bookings.

## What's already good
- HTTPS everywhere, mobile-friendly, clean readable URLs.
- WordPress sitemap exists and is referenced in robots.txt.
- Page titles are present and mostly sensible.
- The new Solo page already has strong, well-structured content — once the schema is pasted in, it's the model the rest of the site should follow.

---
**Net:** install an SEO plugin → write meta descriptions → add schema → fix the homepage H1 and image alt text. Those four are most of the win.
