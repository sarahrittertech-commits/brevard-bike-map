---
sidebar_position: 14
title: iPhone Duo design review
---

# iPhone Duo design review

Reviewed 14 October 2026 against version 1.0.1, Apple's
[Designing for iPhone Duo](https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo)
(published 9 September 2026), [Preparing your app for iPhone Duo](https://developer.apple.com/documentation/technologyoverviews/preparing-your-app-for-iphone-duo)
and the [Apple Design Resources](https://developer.apple.com/design/resources/)
page. Nothing here is committed work yet. It is the input to deciding what goes
into the next version.

## Summary

The app will *run* on iPhone Duo today, but it won't *fit* it. Three things
cause most of the problems:

1. **It's locked to portrait and assumes one phone shape.** iPhone Duo's main
   rule is "build your app to resize". Our app.json pins `orientation:
   portrait`, and the layout uses fixed offsets from the top and bottom.
2. **Our tab bar, back button and call-to-action are hand-built.** On iPhone
   Duo the system moves tab bars and toolbars to the *side* of the screen. It
   only does this for bars it owns. Apple's developer notes say so directly:
   an item that uses a custom view "doesn't present vertically". Our
   `BottomNav` will stay at the bottom and use up the outer display's scarce
   height.
3. **We ignore left and right safe areas.** On iPhone Duo the status bar,
   camera and system bars can sit on the left or right edge. The header card,
   category rail and map fitting all assume insets exist only at the top and
   bottom.

The fixes come in two tiers. **Tier 1** makes the app correct on Duo. It is
small and stays inside the current architecture. **Tier 2** makes it *feel*
native on the big inner display. It is mostly a layout change, but it reopens
the "no navigation library" decision.

## Sizing spec

### Displays

Apple publishes pixel sizes in the App Store screenshot specifications. The
point sizes below are derived at @3x, which divides evenly. **Confirm them in
the iPhone Duo simulator** with `useWindowDimensions()` before building to
them: this Mac has Xcode 27.0, which has no iPhone Duo simulator.

| Display | Orientation | Pixels (Apple) | Points (derived @3x) | Size class (width) | Bars per HIG |
| --- | --- | --- | --- | --- | --- |
| Outer (closed) | Portrait | 1398 × 2034 | **466 × 678** | Compact | On the side |
| Outer (closed) | Landscape | 2034 × 1398 | **678 × 466** | Compact | On the side |
| Inner (open, book) | Landscape | 2853 × 2007 | **951 × 669** | Regular | On the side |
| Inner (open) | Portrait | 2007 × 2853 | **669 × 951** | Regular | Standard top/bottom |

For comparison, an iPhone 17 is 402 × 874 pt. The outer display is **16% wider
and 22% shorter**. Vertical space is the constraint everywhere in this
review.

The fold runs down the middle of the inner display: around **x ≈ 475** in
landscape and **y ≈ 475** in portrait. Its width and the size of the side
bars aren't published. Measure them in the simulator (see "Measuring" below)
rather than guessing.

### Reserved regions

| Region | When | What it means for us |
| --- | --- | --- |
| Outer front camera (a corner) | Always | Lines up with the side controls. Our right-edge category rail and header card must keep clear of it. |
| Inner front camera | Only while the camera is active | We don't use the camera, so this only matters if another app activates it. Safe areas cover it. |
| Fold | Inner display, partially open | Divides the screen in two. Nothing tappable should sit across the middle. |

Safe areas from `react-native-safe-area-context` should report the camera and
the side bars. There is **no JavaScript binding for the fold**
(`ReservedRegion`) or for `ArrangementView`. Reaching either means writing a
native module. See "What we won't do".

### Targets and tokens to change

| Element | Today | Spec |
| --- | --- | --- |
| Sheet close (×), following-card close | 16 pt icon + 8 pt padding = **32 pt** | **44 × 44 pt** minimum hit area. This is an HIG rule on every iPhone, Duo or not. |
| Detail Back pill | ~32 pt tall | 44 pt tall, or a system back button (Tier 2) |
| Category rail buttons | 46 pt | Keep |
| Header / rail horizontal offset | Fixed `left: 16` / `right: 12` | `16 + insets.left` / `12 + insets.right` |
| Map sheet peek | 112 pt | Keep on outer. 112 pt is 17% of 678. |
| Map sheet expanded | 64% of height | Keep on outer. On inner portrait, **snap to 50%** so the sheet's top edge lands on the fold. |
| Detail hero | `aspectRatio: 3/2` at full width | Cap at **min(width ÷ 1.5, 40% of height)**. At 951 pt wide, the uncapped hero is 634 pt tall: nearly the whole 669 pt screen. |
| Featured adventure image | `aspectRatio: 3/2` | Same cap. On regular width, put the image beside the text instead. |
| Adventure stats | 2 × 2 grid | 2 × 2 on compact, **4 × 1** on regular. Use even column counts, per HIG, so a grid splits cleanly at the fold. |
| Text column width | Full width | Cap body text (story, stop notes) at about **600 pt** on regular width. |

## Findings, screen by screen

### Whole app

- **F1: The portrait lock and `supportsTablet: false`.** Remove the
  orientation lock (`"orientation": "default"`). Leave tablet support off:
  iPhone Duo is an iPhone, so it doesn't need it. The HIG says to use size
  classes and to "allow the existing layout to expand", not to design per
  pose.
- **F2: Layout comes from screen measurement, not size classes.**
  `MapScreen` measures its own height through `onLayout`, which is the right
  approach. Add one hook, `useLayoutClass()`, that returns `compact` or
  `regular` from `useWindowDimensions()`. Use **width ≥ 600 pt** as the
  threshold: it matches the system's regular width on the inner display. Every
  layout decision below hangs off that one value. Don't branch on device model
  or orientation. Apple calls this out by name.
- **F3: Custom bars won't move to the side.** See Tier 2. Until that lands,
  the bottom nav costs about 80 pt on the outer display, roughly 12% of its
  height.
- **F4: Side insets are ignored.** This affects `MapScreen` (header, rail),
  `TrailMap` (route fitting) and `AdventuresScreen`/`AdventureDetailScreen`
  (horizontal padding). Read `insets.left` and `insets.right` everywhere we
  read `insets.top`. Treat the two sides separately: Apple notes they will
  differ.
- **F5: SDK tier.** Per Apple, an app built with Xcode 26 or earlier doesn't
  extend under the status bar and camera. Third-party guides report that full
  edge-to-edge and vertical bars need the **iOS 27.1 SDK**. We need an EAS
  build image with Xcode 27.1 (and Xcode 27.1 locally for the simulator).
  *Answered 15 October 2026:* SDK 57 can build with Xcode 27 once iOS scene
  support is switched on, and it now is. EAS still defaults SDK 57 to Xcode
  26.6, so the image has to be pinned. See the runbook, "Which Xcode EAS
  builds with".

### Trail Map (outer display)

The outer display at 466 × 678 pt with our current layout:

```
status/top inset ~59 + 12  → header card       (~71–135)
rail starts at top + 80    → 7 buttons × 46 + 8 gap ≈ 330 pt (~151–481)
sheet peek top             → 678 − nav ~80 − 112 = ~486
```

The rail ends about **5 pt above the sheet**. It fits, but only just, and any
adventure-following header or larger text breaks it.

- **F6:** Once the nav moves to the side (Tier 2), the sheet gains ~80 pt and
  this resolves. Without Tier 2, **move the Clear / Recenter group to the left
  edge**, or into the header row, on compact-height layouts (height < 700 pt).
- **F7: Route fitting** (`TrailMap` `fitToCoordinates`) passes top and bottom
  edge padding only. Add left and right padding of `insets + rail width` on the
  rail's side, or a followed route draws under the rail.
- **F8: Apple Maps legal link.** `logoInset` lifts it above the peek. Also
  check it isn't under a side bar in landscape. Hiding it can get the app
  rejected.

### Trail Map (inner display)

This is where the HIG's "show an additional level of hierarchy" applies. Mail
shows the list and the message side by side; we should show **the list beside
the map** instead of a sheet on top of it.

- **F9: Inner landscape (951 × 669, the book-open pose).** Show a two-pane
  split. **The list/place detail goes in a leading pane, the map in the
  trailing pane.** Keep the category rail on the map, near the content it
  affects, per HIG "locate controls near the content they affect". Make the
  split at the fold (~475 pt), not at a fixed width. The panes then stay clean
  when the device is half-folded, and no tappable control sits on the crease.
  The bottom sheet doesn't render in this layout.
- **F10: Inner portrait (669 × 951).** Keep the map with the sheet, but give
  the sheet a **50% snap point**. When half-folded in this pose (tent/laptop),
  the map sits on the top half and the list on the bottom. That's what Apple's
  overlay arrangement does on its own, and we get it from a snap value.
- **F11: Even columns.** In the sheet's trail-facts view, the three
  `Fact` tiles become 4 (add trailheads count), or 2 + full-width. Three
  columns can't split evenly at the fold.

### Adventures list

- **F12: On regular width,** go **list + detail side by side** (the Mail
  pattern). Tapping an adventure fills the trailing pane instead of covering
  the screen. On compact width, nothing changes.
- **F13: The featured card** at 669 pt wide renders a 446 pt-tall image. On
  regular width, put the image and text side by side, or cap the image as in
  the spec table.

### Adventure detail

- **F14: The Back pill and the "Show route on map" bar are custom.** On Duo,
  Apple puts Back at the *top of the vertical bar* and prominent actions just
  below it. Our pill floats over the photo and our CTA sits at the bottom
  edge. Tier 1: make both 44 pt and inset-aware. Tier 2: Back becomes the
  system back button, and the CTA stays with the content as a full-width
  button at the end of the stops list. It also stays pinned on compact width,
  where it's the screen's main action.
- **F15: The hero image** needs the height cap. Behind a vertical bar, Apple
  recommends extending the hero *under* the bar
  (`backgroundExtensionEffect`). That's native-only, so let the image run
  full-bleed and keep text clear of the side insets.
- **F16: Stats** go 4 across on regular width (spec table).

## Tier 1: correct on Duo (recommended for the next version)

Small, stays in JavaScript, no new dependencies, and it improves every phone,
not just Duo.

1. Remove the portrait lock; add `useLayoutClass()`.
2. Respect left/right insets everywhere (F4, F7, F8).
3. Make every hit target 44 pt or more (spec table).
4. Cap the hero and featured image heights, and the text column width.
5. Add the 50% sheet snap point on regular-width portrait.
6. Build with the iOS 27.1 SDK; test all four pose/orientation combinations
   in the simulator.
7. Add the iPhone Duo screenshot sizes to the App Store listing (outer
   1398 × 2034, inner 2007 × 2853). Apple requires them from April 2027 for
   apps built with the iOS 27.1 SDK.

### Status, 14 October 2026

Items 1–5 are built. Item 5 became "the open sheet stops at the middle of the
window" rather than a third snap point. Half the *map* area would sit 35 pt
above the fold, because the tab bar takes height from the bottom.

Unlocking rotation also meant handling **phones on their side**, which this
review hadn't covered. An iPhone 17 in landscape is 874 × 402 pt, and the
upright layout doesn't fit it: the rail runs into the sheet. Any screen wider
than tall now docks the header and sheet into a left column (at most 400 pt,
always ending before the middle of the screen). The rail splits into two
columns wherever one won't fit. iPhone Duo open flat gets the same layout,
which is a cheap version of F9's two-pane split.

**Checked** on an iPhone 17 simulator: upright as before, plus a temporary
test view that rendered the app at 874 × 402, 466 × 678, 951 × 669 and
669 × 951, with guessed side insets.

**Not done**: items 6 and 7, and anything on a real iPhone Duo or its
simulator. This Mac has Xcode 27.0, which has no iPhone Duo device. F11 (four
fact tiles) was left out as cosmetic.

## Tier 2: native on Duo (a decision for Sarah)

The vertical tab bar only comes from the system tab bar. There are two ways
to get it:

| Option | What it costs | What we get |
| --- | --- | --- |
| **A. Native tabs**: `react-native-screens` bottom tabs (or Expo Router native tabs) and a native stack for the detail screen | Reverses the "no navigation library" decision in CLAUDE.md. Rewrites `App.js`'s state navigation. Third-party guides say native tabs on Duo are **not yet verified on device**. | The system puts the tab bar on the side, the correct side, beside the camera. Back moves to the top of the vertical bar. It also tracks future iOS changes for free. |
| **B. Imitate it**: `BottomNav` renders as a vertical rail when the layout is compact-height or inner-landscape | Stays in our own code; about half a day. | Approximate. We have to guess which edge the system uses (it follows the hardware, not the language), and Apple's HIG says not to override bar placement. Likely to look subtly wrong next to system apps. |

**Recommendation: A, once a simulator build has confirmed it actually moves
to the side.** If it doesn't, fall back to B for the Map tab only, with the
two-pane layouts (F9, F12) either way. The two-pane layouts are plain flexbox
and don't depend on this choice.

## What we won't do

- **A native module for `ReservedRegion` / `ArrangementView`.** The split at
  ~475 pt and the 50% snap give most of the benefit. A native module is the
  kind of shared infrastructure this project avoids.
- **Custom layouts per pose.** Apple says not to. Two layout classes (compact,
  regular) cover every pose.
- **Using both displays at once.** That's for camera apps.

## Measuring

Once Xcode 27.1 is installed, open the app in the iPhone Duo simulator through
Device Hub. In each of the four rows of the display table, record:

- `useWindowDimensions()`: confirms the derived point sizes.
- `useSafeAreaInsets()`: all four values, to get the side-bar and camera
  widths.
- A screenshot with the device partially folded, to see where the fold
  region falls relative to the map rail and the sheet.

Add the numbers to this page, replacing the derived ones.
