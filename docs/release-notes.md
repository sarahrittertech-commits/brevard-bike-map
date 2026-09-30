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
- **Connectors now read 3.6 mi** rather than 3.8 in the sheet's trail facts:
  one more of them, but two of the four measured shorter than they claimed.
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

### The network is redrawn from the ride

Sarah exported the rides as GPX. An earlier reading had dismissed these as
hand-drawn, because every timestamp inside each file is identical — but so is
every elevation, which is the Trailforks exporter stripping both rather than
evidence about the recording. The photographs settle it: across 366 recorded
points the median distance from an EXIF photo position to the matching track
is 5 ft, 3 ft and 2 ft. Nothing drawn on satellite imagery matches 111
independent GPS fixes that closely.

The endpoints only looked wrong because the destinations were. The Hub to
campground track begins 4,082 ft from where The Hub was recorded and 130 ft
from where The Hub is. The track was right the whole time.

| Segment | Points | Drawn | Source |
| --- | --- | --- | --- |
| `main` | 28 → 49 | 3.40 → 4.01 mi | traced below Blue Ridge CC, recorded above |
| `oskar-blues-spur` | 4 → 9 | 0.48 → 0.29 mi | recorded |
| `bridge-connector` | 5 → 10 | 0.43 → 0.41 mi | recorded |
| `forest-connector` | 11 → 34 | 2.36 → 2.92 mi | recorded to the campground, traced beyond |

The spur's longest straight falls from 1,341 ft to 431, and the stated
mileages that were guesses become measurements: the spur is 0.3 mi, not 0.4,
and the bridge connector is 0.4, not 0.9. That last one had been the single
DT-7 warning since 1.0.0 and was listed here as a known gap. It was not a
drawing error — the connector is 0.4 mi and the recording says so.
Validation is clean for the first time.

Trailforks' own Estatoe Trail and Brevard Greenway files agree with the rides
to a median of 4 ft and were used only to check the work, so every coordinate
that ships is Sarah's own recording and no third-party licence has to be
carried in the app.

All nine adventure routes are built from network vertices, so all nine were
re-projected: each route vertex located on the old geometry as a segment and
a fraction along it, then re-emitted at the same fraction of the new. Stop
order holds everywhere. Two classes of vertex are held out — a destination's
own coordinate, so stops stay exactly on their places, and anything more than
150 ft off the network, because Bracken's singletrack and Probart St are not
network and snapping them to it drew a 3.2 mile straight line.

Downtown Festival becomes 4.3 mi rather than 3.8. The ride did not change;
the line stopped cutting the corners.

### What is still traced

- **Everything below Blue Ridge Community College.** The ride started there,
  so the downtown half of `main` and all of `downtown-connector` are the
  original trace, as is `forest-connector` beyond the campground. The map now
  reads fine-grained in the north and blocky in the south; the second ride
  fixes that.
- **`main` still says 3.5 mi** while its line now draws 4.01. The drawn
  figure is a lower bound, since the untraced half is still cutting corners,
  and 3.5 is the published length of the path. Worth settling with the town
  rather than by arithmetic.
- **Three destinations are now further from their route than they were** —
  `repair-midpath` 41 → 359 ft, `cyckel-worx` 298 → 651 ft and
  `repair-pisgah` 176 → 287 ft. All three were placed against the traced
  line, the same fault that moved the other five, and none of them has a
  photograph to move it by. They are the first things to check on the next
  ride.
- **`repair-depot`, `ball-fields` and `lowes-crossing` still sit on network
  vertices** rather than on the places they name. `lowes-crossing` is 952 ft
  from the recorded route to the campground, which is the crossing it is
  supposed to mark.
- **Twenty of the twenty-nine destinations are unaudited**, all of them
  downtown, every one more than 5,000 ft from the nearest photograph.

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
