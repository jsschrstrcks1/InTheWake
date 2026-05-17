import satori from 'satori';
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { voyageCard } from '../templates/voyage-card.js';

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
