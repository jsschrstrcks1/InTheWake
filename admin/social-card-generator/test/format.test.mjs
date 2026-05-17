import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatBylineDate, buildByline } from '../lib/format.js';

test('formatBylineDate: ISO date -> "D MMM YYYY" uppercase-ready', () => {
  assert.equal(formatBylineDate('2026-05-08'), '8 May 2026');
  assert.equal(formatBylineDate('2026-01-18'), '18 Jan 2026');
  assert.equal(formatBylineDate('2026-12-31'), '31 Dec 2026');
});

test('formatBylineDate: returns empty string for null/missing', () => {
  assert.equal(formatBylineDate(null), '');
  assert.equal(formatBylineDate(undefined), '');
  assert.equal(formatBylineDate(''), '');
});

test('buildByline: name + date with bullet separator', () => {
  assert.equal(buildByline('Ken Baker', '2026-05-08'), 'Ken Baker  ·  8 May 2026');
});

test('buildByline: name only when date is missing', () => {
  assert.equal(buildByline('Ken Baker', null), 'Ken Baker');
});
