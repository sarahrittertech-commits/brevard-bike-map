---
sidebar_position: 14
title: App Review response
---

# App Review response — Guideline 2.1

Apple asked for information on 29 September 2026 under Guideline 2.1,
"Information Needed — New App Submission". This is the standard questionnaire
for a developer account with limited review history, not a finding against the
app. Nothing in the message says anything is wrong with it.

Answers are kept here so they can be pasted into both the reply **and** the
Notes field of App Review Information, which Apple asks for so future
submissions do not repeat this.

## 1. Screen recording

Must be captured on a **physical device**, not the Simulator, starting with the
app launching. See [the runbook](./runbook) for how to record it and what to
cover. Nothing in the recording needs an account, a purchase or user-generated
content, because the app has none of those.

## 2. Purpose and target audience

> Bike Brevard Map is a free, offline map of the bicycle path in Brevard, North
> Carolina — a town of roughly 8,000 people in the Blue Ridge Mountains whose
> main industry is tourism.
>
> It shows the 3.5-mile paved path and the four connector routes that link it
> to the rest of town, 29 destinations along them, 13 labelled landmarks, and
> nine curated rides with stop-by-stop notes.
>
> The problem it solves: general-purpose map apps know the roads, but not which
> local connections cyclists actually use — the cut-through, the new bridge, the
> block of sidewalk everyone rides. A family cannot easily answer "can we bike
> from here to there, and how?" That knowledge is local and had not been written
> down.
>
> The target audience is families, both visiting and resident, riding bicycles
> around one small town. It is not aimed at athletes, racers or commuters.

## 3. Setting up and accessing the main features

> There is no setup. The app has no account, no login, no credentials, no sample
> files and requests no permissions of any kind, including location. It opens
> straight to the map.
>
> - **Launch** — the map of Brevard appears with the path drawn: a solid line
>   for the paved path, dotted lines for the connectors, with landmarks
>   labelled.
> - **Show places** — tap any of the five category buttons on the right edge
>   (ice cream, playgrounds, breweries, bike shops, repair stations). Pins
>   appear, and the sheet at the bottom lists them in the order you reach them
>   along the path, with each one's mile marker. Tap a category again to hide it.
> - **Place detail** — tap a pin, or a row in the list, for that place's
>   description, mile marker and opening hours.
> - **Just the path** — the button below the categories clears them all and
>   returns the sheet to trail facts.
> - **Adventures** — the second tab holds nine curated rides. Tap one for its
>   distance, riding time, difficulty, description and stop-by-stop notes, then
>   "Show route on map" to draw the whole ride over the map with its stops
>   numbered in order.
> - **Offline** — every map pin, route and description is bundled in the app.
>   It can be demonstrated in Airplane Mode.

## 4. External services, tools and platforms

> None. The app uses no third-party services to deliver its functionality:
>
> - **No data providers.** Every destination, route, landmark and description is
>   static JSON bundled inside the app binary.
> - **No authentication service.** The app has no accounts and no sign-in.
> - **No payment processor.** The app is free with no in-app purchases.
> - **No AI services.**
> - **No analytics, crash reporting, advertising or attribution SDKs.**
> - **No backend server.** The app makes no network requests of its own.
>
> The only external framework is Apple's own MapKit, used to draw the map. The
> app is built with Expo and React Native; the open-source libraries it links
> are react-native-maps (a MapKit wrapper), react-native-svg,
> react-native-safe-area-context and lucide-react-native for icons. None of them
> contacts a server.

## 5. Regional differences

> None. The app behaves identically everywhere. It contains a single fixed
> dataset covering one town, Brevard, North Carolina; there is no localisation,
> no region-gated content, and no server that could vary behaviour by region.
>
> It is distributed in the United States only, because its content describes one
> United States town and is of no use elsewhere.

## 6. Regulated industry and third-party material

> The app is not in a regulated industry and provides no service requiring a
> licence. It does not transact, book, reserve or sell anything.
>
> It lists ten businesses in a "Breweries" category. These are ordinary map
> listings of publicly operating businesses — name, street address, opening
> hours and distance along the path — of the same kind as every other category.
> Four of the ten are bicycle shops that also serve drinks. Nothing can be
> bought or ordered in the app, no business paid to be listed, and there is no
> age-restricted content or transaction. Further detail is published at
> https://github.com/sarahrittertech-commits/brevard-bike-map/blob/main/docs/age-rating.md
>
> Every photograph in the app was taken by the developer. There is no stock,
> licensed or third-party imagery anywhere in it, and no image was supplied by
> any of the businesses listed.
>
> Four of the nine show people. Two are the developer's own family,
> photographed from behind. One is a group photograph made for a public
> campaign for bicycle path funding in Brevard, which the developer is cleared
> to use in promoting the path — which is what this app does. The fourth shows
> a band performing at a public venue, photographed from the audience.

:::note Photographs resolved

Every adventure image is a photograph Sarah took, with the file-by-file
provenance in the [runbook](./runbook). Nothing from the design dataset remains
in the app, so there is no licence to carry.

Four of the nine show people, and the likeness question is answered for three
of them: the child on Main St (IMG_1036) and the baby at Bracken (IMG_2391)
are Sarah's own family, and the group ride (IMG_6045) is the photograph used
in the public campaign for bicycle path funding, cleared for use promoting the
path. That clearance is the basis of the answer above, so keep a copy of it
somewhere findable.

The fourth, IMG_8592, is a band on stage at a public venue shot from the
audience — the ordinary case for gig photography.

These nine are the set. They are the photographs Sarah owns the rights to,
which is the whole point, and they are not all of the exact spot the ride
names: the concert photograph is a band rather than the Music Center lawn, and
the Bracken one is a winter morning against eight green ones. That is a
decision, not a gap. A photograph that carries the feel of the ride and is
unambiguously ours beats a closer one that is not.
:::
