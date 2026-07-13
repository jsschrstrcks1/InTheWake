#!/usr/bin/env python3
"""Issue E: inject missing weather-guide / seasonal shells from seasonal-guides.json.

Skips pure redirect stubs. Grounds copy in existing JSON only.
Soli Deo Gloria. Careful, not clever.
"""
from __future__ import annotations

import html as H
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PORTS = ROOT / "ports"
SG = json.loads((ROOT / "assets/data/ports/seasonal-guides.json").read_text())

ACT = ["Beach", "Snorkeling", "Hiking", "City Walking", "Low Crowds"]
BM_KEY = {
    "beach": "Beach",
    "snorkeling": "Snorkeling",
    "hiking": "Hiking",
    "city_walking": "City Walking",
    "low_crowds": "Low Crowds",
}

REGION_BY_TZ_PREFIX = {
    "America/Lower_Princes": "Caribbean",
    "America/Sao_Paulo": "South America",
    "America/Argentina": "South America",
    "America/Manaus": "South America",
    "America/Bogota": "South America",
    "America/Santarem": "South America",
    "America/Montevideo": "South America",
    "America/Puerto_Rico": "Caribbean",
    "America/St_Barthelemy": "Caribbean",
    "America/Thule": "Atlantic",
    "Atlantic/": "Atlantic",
    "Europe/": "Europe",
    "Asia/Jerusalem": "Mediterranean",
    "Asia/Tokyo": "Asia Pacific",
    "Asia/Seoul": "Asia Pacific",
    "Asia/Jakarta": "Asia Pacific",
    "Asia/Makassar": "Asia Pacific",
    "Asia/Bangkok": "Asia Pacific",
    "Asia/Phnom_Penh": "Asia Pacific",
    "Asia/Hong_Kong": "Asia Pacific",
    "Pacific/": "Pacific",
    "Indian/": "Indian Ocean",
    "Africa/": "Africa",
}


def months(v) -> str:
    if not v:
        return "None"
    if isinstance(v, list):
        return ", ".join(str(x) for x in v) if v else "None"
    return str(v)


def fancy(stem: str) -> str:
    return stem.replace("-", " ").title()


def region_for(tz: str | None, stem: str) -> str:
    if not tz:
        return "Global"
    for prefix, reg in REGION_BY_TZ_PREFIX.items():
        if tz.startswith(prefix) or tz == prefix:
            return reg
    if tz.startswith("Europe/"):
        return "Europe"
    if tz.startswith("Asia/"):
        return "Asia Pacific"
    if tz.startswith("America/"):
        return "Americas"
    return "Global"


def extract_geo(html: str) -> tuple[str, str]:
    m = re.search(
        r'"latitude"\s*:\s*"?(-?\d+(?:\.\d+)?)"?[\s\S]{0,80}?"longitude"\s*:\s*"?(-?\d+(?:\.\d+)?)"?',
        html,
    )
    if m:
        return m.group(1), m.group(2)
    m = re.search(
        r'"longitude"\s*:\s*"?(-?\d+(?:\.\d+)?)"?[\s\S]{0,80}?"latitude"\s*:\s*"?(-?\d+(?:\.\d+)?)"?',
        html,
    )
    if m:
        return m.group(2), m.group(1)
    # itemprop fallbacks
    lat = re.search(r'itemprop="latitude" content="([^"]+)"', html)
    lon = re.search(r'itemprop="longitude" content="([^"]+)"', html)
    if lat and lon:
        return lat.group(1), lon.group(1)
    return "0", "0"


def extract_name(html: str, stem: str) -> str:
    h1 = re.search(r"<h1[^>]*>([^<]+)</h1>", html, re.I)
    if h1:
        return re.sub(r"\s+", " ", h1.group(1)).strip()
    t = re.search(r"<title>([^|<]+)", html, re.I)
    if t:
        return re.sub(r"\s+", " ", t.group(1)).strip()
    return fancy(stem)


