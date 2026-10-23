import { memo, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import {
  LANDMARK_DOT_OFFSET,
  LandmarkLabel,
  PIN_HEIGHT,
  PlacePin,
  SELECTED_PIN_HEIGHT,
  StopMarker,
  TrailheadMarker,
} from './MapPins';
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
// Clear space above a place pin, part of its touch area.
const PIN_HIT_TOP = 12;

// The network never changes while the app runs, so its lines are converted
// once here rather than on every render, which would hand the native
// polylines fresh arrays each time a pin is tapped.
const networkLines = network.map((segment) => ({ ...segment, latLngs: lineToLatLngs(segment.geometry) }));

// Google's base map, quietened to match the muted Apple Maps style iOS uses.
// showsPointsOfInterests is iOS-only, so on Android the businesses, transit and
// clutter are hidden here instead; parks stay because Pisgah is the point.
const GOOGLE_STYLE = [
  { stylers: [{ saturation: -35 }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ visibility: 'on' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
];

// Landmark labels and trailhead squares are for reading, not tapping, but
// Apple Maps gives every marker a touch box and no way to turn it off
// (`tappable` is Google-only). A label sitting over a pin could take the tap
// meant for the pin, whichever MapKit happened to stack on top, so a pin
// sometimes needed two or three tries (F-12, F-19). Below "required" display
// priority, MapKit hides a marker wherever it collides with a pin or a
// numbered stop, so the pin is the only thing there to tap.
const READ_ONLY_PRIORITY = 'high';

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
          // anchor is Google's; Apple Maps centres a custom view on the
          // coordinate and needs centerOffset to put the dot there instead.
          anchor={{ x: landmark.labelSide === 'right' ? 0 : 1, y: 0.5 }}
          centerOffset={{ x: landmark.labelSide === 'right' ? LANDMARK_DOT_OFFSET : -LANDMARK_DOT_OFFSET, y: 0 }}
          // A muted label also gives way first to the other labels.
          displayPriority={landmark.muted ? 'low' : READ_ONLY_PRIORITY}
          tracksViewChanges={tracking}
          zIndex={-1}
        >
          <LandmarkLabel
            name={landmark.name}
            side={landmark.labelSide}
            offsetY={landmark.labelOffsetY}
            muted={landmark.muted}
          />
        </Marker>
      ))}

      {trailheads.map((t) => (
        <Marker
          key={t.name}
          coordinate={toLatLng(t.coordinates)}
          anchor={{ x: 0.5, y: 0.5 }}
          displayPriority={READ_ONLY_PRIORITY}
          tracksViewChanges={tracking}
        >
          <TrailheadMarker />
        </Marker>
      ))}
    </>
  );
});

// One place's pin. Memoised: while riding to a place every position update
// redraws the route, and without it every pin on the map would be rebuilt
// with it.
const PlaceMarker = memo(function PlaceMarker({ destination, category, selected, tracking, onSelect }) {
  return (
    <Marker
      coordinate={toLatLng(destination.coordinates)}
      anchor={{ x: 0.5, y: 1 }}
      // Apple Maps: lift the view by half its height so the tip, not the
      // middle of the pin, is on the place.
      centerOffset={{ x: 0, y: -(PIN_HIT_TOP + (selected ? SELECTED_PIN_HEIGHT : PIN_HEIGHT)) / 2 }}
      tracksViewChanges={tracking}
      zIndex={selected ? 10 : 1}
      onPress={(e) => {
        e.stopPropagation();
        onSelect(destination.id);
      }}
    >
      {/* Clear space round the pin, so a rider on a bike does not have to hit
          the 26pt pin itself. None below: the tip is the anchor. */}
      <View style={styles.pinHitArea}>
        <PlacePin category={category} color={categoryById[category].color} selected={selected} />
      </View>
    </Marker>
  );
});

