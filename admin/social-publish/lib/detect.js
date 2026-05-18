import { load } from 'cheerio';

// Parse `git diff --name-status HEAD~1 HEAD` output and return any
// newly-added file paths matching exactly articles/<name>.html.
export function newArticlesFromDiff(diffText) {
  return diffText
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [status, ...pathParts] = line.split(/\s+/);
      return { status, path: pathParts.join(' ') };
    })
    .filter(({ status, path }) =>
      status === 'A' && /^articles\/[^/]+\.html$/.test(path)
    )
    .map(({ path }) => path);
}

export function articleOptOut(html) {
  const $ = load(html);
  return $('meta[name="social-publish"]').attr('content') === 'skip';
}
