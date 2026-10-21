import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, BackHandler, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import ChevronUp from 'lucide-react-native/icons/chevron-up';
import X from 'lucide-react-native/icons/x';

import CategoryRail, { RAIL_HEIGHT, SPLIT_RAIL_WIDTH } from '../components/CategoryRail';
import MapSheet, { PEEK, SHEET_FRACTION } from '../components/MapSheet';
import TrailMap from '../components/TrailMap';
import {
  APP_NAME,
  TOWN_NAME,
  adventureStopPins,
  destinationById,
  isNearBrevard,
  lineToLatLngs,
  networkLatLngs,
  nextStopOf,
  rideToPlace,
  visibleDestinations,
} from '../lib/data';
import { useLayoutClass } from '../lib/layout';
import { cardFloat, colors, fillRow, fonts, radius, text } from '../theme';

// Room the floating header card takes, top inset aside.
const HEADER_SPACE = 84;
// The widest the docked column gets on a wide screen.
const DOCK_MAX_WIDTH = 400;
const EDGE = 12;
const RAIL_WIDTH = 46;
// Margin left of the fitted path. It was 96, to fit a landmark label, which
// pushed the whole town right and shrank it; the labels west of the path sit
// outside the fit either way.
const LABEL_ROOM = 48;

// While riding to a place, a tap on the map does nothing.
const IGNORE = () => {};

