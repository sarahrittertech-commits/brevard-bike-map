---
sidebar_position: 7
title: Test cases
---

# Test cases

A solo build has no code review, so the tests are the safety net. These are
deliberately few and weighted toward the things most likely to break.

## Automated — data integrity

Run by `npm run validate` in CI on every push. These catch the failures that
would be embarrassing in a demo.

| ID | Check | Fails when |
| --- | --- | --- |
| DT-1 | Every destination category resolves to a known Category | A typo in a category slug |
| DT-2 | Every adventure stop's `destination` resolves to a known Destination | A destination is renamed but adventures aren't updated |
| DT-3 | All IDs unique within each file | Copy-paste during data entry |
| DT-4 | All coordinates inside the Brevard bounding box | Latitude and longitude swapped |
| DT-5 | Every adventure has at least two named stops and a drawn route | An adventure is added without its line |
| DT-6 | No placeholder names in a release build | Sample data reaching a release |
| DT-7 | Stated miles plausible against drawn geometry (warning) | A hand-entered distance drifting from the drawn line |
| DT-8 | Every destination within 1,000 ft of the network, or listed in `OFF_PATH` with its reason (warning) | A coordinate placed by eye drifting off the path, as Oskar Blues had at 1,969 ft |
| DT-9 | No destination or landmark sits exactly on a network vertex (warning) | A placeholder pinned to the drawn line instead of surveyed — the shape of every wrong coordinate found in September |

## Automated — unit

Run by `npm test` in CI on every push. These run against `src/lib/select.js`,
which holds the pure selection logic that `src/lib/data.js` binds the bundled
data to. They use fixtures rather than the real dataset, so they assert
behaviour and do not start failing because a cafe closed — the real data is
covered by DT-1 to DT-9 above.

| ID | Unit | Assertion |
| --- | --- | --- |
| UT-1 | `visibleDestinations` | One category on returns only places in that category, ordered by mile marker |
| UT-2 | `visibleDestinations`, none on | Returns an empty list — the map shows just the path by design |
| UT-3 | `displayCategory` | A two-category place draws as whichever of its categories is switched on |
| UT-4 | `adventureStopPins` | Stops without a `destination` are skipped; numbering keeps the original index |
| UT-5 | `toLatLng` | `[-82.73, 35.23]` becomes `{ latitude: 35.23, longitude: -82.73 }` |

UT-2 reverses the earlier assumption: the design treats "no filters" as "just
the path", with the rail's clear button making that explicit.

Each case carries a few related assertions beyond the headline one: UT-1 also
covers merging several switched-on categories, UT-3 that a two-category place
keeps a stable colour whichever order the rail was tapped in, UT-4 that a pin
shows the stop's own wording rather than the destination's name, and UT-5
`lineToLatLngs`. Every assertion was checked by breaking the function it
guards and confirming the test failed.

## Manual — on a real device

Run before every release. A simulator does not count.

| ID | Steps | Pass condition |
| --- | --- | --- |
| MT-1 | Cold launch | Map visible with the path drawn in under 3 seconds, no signup |
| MT-2 | Switch on a category, tap a pin | Name, category, description and mile marker in the sheet; close returns to the list |
| MT-3 | Adventures → detail → Show route on map | Route drawn in clay over the faded network, numbered stops, header shows miles and minutes |
| MT-4 | UC-4: Taproom Traverse | Route is correct and matches local knowledge |
| MT-5 | Filter to one category | Only that category's pins remain; list count matches |
| MT-6 | Just the path button | All pins clear, sheet returns to trail facts |
| MT-7 | Rotate device | Layout survives, map keeps its position |
| MT-8 | Airplane mode, then cold launch | Map data and markers still load (R9) |
| MT-9 | Pinch to zoom out fully, then back in | No crash, markers re-render |

### Android

Run on an Android phone or the emulator in the [runbook](./runbook#android),
with a build that has the Maps key — Expo Go cannot draw the map there.

| ID | Steps | Pass condition |
| --- | --- | --- |
| MT-A1 | Cold launch | Splash is the icon scene in a circle; the map shows streets, the path and the landmarks, with no shops or bus stops on the base map |
| MT-A2 | Switch on ice cream and breweries | Every pin draws with its glyph — none blank — and the list matches |
| MT-A3 | Tap a pin | Sheet shows the place; no Google directions toolbar appears; the camera does not jump to the pin before centring |
| MT-A4 | Look at the bottom-left of the map with the sheet down | The Google logo is visible above the sheet |
| MT-A5 | Back button: select a pin, then press back four times | Place closes, then the sheet collapses, then — while following a route — the route clears, then the app exits |
| MT-A6 | Back button from Adventures and from a ride's detail | Detail returns to Adventures; Adventures returns to the map |
| MT-A7 | Home screen icon, and with themed icons on (Android 13+) | Icon is the new ridges-and-bike art, whole under the launcher's mask; the themed version reads as the bike and ridges |

**Run 12 October 2026 on the emulator in Expo Go, so without the map:**
MT-A5 and MT-A6 pass; MT-A4 passes, the logo sitting just above the sheet.
MT-A1 to MT-A3 cannot be run until the key exists.

**Then on the first EAS APK (build 1, `919f8c0`), on the emulator:** MT-A7
passes on the Pixel launcher's circle mask. The splash half of MT-A1 passes —
the scene in a circle on cream. The app then crashes, because that build has no
Maps key; that is what the key is for, and why keyless Android builds are now
refused.

## Release gate

A release requires: all DT and UT tests green — `npm run validate:release`
and `npm test` — and MT-1 through MT-6 passing on a physical phone.

**Gate met, 25 September 2026.** MT-1 to MT-6 passed on a physical iPhone
against the ad hoc build of `15c74d8`. The binary submitted to the App Store
was built from `8834bed`; the two differ only in the version string and the
`ITSAppUsesNonExemptEncryption` flag, with no change to any JavaScript, so the
result carries. DT-1 to DT-9 and UT-1 to UT-5 are green in CI on every push. MT-7 through MT-9 are recorded but do not block.

**MT-4 was passed in error.** It was signed off on the phone against the
drawn route, which looked plausible, rather than against the ground. Riding
it on 30 September 2026 showed the Taproom Traverse line never went to Oskar
Blues at all — the closest it came was 1,969 ft, and the numbered stop hung
off the end of nothing. Fixed in 1.0.1. The lesson for this table is that
"matches local knowledge" cannot be checked from the sofa; MT-4 needs the
route ridden, not read.

## What is not tested

Stated so the gaps are deliberate rather than accidental:

- No Android testing on a physical phone yet; the emulator only, and without
  the map until the key exists
- No accessibility audit
- No performance testing beyond "does it feel slow"
- No automated UI testing — the manual list above covers it at this scale
