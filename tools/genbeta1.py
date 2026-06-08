#!/usr/bin/env python3
"""genbeta1.py — template generator for the "Quiet Harbor" (beta1) design language.

Emits a new page skeleton that conforms to tools/validate-beta1.sh: SDG comment
before line 20, ICP-2 metas, noindex, external stylesbeta1.css, felt-nav, one
hero WebP, one <h1>, no inline styles, no cards. Writes to tools/_genbeta1-out/
(scratch) — never overwrites a live page.

Usage:
    python3 tools/genbeta1.py <slug> "<H1 idea sentence>" "<ai-summary>"
Example:
    python3 tools/genbeta1.py cabo "Sailing to Cabo? Here is the honest read." \
        "Honest, calm notes on a Cabo San Lucas cruise day: the tender, the beach, the prices."
"""
import datetime
import html
import pathlib
import sys

TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<!--
Soli Deo Gloria
All work on this project is offered as a gift to God.
"Trust in the LORD with all your heart..." — Proverbs 3:5
"Whatever you do, work heartily..." — Colossians 3:23
-->
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="robots" content="noindex"/>
<title>{title} — Quiet Harbor (beta1)</title>
<meta name="ai-summary" content="{summary}"/>
<meta name="last-reviewed" content="{date}"/>
<meta name="content-protocol" content="ICP-2"/>
<link rel="stylesheet" href="/stylesbeta1.css?v=beta1"/>
<script type="application/ld+json">
{{"@context":"https://schema.org","@type":"WebPage","name":"{title}","description":"{summary}","dateModified":"{date}","datePublished":"{date}"}}
</script>
</head>
<body>
  <div class="felt-nav" role="presentation" aria-hidden="true">
    <span class="name">IN THE WAKE</span>
  </div>
  <main id="main">
    <figure class="hero-figure">
      <img src="/assets/beta/wake-hero-1280.webp"
           srcset="/assets/beta/wake-hero-800.webp 800w, /assets/beta/wake-hero-1280.webp 1280w"
           sizes="100vw" width="1280" height="960" fetchpriority="high" decoding="async"
           alt="{alt}"/>
      <figcaption>Photo © Flickers of Majesty</figcaption>
    </figure>
    <section class="lede" aria-labelledby="idea">
      <p class="name-line">In the Wake — a cruise traveler's logbook</p>
      <h1 id="idea">{h1}</h1>
      <p class="sub">Honest, calm, concrete — written by someone who sailed it, not by a brochure.</p>
      <nav class="pathfinder" aria-label="Where to start">
        <a href="https://cruisinginthewake.com/first-cruise.html">New to cruising<span class="hint">Start with the first-cruise guide</span></a>
        <a href="https://cruisinginthewake.com/ships/">I&rsquo;ve sailed before<span class="hint">Go straight to ships, ports, and tools</span></a>
      </nav>
    </section>
  </main>
  <footer>In the Wake &middot; honest, calm, concrete cruise planning &middot; Soli Deo Gloria</footer>
</body>
</html>
"""

BANNED = ("world-class", "stunning", "luxurious", "unforgettable", "seamless",
          "delve", "elevate", "must-see", "must-do", "hidden gem", "vibrant")


def main(argv):
    if len(argv) < 4:
        print(__doc__)
        return 2
    slug, h1, summary = argv[1], argv[2], argv[3]
    low = (h1 + " " + summary).lower()
    hit = [w for w in BANNED if w in low]
    if hit:
        print(f"refused: banned vocabulary in copy: {', '.join(hit)} "
              f"(this generator emits what validate-beta1 accepts)")
        return 1
    out_dir = pathlib.Path(__file__).resolve().parent / "_genbeta1-out"
    out_dir.mkdir(exist_ok=True)
    page = TEMPLATE.format(
        title=html.escape(slug.replace("-", " ").title()),
        h1=html.escape(h1),
        summary=html.escape(summary[:250]),
        alt=html.escape(f"A ship's wake trailing toward the horizon — {slug.replace('-', ' ')}."),
        date=datetime.date.today().isoformat(),
    )
    dest = out_dir / f"{slug}.html"
    dest.write_text(page, encoding="utf-8")
    print(f"wrote {dest}")
    print(f"verify: tools/validate-beta1.sh {dest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
