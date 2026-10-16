// app.json holds the config; this file adds the Android Google Maps key and
// turns it into Bike Brevard Kids when that is the build.
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

// Bike Brevard Kids is the same code built with EXPO_PUBLIC_APP_VARIANT=kids
// (eas.json's kids-* profiles). It is a separate app to the stores, so it
// needs its own name, bundle id, slug and EAS project; the data view itself
// is chosen in src/lib/data.js from the same variable.
const KIDS = {
  name: 'Bike Brevard Kids',
  slug: 'bike-brevard-kids',
  bundleId: 'dev.pushpop.bikebrevardkids',
  // Filled in by `eas init` for the kids slug; see the runbook. Until then a
  // kids EAS build stops here rather than building into the map's project.
  easProjectId: null,
};

function asKids(config) {
  if (!KIDS.easProjectId && process.env.EAS_BUILD_PLATFORM) {
    throw new Error('Bike Brevard Kids has no EAS project yet. See the runbook: Bike Brevard Kids.');
  }
  // The permission prompts and anything else naming the app follow it.
  const plugins = JSON.parse(JSON.stringify(config.plugins).replaceAll(config.name, KIDS.name));
  return {
    ...config,
    name: KIDS.name,
    slug: KIDS.slug,
    ios: { ...config.ios, bundleIdentifier: KIDS.bundleId },
    android: { ...config.android, package: KIDS.bundleId },
    extra: { ...config.extra, eas: KIDS.easProjectId ? { projectId: KIDS.easProjectId } : {} },
    plugins,
  };
}

module.exports = ({ config: base }) => {
  const config = process.env.EXPO_PUBLIC_APP_VARIANT === 'kids' ? asKids(base) : base;
  const apiKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;
  if (!apiKey) {
    if (process.env.EAS_BUILD_PLATFORM === 'android') {
      throw new Error('GOOGLE_MAPS_ANDROID_API_KEY is not set: the app would crash on launch. See the runbook.');
    }
    return config;
  }
  return withMapsAndroid(config, { androidGoogleMapsApiKey: apiKey });
};
