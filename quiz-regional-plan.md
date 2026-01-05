# Quiz Enhancement Plan: Dress Code + Regional Availability

## Overview
Two new quiz features to improve recommendation accuracy:
1. **Dress code question** - Distinguish formal (Cunard) from casual (Virgin) experiences
2. **Regional availability** - Filter/penalize lines that don't sail from user's region

---

## 1. Dress Code Question

### Question Design
```javascript
{
  id: 'dress_code',
  question: "How do you feel about dressing up?",
  subtitle: "Cruise lines vary from formal nights to barefoot casual",
  options: [
    { value: 'formal', label: 'Love Formal Nights', icon: '👔', desc: 'Tuxedos, gowns, elegant evenings' },
    { value: 'smart', label: 'Smart Casual', icon: '👗', desc: 'Dress up sometimes, not every night' },
    { value: 'casual', label: 'Resort Casual', icon: '🌴', desc: 'Nice but comfortable' },
    { value: 'relaxed', label: 'As Relaxed as Possible', icon: '🩴', desc: 'Shorts and flip-flops' }
  ],
  gridClass: 'two-col'
}
```

### Scoring Weights (dress_code_weights)
| Line | formal | smart | casual | relaxed |
|------|--------|-------|--------|---------|
| cunard | +20 | +8 | -10 | -25 |
| holland | +12 | +10 | +4 | -8 |
| princess | +10 | +10 | +6 | -4 |
| celebrity | +8 | +12 | +8 | -4 |
| oceania | +8 | +12 | +6 | -6 |
| regent | +10 | +12 | +4 | -8 |
| seabourn | +8 | +10 | +6 | -6 |
| silversea | +8 | +10 | +6 | -6 |
| explora | +6 | +12 | +8 | -4 |
| disney | -4 | +6 | +10 | +6 |
| rcl | -4 | +6 | +10 | +4 |
| carnival | -8 | +4 | +10 | +10 |
| ncl | -10 | +4 | +12 | +15 |
| msc | -4 | +6 | +10 | +6 |
| virgin | -20 | -8 | +12 | +20 |

**Rationale:**
- Cunard: Famous for formal nights, strict dress codes
- Virgin: "No dress code" is their brand identity
- NCL: "Freestyle cruising" pioneered casual dining
- Luxury lines (Regent, Seabourn): Elegant but increasingly flexible

---

## 2. Regional Availability

### Question Design (Optional - Question #2)
```javascript
{
  id: 'home_region',
  question: "Where would you like to sail from?",
  subtitle: "We'll prioritize cruise lines in your area",
  options: [
    { value: 'north_america', label: 'North America', icon: '🌎', desc: 'Caribbean, Alaska, US ports' },
    { value: 'europe', label: 'UK & Europe', icon: '🌍', desc: 'Mediterranean, Northern Europe, British Isles' },
    { value: 'australia', label: 'Australia & Pacific', icon: '🌏', desc: 'Down Under, NZ, South Pacific' },
    { value: 'asia', label: 'Asia', icon: '🗾', desc: 'Singapore, Japan, Southeast Asia' },
    { value: 'flexible', label: "I'll Travel to Embark", icon: '✈️', desc: 'Show me everything' }
  ],
  gridClass: 'three-col',
  optional: true  // Can be skipped
}
```

### Auto-Detection Logic
```javascript
function detectRegion() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Australia/Pacific
  if (tz.startsWith('Australia/') || tz.startsWith('Pacific/Auckland') ||
      tz.startsWith('Pacific/Fiji')) {
    return 'australia';
  }

  // Asia
  if (tz.startsWith('Asia/')) {
    return 'asia';
  }

  // Europe
  if (tz.startsWith('Europe/') || tz === 'Atlantic/Reykjavik') {
    return 'europe';
  }

  // Default: North America
  return 'north_america';
}
```

### Regional Presence Data
Based on research from cruise line official sites and industry sources.

**Presence Levels:**
- `strong` = Regular seasonal deployment, multiple ships → +0 (no penalty)
- `moderate` = Some presence, fewer options → -5
- `limited` = Occasional sailings, repositioning → -15
- `rare` = World cruise stops only → -25
- `none` = No sailings from region → -50

