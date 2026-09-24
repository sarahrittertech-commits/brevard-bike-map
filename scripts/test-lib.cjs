#!/usr/bin/env node
/**
 * Unit tests for the data selection logic.
 * Implements checks UT-1 to UT-5 from the test case documentation.
 *
 * These run against src/lib/select.js, which holds the pure functions that
 * src/lib/data.js re-exports once the bundled data is bound to them. There is
 * no test runner by design (ADR-0004's spirit: nothing the project can do
 * without), so this file is a plain node script like validate-data.cjs.
 *
 * Fixtures rather than the real dataset: these assert behaviour, and should not
 * start failing because a cafe closed. The real data is checked by DT-1 to DT-7.
 *
 * Usage:
 *   node scripts/test-lib.cjs
 */

const assert = require('node:assert/strict');
const {
  toLatLng,
  lineToLatLngs,
  displayCategory,
  selectVisible,
  selectStopPins,
} = require('../src/lib/select');

const tests = [];
const test = (id, name, fn) => tests.push({ id, name, fn });

// Fixtures. Mile markers are deliberately out of file order so a function that
// forgets to sort cannot pass by accident.
const OAKLAND = { id: 'oakland', name: 'Oakland Cafe', categories: ['coffee'], mileMarker: 2.1 };
const DOLLYS = { id: 'dollys', name: "Dolly's", categories: ['ice-cream'], mileMarker: 0.8 };
const BRACKEN = {
  id: 'bracken',
  name: 'Bracken Mountain Bakery',
  categories: ['coffee', 'brewery'],
  mileMarker: 1.4,
  coordinates: [-82.7345, 35.2331],
};
const DESTINATIONS = [OAKLAND, DOLLYS, BRACKEN];
const BY_ID = Object.fromEntries(DESTINATIONS.map((d) => [d.id, d]));

test('UT-1', 'visibleDestinations: one category on returns only that category, by mile marker', () => {
  const visible = selectVisible(DESTINATIONS, ['coffee']);
  assert.deepEqual(
    visible.map((d) => d.id),
    ['bracken', 'oakland'],
    'expected only the coffee places, nearest mile marker first'
  );

  // A place in two categories appears when either one is on.
  assert.deepEqual(
    selectVisible(DESTINATIONS, ['brewery']).map((d) => d.id),
    ['bracken']
  );

  // Switching on several categories merges them into one mile-ordered list.
  assert.deepEqual(
    selectVisible(DESTINATIONS, ['coffee', 'ice-cream']).map((d) => d.id),
    ['dollys', 'bracken', 'oakland']
  );
});

test('UT-2', 'visibleDestinations: nothing switched on shows just the path', () => {
  assert.deepEqual(selectVisible(DESTINATIONS, []), []);
  // An unknown category is not a wildcard.
  assert.deepEqual(selectVisible(DESTINATIONS, ['nonexistent']), []);
});

test('UT-3', 'displayCategory: a two-category place draws as whichever one is on', () => {
  assert.equal(displayCategory(BRACKEN, ['brewery']), 'brewery');
  assert.equal(displayCategory(BRACKEN, ['coffee']), 'coffee');

  // Both on: the place's own order decides, so the pin colour is stable
  // rather than depending on the order the rider tapped the rail.
  assert.equal(displayCategory(BRACKEN, ['brewery', 'coffee']), 'coffee');
  assert.equal(displayCategory(BRACKEN, ['coffee', 'brewery']), 'coffee');

  // Nothing on: falls back to the first category rather than undefined, so a
  // pin drawn during a transition still has a colour.
  assert.equal(displayCategory(BRACKEN, []), 'coffee');
});

test('UT-4', 'adventureStopPins: unpinned stops are skipped, numbering keeps its index', () => {
  const adventure = {
    id: 'test-ride',
    stops: [
      { name: 'Start at the trailhead', destination: 'dollys' },
      { name: 'Cross the bridge' }, // scenery, not a place — no destination
      { name: 'Coffee', destination: 'bracken' },
      { name: 'Somewhere renamed', destination: 'no-such-place' },
    ],
  };

  const pins = selectStopPins(adventure, BY_ID);

  assert.equal(pins.length, 2, 'expected the two stops that resolve to a destination');
  assert.deepEqual(
    pins.map((p) => p.index),
    [0, 2],
    'expected the original stop indices, so map numbers match the itinerary'
  );
  // The pin carries the stop's own wording, not the destination's name.
  assert.equal(pins[0].name, 'Start at the trailhead');
  assert.deepEqual(pins[1].coordinates, BRACKEN.coordinates);

  // An adventure whose stops are all scenery draws no numbered pins.
  assert.deepEqual(selectStopPins({ id: 'x', stops: [{ name: 'A view' }] }, BY_ID), []);
});

test('UT-5', 'toLatLng: GeoJSON [lon, lat] becomes { latitude, longitude }', () => {
  assert.deepEqual(toLatLng([-82.73, 35.23]), { latitude: 35.23, longitude: -82.73 });

  // The failure this exists to catch: latitude must be the positive one in
  // Brevard. A swap puts the app off the coast of Somalia.
  const { latitude, longitude } = toLatLng([-82.73, 35.23]);
  assert.ok(latitude > 0 && longitude < 0, 'latitude and longitude are swapped');

  // lineToLatLngs unwraps a geometry and converts every point in order.
  assert.deepEqual(lineToLatLngs({ coordinates: [[-82.73, 35.23], [-82.7, 35.25]] }), [
    { latitude: 35.23, longitude: -82.73 },
    { latitude: 35.25, longitude: -82.7 },
  ]);
});

// Run
const failures = [];

for (const { id, name, fn } of tests) {
  try {
    fn();
    console.log(`  pass     [${id}] ${name}`);
  } catch (err) {
    console.log(`  FAIL     [${id}] ${name}`);
    failures.push({ id, name, err });
  }
}

console.log(`\nRan ${tests.length} unit test${tests.length === 1 ? '' : 's'}`);

if (failures.length) {
  console.error(`\n${failures.length} failed:\n`);
  for (const { id, err } of failures) {
    console.error(`  [${id}] ${err.message}`);
    if (err.expected !== undefined) {
      console.error(`    expected: ${JSON.stringify(err.expected)}`);
      console.error(`    actual:   ${JSON.stringify(err.actual)}`);
    }
    console.error('');
  }
  process.exit(1);
}

console.log('All unit tests passed.');
