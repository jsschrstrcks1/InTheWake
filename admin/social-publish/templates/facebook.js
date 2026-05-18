// Voice rules enforced here:
//   - no emojis
//   - no exclamation points
//   - no "Discover/Unlock/Learn/Wondering" hooks
//   - prefer ai-summary (more specifics) over og:description
//   - URL goes inline; FB auto-collapses it once it detects and unfurls

const BANNED_HOOK = /\b(Discover|Unlock|Learn|Wondering)\b/;
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

export function composeFacebookPost({ title, description, aiSummary, canonicalUrl }) {
  const body = (aiSummary && aiSummary.trim()) || description;
  if (EMOJI.test(body) || /!/.test(body) || BANNED_HOOK.test(body)) {
    throw new Error(
      `Composed post body trips voice rules. Source text: ${JSON.stringify(body)}. ` +
      `Fix the article's ai-summary or og:description before publishing.`
    );
  }
  return {
    message: `${body.trim()}\n\n${canonicalUrl}`,
    link:    canonicalUrl,
  };
}