```json
"regional_availability": {
  "rcl": {
    "north_america": "strong",
    "europe": "strong",
    "australia": "strong",
    "asia": "strong"
  },
  "carnival": {
    "north_america": "strong",
    "europe": "limited",
    "australia": "moderate",
    "asia": "rare"
  },
  "ncl": {
    "north_america": "strong",
    "europe": "strong",
    "australia": "moderate",
    "asia": "moderate"
  },
  "msc": {
    "north_america": "strong",
    "europe": "strong",
    "australia": "limited",
    "asia": "limited"
  },
  "celebrity": {
    "north_america": "strong",
    "europe": "strong",
    "australia": "strong",
    "asia": "moderate"
  },
  "princess": {
    "north_america": "strong",
    "europe": "strong",
    "australia": "strong",
    "asia": "strong"
  },
  "holland": {
    "north_america": "strong",
    "europe": "strong",
    "australia": "moderate",
    "asia": "moderate"
  },
  "cunard": {
    "north_america": "moderate",
    "europe": "strong",
    "australia": "rare",
    "asia": "limited"
  },
  "disney": {
    "north_america": "strong",
    "europe": "moderate",
    "australia": "limited",
    "asia": "limited"
  },
  "virgin": {
    "north_america": "strong",
    "europe": "strong",
    "australia": "none",
    "asia": "none"
  },
  "oceania": {
    "north_america": "strong",
    "europe": "strong",
    "australia": "limited",
    "asia": "moderate"
  },
  "regent": {
    "north_america": "strong",
    "europe": "strong",
    "australia": "limited",
    "asia": "moderate"
  },
  "seabourn": {
    "north_america": "strong",
    "europe": "strong",
    "australia": "limited",
    "asia": "moderate"
  },
  "silversea": {
    "north_america": "strong",
    "europe": "strong",
    "australia": "moderate",
    "asia": "strong"
  },
  "explora": {
    "north_america": "moderate",
    "europe": "strong",
    "australia": "none",
    "asia": "rare"
  }
}
```

### Scoring Implementation
```javascript
// In calculateScoresForLine()
const homeRegion = answers.home_region || detectRegion();

if (homeRegion !== 'flexible' && quizData.regional_availability) {
  const availability = quizData.regional_availability[line]?.[homeRegion];
  const penalties = {
    'strong': 0,
    'moderate': -5,
    'limited': -15,
    'rare': -25,
    'none': -50
  };

  const penalty = penalties[availability] || 0;

  // Apply penalty to ALL classes for this line
  for (const className of Object.keys(classScores)) {
    classScores[className] += penalty;
  }
}
```

---

## Implementation Order

1. **Add dress_code question** after `cruise_experience` (question #3)
2. **Add home_region question** as question #2 (optional, with skip)
3. **Add dress_code_weights** to JSON (per-class scoring)
4. **Add regional_availability** to JSON (per-line scoring)
5. **Add auto-detection** function
6. **Add scoring logic** for both new questions
7. **Test with Brenda persona**: Australian, value budget, hates formal → should NOT get Cunard

---

## Question Order (Updated)

1. group_type - "Who's traveling?"
2. **home_region** - "Where would you like to sail from?" (NEW, optional)
3. cruise_experience - "How many cruises?"
4. **dress_code** - "How do you feel about dressing up?" (NEW)
5. energy_level - "Ideal pace?"
6. crowd_tolerance - "How do you feel about crowds?"
7. ship_vs_ports - "Ship experience or destinations?"
8. sailing_length - "How long?"
9. budget_mindset - "Budget approach?"
10. must_have - "Must-have feature?"
11. kid_separation - "Separation from children?"
12. atmosphere - "What atmosphere?"

---

## Sources
- [Royal Caribbean Australia](https://www.royalcaribbean.com/aus/en)
- [Princess Australia/NZ Season](https://www.princess.com/news/news-releases/2023/11/)
- [Cruise Critic - Cruises from Australia](https://www.cruisecritic.com/articles/cruises-from-australia-this-year)
- [Virgin Voyages Europe](https://www.virginvoyages.com/destinations/europe-cruises)
- [Princess Asia Season](https://www.princess.com/news/news-releases/2024/05/)
- [NCL Asia Cruises](https://www.ncl.com/travel-blog/2025-asia-cruises)
