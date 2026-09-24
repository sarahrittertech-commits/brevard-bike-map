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
swapped. It runs in CI on every push, alongside `npm run lint`.

Before a release:

```bash
npm run validate:release
```

which additionally refuses any placeholder content.

## Licence

MIT — see [LICENSE](./LICENSE).
