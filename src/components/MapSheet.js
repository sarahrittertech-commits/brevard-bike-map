import { useEffect, useMemo, useState } from 'react';
import { Animated, Linking, PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Bike from 'lucide-react-native/icons/bike';
import ExternalLink from 'lucide-react-native/icons/external-link';
import MapPinned from 'lucide-react-native/icons/map-pinned';
import Route from 'lucide-react-native/icons/route';
import Ruler from 'lucide-react-native/icons/ruler';
import X from 'lucide-react-native/icons/x';

import CategoryIcon from './CategoryIcon';
import PlaceRow from './PlaceRow';
import {
  CONNECTOR_MILES,
  TOWN_NAME,
  TRAIL_MILES,
  categories,
  categoryById,
  displayCategory,
  trailheads,
} from '../lib/data';
import { colors, fillRow, fonts, hairlineTop, radius, text, tint } from '../theme';

export const PEEK = 112;
export const SHEET_FRACTION = 0.64;
const EASE = { duration: 260, useNativeDriver: true };
// The close button draws at 32pt; this takes its touch area to Apple's 44pt.
const HIT_SLOP = 6;

// Bottom sheet over the map. Peeks at the bottom; drag or tap the handle to
// expand. Shows trail facts, the filtered list, or the selected place.
// The screen owns `expanded` so selecting a pin on the map can open it.
// `dock` ({ left, width }) turns it into a column on the leading side of a
// wide screen; without it the sheet spans the width and `sideInsets` keeps its
// content clear of anything on the screen's edges.
export default function MapSheet({
  height,
  dock,
  sideInsets,
  destinations,
  active,
  selected,
  onSelect,
  ride,
  locating,
  ridingHere,
  onRideTo,
  onTurnOnLocation,
  expanded,
  onExpandedChange,
}) {
  const closedY = Math.max(height - PEEK, 0);
  const [y] = useState(() => new Animated.Value(closedY));

  useEffect(() => {
    Animated.timing(y, { toValue: expanded ? 0 : closedY, ...EASE }).start();
  }, [expanded, closedY, y]);

  const pan = useMemo(() => {
    const restY = expanded ? 0 : closedY;
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
      onPanResponderMove: (_, g) => {
        y.setValue(Math.min(Math.max(restY + g.dy, 0), closedY));
      },
      onPanResponderRelease: (_, g) => {
        let next = expanded;
        if (g.dy < -40 || g.vy < -0.6) next = true;
        else if (g.dy > 40 || g.vy > 0.6) next = false;
        // Same state as before: the effect won't fire, so snap back here.
        if (next === expanded) Animated.timing(y, { toValue: restY, ...EASE }).start();
        else onExpandedChange(next);
      },
    });
  }, [expanded, closedY, y, onExpandedChange]);

  return (
    <Animated.View
      style={[
        styles.sheet,
        dock ? [styles.docked, dock] : { left: 0, right: 0, paddingLeft: sideInsets.left, paddingRight: sideInsets.right },
        { height, transform: [{ translateY: y }] },
      ]}
    >
      <View {...pan.panHandlers}>
        <Pressable
          onPress={() => onExpandedChange(!expanded)}
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Collapse place list' : 'Expand place list'}
          style={styles.handle}
        >
          <View style={styles.grip} />
        </Pressable>
      </View>

      {selected ? (
        <SelectedPlace
          destination={selected}
          category={displayCategory(selected, active)}
          onClose={() => onSelect(null)}
          ride={ride}
          locating={locating}
          ridingHere={ridingHere}
          onRideTo={() => onRideTo(selected.id)}
          onTurnOnLocation={onTurnOnLocation}
        />
      ) : active.length === 0 ? (
        <TrailFacts />
      ) : (
        <>
          <View style={styles.listHeader}>
            <Text style={styles.h2}>
              {destinations.length} {destinations.length === 1 ? 'stop' : 'stops'} on the path
            </Text>
            <Text style={styles.listHint}>Miles from W Main St</Text>
          </View>
          <ScrollView contentContainerStyle={styles.listBody} showsVerticalScrollIndicator={false}>
            {destinations.map((d, i) => (
              <View key={d.id} style={i > 0 && styles.rowDivider}>
                <PlaceRow destination={d} category={displayCategory(d, active)} onSelect={() => onSelect(d.id)} />
              </View>
            ))}
          </ScrollView>
        </>
      )}
    </Animated.View>
  );
}

