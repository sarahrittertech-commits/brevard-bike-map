---
sidebar_position: 8
title: Release notes
---

# Release notes

## 1.1.0 — in preparation

**Changed after TestFlight, 21 October 2026.** Sarah tested build 7 on her
iPhone:
- **Restaurants are pulled from 1.1.0, in both apps.** "See the menu" left
  the app for the browser, and who to include needs more thought. The
  category, its six places and the two lunch rides (Ninja Park and Smash
  Burgers, Steamers and Swings) are hidden with `apps: []`, not deleted. They
  come back in stages: coffee shops first, then restaurants, then menus. See
  the [roadmap](./roadmap).
- **The app explains location before the system asks.** The first tap on the
  location button shows the app's own message: what the dot is for, that the
  location is never saved or sent, and how to turn it off. The rider can
  decline there, before iOS or Android asks.
- **Weevil and Sycamore Cycles are reached by their own links**, drawn from
  Sarah's directions of 21 October. *Ecusta Bypass to Weevil* (0.8 mi) runs
  from the path at Ecusta Rd up to the roundabout, first right onto the
  bypass and its bike lane, then across Hendersonville Hwy at the light.
  *Hendersonville Hwy to Sycamore Cycles* (0.3 mi) crosses at the same light
  and follows the sidewalk and bike lane west. The roads come from
  OpenStreetMap; the Sycamore stretch follows Sarah's points, because the
  sidewalk is not mapped. Both pins were far off: Weevil by 4,298 ft and
  Sycamore by 2,714 ft. Both are now at the parking lots she gave.
- **Ride to here.** Sarah's request from the same TestFlight pass, built
  into 1.1. With location on, a place's card shows "N mi from you · about N
  min by bike" and a Ride to here button that hides every other pin and draws
  the way between, with a "Riding to" header to close it. With location off
  the row is greyed out: "Location sharing is needed to calculate a ride",
  with a link that turns it on without closing the card. Routes follow only
  the drawn path and connectors (ADR-0003, revised), at a 7 mph family pace.
  Every place in the map app is reachable; places more than 1,000 ft from a
  drawn line say "No drawn route reaches here yet". While location is on the
  app follows the rider's position so the distance stays current, still only
  in memory, and the privacy policy says so.
- **Easier to use on a bike** (Sarah, after build 8 on her phone). A place's
  card opens only as tall as its content instead of two-thirds of the screen,
  with larger text. The distance is larger, and Ride to here is a full-width,
  56pt button. The close buttons and the turn-on-location link have bigger
  touch areas, and each pin is 12pt easier to hit.
- **Tapping a pin is calmer.** The map zooms to about two miles around the
  place instead of street level, never zooms out, and places the pin in the
  middle of the map above the card. The old centring maths landed it half
  under the card (the known gap since 1.0). Tapping a selected pin again
  keeps it selected.
- **Links are solid warm gray lines,** not green dots that looked like the
  landmark dots and changed size with the zoom.
- **Less redrawing.** The path, landmarks and trailheads no longer redraw when
  a pin is tapped, the sheet moves or the rider's position updates. This was
  the likely cause of the lag Sarah felt.
- **Following an adventure, reworked** (Sarah, second pass on build 8):
  - The route line is wider, 9pt, with a white edge.
  - No bottom card while following; the route gets the whole map.
  - The header card opens to list every stop. With location on, the next stop
    is marked NEXT there and drawn larger in clay on the map, and the header
    says "next: N".
  - Numbered stops can be tapped, on the map or in the list. The sheet then
    shows "Stop N of M", the stop's note and the distance to it.
- **The "Getting around" card can be put away** with its close button. It
  stays away until a category is switched on, or until the app is next opened;
  nothing is saved.
- **The town fills more of the screen.** The map kept 96pt clear on the left
  for one landmark label, which pushed the whole network right and made it
  smaller. That margin is now 48pt, and the map refits to the full height
  when the bottom card is put away.
- **Playground to Dolly's starts at Silvermont again.** Moving Silvermont's pin
  to the real park on 20 October left the ride's first stop 2,100 ft from its
  line. The line now starts with 0.4 mi along the drawn links from Silvermont,
  and the ride reads 5.1 mi, 50 min.
