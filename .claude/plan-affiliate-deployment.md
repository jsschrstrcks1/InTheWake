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
- **Compression bags** - for maximizing luggage space
- **Travel power strip** - cruise-approved multi-outlet
- **Motion sickness bands** - Sea-Band or similar
- **Waterproof phone pouch** - for pool/beach days
- **Portable fan** - small battery-operated cabin fan
- **Collapsible water bottle** - for port days
- **Lanyard/card holder** - for cruise card
- **Hanging toiletry bag** - bathroom organization
- **Travel pill organizer** - medications
- **First aid kit** - compact travel version

### Technology (Add to Internet Guide)
- **Portable battery pack** - high-capacity
- **Universal travel adapter** - for international ports
- **Bluetooth speaker** - balcony entertainment
- **E-reader** - Kindle for poolside reading
- **Noise-canceling earbuds** - flight/cabin use

### Photography (New Article)
- **Camera floating strap** - for water activities
- **Mini tripod/selfie stick**
- **SD cards** - high capacity
- **Underwater camera case**
- **Drone** (note: many ports/ships prohibit)

### Cabin Comfort (New Article)
- **Sleep mask & earplugs**
- **Small nightlight** - USB powered
- **Travel pillow**
- **Clip-on book light**
- **Mini essential oil diffuser**

### Faith Items (Solo/Grief Articles)
- **Travel Bible** - compact edition
- **Prayer journal**
- **Devotional books** - cruise/travel themed
- **Small cross/religious keepsake**

### Cruise Duck Supplies (New Article)
- **Bulk rubber ducks** - variety packs
- **Duck calling cards** - printable tags
- **Waterproof labels**
- **Mini gift bags** - for duck hiding

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
