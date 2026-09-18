// Single entry point for the bundled data (ADR-0004: static JSON, no backend).
// Everything the UI knows about destinations, routes and categories comes
// through here, so coordinate handling has exactly one place to go wrong.

import destinations from '../data/destinations.json';
import routes from '../data/routes.json';
import categories from '../data/categories.json';
import adventures from '../data/adventures.json';

export { destinations, routes, categories, adventures };

// Brevard town centre. Data files store [longitude, latitude] (GeoJSON order);
// react-native-maps wants { latitude, longitude }. Convert with toLatLng only.
export const BREVARD = [-82.7343, 35.2334];

export function toLatLng([longitude, latitude]) {
  return { latitude, longitude };
}

export function destinationById(id) {
  return destinations.find((d) => d.id === id);
}

export function categoryById(id) {
  return categories.find((c) => c.id === id);
}

// Routes are stored one way and treated as bidirectional (see data-model.md).
// Returns the route with geometry oriented from -> to, or null when no
// verified connection exists — the caller must say so honestly (ADR-0003).
export function findRoute(fromId, toId) {
  const forward = routes.find((r) => r.from === fromId && r.to === toId);
  if (forward) return forward;

  const reverse = routes.find((r) => r.from === toId && r.to === fromId);
  if (!reverse) return null;

  return {
    ...reverse,
    from: fromId,
    to: toId,
    geometry: {
      ...reverse.geometry,
      coordinates: [...reverse.geometry.coordinates].reverse(),
    },
  };
}
