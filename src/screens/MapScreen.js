import { StyleSheet } from 'react-native';
import MapView from 'react-native-maps';

import { BREVARD, toLatLng } from '../lib/data';

// R1: a map of Brevard centred on the town. Markers, paths and routes
// layer on top of this in later commits.
export default function MapScreen() {
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        ...toLatLng(BREVARD),
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    />
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