export default memo(function TrailMap({
  destinations,
  active,
  selected,
  onSelect,
  route,
  // True while riding to a place: the fitted ride owns the camera.
  riding,
  // Riding to a place: the part of the way already ridden, drawn faint.
  routeDone,
  routeStops,
  // Index of the stop the rider reaches next, drawn larger in the route brown.
  nextStop,
  // Index of the stop whose card is open. iOS ignores a tap on a marker it
  // still counts as selected, so a stop's marker is redrawn when its card
  // opens or closes, as place pins are; without it a stop opened once could
  // not be opened again.
  selectedStop,
  onSelectStop,
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
    routeStops?.map((s) => s.index).join(),
    nextStop,
    selectedStop,
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

  // The card's height and what covers the map are read when the centring
  // runs, not watched: a card that grows or shrinks (a title wrapping as it
  // slides down, a distance appearing) must not pull the map back to the
  // place after the rider has panned away. Only a new place, or a new screen
  // size, centres again.
  const layoutRef = useRef({ sheetHeight, clear });
  useEffect(() => {
    layoutRef.current = { sheetHeight, clear };
  }, [sheetHeight, clear]);

  useEffect(() => {
    // While riding to the place, the fitted ride owns the camera; centring
    // the place would zoom back in and push the rider off screen. A stop on
    // a followed adventure still centres.
    if (!mapRef.current || !selected || !height || riding) return undefined;
    // Put the selected place in the middle of the map the card leaves
    // visible: between the header and the card, or between the docked column
    // and the rail. Earlier versions worked this out from the zoom they asked
    // for, which MapKit adjusts, and the pin landed about 50pt low, half under
    // the card. So this measures where the pin really is on screen and moves
    // the map by the difference.
    //
    // It waits for the card to measure itself first, since that changes
    // sheetHeight a moment after the card opens.
    let cancelled = false;
    const timer = setTimeout(async () => {
      const map = mapRef.current;
      if (!map) return;
      const { sheetHeight, clear } = layoutRef.current;
      const place = toLatLng(selected.coordinates);
      // Zoomed out past SELECT_SPAN: zoom in on the place first. Closer than
      // that, keep the rider's zoom; a tap never zooms out.
      if ((regionRef.current?.latitudeDelta ?? Infinity) > SELECT_SPAN) {
        map.animateToRegion({ ...place, latitudeDelta: SELECT_SPAN, longitudeDelta: SELECT_SPAN }, 250);
        await new Promise((resolve) => setTimeout(resolve, 300));
        if (cancelled) return;
      }
      const visibleBottom = height - (docked ? 0 : sheetHeight);
      // A place's pin hangs above its coordinate (anchored at the tip), so the
      // tip goes half a pin below the middle and the pin's body sits on it. A
      // numbered stop is a circle on its coordinate and goes in the middle.
      const isStop = routeStops?.some((s) => s.index === selectedStop);
      const target = {
        x: docked ? (clear.left + width - clear.right) / 2 : width / 2,
        y: (clear.top + visibleBottom) / 2 + (isStop ? 0 : SELECTED_PIN_HEIGHT / 2),
      };
      try {
        const [now, camera] = await Promise.all([map.pointForCoordinate(place), map.getCamera()]);
        const centre = await map.pointForCoordinate(camera.center);
        const dx = now.x - target.x;
        const dy = now.y - target.y;
        if (cancelled || (Math.abs(dx) < 4 && Math.abs(dy) < 4)) return;
        const next = await map.coordinateForPoint({ x: centre.x + dx, y: centre.y + dy });
        if (!cancelled) map.animateCamera({ center: next }, { duration: 250 });
      } catch {
        // The map was not ready to measure; the pin is still on screen.
      }
    }, 160);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selected, selectedStop, routeStops, riding, docked, width, height]);

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
      // Only once the map is ready: react-native-maps 1.27 on Android applies
      // padding to a map that may not exist yet, and crashes.
      mapPadding={ANDROID && ready ? { top: 0, right: 0, bottom: padBottom, left: padLeft } : undefined}
      legalLabelInsets={ANDROID ? undefined : { top: 0, right: 0, bottom: logoInset.bottom, left: logoInset.left }}
      appleLogoInsets={ANDROID ? undefined : { top: 0, right: 0, bottom: logoInset.bottom, left: logoInset.left }}
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
      // The prop is plural; the singular spelling was silently ignored, so Apple
      // drew its own businesses and campuses over ours until 1.1.1.
      showsPointsOfInterests={false}
      showsCompass={false}
      pitchEnabled={false}
      rotateEnabled={false}
      onMapReady={() => setReady(true)}
      onRegionChangeComplete={(region) => {
        regionRef.current = region;
      }}
      // A tap on a label or trailhead reaches the map as a 'marker-press'; it is
      // not a tap on empty map, so it does not close the open card.
      onPress={(e) => e.nativeEvent.action !== 'marker-press' && onSelect(null)}
    >
      <StaticLayers faded={!!route} tracking={tracking} />

      {/* The followed route: wide, with a white edge, so it reads at a glance
          from a bike. */}
      {routeDone?.length > 1 && (
        <Polyline coordinates={routeDone} strokeColor={`${colors.route}59`} strokeWidth={9} lineCap="round" lineJoin="round" />
      )}
      {route && <Polyline coordinates={route} strokeColor={colors.white} strokeWidth={13} lineCap="round" lineJoin="round" />}
      {route && <Polyline coordinates={route} strokeColor={colors.route} strokeWidth={9} lineCap="round" lineJoin="round" />}

      {destinations.map((d) => {
        const category = displayCategory(d, active);
        const isSelected = d === selected;
        return (
          // Outside the brief Android window tracksViewChanges is false, so the
          // native marker only repaints on remount. The key must therefore name
          // every prop that changes how the pin looks, or a new visual state
          // will silently not appear.
          <PlaceMarker
            key={`${d.id}-${category}-${isSelected}`}
            destination={d}
            category={category}
            selected={isSelected}
            tracking={tracking}
            onSelect={onSelect}
          />
        );
      })}

      {routeStops?.map((stop) => {
        const isNext = stop.index === nextStop;
        return (
          <Marker
            key={`stop-${stop.index}-${isNext}-${stop.index === selectedStop}`}
            coordinate={toLatLng(stop.coordinates)}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={tracking}
            zIndex={20}
            onPress={(e) => {
              e.stopPropagation();
              onSelectStop(stop.index);
            }}
          >
            <View style={styles.stopHitArea}>
              <StopMarker number={stop.index + 1} next={isNext} />
            </View>
          </Marker>
        );
      })}
    </MapView>
  );
});

const styles = StyleSheet.create({
  stopHitArea: {
    padding: 10,
  },
  pinHitArea: {
    paddingHorizontal: 12,
    paddingTop: PIN_HIT_TOP,
  },
});
