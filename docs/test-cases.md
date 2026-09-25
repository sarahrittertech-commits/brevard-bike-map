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

## Automated — unit

Run by `npm test` in CI on every push. These run against `src/lib/select.js`,
which holds the pure selection logic that `src/lib/data.js` binds the bundled
data to. They use fixtures rather than the real dataset, so they assert
behaviour and do not start failing because a cafe closed — the real data is
covered by DT-1 to DT-7 above.

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

## Release gate

A release requires: all DT and UT tests green — `npm run validate:release`
and `npm test` — and MT-1 through MT-6 passing on a physical phone.

**Gate met, 25 September 2026.** MT-1 to MT-6 passed on a physical iPhone
against the ad hoc build of `15c74d8`. The binary submitted to the App Store
was built from `8834bed`; the two differ only in the version string and the
`ITSAppUsesNonExemptEncryption` flag, with no change to any JavaScript, so the
result carries. DT-1 to DT-7 and UT-1 to UT-5 are green in CI on every push. MT-7 through MT-9 are recorded but do not block.

## What is not tested

Stated so the gaps are deliberate rather than accidental:

- No cross-platform testing beyond the one device used to build
- No accessibility audit
- No performance testing beyond "does it feel slow"
- No automated UI testing — the manual list above covers it at this scale
