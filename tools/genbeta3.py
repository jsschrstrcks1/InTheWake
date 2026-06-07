#!/usr/bin/env python3
"""genbeta3.py — template generator for the "Charthouse" (beta3) design language.

Emits a page conforming to tools/validate-beta3.sh: SDG before line 20, ICP-2
metas, noindex, external stylesbeta3.css, an integrated hero (photo + idea +
path-finder + search, action above the directory), and a directory ORDERED into
exactly three zones. Writes to tools/_genbeta3-out/ (scratch).

Usage:
    python3 tools/genbeta3.py <slug> "<H1 idea sentence>" "<ai-summary>"
"""
import datetime, html, pathlib, sys

ZONES = [
    ("Plan your first cruise",
     [("First-cruise guide", "/first-cruise.html"), ("Packing lists", "/packing-lists.html"), ("Accessibility", "/accessibility.html")]),
    ("Compare ships &amp; itineraries",
     [("Ships", "/ships/"), ("Cruise lines", "/cruise-lines/"), ("Ports", "/ports.html"), ("Restaurants", "/restaurants/")]),
    ("Money, logistics &amp; fine print",
     [("Drink calculator", "/drink-calculator.html"), ("Internet at sea", "/internet-at-sea.html"), ("Planning &amp; tools", "/planning.html")]),
]
BASE = "https://cruisinginthewake.com"
BANNED = ("world-class","stunning","luxurious","unforgettable","seamless","delve",
          "elevate","must-see","must-do","hidden gem","vibrant","breathtaking")


def zones_html():
    out = ['<ol class="zones">']
    for title, links in ZONES:
        nav = "".join(f'<a href="{BASE}{href}">{label}</a>' for label, href in links)
        out.append(f'<li><div><h2 class="serif">{title}</h2><nav>{nav}</nav></div></li>')
    out.append("</ol>")
    return "\n    ".join(out)


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
<title>{title} — Charthouse (beta3)</title>
<meta name="ai-summary" content="{summary}"/>
<meta name="last-reviewed" content="{date}"/>
<meta name="content-protocol" content="ICP-2"/>
<link rel="stylesheet" href="/stylesbeta3.css?v=beta3"/>
<script type="application/ld+json">
{{"@context":"https://schema.org","@type":"WebPage","name":"{title}","description":"{summary}","dateModified":"{date}","datePublished":"{date}"}}
</script>
</head>
<body>
  <div class="felt-nav" role="presentation" aria-hidden="true">
    <span class="name serif">In the Wake</span>
    <span class="felt"><span>Ships</span><span>Ports</span><span>Tools</span><span>Cruise Lines</span></span>
  </div>
  <main id="main">
    <section class="hero">
      <figure class="hero-photo">
        <img src="/assets/beta/wake-hero-1280.webp"
             srcset="/assets/beta/wake-hero-800.webp 800w, /assets/beta/wake-hero-1280.webp 1280w"
             sizes="(max-width:760px) 100vw, 55vw" width="1280" height="960"
             fetchpriority="high" decoding="async" alt="{alt}"/>
        <figcaption>Photo © Flickers of Majesty</figcaption>
      </figure>
      <div class="hero-panel">
        <p class="kicker">In the Wake — a cruise traveler's logbook</p>
        <h1>{h1}</h1>
        <nav class="pathfinder" aria-label="Where to start">
          <a href="{base}/first-cruise.html"><span class="door">New to cruising</span><span class="hint">Start with the first-cruise guide.</span></a>
          <a href="{base}/ships/"><span class="door">I&rsquo;ve sailed before</span><span class="hint">Go straight to ships, ports, and tools.</span></a>
        </nav>
        <form class="hero-search" role="search" action="{base}/search.html" method="get">
          <label for="q">Search ships, ports, and answers</label>
          <input id="q" name="q" type="search" placeholder="Search a ship, port, or question"/>
          <button type="submit">Search</button>
        </form>
      </div>
    </section>
    {zones}
  </main>
  <footer>In the Wake &middot; honest, calm, concrete cruise planning &middot; Soli Deo Gloria</footer>
</body>
</html>
"""


def main(argv):
    if len(argv) < 4:
        print(__doc__); return 2
    slug, h1, summary = argv[1], argv[2], argv[3]
    hit = [w for w in BANNED if w in (h1 + " " + summary).lower()]
    if hit:
        print(f"refused: banned vocabulary in copy: {', '.join(hit)}"); return 1
    out = pathlib.Path(__file__).resolve().parent / "_genbeta3-out"
    out.mkdir(exist_ok=True)
    dest = out / f"{slug}.html"
    dest.write_text(TEMPLATE.format(
        title=html.escape(slug.replace("-", " ").title()), h1=html.escape(h1),
        summary=html.escape(summary[:250]),
        alt=html.escape(f"A ship's wake trailing toward a sunrise — {slug.replace('-', ' ')}."),
        date=datetime.date.today().isoformat(), base=BASE, zones=zones_html()),
        encoding="utf-8")
    print(f"wrote {dest}\nverify: tools/validate-beta3.sh {dest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