- **Browns from Sarah's palette** (21 October): ride routes, the next stop and
  the following accents are walnut `#71552E` instead of clay orange; brewery
  pins are caramel `#90744D`; deep forest is `#103C2B`. Forest `#1F4D3A`
  stays the base.
- **Clearer mile wording:** "Mile 0.4 from the trailhead at W Main St,
  Brevard" on a place, and "Miles from W Main St" over the list.

Built 20 October 2026 from the `restaurants` branch. It ships the four
sections below that belong to Bike Brevard Map: the downtown half recorded
(the 17 October rides, links and adventures), restaurants, show my location,
and any shape of screen. Bike Brevard Kids and Android are not in it. Kids
needs its own App Store record, and Android needs a Play account.

**Build 5 was refused by App Store Connect** (ITMS-90683): `expo-location`
contains motion-sensor code, and `motionUsagePermission` had been set to
`false`, so the binary had no `NSMotionUsageDescription`. Apple requires the
string whenever the code is present, even though the app never asks for
motion. It now carries a plain one-line explanation, and the next build
replaces build 5.

Before it is submitted: MT-1 to MT-6 on a physical iPhone, including the
location button's real permission prompt, which Expo Go cannot show. The
What's New text is in the [App Store listing](./app-store-listing).

## Unreleased — the downtown half, recorded

Four rides from 17 October 2026, exported from Trailforks, and the photos
taken along them replace the traced downtown half that 1.0.1 left behind.

- **The path ends where it really meets West Main**, by the bollard
  (IMG_5602), 555 ft north of the traced trailhead. The traced line cut
  diagonally through the blocks below The Yard. It now follows Railroad Ave.
- **`main` is recorded from West Main to CVS**, including the current detour
  by Brevard Middle School: closed at IMG_5561, up the Pender St side, back on
  the path across Fisher Rd from the rescue squad (IMG_5571–5572). Between CVS
  and Blue Ridge CC it is still traced, minus one vertex that doglegged east
  of where the recording ends. The line now measures 3.92 mi. `miles` stays at
  4.0 because the traced stretch still cuts corners, which is the lower-bound
  point 1.0.1 made.
- **The Main St link is redrawn along W Main** from Kilwins to the trailhead.
  Before, it ran from the courthouse along the wrong street.
- **Jordan St to the Library**, new: the way the family rides from the path.
  It goes east on W Main to the fire station, right on England St, left on
  W Jordan by Hendersonville Pediatrics, across S Caldwell and S Broad, then
  down S Broad to the library. It is drawn from the corner photos
  (IMG_5603–5611) plus two corners read off OpenStreetMap, not from a GPS
  recording.
- **Gaston St Hill**, new, recorded: from the library's S Gaston St entrance
  up S Gaston to E Main at Earth Mountain. It is uphill with no bike lane. Its
  note says small kids can ride the sidewalk and will likely walk part of it.
- **Pins moved to where they were photographed or ridden to:** Kilwins
  409 ft (it is at 52 *W* Main, not E Main), Earth Mountain 705 ft (66 E
  Main, IMG_5619), The Yard 253 ft (IMG_5594), the Depot repair stand 130 ft
  (IMG_5588) and the Depot Park label 201 ft (IMG_5586).
- **The King St row moved about 1,100 ft west**, onto King St, a short block
  off the path below Whitmire St. Noblebräu is placed by IMG_5623, and
  OpenStreetMap agrees to 15 ft. Squatch and Morning Social are at
  OpenStreetMap's points for 170 King St. HomeSlyce (143) and Griffon &
  Sphynx (212) are at OpenStreetMap's estimated house-number positions and
  are the two to check on the ground. All five now sit within 560 ft of the
  path, so they are off the OFF_PATH list, and their mile markers read 0.2.
  Noblebräu's description now mentions its live music.
- **King St Link**, new and recorded: the end of the Kilwins ride, about
  200 ft from the path to 185 King St.
- **Library Repair Stand**, new: tools and a pump outside the library
  (IMG_5616).
