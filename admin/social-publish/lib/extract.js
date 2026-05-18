// NOTE: This file is intentionally duplicated from
// admin/social-card-generator/lib/extract.js. The two packages evolve
// independently and a shared module would couple their release cycles.
// If you change the extractor here, mirror it there (and vice versa).
//
import { load } from 'cheerio';

export function extractArticleMeta(html) {
  const $ = load(html);
  const ogTitle       = $('meta[property="og:title"]').attr('content');
  const ogDescription = $('meta[property="og:description"]').attr('content');
  const ogImage       = $('meta[property="og:image"]').attr('content');
  const canonicalUrl  = $('link[rel="canonical"]').attr('href');
  const publishedDate = $('meta[property="article:published_time"]').attr('content') || null;
  const authorUrl     = $('meta[property="article:author"]').attr('content') || null;
  const aiSummary     = $('meta[name="ai-summary"]').attr('content') || null;

  const missing = [];
  if (!ogTitle)       missing.push('og:title');
  if (!ogDescription) missing.push('og:description');
  if (!ogImage)       missing.push('og:image');
  if (!canonicalUrl)  missing.push('canonical');
  if (missing.length) {
    throw new Error(`Article HTML missing required tags: ${missing.join(', ')}`);
  }

  const ogImagePath = ogImage.replace(/^https?:\/\/[^/]+/, '');
  const slug = (canonicalUrl.match(/\/articles\/([^/]+)\.html$/) || [])[1];
  if (!slug) {
    throw new Error(`Could not derive slug from canonical URL: ${canonicalUrl}`);
  }

  let authorName = 'Ken Baker';
  if (authorUrl) {
    const m = authorUrl.match(/\/authors\/([^/]+)\.html$/);
    if (m) {
      authorName = m[1].split('-').map(s => s[0].toUpperCase() + s.slice(1)).join(' ');
    }
  }

  return { title: ogTitle, description: ogDescription, canonicalUrl, ogImageUrl: ogImage, ogImagePath, publishedDate, authorName, slug, aiSummary };
}
