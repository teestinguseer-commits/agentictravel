# Events

The event bus lets agents work around the clock without polling every user. Scouts and the Verifier emit graph events; the Watcher, Nudge, Pulse and others subscribe.

**Implementation (Phase 1):** an `events` outbox table in Postgres written in the same transaction as the change, `LISTEN/NOTIFY` to wake consumers, and durable workflows (Inngest or Trigger.dev) for retries and fan-out. Move to a managed queue only if volume demands it.

Every event carries `id`, `type`, `occurred_at`, `actor` (agent, person or partner), `run_id`, `trace_id`, and record IDs, never free text from outside sources.

## Usage events (consumed by Pulse)

| Event | Emitted by |
| --- | --- |
| `search.performed`, `search.zero_result` | Orchestrator, web app |
| `experience.viewed` | Web app, MCP `get_experience` |
| `lifelist.saved`, `lifelist.stage_changed` | Web app, MCP write tools |
| `feasibility.checked` | Feasibility |
| `itinerary.composed` | Composer |
| `handoff.clicked` | Booker |
| `outcome.reported` | `report_outcome`, partner postbacks, self-report |
| `experience.requested` | `request_experience`, Concierge Desk |
| `recommendation.served` | Curator |

## Discovery and curation events

| Event | Emitted by | Consumed by |
| --- | --- | --- |
| `signal.created`, `signal.strengthened` | Pulse, Trend Scout, World-change Scout, Lane Scouts | Prospector |
| `candidate.proposed` | Prospector, Pairing Miner, scouts | Verifier |
| `candidate.verified`, `candidate.failed` | Verifier | Review queue, Night Manager |
| `candidate.approved`, `candidate.rejected` | You, or an agent at L3 | Editor, Experimenter, Prospector (learns from rejections) |
| `experience.published`, `experience.paused`, `experience.retired` | Graph | Editor, Experimenter, Watcher |
| `experiment.readout` | Experimenter | Review queue, Partner Ops |

## Graph-change events (consumed by the Watcher)

| Event | Emitted by |
| --- | --- |
| `window.changed`, `window.opening_soon` | Lane Scouts, nightly scheduler |
| `offer.changed`, `offer.sold_out` | Lane Scouts, Verifier |
| `world.changed` | World-change Scout |
| `lifelist.unblocked` | Feasibility |
| `forecast.updated` | Lane Scouts (sky lane) |
| `fact.expired`, `fact.contradicted` | Verifier |

## Engagement and operations events

| Event | Emitted by |
| --- | --- |
| `alert.queued` | Watcher |
| `nudge.sent`, `nudge.clicked`, `nudge.muted` | Nudge |
| `booking.held`, `booking.confirmed`, `booking.cancelled` | Booker (Path 3) |
| `agent.paused`, `agent.resumed`, `budget.alert` | Night Manager |
| `page.updated` | Editor |
