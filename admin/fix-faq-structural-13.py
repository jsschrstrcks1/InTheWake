#!/usr/bin/env python3
"""Convert 10 real port FAQ sections to details.faq-item + Q: for weather validator.

Redirect stubs (beijing, falmouth-jamaica, kyoto) are intentionally left alone.
Soli Deo Gloria. Careful, not clever.
"""
from pathlib import Path
import re
import json
import html as htmlmod

ROOT = Path(__file__).resolve().parents[1]
PORTS = ROOT / "ports"
STEMS = [
    "dravuni",
    "gijon",
    "napier",
    "olden",
    "philipsburg",
    "rostock",
    "santos",
    "shanghai",
    "singapore",
    "suva",
]
REDIRECTS = ["beijing", "falmouth-jamaica", "kyoto"]


def find_balanced_details_by_id(html: str, id_value: str = "faq"):
    m = re.search(rf'<details\b[^>]*id="{id_value}"[^>]*>', html, re.I)
    if not m:
        return None
    start = m.start()
    i = m.end()
    depth = 1
    while i < len(html) and depth:
        open_m = re.search(r"<details\b", html[i:], re.I)
        close_m = re.search(r"</details>", html[i:], re.I)
        if not close_m:
            return None
        open_pos = i + open_m.start() if open_m else None
        close_pos = i + close_m.start()
        if open_pos is not None and open_pos < close_pos:
            depth += 1
            i = open_pos + 8
        else:
            depth -= 1
            i = close_pos + len("</details>")
            if depth == 0:
                return start, i, html[start:i]
    return None


def strip_tags(s: str) -> str:
    s = re.sub(r"<[^>]+>", "", s)
    return htmlmod.unescape(s).strip()


def extract_pairs(section_html: str):
    pairs = []
    # Nested <details>…</details> Q/A (any summary markup; p after summary)
    for m in re.finditer(
        r"<details(?![^>]*\bid=\"faq\")[^>]*>\s*<summary[^>]*>([\s\S]*?)</summary>\s*<p[^>]*>([\s\S]*?)</p>\s*</details>",
        section_html,
        re.I,
    ):
        q = strip_tags(m.group(1))
        a = strip_tags(m.group(2))
        if "frequently asked" in q.lower():
            continue
        if "policy notice" in q.lower():
            continue
        if q and a:
            pairs.append((q, a))
    for m in re.finditer(
        r"<h4[^>]*>([\s\S]*?)</h4>\s*<p[^>]*>([\s\S]*?)</p>", section_html, re.I
    ):
        q = strip_tags(m.group(1))
        a = strip_tags(m.group(2))
        if q and a and (q, a) not in pairs:
            pairs.append((q, a))
    for m in re.finditer(
        r"<h3[^>]*>([\s\S]*?)</h3>\s*<p[^>]*>([\s\S]*?)</p>", section_html, re.I
    ):
        q = strip_tags(m.group(1))
        a = strip_tags(m.group(2))
        if "frequently" in q.lower():
            continue
        if q and a and (q, a) not in pairs:
            pairs.append((q, a))
    return pairs


def extract_pairs_from_schema(page: str):
    sm = re.search(
        r'<script type="application/ld\+json">\s*(\{[\s\S]*?"@type"\s*:\s*"FAQPage"[\s\S]*?\})\s*</script>',
        page,
    )
    if not sm:
        return []
    try:
        obj = json.loads(sm.group(1))
    except Exception:
        return []
    pairs = []
    for ent in obj.get("mainEntity") or []:
        if ent.get("@type") != "Question":
            continue
        q = (ent.get("name") or "").strip()
        a = ((ent.get("acceptedAnswer") or {}).get("text") or "").strip()
        if q and a:
            pairs.append((q, a))
    return pairs


