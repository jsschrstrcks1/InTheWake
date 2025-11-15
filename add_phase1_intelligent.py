#!/usr/bin/env python3
"""
Intelligent AI Breadcrumbs & Person Schema Generator
Analyzes each page's actual content to generate customized metadata
"""

import argparse
import re
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Optional
import shutil

try:
    from bs4 import BeautifulSoup, Comment
except ImportError:
    print("ERROR: BeautifulSoup4 not found. Install with: pip install beautifulsoup4")
    sys.exit(1)


class PageAnalyzer:
    """Intelligent page content analyzer and metadata extractor"""

    def __init__(self, filepath: Path, soup: BeautifulSoup):
        self.filepath = filepath
        self.soup = soup
        self.metadata = {}

    def analyze(self) -> Dict:
        """Main analysis method - extracts all relevant metadata"""
        self.metadata = {
            'filepath': str(self.filepath),
            'relative_path': str(self.filepath.relative_to(self.filepath.parent.parent)),
            'title': self._extract_title(),
            'h1': self._extract_h1(),
            'meta_description': self._extract_meta_description(),
            'canonical': self._extract_canonical(),
            'first_paragraph': self._extract_first_paragraph(),
            'existing_schema': self._extract_existing_schema(),
            'existing_author': self._detect_existing_author(),
        }

        # Detect page type and extract type-specific data
        page_type_data = self._detect_page_type()
        self.metadata.update(page_type_data)

        # Generate custom fields
        self.metadata['updated'] = datetime.now().strftime('%Y-%m-%d')
        self.metadata['answer_first'] = self._generate_answer_first()
        self.metadata['expertise'] = self._generate_expertise()
        self.metadata['target_audience'] = self._generate_target_audience()

        return self.metadata

    def _extract_title(self) -> str:
        """Extract page title"""
        title_tag = self.soup.find('title')
        return title_tag.get_text(strip=True) if title_tag else ''

    def _extract_h1(self) -> str:
        """Extract main heading"""
        h1_tag = self.soup.find('h1')
        return h1_tag.get_text(strip=True) if h1_tag else ''

    def _extract_meta_description(self) -> str:
        """Extract meta description"""
        meta = self.soup.find('meta', attrs={'name': 'description'})
        return meta.get('content', '').strip() if meta else ''

    def _extract_canonical(self) -> str:
        """Extract canonical URL"""
        link = self.soup.find('link', attrs={'rel': 'canonical'})
        return link.get('href', '').strip() if link else ''

    def _extract_first_paragraph(self) -> str:
        """Extract first meaningful paragraph"""
        # Try main content areas first
        main_content = self.soup.find(['main', 'article', 'div'], class_=re.compile(r'content|main|body', re.I))
        if main_content:
            p = main_content.find('p')
            if p:
                text = p.get_text(strip=True)
                if len(text) > 30:  # Meaningful paragraph
                    return text[:200]  # First 200 chars

        # Fallback to any paragraph
        for p in self.soup.find_all('p'):
            text = p.get_text(strip=True)
            if len(text) > 30:
                return text[:200]

        return ''

    def _extract_existing_schema(self) -> Dict:
        """Extract existing schema.org data"""
        schemas = {}

        # Find all script tags with type application/ld+json
        for script in self.soup.find_all('script', type='application/ld+json'):
            try:
                import json
                data = json.loads(script.string)
                if isinstance(data, dict):
                    schema_type = data.get('@type', '')
                    schemas[schema_type] = data
                elif isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict):
                            schema_type = item.get('@type', '')
                            schemas[schema_type] = item
            except:
                pass

        return schemas

    def _detect_existing_author(self) -> Optional[str]:
        """Detect author from existing Article schema"""
        schemas = self.metadata.get('existing_schema', {})

        if 'Article' in schemas:
            author = schemas['Article'].get('author', {})
            if isinstance(author, dict):
                name = author.get('name', '')
                if 'Tina' in name or 'Maulsby' in name:
                    return 'Tina Maulsby'

        return None

    def _detect_page_type(self) -> Dict:
        """Detect page type from path and content"""
        # Use relative path for consistent detection
        try:
            path_str = str(self.filepath.relative_to(Path('/home/user/InTheWake')))
        except ValueError:
            path_str = str(self.filepath)

        # Normalize path for consistent checking (add leading / if not present)
        if not path_str.startswith('/'):
            path_str = '/' + path_str

        if '/ships/' in path_str and not path_str.endswith('ships.html'):
            return self._analyze_ship_page()
        elif '/restaurants/' in path_str and not path_str.endswith('restaurants.html'):
            return self._analyze_restaurant_page()
        elif '/cruise-lines/' in path_str and not path_str.endswith('cruise-lines.html'):
            return self._analyze_cruise_line_page()
        elif '/solo/' in path_str:
            return self._analyze_solo_page()
        elif '/accessibility/' in path_str:
            return self._analyze_accessibility_page()
        elif '/planning/' in path_str or path_str.endswith('planning.html'):
            return self._analyze_planning_page()
        elif path_str.endswith(('ships.html', 'restaurants.html', 'cruise-lines.html')):
            return self._analyze_hub_page()
        else:
            return self._analyze_generic_page()

    def _analyze_ship_page(self) -> Dict:
        """Analyze ship-specific page"""
        data = {
            'page_type': 'Ship Information Page',
            'parent': '/ships.html',
            'category': 'Royal Caribbean Fleet',
        }

        # Extract ship name
        ship_name = self._extract_ship_name()
        data['entity'] = ship_name

        # Extract ship class
        ship_class = self._extract_ship_class()
        if ship_class:
            data['ship_class'] = ship_class

        # Detect cruise line
        cruise_line = self._detect_cruise_line()
        if cruise_line:
            data['cruise_line'] = cruise_line
            data['category'] = f"{cruise_line} Fleet"

        return data

    def _analyze_restaurant_page(self) -> Dict:
        """Analyze restaurant/dining venue page"""
        data = {
            'page_type': 'Restaurant/Dining Venue',
            'parent': '/restaurants.html',
        }

        # Extract venue name
        venue_name = self._extract_venue_name()
        data['entity'] = venue_name

        # Detect venue type
        venue_type = self._detect_venue_type()
        data['category'] = venue_type

        # Detect cruise line and ship class
        cruise_line = self._detect_cruise_line()
        if cruise_line:
            data['cruise_line'] = cruise_line

        ship_class = self._extract_ship_class()
        if ship_class:
            data['ship_class'] = ship_class

        return data

    def _analyze_cruise_line_page(self) -> Dict:
        """Analyze cruise line comparison page"""
        data = {
            'page_type': 'Cruise Line Comparison',
            'parent': '/cruise-lines.html',
            'category': 'Cruise Line Information',
        }

        # Extract cruise line name from title or h1
        cruise_line = self._extract_cruise_line_name()
        data['entity'] = cruise_line

        return data

    def _analyze_solo_page(self) -> Dict:
        """Analyze solo travel page"""
        data = {
            'page_type': 'Solo Travel Guide/Article',
            'parent': '/solo.html',
            'category': 'Solo Cruising',
        }

        # Extract entity from title
        entity = self._extract_entity_from_title()
        data['entity'] = entity

        return data

    def _analyze_accessibility_page(self) -> Dict:
        """Analyze accessibility page"""
        data = {
            'page_type': 'Accessibility Guide',
            'parent': '/accessibility.html',
            'category': 'Accessible Cruising',
        }

        entity = self._extract_entity_from_title()
        data['entity'] = entity

        return data

    def _analyze_planning_page(self) -> Dict:
        """Analyze planning/tools page"""
        data = {
            'page_type': 'Planning Guide/Tool',
            'parent': '/planning.html',
            'category': 'Planning Tools',
        }

        entity = self._extract_entity_from_title()
        data['entity'] = entity

        return data

    def _analyze_hub_page(self) -> Dict:
        """Analyze hub/index page"""
        data = {
            'page_type': 'Hub/Index Page',
            'parent': '/',
        }

        # Determine category from filename
        filename = self.filepath.name
        if 'ships' in filename:
            data['category'] = 'Ship Database'
            data['entity'] = 'Ships Overview'
        elif 'restaurants' in filename:
            data['category'] = 'Dining Directory'
            data['entity'] = 'Restaurants Overview'
        elif 'cruise-lines' in filename:
            data['category'] = 'Cruise Line Directory'
            data['entity'] = 'Cruise Lines Overview'
        elif 'planning' in filename:
            data['category'] = 'Planning Tools'
            data['entity'] = 'Planning Overview'
        elif 'solo' in filename:
            data['category'] = 'Solo Travel Hub'
            data['entity'] = 'Solo Cruising Overview'
        else:
            entity = self._extract_entity_from_title()
            data['entity'] = entity
            data['category'] = 'Resource Hub'

        return data

    def _analyze_generic_page(self) -> Dict:
        """Analyze generic/other pages"""
        data = {
            'page_type': 'Information Page',
            'parent': '/',
            'category': 'General Information',
        }

        entity = self._extract_entity_from_title()
        data['entity'] = entity

        return data

    def _extract_ship_name(self) -> str:
        """Extract ship name from title or h1"""
        # Try h1 first
        h1 = self.metadata.get('h1', '')
        if h1 and not any(x in h1.lower() for x in ['overview', 'index', 'all ships']):
            # Remove common suffixes
            ship_name = re.sub(r'\s*—\s*.*$', '', h1)
            ship_name = re.sub(r'\s*\|.*$', '', ship_name)
            return ship_name.strip()

        # Try title
        title = self.metadata.get('title', '')
        if title:
            # Extract ship name before — or |
            match = re.match(r'^([^—|]+)', title)
            if match:
                ship_name = match.group(1).strip()
                # Remove common words
                ship_name = re.sub(r'\s+(Deck Plans?|Reviews?|Overview|Info(rmation)?)\s*$', '', ship_name, flags=re.I)
                return ship_name

        # Fallback to filename
        filename = self.filepath.stem
        return filename.replace('-', ' ').title()

    def _extract_venue_name(self) -> str:
        """Extract restaurant/venue name"""
        # Try h1 first
        h1 = self.metadata.get('h1', '')
        if h1:
            # Remove suffixes
            venue_name = re.sub(r'\s*—\s*.*$', '', h1)
            venue_name = re.sub(r'\s*\|.*$', '', venue_name)
            return venue_name.strip()

        # Try title
        title = self.metadata.get('title', '')
        if title:
            match = re.match(r'^([^—|]+)', title)
            if match:
                return match.group(1).strip()

        # Fallback to filename
        filename = self.filepath.stem
        return filename.replace('-', ' ').title()

    def _extract_ship_class(self) -> Optional[str]:
        """Extract ship class from content or schema"""
        # Check existing schema
        schemas = self.metadata.get('existing_schema', {})

        # Check for custom properties in existing schemas
        for schema in schemas.values():
            if isinstance(schema, dict):
                # Look for ship class mentions
                for key, value in schema.items():
                    if 'class' in key.lower() and isinstance(value, str):
                        return value

        # Search content for ship class patterns
        content = str(self.soup)

        # Common ship class patterns
        class_patterns = [
            r'(Oasis|Quantum|Freedom|Voyager|Radiance|Vision|Icon|Sovereign)\s+[Cc]lass',
            r'[Cc]lass:\s*(\w+)',
        ]

        for pattern in class_patterns:
            match = re.search(pattern, content, re.I)
            if match:
                class_name = match.group(1) if '(' in pattern and pattern.index('(') == 0 else match.group(1)
                return f"{class_name.title()} Class"

        # Check meta description
        meta_desc = self.metadata.get('meta_description', '')
        for pattern in class_patterns:
            match = re.search(pattern, meta_desc, re.I)
            if match:
                class_name = match.group(1) if '(' in pattern and pattern.index('(') == 0 else match.group(1)
                return f"{class_name.title()} Class"

        return None

    def _detect_cruise_line(self) -> Optional[str]:
        """Detect cruise line from path or content"""
        path_str = str(self.filepath)
        content = str(self.soup).lower()

        # Common cruise lines
        cruise_lines = {
            'Royal Caribbean': ['royal caribbean', 'rccl', 'royal-caribbean'],
            'Celebrity': ['celebrity cruises', 'celebrity'],
            'Carnival': ['carnival cruise', 'carnival'],
            'Norwegian': ['norwegian cruise', 'ncl', 'norwegian'],
            'Disney': ['disney cruise', 'disney'],
            'Princess': ['princess cruises', 'princess'],
        }

        # Check path first
        for line, patterns in cruise_lines.items():
            for pattern in patterns:
                if pattern in path_str.lower():
                    return line

        # Check content
        for line, patterns in cruise_lines.items():
            for pattern in patterns:
                if pattern in content:
                    return line

        # Default for this site
        return 'Royal Caribbean'

    def _extract_cruise_line_name(self) -> str:
        """Extract cruise line name for cruise line pages"""
        h1 = self.metadata.get('h1', '')
        if h1:
            # Remove suffixes
            name = re.sub(r'\s*—\s*.*$', '', h1)
            name = re.sub(r'\s*\|.*$', '', name)
            return name.strip()

        title = self.metadata.get('title', '')
        if title:
            match = re.match(r'^([^—|]+)', title)
            if match:
                return match.group(1).strip()

        filename = self.filepath.stem
        return filename.replace('-', ' ').title()

    def _detect_venue_type(self) -> str:
        """Detect restaurant venue type"""
        content = str(self.soup).lower()
        meta_desc = self.metadata.get('meta_description', '').lower()
        h1 = self.metadata.get('h1', '').lower()

        # Venue type keywords
        if any(x in content or x in meta_desc for x in ['quick service', 'quick-service', 'counter service', 'grab and go', 'grab-and-go']):
            return 'Quick Service Dining'
        elif any(x in content or x in meta_desc for x in ['specialty', 'upcharge', 'premium', 'fine dining']):
            return 'Specialty Dining'
        elif any(x in content or x in meta_desc for x in ['main dining', 'mdr', 'complimentary dining room']):
            return 'Main Dining Room'
        elif any(x in content or x in meta_desc for x in ['windjammer', 'buffet', 'marketplace']):
            return 'Buffet/Marketplace'
        elif any(x in content or x in meta_desc for x in ['bar', 'lounge', 'pub']):
            return 'Bar/Lounge'
        elif any(x in content or x in meta_desc for x in ['cafe', 'coffee', 'patisserie']):
            return 'Cafe/Coffee Shop'
        else:
            return 'Dining Venue'

    def _extract_entity_from_title(self) -> str:
        """Extract entity name from title or h1"""
        h1 = self.metadata.get('h1', '')
        if h1:
            # Clean up
            entity = re.sub(r'\s*—\s*.*$', '', h1)
            entity = re.sub(r'\s*\|.*$', '', entity)
            return entity.strip()

        title = self.metadata.get('title', '')
        if title:
            # Extract before — or |
            match = re.match(r'^([^—|]+)', title)
            if match:
                entity = match.group(1).strip()
                # Remove site name
                entity = re.sub(r'\s*In the Wake\s*$', '', entity, flags=re.I)
                return entity

        return 'Page'

    def _generate_answer_first(self) -> str:
        """Generate answer-first summary"""
        # Try meta description first
        meta_desc = self.metadata.get('meta_description', '')
        if meta_desc and len(meta_desc) > 30:
            return meta_desc[:150]

        # Try first paragraph
        first_para = self.metadata.get('first_paragraph', '')
        if first_para:
            return first_para[:150]

        # Generate from page type
        page_type = self.metadata.get('page_type', '')
        entity = self.metadata.get('entity', '')

        if page_type == 'Ship Information Page':
            ship_class = self.metadata.get('ship_class', '')
            if ship_class:
                return f"{entity} is a {ship_class} ship with comprehensive deck plans, dining options, and reviews."
            return f"Complete guide to {entity} including deck plans, dining, and onboard amenities."

        elif page_type == 'Restaurant/Dining Venue':
            category = self.metadata.get('category', 'dining venue')
            ship_class = self.metadata.get('ship_class', '')
            if ship_class:
                return f"{entity} is a {category.lower()} on {ship_class} ships."
            return f"{entity} - {category.lower()} with menu details and dining information."

        elif page_type == 'Cruise Line Comparison':
            return f"Comprehensive comparison and information about {entity}."

        return f"Information and resources about {entity}."

    def _generate_expertise(self) -> str:
        """Generate expertise tags based on page type"""
        page_type = self.metadata.get('page_type', '')

        expertise_map = {
            'Ship Information Page': 'Royal Caribbean ship reviews, deck plans, dining analysis, cabin comparisons',
            'Restaurant/Dining Venue': 'Royal Caribbean dining, menu analysis, restaurant reviews, specialty dining',
            'Cruise Line Comparison': 'Cruise line comparisons, fleet analysis, policy research, cruise planning',
            'Hub/Index Page': 'Cruise planning, resource directory, comprehensive guides',
            'Solo Travel Guide/Article': 'Solo cruising, safety tips, community building, single traveler resources',
            'Accessibility Guide': 'Disability travel, accessible cruising, mobility accommodations',
            'Planning Guide/Tool': 'Cruise planning, booking strategies, trip organization, budget planning',
        }

        return expertise_map.get(page_type, 'Cruise travel, planning, research')

    def _generate_target_audience(self) -> str:
        """Generate target audience based on page type"""
        page_type = self.metadata.get('page_type', '')
        entity = self.metadata.get('entity', '')

        if page_type == 'Ship Information Page':
            ship_class = self.metadata.get('ship_class', '')
            if ship_class:
                return f"{entity} cruisers, {ship_class} researchers, ship comparison shoppers"
            return f"{entity} cruisers, ship comparison researchers, first-time cruisers"

        elif page_type == 'Restaurant/Dining Venue':
            ship_class = self.metadata.get('ship_class', '')
            if ship_class:
                return f"{ship_class} cruisers, dining planners, families, foodies"
            return "Cruise dining planners, families, specialty dining seekers"

        elif page_type == 'Cruise Line Comparison':
            return "Cruise line comparison shoppers, first-time cruisers, travel planners"

        elif page_type == 'Solo Travel Guide/Article':
            return "Solo cruisers, first-time solo travelers, single cruisers"

        elif page_type == 'Accessibility Guide':
            return "Travelers with disabilities, mobility-challenged cruisers, caregivers"

        elif page_type == 'Planning Guide/Tool':
            return "Cruise planners, trip organizers, budget-conscious travelers"

        else:
            return "Cruise travelers, vacation planners, research-oriented cruisers"