def is_redirect(html: str) -> bool:
    head = html[:1200].lower()
    return 'http-equiv="refresh"' in head or ("redirect" in head and len(html) < 5000)


def has_shell(html: str) -> bool:
    return (
        'id="weather-guide"' in html
        and 'id="port-weather-widget"' in html
        and "seasonal-guide" in html
    )


def activity_months(data: dict, stem: str) -> dict[str, str]:
    bm = data.get("best_months_for") or {}
    out = {a: "N/A" for a in ACT}
    for k, lab in BM_KEY.items():
        if bm.get(k):
            out[lab] = months(bm[k])
    # honest cold-water / city defaults
    coldish = {
        "rostock",
        "stavanger",
        "klaipeda",
        "south-georgia",
        "tristan-da-cunha",
        "pitcairn",
        "st-helena",
    }
    cityish = {
        "tokyo",
        "incheon",
        "hakodate",
        "haifa",
        "manaus",
        "montevideo",
        "rio-de-janeiro",
    }
    if stem in coldish or (data.get("hazards") or {}).get("note", "").lower().find("baltic") >= 0:
        if out["Snorkeling"] == "N/A" or stem in coldish:
            # keep beach if provided, else N/A snorkel
            if stem in coldish and not bm.get("snorkeling"):
                out["Snorkeling"] = "N/A"
            if stem in {"south-georgia", "tristan-da-cunha"} and not bm.get("beach"):
                out["Beach"] = "N/A"
                out["Snorkeling"] = "N/A"
    if stem in cityish and not bm.get("snorkeling"):
        out["Snorkeling"] = "N/A"
    if stem == "rostock" and not bm.get("snorkeling"):
        out["Snorkeling"] = "N/A"
        if out["Hiking"] == "N/A":
            out["Hiking"] = months(bm.get("city_walking") or ["May", "Jun", "Jul", "Aug", "Sep"])
    if stem == "philipsburg" and out["Hiking"] == "N/A":
        out["Hiking"] = months(bm.get("city_walking") or ["Dec", "Jan", "Feb", "Mar"])
    if stem == "santos" and out["Hiking"] == "N/A":
        out["Hiking"] = months(bm.get("city_walking") or ["May", "Jun", "Jul", "Aug", "Sep"])
    if stem == "santos" and out["Snorkeling"] == "N/A" and not bm.get("snorkeling"):
        out["Snorkeling"] = "N/A"
    return out


def ul(items) -> str:
    items = items or []
    if not items:
        return "                      <li>See the seasonal notes for this port before you sail.</li>"
    return "\n".join(f"                      <li>{H.escape(str(x))}</li>" for x in items)


def hazard_html(data: dict, name: str) -> str:
    haz = data.get("hazards") or {}
    if haz.get("hurricane_zone"):
        text = (
            f"{name} sits in a tropical cyclone/hurricane-risk region. "
            f"Season: {haz.get('hurricane_season') or 'see local guidance'}. "
            f"Peak risk months: {months(haz.get('peak_risk_months'))}."
        )
        note = (haz.get("note") or "").strip()
        if note:
            text += f" {note}"
        text += " Cruise lines monitor systems and may adjust itineraries."
        return H.escape(text)
    note = (haz.get("note") or "").strip()
    if note:
        return H.escape(
            f"{name}: {note} Build weather flexibility into shore plans; packing layers helps."
        )
    return H.escape(
        f"{name} is not marked as a warm-water hurricane zone in our seasonal guide. "
        "Review local advisories and base layers for rain, wind, and temperature swings on cruise day."
    )


