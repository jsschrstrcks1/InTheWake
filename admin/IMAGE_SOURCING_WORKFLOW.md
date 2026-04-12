# Image Sourcing Workflow

**Purpose:** How to source real, freely-licensed, visually-verified images for
port / ship / venue pages when the existing files are placeholders or lack
proper attribution.

**Status:** Proven end-to-end on 2026-04-10/11 (college-fjord repair).
**Audience:** Any future session picking up image work.

> **Prerequisite — read first:** `admin/CAREFUL.md` §"Image Verification Protocol".
> Every image must be visually verified with the Read tool before it lands in the repo.

---

## The problem this solves

Many port directories contain:
- Blue-gradient placeholder rectangles with text labels (e.g. `college-fjord-1.webp`
  was just the text "College Fjord 1" on a gradient)
- Real photos with copy-paste placeholder attribution
  (e.g. `juneau/*-attr.json` all credited "Wikimedia Commons contributor / CC BY-SA")
- Photos of the wrong location with correct-sounding filenames
  (praia had Cascais and Boa Vista photos)
- Captions that claim specific subjects ("Harvard Glacier") when the file is
  a generic or completely different subject

The v2 validator's `gallery_credit_low_diversity` warning catches the first two;
the third is caught only by opening the file.

## Sandbox networking — what works and what doesn't

Tested 2026-04-10:

| Host | Reachable? | Purpose |
|------|:---:|---|
| `live.staticflickr.com` | ✓ | Flickr image CDN (new) |
| `farm1-9.staticflickr.com` | ✓ | Flickr image CDN (old) |
| `www.flickr.com` | ✓ (WebFetch) | Flickr photo pages |
| `www.loc.gov` | ✓ (JSON API via curl) | Library of Congress catalog + image CDN |
| `tile.loc.gov` | ✓ | LoC image storage — archival scans, downloadable |
| `images.unsplash.com` | ✓ | Unsplash CDN |
| `images.pexels.com` | ✓ | Pexels CDN |
| `www.nps.gov` | ✓ | National Park Service |
| `www.publicdomainpictures.net` | ✓ | Public domain |
| `cdn.stocksnap.io` | ✓ | StockSnap |
| `commons.wikimedia.org` | ✗ `hostname_blocked` | Wikimedia file pages — BLOCKED |
| `upload.wikimedia.org` | ✗ `hostname_blocked` | Wikimedia image CDN — BLOCKED |
| `archive.org/download/` | ✗ 403 | Internet Archive downloads — BLOCKED |
| `cdn.pixabay.com` | ✗ 403 | Pixabay CDN — BLOCKED |

**Consequence:** Wikimedia Commons is the largest single CC image library but
cannot be used for direct downloads. Library of Congress and Flickr are the
primary working sources.

## Proven sources — authoritative, high CC-hit rate

| Source | Typical license | Notes |
|---|---|---|
| **LoC Prints & Photographs — Harriman Alaska Expedition (1899)** | Public domain (pre-1924) | 357 Curtis photographs documented at `loc.gov/item/2005694050/`. Search: `https://www.loc.gov/photos/?q=Curtis+Alaska&dates=1899/1899&fo=json&c=30`. |
| **LoC generally** | Many "No known restrictions on publication" | Use the JSON API `?fo=json` appended to any item URL. |
| **Flickr user `umnak` (Joseph)** | CC BY-SA 2.0 | Confirmed 2026-04-10 via Flickr schema.org license field on photo 9031194312. |
| **Flickr `alaska_region` (USFS Alaska)** | CC BY 2.0 | Confirmed 2026-04-10 via schema.org license field on photo 11408103456. |
| **Flickr `noaaphotolib` (NOAA Photo Library)** | US federal work — public domain | Account confirmed active; individual photo IDs must be verified via search. |
| **Flickr `usgeologicalsurvey`** | US federal work — public domain | Same as above. |
| **Flickr `usfws_alaska`** | US federal work — public domain | Same as above. |

⚠ **Any Flickr URL returned by an LLM must be verified** — see the AI shootout
section at the bottom of this file. LLMs hallucinate Flickr IDs with high confidence.

## The six-step workflow

### 1. Identify the specific subject need

For each port / ship, list what images you need by subject — e.g.:
- college-fjord-hero: wide view of College Fjord itself
- gallery 1: Harvard Glacier face
- gallery 2: Yale Glacier
- …

