---
sidebar_position: 9
title: Build history
---

# Build history

One entry per build number. [Release notes](./release-notes) describe each
version in detail; this page records what each EAS build contained, which
commit it came from and what happened to it. Preview and simulator builds
share the number of the store build they were testing.

Bike Brevard Kids has no build yet. Its first `kids-production` build needs
Sarah's interactive Apple login to create the provisioning profile.

## 1.1.0

### Build 9 — 21 October 2026 · App Store

Production, commit `55f017d`, tag `v1.1.0`. Submitted by Sarah, processing at
Apple. The clean release build: every finding from the pre-release code review
fixed, lint, UT-1 to UT-9 and the data validator passing.

- Closing a place's card returns the sheet to peek, so the next pin tap lands.
- The hidden sheet no longer blocks dragging and zooming the map.
- A tapped place is measured on screen and centred in the part of the map the
  card leaves visible.
- "‹ Back to list" on a place opened from the list; × closes the card.
- One real "Turn on location to ride here" button replaces the grey look-alike.
- Tap a card's title or the list header to slide it up or down; a slid-down
  title keeps to one line.
- The rail's clear button is a circled ×, faded until a category is on.
- CykelWorx moved downtown to 72 S Broad St.
- Expo 57.0.31 and expo-location 57.0.22.

### Build 8 — 21 October 2026 · TestFlight and phone previews

Production `d5d6f02` to TestFlight. Phone previews from `d5d6f02` and
`6958277`, plus one simulator build for screenshots. A second preview from
`55f017d` was cancelled to save a paid build.

- **Ride to here:** distance and minutes from the rider, and the way there
  along the drawn network at 7 mph. ADR-0003 revised.
- Location is explained in the app before iOS asks.
- Restaurants pulled from 1.1 in both apps; the [roadmap](./roadmap) brings
  them back in stages.
- Weevil Outdoor (renamed) and Sycamore Cycles reached by their own links.
- Distance only shows inside Brevard.

Added in the `6958277` preview, from Sarah's testing of build 8:

- Cards sized to their content, larger text, a full-width 56 pt Ride to here.
- Bigger pin hit areas and a calmer zoom on tap.
- Solid gray connectors instead of green dots; a 9 pt route line.
- Following an adventure: no bottom card, an expandable header that lists the
  stops and marks NEXT, tappable numbered stops.
- The "Getting around" card can be closed.
- The map fills more of the screen.
- New palette: walnut routes, caramel breweries, a green slide for
  playgrounds, magenta then orchid ice cream, blue bike shops, orange repair.
- Map layers no longer redraw on every tap, the likely cause of the lag.

### Build 7 — 20 October 2026 · TestFlight

Production, commit `3dd7913`. The first 1.1.0 build Sarah tested on her phone.

- Fixes from a full code review: a location fix applied after location was
  turned off, an unhandled link promise, the hidden sheet read by VoiceOver.
- Brevard Academy removed from the kids data; the Health & Racquet Club moved
  to Sarah's plus code and marked as a teen ride.
- Kids app branding and EAS project merged in (not used by this build, which
  is the map app).

### Build 6 — 20 October 2026 · replaced

Production, commit `e08c007`. Adds the `NSMotionUsageDescription` string that
build 5 lacked. Superseded by build 7 the same evening.

### Build 5 — 20 October 2026 · refused by Apple

Production `ce528cb`, plus a simulator build for screenshots. App Store Connect
refused it with ITMS-90683: `expo-location` contains motion code and the
binary had no motion purpose string.

- The downtown half recorded from the 17 October rides: the real West Main
  trailhead, the Middle School detour, Jordan St to the Library, Gaston St
  Hill, King St Link.
- Pins moved to where they were photographed: Kilwins, Earth Mountain, The
  Yard, the King St row, the Depot.
- Two hopscotches, the Library Repair Stand, and two new adventures (Pisgah
  Short Track Social, Earth Mountain Shop Ride).
- Restaurants with menu links (later pulled in build 8).
- Opt-in "show my location".
- Fits any shape of screen, iPhone Duo included.

## 1.0.1

### Build 4 (preview) — 20 October 2026

Phone preview, commit `364c1b7`, to try the location button and the new
downtown data before 1.1.0.

### Build 4 — 1 October 2026 · App Store

Production, commit `99ea36a`. Released as 1.0.1.

- The Oskar Blues spur, from the 30 September survey ride.
- Oskar Blues moved 354 ft; a fourth repair stand; Broad St Crossing labelled;
  the river pull-off added to Downtown to the River.
- Redrawn app icon and launch screen.
- A simulator build profile for App Store screenshots.

### Build 3 (previews) — 1 October 2026

Five phone previews and two simulator builds while the icon, launch screen and
listing figures were redone.

## 1.0.0

### Build 3 — 25 September 2026 · App Store

Production, commit `8834bed`. Submitted five days ahead of the 30 September
deadline: the Women in AI challenge entry.

- Map of the path and connectors, category rail, pins, list and detail.
- Nine curated adventures with "Show route on map".
- Privacy policy and App Store listing.

### Build 1 (previews, 0.1.0) — 24 September 2026

Two phone previews, `a560dba` and `15c74d8`: the first run on a real iPhone.
The second made a followed route take over the map.

## Android

### Build 2 — 12 October 2026 · not submitted

Production app bundle, commit `677e8e5`, with the Google Maps key from EAS.
Passes MT-A1 to MT-A7 on the emulator. Waiting for a Google Play account.

### Build 1 (previews) — 12 October 2026

Two previews, `919f8c0` and `42941d0`: Android's own splash, adaptive icon,
Google Maps behaviour and the back button.
