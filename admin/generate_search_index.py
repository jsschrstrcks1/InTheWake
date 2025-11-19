#!/usr/bin/env python3
"""
Generate Search Index
Soli Deo Gloria

Creates a comprehensive search index for all user-facing pages.
"""

import json
import re
from pathlib import Path

def get_restaurants():
    """Get all restaurants from venues-v2.json"""
    venues_path = Path('/home/user/InTheWake/assets/data/venues-v2.json')
    with open(venues_path) as f:
        data = json.load(f)

    restaurants = []
    for venue in data.get('venues', []):
        slug = venue.get('slug', '')
        name = venue.get('name', '')

        # Skip if no slug
        if not slug:
            continue

        # Get description or create one
        desc = venue.get('description', '')
        if not desc:
            venue_type = venue.get('type', 'Dining venue')
            desc = f"{name} - {venue_type} on Royal Caribbean ships"

        # Create keywords from name and type
        keywords = [name.lower()]
        if venue.get('type'):
            keywords.append(venue['type'].lower())
        if 'steakhouse' in name.lower() or 'chops' in name.lower():
            keywords.extend(['steak', 'beef', 'prime'])
        if 'sushi' in name.lower() or 'izumi' in name.lower():
            keywords.extend(['sushi', 'japanese', 'teppanyaki'])
        if 'italian' in name.lower() or 'giovanni' in name.lower():
            keywords.extend(['italian', 'pasta', 'pizza'])

        restaurants.append({
            'title': name,
            'url': f'/restaurants/{slug}.html',
            'description': desc[:200],
            'cta': f"Explore {name} - find menus, pricing, and which ships have it.",
            'category': 'restaurant',
            'keywords': keywords
        })

    return restaurants

def get_ships():
    """Get all RCL ships"""
    ships_dir = Path('/home/user/InTheWake/ships/rcl')
    ships = []

    # Ship CTAs - key ships with custom text
    ship_ctas = {
        'icon-of-the-seas': 'The biggest, newest ship with every innovation. Perfect for first-timers wanting the full Royal Caribbean experience.',
        'utopia-of-the-seas': 'Newest Oasis-class ship sailing short getaways from Florida. Great for weekend cruisers.',
        'wonder-of-the-seas': 'One of the largest ships afloat with 8 neighborhoods. Ideal for families wanting endless options.',
        'symphony-of-the-seas': 'Oasis-class excellence with the Ultimate Abyss slide. Perfect for thrill-seekers.',
        'harmony-of-the-seas': 'First ship with Ultimate Abyss. Great balance of innovation and value.',
        'allure-of-the-seas': 'Classic Oasis-class with 2025 amplification. Best for Caribbean itineraries.',
        'oasis-of-the-seas': 'The original game-changer. Great value for the Oasis experience.',
        'anthem-of-the-seas': 'Year-round from New Jersey. Ideal for East Coast cruisers avoiding flights.',
        'quantum-of-the-seas': 'Based in Singapore/Alaska. Perfect for Asia-Pacific cruisers.',
        'ovation-of-the-seas': 'Australia/Alaska specialist. Great for down-under and frontier cruisers.',
        'odyssey-of-the-seas': 'Newest Quantum Ultra with SeaPlex. Great for active families.',
        'spectrum-of-the-seas': 'China-based with unique Asian features. Perfect for Asian market cruisers.',
        'freedom-of-the-seas': 'Freedom-class flagship with FlowRider. Great Caribbean value.',
        'liberty-of-the-seas': 'Galveston homeport. Perfect for Texas cruisers.',
        'independence-of-the-seas': 'UK-based seasonally. Great for British cruisers.',
        'voyager-of-the-seas': 'The original mega-ship. Classic Royal Caribbean experience.',
        'mariner-of-the-seas': 'Short cruises from LA. Perfect for quick getaways.',
        'navigator-of-the-seas': 'LA-based year-round. Great for West Coast Mexican Riviera.',
        'adventure-of-the-seas': 'Voyager-class value. Good for budget-conscious families.',
        'explorer-of-the-seas': 'Diverse itineraries worldwide. Great for variety seekers.',
        'radiance-of-the-seas': 'Floor-to-ceiling windows throughout. Perfect if views matter most to you.',
        'brilliance-of-the-seas': 'Tampa homeport. Great for Florida Gulf cruisers.',
        'serenade-of-the-seas': 'Alaska specialist. Perfect for Last Frontier cruisers.',
        'jewel-of-the-seas': 'Smaller ship, big value. Great for those preferring intimate cruising.',
        'grandeur-of-the-seas': 'Classic smaller ship. Perfect for traditionalists.',
        'enchantment-of-the-seas': 'Compact Bahamas specialist. Great for quick escapes.',
        'rhapsody-of-the-seas': 'Vision-class cruising. Good value for classic experience.',
        'vision-of-the-seas': 'Traditional cruising feel. Perfect for those who prefer smaller ships.',
    }

    for html_file in ships_dir.glob('*.html'):
        slug = html_file.stem

        # Skip template
        if slug == 'template':
            continue

        # Create readable name from slug
        name = slug.replace('-', ' ').title()
        name = name.replace(' Of The ', ' of the ')

        # Get CTA or default
        cta = ship_ctas.get(slug, f"Explore {name} - deck plans, dining venues, staterooms, and cruise tips.")

        # Keywords
        keywords = [word.lower() for word in name.split()]
        if 'oasis' in slug or slug in ['wonder-of-the-seas', 'symphony-of-the-seas', 'harmony-of-the-seas', 'allure-of-the-seas', 'utopia-of-the-seas']:
            keywords.extend(['oasis', 'class', 'largest', 'biggest'])
        if 'quantum' in slug or 'anthem' in slug or 'ovation' in slug or 'odyssey' in slug or 'spectrum' in slug:
            keywords.extend(['quantum', 'class', 'north star', 'bumper cars'])
        if 'freedom' in slug or 'liberty' in slug or 'independence' in slug:
            keywords.extend(['freedom', 'class', 'flowrider'])
        if 'voyager' in slug or 'mariner' in slug or 'navigator' in slug or 'adventure' in slug or 'explorer' in slug:
            keywords.extend(['voyager', 'class'])
        if 'radiance' in slug or 'brilliance' in slug or 'serenade' in slug or 'jewel' in slug:
            keywords.extend(['radiance', 'class', 'windows', 'views'])

        ships.append({
            'title': name,
            'url': f'/ships/rcl/{slug}.html',
            'description': f"Complete guide to {name} - deck plans, dining, staterooms, and what makes this ship special.",
            'cta': cta,
            'category': 'ship',
            'keywords': keywords
        })

    return ships