class BreadcrumbGenerator:
    """Generate AI breadcrumb comments"""

    @staticmethod
    def generate(metadata: Dict) -> str:
        """Generate AI breadcrumb HTML comment"""
        lines = ["<!-- ai-breadcrumbs"]

        # Entity
        entity = metadata.get('entity', 'Page')
        lines.append(f"     entity: {entity}")

        # Type
        page_type = metadata.get('page_type', 'Information Page')
        lines.append(f"     type: {page_type}")

        # Parent
        parent = metadata.get('parent', '/')
        lines.append(f"     parent: {parent}")

        # Category
        category = metadata.get('category', 'General')
        lines.append(f"     category: {category}")

        # Optional: cruise-line
        if 'cruise_line' in metadata:
            lines.append(f"     cruise-line: {metadata['cruise_line']}")

        # Optional: ship-class
        if 'ship_class' in metadata:
            lines.append(f"     ship-class: {metadata['ship_class']}")

        # Updated
        updated = metadata.get('updated', datetime.now().strftime('%Y-%m-%d'))
        lines.append(f"     updated: {updated}")

        # Expertise
        expertise = metadata.get('expertise', '')
        lines.append(f"     expertise: {expertise}")

        # Target audience
        target_audience = metadata.get('target_audience', '')
        lines.append(f"     target-audience: {target_audience}")

        # Answer-first
        answer_first = metadata.get('answer_first', '')
        lines.append(f"     answer-first: {answer_first}")

        lines.append("     -->")

        return '\n'.join(lines)


