# ADR 0002: Autonomy ladder

**Status:** Accepted · **Date:** 16 Oct 2026 · **Decider:** Claude, delegated by Amandeep ("you decide")

## Context

Agents that work around the clock will propose more than one person can review. Full autonomy from day one risks showing wrong facts at scale, which v1 names as the risk most likely to sink Lifelist. Review of everything does not scale. Trust needs to be earned, like a learner's permit before a full licence.

## Decision

Four levels, granted **per agent and per category** (for example, "Pairing Miner, sky lane").

| Level | May | Example |
| --- | --- | --- |
| **L0 Propose** | Queue a change for human approval | Prospector proposes a new experience |
| **L1 Refresh** | Update an existing fact from an official source or Tier A partner API, within tolerance | A price moves 8% on the Viator API |
| **L2 Extend** | Add offers, windows or pairings to experiences that are already live | A new operator offer for a live experience |
| **L3 Create** | Publish a new experience | A new twin for a live anchor |

### At launch

- **L1:** Verifier and Lane Scouts, for refreshes from Tier A partner APIs and allow-listed official sources. Tolerance: price ±20%; dates never auto-change; sold-out and closed apply at once.
- **Always allowed at any level:** hiding or pausing (withholding a stale fact, pausing a broken link, pausing on a safety advisory). Hiding is safer than showing. Un-hiding follows the agent's level.
- **L0:** everything else.

### Promotion (reviewed monthly)

An agent moves up one level in a category when all of these hold:

1. At least 100 decisions at the current level in that category.
2. At least 95% approved unchanged.
3. No critical error in the last 30 days.
4. Golden-set and agent eval accuracy of at least 98%.

### Limits

- **L3 is not available before Phase 3**, and only for twins and angles of live anchors in live lanes with at least two independent sources.
- **Safety-critical categories never go past L2:** altitude, polar, open water, wildlife on foot, extreme heat or cold, and anything with an age or fitness limit.
- **Never autonomous at any level:** spend, partner communication, new message templates, un-pausing after a safety advisory.

### Demotion

A **critical error** (a wrong date, visa rule or price shown to a person or agent) drops that agent one level in that category automatically, and the Night Manager reports it immediately.

### Review budget

The daily review queue holds at most 20 items, ranked by expected value. Escalations from the Concierge Desk come first, then contradictions, then Candidates.

## Consequences

- Early weeks are human-heavy by design; promotions should start reducing the queue in Phase 2.
- Pairing Miner and Lane Scouts are expected to earn L2 first; the Prospector last.
- Decisions and reasons are stored on each Candidate, so rejections teach the agents.
