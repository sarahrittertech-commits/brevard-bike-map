---
sidebar_position: 8
title: Release notes
---

# Release notes

## 1.0.1 — unreleased

### The Oskar Blues spur

Surveyed on 30 September 2026 by riding the north half of the network with
the camera on. 111 of the 125 photos carry EXIF coordinates, which makes them
a GPS trace of the ride rather than an illustration of it.

- **Oskar Blues was unreachable.** Nothing in `src/data` came closer to it
  than 1,969 ft, although it is a stop on both Taproom Traverse and End to
  End. The new `oskar-blues-spur` connector runs from the path out to the
  taproom, and both routes now ride it and come back. This is MT-4.
- **Oskar Blues moved 354 ft.** Its recorded coordinate sat in the field
  behind the taproom. IMG_5211 is the entrance sign; Google's listing for
  342 Mountain Industrial Dr agrees with it to within 263 ft.
- **Connectors now read 4.2 mi** rather than 3.8 in the sheet's trail facts,
  because there is one more of them.
- **A fourth repair stand.** IMG_5209 shows a pump-and-tools stand and a bike
  rack at the taproom door, 16 ft from the spur.
- **Broad St Crossing.** The path has two signalled road crossings and only
  Lowe's was labelled. The southern one, where the path crosses N Broad St /
  Hwy 64 at Osborne Rd by Blue Ridge Community College, now is too
  (IMG_5186).

Three photographs confirm the spur independently of the gap that suggested it:
IMG_5203 is the right turn off the Estatoe Trail, IMG_5224 the turn back on to
it, and IMG_5209 the rack at the far end. The junction they agree on is within
40 ft of the vertex the trace implied.

### Five destinations were in the wrong place

Sarah identified what each photo shows, which turned the trace into a check
on the dataset. Every move below is a photo of the building plus Google's
listing for the address the description already carried, agreeing to within
a few hundred feet.

| Place | Was out by | Now |
| --- | --- | --- |
| The Hub & Pisgah Tavern | 4,108 ft | mile 4.2, off the bridge connector |
| Ecusta Brewing | 3,447 ft | mile 3.2, near the Ecusta Rd end |
| Dolly's Dairy Bar | 466 ft | mile 4.2, 212 ft past The Hub |
| Oskar Blues | 354 ft | mile 2.5, at the end of the new spur |
| Jameson's Joy | 342 ft | mile 2.4, unchanged — see below |

Mile markers moved only where the coordinate moved far enough to mean it.
Jameson's Joy kept 2.4 although the geometry computes 2.6, because the drawn
path is 800 ft from the park there — that number describes the trace, not the
playground.

The Hub was the expensive one. Its coordinate sat 0.8 mi up the forest
connector, so Taproom Traverse and Bracken both *started* there and Gateway
to Pisgah *ended* there — three rides running most of a mile to a point that
was never The Hub. All three now begin or end at the building.

### What the survey found and did not fix

The traced network is further off than 1.0.0 recorded. Along the stretch that
was ridden, the drawn main path sits 400–1,000 ft from where the ride actually
went, and the northern leg past Dolly's to the forest is out by 1,300–5,100 ft.
The spur therefore has to cross 1,000 ft of that gap to reach the path at all,
which is why it draws 0.48 mi against a real 0.4.

The drawn network is also too coarse to wind. The path is a leisurely
exercise trail that meanders and happens to get around town, not a transport
link, and the geometry carries a vertex every 475 to 1,247 ft — the forest
connector has eleven points for 2.36 mi. The measure of what that loses: over
the 0.9 mi from the ball fields to Dolly's, the ride wandered up to 1,096 ft
off the straight line between its two ends. A polyline this sparse cannot
describe that, so it draws the wrong kind of thing.

The spur added here is the worst of them, 1,341 ft of straight line across a
gap in the photographs. It is left that way deliberately. Redrawing one
segment in detail would make the rest look worse by contrast, and the 111
points from this ride only cover the north half, so a retrace would leave the
map fine-grained above the ball fields and blocky below it. It is the same
job as the drift: one pass with the centreline, not a patch.

The pattern behind all four is that coordinates were placed against the drawn
line rather than the ground: `dollys` was byte-identical to the connector
join, and `repair-depot` and the `ball-fields` landmark still are. The rest
of the dataset has not been checked, because the ride only covered the north
half — every downtown destination is more than 5,000 ft from the nearest
photograph.

None of this is fixed here. The honest repair is the town GIS centerline that
[the data model](./data-model) has always called for, not another trace.

---

## 1.0.0 — submitted 25 September 2026

**Submitted to the App Store on 25 September 2026**, five days ahead of the
30 September deadline, and awaiting App Review. App Store Connect app
`6816144426`, build 3, free, United States only.

The Women in AI challenge asked for an app submitted to the App Store by
30 September. That is done. Approval is App Review's timing, not ours.

Built to the [app design](https://github.com/sarahrittertech-commits/Bike-Path-Adventures-Map-Design)
on 18 September 2026. Run on a physical iPhone on 25 September 2026, with MT-1
to MT-6 passing, and submitted to the App Store the same day.

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
  Measured against a GPS ride on 30 September it is out by 400–5,100 ft
  along the stretch that was ridden; see 1.0.1 above.
- A selected pin does not centre in the strip of map above the sheet. Measured
  on an iPhone 17 Pro Max it sits about 54pt low, tip touching the sheet edge,
  where the arithmetic in `TrailMap` says it should be centred. The cause is not
  the pin-height offset or the zoom fence, both ruled out; the likely suspect is
  assuming `animateToRegion` keeps the `latitudeDelta` it is given. Cosmetic —
  the pin is visible and tappable — and deliberately left for after ship, since
  the fix means reworking the camera maths to use `fitToCoordinates` with
  `edgePadding`.
- No Android Google Maps key yet, so Android builds outside Expo Go show no map.
- **The app icon's ridgelines read as water, not mountains.** That is the real
  complaint and it is correct: blue plus sinuous S-curves is how water is drawn,
  while mountains read through angular peaks and green or earth tones. The icon
  has neither — the ridges are `#2C6BA8` and `#9DBFE3`, and the bike is purple
  `#3F3794`, none of which appear anywhere else in the app.

  Secondary: the artwork sits low, 36% empty above it against 12% below, where
  centred would be about 24% each side. Nothing is clipped by the iOS mask.

  Both came from the design rather than having drifted. Deferred to 1.0.1
  because the icon lives in the binary, so changing it means another build.

  **Direction for 1.0.1: Sarah is sourcing line images.** Not a recolour of the
  existing artwork. When the art arrives, the [runbook](./runbook) lists every
  asset that has to be regenerated together — the three iOS appearances, the
  fallback icon, the three Android adaptive layers and the launch screen — and
  the trap that the light and tinted iOS variants must have no alpha channel or
  submission is rejected.

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
