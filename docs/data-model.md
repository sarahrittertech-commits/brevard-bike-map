---
sidebar_position: 5
title: Data model
---

# Data model

The app ships its data as static files bundled with the build. There is no
backend and no database — see
[ADR-0004](./architecture/adr-0004-storage-and-costs).

Six entities: **Category**, **Destination**, **Network segment**,
**Landmark**, **Crossing**, **Adventure**. The shape follows the
[app design](https://github.com/sarahrittertech-commits/Bike-Path-Adventures-Map-Design)
(18 September 2026), which replaced pairwise start/end routes with a drawn
path network plus curated adventures.

:::caution Coordinate order
Everything here is GeoJSON: `[longitude, latitude]`. Brevard is roughly
`[-82.73, 35.23]` — longitude is the negative one. Most mapping tutorials and
Google Maps show `latitude, longitude`. Getting this backwards puts every marker
in the wrong hemisphere, and it is the single most common bug in this kind of
app. The validator catches it.
:::

## Category

```json
{ "id": "ice-cream", "label": "Ice Cream", "color": "#D325ED" }
```

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Kebab-case slug |
| `label` | string | Display name |
| `color` | hex string | Pin, chip and rail colour |

The glyph for a category lives in `src/components/CategoryIcon.js`, keyed on
the category `id`. It is deliberately not in the data: it is a component, not
a value, and an icon name in JSON would be a second source of truth.

Categories: `ice-cream`, `playground`, `restaurant`, `brewery`, `bike-shop`, `repair`.

## Destination

A place worth riding to. Shown as a pin when one of its categories is switched
on, and listed in the sheet ordered by mile marker.

```json
{
  "id": "squatch",
  "name": "Squatch Bikes & Brews",
  "categories": ["bike-shop", "brewery"],
  "coordinates": [-82.7322, 35.2374],
  "description": "Shop and taproom in one at 170 King St, on the King St row.",
  "mileMarker": 0.7,
  "hours": "Wed–Sun 11–8pm"
}
```

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | Kebab-case slug, stable, referenced by adventure stops |
| `name` | string | yes | Display name |
| `categories` | string[] | yes | One or more Category `id`s. A place can be a shop *and* a taproom |
| `coordinates` | `[lon, lat]` | yes | |
| `description` | string | yes | One or two sentences, plain language |
| `mileMarker` | number | yes | Miles from the West Main trailhead; orders the list |
| `hours` | string | no | Free text, shown as a chip |
| `website` | URL | no | Opens in the browser from place detail. Restaurants link to their menu, and the link says "See the menu" |

## Network segment

A piece of the rideable network. `main` is the separated paved path; a
`connector` is a sidewalk, quiet street or bridge that links the path to
the places around it. Connectors draw as solid warm gray lines and the path as green, so the two stay distinguishable.

```json
{
  "id": "bridge-connector",
  "name": "New Bridge Connector",
  "kind": "connector",
  "miles": 0.9,
  "note": "Crosses the new bridge from the north end and continues to Dolly's.",
  "geometry": { "type": "LineString", "coordinates": [[-82.706, 35.2701], [-82.7054, 35.2723]] }
}
```

The first and last points of the `main` segment are the two trailheads.

## Landmark

An always-on orientation label — the library, the hospital, the college.
Not filterable, not tappable; it exists so a rider can place themselves in
town at a glance.

```json
{ "id": "library", "name": "Library", "coordinates": [-82.7355, 35.232], "labelSide": "left" }
```

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | string | yes | Keep it short. The app only covers Brevard, so "Transylvania County Library" is just "Library" — long names crowd each other at the widest zoom |
| `labelSide` | enum | yes | `left` · `right` — which side of the dot the label sits on, so it stays on screen |
| `muted` | boolean | no | Drawn in gray, and gives way first where labels collide: a point to find your way by rather than somewhere to ride to. The hospital (Sarah, 23 October) |
| `labelOffsetY` | number | no | Pixels to shift the text vertically. For the handful of landmarks that share a latitude and would otherwise print on top of each other, or whose text would lie across the path: the map draws labels over the route, never under it. Moves the text only; the dot stays on its coordinate |

## Crossing

A road the path crosses. It is not a stop and it is not drawn on the map:
it is a warning in a followed ride's stop list, a small traffic cone and
"Cross here · <road>", between the stops where the line passes it. Only
the line as drawn: a ride drawn there and back lists the way home's
crossings in their place, and one drawn one way lists no way back (Sarah,
24 October). The header counts the roads ("5 stops · 5 crossings"). Located from where Sarah
stood on each side of the road, 23 October 2026; the coordinate is the
midpoint, and only decides where in the list a crossing falls.

```json
{ "id": "deerlake", "name": "Deerlake Rd", "coordinates": [-82.722333, 35.248347], "button": false }
```

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | string | yes | The road crossed, shown after "Cross here" |
| `button` | boolean | yes | Whether there is a push button to cross. Not shown in the app today; the cone just says "Cross here" |

The validator fails a crossing more than 200 ft from the network (DT-13).

## Adventure

A curated ride with a story, an ordered list of stops and a drawn route.
This is where [ADR-0003](./architecture/adr-0003-route-data)'s hand-curation
lives: every route is a line someone has ridden.

```json
{
  "id": "playground-to-dollys",
  "title": "Playground to Dolly's",
  "tagline": "The after-school classic",
  "story": "Start downtown, let everyone burn off a first round of energy ...",
  "image": "playground-to-dollys",
  "miles": 4.7,
  "minutes": 45,
  "difficulty": "easy",
  "kidFriendly": true,
  "stops": [
    { "destination": "silvermont-park", "name": "Silvermont Park", "note": "Playground, pavilion, and shade before you start." },
    { "name": "Lunch downtown", "note": "Lock up on Main." }
  ],
  "route": { "type": "LineString", "coordinates": [[-82.7345, 35.2337], [-82.736, 35.234]] }
}
```

| Field | Type | Notes |
| --- | --- | --- |
| `image` | string | Basename of a photo in `assets/adventures/` |
| `difficulty` | enum | `easy` · `moderate` · `ambitious` |
| `stops[].destination` | string | Optional Destination `id`. Stops without one (a parking lot, "lunch downtown") are named but not pinned, unless they have `coordinates` |
| `stops[].coordinates` | `[lon, lat]` | Optional. Pins a stop that is not a place, such as a sculpture, and wins over the destination's coordinates. Within 500 ft of the route (DT-11) |
| `route` | LineString | Drawn as ridden. A ride that comes home the way it went is drawn there and back, so a stop on the way home is placed on the way home and NEXT reaches it (Ball Field to Library Loop, Concert Night, Short Track Social). One drawn one way shows no way back, crossings included; `miles` is the full ride |

## Two apps from one dataset

Bike Brevard Map and Bike Brevard Kids are built from the same files
(16 October 2026). Any item — category, destination, network segment,
landmark, adventure, or an adventure's stop — can carry two optional fields:

| Field | Type | Notes |
| --- | --- | --- |
| `apps` | `("map" \| "kids")[]` | Only when the item belongs to just one app. Missing means both. Breweries, the taprooms and the Taproom Traverse are `["map"]`. An empty list, `[]`, hides the item from both apps while keeping its data: restaurants, their places and the two lunch rides, pulled from 1.1.0 on 21 October 2026 (see the [roadmap](./roadmap)) |
| `kids` | object | Fields that read differently in Bike Brevard Kids, laid over the item there. Squatch is `{ "name": "Squatch Bikes", "categories": ["bike-shop"], ... }` |

`forApp` in `src/lib/select.js` applies both, and `src/lib/data.js` hands the
screens only the result, so no screen knows there are two apps. DT-10 checks
each app holds together on its own and keeps adult wording out of the kids
build.

## File layout

```
src/data/
  categories.json
  destinations.json
  network.json
  landmarks.json
  crossings.json
  adventures.json
assets/adventures/
  <adventure image>.jpg
```

## Validation

`scripts/validate-data.cjs` runs in CI and before release. It checks:

- Every destination has at least one category, and each resolves (DT-1)
- Every adventure stop's `destination` resolves (DT-2)
- Every `id` is unique within its file (DT-3)
- Every coordinate — destinations, landmarks, network, routes — falls inside a
  bounding box around Brevard, which catches reversed lat/lon immediately (DT-4)
- Every adventure has at least two named stops and a route (DT-5)
- No name containing "sample" or "placeholder" reaches a release build (DT-6)
- Stated distances are plausible against drawn geometry (DT-7, warning only —
  out-and-back rides legitimately draw half their distance)
- DT-8 to DT-13: places near the network, no point sitting on a drawn vertex,
  each app holding together on its own, stops' own locations near their
  route, NEXT going forward along every ride, and crossings on the network.
  See [Test cases](./test-cases) for each
