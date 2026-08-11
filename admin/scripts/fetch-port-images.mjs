#!/usr/bin/env node
/**
 * fetch-port-images.mjs — download, compress and attribute port-page images.
 * Soli Deo Gloria.
 *
 * Reads an images manifest, pulls each file from Wikimedia Commons, resizes to
 * the site's 1600px / ~300KB budget, writes it as .webp under
 * ports/img/<slug>/, and writes the matching .webp.attr.json sidecar so the
 * license and photographer travel with the file forever.
 *
 * IT DOES NOT VERIFY SUBJECT MATTER. Filenames lie — a "Resilient Lady" file on
 * this site once turned out to be two cocktails. After running this, OPEN every
 * image and confirm it shows what the caption claims before the page ships.
 * (Voyage-pack README §B, the "cocktails-as-ship" rule.)
 *
 * Usage: node admin/scripts/fetch-port-images.mjs admin/port-specs/<slug>.images.json
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const UA = 'InTheWake-PortPageBuilder/1.0 (https://cruisinginthewake.com; independent cruise logbook)';

const manifestPath = process.argv[2];
if (!manifestPath) { console.error('usage: fetch-port-images.mjs <images.json>'); process.exit(2); }
const man = JSON.parse(readFileSync(manifestPath.startsWith('/') ? manifestPath : join(REPO, manifestPath), 'utf-8'));

const outDir = join(REPO, 'ports', 'img', man.slug);
mkdirSync(outDir, { recursive: true });

const py = `
import sys, os
from PIL import Image, ImageOps
src, dst, maxw = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = Image.open(src)
# Honour the EXIF orientation tag before anything else. Phone and DSLR files
# routinely store a landscape buffer plus "rotate 90"; PIL ignores that on its
# own, which silently ships sideways photos (caught on the New Plymouth
# Coastal Walkway image, 2026-07-30).
im = ImageOps.exif_transpose(im)
if im.mode in ('P','RGBA','LA'):
    im = im.convert('RGBA') if 'A' in im.mode else im.convert('RGB')
if im.mode not in ('RGB','RGBA'):
    im = im.convert('RGB')
w,h = im.size
if w > maxw:
    im = im.resize((maxw, int(h*maxw/w)), Image.LANCZOS)
q = 82
im.save(dst, 'WEBP', quality=q, method=6)
while os.path.getsize(dst) > 320*1024 and q > 50:
    q -= 8
    im.save(dst, 'WEBP', quality=q, method=6)
print(f"{im.size[0]}x{im.size[1]} q{q} {os.path.getsize(dst)//1024}KB")
`;
const pyPath = '/tmp/_itw_img_convert.py';
writeFileSync(pyPath, py);

let ok = 0, failed = [];
for (const im of man.images) {
  const dst = join(outDir, im.file);
  if (existsSync(dst) && !process.env.FORCE_REFETCH) { console.log(`· ${im.file} exists, skipping`); ok++; continue; }
  const tmp = `/tmp/_itw_dl_${im.file.replace(/\W/g, '_')}`;
  try {
    execFileSync('curl', ['-sSL', '--max-time', '180', '-A', UA, '-o', tmp, im.url], { stdio: 'pipe' });
    const info = execFileSync('python3', [pyPath, tmp, dst, String(man.max_width || 1600)], { encoding: 'utf-8' }).trim();
    writeFileSync(dst + '.attr.json', JSON.stringify({
      source: im.commons,
      direct_url: im.url,
      license: im.license,
      artist: im.credit,
      description: im.subject,
      downloaded: man.downloaded || new Date().toISOString().slice(0, 10),
      verified_subject: false,
      _note: 'verified_subject flips to true only after a human/agent has LOOKED at the file and confirmed it matches `description`.',
    }, null, 2) + '\n');
    console.log(`✓ ${im.file}  ${info}`);
    ok++;
  } catch (e) {
    console.error(`✗ ${im.file}: ${String(e.message).slice(0, 160)}`);
    failed.push(im.file);
  }
}
console.log(`\n${ok}/${man.images.length} images written to ports/img/${man.slug}/`);
if (failed.length) { console.error('FAILED: ' + failed.join(', ')); process.exit(1); }
console.log('NEXT: open every image and confirm it shows what the caption claims, then flip verified_subject.');
