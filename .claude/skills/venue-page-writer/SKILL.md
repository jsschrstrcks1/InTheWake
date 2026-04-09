---
name: venue-page-writer
description: "Researches and writes authentic logbook entries for cruise venue pages. Handles review research, negative flips, fact verification, voice consistency, and authenticity checks across 5 cruise lines (RCL, NCL, Virgin, MSC, Carnival). Fires when editing restaurant/venue pages or writing logbook content."
version: 1.0.0
---

# Venue Page Writer

> Every venue page helps someone decide where to eat, drink, or play tonight.

## Purpose

Researches real guest experiences and writes authentic, fact-verified logbook entries
for cruise venue pages. Replaces generic "Guest Experience Summary" stubs with
specific, ship-dated, sensory-rich content that passes both Google quality signals
and a human gut-check.

## When to Fire

- Editing any file in `restaurants/**/*.html`
- Writing or upgrading logbook sections
- Keywords: venue, logbook, restaurant review, dining review, venue upgrade
- On `/venue` or `/logbook` command

## The Process (Per Venue)

### Step 1: Research

Use web search to find real guest reviews. Target sources:
- Cruise Critic forums and reviews
- Cruise line official sites and press releases
- Cruise blogs (royalcaribbeanblog.com, shinecruise.com, cruisehive.com)
- Points Guy / travel review sites

Extract from reviews:
- **Top 3 praised items** (specific dishes, atmosphere details, service moments)
- **Top 2-3 complaints** (with frequency — is this one person or a pattern?)
- **Sensory details** (what does it look, sound, smell, taste like?)
- **Specific facts** (deck location, capacity, hours, reservation policy)

### Step 2: Consult (When Needed)

Use `/consult gemini structure` for venue-specific details when web search
is insufficient. **Never trust GPT for pricing** (84% vs 64% accuracy —
see `admin/VENUE_RESEARCH_REPORT_2026_03_27.md`).

Cross-reference any AI claim with web search before using it.

### Step 3: Write the Logbook

**Structure:**
```html
<h3>{Venue} Review: {Unique Evocative Descriptor}</h3>
<p class="tiny muted">{Ship Name} · {Month Year} · {Context}</p>
```

**Voice by cruise line:**

| Line | Core Voice | Example Phrasing |
|------|-----------|------------------|
| RCL | Warm family adventure | "we discovered...", "what surprised us..." |
| NCL | Freestyle independence | "we chose...", "the freedom to..." |
| Virgin | Edgy youthful discovery | "we didn't expect...", "the vibe hit..." |
| MSC | Elegant international | "the Mediterranean influence...", "a quiet sophistication..." |
| Carnival | Fun unpretentious joy | "honestly, for free...", "the kind of place where..." |

**Required elements:**
- Named ship + month/year (verify ship has this venue)
- One sensory detail unique to THIS venue
- One specific menu item / show / feature by name
- One honest limitation, flipped gracefully (see Negative Flip Playbook)
- 3-5 Pro Tips (at least 1 requires ship layout knowledge)
- Rating X.X/5 with specific summary (never generic "impressive venue")

**Uniqueness rules (pattern recognition defense):**
- Every review title must be structurally different (vary: question, metaphor, direct, emotional)
- Vary paragraph openings across venues (never start 3 in a row with "The...")
- Vary the position of the honest limitation (sometimes paragraph 1, sometimes paragraph 2)
- Use different sensory channels across venues (sight for one, sound for another, taste for a third)
- Name different crew roles where relevant (sommelier, chef, bartender, host)
- Reference different times of day / meal contexts
- Each venue's Pro Tips should have a different lead tip pattern

### Step 4: Verify

**Fact checklist:**
- [ ] Ship name exists and has this venue (cross-ref venue JSON + fleet data)
- [ ] Menu items mentioned are real (web search or menu data)
- [ ] Price matches `admin/venue-research-verified-prices.json`
- [ ] Deck/location is accurate for named ship
- [ ] Hours and reservation policy are current
- [ ] Alternative venues suggested exist on the same ship
- [ ] No sensory claims contradict known layout (e.g., "ocean views" in interior venue)

**Authenticity stress test:**
- [ ] No "Whether you're..." or "From... to..." sentence openers
- [ ] No "nestled", "curated", "elevate your experience", "a testament to"
- [ ] No "truly", "simply", "undeniably", "remarkably" — empty intensifiers
- [ ] Sensory details are specific ("char on the ribeye") not generic ("delicious flavors")
- [ ] At least one honest limitation mentioned (using flip pattern or transparency threshold)
- [ ] Pro Tips include at least one that requires ship layout knowledge
- [ ] Review title is specific to THIS venue, not swappable with another
- [ ] Could a human pattern-match this against 10 other logbooks and find it unique?
- [ ] Named ship actually carries this venue (verify against fleet data)

