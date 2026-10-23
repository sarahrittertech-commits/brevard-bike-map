#!/usr/bin/env node
/**
 * Unit tests for the data selection logic.
 * Implements checks UT-1 to UT-10 from the test case documentation.
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
  forApp,
  toLatLng,
  lineToLatLngs,
  displayCategory,
  selectVisible,
  selectStopPins,
  isNearArea,
  buildRouteGraph,
  routeOnGraph,
  rideMinutes,
  nextStopIndex,
  progressAlong,
} = require('../src/lib/select');

const tests = [];
const test = (id, name, fn) => tests.push({ id, name, fn });

// Fixtures. Mile markers are deliberately out of file order so a function that
// forgets to sort cannot pass by accident.
const OAKLAND = { id: 'oakland', name: 'Oakland Cafe', categories: ['coffee'], mileMarker: 2.1 };
const DOLLYS = { id: 'dollys', name: "Dolly's", categories: ['ice-cream'], mileMarker: 0.8, coordinates: [-82.7531, 35.2843] };
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

  // A stop's own coordinates pin it, and win over its destination's.
  const own = selectStopPins(
    { id: 'y', stops: [{ name: 'Sculpture', coordinates: [-82.73, 35.23] }, { name: 'Dolly', destination: 'dollys', coordinates: [-82.74, 35.24] }] },
    BY_ID
  );
  assert.deepEqual(own.map((p) => p.coordinates), [[-82.73, 35.23], [-82.74, 35.24]]);

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

test('UT-6', 'isNearArea: centres on a rider in town, not one far away', () => {
  const area = [toLatLng([-82.75, 35.22]), toLatLng([-82.70, 35.27])];
  assert.equal(isNearArea({ latitude: 35.24, longitude: -82.72 }, area, 0.05), true);
  // Just outside the box but inside the padding still counts.
  assert.equal(isNearArea({ latitude: 35.30, longitude: -82.72 }, area, 0.05), true);
  // Asheville is out; so is a swapped [lat, lon] reading of Brevard itself.
  assert.equal(isNearArea({ latitude: 35.5951, longitude: -82.5515 }, area, 0.05), false);
  assert.equal(isNearArea({ latitude: -82.72, longitude: 35.24 }, area, 0.05), false);
});

test('UT-7', 'forApp: each app keeps its own items and reads its own wording', () => {
  const items = [
    { id: 'both', name: 'Shared' },
    { id: 'adult', name: 'Taproom', apps: ['map'] },
    { id: 'school', name: 'School', apps: ['kids'] },
    { id: 'shop', name: 'Bikes & Brews', categories: ['bike-shop', 'brewery'], kids: { name: 'Bikes', categories: ['bike-shop'] } },
    { id: 'ride', stops: [{ name: 'Tavern', kids: { name: 'Shop' } }, { name: 'Bridge' }] },
  ];
  const map = forApp(items, 'map');
  const kids = forApp(items, 'kids');
  assert.deepEqual(map.map((i) => i.id), ['both', 'adult', 'shop', 'ride']);
  assert.deepEqual(kids.map((i) => i.id), ['both', 'school', 'shop', 'ride']);
  assert.deepEqual(kids[2], { id: 'shop', name: 'Bikes', categories: ['bike-shop'] });
  assert.equal(map[2].name, 'Bikes & Brews');
  assert.deepEqual(kids[3].stops, [{ name: 'Shop' }, { name: 'Bridge' }]);
  // Neither the app list nor the overrides leak through to the screens.
  assert.equal('apps' in map[1] || 'kids' in map[2], false);
});

test('UT-8', 'routeOnGraph: routes only along drawn lines, joining ones that nearly touch', () => {
  // A path running east, a connector that stops 100 ft short of it (joined),
  // and an island 1,000 ft away (not joined). 0.001 degrees of latitude is
  // about 364 ft.
  const line = (id, coordinates) => ({ id, geometry: { coordinates } });
  const network = [
    line('path', [[-82.73, 35.23], [-82.72, 35.23]]),
    line('spur', [[-82.725, 35.2303], [-82.725, 35.235]]),
    line('island', [[-82.70, 35.26], [-82.70, 35.265]]),
  ];
  const graph = buildRouteGraph(network);

  // From the west end of the path up the spur: about 0.005 deg of longitude
  // east (~1,487 ft at this latitude), 100 ft across the join, then up the
  // spur (~1,711 ft).
  const r = routeOnGraph(graph, [-82.73, 35.23], [-82.725, 35.235]);
  assert.ok(r, 'expected the spur to be joined to the path');
  assert.ok(Math.abs(r.pathFt - (1487 + 109 + 1711)) < 60, `unexpected length ${Math.round(r.pathFt)} ft`);
  assert.deepEqual(r.coordinates[0], [-82.73, 35.23]);

  // The island is not joined: no route, rather than a straight line over town.
  assert.equal(routeOnGraph(graph, [-82.73, 35.23], [-82.70, 35.262]), null);

  // A point off the network snaps to the nearest line and reports how far off.
  const off = routeOnGraph(graph, [-82.728, 35.229], [-82.721, 35.23]);
  assert.ok(Math.abs(off.startOffFt - 364) < 10, `start was ${Math.round(off.startOffFt)} ft off`);

  // Minutes read as an estimate.
  assert.equal(rideMinutes(0.5), 4);
  assert.equal(rideMinutes(2.3), 20);
});

test('UT-9', 'nextStopIndex: the next pinned stop ahead of the rider along the route', () => {
  // A route running east; stops 0 and 2 are pinned, stop 1 is scenery.
  const route = [[-82.74, 35.23], [-82.70, 35.23]];
  const pins = [
    { index: 0, coordinates: [-82.735, 35.23] },
    { index: 2, coordinates: [-82.71, 35.23] },
  ];
  assert.equal(nextStopIndex(route, pins, [-82.739, 35.23]), 0, 'at the start, stop 1 is next');
  assert.equal(nextStopIndex(route, pins, [-82.72, 35.2302]), 2, 'between them, stop 3 is next');
  assert.equal(nextStopIndex(route, pins, [-82.705, 35.23]), null, 'past the last stop');
  assert.equal(nextStopIndex(route, pins, [-82.72, 35.25]), null, 'far off the route');

  // An out-and-back passes stop 1's spot twice; on the way out stop 1 is
  // next, and on the way back the return stop is, not stop 1 again.
  const outAndBack = [[-82.74, 35.23], [-82.70, 35.23], [-82.74, 35.2301]];
  const loopPins = [
    { index: 0, coordinates: [-82.735, 35.23] },
    { index: 1, coordinates: [-82.70, 35.23] },
    { index: 2, coordinates: [-82.72, 35.2301] },
  ];
  assert.equal(nextStopIndex(outAndBack, loopPins, [-82.739, 35.23]), 0, 'heading out: stop 1');
  assert.equal(nextStopIndex(outAndBack, loopPins, [-82.71, 35.23009]), 2, 'heading back: the return stop, not stop 1');
});

test('UT-10', 'progressAlong: splits a ride where the rider is, keeping the whole line', () => {
  // A ride running east about 2.3 mi (one degree of longitude is ~298,000 ft here).
  const line = [[-82.74, 35.23], [-82.73, 35.23], [-82.70, 35.23]];
  const halfway = progressAlong(line, [-82.72, 35.2301]);
  assert.ok(Math.abs(halfway.doneFt - halfway.aheadFt) < 1, 'halfway: as much done as ahead');
  assert.ok(halfway.offFt < 50, 'a few feet off the line still counts as on it');
  assert.deepEqual(halfway.done[0], line[0], 'the ridden part starts where the ride did');
  assert.deepEqual(halfway.ahead[halfway.ahead.length - 1], line[2], 'the part ahead ends at the place');
  assert.deepEqual(halfway.done[halfway.done.length - 1], halfway.ahead[0], 'the two parts meet at the rider');
  const total = halfway.doneFt + halfway.aheadFt;
  assert.equal(Math.round(progressAlong(line, line[0]).aheadFt), Math.round(total), 'at the start, all of it is ahead');
  assert.equal(Math.round(progressAlong(line, line[2]).aheadFt), 0, 'at the place, nothing is ahead');
  assert.ok(progressAlong(line, [-82.72, 35.25]).offFt > 5000, 'far off the line says so');
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
