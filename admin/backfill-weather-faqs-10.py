#!/usr/bin/env python3
"""Inject missing weather FAQs into 10 structural-fixed ports.

Uses seasonal-guides.json facts. Adds only truly missing topics per
validator faqTopics. Compacts faq-item tags for FAQ_COUNT regex.
Does not invent redirect-stub FAQs.

Soli Deo Gloria. Careful, not clever.
"""
from __future__ import annotations

import html as htmlmod
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PORTS = ROOT / "ports"
SG_PATH = ROOT / "assets" / "data" / "ports" / "seasonal-guides.json"

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

# Same topic patterns as scripts/port-weather-validator-core.js REQUIRED.faqTopics
TOPICS = [
    (
        "best_time",
        re.compile(
            r"best time[^<]*\b(?:visit|go|cruise)\b|when[^<]*\b(?:visit|go|cruise)\b",
            re.I,
        ),
        "Best time to visit",
    ),
    (
        "storm",
        re.compile(
            r"hurricane|cyclone|typhoon|storm season|severe weather|bad weather|weather[^<]*(?:bad|severe|stormy|concern)",
            re.I,
        ),
        "Hurricane/storm season",
    ),
    (
        "packing",
        re.compile(
            r"pack[^<]*(?:weather|clothes|clothing|jacket|layer)|what[^<]*\b(?:pack|wear)\b|how[^<]*(?:dress|pack)",
            re.I,
        ),
        "Packing for weather",
    ),
    (
        "rain",
        re.compile(
            r"rain[^<]*(?:ruin|cancel|affect|stop)|will[^<]*rain|weather[^<]*ruin",
            re.I,
        ),
        "Rain concerns",
    ),
]


def fancy_name(stem: str) -> str:
    return stem.replace("-", " ").title()


def extract_visible_questions(content: str) -> list[str]:
    qs: list[str] = []
    for m in re.finditer(
        r'<details[^>]*class="faq-item"[^>]*>\s*<summary[^>]*>([\s\S]*?)</summary>',
        content,
        re.I,
    ):
        q = re.sub(r"<[^>]+>", "", m.group(1))
        q = re.sub(r"^\s*Q:\s*", "", q, flags=re.I).strip()
        qs.append(q)
    for m in re.finditer(r"<strong>\s*Q:\s*([\s\S]*?)\s*</strong>", content, re.I):
        qs.append(re.sub(r"<[^>]+>", "", m.group(1)).strip())
    return qs


def missing_topics(content: str) -> list[tuple[str, re.Pattern, str]]:
    qs = extract_visible_questions(content)
    missing = []
    for key, pat, label in TOPICS:
        hits = [q for q in qs if pat.search(q)]
        if len(hits) == 0:
            missing.append((key, pat, label))
        # if already present, do not add (even if imperfect content)
    return missing


def join_months(vals) -> str:
    if not vals:
        return "N/A"
    if isinstance(vals, list):
        return ", ".join(str(v) for v in vals)
    return str(vals)


