# Affiliate Link Deployment Plan

**Created:** 2026-01-18
**Status:** Draft
**Purpose:** Strategic deployment of Amazon affiliate links across In the Wake

---

## 1. Current State Analysis

### Site Philosophy Conflict
The site currently declares on multiple pages:
> "✓ No ads. Minimal analytics. No affiliate links."

This is used as a **trust differentiator** against competitors. Adding affiliate links requires:
1. Removing/updating this messaging site-wide
2. Adding FTC-required affiliate disclosures
3. Maintaining the pastoral, trustworthy tone

### Files Requiring Trust Badge Updates
- `/about-us.html`
- `/accessibility.html`
- `/articles.html`
- `/cruise-lines.html`
- `/drink-calculator.html`
- (Full audit needed - search for "No affiliate links")

---

## 2. Provided Affiliate Links - Inventory

### Cruise Duck Category (The Duck Tradition)
| Product | Link | Best Placement |
|---------|------|----------------|
| Duck magnets | https://amzn.to/4b0QlEA | Duck tradition article (NEW), Packing lists |
| Magnet hooks (for cabin) | https://amzn.to/4sHvzQV | Packing lists, Cruise tips |
| Ducks with tags | https://amzn.to/4r49vhM | Duck tradition article (NEW) |
| More ducks (no tags) | https://amzn.to/4jH8dqc | Duck tradition article (NEW) |
| Tiny duck | https://amzn.to/3YOHRsS | Duck tradition article (NEW) |

### Faith-Based Items
| Product | Link | Best Placement |
|---------|------|----------------|
| Little Jesus figures | https://amzn.to/4pKZ5lY | Solo articles, Duck tradition, Faith reflections |

### Travel Gear
| Product | Link | Best Placement |
|---------|------|----------------|
| Luggage tags | https://amzn.to/3NiCCzh | Packing lists |
| Osprey carry-on pack | https://amzn.to/3NiCCzh | Packing lists |
| Packing cubes | https://amzn.to/4a0Iwh2 | Packing lists |
| Over-the-door organizer | https://amzn.to/4qrIjcF | Packing lists, Cabin organization tips |

### Technology
| Product | Link | Best Placement |
|---------|------|----------------|
| Apple AirPods Max | https://amzn.to/4r1LXdb | Internet at Sea, Entertainment guide |
| Apple Watch Ultra 3 | https://amzn.to/45WQh5e | Internet at Sea, Health/fitness content |
| GoPro Hero 13 | https://amzn.to/4qWXY3o | Port excursions, Photography tips |
| GoPro competitor | https://amzn.to/4qKMUah | Port excursions, Photography tips |
| Cruise-approved USB charger | https://amzn.to/4qC6vcr | Packing lists, Internet at Sea |

---

## 3. Deployment Strategy

### Phase 1: Infrastructure (Required First)

1. **Create Affiliate Disclosure Page** - `/affiliate-disclosure.html`
   - FTC-compliant disclosure
   - Explain "Amazon Associates" participation
   - Maintain trust by being transparent

2. **Update Trust Badges Site-Wide**
   - Change from: "✓ No ads. Minimal analytics. No affiliate links."
   - Change to: "✓ No ads. Minimal analytics. Honest recommendations."
   - Or remove entirely and rely on disclosure page

3. **Create CSS Classes for Affiliate Links**
   - `.affiliate-link` - base styling
   - `.affiliate-disclosure-inline` - small inline disclosure
   - Consistent visual treatment

### Phase 2: Content Creation

#### A. NEW: Cruise Duck Tradition Article
**Path:** `/articles/cruise-duck-tradition.html`
**Purpose:** Natural home for all duck-related affiliate products

**Content Outline:**
- What is the cruise duck tradition?
- History of cruise ducks
- How to participate (hiding/finding)
- Best ducks to bring (YOUR AFFILIATE LINKS)
- Duck tags and where to get them
- Community groups (Facebook, etc.)

#### B. NEW: Cruise Cabin Organization Guide
**Path:** `/articles/cruise-cabin-organization.html`
**Purpose:** Natural home for organizers, hooks, magnets

**Content Outline:**
- Why cabin organization matters
- Magnetic hooks for steel walls (AFFILIATE)
- Over-the-door organizers (AFFILIATE)
- Packing cube strategies (AFFILIATE)
- Making the most of small spaces

#### C. NEW: Cruise Photography & Tech Guide
**Path:** `/articles/cruise-photography-tech.html`
**Purpose:** Home for cameras, tech gadgets

**Content Outline:**
- Capturing cruise memories
- Best cameras for cruises (AFFILIATE - GoPro)
- Action cameras for excursions
- Keeping devices charged at sea (AFFILIATE)
- Waterproof protection

### Phase 3: Existing Page Enhancement

#### A. Packing Lists Page (`/packing-lists.html`)
**Current State:** 34KB of comprehensive lists with NO product links
**Enhancement:** Add affiliate links inline where products are mentioned

