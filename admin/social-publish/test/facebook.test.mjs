import { test } from 'node:test';
import assert from 'node:assert/strict';
import { postToPage, scrapeBust, classifyError } from '../lib/facebook.js';

const originalFetch = globalThis.fetch;

test('postToPage: posts message+link, returns id+permalink', async () => {
  globalThis.fetch = async (url, opts) => {
    assert.match(url, /\/v\d+\.\d+\/PAGE_X\/feed/);
    const body = JSON.parse(opts.body);
    assert.equal(body.message, 'hello\n\nhttps://x/y');
    assert.equal(body.link, 'https://x/y');
    assert.equal(body.access_token, 'TOKEN_X');
    return { ok: true, status: 200, json: async () => ({ id: 'PAGE_X_999' }) };
  };
  try {
    const r = await postToPage({
      pageId: 'PAGE_X', accessToken: 'TOKEN_X',
      message: 'hello\n\nhttps://x/y', link: 'https://x/y',
    });
    assert.equal(r.post_id, 'PAGE_X_999');
    assert.equal(r.permalink, 'https://www.facebook.com/PAGE_X/posts/999');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('postToPage: throws on 401 with classified message', async () => {
  globalThis.fetch = async () => ({
    ok: false, status: 401,
    json: async () => ({ error: { code: 190, message: 'Session expired' }}),
  });
  try {
    await assert.rejects(
      postToPage({ pageId: 'P', accessToken: 'BAD', message: 'm', link: 'l' }),
      /TOKEN.*expired|invalid/i
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('classifyError: maps OAuth 190 to TOKEN_INVALID', () => {
  assert.equal(classifyError({ code: 190 }), 'TOKEN_INVALID');
  assert.equal(classifyError({ code: 200 }), 'PERMISSION_DENIED');
  assert.equal(classifyError({ code: 4 }), 'RATE_LIMITED');
  assert.equal(classifyError({ code: 9999 }), 'UNKNOWN');
});

test('scrapeBust: POSTs to debug-scrape endpoint without throwing on non-200', async () => {
  globalThis.fetch = async (url) => {
    assert.match(url, /graph\.facebook\.com.*scrape=true/);
    return { ok: false, status: 500, json: async () => ({}) };
  };
  try {
    // scrapeBust is fire-and-forget; must not throw
    await scrapeBust({ url: 'https://x/y', accessToken: 'T' });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
