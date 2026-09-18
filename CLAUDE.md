# Brevard Bike Map — project context

This file is read automatically at the start of a session. It exists so a
development window starts with full project context without re-explaining it.

## What this is

A hyperlocal mobile app for Brevard, North Carolina. A rider picks two local
destinations and sees the bikeable route between them.

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

In scope: map of Brevard, tappable destination markers by category, the bike
path network, tap for detail, pick start and end to see a route with distance
and ride time, category filtering.

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

Expo app scaffolded (SDK 57, blank JavaScript template) with
`react-native-maps` installed. The map opens centred on Brevard (R1). Nothing
else is built yet.

```bash
npm install
npm start          # scan the QR code with Expo Go
npm run validate   # data checks; also runs in CI
```

Expo SDK 57 changed a lot — check https://docs.expo.dev/versions/v57.0.0/
before writing Expo-specific code rather than relying on older patterns.

### Layout

```
App.js                 root component, renders MapScreen
index.js               Expo entry point, do not touch
app.json               Expo config (name, slug, bundle ids)
assets/                icon and splash images (template defaults for now)
src/data/              the four JSON data files
src/lib/data.js        the only way the UI reads data; owns [lon, lat] -> {latitude, longitude}
src/screens/           one file per full-screen view
scripts/               validate-data.cjs
```

Components go in `src/components/` when the first one exists. Keep the tree
this flat — there is no reason for it to grow beyond these folders.

Android builds outside Expo Go need a Google Maps API key in
`app.json` under `android.config.googleMaps.apiKey`. Expo Go supplies its own,
so this is a week-one EAS build task, not a today task.

## Data

`src/data/` holds `destinations.json`, `routes.json`, `categories.json`,
`adventures.json`.

**The data currently in these files is placeholder sample data.** Sarah has the
real Brevard dataset. Getting that data in is an early task, and its format is
still an open question — ask rather than assume.

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