def build_section(stem: str, html: str, data: dict) -> str:
    name = extract_name(html, stem)
    lat, lon = extract_geo(html)
    region = region_for(data.get("timezone"), stem)
    gl = data.get("at_a_glance") or {}
    seasons = data.get("cruise_seasons") or {}
    am = activity_months(data, stem)
    avoid = months(data.get("avoid_months"))
    if avoid == "None":
        avoid_label = "No strong avoid months in seasonal guide"
    else:
        avoid_label = "Consider avoiding:"

    def gval(key, default="Varies by season"):
        return H.escape(str(gl.get(key) or default))

    high = months(seasons.get("high"))
    trans = months(seasons.get("transitional"))
    low = months(seasons.get("low"))

    act_rows = "\n".join(
        f'                      <div class="activity-row">'
        f'<span class="activity-label">{a}</span>'
        f'<span class="activity-months">{H.escape(am[a])}</span></div>'
        for a in ACT
    )

    return f'''
        <!-- WEATHER & BEST TIME TO VISIT (Issue E shell) -->
        <details class="port-section" id="weather-guide" open="">
            <summary><h2>Weather & Best Time to Visit</h2></summary>
              <div id="port-weather-widget" data-port-id="{H.escape(stem)}" data-port-name="{H.escape(name)}" data-lat="{H.escape(lat)}" data-lon="{H.escape(lon)}" data-region="{H.escape(region)}">
            <noscript>
              <div class="seasonal-guide seasonal-guide-static">
                <details class="seasonal-section" open>
                  <summary class="seasonal-section-title">At a Glance</summary>
                  <div class="seasonal-at-glance">
                    <div class="seasonal-glance-grid">
                      <div class="seasonal-glance-item"><span class="glance-label">Temperature</span><span class="glance-value">{gval('temp_range')}</span></div>
                      <div class="seasonal-glance-item"><span class="glance-label">Humidity</span><span class="glance-value">{gval('humidity')}</span></div>
                      <div class="seasonal-glance-item"><span class="glance-label">Rain</span><span class="glance-value">{gval('rain')}</span></div>
                      <div class="seasonal-glance-item"><span class="glance-label">Wind</span><span class="glance-value">{gval('wind')}</span></div>
                      <div class="seasonal-glance-item"><span class="glance-label">Daylight</span><span class="glance-value">{gval('daylight')}</span></div>
                    </div>
                  </div>
                </details>
                <details class="seasonal-section" open>
                  <summary class="seasonal-section-title">Best Time to Visit</summary>
                  <div class="cruise-seasons-grid">
                    <div class="cruise-season cruise-season-high"><span class="season-label">Peak Season</span><span class="season-months">{H.escape(high)}</span></div>
                    <div class="cruise-season cruise-season-transitional"><span class="season-label">Transitional Season</span><span class="season-months">{H.escape(trans)}</span></div>
                    <div class="cruise-season cruise-season-low"><span class="season-label">Low Season</span><span class="season-months">{H.escape(low)}</span></div>
                  </div>
                  <div class="best-months-activities">
{act_rows}
                  </div>
                    <div class="months-to-avoid">
                      <span class="avoid-label">{H.escape(avoid_label)}</span>
                      <span class="avoid-months">{H.escape(avoid)}</span>
                    </div>
                </details>
                <details class="seasonal-section">
                  <summary class="seasonal-section-title">What Catches Visitors Off Guard</summary>
                  <div class="seasonal-catches">
                    <ul class="catches-list">
{ul(data.get('catches_off_guard'))}
                    </ul>
                  </div>
                </details>
                <details class="seasonal-section">
                  <summary class="seasonal-section-title">Packing Tips</summary>
                  <div class="seasonal-packing">
                    <ul class="packing-list">
{ul(data.get('packing_nudges'))}
                    </ul>
                  </div>
                </details>
                <details class="seasonal-section">
                  <summary class="seasonal-section-title">Weather Hazards</summary>
                  <div class="hazard-warning"><p>{hazard_html(data, name)}</p></div>
                </details>
              </div>
              <p class="js-required-note"><em>Enable JavaScript for live weather conditions and 48-hour forecast.</em></p>
            </noscript>
              </div>
        </details>
'''


