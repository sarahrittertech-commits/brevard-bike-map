// The pure selection logic behind src/lib/data.js: coordinate conversion and
// the functions that decide what the map and the sheet show.
//
// This file is deliberately CommonJS and deliberately free of imports. Its
// neighbour data.js imports JSON and require()s photographs, which only the
// app's bundler can resolve, so data.js cannot be loaded by plain node. These
// functions can, which is what lets scripts/test-lib.cjs run UT-1 to UT-6
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

// Stops on an adventure that correspond to a pinned destination, in order.
// Stops without one are skipped, but the numbering keeps the original index so
// the map's numbered stops still match the written itinerary.
function selectStopPins(adventure, destinationById) {
  return adventure.stops
    .map((stop, index) => {
      const destination = stop.destination ? destinationById[stop.destination] : null;
      return destination ? { index, name: stop.name, coordinates: destination.coordinates } : null;
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

// The shortest way along the network between two [lon, lat] points. Returns
// the route as [lon, lat] coordinates from the spot nearest `from` to the spot
// nearest `to`, its length on the network, and how far each end is from the
// network. Null if no drawn line connects them.
function routeOnGraph(graph, from, to) {
  const s = snapToGraph(graph, from);
  const t = snapToGraph(graph, to);
  const edgeFt = (snap) => {
    const [a, b] = [graph.nodes[snap.a].xy, graph.nodes[snap.b].xy];
    return Math.hypot(a[0] - b[0], a[1] - b[1]);
  };
  const result = (coords, pathFt) => ({ coordinates: coords, pathFt, startOffFt: s.dist, endOffFt: t.dist });

  // Both ends on the same piece of line: no search needed.
  if ((s.a === t.a && s.b === t.b) || (s.a === t.b && s.b === t.a)) {
    const tOnS = s.a === t.a ? t.t : 1 - t.t;
    return result([s.coord, t.coord], Math.abs(tOnS - s.t) * edgeFt(s));
  }

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

  const viaA = dist[t.a] + t.t * edgeFt(t);
  const viaB = dist[t.b] + (1 - t.t) * edgeFt(t);
  if (!Number.isFinite(Math.min(viaA, viaB))) return null;
  const last = viaA <= viaB ? t.a : t.b;
  const path = [];
  for (let u = last; u !== -1; u = prev[u]) path.unshift(graph.nodes[u].coord);
  return result([s.coord, ...path, t.coord], Math.min(viaA, viaB));
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
  rideMinutes,
};
