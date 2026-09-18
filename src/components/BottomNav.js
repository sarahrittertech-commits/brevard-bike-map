import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Compass, Map } from 'lucide-react-native';

import { colors, fonts } from '../theme';

const TABS = [
  { id: 'map', label: 'Trail Map', Icon: Map },
  { id: 'adventures', label: 'Adventures', Icon: Compass },
];

export default function BottomNav({ current, onChange }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.nav, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {TABS.map(({ id, label, Icon }) => {
        const isActive = current === id;
        const color = isActive ? colors.forest : colors.inkFaint;
        return (
          <Pressable
            key={id}
            onPress={() => onChange(id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            style={styles.tab}
          >
            <Icon size={21} color={color} strokeWidth={isActive ? 2.4 : 1.9} />
            <Text style={[styles.label, { color }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.surface,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    letterSpacing: -0.2,
  },
});
