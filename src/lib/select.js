// The pure selection logic behind src/lib/data.js: coordinate conversion and
// the functions that decide what the map and the sheet show.
//
// This file is deliberately CommonJS and deliberately free of imports. Its
// neighbour data.js imports JSON and require()s photographs, which only the
// app's bundler can resolve, so data.js cannot be loaded by plain node. These
// functions can, which is what lets scripts/test-lib.cjs run UT-1 to UT-12
// without a test runner. Keep this file dependency-free or that stops working.
//
// Nothing outside data.js should import from here; data.js binds the bundled
// data to these and is the single entry point the UI uses.

// Data files store [longitude, latitude] (GeoJSON order); react-native-maps
// wants { latitude, longitude }.
function toLatLng([longitude, latitude]) {
  return { latitude, longitude };
}

const lineToLatLngs = (geometry) => geometry.coordinates.map(toLatLng);

// Which category a place should be drawn as right now. A place can belong to
// several; show the first one the rider has switched on so the pin colour
// always answers "why am I seeing this?".
function displayCategory(destination, active) {
  return destination.categories.find((c) => active.includes(c)) ?? destination.categories[0];
}

// Places matching any switched-on category, ordered along the path. With
// nothing switched on this is empty by design: the map shows just the path.
function selectVisible(destinations, active) {
  return destinations
    .filter((d) => d.categories.some((c) => active.includes(c)))
    .sort((a, b) => a.mileMarker - b.mileMarker);
}

// Stops on an adventure that can be pinned, in order: a stop with its own
// `coordinates` (a sculpture, a corner), else the destination it names.
// Stops with neither are skipped, but the numbering keeps the original index
// so the map's numbered stops still match the written itinerary.
function selectStopPins(adventure, destinationById) {
  return adventure.stops
    .map((stop, index) => {
      const destination = stop.destination ? destinationById[stop.destination] : null;
      const coordinates = stop.coordinates ?? destination?.coordinates;
      return coordinates ? { index, name: stop.name, coordinates } : null;
    })
    .filter(Boolean);
}

// Whether a rider's { latitude, longitude } is close enough to the map to be
// worth centring on: inside the box around the given points, grown by `pad`
// degrees each way. Anywhere further and the map would fly off to a place it
// has nothing to say about, so the app says so instead.
function isNearArea(position, latLngs, pad) {
  const lats = latLngs.map((p) => p.latitude);
  const lons = latLngs.map((p) => p.longitude);
  return (
    position.latitude >= Math.min(...lats) - pad &&
    position.latitude <= Math.max(...lats) + pad &&
    position.longitude >= Math.min(...lons) - pad &&
    position.longitude <= Math.max(...lons) + pad
  );
}

// Two apps are built from this one dataset: Bike Brevard Map ('map') and Bike
// Brevard Kids ('kids'). An item lists `apps` only when it belongs to just one
// of them, and carries an object named after an app for the fields that read
// differently there — a shop's name without its taproom, say. Adventure stops
// can carry their own. What comes out has neither key, so nothing downstream
// knows there is more than one app.
const APP_IDS = ['map', 'kids'];

function resolveForApp(item, app) {
  const resolved = { ...item, ...item[app] };
  delete resolved.apps;
  for (const id of APP_IDS) delete resolved[id];
  if (resolved.stops) resolved.stops = resolved.stops.map((stop) => resolveForApp(stop, app));
  return resolved;
}

function forApp(items, app) {
  return items.filter((item) => !item.apps || item.apps.includes(app)).map((item) => resolveForApp(item, app));
}

// Routing along the drawn network (ADR-0003, revised 21 October 2026).
//
// Routes follow only the lines Sarah has ridden or checked: the main path and
// its connectors. Nothing is routed along a street that is not drawn, so the
// shortest answer can never be a highway shoulder nobody chose. Lines that end
// within JOIN_FT of another line are joined there, which is how the drawn
// connectors meet the path and each other.
const JOIN_FT = 200;
const FT_PER_DEGREE = 364000;

// Flat x/y in feet around Brevard's latitude: close enough over a few miles,
// and it keeps the geometry below simple.
function toFeet([longitude, latitude], cosLat) {
  return [longitude * FT_PER_DEGREE * cosLat, latitude * FT_PER_DEGREE];
}

