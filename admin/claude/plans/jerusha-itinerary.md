# Jerusha — day-to-day itinerary (source for push + daily prompts)

**Status:** Captured, **partial** (Day 7 incomplete, Day 8 to come — "will send
the rest later"). This is the human source of truth that the push schedule
([`jerusha-pwa-push.md`](jerusha-pwa-push.md)) and the write-back daily prompts
([`jerusha-write-back.md`](jerusha-write-back.md)) will read.
**Last updated:** 2026-06-17

## Timezones (confirm before wiring push times)

Cruise sailing dates (from the page ITIN): **Day 1 = Mon Jun 29 → Day 8 = Mon Jul 6, 2026.**
Times below are as given (assumed **ship local time**). Ship time on RCL Alaska
sailings usually tracks the ports:
- Seattle (Day 1, Day 8): **PDT, UTC−7**
- Alaska ports (Days 3–5) and the run up: **AKDT, UTC−8**
- Victoria (Day 7): **PDT, UTC−7**
- Jerusha in **Lahore = PKT, UTC+5 (no DST)**.

So her clock runs **+12 h ahead of PDT** and **+13 h ahead of AKDT**. Example: a
6 am Alaska sunrise = **7 pm the same day in Lahore**; a 6:30 pm Alaska dinner =
**7:30 am next morning in Lahore**. ⚠️ **Confirm the ship's actual time policy**
(some sailings hold one time zone the whole week) before scheduling push — the
±1 h matters for landing notes in her morning.

---

## Itinerary (as provided)

### Day 1 — Mon Jun 29 · Seattle, embark (PDT)
- 11:00 am — get in line to board
- 11:30 am — onboard
- 1:00 pm — lunch at Chops
- 6:30 pm — dinner

### Day 2 — Tue Jun 30 · at sea (PDT→AKDT)
- 6:00 am — sunrise photos (if awake early enough)
- 8:00 am — breakfast
- 9:00 am — hot tub
- ~noon — lunch
- afternoon — pool
- 6:30 pm — dinner

### Day 3 — Wed Jul 1 · Sitka (AKDT)
- 6:00 am — breakfast + sunrise photos
- 10:00 am — ashore in Sitka
- 2:30 pm — Fortress of the Bear excursion (1 h 40 m → ~4:10 pm)
- souvenir shopping: hat · deck of cards · patch · shirt
- 4:30 pm — gangplank up (all aboard)
- 6:30 pm — dinner

### Day 4 — Thu Jul 2 · Skagway (AKDT)
- 6:00 am — breakfast + sunrise photos
- 7:30 am — gangplank down
- 8:15 am — White Pass railway (3 h 45 m → ~12:00 pm)
- lunch — try to find salmon
- 6:30 pm — dinner
- 7:30 pm — all aboard

### Day 5 — Fri Jul 3 · Endicott Arm/Dawes Glacier + Juneau (AKDT)
- 5:00 am — Endicott Arm & Dawes Glacier (scenic cruising)
- 6:30 am — breakfast
- hot tub till lunch
- 2:00 pm — whale-watching excursion
- salmon dinner (after)
- 7:30 pm — all aboard

### Day 6 — Sat Jul 4 · at sea
- 8:00 am — breakfast
- hot tub till lunch
- noon — lunch
- afternoon — pool

### Day 7 — Sun Jul 5 · Victoria, BC (PDT)
- 7:00 am — breakfast
- *(rest to come)*

### Day 8 — Mon Jul 6 · Seattle, disembark
- *(to come)*

---

## Draft push / daily-prompt seeds (editable — for the future build)

One gentle line per day, written to land in **her** morning/window (Lahore
time), referencing what's happening aboard. These are drafts for you to edit:

- **Day 1:** "Today's the day — I'm boarding in Seattle. Wish you were walking up the gangway with me."
- **Day 2:** "A whole day at sea. I'll be in the hot tub by 9 thinking of you."
- **Day 3:** "Sitka this morning, then the bears at the Fortress this afternoon. Picking you up a little something."
- **Day 4:** "Skagway — riding the White Pass railway up into the mountains at 8. The views are going to be unreal."
- **Day 5:** "Up at 5 for Dawes Glacier, then whales this afternoon. Two of my favorite things; you're the third I'm missing."
- **Day 6:** "Last sea day. Slow morning, pool later. Counting down to seeing you."
- **Day 7:** "Victoria — almost home. Harbor lights and gardens. Saving it all to tell you."
- **Day 8:** *(pending Day 8 details)*

And matching **write-back prompts** (seed her side of the thread), e.g. Day 3:
"What would you want to see first in Sitka?" · Day 4: "Train window seat or
caboose?" · Day 5: "Whales or the glacier?"

---

## To finish

1. Day 7 remainder + Day 8 (you'll send).
2. Confirm ship-time policy → lock the PKT conversions for push timing.
3. On build: derive a machine-readable version (date-keyed JSON) the Worker reads
   for both the push schedule and the daily prompts.
