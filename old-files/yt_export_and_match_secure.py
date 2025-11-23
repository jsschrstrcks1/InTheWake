#!/usr/bin/env python3
"""
yt_export_and_match_secure.py
- Uses requests + certifi to avoid SSL CERTIFICATE_VERIFY_FAILED on macOS
- Exports creator uploads and classifies videos for the In The Wake project
Outputs:
  - yt_exports/*.csv
  - rc_ship_videos_patch.json
"""
import os, sys, csv, json, argparse, time, re
from pathlib import Path

import requests, certifi

BASE = "https://www.googleapis.com/youtube/v3"

# ---------- Royal Caribbean fleet ----------
FLEET = [
    "Icon of the Seas","Star of the Seas",
    "Oasis of the Seas","Allure of the Seas","Harmony of the Seas",
    "Symphony of the Seas","Wonder of the Seas","Utopia of the Seas",
    "Quantum of the Seas","Anthem of the Seas","Ovation of the Seas",
    "Spectrum of the Seas","Odyssey of the Seas",
    "Freedom of the Seas","Liberty of the Seas","Independence of the Seas",
    "Voyager of the Seas","Explorer of the Seas","Adventure of the Seas",
    "Navigator of the Seas","Mariner of the Seas",
    "Radiance of the Seas","Brilliance of the Seas","Serenade of the Seas","Jewel of the Seas",
    "Vision of the Seas","Rhapsody of the Seas","Enchantment of the Seas","Grandeur of the Seas"
]

# ---------- Fuzzy rules ----------
WALKTHROUGH = re.compile(r"(walk.?through|ship tour|deck.?by.?deck|full (tour|walkthrough)|tour the ship|tour & review|walkthrough review|review & walkthrough|4k)", re.I)
TOP10 = re.compile(r"(top.?10|ten things|things to do|favorites?|must[- ]?do|must[- ]?try|don.?t miss|regret missing|top attractions?|hidden gems|must[- ]?see|tour tips)", re.I)
ACCESS = re.compile(r"(accessible|wheelchair|handicap|mobility|ada|disab)", re.I)
CABIN = {
    "Interior": re.compile(r"\binterior\b", re.I),
    "Oceanview": re.compile(r"ocean.?view", re.I),
    "Balcony": re.compile(r"\bbalcony\b", re.I),
    "Junior Suite": re.compile(r"junior", re.I),
    "Grand Suite": re.compile(r"grand suite", re.I),
    "Owner's Suite": re.compile(r"owner", re.I),
    "Royal Suite": re.compile(r"(royal suite|royal loft)", re.I),
    "Accessible Interior": re.compile(r"accessible.+interior", re.I),
    "Accessible Oceanview": re.compile(r"accessible.+ocean", re.I),
    "Accessible Balcony": re.compile(r"accessible.+balcony", re.I),
    "Accessible Junior Suite": re.compile(r"accessible.+junior", re.I),
}

def http_get(endpoint, params, api_key, retries=4, backoff=1.6):
    params = dict(params or {})
    params["key"] = api_key
    last = None
    for i in range(retries):
        try:
            r = requests.get(f"{BASE}{endpoint}", params=params, timeout=30, verify=certifi.where())
            if r.status_code == 200:
                return r.json()
            last = f"HTTP {r.status_code} {r.text[:200]}"
        except requests.RequestException as e:
            last = str(e)
        time.sleep(backoff ** i)
    raise RuntimeError(f"GET failed: {endpoint} params={params} last_error={last}")

def resolve_channel_id(query, api_key):
    res = http_get("/search", {"part":"snippet","type":"channel","q":query,"maxResults":5}, api_key)
    items = res.get("items", [])
    if not items: return None
    needle = query.lstrip("@").lower()
    best = items[0]
    for it in items:
        title = it["snippet"]["channelTitle"].lower()
        if needle in title:
            best = it; break
    return best["snippet"]["channelId"]

def uploads_playlist_id(channel_id, api_key):
    res = http_get("/channels", {"part":"contentDetails","id":channel_id}, api_key)
    items = res.get("items", [])
    if not items: return None
    return items[0]["contentDetails"]["relatedPlaylists"]["uploads"]

def iter_playlist(playlist_id, api_key):
    pageToken=None
    while True:
        params={"part":"snippet,contentDetails","playlistId":playlist_id,"maxResults":50}
        if pageToken: params["pageToken"]=pageToken
        data = http_get("/playlistItems", params, api_key)
        for it in data.get("items", []):
            yield it
        pageToken = data.get("nextPageToken")
        if not pageToken: break

def norm(s): return (s or "").replace("\n"," ").strip()

