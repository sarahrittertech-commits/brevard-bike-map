---
sidebar_position: 11
title: App Store listing
---

# App Store listing

The copy and answers for App Store Connect, kept here so the listing is
versioned with the app rather than living only in Apple's web forms. Character
limits are Apple's and are counted below.

:::note
The Women in AI challenge requires the app to be **submitted to the App Store by
30 September 2026**, so submission is the goal rather than an addition to it.
This corrects the earlier plan, which described ad hoc distribution to one phone
as sufficient.

The requirement is to *submit*, not to be *approved*. Submission is within our
control; App Review's timing is not. The deadline is therefore met by uploading
the binary and sending it for review, whenever approval lands.
:::

## Identity

| Field | Value | Limit |
| --- | --- | --- |
| App name | `Bike Brevard Map` | 30 — using 16 |
| Subtitle | `bike around town Brevard, NC` | 30 — using 28 |
| Bundle ID | `dev.pushpop.brevardbikemap` | — |
| SKU | `brevard-bike-map-001` | — |
| Primary language | English (U.S.) | — |
| Copyright | `2026 Sarah Ritter` | — |
| Primary category | Travel | — |
| Secondary category | Navigation | — |
| Age rating | Answer the questionnaire honestly — see below | — |

Travel rather than Navigation as the primary: Navigation is the turn-by-turn
category, and this app deliberately has no routing, no GPS and no turn-by-turn
(ADR-0003). Travel describes what it is — a local guide to places worth going,
with curated itineraries. Not Sports or Health & Fitness either: both imply
activity tracking, which is explicitly out of scope. Categories can be changed
in App Store Connect at any time without a new build.

Sarah's wording, chosen 25 September 2026. It earns the "NC": Brevard County,
Florida is a much larger place, so "Brevard" alone is ambiguous in search and
the app name has no room to say which one. Earlier candidates are kept below
only as a record of what was considered.

- `The bike path and where it goes` — 31, one over the limit
- `Brevard's bike path, mapped` — 27
- `The path, and what's along it` — 29

## Pricing and availability

| Field | Value |
| --- | --- |
| Price | Free ($0), no in-app purchases |
| Availability | United States only |

Free is the decision the project already made — see the "no monetisation" note
in the [product requirements](./prd). It also avoids the Paid Applications
agreement, which needs banking and tax details and is a common way to lose days
before a deadline.

United States only, chosen 25 September 2026, because the app maps one town in
North Carolina. The cost worth remembering: this app is the entry for a group
challenge, and anyone in that group outside the US cannot download it — the
listing does not exist in their store. Availability can be changed at any time
without submitting a new build.

## URLs

| Field | Value | Required |
| --- | --- | --- |
| Privacy policy URL | `https://github.com/sarahrittertech-commits/brevard-bike-map/blob/main/docs/privacy.md` | **Yes** |
| Support URL | `https://github.com/sarahrittertech-commits/brevard-bike-map/issues` | **Yes** |
| Marketing URL | `https://github.com/sarahrittertech-commits/brevard-bike-map` | No |

These resolve only while the repository is **public**. Making it public is
already a v1.0.0 deliverable, and the commit history is part of the proof of
work. If it is ever taken private again, these listing URLs break and Apple will
flag them.

## Promotional text

*170 characters. Editable without a new build, unlike the description.*

```
Mobile app that shows ice cream, playgrounds, local businesses on the bike path that links them. Works with no signal, because the whole map is in the download.
```

Sarah's wording, chosen 25 September 2026. Note it says "local businesses"
rather than naming the brewery category — the promotional text is the first
thing a browser reads, and there is no reason for it to lead with alcohol when
the category is mostly bike shops and places that serve food. See
[age suitability](./age-rating).

Promotional text can be changed at any time without submitting a new build,
unlike the description.

## Description

*4000 characters. Using 1986.*

Rewritten by Sarah on 25 September 2026, replacing an earlier draft of mine. The
opening is the part that matters: it says who the app is for and why it exists,
in her voice and from her own riding, which is what the first draft was reaching
for when it claimed the app was "made by someone who rides here" — a claim that
was not mine to make and was removed.

The disclaimer before WHAT IT DOESN'T DO is hers too. It is worth keeping: not
every destination sits directly on the path, and saying so plainly is both
honest and the kind of thing that heads off complaints.

```
Brevard, North Carolina has a greenway and a lot of places worth biking to even
with small children in tow. This app is meant to encourage both visitors and
local families to brave small adventures around town. Biking to the playground
and then to ice cream has helped my little family enjoy this small Western North
Carolina town. We hope this app helps us meet up with our friends and new faces
in some of our favorite local places.

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

*disclaimer not every destination is exactly on the bike path, but these are all
destinations I have biked to with a small child, take your time and follow
general safety rules

WHAT IT DOESN'T DO

No account. No sign-up. No advertising. No tracking of any kind, and it never
asks for your location. The entire map is bundled into the download, so it
works in Pisgah with no signal and costs nothing to run.

This app covers Brevard, North Carolina and nowhere else. That's deliberate.
A map made for one town can know things a map of everywhere cannot.
```

## Keywords

*100 characters total, comma-separated. Do not repeat the app name or category
names — Apple already indexes those. Every term here must correspond to
something the app actually contains; Apple rejects keywords that do not.*

```
brevard,greenway,cycling,bike path,pisgah,ice cream,trail map,offline,nc,transylvania
```

85 characters.

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

## Age rating

Do **not** assume 4+. The app has a Breweries category containing ten licensed
premises, so the questionnaire's alcohol question cannot be answered "none".
Answer it truthfully and accept whatever rating results: a declaration that does
not match the app risks rejection now or removal later, which is far worse than
a higher rating.

Apple revised its age rating tiers in 2025, so check the current questionnaire
rather than relying on what a previous submission produced.

For the optional "age suitability URL" field, use:

`https://github.com/sarahrittertech-commits/brevard-bike-map/blob/main/docs/age-rating.md`

That page explains what the brewery category actually is — four of the ten are
bike shops with a taproom, most serve food, none can be bought from in the app,
and the categories are off by default.

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
