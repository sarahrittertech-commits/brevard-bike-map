#!/usr/bin/env node
/**
 * Validates the static data files before they reach a build.
 * Implements checks DT-1 to DT-7 from the test case documentation.
 *
 * Usage:
 *   node scripts/validate-data.cjs            # warns on unverified routes
 *   node scripts/validate-data.cjs --release  # fails on unverified routes
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const RELEASE = process.argv.includes('--release');

// Generous bounding box around Brevard, NC. Its job is to catch coordinates
// entered as [lat, lon] instead of [lon, lat], which lands them off Somalia.
const BBOX = { minLon: -82.9, maxLon: -82.6, minLat: 35.15, maxLat: 35.35 };

const VALID_SURFACES = ['greenway', 'quiet-road', 'main-road', 'mixed'];
const VALID_CONFIDENCE = ['verified', 'probable', 'unverified'];

const errors = [];
const warnings = [];

const fail = (check, msg) => errors.push(`[${check}] ${msg}`);
const warn = (check, msg) => warnings.push(`[${check}] ${msg}`);

function load(name) {
  const file = path.join(DATA_DIR, `${name}.json`);
  if (!fs.existsSync(file)) {
    fail('FILE', `Missing data file: src/data/${name}.json`);
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    fail('FILE', `src/data/${name}.json is not valid JSON — ${e.message}`);
    return [];
  }
}

const categories = load('categories');
const destinations = load('destinations');
const routes = load('routes');
const adventures = load('adventures');

const categoryIds = new Set(categories.map((c) => c.id));
const destinationIds = new Set(destinations.map((d) => d.id));

// DT-3 — unique ids within each file
function checkUnique(items, label) {
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item.id)) fail('DT-3', `Duplicate id "${item.id}" in ${label}`);
    seen.add(item.id);
  }
}
checkUnique(categories, 'categories');
checkUnique(destinations, 'destinations');
checkUnique(routes, 'routes');
checkUnique(adventures, 'adventures');

// DT-4 — coordinates inside the bounding box
function checkCoord(coord, where) {
  if (!Array.isArray(coord) || coord.length !== 2) {
    fail('DT-4', `${where}: coordinates must be [longitude, latitude]`);
    return;
  }
  const [lon, lat] = coord;
  if (lon < BBOX.minLon || lon > BBOX.maxLon || lat < BBOX.minLat || lat > BBOX.maxLat) {
    const swapped =
      lat >= BBOX.minLon && lat <= BBOX.maxLon && lon >= BBOX.minLat && lon <= BBOX.maxLat;
    fail(
      'DT-4',
      `${where}: [${lon}, ${lat}] is outside Brevard` +
        (swapped ? ' — looks like latitude and longitude are swapped' : '')
    );
  }
}

// DT-1 — destination categories resolve
for (const d of destinations) {
  if (!d.id || !d.name) fail('SCHEMA', `Destination missing id or name: ${JSON.stringify(d)}`);
  if (!categoryIds.has(d.category)) {
    fail('DT-1', `Destination "${d.id}" has unknown category "${d.category}"`);
  }
  if (!d.description) warn('SCHEMA', `Destination "${d.id}" has no description`);
  checkCoord(d.coordinates, `Destination "${d.id}"`);
}

// Haversine distance in miles
function haversine([lon1, lat1], [lon2, lat2]) {
  const R = 3958.8;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

const routeKey = (a, b) => [a, b].sort().join('::');
const routeIndex = new Set();

for (const r of routes) {
  // DT-2 — route endpoints resolve
  if (!destinationIds.has(r.from)) fail('DT-2', `Route "${r.id}" has unknown from "${r.from}"`);
  if (!destinationIds.has(r.to)) fail('DT-2', `Route "${r.id}" has unknown to "${r.to}"`);
  if (r.from === r.to) fail('DT-2', `Route "${r.id}" starts and ends at the same place`);

  if (!VALID_SURFACES.includes(r.surface)) {
    fail('SCHEMA', `Route "${r.id}" has invalid surface "${r.surface}"`);
  }
  if (!VALID_CONFIDENCE.includes(r.confidence)) {
    fail('SCHEMA', `Route "${r.id}" has invalid confidence "${r.confidence}"`);
  }

  // DT-6 — no unverified routes in a release
  if (r.confidence === 'unverified') {
    const msg = `Route "${r.id}" is unverified`;
    RELEASE ? fail('DT-6', `${msg} — cannot ship`) : warn('DT-6', msg);
  }

  const coords = r.geometry && r.geometry.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) {
    fail('SCHEMA', `Route "${r.id}" needs a LineString with at least two points`);
    continue;
  }
  coords.forEach((c, i) => checkCoord(c, `Route "${r.id}" point ${i}`));

  // DT-7 — stored distance agrees with the drawn geometry
  let computed = 0;
  for (let i = 1; i < coords.length; i++) computed += haversine(coords[i - 1], coords[i]);
  if (typeof r.distanceMiles === 'number' && computed > 0) {
    const drift = Math.abs(computed - r.distanceMiles) / computed;
    if (drift > 0.1) {
      fail(
        'DT-7',
        `Route "${r.id}" says ${r.distanceMiles} mi but its geometry measures ` +
          `${computed.toFixed(2)} mi (${(drift * 100).toFixed(0)}% off)`
      );
    }
  }

  routeIndex.add(routeKey(r.from, r.to));
}

// DT-5 — adventure stop pairs have routes
for (const a of adventures) {
  if (!Array.isArray(a.stops) || a.stops.length < 2) {
    fail('DT-5', `Adventure "${a.id}" needs at least two stops`);
    continue;
  }
  for (const stop of a.stops) {
    if (!destinationIds.has(stop)) fail('DT-5', `Adventure "${a.id}" references unknown stop "${stop}"`);
  }
  for (let i = 1; i < a.stops.length; i++) {
    const [from, to] = [a.stops[i - 1], a.stops[i]];
    if (!routeIndex.has(routeKey(from, to))) {
      fail('DT-5', `Adventure "${a.id}" has no route between "${from}" and "${to}"`);
    }
  }
}

// Report
console.log(
  `Checked ${destinations.length} destinations, ${routes.length} routes, ` +
    `${adventures.length} adventures, ${categories.length} categories` +
    (RELEASE ? ' (release mode)' : '')
);

for (const w of warnings) console.log(`  warning  ${w}`);

if (errors.length) {
  console.error(`\n${errors.length} problem${errors.length === 1 ? '' : 's'} found:\n`);
  for (const e of errors) console.error(`  error    ${e}`);
  process.exit(1);
}

console.log(warnings.length ? `\nPassed with ${warnings.length} warning(s).` : '\nAll checks passed.');
