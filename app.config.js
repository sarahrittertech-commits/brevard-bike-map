// app.json holds the config; this file only adds the Android Google Maps key.
//
// The key comes from the environment so it never lands in this public
// repository. Locally that is `.env` (git-ignored); on EAS it is the
// GOOGLE_MAPS_ANDROID_API_KEY environment variable. Without it an Android
// build installs and runs but draws a blank grey map. Expo Go brings its own
// key, so the map works there either way.
//
// Only the Android half of the react-native-maps plugin is applied: the iOS
// half rewrites the Podfile, and iOS ships on Apple Maps without it.
const withMapsAndroid = require('react-native-maps/plugin/build/android').default;

module.exports = ({ config }) => {
  const apiKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;
  if (!apiKey) {
    if (process.env.EAS_BUILD_PLATFORM === 'android') {
      console.warn('GOOGLE_MAPS_ANDROID_API_KEY is not set: this Android build will show no map.');
    }
    return config;
  }
  return withMapsAndroid(config, { androidGoogleMapsApiKey: apiKey });
};
