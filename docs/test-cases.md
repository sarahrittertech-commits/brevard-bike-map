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
| DT-10 | Each app holds together on its own: every place's categories and every ride's stops exist in that app, and Bike Brevard Kids shows no brewery, taproom, tavern, beer or wine wording | A kids ride stopping at a taproom, or a shop still labelled "& Brews" in the kids build |
| DT-11 | A stop's own `coordinates` are `[lon, lat]` in Brevard and within 500 ft of its ride's route (warning); a stop's `photo` exists in `assets/stops/` and in `stopImages` | A sculpture pinned across town, or a photo that would crash the bundle |
| DT-12 | Walking every ride in both apps every ~50 ft, as the app tracks a rider, NEXT never goes back and names every pinned stop after the first; every stop fits its route in itinerary order | A stop list out of order with the drawn route, or a NEXT that skips or runs backwards (the 1.1.1 review found both) |
| DT-13 | Every road crossing is within 200 ft of the network | A "Cross here" warning for a road the path does not meet |

## Automated — unit

Run by `npm test` in CI on every push. These run against `src/lib/select.js`,
which holds the pure selection logic that `src/lib/data.js` binds the bundled
data to. They use fixtures rather than the real dataset, so they assert
behaviour and do not start failing because a cafe closed — the real data is
covered by DT-1 to DT-12 above.

