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

## Implementation (live: visa rules and event dates)

| Part | Where |
| --- | --- |
| The agent | `agents/verifier/verifier.ts` (logic) and `run.ts` (command line) |
| Schedule | `.github/workflows/verifier.yml`, nightly at 04:00 IST (after the World-change Scout) and on demand |
| What it writes | Visa rules in `graph/visa/IN.yaml` (confidence, evidence, sources) and `verified_facts` on experiences for fixed dates |

Each run, within a budget of model-backed checks (default 10):

1. **Freshness report:** visa rules within a week of their 30-day limit, or past it.
2. **Visa rules at low confidence,** the most-used first. Fetch each official source, ask the model whether the page confirms the rule, and keep the answer only if its quote is on the page. Confirmed rules are proposed at **medium**, with the evidence attached. A different rule on the page becomes a proposed correction, still at low confidence and with an open question. A rule with no source on file gets a web search for an official one (government, embassy, immigration or e-visa hosts only; aggregators are blocked).
3. **Fixed event dates:** search for the organiser's or an official page, fetch it independently, and require the quote to be on the page and to state the date. A match becomes a `verified_facts` entry at medium confidence. A different date is flagged for a person.

The workflow regenerates the seed, runs every check and opens one pull request with the report. **Merging accepts the proposals at medium confidence, which production shows to travellers** ([ADR 0005](../decisions/0005-unverified-seeds.md)), so open the evidence links before merging. Without `ANTHROPIC_API_KEY`, only the freshness report runs.

What it does not do yet: experience facts other than fixed dates (seasons, budget bands), offers, and the pre-show and pre-book checks, which arrive with the Postgres store.

## Escalates when

- Two sources contradict on a date, price band or visa rule.
- Golden-set accuracy drops below 98% on any run. The Night Manager freezes the affected agent's autonomy.
