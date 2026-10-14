import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { LandmarkLabel, PlacePin, SELECTED_PIN_HEIGHT, StopMarker, TrailheadMarker } from './MapPins';
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

const ANDROID = Platform.OS === 'android';

// Google's base map, quietened to match the muted Apple Maps style iOS uses.
// showsPointsOfInterest is iOS-only, so on Android the businesses, transit and
// clutter are hidden here instead; parks stay because Pisgah is the point.
const GOOGLE_STYLE = [
  { stylers: [{ saturation: -35 }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ visibility: 'on' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
];

// The design's map is a town trail guide, not a world map. Zoom is fenced;
// panning is left free because react-native-maps only fences on Google.
export default function TrailMap({
  destinations,
  active,
  selected,
  onSelect,
  route,
  routeStops,
  fitKey,
  fitLatLngs,
  // { top, right, bottom, left }: how far in from each edge the header, rail,
  // sheet and system bars reach, so fitted routes stay out from under them.
  clear,
  // Size of the map view and height of the expanded sheet, so a selected pin
  // can be centred in the area of map that stays visible beside the sheet.
  width,
  height,
  sheetHeight,
  // True when the sheet is a column on the left rather than a bottom sheet.
  docked,
  // { left, bottom }: the corner the sheet leaves free for the map's
  // attribution — Google's logo on Android, Apple's Legal link on iOS. Both
  // providers' terms require it to stay visible.
  logoInset,
}) {
  const mapRef = useRef(null);
  // On Android the logo is moved with mapPadding, which also shifts what the
  // map treats as its centre; iOS moves only the label.
  const padLeft = ANDROID ? logoInset.left : 0;
  const padBottom = ANDROID ? logoInset.bottom : 0;
  const [ready, setReady] = useState(false);
  const regionRef = useRef(null);

  // Android draws a custom marker by snapshotting its view into a bitmap. With
  // tracking off from the first frame it can snapshot before the SVG and text
  // have drawn, leaving a blank pin. So on Android every change to the markers
  // tracks for a moment, then stops; iOS never needs it.
  const markerKey = [
    ready,
    active.join(),
    destinations.map((d) => d.id).join(),
    selected?.id,
    routeStops?.length,
  ].join('|');
  const [trackedKey, setTrackedKey] = useState(null);
  const [tracking, setTracking] = useState(false);
  if (ANDROID && markerKey !== trackedKey) {
    setTrackedKey(markerKey);
    setTracking(true);
  }
  useEffect(() => {
    if (!tracking) return undefined;
    const timer = setTimeout(() => setTracking(false), 600);
    return () => clearTimeout(timer);
  }, [tracking, trackedKey]);

  useEffect(() => {
    // fitToCoordinates is ignored until the native map has laid out.
    if (!ready || !mapRef.current || fitLatLngs.length === 0) return;
    mapRef.current.fitToCoordinates(fitLatLngs, {
      // The caller's left edge also leaves room for the westernmost landmark
      // label. On Android mapPadding already holds back the logo inset, and
      // edgePadding is added on top of it.
      edgePadding: {
        top: clear.top,
        right: clear.right,
        bottom: clear.bottom - padBottom,
        left: clear.left - padLeft,
      },
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
    // The screen centre sits under the sheet, so aim for the middle of the strip
    // of map that stays visible above it, expressed as a latitude shift.
    const stripCentre = (clear.top + (height - sheetHeight)) / 2;
    // The marker is anchored at its tip ({ y: 1 }), so the pin's body hangs
    // above the coordinate. The coordinate therefore has to land half a pin
    // BELOW the strip centre for the body to be what sits centred.
    //
    // KNOWN GAP: this does not land where the arithmetic says it should. Measured
    // on an iPhone 17 Pro Max (25 Sep 2026) the strip is y 159-318pt, so the pin
    // should centre on 238 with its tip at 262 — its tip actually lands at ~316,
    // 54pt low, touching the sheet. The error is NOT this offset and not the zoom
    // fence (0.012 deg is about zoom 16.4, inside MIN_ZOOM..MAX_ZOOM); the strip
    // geometry itself is confirmed, its computed bottom of 318 matching the
    // measured sheet edge. The suspect is the assumption below that the region
    // ends up with the latitudeDelta we asked for, which MapKit is free to adjust.
    //
    // Deriving a latitude shift from an assumed span is the fragile part. The
    // robust rewrite is fitToCoordinates with edgePadding, letting MapKit place
    // it. Deliberately not attempted before the 30 Sep ship: the pin is visible
    // and tappable, and this is cosmetic.
    const targetY = stripCentre + SELECTED_PIN_HEIGHT / 2;
    // With mapPadding, Google centres the region in the padded viewport.
    const viewHeight = height - padBottom;
    const shift = ((viewHeight / 2 - targetY) / viewHeight) * latitudeDelta;
    const { latitude, longitude } = toLatLng(selected.coordinates);
    // Sideways the same idea when the sheet is docked on the left: centre the
    // pin between the column and the rail. The map fits latitude, so its
    // longitude span follows from the view's shape and Mercator's stretch at
    // this latitude. Upright the pin stays centred, as it always has.
    let lonShift = 0;
    if (docked) {
      const viewWidth = width - padLeft;
      const lonSpan = (latitudeDelta * viewWidth) / viewHeight / Math.cos((latitude * Math.PI) / 180);
      const targetX = (clear.left + width - clear.right) / 2 - padLeft;
      lonShift = ((viewWidth / 2 - targetX) / viewWidth) * lonSpan;
    }
    mapRef.current.animateToRegion(
      { latitude: latitude - shift, longitude: longitude + lonShift, latitudeDelta, longitudeDelta },
      280
    );
  }, [selected, docked, width, height, sheetHeight, clear.top, clear.left, clear.right, padLeft, padBottom]);

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      mapType={ANDROID ? 'standard' : 'mutedStandard'}
      customMapStyle={ANDROID ? GOOGLE_STYLE : undefined}
      mapPadding={ANDROID ? { top: 0, right: 0, bottom: padBottom, left: padLeft } : undefined}
      legalLabelInsets={ANDROID ? undefined : { top: 0, right: 0, bottom: logoInset.bottom, left: logoInset.left }}
      // Google-only behaviours the design does not have: a directions toolbar
      // on marker tap, and the camera jumping to a tapped marker, which would
      // fight the centring above.
      toolbarEnabled={false}
      moveOnMarkerPress={false}
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
          strokeColor={`${colors.forest}${route ? '4D' : segment.kind === 'main' ? 'F2' : 'B3'}`}
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
          tracksViewChanges={tracking}
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
          tracksViewChanges={tracking}
        >
          <TrailheadMarker />
        </Marker>
      ))}

      {destinations.map((d) => {
        const category = displayCategory(d, active);
        const isSelected = d === selected;
        return (
          // Outside the brief Android window tracksViewChanges is false, so the
          // native marker only repaints on remount. The key must therefore name
          // every prop that changes how the pin looks, or a new visual state
          // will silently not appear.
          <Marker
            key={`${d.id}-${category}-${isSelected}`}
            coordinate={toLatLng(d.coordinates)}
            anchor={{ x: 0.5, y: 1 }}
            tracksViewChanges={tracking}
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
          tracksViewChanges={tracking}
          zIndex={20}
        >
          <StopMarker number={stop.index + 1} />
        </Marker>
      ))}
    </MapView>
  );
}