def build_answers(stem: str, data: dict) -> dict[str, tuple[str, str]]:
    """Return topic_key -> (question, answer) grounded in seasonal guide."""
    name = fancy_name(stem)
    glance = data.get("at_a_glance") or {}
    seasons = data.get("cruise_seasons") or {}
    avoid = join_months(data.get("avoid_months") or [])
    packing = data.get("packing_nudges") or []
    catches = data.get("catches_off_guard") or []
    hazards = data.get("hazards") or {}
    best = data.get("best_months_for") or {}

    peak = join_months(seasons.get("high") or seasons.get("peak") or [])
    transitional = join_months(
        seasons.get("transitional") or seasons.get("shoulder") or []
    )
    low = join_months(seasons.get("low") or [])
    temp = glance.get("temp_range") or glance.get("temperature") or "varies by season"
    rain = glance.get("rain") or glance.get("rainfall") or "seasonal"
    humid = glance.get("humidity") or ""
    wind = glance.get("wind") or ""

    # Storm/hurricane content — only claim what JSON states
    if hazards.get("hurricane_zone"):
        season = hazards.get("hurricane_season") or "see local guidance"
        peak_risk = join_months(hazards.get("peak_risk_months") or [])
        note = (hazards.get("note") or "").strip()
        storm_a = (
            f"{name} sits in a hurricane/tropical storm risk region. "
            f"Season: {season}."
            + (f" Peak risk months: {peak_risk}." if peak_risk != "N/A" else "")
            + (f" {note}" if note else "")
            + " Cruise lines monitor conditions and may adjust itineraries; travel insurance is wise in peak storm months."
        )
        storm_q = f"Q: Does {name} have a hurricane or storm season?"
    else:
        note = (hazards.get("note") or "").strip()
        if note:
            storm_a = (
                f"{name} is not marked as a warm-water hurricane zone in our seasonal guide. "
                f"Local weather concern: {note} "
                "Cruise-day plans should still leave flexibility if weather shifts."
            )
        else:
            storm_a = (
                f"{name} is not marked as a tropical hurricane zone in our seasonal guide. "
                "The main weather concerns are season-normal wind, rain, and temperature swings—check the hazards and packing notes above before you sail. "
                "Cruise lines will divert if conditions become unsafe."
            )
        storm_q = f"Q: Is there a severe weather or storm season that affects {name}?"

    # Best time
    beach = join_months(best.get("beach") or best.get("beaches") or [])
    best_bits = []
    if peak != "N/A":
        best_bits.append(f"Peak cruise months: {peak}")
    if transitional != "N/A":
        best_bits.append(f"Transitional: {transitional}")
    if low != "N/A":
        best_bits.append(f"Low season: {low}")
    if avoid != "N/A":
        best_bits.append(f"Months often better avoided if you can choose: {avoid}")
    if beach != "N/A":
        best_bits.append(f"Beach-friendly months: {beach}")
    best_a = (
        f"Typical temperature range is {temp}; rain/humidity pattern: {rain}"
        + (f"; humidity {humid}" if humid else "")
        + (f"; wind {wind}" if wind else "")
        + ". "
        + (" ".join(best_bits) if best_bits else "See the seasonal guide above for month-by-month guidance.")
        + " Align your itinerary with the activities you care about most."
    )
    best_q = f"Q: What's the best time of year to visit {name} on a cruise?"

    # Packing
    pack_list = "; ".join(str(x) for x in packing[:5]) if packing else ""
    pack_a = (
        f"For {name}, prioritize layers for {temp} conditions and be ready for {rain}. "
        + (f"Seasonal packing nudges: {pack_list}. " if pack_list else "")
        + "Waterproof outer shell, comfortable walking shoes, sun protection, and a small dry-bag for tender reboarding are usually wise."
    )
    pack_q = f"Q: What should I pack for {name}'s weather?"

    # Rain
    catch = "; ".join(str(x) for x in catches[:3]) if catches else ""
    rain_a = (
        f"Brief rain is common enough around {name} that a flexible port-day plan beats canceling everything. "
        + (f"Local gotchas: {catch}. " if catch else "")
        + "Have one indoor or covered option, keep electronics dry, and remember many outdoor sights stay worthwhile in a light shower."
    )
    rain_q = f"Q: Will rain ruin my {name} port day?"

    return {
        "best_time": (best_q, best_a),
        "storm": (storm_q, storm_a),
        "packing": (pack_q, pack_a),
        "rain": (rain_q, rain_a),
    }


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


def compact_faq_items(section: str) -> str:
    """FAQ_COUNT wants <details class=\"faq-item\"><summary> on one line."""

    def repl(m):
        inner = m.group(0)
        inner = re.sub(
            r'<details([^>]*class="faq-item"[^>]*)>\s*<summary',
            r"<details\1><summary",
            inner,
            flags=re.I,
        )
        return inner

    return re.sub(
        r'<details[^>]*class="faq-item"[^>]*>[\s\S]*?</details>',
        repl,
        section,
        flags=re.I,
    )


