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
| `taproom-traverse.jpg` | IMG_5215 — Oskar Blues taproom | Sarah Ritter, 30 Sep 2026 |
| `pisgah-gateway.jpg` | IMG_5282 — The Hub & Pisgah Tavern | Sarah Ritter, 30 Sep 2026 |
| `river-run.jpg` | IMG_5298 — the Davidson River from the bridge | Sarah Ritter, 30 Sep 2026 |
| `downtown-festival.jpg` | IMG_1036 — riding Main St towards the festival tents | Sarah Ritter, 25 May 2024 |
| `concert-night.jpg` | IMG_8592 — a band on a taproom stage | Sarah Ritter, 26 Oct 2021 |
| `end-to-end.jpg` | IMG_6045 — a group ride gathered beside the path | Sarah Ritter, 21 Jun 2021 |
| `bracken-loop.jpg` | **unknown — arrived with the design dataset** | — |

`bracken-loop.jpg` came in commit `ae9d4b3` with the converted design data and
nothing records who made it. It is the last one to replace, and its subject —
the Bracken singletrack — is not on any road ride, so it needs its own trip.

Two of the photographs show identifiable people: IMG_6045 is a group ride with
a dozen faces including children, and IMG_8592 shows performers on stage.
That is a release question rather than a licensing one, and it is open. See
[the App Review response](./app-review-response).

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

Adventure photos are re-encoded to **960px wide at quality 60** before they
are committed — the originals were 1264px and four times the size. The
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

## App icon and launch screen

Both come from the design, at
`https://<render-id>-render.magicpatterns.app/app-icon`. The artwork is a
bike over two ridgelines: background `#F7F4EC`, back ridge `#9DBFE3`, front
ridge `#2C6BA8`, bike `#3F3794`.

| Asset | Used for |
| --- | --- |
| `assets/icon-light.png` · `icon-dark.png` · `icon-tinted.png` | The three iOS 18 icon appearances |
| `assets/icon.png` | Fallback icon |
| `assets/android-icon-foreground.png` · `-background.png` · `-monochrome.png` | Android adaptive icon layers |
| `assets/splash.png` | Launch screen: the mark plus the wordmark |

Two things to know before changing them:

- **iOS icons must not have an alpha channel** for the light and tinted
  variants, or App Store submission rejects them. Flatten before exporting.
- **The Android foreground is scaled to 66%** of the canvas, because Android
  crops adaptive icons to a central safe zone.
- **The launch screen wordmark is baked into the image.** A native splash
  cannot lay out text, so "Bike Brevard Map" and "Brevard, North Carolina"
  are converted to outlines using Fraunces and Inter. Changing the wording
  means regenerating the PNG.

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

Xcode 26 and the iOS 26.5 simulator runtime are installed on the Mac mini.

```bash
npm start                                  # in one terminal
xcrun simctl boot "iPhone 17" && open -a Simulator
xcrun simctl openurl booted exp://127.0.0.1:8081
```

Expo Go is already installed on the iPhone 17 simulator. It is a quick way to
check a change; the release gate still requires a real phone.