You are NOT obligated to find exactly what the existing HTML caption claims.
If the only real photos available are of a related subject (e.g. Columbia
Glacier instead of Harvard Glacier — both Prince William Sound), rewrite
the caption honestly rather than mislabeling. See college-fjord's 1899
Curtis gallery for a working example.

### 2. Search — WebSearch with domain restriction

```
WebSearch(
  allowed_domains=["www.flickr.com", "commons.wikimedia.org"],
  query="\"Harvard Glacier\" \"College Fjord\" Alaska tidewater photo"
)
```

Or for LoC:
```
WebSearch(
  allowed_domains=["www.loc.gov", "tile.loc.gov"],
  query="\"Harriman Alaska Expedition\" 1899 glacier Prince William Sound"
)
```

Only trust URLs that appear in the search results. Do NOT guess URLs from
patterns.

**Alternative for LoC — the JSON search API via curl:**
```bash
curl -s -A "InTheWakePortPageRepair/1.0 (admin@cruisinginthewake.com)" \
  'https://www.loc.gov/photos/?q=Curtis+Harriman+Alaska+glacier&dates=1890/1900&fo=json&c=50' \
  | python3 -c "import sys, json; d=json.loads(sys.stdin.read()); [print(r['title'][:100], r['id']) for r in d.get('results', [])]"
```

### 3. Verify existence + license

For Flickr:
```
WebFetch(
  url="https://www.flickr.com/photos/USER/ID/",
  prompt="Find the Creative Commons license. Look in HTML for schema.org 'license' field or URLs containing 'creativecommons.org'. Return exactly one line: LICENSE: <identifier like 'CC BY 2.0' or 'All Rights Reserved'>"
)
```

Most Flickr photos default to "All Rights Reserved" unless explicitly CC.
Only CC BY, CC BY-SA, CC0, and Public Domain Mark are acceptable. CC BY-NC,
CC BY-ND, CC BY-NC-ND, and CC BY-NC-SA are **not acceptable** for this site.

For LoC items, use the JSON API to get rights + file URLs in one call:
```bash
curl -s -A "InTheWakePortPageRepair/1.0 (admin@cruisinginthewake.com)" \
  'https://www.loc.gov/item/ITEM_ID/?fo=json' \
  | python3 -c "import sys, json; d=json.loads(sys.stdin.read()); i=d['item']; print('title:', i.get('title','')); print('rights:', i.get('rights_information','') or i.get('rights_advisory','')); [print('  ', f.get('mimetype'), f.get('size'), f.get('url','')[:150]) for r in d.get('resources',[])[:1] for f in r.get('files',[[]])[0] if 'jpeg' in f.get('mimetype','')]"
```

### 4. Get the direct download URL

**Flickr:**
```
WebFetch(
  url="https://www.flickr.com/photos/USER/ID/sizes/l/",
  prompt="Extract the direct image URL for the Large size of this Flickr photo. Look for URLs starting with 'https://live.staticflickr.com/'. Return ONLY the direct URL."
)
```

**LoC:** the JSON response from step 3 already contains the file URLs. Pick
the viewable-size JPEG (usually the `v.jpg` suffix, typically 100–400KB).
Avoid the `u.tif` master (50MB+) and the `_150px.jpg` thumbnail.

### 5. Download + visually verify

```bash
curl -s -o /tmp/cf-src/FILENAME.jpg \
  -A "InTheWakePortPageRepair/1.0 (admin@cruisinginthewake.com)" \
  -w "HTTP=%{http_code} SIZE=%{size_download}\n" \
  "DIRECT_URL"
```

Then open it with Read:
```
Read(file_path="/tmp/cf-src/FILENAME.jpg")
```

The Read tool renders .jpg/.webp/.png inline. **Compare what you see against
the title/caption/license metadata.** If the scene doesn't match, throw the
file away and find a different source. Never commit a mislabeled image.

Archival scans (e.g. LoC Curtis photos) sometimes include visible color
calibration strips and mount borders. Crop those out — see step 6.

### 6. Convert + save + update metadata