def render_item(q: str, a: str) -> str:
    qs = q if re.match(r"^\s*Q:", q, re.I) else f"Q: {q}"
    return (
        f'<details class="faq-item"><summary>{htmlmod.escape(qs)}</summary>'
        f"<p>{htmlmod.escape(a)}</p></details>"
    )


def pairs_from_section(section: str) -> list[tuple[str, str]]:
    pairs = []
    for m in re.finditer(
        r'<details[^>]*class="faq-item"[^>]*>\s*<summary[^>]*>([\s\S]*?)</summary>\s*<p[^>]*>([\s\S]*?)</p>\s*</details>',
        section,
        re.I,
    ):
        q = htmlmod.unescape(re.sub(r"<[^>]+>", "", m.group(1))).strip()
        a = htmlmod.unescape(re.sub(r"<[^>]+>", "", m.group(2))).strip()
        if q and a:
            pairs.append((q, a))
    return pairs


def rebuild_section(head_open: str, pairs: list[tuple[str, str]]) -> str:
    items = "\n            ".join(render_item(q, a) for q, a in pairs)
    return head_open + "\n            " + items + "\n          </details>"


def replace_faq_schema(page: str, pairs: list[tuple[str, str]]):
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
        new_script = (
            '<script type="application/ld+json">\n'
            + json.dumps(obj, indent=2, ensure_ascii=False)
            + "\n  </script>"
        )
        return (
            page[:script_open]
            + new_script
            + page[script_close + len("</script>") :],
            True,
        )


def process(stem: str, sg: dict, apply: bool) -> dict:
    path = PORTS / f"{stem}.html"
    data = sg.get(stem)
    if not data:
        return {"stem": stem, "status": "NO_SEASONAL"}
    t = path.read_text()
    orig_len = len(t)
    missing = missing_topics(t)
    if not missing:
        return {"stem": stem, "status": "ALREADY_OK", "added": 0}

    found = find_balanced_details_by_id(t, "faq")
    if not found:
        return {"stem": stem, "status": "NO_FAQ_SECTION"}
    start, end, sec = found
    head_m = re.search(
        r'(<details\b[^>]*id="faq"[^>]*>\s*<summary>[\s\S]*?</summary>)',
        sec,
        re.I,
    )
    if not head_m:
        return {"stem": stem, "status": "NO_HEAD"}

    pairs = pairs_from_section(sec)
    answers = build_answers(stem, data)
    added = []
    for key, _pat, label in missing:
        q, a = answers[key]
        # skip if this would duplicate an existing topic after add
        pairs.append((q, a))
        added.append(label)

    new_sec = rebuild_section(head_m.group(1), pairs)
    new_sec = compact_faq_items(new_sec)
    t2 = t[:start] + new_sec + t[end:]
    t2, schema_ok = replace_faq_schema(t2, pairs)
    if len(t2) < orig_len * 0.85:
        return {"stem": stem, "status": "SAFETY_ABORT", "added": 0}
    # post-check all topics present in visible extract
    still = missing_topics(t2)
    if still:
        return {
            "stem": stem,
            "status": "STILL_MISSING",
            "added": added,
            "still": [x[2] for x in still],
        }
    if apply:
        path.write_text(t2)
    return {
        "stem": stem,
        "status": "OK" if schema_ok else "OK_NO_SCHEMA",
        "added": added,
        "n": len(added),
        "len_delta": len(t2) - orig_len,
    }


def main():
    apply = "--apply" in sys.argv
    sg = json.loads(SG_PATH.read_text())
    results = [process(stem, sg, apply) for stem in STEMS]
    print("APPLY" if apply else "DRY")
    for r in results:
        print(r)
    bad = [r for r in results if r.get("status") not in ("OK", "OK_NO_SCHEMA", "ALREADY_OK")]
    if bad:
        sys.exit(2)


if __name__ == "__main__":
    main()