- **New Adventure Learning Center moved 250 ft north**, to OpenStreetMap's
  point beside the library's parking lot, which is the view in IMG_5614. It
  is now 330 ft from the nearest drawn link, so it is off the OFF_PATH list.
- **Brevard Middle School moved 154 ft**, to the plus code Sarah gave
  (67WC+9G). The plus codes from the ride notes, once decoded, agree with the
  photos and recordings to within about 200 ft: 67H7+VM is New Adventure,
  67R8+85 is Nature Trails at the east end of Commerce St, and 67WG+XJ is
  CVS.
- **Two hopscotches painted on the path**, new playground stops: the
  Flower Hopscotch near the McLean Rd crossing (IMG_5578) and the Robot
  Hopscotch just past the Fisher Rd crossing (IMG_5628).
- **Twelve adventure routes follow the new lines.** The Ballfield and Library
  Loop now reaches the library by Jordan St instead of cutting across town.
  No route moved more than 0.3 mi from its stated length.
- **Two new adventures, both easy and kid-friendly, with Sarah's photos.**
  *Pisgah Short Track Social* rides the path to Nature Trails' short-track
  features on Commerce St for the summer Wednesday race series around the
  Fourth of July (photo IMG_5589). *Earth Mountain Shop Ride* goes from the
  shop to The Yard and back, the loop behind its holiday Letters to Santa
  ride (photo IMG_5618, the shop's bike mural). The Commerce St end is the
  street's east end, where IMG_5589 shows the features. OpenStreetMap's
  estimate for 20 Commerce St is further west, so check it. From Earth
  Mountain to Kilwins the ride says to walk the bikes, because Main St is too
  busy to ride with kids. That stretch is drawn from the map.
- **Art on the Path**, a new easy 3.1-mile loop for both apps, starting and
  ending at Depot Park. It passes 17 of the 25 Brevard Sculpture Walk pieces:
  - Ballerina Angelina at the Depot
  - the Lumberyard Cows, seen behind the Brevard Lumber Company sign
    (IMG_5598)
  - the Saxophone, Violin and Banjo on the Brevard College lawn
  - the Red Wolf and Elk on the courthouse lawn
  - the Otter at the Visitor Center
  - the Red Fox and Tim Murray abstract at St Philip's
  - the Great Blue Heron at the library
  - the Trout, Owl and Red Deer on S Broad
  - the Wild Turkey at W Morgan
  - the Black Bear and White Squirrels at City Hall

  It follows the route Sarah described: Whitmire, N Caldwell, N Broad,
  E Main, Gaston and S Broad, then Jordan and England Sts back to W Main.
  The streets come from OpenStreetMap and the sculpture details from
  Explore Brevard's Sculpture Walk page. The sculptures are stops, not map
  pins. The photo is IMG_5590.
- **Whitmire St Link**, new: off the path below The Yard, down Whitmire St
  to the N Caldwell crossing at First United Methodist, from OpenStreetMap.
  Riders can also cut through The Yard to reach it.
- **Franklin Park Link**, new, from OpenStreetMap: off the path at W French
  Broad, across N Broad onto E French Broad, then Franklin St and Lakeview Ave
  to the Franklin Park playground, with the pool around the corner. Its note
  gives the sidewalk route through Brevard College for little kids.
- **Silvermont Link**, new: from Lakeview, down Franklin St to E Main, across
  at St Philip's Episcopal, then the sidewalk to the Silvermont playground.
- **E Main Sidewalk**, new: from Kilwins along Main St to St Philip's, where
  the Silvermont Link carries on. This makes a continuous line from the end of
  the path to Silvermont. Its note says to walk the bikes downtown with kids.
- **Rice St Garden Link**, new: from Gaston St, right on E Jordan to the Rice
  Street Community Garden and its small church playground, a 371 ft
  cut-through to Woodside Dr, then up to E Main. This is the library-to-
  Silvermont route. The garden and the cut-through are not in OpenStreetMap,
  so the cut-through is drawn straight. The garden is not a pin.
- **Brevard College Creek Link**, new: off the path down Fisher Rd, across
  N Broad to Ingles, around behind the store and across to Kings Creek Loop,
  past the spot on King Creek where kids play, then across campus to E French
  Broad. The 99 ft from the back of the Ingles lot to Kings Creek Loop is not
  in OpenStreetMap and is drawn straight. Check it on the next ride.
- **N Johnson St Link**, new: from E French Broad up to E Main.
- **The Franklin Park Link uses the new crosswalk over N Caldwell** at
  W French Broad (35.23694, -82.73300). Its note now gives Sarah's way with
  small kids: the W French Broad sidewalk, across N Broad, then the E French
  Broad sidewalk to Franklin St.
- **Brevard Elementary Link**, new: from Silvermont along the E Main and
  Greenville Hwy sidewalk to the school.
- **Gallimore Greenway Link**, new: across E Main at Gallimore Rd, then 0.1 mi
  of the Gallimore Road Greenway, a separated path that already exists, to the
  Boys & Girls Club. The school and the club are now off the OFF_PATH list.
  Both links come from OpenStreetMap and Sarah's directions, not GPS.
- **Three park pins were badly placed.** The Franklin Park pin sat inside
  Silvermont Park, 1,214 ft from Franklin Park. The Silvermont pin was 1,748 ft
  north of the park. The pool moved 226 ft. All three are now at
  OpenStreetMap's points, within 270 ft of the new links, and off the
  OFF_PATH list.
- **The First United Methodist playground moved 1,506 ft** to the church on
  Methodist Dr. The old pin sat by King St.
- **Bike to the Rock Gym**, Bike Brevard Kids only: the Jordan St route, then
  down the west side of S Broad to Brevard Rock Gym for open climb, so there
  is no second crossing of US 64. The photo is IMG_5612, the gym with
  Transylvania Tae Kwon Do next door. The gym's description now gives its
  open-climb times. Its pin was already at 240 S Broad, so it did not move.

Not done: mile markers north of The Yard read about 0.08 mi long against
the new line. That is within rounding, so they were left as they were. The
app does not show segment notes, so the detour is in the data but not on
screen.

## Unreleased — Bike Brevard Kids

Started 16 October 2026, on the `restaurants` branch. A second app built from
the same code and data (`EXPO_PUBLIC_APP_VARIANT=kids`; see the runbook).

- **No breweries or taprooms.** The Breweries category, the seven taproom-only
  places and the Taproom Traverse are map-only. Squatch, Weevil and The Hub
  stay as bike shops without their taps, and the CHUBwagon and the Cherry
  Street Greenway drop the Oskar Blues wording. DT-10 fails the build if
  brewery wording creeps back in.
- **Schools**, a new category: Pisgah Forest Elementary, Brevard Elementary,
  Brevard Middle, Brevard High, Pisgah Collective, Mountain Sun Community
  School, Brevard Academy, Presbyterian Weekday Preschool, New Adventure
  Learning Center, Brevard College and Blue Ridge Community College. The First
  United Methodist playground also lists the church's Weekday Children's
  Program preschool.
- **After School**, a new category: the Boys & Girls Club, Brevard Rock Gym,
  Transylvania Tae Kwon Do, Carolina Dance Collective and the Brevard Health &
  Racquet Club's pools and summer swim team.
- **Fun Stops**, a new category: White Squirrel Arcade, O.P. Taylor's, the
  library and Franklin Park Pool.
- **Bike to School Day**, a ride from Depot Park to Brevard Middle and
  Pisgah Forest Elementary, with the Brevard Bike Alliance's twice-yearly
  events in its story.

Before this can ship: its own EAS project, icon, launch screen and store
listing; the rough coordinates for Brevard Academy and
the Health & Racquet Club checked; whether Franklin Park Pool opens in 2027;
and most schools sit off the drawn network, so a Bike to the Pool ride and
rides to the off-path schools need their routes recorded first.

## Unreleased — restaurants

Started 16 October 2026, on the `restaurants` branch (cut from
`show-my-location`).

- **A Restaurants category** with a knife-and-fork icon, between Playgrounds
  and Breweries on the rail. Six places from a curated list of family-friendly
  food: Sully's Steamers, HomeSlyce on King, Morning Social, the CHUBwagon at
  Oskar Blues, Gordingo's at Ecusta and Pisgah Bakehouse.
- **A menu link.** A place with a `website` shows "See the menu" (or "Visit
  the website") in its detail, which opens the browser.
- **Two kid-friendly rides that end at lunch:** *Ninja Park and Smash Burgers*
  (Jameson's Joy, then the CHUBwagon) and *Steamers and Swings* (Sully's, then
  The Yard), the shortest ride in the app.
- **Restaurant filters** are written up as [UC-5](./use-cases) with
  requirements RF-1 to RF-9. Not built.

Before this can ship: the King St positions for HomeSlyce and Morning Social
are set beside Squatch's, which the September survey left as traced; check
all three on the ground. Pisgah Bakehouse's connector from the roundabout is
not drawn. The two new rides borrow existing photos.

## Unreleased — show my location

Started 16 October 2026, on the `show-my-location` branch. A rider can ask to
see where they are on the map. It is opt-in every time: nothing is asked until
they tap the button.

- **A location button** under recenter on the map's rail. The first tap asks
  for permission while the app is in use — never in the background — and then
  draws the phone's own blue dot and centres on it. Tap again and the dot goes.
- **Outside Brevard** (more than about 3 miles from the path) the dot is on
  but the map stays on Brevard, and says so, rather than flying to a place it
  has nothing to say about.
- **Declined once, the system can't ask again**, so the button then offers to
  open Settings instead of doing nothing.
- **Nothing is kept.** The position is never stored, logged or sent, and it is
  forgotten when the app closes. The privacy policy says so.
- **New dependency: `expo-location`**, for the permission prompt and one
  position fix. Only the "while in use" permission is configured on iOS and
  only foreground location on Android.

Before this can ship: the App Store privacy answers, the review notes and the
"never asks for your location" lines in both store listings have to change, and
Play's Data safety form gets a location answer. Each is marked in the listing
docs. It needs a new build: Expo Go has its own location prompt, so the real
one is only seen in an EAS or local build.

## Unreleased — any shape of screen

Started 14 October 2026, from the [iPhone Duo review](./iphone-duo-design-review)
(its Tier 1). The app was locked upright and assumed one phone shape; it now
follows the screen it is given. Nothing changes on an upright iPhone except
touch targets.

- **The app rotates.** On its side the header and the sheet dock into a column
  on the left, and the map has the rest. On iPhone Duo open flat that column
  ends before the fold.
- **The category rail never runs into the sheet.** Where one column of
  buttons will not fit — a phone on its side, iPhone Duo's short outer
  display — it stands in two.
- **Nothing hides under the edges.** Everything that respected the top and
  bottom safe areas now respects the left and right ones too, where iPhone
  Duo puts its bars and camera and a phone on its side puts the Dynamic
  Island. Routes are fitted clear of all four.
- **On a big upright screen the sheet opens to half height**, so on iPhone Duo
  half folded it stops at the fold: map above, list below.
- **Photos stop at 40% of the screen's height**, and text, ride stats and the
  route button stop at a 600-point column, so a wide screen doesn't turn a
  ride's photo into the whole page. Ride stats go four across on wide screens.
- **Close and Back take a 44-point touch**, Apple's minimum, without changing
  how they look.
- **Apple's Legal link stays visible**; the sheet used to cover it.
- **Ready for Xcode 27 (15 October).** iOS scene support is switched on
  through `expo-build-properties`. Without it, an app built with Xcode 27
  shows a black screen on iOS 27. Checked by building the Release app with
  Xcode 27.0 and running it on the iOS 27 simulator. EAS still builds with
  Xcode 26.6 until the image is pinned; see the runbook.
- **Expo patch updates**: `expo` 57.0.30 and `expo-splash-screen` 57.0.10,
  the versions SDK 57 expects. expo-doctor passes all checks.
- **The map refits when it docks or undocks** on rotation, so a route can't
  be left under the new column. On the docked layout, the westernmost
  landmark label keeps the same room as when upright.

Not yet done: a build with the iOS 27.1 SDK (needed for edge-to-edge on
iPhone Duo), iPhone Duo App Store screenshots, and a check on a real iPhone
Duo or its simulator — the layouts above were checked at iPhone Duo's sizes
on an iPhone 17 simulator, with guessed side-bar widths.

## Unreleased — Android

Started 12 October 2026. The app has always been Expo, so the JavaScript was
already cross-platform; this is the work to make it a proper Android app rather
than an iOS app that happens to run there. The APK works; what remains before
Google Play is a decision about Play's data safety answers and a Play account
with its testing period — see the [Google Play listing](./play-store-listing).

- **The Maps key is read from the environment**, never written into the public
  repository. Without it the app crashes on launch — found on the first EAS
  build — so an Android EAS build without the key now stops before it starts.
- **The map behaves like the design on Google Maps.** Google draws every shop
  and bus stop unless told not to, opens a directions toolbar on a tapped pin,
  and jumps the camera to it; all three are off, and the base map is muted to
  match iOS's.
- **The Google logo stays visible.** The sheet would have covered it, which
  Google's terms do not allow; the map is padded on Android to clear it.
- **The back button works** one layer at a time: selected place, open sheet,
  followed route, then out of the app. From Adventures it returns to the map;
  from a ride's detail, to Adventures.
- **Pins get a moment to draw.** Android snapshots custom markers into bitmaps,
  and a snapshot taken too early is a blank pin; Android now tracks markers
  briefly after each change. A hedge, not yet confirmed — see below.
- **New icon and launch screen.** The adaptive icon was still the 1.0.0
  water-ridges art. It is now the same artwork as iOS, generated by script and
  scaled so every launcher's mask crops inside it, with a themed monochrome
  layer for Android 13+. The splash is the scene cut to a circle, since Android
  12+ would have cut the iOS wordmark in half.
- **Only the INTERNET permission.** Library defaults had added storage,
  draw-over-apps and vibrate; all blocked.
- **`preview` builds an APK**, installable straight from the EAS link.
- **The privacy policy names Google Maps** and what Google's SDK sends Google
  on its own account. On iOS nothing changes.

**Seen working, 12 October 2026.** The key went into project `brevardbikeapp`
and EAS the same day, and build 2 passes MT-A1 to MT-A7 on the emulator; see
[test cases](./test-cases). Not yet on a physical Android phone. The Play
screenshots were captured from that build.

**Since then.** Sarah decided on 12 October to ship to Google Play with the
honest data safety answers. The Play developer account is not open yet, and
the Android checks predate `f3f641f`, which unlocked rotation — so the next
Android build needs MT-A1 to MT-A7 again before it goes to Play. Where it
stands is kept current in the [Google Play listing](./play-store-listing).

## 1.0.1 — 1 October 2026

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
- **Connectors now read 2.3 mi** rather than 3.8 in the sheet's trail facts.
  There is one more of them, but three of the four measured shorter than they
  claimed once they were ridden rather than traced.
- **A fourth repair stand.** IMG_5209 shows a pump-and-tools stand and a bike
  rack at the taproom door, 16 ft from the spur.
- **Broad St Crossing.** The path has two signalled road crossings and only
  Lowe's was labelled. The southern one, where the path crosses N Broad St /
  Hwy 64 at Osborne Rd by Blue Ridge Community College, now is too
  (IMG_5186).
- **The river pull-off.** Downtown to the River is the ride people think of
  as biking to the river for a swim and it never said so. IMG_5296 is a flat
  dirt landing with the bank shelving into the water, 21 ft off the route at
  mile 5.41, and it is now a stop between Dolly's and Lowe's Crossing. A name
  and a note, like the three stops around it — swimming as a sixth category
  would need an icon in `CategoryIcon.js`, which is code for one entry.

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

### Every adventure photo is now Sarah's own

The nine adventure images arrived with the design dataset and none of them had
any recorded provenance or licence. That is the open blocker on answering App
Review's question 6, and the licensing half of it is closed: all nine are
photographs Sarah took, listed file by file in the [runbook](./runbook), which
now also says a photo needs a provenance line before it ships.
`scripts/photo-prep.cjs` does the conversion, so it is a step with a name
rather than a sips command somebody remembers.

Six came off the 30 September ride. Four are older — 2020, 2021, 2021 and
2024 — and carry no GPS, because a downtown festival, the Music Center, a
group ride and the Bracken trailhead are not things the survey rides passed.

Likenesses are settled too. Three of the nine show people: one is Sarah's own
child, and the group ride is the photograph from the public campaign for
bicycle path funding, cleared for use promoting the path. Question 6 can be
answered, and the answer is written out in full in
[the App Review response](./app-review-response).

These nine are the set. Not every one is of the exact place its ride names —
Concert Night shows a band rather than the Music Center lawn — and that is
deliberate. They are the photographs the project owns outright, and close
enough to carry the feel of the ride.

### The campground connector

Sarah's ride ends where the path meets the campground parking lot, across
which is Davidson River Campground. That is the closest public parking to it,
so the connector ends there and is named for it:

| | Before | After |
| --- | --- | --- |
| name | Pisgah Forest Link | Campground Connector |
| length | 2.6 mi stated, 2.36 drawn | 1.3 mi, recorded |
| points | 11 | 27 |

The 1.6 mi it used to carry on for went to a Sycamore Flats that is not there.
Downtown to the River is truncated to the same point, which changed its stop
order: Lowe's Crossing comes before Dolly's now, and Sycamore Flats is mid-ride
at 5.00 mi rather than the destination. 7 mi becomes 5.9.

### DT-8 and DT-9

Two new data checks, so today's lessons are enforced rather than remembered.
DT-8 is the working tolerance: a destination is within 1,000 ft of the network
— close enough for someone on a bike — or listed in `OFF_PATH` with its reason,
which seven genuinely off-path places are. DT-9 catches the failure mode
itself: a coordinate identical to a network vertex was placed against the drawn
line rather than measured. Every wrong coordinate found today had that shape.
Three remain: `repair-depot`, `courthouse` and `railroad-depot`.

### The icon and launch screen are redrawn

The 1.0.0 icon's ridgelines read as water rather than mountains, which was the
headline item held back for this release. Sarah's new artwork is a bike in
front of three receding ridges with a horizon and a river, which reads as
mountains because it has the things mountains are drawn with: overlapping
silhouettes, tonal recession, and angular rather than sinuous edges. The
launch screen takes the same artwork under a sunrise sky with the wordmark
below.

All three iOS appearances are regenerated. The light and tinted ones carry no
alpha channel, which is what an App Store submission rejects; the tinted one
is a luminance conversion, which is what iOS tints.

The Android adaptive layers are still the old artwork. Android does not ship
until there is a Google Maps key, and the source says "Android coming later",
so they were not guessed at.

### What is still traced

- **Everything below Blue Ridge Community College.** The ride started there,
  so the downtown half of `main` and all of `downtown-connector` are the
  original trace, as is `forest-connector` beyond the campground. The map now
  reads fine-grained in the north and blocky in the south; the second ride
  fixes that.
- **The path is now stated as 4 mi, not 3.5.** The redraw restated the bridge
  and campground connectors from the recordings but left `main` alone, and
  its line measures 4.00. That had to move rather than be left: the mile
  markers were corrected onto the measured scale in the same pass, so Pisgah
  Forest Repair Stand now reads mile 4.0, which on a 3.5-mile path is past the
  end of it. The App Store listing and the App Review answer say 4 mi too.

  The drawn figure is still a lower bound — the downtown half is traced and
  cuts corners — so if the town publishes a length, theirs should win over our
  arithmetic.
- **Three destinations are now further from their route than they were** —
  `repair-midpath` 41 → 359 ft, `cyckel-worx` 298 → 651 ft and
  `repair-pisgah` 176 → 287 ft. All three were placed against the traced
  line, the same fault that moved the other five, and none of them has a
  photograph to move it by. They are the first things to check on the next
  ride.
- **Six landmarks and one destination still sit on network vertices**
  rather than on the places they name: `courthouse`, `railroad-depot`,
  `ball-fields`, `repair-depot`, and — the whole river end of the map —
  `lowes-crossing`, `pisgah-entrance`, `davidson-river` and
  `sycamore-flats`, which are forest-connector vertices 3, 5, 7 and 10.
  `lowes-crossing` is 711 ft off the route it is supposed to mark a crossing
  on. Downtown to the River depends on these four for its entire second half,
  and not one of them has been checked against the ground.
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
