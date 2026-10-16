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

module.exports = { toLatLng, lineToLatLngs, displayCategory, selectVisible, selectStopPins, isNearArea };
