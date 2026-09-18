---
sidebar_position: 4
title: ADR-0003 Route data
---

# ADR-0003 — Hand-curate routes rather than compute them

**Status:** Proposed · **Date:** 15 September 2026

This is the decision with a real argument on both sides. Read the alternatives
before accepting it.

## Context

The app shows a bikeable route between two chosen destinations. There are two
fundamentally different ways to produce that line, and they lead to different
apps.

## Options

### Hand-curated routes

Draw each connection once, store it as a LineString, look it up by
`from` and `to`. The [data model](../data-model) is written for this.

The obvious objection is combinatorial: *n* destinations imply *n(n−1)/2*
possible pairs. Twenty destinations would be 190 routes, which is not a
two-week job.

But the app does not need every pair. The [use cases](../use-cases) list five
journey types, and in a town this size those resolve to roughly **12 to 15
routes** — the greenway spine plus its spurs. Riders combine them naturally.

Every one of those routes is a line Sarah has personally ridden or verified.
(An earlier data model carried a per-route `confidence` field; the design
dropped it in favour of only shipping rides that are known good.)

### Computed routing over a path network

Model the bike path network as a graph — nodes at junctions, edges as
segments. Snap destinations to the nearest node. Run Dijkstra or A* on the
device to produce a route between any pair.

This is maybe a hundred lines of code and it scales to every pair for free. It
is the more elegant solution, and for a larger town it would be the right one.

Against it: it answers every query, including the ones where the honest answer
is "there isn't a good bike route." A shortest-path algorithm will happily send
the local parent and two children down the shoulder of a highway because it is
120 metres shorter. Producing *a* route is not the same as producing a route
worth riding, and fixing that means edge weighting, surface penalties and
tuning — which is where the hundred lines quietly becomes a weekend.

### A routing API

OSRM, GraphHopper or Valhalla, self-hosted or as a service. Correct for a
general product. For this one it adds a network dependency, a latency budget,
and a third-party account, to produce generic answers to a hyperlocal question.
A hosted routing service also becomes a cost the moment it stops being free.

## Decision

**Hand-curate the routes.**

*18 September 2026:* the app design realises this as a drawn path network
plus curated **adventures**, each with its own route line and ordered stops,
rather than pairwise start/end routes. Same principle, different packaging.

For the specific set of journeys this app serves, curation is both less work and
higher quality. Every displayed route is one a person has confirmed, which
directly serves the persona whose requirement is confidence rather than
optimality.

## Consequences

**Good:** no routing engine, no graph code, no tuning. Every route is verified.
Route quality is a data problem, and data is the thing already collected.

**Bad:** a journey with no adventure drawn for it has no route line — the
rider reads the network and the pin's position instead. Adding a destination
that deserves a route means adding or extending an adventure, not just a pin.

**Scaling limit:** this approach holds while the destination count is small.
Past roughly 25 destinations, or if the app extends beyond Brevard, the
curation cost exceeds the graph implementation cost and this decision should be
revisited.

## Revisit if

Destination count passes 25, the app covers a second town, or riders start
asking for pairs that aren't in the data often enough to be a real gap.
