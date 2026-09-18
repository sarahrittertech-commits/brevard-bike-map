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

---

## Journeys the data must cover

These journeys should each be answered by at least one adventure:

- Bike shop → trailhead — *Gateway to Pisgah*
- Brewery → brewery — *Taproom Traverse*
- Playground → ice cream — *Playground to Dolly's*
- Downtown → greenway access point — *Ride to a Downtown Festival*