// The app's own explanation, shown once before iOS or Android asks for
// location. Resolves true only if the rider chooses to go on.
function confirmLocation() {
  return new Promise((resolve) => {
    Alert.alert(
      'Show where you are?',
      `${APP_NAME} can put a dot on the map where you are, so you can see what is near you. ` +
        'It uses your location only while the app is open and this button is on. Your location is never saved or ' +
        'sent anywhere. Tap the button again to turn it off, or switch it off for good in Settings.',
      [
        { text: 'Not now', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Continue', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
}

// The header while following an adventure. Tap it to open the list of stops
// and review where the ride goes; with location on, the next stop is marked.
// Stops tied to a place can be tapped to show them on the map.
function FollowingCard({ adventure, open, onToggle, nextStop, onSelectStop, onClose, maxListHeight }) {
  const Chevron = open ? ChevronUp : ChevronDown;
  return (
    <View style={[styles.card, styles.followingCardOuter]}>
      <View style={styles.followingCard}>
        <Pressable
          onPress={onToggle}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityLabel={open ? 'Hide the stops' : 'Show the stops'}
          style={[styles.cardBody, styles.followingToggle]}
        >
          <View style={styles.cardBody}>
            <Text style={styles.followingEyebrow}>Following adventure</Text>
            <Text style={styles.title} numberOfLines={1}>
              {adventure.title}
            </Text>
            <Text style={styles.subtitle}>
              {adventure.miles} mi · {adventure.minutes} min · {adventure.stops.length} stops
              {nextStop !== null ? ` · next: ${nextStop + 1}` : ''}
            </Text>
          </View>
          <Chevron size={22} color={colors.inkFaint} />
        </Pressable>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Stop following this adventure"
          hitSlop={10}
          style={({ pressed }) => [styles.closeButton, styles.closeButtonLarge, pressed && { backgroundColor: colors.canvas }]}
        >
          <X size={22} color={colors.inkFaint} />
        </Pressable>
      </View>
      {open && (
        <ScrollView style={[styles.stopList, { maxHeight: maxListHeight }]}>
          {adventure.stops.map((s, i) => {
            const isNext = i === nextStop;
            const tappable = !!s.destination;
            return (
              <Pressable
                key={`${s.name}-${i}`}
                onPress={tappable ? () => onSelectStop(i) : undefined}
                disabled={!tappable}
                accessibilityRole={tappable ? 'button' : 'text'}
                style={({ pressed }) => [styles.stopRow, isNext && styles.stopRowNext, pressed && styles.stopRowPressed]}
              >
                <View style={[styles.stopNumber, isNext && styles.stopNumberNext]}>
                  <Text style={styles.stopNumberText}>{i + 1}</Text>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.stopTitleRow}>
                    <Text style={styles.stopName}>{s.name}</Text>
                    {isNext && <Text style={styles.nextChip}>Next</Text>}
                  </View>
                  <Text style={styles.stopNote}>{s.note}</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

// The main screen: map, floating header, category rail, bottom sheet.
//
// Upright, the header spans the top, the rail sits on the right and the sheet
// rises from the bottom. On a screen wider than tall (a phone on its side,
// iPhone Duo open like a book) the header and sheet dock into a column on the
// leading half and the map has the rest. The column stops short of the middle,
// so on iPhone Duo nothing in it sits across the fold.
// `following` is an adventure whose route is drawn on top of the network.
// `inFront` is false while another screen is laid over the map.
export default function MapScreen({ following, showNonce, onStopFollowing, inFront }) {
  const insets = useSafeAreaInsets();
  const { regular, wide, height: windowHeight } = useLayoutClass();
  const [active, setActive] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [recenter, setRecenter] = useState(0);
  const [locating, setLocating] = useState(false);
  const locateRun = useRef(0);
  // Where the rider is, while they have location on. Kept in memory only.
  const [position, setPosition] = useState(null);
  // The place the rider asked to ride to: the map then shows only it, them
  // and the way between.
  const [rideToId, setRideToId] = useState(null);
  // A place the rider asked to ride to before location was on: the ride
  // starts once their position arrives.
  const [pendingRideId, setPendingRideId] = useState(null);
  const [userFocus, setUserFocus] = useState(null);
  // The "Getting around" card can be put away for the session; it comes back
  // the next time the app opens. Nothing is saved.
  const [factsDismissed, setFactsDismissed] = useState(false);
  // While following an adventure: the stop the rider tapped (its index in
  // the itinerary), and whether the header card is open to list the stops.
  const [selectedStop, setSelectedStop] = useState(null);
  const [stopsOpen, setStopsOpen] = useState(false);
  // How much of the screen the open sheet covers: less than its full height
  // when it is showing one place's card.
  const [openSheetHeight, setOpenSheetHeight] = useState(0);
  const [{ width, height }, setSize] = useState({ width: 0, height: 0 });

  const shown = useMemo(() => visibleDestinations(active), [active]);
  const rideDest = rideToId ? destinationById[rideToId] : null;
  const stop = following && selectedStop !== null ? following.stops[selectedStop] : null;
  const stopDest = stop?.destination ? destinationById[stop.destination] : null;
  const selected = rideDest ?? stopDest ?? shown.find((d) => d.id === selectedId) ?? null;
  // Distance and time to the selected place, and the line to draw while
  // riding to one. Both follow the rider as their position updates.
  // Outside Brevard there is no sensible distance to give, so the card says so.
  const ride = useMemo(() => {
    if (!selected || !position) return null;
    return isNearBrevard(position) ? rideToPlace(position, selected) : { outside: true };
  }, [selected, position]);
  const rideRoute = rideDest && ride?.reachable ? ride.latLngs : null;
  // Nothing in the sheet to show: following an adventure (the header card
  // lists its stops), or the rider put the "Getting around" card away. The
  // map then has the whole screen.
  const sheetHidden = !selected && (following ? true : active.length === 0 && factsDismissed);
  const bottomCover = sheetHidden ? 0 : PEEK;
  const topInset = insets.top + 12;
  // Until the first layout reports a width, `width` is 0; never hand the
  // column a negative size.
  const dock = wide
    ? {
        left: insets.left + EDGE,
        width: Math.max(0, Math.min(DOCK_MAX_WIDTH, Math.round(width / 2) - insets.left - 2 * EDGE)),
      }
    : null;
  // On a tall regular-width screen (iPhone Duo's inner display upright) the
  // open sheet stops at the middle of the window, so when the device is half
  // folded its top edge lands on the fold: map above, list below.
  const sheetHeight = dock
    ? height - topInset - HEADER_SPACE
    : regular
      ? height - Math.round(windowHeight / 2)
      : Math.round(height * SHEET_FRACTION);

  // The rail goes below the header when upright, beside it when docked, and
  // splits into two columns when a single one would run into the sheet.
  const railTop = dock ? topInset : topInset + 80;
  const railBottom = dock ? height - EDGE : height - bottomCover - 8;
  const splitRail = railBottom - railTop < RAIL_HEIGHT;
  const railRight = insets.right + EDGE;
  const railSpace = railRight + (splitRail ? SPLIT_RAIL_WIDTH : RAIL_WIDTH) + 18;

  // Handed to the map as stable values, so a tap that changes none of them
  // does not redraw it.
  const dockLeft = dock?.left;
  const dockWidth = dock?.width;
  const mapDestinations = useMemo(() => (rideDest ? [rideDest] : shown), [rideDest, shown]);
  const mapClear = useMemo(
    () =>
      dockWidth !== undefined
        ? { top: topInset, right: railSpace, bottom: 28, left: dockLeft + dockWidth + LABEL_ROOM }
        : { top: topInset + HEADER_SPACE, right: railSpace, bottom: bottomCover + 28, left: insets.left + LABEL_ROOM },
    [dockLeft, dockWidth, topInset, railSpace, insets.left, bottomCover]
  );
  const logoInset = useMemo(
    () => (dockWidth !== undefined ? { left: dockLeft + dockWidth, bottom: 0 } : { left: 0, bottom: bottomCover }),
    [dockLeft, dockWidth, bottomCover]
  );

  const route = useMemo(() => (following ? lineToLatLngs(following.route) : null), [following]);
  const routeStops = useMemo(() => (following ? adventureStopPins(following) : null), [following]);

  const nextStop = useMemo(
    () => (following && position ? nextStopOf(following, position) : null),
    [following, position]
  );

  // A numbered stop on the map, or in the header's list: show it in the
  // sheet and move the map to it.
  const selectStop = useCallback((index) => {
    setSelectedId(null);
    setSelectedStop(index);
    setStopsOpen(false);
    setSheetOpen(true);
  }, []);

  const stopFollowing = useCallback(() => {
    setSelectedStop(null);
    setStopsOpen(false);
    onStopFollowing();
  }, [onStopFollowing]);

  // Selecting a pin or row always reveals its detail; closing it (its close
  // button, or a tap on the map) drops the sheet back to peek. Left open, the
  // sheet would switch to the full place list and cover the very pins the
  // rider was about to tap next.
  const select = useCallback((id) => {
    setSelectedId(id);
    setSelectedStop(null);
    setSheetOpen(!!id);
  }, []);

  const toggle = (id) => {
    setSelectedId(null);
    setActive((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  // Showing the rider's location is opt-in, every launch: nothing is asked
  // until they tap the button, the dot goes away when they tap it again, and
  // the position never leaves the phone or outlives the session. The system
  // asks for permission the first time only; after a refusal the button
  // explains where to turn it back on rather than asking again.
  // `fromPlace` is set when the rider turns location on from a place's card:
  // the card stays open and the map stays put, so the distance appears where
  // they asked for it.
  const locate = async (fromPlace = false) => {
    // Each tap starts a new run; a fix that arrives after the rider has
    // switched location off again belongs to an old run and is dropped.
    const run = ++locateRun.current;
    if (locating) {
      setLocating(false);
      setPosition(null);
      setRideToId(null);
      return false;
    }
    let permission = await Location.getForegroundPermissionsAsync();
    const asked = permission.status !== 'granted' && permission.canAskAgain;
    if (asked) {
      // Before the system prompt, say in the app's own words what the dot is
      // for and what happens to the location, and let the rider decline here.
      if (!(await confirmLocation())) return false;
      permission = await Location.requestForegroundPermissionsAsync();
    }
    if (permission.status !== 'granted') {
      // Declining the system prompt a moment ago needs no second dialog.
      if (!asked) {
        Alert.alert(
          'Location is off',
          `To see where you are on the map, allow ${APP_NAME} to use your location in Settings.`,
          [
            { text: 'Not now', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
      return false;
    }
    setLocating(true);
    try {
      const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (run !== locateRun.current) return;
      setPosition({ latitude: coords.latitude, longitude: coords.longitude });
      if (isNearBrevard(coords)) {
        if (!fromPlace) {
          setSelectedId(null);
          setSheetOpen(false);
          setUserFocus({ key: Date.now(), latitude: coords.latitude, longitude: coords.longitude });
        }
      } else {
        Alert.alert(
          `You're outside ${TOWN_NAME}`,
          `Your location is on, but this map only covers ${TOWN_NAME}, so it stays here. Come ride!`
        );
      }
    } catch {
      // No fix yet (indoors, airplane mode). The dot appears on its own once
      // the phone finds itself; there is just nothing to centre on now.
    }
    return true;
  };

  // While location is on, follow the rider so distances stay current. The
  // subscription ends the moment they switch it off or leave the screen.
  useEffect(() => {
    if (!locating) return undefined;
    let sub = null;
    let cancelled = false;
    Location.watchPositionAsync({ accuracy: Location.Accuracy.Balanced, distanceInterval: 20 }, ({ coords }) =>
      setPosition({ latitude: coords.latitude, longitude: coords.longitude })
    )
      .then((s) => {
        if (cancelled) s.remove();
        else sub = s;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [locating]);

  // Riding to a place replaces any followed adventure, and the sheet drops to
  // peek so the way there gets the map.
  const startRide = (id) => {
    if (following) stopFollowing();
    setRideToId(id);
    setSheetOpen(false);
  };
  // Start the ride the rider asked for once a route exists; drop the request
  // if there is none (outside Brevard, nothing drawn reaches the place) or the
  // place card has been closed.
  if (pendingRideId && ride && (selected?.id !== pendingRideId || !ride.reachable)) {
    setPendingRideId(null);
  } else if (pendingRideId && ride?.reachable) {
    setPendingRideId(null);
    if (following) stopFollowing();
    setRideToId(pendingRideId);
    setSheetOpen(false);
  }

  const endRide = () => {
    setRideToId(null);
    setSelectedId(null);
  };

  // Following a route takes over the map: drop any selected pin and let the
  // sheet fall back to peek, so the route gets the whole visible area. Without
  // this the route is fitted against the PEEK bottom inset while an expanded
  // sheet is actually covering 64% of the screen, hiding the bottom of it.
  //
  // Adjusting state during render is React's documented way to respond to a
  // changed prop; doing it in an effect trips react-hooks/set-state-in-effect
  // and costs an extra committed render. The trigger is showNonce rather than
  // `following`, because tapping "Show route on map" for the adventure already
  // being followed leaves `following` identical.
  const [handledNonce, setHandledNonce] = useState(showNonce);
  if (showNonce !== handledNonce) {
    setHandledNonce(showNonce);
    setSelectedId(null);
    setSelectedStop(null);
    setStopsOpen(false);
    setSheetOpen(false);
    setRideToId(null);
  }

  // Android's back button peels the map back one layer at a time: the
  // selected place, then the open sheet, then the followed route. With
  // nothing left to close it falls through and Android leaves the app.
  useEffect(() => {
    if (!inFront) return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (rideToId) endRide();
      else if (selectedId) setSelectedId(null);
      else if (sheetOpen) setSheetOpen(false);
      else if (selectedStop !== null) setSelectedStop(null);
      else if (following) stopFollowing();
      else return false;
      return true;
    });
    return () => sub.remove();
  }, [inFront, rideToId, selectedId, selectedStop, sheetOpen, following, stopFollowing]);

  return (
    <View
      style={styles.screen}
      onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
    >
      <TrailMap
        destinations={mapDestinations}
        active={active}
        selected={selected}
        // While riding to a place, a tap on the map does not end the ride;
        // the header's close button does.
        onSelect={rideDest ? IGNORE : select}
        route={rideRoute ?? route}
        routeStops={rideDest ? null : routeStops}
        nextStop={nextStop}
        onSelectStop={selectStop}
        // Docking or undocking on rotation moves what covers the map, so it
        // refits; panning around within one layout is left alone. The column's
        // width is in the key, not just whether it exists, because it settles
        // only once this screen's own layout reports the new size.
        fitKey={`${rideToId ?? following?.id ?? 'trail'}-${rideRoute ? 'ride' : ''}-${recenter}-${showNonce}-${dock ? dock.width : 'upright'}`}
        fitLatLngs={rideRoute ?? route ?? networkLatLngs}
        // What the map must keep clear of: the header, sheet and rail. Docked,
        // the header and sheet are a column on the left and nothing covers
        // the bottom of the map.
        clear={mapClear}
        width={width}
        height={height}
        docked={!!dock}
        sheetHeight={dock ? 0 : openSheetHeight || sheetHeight}
        logoInset={logoInset}
        showsUser={locating}
        userFocus={userFocus}
      />

      <View style={[styles.rail, { top: railTop, right: railRight }]}>
        <CategoryRail
          split={splitRail}
          active={active}
          onToggle={toggle}
          onClear={() => {
            setActive([]);
            setSelectedId(null);
          }}
          onRecenter={() => setRecenter((n) => n + 1)}
          locating={locating}
          onLocate={() => locate()}
        />
      </View>

      {/* After the rail, so the header card's open stop list sits over it. */}
      <View
        style={[
          styles.header,
          { top: topInset },
          dock ? dock : { left: insets.left + 16, right: insets.right + 16 },
        ]}
        pointerEvents="box-none"
      >
        {rideDest ? (
          <View style={[styles.card, styles.followingCard]}>
            <View style={styles.cardBody}>
              <Text style={styles.followingEyebrow}>Riding to</Text>
              <Text style={styles.title} numberOfLines={1}>
                {rideDest.name}
              </Text>
              <Text style={styles.subtitle}>
                {ride?.reachable
                  ? `${ride.miles} mi · about ${ride.minutes} min by bike`
                  : ride?.outside
                    ? `Distance shows when you’re in ${TOWN_NAME}`
                    : 'Finding the way…'}
              </Text>
            </View>
            <Pressable
              onPress={endRide}
              accessibilityRole="button"
              accessibilityLabel="Stop riding to this place"
              hitSlop={10}
              style={({ pressed }) => [styles.closeButton, styles.closeButtonLarge, pressed && { backgroundColor: colors.canvas }]}
            >
              <X size={22} color={colors.inkFaint} />
            </Pressable>
          </View>
        ) : following ? (
          <FollowingCard
            adventure={following}
            open={stopsOpen}
            onToggle={() => setStopsOpen((o) => !o)}
            nextStop={nextStop}
            onSelectStop={selectStop}
            onClose={stopFollowing}
            maxListHeight={Math.round(height * 0.45)}
          />
        ) : (
          <View style={styles.card}>
            <Text style={styles.title}>{APP_NAME}</Text>
            <Text style={styles.subtitle}>{TOWN_NAME}, NC · path, sidewalks & quiet streets</Text>
          </View>
        )}
      </View>

      {height > 0 && (
        <MapSheet
          height={sheetHeight}
          onOpenHeightChange={setOpenSheetHeight}
          hidden={sheetHidden}
          stop={stopDest ? { number: selectedStop + 1, total: following.stops.length, ...stop } : null}
          onDismissFacts={() => {
            // Refit once to the room the card leaves. The sheet coming back
            // (a category switched on) does not refit, so the rider keeps
            // whatever zoom they have.
            setFactsDismissed(true);
            setRecenter((n) => n + 1);
          }}
          dock={dock}
          sideInsets={{ left: insets.left, right: insets.right }}
          destinations={shown}
          active={active}
          selected={selected}
          onSelect={rideDest ? (id) => id === null && endRide() : select}
          ride={ride}
          locating={locating}
          ridingHere={!!rideDest || !!stopDest}
          onRideTo={startRide}
          onTurnOnLocation={(thenRide) => {
            if (thenRide && selected) setPendingRideId(selected.id);
            // Declined or not granted: nothing to ride to later.
            locate(true).then((on) => on || setPendingRideId(null));
          }}
          expanded={sheetOpen}
          onExpandedChange={setSheetOpen}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
    overflow: 'hidden',
  },
  header: {
    position: 'absolute',
  },
  card: {
    ...cardFloat,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  followingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderColor: `${colors.route}40`,
  },
  followingCardOuter: {
    borderColor: `${colors.route}40`,
  },
  followingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stopList: {
    marginTop: 10,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: radius.md,
  },
  stopRowNext: {
    backgroundColor: `${colors.route}14`,
  },
  stopRowPressed: {
    backgroundColor: colors.canvas,
  },
  stopNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stopNumberNext: {
    backgroundColor: colors.route,
  },
  stopNumberText: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: colors.white,
  },
  stopTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stopName: {
    flexShrink: 1,
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
    color: colors.ink,
  },
  nextChip: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.white,
    backgroundColor: colors.route,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  stopNote: {
    marginTop: 2,
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 19,
    color: colors.inkSoft,
  },
  cardBody: fillRow,
  followingEyebrow: {
    ...text.eyebrowSmall,
    color: colors.route,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 18,
    lineHeight: 22,
    color: colors.ink,
  },
  subtitle: {
    marginTop: 2,
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.inkFaint,
  },
  closeButton: {
    padding: 8,
    borderRadius: radius.pill,
  },
  // Riding to a place is used on the bike, so its close button is bigger.
  closeButtonLarge: {
    padding: 12,
  },
  rail: {
    position: 'absolute',
  },
});
