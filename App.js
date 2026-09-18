import { useCallback, useEffect, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
// Per-weight imports: the package index pulls in every weight (~12 MB).
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';

import BottomNav from './src/components/BottomNav';
import AdventureDetailScreen from './src/screens/AdventureDetailScreen';
import AdventuresScreen from './src/screens/AdventuresScreen';
import MapScreen from './src/screens/MapScreen';
import { adventureById } from './src/lib/data';
import { colors } from './src/theme';

// Two tabs and one pushed detail screen is the whole app, so navigation is
// plain state rather than a navigation library.
export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Fraunces_600SemiBold,
  });

  const [tab, setTab] = useState('map');
  const [detailId, setDetailId] = useState(null);
  const [followingId, setFollowingId] = useState(null);

  const closeDetail = useCallback(() => setDetailId(null), []);

  useEffect(() => {
    if (!detailId) return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      closeDetail();
      return true;
    });
    return () => sub.remove();
  }, [detailId, closeDetail]);

  if (!fontsLoaded) return null;

  const detail = detailId ? adventureById[detailId] : null;
  const following = followingId ? adventureById[followingId] : null;

  return (
    <SafeAreaProvider>
      <View style={styles.app}>
        {detail ? (
          <AdventureDetailScreen
            adventure={detail}
            onBack={closeDetail}
            onShowOnMap={() => {
              setFollowingId(detail.id);
              setDetailId(null);
              setTab('map');
            }}
          />
        ) : (
          <>
            {/* The map stays mounted underneath so switching tabs never
                reloads it; the adventures list is laid over the top. */}
            <View style={styles.tabPane}>
              <MapScreen following={following} onStopFollowing={() => setFollowingId(null)} />
              {tab === 'adventures' && (
                <View style={styles.overlay}>
                  <AdventuresScreen onOpen={setDetailId} />
                </View>
              )}
            </View>
            <BottomNav current={tab} onChange={setTab} />
          </>
        )}
        <StatusBar style="dark" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  tabPane: {
    flex: 1,
  },
  overlay: {
    // RN 0.86 dropped absoluteFillObject; only StyleSheet.absoluteFill remains.
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.canvas,
  },
});