def make_items(pairs):
    out = []
    for q, a in pairs:
        qs = q if re.match(r"^\s*Q:", q, re.I) else f"Q: {q}"
        out.append(
            '            <details class="faq-item"><summary>'
            + htmlmod.escape(qs)
            + "</summary>\n"
            "              <p>"
            + htmlmod.escape(a)
            + "</p>\n"
            "            </details>"
        )
    return "\n".join(out)


def schema_script(pairs):
    ents = []
    for q, a in pairs:
        ents.append(
            {
                "@type": "Question",
                "name": re.sub(r"^\s*Q:\s*", "", q, flags=re.I),
                "acceptedAnswer": {"@type": "Answer", "text": a},
            }
        )
    obj = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": ents}
    return (
        '<script type="application/ld+json">\n'
        + json.dumps(obj, indent=2, ensure_ascii=False)
        + "\n  </script>"
    )


def replace_faq_schema(page: str, pairs):
    """Brace-balanced FAQPage script replace — avoids over-greedy regex swallowing extra JSON."""
    idx = 0
    while True:
        j = page.find('"FAQPage"', idx)
        if j < 0:
            return page, False
        script_open = page.rfind("<script", 0, j)
        if script_open < 0:
            idx = j + 1
            continue
        tag_end = page.find(">", script_open)
        tag = page[script_open : tag_end + 1]
        if "ld+json" not in tag:
            idx = j + 1
            continue
        brace_start = page.find("{", tag_end)
        if brace_start < 0 or brace_start > j:
            idx = j + 1
            continue
        depth = 0
        k = brace_start
        brace_end = None
        while k < len(page):
            ch = page[k]
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    brace_end = k + 1
                    break
            k += 1
        if brace_end is None:
            return page, False
        script_close = page.find("</script>", brace_end)
        if script_close < 0:
            return page, False
        new_script = schema_script(pairs)
        return (
            page[:script_open] + new_script + page[script_close + len("</script>") :],
            True,
        )


def main():
    results = []
    for stem in STEMS:
        path = PORTS / f"{stem}.html"
        t = path.read_text()
        orig_len = len(t)
        found = find_balanced_details_by_id(t, "faq")
        if not found:
            results.append((stem, "NO_FAQ_ID", 0))
            continue
        start, end, sec = found
        pairs = extract_pairs(sec)
        if len(pairs) < 2:
            sp = extract_pairs_from_schema(t)
            if len(sp) > len(pairs):
                pairs = sp
        pairs = [(q, a) for q, a in pairs if "policy notice" not in q.lower()]
        if len(pairs) < 1:
            results.append((stem, "NO_PAIRS", 0))
            continue
        head_m = re.search(
            r'(<details\b[^>]*id="faq"[^>]*>\s*<summary>[\s\S]*?</summary>)',
            sec,
            re.I,
        )
        if not head_m:
            results.append((stem, "NO_HEAD", 0))
            continue
        new_sec = head_m.group(1) + "\n" + make_items(pairs) + "\n          </details>"
        t2 = t[:start] + new_sec + t[end:]
        t2, schema_ok = replace_faq_schema(t2, pairs)
        if len(t2) < orig_len * 0.8:
            results.append((stem, "SAFETY_ABORT", len(pairs)))
            continue
        path.write_text(t2)
        results.append((stem, "OK" if schema_ok else "OK_NO_SCHEMA", len(pairs)))

    print("RESULTS")
    for r in results:
        print(r)
    print("POST")
    for stem in STEMS:
        t = (PORTS / f"{stem}.html").read_text()
        print(
            stem,
            "faq-item",
            t.count("faq-item"),
            "bal",
            find_balanced_details_by_id(t) is not None,
            "len",
            len(t),
        )
    print("REDIRECTS_LEFT")
    for r in REDIRECTS:
        t = (PORTS / f"{r}.html").read_text()
        print(r, "redirect" if "refresh" in t or "Redirect" in t else "?", len(t))


if __name__ == "__main__":
    main()
