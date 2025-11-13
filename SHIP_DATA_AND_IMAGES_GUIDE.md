# Ship Pages - Data Files & Images Guide

## Overview
All Royal Caribbean ship pages have been restored to v3.010.300 standard with proper SEO, navigation, and structure. Each page dynamically loads data from JSON files and displays images. This document lists all the expected file locations.

---

## 📋 JSON Data Files

### 1. **Ship Stats** (per ship)
Each ship page looks for its stats JSON in these locations (fallback order):

```
/assets/data/ships/{ship-slug}.json
/ships/rcl/assets/{ship-slug}.json
```

**Format:**
```json
{
  "slug": "radiance-of-the-seas",
  "name": "Radiance of the Seas",
  "class": "Radiance Class",
  "entered_service": 2001,
  "gt": "90,090 GT",
  "guests": "2,466 (double) ~2,700 (max)",
  "crew": "860",
  "length": "962 ft (293 m)",
  "beam": "106 ft (32 m)",
  "registry": "Bahamas"
}
```

**All ships requiring stats files:**
- adventure-of-the-seas.json
- allure-of-the-seas.json
- anthem-of-the-seas.json
- brilliance-of-the-seas.json
- enchantment-of-the-seas.json
- explorer-of-the-seas.json
- freedom-of-the-seas.json
- grandeur-of-the-seas.json
- harmony-of-the-seas.json
- icon-class-ship-tbn-2027.json
- icon-class-ship-tbn-2028.json
- icon-of-the-seas.json
- independence-of-the-seas.json
- jewel-of-the-seas.json
- legend-of-the-seas.json
- legend-of-the-seas-1995-built.json
- legend-of-the-seas-icon-class-entering-service-in-2026.json
- liberty-of-the-seas.json
- majesty-of-the-seas.json
- mariner-of-the-seas.json
- monarch-of-the-seas.json
- navigator-of-the-seas.json
- nordic-empress.json
- oasis-of-the-seas.json
- odyssey-of-the-seas.json
- ovation-of-the-seas.json
- quantum-of-the-seas.json
- quantum-ultra-class-ship-tbn-2028.json
- quantum-ultra-class-ship-tbn-2029.json
- radiance-of-the-seas.json
- rhapsody-of-the-seas.json
- serenade-of-the-seas.json
- song-of-norway.json
- sovereign-of-the-seas.json
- spectrum-of-the-seas.json
- splendour-of-the-seas.json
- star-class-ship-tbn-2028.json
- star-of-the-seas.json
- star-of-the-seas-aug-2025-debut.json
- symphony-of-the-seas.json
- utopia-of-the-seas.json
- vision-of-the-seas.json
- voyager-of-the-seas.json
- wonder-of-the-seas.json

---

### 2. **Dining Venues** (centralized)
**Location:** `/assets/data/venues.json`

All ship pages reference this single venues file. The file should contain:

```json
{
  "meta": {
    "version": "1.0",
    "updated": "2025-01-13"
  },
  "venues": [
    {
      "slug": "main-dining-room",
      "name": "Main Dining Room",
      "category": "mdr",
      "description": "Classic multi-course dining",
      "price": "Included"
    },
    {
      "slug": "chops-grille",
      "name": "Chops Grille",
      "category": "specialty",
      "description": "Premium steakhouse",
      "price": "$59.99 pp"
    }
  ],
  "ships": {
    "radiance-of-the-seas": {
      "venues": ["main-dining-room", "chops-grille", "windjammer-cafe"]
    },
    "adventure-of-the-seas": {
      "venues": ["main-dining-room", "chops-grille", "windjammer-cafe"]
    }
  }
}
```

**Categories:**
- `mdr` - Main Dining Room
- `specialty` - Specialty Dining
- `casual` - Casual Dining
- `bar` - Bars & Lounges

---

### 3. **Video Data** (per ship)
Each ship page looks for video data in these locations (fallback order):

