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

The 4-mile Brevard Bike Path, drawn end to end, plus the four connectors
that riders actually use to get past where the pavement stops — the Main St
link, the new bridge connector, the spur out to Oskar Blues, and the campground
connector to the Davidson River. Thirteen landmarks are labelled along the way
so you can tell where you are.

PLACES, BY WHAT YOU WANT

Twenty-nine destinations you can switch on and off by category: ice cream,
playgrounds, breweries, bike shops and repair stations. Turn on what you're
looking for and the map shows only that, listed in the order you'll reach it
along the path with its mile marker. Turn everything off and you're back to
just the path.

NINE CURATED ADVENTURES

Rides that locals actually do, from a 4.3-mile spin to a downtown festival up
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

## Asset Library, custom product pages and product page optimization

Apple added these three sections to App Store Connect on 5 October 2026, while
1.0.1 was still in review. They do not have to be filled in for the app to be
approved. What can be done now:

| Section | When | Why |
| --- | --- | --- |
| Asset Library | Now | Assets are reviewed on their own, separately from the app |
| Custom product pages | Draft now, submit after approval | Needs the app to be Ready for Distribution |
| Product page optimization | Once live and getting traffic | Needs a live app, and a test needs visitors to reach a result |

### Asset Library

Existing screenshots already show up here. What's new is two optional
creative assets, shown only to people on iOS 27 or iPadOS 27 and later:

| Asset | Shape | Size | Format |
| --- | --- | --- | --- |
| Product page header | 21:9 | 3840 x 1646 | JPEG or PNG; or a 5–30 s video, muted and looping |
| Search results | 3:2 | 1920 x 1280 to 3840 x 2560 | JPEG or PNG |
| Universal (covers both) | 16:9 | 5244 x 2950 | PNG |

Upload under **Product Page Information → Header and Search Results**, and
check the layout with **Preview** before submitting. The icon, app name and Get
button sit over the header, and Apple does not publish exactly where, so keep
the artwork's subject clear of the bottom of the frame.

**What to use:** the launch-screen artwork, widened — the bike in front of
three receding ridges under a sunrise sky. It is already the app's own art, it
matches the icon, and it reads as Brevard without words. `assets/splash.png` is
1170 x 1580, so it needs re-exporting from the source artwork at the wide size
rather than stretching. No alpha channel, the same trap as the icon.

**What not to use:** anything from the brewery category, or a photo with a
person's face in it. Creative assets are held to a 4+ standard regardless of
the app's own rating, and the header is the first thing a family sees. The
same reasoning already keeps breweries out of the promotional text — see
[age suitability](./age-rating).

### Custom product pages

Alternate versions of the product page, each with its own URL. Each can change
the screenshots, the promotional text (170 characters) and, from iOS 27, the
header. Apple allows up to 70; three is plenty.

They follow the three audiences on the landing page's "Who it's for"
section, so a link from each card lands on a page about the same thing.

Keywords can be attached to a page, but only from the approved version's
keyword list, and each keyword can belong to only one page. Leave the deep
link field empty: the app opens to the map and has no deep links to point at.

#### Page 1 — Families (`families`)

The one that matters. The app's audience is families, and this is the page to
link from the school pickup line.

Promotional text, 137 characters:

```
Short rides with a playground or an ice cream stop built in, so little riders get a win before they get tired. Free, offline, no sign-up.
```

Screenshots: ice cream and playgrounds switched on → Adventures tab →
Playground to Dolly's on the map → place detail → the path alone.

Keywords: `ice cream`, `greenway`.

#### Page 2 — Riders (`riders`)

Promotional text, 141 characters:

```
Demo a bike at a Brevard shop and ride it from the path straight out to Pisgah. A real test ride, with no bike rack and no trailhead parking.
```

Screenshots: bike shops and repair stations switched on → Gateway to Pisgah
on the map → The Hub to Bracken and Back detail → Adventures tab → the path
alone.

Keywords: `pisgah`, `cycling`, `trail map`.

#### Page 3 — Taprooms (`taprooms`), optional

The landing page has this audience, so the option is here. It is the one page
whose subject the main listing deliberately does not lead with, so it is worth
deciding whether to have it at all rather than making it by default. If it is
made, it is only reached by its own link, never by a family browsing the main
page.

Promotional text, 148 characters:

```
Leave the car at the hotel. The Taproom Traverse links Brevard's taprooms along the bike path, with stop-by-stop notes and a map that works offline.
```

Screenshots: Taproom Traverse on the map → its detail → breweries switched on
→ the path alone. Use the launch artwork for the header here too, not a
taproom photo.

No keywords: nothing in the approved list belongs to this page more than to
the other two.

#### After approval

1. Create each page in App Store Connect, paste the text, pick the screenshots
   from the Asset Library, and submit. Pages are reviewed without a new build.
2. Set each page visible once approved; keywords only take effect then.
3. Copy each page's URL into the matching card on the landing page alongside
   the main App Store link (see the bike-brevard-site README).

### Product page optimization

An A/B test of the main product page: up to three alternate versions of the
screenshots, previews or icon, for up to 90 days, with Apple reporting which
gets more downloads.

Not yet. It needs a live app, and an app for one town of 8,000 people will
take a long time to send enough visitors through it for a result. Apple's
estimator says so up front; if it says more than 90 days, don't start it.

When there is traffic, test one thing: **the first screenshot.**

- Original: the map with the path drawn, the cold-launch view.
- Treatment: ice cream and playgrounds switched on, pins and the list showing.
- 50% of traffic to the treatment.

That asks the one question worth answering: does showing the places sell the
app better than showing the path? Do not test the icon — an alternate icon
has to ship inside the binary, which means a new build for an experiment.
