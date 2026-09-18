import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import CategoryIcon from './CategoryIcon';
import { colors, fonts } from '../theme';

const TEARDROP = 'M12 0C5.373 0 0 5.373 0 12c0 8.4 12 22 12 22s12-13.6 12-22C24 5.373 18.627 0 12 0Z';

// Teardrop pin carrying the category's own glyph, sized up when selected.
// Anchor the Marker at { x: 0.5, y: 1 } so the tip sits on the coordinate.
export function PlacePin({ category, color, selected }) {
  const w = selected ? 34 : 26;
  const h = selected ? 48 : 37;
  const glyph = selected ? 18 : 14;
  return (
    <View style={{ width: w, height: h }}>
      <Svg width={w} height={h} viewBox="-1.5 -1.5 27 37">
        <Path d={TEARDROP} fill={color} />
        {selected && <Path d={TEARDROP} fill="none" stroke={colors.white} strokeWidth={2.4} />}
      </Svg>
      <View style={[styles.glyph, { width: w, top: selected ? 7 : 5 }]}>
        <CategoryIcon category={category} size={glyph} color={colors.white} strokeWidth={2.7} />
      </View>
    </View>
  );
}

// Small dot with a haloed label on one side. Anchor at the dot: x 0 for a
// right-hand label, x 1 for a left-hand one, y 0.5.
export function LandmarkLabel({ name, side }) {
  const dot = <View style={styles.landmarkDot} />;
  const label = <Text style={styles.landmarkText}>{name}</Text>;
  return (
    <View style={styles.landmarkRow} pointerEvents="none">
      {side === 'right' ? dot : label}
      {side === 'right' ? label : dot}
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
