import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, BackHandler, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import X from 'lucide-react-native/icons/x';

import CategoryRail, { RAIL_HEIGHT, SPLIT_RAIL_WIDTH } from '../components/CategoryRail';
import MapSheet, { PEEK, SHEET_FRACTION } from '../components/MapSheet';
import TrailMap from '../components/TrailMap';
import {
  APP_NAME,
  TOWN_NAME,
  adventureStopPins,
  isNearBrevard,
  lineToLatLngs,
  networkLatLngs,
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
// Room left of a fitted route for the westernmost landmark label.
const LABEL_ROOM = 96;

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
  const [userFocus, setUserFocus] = useState(null);
  const [{ width, height }, setSize] = useState({ width: 0, height: 0 });

  const shown = useMemo(() => visibleDestinations(active), [active]);
  const selected = shown.find((d) => d.id === selectedId) ?? null;
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
  const railBottom = dock ? height - EDGE : height - PEEK - 8;
  const splitRail = railBottom - railTop < RAIL_HEIGHT;
  const railRight = insets.right + EDGE;
  const railSpace = railRight + (splitRail ? SPLIT_RAIL_WIDTH : RAIL_WIDTH) + 18;

  const route = useMemo(() => (following ? lineToLatLngs(following.route) : null), [following]);
  const routeStops = useMemo(() => (following ? adventureStopPins(following) : null), [following]);

  // Selecting a pin or row always reveals its detail.
  const select = (id) => {
    setSelectedId(id);
    if (id) setSheetOpen(true);
  };

  const toggle = (id) => {
    setSelectedId(null);
    setActive((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  // Showing the rider's location is opt-in, every launch: nothing is asked
  // until they tap the button, the dot goes away when they tap it again, and
  // the position never leaves the phone or outlives the session. The system
  // asks for permission the first time only; after a refusal the button
  // explains where to turn it back on rather than asking again.
  const locate = async () => {
    // Each tap starts a new run; a fix that arrives after the rider has
    // switched location off again belongs to an old run and is dropped.
    const run = ++locateRun.current;
    if (locating) {
      setLocating(false);
      return;
    }
    let permission = await Location.getForegroundPermissionsAsync();
    const asked = permission.status !== 'granted' && permission.canAskAgain;
    if (asked) {
      // Before the system prompt, say in the app's own words what the dot is
      // for and what happens to the location, and let the rider decline here.
      if (!(await confirmLocation())) return;
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
      return;
    }
    setLocating(true);
    try {
      const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (run !== locateRun.current) return;
      if (isNearBrevard(coords)) {
        setSelectedId(null);
        setSheetOpen(false);
        setUserFocus({ key: Date.now(), latitude: coords.latitude, longitude: coords.longitude });
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
    setSheetOpen(false);
  }

  // Android's back button peels the map back one layer at a time: the
  // selected place, then the open sheet, then the followed route. With
  // nothing left to close it falls through and Android leaves the app.
  useEffect(() => {
    if (!inFront) return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selectedId) setSelectedId(null);
      else if (sheetOpen) setSheetOpen(false);
      else if (following) onStopFollowing();
      else return false;
      return true;
    });
    return () => sub.remove();
  }, [inFront, selectedId, sheetOpen, following, onStopFollowing]);

  return (
    <View
      style={styles.screen}
      onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
    >
      <TrailMap
        destinations={shown}
        active={active}
        selected={selected}
        onSelect={select}
        route={route}
        routeStops={routeStops}
        // Docking or undocking on rotation moves what covers the map, so it
        // refits; panning around within one layout is left alone. The column's
        // width is in the key, not just whether it exists, because it settles
        // only once this screen's own layout reports the new size.
        fitKey={`${following?.id ?? 'trail'}-${recenter}-${showNonce}-${dock ? dock.width : 'upright'}`}
        fitLatLngs={route ?? networkLatLngs}
        // What the map must keep clear of: the header, sheet and rail. Docked,
        // the header and sheet are a column on the left and nothing covers
        // the bottom of the map.
        clear={
          dock
            ? { top: topInset, right: railSpace, bottom: 28, left: dock.left + dock.width + LABEL_ROOM }
            : { top: topInset + HEADER_SPACE, right: railSpace, bottom: PEEK + 28, left: insets.left + LABEL_ROOM }
        }
        width={width}
        height={height}
        docked={!!dock}
        sheetHeight={dock ? 0 : sheetHeight}
        logoInset={dock ? { left: dock.left + dock.width, bottom: 0 } : { left: 0, bottom: PEEK }}
        showsUser={locating}
        userFocus={userFocus}
      />

      <View
        style={[
          styles.header,
          { top: topInset },
          dock ? dock : { left: insets.left + 16, right: insets.right + 16 },
        ]}
        pointerEvents="box-none"
      >
        {following ? (
          <View style={[styles.card, styles.followingCard]}>
            <View style={styles.cardBody}>
              <Text style={styles.followingEyebrow}>Following adventure</Text>
              <Text style={styles.title} numberOfLines={1}>
                {following.title}
              </Text>
              <Text style={styles.subtitle}>
                {following.miles} mi · {following.minutes} min · {following.stops.length} stops
              </Text>
            </View>
            <Pressable
              onPress={onStopFollowing}
              accessibilityRole="button"
              accessibilityLabel="Stop following this adventure"
              hitSlop={6}
              style={({ pressed }) => [styles.closeButton, pressed && { backgroundColor: colors.canvas }]}
            >
              <X size={16} color={colors.inkFaint} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.title}>{APP_NAME}</Text>
            <Text style={styles.subtitle}>{TOWN_NAME}, NC · path, sidewalks & quiet streets</Text>
          </View>
        )}
      </View>

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
          onLocate={locate}
        />
      </View>

      {height > 0 && (
        <MapSheet
          height={sheetHeight}
          dock={dock}
          sideInsets={{ left: insets.left, right: insets.right }}
          destinations={shown}
          active={active}
          selected={selected}
          onSelect={select}
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
    gap: 12,
    borderColor: `${colors.clay}40`,
  },
  cardBody: fillRow,
  followingEyebrow: {
    ...text.eyebrowSmall,
    color: colors.clay,
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
  rail: {
    position: 'absolute',
  },
});
