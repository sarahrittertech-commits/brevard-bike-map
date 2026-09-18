---
sidebar_position: 2
title: Product requirements
---

# Product requirements

## Problem

Someone in Brevard wants to ride somewhere specific — a trailhead, a brewery,
the pool, a playground — and doesn't know the bike-sensible way to get there.
The information exists in local riders' heads and not much anywhere else.

## Goal

Ship a mobile app by **30 September 2026** that shows Brevard's bikeable
connections between named local destinations, good enough that a resident or
visitor could actually use it to plan a short ride.

## Success criteria

The project succeeds if all four are true on ship day:

1. The app installs and runs on a real phone.
2. A rider can pick two destinations and see a bikeable route between them.
3. The destination data is real Brevard data, not placeholder content.
4. The repository, documentation and release notes are public and coherent.

Note what is absent: downloads, users, retention, revenue. Those are not
success criteria for this project.

## In scope

| # | Requirement | Priority |
| --- | --- | --- |
| R1 | Display a map of Brevard centred on the town | Must |
| R2 | Show destinations as tappable markers, grouped by category | Must |
| R3 | Show the paved path and its connectors as a distinct layer | Must |
| R4 | Tap a destination to see its name, category and a short description | Must |
| R5 | Follow a curated adventure route on the map, with its stops in order | Must |
| R6 | Show distance and ride time for an adventure | Should |
| R7 | Filter destinations by category | Should |
| R8 | An Adventures tab: a list of curated rides, each with a story and stop-by-stop notes | Must |
| R9 | Work offline once loaded | Could |

Anything at **Could** gets cut without discussion if the ship date is at risk.

### Design reconciliation — 18 September 2026

The [app design](https://github.com/sarahrittertech-commits/Bike-Path-Adventures-Map-Design)
changed two requirements. R5 was "pick a start and an end"; the design has
no pair-picking and instead routes riders through curated adventures, which
is what [ADR-0003](./architecture/adr-0003-route-data) argued for anyway.
R8 moved from Could to Must because the design is built around it. The
design also decides that no filters means *no pins* — just the path — rather
than all pins.

## Explicitly out of scope

These are not deferred, they are decisions:

- User accounts, logins, profiles
- User-generated content, reviews, ratings, photos
- Turn-by-turn voice navigation
- Live GPS tracking or ride recording
- Any town other than Brevard
- Any shared infrastructure with the women's outdoor community app
- Payments, subscriptions, ads
- Web version

## Constraints

| Constraint | Implication |
| --- | --- |
| ~10–20 hours/week available | Roughly 30 working hours total before ship |
| Solo build | No code review; lean on tests and small commits |
| Route data already collected | No survey or data-gathering phase needed |
| Public repository | Commit history is part of the deliverable |

## Open questions

These need Sarah's decision before or during build:

- ~~**Route data format**~~ — the design carried the data as TypeScript
  literals; it now lives as JSON in `src/data/`. The network geometry is
  traced, not surveyed — replace with the town GIS centerline before launch.
- ~~**Routing approach**~~ — settled by the design: curated adventures over a
  drawn network. See [ADR-0003](./architecture/adr-0003-route-data).
- **Distribution** — TestFlight link, Android APK, or Expo Go? Affects whether
  ship day needs an app store review window. See
  [ADR-0001](./architecture/adr-0001-app-platform).
