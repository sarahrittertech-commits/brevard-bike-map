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
3. Draw at least one route connecting it to the existing network.
4. Run `npm run validate`.
5. Commit the destination and its routes together in one commit.

## Building for a device

```bash
npx eas build --platform ios --profile preview
npx eas build --platform android --profile preview
```

Builds run on Expo's servers and take 10–20 minutes. The free tier queues
behind paid builds, so **do not leave the first real build until ship day.**
Do a throwaway build in week one to find the signing problems early.

## Release checklist

1. All automated tests green — `npm test && npm run validate`
2. Manual tests MT-1 to MT-6 pass on a physical phone
3. No routes with `confidence: "unverified"`
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
