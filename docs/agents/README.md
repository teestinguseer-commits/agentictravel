# The agent mesh

Lifelist is run by agents working in a newsroom: reporters on beats around the clock, an assignment desk that reads what the audience wants, fact-checkers, editors and a night-shift manager. You are the editor-in-chief. You set policy, approve what the autonomy ladder still reserves for you, and read one digest a day.

Two principles from v1 still hold:

- **Deterministic tools sit under LLM planners.** Agents decide and explain; code fetches, computes and writes.
- **Every claim cites a graph record.** No free-text facts reach a person or an agent.

## Desks and agents

| Desk | Agent | One-line job | Phase | Launch autonomy |
| --- | --- | --- | --- | --- |
| Discovery | [Pulse](pulse.md) | Turns first-party usage into demand Signals | 1 | Writes Signals only |
| Discovery | [Trend Scout](trend-scout.md) | Turns outside trends (Google, Meta, YouTube, Wikipedia, Reddit) into Signals | 1 | Writes Signals only |
| Discovery | [World-change Scout](world-change-scout.md) | Spots visa, route, fixture and policy changes that shift feasibility (**visa beat live**) | 1 | L0 |
| Discovery | [Lane Scouts](lane-scout.md) | Watch suppliers and official sources per lane | 1 | L1 |
| Discovery | [Prospector](prospector.md) | Turns Signals into Candidate experiences, twins and offers | 2 | L0 |
| Discovery | [Pairing Miner](pairing-miner.md) | Proposes Pairings from co-saves and co-views | 2 | L0 |
| Curation | [Verifier](verifier.md) | Checks every fact before it is shown or booked (**visa rules and event dates live**) | 1 | L1 |
| Curation | [Editor](editor.md) | Writes experience pages, collections, schema.org and llms.txt from verified facts | 1 | L0 for new pages, L1 for refreshes |
| Curation | [Curator](curator.md) | Matches experiences to one person's lifelist and constraints | 2 | Read-only |
| Curation | [Experimenter](experimenter.md) | Exposes new experiences to a small share and decides keep or retire | 2 | L0 for retirements |
| Service | [Orchestrator](orchestrator.md) | Routes live requests to specialists and assembles the answer | 1 | Read-only |
| Service | [Feasibility](feasibility.md) | Visa timeline, leave days, budget, fitness | 1 | Read-only |
| Service | [Composer](composer.md) | Builds itineraries around the anchor | 2 | Read-only |
| Service | [Booker](booker.md) | Hand-off links (Path 1), hold and checkout (Path 3) | 1 / 3 | Human confirms any spend |
| Engagement | [Watcher](watcher.md) | Matches graph events to subscriptions | 2 | Automatic (deterministic) |
| Engagement | [Nudge](nudge.md) | The single gate for every outbound message to people and agents | 2 | Approved templates only |
| Engagement | [Concierge Desk](concierge-desk.md) | Answers inbound WhatsApp and email from the graph; escalates the rest | 1 | Answers from the graph only |
| Operations | [Night Manager](night-manager.md) | Watches health, cost and backlog; writes the 06:30 digest | 1 | May pause agents |
| Operations | [Partner Ops](partner-ops.md) | Link health, affiliate reconciliation, partner demand briefs | 2 | Drafts only |

## The clock

What "around the clock" means in practice. All times are IST; nightly jobs run while Indian users sleep and use batch pricing.

