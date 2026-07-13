#!/usr/bin/env python3
"""Hardening pass: (A) forbidden weather phrases in port HTML,
(B) non-FAQ weather structure on the 10 FAQ-fixed ports.

Soli Deo Gloria. Careful, not clever.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PORTS = ROOT / "ports"
SG = json.loads((ROOT / "assets/data/ports/seasonal-guides.json").read_text())

# Track A — validator FORBIDDEN_PATTERNS replacements (text nodes / labels)
# Order matters: longer/more specific first.
PHRASE_REPLS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"Shoulder Season", re.I), "Transitional Season"),
    (re.compile(r"shoulder seasons", re.I), "transitional seasons"),
    (re.compile(r"shoulder season", re.I), "transitional season"),
    (re.compile(r"Weather Guide", re.I), "weather section"),
    (re.compile(r"weather guide", re.I), "weather section"),
    (re.compile(r"Climate Overview", re.I), "At a Glance"),
    (re.compile(r"Typical Weather", re.I), "At a Glance"),
    (re.compile(r"When to Go", re.I), "Best Time to Visit"),
    (re.compile(r"When to Visit", re.I), "Best Time to Visit"),
    (re.compile(r"best months to visit", re.I), "best time to visit"),
    (re.compile(r"best months for", re.I), "best time for"),
    (re.compile(r"Best Months for", re.I), "Best Time for"),
    (re.compile(r"Best Months to", re.I), "Best Time to"),
]

STEMS_B = [
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

ACT_CANON = ["Beach", "Snorkeling", "Hiking", "City Walking", "Low Crowds"]

BM_KEY = {
    "beach": "Beach",
    "snorkeling": "Snorkeling",
    "hiking": "Hiking",
    "city_walking": "City Walking",
    "low_crowds": "Low Crowds",
}


def months_str(v) -> str:
    if not v:
        return "N/A"
    if isinstance(v, list):
        return ", ".join(str(x) for x in v)
    return str(v)


def activity_months(stem: str) -> dict[str, str]:
    data = SG.get(stem) or {}
    bm = data.get("best_months_for") or {}
    out = {label: "N/A" for label in ACT_CANON}
    for k, label in BM_KEY.items():
        if k in bm and bm[k]:
            out[label] = months_str(bm[k])
    # careful N/As: cold/fjord / city ports
    if stem in ("olden",):
        # fjord/glacier village — beach/snorkel not real
        out["Beach"] = "N/A"
        out["Snorkeling"] = "N/A"
        if out["City Walking"] == "N/A":
            out["City Walking"] = months_str(bm.get("hiking") or bm.get("scenic_cruising") or ["May", "Jun", "Jul", "Aug", "Sep"])
    if stem in ("shanghai",):
        out["Beach"] = "N/A"
        out["Snorkeling"] = "N/A"
        if out["Hiking"] == "N/A" and bm.get("hiking"):
            out["Hiking"] = months_str(bm["hiking"])
    if stem in ("singapore",):
        if out["Hiking"] == "N/A":
            # no hiking in data — N/A is honest
            out["Hiking"] = "N/A"
        if out["Snorkeling"] == "N/A" and not bm.get("snorkeling"):
            out["Snorkeling"] = "N/A"
    if stem == "dravuni":
        # Exploring was stand-in for city walking / village exploring
        if out["City Walking"] == "N/A":
            out["City Walking"] = months_str(bm.get("hiking") or bm.get("beach") or ["Jun", "Jul", "Aug"])
    return out


def fix_phrases(text: str) -> tuple[str, int]:
    n = 0
    for pat, rep in PHRASE_REPLS:
        text2, c = pat.subn(rep, text)
        if c:
            n += c
            text = text2
    return text, n


def ensure_at_a_glance_title(text: str) -> tuple[str, bool]:
    if re.search(r">At a Glance<", text):
        return text, False
    # seasonal Overview title → At a Glance
    text2, c = re.subn(
        r'(<summary class="seasonal-section-title">)Overview(</summary>)',
        r"\1At a Glance\2",
        text,
        count=1,
    )
    if c:
        return text2, True
    return text, False


def ensure_activity_rows(text: str, stem: str) -> tuple[str, str]:
    """Ensure all five activity-label spans exist with months from seasonal guides.

    Strategy:
    - If a best-months-activities block exists, renorm its labels/rows.
    - Else inject a compact block after seasonal-at-glance if present.
    - Else inject after first >At a Glance< regional heading.
    """
    months = activity_months(stem)

    def row_html(label: str) -> str:
        return (
            f'<div class="activity-row"><span class="activity-label">{label}</span>'
            f'<span class="activity-months">{months[label]}</span></div>'
        )

    # Prefer existing best-months-activities block
    m = re.search(
        r'(<div class="best-months-activities">)([\s\S]*?)(</div>)',
        text,
        re.I,
    )
    if m:
        new_inner = "\n                      ".join(row_html(a) for a in ACT_CANON)
        block = m.group(1) + "\n                      " + new_inner + "\n                    " + m.group(3)
        return text[: m.start()] + block + text[m.end() :], "replaced-activities-block"

    # Inject after seasonal-at-glance closing of parent... find seasonal-at-glance section
    m2 = re.search(r'<div class="seasonal-at-glance">[\s\S]*?</div>\s*</div>', text)
    # simpler: after first seasonal-glance-grid close cluster
    m2 = re.search(
        r'(<div class="seasonal-at-glance">[\s\S]*?</div>\s*</div>)',
        text,
    )
    inject = (
        '\n                    <div class="best-months-activities">\n                      '
        + "\n                      ".join(row_html(a) for a in ACT_CANON)
        + "\n                    </div>"
    )
    if m2:
        return text[: m2.end()] + inject + text[m2.end() :], "injected-after-glance"

    # last resort: after first At a Glance summary open section
    m3 = re.search(
        r'(<summary class="seasonal-section-title">At a Glance</summary>)',
        text,
    )
    if m3:
        return (
            text[: m3.end()]
            + '\n                  <div class="best-months-activities">\n                    '
            + "\n                    ".join(row_html(a) for a in ACT_CANON)
            + "\n                  </div>"
            + text[m3.end() :],
            "injected-after-summary",
        )

    # ports without seasonal structure (philipsburg/santos/rostock):
    # inject a minimal seasonal activities block after port-level At a Glance section if present
    m4 = re.search(r"(>At a Glance</h4>[\s\S]{0,1200}?</(?:div|dl|section)>)", text, re.I)
    if m4:
        block = (
            '\n      <div class="best-months-activities" data-source="seasonal-guides">'
            "\n        "
            + "\n        ".join(row_html(a) for a in ACT_CANON)
            + "\n      </div>"
        )
        return text[: m4.end()] + block + text[m4.end() :], "injected-after-port-glance"

    return text, "no-inject-point"


def process_a(apply: bool) -> dict:
    stats = {"files": 0, "subs": 0, "changed": []}
    for p in sorted(PORTS.glob("*.html")):
        t = p.read_text(errors="ignore")
        t2, n = fix_phrases(t)
        if n:
            stats["files"] += 1
            stats["subs"] += n
            stats["changed"].append((p.name, n))
            if apply:
                p.write_text(t2)
    return stats


def process_b(apply: bool) -> list[dict]:
    out = []
    for stem in STEMS_B:
        path = PORTS / f"{stem}.html"
        t = path.read_text()
        orig = t
        t, did_aag = ensure_at_a_glance_title(t)
        t, mode = ensure_activity_rows(t, stem)
        # verify labels present
        missing = [
            a
            for a in ACT_CANON
            if not re.search(
                rf'<span class="activity-label">{re.escape(a)}</span>', t
            )
        ]
        aag = bool(re.search(r">At a Glance<", t))
        status = "OK" if aag and not missing else "PARTIAL"
        if apply and t != orig:
            path.write_text(t)
        out.append(
            {
                "stem": stem,
                "aag": aag,
                "renamed_overview": did_aag,
                "mode": mode,
                "missing": missing,
                "status": status,
                "changed": t != orig,
            }
        )
    return out


def residual_forbidden_count() -> int:
    FORBIDDEN = [
        re.compile(r"Shoulder Season", re.I),
        re.compile(r"Best Months?\s+(for|to)", re.I),
        re.compile(r"Weather Guide", re.I),
        re.compile(r"Climate Overview", re.I),
        re.compile(r"When to (Go|Visit)", re.I),
        re.compile(r"Typical Weather", re.I),
    ]
    n = 0
    for p in PORTS.glob("*.html"):
        t = p.read_text(errors="ignore")
        for pat in FORBIDDEN:
            n += len(pat.findall(t))
    return n


def main():
    apply = "--apply" in sys.argv
    a = process_a(apply)
    b = process_b(apply)
    print("APPLY" if apply else "DRY")
    print("TRACK_A files", a["files"], "subs", a["subs"])
    for name, n in a["changed"][:30]:
        print(" ", name, n)
    print("TRACK_B")
    for r in b:
        print(r)
    if apply:
        print("POST_FORBIDDEN", residual_forbidden_count())


if __name__ == "__main__":
    main()
