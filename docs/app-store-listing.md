---
sidebar_position: 11
title: App Store listing
---

# App Store listing

The copy and answers for App Store Connect, kept here so the listing is
versioned with the app rather than living only in Apple's web forms. Character
limits are Apple's and are counted below.

:::note
Submitting to the App Store was **not** part of the original plan — the
[release notes](./release-notes) and [ADR-0001](./architecture/adr-0001-app-platform)
call for ad hoc distribution to one phone. It was added on 25 September 2026.
App Review timing is outside our control and is the main risk to the ship date.
:::

## Identity

| Field | Value | Limit |
| --- | --- | --- |
| App name | `Bike Brevard Map` | 30 — using 16 |
| Subtitle | `The bike path and where it goes` | 30 — using 31 ⚠️ see below |
| Bundle ID | `dev.pushpop.brevardbikemap` | — |
| SKU | `brevard-bike-map-001` | — |
| Primary language | English (U.S.) | — |
| Copyright | `2026 Sarah Ritter` | — |
| Primary category | Navigation | — |
| Secondary category | Sports | — |
| Age rating | 4+ (no objectionable content, no web access, no user content) | — |

The subtitle above is one character over. Pick one of these instead:

- `The bike path and where it goes` — 31, too long by one
- `Brevard's bike path, mapped` — 27 ✅
- `Where the bike path can take you` — 32, too long
- `The path, and what's along it` — 29 ✅

## URLs

| Field | Value | Required |
| --- | --- | --- |
| Privacy policy URL | *docs site base* + `/privacy` | **Yes** |
| Support URL | *docs site base* + `/` | **Yes** |
| Marketing URL | `https://github.com/sarahrittertech-commits/brevard-bike-map` | No |

Both required URLs need the PushPopDev docs site base URL, which is not recorded
anywhere in this repository. Fill it in before submitting — Apple rejects
listings whose privacy or support URL does not resolve.

## Promotional text

*170 characters. Editable without a new build, unlike the description.*

```
Nine rides locals actually do, twenty-eight places worth stopping, and the path
that links them. Works with no signal, because the whole map is in the download.
```

## Description

*4000 characters. Using roughly 1,500.*

```
Brevard has a greenway and a lot of places worth riding to. What it hasn't had
is an answer to "can I bike from the brewery to the pool, and how?"

This is that answer, for this one town, made by someone who rides here.

THE PATH AND ITS CONNECTORS

The 3.5-mile Brevard Bike Path, drawn end to end, plus the three connectors
that riders actually use to get past where the pavement stops — the Main St
link, the new bridge connector, and the 2.6-mile Pisgah Forest link. Twelve
landmarks are labelled along the way so you can tell where you are.

PLACES, BY WHAT YOU WANT

Twenty-eight destinations you can switch on and off by category: ice cream,
playgrounds, breweries, bike shops and repair stations. Turn on what you're
looking for and the map shows only that, listed in the order you'll reach it
along the path with its mile marker. Turn everything off and you're back to
just the path.

NINE CURATED ADVENTURES

Rides that locals actually do, from a 3.8-mile spin to a downtown festival up
to the 15.5-mile Hub to Bracken and back. Each one has its distance, riding
time, difficulty and a stop-by-stop itinerary — and "show route on map" draws
the whole ride over the network with its stops numbered in order.

WHAT IT DOESN'T DO

No account. No sign-up. No advertising. No tracking of any kind, and it never
asks for your location. The entire map is bundled into the download, so it
works in Pisgah with no signal and costs nothing to run.

This app covers Brevard, North Carolina and nowhere else. That's deliberate.
A map made for one town can know things a map of everywhere cannot.
```

## Keywords

*100 characters total, comma-separated. Do not repeat the app name or category
names — Apple already indexes those.*

```
brevard,greenway,cycling,bike path,pisgah,dupont,trail map,offline,nc,transylvania
```

82 characters.

## What's New in this version

*For 1.0.0, Apple accepts a first-release note or none at all.*

```
First release.
```

## App privacy answers

In App Store Connect, under App Privacy, the answer to
**"Do you or your third-party partners collect data from this app?"** is **No**.

That single answer closes the whole questionnaire. It is accurate: there is no
analytics, no crash reporting, no advertising identifier, no accounts, no
network requests of our own, and no location permission. See the
[privacy policy](./privacy).

## Export compliance

Already answered in the build. `ITSAppUsesNonExemptEncryption` is `false` in
`app.json`, so App Store Connect stops asking on every upload. This is correct:
the app makes no network calls of its own.

## Screenshots

Apple requires one set at 6.9" (1320 x 2868 or 1290 x 2796). A 6.9" set is
accepted for every other iPhone size, so one set is enough.

Suggested five, in this order:

1. The map with the path drawn and landmark labels — the cold-launch view
2. Ice cream and breweries switched on, pins and the mile-ordered list showing
3. A place detail open in the sheet
4. The Adventures tab, photos visible
5. An adventure route drawn on the map with numbered stops

## Review notes

Suggested text for the App Review team:

```
This app needs no account and no sign-in. All data is bundled in the app; there
is no backend and no network access. It requests no permissions, including
location. The app covers one town, Brevard, North Carolina, so the map opens
there by design rather than at the reviewer's location.
```