def get_articles():
    """Get solo articles"""
    articles = [
        {
            'title': 'In the Wake of Grief',
            'url': '/solo/in-the-wake-of-grief.html',
            'description': 'A guide for widows, widowers, and the bereaved navigating first cruises after loss.',
            'cta': 'Read this if you\'re cruising after losing a spouse or loved one. Practical guidance with compassion.',
            'category': 'article',
            'keywords': ['grief', 'loss', 'widow', 'widower', 'bereavement', 'death', 'mourning', 'first cruise', 'alone']
        },
        {
            'title': 'Why I Started Solo Cruising',
            'url': '/solo/why-i-started-solo-cruising.html',
            'description': 'Personal story and guide to cruising alone for the first time.',
            'cta': 'Considering your first solo cruise? Read one cruiser\'s journey from nervous to confident.',
            'category': 'article',
            'keywords': ['solo', 'alone', 'single', 'first time', 'nervous', 'independent', 'travel alone']
        },
        {
            'title': 'Accessible Cruising Guide',
            'url': '/solo/accessible-cruising.html',
            'description': 'Complete guide for travelers with disabilities cruising with Royal Caribbean.',
            'cta': 'Wheelchair, autism, hearing loss, or chronic illness? Find practical accessibility guidance here.',
            'category': 'article',
            'keywords': ['accessible', 'disability', 'wheelchair', 'mobility', 'autism', 'deaf', 'blind', 'chronic illness', 'ada', 'special needs']
        },
        {
            'title': 'Freedom of Your Own Wake',
            'url': '/solo/freedom-of-your-own-wake.html',
            'description': 'Embracing independence and self-discovery through solo cruise travel.',
            'cta': 'Discover the unexpected freedom that comes from traveling on your own terms.',
            'category': 'article',
            'keywords': ['freedom', 'independence', 'solo', 'self-discovery', 'travel']
        },
        {
            'title': 'Visiting the United States Before Your Cruise',
            'url': '/solo/visiting-the-united-states-before-your-cruise.html',
            'description': 'Guide for international travelers visiting the US before embarking on a cruise.',
            'cta': 'International cruiser? Essential tips for US arrival, customs, and pre-cruise logistics.',
            'category': 'article',
            'keywords': ['international', 'visa', 'customs', 'immigration', 'usa', 'united states', 'foreign', 'travel to us']
        }
    ]
    return articles

