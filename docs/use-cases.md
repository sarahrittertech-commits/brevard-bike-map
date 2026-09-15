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

1. Opens the app. Map of Brevard loads with destinations visible.
2. Taps the pool marker.
3. Sets her current area as the start.
4. App displays the connecting route, distance and approximate ride time.
5. She reads the route and decides whether to go.

**Requirements:** R1, R2, R3, R5, R6

**Succeeds when:** she can tell, without leaving the app, whether a
bike-friendly connection exists.

## UC-2 — What's near me worth riding to?

**Actor:** The visiting cyclist

**Trigger:** Arrived for the weekend, has a bike, doesn't know the town.

**Flow:**

1. Opens the app for the first time. No signup, no permissions wall.
2. Sees the map with all destinations and the path network.
3. Filters to breweries and food.
4. Taps two or three to read what they are.
5. Picks one and views the route.

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

1. Filters to bike shops.
2. Selects one as the start.
3. Selects a trailhead as the destination.
4. Views the route.

**Requirements:** R2, R5, R7

**Succeeds when:** the shop-to-trailhead connection is shown accurately. This
is the single most likely route a visitor rides, so it warrants extra care in
the data.

---

## Journeys the data must cover

From the collected route data, these specific pairs should all resolve:

- Bike shop → trailhead
- Brewery → brewery
- Ice cream / slushy → public pool
- Playground → playground
- Downtown → greenway access point