def classify(video_title, video_desc):
    t = video_title or ""
    d = video_desc or ""
    text = f"{t}\n{d}"
    tags = []
    if WALKTHROUGH.search(text): tags.append("walkthrough")
    if TOP10.search(text): tags.append("top10")
    if ACCESS.search(text): tags.append("access")
    cabins = [name for name,rx in CABIN.items() if rx.search(text)]
    return tags, cabins

def detect_ship(video_title, video_desc):
    text = f"{video_title} {video_desc}".lower()
    for ship in FLEET:
        if ship.lower() in text:
            return ship
    return None

def main():
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--api-key", required=False, help="YouTube Data API v3 key; if omitted, you will be prompted.")
    ap.add_argument("--creators", nargs="*", help="Creators to crawl (e.g., @HarrTravel)")
    ap.add_argument("--creators-file", help="Text file, one creator per line")
    args = ap.parse_args()

    api_key = args.api_key or os.getenv("YOUTUBE_API_KEY") or ""
    if not api_key:
        try:
            api_key = input("Paste your YouTube API key: ").strip()
        except KeyboardInterrupt:
            print("\nAborted.")
            sys.exit(1)
    if not api_key:
        print("No API key provided. Exiting.")
        sys.exit(1)

    creators = args.creators or []
    if args.creators_file and Path(args.creators_file).exists():
        creators += [ln.strip() for ln in Path(args.creators_file).read_text(encoding="utf-8").splitlines()
                     if ln.strip() and not ln.strip().startswith("#")]
    if not creators:
        creators = [
            "@HarrTravel","@CruiseTipsTV","@PopularCruising","@TheCruiseRoom","@LifeWellCruised",
            "@thiscruiselife","@CruisesRoomsReviews","@SeaCruisers","@TallMansCruiseAdventures",
            "@AlannaZingano","@CruiseReport","@HollyandAndrew","@CruisingCanucks","@NauticalWanderers",
            "@DanasCruiseAdventures","@EdwardTravels","@ILikeCruiseShips","@HeatherLovesCruising"
        ]

    out_dir = Path("yt_exports"); out_dir.mkdir(parents=True, exist_ok=True)
    patch = {}

    for creator in creators:
        try:
            print(f"[+] Processing {creator} ...")
            ch_id = resolve_channel_id(creator, api_key)
            if not ch_id:
                print(f"    ! Could not resolve channel for {creator}")
                continue
            uploads = uploads_playlist_id(ch_id, api_key)
            if not uploads:
                print(f"    ! No uploads playlist for {creator}")
                continue

            csv_path = out_dir / f"{creator.lstrip('@').replace('/','_')}.csv"
            with csv_path.open("w", newline="", encoding="utf-8") as f:
                w = csv.writer(f)
                w.writerow(["videoId","publishedAt","title","description","creator"])
                count=0
                for item in iter_playlist(uploads, api_key):
                    vid = item["contentDetails"]["videoId"]
                    sn = item["snippet"]
                    pub = sn.get("publishedAt","")
                    title = norm(sn.get("title",""))
                    desc = norm(sn.get("description",""))
                    w.writerow([vid,pub,title,desc,creator])
                    count += 1

                    tags, cabins = classify(title, desc)
                    ship = detect_ship(title, desc)
                    if not ship:
                        continue
                    if "walkthrough" in tags:
                        patch.setdefault(ship, {}).setdefault("ship walkthroughs", []).append({
                            "videoId": vid, "title": title, "creator_label": creator.lstrip("@")
                        })
                    if "top10" in tags:
                        patch.setdefault(ship, {}).setdefault("top 10 things to do", []).append({
                            "videoId": vid, "title": title, "creator_label": creator.lstrip("@")
                        })
                    for cab in cabins:
                        patch.setdefault(ship, {}).setdefault("stateroom & suite tours", []).append({
                            "videoId": vid, "title": title, "creator_label": creator.lstrip("@")
                        })
                    if "access" in tags:
                        patch.setdefault(ship, {}).setdefault("accessibility", []).append({
                            "videoId": vid, "title": title, "creator_label": creator.lstrip("@")
                        })
            print(f"    ✓ Wrote {count} rows to {csv_path.name}")
        except Exception as e:
            print(f"    ! Error with {creator}: {e}")

    with open("rc_ship_videos_patch.json","w",encoding="utf-8") as f:
        json.dump(patch, f, indent=2, ensure_ascii=False)

    print("\nDone.")
    print("Created:")
    print("  - yt_exports/*.csv")
    print("  - rc_ship_videos_patch.json")

if __name__ == "__main__":
    main()