```
/assets/data/videos/{ship-slug}.json
/ships/rcl/assets/{ship-slug}-videos.json
```

**Format:**
```json
{
  "videos": [
    {
      "videoId": "dQw4w9WgXcQ",
      "provider": "youtube",
      "title": "Radiance of the Seas Full Ship Tour"
    },
    {
      "videoId": "987654321",
      "provider": "vimeo",
      "title": "Accessible Stateroom Walkthrough"
    }
  ]
}
```

**Supported providers:**
- `youtube` - Uses youtube-nocookie.com
- `vimeo` - Uses player.vimeo.com

---

### 4. **Logbook Stories** (per ship)
Each ship page looks for logbook/stories in these locations (fallback order):

```
/ships/rcl/assets/{ship-slug}.json
/assets/data/logbook/rcl/{ship-slug}.json
/assets/data/ships/rcl/{ship-slug}.json
```

**Format:**
```json
{
  "perspectives": [
    {
      "title": "Solo Traveler's Experience",
      "markdown": "My week aboard **Radiance** was spectacular...\n\nThe ship felt intimate despite having 2,000+ guests."
    },
    {
      "title": "Family Vacation Highlights",
      "markdown": "Our kids (ages 8 & 12) *loved* the Adventure Ocean program..."
    }
  ]
}
```

**Markdown support:**
- `**bold**` → **bold**
- `*italic*` → *italic*
- Double newlines → new paragraph
- `## Heading` → H3

---

## 🖼️ Images

### 1. **Ship Photos** ("First Look" Carousel)
Each ship page displays 3 carousel images. Lookup paths (in order of fallback):

**Primary paths:**
```
/assets/ships/{ship-slug}1.jpeg
/assets/ships/{ship-slug}2.jpg
/assets/ships/{ship-slug}3.jpg
```

**Fallback paths:**
```
/assets/ships/rcl/{ship-slug}/{ship-slug}1.jpeg
/assets/ships/rcl/{ship-slug}/{ship-slug}2.jpg
/assets/ships/rcl/{ship-slug}/{ship-slug}3.jpg
```

**Example for Radiance of the Seas:**
- `/assets/ships/radiance-of-the-seas1.jpeg` ← Main photo
- `/assets/ships/radiance-of-the-seas2.jpg` ← Secondary photo
- `/assets/ships/radiance-of-the-seas3.jpg` ← Tertiary photo

**All ships require 3 photos each (132 images total)**

---

### 2. **Dining Hero Images** (per ship)
Each ship page displays a dining photo. Lookup paths (in order of fallback):

```
/assets/ships/rcl/{ship-slug}/dining-hero.jpg
/assets/ships/{ship-slug}-dining.jpg
/assets/img/Cordelia_Empress_Food_Court.jpg  ← global fallback
```

**Example:**
- `/assets/ships/rcl/radiance-of-the-seas/dining-hero.jpg`

---

### 3. **Deck Plan Preview**
Currently uses a global placeholder:
```
/assets/ship-map.png
```

This is the same for all ships (can be customized per-ship if needed).

---

### 4. **Global Assets**
Required on all ship pages:
- `/assets/logo_wake.png` - Site logo (already exists)
- `/assets/compass_rose.svg` - Decorative hero element (already exists)
- `/assets/watermark.png` - Background watermark (already exists)

---

## 🔍 Live Ship Tracker

Each ship page has an IMO number specified via `data-imo` attribute. The system uses this to display a live VesselFinder map:

**Example:**
```html
<section data-imo="9195195" data-name="RADIANCE-OF-THE-SEAS">
```

The IMO number automatically loads the ship's current position from VesselFinder.

**Ships with known IMO numbers:**
- adventure-of-the-seas: 9167227
- allure-of-the-seas: 9383936
- anthem-of-the-seas: 9656101
- brilliance-of-the-seas: 9195343
- radiance-of-the-seas: 9195195
- ... (see ship data JSON files for complete list)

