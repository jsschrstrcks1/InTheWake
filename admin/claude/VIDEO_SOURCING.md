# Video Sourcing Guide for Ship Pages

**Version:** 1.0.0
**Last Updated:** 2025-12-28
**Purpose:** Instructions for finding and adding real YouTube video IDs for ship pages

---

## Overview

Ship pages require real, curated YouTube videos for the video carousel. This guide documents how to find videos from the repository's master manifests rather than web searching.

---

## Primary Video Source: rc_ship_videos.json

**Location:** `/ships/rcl/rc_ship_videos.json` (also at `/ships/rc_ship_videos.json`)

This is the **master manifest** containing curated video IDs from trusted YouTube channels like HarrTravel, CruiseTipsTV, and others.

### How to Find Videos for a Ship

1. **Search by ship name:**
   ```bash
   grep -A2 "Ship Name" ships/rcl/rc_ship_videos.json
   ```

   Example for Quantum of the Seas:
   ```bash
   grep -A2 "Quantum of the Seas" ships/rcl/rc_ship_videos.json
   ```

2. **Extract video IDs from URLs:**
   - URLs are in format: `https://www.youtube.com/watch?v=VIDEO_ID`
   - The VIDEO_ID is exactly 11 characters after `v=`
   - Example: `https://www.youtube.com/watch?v=B-qTi0A1NlY` → `B-qTi0A1NlY`

3. **Categorize videos by title keywords:**
   - "Ship Tour" / "Walkthrough" → `ship walk through`
   - "Suite" / "Loft" / "Grand Suite" / "Junior Suite" → `suite`
   - "Balcony" / "Connecting Balcony" → `balcony`
   - "Oceanview" / "Ocean View" → `oceanview`
   - "Interior" / "Virtual Balcony" (interior) → `interior`
   - "Dining" / "Food" / "Buffet" / "Restaurant" → `food`
   - "Accessible" / "ADA" / "Wheelchair" → `accessible`
   - "Top 10" / "Best" / "Review" → `top ten`

---

## Secondary Video Sources

### Detailed Ship Video Manifests
**Location:** `/ships/rcl/assets/videos/`

Some ships have detailed video manifests with full metadata:
- `radiance.json` - Radiance of the Seas
- `adventure-of-the-seas.json` - Adventure of the Seas
- `allure-of-the-seas.json` - Allure of the Seas

These files contain `video_id` fields with real YouTube IDs and are organized by category.

### Ship-Specific Video Files
**Location:** `/ships/rcl/assets/{ship-name}-videos.json`

Example files:
- `anthem-of-the-seas-videos.json`
- `spectrum-of-the-seas-videos.json`
- `odyssey-of-the-seas-videos.json`

**Note:** Some of these may contain corrupted/placeholder IDs. Always verify video IDs are:
- Exactly 11 characters
- Alphanumeric plus `-` and `_` only
- NOT known fake IDs (see validator)

---

## Video JSON Format

**Location for output:** `/assets/data/videos/rcl/{ship-slug}.json`

```json
{
  "ship": "Ship Name",
  "ship_class": "Class Name",
  "cruise_line": "Royal Caribbean",
  "last_updated": "YYYY-MM-DD",
  "videos": {
    "ship walk through": [
      {
        "videoId": "xxxxxxxxxxx",
        "provider": "youtube",
        "title": "Video Title",
        "description": "Brief description"
      }
    ],
    "top ten": [...],
    "suite": [...],
    "balcony": [...],
    "oceanview": [...],
    "interior": [...],
    "food": [...],
    "accessible": [...]
  }
}
```

---

## Required Categories (from validator)

The ship page validator requires videos in these categories:
1. `ship walk through` - Ship tours, walkthroughs, deck-by-deck
2. `top ten` - Top 10 lists, best features, reviews
3. `suite` - Suite cabin tours (Royal Loft, Grand Loft, Sky Loft, Owner's, Junior)
4. `balcony` - Balcony stateroom tours
5. `oceanview` - Ocean view cabin tours
6. `interior` - Interior cabin tours (including Virtual Balcony)
7. `food` - Dining, restaurants, buffet tours
8. `accessible` - ADA/accessibility stateroom tours

**Minimum:** 10 total videos
**Blocking if missing:** More than 2 categories missing is a blocking error

---

## Validation

The validator at `/admin/validate-ship-page.js` checks:
- Video IDs are exactly 11 characters
- Video IDs match pattern `^[a-zA-Z0-9_-]{11}$`
- Video IDs are not in the blocked list (fake/placeholder IDs)

**Blocked IDs include:**
- Common placeholders: `abc123`, `def456`, etc.
- Rick Astley: `dQw4w9WgXcQ`

Run validator:
```bash
node admin/validate-ship-page.js ships/rcl/{ship-slug}.html
```

---

## Workflow Example

### Adding Videos for Quantum of the Seas

1. **Search master manifest:**
   ```bash
   grep -A2 "Quantum of the Seas" ships/rcl/rc_ship_videos.json
   ```

2. **Extract results:**
   ```
   "title": "Quantum of the Seas | Balcony Stateroom Full Tour",
   "url": "https://www.youtube.com/watch?v=B-qTi0A1NlY",
   "creator": "HarrTravel"
   ```

3. **Extract video ID:** `B-qTi0A1NlY`

4. **Categorize:** Title contains "Balcony Stateroom" → category: `balcony`

5. **Add to JSON:** `/assets/data/videos/rcl/quantum-of-the-seas.json`

6. **Validate:**
   ```bash
   node admin/validate-ship-page.js ships/rcl/quantum-of-the-seas.html
   ```

---

## Trusted YouTube Channels

From the manifest's `trusted_channels`:

**Green (High Priority):**
- CruiseTipsTV
- HarrTravel
- LifeWellCruised
- RoyalCaribbeanBlog
- TipsForTravellers
- TheWeekendCruiser
- PopularCruising
- CruisingWithWheels (accessibility focus)

**Amber (Medium Priority):**
- EmmaCruises
- LaLidoLoca
- OrdinaryAdventures

---

## Common Issues

### Corrupted Manifests
Some ship-specific video files contain placeholder IDs like `dQw4w9WgXcQ` (Rick Astley). Always verify IDs against the master `rc_ship_videos.json`.

### Videos in Wrong Ship Files
The manifest may have videos indexed under the wrong ship. Search by ship name across all manifest files to find all relevant videos.

### Missing Categories
If a category has no videos in the manifest, check:
1. Other trusted channels
2. The detailed manifests in `/ships/rcl/assets/videos/`
3. Web search as last resort (verify IDs manually)

---

## Quick Reference Commands

```bash
# Find all videos for a ship
grep -A2 "Ship Name" ships/rcl/rc_ship_videos.json

# Count videos for a ship
grep "Ship Name" ships/rcl/rc_ship_videos.json | wc -l

# Find accessible videos
grep -i "accessible\|wheelchair\|ada" ships/rcl/rc_ship_videos.json

# Validate a ship page
node admin/validate-ship-page.js ships/rcl/ship-slug.html

# List all video JSON files
ls -la assets/data/videos/rcl/
```

---

**Soli Deo Gloria** 🙏