**Specific Placements:**
- "Packing cubes" mentions → add link to https://amzn.to/4a0Iwh2
- "Magnetic hooks" mentions → add link to https://amzn.to/4sHvzQV
- "USB charger" mentions → add link to https://amzn.to/4qC6vcr
- "Luggage tags" mentions → add link to https://amzn.to/3NiCCzh
- Add Osprey pack as recommended carry-on

#### B. Internet at Sea Page (`/internet-at-sea.html`)
**Current State:** 41KB guide to connectivity
**Enhancement:** Add tech product recommendations

**Specific Placements:**
- Power bank/charger section → USB charger affiliate
- Entertainment while offline → AirPods Max
- Activity tracking → Apple Watch Ultra

---

## 4. Expanded Product Recommendations

### Travel Essentials (Add to Packing Lists)

#### Cruise-Approved Power Strips (TOP PRIORITY)
Most cruise cabins only have 2 outlets. Power strips are essential but MUST be non-surge protected.
- **Cruise On Power Strip** - 3 AC + 2 USB, fits in palm, all cruise lines approved
- **One Beat Travel Power Strip** - 3 outlets + 4 USB (2 USB-C), compact 3.2"×4.1"
- **NTONPOWER i-Donut** - 3 outlets + 3 USB, FCC approved, fire-resistant shell
- **Note:** Royal Caribbean/Celebrity now ban ALL AC-outlet devices - verify policies first

#### Motion Sickness Relief
- **Sea-Band** - Original acupressure wristbands, drug-free, clinically tested
- **SafeHarbor Wristbands** - 4-pair packs with e-book, great for families
- **Reliefband** - Electronic option, reusable, more expensive but highly effective

#### Organization & Packing
- **Compression packing cubes** - BAGAIL (4.5★, 24K reviews), OlarHike 10-piece sets
- **Monos Compression Cubes** - Premium nylon twill, under $100 for 4-piece
- **Eagle Creek Pack-It Isolate** - Best value option per Pack Hacker
- Look for: 30-50% volume reduction, water-resistant ripstop nylon

#### Waterproof Phone Protection
- **UNBREAKcable Floating Pouch (2-pack)** - IPX8, floats, fits phones up to 7"
- **Hiearcool Waterproof Pouch (2-pack)** - IPX8, fits up to 8.3", touchscreen works
- **F-color Waterproof Fanny Pack** - Triple-zip roll-top, fits phone + passport + cards
- Key features: IPX8 rating, floating design, lanyard included

#### Cruise Card Management
- **Cruise On Lanyard (2-pack)** - #1 rated, retractable 27" reel, waterproof pouch
- **Leather/necklace lanyards** - Dressier options for formal nights
- Tip: Some require hole-punching - request at front desk, avoid RFID damage

#### Other Essentials
- **Collapsible water bottle** - for port days
- **Hanging toiletry bag** - bathroom organization
- **Travel pill organizer** - medications
- **Compact first aid kit** - bandages, pain relief, motion sickness meds

### Technology (Add to Internet Guide)

#### Portable Power Banks (TSA Rules)
- **Anker PowerCore Essential 20K** - 20,000mAh (~74Wh), 2 devices, fast charging
- **INIU 20000mAh 65W** - Three ports including 65W USB-C for laptops
- **Anker Prime 26K** - 26,250mAh (99.7Wh), max capacity for flights
- TSA limits: Under 100Wh = always allowed; 100-160Wh = airline approval needed
- MUST be in carry-on, never checked luggage

#### E-Readers
- **Kindle Paperwhite** - Best for travel: waterproof IPX8, 10-week battery, 6.8" display
- **Standard Kindle 2026** - Budget option at $109, 6-week battery, 300ppi
- **Kindle Colorsoft** - Color e-ink, waterproof, $279, great for visual content
- **Kobo Clara** - Alternative with Libby/Overdrive library integration

#### Noise-Canceling Earbuds
- **Bose QuietComfort Ultra Earbuds 2** - Best ANC, "reduces busy streets to near-silence"
- **AirPods Pro 3** - Best for iPhone, 2x better ANC than Pro 2
- **Sony WF-1000XM5** - Premium AirPods alternative, superior sound
- **EarFun Air Pro 4** - Budget option with excellent ANC
- **Beats Fit Pro** - Best for workouts, secure wingtip design

#### Other Tech
- **Universal travel adapter** - for international ports
- **Bluetooth speaker** - waterproof for balcony use

### Photography (New Article)
- **Camera floating strap** - prevents sinking during water activities
- **Mini tripod/selfie stick** - versatile for port photos
- **High-capacity SD cards** - 128GB+ recommended
- **Underwater camera case** - universal fit for snorkeling
- **Note:** Drones prohibited on most ships and many ports

