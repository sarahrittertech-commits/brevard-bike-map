import { memo, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
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
// How much of the map, in degrees of latitude, a selected place shows: about
// two miles, enough to keep the neighbouring places and the path in view.
const SELECT_SPAN = 0.03;
const MAX_ZOOM = 18;

const ANDROID = Platform.OS === 'android';

// The network never changes while the app runs, so its lines are converted
// once here rather than on every render, which would hand the native
// polylines fresh arrays each time a pin is tapped.
const networkLines = network.map((segment) => ({ ...segment, latLngs: lineToLatLngs(segment.geometry) }));

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
// The path network, landmarks and trailheads never change while the app runs,
// so they render once and stay put when a pin is tapped, the sheet moves or
// the rider's position updates. Only fading under a route redraws them.
const StaticLayers = memo(function StaticLayers({ faded, tracking }) {
  return (
    <>
      {/* The network: a white casing under each segment, connectors in gray
          so the formal path stays distinguishable. Faded under a route. */}
      {networkLines.map((segment) => (
        <Polyline key={`${segment.id}-casing`} coordinates={segment.latLngs} strokeColor="#FFFFFFD9" strokeWidth={9} />
      ))}
      {networkLines.map((segment) => (
        <Polyline
          key={segment.id}
          coordinates={segment.latLngs}
          // The path is forest green; connectors are a solid warm gray. They
          // were dotted once, and the dots read as places: the same shape as
          // the landmark dots, growing and shrinking with the zoom.
          strokeColor={`${segment.kind === 'main' ? colors.forest : colors.connector}${faded ? '4D' : 'F2'}`}
          strokeWidth={segment.kind === 'main' ? 4.5 : 3.5}
          lineCap="round"
        />
      ))}

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
    </>
  );
});

export default memo(function TrailMap({
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
  // True once the rider has opted in and granted location: the map draws its
  // own blue dot. Off by default, and off again whenever the rider says so.
  showsUser,
  // { key, latitude, longitude }: a fix to centre on. A new key re-centres,
  // so tapping the button twice in one place still moves the map back.
  userFocus,
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
    // Fit a small box round the place into the strip of map left visible
    // above the sheet (or beside the docked column), and let the map place
    // it. Earlier this was worked out by hand from an assumed zoom, which
    // MapKit adjusts, and the pin landed 54pt low, half under the sheet.
    //
    // The box keeps the current zoom if the rider is already closer than
    // SELECT_SPAN, so a tap never zooms out, and never jumps from the whole
    // town to street level either.
    const span = Math.min(regionRef.current?.latitudeDelta ?? SELECT_SPAN, SELECT_SPAN) * 0.4;
    const { latitude, longitude } = toLatLng(selected.coordinates);
    const lonSpan = span / Math.cos((latitude * Math.PI) / 180);
    mapRef.current.fitToCoordinates(
      [
        { latitude: latitude - span / 2, longitude: longitude - lonSpan / 2 },
        { latitude: latitude + span / 2, longitude: longitude + lonSpan / 2 },
      ],
      {
        // The pin hangs above its coordinate (anchored at the tip), so the
        // top keeps a pin's height clear as well as the header.
        edgePadding: {
          top: clear.top + SELECTED_PIN_HEIGHT,
          right: clear.right,
          bottom: (docked ? 28 : sheetHeight + 16) - padBottom,
          left: (docked ? clear.left : 40) - padLeft,
        },
        animated: true,
      }
    );
  }, [selected, docked, width, height, sheetHeight, clear.top, clear.left, clear.right, padLeft, padBottom]);

  useEffect(() => {
    if (!mapRef.current || !userFocus) return;
    const latitudeDelta = 0.012;
    mapRef.current.animateToRegion(
      { latitude: userFocus.latitude, longitude: userFocus.longitude, latitudeDelta, longitudeDelta: latitudeDelta },
      400
    );
  }, [userFocus]);

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
      // The provider's own dot: it follows the phone and needs nothing drawn
      // here. Google's own "my location" button is off; the rail has one.
      showsUserLocation={showsUser}
      showsMyLocationButton={false}
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
      <StaticLayers faded={!!route} tracking={tracking} />

      {route && <Polyline coordinates={route} strokeColor={colors.clay} strokeWidth={5.5} lineCap="round" />}

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
              onSelect(d.id);
            }}
          >
            {/* Clear space round the pin, so a rider on a bike does not have
                to hit the 26pt pin itself. None below: the tip is the anchor. */}
            <View style={styles.pinHitArea}>
              <PlacePin category={category} color={categoryById[category].color} selected={isSelected} />
            </View>
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
});

const styles = StyleSheet.create({
  pinHitArea: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
});
