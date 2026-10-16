---
sidebar_position: 9
title: Runbook
---

# Runbook

How to work on, build and release this app.

## Local development

```bash
cd ~/Documents/PushPopDev/brevard-bike-map
npm install
npm start
```

Scan the QR code with Expo Go on a phone to see the app live.

## Data changes

Route and destination data lives in `src/data/`. After any edit:

```bash
npm run validate
```

Never commit data that fails validation — CI will reject it, and the errors are
much easier to read locally.

## Adding a destination

1. Add an entry to `src/data/destinations.json` following the
   [data model](./data-model).
2. Confirm the coordinate order is `[longitude, latitude]`.
3. Give it a `mileMarker` so it sorts into the list correctly.
4. Run `npm run validate`.
5. If it belongs on an adventure, add it as a stop with a `destination`
   reference in the same commit.

## Adding an adventure

1. Add an entry to `src/data/adventures.json` with its stops and drawn route.
2. Drop the photo in `assets/adventures/<image>.jpg` **and** add it to the
   `adventureImages` map in `src/lib/data.js` — the bundler only picks up
   images that are `require()`d there. The validator checks both.
3. Run `npm run validate`.

## Adding a photo or an icon

### Where the adventure photos come from

Every photo in the app must have a provenance line here before it ships.

| File | Source | Taken |
| --- | --- | --- |
| `playground-to-dollys.jpg` | IMG_5280 — Dolly's Dairy Bar | Sarah Ritter, 30 Sep 2026 |
| `ballfield-library-loop.jpg` | IMG_5180 — the ball fields from the path | Sarah Ritter, 30 Sep 2026 |
| `taproom-traverse.jpg` | IMG_5249 — Ecusta Brewing, sign and building | Sarah Ritter, 30 Sep 2026 |
| `pisgah-gateway.jpg` | IMG_5271 — the gravel path into the forest | Sarah Ritter, 30 Sep 2026 |
| `river-run.jpg` | IMG_5298 — the Davidson River from the bridge | Sarah Ritter, 30 Sep 2026 |
| `downtown-festival.jpg` | IMG_1036 — riding Main St towards the festival tents | Sarah Ritter, 25 May 2024 |
| `concert-night.jpg` | IMG_8592 — a band on a taproom stage | Sarah Ritter, 26 Oct 2021 |
| `end-to-end.jpg` | IMG_6045 — a group ride gathered beside the path | Sarah Ritter, 21 Jun 2021 |
| `bracken-loop.jpg` | IMG_5282 — The Hub & Pisgah Tavern, where the ride starts | Sarah Ritter, 30 Sep 2026 |

All nine are now Sarah's own. Nothing from the design dataset is left in
`assets/adventures/`.

Three of them show people, and the clearance for each is recorded in
[the App Review response](./app-review-response): IMG_1036 is Sarah's own
child, and IMG_6045 is the photograph from the public campaign for bicycle
path funding, cleared for use promoting the path. IMG_8592 is a band on stage
at a public venue, shot from the audience.

These nine are the set, and they are not all of the exact spot their ride
names — close enough for the feel of it, and unambiguously ours, which matters
more. Do not swap one out for being approximate.

A new photograph of people needs its clearance written down before it ships.

Three of the nine predate the surveys — 2021, 2021 and 2024 — and carry no
GPS, so the dates above are the real ones rather than this week's.

Run the script rather than the commands by hand:

```bash
node scripts/photo-prep.cjs ~/Desktop/<folder> \
  --map <adventure-id>=IMG_XXXX.HEIC --dry-run
```

The key is the adventure's `id`, not its image name — `full-trail` writes
`end-to-end.jpg`. It reads the capture date and GPS for this table, warns when
a photo has neither, and handles the axis swap that a portrait source needs.
960 x 640 is the hero's own 3:2, so nothing is cropped twice; quality 35 in
sips lands where the originals were, about 50-125 KB.

