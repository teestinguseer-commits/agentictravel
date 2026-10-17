# Lifelist docs

Lifelist is an agent-first platform for rare travel experiences, run around the clock by agents that find and suggest new experiences based on what people search, save and book, and on what the world is talking about.

## Reading order

1. [PLAN.md](PLAN.md): the build plan, v2. Start with "What changed from v1".
2. [agents/README.md](agents/README.md): the agent mesh, the clock, shared rules and budgets.
3. [architecture/graph.md](architecture/graph.md): the Experience Graph, including Signal, Candidate and Demand.
4. [architecture/events.md](architecture/events.md): the event bus that keeps agents working without polling.
5. [architecture/mcp-tools.md](architecture/mcp-tools.md): the public tool layer for personal AIs, the web app and internal agents, with full contracts for the first four tools in [architecture/contracts.md](architecture/contracts.md).
6. [decisions/](decisions/): the decisions behind the design.
7. [learning/](learning/README.md): the learning track. Lifelist as a teaching hospital, with 14 rotations, a JD-by-JD coverage map for the 25 PM roles, and the proof portfolio.

## Agent specs

| Desk | Agents |
| --- | --- |
| Discovery | [Pulse](agents/pulse.md) · [Trend Scout](agents/trend-scout.md) · [World-change Scout](agents/world-change-scout.md) · [Lane Scouts](agents/lane-scout.md) · [Prospector](agents/prospector.md) · [Pairing Miner](agents/pairing-miner.md) |
| Curation | [Verifier](agents/verifier.md) · [Editor](agents/editor.md) · [Curator](agents/curator.md) · [Experimenter](agents/experimenter.md) |
| Service | [Orchestrator](agents/orchestrator.md) · [Feasibility](agents/feasibility.md) · [Composer](agents/composer.md) · [Booker](agents/booker.md) |
| Engagement | [Watcher](agents/watcher.md) · [Nudge](agents/nudge.md) · [Concierge Desk](agents/concierge-desk.md) |
| Operations | [Night Manager](agents/night-manager.md) · [Partner Ops](agents/partner-ops.md) |

## Decisions

| ADR | Decision | Status |
| --- | --- | --- |
| [0001](decisions/0001-agents-run-the-platform.md) | Agents run discovery, curation and operations | Accepted |
| [0002](decisions/0002-autonomy-ladder.md) | Autonomy ladder L0–L3, per agent and per category | Accepted |
| [0003](decisions/0003-outside-signals-and-meta.md) | Outside signals, including Meta, through official routes only | Accepted |
| [0004](decisions/0004-graph-storage-split.md) | Stable definitions in git, volatile facts in Postgres | Proposed |

## Archive

- [Build plan v1, 16 Oct 2026](archive/build-plan-v1-2026-10-16.md)
