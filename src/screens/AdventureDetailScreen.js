import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Activity from 'lucide-react-native/icons/activity';
import Baby from 'lucide-react-native/icons/baby';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import Clock from 'lucide-react-native/icons/clock';
import Map from 'lucide-react-native/icons/map';
import Ruler from 'lucide-react-native/icons/ruler';

import { DIFFICULTY_LABEL, adventureImages, categoryById, destinationById, stopImages } from '../lib/data';
import { READING_WIDTH, photoHeight, useLayoutClass } from '../lib/layout';
import { colors, fonts, radius, shadowFloat, text } from '../theme';


export default function AdventureDetailScreen({ adventure, onBack, onShowOnMap }) {
  const insets = useSafeAreaInsets();
  const { width, height, regular } = useLayoutClass();
  const ctaHeight = 72 + insets.bottom;
  // The photo runs edge to edge; everything below it sits in a reading
  // column clear of the side insets.
  const column = {
    paddingLeft: insets.left,
    paddingRight: insets.right,
    maxWidth: READING_WIDTH + insets.left + insets.right,
  };
  // Two by two on a phone; one row of four on regular width, where an even
  // count still splits cleanly at iPhone Duo's fold.
  const perRow = regular ? 4 : 2;
  const stats = [
    { icon: Ruler, label: 'Distance', value: `${adventure.miles} mi` },
    { icon: Clock, label: 'Rolling time', value: `${adventure.minutes} min` },
    { icon: Activity, label: 'Effort', value: DIFFICULTY_LABEL[adventure.difficulty] },
    { icon: Baby, label: 'With kids', value: adventure.kidFriendly ? 'Great' : 'Adults' },
  ];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: ctaHeight + 16 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { height: photoHeight(width, height) }]}>
          <Image source={adventureImages[adventure.image]} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroScrim} />
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={6}
            style={[styles.back, { top: insets.top + 8, left: insets.left + 12 }]}
          >
            <ChevronLeft size={16} color={colors.ink} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <View style={[styles.heroText, { left: insets.left + 20, right: insets.right + 20 }]}>
            <Text style={styles.heroTagline}>{adventure.tagline}</Text>
            <Text style={styles.heroTitle}>{adventure.title}</Text>
          </View>
        </View>

        <View style={[styles.column, column]}>
          <View style={styles.stats}>
            {stats.map((stat, i) => (
              <Stat key={stat.label} {...stat} width={`${100 / perRow}%`} divider={(i + 1) % perRow !== 0} />
            ))}
          </View>

          <Text style={styles.story}>{adventure.story}</Text>

          <Text style={styles.h2}>Stop by stop</Text>
          <View style={styles.stops}>
            {adventure.stops.map((stop, i) => {
              const destination = stop.destination ? destinationById[stop.destination] : null;
              const color = destination ? categoryById[destination.categories[0]].color : colors.forest;
              const last = i === adventure.stops.length - 1;
              return (
                <View key={`${stop.name}-${i}`} style={styles.stop}>
                  <View style={styles.stopSpine}>
                    <View style={[styles.stopNumber, { backgroundColor: color }]}>
                      <Text style={styles.stopNumberText}>{i + 1}</Text>
                    </View>
                    {!last && <View style={styles.stopLine} />}
                  </View>
                  <View style={[styles.stopBody, last && { paddingBottom: 4 }]}>
                    <Text style={styles.stopName}>{stop.name}</Text>
                    <Text style={styles.stopNote}>{stop.note}</Text>
                    {stop.photo && stopImages[stop.photo] && (
                      <Image source={stopImages[stop.photo]} style={styles.stopPhoto} resizeMode="cover" />
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.ctaBar,
          { paddingBottom: Math.max(insets.bottom, 16), paddingLeft: insets.left + 20, paddingRight: insets.right + 20 },
        ]}
      >
        <Pressable
          onPress={onShowOnMap}
          accessibilityRole="button"
          style={({ pressed }) => [styles.cta, pressed && { backgroundColor: colors.forestDeep }]}
        >
          <Map size={18} color={colors.white} />
          <Text style={styles.ctaText}>Show route on map</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Stat({ icon: Icon, label, value, width, divider }) {
  return (
    <View style={[styles.stat, { width }, divider && styles.statDivider]}>
      <View style={styles.statLabelRow}>
        <Icon size={12} color={colors.inkFaint} strokeWidth={2.4} />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  hero: {
    backgroundColor: colors.line,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 96,
    backgroundColor: `${colors.forestDeep}8C`,
  },
  back: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 14,
    ...shadowFloat,
  },
  backText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.ink,
  },
  heroText: {
    position: 'absolute',
    bottom: 16,
  },
  heroTagline: {
    ...text.eyebrow,
    color: `${colors.white}CC`,
  },
  heroTitle: {
    marginTop: 2,
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 29,
    color: colors.white,
  },
  column: {
    width: '100%',
    alignSelf: 'center',
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  stat: {
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  statDivider: {
    borderRightWidth: 1,
    borderRightColor: colors.line,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    ...text.eyebrowSmall,
    color: colors.inkFaint,
  },
  statValue: {
    marginTop: 2,
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
    color: colors.ink,
  },
  story: {
    paddingHorizontal: 20,
    paddingTop: 20,
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 23,
    color: colors.inkSoft,
  },
  h2: {
    paddingHorizontal: 20,
    paddingTop: 24,
    fontFamily: fonts.display,
    fontSize: 19,
    lineHeight: 23,
    color: colors.ink,
  },
  stops: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  stop: {
    flexDirection: 'row',
    gap: 14,
  },
  stopSpine: {
    alignItems: 'center',
  },
  stopNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopNumberText: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: colors.white,
  },
  stopLine: {
    flex: 1,
    width: 2,
    borderRadius: 1,
    marginVertical: 4,
    backgroundColor: colors.line,
  },
  stopBody: {
    flex: 1,
    paddingBottom: 20,
  },
  stopName: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15.5,
    lineHeight: 20,
    color: colors.ink,
  },
  stopNote: {
    marginTop: 2,
    fontFamily: fonts.sans,
    fontSize: 13.5,
    lineHeight: 18,
    color: colors.inkSoft,
  },
  stopPhoto: {
    marginTop: 8,
    width: 160,
    height: 107,
    borderRadius: radius.md,
    backgroundColor: colors.line,
  },
  ctaBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.surface,
    paddingTop: 12,
  },
  cta: {
    width: '100%',
    maxWidth: READING_WIDTH - 40,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.forest,
    paddingVertical: 14,
  },
  ctaText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    color: colors.white,
  },
});
