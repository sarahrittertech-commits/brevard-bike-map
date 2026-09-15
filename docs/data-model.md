---
sidebar_position: 5
title: Data model
---

# Data model

The app ships its data as static files bundled with the build. There is no
backend and no database — see
[ADR-0004](./architecture/adr-0004-storage-and-costs).

Four entities: **Destination**, **Route**, **Category**, **Adventure**.

## Destination

A place worth riding to.

```json
{
  "id": "dollys-dairy-bar",
  "name": "Dolly's Dairy Bar",
  "category": "ice-cream",
  "coordinates": [-82.7871, 35.2834],
  "description": "Ice cream at the entrance to Pisgah. Busy in summer.",
  "bikeParking": true,
  "seasonal": true
}
```

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | Kebab-case slug, stable, used in route references |
| `name` | string | yes | Display name |
| `category` | string | yes | Must match a Category `id` |
| `coordinates` | `[lon, lat]` | yes | GeoJSON order — longitude first |
| `description` | string | yes | One or two sentences, plain language |
| `bikeParking` | boolean | no | Defaults to `false` |
| `seasonal` | boolean | no | Flag places that close off-season |

:::caution Coordinate order
GeoJSON is `[longitude, latitude]`. Most mapping tutorials and Google Maps show
`latitude, longitude`. Getting this backwards puts every marker in the wrong
hemisphere, and it is the single most common bug in this kind of app.
:::

## Route

A known-good bikeable connection between two destinations.

```json
{
  "id": "dollys-to-sycamore",
  "from": "dollys-dairy-bar",
  "to": "sycamore-cycles",
  "geometry": {
    "type": "LineString",
    "coordinates": [[-82.7871, 35.2834], [-82.7901, 35.2811]]
  },
  "distanceMiles": 1.4,
  "estimatedMinutes": 9,
  "surface": "greenway",
  "confidence": "verified"
}
```

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | Slug, conventionally `from-to-to` |
| `from` / `to` | string | yes | Destination `id`s |
| `geometry` | GeoJSON LineString | yes | The drawn path |
| `distanceMiles` | number | yes | Computed from geometry, stored for speed |
| `estimatedMinutes` | number | yes | At roughly 9 mph casual pace |
| `surface` | enum | yes | `greenway` · `quiet-road` · `main-road` · `mixed` |
| `confidence` | enum | yes | `verified` · `probable` · `unverified` |

**Routes are directional in the data but treated as bidirectional in the app.**
A route from A to B is displayed for a B to A request with the geometry
reversed. This halves the data-entry work.

`confidence` exists because of the local parent persona. Only `verified` routes
should be presented without qualification.

## Category

```json
{
  "id": "ice-cream",
  "label": "Ice cream",
  "icon": "ice-cream",
  "color": "#E8846B"
}
```

Planned categories: `bike-shop`, `brewery`, `ice-cream`, `playground`,
`trailhead`, `pool`, `coffee`, `food`, `park`.

## Adventure

A curated multi-stop ride. Optional feature (R8).

```json
{
  "id": "brewery-crawl",
  "name": "The slow brewery crawl",
  "description": "Three stops, mostly greenway, no hurry.",
  "stops": ["oskar-blues", "ecusta-brewing", "brevard-brewing"],
  "totalMiles": 4.2,
  "estimatedMinutes": 28
}
```

An adventure is valid only if a Route exists for every consecutive pair of
stops. This should be checked by the validation script, not at runtime.

## File layout

```
src/data/
  destinations.json
  routes.json
  categories.json
  adventures.json
```

## Validation

A script at `scripts/validate-data.js` runs in CI and before release. It checks:

- Every `category` on a destination matches a Category `id`
- Every `from` / `to` on a route matches a Destination `id`
- Every `id` is unique within its file
- Coordinates fall inside a bounding box around Brevard — catches reversed
  lat/lon immediately
- Every adventure's consecutive stop pairs have a corresponding route
- No route has `confidence: "unverified"` in a release build
