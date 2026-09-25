---
sidebar_position: 8
title: Release notes
---

# Release notes

## Unreleased

Built to the [app design](https://github.com/sarahrittertech-commits/Bike-Path-Adventures-Map-Design)
on 18 September 2026 and verified in the iOS Simulator. Not yet on a phone.

- Expo SDK 57 app with react-native-maps on Apple Maps
- Trail map: paved path and dotted connectors, landmark labels, trailheads
- Category rail with five categories; pins and a mile-ordered list in a
  draggable bottom sheet; tap a pin for its detail
- Adventures tab: nine curated rides with photos, stats, story and
  stop-by-stop notes; "Show route on map" overlays the ride with numbered stops
- Real Brevard data: 28 destinations, 4 network segments, 12 landmarks
- Validator, unit tests (UT-1 to UT-5), ESLint and CI

Known gaps:

- Network geometry is traced rather than surveyed — the bridge connector's
  stated 0.9 mi draws as 0.43 mi (DT-7 warns about this).
- A selected pin does not centre in the strip of map above the sheet. Measured
  on an iPhone 17 Pro Max it sits about 54pt low, tip touching the sheet edge,
  where the arithmetic in `TrailMap` says it should be centred. The cause is not
  the pin-height offset or the zoom fence, both ruled out; the likely suspect is
  assuming `animateToRegion` keeps the `latitudeDelta` it is given. Cosmetic —
  the pin is visible and tappable — and deliberately left for after ship, since
  the fix means reworking the camera maths to use `fitToCoordinates` with
  `edgePadding`.
- No Android Google Maps key yet, so Android builds outside Expo Go show no map.

Landmark labels colliding downtown was listed here and is fixed (56be230);
verified on a 6.9" screen on 25 September 2026.

---

## Planned releases

### v0.1.0 — First build on a phone

Target: week of 22 September 2026

Everything above installed on a real iPhone through EAS. This is the
throwaway build from ADR-0001, done for real: its job is to find signing and
configuration problems. Needs the Apple Developer membership.

### v1.0.0 — Ship

Target: 30 September 2026

**Submitted to the App Store.** The Women in AI challenge requires submission by
30 September 2026 — submission, not approval, since App Review's timing is not
ours to control.

Also: data corrections from riding the routes, MT-1 to MT-6 passing on a
physical phone, `validate:release` green, release notes, and the repository
public (which the [App Store listing](./app-store-listing) URLs now depend on).

R9 (offline) is already satisfied by bundling the data. Android ships in 1.0
only if a Google Maps key is set up and an APK is tested; it is not on the
critical path.
