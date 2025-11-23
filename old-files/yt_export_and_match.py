#!/usr/bin/env python3
"""
yt_export_and_match.py
----------------------
Export a channel's full uploads via YouTube Data API v3 and classify videos for
the In The Wake project. Produces:
  - yt_exports/*.csv (one per creator)
  - rc_ship_videos_patch.json (JSON to merge into rc_ship_videos.json)

Usage:
  python3 yt_export_and_match.py --api-key YOUR_KEY
  python3 yt_export_and_match.py --api-key YOUR_KEY --creators @HarrTravel @CruiseTipsTV
  python3 yt_export_and_match.py --api-key YOUR_KEY --creators-file creators_green.txt

If --api-key is omitted, the script reads the YOUTUBE_API_KEY env var.
"""
import os, sys, csv, json, argparse, urllib.parse, urllib.request, re, time
from pathlib import Path

# ---------- Royal Caribbean fleet (matching target) ----------
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

BASE = "https://www.googleapis.com/youtube/v3"

def http_get(endpoint, params, api_key, retries=3, backoff=1.5):
    params = dict(params or {})
    params["key"] = api_key
    query = urllib.parse.urlencode(params)
    url = f"{BASE}{endpoint}?{query}"
    last_err = None
    for i in range(retries):
        try:
            with urllib.request.urlopen(url) as r:
                return json.load(r)
        except Exception as e:
            last_err = e
            time.sleep(backoff ** (i+1))
    raise RuntimeError(f"GET failed after {retries} tries: {url}\n{last_err}")

def resolve_channel_id(query, api_key):
    # Accept @handle or plain name
    res = http_get("/search", {"part":"snippet","type":"channel","q":query,"maxResults":5}, api_key)
    items = res.get("items", [])
    if not items: return None
    # Prefer exact handle match (without @) or close title
    needle = query.lstrip("@").lower()
    best = items[0]
    for it in items:
        title = it["snippet"]["channelTitle"].lower()
        if needle in title:
            best = it
            break
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
    ap = argparse.ArgumentParser()
    ap.add_argument("--api-key", help="YouTube Data API v3 key (or set YOUTUBE_API_KEY env var)")
    ap.add_argument("--creators", nargs="*", help="List of channel names/handles to export (e.g. @HarrTravel)")
    ap.add_argument("--creators-file", help="Path to a text file with one creator per line")
    args = ap.parse_args()

    api_key = args.api_key or os.getenv("YOUTUBE_API_KEY", "").strip()
    if not api_key:
        print("ERROR: Provide --api-key or set YOUTUBE_API_KEY env var.", file=sys.stderr)
        sys.exit(1)

    # Default creators if none supplied
    creators = args.creators or []
    if args.creators_file:
        with open(args.creators_file, "r", encoding="utf-8") as f:
            creators += [ln.strip() for ln in f if ln.strip() and not ln.strip().startswith("#")]
    if not creators:
        creators = [
            "@HarrTravel","@CruiseTipsTV","@PopularCruising","@TheCruiseRoom","@LifeWellCruised",
            "@thiscruiselife","@CruisesRoomsReviews","@SeaCruisers","@TallMansCruiseAdventures",
            "@AlannaZingano","@CruiseReport","@HollyandAndrew","@CruisingCanucks","@NauticalWanderers",
            "@DanasCruiseAdventures","@EdwardTravels","@ILikeCruiseShips","@HeatherLovesCruising"
        ]

    out_dir = Path("yt_exports")
    out_dir.mkdir(parents=True, exist_ok=True)
    patch = {}

    for creator in creators:
        try:
            print(f"[+] Processing {creator} ...", file=sys.stderr)
            ch_id = resolve_channel_id(creator, api_key)
            if not ch_id:
                print(f"    ! Could not resolve channel for {creator}", file=sys.stderr)
                continue
            uploads = uploads_playlist_id(ch_id, api_key)
            if not uploads:
                print(f"    ! No uploads playlist for {creator}", file=sys.stderr)
                continue

            csv_path = out_dir / f"{creator.lstrip('@').replace('/','_')}.csv"
            with csv_path.open("w", newline="", encoding="utf-8") as f:
                w = csv.writer(f)
                w.writerow(["videoId","publishedAt","title","description","creator"])
                count = 0
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

                    # Walkthrough
                    if "walkthrough" in tags:
                        patch.setdefault(ship, {}).setdefault("ship walkthroughs", []).append({
                            "videoId": vid, "title": title, "creator_label": creator.lstrip("@")
                        })
                    # Top 10
                    if "top10" in tags:
                        patch.setdefault(ship, {}).setdefault("top 10 things to do", []).append({
                            "videoId": vid, "title": title, "creator_label": creator.lstrip("@")
                        })
                    # Staterooms
                    for cab in cabins:
                        patch.setdefault(ship, {}).setdefault("stateroom & suite tours", []).append({
                            "videoId": vid, "title": title, "creator_label": creator.lstrip("@")
                        })
                    # Accessibility
                    if "access" in tags:
                        patch.setdefault(ship, {}).setdefault("accessibility", []).append({
                            "videoId": vid, "title": title, "creator_label": creator.lstrip("@")
                        })

            print(f"    ✓ Wrote {count} rows to {csv_path.name}", file=sys.stderr)

        except Exception as e:
            print(f"    ! Error with {creator}: {e}", file=sys.stderr)

    with open("rc_ship_videos_patch.json","w",encoding="utf-8") as f:
        json.dump(patch, f, indent=2, ensure_ascii=False)

    print("\nDone.")
    print("Created:")
    print("  - yt_exports/*.csv")
    print("  - rc_ship_videos_patch.json")

if __name__ == "__main__":
    main()
