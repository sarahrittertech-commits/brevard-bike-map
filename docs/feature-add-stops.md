---
sidebar_position: 4
title: "Feature request: add a stop to a ride"
---

# Feature request: add a stop to a ride

**Status:** proposed for the release after 1.1.1. Raised by Sarah on
22 October 2026 after riding build 10. Not built.

## The request

While riding to a place, a rider may want to stop somewhere on the way: ice
cream on the way to the bike shop, a playground on the way home. Today they
can see what is nearby (1.1.1 shows any switched-on category while riding),
but the drawn way still goes straight to the one place they picked.

The feature lets a rider add one or two places to the ride they are on. The
way is redrawn through them, in the order they come along the path, and the
header counts the stops.

## Why it is a separate release

1.1.1 fixes what Sarah found on build 10. It took one addition, the road
crossings in a followed ride's stop list, and nothing more should wait on it. This feature changes how a ride works, so it gets its own
plan, test pass and TestFlight build.

**How hard is it?** Smaller than it sounds. The routing already finds the way
between any two points on the drawn lines (ADR-0003, revised). A ride with
stops is several of those joined end to end. The work is in:

- **Order.** With one or two added stops the app can try every order (two
  stops is two orders, three is six) and keep the shortest. No optimisation
  library is needed. Full "route optimisation" only matters with many stops,
  which this is deliberately not.
- **Screens.** An "Add to ride" button on a place's card while riding, the
  stop count in the header, a way to remove a stop, and arriving at a stop
  without ending the ride.
- **Testing.** Every combination below, on a phone, on the path.

Rough size: 1 to 2 days of building and a day of testing, plus one paid build.

**Limits:** at most two added stops (three places counting the destination).
More than that is "build my own route", which stays on the
[roadmap](./roadmap).

## Use cases

### UC-6 — Ice cream on the way

Sarah is riding to CykelWorx with her daughter. Riding along W Main, she
switches on ice cream, sees Kilwins half a block off the way, and taps it. She
taps **Add to ride**. The way now goes to Kilwins first, then on to
CykelWorx. The header reads "Riding to CykelWorx · 1 stop on the way".

### UC-7 — A playground and a snack

A parent riding home to the Pisgah end wants a playground and then a snack.
They add Jameson's Joy and Dolly's. The app puts them in path order, whatever
order they were added in, and the header lists both.

### UC-8 — Changed my mind

A stop that turns out to be closed is removed from the header's list. The way
redraws to skip it and the ride carries on.

### UC-9 — Arriving at a stop

Reaching an added stop does not end the ride. The header says "You're at
Kilwins" with a **Continue** button, and the part ridden so far stays faint, as
it does on a plain ride today.

### UC-10 — Not reachable

A place more than 1,000 ft from any drawn line cannot be added; its card says
"No drawn route reaches here yet" and offers no Add button.

## Test cases

To run on a real phone, on the path, before the build goes to App Review.
Each needs location on.

| ID | Steps | Pass condition |
| --- | --- | --- |
| AS-1 | Ride to a bike shop. Switch on ice cream and tap a pin near the way | The card shows the distance and an **Add to ride** button; the ride keeps going |
| AS-2 | Tap Add to ride | The way redraws through the ice cream place, then on to the bike shop; the header says "1 stop on the way" and the total miles and minutes go up |
| AS-3 | Add a second stop that comes *before* the first along the path | The order on the map follows the path, not the order added; the header lists both in that order |
| AS-4 | Try to add a third | No Add button; the card says at most two stops can be added |
| AS-5 | Remove a stop from the header list | The way redraws without it; nothing else changes |
| AS-6 | Ride to the first stop | Header says "You're at …" with Continue; the ridden part stays faint; the ride does not end |
| AS-7 | Tap Continue | The header goes back to "Riding to" with the remaining miles; the way ahead starts from the rider |
| AS-8 | Leave the way by more than 600 ft, then come back | The way redraws from where the rider is and still visits the remaining stops in path order |
| AS-9 | Open a place more than 1,000 ft from a drawn line | No Add button; "No drawn route reaches here yet" |
| AS-10 | Turn location off mid-ride | The ride ends cleanly, as it does today; no stale stops are left behind when it is turned on again |
| AS-11 | Close the ride with × at any point | All added stops are cleared |
| AS-12 | Bike Brevard Kids: add a school as a stop | Works the same; breweries never appear in the kids app |
| AS-13 | Adventure being followed, then Ride to here | Following ends, as today; adding stops works on the new ride |
| AS-14 | VoiceOver on: add and remove a stop | Every button is announced; the header reads the stop count |

## Decisions for Sarah before building

1. **Two stops or one?** Two covers UC-7; one is simpler to test.
2. **Path order or the order added?** Proposed: path order, because that is
   how people ride it.
3. **Where to remove a stop:** in the header's list (proposed) or on the
   stop's own card.