// Where point p falls on the segment a-b: t from 0 to 1 along it, and how far
// p is from that spot.
function projectOnto(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2));
  const x = a[0] + t * dx;
  const y = a[1] + t * dy;
  return { t, dist: Math.hypot(p[0] - x, p[1] - y) };
}

function buildRouteGraph(network) {
  const all = network.flatMap((s) => s.geometry.coordinates);
  const lat0 = all.reduce((sum, c) => sum + c[1], 0) / all.length;
  const cosLat = Math.cos((lat0 * Math.PI) / 180);
  const lines = network.map((s) => s.geometry.coordinates);

  // Each line end that stops short of another line is joined to the nearest
  // spot on it, splitting that line there.
  const splits = lines.map(() => []);
  const joins = [];
  lines.forEach((coords, li) => {
    for (const end of [coords[0], coords[coords.length - 1]]) {
      const p = toFeet(end, cosLat);
      let best = null;
      lines.forEach((other, oi) => {
        if (oi === li) return;
        for (let i = 0; i < other.length - 1; i++) {
          const hit = projectOnto(p, toFeet(other[i], cosLat), toFeet(other[i + 1], cosLat));
          if (!best || hit.dist < best.dist) best = { ...hit, line: oi, edge: i };
        }
      });
      if (best && best.dist <= JOIN_FT) {
        const a = lines[best.line][best.edge];
        const b = lines[best.line][best.edge + 1];
        const at = [a[0] + best.t * (b[0] - a[0]), a[1] + best.t * (b[1] - a[1])];
        splits[best.line].push({ edge: best.edge, t: best.t, coord: at });
        joins.push([end, at]);
      }
    }
  });

  const nodes = [];
  const index = new Map();
  const node = (coord) => {
    const key = `${coord[0].toFixed(6)},${coord[1].toFixed(6)}`;
    if (!index.has(key)) {
      index.set(key, nodes.length);
      nodes.push({ coord, xy: toFeet(coord, cosLat), edges: [] });
    }
    return index.get(key);
  };
  const edges = [];
  const link = (a, b) => {
    if (a === b) return;
    const ft = Math.hypot(nodes[a].xy[0] - nodes[b].xy[0], nodes[a].xy[1] - nodes[b].xy[1]);
    nodes[a].edges.push({ to: b, ft });
    nodes[b].edges.push({ to: a, ft });
    edges.push([a, b]);
  };

  lines.forEach((coords, li) => {
    const points = [];
    coords.forEach((c, i) => {
      points.push(c);
      splits[li]
        .filter((s) => s.edge === i)
        .sort((x, y) => x.t - y.t)
        .forEach((s) => points.push(s.coord));
    });
    for (let i = 0; i < points.length - 1; i++) link(node(points[i]), node(points[i + 1]));
  });
  for (const [a, b] of joins) link(node(a), node(b));

  return { nodes, edges, cosLat };
}

// The nearest spot on the network to a [lon, lat] point.
function snapToGraph(graph, coord) {
  const p = toFeet(coord, graph.cosLat);
  let best = null;
  for (const [a, b] of graph.edges) {
    const hit = projectOnto(p, graph.nodes[a].xy, graph.nodes[b].xy);
    if (!best || hit.dist < best.dist) best = { ...hit, a, b };
  }
  const A = graph.nodes[best.a].coord;
  const B = graph.nodes[best.b].coord;
  return { ...best, coord: [A[0] + best.t * (B[0] - A[0]), A[1] + best.t * (B[1] - A[1])] };
}