def get_cruise_lines():
    """Get cruise line pages"""
    cruise_lines = [
        {
            'title': 'Royal Caribbean',
            'url': '/cruise-lines/royal-caribbean.html',
            'description': 'Complete guide to Royal Caribbean International cruise line.',
            'cta': 'Our specialty. Deep coverage of ships, dining, and the Royal Caribbean experience.',
            'category': 'cruise-line',
            'keywords': ['royal caribbean', 'rci', 'rcl', 'royal']
        },
        {
            'title': 'Carnival Cruise Line',
            'url': '/cruise-lines/carnival.html',
            'description': 'Guide to Carnival Cruise Line - the fun ships.',
            'cta': 'Explore Carnival\'s fun-focused cruising with great value for families.',
            'category': 'cruise-line',
            'keywords': ['carnival', 'fun ships', 'ccl']
        },
        {
            'title': 'Celebrity Cruises',
            'url': '/cruise-lines/celebrity.html',
            'description': 'Guide to Celebrity Cruises - modern luxury at sea.',
            'cta': 'Premium cruising with elevated dining and modern luxury touches.',
            'category': 'cruise-line',
            'keywords': ['celebrity', 'luxury', 'premium', 'modern']
        },
        {
            'title': 'Norwegian Cruise Line',
            'url': '/cruise-lines/norwegian.html',
            'description': 'Guide to Norwegian Cruise Line - freestyle cruising.',
            'cta': 'Freestyle cruising with no fixed dining times and casual atmosphere.',
            'category': 'cruise-line',
            'keywords': ['norwegian', 'ncl', 'freestyle', 'casual']
        },
        {
            'title': 'Disney Cruise Line',
            'url': '/cruise-lines/disney.html',
            'description': 'Guide to Disney Cruise Line - magical family cruising.',
            'cta': 'The gold standard for family cruising with Disney magic at sea.',
            'category': 'cruise-line',
            'keywords': ['disney', 'dcl', 'family', 'kids', 'children', 'magical']
        },
        {
            'title': 'Princess Cruises',
            'url': '/cruise-lines/princess.html',
            'description': 'Guide to Princess Cruises - come back new.',
            'cta': 'Classic cruising with excellent Alaska and worldwide itineraries.',
            'category': 'cruise-line',
            'keywords': ['princess', 'classic', 'alaska', 'love boat']
        },
        {
            'title': 'Holland America Line',
            'url': '/cruise-lines/holland-america.html',
            'description': 'Guide to Holland America Line - a tradition of excellence.',
            'cta': 'Traditional cruising with excellent service for mature travelers.',
            'category': 'cruise-line',
            'keywords': ['holland america', 'hal', 'traditional', 'classic', 'mature']
        },
        {
            'title': 'MSC Cruises',
            'url': '/cruise-lines/msc.html',
            'description': 'Guide to MSC Cruises - European style cruising.',
            'cta': 'European-style mega-ships with great value and international flair.',
            'category': 'cruise-line',
            'keywords': ['msc', 'european', 'mediterranean', 'international']
        },
        {
            'title': 'Viking Cruises',
            'url': '/cruise-lines/viking.html',
            'description': 'Guide to Viking Ocean and River cruises.',
            'cta': 'Destination-focused cruising for curious travelers who love culture.',
            'category': 'cruise-line',
            'keywords': ['viking', 'river', 'ocean', 'destination', 'culture', 'adult']
        },
        {
            'title': 'Virgin Voyages',
            'url': '/cruise-lines/virgin.html',
            'description': 'Guide to Virgin Voyages - rebellious luxe cruising.',
            'cta': 'Adults-only, all-inclusive with a fresh take on cruising.',
            'category': 'cruise-line',
            'keywords': ['virgin', 'voyages', 'adults only', 'modern', 'hip', 'trendy']
        }
    ]
    return cruise_lines

