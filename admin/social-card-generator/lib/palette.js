// Site tokens mirrored from /assets/styles.css :root.
// Cards must only use these — no invented colors.

export const PALETTE = Object.freeze({
  sky:       '#f7fdff',
  foam:      '#e6f4f8',
  sea:       '#0a3d62',
  ink:       '#083041',
  rope:      '#d9b382',
  accent:    '#0e6e8e',
  accentDark:'#005a9c',
  inkMid:    '#3d5a6a',
  textMuted: '#2a4a5a',
});

// WCAG 2.1 relative luminance.
function relativeLuminance(hex) {
  const n = hex.replace('#', '');
  const [r, g, b] = [n.slice(0, 2), n.slice(2, 4), n.slice(4, 6)].map(c => {
    const v = parseInt(c, 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(fgHex, bgHex) {
  const a = relativeLuminance(fgHex);
  const b = relativeLuminance(bgHex);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

// Throws if a text color paired with a background fails WCAG 2.1 AA for
// normal text (4.5:1). The renderer calls this for every text element.
export function assertTextColorPair(fgHex, bgHex) {
  const ratio = contrastRatio(fgHex, bgHex);
  if (ratio < 4.5) {
    throw new Error(
      `Card text contrast ${ratio.toFixed(2)}:1 fails WCAG AA on ${fgHex} over ${bgHex}. ` +
      (fgHex.toLowerCase() === PALETTE.rope.toLowerCase()
        ? 'Rope is decorative-only on pale backgrounds; never use it as text color over --sky or --foam.'
        : 'Pick a darker text color or a darker background.')
    );
  }
}
