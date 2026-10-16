# Experience Graph

The graph is the moat. It is a data-modelling problem before it is an AI problem: get the graph right and the agents stay simple.

This page is a schema outline for coding agents to turn into migrations; field lists are the minimum, not the final design.

## Provenance on every fact

Every factual field (not only every record) carries:

| Field | Meaning |
| --- | --- |
| `source_url` | Where the fact came from |
| `snapshot_id` | Stored copy of the source at check time |
| `checked_at` | When it was last checked |
| `verified_by` | Agent or person |
| `confidence` | `certain`, `high`, `medium`, `low` |
| `freshness_class` | One of the classes below |

## Freshness limits per fact type

A blanket 7-day limit is too strict for eclipse dates and too loose for prices.

| Class | Examples | Limit |
| --- | --- | --- |
| `fixed` | Eclipse date and path, a fixture date once confirmed | Never expires; re-checked monthly |
| `seasonal` | Season months, typical weather | 180 days |
| `rule` | Visa rules, age and fitness limits | 30 days, and on any `world.changed` event |
| `price` | Offer price band | 24 hours for partner APIs; 7 days for manually checked offers |
| `availability` | Permits, sold-out status, ballot status | 24 hours; hourly within 30 days of the window |
| `forecast` | Aurora or weather forecast | 3 hours |

The Verifier withholds any fact past its limit.

## Records from v1

- **Experience:** id, lane, anchor moment, place (geo), season months, fixed dates, scarcity type (`date`, `lottery`, `permit_cap`, `season`), lead time, difficulty, group fit, **safety category**, **rarity score**, **status** (`live`, `paused`, `retired`).
- **Offer:** experience id, operator, price band (INR and source currency), inclusions, booking link or API, commission, last checked, **partner tier**, **accepts Indian travellers**.
- **Constraint:** experience id or country, type (`visa`, `fitness`, `age`, `gear`), passport, consulate, lead time, refusal risk, value.
- **Window:** experience id, start, end, confidence, source; probabilistic windows carry odds.
- **Pairing:** experience a, experience b, reason, distance, window gap, **origin** (`knowledge`, `mined`), lift and support when mined.

## Records added in v2

### Signal

An aggregated demand observation.

| Field | Notes |
| --- | --- |
| `id`, `created_at`, `expires_at` | Default expiry 21 days unless strengthened |
| `source` | `first_party`, `google_trends`, `instagram`, `meta_ai`, `youtube`, `wikipedia`, `reddit`, `news`, `world_change`, `lane_scout`, `concierge` |
| `evidence_strength` | `measured` (API metrics) or `lead` (Meta AI answers, news mentions) |
| `topic` | Normalised label, plus linked experience, place or event IDs where known |
| `filters` | Passport, home city or state, month, budget band, language |
| `metric` | Volume, velocity (7-day vs 28-day baseline), distinct people or sessions |
| `evidence` | Links and record IDs; no copies of outside posts |
| `flags` | `suspect` (single-source spike), `below_k` (fewer than 10 distinct people) |

**Concierge logging in Phase 0** uses the same shape: one row per lookup, with `source = concierge`, the question, the filters and what you had to look up by hand.

### Candidate

A proposed change awaiting verification and approval.

| Field | Notes |
| --- | --- |
| `id`, `type` | `experience`, `twin`, `offer`, `pairing`, `angle`, `constraint_update`, `window_update` |
| `proposed_by` | Agent and run ID |
| `signal_ids` | Must satisfy the two-source rule for `experience` and `twin` |
| `draft` | The record as it would be published |
| `score`, `expected_value`, `reason` | `reason` is one sentence a person can read |
| `status` | `proposed` → `verified` / `failed` → `approved` / `rejected` → `live` → `retired` |
| `decision` | Who decided, when, and the one-line reason on rejection |

### Demand

Per experience, per day, per channel: `views`, `saves`, `feasibility_checks`, `compositions`, `handoff_clicks`, `booked`, `done`, `requests`. Channels: `web`, `mcp:<client>`, `whatsapp`, `email`, `a2a:<agent>`.

## Storage

Stable experience definitions live as reviewed YAML files in git; volatile facts, Signals, Candidates and Demand live in Postgres. See [ADR 0004](../decisions/0004-graph-storage-split.md).
