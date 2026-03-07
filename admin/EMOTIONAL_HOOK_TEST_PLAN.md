# Emotional Hook Test — Page Restructuring Plan

**Version:** 1.0.0
**Created:** 2026-03-07
**Origin:** Curse of Knowledge analysis applied to ITW pages
**Status:** Draft — approved for one-page pilot (home page)

---

## The Test

The 30-Second Emotional Hook Test evaluates what a reader *feels* in their first 30 seconds on a page — not what's technically present. Five questions, timed:

| Second | Question | Dimension |
|--------|----------|-----------|
| 0–5 | Can I tell what this page is for? | **Clarity** |
| 5–10 | Does the first scroll feel calm or overwhelming? | **Calm** |
| 10–15 | Does this feel like it was made for someone like me? | **Seen** |
| 15–20 | Do I feel "I can do this" / "I'll be okay"? | **Confidence** |
| 20–30 | Does this person actually know / actually care? | **Trust** |

Grading: **Pass / Partial / Fail** per question.

---

## Baseline Scores (2026-03-07)

| Dimension | Juneau (Port) | Allure (Ship) | Home Page |
|-----------|:---:|:---:|:---:|
| Clarity | Pass | Partial | **Fail** |
| Calm | Pass | Partial | Partial |
| Seen | Pass | Partial | Partial |
| Confidence | Pass | Pass (late) | Partial |
| Trust | Pass | Pass | Pass |
| **Grade** | **A** | **B-** | **C+** |

**Key finding:** Trust is the strongest dimension site-wide. Clarity and calm are weakest — not because content is missing, but because the emotional content is consistently behind the engineering content in visual hierarchy.

---

## Home Page Restructuring (index.html)

### Problem
The reader's first question — "What is this site and why should I care?" — is answered third. The motto and welcome section are behind a duck card and a first-timer callout.

### Current visual hierarchy:
1. Duck card (gold border, "Found a Duck?")
2. First-timer callout ("New to Cruising?")
3. Welcome + motto ("The calmest seas are found in another's wake")
4. Intent selector ("What are you planning?")
5. 10-tool dark grid
6. 6-card explore grid
7. Audience doorways (Solo / Accessibility)
8. FAQ
9. Works Offline callout

### Proposed hierarchy:
1. **Welcome + motto** — THE emotional hook. First thing every visitor sees.
2. **Intent selector** — "What are you planning?" Self-routing for all visitors.
3. **Featured logbook excerpt** — NEW. 3-4 sentences from a real story (Margaret, Juneau, etc.) that establish emotional tone.
4. **First-timer callout** — Moved down; still prominent but not position #1.
5. **Audience doorways** (Solo / Accessibility) — Promoted from position 7.
6. **Explore grid** (6 cards) — Content directory for return visitors.
7. **Planning tools** — Collapsed or reduced. The intent selector already routes to tools contextually. Consider showing top 4 instead of all 10.
8. **FAQ**
9. **Works Offline callout**
10. **Duck card** — Moved to footer area or community section. Charming, but not the first impression for new visitors.

### New section: Featured Logbook Excerpt
A single card containing 3-4 sentences pulled from an existing logbook story. Purpose: show what ITW *feels like* before listing what it contains. Rotate periodically.

Example pull from the grief article:
> *On her bed sat a towel animal: A penguin. Tom loved penguins. It was so ridiculous and earnest that she laughed out loud — an involuntary, startled laugh. That laugh didn't erase grief. But it cracked open the smallest window of light.*

### New section: Reader voice / testimonial
A single sentence from a real reader. Purpose: social proof that feels personal, not statistical.

### What moves:
- Duck card → near footer or community section
- First-timer callout → below intent selector
- 10-tool grid → reduced to top 4-5 tools, or collapsed behind "See all tools"

### What's NOT changing:
- Right rail (Site Highlights, Search, Author card, Recent Stories, Authors) — these are fine
- Footer — unchanged
- Navigation — unchanged
- All existing content preserved — this is resequencing, not removal

---

## Ship Page Restructuring (allure-of-the-seas.html as template)