| Cadence | Work |
| --- | --- |
| Continuous (event-driven) | Pulse ingestion, Verifier pre-show checks, Watcher matching, Concierge Desk replies, Orchestrator requests |
| Hourly | World-change Scout feeds; Lane Scouts for anything within 30 days of a window; Night Manager health check |
| Every 6 hours | Trend Scout pulls (YouTube, Wikipedia pageviews, Reddit, news) |
| Nightly 01:00–05:00 | Prospector, Pairing Miner, Verifier sweep of expiring facts, Editor refresh, Experimenter readout, Partner Ops reconciliation and link health |
| Daily 06:30 | Night Manager digest and review queue (at most 20 items) |
| Daily 09:00–21:00 | Nudge send window (respects each person's caps and quiet hours) |
| Weekly, Monday | Instagram hashtag rotation (30 a week), Meta AI prompt pack, Google Trends pull, full golden-set eval, Prospector large-model synthesis |
| Monthly | Partner demand briefs, autonomy promotion review, budget re-allocation |

## Shared rules for every agent

1. **Identity.** Each agent runs under its own service identity with its own scopes. Agents never share credentials.
2. **The airlock.** Agents that read untrusted outside content (Trend Scout, World-change Scout, Lane Scouts, Concierge Desk inbound) can write only through `propose_*` tools with structured fields. Raw outside text never reaches a write-capable agent's instructions; it travels as a quoted data field with its source link.
3. **Proposals carry evidence.** Every proposal includes source links, check time, confidence and a one-sentence reason that a person can read.
4. **Idempotent writes.** Every write carries an idempotency key and lands in the audit log with the agent, run ID and trace ID.
5. **Budgets.** Each agent has a daily model budget and a run budget (see its spec). At 80% by midday it drops to essential runs; at 100% it stops and the Night Manager reports it.
6. **Kill switch.** Any agent can be paused by you or the Night Manager without a deploy. Paused agents leave their queue intact.
7. **Autonomy is per agent, per category.** It is promoted and demoted under [ADR 0002](../decisions/0002-autonomy-ladder.md).
8. **No partner contact, no spend, no new message templates** without you.
9. **Evals.** Every agent has an eval set that runs in CI on any prompt or tool change, and nightly on production samples.

## Model tiers

| Tier | Used for | Agents |
| --- | --- | --- |
| None (code) | Matching, counting, scheduling | Watcher, Pulse aggregation, Experimenter statistics |
| Small | Extraction, classification, dedupe | Lane Scouts, Trend Scout, World-change Scout, Verifier extraction, Concierge Desk triage |
| Mid | Proposals, explanations, messages | Prospector (nightly), Pairing Miner, Editor, Curator, Feasibility, Composer, Nudge, Night Manager, Partner Ops |
| Large | Weekly synthesis only | Prospector (weekly) |

Starting caps assume a ₹15,000 monthly model budget (about ₹500 a day), split as discovery 35%, curation 20%, service 20%, engagement 10%, operations 5% and reserve 10%. Scale every cap in proportion if the budget changes.

| Desk | Daily cap | Per agent (₹/day) |
| --- | --- | --- |
| Discovery | ₹175 | Pulse 10 · Trend Scout 45 · World-change Scout 25 · Lane Scouts 35 · Prospector 45 · Pairing Miner 15 |
| Curation | ₹100 | Verifier 50 · Editor 25 · Curator 15 · Experimenter 10 |
| Service | ₹100 | Orchestrator 30 · Feasibility 20 · Composer 40 · Booker 10 |
| Engagement | ₹50 | Watcher 0 · Nudge 20 · Concierge Desk 30 |
| Operations | ₹25 | Night Manager 15 · Partner Ops 10 |
| Reserve | ₹50 | Released by the Night Manager for spikes, and reported |

## Spec template

Every spec in this folder follows the same shape so coding agents can build from it and you can audit it:

- **Mission:** one sentence, with an analogy.
- **Triggers:** schedule or events.
- **Reads / Writes:** graph records, events and tools.
- **Tools:** deterministic functions it may call.
- **Autonomy:** launch level and what earns promotion.
- **Guardrails:** what it must never do.
- **Budget:** model tier and daily cap.
- **Measures:** metrics and evals.
- **Escalates when:** conditions that go to the review queue or the Night Manager.

See also: [graph](../architecture/graph.md) · [events](../architecture/events.md) · [MCP tools](../architecture/mcp-tools.md)
