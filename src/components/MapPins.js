import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import CategoryIcon from './CategoryIcon';
import { colors, fonts } from '../theme';

const TEARDROP = 'M12 0C5.373 0 0 5.373 0 12c0 8.4 12 22 12 22s12-13.6 12-22C24 5.373 18.627 0 12 0Z';

// The camera maths in TrailMap offsets by half this to centre a selected pin.
export const SELECTED_PIN_HEIGHT = 48;
export const PIN_HEIGHT = 37;

// Teardrop pin carrying the category's own glyph, sized up when selected.
// Anchor the Marker at { x: 0.5, y: 1 } so the tip sits on the coordinate.
export function PlacePin({ category, color, selected }) {
  const w = selected ? 34 : 26;
  const h = selected ? SELECTED_PIN_HEIGHT : PIN_HEIGHT;
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
const LANDMARK_DOT = 8;
const LANDMARK_GAP = 6;
// How far the dot sits from the middle of its row. Apple Maps ignores a
// marker's anchor for a custom view and centres the view on the coordinate,
// so on iOS the row is shifted by this much (centerOffset) to put the dot
// there instead.
export const LANDMARK_DOT_OFFSET = (LANDMARK_DOT + LANDMARK_GAP + LANDMARK_TEXT_WIDTH) / 2 - LANDMARK_DOT / 2;

// Small dot with a haloed label on one side. Anchor at the dot: x 0 for a
// right-hand label, x 1 for a left-hand one, y 0.5. A muted landmark is gray:
// somewhere to find your way by, not somewhere to ride to.
export function LandmarkLabel({ name, side, offsetY = 0, muted }) {
  const right = side === 'right';
  return (
    <View style={[styles.landmarkRow, !right && styles.landmarkRowLeft]} pointerEvents="none">
      <View style={[styles.landmarkDot, muted && styles.landmarkDotMuted]} />
      <Text
        numberOfLines={1}
        style={[
          styles.landmarkText,
          muted && styles.landmarkTextMuted,
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

// A small traffic cone, beside a road crossing in a ride's stop list.
const CONE_ORANGE = '#E8742A';
export const CROSSING_ORANGE = '#9A4512';
export function ConeGlyph({ size = 14 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Path d="M5.4 1.5h3.2L12 11.5H2z" fill={CONE_ORANGE} />
      <Path d="M4.3 6.6h5.4l.7 2H3.6z" fill={colors.white} />
      <Rect x={1} y={11.5} width={12} height={1.8} rx={0.6} fill={CONE_ORANGE} />
    </Svg>
  );
}

// Small square for the two trailheads. Anchor { x: 0.5, y: 0.5 }.
export function TrailheadMarker() {
  return <View style={styles.trailhead} />;
}

// Numbered circle for an adventure stop. Anchor { x: 0.5, y: 0.5 }.
export function StopMarker({ number, next }) {
  return (
    <View style={[styles.stop, next && styles.stopNext]}>
      <Text style={[styles.stopText, next && styles.stopTextNext]}>{number}</Text>
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
    gap: LANDMARK_GAP,
    height: 16,
  },
  landmarkRowLeft: {
    flexDirection: 'row-reverse',
  },
  landmarkDot: {
    width: LANDMARK_DOT,
    height: LANDMARK_DOT,
    borderRadius: 4,
    backgroundColor: colors.forestDeep,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  landmarkDotMuted: {
    backgroundColor: colors.inkFaint,
  },
  landmarkTextMuted: {
    fontFamily: fonts.sansMedium,
    color: colors.inkFaint,
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
  // The next stop on a followed ride: larger, in the route's brown.
  stopNext: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.route,
    borderWidth: 3,
  },
  stopTextNext: {
    fontSize: 14,
  },
  stopText: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    color: colors.white,
  },
});
