// Single entry point for the bundled data (ADR-0004: static JSON, no backend).
// Everything the UI knows about places, the network and adventures comes
// through here, so coordinate handling has exactly one place to go wrong.

import categories from '../data/categories.json';
import destinations from '../data/destinations.json';
import network from '../data/network.json';
import landmarks from '../data/landmarks.json';
import adventures from '../data/adventures.json';

export { categories, destinations, network, landmarks, adventures };

export const APP_NAME = 'Bike Brevard Map';
export const TOWN_NAME = 'Brevard';

// Data files store [longitude, latitude] (GeoJSON order); react-native-maps
// wants { latitude, longitude }. Convert with toLatLng only.
export function toLatLng([longitude, latitude]) {
  return { latitude, longitude };
}

export const lineToLatLngs = (geometry) => geometry.coordinates.map(toLatLng);

const byId = (items) => Object.fromEntries(items.map((item) => [item.id, item]));

export const categoryById = byId(categories);
export const destinationById = byId(destinations);
export const adventureById = byId(adventures);

// The paved path itself; its ends are the two trailheads.
export const mainSegment = network.find((s) => s.kind === 'main');
export const connectorSegments = network.filter((s) => s.kind === 'connector');

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

// Which category a place should be drawn as right now. A place can belong to
// several; show the first one the rider has switched on so the pin colour
// always answers "why am I seeing this?".
export function displayCategory(destination, active) {
  return destination.categories.find((c) => active.includes(c)) ?? destination.categories[0];
}

// Places matching any switched-on category, ordered along the path.
export function visibleDestinations(active) {
  return destinations
    .filter((d) => d.categories.some((c) => active.includes(c)))
    .sort((a, b) => a.mileMarker - b.mileMarker);
}

// Stops on an adventure that correspond to a pinned destination, in order.
export function adventureStopPins(adventure) {
  return adventure.stops
    .map((stop, index) => {
      const destination = stop.destination ? destinationById[stop.destination] : null;
      return destination ? { index, name: stop.name, coordinates: destination.coordinates } : null;
    })
    .filter(Boolean);
}

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
};
