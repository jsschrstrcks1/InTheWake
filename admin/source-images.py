#!/usr/bin/env python3
"""
Unified Image Sourcer — In the Wake
Soli Deo Gloria

Sources images for ports from Flickr public feed (primary) with Wikimedia
Commons as fallback.  Designed for sandbox environments where
commons.wikimedia.org may be blocked by egress policy (HTTP 403).

Human-like behavior:
  - Random delays between requests (2-6 s) with jitter
  - Longer pauses between ports (6-15 s)
  - Brief "coffee break" pause every ~20 requests
  - Polite User-Agent with contact info
  - Max ~8-10 requests per minute

Combines the best of:
  source-port-images.py      → port search terms, image type mapping
  source-specific-ports.py   → per-port per-type customisation
  source-ship-images-batch.py → Flickr feed, Pillow conversion, progress

Usage:
  python3 admin/source-images.py                        # All ports with missing images
  python3 admin/source-images.py nassau cozumel miami   # Specific ports
  python3 admin/source-images.py --dry-run              # Preview only
  python3 admin/source-images.py --flickr-only          # Skip Wikimedia fallback
  python3 admin/source-images.py --limit 5              # Process max 5 ports
  python3 admin/source-images.py --resume               # Resume from progress file
  python3 admin/source-images.py --needed 8             # Only ports needing >= 8 images
"""

import argparse
import csv
import hashlib
import json
import os
import random
import re
import sys
import time
import urllib.request
import urllib.parse
from pathlib import Path

try:
    from PIL import Image as PILImage
    HAS_PILLOW = True
except ImportError:
    HAS_PILLOW = False
    print("WARNING: Pillow not installed — images will NOT be converted to WebP.")
    print("         Install with: pip install Pillow\n")

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parent.parent
PORTS_DIR = PROJECT_ROOT / "ports"
PORTS_IMG_DIR = PROJECT_ROOT / "ports" / "img"
ATTR_CSV = PROJECT_ROOT / "attributions" / "attributions.csv"
PROGRESS_FILE = PROJECT_ROOT / "admin" / ".port-image-progress.json"

USER_AGENT = (
    "CruisingInTheWake/1.0 "
    "(https://cruisinginthewake.com; admin@cruisinginthewake.com) "
    "Python/3 image-sourcer"
)
FLICKR_FEED = "https://api.flickr.com/services/feeds/photos_public.gne"

# ---------------------------------------------------------------------------
# Human-like rate limiter
# ---------------------------------------------------------------------------
class RateLimiter:
    """Adds human-like delays between API requests.

    Rather than hammering an API with machine-speed requests, this class
    injects random pauses that look more like a person clicking through
    search results.
    """

    def __init__(self):
        self.request_count = 0
        self.session_start = time.time()

    def short_pause(self):
        """Brief pause between individual API calls (2-6 s with jitter)."""
        self.request_count += 1
        delay = random.uniform(2.0, 6.0)
        # Every ~20 requests, take a longer "coffee break"
        if self.request_count % 20 == 0:
            delay += random.uniform(10.0, 25.0)
            elapsed = time.time() - self.session_start
            print(f"\n    ☕  Brief pause after {self.request_count} requests "
                  f"({elapsed:.0f}s elapsed)...\n")
        time.sleep(delay)

    def between_images(self):
        """Pause between processing different images for the same port."""
        delay = random.uniform(3.0, 7.0)
        time.sleep(delay)

    def between_ports(self):
        """Longer pause between processing different ports (6-15 s)."""
        delay = random.uniform(6.0, 15.0)
        time.sleep(delay)


RATE = RateLimiter()

# ---------------------------------------------------------------------------
# Sandbox detection
# ---------------------------------------------------------------------------
_WIKIMEDIA_OK = None


