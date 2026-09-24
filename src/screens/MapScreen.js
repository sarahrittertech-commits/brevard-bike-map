import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import X from 'lucide-react-native/icons/x';

import CategoryRail from '../components/CategoryRail';
import MapSheet, { PEEK, SHEET_FRACTION } from '../components/MapSheet';
import TrailMap from '../components/TrailMap';
import { APP_NAME, TOWN_NAME, adventureStopPins, lineToLatLngs, networkLatLngs, visibleDestinations } from '../lib/data';
import { cardFloat, colors, fillRow, fonts, radius, text } from '../theme';

// The main screen: map, floating header, category rail, bottom sheet.
// `following` is an adventure whose route is drawn on top of the network.
export default function MapScreen({ following, onStopFollowing }) {
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [recenter, setRecenter] = useState(0);
  const [height, setHeight] = useState(0);

  const shown = useMemo(() => visibleDestinations(active), [active]);
  const selected = shown.find((d) => d.id === selectedId) ?? null;
  const sheetHeight = Math.round(height * SHEET_FRACTION);

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

  const topInset = insets.top + 12;

  return (
    <View style={styles.screen} onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
      <TrailMap
        destinations={shown}
        active={active}
        selected={selected}
        onSelect={select}
        route={route}
        routeStops={routeStops}
        fitKey={`${following?.id ?? 'trail'}-${recenter}`}
        fitLatLngs={route ?? networkLatLngs}
        topInset={topInset + 84}
        bottomInset={PEEK + 28}
        height={height}
        sheetHeight={sheetHeight}
      />

      <View style={[styles.header, { top: topInset }]} pointerEvents="box-none">
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

      <View style={[styles.rail, { top: topInset + 80 }]}>
        <CategoryRail
          active={active}
          onToggle={toggle}
          onClear={() => {
            setActive([]);
            setSelectedId(null);
          }}
          onRecenter={() => setRecenter((n) => n + 1)}
        />
      </View>

      {height > 0 && (
        <MapSheet
          height={sheetHeight}
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
    left: 16,
    right: 16,
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
    right: 12,
  },
});
