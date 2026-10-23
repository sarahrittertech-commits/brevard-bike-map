---
sidebar_position: 4
title: Use cases
---

# Use cases

UC-6 to UC-10 are taken by [Add stops](./feature-add-stops).

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

## UC-11 — Pick a place and ride to it

**Status:** Recorded 23 October 2026. Draft. The basic use case the others
build on; tested place by place by MT-28.

**Actor:** Any rider

**Trigger:** Wants to go to one kind of place: ice cream, a playground, a
brewery, a bike shop or a repair station.

**Flow:**

1. Taps that category on the rail on the right. Its pins appear.
2. Taps a pin, or a row in the list.
3. Reads the card: what the place is, where it is on the path, its hours.
4. Taps **Ride to here** (turning on location if asked). The way is drawn
   from her to the place.

The list gives each place's miles: from the W Main St trailhead with location
off, and from her with location on.

**Requirements:** R2, R3, R5

**Succeeds when:** for every place on the map, she can read its card and get
a way drawn to it, and the pin is where the place is.

## UC-12 — Which ice cream today?

**Status:** Recorded from Sarah's walkthrough, 23 October 2026. Draft — the
flow is how it should work, not how it works today; see findings F-2 to F-4
in [Test cases](./test-cases#open-findings--walkthrough-23-october-2026).

**Actor:** The local parent, or anyone with a sweet tooth

**Trigger:** Wants ice cream on a ride, and wants to pick the place by what
kind they feel like today — soft serve, shaved ice, a sundae.

**Flow:**

1. Switches on Ice Cream. Pins appear on the map; the sheet stays down, so the
   pins are what she sees first.
2. Scans the pins. Several sit close together downtown, so she pans and
   zooms in to tell them apart.
3. Taps a pin, or slides the sheet up and taps a row in the list
   ("7 stops on the path").
4. The map centres on that place, and the card says what it serves.
5. Goes back to the list, taps the next one, and the map moves with her.
6. Picks one and rides there, or taps "Ride to here".

**Requirements:** R2, R3, R4

**Succeeds when:** she can compare every ice cream stop, see where each one is
on the map as she reads about it, and choose by what it serves.

## UC-13 — What is this app, and what are Adventures?

**Status:** Recorded 23 October 2026. Draft. See finding F-1.

**Actor:** The visiting cyclist, first launch

**Trigger:** Has just opened the app and taps the "Getting around Brevard by
bike" card to find out what she is looking at.

**Flow:**

1. Opens the app. The "Getting around" card is up.
2. Taps it. It explains the path, the sidewalks and the quiet-street
   connectors.
3. It also says, in a line or two each, what the **Trail Map** tab is for
   (places along the path, by category) and what an **Adventure** is (a ride
   locals actually do, with stops and notes).
4. Knows which tab to use for what she wants.

**Requirements:** R1, R8

**Succeeds when:** a first-time rider can say what an Adventure is without
having opened the Adventures tab.

## UC-14 — Plan today's streets, and what's along them

**Status:** Recorded 23 October 2026. Draft. See findings F-5 and F-6.

**Actor:** A rider heading somewhere specific today

**Trigger:** Has picked a place (White Squirrel Arcade, in the walkthrough)
and wants to know how to get there and what else is on the way.

**Flow:**

1. With Ice Cream on, opens the list and taps the place.
2. Turns on location and taps **Ride to here**. The way is drawn from the
   blue dot to the pin, with miles and minutes in the header.
3. Pinches, zooms and drags the map to read which streets the way uses.
4. Switches on Breweries to see what else sits along the way. Brewery pins
   appear round the ride; the ride carries on.
5. Taps the close button to end the ride when done.

**Requirements:** R2, R3, R5

**Succeeds when:** before setting off, she knows the streets she will ride and
what she could stop at on the way, and the pin she is riding to is where the
place actually is.

## UC-15 — Ride to a place, and see what else is around it

**Status:** Recorded 23 October 2026. Draft. The advanced form of UC-11 and
UC-14. See findings F-6 and F-7.

**Actor:** A rider already on the way somewhere

**Trigger:** Riding to one place, wants to know what else is near the way or
near where she is going.

**Flow:**

1. Starts Ride to here to a place (UC-11).
2. Switches on one or more other categories. Their pins appear round the way.
3. Taps one of those pins and reads its card, without losing the ride.
4. Closes that card and carries on to the place she set out for, or ends the
   ride.

**Requirements:** R2, R3, R5

**Succeeds when:** during any ride, every other category can be shown and any
of its places read, and the ride is still there afterwards. Tested for every
combination by MT-29.

**The same need with an adventure (Sarah, 23 October):** with the brown route
drawn — riding to a place, or following an adventure after Show route on
map — she wants to explore what is on that route: open each numbered stop,
switch on a category and open the places along the line, close the card and
open the next. This is the use case the app has struggled with most:
sometimes a card does not show up. Every tap on a stop or a pin along a drawn
route opens its card, every time, and closing a card leaves the route as it
was. Tested by MT-41 to MT-44; the open problem is F-19.

## UC-16 — Browse adventures, then follow one

**Status:** Recorded 23 October 2026. Draft. See findings F-8 to F-11.

**Actor:** Any rider looking for a ride idea

**Flow:**

1. Opens the Adventures tab and taps an adventure. Reads its detail.
2. Taps back. Returns to the Adventures list.
3. Opens another adventure and taps **Show route on map**.
4. The route is drawn with a numbered dot for every stop the header says it
   has ("6 stops", six dots).
5. Opens and collapses the header card to read the list of stops.
6. Taps a dot. The stop's card opens with its note, and the distance and time
   from her if location is on.

**Requirements:** R5, R8

**Succeeds when:** every stop an adventure lists is on the map and can be
opened, and every stop is somewhere a rider can actually stop.

---

## Journeys the data must cover

These journeys should each be answered by at least one adventure:

- Bike shop → trailhead — *Gateway to Pisgah*
- Brewery → brewery — *Taproom Traverse*
- Playground → ice cream — *Playground to Dolly's*
- Playground → lunch — *Ninja Park and Smash Burgers*, *Steamers and Swings*
- Downtown → greenway access point — *Ride to a Downtown Festival*