def find_insert_point(html: str) -> int | None:
    """Return index to insert the weather section before FAQ or near main content end."""
    # Prefer before FAQ details/section
    for pat in [
        r'<details[^>]*id="faq"',
        r'<section[^>]*id="faq"',
        r'id="faq"',
        r'<!--\s*FAQ',
        r'<h2[^>]*>\s*Frequently Asked',
        r'<h2[^>]*>\s*FAQ',
    ]:
        m = re.search(pat, html, re.I)
        if m:
            return m.start()
    # After port-level At a Glance section if present
    m = re.search(r'At a Glance</h4>[\s\S]{0,2000}?</section>', html, re.I)
    if m:
        return m.end()
    # Before author card
    m = re.search(r'author-card|About the Author', html, re.I)
    if m:
        return m.start()
    # Before footer
    m = re.search(r'<footer\b', html, re.I)
    if m:
        return m.start()
    return None


def process(stem: str, apply: bool) -> dict:
    data = SG.get(stem)
    path = PORTS / f"{stem}.html"
    if not data:
        return {"stem": stem, "status": "NO_DATA"}
    if not path.is_file():
        return {"stem": stem, "status": "NO_FILE"}
    html = path.read_text()
    if is_redirect(html):
        return {"stem": stem, "status": "SKIP_REDIRECT"}
    if has_shell(html):
        return {"stem": stem, "status": "ALREADY"}
    # Remove prior orphan activity injects that aren't in a weather-guide (from harden)
    # Only if they sit outside weather-guide — keep content simple: leave them; shell may duplicate ACT labels.
    # If orphan best-months-activities exists OUTSIDE weather-guide, strip first occurrence blocks that would DUPLICATE.
    if 'id="weather-guide"' not in html and "best-months-activities" in html:
        # remove first orphan activity block carefully (balanced)
        m = re.search(
            r'<div class="best-months-activities"[^>]*>',
            html,
        )
        if m:
            start = m.start()
            i = m.end()
            depth = 1
            while i < len(html) and depth:
                o = re.search(r"<div\b", html[i:], re.I)
                c = re.search(r"</div>", html[i:], re.I)
                if not c:
                    break
                op = i + o.start() if o else None
                cp = i + c.start()
                if op is not None and op < cp:
                    depth += 1
                    i = op + 4
                else:
                    depth -= 1
                    i = cp + 6
                    if depth == 0:
                        html = html[:start] + html[i:]
                        break

    section = build_section(stem, html, data)
    idx = find_insert_point(html)
    if idx is None:
        return {"stem": stem, "status": "NO_INSERT"}
    new_html = html[:idx] + section + html[idx:]
    if len(new_html) < len(html) * 0.9:
        return {"stem": stem, "status": "SAFETY"}
    if not has_shell(new_html):
        return {"stem": stem, "status": "SHELL_FAIL"}
    if apply:
        path.write_text(new_html)
    return {
        "stem": stem,
        "status": "OK",
        "delta": len(new_html) - len(html),
        "insert": idx,
    }


def targets() -> list[str]:
    out = []
    for stem in sorted(k for k in SG if k != "_meta"):
        p = PORTS / f"{stem}.html"
        if not p.is_file():
            continue
        html = p.read_text(errors="ignore")
        if is_redirect(html):
            continue
        if not has_shell(html):
            out.append(stem)
    return out


def main():
    apply = "--apply" in sys.argv
    only = [a for a in sys.argv[1:] if not a.startswith("--")]
    stems = only if only else targets()
    print("APPLY" if apply else "DRY", "count", len(stems))
    results = [process(s, apply) for s in stems]
    for r in results:
        print(r)
    bad = [r for r in results if r.get("status") not in ("OK", "ALREADY", "SKIP_REDIRECT")]
    if bad:
        sys.exit(2)


if __name__ == "__main__":
    main()
