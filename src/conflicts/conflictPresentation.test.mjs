import test from 'node:test';
import assert from 'node:assert/strict';
import {
  conflictIdFromPick,
  formatConflictCoordinates,
  formatReviewDate,
  safeSourceUrl,
} from './conflictPresentation.js';

test('conflict picks are scoped so other layers cannot open SITREPs', () => {
  assert.equal(conflictIdFromPick('gev-conflict:ukraine'), 'ukraine');
  for (const value of [
    null,
    123,
    'ukraine',
    'flights:ukraine',
    'gev-conflict:',
  ]) {
    assert.equal(conflictIdFromPick(value), null);
  }
});

test('source links only navigate to web resources', () => {
  assert.equal(
    safeSourceUrl('https://www.un.org/en/'),
    'https://www.un.org/en/',
  );
  for (const value of [
    'javascript:alert(1)',
    'data:text/html,test',
    '/relative',
    'file:///etc/passwd',
  ]) {
    assert.equal(safeSourceUrl(value), null);
  }
});

test('coordinates preserve hemispheres and review dates are timezone independent', () => {
  assert.equal(
    formatConflictCoordinates(-12.34, -68.9),
    '12.34° S  /  68.90° W',
  );
  assert.equal(formatConflictCoordinates(0, 22), '0.00° N  /  22.00° E');
  assert.match(formatReviewDate('2026-09-13'), /13/);
  assert.match(formatReviewDate('2026-09-13'), /2026/);
  assert.equal(formatReviewDate('invalid'), 'Date unavailable');
});