// The shortest ways along the network from one [lon, lat] point: a function
// that, given a destination, returns the route as [lon, lat] coordinates
// from the spot nearest `from` to the spot nearest it, its length on the
// network, and how far each end is from the network; null if no drawn line
// connects them. The search from `from` runs once, so one rider's position
// serves a whole list of places.
function routesFrom(graph, from) {
  const s = snapToGraph(graph, from);
  const edgeFt = (snap) => {
    const [a, b] = [graph.nodes[snap.a].xy, graph.nodes[snap.b].xy];
    return Math.hypot(a[0] - b[0], a[1] - b[1]);
  };

  // Dijkstra from the start spot, which reaches the network at both ends of
  // its piece of line. The node count is small enough for a plain scan.
  const n = graph.nodes.length;
  const dist = new Array(n).fill(Infinity);
  const prev = new Array(n).fill(-1);
  const done = new Array(n).fill(false);
  dist[s.a] = s.t * edgeFt(s);
  dist[s.b] = Math.min(dist[s.b], (1 - s.t) * edgeFt(s));
  for (;;) {
    let u = -1;
    for (let i = 0; i < n; i++) if (!done[i] && dist[i] < Infinity && (u === -1 || dist[i] < dist[u])) u = i;
    if (u === -1) break;
    done[u] = true;
    for (const { to: v, ft } of graph.nodes[u].edges) {
      if (dist[u] + ft < dist[v]) {
        dist[v] = dist[u] + ft;
        prev[v] = u;
      }
    }
  }

  return (to) => {
    const t = snapToGraph(graph, to);
    const result = (coords, pathFt) => ({ coordinates: coords, pathFt, startOffFt: s.dist, endOffFt: t.dist });
    // Both ends on the same piece of line: no search needed.
    if ((s.a === t.a && s.b === t.b) || (s.a === t.b && s.b === t.a)) {
      const tOnS = s.a === t.a ? t.t : 1 - t.t;
      return result([s.coord, t.coord], Math.abs(tOnS - s.t) * edgeFt(s));
    }
    const viaA = dist[t.a] + t.t * edgeFt(t);
    const viaB = dist[t.b] + (1 - t.t) * edgeFt(t);
    if (!Number.isFinite(Math.min(viaA, viaB))) return null;
    const last = viaA <= viaB ? t.a : t.b;
    const path = [];
    for (let u = last; u !== -1; u = prev[u]) path.unshift(graph.nodes[u].coord);
    return result([s.coord, ...path, t.coord], Math.min(viaA, viaB));
  };
}

// The shortest way along the network between two [lon, lat] points.
const routeOnGraph = (graph, from, to) => routesFrom(graph, from)(to);

// Where a [lon, lat] point falls against each segment of a line: the nearest
// spot on that segment, how far along the line it is, and how far off.
function segmentHits(coords, point) {
  const lat0 = coords[0][1];
  const cosLat = Math.cos((lat0 * Math.PI) / 180);
  const p = toFeet(point, cosLat);
  const hits = [];
  let acc = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const a = toFeet(coords[i], cosLat);
    const b = toFeet(coords[i + 1], cosLat);
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const hit = projectOnto(p, a, b);
    hits.push({ edge: i, t: hit.t, alongFt: acc + hit.t * len, offFt: hit.dist });
    acc += len;
  }
  return { hits, totalFt: acc };
}

// The separate times a line passes a point (a loop or an out-and-back passes
// some places twice): the hits no further than the segments either side. On
// a single pass that is one hit, the true nearest spot, not the first
// segment that comes close on the approach. Two segments meeting at a vertex
// both report that vertex; it counts once. A leg drawn straight back reports
// the same distance at a different spot along the line, which is a pass of
// its own.
function passesNear(hits) {
  const sameSpot = (a, b) => Math.abs(a.alongFt - b.alongFt) < 1;
  return hits.filter((h, i) => {
    const before = hits[i - 1];
    const after = hits[i + 1];
    if (before && (h.offFt > before.offFt || (h.offFt === before.offFt && sameSpot(h, before)))) return false;
    return !after || h.offFt <= after.offFt;
  });
}