def get_hub_pages():
    """Get main hub and utility pages"""
    hubs = [
        {
            'title': 'Ships',
            'url': '/ships.html',
            'description': 'Browse all Royal Caribbean ships by class and features.',
            'cta': 'Compare all RCL ships side by side. Find the perfect ship for your cruise.',
            'category': 'hub',
            'keywords': ['ships', 'fleet', 'compare', 'all ships', 'browse']
        },
        {
            'title': 'Restaurants & Dining',
            'url': '/restaurants.html',
            'description': 'Complete guide to Royal Caribbean dining venues across all ships.',
            'cta': 'Explore every restaurant, café, and bar. Find what\'s on your ship.',
            'category': 'hub',
            'keywords': ['restaurants', 'dining', 'food', 'eat', 'menu', 'specialty']
        },
        {
            'title': 'Solo Cruising',
            'url': '/solo.html',
            'description': 'Resources for solo cruisers - traveling alone at sea.',
            'cta': 'Cruising alone? Find guides, stories, and practical tips for solo travelers.',
            'category': 'hub',
            'keywords': ['solo', 'alone', 'single', 'independent', 'by yourself']
        },
        {
            'title': 'Cruise Lines',
            'url': '/cruise-lines.html',
            'description': 'Compare cruise lines and find the right fit for you.',
            'cta': 'Not sure which cruise line? Compare options and find your match.',
            'category': 'hub',
            'keywords': ['cruise lines', 'compare', 'which', 'best', 'choose']
        },
        {
            'title': 'Planning',
            'url': '/planning.html',
            'description': 'Cruise planning resources and tools.',
            'cta': 'Planning your cruise? Checklists, calculators, and booking tips.',
            'category': 'hub',
            'keywords': ['planning', 'plan', 'book', 'prepare', 'checklist']
        },
        {
            'title': 'Drink Calculator',
            'url': '/drink-calculator.html',
            'description': 'Calculate if a drink package is worth it for your cruise.',
            'cta': 'Should you buy a drink package? Calculate your break-even point.',
            'category': 'tool',
            'keywords': ['drink', 'calculator', 'package', 'alcohol', 'beverage', 'worth it', 'break even']
        },
        {
            'title': 'Packing Lists',
            'url': '/packing-lists.html',
            'description': 'Cruise packing lists and what to bring.',
            'cta': 'What to pack for your cruise. Printable lists by cruise type.',
            'category': 'tool',
            'keywords': ['packing', 'pack', 'list', 'bring', 'luggage', 'clothes', 'essentials']
        },
        {
            'title': 'Accessibility',
            'url': '/accessibility.html',
            'description': 'Accessibility information for cruisers with disabilities.',
            'cta': 'Cruising with a disability? Find accessibility resources and ship info.',
            'category': 'hub',
            'keywords': ['accessibility', 'accessible', 'disability', 'wheelchair', 'ada']
        },
        {
            'title': 'Disability at Sea',
            'url': '/disability-at-sea.html',
            'description': 'Resources for travelers with disabilities at sea.',
            'cta': 'In-depth resources for cruisers with mobility, sensory, or cognitive disabilities.',
            'category': 'hub',
            'keywords': ['disability', 'disabled', 'special needs', 'mobility', 'wheelchair']
        },
        {
            'title': 'Travel Resources',
            'url': '/travel.html',
            'description': 'General travel resources and tips.',
            'cta': 'Travel tips beyond cruising - flights, hotels, and logistics.',
            'category': 'hub',
            'keywords': ['travel', 'tips', 'resources', 'flights', 'hotels']
        },
        {
            'title': 'About Us',
            'url': '/about-us.html',
            'description': 'About In the Wake - who we are and why we do this.',
            'cta': 'Learn about our mission and the team behind In the Wake.',
            'category': 'about',
            'keywords': ['about', 'who', 'team', 'mission', 'contact']
        },
        {
            'title': 'Articles',
            'url': '/articles.html',
            'description': 'All articles and guides on In the Wake.',
            'cta': 'Browse all our articles, guides, and stories.',
            'category': 'hub',
            'keywords': ['articles', 'guides', 'stories', 'read', 'blog']
        }
    ]
    return hubs

def main():
    """Generate the search index"""
    index = []

    # Gather all content
    index.extend(get_restaurants())
    index.extend(get_ships())
    index.extend(get_articles())
    index.extend(get_cruise_lines())
    index.extend(get_hub_pages())

    # Write index
    output_path = Path('/home/user/InTheWake/assets/data/search-index.json')
    with open(output_path, 'w') as f:
        json.dump(index, f, indent=2)

    # Summary
    categories = {}
    for item in index:
        cat = item['category']
        categories[cat] = categories.get(cat, 0) + 1

    print(f"✅ Generated search index with {len(index)} items:")
    for cat, count in sorted(categories.items()):
        print(f"   {cat}: {count}")

if __name__ == '__main__':
    main()
