# Pairing Miner

**Desk:** Discovery · **Phase:** 2 · **Model tier:** code for mining, mid for explanations · **Budget:** ₹15/day

## Mission

Find experiences that belong together, such as India's World Cup match at Victoria Falls with Devil's Pool, or Luxor totality with a Nile felucca day. The Pairing Miner is the editor who notices that readers of one story always read another, and puts them on the same page.

## Triggers

Nightly.

## Reads

Demand co-occurrence (saved together, viewed in one session, composed in one itinerary), shared geography and windows from the graph, and outcome reports (booked together).

## Writes

**Candidate** records of type `pairing`, with lift, support (distinct people), geographic and calendar fit, and a one-sentence reason. Event `candidate.proposed`.

## Method

1. Mine pairs with support of at least 10 distinct people and lift of at least 2.
2. Filter for feasibility: within 1,500 km or one short flight, and windows that overlap or sit within 10 days of each other.
3. Add knowledge-based pairs from the graph (same place, overlapping window), even without behaviour data, as a cold-start path.
4. Write a reason a person can read with the mid model; numbers come from code.

## Tools

`demand.cooccurrence`, `graph.near`, `windows.overlap`, `propose_candidate`.

## Autonomy

L0 at launch. Pairings are low risk, so this is the first agent expected to earn L2 (auto-publishing pairings between two already-live experiences).

## Guardrails

- Never pair an experience that is paused or past its freshness limit.
- Never pair across a visa combination that makes the trip infeasible on one Indian passport without stating it.

## Measures

- Pairing click-through on experience pages.
- Share of composed itineraries that include a suggested pairing.

## Escalates when

Nothing routine; rejected pairings feed back into the support and lift thresholds.