**Future ships:** Use `TBD` for ships not yet launched

---

## 📦 File Structure Summary

```
/assets/
  data/
    venues.json                     ← Centralized dining data
    ships/
      {ship-slug}.json              ← Ship stats (optional location)
    videos/
      {ship-slug}.json              ← Video data (optional location)
    logbook/
      rcl/
        {ship-slug}.json            ← Logbook stories (optional location)
  ships/
    {ship-slug}1.jpeg               ← Primary ship photo
    {ship-slug}2.jpg                ← Secondary ship photo
    {ship-slug}3.jpg                ← Tertiary ship photo
    {ship-slug}-dining.jpg          ← Dining hero (fallback)
    rcl/
      {ship-slug}/
        dining-hero.jpg             ← Dining hero (primary)
        {ship-slug}1.jpeg           ← Ship photo (fallback)
        {ship-slug}2.jpg            ← Ship photo (fallback)
        {ship-slug}3.jpg            ← Ship photo (fallback)
  ship-map.png                      ← Deck plan placeholder
  logo_wake.png                     ← Site logo
  compass_rose.svg                  ← Hero decoration
  watermark.png                     ← Background watermark

/ships/rcl/assets/
  {ship-slug}.json                  ← Ship stats (fallback)
  {ship-slug}-videos.json           ← Videos (fallback)
```

---

## ✅ Quick Start Checklist

To fully populate a ship page (using Radiance of the Seas as example):

1. **Ship Photos** (required):
   - [ ] `/assets/ships/radiance-of-the-seas1.jpeg`
   - [ ] `/assets/ships/radiance-of-the-seas2.jpg`
   - [ ] `/assets/ships/radiance-of-the-seas3.jpg`

2. **Ship Stats JSON** (optional, has fallback):
   - [ ] `/assets/data/ships/radiance-of-the-seas.json`

3. **Dining Venues** (global, one file for all ships):
   - [ ] `/assets/data/venues.json` with `radiance-of-the-seas` entry

4. **Videos JSON** (optional):
   - [ ] `/assets/data/videos/radiance-of-the-seas.json`

5. **Logbook Stories** (optional):
   - [ ] `/assets/data/logbook/rcl/radiance-of-the-seas.json`

6. **Dining Hero Image** (optional, has fallback):
   - [ ] `/assets/ships/rcl/radiance-of-the-seas/dining-hero.jpg`

---

## 🚀 Priority Order

**Minimum viable ship page:**
1. 3 ship photos (carousel)
2. IMO number (for live tracker)
3. Fallback stats JSON (already embedded in HTML)

**Enhanced ship page:**
4. Real stats JSON file
5. Dining venues entry in global venues.json
6. Dining hero image

**Fully featured ship page:**
7. Video data JSON
8. Logbook stories JSON
9. Custom deck plans (future)

---

## 📝 Notes

- **All paths use absolute URLs** - The pages have built-in origin normalization
- **Graceful degradation** - Missing images/data fallback to placeholders
- **Lazy loading** - Images use `loading="lazy"` for performance
- **Version cache busting** - CSS/JS use `?v=3.010.300`
- **Accessibility** - All images have proper alt text and ARIA labels
- **SEO optimized** - Each page has unique meta tags, JSON-LD, and OpenGraph

---

## 🔧 Need Help?

All 44 ship pages now have:
- ✅ v3.010.300 production shell
- ✅ Dropdown navigation (300ms hover delay)
- ✅ Enhanced SEO with JSON-LD schemas
- ✅ WCAG 2.1 AA accessibility
- ✅ Dynamic data loading
- ✅ Swiper.js carousels with CDN fallback
- ✅ Live ship tracker integration
- ✅ E-E-A-T person schema

The pages are production-ready and will gracefully handle missing data files until you populate them!