| ID | Unit | Assertion |
| --- | --- | --- |
| UT-1 | `visibleDestinations` | One category on returns only places in that category, ordered by mile marker |
| UT-2 | `visibleDestinations`, none on | Returns an empty list — the map shows just the path by design |
| UT-3 | `displayCategory` | A two-category place draws as whichever of its categories is switched on |
| UT-4 | `adventureStopPins` | A stop is pinned by its own `coordinates`, else its `destination`'s; stops with neither are skipped; numbering keeps the original index |
| UT-5 | `toLatLng` | `[-82.73, 35.23]` becomes `{ latitude: 35.23, longitude: -82.73 }` |
| UT-6 | `isNearArea` | A position in town counts as near the map; Asheville, and a swapped `[lat, lon]` reading of Brevard, do not |
| UT-7 | `forApp` | Each app keeps only its own items and reads its own wording, stops included; neither `apps` nor the overrides reach the screens |
| UT-8 | `buildRouteGraph`, `routeOnGraph` | The way between two points follows the drawn lines, joining line ends within 200 ft |
| UT-9 | `placeStops`, `riderAlong`, `trackAlong`, `nextStopIndex` | A loop's last stop is placed at the end, not the start it sits beside; on an out-and-back drawn over itself, NEXT goes 1, 2, 3 and never back; a small step back is GPS wobble |
| UT-10 | `progressAlong` | A ride split at the rider into the part ridden and the part ahead, which meet at the rider and add up to the whole way |
| UT-11 | `crossingPasses`, `rideItinerary` | A crossing goes before the stop past it; a ride drawn one way lists its crossings again for the way back; a loop that passes one twice lists it twice and has no separate way back |

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
| MT-7 | Rotate device to landscape on the map, then on Adventures and a ride's detail | Header and sheet dock to a column on the left, the rail on the right is never overlapped (two columns if it would be), the route fits between them; text and buttons clear the Dynamic Island side; rotating back restores the bottom sheet |
| MT-8 | Airplane mode, then cold launch | Map data and markers still load (R9) |
| MT-9 | Pinch to zoom out fully, then back in | No crash, markers re-render |
| MT-10 | iPhone Duo: closed, open flat, open upright, half folded both ways | Nothing under the side bars or camera; open and upright, the sheet's open edge sits on the fold; open flat, the docked column ends before the fold. See the [iPhone Duo review](./iphone-duo-design-review) |
| MT-11 | Fresh install, tap the location button; decline. Tap again. Then allow it in Settings and tap again; tap once more | No prompt before the first tap. The first tap shows the app's own explanation: Not now ends there, Continue brings the system prompt. Declining that shows nothing more; the second tap offers Settings. Allowed, the dot appears and the map centres on it (in Brevard) or says you're outside Brevard; the last tap removes the dot. Settings shows only "While Using the App" |
| MT-12 | Location off: switch on ice cream, open Dolly's | "Distance from you" and "Ride to here" greyed, "Location sharing is needed to calculate a ride" and a "Turn on location sharing" link; the link turns location on and the card shows "N mi from you · about N min by bike" without closing |
| MT-13 | Ride to here from downtown to Dolly's, then close it | Dolly's, the blue dot and the way between, drawn along the path in walnut; the header says "Riding to" with miles and minutes; close returns to the list as it was |
| MT-14 | Ride to here, then ride part of the way | The way stays where it was drawn: the part ridden turns faint behind the dot and the part ahead stays bold; the header says "N of M mi to go". At the place it says "You're here" |
| MT-15 | Ride to here, then switch on playgrounds | Playground pins appear round the way; the ride carries on |
| MT-16 | Switch on a category | Its pins show on the map; the list stays at the bottom until it is tapped or slid up |
| MT-17 | Follow an adventure, tap stop 1, then the › arrow beside the note to the last stop and back with ‹ | Each stop opens in the sheet; a stop with a place or a location of its own moves the map to it; scenery stops open too; the arrow is hidden at each end |
| MT-18 | Location on, choose Allow Once. Put the app away, come back, tap the location button | The rail's button is off when the app returns; the app's explanation is not shown again in the same session; the system asks again |
| MT-19 | Tap the same place pin, close it, tap it again, five times; then the same with a numbered stop | Opens every time |
| MT-20 | Fresh launch, tap the "Getting around" card | Besides the path and connectors, it says what the Trail Map tab is for and what an Adventure is (UC-13) |
| MT-21 | Switch on Ice Cream, open Dolly's, then drag the map to downtown and pinch in on the pins there | The map pans and zooms freely while a place is open; the downtown pins separate enough to tap Kilwins (UC-12) |
| MT-22 | Switch on Ice Cream, slide the list up, tap Sunset Slush; back to list, tap Kilwins | Each time the map moves to the tapped place and its pin sits in the clear map above the card (UC-12) |
| MT-23 | With a place open from the list, look at how much map is left above the card | Enough map shows to see the place in relation to the path, not a strip at the top of the screen |
| MT-24 | Fresh launch, switch on Ice Cream, tap Rocky's pin. With its card open, drag and pinch to downtown and tap Sunset Slush's pin | The map pans and zooms behind the open card; each tapped pin opens its card and the map recentres on it (UC-12) |
| MT-25 | Switch on Ice Cream, slide the list up, tap White Squirrel Arcade, Ride to here. Then pinch, zoom and drag the map | The way is drawn; the map moves freely so the streets on the way can be read; the ride and its header stay (UC-14) |
| MT-26 | While riding to White Squirrel Arcade with Ice Cream on, switch on Breweries | Brewery pins appear on the map round the way, as MT-15 does for playgrounds; the ride carries on (UC-14) |
| MT-27 | For each pin in a category, compare where it stands with the place on the ground or its street address | Every pin is on its own building or entrance, not a block away |
| MT-28 | For every place in the map app, one at a time: switch on its category on the rail, tap its pin, read the card, tap Ride to here. Checklist below | The card shows the right name, category, description and mile marker; Ride to here draws the way to the pin; the pin is on the place (MT-27); the pin opens at the first tap (F-12) (UC-11) |
| MT-29 | Ride to here to a place, switch on another category, tap one of its pins, close its card. Run for every place × every other category | The other category's pins appear; the tapped pin's card opens; closing it leaves the ride as it was (UC-15) |
| MT-30 | Adventures → open one → back; open another → Show route on map; open and collapse the header card; tap each numbered dot | Back returns to Adventures. The number of dots equals the "N stops" the header shows. Each dot opens its stop at the first tap (UC-16) |
| MT-31 | For every adventure, compare each stop with the ground | Every stop is a place a rider can reach and stop at from the route. A road crossing is not a stop (UC-16) |
| MT-32 | Zoom the map in on part of town, then switch on a category | Pins appear without the map moving or zooming out; the list count covers every place, including those off screen |
| MT-33 | Switch on Playgrounds. Pan left, right, up and down, then pinch in on Silvermont, Franklin Park, Silversteen Park and The Yard in turn, opening and closing each card; pinch further in on The Yard | The map follows every drag and pinch, with or without a card open, and never snaps back on its own (UC-12) |
| MT-34 | Location off. Switch on Breweries and slide the list up | The list header gives miles from the W Main St trailhead, and each row's miles are along the path from there |
| MT-35 | Location on and allowed, in Brevard. Switch on Breweries and slide the list up | Each row's miles are from the rider, and the header says so ("from you") rather than from W Main St. Turning location off returns to MT-34 |
| MT-36 | Any category, list open, with places whose miles have one and two digits | The miles sit in one right-aligned column beside each row's button, so they read straight down the list |
| MT-37 | Switch on Breweries, zoom to the three King St pins (Noblebräu, Griffon & Sphynx, Squatch). Open one, then tap each of the others in turn, with and without closing the card between | Every tap opens the pin tapped, first time, whether or not a card is already open (UC-12) |
| MT-38 | Open Griffon & Sphynx's card, and any place whose name has "ff", "fi" or "fl" | The title's letters look like the rest of the font: no joined or slanted f's |
| MT-39 | Follow Ride to a Downtown Festival | Starts at Jameson's Joy, ends at "Downtown" on W Main; no Mid-Path Fix-It Stand or Rocky's stop; header says 3.1 mi, 25 min; every stop has a dot (MT-30); once F-18 is built, a cone at each crossing and a sign at the detour, none numbered |
| MT-40 | Follow Downtown to the River, open the stop list; then follow Earth Mountain Shop Ride | No cones on the map. The header says "5 stops · 5 crossings"; the list puts "Cross here · <road>" with a cone between the stops in riding order, and again, reversed, under "On the way back". Earth Mountain has no crossings, so no count and no rows |
| MT-41 | Follow an adventure (Show route on map). Tap each numbered stop in turn without closing the card between; then close it and tap each again; then pan and zoom and tap again | Every tap opens that stop's card at the first try, the map moves to it, and the brown route stays drawn (UC-15) |
| MT-42 | Following an adventure, switch on a category, tap a place pin along the route, close its card, tap a numbered stop, then another place pin | Each card opens at the first tap; closing a place's card returns to the followed ride, not the plain map; the route stays (UC-15) |
| MT-43 | Ride to here to a place, switch on another category, tap one of its pins near the way | Its card opens and the ride carries on underneath — or, while F-7 stands, the app makes clear the pins are for looking only. Never a tap that silently does nothing (UC-15) |
| MT-44 | Following an adventure, open a place's card and tap Ride to here; then end the ride | The ride replaces the adventure's route; ending it leaves a clean map with no card stuck open and no route left behind |

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

