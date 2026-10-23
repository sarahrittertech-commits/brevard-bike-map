#!/usr/bin/env node
/**
 * Validates the static data files before they reach a build.
 * Implements checks DT-1 to DT-13 from the test case documentation.
 *
 * Usage:
 *   node scripts/validate-data.cjs            # warnings are non-fatal
 *   node scripts/validate-data.cjs --release  # placeholder content is fatal
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const IMAGE_DIR = path.join(__dirname, '..', 'assets', 'adventures');
const STOP_IMAGE_DIR = path.join(__dirname, '..', 'assets', 'stops');
// A stop pinned by its own coordinates should sit on or beside its ride.
const STOP_OFF_ROUTE_FT = 500;
// How much further off its route a stop may be placed, to keep the itinerary
// in order, than the route's nearest approach to it (DT-12).
const STOP_ORDER_SLACK_FT = 300;
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
const crossings = load('crossings');

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
checkUnique(crossings, 'crossings');
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

// Network segments. The drawn lines are collected as they are checked, so the
// geometry checks below never have to re-reach into a segment that failed
// checkLine — a segment missing its geometry is one error, not a crash.
const segmentLines = [];
for (const s of network) {
  if (!VALID_KINDS.includes(s.kind)) fail('SCHEMA', `Segment "${s.id}" has invalid kind "${s.kind}"`);
  const coords = checkLine(s.geometry, `Segment "${s.id}"`);
  if (coords) segmentLines.push(coords);
  // DT-7 — stated miles agree with the drawn line
  if (coords && typeof s.miles === 'number') {
    const drawn = lineMiles(coords);
    const drift = Math.abs(drawn - s.miles) / drawn;
    if (drift > 0.25) {
      warn('DT-7', `Segment "${s.id}" says ${s.miles} mi but its geometry measures ${drawn.toFixed(2)} mi`);
    }
  }
}

// DT-8 — a destination is near the network, or says in writing that it is not.
// 1,000 ft is the working tolerance — close enough for someone on a bike.
// Anything further has to be listed here with
// the reason, so an off-path listing is a decision and a stray coordinate is a
// warning. The reasons are documentation only — nothing reads them — so an
// allowlisted id is exempt at any distance. Landmarks are not covered; see
// DT-9's note on the September survey.
const OFF_PATH_FT = 1000;
const OFF_PATH = {
  'pisgah-bakehouse': 'Asheville Hwy, up the short connector from the roundabout',
  // Bike Brevard Kids. The drawn network does not reach most schools yet;
  // extending the path to Brevard Elementary and Brevard High is planned.
  'brevard-high': 'N Country Club Rd, south of town; path extension planned',
  'pisgah-collective': 'Asheville Hwy, past the north end of the path',
  'mountain-sun': 'Andante Ln, west of the West Main trailhead',
  'brevard-academy': 'Hendersonville Hwy, past the north end of the path',
  'presbyterian-weekday': 'E Main, a few blocks east of the courthouse',
  'brevard-college': 'the college campus, east of downtown',
  'brevard-rock-gym': 'S Broad St, south of downtown',
  'transylvania-tae-kwon-do': 'S Broad St, south of downtown',
  'health-racquet-club': 'N Country Club Rd, south of town',
};

function nearestOnLine(p, coords) {
  let best = Infinity;
  // Scales longitude to the same ground distance as latitude so the projection
  // below is done on a square grid. It only depends on p, so it is worked out
  // once rather than once per segment.
  const k = Math.cos((p[1] * Math.PI) / 180);
  for (let i = 0; i < coords.length - 1; i++) {
    const [ax, ay] = coords[i];
    const [bx, by] = coords[i + 1];
    const dx = (bx - ax) * k;
    const dy = by - ay;
    const L2 = dx * dx + dy * dy;
    let t = L2 === 0 ? 0 : (((p[0] - ax) * k * dx + (p[1] - ay) * dy) / L2);
    t = Math.max(0, Math.min(1, t));
    best = Math.min(best, haversine(p, [ax + (bx - ax) * t, ay + (by - ay) * t]) * 5280);
  }
  return best;
}

for (const d of destinations) {
  if (!Array.isArray(d.coordinates) || segmentLines.length === 0) continue;
  const ft = Math.min(...segmentLines.map((coords) => nearestOnLine(d.coordinates, coords)));
  if (ft > OFF_PATH_FT && !OFF_PATH[d.id]) {
    warn('DT-8', `Destination "${d.id}" is ${Math.round(ft)} ft from the nearest segment. If that is right, add it to OFF_PATH with the reason`);
  }
}

// DT-9 — a coordinate identical to a network vertex was almost certainly placed
// against the drawn line rather than measured. Every wrong coordinate found in
// the September survey had this shape: The Hub was 4,108 ft out, Dolly's 466,
// and four forest landmarks between 2,942 and 10,983.
const SURVEYED_ON_VERTEX = new Set([
  'repair-oskar-blues', // the spur was drawn from the recording that ends at it
  'kilwins', // the Main St link was drawn from the 17 October ride that starts at its door
]);
const vertexKeys = new Set(
  segmentLines.flatMap((coords) => coords.map((c) => `${c[0]},${c[1]}`))
);
for (const item of [...destinations, ...landmarks]) {
  if (!Array.isArray(item.coordinates) || SURVEYED_ON_VERTEX.has(item.id)) continue;
  if (vertexKeys.has(`${item.coordinates[0]},${item.coordinates[1]}`)) {
    warn('DT-9', `"${item.id}" sits exactly on a network vertex — likely placed against the drawn line, not surveyed`);
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

// Road crossings: a "Cross here" warning, not a stop. One off the path would
// tell a rider to cross a road the path does not meet, so it must sit on it.
// 200 ft, not less: the drawn line is traced, and Deerlake Rd, measured where
// Sarah stood at the curb, is 153 ft from it.
const CROSSING_FT = 200;
for (const c of crossings) {
  if (!c.id || !c.name) fail('SCHEMA', `Crossing missing id or name: ${JSON.stringify(c)}`);
  if (typeof c.button !== 'boolean') fail('SCHEMA', `Crossing "${c.id}" needs button: true or false`);
  checkCoord(c.coordinates, `Crossing "${c.id}"`);
  if (!Array.isArray(c.coordinates) || segmentLines.length === 0) continue;
  const ft = Math.min(...segmentLines.map((coords) => nearestOnLine(c.coordinates, coords)));
  if (ft > CROSSING_FT) fail('DT-13', `Crossing "${c.id}" is ${Math.round(ft)} ft from the network; a crossing sits on the path`);
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

  // DT-11 — a stop's own coordinates and photo
  (a.stops ?? []).forEach((stop, i) => {
    const where = `Adventure "${a.id}" stop ${i + 1} "${stop.name}"`;
    if (stop.coordinates !== undefined) {
      checkCoord(stop.coordinates, where);
      if (coords && Array.isArray(stop.coordinates)) {
        const ft = nearestOnLine(stop.coordinates, coords);
        if (ft > STOP_OFF_ROUTE_FT) {
          warn('DT-11', `${where} is ${Math.round(ft)} ft from the ride's route; check the coordinates or the route`);
        }
      }
    }
    if (stop.photo !== undefined) {
      if (!registeredImages.has(stop.photo)) fail('DT-11', `${where}: photo "${stop.photo}" is not in stopImages in src/lib/data.js`);
      if (!fs.existsSync(path.join(STOP_IMAGE_DIR, `${stop.photo}.jpg`))) {
        fail('DT-11', `${where}: photo assets/stops/${stop.photo}.jpg is missing`);
      }
    }
  });
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

// DT-10 — each app holds together on its own. Both apps are built from these
// files (forApp in src/lib/select.js), so a kids ride that stops at a taproom,
// or a place left only in a category the other app lacks, passes every check
// above and still breaks one of them. Bike Brevard Kids also carries no
// brewery, taproom or bar wording at all. "Dairy Bar" is why "bar" is not on
// the list.
const { APP_IDS, forApp, selectStopPins, placeStops, riderAlong, trackAlong, nextStopIndex } = require('../src/lib/select');
const ADULT_WORDING = /\b(brew\w*|taprooms?|tavern|beers?|pints?|wines?|cocktails?)\b/i;
for (const app of APP_IDS) {
  const appCategories = forApp(categories, app);
  const appDestinations = forApp(destinations, app);
  const appAdventures = forApp(adventures, app);
  const appCategoryIds = new Set(appCategories.map((c) => c.id));
  const appDestinationIds = new Set(appDestinations.map((d) => d.id));
  for (const d of appDestinations) {
    for (const c of d.categories ?? []) {
      if (!appCategoryIds.has(c)) fail('DT-10', `In the ${app} app, "${d.id}" is in category "${c}", which that app does not have`);
    }
  }
  for (const a of appAdventures) {
    for (const stop of a.stops ?? []) {
      if (stop.destination && !appDestinationIds.has(stop.destination)) {
        fail('DT-10', `In the ${app} app, adventure "${a.id}" stops at "${stop.destination}", which that app does not have`);
      }
    }
  }
  for (const c of appCategories) {
    if (!appDestinations.some((d) => d.categories.includes(c.id))) {
      warn('DT-10', `In the ${app} app, category "${c.id}" has no places`);
    }
  }
  // DT-12 — NEXT follows each ride in order. A rider is walked along the
  // route every ~50 ft, tracked fix to fix as the app does; every pinned stop
  // after the first must come up as NEXT, NEXT must never go back to an
  // earlier stop, and every stop must fit the route in itinerary order.
  const appById = Object.fromEntries(appDestinations.map((d) => [d.id, d]));
  for (const a of appAdventures) {
    const r = a.route?.coordinates;
    if (!Array.isArray(r) || r.length < 2) continue;
    const pins = selectStopPins(a, appById);
    if (!pins.length) continue;
    const placed = placeStops(r, pins);
    // Placed on a pass much further off than the route's nearest approach
    // to the stop: the itinerary and the drawn route disagree about order.
    for (const p of placed) {
      const pin = pins.find((x) => x.index === p.index);
      const nearestFt = nearestOnLine(pin.coordinates, r);
      if (!p.placed || p.offFt > nearestFt + STOP_ORDER_SLACK_FT) {
        fail('DT-12', `In the ${app} app, adventure "${a.id}" stop ${p.index + 1} does not fit its route in itinerary order`);
      }
    }
    let prevFt = null;
    let last;
    const seen = new Set();
    for (let i = 0; i < r.length - 1; i++) {
      const steps = Math.max(1, Math.ceil(haversine(r[i], r[i + 1]) * 5280 / 50));
      for (let k = 0; k < steps; k++) {
        const t = k / steps;
        const p = [r[i][0] + (r[i + 1][0] - r[i][0]) * t, r[i][1] + (r[i + 1][1] - r[i][1]) * t];
        prevFt = trackAlong(prevFt, riderAlong(r, p, prevFt).alongFt);
        const next = nextStopIndex(placed, prevFt);
        if (last !== undefined && (last === null ? next !== null : next !== null && next < last)) {
          fail('DT-12', `In the ${app} app, adventure "${a.id}": NEXT goes back from ${last === null ? 'none' : `stop ${last + 1}`} to stop ${next + 1} along its route`);
          i = r.length;
          break;
        }
        if (next !== null) seen.add(next);
        last = next;
      }
    }
    for (const pin of pins.slice(1)) {
      if (!seen.has(pin.index)) fail('DT-12', `In the ${app} app, adventure "${a.id}" stop ${pin.index + 1} is never NEXT along its route`);
    }
  }

  if (app === 'kids') {
    const everything = [...appCategories, ...appDestinations, ...forApp(network, app), ...forApp(landmarks, app), ...appAdventures];
    for (const item of everything) {
      const { geometry, route, coordinates, website, ...words } = item;
      const hit = JSON.stringify(words).match(ADULT_WORDING);
      if (hit) fail('DT-10', `Bike Brevard Kids shows "${hit[0]}" in "${item.id}" — add a kids override or limit it to apps: ["map"]`);
    }
  }
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
