import { useEffect, useMemo, useState } from 'react';
import { Animated, Linking, PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Bike from 'lucide-react-native/icons/bike';
import Compass from 'lucide-react-native/icons/compass';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import Crosshair from 'lucide-react-native/icons/crosshair';
import LocateFixed from 'lucide-react-native/icons/locate-fixed';
import ExternalLink from 'lucide-react-native/icons/external-link';
import MapIcon from 'lucide-react-native/icons/map';
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
import { DISPLAY_VARIANT, colors, fillRow, fonts, hairlineTop, radius, text, tint } from '../theme';

export const PEEK = 112;
export const SHEET_FRACTION = 0.64;
const EASE = { duration: 260, useNativeDriver: true };
// The handle's height: 12 above the grip, the 4pt grip, 8 below.
const HANDLE = 24;
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
  // Miles from the rider to each listed place, by id, with location on.
  listMiles,
  active,
  selected,
  onSelect,
  onSelectFromList,
  onBackToList,
  ride,
  locating,
  ridingHere,
  onRideTo,
  onTurnOnLocation,
  expanded,
  onExpandedChange,
  onOpenHeightChange,
  hidden,
  onDismissFacts,
  stop,
}) {
  const closedY = Math.max(height - PEEK, 0);
  const [y] = useState(() => new Animated.Value(closedY));
  // A place's card opens only as far as its content needs, rather than to the
  // full sheet height with empty space below; lists still open all the way.
  const [cardHeight, setCardHeight] = useState(0);
  const openY = (selected || stop) && cardHeight ? Math.min(Math.max(height - cardHeight - HANDLE, 0), closedY) : 0;

  useEffect(() => {
    Animated.timing(y, { toValue: hidden ? height : expanded ? openY : closedY, ...EASE }).start();
  }, [hidden, height, expanded, openY, closedY, y]);

  // The map centres a selected pin above whatever the sheet covers.
  useEffect(() => {
    onOpenHeightChange?.(height - openY);
  }, [height, openY, onOpenHeightChange]);

  // The handle and each card's title area all slide the sheet up or down: a
  // big target, easy to hit from a bike. The close buttons stay separate.
  const toggle = () => onExpandedChange(!expanded);
  const toggleLabel = expanded ? 'Slide this card down' : 'Slide this card up';

  const pan = useMemo(() => {
    const restY = expanded ? openY : closedY;
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
      onPanResponderMove: (_, g) => {
        y.setValue(Math.min(Math.max(restY + g.dy, openY), closedY));
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
  }, [expanded, openY, closedY, y, onExpandedChange]);

  return (
    <Animated.View
      // Off screen when hidden: keep it from taps and from VoiceOver too.
      pointerEvents={hidden ? 'none' : 'auto'}
      accessibilityElementsHidden={hidden}
      importantForAccessibility={hidden ? 'no-hide-descendants' : 'auto'}
      style={[
        styles.sheet,
        dock ? [styles.docked, dock] : { left: 0, right: 0, paddingLeft: sideInsets.left, paddingRight: sideInsets.right },
        { height, transform: [{ translateY: y }] },
      ]}
    >
      <View {...pan.panHandlers}>
        <Pressable onPress={toggle} accessibilityRole="button" accessibilityLabel={toggleLabel} style={styles.handle}>
          <View style={styles.grip} />
        </Pressable>
      </View>

      {/* Sliding away, the sheet shows nothing: drawing what it would hold
          (the Getting around card, the list) flashes it on the way out. */}
      {hidden ? null : selected || stop ? (
        <SelectedPlace
          destination={selected}
          category={selected ? displayCategory(selected, active) : null}
          onClose={() => onSelect(null)}
          onBack={onBackToList}
          ride={ride}
          locating={locating}
          ridingHere={ridingHere}
          onRideTo={onRideTo}
          onTurnOnLocation={onTurnOnLocation}
          onMeasure={setCardHeight}
          stop={stop}
          onToggle={toggle}
          collapsed={!expanded}
        />
      ) : active.length === 0 ? (
        <TrailFacts onDismiss={onDismissFacts} onToggle={toggle} />
      ) : (
        <>
          <Pressable onPress={toggle} accessibilityRole="button" accessibilityLabel={toggleLabel} style={styles.listHeader}>
            <Text style={styles.h2}>
              {destinations.length} {destinations.length === 1 ? 'stop' : 'stops'} on the path
            </Text>
            <Text style={styles.listHint}>{listMiles ? 'Miles from you' : 'Miles from W Main St'}</Text>
          </Pressable>
          <ScrollView contentContainerStyle={styles.listBody} showsVerticalScrollIndicator={false}>
            {destinations.map((d, i) => (
              <View key={d.id} style={i > 0 && styles.rowDivider}>
                <PlaceRow
                  destination={d}
                  category={displayCategory(d, active)}
                  miles={listMiles ? (listMiles[d.id] ?? null) : d.mileMarker}
                  onSelect={() => onSelectFromList(d.id)}
                />
              </View>
            ))}
          </ScrollView>
        </>
      )}
    </Animated.View>
  );
}

function TrailFacts({ onDismiss, onToggle }) {
  return (
    <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
      <View style={styles.factsHeader}>
        <Pressable onPress={onToggle} style={styles.factsTitle}>
          <Text style={styles.h2}>Getting around {TOWN_NAME} by bike</Text>
        </Pressable>
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Put this card away"
          hitSlop={HIT_SLOP}
          style={styles.factsClose}
        >
          <X size={22} color={colors.inkFaint} />
        </Pressable>
      </View>
      <Pressable onPress={onToggle}>
        <Text style={styles.lead}>
          Tap a category on the right to see what is out there, or tap here for route details.
        </Text>
      </Pressable>

      {/* What each tab is for, so a first-time rider knows an Adventure
          before opening one (UC-13, F-1). */}
      <Text style={styles.eyebrow}>Two ways in</Text>
      <RailHelp icon={MapIcon} text="Trail Map: the places along the path, by kind. Switch one on to see them." />
      <RailHelp
        icon={Compass}
        text="Adventures: rides locals actually do, with stops and notes. Show route on map draws one here."
      />

      <View style={styles.facts}>
        <Fact icon={Ruler} label="Paved path" value={`${TRAIL_MILES} mi`} />
        <Fact icon={MapPinned} label="Connectors" value={`${CONNECTOR_MILES} mi`} />
        <Fact icon={Bike} label="Surface" value="Paved" />
      </View>

      <View style={styles.legend}>
        <View style={styles.connectorSwatch} />
        <Text style={styles.legendText}>
          Gray lines are connectors: sidewalks, quiet streets, greenways and the new bridge. Tap a place or a ride
          for which ones suit small kids.
        </Text>
      </View>

      <Text style={styles.eyebrow}>The buttons on the right</Text>
      <RailHelp icon={Route} text="Just the path: hides every pin, so only the path and its links show." />
      <RailHelp icon={Crosshair} text="Back to the whole trail." />
      <RailHelp icon={LocateFixed} text="Show where you are. Optional, and your location is never saved." />

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

function RailHelp({ icon: Icon, text: label }) {
  return (
    <View style={styles.railHelp}>
      <View style={styles.railHelpIcon}>
        <Icon size={18} color={colors.ink} strokeWidth={2.1} />
      </View>
      <Text style={styles.railHelpText}>{label}</Text>
    </View>
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
  // With location off, the one button turns it on. From a place it then goes
  // straight on to Ride to here, so the button does what it says; for a stop
  // on a followed ride it just shows the distance.
  if (!locating) {
    return (
      <View style={styles.ride}>
        <Pressable
          onPress={() => onTurnOnLocation(!ridingHere)}
          accessibilityRole="button"
          style={({ pressed }) => [styles.rideButton, styles.rideButtonOff, pressed && styles.rideButtonOffPressed]}
        >
          <Bike size={20} color={colors.forest} />
          <Text style={[styles.rideButtonText, styles.rideButtonOffText]}>
            {ridingHere ? 'Turn on location to see distance' : 'Turn on location to ride here'}
          </Text>
        </Pressable>
        <Text style={styles.rideNote}>Your location stays on your phone and is never saved.</Text>
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
  if (ride.arrived) {
    return (
      <View style={styles.ride}>
        <Text style={styles.rideDistance}>You’re here</Text>
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
          <Bike size={20} color={colors.white} />
          <Text style={styles.rideButtonText}>Ride to here</Text>
        </Pressable>
      )}
    </View>
  );
}

function SelectedPlace({
  destination,
  category,
  onClose,
  onBack,
  ride,
  locating,
  ridingHere,
  onRideTo,
  onTurnOnLocation,
  onMeasure,
  stop,
  onToggle,
  collapsed,
}) {
  // A stop on a followed ride may be scenery with no place behind it: then
  // the card is just its name and note.
  const cat = destination ? categoryById[category] : null;
  const alsoIn = destination ? destination.categories.filter((c) => c !== category) : [];
  return (
    <ScrollView
      contentContainerStyle={styles.pad}
      showsVerticalScrollIndicator={false}
      onContentSizeChange={(_, h) => onMeasure(Math.ceil(h))}
    >
      {onBack && (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back to the list"
          hitSlop={HIT_SLOP}
          style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
        >
          <ChevronLeft size={20} color={colors.forest} strokeWidth={2.4} />
          <Text style={styles.backText}>Back to list</Text>
        </Pressable>
      )}
      <View style={styles.selectedHeader}>
        {stop ? (
          <View style={styles.stopIcon}>
            <Text style={styles.stopIconText}>{stop.number}</Text>
          </View>
        ) : (
          <View style={[styles.selectedIcon, { backgroundColor: tint(cat.color) }]}>
            <CategoryIcon category={category} size={20} color={cat.color} />
          </View>
        )}
        <Pressable onPress={onToggle} style={styles.selectedTitle}>
          <Text style={[styles.selectedEyebrow, { color: stop ? colors.route : cat.color }]}>
            {stop ? `Stop ${stop.number} of ${stop.total}` : cat.label}
          </Text>
          {/* Slid down, the strip has room for one line: shorten the name
              rather than cut the second line in half. */}
          <Text style={styles.h1} numberOfLines={collapsed ? 1 : undefined}>
            {stop ? stop.name : destination.name}
          </Text>
        </Pressable>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close place details"
          hitSlop={HIT_SLOP}
          style={styles.close}
        >
          <X size={22} color={colors.inkFaint} />
        </Pressable>
      </View>

      {stop ? (
        // Small arrows either side of the note, drawn like the close button,
        // step to the stop before and after.
        <View style={styles.stopNoteRow}>
          <StepArrow icon={ChevronLeft} label="Previous stop" onPress={stop.onPrev} />
          <Text style={[styles.selectedBlurb, styles.stopNote]}>{stop.note}</Text>
          <StepArrow icon={ChevronRight} label="Next stop" onPress={stop.onNext} />
        </View>
      ) : (
        <Text style={styles.selectedBlurb}>{destination.description}</Text>
      )}

      {destination && (
        <PlaceDetails
          destination={destination}
          category={category}
          cat={cat}
          alsoIn={alsoIn}
          ride={ride}
          locating={locating}
          ridingHere={ridingHere}
          onRideTo={onRideTo}
          onTurnOnLocation={onTurnOnLocation}
        />
      )}
    </ScrollView>
  );
}

// Previous or next stop. At the first or last stop the arrow keeps its
// place but is hidden, so the note does not shift.
function StepArrow({ icon: Icon, label, onPress }) {
  return (
    <Pressable
      onPress={onPress ?? undefined}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityElementsHidden={!onPress}
      importantForAccessibility={onPress ? 'auto' : 'no-hide-descendants'}
      hitSlop={HIT_SLOP}
      style={[styles.stepArrow, !onPress && styles.stepArrowHidden]}
    >
      <Icon size={22} color={colors.inkFaint} />
    </Pressable>
  );
}

function PlaceDetails({ destination, category, cat, alsoIn, ride, locating, ridingHere, onRideTo, onTurnOnLocation }) {
  return (
    <>
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
    </>
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
    fontVariant: DISPLAY_VARIANT,
    fontSize: 24,
    lineHeight: 29,
    color: colors.ink,
  },
  h2: {
    fontFamily: fonts.display,
    fontVariant: DISPLAY_VARIANT,
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
  connectorSwatch: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.connector,
  },
  legendText: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 12.5,
    lineHeight: 16,
    color: colors.inkSoft,
  },
  railHelp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  railHelpIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  railHelpText: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 19,
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
    fontSize: 14.5,
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
    fontSize: 15.5,
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
  stopIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stopIconText: {
    fontFamily: fonts.sansBold,
    fontSize: 18,
    color: colors.white,
  },
  stopNoteRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: -12,
  },
  stopNote: {
    flex: 1,
    marginTop: 0,
  },
  stepArrow: {
    padding: 12,
  },
  stepArrowHidden: {
    opacity: 0,
  },
  selectedTitle: fillRow,
  selectedEyebrow: text.eyebrow,
  // The title is one line, so the close button centres on it; its padding
  // keeps the 44pt touch area without pushing the glyph below the text.
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 2,
    paddingVertical: 8,
    paddingRight: 12,
    marginBottom: 6,
    borderRadius: radius.pill,
  },
  backPressed: {
    backgroundColor: colors.forestSoft,
  },
  backText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
    color: colors.forest,
  },
  factsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: -8,
    marginRight: -8,
  },
  factsTitle: {
    flex: 1,
  },
  factsClose: {
    padding: 11,
  },
  close: {
    padding: 12,
    marginTop: -4,
    marginRight: -4,
  },
  ride: {
    marginTop: 14,
    gap: 10,
    alignItems: 'stretch',
  },
  rideDistance: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 21,
    lineHeight: 27,
    color: colors.ink,
  },
  rideOff: {
    color: colors.inkFaint,
  },
  rideNote: {
    fontFamily: fonts.sans,
    fontSize: 14.5,
    lineHeight: 19,
    color: colors.inkSoft,
  },
  rideButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.forest,
    paddingHorizontal: 24,
    paddingVertical: 15,
    minHeight: 56,
  },
  rideButtonOff: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.forest,
  },
  rideButtonOffPressed: {
    backgroundColor: colors.forestSoft,
  },
  rideButtonOffText: {
    color: colors.forest,
  },

  rideButtonText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 18,
    color: colors.white,
  },
  selectedBlurb: {
    marginTop: 12,
    fontFamily: fonts.sans,
    fontSize: 17,
    lineHeight: 24,
    color: colors.inkSoft,
  },
});
