// check-pack-pdf-links: a shipped pack PDF may not carry a file:// link or a link to a site
// page that does not exist, and a PDF it cannot read is never reported clean. Soli Deo Gloria.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { scan, checkPdf, SITE } from '../../admin/scripts/check-pack-pdf-links.mjs';

const ROOT = new URL('../../', import.meta.url);
const pdf = (...parts) => Buffer.concat([Buffer.from('%PDF-1.7\n'), ...parts.map((p) => (Buffer.isBuffer(p) ? p : Buffer.from(p)))]);
const stream = (text) => Buffer.concat([Buffer.from('1 0 obj\n<< /Filter /FlateDecode >>\nstream\n'), deflateSync(Buffer.from(text)), Buffer.from('\nendstream\nendobj\n')]);

test('a file:// link in the body is reported', () => {
  const r = checkPdf(pdf('<< /Type /Annot /Subtype /Link /A << /URI (file:///home/user/InTheWake/ports/x.html) >> >>'));
  assert.equal(r.fileLinks.length, 1);
});

test('links inside two back-to-back compressed streams are both read', () => {
  const r = scan(pdf(
    stream(`<< /Subtype /Link /A << /URI (${SITE}index.html) >> >>`),
    stream('<< /Subtype /Link /A << /URI (file:///Users/ken/InTheWake/ports/y.html) >> >>'),
  ));
  assert.equal(r.uris.length, 2, 'the second stream was skipped: the "stream" inside "endstream" bug');
  assert.equal(r.linkAnnots, 2);
});

test('a site link to a page that is not in the repo is reported; one that is, is not', () => {
  const r = checkPdf(pdf(stream(`/URI (${SITE}ports/no-such-port-anywhere.html) /URI (${SITE}drink-calculator.html?line=ncl) /URI (${SITE}ships/)`)));
  assert.deepEqual(r.missing, [`${SITE}ports/no-such-port-anywhere.html`]);
});

test('link annotations whose targets cannot be read are not mistaken for "no links"', () => {
  const r = checkPdf(pdf('<< /Type /Annot /Subtype /Link /Dest [3 0 R /Fit] >>'));
  assert.equal(r.total, 0);
  assert.ok(r.linkAnnots > 0, 'the CLI treats this as UNAVAILABLE, never CLEAN');
});

test('the rebuilt Prima PDFs are clean', () => {
  for (const f of ['ships/norwegian/v0.1.9-ncl-prima-solo-group-sep-2026.pdf', 'admin/voyage-packs/v0.1.9-ncl-prima-solo-group-condensed.pdf']) {
    const r = checkPdf(readFileSync(new URL(f, ROOT)));
    assert.ok(r.total > 0, `${f}: no links read`);
    assert.deepEqual(r.fileLinks, [], `${f}: file:// links`);
    assert.deepEqual(r.missing, [], `${f}: missing pages`);
  }
});
