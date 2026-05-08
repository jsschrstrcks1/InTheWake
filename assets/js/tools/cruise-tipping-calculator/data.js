// assets/js/tools/cruise-tipping-calculator/data.js
const BRANDS_URL = "/assets/data/brands.json";
const TIPPING_URL = (slug) => `/assets/data/tipping/${slug}.json`;

const cache = { lines: new Map(), order: [] };

export async function loadAll() {
  const brands = await (await fetch(BRANDS_URL)).json();
  const slugs = brands.brands.map(b => b.id);
  const configs = await Promise.all(slugs.map(async (slug) => {
    try {
      const res = await fetch(TIPPING_URL(slug));
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }));
  cache.lines.clear();
  cache.order = [];
  configs.forEach((cfg, i) => {
    if (!cfg) return;
    cache.lines.set(slugs[i], cfg);
    cache.order.push(slugs[i]);
  });
}

export function getLine(slug) {
  return cache.lines.get(slug) || null;
}

export function listLines() {
  return cache.order.map(slug => cache.lines.get(slug));
}
