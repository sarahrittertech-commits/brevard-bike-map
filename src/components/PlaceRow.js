import { Pressable, StyleSheet, Text, View } from 'react-native';
import ChevronRight from 'lucide-react-native/icons/chevron-right';

import CategoryIcon from './CategoryIcon';
import { categoryById } from '../lib/data';
import { colors, fillRow, fonts, radius, tint } from '../theme';

// One destination in the sheet's list. `category` is which of the place's
// categories to show it as — the one the rider actually switched on. `miles`
// is from the rider, or along the path from W Main St with location off;
// null when no drawn route reaches the place. The miles sit in a column of
// their own on the right, so they line up from row to row (F-14).
export default function PlaceRow({ destination, category, miles, onSelect }) {
  const cat = categoryById[category];
  const alsoIn = destination.categories.filter((c) => c !== category);

  return (
    <Pressable
      onPress={onSelect}
      accessibilityRole="button"
      accessibilityHint="Shows this place's details"
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.iconBox, { backgroundColor: tint(cat.color) }]}>
        <CategoryIcon category={category} size={18} color={cat.color} />
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {destination.name}
        </Text>
        <Text style={styles.blurb}>{destination.description}</Text>
        {(destination.hours || alsoIn.length > 0) && (
          <View style={styles.meta}>
            {destination.hours && <Text style={styles.hours}>{destination.hours}</Text>}
            {alsoIn.map((c) => (
              <View key={c} style={[styles.alsoChip, { backgroundColor: tint(categoryById[c].color, '14') }]}>
                <Text style={[styles.alsoText, { color: categoryById[c].color }]}>also {categoryById[c].label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.side}>
        {miles !== null && <Text style={styles.mile}>{miles.toFixed(1)} mi</Text>}
        <ChevronRight size={16} color={colors.inkFaint} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pressed: {
    backgroundColor: colors.canvas,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  body: fillRow,
  name: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    color: colors.ink,
  },
  side: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  mile: {
    minWidth: 44,
    textAlign: 'right',
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.inkFaint,
    fontVariant: ['tabular-nums'],
  },
  blurb: {
    marginTop: 2,
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 17,
    color: colors.inkSoft,
  },
  meta: {
    marginTop: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  hours: {
    fontFamily: fonts.sansMedium,
    fontSize: 11.5,
    color: colors.inkFaint,
  },
  alsoChip: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  alsoText: {
    fontFamily: fonts.sansBold,
    fontSize: 10.5,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