class PersonSchemaGenerator:
    """Generate Person schema.org JSON-LD"""

    TINA_MAULSBY = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Tina Maulsby",
        "url": "https://inthewake.com/about/tina-maulsby.html",
        "jobTitle": "Cruise Expert & Solo Travel Advocate",
        "description": "Disability travel advocate, solo cruiser, and Royal Caribbean specialist with expertise in accessible cruising and ship accessibility analysis.",
        "knowsAbout": [
            "Solo Cruising",
            "Disability Travel",
            "Accessible Cruising",
            "Royal Caribbean",
            "Cruise Ship Accessibility"
        ]
    }

    KEN_BAKER = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Ken Baker",
        "url": "https://inthewake.com/about/ken-baker.html",
        "jobTitle": "Cruise Research Analyst & Data Specialist",
        "description": "Cruise industry analyst specializing in ship comparisons, deck plan analysis, and dining venue research.",
        "knowsAbout": [
            "Cruise Ship Analysis",
            "Deck Plans",
            "Royal Caribbean",
            "Cruise Dining",
            "Ship Comparisons"
        ]
    }

    @classmethod
    def generate(cls, metadata: Dict) -> str:
        """Generate Person schema based on author detection"""
        # Check if Tina is the author
        existing_author = metadata.get('existing_author')
        if existing_author == 'Tina Maulsby':
            schema = cls.TINA_MAULSBY.copy()
        else:
            schema = cls.KEN_BAKER.copy()

        # Add page-specific knowledge
        page_type = metadata.get('page_type', '')
        knows_about = schema['knowsAbout'].copy()

        if page_type == 'Ship Information Page':
            if 'Ship Reviews' not in knows_about:
                knows_about.append('Ship Reviews')
            if 'Deck Plan Analysis' not in knows_about:
                knows_about.append('Deck Plan Analysis')

        elif page_type == 'Restaurant/Dining Venue':
            if 'Cruise Dining' not in knows_about:
                knows_about.append('Cruise Dining')
            if 'Menu Analysis' not in knows_about:
                knows_about.append('Menu Analysis')

        elif page_type == 'Solo Travel Guide/Article':
            if 'Solo Cruising' not in knows_about:
                knows_about.append('Solo Cruising')

        elif page_type == 'Accessibility Guide':
            if 'Disability Travel' not in knows_about:
                knows_about.append('Disability Travel')
            if 'Accessible Cruising' not in knows_about:
                knows_about.append('Accessible Cruising')

        schema['knowsAbout'] = knows_about

        # Generate JSON-LD
        import json
        json_str = json.dumps(schema, indent=2)

        return f'<script type="application/ld+json">\n{json_str}\n</script>'