// Where each pinned stop of an adventure sits along its route, in feet.
// Each stop takes one of the passes near it, chosen so the stops stay in
// itinerary order with the least total distance off the route: a loop's
// first stop lands on the way out even if the way back runs closer, and a
// last stop near the start lands at the end. A stop no order-keeping pass
// fits (the itinerary and the drawn route disagree) is placed with the stop
// before it; the validator flags those (DT-12).
const UNPLACED_COST = 1e7;
function placeStops(route, stopPins) {
  let states = [{ alongFt: 0, cost: 0, path: [] }];
  for (const pin of stopPins) {
    const passes = passesNear(segmentHits(route, pin.coordinates).hits);
    const next = [];
    for (const pass of passes) {
      let best = null;
      for (const st of states) {
        if (st.alongFt <= pass.alongFt && (!best || st.cost < best.cost)) best = st;
      }
      if (best) {
        next.push({
          alongFt: pass.alongFt,
          cost: best.cost + pass.offFt,
          path: [...best.path, { index: pin.index, alongFt: pass.alongFt, offFt: pass.offFt, placed: true }],
        });
      }
    }
    for (const st of states) {
      next.push({
        alongFt: st.alongFt,
        cost: st.cost + UNPLACED_COST,
        path: [...st.path, { index: pin.index, alongFt: st.alongFt, offFt: null, placed: false }],
      });
    }
    // Of states at the same spot along the route, only the cheapest matters.
    const byAlong = new Map();
    for (const st of next) {
      const key = st.alongFt.toFixed(1);
      if (!byAlong.has(key) || st.cost < byAlong.get(key).cost) byAlong.set(key, st);
    }
    states = [...byAlong.values()];
  }
  return states.reduce((a, b) => (b.cost < a.cost ? b : a)).path;
}

// The road crossings a line passes, in order along it: { id, alongFt } for
// each pass, so an out-and-back or a loop that crosses a road twice lists it
// twice. A crossing counts within CROSSING_NEAR_FT of the line: the cones are
// where Sarah stood at the curb, and the drawn line is traced.
const CROSSING_NEAR_FT = 250;
function crossingPasses(line, crossings) {
  if (line.length < 2) return [];
  const passes = [];
  for (const c of crossings) {
    for (const hit of passesNear(segmentHits(line, c.coordinates).hits)) {
      if (hit.offFt <= CROSSING_NEAR_FT) passes.push({ id: c.id, alongFt: hit.alongFt });
    }
  }
  return passes.sort((a, b) => a.alongFt - b.alongFt);
}

// A followed ride's list, top to bottom: its stops in order with the
// crossings between them where the line passes them. Only the line as drawn:
// a ride drawn there and back lists the way home's crossings in their place,
// and one drawn one way lists none for a way back it does not show (Sarah,
// 24 October). A stop with no location sits with the stop before it, and
// one after every located stop (back to the start, say) at the end of the
// line. Items are { kind: 'stop', index } or { kind: 'crossing', id }.
function rideItinerary(stopCount, placed, passes) {
  const alongOf = new Map(placed.map((p) => [p.index, p.alongFt]));
  const lastPlaced = Math.max(-1, ...placed.map((p) => p.index));
  const items = [];
  let at = 0;
  let next = 0;
  for (let index = 0; index < stopCount; index++) {
    if (alongOf.has(index)) at = alongOf.get(index);
    else if (index > lastPlaced) at = Infinity;
    while (next < passes.length && passes[next].alongFt < at) items.push({ kind: 'crossing', id: passes[next++].id });
    items.push({ kind: 'stop', index });
  }
  while (next < passes.length) items.push({ kind: 'crossing', id: passes[next++].id });
  return items;
}

// Where the rider is along a line, from a fix and how far along they had got
// (prevFt). Every segment has a nearest spot to the rider however far off it
// is, so only the passes about as near as the nearest count: NEAR_FT allows
// for GPS wobble and for a way back drawn beside the way out.
// - With no earlier position, the earliest of those passes. A ride is
//   followed from its start, so on a loop that ends beside where it began,
//   or a way back drawn next to the way out, the rider is on the way out.
// - With one, the pass that carries them on from where they were, looking
//   from a little behind (BACK_FT) to a stretch ahead (AHEAD_FT). Going
//   backwards costs as much as being off the line, and a long jump ahead a
//   quarter as much: where a leg is drawn back over itself both passes are
//   equally near, and GPS wobble alone can make the later leg look nearer.
// - With no pass there (a gap in fixes while the phone was locked, a stop
//   skipped, a turn back), they are found again: the earliest pass ahead of
//   where they were, else the nearest.
// The distances were tuned by walking simulated riders along every ride
// with GPS wobble, gaps in fixes and starts part way round (DT-12).
const NEAR_FT = 200;
const BACK_FT = 400;
const AHEAD_FT = 1500;
const JUMP_FT = 150;
function riderAlong(coords, point, prevFt = null) {
  if (coords.length < 2 || !point.every(Number.isFinite)) return null;
  const { hits, totalFt } = segmentHits(coords, point);
  const passes = passesNear(hits);
  const nearestFt = Math.min(...passes.map((h) => h.offFt));
  const near = passes.filter((h) => h.offFt <= nearestFt + NEAR_FT);
  let pick = near[0];
  if (prevFt !== null) {
    const inWindow = near.filter((h) => h.alongFt >= prevFt - BACK_FT && h.alongFt <= prevFt + AHEAD_FT);
    const cost = (h) => h.offFt + Math.max(0, prevFt - h.alongFt) + 0.25 * Math.max(0, h.alongFt - prevFt - JUMP_FT);
    pick = inWindow.length
      ? inWindow.reduce((a, b) => (cost(b) < cost(a) ? b : a))
      : (near.find((h) => h.alongFt > prevFt) ?? near.reduce((a, b) => (b.offFt < a.offFt ? b : a)));
  }
  return { ...pick, totalFt };
}

