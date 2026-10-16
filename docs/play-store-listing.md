---
sidebar_position: 15
title: Google Play listing
---

# Google Play listing

The copy, answers and assets for the Play Console, kept here for the same reason
as the [App Store listing](./app-store-listing): so they are versioned with the
app. Drafted 12 October 2026. **Nothing here is submitted.** Character limits
are Google's and are counted below.

## Where shipping stands

Last updated 15 October 2026.

- **Decided 12 October: ship to Google Play**, with the honest data safety
  answers below and the reworded "What it doesn't do" paragraph.
- **The Play developer account is not open yet.** On 12 October the Play
  Console for `sarahrittertech@gmail.com` still showed the "Creating a developer
  account" page — either sign-up was not finished, or the account was made
  under another Google account. Creating it, the $25 fee and Google's identity
  check are Sarah's to do; nothing below can start until the console opens on
  its dashboard.
- **A Play bundle exists**, though it is no longer current (next point): EAS
  build `1f9f4bd3`, profile `production`, versionCode 2, from `677e8e5`.
  The `.aab` is uploaded by hand in the Play Console — it is far over the size
  a browser automation can attach.
- **It needs rebuilding before upload.** `f3f641f` (iPhone Duo, 15 October)
  unlocked rotation and changed layout on every platform after that bundle
  and after every Android check below. Rebuild, then re-run MT-A1 to MT-A7 on
  the emulator — rotation (MT-7) now matters on Android too.
- **The release is a closed test, not production**, because of the testing
  gate below. It needs the email addresses of at least 12 testers.
- **After the first upload, add Play's signing SHA-1 to the Maps key.** Play
  re-signs the app with its own key (Play Console → App integrity). The key in
  Google Cloud project `brevardbikeapp` is restricted to the EAS upload key's
  SHA-1 only, so without this the copy installed from Play fails to load the
  map while the APK works.

The order, once the account is open: create the app (Sarah confirms Google's
declarations) → store listing, content rating and data safety from this page
→ rebuild and upload the bundle → closed test with 12 testers → Play's SHA-1 on
the Maps key → 14 days → apply for production.

## Before any of this

**A Google Maps key.** Done 12 October 2026 — project `brevardbikeapp`, in
EAS as `GOOGLE_MAPS_ANDROID_API_KEY`. An Android build without it crashes on
launch, and `app.config.js` refuses to build it. Setup is in the [runbook](./runbook#android). No screenshot can
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

No account. No sign-up. No advertising. The app itself collects nothing. Tap
the location button and it shows where you are on the map; your location never
leaves your phone. The entire map of places and rides is bundled
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

None of it is location from our code, none of it is
used for advertising, and our code sees none of it. But "No data collected"
would be an incorrect declaration on Play, and an incorrect declaration is a
policy violation.

**Location (since the location update).** With the dot on, Google's Maps SDK
draws the rider's position, so check Google's disclosure for whether the SDK
then counts as collecting approximate or precise location, and answer to match.
Our own code reads one position to centre the map and keeps none.

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

**Decided 12 October 2026: ship with the honest answers.** The reasoning, kept
for the record: three published statements say the app collects
nothing, and one of them is in the App Store description. On Android they
are true of the app and not of the map inside it. The options were: ship Android
with the honest Data safety answers above and the reworded paragraph (the
privacy policy already names Google Maps); or not ship to Play, and keep the
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
| Phone screenshots | 2–8, long side at most twice the short, no alpha | Five at 1080 x 2160, from build 2 |

The icon and feature graphic are generated into
`~/Desktop/bike-brevard-play/`, next to the App Store screenshots, rather than
committed: they are listing assets, not app assets.

The five screenshots are the same screens as the App Store set, in
`~/Desktop/bike-brevard-play/phone/`. The Pixel emulator is 1080 x 2400, which
is 2.22:1 and over Play's 2:1 limit, so they were taken with the emulator set
to 1080 x 2160 (`adb shell wm size 1080x2160`, reset afterwards) and Android's
demo mode for a clean 9:41 status bar, then flattened to RGB.
