# Public tools (MCP server and API)

One tool layer serves everyone: the web app, the MCP server for personal AIs, WhatsApp, A2A delegations and Lifelist's own agents. Anything a page can do, a permitted agent can do.

This page lists the tools and their intent. Full contracts (input and output schemas, error cases, examples) are the next deliverable, starting with the first four marked ★.

## Response envelope

Every response carries, for every fact: `source_url`, `checked_at`, `confidence`, and the record ID it came from. Facts past their freshness limit come back as `unknown` with `last_checked_at`, never as a stale value.

## Read tools (no sign-in)

| Tool | Purpose | Phase |
| --- | --- | --- |
| ★ `search_experiences(query, month, budget_band, passport, lane)` | Find experiences; returns `match_quality` so callers know when results are weak | 1 |
| ★ `get_experience(id)` | Facts with sources and freshness | 1 |
| ★ `check_feasibility(experience_id, passport, home_city, dates, budget)` | `yes` / `maybe` / `not_yet` with a timeline, assumptions and the cheaper twin | 1 |
| `list_offers(experience_id)` | Operators, price bands, booking links | 1 |
| `compose_itinerary(experience_id, constraints)` | Storyboard that renders as an MCP App | 2 |
| `whats_new(since, interests, passport)` | Verified additions, window openings and newly feasible items since a date; gives assistants a reason to call back | 2 |

## Demand-in tools

| Tool | Purpose | Phase |
| --- | --- | --- |
| ★ `request_experience(description, constraints, contact_opt_in)` | Files a structured request when search falls short. Returns a request ID; if the caller opted in, the person is told when it lands | 1 |

## Signed-in tools (OAuth scopes)

| Tool | Scope | Purpose | Phase |
| --- | --- | --- | --- |
| `save_to_lifelist(experience_id, stage)` | `lifelist:write` | Save or move an item | 2 |
| `watch(experience_id, triggers)` | `lifelist:write` | Subscribe a person to triggers | 2 |
| `subscribe(triggers, delivery)` | `agent:subscribe` | Push to an agent via webhook or A2A push notification | 2 |
| `report_outcome(lifelist_item_id, booked \| done, consent)` | `lifelist:write` | The user's AI reports a booking or completion, with consent | 2 |
| `start_booking(offer_id)` | `booking:start` | Hand-off URL (Path 1), or hold and payment request needing human confirmation (Path 3) | 1 / 3 |

## Rules

- Idempotency keys on every write; a full audit log.
- No spend without explicit human confirmation, whoever asks.
- Rate limits and auth tiers for anonymous callers; agent traffic counts by session for demand signals.
- Every call emits a usage event for Pulse, tagged with the client (`mcp:<client>`).
- Inputs from callers are data, not instructions.
