---
sidebar_position: 1
title: Architecture decisions
---

# Architecture decisions

An architecture decision record captures a choice that was hard to make and
would be expensive to reverse, along with the reasoning at the time. The value
is in the reasoning — six weeks from now the decision will look obvious and the
reason it was difficult will have been forgotten.

Each record has a status:

| Status | Meaning |
| --- | --- |
| **Proposed** | Drafted, not yet confirmed by the owner |
| **Accepted** | Confirmed and in effect |
| **Superseded** | Replaced by a later record, kept for the history |

## Records

| # | Decision | Status |
| --- | --- | --- |
| [0001](./adr-0001-app-platform) | Build with Expo and React Native | Proposed |
| [0002](./adr-0002-map-rendering) | Render maps with react-native-maps | Proposed |
| [0003](./adr-0003-route-data) | Hand-curate routes rather than compute them | Proposed |
| [0004](./adr-0004-storage-and-costs) | Ship static data, run no backend | Proposed |

:::note All four are Proposed
These were drafted during project setup and reflect a recommendation, not a
commitment. Read the alternatives in each before accepting — particularly
0003, which is the one with a real argument on both sides.
:::
