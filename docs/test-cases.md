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

| ID | Unit | Assertion |
| --- | --- | --- |
| UT-1 | Route lookup | Returns the same route for A→B and B→A |
| UT-2 | Route lookup, reversed | B→A returns geometry in reverse order |
| UT-3 | Route lookup, missing | Returns null, does not throw |
| UT-4 | Ride time estimate | 1.0 miles at casual pace returns 6–8 minutes |
| UT-5 | Category filter | Filtering to one category returns only that category |
| UT-6 | Category filter, none selected | Returns all destinations, not none |

UT-6 is listed because "no filters selected" returning an empty map is a classic
off-by-default bug.

## Manual — on a real device

Run before every release. A simulator does not count.

| ID | Steps | Pass condition |
| --- | --- | --- |
| MT-1 | Cold launch | Map visible with markers in under 3 seconds, no signup |
| MT-2 | Tap any marker | Name, category and description shown; panel dismisses cleanly |
| MT-3 | Select start and end, view route | Route drawn on map, distance and time shown |
| MT-4 | UC-4: bike shop → trailhead | Route is correct and matches local knowledge |
| MT-5 | Filter to one category | Only that category's markers remain |
| MT-6 | Clear all filters | All markers return |
| MT-7 | Rotate device | Layout survives, map keeps its position |
| MT-8 | Airplane mode, then cold launch | Map data and markers still load (R9) |
| MT-9 | Pinch to zoom out fully, then back in | No crash, markers re-render |

## Release gate

A release requires: all DT and UT tests green, and MT-1 through MT-6 passing on
a physical phone. MT-7 through MT-9 are recorded but do not block.

## What is not tested

Stated so the gaps are deliberate rather than accidental:

- No cross-platform testing beyond the one device used to build
- No accessibility audit
- No performance testing beyond "does it feel slow"
- No automated UI testing — the manual list above covers it at this scale
