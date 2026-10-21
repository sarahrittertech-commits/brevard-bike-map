---
sidebar_position: 3
title: Roadmap
---

# Roadmap

What is shipping, what is next, and what is planned, for both apps. Keep this
current: when something ships it moves to the [release notes](./release-notes),
and when a plan changes it changes here first. Last updated 21 October 2026.

Two apps are built from one codebase and one dataset:

- **Bike Brevard Map**, on the App Store since 1.0 (25 September 2026)
- **Bike Brevard Kids**, the family edition, getting ready for its first release

## Now: Bike Brevard Map 1.1

Built from the `restaurants` branch. In TestFlight on 21 October 2026.

- The downtown half redrawn from the 17 October rides, including the current
  detour by Brevard Middle School
- Sixteen connectors to the places families ride: the library, Franklin
  Park, Silvermont, Brevard College, the King St row and more
- About twenty pins corrected from photos and OpenStreetMap
- New rides: Art on the Path, Pisgah Short Track Social, Earth Mountain Shop
  Ride
- **Show my location**, opt-in: the app explains what the dot is for before
  the system asks, and nothing is saved or sent
- Works on its side and on any size of screen
- Clearer mile wording: "Mile 0.4 from the trailhead at W Main St, Brevard"

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

## Planned

### Food, in stages

1. **Coffee shops.** A short, clear list to start with, and a test of the
   category before the bigger one.
2. **Restaurants.** Decide first who is included and why: the rule should be
   one a reader could apply themselves, for example "a place you can ride to
   with a child and sit outside".
3. **Menus.** Decide the experience before building it: an in-app page, a
   short summary on the place card, or no menus at all. Whatever is chosen,
   the rider should stay in the app.

### Ride to here

Tap a place and see how far it is from you along the path, in miles and
minutes, with a **Ride to here** button that shows only you and that place.
With location off, the distance and button show greyed out with "Location
sharing is needed to calculate a ride" and a way to turn it on.

Two decisions come first:
- **ADR-0003 has to be revisited.** The app draws hand-curated routes and
  deliberately computes none; distance "on the path" from wherever the rider
  is needs the app to route along the network itself. That is the decision
  CLAUDE.md flags as having a genuine argument on both sides.
- **How schools are handled in Bike Brevard Kids.** A route from a phone's
  location to a school touches the "no routes from a home to a school" line
  in [Direction after 1.0](./post-1.0-direction). Sarah, 21 October 2026: we
  can be more flexible here, especially for the kids app. Settle the exact
  rule when Ride to here is designed, and record it in that document, since
  it was made as a safety decision.

### Build my own route

Pick stops and draw a ride from them. After Ride to here, because it needs the
same routing, and at least one release later.

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
