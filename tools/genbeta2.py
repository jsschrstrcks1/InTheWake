#!/usr/bin/env python3
"""genbeta2.py — template generator for the "Aft Deck" (beta2) design language.

Emits a page conforming to tools/validate-beta2.sh: SDG before line 20, ICP-2
metas, noindex, external stylesbeta2.css (motion gated opt-in), full-bleed stage
with a motto moment, a reveal-revealed path-finder. Writes to tools/_genbeta2-out/
(scratch) — never overwrites a live page.

Usage:
    python3 tools/genbeta2.py <slug> "<motto / landing line>" "<ai-summary>"
"""
import datetime, html, pathlib, sys

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
<title>{title} — Aft Deck (beta2)</title>
<meta name="ai-summary" content="{summary}"/>
<meta name="last-reviewed" content="{date}"/>
<meta name="content-protocol" content="ICP-2"/>
<link rel="stylesheet" href="/stylesbeta2.css?v=beta2"/>
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
    <section class="stage">
      <img src="/assets/beta/wake-hero-1280.webp"
           srcset="/assets/beta/wake-hero-800.webp 800w, /assets/beta/wake-hero-1280.webp 1280w"
           sizes="100vw" width="1280" height="960" fetchpriority="high" decoding="async"
           alt="{alt}"/>
      <div class="scrim"></div>
      <div class="moment">
        <h1 class="serif">{motto}</h1>
        <p class="purpose">Honest, calm cruise planning — notes from people who sailed ahead.</p>
        <p class="scroll-cue">Scroll to begin &darr;</p>
      </div>
    </section>
    <section class="moment-block reveal" aria-labelledby="start">
      <h2 id="start" class="serif">Where would you like to start?</h2>
      <nav class="pathfinder" aria-label="Where to start">
        <a href="https://cruisinginthewake.com/first-cruise.html"><span class="door">New to cruising</span><span class="hint">Start with the first-cruise guide.</span></a>
        <a href="https://cruisinginthewake.com/ships/"><span class="door">I&rsquo;ve sailed before</span><span class="hint">Go straight to ships, ports, and tools.</span></a>
      </nav>
    </section>
  </main>
  <footer><span class="duck" aria-hidden="true">&#128036;</span> In the Wake &middot; honest, calm, concrete cruise planning &middot; Soli Deo Gloria</footer>
</body>
</html>
"""

BANNED = ("world-class","stunning","luxurious","unforgettable","seamless","delve",
          "elevate","must-see","must-do","hidden gem","vibrant","breathtaking")


def main(argv):
    if len(argv) < 4:
        print(__doc__); return 2
    slug, motto, summary = argv[1], argv[2], argv[3]
    hit = [w for w in BANNED if w in (motto + " " + summary).lower()]
    if hit:
        print(f"refused: banned vocabulary in copy: {', '.join(hit)}"); return 1
    out = pathlib.Path(__file__).resolve().parent / "_genbeta2-out"
    out.mkdir(exist_ok=True)
    dest = out / f"{slug}.html"
    dest.write_text(TEMPLATE.format(
        title=html.escape(slug.replace("-", " ").title()),
        motto=html.escape(motto), summary=html.escape(summary[:250]),
        alt=html.escape(f"A ship's wake trailing toward a sunrise — {slug.replace('-', ' ')}."),
        date=datetime.date.today().isoformat()), encoding="utf-8")
    print(f"wrote {dest}\nverify: tools/validate-beta2.sh {dest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
