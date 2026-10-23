import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AppState, BackHandler, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import ChevronUp from 'lucide-react-native/icons/chevron-up';
import X from 'lucide-react-native/icons/x';

import CategoryRail, { RAIL_HEIGHT, SPLIT_RAIL_WIDTH } from '../components/CategoryRail';
import { ConeGlyph, CROSSING_ORANGE } from '../components/MapPins';
import MapSheet, { PEEK, SHEET_FRACTION } from '../components/MapSheet';
import TrailMap from '../components/TrailMap';
import {
  APP_NAME,
  TOWN_NAME,
  adventureItinerary,
  adventureStopPins,
  crossingById,
  destinationById,
  isNearBrevard,
  lineToLatLngs,
  networkLatLngs,
  nextStopOf,
  rideProgress,
  rideToPlace,
  toLatLng,
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
// Further than this from the way being ridden, the rider has left it: draw a
// fresh way from where they are.
const OFF_ROUTE_FT = 600;

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

// The line under the place's name while riding to it.
function rideSummary(progress, ride) {
  if (progress?.arrived) return `${progress.milesTotal} mi ridden`;
  if (progress) return `${progress.milesLeft} of ${progress.milesTotal} mi to go · about ${progress.minutesLeft} min`;
  if (ride?.reachable) return `${ride.miles} mi · about ${ride.minutes} min by bike`;
  if (ride?.outside) return `Distance shows when you’re in ${TOWN_NAME}`;
  return 'Finding the way…';
}

// The header while following an adventure. Tap it to open the list of stops
// and review where the ride goes; with location on, the next stop is marked.
// Any stop can be tapped to open its card; one tied to a place also shows on
// the map.
// A road crossing in the stop list: a cone and "Cross here", no number. Not
// tappable; there is nothing more to say about it than where it is.
function CrossingRow({ id }) {
  return (
    <View style={styles.crossingRow}>
      <View style={styles.crossingIcon}>
        <ConeGlyph size={18} />
      </View>
      <Text style={styles.crossingText}>Cross here · {crossingById[id].name}</Text>
    </View>
  );
}

function FollowingCard({ adventure, open, onToggle, nextStop, onSelectStop, onClose, maxListHeight }) {
  const Chevron = open ? ChevronUp : ChevronDown;
  const itinerary = adventureItinerary(adventure);
  const crossingCount = itinerary.crossings.length;
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
              {crossingCount ? ` · ${crossingCount} crossing${crossingCount === 1 ? '' : 's'}` : ''}
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
          {itinerary.items.map((item, k) => {
            if (item.kind === 'crossing') return <CrossingRow key={`x-${item.id}-${k}`} id={item.id} />;
            const i = item.index;
            const s = adventure.stops[i];
            const isNext = i === nextStop;
            return (
              <Pressable
                key={`${s.name}-${i}`}
                onPress={() => onSelectStop(i)}
                accessibilityRole="button"
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
          {itinerary.back.length > 0 && <Text style={styles.wayBack}>On the way back</Text>}
          {itinerary.back.map((item, k) => (
            <CrossingRow key={`back-${item.id}-${k}`} id={item.id} />
          ))}
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
  // True when the open place was picked from the sheet's list, so its card
  // offers a way back to that list as well as closing.
  const [fromList, setFromList] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [recenter, setRecenter] = useState(0);
  const [locating, setLocating] = useState(false);
  const locateRun = useRef(0);
  // Where the rider is, while they have location on. Kept in memory only.
  const [position, setPosition] = useState(null);
  // The place the rider asked to ride to and the way there as drawn when the
  // ride started ({ id, line }): the map then shows it, them and the way
  // between. The line is kept, so the rider sees how far along it they are
  // rather than a line that shrinks behind them. One value, so every way a
  // ride ends clears all of it.
  const [rideTo, setRideTo] = useState(null);
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
  const rideDest = rideTo ? destinationById[rideTo.id] : null;
  const stop = following && selectedStop !== null ? following.stops[selectedStop] : null;
  const stopDest = stop?.destination ? destinationById[stop.destination] : null;
  const selected = rideDest ?? stopDest ?? shown.find((d) => d.id === selectedId) ?? null;
  // A stop with its own location (a sculpture, not a place) is where the map
  // goes, even though the sheet shows only its name, note and photo.
  const stopSpot = useMemo(
    () => (stop?.coordinates ? { id: `stop-${selectedStop}`, coordinates: stop.coordinates } : null),
    [stop, selectedStop]
  );
  // Riding to a place: how far along the fixed way the rider is. Each fix
  // starts from how far they had got at the last one, so a way that doubles
  // back keeps them on the leg they are riding; hence state updated as the
  // position changes, not a value worked out from scratch.
  const line = rideTo?.line ?? null;
  const [rideTrack, setRideTrack] = useState({ line: null, position: null, progress: null });
  if (line && position && (rideTrack.line !== line || rideTrack.position !== position)) {
    const prevFt = rideTrack.line === line ? rideTrack.progress.alongFt : null;
    setRideTrack({ line, position, progress: rideProgress(line, position, prevFt) });
  }
  const progress = line && position && rideTrack.line === line ? rideTrack.progress : null;
  // Left the way by more than OFF_ROUTE_FT: draw a fresh one from here.
  if (rideDest && progress && progress.offFt > OFF_ROUTE_FT) {
    const fresh = rideToPlace(position, rideDest);
    if (fresh.reachable) setRideTo({ id: rideDest.id, line: fresh.line });
  }
  // Distance and time to the selected place. While riding there it is the
  // way still ahead, the same figure as the header's; otherwise the shortest
  // way from the rider. Outside Brevard there is no sensible distance to
  // give, so the card says so.
  const placeRide = useMemo(() => {
    if (rideDest || !selected || !position) return null;
    return isNearBrevard(position) ? rideToPlace(position, selected) : { outside: true };
  }, [rideDest, selected, position]);
  const ride = progress
    ? { reachable: true, miles: progress.milesLeft, minutes: progress.minutesLeft, offPathMiles: 0 }
    : placeRide;
  const rideRoute = useMemo(() => (line ? line.map(toLatLng) : null), [line]);
  // Nothing in the sheet to show: following an adventure (the header card
  // lists its stops), or the rider put the "Getting around" card away. The
  // map then has the whole screen.
  const sheetHidden = !selected && !stop && (following ? true : active.length === 0 && factsDismissed);
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
  // A followed ride's numbered stops are 32pt across and can sit at the very
  // edge of the fit, so it keeps half a stop more room on every side.
  const stopRoom = following ? 16 : 0;

  // Handed to the map as stable values, so a tap that changes none of them
  // does not redraw it.
  const dockLeft = dock?.left;
  const dockWidth = dock?.width;
  // Riding to a place, its pin stays and any switched-on category shows round
  // it: what else is along the way or nearby.
  const mapDestinations = useMemo(
    () => (rideDest ? [rideDest, ...shown.filter((d) => d !== rideDest)] : shown),
    [rideDest, shown]
  );
  const mapClear = useMemo(
    () =>
      dockWidth !== undefined
        ? {
            top: topInset + stopRoom,
            right: railSpace + stopRoom,
            bottom: 28 + stopRoom,
            left: dockLeft + dockWidth + LABEL_ROOM,
          }
        : {
            top: topInset + HEADER_SPACE + stopRoom,
            right: railSpace + stopRoom,
            bottom: bottomCover + 28 + stopRoom,
            left: insets.left + LABEL_ROOM,
          },
    [dockLeft, dockWidth, topInset, railSpace, stopRoom, insets.left, bottomCover]
  );
  const logoInset = useMemo(
    () => (dockWidth !== undefined ? { left: dockLeft + dockWidth, bottom: 0 } : { left: 0, bottom: bottomCover }),
    [dockLeft, dockWidth, bottomCover]
  );

  const route = useMemo(() => (following ? lineToLatLngs(following.route) : null), [following]);
  const routeStops = useMemo(() => (following ? adventureStopPins(following) : null), [following]);
  // A followed ride fits its line and its numbered stops, which can sit a
  // little off the line (a sculpture on a lawn), so none hides under the rail.
  const routeFit = useMemo(
    () => (route ? [...route, ...routeStops.map((s) => toLatLng(s.coordinates))] : null),
    [route, routeStops]
  );

  // Following an adventure: the stop the rider reaches next, tracked from
  // fix to fix the same way as a ride to a place.
  const [followTrack, setFollowTrack] = useState({ id: null, position: null, next: null });
  if (following && position && (followTrack.id !== following.id || followTrack.position !== position)) {
    const prevFt = followTrack.id === following.id ? (followTrack.next?.alongFt ?? null) : null;
    setFollowTrack({ id: following.id, position, next: nextStopOf(following, position, prevFt) });
  }
  const nextStop =
    following && position && followTrack.id === following.id ? (followTrack.next?.index ?? null) : null;

  // A numbered stop on the map, or in the header's list: show it in the
  // sheet and move the map to it.
  const selectStop = useCallback((index) => {
    setSelectedId(null);
    setFromList(false);
    setSelectedStop(index);
    setStopsOpen(false);
    setSheetOpen(true);
  }, []);
  // The stop card's arrows step through the ride, every stop in order.
  const stepStop = (delta) => {
    const next = selectedStop + delta;
    if (following && next >= 0 && next < following.stops.length) selectStop(next);
  };

  const stopFollowing = useCallback(() => {
    setSelectedStop(null);
    setStopsOpen(false);
    // A stop's card may have the sheet open; left open it would switch to
    // the full list over the town being refitted.
    setSheetOpen(false);
    onStopFollowing();
  }, [onStopFollowing]);

  // Selecting a pin or row always reveals its detail; closing it (its close
  // button, or a tap on the map) drops the sheet back to peek. Left open, the
  // sheet would switch to the full place list and cover the very pins the
  // rider was about to tap next.
  const select = useCallback((id) => {
    setSelectedId(id);
    setSelectedStop(null);
    setFromList(false);
    setSheetOpen(!!id);
  }, []);
  const selectFromList = useCallback((id) => {
    setSelectedId(id);
    setSelectedStop(null);
    setFromList(true);
    setSheetOpen(true);
  }, []);
  const backToList = useCallback(() => {
    setSelectedId(null);
    setFromList(false);
    setSheetOpen(true);
  }, []);

  // A category shows on the map; its list waits at the bottom until the rider
  // taps it, rather than sliding up over the pins they just asked for.
  const toggle = (id) => {
    setSelectedId(null);
    setSheetOpen(false);
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
  // The app's own explanation is shown once a session. iOS's "Allow Once"
  // lapses whenever the app is put away, so without this a rider who chose it
  // would read the same message every time.
  const explained = useRef(false);
  // Location off, by the button or because iOS took it away: everything that
  // rests on it goes too. The run counter drops any fix still on its way.
  const stopLocating = () => {
    locateRun.current += 1;
    setLocating(false);
    setPosition(null);
    setRideTo(null);
    setPendingRideId(null);
  };
  const locate = async (fromPlace = false) => {
    // Each tap starts a new run; a fix that arrives after the rider has
    // switched location off again belongs to an old run and is dropped.
    const run = ++locateRun.current;
    if (locating) {
      stopLocating();
      return false;
    }
    let permission = await Location.getForegroundPermissionsAsync();
    const asked = permission.status !== 'granted' && permission.canAskAgain;
    if (asked) {
      // Before the system prompt, say in the app's own words what the dot is
      // for and what happens to the location, and let the rider decline here.
      if (!explained.current && !(await confirmLocation())) return false;
      explained.current = true;
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
      if (run !== locateRun.current) return false;
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

  // Permission can end while the app is in the background: "Allow Once"
  // lapses, or the rider switches it off in Settings. Coming back, the button
  // must not still say location is on with nothing behind it.
  useEffect(() => {
    if (!locating) return undefined;
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      Location.getForegroundPermissionsAsync()
        .then((p) => p.status === 'granted' || stopLocating())
        .catch(() => {});
    });
    return () => sub.remove();
  }, [locating]);

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
  const startRide = () => {
    if (!placeRide?.reachable) return;
    if (following) stopFollowing();
    setRideTo({ id: selected.id, line: placeRide.line });
    setSheetOpen(false);
  };
  // Start the ride the rider asked for once a route exists; drop the request
  // if there is none (outside Brevard, nothing drawn reaches the place) or the
  // place card has been closed.
  if (pendingRideId && placeRide && (selected?.id !== pendingRideId || !placeRide.reachable)) {
    setPendingRideId(null);
  } else if (pendingRideId && placeRide?.reachable) {
    setPendingRideId(null);
    if (following) stopFollowing();
    setRideTo({ id: pendingRideId, line: placeRide.line });
    setSheetOpen(false);
  }

  const endRide = () => {
    setRideTo(null);
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
    setRideTo(null);
    setPendingRideId(null);
  }

  // Android's back button peels the map back one layer at a time: the
  // selected place, then the open sheet, then the followed route. With
  // nothing left to close it falls through and Android leaves the app.
  useEffect(() => {
    if (!inFront) return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (rideTo) endRide();
      else if (selectedId) setSelectedId(null);
      else if (sheetOpen) setSheetOpen(false);
      else if (selectedStop !== null) setSelectedStop(null);
      else if (following) stopFollowing();
      else return false;
      return true;
    });
    return () => sub.remove();
  }, [inFront, rideTo, selectedId, selectedStop, sheetOpen, following, stopFollowing]);

  return (
    <View
      style={styles.screen}
      onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
    >
      <TrailMap
        destinations={mapDestinations}
        active={active}
        selected={stopSpot ?? selected}
        // While riding to a place, a tap on the map does not end the ride;
        // the header's close button does.
        onSelect={rideDest ? IGNORE : select}
        // Riding to a place, the part ahead is drawn bold and the part ridden
        // stays faint behind, so the line does not shrink as the rider moves.
        route={progress ? progress.ahead : (rideRoute ?? route)}
        riding={!!rideDest}
        routeDone={rideDest ? progress?.done : null}
        routeStops={rideDest ? null : routeStops}
        nextStop={nextStop}
        selectedStop={selectedStop}
        onSelectStop={selectStop}
        // Docking or undocking on rotation moves what covers the map, so it
        // refits; panning around within one layout is left alone. The column's
        // width is in the key, not just whether it exists, because it settles
        // only once this screen's own layout reports the new size.
        fitKey={`${rideTo?.id ?? following?.id ?? 'trail'}-${rideRoute ? 'ride' : ''}-${recenter}-${showNonce}-${dock ? dock.width : 'upright'}`}
        fitLatLngs={rideRoute ?? routeFit ?? networkLatLngs}
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
            setSheetOpen(false);
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
              <Text style={styles.followingEyebrow}>{progress?.arrived ? 'You’re here' : 'Riding to'}</Text>
              <Text style={styles.title} numberOfLines={1}>
                {rideDest.name}
              </Text>
              <Text style={styles.subtitle}>
                {rideSummary(progress, ride)}
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
          stop={
            stop
              ? {
                  ...stop,
                  number: selectedStop + 1,
                  total: following.stops.length,
                  onPrev: selectedStop > 0 ? () => stepStop(-1) : null,
                  onNext: selectedStop < following.stops.length - 1 ? () => stepStop(1) : null,
                }
              : null
          }
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
          onSelectFromList={selectFromList}
          onBackToList={fromList && !rideDest && !stop ? backToList : null}
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
  crossingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  crossingIcon: {
    width: 28,
    alignItems: 'center',
  },
  crossingText: {
    flexShrink: 1,
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    color: CROSSING_ORANGE,
  },
  wayBack: {
    marginTop: 10,
    marginBottom: 2,
    paddingHorizontal: 6,
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.inkSoft,
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