Adventure photos are re-encoded to **960 x 640 at quality 35** before they
are committed — the originals were far larger and many times the size. The
widest they are ever drawn is the detail-screen hero, 402pt full-bleed,
which is 1206px on a 3x phone; at a 100% crop the difference against the
original is not visible at arm's length.

Re-encode from the original file, never from the committed one, or the JPEG
loss compounds each time.

Icons come from `lucide-react-native` and must be imported by their **deep
path**, never from the package root:

```js
import Ruler from 'lucide-react-native/icons/ruler';   // yes
import { Ruler } from 'lucide-react-native';           // no — ships all 1,851 icons
```

Metro does not tree-shake, so the second form put 1.9 MB of unused icons in
the bundle.

## Bike Brevard Kids

The second app is this code built with `EXPO_PUBLIC_APP_VARIANT=kids`. It
has no breweries or taprooms, its own name and bundle id
(`dev.pushpop.bikebrevardkids`) and, once created, its own EAS project. What
each app shows is decided in the data — see the data model's "Two apps from
one dataset".

```bash
npm run start:kids                               # Expo Go, kids data (clears the cache)
eas build -p ios --profile kids-preview          # device build
eas build -p ios --profile kids-simulator        # simulator build
```

Switching between the apps in Expo Go needs the cache cleared, because the
variant is written into the bundle: `npm start -- --clear` to go back.

**One-time setup before the first kids EAS build.** The kids app needs its
own EAS project, or its builds would land in the map's. Run
`EXPO_PUBLIC_APP_VARIANT=kids npx eas-cli init`; it cannot write the id into
`app.config.js`, so copy the project id it prints into `KIDS.easProjectId`
there. Until then a kids EAS build stops with an error rather than building.
The App Store record, `ascAppId` for a `kids-production` submit profile, and
the Android Maps key (the same key works if its restrictions allow the new
package) come after that. The icon and launch screen are still the map's.

## App icon and launch screen

Both come from Sarah's artwork of 1 October 2026, kept on the Desktop in
`final/` with `Bike Brevard Icon (source).dc.html` as the editable source.
The icon is a bike in front of three receding ridges under a cream sky:
background `#F6F3EC`, far ridge `#C6C2E0`, middle `#8E90C4`, near `#4A5596`,
bike `#3F3893`, with a blue river and a grey path. The splash adds a sunrise
gradient above the ridges and the wordmark below.

This replaced the 1.0.0 artwork, whose ridgelines read as water rather than
mountains — blue sinuous S-curves, which is how water is drawn. Three
overlapping ridges in receding tones, with a horizon and an actual river for
contrast, is what fixed it.

| Asset | Used for |
| --- | --- |
| `assets/icon-light.png` · `icon-dark.png` · `icon-tinted.png` | The three iOS 18 icon appearances |
| `app.json` `expo.icon` | Points at `icon-light.png`; there is no separate fallback file |
| `assets/android-icon-foreground.png` · `-background.png` · `-monochrome.png` | Android adaptive icon layers |
| `assets/android-splash.png` | Android launch screen: the scene cut to a circle, no wordmark |
| `assets/splash.png` | Launch screen: the mark plus the wordmark |

Two things to know before changing them:

- **iOS icons must not have an alpha channel** for the light and tinted
  variants, or App Store submission rejects them. Flatten before exporting.
- **The Android layers and splash are generated, not drawn.**
  `python3 scripts/android-icons.py ~/Desktop/final/FINAL-app-icon-3b-1024.png`
  writes all four (it needs Pillow). The scene is scaled to two thirds of the
  canvas — the 72dp a launcher can show of a 108dp adaptive icon — so every
  launcher mask crops inside the artwork; the bike sits inside the icon's
  inscribed circle, so even a round mask keeps it whole.
- **Android 12+ shows the splash through a circle**, 192dp inside a 288dp
  canvas, so the iOS splash with its baked-in wordmark would be cut through.
  Android gets `android-splash.png` instead, under `android` in the
  expo-splash-screen plugin config.
