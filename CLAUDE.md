# Brevard Bike Map — project context

This file is read automatically at the start of a session. It exists so a
development window starts with full project context without re-explaining it.

## What this is

A hyperlocal mobile app for Brevard, North Carolina. A map of the town's bike
path and its connectors, the places worth riding to along it, and a handful of
curated "adventures" — rides locals actually do, with stop-by-stop notes.

Owner: Sarah Ritter (PushPopDev). Ship date: **30 September 2026**.

## Why it exists — read this before suggesting anything

This app is **proof of work**, not a product. It is the September 2026 entry
for the Women in AI group challenge, and its job is to demonstrate that a
finished thing ships on a deadline.

Consequences that should shape every suggestion made in this repo:

- **Small is the goal, not a compromise.** Roughly 30 working hours exist
  before ship. A shorter finished app beats a richer unfinished one.
- **This is not a foundation for anything.** It is explicitly *not* a prototype
  for the women's outdoor community app. Do not propose shared infrastructure,
  abstractions "for later", or generalising beyond Brevard.
- **No monetisation.** There is no business model and that is a decision, not
  an oversight.
- **Scope creep is the main risk to this project,** more than any technical
  problem. Push back on additions rather than accommodating them.

## Scope

In scope: map of Brevard with the path network drawn, category toggles that
show tappable pins, a bottom sheet with the filtered list and place detail,
an Adventures tab with a detail screen, and "show route on map" which overlays
the ride with numbered stops.

**Design:** https://github.com/sarahrittertech-commits/Bike-Path-Adventures-Map-Design
(a Magic Patterns web mock — Leaflet + Tailwind). The native app is built to
match it. Its coordinates are `[lat, lon]`; ours are `[lon, lat]`.

Out of scope — these are decisions, not backlog items: accounts, logins,
user-generated content, reviews, turn-by-turn navigation, GPS tracking, any
other town, payments, ads, a web version, shared code with any other project.

## Stack

All four architecture decisions are **Proposed**, not Accepted. Confirm with
Sarah before building on them.

| Area | Decision | Record |
| --- | --- | --- |
| Platform | Expo (React Native) + EAS Build | ADR-0001 |
| Maps | react-native-maps | ADR-0002 |
| Routing | Hand-curated routes, not computed | ADR-0003 |
| Storage | Static JSON bundled in the app, no backend | ADR-0004 |

ADR-0003 is the one with a genuine argument on both sides. Read it before
touching route logic.

## Current state

Built to the design, not yet run on a phone (as of 18 September 2026).
Expo SDK 57, JavaScript, `react-native-maps` on Apple Maps. Both tabs, the
detail screen and route-following are implemented. Metro bundles cleanly,
lint and validator pass.

```bash
npm install
npm start          # scan the QR code with Expo Go
npm run lint
npm run validate   # data checks; also runs in CI
```

Expo SDK 57 / React Native 0.86 changed a lot — check
https://docs.expo.dev/versions/v57.0.0/ before writing Expo-specific code
rather than relying on older patterns. Known trap: `StyleSheet.absoluteFillObject`
is gone (spreading it silently yields nothing); use `StyleSheet.absoluteFill`.

### Layout

```
App.js                      fonts, tab/detail/following state, renders screens — no nav library
src/theme.js                colours, font names, radii from the design's Tailwind config
src/lib/data.js             the only way the UI reads data; owns [lon, lat] -> {latitude, longitude}
src/data/                   five JSON files (see docs/data-model.md)
src/screens/                MapScreen, AdventuresScreen, AdventureDetailScreen
src/components/TrailMap     MapView + network polylines + all markers
src/components/MapPins      pin / landmark / trailhead / stop marker views
src/components/MapSheet     draggable bottom sheet (Animated + PanResponder, no library)
src/components/CategoryRail right-edge category toggles
src/components/*Icon        Lucide icons + the custom playground glyph
assets/adventures/          one photo per adventure
assets/icon-{light,dark,tinted}.png   iOS 18 app icon variants
assets/android-icon-*.png   Android adaptive icon layers
assets/splash.png           launch screen mark + wordmark
scripts/validate-data.cjs   data checks
```

Dependencies beyond Expo: react-native-maps, react-native-svg,
lucide-react-native, react-native-safe-area-context, expo-font and two
Google Fonts packages. Nothing else is needed; resist adding a navigation or
bottom-sheet library.

Android builds outside Expo Go need a Google Maps API key in `app.json`
under `android.config.googleMaps.apiKey`. iOS needs nothing.

The app icon and launch screen come from the design and are regenerated
from SVG rather than hand-drawn — see the runbook. **Expo Go shows its own
splash**, so the real launch screen only appears in an EAS or local build;
`npx expo prebuild --platform ios` is the cheap way to check it generates.

## Data

`src/data/` holds `categories.json`, `destinations.json`, `network.json`,
`landmarks.json` and `adventures.json`. This is the real Brevard dataset,
converted from the design repo. The network geometry is traced rather than
surveyed; the design notes it should be replaced with the town GIS centerline
before launch.

Coordinates are GeoJSON order: **`[longitude, latitude]`**. Brevard is roughly
`[-82.73, 35.23]`, so longitude is the negative one. Swapping these is the most
common bug in this kind of app; `scripts/validate-data.cjs` catches it.

Always run the validator after a data change:

```bash
node scripts/validate-data.cjs
```

## Build pipeline

Run one throwaway EAS build in the first week. Its purpose is to surface code
signing and configuration problems while there is time to fix them. The most
reliable way for a solo mobile project to miss its date is discovering on the
final afternoon that the build is broken.

## Working style

- Small, frequent commits. The commit history is part of the deliverable
  because the repository is public and the project is proof of work.
- Sarah is a technical product manager, not a systems engineer. Explain
  architectural tradeoffs in terms of consequences and cost, not internals.
- Business and portfolio-level discussion happens in a different window.
  This window is for building the app.

## Full documentation

`docs/` in this repository — requirements, personas, use cases, data model,
ADRs, test cases, release notes and runbook. Documentation is versioned with
the code, so a change that invalidates a document updates it in the same
commit. The PushPopDev docs site renders this folder; it holds no copy.
