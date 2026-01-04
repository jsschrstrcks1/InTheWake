# Vanilla Stories Needing Updates

## Soli Deo Gloria

Last Updated: 2026-01-03

---

## Overview

"Vanilla stories" are generic, template-based content that lacks:
- Ship-specific details
- Service recovery narrative
- Emotional depth
- Real passenger experiences

These stories must be updated with authentic, engaging content before ships can pass validation.

---

## Cruise Lines with Vanilla Templates

The following cruise lines have **identical three-story templates** repeated across ALL their ships. These need complete rewrites.

### Holland America Line (46 ship files)
**Vanilla Story Titles:**
1. "First Impressions of [Ship Name]"
2. "Dining Aboard [Ship Name]"
3. "What Makes [Ship Name] Special"

**Files Affected:**
- amsterdam.json
- edam.json
- eurodam.json
- koningsdam.json
- nieuw-amsterdam.json
- nieuw-statendam.json
- noordam.json
- oosterdam.json
- rotterdam.json
- veendam.json
- volendam.json
- westerdam.json
- zaandam.json
- zuiderdam.json
- (and all other HAL ships)

**Priority:** HIGH - Large fleet with no authentic content

---

### Princess Cruises (17 ship files)
**Vanilla Story Titles:**
1. "First Impressions of [Ship Name]"
2. "Dining Aboard [Ship Name]"
3. "What Makes [Ship Name] Special"

**Files Affected:**
- caribbean-princess.json
- coral-princess.json
- crown-princess.json
- diamond-princess.json
- discovery-princess.json
- emerald-princess.json
- enchanted-princess.json
- grand-princess.json
- island-princess.json
- majestic-princess.json
- regal-princess.json
- royal-princess.json
- ruby-princess.json
- sapphire-princess.json
- sky-princess.json
- star-princess.json
- sun-princess.json

**Priority:** HIGH - Popular cruise line

---

### Oceania Cruises (8 ship files)
**Vanilla Story Titles:**
1. "First Impressions of [Ship Name]"
2. "Dining Aboard [Ship Name]"
3. "What Makes [Ship Name] Special"

**Files Affected:**
- allura.json
- insignia.json
- marina.json
- nautica.json
- regatta.json
- riviera.json
- sirena.json
- vista.json

**Priority:** MEDIUM - Luxury line with discerning audience

---

### Costa Cruises (9 ship files)
**Vanilla Story Titles:**
1. "First Impressions of [Ship Name]"
2. "Dining Aboard [Ship Name]"
3. "What Makes [Ship Name] Special"

**Files Affected:**
- costa-deliziosa.json
- costa-diadema.json
- costa-fascinosa.json
- costa-favolosa.json
- costa-firenze.json
- costa-fortuna.json
- costa-pacifica.json
- costa-smeralda.json
- costa-toscana.json

**Priority:** MEDIUM - European market focus

---

### MSC Cruises (24 ship files)
**Vanilla Story Titles:**
1. "First Impressions of [Ship Name]"
2. "Dining Aboard [Ship Name]"
3. "What Makes [Ship Name] Special"

**Files Affected:**
- msc-armonia.json
- msc-bellissima.json
- msc-divina.json
- msc-euribia.json
- msc-fantasia.json
- msc-grandiosa.json
- msc-lirica.json
- msc-magnifica.json
- msc-meraviglia.json
- msc-musica.json
- msc-opera.json
- msc-orchestra.json
- msc-poesia.json
- msc-preziosa.json
- msc-seaside.json
- msc-seascape.json
- msc-seashore.json
- msc-sinfonia.json
- msc-splendida.json
- msc-virtuosa.json
- msc-world-america.json
- msc-world-europa.json
- (and additional MSC ships)

**Priority:** HIGH - Large fleet, growing market share

---

### Norwegian Cruise Line (20 ship files)
**Vanilla Story Titles:**
1. "First Impressions of [Ship Name]"
2. "Dining Aboard [Ship Name]"
3. "What Makes [Ship Name] Special"

**Files Affected:**
- norwegian-aqua.json
- norwegian-bliss.json
- norwegian-breakaway.json
- norwegian-dawn.json
- norwegian-encore.json
- norwegian-epic.json
- norwegian-escape.json
- norwegian-gem.json
- norwegian-getaway.json
- norwegian-jade.json
- norwegian-jewel.json
- norwegian-joy.json
- norwegian-pearl.json
- norwegian-prima.json
- norwegian-sky.json
- norwegian-spirit.json
- norwegian-star.json
- norwegian-sun.json
- norwegian-viva.json
- pride-of-america.json

**Priority:** HIGH - Major cruise line

---

### Virgin Voyages (4 ship files)
**Vanilla Story Titles:**
1. "First Impressions of [Ship Name]"
2. "Dining Aboard [Ship Name]"
3. "What Makes [Ship Name] Special"