**Then on build 2 (`42941d0`, with the key), on the emulator: MT-A1 to MT-A7
all pass.** The map draws with the path, dotted connectors, landmarks and no
shop or bus-stop clutter. All 29 pins draw with their glyphs, none blank. A
tapped pin opens with no Google toolbar and lands centred in the strip above
the sheet — closer than iOS, where the 1.0.0 notes record it 54pt low. Back
works by key and by the swipe gesture. MT-3 passes too: Playground to Dolly's
draws in clay with stops 1–4.

One cosmetic note, shared with iOS rather than Android's own: at this width the
path plus its labels does not quite fit, so the westernmost label (Music
Center) runs off the left edge and Ball Fields sits under the category rail.
iOS clipped Pisgah Entrance and Lowe's Crossing under the rail the same way;
both labels were removed on 23 October 2026.

### MT-28 checklist — every place, one by one

The Bike Brevard Map's 36 entries across five categories, taken from
`src/data/destinations.json` on 23 October 2026. A place in two categories
(The Yard, Squatch, Weevil, The Hub) is run once from each, because the card
and pin colour change with the category. Restaurants are switched off in this
app, and Bike Brevard Kids has its own places, so neither is listed here. An
agent running this should read the list from the data file rather than this
table, which goes stale when a place is added.