def is_wikimedia_reachable():
    """Check once whether Wikimedia Commons API responds (cached)."""
    global _WIKIMEDIA_OK
    if _WIKIMEDIA_OK is not None:
        return _WIKIMEDIA_OK
    try:
        req = urllib.request.Request(
            "https://commons.wikimedia.org/w/api.php?action=query&format=json",
            headers={"User-Agent": USER_AGENT},
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            _WIKIMEDIA_OK = resp.status == 200
    except Exception:
        _WIKIMEDIA_OK = False
    if not _WIKIMEDIA_OK:
        print("ℹ  Wikimedia Commons API not reachable (sandbox / egress block).")
        print("   Flickr public feed will be the primary image source.\n")
    else:
        print("ℹ  Wikimedia Commons API is reachable — will use as fallback.\n")
    return _WIKIMEDIA_OK


# ---------------------------------------------------------------------------
# Port search terms  (merged from all three legacy scripts)
# ---------------------------------------------------------------------------
PORT_SEARCH_TERMS = {
    # ── Caribbean ─────────────────────────────────────────────────────────
    "amber-cove": ["Amber Cove Dominican Republic", "Puerto Plata cruise port", "Amber Cove pool"],
    "antigua": ["St Johns Antigua harbor", "English Harbour Antigua", "Antigua cruise port"],
    "aruba": ["Oranjestad Aruba", "Aruba cruise terminal", "Eagle Beach Aruba"],
    "barbados": ["Bridgetown Barbados", "Harrison's Cave Barbados", "Carlisle Bay Barbados"],
    "bimini": ["Bimini Bahamas beach", "Bimini islands aerial", "Bimini turquoise water"],
    "cozumel": ["Cozumel Mexico beach", "Cozumel cruise port", "San Miguel Cozumel"],
    "curacao": ["Willemstad Curacao colorful", "Curacao harbor", "Queen Emma Bridge"],
    "falmouth": ["Falmouth Jamaica", "Dunn's River Falls Jamaica", "Jamaica cruise port"],
    "falmouth-jamaica": ["Falmouth Jamaica historic", "Falmouth cruise port Jamaica", "Water Square Falmouth"],
    "freeport": ["Freeport Bahamas", "Lucaya beach Grand Bahama", "Port Lucaya marketplace"],
    "grand-cayman": ["George Town Grand Cayman", "Seven Mile Beach Cayman", "Stingray City"],
    "grenada": ["St Georges Grenada harbor", "Grenada spice island", "Grand Anse Beach"],
    "harvest-caye": ["Harvest Caye Belize", "Belize cruise island", "Harvest Caye beach"],
    "nassau": ["Nassau Bahamas harbor", "Nassau cruise port", "Paradise Island Bahamas"],
    "ocho-rios": ["Ocho Rios Jamaica", "Dunn's River Falls Ocho Rios", "Ocho Rios cruise port"],
    "philipsburg": ["Philipsburg Sint Maarten boardwalk", "Great Bay St Maarten", "Maho Beach planes"],
    "puerto-limon": ["Puerto Limon Costa Rica", "Limon Costa Rica harbor", "Tortuguero Costa Rica"],
    "royal-beach-club-antigua": ["Antigua beach resort", "Fort James Beach Antigua", "Antigua turquoise water"],
    "royal-beach-club-cozumel": ["Cozumel beach club", "Cozumel Mexico resort", "Cozumel snorkeling"],
    "san-juan": ["Old San Juan Puerto Rico", "El Morro San Juan", "San Juan cruise port"],
    "st-croix": ["St Croix USVI", "Christiansted St Croix harbor", "Buck Island St Croix"],
    "st-john-usvi": ["St John USVI", "Trunk Bay St John", "Virgin Islands National Park"],
    "st-lucia": ["Pitons St Lucia", "Castries harbor St Lucia", "Sugar Beach St Lucia"],
    "st-maarten": ["Philipsburg Sint Maarten", "Great Bay St Maarten", "Maho Beach planes"],
    "st-thomas": ["Charlotte Amalie harbor", "St Thomas USVI", "Magens Bay beach"],

    # ── US Homeports & East Coast ─────────────────────────────────────────
    "baltimore": ["Baltimore Inner Harbor", "Fort McHenry Baltimore", "Maryland crabs"],
    "bar-harbor": ["Bar Harbor Maine", "Acadia National Park", "Cadillac Mountain sunrise"],
    "boston": ["Boston harbor waterfront", "Faneuil Hall Boston", "Freedom Trail Boston"],
    "cape-liberty": ["Cape Liberty cruise port Bayonne", "Bayonne New Jersey waterfront", "Statue of Liberty New York"],
    "charleston": ["Charleston South Carolina waterfront", "Rainbow Row Charleston", "Fort Sumter"],
    "ft-lauderdale": ["Fort Lauderdale beach", "Port Everglades cruise", "Las Olas Boulevard"],
    "galveston": ["Galveston Texas beach", "Galveston cruise terminal", "The Strand Galveston"],
    "honolulu": ["Honolulu Waikiki beach", "Diamond Head Hawaii", "Aloha Tower harbor"],
    "jacksonville": ["Jacksonville Florida skyline", "Jacksonville Beach pier", "St Johns River Jacksonville"],
    "los-angeles": ["Los Angeles cruise terminal", "Santa Monica pier", "Long Beach harbor"],
    "miami": ["Miami Beach skyline", "Port Miami cruise ships", "South Beach Miami"],
    "mobile": ["Mobile Alabama waterfront", "USS Alabama battleship", "Mobile Bay sunset"],
    "new-orleans": ["New Orleans French Quarter", "Mississippi River steamboat", "Jackson Square"],
    "norfolk": ["Norfolk Virginia waterfront", "USS Wisconsin Norfolk", "Nauticus Norfolk"],
    "port-canaveral": ["Port Canaveral Florida cruise", "Cocoa Beach pier", "Kennedy Space Center"],
    "port-everglades": ["Port Everglades cruise ships", "Fort Lauderdale port", "Port Everglades aerial"],
    "port-miami": ["Port Miami cruise terminal", "Miami cruise port aerial", "Biscayne Bay Miami"],
    "san-francisco": ["San Francisco Golden Gate", "Fisherman's Wharf San Francisco", "Alcatraz Island"],
    "seattle": ["Seattle skyline Space Needle", "Pike Place Market Seattle", "Seattle waterfront"],
    "tampa": ["Tampa Florida skyline", "Port Tampa Bay cruise", "Ybor City Tampa historic"],

    # ── Canada ────────────────────────────────────────────────────────────
    "montreal": ["Montreal Old Port harbor", "Notre Dame Basilica Montreal", "Montreal skyline"],
    "vancouver": ["Vancouver Canada Place cruise", "Stanley Park Vancouver", "Vancouver skyline mountains"],

    # ── Europe — Western ──────────────────────────────────────────────────
    "amsterdam": ["Amsterdam canals boats", "Rijksmuseum Amsterdam", "Anne Frank House"],
    "barcelona": ["La Sagrada Familia Barcelona", "Las Ramblas Barcelona", "Barcelona port"],
    "bordeaux": ["Bordeaux France wine", "Place de la Bourse Bordeaux", "Garonne River"],
    "cannes": ["Cannes France Croisette", "Cannes harbor yachts", "Cannes film festival"],
    "lisbon": ["Lisbon Belem Tower", "Lisbon harbor tram", "Alfama Lisbon"],
    "marseille": ["Vieux Port Marseille", "Notre Dame de la Garde Marseille", "Calanques"],
    "portimao": ["Portimao Portugal Algarve", "Praia da Rocha Portimao", "Portimao harbor"],

    # ── Europe — Northern ─────────────────────────────────────────────────
    "akureyri": ["Akureyri Iceland", "Akureyri harbor church", "Godafoss waterfall Iceland"],
    "alesund": ["Alesund Norway Art Nouveau", "Aksla viewpoint Alesund", "Alesund harbor"],
    "bergen": ["Bergen Norway Bryggen", "Bergen harbor fish market", "Floyen Bergen"],
    "copenhagen": ["Nyhavn Copenhagen colorful", "Copenhagen harbor", "Tivoli Gardens"],
    "dublin": ["Dublin Ireland Temple Bar", "Ha'penny Bridge Dublin", "Trinity College Dublin"],
    "edinburgh": ["Edinburgh Castle Scotland", "Royal Mile Edinburgh", "Arthur's Seat"],
    "honningsvag": ["Honningsvag Norway", "North Cape Nordkapp", "Honningsvag harbor Arctic"],
    "klaipeda": ["Klaipeda Lithuania old town", "Curonian Spit Lithuania", "Klaipeda harbor"],
    "olden": ["Olden Norway fjord", "Briksdal Glacier Olden", "Nordfjord Norway"],
    "reykjavik": ["Reykjavik Iceland harbor", "Hallgrimskirkja church", "Reykjavik colorful houses"],
    "rostock": ["Rostock Germany harbor", "Warnemunde lighthouse", "Warnemunde beach promenade"],
    "stockholm": ["Stockholm Gamla Stan", "Stockholm harbor", "Vasa Museum Stockholm"],

    # ── Europe — Mediterranean ────────────────────────────────────────────
    "amalfi": ["Amalfi Coast Italy", "Positano Italy colorful", "Amalfi Cathedral"],
    "athens": ["Acropolis Athens Greece", "Parthenon Athens", "Plaka Athens"],
    "catania": ["Catania Sicily Mount Etna", "Catania fish market Sicily", "Piazza del Duomo Catania"],
    "dubrovnik": ["Dubrovnik walls Croatia", "Dubrovnik old town", "Stradun Dubrovnik"],
    "genoa": ["Genoa Italy harbor", "Via Garibaldi Genoa", "Genoa old town"],
    "gibraltar": ["Rock of Gibraltar", "Gibraltar harbor", "Gibraltar monkeys"],
    "gijon": ["Gijon Spain beach", "Gijon old town Cimadevilla", "Gijon harbor Asturias"],
    "hvar": ["Hvar Croatia harbor", "Hvar town fortress", "Hvar lavender fields"],
    "la-spezia": ["La Spezia Italy harbor", "Cinque Terre Italy", "Portovenere La Spezia"],
    "limassol": ["Limassol Cyprus harbor", "Limassol old town", "Kourion ancient Cyprus"],
    "monte-carlo": ["Monte Carlo Monaco harbor", "Casino Monte Carlo", "Monaco Grand Prix"],
    "mykonos": ["Mykonos Greece windmills", "Little Venice Mykonos", "Mykonos white buildings"],
    "naples": ["Naples harbor Vesuvius", "Naples Italy pizza", "Spaccanapoli Naples"],
    "patmos": ["Patmos Greece monastery", "Patmos harbor Skala", "Cave of Apocalypse Patmos"],
    "rhodes": ["Rhodes medieval town", "Palace of Grand Master Rhodes", "Lindos Rhodes"],
    "rome": ["Civitavecchia port Rome", "Rome Colosseum", "Trevi Fountain Rome"],
    "santorini": ["Santorini Oia blue dome", "Santorini caldera view", "Fira Santorini"],
    "sorrento": ["Sorrento Italy coast", "Sorrento harbor Marina Grande", "Sorrento lemon groves"],
    "venice": ["Venice Grand Canal gondola", "St Mark's Basilica Venice", "Rialto Bridge Venice"],
    "zakynthos": ["Zakynthos Navagio Beach", "Zakynthos blue caves Greece", "Zakynthos harbor town"],

    # ── Europe — Other ────────────────────────────────────────────────────
    "ajaccio": ["Ajaccio Corsica harbor", "Napoleon birthplace Ajaccio", "Maison Bonaparte"],
    "bodrum": ["Bodrum Turkey castle", "Bodrum harbor", "Bodrum Turkey beach"],
    "corfu": ["Corfu Greece old town", "Corfu harbor fortress", "Achilleion Palace Corfu"],

    # ── Canary Islands / Atlantic Islands ─────────────────────────────────
    "gran-canaria": ["Las Palmas Gran Canaria harbor", "Maspalomas dunes Gran Canaria", "Gran Canaria beach"],
    "ponta-delgada": ["Ponta Delgada Azores harbor", "Sete Cidades Azores crater", "Azores Portugal"],
    "st-helena": ["St Helena island", "Jamestown St Helena", "Napoleon exile St Helena"],

    # ── Middle East ───────────────────────────────────────────────────────
    "abu-dhabi": ["Abu Dhabi Sheikh Zayed Mosque", "Abu Dhabi skyline", "Abu Dhabi cruise terminal"],
    "alexandria": ["Alexandria Egypt harbor", "Bibliotheca Alexandrina", "Citadel of Qaitbay"],
    "dubai": ["Dubai skyline Burj Khalifa", "Dubai cruise terminal", "Palm Jumeirah aerial"],
    "muscat": ["Muscat Oman harbor", "Sultan Qaboos Grand Mosque", "Mutrah Souq Muscat"],
    "safaga": ["Safaga Egypt Red Sea", "Hurghada Egypt resort", "Luxor temple Egypt"],
    "salalah": ["Salalah Oman", "Salalah frankincense Oman", "Al Baleed Salalah beach"],

    # ── Africa ────────────────────────────────────────────────────────────
    "agadir": ["Agadir Morocco beach", "Agadir Kasbah ruins", "Agadir harbor Morocco"],
    "mauritius": ["Mauritius island beach", "Port Louis Mauritius harbor", "Le Morne Brabant Mauritius"],
    "port-elizabeth": ["Port Elizabeth South Africa beach", "Addo Elephant Park", "Gqeberha waterfront"],
    "seychelles": ["Seychelles beach granite rocks", "Mahe Seychelles harbor", "Anse Source d'Argent"],

    # ── Alaska ────────────────────────────────────────────────────────────
    "glacier-bay": ["Glacier Bay Alaska", "Margerie Glacier", "Glacier Bay cruise ship"],
    "juneau": ["Juneau Alaska harbor", "Mendenhall Glacier Juneau", "Juneau cruise port"],
    "ketchikan": ["Ketchikan Creek Street", "Ketchikan harbor Alaska", "Totem poles Ketchikan"],
    "sitka": ["Sitka Alaska harbor", "Russian Orthodox church Sitka", "Sitka National Park"],
    "skagway": ["Skagway Alaska", "White Pass Yukon Route train", "Skagway cruise port"],

    # ── Asia — East ───────────────────────────────────────────────────────
    "beijing": ["Beijing Great Wall China", "Forbidden City Beijing", "Temple of Heaven Beijing"],
    "busan": ["Busan South Korea harbor", "Gamcheon Culture Village Busan", "Haeundae Beach Busan"],
    "fukuoka": ["Fukuoka Japan harbor", "Dazaifu shrine Fukuoka", "Canal City Fukuoka"],
    "hakodate": ["Hakodate Japan harbor night", "Mount Hakodate night view", "Hakodate morning market"],
    "hiroshima": ["Hiroshima Peace Memorial", "Itsukushima shrine torii", "Hiroshima Japan"],
    "hong-kong": ["Victoria Harbour Hong Kong skyline", "Hong Kong harbor night", "Star Ferry Hong Kong"],
    "kagoshima": ["Kagoshima Japan Sakurajima volcano", "Kagoshima harbor", "Sengan-en garden Kagoshima"],
    "kyoto": ["Kyoto Japan Fushimi Inari", "Kinkaku-ji Golden Pavilion Kyoto", "Arashiyama bamboo Kyoto"],
    "nagasaki": ["Nagasaki Japan harbor", "Nagasaki Peace Park", "Glover Garden Nagasaki"],
    "okinawa": ["Okinawa Japan Shuri Castle", "Okinawa beach tropical", "Naha Okinawa harbor"],
    "osaka": ["Osaka Castle Japan", "Dotonbori Osaka neon", "Osaka harbor cruise terminal"],
    "shanghai": ["Shanghai Bund skyline", "Oriental Pearl Tower Shanghai", "Yu Garden Shanghai"],
    "taipei": ["Taipei 101 Taiwan", "Jiufen old street Taiwan", "Keelung harbor Taiwan"],
    "tianjin": ["Tianjin China Eye Ferris wheel", "Tianjin Italian Quarter", "Tianjin harbor cruise port"],
    "tokyo": ["Tokyo Bay Rainbow Bridge", "Senso-ji temple Tokyo", "Shibuya crossing Tokyo"],

    # ── Asia — Southeast ──────────────────────────────────────────────────
    "bali": ["Bali Indonesia temple", "Tanah Lot Bali", "Bali rice terraces Ubud"],
    "bangkok": ["Grand Palace Bangkok", "Wat Arun Bangkok", "Chao Phraya River Bangkok"],
    "ho-chi-minh-city": ["Ho Chi Minh City Saigon", "Notre Dame Cathedral Saigon", "Ben Thanh Market"],
    "phuket": ["Phuket Thailand beach", "Patong Beach Phuket", "Phuket old town"],
    "sihanoukville": ["Sihanoukville Cambodia beach", "Sihanoukville harbor", "Otres Beach Cambodia"],
    "singapore": ["Marina Bay Sands Singapore", "Singapore harbor skyline", "Gardens by the Bay"],

    # ── India ─────────────────────────────────────────────────────────────
    "mumbai": ["Gateway of India Mumbai", "Mumbai harbor skyline", "Marine Drive Mumbai"],

    # ── Australia ─────────────────────────────────────────────────────────
    "adelaide": ["Adelaide Australia city", "Adelaide Oval", "Barossa Valley wine South Australia"],
    "brisbane": ["Brisbane Australia river", "South Bank Brisbane", "Story Bridge Brisbane"],
    "fremantle": ["Fremantle Western Australia harbor", "Fremantle Markets", "Fremantle prison"],
    "hobart": ["Hobart Tasmania harbor", "Salamanca Market Hobart", "Mount Wellington Hobart"],
    "melbourne": ["Melbourne Australia skyline", "Flinders Street Station Melbourne", "Melbourne harbor"],
    "sydney": ["Sydney Opera House harbor", "Sydney Harbour Bridge", "Circular Quay Sydney"],

    # ── New Zealand ───────────────────────────────────────────────────────
    "akaroa": ["Akaroa New Zealand harbor", "Banks Peninsula", "Hector's dolphin Akaroa"],
    "doubtful-sound": ["Doubtful Sound New Zealand", "Doubtful Sound Fiordland", "Deep Cove Doubtful Sound"],
    "dunedin": ["Dunedin New Zealand railway station", "Otago Peninsula wildlife", "Larnach Castle Dunedin"],
    "lyttelton": ["Lyttelton New Zealand harbor", "Christchurch New Zealand", "Banks Peninsula Canterbury"],
    "milford-sound": ["Milford Sound New Zealand", "Mitre Peak Milford Sound", "Fiordland National Park"],
    "napier": ["Napier New Zealand Art Deco", "Napier harbor Hawke's Bay", "Marine Parade Napier"],
    "picton": ["Picton New Zealand harbor", "Queen Charlotte Sound Marlborough", "Picton ferry terminal"],
    "tauranga": ["Tauranga New Zealand harbor", "Mount Maunganui beach", "Bay of Plenty New Zealand"],

    # ── Pacific Islands ───────────────────────────────────────────────────
    "airlie-beach": ["Whitsunday Islands", "Whitehaven Beach aerial", "Great Barrier Reef"],
    "aitutaki": ["Aitutaki lagoon Cook Islands", "One Foot Island", "Cook Islands beach"],
    "bora-bora": ["Bora Bora lagoon aerial", "Mount Otemanu Bora Bora", "Bora Bora overwater bungalow"],
    "guam": ["Guam beach tropical", "Two Lovers Point Guam", "Tumon Bay Guam"],
    "maldives": ["Maldives overwater villa", "Maldives turquoise lagoon", "Male Maldives harbor"],
    "palau": ["Palau Rock Islands aerial", "Jellyfish Lake Palau", "Palau Micronesia coral"],
    "papeete": ["Papeete Tahiti harbor", "Tahiti French Polynesia beach", "Moorea island view"],
    "saipan": ["Saipan Mariana Islands beach", "Managaha Island Saipan", "Saipan grotto diving"],
    "suva": ["Suva Fiji harbor", "Fiji Islands beach tropical", "Suva market Fiji"],
    "tonga": ["Tonga islands tropical", "Nuku'alofa Tonga harbor", "Tonga whale watching"],
    "vanuatu": ["Vanuatu beach tropical", "Port Vila Vanuatu harbor", "Efate island Vanuatu"],

    # ── Hawaii ────────────────────────────────────────────────────────────
    "honolulu": ["Honolulu Waikiki beach", "Diamond Head Hawaii", "Aloha Tower harbor"],
    "maui": ["Maui Hawaii beach", "Lahaina harbor Maui", "Haleakala Maui"],

    # ── Mexico ────────────────────────────────────────────────────────────
    "manzanillo": ["Manzanillo Colima Mexico", "Manzanillo bay aerial", "Las Hadas Manzanillo"],
    "mazatlan": ["Mazatlan Mexico skyline", "Mazatlan malecon boardwalk", "Old Mazatlan historic"],
    "progreso": ["Progreso Yucatan Mexico pier", "Chichen Itza pyramid", "Merida cathedral Yucatan"],
    "zihuatanejo": ["Zihuatanejo bay Mexico", "Playa La Ropa Zihuatanejo", "Zihuatanejo fishing boats"],

    # ── Central America / Panama ──────────────────────────────────────────
    "gatun-lake": ["Gatun Lake Panama Canal", "Panama Canal locks ship", "Panama Canal aerial"],

    # ── South America ─────────────────────────────────────────────────────
    "callao": ["Callao Peru harbor", "Lima Peru Plaza Mayor", "Miraflores Lima coast"],
    "cartagena": ["Cartagena Colombia walled city", "Castillo San Felipe Cartagena", "Getsemani street art"],
    "fortaleza": ["Fortaleza Brazil beach", "Praia do Futuro Fortaleza", "Fortaleza harbor Brazil"],
    "guayaquil": ["Guayaquil Ecuador Malecon", "Guayaquil waterfront", "Iguana Park Guayaquil"],
    "manta": ["Manta Ecuador beach", "Manta harbor Ecuador", "Montecristi Panama hats Ecuador"],
    "puerto-madryn": ["Puerto Madryn Argentina", "Peninsula Valdes whales", "Patagonia Argentina coast"],
    "punta-del-este": ["Punta del Este Uruguay", "La Mano sculpture Punta del Este", "Casapueblo Uruguay"],
    "salvador": ["Salvador Bahia Brazil Pelourinho", "Salvador Brazil harbor", "Elevador Lacerda Salvador"],
    "santos": ["Santos Brazil harbor", "Santos coffee museum", "Santos beach promenade"],
    "valparaiso": ["Valparaiso Chile colorful hills", "Valparaiso harbor", "Valparaiso street art Chile"],

    # ── Antarctica & Sub-Antarctic ────────────────────────────────────────
    "antarctica": ["Antarctica Peninsula cruise", "Emperor penguin Antarctica", "Antarctic iceberg"],
    "antarctic-peninsula": ["Antarctic Peninsula expedition", "Gentoo penguin colony", "Antarctica cruise ship"],
    "pitcairn": ["Pitcairn Island South Pacific", "Bounty Bay Pitcairn", "Pitcairn remote island"],
    "south-georgia": ["South Georgia island penguins", "King penguin colony South Georgia", "Grytviken South Georgia"],
    "tristan-da-cunha": ["Tristan da Cunha island", "Edinburgh of Seven Seas", "Tristan da Cunha remote"],
}

# Image type → supplementary Flickr tags
IMAGE_TYPE_TAGS = {
    "hero":       ["panorama", "skyline", "aerial"],
    "harbor":     ["harbor", "port", "cruise", "waterfront"],
    "harbour":    ["harbour", "port", "cruise", "waterfront"],
    "landmark":   ["landmark", "monument", "famous"],
    "beach":      ["beach", "coast", "shore"],
    "street":     ["street", "downtown", "market"],
    "food":       ["food", "cuisine", "restaurant"],
    "panorama":   ["panorama", "aerial", "view"],
    "sunset":     ["sunset", "evening", "golden"],
    "cathedral":  ["cathedral", "church", "basilica"],
    "castle":     ["castle", "fortress", "palace"],
    "market":     ["market", "bazaar", "shopping"],
    "temple":     ["temple", "shrine", "sacred"],
    "museum":     ["museum", "gallery", "art"],
    "bridge":     ["bridge", "crossing", "span"],
    "mountain":   ["mountain", "peak", "volcano"],
    "glacier":    ["glacier", "ice", "frozen"],
    "waterfall":  ["waterfall", "falls", "cascade"],
    "canal":      ["canal", "waterway", "boats"],
}


# ═══════════════════════════════════════════════════════════════════════════
# Flickr public feed  (primary source — sandbox-safe, no API key needed)
# ═══════════════════════════════════════════════════════════════════════════

def flickr_feed_search(tags):
    """Search Flickr public feed by comma-separated tags.
    Returns a list of feed items (dicts)."""
    url = (
        f"{FLICKR_FEED}?tags={urllib.parse.quote(tags)}"
        f"&format=json&nojsoncallback=1&tagmode=all"
    )
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                raw = resp.read().decode("utf-8")
            # Flickr sometimes has unescaped single-quotes in JSON
            raw = raw.replace("\\'", "'")
            data = json.loads(raw)
            return data.get("items", [])
        except Exception as e:
            if attempt < 2:
                time.sleep(random.uniform(3.0, 6.0))
            else:
                print(f"      Flickr feed error: {e}")
    return []


def flickr_search_port(port_slug, queries, used_urls=None):
    """Try multiple Flickr tag combos to find a usable port image.

    Args:
        used_urls: set of URLs already downloaded for this port (to avoid duplicates).
    Returns (large_url, photographer, photo_link) or (None, None, None)."""
    if used_urls is None:
        used_urls = set()

    # Build diverse tag sets from queries
    tag_sets = []
    for query in queries:
        words = query.lower().split()
        tag_sets.append(",".join(words[:4]))
        if len(words) >= 2:
            tag_sets.append(f"{words[0]},{words[-1]}")

    # Deduplicate tag sets
    seen = set()
    unique = []
    for t in tag_sets:
        if t not in seen:
            seen.add(t)
            unique.append(t)

    skip_words = {"icon", "logo", "flag", "map", "diagram", "screenshot",
                  "coat of arms", "stamp", "badge", "emblem"}

    for tags in unique[:6]:
        print(f"      Flickr tags: {tags}")
        items = flickr_feed_search(tags)
        RATE.short_pause()

        if not items:
            continue

        for item in items[:10]:
            media_url = item.get("media", {}).get("m", "")
            if not media_url:
                continue

            title_lower = (item.get("title", "") or "").lower()
            if any(s in title_lower for s in skip_words):
                continue

            # _m.jpg → _b.jpg  (240px → 1024px)
            large_url = (media_url
                         .replace("_m.jpg", "_b.jpg")
                         .replace("_m.png", "_b.png"))

            # Skip photos already used for this port
            if large_url in used_urls:
                continue

            author_raw = item.get("author", "")
            match = re.search(r'\("(.+?)"\)', author_raw)
            photographer = match.group(1) if match else "Unknown"
            photo_link = item.get("link", "")

            return large_url, photographer, photo_link

    return None, None, None


# ═══════════════════════════════════════════════════════════════════════════
# Wikimedia Commons  (fallback — may be blocked in sandbox)
# ═══════════════════════════════════════════════════════════════════════════

def wikimedia_search(query, limit=5):
    """Search Wikimedia Commons for bitmap images.
    Returns list of 'File:...' titles.  Empty list if API unreachable."""
    if not is_wikimedia_reachable():
        return []

    encoded = urllib.parse.quote(query)
    url = (
        f"https://commons.wikimedia.org/w/api.php?"
        f"action=query&list=search&srsearch={encoded}%20filetype:bitmap"
        f"&srnamespace=6&srlimit={limit}&format=json"
    )
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        return [
            item["title"]
            for item in data.get("query", {}).get("search", [])
            if item.get("title", "").startswith("File:")
        ]
    except Exception as e:
        print(f"      Wikimedia search error: {e}")
        return []


def wikimedia_image_info(file_title):
    """Fetch image URL, license, and attribution from Wikimedia Commons.
    Returns info dict or None."""
    if not is_wikimedia_reachable():
        return None

    encoded = urllib.parse.quote(file_title)
    url = (
        f"https://commons.wikimedia.org/w/api.php?"
        f"action=query&titles={encoded}"
        f"&prop=imageinfo&iiprop=url|extmetadata|size"
        f"&iiurlwidth=1200&format=json"
    )
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except Exception:
        return None

    pages = data.get("query", {}).get("pages", {})
    for page_id, page_data in pages.items():
        if page_id == "-1":
            continue
        ii = page_data.get("imageinfo", [{}])[0]
        meta = ii.get("extmetadata", {})

        license_short = meta.get("LicenseShortName", {}).get("value", "Unknown")

        ok_licenses = ["cc by", "cc by-sa", "cc0", "public domain", "pd"]
        if not any(lic in license_short.lower() for lic in ok_licenses):
            continue  # Skip restrictive licenses

        return {
            "url": ii.get("thumburl") or ii.get("url"),
            "width": ii.get("thumbwidth") or ii.get("width", 0),
            "height": ii.get("thumbheight") or ii.get("height", 0),
            "license": license_short,
            "license_url": meta.get("LicenseUrl", {}).get("value", ""),
            "author": meta.get("Artist", {}).get("value", "Unknown"),
            "title": file_title,
            "commons_url": f"https://commons.wikimedia.org/wiki/{encoded}",
        }
    return None


def wikimedia_search_port(port_slug, queries):
    """Try Wikimedia Commons as a fallback for a port image.
    Returns (download_url, info_dict) or (None, None)."""
    for query in queries[:4]:
        print(f"      Wikimedia: {query}")
        titles = wikimedia_search(query, limit=5)
        RATE.short_pause()

        for title in titles:
            info = wikimedia_image_info(title)
            RATE.short_pause()
            if info and info.get("width", 0) >= 800:
                return info["url"], info
    return None, None


# ═══════════════════════════════════════════════════════════════════════════
# Download & conversion
# ═══════════════════════════════════════════════════════════════════════════

def download_image(url, output_path):
    """Download image with retry and exponential back-off."""
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = resp.read()
            if len(data) < 5_000:
                print(f"      Download too small ({len(data)} bytes) — skipping")
                return False
            with open(str(output_path), "wb") as f:
                f.write(data)
            return True
        except Exception as e:
            wait = (attempt + 1) * random.uniform(2.0, 5.0)
            if attempt < 2:
                print(f"      Retry {attempt+1}/3 after {wait:.1f}s — {e}")
                time.sleep(wait)
            else:
                print(f"      Download failed: {e}")
    return False


def convert_to_webp(src_path, dest_path, max_width=1200, quality=82):
    """Convert any image to optimised WebP via Pillow.

    Returns True on success.  Cleans up the source file if it differs
    from the destination.
    """
    src_path, dest_path = Path(src_path), Path(dest_path)

    if not HAS_PILLOW:
        # Best-effort: just rename
        if src_path != dest_path:
            src_path.rename(dest_path)
        return True

    try:
        img = PILImage.open(str(src_path))

        # Validate minimum dimensions
        if img.width < 400 or img.height < 200:
            print(f"      Too small ({img.width}x{img.height}) — skipping")
            if src_path.exists() and src_path != dest_path:
                src_path.unlink()
            return False

        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")

        if img.width > max_width:
            ratio = max_width / img.width
            img = img.resize((max_width, int(img.height * ratio)), PILImage.LANCZOS)

        img.save(str(dest_path), "WebP", quality=quality)

        if src_path.exists() and src_path != dest_path:
            src_path.unlink()

        return True
    except Exception as e:
        print(f"      Conversion failed: {e}")
        if src_path.exists() and src_path != dest_path:
            src_path.unlink()
        return False


# ═══════════════════════════════════════════════════════════════════════════
# Attribution
# ═══════════════════════════════════════════════════════════════════════════

def save_attr_json(webp_path, source_url, photographer, license_info, source_type):
    """Write a {filename}.webp.attr.json next to the image."""
    attr_path = Path(str(webp_path) + ".attr.json")   # e.g. miami-1.webp.attr.json
    data = {
        "source": source_url,
        "license": license_info,
        "author": photographer,
        "source_type": source_type,
        "downloaded": time.strftime("%Y-%m-%d"),
    }
    with open(str(attr_path), "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def append_attribution_csv(img_rel_path, source_url, license_info, photographer, source_type):
    """Append a row to attributions/attributions.csv."""
    ATTR_CSV.parent.mkdir(parents=True, exist_ok=True)
    with open(str(ATTR_CSV), "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([img_rel_path, source_url, license_info, photographer, source_type])


# ═══════════════════════════════════════════════════════════════════════════
# Missing-image detection
# ═══════════════════════════════════════════════════════════════════════════

def count_existing_images(port_slug):
    """Count .webp images already on disk for a port."""
    img_dir = PORTS_IMG_DIR / port_slug
    if not img_dir.is_dir():
        return 0
    return len(list(img_dir.glob("*.webp")))


def find_missing_images(port_slug):
    """Find image filenames referenced in the port's HTML but missing on disk."""
    html_file = PORTS_DIR / f"{port_slug}.html"
    if not html_file.exists():
        return []

    with open(str(html_file), "r", encoding="utf-8") as f:
        html = f.read()

    pattern = rf'/ports/img/{re.escape(port_slug)}/([^"]+\.webp)'
    matches = re.findall(pattern, html)

    missing = []
    seen = set()
    for name in matches:
        if name in seen:
            continue
        seen.add(name)
        if not (PORTS_IMG_DIR / port_slug / name).exists():
            missing.append(name)
    return missing


def find_ports_needing_images(min_needed=1):
    """Scan all port HTML files and return slugs that need images.

    Includes ports where:
    - HTML references images that are missing on disk, OR
    - The port has fewer than 8 images and has search terms configured
    """
    ports = []
    seen = set()
    for html_file in sorted(PORTS_DIR.glob("*.html")):
        slug = html_file.stem
        if slug == "index":
            continue
        missing = find_missing_images(slug)
        if len(missing) >= min_needed:
            ports.append((slug, missing))
            seen.add(slug)
        elif slug not in seen and slug in PORT_SEARCH_TERMS:
            existing = count_existing_images(slug)
            if existing < 8:
                # Port has search terms but HTML doesn't reference images yet;
                # source_port() will generate standard filenames.
                ports.append((slug, []))
                seen.add(slug)
    return ports


# ═══════════════════════════════════════════════════════════════════════════
# Build search queries for a specific image
# ═══════════════════════════════════════════════════════════════════════════

def build_queries(port_slug, img_name=None):
    """Build a list of search queries for a port (optionally for a specific image)."""
    port_name = port_slug.replace("-", " ").title()
    base_terms = PORT_SEARCH_TERMS.get(port_slug, [port_name])

    if img_name:
        # Extract semantic type from filename  e.g. "miami-beach.webp" → "beach"
        stem = img_name.replace(".webp", "").replace(".jpg", "")
        parts = stem.split("-")
        if len(parts) > 1:
            img_type = "-".join(parts[1:])
        else:
            img_type = "hero"

        type_tags = IMAGE_TYPE_TAGS.get(img_type, [img_type.replace("-", " ")])
        queries = []
        for base in base_terms[:3]:
            queries.append(base)
            for tag in type_tags[:2]:
                queries.append(f"{base} {tag}")
        return queries[:8]
    else:
        return base_terms[:6]


# ═══════════════════════════════════════════════════════════════════════════
# Core: source images for one port
# ═══════════════════════════════════════════════════════════════════════════

def source_port(port_slug, dry_run=False, flickr_only=False, max_images=20):
    """Source missing images for a single port.

    Returns (downloaded_count, total_missing).
    """
    missing = find_missing_images(port_slug)
    existing = count_existing_images(port_slug)

    if not missing:
        # If HTML has no image refs but the port needs images, generate standard names
        if existing < 8:
            # Generate standard image names that the port page would use
            standard_types = ["hero", "harbor", "landmark", "attraction-1",
                              "attraction-2", "food", "street", "panorama"]
            missing = [
                f"{port_slug}-{t}.webp"
                for t in standard_types
                if not (PORTS_IMG_DIR / port_slug / f"{port_slug}-{t}.webp").exists()
            ]

    if not missing:
        print(f"  {port_slug}: No images needed (has {existing})")
        return 0, 0

    total_missing = len(missing)
    print(f"  {port_slug}: {total_missing} images needed ({existing} existing)")

    img_dir = PORTS_IMG_DIR / port_slug
    img_dir.mkdir(parents=True, exist_ok=True)

    downloaded = 0
    used_urls = set()     # Track URLs to avoid duplicate downloads within a port
    used_hashes = set()   # Track content hashes to catch identical images from different URLs

    # Pre-compute hashes of existing images so we don't download duplicates of them
    for existing_file in img_dir.glob("*.webp"):
        used_hashes.add(hashlib.md5(existing_file.read_bytes()).hexdigest())

    for img_name in missing[:max_images]:
        queries = build_queries(port_slug, img_name)
        print(f"    → {img_name}")

        # --- Strategy 1: Flickr public feed ---
        url, photographer, photo_link = flickr_search_port(port_slug, queries,
                                                           used_urls=used_urls)

        if url:
            used_urls.add(url)

            if dry_run:
                print(f"      DRY RUN: Would download from {photographer}")
                downloaded += 1
                RATE.between_images()
                continue

            # Download to temp, convert, save
            temp_path = img_dir / f"_temp_{img_name}.jpg"
            final_path = img_dir / img_name

            if download_image(url, temp_path):
                if convert_to_webp(temp_path, final_path):
                    # Content-hash dedup: reject images identical to ones already saved
                    file_hash = hashlib.md5(final_path.read_bytes()).hexdigest()
                    if file_hash in used_hashes:
                        print(f"      ⊘ Skipped (duplicate content of existing image)")
                        final_path.unlink()
                        attr_json = final_path.parent / f"{final_path.name}.attr.json"
                        if attr_json.exists():
                            attr_json.unlink()
                        RATE.between_images()
                        continue

                    used_hashes.add(file_hash)
                    save_attr_json(final_path, photo_link, photographer,
                                   "Flickr (verify license)", "Flickr public feed")
                    rel_path = f"/ports/img/{port_slug}/{img_name}"
                    append_attribution_csv(rel_path, photo_link,
                                           "Flickr (verify license)", photographer,
                                           "Flickr public feed")
                    print(f"      ✓ Downloaded from {photographer}")
                    downloaded += 1
                    RATE.between_images()
                    continue
                else:
                    # Conversion failed — clean up
                    if temp_path.exists():
                        temp_path.unlink()

        # --- Strategy 2: Wikimedia Commons fallback ---
        if not flickr_only:
            wiki_url, wiki_info = wikimedia_search_port(port_slug, queries)

            if wiki_url:
                if dry_run:
                    print(f"      DRY RUN: Would download from Wikimedia")
                    downloaded += 1
                    RATE.between_images()
                    continue

                temp_path = img_dir / f"_temp_{img_name}.jpg"
                final_path = img_dir / img_name

                if download_image(wiki_url, temp_path):
                    if convert_to_webp(temp_path, final_path):
                        # Content-hash dedup for Wikimedia too
                        file_hash = hashlib.md5(final_path.read_bytes()).hexdigest()
                        if file_hash in used_hashes:
                            print(f"      ⊘ Skipped (duplicate content of existing image)")
                            final_path.unlink()
                            RATE.between_images()
                            continue

                        used_hashes.add(file_hash)
                        license_str = wiki_info.get("license", "CC")
                        author = wiki_info.get("author", "Unknown")
                        source = wiki_info.get("commons_url", wiki_url)
                        save_attr_json(final_path, source, author,
                                       license_str, "Wikimedia Commons")
                        rel_path = f"/ports/img/{port_slug}/{img_name}"
                        append_attribution_csv(rel_path, source,
                                               license_str, author,
                                               "Wikimedia Commons")
                        print(f"      ✓ Downloaded from Wikimedia ({license_str})")
                        downloaded += 1
                        RATE.between_images()
                        continue

        print(f"      ✗ No image found")
        RATE.between_images()

    return downloaded, total_missing


# ═══════════════════════════════════════════════════════════════════════════
# Progress tracking
# ═══════════════════════════════════════════════════════════════════════════

def load_progress():
    if PROGRESS_FILE.exists():
        with open(str(PROGRESS_FILE)) as f:
            return json.load(f)
    return {"completed": [], "failed": [], "partial": []}


def save_progress(progress):
    with open(str(PROGRESS_FILE), "w") as f:
        json.dump(progress, f, indent=2)


# ═══════════════════════════════════════════════════════════════════════════
# CLI entry point
# ═══════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description="Unified image sourcer for In the Wake port pages",
        epilog="Soli Deo Gloria",
    )
    parser.add_argument("ports", nargs="*", help="Specific port slugs to process")
    parser.add_argument("--dry-run", action="store_true",
                        help="Search but don't download")
    parser.add_argument("--flickr-only", action="store_true",
                        help="Skip Wikimedia Commons fallback entirely")
    parser.add_argument("--limit", type=int, default=0,
                        help="Max number of ports to process (0 = all)")
    parser.add_argument("--needed", type=int, default=1,
                        help="Only ports needing at least N images (default 1)")
    parser.add_argument("--resume", action="store_true",
                        help="Skip ports already completed in a previous run")
    parser.add_argument("--max-per-port", type=int, default=20,
                        help="Max images to download per port (default 20)")
    args = parser.parse_args()

    print("=" * 70)
    print("  In the Wake — Unified Image Sourcer")
    print("  Soli Deo Gloria")
    print("=" * 70)
    if args.dry_run:
        print("  MODE: Dry run (no files will be downloaded)\n")
    if args.flickr_only:
        print("  MODE: Flickr only (Wikimedia fallback disabled)\n")

    # Check sandbox / Wikimedia reachability
    if not args.flickr_only:
        is_wikimedia_reachable()

    # Build port list
    progress = load_progress() if args.resume else {"completed": [], "failed": [], "partial": []}

    if args.ports:
        port_list = [(p, find_missing_images(p)) for p in args.ports]
    else:
        port_list = find_ports_needing_images(min_needed=args.needed)

    if args.resume:
        port_list = [(s, m) for s, m in port_list if s not in progress["completed"]]

    if args.limit > 0:
        port_list = port_list[:args.limit]

    print(f"  Ports to process: {len(port_list)}\n")

    if not port_list:
        print("  Nothing to do — all ports have their images.")
        return

    total_downloaded = 0
    total_missing = 0
    results = []

    for i, (slug, _missing) in enumerate(port_list):
        print(f"\n{'─' * 60}")
        print(f"  [{i+1}/{len(port_list)}] {slug}")
        print(f"{'─' * 60}")

        try:
            dl, miss = source_port(slug, dry_run=args.dry_run,
                                   flickr_only=args.flickr_only,
                                   max_images=args.max_per_port)
        except Exception as e:
            print(f"  ERROR: {e}")
            dl, miss = 0, 0
            progress["failed"].append(slug)

        total_downloaded += dl
        total_missing += miss

        if miss > 0 and dl == miss:
            progress["completed"].append(slug)
            results.append((slug, dl, miss, "COMPLETE"))
        elif dl > 0:
            progress["partial"].append(slug)
            results.append((slug, dl, miss, "PARTIAL"))
        else:
            progress["failed"].append(slug)
            results.append((slug, dl, miss, "FAILED"))

        # Save progress periodically
        if not args.dry_run and (i + 1) % 3 == 0:
            save_progress(progress)

        # Human-like pause between ports
        if i < len(port_list) - 1:
            RATE.between_ports()

    if not args.dry_run:
        save_progress(progress)

    # Summary
    print(f"\n{'═' * 70}")
    print(f"  SUMMARY")
    print(f"{'═' * 70}")
    print(f"  Ports processed: {len(port_list)}")
    print(f"  Images downloaded: {total_downloaded}")
    print(f"  Images needed: {total_missing}")
    print(f"  Requests made: {RATE.request_count}")
    print(f"  Elapsed: {time.time() - RATE.session_start:.0f}s")
    print()

    complete = [r for r in results if r[3] == "COMPLETE"]
    partial = [r for r in results if r[3] == "PARTIAL"]
    failed = [r for r in results if r[3] == "FAILED"]

    if complete:
        print(f"  ✓ Complete ({len(complete)}):")
        for slug, dl, miss, _ in complete:
            print(f"      {slug}: {dl}/{miss}")
    if partial:
        print(f"  ◐ Partial ({len(partial)}):")
        for slug, dl, miss, _ in partial:
            print(f"      {slug}: {dl}/{miss}")
    if failed:
        print(f"  ✗ Failed ({len(failed)}):")
        for slug, dl, miss, _ in failed:
            print(f"      {slug}: {dl}/{miss}")

    print(f"\n  Soli Deo Gloria")
    print(f"{'═' * 70}")


if __name__ == "__main__":
    main()