// How far along the rider has got, from their last value and a new fix: a
// step back of up to BACK_FT is GPS wobble, or circling at a stop, and does
// not count, so NEXT does not flicker; further back means they turned back.
function trackAlong(prevFt, fixFt) {
  if (prevFt === null || fixFt < prevFt - BACK_FT) return fixFt;
  return Math.max(prevFt, fixFt);
}

// Following a line one fix at a time: how far along it the rider has got
// (prevFt is the last result's alongFt), and how far off it they are.
function followLine(coords, point, prevFt = null) {
  const at = riderAlong(coords, point, prevFt);
  return at && { alongFt: trackAlong(prevFt, at.alongFt), offFt: at.offFt, totalFt: at.totalFt };
}

// The next stop on a followed adventure: the first placed stop further along
// the route than the rider, or null past the last one.
function nextStopIndex(placed, riderFt) {
  const ahead = placed.find((s) => s.alongFt > riderFt + 100);
  return ahead ? ahead.index : null;
}

// Following an adventure, one fix at a time: how far along its route the
// rider has got and the stop they reach next ({ alongFt, index }). Null more
// than half a mile from the route, where "next" means nothing; the next fix
// then starts afresh.
const FOLLOW_FT = 2640;
function followStep(route, placed, point, prevFt = null) {
  const at = followLine(route, point, prevFt);
  if (!at || at.offFt > FOLLOW_FT) return null;
  return { alongFt: at.alongFt, index: nextStopIndex(placed, at.alongFt) };
}

// A line cut at a distance along it: the part before and the part after,
// both including the cut, so the part ridden can be drawn apart from the
// part ahead.
function splitLine(coords, alongFt) {
  const cosLat = Math.cos((coords[0][1] * Math.PI) / 180);
  let acc = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const a = toFeet(coords[i], cosLat);
    const b = toFeet(coords[i + 1], cosLat);
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (acc + len >= alongFt || i === coords.length - 2) {
      const t = len === 0 ? 0 : Math.max(0, Math.min(1, (alongFt - acc) / len));
      const cut = [coords[i][0] + t * (coords[i + 1][0] - coords[i][0]), coords[i][1] + t * (coords[i + 1][1] - coords[i][1])];
      return { done: [...coords.slice(0, i + 1), cut], ahead: [cut, ...coords.slice(i + 1)] };
    }
    acc += len;
  }
  return null;
}

// An easy family pace, for "about N minutes". Rounded to five minutes past
// ten, because the number is an estimate and should read like one.
const FAMILY_MPH = 7;
function rideMinutes(miles) {
  const minutes = (miles / FAMILY_MPH) * 60;
  if (minutes <= 10) return Math.max(1, Math.round(minutes));
  return Math.round(minutes / 5) * 5;
}

module.exports = {
  APP_IDS,
  forApp,
  toLatLng,
  lineToLatLngs,
  displayCategory,
  selectVisible,
  selectStopPins,
  isNearArea,
  buildRouteGraph,
  routeOnGraph,
  routesFrom,
  rideMinutes,
  placeStops,
  crossingPasses,
  rideItinerary,
  riderAlong,
  trackAlong,
  followLine,
  nextStopIndex,
  followStep,
  splitLine,
};
