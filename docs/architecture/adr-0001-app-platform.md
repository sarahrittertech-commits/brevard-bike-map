---
sidebar_position: 2
title: ADR-0001 App platform
---

# ADR-0001 — Build with Expo and React Native

**Status:** Proposed · **Date:** 15 September 2026

## Context

The app must be a real mobile app that installs on a phone, built by one
person, in roughly 30 working hours, shipping 30 September 2026. It needs a map,
markers, drawn lines and a detail panel. It does not need background location,
push notifications, payments or any other demanding native capability.

## Options

### Expo (managed React Native)

JavaScript and React. `npx create-expo-app` to running app in minutes. EAS Build
produces installable iOS and Android binaries on Expo's servers, which means no
local Xcode signing archaeology. Expo Go allows testing on a physical phone
without any build step at all.

Cost: free tier covers low-volume builds.

Against it: adds a framework layer, and native map libraries occasionally need a
development build rather than plain Expo Go.

### Bare React Native

More direct control over native modules. Against it: you own the iOS signing and
Gradle configuration yourself, which is a well-known way to lose a weekend. No
benefit here, because nothing in this app needs that control.

### Native Swift and Kotlin

Best performance and platform feel. Against it: two codebases, two languages,
for an app whose entire job is showing a map. Not achievable in the time.

### Progressive web app

Fastest possible route — a responsive web page with a map. Against it: the
project brief specifies a mobile app with a build process, and "I built a web
page" is weaker proof of work than "I shipped an app to a phone."

## Decision

**Expo with EAS Build.**

It is the only option that reaches an installable app inside the time budget,
and the parts it makes easy — signing, builds, device testing — are exactly the
parts most likely to consume a solo developer's remaining hours.

## Consequences

**Good:** device testing from day one via Expo Go. A single codebase for both
platforms. Builds happen on Expo's infrastructure, not a local machine.

**Bad:** dependent on Expo's build queue. Free-tier builds queue behind paid
ones and can take considerably longer than the nominal 10–20 minutes.

**Mitigation:** run one throwaway EAS build in the first week. The purpose is
to surface signing and configuration problems while there is still time to fix
them, not to produce anything usable. **The most common way a solo mobile
project misses its date is discovering the build pipeline is broken on the last
day.**

## Revisit if

The app needs a capability Expo's managed workflow does not expose. At that
point `npx expo prebuild` moves to a bare workflow without starting over.