class HTMLModifier:
    """Safely modify HTML files"""

    def __init__(self, filepath: Path, verbose: bool = False):
        self.filepath = filepath
        self.verbose = verbose

    def process(self, dry_run: bool = False, backup: bool = False) -> Dict:
        """Process HTML file - add breadcrumbs and Person schema"""
        result = {
            'success': False,
            'breadcrumb_added': False,
            'person_schema_added': False,
            'error': None,
            'metadata': None
        }

        try:
            # Read file
            with open(self.filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            soup = BeautifulSoup(content, 'html.parser')

            # Analyze page
            analyzer = PageAnalyzer(self.filepath, soup)
            metadata = analyzer.analyze()
            result['metadata'] = metadata

            # Check if breadcrumb already exists
            has_breadcrumb = self._has_ai_breadcrumb(soup)

            # Check if Person schema already exists
            has_person_schema = self._has_person_schema(soup)

            # Generate new content
            breadcrumb_html = BreadcrumbGenerator.generate(metadata)
            person_schema_html = PersonSchemaGenerator.generate(metadata)

            # Modify HTML
            modified = False

            if not has_breadcrumb:
                content = self._insert_breadcrumb(content, breadcrumb_html)
                result['breadcrumb_added'] = True
                modified = True

            if not has_person_schema:
                content = self._insert_person_schema(content, person_schema_html)
                result['person_schema_added'] = True
                modified = True

            if modified and not dry_run:
                # Backup if requested
                if backup:
                    backup_path = self.filepath.with_suffix('.html.bak')
                    shutil.copy2(self.filepath, backup_path)

                # Write modified content
                with open(self.filepath, 'w', encoding='utf-8') as f:
                    f.write(content)

            result['success'] = True

        except Exception as e:
            result['error'] = str(e)

        return result

    def _has_ai_breadcrumb(self, soup: BeautifulSoup) -> bool:
        """Check if AI breadcrumb already exists"""
        for comment in soup.find_all(string=lambda text: isinstance(text, Comment)):
            if 'ai-breadcrumbs' in comment:
                return True
        return False

    def _has_person_schema(self, soup: BeautifulSoup) -> bool:
        """Check if Person schema already exists"""
        for script in soup.find_all('script', type='application/ld+json'):
            try:
                import json
                data = json.loads(script.string)
                if isinstance(data, dict) and data.get('@type') == 'Person':
                    return True
                if isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict) and item.get('@type') == 'Person':
                            return True
            except:
                pass
        return False

    def _insert_breadcrumb(self, content: str, breadcrumb: str) -> str:
        """Insert AI breadcrumb after <head>"""
        # Find <head> tag
        match = re.search(r'(<head[^>]*>)', content, re.I)
        if match:
            insert_pos = match.end()
            content = content[:insert_pos] + '\n' + breadcrumb + content[insert_pos:]
        else:
            # Fallback: insert at beginning
            content = breadcrumb + '\n' + content

        return content

    def _insert_person_schema(self, content: str, schema: str) -> str:
        """Insert Person schema before </head>"""
        # Find </head> tag
        match = re.search(r'(</head>)', content, re.I)
        if match:
            insert_pos = match.start()
            content = content[:insert_pos] + schema + '\n' + content[insert_pos:]
        else:
            # Fallback: insert at end
            content = content + '\n' + schema

        return content


