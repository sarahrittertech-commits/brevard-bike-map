---
sidebar_position: 4
title: Use cases
---

# Use cases

Each use case maps to requirements in the [PRD](./prd) and to test cases in
[Test cases](./test-cases).

## UC-1 — Can I get there from here?

**Actor:** The local parent

**Trigger:** Wants to take the kids from home to the public pool.

**Flow:**

1. Opens the app. Map of Brevard loads with the path and connectors drawn.
2. Switches on Playgrounds. Pins appear; the sheet lists them by mile marker.
3. Taps the one she means. The sheet shows what it is and how far along the
   path it sits.
4. Reads the map: the dotted connector from her street to the path, then the
   solid line to the pin.
5. Decides whether to go.

**Requirements:** R1, R2, R3, R5, R6

**Succeeds when:** she can tell, without leaving the app, whether a
bike-friendly connection exists.

## UC-2 — What's near me worth riding to?

**Actor:** The visiting cyclist

**Trigger:** Arrived for the weekend, has a bike, doesn't know the town.

**Flow:**

1. Opens the app for the first time. No signup, no permissions wall.
2. Sees the map with the path network and the town's landmarks labelled.
3. Switches on Breweries and Ice Cream.
4. Taps two or three pins to read what they are.
5. Pulls the sheet up and reads the list end to end.

**Requirements:** R1, R2, R4, R7

**Succeeds when:** he understands the town's bikeable geography within roughly
thirty seconds of first launch.

## UC-3 — Brewery to brewery

**Actor:** The after-work rider

**Trigger:** Wants to link two or three stops into one ride.

**Flow:**

1. Opens the app.
2. Opens the adventures list.
3. Picks a multi-stop ride.
4. Views the full route with its stops in order.

**Requirements:** R5, R8

**Succeeds when:** she gets a ride idea she wouldn't have had on her own.

## UC-4 — Bike shop to trailhead

**Actor:** The visiting cyclist

**Trigger:** Renting or servicing a bike, then riding to the forest.

**Flow:**

1. Switches on Bike Shops and reads the list.
2. Opens Adventures and picks "Gateway to Pisgah".
3. Reads the stop-by-stop notes.
4. Taps "Show route on map" and follows it.

**Requirements:** R2, R5, R7

**Succeeds when:** the shop-to-trailhead connection is shown accurately. This
is the single most likely route a visitor rides, so it warrants extra care in
the data.

## UC-5 — Where can we eat that's open now?

**Status:** Proposed, 16 October 2026. Not built. Recorded so the restaurant
list can grow without re-deciding what the filters are for.

**Actor:** The local parent, or a visiting family, mid-ride

**Trigger:** Someone is hungry, it is 2:40 on a Tuesday, and one of the riders
is vegetarian.

**Flow:**

1. Switches on Restaurants. Pins appear; the sheet lists them by mile marker.
2. Taps **Open now**. Places closed at this minute drop out of the list and
   off the map.
3. Adds **Vegetarian**. The list narrows to places with a vegetarian option.
4. Taps a place and reads its hours, what it serves and a link to its menu.
5. Rides there, or opens an adventure that ends there.

**Requirements:** RF-1 to RF-8

**Succeeds when:** the family can tell, in under a minute and without leaving
the app, which places they can ride to and eat at right now.

### Requirements for restaurant filters

The list stays curated: every place is one person's choice of somewhere worth
riding to. Filters narrow that list; they never add places, rank them or take
payment to show them.

| # | Requirement | Priority |
| --- | --- | --- |
| RF-1 | With Restaurants on, a row of filter chips under the sheet header: Open now, Coffee, Breakfast, Lunch, Dinner, Vegetarian, Vegan | Must |
| RF-2 | Filters combine with AND: Open now + Vegan shows places that are both | Must |
| RF-3 | **Open now** is worked out on the phone from the place's weekly hours and the phone's clock, in Brevard time. No network call | Must |
| RF-4 | A place whose hours are not known never shows under Open now, and its detail says "Hours not confirmed" rather than guessing | Must |
| RF-5 | Breakfast, Lunch and Dinner mean the place serves that meal on some day, not that it is serving it now. Combining a meal with Open now means both | Should |
| RF-6 | Vegan and Vegetarian mean at least one main dish, not just a side. Vegan implies Vegetarian | Should |
| RF-7 | With filters that match nothing, the sheet says so and offers to clear them, rather than showing an empty list | Must |
| RF-8 | Filters are forgotten when the app closes. Nothing is stored | Must |
| RF-9 | Detail shows the next opening ("Opens 7am tomorrow") when a place is closed | Could |

### Data changes it needs

`hours` today is free text for display. Open now needs machine-readable hours
alongside it, so each restaurant gains:

```json
"openingHours": { "mon": [["07:00", "14:00"]], "tue": [], "sat": [["07:00", "11:00"], ["17:00", "21:00"]] },
"serves": ["coffee", "breakfast", "lunch"],
"diet": ["vegetarian"]
```

- `openingHours` — per day, a list of open–close pairs in 24-hour Brevard
  time, so a lunch-and-dinner place with a gap is two pairs. An empty list is
  closed; a missing day is unknown (RF-4). `hours` stays as the display text.
- `serves` — any of `coffee`, `breakfast`, `lunch`, `dinner`.
- `diet` — any of `vegetarian`, `vegan`.
- The validator checks the times parse, close is after open (or past
  midnight, written as `"24:30"`), and that every restaurant has all three
  fields before Open now ships.

### What it costs to keep true

Opening hours go stale faster than anything else in the dataset: seasonal
hours, food trucks, a day off for a holiday. A wrong "open now" sends a family
riding to a locked door, which is worse than no filter. Before RF-3 ships,
decide who rechecks hours and how often — monthly is the floor for food
trucks — and record the last-checked date per place so the validator can warn
when one is older than that.

### Out of scope, decided

Ratings, reviews, prices, delivery, reservations, ordering, and "near me"
sorting. The list stays ordered by mile marker, like every other category.

---

## Journeys the data must cover

These journeys should each be answered by at least one adventure:

- Bike shop → trailhead — *Gateway to Pisgah*
- Brewery → brewery — *Taproom Traverse*
- Playground → ice cream — *Playground to Dolly's*
- Playground → lunch — *Ninja Park and Smash Burgers*, *Steamers and Swings*
- Downtown → greenway access point — *Ride to a Downtown Festival*
