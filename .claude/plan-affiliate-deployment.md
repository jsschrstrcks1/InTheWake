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

## 4. Expanded Product Recommendations (WITH AFFILIATE LINKS)

### Travel Essentials (Add to Packing Lists)

#### Power Strips (CHECK YOUR CRUISE LINE POLICY FIRST)
Most cruise cabins only have 2 outlets. Power strips are banned on some lines entirely.
| Product | Link | Notes |
|---------|------|-------|
| Cruise On Power Strip (3 AC + 2 USB) | https://amzn.to/3ZnEZmQ | Check line policy first |
| One Beat Travel Power Strip (3 outlets + 4 USB) | https://amzn.to/4612dmz | ⚠️ NOT allowed on RCL/Celebrity |
| NTONPOWER i-Donut (3 outlets + 3 USB) | https://amzn.to/4qZfcxi | ⚠️ NOT allowed on RCL/Celebrity |

**IMPORTANT:** Royal Caribbean/Celebrity now ban ALL AC-outlet devices. Many other lines have changing policies. Always verify with your specific cruise line before packing.

#### Motion Sickness Relief
| Product | Link | Notes |
|---------|------|-------|
| Dramamine | https://amzn.to/4qCaZ2L | Traditional medication |
| Bonine | https://amzn.to/45N4G3W | Less drowsy formula |
| Motion sickness patches | https://amzn.to/49Zdd6q | Behind-the-ear patches |
| Sea-Band (acupressure wristbands) | https://amzn.to/4sQHlsc | Drug-free, clinically tested |
| SafeHarbor Wristbands (4-pair) | https://amzn.to/3NqBwl6 | Great for families |
| Reliefband (electronic) | https://amzn.to/4jJm7s9 | Reusable, more expensive |

#### Organization & Packing
| Product | Link | Notes |
|---------|------|-------|
| BAGAIL Compression Packing Cubes | https://amzn.to/45fFrHn | 4.5★, 24K reviews |
| OlarHike 10-piece packing set | https://amzn.to/49JglSu | Complete set |
| Monos Compression Cubes | https://amzn.to/49JFOLS | Premium nylon twill |
| Eagle Creek Pack-It Isolate | https://amzn.to/4pICkPm | Best value option |

#### Waterproof Phone Protection
| Product | Link | Notes |
|---------|------|-------|
| UNBREAKcable Floating Pouch (2-pack) | https://amzn.to/4q404hr | IPX8, floats |
| Hiearcool Waterproof Pouch (2-pack) | https://amzn.to/3NC7rPn | Fits up to 8.3" |
| F-color Waterproof Fanny Pack | https://amzn.to/4pL7Igj | Fits phone + passport |

#### Cruise Card Management
| Product | Link | Notes |
|---------|------|-------|
| Cruise card holder | https://amzn.to/49JtWcL | Basic option |
| Cruise On Lanyard (2-pack, retractable) | https://amzn.to/4qYosBE | #1 rated, waterproof pouch |
| Leather lanyard | https://amzn.to/4jLT6vT | Dressy option |
| Necklace lanyard | https://amzn.to/3YMRvw9 | Formal nights |

### Technology (Add to Internet Guide)

#### Portable Power Banks (TSA Rules)
| Product | Link | Notes |
|---------|------|-------|
| Anker PowerCore Essential 20K | https://amzn.to/45golcm | 20,000mAh (~74Wh) |
| INIU 20000mAh 65W | https://amzn.to/4qrBtDY | 65W USB-C for laptops |
| Anker Prime 26K | https://amzn.to/4sLHjBD | 99.7Wh, max for flights |
| Anker Prime 26K (alt link) | https://amzn.to/49ZEG7X | Same product |

TSA limits: Under 100Wh = always allowed; 100-160Wh = airline approval needed. MUST be in carry-on, never checked luggage.

#### E-Readers
| Product | Link | Notes |
|---------|------|-------|
| Kindle Paperwhite | https://amzn.to/3NPpiSY | Waterproof IPX8, 10-week battery |
| Standard Kindle | https://amzn.to/4bFLXel | Budget option |
| Kindle Colorsoft | https://amzn.to/4jIhr5w | Color e-ink, waterproof |
| Kobo Clara | https://amzn.to/49Z94zg | Libby/Overdrive integration |

#### Noise-Canceling Earbuds
| Product | Link | Notes |
|---------|------|-------|
| Bose QuietComfort Ultra Earbuds 2 | https://amzn.to/4jLydkp | Best ANC overall |
| AirPods Pro 3 | https://amzn.to/4b4FLfV | Best for iPhone |
| Sony WF-1000XM5 | https://amzn.to/49pwkGA | Premium sound quality |
| EarFun Air Pro 4 | https://amzn.to/49xUCNe | Budget option, excellent ANC |
| Beats Fit Pro | https://amzn.to/3Nj4Utv | Best for workouts |

### Photography (New Article)
| Product | Link | Notes |
|---------|------|-------|
| Camera floating strap | https://amzn.to/49GP82Z | Prevents sinking |
| Mini tripod/selfie stick | https://amzn.to/4b56iJT | Versatile for port photos |
| High-capacity SD cards (128GB+) | https://amzn.to/3NPpula | Don't run out of space |
| Underwater camera case | https://amzn.to/3ZjTUyu | Universal fit for snorkeling |

**Note:** Drones prohibited on most ships and many ports.

### Cabin Comfort (Organization Article)
| Product | Link | Notes |
|---------|------|-------|
| Sleep mask | https://amzn.to/49tT9ZP | Block cabin light |
| Earplugs | https://amzn.to/3LNTf5k | Cabin hallways can be noisy |
| USB nightlight | https://amzn.to/4qq1xzf | Navigate dark cabin |
| Travel pillow | https://amzn.to/4r5oc49 | Flights and lounging |
| Clip-on book light | https://amzn.to/4bC9MDN | Read without disturbing roommate |
| Portable USB fan | https://amzn.to/4jLnm9W | Air circulation |

### Faith Items (Solo/Grief Articles)
| Product | Link | Notes |
|---------|------|-------|
| Compact travel Bible (ESV) | https://amzn.to/3LA6K8M | Portable edition |
| Prayer journal | https://amzn.to/4b5sR1a | Travel-sized |
| Cruise/travel devotional | https://amzn.to/4b68cKi | Daily readings |

### Cruise Duck Supplies (Duck Tradition Article)
| Product | Link | Notes |
|---------|------|-------|
| Bulk rubber duck variety packs | https://amzn.to/4r4ZuAR | For serious duckers |
| Pre-tagged "You've Been Ducked" ducks | https://amzn.to/3NPCjff | Ready to hide |
| Mini gift bags | https://amzn.to/4pOjqqH | Optional for special hides |

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
