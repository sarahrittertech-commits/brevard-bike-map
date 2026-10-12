---
sidebar_position: 15
title: Google Play listing
---

# Google Play listing

The copy, answers and assets for the Play Console, kept here for the same reason
as the [App Store listing](./app-store-listing): so they are versioned with the
app. Drafted 12 October 2026. **Nothing here is submitted.** Character limits
are Google's and are counted below.

## Before any of this: two things only Sarah can do

**A Google Maps key.** An Android build without one crashes on launch, and
`app.config.js` refuses to build it. Setup is in the [runbook](./runbook#android). No screenshot can
be taken until it exists, because the map is the app.

**A Play developer account, and its testing gate.** The account is a one-off
$25 registration. Personal accounts created after 13 November 2023 cannot
publish to production until a **closed test has run with at least 12 testers
opted in for 14 consecutive days**; organisation accounts are exempt. That is
two weeks of lead time that cannot be compressed, so it sets the earliest
Android release date, not the build. Confirm the current rule in the Play
Console help before planning around it — the figures above come from secondary
sources, and Google has changed them once already.

## Identity

| Field | Value | Limit |
| --- | --- | --- |
| App name | `Bike Brevard Map` | 30 — using 16 |
| Short description | `The Brevard, NC bike path, and the ice cream and playgrounds along it` | 80 — using 69 |
| Package | `dev.pushpop.brevardbikemap` | — |
| Default language | English (United States) | — |
| App or game | App | — |
| Category | Travel & Local | — |
| Price | Free, no in-app purchases | — |
| Countries | United States | — |
| Contains ads | No | — |

Travel & Local for the reasons the App Store listing gives for Travel: a local
guide with curated rides, not turn-by-turn navigation. United States only, as on
iOS.

The short description is the Play equivalent of Apple's subtitle plus
promotional text, and is what shows under the name in search. It names the
town's state for the same reason the iOS subtitle does: Brevard, Florida.

## URLs and contact

| Field | Value |
| --- | --- |
| Privacy policy | `https://github.com/sarahrittertech-commits/brevard-bike-map/blob/main/docs/privacy.md` |
| Website | `https://github.com/sarahrittertech-commits/brevard-bike-map` |
| Email | `sarahrittertech@gmail.com` — Play shows this publicly on the listing |

## Full description

*4000 characters.* Sarah's App Store description, unchanged except for **WHAT
IT DOESN'T DO**, which has to change on Android — see the data safety section
for why. Her opening and the disclaimer stay exactly as written.

Proposed replacement for that paragraph:

```
WHAT IT DOESN'T DO

No account. No sign-up. No advertising. The app itself collects nothing and
never asks for your location. The entire map of places and rides is bundled
into the download, so it works in Pisgah with no signal and costs nothing to
run. The street map underneath is Google Maps, which is part of Android rather
than part of this app.
```

## Data safety

This is the one place Android genuinely differs from iOS, and the answer is not
the same.

On iOS the map is Apple Maps, part of the operating system, so Apple's App
Privacy answer of **"No, we do not collect data"** is accurate. On Android the
map is drawn by Google's **Maps SDK for Android**, which ships inside the app,
and Play's Data safety form counts what third-party SDKs in the app collect —
not only what our own code does. Google's own disclosure for the SDK says it
collects, by default:

- device metadata — OS version, model, brand — and the SDK version
- crash stack traces and crash metrics
- the IP address
- a pseudonymous, SDK-specific identifier, to count daily users
- map interaction events (panning and zooming), because the app moves the map
  camera

None of it is location (the app has no location permission), none of it is
used for advertising, and our code sees none of it. But "No data collected"
would be an incorrect declaration on Play, and an incorrect declaration is a
policy violation.

Draft answers, **to be checked against Google's
[current disclosure](https://developers.google.com/maps/documentation/android-sdk/play-data-disclosure)
when the form is filled in**, since it changes with SDK versions:

| Question | Draft answer |
| --- | --- |
| Does your app collect or share any of the required user data types? | Yes |
| Is all collected data encrypted in transit? | Yes |
| Can users request that data be deleted? | No — none is held by the app; Google's data is under Google's policy |
| App info and performance → Crash logs, Diagnostics | Collected, not shared · Analytics · Not optional |
| App activity → App interactions | Collected, not shared · Analytics · Not optional |
| Device or other IDs | Collected, not shared · Analytics · Not optional |

**Decision for Sarah.** Three published statements say the app collects
nothing, and one of them is in the App Store description. On Android they
are true of the app and not of the map inside it. The options are: ship Android
with the honest Data safety answers above and the reworded paragraph (the
privacy policy already names Google Maps); or don't ship to Play, and keep the
APK for sideloading and showing the work. Swapping to a map with no SDK
telemetry means a different map library and a tile provider — ADR-0002's
rejected options — and is not a small change.

## Content rating

The IARC questionnaire in the Play Console. Answer the alcohol question the way
the [age suitability](./age-rating) page explains it: the app lists licensed
venues by name and address, with no depictions of drinking, no promotion and no
sales. No violence, no user interaction, no sharing of location, no purchases.
Accept the rating that results.

## Graphics

| Asset | Spec | Source |
| --- | --- | --- |
| App icon | 512 x 512 PNG, 32-bit | The 1024 icon, downscaled — Play applies its own mask |
| Feature graphic | 1024 x 500 PNG or JPEG, no alpha | Crop of `FINAL-launch-hero-1b-3200x1800.png` |
| Phone screenshots | 2–8, 9:16, at least 1080 px on the short side for promotion | **Blocked on the Maps key** |

The icon and feature graphic are generated into
`~/Desktop/bike-brevard-play/`, next to the App Store screenshots, rather than
committed: they are listing assets, not app assets.

Screenshots should be the same five screens as the App Store set, from the
emulator in the runbook once the key exists.
