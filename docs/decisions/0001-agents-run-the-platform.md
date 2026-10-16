# ADR 0001: Agents run the platform

**Status:** Accepted · **Date:** 16 Oct 2026 · **Decider:** Amandeep

## Context

v1 used agents mainly to answer requests (Orchestrator, Curator, Feasibility, Composer) and to watch suppliers (Scouts). Nothing read demand, and nothing proposed new experiences. With 12–15 hours a week, the founder cannot do discovery, curation and operations by hand.

## Decision

Agents run **discovery, curation and operations** around the clock, organised as a newsroom with five desks (Discovery, Curation, Service, Engagement, Operations). The founder acts as editor-in-chief: sets policy, approves what the autonomy ladder reserves, and reads one daily digest.

Coding agents build the platform from specs and acceptance tests, but that is a separate concern; this ADR is about who **operates** it.

## Consequences

- New agents: Pulse, Trend Scout, World-change Scout, Prospector, Pairing Miner, Editor, Experimenter, Nudge, Concierge Desk, Night Manager, Partner Ops.
- New records: Signal, Candidate, Demand.
- An event bus, durable workflows, per-agent budgets and a kill switch become Phase 1 work.
- The founder's scarce time moves from upkeep to judgement: about 10 minutes a day on the review queue.
