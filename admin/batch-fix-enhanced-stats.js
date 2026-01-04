#!/usr/bin/env node
/**
 * Batch Fix: Enhance ship-stats-fallback with full ship data
 * Soli Deo Gloria
 *
 * Adds class, entered_service, gt, guests fields to stats fallback JSON.
 * Uses known ship specifications database.
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SHIPS_DIR = join(__dirname, '..', 'ships');

const CRUISE_LINES = [
  'carnival', 'celebrity-cruises', 'costa', 'cunard', 'explora-journeys',
  'holland-america-line', 'msc', 'norwegian', 'oceania', 'princess',
  'rcl', 'regent', 'seabourn', 'silversea', 'virgin-voyages'
];

// Ship specifications database (original research compilation)
const SHIP_DATA = {
  // Celebrity Cruises - Edge Class
  'celebrity-edge': { class: 'Edge Class', entered_service: 2018, gt: '130,818 GT', guests: '2,918', crew: '1,320' },
  'celebrity-apex': { class: 'Edge Class', entered_service: 2020, gt: '130,818 GT', guests: '2,910', crew: '1,320' },
  'celebrity-beyond': { class: 'Edge Class', entered_service: 2022, gt: '140,600 GT', guests: '3,260', crew: '1,400' },
  'celebrity-ascent': { class: 'Edge Class', entered_service: 2023, gt: '140,600 GT', guests: '3,260', crew: '1,400' },
  'celebrity-xcel': { class: 'Edge Class', entered_service: 2025, gt: '140,600 GT', guests: '3,260', crew: '1,400' },

  // Celebrity Cruises - Solstice Class
  'celebrity-solstice': { class: 'Solstice Class', entered_service: 2008, gt: '121,878 GT', guests: '2,850', crew: '1,210' },
  'celebrity-equinox': { class: 'Solstice Class', entered_service: 2009, gt: '121,878 GT', guests: '2,850', crew: '1,210' },
  'celebrity-eclipse': { class: 'Solstice Class', entered_service: 2010, gt: '121,878 GT', guests: '2,850', crew: '1,210' },
  'celebrity-silhouette': { class: 'Solstice Class', entered_service: 2011, gt: '122,210 GT', guests: '2,886', crew: '1,246' },
  'celebrity-reflection': { class: 'Solstice Class', entered_service: 2012, gt: '126,000 GT', guests: '3,046', crew: '1,271' },

  // Celebrity Cruises - Millennium Class
  'celebrity-millennium': { class: 'Millennium Class', entered_service: 2000, gt: '90,940 GT', guests: '2,138', crew: '999' },
  'celebrity-infinity': { class: 'Millennium Class', entered_service: 2001, gt: '90,940 GT', guests: '2,170', crew: '999' },
  'celebrity-summit': { class: 'Millennium Class', entered_service: 2001, gt: '90,940 GT', guests: '2,158', crew: '999' },
  'celebrity-constellation': { class: 'Millennium Class', entered_service: 2002, gt: '90,940 GT', guests: '2,170', crew: '999' },

  // Celebrity Cruises - Other
  'celebrity-xpedition': { class: 'Expedition Class', entered_service: 2001, gt: '2,842 GT', guests: '96', crew: '64' },
  'celebrity-flora': { class: 'Expedition Class', entered_service: 2019, gt: '5,739 GT', guests: '100', crew: '78' },
  'celebrity-xperience': { class: 'Expedition Class', entered_service: 2024, gt: '5,739 GT', guests: '100', crew: '78' },
  'celebrity-xploration': { class: 'Expedition Class', entered_service: 2017, gt: '356 GT', guests: '16', crew: '13' },

  // Holland America - Pinnacle Class
  'koningsdam': { class: 'Pinnacle Class', entered_service: 2016, gt: '99,500 GT', guests: '2,650', crew: '1,036' },
  'nieuw-statendam': { class: 'Pinnacle Class', entered_service: 2018, gt: '99,902 GT', guests: '2,666', crew: '1,036' },
  'rotterdam': { class: 'Pinnacle Class', entered_service: 2021, gt: '99,500 GT', guests: '2,668', crew: '1,036' },

  // Holland America - Vista Class
  'zuiderdam': { class: 'Vista Class', entered_service: 2002, gt: '81,769 GT', guests: '1,916', crew: '817' },
  'oosterdam': { class: 'Vista Class', entered_service: 2003, gt: '81,769 GT', guests: '1,916', crew: '817' },
  'westerdam': { class: 'Vista Class', entered_service: 2004, gt: '81,811 GT', guests: '1,916', crew: '817' },
  'noordam': { class: 'Vista Class', entered_service: 2006, gt: '82,305 GT', guests: '1,972', crew: '817' },

  // Holland America - Signature Class
  'eurodam': { class: 'Signature Class', entered_service: 2008, gt: '86,273 GT', guests: '2,104', crew: '929' },
  'nieuw-amsterdam': { class: 'Signature Class', entered_service: 2010, gt: '86,700 GT', guests: '2,106', crew: '929' },

  // Holland America - Rotterdam Class
  'volendam': { class: 'Rotterdam Class', entered_service: 1999, gt: '61,214 GT', guests: '1,432', crew: '615' },
  'zaandam': { class: 'Rotterdam Class', entered_service: 2000, gt: '61,396 GT', guests: '1,432', crew: '615' },

  // Costa Cruises
  'costa-smeralda': { class: 'Excellence Class', entered_service: 2019, gt: '185,010 GT', guests: '6,554', crew: '1,682' },
  'costa-toscana': { class: 'Excellence Class', entered_service: 2021, gt: '185,010 GT', guests: '6,554', crew: '1,682' },
  'costa-firenze': { class: 'Vista Class', entered_service: 2021, gt: '135,500 GT', guests: '5,260', crew: '1,400' },
  'costa-venezia': { class: 'Vista Class', entered_service: 2019, gt: '135,225 GT', guests: '5,260', crew: '1,400' },
  'costa-pacifica': { class: 'Concordia Class', entered_service: 2009, gt: '114,147 GT', guests: '3,780', crew: '1,110' },
  'costa-fascinosa': { class: 'Concordia Class', entered_service: 2012, gt: '114,289 GT', guests: '3,800', crew: '1,110' },
  'costa-favolosa': { class: 'Concordia Class', entered_service: 2011, gt: '114,289 GT', guests: '3,800', crew: '1,110' },
  'costa-diadema': { class: 'Diadema Class', entered_service: 2014, gt: '132,500 GT', guests: '4,947', crew: '1,253' },
  'costa-deliziosa': { class: 'Concordia Class', entered_service: 2010, gt: '92,720 GT', guests: '2,826', crew: '934' },

  // Cunard
  'queen-mary-2': { class: 'QM2 Class', entered_service: 2004, gt: '148,528 GT', guests: '2,695', crew: '1,253' },
  'queen-victoria': { class: 'Vista Class', entered_service: 2007, gt: '90,049 GT', guests: '2,081', crew: '981' },
  'queen-elizabeth': { class: 'Vista Class', entered_service: 2010, gt: '90,901 GT', guests: '2,081', crew: '1,005' },
  'queen-anne': { class: 'Vista Class', entered_service: 2024, gt: '113,000 GT', guests: '2,996', crew: '1,225' },

  // Norwegian Cruise Line - Prima Class
  'norwegian-prima': { class: 'Prima Class', entered_service: 2022, gt: '142,500 GT', guests: '3,215', crew: '1,388' },
  'norwegian-viva': { class: 'Prima Class', entered_service: 2023, gt: '142,500 GT', guests: '3,215', crew: '1,388' },
  'norwegian-aqua': { class: 'Prima Class', entered_service: 2025, gt: '156,300 GT', guests: '3,571', crew: '1,550' },

  // Norwegian - Breakaway Class
  'norwegian-breakaway': { class: 'Breakaway Class', entered_service: 2013, gt: '145,655 GT', guests: '3,963', crew: '1,657' },
  'norwegian-getaway': { class: 'Breakaway Class', entered_service: 2014, gt: '145,655 GT', guests: '3,963', crew: '1,657' },
  'norwegian-escape': { class: 'Breakaway Plus', entered_service: 2015, gt: '164,600 GT', guests: '4,266', crew: '1,733' },
  'norwegian-joy': { class: 'Breakaway Plus', entered_service: 2017, gt: '167,725 GT', guests: '3,883', crew: '1,821' },
  'norwegian-bliss': { class: 'Breakaway Plus', entered_service: 2018, gt: '168,028 GT', guests: '4,004', crew: '1,716' },
  'norwegian-encore': { class: 'Breakaway Plus', entered_service: 2019, gt: '169,145 GT', guests: '3,998', crew: '1,735' },

  // Norwegian - Epic Class
  'norwegian-epic': { class: 'Epic Class', entered_service: 2010, gt: '155,873 GT', guests: '4,100', crew: '1,753' },

  // Norwegian - Jewel Class
  'norwegian-jewel': { class: 'Jewel Class', entered_service: 2005, gt: '93,502 GT', guests: '2,376', crew: '1,072' },
  'norwegian-jade': { class: 'Jewel Class', entered_service: 2006, gt: '93,558 GT', guests: '2,402', crew: '1,076' },
  'norwegian-pearl': { class: 'Jewel Class', entered_service: 2006, gt: '93,530 GT', guests: '2,394', crew: '1,072' },
  'norwegian-gem': { class: 'Jewel Class', entered_service: 2007, gt: '93,530 GT', guests: '2,394', crew: '1,072' },

  // Norwegian - Dawn/Star Class
  'norwegian-dawn': { class: 'Dawn Class', entered_service: 2002, gt: '92,250 GT', guests: '2,340', crew: '1,032' },
  'norwegian-star': { class: 'Dawn Class', entered_service: 2001, gt: '91,740 GT', guests: '2,348', crew: '1,031' },

  // Norwegian - Sun Class
  'norwegian-sun': { class: 'Sun Class', entered_service: 2001, gt: '78,309 GT', guests: '1,936', crew: '906' },
  'norwegian-sky': { class: 'Sun Class', entered_service: 1999, gt: '77,104 GT', guests: '2,004', crew: '919' },

  // Norwegian - Spirit Class
  'norwegian-spirit': { class: 'Spirit Class', entered_service: 1998, gt: '75,338 GT', guests: '1,966', crew: '912' },

  // Norwegian - Pride of America
  'pride-of-america': { class: 'Pride Class', entered_service: 2005, gt: '80,439 GT', guests: '2,186', crew: '927' },

  // MSC Cruises - World Class
  'msc-world-europa': { class: 'World Class', entered_service: 2022, gt: '205,700 GT', guests: '6,762', crew: '2,138' },
  'msc-world-america': { class: 'World Class', entered_service: 2025, gt: '215,863 GT', guests: '6,762', crew: '2,200' },
  'msc-world-asia': { class: 'World Class', entered_service: 2026, gt: '215,863 GT', guests: '6,762', crew: '2,200' },

  // MSC - Meraviglia Class
  'msc-meraviglia': { class: 'Meraviglia Class', entered_service: 2017, gt: '171,598 GT', guests: '5,714', crew: '1,536' },
  'msc-bellissima': { class: 'Meraviglia Class', entered_service: 2019, gt: '171,598 GT', guests: '5,714', crew: '1,536' },
  'msc-grandiosa': { class: 'Meraviglia Plus', entered_service: 2019, gt: '181,541 GT', guests: '6,334', crew: '1,704' },
  'msc-virtuosa': { class: 'Meraviglia Plus', entered_service: 2021, gt: '181,541 GT', guests: '6,334', crew: '1,704' },
  'msc-euribia': { class: 'Meraviglia Plus', entered_service: 2023, gt: '183,500 GT', guests: '6,327', crew: '1,704' },

  // MSC - Seaside Class
  'msc-seaside': { class: 'Seaside Class', entered_service: 2017, gt: '153,516 GT', guests: '5,179', crew: '1,413' },
  'msc-seaview': { class: 'Seaside Class', entered_service: 2018, gt: '153,516 GT', guests: '5,179', crew: '1,413' },
  'msc-seashore': { class: 'Seaside EVO', entered_service: 2021, gt: '169,400 GT', guests: '5,632', crew: '1,648' },
  'msc-seascape': { class: 'Seaside EVO', entered_service: 2022, gt: '169,400 GT', guests: '5,632', crew: '1,648' },

  // MSC - Fantasia Class
  'msc-fantasia': { class: 'Fantasia Class', entered_service: 2008, gt: '137,936 GT', guests: '4,363', crew: '1,370' },
  'msc-splendida': { class: 'Fantasia Class', entered_service: 2009, gt: '137,936 GT', guests: '4,363', crew: '1,370' },
  'msc-divina': { class: 'Fantasia Class', entered_service: 2012, gt: '139,072 GT', guests: '4,345', crew: '1,388' },
  'msc-preziosa': { class: 'Fantasia Class', entered_service: 2013, gt: '139,072 GT', guests: '4,345', crew: '1,388' },

  // MSC - Musica Class
  'msc-musica': { class: 'Musica Class', entered_service: 2006, gt: '92,409 GT', guests: '3,223', crew: '987' },
  'msc-orchestra': { class: 'Musica Class', entered_service: 2007, gt: '92,409 GT', guests: '3,223', crew: '987' },
  'msc-poesia': { class: 'Musica Class', entered_service: 2008, gt: '92,627 GT', guests: '3,223', crew: '987' },
  'msc-magnifica': { class: 'Musica Class', entered_service: 2010, gt: '95,128 GT', guests: '3,223', crew: '1,038' },

  // MSC - Lirica Class
  'msc-lirica': { class: 'Lirica Class', entered_service: 2003, gt: '65,591 GT', guests: '2,679', crew: '721' },
  'msc-opera': { class: 'Lirica Class', entered_service: 2004, gt: '65,591 GT', guests: '2,679', crew: '721' },
  'msc-sinfonia': { class: 'Lirica Class', entered_service: 2005, gt: '65,591 GT', guests: '2,679', crew: '721' },
  'msc-armonia': { class: 'Lirica Class', entered_service: 2004, gt: '65,591 GT', guests: '2,679', crew: '721' },

  // Princess Cruises - Sphere Class
  'sun-princess': { class: 'Sphere Class', entered_service: 2024, gt: '175,500 GT', guests: '4,300', crew: '1,600' },
  'star-princess': { class: 'Sphere Class', entered_service: 2025, gt: '175,500 GT', guests: '4,300', crew: '1,600' },

  // Princess - Royal Class
  'royal-princess': { class: 'Royal Class', entered_service: 2013, gt: '142,229 GT', guests: '3,560', crew: '1,346' },
  'regal-princess': { class: 'Royal Class', entered_service: 2014, gt: '142,229 GT', guests: '3,560', crew: '1,346' },
  'majestic-princess': { class: 'Royal Class', entered_service: 2017, gt: '143,700 GT', guests: '3,560', crew: '1,346' },
  'sky-princess': { class: 'Royal Class', entered_service: 2019, gt: '145,281 GT', guests: '3,660', crew: '1,346' },
  'enchanted-princess': { class: 'Royal Class', entered_service: 2020, gt: '145,281 GT', guests: '3,660', crew: '1,346' },
  'discovery-princess': { class: 'Royal Class', entered_service: 2022, gt: '145,281 GT', guests: '3,660', crew: '1,346' },

  // Princess - Grand Class
  'grand-princess': { class: 'Grand Class', entered_service: 1998, gt: '107,517 GT', guests: '2,600', crew: '1,100' },
  'caribbean-princess': { class: 'Grand Class', entered_service: 2004, gt: '112,894 GT', guests: '3,142', crew: '1,200' },
  'crown-princess': { class: 'Grand Class', entered_service: 2006, gt: '113,561 GT', guests: '3,082', crew: '1,200' },
  'emerald-princess': { class: 'Grand Class', entered_service: 2007, gt: '113,561 GT', guests: '3,082', crew: '1,200' },
  'ruby-princess': { class: 'Grand Class', entered_service: 2008, gt: '113,561 GT', guests: '3,082', crew: '1,200' },

  // Princess - Coral Class
  'coral-princess': { class: 'Coral Class', entered_service: 2002, gt: '91,627 GT', guests: '1,970', crew: '900' },
  'island-princess': { class: 'Coral Class', entered_service: 2003, gt: '91,627 GT', guests: '1,970', crew: '900' },

  // Princess - Diamond Class
  'diamond-princess': { class: 'Diamond Class', entered_service: 2004, gt: '115,875 GT', guests: '2,670', crew: '1,100' },
  'sapphire-princess': { class: 'Diamond Class', entered_service: 2004, gt: '115,875 GT', guests: '2,670', crew: '1,100' },

  // Oceania Cruises
  'vista': { class: 'Allura Class', entered_service: 2023, gt: '67,000 GT', guests: '1,200', crew: '800' },
  'allura': { class: 'Allura Class', entered_service: 2025, gt: '67,000 GT', guests: '1,200', crew: '800' },
  'marina': { class: 'Oceania Class', entered_service: 2011, gt: '66,084 GT', guests: '1,250', crew: '800' },
  'riviera': { class: 'Oceania Class', entered_service: 2012, gt: '66,084 GT', guests: '1,250', crew: '800' },
  'regatta': { class: 'R Class', entered_service: 1998, gt: '30,277 GT', guests: '684', crew: '400' },
  'insignia': { class: 'R Class', entered_service: 1998, gt: '30,277 GT', guests: '684', crew: '386' },
  'nautica': { class: 'R Class', entered_service: 2000, gt: '30,277 GT', guests: '684', crew: '400' },
  'sirena': { class: 'R Class', entered_service: 1999, gt: '30,277 GT', guests: '684', crew: '373' },

  // Regent Seven Seas
  'seven-seas-grandeur': { class: 'Explorer Class', entered_service: 2023, gt: '55,254 GT', guests: '746', crew: '552' },
  'seven-seas-splendor': { class: 'Explorer Class', entered_service: 2020, gt: '55,254 GT', guests: '732', crew: '552' },
  'seven-seas-explorer': { class: 'Explorer Class', entered_service: 2016, gt: '55,254 GT', guests: '750', crew: '552' },
  'seven-seas-voyager': { class: 'Voyager Class', entered_service: 2003, gt: '42,363 GT', guests: '700', crew: '447' },
  'seven-seas-mariner': { class: 'Mariner Class', entered_service: 2001, gt: '48,075 GT', guests: '700', crew: '445' },
  'seven-seas-navigator': { class: 'Navigator Class', entered_service: 1999, gt: '28,550 GT', guests: '490', crew: '340' },

  // Seabourn
  'seabourn-encore': { class: 'Encore Class', entered_service: 2016, gt: '40,350 GT', guests: '604', crew: '450' },
  'seabourn-ovation': { class: 'Encore Class', entered_service: 2018, gt: '40,350 GT', guests: '604', crew: '450' },
  'seabourn-venture': { class: 'Expedition Class', entered_service: 2022, gt: '23,000 GT', guests: '264', crew: '250' },
  'seabourn-pursuit': { class: 'Expedition Class', entered_service: 2023, gt: '23,000 GT', guests: '264', crew: '250' },
  'seabourn-odyssey': { class: 'Odyssey Class', entered_service: 2009, gt: '32,346 GT', guests: '458', crew: '330' },
  'seabourn-sojourn': { class: 'Odyssey Class', entered_service: 2010, gt: '32,346 GT', guests: '458', crew: '330' },
  'seabourn-quest': { class: 'Odyssey Class', entered_service: 2011, gt: '32,346 GT', guests: '458', crew: '330' },

  // Silversea
  'silver-nova': { class: 'Nova Class', entered_service: 2023, gt: '54,700 GT', guests: '728', crew: '586' },
  'silver-ray': { class: 'Nova Class', entered_service: 2024, gt: '54,700 GT', guests: '728', crew: '586' },
  'silver-muse': { class: 'Muse Class', entered_service: 2017, gt: '40,700 GT', guests: '596', crew: '411' },
  'silver-moon': { class: 'Muse Class', entered_service: 2020, gt: '40,700 GT', guests: '596', crew: '411' },
  'silver-dawn': { class: 'Muse Class', entered_service: 2022, gt: '40,700 GT', guests: '596', crew: '411' },
  'silver-spirit': { class: 'Spirit Class', entered_service: 2009, gt: '36,009 GT', guests: '540', crew: '376' },
  'silver-shadow': { class: 'Shadow Class', entered_service: 2000, gt: '28,258 GT', guests: '382', crew: '295' },
  'silver-whisper': { class: 'Shadow Class', entered_service: 2001, gt: '28,258 GT', guests: '382', crew: '295' },
  'silver-wind': { class: 'Wind Class', entered_service: 1995, gt: '17,400 GT', guests: '274', crew: '222' },
  'silver-cloud': { class: 'Cloud Class', entered_service: 1994, gt: '16,927 GT', guests: '254', crew: '212' },
  'silver-endeavour': { class: 'Expedition Class', entered_service: 2021, gt: '23,500 GT', guests: '200', crew: '208' },
  'silver-origin': { class: 'Expedition Class', entered_service: 2020, gt: '5,800 GT', guests: '100', crew: '96' },

  // Virgin Voyages
  'scarlet-lady': { class: 'Virgin Class', entered_service: 2020, gt: '110,000 GT', guests: '2,770', crew: '1,160' },
  'valiant-lady': { class: 'Virgin Class', entered_service: 2022, gt: '110,000 GT', guests: '2,770', crew: '1,160' },
  'resilient-lady': { class: 'Virgin Class', entered_service: 2023, gt: '110,000 GT', guests: '2,770', crew: '1,160' },
  'brilliant-lady': { class: 'Virgin Class', entered_service: 2025, gt: '110,000 GT', guests: '2,770', crew: '1,160' },

  // Explora Journeys
  'explora-i': { class: 'Explora Class', entered_service: 2023, gt: '63,900 GT', guests: '922', crew: '646' },
  'explora-ii': { class: 'Explora Class', entered_service: 2024, gt: '63,900 GT', guests: '922', crew: '646' },
  'explora-iii': { class: 'Explora Class', entered_service: 2026, gt: '63,900 GT', guests: '922', crew: '646' },
  'explora-iv': { class: 'Explora Class', entered_service: 2027, gt: '63,900 GT', guests: '922', crew: '646' },
  'explora-v': { class: 'Explora Class', entered_service: 2028, gt: '63,900 GT', guests: '922', crew: '646' },
  'explora-vi': { class: 'Explora Class', entered_service: 2028, gt: '63,900 GT', guests: '922', crew: '646' }
};

function enhanceStats(html, slug) {
  const data = SHIP_DATA[slug];
  if (!data) return { html, enhanced: false };

  // Find existing stats-fallback
  const statsMatch = html.match(/<script type="application\/json" id="ship-stats-fallback">([^<]+)<\/script>/);
  if (!statsMatch) return { html, enhanced: false };

  try {
    const existingStats = JSON.parse(statsMatch[1]);

    // Check if already has the fields
    if (existingStats.class && existingStats.entered_service && existingStats.gt && existingStats.guests) {
      return { html, enhanced: false, reason: 'already complete' };
    }

    // Merge with new data
    const enhanced = {
      ...existingStats,
      class: existingStats.class || data.class,
      entered_service: existingStats.entered_service || data.entered_service,
      gt: existingStats.gt || data.gt,
      guests: existingStats.guests || data.guests,
      crew: existingStats.crew || data.crew
    };

    const newStatsJson = JSON.stringify(enhanced);
    const fixed = html.replace(statsMatch[0], `<script type="application/json" id="ship-stats-fallback">${newStatsJson}</script>`);

    return { html: fixed, enhanced: true };
  } catch (e) {
    return { html, enhanced: false, error: e.message };
  }
}

async function processFile(filepath) {
  const slug = basename(filepath, '.html');
  const html = await readFile(filepath, 'utf8');
  const result = enhanceStats(html, slug);

  if (result.enhanced) {
    await writeFile(filepath, result.html, 'utf8');
    return { status: 'enhanced' };
  }

  return { status: result.reason || 'no data' };
}

async function processCruiseLine(cruiseLine) {
  const lineDir = join(SHIPS_DIR, cruiseLine);
  let files;
  try {
    files = await readdir(lineDir);
  } catch (e) {
    return { cruiseLine, error: e.message, enhanced: 0 };
  }

  const htmlFiles = files.filter(f =>
    f.endsWith('.html') &&
    f !== 'index.html' &&
    !f.includes('unnamed')
  );

  let enhanced = 0;

  for (const file of htmlFiles) {
    const filepath = join(lineDir, file);
    const result = await processFile(filepath);

    if (result.status === 'enhanced') {
      console.log(`  ✅ ${file}: Enhanced stats`);
      enhanced++;
    }
  }

  return { cruiseLine, enhanced, total: htmlFiles.length };
}

async function main() {
  console.log('Batch Fix: Enhance ship-stats-fallback');
  console.log('=======================================\n');

  let totalEnhanced = 0;

  for (const cruiseLine of CRUISE_LINES) {
    console.log(`\n[${cruiseLine}]`);
    const result = await processCruiseLine(cruiseLine);

    if (result.error) {
      console.log(`  ⚠️ Error: ${result.error}`);
    } else {
      console.log(`  Summary: ${result.enhanced} enhanced`);
      totalEnhanced += result.enhanced;
    }
  }

  console.log('\n=======================================');
  console.log(`Total: ${totalEnhanced} files enhanced`);
}

main().catch(console.error);
