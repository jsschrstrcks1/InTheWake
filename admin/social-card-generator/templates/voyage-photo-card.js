import { PALETTE, assertTextColorPair } from '../lib/palette.js';

// Photo-led share card for a voyage companion (Facebook / link previews, 1200x630).
// A photograph on the left, a solid --sea panel on the right that carries the words.
// The panel is solid, never a translucent wash over the photo, so the text contrast
// is the same on every photo and the WCAG guard below can actually vouch for it.
// The photo must be the site's own or otherwise licensed for this use without a
// visible credit (a CC BY-SA photo would need its credit on the card).

export const PHOTO_WIDTH = 760;
export const PANEL_WIDTH = 1200 - PHOTO_WIDTH;

export function panelTitleSize(title) {
  const n = title.length;
  if (n <= 14) return 60;
  if (n <= 20) return 52;
  if (n <= 28) return 44;
  return 38;
}

export function voyagePhotoCard({ photoDataUrl, photoAlt, title, kicker, dates, ports, byline, url }) {
  if (!photoDataUrl || !/^data:image\/(jpeg|png|webp);base64,/.test(photoDataUrl)) {
    throw new Error('voyagePhotoCard needs the photo as a base64 data URL (jpeg, png or webp).');
  }
  assertTextColorPair(PALETTE.sky, PALETTE.sea);   // title, kicker, dates
  assertTextColorPair(PALETTE.foam, PALETTE.sea);  // ports, byline, url

  return {
    type: 'div',
    props: {
      style: { width: 1200, height: 630, display: 'flex', flexDirection: 'row', background: PALETTE.sea },
      children: [
        { type: 'img', props: {
          src: photoDataUrl, alt: photoAlt || '', width: PHOTO_WIDTH, height: 630,
          style: { width: PHOTO_WIDTH, height: 630, objectFit: 'cover' },
        }},
        { type: 'div', props: {
          style: {
            width: PANEL_WIDTH, height: 630, display: 'flex', flexDirection: 'column',
            padding: '56px 44px 44px 48px', background: PALETTE.sea, fontFamily: 'sans',
          },
          children: [
            { type: 'div', props: {
              style: { display: 'flex', fontSize: 22, letterSpacing: '0.12em', textTransform: 'uppercase', color: PALETTE.sky },
              children: kicker,
            }},
            { type: 'div', props: {
              style: { display: 'flex', fontFamily: 'serif', fontWeight: 700, fontSize: panelTitleSize(title), lineHeight: 1.05, color: PALETTE.sky, marginTop: 18 },
              children: title,
            }},
            { type: 'div', props: {
              style: { width: 72, height: 5, background: PALETTE.rope, marginTop: 26, marginBottom: 24 },
            }},
            { type: 'div', props: {
              style: { display: 'flex', fontSize: 30, fontWeight: 700, lineHeight: 1.25, color: PALETTE.sky },
              children: dates,
            }},
            { type: 'div', props: {
              style: { display: 'flex', fontSize: 24, lineHeight: 1.4, color: PALETTE.foam, marginTop: 14, maxWidth: PANEL_WIDTH - 92 },
              children: ports,
            }},
            { type: 'div', props: { style: { flexGrow: 1 }}},
            { type: 'div', props: {
              style: { display: 'flex', flexDirection: 'column', fontSize: 20, color: PALETTE.foam, letterSpacing: '0.08em', textTransform: 'uppercase' },
              children: [
                { type: 'span', props: { children: byline }},
                { type: 'span', props: { style: { marginTop: 6, textTransform: 'none', letterSpacing: '0.02em' }, children: url }},
              ],
            }},
          ],
        }},
      ],
    },
  };
}