def find_html_files(path: Path, exclude_patterns: List[str] = None) -> List[Path]:
    """Find all HTML files in path"""
    if exclude_patterns is None:
        exclude_patterns = ['/solo/articles/']

    files = []

    if path.is_file():
        if path.suffix == '.html':
            files.append(path)
    else:
        for html_file in path.rglob('*.html'):
            # Check exclusions
            if any(pattern in str(html_file) for pattern in exclude_patterns):
                continue
            files.append(html_file)

    return sorted(files)


def format_metadata_display(metadata: Dict) -> str:
    """Format metadata for verbose display"""
    lines = []
    lines.append("  Extracted metadata:")
    lines.append(f"    Title: {metadata.get('title', 'N/A')}")
    lines.append(f"    Entity: {metadata.get('entity', 'N/A')}")
    lines.append(f"    Type: {metadata.get('page_type', 'N/A')}")

    if 'cruise_line' in metadata:
        lines.append(f"    Cruise Line: {metadata['cruise_line']}")
    if 'ship_class' in metadata:
        lines.append(f"    Ship Class: {metadata['ship_class']}")

    lines.append(f"    Category: {metadata.get('category', 'N/A')}")

    answer_first = metadata.get('answer_first', '')
    if len(answer_first) > 80:
        answer_first = answer_first[:77] + '...'
    lines.append(f"    Answer-first: {answer_first}")

    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(
        description='Intelligent AI Breadcrumbs & Person Schema Generator',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  %(prog)s --dry-run --verbose
  %(prog)s --file restaurants/basecamp.html --verbose
  %(prog)s --dir ships/ --backup
  %(prog)s --backup
        '''
    )

    parser.add_argument('--dry-run', action='store_true',
                        help='Preview changes without modifying files')
    parser.add_argument('--verbose', action='store_true',
                        help='Show detailed extraction and generation info')
    parser.add_argument('--file', type=str,
                        help='Process single file')
    parser.add_argument('--dir', type=str,
                        help='Process directory')
    parser.add_argument('--backup', action='store_true',
                        help='Create .bak backups before modification')

    args = parser.parse_args()

    # Determine working directory
    base_dir = Path('/home/user/InTheWake')

    # Determine files to process
    if args.file:
        file_path = Path(args.file)
        if not file_path.is_absolute():
            file_path = base_dir / file_path
        files = [file_path] if file_path.exists() else []
        if not files:
            print(f"ERROR: File not found: {file_path}")
            return 1
    elif args.dir:
        dir_path = Path(args.dir)
        if not dir_path.is_absolute():
            dir_path = base_dir / dir_path
        files = find_html_files(dir_path)
    else:
        # Process all
        files = find_html_files(base_dir)

    if not files:
        print("No HTML files found to process")
        return 1

    # Summary counters
    total = len(files)
    processed = 0
    breadcrumbs_added = 0
    schemas_added = 0
    errors = 0
    skipped = 0

    print(f"{'DRY RUN: ' if args.dry_run else ''}Processing {total} HTML files...")
    if args.backup and not args.dry_run:
        print("Creating backups (.bak files)")
    print()

    # Process each file
    for i, filepath in enumerate(files, 1):
        relative_path = filepath.relative_to(base_dir) if filepath.is_relative_to(base_dir) else filepath

        if args.verbose:
            print(f"[{i}/{total}] Processing: {relative_path}")

        modifier = HTMLModifier(filepath, verbose=args.verbose)
        result = modifier.process(dry_run=args.dry_run, backup=args.backup)

        if result['success']:
            processed += 1

            if result['breadcrumb_added']:
                breadcrumbs_added += 1
            if result['person_schema_added']:
                schemas_added += 1

            if not result['breadcrumb_added'] and not result['person_schema_added']:
                skipped += 1

            # Verbose output
            if args.verbose and result['metadata']:
                print(format_metadata_display(result['metadata']))
                print()
                print("  Generating AI breadcrumbs:")

                entity = result['metadata'].get('entity', '')
                page_type = result['metadata'].get('page_type', '')

                if page_type == 'Ship Information Page':
                    print(f"    ✓ Custom metadata for {entity} ship")
                    if 'ship_class' in result['metadata']:
                        print(f"    ✓ {result['metadata']['ship_class']} detection")
                elif page_type == 'Restaurant/Dining Venue':
                    print(f"    ✓ Custom metadata for {entity} restaurant")
                    if 'ship_class' in result['metadata']:
                        print(f"    ✓ {result['metadata']['ship_class']} ship detection")
                    category = result['metadata'].get('category', '')
                    if category:
                        print(f"    ✓ {category} category")

                print()
                status_parts = []
                if result['breadcrumb_added']:
                    status_parts.append("✓ Added breadcrumb")
                else:
                    status_parts.append("• Breadcrumb exists")

                if result['person_schema_added']:
                    author = result['metadata'].get('existing_author', 'Ken Baker')
                    status_parts.append(f"✓ Added Person schema ({author if author else 'Ken Baker'})")
                else:
                    status_parts.append("• Person schema exists")

                print(f"  Status: {', '.join(status_parts)}")
                print()
            elif not args.verbose:
                # Brief output
                status = ""
                if result['breadcrumb_added'] or result['person_schema_added']:
                    parts = []
                    if result['breadcrumb_added']:
                        parts.append("breadcrumb")
                    if result['person_schema_added']:
                        parts.append("person")
                    status = f" [+{'+'.join(parts)}]"
                elif not result['breadcrumb_added'] and not result['person_schema_added']:
                    status = " [skip]"

                print(f"[{i}/{total}] {relative_path}{status}")

        else:
            errors += 1
            print(f"[{i}/{total}] ERROR: {relative_path}")
            print(f"  {result['error']}")
            print()

    # Final summary
    print()
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Total files: {total}")
    print(f"Processed: {processed}")
    print(f"AI breadcrumbs added: {breadcrumbs_added}")
    print(f"Person schemas added: {schemas_added}")
    print(f"Skipped (already have both): {skipped}")
    print(f"Errors: {errors}")

    if args.dry_run:
        print()
        print("DRY RUN - No files were modified")
        print("Run without --dry-run to apply changes")

    return 0 if errors == 0 else 1


if __name__ == '__main__':
    sys.exit(main())