### Problem
The reader's first question — "What's she like? Is she right for me?" — is answered by the logbook story, which is below the photo carousel, stats grid, sister ship pills, class explorer pills, AND the dining card.

### Current section order:
1. H1 + fact block (tonnage, year, capacity)
2. Answer-line + content-text paragraph
3. Photo carousel + stats grid
4. Sister ship pills + class explorer pills
5. Dining card (JSON-loaded)
6. **Logbook story** ← emotional payoff is here
7. Videos
8. Deck plans + Live tracker
9. FAQ

### Proposed section order:
1. H1 — Rewrite from "Deck Plans, Live Tracker, Dining & Videos" to personality-first
2. **NEW: "Who She's For"** — 3-sentence personality assessment above everything else
3. Photo carousel + stats grid (unchanged)
4. **Logbook story** — MOVED UP from position 6 to position 4
5. **NEW: "What She Feels Like"** — Sensory paragraph (what it's like to walk aboard)
6. Sister ship pills + **NEW: "How She Compares"** quick reference
7. Dining card
8. Videos
9. Deck plans + Live tracker
10. FAQ

### New section: "Who She's For" (per ship)
3-sentence personality lead. Example for Allure:
> **Who She's For**: Families and groups who want everything in one floating city — seven neighborhoods, Broadway shows, a Central Park with real trees. If you want intimate, she's not it. If you want "I'll never run out of things to do," she's perfect.

### New section: "What She Feels Like" (per ship)
Sensory paragraph describing the physical experience of being aboard. Not specs — feelings.

### New section: "How She Compares" (per ship)
Brief 3-4 line comparison with closest alternatives. Answers: "Why this ship instead of that one?"

### Implementation note:
These new sections require per-ship content that can't be auto-generated. They need to be written for each ship individually or pulled from logbook stories. Start with ships that have existing logbook entries.

---

## Port Page — Juneau (minimal changes)

### Current grade: A
Juneau is the emotional standard. Minimal changes needed.

### Additions to consider:
1. **"First Time in Alaska?" orientation box** — 3 sentences at the top for readers who don't know what Juneau is.
2. **"Accessibility at This Port" subsection** — Dedicated section covering pier accessibility, shuttle accessibility, whale watching boat accessibility, tramway accessibility. Currently mentioned once in a Mendenhall paragraph.
3. **Expanded logbook entry** — The Author's Note in the sidebar is brief. A full first-person narrative on the main column (like the grief article does) would push Trust from strong to extraordinary.

### Implementation note:
These are content additions that require author input. Flag for Ken Baker review.

---

## Applying the Test to Other Pages

Once validated on these three pages, the Emotional Hook Test becomes a permanent quality gate:

### Per page type, the feeling target:
| Page Type | Reader's First Question | Feeling Target |
|-----------|------------------------|----------------|
| Ship | "What's she like? Is she right for me?" | "I understand her personality in 60 seconds" |
| Port | "What should I do? Will I be okay?" | "I feel prepared stepping off the ship" |
| Restaurant | "What will I eat? Is it worth paying?" | "I can see what I'll eat and decide fast" |
| Disability | "Does anyone think about me?" | "Someone thought about me" |
| Solo/Grief | "Am I alone in this?" | "I'm not alone" |
| Tool | "Will this help or confuse me?" | "This makes something confusing feel manageable" |
| Home | "What is this? Why should I care?" | "I know what this is and I trust it — in 5 seconds" |

---

## Implementation Order

1. **Home page resequencing** — highest impact, no new content needed (just reorder)
2. **Ship page template** — "Who She's For" + logbook promotion on Allure (template for other ships)
3. **Port accessibility subsections** — starting with Juneau, then top-10 ports
4. **Formalize the test** — Create a skill/hook that prompts the 5 questions before content commits

---

## Success Criteria

After implementation, re-run the 30-Second Emotional Hook Test:
- Home page: Clarity should move from Fail to Pass
- Ship page: Clarity and Calm should move from Partial to Pass
- All three pages should score B+ or higher

---

**Soli Deo Gloria** — The feeling is the product. The architecture is the mechanism.
