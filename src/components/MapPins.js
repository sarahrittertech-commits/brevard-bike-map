import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import CategoryIcon from './CategoryIcon';
import { colors, fonts } from '../theme';

const TEARDROP = 'M12 0C5.373 0 0 5.373 0 12c0 8.4 12 22 12 22s12-13.6 12-22C24 5.373 18.627 0 12 0Z';

// The camera maths in TrailMap offsets by half this to centre a selected pin.
export const SELECTED_PIN_HEIGHT = 48;

// Teardrop pin carrying the category's own glyph, sized up when selected.
// Anchor the Marker at { x: 0.5, y: 1 } so the tip sits on the coordinate.
export function PlacePin({ category, color, selected }) {
  const w = selected ? 34 : 26;
  const h = selected ? SELECTED_PIN_HEIGHT : 37;
  const glyph = selected ? 18 : 14;
  return (
    <View style={{ width: w, height: h }}>
      <Svg width={w} height={h} viewBox="-1.5 -1.5 27 37">
        <Path d={TEARDROP} fill={color} />
        {selected && <Path d={TEARDROP} fill="none" stroke={colors.white} strokeWidth={2.4} />}
      </Svg>
      <View style={[styles.glyph, { width: w, top: selected ? 8 : 6 }]}>
        <CategoryIcon category={category} size={glyph} color={colors.white} strokeWidth={2.7} />
      </View>
    </View>
  );
}

// Width reserved for a landmark's text. The row is a fixed size on purpose:
// a marker's view is measured before it is drawn, and text left to size
// itself overflows that measurement, which puts the dot inside its own label
// and lets neighbouring labels collide. A fixed box measures predictably, so
// the dot lands on the coordinate and the text sits to one side of it.
const LANDMARK_TEXT_WIDTH = 132;

// Small dot with a haloed label on one side. Anchor at the dot: x 0 for a
// right-hand label, x 1 for a left-hand one, y 0.5.
export function LandmarkLabel({ name, side, offsetY = 0 }) {
  const right = side === 'right';
  return (
    <View style={[styles.landmarkRow, !right && styles.landmarkRowLeft]} pointerEvents="none">
      <View style={styles.landmarkDot} />
      <Text
        numberOfLines={1}
        style={[
          styles.landmarkText,
          { textAlign: right ? 'left' : 'right' },
          // Shifts the text only, so the dot stays on its coordinate.
          offsetY ? { transform: [{ translateY: offsetY }] } : null,
        ]}
      >
        {name}
      </Text>
    </View>
  );
}

// Small square for the two trailheads. Anchor { x: 0.5, y: 0.5 }.
export function TrailheadMarker() {
  return <View style={styles.trailhead} />;
}

// Numbered circle for an adventure stop. Anchor { x: 0.5, y: 0.5 }.
export function StopMarker({ number }) {
  return (
    <View style={styles.stop}>
      <Text style={styles.stopText}>{number}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  glyph: {
    position: 'absolute',
    left: 0,
    alignItems: 'center',
  },
  landmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 16,
  },
  landmarkRowLeft: {
    flexDirection: 'row-reverse',
  },
  landmarkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.forestDeep,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  landmarkText: {
    width: LANDMARK_TEXT_WIDTH,
    fontFamily: fonts.sansSemiBold,
    fontSize: 10,
    color: '#3B4536',
    textShadowColor: colors.canvas,
    textShadowRadius: 3,
    textShadowOffset: { width: 0, height: 0 },
  },
  trailhead: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: colors.forestDeep,
    borderWidth: 2,
    borderColor: colors.white,
  },
  stop: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.forest,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopText: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    color: colors.white,
  },
});
