const { readFileSync } = require('fs');
const { load } = require('cheerio');

const SECTION_PATTERNS = {
  hero: /hero|port-hero|header-image/i,
  logbook: /logbook|first.?person|personal|my (visit|experience|thoughts?)|the moment/i,
  featured_images: /featured.?images?|inline.?images?/i,
  cruise_port: /(the )?cruise (port|terminal)|port (of call|terminal|facilities)/i,
  getting_around: /getting (around|there|to|from)|transportation|how to get/i,
  map: /map|interactive.?map|port.?map/i,
  beaches: /beaches?|beach guide|coastal/i,
  excursions: /(top )?excursions?|attractions?|things to (do|see)|activities/i,
  history: /history|historical|heritage/i,
  cultural: /cultural? (features?|highlights?|experiences?)|traditions?/i,
  shopping: /shopping|retail|markets?/i,
  food: /food|dining|restaurants?|eating|cuisine/i,
  notices: /(special )?notices?|warnings?|alerts?|important|know before/i,
  depth_soundings: /depth soundings|final thoughts?|in conclusion|the (real|honest) story/i,
  practical: /practical (information|info)|quick reference|at a glance|summary/i,
  faq: /(frequently asked questions?|faq|common questions?)/i,
  gallery: /(photo )?gallery|photos?|images?|swiper/i,
  credits: /(image |photo )?credits?|attributions?|photo sources?/i,
  back_nav: /back (to|navigation)|return to ports/i
};

const EXPECTED = ['hero', 'logbook', 'featured_images', 'cruise_port', 'getting_around', 'map', 'beaches', 'excursions', 'history', 'cultural', 'shopping', 'food', 'notices', 'depth_soundings', 'practical', 'faq', 'gallery', 'credits', 'back_nav'];

const file = process.argv[2] || '../ports/lanzarote.html';
const html = readFileSync(file, 'utf-8');
const $ = load(html);
const detected = [];

$('main h2, main h3, main section, main div[id], main div[class*="section"]').each((i, elem) => {
  const $elem = $(elem);
  const tag = elem.tagName;
  const id = $elem.attr('id') || '';
  const className = $elem.attr('class') || '';
  const text = $elem.text().toLowerCase();
  const combined = text + ' ' + id + ' ' + className;

  for (const [key, pattern] of Object.entries(SECTION_PATTERNS)) {
    if (pattern.test(combined)) {
      if (!detected.includes(key)) {
        detected.push(key);
        const match = combined.match(pattern);
        console.log('First detection of', key + ':', '<' + tag + '> id=' + id.slice(0,20) + ' match="' + match[0] + '"');
      }
      break;
    }
  }
});

console.log('\nDetected order:', detected.join(' -> '));

const detectedIndexes = detected.map(s => EXPECTED.indexOf(s));
const outOfOrder = [];
for (let i = 1; i < detectedIndexes.length; i++) {
  if (detectedIndexes[i] !== -1 && detectedIndexes[i-1] !== -1) {
    if (detectedIndexes[i] < detectedIndexes[i-1]) {
      outOfOrder.push(detected[i]);
    }
  }
}
console.log('Expected indexes:', detectedIndexes);
console.log('Out of order:', outOfOrder.join(', ') || 'none');
