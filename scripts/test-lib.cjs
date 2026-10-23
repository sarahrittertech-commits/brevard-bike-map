#!/usr/bin/env node
/**
 * Unit tests for the data selection logic.
 * Implements checks UT-1 to UT-12 from the test case documentation.
 *
 * These run against src/lib/select.js, which holds the pure functions that
 * src/lib/data.js re-exports once the bundled data is bound to them. There is
 * no test runner by design (ADR-0004's spirit: nothing the project can do
 * without), so this file is a plain node script like validate-data.cjs.
 *
 * Fixtures rather than the real dataset: these assert behaviour, and should not
 * start failing because a cafe closed. The real data is checked by DT-1 to DT-13.
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
  placeStops,
  riderAlong,
  trackAlong,
  followLine,
  followStep,
  splitLine,
  crossingPasses,
  rideItinerary,
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

test('UT-9', 'placeStops, followStep: NEXT follows a loop forwards', () => {
  // Bracken-like loop: out east and back west a few feet north, ending where
  // it started. Stop 1 is at the start, stop 2 at the far end, and stop 3 sits
  // beside the start but is the last stop of the ride.
  const loop = [[-82.74, 35.23], [-82.70, 35.23], [-82.70, 35.2302], [-82.74, 35.2302]];
  const loopPins = [
    { index: 0, coordinates: [-82.74, 35.2299] },
    { index: 1, coordinates: [-82.70, 35.2301] },
    { index: 2, coordinates: [-82.74, 35.2303] },
  ];
  const placed = placeStops(loop, loopPins);
  assert.deepEqual(placed.map((p) => p.index), [0, 1, 2]);
  assert.ok(placed[2].alongFt > placed[1].alongFt, 'the last stop is placed at the end, not the start it is near');
  assert.ok(placed.every((p) => p.placed));

  // A stop passed twice (out and back on the same line) goes on the pass
  // that keeps the itinerary in order.
  const outAndBack = [[-82.74, 35.23], [-82.72, 35.23], [-82.70, 35.23], [-82.72, 35.23], [-82.74, 35.23]];
  const obPins = [
    { index: 0, coordinates: [-82.72, 35.2301] }, // on the way out
    { index: 1, coordinates: [-82.70, 35.2301] }, // the turn
    { index: 2, coordinates: [-82.72, 35.2299] }, // the same spot, on the way back
  ];
  const obPlaced = placeStops(outAndBack, obPins);
  assert.ok(obPlaced[0].alongFt < obPlaced[1].alongFt && obPlaced[1].alongFt < obPlaced[2].alongFt);

  // A rider on that line, which is drawn back exactly over itself: walking
  // out and back, NEXT goes 1, 2, 3 and never back to an earlier stop.
  const walk = [];
  for (let k = 0; k <= 40; k++) walk.push([-82.74 + (0.04 * k) / 40, 35.23]);
  for (let k = 1; k <= 40; k++) walk.push([-82.70 - (0.04 * k) / 40, 35.23]);
  let prev = null;
  const seen = [];
  for (const p of walk) {
    const step = followStep(outAndBack, obPlaced, p, prev?.alongFt ?? null);
    prev = step;
    if (seen[seen.length - 1] !== step.index) seen.push(step.index);
  }
  assert.deepEqual(seen, [0, 1, 2, null], 'NEXT 1, 2, 3, then done');

  // More than half a mile from the route, NEXT means nothing.
  assert.equal(followStep(outAndBack, obPlaced, [-82.72, 35.25]), null);
  // A small step back is GPS wobble; a big one is a real turn back.
  assert.equal(trackAlong(1000, 700), 1000);
  assert.equal(trackAlong(1000, 400), 400);
  assert.equal(trackAlong(null, 400), 400);
});

test('UT-12', 'riderAlong: a first fix, a gap in fixes and a fix that is not a number', () => {
  // The loop's way back runs 73 ft north of the way out. With no earlier fix,
  // a rider between them, nearer the way back, is on the way out: a ride is
  // followed from its start.
  const loop = [[-82.74, 35.23], [-82.70, 35.23], [-82.70, 35.2302], [-82.74, 35.2302]];
  const first = riderAlong(loop, [-82.72, 35.23015]);
  assert.ok(first.alongFt < 7000, `on the way out, not ${Math.round(first.alongFt)} ft along`);

  // A straight ride drawn in short pieces. After a gap in fixes (the phone
  // locked), the rider is found where they are, not at the end of a piece
  // near where they were.
  const line = [];
  for (let k = 0; k <= 12; k++) line.push([-82.74 + 0.0034 * k, 35.23]);
  const before = riderAlong(line, [-82.7333, 35.23]);
  const after = riderAlong(line, [-82.7095, 35.23], before.alongFt);
  assert.ok(Math.abs(after.alongFt - 9100) < 100, `found again at ${Math.round(after.alongFt)} ft`);
  assert.ok(after.offFt < 1, 'on the line');

  assert.equal(riderAlong(line, [NaN, 35.23]), null, 'a fix that is not a number is not used');
});

test('UT-10', 'followLine, splitLine: a ride cut where the rider has got, keeping the whole line', () => {
  // A ride running east about 2.3 mi (one degree of longitude is ~298,000 ft here).
  const line = [[-82.74, 35.23], [-82.73, 35.23], [-82.70, 35.23]];
  const halfway = followLine(line, [-82.72, 35.2301]);
  assert.ok(Math.abs(halfway.alongFt * 2 - halfway.totalFt) < 1, 'halfway along');
  assert.ok(halfway.offFt < 50, 'a few feet off the line still counts as on it');
  const { done, ahead } = splitLine(line, halfway.alongFt);
  assert.deepEqual(done[0], line[0], 'the ridden part starts where the ride did');
  assert.deepEqual(ahead[ahead.length - 1], line[2], 'the part ahead ends at the place');
  assert.deepEqual(done[done.length - 1], ahead[0], 'the two parts meet at the rider');
  assert.equal(Math.round(followLine(line, line[0]).alongFt), 0, 'at the start, none of it is ridden');
  const there = followLine(line, line[2]);
  assert.equal(Math.round(there.alongFt), Math.round(halfway.totalFt), 'at the place, all of it is');
  assert.ok(followLine(line, [-82.72, 35.25]).offFt > 5000, 'far off the line says so');
  // Wobble back at the place does not undo arriving.
  assert.equal(followLine(line, [-82.7003, 35.23], there.alongFt).alongFt, there.alongFt);

  // A way that goes out a spur and back: on the way back the rider stays on
  // the return leg, given how far along they had got.
  const spur = [[-82.74, 35.23], [-82.72, 35.23], [-82.74, 35.23]];
  const out = followLine(spur, [-82.73, 35.23]);
  const back = followLine(spur, [-82.73, 35.23], out.alongFt + 5500);
  assert.ok(back.alongFt > out.alongFt + 4000, 'the return leg, not the way out');
});

test('UT-11', 'rideItinerary: crossings between the stops, and back again on a one-way ride', () => {
  // A ride running east about 2.3 mi, a road crossed a third of the way, and
  // another road a mile north that the ride never meets.
  const line = [[-82.74, 35.23], [-82.73, 35.23], [-82.70, 35.23]];
  const crossings = [
    { id: 'main-st', coordinates: [-82.7268, 35.2302] },
    { id: 'far-rd', coordinates: [-82.72, 35.245] },
  ];
  const passes = crossingPasses(line, crossings);
  assert.deepEqual(passes.map((p) => p.id), ['main-st'], 'only the road the line meets');

  const placed = [
    { index: 0, alongFt: 0 },
    { index: 2, alongFt: 12000 },
  ];
  const { items, back } = rideItinerary(line, 3, placed, passes);
  assert.deepEqual(
    items.map((i) => (i.kind === 'stop' ? i.index : i.id)),
    [0, 1, 'main-st', 2],
    'the crossing sits before the stop past it; a stop with no location stays after the one before it'
  );
  assert.deepEqual(back.map((i) => i.id), ['main-st'], 'a one-way ride lists its crossings again for the way back');

  // A last stop with no location (back to the start) is where the ride ends:
  // the crossings before the end come before it.
  const ending = rideItinerary(line, 3, [{ index: 0, alongFt: 0 }, { index: 1, alongFt: 1000 }], passes).items;
  assert.deepEqual(ending.map((i) => (i.kind === 'stop' ? i.index : i.id)), [0, 1, 'main-st', 2]);

  // A loop whose way back runs beside the way out crosses the road twice, and
  // has no separate way back.
  const loop = [[-82.74, 35.23], [-82.72, 35.23], [-82.72, 35.2302], [-82.74, 35.2302], [-82.74, 35.23]];
  const loopPasses = crossingPasses(loop, [{ id: 'main-st', coordinates: [-82.73, 35.2301] }]);
  assert.equal(loopPasses.length, 2, 'a loop passing a crossing twice lists it twice');
  assert.equal(rideItinerary(loop, 1, [{ index: 0, alongFt: 0 }], loopPasses).back.length, 0, 'a loop has no separate way back');
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
