#!/usr/bin/env python3
"""Enumerate every <img> hit by the over-broad mobile rule at
assets/styles.css:2453–2461.

The CSS selector group is:
    .hero-header img, .hero-ship img, .hero img, [class*="hero"] img

Cross-checks the JS validator (which uses cheerio) with BeautifulSoup +
soupsieve so we have an independent count of impacted elements per page.
"""

import sys
from pathlib import Path
from bs4 import BeautifulSoup

SELECTORS = [
    ".hero-header img",
    ".hero-ship img",
    ".hero img",
    '[class*="hero"] img',
]

PAGES = [
    "index.html",
    "ships/carnival/carnival-celebration.html",
    "ports/abu-dhabi.html",
    "articles/cruise-tipping-2026.html",
    "drink-calculator.html",
    "restaurants/150-central-park.html",
    "tools/cruise-budget-calculator.html",
    "tools/port-day-planner.html",
]


def describe(img):
    src = img.get("src", "")
    cls = " ".join(img.get("class", [])) or "—"
    parent_chain = []
    p = img.parent
    depth = 0
    while p is not None and depth < 4:
        if hasattr(p, "name") and p.name:
            pcls = ".".join(p.get("class", [])) if p.get("class") else ""
            parent_chain.append(f"{p.name}{('.' + pcls) if pcls else ''}")
        p = p.parent if hasattr(p, "parent") else None
        depth += 1
    return src, cls, " > ".join(reversed(parent_chain))


def audit(path: Path):
    soup = BeautifulSoup(path.read_text(encoding="utf-8"), "lxml")
    union = {}  # id(img) -> (img, [matching_selectors])
    for sel in SELECTORS:
        for img in soup.select(sel):
            key = id(img)
            if key not in union:
                union[key] = (img, [])
            union[key][1].append(sel)
    return list(union.values())


def main():
    repo = Path(__file__).resolve().parent.parent
    print(f"# Hero-Selector Impact Audit (BeautifulSoup cross-check)\n")
    print(f"Selectors audited (from `assets/styles.css:2453–2461`):\n")
    for s in SELECTORS:
        print(f"  - `{s}`")
    print()
    print(
        f"| Page | Total imgs hit | Selectors that hit each |\n"
        f"|---|---:|---|"
    )
    grand_total = 0
    detail_blocks = []
    for rel in PAGES:
        p = repo / rel
        if not p.exists():
            print(f"| `{rel}` | — | (file missing) |")
            continue
        hits = audit(p)
        grand_total += len(hits)
        sels_used = sorted({s for _, sels in hits for s in sels})
        print(
            f"| `{rel}` | {len(hits)} | "
            f"{', '.join(f'`{s}`' for s in sels_used) if sels_used else '—'} |"
        )
        if hits:
            block = [f"\n### `{rel}`\n"]
            for img, sels in hits:
                src, cls, chain = describe(img)
                block.append(
                    f"- **src:** `{src}`  \n"
                    f"  **img class:** `{cls}`  \n"
                    f"  **matched by:** {', '.join(f'`{s}`' for s in sels)}  \n"
                    f"  **ancestry:** {chain}"
                )
            detail_blocks.append("\n".join(block))
    print(f"\n**Grand total imgs affected across sample:** {grand_total}\n")
    print("\n## Per-page detail\n")
    for b in detail_blocks:
        print(b)


if __name__ == "__main__":
    sys.exit(main() or 0)
