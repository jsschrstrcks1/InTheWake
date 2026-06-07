#!/usr/bin/env python3
"""genbeta4.py — template generator for "The Wake" (beta4) design system.

Emits a HOMEPAGE or a CONTENT (article / ship / port) page conforming to
tools/validate-beta4.sh: SDG before line 20, ICP-2 metas, noindex, external
stylesbeta4.css, real nav, NO audio/video, and (content) a content-hero + prose
column + captioned figure + rail. Writes to tools/_genbeta4-out/ (scratch).

Usage:
    python3 tools/genbeta4.py home    <slug> "<motto / H1>"  "<ai-summary>"
    python3 tools/genbeta4.py content <slug> "<page title>"  "<ai-summary>"
"""
import datetime, html, pathlib, sys

BASE = "https://cruisinginthewake.com"
BANNED = ("world-class","stunning","luxurious","unforgettable","seamless","delve",
          "elevate","must-see","must-do","hidden gem","vibrant","breathtaking","boasts")
SDG = ('<!--\nSoli Deo Gloria\nAll work on this project is offered as a gift to God.\n'
       '"Trust in the LORD with all your heart..." — Proverbs 3:5\n'
       '"Whatever you do, work heartily..." — Colossians 3:23\n-->')
NAV = ('<nav class="nav" aria-label="Main"><span class="name serif">In the Wake</span>'
       f'<a href="{BASE}/ships/">Ships</a><a href="{BASE}/ports.html">Ports</a>'
       f'<a href="{BASE}/cruise-lines/">Cruise Lines</a><a href="{BASE}/restaurants/">Restaurants</a>'
       f'<a href="{BASE}/articles.html">Articles</a><a href="{BASE}/planning.html">Tools</a></nav>')

HEAD = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
{sdg}
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="robots" content="noindex"/>
<title>{title} — The Wake (beta4)</title>
<meta name="ai-summary" content="{summary}"/>
<meta name="last-reviewed" content="{date}"/>
<meta name="content-protocol" content="ICP-2"/>
<link rel="stylesheet" href="/stylesbeta4.css?v=beta4"/>
</head>
<body>
{nav}
'''

HOME_BODY = '''<main id="main">
  <section class="hero">
    <img src="/assets/beta/wake-hero-1280.webp" srcset="/assets/beta/wake-hero-800.webp 800w, /assets/beta/wake-hero-1280.webp 1280w" sizes="100vw" width="1280" height="960" fetchpriority="high" decoding="async" alt="A ship's wake trailing toward a sunrise on the horizon."/>
    <div class="scrim"></div>
    <div class="moment">
      <h1 class="serif">{h1}</h1>
      <p class="purpose">Honest, calm cruise planning — notes from people who sailed ahead.</p>
      <nav class="pathfinder" aria-label="Where to start">
        <a href="{base}/first-cruise.html"><span class="door">New to cruising</span><span class="hint">Start with the first-cruise guide.</span></a>
        <a href="{base}/ships/"><span class="door">I&rsquo;ve sailed before</span><span class="hint">Straight to ships, ports, and tools.</span></a>
      </nav>
    </div>
  </section>
  <ol class="zones">
    <li><div><h2 class="serif">Plan your first cruise</h2><nav><a href="{base}/first-cruise.html">First-cruise guide</a><a href="{base}/packing-lists.html">Packing lists</a><a href="{base}/accessibility.html">Accessibility</a></nav></div></li>
    <li><div><h2 class="serif">Compare ships &amp; itineraries</h2><nav><a href="{base}/ships/">Ships</a><a href="{base}/cruise-lines/">Cruise lines</a><a href="{base}/ports.html">Ports</a></nav></div></li>
    <li><div><h2 class="serif">Money, logistics &amp; fine print</h2><nav><a href="{base}/drink-calculator.html">Drink calculator</a><a href="{base}/planning.html">Planning &amp; tools</a></nav></div></li>
  </ol>
  <figure class="logbook">
    <blockquote class="serif">The finest view at sea isn&rsquo;t what&rsquo;s coming&mdash;it&rsquo;s what you&rsquo;ve left behind, carved in white across the water.</blockquote>
    <figcaption class="byline">150 nights in that seat. I keep the logbook so your way forward is clearer. — <a href="{base}/authors/ken-baker.html">Ken Baker &rarr;</a></figcaption>
  </figure>
</main>
<footer>In the Wake &middot; honest, calm, concrete cruise planning &middot; Soli Deo Gloria</footer>
</body></html>'''

CONTENT_BODY = '''<article class="content-hero">
  <img src="/assets/beta/wake-hero-1280.webp" srcset="/assets/beta/wake-hero-800.webp 800w, /assets/beta/wake-hero-1280.webp 1280w" sizes="100vw" width="1280" height="960" decoding="async" alt="{alt}"/>
  <div class="ch-title"><p class="kicker">In the Wake</p><h1 class="serif">{h1}</h1></div>
</article>
<div class="content-grid">
  <main class="prose" id="main">
    <p>Replace this with the entry's opening — honest, calm, concrete, from a real sailing. End sentences at the fact.</p>
    <h2 class="serif">A section heading</h2>
    <p>Body text sits on a 64ch measure for comfortable reading on any page length.</p>
    <figure><img src="/assets/beta/demo-2.webp" width="900" height="675" loading="lazy" decoding="async" alt="Describe the photo plainly — what is actually in it."/><figcaption>A captioned figure.</figcaption></figure>
    <h3>A sub-point</h3>
    <ul><li>One concrete detail.</li><li>A number, name, or date to plan around.</li></ul>
  </main>
  <aside class="rail" aria-label="At a glance">
    <div class="card"><h2>At a glance</h2><p>Key facts the reader reaches for.</p></div>
    <div class="card"><h2>Who keeps it</h2><p><a href="{base}/authors/ken-baker.html">Read Ken&rsquo;s logbook &rarr;</a></p></div>
  </aside>
</div>
<footer>In the Wake &middot; honest, calm, concrete cruise planning &middot; Soli Deo Gloria</footer>
</body></html>'''


def main(argv):
    if len(argv) < 5 or argv[1] not in ("home", "content"):
        print(__doc__); return 2
    kind, slug, h1, summary = argv[1], argv[2], argv[3], argv[4]
    hit = [w for w in BANNED if w in (h1 + " " + summary).lower()]
    if hit:
        print(f"refused: banned vocabulary in copy: {', '.join(hit)}"); return 1
    head = HEAD.format(sdg=SDG, nav=NAV, title=html.escape(slug.replace('-', ' ').title()),
                       summary=html.escape(summary[:250]), date=datetime.date.today().isoformat())
    if kind == "home":
        body = HOME_BODY.format(base=BASE, h1=html.escape(h1))
    else:
        body = CONTENT_BODY.format(base=BASE, h1=html.escape(h1),
                                   alt=html.escape(f"A ship's wake toward the horizon — {slug.replace('-', ' ')}."))
    out = pathlib.Path(__file__).resolve().parent / "_genbeta4-out"; out.mkdir(exist_ok=True)
    dest = out / f"{kind}-{slug}.html"; dest.write_text(head + body + "\n", encoding="utf-8")
    print(f"wrote {dest}\nverify: tools/validate-beta4.sh {dest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
