---
sidebar_position: 6
title: ADR-0005 Feedback and metrics
---

# ADR-0005 — Collect feedback with a web survey, not in-app analytics

**Status:** Proposed · **Date:** 16 October 2026

## Context

1.0 has shipped. The next job is learning whether it is useful and what to
build next. The plan is a short launch survey: about 20 questions, five
minutes. Q1 sorts each respondent into one of four personas. Each persona
gets two questions of its own, then everyone answers the same shared
questions. Those include the Sean Ellis "very disappointed" test, a five-item
feature ranking, 1–5 ease scores and a few open "why" questions.

Four facts shaped the decision:

- **The app collects nothing, and says so in public.** The
  [privacy policy](../privacy), the App Store description ("No tracking of
  any kind") and the App Privacy answer ("No, we do not collect data") all
  promise it. The Kids app is built from the same code and makes the same
  promise to parents.
- **The app cannot change without a new store build.** `expo-updates` is not
  installed, so any code added to the app waits for a build and an App Review.
- **The survey needs particular question types:** branching on Q1, a ranking
  question, "pick up to 2" multiple choice, 1–5 scales and free text.
- **People will arrive from several places:** QR codes on signs, the release
  announcement, the Women in AI group, local bike and parent groups, and
  later a link in the app. Knowing which channel worked is a metric in itself.

## Options considered

### 1. Product analytics in the app (PostHog)

PostHog is already available to us. Its React Native SDK would record screen
views, which categories and adventures people open, and whether they return.
Its surveys feature can show popups inside the app, and the free tier
includes 1,500 survey responses a month.

**Against it:** it needs a new build and review. It breaks all three public
privacy promises, which would mean rewriting the policy, the listing and the
App Privacy answers. The Kids app would inherit the same tracking. PostHog's
survey question types also have no ranking question, which Q16 needs. The
usage data would be interesting, but a town-sized app with a few dozen users
gives too little of it to justify those costs.

### 2. An in-app survey popup after five minutes

This would catch people while the app is fresh in their mind.

**Against it:** it needs a new build. Five minutes in, the user is probably
riding and checking the map, so the popup lands at the worst moment. To
avoid asking twice, the app would also have to store "already asked" on the
phone, and the privacy policy says it stores nothing. The survey plan itself
says to ask 2–7 days after first use, not during it.

### 3. Build our own form on Supabase

We already run Supabase for another project, so we could build a custom
form and store the answers there.

**Against it:** this means building and hosting a web page, a schema and
spam protection, all to rebuild what free form tools already do.
[ADR-0004](./adr-0004-storage-and-costs) already turned down a backend for
this app, and free-tier databases pause when inactive.

### 4. A hosted form tool

The survey lives on the web. Signs, posts and the app all link to the same
URL. The app collects nothing, and the questions can change at any time with
no build. Four tools were compared:

| | Tally (free) | Google Forms | Microsoft Forms | Typeform / SurveyMonkey (free) |
| --- | --- | --- | --- | --- |
| Responses | Unlimited | Unlimited | Unlimited | Capped at a handful a month |
| Branching on Q1 | Yes | Yes, by section | Yes, single choice only | Yes |
| Ranking question (Q16) | Yes, drag to sort | No; grid workaround, clumsy on phones | Yes | Varies |
| Tag the traffic source from the link | Yes, hidden fields | No | No | Paid |
| Feels good on a phone | One question at a time, or one page | Fine | Fine | Good |
| Export | CSV, Google Sheets | Google Sheets | Excel | Limited |

## Decision

**Run the survey on Tally's free plan. Tag every link by where it was shared,
and add nothing to the app for now.**

Tally is the only free option that does both things the analysis needs. It
has a real ranking question for Q16. Its hidden fields read a value from the
link, so `?src=sign`, `?src=announcement`, `?src=wia` and later `?src=app`
are saved with each response. That gives a response count per channel with
no tracking in the app. Its branching handles the persona routing, and
answers flow into Google Sheets for analysis.

Usage numbers come from tools that need no code:

- **App Store Connect App Analytics:** page views, downloads, sessions and
  retention, from users who agreed to share data with developers.
- **App Store campaign links:** the App Store link behind each QR code gets
  `?pt=…&ct=…` so downloads can be traced to individual signs.
- **Google Play Console statistics,** once the Android release is live.

## Consequences

**Good:** the privacy promises stay true, so no policy, listing or App
Privacy changes are needed. The survey can be edited, versioned and re-sent
for Round 2 with no build. It costs nothing, and no backend means nothing to
look after.

**Bad:**

- **No data on what people do in the app.** The analysis step "check what
  people did against what they said" has to rely on store analytics and
  interviews, not tap-level data. Any write-up should say so.
- **App Store analytics only counts people who opted in,** so treat its
  numbers as a direction, not a count.
- **Tally's free plan shows Tally branding and doesn't save half-finished
  answers.** Both are acceptable for a five-minute survey.
- **The "Give feedback" link in the app waits for the next store build.**
  It goes at the bottom of the Trail Facts panel in the map sheet, opening
  the survey with `?src=app`. It has no timer, no popup and nothing stored
  on the phone.
- **Q18 asks for an email address, so the survey collects personal data
  that the app never does.** The Tally form needs a one-line note saying
  what the email is used for (a follow-up chat) and that it is optional.

## Revisit when

Bring analytics back into the discussion only if a question comes up that the
survey and store numbers can't answer, and that question is worth rewriting
the privacy promises for. Write that up as a new record that supersedes this
one.
