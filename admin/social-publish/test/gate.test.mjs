import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gatePublishDecision } from '../lib/gate.js';

function article({ section = 'Cruise Planning', sources = true, disclosure = true, body = 'The ship sailed on schedule. Reports confirm it.' } = {}) {
  return `<!doctype html><html><head>
    <meta property="article:section" content="${section}"/>
    </head><body>
    <div itemprop="articleBody">
      <p>${body}</p>
      ${disclosure ? '<p>I was not aboard; this article is a synthesis of the published record.</p>' : ''}
      ${sources ? '<h2 id="sources">Sources</h2><ul><li>CDC Vessel Sanitation Program — primary record</li></ul>' : ''}
    </div>
    </body></html>`;
}

test('clean synthesis article publishes', () => {
  const d = gatePublishDecision(article(), 'articles/clean-2026.html');
  assert.equal(d.publish, true);
  assert.equal(d.blockedBy, null);
});

test('missing sources blocks', () => {
  const d = gatePublishDecision(article({ sources: false }), 'articles/no-sources-2026.html');
  assert.equal(d.publish, false);
  assert.equal(d.blockedBy, 'sources_required');
});

test('missing disclosure blocks', () => {
  const d = gatePublishDecision(article({ disclosure: false }), 'articles/no-disclosure-2026.html');
  assert.equal(d.publish, false);
  assert.ok(d.findings.some((f) => f.policy === 'authorship_disclosure_required'));
});

test('dated attestation satisfies disclosure invariant', () => {
  const d = gatePublishDecision(
    article({ disclosure: false, body: 'I sailed Allure on the western Caribbean in March 2024. The tender was rough.' }),
    'articles/attested-2026.html',
  );
  assert.equal(d.publish, true);
});

test('pastoral section blocks', () => {
  const d = gatePublishDecision(article({ section: 'Grief and Healing' }), 'articles/comfort-2026.html');
  assert.equal(d.publish, false);
  assert.equal(d.blockedBy, 'pastoral_no_auto_publish');
});

test('pastoral slug blocks even with clean section', () => {
  const d = gatePublishDecision(article(), 'articles/rest-for-wounded-healers.html');
  assert.equal(d.publish, false);
  assert.equal(d.blockedBy, 'pastoral_no_auto_publish');
});

test('unparseable input fails closed', () => {
  const d = gatePublishDecision(null, 'articles/broken.html');
  assert.equal(d.publish, false);
});
