import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONFLICT_ZONES,
  CONFLICT_COVERAGE,
  CONFLICT_REGIONS,
  filterConflicts,
} from './conflictCatalog.js';

test('each briefing has a unique stable identity, valid map anchor and complete provenance', () => {
  assert.ok(CONFLICT_ZONES.length >= 25, 'maintain broad regional coverage');
  assert.equal(
    new Set(CONFLICT_ZONES.map((zone) => zone.id)).size,
    CONFLICT_ZONES.length,
  );
  const severities = new Set(['critical', 'high', 'elevated']);
  const statuses = new Set([
    'Armed conflict',
    'Security crisis',
    'Conflict aftermath',
    'Flashpoint',
  ]);
  for (const zone of CONFLICT_ZONES) {
    assert.match(zone.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    for (const key of [
      'title',
      'region',
      'summary',
      'context',
      'humanitarian',
    ]) {
      assert.ok(
        typeof zone[key] === 'string' && zone[key].trim(),
        `${zone.id}: missing ${key}`,
      );
    }
    assert.ok(
      Number.isFinite(zone.latitude) && Math.abs(zone.latitude) <= 90,
      zone.id,
    );
    assert.ok(
      Number.isFinite(zone.longitude) && Math.abs(zone.longitude) <= 180,
      zone.id,
    );
    assert.ok(severities.has(zone.severity), zone.id);
    assert.ok(statuses.has(zone.status), zone.id);
    assert.ok(
      zone.actors.length > 0 &&
        zone.actors.every((actor) => typeof actor === 'string' && actor.trim()),
    );
    assert.match(zone.updatedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(zone.updatedAt, CONFLICT_COVERAGE.updatedAt);
    assert.ok(zone.sources.length > 0, zone.id);
    for (const source of zone.sources) {
      assert.ok(source.name.trim());
      const url = new URL(source.url);
      assert.equal(url.protocol, 'https:');
      assert.ok(
        [
          'www.icrc.org',
          'www.cfr.org',
          'www.unocha.org',
          'www.ochaopt.org',
        ].includes(url.hostname),
      );
      assert.equal(url.username + url.password, '');
      assert.notEqual(
        url.pathname,
        '/',
        'link to the relevant briefing, not a homepage',
      );
    }
  }
});

test('coverage metadata preserves snapshot limitations and regional breadth', () => {
  assert.equal(CONFLICT_COVERAGE.live, false);
  assert.equal(CONFLICT_COVERAGE.exhaustive, false);
  assert.match(CONFLICT_COVERAGE.disclaimer, /not exhaustive/i);
  assert.match(CONFLICT_COVERAGE.markerNote, /representative/);
  assert.match(CONFLICT_COVERAGE.severityNote, /editorial/);
  assert.deepEqual(CONFLICT_REGIONS, [
    'Africa',
    'Americas',
    'Asia & Pacific',
    'Europe & Eurasia',
    'Middle East & North Africa',
  ]);
  assert.equal(
    CONFLICT_ZONES.find((zone) => zone.id === 'taiwan-strait').status,
    'Flashpoint',
  );
  assert.equal(
    CONFLICT_ZONES.find((zone) => zone.id === 'libya').status,
    'Conflict aftermath',
  );
});

test('search combines case-insensitive terms with region and attention filters', () => {
  assert.deepEqual(
    filterConflicts({ query: '  UKRAINE  Russian ' }).map((zone) => zone.id),
    ['ukraine'],
  );
  assert.ok(
    filterConflicts({ query: 'Houthis' }).some(
      (zone) => zone.id === 'yemen-red-sea',
    ),
  );
  assert.deepEqual(
    filterConflicts({ query: 'Ukraine', region: 'Americas' }),
    [],
  );
  assert.ok(
    filterConflicts({ region: 'Africa', severity: 'critical' }).length > 0,
  );
  assert.ok(
    filterConflicts({ region: 'Africa', severity: 'critical' }).every(
      (zone) => zone.region === 'Africa' && zone.severity === 'critical',
    ),
  );
  assert.deepEqual(filterConflicts({ query: 'unmatched-place-xyz' }), []);
  assert.deepEqual(filterConflicts({ region: 'invalid' }), []);
  assert.deepEqual(filterConflicts({ query: null }), CONFLICT_ZONES);
});

test('results cannot corrupt the source snapshot or alter later map selections', () => {
  const results = filterConflicts();
  assert.notEqual(results, CONFLICT_ZONES);
  results.pop();
  assert.equal(filterConflicts().length, CONFLICT_ZONES.length);
  assert.throws(() => {
    CONFLICT_ZONES[0].latitude = 0;
  }, TypeError);
  assert.throws(() => {
    CONFLICT_ZONES[0].sources[0].url = 'javascript:alert(1)';
  }, TypeError);
  assert.throws(() => {
    CONFLICT_ZONES[0].actors.push('unknown');
  }, TypeError);
});