### Cabin Comfort (Organization Article)
- **Sleep mask & earplugs** - cabin hallways can be noisy
- **USB nightlight** - navigating dark cabin at night
- **Travel pillow** - for flights and lounging
- **Clip-on book light** - reading without disturbing roommate
- **Portable fan** - small USB-powered for air circulation

### Faith Items (Solo/Grief Articles)
- **Compact travel Bible** - NIV, ESV travel editions
- **Prayer journal** - travel-sized
- **Devotional books** - cruise/travel themed
- **Small cross/religious keepsake** - for comfort

### Cruise Duck Supplies (Duck Tradition Article)
- **Bulk rubber ducks** - 50-100 packs for serious duckers
- **Pre-tagged ducks** - "You've Been Ducked" ready to hide
- **Waterproof labels/tags** - for DIY tagging
- **Mini gift bags** - optional for special hides
- **Themed ducks** - holidays, professions, characters

---

## 5. Affiliate Link Best Practices

### Disclosure Requirements (FTC)
Every page with affiliate links must include:

**Option A - Inline (at first link):**
```html
<p class="affiliate-disclosure">
  <small>Some links on this page are affiliate links.
  If you purchase through these links, we may earn a small commission
  at no extra cost to you. See our <a href="/affiliate-disclosure.html">full disclosure</a>.</small>
</p>
```

**Option B - Header (at top of content):**
```html
<aside class="affiliate-notice" role="note">
  This page contains affiliate links.
  <a href="/affiliate-disclosure.html">Learn more</a>.
</aside>
```

### Link Implementation
```html
<!-- Proper affiliate link format -->
<a href="https://amzn.to/4a0Iwh2"
   rel="sponsored noopener"
   target="_blank"
   class="affiliate-link">
   packing cubes
</a>
```

### SEO Considerations
- Use `rel="sponsored"` (Google requirement for paid links)
- Add `noopener` for security when using `target="_blank"`
- Don't overuse - keep links natural and helpful
- Focus on user value, not just monetization

---

## 6. Implementation Priority

### High Priority (Start Here)
1. ✅ Create affiliate disclosure page
2. ✅ Update trust badges across site
3. ✅ Enhance packing-lists.html with existing links
4. ✅ Create cruise duck tradition article

### Medium Priority
5. Create cabin organization guide
6. Enhance internet-at-sea.html
7. Create photography/tech guide

### Lower Priority (Future)
8. Add links to solo travel articles
9. Create faith items guide
10. Port excursion gear recommendations

---

## 7. Maintaining Site Values

### Alignment with ITW-Lite Philosophy
- **AI-First:** Affiliate links don't impact AI comprehension
- **Human-First:** Recommendations must be genuinely helpful
- **Google Second:** Don't let SEO drive link placement

### Pastoral Considerations
- Keep recommendations authentic and tested when possible
- Don't push expensive items to grieving/budget-conscious readers
- Offer range of price points
- Never make affiliate feel like primary purpose

### Content Quality Standards
- Product recommendations should add value, not clutter
- Write honest assessments, not just sales pitches
- Include non-affiliate alternatives when relevant
- Maintain the site's warm, helpful tone

---

## 8. Tracking & Measurement

### Amazon Associates Dashboard
- Track which products/pages convert
- Identify top performers for expansion
- Monitor for broken links

### Suggested Link Tagging
Use Amazon's tag feature to track by page:
- `tag=inthewake-packing-20`
- `tag=inthewake-ducks-20`
- `tag=inthewake-tech-20`

(Note: This requires creating multiple tracking IDs or using Amazon's link tagging)

---

## 9. File Changes Summary

### New Files to Create
- `/affiliate-disclosure.html` - Legal disclosure page
- `/articles/cruise-duck-tradition.html` - Duck content hub
- `/articles/cruise-cabin-organization.html` - Organization tips
- `/articles/cruise-photography-tech.html` - Tech/camera guide

### Existing Files to Modify
- `/packing-lists.html` - Add affiliate links
- `/internet-at-sea.html` - Add tech recommendations
- `/about-us.html` - Update trust badge
- `/accessibility.html` - Update trust badge
- `/articles.html` - Update trust badge, add new articles
- `/cruise-lines.html` - Update trust badge
- `/drink-calculator.html` - Update trust badge
- (Plus any other pages with "No affiliate links" text)

---

## 10. Next Steps

1. **Review this plan** - Confirm strategy aligns with vision
2. **Decide on trust badge approach** - Remove vs. update
3. **Create affiliate disclosure page** - Required before adding links
4. **Start with packing lists** - Highest-value, lowest-risk
5. **Create duck tradition content** - Unique content opportunity

---

**Questions for Consideration:**
- Should the "No affiliate links" differentiator be replaced with a new differentiator?
- What's the comfort level with tech product recommendations (higher price points)?
- Any products from the list you'd prefer NOT to promote?
- Desired timeline for implementation phases?

---

*Soli Deo Gloria* - Even in monetization, excellence as worship.
