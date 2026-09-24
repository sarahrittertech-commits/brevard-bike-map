import { Pressable, StyleSheet, View } from 'react-native';
import Crosshair from 'lucide-react-native/icons/crosshair';
import Route from 'lucide-react-native/icons/route';

import CategoryIcon from './CategoryIcon';
import { categories } from '../lib/data';
import { cardFloat, colors, hairlineTop } from '../theme';

const SIZE = 46;

// Vertical stack of category toggles on the right edge of the map, plus a
// "just the path" clear button and a recenter button beneath.
export default function CategoryRail({ active, onToggle, onClear, onRecenter }) {
  const allOff = active.length === 0;
  return (
    <View style={styles.rail}>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    alignItems: 'flex-end',
    gap: 8,
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
