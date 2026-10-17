# Evals: the golden set

The golden set is 100 travel questions with known answers. It is the exam every Lifelist tool and agent sits, on every change, from the first line of code. Like a driving test route, it is fixed and known in advance, it covers the hard junctions (stale facts, unsafe asks, trick questions), and passing it is the condition for more autonomy ([ADR 0002](decisions/0002-autonomy-ladder.md)).

Files:

- [`evals/golden/golden.yaml`](../evals/golden/golden.yaml): the 100 items
- [`evals/golden.schema.json`](../evals/golden.schema.json): what an item must contain
- [`evals/lib/oracle.mjs`](../evals/lib/oracle.mjs): a reference implementation of `get_experience` and `search_experiences` over the git graph
- [`evals/lib/assert.mjs`](../evals/lib/assert.mjs): the check operators
- [`scripts/check-golden.mjs`](../scripts/check-golden.mjs): runs in CI as part of `npm run check`

## What is in it

| Category | Items | Tests | Graded by |
| --- | --- | --- | --- |
| Fact | 30 | Dates, seasons, countries, scarcity, lanes, budget bands, pairings, safety flags | Checks on `get_experience` |
| Search | 25 | Filters (month, budget, lane, segment, visa effort) and free text | Checks on `search_experiences`; filter-only questions have one exact answer |
| No match | 10 | Things Lifelist doesn't offer (Kumbh Mela, Oktoberfest, Everest base camp) | `match_quality` is none or weak, and a request is offered; three also have a rubric |
| Feasibility | 15 | Visa lead times, windows, budget, age, fitness, cold, ballots | Checks on `check_feasibility` verdicts and reason codes |
| Safety | 10 | Open water, altitude, heat, cold, medical questions, children | A rubric for the answer, plus checks on the facts it relies on |
| Freshness | 5 | Prices, availability and forecasts that go stale | A rubric: dated or unknown, never invented |
| Adversarial | 5 | Commission ranking, spend without confirmation, injected "SYSTEM" text, other users' data | A rubric |

Each item names the tool a good agent should call, deterministic `checks` on that tool's output, a reference `answer`, and a `rubric` where judgement is needed.

## How checks work

A check is `{ path, op, value }`, evaluated on the tool's output after `normalize()`: every Fact `{ value, provenance }` becomes its value, and every unknown fact becomes `null`. Paths are dotted, and `name[]` maps over an array, so `windows[].starts_on` means every window's start date.

| Op | Passes when |
| --- | --- |
| `equals` | The value matches exactly |
| `one_of` | The value is one of the listed values |
| `includes` | The array contains the value (or all listed values) |
| `excludes` | The array contains none of them |
| `set_equals` | The array has exactly these members, in any order |
| `length_gte` | The array has at least this many items |
| `exists` | The value is present (`true`) or absent (`false`) |

## What runs today

There are no tools yet, so `check-golden.mjs` does four things on every push:

1. Validates every item against the schema, and confirms there are exactly 100 with unique ids.
2. Validates every tool call's arguments against that tool's contract, so the questions are askable.
3. Runs every item the oracle can answer (65 today) against the graph and requires them to pass. If someone edits a YAML file in a way that changes a known answer, CI fails and names the question. Either the edit is wrong, or the item needs updating and re-review.
4. Counts the rest: feasibility items waiting for the tool, items waiting for data (`requires_data`, such as per-country visa rules or Son Doong's age limit), and judge-graded items.

## In Phase 1

- `golden:run` will call the real MCP tools with each item's arguments and apply the same checks. The oracle and the tools must agree, so the oracle doubles as an executable spec for the first implementation.
- **Fact accuracy** (the plan's metric, target at least 98%) is the share of passing checks across fact, search, no-match and feasibility items.
- **Rubric items** are graded by an LLM judge. Calibrate it first: grade 20 items yourself and keep the judge only if it agrees with you on at least 18 (learning rotation R2).
- Each agent's own eval set (named in its spec) grows from this file. The golden set stays the shared floor.

## Your review

Every item starts as `review: pending`. The truth came from the Atlas, the v1 plan and well-known calendar rules, not yet from primary sources. Before Gate B:

1. Check each item's answer against a primary source (organiser, official ticketing, permit authority, embassy).
2. Set `review: verified`, `reviewed_by` and `reviewed_on`, or `review: disputed` with a fix.
3. Items that need special care: **G074** (gorilla permit minimum age, written as "typically 15"), **G066 and G100** (Son Doong's 18–70 rule, from v1), **G063** (the Haj Committee route), and every date for 2027 events, since organisers can move them.

Add questions from your interviews and concierge trips as you go. If the set grows past 100, change `EXPECTED_COUNT` in `scripts/check-golden.mjs`.
