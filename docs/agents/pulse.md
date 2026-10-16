# Pulse

**Desk:** Discovery · **Phase:** 1 · **Model tier:** mostly code, small model for query clustering · **Budget:** ₹10/day

## Mission

Turn first-party usage into anonymous demand Signals. Pulse is the newsroom's reader-data desk: it doesn't write stories, it says which stories readers are hungry for.

## Triggers

- Continuous: consumes usage events from the event bus.
- Hourly: rolls raw events into Signal aggregates.
- Nightly: clusters free-text queries (small model) and recomputes Demand counters.

## Reads

Usage events from every channel, tagged by channel (`web`, `mcp:<client>`, `whatsapp`, `email`):

- `search.performed` (query, filters, result count, top score)
- `search.zero_result` (when the top score is under the "good match" threshold)
- `experience.viewed`, `lifelist.saved`, `lifelist.stage_changed`
- `feasibility.checked` (passport, home city, month, budget band, outcome)
- `itinerary.composed`, `handoff.clicked`
- `outcome.reported` (from `report_outcome`, partner postbacks or self-report)
- `experience.requested` (from `request_experience`)

## Writes

- **Signal** records with `source = first_party`: topic or cluster label, filters (passport, city, month, budget band), count of distinct people or sessions, velocity (7-day change compared with the 28-day baseline), example queries (redacted), expiry.
- **Demand** counters per experience, per day, per channel.
- Event `signal.created` or `signal.strengthened`.

## Tools

`events.read`, `signals.upsert`, `demand.increment`, `cluster_queries` (small model, batch), `redact_pii`.

## Autonomy

Writes Signals and Demand directly. Both are internal and never shown to users without the Prospector and Verifier in between. No promotion path is needed.

## Guardrails

- **k-anonymity:** a Signal is visible to other agents only when at least 10 distinct people or sessions are behind it.
- Strip names, phone numbers, emails and passport numbers from example queries before storage.
- Raw events that carry a user ID are kept for 90 days; aggregates are kept indefinitely (DPDP: collect the minimum, log consent).
- Agent traffic counts by session, not by call, so a chatty assistant can't inflate demand.

## Measures

- Zero-result rate (overall and per lane), trended weekly.
- Share of Signals that later back an approved Candidate.
- Eval: a labelled set of 200 queries for cluster quality (purity of at least 0.8).

## Escalates when

- Zero-result rate jumps 50% day on day (likely a search bug, not demand). Goes to the Night Manager.
- A single client produces more than 30% of a day's events (possible scraping or a loop). Goes to the Night Manager.