| Category | Place | Build 10 |
| --- | --- | --- |
| Ice Cream | Sunset Slush |  |
| Ice Cream | Brevard Downtown Chocolates |  |
| Ice Cream | The Yard |  |
| Ice Cream | Rocky's Grill & Soda Shop |  |
| Ice Cream | Kilwins | Pass |
| Ice Cream | White Squirrel Arcade | Fail (F-5) |
| Ice Cream | Dolly's Dairy Bar |  |
| Playgrounds | The Yard |  |
| Playgrounds | Flower Hopscotch |  |
| Playgrounds | Robot Hopscotch |  |
| Playgrounds | Silversteen Park |  |
| Playgrounds | Brevard First United Methodist | Fail (F-13) |
| Playgrounds | Franklin Park |  |
| Playgrounds | Silvermont Mansion & Park |  |
| Playgrounds | Jameson's Joy (Ninja Park) |  |
| Breweries | Broad Street Wines |  |
| Breweries | The Map Room at D.D. Bullwinkel’s |  |
| Breweries | Brevard Brewing Company |  |
| Breweries | Noblebräu Brewing · 185 King Street |  |
| Breweries | Griffon & Sphynx |  |
| Breweries | Oskar Blues (Tasty Weasel Taproom) |  |
| Breweries | Ecusta Brewing Company |  |
| Breweries | Squatch Bikes & Brews |  |
| Breweries | Weevil Outdoor |  |
| Breweries | The Hub & Pisgah Tavern |  |
| Bike Shops | Earth Mountain |  |
| Bike Shops | CykelWorx |  |
| Bike Shops | Sycamore Cycles | Fail (F-12) |
| Bike Shops | Squatch Bikes & Brews | Pass |
| Bike Shops | Weevil Outdoor |  |
| Bike Shops | The Hub & Pisgah Tavern |  |
| Repair Stations | Railroad Depot Repair Stand |  |
| Repair Stations | Library Repair Stand | Pass |
| Repair Stations | Mid-Path Fix-It Stand |  |
| Repair Stations | Oskar Blues Repair Stand | Card and recentre pass; ride not run |
| Repair Stations | Pisgah Forest Repair Stand | Fail (F-12) |

### MT-29 — the permutations

36 entries (the MT-28 checklist) as the ride's destination × the other four
categories switched on during the ride = 144 runs, before tapping any
particular pin. That is too many to do by hand, which is the point: this is
the first case written for an agent to run. Two parts to it:

- **Which pins show during a ride** is logic, not screen, and can become a
  unit test against `src/lib/select.js` that loops over every combination.
- **Tapping a pin mid-ride** needs something that drives the app on a phone
  or simulator. The project has no UI automation today ("What is not tested"
  below), so choosing one is a decision still to make.

## Open findings — walkthrough 23 October 2026

Sarah talked through 1.1.0 build 10 on her iPhone, the build App Review
approved on 21 October. Fixes may land on the branch while the walkthrough is
still going, so each finding needs rechecking against the next build before
it is closed.

The walkthrough also records how Sarah tests, not just what broke: the MT
cases it adds are written as exact steps and a checkable result, so they can
later be handed to agents that run every scenario she wants covered.

| ID | Found | Expected | Test |
| --- | --- | --- | --- |
| F-1 | The "Getting around Brevard by bike" card explains the connectors but not what the Trail Map tab or an Adventure is | If it is the onboarding, it says a line about each | MT-20 |
| F-2 | Switching on Ice Cream opened the list of seven stops straight away | The sheet stays down and the pins come first; each pin opens its own card | MT-16 (fails) |
| F-3 | With Dolly's open, the map could not be dragged up or zoomed to reach Kilwins and the other pins bunched downtown | The map pans and zooms while a card is open | MT-21 |
| F-4 | Tapping Sunset Slush in the list opened its card but the map did not move to it | The map centres on the place | MT-22 |
| F-5 | White Squirrel Arcade's pin is in the wrong place (it sits by the courthouse; the shop is at 40 N Caldwell St) | Pin on the shop. Sarah is sending the right location from the shop in another chat. The validator cannot catch this: the pin is near the path, just not on the building | MT-27 |
| F-6 | Riding to White Squirrel Arcade with Ice Cream on, switching on Breweries lit the rail button but no brewery pins appeared | Brewery pins appear round the way | MT-26, MT-15 |

Note on F-4: the code does centre a selected place (`TrailMap.js`, the effect
that measures the pin and moves the map), so either the build predates it or
it ran and the result was not visible. In the screenshot the pin is in the
thin strip of map above a tall card, which may read as "didn't move". MT-23
records that separately.

**Second pass, same build, fresh launch:**
- MT-24 passes: with Rocky's card open, the map panned and zoomed to downtown, and Sunset Slush's pin opened and recentred. So F-3 did not reproduce on a fresh launch. It may only happen after another step (in the first pass, the list had opened by itself, F-2), so it stays open until the steps that cause it are found.
- MT-25 passes: during the ride the map pinches, zooms and drags, which is how Sarah read which streets to take.
- MT-26 fails: F-6.
- Without a ride, switching category with a card open works: White Squirrel
  Arcade's card, then Downtown Chocolates, then Bike Shops all showed their
  pins. So F-6 happens only during Ride to here.

**Basic pass, same build:** MT-28 run for Kilwins: Ice Cream on, Kilwins'
card, Ride to here drew the way. Pass.

