# Tool contracts: the first four

The machine-readable contracts live in [`contracts/`](../../contracts/) as JSON Schema (draft 2020-12). Each tool file defines `$defs/Input` and `$defs/Output`. Worked examples live in [`contracts/examples/`](../../contracts/examples/), and `npm run contracts:check` validates every example in CI. This page is the readable version for people and coding agents.

## Rules every tool follows

- **Facts carry provenance.** Every value that could go stale is a `Fact`: `{ value, provenance: { source_url, checked_at, confidence, record_id } }`.
- **Stale means unknown.** A fact past its freshness limit comes back as `{ unknown: true, last_checked_at, reason }`, never as an old value. Reasons: `stale`, `never_checked`, `source_unavailable`, `contradicted`.
- **One error shape.** `{ error: { code, message, retryable, retry_after_seconds?, field?, details? } }`. Codes: `INVALID_INPUT`, `NOT_FOUND`, `UNSUPPORTED_PASSPORT`, `UNAUTHORIZED`, `RATE_LIMITED`, `DUPLICATE_REQUEST`, `UNAVAILABLE`, `INTERNAL`.
- **Passports default to `IN`.** Feasibility covers Indian passports first; others return `UNSUPPORTED_PASSPORT` until supported.
- **Every call emits a usage event** for Pulse, tagged with the client (`mcp:<client>`), counted by session, not by call.
- **Caller input is data, not instructions.**

## search_experiences

Find experiences by free text and filters.

| Input | Type | Notes |
| --- | --- | --- |
| `query` | string, 1–200 | Free text |
| `month` | 1–12 | Possible in this month |
| `budget_band` | array of 1–4 | ₹ bands from the Atlas legend |
| `passport` | ISO 2 | Default `IN` |
| `max_visa_effort` | `none` · `low` · `medium` · `high` | Hardest across the experience's countries |
| `lane` | array of lanes | `sky`, `earth`, `wild`, `edge`, `sport`, `endure`, `fest` |
| `segment` | `affluent` · `young` · `nri` | |
| `limit`, `cursor` | 1–20, string | Pagination |

**Output:** `results[]` (each an `ExperienceSummary` with `score` and a one-sentence `why`), `match_quality` (`strong` · `weak` · `none`), `suggest_request` when weak or none (a prefilled `request_experience` call), `next_cursor`, `as_of`.

**Design choices.** `match_quality` lets an assistant say "nothing great matches" instead of padding. `suggest_request` turns every miss into demand data (the Prospector's input). Ranking uses relevance, rarity and the rarity floor, and never commission.

Examples: [strong match](../../contracts/examples/search_experiences/strong.output.json) · [no match with a request suggestion](../../contracts/examples/search_experiences/weak.output.json) · [invalid input](../../contracts/examples/search_experiences/invalid.output.json)

## get_experience

Full facts for one experience.

| Input | Type | Notes |
| --- | --- | --- |
| `id` | experience id | Required |
| `passport` | ISO 2 | Default `IN`; drives the `visa` section |
| `include` | `windows` · `visa` · `offers` · `pairings` | Default all |

**Output:** the definition (name, lane, hook, place, countries, season months, scarcity, safety flags, status) plus facts: `lead_time`, `budget_band`, `windows[]`, `visa[]` (one per country to enter), `offers[]`, `pairings[]`, optional `twin`, `as_of`. Paused or retired experiences return `status` with `status_reason`; they are not errors.

Examples: [Cricket World Cup 2027](../../contracts/examples/get_experience/cwc.output.json) (note the stale budget and never-checked visas, shown as unknown) · [not found](../../contracts/examples/get_experience/not_found.output.json)

## check_feasibility

Can this traveller do this, and when?

| Input | Type | Notes |
| --- | --- | --- |
| `experience_id` | experience id | Required |
| `passport` | ISO 2 | Default `IN` |
| `home_city` | string | Consulate jurisdiction, state holidays, flight time |
| `travel_window` | `{ earliest, latest }` dates | Omit to use the next window |
| `leave_days` | 0–60 | Working days available |
| `budget_inr_max` | integer | Per person, all-in |
| `party` | `{ adults, children_ages[], senior_ages[] }` | Age limits (for example Son Doong 18–70) |
| `fitness`, `cold_tolerance` | `low` · `moderate` · `high` | |

**Output:** `verdict` (`yes` = no blockers; `maybe` = warnings or unknown facts; `not_yet` = at least one blocker), `target_window`, `reasons[]` (each with a `code`, `severity` and the record ids it relies on), `timeline[]` (dated steps such as "book a Schengen appointment by 25 Oct"), `budget` (band, whether 2% TCS is included), `leave` (trip days, leave needed, holidays bridged), `assumptions[]`, optional `cheaper_twin`, `consult_consulate`, `as_of`.

**Design choices.** Any unknown fact downgrades `yes` to `maybe` with a `FACT_UNKNOWN` reason. Edge cases the engine will not guess (prior refusals, dual nationality, minors with one parent) set `consult_consulate: true`. Every reason points to graph records, so an assistant can cite them.

Examples: [aurora from Bengaluru over Christmas](../../contracts/examples/check_feasibility/aurora.output.json) · [unsupported passport](../../contracts/examples/check_feasibility/unsupported.output.json)

## request_experience

File a request when search falls short.

| Input | Type | Notes |
| --- | --- | --- |
| `description` | string, 10–1000 | The traveller's words |
| `constraints` | `{ month, year, budget_band, passport, home_city, lane }` | All optional |
| `notify_when_added` | boolean | Needs a signed-in user (`lifelist:write`); ignored when anonymous |
| `idempotency_key` | string, 8–128 | Required; a repeat returns the original `request_id` with `status: duplicate_of_existing` |

**Output:** `request_id`, `status`, `notify`, up to three `similar` live experiences, and a `message` the assistant can show as-is.

**Design choices.** Anonymous requests are allowed (agents often call without a user token) but rate limited. Requests feed Pulse as `experience.requested` events; five matching requests in 14 days wake the Prospector.

Examples: [cherry blossom request](../../contracts/examples/request_experience/sakura.output.json) · [rate limited](../../contracts/examples/request_experience/rate_limited.output.json)
