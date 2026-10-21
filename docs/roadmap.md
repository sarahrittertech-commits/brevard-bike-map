---
sidebar_position: 3
title: Roadmap
---

# Roadmap

What is shipping, what is next, and what is planned, for both apps. Keep this
current: when something ships it moves to the [release notes](./release-notes),
and when a plan changes it changes here first. Last updated 21 October 2026, after Ride to here moved into 1.1.

Two apps are built from one codebase and one dataset:

- **Bike Brevard Map**, on the App Store since 1.0 (25 September 2026)
- **Bike Brevard Kids**, the family edition, getting ready for its first release

## Now: Bike Brevard Map 1.1

Built from the `restaurants` branch. In TestFlight on 21 October 2026.

- The downtown half redrawn from the 17 October rides, including the current
  detour by Brevard Middle School
- Eighteen connectors to the places families ride: the library, Franklin
  Park, Silvermont, Brevard College, the King St row, Weevil, Sycamore Cycles
  and more
- About twenty pins corrected from photos and OpenStreetMap
- New rides: Art on the Path, Pisgah Short Track Social, Earth Mountain Shop
  Ride
- **Show my location**, opt-in: the app explains what the dot is for before
  the system asks, and nothing is saved or sent
- Works on its side and on any size of screen
- Clearer mile wording: "Mile 0.4 from the trailhead at W Main St, Brevard"
- **Ride to here** (added 21 October 2026): with location on, a place shows how
  far it is from you along the path and roughly how long by bike, and Ride to
  here shows only you, the place and the way between. With location off it is
  greyed out with a link to turn it on. Routes follow only the drawn lines;
  see [ADR-0003](./architecture/adr-0003-route-data), revised. In Bike Brevard
  Kids it includes schools, by Sarah's decision recorded in
  [Direction after 1.0](./post-1.0-direction)

**Pulled from 1.1 on 21 October 2026: restaurants.** "See the menu" sent the
rider out of the app to a browser, which is not the experience the app should
have, and who to include needs more thought. The data and code stay in the
repository, hidden with `apps: []`, and come back in stages. See below.

## Next: Bike Brevard Kids 1.0

A separate App Store app (Apple ID 6825072871) with an orange-bike icon. It has
no breweries, and adds schools, after-school activities and fun stops. On the
`kids-app` branch.

Still to do:
- the first `kids-production` build (Sarah's Apple login, once)
- Sarah rides the N Country Club Rd teen link to the Health & Racquet Club
- retake the playgrounds-and-schools screenshot, which may still show Brevard
  Academy's old pin
- decide whether schools' and gyms' "Visit the website" links stay, given the
  in-app question below
- revisit the kids-only category colours and icons (Schools purple
  `#6B4FA0`, After School teal `#0F7F82`, Fun Stops coral `#EE4848`) to match
  the respaced palette of 21 October

## Planned

### Food, in stages

1. **Coffee shops.** A short, clear list to start with, and a test of the
   category before the bigger one. Colour reserved: espresso `#352822` (Sarah,
   21 October 2026).
2. **Restaurants.** Colour reserved: teal `#0C8E85` (Sarah, 21 October
   2026). In the kids app it sits close to After School's teal `#0F7F82`, so
   one of the two moves if restaurants return there. Decide first who is included and why: the rule should be
   one a reader could apply themselves, for example "a place you can ride to
   with a child and sit outside".
3. **Menus.** Decide the experience before building it: an in-app page, a
   short summary on the place card, or no menus at all. Whatever is chosen,
   the rider should stay in the app.

### Build my own route

Pick stops and draw a ride from them, using the same routing as Ride to here.
At least one release after 1.1.

### Websites inside the app

Any link that leaves the app (schools, gyms, the library) opens in an in-app
browser sheet instead of the phone's browser, or is removed. Decide together
with menus.

### Android on Google Play

The APK works. Waiting on a Play developer account and its testing period;
see the [Google Play listing](./play-store-listing).

## Data to check on the ground

- HomeSlyce and Griffon & Sphynx: house-number estimates on King St
- Nature Trails: the Commerce St end of the short-track ride
- CVS to Blue Ridge CC: the last traced stretch of the main path
- Mile markers for places off the path, which read as the nearest path point
  rather than a riding distance
