---
sidebar_position: 16
title: Brand guide
---

# Brand guide

The name, logo, colours, type and voice of Bike Brevard Map, collected in one
place so the App Store art, the landing page and anything made in Canva match
the app. Everything here is taken from the app's own sources: the icon colours
in the [runbook](./runbook), the interface colours and fonts in
`src/theme.js`, and the pin colours in `src/data/categories.json`. If one of
those changes, this page changes in the same commit.

## Name and tagline

- **App name:** Bike Brevard Map
- **Tagline:** Bike around town, Brevard, NC
- Always say "Brevard, NC" or "Brevard, North Carolina". Brevard County,
  Florida is much larger, so "Brevard" alone is ambiguous.

## Logo

The app icon is a bike in front of three receding mountain ridges under a
cream sky, with a blue river and a grey path. The launch screen adds a sunrise
above the ridges and the wordmark below: "Bike Brevard Map" in heavy navy sans
serif, with "Brevard, North Carolina" underneath.

| File | Use |
| --- | --- |
| `assets/icon-light.png` | The icon, default |
| `assets/icon-dark.png` | The icon on dark backgrounds |
| `assets/icon-tinted.png` | iOS tinted icon |
| `assets/android-icon-monochrome.png` | One-colour version |
| `assets/splash.png` | Icon with the wordmark |

The editable source is `Bike Brevard Icon (source).dc.html` in `final/` on
Sarah's Desktop.

- Don't stretch, recolour or crop the icon.
- Leave clear space around it, at least a quarter of its width.

## Colours

### Icon and marketing

| Role | Hex |
| --- | --- |
| Cream (background, sky) | `#F6F3EC` |
| Far ridge, lavender | `#C6C2E0` |
| Middle ridge | `#8E90C4` |
| Near ridge | `#4A5596` |
| Bike, indigo | `#3F3893` |
| Navy text | `#1E2557` |
| Sunrise peach | `#F7C48E` |
| Path grey | `#9E99AE` |

The App Store headers of October 2026 use a grey-purple ridge set,
`#C9C1CC` · `#9C91A1` · `#6A5F70`, so the indigo bike stands out against the
mountains.

### In the app

From `src/theme.js`: canvas `#F7F4EC`, ink `#1A2117`, forest `#1F4D3A`, clay
`#BC5B27`, hairline `#E2DCCE`.

### Map pins

| Category | Hex |
| --- | --- |
| Ice cream | `#D9538B` |
| Playgrounds | `#BE7A0E` |
| Breweries | `#8A4A1E` |
| Bike shops | `#2C6BA8` |
| Repair stations | `#4A7C59` |

## Type

All three are free Google Fonts.

| Use | Font |
| --- | --- |
| Marketing headlines | Open Sans ExtraBold, navy |
| App interface | Inter: Regular, Medium, SemiBold, Bold |
| Display accent | Fraunces SemiBold |

## Voice

Short, warm and local, written as a Brevard mom who rides the path with her
daughter. Practical rather than promotional: playgrounds, ice cream,
breweries, the trail out to Pisgah. Name real places, and never promise what
the app doesn't do. There is no turn-by-turn navigation and no ride tracking.

## In Canva

Canva has no Brand Kit for this app, because creating one needs a paid plan
and has to be done by hand in Canva. Instead, a brand guide design and the
logo files were uploaded to Sarah's Canva on 20 October 2026, in the folder
"Bike Brevard Map – Brand" and in Uploads. To use the brand with Canva's
assistant, attach the icon or the wordmark logo and paste the colours and
fonts above.
