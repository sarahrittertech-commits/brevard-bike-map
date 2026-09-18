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

## Building for a device

```bash
npx eas build --platform ios --profile preview
npx eas build --platform android --profile preview
```

Builds run on Expo's servers and take 10–20 minutes. The free tier queues
behind paid builds, so **do not leave the first real build until ship day.**
Do a throwaway build in week one to find the signing problems early.

## Release checklist

1. Lint and data checks green — `npm run lint && npm run validate:release`
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
