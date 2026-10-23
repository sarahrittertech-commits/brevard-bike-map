// Single entry point for the bundled data (ADR-0004: static JSON, no backend).
// Everything the UI knows about places, the network and adventures comes
// through here, so coordinate handling has exactly one place to go wrong.

import allCategories from '../data/categories.json';
import allDestinations from '../data/destinations.json';
import allNetwork from '../data/network.json';
import allLandmarks from '../data/landmarks.json';
import allCrossings from '../data/crossings.json';
import allAdventures from '../data/adventures.json';

// require() rather than import: select.js is CommonJS so plain node can run
// the unit tests against it, and this sidesteps ESM interop entirely.
const select = require('./select');

// Which of the two apps this build is. EXPO_PUBLIC_ variables are written into
// the bundle when it is built, so each build carries only its own app's data
// view; eas.json sets it per build profile. See the runbook.
const APP = process.env.EXPO_PUBLIC_APP_VARIANT === 'kids' ? 'kids' : 'map';

const categories = select.forApp(allCategories, APP);
const destinations = select.forApp(allDestinations, APP);
const network = select.forApp(allNetwork, APP);
const landmarks = select.forApp(allLandmarks, APP);
const adventures = select.forApp(allAdventures, APP);
// Road crossings belong to the path, not to a ride, so both apps have them all.
const crossings = allCrossings;

export { categories, destinations, network, landmarks, adventures };

export const APP_NAME = APP === 'kids' ? 'Bike Brevard Kids' : 'Bike Brevard Map';
export const TOWN_NAME = 'Brevard';

// The pure selection logic lives in select.js so plain node can test it; this
// file is where it gets bound to the bundled data. Convert coordinates with
// toLatLng only.
export const { toLatLng, lineToLatLngs, displayCategory } = select;

const byId = (items) => Object.fromEntries(items.map((item) => [item.id, item]));

export const categoryById = byId(categories);

export const DIFFICULTY_LABEL = { easy: 'Easy', moderate: 'Moderate', ambitious: 'Ambitious' };
export const destinationById = byId(destinations);
export const adventureById = byId(adventures);

// The paved path itself; its ends are the two trailheads.
const mainSegment = network.find((s) => s.kind === 'main');
const connectorSegments = network.filter((s) => s.kind === 'connector');

export const TRAIL_MILES = mainSegment.miles;
export const CONNECTOR_MILES = Number(
  connectorSegments.reduce((sum, s) => sum + s.miles, 0).toFixed(1)
);

const mainCoords = mainSegment.geometry.coordinates;
export const trailheads = [
  { name: 'West Main Trailhead', coordinates: mainCoords[0], mile: 0 },
  { name: 'Pisgah Forest End · Ecusta Rd', coordinates: mainCoords[mainCoords.length - 1], mile: TRAIL_MILES },
];

// Every point on the rideable network, for fitting the map to it.
export const networkLatLngs = network.flatMap((s) => lineToLatLngs(s.geometry));

// A { latitude, longitude } position as GeoJSON's [lon, lat].
const toLonLat = (position) => [position.longitude, position.latitude];

// About 3 miles round the network: Pisgah's edge and the far end of town still
// count as here; Asheville does not.
export const isNearBrevard = (position) => select.isNearArea(position, networkLatLngs, 0.05);

// Places matching any switched-on category, ordered along the path.
export const visibleDestinations = (active) => select.selectVisible(destinations, active);

// "Ride to here": the way along the drawn network from where the rider is to
// a place. A place counts as reached when the network reaches its grounds,
// not one door, so anything within REACH_FT of a drawn line is routable; the
// same tolerance the data checks use (DT-8). Further out, the app says no
// drawn route reaches it rather than guessing a way across town.
const REACH_FT = 1000;
const routeGraph = select.buildRouteGraph(network);

export function rideToPlace(position, destination) {
  const from = toLonLat(position);
  const route = select.routeOnGraph(routeGraph, from, destination.coordinates);
  if (!route || route.endOffFt > REACH_FT) return { reachable: false };
  const miles = (route.startOffFt + route.pathFt + route.endOffFt) / 5280;
  return {
    reachable: true,
    miles: Math.round(miles * 10) / 10,
    minutes: select.rideMinutes(miles),
    // Distance from the rider to the nearest drawn line, for saying when they
    // are well off it.
    offPathMiles: Math.round((route.startOffFt / 5280) * 10) / 10,
    // The way there, [lon, lat], kept fixed once the ride starts (rideProgress).
    line: [from, ...route.coordinates, destination.coordinates],
  };
}

