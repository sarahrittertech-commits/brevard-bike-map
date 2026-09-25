---
sidebar_position: 13
title: Direction after 1.0
---

# Direction after 1.0

Decisions and open questions recorded on 25 September 2026, the day 1.0 was
submitted. Nothing here is committed work; it exists so the reasoning is not
lost between releases.

## Bike to school is a separate, private app

A rider's own route to school is the use case the app grew out of — our
elementary school and the middle school are both on the bike path, with a
playground, skatepark, ball field and the library between them, and the schools
dismiss at different times.

**That use case is deliberately not in the public app.** A public app that maps
where children gather, beside the schools, alongside when each school lets out,
is a different thing from a private one used for a bike-to-school event. Same
data, very different exposure. If it is built it will be a separate private app
for the event, not a feature here.

This is a safety decision, not a scope one, and should not be reopened on
convenience grounds.

## What the public app is about

Families and visitors: playgrounds, parks and ice cream, and the path that links
them. Brevard's main industry is tourism, and ten of the twenty-eight
destinations are in the brewery category, most of which serve food and four of
which are bike shops with a taproom. The app is a local guide for a visiting or
resident family, which is why its App Store category is Travel.

## Monetisation is an open question, and the shape matters

1.0 shipped free with no business model, which the [product requirements](./prd)
record as a decision rather than an oversight. Revisiting it is legitimate, but
three statements already published would have to change, and one of them is a
URL given to Apple in the submission:

| Where | The promise |
| --- | --- |
| [Age suitability](./age-rating) — the URL attached to the App Store age rating | "No advertising, sponsorship or promotion. No business paid to be included and none can." |
| The App Store description | "No account. No sign-up. No advertising. No tracking of any kind." |
| App Privacy questionnaire | "No, we do not collect data" |

Three shapes, in increasing order of damage to the product:

**Tourism-body funding.** Transylvania County's tourism authority or Heart of
Brevard funds the app as a visitor service. One funder, no per-business
payments, nothing about the map changes, and it matches the town's actual
industry. There is already a Heart of Brevard contact. This is the one to try
first.

**Sponsorship that does not touch the map.** A business funds the app and is
thanked on a supporters screen; which places are listed stays editorial. Costs
one line of copy on the pages above. The map keeps its integrity.

**Paid placement.** A business pays to be listed, or listed higher. This breaks
all three promises and takes the app's main advantage with it: the description's
claim is that the list is one person's judgement about what is worth riding to,
and a visitor who suspects a pin was bought has no reason to prefer this to any
other directory. Not recommended.

An advertising SDK is a fourth shape and the worst of them — it would also
invalidate the privacy policy, the "no tracking" claim and the App Privacy
answer, on an app aimed at families.

## A 1.1 candidate, not yet decided

The destinations the origin story is about — the pool, the library, the
skatepark, the ball field — are not tappable categories. The ball field and the
library exist only as map labels. A "meet up here" category covering them would
be data plus one category with no new screens. It is the cheapest change that
would make the app match what it is for.
