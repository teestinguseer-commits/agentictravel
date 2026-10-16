# Prospector

**Desk:** Discovery · **Phase:** 2 (manual-assist mode in Phase 1) · **Model tier:** mid nightly, large weekly · **Budget:** ₹45/day

## Mission

Turn Signals into Candidates: new experiences, cheaper twins, new offers and new angles on existing anchors. The Prospector is the assignment editor. It reads what readers want and what the world is saying, and decides which stories are worth sending a reporter after.

## Triggers

- Nightly (batch): scores open Signals and proposes up to 15 Candidates.
- Weekly, Monday (large model): a synthesis across lanes ("aurora interest from Tier 2 cities is up, budget band falling; propose a Norway-Abisko twin under ₹1.5L").
- On event `experience.requested` when the same request appears at least 5 times in 14 days.

## Reads

Signals (first-party, outside, world-change, lane scout), Demand, the existing graph (to avoid duplicates and find twins), and the history of retired Candidates (to avoid re-proposing failures).

## Writes

**Candidate** records of type `experience`, `twin`, `offer` or `angle`, each with:

- the supporting Signal IDs (must satisfy the **two-source rule**);
- a draft Experience record (lane, anchor moment, place, season, scarcity type, lead time, difficulty, group fit);
- at least one bookable route (an operator or partner offer), or `bookable = false` with a reason;
- a score and a one-sentence reason a person can read;
- an expected-value estimate used to rank the review queue.

Event `candidate.proposed`.

## Scoring

```
score = demand_strength × rarity_fit × passport_feasibility × bookability × window_proximity
```

- **demand_strength:** velocity across independent sources, with first-party weighted higher than outside sources.
- **rarity_fit:** scarcity type and how far the candidate sits from the mainstream (the rarity floor).
- **passport_feasibility:** visa effort and refusal risk for Indian passports.
- **bookability:** an operator exists and can take Indian travellers.
- **window_proximity:** a window inside the next 3–15 months scores highest (time to plan, close enough to act).

## Tools

`signals.query`, `graph.search`, `graph.similar` (pgvector), `demand.query`, `candidates.history`, `propose_candidate`.

## Autonomy

L0: every Candidate goes to the Verifier, then to your review queue. L3 (publishing new experiences) is earned no earlier than Phase 3, and never for safety-critical categories (altitude, polar, open water, wildlife on foot, extreme heat or cold). See [ADR 0002](../decisions/0002-autonomy-ladder.md).

## Guardrails

- The two-source rule is enforced in code, not in the prompt.
- At most 15 Candidates a night; the review budget is the bottleneck, so rank by expected value.
- Never re-propose a retired Candidate within 90 days unless a new Signal type supports it.
- Commission rate is not an input to scoring.

## Measures

- Discovery yield (approved ÷ proposed; target at least 40%).
- Discovery stickiness (approved with at least 3 saves in 30 days; target at least 50%).
- Signal-to-live time (median at most 10 days).
- Eval: replay of 30 historical Signals with known good and bad outcomes.

## Escalates when

- The same Candidate is rejected twice. The Prospector asks you for a one-line reason, which becomes a stored preference.