// Where the rider is along a ride that has started: the way there stays as it
// was drawn, cut where they have got to into the part ridden and the part
// ahead. Within ARRIVED_FT of the end they are there, and wobble at the place
// does not undo it. offFt grows when they leave the way, so the screen can
// draw a fresh one. prevFt is how far along the line they had got (the last
// result's alongFt), so a line that doubles back keeps them on the leg they
// are riding. Shaped like rideToPlace's answer, so the card shows either.
const ARRIVED_FT = 150;
export function rideProgress(line, position, prevFt = null) {
  const at = select.followLine(line, toLonLat(position), prevFt);
  if (!at) return null;
  const { done, ahead } = select.splitLine(line, at.alongFt);
  const aheadFt = Math.max(0, at.totalFt - at.alongFt);
  const milesLeft = aheadFt / 5280;
  const arrived = aheadFt <= ARRIVED_FT;
  return {
    reachable: true,
    arrived,
    // Never "0 mi to go" short of the place: the last stretch reads 0.1.
    miles: arrived ? 0 : Math.max(0.1, Math.round(milesLeft * 10) / 10),
    minutes: select.rideMinutes(milesLeft),
    // Never less than the miles to go: a ride of a few hundred feet reads 0.1 of 0.1.
    milesTotal: Math.max(0.1, Math.round((at.totalFt / 5280) * 10) / 10),
    alongFt: at.alongFt,
    offFt: at.offFt,
    done: done.map(toLatLng),
    ahead: ahead.map(toLatLng),
  };
}

// Stops on an adventure that can be pinned (a place, or a location of their
// own), in order.
export const adventureStopPins = (adventure) =>
  select.selectStopPins(adventure, destinationById);

// Where each pinned stop sits along its adventure's route. It never changes,
// so it is worked out once per adventure.
const placements = new Map();
const placedStopsOf = (adventure) => {
  if (!placements.has(adventure.id)) {
    placements.set(adventure.id, select.placeStops(adventure.route.coordinates, adventureStopPins(adventure)));
  }
  return placements.get(adventure.id);
};

export const crossingById = byId(crossings);

// A followed ride's stop list with its crossings ({ items, back }, see
// rideItinerary) and how many different roads it crosses. Worked out once
// per adventure.
const itineraries = new Map();
export function adventureItinerary(adventure) {
  if (!itineraries.has(adventure.id)) {
    const line = adventure.route.coordinates;
    const passes = select.crossingPasses(line, crossings);
    const { items, back } = select.rideItinerary(line, adventure.stops.length, placedStopsOf(adventure), passes);
    itineraries.set(adventure.id, { items, back, crossingCount: new Set(passes.map((p) => p.id)).size });
  }
  return itineraries.get(adventure.id);
}

// The stop a rider following an adventure reaches next ({ index, alongFt }),
// or null more than half a mile from the route. prevFt is the last result's
// alongFt: how far along the rider had got.
export const nextStopOf = (adventure, position, prevFt = null) =>
  select.followStep(adventure.route.coordinates, placedStopsOf(adventure), toLonLat(position), prevFt);

// Photos have to be require()d statically for the bundler to pick them up.
export const adventureImages = {
  'playground-to-dollys': require('../../assets/adventures/playground-to-dollys.jpg'),
  'ballfield-library-loop': require('../../assets/adventures/ballfield-library-loop.jpg'),
  'taproom-traverse': require('../../assets/adventures/taproom-traverse.jpg'),
  'downtown-festival': require('../../assets/adventures/downtown-festival.jpg'),
  'pisgah-gateway': require('../../assets/adventures/pisgah-gateway.jpg'),
  'concert-night': require('../../assets/adventures/concert-night.jpg'),
  'river-run': require('../../assets/adventures/river-run.jpg'),
  'bracken-loop': require('../../assets/adventures/bracken-loop.jpg'),
  'end-to-end': require('../../assets/adventures/end-to-end.jpg'),
  'short-track': require('../../assets/adventures/short-track.jpg'),
  'shop-ride': require('../../assets/adventures/shop-ride.jpg'),
  'rock-gym': require('../../assets/adventures/rock-gym.jpg'),
  'art-ride': require('../../assets/adventures/art-ride.jpg'),
};