function TrailFacts() {
  return (
    <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
      <Text style={styles.h2}>Getting around {TOWN_NAME} by bike</Text>
      <Text style={styles.lead}>
        Tap a category on the right to see what is out there — or pull this up for route details.
      </Text>

      <View style={styles.facts}>
        <Fact icon={Ruler} label="Paved path" value={`${TRAIL_MILES} mi`} />
        <Fact icon={MapPinned} label="Connectors" value={`${CONNECTOR_MILES} mi`} />
        <Fact icon={Route} label="Surface" value="Paved" />
      </View>

      <View style={styles.legend}>
        <View style={styles.dotted} />
        <Text style={styles.legendText}>
          Dotted lines are connectors: sidewalks, quiet streets, greenways and the new bridge. Tap a place or a ride
          for which ones suit small kids.
        </Text>
      </View>

      <Text style={styles.eyebrow}>Trailheads</Text>
      {trailheads.map((t) => (
        <View key={t.name} style={styles.trailheadRow}>
          <Text style={styles.trailheadName}>{t.name}</Text>
          <Text style={styles.trailheadMile}>mi {t.mile.toFixed(1)}</Text>
        </View>
      ))}

      <Text style={styles.eyebrow}>What you can find</Text>
      <View style={styles.chips}>
        {categories.map((cat) => (
          <View key={cat.id} style={styles.chip}>
            <CategoryIcon category={cat.id} size={14} color={cat.color} strokeWidth={2.2} />
            <Text style={styles.chipText}>{cat.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Fact({ icon: Icon, label, value }) {
  return (
    <View style={styles.fact}>
      <View style={styles.factLabelRow}>
        <Icon size={12} color={colors.inkFaint} strokeWidth={2.4} />
        <Text style={styles.factLabel}>{label}</Text>
      </View>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

// How far the rider is from a place along the drawn network, and the button
// that shows the way. With location off it is greyed out and says why.
function RideRow({ ride, locating, ridingHere, onRideTo, onTurnOnLocation }) {
  if (!locating) {
    return (
      <View style={styles.ride}>
        <Text style={[styles.rideDistance, styles.rideOff]}>Distance from you</Text>
        <View style={[styles.rideButton, styles.rideButtonOff]}>
          <Bike size={16} color={colors.inkFaint} />
          <Text style={[styles.rideButtonText, styles.rideOff]}>Ride to here</Text>
        </View>
        <Text style={styles.rideNote}>Location sharing is needed to calculate a ride.</Text>
        <Pressable onPress={onTurnOnLocation} accessibilityRole="button" hitSlop={HIT_SLOP}>
          <Text style={styles.rideLink}>Turn on location sharing</Text>
        </Pressable>
      </View>
    );
  }
  if (!ride) {
    return (
      <View style={styles.ride}>
        <Text style={[styles.rideDistance, styles.rideOff]}>Finding where you are…</Text>
      </View>
    );
  }
  if (ride.outside) {
    return (
      <View style={styles.ride}>
        <Text style={[styles.rideDistance, styles.rideOff]}>Distance shows when you’re in {TOWN_NAME}</Text>
      </View>
    );
  }
  if (!ride.reachable) {
    return (
      <View style={styles.ride}>
        <Text style={[styles.rideDistance, styles.rideOff]}>No drawn route reaches here yet</Text>
      </View>
    );
  }
  return (
    <View style={styles.ride}>
      <Text style={styles.rideDistance}>
        {ride.miles} mi from you · about {ride.minutes} min by bike
      </Text>
      {ride.offPathMiles >= 0.2 && (
        <Text style={styles.rideNote}>Including {ride.offPathMiles} mi to reach the nearest path or link.</Text>
      )}
      {!ridingHere && (
        <Pressable
          onPress={onRideTo}
          accessibilityRole="button"
          accessibilityLabel="Ride to here: show only this place, you and the way between"
          style={({ pressed }) => [styles.rideButton, pressed && { backgroundColor: colors.forestDeep }]}
        >
          <Bike size={16} color={colors.white} />
          <Text style={styles.rideButtonText}>Ride to here</Text>
        </Pressable>
      )}
    </View>
  );
}

function SelectedPlace({ destination, category, onClose, ride, locating, ridingHere, onRideTo, onTurnOnLocation }) {
  const cat = categoryById[category];
  const alsoIn = destination.categories.filter((c) => c !== category);
  return (
    <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
      <View style={styles.selectedHeader}>
        <View style={[styles.selectedIcon, { backgroundColor: tint(cat.color) }]}>
          <CategoryIcon category={category} size={20} color={cat.color} />
        </View>
        <View style={styles.selectedTitle}>
          <Text style={[styles.selectedEyebrow, { color: cat.color }]}>{cat.label}</Text>
          <Text style={styles.h1}>{destination.name}</Text>
        </View>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close place details"
          hitSlop={HIT_SLOP}
          style={styles.close}
        >
          <X size={16} color={colors.inkFaint} />
        </Pressable>
      </View>

      <Text style={styles.selectedBlurb}>{destination.description}</Text>

      <RideRow
        ride={ride}
        locating={locating}
        ridingHere={ridingHere}
        onRideTo={onRideTo}
        onTurnOnLocation={onTurnOnLocation}
      />

      <View style={styles.chips}>
        <View style={styles.chip}>
          <Text style={styles.chipText}>Mile {destination.mileMarker.toFixed(1)} from the trailhead at W Main St, {TOWN_NAME}</Text>
        </View>
        {destination.hours && (
          <View style={styles.chip}>
            <Text style={styles.chipText}>{destination.hours}</Text>
          </View>
        )}
        {alsoIn.map((c) => (
          <View key={c} style={[styles.chip, { backgroundColor: tint(categoryById[c].color, '14') }]}>
            <Text style={[styles.chipText, { color: categoryById[c].color }]}>Also {categoryById[c].label}</Text>
          </View>
        ))}
      </View>

      {destination.website && (
        <Pressable
          // A link the phone cannot open just does nothing, rather than
          // surfacing as an unhandled rejection.
          onPress={() => Linking.openURL(destination.website).catch(() => {})}
          accessibilityRole="link"
          accessibilityLabel={`Open ${destination.name}'s website`}
          hitSlop={HIT_SLOP}
          style={styles.website}
        >
          <ExternalLink size={14} color={cat.color} strokeWidth={2.4} />
          <Text style={[styles.websiteText, { color: cat.color }]}>
            {category === 'restaurant' ? 'See the menu' : 'Visit the website'}
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    shadowColor: colors.ink,
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -8 },
    elevation: 12,
  },
  docked: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.line,
  },
  handle: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  grip: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
  },
  pad: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  h1: {
    fontFamily: fonts.display,
    fontSize: 21,
    lineHeight: 25,
    color: colors.ink,
  },
  h2: {
    fontFamily: fonts.display,
    fontSize: 19,
    lineHeight: 23,
    color: colors.ink,
  },
  lead: {
    marginTop: 4,
    fontFamily: fonts.sans,
    fontSize: 13.5,
    lineHeight: 18,
    color: colors.inkSoft,
  },
  facts: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 8,
  },
  fact: {
    flex: 1,
    borderRadius: radius.md,
    backgroundColor: colors.canvas,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  factLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  factLabel: {
    ...text.eyebrowSmall,
    color: colors.inkFaint,
  },
  factValue: {
    marginTop: 2,
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    color: colors.ink,
  },
  legend: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dotted: {
    width: 24,
    borderTopWidth: 2,
    borderStyle: 'dotted',
    borderColor: colors.forest,
  },
  legendText: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 12.5,
    lineHeight: 16,
    color: colors.inkSoft,
  },
  eyebrow: {
    ...text.eyebrow,
    marginTop: 20,
    marginBottom: 8,
    color: colors.inkFaint,
  },
  trailheadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius.md,
    backgroundColor: colors.canvas,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  trailheadName: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    color: colors.ink,
  },
  trailheadMile: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.inkFaint,
    fontVariant: ['tabular-nums'],
  },
  chips: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.canvas,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12.5,
    color: colors.inkSoft,
  },
  website: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
  },
  websiteText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13.5,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
  },
  listHint: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.inkFaint,
  },
  listBody: {
    paddingBottom: 24,
  },
  rowDivider: hairlineTop,
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  selectedIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  selectedTitle: fillRow,
  selectedEyebrow: text.eyebrow,
  close: {
    padding: 8,
    marginTop: -4,
    marginRight: -4,
  },
  ride: {
    marginTop: 14,
    gap: 8,
    alignItems: 'flex-start',
  },
  rideDistance: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    color: colors.ink,
  },
  rideOff: {
    color: colors.inkFaint,
  },
  rideNote: {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    lineHeight: 16,
    color: colors.inkSoft,
  },
  rideLink: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13.5,
    color: colors.forest,
  },
  rideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.forest,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rideButtonOff: {
    backgroundColor: colors.canvas,
  },
  rideButtonText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    color: colors.white,
  },
  selectedBlurb: {
    marginTop: 12,
    fontFamily: fonts.sans,
    fontSize: 14.5,
    lineHeight: 21,
    color: colors.inkSoft,
  },
});
