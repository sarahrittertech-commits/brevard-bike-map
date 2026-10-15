# Bike Brevard Map

A hyperlocal mobile app for getting between places in Brevard, North Carolina
by bike.

The paved path and the sidewalks and quiet streets that connect it to town,
the places worth riding to along it — ice cream, playgrounds, breweries, bike
shops, repair stands — and a handful of curated rides with stop-by-stop notes.
Every route is one a local has actually ridden, not what a routing engine
guesses.

The repository is named `brevard-bike-map`; the app is **Bike Brevard Map**.
The repository name, the Expo slug and the bundle identifiers are left alone
deliberately — they are identifiers, not the product name.

## Status

In development. Targeting a ship date of **30 September 2026**.

## iPhone Duo and other screen shapes

In October 2026 the app was reviewed against Apple's
[Designing for iPhone Duo](https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo)
guidance. The full review is in
[`docs/iphone-duo-design-review.md`](./docs/iphone-duo-design-review.md).

**What the review found.** Version 1.0.1 runs on iPhone Duo but doesn't fit
it:

- It was locked upright, while Apple's main rule for iPhone Duo is that apps
  resize to whatever space they get.
- Its tab bar, Back button and "Show route on map" bar are custom-built.
  iPhone Duo moves only system bars to the side of the screen, so ours stay
  at the bottom and use up the short outer display's height.
- It ignored the left and right safe areas, which is where iPhone Duo puts
  its status bar, camera and side bars.
- Some touch targets were 32 pt, under Apple's 44 pt minimum.

**Screen sizes.** Apple publishes these in pixels; the points are derived at
@3x and not yet confirmed on a device:

| Display | Upright | On its side |
| --- | --- | --- |
| Outer (closed) | 466 × 678 pt | 678 × 466 pt |
| Inner (open) | 669 × 951 pt | 951 × 669 pt |

The outer display is 16% wider and 22% shorter than an iPhone 17, and the
fold runs down the middle of the inner one at about 475 pt.

**What changed (Tier 1, built).** The app rotates and lays itself out from the
window's size:

- On a screen wider than tall, the header and the place list dock into a
  left-hand column that ends before the fold.
- The category rail splits into two columns when one won't fit.
- Everything keeps clear of all four edges.
- On iPhone Duo open and upright, the list opens to exactly the fold.
- Photos and text are capped so wide screens stay readable.
- Close and Back take 44 pt touches.

None of this needed new code libraries, and an upright iPhone looks the same
as before.

**Still open:**

- A build with the iOS 27.1 SDK, which needs Xcode 27.1 and is required to
  run edge to edge on iPhone Duo.
- iPhone Duo App Store screenshots, required from April 2027.
- A check on a real iPhone Duo or its simulator. The layouts were checked
  at iPhone Duo's sizes on an iPhone 17 simulator.

**Waiting on a decision (Tier 2).** iPhone Duo's side-mounted tab bar only
comes from the system tab bar. Using it means adding a navigation library,
which reverses an earlier decision to keep this app free of one. A
hand-built side rail is the fallback.

## Documentation

Full project documentation lives in [`docs/`](./docs/) in this repository —
requirements, personas, use cases, data model, architecture decisions, test
cases, release notes and runbook. It is versioned alongside the code it
describes, so a decision record and the commit that implemented it move
together.

The PushPopDev docs site renders this folder at `/brevard-bike-map/`. It mounts
it by relative path rather than holding a copy, so this repository needs to be
checked out as a sibling of `docs-site` for that site to build.

Start with the [product requirements](./docs/prd.md)
and [ADR-0003](./docs/architecture/adr-0003-route-data.md),
which explains why routes here are hand-curated rather than computed.
The visual design lives in a
[separate repo](https://github.com/sarahrittertech-commits/Bike-Path-Adventures-Map-Design).

## Getting started

```bash
npm install
npm start
```

Scan the QR code with Expo Go on a phone. The app is Expo (React Native) with
`react-native-maps` — see [ADR-0001](./docs/architecture/adr-0001-app-platform.md)
for why Expo, and [ADR-0002](./docs/architecture/adr-0002-map-rendering.md)
for why react-native-maps.

## Data

Destinations, the path network, landmarks and adventures live in `src/data/`
as static JSON bundled into the app. There is no backend — see
[ADR-0004](./docs/architecture/adr-0004-storage-and-costs.md).

After any data change:

```bash
npm run validate
```

The validator checks that categories and stop references resolve, that IDs
are unique, that stated distances are plausible against drawn geometry, and —
most usefully — that no coordinate has had its latitude and longitude
swapped. It runs in CI on every push, alongside `npm test` and `npm run lint`.

## Tests

```bash
npm test
```

Unit tests for the data selection logic — which places a switched-on category
shows, what colour a pin draws as, how adventure stops are numbered, and
coordinate order. Plain node, no test runner. Also runs in CI.

Before a release:

```bash
npm run validate:release
```

which additionally refuses any placeholder content.

## Licence

MIT — see [LICENSE](./LICENSE).
