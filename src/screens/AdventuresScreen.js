import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, Baby, Clock, Ruler } from 'lucide-react-native';

import { adventureImages, adventures } from '../lib/data';
import { colors, fonts, radius, shadowFloat } from '../theme';

const DIFFICULTY_LABEL = { easy: 'Easy', moderate: 'Moderate', ambitious: 'Ambitious' };

export default function AdventuresScreen({ onOpen }) {
  const insets = useSafeAreaInsets();
  const [featured, ...rest] = adventures;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: 32 }}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Ride ideas</Text>
        <Text style={styles.h1}>Adventures</Text>
        <Text style={styles.lead}>Routes locals actually ride, with the stops that make them worth it.</Text>
      </View>

      <Pressable onPress={() => onOpen(featured.id)} style={({ pressed }) => [styles.featured, pressed && styles.pressedScale]}>
        <View style={styles.featuredImageWrap}>
          <Image source={adventureImages[featured.image]} style={styles.featuredImage} resizeMode="cover" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Most ridden</Text>
          </View>
        </View>
        <View style={styles.featuredBody}>
          <Text style={styles.tagline}>{featured.tagline}</Text>
          <Text style={styles.featuredTitle}>{featured.title}</Text>
          <Text style={styles.story} numberOfLines={2}>
            {featured.story}
          </Text>
          <View style={styles.metaRow}>
            <Meta icon={Ruler} text={`${featured.miles} mi`} />
            <Meta icon={Clock} text={`${featured.minutes} min`} />
            {featured.kidFriendly && <Meta icon={Baby} text="Kid friendly" />}
          </View>
        </View>
      </Pressable>

      <Text style={styles.sectionLabel}>More rides</Text>
      <View style={styles.list}>
        {rest.map((a, i) => (
          <Pressable
            key={a.id}
            onPress={() => onOpen(a.id)}
            style={({ pressed }) => [styles.row, i > 0 && styles.rowDivider, pressed && { backgroundColor: colors.canvas }]}
          >
            <Image source={adventureImages[a.image]} style={styles.thumb} resizeMode="cover" />
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle} numberOfLines={1}>
                {a.title}
              </Text>
              <Text style={styles.rowTagline} numberOfLines={1}>
                {a.tagline}
              </Text>
              <Text style={styles.rowMeta}>
                {a.miles} mi · {a.minutes} min · {DIFFICULTY_LABEL[a.difficulty]}
              </Text>
            </View>
            <ArrowRight size={16} color={colors.inkFaint} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

function Meta({ icon: Icon, text }) {
  return (
    <View style={styles.meta}>
      <Icon size={14} color={colors.inkFaint} strokeWidth={2.2} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  eyebrow: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.clay,
  },
  h1: {
    marginTop: 4,
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 31,
    color: colors.ink,
  },
  lead: {
    marginTop: 6,
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 18,
    color: colors.inkSoft,
  },
  featured: {
    marginHorizontal: 20,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...shadowFloat,
  },
  pressedScale: {
    transform: [{ scale: 0.99 }],
  },
  featuredImageWrap: {
    aspectRatio: 3 / 2,
    backgroundColor: colors.line,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    left: 12,
    top: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.clay,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: fonts.sansBold,
    fontSize: 10.5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.white,
  },
  featuredBody: {
    padding: 16,
  },
  tagline: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.clay,
  },
  featuredTitle: {
    marginTop: 2,
    fontFamily: fonts.display,
    fontSize: 21,
    lineHeight: 25,
    color: colors.ink,
  },
  story: {
    marginTop: 6,
    fontFamily: fonts.sans,
    fontSize: 13.5,
    lineHeight: 18,
    color: colors.inkSoft,
  },
  metaRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12.5,
    color: colors.inkSoft,
  },
  sectionLabel: {
    marginTop: 28,
    marginBottom: 8,
    marginHorizontal: 20,
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.inkFaint,
  },
  list: {
    marginHorizontal: 20,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.line,
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    lineHeight: 20,
    color: colors.ink,
  },
  rowTagline: {
    marginTop: 2,
    fontFamily: fonts.sans,
    fontSize: 12.5,
    color: colors.inkSoft,
  },
  rowMeta: {
    marginTop: 4,
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.inkFaint,
    fontVariant: ['tabular-nums'],
  },
});
