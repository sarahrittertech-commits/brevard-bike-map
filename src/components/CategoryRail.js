import { Pressable, StyleSheet, View } from 'react-native';
import Crosshair from 'lucide-react-native/icons/crosshair';
import LocateFixed from 'lucide-react-native/icons/locate-fixed';
import Route from 'lucide-react-native/icons/route';

import CategoryIcon from './CategoryIcon';
import { categories } from '../lib/data';
import { cardFloat, colors, hairlineTop } from '../theme';

const SIZE = 46;
const GAP = 8;

// Each group is a stack of buttons inside a card with a 1pt border.
const groupHeight = (buttons) => buttons * SIZE + 2;
// Height of the rail as one column, so the screen can tell when it won't fit.
export const RAIL_HEIGHT = groupHeight(categories.length) + GAP + groupHeight(3);
// Width of the rail when its two groups sit side by side.
export const SPLIT_RAIL_WIDTH = 2 * (SIZE + 2) + GAP;

// Vertical stack of category toggles on the right edge of the map, plus a
// "just the path" clear button, a recenter button and the opt-in "show where
// I am" button beneath. On a screen too
// short for one column (a phone in landscape, iPhone Duo's outer display) the
// screen passes `split` and the two groups stand side by side instead.
export default function CategoryRail({ active, onToggle, onClear, onRecenter, locating, onLocate, split }) {
  const allOff = active.length === 0;
  return (
    <View style={[styles.rail, split && styles.split]}>
      <View style={styles.group}>
        {categories.map((cat, i) => {
          const on = active.includes(cat.id);
          return (
            <Pressable
              key={cat.id}
              onPress={() => onToggle(cat.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${on ? 'Hide' : 'Show'} ${cat.label} on the map`}
              style={({ pressed }) => [
                styles.button,
                i > 0 && styles.divider,
                on && { backgroundColor: cat.color },
                pressed && !on && styles.pressed,
              ]}
            >
              <CategoryIcon category={cat.id} size={20} color={on ? colors.white : cat.color} strokeWidth={on ? 2.3 : 2} />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.group}>
        <Pressable
          onPress={onClear}
          accessibilityRole="button"
          accessibilityLabel="Clear all pins and show just the path"
          style={({ pressed }) => [styles.button, allOff && styles.forest, pressed && !allOff && styles.pressed]}
        >
          <Route size={20} color={allOff ? colors.white : colors.inkSoft} strokeWidth={2.1} />
        </Pressable>
        <Pressable
          onPress={onRecenter}
          accessibilityRole="button"
          accessibilityLabel="Recenter the map on the trail"
          style={({ pressed }) => [styles.button, styles.divider, pressed && { backgroundColor: colors.forestSoft }]}
        >
          <Crosshair size={20} color={colors.forest} strokeWidth={2.1} />
        </Pressable>
        <Pressable
          onPress={onLocate}
          accessibilityRole="button"
          accessibilityState={{ selected: locating }}
          accessibilityLabel={locating ? 'Stop showing my location' : 'Show my location on the map'}
          style={({ pressed }) => [
            styles.button,
            styles.divider,
            locating && styles.forest,
            pressed && !locating && styles.pressed,
          ]}
        >
          <LocateFixed size={20} color={locating ? colors.white : colors.inkSoft} strokeWidth={2.1} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    alignItems: 'flex-end',
    gap: GAP,
  },
  // Row-reverse keeps the category group against the screen edge, where it
  // sits in the single-column layout, with the tools to its left.
  split: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
  },
  group: {
    ...cardFloat,
    overflow: 'hidden',
  },
  button: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: hairlineTop,
  pressed: {
    backgroundColor: colors.canvas,
  },
  forest: {
    backgroundColor: colors.forest,
  },
});