- **The launch screen wordmark is baked into the image.** A native splash
  cannot lay out text, so "Bike Brevard Map" and "Brevard, North Carolina"
  are part of the artwork. Changing the wording means regenerating the PNG.
- **expo-splash-screen wants a logo, not a full-bleed image.** It pads
  whatever it is given out to a square and draws it `imageWidth` wide on
  `backgroundColor`. The source artwork is a full-screen 1170x2532; what
  ships is a crop of it — `y 480..2060`, so sky, ridges, bike and wordmark —
  at `imageWidth: 380`, which puts the artwork itself about 281pt across,
  where the 1.0.0 lockup was 280. Handing it the full-screen image instead
  generates a 100x100 logo.
- **sips cannot remove an alpha channel**; every PNG it writes comes back
  colour type 6, and a BMP round-trip does not help. The three iOS icons were
  flattened with a short PNG reader/writer rather than by hand. Their alpha
  was fully opaque, so dropping it was lossless.

Expo Go shows its own splash, so the launch screen cannot be checked there.
To confirm it generates without waiting for a full build:

```bash
npx expo prebuild --platform ios --no-install --clean
ls ios/*/Images.xcassets/          # AppIcon.appiconset, SplashScreenLogo.imageset
rm -rf ios                         # managed workflow — do not keep it
```

## Building for a device

```bash
npx eas build --platform ios --profile preview
npx eas build --platform android --profile preview
```

Builds run on Expo's servers and take 10–20 minutes. The free tier queues
behind paid builds, so **do not leave the first real build until ship day.**
Do a throwaway build in week one to find the signing problems early.

### Which Xcode EAS builds with

Checked 15 October 2026. EAS picks the build image from the Expo SDK. For
SDK 57 that is `macos-tahoe-26.5-xcode-26.6`: **Xcode 26.6 and the iOS 26
SDK**. That is what App Store Connect requires today (iOS 26 SDK or later,
since 28 April 2026), and the app runs on iOS 27 phones as it is.

Two things will need **Xcode 27**:

- **iPhone Duo.** Apps reach the screen edges and get side bars only when
  built with the iOS 27.1 SDK. See the [iPhone Duo review](./iphone-duo-design-review).
- **Apple's April 2027 rule.** From then, uploads must be built with the iOS
  27 SDK or later.

