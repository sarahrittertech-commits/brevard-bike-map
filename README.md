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

Full project documentation — requirements, personas, data model, architecture
decisions, test cases and runbook — lives on the PushPopDev docs site under
[Brevard Bike Map](../docs-site/docs/brevard-bike-map/).

Start with the [product requirements](../docs-site/docs/brevard-bike-map/prd.md)
and [ADR-0003](../docs-site/docs/brevard-bike-map/architecture/adr-0003-route-data.md),
which explains why routes here are hand-curated rather than computed.

## Getting started

The app itself has not been scaffolded yet. The first development step is:

```bash
npx create-expo-app@latest . --template blank
npx expo install react-native-maps
```

See [ADR-0001](../docs-site/docs/brevard-bike-map/architecture/adr-0001-app-platform.md)
for why Expo, and [ADR-0002](../docs-site/docs/brevard-bike-map/architecture/adr-0002-map-rendering.md)
for why react-native-maps.

## Data

Route and destination data lives in `src/data/` as static JSON bundled into the
app. There is no backend — see
[ADR-0004](../docs-site/docs/brevard-bike-map/architecture/adr-0004-storage-and-costs.md).

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
