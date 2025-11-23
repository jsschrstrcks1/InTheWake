In the Wake — Solo Cruising Module Standards
Version: v3.008.019 · Baseline: 3.008 · Scope: Solo index page (/solo.html), Solo article fragments (/solo/articles/*.html), and Solo full pages (/solo/<slug>.html); plus global deltas marked ⬆︎ Global.

0) What changed in v3.008.019 (TL;DR)
⬆︎ Topbar layout: "Skip to main content" + primary pill nav now live together in a single .topbar row (nav removed from header brand row).
Right rail reliability: Two-column CSS hardened; rail sticks right at ≥980px with grid-template-columns forced via !important.
Hero/Caption treatment: Enforced card wrapper for figure.hero, .article-hero, and figure.inline-hero when mounted inside #solo-article-host.
Shareable URLs: Related/author rail links now point to full pages under /solo/<slug>.html (not fragments). Loader injects SEO only when deep-linked (#slug or ?a=).
⬆︎ 404-safe data hydration: /data/authors.json is optional; on 404 we silently fall back to built-ins.
⬆︎ Broad browser support: Avoids optional chaining; no arrow-only features in critical paths; fetch guarded by simple usage; CSS Grid with mobile fallback (single column).
Cache busting: All dynamic loads include ?v=<meta[name=page:version]> (e.g., v3.008.019).
Accessibility: Keyboardable Share button, visible skip link, ARIA roles, and aria-busy for host during loads.

(…full content as provided in file 11…)
