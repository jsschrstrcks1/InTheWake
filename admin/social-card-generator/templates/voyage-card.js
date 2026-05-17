import { PALETTE, assertTextColorPair } from '../lib/palette.js';

// Adaptive title size — shorter titles get bigger, longer titles get smaller.
// Tuned empirically against EB Garamond Bold at max-width 1020 on a 1200-wide canvas.
export function titleSize(title) {
  const n = title.length;
  if (n <= 22) return 104;
  if (n <= 32) return 88;
  if (n <= 48) return 78;
  if (n <= 64) return 68;
  return 60;
}

const compassRose = {
  type: 'svg',
  props: {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 300, height: 300, viewBox: '0 0 240 240',
    style: { position: 'absolute', bottom: 30, right: 30, opacity: 0.16 },
    children: [
      { type: 'circle', props: { cx: 120, cy: 120, r: 118, fill: 'none', stroke: PALETTE.accent, strokeWidth: 2 }},
      { type: 'path',   props: { d: 'M120 12 L135 120 L120 228 L105 120 Z', fill: PALETTE.sea }},
      { type: 'path',   props: { d: 'M12 120 L120 135 L228 120 L120 105 Z', fill: PALETTE.sea }},
    ],
  },
};

export function voyageCard({ title, subtitle, byline, url }) {
  // Enforce contrast guards at template construction — fail fast if
  // a future edit introduces a bad pairing.
  assertTextColorPair(PALETTE.sea,       PALETTE.sky);   // title
  assertTextColorPair(PALETTE.inkMid,    PALETTE.sky);   // subtitle
  assertTextColorPair(PALETTE.textMuted, PALETTE.sky);   // byline + URL

  return {
    type: 'div',
    props: {
      style: {
        width: 1200, height: 630,
        background: PALETTE.sky,
        display: 'flex', flexDirection: 'column',
        padding: '90px 90px 70px 90px',
        position: 'relative',
        fontFamily: 'serif',
      },
      children: [
        compassRose,
        { type: 'div', props: {
          style: { display: 'flex', fontFamily: 'serif', fontWeight: 700, fontSize: titleSize(title), lineHeight: 1.06, color: PALETTE.sea, letterSpacing: '-0.01em', maxWidth: 1020 },
          children: title,
        }},
        { type: 'div', props: {
          style: { width: 84, height: 5, background: PALETTE.rope, marginTop: 32, marginBottom: 26 },
        }},
        { type: 'div', props: {
          style: { display: 'flex', fontFamily: 'sans', fontSize: 32, lineHeight: 1.35, color: PALETTE.inkMid, maxWidth: 920 },
          children: subtitle,
        }},
        { type: 'div', props: { style: { flexGrow: 1 }}},
        { type: 'div', props: {
          style: { display: 'flex', justifyContent: 'space-between', fontFamily: 'sans', fontSize: 22, color: PALETTE.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' },
          children: [
            { type: 'span', props: { children: byline }},
            { type: 'span', props: { children: url }},
          ],
        }},
      ],
    },
  };
}
