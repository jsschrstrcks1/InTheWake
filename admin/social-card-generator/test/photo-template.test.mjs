import { test } from 'node:test';
import assert from 'node:assert/strict';
import { voyagePhotoCard, panelTitleSize, portLine, PHOTO_WIDTH, PANEL_WIDTH } from '../templates/voyage-photo-card.js';

const DATA = 'data:image/jpeg;base64,/9j/AAAA';
const base = { photoDataUrl: DATA, photoAlt: 'a', title: 'MSC World America', kicker: 'Family voyage', dates: 'Dec 5', ports: 'Miami', byline: 'In the Wake', url: 'cruisinginthewake.com' };

test('photo card is 1200x630: photo on the left, solid sea panel on the right', () => {
  const tree = voyagePhotoCard(base);
  assert.equal(tree.props.style.width, 1200);
  assert.equal(tree.props.style.height, 630);
  const [img, panel] = tree.props.children;
  assert.equal(img.type, 'img');
  assert.equal(img.props.width, PHOTO_WIDTH);
  assert.equal(panel.props.style.width, PANEL_WIDTH);
  assert.equal(PHOTO_WIDTH + PANEL_WIDTH, 1200);
  assert.equal(panel.props.style.background, '#0a3d62', 'text sits on solid --sea, never over the photo');
});

test('photo card refuses anything but an embedded image', () => {
  assert.throws(() => voyagePhotoCard({ ...base, photoDataUrl: 'https://example.com/x.jpg' }), /base64 data URL/);
  assert.throws(() => voyagePhotoCard({ ...base, photoDataUrl: '' }), /base64 data URL/);
});

test('panel title size steps down as titles grow', () => {
  assert.equal(panelTitleSize('a'.repeat(14)), 60);
  assert.equal(panelTitleSize('a'.repeat(15)), 52);
  assert.equal(panelTitleSize('a'.repeat(21)), 44);
  assert.equal(panelTitleSize('a'.repeat(29)), 38);
});

test('port line keeps names whole and never starts a line with a dot', () => {
  const line = portLine(['Port Canaveral', 'Great Stirrup Cay', 'Cozumel']);
  assert.equal(line, 'Port\u00a0Canaveral\u00a0· Great\u00a0Stirrup\u00a0Cay\u00a0· Cozumel');
  assert.ok(!/ ·/.test(line), 'no breakable space before a separator');
  assert.equal(portLine('Already a string'), 'Already a string');
});
