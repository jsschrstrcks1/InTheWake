import satori from 'satori';
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { voyageCard } from '../templates/voyage-card.js';
import { voyagePhotoCard, PHOTO_WIDTH } from '../templates/voyage-photo-card.js';

const here = dirname(fileURLToPath(import.meta.url));
const fontPath = (rel) => `${here}/../node_modules/${rel}`;

const FONTS = [
  { name: 'serif', weight: 400, style: 'normal', data: readFileSync(fontPath('@fontsource/eb-garamond/files/eb-garamond-latin-400-normal.woff')) },
  { name: 'serif', weight: 700, style: 'normal', data: readFileSync(fontPath('@fontsource/eb-garamond/files/eb-garamond-latin-700-normal.woff')) },
  { name: 'sans',  weight: 400, style: 'normal', data: readFileSync(fontPath('@fontsource/public-sans/files/public-sans-latin-400-normal.woff')) },
  { name: 'sans',  weight: 700, style: 'normal', data: readFileSync(fontPath('@fontsource/public-sans/files/public-sans-latin-700-normal.woff')) },
];

export async function renderCard({ title, subtitle, byline, url, outPath }) {
  const tree = voyageCard({ title, subtitle, byline, url });
  const svg = await satori(tree, { width: 1200, height: 630, fonts: FONTS });
  const jpg = await sharp(Buffer.from(svg))
    .jpeg({ quality: 90, progressive: true, mozjpeg: true })
    .toBuffer();
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, jpg);
  return { bytes: jpg.length };
}

// Photo-led voyage card. The photo is scaled to the card height and cut to the left panel's
// width; cropLeft (pixels, after scaling) chooses which part of a wide photo shows.
export async function renderPhotoCard({ photoPath, photoAlt, cropLeft = 0, title, kicker, dates, ports, byline, url, outPath }) {
  const scaled = sharp(photoPath).resize({ height: 630 });
  const { info } = await scaled.clone().toBuffer({ resolveWithObject: true });
  if (cropLeft < 0 || cropLeft + PHOTO_WIDTH > info.width) {
    throw new Error(`cropLeft ${cropLeft} leaves the ${PHOTO_WIDTH}px panel outside the ${info.width}px-wide scaled photo.`);
  }
  const photo = await scaled.extract({ left: cropLeft, top: 0, width: PHOTO_WIDTH, height: 630 }).jpeg({ quality: 88 }).toBuffer();
  const photoDataUrl = 'data:image/jpeg;base64,' + photo.toString('base64');
  const tree = voyagePhotoCard({ photoDataUrl, photoAlt, title, kicker, dates, ports, byline, url });
  const svg = await satori(tree, { width: 1200, height: 630, fonts: FONTS });
  const jpg = await sharp(Buffer.from(svg)).jpeg({ quality: 88, progressive: true, mozjpeg: true }).toBuffer();
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, jpg);
  return { bytes: jpg.length };
}
