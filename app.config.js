// app.json holds the config; this file only adds the Android Google Maps key.
//
// The key comes from the environment so it never lands in this public
// repository. Locally that is `.env` (git-ignored); on EAS it is the
// GOOGLE_MAPS_ANDROID_API_KEY environment variable.
//
// Without it an Android build crashes on launch — Google's Maps SDK throws
// "API key not found" as soon as the map mounts (seen on the first EAS build,
// 12 October 2026). So an Android EAS build without the key stops here,
// before it spends a build, rather than producing an APK that cannot open.
// Expo Go is unaffected: it carries its own key.
//
// Only the Android half of the react-native-maps plugin is applied: the iOS
// half rewrites the Podfile, and iOS ships on Apple Maps without it.
const withMapsAndroid = require('react-native-maps/plugin/build/android').default;

module.exports = ({ config }) => {
  const apiKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;
  if (!apiKey) {
    if (process.env.EAS_BUILD_PLATFORM === 'android') {
      throw new Error('GOOGLE_MAPS_ANDROID_API_KEY is not set: the app would crash on launch. See the runbook.');
    }
    return config;
  }
  return withMapsAndroid(config, { androidGoogleMapsApiKey: apiKey });
};
