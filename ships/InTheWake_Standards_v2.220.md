# In the Wake — Standards (v2.220, 2025-09-13)

This version formalizes:
- Single source of truth JSONs (`/assets/data/fleet_index.json` and `/assets/data/rc_ship_videos.json` + `/assets/data/video_sources.json`).
- Absolute paths for all assets/data and required watermark.
- Page coverage requirements (a page for every cruise line and every ship listed).
- Deterministic card order and audit rules.

## 1) Absolute paths & watermark (REQUIRED)
- All `src` and `href` use absolute paths from web root (e.g., `/ships/assets/images/...`, `/assets/css/...`, `/assets/data/...`).
- Watermark: `/assets/images/watermark.png` must render behind content on every ship page using a `.page-watermark` layer.

## 2) Source of truth JSONs
- `/assets/data/fleet_index.json` — authoritative roster of cruise lines and ships we must render. Menus and required-page checks read ONLY this file.
- `/assets/data/rc_ship_videos.json` — ship → categories → arrays of videos (no link limit; preserve all).
- `/assets/data/video_sources.json` — creators/channels metadata.

## 3) Required pages
- For every `cruise_lines[].slug` in `fleet_index.json`, a page exists at `/cruise-lines/{slug}.html`.
- For every ship slug, a page exists at `/ships/{slug}.html`. If retired, include the page and label **Historical Ship** prominently.

## 4) Required card order (inside <main>)
1. A First Look (3 images)
2. Why book {Ship}?
3. Ken’s Logbook — A Personal Review (placeholder allowed)
4. Watch: {Ship} Highlights (single swiper, videos sourced from rc_ship_videos.json)
5. Two-up row: Ship Layout (Deck Plans) on left + Where Is {Ship} Right Now? on right
6. Attribution & Credits
7. Copyright bar

## 5) Video rules
- At least one Accessibility video per ship; JSON may include many, page displays a curated subset.
- Cabin coverage aims for every stateroom class; JSON may contain multiple per class.

## 6) Audit checklist
- Absolute-path check for images/data/JS/CSS.
- Watermark exists and uses `/assets/images/watermark.png`.
- DOM order matches §4.
- Video swiper is present and populated if JSON has entries.
- First Look images render (no broken/relative paths).
- Attribution list includes any Wikimedia images used.
