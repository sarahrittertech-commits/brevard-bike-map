#!/usr/bin/env node
/**
 * Validates the static data files before they reach a build.
 * Implements checks DT-1 to DT-7 from the test case documentation.
 *
 * Usage:
 *   node scripts/validate-data.cjs            # warnings are non-fatal
 *   node scripts/validate-data.cjs --release  # placeholder content is fatal
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const IMAGE_DIR = path.join(__dirname, '..', 'assets', 'adventures');
// Photos are require()d statically in src/lib/data.js; the bundler only picks
// up images listed there, so the jpg existing on disk is not enough.
const IMAGE_MAP_FILE = path.join(__dirname, '..', 'src', 'lib', 'data.js');
const RELEASE = process.argv.includes('--release');

// Generous bounding box around Brevard, NC. Its job is to catch coordinates
// entered as [lat, lon] instead of [lon, lat], which lands them off Somalia.
const BBOX = { minLon: -82.9, maxLon: -82.6, minLat: 35.15, maxLat: 35.35 };

const VALID_KINDS = ['main', 'connector'];
const VALID_DIFFICULTY = ['easy', 'moderate', 'ambitious'];
const VALID_LABEL_SIDES = ['left', 'right'];
// LANDMARK_TEXT_WIDTH in src/components/MapPins.js fits roughly this many
// characters at Inter SemiBold 10 before numberOfLines={1} clips the name.
const MAX_LANDMARK_NAME = 22;

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
const network = load('network');
const landmarks = load('landmarks');
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
checkUnique(network, 'network');
checkUnique(landmarks, 'landmarks');
checkUnique(adventures, 'adventures');

// DT-4 — coordinates inside the bounding box
function checkCoord(coord, where) {
  if (!Array.isArray(coord) || coord.length !== 2) {
    fail('DT-4', `${where}: coordinates must be [longitude, latitude]`);
    return;
  }
  const [lon, lat] = coord;
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
    fail('DT-4', `${where}: coordinates must be numbers, got [${JSON.stringify(lon)}, ${JSON.stringify(lat)}]`);
    return;
  }
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

function checkLine(geometry, where) {
  const coords = geometry && geometry.type === 'LineString' && geometry.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) {
    fail('SCHEMA', `${where} needs a LineString with at least two points`);
    return null;
  }
  coords.forEach((c, i) => checkCoord(c, `${where} point ${i}`));
  return coords;
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

function lineMiles(coords) {
  let total = 0;
  for (let i = 1; i < coords.length; i++) total += haversine(coords[i - 1], coords[i]);
  return total;
}

// Placeholder content must never ship
function checkPlaceholder(text, where) {
  if (typeof text === 'string' && /sample|placeholder|lorem/i.test(text)) {
    const msg = `${where} looks like placeholder content: "${text.slice(0, 40)}"`;
    if (RELEASE) fail('DT-6', `${msg} — cannot ship`);
    else warn('DT-6', msg);
  }
}

// Categories
for (const c of categories) {
  if (!c.id || !c.label || !c.color) {
    fail('SCHEMA', `Category missing id, label or color: ${JSON.stringify(c)}`);
  }
}

// DT-1 — destination categories resolve
for (const d of destinations) {
  if (!d.id || !d.name) fail('SCHEMA', `Destination missing id or name: ${JSON.stringify(d)}`);
  if (!Array.isArray(d.categories) || d.categories.length === 0) {
    fail('DT-1', `Destination "${d.id}" needs at least one category`);
  } else {
    for (const c of d.categories) {
      if (!categoryIds.has(c)) fail('DT-1', `Destination "${d.id}" has unknown category "${c}"`);
    }
  }
  if (!d.description) warn('SCHEMA', `Destination "${d.id}" has no description`);
  if (typeof d.mileMarker !== 'number') fail('SCHEMA', `Destination "${d.id}" needs a numeric mileMarker`);
  checkCoord(d.coordinates, `Destination "${d.id}"`);
  checkPlaceholder(d.name, `Destination "${d.id}"`);
}

// Network segments
for (const s of network) {
  if (!VALID_KINDS.includes(s.kind)) fail('SCHEMA', `Segment "${s.id}" has invalid kind "${s.kind}"`);
  const coords = checkLine(s.geometry, `Segment "${s.id}"`);
  // DT-7 — stated miles agree with the drawn line
  if (coords && typeof s.miles === 'number') {
    const drawn = lineMiles(coords);
    const drift = Math.abs(drawn - s.miles) / drawn;
    if (drift > 0.25) {
      warn('DT-7', `Segment "${s.id}" says ${s.miles} mi but its geometry measures ${drawn.toFixed(2)} mi`);
    }
  }
}

// src/lib/data.js takes the trailheads and path length from the one `main`
// segment at import time, so the app cannot start without exactly one.
const mainSegments = network.filter((s) => s.kind === 'main');
if (mainSegments.length !== 1) {
  fail('SCHEMA', `Network needs exactly one segment with kind "main", found ${mainSegments.length}`);
} else if (typeof mainSegments[0].miles !== 'number') {
  fail('SCHEMA', `Segment "${mainSegments[0].id}" needs a numeric miles`);
}

// Landmarks
for (const l of landmarks) {
  if (!l.id || !l.name) fail('SCHEMA', `Landmark missing id or name: ${JSON.stringify(l)}`);
  if (!VALID_LABEL_SIDES.includes(l.labelSide)) fail('SCHEMA', `Landmark "${l.id}" has invalid labelSide`);
  if (l.labelOffsetY !== undefined && !Number.isFinite(l.labelOffsetY)) {
    fail('SCHEMA', `Landmark "${l.id}" labelOffsetY must be a number`);
  }
  if (l.name && l.name.length > MAX_LANDMARK_NAME) {
    warn('SCHEMA', `Landmark "${l.id}" name is ${l.name.length} characters; the map clips it at about ${MAX_LANDMARK_NAME}`);
  }
  checkCoord(l.coordinates, `Landmark "${l.id}"`);
}

// Adventures
const imageMapSource = fs.existsSync(IMAGE_MAP_FILE) ? fs.readFileSync(IMAGE_MAP_FILE, 'utf8') : '';
const registeredImages = new Set(
  [...imageMapSource.matchAll(/^\s*'([^']+)':\s*require\(/gm)].map((m) => m[1])
);
if (adventures.length > 0 && registeredImages.size === 0) {
  fail('SCHEMA', 'Could not read adventureImages in src/lib/data.js — has its formatting changed?');
}
for (const a of adventures) {
  if (!a.id || !a.title) fail('SCHEMA', `Adventure missing id or title: ${JSON.stringify(a)}`);
  if (!VALID_DIFFICULTY.includes(a.difficulty)) {
    fail('SCHEMA', `Adventure "${a.id}" has invalid difficulty "${a.difficulty}"`);
  }
  if (typeof a.kidFriendly !== 'boolean') fail('SCHEMA', `Adventure "${a.id}" needs kidFriendly true/false`);
  if (typeof a.miles !== 'number') fail('SCHEMA', `Adventure "${a.id}" needs a numeric miles`);
  if (typeof a.minutes !== 'number') fail('SCHEMA', `Adventure "${a.id}" needs a numeric minutes`);

  // DT-5 — at least two stops, each with a name and note
  if (!Array.isArray(a.stops) || a.stops.length < 2) {
    fail('DT-5', `Adventure "${a.id}" needs at least two stops`);
  } else {
    a.stops.forEach((stop, i) => {
      if (!stop.name || !stop.note) fail('DT-5', `Adventure "${a.id}" stop ${i + 1} needs a name and note`);
      // DT-2 — stop destination references resolve
      if (stop.destination && !destinationIds.has(stop.destination)) {
        fail('DT-2', `Adventure "${a.id}" stop "${stop.name}" references unknown destination "${stop.destination}"`);
      }
    });
  }

  const coords = checkLine(a.route, `Adventure "${a.id}" route`);
  // DT-7 — a ride can't be shorter than the line drawn for it
  if (coords && typeof a.miles === 'number') {
    const drawn = lineMiles(coords);
    if (a.miles < drawn * 0.9) {
      warn('DT-7', `Adventure "${a.id}" says ${a.miles} mi but its route draws ${drawn.toFixed(2)} mi`);
    }
  }

  if (!a.image) {
    fail('SCHEMA', `Adventure "${a.id}" has no image`);
  } else if (!fs.existsSync(path.join(IMAGE_DIR, `${a.image}.jpg`))) {
    fail('SCHEMA', `Adventure "${a.id}" image assets/adventures/${a.image}.jpg does not exist`);
  } else if (!registeredImages.has(a.image)) {
    fail('SCHEMA', `Adventure "${a.id}" image "${a.image}" is not listed in adventureImages in src/lib/data.js`);
  }
  checkPlaceholder(a.title, `Adventure "${a.id}"`);
}

// Report
console.log(
  `Checked ${destinations.length} destinations, ${network.length} network segments, ` +
    `${landmarks.length} landmarks, ${adventures.length} adventures, ${categories.length} categories` +
    (RELEASE ? ' (release mode)' : '')
);

for (const w of warnings) console.log(`  warning  ${w}`);

if (errors.length) {
  console.error(`\n${errors.length} problem${errors.length === 1 ? '' : 's'} found:\n`);
  for (const e of errors) console.error(`  error    ${e}`);
  process.exit(1);
}

console.log(warnings.length ? `\nPassed with ${warnings.length} warning(s).` : '\nAll checks passed.');
