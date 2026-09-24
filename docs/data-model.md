---
sidebar_position: 5
title: Data model
---

# Data model

The app ships its data as static files bundled with the build. There is no
backend and no database — see
[ADR-0004](./architecture/adr-0004-storage-and-costs).

Five entities: **Category**, **Destination**, **Network segment**,
**Landmark**, **Adventure**. The shape follows the
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
{ "id": "ice-cream", "label": "Ice Cream", "color": "#D9538B" }
```

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Kebab-case slug |
| `label` | string | Display name |
| `color` | hex string | Pin, chip and rail colour |

The glyph for a category lives in `src/components/CategoryIcon.js`, keyed on
the category `id`. It is deliberately not in the data: it is a component, not
a value, and an icon name in JSON would be a second source of truth.

Categories: `ice-cream`, `playground`, `brewery`, `bike-shop`, `repair`.

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

## Network segment

A piece of the rideable network. `main` is the separated paved path; a
`connector` is a sidewalk, quiet street or bridge that links the path to
the places around it. Connectors draw dashed so the two stay distinguishable.

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

An always-on orientation label — the courthouse, the hospital, the college.
Not filterable, not tappable; it exists so a rider can place themselves in
town at a glance.

```json
{ "id": "courthouse", "name": "Courthouse", "coordinates": [-82.7345, 35.2337], "labelSide": "left" }
```

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | string | yes | Keep it short. The app only covers Brevard, so "Transylvania County Library" is just "Library" — long names crowd each other at the widest zoom |
| `labelSide` | enum | yes | `left` · `right` — which side of the dot the label sits on, so it stays on screen |
| `labelOffsetY` | number | no | Pixels to shift the text vertically. For the handful of landmarks that share a latitude and would otherwise print on top of each other. Moves the text only; the dot stays on its coordinate |

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
| `stops[].destination` | string | Optional Destination `id`. Stops without one (a parking lot, "lunch downtown") are named but not pinned |
| `route` | LineString | Drawn once per adventure. Out-and-back rides draw one direction; `miles` is the full ride |

## File layout

```
src/data/
  categories.json
  destinations.json
  network.json
  landmarks.json
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