```python
from PIL import Image
img = Image.open('/tmp/cf-src/source.jpg')
# Crop if needed to remove archival scan borders
w, h = img.size
img = img.crop((int(w*0.08), int(h*0.22), int(w*0.87), int(h*0.95)))
# Scale to reasonable web size
if img.width > 1600:
    img = img.resize((1600, int(img.height*1600/img.width)), Image.LANCZOS)
img.save('/home/user/InTheWake/ports/img/PORT/PORT-hero.webp', 'WEBP', quality=85, method=6)
```

Then write the attribution JSON at `ports/img/PORT/PORT-hero-attr.json`:
```json
{
  "source": "Library of Congress, Prints & Photographs Division",
  "sourceUrl": "https://www.loc.gov/item/2017645532/",
  "artist": "Edward S. Curtis (1868-1952), photographer",
  "license": "No known restrictions on publication (public domain — pre-1924 photograph)",
  "licenseUrl": "https://www.loc.gov/rr/print/res/107_curt.html",
  "title": "Exact title as shown on source page",
  "description": "2–3 sentences describing what the photo actually shows and how it relates to this port.",
  "alt": "Alt text for screen readers — describe what is visible in the image",
  "dateTaken": "1899",
  "reproductionNumber": "ppmsca.51505",
  "verifiedBySession": "YYYY-MM-DD image sourcing workflow; downloaded from tile.loc.gov, visually confirmed"
}
```

Then update the HTML `<img alt>`, `<figcaption>`, and credit link to match.
Each gallery slide should link to a **different** source URL so
`gallery_credit_low_diversity` stops firing.

## AI shootout results — do not trust LLM-returned URLs

Tested 2026-04-10 against the same structured-JSON image-sourcing prompt:

| AI | Behavior | Verdict |
|---|---|---|
| **gemini-2.5-flash** | Returned polished JSON with 1.0 confidence for every URL. Every single URL returned a 404 when tested against Flickr directly. | **Do not trust.** Gemini hallucinates plausible-looking Flickr and Wikimedia IDs with extreme confidence. |
| **gpt-4o** | Honest `{"error": "no verified image found"}` | Useful for refining captions/alt text, not for direct URLs. |
| **perplexity** | Honest refusal, occasionally surfaced real filenames it had seen in search snippets (e.g. `Chugach Mountains-College Inlet (9031194312).jpg`). | Useful as a source hint pass, must verify. |
| **youdotcom** | Honest refusal, sometimes returned structured candidate JSON with low confidence. | Useful as a backup research tool. |
| **grok** | Out of API credits (429) | N/A this session. |

**The only reliable URL-sourcing tool is WebSearch itself** — because it
returns URLs from a real search index rather than inventing them. Every
LLM-suggested URL must be verified via WebSearch or direct HEAD request
before being used.

## Notes on Wikimedia workaround

When `commons.wikimedia.org` returns a file name you want to use, you can
sometimes reach the original Flickr source that the Commons file was imported
from. The pattern `File:Name_(NUMERIC_ID).jpg` where NUMERIC_ID is 8–11
digits usually means the file was uploaded via Flickr2Commons with
NUMERIC_ID as the Flickr photo ID. Use Flickr's short URL redirect to find
the owner:

```bash
curl -sIL -A "InTheWakePortPageRepair/1.0 ..." "https://www.flickr.com/photo.gne?id=NUMERIC_ID" \
  2>&1 | grep -i "^location:"
```

The redirects resolve to `/photos/USER/NUMERIC_ID/` where you can then
verify the license directly on Flickr. This is how college-fjord's hero
image (`umnak/9031194312`) was sourced.

## When the photo you need simply doesn't exist in a CC form

You have three honest options:
1. **Use a related scene with an honest caption.** Example: use an 1899
   Curtis Columbia Glacier photo with the caption "Columbia Glacier, Prince
   William Sound — 1899 Harriman Alaska Expedition" on a College Fjord page.
   That's honest because the expedition that photographed Columbia is the
   same expedition that named College Fjord's glaciers.
2. **Reduce the gallery count.** The validator requires a minimum of 11
   `<img>` tags total on the page (including site chrome, hero, avatars,
   and noscript duplicates) — *not* 11 gallery slides. You can often drop
   to 3–4 gallery slides and still hit 11 total.
3. **Flag the port as needing human image sourcing** and move on. Leaving
   placeholders in production is worse than flagging the gap clearly in
   `admin/PORT_VALIDATION_STATUS.md`.

Never fabricate attribution. Never attach a real photo to a wrong caption.

**Soli Deo Gloria** — people before platform.
