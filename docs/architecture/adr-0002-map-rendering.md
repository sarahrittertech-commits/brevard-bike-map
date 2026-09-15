---
sidebar_position: 3
title: ADR-0002 Map rendering
---

# ADR-0002 — Render maps with react-native-maps

**Status:** Proposed · **Date:** 15 September 2026

## Context

The app needs to display a base map of Brevard, place category-coloured
markers, draw route lines, and handle tap, pan and zoom. It does not need
custom cartography, 3D terrain, or heavy styling.

## Options

### react-native-maps

Uses the platform's own map — Apple Maps on iOS, Google Maps on Android. The
Expo team supports it directly. Provides `Marker` and `Polyline` components,
which between them cover every requirement in the PRD.

Cost: no charge for displaying mobile maps at this scale. Android needs a
Google Maps API key, which is free to obtain.

Against it: the base map looks like the platform's map, because it is. Limited
styling control.

### MapLibre GL Native

Open source, no API key, no vendor account, full vector styling control.

Against it: you must supply your own vector tile source, which means either a
hosted tile provider — another account, another free tier to track — or
self-hosted tiles, which is a project in itself. Setup is meaningfully longer.

### Mapbox

Excellent maps and strong developer experience.

Against it: requires an account with a monthly-active-user free tier. Adds a
billing relationship and a usage ceiling to a project with no revenue. See
[ADR-0004](./adr-0004-storage-and-costs) on why that matters more than it
appears.

## Decision

**react-native-maps.**

It is the shortest path from nothing to a working map, it is the option Expo
supports best, and its limitation — an unstyled base map — costs this project
nothing. Nobody evaluating the app will care that the basemap is Apple's.

## Consequences

**Good:** minimal setup. Familiar map behaviour. No usage ceiling, no billing
relationship, one API key.

**Bad:** iOS and Android look different, because they are different maps. The
route line and markers are ours, but the roads and labels underneath are not.

**Also:** Google's mobile Maps SDK terms are free for map display at present,
but terms change. Confirm current pricing before relying on it for anything
with real volume. At this project's scale the question is academic.

## Revisit if

The app needs a distinctive visual identity, or needs to run on the web, where
MapLibre becomes the stronger choice.
