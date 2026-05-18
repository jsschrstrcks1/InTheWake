const GRAPH_VERSION = 'v21.0';  // Confirm latest stable at implementation time
                                 // via developers.facebook.com/docs/graph-api/changelog
                                 // Once locked, don't chase newer versions casually.
const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`;

export function classifyError(err) {
  switch (err && err.code) {
    case 190: return 'TOKEN_INVALID';     // expired or revoked
    case 200: return 'PERMISSION_DENIED'; // missing pages_manage_posts
    case 4:
    case 17:
    case 32: return 'RATE_LIMITED';
    default:  return 'UNKNOWN';
  }
}

export async function postToPage({ pageId, accessToken, message, link }) {
  const url = `${GRAPH}/${pageId}/feed`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, link, access_token: accessToken }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const cls = classifyError(data.error);
    if (cls === 'TOKEN_INVALID') {
      throw new Error(
        `Facebook Page token expired or invalid. ` +
        `Regenerate via Graph API Explorer (developers.facebook.com/tools/explorer) → ` +
        `select Page → Generate Access Token → exchange for long-lived → ` +
        `paste into FACEBOOK_PAGE_ACCESS_TOKEN secret.`
      );
    }
    throw new Error(`Facebook ${cls}: ${data.error && data.error.message} (HTTP ${res.status})`);
  }
  const postId = data.id;
  const parts = postId.split('_');
  const numericPostId = parts.length > 1 ? parts[parts.length - 1] : postId;
  return {
    post_id: postId,
    permalink: `https://www.facebook.com/${pageId}/posts/${numericPostId}`,
  };
}

// Fire-and-forget: forces FB to re-scrape the URL's OG metadata.
// Never throws — even a failure is recoverable on the next share.
export async function scrapeBust({ url, accessToken }) {
  try {
    await fetch(`${GRAPH}/?id=${encodeURIComponent(url)}&scrape=true&access_token=${encodeURIComponent(accessToken)}`, {
      method: 'POST',
    });
  } catch (_) { /* intentional swallow */ }
}
