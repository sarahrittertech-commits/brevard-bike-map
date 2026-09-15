---
sidebar_position: 5
title: ADR-0004 Storage and costs
---

# ADR-0004 — Ship static data, run no backend

**Status:** Proposed · **Date:** 15 September 2026

## Context

The app needs destinations, routes and categories. There are no user accounts,
no user-generated content, and no data that changes without a code change. The
question is where that data lives.

A second consideration applies across the whole PushPopDev portfolio: every
service added to a project is a recurring cost and an ongoing operational
responsibility, and free tiers are how both arrive without being noticed.

## Options

### Static JSON bundled into the app

Data files live in `src/data/`, are bundled at build time, and ship inside the
binary. No network call. Works offline for free, which satisfies R9 without
writing anything.

Against it: changing a destination requires a new build and release.

### A backend — Supabase, Firebase or similar

Data updates without an app release. Room to grow.

Against it: an account, a schema, a client library, network error handling, a
loading state, and an offline story that now has to be built rather than
inherited. All of it in service of data that changes a handful of times a year.
Free tiers on hosted databases also pause or delete inactive projects, which
means a portfolio app can quietly break months after shipping — precisely when
someone is looking at it.

### A hosted JSON file

Middle ground: static file on a CDN, fetched at launch. Updates without a
release, but reintroduces network handling and an offline cache.

## Decision

**Static JSON bundled into the app.**

The data changes rarely, the app is small, and offline support comes free. A
backend here would be infrastructure in search of a requirement.

## Consequences

**Good:** no accounts, no schema, no network code, no loading states, no
running costs. Offline works by default. Nothing can break while unattended.

**Bad:** every data correction needs a release. Acceptable at this cadence, and
the [runbook](../runbook) covers the process.

## Cost position

| Service | Tier | Cost | What to watch |
| --- | --- | --- | --- |
| Expo EAS Build | Free | $0 | Monthly build limit; free builds queue behind paid |
| react-native-maps | — | $0 | Google Maps SDK free for mobile display; terms can change |
| GitHub | Free | $0 | Unlimited public repos; Actions minutes free for public |
| GitHub Pages | Free | $0 | Hosts the docs site |
| Data storage | — | $0 | Bundled in the app |
| **Total** | | **$0/month** | |

## On free tiers

The rule for the portfolio: **a free tier is a cost that hasn't arrived yet.**
Before adding any service to any project, record three things — what happens at
the limit, whether it pauses or bills, and what the paid tier costs. A service
that silently bills is worse than one that stops working.

This project's $0 is not a starter-tier $0. It is $0 because there is nothing
running. That property is worth protecting.

## Revisit if

The app needs data to change without a release, or gains any feature requiring
per-user state.