**Third pass, same build — rides and adventures:**
- MT-30 back button: Adventures → detail → back returns to Adventures. Pass.
- Following Downtown to the River, the header card opens and collapses.
  Pass.
- F-8 to F-11 below.

| ID | Found | Expected | Test |
| --- | --- | --- | --- |
| F-7 | During Ride to here, other places' pins cannot be tapped. The current code does this on purpose (`TrailMap.js` makes pins untappable while riding, and `MapScreen.js` ignores a tap) | Sarah expects to read other places mid-ride (UC-15). A design decision to revisit, not a slip | MT-29 |
| F-8 | Following Downtown to the River, stop 1's dot took several tries to open | Opens at the first tap. Similar to MT-19, which covers repeat taps | MT-30 |
| F-9 | Downtown to the River says six stops but shows only dots 1 and 3 | Six dots. Cause found in the data: stops 2, 4, 5 and 6 (Lowe's Crossing, Sycamore Flats, River Pull-Off, Davidson River Campground) have no `destination` and no `coordinates`, so there is nothing to place, and they are skipped without a word (UT-4). The validator should warn when a stop has no location. Screenshot, 12:40: header reads "6 stops · next: 3" with dots 1 and 3 only; the line runs on to the Davidson River with no dot at its end, where the campground turnaround should be. "next: 3" skips stop 2 because it has nowhere to be | MT-30 |
| F-10 | Lowe's Crossing is listed as stop 2, but it is where the path crosses the road, not a stop | Take it out of the stops. Sarah suggests showing road crossings as their own marker (a cone or warning sign, "Cross here") — that is a new feature, so it needs a scope decision before it is built | MT-31 |
| F-11 | Stop 4, Sycamore Flats' picnic tables, cannot be reached from the path's side of the river | Keep the stop, at Sarah's location (35.275361, -82.713944), and say the river has to be swum to reach the tables — decided by Sarah 23 October, replacing "remove the stop". Done in the data | MT-31 |

**Fourth pass, same build — repair stations and playgrounds:**
- MT-32 passes: zoomed in, switching on Repair Stations showed the pins at
  that zoom and the sheet said five stops. Sarah: "a decent behaviour".
- List to map works: scrolling the list and tapping Oskar Blues Repair Stand
  recentred on it. MT-22 passes here, so F-4 may be fixed or may only happen
  with some places; recheck with Sunset Slush.
- Ride to here started to Library Repair Stand and to Squatch. Pass.
- MT-33 passes: playgrounds panned and zoomed freely. F-3 has not happened
  again since the first pass.

| ID | Found | Expected | Test |
| --- | --- | --- | --- |
| F-12 | Several pins take more than one tap to open: Pisgah Forest Repair Stand and Sycamore Cycles; Weevil's opened first time. Same symptom as F-8 on adventure dots, so probably one cause | Every pin and dot opens at the first tap | MT-28, MT-19 |
| F-13 | Brevard First United Methodist's card says the playground is open to the public after 12pm Monday to Friday | It is open to the public on Saturday too. Saturday's hours are needed before the card and `hours` change | MT-28 |

**Fifth pass, same build — breweries list:**
- MT-34 passes: with location off, Breweries lists 10 places with miles
  from W Main St, which is the right default.

| ID | Found | Expected | Test |
| --- | --- | --- | --- |
| F-14 | In the list, each row's miles sit wherever the text ends, so they do not line up from row to row | Right-aligned in one column beside the row's button: Noblebräu's miles, then each place's below it. Screenshot, 12:48: the miles ("mi 0.2") follow straight after each name, so they wander with the name's length, and a long name is cut short to make room — "Noblebräu Brewing · 185 King Str…". Two smaller points from the same screen: "0.2 mi" reads more naturally than "mi 0.2", and Noblebräu's name carries its street address, which the description already gives | MT-36 |
| F-15 | The list's miles are from W Main St even with location on. Screenshot, 12:51: Squatch's card reads "1.7 mi from you · about 15 min by bike", so the app had her position; three minutes earlier (12:48, location arrow showing) the list still said "Miles from W Main St". Likely, not proven, that location was on for both | With location on, they are from the rider. Sarah expects this to follow once the location persistence bug being fixed in the other chat is done; MT-35 checks it, and should be run both before and after that fix | MT-35 |

**Sixth pass, same build — King St breweries:**
- With the three King St pins close together, tapping from one card to the
  next did not open the next card; after closing and retrying, Squatch,
  Griffon & Sphynx and Noblebräu each opened. So it works, but not reliably.

| ID | Found | Expected | Test |
| --- | --- | --- | --- |
| F-16 | On Griffon & Sphynx's card the "ff" looks slanted, as if the text were broken | Plain letters. Likely cause: the card title is set in Fraunces, whose "ff" is drawn as one joined ligature; the list, set in Inter, looks normal. Check other names and headings with "ff", "fi" or "fl" too | MT-38 |
| F-17 | With one King St brewery's card open, tapping a neighbouring pin often did nothing | The tapped pin's card opens at once, replacing the open one. Same family as F-12, made worse by three pins sitting almost on top of each other. Screenshot, 12:51: zoomed in to street level, the three pins stand apart and Squatch's opened; so far the taps fail only when zoomed out far enough for the pins to overlap | MT-37 |

**Seventh pass — editing Ride to a Downtown Festival:**

Sarah rewrote the ride: start at Jameson's Joy (Ninja Park), drop the
Mid-Path Fix-It Stand, end where the path meets W Main by the courthouse
("Downtown", not the Red Wolf sculpture), and say to walk bikes to the bike
valet on W Main. Done in the data the same day; the depot stays as a stop.

| ID | Found | Expected | Test |
| --- | --- | --- | --- |
| F-18 | Rides cross roads at push-button crossings, and the path has a detour, but the map has no way to show either | A marker that is not a numbered stop (an orange cone, "Cross here — press the button"; a detour sign) on the ride. On this ride: the crossing at Blue Ridge Community College, the button onto the wooden path, and the detour. Same idea as F-10's Lowe's Crossing. A new feature, so it needs a scope decision, and each spot needs a location from Sarah — none are placed by eye. First locations from Sarah, 23 October: the Blue Ridge Community College crossing is two points 83 ft apart, one per direction — towards downtown 35.249389, -82.721694; towards the forest 35.249417, -82.721972. Both are 39 ft from the drawn path and 82 ft from the existing "Broad St Crossing" landmark, and 11 of the 16 rides pass them, so a crossing belongs to the path rather than to one ride. Kept in `docs/adventure-stops.csv`. Design, Sarah 23 October: a crossing is not a stop — no number, not in the stop list or the stop count. A small traffic cone that says "Cross here" — in the end, in the ride's stop list only, not on the map. Crossings belong to the path, so each shows on every ride that passes it. Built 23 October in `src/data/crossings.json`, as warnings in a followed ride's stop list, between the stops and again for the way back, not on the map (Sarah, 23 October); Lowe's Crossing is no longer a stop on Downtown to the River. Five have both sides located (in `docs/adventure-stops.csv`): Blue Ridge Community College, Jackson Ct, Ecusta Rd and Lowe's at Asheville Hwy (push button), and Deerlake Rd (no button) | MT-39 |

**Use case Sarah has struggled with, 23 October:**

| ID | Found | Expected | Test |
| --- | --- | --- | --- |
| F-19 | With the brown route drawn — riding to a place, or following an adventure — tapping stops and places along it to explore, sometimes a card does not show up | Every tap on a numbered stop or a place pin along a drawn route opens its card, first time, and closing it leaves the route. Intermittent, so it needs the exact steps when it happens: which kind of route, what was tapped, and whether a card was already open. Related: F-7 (pins round a Ride to here are untappable by design), F-8, F-12 and F-17 (taps needing retries). The 1.1.1 fix "pins and numbered stops open every time" should be rechecked against this | MT-41 to MT-44 |

## Status after 1.1.1

The 1.1.1 fixes, made alongside this walkthrough from Sarah's ride on 22
October, should close several of these. Each still needs checking on the
next build before it is closed:

| Finding | 1.1.1 item |
| --- | --- |
| F-2 (list opens over the pins) | Switching on a category leaves the list at the bottom |
| F-3 (map would not move with a card open) | A place centres once; the card no longer pulls the map back after the rider pans |
| F-5 (White Squirrel Arcade misplaced) | Moved 502 ft to 40 N Caldwell St |
| F-6 (no brewery pins during a ride) | Switched-on categories still show while riding |
| F-8, F-12, F-17 (pins needing several taps) | Pins and numbered stops open every time |
| F-15 (list miles not from the rider) | Location stays in step with the button — recheck MT-35 |
| F-7 (pins not tappable mid-ride) | Decided for now: pins round a ride are deliberately not tappable. UC-15 asks for the opposite, so it stays a design question |

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
