# Verifier

**Desk:** Curation · **Phase:** 1 · **Model tier:** code first, small model for extraction · **Budget:** ₹50/day

## Mission

Nothing reaches a person or an agent until it has been checked against its source and is within its freshness limit. The Verifier is the fact-check desk, and it can spike any story.

## Triggers

- **Pre-show (synchronous):** any fact about to be returned by a tool or rendered on a page whose freshness limit has expired is re-checked or withheld.
- **Pre-book (synchronous):** price, availability and sold-out status for any offer passed to the Booker.
- **Nightly sweep:** every fact expiring in the next 48 hours.
- **On event:** `candidate.proposed`, and proposals from scouts.

## Reads

Graph facts with their source, check time and freshness class; source snapshots; partner APIs; allow-listed official pages.

## Writes

- `verified_at`, `verifier`, `confidence` on facts.
- Candidate status `verified` or `failed` with a reason.
- Event `fact.expired`, `fact.contradicted`, `candidate.verified`.

## Checks for a Candidate

1. Every factual field cites at least one source; dates and prices cite an official or partner source.
2. The two-source rule holds for the demand claim.
3. The bookable route resolves (link returns 200, offer exists, Indian travellers accepted).
4. Constraints are complete: visa by Indian passport, age and fitness limits, season.
5. No duplicate of a live experience (similarity below threshold, or an explicit twin link).
6. Safety category assigned; safety-critical categories are flagged for human approval at every level.

## Tools

`fetch_source`, `partner_api.*`, `snapshot.compare`, `extract_fact` (small model), `link.check`, `graph.similar`, `facts.mark_verified`, `candidates.set_status`.

## Autonomy

L1 at launch: refreshes an existing fact when the source confirms it within tolerance. It can always **withhold** a fact (hiding is safer than showing). It never publishes a new experience on its own.

## Guardrails

- Block any fact past its freshness limit; return "unknown, last checked X" rather than a stale value.
- Contradictions between sources are never resolved by the model; they go to the review queue with both snapshots.

## Measures

- Freshness share (target at least 95% within limits).
- Golden-set fact accuracy (target at least 98%).
- Share of pre-show checks that withheld a fact.

## Escalates when

- Two sources contradict on a date, price band or visa rule.
- Golden-set accuracy drops below 98% on any run. The Night Manager freezes the affected agent's autonomy.
