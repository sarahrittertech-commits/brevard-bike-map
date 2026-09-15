# Brevard Bike Map

A hyperlocal mobile app for getting between places in Brevard, North Carolina
by bike.

Pick two local destinations — a bike shop and a trailhead, one brewery and
another, the ice cream place and the pool — and see the bikeable way between
them, using connections local riders actually use rather than whatever a
general-purpose routing engine suggests.

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

## Getting started

The app itself has not been scaffolded yet. The first development step is:

```bash
npx create-expo-app@latest . --template blank
npx expo install react-native-maps
```

See [ADR-0001](./docs/architecture/adr-0001-app-platform.md)
for why Expo, and [ADR-0002](./docs/architecture/adr-0002-map-rendering.md)
for why react-native-maps.

## Data

Route and destination data lives in `src/data/` as static JSON bundled into the
app. There is no backend — see
[ADR-0004](./docs/architecture/adr-0004-storage-and-costs.md).

The files currently contain **placeholder sample data** which must be replaced
with the real Brevard dataset.

After any data change:

```bash
node scripts/validate-data.cjs
```

The validator checks that categories and destinations resolve, that IDs are
unique, that stored distances match drawn geometry, and — most usefully — that
no coordinate has had its latitude and longitude swapped. It runs in CI on
every push.

Before a release:

```bash
node scripts/validate-data.cjs --release
```

which additionally refuses any route still marked `unverified`.

## Licence

MIT — see [LICENSE](./LICENSE).