**Note:** Some have malformed ship names in titles

**Files Affected:**
- brilliant-lady.json
- resilient-lady.json
- scarlet-lady.json
- valiant-lady.json

**Priority:** MEDIUM - Newer line, unique brand identity

---

### Regent Seven Seas (7 ship files)
**Vanilla Story Titles:**
1. "First Impressions of [Ship Name]"
2. "Dining Aboard [Ship Name]"
3. "What Makes [Ship Name] Special"

**Files Affected:**
- seven-seas-explorer.json
- seven-seas-grandeur.json
- seven-seas-mariner.json
- seven-seas-navigator.json
- seven-seas-splendor.json
- seven-seas-voyager.json
- (and additional Regent ships)

**Priority:** MEDIUM - Luxury segment

---

### Cunard (4 ship files)
**Status:** Need to verify - likely vanilla

### Explora Journeys (2 ship files)
**Status:** Need to verify - likely vanilla

### Seabourn (6 ship files)
**Status:** Need to verify - likely vanilla

### Silversea (10 ship files)
**Status:** Need to verify - likely vanilla

---

## Vanilla Story Characteristics

### Template Language Found
```
"Stepping aboard [Ship Name] for the first time, the sense of scale is immediately impressive"

"The public spaces blend functionality with elegance, creating inviting areas..."

"First-time cruisers will appreciate the intuitive layout—you'll find your way around within the first day"
```

### Placeholder Brackets Still Visible
```
"[specific ship characteristics]"
"[distinctive features]"
"[core strengths]"
```

### Generic Author Format
```json
{
  "author": {
    "name": "Community Contributor",
    "location": ""
  }
}
```

---

## What Makes a Story NOT Vanilla

Compare with quality stories from Carnival and Royal Caribbean:

### ✅ Good Story Characteristics:
- Specific ship venues mentioned (Chops Grille, Windjammer, FlowRider)
- Real author name ("Frances J.", "Norman B.")
- Emotional narrative arc (crisis → response → resolution)
- Service recovery story (problem fixed by crew)
- Tearjerker/poignant moment
- Faith references (natural, not forced)
- Internal links to ship features
- 300-600 word count
- Unique persona perspective

### ❌ Vanilla Story Characteristics:
- Generic template fits any ship
- "Community Contributor" author
- Purely informational, no emotion
- No specific ship features
- 100-150 word count
- Placeholder brackets visible
- Identical across cruise line

---

## Story Replacement Priorities

### Priority 1: Write NEW Authentic Stories

Each ship needs 10+ stories covering:
1. Solo traveler
2. Multi-generational family
3. Honeymoon/anniversary couple
4. Elderly/retiree
5. Widow/grief processing
6. Accessibility needs
7. First-timer
8. Veteran cruiser
9. Special occasion celebration
10. Healing/recovery journey

### Priority 2: Research Ship-Specific Details

For each cruise line, research:
- Unique ship features
- Dining venues specific to that line
- Entertainment offerings
- Cabin categories
- Signature experiences

### Priority 3: Use Review Sites for Inspiration

**NO PLAGIARISM** - Extract themes only:
- VacationsToGo ship reviews
- Viator cruise reviews
- Cruise Critic forums
- YouTube ship tour comments

### Priority 4: Follow Service Recovery Narrative

1. **Challenge:** What went wrong or what concern existed
2. **Response:** How the crew/ship addressed it
3. **Resolution:** Guest exceeded expectations
4. **Tearjerker:** Emotional moment of connection

---

## Estimated Work

| Cruise Line | Ships | Stories Needed | Priority |
|-------------|-------|----------------|----------|
| Holland America | 46 | 460 | HIGH |
| MSC | 24 | 240 | HIGH |
| Norwegian | 20 | 200 | HIGH |
| Princess | 17 | 170 | HIGH |
| Silversea | 10 | 100 | MEDIUM |
| Costa | 9 | 90 | MEDIUM |
| Oceania | 8 | 80 | MEDIUM |
| Regent | 7 | 70 | MEDIUM |
| Seabourn | 6 | 60 | MEDIUM |
| Virgin Voyages | 4 | 40 | MEDIUM |
| Cunard | 4 | 40 | MEDIUM |
| Explora | 2 | 20 | LOW |
| **TOTAL** | **157** | **~1,570** | - |

---

## Cruise Lines with Quality Content (No Update Needed)

### Royal Caribbean
- All 49 ship logbook files have authentic content
- Multiple personas covered
- Ship-specific details included
- Service recovery narratives present

### Carnival
- All 37 ship logbook files have authentic content
- Emotional depth present
- Real passenger perspectives
- Faith-scented moments included

---

*Soli Deo Gloria*