When the time comes, pin the image in `eas.json` under the profile's `ios`
key, for example `"image": "macos-tahoe-26.6-xcode-27.1"`. The image list is
at [docs.expo.dev/build-reference/infrastructure](https://docs.expo.dev/build-reference/infrastructure/).
On 15 October 2026 the Xcode 27.1 image is still a release candidate.

**Scene support is already on** (`expo-build-properties`,
`ios.enableSceneSupport` in `app.json`). An app built with Xcode 27 that
doesn't use UIKit's scene life cycle doesn't launch properly on iOS 27: it
shows a black screen. SDK 58 does this by default. On SDK 57 it's opt-in,
which is why the plugin is there. Delete the setting after upgrading to SDK
58, where prebuild warns that it does nothing. See Expo's
[scene life cycle guide](https://github.com/expo/fyi/blob/main/ios-scene-lifecycle.md).

## Recording the App Review demo video

Apple asks for a screen recording from a **physical device**, not the Simulator,
beginning with the app launching.

1. Install the submitted build from TestFlight, so the recording shows the
   binary under review rather than an ad hoc one.
2. Add Screen Recording to Control Centre if it is not there — Settings →
   Control Centre.
3. Start recording, then go to the Home Screen **before** opening the app:
   Apple asks that the recording begin with the launch.
4. Walk the whole app, unhurried, about ninety seconds:
   launch and let the map settle · switch on ice cream, then breweries · tap a
   pin and read the detail · close it · press the clear button to return to just
   the path · Adventures tab · open a ride · Show route on map.
5. Stop recording and attach the file to the App Store Connect reply.

Nothing in the app needs an account, a purchase or user-generated content, so
none of Apple's extra recording requirements apply.

Turning on Airplane Mode before recording makes the offline claim visible, since
the app keeps working. Optional, but it answers a question before it is asked.

## App Store screenshots

Ten shots, five screens at two sizes, in `~/Desktop/bike-brevard-screenshots/`:
`6.9-inch` at 1320x2868 and `6.5-inch` at 1284x2778, which are the exact
pixel sizes App Store Connect wants.

They come from simulators, which is allowed for the listing — only the App
Review demo video has to be a physical device.

```bash
eas build -p ios --profile simulator      # a .app, not an .ipa
xcrun simctl install <udid> BikeBrevardMap.app
xcrun simctl status_bar <udid> override --time 9:41 --batteryState charged --batteryLevel 100
xcrun simctl io <udid> screenshot out.png
```

iPhone 17 Pro Max gives 6.9-inch; iPhone 14 Plus gives 6.5-inch and has to be
created with `simctl create`.

Three traps, all of which cost time once:

- **simctl cannot write into ~/Desktop.** macOS privacy blocks it and the
  error only appears if stderr is not swallowed. Capture somewhere else and
  copy the files over.
- **simctl cannot tap.** Driving the app needs Simulator.app, which only
  exists once Xcode is fully installed. Without it the screens have to be
  reached another way — the 1.0.1 set was captured from a build temporarily
  patched to cycle through them on a timer, which is not something to leave
  in the tree.
- **Opening a URL in Expo Go raises a confirmation dialog** that cannot be
  dismissed without tapping, so Expo Go is no use for this. A `simulator`
  profile build installs and launches without one, and is the real binary
  rather than Expo Go hosting the JS.

## Android

The JavaScript is the same on both platforms; what differs is the map
underneath. iOS draws on Apple Maps and needs nothing. Android draws on Google
Maps and **needs an API key**. Without one the app **crashes on launch** —
Google's SDK throws `API key not found` as the map mounts. The first EAS build,
12 October 2026, proved it. `app.config.js` therefore refuses to start an
Android EAS build without the key, so a crashing APK cannot be made by accident.

### Getting the Maps key

Sarah's to do, since it needs a Google account and a billing account. The
Maps SDK for Android is free for map display, but Google Maps Platform will not
issue working keys to a project without billing attached.

1. The Google Cloud project is **`brevardbikeapp`**, created by Sarah on
   12 October 2026. Attach a billing account to it.
2. Enable **Maps SDK for Android** — only that API.
3. Create an API key. Restrict it:
   - Application restriction: **Android apps**, package
     `dev.pushpop.brevardbikemap`, with the SHA-1 fingerprint below.
   - API restriction: **Maps SDK for Android** only.
4. Give it to EAS, marked sensitive so it never appears in logs:

   ```bash
   eas env:set --name GOOGLE_MAPS_ANDROID_API_KEY --value <key> --environment preview --environment production --visibility sensitive
   ```

5. For local builds, put the same line in a `.env` file, which is git-ignored:
   `GOOGLE_MAPS_ANDROID_API_KEY=<key>`.

`app.config.js` reads that variable and writes it into the Android manifest.
The key is deliberately not in `app.json`: this repository is public, and an
unrestricted key in it would be someone else's free quota.

**The SHA-1 is the signing key's fingerprint, and there will be two.** The EAS
keystore, generated in the cloud on 12 October 2026 and used for every
`preview` build, is:

```
54:F8:28:E5:78:16:BF:8D:DA:7E:19:EF:5B:E4:3A:81:B5:30:20:8A
```

`eas credentials -p android` shows it again. If the app ever goes on Google
Play, Play re-signs it with its own key, whose SHA-1 is in the Play Console
under App integrity; add that one to the key's restriction as well, or the
store build fails to authorise the map while the APK works.

To read the fingerprint off any APK:

```bash
$ANDROID_HOME/build-tools/36.0.0/apksigner verify --print-certs app.apk
```

**Permissions.** `app.json` blocks the storage, draw-over-apps and vibrate
permissions that library defaults add. The built APK also carries wake lock,
network state, boot completed and foreground service, merged in by Google's and
AndroidX's libraries for their background work scheduler. All four are
"normal" permissions — granted at install, never prompted, and not in Play's
data safety categories — and blocking them risks breaking Google's own
components, so they are left alone.

### Building and installing

```bash
eas build --platform android --profile preview
```

The `preview` profile builds an **APK**, which installs straight from the EAS
link on any Android phone ("install unknown apps" has to be allowed for the
browser once). `production` builds an app bundle, which is what Google Play
takes and which cannot be installed directly.

Android builds need no paid account and no device registration, unlike iOS.

### The Android emulator

Nothing Android was installed on the Mac mini before 12 October 2026. What is
there now, all from Homebrew, no Android Studio:

```bash
brew install openjdk@17
brew install --cask android-commandlinetools
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
sdkmanager --sdk_root=$ANDROID_HOME --licenses
sdkmanager --sdk_root=$ANDROID_HOME platform-tools emulator "system-images;android-36;google_apis_playstore;arm64-v8a"
avdmanager create avd -n brevard -k "system-images;android-36;google_apis_playstore;arm64-v8a" -d pixel_8
```

`JAVA_HOME` must point at the Homebrew JDK
(`/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home`) — macOS has
a `java` stub that only says Java is missing.

```bash
$ANDROID_HOME/emulator/emulator -avd brevard &
adb install bike-brevard-map.apk        # an EAS preview APK
npx expo start --android                # or Expo Go, which it installs itself
adb exec-out screencap -p > shot.png    # screenshots; adb can tap, unlike simctl
```

Two traps:

- **Expo Go cannot show the map on the emulator.** Expo Go carries its own
  Maps key, but Google rejects it for the copy Expo installs on an emulator —
  logcat says `Authorization failure` for `host.exp.exponent`. Everything
  except the map works, so Expo Go is still useful for the sheet, the tabs,
  the detail screen and the back button. Checking the map needs a build with
  our own key.
- **`npx expo start` under `CI=1` does not reload.** Restart it after a code
  change, then `adb shell am force-stop host.exp.exponent` and reopen, or the
  emulator keeps running the old bundle.

## Release checklist

1. Lint, unit tests and data checks green —
   `npm run lint && npm test && npm run validate:release`
2. Manual tests MT-1 to MT-6 pass on a physical phone
3. No placeholder names in the data (`validate:release` enforces this)
4. Version bumped in `package.json` and `app.json`
5. [Release notes](./release-notes) updated
6. Tag the commit: `git tag v1.0.0 && git push --tags`
7. Build and distribute
8. Post the build log entry to the docs site

## If the build fails on ship day

The fallback, in order:

1. Ship the last green build rather than the newest commit.
2. If no green build exists, ship via Expo Go with a published update —
   it installs through the Expo Go app and needs no store review.
3. If that fails, the documentation site and public repository are
   themselves a deliverable. Show the work.

Deciding this now, rather than at 11pm on 30 September, is the point.

## Running in the iOS Simulator

Xcode 27.0 is installed on the Mac mini, with the iOS 26.5 and iOS 27.0
simulator runtimes. Each runtime has its own "iPhone 17" simulator, so pass
the device's ID when it matters which one opens:
`xcrun simctl list devices` shows which is which.

```bash
npm start                                  # in one terminal
xcrun simctl boot "iPhone 17" && open -a Simulator
xcrun simctl openurl booted exp://127.0.0.1:8081
```

Expo Go is already installed on the iPhone 17 simulator. It is a quick way to
check a change; the release gate still requires a real phone.

Expo Go is not a check of native configuration: it brings its own app
delegate, scene setup and Info.plist. To test those, build the app itself
with the local Xcode. `ios/` is git-ignored and regenerated each time.

```bash
export LANG=en_US.UTF-8   # CocoaPods fails on Ruby 4 without it
npx expo prebuild --platform ios --clean
npx expo run:ios --device <simulator id>
```

`prebuild` rewrites the `ios` and `android` scripts in package.json to
`expo run:*`. Put them back before committing.