**Cultural sensitivity check** *(adopted from Grok, HIGH confidence)*:
For MSC, international venues, and cuisine from non-Western traditions:
- [ ] No Western-centric food assumptions ("exotic" is not a descriptor)
- [ ] Cuisine descriptions respect the tradition (don't call teppanyaki "hibachi show")
- [ ] Crew/staff descriptions avoid stereotyping by nationality
- [ ] Price comparisons don't assume USD as baseline for non-US-based lines

**Attribution honesty:**
The logbook attribution line currently reads "composite account from multiple guest
experiences." This is honest — the content synthesizes real review data, verified
facts, and the site author's knowledge. It must NOT claim to be a single person's
first-person experience if it isn't. The pastoral mission demands this transparency.

### Step 5: Update Metadata

After writing the logbook, also update:
- `last-reviewed` meta tag to today's date
- `dateModified` in JSON-LD to match
- FAQPage schema if FAQ answers were expanded
- Review schema `ratingValue` to match new rating

### Step 6: Post-Launch Monitoring (Ongoing)

*(Adopted from orchestra debate — Grok + Gemini, unanimous)*

- Quarterly spot-check 10% of upgraded pages for factual drift
- Prioritize high-risk venues (specialty dining with changing menus/prices)
- Use `content-freshness` skill for staleness detection
- Ad-hoc reviews triggered by: price changes on cruise line sites, user reports,
  or seasonal menu rotations

## Negative Flip Playbook

| Complaint Pattern | Flip Strategy |
|-------------------|---------------|
| Crowded / long wait | Name the popularity; give specific timing workaround |
| Not worth the price | Name the price honestly; point to standout dish; offer budget alternative |
| Slow service | Reframe as "deliberate pacing"; add what to do while waiting |
| Noisy / kids | Call it "energy"; suggest quieter alternative venue |
| Limited menu | Reframe as "focused"; name the best item; point to variety alternative |
| Not as good as land version | Acknowledge gap; add unique at-sea advantage; name the dish that delivers |
| Dated decor | Call it "classic"; find warmth in history; name one specific visual |

**Transparency threshold** *(adopted from Grok challenge)*:
Some flaws cannot and should not be flipped. If a complaint involves:
- Safety concerns (food allergy handling, accessibility failures)
- Consistent quality failures (>50% of reviews mention the same problem)
- Price that genuinely isn't worth it for the experience

State it directly: "Fair warning — [specific issue]. If that matters to you,
[alternative venue] might be a better fit." The pastoral mission demands honesty
over spin. Anxious travelers trust us BECAUSE we tell them what to watch out for.

**Full playbook with examples:** `admin/claude/LOGBOOK_WRITING_GUIDE.md`

## Data Sources

| File | Purpose |
|------|---------|
| `admin/venue-research-verified-prices.json` | Web-verified prices (287 venues) |
| `assets/data/venues-v2.json` | RCL venue metadata (325 venues) |
| `assets/data/ncl-venues.json` | NCL venue metadata (78 venues) |
| `assets/data/carnival-venues.json` | Carnival venue metadata (23 venues) |
| `assets/data/msc-venues.json` | MSC venue metadata (45 venues) |
| `assets/data/virgin-venues.json` | Virgin venue metadata (46 venues) |
| `new-standards/foundation/VENUE_PAGE_STANDARDS_v3.010.md` | Full venue page standard |
| `.claude/plan-venue-normalization.md` | Normalization plan + anti-model analysis |
| `admin/VENUE_RESEARCH_REPORT_2026_03_27.md` | Model accuracy report |

## Quality Standard

**Tiered Gold Standard** *(updated from two-sample orchestra analysis)*

Our upgraded pages outperform the original Gen2 gold standard on every metric.
New tiered targets by venue complexity:

| Tier | Venue Type | Target Size | Logbook Words | Pro Tips | Sensory Details |
|------|-----------|-------------|---------------|----------|-----------------|
| **Platinum** | Specialty dining, entertainment | 35-50KB | 400-600 | 4-5 | 4-5 |
| **Gold** | Complimentary dining, buffets | 25-35KB | 250-350 | 3-4 | 2-3 |
| **Silver** | Bars, coffee, dessert, activities | 18-25KB | 100-200 | 2-3 | 1-2 |

Reference pages:
- **Platinum:** `restaurants/ncl/cagneys-steakhouse.html` (601w logbook, 5 sensory, 4 tips)
- **Gold:** `restaurants/two70.html` (464w logbook, 3 sensory, show-card format)
- **Silver target:** compact but ship-dated with 2-3 specific tips

**Emotional Hook Test — all 5 must pass:**
1. **CLARITY** — Can the reader find what they need in 10 seconds?
2. **CALM** — Does the tone reassure rather than sell?
3. **SEEN** — Does the reader feel the writer has actually been here?
4. **CONFIDENCE** — Does the reader get actionable answers?
5. **GUIDED** — Does the reader know what to do next?

---

*Soli Deo Gloria*
