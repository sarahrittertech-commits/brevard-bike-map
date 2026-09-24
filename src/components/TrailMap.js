import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { LandmarkLabel, PlacePin, StopMarker, TrailheadMarker } from './MapPins';
import {
  categoryById,
  displayCategory,
  landmarks,
  lineToLatLngs,
  network,
  toLatLng,
  trailheads,
} from '../lib/data';
import { colors } from '../theme';

const MIN_ZOOM = 12;
const MAX_ZOOM = 18;

// The design's map is a town trail guide, not a world map. Zoom is fenced;
// panning is left free because react-native-maps only fences on Google.
export default function TrailMap({
  destinations,
  active,
  selectedId,
  onSelect,
  route,
  routeStops,
  fitKey,
  fitLatLngs,
  topInset = 108,
  bottomInset = 160,
  // Height of the map view and of the expanded sheet, so a selected pin can
  // be centred in the strip of map that stays visible above the sheet.
  height = 0,
  sheetHeight = 0,
}) {
  const mapRef = useRef(null);
  const [ready, setReady] = useState(false);
  const regionRef = useRef(null);
  const selected = destinations.find((d) => d.id === selectedId);

  useEffect(() => {
    // fitToCoordinates is ignored until the native map has laid out.
    if (!ready || !mapRef.current || fitLatLngs.length === 0) return;
    mapRef.current.fitToCoordinates(fitLatLngs, {
      // Right edge clears the category rail (46 wide + 12 margin); left edge
      // leaves room for the westernmost landmark label.
      edgePadding: { top: topInset, right: 76, bottom: bottomInset, left: 96 },
      animated: true,
    });
    // Refit only when the caller changes the key, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey, ready]);

  useEffect(() => {
    if (!mapRef.current || !selected || !height) return;
    const latitudeDelta = Math.min(regionRef.current?.latitudeDelta ?? 0.012, 0.012);
    // Keep longitude comfortably inside the phone's aspect ratio so the
    // latitude span is what the map actually fits, and the shift below holds.
    const longitudeDelta = latitudeDelta * 0.2;
    // The screen centre sits under the sheet; aim for the middle of the
    // visible strip instead, expressed as a latitude shift.
    // Pin tip sits on the coordinate, so aim a little above centre for the body.
    const visibleCentre = (topInset + (height - sheetHeight)) / 2 - 24;
    const shift = ((height / 2 - visibleCentre) / height) * latitudeDelta;
    const { latitude, longitude } = toLatLng(selected.coordinates);
    mapRef.current.animateToRegion(
      { latitude: latitude - shift, longitude, latitudeDelta, longitudeDelta },
      280
    );
  }, [selected, height, sheetHeight, topInset]);

  const networkAlpha = route ? '4D' : '';

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
      initialRegion={{ latitude: 35.2547, longitude: -82.7204, latitudeDelta: 0.07, longitudeDelta: 0.07 }}
      minZoomLevel={MIN_ZOOM}
      maxZoomLevel={MAX_ZOOM}
      showsPointsOfInterest={false}
      showsCompass={false}
      pitchEnabled={false}
      rotateEnabled={false}
      onMapReady={() => setReady(true)}
      onRegionChangeComplete={(region) => {
        regionRef.current = region;
      }}
      onPress={() => onSelect(null)}
    >
      {/* The network: a white casing under each segment, connectors dashed
          so the formal path stays distinguishable. Faded under a route. */}
      {network.map((segment) => (
        <Polyline
          key={`${segment.id}-casing`}
          coordinates={lineToLatLngs(segment.geometry)}
          strokeColor="#FFFFFFD9"
          strokeWidth={9}
        />
      ))}
      {network.map((segment) => (
        <Polyline
          key={segment.id}
          coordinates={lineToLatLngs(segment.geometry)}
          strokeColor={`${colors.forest}${networkAlpha || (segment.kind === 'main' ? 'F2' : 'B3')}`}
          strokeWidth={segment.kind === 'main' ? 4.5 : 3.5}
          lineDashPattern={segment.kind === 'connector' ? [1, 7] : undefined}
          lineCap="round"
        />
      ))}

      {route && <Polyline coordinates={route} strokeColor={colors.clay} strokeWidth={5.5} lineCap="round" />}

      {landmarks.map((landmark) => (
        <Marker
          key={landmark.id}
          coordinate={toLatLng(landmark.coordinates)}
          anchor={{ x: landmark.labelSide === 'right' ? 0 : 1, y: 0.5 }}
          tappable={false}
          tracksViewChanges={false}
          zIndex={-1}
        >
          <LandmarkLabel name={landmark.name} side={landmark.labelSide} offsetY={landmark.labelOffsetY} />
        </Marker>
      ))}

      {trailheads.map((t) => (
        <Marker
          key={t.name}
          coordinate={toLatLng(t.coordinates)}
          anchor={{ x: 0.5, y: 0.5 }}
          tappable={false}
          tracksViewChanges={false}
        >
          <TrailheadMarker />
        </Marker>
      ))}

      {destinations.map((d) => {
        const category = displayCategory(d, active);
        const isSelected = d.id === selectedId;
        return (
          // Keyed on selection so the pin re-renders when it changes size.
          <Marker
            key={`${d.id}-${category}-${isSelected}`}
            coordinate={toLatLng(d.coordinates)}
            anchor={{ x: 0.5, y: 1 }}
            tracksViewChanges={false}
            zIndex={isSelected ? 10 : 1}
            onPress={(e) => {
              e.stopPropagation();
              onSelect(isSelected ? null : d.id);
            }}
          >
            <PlacePin category={category} color={categoryById[category].color} selected={isSelected} />
          </Marker>
        );
      })}

      {routeStops?.map((stop) => (
        <Marker
          key={`stop-${stop.index}`}
          coordinate={toLatLng(stop.coordinates)}
          anchor={{ x: 0.5, y: 0.5 }}
          tappable={false}
          tracksViewChanges={false}
          zIndex={20}
        >
          <StopMarker number={stop.index + 1} />
        </Marker>
      ))}
    </MapView>
  );
}
